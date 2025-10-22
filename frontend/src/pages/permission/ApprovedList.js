import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from "react";
import { FaFileExcel, FaFileCsv, FaPrint, FaFilePdf, FaSearch } from 'react-icons/fa';
import { Box, Typography, OutlinedInput, Select, MenuItem, Dialog, DialogContent, DialogActions, FormControl, Grid, Button, Popover, IconButton, InputAdornment, Tooltip } from "@mui/material";
import { userStyle } from "../../pageStyle";
import { handleApiError } from "../../components/Errorhandling";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import { SERVICE } from "../../services/Baseservice";
import { useReactToPrint } from "react-to-print";
import { UserRoleAccessContext, AuthContext } from "../../context/Appcontext";
import Headtitle from "../../components/Headtitle";
import { ThreeDots } from "react-loader-spinner";
import { saveAs } from "file-saver";
import ImageIcon from "@mui/icons-material/Image";
import moment from 'moment';
import { IoMdOptions } from "react-icons/io";
import { MdClose } from "react-icons/md";
import domtoimage from 'dom-to-image';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import ExportData from "../../components/ExportData";
import MessageAlert from "../../components/MessageAlert";
import PageHeading from "../../components/PageHeading";
import AdvancedSearchBar from '../../components/SearchbarEbList';
import ManageColumnsContent from "../../components/ManageColumn";
import ResizeObserver from 'resize-observer-polyfill';
window.ResizeObserver = ResizeObserver;

function ApproveList() {

  let today = new Date();
  var yyyy = today.getFullYear();

  const gridRefTableApprovedPerm = useRef(null);
  const gridRefImageApprovedPerm = useRef(null);

  const { auth } = useContext(AuthContext);
  const { isUserRoleCompare, isUserRoleAccess, pageName, setPageName, } = useContext(UserRoleAccessContext);

  const [isPermissions, setIsPermissions] = useState([]);
  const [applyleaveCheck, setApplyleavecheck] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const [items, setItems] = useState([]);

  // State to track advanced filter
  const [advancedFilter, setAdvancedFilter] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [columnApi, setColumnApi] = useState(null);
  const [filteredDataItems, setFilteredDataItems] = useState(isPermissions);
  const [filteredRowData, setFilteredRowData] = useState([]);

  // Datatable
  const [pageApprovedPerm, setPageApprovedPerm] = useState(1);
  const [pageSizeApprovedPerm, setPageSizeApprovedPerm] = useState(10);
  const [searchQueryApprovedPerm, setSearchQueryApprovedPerm] = useState("");
  const [totalPagesApprovedPerm, setTotalPagesApprovedPerm] = useState(1);

  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const handleClickOpenerr = () => { setIsErrorOpen(true); };
  const handleCloseerr = () => { setIsErrorOpen(false); };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
  // page refersh reload
  const handleCloseFilterMod = () => { setIsFilterOpen(false); };
  const handleClosePdfFilterMod = () => { setIsPdfFilterOpen(false); };

  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState("");
  const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
  const handleClickOpenPopupMalert = () => { setOpenPopupMalert(true); };
  const handleClosePopupMalert = () => { setOpenPopupMalert(false); };

  // Manage Columns
  const [isManageColumnsOpenApprovedPerm, setManageColumnsOpenApprovedPerm] = useState(false);
  const [anchorElApprovedPerm, setAnchorElApprovedPerm] = useState(null);
  const [searchQueryManageApprovedPerm, setSearchQueryManageApprovedPerm] = useState("");

  const handleOpenManageColumnsApprovedPerm = (event) => {
    setAnchorElApprovedPerm(event.currentTarget);
    setManageColumnsOpenApprovedPerm(true);
  };
  const handleCloseManageColumnsApprovedPerm = () => {
    setManageColumnsOpenApprovedPerm(false);
    setSearchQueryManageApprovedPerm("");
  };

  const openApprovedPerm = Boolean(anchorElApprovedPerm);
  const idApprovedPerm = openApprovedPerm ? "simple-popover" : undefined;

  // Search bar
  const [anchorElSearchApprovedPerm, setAnchorElSearchApprovedPerm] = React.useState(null);
  const handleClickSearchApprovedPerm = (event) => {
    setAnchorElSearchApprovedPerm(event.currentTarget);
  };
  const handleCloseSearchApprovedPerm = () => {
    setAnchorElSearchApprovedPerm(null);
    setSearchQueryApprovedPerm("");
  };

  const openSearchApprovedPerm = Boolean(anchorElSearchApprovedPerm);
  const idSearchApprovedPerm = openSearchApprovedPerm ? 'simple-popover' : undefined;

  // Show All Columns & Manage Columns
  const initialColumnVisibilityApprovedPerm = {
    serialNumber: true,
    checkbox: true,
    requesthours: true,
    fromtime: true,
    endtime: true,
    employeename: true,
    employeeid: true,
    date: true,
    reasonforpermission: true,
    reportingto: true,
    actionby: true,
    status: true,
    actions: true,
  };

  const [columnVisibilityApprovedPerm, setColumnVisibilityApprovedPerm] = useState(initialColumnVisibilityApprovedPerm);

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

  // Table row color
  const getRowStyle = (params) => {
    if (params.node.rowIndex % 2 === 0) {
      return { background: '#f0f0f0' }; // Even row
    } else {
      return { background: '#ffffff' }; // Odd row
    }
  }

  useEffect(() => {
    getapi();
  }, []);

  const getapi = async () => {
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        'Authorization': `Bearer ${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String("Approved Permission"),
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
    fetchApplyPermissions();
  }, [])

  const fetchApplyPermissions = async () => {
    setPageName(!pageName)
    try {
      let res_vendor = await axios.get(SERVICE.PERMISSIONS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setApplyleavecheck(true);
      let Approve = isUserRoleAccess?.role?.includes("Manager") || isUserRoleAccess?.role?.includes("HiringManager") || isUserRoleAccess?.role?.includes("HR") || isUserRoleAccess?.role?.includes("Superadmin") ? res_vendor?.data?.permissions.filter((data) => data.status === "Approved") : res_vendor?.data?.permissions.filter((data) => data.employeename === isUserRoleAccess.companyname && data.status === "Approved");
      const itemsWithSerialNumber = Approve?.map((item, index) => {
        const militaryTime = item.fromtime;
        const militaryTimeArray = militaryTime.split(":");
        const hours = parseInt(militaryTimeArray[0], 10);
        const minutes = militaryTimeArray[1];

        const convertedTime = new Date(yyyy, 0, 1, hours, minutes).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        return {
          id: item._id,
          serialNumber: index + 1,
          employeeid: item.employeeid,
          employeename: item.employeename,
          fromtime: convertedTime,
          date: moment(item.date).format('DD-MM-YYYY'),
          endtime: item.endtime,
          requesthours: item.requesthours,
          reasonforpermission: item.reasonforpermission,
          actionby: item.actionby,
          status: item.status,
        };
      });
      setIsPermissions(itemsWithSerialNumber);
      setFilteredDataItems(itemsWithSerialNumber);
      setTotalPagesApprovedPerm(Math.ceil(itemsWithSerialNumber.length / pageSizeApprovedPerm));
    } catch (err) { setApplyleavecheck(true); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  const addSerialNumber = (datas) => {
    setItems(datas);
  };

  useEffect(() => {
    addSerialNumber(isPermissions);
  }, [isPermissions]);

  const defaultColDef = useMemo(() => {
    return {
      filter: true,
      resizable: true,
      filterParams: {
        buttons: ["apply", "reset", "cancel"],
      },
    };
  }, []);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
    setColumnApi(params.columnApi);
  }, []);

  // Function to handle filter changes
  const onFilterChanged = () => {
    if (gridApi) {
      const filterModel = gridApi.getFilterModel(); // Get the current filter model

      // Check if filters are active
      if (Object.keys(filterModel).length === 0) {
        // No filters active, clear the filtered data state
        setFilteredRowData([]);
      } else {
        // Filters are active, capture filtered data
        const filteredData = [];
        gridApi.forEachNodeAfterFilterAndSort((node) => {
          filteredData.push(node.data); // Collect filtered row data
        });
        setFilteredRowData(filteredData);
      }
    }
  };

  const onPaginationChanged = useCallback(() => {
    if (gridRefTableApprovedPerm.current) {
      const gridApi = gridRefTableApprovedPerm.current.api;
      const currentPage = gridApi.paginationGetCurrentPage() + 1;
      const totalPagesApprovedPerm = gridApi.paginationGetTotalPages();
      setPageApprovedPerm(currentPage);
      setTotalPagesApprovedPerm(totalPagesApprovedPerm);
    }
  }, []);

  const columnDataTableApprovedPerm = [
    { field: "serialNumber", headerName: "SNo", flex: 0, width: 80, hide: !columnVisibilityApprovedPerm.serialNumber, headerClassName: "bold-header", pinned: 'left', lockPinned: true, },
    { field: "employeeid", headerName: "Employee Id", flex: 0, width: 160, hide: !columnVisibilityApprovedPerm.employeeid, headerClassName: "bold-header", pinned: 'left', lockPinned: true, },
    { field: "employeename", headerName: "Employee Name", flex: 0, width: 200, hide: !columnVisibilityApprovedPerm.employeename, headerClassName: "bold-header", pinned: 'left', lockPinned: true, },
    { field: "date", headerName: "Date", flex: 0, width: 120, hide: !columnVisibilityApprovedPerm.date, headerClassName: "bold-header" },
    { field: "fromtime", headerName: "From Time", flex: 0, width: 120, hide: !columnVisibilityApprovedPerm.fromtime, headerClassName: "bold-header" },
    { field: "requesthours", headerName: "Request Hours", flex: 0, width: 100, hide: !columnVisibilityApprovedPerm.requesthours, headerClassName: "bold-header" },
    { field: "endtime", headerName: "End Time", flex: 0, width: 120, hide: !columnVisibilityApprovedPerm.endtime, headerClassName: "bold-header" },
    { field: "reasonforpermission", headerName: "Reason for Permission", flex: 0, width: 180, hide: !columnVisibilityApprovedPerm.reasonforpermission, headerClassName: "bold-header" },
    { field: isUserRoleAccess?.role?.includes("Manager") || isUserRoleAccess?.role?.includes("HiringManager") || isUserRoleAccess?.role?.includes("HR") || isUserRoleAccess?.role?.includes("Superadmin") ? "actionby" : "", headerName: isUserRoleAccess?.role?.includes("Manager") || isUserRoleAccess?.role?.includes("HiringManager") || isUserRoleAccess?.role?.includes("HR") || isUserRoleAccess?.role?.includes("Superadmin") ? "Approved By" : "", flex: 0, width: 200, hide: !columnVisibilityApprovedPerm.actionby, headerClassName: "bold-header" },
    {
      field: isUserRoleAccess?.role?.includes("Manager") || isUserRoleAccess?.role?.includes("HiringManager") || isUserRoleAccess?.role?.includes("HR") || isUserRoleAccess?.role?.includes("Superadmin") ? "status" : "",
      headerName: isUserRoleAccess?.role?.includes("Manager") || isUserRoleAccess?.role?.includes("HiringManager") || isUserRoleAccess?.role?.includes("HR") || isUserRoleAccess?.role?.includes("Superadmin") ? "Status" : "",
      flex: 0,
      width: 150,
      hide: !columnVisibilityApprovedPerm.status,
      headerClassName: "bold-header",
      cellRenderer: (params) =>
        <Grid sx={{ display: 'flex' }}>
          {isUserRoleAccess?.role?.includes("Manager") || isUserRoleAccess?.role?.includes("HiringManager") || isUserRoleAccess?.role?.includes("HR") || isUserRoleAccess?.role?.includes("Superadmin") ? (
            <Button
              variant="contained"
              style={{
                margin: '5px',
                padding: "5px",
                backgroundColor: params.value === "Applied" ? "#FFC300" : params.value === "Rejected" ? "red" : params.value === "Approved" ? "green" : "inherit",
                color: params.value === "Applied" ? "black" : params.value === "Rejected" ? "white" : "white",
                fontSize: "10px",
                width: "90px",
                fontWeight: "bold",
                cursor: 'default'
              }}
            >
              {params.value}
            </Button>
          ) : null}
        </Grid>
    },
  ];

  // Datatable
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQueryApprovedPerm(value);
    applyNormalFilter(value);
    setFilteredRowData([]);
  };

  const applyNormalFilter = (searchValue) => {

    // Split the search query into individual terms
    const searchTerms = searchValue.toLowerCase().split(" ");

    // Modify the filtering logic to check each term
    const filtered = items?.filter((item) => {
      return searchTerms.every((term) =>
        Object.values(item).join(" ").toLowerCase().includes(term)
      );
    });
    setFilteredDataItems(filtered);
    setPageApprovedPerm(1);
  };

  const applyAdvancedFilter = (filters, logicOperator) => {
    // Apply filtering logic with multiple conditions
    const filtered = items?.filter((item) => {
      return filters.reduce((acc, filter, index) => {
        const { column, condition, value } = filter;
        const itemValue = String(item[column])?.toLowerCase();
        const filterValue = String(value).toLowerCase();

        let match;
        switch (condition) {
          case "Contains":
            match = itemValue.includes(filterValue);
            break;
          case "Does Not Contain":
            match = !itemValue?.includes(filterValue);
            break;
          case "Equals":
            match = itemValue === filterValue;
            break;
          case "Does Not Equal":
            match = itemValue !== filterValue;
            break;
          case "Begins With":
            match = itemValue.startsWith(filterValue);
            break;
          case "Ends With":
            match = itemValue.endsWith(filterValue);
            break;
          case "Blank":
            match = !itemValue;
            break;
          case "Not Blank":
            match = !!itemValue;
            break;
          default:
            match = true;
        }

        // Combine conditions with AND/OR logic
        if (index === 0) {
          return match; // First filter is applied directly
        } else if (logicOperator === "AND") {
          return acc && match;
        } else {
          return acc || match;
        }
      }, true);
    });

    setFilteredDataItems(filtered); // Update filtered data
    setAdvancedFilter(filters);
    // handleCloseSearchApprovedPerm(); // Close the popover after search
  };

  // Undo filter funtion
  const handleResetSearch = () => {
    setAdvancedFilter(null);
    setSearchQueryApprovedPerm("");
    setFilteredDataItems(isPermissions);
  };

  // Show filtered combination in the search bar
  const getSearchDisplay = () => {
    if (advancedFilter && advancedFilter.length > 0) {
      return advancedFilter.map((filter, index) => {
        let showname = columnDataTableApprovedPerm.find(col => col.field === filter.column)?.headerName;
        return `${showname} ${filter.condition} "${filter.value}"`;
      }).join(' ' + (advancedFilter.length > 1 ? advancedFilter[1].condition : '') + ' ');
    }
    return searchQueryApprovedPerm;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPagesApprovedPerm) {
      setPageApprovedPerm(newPage);
      gridRefTableApprovedPerm.current.api.paginationGoToPage(newPage - 1);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSizeApprovedPerm(newSize);
    if (gridApi) {
      gridApi.paginationSetPageSize(newSize);
    }
  };

  // Show All Columns functionality
  const handleShowAllColumns = () => {
    const updatedVisibility = { ...columnVisibilityApprovedPerm };
    for (const columnKey in updatedVisibility) {
      updatedVisibility[columnKey] = true;
    }
    setColumnVisibilityApprovedPerm(updatedVisibility);
  };

  // // Function to filter columns based on search query
  const filteredColumns = columnDataTableApprovedPerm.filter((column) => column.headerName.toLowerCase().includes(searchQueryManageApprovedPerm.toLowerCase()));

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Manage Columns functionality
  const toggleColumnVisibility = (field) => {
    if (!gridApi) return;

    setColumnVisibilityApprovedPerm((prevVisibility) => {
      const newVisibility = !prevVisibility[field];

      // Update the visibility in the grid
      gridApi.setColumnVisible(field, newVisibility);

      return {
        ...prevVisibility,
        [field]: newVisibility,
      };
    });
  };

  const handleColumnMoved = useCallback(debounce((event) => {
    if (!event.columnApi) return;

    const visible_columns = event.columnApi.getAllColumns().filter(col => {
      const colState = event.columnApi.getColumnState().find(state => state.colId === col.colId);
      return colState && !colState.hide;
    }).map(col => col.colId);

    setColumnVisibilityApprovedPerm((prevVisibility) => {
      const updatedVisibility = { ...prevVisibility };

      // Ensure columns that are visible stay visible
      Object.keys(updatedVisibility).forEach(colId => {
        updatedVisibility[colId] = visible_columns.includes(colId);
      });

      return updatedVisibility;
    });
  }, 300), []);

  const handleColumnVisible = useCallback((event) => {
    const colId = event.column.getColId();

    // Update visibility based on event, but only when explicitly triggered by grid
    setColumnVisibilityApprovedPerm((prevVisibility) => ({
      ...prevVisibility,
      [colId]: event.visible, // Set visibility directly from the event
    }));
  }, []);

  // Excel
  const [fileFormat, setFormat] = useState('');
  let exportColumnNamescrtHr = ["Employee Name", "Employee Id", "Date", "From Time", "Request Hours", "End Time", "Reason for Permission", "Status", "Approved By",]
  let exportRowValuescrtHr = ["employeename", "employeeid", "date", "fromtime", "requesthours", "endtime", "reasonforpermission", "status", "actionby",]
  let exportColumnNamescrtEmployee = ["Employee Name", "Employee Id", "Date", "From Time", "Request Hours", "End Time", "Reason for Permission",]
  let exportRowValuescrtEmployee = ["employeename", "employeeid", "date", "fromtime", "requesthours", "endtime", "reasonforpermission",]

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Permission Approved List",
    pageStyle: "print",
  });

  // image
  const handleCaptureImage = () => {
    if (gridRefImageApprovedPerm.current) {
      domtoimage.toBlob(gridRefImageApprovedPerm.current)
        .then((blob) => {
          saveAs(blob, "Permission Approved List.png");
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };

  // Pagination for innter filter
  const getVisiblePageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 3;

    const startPage = Math.max(1, pageApprovedPerm - 1);
    const endPage = Math.min(totalPagesApprovedPerm, startPage + maxVisiblePages - 1);

    // Loop through and add visible pageApprovedPerm numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // If there are more pages after the last visible pageApprovedPerm, show ellipsis
    if (endPage < totalPagesApprovedPerm) {
      pageNumbers.push("...");
    }

    return pageNumbers;
  };

  // Pagination for outer filter
  const filteredData = filteredDataItems?.slice((pageApprovedPerm - 1) * pageSizeApprovedPerm, pageApprovedPerm * pageSizeApprovedPerm);
  const totalPagesApprovedPermOuter = Math.ceil(filteredDataItems?.length / pageSizeApprovedPerm);
  const visiblePages = Math.min(totalPagesApprovedPermOuter, 3);
  const firstVisiblePage = Math.max(1, pageApprovedPerm - 1);
  const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPagesApprovedPermOuter);
  const pageNumbers = [];
  const indexOfLastItem = pageApprovedPerm * pageSizeApprovedPerm;
  const indexOfFirstItem = indexOfLastItem - pageSizeApprovedPerm;
  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) { pageNumbers.push(i); }

  return (
    <Box>
      <Headtitle title={"Approved Permission"} />
      {/* ****** Header Content ****** */}
      <PageHeading
        title="Approved Permission"
        modulename="Leave&Permission"
        submodulename="Permission"
        mainpagename="Approved Permission"
        subpagename=""
        subsubpagename=""
      />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes("lapprovedpermission") && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Approved Permission List</Typography>
            </Grid>
            <Grid container spacing={2} style={userStyle.dataTablestyle}>
              <Grid item md={2} xs={12} sm={12}>
                <Box>
                  <label>Show entries:</label>
                  <Select
                    id="pageSizeSelect"
                    value={pageSizeApprovedPerm}
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
                    <MenuItem value={isPermissions?.length}>All</MenuItem>
                  </Select>
                </Box>
              </Grid>
              <Grid item md={8} xs={12} sm={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Box>
                  {isUserRoleCompare?.includes("excelapprovedpermission") && (
                    <>
                      <Button onClick={(e) => {
                        setIsFilterOpen(true)
                        setFormat("xl")
                      }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("csvapprovedpermission") && (
                    <>
                      <Button onClick={(e) => {
                        setIsFilterOpen(true)
                        setFormat("csv")
                      }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("printapprovedpermission") && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("pdfapprovedpermission") && (
                    <>
                      <Button sx={userStyle.buttongrp}
                        onClick={() => {
                          setIsPdfFilterOpen(true)
                        }}
                      ><FaFilePdf />&ensp;Export to PDF&ensp;</Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("imageapprovedpermission") && (
                    <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}>
                      {" "}
                      <ImageIcon sx={{ fontSize: "15px" }} /> &ensp;Image&ensp;{" "}
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item md={2} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <OutlinedInput size="small"
                    id="outlined-adornment-weight"
                    startAdornment={
                      <InputAdornment position="start">
                        <FaSearch />
                      </InputAdornment>
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        {advancedFilter && (
                          <IconButton onClick={handleResetSearch}>
                            <MdClose />
                          </IconButton>
                        )}
                        <Tooltip title="Show search options">
                          <span>
                            <IoMdOptions style={{ cursor: 'pointer', }} onClick={handleClickSearchApprovedPerm} />
                          </span>
                        </Tooltip>
                      </InputAdornment>}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{ 'aria-label': 'weight', }}
                    type="text"
                    value={getSearchDisplay()}
                    onChange={handleSearchChange}
                    placeholder="Type to search..."
                    disabled={!!advancedFilter}
                  />
                </FormControl>
              </Grid>
            </Grid><br />
            <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>  Show All Columns </Button>&ensp;
            <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumnsApprovedPerm}> Manage Columns  </Button><br /><br />
            {!applyleaveCheck ? (
              <>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ width: "100%", }} className={"ag-theme-quartz"} ref={gridRefImageApprovedPerm} >
                  <AgGridReact
                    rowData={filteredDataItems}
                    columnDefs={columnDataTableApprovedPerm.filter((column) => columnVisibilityApprovedPerm[column.field])}
                    ref={gridRefTableApprovedPerm}
                    defaultColDef={defaultColDef}
                    domLayout={"autoHeight"}
                    getRowStyle={getRowStyle}
                    pagination={true}
                    paginationPageSize={pageSizeApprovedPerm}
                    onPaginationChanged={onPaginationChanged}
                    onGridReady={onGridReady}
                    onColumnMoved={handleColumnMoved}
                    onColumnVisible={handleColumnVisible}
                    onFilterChanged={onFilterChanged}
                    // suppressPaginationPanel={true}
                    suppressSizeToFit={true}
                    suppressAutoSize={true}
                    suppressColumnVirtualisation={true}
                    colResizeDefault={"shift"}
                    cellSelection={true}
                    copyHeadersToClipboard={true}
                  />
                </Box>
                {/* show and hide based on the inner filter and outer filter */}
                {/* <Box style={userStyle.dataTablestyle}>
                  <Box>
                    Showing{" "}
                    {
                      gridApi && gridApi.getFilterModel() && Object.keys(gridApi.getFilterModel()).length === 0 ? (
                        (filteredDataItems.length > 0 ? (pageApprovedPerm - 1) * pageSizeApprovedPerm + 1 : 0)
                      ) : (
                        filteredRowData.length > 0 ? (pageApprovedPerm - 1) * pageSizeApprovedPerm + 1 : 0
                      )
                    }{" "}to{" "}
                    {
                      gridApi && gridApi.getFilterModel() && Object.keys(gridApi.getFilterModel()).length === 0 ? (
                        Math.min(pageApprovedPerm * pageSizeApprovedPerm, filteredDataItems.length)
                      ) : (
                        filteredRowData.length > 0 ? Math.min(pageApprovedPerm * pageSizeApprovedPerm, filteredRowData.length) : 0
                      )
                    }{" "}of{" "}
                    {
                      gridApi && gridApi.getFilterModel() && Object.keys(gridApi.getFilterModel()).length === 0 ? (
                        filteredDataItems.length
                      ) : (
                        filteredRowData.length
                      )
                    } entries
                  </Box>
                  <Box>
                    <Button onClick={() => handlePageChange(1)} disabled={pageApprovedPerm === 1} sx={userStyle.paginationbtn}  > <FirstPageIcon /> </Button>
                    <Button onClick={() => handlePageChange(pageApprovedPerm - 1)} disabled={pageApprovedPerm === 1} sx={userStyle.paginationbtn}  > <NavigateBeforeIcon />  </Button>
                    {getVisiblePageNumbers().map((pageNumber, index) => (
                      <Button
                        key={index}
                        onClick={() => pageNumber !== "..." && handlePageChange(pageNumber)}
                        sx={{
                          ...userStyle.paginationbtn,
                          ...(pageNumber === "..." && {
                            cursor: "default",
                            color: "black",
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: "transparent",
                            border: "none",
                            "&:hover": { backgroundColor: "transparent", boxShadow: "none", },
                          }),
                        }}
                        className={pageApprovedPerm === pageNumber ? "active" : ""}
                       disabled={pageApprovedPerm === pageNumber}
                      >
                        {pageNumber}
                      </Button>
                    ))}
                    <Button onClick={() => handlePageChange(pageApprovedPerm + 1)} disabled={pageApprovedPerm === totalPagesApprovedPerm} sx={userStyle.paginationbtn} > <NavigateNextIcon /> </Button>
                    <Button onClick={() => handlePageChange(totalPagesApprovedPerm)} disabled={pageApprovedPerm === totalPagesApprovedPerm} sx={userStyle.paginationbtn} ><LastPageIcon /> </Button>
                  </Box>
                </Box> */}
              </>
            )}
          </Box>
        </>
      )}

      {/* Manage Column */}
      <Popover
        id={idApprovedPerm}
        open={isManageColumnsOpenApprovedPerm}
        anchorEl={anchorElApprovedPerm}
        onClose={handleCloseManageColumnsApprovedPerm}
        anchorOrigin={{ vertical: "bottom", horizontal: "left", }}
      >
        <ManageColumnsContent
          handleClose={handleCloseManageColumnsApprovedPerm}
          searchQuery={searchQueryManageApprovedPerm}
          setSearchQuery={setSearchQueryManageApprovedPerm}
          filteredColumns={filteredColumns}
          columnVisibility={columnVisibilityApprovedPerm}
          toggleColumnVisibility={toggleColumnVisibility}
          setColumnVisibility={setColumnVisibilityApprovedPerm}
          initialColumnVisibility={initialColumnVisibilityApprovedPerm}
          columnDataTable={columnDataTableApprovedPerm}
        />
      </Popover>

      {/* Search Bar */}
      <Popover
        id={idSearchApprovedPerm}
        open={openSearchApprovedPerm}
        anchorEl={anchorElSearchApprovedPerm}
        onClose={handleCloseSearchApprovedPerm}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }}
      >
        <AdvancedSearchBar columns={columnDataTableApprovedPerm} onSearch={applyAdvancedFilter} initialSearchValue={searchQueryApprovedPerm} handleCloseSearch={handleCloseSearchApprovedPerm} />
      </Popover>

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

      <MessageAlert
        openPopup={openPopupMalert}
        handleClosePopup={handleClosePopupMalert}
        popupContent={popupContentMalert}
        popupSeverity={popupSeverityMalert}
      />
      {/* EXTERNAL COMPONENTS -------------- END */}
      {/* PRINT PDF EXCEL CSV */}
      <ExportData
        isFilterOpen={isFilterOpen}
        handleCloseFilterMod={handleCloseFilterMod}
        fileFormat={fileFormat}
        setIsFilterOpen={setIsFilterOpen}
        isPdfFilterOpen={isPdfFilterOpen}
        setIsPdfFilterOpen={setIsPdfFilterOpen}
        handleClosePdfFilterMod={handleClosePdfFilterMod}
        filteredDataTwo={(filteredRowData.length > 0 ? filteredRowData : filteredData) ?? []}
        itemsTwo={items ?? []}
        filename={"Permission Approved List"}
        exportColumnNames={!(isUserRoleAccess?.role?.includes("Manager") || isUserRoleAccess?.role?.includes("HiringManager") || isUserRoleAccess?.role?.includes("HR") || isUserRoleAccess?.role?.includes("Superadmin")) ? exportColumnNamescrtEmployee : exportColumnNamescrtHr}
        exportRowValues={!(isUserRoleAccess?.role?.includes("Manager") || isUserRoleAccess?.role?.includes("HiringManager") || isUserRoleAccess?.role?.includes("HR") || isUserRoleAccess?.role?.includes("Superadmin")) ? exportRowValuescrtEmployee : exportRowValuescrtHr}
        componentRef={componentRef}
      />
    </Box>
  );
}

export default ApproveList;
