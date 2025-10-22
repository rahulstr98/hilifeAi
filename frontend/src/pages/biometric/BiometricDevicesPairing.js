import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ImageIcon from '@mui/icons-material/Image';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FormGroup from '@mui/material/FormGroup';
import LoadingButton from '@mui/lab/LoadingButton';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, List, ListItem, ListItemText, MenuItem, OutlinedInput, Popover, Radio, RadioGroup, Select, TextField, Tooltip, Typography } from '@mui/material';
import Switch from '@mui/material/Switch';
import axios from '../../axiosInstance';
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
import AlertDialog from '../../components/Alert.js';
import { DeleteConfirmation, PleaseSelectRow } from '../../components/DeleteConfirmation.js';
import { handleApiError } from '../../components/Errorhandling.js';
import ExportData from '../../components/ExportData.js';
import Headtitle from '../../components/Headtitle.js';
import InfoPopup from '../../components/InfoPopup.js';
import MessageAlert from '../../components/MessageAlert.js';
import PageHeading from '../../components/PageHeading.js';
import { AuthContext, UserRoleAccessContext } from '../../context/Appcontext.js';
import { userStyle, colourStyles } from '../../pageStyle.js';
import { SERVICE } from '../../services/Baseservice.js';
import AggregatedSearchBar from '../../components/AggregatedSearchBar';
import AggridTable from "../../components/AggridTable";

function BiometricDevicesPairing() {
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
    const [biometricDevicePairingCreate, setBiometricDevicePairingCreate] = useState({
        mode: 'New',
        brand: 'Please Select Brand',
        model: 'Please Select Model',
        company: 'Please Select Company',
        branch: 'Please Select Branch',
        unit: 'Please Select Unit',
        floor: 'Please Select Floor',
        area: 'Please Select Area',
        branchcode: '',
        unitcode: '',
        floorcode: '',
        biometricdeviceid: '',
        biometricserialno: '',
        biometricassignedip: '',
    });


    const [biometricDevicePairingEdit, setBiometricDevicePairingEdit] = useState({
        company: 'Please Select Company',
        branch: 'Please Select Branch',
        unit: 'Please Select Unit',
        area: 'Please Select Area',
        branchcode: '',
        unitcode: '',
        floorcode: '',
    });
    const [getOverAllCountDelete, setGetOverallCountDelete] = useState('');
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

    let exportColumnNames = ['Company', 'Branch', 'Unit', 'Floor', 'Area', 'Pair Devices'];
    let exportRowValues = [
        'company',
        'branch',
        'unit',
        'floor',
        'area',
        'pairdevicestable',
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
    const [pairedDevicesGroupingArray, setPairedDevicesGroupingArray] = useState([]);
    const fetchUserGroupingArray = async () => {
        setLoader(true);
        setPageName(!pageName)
        try {
            const response = await axios.get(SERVICE.ALL_BIOMETRICDEVICESPAIRING, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                }
            });
            console.log(response?.data, "response?.data")
            const answer = response?.data?.devicespairing?.length > 0 ? response?.data?.devicespairing?.map((data, index) => ({
                ...data,
                serialNumber: (index + 1),
                "pairdevicestable": data?.pairdevices?.map((item, index) => `${index + 1}. ${item} `).toString()
            })) : []
            setLoader(false);
            setPairingDevicesArray([])
        } catch (err) {
            console.log(err, 'err')
            setLoader(false);
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const fetchPairedDevicesGroupingArray = async () => {
        setPageName(!pageName)
        try {
            const response = await axios.get(SERVICE.ALL_BIOMETRIC_PAIRED_DEVICE_GROUPING, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                }
            });
            console.log(response?.data, "response?.data")
            const answer = response?.data?.biometricpaireddevicesgrouping?.length > 0 ? response?.data?.biometricpaireddevicesgrouping?.map((data, index) => ({
                ...data,
                serialNumber: (index + 1)
            })) : []
            setPairedDevicesGroupingArray(answer)
        } catch (err) {
            console.log(err, 'err')
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };

    useEffect(() => {
        fetchUserGroupingArray();
        fetchPairedDevicesGroupingArray();
    }, []);



    //company multiselect
    const [PairedDeviceOptions, setPairedDeviceOptions] = useState([]);
    const [PairedDeviceOptionsEdit, setPairedDeviceOptionsEdit] = useState([]);
    const fetchDeviceNamesBasedOnArea = async (biometric, area) => {
        setPageName(!pageName)
        try {
            const response = await axios.post(SERVICE.ALL_BIOMETRICDEVICES_BASED_ON_AREA, {
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
            const answer = response?.data?.biodevices?.length > 0 ? response?.data?.biodevices?.map(data => ({
                label: data?.biometriccommonname,
                value: data?.biometriccommonname,
            })) : [];
            setPairedDeviceOptions(answer)
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const fetchDeviceNamesBasedOnAreaEdit = async (biometric, area) => {
        setPageName(!pageName)
        try {
            const response = await axios.post(SERVICE.ALL_BIOMETRICDEVICES_BASED_ON_AREA, {
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
            const answer = response?.data?.biodevices?.length > 0 ? response?.data?.biodevices?.map(data => ({
                label: data?.biometriccommonname,
                value: data?.biometriccommonname,
            })) : [];
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
                    saveAs(blob, 'Biometric Devices Pairing.png');
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

    //check delete model
    const [isCheckOpen, setisCheckOpen] = useState(false);
    const handleClickOpenCheck = () => {
        setisCheckOpen(true);
    };
    const handleCloseCheck = () => {
        setisCheckOpen(false);
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
            getOverallEditSectionOverallDelete(selectedRows);
        }
    };
    const [selectedRowsCount, setSelectedRowsCount] = useState(0);
    //overall edit section for all pages
    const getOverallEditSectionOverallDelete = async (ids) => {
        setPageName(!pageName);
        try {
            let res = await axios.post(SERVICE.OVERALL_BULK_BIO_DEVICE_PAIRING_DELETE, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                id: ids,
            });
            setSelectedRows(res?.data?.result);
            setSelectedRowsCount(res?.data?.count);
            setSelectAllChecked(res?.data?.count === filteredDatas.length);
            setIsDeleteOpencheckbox(true);
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
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
        pairdevicestable: true,
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
            let res = await axios.get(`${SERVICE.SINGLE_BIOMETRICDEVICESPAIRING}/${id}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            console.log(res?.data, "biometricdevicespairing")
            setDeleteSource(res?.data?.sdevicespairing);
            getOverallEditSectionDelete(res?.data?.sdevicespairing?.pairdevices);
            // handleClickOpen();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    const getOverallEditSectionDelete = async (e) => {
        setPageName(!pageName);
        try {
            let res = await axios.post(SERVICE.OVERALL_BIO_DEVICE_PAIRING_DELETE, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                oldname: e,
            });
            setGetOverallCountDelete(`This Biometric Pairing Devices is linked in 
       ${res?.data?.paireddevice?.length > 0 ? 'Biometric Paired Device,' : ''}`);

            if (res?.data?.count > 0) {
                handleClickOpenCheck();
            } else {
                handleClickOpen();
            }
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    // Alert delete popup
    let Sourcesid = deleteSource?._id;
    const delSource = async () => {
        setPageName(!pageName);
        try {
            const deletePromises = await axios.delete(`${SERVICE.SINGLE_BIOMETRICDEVICESPAIRING}/${Sourcesid}`, {
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
                return axios.delete(`${SERVICE.SINGLE_BIOMETRICDEVICESPAIRING}/${item}`, {
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


    //add function
    const sendRequest = async () => {
        setPageName(!pageName);
        setBtnUpload(true);
        try {
            axios.post(SERVICE.CREATE_BIOMETRICDEVICESPAIRING, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                company: String(biometricDevicePairingCreate.company),
                branch: String(biometricDevicePairingCreate.branch),
                unit: String(biometricDevicePairingCreate.unit),
                floor: String(biometricDevicePairingCreate.floor),
                area: String(biometricDevicePairingCreate.area),
                pairdevices: valuePairedDevices,
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

    //submit option for saving
    const handleSubmit = async (e) => {
        e.preventDefault();
        const isNameMatch = pairingDevicesArray.some(
            (item) =>
                item.company === biometricDevicePairingCreate.company &&
                item.branch === biometricDevicePairingCreate.branch &&
                item.unit === biometricDevicePairingCreate.unit &&
                item.floor === biometricDevicePairingCreate.floor &&
                item.area === biometricDevicePairingCreate.area &&
                item?.pairdevices?.some(data => valuePairedDevices?.includes(data))
        );

        const pairedDeviceData = pairedDevicesGroupingArray?.some(data => valuePairedDevices?.includes(data?.paireddeviceone) || valuePairedDevices?.includes(data?.paireddevicetwo))
        console.log(isNameMatch, valuePairedDevices, 'isNameMatch')
        if (biometricDevicePairingCreate.company === 'Please Select Company' || !biometricDevicePairingCreate.company) {
            setPopupContentMalert('Please Select Company');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (biometricDevicePairingCreate.branch === 'Please Select Branch' || !biometricDevicePairingCreate.branch) {
            setPopupContentMalert('Please Select Branch');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (biometricDevicePairingCreate.unit === 'Please Select Unit' || !biometricDevicePairingCreate.unit) {
            setPopupContentMalert('Please Select Unit');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (biometricDevicePairingCreate.floor === 'Please Select Floor' || !biometricDevicePairingCreate.floor) {
            setPopupContentMalert('Please Select Floor');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (biometricDevicePairingCreate.area === 'Please Select Area') {
            setPopupContentMalert('Please Select Area');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        else if (biometricDevicePairingCreate.area === 'Please Select Area') {
            setPopupContentMalert('Please Select Area');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        else if (biometricDevicePairingCreate.area === 'Please Select Area') {
            setPopupContentMalert('Please Select Area');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        else if (valuePairedDevices?.length === 0) {
            setPopupContentMalert('Please Select Paired Devices');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        else if (valuePairedDevices?.length === 1) {
            setPopupContentMalert('Atlease Choose two devices as Paired Devices');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        else if (valuePairedDevices?.length > 2) {
            setPopupContentMalert('Paired Devices Must be of two');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        else if (isNameMatch) {
            setPopupContentMalert('Device Already Paired!');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        else if (pairedDeviceData) {
            setPopupContentMalert("Can't pair. One device is already added as single.");
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        else {
            sendRequest();
        }
    };

    const handleClear = (e) => {
        e.preventDefault();
        setBiometricDevicePairingCreate({
            company: 'Please Select Company',
            branch: 'Please Select Branch',
            unit: 'Please Select Unit',
            floor: 'Please Select Floor',
            area: 'Please Select Area',
        });
        setValuePairedDevices([])
        setPairedDeviceOptions([]);
        setSelectedPairedDeviceOptions([]);
        setSearchQuery('');
        setPopupContent('Cleared Successfully');
        setPopupSeverity('success');
        handleClickOpenPopup();
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

    const [acpointCalculationArrayEdit, setAcpointCalculationArrayEdit] = useState([]);
    //get single row to edit....
    const getCode = async (e, name) => {
        setPageName(!pageName);
        try {
            let res = await axios.get(`${SERVICE.SINGLE_BIOMETRICDEVICESPAIRING}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setAcpointCalculationArrayEdit(pairingDevicesArray?.filter((item) => item?._id !== e));
            setSourceEdit(res?.data?.sdevicespairing);
            setBiometricDevicePairingEdit(res?.data?.sdevicespairing);
            fetchDeviceNamesBasedOnAreaEdit(res?.data?.sdevicespairing, res?.data?.sdevicespairing?.area)
            setSelectedPairedDeviceOptionsEdit(res?.data?.sdevicespairing?.pairdevices?.map(data => ({
                label: data,
                value: data
            })));
            setValuePairedDevicesEdit(res?.data?.sdevicespairing?.pairdevices)
            handleClickOpenEdit();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };


    // get single row to view....
    const getviewCode = async (e) => {
        setPageName(!pageName);
        try {
            let res = await axios.get(`${SERVICE.SINGLE_BIOMETRICDEVICESPAIRING}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setSourceEdit(res?.data?.sdevicespairing);
            handleClickOpenview();
        } catch (err) {
            handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
        }
    };
    // get single row to view....
    const getinfoCode = async (e) => {
        setPageName(!pageName);
        try {
            let res = await axios.get(`${SERVICE.SINGLE_BIOMETRICDEVICESPAIRING}/${e}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
            });
            setSourceEdit(res?.data?.sdevicespairing);
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
            let res = await axios.put(`${SERVICE.SINGLE_BIOMETRICDEVICESPAIRING}/${subprojectsid}`, {
                headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                },
                company: String(biometricDevicePairingEdit.company),
                branch: String(biometricDevicePairingEdit.branch),
                unit: String(biometricDevicePairingEdit.unit),
                floor: String(biometricDevicePairingEdit.floor),
                area: String(biometricDevicePairingEdit.area),
                pairdevices: valuePairedDevicesEdit,
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
        const isNameMatch = acpointCalculationArrayEdit.some(
            (item) =>
                item.company === biometricDevicePairingEdit.company &&
                item.branch === biometricDevicePairingEdit.branch &&
                item.unit === biometricDevicePairingEdit.unit &&
                item.floor === biometricDevicePairingEdit.floor &&
                item.area === biometricDevicePairingEdit.area &&
                item?.pairdevices?.some(data => valuePairedDevicesEdit?.includes(data))

        );
        const pairedDeviceData = pairedDevicesGroupingArray?.some(data => valuePairedDevicesEdit?.includes(data?.paireddeviceone) || valuePairedDevicesEdit?.includes(data?.paireddevicetwo))

        const ipFormat = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;

        if (biometricDevicePairingEdit?.mode === 'New' && (biometricDevicePairingEdit.company === 'Please Select Company' || !biometricDevicePairingEdit.company)) {
            setPopupContentMalert('Please Select Company');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        if (biometricDevicePairingEdit?.mode === 'New' && (biometricDevicePairingEdit.branch === 'Please Select Branch' || !biometricDevicePairingEdit.branch)) {
            setPopupContentMalert('Please Select Branch');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        if (biometricDevicePairingEdit?.mode === 'New' && (biometricDevicePairingEdit.unit === 'Please Select Unit' || !biometricDevicePairingEdit.unit)) {
            setPopupContentMalert('Please Select Unit');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        if (biometricDevicePairingEdit?.mode === 'New' && (biometricDevicePairingEdit.floor === 'Please Select Floor' || !biometricDevicePairingEdit.floor)) {
            setPopupContentMalert('Please Select Floor');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (biometricDevicePairingEdit?.mode === 'New' && (biometricDevicePairingEdit.area === 'Please Select Area' || !biometricDevicePairingEdit.area)) {
            setPopupContentMalert('Please Select Area');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (biometricDevicePairingEdit?.mode === 'New' && (biometricDevicePairingEdit.brand === 'Please Select Brand' || !biometricDevicePairingEdit.brand)) {
            setPopupContentMalert('Please Select Brand');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (biometricDevicePairingEdit?.mode === 'New' && (biometricDevicePairingEdit.model === 'Please Select Model' || !biometricDevicePairingEdit.model)) {
            setPopupContentMalert('Please Select Model');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (biometricDevicePairingEdit.biometricdeviceid === '') {
            setPopupContentMalert('Please Enter Biometric Device ID');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (biometricDevicePairingEdit?.mode === 'New' && biometricDevicePairingEdit.biometricserialno === '') {
            setPopupContentMalert('Please Enter Biometric Serial No');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (biometricDevicePairingEdit?.mode === 'Existing' && biometricDevicePairingEdit.biometricserialno === 'Please Select Serial Number') {
            setPopupContentMalert('Please Select Biometric Serial No');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (biometricDevicePairingEdit?.mode === 'New' && biometricDevicePairingEdit.biometricassignedip === '') {
            setPopupContentMalert('Please Enter Biometric Assigned IP');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (biometricDevicePairingEdit?.mode === 'Existing' && biometricDevicePairingEdit.biometricassignedip === '') {
            setPopupContentMalert('Cannot create without an assigned IP. Please assign an IP first.');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (biometricDevicePairingEdit?.mode === 'New' && !ipFormat.test(biometricDevicePairingEdit.biometricassignedip)) {
            setPopupContentMalert('Please Enter Valid Biometric Assigned IP');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        } else if (isNameMatch) {
            setPopupContentMalert('Data Already exists!');
            setPopupSeverityMalert('warning');
            handleClickOpenPopupMalert();
        }
        else if (pairedDeviceData) {
            setPopupContentMalert("Can't pair. One device is already added as single.");
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
        documentTitle: 'Biometric Devices Pairing',
        pageStyle: 'print',
    });

    const getapi = async () => {
        let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
            headers: {
                Authorization: `Bearer${auth.APIToken}`,
            },
            empcode: String(isUserRoleAccess?.empcode),
            companyname: String(isUserRoleAccess?.companyname),
            pagename: String('Biometric Devices Pairing'),
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
        { field: 'pairdevicestable', headerName: 'Pair Devies', flex: 0, width: 150, hide: !columnVisibility.pairdevicestable, headerClassName: 'bold-header' },
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
                    {isUserRoleCompare?.includes('ebiometricdevicespairing') && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getCode(params.data.id, params.data.name);
                            }}
                        >
                            <EditOutlinedIcon sx={buttonStyles.buttonedit} />{' '}
                        </Button>
                    )}
                    {isUserRoleCompare?.includes('dbiometricdevicespairing') && (
                        <Button
                            sx={userStyle.buttondelete}
                            onClick={(e) => {
                                rowData(params.data.id, params.data.name);
                            }}
                        >
                            <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />{' '}
                        </Button>
                    )}
                    {isUserRoleCompare?.includes('vbiometricdevicespairing') && (
                        <Button
                            sx={userStyle.buttonedit}
                            onClick={() => {
                                getviewCode(params.data.id);
                            }}
                        >
                            <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />{' '}
                        </Button>
                    )}
                    {isUserRoleCompare?.includes('ibiometricdevicespairing') && (
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
            pairdevicestable: item.pairdevicestable,
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
            <PageHeading title="Biometric Devices Pairing" modulename="Human Resources" submodulename="HR" mainpagename="BX-Biometric Device" subpagename="Biometric Devices Pairing" subsubpagename="" />
            {isUserRoleCompare?.includes('abiometricdevicespairing') && (
                <>
                    <Box sx={userStyle.dialogbox}>
                        <>
                            <Grid container spacing={2}>
                                <Grid item xs={8}>
                                    <Typography sx={userStyle.importheadtext}>Add Biometric Devices Pairing</Typography>
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
                                                    label: biometricDevicePairingCreate.company,
                                                    value: biometricDevicePairingCreate.company,
                                                }}
                                                onChange={(e) => {
                                                    setBiometricDevicePairingCreate({
                                                        ...biometricDevicePairingCreate,
                                                        company: e.value,
                                                        branch: 'Please Select Branch',
                                                        unit: 'Please Select Unit',
                                                        floor: 'Please Select Floor',
                                                        area: 'Please Select Area',
                                                    });
                                                    setValuePairedDevices([])
                                                    setPairedDeviceOptions([]);
                                                    setSelectedPairedDeviceOptions([]);
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
                                                    ?.filter((comp) => comp.company === biometricDevicePairingCreate?.company)
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
                                                    label: biometricDevicePairingCreate.branch,
                                                    value: biometricDevicePairingCreate.branch,
                                                }}
                                                onChange={(e) => {
                                                    setBiometricDevicePairingCreate({
                                                        ...biometricDevicePairingCreate,
                                                        branch: e.value,
                                                        unit: 'Please Select Unit',
                                                        floor: 'Please Select Floor',
                                                        area: 'Please Select Area',
                                                    });
                                                    setValuePairedDevices([])
                                                    setPairedDeviceOptions([]);
                                                    setSelectedPairedDeviceOptions([]);
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
                                                    ?.filter((comp) => comp.company === biometricDevicePairingCreate?.company && comp.branch === biometricDevicePairingCreate?.branch)
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
                                                    label: biometricDevicePairingCreate.unit,
                                                    value: biometricDevicePairingCreate.unit,
                                                }}
                                                onChange={(e) => {
                                                    setBiometricDevicePairingCreate({
                                                        ...biometricDevicePairingCreate,
                                                        unit: e.value,
                                                        floor: 'Please Select Floor',
                                                        area: 'Please Select Area',
                                                    });
                                                    setValuePairedDevices([])
                                                    setPairedDeviceOptions([]);
                                                    setSelectedPairedDeviceOptions([]);
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
                                                    ?.filter((u) => biometricDevicePairingCreate?.branch === u.branch)
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
                                                    label: biometricDevicePairingCreate.floor,
                                                    value: biometricDevicePairingCreate.floor,
                                                }}
                                                onChange={(e) => {
                                                    setBiometricDevicePairingCreate({
                                                        ...biometricDevicePairingCreate,
                                                        floor: e.value,
                                                        area: 'Please Select Area',
                                                    });
                                                    setValuePairedDevices([])
                                                    setPairedDeviceOptions([]);
                                                    setSelectedPairedDeviceOptions([]);
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
                                                    .filter((item) => biometricDevicePairingCreate?.floor === item.floor && biometricDevicePairingCreate?.branch === item.branch)
                                                    .flatMap((item) => item.area)
                                                    .map((location) => ({
                                                        label: location,
                                                        value: location,
                                                    }))}
                                                value={{
                                                    label: biometricDevicePairingCreate.area,
                                                    value: biometricDevicePairingCreate.area,
                                                }}
                                                onChange={(e) => {
                                                    setBiometricDevicePairingCreate({
                                                        ...biometricDevicePairingCreate,
                                                        area: e.value,
                                                    });
                                                    fetchDeviceNamesBasedOnArea(biometricDevicePairingCreate, e.value)
                                                    setValuePairedDevices([])
                                                    setSelectedPairedDeviceOptions([]);
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                            <Typography>
                                                Pair Devices<b style={{ color: 'red' }}>*</b>
                                            </Typography>
                                            <MultiSelect
                                                options={PairedDeviceOptions}
                                                value={selectedPairedDeviceOptions}
                                                onChange={(e) => {
                                                    handlePairedDeviceChange(e);
                                                }}
                                                valueRenderer={customValueRendererPairedDevice}
                                                labelledBy="Please Select Paired Devices"
                                            />
                                        </FormControl>
                                    </Grid>
                                </>


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
                    sx={{
                        overflow: 'visible',
                        '& .MuiPaper-root': {
                            overflow: 'visible',
                        },
                    }}
                >
                    <Box sx={{ padding: '20px' }}>
                        <>
                            <form onSubmit={editSubmit}>
                                {/* <DialogContent sx={{ width: '550px', padding: '20px' }}> */}
                                <Grid container spacing={2}>
                                    <Grid item md={12} xs={12} sm={12}>
                                        <Typography sx={userStyle.HeaderText}>Edit Biometric Devices Pairing</Typography>
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
                                                        label: biometricDevicePairingEdit.company,
                                                        value: biometricDevicePairingEdit.company,
                                                    }}
                                                    onChange={(e) => {
                                                        setBiometricDevicePairingEdit({
                                                            ...biometricDevicePairingEdit,
                                                            company: e.value,
                                                            branch: 'Please Select Branch',
                                                            unit: 'Please Select Unit',
                                                            floor: 'Please Select Floor',
                                                            area: 'Please Select Area',
                                                        });
                                                        setValuePairedDevicesEdit([])
                                                        setSelectedPairedDeviceOptionsEdit([])
                                                        setPairedDeviceOptionsEdit([])
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
                                                        ?.filter((comp) => comp.company === biometricDevicePairingEdit?.company)
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
                                                        label: biometricDevicePairingEdit.branch,
                                                        value: biometricDevicePairingEdit.branch,
                                                    }}
                                                    onChange={(e) => {
                                                        setBiometricDevicePairingEdit({
                                                            ...biometricDevicePairingEdit,
                                                            branch: e.value,
                                                            unit: 'Please Select Unit',
                                                            floor: 'Please Select Floor',
                                                            area: 'Please Select Area',
                                                        });
                                                        setValuePairedDevicesEdit([])
                                                        setSelectedPairedDeviceOptionsEdit([])
                                                        setPairedDeviceOptionsEdit([])
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
                                                        ?.filter((comp) => comp.company === biometricDevicePairingEdit?.company && comp.branch === biometricDevicePairingEdit?.branch)
                                                        .map((data) => ({
                                                            label: data.unit,
                                                            value: data.unit,
                                                        }))
                                                        .filter((item, index, self) => {
                                                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                        })}
                                                    styles={colourStyles}
                                                    value={{
                                                        label: biometricDevicePairingEdit.unit,
                                                        value: biometricDevicePairingEdit.unit,
                                                    }}
                                                    onChange={(e) => {
                                                        setBiometricDevicePairingEdit({
                                                            ...biometricDevicePairingEdit,
                                                            unit: e.value,
                                                            floor: 'Please Select Floor',
                                                            area: 'Please Select Area',
                                                        });
                                                        setValuePairedDevicesEdit([])
                                                        setSelectedPairedDeviceOptionsEdit([])
                                                        setPairedDeviceOptionsEdit([])

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
                                                        ?.filter((u) => biometricDevicePairingEdit?.branch === u.branch)
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
                                                        label: biometricDevicePairingEdit.floor,
                                                        value: biometricDevicePairingEdit.floor,
                                                    }}
                                                    onChange={(e) => {
                                                        setBiometricDevicePairingEdit({
                                                            ...biometricDevicePairingEdit,
                                                            floor: e.value,
                                                            area: 'Please Select Area',
                                                        });
                                                        setValuePairedDevicesEdit([])
                                                        setSelectedPairedDeviceOptionsEdit([])
                                                        setPairedDeviceOptionsEdit([])
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
                                                        .filter((item) => biometricDevicePairingEdit?.floor === item.floor && biometricDevicePairingEdit?.branch === item.branch)
                                                        .flatMap((item) => item.area)
                                                        .map((location) => ({
                                                            label: location,
                                                            value: location,
                                                        }))}
                                                    value={{
                                                        label: biometricDevicePairingEdit.area,
                                                        value: biometricDevicePairingEdit.area,
                                                    }}
                                                    onChange={(e) => {
                                                        setBiometricDevicePairingEdit({
                                                            ...biometricDevicePairingEdit,
                                                            area: e.value,
                                                        });
                                                        setValuePairedDevicesEdit([])
                                                        setSelectedPairedDeviceOptionsEdit([])
                                                        fetchDeviceNamesBasedOnAreaEdit(biometricDevicePairingEdit, e.value)
                                                    }}
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={6} xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <Typography>
                                                    Pair Devices<b style={{ color: 'red' }}>*</b>
                                                </Typography>
                                                <MultiSelect
                                                    options={PairedDeviceOptionsEdit}
                                                    value={selectedPairedDeviceOptionsEdit}
                                                    onChange={(e) => {
                                                        handlePairedDeviceChangeEdit(e);
                                                    }}
                                                    valueRenderer={customValueRendererPairedDeviceEdit}
                                                    labelledBy="Please Select Paired Devices"
                                                />
                                            </FormControl>
                                        </Grid>
                                    </>

                                </Grid>
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
            {isUserRoleCompare?.includes('lbiometricdevicespairing') && (
                <>
                    <Box sx={userStyle.container}>
                        {/* ******************************************************EXPORT Buttons****************************************************** */}
                        <Grid item xs={8}>
                            <Typography sx={userStyle.importheadtext}>Biometric Devices Pairing List</Typography>
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
                                    {isUserRoleCompare?.includes('excelbiometricdevicespairing') && (
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
                                    {isUserRoleCompare?.includes('csvbiometricdevicespairing') && (
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
                                    {isUserRoleCompare?.includes('printbiometricdevicespairing') && (
                                        <>
                                            <Button sx={userStyle.buttongrp} onClick={handleprint}>
                                                &ensp;
                                                <FaPrint />
                                                &ensp;Print&ensp;
                                            </Button>
                                        </>
                                    )}
                                    {isUserRoleCompare?.includes('pdfbiometricdevicespairing') && (
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
                                    {isUserRoleCompare?.includes('imagebiometricdevicespairing') && (
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
                        {isUserRoleCompare?.includes('bdbiometricdevicespairing') && (
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
                        <Typography sx={userStyle.HeaderText}> View Biometric Devices Pairing</Typography>
                        <br /> <br />
                        <Grid container spacing={2}>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Company</Typography>
                                    <Typography>{sourceEdit?.company}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Branch</Typography>
                                    <Typography>{sourceEdit?.branch}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Unit</Typography>
                                    <Typography>{sourceEdit?.unit}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Floor</Typography>
                                    <Typography>{sourceEdit?.floor}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={4} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Area</Typography>
                                    <Typography>{sourceEdit?.area}</Typography>
                                </FormControl>
                            </Grid>
                            <Grid item md={12} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="h6">Paired Devices</Typography>
                                    <Typography sx={{ whiteSpace: 'pre-line' }}>
                                        {sourceEdit?.pairdevices?.map((item, index) => `${index + 1}. ${item}`).join('\n')}
                                    </Typography>                                </FormControl>
                            </Grid>
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
                filename={'Biometric Devices Pairing'}
                exportColumnNames={exportColumnNames}
                exportRowValues={exportRowValues}
                componentRef={componentRef}
            />
            {/* INFO */}
            <InfoPopup openInfo={openInfo} handleCloseinfo={handleCloseinfo} heading="Biometric Devices Pairing Info" addedby={addedby} updateby={updateby} />
            {/*SINGLE DELETE ALERT DIALOG ARE YOU SURE? */}
            <DeleteConfirmation open={isDeleteOpen} onClose={handleCloseMod} onConfirm={delSource} title="Are you sure?" confirmButtonText="Yes" cancelButtonText="Cancel" />
            {/*BULK DELETE ALERT DIALOG ARE YOU SURE? */}

            {/*BULK DELETE ALERT DIALOG ARE YOU SURE? */}
            <Box>
                <Dialog open={isDeleteOpencheckbox} onClose={handleCloseModcheckbox} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                    <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
                        <ErrorOutlineOutlinedIcon sx={{ fontSize: '80px', color: 'orange' }} />
                        {selectedRowsCount > 0 ? (
                            <Typography variant="h5" sx={{ color: 'red', textAlign: 'center' }}>
                                Some of the Data's are Linked in other pages. Do You want to Delete the Remaining.?
                            </Typography>
                        ) : (
                            <Typography variant="h5" sx={{ color: 'red', textAlign: 'center' }}>
                                This Data is Linked in Some pages
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        {selectedRowsCount > 0 ? (
                            <>
                                <Button onClick={handleCloseModcheckbox} sx={buttonStyles.btncancel}>
                                    Cancel
                                </Button>
                                <Button variant="contained" color="error" onClick={(e) => delSourcecheckbox(e)} sx={buttonStyles.buttonsubmit}>
                                    {' '}
                                    OK{' '}
                                </Button>
                            </>
                        ) : (
                            <Button variant="contained" color="error" onClick={handleCloseModcheckbox} sx={buttonStyles.buttonsubmit}>
                                Ok
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>
            </Box>
            <Box>
                {/* ALERT DIALOG */}
                <Dialog open={isCheckOpen} onClose={handleCloseCheck} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                    <DialogContent
                        sx={{
                            width: '350px',
                            textAlign: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <ErrorOutlineOutlinedIcon sx={{ fontSize: '80px', color: 'orange' }} />
                        <Typography variant="h6" sx={{ color: 'black', textAlign: 'center' }}>
                            {getOverAllCountDelete}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button sx={buttonStyles.buttonsubmit} onClick={handleCloseCheck} autoFocus variant="contained" color="error">
                            {' '}
                            OK{' '}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>


            {/* <DeleteConfirmation open={isDeleteOpencheckbox} onClose={handleCloseModcheckbox} onConfirm={delSourcecheckbox} title="Are you sure?" confirmButtonText="Yes" cancelButtonText="Cancel" /> */}
            {/* PLEASE SELECT ANY ROW */}
            <PleaseSelectRow open={isDeleteOpenalert} onClose={handleCloseModalert} message="Please Select any Row" iconColor="orange" buttonText="OK" />
            {/* EXTERNAL COMPONENTS -------------- END */}
        </Box>
    );
}

export default BiometricDevicesPairing;
