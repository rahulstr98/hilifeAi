import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ImageIcon from '@mui/icons-material/Image';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FormGroup from '@mui/material/FormGroup';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, List, ListItem, ListItemText, MenuItem, OutlinedInput, Popover, Radio, RadioGroup, Select, TextField, Tooltip, Typography } from '@mui/material';
import Switch from '@mui/material/Switch';
import axios from '../../../../axiosInstance';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint, FaSearch } from 'react-icons/fa';
import { IoMdOptions } from 'react-icons/io';
import { MdClose } from 'react-icons/md';
import { ThreeDots } from 'react-loader-spinner';
import { MultiSelect } from 'react-multi-select-component';
import Selects from 'react-select';
import { useReactToPrint } from 'react-to-print';
import AlertDialog from '../../../../components/Alert.js';
import { DeleteConfirmation, PleaseSelectRow } from '../../../../components/DeleteConfirmation.js';
import { handleApiError } from '../../../../components/Errorhandling.js';
import ExportData from '../../../../components/ExportData.js';
import Headtitle from '../../../../components/Headtitle.js';
import InfoPopup from '../../../../components/InfoPopup.js';
import MessageAlert from '../../../../components/MessageAlert.js';
import PageHeading from '../../../../components/PageHeading.js';
import { AuthContext, UserRoleAccessContext } from '../../../../context/Appcontext.js';
import { userStyle, colourStyles } from '../../../../pageStyle.js';
import { SERVICE } from '../../../../services/Baseservice.js';
import AggregatedSearchBar from '../../../../components/AggregatedSearchBar';
import AggridTable from "../../../../components/AggridTable";

function BiometricPairedDevicesGrouping() {
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


    const [advancedFilter, setAdvancedFilter] = useState(null);
    const [additionalFilters, setAdditionalFilters] = useState([]);
    const [ModelOptions, setModelOptions] = useState([]);
    const [BrandOptions, setBrandOptions] = useState([]);
    const [serialNumberOptions, setSerialNumberOptions] = useState([]);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const conditions = ['Contains', 'Does Not Contain', 'Equals', 'Does Not Equal', 'Begins With', 'Ends With', 'Blank', 'Not Blank']; // AgGrid-like conditions
    const [selectedColumn, setSelectedColumn] = useState('');
    const [fileFormat, setFormat] = useState('');
    const [selectedCondition, setSelectedCondition] = useState('Contains');
    const [logicOperator, setLogicOperator] = useState('AND');
    const [filterValue, setFilterValue] = useState('');
    const [filteredRowData, setFilteredRowData] = useState([]);
    const [filteredChanges, setFilteredChanges] = useState(null);
    const [btnUpload, setBtnUpload] = useState(false);
    const [pairedDeviceGroupingCreate, setPairedDeviceGroupingCreate] = useState({
        brand: 'Please Select Brand',
        model: 'Please Select Model',
        company: 'Please Select Company',
        branch: 'Please Select Branch',
        unit: 'Please Select Unit',
        floor: 'Please Select Floor',
        area: 'Please Select Area',
        paireddeviceone: "Please Select First Device",
        paireddevicetwo: "",
        pairedstatus: false
    });


    const [pairedDeviceGroupingEdit, setPairedDeviceGroupingEdit] = useState({
        company: 'Please Select Company',
        branch: 'Please Select Branch',
        unit: 'Please Select Unit',
        area: 'Please Select Area',
        paireddeviceone: "Please Select First Device",
        paireddevicetwo: "",
        pairedstatus: false
    });

    const [openPopupMalert, setOpenPopupMalert] = useState(false);
    const [popupContentMalert, setPopupContentMalert] = useState('');
    const [popupSeverityMalert, setPopupSeverityMalert] = useState('');
    const handleClickOpenPopupMalert = () => {
        setOpenPopupMalert(true);
    };
    const handleClosePopupMalert = () => {
        setOpenPopupMalert(false);
    };
    const [openPopup, setOpenPopup] = useState(false);
    const [popupContent, setPopupContent] = useState('');
    const [popupSeverity, setPopupSeverity] = useState('');
    const handleClickOpenPopup = () => {
        setOpenPopup(true);
    };
    const handleClosePopup = () => {
        setOpenPopup(false);
    };

    let exportColumnNames = ['Company', 'Branch', 'Unit', 'Floor', 'Area', 'Pair Device 1',
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
    ];
    let exportRowValues = [
        'company',
        'branch',
        'unit',
        'floor',
        'area',
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
    ];

    const gridRefTable = useRef(null);
    const [isHandleChange, setIsHandleChange] = useState(false);
    const [isDisable, setIsDisable] = useState(false);
    const [sourceEdit, setSourceEdit] = useState({});
    const { isUserRoleCompare, alldepartment, allareagrouping, isAssignBranch, pageName, setPageName, buttonStyles, isUserRoleAccess, allfloor } = useContext(UserRoleAccessContext);
    const [searchQuery, setSearchQuery] = useState('');
    const accessbranch = isUserRoleAccess?.role?.includes('Manager')
        ? isAssignBranch?.map((data) => ({
            branch: data.branch,
            company: data.company,
            unit: data.unit,
            branchcode: data.branchcode,
            unitcode: data.unitcode,
        }))
        : isAssignBranch
            ?.filter((data) => {
                let fetfinalurl = [];

                if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0 && data?.mainpagenameurl?.length !== 0 && data?.subpagenameurl?.length !== 0 && data?.subsubpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)) {
                    fetfinalurl = data.subsubpagenameurl;
                } else if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0 && data?.mainpagenameurl?.length !== 0 && data?.subpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)) {
                    fetfinalurl = data.subpagenameurl;
                } else if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0 && data?.mainpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)) {
                    fetfinalurl = data.mainpagenameurl;
                } else if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)) {
                    fetfinalurl = data.submodulenameurl;
                } else if (data?.modulenameurl?.length !== 0) {
                    fetfinalurl = data.modulenameurl;
                } else {
                    fetfinalurl = [];
                }

                const remove = [window.location.pathname?.substring(1), window.location.pathname];
                return fetfinalurl?.some((item) => remove?.includes(item));
            })
            ?.map((data) => ({
                branch: data.branch,
                company: data.company,
                unit: data.unit,
                branchcode: data.branchcode,
                unitcode: data.unitcode,
            }));

    const filteredAreas = allareagrouping.filter((area) => accessbranch.some((access) => access.company === area.company && access.branch === area.branch && access.unit === area.unit));

    const { auth } = useContext(AuthContext);
    const [sourceCheck, setSourcecheck] = useState(false);
    const username = isUserRoleAccess.username;
    const gridRef = useRef(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchQueryManage, setSearchQueryManage] = useState('');
    const [copiedData, setCopiedData] = useState('');

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

    // page refersh reload
    const handleCloseFilterMod = () => {
        setIsFilterOpen(false);
    };
    const handleClosePdfFilterMod = () => {
        setIsPdfFilterOpen(false);
    };

    const [loader, setLoader] = useState(false);
    const [pairingDevicesArray, setPairingDevicesArray] = useState([]);
    const fetchUserGroupingArray = async () => {
        setLoader(true);
        setPageName(!pageName)
        try {
            const response = await axios.get(SERVICE.ALL_BIOMETRIC_PAIRED_DEVICE_GROUPING, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                }
            });
            console.log(response?.data, "response?.data")
            const answer = response?.data?.biometricpaireddevicesgrouping?.length > 0 ? response?.data?.biometricpaireddevicesgrouping?.map((item, index) => ({
                _id: item._id,
                serialNumber: (index + 1),
                company: item.company,
                branch: item.branch,
                unit: item.unit,
                floor: item.floor,
                area: item.area,
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
            setPairingDevicesArray(answer)
        } catch (err) {
            console.log(err, 'err')
            setLoader(false);
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    useEffect(() => { fetchUserGroupingArray() }, []);



    //company multiselect
    const [PairedDeviceOptions, setPairedDeviceOptions] = useState([]);
    const [PairedDeviceOptionsEdit, setPairedDeviceOptionsEdit] = useState([]);
    const fetchDeviceNamesBasedOnArea = async (biometric, area) => {
        setPageName(!pageName)
        try {
            const response = await axios.post(SERVICE.ALL_BIOMETRICDEVICES_PAIRED_DEVICES_AND_UNPAIRED, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                company: biometric?.company,
                branch: biometric?.branch,
                unit: biometric?.unit,
                floor: biometric?.floor,
                area: area,
            });
            console.log(response?.data, 'response?.data')
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
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const fetchDeviceNamesBasedOnAreaEdit = async (biometric, area) => {
        setPageName(!pageName)
        try {
            const response = await axios.post(SERVICE.ALL_BIOMETRICDEVICES_PAIRED_DEVICES_AND_UNPAIRED, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                company: biometric?.company,
                branch: biometric?.branch,
                unit: biometric?.unit,
                floor: biometric?.floor,
                area: area,
            });
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
            setPairedDeviceOptionsEdit(answer)
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const [selectedPairedDeviceOptions, setSelectedPairedDeviceOptions] = useState([]);
    let [valuePairedDevices, setValuePairedDevices] = useState([]);
    const handlePairedDeviceChange = (options) => {
        setValuePairedDevices(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedPairedDeviceOptions(options);
    };
    const customValueRendererPairedDevice = (valuePairedDevices, _categoryname) => {
        return valuePairedDevices?.length
            ? valuePairedDevices.map(({ label }) => label)?.join(", ")
            : "Please Select Paired Devices";
    };


    const [selectedPairedDeviceOptionsEdit, setSelectedPairedDeviceOptionsEdit] = useState([]);
    let [valuePairedDevicesEdit, setValuePairedDevicesEdit] = useState([]);
    const handlePairedDeviceChangeEdit = (options) => {
        setValuePairedDevicesEdit(
            options.map((a, index) => {
                return a.value;
            })
        );
        setSelectedPairedDeviceOptionsEdit(options);
    };
    const customValueRendererPairedDeviceEdit = (valuePairedDevices, _categoryname) => {
        return valuePairedDevices?.length
            ? valuePairedDevices.map(({ label }) => label)?.join(", ")
            : "Please Select Paired Devices";
    };
    const gridRefTableImg = useRef(null);
    // image
    const handleCaptureImage = () => {
        if (gridRefTableImg.current) {
            domtoimage
                .toBlob(gridRefTableImg.current)
                .then((blob) => {
                    saveAs(blob, 'Biometric Paired Devices Grouping.png');
                })
                .catch((error) => {
                    console.error('dom-to-image error: ', error);
                });
        }
    };

    const handleSelectionChange = (newSelection) => {
        setSelectedRows(newSelection.selectionModel);
    };




    //Datatable
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchedString, setSearchedString] = useState("")
    // view model
    const [openview, setOpenview] = useState(false);

    const handleClickOpenview = () => {
        setOpenview(true);
    };
    const handleCloseview = () => {
        setOpenview(false);
    };

    // Error Popup model
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [showAlert, setShowAlert] = useState();
    const handleClickOpenerr = () => {
        setIsErrorOpen(true);
    };
    const handleCloseerr = () => {
        setIsErrorOpen(false);
        setIsDisable(false);
    };

    //Delete model
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const handleClickOpen = () => {
        setIsDeleteOpen(true);
    };
    const handleCloseMod = () => {
        setIsDeleteOpen(false);
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

    //Delete model
    const [isDeleteOpencheckbox, setIsDeleteOpencheckbox] = useState(false);

    const handleClickOpencheckbox = () => {
        setIsDeleteOpencheckbox(true);
    };
    const handleCloseModcheckbox = () => {
        setIsDeleteOpencheckbox(false);
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
        setSearchQueryManage('');
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const getRowClassName = (params) => {
        if (selectedRows.includes(params.row.id)) {
            return 'custom-id-row'; // This is the custom class for rows with item.tat === 'ago'
        }
        return ''; // Return an empty string for other rows
    };

    // Show All Columns & Manage Columns
    const initialColumnVisibility = {
        serialNumber: true,
        checkbox: true,
        company: true,
        branch: true,
        unit: true,
        floor: true,
        area: true,
        mode: true,
        brand: true,
        model: true,
        biometricdeviceid: true,
        biometricserialno: true,
        biometricassignedip: true,
        biometriccommonname: true,
        paireddeviceone: true,
        paireddevicetwo: true,
        actions: true,
    };

    const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

    // page refersh reload code
    const handleBeforeUnload = (event) => {
        event.preventDefault();
        event.returnValue = ''; // This is required for Chrome support
    };

    const [deleteSource, setDeleteSource] = useState('');

    const rowData = async (id, name) => {
        setPageName(!pageName);
        try {
            let res = await axios.get(`${SERVICE.SINGLE_BIOMETRIC_PAIRED_DEVICE_GROUPING}/${id}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            console.log(res?.data, "biometricpaireddevicesgrouping")
            setDeleteSource(res?.data?.sbiometricpaireddevicesgrouping);
            handleClickOpen();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    // Alert delete popup
    let Sourcesid = deleteSource?._id;
    const delSource = async () => {
        setPageName(!pageName);
        try {
            const deletePromises = await axios.delete(`${SERVICE.SINGLE_BIOMETRIC_PAIRED_DEVICE_GROUPING}/${Sourcesid}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setFilteredRowData([]);
            setFilteredChanges(null);
            handleCloseMod();
            setSelectedRows([]);
            setPage(1);
            await fetchUserGroupingArray();
            setPopupContent('Deleted Successfully');
            setPopupSeverity('success');
            handleClickOpenPopup();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    const delSourcecheckbox = async () => {
        setPageName(!pageName);
        try {
            const deletePromises = selectedRows?.map((item) => {
                return axios.delete(`${SERVICE.SINGLE_BIOMETRIC_PAIRED_DEVICE_GROUPING}/${item}`, {
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
            setSelectAllChecked(false);
            setPage(1);
            await fetchUserGroupingArray();
            setPopupContent('Deleted Successfully');
            setPopupSeverity('success');
            handleClickOpenPopup();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const findDuplicateGroupingDevices = async (deviceData) => {
        setPageName(!pageName);
        try {
            const dup_data = await axios.post(`${SERVICE.GET_DUPLICATE_BIOMETRIC_DEVICE_GROUPING}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                deviceData: deviceData
            });
            return dup_data?.data
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    //add function
    const sendRequest = async () => {
        setPageName(!pageName);
        setBtnUpload(true);
        try {
            axios.post(SERVICE.CREATE_BIOMETRIC_PAIRED_DEVICE_GROUPING, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                company: String(pairedDeviceGroupingCreate.company),
                branch: String(pairedDeviceGroupingCreate.branch),
                unit: String(pairedDeviceGroupingCreate.unit),
                floor: String(pairedDeviceGroupingCreate.floor),
                area: String(pairedDeviceGroupingCreate.area),
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

                addedby: [
                    {
                        name: String(isUserRoleAccess.companyname),
                        date: String(new Date()),
                    },
                ],
            });
            setIsDisable(false);
            setSearchQuery('');
            await fetchUserGroupingArray();
            setPopupContent('Added Successfully');
            setPopupSeverity('success');
            handleClickOpenPopup();
            setBtnUpload(false);
        } catch (err) {
            setIsDisable(false);
            setBtnUpload(false);
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

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
        const isNameMatch = pairingDevicesArray.some(
            (item) =>
                item.company === pairedDeviceGroupingCreate.company &&
                item.branch === pairedDeviceGroupingCreate.branch &&
                item.unit === pairedDeviceGroupingCreate.unit &&
                item.floor === pairedDeviceGroupingCreate.floor &&
                item.area === pairedDeviceGroupingCreate.area &&
                item.paireddeviceone === pairedDeviceGroupingCreate.paireddeviceone
                &&
                item.paireddevicetwo === pairedDeviceGroupingCreate.paireddevicetwo
        );
        console.log(isNameMatch, 'isNameMatch')
        const Switches = !AttendanceInOutSwitchFirst && !AttendanceInSwitchFirst && !AttendanceOutSwitchFirst &&
            !AttendanceInOutSwitchSecond && !AttendanceInSwitchSecond && !AttendanceOutSwitchSecond
            && !BreakSwitchFirst && !ExitInSwitchFirst && !ExitOutSwitchFirst && !ExitInOutSwitchFirst
            && !ExitInSwitchSecond && !ExitOutSwitchSecond && !ExitInOutSwitchSecond && !BreakSwitchSecond;


        const AttendanceSwitches = AttendanceInOutSwitchFirst || AttendanceInSwitchFirst || AttendanceOutSwitchFirst || AttendanceInOutSwitchSecond || AttendanceInSwitchSecond || AttendanceOutSwitchSecond;
        const ExitSwitches = ExitInSwitchFirst || ExitOutSwitchFirst || ExitInOutSwitchFirst || ExitInSwitchSecond || ExitOutSwitchSecond || ExitInOutSwitchSecond

        const breakSwitches = !BreakSwitchFirst && !BreakSwitchSecond;

        if (pairedDeviceGroupingCreate.company === 'Please Select Company' || !pairedDeviceGroupingCreate.company) {
            setPopupContentMalert('Please Select Company');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (pairedDeviceGroupingCreate.branch === 'Please Select Branch' || !pairedDeviceGroupingCreate.branch) {
            setPopupContentMalert('Please Select Branch');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (pairedDeviceGroupingCreate.unit === 'Please Select Unit' || !pairedDeviceGroupingCreate.unit) {
            setPopupContentMalert('Please Select Unit');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (pairedDeviceGroupingCreate.floor === 'Please Select Floor' || !pairedDeviceGroupingCreate.floor) {
            setPopupContentMalert('Please Select Floor');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (pairedDeviceGroupingCreate.area === 'Please Select Area') {
            setPopupContentMalert('Please Select Area');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        else if (pairedDeviceGroupingCreate.paireddeviceone === 'Please Select First Device') {
            setPopupContentMalert('Please Select Device 1');
            setPopupSeverityMalert('warning');
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
        else if (isNameMatch) {
            setPopupContentMalert('Device Already Grouped!');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        else {
            sendRequest();
        }
    };

    const handleClear = (e) => {
        e.preventDefault();
        setPairedDeviceGroupingCreate({
            company: 'Please Select Company',
            branch: 'Please Select Branch',
            unit: 'Please Select Unit',
            floor: 'Please Select Floor',
            area: 'Please Select Area',
            paireddeviceone: "Please Select First Device",
            paireddevicetwo: "",
            pairedstatus: false
        });
        setValuePairedDevices([])
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
        setSelectedPairedDeviceOptions([]);
        setSearchQuery('');
        setPopupContent('Cleared Successfully');
        setPopupSeverity('success');
        handleClickOpenPopup();
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

    //Edit model...
    const [isEditOpen, setIsEditOpen] = useState(false);
    const handleClickOpenEdit = () => {
        setIsEditOpen(true);
    };
    const handleCloseModEdit = (e, reason) => {
        if (reason && reason === 'backdropClick') return;
        setIsEditOpen(false);
    };

    // info model
    const [openInfo, setOpeninfo] = useState(false);

    const handleClickOpeninfo = () => {
        setOpeninfo(true);
    };
    const handleCloseinfo = () => {
        setOpeninfo(false);
    };

    const [pairedDevicesDuplicateEdit, setPairedDevicesDuplicateEdit] = useState([]);
    //get single row to edit....
    const getCode = async (e, name) => {
        setPageName(!pageName);
        try {
            let res = await axios.get(`${SERVICE.SINGLE_BIOMETRIC_PAIRED_DEVICE_GROUPING}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setPairedDevicesDuplicateEdit(pairingDevicesArray?.filter((item) => item?._id !== e));
            setSourceEdit(res?.data?.sbiometricpaireddevicesgrouping);
            setPairedDeviceGroupingEdit(res?.data?.sbiometricpaireddevicesgrouping);
            const { attendanceinone, attendanceoutone,
                attendanceinoutone, exitinone, exitoutone, exitinoutone, breakone,
                breaktwo, attendanceintwo, attendanceouttwo,
                attendanceinouttwo, exitintwo, exitouttwo, exitinouttwo } = res?.data?.sbiometricpaireddevicesgrouping;

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

            fetchDeviceNamesBasedOnAreaEdit(res?.data?.sbiometricpaireddevicesgrouping, res?.data?.sbiometricpaireddevicesgrouping?.area)
            setSelectedPairedDeviceOptionsEdit(res?.data?.sbiometricpaireddevicesgrouping?.pairdevices?.map(data => ({
                label: data,
                value: data
            })));
            setValuePairedDevicesEdit(res?.data?.sbiometricpaireddevicesgrouping?.pairdevices)
            handleClickOpenEdit();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };


    // get single row to view....
    const getviewCode = async (e) => {
        setPageName(!pageName);
        try {
            let res = await axios.get(`${SERVICE.SINGLE_BIOMETRIC_PAIRED_DEVICE_GROUPING}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setSourceEdit(res?.data?.sbiometricpaireddevicesgrouping);
            handleClickOpenview();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    // get single row to view....
    const getinfoCode = async (e) => {
        setPageName(!pageName);
        try {
            let res = await axios.get(`${SERVICE.SINGLE_BIOMETRIC_PAIRED_DEVICE_GROUPING}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setSourceEdit(res?.data?.sbiometricpaireddevicesgrouping);
            handleClickOpeninfo();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    //Project updateby edit page...
    let updateby = sourceEdit?.updatedby;
    let addedby = sourceEdit?.addedby;
    let subprojectsid = sourceEdit?._id;

    //editing the single data...
    const sendEditRequest = async () => {
        setPageName(!pageName);
        try {
            let res = await axios.put(`${SERVICE.SINGLE_BIOMETRIC_PAIRED_DEVICE_GROUPING}/${subprojectsid}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                company: String(pairedDeviceGroupingEdit.company),
                branch: String(pairedDeviceGroupingEdit.branch),
                unit: String(pairedDeviceGroupingEdit.unit),
                floor: String(pairedDeviceGroupingEdit.floor),
                area: String(pairedDeviceGroupingEdit.area),
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
                updatedby: [
                    ...updateby,
                    {
                        name: String(isUserRoleAccess.companyname),
                        date: String(new Date()),
                    },
                ],
            });
            setFilteredRowData([]);
            setFilteredChanges(null);
            handleCloseModEdit();
            await fetchUserGroupingArray();
            setPopupContent('Updated Successfully');
            setPopupSeverity('success');
            handleClickOpenPopup();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    const editSubmit = async (e) => {
        e.preventDefault();
        const isNameMatch = pairedDevicesDuplicateEdit?.some(
            (item) =>
                item.company === pairedDeviceGroupingEdit.company &&
                item.branch === pairedDeviceGroupingEdit.branch &&
                item.unit === pairedDeviceGroupingEdit.unit &&
                item.floor === pairedDeviceGroupingEdit.floor &&
                item.area === pairedDeviceGroupingEdit.area &&
                item.paireddeviceone === pairedDeviceGroupingEdit.paireddeviceone &&
                item.paireddevicetwo === pairedDeviceGroupingEdit.paireddevicetwo
        );

        console.log(isNameMatch, valuePairedDevices, 'isNameMatch')
        const Switches = !AttendanceInOutSwitchFirstEdit && !AttendanceInSwitchFirstEdit && !AttendanceOutSwitchFirstEdit &&
            !AttendanceInOutSwitchSecondEdit && !AttendanceInSwitchSecondEdit && !AttendanceOutSwitchSecondEdit
            && !BreakSwitchFirstEdit && !ExitInSwitchFirstEdit && !ExitOutSwitchFirstEdit && !ExitInOutSwitchFirstEdit
            && !ExitInSwitchSecondEdit && !ExitOutSwitchSecondEdit && !ExitInOutSwitchSecondEdit && !BreakSwitchSecondEdit;


        const AttendanceSwitches = AttendanceInOutSwitchFirstEdit || AttendanceInSwitchFirstEdit || AttendanceOutSwitchFirstEdit || AttendanceInOutSwitchSecondEdit || AttendanceInSwitchSecondEdit || AttendanceOutSwitchSecondEdit;
        const ExitSwitches = ExitInSwitchFirstEdit || ExitOutSwitchFirstEdit || ExitInOutSwitchFirstEdit || ExitInSwitchSecondEdit || ExitOutSwitchSecondEdit || ExitInOutSwitchSecondEdit

        const breakSwitches = !BreakSwitchFirstEdit && !BreakSwitchSecondEdit;
        if (pairedDeviceGroupingEdit.company === 'Please Select Company' || !pairedDeviceGroupingEdit.company) {
            setPopupContentMalert('Please Select Company');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (pairedDeviceGroupingEdit.branch === 'Please Select Branch' || !pairedDeviceGroupingEdit.branch) {
            setPopupContentMalert('Please Select Branch');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (pairedDeviceGroupingEdit.unit === 'Please Select Unit' || !pairedDeviceGroupingEdit.unit) {
            setPopupContentMalert('Please Select Unit');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (pairedDeviceGroupingEdit.floor === 'Please Select Floor' || !pairedDeviceGroupingEdit.floor) {
            setPopupContentMalert('Please Select Floor');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (pairedDeviceGroupingEdit.area === 'Please Select Area') {
            setPopupContentMalert('Please Select Area');
            setPopupSeverityMalert('warning');
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
        else if (isNameMatch) {
            setPopupContentMalert('Device Already Grouped!');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        else {
            sendEditRequest();
        }
    };


    const [acpointCalculationArrayForExport, setAcpointCalculationArrayForExport] = useState([]);

    const fetchAcpointcalculation = async () => {
        setPageName(!pageName);
        try {
            let res_vendor = await axios.get(SERVICE.ALL_BIOMETRICDEVICESPAIRING, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setSourcecheck(true);
            setAcpointCalculationArrayForExport(
                res_vendor?.data?.devicespairing);
        } catch (err) {
            setSourcecheck(true);
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    useEffect(() => {
        fetchAcpointcalculation();
    }, [isFilterOpen]);

    const [overallFilterdata, setOverallFilterdata] = useState([]);
    const [overallFilterdataAllData, setOverallFilterdataAllData] = useState([]);
    const [totalProjects, setTotalProjects] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [anchorElSearch, setAnchorElSearch] = React.useState(null);
    const handleClickSearch = (event) => {
        setAnchorElSearch(event.currentTarget);
        localStorage.removeItem('filterModel');
    };
    const handleCloseSearch = () => {
        setAnchorElSearch(null);
        setSearchQuery('');
    };

    const openSearch = Boolean(anchorElSearch);
    const idSearch = openSearch ? 'simple-popover' : undefined;

    const handleAddFilter = () => {
        if ((selectedColumn && filterValue) || ['Blank', 'Not Blank'].includes(selectedCondition)) {
            setAdditionalFilters([...additionalFilters, { column: selectedColumn, condition: selectedCondition, value: filterValue }]);
            setSelectedColumn('');
            setSelectedCondition('Contains');
            setFilterValue('');
        }
    };

    const getSearchDisplay = () => {
        if (advancedFilter && advancedFilter.length > 0) {
            return advancedFilter
                .map((filter, index) => {
                    let showname = columnDataTable.find((col) => col.field === filter.column)?.headerName;
                    return `${showname} ${filter.condition} "${filter.value}"`;
                })
                .join(' ' + (advancedFilter.length > 1 ? advancedFilter[1].condition : '') + ' ');
        }
        return searchQuery;
    };


    //print...
    const componentRef = useRef();
    const handleprint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Biometric Paired Devices Grouping',
        pageStyle: 'print',
    });

    const getapi = async () => {
        let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
            headers: {
                Authorization: `Bearer${auth.APIToken}`,
            },
            empcode: String(isUserRoleAccess?.empcode),
            companyname: String(isUserRoleAccess?.companyname),
            pagename: String('Biometric Paired Devices Grouping'),
            commonid: String(isUserRoleAccess?._id),
            date: String(new Date()),

            addedby: [
                {
                    name: String(isUserRoleAccess?.username),
                    date: String(new Date()),
                },
            ],
        });
    };



    useEffect(() => {
        getapi();
        // fetchTeamAll();
    }, []);

    useEffect(() => {
        const beforeUnloadHandler = (event) => handleBeforeUnload(event);
        window.addEventListener('beforeunload', beforeUnloadHandler);
        return () => {
            window.removeEventListener('beforeunload', beforeUnloadHandler);
        };
    }, []);

    const [items, setItems] = useState([]);

    const addSerialNumber = (datas) => {
        setItems(datas);
    };

    useEffect(() => {
        addSerialNumber(pairingDevicesArray);
    }, [pairingDevicesArray]);

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
        // setPage(1);
    };
    //datatable....
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };
    // Split the search query into individual terms
    const searchTerms = searchQuery.toLowerCase().split(' ');
    // Modify the filtering logic to check each term
    const filteredDatas = items?.filter((item) => {
        return searchTerms.every((term) => Object.values(item).join(' ').toLowerCase().includes(term));
    });

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
            field: 'serialNumber',
            headerName: 'SNo',
            flex: 0,
            width: 100,
            hide: !columnVisibility.serialNumber,
            headerClassName: 'bold-header',
            pinned: 'left',
        },
        { field: 'company', headerName: 'Company', flex: 0, width: 150, hide: !columnVisibility.company, headerClassName: 'bold-header' },
        { field: 'branch', headerName: 'Branch', flex: 0, width: 150, hide: !columnVisibility.branch, headerClassName: 'bold-header' },
        { field: 'unit', headerName: 'Unit', flex: 0, width: 150, hide: !columnVisibility.unit, headerClassName: 'bold-header' },
        { field: 'floor', headerName: 'Floor', flex: 0, width: 150, hide: !columnVisibility.floor, headerClassName: 'bold-header' },
        { field: 'area', headerName: 'Area', flex: 0, width: 150, hide: !columnVisibility.area, headerClassName: 'bold-header' },
        { field: 'paireddeviceone', headerName: 'Pair Device 1', flex: 0, width: 250, hide: !columnVisibility.paireddeviceone, headerClassName: 'bold-header' },
        { field: 'paireddevicetwo', headerName: 'Pair Device 2', flex: 0, width: 250, hide: !columnVisibility.paireddevicetwo, headerClassName: 'bold-header' },
        {
            field: 'actions',
            headerName: 'Action',
            flex: 0,
            width: 280,
            minHeight: '40px !important',
            sortable: false,
            hide: !columnVisibility.actions,
            headerClassName: 'bold-header',
            cellRenderer: (params) => (
                <Grid sx={{ display: 'flex' }}>
                    {isUserRoleCompare?.includes('ebiometricpaireddevicesgrouping') && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getCode(params.data.id, params.data.name);
                            }}
                        >
                            <EditOutlinedIcon sx={buttonStyles.buttonedit} />{' '}
                        </Button>
                    )}
                    {isUserRoleCompare?.includes('dbiometricpaireddevicesgrouping') && (
                        <Button
                            sx={userStyle.buttondelete}
                            onClick={(e) => {
                                rowData(params.data.id, params.data.name);
                            }}
                        >
                            <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />{' '}
                        </Button>
                    )}
                    {isUserRoleCompare?.includes('vbiometricpaireddevicesgrouping') && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getviewCode(params.data.id);
                            }}
                        >
                            <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />{' '}
                        </Button>
                    )}
                    {isUserRoleCompare?.includes('ibiometricpaireddevicesgrouping') && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getinfoCode(params.data.id);
                            }}
                        >
                            <InfoOutlinedIcon sx={buttonStyles.buttoninfo} />{' '}
                        </Button>
                    )}
                </Grid>
            ),
        },
    ];

    const filteredSelectedColumn = columnDataTable.filter((data) => data.field !== 'checkbox' && data.field !== 'actions' && data.field !== 'serialNumber');

    const rowDataTable = filteredDatas.map((item, index) => {
        return {
            id: item._id,
            serialNumber: item.serialNumber,
            company: item.company,
            branch: item.branch,
            unit: item.unit,
            floor: item.floor,
            area: item.area,
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
        // Create a custom field for rendering the checkbox
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

    // // Function to filter columns based on search query
    const filteredColumns = columnDataTable.filter((column) => column.headerName.toLowerCase().includes(searchQueryManage.toLowerCase()));

    // Manage Columns functionality
    const toggleColumnVisibility = (field) => {
        setColumnVisibility((prevVisibility) => ({
            ...prevVisibility,
            [field]: !prevVisibility[field],
        }));
    };

    // JSX for the "Manage Columns" popover content
    const manageColumnsContent = (
        <Box style={{ padding: '10px', minWidth: '325px', '& .MuiDialogContent-root': { padding: '10px 0' } }}>
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
                <TextField label="Find column" variant="standard" fullWidth value={searchQueryManage} onChange={(e) => setSearchQueryManage(e.target.value)} sx={{ marginBottom: 5, position: 'absolute' }} />
            </Box>
            <br />
            <br />
            <DialogContent sx={{ minWidth: 'auto', height: '200px', position: 'relative' }}>
                <List sx={{ overflow: 'auto', height: '100%' }}>
                    {filteredColumns.map((column) => (
                        <ListItem key={column.field}>
                            <ListItemText
                                sx={{ display: 'flex' }}
                                primary={<Switch sx={{ marginTop: '-5px' }} size="small" checked={columnVisibility[column.field]} onChange={() => toggleColumnVisibility(column.field)} />}
                                secondary={column.field === 'checkbox' ? 'Checkbox' : column.headerName}
                            // secondary={column.headerName }
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Grid container>
                    <Grid item md={4}>
                        <Button variant="text" sx={{ textTransform: 'none' }} onClick={() => setColumnVisibility(initialColumnVisibility)}>
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

    return (
        <Box>
            <Headtitle title={'BIOMETRIC DEVICE MANAGEMENT'} />
            {/* ****** Header Content ****** */}
            <PageHeading title="Biometric Paired Devices Grouping" modulename="Human Resources" submodulename="HR" mainpagename="BX-Biometric Device" subpagename="Biometric Paired Devices Grouping" subsubpagename="" />
            {isUserRoleCompare?.includes('abiometricpaireddevicesgrouping') && (
                <>
                    <Box sx={userStyle.dialogbox}>
                        <>
                            <Grid container spacing={2}>
                                <Grid item xs={8}>
                                    <Typography sx={userStyle.importheadtext}>Add Biometric Paired Devices Grouping</Typography>
                                </Grid>
                            </Grid>
                            <br />
                            <Grid container spacing={2}>
                                <>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Company <b style={{ color: 'red' }}>*</b>
                                            </Typography>
                                            <Selects
                                                options={accessbranch
                                                    .map((data) => ({
                                                        label: data.company,
                                                        value: data.company,
                                                    }))
                                                    .filter((item, index, self) => {
                                                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                    })}
                                                styles={colourStyles}
                                                value={{
                                                    label: pairedDeviceGroupingCreate.company,
                                                    value: pairedDeviceGroupingCreate.company,
                                                }}
                                                onChange={(e) => {
                                                    setPairedDeviceGroupingCreate({
                                                        ...pairedDeviceGroupingCreate,
                                                        company: e.value,
                                                        branch: 'Please Select Branch',
                                                        unit: 'Please Select Unit',
                                                        floor: 'Please Select Floor',
                                                        area: 'Please Select Area',
                                                        paireddeviceone: "Please Select First Device",
                                                        paireddevicetwo: "",
                                                        pairedstatus: false
                                                    });
                                                    setValuePairedDevices([])
                                                    setPairedDeviceOptions([]);
                                                    setSelectedPairedDeviceOptions([]);
                                                    handleClearButtons()
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Branch<b style={{ color: 'red' }}>*</b>
                                            </Typography>
                                            <Selects
                                                options={accessbranch
                                                    ?.filter((comp) => comp.company === pairedDeviceGroupingCreate?.company)
                                                    .map((data) => ({
                                                        label: data.branch,
                                                        value: data.branch,
                                                        branchcode: data.branchcode,
                                                    }))
                                                    .filter((item, index, self) => {
                                                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                    })}
                                                styles={colourStyles}
                                                value={{
                                                    label: pairedDeviceGroupingCreate.branch,
                                                    value: pairedDeviceGroupingCreate.branch,
                                                }}
                                                onChange={(e) => {
                                                    setPairedDeviceGroupingCreate({
                                                        ...pairedDeviceGroupingCreate,
                                                        branch: e.value,
                                                        unit: 'Please Select Unit',
                                                        floor: 'Please Select Floor',
                                                        area: 'Please Select Area',
                                                        paireddeviceone: "Please Select First Device",
                                                        paireddevicetwo: "",
                                                        pairedstatus: false
                                                    });
                                                    setValuePairedDevices([])
                                                    setPairedDeviceOptions([]);
                                                    setSelectedPairedDeviceOptions([]);
                                                    handleClearButtons();
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Unit<b style={{ color: 'red' }}>*</b>
                                            </Typography>
                                            <Selects
                                                options={accessbranch
                                                    ?.filter((comp) => comp.company === pairedDeviceGroupingCreate?.company && comp.branch === pairedDeviceGroupingCreate?.branch)
                                                    .map((data) => ({
                                                        label: data.unit,
                                                        value: data.unit,
                                                        unitcode: data.unitcode,
                                                    }))
                                                    .filter((item, index, self) => {
                                                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                    })}
                                                styles={colourStyles}
                                                value={{
                                                    label: pairedDeviceGroupingCreate.unit,
                                                    value: pairedDeviceGroupingCreate.unit,
                                                }}
                                                onChange={(e) => {
                                                    setPairedDeviceGroupingCreate({
                                                        ...pairedDeviceGroupingCreate,
                                                        unit: e.value,
                                                        floor: 'Please Select Floor',
                                                        area: 'Please Select Area',
                                                        paireddeviceone: "Please Select First Device",
                                                        paireddevicetwo: "",
                                                        pairedstatus: false
                                                    });
                                                    setValuePairedDevices([])
                                                    setPairedDeviceOptions([]);
                                                    setSelectedPairedDeviceOptions([]);
                                                    handleClearButtons();
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Floor<b style={{ color: 'red' }}>*</b>
                                            </Typography>
                                            <Selects
                                                options={allfloor
                                                    ?.filter((u) => pairedDeviceGroupingCreate?.branch === u.branch)
                                                    .map((u) => ({
                                                        ...u,
                                                        label: u.name,
                                                        value: u.name,
                                                    }))
                                                    .filter((item, index, self) => {
                                                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                    })}
                                                styles={colourStyles}
                                                value={{
                                                    label: pairedDeviceGroupingCreate.floor,
                                                    value: pairedDeviceGroupingCreate.floor,
                                                }}
                                                onChange={(e) => {
                                                    setPairedDeviceGroupingCreate({
                                                        ...pairedDeviceGroupingCreate,
                                                        floor: e.value,
                                                        area: 'Please Select Area',
                                                        paireddeviceone: "Please Select First Device",
                                                        paireddevicetwo: "",
                                                        pairedstatus: false
                                                    });
                                                    setValuePairedDevices([])
                                                    setPairedDeviceOptions([]);
                                                    setSelectedPairedDeviceOptions([]);
                                                    handleClearButtons();
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Area<b style={{ color: 'red' }}>*</b>
                                            </Typography>
                                            <Selects
                                                maxMenuHeight={300}
                                                options={filteredAreas
                                                    .filter((item) => pairedDeviceGroupingCreate?.floor === item.floor && pairedDeviceGroupingCreate?.branch === item.branch)
                                                    .flatMap((item) => item.area)
                                                    .map((location) => ({
                                                        label: location,
                                                        value: location,
                                                    }))}
                                                value={{
                                                    label: pairedDeviceGroupingCreate.area,
                                                    value: pairedDeviceGroupingCreate.area,
                                                }}
                                                onChange={(e) => {
                                                    setPairedDeviceGroupingCreate({
                                                        ...pairedDeviceGroupingCreate,
                                                        area: e.value,
                                                        paireddeviceone: "Please Select First Device",
                                                        paireddevicetwo: "",
                                                        pairedstatus: false
                                                    });
                                                    fetchDeviceNamesBasedOnArea(pairedDeviceGroupingCreate, e.value)
                                                    setValuePairedDevices([])
                                                    setSelectedPairedDeviceOptions([]);
                                                    handleClearButtons();
                                                }}
                                            />
                                        </FormControl>
                                        <br />
                                        <br />
                                    </Grid>

                                </>
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
                                <Grid container spacing={2}>
                                    <Grid item md={3} sm={12} xs={12}>
                                        <Typography>&nbsp;</Typography>
                                        <Grid
                                            sx={{
                                                display: 'flex',

                                                gap: '15px',
                                            }}
                                        >
                                            <LoadingButton loading={btnUpload} sx={buttonStyles.buttonsubmit} onClick={handleSubmit}>
                                                SAVE
                                            </LoadingButton>
                                            <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                                                CLEAR
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </>
                    </Box>
                </>
            )}
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
                >
                    <Box sx={{ padding: '20px' }}>
                        <>
                            <form onSubmit={editSubmit}>
                                {/* <DialogContent sx={{ width: '550px', padding: '20px' }}> */}
                                <Grid container spacing={2}>
                                    <Grid item md={12} xs={12} sm={12}>
                                        <Typography sx={userStyle.HeaderText}>Edit Biometric Paired Devices Grouping</Typography>
                                    </Grid>
                                </Grid>
                                <br />
                                <Grid container spacing={2}>
                                    <>
                                        <Grid item md={3} xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Company <b style={{ color: 'red' }}>*</b>
                                                </Typography>
                                                <Selects
                                                    options={accessbranch
                                                        .map((data) => ({
                                                            label: data.company,
                                                            value: data.company,
                                                        }))
                                                        .filter((item, index, self) => {
                                                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                        })}
                                                    styles={colourStyles}
                                                    value={{
                                                        label: pairedDeviceGroupingEdit.company,
                                                        value: pairedDeviceGroupingEdit.company,
                                                    }}
                                                    onChange={(e) => {
                                                        setPairedDeviceGroupingEdit({
                                                            ...pairedDeviceGroupingEdit,
                                                            company: e.value,
                                                            branch: 'Please Select Branch',
                                                            unit: 'Please Select Unit',
                                                            floor: 'Please Select Floor',
                                                            area: 'Please Select Area',
                                                            paireddeviceone: "Please Select First Device",
                                                            paireddevicetwo: "",
                                                            pairedstatus: false
                                                        });
                                                        setValuePairedDevicesEdit([])
                                                        setSelectedPairedDeviceOptionsEdit([])
                                                        setPairedDeviceOptionsEdit([])
                                                        handleClearButtonsEdit();
                                                    }}
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={3} xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Branch<b style={{ color: 'red' }}>*</b>
                                                </Typography>
                                                <Selects
                                                    options={accessbranch
                                                        ?.filter((comp) => comp.company === pairedDeviceGroupingEdit?.company)
                                                        .map((data) => ({
                                                            label: data.branch,
                                                            value: data.branch,
                                                            branchcode: data.branchcode,
                                                        }))
                                                        .filter((item, index, self) => {
                                                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                        })}
                                                    styles={colourStyles}
                                                    value={{
                                                        label: pairedDeviceGroupingEdit.branch,
                                                        value: pairedDeviceGroupingEdit.branch,
                                                    }}
                                                    onChange={(e) => {
                                                        setPairedDeviceGroupingEdit({
                                                            ...pairedDeviceGroupingEdit,
                                                            branch: e.value,
                                                            unit: 'Please Select Unit',
                                                            floor: 'Please Select Floor',
                                                            area: 'Please Select Area',
                                                            paireddeviceone: "Please Select First Device",
                                                            paireddevicetwo: "",
                                                            pairedstatus: false
                                                        });
                                                        setValuePairedDevicesEdit([])
                                                        setSelectedPairedDeviceOptionsEdit([])
                                                        setPairedDeviceOptionsEdit([])
                                                        handleClearButtonsEdit();
                                                    }}
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={3} xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Unit<b style={{ color: 'red' }}>*</b>
                                                </Typography>
                                                <Selects
                                                    options={accessbranch
                                                        ?.filter((comp) => comp.company === pairedDeviceGroupingEdit?.company && comp.branch === pairedDeviceGroupingEdit?.branch)
                                                        .map((data) => ({
                                                            label: data.unit,
                                                            value: data.unit,
                                                        }))
                                                        .filter((item, index, self) => {
                                                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                        })}
                                                    styles={colourStyles}
                                                    value={{
                                                        label: pairedDeviceGroupingEdit.unit,
                                                        value: pairedDeviceGroupingEdit.unit,
                                                    }}
                                                    onChange={(e) => {
                                                        setPairedDeviceGroupingEdit({
                                                            ...pairedDeviceGroupingEdit,
                                                            unit: e.value,
                                                            floor: 'Please Select Floor',
                                                            area: 'Please Select Area',
                                                            paireddeviceone: "Please Select First Device",
                                                            paireddevicetwo: "",
                                                            pairedstatus: false
                                                        });
                                                        setValuePairedDevicesEdit([])
                                                        setSelectedPairedDeviceOptionsEdit([])
                                                        setPairedDeviceOptionsEdit([])
                                                        handleClearButtonsEdit();

                                                    }}
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={3} xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Floor<b style={{ color: 'red' }}>*</b>
                                                </Typography>
                                                <Selects
                                                    options={allfloor
                                                        ?.filter((u) => pairedDeviceGroupingEdit?.branch === u.branch)
                                                        .map((u) => ({
                                                            ...u,
                                                            label: u.name,
                                                            value: u.name,
                                                        }))
                                                        .filter((item, index, self) => {
                                                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                        })}
                                                    styles={colourStyles}
                                                    value={{
                                                        label: pairedDeviceGroupingEdit.floor,
                                                        value: pairedDeviceGroupingEdit.floor,
                                                    }}
                                                    onChange={(e) => {
                                                        setPairedDeviceGroupingEdit({
                                                            ...pairedDeviceGroupingEdit,
                                                            floor: e.value,
                                                            area: 'Please Select Area',
                                                            paireddeviceone: "Please Select First Device",
                                                            paireddevicetwo: "",
                                                            pairedstatus: false
                                                        });
                                                        setValuePairedDevicesEdit([])
                                                        setSelectedPairedDeviceOptionsEdit([])
                                                        setPairedDeviceOptionsEdit([])
                                                        handleClearButtonsEdit();
                                                    }}
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={3} xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Area<b style={{ color: 'red' }}>*</b>
                                                </Typography>
                                                <Selects
                                                    maxMenuHeight={300}
                                                    options={filteredAreas
                                                        .filter((item) => pairedDeviceGroupingEdit?.floor === item.floor && pairedDeviceGroupingEdit?.branch === item.branch)
                                                        .flatMap((item) => item.area)
                                                        .map((location) => ({
                                                            label: location,
                                                            value: location,
                                                        }))}
                                                    value={{
                                                        label: pairedDeviceGroupingEdit.area,
                                                        value: pairedDeviceGroupingEdit.area,
                                                    }}
                                                    onChange={(e) => {
                                                        setPairedDeviceGroupingEdit({
                                                            ...pairedDeviceGroupingEdit,
                                                            area: e.value,
                                                            paireddeviceone: "Please Select First Device",
                                                            paireddevicetwo: "",
                                                            pairedstatus: false
                                                        });
                                                        setValuePairedDevicesEdit([])
                                                        setSelectedPairedDeviceOptionsEdit([])
                                                        handleClearButtonsEdit();
                                                        fetchDeviceNamesBasedOnAreaEdit(pairedDeviceGroupingEdit, e.value)
                                                    }}
                                                />
                                            </FormControl>
                                        </Grid>
                                    </>
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
                                        <Button sx={buttonStyles.buttonsubmit} type="submit">
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
            <br />
            {/* ****** Table Start ****** */}
            {isUserRoleCompare?.includes('lbiometricpaireddevicesgrouping') && (
                <>
                    <Box sx={userStyle.container}>
                        {/* ******************************************************EXPORT Buttons****************************************************** */}
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>Biometric Paired Devices Grouping List</Typography>
                        </Grid>
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
                                        sx={{ width: '77px' }}
                                    >
                                        <MenuItem value={1}>1</MenuItem>
                                        <MenuItem value={5}>5</MenuItem>
                                        <MenuItem value={10}>10</MenuItem>
                                        <MenuItem value={25}>25</MenuItem>
                                        <MenuItem value={50}>50</MenuItem>
                                        <MenuItem value={100}>100</MenuItem>
                                        <MenuItem value={pairingDevicesArray?.length}>All</MenuItem>
                                    </Select>
                                </Box>
                            </Grid>
                            <Grid item md={8} xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Box>
                                    {isUserRoleCompare?.includes('excelbiometricpaireddevicesgrouping') && (
                                        <>
                                            <Button
                                                onClick={(e) => {
                                                    setIsFilterOpen(true);
                                                    fetchAcpointcalculation();
                                                    setFormat('xl');
                                                }}
                                                sx={userStyle.buttongrp}
                                            >
                                                <FaFileExcel />
                                                &ensp;Export to Excel&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes('csvbiometricpaireddevicesgrouping') && (
                                        <>
                                            <Button
                                                onClick={(e) => {
                                                    setIsFilterOpen(true);
                                                    fetchAcpointcalculation();
                                                    setFormat('csv');
                                                }}
                                                sx={userStyle.buttongrp}
                                            >
                                                <FaFileCsv />
                                                &ensp;Export to CSV&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes('printbiometricpaireddevicesgrouping') && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleprint}>
                                                &ensp;
                                                <FaPrint />
                                                &ensp;Print&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes('pdfbiometricpaireddevicesgrouping') && (
                                        <>
                                            <Button
                                                sx={userStyle.buttongrp}
                                                onClick={() => {
                                                    setIsPdfFilterOpen(true);
                                                    fetchAcpointcalculation();
                                                }}
                                            >
                                                <FaFilePdf />
                                                &ensp;Export to PDF&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes('imagebiometricpaireddevicesgrouping') && (
                                        <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}>
                                            {' '}
                                            <ImageIcon sx={{ fontSize: '15px' }} /> &ensp;Image&ensp;{' '}
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
                                    maindatas={pairingDevicesArray}
                                    setSearchedString={setSearchedString}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    paginated={false}
                                    totalDatas={pairingDevicesArray}

                                />
                            </Grid>
                        </Grid>
                        <br />
                        <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>
                            Show All Columns
                        </Button>
                        &ensp;
                        <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumns}>
                            Manage Columns
                        </Button>
                        &ensp;
                        {isUserRoleCompare?.includes('bdbiometricpaireddevicesgrouping') && (
                            <Button sx={buttonStyles.buttonbulkdelete} onClick={handleClickOpenalert}>
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
                                    itemsList={pairingDevicesArray}
                                />

                            )}
                        </Box>
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
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                {manageColumnsContent}
            </Popover>
            {/* view model */}
            <Dialog open={openview}
                onClose={handleClickOpenview}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="md"
                fullWidth={true}
                sx={{ marginTop: '80px' }}>
                <Box sx={{ padding: '20px 50px' }}>
                    <>
                        <Typography sx={userStyle.HeaderText}> View Biometric Paired Devices Grouping</Typography>
                        <br /> <br />
                        <Grid container spacing={2}>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Company</Typography>
                                    <Typography>{sourceEdit?.company}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Branch</Typography>
                                    <Typography>{sourceEdit?.branch}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Unit</Typography>
                                    <Typography>{sourceEdit?.unit}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Floor</Typography>
                                    <Typography>{sourceEdit?.floor}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Area</Typography>
                                    <Typography>{sourceEdit?.area}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={12} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Pair Device 1</Typography>
                                    <Typography>{sourceEdit?.paireddeviceone}</Typography>
                                </FormControl>
                            </Grid>

                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Attendance In</Typography>
                                    <Typography>{sourceEdit?.attendanceinone?.toString()}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Attendance Out</Typography>
                                    <Typography>{sourceEdit?.attendanceoutone?.toString()}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Attendance InOut</Typography>
                                    <Typography>{sourceEdit?.attendanceinoutone?.toString()}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Exit In</Typography>
                                    <Typography>{sourceEdit?.exitinone?.toString()}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Exit Out</Typography>
                                    <Typography>{sourceEdit?.exitoutone?.toString()}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Exit InOut</Typography>
                                    <Typography>{sourceEdit?.exitinoutone?.toString()}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Break</Typography>
                                    <Typography>{sourceEdit?.breakone?.toString()}</Typography>
                                </FormControl>
                            </Grid>

                            {sourceEdit?.pairedstatus &&
                                <>
                                    <Grid item md={12} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6">Pair Device 2</Typography>
                                            <Typography>{sourceEdit?.paireddevicetwo}</Typography>
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6">Attendance In</Typography>
                                            <Typography>{sourceEdit?.attendanceintwo?.toString()}</Typography>
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6">Attendance Out</Typography>
                                            <Typography>{sourceEdit?.attendanceouttwo?.toString()}</Typography>
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6">Attendance InOut</Typography>
                                            <Typography>{sourceEdit?.attendanceinouttwo?.toString()}</Typography>
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6">Exit In</Typography>
                                            <Typography>{sourceEdit?.exitintwo?.toString()}</Typography>
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6">Exit Out</Typography>
                                            <Typography>{sourceEdit?.exitouttwo?.toString()}</Typography>
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6">Exit InOut</Typography>
                                            <Typography>{sourceEdit?.exitinouttwo?.toString()}</Typography>
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6">Break</Typography>
                                            <Typography>{sourceEdit?.breaktwo?.toString()}</Typography>
                                        </FormControl>
                                    </Grid>
                                </>}
                        </Grid>
                        <br /> <br /> <br />
                        <Grid container spacing={2}>
                            <Button sx={buttonStyles.btncancel} onClick={handleCloseview}>
                                {' '}
                                Back{' '}
                            </Button>
                        </Grid>
                    </>
                </Box>
            </Dialog>
            {/* ALERT DIALOG */}
            <Box>
                <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                    <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
                        <Typography variant="h6">{showAlert}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" color="error" onClick={handleCloseerr}>
                            ok
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
            {/* EXTERNAL COMPONENTS -------------- START */}
            {/* VALIDATION */}
            <MessageAlert openPopup={openPopupMalert} handleClosePopup={handleClosePopupMalert} popupContent={popupContentMalert} popupSeverity={popupSeverityMalert} />
            {/* SUCCESS */}
            <AlertDialog openPopup={openPopup} handleClosePopup={handleClosePopup} popupContent={popupContent} popupSeverity={popupSeverity} />
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
                itemsTwo={acpointCalculationArrayForExport ?? []}
                filename={'Biometric Paired Devices Grouping'}
                exportColumnNames={exportColumnNames}
                exportRowValues={exportRowValues}
                componentRef={componentRef}
            />
            {/* INFO */}
            <InfoPopup openInfo={openInfo} handleCloseinfo={handleCloseinfo} heading="Biometric Paired Devices Grouping Info" addedby={addedby} updateby={updateby} />
            {/*SINGLE DELETE ALERT DIALOG ARE YOU SURE? */}
            <DeleteConfirmation open={isDeleteOpen} onClose={handleCloseMod} onConfirm={delSource} title="Are you sure?" confirmButtonText="Yes" cancelButtonText="Cancel" />
            {/*BULK DELETE ALERT DIALOG ARE YOU SURE? */}
            <DeleteConfirmation open={isDeleteOpencheckbox} onClose={handleCloseModcheckbox} onConfirm={delSourcecheckbox} title="Are you sure?" confirmButtonText="Yes" cancelButtonText="Cancel" />
            {/* PLEASE SELECT ANY ROW */}
            <PleaseSelectRow open={isDeleteOpenalert} onClose={handleCloseModalert} message="Please Select any Row" iconColor="orange" buttonText="OK" />
            {/* EXTERNAL COMPONENTS -------------- END */}
        </Box>
    );
}

export default BiometricPairedDevicesGrouping;
