import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ImageIcon from "@mui/icons-material/Image";
import InfoIcon from "@mui/icons-material/Info";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Popover,
  Select,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import axios from "axios";
import * as FileSaver from "file-saver";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment-timezone";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";
import AggregatedSearchBar from '../../components/AggregatedSearchBar';
import AggridTable from "../../components/AggridTable";
import AlertDialog from "../../components/Alert";
import { handleApiError } from "../../components/Errorhandling";
import Headtitle from "../../components/Headtitle";
import MessageAlert from "../../components/MessageAlert";
import PageHeading from "../../components/PageHeading";
import { StyledTableCell, StyledTableRow } from "../../components/Table";
import { AuthContext, UserRoleAccessContext } from "../../context/Appcontext";
import { userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";
import domtoimage from 'dom-to-image';

function AllPendingCheckList() {

  const [filteredRowDataTwo, setFilteredRowDataTwo] = useState([]);
  const [filteredChangesTwo, setFilteredChangesTwo] = useState(null);

  const [overallItemsTwo, setOverallItemsTwo] = useState([]);


  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);

  const [overallItems, setOverallItems] = useState([]);

  const [isHandleChange, setIsHandleChange] = useState(false);
  const [searchedString, setSearchedString] = useState("")
  const [isHandleChangeTwo, setIsHandleChangeTwo] = useState(false);
  const [searchedStringTwo, setSearchedStringTwo] = useState("")
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

  const getapi = async () => {
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String("All Pending Checklist"),
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
  const [candidates, setCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    isUserRoleAccess,
    isUserRoleCompare,
    allUsersData,
    pageName,
    setPageName,
    isAssignBranch,
    listPageAccessMode,
    buttonStyles
  } = useContext(UserRoleAccessContext);
  let listpageaccessby =
    listPageAccessMode?.find(
      (data) =>
        data.modulename === "Human Resources" &&
        data.submodulename === "HR" &&
        data.mainpagename === "Employee" &&
        data.subpagename === "Employee Status Details" &&
        data.subsubpagename === "Long Absent Restriction Hierarchy List"
    )?.listpageaccessmode || "Overall";
  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateValue, setDateValue] = useState([]);
  const [timeValue, setTimeValue] = useState([]);
  const [dateValueRandom, setDateValueRandom] = useState([]);
  const [timeValueRandom, setTimeValueRandom] = useState([]);
  const [dateValueMultiFrom, setDateValueMultiFrom] = useState([]);
  const [dateValueMultiTo, setDateValueMultiTo] = useState([]);
  const [tableCount, setTableCount] = useState(1);
  const [tableThree, setTableThree] = useState(true);

  //print...
  const componentRefTwo = useRef();
  const handleprintTwo = useReactToPrint({
    content: () => componentRefTwo.current,
    documentTitle: "All Pending Check List",
    pageStyle: "print",
  });

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
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = fileFormat === "xl" ? ".xlsx" : ".csv";

  const exportToExcel = (excelData, fileName) => {
    setPageName(!pageName);
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
        "Module Name": (filteredChangesTwo !== null ? item.module :  item.modulename)|| "",
        "Sub Module Name": item.submodule || "",
        "Main Page": item.mainpage || "",
        "Sub Page": item.subpage || "",
        "Sub Sub Page": item.subsubpage || "",
      };
    });
  };

  const handleExportXLTwo = (isfilter) => {
    const dataToExport = isfilter === "filtered" ? (filteredChangesTwo !== null ? filteredRowDataTwo : filteredDataTwo) : itemsTwo;

    if (!dataToExport || dataToExport.length === 0) {
      console.error("No data available to export");
      return;
    }

    exportToExcel(formatData(dataToExport), "All Pending Check List");
    setIsFilterOpen(false);
  };

  // pdf.....
  const columnsTwo = [
    { title: "Module Name", field: "modulename" },
    { title: "Sub Module Name", field: "submodule" },
    { title: "Main Page", field: "mainpage" },
    { title: "Sub Page", field: "subpage" },
    { title: "Sub Sub Page", field: "subsubpage" },
  ];

  const downloadPdfTwo = (isfilter) => {
    const doc = new jsPDF();
    const columnsWithSerial = [
      { title: "S.No", dataKey: "serialNumber" }, // Serial number column
      ...columnsTwo.map((col) => ({ title: col.title, dataKey: col.field })),
    ];

    let newOne = filteredChangesTwo !== null ? filteredRowDataTwo?.map((item)=>({...item,modulename:item.module})) : filteredDataTwo
    // Modify row data to include serial number
    const dataWithSerial =
      isfilter === "filtered"
        ? newOne.map((t, index) => ({
          ...t,
          serialNumber: index + 1,
        }))
        : itemsTwo?.map((item, index) => ({
          ...item,
          serialNumber: index + 1,
        }));

    // Generate PDF
    doc.autoTable({
      theme: "grid",
      columns: columnsWithSerial,
      body: dataWithSerial,
      styles: { fontSize: 5 },
    });

    doc.save("All Pending Check List.pdf");
  };

  const gridRefTableImgTwo = useRef(null);
  // image
  const handleCaptureImageTwo = () => {
    if (gridRefTableImgTwo.current) {
      domtoimage.toBlob(gridRefTableImgTwo.current)
        .then((blob) => {
          saveAs(blob, "All Pending Checklist.png");
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };

  const [firstDateValue, setFirstDateValue] = useState([]);
  const [firstTimeValue, setFirstTimeValue] = useState([]);
  const [secondDateValue, setSecondDateValue] = useState([]);
  const [secondTimeValue, setSecondTimeValue] = useState([]);
  const { auth } = useContext(AuthContext);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [isBankdetail, setBankdetail] = useState(false);

  const handleCloseMod = () => {
    setIsDeleteOpen(false);
  };

  const gridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [copiedData, setCopiedData] = useState("");

  const gridRefTableImg = useRef(null);
  // image
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage.toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, "All Pending Checklist.png");
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };

  const renderFilePreviewEdit = async (file) => {
    const response = await fetch(file.preview);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    window.open(link, "_blank");
  };

  //for assigning workstation
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [tableTwoDatas, setTableTwoDatas] = useState([]);
  const [sourceDatas, setSourceDatas] = useState([]);
  const [itemsTwo, setItemsTwo] = useState([]);
  const [pageTwo, setPageTwo] = useState(1);
  const [searchQueryManageTwo, setSearchQueryManageTwo] = useState("");
  const [searchQueryTwo, setSearchQueryTwo] = useState("");

  // Manage Columns
  const addSerialNumberTwo = (datas) => {
    const itemsWithSerialNumber = tableTwoDatas?.map((item, index) => ({
      ...item,
      serialNumber: index + 1,
      id: index,
    }));
    setItemsTwo(itemsWithSerialNumber);
  };

  useEffect(() => {
    addSerialNumberTwo(tableTwoDatas);
  }, [tableTwoDatas]);

  const initialColumnVisibilityTwo = {
    serialNumber: true,
    module: true,
    submodule: true,
    mainpage: true,
    subpage: true,
    subsubpage: true,
    actions: true,
  };

  const [columnVisibilityTwo, setColumnVisibilityTwo] = useState(
    initialColumnVisibilityTwo
  );

  // Manage Columns
  const [isManageColumnsOpenTwo, setManageColumnsOpenTwo] = useState(false);
  const [anchorElTwo, setAnchorElTwo] = useState(null);

  const handleOpenManageColumnsTwo = (event) => {
    setAnchorElTwo(event.currentTarget);
    setManageColumnsOpenTwo(true);
  };

  const openTwo = Boolean(anchorElTwo);
  const idTwo = openTwo ? "simple-popover" : undefined;

  const handleCloseManageColumnsTwo = () => {
    setManageColumnsOpenTwo(false);
    setSearchQueryManageTwo("");
  };

  const [pageSizeTwo, setPageSizeTwo] = useState(10);
  //Datatable
  const handlePageChangeTwo = (newPage) => {
    setPageTwo(newPage);
  };
  const handlePageSizeChangeTwo = (event) => {
    setPageSizeTwo(Number(event.target.value));
    setSelectedRows([]);
    setPage(1);
  };

  // Split the search query into individual terms
  const searchTermsTwo = searchQueryTwo.toLowerCase().split(" ");
  // Modify the filtering logic to check each term
  const filteredDataTwos = itemsTwo?.filter((item) => {
    return searchTermsTwo.every((term) =>
      Object.values(item).join(" ").toLowerCase().includes(term)
    );
  });

  const filteredDataTwo = filteredDataTwos.slice(
    (pageTwo - 1) * pageSizeTwo,
    pageTwo * pageSizeTwo
  );

  const totalPagesTwo = Math.ceil(filteredDataTwos.length / pageSizeTwo);

  const visiblePagesTwo = Math.min(totalPagesTwo, 3);

  const firstVisiblePageTwo = Math.max(1, pageTwo - 1);
  const lastVisiblePageTwo = Math.min(
    firstVisiblePageTwo + visiblePagesTwo - 1,
    totalPagesTwo
  );

  const pageNumbersTwo = [];

  const indexOfLastItemTwo = pageTwo * pageSizeTwo;
  const indexOfFirstItemTwo = indexOfLastItemTwo - pageSizeTwo;

  for (let i = firstVisiblePageTwo; i <= lastVisiblePageTwo; i++) {
    pageNumbersTwo.push(i);
  }
  const columnDataTableTwo = [
    {
      field: "serialNumber",
      headerName: "SNo",
      flex: 0,
      width: 100,
      hide: !columnVisibilityTwo.serialNumber,
      headerClassName: "bold-header",
      pinned: 'left',
      lockPinned: true,
    },

    {
      field: "module",
      headerName: "Module Name",
      flex: 0,
      width: 200,
      hide: !columnVisibilityTwo.module,
      headerClassName: "bold-header",
      pinned: 'left',
    },
    {
      field: "submodule",
      headerName: "Sub Module Name",
      flex: 0,
      width: 200,
      hide: !columnVisibilityTwo.submodule,
      headerClassName: "bold-header",
      pinned: 'left',
    },
    {
      field: "mainpage",
      headerName: "Main Page",
      flex: 0,
      width: 200,
      hide: !columnVisibilityTwo.mainpage,
      headerClassName: "bold-header",
    },
    {
      field: "subpage",
      headerName: "Sub Page",
      flex: 0,
      width: 200,
      hide: !columnVisibilityTwo.subpage,
      headerClassName: "bold-header",
    },
    {
      field: "subsubpage",
      headerName: "Sub Sub Page",
      flex: 0,
      width: 200,
      hide: !columnVisibilityTwo.subsubpage,
      headerClassName: "bold-header",
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 0,
      width: 150,
      minHeight: "40px !important",
      sortable: false,
      hide: !columnVisibilityTwo.actions,
      headerClassName: "bold-header",
      cellRenderer: (params) => (
        <Grid sx={{ display: "flex" }}>
          {isUserRoleCompare?.includes("vallpendingchecklist") && (
            <Button color="success" variant="contained" onClick={() => {
              showDataToTable(params.data);
              setTableCount(2);
            }}>
              {`VIEW (${params.data.count})`}
            </Button>

          )}
        </Grid>
      ),
    },
  ];

  const rowDataTableTwo = filteredDataTwo.map((item, index) => {
    return {
      id: index,
      serialNumber: item.serialNumber,
      module: item.modulename,
      submodule: item.submodule,
      mainpage: item.mainpage,
      subpage: item.subpage,
      subsubpage: item.subsubpage,
      uniquename: item.uniquename,
      count: item.count,
    };
  });

  //datatable....
  const handleSearchChangeTwo = (event) => {
    setSearchQueryTwo(event.target.value);
  };
  const gridRefTwo = useRef(null);
  // Show All Columns functionality
  const handleShowAllColumnsTwo = () => {
    const updatedVisibility = { ...columnVisibilityTwo };
    for (const columnKey in updatedVisibility) {
      updatedVisibility[columnKey] = true;
    }
    setColumnVisibilityTwo(updatedVisibility);
  };

  // // Function to filter columns based on search query
  const filteredColumnsTwo = columnDataTableTwo.filter((column) =>
    column.headerName.toLowerCase().includes(searchQueryManage.toLowerCase())
  );

  // Manage Columns functionality
  const toggleColumnVisibilityTwo = (field) => {
    setColumnVisibilityTwo((prevVisibility) => ({
      ...prevVisibility,
      [field]: !prevVisibility[field],
    }));
  };

  // JSX for the "Manage Columns" popover content
  const manageColumnsContentTwo = (
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
        onClick={handleCloseManageColumnsTwo}
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
          value={searchQueryManageTwo}
          onChange={(e) => setSearchQueryManageTwo(e.target.value)}
          sx={{ marginBottom: 5, position: "absolute" }}
        />
      </Box>
      <br />
      <br />
      <DialogContent
        sx={{ minWidth: "auto", height: "200px", position: "relative" }}
      >
        <List sx={{ overflow: "auto", height: "100%" }}>
          {filteredColumnsTwo.map((column) => (
            <ListItem key={column.field}>
              <ListItemText
                sx={{ display: "flex" }}
                primary={
                  <Switch
                    sx={{ marginTop: "-5px" }}
                    size="small"
                    checked={columnVisibilityTwo[column.field]}
                    onChange={() => toggleColumnVisibilityTwo(column.field)}
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
              onClick={() => setColumnVisibilityTwo(initialColumnVisibilityTwo)}
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
                columnDataTableTwo.forEach((column) => {
                  newColumnVisibility[column.field] = false; // Set hide property to true
                });
                setColumnVisibilityTwo(newColumnVisibility);
              }}
            >
              Hide All
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Box>
  );

  const [getDetails, setGetDetails] = useState();
  const [groupDetails, setGroupDetails] = useState();

  const getCode = async (details) => {
    setGetDetails(details);
    setPageName(!pageName);
    console.log(details)
    try {
      setGroupDetails(details?.groups);
      let forFillDetails = details?.groups?.map((data) => {
        if (data.checklist === "Date Multi Random Time") {
          if (data?.data && data?.data !== "") {
            const [date, time] = data?.data?.split(" ");
            return { date, time };
          }
        } else {
          return { date: "0", time: "0" };
        }
      });

      let forDateSpan = details?.groups?.map((data) => {
        if (data.checklist === "Date Multi Span") {
          if (data?.data && data?.data !== "") {
            const [fromdate, todate] = data?.data?.split(" ");
            return { fromdate, todate };
          }
        } else {
          return { fromdate: "0", todate: "0" };
        }
      });
      let forDateTime = details?.groups?.map((data) => {
        if (data.checklist === "DateTime") {
          if (data?.data && data?.data !== "") {
            const [date, time] = data?.data?.split(" ");
            return { date, time };
          }
        } else {
          return { date: "0", time: "0" };
        }
      });

      let forDateMultiSpanTime = details?.groups?.map((data) => {
        if (data.checklist === "Date Multi Span Time") {
          if (data?.data && data?.data !== "") {
            const [from, to] = data?.data?.split("/");
            const [fromdate, fromtime] = from?.split(" ");
            const [todate, totime] = to?.split(" ");
            return { fromdate, fromtime, todate, totime };
          }
        } else {
          return { fromdate: "0", fromtime: "0", todate: "0", totime: "0" };
        }
      });
      setDateValueMultiFrom(forDateSpan.map((item) => item?.fromdate));
      setDateValueMultiTo(forDateSpan.map((item) => item?.todate));
      setDateValueRandom(forFillDetails.map((item) => item?.date));
      setTimeValueRandom(forFillDetails.map((item) => item?.time));
      setDateValue(forDateTime.map((item) => item?.date));
      setTimeValue(forDateTime.map((item) => item?.time));
      setFirstDateValue(forDateMultiSpanTime.map((item) => item?.fromdate));
      setFirstTimeValue(forDateMultiSpanTime.map((item) => item?.fromtime));
      setSecondDateValue(forDateMultiSpanTime.map((item) => item?.todate));
      setSecondTimeValue(forDateMultiSpanTime.map((item) => item?.totime));
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
  };

  //Delete model
  const [isDeleteOpenalert, setIsDeleteOpenalert] = useState(false);
  const handleCloseModalert = () => {
    setIsDeleteOpenalert(false);
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
  const id = open ? "simple-popover" : undefined;

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
    mode: true,
    role: true,
    branch: true,
    fullname: true,
    mobile: true,
    email: true,
    dateofbirth: true,
    qualification: true,
    experience: true,
    skill: true,
    applieddate: true,
    actions: true,
    category: true,
    subcategory: true,
    checklist: true,
    updatestatus: true,

    name: true,
    empcode: true,
    company: true,
    branch: true,
    unit: true,
    team: true,
    approvedthrough: true,

    userstatus: true,
    companyname: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(
    initialColumnVisibility
  );

  // Edit model
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };

  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === "backdropClick") return;
    setIsEditOpen(false);

    setDateValueMultiFrom([]);
    setDateValueMultiTo([]);
    setDateValueRandom([]);
    setTimeValueRandom([]);
    setDateValue([]);
    setTimeValue([]);
    setFirstDateValue([]);
    setFirstTimeValue([]);
    setSecondDateValue([]);
    setSecondTimeValue([]);
    setGroupDetails([]);
  };

  const [fromWhere, setFromWhere] = useState("");
  const showDataToTable = async (datas) => {
    console.log(datas, "datas");
    setBankdetail(false);
    setPageName(!pageName);
    const accessbranch = isUserRoleAccess?.role?.includes("Manager")
      ? isAssignBranch?.map((data) => ({
        branch: data.branch,
        company: data.company,
        unit: data.unit,
      }))
      : isAssignBranch
        ?.filter((data) => {
          let fetfinalurl = [];

          if (
            data?.modulenameurl?.length !== 0 &&
            data?.submodulenameurl?.length !== 0 &&
            data?.mainpagenameurl?.length !== 0 &&
            data?.subpagenameurl?.length !== 0 &&
            data?.subsubpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
          ) {
            fetfinalurl = data.subsubpagenameurl;
          } else if (
            data?.modulenameurl?.length !== 0 &&
            data?.submodulenameurl?.length !== 0 &&
            data?.mainpagenameurl?.length !== 0 &&
            data?.subpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
          ) {
            fetfinalurl = data.subpagenameurl;
          } else if (
            data?.modulenameurl?.length !== 0 &&
            data?.submodulenameurl?.length !== 0 &&
            data?.mainpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
          ) {
            fetfinalurl = data.mainpagenameurl;
          } else if (
            data?.modulenameurl?.length !== 0 &&
            data?.submodulenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
          ) {
            fetfinalurl = data.submodulenameurl;
          } else if (data?.modulenameurl?.length !== 0) {
            fetfinalurl = data.modulenameurl;
          } else {
            fetfinalurl = [];
          }

          const remove = [
            window.location.pathname?.substring(1),
            window.location.pathname,
          ];
          return fetfinalurl?.some((item) => remove?.includes(item));
        })
        ?.map((data) => ({
          branch: data.branch,
          company: data.company,
          unit: data.unit,
        }));
    try {
      const [resChecklist] = await Promise.all([
        axios.get(SERVICE.MYCHECKLIST),
      ]);

      // Extracting data from responses
      const gotDatas = resChecklist?.data?.mychecklist;
      const employees = allUsersData;
      if (
        datas.module == "Human Resources" &&
        datas.submodule == "Recruitment" &&
        datas.mainpage == "Job Openings"
      ) {
        setFromWhere("jobopening");

        let res = await axios.post(
          SERVICE.PENDINGINTERVIEWCHECKLIST,
          {
            assignbranch: accessbranch,
          },
          { headers: { Authorization: `Bearer ${auth.APIToken}` } }
        );
        setCandidates(res?.data?.derivedDatas);
      } else if (
        datas.module == "Leave&Permission" &&
        datas.submodule == "Leave" &&
        datas.mainpage == "Apply Leave"
      ) {
        setFromWhere("applyleave");

        let res = await axios.post(
          SERVICE.PENDINGINTERVIEWCHECKLISTLEAVE,
          {
            assignbranch: accessbranch,
          },
          { headers: { Authorization: `Bearer ${auth.APIToken}` } }
        );
        setCandidates(res?.data?.derivedDatas);
      } else if (
        datas.module == "Leave&Permission" &&
        datas.submodule == "Permission" &&
        datas.mainpage == "Apply Permission"
      ) {
        setFromWhere("applypermission");

        let res = await axios.post(
          SERVICE.PENDINGINTERVIEWCHECKLISTPERMISSION,
          {
            assignbranch: accessbranch,
          },
          { headers: { Authorization: `Bearer ${auth.APIToken}` } }
        );
        setCandidates(res?.data?.derivedDatas);
      }
      //---------------------------------------------------------------
      else if (
        datas.module == "Human Resources" &&
        datas.submodule == "HR" &&
        datas.mainpage == "Employee" &&
        datas.subpage == "Employee Action Details" &&
        datas.subsubpage == "Deactivate Employees List"
      ) {
        setFromWhere("deactivateemployeelist");

        let completedCheckList = gotDatas
          ?.filter((data) => {
            let checkFirst = data?.status?.toLowerCase() !== "completed";
            let check = data?.groups?.some((item) => {
              if (item.checklist === "Attachments") {
                return item.files === undefined || item.files === "";
              } else {
                return item.data === undefined || item.data === "";
              }
            });
            return checkFirst && check;
          })
          .filter(
            (datas) =>
              datas.module == "Human Resources" &&
              datas.submodule == "HR" &&
              datas.mainpage == "Employee" &&
              datas.subpage == "Employee Action Details" &&
              datas.subsubpage == "Deactivate Employees List"
          );

        setCandidates(completedCheckList);
      } else if (
        datas.module == "Human Resources" &&
        datas.submodule == "HR" &&
        datas.mainpage == "Employee" &&
        datas.subpage == "Employee Action Details" &&
        datas.subsubpage == "Action Employee List"
      ) {
        setFromWhere("activeemployeelist");

        let completedCheckList = gotDatas
          ?.filter((data) => {
            let checkFirst = data?.status?.toLowerCase() !== "completed";
            let check = data?.groups?.some((item) => {
              if (item.checklist === "Attachments") {
                return item.files === undefined || item.files === "";
              } else {
                return item.data === undefined || item.data === "";
              }
            });
            return checkFirst && check;
          })
          .filter(
            (datas) =>
              datas.module == "Human Resources" &&
              datas.submodule == "HR" &&
              datas.mainpage == "Employee" &&
              datas.subpage == "Employee Action Details" &&
              datas.subsubpage == "Action Employee List"
          );

        setCandidates(completedCheckList);
      } else if (
        datas.module == "Human Resources" &&
        datas.submodule == "HR" &&
        datas.mainpage == "Employee" &&
        datas.subpage == "Employee Action Details" &&
        datas.subsubpage == "Rejoined Employee List"
      ) {
        setFromWhere("rejoinedemployeelist");

        let completedCheckList = gotDatas
          ?.filter((data) => {
            let checkFirst = data?.status?.toLowerCase() !== "completed";
            let check = data?.groups?.some((item) => {
              if (item.checklist === "Attachments") {
                return item.files === undefined || item.files === "";
              } else {
                return item.data === undefined || item.data === "";
              }
            });
            return checkFirst && check;
          })
          .filter(
            (datas) =>
              datas.module == "Human Resources" &&
              datas.submodule == "HR" &&
              datas.mainpage == "Employee" &&
              datas.subpage == "Employee Action Details" &&
              datas.subsubpage == "Rejoined Employee List"
          );

        setCandidates(completedCheckList);
      } else if (
        datas.module == "Human Resources" &&
        datas.submodule == "HR" &&
        datas.mainpage == "Employee" &&
        datas.subpage == "Intern details" &&
        datas.subsubpage == "Deactivate Intern List"
      ) {
        setFromWhere("deactivateinternlist");

        let completedCheckList = gotDatas
          ?.filter((data) => {
            let checkFirst = data?.status?.toLowerCase() !== "completed";
            let check = data?.groups?.some((item) => {
              if (item.checklist === "Attachments") {
                return item.files === undefined || item.files === "";
              } else {
                return item.data === undefined || item.data === "";
              }
            });
            return checkFirst && check;
          })
          .filter(
            (datas) =>
              datas.module == "Human Resources" &&
              datas.submodule == "HR" &&
              datas.mainpage == "Employee" &&
              datas.subpage == "Intern details" &&
              datas.subsubpage == "Deactivate Intern List"
          );

        setCandidates(completedCheckList);
      } else if (
        datas.module == "Human Resources" &&
        datas.submodule == "HR" &&
        datas.mainpage == "Employee" &&
        datas.subpage == "Intern details" &&
        datas.subsubpage == "Active Intern List"
      ) {
        setFromWhere("activeinternlist");

        let completedCheckList = gotDatas
          ?.filter((data) => {
            let checkFirst = data?.status?.toLowerCase() !== "completed";
            let check = data?.groups?.some((item) => {
              if (item.checklist === "Attachments") {
                return item.files === undefined || item.files === "";
              } else {
                return item.data === undefined || item.data === "";
              }
            });
            return checkFirst && check;
          })
          .filter(
            (datas) =>
              datas.module == "Human Resources" &&
              datas.submodule == "HR" &&
              datas.mainpage == "Employee" &&
              datas.subpage == "Intern details" &&
              datas.subsubpage == "Active Intern List"
          );

        setCandidates(completedCheckList);
      } else if (
        datas.module == "Human Resources" &&
        datas.submodule == "HR" &&
        datas.mainpage == "Employee" &&
        datas.subpage == "Notice Period" &&
        datas.subsubpage == "Exit List"
      ) {
        setFromWhere("exitlist");

        let completedCheckList = gotDatas
          ?.filter((data) => {
            let checkFirst = data?.status?.toLowerCase() !== "completed";
            let check = data?.groups?.some((item) => {
              if (item.checklist === "Attachments") {
                return item.files === undefined || item.files === "";
              } else {
                return item.data === undefined || item.data === "";
              }
            });
            return checkFirst && check;
          })
          .filter(
            (datas) =>
              datas.module == "Human Resources" &&
              datas.submodule == "HR" &&
              datas.mainpage == "Employee" &&
              datas.subpage == "Notice Period" &&
              datas.subsubpage == "Exit List"
          );

        setCandidates(completedCheckList);
      } else if (
        datas.module == "Human Resources" &&
        datas.submodule == "HR" &&
        datas.mainpage == "Employee" &&
        datas.subpage == "Employee Status Details" &&
        datas.subsubpage == "Long Absent Restriction List"
      ) {
        setFromWhere("longabsentlongleaverestrcitionlist");

        let res = await axios.post(
          SERVICE.PENDINGLONGABSENTCHECKLIST,
          {
            assignbranch: accessbranch,
          },
          { headers: { Authorization: `Bearer ${auth.APIToken}` } }
        );
        setCandidates(res?.data?.derivedDatas);
      }
      setBankdetail(true);
    } catch (err) {
      console.log(err);
      setBankdetail(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //get all employees list details
  const fetchUnassignedCandidates = async () => {
    setTableThree(false);
    setPageName(!pageName);
    const accessbranch = isUserRoleAccess?.role?.includes("Manager")
      ? isAssignBranch?.map((data) => ({
        branch: data.branch,
        company: data.company,
        unit: data.unit,
      }))
      : isAssignBranch
        ?.filter((data) => {
          let fetfinalurl = [];

          if (
            data?.modulenameurl?.length !== 0 &&
            data?.submodulenameurl?.length !== 0 &&
            data?.mainpagenameurl?.length !== 0 &&
            data?.subpagenameurl?.length !== 0 &&
            data?.subsubpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
          ) {
            fetfinalurl = data.subsubpagenameurl;
          } else if (
            data?.modulenameurl?.length !== 0 &&
            data?.submodulenameurl?.length !== 0 &&
            data?.mainpagenameurl?.length !== 0 &&
            data?.subpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
          ) {
            fetfinalurl = data.subpagenameurl;
          } else if (
            data?.modulenameurl?.length !== 0 &&
            data?.submodulenameurl?.length !== 0 &&
            data?.mainpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
          ) {
            fetfinalurl = data.mainpagenameurl;
          } else if (
            data?.modulenameurl?.length !== 0 &&
            data?.submodulenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
          ) {
            fetfinalurl = data.submodulenameurl;
          } else if (data?.modulenameurl?.length !== 0) {
            fetfinalurl = data.modulenameurl;
          } else {
            fetfinalurl = [];
          }

          const remove = [
            window.location.pathname?.substring(1),
            window.location.pathname,
          ];
          return fetfinalurl?.some((item) => remove?.includes(item));
        })
        ?.map((data) => ({
          branch: data.branch,
          company: data.company,
          unit: data.unit,
        }));

    try {
      const [myCheckList, res, res1, res2, res3] = await Promise.all([
        axios.get(SERVICE.MYCHECKLIST, {
          headers: { Authorization: `Bearer ${auth.APIToken}` },
        }),
        axios.post(
          SERVICE.PENDINGINTERVIEWCHECKLIST,
          {
            assignbranch: accessbranch,
          },
          { headers: { Authorization: `Bearer ${auth.APIToken}` } }
        ),
        axios.post(
          SERVICE.PENDINGINTERVIEWCHECKLISTLEAVE,
          {
            assignbranch: accessbranch,
          },
          { headers: { Authorization: `Bearer ${auth.APIToken}` } }
        ),
        axios.post(
          SERVICE.PENDINGINTERVIEWCHECKLISTPERMISSION,
          {
            assignbranch: accessbranch,
          },
          { headers: { Authorization: `Bearer ${auth.APIToken}` } }
        ),
        axios.post(
          SERVICE.PENDINGLONGABSENTCHECKLIST,
          {
            assignbranch: accessbranch,
          },
          { headers: { Authorization: `Bearer ${auth.APIToken}` } }
        ),
      ]);

      let myCheckListData = myCheckList?.data?.mychecklist.map((item) => {
        return {
          ...item,
          uniquename: `${item.module}_${item.submodule}_${item.mainpage}_${item.subpage}_${item.subsubpage}`,
        };
      });

      function countUniqueCombinationsNew(data) {
        const counts = {};
        let uniqueArray = [];
        data.forEach((item) => {
          const key = `${item.module}_${item.submodule}_${item.mainpage}_${item.subpage}_${item.subsubpage}`;
          if (!uniqueArray.includes(key)) {
            uniqueArray.push(key);
          }
          counts[key] = (counts[key] || 0) + 1;
        });
        const result = Object.keys(counts).map((key) => {
          const [modulename, submodule, mainpage, subpage, subsubpage] =
            key.split("_");
          return {
            modulename,
            submodule,
            mainpage,
            subpage,
            subsubpage,
            uniquename: `${modulename}_${submodule}_${mainpage}_${subpage}_${subsubpage}`,
            count: counts[key],
          };
        });

        let updatedArray = result.map((data, index) => {
          let foundDatas = myCheckListData.filter((item) => {
            return item.uniquename == data.uniquename;
          });

          if (foundDatas) {
            return {
              ...data,
              relatedDatas: foundDatas,
              _id: index,
            };
          }
        });

        return { result, uniqueArray, updatedArray };
      }

      let showValuesNew = countUniqueCombinationsNew(myCheckListData);

      let countMaking = showValuesNew?.result?.map((data) => {
        let foundData = showValuesNew?.updatedArray?.find(
          (item) => item.uniquename === data.uniquename
        );
        let count = foundData?.relatedDatas?.filter((item) => {
          let checkFirst = item?.status?.toLowerCase() !== "completed";
          let check = item?.groups?.some((itemNew) => {
            if (itemNew.checklist === "Attachments") {
              return itemNew.files === undefined || itemNew.files === "";
            } else {
              return itemNew.data === undefined || itemNew.data === "";
            }
          });
          return checkFirst && check;
        }).length;
        return {
          ...data,
          count:
            data?.mainpage === "Job Openings"
              ? res?.data?.derivedDatas?.length
              : data?.mainpage === "Apply Leave"
                ? res1?.data?.derivedDatas?.length
                : data?.mainpage === "Apply Permission"
                  ? res2?.data?.derivedDatas?.length
                  : data?.subsubpage === "Long Absent Restriction List"
                    ? res3?.data?.derivedDatas?.length
                    : count,
        };
      });
      setTableTwoDatas(countMaking);
      setOverallItemsTwo(countMaking)
      setSourceDatas(showValuesNew?.updatedArray);
      setBankdetail(true);
      setTableThree(true);
    } catch (err) {
      console.log(err);
      setTableThree(true);
      setBankdetail(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
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


  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };

  //  PDF
  let columns;
  switch (fromWhere) {
    case "jobopening":
      columns = [
        { title: "Company", field: "company" },
        { title: "Branch", field: "branch" },
        { title: "Name", field: "fullname" },
        { title: "Contact Number", field: "mobile" },
        { title: "Email", field: "email" },
        { title: "Status", field: "updatestatus" },
        { title: "Category", field: "category" },
        { title: "Sub Category", field: "subcategory" },
      ];
      break;
    case "applyleave":
      columns = [
        { title: "Name", field: "fullname" },
        { title: "Status", field: "updatestatus" },
        { title: "Category", field: "category" },
        { title: "Sub Category", field: "subcategory" },
      ];
      break;
    case "applypermission":
      columns = [
        { title: "Name", field: "fullname" },
        { title: "Status", field: "updatestatus" },
        { title: "Category", field: "category" },
        { title: "Sub Category", field: "subcategory" },
      ];
      break;
    case "deactivateemployeelist":
      columns = [
        { title: "Applicant Name", field: "fullname" },
        { title: "Status", field: "updatestatus" },
        { title: "Category", field: "category" },
        { title: "Sub Category", field: "subcategory" },
      ];
      break;
    case "activeemployeelist":
      columns = [
        { title: "Applicant Name", field: "fullname" },
        { title: "Status", field: "updatestatus" },
        { title: "Category", field: "category" },
        { title: "Sub Category", field: "subcategory" },
      ];
      break;
    case "rejoinedemployeelist":
      columns = [
        { title: "Applicant Name", field: "fullname" },
        { title: "Status", field: "updatestatus" },
        { title: "Category", field: "category" },
        { title: "Sub Category", field: "subcategory" },
      ];
      break;
    case "activeinternlist":
      columns = [
        { title: "Applicant Name", field: "fullname" },
        { title: "Status", field: "updatestatus" },
        { title: "Category", field: "category" },
        { title: "Sub Category", field: "subcategory" },
      ];
      break;
    case "deactivateinternlist":
      columns = [
        { title: "Applicant Name", field: "fullname" },
        { title: "Status", field: "updatestatus" },
        { title: "Category", field: "category" },
        { title: "Sub Category", field: "subcategory" },
      ];
      break;
    case "exitlist":
      columns = [
        { title: "Employee Name", field: "fullname" },
        { title: "Status", field: "approvedthrough" },
        { title: "Category", field: "category" },
        { title: "Sub Category", field: "subcategory" },
      ];
      break;
    case "longabsentlongleaverestrcitionlist":
      columns = [
        { title: "Employee Status", field: "userstatus" },
        { title: "Employee Name", field: "companyname" },
        { title: "Emp Code", field: "empcode" },
        { title: "Company", field: "company" },
        { title: "Branch", field: "branch" },
        { title: "Unit", field: "unit" },
        { title: "Team", field: "team" },
        { title: "Status", field: "updatestatus" },

        { title: "Category", field: "category" },
        { title: "Sub Category", field: "subcategory" },
      ];
      break;
  }

  //------------------------------------------------------

  const [isFilterOpenNew, setIsFilterOpenNew] = useState(false);
  const [isPdfFilterOpenNew, setIsPdfFilterOpenNew] = useState(false);

  // page refersh reload
  const handleCloseFilterModNew = () => {
    setIsFilterOpenNew(false);
  };

  const handleClosePdfFilterModNew = () => {
    setIsPdfFilterOpenNew(false);
  };

  const [fileFormatNew, setFormatNew] = useState("xl");
  const fileTypeNew =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtensionNew = fileFormatNew === "xl" ? ".xlsx" : ".csv";

  const exportToExcelNew = (excelData, fileName) => {
    setPageName(!pageName);
    try {
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      // Check if the browser supports Blob and FileSaver
      if (!Blob || !FileSaver) {
        console.error("Blob or FileSaver not supported");
        return;
      }

      const data = new Blob([excelBuffer], { type: fileTypeNew });

      // Check if FileSaver.saveAs is available
      if (!FileSaver.saveAs) {
        console.error("FileSaver.saveAs is not available");
        return;
      }

      FileSaver.saveAs(data, fileName + fileExtensionNew);
    } catch (error) {
      console.error("Error exporting to Excel", error);
    }
  };

  const formatDataNew = (data) => {
    return data.map((item, index) => {
      if (fromWhere == "jobopening") {
        return {
          Sno: index + 1,
          Company: item.company,
          Branch: item.branch,
          Name: item.fullname,
          "Contact Number": item.mobile,
          Email: item.email,
          Status: item.updatestatus,
          Category: item.category,
          "Sub Category": item.subcategory,
        };
      } else if (fromWhere == "applyleave") {
        // let dateShown = item.date.map((data)=>moment(data).format('DD-MM-YYYY'))
        return {
          Sno: index + 1,

          Name: item.fullname,
          Status: item.updatestatus,
          Category: item.category,
          "Sub Category": item.subcategory,
        };
      } else if (fromWhere == "applypermission") {
        return {
          Sno: index + 1,

          Name: item.fullname,
          Status: item.updatestatus,
          Category: item.category,
          "Sub Category": item.subcategory,
        };
      } else if (fromWhere == "deactivateemployeelist") {
        return {
          Sno: index + 1,

          Name: item.fullname,
          Status: item.updatestatus,
          Category: item.category,
          "Sub Category": item.subcategory,
        };
      } else if (
        fromWhere == "activeemployeelist" ||
        fromWhere === "rejoinedemployeelist"
      ) {
        return {
          Sno: index + 1,

          Name: item.fullname,
          Status: item.updatestatus,
          Category: item.category,
          "Sub Category": item.subcategory,
        };
      } else if (fromWhere == "activeinternlist") {
        return {
          Sno: index + 1,

          Name: item.fullname,
          Status: item.updatestatus,
          Category: item.category,
          "Sub Category": item.subcategory,
        };
      } else if (fromWhere == "deactivateinternlist") {
        return {
          Sno: index + 1,

          Name: item.fullname,
          Status: item.updatestatus,
          Category: item.category,
          "Sub Category": item.subcategory,
        };
      } else if (fromWhere == "exitlist") {
        return {
          Sno: index + 1,

          "Employee Name": item.fullname,
          Status: item.approvedthrough,
          Category: item.category,
          "Sub Category": item.subcategory,
        };
      } else if (fromWhere == "longabsentlongleaverestrcitionlist") {
        return {
          Sno: index + 1,

          "Employee Status": item.userstatus,
          "Employee Name": item.companyname,
          "Employee Code": item.empcode,
          Company: item.company,
          Branch: item.branch,
          Unit: item.unit,
          Team: item.team,
          Status: item.updatestatus,
          Category: item.category,
          "Sub Category": item.subcategory,
        };
      }
    });
  };

  const handleExportXLNew = (isfilter) => {
    const dataToExport = isfilter === "filtered" ? (filteredChanges !== null ? filteredRowData : filteredData) : items;

    if (!dataToExport || dataToExport.length === 0) {
      console.error("No data available to export");
      return;
    }

    exportToExcelNew(formatDataNew(dataToExport), "All Pending Check List");
    setIsFilterOpenNew(false);
  };

  const downloadPdfNew = (isfilter) => {
    const doc = new jsPDF();
    const columnsWithSerial = [
      { title: "S.No", dataKey: "serialNumber" }, // Serial number column
      ...columns.map((col) => ({ title: col.title, dataKey: col.field })),
    ];

    let itemsNewone = filteredChanges !== null ? filteredRowData : filteredData
    // Modify row data to include serial number
    const dataWithSerial =
      isfilter === "filtered"
        ? itemsNewone.map((t, index) => ({
          ...t,
          serialNumber: index + 1,
        }))
        : items?.map((item, index) => ({
          ...item,
          serialNumber: index + 1,
        }));

    // Generate PDF
    doc.autoTable({
      theme: "grid",
      columns: columnsWithSerial,
      body: dataWithSerial,
      styles: { fontSize: 5 },
    });

    doc.save("All Pending Check List.pdf");
  };

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "All Pending Check List",
    pageStyle: "print",
  });

  useEffect(() => {
    fetchUnassignedCandidates();
  }, []);

  //table entries ..,.
  const [items, setItems] = useState([]);

  const addSerialNumber = (datas) => {
    const itemsWithSerialNumber = datas?.map((item, index) => {


      if (fromWhere == "jobopening") {
        return {
          id: index,
          serialNumber: index + 1,
          fullname: item?.fullname,
          mobile: item?.mobile,
          email: item?.email,
          category: item?.category?.join(","),
          subcategory: item?.subcategory?.join(","),

          company: item?.company,
          branch: item?.branch,
          city: item?.city,
          groups: item?.groups?.filter((itemNew) => {
            if (itemNew.checklist === "Attachments") {
              return itemNew.files === undefined || itemNew.files === "";
            } else {
              return itemNew.data === undefined || itemNew.data === "";
            }
          }),
          updatestatus: "Pending",
        };
      } else if (fromWhere == "applyleave") {
        return {
          id: item?._id,
          serialNumber: index + 1,
          role: item?.role,
          fullname: item?.employeename,
          empcode: item?.employeeid,
          applieddate: Array.isArray(item?.date)
            ? item?.date?.join(",")
            : item?.date,
          category: item?.category?.join(","),
          subcategory: item?.subcategory?.join(","),
          checklist: item?.details,
          mobile: item?.contactpersonal,
          email: item?.email,
          username: "N/A",
          password: "N/A",
          firstname: item?.employeename,
          lastname: item?.employeename,
          adharnumber: "N/A",
          pannumber: "N/A",
          dateofbirth: "N/A",
          address: "N/A",
          groups: item?.groups?.filter((itemNew) => {
            if (itemNew.checklist === "Attachments") {
              return itemNew.files === undefined || itemNew.files === "";
            } else {
              return itemNew.data === undefined || itemNew.data === "";
            }
          }),
          information: item?.information,
          updatestatus: "Pending",
        };
      } else if (fromWhere == "applypermission") {
        return {
          id: item?._id,
          serialNumber: index + 1,
          role: item?.role,
          fullname: item?.employeename,
          empcode: item?.employeeid,
          applieddate: moment(item?.date).format("DD-MM-YYYY"),
          category: item?.category?.join(","),
          subcategory: item?.subcategory?.join(","),
          checklist: item?.details,

          username: "N/A",
          password: "N/A",
          email: "N/A",
          mobile: "N/A",
          firstname: item?.employeename,
          lastname: item?.employeename,
          adharnumber: "N/A",
          pannumber: "N/A",
          dateofbirth: "N/A",
          address: "N/A",
          groups: item?.groups?.filter((itemNew) => {
            if (itemNew.checklist === "Attachments") {
              return itemNew.files === undefined || itemNew.files === "";
            } else {
              return itemNew.data === undefined || itemNew.data === "";
            }
          }),
          information: item?.information,
          updatestatus: "Pending",
          mobile: item?.contactpersonal,
          email: item?.email,
        };
      } else if (fromWhere == "deactivateemployeelist") {
        return {
          id: item?._id,
          serialNumber: index + 1,
          role: item?.role,
          fullname: item?.candidatename,
          empcode: item?.employeeid,
          applieddate: moment(item?.date).format("DD-MM-YYYY"),
          category: item?.category?.join(","),
          subcategory: item?.subcategory.join(","),
          checklist: item?.details,

          username: "N/A",
          password: "N/A",
          email: "N/A",
          mobile: "N/A",
          firstname: item?.employeename,
          lastname: item?.employeename,
          adharnumber: "N/A",
          pannumber: "N/A",
          dateofbirth: "N/A",
          address: "N/A",
          groups: item?.groups?.filter((itemNew) => {
            if (itemNew.checklist === "Attachments") {
              return itemNew.files === undefined || itemNew.files === "";
            } else {
              return itemNew.data === undefined || itemNew.data === "";
            }
          }),
          information: item?.information,
          updatestatus: "Pending",
          mobile: item?.contactpersonal,
          email: item?.email,
        };
      } else if (fromWhere == "activeemployeelist") {
        return {
          id: item?._id,
          serialNumber: index + 1,
          role: item?.role,
          fullname: item?.candidatename,
          empcode: item?.employeeid,
          applieddate: moment(item?.date).format("DD-MM-YYYY"),
          category: item?.category?.join(","),
          subcategory: item?.subcategory.join(","),
          checklist: item?.details,

          username: "N/A",
          password: "N/A",
          email: "N/A",
          mobile: "N/A",
          firstname: item?.employeename,
          lastname: item?.employeename,
          adharnumber: "N/A",
          pannumber: "N/A",
          dateofbirth: "N/A",
          address: "N/A",
          groups: item?.groups?.filter((itemNew) => {
            if (itemNew.checklist === "Attachments") {
              return itemNew.files === undefined || itemNew.files === "";
            } else {
              return itemNew.data === undefined || itemNew.data === "";
            }
          }),
          information: item?.information,
          updatestatus: "Pending",
          mobile: item?.contactpersonal,
          email: item?.email,
        };
      } else if (fromWhere == "rejoinedemployeelist") {
        return {
          id: item?._id,
          serialNumber: index + 1,
          role: item?.role,
          fullname: item?.candidatename,
          empcode: item?.employeeid,
          applieddate: moment(item?.date).format("DD-MM-YYYY"),
          category: item?.category?.join(","),
          subcategory: item?.subcategory.join(","),
          checklist: item?.details,

          username: "N/A",
          password: "N/A",
          email: "N/A",
          mobile: "N/A",
          firstname: item?.employeename,
          lastname: item?.employeename,
          adharnumber: "N/A",
          pannumber: "N/A",
          dateofbirth: "N/A",
          address: "N/A",
          groups: item?.groups?.filter((itemNew) => {
            if (itemNew.checklist === "Attachments") {
              return itemNew.files === undefined || itemNew.files === "";
            } else {
              return itemNew.data === undefined || itemNew.data === "";
            }
          }),
          information: item?.information,
          updatestatus: "Pending",
          mobile: item?.contactpersonal,
          email: item?.email,
        };
      } else if (fromWhere == "activeinternlist") {
        return {
          id: item?._id,
          serialNumber: index + 1,
          role: item?.role,
          fullname: item?.candidatename,
          empcode: item?.employeeid,
          applieddate: moment(item?.date).format("DD-MM-YYYY"),
          category: item?.category?.join(","),
          subcategory: item?.subcategory.join(","),
          checklist: item?.details,

          username: "N/A",
          password: "N/A",
          email: "N/A",
          mobile: "N/A",
          firstname: item?.employeename,
          lastname: item?.employeename,
          adharnumber: "N/A",
          pannumber: "N/A",
          dateofbirth: "N/A",
          address: "N/A",
          groups: item?.groups?.filter((itemNew) => {
            if (itemNew.checklist === "Attachments") {
              return itemNew.files === undefined || itemNew.files === "";
            } else {
              return itemNew.data === undefined || itemNew.data === "";
            }
          }),
          information: item?.information,
          updatestatus: "Pending",
          mobile: item?.contactpersonal,
          email: item?.email,
        };
      } else if (fromWhere == "deactivateinternlist") {
        return {
          id: item?._id,
          serialNumber: index + 1,
          role: item?.role,
          fullname: item?.candidatename,
          empcode: item?.employeeid,
          applieddate: moment(item?.date).format("DD-MM-YYYY"),
          category: item?.category?.join(","),
          subcategory: item?.subcategory.join(","),
          checklist: item?.details,

          username: "N/A",
          password: "N/A",
          email: "N/A",
          mobile: "N/A",
          firstname: item?.employeename,
          lastname: item?.employeename,
          adharnumber: "N/A",
          pannumber: "N/A",
          dateofbirth: "N/A",
          address: "N/A",
          groups: item?.groups?.filter((itemNew) => {
            if (itemNew.checklist === "Attachments") {
              return itemNew.files === undefined || itemNew.files === "";
            } else {
              return itemNew.data === undefined || itemNew.data === "";
            }
          }),
          information: item?.information,
          updatestatus: "Pending",
          mobile: item?.contactpersonal,
          email: item?.email,
        };
      } else if (fromWhere == "exitlist") {
        return {
          id: item?._id,
          serialNumber: index + 1,
          role: item?.role,
          fullname: item?.candidatename,
          empcode: item?.empcode,
          noticedate: moment(item?.noticedate).format("DD-MM-YYYY"),
          category: item?.category?.join(","),
          subcategory: item?.subcategory.join(","),
          checklist: item?.details,

          approvedthrough: item?.approvedthrough,
          company: item?.company,
          branch: item?.branch,
          unit: item?.unit,
          team: item?.team,

          username: "N/A",
          password: "N/A",
          email: "N/A",
          mobile: "N/A",
          firstname: item?.employeename,
          lastname: item?.employeename,
          adharnumber: "N/A",
          pannumber: "N/A",
          dateofbirth: "N/A",
          address: "N/A",
          groups: item?.groups?.filter((itemNew) => {
            if (itemNew.checklist === "Attachments") {
              return itemNew.files === undefined || itemNew.files === "";
            } else {
              return itemNew.data === undefined || itemNew.data === "";
            }
          }),
          information: item?.information,
          updatestatus: "Pending",
          mobile: item?.contactpersonal,
          email: item?.email,
        };
      } else if (fromWhere == "longabsentlongleaverestrcitionlist") {
        return {
          id: item?._id,
          serialNumber: index + 1,
          userstatus: item?.userstatus,
          companyname: item.companyname,
          fullname: item?.companyname,
          empcode: item.empcode,
          company: item.company,
          branch: item.branch,
          unit: item.unit,
          team: item.team,
          category: item?.category?.join(","),
          subcategory: item?.subcategory.join(","),

          groups: item?.groups?.filter((itemNew) => {
            if (itemNew.checklist === "Attachments") {
              return itemNew.files === undefined || itemNew.files === "";
            } else {
              return itemNew.data === undefined || itemNew.data === "";
            }
          }),
          information: item?.information,
          mobile: item?.contactpersonal,
          checklist: item?.details,
          email: item?.email,
          updatestatus: "Pending",
          assignedtime: moment(item?.assignedtime)?.format(
            "DD-MM-YYYY hh:mm:ss A"
          ),
          username: item?.username,
          password: item?.originalpassword,
          firstname: item?.firstname,
          lastname: item?.lastname,
          adharnumber: item?.aadhar,
          pannumber: item?.panno,
          dateofbirth: item?.dob,
          address: `${item?.pstreet}, ${item?.pcity}, ${item?.ppincode}, ${item?.pstate}, ${item?.pcountry}`,
        };
      }
    });
    setItems(itemsWithSerialNumber);
    setOverallItems(itemsWithSerialNumber);
  };

  useEffect(() => {
    addSerialNumber(candidates);
  }, [candidates]);

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

  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }

  let columnDataTable;

  const renderStatus = (status) => {
    const iconProps = {
      size: "small",
      style: { marginRight: 4 },
    };

    let icon = <InfoIcon {...iconProps} />;
    let color = "#ccc"; // Default color

    switch (status) {
      case "Long Leave":
        icon = <PauseCircleOutlineIcon {...iconProps} />;
        color = "#1976d2"; // Blue
        break;
      case "Long Absent":
        icon = <ErrorIcon {...iconProps} />;
        color = "#f44336"; // Red
        break;
      default:
        icon = <InfoIcon {...iconProps} />;
        color = "#ccc"; // Default gray
    }

    return (
      <Tooltip title={status} arrow>
        <Button
          variant="contained"
          startIcon={icon}
          sx={{
            fontSize: "0.75rem",
            padding: "2px 6px",
            cursor: "default",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "150px",
            minWidth: "100px",
            display: "flex",
            justifyContent: "flex-start",
            backgroundColor: color,
            "&:hover": {
              backgroundColor: color,
              overflow: "visible",
              whiteSpace: "normal",
              maxWidth: "none",
            },
          }}
          disableElevation
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              lineHeight: 1.2,
            }}
          >
            {status}
          </Typography>
        </Button>
      </Tooltip>
    );
  };

  switch (fromWhere) {
    case "jobopening":
      columnDataTable = [
        {
          field: "serialNumber",
          headerName: "SNo",
          flex: 0,
          width: 50,
          hide: !columnVisibility.serialNumber,
          headerClassName: "bold-header",
          pinned: 'left',
          lockPinned: true,
        },
        {
          field: "company",
          headerName: "Company",
          flex: 0,
          width: 150,
          hide: !columnVisibility.company,
          headerClassName: "bold-header",
          pinned: 'left',

        },
        {
          field: "branch",
          headerName: "Branch",
          flex: 0,
          width: 150,
          hide: !columnVisibility.branch,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        {
          field: "fullname",
          headerName: "Name",
          flex: 0,
          width: 150,
          hide: !columnVisibility.fullname,
          headerClassName: "bold-header",
        },

        {
          field: "mobile",
          headerName: "Contact No",
          flex: 0,
          width: 100,
          hide: !columnVisibility.mobile,
          headerClassName: "bold-header",
        },
        {
          field: "email",
          headerName: "Email",
          flex: 0,
          width: 100,
          hide: !columnVisibility.email,
          headerClassName: "bold-header",
        },
        {
          field: "updatestatus",
          headerName: "Status",
          flex: 0,
          width: 150,
          hide: !columnVisibility.updatestatus,
          headerClassName: "bold-header",
        },
        {
          field: "category",
          headerName: "Category",
          flex: 0,
          width: 100,
          hide: !columnVisibility.category,
          headerClassName: "bold-header",
        },
        {
          field: "subcategory",
          headerName: "Sub Category",
          flex: 0,
          width: 150,
          hide: !columnVisibility.subcategory,
          headerClassName: "bold-header",
        },
        {
          field: "mode",
          headerName: "Mode",
          flex: 0,
          width: 180,
          minHeight: "40px !important",
          sortable: false,
          hide: !columnVisibility.mode,
          headerClassName: "bold-header",
          // Assign Bank Detail
          cellRenderer: (params) => {
            return (
              <Grid sx={{ display: "flex", justifyContent: "center" }}>
                <>
                  {isUserRoleCompare?.includes("eallpendingchecklist") && (
                    <Button color="success" variant="contained" onClick={() => {

                      getCode(params.data);
                      handleClickOpenEdit();
                    }}>
                      VIEW
                    </Button>

                  )}
                </>
              </Grid>
            );
          },
        },
      ];

      break;
    case "applyleave":
      columnDataTable = [
        {
          field: "serialNumber",
          headerName: "SNo",
          flex: 0,
          width: 50,
          hide: !columnVisibility.serialNumber,
          headerClassName: "bold-header",
          pinned: 'left',
          lockPinned: true,

        },
        {
          field: "fullname",
          headerName: "Name",
          flex: 0,
          width: 150,
          hide: !columnVisibility.fullname,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        // {
        //     field: "applieddate",
        //     headerName: "Applied Date",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.applieddate,
        //     headerClassName: "bold-header",
        // },
        // {
        //     field: "empcode",
        //     headerName: "Employee Code",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.empcode,
        //     headerClassName: "bold-header",
        // },
        {
          field: "updatestatus",
          headerName: "Status",
          flex: 0,
          width: 150,
          hide: !columnVisibility.updatestatus,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        {
          field: "category",
          headerName: "Category",
          flex: 0,
          width: 100,
          hide: !columnVisibility.category,
          headerClassName: "bold-header",
        },
        {
          field: "subcategory",
          headerName: "Sub Category",
          flex: 0,
          width: 150,
          hide: !columnVisibility.subcategory,
          headerClassName: "bold-header",
        },
        {
          field: "mode",
          headerName: "Mode",
          flex: 0,
          width: 180,
          minHeight: "40px !important",
          sortable: false,
          hide: !columnVisibility.mode,
          headerClassName: "bold-header",
          // Assign Bank Detail
          cellRenderer: (params) => {
            return (
              <Grid sx={{ display: "flex", justifyContent: "center" }}>
                <>
                  {isUserRoleCompare?.includes("eallpendingchecklist") && (
                    <Button color="success" variant="contained" onClick={() => {
                      handleClickOpenEdit();
                      getCode(params.data);
                    }}>
                      VIEW
                    </Button>

                  )}
                </>
              </Grid>
            );
          },
        },
      ];
      break;
    case "applypermission":
      columnDataTable = [
        {
          field: "serialNumber",
          headerName: "SNo",
          flex: 0,
          width: 50,
          hide: !columnVisibility.serialNumber,
          headerClassName: "bold-header",
          pinned: 'left',
          lockPinned: true,
        },
        {
          field: "fullname",
          headerName: "Name",
          flex: 0,
          width: 150,
          hide: !columnVisibility.fullname,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        // {
        //     field: "applieddate",
        //     headerName: "Applied Date",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.applieddate,
        //     headerClassName: "bold-header",
        // },
        // {
        //     field: "empcode",
        //     headerName: "Employee Code",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.empcode,
        //     headerClassName: "bold-header",
        // },
        {
          field: "updatestatus",
          headerName: "Status",
          flex: 0,
          width: 150,
          hide: !columnVisibility.updatestatus,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        {
          field: "category",
          headerName: "Category",
          flex: 0,
          width: 100,
          hide: !columnVisibility.category,
          headerClassName: "bold-header",
        },
        {
          field: "subcategory",
          headerName: "Sub Category",
          flex: 0,
          width: 150,
          hide: !columnVisibility.subcategory,
          headerClassName: "bold-header",
        },
        {
          field: "mode",
          headerName: "Mode",
          flex: 0,
          width: 180,
          minHeight: "40px !important",
          sortable: false,
          hide: !columnVisibility.mode,
          headerClassName: "bold-header",
          // Assign Bank Detail
          cellRenderer: (params) => {
            return (
              <Grid sx={{ display: "flex", justifyContent: "center" }}>
                <>
                  {isUserRoleCompare?.includes("eallpendingchecklist") && (
                    <Button color="success" variant="contained" onClick={() => {
                      handleClickOpenEdit();
                      getCode(params.data);
                    }}>
                      VIEW
                    </Button>
                  )}
                </>
              </Grid>
            );
          },
        },
      ];
      break;
    case "deactivateemployeelist":
      columnDataTable = [
        {
          field: "serialNumber",
          headerName: "SNo",
          flex: 0,
          width: 50,
          hide: !columnVisibility.serialNumber,
          headerClassName: "bold-header",
          pinned: 'left',
          lockPinned: true,
        },
        {
          field: "fullname",
          headerName: "Employee Name",
          flex: 0,
          width: 150,
          hide: !columnVisibility.fullname,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        // {
        //     field: "mobile",
        //     headerName: "Contact No",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.mobile,
        //     headerClassName: "bold-header",
        // },
        // {
        //     field: "email",
        //     headerName: "Email",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.email,
        //     headerClassName: "bold-header",
        // },
        {
          field: "updatestatus",
          headerName: "Status",
          flex: 0,
          width: 150,
          hide: !columnVisibility.updatestatus,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        {
          field: "category",
          headerName: "Category",
          flex: 0,
          width: 100,
          hide: !columnVisibility.category,
          headerClassName: "bold-header",
        },
        {
          field: "subcategory",
          headerName: "Sub Category",
          flex: 0,
          width: 150,
          hide: !columnVisibility.subcategory,
          headerClassName: "bold-header",
        },
        {
          field: "mode",
          headerName: "Mode",
          flex: 0,
          width: 180,
          minHeight: "40px !important",
          sortable: false,
          hide: !columnVisibility.mode,
          headerClassName: "bold-header",
          // Assign Bank Detail
          cellRenderer: (params) => {
            return (
              <Grid sx={{ display: "flex", justifyContent: "center" }}>
                <>
                  {isUserRoleCompare?.includes("eallpendingchecklist") && (
                    <Button color="success" variant="contained" onClick={() => {
                      handleClickOpenEdit();
                      getCode(params.data);
                    }}>
                      VIEW
                    </Button>

                  )}
                </>
              </Grid>
            );
          },
        },
      ];

      break;

    case "activeemployeelist":
      columnDataTable = [
        {
          field: "serialNumber",
          headerName: "SNo",
          flex: 0,
          width: 50,
          hide: !columnVisibility.serialNumber,
          headerClassName: "bold-header",
          pinned: 'left',
          lockPinned: true,
        },
        {
          field: "fullname",
          headerName: "Employee Name",
          flex: 0,
          width: 150,
          hide: !columnVisibility.fullname,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        // {
        //     field: "mobile",
        //     headerName: "Contact No",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.mobile,
        //     headerClassName: "bold-header",
        // },
        // {
        //     field: "email",
        //     headerName: "Email",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.email,
        //     headerClassName: "bold-header",
        // },
        {
          field: "updatestatus",
          headerName: "Status",
          flex: 0,
          width: 150,
          hide: !columnVisibility.updatestatus,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        {
          field: "category",
          headerName: "Category",
          flex: 0,
          width: 100,
          hide: !columnVisibility.category,
          headerClassName: "bold-header",
        },
        {
          field: "subcategory",
          headerName: "Sub Category",
          flex: 0,
          width: 150,
          hide: !columnVisibility.subcategory,
          headerClassName: "bold-header",
        },
        {
          field: "mode",
          headerName: "Mode",
          flex: 0,
          width: 180,
          minHeight: "40px !important",
          sortable: false,
          hide: !columnVisibility.mode,
          headerClassName: "bold-header",
          // Assign Bank Detail
          cellRenderer: (params) => {
            return (
              <Grid sx={{ display: "flex", justifyContent: "center" }}>
                <>
                  {isUserRoleCompare?.includes("eallpendingchecklist") && (
                    <Button color="success" variant="contained" onClick={() => {
                      handleClickOpenEdit();
                      getCode(params.data);
                    }}>
                      VIEW
                    </Button>
                  )}
                </>
              </Grid>
            );
          },
        },
      ];

      break;

    case "rejoinedemployeelist":
      columnDataTable = [
        {
          field: "serialNumber",
          headerName: "SNo",
          flex: 0,
          width: 50,
          hide: !columnVisibility.serialNumber,
          headerClassName: "bold-header",
          pinned: 'left',
          lockPinned: true,
        },
        {
          field: "fullname",
          headerName: "Employee Name",
          flex: 0,
          width: 150,
          hide: !columnVisibility.fullname,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        // {
        //     field: "mobile",
        //     headerName: "Contact No",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.mobile,
        //     headerClassName: "bold-header",
        // },
        // {
        //     field: "email",
        //     headerName: "Email",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.email,
        //     headerClassName: "bold-header",
        // },
        {
          field: "updatestatus",
          headerName: "Status",
          flex: 0,
          width: 150,
          hide: !columnVisibility.updatestatus,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        {
          field: "category",
          headerName: "Category",
          flex: 0,
          width: 100,
          hide: !columnVisibility.category,
          headerClassName: "bold-header",
        },
        {
          field: "subcategory",
          headerName: "Sub Category",
          flex: 0,
          width: 150,
          hide: !columnVisibility.subcategory,
          headerClassName: "bold-header",
        },
        {
          field: "mode",
          headerName: "Mode",
          flex: 0,
          width: 180,
          minHeight: "40px !important",
          sortable: false,
          hide: !columnVisibility.mode,
          headerClassName: "bold-header",
          // Assign Bank Detail
          cellRenderer: (params) => {
            return (
              <Grid sx={{ display: "flex", justifyContent: "center" }}>
                <>
                  {isUserRoleCompare?.includes("eallpendingchecklist") && (
                    <Button color="success" variant="contained" onClick={() => {
                      handleClickOpenEdit();
                      getCode(params.data);
                    }}>
                      VIEW
                    </Button>
                  )}
                </>
              </Grid>
            );
          },
        },
      ];

      break;

    case "activeinternlist":
      columnDataTable = [
        {
          field: "serialNumber",
          headerName: "SNo",
          flex: 0,
          width: 50,
          hide: !columnVisibility.serialNumber,
          headerClassName: "bold-header",
          pinned: 'left',
          lockPinned: true,
        },
        {
          field: "fullname",
          headerName: "Employee Name",
          flex: 0,
          width: 150,
          hide: !columnVisibility.fullname,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        // {
        //     field: "mobile",
        //     headerName: "Contact No",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.mobile,
        //     headerClassName: "bold-header",
        // },
        // {
        //     field: "email",
        //     headerName: "Email",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.email,
        //     headerClassName: "bold-header",
        // },
        {
          field: "updatestatus",
          headerName: "Status",
          flex: 0,
          width: 150,
          hide: !columnVisibility.updatestatus,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        {
          field: "category",
          headerName: "Category",
          flex: 0,
          width: 100,
          hide: !columnVisibility.category,
          headerClassName: "bold-header",
        },
        {
          field: "subcategory",
          headerName: "Sub Category",
          flex: 0,
          width: 150,
          hide: !columnVisibility.subcategory,
          headerClassName: "bold-header",
        },
        {
          field: "mode",
          headerName: "Mode",
          flex: 0,
          width: 180,
          minHeight: "40px !important",
          sortable: false,
          hide: !columnVisibility.mode,
          headerClassName: "bold-header",
          // Assign Bank Detail
          cellRenderer: (params) => {
            return (
              <Grid sx={{ display: "flex", justifyContent: "center" }}>
                <>
                  {isUserRoleCompare?.includes("eallpendingchecklist") && (
                    <Button color="success" variant="contained" onClick={() => {
                      handleClickOpenEdit();
                      getCode(params.data);
                    }}>
                      VIEW
                    </Button>
                  )}
                </>
              </Grid>
            );
          },
        },
      ];

      break;
    case "deactivateinternlist":
      columnDataTable = [
        {
          field: "serialNumber",
          headerName: "SNo",
          flex: 0,
          width: 50,
          hide: !columnVisibility.serialNumber,
          headerClassName: "bold-header",
          pinned: 'left',
          lockPinned: true,
        },
        {
          field: "fullname",
          headerName: "Employee Name",
          flex: 0,
          width: 150,
          hide: !columnVisibility.fullname,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        // {
        //     field: "mobile",
        //     headerName: "Contact No",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.mobile,
        //     headerClassName: "bold-header",
        // },
        // {
        //     field: "email",
        //     headerName: "Email",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.email,
        //     headerClassName: "bold-header",
        // },
        {
          field: "updatestatus",
          headerName: "Status",
          flex: 0,
          width: 150,
          hide: !columnVisibility.updatestatus,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        {
          field: "category",
          headerName: "Category",
          flex: 0,
          width: 100,
          hide: !columnVisibility.category,
          headerClassName: "bold-header",
        },
        {
          field: "subcategory",
          headerName: "Sub Category",
          flex: 0,
          width: 150,
          hide: !columnVisibility.subcategory,
          headerClassName: "bold-header",
        },
        {
          field: "mode",
          headerName: "Mode",
          flex: 0,
          width: 180,
          minHeight: "40px !important",
          sortable: false,
          hide: !columnVisibility.mode,
          headerClassName: "bold-header",
          // Assign Bank Detail
          cellRenderer: (params) => {
            return (
              <Grid sx={{ display: "flex", justifyContent: "center" }}>
                <>
                  {isUserRoleCompare?.includes("eallpendingchecklist") && (
                    <Button color="success" variant="contained" onClick={() => {
                      handleClickOpenEdit();
                      getCode(params.data);
                    }}>
                      VIEW
                    </Button>
                  )}
                </>
              </Grid>
            );
          },
        },
      ];

      break;
    case "exitlist":
      columnDataTable = [
        {
          field: "serialNumber",
          headerName: "SNo",
          flex: 0,
          width: 50,
          hide: !columnVisibility.serialNumber,
          headerClassName: "bold-header",
          pinned: 'left',
          lockPinned: true,
        },
        {
          field: "fullname",
          headerName: "Employee Name",
          flex: 0,
          width: 150,
          hide: !columnVisibility.fullname,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        // {
        //     field: "empcode",
        //     headerName: "Emp Code",
        //     flex: 0,
        //     width: 150,
        //     hide: !columnVisibility.empcode,
        //     headerClassName: "bold-header",
        // },
        // {
        //     field: "company",
        //     headerName: "Company",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.company,
        //     headerClassName: "bold-header",
        // },
        // {
        //     field: "branch",
        //     headerName: "Branch",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.branch,
        //     headerClassName: "bold-header",
        // },
        // {
        //     field: "unit",
        //     headerName: "Unit",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.Unit,
        //     headerClassName: "bold-header",
        // },
        // {
        //     field: "team",
        //     headerName: "Team",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.team,
        //     headerClassName: "bold-header",
        // },
        // {
        //     field: "noticedate",
        //     headerName: "Notice Date",
        //     flex: 0,
        //     width: 100,
        //     hide: !columnVisibility.noticedate,
        //     headerClassName: "bold-header",
        // },
        {
          field: "approvedthrough",
          headerName: "Status",
          flex: 0,
          width: 150,
          hide: !columnVisibility.approvedthrough,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        {
          field: "category",
          headerName: "Category",
          flex: 0,
          width: 100,
          hide: !columnVisibility.category,
          headerClassName: "bold-header",
        },
        {
          field: "subcategory",
          headerName: "Sub Category",
          flex: 0,
          width: 150,
          hide: !columnVisibility.subcategory,
          headerClassName: "bold-header",
        },
        {
          field: "mode",
          headerName: "Mode",
          flex: 0,
          width: 180,
          minHeight: "40px !important",
          sortable: false,
          hide: !columnVisibility.mode,
          headerClassName: "bold-header",
          // Assign Bank Detail
          cellRenderer: (params) => {
            return (
              <Grid sx={{ display: "flex", justifyContent: "center" }}>
                <>
                  {isUserRoleCompare?.includes("eallpendingchecklist") && (
                    <Button color="success" variant="contained" onClick={() => {
                      handleClickOpenEdit();
                      getCode(params.data);
                    }}>
                      VIEW
                    </Button>
                  )}
                </>
              </Grid>
            );
          },
        },
      ];

      break;

    case "longabsentlongleaverestrcitionlist":
      columnDataTable = [
        {
          field: "serialNumber",
          headerName: "SNo",
          flex: 0,
          width: 50,
          hide: !columnVisibility.serialNumber,
          headerClassName: "bold-header",
          pinned: 'left',
          lockPinned: true,
        },
        {
          field: "userstatus",
          headerName: "Employee Status",
          flex: 0,
          width: 150,
          hide: !columnVisibility.userstatus,
          minHeight: "40px",
          pinned: 'left',
          cellRenderer: (params) => renderStatus(params?.data.userstatus),
        },

        {
          field: "companyname",
          headerName: "Employee Name",
          flex: 0,
          width: 150,
          hide: !columnVisibility.companyname,
          headerClassName: "bold-header",
          pinned: 'left',
        },
        {
          field: "empcode",
          headerName: "Emp Code",
          flex: 0,
          width: 150,
          hide: !columnVisibility.empcode,
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
          field: "team",
          headerName: "Team",
          flex: 0,
          width: 100,
          hide: !columnVisibility.team,
          headerClassName: "bold-header",
        },

        {
          field: "category",
          headerName: "Category",
          flex: 0,
          width: 100,
          hide: !columnVisibility.category,
          headerClassName: "bold-header",
        },
        {
          field: "subcategory",
          headerName: "Sub Category",
          flex: 0,
          width: 150,
          hide: !columnVisibility.subcategory,
          headerClassName: "bold-header",
        },

        {
          field: "mode",
          headerName: "Mode",
          flex: 0,
          width: 180,
          minHeight: "40px !important",
          sortable: false,
          hide: !columnVisibility.mode,
          headerClassName: "bold-header",
          // Assign Bank Detail
          cellRenderer: (params) => {
            return (
              <Grid sx={{ display: "flex", justifyContent: "center" }}>
                <>
                  {isUserRoleCompare?.includes("eallpendingchecklist") && (
                    <Button color="success" variant="contained" onClick={() => {
                      handleClickOpenEdit();
                      getCode(params.data);
                    }}>
                      VIEW
                    </Button>
                  )}
                </>
              </Grid>
            );
          },
        },
      ];

      break;
    default:
      columnDataTable = [
        {
          field: "serialNumber",
          headerName: "SNo",
          flex: 0,
          width: 50,
          hide: !columnVisibility.serialNumber,
          headerClassName: "bold-header",
        },
        {
          field: "name",
          headerName: "Name",
          flex: 0,
          width: 150,
          hide: !columnVisibility.name,
          headerClassName: "bold-header",
        },
        {
          field: "applieddate",
          headerName: "Applied Date",
          flex: 0,
          width: 100,
          hide: !columnVisibility.applieddate,
          headerClassName: "bold-header",
        },
        {
          field: "empcode",
          headerName: "Employee Code",
          flex: 0,
          width: 100,
          hide: !columnVisibility.empcode,
          headerClassName: "bold-header",
        },
        {
          field: "updatestatus",
          headerName: "Status",
          flex: 0,
          width: 150,
          hide: !columnVisibility.updatestatus,
          headerClassName: "bold-header",
        },
        {
          field: "category",
          headerName: "Category",
          flex: 0,
          width: 100,
          hide: !columnVisibility.category,
          headerClassName: "bold-header",
        },
        {
          field: "subcategory",
          headerName: "Sub Category",
          flex: 0,
          width: 150,
          hide: !columnVisibility.subcategory,
          headerClassName: "bold-header",
        },
        {
          field: "checklist",
          headerName: "Check List",
          flex: 0,
          width: 200,
          hide: !columnVisibility.checklist,
          headerClassName: "bold-header",
        },
      ];
  }

  const rowDataTable = filteredData.map((item, index) => {
    if (fromWhere == "jobopening") {
      return {
        id: index,
        serialNumber: item?.serialNumber,
        role: item?.role,
        fullname: item?.fullname,
        mobile: item?.mobile,
        email: item?.email,
        category: item?.category,
        subcategory: item?.subcategory,
        checklist: item?.checklist,
        username: item?.username,
        password: item?.password,
        company: item?.company,
        branch: item?.branch,
        adharnumber: item?.adharnumber,
        pannumber: item?.pannumber,
        dateofbirth: item?.dateofbirth,
        address: item?.address,
        groups: item?.groups,
        information: item?.information,
        updatestatus: "Pending",
      };
    } else if (fromWhere == "applyleave") {
      // let dateShown = item.date.map((data)=>moment(data).format('DD-MM-YYYY'))
      return {
        id: index,
        serialNumber: item?.serialNumber,
        role: item?.role,
        fullname: item?.fullname,
        empcode: item?.empcode,
        applieddate: item?.applieddate,
        category: item?.category,
        subcategory: item?.subcategory,
        checklist: item?.checklist,
        mobile: item?.mobile,
        email: item?.email,
        username: "N/A",
        password: "N/A",
        firstname: item?.firstname,
        lastname: item?.lastname,
        adharnumber: "N/A",
        pannumber: "N/A",
        dateofbirth: "N/A",
        address: "N/A",
        groups: item?.groups,
        information: item?.information,
        updatestatus: "Pending",
      };
    } else if (fromWhere == "applypermission") {
      return {
        id: index,
        serialNumber: item?.serialNumber,
        role: item?.role,
        fullname: item?.fullname,
        empcode: item?.empcode,
        applieddate: item?.applieddate,
        category: item?.category,
        subcategory: item?.subcategory,
        checklist: item?.checklist,
        username: "N/A",
        password: "N/A",
        email: "N/A",
        mobile: "N/A",
        firstname: item?.firstname,
        lastname: item?.lastname,
        adharnumber: "N/A",
        pannumber: "N/A",
        dateofbirth: "N/A",
        address: "N/A",
        groups: item?.groups,
        information: item?.information,
        updatestatus: "Pending",
        mobile: item?.mobile,
        email: item?.email,
      };
    } else if (fromWhere == "deactivateemployeelist") {
      return {
        id: item?.id,
        serialNumber: item?.serialNumber,
        role: item?.role,
        fullname: item?.fullname,
        empcode: item?.empcode,
        applieddate: item?.applieddate,
        category: item?.category,
        subcategory: item?.subcategory,
        checklist: item?.checklist,

        username: "N/A",
        password: "N/A",
        email: "N/A",
        mobile: "N/A",
        firstname: item?.firstname,
        lastname: item?.lastname,
        adharnumber: "N/A",
        pannumber: "N/A",
        dateofbirth: "N/A",
        address: "N/A",
        groups: item?.groups,
        information: item?.information,
        updatestatus: "Pending",
        mobile: item?.mobile,
        email: item?.email,
      };
    } else if (fromWhere == "activeemployeelist") {
      return {
        id: item?.id,
        serialNumber: item?.serialNumber,
        role: item?.role,
        fullname: item?.fullname,
        empcode: item?.empcode,
        applieddate: item?.applieddate,
        category: item?.category,
        subcategory: item?.subcategory,
        checklist: item?.checklist,

        username: "N/A",
        password: "N/A",
        email: "N/A",
        mobile: "N/A",
        firstname: item?.firstname,
        lastname: item?.lastname,
        adharnumber: "N/A",
        pannumber: "N/A",
        dateofbirth: "N/A",
        address: "N/A",
        groups: item?.groups,
        information: item?.information,
        updatestatus: "Pending",
        mobile: item?.mobile,
        email: item?.email,
      };
    } else if (fromWhere == "rejoinedemployeelist") {
      return {
        id: item?.id,
        serialNumber: item?.serialNumber,
        role: item?.role,
        fullname: item?.fullname,
        empcode: item?.empcode,
        applieddate: item?.applieddate,
        category: item?.category,
        subcategory: item?.subcategory,
        checklist: item?.checklist,

        username: "N/A",
        password: "N/A",
        email: "N/A",
        mobile: "N/A",
        firstname: item?.firstname,
        lastname: item?.lastname,
        adharnumber: "N/A",
        pannumber: "N/A",
        dateofbirth: "N/A",
        address: "N/A",
        groups: item?.groups,
        information: item?.information,
        updatestatus: "Pending",
        mobile: item?.mobile,
        email: item?.email,
      };
    } else if (fromWhere == "activeinternlist") {
      return {
        id: item?.id,
        serialNumber: item?.serialNumber,
        role: item?.role,
        fullname: item?.fullname,
        empcode: item?.empcode,
        applieddate: item?.applieddate,
        category: item?.category,
        subcategory: item?.subcategory,
        checklist: item?.checklist,

        username: "N/A",
        password: "N/A",
        email: "N/A",
        mobile: "N/A",
        firstname: item?.firstname,
        lastname: item?.lastname,
        adharnumber: "N/A",
        pannumber: "N/A",
        dateofbirth: "N/A",
        address: "N/A",
        groups: item?.groups,
        information: item?.information,
        updatestatus: "Pending",
        mobile: item?.mobile,
        email: item?.email,
      };
    } else if (fromWhere == "deactivateinternlist") {
      return {
        id: item?.id,
        serialNumber: item?.serialNumber,
        role: item?.role,
        fullname: item?.fullname,
        empcode: item?.empcode,
        applieddate: item?.applieddate,
        category: item?.category,
        subcategory: item?.subcategory,
        checklist: item?.checklist,

        username: "N/A",
        password: "N/A",
        email: "N/A",
        mobile: "N/A",
        firstname: item?.firstname,
        lastname: item?.lastname,
        adharnumber: "N/A",
        pannumber: "N/A",
        dateofbirth: "N/A",
        address: "N/A",
        groups: item?.groups,
        information: item?.information,
        updatestatus: "Pending",
        mobile: item?.mobile,
        email: item?.email,
      };
    } else if (fromWhere == "exitlist") {
      return {
        id: item?.id,
        serialNumber: item?.serialNumber,
        role: item?.role,
        fullname: item?.fullname,
        empcode: item?.empcode,
        noticedate: item?.noticedate,
        category: item?.category,
        subcategory: item?.subcategory,
        checklist: item?.checklist,

        approvedthrough: item?.approvedthrough,
        company: item?.company,
        branch: item?.branch,
        unit: item?.unit,
        team: item?.team,

        username: "N/A",
        password: "N/A",
        email: "N/A",
        mobile: "N/A",
        firstname: item?.firstname,
        lastname: item?.lastname,
        adharnumber: "N/A",
        pannumber: "N/A",
        dateofbirth: "N/A",
        address: "N/A",
        groups: item?.groups,
        information: item?.information,
        updatestatus: "Pending",
        mobile: item?.mobile,
        email: item?.email,
      };
    } else if (fromWhere == "longabsentlongleaverestrcitionlist") {
      return {
        id: item?.id,
        serialNumber: item?.serialNumber,
        userstatus: item?.userstatus,
        companyname: item?.companyname,
        fullname: item?.companyname,
        empcode: item?.empcode,
        category: item?.category,
        subcategory: item?.subcategory,
        checklist: item?.checklist,

        company: item?.company,
        branch: item?.branch,
        unit: item?.unit,
        team: item?.team,
        groups: item?.groups,
        information: item?.information,
        updatestatus: item?.updatestatus,
        assignedtime: item?.assignedtime,
        duedate: item?.duedate,
        duebydate: item?.duebydate,
        username: item?.username,
        password: item?.password,
        email: item?.email,
        mobile: item?.mobile,
        firstname: item?.firstname,
        lastname: item?.lastname,
        adharnumber: item?.adharnumber,
        pannumber: item?.pannumber,
        dateofbirth: item?.dateofbirth,
        address: item?.address,
      };
    }
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
  const filteredColumns = columnDataTable?.filter((column) =>
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
              Hide All
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Box>
  );

  return (
    <Box>
      {/* ****** Header Content ****** */}
      <Headtitle title={"ALL PENDING CHECK LIST"} />
      <PageHeading
        title="All Pending Checklist"
        modulename="Checklist"
        submodulename="All Pending Checklist"
        mainpagename=""
        subpagename=""
        subsubpagename=""
      />
      <br />

      <>
        {tableCount === 1 ? (
          <>
            {/*----------Second Table----------------------------------------------------------------------------------------------------------------- */}
            {/* ****** Table Start ****** */}
            {isUserRoleCompare?.includes("lallpendingchecklist") && (
              <>
                <Box sx={userStyle.container}>
                  {/* ******************************************************EXPORT Buttons****************************************************** */}
                  <Grid
                    item
                    xs={8}
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={userStyle.importheadtext}>
                      Consolidated Pending Checklist
                    </Typography>
                  </Grid>

                  <Grid container spacing={2} style={userStyle.dataTablestyle}>
                    <Grid item md={2} xs={12} sm={12}>
                      <Box>
                        <label>Show entries:</label>
                        <Select
                          id="pageSizeSelect"
                          value={pageSizeTwo}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 180,
                                width: 80,
                              },
                            },
                          }}
                          onChange={handlePageSizeChangeTwo}
                          sx={{ width: "77px" }}
                        >
                          <MenuItem value={1}>1</MenuItem>
                          <MenuItem value={5}>5</MenuItem>
                          <MenuItem value={10}>10</MenuItem>
                          <MenuItem value={25}>25</MenuItem>
                          <MenuItem value={50}>50</MenuItem>
                          <MenuItem value={100}>100</MenuItem>
                          <MenuItem value={tableTwoDatas?.length}>All</MenuItem>
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
                        {isUserRoleCompare?.includes(
                          "excelallpendingchecklist"
                        ) && (
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
                        {isUserRoleCompare?.includes(
                          "csvallpendingchecklist"
                        ) && (
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
                        {isUserRoleCompare?.includes(
                          "printallpendingchecklist"
                        ) && (
                            <>
                              <Button
                                sx={userStyle.buttongrp}
                                onClick={handleprintTwo}
                              >
                                &ensp;
                                <FaPrint />
                                &ensp;Print&ensp;
                              </Button>
                            </>
                          )}
                        {isUserRoleCompare?.includes(
                          "pdfallpendingchecklist"
                        ) && (
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
                        {isUserRoleCompare?.includes(
                          "imageallpendingchecklist"
                        ) && (
                            <Button
                              sx={userStyle.buttongrp}
                              onClick={handleCaptureImageTwo}
                            >
                              {" "}
                              <ImageIcon sx={{ fontSize: "15px" }} />{" "}
                              &ensp;Image&ensp;{" "}
                            </Button>
                          )}
                      </Box>
                    </Grid>
                    <Grid item md={2} xs={6} sm={6}>
                      <AggregatedSearchBar columnDataTable={columnDataTableTwo} setItems={setItemsTwo} addSerialNumber={addSerialNumberTwo} setPage={setPageTwo} maindatas={tableTwoDatas} setSearchedString={setSearchedStringTwo}
                        searchQuery={searchQueryTwo}
                        setSearchQuery={setSearchQueryTwo}
                        paginated={false}
                        totalDatas={overallItemsTwo}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    sx={userStyle.buttongrp}
                    onClick={handleShowAllColumnsTwo}
                  >
                    Show All Columns
                  </Button>
                  &ensp;
                  <Button
                    sx={userStyle.buttongrp}
                    onClick={handleOpenManageColumnsTwo}
                  >
                    Manage Columns
                  </Button>
                  &ensp;
                  <br />
                  <br />
                  {!tableThree ? (
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
                      <AggridTable
                        rowDataTable={rowDataTableTwo}
                        columnDataTable={columnDataTableTwo}
                        columnVisibility={columnVisibilityTwo}
                        page={pageTwo}
                        setPage={setPageTwo}
                        pageSize={pageSizeTwo}
                        totalPages={totalPagesTwo}
                        setColumnVisibility={setColumnVisibilityTwo}
                        isHandleChange={isHandleChangeTwo}
                        items={itemsTwo}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        gridRefTable={gridRefTwo}
                        paginated={false}
                        filteredDatas={filteredDataTwos}
                        handleShowAllColumns={handleShowAllColumnsTwo}

                        setFilteredRowData={setFilteredRowDataTwo}
                        filteredRowData={filteredRowDataTwo}
                        setFilteredChanges={setFilteredChangesTwo}
                        filteredChanges={filteredChangesTwo}
                        gridRefTableImg={gridRefTableImgTwo}
                        itemsList={overallItemsTwo}
                      />
                    </>
                  )}
                </Box>
              </>
            )}
            {/* Manage Column */}
            <Popover
              id={idTwo}
              open={isManageColumnsOpenTwo}
              anchorEl={anchorElTwo}
              onClose={handleCloseManageColumnsTwo}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              {manageColumnsContentTwo}
            </Popover>
            <br />
          </>
        ) : (
          <>
            {isUserRoleCompare?.includes("lallpendingchecklist") && (
              <>
                <Box sx={userStyle.container}>
                  {/* ******************************************************EXPORT Buttons****************************************************** */}
                  <Grid container spacing={2}>
                    <Grid
                      item
                      md={12}
                      lg={12}
                      xs={12}
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography sx={userStyle.SubHeaderText}>
                        All Pending Check List
                      </Typography>
                      <Button sx={buttonStyles.btncancel} variant="contained" onClick={() => {
                        setTableCount(1);
                        setCandidates([]);
                      }}>Back</Button>

                    </Grid>
                  </Grid>
                  <br />
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
                          <MenuItem value={overallItems?.length}>All</MenuItem>
                        </Select>
                      </Box>
                    </Grid>
                    <Grid
                      item
                      md={6}
                      xs={12}
                      sm={12}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        {isUserRoleCompare?.includes(
                          "excelallpendingchecklist"
                        ) && (
                            <>
                              <Button
                                onClick={(e) => {
                                  setIsFilterOpenNew(true);
                                  setFormatNew("xl");
                                }}
                                sx={userStyle.buttongrp}
                              >
                                <FaFileExcel />
                                &ensp;Export to Excel&ensp;
                              </Button>
                            </>
                          )}
                        {isUserRoleCompare?.includes(
                          "csvallpendingchecklist"
                        ) && (
                            <>
                              <Button
                                onClick={(e) => {
                                  setIsFilterOpenNew(true);
                                  setFormatNew("csv");
                                }}
                                sx={userStyle.buttongrp}
                              >
                                <FaFileCsv />
                                &ensp;Export to CSV&ensp;
                              </Button>
                            </>
                          )}
                        {isUserRoleCompare?.includes(
                          "printallpendingchecklist"
                        ) && (
                            <>
                              <Button
                                sx={userStyle.buttongrp}
                                onClick={handleprint}
                              >
                                &ensp;
                                <FaPrint />
                                &ensp;Print&ensp;
                              </Button>
                            </>
                          )}
                        {isUserRoleCompare?.includes(
                          "pdfallpendingchecklist"
                        ) && (
                            <>
                              <Button
                                sx={userStyle.buttongrp}
                                onClick={() => {
                                  setIsPdfFilterOpenNew(true);
                                }}
                              >
                                <FaFilePdf />
                                &ensp;Export to PDF&ensp;
                              </Button>
                            </>
                          )}
                        {isUserRoleCompare?.includes(
                          "printallpendingchecklist"
                        ) && (
                            <Button
                              sx={userStyle.buttongrp}
                              onClick={handleCaptureImage}
                            >
                              {" "}
                              <ImageIcon sx={{ fontSize: "15px" }} />{" "}
                              &ensp;Image&ensp;{" "}
                            </Button>
                          )}
                      </Box>
                    </Grid>
                    <Grid item md={4} xs={6} sm={6}>
                      <AggregatedSearchBar columnDataTable={columnDataTable} setItems={setItems} addSerialNumber={addSerialNumber} setPage={setPage} maindatas={candidates} setSearchedString={setSearchedString}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        paginated={false}
                        totalDatas={overallItems}
                      />
                    </Grid>
                  </Grid>
                  <br />
                  <Button
                    sx={userStyle.buttongrp}
                    onClick={handleShowAllColumns}
                  >
                    Show All Columns
                  </Button>
                  &ensp;
                  <Button
                    sx={userStyle.buttongrp}
                    onClick={handleOpenManageColumns}
                  >
                    Manage Columns
                  </Button>
                  &ensp;
                  <br />
                  <br />
                  {!isBankdetail ? (
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
                        itemsList={overallItems}
                      />
                    </>
                  )}
                </Box>
              </>
            )}
            {/* Manage Column */}
            <Popover
              id={id}
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
          </>
        )}
      </>

      <Box>
        {/* ALERT DIALOG */}
        <Dialog
          open={isDeleteOpenalert}
          onClose={handleCloseModalert}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent
            sx={{ width: "350px", textAlign: "center", alignItems: "center" }}
          >
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "70px", color: "orange" }}
            />
            <Typography
              variant="h6"
              sx={{ color: "black", textAlign: "center" }}
            >
              Please Select any Row
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              variant="contained"
              color="error"
              onClick={handleCloseModalert}
            >
              {" "}
              OK{" "}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* Bulk delete ALERT DIALOG */}
      <Dialog
        open={isDeleteOpenalert}
        onClose={handleCloseModalert}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent
          sx={{ width: "350px", textAlign: "center", alignItems: "center" }}
        >
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "70px", color: "orange" }}
          />
          <Typography variant="h6" sx={{ color: "black", textAlign: "center" }}>
            Please Select any Row
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            variant="contained"
            color="error"
            onClick={handleCloseModalert}
          >
            {" "}
            OK{" "}
          </Button>
        </DialogActions>
      </Dialog>
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
          <Button variant="contained" color="error" onClick={handleCloseerr}>
            ok
          </Button>
        </DialogActions>
      </Dialog>

      {fromWhere === "jobopening" && (
        <TableContainer component={Paper} sx={userStyle.printcls}>
          <Table aria-label="simple table" id="branch" ref={componentRef}>
            <TableHead sx={{ fontWeight: "200" }}>
              <StyledTableRow>
                <StyledTableCell>SI.NO</StyledTableCell>
                <StyledTableCell>Company</StyledTableCell>
                <StyledTableCell>Branch</StyledTableCell>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Conatact Number</StyledTableCell>
                <StyledTableCell>Email</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Category</StyledTableCell>
                <StyledTableCell>Sub Category</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {rowDataTable &&
                rowDataTable.map((row, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{index + 1}</StyledTableCell>
                    <StyledTableCell> {row.company}</StyledTableCell>
                    <StyledTableCell> {row.branch}</StyledTableCell>
                    <StyledTableCell> {row.fullname}</StyledTableCell>
                    <StyledTableCell> {row.mobile}</StyledTableCell>
                    <StyledTableCell> {row.email}</StyledTableCell>
                    <StyledTableCell> {row.updatestatus}</StyledTableCell>
                    <StyledTableCell> {row.category}</StyledTableCell>
                    <StyledTableCell> {row.subcategory}</StyledTableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {fromWhere === "applyleave" && (
        <TableContainer component={Paper} sx={userStyle.printcls}>
          <Table aria-label="simple table" id="branch" ref={componentRef}>
            <TableHead sx={{ fontWeight: "200" }}>
              <StyledTableRow>
                <StyledTableCell>SI.NO</StyledTableCell>

                <StyledTableCell>Name</StyledTableCell>

                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Category</StyledTableCell>
                <StyledTableCell>Sub Category</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {rowDataTable &&
                rowDataTable.map((row, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{index + 1}</StyledTableCell>

                    <StyledTableCell> {row.fullname}</StyledTableCell>

                    <StyledTableCell> {row.updatestatus}</StyledTableCell>
                    <StyledTableCell> {row.category}</StyledTableCell>
                    <StyledTableCell> {row.subcategory}</StyledTableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {fromWhere === "applypermission" && (
        <TableContainer component={Paper} sx={userStyle.printcls}>
          <Table aria-label="simple table" id="branch" ref={componentRef}>
            <TableHead sx={{ fontWeight: "200" }}>
              <StyledTableRow>
                <StyledTableCell>SI.NO</StyledTableCell>

                <StyledTableCell>Name</StyledTableCell>

                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Category</StyledTableCell>
                <StyledTableCell>Sub Category</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {rowDataTable &&
                rowDataTable.map((row, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{index + 1}</StyledTableCell>

                    <StyledTableCell> {row.fullname}</StyledTableCell>

                    <StyledTableCell> {row.updatestatus}</StyledTableCell>
                    <StyledTableCell> {row.category}</StyledTableCell>
                    <StyledTableCell> {row.subcategory}</StyledTableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {fromWhere === "deactivateemployeelist" && (
        <TableContainer component={Paper} sx={userStyle.printcls}>
          <Table aria-label="simple table" id="branch" ref={componentRef}>
            <TableHead sx={{ fontWeight: "200" }}>
              <StyledTableRow>
                <StyledTableCell>SI.NO</StyledTableCell>

                <StyledTableCell>Applicant Name</StyledTableCell>

                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Category</StyledTableCell>
                <StyledTableCell>Sub Category</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {rowDataTable &&
                rowDataTable.map((row, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{index + 1}</StyledTableCell>

                    <StyledTableCell> {row.fullname}</StyledTableCell>

                    <StyledTableCell> {row.updatestatus}</StyledTableCell>
                    <StyledTableCell> {row.category}</StyledTableCell>
                    <StyledTableCell> {row.subcategory}</StyledTableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {(fromWhere === "activeemployeelist" ||
        fromWhere === "rejoinedemployeelist") && (
          <TableContainer component={Paper} sx={userStyle.printcls}>
            <Table aria-label="simple table" id="branch" ref={componentRef}>
              <TableHead sx={{ fontWeight: "200" }}>
                <StyledTableRow>
                  <StyledTableCell>SI.NO</StyledTableCell>

                  <StyledTableCell>Applicant Name</StyledTableCell>

                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Category</StyledTableCell>
                  <StyledTableCell>Sub Category</StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {rowDataTable &&
                  rowDataTable.map((row, index) => (
                    <StyledTableRow key={index}>
                      <StyledTableCell>{index + 1}</StyledTableCell>

                      <StyledTableCell> {row.fullname}</StyledTableCell>

                      <StyledTableCell> {row.updatestatus}</StyledTableCell>
                      <StyledTableCell> {row.category}</StyledTableCell>
                      <StyledTableCell> {row.subcategory}</StyledTableCell>
                    </StyledTableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

      {fromWhere === "activeinternlist" && (
        <TableContainer component={Paper} sx={userStyle.printcls}>
          <Table aria-label="simple table" id="branch" ref={componentRef}>
            <TableHead sx={{ fontWeight: "200" }}>
              <StyledTableRow>
                <StyledTableCell>SI.NO</StyledTableCell>

                <StyledTableCell>Applicant Name</StyledTableCell>

                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Category</StyledTableCell>
                <StyledTableCell>Sub Category</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {rowDataTable &&
                rowDataTable.map((row, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{index + 1}</StyledTableCell>

                    <StyledTableCell> {row.fullname}</StyledTableCell>

                    <StyledTableCell> {row.updatestatus}</StyledTableCell>
                    <StyledTableCell> {row.category}</StyledTableCell>
                    <StyledTableCell> {row.subcategory}</StyledTableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {fromWhere === "deactivateinternlist" && (
        <TableContainer component={Paper} sx={userStyle.printcls}>
          <Table aria-label="simple table" id="branch" ref={componentRef}>
            <TableHead sx={{ fontWeight: "200" }}>
              <StyledTableRow>
                <StyledTableCell>SI.NO</StyledTableCell>

                <StyledTableCell>Applicant Name</StyledTableCell>

                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Category</StyledTableCell>
                <StyledTableCell>Sub Category</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {rowDataTable &&
                rowDataTable.map((row, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{index + 1}</StyledTableCell>

                    <StyledTableCell> {row.fullname}</StyledTableCell>

                    <StyledTableCell> {row.updatestatus}</StyledTableCell>
                    <StyledTableCell> {row.category}</StyledTableCell>
                    <StyledTableCell> {row.subcategory}</StyledTableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {fromWhere === "exitlist" && (
        <TableContainer component={Paper} sx={userStyle.printcls}>
          <Table aria-label="simple table" id="branch" ref={componentRef}>
            <TableHead sx={{ fontWeight: "200" }}>
              <StyledTableRow>
                <StyledTableCell>SI.NO</StyledTableCell>

                <StyledTableCell>Employee Name</StyledTableCell>

                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Category</StyledTableCell>
                <StyledTableCell>Sub Category</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {rowDataTable &&
                rowDataTable.map((row, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{index + 1}</StyledTableCell>

                    <StyledTableCell> {row.fullname}</StyledTableCell>

                    <StyledTableCell> {row.approvedthrough}</StyledTableCell>
                    <StyledTableCell> {row.category}</StyledTableCell>
                    <StyledTableCell> {row.subcategory}</StyledTableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {fromWhere === "longabsentlongleaverestrcitionlist" && (
        <TableContainer component={Paper} sx={userStyle.printcls}>
          <Table aria-label="simple table" id="branch" ref={componentRef}>
            <TableHead sx={{ fontWeight: "200" }}>
              <StyledTableRow>
                <StyledTableCell>SI.NO</StyledTableCell>

                <StyledTableCell>Employee Status</StyledTableCell>
                <StyledTableCell>Employee Name</StyledTableCell>
                <StyledTableCell>Employee ID</StyledTableCell>
                <StyledTableCell>Company</StyledTableCell>
                <StyledTableCell>Branch</StyledTableCell>
                <StyledTableCell>Unit</StyledTableCell>
                <StyledTableCell>Team</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Category</StyledTableCell>
                <StyledTableCell>Sub Category</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {rowDataTable &&
                rowDataTable.map((row, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{index + 1}</StyledTableCell>

                    <StyledTableCell> {row.userstatus}</StyledTableCell>
                    <StyledTableCell> {row.companyname}</StyledTableCell>
                    <StyledTableCell> {row.empcode}</StyledTableCell>
                    <StyledTableCell> {row.company}</StyledTableCell>
                    <StyledTableCell> {row.branch}</StyledTableCell>
                    <StyledTableCell> {row.unit}</StyledTableCell>
                    <StyledTableCell> {row.team}</StyledTableCell>

                    <StyledTableCell> {row.updatestatus}</StyledTableCell>
                    <StyledTableCell> {row.category}</StyledTableCell>
                    <StyledTableCell> {row.subcategory}</StyledTableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TableContainer component={Paper} sx={userStyle.printcls}>
        <Table aria-label="simple table" id="branch" ref={componentRefTwo}>
          <TableHead sx={{ fontWeight: "500" }}>
            <StyledTableRow>
              <StyledTableCell>SI.NO</StyledTableCell>
              <StyledTableCell>Module Name</StyledTableCell>
              <StyledTableCell>Sub Module Name</StyledTableCell>
              <StyledTableCell>Main Page</StyledTableCell>
              <StyledTableCell>Sub Page</StyledTableCell>
              <StyledTableCell>Sub Sub Page</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {rowDataTableTwo &&
              rowDataTableTwo.map((row, index) => (
                <StyledTableRow key={index}>
                  <StyledTableCell>{index + 1}</StyledTableCell>
                  <StyledTableCell> {row.module}</StyledTableCell>
                  <StyledTableCell> {row.submodule}</StyledTableCell>
                  <StyledTableCell> {row.mainpage}</StyledTableCell>
                  <StyledTableCell> {row.subpage}</StyledTableCell>
                  <StyledTableCell> {row.subsubpage}</StyledTableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/*Export XL Data  */}
      <Dialog
        open={isFilterOpen}
        onClose={handleCloseFilterMod}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
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
              handleExportXLTwo("filtered");
            }}
          >
            Export Filtered Data
          </Button>
          <Button
            autoFocus
            variant="contained"
            onClick={(e) => {
              handleExportXLTwo("overall");
            }}
          >
            Export Over All Data
          </Button>
        </DialogActions>
      </Dialog>
      {/*Export pdf Data  */}
      <Dialog
        open={isPdfFilterOpen}
        onClose={handleClosePdfFilterMod}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
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
              downloadPdfTwo("filtered");
              setIsPdfFilterOpen(false);
            }}
          >
            Export Filtered Data
          </Button>
          <Button
            variant="contained"
            onClick={(e) => {
              downloadPdfTwo("overall");
              setIsPdfFilterOpen(false);
            }}
          >
            Export Over All Data
          </Button>
        </DialogActions>
      </Dialog>
      {/* for second */}
      {/*Export XL Data  */}
      <Dialog
        open={isFilterOpenNew}
        onClose={handleCloseFilterModNew}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent
          sx={{
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {fileFormatNew === "xl" ? (
            <>
              <IconButton
                aria-label="close"
                onClick={handleCloseFilterModNew}
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
                onClick={handleCloseFilterModNew}
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
              handleExportXLNew("filtered");
            }}
          >
            Export Filtered Data
          </Button>
          <Button
            autoFocus
            variant="contained"
            onClick={(e) => {
              handleExportXLNew("overall");
            }}
          >
            Export Over All Data
          </Button>
        </DialogActions>
      </Dialog>
      {/*Export pdf Data  */}
      <Dialog
        open={isPdfFilterOpenNew}
        onClose={handleClosePdfFilterModNew}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
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
            onClick={handleClosePdfFilterModNew}
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
              downloadPdfNew("filtered");
              setIsPdfFilterOpenNew(false);
            }}
          >
            Export Filtered Data
          </Button>
          <Button
            variant="contained"
            onClick={(e) => {
              downloadPdfNew("overall");
              setIsPdfFilterOpenNew(false);
            }}
          >
            Export Over All Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit DIALOG */}
      <Dialog
        open={isEditOpen}
        onClose={handleCloseModEdit}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xl"
        fullWidth={true}
        sx={{
          overflow: "visible",
          "& .MuiPaper-root": {
            overflow: "auto",
          },
        }}
      >
        <Box sx={{ padding: "20px 50px" }}>
          <>
            <Typography sx={userStyle.SubHeaderText}>
              All Pending Check List
            </Typography>
            <br />
            <br />
            <Grid container spacing={2}>
              <Grid item md={12} xs={12} sm={12}>
                <FormControl
                  fullWidth
                  size="small"
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    border: "1px solid black",
                    borderRadius: "20px",
                  }}
                >
                  <Typography sx={{ fontSize: "1rem", textAlign: "center" }}>
                    Name:{" "}
                    <span
                      style={{
                        fontWeight: "500",
                        fontSize: "1.2rem",
                        display: "inline-block",
                        textAlign: "center",
                      }}
                    >
                      {" "}
                      {`${getDetails?.fullname}`}
                    </span>
                  </Typography>
                </FormControl>
              </Grid>
            </Grid>
            <br />
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontSize: "1.2rem" }}>
                      Details
                    </TableCell>
                    <TableCell style={{ fontSize: "1.2rem" }}>Field</TableCell>
                    <TableCell style={{ fontSize: "1.2rem" }}>
                      Allotted To
                    </TableCell>
                    <TableCell style={{ fontSize: "1.2rem" }}>
                      Completed By
                    </TableCell>
                    <TableCell style={{ fontSize: "1.2rem" }}>
                      Completed At
                    </TableCell>
                    <TableCell style={{ fontSize: "1.2rem" }}>Status</TableCell>

                    <TableCell style={{ fontSize: "1.2rem" }}>
                      Category
                    </TableCell>
                    <TableCell style={{ fontSize: "1.2rem" }}>
                      Sub Category
                    </TableCell>

                    {/* Add more table headers as needed */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupDetails?.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.details}</TableCell>
                      {(() => {
                        switch (row.checklist) {
                          case "Text Box":
                            return (
                              <TableCell>
                                <OutlinedInput
                                  style={{ height: "32px" }}
                                  value={row.data}
                                  readOnly
                                />
                              </TableCell>
                            );
                          case "Text Box-number":
                            return (
                              <TableCell>
                                <OutlinedInput
                                  value={row.data}
                                  style={{ height: "32px" }}
                                  type="text"
                                  readOnly
                                />
                              </TableCell>
                            );
                          case "Text Box-alpha":
                            return (
                              <TableCell>
                                <OutlinedInput
                                  style={{ height: "32px" }}
                                  value={row.data}
                                  readOnly
                                />
                              </TableCell>
                            );
                          case "Text Box-alphanumeric":
                            return (
                              <TableCell>
                                <OutlinedInput
                                  style={{ height: "32px" }}
                                  value={row.data}
                                  readOnly
                                />
                              </TableCell>
                            );
                          case "Attachments":
                            return (
                              <TableCell>
                                <div>
                                  <InputLabel sx={{ m: 1 }}>File</InputLabel>

                                  <div>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        marginTop: "10px",
                                        gap: "10px",
                                      }}
                                    >
                                      {row.files && (
                                        <Grid
                                          container
                                          spacing={2}
                                          sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                          }}
                                        >
                                          <Grid
                                            item
                                            lg={8}
                                            md={8}
                                            sm={8}
                                            xs={8}
                                          >
                                            <Typography>
                                              {row.files.name}
                                            </Typography>
                                          </Grid>
                                          <Grid
                                            item
                                            lg={1}
                                            md={1}
                                            sm={1}
                                            xs={1}
                                          >
                                            <VisibilityOutlinedIcon
                                              style={{
                                                fontsize: "large",
                                                color: "#357AE8",
                                                cursor: "pointer",
                                              }}
                                              onClick={() =>
                                                renderFilePreviewEdit(row.files)
                                              }
                                            />
                                          </Grid>
                                        </Grid>
                                      )}
                                    </Box>
                                  </div>
                                </div>
                              </TableCell>
                            );
                          case "Pre-Value":
                            return (
                              <TableCell>
                                <Typography>{row?.data}</Typography>
                              </TableCell>
                            );
                          case "Date":
                            return (
                              <TableCell>
                                <OutlinedInput
                                  style={{ height: "32px" }}
                                  type="date"
                                  value={row.data}
                                  readOnly
                                />
                              </TableCell>
                            );
                          case "Time":
                            return (
                              <TableCell>
                                <OutlinedInput
                                  style={{ height: "32px" }}
                                  type="time"
                                  value={row.data}
                                  readOnly
                                />
                              </TableCell>
                            );
                          case "DateTime":
                            return (
                              <TableCell>
                                <Stack direction="row" spacing={2}>
                                  <OutlinedInput
                                    style={{ height: "32px" }}
                                    type="date"
                                    value={dateValue[index]}
                                    readOnly
                                  />
                                  <OutlinedInput
                                    type="time"
                                    style={{ height: "32px" }}
                                    value={timeValue[index]}
                                    readOnly
                                  />
                                </Stack>
                              </TableCell>
                            );
                          case "Date Multi Span":
                            return (
                              <TableCell>
                                <Stack direction="row" spacing={2}>
                                  <OutlinedInput
                                    style={{ height: "32px" }}
                                    type="date"
                                    value={dateValueMultiFrom[index]}
                                    readOnly
                                  />
                                  <OutlinedInput
                                    type="date"
                                    style={{ height: "32px" }}
                                    value={dateValueMultiTo[index]}
                                    readOnly
                                  />
                                </Stack>
                              </TableCell>
                            );
                          case "Date Multi Span Time":
                            return (
                              <TableCell>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                  }}
                                >
                                  <Stack direction="row" spacing={2}>
                                    <OutlinedInput
                                      style={{ height: "32px" }}
                                      type="date"
                                      value={firstDateValue[index]}
                                      readOnly
                                    />
                                    <OutlinedInput
                                      type="time"
                                      style={{ height: "32px" }}
                                      value={firstTimeValue[index]}
                                      readOnly
                                    />
                                  </Stack>
                                  <Stack direction="row" spacing={2}>
                                    <OutlinedInput
                                      type="date"
                                      style={{ height: "32px" }}
                                      value={secondDateValue[index]}
                                      readOnly
                                    />
                                    <OutlinedInput
                                      style={{ height: "32px" }}
                                      type="time"
                                      value={secondTimeValue[index]}
                                      readOnly
                                    />
                                  </Stack>
                                </div>
                              </TableCell>
                            );
                          case "Date Multi Random":
                            return (
                              <TableCell>
                                <OutlinedInput
                                  style={{ height: "32px" }}
                                  type="date"
                                  value={row.data}
                                  readOnly
                                />
                              </TableCell>
                            );
                          case "Date Multi Random Time":
                            return (
                              <TableCell>
                                <Stack direction="row" spacing={2}>
                                  <OutlinedInput
                                    style={{ height: "32px" }}
                                    type="date"
                                    value={dateValueRandom[index]}
                                    readOnly
                                  />
                                  <OutlinedInput
                                    type="time"
                                    style={{ height: "32px" }}
                                    value={timeValueRandom[index]}
                                    readOnly
                                  />
                                </Stack>
                              </TableCell>
                            );
                          case "Radio":
                            return (
                              <TableCell>
                                <FormControl component="fieldset">
                                  <RadioGroup
                                    value={row.data}
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row !important",
                                    }}
                                  >
                                    <FormControlLabel
                                      value="No"
                                      control={<Radio />}
                                      label="No"
                                    />
                                    <FormControlLabel
                                      value="Yes"
                                      control={<Radio />}
                                      label="Yes"
                                    />
                                  </RadioGroup>
                                </FormControl>
                              </TableCell>
                            );

                          default:
                            return <TableCell></TableCell>; // Default case
                        }
                      })()}
                      <TableCell>
                        {Array.isArray(row?.employee) &&
                          row.employee.map((item, index) => (
                            <Typography key={index} variant="body1">
                              {`${index + 1}. ${item}, `}
                            </Typography>
                          ))}
                      </TableCell>
                      <TableCell>
                        <Typography>{row?.completedby}</Typography>
                      </TableCell>
                      <TableCell>
                        {row.completedat &&
                          moment(row.completedat).format(
                            "DD-MM-YYYY hh:mm:ss A"
                          )}
                      </TableCell>

                      <TableCell>
                        {row.checklist === "DateTime" ? (
                          ((row.data !== undefined && row.data !== "") ||
                            row.files !== undefined) &&
                            row.data.length === 16 ? (
                            <Typography>Completed</Typography>
                          ) : (
                            <Typography>Pending</Typography>
                          )
                        ) : row.checklist === "Date Multi Span" ? (
                          ((row.data !== undefined && row.data !== "") ||
                            row.files !== undefined) &&
                            row.data.length === 21 ? (
                            <Typography>Completed</Typography>
                          ) : (
                            <Typography>Pending</Typography>
                          )
                        ) : row.checklist === "Date Multi Span Time" ? (
                          ((row.data !== undefined && row.data !== "") ||
                            row.files !== undefined) &&
                            row.data.length === 33 ? (
                            <Typography>Completed</Typography>
                          ) : (
                            <Typography>Pending</Typography>
                          )
                        ) : row.checklist === "Date Multi Random Time" ? (
                          ((row.data !== undefined && row.data !== "") ||
                            row.files !== undefined) &&
                            row.data.length === 16 ? (
                            <Typography>Completed</Typography>
                          ) : (
                            <Typography>Pending</Typography>
                          )
                        ) : (row.data !== undefined && row.data !== "") ||
                          row.files !== undefined ? (
                          <Typography>Completed</Typography>
                        ) : (
                          <Typography>Pending</Typography>
                        )}
                      </TableCell>

                      <TableCell>{row.category}</TableCell>
                      <TableCell>{row.subcategory}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <br /> <br /> <br />
            <Grid container>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCloseModEdit}
                sx={buttonStyles.btncancel}
              >
                Back
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>
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
    </Box>
  );
}

export default AllPendingCheckList;
