import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import {
    Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControl, Grid, IconButton, List, ListItem, ListItemText, MenuItem,
    OutlinedInput, Popover, Select, TextField, Typography,
} from "@mui/material";
import Switch from "@mui/material/Switch";
import axios from "axios";
import { saveAs } from "file-saver";
import "jspdf-autotable";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import { handleApiError } from "../../../components/Errorhandling";
import Headtitle from "../../../components/Headtitle";
import { AuthContext, UserRoleAccessContext } from "../../../context/Appcontext";
import { userStyle } from "../../../pageStyle";
import { SERVICE } from "../../../services/Baseservice";
import { ThreeDots } from "react-loader-spinner";
import AlertDialog from "../../../components/Alert";
import ExportData from "../../../components/ExportData";
import MessageAlert from "../../../components/MessageAlert";
import PageHeading from "../../../components/PageHeading";
import AggregatedSearchBar from "../../../components/AggregatedSearchBar";
import AggridTable from "../../../components/AggridTable";
import domtoimage from 'dom-to-image';

function RecheckForwardEmployee() {
    const [filteredRowData, setFilteredRowData] = useState([]);
    const [filteredChanges, setFilteredChanges] = useState(null);
    const [isHandleChange, setIsHandleChange] = useState(false);
    const [filteredRowDatatwo, setFilteredRowDatatwo] = useState([]);
    const [filteredChangestwo, setFilteredChangestwo] = useState(null);
    const [isHandleChangetwo, setIsHandleChangetwo] = useState(false);
    const [searchedString, setSearchedString] = useState("");
    const [searchedStringtwo, setSearchedStringtwo] = useState("");
    const gridRefTable = useRef(null);
    const gridRefTabletwo = useRef(null);
    const gridRefTableImg = useRef(null);
    const gridRefTableImgtwo = useRef(null);
    const [openPopupMalert, setOpenPopupMalert] = useState(false);
    const [loader, setLoader] = useState(false);
    const [popupContentMalert, setPopupContentMalert] = useState("");
    const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
    const handleClickOpenPopupMalert = () => {
        setOpenPopupMalert(true);
        setloadingdeloverall(false);
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

    const [loadingdeloverall, setloadingdeloverall] = useState(false);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

    // page refersh reload
    const handleCloseFilterMod = () => {
        setIsFilterOpen(false);
    };
    const handleClosePdfFilterMod = () => {
        setIsPdfFilterOpen(false);
    };

    // second table
    const [isFilterOpentwo, setIsFilterOpentwo] = useState(false);
    const [isPdfFilterOpentwo, setIsPdfFilterOpentwo] = useState(false);

    // page refersh reload
    const handleCloseFilterModtwo = () => {
        setIsFilterOpentwo(false);
    };
    const handleClosePdfFilterModtwo = () => {
        setIsPdfFilterOpentwo(false);
    };

    const [waiverEmployee, setWaiverEmployee] = useState({ modeone: "My List", levelmode: "Level 1", });
    const [waiverEmployeeEdit, setWaiverEmployeeEdit] = useState({ modeone: "My List", levelmode: "Level 1", });
    const [waiverEmployees, setWaiverEmployees] = useState([]);
    const [waiverEmployeetwos, setWaiverEmployeetwos] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchQuerytwo, setSearchQuerytwo] = useState("");
    const [allClientErrorEdit, setAllClientErrorEdit] = useState([]);
    const { isUserRoleCompare, isUserRoleAccess, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);
    const { auth } = useContext(AuthContext);
    const gridRef = useRef(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedRowstwo, setSelectedRowstwo] = useState([]);
    const [searchQueryManage, setSearchQueryManage] = useState("");
    const [searchQueryManagetwo, setSearchQueryManagetwo] = useState("");
    const [copiedData, setCopiedData] = useState("");
    const [openviewalert, setOpenviewalert] = useState(false);

    // view model
    const handleClickOpenviewalert = () => {
        setOpenviewalert(true);
    };
    const handleCloseviewalert = () => {
        setOpenviewalert(false);
    };

    //image
    const handleCaptureImage = () => {
        if (gridRefTableImg.current) {
            domtoimage.toBlob(gridRefTableImg.current)
                .then((blob) => {
                    saveAs(blob, "Recheck Forward Employee Waiver Request.png");
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
                    saveAs(blob, "Recheck Employee Waiver Request.png");
                })
                .catch((error) => {
                    console.error("dom-to-image error: ", error);
                });
        }
    };

    const handleSelectionChange = (newSelection) => {
        setSelectedRows(newSelection.selectionModel);
    };
    const handleSelectionChangetwo = (newSelection) => {
        setSelectedRowstwo(newSelection.selectionModel);
    };

    //Datatable
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    //Datatable second Table
    const [pagetwo, setPagetwo] = useState(1);
    const [pageSizetwo, setPageSizetwo] = useState(10);

    // view model
    const [openview, setOpenview] = useState(false);

    const handleClickOpenview = () => {
        setOpenview(true);
    };
    const handleCloseview = () => {
        setOpenview(false);
    };

    //Delete model
    const [isDeleteOpencheckbox, setIsDeleteOpencheckbox] = useState(false);

    const handleClickOpencheckbox = () => {
        setIsDeleteOpencheckbox(true);
    };
    const handleCloseModcheckbox = () => {
        setIsDeleteOpencheckbox(false);
    };

    //Delete model
    const [isDeleteOpenalert, setIsDeleteOpenalert] = useState(false);

    const handleClickOpenalert = () => {
        setIsHandleChange(true);
        if (selectedRows.length === 0) {
            setIsDeleteOpenalert(true);
        } else {
            setIsDeleteOpencheckbox(true);
        }
    };
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

    // Manage Columns second Table
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

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    const opentwo = Boolean(anchorEltwo);
    const idtwo = opentwo ? "simple-popover" : undefined;

    const getRowClassName = (params) => {
        if (selectedRows.includes(params.data.id)) {
            return "custom-id-row"; // This is the custom class for rows with item.tat === 'ago'
        }
        return ""; // Return an empty string for other rows
    };

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

    const [columnVisibility, setColumnVisibility] = useState(
        initialColumnVisibility
    );

    const [columnVisibilitytwo, setColumnVisibilitytwo] = useState(
        initialColumnVisibilitytwo
    );

    // page refersh reload code
    const handleBeforeUnload = (event) => {
        event.preventDefault();
        event.returnValue = ""; // This is required for Chrome support
    };

    //Edit model...
    const [isEditOpen, setIsEditOpen] = useState(false);
    const handleClickOpenEdit = () => {
        setIsEditOpen(true);
    };
    const handleCloseModEdit = (e, reason) => {
        if (reason && reason === "backdropClick") return;
        setIsEditOpen(false);
    };

    //get all project.
    const fetchAllClient = async () => {
        setPageName(!pageName)
        try {
            let res_grp = await axios.get(SERVICE.GROUP, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setWaiverEmployees(res_grp?.data?.groups.map((item, index) => ({
                ...item,
                serialNumber: index + 1,
            })));
            setWaiverEmployeetwos(res_grp?.data?.groups.map((item, index) => ({
                ...item,
                serialNumber: index + 1,
            })));
            setLoader(true);
        } catch (err) {
            setLoader(true);
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    //get all project.
    const fetchClientAll = async () => {
        setPageName(!pageName)
        try {
            let res_grp = await axios.get(SERVICE.GROUP, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setAllClientErrorEdit(
                res_grp?.data?.groups.filter((item) => item._id !== waiverEmployeeEdit._id)
            );
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    //print...
    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "Recheck Forward Employee Waiver Request List",
        pageStyle: "print",
    });

    //print...
    const componentReftwo = useRef();
    const handleprinttwo = useReactToPrint({
        content: () => componentReftwo.current,
        documentTitle: "Recheck Employee Waiver Request",
        pageStyle: "print",
    });

    useEffect(() => {
        fetchAllClient();
    }, []);

    useEffect(() => {
        fetchClientAll();
    }, [isEditOpen, waiverEmployeeEdit]);

    useEffect(() => {
        const beforeUnloadHandler = (event) => handleBeforeUnload(event);
        window.addEventListener("beforeunload", beforeUnloadHandler);
        return () => {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
        };
    }, []);

    const [items, setItems] = useState([]);

    const addSerialNumber = (datas) => {
        setItems(datas);
    };

    useEffect(() => {
        addSerialNumber(waiverEmployees);
    }, [waiverEmployees]);

    // second Table
    const [itemstwo, setItemstwo] = useState([]);

    const addSerialNumbertwo = (datas) => {
        setItemstwo(datas);
    };

    useEffect(() => {
        addSerialNumbertwo(waiverEmployeetwos);
    }, [waiverEmployeetwos]);

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

    //Datatable second Table
    const handlePageChangetwo = (newPage) => {
        setPagetwo(newPage);
        setSelectedRowstwo([]);
        setSelectAllCheckedtwo(false);
    };

    const handlePageSizeChangetwo = (event) => {
        setPageSizetwo(Number(event.target.value));
        setSelectedRowstwo([]);
        setSelectAllCheckedtwo(false);
        setPagetwo(1);
    };

    //datatable....
    const handleSearchChangetwo = (event) => {
        setSearchQuerytwo(event.target.value);
    };
    // Split the search query into individual terms
    const searchTermstwo = searchQuerytwo.toLowerCase().split(" ");
    // Modify the filtering logic to check each term
    const filteredDatastwo = itemstwo?.filter((item) => {
        return searchTermstwo.every((term) =>
            Object.values(item).join(" ").toLowerCase().includes(term)
        );
    });
    const filteredDatatwo = filteredDatastwo.slice(
        (pagetwo - 1) * pageSizetwo,
        pagetwo * pageSizetwo
    );
    const totalPagestwo = Math.ceil(filteredDatastwo.length / pageSizetwo);
    const visiblePagestwo = Math.min(totalPagestwo, 3);
    const firstVisiblePagetwo = Math.max(1, pagetwo - 1);
    const lastVisiblePagetwo = Math.min(
        firstVisiblePagetwo + visiblePagestwo - 1,
        totalPagestwo
    );
    const pageNumberstwo = [];
    const indexOfLastItemtwo = pagetwo * pageSizetwo;
    const indexOfFirstItemtwo = indexOfLastItemtwo - pageSizetwo;
    for (let i = firstVisiblePagetwo; i <= lastVisiblePagetwo; i++) {
        pageNumberstwo.push(i);
    }

    const [selectAllChecked, setSelectAllChecked] = useState(false);

    const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
        <div>
            <Checkbox checked={selectAllChecked} onChange={onSelectAll} />
        </div>
    );
    // second Table
    const [selectAllCheckedtwo, setSelectAllCheckedtwo] = useState(false);

    const CheckboxHeadertwo = ({ selectAllCheckedtwo, onSelectAll }) => (
        <div>
            <Checkbox checked={selectAllCheckedtwo} onChange={onSelectAll} />
        </div>
    );

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

    const rowsWithCheckboxes = rowDataTable.map((row) => ({
        ...row,
        // Create a custom field for rendering the checkbox
        checkbox: selectedRows.includes(row.id),
    }));
    // second Table
    const rowsWithCheckboxestwo = rowDataTabletwo.map((row) => ({
        ...row,
        // Create a custom field for rendering the checkbox
        checkbox: selectedRowstwo.includes(row.id),
    }));

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

    // JSX for the "Manage Columns" popover content second Table
    const manageColumnsContenttwo = (
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
                onClick={handleCloseManageColumnstwo}
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
                    value={searchQueryManagetwo}
                    onChange={(e) => setSearchQueryManagetwo(e.target.value)}
                    sx={{ marginBottom: 5, position: "absolute" }}
                />
            </Box>
            <br />
            <br />
            <DialogContent
                sx={{ minWidth: "auto", height: "200px", position: "relative" }}
            >
                <List sx={{ overflow: "auto", height: "100%" }}>
                    {filteredColumnstwo.map((column) => (
                        <ListItem key={column.field}>
                            <ListItemText
                                sx={{ display: "flex" }}
                                primary={
                                    <Switch
                                        sx={{ marginTop: "-5px" }}
                                        size="small"
                                        checked={columnVisibilitytwo[column.field]}
                                        onChange={() => toggleColumnVisibilitytwo(column.field)}
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
                            onClick={() => setColumnVisibilitytwo(initialColumnVisibilitytwo)}
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
                                columnDataTabletwo.forEach((column) => {
                                    newColumnVisibility[column.field] = false; // Set hide property to true
                                });
                                setColumnVisibilitytwo(newColumnVisibility);
                            }}
                        >
                            Hide All
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Box>
    );
    const [fileFormat, setFormat] = useState("");

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

    return (
        <Box>
            <Headtitle title={"Waiver Employee Forward"} />
            {/* <PageHeading
                title="Waiver Employee Forward"
                modulename="Quality"
                submodulename="Penalty"
                mainpagename="Penalty Setup"
                subpagename="Penalty Calculation"
                subsubpagename="Waiver Employee Forward"
            /> */}

            <br />
            {/* ****** Table Start ****** */}
            {isUserRoleCompare?.includes("lwaiveremployeeforward") && (

                <>
                    <Box sx={userStyle.container}>
                        {/* ******************************************************EXPORT Buttons****************************************************** */}
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>
                                Recheck Forward Employee Waiver Request List
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
                        </Grid>
                        <br />
                        <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>
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
                        {isUserRoleCompare?.includes("bdwaiveremployeeforward") && (
                            <Button
                                variant="contained"
                                sx={buttonStyles.buttonbulkdelete}
                                onClick={handleClickOpenalert}
                            >
                                Bulk Delete
                            </Button>
                        )}
                        <br />
                        {!loader ? (
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
            <br />
            {/* ****** Table Start ****** */}
            {/* Second Tabale  */}
            {isUserRoleCompare?.includes("lwaiveremployeeforward") && (

                <>
                    <Box sx={userStyle.container}>
                        {/* ******************************************************EXPORT Buttons****************************************************** */}
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>
                                Recheck Employee Waiver Request List
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
                        </Grid>
                        <br />
                        <Button sx={userStyle.buttongrp} onClick={handleShowAllColumnstwo}>
                            Show All Columns
                        </Button>
                        &ensp;
                        <Button
                            sx={userStyle.buttongrp}
                            onClick={handleOpenManageColumnstwo}
                        >
                            Manage Columns
                        </Button>
                        &ensp;
                        {isUserRoleCompare?.includes("bdwaiveremployeeforward") && (
                            <Button
                                variant="contained"
                                sx={buttonStyles.buttonbulkdelete}
                                onClick={handleClickOpenalert}
                            >
                                Bulk Delete
                            </Button>
                        )}
                        <br />
                        {!loader ? (
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
                    </Box>
                </>

            )}
            {/* Manage Column */}
            <Popover
                id={id}
                open={isManageColumnsOpentwo}
                anchorEl={anchorEltwo}
                onClose={handleCloseManageColumnstwo}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
            >
                {manageColumnsContenttwo}
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
                filename={"Recheck Forward Employee Waiver Request"}
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
                filename={"Recheck Employee Waiver Request "}
                exportColumnNames={exportColumnNamestwo}
                exportRowValues={exportRowValuestwo}
                componentRef={componentReftwo}
            />

            {/* EXTERNAL COMPONENTS -------------- END */}
        </Box>
    );
}

export default RecheckForwardEmployee;
