import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from "react";
import { FaFileExcel, FaFileCsv, FaPrint, FaFilePdf, FaSearch } from 'react-icons/fa';
import { Box, Typography, OutlinedInput, Select, Chip, MenuItem, Dialog, DialogContent, InputAdornment, DialogActions, FormControl, Grid, Button, Popover, IconButton, Tooltip } from "@mui/material";
import { userStyle, colourStyles } from "../../../pageStyle";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from 'axios';
import LoadingButton from '@mui/lab/LoadingButton';
import { SERVICE } from "../../../services/Baseservice";
import { handleApiError } from "../../../components/Errorhandling";
import { useReactToPrint } from "react-to-print";
import { UserRoleAccessContext } from "../../../context/Appcontext";
import { AuthContext } from "../../../context/Appcontext";
import Headtitle from "../../../components/Headtitle";
import { ThreeDots } from "react-loader-spinner";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { MultiSelect } from "react-multi-select-component";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ImageIcon from "@mui/icons-material/Image";
import { saveAs } from "file-saver";
import Selects from "react-select";
import moment from 'moment';
import { IoMdOptions } from "react-icons/io";
import { MdClose } from "react-icons/md";
import { getCurrentServerTime } from '../../../components/getCurrentServerTime';
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

function AttendanceModeReportList() {

    const [serverTime, setServerTime] = useState(null);
    useEffect(() => {
        const fetchTime = async () => {
            const time = await getCurrentServerTime();
            setServerTime(time);
            setFilterUser({ ...filterUser, fromdate: moment(time).format('YYYY-MM-DD'), todate: moment(time).format('YYYY-MM-DD') });
        };

        fetchTime();
    }, []);

    var today = new Date(serverTime);
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + "-" + mm + "-" + dd;

    const gridRefTableAttModeReport = useRef(null);
    const gridRefImageAttModeReport = useRef(null);
    const { isUserRoleAccess, isUserRoleCompare, isAssignBranch, allUsersLimit, alldepartment, allTeam, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);
    const { auth } = useContext(AuthContext);

    const [selectedCompany, setSelectedCompany] = useState([]);
    const [valueCompany, setValueCompany] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState([]);
    const [valueBranch, setValueBranch] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState([]);
    const [valueUnit, setValueUnit] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState([]);
    const [valueTeam, setValueTeam] = useState([]);
    const [selectedDep, setSelectedDep] = useState([]);
    const [valueDep, setValueDep] = useState([]);
    const [selectedEmp, setSelectedEmp] = useState([]);
    const [valueEmp, setValueEmp] = useState([]);
    const [attModeReport, setAttModeReport] = useState([]);
    const [attStatus, setAttStatus] = useState([]);
    const [attModearr, setAttModearr] = useState([]);
    const [attStatusOption, setAttStatusOption] = useState([]);
    const [showAlert, setShowAlert] = useState();
    const [loader, setLoader] = useState(false);
    // State to track advanced filter
    const [advancedFilter, setAdvancedFilter] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [columnApi, setColumnApi] = useState(null);
    const [filteredDataItems, setFilteredDataItems] = useState([]);
    const [filteredRowData, setFilteredRowData] = useState([]);

    const [filterUser, setFilterUser] = useState({ filtertype: "Individual", fromdate: today, todate: today, });

    // Datatable
    const [pageAttModeReport, setPageAttModeReport] = useState(1);
    const [pageSizeAttModeReport, setPageSizeAttModeReport] = useState(10);
    const [searchQueryAttModeReport, setSearchQueryAttModeReport] = useState("");
    const [totalPagesAttModeReport, setTotalPagesAttModeReport] = useState(1);

    // Error Popup model
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const handleClickOpenerr = () => { setIsErrorOpen(true); };
    const handleCloseerr = () => { setIsErrorOpen(false); };

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
    // pageAttModeReport refersh reload
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

    // pageAttModeReport refersh reload
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
    const [isManageColumnsOpenAttModeReport, setManageColumnsOpenAttModeReport] = useState(false);
    const [anchorElAttModeReport, setAnchorElAttModeReport] = useState(null);
    const [searchQueryManageAttModeReport, setSearchQueryManageAttModeReport] = useState("");
    const handleOpenManageColumnsAttModeReport = (event) => {
        setAnchorElAttModeReport(event.currentTarget);
        setManageColumnsOpenAttModeReport(true);
    };
    const handleCloseManageColumnsAttModeReport = () => {
        setManageColumnsOpenAttModeReport(false);
        setSearchQueryManageAttModeReport("");
    };
    const openManageColumnsAttModeReport = Boolean(anchorElAttModeReport);
    const idManageColumnsAttModeReport = openManageColumnsAttModeReport ? "simple-popover" : undefined;

    // Search bar
    const [anchorElSearchAttModeReport, setAnchorElSearchAttModeReport] = React.useState(null);
    const handleClickSearchAttModeReport = (event) => {
        setAnchorElSearchAttModeReport(event.currentTarget);
    };
    const handleCloseSearchAttModeReport = () => {
        setAnchorElSearchAttModeReport(null);
        setSearchQueryAttModeReport("");
    };

    const openSearchAttModeReport = Boolean(anchorElSearchAttModeReport);
    const idSearchAttModeReport = openSearchAttModeReport ? 'simple-popover' : undefined;

    const [selectedMode, setSelectedMode] = useState("Today");
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

    const modeOptions = [
        { label: 'Department', value: "Department" },
        { label: "Employee", value: "Employee" },
    ];

    // Show All Columns & Manage Columns
    const initialColumnVisibilityAttModeReport = {
        checkbox: true,
        serialNumber: true,
        empcode: true,
        username: true,
        company: true,
        branch: true,
        unit: true,
        team: true,
        department: true,
        date: true,
        shiftmode: true,
        shift: true,
        changeshift: true,
        leavestatus: true,
        permissionstatus: true,
        attendancemodeprioritystatus: true,
        clockin: true,
        clockout: true,
        clockinstatus: true,
        clockoutstatus: true,
        attendanceauto: true,
        daystatus: true,
        appliedthrough: true,
        isweekoff: true,
        isholiday: true,
        lopcalculation: true,
        modetarget: true,
        paidpresent: true,
        lopday: true,
        paidpresentday: true,
        actions: true,
    };
    const [columnVisibilityAttModeReport, setColumnVisibilityAttModeReport] = useState(initialColumnVisibilityAttModeReport);

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
            pagename: String("Attendance Mode Report"),
            commonid: String(isUserRoleAccess?._id),
            date: String(new Date(serverTime)),
            addedby: [
                {
                    name: String(isUserRoleAccess?.username),
                    // date: String(new Date(serverTime)),
                },
            ],
        });
    }

    const getDateRange = (mode) => {
        const today = new Date(serverTime);
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

    //get all Attendance Status name.
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
        fetchAttedanceStatus();
        fetchAttMode();
    }, []);

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

    // Pre select dropdowns
    useEffect(() => {
        // Remove duplicates based on the 'company' field
        const uniqueIsAssignBranch = accessbranch.reduce((acc, current) => {
            const x = acc.find(item => item.company === current.company && item.branch === current.branch && item.unit === current.unit);
            if (!x) {
                acc.push(current);
            }
            return acc;
        }, []);

        const company = [...new Set(uniqueIsAssignBranch.map(data => data.company))].map((data) => ({
            label: data,
            value: data,
        }));
        setSelectedCompany(company);
        setValueCompany(
            company.map((a, index) => {
                return a.value;
            })
        );
        const branch = uniqueIsAssignBranch?.filter(
            (val) =>
                company?.map(comp => comp.value === val.company)
        )?.map(data => ({
            label: data.branch,
            value: data.branch,
        })).filter((item, index, self) => {
            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
        })
        setSelectedBranch(branch);
        setValueBranch(
            branch.map((a, index) => {
                return a.value;
            })
        );
        const unit = uniqueIsAssignBranch?.filter(
            (val) =>
                company?.map(comp => comp.value === val.company) && branch?.map(comp => comp.value === val.branch)
        )?.map(data => ({
            label: data.unit,
            value: data.unit,
        })).filter((item, index, self) => {
            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
        })
        setSelectedUnit(unit);
        setValueUnit(
            unit.map((a, index) => {
                return a.value;
            })
        );
        // Create team options based on selected company, branch, and unit
        const team = allTeam
            ?.filter(val =>
                company.some(comp => comp.value === val.company) &&
                branch.some(br => br.value === val.branch) &&
                unit.some(uni => uni.value === val.unit)
            )
            .map(data => ({
                label: data.teamname,
                value: data.teamname,
            }));
        setSelectedTeam(team);
        setValueTeam(team.map(a => a.value));
        const allemployees = allUsersLimit
            ?.filter(val =>
                company.some(comp => comp.value === val.company) &&
                branch.some(br => br.value === val.branch) &&
                unit.some(uni => uni.value === val.unit) &&
                team.some(team => team.value === val.team)
            )
            .map(data => ({
                label: data.companyname,
                value: data.companyname,
            }));
        setSelectedEmp(allemployees);
        setValueEmp(allemployees.map(a => a.value));
    }, [isAssignBranch])

    //company multiselect
    const handleCompanyChange = (options) => {
        setValueCompany(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedCompany(options);
        setSelectedBranch([]);
        setValueBranch([]);
        setSelectedUnit([]);
        setValueUnit([]);
        setSelectedTeam([]);
        setValueTeam([]);
        setSelectedDep([]);
        setValueDep([]);
        setSelectedEmp([]);
        setValueEmp([]);
    };

    const customValueRendererCompany = (valueCompany, _categoryname) => {
        return valueCompany?.length
            ? valueCompany.map(({ label }) => label)?.join(", ")
            : "Please Select Company";
    };

    //branchto multiselect dropdown changes
    const handleBranchChange = (options) => {
        setSelectedBranch(options);
        setValueBranch(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedUnit([]);
        setValueUnit([]);
        setSelectedTeam([]);
        setValueTeam([]);
        setSelectedEmp([]);
        setValueEmp([]);
        setSelectedDep([]);
        setValueDep([]);
    };

    const customValueRendererBranch = (valueCate, _employeename) => {
        return valueCate.length
            ? valueCate.map(({ label }) => label).join(", ")
            : "Please select Branch";
    };

    // unitto multiselect dropdown changes
    const handleUnitChange = (options) => {
        setSelectedUnit(options);
        setValueUnit(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedTeam([]);
        setValueTeam([]);
        setSelectedEmp([]);
        setValueEmp([]);
    };
    const customValueRendererUnit = (valueCate, _employeename) => {
        return valueCate.length
            ? valueCate.map(({ label }) => label).join(", ")
            : "Please select Unit";
    };

    const [empLoader, setEmpLoader] = useState(false);
    //Teamto multiselect dropdown changes
    const handleTeamChange = (options) => {
        setEmpLoader(true);
        setSelectedTeam(options);
        setValueTeam(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedEmp([]);
        setValueEmp([]);
    };
    useEffect(() => {
        // If selectedTeam changes, and allUsersLimit updates accordingly
        if (selectedTeam.length > 0) {
            const filteredEmployees = allUsersLimit?.filter((comp) =>
                valueCompany?.includes(comp.company) &&
                selectedBranch?.map((data) => data.value)?.includes(comp.branch) &&
                selectedUnit?.map((data) => data.value)?.includes(comp.unit) &&
                selectedTeam?.map((data) => data.value)?.includes(comp.team)
            );

            if (filteredEmployees.length > 0) {
                setEmpLoader(false); // Employees are now ready
            }
        }
    }, [allUsersLimit, valueCompany, selectedBranch, selectedUnit, selectedTeam]);
    const customValueRendererTeam = (valueCate, _employeename) => {
        return valueCate.length
            ? valueCate.map(({ label }) => label).join(", ")
            : "Please select Team";
    };

    // Employee    
    const handleEmployeeChange = (options) => {
        setSelectedEmp(options);
        setValueEmp(
            options.map((a, index) => {
                return a.value;
            })
        );
    };

    // useEffect(() => {

    //     const handlePaste = (event) => {
    //         event.preventDefault();

    //         let pastedText = event.clipboardData.getData("text");

    //         // Normalize the pasted text
    //         pastedText = pastedText.replace(/\r?\n/g, ",");

    //         // Split by commas (not spaces)
    //         const pastedNames = pastedText
    //             .split(",")
    //             .map(name => name.replace(/\s*\.\s*/g, ".").trim())
    //             .filter(name => name !== "");

    //         // Get available options
    //         const availableOptions = allUsersLimit
    //             ?.filter(
    //                 (comp) =>
    //                     valueCompany?.includes(comp.company) &&
    //                     selectedBranch?.map(data => data.value)?.includes(comp.branch) &&
    //                     selectedUnit?.map(data => data.value)?.includes(comp.unit) &&
    //                     selectedTeam?.map(data => data.value)?.includes(comp.team)
    //             )
    //             ?.map(data => ({
    //                 label: data.companyname.replace(/\s*\.\s*/g, ".").trim(),
    //                 value: data.companyname.replace(/\s*\.\s*/g, ".").trim(),
    //             }))
    //             .filter((item, index, self) =>
    //                 self.findIndex((i) => i.label === item.label && i.value === item.value) === index
    //             );

    //         // Use Set for fast lookup
    //         const pastedSet = new Set(pastedNames);
    //         const matchedEmployees = availableOptions.filter(option => pastedSet.has(option.label));

    //         // console.log("Matched employees:", matchedEmployees);

    //         // if (matchedEmployees.length > 0) {
    //         //     setSelectedEmp(matchedEmployees);
    //         //     setValueEmp(matchedEmployees.map(emp => emp.value));
    //         // } else {
    //         //     console.warn("No matching employees found for pasted text.");
    //         // }

    //         // Update state using previous state to prevent replacement
    //         setSelectedEmp((prevUsers) => {
    //             const mergedSelection = [...prevUsers, ...matchedEmployees];
    //             const uniqueSelection = Array.from(new Map(mergedSelection.map(emp => [emp.value, emp])).values());
    //             return uniqueSelection;
    //         });

    //         setValueEmp((prevUsers) => {
    //             const mergedSelection = [...prevUsers, ...matchedEmployees.map(emp => emp.value)];
    //             return [...new Set(mergedSelection)];
    //         });
    //     };

    //     window.addEventListener("paste", handlePaste);

    //     return () => {
    //         window.removeEventListener("paste", handlePaste);
    //     };
    // }, [allUsersLimit, valueCompany, selectedBranch, selectedUnit, selectedTeam]);

    // const handleDelete = (e, value) => {
    //     e.preventDefault();
    //     setSelectedEmp((current) => current.filter((emp) => emp.value !== value));
    //     setValueEmp((current) => current.filter((empValue) => empValue !== value));
    // };

    const customValueRendererEmp = (valueCate, _employees) => {
        return valueCate.length
            ? valueCate.map(({ label }) => label).join(", ")
            : "Please Select Employee";
    };

    const [searchInputValue, setSearchInputValue] = useState('');
    const [isBoxFocused, setIsBoxFocused] = React.useState(false);

    const handlePasteForEmp = (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');

        // Process the pasted text
        const pastedNames = pastedText
            .split(/[\n,]+/)
            .map(name => name.trim())
            .filter(name => name !== "");

        // Update the state
        updateEmployees(pastedNames);

        // Clear the search input after paste
        setSearchInputValue('');

        // Refocus the element
        e.target.focus();
    };

    useEffect(() => {
        updateEmployees([]); // Pass an empty array instead of an empty string
    }, [allUsersLimit, valueCompany, valueBranch, valueUnit, valueTeam]);

    const updateEmployees = (pastedNames) => {

        const namesArray = Array.isArray(pastedNames) ? pastedNames : [];

        const availableOptions = allUsersLimit
            ?.filter(
                (comp) =>
                    valueCompany?.includes(comp.company) &&
                    valueBranch?.includes(comp.branch) &&
                    valueUnit?.includes(comp.unit) &&
                    valueTeam?.includes(comp.team)
            )
            ?.map(data => data.companyname.replace(/\s*\.\s*/g, ".").trim())

        const matchedValues = namesArray.filter((name) =>
            availableOptions.includes(name.replace(/\s*\.\s*/g, ".").trim())
        );

        // Update selected options
        const newOptions = matchedValues.map(value => ({
            label: value,
            value: value
        }));

        setSelectedEmp(prev => {
            const newValues = newOptions.filter(
                newOpt => !prev.some(prevOpt => prevOpt.value === newOpt.value)
            );
            return [...prev, ...newValues];
        });

        // Update other states...
        setValueEmp(prev => [...new Set([...prev, ...matchedValues])]);
    };

    // Handle clicks outside the Box
    useEffect(() => {
        const handleClickOutside = (e) => {
            const boxElement = document.getElementById("paste-box"); // Add an ID to the Box
            if (boxElement && !boxElement.contains(e.target)) {
                setIsBoxFocused(false); // Reset focus state if clicking outside the Box
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDelete = (e, value) => {
        e.preventDefault();
        setSelectedEmp((current) => current.filter(emp => emp.value !== value));
        setValueEmp((current) => current.filter(empValue => empValue !== value));
    };

    // Department
    const handleDepartmentChange = (options) => {
        setSelectedDep(options);
        setValueDep(
            options.map((a, index) => {
                return a.value;
            })
        );
    };

    const customValueRendererDepartment = (valueDep, _categoryname) => {
        return valueDep?.length
            ? valueDep.map(({ label }) => label)?.join(", ")
            : "Please Select Department";
    };

    const getattendancestatus = (alldata) => {
        // console.log(alldata?.clockinstatus, alldata?.clockoutstatus)
        let result = attStatus.filter((data, index) => {
            return data?.clockinstatus === alldata?.clockinstatus && data?.clockoutstatus === alldata?.clockoutstatus
        })
        return result[0]?.name
    }

    const getAttModeAppliedThr = (rowdaystatus) => {
        let result = attModearr.filter((data, index) => {
            return data?.name === rowdaystatus
        })
        return result[0]?.appliedthrough
    }

    const getAttModeLop = (rowdaystatus) => {
        let result = attModearr.filter((data, index) => {
            return data?.name === rowdaystatus
        })
        return result[0]?.lop === true ? 'Yes' : 'No';
    }

    const getAttModeLopType = (rowdaystatus) => {
        let result = attModearr.filter((data, index) => {
            return data?.name === rowdaystatus
        })
        return result[0]?.loptype
    }

    const getFinalLop = (rowlop, rowloptype) => {
        return (rowloptype === undefined || rowloptype === "") ? rowlop : (rowlop + ' - ' + rowloptype);
    }

    const getAttModeTarget = (rowdaystatus) => {
        let result = attModearr.filter((data, index) => {
            return data?.name === rowdaystatus
        })
        return result[0]?.target === true ? 'Yes' : 'No';
    }

    const getAttModePaidPresent = (rowdaystatus) => {
        let result = attModearr.filter((data, index) => {
            return data?.name === rowdaystatus
        })
        return result[0]?.paidleave === true ? 'Yes' : 'No';
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

    const getAssignLeaveDayForLop = (rowlopday) => {
        if (rowlopday === 'Yes - Double Day') {
            return '2'
        } else if (rowlopday === 'Yes - Full Day') {
            return '1';
        } else if (rowlopday === 'Yes - Half Day') {
            return '0.5'
        } else {
            return '0';
        }
    }

    const getAssignLeaveDayForPaid = (rowpaidday) => {
        if (rowpaidday === 'Yes - Double Day') {
            return '2'
        } else if (rowpaidday === 'Yes - Full Day') {
            return '1';
        } else if (rowpaidday === 'Yes - Half Day') {
            return '0.5'
        } else {
            return '0';
        }
    }

    const getIsWeekoff = (rowdaystatus) => {
        let result = attModearr.filter((data, index) => {
            return data?.name === rowdaystatus;
        })
        return result[0]?.weekoff === true ? 'Yes' : 'No';
    }

    const getIsHoliday = (rowdaystatus) => {
        let result = attModearr.filter((data, index) => {
            return data?.name === rowdaystatus;
        })
        return result[0]?.holiday === true ? 'Yes' : 'No';
    }

    // // get week for month's start to end
    // function getWeekNumberInMonth(date) {
    //     const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    //     const dayOfWeek = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)

    //     // If the first day of the month is not Monday (1), calculate the adjustment
    //     const adjustment = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    //     // Calculate the day of the month adjusted for the starting day of the week
    //     const dayOfMonthAdjusted = date.getDate() + adjustment;

    //     // Calculate the week number based on the adjusted day of the month
    //     const weekNumber = Math.ceil(dayOfMonthAdjusted / 7);

    //     return weekNumber;
    // }


    // function getMonthsInRange(fromdate, todate) {
    //     const startDate = new Date(fromdate);
    //     const endDate = new Date(todate);
    //     const monthNames = [
    //         "January", "February", "March", "April", "May", "June",
    //         "July", "August", "September", "October", "November", "December"
    //     ];

    //     const result = [];
    //     const currentDate = new Date(startDate);
    //     currentDate.setDate(1); // Fix to prevent auto-date correction

    //     // Ensure next month is included if fromdate and todate are the same
    //     if (startDate.getTime() === endDate.getTime()) {
    //         endDate.setMonth(endDate.getMonth() + 1);
    //     }

    //     while (
    //         currentDate.getFullYear() < endDate.getFullYear() ||
    //         (currentDate.getFullYear() === endDate.getFullYear() && currentDate.getMonth() <= endDate.getMonth())
    //     ) {
    //         result.push({
    //             month: monthNames[currentDate.getMonth()],
    //             year: currentDate.getFullYear().toString()
    //         });

    //         currentDate.setMonth(currentDate.getMonth() + 1);
    //     }

    //     return result;
    // }

    // function getMonthsInRange(fromdate, todate) {
    //     const startDate = new Date(fromdate);
    //     const endDate = new Date(todate);
    //     const monthNames = [
    //         "January", "February", "March", "April", "May", "June",
    //         "July", "August", "September", "October", "November", "December"
    //     ];

    //     const result = [];
    //     const selectedMonth = startDate.getMonth();
    //     const selectedYear = startDate.getFullYear();
    //     const startDay = startDate.getDate();
    //     const endDay = endDate.getDate();

    //     const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate(); // Get last day of month

    //     if (startDay === 1 && endDay === daysInMonth) {
    //         // If entire month is selected, return previous, current, and next month
    //         const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    //         const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

    //         const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    //         const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;

    //         result.push({ month: monthNames[prevMonth], year: prevYear.toString() });
    //         result.push({ month: monthNames[selectedMonth], year: selectedYear.toString() });
    //         result.push({ month: monthNames[nextMonth], year: nextYear.toString() });
    //     } else if (startDay >= 1 && endDay <= 15) {
    //         // Return the previous month and the selected month
    //         const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    //         const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

    //         result.push({ month: monthNames[prevMonth], year: prevYear.toString() });
    //         result.push({ month: monthNames[selectedMonth], year: selectedYear.toString() });
    //     } else if (startDay >= 16) {
    //         // Return the selected month and the next month
    //         result.push({ month: monthNames[selectedMonth], year: selectedYear.toString() });

    //         const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    //         const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;

    //         result.push({ month: monthNames[nextMonth], year: nextYear.toString() });
    //     }

    //     return result;
    // }

    function getMonthsInRange(fromdate, todate) {
        const startDate = new Date(fromdate);
        const endDate = new Date(todate);
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const result = [];

        // Previous month based on `fromdate`
        const prevMonth = startDate.getMonth() === 0 ? 11 : startDate.getMonth() - 1;
        const prevYear = startDate.getMonth() === 0 ? startDate.getFullYear() - 1 : startDate.getFullYear();
        result.push({ month: monthNames[prevMonth], year: prevYear.toString() });

        // Add selected months between `fromdate` and `todate`
        const currentDate = new Date(startDate);
        currentDate.setDate(1); // Normalize to the start of the month
        while (
            currentDate.getFullYear() < endDate.getFullYear() ||
            (currentDate.getFullYear() === endDate.getFullYear() && currentDate.getMonth() <= endDate.getMonth())
        ) {
            result.push({
                month: monthNames[currentDate.getMonth()],
                year: currentDate.getFullYear().toString()
            });
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        // Next month based on `todate`
        const nextMonth = endDate.getMonth() === 11 ? 0 : endDate.getMonth() + 1;
        const nextYear = endDate.getMonth() === 11 ? endDate.getFullYear() + 1 : endDate.getFullYear();
        result.push({ month: monthNames[nextMonth], year: nextYear.toString() });

        return result;
    }

    const fetchFilteredUsersStatus = async () => {
        setPageName(!pageName)
        setAttModeReport([]);
        setLoader(true);
        setPageAttModeReport(1);
        setPageSizeAttModeReport(10);
        const montharray = getMonthsInRange(filterUser.fromdate, filterUser.todate);
        console.log(montharray , "montharray")
        try {
            let res = await axios.post(SERVICE.USER_CLOCKIN_CLOCKOUT_STATUS_ATT_MODE_BASED_FILTER, {
                employee: isUserRoleAccess?.companyname,
                fromdate: filterUser.fromdate,
                todate: filterUser.todate,
                montharray: [...montharray],
            }, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                }
            })
            console.log(res?.data , "Data")
        } catch (err) { setLoader(true); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
    };

    // useEffect(() => {
    //     // Update filtered data items efficiently

    // }, [attModeReport]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (filterUser.filtertype === "Please Select Filter Type" || filterUser.filtertype === "" || filterUser.filtertype === undefined) {
            setPopupContentMalert("Please Select Filter Type for Employee Names");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (selectedCompany?.length === 0) {
            setPopupContentMalert("Please Select Company");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (["Individual", "Team", "Branch", "Unit"]?.includes(filterUser.filtertype) && selectedBranch.length === 0) {
            setPopupContentMalert("Please Select Branch");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (["Individual", "Team", "Unit"]?.includes(filterUser.filtertype) && selectedUnit.length === 0) {
            setPopupContentMalert("Please Select Unit");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (["Individual", "Team"]?.includes(filterUser.filtertype) && selectedTeam.length === 0) {
            setPopupContentMalert("Please Select Team");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (["Individual"]?.includes(filterUser.filtertype) && selectedEmp.length === 0) {
            setPopupContentMalert("Please Select Employee Names");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (["Department"]?.includes(filterUser.filtertype) && selectedDep.length === 0) {
            setPopupContentMalert("Please Select Department");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (filterUser.fromdate === '' && filterUser.todate === '') {
            setPopupContentMalert("Please Select Date");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        } else {
            fetchFilteredUsersStatus();
        }
    };

    const handleClear = async (e) => {
        e.preventDefault();
        setAttModeReport([]);
        setFilterUser({ filtertype: "Individual", fromdate: today, todate: today, });
        setSelectedMode("Today")
        setSelectedCompany([]);
        setSelectedBranch([]);
        setSelectedUnit([]);
        setSelectedTeam([]);
        setSelectedDep([]);
        setSelectedEmp([]);
        setValueCompany([]);
        setValueBranch([]);
        setValueUnit([]);
        setValueTeam([])
        setValueDep([]);
        setValueEmp([]);
        setPageAttModeReport(1);
        setPopupContent("Cleared Successfully");
        setPopupSeverity("success");
        handleClickOpenPopup();
    };

    const defaultColDef = useMemo(() => {
        return {
            filter: true,
            resizable: true,
            filterParams: {
                buttons: ["apply", "reset", "cancel"],
            },
        };
    }, []);

    // Define page size options
    const pageSizeOptions = [1, 5, 10, 25, 50, 100, 'ALL'];

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
                    filteredData.push(node.data);
                });
                setFilteredRowData(filteredData);
            }
        }
    };

    const onPaginationChanged = useCallback(() => {
        if (gridRefTableAttModeReport.current) {
            const gridApi = gridRefTableAttModeReport.current.api;
            const currentPage = gridApi.paginationGetCurrentPage() + 1;
            const totalPagesAttModeReport = gridApi.paginationGetTotalPages();
            setPageAttModeReport(currentPage);
            setTotalPagesAttModeReport(totalPagesAttModeReport);
        }
    }, []);

    const onPageSizeChange = useCallback((event) => {
        const value = event.target.value;

        if (value === 'ALL') {
            setPageSizeAttModeReport(filteredDataItems.length); // Show all data
        } else {
            setPageSizeAttModeReport(Number(value)); // Convert to number
        }

        // Optionally reset pagination to the first page when page size changes
        setPageAttModeReport(1);
    }, [filteredDataItems.length]);

    const columnDataTableAttModeReport = [
        { field: "serialNumber", headerName: "SNo", flex: 0, width: 80, hide: !columnVisibilityAttModeReport.serialNumber, pinned: 'left', lockPinned: true, },
        { field: "empcode", headerName: "Emp Code", flex: 0, width: 150, hide: !columnVisibilityAttModeReport.empcode, pinned: 'left', lockPinned: true, },
        { field: "username", headerName: "Employee Name", flex: 0, width: 250, hide: !columnVisibilityAttModeReport.username, pinned: 'left', lockPinned: true, },
        { field: "company", headerName: "Company", flex: 0, width: 130, hide: !columnVisibilityAttModeReport.company, },
        { field: "branch", headerName: "Branch", flex: 0, width: 130, hide: !columnVisibilityAttModeReport.branch, },
        { field: "unit", headerName: "Unit", flex: 0, width: 130, hide: !columnVisibilityAttModeReport.unit, },
        { field: "team", headerName: "Team", flex: 0, width: 130, hide: !columnVisibilityAttModeReport.team, },
        { field: "department", headerName: "Department", flex: 0, width: 130, hide: !columnVisibilityAttModeReport.department, },
        { field: "date", headerName: "Date", flex: 0, width: 110, hide: !columnVisibilityAttModeReport.date, },
        { field: "shiftmode", headerName: "Shift Mode", flex: 0, width: 110, hide: !columnVisibilityAttModeReport.shiftmode, },
        { field: "shift", headerName: "Shift", flex: 0, width: 150, hide: !columnVisibilityAttModeReport.shift, },
        { field: "changeshift", headerName: "Change Shift", flex: 0, width: 150, hide: !columnVisibilityAttModeReport.changeshift, },
        { field: "leavestatus", headerName: "Leave Status", flex: 0, width: 150, hide: !columnVisibilityAttModeReport.leavestatus, },
        { field: "permissionstatus", headerName: "Permission Status", flex: 0, width: 150, hide: !columnVisibilityAttModeReport.permissionstatus, },
        {
            field: "attendancemodeprioritystatus", headerName: "Attendance Mode", flex: 0, width: 150, hide: !columnVisibilityAttModeReport.attendancemodeprioritystatus,
            cellRenderer: (params) => {
                return (
                    <Grid>
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
                                padding: '3px 8px',
                                cursor: 'default',
                                color: 'white',
                                backgroundColor: params.data.attendancemodeprioritystatus === 'Domain' ? '#4A102A' : params.data.attendancemodeprioritystatus === 'Hrms-Self' ? '#006A71' : params.data.attendancemodeprioritystatus === 'Hrms-Manual' ? '#210F37' : params.data.attendancemodeprioritystatus === "Production" ? '#18230F' : params.data.attendancemodeprioritystatus === 'Biometric' ? '#211C84' : '#537D5D',
                                '&:hover': {
                                    color: 'white',
                                    backgroundColor: params.data.attendancemodeprioritystatus === 'Domain' ? '#4A102A' : params.data.attendancemodeprioritystatus === 'Hrms-Self' ? '#006A71' : params.data.attendancemodeprioritystatus === 'Hrms-Manual' ? '#210F37' : params.data.attendancemodeprioritystatus === "Production" ? '#18230F' : params.data.attendancemodeprioritystatus === 'Biometric' ? '#211C84' : '#537D5D',
                                }
                            }}
                        >
                            {params.data.attendancemodeprioritystatus}
                        </Button>
                    </Grid >
                );
            },
        },
        { field: "clockin", headerName: "ClockIn", flex: 0, width: 120, hide: !columnVisibilityAttModeReport.clockin, },
        {
            field: "clockinstatus", headerName: "ClockInStatus", flex: 0, width: 200, hide: !columnVisibilityAttModeReport.clockinstatus,
            cellRenderer: (params) => {
                return (
                    <Grid>
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
                                padding: (params.data.clockinstatus === 'BeforeWeekOffAbsent' || params.data.clockinstatus === 'BeforeWeekOffLeave') ? '3px 5px' : '3px 8px',
                                cursor: 'default',
                                color: (params.data.clockinstatus === 'Present' || params.data.clockinstatus === 'Early - ClockIn') ? 'black' : params.data.clockinstatus === 'Holiday' ? 'black' : params.data.clockinstatus === 'Leave' ? 'white' : (params.data.clockinstatus === 'Absent' || params.data.clockinstatus?.includes('Long') || params.data.clockinstatus === 'BL - Absent') ? '#462929' : params.data.clockinstatus === 'Week Off' ? 'white' : params.data.clockinstatus === 'Grace - ClockIn' ? '#052106' : params.data.clockinstatus === 'On - Present' ? 'black' : params.data.clockinstatus === 'HBLOP' ? 'white' : params.data.clockinstatus === 'FLOP' ? 'white' : (params.data.clockinstatus === 'AfterWeekOffAbsent' || params.data.clockinstatus === 'AfterWeekOffLeave') ? 'black' : (params.data.clockinstatus === 'BeforeWeekOffAbsent' || params.data.clockinstatus === 'BeforeWeekOffLeave') ? 'black' : params.data.clockinstatus?.includes('Late') ? '#15111d' : '#15111d',
                                backgroundColor: (params.data.clockinstatus === 'Present' || params.data.clockinstatus === 'Early - ClockIn') ? 'rgb(156 239 156)' : params.data.clockinstatus === 'Holiday' ? '#B6FFFA' : params.data.clockinstatus === 'Leave' ? '#1640D6' : (params.data.clockinstatus === "Absent" || params.data.clockinstatus?.includes('Long') || params.data.clockinstatus === 'BL - Absent') ? '#ff00007d' : params.data.clockinstatus === 'Week Off' ? '#6b777991' : params.data.clockinstatus === 'Grace - ClockIn' ? 'rgb(243 203 117)' : params.data.clockinstatus === 'On - Present' ? '#E1AFD1' : params.data.clockinstatus === 'HBLOP' ? '#DA0C81' : params.data.clockinstatus === 'FLOP' ? '#FE0000' : (params.data.clockinstatus === 'AfterWeekOffAbsent' || params.data.clockinstatus === 'AfterWeekOffLeave') ? '#F2D1D1' : (params.data.clockinstatus === 'BeforeWeekOffAbsent' || params.data.clockinstatus === 'BeforeWeekOffLeave') ? '#EEE3CB' : params.data.clockinstatus?.includes('Late') ? '#610c9f57' : 'rgb(243 203 117)',
                                '&:hover': {
                                    color: (params.data.clockinstatus === 'Present' || params.data.clockinstatus === 'Early - ClockIn') ? 'black' : params.data.clockinstatus === 'Holiday' ? 'black' : params.data.clockinstatus === 'Leave' ? 'white' : (params.data.clockinstatus === 'Absent' || params.data.clockinstatus?.includes('Long') || params.data.clockinstatus === 'BL - Absent') ? '#462929' : params.data.clockinstatus === 'Week Off' ? 'white' : params.data.clockinstatus === 'Grace - ClockIn' ? '#052106' : params.data.clockinstatus === 'On - Present' ? 'black' : params.data.clockinstatus === 'HBLOP' ? 'white' : params.data.clockinstatus === 'FLOP' ? 'white' : (params.data.clockinstatus === 'AfterWeekOffAbsent' || params.data.clockinstatus === 'AfterWeekOffLeave') ? 'black' : (params.data.clockinstatus === 'BeforeWeekOffAbsent' || params.data.clockinstatus === 'BeforeWeekOffLeave') ? 'black' : params.data.clockinstatus?.includes('Late') ? '#15111d' : '#15111d',
                                    backgroundColor: (params.data.clockinstatus === 'Present' || params.data.clockinstatus === 'Early - ClockIn') ? 'rgb(156 239 156)' : params.data.clockinstatus === 'Holiday' ? '#B6FFFA' : params.data.clockinstatus === 'Leave' ? '#1640D6' : (params.data.clockinstatus === "Absent" || params.data.clockinstatus?.includes('Long') || params.data.clockinstatus === 'BL - Absent') ? '#ff00007d' : params.data.clockinstatus === 'Week Off' ? '#6b777991' : params.data.clockinstatus === 'Grace - ClockIn' ? 'rgb(243 203 117)' : params.data.clockinstatus === 'On - Present' ? '#E1AFD1' : params.data.clockinstatus === 'HBLOP' ? '#DA0C81' : params.data.clockinstatus === 'FLOP' ? '#FE0000' : (params.data.clockinstatus === 'AfterWeekOffAbsent' || params.data.clockinstatus === 'AfterWeekOffLeave') ? '#F2D1D1' : (params.data.clockinstatus === 'BeforeWeekOffAbsent' || params.data.clockinstatus === 'BeforeWeekOffLeave') ? '#EEE3CB' : params.data.clockinstatus?.includes('Late') ? '#610c9f57' : 'rgb(243 203 117)',
                                }
                            }}
                        >
                            {params.data.clockinstatus}
                        </Button>
                    </Grid >
                );
            },
        },
        { field: "clockout", headerName: "ClockOut", flex: 0, width: 120, hide: !columnVisibilityAttModeReport.clockout, },
        {
            field: "clockoutstatus", headerName: "ClockOutStatus", flex: 0, width: 200, hide: !columnVisibilityAttModeReport.clockoutstatus,
            cellRenderer: (params) => {
                return (
                    <Grid>
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
                                padding: (params.data.clockoutstatus === 'BeforeWeekOffAbsent' || params.data.clockoutstatus === 'BeforeWeekOffLeave') ? '3px 5px' : '3px 8px',
                                cursor: 'default',
                                color: params.data.clockoutstatus === 'Holiday' ? 'black' : params.data.clockoutstatus === 'Leave' ? 'white' : (params.data.clockoutstatus === 'Absent' || params.data.clockoutstatus?.includes('Long') || params.data.clockoutstatus === 'BL - Absent') ? '#462929' : params.data.clockoutstatus === 'Week Off' ? 'white' : params.data.clockoutstatus === 'On - ClockOut' ? 'black' : params.data.clockoutstatus === 'Over - ClockOut' ? '#052106' : params.data.clockoutstatus === 'Mis - ClockOut' ? '#15111d' : params.data.clockoutstatus?.includes('Early') ? '#052106' : params.data.clockoutstatus === 'HALOP' ? 'white' : params.data.clockoutstatus === 'FLOP' ? 'white' : (params.data.clockoutstatus === 'AfterWeekOffAbsent' || params.data.clockoutstatus === 'AfterWeekOffLeave') ? 'black' : (params.data.clockoutstatus === 'BeforeWeekOffAbsent' || params.data.clockoutstatus === 'BeforeWeekOffLeave') ? 'black' : params.data.clockoutstatus === 'Pending' ? '#052106' : '#052106',
                                backgroundColor: params.data.clockoutstatus === 'Holiday' ? '#B6FFFA' : params.data.clockoutstatus === 'Leave' ? '#1640D6' : (params.data.clockoutstatus === "Absent" || params.data.clockoutstatus?.includes('Long') || params.data.clockoutstatus === 'BL - Absent') ? '#ff00007d' : params.data.clockoutstatus === 'Week Off' ? '#6b777991' : params.data.clockoutstatus === 'On - ClockOut' ? '#E1AFD1' : params.data.clockoutstatus === 'Over - ClockOut' ? 'rgb(156 239 156)' : params.data.clockoutstatus === 'Mis - ClockOut' ? '#610c9f57' : params.data.clockoutstatus?.includes('Early') ? 'rgb(243 203 117)' : params.data.clockoutstatus === 'HALOP' ? '#DA0C81' : params.data.clockoutstatus === 'FLOP' ? '#FE0000' : (params.data.clockoutstatus === 'AfterWeekOffAbsent' || params.data.clockoutstatus === 'AfterWeekOffLeave') ? '#F2D1D1' : (params.data.clockoutstatus === 'BeforeWeekOffAbsent' || params.data.clockoutstatus === 'BeforeWeekOffLeave') ? '#EEE3CB' : params.data.clockoutstatus === 'Pending' ? 'rgb(243 203 117)' : 'rgb(243 203 117)',
                                '&:hover': {
                                    color: params.data.clockoutstatus === 'Holiday' ? 'black' : params.data.clockoutstatus === 'Leave' ? 'white' : (params.data.clockoutstatus === 'Absent' || params.data.clockoutstatus?.includes('Long') || params.data.clockoutstatus === 'BL - Absent') ? '#462929' : params.data.clockoutstatus === 'Week Off' ? 'white' : params.data.clockoutstatus === 'On - ClockOut' ? 'black' : params.data.clockoutstatus === 'Over - ClockOut' ? '#052106' : params.data.clockoutstatus === 'Mis - ClockOut' ? '#15111d' : params.data.clockoutstatus?.includes('Early') ? '#052106' : params.data.clockoutstatus === 'HALOP' ? 'white' : params.data.clockoutstatus === 'FLOP' ? 'white' : (params.data.clockoutstatus === 'AfterWeekOffAbsent' || params.data.clockoutstatus === 'AfterWeekOffLeave') ? 'black' : (params.data.clockoutstatus === 'BeforeWeekOffAbsent' || params.data.clockoutstatus === 'BeforeWeekOffLeave') ? 'black' : params.data.clockoutstatus === 'Pending' ? '#052106' : '#052106',
                                    backgroundColor: params.data.clockoutstatus === 'Holiday' ? '#B6FFFA' : params.data.clockoutstatus === 'Leave' ? '#1640D6' : (params.data.clockoutstatus === "Absent" || params.data.clockoutstatus?.includes('Long') || params.data.clockoutstatus === 'BL - Absent') ? '#ff00007d' : params.data.clockoutstatus === 'Week Off' ? '#6b777991' : params.data.clockoutstatus === 'On - ClockOut' ? '#E1AFD1' : params.data.clockoutstatus === 'Over - ClockOut' ? 'rgb(156 239 156)' : params.data.clockoutstatus === 'Mis - ClockOut' ? '#610c9f57' : params.data.clockoutstatus?.includes('Early') ? 'rgb(243 203 117)' : params.data.clockoutstatus === 'HALOP' ? '#DA0C81' : params.data.clockoutstatus === 'FLOP' ? '#FE0000' : (params.data.clockoutstatus === 'AfterWeekOffAbsent' || params.data.clockoutstatus === 'AfterWeekOffLeave') ? '#F2D1D1' : (params.data.clockoutstatus === 'BeforeWeekOffAbsent' || params.data.clockoutstatus === 'BeforeWeekOffLeave') ? '#EEE3CB' : params.data.clockoutstatus === 'Pending' ? 'rgb(243 203 117)' : 'rgb(243 203 117)',
                                }
                            }}
                        >
                            {params.data.clockoutstatus}
                        </Button>
                    </Grid >
                );
            },
        },
        {
            field: "attendanceauto", headerName: "Attendance", flex: 0, width: 200, hide: !columnVisibilityAttModeReport.attendanceauto,
            cellRenderer: (params) => {
                return (
                    <Grid>
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
                                padding: '3px 8px',
                                cursor: 'default',
                                color: params.data.attendanceauto === 'HOLIDAY' ? 'black' : params.data.attendanceauto === 'ABSENT' ? '#462929' : params.data.attendanceauto === "WEEKOFF" ? 'white' : '#052106',
                                backgroundColor: params.data.attendanceauto === 'HOLIDAY' ? '#B6FFFA' : params.data.attendanceauto === "ABSENT" ? '#ff00007d' : params.data.attendanceauto === "WEEKOFF" ? '#6b777991' : 'rgb(156 239 156)',
                                '&:hover': {
                                    color: params.data.attendanceauto === 'HOLIDAY' ? 'black' : params.data.attendanceauto === 'ABSENT' ? '#462929' : params.data.attendanceauto === "WEEKOFF" ? 'white' : '#052106',
                                    backgroundColor: params.data.attendanceauto === 'HOLIDAY' ? '#B6FFFA' : params.data.attendanceauto === "ABSENT" ? '#ff00007d' : params.data.attendanceauto === "WEEKOFF" ? '#6b777991' : 'rgb(156 239 156)',
                                }
                            }}
                        >
                            {params.data.attendanceauto}
                        </Button>
                    </Grid >
                );
            },
        },
        {
            field: "daystatus", headerName: "Day Status", flex: 0, width: 200, hide: !columnVisibilityAttModeReport.daystatus,
            cellRenderer: (params) => {
                return (
                    <Grid>
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
                                padding: '3px 8px',
                                cursor: 'default',
                                color: params.data.daystatus === 'HOLIDAY' ? 'black' : params.data.daystatus === 'ABSENT' ? '#462929' : params.data.daystatus === "WEEKOFF" ? 'white' : '#052106',
                                backgroundColor: params.data.daystatus === 'HOLIDAY' ? '#B6FFFA' : params.data.daystatus === "ABSENT" ? '#ff00007d' : params.data.daystatus === "WEEKOFF" ? '#6b777991' : 'rgb(156 239 156)',
                                '&:hover': {
                                    color: params.data.daystatus === 'HOLIDAY' ? 'black' : params.data.daystatus === 'ABSENT' ? '#462929' : params.data.daystatus === "WEEKOFF" ? 'white' : '#052106',
                                    backgroundColor: params.data.daystatus === 'HOLIDAY' ? '#B6FFFA' : params.data.daystatus === "ABSENT" ? '#ff00007d' : params.data.daystatus === "WEEKOFF" ? '#6b777991' : 'rgb(156 239 156)',
                                }
                            }}
                        >
                            {params.data.daystatus}
                        </Button>
                    </Grid >
                );
            },
        },
        { field: "appliedthrough", headerName: "Applied Through", flex: 0, width: 120, hide: !columnVisibilityAttModeReport.appliedthrough, },
        { field: "isweekoff", headerName: "Is Week Off", flex: 0, width: 120, hide: !columnVisibilityAttModeReport.isweekoff, },
        { field: "isholiday", headerName: "Is Holiday", flex: 0, width: 120, hide: !columnVisibilityAttModeReport.isholiday, },
        { field: "lopcalculation", headerName: "LOP Calculation", flex: 0, width: 120, hide: !columnVisibilityAttModeReport.lopcalculation, },
        { field: "modetarget", headerName: "Target", flex: 0, width: 120, hide: !columnVisibilityAttModeReport.modetarget, },
        { field: "paidpresent", headerName: "Paid Present", flex: 0, width: 120, hide: !columnVisibilityAttModeReport.paidpresent, },
        { field: "lopday", headerName: "LOP Day", flex: 0, width: 120, hide: !columnVisibilityAttModeReport.lopday, },
        { field: "paidpresentday", headerName: "Paid Present Day", flex: 0, width: 120, hide: !columnVisibilityAttModeReport.paidpresentday, },
    ];

    // Datatable
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQueryAttModeReport(value);
        applyNormalFilter(value);
        setFilteredRowData([]);
    };

    const applyNormalFilter = (searchValue) => {

        // Split the search query into individual terms
        const searchTerms = searchValue.toLowerCase().split(" ");

        // Modify the filtering logic to check each term
        const filtered = attModeReport?.filter((item) => {
            return searchTerms.every((term) =>
                Object.values(item).join(" ").toLowerCase().includes(term)
            );
        });
        setFilteredDataItems(filtered);
        setPageAttModeReport(1);
    };

    const applyAdvancedFilter = (filters, logicOperator) => {
        // Apply filtering logic with multiple conditions
        const filtered = attModeReport?.filter((item) => {
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
        // handleCloseSearchAttModeReport(); 
    };

    // Undo filter funtion
    const handleResetSearch = () => {
        setAdvancedFilter(null);
        setSearchQueryAttModeReport("");
        setFilteredDataItems(attModeReport);
    };

    // Show filtered combination in the search bar
    const getSearchDisplay = () => {
        if (advancedFilter && advancedFilter.length > 0) {
            return advancedFilter.map((filter, index) => {
                let showname = columnDataTableAttModeReport.find(col => col.field === filter.column)?.headerName;
                return `${showname} ${filter.condition} "${filter.value}"`;
            }).join(' ' + (advancedFilter.length > 1 ? advancedFilter[1].condition : '') + ' ');
        }
        return searchQueryAttModeReport;
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPagesAttModeReport) {
            setPageAttModeReport(newPage);
            gridRefTableAttModeReport.current.api.paginationGoToPage(newPage - 1);
        }
    };

    const handlePageSizeChange = (e) => {
        const newSize = Number(e.target.value);
        setPageSizeAttModeReport(newSize);
        if (gridApi) {
            gridApi.paginationSetPageSize(newSize);
        }
    };

    // Show All Columns functionality
    const handleShowAllColumns = () => {
        const updatedVisibility = { ...columnVisibilityAttModeReport };
        for (const columnKey in updatedVisibility) {
            updatedVisibility[columnKey] = true;
        }
        setColumnVisibilityAttModeReport(updatedVisibility);
    };

    useEffect(() => {
        // Retrieve column visibility from localStorage (if available)
        const savedVisibility = localStorage.getItem("columnVisibilityAttModeReport");
        if (savedVisibility) {
            setColumnVisibilityAttModeReport(JSON.parse(savedVisibility));
        }
    }, []);

    useEffect(() => {
        // Save column visibility to localStorage whenever it changes
        localStorage.setItem("columnVisibilityAttModeReport", JSON.stringify(columnVisibilityAttModeReport));
    }, [columnVisibilityAttModeReport]);

    // Function to filter columns based on search query
    const filteredColumns = columnDataTableAttModeReport.filter((column) =>
        column.headerName.toLowerCase().includes(searchQueryManageAttModeReport.toLowerCase())
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

        setColumnVisibilityAttModeReport((prevVisibility) => {
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

        setColumnVisibilityAttModeReport((prevVisibility) => {
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
        setColumnVisibilityAttModeReport((prevVisibility) => ({
            ...prevVisibility,
            [colId]: event.visible, // Set visibility directly from the event
        }));
    }, []);

    // Excel
    const [fileFormat, setFormat] = useState('');
    let exportColumnNamescrt = [
        "Emp Code", "Employee Name", "Company", "Branch", "Unit", "Team", "Department",
        "Date", "Shift Mode", "Shift", "Change Shift", "Leave Status", "Permission Status", "Attendance Mode", "ClockIn", "ClockInStatus", "ClockOut", "ClockOutStatus", "Attendance",
        "Day Status", "Applied Through", "Is Week Off", "Is Holiday", "LOP Calculation", "Target", "Paid Present", "LOP Day", "Paid Present Day",
    ]
    let exportRowValuescrt = [
        'empcode', 'username', 'company', 'branch', 'unit', 'team', 'department', 'date', 'shiftmode', 'shift', 'changeshift', 'leavestatus', 'permissionstatus', 'attendancemodeprioritystatus', 'clockin', 'clockinstatus',
        'clockout', 'clockoutstatus', 'attendanceauto', 'daystatus', 'appliedthrough', 'isweekoff', 'isholiday', 'lopcalculation', 'modetarget', 'paidpresent', 'lopday', 'paidpresentday',
    ]

    // print...
    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "Attendance Mode Report",
        pageStyle: "print",
    });

    // image
    const handleCaptureImage = () => {
        if (gridRefImageAttModeReport.current) {
            domtoimage.toBlob(gridRefImageAttModeReport.current)
                .then((blob) => {
                    saveAs(blob, "Attendance Mode Report.png");
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

        const startPage = Math.max(1, pageAttModeReport - 1);
        const endPage = Math.min(totalPagesAttModeReport, startPage + maxVisiblePages - 1);

        // Loop through and add visible pageAttModeReport numbers
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        // If there are more pages after the last visible pageAttModeReport, show ellipsis
        if (endPage < totalPagesAttModeReport) {
            pageNumbers.push("...");
        }

        return pageNumbers;
    };

    // Pagination for outer filter
    const filteredData = filteredDataItems?.slice((pageAttModeReport - 1) * pageSizeAttModeReport, pageAttModeReport * pageSizeAttModeReport);
    const totalPagesAttModeReportOuter = Math.ceil(filteredDataItems?.length / pageSizeAttModeReport);
    const visiblePages = Math.min(totalPagesAttModeReportOuter, 3);
    const firstVisiblePage = Math.max(1, pageAttModeReport - 1);
    const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPagesAttModeReportOuter);
    const pageNumbers = [];
    const indexOfLastItem = pageAttModeReport * pageSizeAttModeReport;
    const indexOfFirstItem = indexOfLastItem - pageSizeAttModeReport;
    for (let i = firstVisiblePage; i <= lastVisiblePage; i++) { pageNumbers.push(i); }

    return (
        <Box>
            <Headtitle title={"Attendance Mode Report"} />
            {/* ****** Header Content ****** */}
            <PageHeading
                title="Attendance Mode Report"
                modulename="Human Resources"
                submodulename="HR"
                mainpagename="Attendance"
                subpagename="Attendance Rports"
                subsubpagename="Attendance Mode Report"
            />
            {isUserRoleCompare?.includes("lattendancemodereport") && (
                <>
                    <Box sx={userStyle.selectcontainer}>
                        <Grid container spacing={2}>
                            <Grid item md={12} sm={12} xs={12}>
                                <Typography sx={userStyle.importheadtext}> Attendance Mode Report </Typography>
                            </Grid>

                            {/* <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>Mode<b style={{ color: "red" }}>*</b></Typography>
                                    <Selects
                                        options={modeOptions}
                                        styles={colourStyles}
                                        value={{ label: filterUser.mode, value: filterUser.mode }}
                                        onChange={(e) => {
                                            setFilterUser({ ...filterUser, mode: e.value, });
                                            setSelectedDep([]);
                                            setValueDep([]);
                                            setSelectedEmp([]);
                                            setValueEmp([]);
                                        }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <Typography>Company<b style={{ color: "red" }}>*</b></Typography>
                                <FormControl size="small" fullWidth>
                                    <MultiSelect
                                        options={accessbranch?.map(data => ({
                                            label: data.company,
                                            value: data.company,
                                        })).filter((item, index, self) => {
                                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                        })}
                                        value={selectedCompany}
                                        onChange={(e) => {
                                            handleCompanyChange(e);
                                            setFilterUser({ ...filterUser, department: 'Please Select Department' });
                                        }}
                                        valueRenderer={customValueRendererCompany}
                                        labelledBy="Please Select Company"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography> Branch<b style={{ color: "red" }}>*</b> </Typography>
                                    <MultiSelect
                                        options={accessbranch?.filter(
                                            (comp) =>
                                                valueCompany?.includes(comp.company)
                                        )?.map(data => ({
                                            label: data.branch,
                                            value: data.branch,
                                        })).filter((item, index, self) => {
                                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                        })}
                                        value={selectedBranch}
                                        onChange={(e) => {
                                            handleBranchChangeFrom(e);
                                            setFilterUser({ ...filterUser, department: 'Please Select Department' });
                                        }}
                                        valueRenderer={customValueRendererBranchFrom}
                                        labelledBy="Please Select Branch"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography> Unit<b style={{ color: "red" }}>*</b> </Typography>
                                    <MultiSelect
                                        options={accessbranch?.filter(
                                            (comp) =>
                                                valueCompany?.includes(comp.company) && valueBranch?.includes(comp.branch)
                                        )?.map(data => ({
                                            label: data.unit,
                                            value: data.unit,
                                        })).filter((item, index, self) => {
                                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                        })}
                                        value={selectedUnit}
                                        onChange={(e) => {
                                            handleUnitChangeFrom(e);
                                            setFilterUser({ ...filterUser, department: 'Please Select Department' });
                                        }}
                                        valueRenderer={customValueRendererUnitFrom}
                                        labelledBy="Please Select Unit"
                                    />
                                </FormControl>
                            </Grid>
                            {filterUser.mode === 'Department' ?
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography> Department<b style={{ color: "red" }}>*</b> </Typography>
                                        <MultiSelect
                                            options={alldepartment?.map(data => ({
                                                label: data.deptname,
                                                value: data.deptname,
                                            })).filter((item, index, self) => {
                                                return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                            })}
                                            value={selectedDep}
                                            onChange={(e) => {
                                                handleDepChangeFrom(e);
                                            }}
                                            valueRenderer={customValueRendererDepFrom}
                                            labelledBy="Please Select Department"
                                        />
                                    </FormControl>
                                </Grid>
                                : null}
                            {filterUser.mode === 'Employee' ?
                                <Grid item md={3} sm={12} xs={12} sx={{ display: "flex", flexDirection: "row" }}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Employee<b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <MultiSelect
                                            options={allUsersLimit?.filter(
                                                (comp) =>
                                                    valueCompany?.includes(comp.company) && valueBranch?.includes(comp.branch) && valueUnit?.includes(comp.unit)
                                            )?.map(data => ({
                                                label: data.companyname,
                                                value: data.companyname,
                                            })).filter((item, index, self) => {
                                                return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                            })}
                                            value={selectedEmp}
                                            onChange={(e) => {
                                                handleEmployeeChange(e);
                                            }}
                                            valueRenderer={customValueRendererEmp}
                                            labelledBy="Please Select Employee"
                                        />
                                    </FormControl>
                                </Grid>
                                : null} */}
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography> Type<b style={{ color: "red" }}>*</b> </Typography>
                                    <Selects
                                        options={[
                                            { label: "Individual", value: "Individual" },
                                            { label: "Company", value: "Company" },
                                            { label: "Branch", value: "Branch" },
                                            { label: "Unit", value: "Unit" },
                                            { label: "Team", value: "Team" },
                                            { label: "Department", value: "Department" },
                                        ]}
                                        styles={colourStyles}
                                        value={{ label: filterUser.filtertype, value: filterUser.filtertype, }}
                                        onChange={(e) => {
                                            setFilterUser({ ...filterUser, filtertype: e.value });
                                            setSelectedCompany([]);
                                            setValueCompany([]);
                                            setSelectedBranch([]);
                                            setValueBranch([]);
                                            setSelectedUnit([]);
                                            setValueUnit([]);
                                            setSelectedTeam([]);
                                            setValueTeam([]);
                                            setSelectedEmp([]);
                                            setValueEmp([]);
                                            setSelectedDep([]);
                                            setValueDep([]);
                                        }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        Company<b style={{ color: "red" }}>*</b>
                                    </Typography>
                                    <MultiSelect
                                        options={accessbranch?.map(data => ({
                                            label: data.company,
                                            value: data.company,
                                        })).filter((item, index, self) => {
                                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                        })}
                                        value={selectedCompany}
                                        onChange={(e) => {
                                            handleCompanyChange(e);
                                        }}
                                        valueRenderer={customValueRendererCompany}
                                        labelledBy="Please Select Company"
                                    />
                                </FormControl>
                            </Grid>
                            {["Individual", "Team"]?.includes(filterUser.filtertype) ? <>
                                {/* Branch Unit Team */}
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography> Branch<b style={{ color: "red" }}>*</b> </Typography>
                                        <MultiSelect
                                            options={accessbranch?.filter(
                                                (comp) =>
                                                    valueCompany?.includes(comp.company)
                                            )?.map(data => ({
                                                label: data.branch,
                                                value: data.branch,
                                            })).filter((item, index, self) => {
                                                return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                            })}
                                            value={selectedBranch}
                                            onChange={handleBranchChange}
                                            valueRenderer={customValueRendererBranch}
                                            labelledBy="Please Select Branch"
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography> Unit<b style={{ color: "red" }}>*</b></Typography>
                                        <MultiSelect
                                            options={accessbranch?.filter(
                                                (comp) =>
                                                    valueCompany?.includes(comp.company) && valueBranch?.includes(comp.branch)
                                            )?.map(data => ({
                                                label: data.unit,
                                                value: data.unit,
                                            })).filter((item, index, self) => {
                                                return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                            })}
                                            value={selectedUnit}
                                            onChange={handleUnitChange}
                                            valueRenderer={customValueRendererUnit}
                                            labelledBy="Please Select Branch"
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography> Team<b style={{ color: "red" }}>*</b></Typography>
                                        <MultiSelect
                                            options={allTeam
                                                ?.filter((u) => valueCompany?.includes(u.company) && valueBranch?.includes(u.branch) && valueUnit?.includes(u.unit))
                                                .map((u) => ({
                                                    ...u,
                                                    label: u.teamname,
                                                    value: u.teamname,
                                                }))}
                                            value={selectedTeam}
                                            onChange={handleTeamChange}
                                            valueRenderer={customValueRendererTeam}
                                            labelledBy="Please Select Branch"
                                        />
                                    </FormControl>
                                </Grid>
                            </>
                                : ["Branch"]?.includes(filterUser.filtertype) ?
                                    <>
                                        <Grid item md={3} xs={12} sm={12}>
                                            <FormControl fullWidth size="small">
                                                <Typography> Branch<b style={{ color: "red" }}>*</b></Typography>
                                                <MultiSelect
                                                    options={accessbranch?.filter(
                                                        (comp) =>
                                                            valueCompany?.includes(comp.company)
                                                    )?.map(data => ({
                                                        label: data.branch,
                                                        value: data.branch,
                                                    })).filter((item, index, self) => {
                                                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                    })}
                                                    value={selectedBranch}
                                                    onChange={handleBranchChange}
                                                    valueRenderer={customValueRendererBranch}
                                                    labelledBy="Please Select Branch"
                                                />
                                            </FormControl>
                                        </Grid>
                                    </>
                                    :
                                    ["Unit"]?.includes(filterUser.filtertype) ?
                                        <>
                                            <Grid item md={3} xs={12} sm={12}>
                                                <FormControl fullWidth size="small">
                                                    <Typography> Branch<b style={{ color: "red" }}>*</b></Typography>
                                                    <MultiSelect
                                                        options={accessbranch?.filter(
                                                            (comp) =>
                                                                valueCompany?.includes(comp.company)
                                                        )?.map(data => ({
                                                            label: data.branch,
                                                            value: data.branch,
                                                        })).filter((item, index, self) => {
                                                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                        })}
                                                        value={selectedBranch}
                                                        onChange={handleBranchChange}
                                                        valueRenderer={customValueRendererBranch}
                                                        labelledBy="Please Select Branch"
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item md={3} xs={12} sm={12}>
                                                <FormControl fullWidth size="small">
                                                    <Typography> Unit<b style={{ color: "red" }}>*</b></Typography>
                                                    <MultiSelect
                                                        options={accessbranch?.filter(
                                                            (comp) =>
                                                                valueCompany?.includes(comp.company) && valueBranch?.includes(comp.branch)
                                                        )?.map(data => ({
                                                            label: data.unit,
                                                            value: data.unit,
                                                        })).filter((item, index, self) => {
                                                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                        })}
                                                        value={selectedUnit}
                                                        onChange={handleUnitChange}
                                                        valueRenderer={customValueRendererUnit}
                                                        labelledBy="Please Select Branch"
                                                    />
                                                </FormControl>
                                            </Grid>
                                        </>
                                        : ["Individual", "Department"]?.includes(filterUser.filtertype) ?
                                            <>
                                                {/* Department */}
                                                <Grid item md={3} xs={12} sm={6}>
                                                    <FormControl fullWidth size="small">
                                                        <Typography>
                                                            Department<b style={{ color: "red" }}>*</b>
                                                        </Typography>
                                                        <MultiSelect
                                                            options={alldepartment?.map(data => ({
                                                                label: data.deptname,
                                                                value: data.deptname,
                                                            })).filter((item, index, self) => {
                                                                return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                            })}
                                                            value={selectedDep}
                                                            onChange={(e) => {
                                                                handleDepartmentChange(e);
                                                            }}
                                                            valueRenderer={customValueRendererDepartment}
                                                            labelledBy="Please Select Department"
                                                        />
                                                    </FormControl>
                                                </Grid>
                                            </>
                                            : ""
                            }
                            {["Individual"]?.includes(filterUser.filtertype) && (
                                empLoader ?
                                    <LoadingButton loading={empLoader} />
                                    :
                                    <>
                                        <Grid item md={3} sm={12} xs={12} sx={{ display: "flex", flexDirection: "row" }}>
                                            <FormControl fullWidth size="small">
                                                <Typography>Employee<b style={{ color: "red" }}>*</b> </Typography>
                                                <div
                                                    onPaste={handlePasteForEmp}
                                                    style={{ position: 'relative' }}
                                                >
                                                    <MultiSelect
                                                        options={allUsersLimit?.filter(
                                                            (comp) =>
                                                                valueCompany?.includes(comp.company) && selectedBranch?.map(data => data.value)?.includes(comp.branch) && selectedUnit?.map(data => data.value)?.includes(comp.unit) && selectedTeam?.map(data => data.value)?.includes(comp.team)
                                                        )?.map(data => ({
                                                            label: data.companyname.trim(),
                                                            value: data.companyname.trim(),
                                                        })).filter((item, index, self) => {
                                                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                        })}
                                                        value={selectedEmp}
                                                        onChange={handleEmployeeChange}
                                                        valueRenderer={customValueRendererEmp}
                                                        labelledBy="Please Select Employee"
                                                        inputValue={searchInputValue} // Add this state if needed
                                                        onInputChange={(newValue) => setSearchInputValue(newValue)}
                                                    />
                                                </div>
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={6} sm={12} xs={12} sx={{ display: 'flex', flexDirection: 'row' }}>
                                            <FormControl fullWidth size="small">
                                                <Typography>Selected Employees</Typography>
                                                <Box
                                                    id="paste-box"
                                                    tabIndex={0}
                                                    sx={{
                                                        border: '1px solid #ccc',
                                                        borderRadius: '3.75px',
                                                        height: '110px',
                                                        overflow: 'auto',
                                                        '& .MuiChip-clickable': {
                                                            margin: '1px',
                                                            cursor: 'pointer',
                                                            userSelect: 'none',
                                                            background: '#e0e0e0',
                                                        },
                                                    }}
                                                    onPaste={handlePasteForEmp}
                                                    onFocus={() => setIsBoxFocused(true)}
                                                    onBlur={(e) => {
                                                        if (isBoxFocused) {
                                                            e.target.focus();
                                                        }
                                                    }}
                                                >
                                                    {valueEmp.map((value) => (
                                                        <Chip key={value} label={value} clickable sx={{ margin: 2, backgroundColor: '#FFF' }} onDelete={(e) => handleDelete(e, value)} onClick={() => console.log('clicked chip')} />
                                                    ))}
                                                </Box>
                                            </FormControl>
                                        </Grid>
                                    </>
                            )}
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
                                            const currentDate = new Date(serverTime).toISOString().split("T")[0];
                                            // if (selectedDate <= currentDate) {
                                            setFilterUser({ ...filterUser, fromdate: selectedDate, todate: selectedDate });
                                            // } else {
                                            // Handle the case where the selected date is in the future (optional)
                                            // You may choose to show a message or take other actions.
                                            // }
                                        }}
                                    // Set the max attribute to the current date
                                    // inputProps={{ max: new Date(serverTime).toISOString().split("T")[0] }}
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
                                            const currentDate = new Date(serverTime).toISOString().split("T")[0];
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
                                            }
                                            // else if (selectedDate <= currentDate) {
                                            else {
                                                setFilterUser({ ...filterUser, todate: selectedDate });
                                            }
                                            // } 
                                            // else {
                                            // }
                                        }}
                                    // Set the max attribute to the current date
                                    // inputProps={{ max: new Date(serverTime).toISOString().split("T")[0], min: filterUser.fromdate !== "" ? filterUser.fromdate : null }}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container spacing={1}>
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
                        </Grid>
                    </Box><br />
                    {/* ****** Table Start ****** */}
                    <Box sx={userStyle.container}>
                        {/* ******************************************************EXPORT Buttons****************************************************** */}
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}> Attendance Mode Report </Typography>
                        </Grid>
                        <Grid container spacing={1} style={userStyle.dataTablestyle}>
                            <Grid item md={2} xs={12} sm={12}>
                                <Box>
                                    <label>Show entries:</label>
                                    <Select
                                        id="pageSizeSelect"
                                        value={pageSizeAttModeReport}
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
                                        <MenuItem value={attModeReport?.length}>  All </MenuItem>
                                    </Select>
                                </Box>
                            </Grid>
                            <Grid item md={8} xs={12} sm={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}  >
                                <Box>
                                    {isUserRoleCompare?.includes("excelattendancemodereport") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen(true)
                                                setFormat("xl")
                                            }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("csvattendancemodereport") && (
                                        <>
                                            <Button onClick={(e) => {
                                                setIsFilterOpen(true)
                                                setFormat("csv")
                                            }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("printattendancemodereport") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleprint}> &ensp;  <FaPrint /> &ensp;Print&ensp; </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("pdfattendancemodereport") && (
                                        <>
                                            <Button sx={userStyle.buttongrp}
                                                onClick={() => {
                                                    setIsPdfFilterOpen(true)
                                                }}
                                            ><FaFilePdf />&ensp;Export to PDF&ensp;</Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("imageattendancemodereport") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}> <ImageIcon sx={{ fontSize: "15px" }} /> &ensp;Image&ensp; </Button>
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
                                                        <IoMdOptions style={{ cursor: 'pointer', }} onClick={handleClickSearchAttModeReport} />
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
                        <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumnsAttModeReport}> Manage Columns  </Button><br /><br />
                        {loader ?
                            <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '350px' }}>
                                <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
                            </Box> :
                            <>
                                <Box sx={{ width: "100%", }} className={"ag-theme-quartz"} ref={gridRefImageAttModeReport} >
                                    <AgGridReact
                                        rowData={filteredDataItems}
                                        columnDefs={columnDataTableAttModeReport.filter((column) => columnVisibilityAttModeReport[column.field])}
                                        ref={gridRefTableAttModeReport}
                                        defaultColDef={defaultColDef}
                                        domLayout={"autoHeight"}
                                        getRowStyle={getRowStyle}
                                        pagination={true}
                                        paginationPageSizeSelector={[]}
                                        paginationPageSize={pageSizeAttModeReport}
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
                                <Box style={userStyle.dataTablestyle}>
                                    {/* show and hide based on the inner filter and outer filter */}
                                    {/* <Box>
                                        Showing{" "}
                                        {filteredRowData.length > 0
                                            ? (filteredRowData.length > 0 ? (pageAttModeReport - 1) * pageSizeAttModeReport + 1 : 0)
                                            : (filteredDataItems.length > 0 ? (pageAttModeReport - 1) * pageSizeAttModeReport + 1 : 0)}
                                        {" "}to{" "}
                                        {filteredRowData.length > 0
                                            ? Math.min(pageAttModeReport * pageSizeAttModeReport, filteredRowData.length)
                                            : Math.min(pageAttModeReport * pageSizeAttModeReport, filteredDataItems.length)}
                                        {" "}of{" "}
                                        {filteredRowData.length > 0 ? filteredRowData.length : filteredDataItems.length} entries
                                    </Box> */}
                                    {/* <Box>
                                        Showing{" "}
                                        {
                                            gridApi && gridApi.getFilterModel() && Object.keys(gridApi.getFilterModel()).length === 0 ? (
                                                (filteredDataItems.length > 0 ? (pageAttModeReport - 1) * pageSizeAttModeReport + 1 : 0)
                                            ) : (
                                                filteredRowData.length > 0 ? (pageAttModeReport - 1) * pageSizeAttModeReport + 1 : 0
                                            )
                                        }{" "}to{" "}
                                        {
                                            gridApi && gridApi.getFilterModel() && Object.keys(gridApi.getFilterModel()).length === 0 ? (
                                                Math.min(pageAttModeReport * pageSizeAttModeReport, filteredDataItems.length)
                                            ) : (
                                                filteredRowData.length > 0 ? Math.min(pageAttModeReport * pageSizeAttModeReport, filteredRowData.length) : 0
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
                                        <Button onClick={() => handlePageChange(1)} disabled={pageAttModeReport === 1} sx={userStyle.paginationbtn}  > <FirstPageIcon /> </Button>
                                        <Button onClick={() => handlePageChange(pageAttModeReport - 1)} disabled={pageAttModeReport === 1} sx={userStyle.paginationbtn}  > <NavigateBeforeIcon />  </Button>
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
                                                className={pageAttModeReport === pageNumber ? "active" : ""}
                                                disabled={pageAttModeReport === pageNumber}
                                            // disabled={pageNumber === "..."}
                                            >
                                                {pageNumber}
                                            </Button>
                                        ))}
                                        <Button onClick={() => handlePageChange(pageAttModeReport + 1)} disabled={pageAttModeReport === totalPagesAttModeReport} sx={userStyle.paginationbtn} > <NavigateNextIcon /> </Button>
                                        <Button onClick={() => handlePageChange(totalPagesAttModeReport)} disabled={pageAttModeReport === totalPagesAttModeReport} sx={userStyle.paginationbtn} ><LastPageIcon /> </Button>
                                    </Box> */}
                                </Box>
                            </>
                        } {/* ****** Table End ****** */}
                    </Box>
                </>
            )
            }
            {/* Manage Column */}
            <Popover
                id={idManageColumnsAttModeReport}
                open={isManageColumnsOpenAttModeReport}
                anchorEl={anchorElAttModeReport}
                onClose={handleCloseManageColumnsAttModeReport}
                anchorOrigin={{ vertical: "bottom", horizontal: "left", }}
            >
                <ManageColumnsContent
                    handleClose={handleCloseManageColumnsAttModeReport}
                    searchQuery={searchQueryManageAttModeReport}
                    setSearchQuery={setSearchQueryManageAttModeReport}
                    filteredColumns={filteredColumns}
                    columnVisibility={columnVisibilityAttModeReport}
                    toggleColumnVisibility={toggleColumnVisibility}
                    setColumnVisibility={setColumnVisibilityAttModeReport}
                    initialColumnVisibility={initialColumnVisibilityAttModeReport}
                    columnDataTable={columnDataTableAttModeReport}
                />
            </Popover>

            {/* Search Bar */}
            <Popover
                id={idSearchAttModeReport}
                open={openSearchAttModeReport}
                anchorEl={anchorElSearchAttModeReport}
                onClose={handleCloseSearchAttModeReport}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }}
            >
                <AdvancedSearchBar columns={columnDataTableAttModeReport} onSearch={applyAdvancedFilter} initialSearchValue={searchQueryAttModeReport} handleCloseSearch={handleCloseSearchAttModeReport} />
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
                itemsTwo={attModeReport ?? []}
                filename={"Attendance Mode Report"}
                exportColumnNames={exportColumnNamescrt}
                exportRowValues={exportRowValuescrt}
                componentRef={componentRef}
            />
        </Box >
    );
}

export default AttendanceModeReportList;