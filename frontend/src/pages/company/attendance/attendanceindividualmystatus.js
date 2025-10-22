import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from "react";
import { FaFileExcel, FaFileCsv, FaPrint, FaFilePdf, FaSearch } from 'react-icons/fa';
import { Box, Typography, OutlinedInput, TableCell, Select, MenuItem, Dialog, DialogContent, DialogActions, FormControl, Grid, Button, Popover, IconButton, InputAdornment, Tooltip } from "@mui/material";
import { userStyle } from "../../../pageStyle";
import Selects from "react-select";
import { handleApiError } from "../../../components/Errorhandling";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import { SERVICE } from "../../../services/Baseservice";
import { useReactToPrint } from "react-to-print";
import { UserRoleAccessContext } from "../../../context/Appcontext";
import { AuthContext } from "../../../context/Appcontext";
import Headtitle from "../../../components/Headtitle";
import { ThreeDots } from "react-loader-spinner";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ImageIcon from "@mui/icons-material/Image";
import { saveAs } from "file-saver";
import moment from 'moment';
import { IoMdOptions } from "react-icons/io";
import { MdClose } from "react-icons/md";
import domtoimage from 'dom-to-image';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import ExportData from "../../../components/ExportData";
import MessageAlert from "../../../components/MessageAlert";
import PageHeading from "../../../components/PageHeading";
import AlertDialog from "../../../components/Alert";
import AdvancedSearchBar from '../../../components/SearchbarEbList.js';
import ManageColumnsContent from "../../../components/ManageColumn";
import ResizeObserver from 'resize-observer-polyfill';
window.ResizeObserver = ResizeObserver;

function AttendanceIndividualMyStatus() {

    const gridRefTableAttMyStatus = useRef(null);
    const gridRefImageAttMyStatus = useRef(null);

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + "-" + mm + "-" + dd;

    const { isUserRoleCompare, isUserRoleAccess, listPageAccessMode, pageName, setPageName, buttonStyles, } = useContext(UserRoleAccessContext);
    const { auth } = useContext(AuthContext);

    const [attStatus, setAttStatus] = useState([]);
    const [userShifts, setUserShifts] = useState([]);
    const [items, setItems] = useState([]);
    const [showAlert, setShowAlert] = useState();
    const [loader, setLoader] = useState(true);
    const [attStatusOption, setAttStatusOption] = useState([]);
    const [attModearr, setAttModearr] = useState([]);
    const [filterUser, setFilterUser] = useState({ fromdate: today, todate: today, });

    // State to track advanced filter
    const [advancedFilter, setAdvancedFilter] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [columnApi, setColumnApi] = useState(null);
    const [filteredDataItems, setFilteredDataItems] = useState(userShifts);
    const [filteredRowData, setFilteredRowData] = useState([]);

    // Datatable
    const [pageAttMyStatus, setPageAttMyStatus] = useState(1);
    const [pageSizeAttMyStatus, setPageSizeAttMyStatus] = useState(10);
    const [searchQueryAttMyStatus, setSearchQueryAttMyStatus] = useState("");
    const [totalPagesAttMyStatus, setTotalPagesAttMyStatus] = useState("");

    // Error Popup model
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const handleClickOpenerr = () => { setIsErrorOpen(true); };
    const handleCloseerr = () => { setIsErrorOpen(false); };

    // Exports
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

    const [openPopup, setOpenPopup] = useState(false);
    const [popupContent, setPopupContent] = useState("");
    const [popupSeverity, setPopupSeverity] = useState("");
    const handleClickOpenPopup = () => { setOpenPopup(true); };
    const handleClosePopup = () => { setOpenPopup(false); }

    // page refersh reload
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

    // Manage Columns
    const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [searchQueryManage, setSearchQueryManage] = useState("");
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

    // Search bar
    const [anchorElSearchAttMyStatus, setAnchorElSearchAttMyStatus] = React.useState(null);
    const handleClickSearchAttMyStatus = (event) => {
        setAnchorElSearchAttMyStatus(event.currentTarget);
    };
    const handleCloseSearchAttMyStatus = () => {
        setAnchorElSearchAttMyStatus(null);
        setSearchQueryAttMyStatus("");
    };

    const openSearchAttMyStatus = Boolean(anchorElSearchAttMyStatus);
    const idSearchAttMyStatus = openSearchAttMyStatus ? 'simple-popover' : undefined;

    const [selectedMode, setSelectedMode] = useState("Today");
    const mode = [
        { label: "Today", value: "Today" },
        { label: "Yesterday", value: "Yesterday" },
        { label: "Last Week", value: "Last Week" },
        { label: "Last Month", value: "Last Month" },
        { label: "Custom", value: "Custom" }
    ]

    // Table row color
    const getRowStyle = (params) => {
        if (params.node.rowIndex % 2 === 0) {
            return { background: '#f0f0f0' }; // Even row
        } else {
            return { background: '#ffffff' }; // Odd row
        }
    }

    // Show All Columns & Manage Columns
    const initialColumnVisibilityAttMyStatus = {
        serialNumber: true,
        company: true,
        branch: true,
        unit: true,
        department: true,
        empcode: true,shiftMode:true,
        shift: true,
        clockin: true,
        clockout: true,
        clockinstatus: true,
        clockoutstatus: true,
        date: true,
        bookby: true,
    };
    const [columnVisibilityAttMyStatus, setColumnVisibilityAttMyStatus] = useState(initialColumnVisibilityAttMyStatus);

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
            pagename: String("My Attendance Status"),
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

    //get all Sub vendormasters.
    const fetchAttedanceStatus = async () => {
        setPageName(!pageName)
        try {
            let res_vendor = await axios.get(SERVICE.ATTENDANCE_STATUS, {
                headers: {
                    'Authorization': `Bearer ${auth.APIToken}`
                }
            });
            setAttStatus(res_vendor?.data?.attendancestatus);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    }

    useEffect(() => {
        fetchAttedanceStatus();
    }, [])

    const getattendancestatus = (alldata) => {
        let result = attStatus.filter((data, index) => {
            return data?.clockinstatus === alldata?.clockinstatus && data?.clockoutstatus === alldata?.clockoutstatus
        })

        return result[0]?.name
    }

    const getAttModePaidPresent = (rowdaystatus) => {
        let result = attModearr.filter((data, index) => {
            return data?.name === rowdaystatus
        })
        return result[0]?.paidleave === true ? 'YES' : 'No';
    }

    const getAttModePaidPresentType = (rowdaystatus) => {
        let result = attModearr.filter((data, index) => {
            return data?.name === rowdaystatus
        })
        return result[0]?.paidleavetype;
    }

    const getFinalPaid = (rowpaid, rowpaidtype) => {
        return (rowpaidtype === undefined || rowpaidtype === "") ? rowpaid : (rowpaid + ' - ' + rowpaidtype);
    }

    // get week for month's start to end
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

    const fetchFilteredUsersStatus = async () => {
        setPageName(!pageName)
        setItems([]);
        setLoader(false);
        setPageAttMyStatus(1);
        setPageSizeAttMyStatus(10);

        let startMonthDate = new Date(filterUser.fromdate);
        let endMonthDate = new Date(filterUser.todate);

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
            let res = await axios.post(SERVICE.USER_CLOCKIN_CLOCKOUT_STATUS_MYINDVL, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                userDates: daysArray,
                username: isUserRoleAccess?.companyname,
                empcode: isUserRoleAccess?.empcode,
            });

            let filtered = res?.data?.finaluser.filter(d => {
                const [day, month, year] = d.rowformattedDate.split("/");
                const formattedDate = new Date(`${year}-${month}-${day}`);

                const dojDate = new Date(d.doj);
                if (d.doj && d.doj != "") {
                    return (
                        formattedDate >= dojDate
                    )
                }
                else {
                    return d
                }
            })

            const result = filtered.filter((item) => item !== null);
            setUserShifts(result);
            setSearchQueryAttMyStatus("");
            setLoader(true);
        } catch (err) { setLoader(true); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    const fetchFilteredUsersStatusForExports = async () => {
        let startMonthDate = new Date(filterUser.fromdate);
        let endMonthDate = new Date(filterUser.todate);

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
            let res = await axios.post(SERVICE.USER_CLOCKIN_CLOCKOUT_STATUS_MYINDVL, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                userDates: daysArray,
                username: isUserRoleAccess?.companyname,
                empcode: isUserRoleAccess?.empcode,
            });

            let filtered = res?.data?.finaluser.filter(d => {
                const [day, month, year] = d.rowformattedDate.split("/");
                const formattedDate = new Date(`${year}-${month}-${day}`);

                const dojDate = new Date(d.doj);
                if (d.doj && d.doj != "") {
                    return (
                        formattedDate >= dojDate
                    )
                }
                else {
                    return d
                }
            })

            const result = filtered.filter((item) => item !== null);
            setUserShifts(result);
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (filterUser.fromdate == "" && filterUser.todate == "") {
            setPopupContentMalert("Please Select From/To Date");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else {
            fetchFilteredUsersStatus();
        }
    };

    const handleClear = async (e) => {
        e.preventDefault();
        setFilterUser({ fromdate: today, todate: today, });
        setSelectedMode("Today");
        setUserShifts([]);
        setItems([]);
        setPageAttMyStatus(1);
        setPopupContent("Cleared Successfully");
        setPopupSeverity("success");
        handleClickOpenPopup();
    };

    const fetchAttMode = async () => {
        setPageName(!pageName)
        try {
            let res_freq = await axios.get(SERVICE.ATTENDANCE_MODE_STATUS, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setAttModearr(res_freq?.data?.allattmodestatus);
            let result = res_freq?.data?.allattmodestatus.filter((data, index) => {
                return data.appliedthrough != "Auto";
            });

            setAttStatusOption(result.map((d) => d.name));
        } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    useEffect(() => {
        fetchAttMode();
    }, []);

    //serial no for listing items
    const addSerialNumber = async () => {
        if (!userShifts || userShifts.length === 0) {
            console.log("User shifts data is empty or undefined.");
            return;
        }

        let res_applyleave = await axios.post(SERVICE.APPLYLEAVE_APPROVED, {
            headers: {
                Authorization: `Bearer ${auth.APIToken}`,
            },
            status: String("Approved"),
        });

        let leaveresult = res_applyleave?.data?.applyleaves;

        let countByEmpcodeClockin = {}; // Object to store count for each empcode
        let countByEmpcodeClockout = {};

        const itemsWithSerialNumber = userShifts?.map((item, index) => {
            // Initialize count for empcode if not already present
            if (!countByEmpcodeClockin[item.empcode]) {
                countByEmpcodeClockin[item.empcode] = 1;
            }
            if (!countByEmpcodeClockout[item.empcode]) {
                countByEmpcodeClockout[item.empcode] = 1;
            }

            // Adjust clockinstatus based on lateclockincount
            let updatedClockInStatus = item.clockinstatus;
            // Adjust clockoutstatus based on earlyclockoutcount
            let updatedClockOutStatus = item.clockoutstatus;

            // Filter out only 'Absent' items for the current employee
            const absentItems = userShifts?.filter(d => d.clockinstatus === 'Absent' && item.empcode === d.empcode && d.clockin === '00:00:00' && d.clockout === '00:00:00');

            // Check if the day before and after a 'Week Off' date is marked as 'Leave' or 'Absent'
            if (item.clockinstatus === 'Week Off' && item.clockoutstatus === 'Week Off') {
                // Define the date format for comparison
                const itemDate = moment(item.rowformattedDate, "DD/MM/YYYY");

                const isPreviousDayLeave = leaveresult.some(leaveItem => moment(leaveItem.date, "DD/MM/YYYY").isSame(itemDate.clone().subtract(1, 'days'), 'day') && leaveItem.empcode === item.empcode);
                const isPreviousDayAbsent = absentItems.some(absentItem => moment(absentItem.rowformattedDate, "DD/MM/YYYY").isSame(itemDate.clone().subtract(1, 'days'), 'day'));

                const isNextDayLeave = leaveresult.some(leaveItem => moment(leaveItem.date, "DD/MM/YYYY").isSame(itemDate.clone().add(1, 'days'), 'day') && leaveItem.empcode === item.empcode);
                const isNextDayAbsent = absentItems.some(absentItem => moment(absentItem.rowformattedDate, "DD/MM/YYYY").isSame(itemDate.clone().add(1, 'days'), 'day'));

                if (isPreviousDayLeave) {
                    updatedClockInStatus = 'BeforeWeekOffLeave';
                    updatedClockOutStatus = 'BeforeWeekOffLeave';
                }
                if (isPreviousDayAbsent) {
                    updatedClockInStatus = 'BeforeWeekOffAbsent';
                    updatedClockOutStatus = 'BeforeWeekOffAbsent';
                }
                if (isNextDayLeave) {
                    updatedClockInStatus = 'AfterWeekOffLeave';
                    updatedClockOutStatus = 'AfterWeekOffLeave';
                }
                if (isNextDayAbsent) {
                    updatedClockInStatus = 'AfterWeekOffAbsent';
                    updatedClockOutStatus = 'AfterWeekOffAbsent';
                }
            }

            // Check if 'Late - ClockIn' count exceeds the specified limit
            if (updatedClockInStatus === 'Late - ClockIn') {
                updatedClockInStatus = `${countByEmpcodeClockin[item.empcode]}Late - ClockIn`;
                countByEmpcodeClockin[item.empcode]++; // Increment count for current empcode
            }
            // Check if 'Early - ClockOut' count exceeds the specified limit
            if (updatedClockOutStatus === 'Early - ClockOut') {
                updatedClockOutStatus = `${countByEmpcodeClockout[item.empcode]}Early - ClockOut`;
                countByEmpcodeClockout[item.empcode]++; // Increment count for current empcode
            }

            return {
                ...item,
                serialNumber: index + 1,
                clockinstatus: updatedClockInStatus,
                clockoutstatus: updatedClockOutStatus,
            };
        });
        let finaldata = itemsWithSerialNumber.map((item) => {
            return {
                ...item,
                id: item.id,
                bookby: item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item),
                paidpresentbefore: getAttModePaidPresent(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
                paidleavetype: getAttModePaidPresentType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
                paidpresent: getFinalPaid(
                    getAttModePaidPresent(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
                    getAttModePaidPresentType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item))
                ),
            }
        })
        const weekOption = ['BeforeWeekOffAbsent', 'AfterWeekOffAbsent', 'BeforeWeekOffLeave', 'AfterWeekOffLeave'];
        finaldata.forEach((item, index, array) => {
            if (attStatusOption.includes(item.bookby) && item.clockin === "00:00:00" && item.clockout === "00:00:00" && item.paidpresent === "YES - Full Day") {
                const previousItem = array[index - 1];
                const nextItem = array[index + 1];

                const hasRelevantStatus = (entry) => entry && (weekOption.includes(entry.clockinstatus) || weekOption.includes(entry.clockoutstatus) && entry.shift === "Week Off");

                if (hasRelevantStatus(previousItem)) {
                    previousItem.clockinstatus = 'Week Off';
                    previousItem.clockoutstatus = 'Week Off';
                    previousItem.attendanceauto = getattendancestatus(previousItem);
                    previousItem.bookby = previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem);
                    previousItem.paidpresentbefore = getAttModePaidPresent(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem));
                    previousItem.paidleavetype = getAttModePaidPresentType(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem));
                    previousItem.paidpresent = getFinalPaid(
                        getAttModePaidPresent(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem)),
                        getAttModePaidPresentType(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem))
                    );
                }
                if (hasRelevantStatus(nextItem)) {
                    console.log(nextItem.bookby, 'bef')
                    nextItem.clockinstatus = 'Week Off';
                    nextItem.clockoutstatus = 'Week Off';
                    nextItem.attendanceauto = getattendancestatus(nextItem);
                    nextItem.bookby = nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem);
                    nextItem.paidpresentbefore = getAttModePaidPresent(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem));
                    nextItem.paidleavetype = getAttModePaidPresentType(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem));
                    nextItem.paidpresent = getFinalPaid(
                        getAttModePaidPresent(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem)),
                        getAttModePaidPresentType(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem))
                    );
                }
            }
        })
        setItems(finaldata);
        setFilteredDataItems(finaldata);
    };

    useEffect(() => {
        addSerialNumber();
    }, [userShifts]);

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
        if (gridRefTableAttMyStatus.current) {
            const gridApi = gridRefTableAttMyStatus.current.api;
            const currentPage = gridApi.paginationGetCurrentPage() + 1;
            const totalPagesAttMyStatus = gridApi.paginationGetTotalPages();
            setPageAttMyStatus(currentPage);
            setTotalPagesAttMyStatus(totalPagesAttMyStatus);
        }
    }, []);

    const columnDataTableAttMyStatus = [
        { field: "serialNumber", headerName: "SNo", flex: 0, width: 80, hide: !columnVisibilityAttMyStatus.serialNumber, headerClassName: "bold-header", pinned: 'left', lockPinned: true, },
        { field: "date", headerName: "Date", flex: 0, width: 200, hide: !columnVisibilityAttMyStatus.date, headerClassName: "bold-header", pinned: 'left', lockPinned: true, },
        { field: "shiftMode", headerName: "ShiftMode", flex: 0, width: 220, hide: !columnVisibilityAttMyStatus.shiftMode, headerClassName: "bold-header", pinned: 'left', lockPinned: true, },
        { field: "shift", headerName: "Shift", flex: 0, width: 220, hide: !columnVisibilityAttMyStatus.shift, headerClassName: "bold-header", pinned: 'left', lockPinned: true, },
        { field: "clockin", headerName: "ClockIn", flex: 0, width: 230, hide: !columnVisibilityAttMyStatus.clockin, headerClassName: "bold-header", },
        {
            field: "clockinstatus", headerName: "ClockInStatus", flex: 0, width: 230, hide: !columnVisibilityAttMyStatus.clockinstatus, headerClassName: "bold-header",
            cellRenderer: (params) => {
                return (
                    <Grid sx={{ display: 'flex' }}>
                        <Button size="small"
                            sx={{
                                marginTop: '10px',
                                textTransform: 'capitalize',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                fontFamily: 'Roboto,"Helvetica","Arial",sans-serif',
                                fontWeight: '400',
                                fontSize: '0.575rem',
                                lineHeight: '1.43',
                                letterSpacing: '0.01071em',
                                display: 'flex',
                                padding: params.data.clockinstatus === 'BeforeWeekOffAbsent' ? '3px 5px' : '3px 8px',
                                cursor: 'default',
                                color: (params.data.clockinstatus === 'Present' || params.data.clockinstatus === 'Early - ClockIn') ? 'black' : params.data.clockinstatus === 'Holiday' ? 'black' : params.data.clockinstatus === 'Leave' ? 'white' : params.data.clockinstatus === 'Absent' ? '#462929' : params.data.clockinstatus === 'Week Off' ? 'white' : params.data.clockinstatus === 'Grace - ClockIn' ? '#052106' : params.data.clockinstatus === 'On - Present' ? 'black' : params.data.clockinstatus === 'HBLOP' ? 'white' : params.data.clockinstatus === 'FLOP' ? 'white' : params.data.clockinstatus === 'AfterWeekOffAbsent' ? 'black' : params.data.clockinstatus === 'BeforeWeekOffAbsent' ? 'black' : params.data.clockinstatus === 'Late - ClockIn' ? '#15111d' : '#15111d',
                                backgroundColor: (params.data.clockinstatus === 'Present' || params.data.clockinstatus === 'Early - ClockIn') ? 'rgb(156 239 156)' : params.data.clockinstatus === 'Holiday' ? '#B6FFFA' : params.data.clockinstatus === 'Leave' ? '#1640D6' : params.data.clockinstatus === "Absent" ? '#ff00007d' : params.data.clockinstatus === 'Week Off' ? '#6b777991' : params.data.clockinstatus === 'Grace - ClockIn' ? 'rgb(243 203 117)' : params.data.clockinstatus === 'On - Present' ? '#E1AFD1' : params.data.clockinstatus === 'HBLOP' ? '#DA0C81' : params.data.clockinstatus === 'FLOP' ? '#FE0000' : params.data.clockinstatus === 'AfterWeekOffAbsent' ? '#F2D1D1' : params.data.clockinstatus === 'BeforeWeekOffAbsent' ? '#EEE3CB' : params.data.clockinstatus === 'Late - ClockIn' ? '#610c9f57' : '#610c9f57',
                                '&:hover': {
                                    color: (params.data.clockinstatus === 'Present' || params.data.clockinstatus === 'Early - ClockIn') ? 'black' : params.data.clockinstatus === 'Holiday' ? 'black' : params.data.clockinstatus === 'Leave' ? 'white' : params.data.clockinstatus === 'Absent' ? '#462929' : params.data.clockinstatus === 'Week Off' ? 'white' : params.data.clockinstatus === 'Grace - ClockIn' ? '#052106' : params.data.clockinstatus === 'On - Present' ? 'black' : params.data.clockinstatus === 'HBLOP' ? 'white' : params.data.clockinstatus === 'FLOP' ? 'white' : params.data.clockinstatus === 'AfterWeekOffAbsent' ? 'black' : params.data.clockinstatus === 'BeforeWeekOffAbsent' ? 'black' : params.data.clockinstatus === 'Late - ClockIn' ? '#15111d' : '#15111d',
                                    backgroundColor: (params.data.clockinstatus === 'Present' || params.data.clockinstatus === 'Early - ClockIn') ? 'rgb(156 239 156)' : params.data.clockinstatus === 'Holiday' ? '#B6FFFA' : params.data.clockinstatus === 'Leave' ? '#1640D6' : params.data.clockinstatus === "Absent" ? '#ff00007d' : params.data.clockinstatus === 'Week Off' ? '#6b777991' : params.data.clockinstatus === 'Grace - ClockIn' ? 'rgb(243 203 117)' : params.data.clockinstatus === 'On - Present' ? '#E1AFD1' : params.data.clockinstatus === 'HBLOP' ? '#DA0C81' : params.data.clockinstatus === 'FLOP' ? '#FE0000' : params.data.clockinstatus === 'AfterWeekOffAbsent' ? '#F2D1D1' : params.data.clockinstatus === 'BeforeWeekOffAbsent' ? '#EEE3CB' : params.data.clockinstatus === 'Late - ClockIn' ? '#610c9f57' : '#610c9f57',
                                }
                            }}
                        >
                            {params.data.clockinstatus}
                        </Button>
                    </Grid >
                );
            },
        },
        { field: "clockout", headerName: "ClockOut", flex: 0, width: 230, hide: !columnVisibilityAttMyStatus.clockout, headerClassName: "bold-header", },
        {
            field: "clockoutstatus", headerName: "ClockOutStatus", flex: 0, width: 230, hide: !columnVisibilityAttMyStatus.clockoutstatus, headerClassName: "bold-header",
            cellRenderer: (params) => {
                return (
                    <Grid sx={{ display: 'flex' }}>
                        <Button size="small"
                            sx={{
                                marginTop: '10px',
                                textTransform: 'capitalize',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                fontFamily: 'Roboto,"Helvetica","Arial",sans-serif',
                                fontWeight: '400',
                                fontSize: '0.575rem',
                                lineHeight: '1.43',
                                letterSpacing: '0.01071em',
                                display: 'flex',
                                padding: params.data.clockoutstatus === 'BeforeWeekOffAbsent' ? '3px 5px' : '3px 8px',
                                cursor: 'default',
                                color: params.data.clockoutstatus === 'Holiday' ? 'black' : params.data.clockoutstatus === 'Leave' ? 'white' : params.data.clockoutstatus === 'Absent' ? '#462929' : params.data.clockoutstatus === 'Week Off' ? 'white' : params.data.clockoutstatus === 'On - ClockOut' ? 'black' : params.data.clockoutstatus === 'Over - ClockOut' ? '#052106' : params.data.clockoutstatus === 'Mis - ClockOut' ? '#15111d' : params.data.clockoutstatus === 'Early - ClockOut' ? '#052106' : params.data.clockoutstatus === 'HBLOP' ? 'white' : params.data.clockoutstatus === 'FLOP' ? 'white' : params.data.clockoutstatus === 'AfterWeekOffAbsent' ? 'black' : params.data.clockoutstatus === 'BeforeWeekOffAbsent' ? 'black' : params.data.clockoutstatus === 'Pending' ? '#052106' : '#052106',
                                backgroundColor: params.data.clockoutstatus === 'Holiday' ? '#B6FFFA' : params.data.clockoutstatus === 'Leave' ? '#1640D6' : params.data.clockoutstatus === "Absent" ? '#ff00007d' : params.data.clockoutstatus === 'Week Off' ? '#6b777991' : params.data.clockoutstatus === 'On - ClockOut' ? '#E1AFD1' : params.data.clockoutstatus === 'Over - ClockOut' ? 'rgb(156 239 156)' : params.data.clockoutstatus === 'Mis - ClockOut' ? '#610c9f57' : params.data.clockoutstatus === 'Early - ClockOut' ? 'rgb(243 203 117)' : params.data.clockoutstatus === 'HBLOP' ? '#DA0C81' : params.data.clockoutstatus === 'FLOP' ? '#FE0000' : params.data.clockoutstatus === 'AfterWeekOffAbsent' ? '#F2D1D1' : params.data.clockoutstatus === 'BeforeWeekOffAbsent' ? '#EEE3CB' : params.data.clockoutstatus === 'Pending' ? 'rgb(243 203 117)' : 'rgb(243 203 117)',
                                '&:hover': {
                                    color: params.data.clockoutstatus === 'Holiday' ? 'black' : params.data.clockoutstatus === 'Leave' ? 'white' : params.data.clockoutstatus === 'Absent' ? '#462929' : params.data.clockoutstatus === 'Week Off' ? 'white' : params.data.clockoutstatus === 'On - ClockOut' ? 'black' : params.data.clockoutstatus === 'Over - ClockOut' ? '#052106' : params.data.clockoutstatus === 'Mis - ClockOut' ? '#15111d' : params.data.clockoutstatus === 'Early - ClockOut' ? '#052106' : params.data.clockoutstatus === 'HBLOP' ? 'white' : params.data.clockoutstatus === 'FLOP' ? 'white' : params.data.clockoutstatus === 'AfterWeekOffAbsent' ? 'black' : params.data.clockoutstatus === 'BeforeWeekOffAbsent' ? 'black' : params.data.clockoutstatus === 'Pending' ? '#052106' : '#052106',
                                    backgroundColor: params.data.clockoutstatus === 'Holiday' ? '#B6FFFA' : params.data.clockoutstatus === 'Leave' ? '#1640D6' : params.data.clockoutstatus === "Absent" ? '#ff00007d' : params.data.clockoutstatus === 'Week Off' ? '#6b777991' : params.data.clockoutstatus === 'On - ClockOut' ? '#E1AFD1' : params.data.clockoutstatus === 'Over - ClockOut' ? 'rgb(156 239 156)' : params.data.clockoutstatus === 'Mis - ClockOut' ? '#610c9f57' : params.data.clockoutstatus === 'Early - ClockOut' ? 'rgb(243 203 117)' : params.data.clockoutstatus === 'HBLOP' ? '#DA0C81' : params.data.clockoutstatus === 'FLOP' ? '#FE0000' : params.data.clockoutstatus === 'AfterWeekOffAbsent' ? '#F2D1D1' : params.data.clockoutstatus === 'BeforeWeekOffAbsent' ? '#EEE3CB' : params.data.clockoutstatus === 'Pending' ? 'rgb(243 203 117)' : 'rgb(243 203 117)',
                                }
                            }}
                        >
                            {params.data.clockoutstatus}
                        </Button>
                    </Grid>
                );
            },
        },
        {
            field: "bookby", headerName: "Day Status", flex: 0, width: 230, hide: !columnVisibilityAttMyStatus.bookby, headerClassName: "bold-header",
            cellRenderer: (params) => {
                return (
                    <TableCell>
                        <Button size="small"
                            sx={{
                                textTransform: 'capitalize',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                fontFamily: 'Roboto,"Helvetica","Arial",sans-serif',
                                fontWeight: '400',
                                fontSize: '0.575rem',
                                lineHeight: '1.43',
                                letterSpacing: '0.01071em',
                                display: 'flex',
                                padding: '3px 8px',
                                cursor: 'default',
                                color: '#052106',
                                backgroundColor: 'rgb(156 239 156)',
                                '&:hover': { backgroundColor: 'rgb(156 239 156)', color: '#052106', }
                            }}
                        >
                            {params.data.bookby}
                        </Button>
                    </TableCell >
                );
            },
        },
    ];

    //Datatable
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQueryAttMyStatus(value);
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
        setPageAttMyStatus(1);
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

        setFilteredDataItems(filtered);
        setAdvancedFilter(filters);
        // handleCloseSearchAttMyStatus(); 
    };

    // Undo filter funtion
    const handleResetSearch = () => {
        setAdvancedFilter(null);
        setSearchQueryAttMyStatus("");
        setFilteredDataItems(userShifts);
    };

    // Show filtered combination in the search bar
    const getSearchDisplay = () => {
        if (advancedFilter && advancedFilter.length > 0) {
            return advancedFilter.map((filter, index) => {
                let showname = columnDataTableAttMyStatus.find(col => col.field === filter.column)?.headerName;
                return `${showname} ${filter.condition} "${filter.value}"`;
            }).join(' ' + (advancedFilter.length > 1 ? advancedFilter[1].condition : '') + ' ');
        }
        return searchQueryAttMyStatus;
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPagesAttMyStatus) {
            setPageAttMyStatus(newPage);
            gridRefTableAttMyStatus.current.api.paginationGoToPage(newPage - 1);
        }
    };

    const handlePageSizeChange = (e) => {
        const newSize = Number(e.target.value);
        setPageSizeAttMyStatus(newSize);
        if (gridApi) {
            gridApi.paginationSetPageSize(newSize);
        }
    };

    // Show All Columns functionality
    const handleShowAllColumns = () => {
        const updatedVisibility = { ...columnVisibilityAttMyStatus };
        for (const columnKey in updatedVisibility) {
            updatedVisibility[columnKey] = true;
        }
        setColumnVisibilityAttMyStatus(updatedVisibility);
    };

    // Function to filter columns based on search query
    const filteredColumns = columnDataTableAttMyStatus.filter((column) =>
        column.headerName.toLowerCase().includes(searchQueryManage.toLowerCase())
    );

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

        setColumnVisibilityAttMyStatus((prevVisibility) => {
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

        setColumnVisibilityAttMyStatus((prevVisibility) => {
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
        setColumnVisibilityAttMyStatus((prevVisibility) => ({
            ...prevVisibility,
            [colId]: event.visible, // Set visibility directly from the event
        }));
    }, []);

    // Excel 
    const [fileFormat, setFormat] = useState('');
    let exportColumnNamescrt = ["Date", "ShiftMode", "Shift", "ClockIn", "ClockInStatus", "ClockOut", "ClockOutStatus", "Day Status",]
    let exportRowValuescrt = ["date", "shiftMode", "shift", "clockin", "clockinstatus", "clockout", "clockoutstatus", "bookby",]

    // print...
    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "My Attendance Status",
        pageStyle: "print",
    });

    // image
    const handleCaptureImage = () => {
        if (gridRefImageAttMyStatus.current) {
            domtoimage.toBlob(gridRefImageAttMyStatus.current)
                .then((blob) => {
                    saveAs(blob, "My Attendance Status.png");
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

        const startPage = Math.max(1, pageAttMyStatus - 1);
        const endPage = Math.min(totalPagesAttMyStatus, startPage + maxVisiblePages - 1);

        // Loop through and add visible pageAttMyStatus numbers
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        // If there are more pages after the last visible pageAttMyStatus, show ellipsis
        if (endPage < totalPagesAttMyStatus) {
            pageNumbers.push("...");
        }

        return pageNumbers;
    };

    // Pagination for outer filter
    const filteredData = filteredDataItems?.slice((pageAttMyStatus - 1) * pageSizeAttMyStatus, pageAttMyStatus * pageSizeAttMyStatus);
    const totalPagesAttMyStatusOuter = Math.ceil(filteredDataItems?.length / pageSizeAttMyStatus);
    const visiblePages = Math.min(totalPagesAttMyStatusOuter, 3);
    const firstVisiblePage = Math.max(1, pageAttMyStatus - 1);
    const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPagesAttMyStatusOuter);
    const pageNumbers = [];
    const indexOfLastItem = pageAttMyStatus * pageSizeAttMyStatus;
    const indexOfFirstItem = indexOfLastItem - pageSizeAttMyStatus;
    for (let i = firstVisiblePage; i <= lastVisiblePage; i++) { pageNumbers.push(i); }

    return (
        <Box>
            <Headtitle title={"My Attendance Status"} />
            {/* ****** Header Content ****** */}
            <PageHeading
                title="My Attendance Status"
                modulename="Human Resources"
                submodulename="HR"
                mainpagename="Attendance"
                subpagename="Attendance Individual"
                subsubpagename="My Attendance Status"
            />
            {isUserRoleCompare?.includes("lmyattendancestatus") && (
                <>
                    <Box sx={userStyle.selectcontainer}>
                        <Grid container spacing={2}>
                            <Grid item md={12} sm={12} xs={12}>
                                <Typography sx={userStyle.importheadtext}> My Attendance Status </Typography>
                            </Grid>
                            <>
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
                                <Grid item md={3} xs={12} sm={12}>
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
                                                    console.log("Please select a date on or before today.");
                                                }
                                            }}
                                            // Set the max attribute to the current date
                                            inputProps={{ max: new Date().toISOString().split("T")[0] }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={3} xs={12} sm={12}>
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
                                                    console.log("Please select a date on or before today.");
                                                }
                                            }}
                                            // Set the max attribute to the current date
                                            inputProps={{ max: new Date().toISOString().split("T")[0], min: filterUser.fromdate !== "" ? filterUser.fromdate : null }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item lg={1} md={2} sm={2} xs={6} >
                                    <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0, } })}>
                                        <Button sx={buttonStyles.buttonsubmit} variant="contained" onClick={handleSubmit} > Filter </Button>
                                    </Box>
                                </Grid>
                                <Grid item lg={1} md={2} sm={2} xs={6}>
                                    <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0, } })}>
                                        <Button sx={buttonStyles.btncancel} onClick={handleClear} > Clear </Button>
                                    </Box>
                                </Grid>
                            </>
                        </Grid>
                    </Box> <br />
                    {/* ****** Table Start ****** */}
                    <Box sx={userStyle.container}>
                        {/* ******************************************************EXPORT Buttons****************************************************** */}
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>
                                {" "}
                                My Attendance Status{" "}
                            </Typography>
                        </Grid>
                        <Grid container spacing={2} style={userStyle.dataTablestyle}>
                            <Grid item md={2} xs={12} sm={12}>
                                <Box>
                                    <label>Show entries:</label>
                                    <Select
                                        id="pageSizeSelect"
                                        value={pageSizeAttMyStatus}
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
                                        <MenuItem value={userShifts?.length}>All</MenuItem>
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
                                        "excelmyattendancestatus"
                                    ) && (
                                            <>
                                                <Button onClick={(e) => {
                                                    setIsFilterOpen(true)
                                                    setFormat("xl")
                                                }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                                            </>
                                        )}
                                    {isUserRoleCompare?.includes(
                                        "csvmyattendancestatus"
                                    ) && (
                                            <>
                                                <Button onClick={(e) => {
                                                    setIsFilterOpen(true)
                                                    setFormat("csv")
                                                }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>
                                            </>
                                        )}
                                    {isUserRoleCompare?.includes(
                                        "printmyattendancestatus"
                                    ) && (
                                            <>
                                                <Button sx={userStyle.buttongrp} onClick={handleprint}>
                                                    {" "}
                                                    &ensp; <FaPrint /> &ensp;Print&ensp;{" "}
                                                </Button>
                                            </>
                                        )}
                                    {isUserRoleCompare?.includes(
                                        "pdfmyattendancestatus"
                                    ) && (
                                            <>
                                                <Button sx={userStyle.buttongrp}
                                                    onClick={() => {
                                                        setIsPdfFilterOpen(true)
                                                    }}
                                                ><FaFilePdf />&ensp;Export to PDF&ensp;</Button>
                                            </>
                                        )}
                                    {isUserRoleCompare?.includes(
                                        "imagemyattendancestatus"
                                    ) && (
                                            <>
                                                <Button
                                                    sx={userStyle.buttongrp}
                                                    onClick={handleCaptureImage}
                                                >
                                                    {" "}
                                                    <ImageIcon sx={{ fontSize: "15px" }} />{" "}
                                                    &ensp;Image&ensp;{" "}
                                                </Button>
                                            </>
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
                                                        <IoMdOptions style={{ cursor: 'pointer', }} onClick={handleClickSearchAttMyStatus} />
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
                        </Grid> <br />
                        <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>  Show All Columns </Button>&ensp;
                        <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumns}> Manage Columns  </Button><br /> <br />
                        {!loader ? (
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
                        ) : (
                            <>
                                <Box sx={{ width: "100%", }} className={"ag-theme-quartz"} ref={gridRefImageAttMyStatus} >
                                    <AgGridReact
                                        rowData={filteredDataItems}
                                        columnDefs={columnDataTableAttMyStatus.filter((column) => columnVisibilityAttMyStatus[column.field])}
                                        ref={gridRefTableAttMyStatus}
                                        defaultColDef={defaultColDef}
                                        domLayout={"autoHeight"}
                                        getRowStyle={getRowStyle}
                                        pagination={true}
                                        paginationPageSize={pageSizeAttMyStatus}
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
                                            (filteredDataItems.length > 0 ? (pageAttMyStatus - 1) * pageSizeAttMyStatus + 1 : 0)
                                        ) : (
                                            filteredRowData.length > 0 ? (pageAttMyStatus - 1) * pageSizeAttMyStatus + 1 : 0
                                        )
                                    }{" "}to{" "}
                                    {
                                        gridApi && gridApi.getFilterModel() && Object.keys(gridApi.getFilterModel()).length === 0 ? (
                                            Math.min(pageAttMyStatus * pageSizeAttMyStatus, filteredDataItems.length)
                                        ) : (
                                            filteredRowData.length > 0 ? Math.min(pageAttMyStatus * pageSizeAttMyStatus, filteredRowData.length) : 0
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
                                    <Button onClick={() => handlePageChange(1)} disabled={pageAttMyStatus === 1} sx={userStyle.paginationbtn}  > <FirstPageIcon /> </Button>
                                    <Button onClick={() => handlePageChange(pageAttMyStatus - 1)} disabled={pageAttMyStatus === 1} sx={userStyle.paginationbtn}  > <NavigateBeforeIcon />  </Button>
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
                                                    "&:hover": {
                                                        backgroundColor: "transparent",
                                                        boxShadow: "none",
                                                    },
                                                }),
                                            }}
                                            className={pageAttMyStatus === pageNumber ? "active" : ""}
                                            disabled={pageAttMyStatus === pageNumber}
                                        >
                                            {pageNumber}
                                        </Button>
                                    ))}
                                    <Button onClick={() => handlePageChange(pageAttMyStatus + 1)} disabled={pageAttMyStatus === totalPagesAttMyStatus} sx={userStyle.paginationbtn} > <NavigateNextIcon /> </Button>
                                    <Button onClick={() => handlePageChange(totalPagesAttMyStatus)} disabled={pageAttMyStatus === totalPagesAttMyStatus} sx={userStyle.paginationbtn} ><LastPageIcon /> </Button>
                                </Box>
                            </Box> */}
                            </>
                        )}
                    </Box>
                    {/* ****** Table End ****** */}
                </>
            )}

            {/* Manage Column */}
            <Popover
                id={id}
                open={isManageColumnsOpen}
                anchorEl={anchorEl}
                onClose={handleCloseManageColumns}
                anchorOrigin={{ vertical: "bottom", horizontal: "left", }}
            >
                <ManageColumnsContent
                    handleClose={handleCloseManageColumns}
                    searchQuery={searchQueryManage}
                    setSearchQuery={setSearchQueryManage}
                    filteredColumns={filteredColumns}
                    columnVisibility={columnVisibilityAttMyStatus}
                    toggleColumnVisibility={toggleColumnVisibility}
                    setColumnVisibility={setColumnVisibilityAttMyStatus}
                    initialColumnVisibility={initialColumnVisibilityAttMyStatus}
                    columnDataTable={columnDataTableAttMyStatus}
                />
            </Popover>

            {/* Search Bar */}
            <Popover
                id={idSearchAttMyStatus}
                open={openSearchAttMyStatus}
                anchorEl={anchorElSearchAttMyStatus}
                onClose={handleCloseSearchAttMyStatus}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }}
            >
                <AdvancedSearchBar columns={columnDataTableAttMyStatus} onSearch={applyAdvancedFilter} initialSearchValue={searchQueryAttMyStatus} handleCloseSearch={handleCloseSearchAttMyStatus} />
            </Popover>

            {/* Alert  */}
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
                filteredDataTwo={(filteredRowData.length > 0 ? filteredRowData : filteredData) ?? []}
                itemsTwo={items ?? []}
                filename={"My Attendance Status"}
                exportColumnNames={exportColumnNamescrt}
                exportRowValues={exportRowValuescrt}
                componentRef={componentRef}
            />
        </Box>
    );
}

export default AttendanceIndividualMyStatus;