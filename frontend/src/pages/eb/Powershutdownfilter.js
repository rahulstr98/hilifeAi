import {
  Box,
  Typography, InputAdornment,
  OutlinedInput,
  TableBody,
  TableRow,
  TableCell,
  Select,
  Paper,
  MenuItem,
  Dialog,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
  Table,
  TableHead,
  TableContainer,
  Button,
  List,
  ListItem,
  ListItemText,
  Popover,
  Checkbox,
  TextField,
  IconButton,
  TextareaAutosize,
} from "@mui/material";
import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from "react";
import { FaFileCsv, FaFileExcel, FaSearch, FaFilePdf, FaPrint } from "react-icons/fa";
import { userStyle, colourStyles } from "../../pageStyle";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import { SERVICE } from "../../services/Baseservice";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { useReactToPrint } from "react-to-print";
import { UserRoleAccessContext } from "../../context/Appcontext";
import { AuthContext } from "../../context/Appcontext";
import Headtitle from "../../components/Headtitle";
import { ThreeDots } from "react-loader-spinner";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/system";
import Switch from "@mui/material/Switch";
import CloseIcon from "@mui/icons-material/Close";
import html2canvas from "html2canvas";
import ImageIcon from "@mui/icons-material/Image";
import Selects from "react-select";
import { saveAs } from "file-saver";
import moment from "moment-timezone";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExportData from "../../components/ExportData";
import InfoPopup from "../../components/InfoPopup.js";
import MessageAlert from "../../components/MessageAlert";
import PageHeading from "../../components/PageHeading";
import { handleApiError } from "../../components/Errorhandling";

//new table
import { IoMdOptions } from "react-icons/io";
import { MdClose } from "react-icons/md";
import domtoimage from 'dom-to-image';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import AdvancedSearchBar from '../../components/SearchbarEbList.js';
import AggregatedSearchBar from "../../components/AggregatedSearchBar.js";
import AggridTable from "../../components/AggridTable.js";
import AlertDialog from "../../components/Alert";


function PowerShutDownFilter() {
  const [meetingArray, setMeetingArray] = useState([]);
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const [searchedString, setSearchedString] = useState("");
  const [isHandleChange, setIsHandleChange] = useState(false);
  const gridRefTableImg = useRef(null);
  const gridRefTable = useRef(null);



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


  const [fileFormat, setFormat] = useState("");

  let exportColumnNames = [
    'Company ',
    'Branch ',
    'Unit ',
    'Name ',
    'Date ',
    'From Time',
    'To Time',
    'Total Time',
    'Power Shutdown Type',
    'Message Received From',
    'Reminder ',
  ];
  let exportRowValues = [

    'company',
    'branch',
    'unit',
    'name',
    'date',
    'fromtime',
    'totime',
    'totaltime',
    'powershutdowntype',
    'messagereceivedfrom',
    'noofdays',
  ];





  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };

  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };

  const repeatTypeOption = [
    { value: "Today", label: "Today" },
    { value: "Weekly", label: "Weekly" },
    { value: "Monthly", label: "Monthly" },
    { value: "Yearly", label: "Yearly" },
  ];

  const statusFilterOption = [
    { label: "ALL", value: "ALL" },
    { label: "Completed", value: "Completed" },
    { label: "Canceled", value: "Canceled" },
    { label: "Upcoming", value: "Upcoming" },
    { label: "Postponed", value: "Postponed" },
  ];

  const statusOptions = [
    { label: "Completed", value: "Completed" },
    { label: "Canceled", value: "Canceled" },
    { label: "Upcoming", value: "Upcoming" },
    { label: "Postponed", value: "Postponed" },
  ];

  const [eventState, setEventState] = useState({
    date: "Today",
    statusfilter: "ALL",
  });

  const gridRef = useRef(null);
  //useStates
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  //state to handle meeting values

  //state to handle edit meeting values
  const { isUserRoleCompare, isAssignBranch, pageName, setPageName, isUserRoleAccess, buttonStyles } = useContext(
    UserRoleAccessContext
  );

  const accessbranch = isAssignBranch
    ?.map((data) => ({
      branch: data.branch,
      company: data.company,
      unit: data.unit,
    }))

  const { auth } = useContext(AuthContext);
  const [meetingCheck, setMeetingCheck] = useState(false);
  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const [meetingData, setMeetingData] = useState([]);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedData, setCopiedData] = useState("");
  const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    company: true,
    branch: true,
    unit: true,
    name: true,
    date: true,
    noofdays: true,
    actions: true,
    fromtime: true,
    totime: true,
    totaltime: true,
    powershutdowntype: true,
    messagereceivedfrom: true,
    status: true,
  };
  const [columnVisibility, setColumnVisibility] = useState(
    initialColumnVisibility
  );
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  //useEffect
  useEffect(() => {
    addSerialNumber(meetingArray);
  }, [meetingArray]);

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, []);

  useEffect(() => {
    const savedVisibility = localStorage.getItem("columnVisibility");
    if (savedVisibility) {
      setColumnVisibility(JSON.parse(savedVisibility));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("columnVisibility", JSON.stringify(columnVisibility));
  }, [columnVisibility]);
  //reminder options

  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
  };
  // Error Popup model
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // This is required for Chrome support
  };
  const username = isUserRoleAccess.username;
  const handleOpenManageColumns = (event) => {
    setAnchorEl(event.currentTarget);
    setManageColumnsOpen(true);
  };
  const handleCloseManageColumns = () => {
    setManageColumnsOpen(false);
    setSearchQueryManage("");
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;


  // //get all data.
  const fetchMeetingAll = async () => {
    setPageName(!pageName)
    setMeetingCheck(true)
    const accessmodule = [];

    isAssignBranch.map((data) => {
      let fetfinalurl = [];

      if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0 &&
        data?.mainpagenameurl?.length !== 0 && data?.subpagenameurl?.length !== 0 &&
        data?.subsubpagenameurl?.length !== 0
      ) {
        fetfinalurl = data.subsubpagenameurl;
      } else if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0 &&
        data?.mainpagenameurl?.length !== 0 && data?.subpagenameurl?.length !== 0) {
        fetfinalurl = data.subpagenameurl;
      } else if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0 &&
        data?.mainpagenameurl?.length !== 0) {
        fetfinalurl = data.mainpagenameurl;
      } else if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0) {
        fetfinalurl = data.submodulenameurl;
      } else if (data?.modulenameurl?.length !== 0) {
        fetfinalurl = data.modulenameurl;
      }
      accessmodule.push(fetfinalurl);
    });

    const uniqueValues = [...new Set(accessmodule.flat())];

    if (uniqueValues?.includes(pathname) || isUserRoleAccess?.role?.includes("Manager")) {

      try {
        let res_status = await axios.post(SERVICE.POWERSTATIONFILTER, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          role: isUserRoleAccess.role,
          companyname: isUserRoleAccess.companyname,
          selectedfilter: eventState.date,
          assignbranch: accessbranch,
        });
        setMeetingCheck(false);
        setMeetingArray(res_status?.data?.PowerStationfilternew?.map((item, index) => ({
          ...item,
          id: item._id,
          serialNumber: index + 1,
          date:
            item.status === "Postponed"
              ? moment(item.postponddate).format("DD-MM-YYYY")
              : moment(item.date).format("DD-MM-YYYY"),
          postponddate: moment(item.postponddate).format("DD-MM-YYYY"),

          company: item.company,
          branch: item.branch,
          unit: item.unit,
          name: item.name,
          description: item.description,
          noofdays: item.noofdays,
          fromtime: item.fromtime,
          totime: item.totime,
          totaltime: item.totaltime,
          powershutdowntype: item.powershutdowntype,
          messagereceivedfrom: item.messagereceivedfrom,
          reason: item.reason,
          personname: item.personname,
          status: item.status,
          cancelreason: item.cancelreason,
          postpondfromtime: item.postpondfromtime,
          postpondtotime: item.postpondtotime,
          postpondtotaltime: item.postpondtotaltime,

        })));
      } catch (err) {
        setMeetingCheck(false);
        handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);;
      }
    }
    else {
      setMeetingCheck(true)
      setMeetingArray([]);
    }
  }
  const [allPowerShutDown, setAllPowerShutDown] = useState([]);

  useEffect(() => {
    fetchPowerShutdownall();
  }, []);

  const filterStatus = () => {
    setMeetingCheck(true)
    try {
      const filtered = allPowerShutDown.filter(
        (item) => item.status === eventState.statusfilter
      );
      setMeetingArray(
        eventState.statusfilter === "ALL" ? allPowerShutDown : filtered
      );
      setMeetingCheck(false)
    }
    catch (err) {
      setMeetingCheck(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);;
    }
  };

  const fetchPowerShutdownall = async () => {
    setPageName(!pageName)
    try {
      let res_status = await axios.post(SERVICE.ALL_POWERSTATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        assignbranch: accessbranch,
      });
      setAllPowerShutDown(res_status?.data?.powerstation?.map((item, index) => ({
        ...item,
        id: item._id,
        serialNumber: index + 1,
        date:
          item.status === "Postponed"
            ? moment(item.postponddate).format("DD-MM-YYYY")
            : moment(item.date).format("DD-MM-YYYY"),
        postponddate: moment(item.postponddate).format("DD-MM-YYYY"),

        company: item.company,
        branch: item.branch,
        unit: item.unit,
        name: item.name,
        description: item.description,
        noofdays: item.noofdays,
        fromtime: item.fromtime,
        totime: item.totime,
        totaltime: item.totaltime,
        powershutdowntype: item.powershutdowntype,
        messagereceivedfrom: item.messagereceivedfrom,
        reason: item.reason,
        personname: item.personname,
        status: item.status,
        cancelreason: item.cancelreason,
        postpondfromtime: item.postpondfromtime,
        postpondtotime: item.postpondtotime,
        postpondtotaltime: item.postpondtotaltime,

      })));
    }
    catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);;
    }
  };

  const handleFilterClick = () => {
    fetchMeetingAll();
  };

  //image
  const handleCaptureImage = () => {
    if (gridRef.current) {
      html2canvas(gridRef.current).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, "Power ShutDown.png");
        });
      });
    }
  };
  // pdf.....
  const columns = [
    { title: "Sno", field: "serialNumber" },
    { title: "Company ", field: "company" },
    { title: "Branch ", field: "branch" },
    { title: "Unit ", field: "unit" },
    { title: "Name ", field: "name" },
    { title: "Date ", field: "date" },
    { title: "From Time", field: "fromtime" },
    { title: "To Time", field: "totime" },
    { title: "Total Time", field: "totaltime" },
    { title: "Power Shutdown Type", field: "powershutdowntype" },
    { title: "Message Received From", field: "messagereceivedfrom" },
    { title: "Person Name", field: "personname" },
    { title: "Reason", field: "reason" },
    { title: "Description ", field: "description" },
    { title: "Reminder ", field: "noofdays" },
    { title: "Status", field: "status" },
  ];
  //  pdf download functionality
  // const downloadPdf = () => {
  //   const doc = new jsPDF();

  //   doc.autoTable({
  //     theme: "grid",
  //     columns: columns.map((col) => ({ ...col, dataKey: col.field })),
  //     body: rowDataTable,
  //     styles: { fontSize: 5 },
  //   });

  //   doc.save("PowerShutDown.pdf");
  // };

  const downloadPdf = (isfilter) => {

    const doc = new jsPDF();
    let serialNumberCounter = 1;
    const dataWithSerial = isfilter === "filtered" ?
      rowDataTable.map(row => ({ ...row, serialNumber: serialNumberCounter++ })) :
      // meetingArray.map(row => ({ ...row, serialNumber: serialNumberCounter++ }));
      meetingArray.map(row => {
        let [year, month, date] = row.date.split("-");
        let formatdate = `${date}/${month}/${year}`;
        return {
          ...row,
          serialNumber: serialNumberCounter++,
          date: formatdate
        };
      });
    // Generate PDF
    doc.autoTable({
      theme: "grid",
      styles: { fontSize: 5 },
      // columns: columnsWithSerial,
      columns: columns.map((col) => ({ ...col, dataKey: col.field })),
      body: dataWithSerial,
    });

    doc.save("PowerShutDown.pdf");
  };
  // Excel
  const fileName = "PowerShutDown";

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Power ShutDown List",
    pageStyle: "print",
  });
  //serial no for listing items
  const addSerialNumber = (datas) => {
    setItems(datas);
  };
  //Datatable
  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSelectedRows([]);
    setSelectAllChecked(false);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setSelectedRows([]);
    setSelectAllChecked(false);
    setPage(1);
  };

  //datatable....
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  // Split the search query into individual terms
  const searchTerms = searchQuery.toLowerCase().split(" ");
  // Modify the filtering logic to check each term
  const filteredDatas = items?.filter((item) => {
    return searchTerms.every((term) =>
      Object.values(item).join(" ").toLowerCase().includes(term)
    );
  });

  const filteredData = filteredDatas.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalPages = Math.ceil(filteredDatas.length / pageSize);

  const visiblePages = Math.min(totalPages, 3);

  const firstVisiblePage = Math.max(1, page - 1);
  const lastVisiblePage = Math.min(
    firstVisiblePage + visiblePages - 1,
    totalPages
  );

  const pageNumbers = [];

  const indexOfLastItem = page * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;

  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }

  const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
    <div>
      <Checkbox checked={selectAllChecked} onChange={onSelectAll} />
    </div>
  );

  const [powerstationEdit, setPowerstationEdit] = useState({});
  const [powerstationStatus, setPowerstationStatus] = useState({});

  //Edit model...
  const [isEditOpen, setIsEditOpen] = useState(false);
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === "backdropClick") return;
    setIsEditOpen(false);
  };

  const [documentFilesEdit, setdocumentFilesEdit] = useState([]);

  const renderFilePreview = async (file) => {
    const response = await fetch(file.preview);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    window.open(link, "_blank");
  };

  useEffect(() => {
    const calculateTotalTimeEdit = () => {
      const { postpondfromtime, postpondtotime } = powerstationEdit;
      if (postpondfromtime && postpondtotime) {
        const [fromHours, fromMinutes] = postpondfromtime
          .split(":")
          .map(Number);
        const [toHours, toMinutes] = postpondtotime.split(":").map(Number);

        let totalHours = toHours - fromHours;
        let totalMinutes = toMinutes - fromMinutes;

        if (totalMinutes < 0) {
          totalHours -= 1;
          totalMinutes += 60;
        }
        if (totalHours < 0) {
          totalHours += 24;
        }

        const formattedTotalTime = `${totalHours < 10 ? "0" : ""
          }${totalHours}:${totalMinutes < 10 ? "0" : ""}${totalMinutes}`;
        setPowerstationEdit({
          ...powerstationEdit,
          postpondtotaltime: formattedTotalTime,
        });
      }
    };

    calculateTotalTimeEdit();
  }, [powerstationEdit.postpondfromtime, powerstationEdit.postpondtotime]);

  const handleTimeChangeEdit = (event, timeField) => {
    const inputValue = event.target.value;
    setPowerstationEdit({
      ...powerstationEdit,
      [timeField]: inputValue,
    });
  };

  const editSubmit = (e) => {
    e.preventDefault();
    // fetchHolidayAll();
    // let compopt = selectedEditCompanyValues.map((item) => item);
    // const isNameMatch = allStatusEdit?.some(
    //   (item) =>
    //     item.company.some((data) => compopt.includes(data)) &&
    //     item.branch == powerstationEdit.branch &&
    //     item.unit == powerstationEdit.unit &&
    //     item.name?.toLowerCase() == powerstationEdit.name?.toLowerCase() &&
    //     item.date == powerstationEdit.date &&
    //     item.fromtime == powerstationEdit.fromtime &&
    //     item.totime == powerstationEdit.totime &&
    //     item.status == powerstationEdit.status
    //   // item.powershutdowntype === powerstationEdit.powershutdowntype &&
    //   // item.messagereceivedfrom === powerstationEdit.messagereceivedfrom
    // );
    if (powerstationEdit.status === "Please Select Status") {
      setPopupContentMalert("Please Select Status");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert()
    } else if (
      powerstationEdit.status === "Postponed" &&
      powerstationEdit.postponddate === ""
    ) {

      setPopupContentMalert("Please Select Postponed Date");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert()
    } else if (
      powerstationEdit.status === "Postponed" &&
      (powerstationEdit.postpondfromtime === "" ||
        powerstationEdit.postpondfromtime == undefined)
    ) {

      setPopupContentMalert("Please Select Postponed From Time");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert()
    } else if (
      powerstationEdit.status === "Postponed" &&
      (powerstationEdit.postpondtotime === "" ||
        powerstationEdit.postpondtotime == undefined)
    ) {

      setPopupContentMalert("Please Select Postponed To Time");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert()
    }

    else {
      sendEditRequest();
    }
  };

  let updateby = powerstationEdit?.updatedby;
  let holidayId = powerstationEdit?._id;

  //editing the single data...
  const sendEditRequest = async () => {
    setPageName(!pageName)
    try {
      let res = await axios.put(
        `${SERVICE.SINGLE_POWERTSTATION}/${holidayId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          status: String(powerstationEdit.status),
          cancelreason: String(
            powerstationEdit.status === "Canceled"
              ? powerstationEdit.cancelreason
              : ""
          ),
          postponddate: String(
            powerstationEdit.status === "Postponed"
              ? powerstationEdit.postponddate
              : ""
          ),
          postpondfromtime: String(
            powerstationEdit.status === "Postponed"
              ? powerstationEdit.postpondfromtime
              : ""
          ),
          postpondtotime: String(
            powerstationEdit.status === "Postponed"
              ? powerstationEdit.postpondtotime
              : ""
          ),
          postpondtotaltime: String(
            powerstationEdit.status === "Postponed"
              ? powerstationEdit.postpondtotaltime
              : ""
          ),
          updatedby: [
            ...updateby,
            {
              name: String(username),
              date: String(new Date()),
            },
          ],
        }
      );

      await fetchPowerShutdownall();
      setMeetingArray([]);
      handleCloseModEdit();
      setPopupContentMalert("Updated Successfully");
      setPopupSeverityMalert("success");
      handleClickOpenPopupMalert()
    }
    catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);;
    }
  };

  //get single row to edit....
  const getCode = async (e) => {
    setPageName(!pageName)
    try {
      let res = await axios.get(`${SERVICE.SINGLE_POWERTSTATION}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setPowerstationEdit(res?.data?.spowerstation);
      setPowerstationStatus(res?.data?.spowerstation);
      setdocumentFilesEdit(res?.data?.spowerstation?.document);
      handleClickOpenEdit();
    }
    catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);;
    }
  };
  const columnDataTable = [

    {
      field: "serialNumber",
      headerName: "SNo",
      flex: 0,
      width: 80,
      hide: !columnVisibility.serialNumber,
      headerClassName: "bold-header",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0,
      width: 100,
      hide: !columnVisibility.status,
      headerClassName: "bold-header",
    },
    {
      field: "company",
      headerName: "Company",
      flex: 0,
      width: 100,
      hide: !columnVisibility.company,
      headerClassName: "bold-header",
    },
    {
      field: "branch",
      headerName: "Branch",
      flex: 0,
      width: 100,
      hide: !columnVisibility.branch,
      headerClassName: "bold-header",
    },
    {
      field: "unit",
      headerName: "Unit",
      flex: 0,
      width: 100,
      hide: !columnVisibility.unit,
      headerClassName: "bold-header",
    },
    {
      field: "name",
      headerName: "Name",
      flex: 0,
      width: 100,
      hide: !columnVisibility.name,
      headerClassName: "bold-header",
    },
    {
      field: "date",
      headerName: "Date",
      flex: 0,
      width: 100,
      hide: !columnVisibility.date,
      headerClassName: "bold-header",
    },
    {
      field: "fromtime",
      headerName: "From Time",
      flex: 0,
      width: 100,
      hide: !columnVisibility.fromtime,
      headerClassName: "bold-header",
    },
    {
      field: "totime",
      headerName: "To Time",
      flex: 0,
      width: 100,
      hide: !columnVisibility.totime,
      headerClassName: "bold-header",
    },
    {
      field: "totaltime",
      headerName: "Total Time",
      flex: 0,
      width: 100,
      hide: !columnVisibility.totaltime,
      headerClassName: "bold-header",
    },
    {
      field: "powershutdowntype",
      headerName: "Power Shutdown Type",
      flex: 0,
      width: 150,
      hide: !columnVisibility.powershutdowntype,
      headerClassName: "bold-header",
    },
    {
      field: "messagereceivedfrom",
      headerName: "Message Received From",
      flex: 0,
      width: 150,
      hide: !columnVisibility.messagereceivedfrom,
      headerClassName: "bold-header",
    },


    {
      field: "noofdays",
      headerName: "Reminder",
      flex: 0,
      width: 100,
      hide: !columnVisibility.noofdays,
      headerClassName: "bold-header",
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 0,
      width: 180,
      minHeight: "40px !important",
      sortable: false,
      hide: !columnVisibility.actions,
      headerClassName: "bold-header",
      cellRenderer: (params) => (
        <Grid sx={{ display: "flex" }}>
          {isUserRoleCompare?.includes("vpowershutdownfilter") && (
            <Button
              variant="contained"
              sx={userStyle.buttonedit}
              onClick={() => {
                getCode(params.data.id);
              }}
            >
              view
            </Button>
          )}
        </Grid>
      ),
    },
  ];
  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item._id,
      serialNumber: item.serialNumber,
      company: item.company,
      branch: item.branch,
      unit: item.unit,
      name: item.name,
      date:
        item.date,
      description: item.description,
      noofdays: item.noofdays,
      fromtime: item.fromtime,
      totime: item.totime,
      totaltime: item.totaltime,
      powershutdowntype: item.powershutdowntype,
      messagereceivedfrom: item.messagereceivedfrom,
      reason: item.reason,
      personname: item.personname,
      status: item.status,
      cancelreason: item.cancelreason,
      postponddate: item.postponddate,
      postpondfromtime: item.postpondfromtime,
      postpondtotime: item.postpondtotime,
      postpondtotaltime: item.postpondtotaltime,
    };
  });

  const rowsWithCheckboxes = rowDataTable?.map((row) => ({
    ...row,
    checkbox: selectedRows.includes(row.id),
  }));
  // Show All Columns functionality
  // Show All Columns functionality
  const handleShowAllColumns = () => {
    const updatedVisibility = { ...columnVisibility };
    for (const columnKey in updatedVisibility) {
      updatedVisibility[columnKey] = true;
    }
    setColumnVisibility(updatedVisibility);
  };
  // Function to filter columns based on search query
  const filteredColumns = columnDataTable.filter((column) =>
    column.headerName.toLowerCase().includes(searchQueryManage.toLowerCase())
  );
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
        <TextField
          label="Find column"
          variant="standard"
          fullWidth
          value={searchQueryManage}
          onChange={(e) => setSearchQueryManage(e.target.value)}
          sx={{ marginBottom: 5, position: "absolute" }}
        />
      </Box>
      <br />
      <br />
      <DialogContent
        sx={{ minWidth: "auto", height: "200px", position: "relative" }}
      >
        <List sx={{ overflow: "auto", height: "100%" }}>
          {filteredColumns.map((column) => (
            <ListItem key={column.field}>
              <ListItemText
                sx={{ display: "flex" }}
                primary={
                  <Switch
                    sx={{ marginTop: "-5px" }}
                    size="small"
                    checked={columnVisibility[column.field]}
                    onChange={() => toggleColumnVisibility(column.field)}
                  />
                }
                secondary={
                  column.field === "checkbox" ? "Checkbox" : column.headerName
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Grid container>
          <Grid item md={4}>
            <Button
              variant="text"
              sx={{ textTransform: "none" }}
              onClick={() => setColumnVisibility(initialColumnVisibility)}
            >
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
              {" "}
              Hide All
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Box>
  );
  const pathname = window.location.pathname;


  const getapi = async () => {
    setPageName(!pageName)
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String("Power ShutDown Filter"),
      commonid: String(isUserRoleAccess?._id),
      date: String(new Date()),

      addedby: [
        {
          name: String(isUserRoleAccess?.username),
          date: String(new Date()),
        },
      ],
    });

  }

  useEffect(() => {
    getapi();
  }, []);
  return (
    <Box>
      <Headtitle title={"POWER SHUTDOWN FILTER"} />
      <br />
      {/* ****** Table Start ****** */}
      <PageHeading
        title="Power ShutDown Filter"
        modulename="EB"
        submodulename="Power ShutDown"
        mainpagename="Power ShutDown Filter"
        subpagename=""
        subsubpagename=""
      />

      <>
        {isUserRoleCompare?.includes("lpowershutdownfilter") && (
          <Box sx={userStyle.container}>
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>
                List Power ShutDown
              </Typography>
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
                    <MenuItem value={(meetingArray?.length)}>All</MenuItem>
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
                  {isUserRoleCompare?.includes("excelpowershutdownfilter") && (
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

                  {isUserRoleCompare?.includes("csvpowershutdownfilter") && (
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
                  {isUserRoleCompare?.includes("printpowershutdownfilter") && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("pdfpowershutdownfilter") && (
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
                  {isUserRoleCompare?.includes("imagepowershutdownfilter") && (
                    <Button
                      sx={userStyle.buttongrp}
                      onClick={handleCaptureImage}
                    >
                      {" "}
                      <ImageIcon
                        sx={{ fontSize: "15px" }}
                      /> &ensp;Image&ensp;{" "}
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item md={2} xs={6} sm={6}>
                <AggregatedSearchBar
                  columnDataTable={columnDataTable}
                  setItems={setItems}
                  addSerialNumber={addSerialNumber}
                  setPage={setPage}
                  maindatas={meetingArray}
                  setSearchedString={setSearchedString}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  paginated={false}
                  totalDatas={meetingArray}
                />

              </Grid>
            </Grid>
            <br />
            <Grid container spacing={1}>
              <Grid item md={3} xs={12} sm={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "left",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <Button
                    sx={userStyle.buttongrp}
                    onClick={handleShowAllColumns}
                  >
                    Show All Columns
                  </Button>
                  <Button
                    sx={userStyle.buttongrp}
                    onClick={handleOpenManageColumns}
                  >
                    Manage Columns
                  </Button>
                </Box>
              </Grid>
              <Grid item md={2.5} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Selects
                    maxMenuHeight={300}
                    options={repeatTypeOption}
                    styles={colourStyles}
                    placeholder="Repeat Type"
                    value={repeatTypeOption.find(
                      (option) => option.value === eventState.date
                    )}
                    onChange={(e) => {
                      setEventState({ ...eventState, date: e.value });
                    }}
                  />
                </FormControl>
              </Grid>
              &ensp;
              <Grid item md={1} xs={12} sm={12}>
                <Button variant="contained" sx={buttonStyles.buttonsubmit} onClick={handleFilterClick}>
                  Filter
                </Button>
              </Grid>
              <Grid item md={2.5} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Selects
                    maxMenuHeight={300}
                    options={statusFilterOption}
                    styles={colourStyles}
                    placeholder="Repeat Type"
                    value={{
                      label: eventState.statusfilter,
                      value: eventState.statusfilter,
                    }}
                    onChange={(e) => {
                      setEventState({ ...eventState, statusfilter: e.value });
                    }}
                  />
                </FormControl>
              </Grid>
              &ensp;
              <Grid item md={1} xs={12} sm={12}>
                <Button
                  variant="contained"
                  sx={buttonStyles.buttonsubmit}
                  onClick={() => {
                    filterStatus();
                  }}
                >
                  Filter
                </Button>
              </Grid>
            </Grid>
            <br />
            {meetingCheck ? (
              <>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <ThreeDots
                    height="80"
                    width="80"
                    radius="9"
                    color="#1976d2"
                    ariaLabel="three-dots-loading"
                    wrapperStyle={{}}
                    wrapperClassName=""
                    visible={true}
                  />
                </Box>
              </>
            ) : (

              <>
                <Box style={{ width: "100%", overflowY: "hidden" }}>
                  <>
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
                      gridRefTable={gridRefTable}
                      paginated={false}
                      filteredDatas={filteredDatas}
                      // totalDatas={totalDatas}
                      searchQuery={searchedString}
                      handleShowAllColumns={handleShowAllColumns}
                      setFilteredRowData={setFilteredRowData}
                      filteredRowData={filteredRowData}
                      setFilteredChanges={setFilteredChanges}
                      filteredChanges={filteredChanges}
                      gridRefTableImg={gridRefTableImg}
                      itemsList={meetingArray}
                    />
                  </>
                </Box>
              </>
            )}
          </Box>
        )}
      </>


      {/* ****** Table End ****** */}
      {/* Manage Column */}
      <Popover
        id={id}
        open={isManageColumnsOpen}
        anchorEl={anchorEl}
        onClose={handleCloseManageColumns}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        {" "}
        {manageColumnsContent}
      </Popover>

      {/* print layout */}
      <TableContainer component={Paper} sx={userStyle.printcls}>
        <Table
          sx={{ minWidth: 700 }}
          aria-label="customized table"
          id="usertable"
          ref={componentRef}
        >
          <TableHead>
            <TableRow>
              <TableCell> SI.No</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>From Time</TableCell>
              <TableCell>To Time</TableCell>
              <TableCell>Total Time</TableCell>
              <TableCell>Power Shutdown Type</TableCell>
              <TableCell>Message Received From</TableCell>
              <TableCell>Person Name</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Reminder</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody align="left">
            {rowDataTable &&
              rowDataTable?.map((row, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.company}</TableCell>
                    <TableCell>{row.branch}</TableCell>
                    <TableCell>{row.unit}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.fromtime}</TableCell>
                    <TableCell>{row.totime}</TableCell>
                    <TableCell>{row.totaltime}</TableCell>
                    <TableCell>{row.powershutdowntype}</TableCell>
                    <TableCell>{row.messagereceivedfrom}</TableCell>
                    <TableCell>{row.personname}</TableCell>
                    <TableCell>{row.reason}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>{row.noofdays}</TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit DIALOG */}
      <Box>
        <Dialog
          open={isEditOpen}
          onClose={handleCloseModEdit}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="md"
          fullWidth={true}
          sx={{ marginTop: "95px" }}
        >
          <Box sx={{ padding: "30px 50px" }}>
            <>
              <Grid container spacing={2}>
                <Typography sx={userStyle.HeaderText}>
                  View Power ShutDown List
                </Typography>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6"> Company</Typography>
                    <Typography>
                      {powerstationStatus.company
                        ?.map((t, i) => `${i + 1 + ". "}` + t)
                        .toString()}
                    </Typography>
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6"> Branch</Typography>
                    <Typography>{powerstationStatus.branch}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6"> Unit</Typography>
                    <Typography>{powerstationStatus.unit}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6"> Name</Typography>
                    <Typography>{powerstationStatus.name}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6"> Date</Typography>
                    <Typography>
                      {powerstationStatus.date
                        ? new Date(powerstationStatus.date).toLocaleDateString(
                          "en-GB"
                        )
                        : ""}
                    </Typography>
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6"> From Time</Typography>
                    <Typography>{powerstationStatus.fromtime}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6"> To Time</Typography>
                    <Typography>{powerstationStatus.totime}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6"> Total Time</Typography>
                    <Typography>{powerstationStatus.totaltime}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Power Shutdown Type</Typography>
                    <Typography>
                      {powerstationStatus.powershutdowntype}
                    </Typography>
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Message Received From</Typography>
                    <Typography>
                      {powerstationStatus.messagereceivedfrom}
                    </Typography>
                  </FormControl>
                </Grid>
                {powerstationStatus.messagereceivedfrom === "Person" && (
                  <Grid item md={6} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography variant="h6">Person Name</Typography>
                      <Typography>{powerstationStatus.personname}</Typography>
                    </FormControl>
                  </Grid>
                )}
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Reason</Typography>
                    <Typography>{powerstationStatus.reason}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6"> Description</Typography>
                    <Typography>{powerstationStatus.description}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6"> Reminder</Typography>
                    <Typography>{powerstationStatus.noofdays}</Typography>
                  </FormControl>
                </Grid>
                {powerstationStatus.status === "Canceled" ||
                  powerstationStatus.status === "Completed" ? (
                  <Grid item md={6} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography variant="h6">Status</Typography>
                      <Typography>{powerstationStatus.status}</Typography>
                    </FormControl>
                  </Grid>
                ) : (
                  <Grid item md={6} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Status<b style={{ color: "red" }}>*</b>{" "}
                      </Typography>
                      <Selects
                        options={statusOptions}
                        styles={colourStyles}
                        placeholder="Please Select Status"
                        value={{
                          label: powerstationEdit.status,
                          value: powerstationEdit.status,
                        }}
                        onChange={(e) => {
                          setPowerstationEdit({
                            ...powerstationEdit,
                            status: e.value,
                            cancelreason: "",
                            postponddate: "",
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                )}

                {powerstationEdit.status === "Postponed" && (
                  <>
                    <Grid item md={6} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Postponed Date<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="date"
                          value={powerstationEdit.postponddate}
                          onChange={(e) => {
                            setPowerstationEdit({
                              ...powerstationEdit,
                              postponddate: e.target.value,
                            });
                          }}
                          inputProps={{
                            min: powerstationEdit.date,
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={6} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Postponed From Time <b style={{ color: "red" }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="postpondfromtime"
                          type="time"
                          value={powerstationEdit.postpondfromtime}
                          placeholder="HH:MM"
                          onChange={(e) =>
                            handleTimeChangeEdit(e, "postpondfromtime")
                          }
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={6} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Postponed To Time <b style={{ color: "red" }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="postpondtotime"
                          type="time"
                          value={powerstationEdit.postpondtotime}
                          placeholder="HH:MM"
                          onChange={(e) =>
                            handleTimeChangeEdit(e, "postpondtotime")
                          }
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={6} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Postponed Total Time</Typography>
                        <OutlinedInput
                          id="postpondtotaltime"
                          type="text"
                          value={powerstationEdit.postpondtotaltime}
                          placeholder="HH:MM"
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                  </>
                )}
                {powerstationEdit.status === "Canceled" &&
                  powerstationStatus.status !== "Canceled" && (
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Cancel Reason</Typography>
                        <TextareaAutosize
                          aria-label="minimum height"
                          minRows={2.5}
                          value={powerstationEdit.cancelreason}
                          onChange={(e) => {
                            setPowerstationEdit({
                              ...powerstationEdit,
                              cancelreason: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                  )}
                {powerstationStatus.status === "Canceled" && (
                  <Grid item md={6} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography variant="h6">Cancel Reason</Typography>
                      <Typography>{powerstationStatus.cancelreason}</Typography>
                    </FormControl>
                  </Grid>
                )}
              </Grid>
              <br /> <br />
              <Grid container spacing={2}>
                {powerstationStatus.status === "Completed" ||
                  powerstationStatus.status === "Canceled" ? (
                  <Grid item md={6} xs={12} sm={12}>
                    <Button variant="contained" sx={buttonStyles.buttonsubmit} onClick={handleCloseModEdit}>
                      {" "}
                      Back{" "}
                    </Button>
                  </Grid>
                ) : (
                  <Grid item md={6} xs={12} sm={12}>
                    <Button variant="contained" sx={buttonStyles.buttonsubmit} onClick={editSubmit}>
                      {" "}
                      Update
                    </Button>
                  </Grid>
                )}

                <br />
                {powerstationStatus.status === "Completed" ||
                  powerstationStatus.status === "Canceled" ? (
                  <></>
                ) : (
                  <Grid item md={6} xs={12} sm={12}>
                    <Button
                      sx={buttonStyles.btncancel}
                      onClick={handleCloseModEdit}
                    >
                      {" "}
                      Cancel{" "}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>

      {/* ALERT DIALOG */}
      <Box>
        <Dialog
          open={isErrorOpen}
          onClose={handleCloseerr}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent
            sx={{ width: "350px", textAlign: "center", alignItems: "center" }}
          >
            <Typography variant="h6">{showAlert}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              style={{
                padding: "7px 13px",
                color: "white",
                background: "rgb(25, 118, 210)",
              }}
              onClick={handleCloseerr}
            >
              {" "}
              ok{" "}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <MessageAlert
        openPopup={openPopupMalert}
        handleClosePopup={handleClosePopupMalert}
        popupContent={popupContentMalert}
        popupSeverity={popupSeverityMalert}
      />
      {/* SUCCESS */}
      <AlertDialog
        openPopup={openPopup}
        handleClosePopup={handleClosePopup}
        popupContent={popupContent}
        popupSeverity={popupSeverity}
      />

      <ExportData
        isFilterOpen={isFilterOpen}
        handleCloseFilterMod={handleCloseFilterMod}
        fileFormat={fileFormat}
        setIsFilterOpen={setIsFilterOpen}
        isPdfFilterOpen={isPdfFilterOpen}
        setIsPdfFilterOpen={setIsPdfFilterOpen}
        handleClosePdfFilterMod={handleClosePdfFilterMod}
        filteredDataTwo={(filteredChanges !== null ? filteredRowData : rowDataTable) ?? []}
        itemsTwo={meetingArray ?? []}
        filename={"Power ShutDown"}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
    </Box>
  );
}
export default PowerShutDownFilter;
