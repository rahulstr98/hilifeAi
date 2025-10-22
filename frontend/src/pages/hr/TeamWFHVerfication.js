import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react';
import { FaFileExcel, FaFileCsv, FaPrint, FaFilePdf, FaEdit, FaSearch } from 'react-icons/fa';
import { handleApiError } from '../../components/Errorhandling';
import {
  Box,
  Typography,
  OutlinedInput,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  Dialog,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
  Paper,
  Table,
  TableHead,
  TableContainer,
  Button,
  Popover,
  Checkbox,
  IconButton,
  DialogTitle,
  TextareaAutosize,
  InputLabel,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { userStyle, colourStyles } from '../../pageStyle';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import axios from '../../axiosInstance';
import LoadingButton from '@mui/lab/LoadingButton';
import { SERVICE } from '../../services/Baseservice';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useReactToPrint } from 'react-to-print';
import moment, { invalid } from 'moment-timezone';
import { UserRoleAccessContext, AuthContext } from '../../context/Appcontext';
import Headtitle from '../../components/Headtitle';
import { ThreeDots } from 'react-loader-spinner';
import Selects from 'react-select';
import CompletedTeamPermissionVerification from './CompletedTeamWFHVerification';
import { saveAs } from 'file-saver';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Webcamimage from '../hr/webcamprofile';
import FormControlLabel from '@mui/material/FormControlLabel';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ExcelJS from 'exceljs';
import DeleteIcon from '@mui/icons-material/Delete';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { IoMdOptions } from 'react-icons/io';
import { MdClose } from 'react-icons/md';
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
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { getCurrentServerTime } from '../../components/getCurrentServerTime';

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
function TeamPermissionVerification() {
  let cellStyles = {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    lineHeight: 'normal',
    // fontSize: "12px"
  };

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
  const [DisableLevelDropdown, setDisableLevelDropdown] = useState(false)

  const gridRefTableApprovedPerm = useRef(null);
  const gridRefImageApprovedPerm = useRef(null);
  const [isBtn, setIsBtn] = useState(false);
  const [minDate, setMinDate] = useState('');

  // Calculate the minimum date as today
  useEffect(() => {
    const today = new Date();

    // Format the date as 'YYYY-MM-DD' for the input element
    const formattedToday = today.toISOString().split('T')[0];
    setMinDate(formattedToday);
  }, []);

  const [permissions, setPermissions] = useState([]);
  const [CompletedPermissions, setCompletedPermissions] = useState([]);
  const [Accessdrop, setAccesDrop] = useState('Employee');
  const { isUserRoleCompare, isUserRoleAccess, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);
  const [selectStatus, setSelectStatus] = useState({});
  const [updated, setUpdated] = useState(null);
  // State to track advanced filter
  const [advancedFilter, setAdvancedFilter] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [columnApi, setColumnApi] = useState(null);
  const [filteredDataItems, setFilteredDataItems] = useState(permissions);
  const [filteredRowData, setFilteredRowData] = useState([]);
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
  const [applyleaves, setApplyleaves] = useState([]);

  const [statusOpen, setStatusOpen] = useState(false);
  const handleStatusOpen = () => {
    setStatusOpen(true);
  };
  const handleStatusClose = () => {
    setStatusOpen(false);
  };

  const { auth } = useContext(AuthContext);

  const [applyleaveCheck, setApplyleavecheck] = useState(true);

  const username = isUserRoleAccess.username;

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
  const [pageApprovedPerm, setPageApprovedPerm] = useState(1);
  const [pageSizeApprovedPerm, setPageSizeApprovedPerm] = useState(10);
  const [searchQueryApprovedPerm, setSearchQueryApprovedPerm] = useState('');
  const [totalPagesApprovedPerm, setTotalPagesApprovedPerm] = useState(1);

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
  const [isManageColumnsOpenApprovedPerm, setManageColumnsOpenApprovedPerm] = useState(false);
  const [anchorElApprovedPerm, setAnchorElApprovedPerm] = useState(null);
  const [searchQueryManageApprovedPerm, setSearchQueryManageApprovedPerm] = useState('');

  const handleOpenManageColumnsApprovedPerm = (event) => {
    setAnchorElApprovedPerm(event.currentTarget);
    setManageColumnsOpenApprovedPerm(true);
  };
  const handleCloseManageColumnsApprovedPerm = () => {
    setManageColumnsOpenApprovedPerm(false);
    setSearchQueryManageApprovedPerm('');
  };

  const openApprovedPerm = Boolean(anchorElApprovedPerm);
  const idApprovedPerm = openApprovedPerm ? 'simple-popover' : undefined;

  // Search bar
  const [anchorElSearchApprovedPerm, setAnchorElSearchApprovedPerm] = React.useState(null);
  const handleClickSearchApprovedPerm = (event) => {
    setAnchorElSearchApprovedPerm(event.currentTarget);
  };
  const handleCloseSearchApprovedPerm = () => {
    setAnchorElSearchApprovedPerm(null);
    setSearchQueryApprovedPerm('');
  };

  const openSearchApprovedPerm = Boolean(anchorElSearchApprovedPerm);
  const idSearchApprovedPerm = openSearchApprovedPerm ? 'simple-popover' : undefined;

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
      const isAvailable = res?.data?.checklistverificationmasters?.some((item) => item.mainpage === 'Apply Permission');
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
      pagename: String('Team WFH Verification'),
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
    setPageName(!pageName);
    let searchItem = datasAvailedDB.find((item) => item.commonid == postID && item.module == 'Leave&Permission' && item.submodule == 'Work From Home' && item.mainpage == 'Apply Work From Home' && item.status.toLowerCase() !== 'completed');

    let combinedGroups = groupDetails?.map((data) => {
      let check = (data.data !== undefined && data.data !== '') || data.files !== undefined;

      if (check) {
        return {
          ...data,
          completedby: completedbyName,
          completedat: new Date(),
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
              name: String(username),
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
      console.error('API Error:', err);
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
      console.error('API Error:', err);
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
    setPageName(!pageName);
    setGetDetails(details);
    try {
      let res = await axios.get(SERVICE.MYCHECKLIST);
      setDatasAvailedDB(res?.data?.mychecklist);
      let searchItem = res?.data?.mychecklist.find((item) => item.commonid == details?.id && item.module == 'Leave&Permission' && item.submodule == 'Work From Home' && item.mainpage == 'Apply Work From Home' && item.status.toLowerCase() !== 'completed');
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
      console.error('API Error:', err);
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
      setPopupContentMalert('Please Fill all the Fields');
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
          completedat: new Date(),
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
            name: String(username),
            date: String(new Date()),
          },
        ],
      });
      handleCloseModEditCheckList();
      setIsCheckedListOverall(false);
      sendEditStatus();
    } catch (err) {
      console.error('API Error:', err);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Show All Columns & Manage Columns
  const initialColumnVisibilityApprovedPerm = {
    serialNumber: true,
    checkbox: true,
    requesthours: true,
    fromtime: true,
    endtime: true,
    employeename: true,
    employeeid: true,
    date: true,
    reasonforworkfromhome: true,
    reportingto: true,
    status: true,
    actions: true,
    overallhistory: true,
    monthhistory: true,
  };

  const [columnVisibilityApprovedPerm, setColumnVisibilityApprovedPerm] = useState(initialColumnVisibilityApprovedPerm);

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ''; // This is required for Chrome support
  };

  let dateselect = new Date();
  dateselect.setDate(dateselect.getDate() + 3);
  var ddt = String(dateselect.getDate()).padStart(2, '0');
  var mmt = String(dateselect.getMonth() + 1).padStart(2, '0');
  var yyyyt = dateselect.getFullYear();
  let formattedDatet = yyyyt + '-' + mmt + '-' + ddt;

  let datePresent = new Date();
  var ddp = String(datePresent.getDate());
  var mmp = String(datePresent.getMonth() + 1);
  var yyyyp = datePresent.getFullYear();
  let formattedDatePresent = yyyyp + '-' + mmp + '-' + ddp;

  const getinfoCodeStatus = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.APPLYWORKFROMHOME_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setSelectStatus(res?.data?.sapplyworkfromhome);
    } catch (err) {
      console.error('API Error:', err);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //Project updateby edit page...
  let updatedByStatus = selectStatus.updatedby;

  const [selectedEmpDataUpdate, setSelectedEmpDataUpdate] = useState({});
  const [historyOverAllDataUpdate, setHistoryOverAllDataUpdate] = useState({});
  const [historyMonthDataUpdate, setHistoryMonthDataUpdate] = useState({});

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

  // const fetchPermissionHistoryUpdate = async (empid, empname) => {
  //   try {
  //     // Get the current month and year
  //     const currentDate = new Date();
  //     const currentMonth = currentDate.getMonth() + 1;
  //     const currentYear = currentDate.getFullYear();

  //     let res_vendor = await axios.post(
  //       SERVICE.APPLYPERMISSIONS_EMPLOYEEID_FILTER,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${auth.APIToken}`,
  //         },
  //         employeeid: empid,
  //       }
  //     );

  //     let uninformResult = res_vendor?.data?.permissions;

  //     if (uninformResult?.length > 0) {
  //       // Filter for the current month's data
  //       const monthlyData = uninformResult.filter((item) => {
  //         const leaveDate = new Date(item.date);
  //         return (
  //           leaveDate.getMonth() + 1 === currentMonth &&
  //           leaveDate.getFullYear() === currentYear
  //         );
  //       });

  //       // Function to calculate leave counts
  //       const calculatePermissionCounts = (data) => {
  //         return data.reduce((acc, item) => {
  //           if (!acc[item.employeeid]) {
  //             acc[item.employeeid] = {
  //               employeename: item.employeename,
  //               employeeid: item.employeeid,
  //               approvedCount: 0,
  //               appliedCount: 0,
  //               rejectedCount: 0,
  //             };
  //           }

  //           // Count Approved and Applied statuses
  //           if (item.status === "Approved") {
  //             acc[item.employeeid].approvedCount += 1;
  //           } else if (item.status === "Applied") {
  //             acc[item.employeeid].appliedCount += 1;
  //           } else if (item.status === "Rejected") {
  //             acc[item.employeeid].rejectedCount += 1;
  //           }
  //           setSelectedEmpDataUpdate({
  //             employeename: item.employeename,
  //             employeeid: item.employeeid,
  //           });
  //           return acc;
  //         }, {});
  //       };

  //       // Calculate leave counts for overall and monthly data
  //       const overallPermissionCounts = calculatePermissionCounts(uninformResult);
  //       const monthlyPermissionCounts = calculatePermissionCounts(monthlyData);

  //       // Transform the counts object into an array format
  //       const transformCounts = (counts) => Object.values(counts);

  //       setHistoryOverAllDataUpdate(transformCounts(overallPermissionCounts));
  //       setHistoryMonthDataUpdate(transformCounts(monthlyPermissionCounts));
  //     } else {
  //       setSelectedEmpDataUpdate({ employeename: empname, employeeid: empid });
  //       setHistoryOverAllDataUpdate([]);
  //       setHistoryMonthDataUpdate([]);
  //     }
  //     handleClickOpenHistoryUpdate();
  //   } catch (err) {
  //     console.error("API Error:", err);
  //     handleApiError(
  //       err,
  //       setPopupContentMalert,
  //       setPopupSeverityMalert,
  //       handleClickOpenPopupMalert
  //     );
  //   }
  // };

  const fetchPermissionHistoryUpdate = async (empid, empname) => {
    try {
      // Get the current month and year
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      let res_vendor = await axios.post(SERVICE.APPLYWORKFROMHOMEBYEMPID, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        employeeid: empid,
      });

      let uninformResult = res_vendor?.data?.applywfh;

      if (uninformResult?.length > 0) {
        // Filter for the current month's data
        const monthlyData = uninformResult.filter((item) => {
          return item.date.some((date) => {
            const leaveDate = new Date(date.split('/').reverse().join('-'));

            return leaveDate.getMonth() + 1 === currentMonth && leaveDate.getFullYear() === currentYear;
          });
        });

        // Function to calculate leave counts grouped by leavetype
        const calculateLeaveCounts = (data) => {
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
                cancelCount: 0,
              };
            }

            // Loop through all dates to count leaves separately for each date
            item.date.forEach((date, type) => {
              const leaveDate = new Date(date.split('/').reverse().join('-'));

              if (type === 'Month' && leaveDate.getMonth() + 1 === currentMonth && leaveDate.getFullYear() === currentYear) {
                // Count Approved, Applied, and Rejected statuses
                if (item.status === 'Approved') {
                  acc[key].approvedCount += 1;
                } else if (item.status === 'Applied') {
                  acc[key].appliedCount += 1;
                } else if (item.status === 'Rejected') {
                  acc[key].rejectedCount += 1;
                } else if (item.status === 'Cancelled') {
                  acc[key].cancelCount += 1;
                }
              } else {
                // Count Approved, Applied, and Rejected statuses
                if (item.status === 'Approved') {
                  acc[key].approvedCount += 1;
                } else if (item.status === 'Applied') {
                  acc[key].appliedCount += 1;
                } else if (item.status === 'Rejected') {
                  acc[key].rejectedCount += 1;
                } else if (item.status === 'Cancelled') {
                  acc[key].cancelCount += 1;
                }
              }
              setSelectedEmpDataUpdate({ employeename: item.employeename, employeeid: item.employeeid });
            });
            return acc;
          }, {});
        };

        // Calculate leave counts for overall and monthly data
        const overallLeaveCounts = calculateLeaveCounts(uninformResult, 'Overall');
        const monthlyLeaveCounts = calculateLeaveCounts(monthlyData, 'Month');

        // Transform the counts object into an array format
        const transformCounts = (counts) => Object.values(counts);

        setHistoryOverAllDataUpdate(transformCounts(overallLeaveCounts));
        setHistoryMonthDataUpdate(transformCounts(monthlyLeaveCounts));
      } else {
        setSelectedEmpDataUpdate({ employeename: empname, employeeid: empid });
        setHistoryOverAllDataUpdate([]);
        setHistoryMonthDataUpdate([]);
      }
      handleClickOpenHistoryUpdate();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const sendEditStatus = async () => {
    handleCloseerr();
    setPageName(!pageName);
    try {
      let res = await axios.put(`${SERVICE.APPLYWORKFROMHOME_SINGLE}/${selectStatus._id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        status: String(selectStatus.status),
        rejectedreason: String(selectStatus.status == 'Rejected' ? selectStatus.rejectedreason : ''),
        actionby: String(isUserRoleAccess.companyname),
        updatedby: [
          ...updatedByStatus,
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });
      await fetchApplyPermissions();
      handleStatusClose();
      setPopupContent('Updated Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      console.error('API Error:', err);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const editStatus = () => {
    handleCloseModHistoryUpdate();
    if (selectStatus.status == 'Rejected') {
      if (selectStatus.rejectedreason == '') {
        setPopupContentMalert('Please Enter Rejected Reason');
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

  const fetchApplyPermissions = async () => {
    setPageName(!pageName);
    setApplyleavecheck(false);
    try {
      let res_employee = await axios.post(SERVICE.APPLYWORKFROMHOMEHIERARCHYBASEDLIST, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        hierachy: modeselection.value,
        sector: sectorSelection.value,
        username: isUserRoleAccess.companyname,
        team: isUserRoleAccess.team,
        pagename: 'menuteamworkfromhomeverification',
        role: isUserRoleAccess?.role
      });
      let res_vendor = await axios.get(SERVICE.APPLYWORKFROMHOME, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDisableLevelDropdown(res_employee?.data?.DataAccessMode)

      setApplyleavecheck(true);
      if (!res_employee?.data?.DataAccessMode && res_employee?.data?.resultedTeam?.length > 0 && res_employee?.data?.resultAccessFilter?.length < 1 && ['myallhierarchy', 'allhierarchy']?.includes(modeselection.value)) {
        setIsBtn(false);
        setApplyleavecheck(true);
        setUpdated(null);
        alert('Some employees have not been given access to this page.');
      }
      let answer = res_employee?.data?.resultAccessFilter?.length > 0 ? res_employee?.data?.resultAccessFilter?.filter((data) => data?.updatestatus === 'Not Completed') : [];
      let answerCompleted = res_employee?.data?.resultAccessFilter?.length > 0 ? res_employee?.data?.resultAccessFilter?.filter((data) => data?.updatestatus === 'Completed') : [];

      // Get the current month and year
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      let uninformResult = res_vendor?.data?.applyworkfromhomes;
      let overallPermissionCounts = {};
      let monthlyPermissionCounts = {};

      if (uninformResult?.length > 0) {
        // Filter for the current month's data
        const monthlyData = uninformResult.filter((item) => {
          const leaveDate = new Date(item.date);
          return leaveDate.getMonth() + 1 === currentMonth && leaveDate.getFullYear() === currentYear;
        });

        // Function to calculate leave counts
        const calculatePermissionCounts = (data) => {
          return data.reduce((acc, item) => {
            if (!acc[item.employeeid]) {
              acc[item.employeeid] = {
                employeename: item.employeename,
                employeeid: item.employeeid,
                approvedCount: 0,
                appliedCount: 0,
                rejectedCount: 0,
              };
            }

            // Count Approved and Applied statuses
            if (item.status === 'Approved') {
              acc[item.employeeid].approvedCount += 1;
            } else if (item.status === 'Applied') {
              acc[item.employeeid].appliedCount += 1;
            } else if (item.status === 'Rejected') {
              acc[item.employeeid].rejectedCount += 1;
            }

            return acc;
          }, {});
        };

        // Calculate leave counts for overall and monthly data
        overallPermissionCounts = calculatePermissionCounts(uninformResult);
        monthlyPermissionCounts = calculatePermissionCounts(monthlyData);
      }

      const itemsWithSerialNumberNotCompleted = answer?.map((item, index) => {
        const groupedItemOverAllNotCompleted = overallPermissionCounts[item.employeeid];
        const groupedItemMonthNotCompleted = monthlyPermissionCounts[item.employeeid];

        return {
          id: item._id,
          serialNumber: index + 1,
          employeeid: item.employeeid,
          employeename: item.employeename,
          date: item.date,
          // fromtime: convertedTime,
          requesthours: item.requesthours + ' ' + item.permissiontype,
          endtime: item.endtime,
          reasonforworkfromhome: item.reasonforworkfromhome,
          status: item.status,
          overAllappliedCount: groupedItemOverAllNotCompleted?.appliedCount || 0,
          overAllapprovedCount: groupedItemOverAllNotCompleted?.approvedCount || 0,
          overAllrejectedCount: groupedItemOverAllNotCompleted?.rejectedCount || 0,
          monthlyappliedCount: groupedItemMonthNotCompleted?.appliedCount || 0,
          monthlyapprovedCount: groupedItemMonthNotCompleted?.approvedCount || 0,
          monthlyrejectedCount: groupedItemMonthNotCompleted?.rejectedCount || 0,
        };
      });

      const itemsWithSerialNumberCompleted = answerCompleted?.map((item, index) => {
        const groupedItemOverAllCompleted = overallPermissionCounts[item.employeeid];
        const groupedItemMonthCompleted = monthlyPermissionCounts[item.employeeid];
        return {
          id: item._id,
          serialNumber: index + 1,
          employeeid: item.employeeid,
          employeename: item.employeename,
          date: moment(item.date).format('DD-MM-YYYY'),
          requesthours: item.requesthours + ' ' + item.permissiontype,
          endtime: item.endtime,
          reasonforworkfromhome: item.reasonforworkfromhome,
          status: item.status,
          overAllappliedCount: groupedItemOverAllCompleted?.appliedCount || 0,
          overAllapprovedCount: groupedItemOverAllCompleted?.approvedCount || 0,
          overAllrejectedCount: groupedItemOverAllCompleted?.rejectedCount || 0,
          monthlyappliedCount: groupedItemMonthCompleted?.appliedCount || 0,
          monthlyapprovedCount: groupedItemMonthCompleted?.approvedCount || 0,
          monthlyrejectedCount: groupedItemMonthCompleted?.rejectedCount || 0,
        };
      });

      setPermissions(itemsWithSerialNumberNotCompleted);
      setCompletedPermissions(itemsWithSerialNumberCompleted);
      setFilteredDataItems(itemsWithSerialNumberNotCompleted);
      setTotalPagesApprovedPerm(Math.ceil(itemsWithSerialNumberNotCompleted.length / pageSizeApprovedPerm));
      setUpdated(null);
    } catch (err) {
      console.error('API Error:', err);
      setApplyleavecheck(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    if (updated !== null) {
      fetchApplyPermissions();
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

  const addSerialNumber = (datas) => {
    setItems(datas);
  };

  useEffect(() => {
    addSerialNumber(permissions);
  }, [permissions]);

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
    if (gridRefTableApprovedPerm.current) {
      const gridApi = gridRefTableApprovedPerm.current.api;
      const currentPage = gridApi.paginationGetCurrentPage() + 1;
      const totalPagesApprovedPerm = gridApi.paginationGetTotalPages();
      setPageApprovedPerm(currentPage);
      setTotalPagesApprovedPerm(totalPagesApprovedPerm);
    }
  }, []);

  const columnDataTableApprovedPerm = [
    {
      field: 'serialNumber',
      headerName: 'SNo',
      flex: 0,
      width: 80,
      hide: !columnVisibilityApprovedPerm.serialNumber,
      headerClassName: 'bold-header',
      pinned: 'left',
      lockPinned: true,
    },
    {
      field: 'employeeid',
      headerName: 'Employee Id',
      flex: 0,
      width: 150,
      hide: !columnVisibilityApprovedPerm.employeeid,
      headerClassName: 'bold-header',
      pinned: 'left',
      lockPinned: true,
    },
    {
      field: 'employeename',
      headerName: 'Employee Name',
      flex: 0,
      width: 200,
      hide: !columnVisibilityApprovedPerm.employeename,
      headerClassName: 'bold-header',
      pinned: 'left',
      lockPinned: true,
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 0,
      width: 120,
      hide: !columnVisibilityApprovedPerm.date,
      headerClassName: 'bold-header',
    },
    // {
    //   field: 'fromtime',
    //   headerName: 'From Time',
    //   flex: 0,
    //   width: 120,
    //   hide: !columnVisibilityApprovedPerm.fromtime,
    //   headerClassName: 'bold-header',
    // },
    // {
    //   field: 'requesthours',
    //   headerName: 'Request Hours',
    //   flex: 0,
    //   width: 100,
    //   hide: !columnVisibilityApprovedPerm.requesthours,
    //   headerClassName: 'bold-header',
    // },
    // {
    //   field: 'endtime',
    //   headerName: 'End Time',
    //   flex: 0,
    //   width: 120,
    //   hide: !columnVisibilityApprovedPerm.endtime,
    //   headerClassName: 'bold-header',
    // },
    {
      field: 'reasonforworkfromhome',
      headerName: 'Reason for WFH',
      flex: 0,
      width: 180,
      hide: !columnVisibilityApprovedPerm.reasonforworkfromhome,
      headerClassName: 'bold-header',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0,
      width: 150,
      hide: !columnVisibilityApprovedPerm.status,
      headerClassName: 'bold-header',
      cellRenderer: (params) => (
        <Grid sx={{ display: 'flex' }}>
          <Button
            variant="contained"
            style={{
              margin: '5px',
              cursor: 'default',
              padding: '5px',
              backgroundColor: params.value === 'Applied' ? '#FFC300' : params.value === 'Rejected' ? 'red' : params.value === 'Approved' ? 'green' : 'inherit',
              color: params.value === 'Applied' ? 'black' : params.value === 'Rejected' ? 'white' : 'white',
              fontSize: '10px',
              width: '90px',
              fontWeight: 'bold',
            }}
          >
            {params.value}
          </Button>
        </Grid>
      ),
    },
    {
      field: 'overallhistory',
      headerName: 'History',
      flex: 0,
      width: 250,
      hide: !columnVisibilityApprovedPerm.overallhistory,
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
      hide: !columnVisibilityApprovedPerm.monthhistory,
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
      width: 150,
      minHeight: '40px !important',
      filter: false,
      sortable: false,
      hide: !columnVisibilityApprovedPerm.actions,
      headerClassName: 'bold-header',
      cellRenderer: (params) => (
        <Grid sx={{ display: 'flex' }}>
          {isUserRoleCompare?.includes('iteampermissionverification') && (
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
                // handleStatusOpen();
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

  const DateFrom = (isUserRoleAccess.role.includes('HiringManager') || isUserRoleAccess.role.includes('HR') || isUserRoleAccess.role.includes('Manager') || isUserRoleCompare.includes('lteampermissionverification')) && Accessdrop === 'HR' ? formattedDatePresent : formattedDatet;

  // Datatable
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQueryApprovedPerm(value);
    applyNormalFilter(value);
    setFilteredRowData([]);
  };

  const applyNormalFilter = (searchValue) => {
    // Split the search query into individual terms
    const searchTerms = searchValue.toLowerCase().split(' ');

    // Modify the filtering logic to check each term
    const filtered = items?.filter((item) => {
      return searchTerms.every((term) => Object.values(item).join(' ').toLowerCase().includes(term));
    });
    setFilteredDataItems(filtered);
    setPageApprovedPerm(1);
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

    setFilteredDataItems(filtered); // Update filtered data
    setAdvancedFilter(filters);
    // handleCloseSearchApprovedPerm(); // Close the popover after search
  };

  // Undo filter funtion
  const handleResetSearch = () => {
    setAdvancedFilter(null);
    setSearchQueryApprovedPerm('');
    setFilteredDataItems(permissions);
  };

  // Show filtered combination in the search bar
  const getSearchDisplay = () => {
    if (advancedFilter && advancedFilter.length > 0) {
      return advancedFilter
        .map((filter, index) => {
          let showname = columnDataTableApprovedPerm.find((col) => col.field === filter.column)?.headerName;
          return `${showname} ${filter.condition} "${filter.value}"`;
        })
        .join(' ' + (advancedFilter.length > 1 ? advancedFilter[1].condition : '') + ' ');
    }
    return searchQueryApprovedPerm;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPagesApprovedPerm) {
      setPageApprovedPerm(newPage);
      gridRefTableApprovedPerm.current.api.paginationGoToPage(newPage - 1);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSizeApprovedPerm(newSize);
    if (gridApi) {
      gridApi.paginationSetPageSize(newSize);
    }
  };

  // Show All Columns functionality
  const handleShowAllColumns = () => {
    const updatedVisibility = { ...columnVisibilityApprovedPerm };
    for (const columnKey in updatedVisibility) {
      updatedVisibility[columnKey] = true;
    }
    setColumnVisibilityApprovedPerm(updatedVisibility);
  };

  // // Function to filter columns based on search query
  const filteredColumns = columnDataTableApprovedPerm.filter((column) => column.headerName.toLowerCase().includes(searchQueryManageApprovedPerm.toLowerCase()));

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

    setColumnVisibilityApprovedPerm((prevVisibility) => {
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

      setColumnVisibilityApprovedPerm((prevVisibility) => {
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
    setColumnVisibilityApprovedPerm((prevVisibility) => ({
      ...prevVisibility,
      [colId]: event.visible, // Set visibility directly from the event
    }));
  }, []);

  // Excel
  const [fileFormat, setFormat] = useState('');
  let exportColumnNamescrt = ['Employee Name', 'Employee Id', 'Date', 'Reason For WFH', 'Status', 'Applied Count', 'Approved Count', 'Rejected Count'];
  let exportRowValuescrt = ['employeename', 'employeeid', 'date', 'reasonforworkfromhome', 'status', 'overAllappliedCount', 'overAllapprovedCount', 'overAllrejectedCount'];

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
          Date: row.date,
          'Reason For WFH': row.reasonforworkfromhome,
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
          Date: row.date,
          // 'From Time': row.fromtime,
          // 'Request Hours': row.requesthours,
          // 'End Time': row.endtime,
          'Reason For WFH': row.reasonforworkfromhome,
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
      { header: 'Date', key: 'Date', width: 20 },
      { header: 'From Time', key: 'From Time', width: 25 },
      { header: 'Request Hours', key: 'Request Hours', width: 25 },
      { header: 'End Time', key: 'End Time', width: 25 },
      {
        header: 'Reason For Permission',
        key: 'Reason For Permission',
        width: 25,
      },
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
    saveAs(new Blob([buffer]), `Team WFH Verification.${fileExtension}`);
    setIsFilterOpen(false);
  };

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Team WFH Verification',
    pageStyle: 'print',
  });

  // pdf
  const downloadPdf = (isfilter) => {
    const doc = new jsPDF({ orientation: 'landscape' });

    // Define the table headers
    const headers = ['SNo', 'Employee Id', 'Employee Name', 'Date', 'From Time', 'Request Hours', 'End Time', 'Reason For Permission', 'Status', 'History', 'Current Month History'];

    let data = [];
    let resultdata = (filteredRowData.length > 0 ? filteredRowData : filteredData) ?? [];

    if (isfilter === 'filtered') {
      data = resultdata.map((row, index) => {
        const overallHistory = [`Total Applied: ${row.overAllappliedCount || ''}`, `Total Approved: ${row.overAllapprovedCount || ''}`, `Total Rejected: ${row.overAllrejectedCount || ''}`].join('\n');

        const monthHistory = [`Total Applied: ${row.monthlyappliedCount || ''}`, `Total Approved: ${row.monthlyapprovedCount || ''}`, `Total Rejected: ${row.monthlyrejectedCount || ''}`].join('\n');

        return [index + 1, row.employeeid, row.employeename, row.date, row.reasonforworkfromhome, row.status, overallHistory, monthHistory];
      });
    } else if (isfilter === 'overall') {
      data = items.map((row, index) => {
        const overallHistory = [`Total Applied: ${row.overAllappliedCount || ''}`, `Total Approved: ${row.overAllapprovedCount || ''}`, `Total Rejected: ${row.overAllrejectedCount || ''}`].join('\n');

        const monthHistory = [`Total Applied: ${row.monthlyappliedCount || ''}`, `Total Approved: ${row.monthlyapprovedCount || ''}`, `Total Rejected: ${row.monthlyrejectedCount || ''}`].join('\n');

        return [index + 1, row.employeeid, row.employeename, row.date, row.reasonforworkfromhome, row.status, overallHistory, monthHistory];
      });
    }

    // Split data into chunks to fit on pages
    const columnsPerSheet = 10; // Number of columns per sheet
    const chunks = [];

    for (let i = 0; i < headers.length; i += columnsPerSheet) {
      const chunkHeaders = headers.slice(i, i + columnsPerSheet);
      const chunkData = data.map((row) => row.slice(i, i + columnsPerSheet + 1));

      chunks.push({ headers: chunkHeaders, data: chunkData });
    }

    chunks.forEach((chunk, index) => {
      if (index > 0) {
        doc.addPage({ orientation: 'landscape' });
      }

      doc.autoTable({
        theme: 'grid',
        styles: { fontSize: 8 },
        head: [chunk.headers],
        body: chunk.data,
        startY: 20,
        margin: { top: 20, left: 10, right: 10, bottom: 10 },
      });
    });

    doc.save('Team Leave Verification.pdf');
  };

  // image
  const handleCaptureImage = () => {
    if (gridRefImageApprovedPerm.current) {
      domtoimage
        .toBlob(gridRefImageApprovedPerm.current)
        .then((blob) => {
          saveAs(blob, 'Team WFH Verification.png');
        })
        .catch((error) => {
          console.error('API Error:', error);
          console.error('dom-to-image error: ', error);
        });
    }
  };

  // Pagination for innter filter
  const getVisiblePageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 3;

    const startPage = Math.max(1, pageApprovedPerm - 1);
    const endPage = Math.min(totalPagesApprovedPerm, startPage + maxVisiblePages - 1);

    // Loop through and add visible pageApprovedPerm numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // If there are more pages after the last visible pageApprovedPerm, show ellipsis
    if (endPage < totalPagesApprovedPerm) {
      pageNumbers.push('...');
    }

    return pageNumbers;
  };

  // Pagination for outer filter
  const filteredData = filteredDataItems?.slice((pageApprovedPerm - 1) * pageSizeApprovedPerm, pageApprovedPerm * pageSizeApprovedPerm);
  const totalPagesApprovedPermOuter = Math.ceil(filteredDataItems?.length / pageSizeApprovedPerm);
  const visiblePages = Math.min(totalPagesApprovedPermOuter, 3);
  const firstVisiblePage = Math.max(1, pageApprovedPerm - 1);
  const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPagesApprovedPermOuter);
  const pageNumbers = [];
  const indexOfLastItem = pageApprovedPerm * pageSizeApprovedPerm;
  const indexOfFirstItem = indexOfLastItem - pageSizeApprovedPerm;
  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }

  return (
    <Box>
      <Headtitle title={'Team WFH VERIFICATION'} />
      {/* ****** Header Content ****** */}
      <PageHeading title="Team WFH Verification" modulename="Leave&Permission" submodulename="Work From Home" mainpagename="Team WFH Verification" subpagename="" subsubpagename="" />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes('lteampermissionverification') && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Team WFH Verification List</Typography>
            </Grid>
            <Grid container spacing={2} style={userStyle.dataTablestyle}>
              <Grid item md={2} xs={12} sm={12}>
                <Box>
                  <label>Show entries:</label>
                  <Select
                    id="pageSizeSelect"
                    value={pageSizeApprovedPerm}
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
                  {isUserRoleCompare?.includes('excelteampermissionverification') && (
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
                  {isUserRoleCompare?.includes('csvteampermissionverification') && (
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
                  {isUserRoleCompare?.includes('printteampermissionverification') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('pdfteampermissionverification') && (
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
                  {isUserRoleCompare?.includes('imageteampermissionverification') && (
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
                            <IoMdOptions style={{ cursor: 'pointer' }} onClick={handleClickSearchApprovedPerm} />
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
                <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumnsApprovedPerm}>
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
                <LoadingButton loading={isBtn} variant="contained" onClick={(e) => fetchApplyPermissions(e)}>
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
                <Box sx={{ width: '100%' }} className={'ag-theme-quartz'} ref={gridRefImageApprovedPerm}>
                  <AgGridReact
                    rowData={filteredDataItems}
                    columnDefs={columnDataTableApprovedPerm.filter((column) => columnVisibilityApprovedPerm[column.field])}
                    ref={gridRefTableApprovedPerm}
                    defaultColDef={defaultColDef}
                    domLayout={'autoHeight'}
                    getRowStyle={getRowStyle}
                    pagination={true}
                    paginationPageSize={pageSizeApprovedPerm}
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
                {/* show and hide based on the inner filter and outer filter */}
                {/* <Box style={userStyle.dataTablestyle}>
                  <Box>
                    Showing{" "}
                    {
                      gridApi && gridApi.getFilterModel() && Object.keys(gridApi.getFilterModel()).length === 0 ? (
                        (filteredDataItems.length > 0 ? (pageApprovedPerm - 1) * pageSizeApprovedPerm + 1 : 0)
                      ) : (
                        filteredRowData.length > 0 ? (pageApprovedPerm - 1) * pageSizeApprovedPerm + 1 : 0
                      )
                    }{" "}to{" "}
                    {
                      gridApi && gridApi.getFilterModel() && Object.keys(gridApi.getFilterModel()).length === 0 ? (
                        Math.min(pageApprovedPerm * pageSizeApprovedPerm, filteredDataItems.length)
                      ) : (
                        filteredRowData.length > 0 ? Math.min(pageApprovedPerm * pageSizeApprovedPerm, filteredRowData.length) : 0
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
                    <Button onClick={() => handlePageChange(1)} disabled={pageApprovedPerm === 1} sx={userStyle.paginationbtn}  > <FirstPageIcon /> </Button>
                    <Button onClick={() => handlePageChange(pageApprovedPerm - 1)} disabled={pageApprovedPerm === 1} sx={userStyle.paginationbtn}  > <NavigateBeforeIcon />  </Button>
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
                            "&:hover": { backgroundColor: "transparent", boxShadow: "none", },
                          }),
                        }}
                        className={pageApprovedPerm === pageNumber ? "active" : ""}
                        disabled={pageApprovedPerm === pageNumber}
                      >
                        {pageNumber}
                      </Button>
                    ))}
                    <Button onClick={() => handlePageChange(pageApprovedPerm + 1)} disabled={pageApprovedPerm === totalPagesApprovedPerm} sx={userStyle.paginationbtn} > <NavigateNextIcon /> </Button>
                    <Button onClick={() => handlePageChange(totalPagesApprovedPerm)} disabled={pageApprovedPerm === totalPagesApprovedPerm} sx={userStyle.paginationbtn} ><LastPageIcon /> </Button>
                  </Box>
                </Box> */}
              </>
            )}
            <br /> <br />
            <CompletedTeamPermissionVerification data={CompletedPermissions} setUpdated={setUpdated} />
          </Box>
        </>
      )}

      {/* Manage Column */}
      <Popover id={idApprovedPerm} open={isManageColumnsOpenApprovedPerm} anchorEl={anchorElApprovedPerm} onClose={handleCloseManageColumnsApprovedPerm} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <ManageColumnsContent
          handleClose={handleCloseManageColumnsApprovedPerm}
          searchQuery={searchQueryManageApprovedPerm}
          setSearchQuery={setSearchQueryManageApprovedPerm}
          filteredColumns={filteredColumns}
          columnVisibility={columnVisibilityApprovedPerm}
          toggleColumnVisibility={toggleColumnVisibility}
          setColumnVisibility={setColumnVisibilityApprovedPerm}
          initialColumnVisibility={initialColumnVisibilityApprovedPerm}
          columnDataTable={columnDataTableApprovedPerm}
        />
      </Popover>

      {/* Search Bar */}
      <Popover id={idSearchApprovedPerm} open={openSearchApprovedPerm} anchorEl={anchorElSearchApprovedPerm} onClose={handleCloseSearchApprovedPerm} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <AdvancedSearchBar columns={columnDataTableApprovedPerm.filter((data) => data.field !== 'actions')} onSearch={applyAdvancedFilter} initialSearchValue={searchQueryApprovedPerm} handleCloseSearch={handleCloseSearchApprovedPerm} />
      </Popover>

      {/* dialog status change */}
      <Dialog maxWidth="lg" open={statusOpen} onClose={handleStatusClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogContent
          sx={{
            width: '600px',
            height: selectStatus.status == 'Rejected' ? '260px' : '220px',
            overflow: 'visible',
            '& .MuiPaper-root': {
              overflow: 'visible',
            },
          }}
        >
          <Grid container spacing={2}>
            <Grid item md={12} xs={12} sm={12}>
              <Typography sx={userStyle.HeaderText}>Edit Apply Status</Typography>
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
            <Grid item md={6} sm={6} xs={12}></Grid>
            <Grid item md={12} sm={12} xs={12}>
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
          </Grid>
        </DialogContent>
        {selectStatus.status == 'Rejected' ? <br /> : null}
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
            onClick={() => fetchPermissionHistoryUpdate(selectStatus.employeeid, selectStatus.employeename)}
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
                      {/* <TableCell><span>
                          {row?.employee && row?.employee?.map((data, index) => (
                            <Typography key={index} variant="body1">{`${index + 1}.${data}, `}</Typography>
                          ))}
                        </span></TableCell> */}
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

      {/* Update History Popup */}
      <Dialog open={isOpenHistoryUpdate} onClose={handleCloseModHistoryUpdate} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="lg" fullWidth={true} sx={{ marginTop: '95px' }}>
        <Box sx={{ padding: '20px 50px' }}>
          <>
            <Typography sx={userStyle.HeaderText}>Employee Permission History</Typography>
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
                          <b>Type</b>
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
                          <b>Cancelled Count</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyOverAllDataUpdate.length > 0 ? (
                        historyOverAllDataUpdate.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{'WFH'}</TableCell>
                            <TableCell>{row?.appliedCount}</TableCell>
                            <TableCell>{row?.approvedCount}</TableCell>
                            <TableCell>{row?.rejectedCount}</TableCell>
                            <TableCell>{row?.cancelCount}</TableCell>
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
                <Typography sx={userStyle.HeaderText}>Month</Typography>
                <br />
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <b>Type</b>
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
                          <b>Cancelled Count</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyMonthDataUpdate.length > 0 ? (
                        historyMonthDataUpdate.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{'WFH'}</TableCell>
                            <TableCell>{row?.appliedCount}</TableCell>
                            <TableCell>{row?.approvedCount}</TableCell>
                            <TableCell>{row?.rejectedCount}</TableCell>
                            <TableCell>{row?.cancelCount}</TableCell>
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

      {/* <TableContainer component={Paper} sx={userStyle.printcls}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table" id="usertable" ref={componentRef}>
          <TableHead>
            <TableRow>
              <TableCell>SNo</TableCell>
              <TableCell>Employee Id</TableCell>
              <TableCell>Employee Name</TableCell>
              <TableCell>Date</TableCell>
             
              <TableCell>Reason For Permission</TableCell>
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
                  <TableCell>{row.date}</TableCell>
                  
                  <TableCell>{row.reasonforworkfromhome}</TableCell>
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
      </TableContainer> */}

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
              downloadPdf('filtered');
              setIsPdfFilterOpen(false);
            }}
          >
            Export Filtered Data
          </Button>
          <Button
            variant="contained"
            onClick={(e) => {
              downloadPdf('overall');
              setIsPdfFilterOpen(false);
            }}
          >
            Export Over All Data
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
      <CustomApprovalDialog
        open={dialogOpen}
        handleClose={handleCloseDialog}
        eligibleUsers={eligibleUsers}
        eligibleUsersLevel={eligibleUsersLevel}
      />
      <MessageAlert openPopup={openPopupMalert} handleClosePopup={handleClosePopupMalert} popupContent={popupContentMalert} popupSeverity={popupSeverityMalert} />
      {/* SUCCESS */}
      <AlertDialog openPopup={openPopup} handleClosePopup={handleClosePopup} popupContent={popupContent} popupSeverity={popupSeverity} />
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
        filename={'Team WFH Verification'}
        exportColumnNames={exportColumnNamescrt}
        exportRowValues={exportRowValuescrt}
        componentRef={componentRef}
      />
    </Box>
  );
}

export default TeamPermissionVerification;
