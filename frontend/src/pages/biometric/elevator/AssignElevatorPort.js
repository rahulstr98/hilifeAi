import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Dialog, DialogActions, DialogContent, FormControl, Grid, IconButton, InputAdornment, List, ListItem, ListItemText, MenuItem, OutlinedInput, Popover, Select, TextField, Tooltip, Typography } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';

import Switch from '@mui/material/Switch';
import axios from '../../../axiosInstance';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint, FaSearch } from 'react-icons/fa';
import { IoMdOptions } from 'react-icons/io';
import { MdClose } from 'react-icons/md';
import { ThreeDots } from 'react-loader-spinner';
import { MultiSelect } from 'react-multi-select-component';
import Selects from 'react-select';
import { useReactToPrint } from 'react-to-print';
import AggridTableForPaginationTable from '../../../components/AggridTableForPaginationTable.js';
import AlertDialog from '../../../components/Alert.js';
import { DeleteConfirmation, PleaseSelectRow } from '../../../components/DeleteConfirmation.js';
import { handleApiError } from '../../../components/Errorhandling.js';
import ExportData from '../../../components/ExportData.js';
import Headtitle from '../../../components/Headtitle.js';
import InfoPopup from '../../../components/InfoPopup.js';
import MessageAlert from '../../../components/MessageAlert.js';
import PageHeading from '../../../components/PageHeading.js';
import { AuthContext, UserRoleAccessContext } from '../../../context/Appcontext.js';
import { userStyle, colourStyles } from '../../../pageStyle.js';
import { SERVICE } from '../../../services/Baseservice.js';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';

function AssignElevatorPort() {
  // State declarations
  const [advancedFilter, setAdvancedFilter] = useState(null);
  const [additionalFilters, setAdditionalFilters] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const conditions = ['Contains', 'Does Not Contain', 'Equals', 'Does Not Equal', 'Begins With', 'Ends With', 'Blank', 'Not Blank'];
  const [selectedColumn, setSelectedColumn] = useState('');
  const [fileFormat, setFormat] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('Contains');
  const [logicOperator, setLogicOperator] = useState('AND');
  const [filterValue, setFilterValue] = useState('');
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const [btnUpload, setBtnUpload] = useState(false);
  const [elevatorSwitchFromControlPanel, setElevatorSwitchFromControlPanel] = useState(false);
  const [selectedFloorsFromControlPanel, setSelectedFloorsFromControlPanel] = useState([]);

  // Main form state
  const [assignElevatorPort, setAssignElevatorPort] = useState({
    company: '',
    branch: '',
    floor: '',
    elevatorPort: 'Please Select Port',
  });

  const gridRefTableImg = useRef(null);

  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage
        .toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, 'AssignElevatorPort.png');
        })
        .catch((error) => {
          console.error('dom-to-image error: ', error);
        });
    }
  };

  // Multi-select states
  const [selectedCompany, setSelectedCompany] = useState();
  const [valueCompany, setValueCompany] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState();
  const [valueBranch, setValueBranch] = useState([]);

  // Edit state
  const [assignElevatorPortEdit, setAssignElevatorPortEdit] = useState({
    company: '',
    branch: '',
    floor: 'Please Select Floor',
    elevatorPort: 'Please Select Port',
  });

  // Alert states
  const [getOverAllCountDelete, setGetOverallCountDelete] = useState('');
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState('');
  const [popupSeverityMalert, setPopupSeverityMalert] = useState('');
  const [openPopup, setOpenPopup] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [popupSeverity, setPopupSeverity] = useState('');

  // Table and data states
  const gridRefTable = useRef(null);
  const [isHandleChange, setIsHandleChange] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const [sourceEdit, setSourceEdit] = useState({});
  const { isUserRoleCompare, isAssignBranch, pageName, setPageName, buttonStyles, isUserRoleAccess, allfloor } = useContext(UserRoleAccessContext);
  const [elevatorPortData, setElevatorPortData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // User access filtering
  const accessbranch = isUserRoleAccess?.role?.includes('Manager')
    ? isAssignBranch?.map((data) => ({
        branch: data.branch,
        company: data.company,
        unit: data.unit,
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
        }));

  const { auth } = useContext(AuthContext);
  const [sourceCheck, setSourcecheck] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState('');

  // Modal states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [openInfo, setOpeninfo] = useState(false);
  const [openview, setOpenview] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const [isCheckOpen, setisCheckOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteOpenalert, setIsDeleteOpenalert] = useState(false);
  const [isDeleteOpencheckbox, setIsDeleteOpencheckbox] = useState(false);
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElSearch, setAnchorElSearch] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [overallFilterdata, setOverallFilterdata] = useState([]);
  const [overallFilterdataAllData, setOverallFilterdataAllData] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [items, setItems] = useState([]);
  const [elevatorPortDataArrayEdit, setElevatorPortDataArrayEdit] = useState([]);
  const [elevatorPortDataArrayForExport, setElevatorPortDataArrayForExport] = useState([]);
  const [deleteSource, setDeleteSource] = useState(null);

  // Export configuration
  let exportColumnNames = ['Company', 'Branch', 'Floor', 'Elevator Ports'];
  let exportRowValues = ['company', 'branch', 'floor', 'elevatorPort'];

  // =============== EVENT HANDLERS ===============
  const handleClickOpenPopupMalert = () => setOpenPopupMalert(true);
  const handleClosePopupMalert = () => setOpenPopupMalert(false);
  const handleClickOpenPopup = () => setOpenPopup(true);
  const handleClosePopup = () => setOpenPopup(false);
  const handleCloseFilterMod = () => setIsFilterOpen(false);
  const handleClosePdfFilterMod = () => setIsPdfFilterOpen(false);
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setIsEditOpen(false);
  };
  const handleClickOpeninfo = () => setOpeninfo(true);
  const handleCloseinfo = () => setOpeninfo(false);
  const handleClickOpenview = () => setOpenview(true);
  const handleCloseview = () => setOpenview(false);
  const handleClickOpenerr = () => setIsErrorOpen(true);
  const handleCloseerr = () => {
    setIsErrorOpen(false);
    setIsDisable(false);
  };
  const handleClickOpenCheck = () => setisCheckOpen(true);
  const handleCloseCheck = () => setisCheckOpen(false);
  const handleClickOpen = () => setIsDeleteOpen(true);
  const handleCloseMod = () => setIsDeleteOpen(false);
  const handleCloseModalert = () => setIsDeleteOpenalert(false);
  const handleClickOpencheckbox = () => setIsDeleteOpencheckbox(true);
  const handleCloseModcheckbox = () => setIsDeleteOpencheckbox(false);
  const handleCloseSearch = () => {
    setAnchorElSearch(null);
    setSearchQuery('');
  };

  // =============== API FUNCTIONS ===============
  const fetchControlPanelElevatorSettings = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.GET_OVERALL_SETTINGS}`, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
      });

      if (res.data && res.data.overallsettings) {
        const lastSettings = res.data.overallsettings[res.data.overallsettings.length - 1];
        if (lastSettings) {
          console.log('Control Panel Settings Loaded:', {
            elevatorSwitch: lastSettings.elevatorswitch,
            selectedFloors: lastSettings.selectedfloors,
          });
          setElevatorSwitchFromControlPanel(lastSettings.elevatorswitch || false);
          const floors = lastSettings.selectedfloors || [];
          console.log('Fetched floors from control panel:', floors);
          const sortedFloors = [...floors].sort((a, b) => a - b);
          setSelectedFloorsFromControlPanel(sortedFloors);
        } else {
          console.log('No settings found in response');
          setElevatorSwitchFromControlPanel(true);
          setSelectedFloorsFromControlPanel([1, 2, 3, 4, 5]);
        }
      } else {
        console.log('No overallsettings in response');
        setElevatorSwitchFromControlPanel(true);
        setSelectedFloorsFromControlPanel([1, 2, 3, 4, 5]);
      }
    } catch (err) {
      console.error('Error fetching overall settings, using defaults:', err);
      setElevatorSwitchFromControlPanel(true);
      setSelectedFloorsFromControlPanel([1, 2, 3, 4, 5]);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const sendRequest = async () => {
    setPageName(!pageName);
    setBtnUpload(true);
    try {
      await axios.post(SERVICE.CREATE_ASSIGN_ELEVATOR_PORT, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        company: assignElevatorPort.company, // Single value, not array
        branch: assignElevatorPort.branch, // Single value, not array
        floor: assignElevatorPort.floor,
        elevatorPort: assignElevatorPort.elevatorPort,
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });

      // await fetchElevatorPortData();
      await fetchEmployee();
      setIsDisable(false);
      setSearchQuery('');
      setAssignElevatorPort({
        company: '',
        branch: '',
        floor: 'Please Select Floor',
        elevatorPort: 'Please Select Port',
      });
      setSelectedCompany([]);
      setSelectedBranch([]);
      setValueCompany([]);
      setValueBranch([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!assignElevatorPort.company || assignElevatorPort.company.trim() === 'Please Select Company') {
      setPopupContentMalert('Please Select Company');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
      return;
    }

    if (!assignElevatorPort.branch || assignElevatorPort.branch.trim() === 'Please Select Branch') {
      setPopupContentMalert('Please Select Branch');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
      return;
    }

    if (assignElevatorPort.floor === 'Please Select Floor' || !assignElevatorPort.floor) {
      setPopupContentMalert('Please Select Floor');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
      return;
    }

    if (assignElevatorPort.elevatorPort === 'Please Select Port' || !assignElevatorPort.elevatorPort) {
      setPopupContentMalert('Please Select Elevator Port');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
      return;
    }

    if (!elevatorSwitchFromControlPanel) {
      setPopupContentMalert('Elevator is disabled in Control Panel settings');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
      return;
    }

    if (selectedFloorsFromControlPanel.length === 0) {
      setPopupContentMalert('No floors selected in Control Panel Elevator Settings');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
      return;
    }

    setBtnUpload(true);

    try {
      const freshDataResponse = await axios.get(SERVICE.ALL_ASSIGN_ELEVATOR_PORT, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
      });

      const freshData = freshDataResponse?.data?.assignelevatorport || [];

      console.log('Fresh data check:', {
        selectedCompany: assignElevatorPort.company,
        selectedBranch: assignElevatorPort.branch,
        selectedFloor: assignElevatorPort.floor,
        selectedPort: assignElevatorPort.elevatorPort,
        freshDataCount: freshData.length,
      });

      const duplicatePortInSameBranch = freshData.some((item) => {
        // Handle both array and string formats for backward compatibility
        const itemBranch = Array.isArray(item.branch) ? item.branch[0] : item.branch;
        const itemPort = item.elevatorPort;

        // Check if same branch (direct string comparison)
        const sameBranch = itemBranch === assignElevatorPort.branch;

        // Check if same elevator port
        const samePort = itemPort === assignElevatorPort.elevatorPort;

        console.log(`Rule 1 check: branch=${itemBranch}, port=${itemPort}, floor=${item.floor}, sameBranch=${sameBranch}, samePort=${samePort}`);

        return sameBranch && samePort;
      });

      if (duplicatePortInSameBranch) {
        console.log('RULE 1 VIOLATED: Same port in same branch!');
        setPopupContentMalert(`Elevator Port ${assignElevatorPort.elevatorPort} is already assigned to another floor in the selected branch. Each elevator port can only be assigned to one floor per branch.`);
        setPopupSeverityMalert('warning');
        handleClickOpenPopupMalert();
        setBtnUpload(false);
        return;
      }

      const duplicateFloorInSameBranch = freshData.some((item) => {
        // Handle both array and string formats
        const itemBranch = Array.isArray(item.branch) ? item.branch[0] : item.branch;
        const itemFloor = item.floor;

        // Check if same branch
        const sameBranch = itemBranch === assignElevatorPort.branch;

        // Check if same floor
        const sameFloor = itemFloor === assignElevatorPort.floor;

        console.log(`Rule 2 check: branch=${itemBranch}, port=${item.elevatorPort}, floor=${itemFloor}, sameBranch=${sameBranch}, sameFloor=${sameFloor}`);

        return sameBranch && sameFloor;
      });

      if (duplicateFloorInSameBranch) {
        console.log('RULE 2 VIOLATED: Same floor in same branch!');
        setPopupContentMalert(`Floor ${assignElevatorPort.floor} is already assigned to an elevator port in the selected branch. Each floor can only be assigned to one elevator port per branch.`);
        setPopupSeverityMalert('warning');
        handleClickOpenPopupMalert();
        setBtnUpload(false);
        return;
      }

      // Check for exact match (all fields same)
      const exactMatchFound = freshData.some((item) => {
        // Handle both array and string formats for company and branch
        const itemCompany = Array.isArray(item.company) ? item.company[0] : item.company;
        const itemBranch = Array.isArray(item.branch) ? item.branch[0] : item.branch;

        // Compare all fields
        const sameCompany = itemCompany === assignElevatorPort.company;
        const sameBranch = itemBranch === assignElevatorPort.branch;
        const sameFloor = item.floor === assignElevatorPort.floor;
        const samePort = item.elevatorPort === assignElevatorPort.elevatorPort;

        console.log(
          `Exact match check: item=${itemCompany}/${itemBranch}/${item.floor}/${item.elevatorPort}, new=${assignElevatorPort.company}/${assignElevatorPort.branch}/${assignElevatorPort.floor}/${assignElevatorPort.elevatorPort}, matches=${sameCompany && sameBranch && sameFloor && samePort}`
        );

        return sameCompany && sameBranch && sameFloor && samePort;
      });

      if (exactMatchFound) {
        setPopupContentMalert('This exact assignment already exists!');
        setPopupSeverityMalert('warning');
        handleClickOpenPopupMalert();
        setBtnUpload(false);
        return;
      }

      // If no duplicates found, proceed with save
      await sendRequest();
    } catch (error) {
      console.error('Error in duplicate check:', error);
      setBtnUpload(false);
      handleApiError(error, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    setAssignElevatorPort({
      company: 'Please Select Company',
      branch: 'Please Select Branch',
      floor: 'Please Select Floor',
      elevatorPort: 'Please Select Port',
    });
    setSearchQuery('');
    fetchElevatorPortData();
    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
  };

  const handleClickOpenEdit = () => setIsEditOpen(true);

  const getCode = async (e, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.SINGLE_ASSIGN_ELEVATOR_PORT}/${e}`, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
      });
      setElevatorPortDataArrayEdit(elevatorPortData?.filter((item) => item?._id !== e));
      setSourceEdit(res?.data?.sassignelevatorport);

      setAssignElevatorPortEdit({
        ...res?.data?.sassignelevatorport,
        company: res?.data?.sassignelevatorport?.company || [],
        branch: res?.data?.sassignelevatorport?.branch || [],
        elevatorPort: res?.data?.sassignelevatorport?.elevatorPort || 'Please Select Port',
      });

      handleClickOpenEdit();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const getviewCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.SINGLE_ASSIGN_ELEVATOR_PORT}/${e}`, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
      });
      setSourceEdit(res?.data?.sassignelevatorport);
      handleClickOpenview();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const getinfoCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.SINGLE_ASSIGN_ELEVATOR_PORT}/${e}`, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
      });
      setSourceEdit(res?.data?.sassignelevatorport);
      handleClickOpeninfo();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const sendEditRequest = async () => {
    setPageName(!pageName);
    try {
      await axios.put(`${SERVICE.SINGLE_ASSIGN_ELEVATOR_PORT}/${sourceEdit?._id}`, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        company: assignElevatorPortEdit.company,
        branch: assignElevatorPortEdit.branch,
        floor: assignElevatorPortEdit.floor,
        elevatorPort: assignElevatorPortEdit.elevatorPort,
        updatedby: [
          ...(sourceEdit?.updatedby || []),
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });

      setFilteredRowData([]);
      setFilteredChanges(null);
      // await fetchElevatorPortData();
      await fetchEmployee();
      handleCloseModEdit();
      setPopupContent('Updated Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const editSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!assignElevatorPortEdit.company || assignElevatorPortEdit.company.trim() === '') {
      setPopupContentMalert('Please Select Company');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
      return;
    } else if (!assignElevatorPortEdit.branch || assignElevatorPortEdit.branch.trim() === '') {
      setPopupContentMalert('Please Select Branch');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
      return;
    } else if (assignElevatorPortEdit.floor === 'Please Select Floor' || !assignElevatorPortEdit.floor) {
      setPopupContentMalert('Please Select Floor');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
      return;
    } else if (assignElevatorPortEdit.elevatorPort === 'Please Select Port' || !assignElevatorPortEdit.elevatorPort) {
      setPopupContentMalert('Please Select Elevator Port');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
      return;
    } else if (!elevatorSwitchFromControlPanel) {
      setPopupContentMalert('Elevator is disabled in Control Panel settings');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
      return;
    } else if (selectedFloorsFromControlPanel.length === 0) {
      setPopupContentMalert('No floors selected in Control Panel Elevator Settings');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
      return;
    }

    try {
      // Fetch fresh data to ensure we have latest
      const freshDataResponse = await axios.get(SERVICE.ALL_ASSIGN_ELEVATOR_PORT, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
      });

      const freshData = freshDataResponse?.data?.assignelevatorport || [];

      // Filter out the current item being edited
      const freshDataExcludingCurrent = freshData.filter((item) => item._id !== sourceEdit?._id);

      console.log('Edit - Fresh data check:', {
        currentId: sourceEdit?._id,
        selectedCompany: assignElevatorPortEdit.company,
        selectedBranch: assignElevatorPortEdit.branch,
        selectedFloor: assignElevatorPortEdit.floor,
        selectedPort: assignElevatorPortEdit.elevatorPort,
        freshDataCount: freshDataExcludingCurrent.length,
      });

      const duplicatePortInSameBranch = freshDataExcludingCurrent.some((item) => {
        const itemBranch = Array.isArray(item.branch) ? item.branch[0] : item.branch;
        const sameBranch = itemBranch === assignElevatorPortEdit.branch;
        const samePort = item.elevatorPort === assignElevatorPortEdit.elevatorPort;

        return sameBranch && samePort;
      });

      if (duplicatePortInSameBranch) {
        setPopupContentMalert(`Elevator Port ${assignElevatorPortEdit.elevatorPort} is already assigned to another floor in the selected branch. Each elevator port can only be assigned to one floor per branch.`);
        setPopupSeverityMalert('warning');
        handleClickOpenPopupMalert();
        return;
      }

      const duplicateFloorInSameBranch = freshDataExcludingCurrent.some((item) => {
        const itemBranch = Array.isArray(item.branch) ? item.branch[0] : item.branch;
        const sameBranch = itemBranch === assignElevatorPortEdit.branch;
        const sameFloor = item.floor === assignElevatorPortEdit.floor;

        return sameBranch && sameFloor;
      });

      if (duplicateFloorInSameBranch) {
        setPopupContentMalert(`Floor ${assignElevatorPortEdit.floor} is already assigned to an elevator port in the selected branch. Each floor can only be assigned to one elevator port per branch.`);
        setPopupSeverityMalert('warning');
        handleClickOpenPopupMalert();
        return;
      }

      // Check for exact match (excluding current item)
      const exactMatchFound = freshDataExcludingCurrent.some((item) => {
        const itemCompany = Array.isArray(item.company) ? item.company[0] : item.company;
        const itemBranch = Array.isArray(item.branch) ? item.branch[0] : item.branch;

        const sameCompany = itemCompany === assignElevatorPortEdit.company;
        const sameBranch = itemBranch === assignElevatorPortEdit.branch;
        const sameFloor = item.floor === assignElevatorPortEdit.floor;
        const samePort = item.elevatorPort === assignElevatorPortEdit.elevatorPort;

        return sameCompany && sameBranch && sameFloor && samePort;
      });

      if (exactMatchFound) {
        setPopupContentMalert('This exact assignment already exists!');
        setPopupSeverityMalert('warning');
        handleClickOpenPopupMalert();
        return;
      }

      sendEditRequest();
    } catch (error) {
      console.error('Error in edit duplicate check:', error);
      handleApiError(error, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchElevatorPortData = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.get(SERVICE.ALL_ASSIGN_ELEVATOR_PORT, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
      });
      setSourcecheck(true);
      setElevatorPortData(res_vendor?.data?.assignelevatorport);
    } catch (err) {
      setSourcecheck(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchElevatorPortDataForExport = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.get(SERVICE.ALL_ASSIGN_ELEVATOR_PORT, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
      });
      setSourcecheck(true);
      setElevatorPortDataArrayForExport(
        res_vendor?.data?.assignelevatorport.map((item, index) => ({
          id: item._id,
          serialNumber: index + 1,
          company: item.company,
          branch: item.branch,
          floor: item.floor,
          elevatorPort: item.elevatorPort,
        }))
      );
    } catch (err) {
      setSourcecheck(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchEmployee = async () => {
    setPageName(!pageName);
    const queryParams = {
      page: Number(page),
      pageSize: Number(pageSize),
      searchQuery: searchQuery,
      assignbranch: accessbranch,
    };

    const allFilters = [...additionalFilters, { column: selectedColumn, condition: selectedCondition, value: filterValue }];

    if (allFilters.length > 0 && selectedColumn !== '') {
      queryParams.allFilters = allFilters;
      queryParams.logicOperator = logicOperator;
    } else if (searchQuery) {
      queryParams.searchQuery = searchQuery;
    }

    try {
      let res_employee = await axios.post(SERVICE.ASSIGN_ELEVATOR_PORT_LIST, queryParams, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
      });
      const ans = res_employee?.data?.result?.length > 0 ? res_employee?.data?.result : [];
      const itemsWithSerialNumber = ans?.map((item, index) => ({
        ...item,
        serialNumber: (page - 1) * pageSize + index + 1,
      }));
      setOverallFilterdata(itemsWithSerialNumber);
      setOverallFilterdataAllData(
        res_employee?.data?.totalProjectsAllData?.length > 0
          ? res_employee?.data?.totalProjectsAllData?.map((item, index) => ({
              ...item,
              serialNumber: index + 1,
            }))
          : []
      );
      setTotalProjects(ans?.length > 0 ? res_employee?.data?.totalProjects : 0);
      setTotalPages(ans?.length > 0 ? res_employee?.data?.totalPages : 0);
      setPageSize((data) => (ans?.length > 0 ? data : 10));
      setPage((data) => (ans?.length > 0 ? data : 1));
      setSourcecheck(true);
    } catch (err) {
      setSourcecheck(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const getOverallEditSectionOverallDelete = async (ids) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.OVERALL_BULK_ASSIGN_ELEVATOR_PORT_DELETE, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        id: ids,
      });
      setSelectedRows(res?.data?.result);
      setSelectedRowsCount(res?.data?.count);
      setIsDeleteOpencheckbox(true);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const rowData = async (id, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.SINGLE_ASSIGN_ELEVATOR_PORT}/${id}`, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
      });
      setDeleteSource(res?.data?.sassignelevatorport);
      getOverallEditSectionDelete(res?.data?.sassignelevatorport?._id);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const getOverallEditSectionDelete = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.OVERALL_ASSIGN_ELEVATOR_PORT_DELETE, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        oldname: e,
      });
      setGetOverallCountDelete(`This Elevator Port Data is linked in 
       ${res?.data?.linkedData?.length > 0 ? 'other pages,' : ''}`);
      if (res?.data?.count > 0) {
        handleClickOpenCheck();
      } else {
        handleClickOpen();
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const delSource = async () => {
    setPageName(!pageName);
    try {
      await axios.delete(`${SERVICE.SINGLE_ASSIGN_ELEVATOR_PORT}/${deleteSource?._id}`, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
      });
      setFilteredRowData([]);
      setFilteredChanges(null);
      await fetchEmployee();
      // fetchElevatorPortData();
      handleCloseMod();
      setSelectedRows([]);
      setPage(1);
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
        return axios.delete(`${SERVICE.SINGLE_ASSIGN_ELEVATOR_PORT}/${item}`, {
          headers: { Authorization: `Bearer ${auth.APIToken}` },
        });
      });
      await Promise.all(deletePromises);
      setIsHandleChange(false);
      setFilteredRowData([]);
      setFilteredChanges(null);
      handleCloseModcheckbox();
      setSelectedRows([]);
      setPage(1);
      await fetchEmployee();
      await fetchElevatorPortData();
      setPopupContent('Deleted Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    company: true,
    branch: true,
    floor: true,
    elevatorPort: true,
    actions: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  const columnDataTable = [
    {
      field: 'checkbox',
      headerName: 'Checkbox',
      sortable: false,
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
    { field: 'company', headerName: 'Company', flex: 0, width: 200, hide: !columnVisibility.company, headerClassName: 'bold-header' },
    { field: 'branch', headerName: 'Branch', flex: 0, width: 200, hide: !columnVisibility.branch, headerClassName: 'bold-header' },
    { field: 'floor', headerName: 'Floor', flex: 0, width: 150, hide: !columnVisibility.floor, headerClassName: 'bold-header' },
    { field: 'elevatorPort', headerName: 'Elevator Ports', flex: 0, width: 150, hide: !columnVisibility.elevatorPort, headerClassName: 'bold-header' },
    {
      field: 'actions',
      headerName: 'Action',
      flex: 0,
      width: 280,
      sortable: false,
      hide: !columnVisibility.actions,
      headerClassName: 'bold-header',
      cellRenderer: (params) => (
        <Grid sx={{ display: 'flex' }}>
          {isUserRoleCompare?.includes('eassignelevatorport') && (
            <Button sx={userStyle.buttonedit} onClick={() => getCode(params.data.id, params.data.name)}>
              <EditOutlinedIcon sx={buttonStyles.buttonedit} />
            </Button>
          )}
          {isUserRoleCompare?.includes('dassignelevatorport') && (
            <Button sx={userStyle.buttondelete} onClick={(e) => rowData(params.data.id, params.data.name)}>
              <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />
            </Button>
          )}
          {isUserRoleCompare?.includes('vassignelevatorport') && (
            <Button sx={userStyle.buttonedit} onClick={() => getviewCode(params.data.id)}>
              <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />
            </Button>
          )}
          {isUserRoleCompare?.includes('iassignelevatorport') && (
            <Button sx={userStyle.buttonedit} onClick={() => getinfoCode(params.data.id)}>
              <InfoOutlinedIcon sx={buttonStyles.buttoninfo} />
            </Button>
          )}
        </Grid>
      ),
    },
  ];

  const filteredSelectedColumn = columnDataTable.filter((data) => data.field !== 'checkbox' && data.field !== 'actions' && data.field !== 'serialNumber');

  const rowDataTable = overallFilterdata.map((item, index) => ({
    id: item._id,
    serialNumber: item.serialNumber,
    company: item.company || '',
    branch: item.branch || '',
    floor: item.floor,
    elevatorPort: item.elevatorPort,
  }));

  const handleClickSearch = (event) => {
    setAnchorElSearch(event.currentTarget);
    localStorage.removeItem('filterModel');
  };

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

  const handleResetSearch = async () => {
    setPageName(!pageName);
    setAdvancedFilter(null);
    setAdditionalFilters([]);
    setSearchQuery('');
    setIsSearchActive(false);
    setSelectedColumn('');
    setSelectedCondition('Contains');
    setFilterValue('');
    setLogicOperator('AND');
    setFilteredChanges(null);
    await fetchEmployee();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSelectedRows([]);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setSelectedRows([]);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleShowAllColumns = () => {
    const updatedVisibility = { ...columnVisibility };
    for (const columnKey in updatedVisibility) {
      updatedVisibility[columnKey] = true;
    }
    setColumnVisibility(updatedVisibility);
  };

  const toggleColumnVisibility = (field) => {
    setColumnVisibility((prevVisibility) => ({
      ...prevVisibility,
      [field]: !prevVisibility[field],
    }));
  };

  const handleOpenManageColumns = (event) => {
    setAnchorEl(event.currentTarget);
    setManageColumnsOpen(true);
  };

  const handleCloseManageColumns = () => {
    setManageColumnsOpen(false);
    setSearchQueryManage('');
  };

  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Assign Elevator Port',
    pageStyle: 'print',
  });

  const getapi = async () => {
    try {
      await axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
        headers: { Authorization: `Bearer${auth.APIToken}` },
        empcode: String(isUserRoleAccess?.empcode),
        companyname: String(isUserRoleAccess?.companyname),
        pagename: String('Assign Elevator Port'),
        commonid: String(isUserRoleAccess?._id),
        date: String(new Date()),
        addedby: [
          {
            name: String(isUserRoleAccess?.username),
            date: String(new Date()),
          },
        ],
      });
    } catch (err) {
      console.error('Error creating user check:', err);
    }
  };

  const handleClickOpenalert = () => {
    setIsHandleChange(true);
    if (selectedRows.length === 0) {
      setIsDeleteOpenalert(true);
    } else {
      getOverallEditSectionOverallDelete(selectedRows);
    }
  };

  useEffect(() => {
    fetchEmployee();
    fetchElevatorPortData();
    getapi();
    fetchControlPanelElevatorSettings();
  }, []);

  useEffect(() => {
    fetchEmployee();
  }, [page, pageSize, searchQuery]);

  useEffect(() => {
    fetchElevatorPortDataForExport();
  }, [isFilterOpen]);

  useEffect(() => {
    setItems(overallFilterdata);
  }, [overallFilterdata]);

  const filteredColumns = columnDataTable.filter((column) => column.headerName.toLowerCase().includes(searchQueryManage.toLowerCase()));

  const manageColumnsContent = (
    <Box style={{ padding: '10px', minWidth: '325px' }}>
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
              <ListItemText sx={{ display: 'flex' }} primary={<Switch sx={{ marginTop: '-5px' }} size="small" checked={columnVisibility[column.field]} onChange={() => toggleColumnVisibility(column.field)} />} secondary={column.field === 'checkbox' ? 'Checkbox' : column.headerName} />
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
                  newColumnVisibility[column.field] = false;
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

  const openSearch = Boolean(anchorElSearch);
  const open = Boolean(anchorEl);
  const idSearch = openSearch ? 'simple-popover' : undefined;

  return (
    <Box>
      <Headtitle title={'ASSIGN ELEVATOR PORT'} />
      <PageHeading title="Assign Elevator Port" modulename="Human Resources" submodulename="HR" mainpagename="BX-Biometric Device" subpagename="Elevator" subsubpagename="Assign Elevator Port" />

      {isUserRoleCompare?.includes('aassignelevatorport') && (
        <Box sx={userStyle.dialogbox}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Add Elevator Port Assignment</Typography>
            </Grid>
          </Grid>
          <br />
          <Grid container spacing={2}>
            <Grid item md={3} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  Company<b style={{ color: 'red' }}>*</b>
                </Typography>
                <Selects
                  options={accessbranch
                    ?.map((data) => ({
                      label: data.company,
                      value: data.company,
                    }))
                    .filter((item, index, self) => self.findIndex((i) => i.label === item.label && i.value === item.value) === index)}
                  styles={colourStyles}
                  value={
                    assignElevatorPort.company
                      ? {
                          label: assignElevatorPort.company,
                          value: assignElevatorPort.company,
                        }
                      : null
                  }
                  onChange={(e) => {
                    if (e) {
                      setSelectedCompany(e.value);
                      setAssignElevatorPort({
                        ...assignElevatorPort,
                        company: e.value,
                        branch: '',
                        floor: 'Please Select Floor',
                        elevatorPort: 'Please Select Port',
                      });
                    } else {
                      setSelectedCompany('');
                      setAssignElevatorPort({
                        ...assignElevatorPort,
                        company: '',
                        branch: '',
                        floor: 'Please Select Floor',
                        elevatorPort: 'Please Select Port',
                      });
                    }
                  }}
                  placeholder="Please Select Company"
                  isClearable={true}
                />
              </FormControl>
            </Grid>

            <Grid item md={3} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  Branch<b style={{ color: 'red' }}>*</b>
                </Typography>
                <Selects
                  options={accessbranch
                    ?.filter((comp) => assignElevatorPort.company === comp.company)
                    ?.map((data) => ({
                      label: data.branch,
                      value: data.branch,
                    }))
                    .filter((item, index, self) => self.findIndex((i) => i.label === item.label && i.value === item.value) === index)}
                  styles={colourStyles}
                  value={
                    assignElevatorPort.branch
                      ? {
                          label: assignElevatorPort.branch,
                          value: assignElevatorPort.branch,
                        }
                      : null
                  }
                  onChange={(e) => {
                    if (e) {
                      setSelectedBranch(e.value);
                      setAssignElevatorPort({
                        ...assignElevatorPort,
                        branch: e.value,
                        floor: 'Please Select Floor',
                        elevatorPort: 'Please Select Port',
                      });
                    } else {
                      setSelectedBranch('');
                      setAssignElevatorPort({
                        ...assignElevatorPort,
                        branch: '',
                        floor: 'Please Select Floor',
                        elevatorPort: 'Please Select Port',
                      });
                    }
                  }}
                  placeholder="Please Select Branch"
                  isDisabled={!assignElevatorPort.company}
                  isClearable={true}
                />
              </FormControl>
            </Grid>

            <Grid item md={3} xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <Typography>
                  Floor<b style={{ color: 'red' }}>*</b>
                </Typography>
                <Selects
                  options={
                    allfloor
                      ?.filter((floorItem) => {
                        if (!assignElevatorPort.branch) return false;
                        return floorItem.branch === assignElevatorPort.branch;
                      })
                      .map((u) => ({
                        ...u,
                        label: u.name,
                        value: u.name,
                      }))
                      .filter((item, index, self) => self.findIndex((i) => i.label === item.label && i.value === item.value) === index) || []
                  }
                  styles={colourStyles}
                  value={
                    assignElevatorPort.floor && assignElevatorPort.floor !== 'Please Select Floor'
                      ? {
                          label: assignElevatorPort.floor,
                          value: assignElevatorPort.floor,
                        }
                      : null
                  }
                  onChange={(e) => {
                    setAssignElevatorPort({
                      ...assignElevatorPort,
                      floor: e ? e.value : '',
                      elevatorPort: 'Please Select Port',
                    });
                  }}
                  isDisabled={!assignElevatorPort.branch}
                  placeholder="Please Select Floor"
                  isClearable={true}
                />
                {!assignElevatorPort.branch && (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    Select a branch first to see available floors
                  </Typography>
                )}
                {assignElevatorPort.branch && allfloor?.filter((f) => f.branch === assignElevatorPort.branch).length === 0 && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    No floors available for this branch
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item md={3} xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <Typography>
                  Elevator Ports<b style={{ color: 'red' }}>*</b>
                  {elevatorSwitchFromControlPanel && selectedFloorsFromControlPanel.length > 0 && (
                    <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                      ({selectedFloorsFromControlPanel.length} floors available)
                    </Typography>
                  )}
                </Typography>
                <Selects
                  options={
                    !elevatorSwitchFromControlPanel
                      ? [{ label: 'Elevator disabled in Control Panel', value: 'disabled' }]
                      : selectedFloorsFromControlPanel.length === 0
                      ? [{ label: 'No floors selected in Control Panel', value: 'no_floors' }]
                      : selectedFloorsFromControlPanel.map((floor) => ({
                          label: `Floor ${floor}`,
                          value: floor.toString(),
                        }))
                  }
                  styles={colourStyles}
                  value={
                    !assignElevatorPort.elevatorPort || assignElevatorPort.elevatorPort === '' || assignElevatorPort.elevatorPort === 'disabled' || assignElevatorPort.elevatorPort === 'no_floors' || assignElevatorPort.elevatorPort === 'Please Select Ports'
                      ? null
                      : {
                          label: `${assignElevatorPort.elevatorPort}`,
                          value: assignElevatorPort.elevatorPort,
                        }
                  }
                  placeholder="Please Select Ports"
                  onChange={(e) => {
                    if (elevatorSwitchFromControlPanel && selectedFloorsFromControlPanel.length > 0) {
                      setAssignElevatorPort({
                        ...assignElevatorPort,
                        elevatorPort: e ? e.value : '',
                      });
                    }
                  }}
                  isDisabled={!elevatorSwitchFromControlPanel || selectedFloorsFromControlPanel.length === 0}
                />
                {!elevatorSwitchFromControlPanel ? (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    Elevator is disabled in Control Panel settings
                  </Typography>
                ) : selectedFloorsFromControlPanel.length === 0 ? (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    No floors selected in Control Panel Elevator Settings
                  </Typography>
                ) : (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    Available floors: {selectedFloorsFromControlPanel.join(', ')}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item md={3} sm={12} xs={12}>
              <Typography>&nbsp;</Typography>
              <Grid sx={{ display: 'flex', gap: '15px' }}>
                <LoadingButton loading={btnUpload} sx={buttonStyles.buttonsubmit} onClick={handleSubmit}>
                  SAVE
                </LoadingButton>
                <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                  CLEAR
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}

      <br />

      {isUserRoleCompare?.includes('lassignelevatorport') && (
        <Box sx={userStyle.container}>
          <Grid item xs={8}>
            <Typography sx={userStyle.importheadtext}>Elevator Port Assignment List</Typography>
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
                  <MenuItem value={elevatorPortData?.length}>All</MenuItem>
                </Select>
              </Box>
            </Grid>
            <Grid item md={8} xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Box>
                {isUserRoleCompare?.includes('excelassignelevatorport') && (
                  <Button
                    onClick={(e) => {
                      setIsFilterOpen(true);
                      fetchElevatorPortDataForExport();
                      setFormat('xl');
                    }}
                    sx={userStyle.buttongrp}
                  >
                    <FaFileExcel />
                    &ensp;Export to Excel&ensp;
                  </Button>
                )}
                {isUserRoleCompare?.includes('csvassignelevatorport') && (
                  <Button
                    onClick={(e) => {
                      setIsFilterOpen(true);
                      fetchElevatorPortDataForExport();
                      setFormat('csv');
                    }}
                    sx={userStyle.buttongrp}
                  >
                    <FaFileCsv />
                    &ensp;Export to CSV&ensp;
                  </Button>
                )}
                {isUserRoleCompare?.includes('printassignelevatorport') && (
                  <Button sx={userStyle.buttongrp} onClick={handleprint}>
                    &ensp;
                    <FaPrint />
                    &ensp;Print&ensp;
                  </Button>
                )}
                {isUserRoleCompare?.includes('pdfassignelevatorport') && (
                  <Button
                    sx={userStyle.buttongrp}
                    onClick={() => {
                      setIsPdfFilterOpen(true);
                      fetchElevatorPortDataForExport();
                    }}
                  >
                    <FaFilePdf />
                    &ensp;Export to PDF&ensp;
                  </Button>
                )}
                {isUserRoleCompare?.includes('imageassignelevatorport') && (
                  <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}>
                    {' '}
                    <ImageIcon sx={{ fontSize: '15px' }} /> &ensp;Image&ensp;{' '}
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item md={2} xs={6} sm={6}>
              <FormControl fullWidth size="small">
                <OutlinedInput
                  size="small"
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
                          <IoMdOptions style={{ cursor: 'pointer' }} onClick={handleClickSearch} />
                        </span>
                      </Tooltip>
                    </InputAdornment>
                  }
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{ 'aria-label': 'weight' }}
                  type="text"
                  value={getSearchDisplay()}
                  onChange={handleSearchChange}
                  placeholder="Type to search..."
                  disabled={!!advancedFilter}
                />
              </FormControl>
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
          {isUserRoleCompare?.includes('bdassignelevatorport') && (
            <Button sx={buttonStyles.buttonbulkdelete} onClick={handleClickOpenalert}>
              Bulk Delete
            </Button>
          )}
          <br />
          <br />
          {!sourceCheck ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
            </Box>
          ) : (
            <>
              <AggridTableForPaginationTable
                rowDataTable={rowDataTable}
                columnDataTable={columnDataTable}
                columnVisibility={columnVisibility}
                page={page}
                setPage={setPage}
                pageSize={pageSize}
                totalPages={totalPages}
                setColumnVisibility={setColumnVisibility}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                gridRefTable={gridRefTable}
                totalDatas={totalProjects}
                setFilteredRowData={setFilteredRowData}
                filteredRowData={filteredRowData}
                gridRefTableImg={gridRefTableImg}
                itemsList={overallFilterdataAllData}
              />
              <Popover id={idSearch} open={openSearch} anchorEl={anchorElSearch} onClose={handleCloseSearch} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Box style={{ padding: '10px', maxWidth: '450px' }}>
                  <Typography variant="h6">Advance Search</Typography>
                  <IconButton
                    aria-label="close"
                    onClick={handleCloseSearch}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      color: (theme) => theme.palette.grey[500],
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <DialogContent sx={{ width: '100%' }}>
                    <Box sx={{ width: '350px', maxHeight: '400px', overflow: 'hidden', position: 'relative' }}>
                      <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <Grid container spacing={1}>
                          <Grid item md={12} sm={12} xs={12}>
                            <Typography>Columns</Typography>
                            <Select
                              fullWidth
                              size="small"
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 200,
                                    width: 'auto',
                                  },
                                },
                              }}
                              style={{ minWidth: 150 }}
                              value={selectedColumn}
                              onChange={(e) => setSelectedColumn(e.target.value)}
                              displayEmpty
                            >
                              <MenuItem value="" disabled>
                                Select Column
                              </MenuItem>
                              {filteredSelectedColumn.map((col) => (
                                <MenuItem key={col.field} value={col.field}>
                                  {col.headerName}
                                </MenuItem>
                              ))}
                            </Select>
                          </Grid>
                          <Grid item md={12} sm={12} xs={12}>
                            <Typography>Operator</Typography>
                            <Select
                              fullWidth
                              size="small"
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 200,
                                    width: 'auto',
                                  },
                                },
                              }}
                              style={{ minWidth: 150 }}
                              value={selectedCondition}
                              onChange={(e) => setSelectedCondition(e.target.value)}
                              disabled={!selectedColumn}
                            >
                              {conditions.map((condition) => (
                                <MenuItem key={condition} value={condition}>
                                  {condition}
                                </MenuItem>
                              ))}
                            </Select>
                          </Grid>
                          <Grid item md={12} sm={12} xs={12}>
                            <Typography>Value</Typography>
                            <TextField
                              fullWidth
                              size="small"
                              value={['Blank', 'Not Blank'].includes(selectedCondition) ? '' : filterValue}
                              onChange={(e) => setFilterValue(e.target.value)}
                              disabled={['Blank', 'Not Blank'].includes(selectedCondition)}
                              placeholder={['Blank', 'Not Blank'].includes(selectedCondition) ? 'Disabled' : 'Enter value'}
                              sx={{
                                '& .MuiOutlinedInput-root.Mui-disabled': {
                                  backgroundColor: 'rgb(0 0 0 / 26%)',
                                },
                                '& .MuiOutlinedInput-input.Mui-disabled': {
                                  cursor: 'not-allowed',
                                },
                              }}
                            />
                          </Grid>
                          {additionalFilters.length > 0 && (
                            <Grid item md={12} sm={12} xs={12}>
                              <Typography>Logic Operator</Typography>
                              <Select fullWidth size="small" value={logicOperator} onChange={(e) => setLogicOperator(e.target.value)}>
                                <MenuItem value="AND">AND</MenuItem>
                                <MenuItem value="OR">OR</MenuItem>
                              </Select>
                            </Grid>
                          )}
                          <Grid item md={6} sm={12} xs={12}>
                            <Button variant="contained" onClick={handleAddFilter} sx={{ textTransform: 'capitalize' }} disabled={['Blank', 'Not Blank'].includes(selectedCondition) ? false : !filterValue || selectedColumn.length === 0}>
                              Add Filter
                            </Button>
                          </Grid>
                          <Grid item md={6} sm={12} xs={12}>
                            <Button
                              variant="contained"
                              onClick={() => {
                                fetchEmployee();
                                setIsSearchActive(true);
                                setAdvancedFilter([...additionalFilters, { column: selectedColumn, condition: selectedCondition, value: filterValue }]);
                              }}
                              sx={{ textTransform: 'capitalize' }}
                              disabled={['Blank', 'Not Blank'].includes(selectedCondition) ? false : !filterValue || selectedColumn.length === 0}
                            >
                              Search
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </DialogContent>
                </Box>
              </Popover>
            </>
          )}
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onClose={handleCloseModEdit} fullWidth={true} maxWidth="md" sx={{ overflow: 'visible', '& .MuiPaper-root': { overflow: 'visible' } }}>
        <Box sx={{ padding: '20px' }}>
          <form onSubmit={editSubmit}>
            <Grid container spacing={2}>
              <Grid item md={12} xs={12} sm={12}>
                <Typography sx={userStyle.HeaderText}>Edit Elevator Port Assignment</Typography>
              </Grid>
            </Grid>
            <br />
            <Grid container spacing={2}>
              <Grid item md={6} xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Company<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    options={accessbranch?.map((data) => ({ label: data.company, value: data.company })).filter((item, index, self) => self.findIndex((i) => i.label === item.label && i.value === item.value) === index)}
                    styles={colourStyles}
                    value={
                      assignElevatorPortEdit.company
                        ? {
                            label: assignElevatorPortEdit.company,
                            value: assignElevatorPortEdit.company,
                          }
                        : null
                    }
                    onChange={(e) => {
                      if (e) {
                        setAssignElevatorPortEdit({
                          ...assignElevatorPortEdit,
                          company: e.value,
                          branch: '',
                          floor: 'Please Select Floor',
                          elevatorPort: 'Please Select Port',
                        });
                      } else {
                        setAssignElevatorPortEdit({
                          ...assignElevatorPortEdit,
                          company: '',
                          branch: '',
                          floor: 'Please Select Floor',
                          elevatorPort: 'Please Select Port',
                        });
                      }
                    }}
                    placeholder="Please Select Company"
                    isClearable={true}
                  />
                </FormControl>
              </Grid>

              <Grid item md={6} xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Branch<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    options={accessbranch
                      ?.filter((comp) => assignElevatorPortEdit.company === comp.company)
                      ?.map((data) => ({ label: data.branch, value: data.branch }))
                      .filter((item, index, self) => self.findIndex((i) => i.label === item.label && i.value === item.value) === index)}
                    styles={colourStyles}
                    value={
                      assignElevatorPortEdit.branch
                        ? {
                            label: assignElevatorPortEdit.branch,
                            value: assignElevatorPortEdit.branch,
                          }
                        : null
                    }
                    onChange={(e) => {
                      if (e) {
                        setAssignElevatorPortEdit({
                          ...assignElevatorPortEdit,
                          branch: e.value,
                          floor: 'Please Select Floor',
                          elevatorPort: 'Please Select Port',
                        });
                      } else {
                        setAssignElevatorPortEdit({
                          ...assignElevatorPortEdit,
                          branch: '',
                          floor: 'Please Select Floor',
                          elevatorPort: 'Please Select Port',
                        });
                      }
                    }}
                    placeholder="Please Select Branch"
                    isDisabled={!assignElevatorPortEdit.company}
                    isClearable={true}
                  />
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Floor<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    options={allfloor
                      ?.filter((comp) => assignElevatorPortEdit.branch?.includes(comp.branch))
                      .map((u) => ({ ...u, label: u.name, value: u.name }))
                      .filter((item, index, self) => self.findIndex((i) => i.label === item.label && i.value === item.value) === index)}
                    styles={colourStyles}
                    value={{ label: assignElevatorPortEdit.floor, value: assignElevatorPortEdit.floor }}
                    onChange={(e) => {
                      setAssignElevatorPortEdit({
                        ...assignElevatorPortEdit,
                        floor: e.value,
                        elevatorPort: 'Please Select Port',
                      });
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item md={6} xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Elevator Ports<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    options={
                      !elevatorSwitchFromControlPanel
                        ? [{ label: 'Elevator disabled in Control Panel', value: 'disabled' }]
                        : selectedFloorsFromControlPanel.length === 0
                        ? [{ label: 'No floors selected in Control Panel', value: 'no_floors' }]
                        : selectedFloorsFromControlPanel.map((floor) => ({
                            label: `Floor ${floor}`,
                            value: floor.toString(),
                          }))
                    }
                    styles={colourStyles}
                    value={
                      !assignElevatorPortEdit.elevatorPort || assignElevatorPortEdit.elevatorPort === '' || assignElevatorPortEdit.elevatorPort === 'disabled' || assignElevatorPortEdit.elevatorPort === 'no_floors' || assignElevatorPortEdit.elevatorPort === 'Please Select Port'
                        ? null
                        : {
                            label: `Floor ${assignElevatorPortEdit.elevatorPort}`,
                            value: assignElevatorPortEdit.elevatorPort,
                          }
                    }
                    placeholder="Please Select Port"
                    onChange={(e) => {
                      if (elevatorSwitchFromControlPanel && selectedFloorsFromControlPanel.length > 0) {
                        setAssignElevatorPortEdit({
                          ...assignElevatorPortEdit,
                          elevatorPort: e ? e.value : '',
                        });
                      }
                    }}
                    isDisabled={!elevatorSwitchFromControlPanel || selectedFloorsFromControlPanel.length === 0}
                  />
                  {!elevatorSwitchFromControlPanel ? (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      Elevator is disabled in Control Panel settings
                    </Typography>
                  ) : selectedFloorsFromControlPanel.length === 0 ? (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      No floors selected in Control Panel Elevator Settings
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                      Available floors: {selectedFloorsFromControlPanel.join(', ')}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
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
          </form>
        </Box>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={openview} onClose={handleClickOpenview} maxWidth="md" fullWidth={true} sx={{ marginTop: '80px' }}>
        <Box sx={{ padding: '20px 50px' }}>
          <Typography sx={userStyle.HeaderText}>View Elevator Port Assignment</Typography>
          <br />
          <br />
          <Grid container spacing={2}>
            <Grid item md={6} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography variant="h6">Company</Typography>
                <Typography>{sourceEdit?.company || 'Not selected'}</Typography>
              </FormControl>
            </Grid>
            <Grid item md={6} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography variant="h6">Branch</Typography>
                <Typography>{sourceEdit?.branch || 'Not selected'}</Typography>
              </FormControl>
            </Grid>
            <Grid item md={6} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography variant="h6">Floor</Typography>
                <Typography>{sourceEdit?.floor}</Typography>
              </FormControl>
            </Grid>
            <Grid item md={6} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography variant="h6">Elevator Ports</Typography>
                <Typography>{sourceEdit?.elevatorPort}</Typography>
              </FormControl>
            </Grid>
          </Grid>
          <br />
          <br />
          <br />
          <Grid container spacing={2}>
            <Button sx={buttonStyles.btncancel} onClick={handleCloseview}>
              Back
            </Button>
          </Grid>
        </Box>
      </Dialog>

      {/* Manage Columns Popover */}
      <Popover
        // id={id}
        open={isManageColumnsOpen}
        anchorEl={anchorEl}
        onClose={handleCloseManageColumns}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {manageColumnsContent}
      </Popover>

      {/* Alert Dialogs */}
      <MessageAlert openPopup={openPopupMalert} handleClosePopup={handleClosePopupMalert} popupContent={popupContentMalert} popupSeverity={popupSeverityMalert} />
      <AlertDialog openPopup={openPopup} handleClosePopup={handleClosePopup} popupContent={popupContent} popupSeverity={popupSeverity} />
      <ExportData
        isFilterOpen={isFilterOpen}
        handleCloseFilterMod={handleCloseFilterMod}
        fileFormat={fileFormat}
        setIsFilterOpen={setIsFilterOpen}
        isPdfFilterOpen={isPdfFilterOpen}
        setIsPdfFilterOpen={setIsPdfFilterOpen}
        handleClosePdfFilterMod={handleClosePdfFilterMod}
        filteredDataTwo={(filteredChanges !== null ? filteredRowData : rowDataTable) ?? []}
        itemsTwo={elevatorPortDataArrayForExport ?? []}
        filename={'Assign Elevator Port'}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
      <InfoPopup openInfo={openInfo} handleCloseinfo={handleCloseinfo} heading="Elevator Port Assignment Info" addedby={sourceEdit?.addedby} updateby={sourceEdit?.updatedby} />
      <DeleteConfirmation open={isDeleteOpen} onClose={handleCloseMod} onConfirm={delSource} title="Are you sure?" confirmButtonText="Yes" cancelButtonText="Cancel" />
      <Dialog open={isDeleteOpencheckbox} onClose={handleCloseModcheckbox}>
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
              <Button variant="contained" color="error" onClick={delSourcecheckbox} sx={buttonStyles.buttonsubmit}>
                OK
              </Button>
            </>
          ) : (
            <Button variant="contained" color="error" onClick={handleCloseModcheckbox} sx={buttonStyles.buttonsubmit}>
              Ok
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Dialog open={isCheckOpen} onClose={handleCloseCheck}>
        <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '80px', color: 'orange' }} />
          <Typography variant="h6" sx={{ color: 'black', textAlign: 'center' }}>
            {getOverAllCountDelete}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button sx={buttonStyles.buttonsubmit} onClick={handleCloseCheck} autoFocus variant="contained" color="error">
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <PleaseSelectRow open={isDeleteOpenalert} onClose={handleCloseModalert} message="Please Select any Row" iconColor="orange" buttonText="OK" />
    </Box>
  );
}

export default AssignElevatorPort;
