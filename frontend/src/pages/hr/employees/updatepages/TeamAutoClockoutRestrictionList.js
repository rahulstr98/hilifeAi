import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Popover,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  DialogTitle,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import axios from '../../../../axiosInstance';
import 'jspdf-autotable';
import moment from 'moment-timezone';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { FaFilePdf, FaPrint } from 'react-icons/fa';
import { ThreeDots } from 'react-loader-spinner';
import Selects from 'react-select';
import { useReactToPrint } from 'react-to-print';
import { handleApiError } from '../../../../components/Errorhandling';
import { AuthContext, UserRoleAccessContext } from '../../../../context/Appcontext';
import { userStyle } from '../../../../pageStyle';
import { SERVICE } from '../../../../services/Baseservice';

import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CloseIcon from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/Error';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ImageIcon from '@mui/icons-material/Image';
import InfoIcon from '@mui/icons-material/Info';
import LoginIcon from '@mui/icons-material/Login';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import WarningIcon from '@mui/icons-material/Warning';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiInput from '@mui/material/Input';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/system';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FaFileCsv, FaFileExcel } from 'react-icons/fa';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { Link, useNavigate } from 'react-router-dom';
import AlertDialog from '../../../../components/Alert';
import ExportData from '../../../../components/ExportData';
import Headtitle from '../../../../components/Headtitle';
import MessageAlert from '../../../../components/MessageAlert';
import PageHeading from '../../../../components/PageHeading';
import Webcamimage from '../Webcamprofile';

import AggregatedSearchBar from '../../../../components/AggregatedSearchBar';
import AggridTable from '../../../../components/AggridTable';
import domtoimage from 'dom-to-image';
import UndoIcon from '@mui/icons-material/Undo';
import { getCurrentServerTime } from '../../../../components/getCurrentServerTime';

const Input = styled(MuiInput)(({ theme }) => ({
  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
    display: 'none !important',
  },
  '& input[type=number]': {
    MozAppearance: 'textfield',
  },
}));



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
function TeamAutoClockoutRestrictionList() {



  let cuurrentDateint = moment().format('DD-MM-YYYY');
  const tomorrowint = moment().add(1, 'days').format('DD-MM-YYYY');
  const dayAfterTomorrowint = moment().add(2, 'days').format('DD-MM-YYYY');

  // Create an array of dates
  const dateArrayint = [cuurrentDateint, tomorrowint, dayAfterTomorrowint];

  const [dateArray, setDateArray] = useState(dateArrayint);
  const [serverTime, setServerTime] = useState(null);
  var today = new Date(serverTime);
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + "-" + mm + "-" + dd;
  const [filterUserPost, setFilterUserPost] = useState({ filtertype: "Individual", fromdate: today, todate: today, });
  useEffect(() => {
    const fetchTime = async () => {
      const time = await getCurrentServerTime();
      setServerTime(time);
      setFilterUserPost({ ...filterUserPost, fromdate: moment(time).format('YYYY-MM-DD'), todate: moment(time).format('YYYY-MM-DD') });
      // Now use server time to generate dates
      const currentDate = moment(time).format('DD-MM-YYYY');
      const tomorrow = moment(time).add(1, 'days').format('DD-MM-YYYY');
      const dayAfterTomorrow = moment(time).add(2, 'days').format('DD-MM-YYYY');

      setDateArray([currentDate, tomorrow, dayAfterTomorrow]);
    };

    fetchTime();
  }, []);
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const gridRefTableImg = useRef(null);
  const [DisableLevelDropdown, setDisableLevelDropdown] = useState(false)
  const [filteredRowDataNear, setFilteredRowDataNear] = useState([]);
  const [filteredChangesNear, setFilteredChangesNear] = useState(null);
  const [searchedStringNear, setSearchedStringNear] = useState('');
  const [isHandleChangeNear, setIsHandleChangeNear] = useState(false);
  const gridRefTableImgNear = useRef(null);
  const gridRefTableNear = useRef(null);

  const [isFilterOpennear, setIsFilterOpennear] = useState(false);
  const [isPdfFilterOpennear, setIsPdfFilterOpennear] = useState(false);

  // page refersh reload
  const handleCloseFilterModnear = () => {
    setIsFilterOpennear(false);
  };

  const handleClosePdfFilterModnear = () => {
    setIsPdfFilterOpennear(false);
  };

  const [pageNearTatPrimary, setPageNearTatPrimary] = useState(1);
  const [pageSizeNearTatPrimary, setPageSizeNearTatPrimary] = useState(10);

  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState('');
  const [popupSeverityMalert, setPopupSeverityMalert] = useState('');
  const handleClickOpenPopupMalert = () => {
    setOpenPopupMalert(true);
    setBtnloading('');
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
    setBtnloading('');
  };
  const navigate = useNavigate();

  let exportColumnNames = ['Company', 'Branch', 'Unit', 'Team', 'Auto Clockout Date', 'Emp Code', 'EmployeeName'];
  let exportRowValues = ['company', 'branch', 'unit', 'team', 'autoclockoutdates', 'empcode', 'companyname'];

  let exportColumnNamesNear = ['Company', 'Branch', 'Unit', 'Team', 'Auto Clockout Date', 'Emp Code', 'Employee Name'];
  let exportRowValuesNear = ['company', 'branch', 'unit', 'team', 'autoclockoutdates', 'empcode', 'companyname'];

  const [employees, setEmployees] = useState([]);
  const [pending, setPending] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState('Employee');

  const [searchQuery, setSearchQuery] = useState('');
  const { isUserRoleAccess, isUserRoleCompare, isAssignBranch, pageName, setPageName, listPageAccessMode, buttonStyles } = useContext(UserRoleAccessContext);
  let listpageaccessby =
    listPageAccessMode?.find((data) => data.modulename === 'Human Resources' && data.submodulename === 'HR' && data.mainpagename === 'Employee' && data.subpagename === 'Employee Status Details' && data.subsubpagename === 'Team Long Absent Restriction List')?.listpageaccessmode || 'Overall';

  const modeDropDowns = [
    { label: 'My Hierarchy List', value: 'My Hierarchy List' },
    { label: 'All Hierarchy List', value: 'All Hierarchy List' },
    { label: 'My + All Hierarchy List', value: 'My + All Hierarchy List' },
  ];
  const sectorDropDowns = [
    { label: 'Primary', value: 'Primary' },
    { label: 'Secondary', value: 'Secondary' },
    { label: 'Tertiary', value: 'Tertiary' },
    { label: 'All', value: 'all' },
  ];

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

  const [filterUser, setFilterUser] = useState({
    mode: 'My Hierarchy List',
    level: 'Primary',
    listpageaccessmode: listpageaccessby,
  });
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
  const [selectedRowsNear, setSelectedRowsNear] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState('');

  //image
  const handleCaptureImage = () => {
    if (gridRef.current) {
      html2canvas(gridRef.current).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, 'team Auto Clock Out Restriction List.png');
        });
      });
    }
  };

  const handleCaptureImagenear = () => {
    if (gridRefTableImgNear.current) {
      domtoimage
        .toBlob(gridRefTableImgNear.current)
        .then((blob) => {
          saveAs(blob, 'Long Absent Restriction Hierarchy List Completed.png');
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
  const renderStatus = (status, workmode) => {
    const iconProps = {
      size: 'small',
      style: { marginRight: 4 },
    };

    let icon = <InfoIcon {...iconProps} />;
    let color = '#ccc'; // Default color

    switch (status) {
      case 'Notice Period Applied':
      case 'Notice Period Applied and Long Leave':
      case 'Notice Period Applied and Long Absent':
        icon = <PauseCircleOutlineIcon {...iconProps} />;
        color = '#1976d2'; // Blue
        break;
      case 'Notice Period Approved':
      case 'Notice Period Approved and Long Leave':
      case 'Notice Period Approved and Long Absent':
        icon = <CheckCircleIcon {...iconProps} />;
        color = '#4caf50'; // Green
        break;
      case 'Notice Period Cancelled':
      case 'Notice Period Cancelled and Long Leave':
      case 'Notice Period Cancelled and Long Absent':
        icon = <ErrorIcon {...iconProps} />;
        color = '#9c27b0'; // Purple
        break;
      case 'Notice Period Continue':
      case 'Notice Period Continue and Long Leave':
      case 'Notice Period Continue and Long Absent':
        icon = <WarningIcon {...iconProps} />;
        color = '#ff9800'; // Orange
        break;
      case 'Notice Period Rejected':
      case 'Notice Period Rejected and Long Leave':
      case 'Notice Period Rejected and Long Absent':
        icon = <ErrorIcon {...iconProps} />;
        color = '#f44336'; // Red
        break;
      case 'Notice Period Recheck':
      case 'Notice Period Recheck and Long Leave':
      case 'Notice Period Recheck and Long Absent':
        icon = <InfoIcon {...iconProps} />;
        color = '#00acc1'; // Cyan
        break;
      case 'Long Leave':
        icon = <PauseCircleOutlineIcon {...iconProps} />;
        color = '#1976d2'; // Blue
        break;
      case 'Long Absent':
        icon = <ErrorIcon {...iconProps} />;
        color = '#f44336'; // Red
        break;
      case 'Live':
        icon = <CheckCircleIcon {...iconProps} />;
        color = '#4caf50'; // Green
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
            {workmode === 'Internship' ? `${'Intern'} ${status}` : `${status}`}
          </Typography>
        </Button>
      </Tooltip>
    );
  };

  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    userstatus: true,
    company: true,
    branch: true,
    unit: true,
    team: true,
    empcode: true,
    autoclockoutdates: true,
    companyname: true,
    actions: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };

  const [isAssigned, setIsAssigned] = useState(false);

  const isChecklistAssigned = async () => {
    try {
      const res = await axios.get(`${SERVICE.MODULEBASEDASSIGNMENTCHECKLIST}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      // Check if the response contains the required data
      const isAvailable = res?.data?.checklistverificationmasters?.some((item) => item.subsubpage === 'Long Absent Restriction List');

      if (isAvailable) {
        setIsAssigned(true);
      } else {
        setIsAssigned(false);
      }
    } catch (err) {
      console.error('API Error:', err); // For easier debugging
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

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
    documentTitle: 'Team Auto Clockout Restriction Pending List',
    pageStyle: 'print',
  });

  //print...
  const componentRefNear = useRef();
  const handleprintNear = useReactToPrint({
    content: () => componentRefNear.current,
    documentTitle: 'Team Auto Clockout Restriction Completed List',
    pageStyle: 'print',
  });

  //table entries ..,.
  const [items, setItems] = useState([]);

  const addSerialNumber = (datas) => {
    setItems(datas);
  };

  useEffect(() => {
    addSerialNumber(pending);
  }, [pending]);

  const [searchedString, setSearchedString] = useState('');
  const [isHandleChange, setIsHandleChange] = useState(false);
  const gridRefTable = useRef(null);
  useEffect(() => {
    sendRequest();
  }, []);

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

  const filteredData = filteredDatas.slice((page - 1) * pageSize, page * pageSize);

  const totalPages = Math.ceil(filteredDatas.length / pageSize);

  const visiblePages = Math.min(totalPages, 3);

  const firstVisiblePage = Math.max(1, page - 1);
  const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPages);

  const pageNumbers = [];

  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }

  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
    <div>
      <Checkbox checked={selectAllChecked} onChange={onSelectAll} />
    </div>
  );

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
    // {
    //     field: 'userstatus',
    //     headerName: 'Current Status',
    //     flex: 0,
    //     width: 180,
    //     minHeight: '40px',
    //     cellStyle: {
    //         display: 'flex',
    //         justifyContent: 'center',
    //         alignItems: 'center',
    //     },
    //     cellRenderer: (params) => renderStatus(params?.data.userstatus, params?.data?.workmode),
    //     hide: !columnVisibility.userstatus,
    //     pinned: 'left',
    // },
    {
      field: 'company',
      headerName: 'Company',
      flex: 0,
      width: 200,
      hide: !columnVisibility.company,
      headerClassName: 'bold-header',
      pinned: 'left',
    },
    {
      field: 'branch',
      headerName: 'Branch',
      flex: 0,
      width: 200,
      hide: !columnVisibility.branch,
      headerClassName: 'bold-header',
      pinned: 'left',
    },
    {
      field: 'unit',
      headerName: 'Unit',
      flex: 0,
      width: 150,
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
      field: 'autoclockoutdates',
      headerName: 'Auto Clockout Date',
      flex: 0,
      width: 150,
      hide: !columnVisibility.autoclockoutdates,
      headerClassName: 'bold-header',
    },
    {
      field: 'empcode',
      headerName: 'Emp Code',
      flex: 0,
      width: 200,
      hide: !columnVisibility.empcode,
      headerClassName: 'bold-header',
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params) => (
        <Grid sx={{ display: 'flex' }}>
          <ListItem
            sx={{
              '&:hover': {
                cursor: 'pointer',
                color: 'blue',
                textDecoration: 'underline',
              },
            }}
          >
            <CopyToClipboard
              onCopy={() => {
                handleCopy('Copied Emp Code!');
              }}
              options={{ message: 'Copied Emp Code!' }}
              text={params?.data?.empcode}
            >
              <ListItemText primary={params?.data?.empcode} />
            </CopyToClipboard>
          </ListItem>
        </Grid>
      ),
    },
    {
      field: 'companyname',
      headerName: 'Employee Name',
      flex: 0,
      width: 250,
      hide: !columnVisibility.companyname,
      headerClassName: 'bold-header',
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params) => (
        <Grid sx={{ display: 'flex' }}>
          <ListItem
            sx={{
              '&:hover': {
                cursor: 'pointer',
                color: 'blue',
                textDecoration: 'underline',
              },
            }}
          >
            <CopyToClipboard
              onCopy={() => {
                handleCopy('Copied Name!');
              }}
              options={{ message: 'Copied Name!' }}
              text={params?.data?.companyname}
            >
              <ListItemText primary={params?.data?.companyname} />
            </CopyToClipboard>
          </ListItem>
        </Grid>
      ),
    },
    {
      field: 'actions',
      headerName: 'Action',
      flex: 0,
      width: 200,
      minHeight: '40px !important',
      sortable: false,
      hide: !columnVisibility.actions,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params) => (
        <>
          {/* {dateArray?.some((data) => params?.data?.longleaveabsentaprooveddate?.includes(data)) ? ( */}

          <LoadingButton
            endIcon={<CheckCircleIcon />}
            variant="contained"
            color="success"
            loading={params.data.id === btnLoading}
            size="small"
            sx={{
              m: 0.5,
              minWidth: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => {
              fetchFilteredUsersStatus(params.data, "first");


              // setRowDetails(params.data);
              // setButtonName('allow');
              // setUndoOpen(true);
            }}
          >
            Release
          </LoadingButton>

          {/* ) : (
                        <>
                            {isAssigned ? (
                                params?.data?.checklistassigned ? (
                                    <LoadingButton
                                        endIcon={<LoginIcon />}
                                        variant="contained"
                                        color="primary"
                                        loading={params.data.id === btnLoading}
                                        // disabled={!params?.data?.checklistassigned}
                                        size="small"
                                        style={{ margin: '4px' }}
                                        onClick={() => {
                                            // handleAllowLogin(params.data.id, cuurrentDate);
                                            getCodeNew(params.data);
                                        }}
                                    >
                                        Allow Login
                                    </LoadingButton>
                                ) : (
                                    <Link
                                        to="/interview/myinterviewchecklist"
                                        style={{
                                            textDecoration: 'none',
                                            color: 'white',
                                            float: 'right',
                                        }}
                                        target="_blank"
                                    >
                                        <LoadingButton
                                            endIcon={<ChecklistIcon />}
                                            variant="contained"
                                            color="error"
                                            // disabled={!params?.data?.checklistassigned}
                                            size="small"
                                            style={{ margin: '4px' }}
                                        >
                                            Assign Checklist
                                        </LoadingButton>
                                    </Link>
                                )
                            ) : (
                                <LoadingButton
                                    endIcon={<LoginIcon />}
                                    variant="contained"
                                    color="primary"
                                    loading={params.data.id === btnLoading}
                                    // disabled={!params?.data?.checklistassigned}
                                    size="small"
                                    style={{ margin: '4px' }}
                                    onClick={() => {
                                        setRecentData(params.data);
                                        setShowAlert(
                                            <>
                                                <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
                                                <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Checklist is Not Assigned for this Page. Wish to continue?'}</p>
                                            </>
                                        );
                                        handleClickOpenerr();
                                    }}
                                >
                                    Allow Login
                                </LoadingButton>
                            )}
                        </>
                    )} */}
        </>
      ),
    },
  ];


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
    const montharray = getMonthsInRange(filterUserPost.fromdate, filterUserPost.todate);
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
        if (page === "first") {
          setRowDetails(user);
          setButtonName('allow');
          setUndoOpen(true);
        } else if (page === "second") {
          setRowDetails(user);
          setButtonName('undo');
          setUndoOpen(true);
        }
        // handleClickOpenEdit()
      } else {
        console.log(response?.data, filterUserPost.fromdate, filterUserPost.todate, montharray, "response")
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
                  fromdate: filterUserPost.fromdate,
                  todate: filterUserPost.todate,
                  montharray: [...montharray],
                },
                {
                  headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                  },
                }
              );

              const dataCheck = res?.data?.finaluser?.find(
                item => item?.finalDate === filterUserPost.fromdate
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
              // handleClickOpenEdit();
              if (page === "first") {
                setRowDetails(user);
                setButtonName('allow');
                setUndoOpen(true);
              } else if (page === "second") {
                setRowDetails(user);
                setButtonName('undo');
                setUndoOpen(true);
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
            setRowDetails(user);
            setButtonName('allow');
            setUndoOpen(true);
          } else if (page === "second") {
            setRowDetails(user);
            setButtonName('undo');
            setUndoOpen(true);
          }
        }

      }
      // 3. Use the `results` array as needed

    } catch (err) { setLoader(true); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item.id,
      serialNumber: item.serialNumber,
      userstatus: item.userstatus,
      autoclockoutdates: item?.autoclockoutdates,
      company: item.company,
      branch: item.branch,
      unit: item.unit,
      team: item.team,
      empcode: item.empcode,
      companyname: item.companyname,
      username: item?.username,
      password: item?.password,
      email: item?.email,
      mobile: item?.mobile,
      firstname: item?.firstname,
      lastname: item?.lastname,
      adharnumber: item?.adharnumber,
      pannumber: item?.pannumber,
      dateofbirth: item?.dateofbirth,
      address: item?.address,
      workmode: item?.workmode,
      leaveapplied: item?.leaveapplied,
      checklistassigned: item?.checklistassigned,
      longleaveabsentaprooveddate: item?.longleaveabsentaprooveddate?.length > 0 ? item?.longleaveabsentaprooveddate : [],
      longleaveabsentaprooveddatechecklist: item?.longleaveabsentaprooveddatechecklist?.length > 0 ? item?.longleaveabsentaprooveddatechecklist : [],
    };
  });

  const rowsWithCheckboxes = rowDataTable.map((row) => ({
    ...row,
    // Create a custom field for rendering the checkbox
    checkbox: selectedRows.includes(row.id),
  }));

  // Show All Columns functionality
  const handleShowAllColumns = () => {
    setColumnVisibility(initialColumnVisibility);
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

  const [itemsneartat, setItemsNearTat] = useState([]);

  const [searchQueryManageNeartat, setSearchQueryManageNeartat] = useState('');
  // Manage Columns
  const [isManageColumnsOpenNeartat, setManageColumnsOpenNeartat] = useState(false);
  const [anchorElNeartat, setAnchorElNeartat] = useState(null);
  const handleOpenManageColumnsNeartat = (event) => {
    setAnchorElNeartat(event.currentTarget);
    setManageColumnsOpenNeartat(true);
  };
  const handleCloseManageColumnsNeartat = () => {
    setManageColumnsOpenNeartat(false);
    setSearchQueryManageNeartat('');
  };

  const openneartat = Boolean(anchorElNeartat);
  const idneartat = openneartat ? 'simple-popover' : undefined;

  const initialColumnVisibilityNeartat = {
    serialNumber: true,
    checkbox: true,
    userstatus: true,
    company: true,
    branch: true,
    unit: true,
    team: true,
    empcode: true,
    leaveapplied: true,
    companyname: true,
    autoclockoutdates: true,
    actions: true,
  };

  const [columnVisibilityNeartat, setColumnVisibilityNeartat] = useState(initialColumnVisibilityNeartat);

  const addSerialNumberNearTat = (datas) => {
    setItemsNearTat(datas);
  };

  useEffect(() => {
    addSerialNumberNearTat(employees);
  }, [employees]);

  //Datatable
  const handlePageChangeNearTatPrimary = (newPage) => {
    setPageNearTatPrimary(newPage);
  };

  const handlePageSizeChangeNearTatPrimary = (event) => {
    setPageSizeNearTatPrimary(Number(event.target.value));
    setPageNearTatPrimary(1);
  };

  //datatable....
  const [searchQueryNearTatPrimary, setSearchQueryNearTatPrimary] = useState('');
  const handleSearchChangeNearTatPrimary = (event) => {
    setSearchQueryNearTatPrimary(event.target.value);
  };

  const searchOverNearTerms = searchQueryNearTatPrimary.toLowerCase().split(' ');

  // Modify the filtering logic to check each term
  const filteredDatasNearTatPrimary = itemsneartat?.filter((item) => {
    return searchOverNearTerms.every((term) => Object.values(item).join(' ').toLowerCase().includes(term));
  });

  const filteredDataNearTatPrimary = filteredDatasNearTatPrimary?.slice((pageNearTatPrimary - 1) * pageSizeNearTatPrimary, pageNearTatPrimary * pageSizeNearTatPrimary);

  const totalPagesNearTatPrimary = Math.ceil(filteredDatasNearTatPrimary?.length / pageSizeNearTatPrimary);

  const visiblePagesNearTatPrimary = Math.min(totalPagesNearTatPrimary, 3);

  const firstVisiblePageNearTatPrimary = Math.max(1, pageNearTatPrimary - 1);
  const lastVisiblePageNearTatPrimary = Math.min(Math.abs(firstVisiblePageNearTatPrimary + visiblePagesNearTatPrimary - 1), totalPagesNearTatPrimary);

  const pageNumbersNearTatPrimary = [];

  const indexOfLastItemNearTatPrimary = pageNearTatPrimary * pageSizeNearTatPrimary;
  const indexOfFirstItemNearTatPrimary = indexOfLastItemNearTatPrimary - pageSizeNearTatPrimary;

  for (let i = firstVisiblePageNearTatPrimary; i <= lastVisiblePageNearTatPrimary; i++) {
    pageNumbersNearTatPrimary.push(i);
  }

  const columnDataTableNeartat = [
    {
      field: 'serialNumber',
      headerName: 'SNo',
      flex: 0,
      width: 75,
      hide: !columnVisibility.serialNumber,
      headerClassName: 'bold-header',
      pinned: 'left',
    },
    // {
    //     field: 'userstatus',
    //     headerName: 'Current Status',
    //     flex: 0,
    //     width: 180,
    //     minHeight: '40px',
    //     cellStyle: {
    //         display: 'flex',
    //         justifyContent: 'center',
    //         alignItems: 'center',
    //     },
    //     cellRenderer: (params) => renderStatus(params?.data.userstatus, params?.data?.workmode),
    //     hide: !columnVisibility.userstatus,
    //     pinned: 'left',
    // },
    {
      field: 'company',
      headerName: 'Company',
      flex: 0,
      width: 200,
      hide: !columnVisibility.company,
      headerClassName: 'bold-header',
      pinned: 'left',
    },
    {
      field: 'branch',
      headerName: 'Branch',
      flex: 0,
      width: 200,
      hide: !columnVisibility.branch,
      headerClassName: 'bold-header',
      pinned: 'left',
    },
    {
      field: 'unit',
      headerName: 'Unit',
      flex: 0,
      width: 150,
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
      field: 'autoclockoutdates',
      headerName: 'Auto Clockout Date',
      flex: 0,
      width: 150,
      hide: !columnVisibility.autoclockoutdates,
      headerClassName: 'bold-header',
    },
    {
      field: 'empcode',
      headerName: 'Emp Code',
      flex: 0,
      width: 200,
      hide: !columnVisibility.empcode,
      headerClassName: 'bold-header',
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params) => (
        <Grid sx={{ display: 'flex' }}>
          <ListItem
            sx={{
              '&:hover': {
                cursor: 'pointer',
                color: 'blue',
                textDecoration: 'underline',
              },
            }}
          >
            <CopyToClipboard
              onCopy={() => {
                handleCopy('Copied Emp Code!');
              }}
              options={{ message: 'Copied Emp Code!' }}
              text={params?.data?.empcode}
            >
              <ListItemText primary={params?.data?.empcode} />
            </CopyToClipboard>
          </ListItem>
        </Grid>
      ),
    },
    {
      field: 'companyname',
      headerName: 'Employee Name',
      flex: 0,
      width: 250,
      hide: !columnVisibility.companyname,
      headerClassName: 'bold-header',
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params) => (
        <Grid sx={{ display: 'flex' }}>
          <ListItem
            sx={{
              '&:hover': {
                cursor: 'pointer',
                color: 'blue',
                textDecoration: 'underline',
              },
            }}
          >
            <CopyToClipboard
              onCopy={() => {
                handleCopy('Copied Name!');
              }}
              options={{ message: 'Copied Name!' }}
              text={params?.data?.companyname}
            >
              <ListItemText primary={params?.data?.companyname} />
            </CopyToClipboard>
          </ListItem>
        </Grid>
      ),
    },
    {
      field: 'actions',
      headerName: 'Action',
      flex: 0,
      width: 300,
      minHeight: '40px !important',
      sortable: false,
      hide: !columnVisibility.actions,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params) => (
        <>
          <LoadingButton
            startIcon={<UndoIcon />}
            variant="contained"
            color="secondary"
            loading={params.data.id === btnLoading}
            size="small"
            sx={{
              m: 0.5,
              minWidth: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => {

              fetchFilteredUsersStatus(params.data, "second");
            }}
          >
            Undo
          </LoadingButton>
        </>
      ),
    },
  ];

  const rowDataTableNearTat = filteredDataNearTatPrimary.map((item, index) => {
    return {
      id: item.id,
      serialNumber: item.serialNumber,
      userstatus: item.userstatus,
      autoclockoutdates: item?.autoclockoutdates,
      company: item.company,
      branch: item.branch,
      unit: item.unit,
      team: item.team,
      empcode: item.empcode,
      companyname: item.companyname,
      username: item?.username,
      password: item?.password,
      email: item?.email,
      mobile: item?.mobile,
      firstname: item?.firstname,
      lastname: item?.lastname,
      adharnumber: item?.adharnumber,
      pannumber: item?.pannumber,
      dateofbirth: item?.dateofbirth,
      address: item?.address,
      workmode: item?.workmode,
      leaveapplied: item?.leaveapplied,
      checklistassigned: item?.checklistassigned,
      longleaveabsentaprooveddate: item?.longleaveabsentaprooveddate?.length > 0 ? item?.longleaveabsentaprooveddate : [],
      longleaveabsentaprooveddatechecklist: item?.longleaveabsentaprooveddatechecklist?.length > 0 ? item?.longleaveabsentaprooveddatechecklist : [],
    };
  });

  // Show All Columns functionality
  const handleShowAllColumnsNeartat = () => {
    const updatedVisibilityNeartat = { ...columnVisibilityNeartat };
    for (const columnKey in updatedVisibilityNeartat) {
      updatedVisibilityNeartat[columnKey] = true;
    }
    setColumnVisibilityNeartat(updatedVisibilityNeartat);
  };

  // Manage Columns functionality
  const toggleColumnVisibilityNeartat = (field) => {
    setColumnVisibilityNeartat((prevVisibility) => ({
      ...prevVisibility,
      [field]: !prevVisibility[field],
    }));
  };

  // Function to filter columns based on search query
  const filteredColumnsNeartat = columnDataTableNeartat.filter((column) => column.headerName.toLowerCase().includes(searchQueryManageNeartat.toLowerCase()));

  // JSX for the "Manage Columns" popover content
  const manageColumnsContentNeartat = (
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
        onClick={handleCloseManageColumnsNeartat}
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
        <TextField label="Find column" variant="standard" fullWidth value={searchQueryManageNeartat} onChange={(e) => setSearchQueryManageNeartat(e.target.value)} sx={{ marginBottom: 5, position: 'absolute' }} />
      </Box>
      <br />
      <br />
      <DialogContent sx={{ minWidth: 'auto', height: '200px', position: 'relative' }}>
        <List sx={{ overflow: 'auto', height: '100%' }}>
          {filteredColumnsNeartat.map((column) => (
            <ListItem key={column.field}>
              <ListItemText
                sx={{ display: 'flex' }}
                primary={<Switch sx={{ marginTop: '-5px' }} size="small" checked={columnVisibilityNeartat[column.field]} onChange={() => toggleColumnVisibilityNeartat(column.field)} />}
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
            <Button variant="text" sx={{ textTransform: 'none' }} onClick={() => setColumnVisibilityNeartat(initialColumnVisibilityNeartat)}>
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
                columnDataTableNeartat.forEach((column) => {
                  newColumnVisibility[column.field] = false; // Set hide property to true
                });
                setColumnVisibilityNeartat(newColumnVisibility);
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
  const sendRequest = async () => {
    setPageName(!pageName);
    setLoader(true);
    setisBtnFilter(true);
    try {
      let subprojectscreate = await axios.post(
        SERVICE.TEAM_AUTO_CLOCKOUT_RESTRICTION,
        // SERVICE.GETFILTEREUSERDATALONGABSEND_HIRARCHY_COMPLETED,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          //   company: valueCompanyCat,
          //   branch: valueBranchCat,
          //   unit: valueUnitCat,
          //   team: valueTeamCat,
          filterin: selectedUserType,

          hierachy: filterUser.mode,
          sector: filterUser.level,
          username: isUserRoleAccess?.companyname,
          team: isUserRoleAccess.team,
          listpageaccessmode: filterUser?.listpageaccessmode,
          pagename: 'menuteamautoclockoutrestrictionlist',
          module: 'Human Resources',
          submodule: 'HR',
          mainpage: 'Employee',
          subpage: 'Employee Status Details',
          subsubpage: 'Team Auto Clockout Restriction List',
          status: 'completed',
          role: isUserRoleAccess.role,
        }
      );

      setDisableLevelDropdown(subprojectscreate?.data?.DataAccessMode)
      if (!subprojectscreate?.data?.DataAccessMode &&
        subprojectscreate?.data?.resultedTeam?.length > 0 &&
        subprojectscreate?.data?.filterallDatauser?.length < 1 &&
        ['myallhierarchy', 'allhierarchy']?.includes(filterUser?.mode === 'My Hierarchy List' ? 'myhierarchy' : filterUser?.mode === 'All Hierarchy List' ? 'allhierarchy' : 'myallhierarchy')
      ) {
        alert('Some employees have not been given access to this page.');
      }
      let answer = subprojectscreate?.data?.filterallDatauser;
      // .filter((item) => isAssignBranch.some((branch) => branch.company === item.company && branch.branch === item.branch && branch.unit === item.unit));

      let ans = answer.filter(
        (d) =>
          d?.autoclockoutreleasedates?.length > 0 &&
          // dateArray?.some((data) => d?.autoclockoutreleasedates?.includes(data))
          d?.autoclockoutreleasedates?.includes(moment(serverTime).format('DD-MM-YYYY'))
      );

      let anspending = answer.filter((d) => !d?.autoclockoutreleasedates?.includes(moment(serverTime).format('DD-MM-YYYY')));

      const itemsWithSerialNumber = anspending?.map((item, index) => ({
        id: item?._id,
        serialNumber: index + 1,
        company: item?.company,
        userstatus: item.userstatus,
        autoclockoutdates: item?.recentAttendance?.length > 0 ? item?.recentAttendance?.map((data) => data?.date)?.join(',') : '',
        branch: item?.branch,
        unit: item?.unit,
        team: item?.team,
        empcode: item?.empcode,
        companyname: item?.companyname,
        username: item?.username,
        password: item?.originalpassword,
        firstname: item?.firstname,
        lastname: item?.lastname,
        adharnumber: item?.aadhar,
        pannumber: item?.panno,
        dateofbirth: item?.dob,
        workmode: item?.workmode,
        leaveDetails: item?.leaveDetails,
        leaveapplied: item?.leaveDetails?.length > 0 && item?.leaveDetails?.some((data) => data?.status === 'Applied') ? 'Yes' : 'No',
        checklistassigned: item?.checklistassigned,
        address: `${item?.pstreet}, ${item?.pcity}, ${item?.ppincode}, ${item?.pstate}, ${item?.pcountry}`,
        longleaveabsentaprooveddate: item?.longleaveabsentaprooveddate,
        longleaveabsentaprooveddatechecklist: item?.longleaveabsentaprooveddatechecklist,
      }));

      const itemsWithSerialNumberComp = ans?.map((item, index) => ({
        id: item?._id,
        serialNumber: index + 1,
        company: item?.company,
        userstatus: item.userstatus,
        autoclockoutdates: item?.recentAttendance?.length > 0 ? item?.recentAttendance?.map((data) => data?.date)?.join(',') : '',
        branch: item?.branch,
        unit: item?.unit,
        team: item?.team,
        empcode: item?.empcode,
        companyname: item?.companyname,
        username: item?.username,
        password: item?.originalpassword,
        firstname: item?.firstname,
        lastname: item?.lastname,
        adharnumber: item?.aadhar,
        pannumber: item?.panno,
        dateofbirth: item?.dob,
        workmode: item?.workmode,
        leaveDetails: item?.leaveDetails,
        leaveapplied: item?.leaveDetails?.length > 0 && item?.leaveDetails?.some((data) => data?.status === 'Applied') ? 'Yes' : 'No',
        checklistassigned: item?.checklistassigned,
        address: `${item?.pstreet}, ${item?.pcity}, ${item?.ppincode}, ${item?.pstate}, ${item?.pcountry}`,
        longleaveabsentaprooveddate: item?.longleaveabsentaprooveddate,
        longleaveabsentaprooveddatechecklist: item?.longleaveabsentaprooveddatechecklist,
      }));
      setEmployees(itemsWithSerialNumberComp);
      setPending(itemsWithSerialNumber);
      setisBtnFilter(false);
      setLoader(false);
    } catch (err) {
      console.log(err);
      setLoader(false);
      setisBtnFilter(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [btnLoading, setBtnloading] = useState('');
  const [recentData, setRecentData] = useState({});

  const [rowDetails, setRowDetails] = useState({});
  const [undoOpen, setUndoOpen] = useState(false);
  const [buttonName, setButtonName] = useState('');

  const handleUndoLogin = async (row, action) => {
    try {
      setBtnloading(row?.id);
      let res = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${row?.id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        autoclockoutreleasedates: action === 'undo' ? [] : dateArray,
      });
      await sendRequest();
      setPopupContent(action === 'undo' ? 'Undo Successfully' : 'Allowed Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
      setBtnloading('');
      setUndoOpen(false);
    } catch (err) {
      console.log(err);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const handleAllowLogin = async (row) => {
    try {
      handleCloseerr();
      setBtnloading(recentData?.id);
      const [res, resNew] = await Promise.all([
        axios.put(`${SERVICE.USER_SINGLE_PWD}/${recentData?.id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          autoclockoutreleasedates: dateArray,
        }),
        axios.post(SERVICE.CHECKUSERPRESENTINLDAP, {
          username: recentData?.username,
        }),
      ]);
      if (resNew?.data?.status) {
        await axios.post(
          SERVICE.ENABLEDOMAINUSER,
          {
            username: recentData?.username,
          },
          {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
          }
        );
      }
      await sendRequest();
      setPopupContent('Allowed Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
      setBtnloading('');
    } catch (err) {
      console.log(err);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //submit option for saving
  const handleSubmit = (e) => {
    e.preventDefault();
    // setIsActive(true)
    // if (
    //   selectedOptionsCompany.length === 0 &&
    //   selectedOptionsBranch.length === 0 &&
    //   selectedOptionsUnit.length === 0 &&
    //   selectedOptionsTeam.length === 0
    // ) {
    //   setPopupContentMalert("Please Select Any One Field");
    //   setPopupSeverityMalert("info");
    //   handleClickOpenPopupMalert();
    // } else {
    sendRequest();
    // }
  };

  const handleClear = (e) => {
    e.preventDefault();
    // setSelectedOptionsBranch([]);
    // setSelectedOptionsUnit([]);
    // setSelectedOptionsTeam([]);
    // setSelectedOptionsCompany([]);
    // setValueCompanyCat([]);
    // setValueBranchCat([]);
    // setValueUnitCat([]);
    // setValueTeamCat([]);
    setFilterUser({
      mode: 'My Hierarchy List',
      level: 'Primary',
      listpageaccessmode: listpageaccessby,
    });
    setEmployees([]);
    setPending([]);
    setChecked(false);
    setDisableLevelDropdown(false);
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
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [getImg, setGetImg] = useState(null);
  const [isWebcamCapture, setIsWebcamCapture] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [valNum, setValNum] = useState(0);

  const webcamOpen = () => {
    setIsWebcamOpen(true);
  };
  const webcamClose = () => {
    setIsWebcamOpen(false);
  };
  const webcamDataStore = () => {
    setIsWebcamCapture(true);
    //popup close
    webcamClose();
  };

  //add webcamera popup
  const showWebcam = () => {
    webcamOpen();
  };

  const renderFilePreviewEdit = async (file) => {
    const response = await fetch(file.preview);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    window.open(link, '_blank');
  };
  const handleFileDeleteEdit = (index) => {
    let getData = groupDetails[index];
    delete getData.files;
    let finalData = getData;

    let updatedTodos = [...groupDetails];
    updatedTodos[index] = finalData;
    setGroupDetails(updatedTodos);
  };

  const [assignDetails, setAssignDetails] = useState();
  const [groupDetails, setGroupDetails] = useState();
  const [datasAvailedDB, setDatasAvailedDB] = useState();
  const [disableInput, setDisableInput] = useState([]);
  const [getDetails, setGetDetails] = useState();

  const [dateValue, setDateValue] = useState([]);
  const [timeValue, setTimeValue] = useState([]);

  const [dateValueRandom, setDateValueRandom] = useState([]);
  const [timeValueRandom, setTimeValueRandom] = useState([]);

  const [dateValueMultiFrom, setDateValueMultiFrom] = useState([]);
  const [dateValueMultiTo, setDateValueMultiTo] = useState([]);
  const [postID, setPostID] = useState();
  const [pagesDetails, setPagesDetails] = useState({});
  const [fromWhere, setFromWhere] = useState('');

  const [firstDateValue, setFirstDateValue] = useState([]);
  const [firstTimeValue, setFirstTimeValue] = useState([]);
  const [secondDateValue, setSecondDateValue] = useState([]);
  const [secondTimeValue, setSecondTimeValue] = useState([]);

  const [isCheckList, setIsCheckList] = useState(true);

  let completedbyName = isUserRoleAccess.companyname;

  const updateIndividualData = async (index) => {
    let searchItem = datasAvailedDB.find(
      (item) => item.commonid == postID && item.module == 'Human Resources' && item.submodule == 'HR' && item.mainpage == 'Employee' && item.subpage == 'Employee Status Details' && item.subsubpage == 'Long Absent Restriction List' && item.status.toLowerCase() !== 'completed'
    );

    let combinedGroups = groupDetails?.map((data) => {
      let check = (data.data !== undefined && data.data !== '') || data.files !== undefined;

      if (check) {
        return {
          ...data,
          completedby: completedbyName,
          completedat: new Date(serverTime),
        };
      } else {
        return {
          ...data,
          completedby: '',
          completedat: '',
        };
      }
    });

    try {
      let objectID = combinedGroups[index]?._id;
      let objectData = combinedGroups[index];
      if (searchItem) {
        let assignbranches = await axios.put(`${SERVICE.MYCHECKLIST_SINGLEBYOBJECTID}/${objectID}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          data: String(objectData?.data),
          lastcheck: objectData?.lastcheck,
          newFiles: objectData?.files,
          completedby: objectData?.completedby,
          completedat: objectData?.completedat,
        });
        let updateDate = await axios.put(`${SERVICE.MYCHECKLIST_SINGLE}/${singleDataId}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          longleaveabsentaprooveddatechecklist: dateArray,
        });
        await fecthDBDatas();
      } else {
        let assignbranches = await axios.post(`${SERVICE.MYCHECKLIST_CREATE}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          commonid: postID,
          module: pagesDetails?.module,
          submodule: pagesDetails?.submodule,
          mainpage: pagesDetails?.mainpage,
          subpage: pagesDetails?.subpage,
          subsubpage: pagesDetails?.subsubpage,
          category: assignDetails?.category,
          subcategory: assignDetails?.subcategory,
          candidatename: assignDetails?.fullname,
          status: 'progress',
          longleaveabsentaprooveddatechecklist: dateArray,
          groups: combinedGroups,
          addedby: [
            {
              name: String(isUserRoleAccess.companyname),
              date: String(new Date()),
            },
          ],
        });
        await fecthDBDatas();
      }

      setPopupContent('Updated Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      console.log(err);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  async function fecthDBDatas() {
    try {
      let res = await axios.get(SERVICE.MYCHECKLIST);
      setDatasAvailedDB(res?.data?.mychecklist);

      let foundData = res?.data?.mychecklist.find((item) => item.commonid == postID);
      setGroupDetails(foundData?.groups);
    } catch (err) {
      console.log(err);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  }

  const updateDateValuesAtIndex = (value, index) => {
    setDateValue((prevArray) => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, 'DateTime', 'date');
  };

  const updateTimeValuesAtIndex = (value, index) => {
    setTimeValue((prevArray) => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, 'DateTime', 'time');
  };
  //---------------------------------------------------------------------------------------------------------------

  const updateFromDateValueAtIndex = (value, index) => {
    setDateValueMultiFrom((prevArray) => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, 'Date Multi Span', 'fromdate');
  };

  const updateToDateValueAtIndex = (value, index) => {
    setDateValueMultiTo((prevArray) => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, 'Date Multi Span', 'todate');
  };
  //---------------------------------------------------------------------------------------------------------------------------------
  const updateDateValueAtIndex = (value, index) => {
    setDateValueRandom((prevArray) => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, 'Date Multi Random Time', 'date');
  };

  const updateTimeValueAtIndex = (value, index) => {
    setTimeValueRandom((prevArray) => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, 'Date Multi Random Time', 'time');
  };
  //---------------------------------------------------------------------------------------------------------------------------------------

  const updateFirstDateValuesAtIndex = (value, index) => {
    setFirstDateValue((prevArray) => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, 'Date Multi Span Time', 'fromdate');
  };

  const updateFirstTimeValuesAtIndex = (value, index) => {
    setFirstTimeValue((prevArray) => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, 'Date Multi Span Time', 'fromtime');
  };

  const updateSecondDateValuesAtIndex = (value, index) => {
    setSecondDateValue((prevArray) => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, 'Date Multi Span Time', 'todate');
  };

  const updateSecondTimeValuesAtIndex = (value, index) => {
    setSecondTimeValue((prevArray) => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, 'Date Multi Span Time', 'totime');
  };

  //------------------------------------------------------------------------------------------------------------

  const handleDataChange = (e, index, from, sub) => {
    let getData;
    let finalData;
    let updatedTodos;
    switch (from) {
      case 'Check Box':
        getData = groupDetails[index];
        finalData = {
          ...getData,
          lastcheck: e,
        };

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'Text Box':
        getData = groupDetails[index];
        finalData = {
          ...getData,
          data: e.target.value,
        };

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'Text Box-number':
        getData = groupDetails[index];
        finalData = {
          ...getData,
          data: e.target.value,
        };

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'Text Box-alpha':
        getData = groupDetails[index];
        finalData = {
          ...getData,
          data: e.target.value,
        };

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'Text Box-alphanumeric':
        getData = groupDetails[index];
        finalData = {
          ...getData,
          data: e.target.value,
        };

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'Attachments':
        getData = groupDetails[index];
        finalData = {
          ...getData,
          files: e,
        };

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'Pre-Value':
        break;
      case 'Date':
        getData = groupDetails[index];
        finalData = {
          ...getData,
          data: e.target.value,
        };

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'Time':
        getData = groupDetails[index];
        finalData = {
          ...getData,
          data: e.target.value,
        };

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'DateTime':
        if (sub == 'date') {
          getData = groupDetails[index];
          finalData = {
            ...getData,
            data: `${e} ${timeValue[index]}`,
          };

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        } else {
          getData = groupDetails[index];
          finalData = {
            ...getData,
            data: `${dateValue[index]} ${e}`,
          };

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        }

        break;
      case 'Date Multi Span':
        if (sub == 'fromdate') {
          getData = groupDetails[index];
          finalData = {
            ...getData,
            data: `${e} ${dateValueMultiTo[index]}`,
          };

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        } else {
          getData = groupDetails[index];
          finalData = {
            ...getData,
            data: `${dateValueMultiFrom[index]} ${e}`,
          };

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        }
        break;
      case 'Date Multi Span Time':
        if (sub == 'fromdate') {
          getData = groupDetails[index];
          finalData = {
            ...getData,
            data: `${e} ${firstTimeValue[index]}/${secondDateValue[index]} ${secondTimeValue[index]}`,
          };

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        } else if (sub == 'fromtime') {
          getData = groupDetails[index];
          finalData = {
            ...getData,
            data: `${firstDateValue[index]} ${e}/${secondDateValue[index]} ${secondTimeValue[index]}`,
          };

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        } else if (sub == 'todate') {
          getData = groupDetails[index];
          finalData = {
            ...getData,
            data: `${firstDateValue[index]} ${firstTimeValue[index]}/${e} ${secondTimeValue[index]}`,
          };

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        } else {
          getData = groupDetails[index];
          finalData = {
            ...getData,
            data: `${firstDateValue[index]} ${firstTimeValue[index]}/${secondDateValue[index]} ${e}`,
          };

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        }
        break;
      case 'Date Multi Random':
        getData = groupDetails[index];
        finalData = {
          ...getData,
          data: e.target.value,
        };

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'Date Multi Random Time':
        if (sub == 'date') {
          getData = groupDetails[index];
          finalData = {
            ...getData,
            data: `${e} ${timeValueRandom[index]}`,
          };

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        } else {
          getData = groupDetails[index];
          finalData = {
            ...getData,
            data: `${dateValueRandom[index]} ${e}`,
          };

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        }
        break;
      case 'Radio':
        getData = groupDetails[index];
        finalData = {
          ...getData,
          data: e.target.value,
        };

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
    }
  };

  const handleChangeImage = (event, index) => {
    const resume = event.target.files;

    const reader = new FileReader();
    const file = resume[0];
    reader.readAsDataURL(file);

    reader.onload = () => {
      handleDataChange(
        {
          name: file.name,
          preview: reader.result,
          data: reader.result.split(',')[1],
          remark: 'resume file',
        },
        index,
        'Attachments'
      );
    };
  };
  const [singleDataId, setSingleDataId] = useState('');
  const getCodeNew = async (details) => {
    setGetDetails(details);
    try {
      let res = await axios.get(SERVICE.MYCHECKLIST);
      setDatasAvailedDB(res?.data?.mychecklist);
      let searchItem = res?.data?.mychecklist.find(
        (item) => item.commonid == details?.id && item.module == 'Human Resources' && item.submodule == 'HR' && item.mainpage == 'Employee' && item.subpage == 'Employee Status Details' && item.subsubpage == 'Long Absent Restriction List' && item.status.toLowerCase() !== 'completed'
      );
      if (!searchItem) {
        setPopupContentMalert('Please Assign Checklist at My CheckList Page');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        // navigate("/interview/myinterviewchecklist");
        // window.open("/interview/myinterviewchecklist", "_blank");
      } else if (searchItem) {
        setAssignDetails(searchItem);
        setSingleDataId(searchItem?._id);
        setPostID(searchItem?.commonid);

        setGroupDetails(
          searchItem?.groups?.map((data) => ({
            ...data,
            lastcheck: false,
          }))
        );

        setIsCheckedList(searchItem?.groups?.map((data) => data.lastcheck));

        let forFillDetails = searchItem?.groups?.map((data) => {
          if (data.checklist === 'Date Multi Random Time') {
            if (data?.data && data?.data !== '') {
              const [date, time] = data?.data?.split(' ');
              return { date, time };
            }
          } else {
            return { date: '0', time: '0' };
          }
        });

        let forDateSpan = searchItem?.groups?.map((data) => {
          if (data.checklist === 'Date Multi Span') {
            if (data?.data && data?.data !== '') {
              const [fromdate, todate] = data?.data?.split(' ');
              return { fromdate, todate };
            }
          } else {
            return { fromdate: '0', todate: '0' };
          }
        });

        let forDateTime = searchItem?.groups?.map((data) => {
          if (data.checklist === 'DateTime') {
            if (data?.data && data?.data !== '') {
              const [date, time] = data?.data?.split(' ');
              return { date, time };
            }
          } else {
            return { date: '0', time: '0' };
          }
        });

        let forDateMultiSpanTime = searchItem?.groups?.map((data) => {
          if (data.checklist === 'Date Multi Span Time') {
            if (data?.data && data?.data !== '') {
              const [from, to] = data?.data?.split('/');
              const [fromdate, fromtime] = from?.split(' ');
              const [todate, totime] = to?.split(' ');
              return { fromdate, fromtime, todate, totime };
            }
          } else {
            return { fromdate: '0', fromtime: '0', todate: '0', totime: '0' };
          }
        });

        setDateValueMultiFrom(forDateSpan.map((item) => item?.fromdate));
        setDateValueMultiTo(forDateSpan.map((item) => item?.todate));

        setDateValueRandom(forFillDetails.map((item) => item?.date));
        setTimeValueRandom(forFillDetails.map((item) => item?.time));

        setDateValue(forDateTime.map((item) => item?.date));
        setTimeValue(forDateTime.map((item) => item?.time));

        setFirstDateValue(forDateMultiSpanTime.map((item) => item?.fromdate));
        setFirstTimeValue(forDateMultiSpanTime.map((item) => item?.fromtime));
        setSecondDateValue(forDateMultiSpanTime.map((item) => item?.todate));
        setSecondTimeValue(forDateMultiSpanTime.map((item) => item?.totime));

        setDisableInput(new Array(details?.groups?.length).fill(true));
        handleClickOpenEditCheckList();
      }
      // else {
      //   setIsCheckList(false);
      //   handleAllowLogin(details);
      // }
    } catch (err) {
      console.log(err);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  let name = 'create';
  const [statusOpen, setStatusOpen] = useState(false);
  const handleStatusOpen = () => {
    setStatusOpen(true);
  };
  const handleStatusClose = () => {
    setStatusOpen(false);
  };
  const sendEditStatus = async () => {
    try {
      setBtnloading(getDetails?.id);
      const [res, resNew] = await Promise.all([
        axios.put(`${SERVICE.USER_SINGLE_PWD}/${getDetails?.id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          autoclockoutreleasedates: dateArray,
        }),
        axios.post(SERVICE.CHECKUSERPRESENTINLDAP, {
          username: getDetails?.username,
        }),
      ]);
      if (resNew?.data?.status) {
        await axios.post(
          SERVICE.ENABLEDOMAINUSER,
          {
            username: getDetails?.username,
          },
          {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
          }
        );
      }
      await sendRequest();
      setPopupContent('Allowed Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
      setBtnloading('');
      handleStatusClose();
    } catch (err) {
      console.log(err);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const sendRequestCheckList = async () => {
    let combinedGroups = groupDetails?.map((data) => {
      let check = (data.data !== undefined && data.data !== '') || data.files !== undefined;

      if (check) {
        return {
          ...data,
          completedby: completedbyName,
          completedat: new Date(serverTime),
        };
      } else {
        return {
          ...data,
          completedby: '',
          completedat: '',
        };
      }
    });

    try {
      let assignbranches = await axios.put(`${SERVICE.MYCHECKLIST_SINGLE}/${assignDetails?._id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        commonid: assignDetails?.commonid,
        module: assignDetails?.module,
        submodule: assignDetails?.submodule,
        mainpage: assignDetails?.mainpage,
        subpage: assignDetails?.subpage,
        subsubpage: assignDetails?.subsubpage,
        category: assignDetails?.category,
        subcategory: assignDetails?.subcategory,
        candidatename: assignDetails?.fullname,
        longleaveabsentaprooveddatechecklist: dateArray,
        status: 'Completed',
        groups: combinedGroups,
        updatedby: [
          ...assignDetails?.updatedby,
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });
      handleCloseModEditCheckList();
      setIsCheckedListOverall(false);
      sendEditStatus();
    } catch (err) {
      console.log(err);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleCheckListSubmit = async () => {
    let nextStep = isCheckedList.every((item) => item == true);

    if (!nextStep) {
      setPopupContentMalert('Please Check All the Fields!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      sendRequestCheckList();
    }
  };

  const [isCheckedList, setIsCheckedList] = useState([]);
  const [isCheckedListOverall, setIsCheckedListOverall] = useState(false);
  const overallCheckListChange = () => {
    let newArrayChecked = isCheckedList.map((item) => (item = !isCheckedListOverall));

    let returnOverall = groupDetails.map((row) => {
      {
        if (row.checklist === 'DateTime') {
          if (((row.data !== undefined && row.data !== '') || row.files !== undefined) && row.data.length === 16) {
            return true;
          } else {
            return false;
          }
        } else if (row.checklist === 'Date Multi Span') {
          if (((row.data !== undefined && row.data !== '') || row.files !== undefined) && row.data.length === 21) {
            return true;
          } else {
            return false;
          }
        } else if (row.checklist === 'Date Multi Span Time') {
          if (((row.data !== undefined && row.data !== '') || row.files !== undefined) && row.data.length === 33) {
            return true;
          } else {
            return false;
          }
        } else if (row.checklist === 'Date Multi Random Time') {
          if (((row.data !== undefined && row.data !== '') || row.files !== undefined) && row.data.length === 16) {
            return true;
          } else {
            return false;
          }
        } else if ((row.data !== undefined && row.data !== '') || row.files !== undefined) {
          return true;
        } else {
          return false;
        }
      }
    });

    let allcondition = returnOverall.every((item) => item == true);

    if (allcondition) {
      setIsCheckedList(newArrayChecked);
      setIsCheckedListOverall(!isCheckedListOverall);
    } else {
      setPopupContentMalert('Please Fill all the Fields!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
  };
  const handleCheckboxChange = (index) => {
    const newCheckedState = [...isCheckedList];
    newCheckedState[index] = !newCheckedState[index];

    let currentItem = groupDetails[index];

    let data = () => {
      if (currentItem.checklist === 'DateTime') {
        if (((currentItem.data !== undefined && currentItem.data !== '') || currentItem.files !== undefined) && currentItem.data.length === 16) {
          return true;
        } else {
          return false;
        }
      } else if (currentItem.checklist === 'Date Multi Span') {
        if (((currentItem.data !== undefined && currentItem.data !== '') || currentItem.files !== undefined) && currentItem.data.length === 21) {
          return true;
        } else {
          return false;
        }
      } else if (currentItem.checklist === 'Date Multi Span Time') {
        if (((currentItem.data !== undefined && currentItem.data !== '') || currentItem.files !== undefined) && currentItem.data.length === 33) {
          return true;
        } else {
          return false;
        }
      } else if (currentItem.checklist === 'Date Multi Random Time') {
        if (((currentItem.data !== undefined && currentItem.data !== '') || currentItem.files !== undefined) && currentItem.data.length === 16) {
          return true;
        } else {
          return false;
        }
      } else if ((currentItem.data !== undefined && currentItem.data !== '') || currentItem.files !== undefined) {
        return true;
      } else {
        return false;
      }
    };

    if (data()) {
      setIsCheckedList(newCheckedState);
      handleDataChange(newCheckedState[index], index, 'Check Box');
      let overallChecked = newCheckedState.every((item) => item === true);

      if (overallChecked) {
        setIsCheckedListOverall(true);
      } else {
        setIsCheckedListOverall(false);
      }
    } else {
      setPopupContentMalert('Please Fill the Field!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
  };

  return (
    <Box>
      <NotificationContainer />
      <Headtitle title={'TEAM AUTO CLOCKOUT RESTRICTION'} />
      {/* ****** Header Content ****** */}
      <PageHeading title="Team Auto Clockout Restriction List" modulename="Human Resources" submodulename="HR" mainpagename="Employee" subpagename="Employee Status Details" subsubpagename="Team Auto Clockout Restriction List" />

      {isUserRoleCompare?.includes('ateamautoclockoutrestrictionlist') && (
        <>
          <Box sx={{ ...userStyle.container }}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography sx={userStyle.importheadtext}>Team Auto Clockout Restriction List</Typography>
                </Grid>
                {listpageaccessby === 'Reporting to Based' ? (
                  <Grid item lg={3} md={3} xs={12} sm={6}>
                    <Typography>Filter By</Typography>
                    <TextField readOnly size="small" value={listpageaccessby} />
                  </Grid>
                ) : (
                  <>
                    {' '}
                    <Grid item lg={3} md={3} xs={12} sm={6}>
                      <Typography>
                        Mode<b style={{ color: 'red' }}>*</b>{' '}
                      </Typography>
                      <Selects
                        options={modeDropDowns}

                        value={{
                          label: filterUser.mode,
                          value: filterUser.mode,
                        }}
                        onChange={(e) => {
                          setFilterUser({ ...filterUser, mode: e.value });
                        }}
                        isDisabled={DisableLevelDropdown || listpageaccessby === 'Reporting to Based'}
                      />
                    </Grid>
                    <Grid item lg={3} md={3} xs={12} sm={6}>
                      <Typography>
                        {' '}
                        Level<b style={{ color: 'red' }}>*</b>{' '}
                      </Typography>
                      <Selects
                        options={sectorDropDowns}
                        value={{
                          label: filterUser.level,
                          value: filterUser.level,
                        }}
                        onChange={(e) => {
                          setFilterUser({ ...filterUser, level: e.value });
                        }}
                        isDisabled={listpageaccessby === 'Reporting to Based'}
                      />
                    </Grid>
                  </>
                )}

                <>
                  {/* <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Company <b style={{ color: "red" }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={isAssignBranch
                          ?.map((data) => ({
                            label: data.company,
                            value: data.company,
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
                        value={selectedOptionsCompany}
                        onChange={(e) => {
                          handleCompanyChange(e);
                          setSelectedOptionsBranch([]);
                          setValueBranchCat([]);
                          setValueUnitCat([]);
                          setValueTeamCat([]);
                          setSelectedOptionsUnit([]);
                          setSelectedOptionsTeam([]);
                        }}
                        valueRenderer={customValueRendererCompany}
                        labelledBy="Please Select Company"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>Branch</Typography>
                      <MultiSelect
                        options={isAssignBranch
                          ?.filter((comp) => {
                            let datas = selectedOptionsCompany?.map(
                              (item) => item?.value
                            );
                            return datas?.includes(comp.company);
                          })
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
                          setSelectedOptionsTeam([]);
                          setSelectedOptionsUnit([]);
                          setValueUnitCat([]);
                          setValueTeamCat([]);
                        }}
                        valueRenderer={customValueRendererBranch}
                        labelledBy="Please Select Branch"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>Unit</Typography>
                      <MultiSelect
                        options={isAssignBranch
                          ?.filter((comp) => {
                            let compdatas = selectedOptionsCompany?.map(
                              (item) => item?.value
                            );
                            let branchdatas = selectedOptionsBranch?.map(
                              (item) => item?.value
                            );
                            return (
                              compdatas?.includes(comp.company) &&
                              branchdatas?.includes(comp.branch)
                            );
                          })
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
                          setValueTeamCat([]);
                          setSelectedOptionsTeam([]);
                        }}
                        valueRenderer={customValueRendererUnit}
                        labelledBy="Please Select Unit"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>Team</Typography>
                      <MultiSelect
                        options={allTeam
                          ?.filter((comp) => {
                            let compdatas = selectedOptionsCompany?.map(
                              (item) => item?.value
                            );
                            let branchdatas = selectedOptionsBranch?.map(
                              (item) => item?.value
                            );
                            let unitdatas = selectedOptionsUnit?.map(
                              (item) => item?.value
                            );
                            return (
                              compdatas?.includes(comp.company) &&
                              branchdatas?.includes(comp.branch) &&
                              unitdatas?.includes(comp.unit)
                            );
                          })
                          ?.map((data) => ({
                            label: data.teamname,
                            value: data.teamname,
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
                        value={selectedOptionsTeam}
                        onChange={(e) => {
                          handleTeamChange(e);
                        }}
                        valueRenderer={customValueRendererTeam}
                        labelledBy="Please Select Team"
                      />
                    </FormControl>
                  </Grid> */}
                </>
              </Grid>
              <br /> <br />
              <Grid item md={12} sm={12} xs={12}>
                <br />
                <br />
                <Grid
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '15px',
                  }}
                >
                  <Button variant="contained" onClick={handleSubmit} disabled={isBtnFilter} sx={buttonStyles.buttonsubmit}>
                    Filter
                  </Button>

                  <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                    CLEAR
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </>
      )}
      <br />

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
        <>
          {isUserRoleCompare?.includes('lteamautoclockoutrestrictionlist') && (
            <>
              <Box sx={userStyle.container}>
                {/* ******************************************************EXPORT Buttons****************************************************** */}
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography sx={userStyle.SubHeaderText}>Team Auto Clockout Restriction Pending List</Typography>
                  </Grid>
                  {/* <Grid item xs={4}>
                                        {isUserRoleCompare?.includes('lmychecklist') && (
                                            <>
                                                <Link
                                                    to="/interview/myinterviewchecklist"
                                                    style={{
                                                        textDecoration: 'none',
                                                        color: 'white',
                                                        float: 'right',
                                                    }}
                                                    target="_blank"
                                                >
                                                    <Button variant="contained">My Check List</Button>
                                                </Link>
                                            </>
                                        )}
                                    </Grid> */}
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
                        <MenuItem value={pending?.length}>All</MenuItem>
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
                      {isUserRoleCompare?.includes('excelteamautoclockoutrestrictionlist') && (
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
                      {isUserRoleCompare?.includes('csvteamautoclockoutrestrictionlist') && (
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
                      {isUserRoleCompare?.includes('printteamautoclockoutrestrictionlist') && (
                        <>
                          <Button sx={userStyle.buttongrp} onClick={handleprint}>
                            &ensp;
                            <FaPrint />
                            &ensp;Print&ensp;
                          </Button>
                        </>
                      )}
                      {isUserRoleCompare?.includes('pdfteamautoclockoutrestrictionlist') && (
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
                      {isUserRoleCompare?.includes('imageteamautoclockoutrestrictionlist') && (
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
                      maindatas={pending}
                      setSearchedString={setSearchedString}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      paginated={false}
                      totalDatas={pending}
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
                  itemsList={pending}
                />
              </Box>
            </>
          )}
        </>
      )}

      <br />
      {/* <LongAbsentRestrictionHierarchyListCompleted /> */}

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
        <>
          {isUserRoleCompare?.includes('lteamautoclockoutrestrictionlist') && (
            <>
              <Box sx={userStyle.container}>
                {/* ******************************************************EXPORT Buttons****************************************************** */}
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography sx={userStyle.SubHeaderText}>Team Auto Clockout Restriction Completed List</Typography>
                  </Grid>
                  {/* <Grid item xs={4}>
                                        {isUserRoleCompare?.includes('lmychecklist') && (
                                            <>
                                                <Link
                                                    to="/interview/myinterviewchecklist"
                                                    style={{
                                                        textDecoration: 'none',
                                                        color: 'white',
                                                        float: 'right',
                                                    }}
                                                    target="_blank"
                                                >
                                                    <Button variant="contained">My Check List</Button>
                                                </Link>
                                            </>
                                        )}
                                    </Grid> */}
                </Grid>
                <br />
                <br />
                <Grid container spacing={2} style={userStyle.dataTablestyle}>
                  <Grid item md={2} xs={12} sm={12}>
                    <Box>
                      <label>Show entries:</label>
                      <Select
                        id="pageSizeSelect"
                        value={pageSizeNearTatPrimary}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 180,
                              width: 80,
                            },
                          },
                        }}
                        onChange={handlePageSizeChangeNearTatPrimary}
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
                      {isUserRoleCompare?.includes('excelteamautoclockoutrestrictionlist') && (
                        <>
                          <Button
                            onClick={(e) => {
                              setIsFilterOpennear(true);
                              // fetchMaintentanceIndividual()
                              setFormat('xl');
                            }}
                            sx={userStyle.buttongrp}
                          >
                            <FaFileExcel />
                            &ensp;Export to Excel&ensp;
                          </Button>
                        </>
                      )}
                      {isUserRoleCompare?.includes('csvteamautoclockoutrestrictionlist') && (
                        <>
                          <Button
                            onClick={(e) => {
                              setIsFilterOpennear(true);
                              // fetchMaintentanceIndividual()
                              setFormat('csv');
                            }}
                            sx={userStyle.buttongrp}
                          >
                            <FaFileCsv />
                            &ensp;Export to CSV&ensp;
                          </Button>
                        </>
                      )}
                      {isUserRoleCompare?.includes('printteamautoclockoutrestrictionlist') && (
                        <>
                          <Button sx={userStyle.buttongrp} onClick={handleprintNear}>
                            &ensp;
                            <FaPrint />
                            &ensp;Print&ensp;
                          </Button>
                        </>
                      )}
                      {isUserRoleCompare?.includes('pdfteamautoclockoutrestrictionlist') && (
                        <>
                          <Button
                            sx={userStyle.buttongrp}
                            onClick={() => {
                              setIsPdfFilterOpennear(true);
                              // fetchMaintentanceIndividual()
                            }}
                          >
                            <FaFilePdf />
                            &ensp;Export to PDF&ensp;
                          </Button>
                        </>
                      )}
                      {isUserRoleCompare?.includes('imageteamautoclockoutrestrictionlist') && (
                        <Button sx={userStyle.buttongrp} onClick={handleCaptureImagenear}>
                          {' '}
                          <ImageIcon sx={{ fontSize: '15px' }} /> &ensp;Image&ensp;{' '}
                        </Button>
                      )}
                    </Box>
                  </Grid>
                  <Grid item md={2} xs={6} sm={6}>
                    <AggregatedSearchBar
                      columnDataTable={columnDataTableNeartat}
                      setItems={setItemsNearTat}
                      addSerialNumber={addSerialNumberNearTat}
                      setPage={setPageNearTatPrimary}
                      maindatas={employees}
                      setSearchedString={setSearchedStringNear}
                      searchQuery={searchQueryNearTatPrimary}
                      setSearchQuery={setSearchQueryNearTatPrimary}
                      paginated={false}
                      totalDatas={employees}
                    />
                  </Grid>
                </Grid>
                <br />
                <Button sx={userStyle.buttongrp} onClick={handleShowAllColumnsNeartat}>
                  Show All Columns
                </Button>
                &ensp;
                <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumnsNeartat}>
                  Manage Columns
                </Button>
                &ensp;
                <br />
                <br />
                <AggridTable
                  rowDataTable={rowDataTableNearTat}
                  columnDataTable={columnDataTableNeartat}
                  columnVisibility={columnVisibilityNeartat}
                  page={pageNearTatPrimary}
                  setPage={setPageNearTatPrimary}
                  pageSize={pageSizeNearTatPrimary}
                  totalPages={totalPagesNearTatPrimary}
                  setColumnVisibility={setColumnVisibilityNeartat}
                  isHandleChange={isHandleChange}
                  items={itemsneartat}
                  selectedRows={selectedRowsNear}
                  setSelectedRows={setSelectedRowsNear}
                  gridRefTable={gridRefTableNear}
                  paginated={false}
                  filteredDatas={filteredDatasNearTatPrimary}
                  // totalDatas={totalDatas}
                  searchQuery={searchedStringNear}
                  handleShowAllColumns={handleShowAllColumnsNeartat}
                  setFilteredRowData={setFilteredRowDataNear}
                  filteredRowData={filteredRowDataNear}
                  setFilteredChanges={setFilteredChangesNear}
                  filteredChanges={filteredChangesNear}
                  gridRefTableImg={gridRefTableImgNear}
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

      <Popover
        id={idneartat}
        open={isManageColumnsOpenNeartat}
        anchorEl={anchorElNeartat}
        onClose={handleCloseManageColumnsNeartat}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {manageColumnsContentNeartat}
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
        itemsTwo={pending ?? []}
        filename={'Team Auto Clockout Restriction Pending List'}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />

      <ExportData
        isFilterOpen={isFilterOpennear}
        handleCloseFilterMod={handleCloseFilterModnear}
        fileFormat={fileFormat}
        setIsFilterOpen={setIsFilterOpennear}
        isPdfFilterOpen={isPdfFilterOpennear}
        setIsPdfFilterOpen={setIsPdfFilterOpennear}
        handleClosePdfFilterMod={handleClosePdfFilterModnear}
        filteredDataTwo={(filteredChangesNear !== null ? filteredRowDataNear : rowDataTableNearTat) ?? []}
        itemsTwo={employees ?? []}
        filename={'Team Auto Clockout Restriction Completed List'}
        exportColumnNames={exportColumnNamesNear}
        exportRowValues={exportRowValuesNear}
        componentRef={componentRefNear}
      />

      {/* EXTERNAL COMPONENTS -------------- END */}

      <Dialog
        open={isEditOpenCheckList}
        onClose={handleCloseModEditCheckList}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xl"
        fullWidth={true}
        sx={{
          overflow: 'visible',
          '& .MuiPaper-root': {
            overflow: 'auto',
          },
          marginTop: '95px',
        }}
      >
        <Box sx={{ padding: '20px 50px' }}>
          <>
            <Typography sx={userStyle.SubHeaderText}>My Check List</Typography>
            <br />
            <br />
            <Grid container spacing={2}>
              <Grid item md={12} xs={12} sm={12}>
                <FormControl
                  fullWidth
                  size="small"
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    border: '1px solid black',
                    borderRadius: '20px',
                  }}
                >
                  <Typography sx={{ fontSize: '1rem', textAlign: 'center' }}>
                    Employee Name:{' '}
                    <span
                      style={{
                        fontWeight: '500',
                        fontSize: '1.2rem',
                        display: 'inline-block',
                        textAlign: 'center',
                      }}
                    >
                      {' '}
                      {`${getDetails?.companyname}`}
                    </span>
                  </Typography>
                </FormControl>
              </Grid>
            </Grid>
            <br />
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontSize: '1.2rem' }}>
                      <Checkbox
                        onChange={() => {
                          overallCheckListChange();
                        }}
                        checked={isCheckedListOverall}
                      />
                    </TableCell>
                    <TableCell style={{ fontSize: '1.2rem' }}>Details</TableCell>
                    <TableCell style={{ fontSize: '1.2rem' }}>Field</TableCell>
                    <TableCell style={{ fontSize: '1.2rem' }}>Allotted To</TableCell>
                    <TableCell style={{ fontSize: '1.2rem' }}>Completed By</TableCell>
                    <TableCell style={{ fontSize: '1.2rem' }}>Completed At</TableCell>
                    <TableCell style={{ fontSize: '1.2rem' }}>Status</TableCell>
                    <TableCell style={{ fontSize: '1.2rem' }}>Action</TableCell>

                    <TableCell style={{ fontSize: '1.2rem' }}>Category</TableCell>
                    <TableCell style={{ fontSize: '1.2rem' }}>Sub Category</TableCell>

                    {/* Add more table headers as needed */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupDetails?.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell style={{ fontSize: '1.2rem' }}>
                        <Checkbox
                          onChange={() => {
                            handleCheckboxChange(index);
                          }}
                          checked={isCheckedList[index]}
                        />
                      </TableCell>

                      <TableCell>{row.details}</TableCell>
                      {(() => {
                        switch (row.checklist) {
                          case 'Text Box':
                            return (
                              <TableCell>
                                <OutlinedInput
                                  style={{ height: '32px' }}
                                  value={row.data}
                                  // disabled={disableInput[index]}
                                  onChange={(e) => {
                                    handleDataChange(e, index, 'Text Box');
                                  }}
                                />
                              </TableCell>
                            );
                          case 'Text Box-number':
                            return (
                              <TableCell>
                                <Input
                                  value={row.data}
                                  style={{ height: '32px' }}
                                  type="number"
                                  onChange={(e) => {
                                    handleDataChange(e, index, 'Text Box-number');
                                  }}
                                />
                              </TableCell>
                            );
                          case 'Text Box-alpha':
                            return (
                              <TableCell>
                                <OutlinedInput
                                  style={{ height: '32px' }}
                                  value={row.data}
                                  onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (/^[a-zA-Z]*$/.test(inputValue)) {
                                      handleDataChange(e, index, 'Text Box-alpha');
                                    }
                                  }}
                                />
                              </TableCell>
                            );
                          case 'Text Box-alphanumeric':
                            return (
                              <TableCell>
                                <OutlinedInput
                                  style={{ height: '32px' }}
                                  value={row.data}
                                  onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (/^[a-zA-Z0-9]*$/.test(inputValue)) {
                                      handleDataChange(e, index, 'Text Box-alphanumeric');
                                    }
                                  }}
                                  inputProps={{ pattern: '[A-Za-z0-9]*' }}
                                />
                              </TableCell>
                            );
                          case 'Attachments':
                            return (
                              <TableCell>
                                <div>
                                  <InputLabel sx={{ m: 1 }}>File</InputLabel>

                                  <div>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        marginTop: '10px',
                                        gap: '10px',
                                      }}
                                    >
                                      <Box item md={4} sm={4}>
                                        <section>
                                          <input
                                            type="file"
                                            accept="*/*"
                                            id={index}
                                            onChange={(e) => {
                                              handleChangeImage(e, index);
                                            }}
                                            style={{ display: 'none' }}
                                          />
                                          <label htmlFor={index}>
                                            <Typography sx={buttonStyles.buttonsubmit}>Upload</Typography>
                                          </label>
                                          <br />
                                        </section>
                                      </Box>

                                      <Box item md={4} sm={4}>
                                        <Button onClick={showWebcam} variant="contained" sx={buttonStyles.buttonsubmit}>
                                          <CameraAltIcon />
                                        </Button>
                                      </Box>
                                    </Box>
                                    {row.files && (
                                      <Grid container spacing={2}>
                                        <Grid item lg={8} md={8} sm={8} xs={8}>
                                          <Typography>{row.files.name}</Typography>
                                        </Grid>
                                        <Grid item sx={{ cursor: 'pointer' }} lg={2} md={2} sm={2} xs={2} onClick={() => renderFilePreviewEdit(row.files)}>
                                          <VisibilityOutlinedIcon
                                            style={{
                                              fontsize: 'large',
                                              color: '#357AE8',
                                              cursor: 'pointer',
                                            }}
                                          />
                                        </Grid>
                                        <Grid item lg={1} md={1} sm={1} xs={1}>
                                          <Button
                                            style={{
                                              fontsize: 'large',
                                              color: '#357AE8',
                                              cursor: 'pointer',
                                              marginTop: '-5px',
                                            }}
                                            onClick={() => handleFileDeleteEdit(index)}
                                          >
                                            <DeleteIcon />
                                          </Button>
                                        </Grid>
                                      </Grid>
                                    )}
                                  </div>
                                  <Dialog open={isWebcamOpen} onClose={webcamClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                                    <DialogContent
                                      sx={{
                                        textAlign: 'center',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Webcamimage getImg={getImg} setGetImg={setGetImg} capturedImages={capturedImages} valNum={valNum} setValNum={setValNum} name={name} />
                                    </DialogContent>
                                    <DialogActions>
                                      <Button variant="contained" color="success" onClick={webcamDataStore}>
                                        OK
                                      </Button>
                                      <Button variant="contained" color="error" onClick={webcamClose} sx={buttonStyles.buttonsubmit}>
                                        CANCEL
                                      </Button>
                                    </DialogActions>
                                  </Dialog>
                                </div>
                              </TableCell>
                            );
                          case 'Pre-Value':
                            return (
                              <TableCell>
                                <Typography>{row?.data}</Typography>
                              </TableCell>
                            );
                          case 'Date':
                            return (
                              <TableCell>
                                <OutlinedInput
                                  style={{ height: '32px' }}
                                  type="date"
                                  value={row.data}
                                  onChange={(e) => {
                                    handleDataChange(e, index, 'Date');
                                  }}
                                />
                              </TableCell>
                            );
                          case 'Time':
                            return (
                              <TableCell>
                                <OutlinedInput
                                  style={{ height: '32px' }}
                                  type="time"
                                  value={row.data}
                                  onChange={(e) => {
                                    handleDataChange(e, index, 'Time');
                                  }}
                                />
                              </TableCell>
                            );
                          case 'DateTime':
                            return (
                              <TableCell>
                                <Stack direction="row" spacing={2}>
                                  <OutlinedInput
                                    style={{ height: '32px' }}
                                    type="date"
                                    value={dateValue[index]}
                                    onChange={(e) => {
                                      updateDateValuesAtIndex(e.target.value, index);
                                    }}
                                  />
                                  <OutlinedInput
                                    type="time"
                                    style={{ height: '32px' }}
                                    value={timeValue[index]}
                                    onChange={(e) => {
                                      updateTimeValuesAtIndex(e.target.value, index);
                                    }}
                                  />
                                </Stack>
                              </TableCell>
                            );
                          case 'Date Multi Span':
                            return (
                              <TableCell>
                                <Stack direction="row" spacing={2}>
                                  <OutlinedInput
                                    style={{ height: '32px' }}
                                    type="date"
                                    value={dateValueMultiFrom[index]}
                                    onChange={(e) => {
                                      updateFromDateValueAtIndex(e.target.value, index);
                                    }}
                                  />
                                  <OutlinedInput
                                    type="date"
                                    style={{ height: '32px' }}
                                    value={dateValueMultiTo[index]}
                                    onChange={(e) => {
                                      updateToDateValueAtIndex(e.target.value, index);
                                    }}
                                  />
                                </Stack>
                              </TableCell>
                            );
                          case 'Date Multi Span Time':
                            return (
                              <TableCell>
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                  }}
                                >
                                  <Stack direction="row" spacing={2}>
                                    <OutlinedInput
                                      style={{ height: '32px' }}
                                      type="date"
                                      value={firstDateValue[index]}
                                      onChange={(e) => {
                                        updateFirstDateValuesAtIndex(e.target.value, index);
                                      }}
                                    />
                                    <OutlinedInput
                                      type="time"
                                      style={{ height: '32px' }}
                                      value={firstTimeValue[index]}
                                      onChange={(e) => {
                                        updateFirstTimeValuesAtIndex(e.target.value, index);
                                      }}
                                    />
                                  </Stack>
                                  <Stack direction="row" spacing={2}>
                                    <OutlinedInput
                                      type="date"
                                      style={{ height: '32px' }}
                                      value={secondDateValue[index]}
                                      onChange={(e) => {
                                        updateSecondDateValuesAtIndex(e.target.value, index);
                                      }}
                                    />
                                    <OutlinedInput
                                      style={{ height: '32px' }}
                                      type="time"
                                      value={secondTimeValue[index]}
                                      onChange={(e) => {
                                        updateSecondTimeValuesAtIndex(e.target.value, index);
                                      }}
                                    />
                                  </Stack>
                                </div>
                              </TableCell>
                            );
                          case 'Date Multi Random':
                            return (
                              <TableCell>
                                <OutlinedInput
                                  style={{ height: '32px' }}
                                  type="date"
                                  value={row.data}
                                  onChange={(e) => {
                                    handleDataChange(e, index, 'Date Multi Random');
                                  }}
                                />
                              </TableCell>
                            );
                          case 'Date Multi Random Time':
                            return (
                              <TableCell>
                                <Stack direction="row" spacing={2}>
                                  <OutlinedInput
                                    style={{ height: '32px' }}
                                    type="date"
                                    value={dateValueRandom[index]}
                                    onChange={(e) => {
                                      updateDateValueAtIndex(e.target.value, index);
                                    }}
                                  />
                                  <OutlinedInput
                                    type="time"
                                    style={{ height: '32px' }}
                                    value={timeValueRandom[index]}
                                    onChange={(e) => {
                                      updateTimeValueAtIndex(e.target.value, index);
                                    }}
                                  />
                                </Stack>
                              </TableCell>
                            );
                          case 'Radio':
                            return (
                              <TableCell>
                                <FormControl component="fieldset">
                                  <RadioGroup
                                    value={row.data}
                                    sx={{
                                      display: 'flex',
                                      flexDirection: 'row !important',
                                    }}
                                    onChange={(e) => {
                                      handleDataChange(e, index, 'Radio');
                                    }}
                                  >
                                    <FormControlLabel value="No" control={<Radio />} label="No" />
                                    <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                                  </RadioGroup>
                                </FormControl>
                              </TableCell>
                            );

                          default:
                            return <TableCell></TableCell>; // Default case
                        }
                      })()}
                      <TableCell>
                        <span>{row?.employee && row?.employee?.map((data, index) => <Typography key={index} variant="body1">{`${index + 1}.${data}, `}</Typography>)}</span>
                      </TableCell>
                      <TableCell>
                        <Typography>{row?.completedby}</Typography>
                      </TableCell>
                      <TableCell>{row.completedat && moment(row.completedat).format('DD-MM-YYYY hh:mm:ss A')}</TableCell>
                      <TableCell>
                        {row.checklist === 'DateTime' ? (
                          ((row.data !== undefined && row.data !== '') || row.files !== undefined) && row.data.length === 16 ? (
                            <Typography>Completed</Typography>
                          ) : (
                            <Typography>Pending</Typography>
                          )
                        ) : row.checklist === 'Date Multi Span' ? (
                          ((row.data !== undefined && row.data !== '') || row.files !== undefined) && row.data.length === 21 ? (
                            <Typography>Completed</Typography>
                          ) : (
                            <Typography>Pending</Typography>
                          )
                        ) : row.checklist === 'Date Multi Span Time' ? (
                          ((row.data !== undefined && row.data !== '') || row.files !== undefined) && row.data.length === 33 ? (
                            <Typography>Completed</Typography>
                          ) : (
                            <Typography>Pending</Typography>
                          )
                        ) : row.checklist === 'Date Multi Random Time' ? (
                          ((row.data !== undefined && row.data !== '') || row.files !== undefined) && row.data.length === 16 ? (
                            <Typography>Completed</Typography>
                          ) : (
                            <Typography>Pending</Typography>
                          )
                        ) : (row.data !== undefined && row.data !== '') || row.files !== undefined ? (
                          <Typography>Completed</Typography>
                        ) : (
                          <Typography>Pending</Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        {row.checklist === 'DateTime' ? (
                          ((row.data !== undefined && row.data !== '') || row.files !== undefined) && row.data.length === 16 ? (
                            <>
                              <IconButton
                                sx={{ color: 'green', cursor: 'pointer' }}
                                onClick={() => {
                                  updateIndividualData(index);
                                }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </>
                          ) : (
                            <IconButton
                              sx={{ color: '#1565c0', cursor: 'pointer' }}
                              onClick={() => {
                                let itemValue = disableInput[index];
                                itemValue = false;
                                let spreadData = [...disableInput];
                                spreadData[index] = false;
                                setDisableInput(spreadData);
                              }}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          )
                        ) : row.checklist === 'Date Multi Span' ? (
                          ((row.data !== undefined && row.data !== '') || row.files !== undefined) && row.data.length === 21 ? (
                            <>
                              <IconButton
                                sx={{ color: 'green', cursor: 'pointer' }}
                                onClick={() => {
                                  updateIndividualData(index);
                                }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </>
                          ) : (
                            <IconButton
                              sx={{ color: '#1565c0', cursor: 'pointer' }}
                              onClick={() => {
                                let itemValue = disableInput[index];
                                itemValue = false;
                                let spreadData = [...disableInput];
                                spreadData[index] = false;
                                setDisableInput(spreadData);
                              }}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          )
                        ) : row.checklist === 'Date Multi Span Time' ? (
                          ((row.data !== undefined && row.data !== '') || row.files !== undefined) && row.data.length === 33 ? (
                            <>
                              <IconButton
                                sx={{ color: 'green', cursor: 'pointer' }}
                                onClick={() => {
                                  updateIndividualData(index);
                                }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </>
                          ) : (
                            <IconButton
                              sx={{ color: '#1565c0', cursor: 'pointer' }}
                              onClick={() => {
                                let itemValue = disableInput[index];
                                itemValue = false;
                                let spreadData = [...disableInput];
                                spreadData[index] = false;
                                setDisableInput(spreadData);
                              }}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          )
                        ) : row.checklist === 'Date Multi Random Time' ? (
                          ((row.data !== undefined && row.data !== '') || row.files !== undefined) && row.data.length === 16 ? (
                            <>
                              <IconButton
                                sx={{ color: 'green', cursor: 'pointer' }}
                                onClick={() => {
                                  updateIndividualData(index);
                                }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </>
                          ) : (
                            <IconButton
                              sx={{ color: '#1565c0', cursor: 'pointer' }}
                              onClick={() => {
                                let itemValue = disableInput[index];
                                itemValue = false;
                                let spreadData = [...disableInput];
                                spreadData[index] = false;
                                setDisableInput(spreadData);
                              }}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          )
                        ) : (row.data !== undefined && row.data !== '') || row.files !== undefined ? (
                          <>
                            <IconButton
                              sx={{ color: 'green', cursor: 'pointer' }}
                              onClick={() => {
                                updateIndividualData(index);
                              }}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </>
                        ) : (
                          <IconButton
                            sx={{ color: '#1565c0', cursor: 'pointer' }}
                            onClick={() => {
                              let itemValue = disableInput[index];
                              itemValue = false;
                              let spreadData = [...disableInput];
                              spreadData[index] = false;
                              setDisableInput(spreadData);
                            }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        )}
                      </TableCell>

                      <TableCell>{row.category}</TableCell>
                      <TableCell>{row.subcategory}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <br /> <br /> <br />
            <Grid container>
              <Grid item md={1} sm={1}></Grid>
              <Button variant="contained" onClick={handleCheckListSubmit} sx={buttonStyles.buttonsubmit}>
                Submit
              </Button>
              <Grid item md={1} sm={1}></Grid>
              <Button sx={buttonStyles.btncancel} onClick={handleCloseModEditCheckList}>
                Cancel
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>
      <Box>
        <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '450px', textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">{showAlert}</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" color="error" onClick={handleCloseerr}>
              Close
            </Button>
            <Button variant="contained" color="error" onClick={handleAllowLogin}>
              ok
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <CustomApprovalDialog
        open={dialogOpen}
        handleClose={handleCloseDialog}
        eligibleUsers={eligibleUsers}
        eligibleUsersLevel={eligibleUsersLevel}
      />
      <Box>
        <Dialog
          open={undoOpen}
          onClose={() => {
            setUndoOpen(false);
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent
            sx={{
              width: '350px',
              textAlign: 'center',
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              pt: 4,
            }}
          >
            <>
              {buttonName === 'undo' ? (
                <>
                  <UndoIcon sx={{ fontSize: '100px', color: 'orange' }} />
                  <p style={{ fontSize: '20px', fontWeight: 900 }}>{`Are You Sure? Do You Want to Undo Login Permission for ${rowDetails?.companyname}?`}</p>
                </>
              ) : (
                <>
                  <CheckCircleIcon sx={{ fontSize: '100px', color: 'orange' }} />
                  <p style={{ fontSize: '20px', fontWeight: 900 }}>{`Are You Sure? Do You Want to Allow Login Permission for ${rowDetails?.companyname}?`}</p>
                </>
              )}
            </>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleUndoLogin(rowDetails, buttonName); // Redirect
              }}
            >
              Yes
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setUndoOpen(false);
              }}
            >
              No
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default TeamAutoClockoutRestrictionList;
