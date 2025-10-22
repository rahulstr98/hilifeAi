import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import Selects from "react-select";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ErrorIcon from "@mui/icons-material/Error";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ImageIcon from "@mui/icons-material/Image";
import InfoIcon from "@mui/icons-material/Info";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SchoolIcon from "@mui/icons-material/School";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import WarningIcon from "@mui/icons-material/Warning";
import WorkIcon from "@mui/icons-material/Work";
import LoadingButton from "@mui/lab/LoadingButton";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { AiOutlineClose } from "react-icons/ai";
import {
    OutlinedInput,
    Backdrop,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    FormControl,
    TextareaAutosize,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Popover,
    Select,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Switch from "@mui/material/Switch";
import axios from "axios";
import domtoimage from 'dom-to-image';
import { saveAs } from "file-saver";
import "jspdf-autotable";
import moment from "moment-timezone";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
    FaFileCsv,
    FaFileExcel,
    FaFilePdf,
    FaPlus,
    FaPrint,
} from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import {
    NotificationContainer,
    NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import AggregatedSearchBar from "../../components/AggregatedSearchBar";
import AggridTable from "../../components/AggridTable";
import AlertDialog from "../../components/Alert";
import {
    DeleteConfirmation, PleaseSelectRow,
} from "../../components/DeleteConfirmation.js";
import { handleApiError } from "../../components/Errorhandling";
import ExportData from "../../components/ExportData";
import Headtitle from "../../components/Headtitle";
import InfoPopup from "../../components/InfoPopup.js";
import MessageAlert from "../../components/MessageAlert";
import PageHeading from "../../components/PageHeading";
import {
    AuthContext,
    UserRoleAccessContext,
} from "../../context/Appcontext";
import { userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";
import { MultiSelect } from "react-multi-select-component";
import {
    candidatestatusOption,
    workmodeOption,
} from "../../components/Componentkeyword";



function InterviewVerification() {

    const [isLoading, setIsLoading] = useState(false);

    const [interviewCategories, setInterviewCategories] = useState([])
    const getCategory = async () => {
        setPageName(!pageName);
        try {
            let response = await axios.get(`${SERVICE.CATEGORYINTERVIEW}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let questions = response.data.interviewcategory?.filter(
                (item) => item?.mode === "Verification/Administrative"
            );

            setInterviewCategories(questions?.length > 0 ? questions : [])
        } catch (err) {
            handleApiError(
                err,
                setPopupContentMalert,
                setPopupSeverityMalert,
                handleClickOpenPopupMalert
            );
        }
    };


    useEffect(() => {
        getCategory();
    }, []);

    let optionsArray = [
        { status: "Eligible", options: "Yes" },
        { status: "Not-Eligible", options: "No" },
    ]

    const [filteredRowData, setFilteredRowData] = useState([]);
    const [filteredChanges, setFilteredChanges] = useState(null);
    const gridRefTableImg = useRef(null);

    const [openPopupMalert, setOpenPopupMalert] = useState(false);
    const [popupContentMalert, setPopupContentMalert] = useState("");
    const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
    const handleClickOpenPopupMalert = () => {
        setOpenPopupMalert(true);
        setIsLoading(false);
        setFilterLoader(false);
    };
    const handleClosePopupMalert = () => {
        setOpenPopupMalert(false);
        setIsLoading(false);
    };
    const [openPopup, setOpenPopup] = useState(false);
    const [popupContent, setPopupContent] = useState("");
    const [popupSeverity, setPopupSeverity] = useState("");
    const handleClickOpenPopup = () => {
        setOpenPopup(true);
        setIsLoading(false);
    };
    const handleClosePopup = () => {
        setOpenPopup(false);
        setIsLoading(false);
    };
    const navigate = useNavigate();

    let exportColumnNames = [
        "Mode",
        "Category",
        "Sub Category",
        "Question",
        "Candidate Status",
        "Work Mode",
    ];
    let exportRowValues = [
        "mode",
        "category",
        "subcategory",
        "question",
        "candidatestatusexp",
        "workmode",
    ];

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteData, setDeleteData] = useState({});
    //Delete model
    const handleClickOpenDelete = () => {
        setIsDeleteOpen(true);
    };
    const handleClickCloseDelete = () => {
        setIsDeleteOpen(false);
    };





    //Edit model...
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editDetails, setEditDetails] = useState({});
    const handleClickOpenEdit = () => {
        setIsEditOpen(true);
    };
    const handleCloseModEdit = (e, reason) => {
        if (reason && reason === "backdropClick") return;
        setIsEditOpen(false);
    };

    const deleteFunction = async () => {
        setPageName(!pageName);
        try {
            setIsLoading(true);
            let overallcheck = await axios.post(
                `${SERVICE.INTERVIEWVERIFICATION_OVERALLDELETE}`,
                {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                    category: deleteData?.category,
                    subcategory: deleteData?.subcategory,
                    question: deleteData?.question,
                    mode: "Verification/Administrative",
                }
            );
            if (overallcheck?.data?.mayidelete) {
                await axios.delete(`${SERVICE.SINGLE_INTERVIEW_VERIFICATION}/${deleteData?.id}`, {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                });
                setSelectedRows([]);
                setPage(1);
                setFilteredChanges(null)
                setFilteredRowData([]);

                await fetchReturnData();
                setPopupContent("Deleted Successfully");
                setPopupSeverity("success");
                handleClickOpenPopup();
            }
            handleClickCloseDelete();
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            handleClickCloseDelete();
            handleApiError(
                err,
                setPopupContentMalert,
                setPopupSeverityMalert,
                handleClickOpenPopupMalert
            );
        }
    };


    const overallBulkdelete = async (ids) => {
        setPageName(!pageName);
        try {
            let overallcheck = await axios.post(
                `${SERVICE.INTERVIEWVERIFICATION_OVERALLBULKDELETE}`,
                {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                    id: ids,
                }
            );

            setSelectedRows(overallcheck?.data?.result);
            setIsDeleteOpencheckbox(true);
        } catch (err) {
            handleApiError(
                err,
                setPopupContentMalert,
                setPopupSeverityMalert,
                handleClickOpenPopupMalert
            );
        }
    };

    const [isDeleteOpenalert, setIsDeleteOpenalert] = useState(false);
    const [isDeleteOpencheckbox, setIsDeleteOpencheckbox] = useState(false);
    const handleClickOpenalert = () => {
        setIsHandleChange(true);
        if (selectedRows.length === 0) {
            setIsDeleteOpenalert(true);
        } else {

            overallBulkdelete(selectedRows);
        }
    };
    const handleCloseModalert = () => {
        setIsDeleteOpenalert(false);
    };


    const handleClickOpencheckbox = () => {
        setIsDeleteOpencheckbox(true);
    };
    const handleCloseModcheckbox = () => {
        setIsDeleteOpencheckbox(false);
    };
    const bulkdeleteFunction = async () => {
        setPageName(!pageName);
        try {
            setIsLoading(true);


            const deletePromises = selectedRows?.map((item) => {
                return axios.delete(`${SERVICE.SINGLE_INTERVIEW_VERIFICATION}/${item}`, {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                });
            });
            await Promise.all(deletePromises);


            setIsHandleChange(false);
            handleCloseModcheckbox();
            setSelectedRows([]);
            setSelectAllChecked(false);
            setPage(1);
            setFilteredChanges(null)
            setFilteredRowData([]);

            await fetchReturnData();
            setPopupContent("Deleted Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            handleClickCloseDelete();
            handleApiError(
                err,
                setPopupContentMalert,
                setPopupSeverityMalert,
                handleClickOpenPopupMalert
            );
        }
    };

    // view model
    const [openview, setOpenview] = useState(false);
    const [viewDetails, setViewDetails] = useState({});
    const [infoDetails, setInfoDetails] = useState({});

    const handleClickOpenview = () => {
        setOpenview(true);
    };

    const handleCloseview = () => {
        setOpenview(false);
    };
    const [openInfo, setOpeninfo] = useState(false);
    const handleClickOpeninfo = () => {
        setOpeninfo(true);
    };
    const handleCloseinfo = () => {
        setOpeninfo(false);
    };

    const getview = async (e) => {
        try {

            handleClickOpenview();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const getCode = async (e) => {
        try {

            let res = await axios.get(`${SERVICE.SINGLE_INTERVIEW_VERIFICATION}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            let response = res?.data?.singleInterviewVerification
            setOptionstodoEdit(response?.optionsArray?.length ? response?.optionsArray : optionsArray)
            setEditDetails({
                _id: response?._id,
                mode: response?.mode,
                category: response?.category,
                subcategory: response?.subcategory,
                question: response?.question,
                oldcategory: response?.category,
                oldsubcategory: response?.subcategory,
                oldquestion: response?.question,
                updatedby: response?.updatedby?.length > 0 ? response?.updatedby : [],
                candidatestatusexp: response?.candidatestatusexp?.length > 0 ? response?.candidatestatusexp?.map(data => ({
                    label: data,
                    value: data,
                })) : [],
                workmode: response?.workmode?.length > 0 ? response?.workmode?.map(data => ({
                    label: data,
                    value: data,
                })) : [],
            });
            handleClickOpenEdit();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const [transferDetails, setTransferDetails] = useState({
        assetmaterial: "",
        assetmaterialcode: "",
        transferdate: moment().format("YYYY-MM-DD"),
        transfertime: moment().format("HH:mm"),
        company: "",
        branch: [],
        unit: [],
        team: [],
        employee: "",
        assetcompany: "",
        assetbranch: "",
        assetunit: "",
        assetfloor: "",
        assetarea: "",
        assetlocation: "",
    })




    const [employees, setEmployees] = useState([]);
    const [isManualUser, setIsManualUser] = useState([]);
    const [selectedUserType, setSelectedUserType] = useState("Employee");
    const [searchQuery, setSearchQuery] = useState("");
    const {
        isUserRoleAccess,
        isUserRoleCompare,
        isAssignBranch,
        allUnit,
        allTeam,
        allCompany,
        allBranchs,
        pageName,
        setPageName,
        buttonStyles,
        allUsersData,
        alldesignation
    } = useContext(UserRoleAccessContext);

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
                    data?.subsubpagenameurl?.length !== 0
                ) {
                    fetfinalurl = data.subsubpagenameurl;
                } else if (
                    data?.modulenameurl?.length !== 0 &&
                    data?.submodulenameurl?.length !== 0 &&
                    data?.mainpagenameurl?.length !== 0 &&
                    data?.subpagenameurl?.length !== 0
                ) {
                    fetfinalurl = data.subpagenameurl;
                } else if (
                    data?.modulenameurl?.length !== 0 &&
                    data?.submodulenameurl?.length !== 0 &&
                    data?.mainpagenameurl?.length !== 0
                ) {
                    fetfinalurl = data.mainpagenameurl;
                } else if (
                    data?.modulenameurl?.length !== 0 &&
                    data?.submodulenameurl?.length !== 0
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

    useEffect(() => {
        getapi();
    }, []);

    const getapi = async () => {
        let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
            headers: {
                Authorization: `Bearer ${auth.APIToken}`,
            },
            empcode: String(isUserRoleAccess?.empcode),
            companyname: String(isUserRoleAccess?.companyname),
            pagename: String("Interview Verification Master"),
            commonid: String(isUserRoleAccess?._id),
            date: String(new Date()),

            addedby: [
                {
                    name: String(isUserRoleAccess?.companyname),
                    date: String(new Date()),
                },
            ],
        });
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
    //Datatable
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { auth, setAuth } = useContext(AuthContext);
    const [isBtnFilter, setisBtnFilter] = useState(false);

    const [loader, setLoader] = useState(false);
    const [selectedOptionsCate, setSelectedOptionsCate] = useState([]);
    let [valueCate, setValueCate] = useState([]);

    let username = isUserRoleAccess.username;

    const gridRef = useRef(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchQueryManage, setSearchQueryManage] = useState("");



    const handleCaptureImage = () => {
        if (gridRefTableImg.current) {
            domtoimage.toBlob(gridRefTableImg.current)
                .then((blob) => {
                    saveAs(blob, "InterviewVerificationMaster.png");
                })
                .catch((error) => {
                    console.error("dom-to-image error: ", error);
                });
        }
    };

    const handleSelectionChange = (newSelection) => {
        setSelectedRows(newSelection.selectionModel);
    };

    const [checked, setChecked] = useState(false);

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

    // Copied fields Name
    const handleCopy = (message) => {
        NotificationManager.success(`${message} 👍`, "", 2000);
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    const getRowClassName = (params) => {
        if (selectedRows.includes(params.row.id)) {
            return "custom-id-row"; // This is the custom class for rows with item.tat === 'ago'
        }
        return ""; // Return an empty string for other rows
    };

    // Function to render the status with icons and buttons
    const renderAccountStatus = (status) => {
        const iconProps = {
            size: "small",
            style: { marginRight: 4 },
        };

        let icon = <InfoIcon {...iconProps} />;
        let color = "#ccc"; // Default gray

        switch (status) {
            case "linked":
                icon = <CheckCircleIcon {...iconProps} />;
                color = "#4caf50"; // Green
                break;
            case "notlinked":
                icon = <ErrorIcon {...iconProps} />;
                color = "#ff9800"; // Orange
                break;
            case "mismatched":
                icon = <WarningIcon {...iconProps} />;
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
    const renderStatusIcon = (status) => {
        const iconProps = {
            size: "small",
            style: { marginRight: 4 },
        };

        let icon = <InfoIcon {...iconProps} />;
        let color = "#ccc"; // Default gray

        switch (status.toLowerCase()) {
            case "online":
                icon = <CheckCircleIcon {...iconProps} />;
                color = "#4caf50"; // Green
                break;
            case "offline":
                icon = <DoNotDisturbIcon {...iconProps} />;
                color = "#9e9e9e"; // Gray
                break;
            case "away":
                icon = <HourglassEmptyIcon {...iconProps} />;
                color = "#ff9800"; // Orange
                break;
            case "busy":
                icon = <ErrorIcon {...iconProps} />;
                color = "#f44336"; // Red
                break;
            default: // Custom or undefined status
                icon = <HelpOutlineIcon {...iconProps} />;
                color = "#00acc1"; // Cyan for custom status
        }

        return (
            <div style={{ display: "flex", alignItems: "center" }}>
                <div
                    style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: color,
                        marginRight: 4,
                    }}
                ></div>
                {status}
            </div>
        );
    };
    const renderWho = (who) => {
        if (!who) return null;
        const iconProps = {
            size: "small",
            style: { marginRight: 4 },
        };

        let icon = <InfoIcon {...iconProps} />;
        let color = "#ccc"; // Default color

        switch (who) {
            case "Employee":
                icon = <WorkIcon {...iconProps} />;
                color = "#1976d2"; // Blue
                break;
            case "Internship":
                icon = <SchoolIcon {...iconProps} />;
                color = "#4caf50"; // Green
                break;
            default:
                icon = <InfoIcon {...iconProps} />;
                color = "#ccc"; // Default gray
        }

        return (
            <Tooltip title={who} arrow>
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
                        {who}
                    </Typography>
                </Button>
            </Tooltip>
        );
    };
    const renderRegistrationStatus = (status) => {
        if (!status) return null;
        const iconProps = {
            size: "small",
            style: { marginRight: 4 },
        };

        let icon = <InfoIcon {...iconProps} />;
        let color = "#ccc"; // Default color

        switch (status) {
            case "Active":
                icon = <CheckCircleIcon {...iconProps} />; // Icon for "Active"
                color = "#4caf50"; // Green
                break;
            case "Pending":
                icon = <HourglassEmptyIcon {...iconProps} />; // Icon for "Pending"
                color = "#ff9800"; // Orange
                break;
            case "Deactivated":
                icon = <BlockIcon {...iconProps} />; // Icon for "Deactivated"
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

    // Show All Columns & Manage Columns
    const initialColumnVisibility = {
        serialNumber: true,
        checkbox: true,
        actions: true,
        mode: true,
        category: true,
        subcategory: true,
        question: true,
        candidatestatusexp: true,
        workmode: true,

    };

    const [columnVisibility, setColumnVisibility] = useState(
        initialColumnVisibility
    );

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

    // page refersh reload
    const handleCloseFilterMod = () => {
        setIsFilterOpen(false);
    };
    const handleClosePdfFilterMod = () => {
        setIsPdfFilterOpen(false);
    };

    const [fileFormat, setFormat] = useState("");

    //print...
    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "Interview Verification Master",
        pageStyle: "print",
    });

    //table entries ..,.
    const [items, setItems] = useState([]);

    const addSerialNumber = (data) => {

        setItems(data);
    };

    useEffect(() => {
        addSerialNumber(employees);
    }, [employees]);

    const [searchedString, setSearchedString] = useState("");
    const [isHandleChange, setIsHandleChange] = useState(false);
    const gridRefTable = useRef(null);

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

    const filteredData = filteredDatas?.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    const totalPages = Math.ceil(filteredDatas?.length / pageSize);

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

    const [selectAllChecked, setSelectAllChecked] = useState(false);



    const columnDataTable = [
        {
            field: "checkbox",
            headerName: "Checkbox", // Default header name
            headerStyle: {
                fontWeight: "bold", // Apply the font-weight style to make the header text bold
                // Add any other CSS styles as needed
            },

            sortable: false, // Optionally, you can make this column not sortable
            width: 50,
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
            width: 75,
            hide: !columnVisibility.serialNumber,
            headerClassName: "bold-header",
            pinned: "left",
            lockPinned: true,
        },


        {
            field: "mode",
            headerName: "Mode",
            flex: 0,
            width: 200,
            hide: !columnVisibility.mode,
            headerClassName: "bold-header",
        },

        {
            field: "category",
            headerName: "Category",
            flex: 0,
            width: 200,
            hide: !columnVisibility.category,
            headerClassName: "bold-header",
        },
        {
            field: "subcategory",
            headerName: "Sub Category",
            flex: 0,
            width: 250,
            hide: !columnVisibility.subcategory,
            headerClassName: "bold-header",
        },
        {
            field: "candidatestatusexp",
            headerName: "Candidate Status",
            flex: 0,
            width: 150,
            hide: !columnVisibility.candidatestatusexp,
            headerClassName: "bold-header",
        },
        {
            field: "workmode",
            headerName: "Work Mode",
            flex: 0,
            width: 100,
            hide: !columnVisibility.workmode,
            headerClassName: "bold-header",
        },
        {
            field: "question",
            headerName: "Question",
            flex: 0,
            width: 350,
            hide: !columnVisibility.question,
            headerClassName: "bold-header",
        },
        {
            field: "actions",
            headerName: "Action",
            flex: 0,
            width: 250,
            minHeight: "40px !important",
            sortable: false,
            hide: !columnVisibility.actions,
            cellStyle: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            },

            cellRenderer: (params) => (
                <Grid sx={{ display: "flex" }}>
                    {isUserRoleCompare?.includes("einterviewverificationmaster") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getCode(params?.data?.id)
                            }}
                        >
                            <EditOutlinedIcon sx={buttonStyles.buttonedit} />
                        </Button>
                    )}
                    {isUserRoleCompare?.includes("dinterviewverificationmaster") && (
                        <Button
                            sx={userStyle.buttondelete}
                            onClick={(e) => {
                                //   rowData(params.data.id, params.data.name);
                                handleClickOpenDelete();
                                setDeleteData(params.data);
                            }}
                        >
                            <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />
                        </Button>
                    )}
                    {isUserRoleCompare?.includes("vinterviewverificationmaster") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {

                                setViewDetails(params?.data);
                                setOptionstodoEdit(params?.data?.optionsArray?.length ? params?.data?.optionsArray : optionsArray)
                                handleClickOpenview();
                            }}
                        >
                            <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />
                        </Button>
                    )}
                    {isUserRoleCompare?.includes("iinterviewverificationmaster") && (
                        <Button
                            size="small"
                            sx={userStyle.actionbutton}
                            onClick={() => {
                                setInfoDetails(params?.data);
                                handleClickOpeninfo();
                            }}
                        >
                            <InfoOutlinedIcon sx={buttonStyles.buttoninfo} />
                        </Button>
                    )}


                </Grid>
            ),
        },
    ];

    const rowDataTable = filteredData?.map((item, index) => {
        return {

            serialNumber: item?.serialNumber,
            id: item?.id,
            mode: item?.mode,
            category: item?.category,
            subcategory: item?.subcategory,
            question: item?.question,
            addedby: item?.addedby,
            updatedby: item?.updatedby,
            optionsArray: item?.optionsArray,
            candidatestatusexp: item?.candidatestatusexp,
            workmode: item?.workmode,
        };
    });
    const rowsWithCheckboxes = rowDataTable?.map((row) => ({
        ...row,
        // Create a custom field for rendering the checkbox
        checkbox: selectedRows.includes(row.id),
    }));

    // Show All Columns functionality
    const handleShowAllColumns = () => {
        setColumnVisibility(initialColumnVisibility);
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
                    {filteredColumns?.map((column) => (
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

    //add function

    //overall edit popup
    const [openOverAllEditPopup, setOpenOverAllEditPopup] = useState(false);
    const handleOpenOverallEditPopup = () => {
        setOpenOverAllEditPopup(true);
    };
    const handleCloseOverallEditPopup = () => {
        setOpenOverAllEditPopup(false);
    };


    const editSubmit = (e) => {
        e.preventDefault();

        const isNameMatch = employees?.filter((item) => item?.id !== editDetails?._id)?.some(
            (item) =>
                item.mode === editDetails?.mode &&
                item.category === editDetails.category &&
                item.subcategory === editDetails.subcategory &&
                item.question?.trim()?.toLowerCase() === editDetails.question?.trim()?.toLowerCase()
        );
        if (isNameMatch) {
            setPopupContentMalert("Data Already Exist!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (
            editDetails?.category === "" || !editDetails?.category
        ) {
            setPopupContentMalert("Please Select Category!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (
            editDetails?.subcategory === "" || !editDetails?.subcategory
        ) {
            setPopupContentMalert("Please Select Sub Category!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (
            editDetails?.question?.trim() === "" || !editDetails?.question
        ) {
            setPopupContentMalert("Please Enter Verification Question!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (
            editDetails?.candidatestatusexp?.length === 0) {
            setPopupContentMalert("Please Select Candidate Status!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (
            editDetails?.workmode?.length === 0) {
            setPopupContentMalert("Please Select Work Mode!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (
            optionstodoEdit?.some(item => item?.options === "")
        ) {
            setPopupContentMalert("Please Enter All Options!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (
            optionstodoEdit?.some((item, index, array) => array?.find((data, ind) => data?.options?.toLowerCase() === item?.options?.toLowerCase() && index !== ind))
        ) {
            setPopupContentMalert("Duplicate Options!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else {
            handleOpenOverallEditPopup();
            // sendEditRequest();
            handleCloseModEdit();
        }
    };


    const sendRequest = async () => {
        setPageName(!pageName);
        try {
            let singleUser = allUsersData?.find(item => item?.companyname === filterState?.employee)
            setIsLoading(true);

            let res = await axios.post(
                `${SERVICE.CREATE_INTERVIEW_VERIFICATION}`,
                {
                    mode: filterState?.mode || "Verification/Administrative",
                    category: filterState?.category || "",
                    subcategory: filterState?.subcategory || "",
                    question: filterState?.question?.trim() || "",
                    optionsArray: optionstodo,
                    candidatestatusexp: filterState?.candidatestatusexp?.length ? filterState?.candidatestatusexp?.map(data => data?.value) : [],
                    workmode: filterState?.workmode?.length ? filterState?.workmode?.map(data => data?.value) : [],
                    addedby: [
                        {
                            name: String(isUserRoleAccess?.companyname),
                            date: String(new Date()),
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                }
            );
            setFilteredChanges(null)
            setFilteredRowData([])

            await fetchReturnData();
            handleCloseModEdit();
            setPopupContent("Added Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
            setIsLoading(false);

            setFilterState((prev) => ({
                ...prev,
                // mode: "Verification/Administrative",
                // category: "",
                // subcategory: "",
                question: "",
            }))
            setFilterLoader(false);
        } catch (err) {
            setFilterLoader(false);
            setIsLoading(false);
            console.log("Error Response:", err.response);
            let error = err.response?.data?.message;
            if (error) {
                setPopupContentMalert(error);
                setPopupSeverityMalert("error");
                handleClickOpenPopupMalert();
            } else {
                handleApiError(
                    err,
                    setPopupContentMalert,
                    setPopupSeverityMalert,
                    handleClickOpenPopupMalert
                );
            }
        }
    };
    const sendEditRequest = async () => {
        setPageName(!pageName);
        try {
            setIsLoading(true);
            let res = await axios.put(
                `${SERVICE.SINGLE_INTERVIEW_VERIFICATION}/${editDetails?._id}`,
                {
                    mode: editDetails?.mode || "Verification/Administrative",
                    category: editDetails?.category || "",
                    subcategory: editDetails?.subcategory || "",
                    question: editDetails?.question?.trim() || "",
                    optionsArray: optionstodoEdit,
                    candidatestatusexp: editDetails?.candidatestatusexp?.length ? editDetails?.candidatestatusexp?.map(data => data?.value) : [],
                    workmode: editDetails?.workmode?.length ? editDetails?.workmode?.map(data => data?.value) : [],
                    updatedby: [
                        ...editDetails?.updatedby,
                        {
                            name: String(isUserRoleAccess.companyname),
                            date: String(new Date()),
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                }
            );

            await axios.put(`${SERVICE.INTERVIEWVERIFICATION_OVERALLEDIT}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                oldcategory: editDetails?.oldcategory,
                newcategory: editDetails?.category,
                oldsubcategory: editDetails?.oldsubcategory,
                newsubcategory: editDetails.subcategory,
                oldquestion: editDetails?.oldquestion,
                newquestion: editDetails?.question?.trim(),
                optionsArray: optionstodoEdit,
                oldsubquestion: [],
                newsubquestion: [],
                mode: "Verification/Administrative",
            });
            setFilteredChanges(null)
            setFilteredRowData([]);

            await fetchReturnData();
            handleCloseModEdit();
            setPopupContent("Updated Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
            handleCloseOverallEditPopup();
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            console.log("Error Response:", err.response);
            let error = err.response?.data?.message;
            if (error) {
                setPopupContentMalert(error);
                setPopupSeverityMalert("error");
                handleClickOpenPopupMalert();
            } else {
                handleApiError(
                    err,
                    setPopupContentMalert,
                    setPopupSeverityMalert,
                    handleClickOpenPopupMalert
                );
            }
        }
    };


    // const getTextAfterFirstDash = (inputString) => {
    //     const parts = inputString.split('-');
    //     return parts.slice(1).join('-');
    // };
    function getTextAfterFirstDash(str1, str2) {
        // Use String.prototype.replace to remove the first occurrence of str1 from str2
        const newStr = str2.replace(new RegExp(`^${str1}[-]?`), "");
        return newStr;
    }



    const [isEditOpenCheckList, setIsEditOpenCheckList] = useState(false);
    const handleClickOpenEditCheckList = () => {
        setIsEditOpenCheckList(true);
    };
    const handleCloseModEditCheckList = (e, reason) => {
        if (reason && reason === "backdropClick") return;
        setIsEditOpenCheckList(false);
    };

    //webcam




    //add webcamera popup



    //------------------------------------------------------------------------------------------------------------





    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [filterState, setFilterState] = useState({
        mode: "Verification/Administrative",
        category: "",
        subcategory: "",
        question: "",
        candidatestatusexp: [],
        workmode: [],
    });
    const customValueRendererQuestions = (valueQuestionsCat) => {
        return valueQuestionsCat?.length
            ? valueQuestionsCat?.map(({ label }) => label)?.join(", ")
            : "Please Select Candidate Status";
    };
    const customValueRendererWorkMode = (valueQuestionsCat) => {
        return valueQuestionsCat?.length
          ? valueQuestionsCat?.map(({ label }) => label)?.join(", ")
          : "Please Select Work Mode";
      };
    const [optionstodo, setOptionstodo] = useState(optionsArray);

    const handleTodoEdit = (index, value, newValue) => {

        const updatedTodos = [...optionstodo];
        if (value === "options") {
            updatedTodos[index].options = newValue;
        } else {
            updatedTodos[index].status = newValue;
        }
        setOptionstodo(updatedTodos);
    };


    const deleteTodo = (index) => {
        const updatedTodos = [...optionstodo];
        updatedTodos.splice(index, 1);
        setOptionstodo(updatedTodos);
    };
    const [optionstodoEdit, setOptionstodoEdit] = useState([]);

    const handleTodoEditEdit = (index, value, newValue) => {

        const updatedTodos = [...optionstodoEdit];
        if (value === "options") {
            updatedTodos[index].options = newValue;
        } else {
            updatedTodos[index].status = newValue;
        }
        setOptionstodoEdit(updatedTodos);
    };


    const deleteTodoEdit = (index) => {
        const updatedTodos = [...optionstodoEdit];
        updatedTodos.splice(index, 1);
        setOptionstodoEdit(updatedTodos);
    };








    //MULTISELECT ONCHANGE END
    const handleClearFilter = () => {

        setFilterState({
            mode: "Verification/Administrative",
            category: "",
            subcategory: "",
            question: "",
            candidatestatusexp: [],
            workmode: [],
        });
        setOptionstodo(optionsArray)

        setPopupContent("Cleared Successfully");
        setPopupSeverity("success");
        handleClickOpenPopup();
    };

    const [filterLoader, setFilterLoader] = useState(false);
    const [tableLoader, setTableLoader] = useState(false);
    const handleSubmit = () => {
        setFilterLoader(true);
        const isNameMatch = employees?.some(
            (item) =>
                item.mode === filterState?.mode &&
                item.category === filterState?.category &&
                item.subcategory === filterState?.subcategory &&
                item.question?.trim()?.toLowerCase() === filterState?.question?.trim()?.toLowerCase()
        );
        if (isNameMatch) {
            setPopupContentMalert("Data Already Exist!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (
            filterState?.category === "" || !filterState?.category
        ) {
            setPopupContentMalert("Please Select Category!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (
            filterState?.subcategory === "" || !filterState?.subcategory
        ) {
            setPopupContentMalert("Please Select Sub Category!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (
            filterState?.question?.trim() === "" || !filterState?.question
        ) {
            setPopupContentMalert("Please Enter Verification Question!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (
            filterState?.candidatestatusexp?.length === 0) {
            setPopupContentMalert("Please Select Candidate Status!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (
            filterState?.workmode?.length === 0) {
            setPopupContentMalert("Please Select Work Mode!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (
            optionstodo?.some(item => item?.options === "")
        ) {
            setPopupContentMalert("Please Enter All Options!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else if (
            optionstodo?.some((item, index, array) => array?.find((data, ind) => data?.options?.toLowerCase() === item?.options?.toLowerCase() && index !== ind))
        ) {
            setPopupContentMalert("Duplicate Options!");
            setPopupSeverityMalert("info");
            handleClickOpenPopupMalert();
        }
        else {
            sendRequest();
        }
    };

    useEffect(() => { fetchReturnData() }, [])
    const fetchReturnData = async () => {
        setPageName(!pageName);
        setLoader(true);
        setisBtnFilter(true);
        setFilterLoader(true);
        setTableLoader(true);
        try {

            let response = await axios.get(
                SERVICE.ALL_INTERVIEW_VERIFICATION,
                {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                }
            );

            const itemsWithSerialNumber = response?.data?.allInterviewVerification?.map((item, index) => {


                return {
                    ...item,
                    serialNumber: index + 1,
                    id: item._id,
                    mode: item?.mode,
                    category: item?.category,
                    subcategory: item?.subcategory,
                    question: item?.question,
                    addedby: item?.addedby?.length > 0 ? item?.addedby : [],
                    updatedby: item?.updatedby?.length > 0 ? item?.updatedby : [],
                    optionsArray: item?.optionsArray?.length > 0 ? item?.optionsArray : [],
                    candidatestatusexp: item?.candidatestatusexp?.length > 0 ? item?.candidatestatusexp?.join(",") : "",
                    workmode: item?.workmode?.length > 0 ? item?.workmode?.join(",") : "",



                };
            });


            setEmployees(itemsWithSerialNumber);

            setisBtnFilter(false);
            setLoader(false);
            setFilterLoader(false);
            setTableLoader(false);
        } catch (err) {
            setFilterLoader(false);
            setTableLoader(false);
            setLoader(false);
            setisBtnFilter(false);
            handleApiError(
                err,
                setPopupContentMalert,
                setPopupSeverityMalert,
                handleClickOpenPopupMalert
            );
        }
    };



    //FILTER END

    return (
        <Box>
            <NotificationContainer />
            <Headtitle title={"INTERVIEW VERIFICATION MASTER"} />
            {/* ****** Header Content ****** */}
            <PageHeading
                title="Interview Verification Master"
                modulename="Interview"
                submodulename="Interview Setup"
                mainpagename="Interview Verification Master"
                subpagename=""
                subsubpagename=""
            />
            {isUserRoleCompare?.includes("ainterviewverificationmaster") && (
                <>
                    <Box sx={userStyle.dialogbox}>
                        <>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography sx={userStyle.importheadtext}>
                                        Add Interview Verification Master
                                    </Typography>
                                </Grid>
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Mode
                                        </Typography>

                                        <OutlinedInput
                                            id="component-outlined"
                                            type="text"
                                            placeholder="Mode"
                                            value={filterState?.mode}
                                            readOnly
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Category<b style={{ color: "red" }}>*</b>
                                        </Typography>

                                        <Selects
                                            options={interviewCategories?.map(data => ({
                                                label: data?.categoryname,
                                                value: data?.categoryname,
                                            }))}
                                            value={{
                                                label: filterState?.category ? filterState?.category : "Please Select Category",
                                                value: filterState?.category ? filterState?.category : "Please Select Category",
                                            }}
                                            onChange={(e) => {

                                                setFilterState((prev) => ({
                                                    ...prev,
                                                    category: e.value,
                                                    subcategory: "",
                                                }))
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Sub Category<b style={{ color: "red" }}>*</b>
                                        </Typography>

                                        <Selects
                                            options={interviewCategories
                                                ?.filter(
                                                    (item) =>
                                                        item.categoryname === filterState?.category
                                                )
                                                ?.map((item) => {
                                                    return item.subcategoryname.map((subCatName) => ({
                                                        label: subCatName,
                                                        value: subCatName,
                                                    }));
                                                })
                                                .flat()}
                                            value={{
                                                label: filterState?.subcategory ? filterState?.subcategory : "Please Select Sub Category",
                                                value: filterState?.subcategory ? filterState?.subcategory : "Please Select Sub Category",
                                            }}
                                            onChange={(e) => {
                                                setFilterState((prev) => ({
                                                    ...prev,
                                                    subcategory: e.value,
                                                }))
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={3} sm={6} xs={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>Candidate Status<b style={{ color: "red" }}>*</b></Typography>
                                        {/* <Selects
                                            options={candidatestatusOption}
                                            value={{
                                                label: filterState?.candidatestatusexp ? filterState?.candidatestatusexp : "Please Select Candidate Status",
                                                value: filterState?.candidatestatusexp ? filterState?.candidatestatusexp : "Please Select Candidate Status",
                                            }}
                                            onChange={(e) => {
                                                setFilterState((prev) => ({
                                                    ...prev,
                                                    candidatestatusexp: e.value,
                                                }))
                                            }}
                                        /> */}
                                        <MultiSelect
                                            options={candidatestatusOption}

                                            value={filterState?.candidatestatusexp}
                                            onChange={(e) => {
                                                setFilterState((prev) => ({
                                                    ...prev,
                                                    candidatestatusexp: e,
                                                }))
                                            }}
                                            valueRenderer={customValueRendererQuestions}
                                            labelledBy="Please Select Questions"
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={3} sm={6} xs={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>Work Mode<b style={{ color: "red" }}>*</b></Typography>
                                        <MultiSelect
                                            options={workmodeOption}

                                            value={filterState?.workmode}
                                            onChange={(e) => {
                                                setFilterState((prev) => ({
                                                    ...prev,
                                                    workmode: e,
                                                }))
                                            }}
                                            valueRenderer={customValueRendererWorkMode}
                                            labelledBy="Please Select Work Mode"
                                        />
                                        {/* <Selects
                                            options={workmodeOption}
                                            value={{
                                                label: filterState?.workmode ? filterState?.workmode : "Please Select Work Mode",
                                                value: filterState?.workmode ? filterState?.workmode : "Please Select Work Mode",
                                            }}

                                            onChange={(e) => {
                                                setFilterState((prev) => ({
                                                    ...prev,
                                                    workmode: e.value,
                                                }))
                                            }}
                                        /> */}
                                    </FormControl>
                                </Grid>
                                <Grid item md={9} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Verification Question <b style={{ color: "red" }}>*</b>
                                        </Typography>

                                        <TextareaAutosize
                                            aria-label="minimum height"
                                            minRows={5}
                                            value={filterState.question}
                                            placeholder='Please Enter Verification Question'
                                            onChange={(e) => {
                                                // if (typingTest.questiontype === "Numeric") {
                                                //   const numericOnly = e.target.value.replace(
                                                //     /[^0-9.;\s]/g,
                                                //     ""
                                                //   );
                                                //   setProjectmaster({
                                                //     ...projectmaster,
                                                //     name: numericOnly,
                                                //   });
                                                // } else {
                                                setFilterState((prev) => ({
                                                    ...prev,
                                                    question: e.target.value,
                                                }))
                                                // }
                                            }}
                                            style={{ fontSize: "24px" }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={8} xs={12} sm={12}>
                                    {optionstodo?.length > 0 && (
                                        <ul type="none">
                                            {optionstodo?.map((item, index) => {
                                                return (
                                                    <li key={index}>
                                                        <br />
                                                        <Grid sx={{ display: "flex" }}>
                                                            <FormControl fullWidth size="small">
                                                                <Typography>
                                                                    {" "}
                                                                    Options{" "}
                                                                    <b style={{ color: "red" }}>*</b>
                                                                </Typography>
                                                                <OutlinedInput
                                                                    id="component-outlined"
                                                                    placeholder="Please Enter SubCategory"
                                                                    // disabled={true}
                                                                    value={item.options}
                                                                    onChange={(e) =>
                                                                        handleTodoEdit(
                                                                            index,
                                                                            "options",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                            </FormControl>
                                                            &emsp;
                                                            <FormControl fullWidth size="small">
                                                                <Typography>
                                                                    Status<b style={{ color: "red" }}>*</b>
                                                                </Typography>
                                                                <Selects
                                                                    options={[
                                                                        { label: "Eligible", value: "Eligible" },
                                                                        { label: "Not-Eligible", value: "Not-Eligible" },
                                                                    ]}
                                                                    value={{
                                                                        label: item.status,
                                                                        value: item.status,
                                                                    }}
                                                                    onChange={(e) =>
                                                                        handleTodoEdit(index, "status", e.value)
                                                                    }
                                                                />
                                                            </FormControl>
                                                            &emsp; &emsp;
                                                            {optionstodo?.length - 1 === index &&
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    onClick={() => {
                                                                        setOptionstodo((prev) => ([...prev, {
                                                                            options: "",
                                                                            status: "Eligible"
                                                                        }]));
                                                                    }}
                                                                    type="button"
                                                                    sx={{
                                                                        height: "30px",
                                                                        minWidth: "30px",
                                                                        marginTop: "28px",
                                                                        padding: "6px 10px",
                                                                    }}
                                                                >
                                                                    <FaPlus />
                                                                </Button>}
                                                            &emsp; &emsp;
                                                            {![0, 1].includes(
                                                                index
                                                            ) && (
                                                                    <Button
                                                                        variant="contained"
                                                                        color="error"
                                                                        type="button"
                                                                        onClick={(e) => deleteTodo(index)}
                                                                        sx={{
                                                                            height: "30px",
                                                                            minWidth: "30px",
                                                                            marginTop: "28px",
                                                                            padding: "6px 10px",
                                                                        }}
                                                                    >
                                                                        <AiOutlineClose />
                                                                    </Button>
                                                                )}

                                                        </Grid>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </Grid>
                                <Grid item xs={12}>
                                    <Grid container spacing={2}>

                                        <Grid item md={3} xs={12} sm={6} mt={3}>
                                            <div style={{ display: "flex", gap: "20px" }}>
                                                <LoadingButton
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={handleSubmit}
                                                    loading={filterLoader}
                                                    sx={buttonStyles.buttonsubmit}
                                                >
                                                    Submit
                                                </LoadingButton>

                                                <Button
                                                    sx={buttonStyles.btncancel}
                                                    onClick={handleClearFilter}
                                                >
                                                    Clear
                                                </Button>
                                            </div>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </>
                    </Box>
                </>
            )}
            <br />
            {tableLoader ? (
                <Box sx={userStyle.container}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            minHeight: "350px",
                        }}
                    >
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
                </Box>
            ) : (
                <>
                    {isUserRoleCompare?.includes("linterviewverificationmaster") && (
                        <>
                            <Box sx={userStyle.container}>
                                {/* ******************************************************EXPORT Buttons****************************************************** */}
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography sx={userStyle.SubHeaderText}>
                                            List Interview Verification
                                        </Typography>
                                    </Grid>

                                </Grid>
                                <br />
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
                                                <MenuItem value={employees?.length}>All</MenuItem>
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
                                                "excelinterviewverificationmaster"
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
                                                "csvinterviewverificationmaster"
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
                                                "printinterviewverificationmaster"
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
                                                "pdfinterviewverificationmaster"
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
                                                "imageinterviewverificationmaster"
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
                                    <Grid item md={2} xs={6} sm={6}>

                                        <AggregatedSearchBar
                                            columnDataTable={columnDataTable}
                                            setItems={setItems}
                                            addSerialNumber={addSerialNumber}
                                            setPage={setPage}
                                            maindatas={employees}
                                            setSearchedString={setSearchedString}
                                            searchQuery={searchQuery}
                                            setSearchQuery={setSearchQuery}
                                            paginated={false}
                                            totalDatas={employees}
                                        />
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
                                &emsp;
                                {isUserRoleCompare?.includes("bdinterviewverificationmaster") && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        sx={buttonStyles.buttonbulkdelete}
                                        onClick={handleClickOpenalert}
                                    >
                                        Bulk Delete
                                    </Button>
                                )}
                                <br />
                                <br />
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
                                    searchQuery={searchQuery}
                                    handleShowAllColumns={handleShowAllColumns}
                                    setFilteredRowData={setFilteredRowData}
                                    filteredRowData={filteredRowData}
                                    setFilteredChanges={setFilteredChanges}
                                    filteredChanges={filteredChanges}
                                    gridRefTableImg={gridRefTableImg}
                                    itemsList={employees}
                                />
                            </Box>
                        </>
                    )}
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
                itemsTwo={employees ?? []}
                filename={"InterviewVerificationMaster"}
                exportColumnNames={exportColumnNames}
                exportRowValues={exportRowValues}
                componentRef={componentRef}
            />

            {/* EXTERNAL COMPONENTS -------------- END */}



            {/* view model */}
            <Dialog
                open={openview}
                onClose={handleClickOpenview}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth={true}
                maxWidth="md"
                sx={{ marginTop: "50px" }}
            >
                <Box sx={{ padding: "20px 50px" }}>
                    <>
                        <Typography sx={userStyle.HeaderText}>
                            {" "}
                            View Interview Verification
                        </Typography>
                        <br />
                        <Grid container spacing={2}>


                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Mode</Typography>
                                    <Typography>{viewDetails?.mode}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Category</Typography>
                                    <Typography>{viewDetails?.category}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Sub Category</Typography>
                                    <Typography>{viewDetails?.subcategory}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={6} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Candidate Status</Typography>
                                    <Typography>{viewDetails?.candidatestatusexp}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={6} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Work Mode</Typography>
                                    <Typography>{viewDetails?.workmode}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={12} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Question</Typography>
                                    <Typography>{viewDetails?.question}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={12} xs={12} sm={12}>
                                {optionstodoEdit?.length > 0 && (
                                    <ul type="none">
                                        {optionstodoEdit?.map((item, index) => {
                                            return (
                                                <li key={index}>
                                                    <br />
                                                    <Grid sx={{ display: "flex" }}>
                                                        <FormControl fullWidth size="small">
                                                            <Typography>
                                                                {" "}
                                                                Options{" "}
                                                            </Typography>
                                                            {/* <OutlinedInput
                                                                id="component-outlined"
                                                                placeholder="Please Enter SubCategory"
                                                                // disabled={true}
                                                                value={item.options}
                                                                readOnly
                                                            /> */}
                                                            <Typography>{item.options}</Typography>
                                                        </FormControl>
                                                        &emsp;
                                                        <FormControl fullWidth size="small">
                                                            <Typography>
                                                                Status
                                                            </Typography>
                                                            {/* <OutlinedInput
                                                                id="component-outlined"
                                                                placeholder="Please Enter SubCategory"
                                                                // disabled={true}
                                                                value={item.status}
                                                                readOnly
                                                            /> */}
                                                            <Typography>{item.status}</Typography>
                                                        </FormControl>


                                                    </Grid>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </Grid>
                        </Grid>
                        <br /> <br /> <br /> <br />
                        <Grid container spacing={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleCloseview}
                                sx={buttonStyles.btncancel}
                            >
                                Back
                            </Button>
                        </Grid>
                    </>
                </Box>
            </Dialog>


            {/* Edit DIALOG */}
            <Box>
                <Dialog
                    open={isEditOpen}
                    onClose={handleCloseModEdit}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="md"
                    fullWidth={true}
                    sx={{
                        // overflow: "visible",
                        // "& .MuiPaper-root": {
                        //     overflow: "visible",
                        // },
                        marginTop: "50px"
                    }}
                >
                    <Box sx={{ padding: "20px 50px" }}>
                        <>
                            <Grid container spacing={2}>
                                <Typography sx={userStyle.HeaderText}>
                                    Edit Interview Verification
                                </Typography>
                            </Grid>
                            <br />
                            <Grid container spacing={2}>




                                <Grid item md={4} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Mode
                                        </Typography>

                                        <OutlinedInput
                                            id="component-outlined"
                                            type="text"
                                            placeholder="Mode"
                                            value={editDetails?.mode}
                                            readOnly
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={4} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Category<b style={{ color: "red" }}>*</b>
                                        </Typography>

                                        <Selects
                                            options={interviewCategories?.map(data => ({
                                                label: data?.categoryname,
                                                value: data?.categoryname,
                                            }))}
                                            value={{
                                                label: editDetails?.category ? editDetails?.category : "Please Select Category",
                                                value: editDetails?.category ? editDetails?.category : "Please Select Category",
                                            }}
                                            onChange={(e) => {

                                                setEditDetails((prev) => ({
                                                    ...prev,
                                                    category: e.value,
                                                    subcategory: "",
                                                }))
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={4} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Sub Category<b style={{ color: "red" }}>*</b>
                                        </Typography>

                                        <Selects
                                            options={interviewCategories
                                                ?.filter(
                                                    (item) =>
                                                        item.categoryname === editDetails?.category
                                                )
                                                ?.map((item) => {
                                                    return item.subcategoryname.map((subCatName) => ({
                                                        label: subCatName,
                                                        value: subCatName,
                                                    }));
                                                })
                                                .flat()}
                                            value={{
                                                label: editDetails?.subcategory ? editDetails?.subcategory : "Please Select Sub Category",
                                                value: editDetails?.subcategory ? editDetails?.subcategory : "Please Select Sub Category",
                                            }}
                                            onChange={(e) => {
                                                setEditDetails((prev) => ({
                                                    ...prev,
                                                    subcategory: e.value,
                                                }))
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={6} sm={6} xs={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>Candidate Status<b style={{ color: "red" }}>*</b></Typography>

                                        <MultiSelect
                                            options={candidatestatusOption}

                                            value={editDetails?.candidatestatusexp}
                                            onChange={(e) => {
                                                setEditDetails((prev) => ({
                                                    ...prev,
                                                    candidatestatusexp: e,
                                                }))
                                            }}
                                            valueRenderer={customValueRendererQuestions}
                                            labelledBy="Please Select Questions"
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={6} sm={6} xs={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>Work Mode<b style={{ color: "red" }}>*</b></Typography>
                                        <MultiSelect
                                            options={workmodeOption}

                                            value={editDetails?.workmode}
                                            onChange={(e) => {
                                                setEditDetails((prev) => ({
                                                    ...prev,
                                                    workmode: e,
                                                }))
                                            }}
                                            valueRenderer={customValueRendererWorkMode}
                                            labelledBy="Please Select Work Mode"
                                        />
                                        {/* <Selects
                                            options={workmodeOption}
                                            value={{
                                                label: editDetails?.workmode ? editDetails?.workmode : "Please Select Work Mode",
                                                value: editDetails?.workmode ? editDetails?.workmode : "Please Select Work Mode",
                                            }}

                                            onChange={(e) => {
                                                setEditDetails((prev) => ({
                                                    ...prev,
                                                    workmode: e.value,
                                                }))
                                            }}
                                        /> */}
                                    </FormControl>
                                </Grid>
                                <Grid item md={12} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Verification Question <b style={{ color: "red" }}>*</b>
                                        </Typography>

                                        <TextareaAutosize
                                            aria-label="minimum height"
                                            minRows={5}
                                            value={editDetails.question}
                                            placeholder='Please Enter Verification Question'
                                            onChange={(e) => {

                                                setEditDetails((prev) => ({
                                                    ...prev,
                                                    question: e.target.value,
                                                }))
                                            }}
                                            style={{ fontSize: "24px" }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={12} xs={12} sm={12}>
                                    {optionstodoEdit?.length > 0 && (
                                        <ul type="none">
                                            {optionstodoEdit?.map((item, index) => {
                                                return (
                                                    <li key={index}>
                                                        <br />
                                                        <Grid sx={{ display: "flex" }}>
                                                            <FormControl fullWidth size="small">
                                                                <Typography>
                                                                    {" "}
                                                                    Options{" "}
                                                                    <b style={{ color: "red" }}>*</b>
                                                                </Typography>
                                                                <OutlinedInput
                                                                    id="component-outlined"
                                                                    placeholder="Please Enter SubCategory"
                                                                    // disabled={true}
                                                                    value={item.options}
                                                                    onChange={(e) =>
                                                                        handleTodoEditEdit(
                                                                            index,
                                                                            "options",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                            </FormControl>
                                                            &emsp;
                                                            <FormControl fullWidth size="small">
                                                                <Typography>
                                                                    Status<b style={{ color: "red" }}>*</b>
                                                                </Typography>
                                                                <Selects
                                                                    options={[
                                                                        { label: "Eligible", value: "Eligible" },
                                                                        { label: "Not-Eligible", value: "Not-Eligible" },
                                                                    ]}
                                                                    value={{
                                                                        label: item.status,
                                                                        value: item.status,
                                                                    }}
                                                                    onChange={(e) =>
                                                                        handleTodoEditEdit(index, "status", e.value)
                                                                    }
                                                                />
                                                            </FormControl>
                                                            &emsp; &emsp;
                                                            {optionstodoEdit?.length - 1 === index &&
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    onClick={() => {
                                                                        setOptionstodoEdit((prev) => ([...prev, {
                                                                            options: "",
                                                                            status: "Eligible"
                                                                        }]));
                                                                    }}
                                                                    type="button"
                                                                    sx={{
                                                                        height: "30px",
                                                                        minWidth: "30px",
                                                                        marginTop: "28px",
                                                                        padding: "6px 10px",
                                                                    }}
                                                                >
                                                                    <FaPlus />
                                                                </Button>}
                                                            &emsp; &emsp;
                                                            {![0, 1].includes(
                                                                index
                                                            ) && (
                                                                    <Button
                                                                        variant="contained"
                                                                        color="error"
                                                                        type="button"
                                                                        onClick={(e) => deleteTodoEdit(index)}
                                                                        sx={{
                                                                            height: "30px",
                                                                            minWidth: "30px",
                                                                            marginTop: "28px",
                                                                            padding: "6px 10px",
                                                                        }}
                                                                    >
                                                                        <AiOutlineClose />
                                                                    </Button>
                                                                )}

                                                        </Grid>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </Grid>
                            </Grid>


                            <br /> <br />
                            <Grid
                                container
                                spacing={2}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Grid item md={3} xs={12} sm={12}>
                                    <Button
                                        variant="contained"
                                        onClick={editSubmit}
                                        sx={buttonStyles.buttonsubmit}
                                    >
                                        {" "}
                                        Update
                                    </Button>
                                </Grid>
                                <br />
                                <Grid item md={3} xs={12} sm={12}>
                                    <Button
                                        sx={buttonStyles.btncancel}
                                        onClick={handleCloseModEdit}
                                    >
                                        {" "}
                                        Cancel{" "}
                                    </Button>
                                </Grid>
                            </Grid>
                        </>
                    </Box>
                </Dialog>
            </Box>


            {/* <LoadingBackdrop open={isLoading} /> */}

            <DeleteConfirmation
                open={isDeleteOpen}
                onClose={handleClickCloseDelete}
                onConfirm={deleteFunction}
                title="Are you sure?"
                confirmButtonText="Yes"
                cancelButtonText="Cancel"
            />

            <InfoPopup
                openInfo={openInfo}
                handleCloseinfo={handleCloseinfo}
                heading="Interview Verification Info"
                addedby={infoDetails?.addedby}
                updateby={infoDetails?.updatedby}
            />





            <Dialog
                open={isDeleteOpencheckbox}
                onClose={handleCloseModcheckbox}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent
                    sx={{ width: "350px", textAlign: "center", alignItems: "center" }}
                >
                    <ErrorOutlineOutlinedIcon
                        sx={{ fontSize: "80px", color: "orange" }}
                    />
                    <Typography variant="h5" sx={{ color: "red", textAlign: "center" }}>
                        {selectedRows?.length === 0 ? (
                            <>
                                The Datas in the selected rows are already used in some pages,
                                you can't delete.
                            </>
                        ) : (
                            <>
                                Are you sure? Only {selectedRows?.length} datas can be deleted
                                remaining are used in some pages.
                            </>
                        )}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseModcheckbox}
                        sx={buttonStyles.btncancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        autoFocus
                        variant="contained"
                        color="error"
                        onClick={bulkdeleteFunction}
                    >
                        {" "}
                        OK{" "}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* PLEASE SELECT ANY ROW */}
            <PleaseSelectRow
                open={isDeleteOpenalert}
                onClose={handleCloseModalert}
                message="Please Select any Row"
                iconColor="orange"
                buttonText="OK"
            />

            {/* bulk edit popup */}
            <Dialog
                open={openOverAllEditPopup}
                onClose={handleCloseOverallEditPopup}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent
                    sx={{ width: "350px", textAlign: "center", alignItems: "center" }}
                >
                    <ErrorOutlineOutlinedIcon
                        sx={{ fontSize: "80px", color: "orange" }}
                    />
                    <Typography variant="h5" sx={{ color: "red", textAlign: "center" }}>
                        If this Question used in any of the pages that may also edits. Are
                        you sure?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseOverallEditPopup}
                        variant="outlined"
                        sx={buttonStyles.btncancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={(e) => sendEditRequest()}
                        autoFocus
                        variant="contained"
                        color="error"
                    >
                        {" "}
                        OK{" "}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default InterviewVerification;