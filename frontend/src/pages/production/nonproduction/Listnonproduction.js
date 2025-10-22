import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ImageIcon from '@mui/icons-material/Image';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    FormControl, Grid,
    IconButton,
    List, ListItem, ListItemText,
    MenuItem,
    Popover,
    Select,
    TextField,
    Typography,
    OutlinedInput,

} from "@mui/material";
import Switch from '@mui/material/Switch';
import axios from "axios";
import domtoimage from 'dom-to-image';
import { saveAs } from "file-saver";
import 'jspdf-autotable';
import moment from 'moment-timezone';
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { ThreeDots } from 'react-loader-spinner';
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import AggregatedSearchBar from '../../../components/AggregatedSearchBar';
import AggridTable from "../../../components/AggridTable";
import AlertDialog from "../../../components/Alert";
import { handleApiError } from "../../../components/Errorhandling";
import ExportData from "../../../components/ExportData";
import Headtitle from "../../../components/Headtitle";
import MessageAlert from "../../../components/MessageAlert";
import PageHeading from "../../../components/PageHeading";
import { AuthContext, UserRoleAccessContext } from '../../../context/Appcontext';
import { userStyle } from "../../../pageStyle";
import { SERVICE } from '../../../services/Baseservice';
import { MultiSelect } from "react-multi-select-component";

function NonproductionList() {

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + "-" + mm + "-" + dd;

    const [filteredRowData, setFilteredRowData] = useState([]);
    const [filteredChanges, setFilteredChanges] = useState(null);

    const [filteredRowDataAssign, setFilteredRowDataAssign] = useState([]);
    const [filteredChangesAssign, setFilteredChangesAssign] = useState(null);

    const [filteredRowDataReject, setFilteredRowDataReject] = useState([]);
    const [filteredChangesReject, setFilteredChangesReject] = useState(null);


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
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
    // page refersh reload
    const handleCloseFilterMod = () => {
        setIsFilterOpen(false);
    };
    const handleClosePdfFilterMod = () => {
        setIsPdfFilterOpen(false);
    };
    const [isFilterOpenone, setIsFilterOpenone] = useState(false);
    const [isPdfFilterOpenone, setIsPdfFilterOpenone] = useState(false);
    // page refersh reload
    const handleCloseFilterModone = () => {
        setIsFilterOpenone(false);
    };
    const handleClosePdfFilterModone = () => {
        setIsPdfFilterOpenone(false);
    };
    const [isFilterOpentwo, setIsFilterOpentwo] = useState(false);
    const [isPdfFilterOpentwo, setIsPdfFilterOpentwo] = useState(false);
    // page refersh reload
    const handleCloseFilterModtwo = () => {
        setIsFilterOpentwo(false);
    };
    const handleClosePdfFilterModtwo = () => {
        setIsPdfFilterOpentwo(false);
    };

    const [searchedString, setSearchedString] = useState("")
    const [searchedStringApprove, setSearchedStringApprove] = useState("")
    const [searchedStringReject, setSearchedStringReject] = useState("")
    const gridRefTable = useRef(null);
    const gridRefTableAssigned = useRef(null);
    const gridRefTableReject = useRef(null);

    const [isHandleChange, setIsHandleChange] = useState(false);
    const [isHandleChangeApproved, setIsHandleChangeApproved] = useState(false);
    const [isHandleChangeReject, setIsHandleChangeReject] = useState(false);

    const [fileFormat, setFormat] = useState("");
    const [fileFormatone, setFormatone] = useState("");
    const [fileFormattwo, setFormattwo] = useState("");
    const [taskcategory, setTaskcategory] = useState({
        base: "All",
        category: "Please Select Category",
        subcategory: "Please Select Sub Category",
    });
    const [taskcategorys, setTaskcategorys] = useState([]);
    const [taskcategorysAssign, setTaskcategorysAssign] = useState([]);
    const [taskcategorysall, setTaskcategorysall] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchQueryAssign, setSearchQueryAssign] = useState("");
    const [searchQueryall, setSearchQueryall] = useState("");
    const { isUserRoleCompare, isUserRoleAccess, isAssignBranch, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);
    const { auth } = useContext(AuthContext);
    const [taskcategoryCheck, setTaskcategorycheck] = useState(false);
    const username = isUserRoleAccess.username
    const gridRef = useRef(null);
    const gridRefAssign = useRef(null);
    const gridRefall = useRef(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedRowsAssign, setSelectedRowsAssign] = useState([]);
    const [selectedRowsall, setSelectedRowsall] = useState([]);
    const [searchQueryManage, setSearchQueryManage] = useState("");
    const [searchQueryManageAssign, setSearchQueryManageAssign] = useState("");
    const [searchQueryManageall, setSearchQueryManageall] = useState("");
    const [copiedData, setCopiedData] = useState('');
    //image

    const gridRefTableImg = useRef(null);
    // image
    const handleCaptureImage = () => {
        if (gridRefTableImg.current) {
            domtoimage.toBlob(gridRefTableImg.current)
                .then((blob) => {
                    saveAs(blob, "Assign List.png");
                })
                .catch((error) => {
                    console.error("dom-to-image error: ", error);
                });
        }
    };

    const gridRefTableImgApprove = useRef(null);


    const handleCaptureImageAssign = () => {
        if (gridRefTableImgApprove.current) {
            domtoimage.toBlob(gridRefTableImgApprove.current)
                .then((blob) => {
                    saveAs(blob, "Approved List.png");
                })
                .catch((error) => {
                    console.error("dom-to-image error: ", error);
                });
        }
    };

    const gridRefTableImgReject = useRef(null);

    const handleCaptureImageAll = () => {
        if (gridRefTableImgReject.current) {
            domtoimage.toBlob(gridRefTableImgReject.current)
                .then((blob) => {
                    saveAs(blob, "Reject List.png");
                })
                .catch((error) => {
                    console.error("dom-to-image error: ", error);
                });
        }
    };

    const handleSelectionChange = (newSelection) => {
        setSelectedRows(newSelection.selectionModel);
    };
    const handleSelectionChangeAssign = (newSelection) => {
        setSelectedRowsAssign(newSelection.selectionModel);
    };
    const handleSelectionChangeall = (newSelection) => {
        setSelectedRowsall(newSelection.selectionModel);
    };
    //Datatable
    const [page, setPage] = useState(1);
    const [pageApproved, setPageApproved] = useState(1);
    const [pageReject, setPageReject] = useState(1);
    const [pageAsssign, setPageAssign] = useState(1);
    const [pageall, setPageall] = useState(1);
    const [pagesizeall, setPageSizeall] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pageSizeApprove, setPageSizeApprove] = useState(10);
    const [pagesizeReject, setPageSizeReject] = useState(10);
    const [isOpenReject, setIsOpenReject] = useState(false);
    const handleClickOpenReject = () => {
        setIsOpenReject(true);
    };
    const handleCloseReject = () => {
        setIsOpenReject(false);
    }
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [showAlert, setShowAlert] = useState()
    const handleClickOpenerr = () => {
        setIsErrorOpen(true);
    };
    const handleCloseerr = () => {
        setIsErrorOpen(false);
    };
    // Manage Columns
    const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
    const [isManageColumnsOpenAssign, setManageColumnsOpenAssign] = useState(false);
    const [isManageColumnsOpenall, setManageColumnsOpenall] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null)
    const [anchorElAssign, setAnchorElAssign] = useState(null)
    const [anchorElall, setAnchorElall] = useState(null)
    const handleOpenManageColumns = (event) => {
        setAnchorEl(event.currentTarget);
        setManageColumnsOpen(true);
    };
    const handleOpenManageColumnsAssign = (event) => {
        setAnchorElAssign(event.currentTarget);
        setManageColumnsOpenAssign(true);
    };
    const handleOpenManageColumnsall = (event) => {
        setAnchorElall(event.currentTarget);
        setManageColumnsOpenall(true);
    };
    const handleCloseManageColumns = () => {
        setManageColumnsOpen(false);
        setSearchQueryManage("")
    };
    const handleCloseManageColumnsAssign = () => {
        setManageColumnsOpenAssign(false);
        setSearchQueryManageAssign("")
    };
    const handleCloseManageColumnsall = () => {
        setManageColumnsOpenall(false);
        setSearchQueryManageall("")
    };
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const getRowClassName = (params) => {
        if ((selectedRows).includes(params.row.id)) {
            return 'custom-id-row'; // This is the custom class for rows with item.tat === 'ago'
        }
        return ''; // Return an empty string for other rows
    };
    // Show All Columns & Manage Columns 
    const initialColumnVisibility = {
        serialNumber: true,
        checkbox: true,
        name: true,
        category: true,
        subcategory: true,
        mode: true,
        date: true,
        allotdays: true,
        allothours: true,
        allotmins: true,
        days: true,
        hours: true,
        minutes: true,
        count: true,
        actions: true,
    };
    const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);
    // Show All Columns & Manage Columns 
    const initialColumnVisibilityAssign = {
        serialNumber: true,
        checkbox: true,
        name: true,
        category: true,
        subcategory: true,
        mode: true,
        date: true,
        allotdays: true,
        allothours: true,
        allotmins: true,
        days: true,
        hours: true,
        minutes: true,
        count: true,
        // reason: true,
    };
    const [columnVisibilityAssign, setColumnVisibilityAssign] = useState(initialColumnVisibilityAssign);
    // Show All Columns & Manage Columns 
    const initialColumnVisibilityall = {
        serialNumber: true,
        checkbox: true,
        name: true,
        category: true,
        subcategory: true,
        mode: true,
        date: true,
        allotdays: true,
        allothours: true,
        allotmins: true,
        days: true,
        hours: true,
        minutes: true,
        count: true,
        // reason: true,
        actions: true,
    };
    const [columnVisibilityall, setColumnVisibilityall] = useState(initialColumnVisibilityall);
    // page refersh reload code
    const handleBeforeUnload = (event) => {
        event.preventDefault();
        event.returnValue = ''; // This is required for Chrome support
    };
    const handleIsApprove = () => {
        setShowAlert(
            <>
                <ErrorOutlineOutlinedIcon sx={{ fontSize: "3.5rem", color: "teal" }} />
                <p style={{ fontSize: '20px', fontWeight: 900 }}>{"Are You Sure to Approve"}</p>
            </>
        );
        handleClickOpenApprove();
    }
    const handleReject = () => {
        setShowAlert(
            <>
                <ErrorOutlineOutlinedIcon sx={{ fontSize: "3.5rem", color: "teal" }} />
                <p style={{ fontSize: '20px', fontWeight: 900 }}>{"Are You Sure to Reject"}</p>
            </>
        );
        handleClickOpenReject();
    }
    const [nonProduction, setNonProductionData] = useState([])
    //get single row to edit....
    const getCode = async (e, name) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.NONPRODUCTION_SINGLE}/${e}`, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                }
            });
            setNonProductionData(res?.data?.snonproduction);
            if (name == "approve") {
                handleIsApprove();
            } else {
                handleReject()
            }
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    }
    let exportColumnNames = ["Name", "Category", "Sub Category", "Mode", "Date", "Allot Min Days", "Allot Min Hours", "Allot Min Minutes", "Allot Max Days", "Allot Max Hours", "Allot Max Minutes", "Count"];
    let exportRowValues = ["name", "category", "subcategory", "mode", "date", "allotdays", "allothours", "allotmins", "days", "hours", "minutes", "count"];
    let exportColumnNamesone = ["Name", "Category", "Sub Category", "Mode", "Date", "Allot Min Days", "Allot Min Hours", "Allot Min Minutes", "Allot Max Days", "Allot Max Hours", "Allot Max Minutes", "Count"];
    let exportRowValuesone = ["name", "category", "subcategory", "mode", "date", "allotdays", "allothours", "allotmins", "days", "hours", "minutes", "count"];
    let exportColumnNamestwo = ["Name", "Category", "Sub Category", "Mode", "Date", "Allot Min Days", "Allot Min Hours", "Allot Min Minutes", "Allot Max Days", "Allot Max Hours", "Allot Max Minutes", "Count"];
    let exportRowValuestwo = ["name", "category", "subcategory", "mode", "date", "allotdays", "allothours", "allotmins", "days", "hours", "minutes", "count"];
    const handleFilterClick = async (from) => {
        setPageSize(10)
        setPageSizeApprove(10)
        setPageSizeReject(10)
        setTaskcategorycheck(false)
        setPageName(!pageName)
        try {
            let res_vendor = await axios.post(SERVICE.NONPRODUCTIONFILTERLIST, {
                base: taskcategory.base,
                category: valueCompanyAdd,
                subcategory: valueBranchAdd,
                fromdate: filterUser.fromdate,
                todate: filterUser.todate,
            }, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                }
            });
            if (from === "All") {
                const filterByBase = res_vendor?.data?.nonproduction.filter((item) => item.approvestatus === undefined);
                setTaskcategorys(filterByBase?.map((item, index) => ({
                    ...item,
                    serialNumber: index + 1,
                    name: item.name,
                    category: item.category,
                    subcategory: item.subcategory,
                    mode: item.mode,
                    date: moment(item.date).format("DD-MM-YYYY"),
                    allotdays: item.alloteddays,
                    allothours: item.allotedhours,
                    allotmins: item.allotedminutes,
                    days: item.days,
                    hours: item.hours,
                    minutes: item.minutes,
                    count: item.count
                })));
                setTaskcategorysAssign(res_vendor?.data?.nonproduction.filter((item) => item.approvestatus === true).map((item, index) => ({
                    ...item,
                    serialNumber: index + 1,
                    name: item.name,
                    category: item.category,
                    subcategory: item.subcategory,
                    mode: item.mode,
                    date: moment(item.date).format("DD-MM-YYYY"),
                    allotdays: item.alloteddays,
                    allothours: item.allotedhours,
                    allotmins: item.allotedminutes,
                    days: item.days,
                    hours: item.hours,
                    minutes: item.minutes,
                    count: item.count
                })))
                setTaskcategorysall(res_vendor?.data?.nonproduction.filter((item) => item.approvestatus === false).map((item, index) => ({
                    ...item,
                    serialNumber: index + 1,
                    date: moment(item.date).format("DD-MM-YYYY"),
                    allotdays: item.alloteddays,
                    allothours: item.allotedhours,
                    allotmins: item.allotedminutes,
                })));

                setTaskcategorycheck(true)
            } else {

                const filterByBase = res_vendor?.data?.nonproduction.filter((item) => item.mode === taskcategory.base && item.approvestatus === undefined)
                setTaskcategorys(filterByBase?.map((item, index) => ({
                    ...item,
                    serialNumber: index + 1,
                    name: item.name,
                    category: item.category,
                    subcategory: item.subcategory,
                    mode: item.mode,
                    date: moment(item.date).format("DD-MM-YYYY"),
                    allotdays: item.alloteddays,
                    allothours: item.allotedhours,
                    allotmins: item.allotedminutes,
                    days: item.days,
                    hours: item.hours,
                    minutes: item.minutes,
                    count: item.count
                })));
                setTaskcategorysAssign(res_vendor?.data?.nonproduction.filter((item) => item.approvestatus === true).map((item, index) => ({
                    ...item,
                    serialNumber: index + 1,
                    name: item.name,
                    category: item.category,
                    subcategory: item.subcategory,
                    mode: item.mode,
                    date: moment(item.date).format("DD-MM-YYYY"),
                    allotdays: item.alloteddays,
                    allothours: item.allotedhours,
                    allotmins: item.allotedminutes,
                    days: item.days,
                    hours: item.hours,
                    minutes: item.minutes,
                    count: item.count
                })))
                // setTaskcategorysAssign(res_vendor?.data?.nonproduction.filter((item) => item.approvestatus === true))
                setTaskcategorysall(res_vendor?.data?.nonproduction.filter((item) => item.approvestatus === false).map((item, index) => ({
                    ...item,
                    serialNumber: index + 1,
                    date: moment(item.date).format("DD-MM-YYYY"),
                    allotdays: item.alloteddays,
                    allothours: item.allotedhours,
                    allotmins: item.allotedminutes,
                })));
                setTaskcategorycheck(true)
            }
            setSearchQueryall("")
            setSearchQuery("")
            setSearchQueryAssign("")
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    }

    const handleClear = () => {

        setTaskcategory({
            base: "All",
            category: "Please Select Category",
            subcategory: "Please Select Sub Category",
        });
        setFilterUser({
            fromdate: today,
            todate: today,
            day: "Today"
        });
        setselectedcompanyOptionsEdit([])
        setValueCompanyAdd([])
        setselectedbranchOptionsEdit([])
        setValueBranchAdd([])
        setSubCatOpt([])
        setTaskcategorys([])
        setTaskcategorysAssign([])
        setTaskcategorysall([])
        setPopupContent("Cleared Successfully");
        setPopupSeverity("success");
        handleClickOpenPopup();
    }
    //print...
    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Assign List',
        pageStyle: 'print'
    });
    const componentRefAssign = useRef();
    const handleprintAssign = useReactToPrint({
        content: () => componentRefAssign.current,
        documentTitle: 'Approved List',
        pageStyle: 'print'
    });
    const componentRefall = useRef();
    const handleprintall = useReactToPrint({
        content: () => componentRefall.current,
        documentTitle: 'Reject List',
        pageStyle: 'print'
    });


    useEffect(() => {
        const beforeUnloadHandler = (event) => handleBeforeUnload(event);
        window.addEventListener("beforeunload", beforeUnloadHandler);
        return () => {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
        };
    }, []);


    const getapi = async () => {
        let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
            headers: {
                Authorization: `Bearer${auth.APIToken}`,
            },
            empcode: String(isUserRoleAccess?.empcode),
            companyname: String(isUserRoleAccess?.companyname),
            pagename: String("Non Production List"),
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


    const [selectedcompanyOptionsEdit, setselectedcompanyOptionsEdit] = useState([]);
    const [selectedbranchOptionsEdit, setselectedbranchOptionsEdit] = useState([]);

    let [valueBranchAdd, setValueBranchAdd] = useState("");
    const customValueRendererBranchAdd = (valueBranchAdd, _branches) => {
        return valueBranchAdd.length ? valueBranchAdd.map(({ label }) => label)?.join(",") :
            <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Sub Category</span>
    }
    let [valueCompanyAdd, setValueCompanyAdd] = useState("");
    const customValueRendererCompanyAdd = (valueCompanyAdd, _companies) => {
        return valueCompanyAdd.length ? valueCompanyAdd.map(({ label }) => label)?.join(",") :
            <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Category</span>
    }

    const handleCompanyChangeAdd = (options) => {
        setValueCompanyAdd(
            options.map(a => {
                return a.value;
            })
        )
        setselectedcompanyOptionsEdit(options);
        getCategoryAndSubcategory(options);
        setselectedbranchOptionsEdit([])
    }

    const handleBranchChangeAdd = (options) => {
        setValueBranchAdd(
            options.map((a) => {
                return a.value;
            })
        );
        setselectedbranchOptionsEdit(options);
    };


    const [filterUser, setFilterUser] = useState({
        fromdate: today,
        todate: today,
        day: "Today"
    });

    const daysoptions = [
        { label: "Yesterday", value: "Yesterday" },
        { label: "Last Week", value: "Last Week" },
        { label: "Last Month", value: "Last Month" },
        { label: "Today", value: "Today" },
        { label: "This Week", value: "This Week" },
        { label: "This Month", value: "This Month" },
        { label: "Custom Fields", value: "Custom Fields" },
    ]

    const handleChangeFilterDate = (e) => {
        let fromDate = '';
        let toDate = moment().format('YYYY-MM-DD');
        switch (e.value) {
            case 'Today':
                setFilterUser((prev) => ({ ...prev, fromdate: toDate, todate: toDate }))
                break;
            case 'Yesterday':
                fromDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
                toDate = fromDate; // Yesterday’s date
                setFilterUser((prev) => ({ ...prev, fromdate: fromDate, todate: toDate }))
                break;

            case 'Last Week':
                fromDate = moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD');
                toDate = moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD');
                setFilterUser((prev) => ({ ...prev, fromdate: fromDate, todate: toDate }))
                break;

            case 'This Week':
                fromDate = moment().startOf('week').format('YYYY-MM-DD');
                toDate = moment().endOf('week').format('YYYY-MM-DD');
                setFilterUser((prev) => ({ ...prev, fromdate: fromDate, todate: toDate }))
                break;

            case 'Last Month':
                fromDate = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
                toDate = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
                setFilterUser((prev) => ({ ...prev, fromdate: fromDate, todate: toDate }))
                break;

            case 'This Month':
                fromDate = moment().startOf('month').format('YYYY-MM-DD');
                toDate = moment().endOf('month').format('YYYY-MM-DD');
                setFilterUser((prev) => ({ ...prev, fromdate: fromDate, todate: toDate }))
                break;

            case 'Custom Fields':
                setFilterUser((prev) => ({ ...prev, fromdate: "", todate: "" }))
                break;
            default:
                return;
        }
    }

    const [catOpt, setCatOpt] = useState([])
    const [subCatOpt, setSubCatOpt] = useState([])
    const getCategory = async () => {
        setPageName(!pageName)
        try {
            let NonProduction = await axios.get(`${SERVICE.NONPRODUCTIONUNITALLOT}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let response = await axios.get(`${SERVICE.CATEGORYANDSUBCATEGORYGETALL}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const CatOptall = [...response?.data?.categoryandsubcategory?.map((t) => ({
                ...t,
                label: t.categoryname,
                value: t.categoryname,
            }))]
            const filterAlloted = NonProduction?.data?.nonproductionunitallot?.filter((item) =>
                item?.employeename?.toLowerCase() === isUserRoleAccess?.companyname?.toLowerCase())
            const CatOpt = filterAlloted?.map((t) => ({
                ...t,
                label: t.category,
                value: t.category,
            }))
            const removeDup = CatOpt.filter((item, index, self) =>
                index === self.findIndex((t) => t.value === item.value)
            );

            if (!isUserRoleAccess.role.includes("Manager")) {
                setCatOpt(removeDup)
            } else {
                setCatOpt(CatOptall)
            }

        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };


    const getCategoryAndSubcategory = async (e) => {
        setPageName(!pageName)
        try {
            let NonProduction = await axios.get(`${SERVICE.NONPRODUCTIONUNITALLOT}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let response = await axios.get(`${SERVICE.CATEGORYANDSUBCATEGORYGETALL}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });

            // let resultall = response?.data?.categoryandsubcategory.find((d) => d.categoryname === e.categoryname);
            // const subcatealls = resultall?.subcategoryname?.map((d) => ({
            //     label: d,
            //     value: d,
            // }));

            // console.log(NonProduction?.data?.nonproductionunitallot, "NonProduction?.data?.nonproductionunitallot")
            // const filterAlloted = NonProduction?.data?.nonproductionunitallot?.filter(
            //     (item) =>
            //         item?.employeename?.toLowerCase() === isUserRoleAccess?.companyname?.toLowerCase() &&
            //         e?.some((category) => category?.value?.toLowerCase() === item?.category?.toLowerCase())
            // );

            // console.log(filterAlloted, "filterAlloted");

            // const result = e?.map((t) => ({
            //     ...t,
            //     label: t.subcategoryname,
            //     value: t.subcategoryname,
            // }))
            // const removeDup = result.filter((item, index, self) =>
            //     index === self.findIndex((t) => t.value === item.value)
            // );

            const result = e?.flatMap((t) =>
                t.subcategoryname?.map((name) => ({
                    label: name,
                    value: name,
                }))
            );

            if (!isUserRoleAccess.role.includes("Manager")) {
                setSubCatOpt(result)
            } else {
                setSubCatOpt(result)
            }
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    useEffect(() => {
        getapi()
        getCategory()
        handleFilterClick("All")
    }, [])

    useEffect(
        () => {
            const beforeUnloadHandler = (event) => handleBeforeUnload(event);
            window.addEventListener('beforeunload', beforeUnloadHandler);
            return () => {
                window.removeEventListener('beforeunload', beforeUnloadHandler);
            };
        }, []);
    const [items, setItems] = useState([]);
    const [itemssAssign, setItemsAssign] = useState([]);
    const [itemsall, setItemsall] = useState([]);

    const addSerialNumberApprove = (datas) => {
        setItemsAssign(datas);
    }
    const addSerialNumberall = (datas) => {
        setItemsall(datas);
    }

    const [overallItems, setOverallItems] = useState([]);

    const addSerialNumber = (datas) => {
        setItems(datas);
        setOverallItems(datas?.map((item, index) => ({ ...item, serialNumber: index + 1, id: item._id })));
    };

    useEffect(() => {
        addSerialNumber(taskcategorys);
    }, [taskcategorys]);

    useEffect(() => {
        addSerialNumberApprove(taskcategorysAssign);
    }, [taskcategorysAssign]);

    useEffect(() => {
        addSerialNumberall(taskcategorysall);
    }, [taskcategorysall]);

    //Datatable
    const handlePageChange = (newPage) => {
        setPage(newPage);
        setSelectedRows([]);
        setSelectAllChecked(false)
    };
    const handlePageChangeAssign = (newPage) => {
        setPageApproved(newPage);
        setSelectedRowsAssign([]);
        setSelectAllCheckedAssign(false)
    };
    const handlePageChangeall = (newPage) => {
        setPageReject(newPage);
        setSelectedRowsall([]);
        setSelectAllCheckedall(false)
    };
    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setSelectedRows([]);
        setSelectAllChecked(false)
        setPage(1);
    };
    const handlePageSizeChangeApproved = (event) => {
        setPageSizeApprove(Number(event.target.value));
        setSelectedRowsall([]);
        setSelectAllCheckedAssign(false)
        setPageApproved(1);
    };
    const handlePageSizeChangeReject = (event) => {
        setPageSizeReject(Number(event.target.value));
        setSelectedRowsall([]);
        setSelectAllCheckedall(false)
        setPageReject(1);
    };
    //datatable....
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };
    //datatable....
    const handleSearchChangeAssign = (event) => {
        setSearchQueryAssign(event.target.value);
    };
    const handleSearchChangeall = (event) => {
        setSearchQueryall(event.target.value);
    };
    // Split the search query into individual terms
    const searchTerms = searchQuery.toLowerCase().split(" ");
    const searchTermsAssign = searchQueryAssign.toLowerCase().split(" ");
    const searchTermsall = searchQueryall.toLowerCase().split(" ");
    // Modify the filtering logic to check each term
    const filteredDatas = items?.filter((item) => {
        return searchTerms.every((term) =>
            Object.values(item).join(" ").toLowerCase().includes(term)
        );
    });
    const filteredDatasAssign = itemssAssign?.filter((item) => {
        return searchTermsAssign.every((term) =>
            Object.values(item).join(" ").toLowerCase().includes(term)
        );
    });
    const filteredDatasall = itemsall?.filter((item) => {
        return searchTermsall.every((term) =>
            Object.values(item).join(" ").toLowerCase().includes(term)
        );
    });
    const filteredData = filteredDatas.slice((page - 1) * pageSize, page * pageSize);
    const filteredDataAssign = filteredDatasAssign.slice((pageApproved - 1) * pageSizeApprove, pageApproved * pageSizeApprove);
    const filteredDataall = filteredDatasall.slice((pageReject - 1) * pagesizeReject, pageReject * pagesizeReject);
    const totalPages = Math.ceil(filteredDatas.length / pageSize);
    const totalPagesApproved = Math.ceil(filteredDatasAssign.length / pageSizeApprove);
    const totalPagesReject = Math.ceil(filteredDatasall.length / pagesizeReject);
    const visiblePages = Math.min(totalPages, 3);
    const firstVisiblePage = Math.max(1, page - 1);
    const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPages);
    const pageNumbers = [];
    const indexOfLastItem = page * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
        pageNumbers.push(i);
    }
    const visiblePagesApproved = Math.min(totalPagesApproved, 3);
    const firstVisiblePageApproved = Math.max(1, pageApproved - 1);
    const lastVisiblePageApproved = Math.min(firstVisiblePageApproved + visiblePagesApproved - 1, totalPagesApproved);
    const pageNumbersApproved = [];
    const indexOfLastItemApproved = pageApproved * pageSizeApprove;
    const indexOfFirstItemApproved = indexOfLastItemApproved - pageSizeApprove;
    for (let i = firstVisiblePage; i <= lastVisiblePageApproved; i++) {
        pageNumbersApproved.push(i);
    }
    const visiblePagesReject = Math.min(totalPagesReject, 3);
    const firstVisiblePageReject = Math.max(1, pageReject - 1);
    const lastVisiblePageReject = Math.min(firstVisiblePageReject + visiblePagesReject - 1, totalPagesReject);
    const pageNumbersReject = [];
    const indexOfLastItemReject = pageReject * pagesizeReject;
    const indexOfFirstItemReject = indexOfLastItemReject - pagesizeReject;
    for (let i = firstVisiblePageReject; i <= lastVisiblePageReject; i++) {
        pageNumbersReject.push(i);
    }
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [selectAllCheckedAssign, setSelectAllCheckedAssign] = useState(false);
    const [selectAllCheckedall, setSelectAllCheckedall] = useState(false);
    const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
        <div>
            <Checkbox
                checked={selectAllChecked}
                onChange={onSelectAll}
            />
        </div>
    );
    const columnDataTable = [
        {
            field: "serialNumber", headerName: "SNo",
            flex: 0, width: 100, hide: !columnVisibility.serialNumber, headerClassName: "bold-header", pinned: 'left'
        },
        { field: "name", headerName: "Name", flex: 0, width: 100, hide: !columnVisibility.name, headerClassName: "bold-header", pinned: 'left' },
        { field: "category", headerName: "Category", flex: 0, width: 130, hide: !columnVisibility.category, headerClassName: "bold-header", pinned: 'left', },
        { field: "subcategory", headerName: "Sub Category", flex: 0, width: 130, hide: !columnVisibility.subcategory, headerClassName: "bold-header", pinned: 'left' },
        { field: "mode", headerName: "Mode", flex: 0, width: 130, hide: !columnVisibility.mode, headerClassName: "bold-header" },
        { field: "date", headerName: "Date", flex: 0, width: 130, hide: !columnVisibility.date, headerClassName: "bold-header" },
        { field: "allotdays", headerName: "Allot Min Days", flex: 0, width: 130, hide: !columnVisibility.allotdays, headerClassName: "bold-header" },
        { field: "allothours", headerName: "Allot Min Hours", flex: 0, width: 130, hide: !columnVisibility.allothours, headerClassName: "bold-header" },
        { field: "allotmins", headerName: "Allot Min Minutes", flex: 0, width: 130, hide: !columnVisibility.allotmins, headerClassName: "bold-header" },
        { field: "days", headerName: "Allot Max Days", flex: 0, width: 130, hide: !columnVisibility.days, headerClassName: "bold-header" },
        { field: "hours", headerName: "Allot Max Hours", flex: 0, width: 130, hide: !columnVisibility.hours, headerClassName: "bold-header" },
        { field: "minutes", headerName: "Allot Max Minutes", flex: 0, width: 130, hide: !columnVisibility.minutes, headerClassName: "bold-header" },
        { field: "count", headerName: "Count", flex: 0, width: 130, hide: !columnVisibility.count, headerClassName: "bold-header" },
        {
            field: "actions",
            headerName: "Action",
            flex: 0,
            width: 250,
            minHeight: '40px !important',
            sortable: false,
            hide: !columnVisibility.actions,
            headerClassName: "bold-header",
            cellRenderer: (params) => (
                <Grid sx={{ display: 'flex' }}>
                    {isUserRoleCompare?.includes("enonproductionlist") && (
                        <Button sx={userStyle.buttonedit} onClick={() => {
                            getCode(params.data.id, "approve");
                        }}>
                            Approve
                        </Button>
                    )}
                    {isUserRoleCompare?.includes("enonproductionlist") && (
                        <Button sx={userStyle.buttondelete} onClick={(e) => {
                            getCode(params.data.id, "reject");
                        }}>
                            Reject
                        </Button>
                    )}
                </Grid>
            ),
        },
    ]
    const columnDataTableAssign = [
        {
            field: "serialNumber", headerName: "SNo",
            flex: 0, width: 100, hide: !columnVisibilityAssign.serialNumber, headerClassName: "bold-header", pinned: 'left'
        },
        { field: "name", headerName: "Name", flex: 0, width: 100, hide: !columnVisibilityAssign.name, headerClassName: "bold-header", pinned: 'left' },
        { field: "category", headerName: "Category", flex: 0, width: 130, hide: !columnVisibilityAssign.category, headerClassName: "bold-header", pinned: 'left' },
        { field: "subcategory", headerName: "Sub Category", flex: 0, width: 130, hide: !columnVisibilityAssign.subcategory, headerClassName: "bold-header", pinned: 'left' },
        { field: "mode", headerName: "Mode", flex: 0, width: 130, hide: !columnVisibilityAssign.mode, headerClassName: "bold-header" },
        { field: "date", headerName: "Date", flex: 0, width: 130, hide: !columnVisibilityAssign.date, headerClassName: "bold-header" },
        { field: "allotdays", headerName: "Allot Min Days", flex: 0, width: 130, hide: !columnVisibilityAssign.allotdays, headerClassName: "bold-header" },
        { field: "allothours", headerName: "Allot Min Hours", flex: 0, width: 130, hide: !columnVisibilityAssign.allothours, headerClassName: "bold-header" },
        { field: "allotmins", headerName: "Allot Min Minutes", flex: 0, width: 130, hide: !columnVisibilityAssign.allotmins, headerClassName: "bold-header" },
        { field: "days", headerName: "Allot Max Days", flex: 0, width: 130, hide: !columnVisibilityAssign.days, headerClassName: "bold-header" },
        { field: "hours", headerName: "Allot Max Hours", flex: 0, width: 130, hide: !columnVisibilityAssign.hours, headerClassName: "bold-header" },
        { field: "minutes", headerName: "Allot Max Minutes", flex: 0, width: 130, hide: !columnVisibilityAssign.minutes, headerClassName: "bold-header" },
        { field: "count", headerName: "Count", flex: 0, width: 130, hide: !columnVisibilityAssign.count, headerClassName: "bold-header" },
    ]
    const columnDataTableall = [
        {
            field: "serialNumber", headerName: "SNo",
            flex: 0, width: 100, hide: !columnVisibilityall.serialNumber, headerClassName: "bold-header", pinned: 'left'
        },
        { field: "name", headerName: "Name", flex: 0, width: 100, hide: !columnVisibilityall.name, headerClassName: "bold-header", pinned: 'left' },
        { field: "category", headerName: "Category", flex: 0, width: 130, hide: !columnVisibilityall.category, headerClassName: "bold-header", pinned: 'left' },
        { field: "subcategory", headerName: "Sub Category", flex: 0, width: 130, hide: !columnVisibilityall.subcategory, headerClassName: "bold-header", pinned: 'left' },
        { field: "mode", headerName: "Mode", flex: 0, width: 130, hide: !columnVisibilityall.mode, headerClassName: "bold-header" },
        { field: "date", headerName: "Date", flex: 0, width: 130, hide: !columnVisibilityall.date, headerClassName: "bold-header" },
        { field: "allotdays", headerName: "Allot Min Days", flex: 0, width: 130, hide: !columnVisibilityall.allotdays, headerClassName: "bold-header" },
        { field: "allothours", headerName: "Allot Min Hours", flex: 0, width: 130, hide: !columnVisibilityall.allothours, headerClassName: "bold-header" },
        { field: "allotmins", headerName: "Allot Min Minutes", flex: 0, width: 130, hide: !columnVisibilityall.allotmins, headerClassName: "bold-header" },
        { field: "days", headerName: "Allot Max Days", flex: 0, width: 130, hide: !columnVisibilityall.days, headerClassName: "bold-header" },
        { field: "hours", headerName: "Allot Max Hours", flex: 0, width: 130, hide: !columnVisibilityall.hours, headerClassName: "bold-header" },
        { field: "minutes", headerName: "Allot Max Minutes", flex: 0, width: 130, hide: !columnVisibilityall.minutes, headerClassName: "bold-header" },
        { field: "count", headerName: "Count", flex: 0, width: 130, hide: !columnVisibilityall.count, headerClassName: "bold-header" },
    ]
    const rowDataTable = filteredData.map((item, index) => {
        return {
            id: item._id,
            serialNumber: item.serialNumber,
            name: item.name,
            category: item.category,
            subcategory: item.subcategory,
            mode: item.mode,
            date: item.date,
            allotdays: item.alloteddays,
            allothours: item.allotedhours,
            allotmins: item.allotedminutes,
            days: item.days,
            hours: item.hours,
            minutes: item.minutes,
            count: item.count
        }
    });
    const rowDataTableAssign = filteredDataAssign.map((item, index) => {
        return {
            id: item._id,
            serialNumber: item.serialNumber,
            name: item.name,
            category: item.category,
            subcategory: item.subcategory,
            mode: item.mode,
            date: item.date,
            allotdays: item.allotdays,
            allothours: item.allothours,
            allotmins: item.allotmins,
            days: item.days,
            hours: item.hours,
            minutes: item.minutes,
            count: item.count
        }
    });
    const rowDataTableall = filteredDataall.map((item, index) => {
        return {
            id: item._id,
            serialNumber: item.serialNumber,
            name: item.name,
            category: item.category,
            subcategory: item.subcategory,
            mode: item.mode,
            date: item.date,
            allotdays: item.alloteddays,
            allothours: item.allotedhours,
            allotmins: item.allotedminutes,
            days: item.days,
            hours: item.hours,
            minutes: item.minutes,
            count: item.count
        }
    });

    const rowsWithCheckboxes = rowDataTable.map((row) => ({
        ...row,
        // Create a custom field for rendering the checkbox
        checkbox: selectedRows.includes(row.id),
    }));
    const rowsWithCheckboxesAssign = rowDataTableAssign.map((row) => ({
        ...row,
        // Create a custom field for rendering the checkbox
        checkbox: selectedRowsAssign.includes(row.id),
    }));
    const rowsWithCheckboxesall = rowDataTableall.map((row) => ({
        ...row,
        // Create a custom field for rendering the checkbox
        checkbox: selectedRowsall.includes(row.id),
    }));
    // Show All Columns functionality
    const handleShowAllColumns = () => {
        const updatedVisibility = { ...columnVisibility };
        for (const columnKey in updatedVisibility) {
            updatedVisibility[columnKey] = true;
        }
        setColumnVisibility(updatedVisibility);
    };
    const handleShowAllColumnsAssign = () => {
        const updatedVisibility = { ...columnVisibilityAssign };
        for (const columnKey in updatedVisibility) {
            updatedVisibility[columnKey] = true;
        }
        setColumnVisibilityAssign(updatedVisibility);
    };
    const handleShowAllColumnsall = () => {
        const updatedVisibility = { ...columnVisibilityall };
        for (const columnKey in updatedVisibility) {
            updatedVisibility[columnKey] = true;
        }
        setColumnVisibilityall(updatedVisibility);
    };
    // // Function to filter columns based on search query
    const filteredColumns = columnDataTable.filter((column) =>
        column.headerName.toLowerCase().includes(searchQueryManage.toLowerCase())
    );
    const filteredColumnsAssign = columnDataTableAssign.filter((column) =>
        column.headerName.toLowerCase().includes(searchQueryManageAssign.toLowerCase())
    );
    const filteredColumnsall = columnDataTableall.filter((column) =>
        column.headerName.toLowerCase().includes(searchQueryManageall.toLowerCase())
    );
    // Manage Columns functionality
    const toggleColumnVisibility = (field) => {
        setColumnVisibility((prevVisibility) => ({
            ...prevVisibility,
            [field]: !prevVisibility[field],
        }));
    };
    const toggleColumnVisibilityAssign = (field) => {
        setColumnVisibilityAssign((prevVisibility) => ({
            ...prevVisibility,
            [field]: !prevVisibility[field],
        }));
    };
    const toggleColumnVisibilityall = (field) => {
        setColumnVisibilityall((prevVisibility) => ({
            ...prevVisibility,
            [field]: !prevVisibility[field],
        }));
    };
    // JSX for the "Manage Columns" popover content
    const manageColumnsContent = (
        <Box style={{ padding: "10px", minWidth: "325px", '& .MuiDialogContent-root': { padding: '10px 0' } }} >
            <Typography variant="h6">Manage Columns</Typography>
            <IconButton
                aria-label="close"
                onClick={handleCloseManageColumns}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <Box sx={{ position: 'relative', margin: '10px' }}>
                <TextField
                    label="Find column"
                    variant="standard"
                    fullWidth
                    value={searchQueryManage}
                    onChange={(e) => setSearchQueryManage(e.target.value)}
                    sx={{ marginBottom: 5, position: 'absolute', }}
                />
            </Box><br /><br />
            <DialogContent sx={{ minWidth: 'auto', height: '200px', position: 'relative' }}>
                <List sx={{ overflow: 'auto', height: '100%', }}>
                    {filteredColumns.map((column) => (
                        <ListItem key={column.field}>
                            <ListItemText sx={{ display: 'flex' }}
                                primary={
                                    <Switch sx={{ marginTop: "-5px" }} size="small"
                                        checked={columnVisibility[column.field]}
                                        onChange={() => toggleColumnVisibility(column.field)}
                                    />
                                }
                                secondary={(column.field === "checkbox") ? "Checkbox" : column.headerName}
                            // secondary={column.headerName }
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
                            sx={{ textTransform: 'none', }}
                            onClick={() => setColumnVisibility(initialColumnVisibility)}
                        >
                            Show All
                        </Button>
                    </Grid>
                    <Grid item md={4}></Grid>
                    <Grid item md={4}>
                        <Button
                            variant="text"
                            sx={{ textTransform: 'none' }}
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
    // JSX for the "Manage Columns" popover content
    const manageColumnsContentAssign = (
        <Box style={{ padding: "10px", minWidth: "325px", '& .MuiDialogContent-root': { padding: '10px 0' } }} >
            <Typography variant="h6">Manage Columns</Typography>
            <IconButton
                aria-label="close"
                onClick={handleCloseManageColumnsAssign}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <Box sx={{ position: 'relative', margin: '10px' }}>
                <TextField
                    label="Find column"
                    variant="standard"
                    fullWidth
                    value={searchQueryManageAssign}
                    onChange={(e) => setSearchQueryManageAssign(e.target.value)}
                    sx={{ marginBottom: 5, position: 'absolute', }}
                />
            </Box><br /><br />
            <DialogContent sx={{ minWidth: 'auto', height: '200px', position: 'relative' }}>
                <List sx={{ overflow: 'auto', height: '100%', }}>
                    {filteredColumnsAssign.map((column) => (
                        <ListItem key={column.field}>
                            <ListItemText sx={{ display: 'flex' }}
                                primary={
                                    <Switch sx={{ marginTop: "-5px" }} size="small"
                                        checked={columnVisibilityAssign[column.field]}
                                        onChange={() => toggleColumnVisibilityAssign(column.field)}
                                    />
                                }
                                secondary={(column.field === "checkbox") ? "Checkbox" : column.headerName}
                            // secondary={column.headerName }
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
                            sx={{ textTransform: 'none', }}
                            onClick={() => setColumnVisibilityAssign(initialColumnVisibilityAssign)}
                        >
                            Show All
                        </Button>
                    </Grid>
                    <Grid item md={4}></Grid>
                    <Grid item md={4}>
                        <Button
                            variant="text"
                            sx={{ textTransform: 'none' }}
                            onClick={() => {
                                const newColumnVisibility = {};
                                columnDataTableAssign.forEach((column) => {
                                    newColumnVisibility[column.field] = false; // Set hide property to true
                                });
                                setColumnVisibilityAssign(newColumnVisibility);
                            }}
                        >
                            Hide All
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Box>
    );
    // JSX for the "Manage Columns" popover content
    const manageColumnsContentall = (
        <Box style={{ padding: "10px", minWidth: "325px", '& .MuiDialogContent-root': { padding: '10px 0' } }} >
            <Typography variant="h6">Manage Columns</Typography>
            <IconButton
                aria-label="close"
                onClick={handleCloseManageColumnsall}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <Box sx={{ position: 'relative', margin: '10px' }}>
                <TextField
                    label="Find column"
                    variant="standard"
                    fullWidth
                    value={searchQueryManageall}
                    onChange={(e) => setSearchQueryManageall(e.target.value)}
                    sx={{ marginBottom: 5, position: 'absolute', }}
                />
            </Box><br /><br />
            <DialogContent sx={{ minWidth: 'auto', height: '200px', position: 'relative' }}>
                <List sx={{ overflow: 'auto', height: '100%', }}>
                    {filteredColumnsall.map((column) => (
                        <ListItem key={column.field}>
                            <ListItemText sx={{ display: 'flex' }}
                                primary={
                                    <Switch sx={{ marginTop: "-5px" }} size="small"
                                        checked={columnVisibilityall[column.field]}
                                        onChange={() => toggleColumnVisibilityall(column.field)}
                                    />
                                }
                                secondary={(column.field === "checkbox") ? "Checkbox" : column.headerName}
                            // secondary={column.headerName }
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
                            sx={{ textTransform: 'none', }}
                            onClick={() => setColumnVisibilityall(initialColumnVisibilityall)}
                        >
                            Show All
                        </Button>
                    </Grid>
                    <Grid item md={4}></Grid>
                    <Grid item md={4}>
                        <Button
                            variant="text"
                            sx={{ textTransform: 'none' }}
                            onClick={() => {
                                const newColumnVisibility = {};
                                columnDataTableall.forEach((column) => {
                                    newColumnVisibility[column.field] = false; // Set hide property to true
                                });
                                setColumnVisibilityall(newColumnVisibility);
                            }}
                        >
                            Hide All
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Box>
    );
    const BaseOpt = [{ label: "All", value: "All" }, { label: "Time", value: "Time" }, { label: "Count", value: "Count" }]
    //add function 
    const [isOpenApprove, setIsOpenApprove] = useState(false);
    const handleClickOpenApprove = () => {
        setIsOpenApprove(true);
    };
    const handleCloseApprove = () => {
        setIsOpenApprove(false);
    }
    const sendApproveRequest = async (isApproved) => {
        setPageName(!pageName)
        try {
            let subprojectscreate = await axios.put(`${SERVICE.NONPRODUCTION_SINGLE}/${nonProduction._id}`, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                },
                name: String(nonProduction.name),
                category: String(nonProduction.category),
                subcategory: String(nonProduction.subcategory),
                mode: String(nonProduction.mode),
                count: String(nonProduction.count),
                date: String(nonProduction.date),
                fromtime: String(nonProduction.fromtime),
                totime: String(nonProduction.totime),
                totalhours: String(nonProduction.totalhours),
                alloteddays: String(nonProduction.alloteddays),
                allotedhours: String(nonProduction.allotedhours),
                allotedminutes: String(nonProduction.allotedhours),
                days: String(nonProduction.days),
                hours: String(nonProduction.hours),
                minutes: String(nonProduction.minutes),
                approvestatus: Boolean(isApproved),
                addedby: [
                    {
                        name: String(username),
                        date: String(new Date()),
                    },
                ],
            })
            handleCloseApprove();
            handleCloseReject();
            await handleFilterClick("All")
            if (isApproved) {
                setPopupContent("Assigned Successfully");
                setPopupSeverity("success");
                handleClickOpenPopup();
            } else {
                setPopupContent("Rejected Successfully");
                setPopupSeverity("success");
                handleClickOpenPopup();
            }
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    }
    return (
        <Box>
            <Headtitle title={'Non Production List'} />
            {/* ****** Header Content ****** */}
            <PageHeading
                title="Non Production List"
                modulename="Production"
                submodulename="Non Production"
                mainpagename="Non-production Setup"
                subpagename="Non Production List"
                subsubpagename=""
            />
            {isUserRoleCompare?.includes("anonproductionlist")
                && (
                    <>
                        <Box sx={userStyle.dialogbox}>
                            <>
                                <Grid container spacing={2}>
                                    <Grid item xs={8}>
                                        <Typography sx={userStyle.importheadtext}>Non Production Filter List</Typography>
                                    </Grid>
                                </Grid><br />
                                <Grid container spacing={2}>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>Base<b style={{ color: "red" }}>*</b></Typography>
                                            <Selects
                                                options={BaseOpt}
                                                // styles={colourStyles}
                                                value={{
                                                    label: taskcategory.base,
                                                    value: taskcategory.base,
                                                }}
                                                onChange={(e) => {
                                                    setTaskcategory({
                                                        ...taskcategory,
                                                        base: e.value,
                                                    });
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>

                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Category
                                            </Typography>
                                            <MultiSelect
                                                maxMenuHeight={300}
                                                options={catOpt}
                                                value={selectedcompanyOptionsEdit}
                                                valueRenderer={customValueRendererCompanyAdd}
                                                onChange={handleCompanyChangeAdd}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Sub Category
                                            </Typography>
                                            <MultiSelect
                                                maxMenuHeight={300}
                                                options={subCatOpt}

                                                // options={BranchOptions}
                                                value={selectedbranchOptionsEdit}
                                                valueRenderer={customValueRendererBranchAdd}
                                                onChange={handleBranchChangeAdd}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography sx={{ fontWeight: "500" }}>
                                                Days
                                            </Typography>
                                            <Selects
                                                options={daysoptions}
                                                // styles={colourStyles}
                                                value={{ label: filterUser.day, value: filterUser.day }}
                                                onChange={(e) => {
                                                    handleChangeFilterDate(e);
                                                    setFilterUser((prev) => ({ ...prev, day: e.value }))
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                {" "}
                                                From Date
                                            </Typography>
                                            <OutlinedInput
                                                id="from-date"
                                                type="date"
                                                disabled={filterUser.day !== "Custom Fields"}
                                                value={filterUser.fromdate}
                                                onChange={(e) => {
                                                    const newFromDate = e.target.value;
                                                    setFilterUser((prevState) => ({
                                                        ...prevState,
                                                        fromdate: newFromDate,
                                                        todate: prevState.todate && new Date(prevState.todate) > new Date(newFromDate) ? prevState.todate : ""
                                                    }));
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                To Date
                                            </Typography>
                                            <OutlinedInput
                                                id="to-date"
                                                type="date"
                                                value={filterUser.todate}
                                                disabled={filterUser.day !== "Custom Fields"}
                                                onChange={(e) => {
                                                    const selectedToDate = new Date(e.target.value);
                                                    const selectedFromDate = new Date(filterUser.fromdate);
                                                    const formattedDatePresent = new Date() // Assuming you have a function to format the current date
                                                    if (selectedToDate >= selectedFromDate && selectedToDate >= new Date(selectedFromDate)) {
                                                        setFilterUser({
                                                            ...filterUser,
                                                            todate: e.target.value
                                                        });
                                                    } else {
                                                        setFilterUser({
                                                            ...filterUser,
                                                            todate: "" // Reset to empty string if the condition fails
                                                        });
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12} sx={{ marginTop: "24px" }}>
                                        <Button sx={buttonStyles.buttonsubmit}
                                            onClick={() => {
                                                handleFilterClick(taskcategory.base)
                                            }}
                                        >
                                            Filter
                                        </Button>
                                        &nbsp;
                                        <Button sx={buttonStyles.buttonsubmit}
                                            onClick={handleClear}
                                        >
                                            Clear
                                        </Button>
                                    </Grid>
                                </Grid>

                            </>
                        </Box>
                    </>
                )}
            <br />
            {/* ****** Table 1 Start ****** */}
            {isUserRoleCompare?.includes("lnonproductionlist") && (
                <>
                    <Box sx={userStyle.container}>
                        { /* ******************************************************EXPORT Buttons****************************************************** */}
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>Assign List</Typography>
                        </Grid>
                        <br />
                        <Grid container spacing={2} style={userStyle.dataTablestyle}>
                            <Grid item md={2} xs={12} sm={12}>
                                <Box>
                                    <label >Show entries:</label>
                                    <Select id="pageSizeSelect" value={pageSize}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 180,
                                                    width: 80,
                                                },
                                            },
                                        }}
                                        onChange={handlePageSizeChange} sx={{ width: "77px" }}>
                                        <MenuItem value={1}>1</MenuItem>
                                        <MenuItem value={5}>5</MenuItem>
                                        <MenuItem value={10}>10</MenuItem>
                                        <MenuItem value={25}>25</MenuItem>
                                        <MenuItem value={50}>50</MenuItem>
                                        <MenuItem value={100}>100</MenuItem>
                                        <MenuItem value={taskcategorys?.length}>All</MenuItem>
                                    </Select>
                                </Box>
                            </Grid>
                            <Grid item md={8} xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Box >
                                    {isUserRoleCompare?.includes("excelnonproductionlist") && (
                                        <>
                                            <>
                                                <Button onClick={(e) => {
                                                    setIsFilterOpen(true)
                                                    setFormat("xl")
                                                }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                                            </>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("csvnonproductionlist") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen(true)
                                                setFormat("csv")
                                            }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("printnonproductionlist") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleprint}>&ensp;<FaPrint />&ensp;Print&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("pdfnonproductionlist") && (
                                        <>
                                            <Button sx={userStyle.buttongrp}
                                                onClick={() => {
                                                    setIsPdfFilterOpen(true)
                                                }}
                                            ><FaFilePdf />&ensp;Export to PDF&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("imagenonproductionlist") && (
                                        <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}> <ImageIcon sx={{ fontSize: "15px" }} />  &ensp;Image&ensp; </Button>
                                    )}
                                </Box >
                            </Grid>
                            <Grid item md={2} xs={6} sm={6}>
                                <AggregatedSearchBar
                                    columnDataTable={columnDataTable}
                                    setItems={setItems}
                                    addSerialNumber={addSerialNumber}
                                    setPage={setPage}
                                    maindatas={taskcategorys}
                                    setSearchedString={setSearchedString}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    paginated={false}
                                    totalDatas={overallItems}
                                />
                            </Grid>

                        </Grid>
                        <br />
                        <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>Show All Columns</Button>&ensp;
                        <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumns}>Manage Columns</Button>&ensp;
                        <br /><br />
                        {!taskcategoryCheck ?
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
                            :
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
                                    searchQuery={searchQuery}
                                    handleShowAllColumns={handleShowAllColumns}
                                    setFilteredRowData={setFilteredRowData}
                                    filteredRowData={filteredRowData}
                                    setFilteredChanges={setFilteredChanges}
                                    filteredChanges={filteredChanges}
                                    gridRefTableImg={gridRefTableImg}
                                    itemsList={overallItems}
                                />

                            </>}
                    </Box>
                </>
            )
            }
            <br />
            {/* ****** Table 1 Start ****** */}
            {isUserRoleCompare?.includes("lnonproductionlist") && (
                <>
                    <Box sx={userStyle.container}>
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>Approved List</Typography>
                        </Grid>
                        <br />
                        <Grid container spacing={2} style={userStyle.dataTablestyle}>
                            <Grid item md={2} xs={12} sm={12}>
                                <Box>
                                    <label >Show entries:</label>
                                    <Select id="pageSizeSelect" value={pageSizeApprove}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 180,
                                                    width: 80,
                                                },
                                            },
                                        }}
                                        onChange={handlePageSizeChangeApproved} sx={{ width: "77px" }}>
                                        <MenuItem value={1}>1</MenuItem>
                                        <MenuItem value={5}>5</MenuItem>
                                        <MenuItem value={10}>10</MenuItem>
                                        <MenuItem value={25}>25</MenuItem>
                                        <MenuItem value={50}>50</MenuItem>
                                        <MenuItem value={100}>100</MenuItem>
                                        <MenuItem value={taskcategorysAssign?.length}>All</MenuItem>
                                    </Select>
                                </Box>
                            </Grid>
                            <Grid item md={8} xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Box >
                                    {isUserRoleCompare?.includes("excelnonproductionlist") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpenone(true)
                                                setFormatone("xl")
                                            }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("csvnonproductionlist") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpenone(true)
                                                setFormatone("csv")
                                            }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("printnonproductionlist") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleprintAssign}>&ensp;<FaPrint />&ensp;Print&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("pdfnonproductionlist") && (
                                        <>
                                            <Button sx={userStyle.buttongrp}
                                                onClick={() => {
                                                    setIsPdfFilterOpenone(true)
                                                }}
                                            ><FaFilePdf />&ensp;Export to PDF&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("imagenonproductionlist") && (
                                        <Button sx={userStyle.buttongrp} onClick={handleCaptureImageAssign}> <ImageIcon sx={{ fontSize: "15px" }} />  &ensp;Image&ensp; </Button>
                                    )}
                                </Box >
                            </Grid>

                            <Grid item md={2} xs={6} sm={6}>

                                <AggregatedSearchBar
                                    columnDataTable={columnDataTableAssign}
                                    setItems={setItemsAssign}
                                    addSerialNumber={addSerialNumberApprove}
                                    setPage={setPageApproved}
                                    maindatas={taskcategorysAssign}
                                    setSearchedString={setSearchedStringApprove}
                                    searchQuery={searchQueryAssign}
                                    setSearchQuery={setSearchQueryAssign}
                                    paginated={false}
                                    totalDatas={taskcategorysAssign}
                                />
                            </Grid>
                        </Grid>
                        <br />
                        <Button sx={userStyle.buttongrp} onClick={handleShowAllColumnsAssign}>Show All Columns</Button>&ensp;
                        <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumnsAssign}>Manage Columns</Button>&ensp;
                        <br /><br />
                        {!taskcategoryCheck ?
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
                            :
                            <AggridTable
                                rowDataTable={rowDataTableAssign}
                                columnDataTable={columnDataTableAssign}
                                columnVisibility={columnVisibilityAssign}
                                page={pageApproved}
                                setPage={setPageApproved}
                                pageSize={pageSizeApprove}
                                totalPages={totalPagesApproved}
                                setColumnVisibility={setColumnVisibilityAssign}
                                isHandleChange={isHandleChangeApproved}
                                items={itemssAssign}
                                selectedRows={selectedRowsAssign}
                                setSelectedRows={setSelectedRowsAssign}
                                gridRefTable={gridRefTableAssigned}
                                paginated={false}
                                filteredDatas={filteredDatasAssign}
                                searchQuery={searchQueryAssign}
                                handleShowAllColumns={handleShowAllColumnsAssign}
                                setFilteredRowData={setFilteredRowDataAssign}
                                filteredRowData={filteredRowDataAssign}
                                setFilteredChanges={setFilteredChangesAssign}
                                filteredChanges={filteredChangesAssign}
                                gridRefTableImg={gridRefTableImgApprove}
                                itemsList={taskcategorysAssign}
                            />
                        }
                    </Box>
                </>
            )
            }
            <br />
            {/* ****** Table 2 Start ****** */}
            {isUserRoleCompare?.includes("lnonproductionlist") && (
                <>
                    <Box sx={userStyle.container}>
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>Reject List</Typography>
                        </Grid>
                        <br />
                        <Grid container spacing={2} style={userStyle.dataTablestyle}>
                            <Grid item md={2} xs={12} sm={12}>
                                <Box>
                                    <label >Show entries:</label>
                                    <Select id="pageSizeSelect" value={pagesizeReject}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 180,
                                                    width: 80,
                                                },
                                            },
                                        }}
                                        onChange={handlePageSizeChangeReject} sx={{ width: "77px" }}>
                                        <MenuItem value={1}>1</MenuItem>
                                        <MenuItem value={5}>5</MenuItem>
                                        <MenuItem value={10}>10</MenuItem>
                                        <MenuItem value={25}>25</MenuItem>
                                        <MenuItem value={50}>50</MenuItem>
                                        <MenuItem value={100}>100</MenuItem>
                                        <MenuItem value={taskcategorysall?.length}>All</MenuItem>
                                    </Select>
                                </Box>
                            </Grid>
                            <Grid item md={8} xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Box >
                                    {isUserRoleCompare?.includes("excelnonproductionlist") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpentwo(true)
                                                setFormattwo("xl")
                                            }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("csvnonproductionlist") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpentwo(true)
                                                setFormattwo("csv")
                                            }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("printnonproductionlist") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleprintall}>&ensp;<FaPrint />&ensp;Print&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("pdfnonproductionlist") && (
                                        <>
                                            <Button sx={userStyle.buttongrp}
                                                onClick={() => {
                                                    setIsPdfFilterOpentwo(true)
                                                }}
                                            ><FaFilePdf />&ensp;Export to PDF&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("imagenonproductionlist") && (
                                        <Button sx={userStyle.buttongrp} onClick={handleCaptureImageAll}> <ImageIcon sx={{ fontSize: "15px" }} />  &ensp;Image&ensp; </Button>
                                    )}
                                </Box >
                            </Grid>
                            <Grid item md={2} xs={6} sm={6}>
                                <AggregatedSearchBar
                                    columnDataTable={columnDataTableall}
                                    setItems={setItemsall}
                                    addSerialNumber={addSerialNumberall}
                                    setPage={setPageall}
                                    maindatas={taskcategorysall}
                                    setSearchedString={setSearchedStringReject}
                                    searchQuery={searchQueryall}
                                    setSearchQuery={setSearchQueryall}
                                    paginated={false}
                                    totalDatas={taskcategorysall}
                                />
                            </Grid>
                        </Grid>
                        <br />
                        <Button sx={userStyle.buttongrp} onClick={handleShowAllColumnsall}>Show All Columns</Button>&ensp;
                        <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumnsall}>Manage Columns</Button>&ensp;
                        <br /><br />
                        {!taskcategoryCheck ?
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
                            :
                            <>
                                <AggridTable
                                    rowDataTable={rowDataTableall}
                                    columnDataTable={columnDataTableall}
                                    columnVisibility={columnVisibilityall}
                                    page={pageReject}
                                    setPage={setPageReject}
                                    pageSize={pagesizeReject}
                                    totalPages={totalPagesReject}
                                    setColumnVisibility={setColumnVisibilityall}
                                    isHandleChange={isHandleChangeReject}
                                    items={itemsall}
                                    selectedRows={selectedRowsall}
                                    setSelectedRows={setSelectedRows}
                                    gridRefTable={gridRefTableReject}
                                    paginated={false}
                                    filteredDatas={filteredDatasall}
                                    searchQuery={searchQueryall}
                                    handleShowAllColumns={handleShowAllColumnsall}
                                    setFilteredRowData={setFilteredRowDataReject}
                                    filteredRowData={filteredRowDataReject}
                                    setFilteredChanges={setFilteredChangesReject}
                                    filteredChanges={filteredChangesReject}
                                    gridRefTableImg={gridRefTableImgReject}
                                    itemsList={taskcategorysall}
                                />
                            </>}
                    </Box>
                </>
            )
            }
            {/* Manage Column */}
            <Popover
                id={id}
                open={isManageColumnsOpen}
                anchorEl={anchorEl}
                onClose={handleCloseManageColumns}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                {manageColumnsContent}
            </Popover>
            {/* Manage Column */}
            <Popover
                id={id}
                open={isManageColumnsOpenAssign}
                anchorEl={anchorElAssign}
                onClose={handleCloseManageColumnsAssign}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                {manageColumnsContentAssign}
            </Popover>
            {/* Manage Column */}
            <Popover
                id={id}
                open={isManageColumnsOpenall}
                anchorEl={anchorElall}
                onClose={handleCloseManageColumnsall}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                {manageColumnsContentall}
            </Popover>
            {/* Reject DIALOG */}
            <Box sx={{ width: "350px" }}>
                <Dialog
                    open={isOpenReject}
                    onClose={handleCloseReject}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
                        {/* <ErrorOutlineOutlinedIcon sx={{ fontSize: "80px", color: 'orange' }} /> */}
                        <Typography variant="h6" >{showAlert}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button sx={buttonStyles.buttonsubmit} onClick={() => {
                            sendApproveRequest(false)
                        }}>ok</Button>
                        &nbsp;
                        <Button sx={buttonStyles.btncancel} onClick={() => {
                            handleCloseReject()
                        }}>Cancel</Button>
                    </DialogActions>
                </Dialog>
            </Box>
            {/* Approve DIALOG */}
            <Box sx={{ width: "350px" }}>
                <Dialog
                    open={isOpenApprove}
                    onClose={handleCloseApprove}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
                        {/* <ErrorOutlineOutlinedIcon sx={{ fontSize: "80px", color: 'orange' }} /> */}
                        <Typography variant="h6" >{showAlert}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button sx={buttonStyles.buttonsubmit} onClick={() => {
                            sendApproveRequest(true)
                        }}>ok</Button>
                        &nbsp;
                        <Button sx={buttonStyles.btncancel} onClick={() => {
                            handleCloseApprove()
                        }}>Cancel</Button>
                    </DialogActions>


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
                    <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
                        {/* <ErrorOutlineOutlinedIcon sx={{ fontSize: "80px", color: 'orange' }} /> */}
                        <Typography variant="h6" >{showAlert}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" color="error" onClick={handleCloseerr}>ok</Button>
                    </DialogActions>
                </Dialog>
            </Box>
            <ExportData
                isFilterOpen={isFilterOpen}
                handleCloseFilterMod={handleCloseFilterMod}
                fileFormat={fileFormat}
                setIsFilterOpen={setIsFilterOpen}
                isPdfFilterOpen={isPdfFilterOpen}
                setIsPdfFilterOpen={setIsPdfFilterOpen}
                handleClosePdfFilterMod={handleClosePdfFilterMod}
                filteredDataTwo={(filteredChanges !== null ? filteredRowData : filteredData) ?? []}
                itemsTwo={taskcategorys ?? []}
                filename={"Assign List"}
                exportColumnNames={exportColumnNames}
                exportRowValues={exportRowValues}
                componentRef={componentRef}
            />
            <AlertDialog
                openPopup={openPopup}
                handleClosePopup={handleClosePopup}
                popupContent={popupContent}
                popupSeverity={popupSeverity}
            />
            {/* EXTERNAL COMPONENTS -------------- END */}
            {/* PRINT PDF EXCEL CSV */}
            <ExportData
                isFilterOpen={isFilterOpenone}
                handleCloseFilterMod={handleCloseFilterModone}
                fileFormat={fileFormatone}
                setIsFilterOpen={setIsFilterOpenone}
                isPdfFilterOpen={isPdfFilterOpenone}
                setIsPdfFilterOpen={setIsPdfFilterOpenone}
                handleClosePdfFilterMod={handleClosePdfFilterModone}
                // filteredDataTwo={filteredDataAssign ?? []}
                filteredDataTwo={(filteredChangesAssign !== null ? filteredRowDataAssign : filteredDataAssign) ?? []}

                itemsTwo={taskcategorysAssign ?? []}
                filename={"Approved List"}
                exportColumnNames={exportColumnNamesone}
                exportRowValues={exportRowValuesone}
                componentRef={componentRefAssign}
            />
            <ExportData
                isFilterOpen={isFilterOpentwo}
                handleCloseFilterMod={handleCloseFilterModtwo}
                fileFormat={fileFormattwo}
                setIsFilterOpen={setIsFilterOpentwo}
                isPdfFilterOpen={isPdfFilterOpentwo}
                setIsPdfFilterOpen={setIsPdfFilterOpentwo}
                handleClosePdfFilterMod={handleClosePdfFilterModtwo}
                filteredDataTwo={(filteredChangesReject !== null ? filteredRowDataReject : rowDataTableall) ?? []}

                // filteredDataTwo={rowDataTableall ?? []}
                itemsTwo={taskcategorysall ?? []}
                filename={"Reject List"}
                exportColumnNames={exportColumnNamestwo}
                exportRowValues={exportRowValuestwo}
                componentRef={componentRefall}
            />
            <MessageAlert
                openPopup={openPopupMalert}
                handleClosePopup={handleClosePopupMalert}
                popupContent={popupContentMalert}
                popupSeverity={popupSeverityMalert}
            />
        </Box>
    );
}
export default NonproductionList;