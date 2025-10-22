import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ImageIcon from '@mui/icons-material/Image';
import { BASE_URL } from '../../../../services/Authservice';
import LoadingButton from '@mui/lab/LoadingButton';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import {
  Box,
  Button,
  Modal,
  Checkbox,
  Dialog,
  DialogActions,
  Fade,
  Backdrop,
  DialogContent,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Popover,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
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
import AggridTable from '../../../../components/AggridTable';
import { CheckCircle, ErrorOutline } from '@mui/icons-material';

function BiometricUnregisteredUsers() {
  const [modal, setModal] = useState({ open: false, type: '', message: '' });
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

  let exportColumnNames = ['Device Name', 'Clock Date Time', 'Verified by'];
  let exportRowValues = ['cloudIDC', 'clockDateTimeD', 'verifyC'];
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;
  const [filterUser, setFilterUser] = useState({ fromdate: today, todate: today });
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
    setPageName(!pageName);
    try {
      const response = await axios.get(SERVICE.ALL_BIOMETRICDEVICESPAIRING, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      console.log(response?.data, 'response?.data');
      const answer =
        response?.data?.devicespairing?.length > 0
          ? response?.data?.devicespairing?.map((data, index) => ({
              ...data,
              serialNumber: index + 1,
              pairdevicestable: data?.pairdevices?.map((item, index) => `${index + 1}. ${item} `).toString(),
            }))
          : [];
      setLoader(false);
    } catch (err) {
      console.log(err, 'err');
      setLoader(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const fetchPairedDevicesGroupingArray = async () => {
    setPageName(!pageName);
    try {
      const response = await axios.get(SERVICE.ALL_BIOMETRIC_PAIRED_DEVICE_GROUPING, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      console.log(response?.data, 'response?.data');
      const answer =
        response?.data?.biometricpaireddevicesgrouping?.length > 0
          ? response?.data?.biometricpaireddevicesgrouping?.map((data, index) => ({
              ...data,
              serialNumber: index + 1,
            }))
          : [];
      setPairedDevicesGroupingArray(answer);
    } catch (err) {
      console.log(err, 'err');
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
    setPageName(!pageName);
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
      console.log(response?.data, 'response?.data');
      const answer =
        response?.data?.biodevices?.length > 0
          ? response?.data?.biodevices?.map((data) => ({
              label: data?.biometriccommonname,
              value: data?.biometriccommonname,
            }))
          : [];
      setPairedDeviceOptions(answer);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const fetchDeviceNamesBasedOnAreaEdit = async (biometric, area) => {
    setPageName(!pageName);
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
      console.log(response?.data, 'response?.data');
      const answer =
        response?.data?.biodevices?.length > 0
          ? response?.data?.biodevices?.map((data) => ({
              label: data?.biometriccommonname,
              value: data?.biometriccommonname,
            }))
          : [];
      setPairedDeviceOptionsEdit(answer);
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
    return valuePairedDevices?.length ? valuePairedDevices.map(({ label }) => label)?.join(', ') : 'Please Select Biometric Devices';
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
    return valuePairedDevices?.length ? valuePairedDevices.map(({ label }) => label)?.join(', ') : 'Please Select Biometric Devices';
  };
  const gridRefTableImg = useRef(null);
  // image
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage
        .toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, 'Biometric Unregistered Users.png');
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
  const [searchedString, setSearchedString] = useState('');
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
    cloudIDC: true,
    verifyC: true,
    clockDateTimeD: true,
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
      console.log(res?.data, 'biometricunregisteredusers');
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
      const user = await axios.post(SERVICE.BIOMETRIC_UNREGISTERED_USERS_FILTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: String(biometricDevicePairingCreate.company),
        branch: String(biometricDevicePairingCreate.branch),
        unit: String(biometricDevicePairingCreate.unit),
        floor: String(biometricDevicePairingCreate.floor),
        area: String(biometricDevicePairingCreate.area),
        biometricdevices: valuePairedDevices,
        fromdate: filterUser.fromdate,
        todate: filterUser.todate,
      });

      const answer =
        user?.data?.allbiometricunregistered?.length > 0
          ? user?.data?.allbiometricunregistered?.map((data, index) => ({
              serialNumber: index + 1,
              ...data,
            }))
          : [];
      setPairingDevicesArray(answer);
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
    } else if (biometricDevicePairingCreate.area === 'Please Select Area') {
      setPopupContentMalert('Please Select Area');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (biometricDevicePairingCreate.area === 'Please Select Area') {
      setPopupContentMalert('Please Select Area');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (valuePairedDevices?.length === 0) {
      setPopupContentMalert('Please Select Biometric Devices');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (filterUser?.fromdate === '') {
      setPopupContentMalert('Please Select From Date');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (filterUser?.todate === '') {
      setPopupContentMalert('Please Select To Date');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else {
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
    setFilterUser({ fromdate: today, todate: today });
    setValuePairedDevices([]);
    setPairingDevicesArray([]);
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

  const [acpointCalculationArrayForExport, setAcpointCalculationArrayForExport] = useState([]);

  const fetchUnRegisteredUsers = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.get(SERVICE.ALL_BIOMETRICDEVICESPAIRING, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setSourcecheck(true);
      setAcpointCalculationArrayForExport(res_vendor?.data?.devicespairing);
    } catch (err) {
      setSourcecheck(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchUnRegisteredUsers();
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
    documentTitle: 'Biometric Unregistered Users',
    pageStyle: 'print',
  });

  const getapi = async () => {
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String('Biometric Unregistered Users'),
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
    { field: 'cloudIDC', headerName: 'Device Name', flex: 0, width: 250, hide: !columnVisibility.cloudIDC, headerClassName: 'bold-header' },
    { field: 'clockDateTimeD', headerName: 'Clock Date Time', flex: 0, width: 250, hide: !columnVisibility.clockDateTimeD, headerClassName: 'bold-header' },
    { field: 'verifyC', headerName: 'Verified By', flex: 0, width: 250, hide: !columnVisibility.verifyC, headerClassName: 'bold-header' },
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
          {isUserRoleCompare?.includes('vbiometricunregisteredusers') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getCode(params.data.photourl);
              }}
            >
              View
            </Button>
          )}
        </Grid>
      ),
    },
  ];

  const getCode = async (e) => {
    setPageName(!pageName);
    try {
      const url = `${BASE_URL}${e}`; // Construct the URL based on your server setup
      window.open(url, '_blank');
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const filteredSelectedColumn = columnDataTable.filter((data) => data.field !== 'checkbox' && data.field !== 'actions' && data.field !== 'serialNumber');

  const rowDataTable = filteredDatas.map((item, index) => {
    return {
      id: item._id,
      serialNumber: item.serialNumber,
      cloudIDC: item.cloudIDC,
      clockDateTimeD: item.clockDateTimeD,
      photourl: item.photourl,
      verifyC: item.verifyC,
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
      <Headtitle title={'BIOMETRIC UNREGISTERED USERS'} />
      {/* ****** Header Content ****** */}
      <PageHeading title="Biometric Unregistered Users" modulename="Human Resources" submodulename="HR" mainpagename="BX-Biometric Device" subpagename="Biometric Unregistered Users" subsubpagename="" />
      {isUserRoleCompare?.includes('abiometricunregisteredusers') && (
        <>
          <Box sx={userStyle.dialogbox}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>Filter Biometric Unregistered Users</Typography>
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
                          setValuePairedDevices([]);
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
                          setValuePairedDevices([]);
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
                          setValuePairedDevices([]);
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
                          setValuePairedDevices([]);
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
                          fetchDeviceNamesBasedOnArea(biometricDevicePairingCreate, e.value);
                          setValuePairedDevices([]);
                          setSelectedPairedDeviceOptions([]);
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Biometric Devices<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={PairedDeviceOptions}
                        value={selectedPairedDeviceOptions}
                        onChange={(e) => {
                          handlePairedDeviceChange(e);
                        }}
                        valueRenderer={customValueRendererPairedDevice}
                        labelledBy="Please Select Biometric Devices"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        From Date<b style={{ color: 'red' }}>*</b>{' '}
                      </Typography>
                      <OutlinedInput
                        id="from-date"
                        type="date"
                        value={filterUser.fromdate}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          const today = new Date().toISOString().split('T')[0];

                          // Min = today - 7 days
                          const minFromDate = new Date();
                          minFromDate.setDate(minFromDate.getDate() - 7);
                          const minFromDateStr = minFromDate.toISOString().split('T')[0];

                          if (selectedDate >= minFromDateStr && selectedDate <= today) {
                            setFilterUser({
                              ...filterUser,
                              fromdate: selectedDate,
                              todate: selectedDate, // reset todate when fromdate changes
                            });
                          } else {
                            setPopupContentMalert('From Date should be within last 7 days');
                            setPopupSeverityMalert('warning');
                            handleClickOpenPopupMalert();
                          }
                        }}
                        inputProps={{
                          min: (() => {
                            const d = new Date();
                            d.setDate(d.getDate() - 7);
                            return d.toISOString().split('T')[0];
                          })(),
                          max: new Date().toISOString().split('T')[0],
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        To Date<b style={{ color: 'red' }}>*</b>{' '}
                      </Typography>
                      <OutlinedInput
                        id="to-date"
                        type="date"
                        value={filterUser.todate}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          const today = new Date().toISOString().split('T')[0];
                          const fromdate = filterUser.fromdate;

                          if (!fromdate) {
                            setPopupContentMalert('Please Select From Date');
                            setPopupSeverityMalert('warning');
                            handleClickOpenPopupMalert();
                            return;
                          }

                          if (selectedDate < fromdate) {
                            setPopupContentMalert('To Date should be after or equal to From Date');
                            setPopupSeverityMalert('warning');
                            handleClickOpenPopupMalert();
                            setFilterUser({ ...filterUser, todate: '' });
                          } else if (selectedDate > today) {
                            setPopupContentMalert('To Date cannot be after today');
                            setPopupSeverityMalert('warning');
                            handleClickOpenPopupMalert();
                            setFilterUser({ ...filterUser, todate: '' });
                          } else {
                            setFilterUser({ ...filterUser, todate: selectedDate });
                          }
                        }}
                        inputProps={{
                          min:
                            filterUser.fromdate ||
                            (() => {
                              const d = new Date();
                              d.setDate(d.getDate() - 7);
                              return d.toISOString().split('T')[0];
                            })(),
                          max: new Date().toISOString().split('T')[0],
                        }}
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
                        Filter
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
      <br />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes('lbiometricunregisteredusers') && (
        <>
          <Box sx={userStyle.container}>
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Biometric Unregistered Users List</Typography>
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
                  {isUserRoleCompare?.includes('excelbiometricunregisteredusers') && (
                    <>
                      <Button
                        onClick={(e) => {
                          setIsFilterOpen(true);
                          fetchUnRegisteredUsers();
                          setFormat('xl');
                        }}
                        sx={userStyle.buttongrp}
                      >
                        <FaFileExcel />
                        &ensp;Export to Excel&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('csvbiometricunregisteredusers') && (
                    <>
                      <Button
                        onClick={(e) => {
                          setIsFilterOpen(true);
                          fetchUnRegisteredUsers();
                          setFormat('csv');
                        }}
                        sx={userStyle.buttongrp}
                      >
                        <FaFileCsv />
                        &ensp;Export to CSV&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('printbiometricunregisteredusers') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('pdfbiometricunregisteredusers') && (
                    <>
                      <Button
                        sx={userStyle.buttongrp}
                        onClick={() => {
                          setIsPdfFilterOpen(true);
                          fetchUnRegisteredUsers();
                        }}
                      >
                        <FaFilePdf />
                        &ensp;Export to PDF&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('imagebiometricunregisteredusers') && (
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
            <br />
            <br />
            <Box style={{ width: '100%', overflowY: 'hidden' }}>
              {loader ? (
                <Box sx={userStyle.container}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      minHeight: '350px',
                    }}
                  >
                    <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
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
        itemsTwo={pairingDevicesArray ?? []}
        filename={'Biometric Unregistered Users'}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />

      {/* MUI Modal with Fade Transition */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, type: '', message: '' })} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 500 } }}>
        <Fade in={modal.open}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 420,
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 24,
              p: 4,
              textAlign: 'center',
              animation: 'scaleUp 0.3s ease-in-out',
              '@keyframes scaleUp': {
                '0%': { transform: 'translate(-50%, -50%) scale(0.8)' },
                '100%': { transform: 'translate(-50%, -50%) scale(1)' },
              },
            }}
          >
            {/* Icon */}
            {modal.type === 'success' ? <CheckCircle sx={{ fontSize: 60, color: 'green', mb: 2 }} /> : <ErrorOutline sx={{ fontSize: 60, color: 'red', mb: 2 }} />}

            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                color: modal.type === 'success' ? 'green' : 'red',
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              {modal.type === 'success' ? 'Success!' : 'Error'}
            </Typography>

            {/* Message */}
            <Typography variant="body1" sx={{ mb: 3 }}>
              {modal.message}
            </Typography>

            {/* Close Button */}
            <Button
              variant="contained"
              sx={{
                backgroundColor: modal.type === 'success' ? 'green' : 'red',
                '&:hover': {
                  backgroundColor: modal.type === 'success' ? 'darkgreen' : 'darkred',
                },
              }}
              onClick={() => setModal({ open: false, type: '', message: '' })}
            >
              Close
            </Button>
          </Box>
        </Fade>
      </Modal>

      {/* INFO */}
      <InfoPopup openInfo={openInfo} handleCloseinfo={handleCloseinfo} heading="Biometric Unregistered Users Info" addedby={addedby} updateby={updateby} />
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

export default BiometricUnregisteredUsers;
