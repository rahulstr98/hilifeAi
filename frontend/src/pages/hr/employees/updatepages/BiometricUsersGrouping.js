import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import LoadingButton from "@mui/lab/LoadingButton";
import {
    Box,
    Button,
    OutlinedInput,
    DialogActions,
    Checkbox,
    FormGroup,
    FormControlLabel,
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
    Dialog,
    TextField,
    Typography
} from "@mui/material";
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
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InfoPopup from "../../../../components/InfoPopup.js";
// import { colourStyles, userStyle } from "../../../../pageStyle";
import {
    DeleteConfirmation,
    PleaseSelectRow,
} from "../../../../components/DeleteConfirmation.js";
function BiometricUsersGrouping() {

    const [AttendanceInSwitchFirst, setAttendanceInSwitchFirst] = useState(false);
    const [AttendanceOutSwitchFirst, setAttendanceOutSwitchFirst] = useState(false);
    const [AttendanceInOutSwitchFirst, setAttendanceInOutSwitchFirst] = useState(false);
    const [ExitInSwitchFirst, setExitInSwitchFirst] = useState(false);
    const [ExitInOutSwitchFirst, setExitInOutSwitchFirst] = useState(false);
    const [ExitOutSwitchFirst, setExitOutSwitchFirst] = useState(false);
    const [BreakSwitchFirst, setBreakSwitchFirst] = useState(false);
    const [AttendanceInSwitchSecond, setAttendanceInSwitchSecond] = useState(false);
    const [AttendanceOutSwitchSecond, setAttendanceOutSwitchSecond] = useState(false);
    const [AttendanceInOutSwitchSecond, setAttendanceInOutSwitchSecond] = useState(false);
    const [ExitInSwitchSecond, setExitInSwitchSecond] = useState(false);
    const [ExitInOutSwitchSecond, setExitInOutSwitchSecond] = useState(false);
    const [ExitOutSwitchSecond, setExitOutSwitchSecond] = useState(false);
    const [BreakSwitchSecond, setBreakSwitchSecond] = useState(false);

    const [pairedDeviceGroupingCreate, setPairedDeviceGroupingCreate] = useState({
        paireddeviceone: "Please Select First Device",
        paireddevicetwo: "",
        pairedstatus: false
    });
    const [pairedDeviceGroupingEdit, setPairedDeviceGroupingEdit] = useState({
        paireddeviceone: "Please Select First Device",
        paireddevicetwo: "",
        pairedstatus: false
    });
    const [AttendanceInSwitchFirstEdit, setAttendanceInSwitchFirstEdit] = useState(false);
    const [AttendanceOutSwitchFirstEdit, setAttendanceOutSwitchFirstEdit] = useState(false);
    const [AttendanceInOutSwitchFirstEdit, setAttendanceInOutSwitchFirstEdit] = useState(false);
    const [ExitInSwitchFirstEdit, setExitInSwitchFirstEdit] = useState(false);
    const [ExitInOutSwitchFirstEdit, setExitInOutSwitchFirstEdit] = useState(false);
    const [ExitOutSwitchFirstEdit, setExitOutSwitchFirstEdit] = useState(false);
    const [BreakSwitchFirstEdit, setBreakSwitchFirstEdit] = useState(false);
    const [AttendanceInSwitchSecondEdit, setAttendanceInSwitchSecondEdit] = useState(false);
    const [AttendanceOutSwitchSecondEdit, setAttendanceOutSwitchSecondEdit] = useState(false);
    const [AttendanceInOutSwitchSecondEdit, setAttendanceInOutSwitchSecondEdit] = useState(false);
    const [ExitInSwitchSecondEdit, setExitInSwitchSecondEdit] = useState(false);
    const [ExitInOutSwitchSecondEdit, setExitInOutSwitchSecondEdit] = useState(false);
    const [ExitOutSwitchSecondEdit, setExitOutSwitchSecondEdit] = useState(false);
    const [BreakSwitchSecondEdit, setBreakSwitchSecondEdit] = useState(false);

    const [PairedDeviceOptions, setPairedDeviceOptions] = useState([]);
    const [PairedDeviceOptionsEdit, setPairedDeviceOptionsEdit] = useState([]);
    const fetchDeviceNamesBasedOnArea = async (company, branch) => {
        setPageName(!pageName)
        try {
            const response = await axios.post(SERVICE.ALL_BIOMETRICDEVICES_PAIRED_DEVICES_AND_UNPAIRED_USER, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                company: company,
                branch: branch,
            });
            console.log(response?.data, 'response?.data');
            const answer = response?.data?.biodevices?.length > 0
                ? response.data.biodevices.flatMap(data =>
                    (data?.pairdevices || []).map(device => ({
                        label: device,
                        value: device,
                        pairedid: data?._id
                    }))
                )
                : [];
            console.log(response?.data, answer, 'response?.data')
            setPairedDeviceOptions(answer)
        } catch (err) {
            console.log(err, 'err')
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const fetchDeviceNamesBasedOnAreaEdit = async (company, branch) => {
        setPageName(!pageName)
        try {
            const response = await axios.post(SERVICE.ALL_BIOMETRICDEVICES_PAIRED_DEVICES_AND_UNPAIRED_USER, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                company: company,
                branch: branch,
            });
            console.log(response?.data, 'response?.data');
            const answer = response?.data?.biodevices?.length > 0
                ? response.data.biodevices.flatMap(data =>
                    (data?.pairdevices || []).map(device => ({
                        label: device,
                        value: device,
                        pairedid: data?._id
                    }))
                )
                : [];
            setPairedDeviceOptionsEdit(answer)
        } catch (err) {
            console.log(err, 'err')
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    const isDisabled = (switchName) => {
        // If no switch is ON, nothing is disabled
        if (
            !AttendanceInSwitchFirst &&
            !AttendanceOutSwitchFirst &&
            !AttendanceInOutSwitchFirst &&
            !AttendanceInSwitchSecond &&
            !AttendanceOutSwitchSecond &&
            !AttendanceInOutSwitchSecond
        ) {
            return false;
        }

        // FIRST group rules
        if (AttendanceInSwitchFirst) {
            return !["AttendanceInSwitchFirst", "AttendanceOutSwitchSecond"].includes(switchName);
        }
        if (AttendanceOutSwitchFirst) {
            return !["AttendanceOutSwitchFirst", "AttendanceInSwitchSecond"].includes(switchName);
        }
        if (AttendanceInOutSwitchFirst) {
            return switchName !== "AttendanceInOutSwitchFirst";
        }

        // SECOND group rules
        if (AttendanceInSwitchSecond) {
            return !["AttendanceInSwitchSecond", "AttendanceOutSwitchFirst"].includes(switchName);
        }
        if (AttendanceOutSwitchSecond) {
            return !["AttendanceOutSwitchSecond", "AttendanceInSwitchFirst"].includes(switchName);
        }
        if (AttendanceInOutSwitchSecond) {
            return switchName !== "AttendanceInOutSwitchSecond";
        }

        return false;
    };
    const isDisabledExit = (switchName) => {
        // If no switch is ON, nothing is disabled
        if (
            !ExitInSwitchFirst &&
            !ExitInOutSwitchFirst &&
            !ExitOutSwitchFirst &&
            !ExitInSwitchSecond &&
            !ExitInOutSwitchSecond &&
            !ExitOutSwitchSecond
        ) {
            return false;
        }

        // FIRST group rules
        if (ExitInSwitchFirst) {
            return !["ExitInSwitchFirst", "ExitOutSwitchSecond"].includes(switchName);
        }
        if (ExitOutSwitchFirst) {
            return !["ExitOutSwitchFirst", "ExitInSwitchSecond"].includes(switchName);
        }
        if (ExitInOutSwitchFirst) {
            return switchName !== "ExitInOutSwitchFirst";
        }

        // SECOND group rules
        if (ExitInSwitchSecond) {
            return !["ExitInSwitchSecond", "ExitOutSwitchFirst"].includes(switchName);
        }
        if (ExitOutSwitchSecond) {
            return !["ExitOutSwitchSecond", "ExitInSwitchFirst"].includes(switchName);
        }
        if (ExitInOutSwitchSecond) {
            return switchName !== "ExitInOutSwitchSecond";
        }

        return false;
    };
    const isDisabledEdit = (switchName) => {
        // If no switch is ON, nothing is disabled
        if (
            !AttendanceInSwitchFirstEdit &&
            !AttendanceOutSwitchFirstEdit &&
            !AttendanceInOutSwitchFirstEdit &&
            !AttendanceInSwitchSecondEdit &&
            !AttendanceOutSwitchSecondEdit &&
            !AttendanceInOutSwitchSecondEdit
        ) {
            return false;
        }

        // FIRST group rules
        if (AttendanceInSwitchFirstEdit) {
            return !["AttendanceInSwitchFirstEdit", "AttendanceOutSwitchSecondEdit"].includes(switchName);
        }
        if (AttendanceOutSwitchFirstEdit) {
            return !["AttendanceOutSwitchFirstEdit", "AttendanceInSwitchSecondEdit"].includes(switchName);
        }
        if (AttendanceInOutSwitchFirstEdit) {
            return switchName !== "AttendanceInOutSwitchFirstEdit";
        }

        // SECOND group rules
        if (AttendanceInSwitchSecondEdit) {
            return !["AttendanceInSwitchSecondEdit", "AttendanceOutSwitchFirstEdit"].includes(switchName);
        }
        if (AttendanceOutSwitchSecondEdit) {
            return !["AttendanceOutSwitchSecondEdit", "AttendanceInSwitchFirstEdit"].includes(switchName);
        }
        if (AttendanceInOutSwitchSecondEdit) {
            return switchName !== "AttendanceInOutSwitchSecondEdit";
        }

        return false;
    };
    const isDisabledExitEdit = (switchName) => {
        // If no switch is ON, nothing is disabled
        if (
            !ExitInSwitchFirstEdit &&
            !ExitInOutSwitchFirstEdit &&
            !ExitOutSwitchFirstEdit &&
            !ExitInSwitchSecondEdit &&
            !ExitInOutSwitchSecondEdit &&
            !ExitOutSwitchSecondEdit
        ) {
            return false;
        }

        // FIRST group rules
        if (ExitInSwitchFirstEdit) {
            return !["ExitInSwitchFirstEdit", "ExitOutSwitchSecondEdit"].includes(switchName);
        }
        if (ExitOutSwitchFirstEdit) {
            return !["ExitOutSwitchFirstEdit", "ExitInSwitchSecondEdit"].includes(switchName);
        }
        if (ExitInOutSwitchFirstEdit) {
            return switchName !== "ExitInOutSwitchFirstEdit";
        }

        // SECOND group rules
        if (ExitInSwitchSecondEdit) {
            return !["ExitInSwitchSecondEdit", "ExitOutSwitchFirstEdit"].includes(switchName);
        }
        if (ExitOutSwitchSecondEdit) {
            return !["ExitOutSwitchSecondEdit", "ExitInSwitchFirstEdit"].includes(switchName);
        }
        if (ExitInOutSwitchSecondEdit) {
            return switchName !== "ExitInOutSwitchSecondEdit";
        }

        return false;
    };
    const handleClearButtons = () => {
        setAttendanceInSwitchFirst(false)
        setAttendanceOutSwitchFirst(false)
        setAttendanceInOutSwitchFirst(false)
        setExitInSwitchFirst(false)
        setExitInOutSwitchFirst(false)
        setExitOutSwitchFirst(false)
        setAttendanceInSwitchSecond(false)
        setAttendanceOutSwitchSecond(false)
        setAttendanceInOutSwitchSecond(false)
        setExitInSwitchSecond(false)
        setExitInOutSwitchSecond(false)
        setExitOutSwitchSecond(false)
        setBreakSwitchFirst(false)
        setBreakSwitchSecond(false)
    };
    const handleClearButtonsEdit = () => {
        setAttendanceInSwitchFirstEdit(false)
        setAttendanceOutSwitchFirstEdit(false)
        setAttendanceInOutSwitchFirstEdit(false)
        setExitInSwitchFirstEdit(false)
        setExitInOutSwitchFirstEdit(false)
        setExitOutSwitchFirstEdit(false)
        setAttendanceInSwitchSecondEdit(false)
        setAttendanceOutSwitchSecondEdit(false)
        setAttendanceInOutSwitchSecondEdit(false)
        setExitInSwitchSecondEdit(false)
        setExitInOutSwitchSecondEdit(false)
        setExitOutSwitchSecondEdit(false)
        setBreakSwitchFirstEdit(false)
        setBreakSwitchSecondEdit(false)
    };

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


    const [isAllUsers, setIsAllUsers] = useState([]);
    // page refersh reload
    const handleCloseFilterMod = () => {
        setIsFilterOpen(false);
    };
    const handleClosePdfFilterMod = () => {
        setIsPdfFilterOpen(false);
    };

    const [fileFormat, setFormat] = useState("");
    let exportColumnNamescrt = ['Company', 'Branch', 'Unit', 'Floor', 'Area', 'Employee Name', 'Pair Device 1',
        'Attendance In',
        'Attendance Out',
        'Attendance In Out',
        'Exit In',
        'Exit Out',
        'Exit In Out',
        'Break',
        'Pair Device 2',
        'Attendance In',
        'Attendance Out',
        'Attendance In Out',
        'Exit In',
        'Exit Out',
        'Exit In Out',
        'Break',
    ]
    let exportRowValuescrt = [
        'company',
        'branch',
        'unit',
        'floor',
        'area',
        'companyname',
        'paireddeviceone',
        'attendanceinone',
        'attendanceoutone',
        'attendanceinoutone',
        'exitinone',
        'exitoutone',
        'exitinoutone',
        'breakone',
        'paireddevicetwo',
        'attendanceintwo',
        'attendanceouttwo',
        'attendanceinouttwo',
        'exitintwo',
        'exitouttwo',
        'exitinouttwo',
        'breaktwo'
    ]
    const gridRef = useRef(null);
    const gridRefTable = useRef(null);
    //useStates
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchQueryManage, setSearchQueryManage] = useState("");
    const [UsersGroupingArray, setUsersGroupingArray] = useState([]);
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
        unit: true,
        team: true,
        companyname: true,
        actions: true,
        department: true,
        type: true,
        devicename: true,
        // biometriccommonname: true,
    };
    const [columnVisibility, setColumnVisibility] = useState(
        initialColumnVisibility
    );
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + "-" + mm + "-" + dd;

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


    //set function to get particular row
    const fetchAllUsers = async (id, name) => {
        setPageName(!pageName)
        try {
            let res = await axios.get(`${SERVICE.ALLUSERENQLIVE}`, {
                headers: { Authorization: `Bearer ${auth.APIToken}` },
            });
            setIsAllUsers(res?.data?.users);
        } catch (err) {
            console.log(err, 'err'); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    useEffect(() => {
        addSerialNumber(UsersGroupingArray);
    }, [UsersGroupingArray]);


    const getapi = async () => {
        let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
            headers: {
                Authorization: `Bearer${auth.APIToken}`,
            },
            empcode: String(isUserRoleAccess?.empcode),
            companyname: String(isUserRoleAccess?.companyname),
            pagename: String("BiometricUsersGrouping"),
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


    //Delete model
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
    //Delete model
    const [isDeleteOpencheckbox, setIsDeleteOpencheckbox] = useState(false);

    const handleClickOpencheckbox = () => {
        setIsDeleteOpencheckbox(true);
    };
    const handleCloseModcheckbox = () => {
        setIsDeleteOpencheckbox(false);
    };
    const delSourcecheckbox = async () => {
        setPageName(!pageName);
        try {
            const deletePromises = selectedRows?.map((item) => {
                return axios.delete(`${SERVICE.SINGLE_BIOMETRIC_USERS_ATTENDANCE_GROUPING}/${item}`, {
                    headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                    },
                });
            });
            // Wait for all delete requests to complete
            await Promise.all(deletePromises);
            setIsHandleChange(false);
            setFilteredRowData([]);
            setFilteredChanges(null);
            handleCloseModcheckbox();
            setSelectedRows([]);
            setPage(1);
            setPopupContent('Deleted Successfully');
            setPopupSeverity('success');
            handleClickOpenPopup();
            await fetchUserGroupingArray();
        } catch (err) {
            console.log(err, 'err')
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;
    const getRowClassName = (params) => {
        if (selectedRows.includes(params.row.id)) {
            return "custom-id-row"; // This is the custom class for rows with item.tat === 'ago'
        }
        return ""; // Return an empty string for other rows
    };
    const [BiometricDeviceNames, setBiometricDeviceNames] = useState([])
    const [duplicateBiometricDevice, setDuplicateBiometricDevice] = useState([])
    const [filterState, setFilterState] = useState({
        type: "Individual",
        devicename: "Please Select Device Name",
        deviceserialnumber: "",
    });
    const [filterStateEdit, setFilterStateEdit] = useState({
        type: "Individual",
        devicename: "Please Select Device Name",
        deviceserialnumber: "",
    });

    const TypeOptions = [
        { label: "Individual", value: "Individual" },
        { label: "Department", value: "Department" },
        { label: "Branch", value: "Branch" },
        { label: "Unit", value: "Unit" },
        { label: "Team", value: "Team" },
    ];


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
        setValueUnitCat([]);
        setSelectedOptionsUnit([]);
        setValueTeamCat([]);
        setSelectedOptionsTeam([]);
        setValueDepartmentCat([]);
        setSelectedOptionsDepartment([]);
        setValueEmployeeCat([]);
        setSelectedOptionsEmployee([]);
        setFilterState((prev) => ({
            ...prev,
            devicename: "Please Select Device Name",
            deviceserialnumber: ""
        }));
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
        const values = options.map((a, index) => {
            return a.value;
        })
        setPairedDeviceGroupingCreate({
            paireddeviceone: "Please Select First Device",
            paireddevicetwo: "",
            pairedstatus: false
        });
        fetchDeviceNamesBasedOnArea(valueCompanyCat, values)
        setSelectedOptionsBranch(options);
        setValueUnitCat([]);
        setSelectedOptionsUnit([]);
        setValueTeamCat([]);
        setSelectedOptionsTeam([]);
        setValueDepartmentCat([]);
        setSelectedOptionsDepartment([]);
        setValueEmployeeCat([]);
        setSelectedOptionsEmployee([]);
        setFilterState((prev) => ({
            ...prev,
            devicename: "Please Select Device Name",
            deviceserialnumber: ""
        }));
    };
    const customValueRendererBranch = (valueBranchCat, _categoryname) => {
        return valueBranchCat?.length
            ? valueBranchCat.map(({ label }) => label)?.join(", ")
            : "Please Select Branch";
    };
    //unit multiselect
    const [selectedOptionsUnit, setSelectedOptionsUnit] = useState([]);
    let [valueUnitCat, setValueUnitCat] = useState([]);
    const handleUnitChange = (options) => {
        setValueUnitCat(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsUnit(options);
        setValueTeamCat([]);
        setSelectedOptionsTeam([]);
        setValueDepartmentCat([]);
        setSelectedOptionsDepartment([]);
        setValueEmployeeCat([]);
        setSelectedOptionsEmployee([]);
    };
    const customValueRendererUnit = (valueUnitCat, _categoryname) => {
        return valueUnitCat?.length
            ? valueUnitCat.map(({ label }) => label)?.join(", ")
            : "Please Select Unit";
    };
    //team multiselect
    const [selectedOptionsTeam, setSelectedOptionsTeam] = useState([]);
    let [valueTeamCat, setValueTeamCat] = useState([]);
    const handleTeamChange = (options) => {
        setValueTeamCat(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsTeam(options);
        setValueDepartmentCat([]);
        setSelectedOptionsDepartment([]);
        setValueEmployeeCat([]);
        setSelectedOptionsEmployee([]);
    };
    const customValueRendererTeam = (valueTeamCat, _categoryname) => {
        return valueTeamCat?.length
            ? valueTeamCat.map(({ label }) => label)?.join(", ")
            : "Please Select Team";
    };
    //department multiselect
    const [selectedOptionsDepartment, setSelectedOptionsDepartment] = useState(
        []
    );
    let [valueDepartmentCat, setValueDepartmentCat] = useState([]);
    const handleDepartmentChange = (options) => {
        setValueDepartmentCat(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsDepartment(options);
        setValueEmployeeCat([]);
        setSelectedOptionsEmployee([]);
    };
    const customValueRendererDepartment = (valueDepartmentCat, _categoryname) => {
        return valueDepartmentCat?.length
            ? valueDepartmentCat.map(({ label }) => label)?.join(", ")
            : "Please Select Department";
    };
    //employee multiselect
    const [selectedOptionsEmployee, setSelectedOptionsEmployee] = useState([]);
    let [valueEmployeeCat, setValueEmployeeCat] = useState([]);
    const handleEmployeeChange = (options) => {
        setValueEmployeeCat(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsEmployee(options);
    };
    const customValueRendererEmployee = (valueEmployeeCat, _categoryname) => {
        return valueEmployeeCat?.length
            ? valueEmployeeCat.map(({ label }) => label)?.join(", ")
            : "Please Select Employee";
    };
    useEffect(() => {
        fetchDepartments();
    }, []);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const fetchDepartments = async () => {
        try {
            let req = await axios.get(SERVICE.DEPARTMENT, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            console.log(req?.data?.departmentdetails, 'Department Details')
            setDepartmentOptions(
                req?.data?.departmentdetails?.map((data) => ({
                    label: data?.deptname,
                    value: data?.deptname,
                }))
            );
        } catch (err) {
            console.log(err, 'err')
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    const TypeCompany = allUsersData
        ?.filter(
            (u) =>
                valueCompanyCat?.includes(u.company)
        )
        .map((u) => ({
            //   ...u,
            label: u.companyname,
            value: u.companyname,
            userid: u._id,
            username: u.username,
        }))

    const TypeBranch = allUsersData
        ?.filter(
            (u) =>
                valueCompanyCat?.includes(u.company) &&
                valueBranchCat?.includes(u.branch)
        )
        .map((u) => ({
            //   ...u,
            label: u.companyname,
            value: u.companyname,
            userid: u._id,
            username: u.username,
        }))

    const TypeUnit = allUsersData
        ?.filter(
            (u) =>
                valueCompanyCat?.includes(u.company) &&
                valueBranchCat?.includes(u.branch) &&
                valueUnitCat?.includes(u.unit)
        )
        .map((u) => ({
            //   ...u,
            label: u.companyname,
            value: u.companyname,
            userid: u._id,
            username: u.username,
        }))

    const TypeTeam = allUsersData
        ?.filter(
            (u) =>
                valueCompanyCat?.includes(u.company) &&
                valueBranchCat?.includes(u.branch) &&
                valueUnitCat?.includes(u.unit) &&
                valueTeamCat?.includes(u.team)
        )
        .map((u) => ({
            //   ...u,
            label: u.companyname,
            value: u.companyname,
            userid: u._id,
            username: u.username,
        }))

    const TypeDepart = allUsersData
        ?.filter(
            (u) =>
                valueCompanyCat?.includes(u.company) &&
                valueDepartmentCat?.includes(u.department)
        )
        .map((u) => ({
            //   ...u,
            label: u.companyname,
            value: u.companyname,
            userid: u._id,
            username: u.username,
        }))

    const TypeEmployee = allUsersData
        ?.filter(
            (u) =>
                valueCompanyCat?.includes(u.company) &&
                valueBranchCat?.includes(u.branch) &&
                valueUnitCat?.includes(u.unit) &&
                valueTeamCat?.includes(u.team) &&
                valueEmployeeCat?.includes(u.companyname)
        )
        .map((u) => ({
            //   ...u,
            label: u.companyname,
            value: u.companyname,
            userid: u._id,
            username: u.username,
        }))


    const fetchBiometricAttendanceInOutDevices = async () => {
        try {
            const res = await axios.get(SERVICE.BIOMETRIC_ATTENDANCE_DEVICE_NAMES, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                }
            });
            console.log(res?.data, 'Device Names');

            const devicename = res?.data?.biometricdevices?.length > 0 ? res?.data?.biometricdevices : [];
            setBiometricDeviceNames(devicename?.map(data => ({
                ...data,
                label: data?.paireddevice,
                value: data?.paireddevice,
            })))
        }
        catch (err) {
            console.log(err, 'err')
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    }
    const handleFindDuplicate = async (device) => {
        try {

            const duplicateDevice = BiometricDeviceNames?.filter(data => device?.originalid === data?.originalid)

            // const res = await axios.post(SERVICE.BIOMETRIC_PAIR_DEVICES_DUPLICATE_SWITCHES_FIND, {
            //     headers: {
            //         Authorization: `Bearer ${auth.APIToken}`,
            //     },
            //     devicename
            // });
            console.log(duplicateDevice, "duplicateDevice")
            setDuplicateBiometricDevice(duplicateDevice.length > 0 ? duplicateDevice : [])
        }
        catch (err) {
            console.log(err, 'err')
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);

        }
    }
    useEffect(() => { fetchBiometricAttendanceInOutDevices() }, [])

    //add function
    const sendRequest = async () => {
        setLoader(true);
        setPageName(!pageName)
        const filterEmployee = filterState?.type === "Individual" ?
            TypeEmployee : filterState?.type === "Department" ? TypeDepart : filterState?.type === "Company" ?
                TypeCompany : filterState?.type === "Branch" ? TypeBranch : filterState?.type === "Unit" ?
                    TypeUnit : filterState?.type === "Team" ? TypeTeam : [];
        const handleCategoryResetByType = (type) => {
            switch (type) {
                case 'individual':
                    // Do nothing
                    break;

                case 'company':
                    setValueBranchCat([]);
                    setValueUnitCat([]);
                    setValueTeamCat([]);
                    setValueDepartmentCat([]);
                    break;

                case 'branch':
                    setValueUnitCat([]);
                    setValueTeamCat([]);
                    setValueDepartmentCat([]);
                    break;

                case 'unit':
                    setValueTeamCat([]);
                    setValueDepartmentCat([]);
                    break;

                case 'team':
                    setValueDepartmentCat([]);
                    break;

                case 'department':
                    setValueUnitCat([]);
                    setValueTeamCat([]);
                    break;

                default:
                    console.warn(`Unhandled type: ${type}`);
            }
        };
        handleCategoryResetByType(filterState?.type);
        try {
            const response = await axios.post(SERVICE.ADD_BIOMETRIC_USERS_ATTENDANCE_GROUPING, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                company: valueCompanyCat,
                branch: valueBranchCat,
                unit: valueUnitCat,
                team: valueTeamCat,
                department: valueDepartmentCat,
                companyname: filterState?.type === "Deactivate" ? [] : filterEmployee?.map(data => data?.value),
                type: filterState?.type,
                devicename: filterState?.devicename,
                deviceserialnumber: filterState?.deviceserialnumber,
                paireddeviceone: String(pairedDeviceGroupingCreate.paireddeviceone),
                paireddevicetwo: String(pairedDeviceGroupingCreate.paireddevicetwo),
                pairedstatus: pairedDeviceGroupingCreate.pairedstatus,
                attendanceinone: AttendanceInSwitchFirst,
                attendanceoutone: AttendanceOutSwitchFirst,
                attendanceinoutone: AttendanceInOutSwitchFirst,
                exitinone: ExitInSwitchFirst,
                exitoutone: ExitOutSwitchFirst,
                exitinoutone: ExitInOutSwitchFirst,
                breakone: BreakSwitchFirst,
                breaktwo: AttendanceInSwitchFirst,
                attendanceintwo: AttendanceInSwitchSecond,
                attendanceouttwo: AttendanceOutSwitchSecond,
                attendanceinouttwo: AttendanceInOutSwitchSecond,
                exitintwo: ExitInSwitchSecond,
                exitouttwo: ExitOutSwitchSecond,
                exitinouttwo: ExitInOutSwitchSecond,
            });
            // console.log(response?.data, "attendance")
            setLoader(false);
            await fetchUserGroupingArray();
            setPopupContent("Added Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) {
            console.log(err, 'err');
            setLoader(false);
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const fetchUserGroupingArray = async () => {
        setLoader(true);
        setPageName(!pageName)
        try {
            const response = await axios.get(SERVICE.GET_BIOMETRIC_USERS_ATTENDANCE_GROUPING, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                }
            });
            const answer = response?.data?.usersgrouping?.length > 0 ? response?.data?.usersgrouping?.map((item, index) => ({
                _id: item._id,
                serialNumber: (index + 1),
                company: item.company?.length > 0 ? item.company?.map((item, i) => `${i + 1 + ". "}` + " " + item).toString() : "",
                branch: item.branch?.length > 0 ? item.branch?.map((item, i) => `${i + 1 + ". "}` + " " + item).toString() : "",
                unit: item.unit?.length > 0 ? item.unit?.map((item, i) => `${i + 1 + ". "}` + " " + item).toString() : "",
                team: item.team?.length > 0 ? item.team?.map((item, i) => `${i + 1 + ". "}` + " " + item).toString() : "",
                department: item.department?.length > 0 ? item.department?.map((item, i) => `${i + 1 + ". "}` + " " + item).toString() : "",
                companyname: item.companyname?.length > 0 ? item.companyname?.map((item, i) => `${i + 1 + ". "}` + " " + item).toString() : "",
                type: item.type,
                paireddeviceone: item.paireddeviceone,
                attendanceinone: item.attendanceinone?.toString(),
                attendanceoutone: item.attendanceoutone?.toString(),
                attendanceinoutone: item.attendanceinoutone?.toString(),
                exitinone: item.exitinone?.toString(),
                exitoutone: item.exitoutone?.toString(),
                exitinoutone: item.exitinoutone?.toString(),
                breakone: item.breakone?.toString(),
                paireddevicetwo: item.paireddevicetwo,
                attendanceintwo: item.attendanceintwo?.toString(),
                attendanceouttwo: item.attendanceouttwo?.toString(),
                attendanceinouttwo: item.attendanceinouttwo?.toString(),
                exitintwo: item.exitintwo?.toString(),
                exitouttwo: item.exitouttwo?.toString(),
                exitinouttwo: item.exitinouttwo?.toString(),
                breaktwo: item.breaktwo?.toString(),
            })) : []
            setLoader(false);
            setUsersGroupingArray(answer)
        } catch (err) {
            console.log(err, 'err');
            setLoader(false);
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    useEffect(() => { fetchUserGroupingArray() }, [])



    const validateAttendanceSwitches = () => {
        const inSwitchesOn = AttendanceInSwitchFirst || AttendanceInSwitchSecond;
        const outSwitchesOn = AttendanceOutSwitchFirst || AttendanceOutSwitchSecond;
        const inOutSwitchesOn = AttendanceInOutSwitchFirst || AttendanceInOutSwitchSecond;

        // Rule 4: Nothing is ON
        if (!inSwitchesOn && !outSwitchesOn && !inOutSwitchesOn) {
            setPopupContentMalert("Turn On Any Attendance switch");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
            return false;
        }

        // Rule 3: If any In/Out is ON → skip checks
        if (inOutSwitchesOn) {
            return true;
        }

        // Rule 1: In → needs Out
        if (inSwitchesOn && !outSwitchesOn) {
            setPopupContentMalert("Please Select Any Attendance Out Switch");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
            return false;
        }

        // Rule 2: Out → needs In
        if (outSwitchesOn && !inSwitchesOn) {
            setPopupContentMalert("Please Select Any Attendance In Switch");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
            return false;
        }

        return true; // All good
    };
    const validateExitSwitches = () => {
        const inSwitchesOn = ExitInSwitchFirst || ExitInSwitchSecond;
        const outSwitchesOn = ExitOutSwitchFirst || ExitOutSwitchSecond;
        const inOutSwitchesOn = ExitInOutSwitchFirst || ExitInOutSwitchSecond;

        // Rule 4: Nothing is ON
        if (!inSwitchesOn && !outSwitchesOn && !inOutSwitchesOn) {
            setPopupContentMalert("Turn On Any Exit switch");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
            return false;
        }

        // Rule 3: If any In/Out is ON → skip checks
        if (inOutSwitchesOn) {
            return true;
        }

        // Rule 1: In → needs Out
        if (inSwitchesOn && !outSwitchesOn) {
            setPopupContentMalert("Please Select Any Exit Out Switch");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
            return false;
        }

        // Rule 2: Out → needs In
        if (outSwitchesOn && !inSwitchesOn) {
            setPopupContentMalert("Please Select Any Exit In Switch");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
            return false;
        }

        return true; // All good
    };
    const validateExitSwitchesEdit = () => {
        const inSwitchesOn = ExitInSwitchFirstEdit || ExitInSwitchSecondEdit;
        const outSwitchesOn = ExitOutSwitchFirstEdit || ExitOutSwitchSecondEdit;
        const inOutSwitchesOn = ExitInOutSwitchFirstEdit || ExitInOutSwitchSecondEdit;

        // Rule 4: Nothing is ON
        if (!inSwitchesOn && !outSwitchesOn && !inOutSwitchesOn) {
            setPopupContentMalert("Turn On Any Exit switch");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
            return false;
        }

        // Rule 3: If any In/Out is ON → skip checks
        if (inOutSwitchesOn) {
            return true;
        }

        // Rule 1: In → needs Out
        if (inSwitchesOn && !outSwitchesOn) {
            setPopupContentMalert("Please Select Any Exit Out Switch");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
            return false;
        }

        // Rule 2: Out → needs In
        if (outSwitchesOn && !inSwitchesOn) {
            setPopupContentMalert("Please Select Any Exit In Switch");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
            return false;
        }

        return true; // All good
    };
    const validateAttendanceSwitchesEdit = () => {
        const inSwitchesOn = AttendanceInSwitchFirstEdit || AttendanceInSwitchSecondEdit;
        const outSwitchesOn = AttendanceOutSwitchFirstEdit || AttendanceOutSwitchSecondEdit;
        const inOutSwitchesOn = AttendanceInOutSwitchFirstEdit || AttendanceInOutSwitchSecondEdit;

        // Rule 4: Nothing is ON
        if (!inSwitchesOn && !outSwitchesOn && !inOutSwitchesOn) {
            setPopupContentMalert("Turn On Any Attendance switch");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
            return false;
        }

        // Rule 3: If any In/Out is ON → skip checks
        if (inOutSwitchesOn) {
            return true;
        }

        // Rule 1: In → needs Out
        if (inSwitchesOn && !outSwitchesOn) {
            setPopupContentMalert("Please Select Any Attendance Out Switch");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
            return false;
        }

        // Rule 2: Out → needs In
        if (outSwitchesOn && !inSwitchesOn) {
            setPopupContentMalert("Please Select Any Attendance In Switch");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
            return false;
        }

        return true; // All good
    };
    //submit option for saving
    const handleSubmit = async (e) => {
        e.preventDefault();

        const filterEmployee = filterState?.type === "Individual" ?
            TypeEmployee : filterState?.type === "Department" ? TypeDepart : filterState?.type === "Company" ?
                TypeCompany : filterState?.type === "Branch" ? TypeBranch : filterState?.type === "Unit" ?
                    TypeUnit : filterState?.type === "Team" ? TypeTeam : [];

        const duplicate = UsersGroupingArray?.some(data => filterEmployee?.map(item => item?.value)?.some(key => data?.companyname?.includes(key))
            && data?.paireddeviceone === pairedDeviceGroupingCreate?.paireddeviceone &&
            data?.type === filterState?.type &&
            (data?.pairedstatus && pairedDeviceGroupingCreate?.pairedstatus && data?.paireddevicetwo === pairedDeviceGroupingCreate?.paireddevicetwo));


        const Switches = !AttendanceInOutSwitchFirst && !AttendanceInSwitchFirst && !AttendanceOutSwitchFirst &&
            !AttendanceInOutSwitchSecond && !AttendanceInSwitchSecond && !AttendanceOutSwitchSecond
            && !BreakSwitchFirst && !ExitInSwitchFirst && !ExitOutSwitchFirst && !ExitInOutSwitchFirst
            && !ExitInSwitchSecond && !ExitOutSwitchSecond && !ExitInOutSwitchSecond && !BreakSwitchSecond;


        const AttendanceSwitches = AttendanceInOutSwitchFirst || AttendanceInSwitchFirst || AttendanceOutSwitchFirst || AttendanceInOutSwitchSecond || AttendanceInSwitchSecond || AttendanceOutSwitchSecond;
        const ExitSwitches = ExitInSwitchFirst || ExitOutSwitchFirst || ExitInOutSwitchFirst || ExitInSwitchSecond || ExitOutSwitchSecond || ExitInOutSwitchSecond

        const breakSwitches = !BreakSwitchFirst && !BreakSwitchSecond;





        if (selectedOptionsCompany?.length === 0) {
            setPopupContentMalert("Please Select Company");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (["Individual", "Branch", "Unit", "Team", "Department"]?.includes(filterState?.type) &&
            selectedOptionsBranch?.length === 0
        ) {
            setPopupContentMalert("Please Select Branch");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (["Individual", "Unit", "Team"]?.includes(filterState?.type) &&
            selectedOptionsUnit?.length === 0
        ) {
            setPopupContentMalert("Please Select Unit");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (["Individual", "Team"]?.includes(filterState?.type) &&
            selectedOptionsTeam?.length === 0
        ) {
            setPopupContentMalert("Please Select Team");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }

        else if (filterState?.type === "Department" &&
            selectedOptionsDepartment?.length === 0
        ) {
            setPopupContentMalert("Please Select Department!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (filterState?.type === "Individual" &&
            selectedOptionsEmployee?.length === 0
        ) {
            setPopupContentMalert("Please Select Employee Names");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (pairedDeviceGroupingCreate?.paireddeviceone === "Please Select First Device" || pairedDeviceGroupingCreate?.paireddeviceone === "") {
            setPopupContentMalert("Please Select Device Name!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (Switches) {
            setPopupContentMalert('Please Select Any of the Switches');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }

        else if (breakSwitches && pairedDeviceGroupingCreate.pairedstatus && AttendanceSwitches && !validateAttendanceSwitches()) {
            return; // Stop save
        }
        else if (breakSwitches && pairedDeviceGroupingCreate.pairedstatus && ExitSwitches && !validateExitSwitches()) {
            return; // Stop save
        }
        else if (duplicate) {
            setPopupContentMalert('Already this devices paired');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        else {
            sendRequest();
        }
    };



    const handleclear = (e) => {
        e.preventDefault();
        setFilterState({
            type: "Individual",
            devicename: "Please Select Device Name",
            deviceserialnumber: ""
        });
        // setBiometricDeviceNames([])
        // setFilteredRowData([])
        // setFilteredChanges(null)
        setSelectedOptionsEmployee([]);
        setValueCompanyCat([]);
        setSelectedOptionsCompany([]);
        setValueBranchCat([]);
        setSelectedOptionsBranch([]);
        setValueUnitCat([]);
        setSelectedOptionsUnit([]);
        setValueTeamCat([]);
        setSelectedOptionsTeam([]);
        setUsersGroupingArray([]);
        setPairedDeviceGroupingCreate({
            paireddeviceone: "Please Select First Device",
            paireddevicetwo: "",
            pairedstatus: false
        });
        setPairedDeviceOptions([]);
        setAttendanceInSwitchFirst(false)
        setAttendanceOutSwitchFirst(false)
        setAttendanceInOutSwitchFirst(false)
        setExitInSwitchFirst(false)
        setExitInOutSwitchFirst(false)
        setExitOutSwitchFirst(false)
        setAttendanceInSwitchSecond(false)
        setAttendanceOutSwitchSecond(false)
        setAttendanceInOutSwitchSecond(false)
        setExitInSwitchSecond(false)
        setExitInOutSwitchSecond(false)
        setExitOutSwitchSecond(false)
        setPopupContent("Cleared Successfully");
        setPopupSeverity("success");
        handleClickOpenPopup();
        setLoader(false);
    };





    // Edit Section
    //company multiselect
    const [selectedOptionsCompanyEdit, setSelectedOptionsCompanyEdit] = useState([]);
    let [valueCompanyCatEdit, setValueCompanyCatEdit] = useState([]);

    const handleCompanyChangeEdit = (options) => {
        setValueCompanyCatEdit(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsCompanyEdit(options);
        setValueBranchCatEdit([]);
        setSelectedOptionsBranchEdit([]);
        setValueUnitCatEdit([]);
        setSelectedOptionsUnitEdit([]);
        setValueTeamCatEdit([]);
        setSelectedOptionsTeamEdit([]);
        setValueDepartmentCatEdit([]);
        setSelectedOptionsDepartmentEdit([]);
        setValueEmployeeCatEdit([]);
        setSelectedOptionsEmployeeEdit([]);
        setFilterState((prev) => ({
            ...prev,
            devicename: "Please Select Device Name",
            deviceserialnumber: ""
        }));
    };
    const customValueRendererCompanyEdit = (valueCompanyCat, _categoryname) => {
        return valueCompanyCat?.length
            ? valueCompanyCat.map(({ label }) => label)?.join(", ")
            : "Please Select Company";
    };
    //branch multiselect
    const [selectedOptionsBranchEdit, setSelectedOptionsBranchEdit] = useState([]);
    let [valueBranchCatEdit, setValueBranchCatEdit] = useState([]);
    const handleBranchChangeEdit = (options) => {
        setValueBranchCatEdit(
            options.map((a, index) => {
                return a.value;
            })
        );
        const values = options.map((a, index) => {
            return a.value;
        });
        setPairedDeviceGroupingEdit({
            paireddeviceone: "Please Select First Device",
            paireddevicetwo: "",
            pairedstatus: false
        });
        fetchDeviceNamesBasedOnAreaEdit(valueCompanyCatEdit, values)
        setSelectedOptionsBranchEdit(options);
        setValueUnitCatEdit([]);
        setSelectedOptionsUnitEdit([]);
        setValueTeamCatEdit([]);
        setSelectedOptionsTeamEdit([]);
        setValueDepartmentCatEdit([]);
        setSelectedOptionsDepartmentEdit([]);
        setValueEmployeeCatEdit([]);
        setSelectedOptionsEmployeeEdit([]);
        setFilterState((prev) => ({
            ...prev,
            devicename: "Please Select Device Name",
            deviceserialnumber: ""
        }));
    };
    const customValueRendererBranchEdit = (valueBranchCat, _categoryname) => {
        return valueBranchCat?.length
            ? valueBranchCat.map(({ label }) => label)?.join(", ")
            : "Please Select Branch";
    };
    //unit multiselect
    const [selectedOptionsUnitEdit, setSelectedOptionsUnitEdit] = useState([]);
    let [valueUnitCatEdit, setValueUnitCatEdit] = useState([]);
    const handleUnitChangeEdit = (options) => {
        setValueUnitCatEdit(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsUnitEdit(options);
        setValueTeamCatEdit([]);
        setSelectedOptionsTeamEdit([]);
        setValueDepartmentCatEdit([]);
        setSelectedOptionsDepartmentEdit([]);
        setValueEmployeeCatEdit([]);
        setSelectedOptionsEmployeeEdit([]);
    };
    const customValueRendererUnitEdit = (valueUnitCat, _categoryname) => {
        return valueUnitCat?.length
            ? valueUnitCat.map(({ label }) => label)?.join(", ")
            : "Please Select Unit";
    };
    //team multiselect
    const [selectedOptionsTeamEdit, setSelectedOptionsTeamEdit] = useState([]);
    let [valueTeamCatEdit, setValueTeamCatEdit] = useState([]);
    const handleTeamChangeEdit = (options) => {
        setValueTeamCatEdit(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsTeamEdit(options);
        setValueDepartmentCatEdit([]);
        setSelectedOptionsDepartmentEdit([]);
        setValueEmployeeCatEdit([]);
        setSelectedOptionsEmployeeEdit([]);
    };
    const customValueRendererTeamEdit = (valueTeamCat, _categoryname) => {
        return valueTeamCat?.length
            ? valueTeamCat.map(({ label }) => label)?.join(", ")
            : "Please Select Team";
    };
    //department multiselect
    const [selectedOptionsDepartmentEdit, setSelectedOptionsDepartmentEdit] = useState(
        []
    );
    let [valueDepartmentCatEdit, setValueDepartmentCatEdit] = useState([]);
    const handleDepartmentChangeEdit = (options) => {
        setValueDepartmentCatEdit(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsDepartmentEdit(options);
        setValueEmployeeCatEdit([]);
        setSelectedOptionsEmployeeEdit([]);
    };
    const customValueRendererDepartmentEdit = (valueDepartmentCat, _categoryname) => {
        return valueDepartmentCat?.length
            ? valueDepartmentCat.map(({ label }) => label)?.join(", ")
            : "Please Select Department";
    };
    //employee multiselect
    const [selectedOptionsEmployeeEdit, setSelectedOptionsEmployeeEdit] = useState([]);
    let [valueEmployeeCatEdit, setValueEmployeeCatEdit] = useState([]);
    const handleEmployeeChangeEdit = (options) => {
        setValueEmployeeCatEdit(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedOptionsEmployeeEdit(options);
    };
    const customValueRendererEmployeeEdit = (valueEmployeeCat, _categoryname) => {
        return valueEmployeeCat?.length
            ? valueEmployeeCat.map(({ label }) => label)?.join(", ")
            : "Please Select Employee";
    };

    const gridRefTableImg = useRef(null);
    // image
    const handleCaptureImage = () => {
        if (gridRefTableImg.current) {
            domtoimage.toBlob(gridRefTableImg.current)
                .then((blob) => {
                    saveAs(blob, "BiometricUsersGrouping.png");
                })
                .catch((error) => {
                    console.error("dom-to-image error: ", error);
                });
        }
    };


    const TypeCompanyEdit = allUsersData
        ?.filter(
            (u) =>
                valueCompanyCatEdit?.includes(u.company)
        )
        .map((u) => ({
            //   ...u,
            label: u.companyname,
            value: u.companyname,
            userid: u._id,
            username: u.username,
        }))

    const TypeBranchEdit = allUsersData
        ?.filter(
            (u) =>
                valueCompanyCatEdit?.includes(u.company) &&
                valueBranchCatEdit?.includes(u.branch)
        )
        .map((u) => ({
            //   ...u,
            label: u.companyname,
            value: u.companyname,
            userid: u._id,
            username: u.username,
        }))

    const TypeUnitEdit = allUsersData
        ?.filter(
            (u) =>
                valueCompanyCatEdit?.includes(u.company) &&
                valueBranchCatEdit?.includes(u.branch) &&
                valueUnitCatEdit?.includes(u.unit)
        )
        .map((u) => ({
            //   ...u,
            label: u.companyname,
            value: u.companyname,
            userid: u._id,
            username: u.username,
        }))

    const TypeTeamEdit = allUsersData
        ?.filter(
            (u) =>
                valueCompanyCatEdit?.includes(u.company) &&
                valueBranchCatEdit?.includes(u.branch) &&
                valueUnitCatEdit?.includes(u.unit) &&
                valueTeamCatEdit?.includes(u.team)
        )
        .map((u) => ({
            //   ...u,
            label: u.companyname,
            value: u.companyname,
            userid: u._id,
            username: u.username,
        }))

    const TypeDepartEdit = allUsersData
        ?.filter(
            (u) =>
                valueCompanyCatEdit?.includes(u.company) &&
                valueDepartmentCatEdit?.includes(u.department)
        )
        .map((u) => ({
            //   ...u,
            label: u.companyname,
            value: u.companyname,
            userid: u._id,
            username: u.username,
        }))

    const TypeEmployeeEdit = allUsersData
        ?.filter(
            (u) =>
                valueCompanyCatEdit?.includes(u.company) &&
                valueBranchCatEdit?.includes(u.branch) &&
                valueUnitCatEdit?.includes(u.unit) &&
                valueTeamCatEdit?.includes(u.team) &&
                valueEmployeeCatEdit?.includes(u.companyname)
        )
        .map((u) => ({
            //   ...u,
            label: u.companyname,
            value: u.companyname,
            userid: u._id,
            username: u.username,
        }))

    const editSubmit = (e) => {
        e.preventDefault();

        const filterEmployee = filterStateEdit?.type === "Individual" ?
            TypeEmployeeEdit : filterStateEdit?.type === "Department" ? TypeDepartEdit : filterStateEdit?.type === "Company" ?
                TypeCompanyEdit : filterStateEdit?.type === "Branch" ? TypeBranchEdit : filterStateEdit?.type === "Unit" ?
                    TypeUnitEdit : filterStateEdit?.type === "Team" ? TypeTeamEdit : [];

        const duplicate = UsersGroupingArray?.filter(data => data?._id !== UsersGroupingArrayEdit?._id)?.some(data =>
            filterEmployee?.map(item => item?.value)?.some(key => data?.companyname?.includes(key))
            && data?.paireddeviceone === pairedDeviceGroupingEdit?.paireddeviceone &&
            data?.type === filterStateEdit?.type &&
            (data?.pairedstatus && pairedDeviceGroupingEdit?.pairedstatus && data?.paireddevicetwo === pairedDeviceGroupingEdit?.paireddevicetwo));
        console.log(duplicate, 'duplicate')


        const Switches = !AttendanceInOutSwitchFirstEdit && !AttendanceInSwitchFirstEdit && !AttendanceOutSwitchFirstEdit &&
            !AttendanceInOutSwitchSecondEdit && !AttendanceInSwitchSecondEdit && !AttendanceOutSwitchSecondEdit
            && !BreakSwitchFirstEdit && !ExitInSwitchFirstEdit && !ExitOutSwitchFirstEdit && !ExitInOutSwitchFirstEdit
            && !ExitInSwitchSecondEdit && !ExitOutSwitchSecondEdit && !ExitInOutSwitchSecondEdit && !BreakSwitchSecondEdit;


        const AttendanceSwitches = AttendanceInOutSwitchFirstEdit || AttendanceInSwitchFirstEdit || AttendanceOutSwitchFirstEdit || AttendanceInOutSwitchSecondEdit || AttendanceInSwitchSecondEdit || AttendanceOutSwitchSecondEdit;
        const ExitSwitches = ExitInSwitchFirstEdit || ExitOutSwitchFirstEdit || ExitInOutSwitchFirstEdit || ExitInSwitchSecondEdit || ExitOutSwitchSecondEdit || ExitInOutSwitchSecondEdit

        const breakSwitches = !BreakSwitchFirstEdit && !BreakSwitchSecondEdit;



        if (selectedOptionsCompanyEdit?.length === 0) {
            setPopupContentMalert("Please Select Company");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (["Individual", "Branch", "Unit", "Team", "Department"]?.includes(filterStateEdit?.type) &&
            selectedOptionsBranchEdit?.length === 0
        ) {
            setPopupContentMalert("Please Select Branch");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (["Individual", "Unit", "Team"]?.includes(filterStateEdit?.type) &&
            selectedOptionsUnitEdit?.length === 0
        ) {
            setPopupContentMalert("Please Select Unit");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (["Individual", "Team"]?.includes(filterStateEdit?.type) &&
            selectedOptionsTeamEdit?.length === 0
        ) {
            setPopupContentMalert("Please Select Team");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (filterStateEdit?.type === "Department" &&
            selectedOptionsDepartmentEdit?.length === 0
        ) {
            setPopupContentMalert("Please Select Department!");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (filterStateEdit?.type === "Individual" &&
            selectedOptionsEmployeeEdit?.length === 0
        ) {
            setPopupContentMalert("Please Select Employee Names");
            setPopupSeverityMalert("warning");
            handleClickOpenPopupMalert();
        }
        else if (pairedDeviceGroupingEdit.paireddeviceone === 'Please Select First Device') {
            setPopupContentMalert('Please Select Device 1');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        else if (Switches) {
            setPopupContentMalert('Please Select Any of the Switches');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        else if (breakSwitches && pairedDeviceGroupingEdit.pairedstatus && AttendanceSwitches && !validateAttendanceSwitchesEdit()) {
            return; // Stop save
        }
        else if (breakSwitches && pairedDeviceGroupingEdit.pairedstatus && ExitSwitches && !validateExitSwitchesEdit()) {
            return; // Stop save
        }
        else if (duplicate) {
            setPopupContentMalert('Already this devices paired');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        else {
            editRequest();
        }
    };

    const editRequest = async () => {
        setLoader(true);
        setPageName(!pageName)
        const filterEmployee = filterStateEdit?.type === "Individual" ?
            TypeEmployeeEdit : filterStateEdit?.type === "Department" ? TypeDepartEdit : filterStateEdit?.type === "Company" ?
                TypeCompanyEdit : filterState?.type === "Branch" ? TypeBranchEdit : filterStateEdit?.type === "Unit" ?
                    TypeUnitEdit : filterState?.type === "Team" ? TypeTeamEdit : [];
        try {
            const response = await axios.put(`${SERVICE.SINGLE_BIOMETRIC_USERS_ATTENDANCE_GROUPING}/${UsersGroupingArrayEdit?._id}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                company: valueCompanyCatEdit,
                branch: valueBranchCatEdit,
                unit: valueUnitCatEdit,
                team: valueTeamCatEdit,
                department: valueDepartmentCatEdit,
                companyname: filterStateEdit?.type === "Deactivate" ? [] : filterEmployee?.map(data => data?.value),
                type: filterStateEdit?.type,
                devicename: filterStateEdit?.devicename,
                deviceserialnumber: filterStateEdit?.deviceserialnumber,
                paireddeviceone: String(pairedDeviceGroupingEdit.paireddeviceone),
                paireddevicetwo: String(pairedDeviceGroupingEdit.paireddevicetwo),
                pairedstatus: pairedDeviceGroupingEdit.pairedstatus,
                attendanceinone: AttendanceInSwitchFirstEdit,
                attendanceoutone: AttendanceOutSwitchFirstEdit,
                attendanceinoutone: AttendanceInOutSwitchFirstEdit,
                exitinone: ExitInSwitchFirstEdit,
                exitoutone: ExitOutSwitchFirstEdit,
                exitinoutone: ExitInOutSwitchFirstEdit,
                breakone: BreakSwitchFirstEdit,
                breaktwo: AttendanceInSwitchFirstEdit,
                attendanceintwo: AttendanceInSwitchSecondEdit,
                attendanceouttwo: AttendanceOutSwitchSecondEdit,
                attendanceinouttwo: AttendanceInOutSwitchSecondEdit,
                exitintwo: ExitInSwitchSecondEdit,
                exitouttwo: ExitOutSwitchSecondEdit,
                exitinouttwo: ExitInOutSwitchSecondEdit,
            });
            // console.log(response?.data, "attendance")
            setLoader(false);
            handleCloseModEdit()
            await fetchUserGroupingArray();
            setPopupContent("Updated Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) {
            console.log(err, 'err');
            setLoader(false);
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    // Excel
    const fileName = "BiometricUsersGrouping";
    //print...
    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: "Biometric Users Grouping",
        pageStyle: "print",
    });
    const addSerialNumber = (datas) => {
        setItems(datas);
    };

    const handleSelectionChange = (newSelection) => {
        setSelectedRows(newSelection.selectionModel);
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

    const [UsersGroupingArrayEdit, setUsersGroupingArrayEdit] = useState([]);
    const [openInfo, setOpeninfo] = useState(false);

    const handleClickOpeninfo = () => {
        setOpeninfo(true);
    };
    const handleCloseinfo = () => {
        setOpeninfo(false);
    };
    //View functionalities...
    const [openview, setOpenview] = useState(false);
    // view model
    const handleClickOpenview = () => {
        setOpenview(true);
    };
    const handleCloseview = () => {
        setOpenview(false);
    };
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const handleClickOpen = () => {
        setIsDeleteOpen(true);
    };
    const handleCloseMod = () => {
        setIsDeleteOpen(false);
    };
    //Edit model...
    const [isEditOpen, setIsEditOpen] = useState(false);
    const handleClickOpenEdit = () => {
        setIsEditOpen(true);
    };
    const handleCloseModEdit = (e, reason) => {
        if (reason && reason === 'backdropClick') return;
        setIsEditOpen(false);
    };

    let updateby = UsersGroupingArrayEdit?.updatedby;
    let addedby = UsersGroupingArrayEdit?.addedby;
    const getinfoCode = async (e, page) => {
        console.log(page, "page")
        setPageName(!pageName);
        try {
            let res = await axios.get(`${SERVICE.SINGLE_BIOMETRIC_USERS_ATTENDANCE_GROUPING}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            const editData = res?.data?.susersgrouping
            setUsersGroupingArrayEdit(res?.data?.susersgrouping);
            if (page === 'info') {
                handleClickOpeninfo();
            }
            else if (page === 'edit') {
                const { attendanceinone, attendanceoutone,
                    attendanceinoutone, exitinone, exitoutone, exitinoutone, breakone,
                    breaktwo, attendanceintwo, attendanceouttwo,
                    attendanceinouttwo, exitintwo, exitouttwo, exitinouttwo } = res?.data?.susersgrouping;
                setPairedDeviceGroupingEdit({
                    paireddeviceone: res?.data?.susersgrouping?.paireddeviceone,
                    paireddevicetwo: res?.data?.susersgrouping?.paireddevicetwo,
                    pairedstatus: res?.data?.susersgrouping?.pairedstatus
                });
                fetchDeviceNamesBasedOnAreaEdit(editData?.company, editData?.branch);
                setAttendanceInSwitchFirstEdit(attendanceinone)
                setAttendanceOutSwitchFirstEdit(attendanceoutone)
                setAttendanceInOutSwitchFirstEdit(attendanceinoutone)
                setExitInSwitchFirstEdit(exitinone)
                setExitInOutSwitchFirstEdit(exitinoutone)
                setExitOutSwitchFirstEdit(exitoutone)
                setAttendanceInSwitchSecondEdit(attendanceintwo)
                setAttendanceOutSwitchSecondEdit(attendanceouttwo)
                setAttendanceInOutSwitchSecondEdit(attendanceinouttwo)
                setExitInSwitchSecondEdit(exitintwo)
                setExitInOutSwitchSecondEdit(exitinouttwo)
                setExitOutSwitchSecondEdit(exitouttwo)
                setBreakSwitchFirstEdit(breakone)
                setBreakSwitchSecondEdit(breaktwo)
                setFilterStateEdit({ type: editData?.type, devicename: editData?.devicename, deviceserialnumber: editData?.deviceserialnumber })
                setValueCompanyCatEdit(editData?.company)
                setValueBranchCatEdit(editData?.branch)
                setValueUnitCatEdit(editData?.unit)
                setValueTeamCatEdit(editData?.team)
                setValueDepartmentCatEdit(editData?.department)
                setValueEmployeeCatEdit(editData?.companyname)
                setSelectedOptionsCompanyEdit(editData?.company?.length > 0 ? editData?.company?.map(data => ({
                    label: data,
                    value: data,
                })) : [])
                setSelectedOptionsBranchEdit(editData?.branch?.length > 0 ? editData?.branch?.map(data => ({
                    label: data,
                    value: data,
                })) : []);
                setSelectedOptionsUnitEdit(editData?.unit?.length > 0 ? editData?.unit?.map(data => ({
                    label: data,
                    value: data,
                })) : []);
                setSelectedOptionsTeamEdit(editData?.team?.length > 0 ? editData?.team?.map(data => ({
                    label: data,
                    value: data,
                })) : []);
                setSelectedOptionsDepartmentEdit(editData?.department?.length > 0 ? editData?.department?.map(data => ({
                    label: data,
                    value: data,
                })) : []);
                setSelectedOptionsEmployeeEdit(editData?.companyname?.length > 0 ? editData?.companyname?.map(data => ({
                    label: data,
                    value: data,
                })) : []);
                handleClickOpenEdit();
                await fetchUserGroupingArray();
            }
            else if (page === 'delete') {
                handleClickOpen();
            }
            else if (page === 'view') {
                handleClickOpenview();
            }

        } catch (err) {
            console.log(err, 'err'); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    let groupid = UsersGroupingArrayEdit?._id;
    const delProject = async () => {
        setPageName(!pageName);
        try {
            let res = await axios.delete(`${SERVICE.SINGLE_BIOMETRIC_USERS_ATTENDANCE_GROUPING}/${groupid}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            await fetchUserGroupingArray();
            handleCloseMod();
            setPage(1);
            setPopupContent("Deleted Successfully");
            setPopupSeverity("success");
            handleClickOpenPopup();
        } catch (err) {
            console.log(err, 'err'); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const [selectAllChecked, setSelectAllChecked] = useState(false);

    const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
        <div>
            <Checkbox checked={selectAllChecked} onChange={onSelectAll} />
        </div>
    );
    const columnDataTable = [
        {
            field: 'checkbox',
            headerName: 'Checkbox', // Default header name
            headerStyle: {
                fontWeight: 'bold', // Apply the font-weight style to make the header text bold
                // Add any other CSS styles as needed
            },

            sortable: false, // Optionally, you can make this column not sortable
            width: 90,
            headerCheckboxSelection: true,
            checkboxSelection: true,
            hide: !columnVisibility.checkbox,
            headerClassName: 'bold-header',
            pinned: 'left',
        },
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
            field: "type",
            headerName: "Type",
            flex: 0,
            width: 100,
            hide: !columnVisibility.type,
            headerClassName: "bold-header",

        },
        {
            field: "company",
            headerName: "Company",
            flex: 0,
            width: 200,
            hide: !columnVisibility.company,
            headerClassName: "bold-header",

        },
        {
            field: "branch",
            headerName: "Branch",
            flex: 0,
            width: 200,
            hide: !columnVisibility.branch,
            headerClassName: "bold-header",
        },
        {
            field: "unit",
            headerName: "Unit",
            flex: 0,
            width: 200,
            hide: !columnVisibility.unit,
            headerClassName: "bold-header",
        },
        {
            field: "team",
            headerName: "Team",
            flex: 0,
            width: 200,
            hide: !columnVisibility.team,
            headerClassName: "bold-header",
        },
        {
            field: "department",
            headerName: "Department",
            flex: 0,
            width: 200,
            hide: !columnVisibility.department,
            headerClassName: "bold-header",
        },

        {
            field: "companyname",
            headerName: "Employee Name",
            flex: 0,
            width: 250,
            hide: !columnVisibility.companyname,
            headerClassName: "bold-header",
        },
        {
            field: "pairedeviceone",
            headerName: "Paired Device Name 1",
            flex: 0,
            width: 250,
            hide: !columnVisibility.pairedeviceone,
            headerClassName: "bold-header",
        },
        {
            field: "pairedevicetwo",
            headerName: "Paired Device Name 2",
            flex: 0,
            width: 250,
            hide: !columnVisibility.pairedevicetwo,
            headerClassName: "bold-header",
        },

        {
            field: "actions",
            headerName: "Action",
            flex: 0,
            width: 300,
            minHeight: "40px !important",
            sortable: false,
            hide: !columnVisibility.actions,
            headerClassName: "bold-header",
            cellRenderer: (params) => (
                <Grid sx={{ display: "flex" }}>
                    {isUserRoleCompare?.includes("ebiometricusersgrouping") && (
                        <Button
                            sx={userStyle.buttondelete}
                            onClick={(e) => {
                                getinfoCode(params.data.id, "edit");
                            }}
                        >
                            <EditOutlinedIcon sx={buttonStyles.buttonedit} />
                        </Button>
                    )}
                    {isUserRoleCompare?.includes("dbiometricusersgrouping") && (
                        <Button
                            sx={userStyle.buttondelete}
                            onClick={(e) => {
                                getinfoCode(params.data.id, "delete");
                            }}
                        >
                            <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />
                        </Button>
                    )}
                    {isUserRoleCompare?.includes("vbiometricusersgrouping") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getinfoCode(params.data.id, 'view');
                            }}
                        >
                            <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />
                        </Button>
                    )}
                    {isUserRoleCompare?.includes("ibiometricusersgrouping") && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getinfoCode(params.data.id, 'info');
                            }}
                        >
                            <InfoOutlinedIcon sx={buttonStyles.buttoninfo} />
                        </Button>
                    )}

                </Grid>
            ),
        },

    ];
    const rowDataTable = filteredData.map((item, index) => {
        return {
            id: item._id,
            serialNumber: item.serialNumber,
            company: item.company,
            branch: item.branch,
            unit: item.unit,
            team: item.team,
            department: item.department,
            companyname: item.companyname,
            type: item.type,
            paireddeviceone: item.paireddeviceone,
            attendanceinone: item.attendanceinone,
            attendanceoutone: item.attendanceoutone,
            attendanceinoutone: item.attendanceinoutone,
            exitinone: item.exitinone,
            exitoutone: item.exitoutone,
            exitinoutone: item.exitinoutone,
            breakone: item.breakone,
            paireddevicetwo: item.paireddevicetwo,
            attendanceintwo: item.attendanceintwo,
            attendanceouttwo: item.attendanceouttwo,
            attendanceinouttwo: item.attendanceinouttwo,
            exitintwo: item.exitintwo,
            exitouttwo: item.exitouttwo,
            exitinouttwo: item.exitinouttwo,
            breaktwo: item.breaktwo,

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

    const handleAutoSelect = async () => {
        setPageName(!pageName)
        try {

            let selectedValues = accessbranch
                ?.map((data) => ({
                    company: data.company,
                    branch: data.branch,
                    unit: data.unit,
                }))
                .filter(
                    (value, index, self) =>
                        index ===
                        self.findIndex(
                            (t) =>
                                t.company === value.company &&
                                t.branch === value.branch &&
                                t.unit === value.unit
                        )
                );

            let selectedCompany = selectedValues
                ?.filter(
                    (value, index, self) =>
                        index === self.findIndex((t) => t.company === value.company)
                )
                .map((a, index) => {
                    return a.company;
                });

            let mappedCompany = selectedValues
                ?.filter(
                    (value, index, self) =>
                        index === self.findIndex((t) => t.company === value.company)
                )
                ?.map((data) => ({
                    label: data?.company,
                    value: data?.company,
                }));

            setValueCompanyCat(selectedCompany);
            setSelectedOptionsCompany(mappedCompany);




            let selectedBranch = selectedValues
                .filter(
                    (value, index, self) =>
                        index ===
                        self.findIndex(
                            (t) => t.company === value.company && t.branch === value.branch
                        )
                )
                .map((a, index) => {
                    return a.branch;
                });

            let mappedBranch = selectedValues
                .filter(
                    (value, index, self) =>
                        index ===
                        self.findIndex(
                            (t) => t.company === value.company && t.branch === value.branch
                        )
                )
                ?.map((data) => ({
                    label: data?.branch,
                    value: data?.branch,
                }));

            setValueBranchCat(selectedBranch);
            setSelectedOptionsBranch(mappedBranch);


            let selectedUnit = selectedValues
                .filter(
                    (value, index, self) =>
                        index ===
                        self.findIndex(
                            (t) =>
                                t.company === value.company &&
                                t.branch === value.branch &&
                                t.unit === value.unit
                        )
                )
                .map((a, index) => {
                    return a.unit;
                });

            let mappedUnit = selectedValues
                .filter(
                    (value, index, self) =>
                        index ===
                        self.findIndex(
                            (t) =>
                                t.company === value.company &&
                                t.branch === value.branch &&
                                t.unit === value.unit
                        )
                )
                ?.map((data) => ({
                    label: data?.unit,
                    value: data?.unit,
                }));

            setValueUnitCat(selectedUnit);
            setSelectedOptionsUnit(mappedUnit);


            let mappedTeam = allTeam
                ?.filter(
                    (u) =>
                        selectedCompany?.includes(u.company) &&
                        selectedBranch?.includes(u.branch) &&
                        selectedUnit?.includes(u.unit)
                )
                .map((u) => ({
                    label: u.teamname,
                    value: u.teamname,
                }));

            let selectedTeam = allTeam
                ?.filter(
                    (u) =>
                        selectedCompany?.includes(u.company) &&
                        selectedBranch?.includes(u.branch) &&
                        selectedUnit?.includes(u.unit)
                )
                .map((u) => u.teamname);

            setValueTeamCat(selectedTeam);
            setSelectedOptionsTeam(mappedTeam);


            fetchDeviceNamesBasedOnArea(selectedCompany, selectedBranch)
        } catch (err) {
            console.log(err, 'err')
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };



    useEffect(() => {
        handleAutoSelect();
    }, [isAssignBranch]);

    return (
        <Box>
            <Headtitle title={"BIOMETRIC USERS GROUPING PAGE"} />
            <PageHeading
                title="Biometric Users Grouping"
                modulename="Human Resources"
                submodulename="HR"
                mainpagename="Attendance"
                subpagename="Biometric Device"
                subsubpagename="Biometric Users Grouping"
            />
            {isUserRoleCompare?.includes("abiometricusersgrouping") && (
                <Box sx={userStyle.selectcontainer}>

                    <>
                        <Typography sx={userStyle.importheadtext}>Add Biometric Users Grouping</Typography>
                        <br />
                        <Grid container spacing={2}>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        Type<b style={{ color: "red" }}>*</b>
                                    </Typography>
                                    <Selects
                                        options={TypeOptions}
                                        // styles={colourStyles}
                                        value={{
                                            label: filterState.type ?? "Please Select Type",
                                            value: filterState.type ?? "Please Select Type",
                                        }}
                                        onChange={(e) => {
                                            setFilterState((prev) => ({
                                                ...prev,
                                                type: e.value,
                                                devicename: "Please Select Device Name",
                                                deviceserialnumber: ""
                                            }));
                                            setValueCompanyCat([]);
                                            setSelectedOptionsCompany([]);
                                            setValueBranchCat([]);
                                            setSelectedOptionsBranch([]);
                                            setValueUnitCat([]);
                                            setSelectedOptionsUnit([]);
                                            setValueTeamCat([]);
                                            setSelectedOptionsTeam([]);
                                            setValueDepartmentCat([]);
                                            setSelectedOptionsDepartment([]);
                                            setValueEmployeeCat([]);
                                            setSelectedOptionsEmployee([]);
                                        }}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <Typography>
                                    Company<b style={{ color: "red" }}>*</b>
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
                            {!["Company"]?.includes(filterState.type) &&
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            {" "}
                                            Branch <b style={{ color: "red" }}>*</b>
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
                                </Grid>}
                            {["Individual", "Team"]?.includes(filterState.type) ? (
                                <>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                {" "}
                                                Unit<b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <MultiSelect
                                                options={accessbranch
                                                    ?.filter(
                                                        (comp) =>
                                                            valueCompanyCat?.includes(comp.company) &&
                                                            valueBranchCat?.includes(comp.branch)
                                                    )
                                                    ?.map((data) => ({
                                                        label: data.unit,
                                                        value: data.unit,
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
                                                value={selectedOptionsUnit}
                                                onChange={(e) => {
                                                    handleUnitChange(e);
                                                }}
                                                valueRenderer={customValueRendererUnit}
                                                labelledBy="Please Select Unit"
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Team<b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <MultiSelect
                                                options={allTeam
                                                    ?.filter(
                                                        (u) =>
                                                            valueCompanyCat?.includes(u.company) &&
                                                            valueBranchCat?.includes(u.branch) &&
                                                            valueUnitCat?.includes(u.unit)
                                                    )
                                                    .map((u) => ({
                                                        ...u,
                                                        label: u.teamname,
                                                        value: u.teamname,
                                                    }))}
                                                value={selectedOptionsTeam}
                                                onChange={(e) => {
                                                    handleTeamChange(e);
                                                }}
                                                valueRenderer={customValueRendererTeam}
                                                labelledBy="Please Select Team"
                                            />
                                        </FormControl>
                                    </Grid>
                                </>
                            ) : ["Department"]?.includes(filterState.type) ? (
                                <>
                                    {/* Department */}
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Department<b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <MultiSelect
                                                options={departmentOptions}
                                                value={selectedOptionsDepartment}
                                                onChange={(e) => {
                                                    handleDepartmentChange(e);
                                                }}
                                                valueRenderer={customValueRendererDepartment}
                                                labelledBy="Please Select Department"
                                            />
                                        </FormControl>
                                    </Grid>
                                </>
                            ) : ["Unit"]?.includes(filterState.type) ? (
                                <>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                {" "}
                                                Unit <b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <MultiSelect
                                                options={accessbranch
                                                    ?.filter(
                                                        (comp) =>
                                                            valueCompanyCat?.includes(comp.company) &&
                                                            valueBranchCat?.includes(comp.branch)
                                                    )
                                                    ?.map((data) => ({
                                                        label: data.unit,
                                                        value: data.unit,
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
                                                value={selectedOptionsUnit}
                                                onChange={(e) => {
                                                    handleUnitChange(e);
                                                }}
                                                valueRenderer={customValueRendererUnit}
                                                labelledBy="Please Select Unit"
                                            />
                                        </FormControl>
                                    </Grid>
                                </>
                            ) : (
                                ""
                            )}
                            {["Individual"]?.includes(filterState.type) && (
                                <Grid item md={3} xs={12} sm={12}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Employee<b style={{ color: "red" }}>*</b>
                                        </Typography>
                                        <MultiSelect
                                            options={isAllUsers
                                                ?.filter(
                                                    (u) =>
                                                        valueCompanyCat?.includes(u.company) &&
                                                        valueBranchCat?.includes(u.branch) &&
                                                        valueUnitCat?.includes(u.unit) &&
                                                        valueTeamCat?.includes(u.team)
                                                )
                                                .map((u) => ({
                                                    label: u.companyname,
                                                    value: u.companyname,
                                                }))}
                                            value={selectedOptionsEmployee}
                                            onChange={(e) => {
                                                handleEmployeeChange(e);
                                            }}
                                            valueRenderer={customValueRendererEmployee}
                                            labelledBy="Please Select Employee"
                                        />
                                    </FormControl>
                                </Grid>
                            )}
                            <Grid container spacing={1}>
                                <Grid item md={3} xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <Typography>
                                            Pair Device 1<b style={{ color: 'red' }}>*</b>
                                        </Typography>
                                        <Selects
                                            maxMenuHeight={300}
                                            options={PairedDeviceOptions}
                                            value={{
                                                label: pairedDeviceGroupingCreate.paireddeviceone,
                                                value: pairedDeviceGroupingCreate.paireddeviceone,
                                            }}
                                            onChange={(e) => {
                                                let secondDevice = PairedDeviceOptions?.find(data => data?.pairedid == e.pairedid && e.value !== data?.value);
                                                setPairedDeviceGroupingCreate({
                                                    ...pairedDeviceGroupingCreate,
                                                    paireddeviceone: e.value,
                                                    paireddevicetwo: secondDevice ? secondDevice?.value : "",
                                                    pairedstatus: secondDevice ? true : false,

                                                });
                                                handleClearButtons();
                                            }}
                                        />
                                    </FormControl>
                                    <br />
                                    <br />
                                    <br />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2}>

                                <Grid item md={1.5} sm={12} xs={12}>
                                    <FormGroup>
                                        <FormControlLabel
                                            label="Attendance In"
                                            control={
                                                <Switch
                                                    checked={AttendanceInSwitchFirst}
                                                    onChange={(e) => setAttendanceInSwitchFirst(e.target.checked)}
                                                    disabled={isDisabled("AttendanceInSwitchFirst")} />
                                            }
                                        />
                                    </FormGroup>
                                </Grid>
                                <Grid item md={1.5} sm={12} xs={12}>
                                    <FormGroup>
                                        <FormControlLabel
                                            label="Attendance Out"
                                            control={
                                                <Switch
                                                    checked={AttendanceOutSwitchFirst}
                                                    onChange={(e) => setAttendanceOutSwitchFirst(e.target.checked)}
                                                    disabled={isDisabled("AttendanceOutSwitchFirst")}
                                                />
                                            }
                                        />
                                    </FormGroup>
                                </Grid>
                                <Grid item md={1.5} sm={12} xs={12}>
                                    <FormGroup>
                                        <FormControlLabel
                                            label="Attendance In/Out"
                                            control={
                                                <Switch
                                                    checked={AttendanceInOutSwitchFirst}
                                                    onChange={(e) => setAttendanceInOutSwitchFirst(e.target.checked)}
                                                    disabled={isDisabled("AttendanceInOutSwitchFirst")}
                                                />
                                            }
                                        />
                                    </FormGroup>
                                </Grid>
                                <Grid item md={1.5} sm={12} xs={12}>
                                    <FormGroup>
                                        <FormControlLabel
                                            label="Exit In"
                                            control={
                                                <Switch
                                                    checked={ExitInSwitchFirst}
                                                    onChange={(e) => setExitInSwitchFirst(e.target.checked)}
                                                    disabled={isDisabledExit("ExitInSwitchFirst")}
                                                />
                                            }
                                        />
                                    </FormGroup>
                                </Grid>
                                <Grid item md={1.5} sm={12} xs={12}>
                                    <FormGroup>
                                        <FormControlLabel
                                            label="Exit Out"
                                            control={
                                                <Switch
                                                    checked={ExitOutSwitchFirst}
                                                    onChange={(e) => setExitOutSwitchFirst(e.target.checked)}
                                                    disabled={isDisabledExit("ExitOutSwitchFirst")}
                                                />
                                            }
                                        />
                                    </FormGroup>
                                </Grid>
                                <Grid item md={1.5} sm={12} xs={12}>
                                    <FormGroup>
                                        <FormControlLabel
                                            label="Exit In/Out"
                                            control={
                                                <Switch
                                                    checked={ExitInOutSwitchFirst}
                                                    onChange={(e) => setExitInOutSwitchFirst(e.target.checked)}
                                                    disabled={isDisabledExit("ExitInOutSwitchFirst")}
                                                />
                                            }
                                        />
                                    </FormGroup>
                                </Grid>
                                <Grid item md={1.5} sm={12} xs={12}>
                                    <FormGroup>
                                        <FormControlLabel label="Break" control={<Switch
                                            checked={BreakSwitchFirst}
                                            onChange={(e) => setBreakSwitchFirst(e.target.checked)}
                                        />
                                        }
                                        />
                                    </FormGroup>
                                </Grid>
                            </Grid>

                            {pairedDeviceGroupingCreate?.pairedstatus &&
                                <>
                                    <br />
                                    <br />
                                    <Grid item md={3} xs={12} sm={6}>

                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Pair Device 2<b style={{ color: 'red' }}>*</b>
                                            </Typography>
                                            <OutlinedInput
                                                id="component-outlined"
                                                type="text"
                                                placeholder="Please Enter Paired Device 2"
                                                value={pairedDeviceGroupingCreate.paireddevicetwo}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid container spacing={2}>

                                        <Grid item md={1.5} sm={12} xs={12}>
                                            <FormGroup>
                                                <FormControlLabel
                                                    label="Attendance In"
                                                    control={
                                                        <Switch
                                                            checked={AttendanceInSwitchSecond}
                                                            onChange={(e) => setAttendanceInSwitchSecond(e.target.checked)}
                                                            disabled={isDisabled("AttendanceInSwitchSecond")}
                                                        />
                                                    }
                                                />
                                            </FormGroup>
                                        </Grid>
                                        <Grid item md={1.5} sm={12} xs={12}>
                                            <FormGroup>
                                                <FormControlLabel
                                                    label="Attendance Out"
                                                    control={
                                                        <Switch
                                                            checked={AttendanceOutSwitchSecond}
                                                            onChange={(e) => setAttendanceOutSwitchSecond(e.target.checked)}
                                                            disabled={isDisabled("AttendanceOutSwitchSecond")}
                                                        />
                                                    }
                                                />
                                            </FormGroup>
                                        </Grid>
                                        <Grid item md={1.5} sm={12} xs={12}>
                                            <FormGroup>
                                                <FormControlLabel
                                                    label="Attendance In/Out"
                                                    control={
                                                        <Switch
                                                            checked={AttendanceInOutSwitchSecond}
                                                            onChange={(e) => setAttendanceInOutSwitchSecond(e.target.checked)}
                                                            disabled={isDisabled("AttendanceInOutSwitchSecond")}
                                                        />
                                                    }
                                                />
                                            </FormGroup>
                                        </Grid>
                                        <Grid item md={1.5} sm={12} xs={12}>
                                            <FormGroup>
                                                <FormControlLabel
                                                    label="Exit In"
                                                    control={
                                                        <Switch
                                                            checked={ExitInSwitchSecond}
                                                            onChange={(e) => setExitInSwitchSecond(e.target.checked)}
                                                            disabled={isDisabledExit("ExitInSwitchSecond")}
                                                        />
                                                    }
                                                />
                                            </FormGroup>
                                        </Grid>
                                        <Grid item md={1.5} sm={12} xs={12}>
                                            <FormGroup>
                                                <FormControlLabel
                                                    label="Exit Out"
                                                    control={
                                                        <Switch
                                                            checked={ExitOutSwitchSecond}
                                                            onChange={(e) => setExitOutSwitchSecond(e.target.checked)}
                                                            disabled={isDisabledExit("ExitOutSwitchSecond")}
                                                        />
                                                    }
                                                />
                                            </FormGroup>
                                        </Grid>
                                        <Grid item md={1.5} sm={12} xs={12}>
                                            <FormGroup>
                                                <FormControlLabel
                                                    label="Exit In/Out"
                                                    control={
                                                        <Switch
                                                            checked={ExitInOutSwitchSecond}
                                                            onChange={(e) => setExitInOutSwitchSecond(e.target.checked)}
                                                            disabled={isDisabledExit("ExitInOutSwitchSecond")}
                                                        />
                                                    }
                                                />
                                            </FormGroup>
                                        </Grid>
                                        <Grid item md={1.5} sm={12} xs={12}>
                                            <FormGroup>
                                                <FormControlLabel label="Break" control={<Switch checked={BreakSwitchSecond}
                                                    onChange={(e) => setBreakSwitchSecond(e.target.checked)} />} />
                                            </FormGroup>
                                        </Grid>
                                    </Grid>
                                </>
                            }
                            <br />




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
                                        Add
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
            {isUserRoleCompare?.includes("lbiometricusersgrouping") && (
                <>
                    <Box sx={userStyle.container}>
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>
                                List Biometric Users Grouping
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
                                        <MenuItem value={UsersGroupingArray?.length}>All</MenuItem>
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
                                    {isUserRoleCompare?.includes("excelbiometricusersgrouping") && (
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
                                    {isUserRoleCompare?.includes("csvbiometricusersgrouping") && (
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
                                    {isUserRoleCompare?.includes("printbiometricusersgrouping") && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleprint}>
                                                &ensp; <FaPrint /> &ensp;Print&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes("pdfbiometricusersgrouping") && (
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
                                    {isUserRoleCompare?.includes("imagebiometricusersgrouping") && (
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
                                    maindatas={UsersGroupingArray}
                                    setSearchedString={setSearchedString}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    paginated={false}
                                    totalDatas={UsersGroupingArray}

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
                        {isUserRoleCompare?.includes('bdbiometricusersgrouping') && (
                            <Button variant="contained" sx={buttonStyles.buttonbulkdelete} onClick={handleClickOpenalert}>
                                Bulk Delete
                            </Button>
                        )}
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
                                    itemsList={UsersGroupingArray}
                                />

                            )}
                        </Box>

                    </Box>
                </>
            )}


            {/* view model */}
            <Dialog open={openview} onClose={handleCloseview}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="lg"
                sx={{ marginTop: "47px" }}
            >
                <Box sx={{ padding: "20px 50px" }}>
                    <>
                        <Typography sx={userStyle.HeaderText}> View Biometric Users Grouping</Typography>
                        <br />
                        <br />
                        <Grid container spacing={2}>
                            <Grid item md={4} xs={12} sm={4}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Type</Typography>
                                    <Typography>{UsersGroupingArrayEdit.type}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={8} xs={12} sm={8}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Device Name</Typography>
                                    <Typography>{UsersGroupingArrayEdit.devicename}</Typography>
                                </FormControl>
                            </Grid>
                            <br />
                            <Grid item md={6} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Company</Typography>
                                    <Typography>{UsersGroupingArrayEdit.company?.map((item, i) => `${i + 1 + ". "}` + " " + item).toString()}</Typography>
                                </FormControl>
                            </Grid>
                            <br />
                            <Grid item md={6} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Branch</Typography>
                                    <Typography>{UsersGroupingArrayEdit.branch?.map((item, i) => `${i + 1 + ". "}` + " " + item).toString()}</Typography>
                                </FormControl>
                            </Grid>
                            <br />
                            {UsersGroupingArrayEdit?.unit?.length > 0 &&
                                <Grid item md={6} xs={12} sm={12}>
                                    <Typography variant="h6">Unit</Typography>
                                    <FormControl fullWidth size="small">
                                        <Typography>{UsersGroupingArrayEdit.unit?.map((item, i) => `${i + 1 + ". "}` + " " + item).toString()}</Typography>
                                    </FormControl>
                                </Grid>}
                            {UsersGroupingArrayEdit?.team?.length > 0 &&
                                <Grid item md={6} xs={12} sm={12}>
                                    <Typography variant="h6">Team</Typography>
                                    <FormControl fullWidth size="small">
                                        <Typography>{UsersGroupingArrayEdit.team?.map((item, i) => `${i + 1 + ". "}` + " " + item).toString()}</Typography>
                                    </FormControl>
                                </Grid>}
                            {UsersGroupingArrayEdit?.department?.length > 0 &&
                                <Grid item md={6} xs={12} sm={12}>
                                    <Typography variant="h6">Department</Typography>
                                    <FormControl fullWidth size="small">
                                        <Typography>{UsersGroupingArrayEdit.department?.map((item, i) => `${i + 1 + ". "}` + " " + item).toString()}</Typography>
                                    </FormControl>
                                </Grid>}

                            <Grid item md={6} xs={12} sm={12}>
                                <Typography variant="h6">Employee Names</Typography>
                                <FormControl fullWidth size="small">
                                    <Typography>{UsersGroupingArrayEdit.companyname?.map((item, i) => `${i + 1 + ". "}` + " " + item).toString()}</Typography>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <br /> <br />
                        <br />
                        <Grid container spacing={2}>
                            <Button variant="contained" sx={buttonStyles.btncancel} onClick={handleCloseview}>
                                {" "}
                                Back{" "}
                            </Button>
                        </Grid>
                    </>
                </Box>
            </Dialog>

            <Box>
                {/* Edit DIALOG */}
                <Dialog
                    open={isEditOpen}
                    onClose={handleCloseModEdit}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    fullWidth={true}
                    maxWidth="md"
                    scroll="paper"
                    sx={{
                        '& .MuiDialog-paper': {
                            maxHeight: '80vh',   // Limit height
                        }
                    }}
                // sx={{ marginTop: "47px" }}
                >
                    <Box sx={{ padding: '20px' }}>
                        <>
                            <form onSubmit={editSubmit}>
                                {/* <DialogContent sx={{ width: '550px', padding: '20px' }}> */}
                                <Grid container spacing={2}>
                                    <Grid item md={12} xs={12} sm={12}>
                                        <Typography sx={userStyle.HeaderText}>Edit Biometric Users Grouping</Typography>
                                    </Grid>
                                </Grid>
                                <br />
                                <Grid container spacing={2}>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Type<b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <Selects
                                                options={TypeOptions}
                                                // styles={colourStyles}
                                                value={{
                                                    label: filterStateEdit.type ?? "Please Select Type",
                                                    value: filterStateEdit.type ?? "Please Select Type",
                                                }}
                                                onChange={(e) => {
                                                    setFilterStateEdit((prev) => ({
                                                        ...prev,
                                                        type: e.value,
                                                        devicename: "Please Select Device Name",
                                                        deviceserialnumber: ""
                                                    }));
                                                    setValueCompanyCatEdit([]);
                                                    setSelectedOptionsCompanyEdit([]);
                                                    setValueBranchCatEdit([]);
                                                    setSelectedOptionsBranchEdit([]);
                                                    setValueUnitCatEdit([]);
                                                    setSelectedOptionsUnitEdit([]);
                                                    setValueTeamCatEdit([]);
                                                    setSelectedOptionsTeamEdit([]);
                                                    setValueDepartmentCatEdit([]);
                                                    setSelectedOptionsDepartmentEdit([]);
                                                    setValueEmployeeCatEdit([]);
                                                    setSelectedOptionsEmployeeEdit([]);

                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <Typography>
                                            Company<b style={{ color: "red" }}>*</b>
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
                                                value={selectedOptionsCompanyEdit}
                                                onChange={(e) => {
                                                    handleCompanyChangeEdit(e);
                                                }}
                                                valueRenderer={customValueRendererCompanyEdit}
                                                labelledBy="Please Select Company"
                                            />
                                        </FormControl>
                                    </Grid>
                                    {!["Company"]?.includes(filterStateEdit.type) &&

                                        <Grid item md={3} xs={12} sm={12}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    {" "}
                                                    Branch <b style={{ color: "red" }}>*</b>
                                                </Typography>
                                                <MultiSelect
                                                    options={accessbranch
                                                        ?.filter((comp) =>
                                                            valueCompanyCatEdit?.includes(comp.company)
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
                                                    value={selectedOptionsBranchEdit}
                                                    onChange={(e) => {
                                                        handleBranchChangeEdit(e);
                                                    }}
                                                    valueRenderer={customValueRendererBranchEdit}
                                                    labelledBy="Please Select Branch"
                                                />
                                            </FormControl>
                                        </Grid>}
                                    {["Individual", "Team"]?.includes(filterStateEdit.type) ? (
                                        <>
                                            <Grid item md={3} xs={12} sm={12}>
                                                <FormControl fullWidth size="small">
                                                    <Typography>
                                                        {" "}
                                                        Unit<b style={{ color: "red" }}>*</b>
                                                    </Typography>
                                                    <MultiSelect
                                                        options={accessbranch
                                                            ?.filter(
                                                                (comp) =>
                                                                    valueCompanyCatEdit?.includes(comp.company) &&
                                                                    valueBranchCatEdit?.includes(comp.branch)
                                                            )
                                                            ?.map((data) => ({
                                                                label: data.unit,
                                                                value: data.unit,
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
                                                        value={selectedOptionsUnitEdit}
                                                        onChange={(e) => {
                                                            handleUnitChangeEdit(e);
                                                        }}
                                                        valueRenderer={customValueRendererUnitEdit}
                                                        labelledBy="Please Select Unit"
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item md={3} xs={12} sm={6}>
                                                <FormControl fullWidth size="small">
                                                    <Typography>
                                                        Team<b style={{ color: "red" }}>*</b>
                                                    </Typography>
                                                    <MultiSelect
                                                        options={allTeam
                                                            ?.filter(
                                                                (u) =>
                                                                    valueCompanyCatEdit?.includes(u.company) &&
                                                                    valueBranchCatEdit?.includes(u.branch) &&
                                                                    valueUnitCatEdit?.includes(u.unit)
                                                            )
                                                            .map((u) => ({
                                                                ...u,
                                                                label: u.teamname,
                                                                value: u.teamname,
                                                            }))}
                                                        value={selectedOptionsTeamEdit}
                                                        onChange={(e) => {
                                                            handleTeamChangeEdit(e);
                                                        }}
                                                        valueRenderer={customValueRendererTeamEdit}
                                                        labelledBy="Please Select Team"
                                                    />
                                                </FormControl>
                                            </Grid>
                                        </>
                                    ) : ["Department"]?.includes(filterStateEdit.type) ? (
                                        <>
                                            {/* Department */}
                                            <Grid item md={3} xs={12} sm={6}>
                                                <FormControl fullWidth size="small">
                                                    <Typography>
                                                        Department<b style={{ color: "red" }}>*</b>
                                                    </Typography>
                                                    <MultiSelect
                                                        options={departmentOptions}
                                                        value={selectedOptionsDepartmentEdit}
                                                        onChange={(e) => {
                                                            handleDepartmentChangeEdit(e);
                                                        }}
                                                        valueRenderer={customValueRendererDepartmentEdit}
                                                        labelledBy="Please Select Department"
                                                    />
                                                </FormControl>
                                            </Grid>
                                        </>
                                    ) : ["Unit"]?.includes(filterStateEdit.type) ? (
                                        <>
                                            <Grid item md={3} xs={12} sm={12}>
                                                <FormControl fullWidth size="small">
                                                    <Typography>
                                                        {" "}
                                                        Branch<b style={{ color: "red" }}>*</b>
                                                    </Typography>
                                                    <MultiSelect
                                                        options={accessbranch
                                                            ?.filter((comp) =>
                                                                valueCompanyCatEdit?.includes(comp.company)
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
                                                        value={selectedOptionsBranchEdit}
                                                        onChange={(e) => {
                                                            handleBranchChangeEdit(e);
                                                        }}
                                                        valueRenderer={customValueRendererBranchEdit}
                                                        labelledBy="Please Select Branch"
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item md={3} xs={12} sm={12}>
                                                <FormControl fullWidth size="small">
                                                    <Typography>
                                                        {" "}
                                                        Unit <b style={{ color: "red" }}>*</b>
                                                    </Typography>
                                                    <MultiSelect
                                                        options={accessbranch
                                                            ?.filter(
                                                                (comp) =>
                                                                    valueCompanyCatEdit?.includes(comp.company) &&
                                                                    valueBranchCatEdit?.includes(comp.branch)
                                                            )
                                                            ?.map((data) => ({
                                                                label: data.unit,
                                                                value: data.unit,
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
                                                        value={selectedOptionsUnitEdit}
                                                        onChange={(e) => {
                                                            handleUnitChangeEdit(e);
                                                        }}
                                                        valueRenderer={customValueRendererUnitEdit}
                                                        labelledBy="Please Select Unit"
                                                    />
                                                </FormControl>
                                            </Grid>
                                        </>
                                    ) : (
                                        ""
                                    )}
                                    {["Individual"]?.includes(filterStateEdit.type) && (
                                        <Grid item md={3} xs={12} sm={12}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Employee<b style={{ color: "red" }}>*</b>
                                                </Typography>
                                                <MultiSelect
                                                    options={isAllUsers
                                                        ?.filter(
                                                            (u) =>
                                                                valueCompanyCatEdit?.includes(u.company) &&
                                                                valueBranchCatEdit?.includes(u.branch) &&
                                                                valueUnitCatEdit?.includes(u.unit) &&
                                                                valueTeamCatEdit?.includes(u.team)
                                                        )
                                                        .map((u) => ({
                                                            label: u.companyname,
                                                            value: u.companyname,
                                                        }))}
                                                    value={selectedOptionsEmployeeEdit}
                                                    onChange={(e) => {
                                                        handleEmployeeChangeEdit(e);
                                                    }}
                                                    valueRenderer={customValueRendererEmployeeEdit}
                                                    labelledBy="Please Select Employee"
                                                />
                                            </FormControl>
                                        </Grid>
                                    )}
                                </Grid>
                                <Grid container spacing={1}>
                                    <Grid item md={5} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Pair Device 1<b style={{ color: 'red' }}>*</b>
                                            </Typography>
                                            <Selects
                                                maxMenuHeight={300}
                                                options={PairedDeviceOptionsEdit}
                                                value={{
                                                    label: pairedDeviceGroupingEdit.paireddeviceone,
                                                    value: pairedDeviceGroupingEdit.paireddeviceone,
                                                }}
                                                onChange={(e) => {
                                                    let secondDevice = PairedDeviceOptionsEdit?.find(data => data?.pairedid == e.pairedid && e.value !== data?.value);
                                                    setPairedDeviceGroupingEdit({
                                                        ...pairedDeviceGroupingEdit,
                                                        paireddeviceone: e.value,
                                                        paireddevicetwo: secondDevice ? secondDevice?.value : "",
                                                        pairedstatus: secondDevice ? true : false,

                                                    });
                                                    handleClearButtonsEdit();
                                                }}
                                            />
                                        </FormControl>
                                        <br />
                                        <br />
                                        <br />
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2}>

                                    <Grid item md={2} sm={12} xs={12}>
                                        <FormGroup>
                                            <FormControlLabel
                                                label="Attendance In"
                                                control={
                                                    <Switch
                                                        checked={AttendanceInSwitchFirstEdit}
                                                        onChange={(e) => setAttendanceInSwitchFirstEdit(e.target.checked)}
                                                        disabled={isDisabledEdit("AttendanceInSwitchFirstEdit")} />
                                                }
                                            />
                                        </FormGroup>
                                    </Grid>
                                    <Grid item md={2} sm={12} xs={12}>
                                        <FormGroup>
                                            <FormControlLabel
                                                label="Attendance Out"
                                                control={
                                                    <Switch
                                                        checked={AttendanceOutSwitchFirstEdit}
                                                        onChange={(e) => setAttendanceOutSwitchFirstEdit(e.target.checked)}
                                                        disabled={isDisabledEdit("AttendanceOutSwitchFirstEdit")}
                                                    />
                                                }
                                            />
                                        </FormGroup>
                                    </Grid>
                                    <Grid item md={2} sm={12} xs={12}>
                                        <FormGroup>
                                            <FormControlLabel
                                                label="Attendance In/Out"
                                                control={
                                                    <Switch
                                                        checked={AttendanceInOutSwitchFirstEdit}
                                                        onChange={(e) => setAttendanceInOutSwitchFirstEdit(e.target.checked)}
                                                        disabled={isDisabledEdit("AttendanceInOutSwitchFirstEdit")}
                                                    />
                                                }
                                            />
                                        </FormGroup>
                                    </Grid>
                                    <Grid item md={2} sm={12} xs={12}>
                                        <FormGroup>
                                            <FormControlLabel
                                                label="Exit In"
                                                control={
                                                    <Switch
                                                        checked={ExitInSwitchFirstEdit}
                                                        onChange={(e) => setExitInSwitchFirstEdit(e.target.checked)}
                                                        disabled={isDisabledExitEdit("ExitInSwitchFirstEdit")}
                                                    />
                                                }
                                            />
                                        </FormGroup>
                                    </Grid>
                                    <Grid item md={2} sm={12} xs={12}>
                                        <FormGroup>
                                            <FormControlLabel
                                                label="Exit Out"
                                                control={
                                                    <Switch
                                                        checked={ExitOutSwitchFirstEdit}
                                                        onChange={(e) => setExitOutSwitchFirstEdit(e.target.checked)}
                                                        disabled={isDisabledExitEdit("ExitOutSwitchFirstEdit")}
                                                    />
                                                }
                                            />
                                        </FormGroup>
                                    </Grid>
                                    <Grid item md={2} sm={12} xs={12}>
                                        <FormGroup>
                                            <FormControlLabel
                                                label="Exit In/Out"
                                                control={
                                                    <Switch
                                                        checked={ExitInOutSwitchFirstEdit}
                                                        onChange={(e) => setExitInOutSwitchFirstEdit(e.target.checked)}
                                                        disabled={isDisabledExitEdit("ExitInOutSwitchFirstEdit")}
                                                    />
                                                }
                                            />
                                        </FormGroup>
                                    </Grid>
                                    <Grid item md={2} sm={12} xs={12}>
                                        <FormGroup>
                                            <FormControlLabel label="Break" control={<Switch
                                                checked={BreakSwitchFirstEdit}
                                                onChange={(e) => setBreakSwitchFirstEdit(e.target.checked)}
                                            />} />
                                        </FormGroup>
                                    </Grid>
                                </Grid>

                                {pairedDeviceGroupingEdit?.pairedstatus &&
                                    <>
                                        <br />
                                        <br />
                                        <Grid container spacing={1}>
                                            <Grid item md={5} xs={12} sm={6}>
                                                <FormControl fullWidth size="small">
                                                    <Typography>
                                                        Pair Device 2<b style={{ color: 'red' }}>*</b>
                                                    </Typography>
                                                    <OutlinedInput
                                                        id="component-outlined"
                                                        type="text"
                                                        placeholder="Please Enter Paired Device 2"
                                                        value={pairedDeviceGroupingEdit.paireddevicetwo}
                                                    />
                                                </FormControl>
                                                <br />
                                                <br />
                                                <br />
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>

                                            <Grid item md={2} sm={12} xs={12}>
                                                <FormGroup>
                                                    <FormControlLabel
                                                        label="Attendance In"
                                                        control={
                                                            <Switch
                                                                checked={AttendanceInSwitchSecondEdit}
                                                                onChange={(e) => setAttendanceInSwitchSecondEdit(e.target.checked)}
                                                                disabled={isDisabledEdit("AttendanceInSwitchSecondEdit")}
                                                            />
                                                        }
                                                    />
                                                </FormGroup>
                                            </Grid>
                                            <Grid item md={2} sm={12} xs={12}>
                                                <FormGroup>
                                                    <FormControlLabel
                                                        label="Attendance Out"
                                                        control={
                                                            <Switch
                                                                checked={AttendanceOutSwitchSecondEdit}
                                                                onChange={(e) => setAttendanceOutSwitchSecondEdit(e.target.checked)}
                                                                disabled={isDisabledEdit("AttendanceOutSwitchSecondEdit")}
                                                            />
                                                        }
                                                    />
                                                </FormGroup>
                                            </Grid>
                                            <Grid item md={2} sm={12} xs={12}>
                                                <FormGroup>
                                                    <FormControlLabel
                                                        label="Attendance In/Out"
                                                        control={
                                                            <Switch
                                                                checked={AttendanceInOutSwitchSecondEdit}
                                                                onChange={(e) => setAttendanceInOutSwitchSecondEdit(e.target.checked)}
                                                                disabled={isDisabledEdit("AttendanceInOutSwitchSecondEdit")}
                                                            />
                                                        }
                                                    />
                                                </FormGroup>
                                            </Grid>
                                            <Grid item md={2} sm={12} xs={12}>
                                                <FormGroup>
                                                    <FormControlLabel
                                                        label="Exit In"
                                                        control={
                                                            <Switch
                                                                checked={ExitInSwitchSecondEdit}
                                                                onChange={(e) => setExitInSwitchSecondEdit(e.target.checked)}
                                                                disabled={isDisabledExitEdit("ExitInSwitchSecondEdit")}
                                                            />
                                                        }
                                                    />
                                                </FormGroup>
                                            </Grid>
                                            <Grid item md={2} sm={12} xs={12}>
                                                <FormGroup>
                                                    <FormControlLabel
                                                        label="Exit Out"
                                                        control={
                                                            <Switch
                                                                checked={ExitOutSwitchSecondEdit}
                                                                onChange={(e) => setExitOutSwitchSecondEdit(e.target.checked)}
                                                                disabled={isDisabledExitEdit("ExitOutSwitchSecondEdit")}
                                                            />
                                                        }
                                                    />
                                                </FormGroup>
                                            </Grid>
                                            <Grid item md={2} sm={12} xs={12}>
                                                <FormGroup>
                                                    <FormControlLabel
                                                        label="Exit In/Out"
                                                        control={
                                                            <Switch
                                                                checked={ExitInOutSwitchSecondEdit}
                                                                onChange={(e) => setExitInOutSwitchSecondEdit(e.target.checked)}
                                                                disabled={isDisabledExitEdit("ExitInOutSwitchSecondEdit")}
                                                            />
                                                        }
                                                    />
                                                </FormGroup>
                                            </Grid>
                                            <Grid item md={2} sm={12} xs={12}>
                                                <FormGroup>
                                                    <FormControlLabel label="Break" control={<Switch
                                                        checked={BreakSwitchSecondEdit}
                                                        onChange={(e) => setBreakSwitchSecondEdit(e.target.checked)}
                                                    />} />
                                                </FormGroup>
                                            </Grid>
                                        </Grid>
                                    </>
                                }
                                <br />
                                <br />

                                <Grid container spacing={2}>
                                    <Grid item md={6} xs={6} sm={6}>
                                        <Button variant="contained" sx={buttonStyles.buttonsubmit} type="submit">
                                            Update
                                        </Button>
                                    </Grid>
                                    <Grid item md={6} xs={6} sm={6}>
                                        <Button sx={buttonStyles.btncancel} onClick={handleCloseModEdit}>
                                            Cancel
                                        </Button>
                                    </Grid>
                                </Grid>
                                {/* </DialogContent> */}
                            </form>
                        </>
                    </Box>
                </Dialog>
            </Box>

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
                itemsTwo={UsersGroupingArray ?? []}
                filename={"Biometric Users Grouping"}
                exportColumnNames={exportColumnNamescrt}
                exportRowValues={exportRowValuescrt}
                componentRef={componentRef}
            />
            <InfoPopup
                openInfo={openInfo}
                handleCloseinfo={handleCloseinfo}
                heading="Biometric Users Grouping Info"
                addedby={addedby}
                updateby={updateby}
            />

            <DeleteConfirmation open={isDeleteOpencheckbox} onClose={handleCloseModcheckbox} onConfirm={delSourcecheckbox} title="Are you sure?" confirmButtonText="Yes" cancelButtonText="Cancel" />
            <PleaseSelectRow open={isDeleteOpenalert} onClose={handleCloseModalert} message="Please Select any Row" iconColor="orange" buttonText="OK" />


            <DeleteConfirmation
                open={isDeleteOpen}
                onClose={handleCloseMod}
                onConfirm={delProject}
                title="Are you sure?"
                confirmButtonText="Yes"
                cancelButtonText="Cancel"
            />
        </Box>
    );
}
export default BiometricUsersGrouping;