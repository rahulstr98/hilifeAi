import React, { useContext, useEffect, useRef, useState } from "react";
import { Box, Button, FormControl, Grid, MenuItem, Popover, Select, Typography, } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import LoadingButton from "@mui/lab/LoadingButton";
import Selects from "react-select";
import axios from "axios";
import { saveAs } from "file-saver";
import "jspdf-autotable";
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
import RecheckForwardEmployee from "./Recheckforwardemployee.js";
import ManageColumnsContent from "../../../components/ManageColumn";

function WaiverEmployeeForward() {

    const gridRefTable = useRef(null);
    const gridRefTabletwo = useRef(null);
    const gridRefTableImg = useRef(null);
    const gridRefTableImgtwo = useRef(null);

    const { auth } = useContext(AuthContext);
    const { isUserRoleCompare, isUserRoleAccess, listPageAccessMode, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);

    const [waiverEmployees, setWaiverEmployees] = useState([]);
    const [waiverEmployeetwos, setWaiverEmployeetwos] = useState([]);
    const [items, setItems] = useState([]);
    const [itemstwo, setItemstwo] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedRowstwo, setSelectedRowstwo] = useState([]);
    const [loadingdeloverall, setloadingdeloverall] = useState(false);

    const [filteredRowData, setFilteredRowData] = useState([]);
    const [filteredChanges, setFilteredChanges] = useState(null);
    const [isHandleChange, setIsHandleChange] = useState(false);
    const [searchedString, setSearchedString] = useState("");

    const [filteredRowDatatwo, setFilteredRowDatatwo] = useState([]);
    const [filteredChangestwo, setFilteredChangestwo] = useState(null);
    const [isHandleChangetwo, setIsHandleChangetwo] = useState(false);
    const [searchedStringtwo, setSearchedStringtwo] = useState("");

    //Datatable
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");

    //Datatable second Table
    const [pagetwo, setPagetwo] = useState(1);
    const [pageSizetwo, setPageSizetwo] = useState(10);
    const [searchQuerytwo, setSearchQuerytwo] = useState("");

    const [openPopupMalert, setOpenPopupMalert] = useState(false);
    const [loader, setLoader] = useState(false);
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

    // second table
    const [isFilterOpentwo, setIsFilterOpentwo] = useState(false);
    const [isPdfFilterOpentwo, setIsPdfFilterOpentwo] = useState(false);
    // page refersh reload
    const handleCloseFilterModtwo = () => { setIsFilterOpentwo(false); };
    const handleClosePdfFilterModtwo = () => { setIsPdfFilterOpentwo(false); };

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

    // Manage Columns second Table
    const [searchQueryManagetwo, setSearchQueryManagetwo] = useState("");
    const [isManageColumnsOpentwo, setManageColumnsOpentwo] = useState(false);
    const [anchorEltwo, setAnchorEltwo] = useState(null);

    const handleOpenManageColumnstwo = (event) => {
        setAnchorEltwo(event.currentTarget);
        setManageColumnsOpentwo(true);
    };
    const handleCloseManageColumnstwo = () => {
        setManageColumnsOpentwo(false);
        setSearchQueryManagetwo("");
    };

    const opentwo = Boolean(anchorEltwo);
    const idtwo = opentwo ? "simple-popover" : undefined;

    let listpageaccessby =
        listPageAccessMode?.find(
            (data) =>
                data.modulename === "Human Resources" &&
                data.submodulename === "HR" &&
                data.mainpagename === "Attendance" &&
                data.subpagename === "Attendance Individual" &&
                data.subsubpagename === "Team Attendance Status"
        )?.listpageaccessmode || "Overall";

    const modeDropDowns = [
        { label: "My Hierarchy List", value: "myhierarchy" },
        { label: "All Hierarchy List", value: "allhierarchy" },
        { label: "My + All Hierarchy List", value: "myallhierarchy" },
    ];
    const sectorDropDowns = [
        { label: "Primary", value: "Primary" },
        { label: "Secondary", value: "Secondary" },
        { label: "Tertiary", value: "Tertiary" },
        { label: "All", value: "all" },
    ];

    const [modeselection, setModeSelection] = useState({
        label: "My Hierarchy List",
        value: "myhierarchy",
    });
    const [sectorSelection, setSectorSelection] = useState({
        label: "Primary",
        value: "Primary",
    });

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
            pagename: String("Waiver Employee Forward"),
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

    // Show All Columns & Manage Columns
    const initialColumnVisibility = {
        serialNumber: true,
        checkbox: true,
        level: true,
        name: true,
        empcode: true,
        date: true,
        ventor: true,
        process: true,
        totalfield: true,
        autoerror: true,
        manualerror: true,
        uploaderror: true,
        moved: true,
        notupload: true,
        penalty: true,
        nonpenalty: true,
        bulkupload: true,
        bulkkeying: true,
        edited1: true,
        edited2: true,
        edited3: true,
        edited4: true,
        reject1: true,
        reject2: true,
        reject3: true,
        reject4: true,
        notvalidate: true,
        validerror: true,
        waiver: true,
        empwaiver: true,
        neterror: true,
        per: true,
        percentage: true,
        amount: true,
        history: true,
        monthhistory: true,
        request: true,
        forward: true,
        recheck: true,
        mode: true,
        forward: true,
        actions: true,
    };
    const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

    // Show All Columns & Manage Columns second Table
    const initialColumnVisibilitytwo = {
        serialNumber: true,
        level: true,
        name: true,
        empcode: true,
        date: true,
        ventor: true,
        process: true,
        totalfield: true,
        autoerror: true,
        manualerror: true,
        uploaderror: true,
        moved: true,
        notupload: true,
        penalty: true,
        nonpenalty: true,
        bulkupload: true,
        bulkkeying: true,
        edited1: true,
        edited2: true,
        edited3: true,
        edited4: true,
        reject1: true,
        reject2: true,
        reject3: true,
        reject4: true,
        notvalidate: true,
        validerror: true,
        waiver: true,
        empwaiver: true,
        neterror: true,
        per: true,
        percentage: true,
        amount: true,
        history: true,
        monthhistory: true,
        request: true,
        forward: true,
        recheck: true,
        mode: true,
        forward: true,
    };
    const [columnVisibilitytwo, setColumnVisibilitytwo] = useState(initialColumnVisibilitytwo);

    //get all project.
    const fetchAllClient = async () => {
        setPageName(!pageName)
        try {
            let res = await axios.post(SERVICE.WAIVEREMPLOYEE_FORWARD_HIERARCHY, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                hierachy: modeselection.value,
                sector: sectorSelection.value,
                username: isUserRoleAccess?.companyname,
                listpageaccessmode: listpageaccessby,
                pagename: "menuwaiveremployeeforward",
            });
            setWaiverEmployees(res?.data?.resultAccessFilter?.map((item, index) => ({
                ...item,
                serialNumber: index + 1,
            })));
            setWaiverEmployeetwos(res?.data?.resultAccessFilter?.map((item, index) => ({
                ...item,
                serialNumber: index + 1,
            })));
            setLoader(true);
        } catch (err) {
            setLoader(true);
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    //submit option for saving
    const handleSubmit = (e) => {
        setPageName(!pageName)
        e.preventDefault();
        if (modeselection.value === "Please Select Mode") {
            setPopupContentMalert("Please Select Mode");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        } else if (sectorSelection.value === "Please Select Level") {
            setPopupContentMalert("Please Select Level");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        } else {
            fetchAllClient();
        }
    };

    const handleClear = () => {
        setPageName(!pageName)
        setSectorSelection({ label: "Primary", value: "Primary" });
        setModeSelection({ label: "My Hierarchy List", value: "myhierarchy" });
        setPopupContent("Cleared Successfully");
        setPopupSeverity("success");
        handleClickOpenPopup();
    };

    const addSerialNumber = (datas) => {
        setItems(datas);
    };

    useEffect(() => {
        addSerialNumber(waiverEmployees);
    }, [waiverEmployees]);

    // second Table   
    const addSerialNumbertwo = (datas) => {
        setItemstwo(datas);
    };

    useEffect(() => {
        addSerialNumbertwo(waiverEmployeetwos);
    }, [waiverEmployeetwos]);

    //Datatable
    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setSelectedRows([]);
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
    const filteredData = filteredDatas.slice((page - 1) * pageSize, page * pageSize);
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

    //Datatable second Table
    const handlePageSizeChangetwo = (event) => {
        setPageSizetwo(Number(event.target.value));
        setSelectedRowstwo([]);
        setPagetwo(1);
    };

    // Split the search query into individual terms
    const searchTermstwo = searchQuerytwo.toLowerCase().split(" ");
    // Modify the filtering logic to check each term
    const filteredDatastwo = itemstwo?.filter((item) => {
        return searchTermstwo.every((term) =>
            Object.values(item).join(" ").toLowerCase().includes(term)
        );
    });
    const filteredDatatwo = filteredDatastwo.slice((pagetwo - 1) * pageSizetwo, pagetwo * pageSizetwo);
    const totalPagestwo = Math.ceil(filteredDatastwo.length / pageSizetwo);
    const visiblePagestwo = Math.min(totalPagestwo, 3);
    const firstVisiblePagetwo = Math.max(1, pagetwo - 1);
    const lastVisiblePagetwo = Math.min(firstVisiblePagetwo + visiblePagestwo - 1, totalPagestwo);
    const pageNumberstwo = [];
    const indexOfLastItemtwo = pagetwo * pageSizetwo;
    const indexOfFirstItemtwo = indexOfLastItemtwo - pageSizetwo;
    for (let i = firstVisiblePagetwo; i <= lastVisiblePagetwo; i++) {
        pageNumberstwo.push(i);
    }

    const columnDataTable = [

        {
            field: "checkbox",
            headerName: "Checkbox", // Default header name
            headerStyle: {
                fontWeight: "bold", // Apply the font-weight style to make the header text bold
                // Add any other CSS styles as needed
            },

            sortable: false, // Optionally, you can make this column not sortable
            width: 90,
            headerCheckboxSelection: true,
            checkboxSelection: true,
            hide: !columnVisibility.checkbox,
            headerClassName: "bold-header",
            pinned: "left",
            lockPinned: true,
        },
        {
            field: "serialNumber",
            headerName: "SNo",
            flex: 0,
            width: 100,
            hide: !columnVisibility.serialNumber,
            headerClassName: "bold-header",
        },
        {
            field: "level",
            headerName: "Level",
            flex: 0,
            width: 100,
            hide: !columnVisibility.level,
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
            field: "empcode",
            headerName: "Emp Code",
            flex: 0,
            width: 100,
            hide: !columnVisibility.empcode,
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
            field: "ventorname",
            headerName: "Ventor Name",
            flex: 0,
            width: 100,
            hide: !columnVisibility.ventorname,
            headerClassName: "bold-header",
        },
        {
            field: "process",
            headerName: "Process",
            flex: 0,
            width: 100,
            hide: !columnVisibility.process,
            headerClassName: "bold-header",
        },
        {
            field: "totalfield",
            headerName: "Total Field",
            flex: 0,
            width: 100,
            hide: !columnVisibility.totalfield,
            headerClassName: "bold-header",
        },
        {
            field: "autoerror",
            headerName: "Auto Error",
            flex: 0,
            width: 100,
            hide: !columnVisibility.autoerror,
            headerClassName: "bold-header",
        },
        {
            field: "manualerror",
            headerName: "Manual Error",
            flex: 0,
            width: 100,
            hide: !columnVisibility.manualerror,
            headerClassName: "bold-header",
        },
        {
            field: "uploaderror",
            headerName: "Upload Error",
            flex: 0,
            width: 100,
            hide: !columnVisibility.uploaderror,
            headerClassName: "bold-header",
        },
        {
            field: "moved",
            headerName: "Moved",
            flex: 0,
            width: 100,
            hide: !columnVisibility.moved,
            headerClassName: "bold-header",
        },
        {
            field: "notupload",
            headerName: "Not Upload",
            flex: 0,
            width: 100,
            hide: !columnVisibility.notupload,
            headerClassName: "bold-header",
        },
        {
            field: "penalty",
            headerName: "Penalty",
            flex: 0,
            width: 100,
            hide: !columnVisibility.penalty,
            headerClassName: "bold-header",
        },
        {
            field: "nonpenalty",
            headerName: "Non Penalty",
            flex: 0,
            width: 100,
            hide: !columnVisibility.nonpenalty,
            headerClassName: "bold-header",
        },
        {
            field: "bulkupload",
            headerName: "Bulk Upload",
            flex: 0,
            width: 100,
            hide: !columnVisibility.bulkupload,
            headerClassName: "bold-header",
        },
        {
            field: "bulkkeying",
            headerName: "Bulk Keying",
            flex: 0,
            width: 100,
            hide: !columnVisibility.bulkkeying,
            headerClassName: "bold-header",
        },
        {
            field: "edited1",
            headerName: "Edited1",
            flex: 0,
            width: 100,
            hide: !columnVisibility.edited1,
            headerClassName: "bold-header",
        },
        {
            field: "edited2",
            headerName: "Edited2",
            flex: 0,
            width: 100,
            hide: !columnVisibility.edited2,
            headerClassName: "bold-header",
        },
        {
            field: "edited3",
            headerName: "Edited3",
            flex: 0,
            width: 100,
            hide: !columnVisibility.edited3,
            headerClassName: "bold-header",
        },
        {
            field: "edited4",
            headerName: "Edited4",
            flex: 0,
            width: 100,
            hide: !columnVisibility.edited4,
            headerClassName: "bold-header",
        },
        {
            field: "reject1",
            headerName: "Reject1",
            flex: 0,
            width: 100,
            hide: !columnVisibility.reject1,
            headerClassName: "bold-header",
        },
        {
            field: "reject2",
            headerName: "Reject2",
            flex: 0,
            width: 100,
            hide: !columnVisibility.reject2,
            headerClassName: "bold-header",
        },
        {
            field: "reject3",
            headerName: "Reject3",
            flex: 0,
            width: 100,
            hide: !columnVisibility.reject3,
            headerClassName: "bold-header",
        },
        {
            field: "reject4",
            headerName: "Reject4",
            flex: 0,
            width: 100,
            hide: !columnVisibility.reject4,
            headerClassName: "bold-header",
        },
        {
            field: "notvalidate",
            headerName: "Not Validate",
            flex: 0,
            width: 100,
            hide: !columnVisibility.notvalidate,
            headerClassName: "bold-header",
        },
        {
            field: "validerror",
            headerName: "Valid Error",
            flex: 0,
            width: 100,
            hide: !columnVisibility.validerror,
            headerClassName: "bold-header",
        },
        {
            field: "waiver",
            headerName: "Waiver %",
            flex: 0,
            width: 100,
            hide: !columnVisibility.waiver,
            headerClassName: "bold-header",
        },
        {
            field: "empwaiver",
            headerName: "Emp Waiver",
            flex: 0,
            width: 100,
            hide: !columnVisibility.empwaiver,
            headerClassName: "bold-header",
        },
        {
            field: "neterror",
            headerName: "Net Error",
            flex: 0,
            width: 100,
            hide: !columnVisibility.neterror,
            headerClassName: "bold-header",
        },
        {
            field: "per",
            headerName: "per %",
            flex: 0,
            width: 100,
            hide: !columnVisibility.per,
            headerClassName: "bold-header",
        },
        {
            field: "percentage",
            headerName: "Percentage",
            flex: 0,
            width: 100,
            hide: !columnVisibility.percentage,
            headerClassName: "bold-header",
        },
        {
            field: "amount",
            headerName: "Amount",
            flex: 0,
            width: 100,
            hide: !columnVisibility.amount,
            headerClassName: "bold-header",
        },
        {
            field: "history",
            headerName: "History",
            flex: 0,
            width: 100,
            hide: !columnVisibility.history,
            headerClassName: "bold-header",
        },
        {
            field: "monthhistory",
            headerName: "Month History",
            flex: 0,
            width: 100,
            hide: !columnVisibility.monthhistory,
            headerClassName: "bold-header",
        },
        {
            field: "request",
            headerName: "Request",
            flex: 0,
            width: 100,
            hide: !columnVisibility.request,
            headerClassName: "bold-header",
        },
        {
            field: "forward",
            headerName: "Forward",
            flex: 0,
            width: 100,
            hide: !columnVisibility.forward,
            headerClassName: "bold-header",
        },
        {
            field: "recheck",
            headerName: "Recheck",
            flex: 0,
            width: 100,
            hide: !columnVisibility.recheck,
            headerClassName: "bold-header",
        },
        {
            field: "mode",
            headerName: "Mode",
            flex: 0,
            width: 100,
            hide: !columnVisibility.mode,
            headerClassName: "bold-header",
        },
        {
            field: "forward",
            headerName: "Forward",
            flex: 0,
            width: 100,
            hide: !columnVisibility.forward,
            headerClassName: "bold-header",
        },

    ];

    // second table
    const columnDataTabletwo = [

        {
            field: "checkbox",
            headerName: "Checkbox", // Default header name
            headerStyle: {
                fontWeight: "bold", // Apply the font-weight style to make the header text bold
                // Add any other CSS styles as needed
            },

            sortable: false, // Optionally, you can make this column not sortable
            width: 90,
            headerCheckboxSelection: true,
            checkboxSelection: true,
            hide: !columnVisibilitytwo.checkbox,
            headerClassName: "bold-header",
            pinned: "left",
            lockPinned: true,
        },
        {
            field: "serialNumber",
            headerName: "SNo",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.serialNumber,
            headerClassName: "bold-header",
        },
        {
            field: "level",
            headerName: "Level",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.level,
            headerClassName: "bold-header",
        },
        {
            field: "name",
            headerName: "Name",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.name,
            headerClassName: "bold-header",
        },
        {
            field: "empcode",
            headerName: "Emp Code",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.empcode,
            headerClassName: "bold-header",
        },
        {
            field: "date",
            headerName: "Date",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.date,
            headerClassName: "bold-header",
        },
        {
            field: "ventorname",
            headerName: "Ventor Name",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.ventorname,
            headerClassName: "bold-header",
        },
        {
            field: "process",
            headerName: "Process",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.process,
            headerClassName: "bold-header",
        },
        {
            field: "totalfield",
            headerName: "Total Field",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.totalfield,
            headerClassName: "bold-header",
        },
        {
            field: "autoerror",
            headerName: "Auto Error",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.autoerror,
            headerClassName: "bold-header",
        },
        {
            field: "manualerror",
            headerName: "Manual Error",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.manualerror,
            headerClassName: "bold-header",
        },
        {
            field: "uploaderror",
            headerName: "Upload Error",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.uploaderror,
            headerClassName: "bold-header",
        },
        {
            field: "moved",
            headerName: "Moved",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.moved,
            headerClassName: "bold-header",
        },
        {
            field: "notupload",
            headerName: "Not Upload",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.notupload,
            headerClassName: "bold-header",
        },
        {
            field: "penalty",
            headerName: "Penalty",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.penalty,
            headerClassName: "bold-header",
        },
        {
            field: "nonpenalty",
            headerName: "Non Penalty",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.nonpenalty,
            headerClassName: "bold-header",
        },
        {
            field: "bulkupload",
            headerName: "Bulk Upload",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.bulkupload,
            headerClassName: "bold-header",
        },
        {
            field: "bulkkeying",
            headerName: "Bulk Keying",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.bulkkeying,
            headerClassName: "bold-header",
        },
        {
            field: "edited1",
            headerName: "Edited1",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.edited1,
            headerClassName: "bold-header",
        },
        {
            field: "edited2",
            headerName: "Edited2",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.edited2,
            headerClassName: "bold-header",
        },
        {
            field: "edited3",
            headerName: "Edited3",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.edited3,
            headerClassName: "bold-header",
        },
        {
            field: "edited4",
            headerName: "Edited4",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.edited4,
            headerClassName: "bold-header",
        },
        {
            field: "reject1",
            headerName: "Reject1",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.reject1,
            headerClassName: "bold-header",
        },
        {
            field: "reject2",
            headerName: "Reject2",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.reject2,
            headerClassName: "bold-header",
        },
        {
            field: "reject3",
            headerName: "Reject3",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.reject3,
            headerClassName: "bold-header",
        },
        {
            field: "reject4",
            headerName: "Reject4",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.reject4,
            headerClassName: "bold-header",
        },
        {
            field: "notvalidate",
            headerName: "Not Validate",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.notvalidate,
            headerClassName: "bold-header",
        },
        {
            field: "validerror",
            headerName: "Valid Error",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.validerror,
            headerClassName: "bold-header",
        },
        {
            field: "waiver",
            headerName: "Waiver %",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.waiver,
            headerClassName: "bold-header",
        },
        {
            field: "empwaiver",
            headerName: "Emp Waiver",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.empwaiver,
            headerClassName: "bold-header",
        },
        {
            field: "neterror",
            headerName: "Net Error",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.neterror,
            headerClassName: "bold-header",
        },
        {
            field: "per",
            headerName: "per %",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.per,
            headerClassName: "bold-header",
        },
        {
            field: "percentage",
            headerName: "Percentage",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.percentage,
            headerClassName: "bold-header",
        },
        {
            field: "amount",
            headerName: "Amount",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.amount,
            headerClassName: "bold-header",
        },
        {
            field: "history",
            headerName: "History",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.history,
            headerClassName: "bold-header",
        },
        {
            field: "monthhistory",
            headerName: "Month History",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.monthhistory,
            headerClassName: "bold-header",
        },
        {
            field: "request",
            headerName: "Request",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.request,
            headerClassName: "bold-header",
        },
        {
            field: "forward",
            headerName: "Forward",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.forward,
            headerClassName: "bold-header",
        },
        {
            field: "recheck",
            headerName: "Recheck",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.recheck,
            headerClassName: "bold-header",
        },
        {
            field: "mode",
            headerName: "Mode",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.mode,
            headerClassName: "bold-header",
        },
        {
            field: "forward",
            headerName: "Forward",
            flex: 0,
            width: 100,
            hide: !columnVisibilitytwo.forward,
            headerClassName: "bold-header",
        },
    ];

    const rowDataTable = filteredData.map((item, index) => {
        return {
            id: item._id,
            serialNumber: item.serialNumber,
            level: item.level,
            name: item.name,
            empcode: item.empcode,
            date: item.date,
            ventorname: item.ventorname,
            process: item.process,
            totalfield: item.totalfield,
            autoerror: item.autoerror,
            manualerror: item.manualerror,
            uploaderror: item.uploaderror,
            moved: item.moved,
            notupload: item.notupload,
            penalty: item.penalty,
            nonpenalty: item.nonpenalty,
            bulkupload: item.bulkupload,
            bulkkeying: item.bulkkeying,
            edited1: item.edited1,
            edited2: item.edited2,
            edited3: item.edited3,
            edited4: item.edited4,
            reject1: item.reject1,
            reject2: item.reject2,
            reject3: item.reject3,
            reject4: item.reject4,
            notvalidate: item.notvalidate,
            validerror: item.validerror,
            waiver: item.waiver,
            empwaiver: item.empwaiver,
            neterror: item.neterror,
            per: item.per,
            percentage: item.percentage,
            amount: item.amount,
            history: item.history,
            monthhistory: item.monthhistory,
            request: item.request,
            forward: item.forward,
            recheck: item.recheck,
            mode: item.mode,
            forward: item.forward,

        };
    });

    // second Table
    const rowDataTabletwo = filteredDatatwo.map((item, index) => {
        return {
            id: item._id,
            serialNumber: item.serialNumber,
            level: item.level,
            name: item.name,
            empcode: item.empcode,
            date: item.date,
            ventorname: item.ventorname,
            process: item.process,
            totalfield: item.totalfield,
            autoerror: item.autoerror,
            manualerror: item.manualerror,
            uploaderror: item.uploaderror,
            moved: item.moved,
            notupload: item.notupload,
            penalty: item.penalty,
            nonpenalty: item.nonpenalty,
            bulkupload: item.bulkupload,
            bulkkeying: item.bulkkeying,
            edited1: item.edited1,
            edited2: item.edited2,
            edited3: item.edited3,
            edited4: item.edited4,
            reject1: item.reject1,
            reject2: item.reject2,
            reject3: item.reject3,
            reject4: item.reject4,
            notvalidate: item.notvalidate,
            validerror: item.validerror,
            waiver: item.waiver,
            empwaiver: item.empwaiver,
            neterror: item.neterror,
            per: item.per,
            percentage: item.percentage,
            amount: item.amount,
            history: item.history,
            monthhistory: item.monthhistory,
            request: item.request,
            forward: item.forward,
            recheck: item.recheck,
            mode: item.mode,
            forward: item.forward,
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

    // Show All Columns functionality second Table
    const handleShowAllColumnstwo = () => {
        const updatedVisibility = { ...columnVisibilitytwo };
        for (const columnKey in updatedVisibility) {
            updatedVisibility[columnKey] = true;
        }
        setColumnVisibilitytwo(updatedVisibility);
    };

    // // Function to filter columns based on search query
    const filteredColumns = columnDataTable.filter((column) =>
        column.headerName.toLowerCase().includes(searchQueryManage.toLowerCase())
    );

    // // Function to filter columns based on search query second Table
    const filteredColumnstwo = columnDataTabletwo.filter((column) =>
        column.headerName.toLowerCase().includes(searchQueryManagetwo.toLowerCase())
    );

    // Manage Columns functionality
    const toggleColumnVisibility = (field) => {
        setColumnVisibility((prevVisibility) => ({
            ...prevVisibility,
            [field]: !prevVisibility[field],
        }));
    };

    // Manage Columns functionality secondtable
    const toggleColumnVisibilitytwo = (field) => {
        setColumnVisibilitytwo((prevVisibility) => ({
            ...prevVisibility,
            [field]: !prevVisibility[field],
        }));
    };

    const [fileFormat, setFormat] = useState("");
    let exportColumnNames = ['Level', 'Name', 'Emp Code', 'Date', 'Ventor Name', 'Process', 'Total Field', 'Auto Error', 'Manual Error', 'Upload Error', 'Moved', 'Not Upload',
        'Penalty', 'Non Penalty', 'Bulk Upload', 'Bulk Keying', 'Edited1', 'Edited2', 'Edited3', 'Edited4', 'Reject1', 'Reject2', 'Reject3', 'Reject4', 'Not validate', 'Valid Error',
        'Waiver%', 'Emp Waiver', 'Net Error', 'per%', 'Percentage', 'Amount', 'History', 'Month History', 'Request', 'Forward', 'Recheck', 'Mode', 'Forward'];
    let exportRowValues = ['level', 'name', 'empcode', 'date', 'ventorname', 'process', 'totalfield', 'autoerrror', 'manualerror', 'uploaderror', 'moved', 'notupload', 'penalty',
        'nonpenalty', 'bulkupload', 'bulkkeying', 'edited1', 'edited2', 'edited3', 'edited4', 'reject1', 'reject2', 'reject3', 'reject4', 'notvalidate', 'validerror', 'waiver', 'empwaiver',
        'neterror', 'per', 'percentage', 'amount', 'history', 'monthhistory', 'request', 'forward', 'recheck', 'mode', 'forward'];

    let exportColumnNamestwo = ['Level', 'Name', 'Emp Code', 'Date', 'Ventor Name', 'Process', 'Total Field', 'Auto Error', 'Manual Error', 'Upload Error', 'Moved', 'Not Upload',
        'Penalty', 'Non Penalty', 'Bulk Upload', 'Bulk Keying', 'Edited1', 'Edited2', 'Edited3', 'Edited4', 'Reject1', 'Reject2', 'Reject3', 'Reject4', 'Not validate', 'Valid Error',
        'Waiver%', 'Emp Waiver', 'Net Error', 'per%', 'Percentage', 'Amount', 'History', 'Month History', 'Request', 'Forward', 'Recheck', 'Mode', 'Forward'];
    let exportRowValuestwo = ['level', 'name', 'empcode', 'date', 'ventorname', 'process', 'totalfield', 'autoerrror', 'manualerror', 'uploaderror', 'moved', 'notupload', 'penalty',
        'nonpenalty', 'bulkupload', 'bulkkeying', 'edited1', 'edited2', 'edited3', 'edited4', 'reject1', 'reject2', 'reject3', 'reject4', 'notvalidate', 'validerror', 'waiver', 'empwaiver',
        'neterror', 'per', 'percentage', 'amount', 'history', 'monthhistory', 'request', 'forward', 'recheck', 'mode', 'forward'];;

    //print...
    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "Waiver Employee Forward List",
        pageStyle: "print",
    });

    //print...
    const componentReftwo = useRef();
    const handleprinttwo = useReactToPrint({
        content: () => componentReftwo.current,
        documentTitle: "Reject List",
        pageStyle: "print",
    });

    //image
    const handleCaptureImage = () => {
        if (gridRefTableImg.current) {
            domtoimage.toBlob(gridRefTableImg.current)
                .then((blob) => {
                    saveAs(blob, "Waiver Employee Forward.png");
                })
                .catch((error) => {
                    console.error("dom-to-image error: ", error);
                });
        }
    };

    //image second table
    const handleCaptureImagetwo = () => {
        if (gridRefTableImg.current) {
            domtoimage.toBlob(gridRefTableImg.current)
                .then((blob) => {
                    saveAs(blob, "Forward Employee Waiver Request List.png");
                })
                .catch((error) => {
                    console.error("dom-to-image error: ", error);
                });
        }
    };

    return (
        <Box>
            <Headtitle title={"Waiver Employee Forward"} />
            <PageHeading
                title="Waiver Employee Forward"
                modulename="Quality"
                submodulename="Penalty"
                mainpagename="Penalty Waiver"
                subpagename="Waiver Employee Forward"
                subsubpagename=""
            />
            {/* ****** Table Start ****** */}
            {isUserRoleCompare?.includes("lwaiveremployeeforward") && (
                <>
                    <Box sx={userStyle.dialogbox}>
                        <>
                            <Grid container spacing={2}>
                                <Grid item xs={8}>
                                    <Typography sx={userStyle.importheadtext}>Waiver Employee Forward</Typography>
                                </Grid>
                            </Grid>
                            <Grid container spacing={2}>
                                <Grid item md={4} xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <Typography>Mode</Typography>
                                        <Selects
                                            options={modeDropDowns}
                                            styles={colourStyles}
                                            value={{ label: modeselection.label, value: modeselection.value, }}
                                            onChange={(e) => { setModeSelection(e); }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={4} xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <Typography>Level Mode</Typography>
                                        <Selects
                                            options={sectorDropDowns}
                                            styles={colourStyles}
                                            value={{ label: sectorSelection.label, value: sectorSelection.value, }}
                                            onChange={(e) => { setSectorSelection(e); }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={1} sm={6} xs={6} marginTop={3}>
                                    <LoadingButton
                                        onClick={handleSubmit}
                                        loading={loadingdeloverall}
                                        sx={buttonStyles.buttonsubmit}
                                        loadingPosition="end"
                                        variant="contained"
                                    >
                                        View
                                    </LoadingButton>
                                </Grid>
                                <Grid item lg={1} md={2} sm={2} xs={6}>
                                    <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0, } })}>
                                        <Button sx={buttonStyles.btncancel} onClick={handleClear} > Clear </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </>
                    </Box><br />
                    <Box sx={userStyle.container}>
                        {/* ******************************************************EXPORT Buttons****************************************************** */}
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>
                                {/* Waiver Employee Forward List */}
                                Not Forward Employee Waiver Request List
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
                                        <MenuItem value={waiverEmployees?.length}>All</MenuItem>
                                    </Select>
                                </Box>
                            </Grid>
                            <Grid item md={8} xs={12} sm={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                                <Box>
                                    {isUserRoleCompare?.includes("excelwaiveremployeeforward") && (
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
                                    {isUserRoleCompare?.includes("csvwaiveremployeeforward") && (
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
                                    {isUserRoleCompare?.includes("printwaiveremployeeforward") && (
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
                                    {isUserRoleCompare?.includes("pdfwaiveremployeeforward") && (
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
                                    {isUserRoleCompare?.includes("imagewaiveremployeeforward") && (
                                        <>
                                            <Button
                                                sx={userStyle.buttongrp}
                                                onClick={handleCaptureImage}
                                            >
                                                <ImageIcon sx={{ fontSize: "15px" }} />{" "}
                                                &ensp;Image&ensp;
                                            </Button>
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
                                        maindatas={waiverEmployees}
                                        setSearchedString={setSearchedString}
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                    />
                                </Box>
                            </Grid>
                        </Grid><br />
                        <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>Show All Columns</Button>&ensp;
                        <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumns} >Manage Columns</Button><br /><br />
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
                                />
                            </>
                        )}
                    </Box><br />
                    {/* Second Tabale  */}
                    <Box sx={userStyle.container}>
                        {/* ******************************************************EXPORT Buttons****************************************************** */}
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>
                                {/* Waiver Employee Forward List */}
                                Forward Employee Waiver Request List
                            </Typography>
                        </Grid>
                        <Grid container spacing={2} style={userStyle.dataTablestyle}>
                            <Grid item md={2} xs={12} sm={12}>
                                <Box>
                                    <label>Show entries:</label>
                                    <Select
                                        id="pageSizeSelect"
                                        value={pageSizetwo}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 180,
                                                    width: 80,
                                                },
                                            },
                                        }}
                                        onChange={handlePageSizeChangetwo}
                                        sx={{ width: "77px" }}
                                    >
                                        <MenuItem value={1}>1</MenuItem>
                                        <MenuItem value={5}>5</MenuItem>
                                        <MenuItem value={10}>10</MenuItem>
                                        <MenuItem value={25}>25</MenuItem>
                                        <MenuItem value={50}>50</MenuItem>
                                        <MenuItem value={100}>100</MenuItem>
                                        <MenuItem value={waiverEmployeetwos?.length}>All</MenuItem>
                                    </Select>
                                </Box>
                            </Grid>
                            <Grid item md={8} xs={12} sm={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                                <Box>
                                    {isUserRoleCompare?.includes("excelwaiveremployeeforward") && (
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
                                    {isUserRoleCompare?.includes("csvwaiveremployeeforward") && (
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
                                    {isUserRoleCompare?.includes("printwaiveremployeeforward") && (
                                        <>
                                            <Button
                                                sx={userStyle.buttongrp}
                                                onClick={handleprinttwo}
                                            >
                                                &ensp;
                                                <FaPrint />
                                                &ensp;Print&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("pdfwaiveremployeeforward") && (
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
                                    {isUserRoleCompare?.includes("imagewaiveremployeeforward") && (
                                        <>
                                            <Button
                                                sx={userStyle.buttongrp}
                                                onClick={handleCaptureImagetwo}
                                            >
                                                <ImageIcon sx={{ fontSize: "15px" }} />{" "}
                                                &ensp;Image&ensp;
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </Grid>
                            <Grid item md={2} xs={6} sm={6}>
                                <Box>
                                    <AggregatedSearchBar
                                        columnDataTable={columnDataTabletwo}
                                        setItems={setItemstwo}
                                        addSerialNumber={addSerialNumbertwo}
                                        setPage={setPagetwo}
                                        maindatas={waiverEmployeetwos}
                                        setSearchedString={setSearchedStringtwo}
                                        searchQuery={searchQuerytwo}
                                        setSearchQuery={setSearchQuerytwo}
                                    />
                                </Box>
                            </Grid>
                        </Grid> <br />
                        <Button sx={userStyle.buttongrp} onClick={handleShowAllColumnstwo}>Show All Columns</Button>&ensp;
                        <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumnstwo} >Manage Columns</Button> <br />
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
                                    rowDataTable={rowDataTabletwo}
                                    columnDataTable={columnDataTabletwo}
                                    columnVisibility={columnVisibilitytwo}
                                    page={pagetwo}
                                    setPage={setPagetwo}
                                    pageSize={pageSizetwo}
                                    totalPages={totalPagestwo}
                                    setColumnVisibility={setColumnVisibilitytwo}
                                    isHandleChange={isHandleChangetwo}
                                    items={itemstwo}
                                    selectedRows={selectedRowstwo}
                                    setSelectedRows={setSelectedRowstwo}
                                    gridRefTable={gridRefTabletwo}
                                    paginated={false}
                                    filteredDatas={filteredDatastwo}
                                    // totalDatas={totalDatas}
                                    searchQuery={searchedStringtwo}
                                    handleShowAllColumns={handleShowAllColumnstwo}
                                    setFilteredRowData={setFilteredRowDatatwo}
                                    filteredRowData={filteredRowDatatwo}
                                    setFilteredChanges={setFilteredChangestwo}
                                    filteredChanges={filteredChangestwo}
                                    gridRefTableImg={gridRefTableImgtwo}
                                />
                            </>
                        )}
                    </Box><br />
                    <RecheckForwardEmployee />
                </>
            )}

            {/* Manage Column */}
            <Popover
                id={id}
                open={isManageColumnsOpen}
                anchorEl={anchorEl}
                onClose={handleCloseManageColumns}
                anchorOrigin={{ vertical: "bottom", horizontal: "left", }}>
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

            {/* Manage Column */}
            <Popover
                id={idtwo}
                open={isManageColumnsOpentwo}
                anchorEl={anchorEltwo}
                onClose={handleCloseManageColumnstwo}
                anchorOrigin={{ vertical: "bottom", horizontal: "left", }}>
                <ManageColumnsContent
                    handleClose={handleCloseManageColumnstwo}
                    searchQuery={searchQueryManagetwo}
                    setSearchQuery={setSearchQueryManagetwo}
                    filteredColumns={filteredColumnstwo}
                    columnVisibility={initialColumnVisibilitytwo}
                    toggleColumnVisibility={toggleColumnVisibilitytwo}
                    setColumnVisibility={setColumnVisibilitytwo}
                    initialColumnVisibility={initialColumnVisibilitytwo}
                    columnDataTable={columnDataTabletwo}
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
                itemsTwo={waiverEmployees ?? []}
                filename={"Not Forward Employee Waiver Request"}
                exportColumnNames={exportColumnNames}
                exportRowValues={exportRowValues}
                componentRef={componentRef}
            />
            {/* second Table */}
            <ExportData
                isFilterOpen={isFilterOpentwo}
                handleCloseFilterMod={handleCloseFilterModtwo}
                fileFormat={fileFormat}
                setIsFilterOpen={setIsFilterOpentwo}
                isPdfFilterOpen={isPdfFilterOpentwo}
                setIsPdfFilterOpen={setIsPdfFilterOpentwo}
                handleClosePdfFilterMod={handleClosePdfFilterModtwo}
                filteredDataTwo={(filteredChangestwo !== null ? filteredRowDatatwo : rowDataTabletwo) ?? []}
                itemsTwo={waiverEmployeetwos ?? []}
                filename={"Forward Employee Waiver Request "}
                exportColumnNames={exportColumnNamestwo}
                exportRowValues={exportRowValuestwo}
                componentRef={componentReftwo}
            />
            {/* EXTERNAL COMPONENTS -------------- END */}
        </Box>
    );
}

export default WaiverEmployeeForward;