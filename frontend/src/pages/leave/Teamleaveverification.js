import React, { useContext, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { FaEdit, FaFileCsv, FaFileExcel, FaFilePdf, FaPrint, FaSearch } from 'react-icons/fa';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ImageIcon from '@mui/icons-material/Image';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
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
  TextareaAutosize,
  Typography,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import axios from '../../axiosInstance';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment-timezone';
import { ThreeDots } from 'react-loader-spinner';
import Selects from 'react-select';
import { useReactToPrint } from 'react-to-print';
import { handleApiError } from '../../components/Errorhandling';
import Headtitle from '../../components/Headtitle';
import { AuthContext, UserRoleAccessContext } from '../../context/Appcontext';
import { userStyle, colourStyles } from '../../pageStyle';
import { SERVICE } from '../../services/Baseservice';
import Webcamimage from '../hr/webcamprofile';
import { IoMdOptions } from 'react-icons/io';
import { MdClose } from 'react-icons/md';
import CompletedTeamLeaveVerification from './CompletedTeamLeaveVerification';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { getCurrentServerTime } from '../../components/getCurrentServerTime';
import ExcelJS from 'exceljs';
import domtoimage from 'dom-to-image';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import ExportData from '../../components/ExportData';
import MessageAlert from '../../components/MessageAlert';
import PageHeading from '../../components/PageHeading';
import AlertDialog from '../../components/Alert';
import AdvancedSearchBar from '../../components/SearchbarEbList';
import ManageColumnsContent from '../../components/ManageColumn';
import ResizeObserver from 'resize-observer-polyfill';


window.ResizeObserver = ResizeObserver;
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
function TeamLeaveVerification() {

  const [serverTime, setServerTime] = useState(null);
  var today = new Date(serverTime);
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + "-" + mm + "-" + dd;
  const [filterUser, setFilterUser] = useState({ filtertype: "Individual", fromdate: today, todate: today, });

  useEffect(() => {
    const fetchTime = async () => {
      const time = await getCurrentServerTime();
      setServerTime(time);
      setFilterUser({ ...filterUser, fromdate: moment(time).format('YYYY-MM-DD'), todate: moment(time).format('YYYY-MM-DD') });

    };

    fetchTime();
  }, []);

  function formatCustomDateTime(date) {
    if (!date) {
      return '';
    }
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const yyyy = date.getFullYear();

    let hh = date.getHours();
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    const period = hh >= 12 ? 'PM' : 'AM';

    hh = String(hh).padStart(2, '0');

    return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss} ${period}`;
  }

  let cellStyles = {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    lineHeight: 'normal',
    // fontSize: "12px"
  };


  const gridRefTableTeamLveVerif = useRef(null);
  const gridRefImageTeamLveVerif = useRef(null);
  const [isBtn, setIsBtn] = useState(false);
  const [Accessdrop, setAccesDrop] = useState('Employee');
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
  const [modeselection, setModeSelection] = useState({
    label: 'My Hierarchy List',
    value: 'myhierarchy',
  });
  const [sectorSelection, setSectorSelection] = useState({
    label: 'Primary',
    value: 'Primary',
  });
  const [appleave, setAppleave] = useState({
    employeename: 'Please Select Employee Name',
    employeeid: '',
    leavetype: 'Please Select LeaveType',
    date: '',
    todate: '',
    reasonforleave: '',
    reportingto: '',
    department: '',
    designation: '',
    doj: '',
    availabledays: '',
    durationtype: 'Random',
    weekoff: '',
    workmode: '',
  });

  const [appleaveEdit, setAppleaveEdit] = useState([]);
  const [selectStatus, setSelectStatus] = useState({});
  const [isApplyLeave, setIsApplyLeave] = useState([]);
  const [isInidvidualStatus, setIsInidvidualStatus] = useState({});

  const [applyleaves, setApplyleaves] = useState([]);
  const [completedApplyleaves, setCompletedApplyleaves] = useState([]);
  const [updated, setUpdated] = useState(null);

  // State to track advanced filter
  const [advancedFilter, setAdvancedFilter] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [columnApi, setColumnApi] = useState(null);
  const [filteredDataItems, setFilteredDataItems] = useState(applyleaves);
  const [filteredRowData, setFilteredRowData] = useState([]);

  const [leave, setLeave] = useState('Please Select LeaveType');
  const [leaveEdit, setLeaveEdit] = useState('Please Select LeaveType');

  const { isUserRoleCompare, allProjects, isUserRoleAccess, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);
  const [DisableLevelDropdown, setDisableLevelDropdown] = useState(false)

  const [applyleaveCheck, setApplyleavecheck] = useState(true);

  const [selectedRows, setSelectedRows] = useState([]);

  const [statusOpen, setStatusOpen] = useState(false);
  const handleStatusOpen = () => {
    setStatusOpen(true);
  };
  const handleStatusClose = () => {
    setStatusOpen(false);
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

  //Datatable
  const [pageTeamLveVerif, setPageTeamLveVerif] = useState(1);
  const [pageSizeTeamLveVerif, setPageSizeTeamLveVerif] = useState(10);
  const [searchQueryTeamLveVerif, setSearchQueryTeamLveVerif] = useState('');
  const [totalPagesTeamLveVerif, setTotalPagesTeamLveVerif] = useState(1);

  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };

  // Manage Columns
  const [searchQueryManageTeamLveVerif, setSearchQueryManageTeamLveVerif] = useState('');
  const [isManageColumnsOpenTeamLveVerif, setManageColumnsOpenTeamLveVerif] = useState(false);
  const [anchorElTeamLveVerif, setAnchorElTeamLveVerif] = useState(null);

  const handleOpenManageColumnsTeamLveVerif = (event) => {
    setAnchorElTeamLveVerif(event.currentTarget);
    setManageColumnsOpenTeamLveVerif(true);
  };
  const handleCloseManageColumnsTeamLveVerif = () => {
    setManageColumnsOpenTeamLveVerif(false);
    setSearchQueryManageTeamLveVerif('');
  };

  const openTeamLveVerif = Boolean(anchorElTeamLveVerif);
  const idTeamLveVerif = openTeamLveVerif ? 'simple-popover' : undefined;

  // Search bar
  const [anchorElSearchTeamLveVerif, setAnchorElSearchTeamLveVerif] = React.useState(null);
  const handleClickSearchTeamLveVerif = (event) => {
    setAnchorElSearchTeamLveVerif(event.currentTarget);
  };
  const handleCloseSearchTeamLveVerif = () => {
    setAnchorElSearchTeamLveVerif(null);
    setSearchQueryTeamLveVerif('');
  };

  const openSearchTeamLveVerif = Boolean(anchorElSearchTeamLveVerif);
  const idSearchTeamLveVerif = openSearchTeamLveVerif ? 'simple-popover' : undefined;

  // Table row color
  const getRowStyle = (params) => {
    if (params.node.rowIndex % 2 === 0) {
      return { background: '#f0f0f0' }; // Even row
    } else {
      return { background: '#ffffff' }; // Odd row
    }
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
      const isAvailable = res?.data?.checklistverificationmasters?.some((item) => item.mainpage === 'Apply Leave');
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

  useEffect(() => {
    getapi();
    isChecklistAssigned();
  }, []);

  const getapi = async () => {
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String('Team Leave Verification'),
      commonid: String(isUserRoleAccess?._id),
      date: String(new Date(serverTime)),
      addedby: [
        {
          name: String(isUserRoleAccess?.username),
          // date: String(new Date(serverTime)),
        },
      ],
    });
  };

  const [isEditOpenCheckList, setIsEditOpenCheckList] = useState(false);
  const handleClickOpenEditCheckList = () => {
    setIsEditOpenCheckList(true);
  };
  const handleCloseModEditCheckList = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setIsEditOpenCheckList(false);
  };

  // Update history
  const [isOpenHistoryUpdate, setIsOpenHistoryUpdate] = useState(false);
  const handleClickOpenHistoryUpdate = () => {
    setIsOpenHistoryUpdate(true);
  };
  const handleCloseModHistoryUpdate = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setIsOpenHistoryUpdate(false);
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
      setPopupContentMalert('Please Fill all the Fields');
      setPopupSeverityMalert('warning');
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
      setPopupContentMalert('Please Fill the Field');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    }
  };

  let name = 'create';

  //webcam
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [getImg, setGetImg] = useState(null);
  const [isWebcamCapture, setIsWebcamCapture] = useState(false);
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
    setPageName(!pageName);
    let searchItem = datasAvailedDB.find((item) => item.commonid == postID && item.module == 'Leave&Permission' && item.submodule == 'Leave' && item.mainpage == 'Apply Leave' && item.status.toLowerCase() !== 'completed');

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
          groups: combinedGroups,
          addedby: [
            {
              name: String(isUserRoleAccess.companyname),
              // date: String(new Date(serverTime)),
            },
          ],
        });
        await fecthDBDatas();
      }
      setPopupContent('Updated Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  async function fecthDBDatas() {
    setPageName(!pageName);
    try {
      let res = await axios.get(SERVICE.MYCHECKLIST);
      setDatasAvailedDB(res?.data?.mychecklist);

      let foundData = res?.data?.mychecklist.find((item) => item.commonid == postID);
      setGroupDetails(foundData?.groups);
    } catch (err) {
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

  const getCodeNew = async (details) => {
    console.log(details, "details")
    setPageName(!pageName);
    setGetDetails(details);
    try {
      let res = await axios.get(SERVICE.MYCHECKLIST);
      setDatasAvailedDB(res?.data?.mychecklist);
      let searchItem = res?.data?.mychecklist.find((item) => item.commonid == details?.id && item.module == 'Leave&Permission' && item.submodule == 'Leave' && item.mainpage == 'Apply Leave' && item.status.toLowerCase() !== 'completed');
      await fetchFilteredUsersStatus(details);

      if (searchItem) {
        setAssignDetails(searchItem);

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

      } else {
        setIsCheckList(false);

      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };


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


  const fetchFilteredUsersStatus = async (user) => {
    setPageName(!pageName)
    const montharray = getMonthsInRange(filterUser.fromdate, filterUser.todate);
    try {

      let response = await axios.post(SERVICE.GET_HIERARCHY_BASED_EMPLOYEE_NAMEFIND, {
        companyname: user?.employeename,
        empcode: user?.employeeid
      }, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        }
      });

      const ManagerAccess = isUserRoleAccess?.role?.some(data => data?.toLowerCase() === "manager")

      if (ManagerAccess) {
        handleStatusOpen()
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
              handleStatusOpen();
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
          handleStatusOpen();
        }

      }
      // 3. Use the `results` array as needed

    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  
  const handleCheckListSubmit = async () => {
    let nextStep = isCheckedList.every((item) => item == true);

    if (!nextStep) {
      setPopupContentMalert('Please Check All the Fields');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else {
      sendRequestCheckList();
    }
  };

  const sendRequestCheckList = async () => {
    setPageName(!pageName);
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
        status: 'Completed',
        groups: combinedGroups,
        updatedby: [
          ...assignDetails?.updatedby,
          {
            name: String(isUserRoleAccess.companyname),
            // date: String(new Date(serverTime)),
          },
        ],
      });
      handleCloseModEditCheckList();
      setIsCheckedListOverall(false);
      sendEditStatus();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Show All Columns & Manage Columns
  const initialColumnVisibilityTeamLveVerif = {
    serialNumber: true,
    checkbox: true,
    employeename: true,
    employeeid: true,
    leavetype: true,
    date: true,
    todate: true,
    numberofdays: true,
    reasonforleave: true,
    reportingto: true,
    actions: true,
    status: true,
    history: true,
    overallhistory: true,
    monthhistory: true,
  };

  const [columnVisibilityTeamLveVerif, setColumnVisibilityTeamLveVerif] = useState(initialColumnVisibilityTeamLveVerif);

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ''; // This is required for Chrome support
  };

  let dateselect = new Date(serverTime);
  dateselect.setDate(dateselect.getDate() + 3);
  var ddt = String(dateselect.getDate()).padStart(2, '0');
  var mmt = String(dateselect.getMonth() + 1).padStart(2, '0');
  var yyyyt = dateselect.getFullYear();
  let formattedDatet = yyyyt + '-' + mmt + '-' + ddt;

  let datePresent = new Date(serverTime);
  var ddp = String(datePresent.getDate());
  var mmp = String(datePresent.getMonth() + 1);
  var yyyyp = datePresent.getFullYear();
  let formattedDatePresent = yyyyp + '-' + mmp + '-' + ddp;

  const getinfoCodeStatus = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.APPLYLEAVE_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setSelectStatus(res?.data?.sapplyleave);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [attStatus, setAttStatus] = useState([]);
  const [attModearr, setAttModearr] = useState([]);
  const [attStatusOption, setAttStatusOption] = useState([]);

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

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Function to find the day before and after a given day name
  function getDayBeforeAndAfter(dayName) {
    const index = daysOfWeek.indexOf(dayName);
    const beforeIndex = index === 0 ? 6 : index - 1; // Wrap around to Saturday if Sunday
    const afterIndex = index === 6 ? 0 : index + 1; // Wrap around to Sunday if Saturday
    return [daysOfWeek[beforeIndex], daysOfWeek[afterIndex]];
  }

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

  const [selectedEmpData, setSelectedEmpData] = useState({});
  const [selectedEmpDataUpdate, setSelectedEmpDataUpdate] = useState({});
  const [historyOverAllData, setHistoryOverAllData] = useState([]);
  const [historyMonthData, setHistoryMonthData] = useState([]);
  const [historyOverAllDataUpdate, setHistoryOverAllDataUpdate] = useState([]);
  const [historyMonthDataUpdate, setHistoryMonthDataUpdate] = useState([]);

  function getMonthsInRange(fromdate, todate) {
    const startDate = new Date(fromdate);
    const endDate = new Date(todate);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const result = [];

    // Previous month based on `fromdate`
    const prevMonth = startDate.getMonth() === 0 ? 11 : startDate.getMonth() - 1;
    const prevYear = startDate.getMonth() === 0 ? startDate.getFullYear() - 1 : startDate.getFullYear();
    result.push({ month: monthNames[prevMonth], year: prevYear.toString() });

    // Add selected months between `fromdate` and `todate`
    const currentDate = new Date(startDate);
    currentDate.setDate(1); // Normalize to the start of the month
    while (currentDate.getFullYear() < endDate.getFullYear() || (currentDate.getFullYear() === endDate.getFullYear() && currentDate.getMonth() <= endDate.getMonth())) {
      result.push({
        month: monthNames[currentDate.getMonth()],
        year: currentDate.getFullYear().toString(),
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Next month based on `todate`
    const nextMonth = endDate.getMonth() === 11 ? 0 : endDate.getMonth() + 1;
    const nextYear = endDate.getMonth() === 11 ? endDate.getFullYear() + 1 : endDate.getFullYear();
    result.push({ month: monthNames[nextMonth], year: nextYear.toString() });

    return result;
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getUserClockinAndClockoutStatus = async (empname, montharray, fromDate, toDate) => {
    try {
      let res_attcriteria = await axios.get(`${SERVICE.GET_ATTENDANCE_CONTROL_CRITERIA}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let attendanceCriteriaData = res_attcriteria?.data?.attendancecontrolcriteria[0];

      let res_applyleave = await axios.post(SERVICE.APPLYLEAVE_APPROVED, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        employee: empname,
      });

      let leaveresult = res_applyleave?.data?.applyleaves?.filter(data => data.leavetype !== 'Leave Without Pay (LWP)');
      let leaveresultWithoutPay = res_applyleave?.data?.applyleaves?.filter(data => data.leavetype === 'Leave Without Pay (LWP)');

      let res = await axios.post(SERVICE.USER_CLOCKIN_CLOCKOUT_STATUS_FILTER, {
        employee: empname,
        fromdate: fromDate,
        todate: toDate,
        montharray: [...montharray],
      },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );

      let res_type = await axios.get(SERVICE.LEAVETYPE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let resdatawithlwp = [...res_type?.data?.leavetype, { leavetype: 'Leave Without Pay (LWP)', code: "LWP" }]

      let leavestatusApproved = [];
      resdatawithlwp?.map((type) => {
        res_applyleave?.data?.applyleaves && res_applyleave?.data?.applyleaves?.forEach((d) => {
          if (type.leavetype === d.leavetype && d.tookleavecheckstatus === 'Single' && d.leavestatus === 'Shift') {
            leavestatusApproved.push(type.code + ' ' + d.status)
          }
          if (type.leavetype === d.leavetype && d.tookleavecheckstatus === 'Double' && d.leavestatus === 'Shift') {
            leavestatusApproved.push('DL' + ' - ' + type.code + ' ' + d.status)
          }
          if (type.leavetype === d.leavetype && d.tookleavecheckstatus === 'Double Day' && d.leavestatus === 'Shift') {
            leavestatusApproved.push('DDL' + ' - ' + type.code + ' ' + d.status)
          }
        });
      });

      const rearr = [...new Set(leavestatusApproved)];

      // console.log(rearr, 'rearr')

      const filtered = res?.data?.finaluser?.filter(d => {
        const formattedDate = new Date(d.finalDate);
        const reasonDate = new Date(d.reasondate);
        const dojDate = new Date(d.doj);

        if (d.reasondate && d.reasondate !== "") {
          return (formattedDate <= reasonDate);
        } else if (d.doj && d.doj !== "") {
          return (formattedDate >= dojDate);
        } else {
          return d;
        }
      });

      const findPreviousNonWeekOff = (items, index) => {
        for (let i = index - 1; i >= 0; i--) {
          if (items[i].clockinstatus !== 'Week Off' && items[i].clockoutstatus !== 'Week Off') {
            return items[i];
          }
        }
        return null;
      };

      const findNextNonWeekOff = (items, index) => {
        for (let i = index + 1; i < items.length; i++) {
          if (items[i].clockinstatus !== 'Week Off' && items[i].clockoutstatus !== 'Week Off') {
            return items[i];
          }
        }
        return null;
      };

      const changedWeekoffResult = filtered?.map((item, index) => {
        let updatedClockInStatus = item.clockinstatus;
        let updatedClockOutStatus = item.clockoutstatus;

        const itemDate = moment(item.rowformattedDate, "DD/MM/YYYY");

        // For Week Off status
        if (item.clockinstatus === 'Week Off' && item.clockoutstatus === 'Week Off') {
          const prev = findPreviousNonWeekOff(filtered, index);
          const next = findNextNonWeekOff(filtered, index);

          const isPrevLeave = leaveresult.some(leaveItem => prev && moment(leaveItem.date, "DD/MM/YYYY").isSame(moment(prev.rowformattedDate, "DD/MM/YYYY"), 'day') && leaveItem.empcode === item.empcode);
          const isPrevAbsent = prev && prev.empcode === item.empcode && prev.clockinstatus === 'Absent' && prev.clockoutstatus === 'Absent' && prev.clockin === '00:00:00' && prev.clockout === '00:00:00';

          const isNextLeave = leaveresult.some(leaveItem => next && moment(leaveItem.date, "DD/MM/YYYY").isSame(moment(next.rowformattedDate, "DD/MM/YYYY"), 'day') && leaveItem.empcode === item.empcode);
          const isNextAbsent = next && next.empcode === item.empcode && next.clockinstatus === 'Absent' && next.clockoutstatus === 'Absent' && next.clockin === '00:00:00' && next.clockout === '00:00:00';

          const isPrevLeaveWithoutPay = leaveresultWithoutPay.some(leaveItem => prev && moment(leaveItem.date, "DD/MM/YYYY").isSame(moment(prev.rowformattedDate, "DD/MM/YYYY"), 'day') && leaveItem.empcode === item.empcode);
          const isNextLeaveWithoutPay = leaveresultWithoutPay.some(leaveItem => next && moment(leaveItem.date, "DD/MM/YYYY").isSame(moment(next.rowformattedDate, "DD/MM/YYYY"), 'day') && leaveItem.empcode === item.empcode);

          if (isPrevLeave && isNextLeave) {
            updatedClockInStatus = updatedClockOutStatus = 'BeforeAndAfterWeekOffLeave';
          } else if (isPrevAbsent && isNextAbsent) {
            updatedClockInStatus = updatedClockOutStatus = 'BeforeAndAfterWeekOffAbsent';
          } else if (isPrevLeaveWithoutPay && isNextLeaveWithoutPay) {
            updatedClockInStatus = updatedClockOutStatus = 'BeforeAndAfterWeekOffAbsent';
          } else if (isPrevLeave) {
            updatedClockInStatus = updatedClockOutStatus = 'BeforeWeekOffLeave';
          } else if (isPrevAbsent || isPrevLeaveWithoutPay) {
            updatedClockInStatus = updatedClockOutStatus = 'BeforeWeekOffAbsent';
          } else if (isNextLeave) {
            updatedClockInStatus = updatedClockOutStatus = 'AfterWeekOffLeave';
          } else if (isNextAbsent || isNextLeaveWithoutPay) {
            updatedClockInStatus = updatedClockOutStatus = 'AfterWeekOffAbsent';
          }
        }

        return {
          ...item,
          clockinstatus: updatedClockInStatus,
          clockoutstatus: updatedClockOutStatus,
        };
      });
      // console.log(changedWeekoffResult, 'changedWeekoffResult')

      const resultBefore = [];

      const empGrouped = {};

      changedWeekoffResult.forEach(item => {
        if (!empGrouped[item.empcode]) empGrouped[item.empcode] = [];
        empGrouped[item.empcode].push(item);
      });

      const leaveStatuses = [
        ...rearr,
        "Absent", "BL - Absent",
      ];

      // console.log(leaveStatuses, 'leaveStatuses')
      Object.keys(empGrouped).forEach(empcode => {
        const records = empGrouped[empcode]
          .sort((a, b) => moment(a.rowformattedDate, "DD/MM/YYYY") - moment(b.rowformattedDate, "DD/MM/YYYY"));

        let streak = [];
        let counterIn = 1;
        let counterOut = 1;

        for (let i = 0; i < records.length; i++) {
          const current = records[i];
          const isWeekOff = current.shift === "Week Off";
          const isShiftNotStarted = current.clockinstatus === 'Shift Not Started' && current.clockoutstatus === 'Shift Not Started'

          const isLeaveDay =
            current.clockin === "00:00:00" &&
            current.clockout === "00:00:00" &&
            leaveStatuses.includes(current.clockinstatus) &&
            !isWeekOff && !isShiftNotStarted;

          if (isLeaveDay) {
            streak.push(current);
          } else if (isWeekOff) {
            // Push Week Off directly, don’t reset streak
            resultBefore.push(current);
          } else {
            // Encountered present day, finalize streak
            if (streak.length > attendanceCriteriaData?.longabsentcount) {
              streak.forEach(day => {
                let clockinstatus = day.clockinstatus;
                let clockoutstatus = day.clockoutstatus;

                if (clockinstatus === "Absent") {
                  clockinstatus = `${counterIn++}Long Absent`;
                } else if (clockinstatus === "BL - Absent") {
                  clockinstatus = `${counterIn++}Long BL - Absent`;
                } else if (rearr?.includes(clockinstatus)) {
                  clockinstatus = `${counterIn++}Long Leave ${rearr?.filter(d => d === clockinstatus)}`;
                }

                if (clockoutstatus === "Absent") {
                  clockoutstatus = `${counterOut++}Long Absent`;
                } else if (clockoutstatus === "BL - Absent") {
                  clockoutstatus = `${counterOut++}Long BL - Absent`;
                } else if (rearr?.includes(clockoutstatus)) {
                  clockoutstatus = `${counterOut++}Long Leave ${rearr?.filter(d => d === clockoutstatus)}`;
                }

                resultBefore.push({
                  ...day,
                  clockinstatus,
                  clockoutstatus
                });
              });
            } else {
              resultBefore.push(...streak); // push as-is
            }

            resultBefore.push(current); // current present day
            streak = [];
            counterIn = 1;
            counterOut = 1;
          }
        }

        // Remaining streak at end
        if (streak.length > attendanceCriteriaData?.longabsentcount) {
          streak.forEach(day => {
            let clockinstatus = day.clockinstatus;
            let clockoutstatus = day.clockoutstatus;

            if (clockinstatus === "Absent") {
              clockinstatus = `${counterIn++}Long Absent`;
            } else if (clockinstatus === "BL - Absent") {
              clockinstatus = `${counterIn++}Long BL - Absent`;
            } else if (rearr?.includes(clockinstatus)) {
              clockinstatus = `${counterIn++}Long Leave ${rearr?.filter(d => d === clockinstatus)}`;
            }

            if (clockoutstatus === "Absent") {
              clockoutstatus = `${counterOut++}Long Absent`;
            } else if (clockoutstatus === "BL - Absent") {
              clockoutstatus = `${counterOut++}Long BL - Absent`;
            } else if (rearr?.includes(clockoutstatus)) {
              clockoutstatus = `${counterOut++}Long Leave ${rearr?.filter(d => d === clockoutstatus)}`;
            }

            resultBefore.push({
              ...day,
              clockinstatus,
              clockoutstatus
            });
          });
        } else {
          resultBefore.push(...streak);
        }
      });
      resultBefore.sort((a, b) => moment(a.rowformattedDate, "DD/MM/YYYY") - moment(b.rowformattedDate, "DD/MM/YYYY"));

      // console.log(resultBefore, 'resultBefore')

      // Group data by empcode
      let groupedData = {};
      resultBefore.forEach((item) => {
        if (!groupedData[item.empcode]) {
          groupedData[item.empcode] = {
            attendanceRecords: [],
            departmentDateSet: item.departmentDateSet || [],
          };
        }
        groupedData[item.empcode].attendanceRecords.push(item);
      });
      // console.log(groupedData, 'groupedData')
      let result = [];

      for (let empcode in groupedData) {
        let { attendanceRecords, departmentDateSet } = groupedData[empcode];

        departmentDateSet.forEach((dateRange) => {
          let { fromdate, todate, department } = dateRange;

          let countByEmpcodeClockin = {};
          let countByEmpcodeClockout = {};

          let recordsInDateRange = attendanceRecords.filter((record) => {
            let formattedDate = new Date(record.finalDate);
            return department === record.department && formattedDate >= new Date(fromdate) && formattedDate <= new Date(todate);
          });

          let processedRecords = recordsInDateRange.map((item) => {
            let formattedDate = new Date(item.finalDate);
            let reasonDate = item.reasondate ? new Date(item.reasondate) : null;
            let dojDate = item.doj ? new Date(item.doj) : null;

            let updatedClockInStatus = item.clockinstatus;
            let updatedClockOutStatus = item.clockoutstatus;

            // Check if the date falls within the reasonDate or dojDate
            if (reasonDate && formattedDate > reasonDate) {
              return null;
            }
            if (dojDate && formattedDate < dojDate) {
              return null;
            }

            // Handling Late Clock-in and Early Clock-out
            if (!countByEmpcodeClockin[item.empcode]) {
              countByEmpcodeClockin[item.empcode] = 1;
            }
            if (!countByEmpcodeClockout[item.empcode]) {
              countByEmpcodeClockout[item.empcode] = 1;
            }

            if (updatedClockInStatus === "Late - ClockIn") {
              updatedClockInStatus = `${countByEmpcodeClockin[item.empcode]}Late - ClockIn`;
              countByEmpcodeClockin[item.empcode]++;
            }

            if (updatedClockOutStatus === "Early - ClockOut") {
              updatedClockOutStatus = `${countByEmpcodeClockout[item.empcode]}Early - ClockOut`;
              countByEmpcodeClockout[item.empcode]++;
            }

            return {
              ...item,
              department,
              fromdate,
              todate,
              clockinstatus: updatedClockInStatus,
              clockoutstatus: updatedClockOutStatus,
            };
          });

          result.push(...processedRecords.filter(Boolean));
        });
      }

      const itemsWithSerialNumber = result?.map((item) => (
        {
          ...item,
          id: item.id,
          shiftmode: item.shiftMode,
          uniqueid: item.id,
          userid: item.userid,
          attendanceauto: getattendancestatus(item),
          daystatus: item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item),
          appliedthrough: getAttModeAppliedThr(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
          lop: getAttModeLop(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
          loptype: getAttModeLopType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
          lopcalculation: getFinalLop(
            getAttModeLop(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
            getAttModeLopType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item))
          ),
          modetarget: getAttModeTarget(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
          paidpresentbefore: getAttModePaidPresent(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
          paidleavetype: getAttModePaidPresentType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
          paidpresent: getFinalPaid(
            getAttModePaidPresent(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
            getAttModePaidPresentType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item))
          ),
          lopday: getAssignLeaveDayForLop(
            getFinalLop(
              getAttModeLop(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
              getAttModeLopType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item))
            )
          ),
          paidpresentday: getAssignLeaveDayForPaid(
            getFinalPaid(
              getAttModePaidPresent(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
              getAttModePaidPresentType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item))
            )
          ),
          isweekoff: getIsWeekoff(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
          isholiday: getIsHoliday(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
        }));

      // console.log(itemsWithSerialNumber, 'itemsWithSerialNumber bef')
      const weekOption = ['BeforeWeekOffAbsent', 'AfterWeekOffAbsent', 'BeforeWeekOffLeave', 'AfterWeekOffLeave', 'BeforeAndAfterWeekOffAbsent', 'BeforeAndAfterWeekOffLeave'];

      function getPreviousRelevantEntry(index, array) {
        for (let i = index - 1; i >= 0; i--) {
          if (array[i].shift !== 'Week Off') {
            return array[i];
          }
        }
        return null;
      }

      function getNextRelevantEntry(index, array) {
        for (let i = index + 1; i < array.length; i++) {
          if (array[i].shift !== 'Week Off') {
            return array[i];
          }
        }
        return null;
      }

      itemsWithSerialNumber.forEach((item, index, array) => {
        if (item.shift === 'Week Off') {

          const previousItem = getPreviousRelevantEntry(index, array);
          const nextItem = getNextRelevantEntry(index, array);

          const isLopRelevant = (entry) => entry && (entry.lopcalculation === 'Yes - Full Day' || entry.lopcalculation === 'Yes - Double Day');

          const isPreviousManualPaidFull =
            previousItem &&
            previousItem.appliedthrough === 'Manual' &&
            previousItem.paidpresent === 'Yes - Full Day';

          const isNextManualPaidFull =
            nextItem &&
            nextItem.appliedthrough === 'Manual' &&
            nextItem.paidpresent === 'Yes - Full Day';

          const isPrevLop = isLopRelevant(previousItem) && !isPreviousManualPaidFull;
          const isNextLop = isLopRelevant(nextItem) && !isNextManualPaidFull;

          if (isPrevLop && isNextLop) {
            item.clockinstatus = 'BeforeAndAfterWeekOffAbsent';
            item.clockoutstatus = 'BeforeAndAfterWeekOffAbsent';
          } else if (isPrevLop) {
            item.clockinstatus = 'BeforeWeekOffAbsent';
            item.clockoutstatus = 'BeforeWeekOffAbsent';
          } else if (isNextLop) {
            item.clockinstatus = 'AfterWeekOffAbsent';
            item.clockoutstatus = 'AfterWeekOffAbsent';
          }

          // Recalculate attendance status if needed
          item.attendanceauto = getattendancestatus(item);
          item.daystatus = item.attendanceautostatus || getattendancestatus(item);
          item.appliedthrough = getAttModeAppliedThr(item.attendanceautostatus || getattendancestatus(item));
          item.lop = getAttModeLop(item.attendanceautostatus || getattendancestatus(item));
          item.loptype = getAttModeLopType(item.attendanceautostatus || getattendancestatus(item));
          item.lopcalculation = getFinalLop(
            getAttModeLop(item.attendanceautostatus || getattendancestatus(item)),
            getAttModeLopType(item.attendanceautostatus || getattendancestatus(item))
          );
          item.modetarget = getAttModeTarget(item.attendanceautostatus || getattendancestatus(item));
          item.paidpresentbefore = getAttModePaidPresent(item.attendanceautostatus || getattendancestatus(item));
          item.paidleavetype = getAttModePaidPresentType(item.attendanceautostatus || getattendancestatus(item));
          item.paidpresent = getFinalPaid(
            getAttModePaidPresent(item.attendanceautostatus || getattendancestatus(item)),
            getAttModePaidPresentType(item.attendanceautostatus || getattendancestatus(item))
          );
          item.lopday = getAssignLeaveDayForLop(
            getFinalLop(
              getAttModeLop(item.attendanceautostatus || getattendancestatus(item)),
              getAttModeLopType(item.attendanceautostatus || getattendancestatus(item))
            )
          );
          item.paidpresentday = getAssignLeaveDayForPaid(
            getFinalPaid(
              getAttModePaidPresent(item.attendanceautostatus || getattendancestatus(item)),
              getAttModePaidPresentType(item.attendanceautostatus || getattendancestatus(item))
            )
          );
          item.isweekoff = getIsWeekoff(item.attendanceautostatus || getattendancestatus(item));
          item.isholiday = getIsHoliday(item.attendanceautostatus || getattendancestatus(item));

        }
        if (attStatusOption.includes(item.daystatus) && item.clockin === "00:00:00" && item.clockout === "00:00:00" && item.appliedthrough === 'Manual' && item.paidpresent === "Yes - Full Day") {

          const previousItem = array[index - 1];
          const nextItem = array[index + 1];

          const hasRelevantStatus = (entry) => entry && ((weekOption.includes(entry.clockinstatus) || weekOption.includes(entry.clockoutstatus)) && entry.shift === 'Week Off');

          if (hasRelevantStatus(previousItem)) {
            if (!weekOption.includes(previousItem.clockinstatus)) {
              previousItem.clockinstatus = 'Week Off';
              previousItem.clockoutstatus = 'Week Off';
              previousItem.attendanceauto = getattendancestatus(previousItem);
              previousItem.daystatus = previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem);
              previousItem.appliedthrough = getAttModeAppliedThr(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem));
              previousItem.lop = getAttModeLop(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem));
              previousItem.loptype = getAttModeLopType(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem));
              previousItem.lopcalculation = getFinalLop(
                getAttModeLop(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem)),
                getAttModeLopType(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem))
              );
              previousItem.modetarget = getAttModeTarget(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem));
              previousItem.paidpresentbefore = getAttModePaidPresent(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem));
              previousItem.paidleavetype = getAttModePaidPresentType(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem));
              previousItem.paidpresent = getFinalPaid(
                getAttModePaidPresent(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem)),
                getAttModePaidPresentType(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem))
              );
              previousItem.lopday = getAssignLeaveDayForLop(
                getFinalLop(
                  getAttModeLop(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem)),
                  getAttModeLopType(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem))
                )
              );
              previousItem.paidpresentday = getAssignLeaveDayForPaid(
                getFinalPaid(
                  getAttModePaidPresent(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem)),
                  getAttModePaidPresentType(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem))
                )
              );
              previousItem.isweekoff = getIsWeekoff(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem));
              previousItem.isholiday = getIsHoliday(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem));
            }
          }
          if (hasRelevantStatus(nextItem)) {
            if (!weekOption.includes(nextItem.clockinstatus)) {
              nextItem.clockinstatus = 'Week Off';
              nextItem.clockoutstatus = 'Week Off';
              nextItem.attendanceauto = getattendancestatus(nextItem);
              nextItem.daystatus = nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem);
              nextItem.appliedthrough = getAttModeAppliedThr(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem));
              nextItem.lop = getAttModeLop(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem));
              nextItem.loptype = getAttModeLopType(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem));
              nextItem.lopcalculation = getFinalLop(
                getAttModeLop(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem)),
                getAttModeLopType(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem))
              );
              nextItem.modetarget = getAttModeTarget(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem));
              nextItem.paidpresentbefore = getAttModePaidPresent(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem));
              nextItem.paidleavetype = getAttModePaidPresentType(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem));
              nextItem.paidpresent = getFinalPaid(
                getAttModePaidPresent(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem)),
                getAttModePaidPresentType(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem))
              );
              nextItem.lopday = getAssignLeaveDayForLop(
                getFinalLop(
                  getAttModeLop(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem)),
                  getAttModeLopType(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem))
                )
              );
              nextItem.paidpresentday = getAssignLeaveDayForPaid(
                getFinalPaid(
                  getAttModePaidPresent(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem)),
                  getAttModePaidPresentType(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem))
                )
              );
              nextItem.isweekoff = getIsWeekoff(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem));
              nextItem.isholiday = getIsHoliday(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem));
            }
          }
        }
      })
      return itemsWithSerialNumber;
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  }

  const fetchLeaveHistoryUpdate = async (empid, empname, rowdate, rowleavetype) => {
    if (selectStatus.status === 'Rejected' && selectStatus.rejectedreason === '') {
      setPopupContentMalert('Please Enter Reason');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else {
      try {

        rowdate.sort((a, b) => new Date(a.split('/').reverse().join('/')) - new Date(b.split('/').reverse().join('/')));

        let fromDate = '';
        let toDate = '';

        if (rowdate.length > 0) {
          const [fday, fmonth, fyear] = rowdate[0]?.split('/');
          const [tday, tmonth, tyear] = rowdate[rowdate.length - 1]?.split('/');
          fromDate = `${fyear}-${fmonth}-${fday}`;
          toDate = `${tyear}-${tmonth}-${tday}`;
        } else {
          const [fday, fmonth, fyear] = rowdate[0]?.split('/');
          fromDate = `${fyear}-${fmonth}-${fday}`;
          toDate = `${fyear}-${fmonth}-${fday}`;
        }

        const montharray = getMonthsInRange(fromDate, toDate);

        // Get the current month and year
        const currentDate = new Date(serverTime);
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        let res_vendor = await axios.post(SERVICE.APPLYLEAVE_EMPLOYEEID_FILTER, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          employeeid: empid,
        });

        let overallClockinoutStatusCounts = {};
        let monthlyClockinoutStatusCounts = {};

        const answer = await getUserClockinAndClockoutStatus(empname, montharray, fromDate, toDate);

        if (answer?.length > 0) {

          // Filter for the current month's data
          const monthlyData = answer.filter((item) => {
            const formattedDate = new Date(item.finalDate);
            const leaveDate = new Date(formattedDate);
            return leaveDate.getMonth() + 1 === currentMonth && leaveDate.getFullYear() === currentYear;
          });

          const normalizeStatus = (status) => {
            return status.replace(/^\d+/, '').trim(); // removes leading digits and trims spaces
          };

          const isAbsent = (status) => {
            const absentStatuses = [
              'Long Absent',
              'Long BL - Absent',
              'BL - Absent',
              'BeforeAndAfterWeekOffAbsent',
              'BeforeWeekOffAbsent',
              'AfterWeekOffAbsent',
              'Absent',
            ];
            return absentStatuses.includes(normalizeStatus(status));
          };

          const isLateAndEarly = (status) => {
            const absentStatuses = ['Late - ClockIn', 'Early - ClockOut']
            return absentStatuses.includes(normalizeStatus(status));
          };

          // Function to calculate leave counts
          const calculatePermissionCounts = (data) => {
            return data.reduce((acc, item) => {
              if (!acc[item.empcode]) {
                acc[item.empcode] = {
                  employeename: item.username,
                  empcode: item.empcode,
                  approvedCount: 0,
                  appliedCount: 0,
                  rejectedCount: 0,
                  uninformedCount: 0,
                  lateClockinCount: 0,
                  earlyClockoutCount: 0,
                  autoMisClockoutCount: 0,
                  absentCount: 0,
                };
              }

              // Count Approved and Applied statuses
              if (isLateAndEarly(item.clockinstatus)) {
                acc[item.empcode].lateClockinCount += 1;
              }
              if (isLateAndEarly(item.clockoutstatus)) {
                acc[item.empcode].earlyClockoutCount += 1;
              }
              if (item.clockoutstatus === 'Auto Mis - ClockOut') {
                acc[item.empcode].autoMisClockoutCount += 1;
              }

              if ((isAbsent(item.clockinstatus) && isAbsent(item.clockoutstatus)) || item.clockinstatus === 'FLOP' || item.clockoutstatus === 'FLOP') {
                acc[item.empcode].absentCount += 1;
              }

              return acc;
            }, {});
          };

          // Calculate leave counts for overall and monthly data
          overallClockinoutStatusCounts = calculatePermissionCounts(answer);
          monthlyClockinoutStatusCounts = calculatePermissionCounts(monthlyData);
        }

        let uninformResult = res_vendor?.data?.applyleaves;
        const groupKey = `${empid}_${rowleavetype}`;

        if (uninformResult?.length > 0) {
          // Filter for the current month's data
          const monthlyData = uninformResult.filter((item) => {
            return item.date.some((date) => {
              const leaveDate = new Date(date.split('/').reverse().join('-'));

              return leaveDate.getMonth() + 1 === currentMonth && leaveDate.getFullYear() === currentYear;
            });
          });

          // Function to calculate leave counts grouped by leavetype
          const calculateLeaveCounts = (data, type) => {
            return data.reduce((acc, item) => {
              const key = `${item.employeeid}_${item.leavetype}`;

              if (!acc[key]) {
                acc[key] = {
                  employeename: item.employeename,
                  employeeid: item.employeeid,
                  leavetype: item.leavetype,
                  approvedCount: 0,
                  appliedCount: 0,
                  rejectedCount: 0,
                  uninformedCount: 0,
                };
              }
              // Loop through all dates to count leaves separately for each date
              item.date.forEach((date) => {
                const leaveDate = new Date(date.split('/').reverse().join('-'));

                if (type === 'Month' && leaveDate.getMonth() + 1 === currentMonth && leaveDate.getFullYear() === currentYear) {
                  // Count Approved, Applied, and Rejected statuses
                  if (item.status === 'Approved') {
                    acc[key].approvedCount += 1;
                  } else if (item.status === 'Applied') {
                    acc[key].appliedCount += 1;
                  } else if (item.status === 'Rejected') {
                    acc[key].rejectedCount += 1;
                  }
                } else {
                  // Count Approved, Applied, and Rejected statuses
                  if (item.status === 'Approved') {
                    acc[key].approvedCount += 1;
                  } else if (item.status === 'Applied') {
                    acc[key].appliedCount += 1;
                  } else if (item.status === 'Rejected') {
                    acc[key].rejectedCount += 1;
                  }
                }
                if (item.commonuninformedleavestatus === 'Uninformed') {
                  acc[key].uninformedCount += 1;
                }
                setSelectedEmpDataUpdate({
                  employeename: item.employeename,
                  employeeid: item.employeeid,
                });
              });
              return acc;
            }, {});
          };

          // Calculate leave counts for overall and monthly data
          const overallLeaveCounts = calculateLeaveCounts(uninformResult, 'Overall');
          const monthlyLeaveCounts = calculateLeaveCounts(monthlyData, 'Month');

          // // Transform the counts object into an array format
          // const transformCounts = (counts) => Object.values(counts);

          // setHistoryOverAllDataUpdate(transformCounts(overallLeaveCounts));
          // setHistoryMonthDataUpdate(transformCounts(monthlyLeaveCounts));
          setHistoryOverAllDataUpdate([{ ...overallLeaveCounts[groupKey], lateClockinCount: overallClockinoutStatusCounts[empid]?.lateClockinCount, earlyClockoutCount: overallClockinoutStatusCounts[empid]?.earlyClockoutCount, autoMisClockoutCount: overallClockinoutStatusCounts[empid]?.autoMisClockoutCount, absentCount: overallClockinoutStatusCounts[empid]?.absentCount }]);
          setHistoryMonthDataUpdate([{ ...monthlyLeaveCounts[groupKey], lateClockinCount: monthlyClockinoutStatusCounts[empid]?.lateClockinCount, earlyClockoutCount: monthlyClockinoutStatusCounts[empid]?.earlyClockoutCount, autoMisClockoutCount: monthlyClockinoutStatusCounts[empid]?.autoMisClockoutCount, absentCount: monthlyClockinoutStatusCounts[empid]?.absentCount }]);
        } else {
          setSelectedEmpData({ employeename: empname, employeeid: empid });
          setHistoryOverAllData([]);
          setHistoryMonthData([]);
        }
        handleClickOpenHistoryUpdate();
      } catch (err) {
        handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
      }
    }
  };

  const [uploadDetails, setUploadDetails] = useState([]);

  // list view option code
  const [isimgviewbill, setImgviewbill] = useState(false);
  const handleImgcodeviewbill = () => {
    setImgviewbill(true);
  };
  const handlecloseImgcodeviewbill = () => {
    setImgviewbill(false);
  };

  const getUploadDetails = async (rowdata) => {
    let res = await axios.post(SERVICE.GET_FILTERED_USERDOCUMENTUPLOADS_FOR_LEAVE, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      dateArray: rowdata.date,
      employee: rowdata.employeename,
    });
    setUploadDetails(res?.data?.userdocumentuploads);
  };

  const getDownloadFile = async (id) => {
    let res = await axios.get(`${SERVICE.USERDOCUMENTUPLOAD_SINGLE}/${id}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });
    const filesbill = await getMultipleFilesAsObjects(res?.data?.suserdocumentupload?.files, 'userdocuments', res?.data?.suserdocumentupload?.uniqueId);
    handleFetchBill(filesbill, res?.data?.suserdocumentupload?.files);
    handleImgcodeviewbill();
  };

  const getMultipleFilesAsObjects = async (filenames, type, uniqueId) => {
    const files = [];
    for (const name of filenames) {
      const res = await axios.post(
        SERVICE.USERDOCUMENTS_EDIT_FETCH,
        { filename: `${uniqueId}$${type}$${name}` },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          responseType: 'blob',
        }
      );

      const blob = res.data;
      const file = new File([blob], name, { type: blob.type });
      files.push(file);
    }

    return files;
  };

  const [getimgbillcode, setGetImgbillcode] = useState([]);

  const handleFetchBill = (data, remarks) => {
    const files = Array.from(data); // Ensure it's an array

    const fileReaders = [];
    const newSelectedFiles = [];

    // imageFiles.forEach((file) => {
    files.forEach((file) => {
      const reader = new FileReader();

      const readerPromise = new Promise((resolve) => {
        reader.onload = () => {
          const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            preview: reader.result,
          };
          newSelectedFiles.push(fileData);
          resolve(file);
        };
      });

      reader.readAsDataURL(file);
      fileReaders.push(readerPromise);
    });

    Promise.all(fileReaders).then((originalFiles) => {
      setGetImgbillcode(newSelectedFiles);
    });
  };

  const renderFilePreview = async (file) => {
    const response = await fetch(file.preview);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    window.open(link, '_blank');
  };

  //Project updateby edit page...
  let updatedByStatus = selectStatus.updatedby;

  //editing the single data...

  const sendEditStatus = async () => {
    handleCloseerr();
    setPageName(!pageName);
    try {
      let res = await axios.put(`${SERVICE.APPLYLEAVE_SINGLE}/${selectStatus._id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        status: String(selectStatus.status),
        rejectedreason: String(selectStatus.status === 'Rejected' ? selectStatus.rejectedreason : ''),
        actionby: String(isUserRoleAccess.companyname),
        updatedby: [
          ...updatedByStatus,
          {
            name: String(isUserRoleAccess.companyname),
            // date: String(new Date(serverTime)),
          },
        ],
      });
      await fetchApplyleave();
      handleStatusClose();
      setPopupContent('Updated Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const editStatus = () => {
    handleCloseModHistoryUpdate();
    if (selectStatus.status === 'Rejected') {
      if (selectStatus.rejectedreason == '') {
        setPopupContentMalert('Please Enter Reject Reason');
        setPopupSeverityMalert('warning');
        handleClickOpenPopupMalert();
      } else {
        sendEditStatus();
      }
    } else if (selectStatus.status == 'Approved') {
      if (isAssigned) {
        if (isCheckList) {
          handleClickOpenEditCheckList();
        } else {
          setPopupContentMalert(
            <>
              Please Fill the Checklist. Click this link:{' '}
              <a href="/interview/myinterviewchecklist" target="_blank" rel="noopener noreferrer">
                My Checklist
              </a>
            </>
          );
          setPopupSeverityMalert('warning');
          handleClickOpenPopupMalert();
        }
      } else {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Checklist is Not Assigned for this Page. Wish to continue?'}</p>
          </>
        );
        handleClickOpenerr();
      }
    } else {
      sendEditStatus();
    }
  };

  //get all Sub vendormasters.
  const fetchApplyleave = async () => {
    setApplyleavecheck(false);
    setPageName(!pageName);
    try {
      let res_employee = await axios.post(SERVICE.APPLYLEAVE_FILTERED_HIERARCHY_PAGE_BASED, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        hierachy: modeselection.value,
        sector: sectorSelection.value,
        username: isUserRoleAccess.companyname,
        team: isUserRoleAccess.team,
        pagename: 'menuteamleaveverification',
        role: isUserRoleAccess?.role
      });
      setDisableLevelDropdown(res_employee?.data?.DataAccessMode)

      setApplyleavecheck(true);
      if (!res_employee?.data?.DataAccessMode && res_employee?.data?.resultedTeam?.length > 0 && res_employee?.data?.resultAccessFilter?.length < 1 && ['myallhierarchy', 'allhierarchy']?.includes(modeselection.value)) {
        setIsBtn(false);
        setApplyleavecheck(true);
        setUpdated(null);
        setDisableLevelDropdown(false)
        alert('Some employees have not been given access to this page.');
      }

      let answer = res_employee?.data?.resultAccessFilter?.length > 0 ? res_employee?.data?.resultAccessFilter?.filter((data) => data?.updatestatus === 'Not Completed') : [];
      let answerCompleted = res_employee?.data?.resultAccessFilter?.length > 0 ? res_employee?.data?.resultAccessFilter?.filter((data) => data?.updatestatus === 'Completed') : [];

      // Get the current month and year
      const currentDate = new Date(serverTime);
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      let res_vendor = await axios.get(SERVICE.APPLYLEAVE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let uninformResult = res_vendor?.data?.applyleaves;
      let overallLeaveCounts = {};
      let monthlyLeaveCounts = {};

      if (uninformResult?.length > 0) {
        // Filter for the current month's data
        const monthlyData = uninformResult.filter((item) => {
          return item.date.some((date) => {
            const leaveDate = new Date(date.split('/').reverse().join('-'));

            return leaveDate.getMonth() + 1 === currentMonth && leaveDate.getFullYear() === currentYear;
          });
        });

        // Function to calculate leave counts grouped by leavetype
        const calculateLeaveCounts = (data, type) => {
          return data.reduce((acc, item) => {
            // const key = `${item.employeeid}_${item.leavetype}`;
            const key = item.employeeid;

            if (!acc[key]) {
              acc[key] = {
                employeename: item.employeename,
                employeeid: item.employeeid,
                leavetype: item.leavetype,
                status: item.status,
                approvedCount: 0,
                appliedCount: 0,
                rejectedCount: 0,
              };
            }

            // Loop through all dates to count leaves separately for each date
            item.date.forEach((date) => {
              const leaveDate = new Date(date.split('/').reverse().join('-')); // Convert DD/MM/YYYY to YYYY-MM-DD
              // console.log(date, 'date')
              if (type === 'Month' && leaveDate.getMonth() + 1 === currentMonth && leaveDate.getFullYear() === currentYear) {
                // Increment counts for each valid leave date
                // console.log(item.status)
                if (item.status === 'Approved') {
                  acc[key].approvedCount += 1;
                } else if (item.status === 'Applied') {
                  acc[key].appliedCount += 1;
                } else if (item.status === 'Rejected') {
                  acc[key].rejectedCount += 1;
                }
              }
              if (type === 'Overall') {
                if (item.status === 'Approved') {
                  acc[key].approvedCount += 1;
                } else if (item.status === 'Applied') {
                  acc[key].appliedCount += 1;
                } else if (item.status === 'Rejected') {
                  acc[key].rejectedCount += 1;
                }
              }
            });
            return acc;
          }, {});
        };

        // Calculate leave counts for overall and monthly data
        overallLeaveCounts = calculateLeaveCounts(uninformResult, 'Overall');
        monthlyLeaveCounts = calculateLeaveCounts(monthlyData, 'Month');
      }

      const itemsWithSerialNumberNotCompleted = answer.map((item, index) => {
        // const groupedItemOverAllNotCompleted = overallLeaveCounts[`${item.employeeid}_${item.leavetype}`];
        // const groupedItemMonthNotCompleted = monthlyLeaveCounts[`${item.employeeid}_${item.leavetype}`];

        const groupedItemOverAllNotCompleted = overallLeaveCounts[item.employeeid];
        const groupedItemMonthNotCompleted = monthlyLeaveCounts[item.employeeid];

        return {
          ...item,
          id: item._id,
          serialNumber: index + 1,
          // overAllappliedCount: groupedItemOverAllNotCompleted?.appliedCount ? `${groupedItemOverAllNotCompleted?.leavetype}_${groupedItemOverAllNotCompleted?.status}_${groupedItemOverAllNotCompleted?.appliedCount}` : 0,
          // overAllapprovedCount: groupedItemOverAllNotCompleted?.approvedCount ? `${groupedItemOverAllNotCompleted?.leavetype}_${groupedItemOverAllNotCompleted?.status}_${groupedItemOverAllNotCompleted?.approvedCount}` : 0,
          // overAllrejectedCount: groupedItemOverAllNotCompleted?.rejectedCount ? `${groupedItemOverAllNotCompleted?.leavetype}_${groupedItemOverAllNotCompleted?.status}_${groupedItemOverAllNotCompleted?.rejectedCount}` : 0,
          // monthlyappliedCount: groupedItemMonthNotCompleted?.appliedCount ? `${groupedItemMonthNotCompleted?.leavetype}_${groupedItemOverAllNotCompleted?.status}_${groupedItemOverAllNotCompleted?.appliedCount}` : 0,
          // monthlyapprovedCount: groupedItemMonthNotCompleted?.approvedCount ? `${groupedItemMonthNotCompleted?.leavetype}_${groupedItemOverAllNotCompleted?.status}_${groupedItemOverAllNotCompleted?.approvedCount}` : 0,
          // monthlyrejectedCount: groupedItemMonthNotCompleted?.rejectedCount ? `${groupedItemMonthNotCompleted?.leavetype}_${groupedItemOverAllNotCompleted?.status}_${groupedItemOverAllNotCompleted?.rejectedCount}` : 0,

          overAllappliedCount: groupedItemOverAllNotCompleted?.appliedCount || 0,
          overAllapprovedCount: groupedItemOverAllNotCompleted?.approvedCount || 0,
          overAllrejectedCount: groupedItemOverAllNotCompleted?.rejectedCount || 0,
          monthlyappliedCount: groupedItemMonthNotCompleted?.appliedCount || 0,
          monthlyapprovedCount: groupedItemMonthNotCompleted?.approvedCount || 0,
          monthlyrejectedCount: groupedItemMonthNotCompleted?.rejectedCount || 0,
        };
      });

      // console.log(itemsWithSerialNumberNotCompleted, 'itemsWithSerialNumberNotCompleted');
      const itemsWithSerialNumberCompleted = answerCompleted?.map((item, index) => {
        const groupedItemOverAllCompleted = overallLeaveCounts[item.employeeid];
        const groupedItemMonthCompleted = monthlyLeaveCounts[item.employeeid];

        return {
          ...item,
          id: item._id,
          serialNumber: index + 1,
          overAllappliedCount: groupedItemOverAllCompleted?.appliedCount || 0,
          overAllapprovedCount: groupedItemOverAllCompleted?.approvedCount || 0,
          overAllrejectedCount: groupedItemOverAllCompleted?.rejectedCount || 0,
          monthlyappliedCount: groupedItemMonthCompleted?.appliedCount || 0,
          monthlyapprovedCount: groupedItemMonthCompleted?.approvedCount || 0,
          monthlyrejectedCount: groupedItemMonthCompleted?.rejectedCount || 0,
        };
      });

      setApplyleaves(itemsWithSerialNumberNotCompleted);
      setCompletedApplyleaves(itemsWithSerialNumberCompleted);
      // setApplyleaves(answer.map((item, index) => ({ ...item, serialNumber: index + 1 })));
      // setCompletedApplyleaves(answerCompleted.map((item, index) => ({ ...item, serialNumber: index + 1 })));
      setTotalPagesTeamLveVerif(Math.ceil(answer.length / pageSizeTeamLveVerif));
      setUpdated(null);
      setIsApplyLeave([]);
    } catch (err) {
      setApplyleavecheck(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    if (updated !== null) {
      fetchApplyleave();
    }
  }, [updated]);

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, []);

  const [items, setItems] = useState([]);

  const addSerialNumber = () => {
    const itemsWithSerialNumber = applyleaves?.map((item, index) => ({
      ...item,
      id: item._id,
      serialNumber: item.serialNumber,
      employeeid: item.employeeid,
      employeename: item.employeename,
      leavetype: item.leavetype,
      // date: item.date + "--" + item.todate,
      date: item.date,
      numberofdays: item.numberofdays === '' ? '---' : item.numberofdays,
      reasonforleave: item.reasonforleave,
      status: item.status,
    }));
    setItems(itemsWithSerialNumber);
    setFilteredDataItems(itemsWithSerialNumber);
  };

  useEffect(() => {
    addSerialNumber();
  }, [applyleaves]);

  const defaultColDef = useMemo(() => {
    return {
      filter: true,
      resizable: true,
      filterParams: {
        buttons: ['apply', 'reset', 'cancel'],
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
    if (gridRefTableTeamLveVerif.current) {
      const gridApi = gridRefTableTeamLveVerif.current.api;
      const currentPage = gridApi.paginationGetCurrentPage() + 1;
      const totalPagesTeamLveVerif = gridApi.paginationGetTotalPages();
      setPageTeamLveVerif(currentPage);
      setTotalPagesTeamLveVerif(totalPagesTeamLveVerif);
    }
  }, []);

  // Pagination for innter filter
  const getVisiblePageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 3;

    const startPage = Math.max(1, pageTeamLveVerif - 1);
    const endPage = Math.min(totalPagesTeamLveVerif, startPage + maxVisiblePages - 1);

    // Loop through and add visible pageTeamLveVerif numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // If there are more pages after the last visible pageTeamLveVerif, show ellipsis
    if (endPage < totalPagesTeamLveVerif) {
      pageNumbers.push('...');
    }

    return pageNumbers;
  };

  // Pagination for outer filter
  const filteredData = filteredDataItems?.slice((pageTeamLveVerif - 1) * pageSizeTeamLveVerif, pageTeamLveVerif * pageSizeTeamLveVerif);
  const totalPagesTeamLveVerifOuter = Math.ceil(filteredDataItems?.length / pageSizeTeamLveVerif);
  const visiblePages = Math.min(totalPagesTeamLveVerifOuter, 3);
  const firstVisiblePage = Math.max(1, pageTeamLveVerif - 1);
  const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPagesTeamLveVerifOuter);
  const pageNumbers = [];
  const indexOfLastItem = pageTeamLveVerif * pageSizeTeamLveVerif;
  const indexOfFirstItem = indexOfLastItem - pageSizeTeamLveVerif;
  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }

  const columnDataTableTeamLveVerif = [
    {
      field: 'serialNumber',
      headerName: 'SNo',
      flex: 0,
      width: 80,
      hide: !columnVisibilityTeamLveVerif.serialNumber,
      headerClassName: 'bold-header',
      pinned: 'left',
      lockPinned: true,
    },
    {
      field: 'employeeid',
      headerName: 'Employee Id',
      flex: 0,
      width: 150,
      hide: !columnVisibilityTeamLveVerif.employeeid,
      headerClassName: 'bold-header',
      pinned: 'left',
      lockPinned: true,
    },
    {
      field: 'employeename',
      headerName: 'Employee Name',
      flex: 0,
      width: 270,
      hide: !columnVisibilityTeamLveVerif.employeename,
      headerClassName: 'bold-header',
      pinned: 'left',
      lockPinned: true,
    },
    {
      field: 'leavetype',
      headerName: 'Leave Type',
      flex: 0,
      width: 170,
      hide: !columnVisibilityTeamLveVerif.leavetype,
      headerClassName: 'bold-header',
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 0,
      width: 120,
      hide: !columnVisibilityTeamLveVerif.date,
      headerClassName: 'bold-header',
    },
    {
      field: 'numberofdays',
      headerName: 'Number of Days',
      flex: 0,
      width: 170,
      hide: !columnVisibilityTeamLveVerif.numberofdays,
      headerClassName: 'bold-header',
    },
    {
      field: 'reasonforleave',
      headerName: 'Reason For Leave',
      flex: 0,
      width: 250,
      hide: !columnVisibilityTeamLveVerif.reasonforleave,
      headerClassName: 'bold-header',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0,
      width: 150,
      hide: !columnVisibilityTeamLveVerif.status,
      headerClassName: 'bold-header',
      cellRenderer: (params) => {
        if (!(isUserRoleAccess?.role?.includes('Manager') || isUserRoleAccess?.role?.includes('HiringManager') || isUserRoleAccess?.role?.includes('HR') || isUserRoleAccess?.role?.includes('Superadmin')) && !['Approved'].includes(params.data.status)) {
          return (
            <Grid sx={{ display: 'flex' }}>
              <Button
                variant="contained"
                style={{
                  margin: '5px',
                  backgroundColor: params.value === 'Applied' ? '#FFC300' : params.value === 'Approved' ? 'green' : 'inherit',
                  color: params.value === 'Applied' ? 'black' : 'white',
                  fontSize: '10px',
                  width: '60px',
                  fontWeight: 'bold',
                }}
              >
                {params.value}
              </Button>
            </Grid>
          );
        } else {
          return (
            <Grid sx={{ display: 'flex' }}>
              <Button
                variant="contained"
                style={{
                  margin: '5px',
                  backgroundColor: params.value === 'Applied' ? '#FFC300' : params.value === 'Approved' ? 'green' : 'inherit',
                  color: params.value === 'Applied' ? 'black' : 'white',
                  fontSize: '10px',
                  width: '60px',
                  fontWeight: 'bold',
                }}
              >
                {params.value}
              </Button>
            </Grid>
          );
        }
      },
    },
    {
      field: 'overallhistory',
      headerName: 'History',
      flex: 0,
      width: 250,
      hide: !columnVisibilityTeamLveVerif.overallhistory,
      cellStyle: cellStyles,
      headerClass: 'header-wrap',
      cellRenderer: (params) => (
        <Grid>
          <Typography variant="body2">Total Applied: {params.data.overAllappliedCount}</Typography>
          <Typography variant="body2">Total Approved: {params.data.overAllapprovedCount}</Typography>
          <Typography variant="body2">Total Rejected: {params.data.overAllrejectedCount}</Typography>
        </Grid>
      ),
    },
    {
      field: 'monthhistory',
      headerName: 'Current Month History',
      flex: 0,
      width: 250,
      hide: !columnVisibilityTeamLveVerif.monthhistory,
      cellStyle: cellStyles,
      headerClass: 'header-wrap',
      cellRenderer: (params) => (
        <Grid>
          <Typography variant="body2">Total Applied: {params.data.monthlyappliedCount}</Typography>
          <Typography variant="body2">Total Approved: {params.data.monthlyapprovedCount}</Typography>
          <Typography variant="body2">Total Rejected: {params.data.monthlyrejectedCount}</Typography>
        </Grid>
      ),
    },
    {
      field: 'actions',
      headerName: 'Action',
      flex: 0,
      width: 100,
      minHeight: '40px !important',
      filter: false,
      sortable: false,
      hide: !columnVisibilityTeamLveVerif.actions,
      headerClassName: 'bold-header',
      cellRenderer: (params) => (
        <Grid sx={{ display: 'flex' }}>
          {isUserRoleCompare?.includes('eteamleaveverification') && (
            <Button
              variant="contained"
              style={{
                margin: '5px',
                backgroundColor: 'red',
                minWidth: '15px',
                padding: '6px 5px',
              }}
              onClick={(e) => {
                getinfoCodeStatus(params.data.id);
                getUploadDetails(params.data);

                setIsInidvidualStatus(params.data);
                getCodeNew(params.data);
              }}
            >
              <FaEdit style={{ color: 'white', fontSize: '17px' }} />
            </Button>
          )}
        </Grid>
      ),
    },
  ];

  // Datatable
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQueryTeamLveVerif(value);
    applyNormalFilter(value);
    setFilteredRowData([]);
  };

  const DateFrom = (isUserRoleAccess.role.includes('HiringManager') || isUserRoleAccess.role.includes('Manager') || isUserRoleCompare.includes('lteamleaveverification')) && Accessdrop === 'HR' ? formattedDatePresent : formattedDatet;

  const applyNormalFilter = (searchValue) => {
    // Split the search query into individual terms
    const searchTerms = searchValue.toLowerCase().split(' ');

    // Modify the filtering logic to check each term
    const filtered = items?.filter((item) => {
      return searchTerms.every((term) => Object.values(item).join(' ').toLowerCase().includes(term));
    });
    setFilteredDataItems(filtered);
    setPageTeamLveVerif(1);
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
          case 'Contains':
            match = itemValue.includes(filterValue);
            break;
          case 'Does Not Contain':
            match = !itemValue?.includes(filterValue);
            break;
          case 'Equals':
            match = itemValue === filterValue;
            break;
          case 'Does Not Equal':
            match = itemValue !== filterValue;
            break;
          case 'Begins With':
            match = itemValue.startsWith(filterValue);
            break;
          case 'Ends With':
            match = itemValue.endsWith(filterValue);
            break;
          case 'Blank':
            match = !itemValue;
            break;
          case 'Not Blank':
            match = !!itemValue;
            break;
          default:
            match = true;
        }

        // Combine conditions with AND/OR logic
        if (index === 0) {
          return match; // First filter is applied directly
        } else if (logicOperator === 'AND') {
          return acc && match;
        } else {
          return acc || match;
        }
      }, true);
    });

    setFilteredDataItems(filtered);
    setAdvancedFilter(filters);
    // handleCloseSearchTeamLveVerif();
  };

  // Undo filter funtion
  const handleResetSearch = () => {
    setAdvancedFilter(null);
    setSearchQueryTeamLveVerif('');
    setFilteredDataItems(applyleaves);
  };

  // Show filtered combination in the search bar
  const getSearchDisplay = () => {
    if (advancedFilter && advancedFilter.length > 0) {
      return advancedFilter
        .map((filter, index) => {
          let showname = columnDataTableTeamLveVerif.find((col) => col.field === filter.column)?.headerName;
          return `${showname} ${filter.condition} "${filter.value}"`;
        })
        .join(' ' + (advancedFilter.length > 1 ? advancedFilter[1].condition : '') + ' ');
    }
    return searchQueryTeamLveVerif;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPagesTeamLveVerif) {
      setPageTeamLveVerif(newPage);
      gridRefTableTeamLveVerif.current.api.paginationGoToPage(newPage - 1);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSizeTeamLveVerif(newSize);
    if (gridApi) {
      gridApi.paginationSetPageSize(newSize);
    }
  };

  // Show All Columns functionality
  const handleShowAllColumns = () => {
    const updatedVisibility = { ...columnVisibilityTeamLveVerif };
    for (const columnKey in updatedVisibility) {
      updatedVisibility[columnKey] = true;
    }
    setColumnVisibilityTeamLveVerif(updatedVisibility);
  };

  // // Function to filter columns based on search query
  const filteredColumns = columnDataTableTeamLveVerif.filter((column) => column.headerName.toLowerCase().includes(searchQueryManageTeamLveVerif.toLowerCase()));

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

    setColumnVisibilityTeamLveVerif((prevVisibility) => {
      const newVisibility = !prevVisibility[field];

      // Update the visibility in the grid
      gridApi.setColumnVisible(field, newVisibility);

      return {
        ...prevVisibility,
        [field]: newVisibility,
      };
    });
  };

  const handleColumnMoved = useCallback(
    debounce((event) => {
      if (!event.columnApi) return;

      const visible_columns = event.columnApi
        .getAllColumns()
        .filter((col) => {
          const colState = event.columnApi.getColumnState().find((state) => state.colId === col.colId);
          return colState && !colState.hide;
        })
        .map((col) => col.colId);

      setColumnVisibilityTeamLveVerif((prevVisibility) => {
        const updatedVisibility = { ...prevVisibility };

        // Ensure columns that are visible stay visible
        Object.keys(updatedVisibility).forEach((colId) => {
          updatedVisibility[colId] = visible_columns.includes(colId);
        });

        return updatedVisibility;
      });
    }, 300),
    []
  );

  const handleColumnVisible = useCallback((event) => {
    const colId = event.column.getColId();

    // Update visibility based on event, but only when explicitly triggered by grid
    setColumnVisibilityTeamLveVerif((prevVisibility) => ({
      ...prevVisibility,
      [colId]: event.visible, // Set visibility directly from the event
    }));
  }, []);

  // Excel
  const [fileFormat, setFormat] = useState('');
  // let exportColumnNamescrt = ["Employee Id", "Employee Name", "Leavetype", "Date", "Number of Days", "Reason for leave", "Status"]
  // let exportRowValuescrt = ["employeeid", "employeename", "leavetype", "date", "numberofdays", "reasonforleave", "status"]

  const fileExtension = fileFormat === 'xl' ? 'xlsx' : 'csv';
  const handleExportXL = async (isfilter) => {
    let formattedData = [];
    let resultdata = (filteredRowData.length > 0 ? filteredRowData : filteredData) ?? [];

    if (isfilter === 'filtered') {
      formattedData = resultdata.map((row, index) => {
        const overallHistory = [`Total Applied: ${row.overAllappliedCount || ''}`, `Total Approved: ${row.overAllapprovedCount || ''}`, `Total Rejected: ${row.overAllrejectedCount || ''}`].join('\n');

        const monthHistory = [`Total Applied: ${row.monthlyappliedCount || ''}`, `Total Approved: ${row.monthlyapprovedCount || ''}`, `Total Rejected: ${row.monthlyrejectedCount || ''}`].join('\n');

        return {
          SNo: index + 1,
          'Employee Id': row.employeeid,
          'Employee Name': row.employeename,
          'Leave Type': row.leavetype,
          Date: row.date.join(','),
          'Number of Days': row.noofshift,
          'Reason for leave': row.reasonforleave,
          Status: row.status,
          History: overallHistory,
          'Current Month History': monthHistory,
        };
      });
    } else if (isfilter === 'overall') {
      formattedData = items.map((row, index) => {
        const overallHistory = [`Total Applied: ${row.overAllappliedCount || ''}`, `Total Approved: ${row.overAllapprovedCount || ''}`, `Total Rejected: ${row.overAllrejectedCount || ''}`].join('\n');

        const monthHistory = [`Total Applied: ${row.monthlyappliedCount || ''}`, `Total Approved: ${row.monthlyapprovedCount || ''}`, `Total Rejected: ${row.monthlyrejectedCount || ''}`].join('\n');

        return {
          SNo: index + 1,
          'Employee Id': row.employeeid,
          'Employee Name': row.employeename,
          'Leave Type': row.leavetype,
          Date: row.date.join(','),
          'Number of Days': row.noofshift,
          'Reason for leave': row.reasonforleave,
          Status: row.status,
          History: overallHistory,
          'Current Month History': monthHistory,
        };
      });
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Table Data');

    // Add column headers
    worksheet.columns = [
      { header: 'SNo', key: 'SNo', width: 10 },
      { header: 'Employee Id', key: 'Employee Id', width: 15 },
      { header: 'Employee Name', key: 'Employee Name', width: 20 },
      { header: 'Leave Type', key: 'Leave Type', width: 15 },
      { header: 'Date', key: 'Date', width: 20 },
      { header: 'Number of Days', key: 'Number of Days', width: 25 },
      { header: 'Reason for leave', key: 'Reason for leave', width: 20 },
      { header: 'Status', key: 'Status', width: 15 },
      { header: 'History', key: 'History', width: 40 },
      {
        header: 'Current Month History',
        key: 'Current Month History',
        width: 40,
      },
    ];

    // Add rows
    formattedData.forEach((data) => {
      worksheet.addRow(data);
    });

    // Apply text wrapping for specific columns
    worksheet.getColumn('History').eachCell((cell) => {
      cell.alignment = { wrapText: true, vertical: 'top' };
    });

    worksheet.getColumn('Current Month History').eachCell((cell) => {
      cell.alignment = { wrapText: true, vertical: 'top' };
    });

    // Export the file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Team Leave Verification.${fileExtension}`);
    setIsFilterOpen(false);
  };

  // print...
  const [serverTimeForPrint, setServerTimeForPrint] = useState(null);
  const componentRef = useRef();

  const fetchTimeForPrint = async () => {
    const time = await getCurrentServerTime();
    setServerTimeForPrint(time);

    setTimeout(() => {
      handleprint();
    }, 100);
  };

  const currentDateAndTimeForPrint = formatCustomDateTime(serverTimeForPrint);

  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    // documentTitle: 'Team Leave Verification',
    // pageStyle: 'print',
  });

  // pdf
  const downloadPdf = async (isfilter, buttonStyles) => {
    const time = await getCurrentServerTime();
    const currentDateAndTimeForPdf = formatCustomDateTime(time);
    const doc = new jsPDF({ orientation: 'landscape' });

    // Define the table headers
    const headers = ['SNo', 'Employee Id', 'Employee Name', 'Leavetype', 'Date', 'Number of Days', 'Reason for leave', 'Status', 'History', 'Current Month History'];

    let data = [];
    let resultdata = (filteredRowData.length > 0 ? filteredRowData : filteredData) ?? [];

    if (isfilter === 'filtered') {
      data = resultdata.map((row, index) => {
        const overallHistory = [`Total Applied: ${row.overAllappliedCount || ''}`, `Total Approved: ${row.overAllapprovedCount || ''}`, `Total Rejected: ${row.overAllrejectedCount || ''}`].join('\n');

        const monthHistory = [`Total Applied: ${row.monthlyappliedCount || ''}`, `Total Approved: ${row.monthlyapprovedCount || ''}`, `Total Rejected: ${row.monthlyrejectedCount || ''}`].join('\n');

        return [index + 1, row.employeeid, row.employeename, row.leavetype, row.date.join(','), row.noofshift, row.reasonforleave, row.status, overallHistory, monthHistory];
      });
    } else if (isfilter === 'overall') {
      data = items.map((row, index) => {
        const overallHistory = [`Total Applied: ${row.overAllappliedCount || ''}`, `Total Approved: ${row.overAllapprovedCount || ''}`, `Total Rejected: ${row.overAllrejectedCount || ''}`].join('\n');

        const monthHistory = [`Total Applied: ${row.monthlyappliedCount || ''}`, `Total Approved: ${row.monthlyapprovedCount || ''}`, `Total Rejected: ${row.monthlyrejectedCount || ''}`].join('\n');

        return [index + 1, row.employeeid, row.employeename, row.leavetype, row.date.join(','), row.noofshift, row.reasonforleave, row.status, overallHistory, monthHistory];
      });
    }

    // // Split data into chunks to fit on pages
    // const columnsPerSheet = 10; // Number of columns per sheet
    // const chunks = [];

    // for (let i = 0; i < headers.length; i += columnsPerSheet) {
    //   const chunkHeaders = headers.slice(i, i + columnsPerSheet);
    //   const chunkData = data.map((row) => row.slice(i, i + columnsPerSheet + 1));

    //   chunks.push({ headers: chunkHeaders, data: chunkData });
    // }

    // chunks.forEach((chunk, index) => {
    //   if (index > 0) {
    //     doc.addPage({ orientation: 'landscape' });
    //   }

    //   doc.autoTable({
    //     theme: 'grid',
    //     styles: { fontSize: 8 },
    //     head: [chunk.headers],
    //     body: chunk.data,
    //     startY: 20,
    //     margin: { top: 20, left: 10, right: 10, bottom: 10 },
    //   });
    // });

    // Split data into chunks to fit on pages
    const columnsPerSheet = 10; // Number of columns per sheet
    const chunks = [];

    for (let i = 0; i < headers.length; i += columnsPerSheet) {
      const chunkHeaders = headers.slice(i, i + columnsPerSheet);
      const chunkData = data.map((row) => row.slice(i, i + columnsPerSheet + 1));

      chunks.push({ headers: chunkHeaders, data: chunkData });
    }

    chunks.forEach((chunk, index) => {
      // if (index > 0) {
      //     doc.addPage({ orientation: 'landscape' }); // Add a new landscape pageAttReport for each chunk, except the first one
      // }
      const rowsPerPage = 10;

      for (let i = 0; i < chunk.data.length; i += rowsPerPage) {
        const pageData = chunk.data.slice(i, i + rowsPerPage);

        if (index > 0 || i > 0) doc.addPage({ orientation: 'landscape' });

        doc.autoTable({
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: {
            fillColor: buttonStyles?.navbar?.backgroundColor,
            textColor: buttonStyles?.navbar?.color,
            fontStyle: 'bold',
          },
          head: [chunk.headers],
          // body: chunk.data,
          body: pageData,
          startY: 35, // Adjust startY to leave space for headers
          margin: { top: 35, left: 10, right: 10, bottom: 10 }, // Adjust margin as needed
          didDrawPage: function (data) {
            // Header
            doc.setFontSize(12);
            doc.setTextColor(40);
            doc.text(buttonStyles.companyname, 10, 15); // Company name top-left

            doc.setFontSize(10);
            doc.setTextColor(60);
            doc.text('Team Leave Verification', 10, 33); // table heading

            if (buttonStyles.watermark) {
              doc.addImage(buttonStyles.watermark, 'PNG', doc.internal.pageSize.width - 60, 5, 50, 20); // Logo top-right
            }

            // Footer
            const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`The following data is intended for informational purposes only and is the property of ${buttonStyles.companyname}/${currentDateAndTimeForPdf}`, 120, pageHeight - 10);
          }
        });
      }
    });

    doc.save('Team Leave Verification.pdf');
  };

  // image
  const handleCaptureImage = () => {
    if (gridRefImageTeamLveVerif.current) {
      domtoimage
        .toBlob(gridRefImageTeamLveVerif.current)
        .then((blob) => {
          saveAs(blob, 'Team Leave Verification.png');
        })
        .catch((error) => {
          console.error('dom-to-image error: ', error);
        });
    }
  };

  return (
    <Box>
      <Headtitle title={'TEAM LEAVE VERIFICATION'} />
      {/* ****** Header Content ****** */}
      <PageHeading title="Team Leave Verification" modulename="Leave&Permission" submodulename="Leave" mainpagename="Team Leave Verification" subpagename="" subsubpagename="" />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes('lteamleaveverification') && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Team Leave Verification List</Typography>
            </Grid>
            <Grid container spacing={2} style={userStyle.dataTablestyle}>
              <Grid item md={2} xs={12} sm={12}>
                <Box>
                  <label>Show entries:</label>
                  <Select
                    id="pageSizeSelect"
                    value={pageSizeTeamLveVerif}
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
                    <MenuItem value={applyleaves?.length}>All</MenuItem>
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
                  {isUserRoleCompare?.includes('excelteamleaveverification') && (
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
                  {isUserRoleCompare?.includes('csvteamleaveverification') && (
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
                  {isUserRoleCompare?.includes('printteamleaveverification') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={fetchTimeForPrint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('pdfteamleaveverification') && (
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
                  {isUserRoleCompare?.includes('imageteamleaveverification') && (
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
                            <IoMdOptions style={{ cursor: 'pointer' }} onClick={handleClickSearchTeamLveVerif} />
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
            </Grid>{' '}
            <br />
            <Grid container spacing={2}>
              <Grid item lg={1.5} md={1} xs={12} sm={6}>
                <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>
                  Show All Columns
                </Button>
              </Grid>
              <Grid item lg={1.5} md={1} xs={12} sm={6}>
                <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumnsTeamLveVerif}>
                  Manage Columns
                </Button>
              </Grid>
              <Grid item lg={2} md={2.5} xs={12} sm={6}>
                <Selects
                  options={modeDropDowns}
                  styles={colourStyles}
                  isDisabled={DisableLevelDropdown}
                  value={{
                    label: modeselection.label,
                    value: modeselection.value,
                  }}
                  onChange={(e) => setModeSelection(e)}
                />
              </Grid>
              <Grid item lg={2} md={2.5} xs={12} sm={6}>
                <Selects
                  options={sectorDropDowns}
                  styles={colourStyles}
                  value={{
                    label: sectorSelection.label,
                    value: sectorSelection.value,
                  }}
                  onChange={(e) => setSectorSelection(e)}
                />
              </Grid>
              <Grid item lg={3} md={2} xs={12} sm={6}>
                <LoadingButton loading={isBtn} variant="contained" onClick={(e) => fetchApplyleave(e)}>
                  Filter
                </LoadingButton>
              </Grid>
            </Grid>
            {!applyleaveCheck ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ width: '100%' }} className={'ag-theme-quartz'} ref={gridRefImageTeamLveVerif}>
                  <AgGridReact
                    rowData={filteredDataItems}
                    columnDefs={columnDataTableTeamLveVerif.filter((column) => columnVisibilityTeamLveVerif[column.field])}
                    ref={gridRefTableTeamLveVerif}
                    defaultColDef={defaultColDef}
                    domLayout={'autoHeight'}
                    getRowStyle={getRowStyle}
                    pagination={true}
                    paginationPageSize={pageSizeTeamLveVerif}
                    onPaginationChanged={onPaginationChanged}
                    onGridReady={onGridReady}
                    onColumnMoved={handleColumnMoved}
                    onColumnVisible={handleColumnVisible}
                    onFilterChanged={onFilterChanged}
                    // suppressPaginationPanel={true}
                    suppressSizeToFit={true}
                    suppressAutoSize={true}
                    suppressColumnVirtualisation={true}
                    colResizeDefault={'shift'}
                    cellSelection={true}
                    copyHeadersToClipboard={true}
                    rowHeight={85}
                  />
                </Box>
              </>
            )}
            <br /> <br />
            <CompletedTeamLeaveVerification data={completedApplyleaves} setUpdated={setUpdated} />
          </Box>
        </>
      )}

      {/* Manage Column */}
      <Popover id={idTeamLveVerif} open={isManageColumnsOpenTeamLveVerif} anchorEl={anchorElTeamLveVerif} onClose={handleCloseManageColumnsTeamLveVerif} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <ManageColumnsContent
          handleClose={handleCloseManageColumnsTeamLveVerif}
          searchQuery={searchQueryManageTeamLveVerif}
          setSearchQuery={setSearchQueryManageTeamLveVerif}
          filteredColumns={filteredColumns}
          columnVisibility={columnVisibilityTeamLveVerif}
          toggleColumnVisibility={toggleColumnVisibility}
          setColumnVisibility={setColumnVisibilityTeamLveVerif}
          initialColumnVisibility={initialColumnVisibilityTeamLveVerif}
          columnDataTable={columnDataTableTeamLveVerif}
        />
      </Popover>

      {/* Search Bar */}
      <Popover id={idSearchTeamLveVerif} open={openSearchTeamLveVerif} anchorEl={anchorElSearchTeamLveVerif} onClose={handleCloseSearchTeamLveVerif} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <AdvancedSearchBar columns={columnDataTableTeamLveVerif?.filter((data) => data.field && data.field !== 'actions')} onSearch={applyAdvancedFilter} initialSearchValue={searchQueryTeamLveVerif} handleCloseSearch={handleCloseSearchTeamLveVerif} />
      </Popover>

      {/* dialog status change */}
      <Box>
        <Dialog maxWidth="lg" open={statusOpen} onClose={handleStatusClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent
            // sx={{
            //   width: '700px',
            //   height: selectStatus.status == 'Rejected' ? '450px' : '400px',
            //   overflow: 'visible',
            //   '& .MuiPaper-root': {
            //     overflow: 'visible',
            //   },
            // }}
            sx={{
              overflow: 'visible',
              '& .MuiPaper-root': {
                overflow: 'auto',
              },
              marginTop: '50px',
            }}
          >
            <Grid container spacing={2}>
              <Grid item md={12} xs={12} sm={12}>
                <Typography sx={userStyle.HeaderText}>Edit Apply Status</Typography>
              </Grid>
              <Grid item md={6} xs={12} sm={6}>
                <Typography>
                  <b>Name:</b>
                  <b style={{ color: 'red' }}>{isInidvidualStatus?.employeename}</b>
                </Typography>
              </Grid>
              <Grid item md={6} xs={12} sm={6}>
                <Typography>
                  <b>Date:</b>
                  <b style={{ color: 'red' }}>{isInidvidualStatus?.date?.join(',')}</b>
                </Typography>
              </Grid>
              <Grid item md={4} xs={12} sm={4}>
                <Typography>
                  <b>No.of.Days:</b>
                  <b style={{ color: 'red' }}>{isInidvidualStatus?.numberofdays}</b>
                </Typography>
              </Grid>
              <Grid item md={8} xs={12} sm={8}>
                <Typography>
                  <b>LeaveType:</b>
                  <b style={{ color: 'red' }}>{isInidvidualStatus?.leavetype}</b>
                </Typography>
              </Grid>
              <Grid item md={4} xs={12} sm={8}>
                <Typography>
                  <b>Reason For Leave:</b>
                  <b style={{ color: 'red' }}>{isInidvidualStatus?.reasonforleave}</b>
                </Typography>
              </Grid>
              <Grid item md={12} xs={12} sm={12}>
                <Typography>
                  <b>OverallHistory:</b>
                  <b style={{ color: 'red' }}>
                    Applied:{isInidvidualStatus?.overAllappliedCount} / Approved:{isInidvidualStatus?.overAllapprovedCount} / Rejected:{isInidvidualStatus?.overAllrejectedCount}
                  </b>
                </Typography>
              </Grid>
              <Grid item md={12} xs={12} sm={12}>
                <Typography>
                  <b>CurrentMonthHistory:</b>
                  <b style={{ color: 'red' }}>
                    Applied:{isInidvidualStatus?.monthlyappliedCount} / Approved:{isInidvidualStatus?.monthlyapprovedCount} / Rejected:{isInidvidualStatus?.monthlyrejectedCount}
                  </b>
                </Typography>
              </Grid>
              <Grid item md={6} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Status<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    fullWidth
                    options={[
                      { label: 'Approved', value: 'Approved' },
                      { label: 'Rejected', value: 'Rejected' },
                      { label: 'Applied', value: 'Applied' },
                      { label: 'Cancelled', value: 'Cancelled' },
                    ]}
                    value={{
                      label: selectStatus.status,
                      value: selectStatus.value,
                    }}
                    onChange={(e) => {
                      setSelectStatus({ ...selectStatus, status: e.value });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={12}>
                {selectStatus.status == 'Rejected' ? (
                  <FormControl fullWidth size="small">
                    <Typography>
                      Reason for Rejected<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <TextareaAutosize
                      aria-label="minimum height"
                      minRows={5}
                      value={selectStatus.rejectedreason}
                      onChange={(e) => {
                        setSelectStatus({
                          ...selectStatus,
                          rejectedreason: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                ) : null}
              </Grid>
              {uploadDetails?.length > 0 ? (
                <Grid item md={12}>
                  <Typography sx={userStyle.HeaderText}>Upload Document List</Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ fontSize: '1.2rem' }}>Company</TableCell>
                          <TableCell style={{ fontSize: '1.2rem' }}>Branch</TableCell>
                          <TableCell style={{ fontSize: '1.2rem' }}>Unit</TableCell>
                          <TableCell style={{ fontSize: '1.2rem' }}>Team</TableCell>
                          <TableCell style={{ fontSize: '1.2rem' }}>Employee Name</TableCell>
                          <TableCell style={{ fontSize: '1.2rem' }}>Date</TableCell>
                          <TableCell style={{ fontSize: '1.2rem' }}>Document</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {uploadDetails?.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.company}</TableCell>
                            <TableCell>{row.branch}</TableCell>
                            <TableCell>{row.unit}</TableCell>
                            <TableCell>{row.team}</TableCell>
                            <TableCell>{row.employeename}</TableCell>
                            <TableCell>{moment(row.date, 'YYYY-MM-DD').format('DD/MM/YYYY')}</TableCell>
                            <TableCell>
                              <Button
                                sx={{
                                  padding: '14px 14px',
                                  minWidth: '40px !important',
                                  borderRadius: '50% !important',
                                  ':hover': {
                                    backgroundColor: '#80808036', // theme.palette.primary.main
                                  },
                                }}
                                onClick={() => getDownloadFile(row._id)}
                              >
                                view
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              ) : null}
            </Grid>
          </DialogContent>
          <br />
          <DialogActions>
            <Button
              variant="contained"
              // style={{
              //   padding: "7px 13px",
              //   color: "white",
              //   background: "rgb(25, 118, 210)",
              // }}
              sx={buttonStyles.buttonsubmit}
              // onClick={() => {
              //   editStatus();
              //   // handleCloseerrpop();
              // }}
              onClick={() => fetchLeaveHistoryUpdate(selectStatus.employeeid, selectStatus.employeename, selectStatus.date, selectStatus.leavetype)}
            >
              Update
            </Button>
            <Button
              // style={{
              //   backgroundColor: "#f4f4f4",
              //   color: "#444",
              //   boxShadow: "none",
              //   borderRadius: "3px",
              //   padding: "7px 13px",
              //   border: "1px solid #0000006b",
              //   "&:hover": {
              //     "& .css-bluauu-MuiButtonBase-root-MuiButton-root": {
              //       backgroundColor: "#f4f4f4",
              //     },
              //   },
              // }}
              sx={buttonStyles.btncancel}
              onClick={() => {
                handleStatusClose();
                setSelectStatus({});
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Box>
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
            marginTop: '50px',
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
                        {`${getDetails?.employeename}`}
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
                      <TableCell style={{ fontSize: '1.2rem' }}>Completed By</TableCell>
                      <TableCell style={{ fontSize: '1.2rem' }}>Completed At</TableCell>
                      <TableCell style={{ fontSize: '1.2rem' }}>Status</TableCell>
                      <TableCell style={{ fontSize: '1.2rem' }}>Action</TableCell>
                      <TableCell style={{ fontSize: '1.2rem' }}>Assigned Person</TableCell>
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
                                  <OutlinedInput
                                    value={row.data}
                                    style={{ height: '32px' }}
                                    type="text"
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      if (/^[0-9]*$/.test(inputValue)) {
                                        handleDataChange(e, index, 'Text Box-number');
                                      }
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
                                              <Typography sx={userStyle.uploadbtn}>Upload</Typography>
                                            </label>
                                            <br />
                                          </section>
                                        </Box>

                                        <Box item md={4} sm={4}>
                                          <Button onClick={showWebcam} variant="contained" sx={userStyle.uploadbtn}>
                                            <CameraAltIcon />
                                          </Button>
                                        </Box>
                                        {row.files && (
                                          <Grid container spacing={2}>
                                            <Grid item lg={8} md={8} sm={8} xs={8}>
                                              <Typography>{row.files.name}</Typography>
                                            </Grid>
                                            <Grid item lg={1.5} md={1} sm={1} xs={1} sx={{ cursor: 'pointer' }} onClick={() => renderFilePreviewEdit(row.files)}>
                                              <VisibilityOutlinedIcon
                                                style={{
                                                  fontsize: 'large',
                                                  color: '#357AE8',
                                                  cursor: 'pointer',
                                                }}
                                                onClick={() => renderFilePreviewEdit(row.files)}
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
                                      </Box>
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
                                        <Button variant="contained" color="error" onClick={webcamClose}>
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
                        <TableCell>
                          <span>{row?.employee && row?.employee?.map((data, index) => <Typography key={index} variant="body1">{`${index + 1}.${data}, `}</Typography>)}</span>
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
                <Button variant="contained" onClick={handleCheckListSubmit}>
                  Submit
                </Button>
                <Grid item md={1} sm={1}></Grid>
                <Button sx={userStyle.btncancel} onClick={handleCloseModEditCheckList}>
                  Cancel
                </Button>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>

      {/* Update History Popup */}
      <Dialog open={isOpenHistoryUpdate} onClose={handleCloseModHistoryUpdate} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="lg" fullWidth={true} sx={{ marginTop: '95px' }}>
        <Box sx={{ padding: '20px 50px' }}>
          <>
            <Typography sx={userStyle.HeaderText}>Employee Leave History</Typography>
            <br />
            <br />
            <Grid container spacing={2}>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">
                    Employee Name:&ensp;
                    <span
                      style={{
                        fontWeight: '500',
                        fontSize: '1.2rem',
                        display: 'inline-block',
                      }}
                    >
                      {selectedEmpDataUpdate?.employeename}
                    </span>
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">
                    Employee ID:&ensp;
                    <span
                      style={{
                        fontWeight: '500',
                        fontSize: '1.2rem',
                        display: 'inline-block',
                      }}
                    >
                      {selectedEmpDataUpdate?.employeeid}
                    </span>
                  </Typography>
                </FormControl>
              </Grid>
            </Grid>
            <br />
            <Grid container spacing={2}>
              <Grid item md={12} xs={12} sm={12}>
                <Typography sx={userStyle.HeaderText}>Overall</Typography>
                <br />
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <b>Leave Type</b>
                        </TableCell>
                        <TableCell>
                          <b>Applied Count</b>
                        </TableCell>
                        <TableCell>
                          <b>Approved Count</b>
                        </TableCell>
                        <TableCell>
                          <b>Rejected Count</b>
                        </TableCell>
                        <TableCell>
                          <b>Uninformed Count</b>
                        </TableCell>
                        <TableCell>
                          <b>Late - ClockIn Count</b>
                        </TableCell>
                        <TableCell>
                          <b>Early - ClockOut Count</b>
                        </TableCell>
                        <TableCell>
                          <b>Auto Mis - ClockIn Count</b>
                        </TableCell>
                        <TableCell>
                          <b>Absent Count</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyOverAllDataUpdate.length > 0 ? (
                        historyOverAllDataUpdate.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row?.leavetype || 'No Leave'}</TableCell>
                            <TableCell>{row?.appliedCount || 0}</TableCell>
                            <TableCell>{row?.approvedCount || 0}</TableCell>
                            <TableCell>{row?.rejectedCount || 0}</TableCell>
                            <TableCell>{row?.uninformedCount || 0}</TableCell>
                            <TableCell>{row?.lateClockinCount || 0}</TableCell>
                            <TableCell>{row?.earlyClockoutCount || 0}</TableCell>
                            <TableCell>{row?.autoMisClockoutCount || 0}</TableCell>
                            <TableCell>{row?.absentCount || 0}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No Data Available
                          </TableCell>{' '}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
            <br />
            <Grid container spacing={2}>
              <Grid item md={12} xs={12} sm={12}>
                <Typography sx={userStyle.HeaderText}>Current Month({monthNames[new Date(serverTime).getMonth()]})</Typography>
                <br />
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <b>Leave Type</b>
                        </TableCell>
                        <TableCell>
                          <b>Applied Count</b>
                        </TableCell>
                        <TableCell>
                          <b>Approved Count</b>
                        </TableCell>
                        <TableCell>
                          <b>Rejected Count</b>
                        </TableCell>
                        <TableCell>
                          <b>Uninformed Count</b>
                        </TableCell>
                        <TableCell>
                          <b>Late - ClockIn Count</b>
                        </TableCell>
                        <TableCell>
                          <b>Early - ClockOut Count</b>
                        </TableCell>
                        <TableCell>
                          <b>Auto Mis - ClockIn Count</b>
                        </TableCell>
                        <TableCell>
                          <b>Absent Count</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyMonthDataUpdate.length > 0 ? (
                        historyMonthDataUpdate.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row?.leavetype || 'No Leave'}</TableCell>
                            <TableCell>{row?.appliedCount || 0}</TableCell>
                            <TableCell>{row?.approvedCount || 0}</TableCell>
                            <TableCell>{row?.rejectedCount || 0}</TableCell>
                            <TableCell>{row?.uninformedCount || 0}</TableCell>
                            <TableCell>{row?.lateClockinCount || 0}</TableCell>
                            <TableCell>{row?.earlyClockoutCount || 0}</TableCell>
                            <TableCell>{row?.autoMisClockoutCount || 0}</TableCell>
                            <TableCell>{row?.absentCount || 0}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No Data Available
                          </TableCell>{' '}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
            <br />
            <Grid container spacing={2}>
              <Grid item md={1} sm={1}>
                <Button sx={buttonStyles.buttonsubmit} onClick={editStatus}>
                  Ok
                </Button>
              </Grid>
              <Grid item md={1} sm={1}>
                <Button sx={buttonStyles.btncancel} onClick={handleCloseModHistoryUpdate}>
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </>
        </Box>
      </Dialog>

      {/* document View */}
      <Dialog open={isimgviewbill} onClose={handlecloseImgcodeviewbill} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="md" fullWidth>
        <DialogContent>
          <Typography variant="h6">Document Files</Typography>
          {getimgbillcode.map((imagefilebill, index) => (
            <Grid container key={index}>
              <Grid item md={8} sm={10} xs={10} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>{imagefilebill.name}</Typography>
              </Grid>

              <Grid item md={4} sm={1} xs={1}>
                <Button
                  sx={{
                    padding: '14px 14px',
                    minWidth: '40px !important',
                    borderRadius: '50% !important',
                    ':hover': {
                      backgroundColor: '#80808036', // theme.palette.primary.main
                    },
                  }}
                  onClick={() => renderFilePreview(imagefilebill)}
                >
                  <VisibilityOutlinedIcon
                    style={{
                      fontsize: '12px',
                      color: '#357AE8',
                      marginTop: '35px !important',
                    }}
                  />
                </Button>
              </Grid>
            </Grid>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlecloseImgcodeviewbill} sx={userStyle.btncancel}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ALERT DIALOG */}
      <Box>
        <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '450px', textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">{showAlert}</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" color="error" onClick={handleCloseerr}>
              Close
            </Button>
            <Button variant="contained" color="error" onClick={sendEditStatus}>
              ok
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <MessageAlert openPopup={openPopupMalert} handleClosePopup={handleClosePopupMalert} popupContent={popupContentMalert} popupSeverity={popupSeverityMalert} />

      {/* print layout */}
      <Box ref={componentRef} sx={userStyle.printcls}>
        <div className="print-section" >
          <div className="print-header">
            <span className="logo">{buttonStyles.companyname}</span>
            <img src={buttonStyles.watermark} alt="Logo" style={{ height: '70px' }} />
          </div>

          <div className="print-body">
            <Typography sx={userStyle.importheadtext}>{'Team Leave Verification'}</Typography>
            <TableContainer component={Paper} sx={{ overflowX: 'hidden' }}>
              <Table sx={{ minWidth: 700 }} aria-label="customized table" id="usertable">
                <TableHead>
                  <TableRow>
                    <TableCell>SNo</TableCell>
                    <TableCell>Employee Id</TableCell>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Number of Days</TableCell>
                    <TableCell>Reason for leave</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>History</TableCell>
                    <TableCell>Current Month History</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody align="left">
                  {filteredData &&
                    filteredData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{row.employeeid}</TableCell>
                        <TableCell>{row.employeename}</TableCell>
                        <TableCell>{row.leavetype}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.noofshift}</TableCell>
                        <TableCell>{row.reasonforleave}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography>Total Applied: {row.overAllappliedCount}</Typography>
                            <Typography>Total Approved: {row.overAllapprovedCount}</Typography>
                            <Typography>Total Rejected: {row.overAllrejectedCount}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography>Total Applied: {row.monthlyappliedCount}</Typography>
                            <Typography>Total Approved: {row.monthlyapprovedCount}</Typography>
                            <Typography>Total rejectedreason: {row.monthlyrejectedCount}</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          <div className="print-footer">
            <Typography sx={userStyle.importheadtext}>
              The following data is intended for informational purposes only and is the property of {buttonStyles.companyname}/{currentDateAndTimeForPrint}
            </Typography>
          </div>
        </div>
      </Box>

      {/* EXTERNAL COMPONENTS -------------- END */}
      <Dialog open={isFilterOpen} onClose={handleCloseFilterMod} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogContent
          sx={{
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseFilterMod}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>

          {fileFormat === 'xl' ? <FaFileExcel style={{ fontSize: '70px', color: 'green' }} /> : <FaFileCsv style={{ fontSize: '70px', color: 'green' }} />}
          <Typography variant="h5" sx={{ textAlign: 'center' }}>
            Choose Export
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            variant="contained"
            onClick={(e) => {
              handleExportXL('filtered');
            }}
          >
            Export Filtered Data
          </Button>
          <Button
            autoFocus
            variant="contained"
            onClick={(e) => {
              handleExportXL('overall');
            }}
          >
            Export Over All Data
          </Button>
        </DialogActions>
      </Dialog>
      {/*Export pdf Data  */}
      <Dialog open={isPdfFilterOpen} onClose={handleClosePdfFilterMod} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogContent
          sx={{
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleClosePdfFilterMod}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>

          <PictureAsPdfIcon sx={{ fontSize: '80px', color: 'red' }} />
          <Typography variant="h5" sx={{ textAlign: 'center' }}>
            Choose Export
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={(e) => {
              downloadPdf('filtered', buttonStyles);
              setIsPdfFilterOpen(false);
            }}
          >
            Export Filtered Data
          </Button>
          <Button
            variant="contained"
            onClick={(e) => {
              downloadPdf('overall', buttonStyles);
              setIsPdfFilterOpen(false);
            }}
          >
            Export Over All Data
          </Button>
        </DialogActions>
      </Dialog>
      <CustomApprovalDialog
        open={dialogOpen}
        handleClose={handleCloseDialog}
        eligibleUsers={eligibleUsers}
        eligibleUsersLevel={eligibleUsersLevel}
      />
      {/* SUCCESS */}
      <AlertDialog openPopup={openPopup} handleClosePopup={handleClosePopup} popupContent={popupContent} popupSeverity={popupSeverity} />
      {/* EXTERNAL COMPONENTS -------------- END */}
      {/* PRINT PDF EXCEL CSV */}
      {/* <ExportData
        isFilterOpen={isFilterOpen}
        handleCloseFilterMod={handleCloseFilterMod}
        fileFormat={fileFormat}
        setIsFilterOpen={setIsFilterOpen}
        isPdfFilterOpen={isPdfFilterOpen}
        setIsPdfFilterOpen={setIsPdfFilterOpen}
        handleClosePdfFilterMod={handleClosePdfFilterMod}
        filteredDataTwo={(filteredRowData.length > 0 ? filteredRowData : filteredData) ?? []}
        itemsTwo={items ?? []}
        filename={"Team Leave Verification"}
        exportColumnNames={exportColumnNamescrt}
        exportRowValues={exportRowValuescrt}
        componentRef={componentRef}
      /> */}
    </Box>
  );
}

export default TeamLeaveVerification;
