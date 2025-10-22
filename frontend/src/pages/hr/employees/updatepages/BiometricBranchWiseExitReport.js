import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import LoadingButton from "@mui/lab/LoadingButton";
import { ExportXL, ExportCSV } from "../../../../components/Export";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import {
    Box,
    Button,
    OutlinedInput,
    DialogActions,
    DialogContent,
    FormControl,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Popover,
    Select,
    TextField,
    Dialog,
    Typography, TableBody,
    Table, TableHead,
} from "@mui/material";
import { StyledTableRow, StyledTableCell } from "../../../../components/Table";
import Switch from "@mui/material/Switch";
import axios from "axios";
import { saveAs } from "file-saver";
import "jspdf-autotable";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFilePdf, FaPrint } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import { MultiSelect } from "react-multi-select-component";
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import { handleApiError } from "../../../../components/Errorhandling";
import Headtitle from "../../../../components/Headtitle";
import { AuthContext, UserRoleAccessContext } from "../../../../context/Appcontext";
import { userStyle } from "../../../../pageStyle";
import { SERVICE } from "../../../../services/Baseservice";

import domtoimage from 'dom-to-image';
import { FaFileCsv, FaFileExcel } from "react-icons/fa";
import AggregatedSearchBar from '../../../../components/AggregatedSearchBar';
import AggridTable from "../../../../components/AggridTable";
import AlertDialog from "../../../../components/Alert";
import ExportData from "../../../../components/ExportData";
import MessageAlert from "../../../../components/MessageAlert";
import PageHeading from "../../../../components/PageHeading";
import BiometricBranchWiseExitReportNight from "./BiometricBranchWiseExitReportNight";
// import { colourStyles, userStyle } from "../../../../pageStyle";

function BiometricBranchWiseExitReport() {


    const [filteredRowData, setFilteredRowData] = useState([]);
    const [filteredChanges, setFilteredChanges] = useState(null);
    const [openPopupMalert, setOpenPopupMalert] = useState(false);
    const [popupContentMalert, setPopupContentMalert] = useState("");
    const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
    const handleClickOpenPopupMalert = () => {
        setOpenPopupMalert(true);
    };
    const handleClosePopupMalert = () => {
        setOpenPopupMalert(false);
    };
    const [totalProjects, setTotalProjects] = useState(0);

    const [openPopup, setOpenPopup] = useState(false);
    const [popupContent, setPopupContent] = useState("");
    const [popupSeverity, setPopupSeverity] = useState("");
    const handleClickOpenPopup = () => {
        setOpenPopup(true);
    };
    const handleClosePopup = () => {
        setOpenPopup(false);
    }


    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
    const [isHandleChange, setIsHandleChange] = useState(false);
    const [isAttendanceList, setIsAttendanceList] = useState(false);
    const [AttendanceList, setAttendanceList] = useState({});


    const [isAllUsers, setIsAllUsers] = useState([]);
    // page refersh reload
    const handleCloseFilterMod = () => {
        setIsFilterOpen(false);
    };
    const handleClosePdfFilterMod = () => {
        setIsPdfFilterOpen(false);
    };

    // page refersh reload
    const handleClickOpenAttendanceList = () => {
        setIsAttendanceList(true);
    };
    const handleCloseAttendanceList = () => {
        setIsAttendanceList(false);
        setAttendanceList({})
    };
    const [fileFormat, setFormat] = useState("");
    let exportColumnNamescrt = [
        'Company',
        'Branch',
        'Total Users',
        'Total Users There',
        'Total In User - Day',
        'Total Out Users - Day',
        'Total InOut Users - Day',
        'Pending InOut Users - Day',
        'Pending Out Users - Day',
    ]
    let exportRowValuescrt = [
        'company',
        'branch',
        'totalusers',
        'totaluserspresent',
        'totalinusersDay',
        'totaloutusersDay',
        'totalinoutusersDay',
        'pendinginusersDay',
        'pendingoutusersDay',
    ]
    const gridRef = useRef(null);
    const gridRefTable = useRef(null);
    //useStates
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchQueryManage, setSearchQueryManage] = useState("");
    const [meetingArray, setMeetingArray] = useState([]);
    const {
        isUserRoleCompare,
        isUserRoleAccess,
        isAssignBranch,
        allTeam,
        pageName, setPageName, buttonStyles, allUsersData
    } = useContext(UserRoleAccessContext);

    const accessbranch = isUserRoleAccess?.role?.includes("Manager")
        ? isAssignBranch?.map((data) => ({
            branch: data.branch,
            company: data.company,
            unit: data.unit,
            branchaddress: data?.branchaddress,
        }))
        : isAssignBranch
            ?.filter((data) => {
                let fetfinalurl = [];
                if (
                    data?.modulenameurl?.length !== 0 &&
                    data?.submodulenameurl?.length !== 0 &&
                    data?.mainpagenameurl?.length !== 0 &&
                    data?.subpagenameurl?.length !== 0 &&
                    data?.subsubpagenameurl?.length !== 0 && data?.submodulenameurl?.includes(window.location.pathname)
                ) {
                    fetfinalurl = data.subsubpagenameurl;
                } else if (
                    data?.modulenameurl?.length !== 0 &&
                    data?.submodulenameurl?.length !== 0 &&
                    data?.mainpagenameurl?.length !== 0 &&
                    data?.subpagenameurl?.length !== 0 && data?.submodulenameurl?.includes(window.location.pathname)
                ) {
                    fetfinalurl = data.subpagenameurl;
                } else if (
                    data?.modulenameurl?.length !== 0 &&
                    data?.submodulenameurl?.length !== 0 &&
                    data?.mainpagenameurl?.length !== 0 && data?.submodulenameurl?.includes(window.location.pathname)
                ) {
                    fetfinalurl = data.mainpagenameurl;
                } else if (
                    data?.modulenameurl?.length !== 0 &&
                    data?.submodulenameurl?.length !== 0 && data?.submodulenameurl?.includes(window.location.pathname)
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
                branchaddress: data?.branchaddress
            }));
    const { auth } = useContext(AuthContext);
    const [loader, setLoader] = useState(false);
    //Datatable
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchedString, setSearchedString] = useState("")
    const [items, setItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const initialColumnVisibility = {
        serialNumber: true,
        checkbox: true,
        company: true,
        branch: true,
        totalusers: true,
        totaluserspresent: true,
        totalinusersDay: true,
        totaloutusersDay: true,
        pendinginusersDay: true,
        totalinoutusersDay: true,
        pendingoutusersDay: true,

        totalinusersNight: true,
        totaloutusersNight: true,
        pendinginusersNight: true,
        totalinoutusersNight: true,
        pendingoutusersNight: true,
    };
    const [columnVisibility, setColumnVisibility] = useState(
        initialColumnVisibility
    );
    var today = new Date();
    var yesterday = new Date();
    yesterday.setDate(today.getDate() - 1); // Set yesterday's date

    var formatDate = (date) => {
        return date.getFullYear() + "-" +
            String(date.getMonth() + 1).padStart(2, "0") + "-" +
            String(date.getDate()).padStart(2, "0");
    };

    const [filterUser, setFilterUser] = useState({
        fromdate: formatDate(yesterday),
        todate: formatDate(today),
    });


    const [selectedMode, setSelectedMode] = useState("Today");
    const mode = [
        { label: "Today", value: "Today" },
        { label: "Yesterday", value: "Yesterday" },
        { label: "Last Week", value: "Last Week" },
        { label: "Last Month", value: "Last Month" },
        { label: "Custom", value: "Custom" }
    ]
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
            case "Yesterday":
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                fromdate = todate = formatDate(yesterday);
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
    useEffect(() => {
        // Save column visibility to localStorage whenever it changes
        localStorage.setItem("columnVisibility", JSON.stringify(columnVisibility));
    }, [columnVisibility]);

    useEffect(() => {
        // Retrieve column visibility from localStorage (if available)
        const savedVisibility = localStorage.getItem("columnVisibility");
        if (savedVisibility) {
            setColumnVisibility(JSON.parse(savedVisibility));
        }
    }, []);


    //company multiselect
    const [selectedOptionsCompany, setSelectedOptionsCompany] = useState([]);
    let [valueCompanyCat, setValueCompanyCat] = useState([]);

    const handleCompanyChange = (options) => {
        setValueCompanyCat(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsCompany(options);
        setValueBranchCat([]);
        setSelectedOptionsBranch([]);
    };

    const customValueRendererCompany = (valueCompanyCat, _categoryname) => {
        return valueCompanyCat?.length
            ? valueCompanyCat.map(({ label }) => label)?.join(", ")
            : "Please Select Company";
    };

    //branch multiselect
    const [selectedOptionsBranch, setSelectedOptionsBranch] = useState([]);
    let [valueBranchCat, setValueBranchCat] = useState([]);

    const handleBranchChange = (options) => {
        setValueBranchCat(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsBranch(options);
    };

    const customValueRendererBranch = (valueBranchCat, _categoryname) => {
        return valueBranchCat?.length
            ? valueBranchCat.map(({ label }) => label)?.join(", ")
            : "Please Select Branch";
    };


    //Work Mode multiselect
    const [selectedOptionsWorkMode, setSelectedOptionsWorkMode] = useState([]);
    let [valueWorkMode, setValueWorkMode] = useState([]);

    const handleWorkModeChange = (options) => {
        setValueWorkMode(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsWorkMode(options);
    };

    const customValueRendererWorkMode = (valueWorkMode, _categoryname) => {
        return valueWorkMode?.length
            ? valueWorkMode?.map(({ label }) => label)?.join(", ")
            : "Please Select Work Mode";
    };







    //set function to get particular row
    const fetchAllUsers = async (id, name) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.ALLUSERENQLIVE}`, {
                headers: { Authorization: `Bearer ${auth.APIToken}` },
            });
            setIsAllUsers(res?.data?.users);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    useEffect(() => {
        addSerialNumber(meetingArray);
    }, [meetingArray]);


    const getapi = async () => {
        let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
            headers: {
                Authorization: `Bearer${auth.APIToken}`,
            },
            empcode: String(isUserRoleAccess?.empcode),
            companyname: String(isUserRoleAccess?.companyname),
            pagename: String("BiometricBranchWiseExitReport"),
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
        fetchAllUsers();
        getapi()
    }, []);
    useEffect(() => {
        const beforeUnloadHandler = (event) => handleBeforeUnload(event);
        window.addEventListener("beforeunload", beforeUnloadHandler);
        return () => {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
        };
    }, []);

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
    const getRowClassName = (params) => {
        if (selectedRows.includes(params.row.id)) {
            return "custom-id-row"; // This is the custom class for rows with item.tat === 'ago'
        }
        return ""; // Return an empty string for other rows
    };
    function getWeekNumberInMonth(date) {
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const dayOfWeek = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)

        // If the first day of the month is not Monday (1), calculate the adjustment
        const adjustment = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        // Calculate the day of the month adjusted for the starting day of the week
        const dayOfMonthAdjusted = date.getDate() + adjustment;

        // Calculate the week number based on the adjusted day of the month
        const weekNumber = Math.ceil(dayOfMonthAdjusted / 7);

        return weekNumber;
    }
    //add function
    const sendRequest = async () => {
        // setLoader(true);
        setPageName(!pageName)

        const today = new Date();
        let startMonthDate, endMonthDate;
        endMonthDate = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        startMonthDate = yesterday;

        const daysArray = [];
        while (startMonthDate <= endMonthDate) {

            const formattedDate = `${String(startMonthDate.getDate()).padStart(2, '0')}/${String(startMonthDate.getMonth() + 1).padStart(2, '0')}/${startMonthDate.getFullYear()}`;
            const dayName = startMonthDate.toLocaleDateString('en-US', { weekday: 'long' });

            const dayCount = startMonthDate.getDate();
            const shiftMode = 'Main Shift';
            const weekNumberInMonth = (getWeekNumberInMonth(startMonthDate) === 1 ? `${getWeekNumberInMonth(startMonthDate)}st Week` :
                getWeekNumberInMonth(startMonthDate) === 2 ? `${getWeekNumberInMonth(startMonthDate)}nd Week` :
                    getWeekNumberInMonth(startMonthDate) === 3 ? `${getWeekNumberInMonth(startMonthDate)}rd Week` :
                        getWeekNumberInMonth(startMonthDate) > 3 ? `${getWeekNumberInMonth(startMonthDate)}th Week` : '')

            daysArray.push({ formattedDate, dayName, dayCount, shiftMode, weekNumberInMonth });

            // Move to the next day
            startMonthDate.setDate(startMonthDate.getDate() + 1);
        }
        try {
            const response = await axios.post(SERVICE.BIOMETRIC_USERS_BRANCH_WISE_EXIT_REPORT_CHECK, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                accessbranch,
                daysArray,
                dateNow: new Date(),
                company: valueCompanyCat,
                branch: valueBranchCat,
                workmode: valueWorkMode,
            });
            console.log(response?.data)
            setMeetingArray(response?.data?.filteredData?.map((data, index) => ({
                // ...data,
                serialNumber: index + 1,
                company: data?.company,
                branch: data?.branch,
                totalusers: data?.totalUsersInBranch,
                totaluserspresent: data?.totalUsersThere,

                totalinusersDay: data?.totalusersINDay,
                totaloutusersDay: data?.totalusersOutDay,
                pendinginusersDay: data?.pendingInOutUserDay,
                totalinoutusersDay: data?.totalinoutusersDay,
                pendingoutusersDay: data?.totalusersINDay,
                usersINDay: data?.usersINDay,
                usersINOUTDay: data?.usersINOUTDay,
                usersOutDay: data?.usersOutDay,

                totalinusersNight: data?.totalusersINNight,
                totaloutusersNight: data?.totalusersOutNight,
                pendinginusersNight: data?.pendingInOutUserNight,
                totalinoutusersNight: data?.totalinoutusersNight,
                pendingoutusersNight: data?.totalusersINNight,
                usersINNight: data?.usersINNight,
                usersINOUTNight: data?.usersINOUTNight,
                usersOutNight: data?.usersOutNight,



                // users: data?.users,
            })));
            setLoader(false);

        } catch (err) {
            console.log(err, 'err')
            setLoader(false);
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    //submit option for saving
    const handleSubmit = async (e) => {
        e.preventDefault();
        sendRequest();
    };

    const handleclear = (e) => {
        e.preventDefault();
        setMeetingArray([]);
        setValueBranchCat([])
        setValueCompanyCat([])
        setValueWorkMode([])
        setSelectedOptionsWorkMode([])
        setSelectedOptionsBranch([])
        setSelectedOptionsCompany([])
        setPopupContent("Cleared Successfully");
        setPopupSeverity("success");
        handleClickOpenPopup();
        setLoader(false);
    };

    const gridRefTableImg = useRef(null);
    // image
    const handleCaptureImage = () => {
        if (gridRefTableImg.current) {
            domtoimage.toBlob(gridRefTableImg.current)
                .then((blob) => {
                    saveAs(blob, "BiometricBranchWiseExitReport.png");
                })
                .catch((error) => {
                    console.error("dom-to-image error: ", error);
                });
        }
    };


    //image
    const handleCaptureImagePopUp = () => {
        if (componentRefPopUp.current) {
            html2canvas(componentRefPopUp.current).then((canvas) => {
                canvas.toBlob((blob) => {
                    saveAs(blob, "BiometricBranchWiseExitReport.png");
                });
            });
        }
    };
    // Excel
    const fileName = "BiometricBranchWiseExitReport";
    //print...
    const componentRefPopUp = useRef();
    const handleprintPopUp = useReactToPrint({
        content: () => componentRefPopUp.current,
        documentTitle: "Biometric Branch Wise Exit Report",
        pageStyle: "print",
    });

    const [applyData, setApplyData] = useState([]);

    // get particular columns for export excel
    const getexcelDatas = () => {
        var data = AttendanceList?.[AttendanceList?.column]?.map((t, index) => ({
            Sno: index + 1,
            "Shift Date": t.shiftdate,
            "User Name": t.staffNameC,
            "Company Name": t.companyname,
            "Emp Code": t.empcode,
            "Shift Time": t.shift,
            "In Time": t.inTime,
            "Verified IN Device": t.inTimeVerifiedDevice,
            "Verified by(IN)": t.inTimeVerified,
            "Out Time": t.outTime,
            "Verified OUT Device": t.outTimeVerifiedDevice,
            "Verified by(OUT)": t.outTimeVerified,
            "Total Hours (hh:mm:ss)": t.totalHours,
            // "Biometric Common Name": t.biometriccommonname,
        }));
        setApplyData(data);
    };
    useEffect(() => {
        getexcelDatas();
    }, [AttendanceList]);


    // pdf.....
    const columns = [
        // { title: "Sno", field: "serialNumber" },
        { title: "Shift Date", field: "shiftdate" },
        { title: "User Name", field: "staffNameC" },
        { title: "Company Name", field: "companyname" },
        { title: "Emp Code", field: "empcode" },
        { title: "Shift Time", field: "shift" },
        { title: "In Time", field: "inTime" },
        { title: "Verified IN Device", field: "inTimeVerifiedDevice" },
        { title: "Verified by(IN)", field: "inTimeVerified" },
        { title: "Out Time", field: "outTime" },
        { title: "Verified OUT Device", field: "outTimeVerifiedDevice" },
        { title: "Verified by(OUT)", field: "outTimeVerified" },
        { title: "Total Hours (hh:mm:ss)", field: "totalHours" },
    ];
    const downloadPdf = () => {
        const doc = new jsPDF();
        const columnsWithSerial = [
            // Serial number column
            { title: "SNo", dataKey: "serialNumber" },
            ...columns.map((col) => ({ ...col, dataKey: col.field })),
        ];
        // Add a serial number to each row
        const itemsWithSerial = AttendanceList?.[AttendanceList?.column]?.map((t, index) => ({
            // ...t,
            serialNumber: index + 1,
            "shiftdate": t.shiftdate,
            "staffNameC": t.staffNameC,
            "companyname": t.companyname,
            "empcode": t.empcode,
            "Shift Time": t.shift,
            "inTime": t.inTime,
            "inTimeVerified": t.inTimeVerified,
            "inTimeVerifiedDevice": t.inTimeVerifiedDevice,
            "outTime": t.outTime,
            "outTimeVerified": t.outTimeVerified,
            "outTimeVerifiedDevice": t.outTimeVerifiedDevice,
            "totalHours": t.totalHours,
            // "biometriccommonname": t.biometriccommonname,
        }));
        doc.autoTable({
            theme: "grid",
            styles: {
                fontSize: 4,
            },
            columns: columnsWithSerial,
            body: itemsWithSerial,
        });
        doc.save("Biometric Branch Wise Exit Report.pdf");
    };


    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "Biometric Branch Wise Exit Report",
        pageStyle: "print",
    });
    const addSerialNumber = (datas) => {
        setItems(datas);
    };


    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setSelectedRows([]);
        setPage(1);
    };
    //datatable....

    // Split the search query into individual terms
    const searchOverAllTerms = searchQuery.toLowerCase().split(" ");
    // Modify the filtering logic to check each term
    const filteredDatas = items?.filter((item) => {
        return searchOverAllTerms.every((term) =>
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

    const tableHeadCellStyle = { padding: "5px 10px", fontSize: "14px", boxShadow: "none", width: "max-content" };
    const tableBodyCellStyle = { padding: "5px 10px", width: "max-content" };
    const getCode = async (e, column) => {
        setAttendanceList({ ...e, column: column });
        handleClickOpenAttendanceList();
    }

    const columnDataTable = [
        {
            field: "serialNumber",
            headerName: "SNo",
            flex: 0,
            width: 100,
            hide: !columnVisibility.serialNumber,
            headerClassName: "bold-header",
            pinned: 'left', lockPinned: true,

        },
        {
            field: "company",
            headerName: "Company",
            flex: 0,
            width: 150,
            hide: !columnVisibility.company,
            headerClassName: "bold-header",
        },
        {
            field: "branch",
            headerName: "Branch",
            flex: 0,
            width: 150,
            hide: !columnVisibility.branch,
            headerClassName: "bold-header",

        },
        {
            field: "totalusers",
            headerName: "Total Users",
            flex: 0,
            width: 150,
            hide: !columnVisibility.totalusers,
            headerClassName: "bold-header",

        },
        {
            field: "totaluserspresent",
            headerName: "Total Users There",
            flex: 0,
            width: 150,
            hide: !columnVisibility.totaluserspresent,
            headerClassName: "bold-header",

        },
        {
            field: "totalinusersDay",
            headerName: "Total In Users - Day",
            flex: 0,
            width: 200,
            hide: !columnVisibility.totalinusersDay,
            headerClassName: "bold-header",
            cellRenderer: (params) => (
                <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isUserRoleCompare?.includes("vbiometricbranchwiseexitreport") && (
                        <>
                            <Typography>{params.data?.totalinusersDay} -</Typography>
                            <Button sx={userStyle.buttonedit} onClick={() => getCode(params.data, 'usersINDay')}>
                                View
                            </Button>
                        </>
                    )}

                </Grid>
            ),
        },
        {
            field: "totaloutusersDay",
            headerName: "Total Out Users- Day",
            flex: 0,
            width: 200,
            hide: !columnVisibility.totaloutusersDay,
            headerClassName: "bold-header",
            cellRenderer: (params) => (
                <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isUserRoleCompare?.includes("vbiometricbranchwiseexitreport") && (
                        <>
                            <Typography>{params.data?.totaloutusersDay} -</Typography>
                            <Button sx={userStyle.buttonedit} onClick={() => getCode(params.data, "usersOutDay")}>
                                View
                            </Button>
                        </>
                    )}

                </Grid>
            ),
        },
        {
            field: "totalinoutusersDay",
            headerName: "Total InOut Users - Day",
            flex: 0,
            width: 200,
            hide: !columnVisibility.totalinoutusersDay,
            headerClassName: "bold-header",

        },
        {
            field: "pendinginusersDay",
            headerName: "Pending InOut Users - Day",
            flex: 0,
            width: 200,
            hide: !columnVisibility.pendinginusersDay,
            headerClassName: "bold-header",

        },
        {
            field: "pendingoutusersDay - Day",
            headerName: "Pending Out Users",
            flex: 0,
            width: 200,
            hide: !columnVisibility.pendingoutusersDay,
            headerClassName: "bold-header",

        },
    ];
    const rowDataTable = filteredData.map((item, index) => {
        return {
            id: item.id,
            serialNumber: item.serialNumber,
            company: item?.company,
            branch: item?.branch,
            totalusers: item?.totalusers,
            totaluserspresent: item?.totaluserspresent,
            totalinusersDay: item?.totalinusersDay,
            totaloutusersDay: item?.totaloutusersDay,
            totalinoutusersDay: item?.totalinoutusersDay,
            pendinginusersDay: item?.pendinginusersDay,
            pendingoutusersDay: item?.pendingoutusersDay,
            usersINDay: item?.usersINDay,
            usersINOUTDay: item?.usersINOUTDay,
            usersOutDay: item?.usersOutDay,
        };
    });
    const rowsWithCheckboxes = rowDataTable.map((row) => ({
        ...row,
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
                            Hide All{" "}
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Box>
    );

    return (
        <Box>
            <Headtitle title={"BIOMETRIC BRANCH WISE EXIT REPORT"} />
            <PageHeading
                title="Biometric Branch Wise Exit Report"
                modulename="Human Resources"
                submodulename="HR"
                mainpagename="Attendance"
                subpagename="Biometric Device"
                subsubpagename="Biometric Branch Wise Exit Report"
            />
            {isUserRoleCompare?.includes("lbiometricbranchwiseexitreport") && (
                <Box sx={userStyle.selectcontainer}>
                    <>
                        <Grid container spacing={2}>
                            <Grid item md={12} sm={12} xs={12}>
                                <Typography>Filter Biometric Branch Wise Exit Report</Typography>
                            </Grid>
                            <br />
                            <br />
                            <Grid item md={3} xs={12} sm={12}>
                                <Typography>
                                    Company
                                </Typography>
                                <FormControl size="small" fullWidth>
                                    <MultiSelect
                                        options={accessbranch
                                            ?.map((data) => ({
                                                label: data.company,
                                                value: data.company,
                                            }))
                                            .filter((item, index, self) => {
                                                return (
                                                    self.findIndex(
                                                        (i) =>
                                                            i.label === item.label && i.value === item.value
                                                    ) === index
                                                );
                                            })}
                                        value={selectedOptionsCompany}
                                        onChange={(e) => {
                                            handleCompanyChange(e);
                                        }}
                                        valueRenderer={customValueRendererCompany}
                                        labelledBy="Please Select Company"
                                    />
                                </FormControl>
                            </Grid>
                            {/* Branch */}
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        {" "}
                                        Branch
                                    </Typography>
                                    <MultiSelect
                                        options={accessbranch
                                            ?.filter((comp) =>
                                                valueCompanyCat?.includes(comp.company)
                                            )
                                            ?.map((data) => ({
                                                label: data.branch,
                                                value: data.branch,
                                            }))
                                            .filter((item, index, self) => {
                                                return (
                                                    self.findIndex(
                                                        (i) =>
                                                            i.label === item.label &&
                                                            i.value === item.value
                                                    ) === index
                                                );
                                            })}
                                        value={selectedOptionsBranch}
                                        onChange={(e) => {
                                            handleBranchChange(e);
                                        }}
                                        valueRenderer={customValueRendererBranch}
                                        labelledBy="Please Select Branch"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        {" "}
                                        Work Mode
                                    </Typography>
                                    <MultiSelect
                                        options={[{ label: "Remote", value: "Remote" },
                                        { label: "Facility", value: "Office" },
                                        { label: "Intern", value: "Internship" },
                                        ]}
                                        value={selectedOptionsWorkMode}
                                        onChange={(e) => {
                                            handleWorkModeChange(e);
                                        }}
                                        valueRenderer={customValueRendererWorkMode}
                                        labelledBy="Please Select Work Mode"
                                    />
                                </FormControl>
                            </Grid>

                            <Grid item md={3} sm={12} xs={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>From Date </Typography>
                                    <OutlinedInput
                                        id="component-outlined"
                                        type="date"
                                        disabled={true}
                                        value={filterUser.fromdate}
                                        inputProps={{ max: new Date().toISOString().split("T")[0] }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} sm={12} xs={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>To Date</Typography>
                                    <OutlinedInput
                                        id="component-outlined"
                                        type="date"
                                        disabled={true}
                                        value={filterUser.todate}
                                        inputProps={{ max: new Date().toISOString().split("T")[0] }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={6}
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignContent: "end",
                                    alignItems: "end"
                                }}>
                                <Grid>
                                    <LoadingButton
                                        // loading={btnLoading}
                                        sx={buttonStyles.buttonsubmit}
                                        onClick={handleSubmit}
                                    >
                                        Generate
                                    </LoadingButton>
                                    &nbsp;
                                    &nbsp;
                                    <Button sx={buttonStyles.btncancel} onClick={handleclear}>
                                        {" "}
                                        Clear{" "}
                                    </Button>
                                </Grid>
                            </Grid>
                            <br />
                            <br />
                            <br />

                        </Grid>
                    </>
                </Box>
            )}
            <br />
            {/* ****** Table Start ****** */}
            {isUserRoleCompare?.includes("lbiometricbranchwiseexitreport") && (
                <>
                    <Box sx={userStyle.container}>
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>
                                List Biometric Branch Wise Exit Report
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
                                            PaperProps: { style: { maxHeight: 180, width: 80 } },
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
                                        <MenuItem value={meetingArray?.length}>All</MenuItem>
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
                                    {isUserRoleCompare?.includes("excelbiometricbranchwiseexitreport") && (
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
                                    {isUserRoleCompare?.includes("csvbiometricbranchwiseexitreport") && (
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
                                    {isUserRoleCompare?.includes("printbiometricbranchwiseexitreport") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleprint}>
                                                &ensp; <FaPrint /> &ensp;Print&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("pdfbiometricbranchwiseexitreport") && (
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
                                    {isUserRoleCompare?.includes("imagebiometricbranchwiseexitreport") && (
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
                        <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>
                            Show All Columns
                        </Button>
                        &ensp;
                        <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumns}>
                            Manage Columns
                        </Button>
                        &ensp;
                        <br />
                        <br />
                        <Box style={{ width: "100%", overflowY: "hidden" }}>
                            {loader ? (
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
                                    totalDatas={totalProjects}
                                    searchQuery={searchQuery}
                                    handleShowAllColumns={handleShowAllColumns}
                                    setFilteredRowData={setFilteredRowData}
                                    filteredRowData={filteredRowData}
                                    setFilteredChanges={setFilteredChanges}
                                    filteredChanges={filteredChanges}
                                    gridRefTableImg={gridRefTableImg}
                                    itemsList={meetingArray}
                                />

                            )}
                        </Box>

                    </Box>
                </>
            )}


            <br />
            <BiometricBranchWiseExitReportNight meetingArray={meetingArray} />
            {/* view model */}
            <Dialog
                open={isAttendanceList}
                onClose={handleCloseAttendanceList}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="lg"
                fullWidth={true}
                sx={{ marginTop: "80px" }}
            >
                <Box sx={{ padding: '20px 50px' }}>
                    <>
                        <Typography sx={userStyle.HeaderText}> View Branch Wise Exit Report</Typography>
                        <br /> <br />
                        <Grid container spacing={2}>

                            <Grid item md={3} xs={12} sm={12} >
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Company</Typography>
                                    <Typography>{AttendanceList?.company}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12} >
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Branch</Typography>
                                    <Typography>{AttendanceList?.branch}</Typography>
                                </FormControl>
                            </Grid>
                            {AttendanceList?.column &&
                                <>
                                    <Grid item md={3} xs={12} sm={12} >
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6">Shift date</Typography>
                                            <Typography>{AttendanceList?.[AttendanceList?.column][0]?.shiftdate}</Typography>
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12} >
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6">Shift Type</Typography>
                                            <Typography>{AttendanceList?.[AttendanceList?.column][0]?.shifttype}</Typography>
                                        </FormControl>
                                    </Grid>
                                </>
                            }
                            <Grid item md={12} xs={12} sm={12} >
                                <Typography variant="h6">Exit Report</Typography>
                                <br />
                                <Grid item md={12} xs={12} sm={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <Box>
                                        {isUserRoleCompare?.includes("excelbiometricbranchwiseexitreport") && (
                                            <>
                                                <ExportXL csvData={applyData} fileName={fileName} />
                                            </>
                                        )}
                                        {isUserRoleCompare?.includes("csvbiometricbranchwiseexitreport") && (
                                            <>
                                                <ExportCSV csvData={applyData} fileName={fileName} />
                                            </>
                                        )}
                                        {isUserRoleCompare?.includes("printbiometricbranchwiseexitreport") && (
                                            <>
                                                <Button sx={userStyle.buttongrp} onClick={handleprintPopUp}>
                                                    &ensp;
                                                    <FaPrint />
                                                    &ensp;Print&ensp;
                                                </Button>
                                            </>
                                        )}
                                        {isUserRoleCompare?.includes("pdfbiometricbranchwiseexitreport") && (
                                            <>
                                                <Button sx={userStyle.buttongrp} onClick={() => downloadPdf()}>
                                                    <FaFilePdf />
                                                    &ensp;Export to PDF&ensp;
                                                </Button>
                                            </>
                                        )}
                                        {isUserRoleCompare?.includes("imagebiometricbranchwiseexitreport") && (
                                            <Button sx={userStyle.buttongrp} onClick={handleCaptureImagePopUp}>
                                                {" "}
                                                <ImageIcon sx={{ fontSize: "15px" }} /> &ensp;Image&ensp;{" "}
                                            </Button>
                                        )}
                                    </Box>
                                </Grid>

                                <br />
                                <div style={{ maxHeight: "400px", overflowY: "auto", overflowX: "auto" }}>

                                    <Table aria-label="customized table" id="usertable" ref={componentRefPopUp}>
                                        <TableHead>
                                            <StyledTableRow>
                                                <StyledTableCell style={tableHeadCellStyle}>{"Sno"}</StyledTableCell>
                                                <StyledTableCell style={tableHeadCellStyle}>{"Shift Date"}</StyledTableCell>
                                                <StyledTableCell style={tableHeadCellStyle}>{"User Name"}</StyledTableCell>
                                                <StyledTableCell style={tableHeadCellStyle}>{"Company Name"}</StyledTableCell>
                                                <StyledTableCell style={tableHeadCellStyle}>{"Emp Code"}</StyledTableCell>
                                                <StyledTableCell style={tableHeadCellStyle}>{"Shift Time"}</StyledTableCell>
                                                {AttendanceList?.column === "usersIN" ?
                                                    <>
                                                        <StyledTableCell style={tableHeadCellStyle}> {"In Time"}</StyledTableCell>
                                                        <StyledTableCell style={tableHeadCellStyle}> {"Verfied IN Device"}</StyledTableCell>
                                                        <StyledTableCell style={tableHeadCellStyle}> {"Verfied By(IN)"}</StyledTableCell>
                                                    </>
                                                    :
                                                    <>
                                                        <StyledTableCell style={tableHeadCellStyle}> {"In Time"}</StyledTableCell>
                                                        <StyledTableCell style={tableHeadCellStyle}> {"Verfied IN Device"}</StyledTableCell>
                                                        <StyledTableCell style={tableHeadCellStyle}> {"Verfied By(IN)"}</StyledTableCell>
                                                        <StyledTableCell style={tableHeadCellStyle}> {"Out Time"}</StyledTableCell>
                                                        <StyledTableCell style={tableHeadCellStyle}> {"Verfied OUT Device"}</StyledTableCell>
                                                        <StyledTableCell style={tableHeadCellStyle}> {"Verfied By(OUT)"}</StyledTableCell>
                                                        <StyledTableCell style={tableHeadCellStyle}> {"Total Hours (hh:mm:ss)"}</StyledTableCell>
                                                    </>
                                                }
                                                {/* <StyledTableCell style={tableHeadCellStyle}> {"Biometric Common Name"}</StyledTableCell> */}
                                            </StyledTableRow>
                                        </TableHead>
                                        <TableBody>
                                            {AttendanceList?.[AttendanceList?.column]?.map((item, i) => (
                                                <StyledTableRow>
                                                    <StyledTableCell style={tableBodyCellStyle}>{i + 1}.</StyledTableCell>
                                                    <StyledTableCell style={tableBodyCellStyle}> {item.shiftdate}</StyledTableCell>
                                                    <StyledTableCell style={tableBodyCellStyle}> {item.staffNameC}</StyledTableCell>
                                                    <StyledTableCell style={tableBodyCellStyle}> {item.companyname}</StyledTableCell>
                                                    <StyledTableCell style={tableBodyCellStyle}> {item.empcode}</StyledTableCell>
                                                    <StyledTableCell style={tableBodyCellStyle}> {item.shift}</StyledTableCell>
                                                    {AttendanceList?.column === "usersIN" ?
                                                        <>
                                                            <StyledTableCell style={tableBodyCellStyle}> {item.inTime}</StyledTableCell>
                                                            <StyledTableCell style={tableBodyCellStyle}> {item.inTimeVerifiedDevice}</StyledTableCell>
                                                            <StyledTableCell style={tableBodyCellStyle}> {item.inTimeVerified}</StyledTableCell>
                                                        </>
                                                        :
                                                        <>
                                                            <StyledTableCell style={tableBodyCellStyle}> {item.inTime}</StyledTableCell>
                                                            <StyledTableCell style={tableBodyCellStyle}> {item.inTimeVerifiedDevice}</StyledTableCell>
                                                            <StyledTableCell style={tableBodyCellStyle}> {item.inTimeVerified}</StyledTableCell>
                                                            <StyledTableCell style={tableBodyCellStyle}> {item.outTime}</StyledTableCell>
                                                            <StyledTableCell style={tableBodyCellStyle}> {item.outTimeVerifiedDevice}</StyledTableCell>
                                                            <StyledTableCell style={tableBodyCellStyle}> {item.outTimeVerified}</StyledTableCell>
                                                            <StyledTableCell style={tableBodyCellStyle}> {item.totalHours}</StyledTableCell>
                                                        </>
                                                    }
                                                    {/* <StyledTableCell style={tableBodyCellStyle}> {item.biometriccommonname}</StyledTableCell> */}
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Grid>
                        </Grid>
                        <br /> <br />  <br />
                        <Grid container spacing={2}>
                            <Button sx={buttonStyles.btncancel} onClick={handleCloseAttendanceList}> Back </Button>
                        </Grid>
                    </>
                </Box>
            </Dialog>
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
                filteredDataTwo={(filteredChanges !== null ? filteredRowData : rowDataTable) ?? []}
                itemsTwo={meetingArray ?? []}
                filename={"Biometric Branch Wise Exit Report"}
                exportColumnNames={exportColumnNamescrt}
                exportRowValues={exportRowValuescrt}
                componentRef={componentRef}
            />

        </Box>
    );
}
export default BiometricBranchWiseExitReport;