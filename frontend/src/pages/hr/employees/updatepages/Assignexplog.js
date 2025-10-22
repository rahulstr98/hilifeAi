import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Box, Button, Dialog, DialogActions, DialogContent, Grid, IconButton, List, ListItem, ListItemText, MenuItem, Paper, Popover, Select, Table, TableBody, TableContainer, TableHead, TextField, Typography } from "@mui/material";
import Switch from "@mui/material/Switch";
import axios from "axios";
import domtoimage from "dom-to-image";
import * as FileSaver from "file-saver";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment-timezone";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import { useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";
import AggregatedSearchBar from "../../../../components/AggregatedSearchBar";
import AggridTable from "../../../../components/AggridTable";
import AlertDialog from "../../../../components/Alert";
import { handleApiError } from "../../../../components/Errorhandling";
import Headtitle from "../../../../components/Headtitle";
import MessageAlert from "../../../../components/MessageAlert";
import { StyledTableCell, StyledTableRow } from "../../../../components/Table";
import { AuthContext, UserRoleAccessContext } from "../../../../context/Appcontext";
import { userStyle } from "../../../../pageStyle";
import { SERVICE } from "../../../../services/Baseservice";
function AssignexpLog() {
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);

  const [overallItems, setOverallItems] = useState([]);
  const [isHandleChange, setIsHandleChange] = useState(false);
  const [searchedString, setSearchedString] = useState("");
  const [loader, setLoader] = useState(true);
  const gridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [monthSets, setMonthsets] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [logDatas, setLogDatas] = useState([]);
  const { isUserRoleCompare, buttonStyles } = useContext(UserRoleAccessContext);
  const [copiedData, setCopiedData] = useState("");

  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState("");
  const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
  const handleClickOpenPopupMalert = () => {
    setOpenPopupMalert(true);
  };
  const handleClosePopupMalert = () => {
    setOpenPopupMalert(false);
  };
  const [openPopup, setOpenPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [popupSeverity, setPopupSeverity] = useState("");
  const handleClickOpenPopup = () => {
    setOpenPopup(true);
  };
  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  const navigate = useNavigate();

  const gridRefTableImg = useRef(null);
  // image
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage
        .toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, "Assign Experience Log.png");
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // This is required for Chrome support
  };


  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, []);

  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
  };

  //get all employees list details
  const fetchDepartmentMonthsets = async () => {
    try {
      let res_employee = await axios.get(SERVICE.DEPMONTHSET_ALL, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setMonthsets(res_employee?.data?.departmentdetails);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const id = useParams().id;

  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { auth } = useContext(AuthContext);

  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };




  // Manage Columns
  const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenManageColumns = (event) => {
    setAnchorEl(event.currentTarget);
    setManageColumnsOpen(true);
  };
  const handleCloseManageColumns = () => {
    setManageColumnsOpen(false);
    setSearchQueryManage("");
  };

  const open = Boolean(anchorEl);
  const idval = open ? "simple-popover" : undefined;

  const getRowClassName = (params) => {
    if (selectedRows.includes(params.row.id)) {
      return "custom-id-row"; // This is the custom class for rows with item.tat === 'ago'
    }
    return ""; // Return an empty string for other rows
  };

  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    companyname: true,
    doj: true,
    department: true,
    empcode: true,
    company: true,
    branch: true,
    unit: true,
    team: true,
    expval: true,
    expmode: true,
    expdate: true,
    experience: true,
    prodexp: true,
    modeexp: true,
    targetexp: true,
    endexp: true,
    endexpdate: true,
    endtar: true,
    updatedmonthyear: true,
    endtardate: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  //get all category.
  const fetchAllCategory = async () => {
    try {
      let res_module = await axios.get(`${SERVICE.USER_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let autoonly = res_module?.data?.suser.assignExpLog.filter((item) => item.expmode != "Auto" && item.expmode != "Manual");
      if (autoonly && autoonly.length > 0) {
        let values = autoonly.map((item) => ({
          ...item,
          username: res_module?.data?.suser.companyname,
          doj: res_module?.data?.suser.doj,
          department: res_module?.data?.suser.department,
          empcode: res_module?.data?.suser.empcode,
          company: res_module?.data?.suser.company,
          branch: res_module?.data?.suser.branch,
          unit: res_module?.data?.suser.unit,
          team: res_module?.data?.suser.team,
        }));

        // // Extract the last item of each group
        // const lastItemsForEachMonth = Object.values(groupedByMonth);
        const groupedByMonth = {};

        // Group items by month
        values.forEach((item) => {
          const monthYear = item.updatedate.split("-").slice(0, 2).join("-");
          if (!groupedByMonth[monthYear]) {
            groupedByMonth[monthYear] = [];
          }
          groupedByMonth[monthYear].push(item);
        });

        // Extract the last item of each group
        const lastItemsForEachMonth = Object.values(groupedByMonth).map((group) => group[group.length - 1]);

        const itemsWithSerialNumber = lastItemsForEachMonth?.map((item, index) => {
          let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

          let findyear = item.updatedate.split("-");
          const monthnumber = findyear[1];
          const month = months[Number(monthnumber - 1)];
          // const month = months[Number(monthnumber - 1)];
          const year = findyear[0];

          // let filteredMonthsets = monthSets.filter(
          //   (d) =>
          //     d.year == year &&
          //     d.monthname == month &&
          //     d.department === item.department
          // );
          console.log(monthnumber, "monthnumber");
          let thatTimeMonStartDate = year + "-" + monthnumber + "-01";

          let findexp = monthSets.find((d) => {
            return d.year == year && d.monthname == month && d.department === item.department;
          });

          let findDate = findexp ? findexp.fromdate : thatTimeMonStartDate;
          const calculateMonthsBetweenDates = (startDate, endDate) => {
            if (startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);

              let years = end.getFullYear() - start.getFullYear();
              let months = end.getMonth() - start.getMonth();
              let days = end.getDate() - start.getDate();

              months += years * 12;

              if (days < 0) {
                months -= 1;
                days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
              }

              if (days >= 15) {
                months += 1;
              }
              // console.log(months, "months");
              months = months < 0 ? 0 : months;
              return months;
            }
            return 0;
          };
          console.log(item, item.doj, findDate, calculateMonthsBetweenDates(item.doj, findDate), "item");
          // Calculate difference in months between findDate and item.doj
          let differenceInMonths, differenceInMonthsexp, differenceInMonthstar;
          if (item) {
            //findexp end difference yes/no
            if (item.endexp === "Yes") {
              differenceInMonthsexp = calculateMonthsBetweenDates(item.doj, item.endexpdate);
              //  Math.floor((new Date(item.endexpdate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
              if (item.expmode === "Add") {
                differenceInMonthsexp += parseInt(item.expval);
              } else if (item.expmode === "Minus") {
                differenceInMonthsexp -= parseInt(item.expval);
              } else if (item.expmode === "Fix") {
                differenceInMonthsexp = parseInt(item.expval);
              }
            } else {
              differenceInMonthsexp = calculateMonthsBetweenDates(item.doj, findDate);
              // Math.floor((new Date(findDate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
              if (item.expmode === "Add") {
                differenceInMonthsexp += parseInt(item.expval);
              } else if (item.expmode === "Minus") {
                differenceInMonthsexp -= parseInt(item.expval);
              } else if (item.expmode === "Fix") {
                differenceInMonthsexp = parseInt(item.expval);
              } else {
                // differenceInMonths = parseInt(item.expval);
                differenceInMonthsexp = calculateMonthsBetweenDates(item.doj, findDate);
              }
            }

            //findtar end difference yes/no
            if (item.endtar === "Yes") {
              differenceInMonthstar = calculateMonthsBetweenDates(item.doj, item.endtardate);
              //  Math.floor((new Date(item.endtardate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
              if (item.expmode === "Add") {
                differenceInMonthstar += parseInt(item.expval);
              } else if (item.expmode === "Minus") {
                differenceInMonthstar -= parseInt(item.expval);
              } else if (item.expmode === "Fix") {
                differenceInMonthstar = parseInt(item.expval);
              }
            } else {
              differenceInMonthstar = calculateMonthsBetweenDates(item.doj, findDate);
              if (item.expmode === "Add") {
                differenceInMonthstar += parseInt(item.expval);
              } else if (item.expmode === "Minus") {
                differenceInMonthstar -= parseInt(item.expval);
              } else if (item.expmode === "Fix") {
                differenceInMonthstar = parseInt(item.expval);
              } else {
                // differenceInMonths = parseInt(item.expval);
                differenceInMonthstar = calculateMonthsBetweenDates(item.doj, findDate);
              }
            }

            differenceInMonths = calculateMonthsBetweenDates(item.doj, findDate);
            if (item.expmode === "Add") {
              differenceInMonths += parseInt(item.expval);
            } else if (item.expmode === "Minus") {
              differenceInMonths -= parseInt(item.expval);
            } else if (item.expmode === "Fix") {
              differenceInMonths = parseInt(item.expval);
            } else {
              // differenceInMonths = parseInt(item.expval);
              differenceInMonths = calculateMonthsBetweenDates(item.doj, findDate);
            }
          } else {
            differenceInMonthsexp = calculateMonthsBetweenDates(item.doj, findDate);
            differenceInMonthstar = calculateMonthsBetweenDates(item.doj, findDate);
            differenceInMonths = calculateMonthsBetweenDates(item.doj, findDate);
          }

          return {
            ...item,
            serialNumber: index + 1,
            companyname: item.username,
            department: item.department,
            empcode: item.empcode,
            company: item.company,
            branch: item.branch,
            unit: item.unit,
            team: item.team,
            doj: item.doj ? moment(item.doj)?.format("DD-MM-YYYY") : "",
            experience: calculateMonthsBetweenDates(item.doj, findDate),

            endtar: item.endtar,
            endtardate: item.endtardate ? moment(item.endtardate)?.format("DD-MM-YYYY") : "",
            targetexp: item.doj ? differenceInMonthstar : "",

            endexp: item.endexp,
            endexpdate: item.endexpdate ? moment(item.endexpdate)?.format("DD-MM-YYYY") : "",
            prodexp: item.doj ? differenceInMonthsexp : "",

            expmode: item.expmode,
            expval: item.expval,
            modeexp: item.doj ? differenceInMonths : "",

            updatedmonthyear: item.updatedate ? moment(item.updatedate)?.format("DD-MM-YYYY") : "",
          };
        });

        setLogDatas(itemsWithSerialNumber);
        setLoader(false);
      } else {
        setLogDatas([]);
        setLoader(false);
      }
    } catch (err) {
      setLoader(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //------------------------------------------------------

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };

  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };

  const [fileFormat, setFormat] = useState("xl");
  const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = fileFormat === "xl" ? ".xlsx" : ".csv";

  const exportToExcel = (excelData, fileName) => {
    try {
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      // Check if the browser supports Blob and FileSaver
      if (!Blob || !FileSaver) {
        console.error("Blob or FileSaver not supported");
        return;
      }

      const data = new Blob([excelBuffer], { type: fileType });

      // Check if FileSaver.saveAs is available
      if (!FileSaver.saveAs) {
        console.error("FileSaver.saveAs is not available");
        return;
      }

      FileSaver.saveAs(data, fileName + fileExtension);
    } catch (error) {
      console.error("Error exporting to Excel", error);
    }
  };

  const formatData = (data) => {
    return data.map((item, index) => {
      return {
        Sno: index + 1,
        Company: item.company || "",
        Branch: item.branch || "",
        Unit: item.unit || "",
        Team: item.team || "",
        Empcode: item.empcode || "",
        "Employee Name": item.companyname || "",
        DOJ: item.doj ? moment(item.doj, "YYYY-MM-DD").format("DD-MM-YYYY") : "",
        "Actual Exp": item.experience || "",
        "Pro Mode": item.expmode || "",
        "Pro Value": item.expval || "",
        "Mode Exp": item.modeexp || "",
        "End Exp": item.endexp || "",
        "End Exp Date": item.endexpdate ? moment(item.endexpdate, "YYYY-MM-DD").format("DD-MM-YYYY") : "",
        "Production Exp": item.prodexp || "",
        "End Target": item.endtar || "",
        "End Target Date": item.endtardate ? moment(item.endtardate, "YYYY-MM-DD").format("DD-MM-YYYY") : "",

        "Target Exp": item.targetexp || "",
        "Last Updated": item.updatedmonthyear,
      };
    });
  };

  const handleExportXL = (isfilter) => {
    const dataToExport = isfilter === "filtered" ? rowDataTable : logDatas;

    if (!dataToExport || dataToExport.length === 0) {
      console.error("No data available to export");
      return;
    }

    exportToExcel(formatData(dataToExport), "Assign Experience Log");
    setIsFilterOpen(false);
  };

  //  PDF
  const columns = [
    { title: "Company", dataKey: "company" },
    { title: "Branch", dataKey: "branch" },
    { title: "Unit", dataKey: "unit" },
    { title: "Team", dataKey: "team" },
    { title: "Emp Code", dataKey: "empcode" },
    { title: "Name", dataKey: "companyname" },
    { title: "DOJ", dataKey: "doj" },
    { title: "Actual Exp", dataKey: "experience" },
    { title: "Mode", dataKey: "expmode" },
    { title: "Value", dataKey: "expval" },
    { title: "Mode Exp", dataKey: "modeexp" },

    { title: "End Exp", dataKey: "endexp" },
    { title: "End-Exp Date", dataKey: "endexpdate" },
    { title: "Prod Exp", dataKey: "prodexp" },

    { title: "End Tar", dataKey: "endtar" },
    { title: "End-Tar Date", dataKey: "endtardate" },
    { title: "Target Exp", dataKey: "targetexp" },
    { title: "Last Updated", dataKey: "updatedmonthyear" },
  ];

  const downloadPdf = (isfilter) => {
    const doc = new jsPDF();

    // Initialize serial number counter
    // Modify columns to include serial number column
    const columnsWithSerial = [
      { title: "S.No", dataKey: "serialNumber" }, // Serial number column
      ...columns.map((col) => ({ title: col.title, dataKey: col.dataKey })),
    ];

    // Modify row data to include serial number
    const dataWithSerial =
      isfilter === "filtered"
        ? rowDataTable.map((t, index) => ({
          serialNumber: index + 1,
          companyname: t.companyname,

          department: t.department,
          empcode: t.empcode,
          company: t.company,
          branch: t.branch,
          unit: t.unit,
          team: t.team,
          doj: t.doj,
          experience: t.experience,

          endtar: t.endtar,
          endtardate: t.endtardate,
          targetexp: t.targetexp,

          endexp: t.endexp,
          endexpdate: t.endexpdate,
          prodexp: t.prodexp,

          expmode: t.expmode,
          expval: t.expval,
          modeexp: t.modeexp,

          updatedmonthyear: t.updatedmonthyear,
        }))
        : logDatas?.map((item, index) => ({
          serialNumber: index + 1,
          companyname: item.companyname,

          department: item.department,
          empcode: item.empcode,
          company: item.company,
          branch: item.branch,
          unit: item.unit,
          team: item.team,
          doj: item.doj,
          experience: item.experience,

          endtar: item.endtar,
          endtardate: item.endtardate,
          targetexp: item.targetexp,

          endexp: item.endexp,
          endexpdate: item.endexpdate,
          prodexp: item.prodexp,

          expmode: item.expmode,
          expval: item.expval,
          modeexp: item.modeexp,

          updatedmonthyear: item.updatedmonthyear,
        }));

    // Generate PDF
    doc.autoTable({
      theme: "grid",
      columns: columnsWithSerial,
      body: dataWithSerial,
      styles: { fontSize: 5 },
    });

    doc.save("Assign Experience Log.pdf");
  };

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Assign Experience Log",
    pageStyle: "print",
  });

  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchAllCategory();
  }, []);

  useEffect(() => {
    fetchDepartmentMonthsets();
  }, []);

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, []);

  const addSerialNumber = (datas) => {


    setItems(datas);
    setOverallItems(datas);
  };

  useEffect(() => {
    addSerialNumber(logDatas);
  }, [logDatas]);

  //Datatable
  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSelectedRows([]);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setSelectedRows([]);
    setPage(1);
  };

  //datatable....
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  // Split the search query into individual terms
  const searchTerms = searchQuery.toLowerCase().split(" ");

  // Modify the filtering logic to check each term
  const filteredDatas = items?.filter((item) => {
    return searchTerms.every((term) => Object.values(item).join(" ").toLowerCase().includes(term));
  });

  const filteredData = filteredDatas.slice((page - 1) * pageSize, page * pageSize);

  const totalPages = Math.ceil(filteredDatas.length / pageSize);

  const visiblePages = Math.min(totalPages, 3);

  const firstVisiblePage = Math.max(1, page - 1);
  const lastVisiblePage = Math.min(Math.abs(firstVisiblePage + visiblePages - 1), totalPages);

  const pageNumbers = [];

  const indexOfLastItem = page * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;

  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }

  const columnDataTable = [
    {
      field: "serialNumber",
      headerName: "SNo",
      flex: 0,
      width: 100,
      hide: !columnVisibility.serialNumber,
      headerClassName: "bold-header",
      pinned: "left",
    },
    {
      field: "company",
      headerName: "Company",
      flex: 0,
      width: 150,
      hide: !columnVisibility.company,
      pinned: "left",
    },
    {
      field: "branch",
      headerName: "Branch",
      flex: 0,
      width: 200,
      hide: !columnVisibility.branch,
      pinned: "left",
    },
    {
      field: "unit",
      headerName: "Unit",
      flex: 0,
      width: 200,
      hide: !columnVisibility.unit,
    },
    {
      field: "team",
      headerName: "Team",
      flex: 0,
      width: 200,
      hide: !columnVisibility.team,
    },
    {
      field: "empcode",
      headerName: "Emp code",
      flex: 0,
      width: 200,
      hide: !columnVisibility.empcode,
    },
    {
      field: "companyname",
      headerName: "Name",
      flex: 0,
      width: 250,
      hide: !columnVisibility.companyname,
    },
    {
      field: "doj",
      headerName: "DOJ",
      flex: 0,
      width: 200,
      hide: !columnVisibility.doj,
    },

    {
      field: "experience",
      headerName: "Actual Exp",
      flex: 0,
      width: 200,
      hide: !columnVisibility.experience,
    },

    {
      field: "expmode",
      headerName: "Pro Mode",
      flex: 0,
      width: 200,
      hide: !columnVisibility.expmode,
    },
    {
      field: "expval",
      headerName: "Pro Value",
      flex: 0,
      width: 200,
      hide: !columnVisibility.expval,
    },
    {
      field: "modeexp",
      headerName: "Mode Exp",
      flex: 0,
      width: 200,
      hide: !columnVisibility.modeexp,
    },

    {
      field: "endexp",
      headerName: "End Exp",
      flex: 0,
      width: 200,
      hide: !columnVisibility.endexp,
    },
    {
      field: "endexpdate",
      headerName: "End-Exp Date",
      flex: 0,
      width: 200,
      hide: !columnVisibility.endexpdate,
    },
    {
      field: "prodexp",
      headerName: "Prod Exp",
      flex: 0,
      width: 200,
      hide: !columnVisibility.prodexp,
    },

    {
      field: "endtar",
      headerName: "End Tar",
      flex: 0,
      width: 200,
      hide: !columnVisibility.endtar,
    },
    {
      field: "endtardate",
      headerName: "End-Tar Date",
      flex: 0,
      width: 200,
      hide: !columnVisibility.endtardate,
    },
    {
      field: "targetexp",
      headerName: "Target Exp",
      flex: 0,
      width: 200,
      hide: !columnVisibility.targetexp,
    },

    {
      field: "updatedmonthyear",
      headerName: "Last Updated",
      flex: 0,
      width: 200,
      hide: !columnVisibility.updatedmonthyear,
    },
  ];

  const rowDataTable = filteredData.map((item, index) => {
    return {
      ...item,

      id: item._id,
      serialNumber: item.serialNumber,
      companyname: item.companyname,

      department: item.department,
      empcode: item.empcode,
      company: item.company,
      branch: item.branch,
      unit: item.unit,
      team: item.team,
      doj: item.doj,
      experience: item.experience,

      endtar: item.endtar,
      endtardate: item.endtardate,
      targetexp: item.targetexp,

      endexp: item.endexp,
      endexpdate: item.endexpdate,
      prodexp: item.prodexp,

      expmode: item.expmode,
      expval: item.expval,
      modeexp: item.modeexp,

      updatedmonthyear: item.updatedmonthyear,
    };
  });

  const rowsWithCheckboxes = rowDataTable.map((row) => ({
    ...row,
    // Create a custom field for rendering the checkbox
    checkbox: selectedRows.includes(row.id),
  }));
  // Show All Columns functionality
  const handleShowAllColumns = () => {
    const updatedVisibility = { ...columnVisibility };
    for (const columnKey in updatedVisibility) {
      updatedVisibility[columnKey] = true;
    }
    setColumnVisibility(updatedVisibility);
  };
  // // Function to filter columns based on search query
  const filteredColumns = columnDataTable.filter((column) => column.headerName.toLowerCase().includes(searchQueryManage.toLowerCase()));

  // Manage Columns functionality
  const toggleColumnVisibility = (field) => {
    setColumnVisibility((prevVisibility) => ({
      ...prevVisibility,
      [field]: !prevVisibility[field],
    }));
  };

  // JSX for the "Manage Columns" popover content
  const manageColumnsContent = (
    <Box
      style={{
        padding: "10px",
        minWidth: "325px",
        "& .MuiDialogContent-root": { padding: "10px 0" },
      }}
    >
      <Typography variant="h6">Manage Columns</Typography>
      <IconButton
        aria-label="close"
        onClick={handleCloseManageColumns}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <Box sx={{ position: "relative", margin: "10px" }}>
        <TextField label="Find column" variant="standard" fullWidth value={searchQueryManage} onChange={(e) => setSearchQueryManage(e.target.value)} sx={{ marginBottom: 5, position: "absolute" }} />
      </Box>
      <br />
      <br />
      <DialogContent sx={{ minWidth: "auto", height: "200px", position: "relative" }}>
        <List sx={{ overflow: "auto", height: "100%" }}>
          {filteredColumns.map((column) => (
            <ListItem key={column.field}>
              <ListItemText
                sx={{ display: "flex" }}
                primary={<Switch sx={{ marginTop: "-5px" }} size="small" checked={columnVisibility[column.field]} onChange={() => toggleColumnVisibility(column.field)} />}
                secondary={column.field === "checkbox" ? "Checkbox" : column.headerName}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Grid container>
          <Grid item md={4}>
            <Button variant="text" sx={{ textTransform: "none" }} onClick={() => setColumnVisibility(initialColumnVisibility)}>
              Show All
            </Button>
          </Grid>
          <Grid item md={4}></Grid>
          <Grid item md={4}>
            <Button
              variant="text"
              sx={{ textTransform: "none" }}
              onClick={() => {
                const newColumnVisibility = {};
                columnDataTable.forEach((column) => {
                  newColumnVisibility[column.field] = false; // Set hide property to true
                });
                setColumnVisibility(newColumnVisibility);
              }}
            >
              Hide All
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Box>
  );

  return (
    <Box>
      <Headtitle title={"Assign Experience Log"} />
      {/* ****** Header Content ****** */}
      <Typography sx={userStyle.HeaderText}>Assign Experience Log Details</Typography>
      <br />
      {/* ****** Table Start ****** */}

      {isUserRoleCompare?.includes("lassignexperience") && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            {/*       
          <Box sx={userStyle.container} > */}
            <Grid item xs={8} sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={userStyle.importheadtext}>Assign Experience Log</Typography>
              <Button
                variant="contained"
                onClick={(e) => {
                  navigate("/updatepages/assignexperience");
                }}
                sx={buttonStyles.btncancel}
              >
                Back
              </Button>
            </Grid>
            <Grid container spacing={2} style={userStyle.dataTablestyle}>
              <Grid item md={2} xs={12} sm={12}>
                <Box>
                  <label>Show entries:</label>
                  <Select
                    id="pageSizeSelect"
                    value={pageSize}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 180,
                          width: 80,
                        },
                      },
                    }}
                    onChange={handlePageSizeChange}
                    sx={{ width: "77px" }}
                  >
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                    <MenuItem value={logDatas?.length}>All</MenuItem>
                  </Select>
                </Box>
              </Grid>
              <Grid
                item
                md={8}
                xs={12}
                sm={12}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box>
                  {isUserRoleCompare?.includes("excelassignexperience") && (
                    <>
                      <Button
                        onClick={(e) => {
                          setIsFilterOpen(true);
                          setFormat("xl");
                        }}
                        sx={userStyle.buttongrp}
                      >
                        <FaFileExcel />
                        &ensp;Export to Excel&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("csvassignexperience") && (
                    <>
                      <Button
                        onClick={(e) => {
                          setIsFilterOpen(true);
                          setFormat("csv");
                        }}
                        sx={userStyle.buttongrp}
                      >
                        <FaFileCsv />
                        &ensp;Export to CSV&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("printassignexperience") && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("pdfassignexperience") && (
                    <>
                      <Button
                        sx={userStyle.buttongrp}
                        onClick={() => {
                          setIsPdfFilterOpen(true);
                        }}
                      >
                        <FaFilePdf />
                        &ensp;Export to PDF&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("imageassignexperience") && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}>
                        {" "}
                        <ImageIcon sx={{ fontSize: "15px" }} /> &ensp;Image&ensp;{" "}
                      </Button>
                    </>
                  )}
                </Box>
              </Grid>
              <Grid item md={2} xs={12} sm={12}>
                <AggregatedSearchBar
                  columnDataTable={columnDataTable}
                  setItems={setItems}
                  addSerialNumber={addSerialNumber}
                  setPage={setPage}
                  maindatas={logDatas}
                  setSearchedString={setSearchedString}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  paginated={false}
                  totalDatas={overallItems}
                />
              </Grid>
            </Grid>
            <br />
            <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>
              Show All Columns
            </Button>
            &ensp;
            <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumns}>
              Manage Columns
            </Button>
            &ensp;
            {/* {isUserRoleCompare?.includes("bdassignexperience") && (
              <Button variant="contained" color="error" onClick={handleClickOpenalert}>
                Bulk Delete
              </Button>
            )} */}
            <Popover
              id={idval}
              open={isManageColumnsOpen}
              anchorEl={anchorEl}
              onClose={handleCloseManageColumns}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              {manageColumnsContent}
            </Popover>
            <br />
            <br />
            <>
              {loader ? (
                <>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
                  </Box>
                </>
              ) : (
                <AggridTable
                  rowDataTable={rowDataTable}
                  columnDataTable={columnDataTable}
                  columnVisibility={columnVisibility}
                  page={page}
                  setPage={setPage}
                  pageSize={pageSize}
                  totalPages={totalPages}
                  setColumnVisibility={setColumnVisibility}
                  isHandleChange={isHandleChange}
                  items={items}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  gridRefTable={gridRef}
                  paginated={false}
                  filteredDatas={filteredDatas}
                  handleShowAllColumns={handleShowAllColumns}
                  setFilteredRowData={setFilteredRowData}
                  filteredRowData={filteredRowData}
                  setFilteredChanges={setFilteredChanges}
                  filteredChanges={filteredChanges}
                  gridRefTableImg={gridRefTableImg}
                  // rowHeight={90}
                  headerHeight={90}
                  itemsList={overallItems}
                />
              )}

              {/* ****** Table End ****** */}
            </>
            {/* } */}
          </Box>
        </>
      )}
      {/* Manage Column */}

      {/* Delete Modal */}
      <Box>
        {/* print layout */}
        <TableContainer component={Paper} sx={userStyle.printcls}>
          <Table aria-label="simple table" id="branch" ref={componentRef}>
            <TableHead sx={{ fontWeight: "600" }}>
              <StyledTableRow>
                <StyledTableCell>SI.NO</StyledTableCell>
                <StyledTableCell>Company</StyledTableCell>
                <StyledTableCell>Branch</StyledTableCell>
                <StyledTableCell>Unit</StyledTableCell>
                <StyledTableCell>Team</StyledTableCell>
                <StyledTableCell>Emp Code</StyledTableCell>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>DOJ </StyledTableCell>

                <StyledTableCell>Acutal Exp </StyledTableCell>
                <StyledTableCell>Mode </StyledTableCell>
                <StyledTableCell>Value </StyledTableCell>
                <StyledTableCell>Mode Exp </StyledTableCell>

                <StyledTableCell>End Exp </StyledTableCell>
                <StyledTableCell>End-Exp Date </StyledTableCell>
                <StyledTableCell>Prod Exp </StyledTableCell>
                <StyledTableCell>End Tar </StyledTableCell>
                <StyledTableCell>End-Tar Date </StyledTableCell>
                <StyledTableCell>Target Exp </StyledTableCell>
                <StyledTableCell>Last Updated </StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {rowDataTable &&
                rowDataTable.map((row, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{index + 1}</StyledTableCell>
                    <StyledTableCell>{row.company} </StyledTableCell>
                    <StyledTableCell>{row.branch} </StyledTableCell>
                    <StyledTableCell>{row.unit} </StyledTableCell>
                    <StyledTableCell>{row.team} </StyledTableCell>
                    <StyledTableCell>{row.empcode} </StyledTableCell>
                    <StyledTableCell> {row.companyname}</StyledTableCell>
                    <StyledTableCell> {row.doj}</StyledTableCell>
                    <StyledTableCell> {row.experience}</StyledTableCell>
                    <StyledTableCell> {row.expmode}</StyledTableCell>
                    <StyledTableCell> {row.expval}</StyledTableCell>
                    <StyledTableCell> {row.modeexp}</StyledTableCell>

                    <StyledTableCell> {row.endexp}</StyledTableCell>
                    <StyledTableCell> {row.endexpdate}</StyledTableCell>
                    <StyledTableCell> {row.prodexp}</StyledTableCell>

                    <StyledTableCell> {row.endtar}</StyledTableCell>
                    <StyledTableCell> {row.endtardate}</StyledTableCell>
                    <StyledTableCell> {row.targetexp}</StyledTableCell>
                    <StyledTableCell> {row.updatedmonthyear}</StyledTableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* ALERT DIALOG */}
      <Box>
        <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: "350px", textAlign: "center", alignItems: "center" }}>
            <Typography variant="h6">{showAlert}</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="error" onClick={handleCloseerr}>
              ok
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/*Export XL Data  */}
      <Dialog open={isFilterOpen} onClose={handleCloseFilterMod} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogContent
          sx={{
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {fileFormat === "xl" ? (
            <>
              <IconButton
                aria-label="close"
                onClick={handleCloseFilterMod}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>

              <FaFileExcel style={{ fontSize: "80px", color: "green" }} />
              <Typography variant="h5" sx={{ textAlign: "center" }}>
                Choose Export
              </Typography>
            </>
          ) : (
            <>
              <IconButton
                aria-label="close"
                onClick={handleCloseFilterMod}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>

              <FaFileCsv style={{ fontSize: "80px", color: "green" }} />
              <Typography variant="h5" sx={{ textAlign: "center" }}>
                Choose Export
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            variant="contained"
            onClick={(e) => {
              handleExportXL("filtered");
            }}
          >
            Export Filtered Data
          </Button>
          <Button
            autoFocus
            variant="contained"
            onClick={(e) => {
              handleExportXL("overall");
            }}
          >
            Export Over All Data
          </Button>
        </DialogActions>
      </Dialog>
      {/*Export pdf Data  */}
      <Dialog open={isPdfFilterOpen} onClose={handleClosePdfFilterMod} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogContent
          sx={{
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleClosePdfFilterMod}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <PictureAsPdfIcon sx={{ fontSize: "80px", color: "red" }} />
          <Typography variant="h5" sx={{ textAlign: "center" }}>
            Choose Export
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={(e) => {
              downloadPdf("filtered");
              setIsPdfFilterOpen(false);
            }}
          >
            Export Filtered Data
          </Button>
          <Button
            variant="contained"
            onClick={(e) => {
              downloadPdf("overall");
              setIsPdfFilterOpen(false);
            }}
          >
            Export Over All Data
          </Button>
        </DialogActions>
      </Dialog>
      <MessageAlert openPopup={openPopupMalert} handleClosePopup={handleClosePopupMalert} popupContent={popupContentMalert} popupSeverity={popupSeverityMalert} />
      {/* SUCCESS */}
      <AlertDialog openPopup={openPopup} handleClosePopup={handleClosePopup} popupContent={popupContent} popupSeverity={popupSeverity} />
    </Box>
  );
}

export default AssignexpLog;