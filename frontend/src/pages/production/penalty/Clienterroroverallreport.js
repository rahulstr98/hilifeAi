import React, { useContext, useEffect, useRef, useState } from "react";
import { Box, Button, FormControl, Grid, MenuItem, OutlinedInput, Popover, Select, Typography, Dialog, DialogContent, DialogActions, IconButton, } from "@mui/material";
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from "@mui/icons-material/Close";
import jsPDF from "jspdf";
import ImageIcon from "@mui/icons-material/Image";
import LoadingButton from "@mui/lab/LoadingButton";
import Selects from "react-select";
import axios from "axios";
import { saveAs } from "file-saver";
import "jspdf-autotable";
import { MultiSelect } from "react-multi-select-component";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import { handleApiError } from "../../../components/Errorhandling";
import Headtitle from "../../../components/Headtitle";
import { AuthContext, UserRoleAccessContext } from "../../../context/Appcontext";
import { userStyle, colourStyles } from "../../../pageStyle";
import { SERVICE } from "../../../services/Baseservice";
import { ThreeDots } from "react-loader-spinner";
import AlertDialog from "../../../components/Alert";
import ExportData from "../../../components/ExportData";
import MessageAlert from "../../../components/MessageAlert";
import PageHeading from "../../../components/PageHeading";
import AggregatedSearchBar from "../../../components/AggregatedSearchBar";
import AggridTable from "../../../components/AggridTable";
import domtoimage from 'dom-to-image';
import ManageColumnsContent from "../../../components/ManageColumn";
import moment from "moment";
import TextareaAutosize from "@mui/material/TextareaAutosize";

function ClientErrorOverAllReport() {

    let cellStyles = {
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: 'normal',
        // fontSize: "12px"
    }

    const gridRefTable = useRef(null);
    const gridRefTableImg = useRef(null);

    const { auth } = useContext(AuthContext);
    const { isUserRoleCompare, isUserRoleAccess, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);

    const [projects, setProjects] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loginOptions, setLoginOptions] = useState([]);
    const [selectedProject, setSelectedProject] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState([]);
    const [selectedLogin, setSelectedLogin] = useState([]);
    const [filterUser, setFilterUser] = useState({ fromdate: "", todate: "", });
    const [clientErrors, setClientErrors] = useState([]);
    const [items, setItems] = useState([]);
    const [loader, setLoader] = useState(false);
    const [loadingdeloverall, setloadingdeloverall] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);

    const [filteredRowData, setFilteredRowData] = useState([]);
    const [filteredChanges, setFilteredChanges] = useState(null);
    const [isHandleChange, setIsHandleChange] = useState(false);
    const [searchedString, setSearchedString] = useState("");

    //Datatable
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");

    const [openPopupMalert, setOpenPopupMalert] = useState(false);
    const [popupContentMalert, setPopupContentMalert] = useState("");
    const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
    const handleClickOpenPopupMalert = () => {
        setOpenPopupMalert(true);
        setloadingdeloverall(false);
    };
    const handleClosePopupMalert = () => { setOpenPopupMalert(false); };

    const [openPopup, setOpenPopup] = useState(false);
    const [popupContent, setPopupContent] = useState("");
    const [popupSeverity, setPopupSeverity] = useState("");
    const handleClickOpenPopup = () => { setOpenPopup(true); };
    const handleClosePopup = () => { setOpenPopup(false); };

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
    // page refersh reload
    const handleCloseFilterMod = () => { setIsFilterOpen(false); };
    const handleClosePdfFilterMod = () => { setIsPdfFilterOpen(false); };

    // Manage Columns
    const [searchQueryManage, setSearchQueryManage] = useState("");
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

    const [selectedMode, setSelectedMode] = useState("Last Week");
    const mode = [
        { label: "Today", value: "Today" },
        { label: "Tomorrow", value: "Tomorrow" },
        { label: "Yesterday", value: "Yesterday" },
        { label: "This Week", value: "This Week" },
        { label: "This Month", value: "This Month" },
        { label: "Last Week", value: "Last Week" },
        { label: "Last Month", value: "Last Month" },
        { label: "Custom", value: "Custom" }
    ]

    // Show All Columns & Manage Columns
    const initialColumnVisibility = {
        serialNumber: true,
        vendor: true,
        branch: true,
        employeeid: true,
        employeename: true,
        loginid: true,
        date: true,
        category: true,
        subcategory: true,
        documentnumber: true,
        fieldname: true,
        line: true,
        errorvalue: true,
        correctvalue: true,
        clienterror: true,
        clientamount: true,
        percentage: true,
        amount: true,
        requestreason: true,
        forwardreason: true,
        status: true,
    };

    const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

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

    //Access Module
    const pathname = window.location.pathname;
    const getapi = async () => {
        let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
            headers: {
                Authorization: `Bearer ${auth.APIToken}`,
            },
            empcode: String(isUserRoleAccess?.empcode),
            companyname: String(isUserRoleAccess?.companyname),
            pagename: String("Client Error Overall Report"),
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

    useEffect(() => {
        const today = new Date();

        const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
            const year = date.getFullYear();
            return `${year}-${month}-${day}`;
        };

        if (selectedMode === "Last Week") {
            const startOfLastWeek = new Date(today);
            startOfLastWeek.setDate(today.getDate() - (today.getDay() + 6) % 7 - 7); // Last Monday
            const endOfLastWeek = new Date(startOfLastWeek);
            endOfLastWeek.setDate(startOfLastWeek.getDate() + 6); // Last Sunday
            setFilterUser({ fromdate: formatDate(startOfLastWeek), todate: formatDate(endOfLastWeek) })
        }
    }, []);

    const getDateRange = (mode) => {
        const today = new Date();
        let fromdate, todate;

        const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        };

        switch (mode) {
            case "Today":
                fromdate = todate = formatDate(today);
                break;
            case "Tomorrow":
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                fromdate = todate = formatDate(tomorrow);
                break;
            case "Yesterday":
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                fromdate = todate = formatDate(yesterday);
                break;
            case "This Week":
                const startOfThisWeek = new Date(today);
                startOfThisWeek.setDate(today.getDate() - (today.getDay() + 6) % 7); // Monday
                const endOfThisWeek = new Date(startOfThisWeek);
                endOfThisWeek.setDate(startOfThisWeek.getDate() + 6); // Sunday
                fromdate = formatDate(startOfThisWeek);
                todate = formatDate(endOfThisWeek);
                break;
            case "This Month":
                fromdate = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
                todate = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
                break;
            case "Last Week":
                const startOfLastWeek = new Date(today);
                startOfLastWeek.setDate(today.getDate() - (today.getDay() + 6) % 7 - 7); // Last Monday
                const endOfLastWeek = new Date(startOfLastWeek);
                endOfLastWeek.setDate(startOfLastWeek.getDate() + 6); // Last Sunday
                fromdate = formatDate(startOfLastWeek);
                todate = formatDate(endOfLastWeek);
                break;
            case "Last Month":
                fromdate = formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)); // 1st of last month
                todate = formatDate(new Date(today.getFullYear(), today.getMonth(), 0)); // Last day of last month
                break;
            default:
                fromdate = todate = "";
        }

        return { fromdate, todate };
    };

    const formatDateForInput = (date) => {
        if (isNaN(date.getTime())) {
            return ''; // Return empty if the date is invalid
        }
        return date.toISOString().split("T")[0]; // Converts date to 'yyyy-MM-dd' format
    };

    //fetching Project for Dropdowns
    const fetchProjectDropdowns = async (e) => {
        setPageName(!pageName)
        try {
            let res_project = await axios.get(SERVICE.PROJECTMASTER, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const projall = [
                ...res_project?.data?.projmaster.map((d) => ({
                    ...d,
                    label: d.name,
                    value: d.name,
                })),
            ];
            setProjects(projall);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    useEffect(() => {
        fetchProjectDropdowns();
    }, [])

    const fetchVendorDropdowns = async (value) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(SERVICE.VENDORMASTER, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let filteredDatas = res?.data?.vendormaster?.filter((data) => {
                return data?.projectname === value
            }).map((item) => ({ ...item, label: item.name, value: item.name }));
            setVendors(filteredDatas);

        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    const fetchLoginID = async (vendor) => {
        setPageName(!pageName);
        let resultvendor = [];

        selectedProject
            .map((d) => d.value)
            .forEach((proj) => {
                vendor?.map((d) => d.value).forEach((vend) => resultvendor.push(`${proj}-${vend}`));
            });
        let projvendor = [...new Set(resultvendor)];

        try {
            let res = await axios.get(SERVICE.ALL_CLIENTUSERIDDATA, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let allottedList = res?.data?.clientuserid?.filter((data) => {
                return data.allotted === "allotted"
            })

            let basedOnProject = allottedList?.filter((data) => {
                return projvendor?.includes(data?.projectvendor);
            });
            let loginList = basedOnProject?.map((data) => ({
                label: data.userid,
                value: data.userid
            }));
            setLoginOptions(loginList);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    const handleProjectChange = (options) => {
        setSelectedProject(options);
        options.map((a, index) => {
            fetchVendorDropdowns(a.value);
        });
        setSelectedVendor([]);
        setSelectedLogin([]);
    };

    const customValueRendererProject = (valueProject, _categoryname) => {
        return valueProject?.length
            ? valueProject.map(({ label }) => label)?.join(", ")
            : "Please Select Project";
    };

    const handleVendorChange = (options) => {
        setSelectedVendor(options);
        fetchLoginID(options);
        setSelectedLogin([]);
    };

    const customValueRendererVendor = (valueVendor, _categoryname) => {
        return valueVendor?.length
            ? valueVendor.map(({ label }) => label)?.join(", ")
            : "Please Select Vendor";
    };

    const handleLoginChange = (options) => {
        setSelectedLogin(options);
    };

    const customValueRendererLogin = (valueLogin, _categoryname) => {
        return valueLogin?.length
            ? valueLogin.map(({ label }) => label)?.join(", ")
            : "Please Select Login ID";
    };

    const filteredErrorData = async () => {
        setPageName(!pageName)
        setLoader(true);
        setloadingdeloverall(true);
        const project = selectedProject?.map(val => val.value);
        const vendor = selectedVendor?.map(val => val.value);
        const loginid = selectedLogin?.map(val => val.value);

        try {
            let res_vendor = await axios.post(SERVICE.CLIENT_ERROR_OVERALL_REPORT, {
                project: project,
                vendor: vendor,
                loginid: loginid,
                fromdate: filterUser.fromdate,
                todate: filterUser.todate,
            }, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                }
            });

            const result = res_vendor?.data?.finalData?.map((item) => {
                const lastIdexValue = item.history[item.history.length - 1];
                const statusData = (lastIdexValue.mode === 'Mode' && lastIdexValue.status === 'Approved') ? 'Pending'
                    : lastIdexValue.status === 'Sent' ? 'Applied'
                        : lastIdexValue.status === 'Sent Recheck' ? 'Resent'
                            : (lastIdexValue.mode === 'Percentage' && lastIdexValue.status === 'Approved') ? 'Approved'
                                : lastIdexValue.status;

                return {
                    ...item,
                    status: String(statusData),
                    forwardreason: lastIdexValue.reason,
                }
            });

            let itemsWithSerialNumber = result?.map((item, index) => {
                const sentData = item.history?.find(data => data.status === "Sent");

                return {
                    ...item,
                    id: item._id,
                    serialNumber: index + 1,
                    date: moment(item.date).format('DD/MM/YYYY'),
                    amount: (item.amount !== '' && item.amount !== undefined) ? item.amount.toFixed(2) : item.amount,
                    requestreason: sentData ? sentData.reason : '',
                    forwardreason: item.forwardreason,
                    status: item.status
                }
            });
            setClientErrors(itemsWithSerialNumber);
            setLoader(false);
            setloadingdeloverall(false);
        } catch (err) {
            setLoader(true); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    }

    //submit option for saving
    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedProject.length === 0) {
            setPopupContentMalert("Please Select Project");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (selectedVendor.length === 0) {
            setPopupContentMalert("Please Select Vendor");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (selectedLogin.length === 0) {
            setPopupContentMalert("Please Select Login ID");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (filterUser.fromdate === '' && filterUser.todate === '') {
            setPopupContentMalert("Please Select Date");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else {
            filteredErrorData();
        }
    };

    const handleClear = () => {
        setPageName(!pageName);
        setSelectedMode("Last Week");
        setSelectedProject([]);
        setSelectedVendor([]);
        setSelectedLogin([]);
        setClientErrors([]);
        setItems([]);
        const today = new Date();

        const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
            const year = date.getFullYear();
            return `${year}-${month}-${day}`;
        };

        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - (today.getDay() + 6) % 7 - 7); // Last Monday
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6); // Last Sunday
        setFilterUser({ fromdate: formatDate(startOfLastWeek), todate: formatDate(endOfLastWeek) })

        setPopupContent("Cleared Successfully");
        setPopupSeverity("success");
        handleClickOpenPopup();
    };

    const addSerialNumber = (datas) => {
        setItems(datas);
    };

    useEffect(() => {
        addSerialNumber(clientErrors);
    }, [clientErrors]);

    //Datatable
    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setPage(1);
    };

    // Split the search query into individual terms
    const searchTerms = searchQuery.toLowerCase().split(" ");
    // Modify the filtering logic to check each term
    const filteredDatas = items?.filter((item) => {
        return searchTerms.every((term) =>
            Object.values(item).join(" ").toLowerCase().includes(term)
        );
    });

    const filteredData = filteredDatas?.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(filteredDatas.length / pageSize);
    const visiblePages = Math.min(totalPages, 3);
    const firstVisiblePage = Math.max(1, page - 1);
    const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPages);
    const pageNumbers = [];
    const indexOfLastItem = page * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
        pageNumbers.push(i);
    }

    const columnDataTable = [
        { field: "serialNumber", headerName: "SNo", flex: 0, width: 75, hide: !columnVisibility.serialNumber, pinned: 'left', lockPinned: true, },
        { field: "vendor", headerName: "Vendor Name", flex: 0, width: 150, hide: !columnVisibility.vendor, },
        { field: "branch", headerName: "Branch Name", flex: 0, width: 150, hide: !columnVisibility.branch, },
        { field: "employeeid", headerName: "Employee Code", flex: 0, width: 150, hide: !columnVisibility.employeeid, },
        { field: "employeename", headerName: "Employee Name", flex: 0, width: 250, hide: !columnVisibility.employeename, cellStyle: cellStyles, headerClass: 'header-wrap', },
        { field: "loginid", headerName: "Login id", flex: 0, width: 120, hide: !columnVisibility.loginid, },
        { field: "date", headerName: "Date", flex: 0, width: 120, hide: !columnVisibility.date, },
        { field: "category", headerName: "Category", flex: 0, width: 250, hide: !columnVisibility.category, cellStyle: cellStyles, headerClass: 'header-wrap', },
        { field: "subcategory", headerName: "Subcategory", flex: 0, width: 250, hide: !columnVisibility.subcategory, cellStyle: cellStyles, headerClass: 'header-wrap', },
        { field: "documentnumber", headerName: "Document Number", flex: 0, width: 150, hide: !columnVisibility.documentnumber, },
        { field: "fieldname", headerName: "Field Name", flex: 0, width: 150, hide: !columnVisibility.fieldname, cellStyle: cellStyles, headerClass: 'header-wrap', },
        { field: "line", headerName: "Line", flex: 0, width: 100, hide: !columnVisibility.line, },
        { field: "errorvalue", headerName: "Error Value", flex: 0, width: 250, hide: !columnVisibility.errorvalue, cellStyle: cellStyles, headerClass: 'header-wrap', },
        { field: "correctvalue", headerName: "Correct Value", flex: 0, width: 250, hide: !columnVisibility.correctvalue, cellStyle: cellStyles, headerClass: 'header-wrap', },
        { field: "clienterror", headerName: "Client Error", flex: 0, width: 100, hide: !columnVisibility.clienterror, cellStyle: cellStyles, headerClass: 'header-wrap', },
        { field: "clientamount", headerName: "Client Amount", flex: 0, width: 100, hide: !columnVisibility.clientamount, },
        { field: "percentage", headerName: "per%", flex: 0, width: 100, hide: !columnVisibility.percentage, },
        { field: "amount", headerName: "Amount", flex: 0, width: 100, hide: !columnVisibility.amount, },
        { field: "requestreason", headerName: "Request Reason", flex: 0, width: 250, hide: !columnVisibility.requestreason, cellStyle: cellStyles, headerClass: 'header-wrap', },
        { field: "forwardreason", headerName: "Forward Reason", flex: 0, width: 250, hide: !columnVisibility.forwardreason, cellStyle: cellStyles, headerClass: 'header-wrap', },
        { field: "status", headerName: "Status", flex: 0, width: 150, hide: !columnVisibility.status, },
    ];

    const rowDataTable = filteredData.map((item, index) => {
        return {
            ...item,
        };
    });

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

    const [fileFormat, setFormat] = useState("");
    let exportColumnNames = ['Vendor Name', 'Branch Name', 'Employee Code', 'Employee Name', 'Login id', 'Date', 'Category', 'Subcategory', 'Document Number', 'Field Name', 'Line', 'Error Value', 'Correct Value', 'Client Error', 'Client Amount', 'Per%', 'Amount', 'Request Reason', 'Forward Reason', 'Status'];
    let exportRowValues = ['vendor', 'branch', 'employeeid', 'employeename', 'loginid', 'date', 'category', 'subcategory', 'documentnumber', 'fieldname', 'line', 'errorvalue', 'correctvalue', 'clienterror', 'clientamount', 'percentage', 'amount', 'requestreason', 'forwardreason', 'status'];

    //print...
    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "Client Error Overall Report List",
        pageStyle: "print",
    });

    //image
    const handleCaptureImage = () => {
        if (gridRefTableImg.current) {
            domtoimage.toBlob(gridRefTableImg.current)
                .then((blob) => {
                    saveAs(blob, "Client Error Overall Report.png");
                })
                .catch((error) => {
                    console.error("dom-to-image error: ", error);
                });
        }
    };

    return (
        <Box>
            <Headtitle title={"Client Error Overall Report"} />
            <PageHeading
                title="Client Error Overall Report"
                modulename="Quality"
                submodulename="Penalty"
                mainpagename="Penalty Calculation"
                subpagename="Client Error Overall Report"
                subsubpagename=""
            />
            {/* ****** Table Start ****** */}
            {isUserRoleCompare?.includes("lclienterroroverallreport") && (
                <>
                    <Box sx={userStyle.selectcontainer}>
                        <Grid container spacing={2}>
                            {/* <Grid item md={12} sm={12} xs={12}>
                                <Typography sx={userStyle.importheadtext}> Client Error Overall Report</Typography>
                            </Grid> */}
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>Project<b style={{ color: "red" }}>*</b></Typography>
                                    <MultiSelect options={projects}
                                        value={selectedProject}
                                        onChange={(e) => { handleProjectChange(e); }}
                                        valueRenderer={customValueRendererProject}
                                        labelledBy="Please Select Project"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>Vendor<b style={{ color: "red" }}>*</b></Typography>
                                    <MultiSelect options={vendors}
                                        value={selectedVendor}
                                        onChange={(e) => { handleVendorChange(e); }}
                                        valueRenderer={customValueRendererVendor}
                                        labelledBy="Please Select Vendor"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>Login ID<b style={{ color: "red" }}>*</b></Typography>
                                    <MultiSelect
                                        options={loginOptions}
                                        value={selectedLogin}
                                        onChange={(e) => { handleLoginChange(e) }}
                                        valueRenderer={customValueRendererLogin}
                                        labelledBy="Please Select Login ID"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography> Filter Mode<b style={{ color: "red" }}>*</b> </Typography>
                                    <Selects
                                        labelId="mode-select-label"
                                        options={mode}
                                        value={{ label: selectedMode, value: selectedMode }}
                                        onChange={(selectedOption) => {
                                            // Reset the date fields to empty strings
                                            let fromdate = '';
                                            let todate = '';

                                            // If a valid option is selected, get the date range
                                            if (selectedOption.value) {
                                                const dateRange = getDateRange(selectedOption.value);
                                                fromdate = dateRange.fromdate; // Already formatted in 'dd-MM-yyyy'
                                                todate = dateRange.todate; // Already formatted in 'dd-MM-yyyy'
                                            }
                                            // Set the state with formatted dates
                                            setFilterUser({
                                                ...filterUser,
                                                fromdate: formatDateForInput(new Date(fromdate.split('-').reverse().join('-'))), // Convert to 'yyyy-MM-dd'
                                                todate: formatDateForInput(new Date(todate.split('-').reverse().join('-'))), // Convert to 'yyyy-MM-dd'
                                            });
                                            setSelectedMode(selectedOption.value); // Update the mode
                                        }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} sm={12} xs={12}>
                                <FormControl fullWidth size="small">
                                    <Typography> From Date<b style={{ color: "red" }}>*</b>{" "} </Typography>
                                    <OutlinedInput
                                        id="component-outlined"
                                        type="date"
                                        disabled={selectedMode != "Custom"}
                                        value={filterUser.fromdate}
                                        onChange={(e) => {
                                            const selectedDate = e.target.value;
                                            // Ensure that the selected date is not in the future
                                            const currentDate = new Date().toISOString().split("T")[0];
                                            if (selectedDate <= currentDate) {
                                                setFilterUser({ ...filterUser, fromdate: selectedDate, todate: selectedDate });
                                            } else {
                                                // Handle the case where the selected date is in the future (optional)
                                                // You may choose to show a message or take other actions.
                                            }
                                        }}
                                        // Set the max attribute to the current date
                                        inputProps={{ max: new Date().toISOString().split("T")[0] }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} sm={12} xs={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>{" "} To Date<b style={{ color: "red" }}>*</b>{" "}</Typography>
                                    <OutlinedInput
                                        id="component-outlined"
                                        type="date"
                                        disabled={selectedMode != "Custom"}
                                        value={filterUser.todate}
                                        onChange={(e) => {
                                            const selectedDate = e.target.value;
                                            // Ensure that the selected date is not in the future
                                            const currentDate = new Date().toISOString().split("T")[0];
                                            const fromdateval = filterUser.fromdate != "" && new Date(filterUser.fromdate).toISOString().split("T")[0];
                                            if (filterUser.fromdate == "") {
                                                setPopupContentMalert("Please Select From Date");
                                                setPopupSeverityMalert("warning");
                                                handleClickOpenPopupMalert();
                                            } else if (selectedDate < fromdateval) {
                                                setFilterUser({ ...filterUser, todate: "" });
                                                setPopupContentMalert("To Date should be after or equal to From Date");
                                                setPopupSeverityMalert("warning");
                                                handleClickOpenPopupMalert();
                                            } else if (selectedDate <= currentDate) {
                                                setFilterUser({ ...filterUser, todate: selectedDate });
                                            } else {
                                            }
                                        }}
                                        // Set the max attribute to the current date
                                        inputProps={{ max: new Date().toISOString().split("T")[0], min: filterUser.fromdate !== "" ? filterUser.fromdate : null }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item lg={1.5} md={2} sm={2} xs={6} >
                                <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0, } })}>
                                    <LoadingButton onClick={handleSubmit} loading={loadingdeloverall} sx={buttonStyles.buttonsubmit} loadingPosition="end" variant="contained">Get List</LoadingButton>
                                </Box>
                            </Grid>
                            <Grid item lg={1} md={2} sm={2} xs={6}>
                                <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0, } })}>
                                    <Button sx={buttonStyles.btncancel} onClick={handleClear}>Clear</Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box> <br />
                    {/* First Table */}
                    <Box sx={userStyle.container}>
                        {/* ******************************************************EXPORT Buttons****************************************************** */}
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>Client Error Overall Report List</Typography>
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
                                        <MenuItem value={clientErrors?.length}>All</MenuItem>
                                    </Select>
                                </Box>
                            </Grid>
                            <Grid item md={8} xs={12} sm={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                                <Box>
                                    {isUserRoleCompare?.includes("excelclienterroroverallreport") && (
                                        <>
                                            <Button onClick={(e) => { setIsFilterOpen(true); setFormat("xl"); }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("csvclienterroroverallreport") && (
                                        <>
                                            <Button onClick={(e) => { setIsFilterOpen(true); setFormat("csv"); }} sx={userStyle.buttongrp}><FaFileCsv /> &ensp;Export to CSV&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("printclienterroroverallreport") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleprint} >&ensp;<FaPrint />&ensp;Print&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("pdfclienterroroverallreport") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={() => { setIsPdfFilterOpen(true); }}><FaFilePdf />&ensp;Export to PDF&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("imageclienterroroverallreport") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}><ImageIcon sx={{ fontSize: "15px" }} />{" "}&ensp;Image&ensp;</Button>
                                        </>
                                    )}
                                </Box>
                            </Grid>
                            <Grid item md={2} xs={6} sm={6}>
                                <Box>
                                    <AggregatedSearchBar
                                        columnDataTable={columnDataTable}
                                        setItems={setItems}
                                        addSerialNumber={addSerialNumber}
                                        setPage={setPage}
                                        maindatas={clientErrors}
                                        setSearchedString={setSearchedString}
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                        paginated={false}
                                        totalDatas={clientErrors}
                                    />
                                </Box>
                            </Grid>
                        </Grid> <br />
                        <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}> Show All Columns</Button>&ensp;
                        <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumns}>Manage Columns</Button><br /><br />
                        {loader ? (
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
                                    gridRefTable={gridRefTable}
                                    paginated={false}
                                    filteredDatas={filteredDatas}
                                    // totalDatas={totalDatas}
                                    selectedRows={selectedRows}
                                    setSelectedRows={setSelectedRows}
                                    searchQuery={searchedString}
                                    handleShowAllColumns={handleShowAllColumns}
                                    setFilteredRowData={setFilteredRowData}
                                    filteredRowData={filteredRowData}
                                    setFilteredChanges={setFilteredChanges}
                                    filteredChanges={filteredChanges}
                                    gridRefTableImg={gridRefTableImg}
                                    itemsList={clientErrors}
                                    pagenamecheck={"Client Error Waiver_Current"}
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
                anchorOrigin={{ vertical: "bottom", horizontal: "left", }} >
                <ManageColumnsContent
                    handleClose={handleCloseManageColumns}
                    searchQuery={searchQueryManage}
                    setSearchQuery={setSearchQueryManage}
                    filteredColumns={filteredColumns}
                    columnVisibility={columnVisibility}
                    toggleColumnVisibility={toggleColumnVisibility}
                    setColumnVisibility={setColumnVisibility}
                    initialColumnVisibility={initialColumnVisibility}
                    columnDataTable={columnDataTable}
                />
            </Popover>

            {/* EXTERNAL COMPONENTS -------------- START */}
            {/* VALIDATION */}
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
            {/* PRINT PDF EXCEL CSV */}
            <ExportData
                isFilterOpen={isFilterOpen}
                handleCloseFilterMod={handleCloseFilterMod}
                fileFormat={fileFormat}
                setIsFilterOpen={setIsFilterOpen}
                isPdfFilterOpen={isPdfFilterOpen}
                setIsPdfFilterOpen={setIsPdfFilterOpen}
                handleClosePdfFilterMod={handleClosePdfFilterMod}
                filteredDataTwo={(filteredChanges !== null ? filteredRowData : rowDataTable) ?? []}
                itemsTwo={clientErrors ?? []}
                filename={"Client Error Overall Report"}
                exportColumnNames={exportColumnNames}
                exportRowValues={exportRowValues}
                componentRef={componentRef}
            />
        </Box>
    );
}

export default ClientErrorOverAllReport;