import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import BlockIcon from '@mui/icons-material/Block';
import SchoolIcon from '@mui/icons-material/School';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WorkIcon from '@mui/icons-material/Work';
import { MultiSelect } from 'react-multi-select-component';
import LoadingButton from '@mui/lab/LoadingButton';
import { DeleteConfirmation } from '../../components/DeleteConfirmation.js';
import { Box, Button, Dialog, Backdrop, DialogTitle, DialogActions, DialogContent, FormControl, LinearProgress, FormHelperText, Grid, IconButton, List, ListItem, ListItemText, MenuItem, Popover, Select, TextField, Tooltip, Typography, OutlinedInput, InputAdornment } from '@mui/material';
import axios from '../../axiosInstance';
import 'jspdf-autotable';
import moment from 'moment-timezone';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { FaFilePdf, FaPrint } from 'react-icons/fa';
import { ThreeDots } from 'react-loader-spinner';
import { useReactToPrint } from 'react-to-print';
import { handleApiError } from '../../components/Errorhandling';
import { AuthContext, UserRoleAccessContext } from '../../context/Appcontext';
import { userStyle, colourStyles } from '../../pageStyle';
import { SERVICE } from '../../services/Baseservice';
import Selects from 'react-select';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/Error';
import ImageIcon from '@mui/icons-material/Image';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import SyncIcon from '@mui/icons-material/Sync';
import MuiInput from '@mui/material/Input';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/system';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';
import { FaFileCsv, FaFileExcel } from 'react-icons/fa';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { Link, useNavigate } from 'react-router-dom';
import AggregatedSearchBar from '../../components/AggregatedSearchBar';
import AggridTable from '../../components/AggridTable';
import AlertDialog from '../../components/Alert';
import ExportData from '../../components/ExportData';
import Headtitle from '../../components/Headtitle';
import MessageAlert from '../../components/MessageAlert';
import PageHeading from '../../components/PageHeading';
import CircularProgress from '@mui/material/CircularProgress';
import { getCurrentServerTime } from '../../components/getCurrentServerTime';
const Input = styled(MuiInput)(({ theme }) => ({
  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
    display: 'none !important',
  },
  '& input[type=number]': {
    MozAppearance: 'textfield',
  },
}));

const LoadingBackdrop = ({ open }) => {
  return (
    <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }} open={open}>
      <div className="pulsating-circle">
        <CircularProgress color="inherit" className="loading-spinner" />
      </div>
      <Typography variant="h6" sx={{ marginLeft: 2, color: '#fff', fontWeight: 'bold' }}>
        Please Wait...
      </Typography>
    </Backdrop>
  );
};

const CustomApprovalDialog = ({ open, handleClose, eligibleUsers, eligibleUsersLevel }) => {
  const formattedNames = eligibleUsers?.map((name, i) => `${i + 1}. ${name}`)?.join('\n');

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Eligible Approvers</DialogTitle>
      <DialogContent>
        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: 16 }}>
          {eligibleUsers?.length === 1
            ? `${formattedNames} - ${eligibleUsersLevel} supervisor is available today. Can't able to approve at the moment`
            : `${formattedNames}\n\n - ${eligibleUsersLevel} supervisors are available today. Can't able to approve at the moment`}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function HierarchyDiabledUsersList() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNew, setIsLoadingNew] = useState(false);
  const [serverTime, setServerTime] = useState(null);
  const [meetingArray, setMeetingArray] = useState([]);
  const [DisableLevelDropdown, setDisableLevelDropdown] = useState(false)
  var today = new Date(serverTime);
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;
  const [filterUser, setFilterUser] = useState({ fromdate: today, todate: today });
  useEffect(() => {
    const fetchTime = async () => {
      const time = await getCurrentServerTime();
      setServerTime(time);
      setFilterUser({ ...filterUser, fromdate: moment(time).format('YYYY-MM-DD'), todate: moment(time).format('YYYY-MM-DD') });
    };

    fetchTime();
  }, []);
  const [selectedMode, setSelectedMode] = useState('Today');
  const modeDropDowns = [
    { label: 'My Hierarchy List', value: 'myhierarchy' },
    { label: 'All Hierarchy List', value: 'allhierarchy' },
    { label: 'My + All Hierarchy List', value: 'myallhierarchy' },
  ];
  const sectorDropDowns = [
    { label: 'Primary', value: 'Primary' },
    { label: 'Secondary', value: 'Secondary' },
    { label: 'Tertiary', value: 'Tertiary' },
    { label: 'All', value: 'all' },
  ];
  const [modeselection, setModeSelection] = useState({ label: 'My Hierarchy List', value: 'myhierarchy' });
  const [sectorSelection, setSectorSelection] = useState({ label: 'Primary', value: 'Primary' });

  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const gridRefTableImg = useRef(null);

  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState('');
  const [popupSeverityMalert, setPopupSeverityMalert] = useState('');
  const handleClickOpenPopupMalert = () => {
    setOpenPopupMalert(true);
    setIsLoading(false);
  };
  const handleClosePopupMalert = () => {
    setOpenPopupMalert(false);
    setIsLoading(false);
  };

  const handleclear = (e) => {
    e.preventDefault();
    setFilterState({
      type: 'Individual',
    });
    setSelectedMode('Today');
    setFilterUser({ fromdate: today, todate: today });
    setFilteredRowData([]);
    setFilteredChanges(null);
    setDisableLevelDropdown(false);
    setSelectedOptionsEmployee([]);
    setValueCompanyCat([]);
    setSelectedOptionsCompany([]);
    setValueBranchCat([]);
    setSelectedOptionsBranch([]);
    setValueUnitCat([]);
    setSelectedOptionsUnit([]);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
    setMeetingArray([]);
    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
    setEmployees([]);
    setLoader(false);
  };
  const [openPopup, setOpenPopup] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [popupSeverity, setPopupSeverity] = useState('');
  const handleClickOpenPopup = () => {
    setOpenPopup(true);
    setIsLoading(false);
  };
  const handleClosePopup = () => {
    setOpenPopup(false);
    setIsLoading(false);
  };
  const navigate = useNavigate();

  let exportColumnNames = ['Account Type', 'Employment Type', 'Name', 'Username', 'Password', 'Company', 'Branch', 'Unit', 'Team'];
  let exportRowValues = ['accountstatus', 'workmode', 'companyname', 'username', 'originalpassword', 'company', 'branch', 'unit', 'team'];

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteData, setDeleteData] = useState(false);
  //Delete model
  const handleClickOpenDelete = () => {
    setIsDeleteOpen(true);
  };
  const handleClickCloseDelete = () => {
    setIsDeleteOpen(false);
  };

  const enableUserOne = async (username) => {
    setPageName(!pageName);
    setIsLoadingNew(true);
    try {
      let res = await axios.post(
        SERVICE.ENABLEDOMAINUSER,
        {
          username: username,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      fetchRocketChatUsers();
      setIsLoadingNew(false);
    } catch (err) {
      setIsLoadingNew(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const disableUserOne = async (username) => {
    setPageName(!pageName);
    setIsLoadingNew(true);
    try {
      let res = await axios.post(
        SERVICE.DISABLEDOMAINUSER,
        {
          username: username,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      fetchRocketChatUsers();
      setIsLoadingNew(false);
    } catch (err) {
      setIsLoadingNew(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //Add model...
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addDetails, setAddDetails] = useState({
    rocketchatname: '',
    rocketchatusername: '',
    password: '',
    showpassword: false,
    rocketchatemail: '',
    rocketchatroles: [],
  });
  const handleClickOpenAdd = () => {
    setIsAddOpen(true);
  };
  const handleClickCloseAdd = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setIsAddOpen(false);
  };
  //Edit model...
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDetails, setEditDetails] = useState({});
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setIsEditOpen(false);
  };

  const deleteFunction = async () => {
    setPageName(!pageName);
    try {
      setIsLoading(true);
      await axios.post(`${SERVICE.DELETE_ROCKETCHAT_USER}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        userid: deleteData?.id,
        employeeid: deleteData?.employeeid || null,
      });
      handleClickCloseDelete();
      setSelectedRows([]);
      setPage(1);
      setFilteredChanges(null);
      setFilteredRowData([]);
      await fetchRocketChatUsers();
      setPopupContent('Deleted Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      handleClickCloseDelete();
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // view model
  const [openview, setOpenview] = useState(false);
  const [viewDetails, setViewDetails] = useState({});

  const handleClickOpenview = () => {
    setOpenview(true);
  };

  const handleCloseview = () => {
    setOpenview(false);
  };

  const [employees, setEmployees] = useState([]);
  const [employeesOverall, setEmployeesoverall] = useState([]);
  const [isManualUser, setIsManualUser] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState('Employee');
  const [searchQuery, setSearchQuery] = useState('');
  const { isUserRoleAccess, isUserRoleCompare, isAssignBranch, allUnit, allTeam, allCompany, allBranchs, pageName, setPageName, buttonStyles, allUsersData, alldesignation } = useContext(UserRoleAccessContext);

  const accessbranch = isUserRoleAccess?.role?.includes('Manager')
    ? isAssignBranch?.map((data) => ({
      branch: data.branch,
      company: data.company,
      unit: data.unit,
    }))
    : isAssignBranch
      ?.filter((data) => {
        let fetfinalurl = [];

        if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0 && data?.mainpagenameurl?.length !== 0 && data?.subpagenameurl?.length !== 0 && data?.subsubpagenameurl?.length !== 0) {
          fetfinalurl = data.subsubpagenameurl;
        } else if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0 && data?.mainpagenameurl?.length !== 0 && data?.subpagenameurl?.length !== 0) {
          fetfinalurl = data.subpagenameurl;
        } else if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0 && data?.mainpagenameurl?.length !== 0) {
          fetfinalurl = data.mainpagenameurl;
        } else if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0) {
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
      pagename: String('Hierarchy Disabled Users List'),
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
  const [rocketChatRolesOptions, setRocketChatRolesOptions] = useState([]);
  const fetchRockeChatRoles = async () => {
    try {
      let response = await axios.get(SERVICE.GET_ROCKETCHAT_ROLES, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setRocketChatRolesOptions(
        response?.data?.rocketchatRoles?.map((data) => ({
          value: data?._id,
          label: data?._id,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleRocketchatRoleChange = (options) => {
    setEditDetails((prev) => ({ ...prev, rocketchatroles: options }));
  };

  const customValueRendererRocketchatRole = (valueRocketchatTeamCat, _categoryname) => {
    return valueRocketchatTeamCat?.length ? valueRocketchatTeamCat.map(({ label }) => label)?.join(', ') : 'Please Select Role';
  };
  const handleRocketchatRoleChangeAdd = (options) => {
    setAddDetails((prev) => ({ ...prev, rocketchatroles: options }));
  };

  const customValueRendererRocketchatRoleAdd = (valueRocketchatTeamCat, _categoryname) => {
    return valueRocketchatTeamCat?.length ? valueRocketchatTeamCat.map(({ label }) => label)?.join(', ') : 'Please Select Role';
  };
  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ''; // This is required for Chrome support
  };

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
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
  const [searchQueryManage, setSearchQueryManage] = useState('');

  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage
        .toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, 'Hierarchy Disabled Users List.png');
        })
        .catch((error) => {
          console.error('dom-to-image error: ', error);
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
    setSearchQueryManage('');
  };

  // Copied fields Name
  const handleCopy = (message) => {
    NotificationManager.success(`${message} 👍`, '', 2000);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const getRowClassName = (params) => {
    if (selectedRows.includes(params.row.id)) {
      return 'custom-id-row'; // This is the custom class for rows with item.tat === 'ago'
    }
    return ''; // Return an empty string for other rows
  };

  // Function to render the status with icons and buttons
  const renderAccountStatus = (status) => {
    const iconProps = {
      size: 'small',
      style: { marginRight: 4 },
    };

    let icon = <InfoIcon {...iconProps} />;
    let color = '#ccc'; // Default gray

    switch (status) {
      case 'linked':
        icon = <CheckCircleIcon {...iconProps} />;
        color = '#4caf50'; // Green
        break;
      case 'notlinked':
        icon = <ErrorIcon {...iconProps} />;
        color = '#ff9800'; // Orange
        break;
      case 'mismatched':
        icon = <WarningIcon {...iconProps} />;
        color = '#f44336'; // Red
        break;
      default:
        icon = <InfoIcon {...iconProps} />;
        color = '#ccc'; // Default gray
    }

    return (
      <Tooltip title={status} arrow>
        <Button
          variant="contained"
          startIcon={icon}
          sx={{
            fontSize: '0.75rem',
            padding: '2px 6px',
            cursor: 'default',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '150px',
            minWidth: '100px',
            display: 'flex',
            justifyContent: 'flex-start',
            backgroundColor: color,
            '&:hover': {
              backgroundColor: color,
              overflow: 'visible',
              whiteSpace: 'normal',
              maxWidth: 'none',
            },
          }}
          disableElevation
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.7rem',
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
      size: 'small',
      style: { marginRight: 4 },
    };

    let icon = <InfoIcon {...iconProps} />;
    let color = '#ccc'; // Default gray

    switch (status.toLowerCase()) {
      case 'online':
        icon = <CheckCircleIcon {...iconProps} />;
        color = '#4caf50'; // Green
        break;
      case 'offline':
        icon = <DoNotDisturbIcon {...iconProps} />;
        color = '#9e9e9e'; // Gray
        break;
      case 'away':
        icon = <HourglassEmptyIcon {...iconProps} />;
        color = '#ff9800'; // Orange
        break;
      case 'busy':
        icon = <ErrorIcon {...iconProps} />;
        color = '#f44336'; // Red
        break;
      default: // Custom or undefined status
        icon = <HelpOutlineIcon {...iconProps} />;
        color = '#00acc1'; // Cyan for custom status
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
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
      size: 'small',
      style: { marginRight: 4 },
    };

    let icon = <InfoIcon {...iconProps} />;
    let color = '#ccc'; // Default color

    switch (who) {
      case 'Employee':
        icon = <WorkIcon {...iconProps} />;
        color = '#1976d2'; // Blue
        break;
      case 'Internship':
        icon = <SchoolIcon {...iconProps} />;
        color = '#4caf50'; // Green
        break;
      default:
        icon = <InfoIcon {...iconProps} />;
        color = '#ccc'; // Default gray
    }

    return (
      <Tooltip title={who} arrow>
        <Button
          variant="contained"
          startIcon={icon}
          sx={{
            fontSize: '0.75rem',
            padding: '2px 6px',
            cursor: 'default',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '150px',
            minWidth: '100px',
            display: 'flex',
            justifyContent: 'flex-start',
            backgroundColor: color,
            '&:hover': {
              backgroundColor: color,
              overflow: 'visible',
              whiteSpace: 'normal',
              maxWidth: 'none',
            },
          }}
          disableElevation
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.7rem',
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
      size: 'small',
      style: { marginRight: 4 },
    };

    let icon = <InfoIcon {...iconProps} />;
    let color = '#ccc'; // Default color

    switch (status) {
      case 'Active':
        icon = <CheckCircleIcon {...iconProps} />; // Icon for "Active"
        color = '#4caf50'; // Green
        break;
      case 'Pending':
        icon = <HourglassEmptyIcon {...iconProps} />; // Icon for "Pending"
        color = '#ff9800'; // Orange
        break;
      case 'Deactivated':
        icon = <BlockIcon {...iconProps} />; // Icon for "Deactivated"
        color = '#f44336'; // Red
        break;
      default:
        icon = <InfoIcon {...iconProps} />;
        color = '#ccc'; // Default gray
    }

    return (
      <Tooltip title={status} arrow>
        <Button
          variant="contained"
          startIcon={icon}
          sx={{
            fontSize: '0.75rem',
            padding: '2px 6px',
            cursor: 'default',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '150px',
            minWidth: '100px',
            display: 'flex',
            justifyContent: 'flex-start',
            backgroundColor: color,
            '&:hover': {
              backgroundColor: color,
              overflow: 'visible',
              whiteSpace: 'normal',
              maxWidth: 'none',
            },
          }}
          disableElevation
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.7rem',
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
    accountstatus: true,
    username: true,
    rocketchatstatus: true,
    workmode: true,
    rocketchatname: true,
    rocketchatusername: true,
    password: true,
    rocketchatroles: true,
    rocketchatemail: true,
    company: true,
    branch: true,
    unit: true,
    team: true,
    department: true,
    designation: true,
    employeename: true,
    employeecode: true,
    employeementtype: true,
    accounttype: true,
    companyname: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };
  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };

  const [fileFormat, setFormat] = useState('');

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Hierarchy Disabled Users List',
    pageStyle: 'print',
  });

  //table entries ..,.
  const [items, setItems] = useState([]);

  const addSerialNumber = (data) => {
    setItems(data);
  };

  useEffect(() => {
    addSerialNumber(employees);
  }, [employees]);

  const [searchedString, setSearchedString] = useState('');
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
  const searchTerms = searchQuery.toLowerCase().split(' ');
  // Modify the filtering logic to check each term
  const filteredDatas = items?.filter((item) => {
    return searchTerms.every((term) => Object.values(item).join(' ').toLowerCase().includes(term));
  });

  const filteredData = filteredDatas?.slice((page - 1) * pageSize, page * pageSize);

  const totalPages = Math.ceil(filteredDatas?.length / pageSize);

  const visiblePages = Math.min(totalPages, 3);

  const firstVisiblePage = Math.max(1, page - 1);
  const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPages);

  const pageNumbers = [];

  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }

  const [selectAllChecked, setSelectAllChecked] = useState(false);

  let cuurrentDate = moment().format('DD-MM-YYYY');
  const tomorrow = moment().add(1, 'days').format('DD-MM-YYYY');
  const dayAfterTomorrow = moment().add(2, 'days').format('DD-MM-YYYY');

  // Create an array of dates
  const dateArray = [cuurrentDate, tomorrow, dayAfterTomorrow];

  const columnDataTable = [
    {
      field: 'serialNumber',
      headerName: 'SNo',
      flex: 0,
      width: 75,
      hide: !columnVisibility.serialNumber,
      headerClassName: 'bold-header',
      pinned: 'left',
    },

    {
      field: 'accounttype',
      headerName: 'Account Type',
      flex: 0,
      width: 180,
      minHeight: '40px',
      //   cellStyle: {
      //     display: "flex",
      //     justifyContent: "center",
      //     alignItems: "center",
      //   },
      //   cellRenderer: (params) =>
      //     renderAccountStatus(params?.data.accounttype),
      hide: !columnVisibility.accounttype,
      pinned: 'left',
    },
    {
      field: 'employeementtype',
      headerName: 'Employeement Type',
      flex: 0,
      width: 180,
      minHeight: '40px',
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params) => renderWho(params?.data?.employeementtype),
      hide: !columnVisibility.employeementtype,
      pinned: 'left',
    },
    {
      field: 'companyname',
      headerName: 'Employee Name',
      flex: 0,
      width: 250,
      minHeight: '40px',
      // cellStyle: {
      //   display: "flex",
      //   justifyContent: "center",
      //   alignItems: "center",
      // },
      hide: !columnVisibility.companyname,
    },
    {
      field: 'username',
      headerName: 'Username',
      flex: 0,
      width: 150,
      minHeight: '40px',
      // cellStyle: {
      //   display: "flex",
      //   justifyContent: "center",
      //   alignItems: "center",
      // },
      hide: !columnVisibility.username,
    },
    {
      field: 'password',
      headerName: 'Password',
      flex: 0,
      width: 200,
      hide: !columnVisibility.password,
      headerClassName: 'bold-header',
    },
    {
      field: 'company',
      headerName: 'Company',
      flex: 0,
      width: 200,
      hide: !columnVisibility.company,
      headerClassName: 'bold-header',
    },
    {
      field: 'branch',
      headerName: 'Branch',
      flex: 0,
      width: 180,
      hide: !columnVisibility.branch,
      headerClassName: 'bold-header',
    },
    {
      field: 'unit',
      headerName: 'Unit',
      flex: 0,
      width: 200,
      hide: !columnVisibility.unit,
      headerClassName: 'bold-header',
    },
    {
      field: 'team',
      headerName: 'Team',
      flex: 0,
      width: 150,
      hide: !columnVisibility.team,
      headerClassName: 'bold-header',
    },

    {
      field: 'actions',
      headerName: 'Action',
      flex: 0,
      width: 400,
      minHeight: '40px !important',
      sortable: false,
      hide: !columnVisibility.actions,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },

      cellRenderer: (params) => (
        <Grid sx={{ display: 'flex' }}>
          {isUserRoleCompare?.includes('ehierarchydisableduserslist') &&
            (params?.data?.isDisabled ? (
              <>
                <Button
                  color="success"
                  sx={userStyle.buttonedit}
                  variant="contained"
                  onClick={() => {
                    fetchFilteredUsersStatus(params.data, "first")
                    // enableUserOne(params?.data?.username);
                  }}
                >
                  Enable User
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="error"
                  variant="contained"
                  onClick={() => {
                    fetchFilteredUsersStatus(params.data, "second")
                    // disableUserOne(params?.data?.username);
                  }}
                >
                  Disable User
                </Button>
              </>
            ))}
          {/* {isUserRoleCompare?.includes("dlockeduserslist") && (
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
          )} */}
          {isUserRoleCompare?.includes('vhierarchydisableduserslist') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                setViewDetails(params?.data);
                handleClickOpenview();
              }}
            >
              <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />
            </Button>
          )}
        </Grid>
      ),
    },
  ];

  const rowDataTable = filteredData?.map((item, index) => {
    return {
      ...item,
      password: item?.password,
      accounttype: item?.accounttype,
    };
  });


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

  function canClickButton(currentUsername, hierarchy, attendance) {
    const priorityOrder = ['Primary', 'Secondary', 'Tertiary'];

    // 1. Find user's level
    let userLevel = null;
    for (const level of priorityOrder) {
      if (hierarchy[level]?.includes(currentUsername)) {
        userLevel = level;
        break;
      }
    }

    // 2. Prepare all active users
    const activeUsers = attendance
      .filter(user => user.status === true)
      .map(user => user.username);

    // 3. Find the top-most level that has at least one active user
    let eligibleLevel = null;
    for (const level of priorityOrder) {
      const usersAtLevel = hierarchy[level] || [];
      const isActive = usersAtLevel.some(user => activeUsers.includes(user));
      if (isActive) {
        eligibleLevel = level;
        break;
      }
    }

    // 4. If no one is active at any level, return false
    if (!eligibleLevel) {
      return {
        canClick: false,
        username: currentUsername,
        level: userLevel,
        eligibleUsers: [],
        eligibleUsersLevel: null
      };
    }

    const eligibleUsers = (hierarchy[eligibleLevel] || []).filter(user =>
      activeUsers.includes(user)
    );

    // 5. Only allow users in the top-most active level
    const canClick = eligibleLevel === userLevel && eligibleUsers.includes(currentUsername);

    return {
      canClick,
      username: currentUsername,
      level: userLevel,
      eligibleUsers,
      eligibleUsersLevel: eligibleLevel
    };
  }
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [eligibleUsersLevel, setEligibleUsersLevel] = useState(null);
  const handleShowDialog = (users, level) => {
    setEligibleUsers(users);
    setEligibleUsersLevel(level);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  const fetchFilteredUsersStatus = async (user, page) => {
    setPageName(!pageName)
    const montharray = getMonthsInRange(filterUser.fromdate, filterUser.todate);
    try {

      let response = await axios.post(SERVICE.GET_HIERARCHY_BASED_EMPLOYEE_NAMEFIND, {
        companyname: user?.companyname,
        empcode: user?.empcode
      }, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        }
      });

      const ManagerAccess = isUserRoleAccess?.role?.some(data => data?.toLowerCase() === "manager")

      if (ManagerAccess) {
        // handleClickOpenEdit()
        if (page === "first") {
          enableUserOne(user?.username)
        }
        else if (page === "second") {
          disableUserOne(user?.username)
        }
      } else {
        console.log(response?.data, filterUser.fromdate, filterUser.todate, montharray, "response")
        const hierarchy = response?.data?.hierarchydata; // assuming { Primary: [...], Secondary: [...], Tertiary: [...] }
        const allUsernames = [...new Set([
          ...(hierarchy?.Primary || []),
          ...(hierarchy?.Secondary || []),
          ...(hierarchy?.Tertiary || [])
        ])];

        if (allUsernames?.length > 0) {
          // 2. Loop through usernames and call the Clock In/Out API for each
          const results = [];

          for (const username of allUsernames) {
            try {
              const res = await axios.post(
                SERVICE.USER_CLOCKIN_CLOCKOUT_STATUS_ATT_MODE_BASED_FILTER,
                {
                  employee: username,
                  fromdate: filterUser.fromdate,
                  todate: filterUser.todate,
                  montharray: [...montharray],
                },
                {
                  headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                  },
                }
              );

              const dataCheck = res?.data?.finaluser?.find(
                item => item?.finalDate === filterUser.fromdate
              );

              results.push({
                username,
                data: dataCheck,
                status: !(dataCheck?.clockout === "00:00:00" && dataCheck?.clockin === "00:00:00")
              });

            } catch (err) {
              results.push({
                username,
                error: true,
                message: err.message
              });
            }
          }

          if (results?.length === allUsernames?.length) {
            const allowClick = canClickButton(isUserRoleAccess?.companyname, hierarchy, results);
            if (allowClick?.canClick) {
              if (page === "first") {
                enableUserOne(user?.username)
              }
              else if (page === "second") {
                disableUserOne(user?.username)
              }
            }
            else {
              const users = allowClick?.eligibleUsers || [];
              const level = allowClick?.eligibleUsersLevel;
              if (users.length > 0) {
                handleShowDialog(users, level);
              } else {
                setPopupContentMalert("No eligible users to approve.");
                setPopupSeverityMalert("error");
                handleClickOpenPopupMalert();
              }

            }
            console.log("Final Results Per Supervisor:", results, allowClick);
          }
        }
        else {
          if (page === "first") {
            enableUserOne(user?.username)
          }
          else if (page === "second") {
            disableUserOne(user?.username)
          }
        }

      }
      // 3. Use the `results` array as needed

    } catch (err) { setLoader(true); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

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
  const filteredColumns = columnDataTable?.filter((column) => column.headerName.toLowerCase().includes(searchQueryManage.toLowerCase()));

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
        padding: '10px',
        minWidth: '325px',
        '& .MuiDialogContent-root': { padding: '10px 0' },
      }}
    >
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
          {filteredColumns?.map((column) => (
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

  const [btnLoading, setBtnloading] = useState('');
  const [manulUpdate, setManualUpdate] = useState('');

  function isValidEmail(email) {
    // Regular expression for a simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  const editSubmit = (e) => {
    e.preventDefault();

    const isNameMatch = employees?.filter((item) => item?.id !== editDetails.id)?.some((item) => item.rocketchatusername?.trim().toLowerCase() === editDetails.rocketchatusername?.trim().toLowerCase());
    if (isNameMatch) {
      setPopupContentMalert('User Already Exist!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (editDetails.rocketchatname?.trim() === '') {
      setPopupContentMalert('Please Enter Name!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (editDetails.rocketchatusername?.trim() === '') {
      setPopupContentMalert('Please Enter Username!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (editDetails.password !== '' && editDetails.password?.length < 6) {
      setPopupContentMalert('Password must be atleast 6 characters long!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (editDetails.rocketchatemail === '') {
      setPopupContentMalert('Please Enter Email!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (editDetails.rocketchatemail !== '' && !isValidEmail(editDetails.rocketchatemail)) {
      setPopupContentMalert('Please Enter Valid Email!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (editDetails.rocketchatroles.length === 0) {
      setPopupContentMalert('Please Select Roles!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      sendEditRequest();
    }
  };
  const handleSubmitOld = (e) => {
    e.preventDefault();

    const isNameMatch = employees?.some((item) => item.rocketchatusername?.trim().toLowerCase() === addDetails.rocketchatusername?.trim().toLowerCase());
    if (isNameMatch) {
      setPopupContentMalert('User Already Exist!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (addDetails.rocketchatname?.trim() === '') {
      setPopupContentMalert('Please Enter Name!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (addDetails.rocketchatusername?.trim() === '') {
      setPopupContentMalert('Please Enter Username!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (addDetails.password === '') {
      setPopupContentMalert('Please Enter Password!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (addDetails.password !== '' && addDetails.password?.length < 6) {
      setPopupContentMalert('Password must be atleast 6 characters long!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (addDetails.rocketchatemail === '') {
      setPopupContentMalert('Please Enter Email!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (addDetails.rocketchatemail !== '' && !isValidEmail(addDetails.rocketchatemail)) {
      setPopupContentMalert('Please Enter Valid Email!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (addDetails.rocketchatroles.length === 0) {
      setPopupContentMalert('Please Select Roles!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      sendRequest();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    sendRequest();
  };

  const sendRequest = async () => {
    setPageName(!pageName);
    try {
      setIsLoadingNew(true);
      const response = await axios.post(SERVICE.HIERARCHYBASEDDISABLEDUSERSLIST, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        hierachy: modeselection.value,
        sector: sectorSelection.value,
        username: isUserRoleAccess.companyname,
        team: isUserRoleAccess.team,
        pagename: 'menuhierarchydisableduserslist',
        role: isUserRoleAccess.role,
      });

      setDisableLevelDropdown(response?.data?.DataAccessMode)
      if (!response?.data?.DataAccessMode && response?.data?.resultedTeam?.length > 0 && response?.data?.resultAccessFilter?.length < 1 && ['myallhierarchy', 'allhierarchy']?.includes(modeselection.value)) {
        alert('Some employees have not been given access to this page.');
        setLoader(false);
        setIsLoadingNew(false);
      }
      const itemsWithSerialNumber = response?.data?.resultAccessFilter.map((item, index) => ({
        ...item,
        serialNumber: index + 1,
        id: item._id,
        password: item?.originalpassword,
        accounttype: item?.accountstatus,
      }));
      setEmployees(itemsWithSerialNumber);
      setIsLoadingNew(false);
    } catch (err) {
      setIsLoadingNew(false);
      console.log('Error Response:', err.response);
      let error = err.response?.data?.message;
      if (error) {
        setPopupContentMalert(error);
        setPopupSeverityMalert('error');
        handleClickOpenPopupMalert();
      } else {
        handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
      }
    }
  };
  const sendEditRequest = async () => {
    setPageName(!pageName);

    try {
      setIsLoading(true);
      let res = await axios.put(
        `${SERVICE.UPDATE_ROCKETCHAT_USER_DETAILS}`,
        {
          id: String(editDetails.id),
          name: editDetails.rocketchatname,
          username: editDetails.rocketchatusername,
          password: editDetails.password === '' ? null : editDetails.password,
          email: editDetails.rocketchatemail,
          employeeid: editDetails?.employeeid || null,
          roles: editDetails.rocketchatroles?.map((item) => item.value),
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setFilteredChanges(null);
      setFilteredRowData([]);
      await fetchRocketChatUsers();
      handleCloseModEdit();
      setPopupContent('Updated Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.log('Error Response:', err.response);
      let error = err.response?.data?.message;
      if (error) {
        setPopupContentMalert(error);
        setPopupSeverityMalert('error');
        handleClickOpenPopupMalert();
      } else {
        handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
      }
    }
  };

  const deactivateRocketChatAccount = async (rowData, nextstatus) => {
    setPageName(!pageName);
    try {
      setIsLoading(true);

      await axios.post(
        `${SERVICE.ACTIVESTATUS_ROCKETCHAT_USER}`,
        {
          roccketchatUserId: rowData?.id,
          activeStatus: true,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );

      if (rowData?.accountstatus === 'linked') {
        await handleMergeAccount(rowData, nextstatus);
      } else {
        setPopupContent(`User Activated Successfully`);
        setPopupSeverity('success');
        handleClickOpenPopup();
      }
    } catch (err) {
      setIsLoading(false);
      console.log('Error Response:', err.response);
      let error = err.response?.data?.message;
      if (error) {
        setPopupContentMalert(error);
        setPopupSeverityMalert('error');
        handleClickOpenPopupMalert();
      } else {
        handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
      }
    }
  };

  //submit option for saving

  const handleMergeAccount = async (rowData, from) => {
    let successMessage = from === 'merge' ? 'Merged' : from === 'sync' ? 'Synced' : from === 'activate' ? 'Activated' : 'Synced';
    setPageName(!pageName);
    try {
      setIsLoading(true);
      let res = await axios.post(
        `${SERVICE.MERGE_ROCKETCHAT_ACCOUNT}`,
        {
          rocketchatUserId: rowData?.id,
          employeeid: rowData?.employeeid,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setFilteredChanges(null);
      setFilteredRowData([]);
      await fetchRocketChatUsers();
      handleCloseModEdit();
      setPopupContent(`User ${successMessage} Successfully`);
      setPopupSeverity('success');
      handleClickOpenPopup();
      handleClickCloseAdd();
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.log('Error Response:', err.response);
      let error = err.response?.data?.message;
      if (error) {
        setPopupContentMalert(error);
        setPopupSeverityMalert('error');
        handleClickOpenPopupMalert();
      } else {
        handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
      }
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    setSelectedOptionsBranch([]);
    setSelectedOptionsUnit([]);
    setSelectedOptionsTeam([]);
    setSelectedOptionsCompany([]);
    setValueCompanyCat([]);
    setValueBranchCat([]);
    setValueUnitCat([]);
    setValueTeamCat([]);
    setEmployees([]);
    setIsManualUser([]);
    setChecked(false);
    setSelectedUserType('Employee');
    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
  };

  const [isEditOpenCheckList, setIsEditOpenCheckList] = useState(false);
  const handleClickOpenEditCheckList = () => {
    setIsEditOpenCheckList(true);
  };
  const handleCloseModEditCheckList = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setIsEditOpenCheckList(false);
  };

  //webcam

  //add webcamera popup

  //------------------------------------------------------------------------------------------------------------

  //FILTER START
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
      setDepartmentOptions(
        req?.data?.departmentdetails?.map((data) => ({
          label: data?.deptname,
          value: data?.deptname,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [filterState, setFilterState] = useState({
    type: 'Individual',
    employeestatus: 'Please Select Employee Status',
  });
  const EmployeeStatusOptions = [
    { label: 'Live Employee', value: 'Live Employee' },
    { label: 'Releave Employee', value: 'Releave Employee' },
    { label: 'Absconded', value: 'Absconded' },
    { label: 'Hold', value: 'Hold' },
    { label: 'Terminate', value: 'Terminate' },
  ];
  const TypeOptions = [
    { label: 'Individual', value: 'Individual' },
    { label: 'Company', value: 'Company' },
    { label: 'Branch', value: 'Branch' },
    { label: 'Unit', value: 'Unit' },
    { label: 'Team', value: 'Team' },
  ];

  //MULTISELECT ONCHANGE START
  const employemnetTypeOptions = [
    { label: 'Employee', value: 'Employee' },
    { label: 'Internship', value: 'Internship' },
  ];

  //Employement Type  multiselect
  const [selectedOptionsEmployementType, setSelectedOptionsEmployementType] = useState(employemnetTypeOptions);
  let [valueEmployementTypeCat, setValueEmployementTypeCat] = useState(['Employee', 'Internship']);

  const handleEmployementTypeChange = (options) => {
    setValueEmployementTypeCat(
      options?.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsEmployementType(options);
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };

  const customValueRendererEmployementType = (valueEmployementTypeCat, _categoryname) => {
    return valueEmployementTypeCat?.length ? valueEmployementTypeCat?.map(({ label }) => label)?.join(', ') : 'Please Select Employement Type';
  };
  //Account Type   multiselect

  const accountStatusOptions = [
    { label: 'Disabled', value: 'Disabled' },
    { label: 'Enabled', value: 'Enabled' },
  ];
  const [selectedOptionsAccountStatus, setSelectedOptionsAccountStatus] = useState([
    { label: 'Disabled', value: 'Disabled' },
    { label: 'Enabled', value: 'Enabled' },
  ]);
  let [valueAccountStatusCat, setValueAccountStatusCat] = useState([
    'Disabled',
    'Enabled',
    // "Mismatched",
  ]);

  const handleAccountStatusChange = (options) => {
    let arrayString = options?.map((a, index) => {
      return a.value;
    });

    setValueAccountStatusCat(arrayString);
    setSelectedOptionsAccountStatus(options);
    if (arrayString?.includes('Mismatched')) {
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
      setValueDesignationCat([]);
      setSelectedOptionsDesignation([]);
      setValueEmployeeCat([]);
      setSelectedOptionsEmployee([]);
      setFilterState((prev) => ({
        ...prev,
        type: 'Mismatched',
      }));
      setSelectedOptionsEmployementType(employemnetTypeOptions);
      setValueEmployementTypeCat(['Employee', 'Internship']);
    } else {
      setFilterState((prev) => ({
        ...prev,
        type: 'Individual',
      }));
    }
  };

  const customValueRendererAccountStatus = (valueAccountStatusCat, _categoryname) => {
    return valueAccountStatusCat?.length ? valueAccountStatusCat?.map(({ label }) => label)?.join(', ') : 'Please Select Account Type';
  };
  // Status   multiselect

  const statusOptions = [
    { label: 'Online', value: 'Online' },
    { label: 'Offline', value: 'Offline' },
    { label: 'Away', value: 'Away' },
    { label: 'Busy', value: 'Busy' },
  ];

  const [selectedOptionsStatus, setSelectedOptionsStatus] = useState(statusOptions);
  let [valueStatusCat, setValueStatusCat] = useState(['Online', 'Offline', 'Away', 'Busy']);

  const handleStatusChange = (options) => {
    setValueStatusCat(
      options?.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsStatus(options);
  };

  const customValueRendererStatus = (valueStatusCat, _categoryname) => {
    return valueStatusCat?.length ? valueStatusCat?.map(({ label }) => label)?.join(', ') : 'Please Select Status';
  };
  //Registration Status   multiselect

  const RegistrationStatusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Deactivated', value: 'Deactivated' },
  ];

  const [selectedOptionsRegistrationStatus, setSelectedOptionsRegistrationStatus] = useState(RegistrationStatusOptions);
  let [valueRegistrationStatusCat, setValueRegistrationStatusCat] = useState(['Active', 'Pending', 'Deactivated']);

  const handleRegistrationStatusChange = (options) => {
    setValueRegistrationStatusCat(
      options?.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsRegistrationStatus(options);
  };

  const customValueRendererRegistrationStatus = (valueRegistrationStatusCat, _categoryname) => {
    return valueRegistrationStatusCat?.length ? valueRegistrationStatusCat?.map(({ label }) => label)?.join(', ') : 'Please Select Registration Status';
  };
  //company multiselect
  const [selectedOptionsCompany, setSelectedOptionsCompany] = useState([]);
  let [valueCompanyCat, setValueCompanyCat] = useState([]);

  const handleCompanyChange = (options) => {
    setValueCompanyCat(
      options?.map((a, index) => {
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
  };

  const customValueRendererCompany = (valueCompanyCat, _categoryname) => {
    return valueCompanyCat?.length ? valueCompanyCat?.map(({ label }) => label)?.join(', ') : 'Please Select Company';
  };

  //branch multiselect
  const [selectedOptionsBranch, setSelectedOptionsBranch] = useState([]);
  let [valueBranchCat, setValueBranchCat] = useState([]);

  const handleBranchChange = (options) => {
    setValueBranchCat(
      options?.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsBranch(options);
    setValueUnitCat([]);
    setSelectedOptionsUnit([]);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
    setValueDepartmentCat([]);
    setSelectedOptionsDepartment([]);
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };

  const customValueRendererBranch = (valueBranchCat, _categoryname) => {
    return valueBranchCat?.length ? valueBranchCat?.map(({ label }) => label)?.join(', ') : 'Please Select Branch';
  };

  //unit multiselect
  const [selectedOptionsUnit, setSelectedOptionsUnit] = useState([]);
  let [valueUnitCat, setValueUnitCat] = useState([]);

  const handleUnitChange = (options) => {
    setValueUnitCat(
      options?.map((a, index) => {
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
    return valueUnitCat?.length ? valueUnitCat?.map(({ label }) => label)?.join(', ') : 'Please Select Unit';
  };

  //team multiselect
  const [selectedOptionsTeam, setSelectedOptionsTeam] = useState([]);
  let [valueTeamCat, setValueTeamCat] = useState([]);

  const handleTeamChange = (options) => {
    setValueTeamCat(
      options?.map((a, index) => {
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
    return valueTeamCat?.length ? valueTeamCat?.map(({ label }) => label)?.join(', ') : 'Please Select Team';
  };

  //department multiselect
  const [selectedOptionsDepartment, setSelectedOptionsDepartment] = useState([]);
  let [valueDepartmentCat, setValueDepartmentCat] = useState([]);

  const handleDepartmentChange = (options) => {
    setValueDepartmentCat(
      options?.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsDepartment(options);
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };

  const customValueRendererDepartment = (valueDepartmentCat, _categoryname) => {
    return valueDepartmentCat?.length ? valueDepartmentCat?.map(({ label }) => label)?.join(', ') : 'Please Select Department';
  };
  //employee multiselect
  const [selectedOptionsEmployee, setSelectedOptionsEmployee] = useState([]);
  let [valueEmployeeCat, setValueEmployeeCat] = useState([]);

  const handleEmployeeChange = (options) => {
    setValueEmployeeCat(
      options?.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsEmployee(options);
  };

  const customValueRendererEmployee = (valueEmployeeCat, _categoryname) => {
    return valueEmployeeCat?.length ? valueEmployeeCat?.map(({ label }) => label)?.join(', ') : 'Please Select Employee';
  };

  const [selectedOptionsOU, setSelectedOptionsOU] = useState([]);
  let [valueOUCat, setValueOUCat] = useState([]);

  const handleOUChange = (options) => {
    setValueOUCat(
      options?.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsOU(options);
  };

  const customValueRendererOU = (valueOUCat, _categoryname) => {
    return valueOUCat?.length ? valueOUCat?.map(({ label }) => label)?.join(', ') : 'Please Select OU';
  };

  //designation multiselect
  const [selectedOptionsDesignation, setSelectedOptionsDesignation] = useState([]);
  let [valueDesignationCat, setValueDesignationCat] = useState([]);

  const handleDesignationChange = (options) => {
    setValueDesignationCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsDesignation(options);
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };

  const customValueRendererDesignation = (valueDesignationCat, _categoryname) => {
    return valueDesignationCat?.length ? valueDesignationCat.map(({ label }) => label)?.join(', ') : 'Please Select Designation';
  };

  //MULTISELECT ONCHANGE END
  const handleClearFilter = () => {
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
    setValueDesignationCat([]);
    setSelectedOptionsDesignation([]);
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
    setValueEmployementTypeCat([]);
    setSelectedOptionsEmployementType([]);
    setValueAccountStatusCat([]);
    setSelectedOptionsAccountStatus([]);
    setValueRegistrationStatusCat([]);
    setSelectedOptionsRegistrationStatus([]);
    setValueStatusCat([]);
    setSelectedOptionsStatus([]);
    setEmployeeOptions([]);
    setEmployees([]);
    setIsManualUser([]);

    setFilterState({
      type: 'Individual',
      employeestatus: 'Please Select Employee Status',
    });

    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
  };

  const [filterLoader, setFilterLoader] = useState(false);
  const [tableLoader, setTableLoader] = useState(false);
  const handleFilter = () => {
    if (selectedOptionsEmployementType?.length === 0) {
      setPopupContentMalert('Please Select Employement Type!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (filterState?.type === 'Please Select Type' || filterState?.type === '') {
      setPopupContentMalert('Please Select Type!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedOptionsCompany?.length === 0 && !valueAccountStatusCat?.includes('Mismatched')) {
      setPopupContentMalert('Please Select Company!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    // else if (
    //   filterState?.employeestatus === "Please Select Employee Status" ||
    //   filterState?.employeestatus === ""
    // ) {
    //   setPopupContentMalert("Please Select Employee Status!");
    //   setPopupSeverityMalert("info");
    //   handleClickOpenPopupMalert();
    // }
    else if (['Individual', 'Branch', 'Unit', 'Team']?.includes(filterState?.type) && selectedOptionsBranch?.length === 0) {
      setPopupContentMalert('Please Select Branch!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (['Individual', 'Unit', 'Team']?.includes(filterState?.type) && selectedOptionsUnit?.length === 0) {
      setPopupContentMalert('Please Select Unit!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (['Individual', 'Team']?.includes(filterState?.type) && selectedOptionsTeam?.length === 0) {
      setPopupContentMalert('Please Select Team!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (filterState?.type === 'Individual' && selectedOptionsEmployee?.length === 0) {
      setPopupContentMalert('Please Select Employee!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (filterState?.type === 'Department' && selectedOptionsDepartment?.length === 0) {
      setPopupContentMalert('Please Select Department!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (filterState?.type === 'Designation' && selectedOptionsDesignation?.length === 0) {
      setPopupContentMalert('Please Select Designation!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedOptionsOU?.length === 0) {
      setPopupContentMalert('Please Select Organization Unit!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      fetchRocketChatUsers();
    }
  };

  const fetchRocketChatUsers = async () => {
    setPageName(!pageName);
    setLoader(true);
    setisBtnFilter(true);
    setFilterLoader(true);
    setTableLoader(true);
    try {
      let response = await axios.post(SERVICE.DISABLEDANDENABLEDUSERSLIST, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        type: filterState?.type,
        accounttype: valueAccountStatusCat || [],
        company: valueCompanyCat?.length > 0 ? valueCompanyCat : allAssignCompany,
        branch: valueBranchCat?.length > 0 ? valueBranchCat : allAssignBranch,
        unit: valueUnitCat?.length > 0 ? valueUnitCat : allAssignUnit,
        team: valueTeamCat || [],
        employee: valueEmployeeCat || [],
        employementtype: valueEmployementTypeCat || [],
        organizationunits: valueOUCat || [],
      });

      const itemsWithSerialNumber = response?.data?.users.map((item, index) => ({
        ...item,
        serialNumber: index + 1,
        id: item._id,
        password: item?.originalpassword,
        accounttype: item?.accountstatus,
      }));
      console.log(itemsWithSerialNumber, 'itemsWithSerialNumber');
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
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //auto select all dropdowns
  const [allAssignCompany, setAllAssignCompany] = useState([]);
  const [allAssignBranch, setAllAssignBranch] = useState([]);
  const [allAssignUnit, setAllAssignUnit] = useState([]);
  const [OUOptions, setOptionsOU] = useState([]);
  const handleAutoSelect = async () => {
    try {
      setIsLoadingNew(true);
      // let res_vendor = await axios.get(SERVICE.ALL_ORGANIZATIONALUNIT, {
      //   headers: {
      //     Authorization: `Bearer ${auth.APIToken}`,
      //   },
      // });
      let selectedValues = accessbranch
        ?.map((data) => ({
          company: data.company,
          branch: data.branch,
          unit: data.unit,
        }))
        ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit));
      let selectedCompany = selectedValues
        ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company))
        ?.map((a, index) => {
          return a.company;
        });

      let mappedCompany = selectedValues
        ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company))
        ?.map((data) => ({
          label: data?.company,
          value: data?.company,
        }));

      setValueCompanyCat(selectedCompany);
      setSelectedOptionsCompany(mappedCompany);

      let selectedBranch = selectedValues
        ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch))
        ?.map((a, index) => {
          return a.branch;
        });

      let mappedBranch = selectedValues
        ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch))
        ?.map((data) => ({
          label: data?.branch,
          value: data?.branch,
        }));

      setValueBranchCat(selectedBranch);
      setSelectedOptionsBranch(mappedBranch);

      let selectedUnit = selectedValues
        ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit))
        ?.map((a, index) => {
          return a.unit;
        });

      let mappedUnit = selectedValues
        ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit))
        ?.map((data) => ({
          label: data?.unit,
          value: data?.unit,
        }));

      setValueUnitCat(selectedUnit);
      setSelectedOptionsUnit(mappedUnit);

      let mappedTeam = allTeam
        ?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit))
        ?.map((u) => ({
          label: u.teamname,
          value: u.teamname,
        }));

      let selectedTeam = allTeam?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit))?.map((u) => u.teamname);

      let mappedemployees = allUsersData
        ?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit) && selectedTeam?.includes(u.team))
        ?.map((u) => ({
          label: u.companyname,
          value: u.companyname,
        }));

      let employees = allUsersData?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit) && selectedTeam?.includes(u.team))?.map((u) => u.companyname);

      setValueTeamCat(selectedTeam);
      setSelectedOptionsTeam(mappedTeam);
      setAllAssignCompany(selectedCompany);

      setAllAssignBranch(selectedBranch);

      setAllAssignUnit(selectedUnit);

      setValueEmployeeCat(employees);
      setSelectedOptionsEmployee(mappedemployees);

      // let finalDataNew = res_vendor?.data?.ouList?.map((item) => ({
      //   label: item?.ouName,
      //   value: item?.ouName,
      // }));
      // setOptionsOU(finalDataNew);
      // setSelectedOptionsOU(finalDataNew);

      // let ous = finalDataNew.map((item) => item.value);
      // setValueOUCat(ous);
      setIsLoadingNew(false);
    } catch (err) {
      setIsLoadingNew(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    handleAutoSelect();
  }, [isAssignBranch]);

  //FILTER END

  return (
    <Box>
      <NotificationContainer />
      <Headtitle title={'Hierarchy Disabled Users List'} />
      {/* ****** Header Content ****** */}
      <PageHeading title="Hierarchy Disabled Users List" modulename="LDAP" submodulename="Hierarchy Disabled Users List" mainpagename="" subpagename="" subsubpagename="" />
      {isUserRoleCompare?.includes('ahierarchydisableduserslist') && (
        <>
          <Box sx={userStyle.selectcontainer}>
            <>
              <Typography sx={userStyle.importheadtext}>Hierarchy Disabled Users Filter</Typography>
              <br />
              <Grid container spacing={2}>
                <Grid item lg={2} md={2.5} xs={12} sm={6}>
                  <Selects options={modeDropDowns} styles={colourStyles} isDisabled={DisableLevelDropdown} value={{ label: modeselection.label, value: modeselection.value }} onChange={(e) => setModeSelection(e)} />
                </Grid>
                <Grid item lg={2} md={2.5} xs={12} sm={6}>
                  <Selects options={sectorDropDowns} styles={colourStyles} value={{ label: sectorSelection.label, value: sectorSelection.value }} onChange={(e) => setSectorSelection(e)} />
                </Grid>

                <Grid
                  item
                  md={3}
                  xs={12}
                  sm={6}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignContent: 'end',
                    alignItems: 'end',
                  }}
                >
                  <Grid>
                    <LoadingButton
                      // loading={btnLoading}
                      sx={buttonStyles.buttonsubmit}
                      onClick={handleSubmit}
                    >
                      Filter
                    </LoadingButton>
                    &nbsp; &nbsp;
                    <Button sx={buttonStyles.btncancel} onClick={handleclear}>
                      {' '}
                      Clear{' '}
                    </Button>
                  </Grid>
                </Grid>
                <br />
                <br />
                <br />
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
              display: 'flex',
              justifyContent: 'center',
              minHeight: '350px',
            }}
          >
            <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
          </Box>
        </Box>
      ) : (
        <>
          {isUserRoleCompare?.includes('lhierarchydisableduserslist') && (
            <>
              <Box sx={userStyle.container}>
                {/* ******************************************************EXPORT Buttons****************************************************** */}
                <Grid container spacing={2}>
                  <Grid item xs={10}>
                    <Typography sx={userStyle.SubHeaderText}>Hierarchy Disabled Users List</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    {isUserRoleCompare?.includes('ahierarchydisableduserslist') && (
                      <>
                        {/* <Link
                                                    to="/interview/myinterviewchecklist"
                                                    style={{
                                                        textDecoration: "none",
                                                        color: "white",
                                                        float: "right",
                                                    }}
                                                    target="_blank"
                                                > */}
                        {/* <Button
                          variant="contained"
                          onClick={() => {
                            setAddDetails({
                              rocketchatname: "",
                              rocketchatusername: "",
                              password: "",
                              showpassword: false,
                              rocketchatemail: "",
                              rocketchatroles: [],
                            });
                            handleClickOpenAdd();
                          }}
                        >
                          ADD USER
                        </Button> */}
                        {/* </Link> */}
                      </>
                    )}
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
                        sx={{ width: '77px' }}
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
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      {isUserRoleCompare?.includes('excelhierarchydisableduserslist') && (
                        <>
                          <Button
                            onClick={(e) => {
                              setIsFilterOpen(true);
                              setFormat('xl');
                            }}
                            sx={userStyle.buttongrp}
                          >
                            <FaFileExcel />
                            &ensp;Export to Excel&ensp;
                          </Button>
                        </>
                      )}
                      {isUserRoleCompare?.includes('csvhierarchydisableduserslist') && (
                        <>
                          <Button
                            onClick={(e) => {
                              setIsFilterOpen(true);
                              setFormat('csv');
                            }}
                            sx={userStyle.buttongrp}
                          >
                            <FaFileCsv />
                            &ensp;Export to CSV&ensp;
                          </Button>
                        </>
                      )}
                      {isUserRoleCompare?.includes('printhierarchydisableduserslist') && (
                        <>
                          <Button sx={userStyle.buttongrp} onClick={handleprint}>
                            &ensp;
                            <FaPrint />
                            &ensp;Print&ensp;
                          </Button>
                        </>
                      )}
                      {isUserRoleCompare?.includes('pdfhierarchydisableduserslist') && (
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
                      {isUserRoleCompare?.includes('imagehierarchydisableduserslist') && (
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
                <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumns}>
                  Manage Columns
                </Button>
                &ensp;
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
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {manageColumnsContent}
      </Popover>

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
        itemsTwo={employees ?? []}
        filename={'Locked Users List'}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />

      {/* EXTERNAL COMPONENTS -------------- END */}

      {/* view model */}
      <Dialog open={openview} onClose={handleClickOpenview} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth={true} maxWidth="lg" sx={{ marginTop: '50px' }}>
        <Box sx={{ padding: '20px 50px' }}>
          <>
            <Typography sx={userStyle.HeaderText}> View Locked User Details</Typography>
            <br />
            <Grid container spacing={2}>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Account Type</Typography>
                  <Typography>{viewDetails.accounttype}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Employment Type</Typography>
                  <Typography>{viewDetails.workmode}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Name</Typography>
                  <Typography>{viewDetails.companyname}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Username</Typography>
                  <Typography>{viewDetails.username}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Password</Typography>
                  <Typography>{viewDetails.password}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Company</Typography>
                  <Typography>{viewDetails.company}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Branch</Typography>
                  <Typography>{viewDetails.branch}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Unit</Typography>
                  <Typography>{viewDetails.unit}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Team</Typography>
                  <Typography>{viewDetails.team}</Typography>
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br /> <br /> <br />
            <Grid container spacing={2}>
              <Button variant="contained" color="primary" onClick={handleCloseview} sx={buttonStyles.btncancel}>
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
            overflow: 'visible',
            '& .MuiPaper-root': {
              overflow: 'visible',
            },
          }}
        >
          <Box sx={{ padding: '20px 50px' }}>
            <>
              <Grid container spacing={2}>
                <Typography sx={userStyle.HeaderText}>Edit Locked User Details</Typography>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Name<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={editDetails.rocketchatname}
                      onChange={(e) => {
                        setEditDetails((prev) => ({
                          ...prev,
                          rocketchatname: e.target.value,
                        }));
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Username<b style={{ color: 'red' }}>*</b>
                    </Typography>

                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={editDetails.rocketchatusername}
                      onChange={(e) => {
                        setEditDetails((prev) => ({
                          ...prev,
                          rocketchatusername: e.target.value?.toLowerCase(),
                        }));
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Password</Typography>
                    <OutlinedInput
                      placeholder="Please Enter Password"
                      id="outlined-adornment-password"
                      type={editDetails?.showpassword ? 'text' : 'password'}
                      value={editDetails.password}
                      onChange={(e) => {
                        setEditDetails((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }));
                      }}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onMouseDown={(event) => {
                              event.preventDefault();
                            }}
                            onClick={(e) => {
                              setEditDetails((prev) => ({
                                ...prev,
                                showpassword: !editDetails?.showpassword,
                              }));
                            }}
                            edge="end"
                          >
                            {!editDetails.showpassword ? <VisibilityOff sx={{ fontSize: '25px' }} /> : <Visibility sx={{ fontSize: '25px' }} />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    <FormHelperText sx={{ color: '#6c757d' }}>Fill this field only if you want to change the password.</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Email<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined-email"
                      type="email" // Change type to "email"
                      placeholder="Please Enter Email" // Optional placeholder
                      value={editDetails.rocketchatemail} // Change field name to match email
                      onChange={(e) => {
                        setEditDetails((prev) => ({
                          ...prev,
                          rocketchatemail: e.target.value, // Update corresponding state field
                        }));
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Role<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <MultiSelect
                      options={rocketChatRolesOptions}
                      value={editDetails?.rocketchatroles}
                      onChange={(e) => {
                        handleRocketchatRoleChange(e);
                      }}
                      valueRenderer={customValueRendererRocketchatRole}
                      labelledBy="Please Select Role"
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <br /> <br />
              <Grid
                container
                spacing={2}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Grid item md={3} xs={12} sm={12}>
                  <Button variant="contained" onClick={editSubmit} sx={buttonStyles.buttonsubmit}>
                    {' '}
                    Update
                  </Button>
                </Grid>
                <br />
                <Grid item md={3} xs={12} sm={12}>
                  <Button sx={buttonStyles.btncancel} onClick={handleCloseModEdit}>
                    {' '}
                    Cancel{' '}
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>
      {/* Add DIALOG */}
      <Box>
        <Dialog
          open={isAddOpen}
          onClose={handleClickCloseAdd}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="md"
          fullWidth={true}
          sx={{
            overflow: 'visible',
            '& .MuiPaper-root': {
              overflow: 'visible',
            },
          }}
        >
          <Box sx={{ padding: '20px 50px' }}>
            <>
              <Grid container spacing={2}>
                <Typography sx={userStyle.HeaderText}>Create New Locked User</Typography>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Name<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Please Enter Name"
                      value={addDetails.rocketchatname}
                      onChange={(e) => {
                        setAddDetails((prev) => ({
                          ...prev,
                          rocketchatname: e.target.value,
                        }));
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Username<b style={{ color: 'red' }}>*</b>
                    </Typography>

                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Please Enter Username"
                      value={addDetails.rocketchatusername}
                      onChange={(e) => {
                        setAddDetails((prev) => ({
                          ...prev,
                          rocketchatusername: e.target.value?.toLowerCase(),
                        }));
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Password<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      placeholder="Please Enter Password"
                      id="outlined-adornment-password"
                      type={addDetails?.showpassword ? 'text' : 'password'}
                      value={addDetails.password}
                      onChange={(e) => {
                        setAddDetails((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }));
                      }}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onMouseDown={(event) => {
                              event.preventDefault();
                            }}
                            onClick={(e) => {
                              setAddDetails((prev) => ({
                                ...prev,
                                showpassword: !addDetails?.showpassword,
                              }));
                            }}
                            edge="end"
                          >
                            {!addDetails.showpassword ? <VisibilityOff sx={{ fontSize: '25px' }} /> : <Visibility sx={{ fontSize: '25px' }} />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Email<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined-email"
                      type="email" // Change type to "email"
                      placeholder="Please Enter Email" // Optional placeholder
                      value={addDetails.rocketchatemail} // Change field name to match email
                      onChange={(e) => {
                        setAddDetails((prev) => ({
                          ...prev,
                          rocketchatemail: e.target.value, // Update corresponding state field
                        }));
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Role<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <MultiSelect
                      options={rocketChatRolesOptions}
                      value={addDetails?.rocketchatroles}
                      onChange={(e) => {
                        handleRocketchatRoleChangeAdd(e);
                      }}
                      valueRenderer={customValueRendererRocketchatRoleAdd}
                      labelledBy="Please Select Role"
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <br /> <br />
              <Grid
                container
                spacing={2}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Grid item md={3} xs={12} sm={12}>
                  <Button variant="contained" onClick={handleSubmit} sx={buttonStyles.buttonsubmit}>
                    Create
                  </Button>
                </Grid>
                <br />
                <Grid item md={3} xs={12} sm={12}>
                  <Button sx={buttonStyles.btncancel} onClick={handleClickCloseAdd}>
                    {' '}
                    Cancel{' '}
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>
      <CustomApprovalDialog
        open={dialogOpen}
        handleClose={handleCloseDialog}
        eligibleUsers={eligibleUsers}
        eligibleUsersLevel={eligibleUsersLevel}
      />
      <LoadingBackdrop open={isLoadingNew} />

      <DeleteConfirmation open={isDeleteOpen} onClose={handleClickCloseDelete} onConfirm={deleteFunction} title="Are you sure? Do You Want to Delete this User from Rocket Chat?" confirmButtonText="Yes" cancelButtonText="Cancel" />
    </Box>
  );
}

export default HierarchyDiabledUsersList;
