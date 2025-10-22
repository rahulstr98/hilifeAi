import React, { useContext, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { FaEdit, FaFileCsv, FaFileExcel, FaFilePdf, FaPrint, FaSearch } from 'react-icons/fa';
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ImageIcon from "@mui/icons-material/Image";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Button, Checkbox, Dialog, DialogTitle, DialogActions, DialogContent, FormControl, Grid, IconButton, InputLabel, MenuItem, OutlinedInput, Paper, Popover, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextareaAutosize, Typography, InputAdornment, Tooltip } from "@mui/material";
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import { getCurrentServerTime } from '../../components/getCurrentServerTime';

import axios from "axios";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment-timezone";
import { ThreeDots } from "react-loader-spinner";
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import { handleApiError } from "../../components/Errorhandling";
import Headtitle from "../../components/Headtitle";
import { AuthContext, UserRoleAccessContext } from "../../context/Appcontext";
import { userStyle, colourStyles } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";
import Webcamimage from "../hr/webcamprofile";
import { IoMdOptions } from "react-icons/io";
import { MdClose } from "react-icons/md";
import domtoimage from 'dom-to-image';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import ExportData from "../../components/ExportData";
import MessageAlert from "../../components/MessageAlert";
import PageHeading from "../../components/PageHeading";
import AlertDialog from "../../components/Alert";
import AdvancedSearchBar from '../../components/SearchbarEbList';
import ManageColumnsContent from "../../components/ManageColumn";
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
function CompletedTeamLeaveVerification({ data, setUpdated }) {


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


  const gridRefTableTeamLveVerif = useRef(null);
  const gridRefImageTeamLveVerif = useRef(null);

  const [appleaveEdit, setAppleaveEdit] = useState([]);
  const [selectStatus, setSelectStatus] = useState({});
  const [isApplyLeave, setIsApplyLeave] = useState([]);

  const [applyleaves, setApplyleaves] = useState([]);
  // State to track advanced filter
  const [advancedFilter, setAdvancedFilter] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [columnApi, setColumnApi] = useState(null);
  const [filteredDataItems, setFilteredDataItems] = useState(applyleaves);
  const [filteredRowData, setFilteredRowData] = useState([]);

  const { isUserRoleCompare, isUserRoleAccess, pageName, setPageName, buttonStyles, } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);

  const [applyleaveCheck, setApplyleavecheck] = useState(true);

  const [statusOpen, setStatusOpen] = useState(false);
  const handleStatusOpen = () => { setStatusOpen(true); };
  const handleStatusClose = () => { setStatusOpen(false); };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
  // page refersh reload
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

  //Datatable
  const [pageTeamLveVerif, setPageTeamLveVerif] = useState(1);
  const [pageSizeTeamLveVerif, setPageSizeTeamLveVerif] = useState(10);
  const [searchQueryTeamLveVerif, setSearchQueryTeamLveVerif] = useState("");
  const [totalPagesTeamLveVerif, setTotalPagesTeamLveVerif] = useState(1);

  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => { setIsErrorOpen(true); };
  const handleCloseerr = () => { setIsErrorOpen(false); };

  // Manage Columns
  const [searchQueryManageTeamLveVerif, setSearchQueryManageTeamLveVerif] = useState("");
  const [isManageColumnsOpenTeamLveVerif, setManageColumnsOpenTeamLveVerif] = useState(false);
  const [anchorElTeamLveVerif, setAnchorElTeamLveVerif] = useState(null);

  const handleOpenManageColumnsTeamLveVerif = (event) => {
    setAnchorElTeamLveVerif(event.currentTarget);
    setManageColumnsOpenTeamLveVerif(true);
  };
  const handleCloseManageColumnsTeamLveVerif = () => {
    setManageColumnsOpenTeamLveVerif(false);
    setSearchQueryManageTeamLveVerif("");
  };

  const openTeamLveVerif = Boolean(anchorElTeamLveVerif);
  const idTeamLveVerif = openTeamLveVerif ? "simple-popover" : undefined;

  // Search bar
  const [anchorElSearchTeamLveVerif, setAnchorElSearchTeamLveVerif] = React.useState(null);
  const handleClickSearchTeamLveVerif = (event) => {
    setAnchorElSearchTeamLveVerif(event.currentTarget);
  };
  const handleCloseSearchTeamLveVerif = () => {
    setAnchorElSearchTeamLveVerif(null);
    setSearchQueryTeamLveVerif("");
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
  }

  const [isEditOpenCheckList, setIsEditOpenCheckList] = useState(false);
  const handleClickOpenEditCheckList = () => {
    setIsEditOpenCheckList(true);
  };
  const handleCloseModEditCheckList = (e, reason) => {
    if (reason && reason === "backdropClick") return;
    setIsEditOpenCheckList(false);
  };

  // Update history
  const [isOpenHistoryUpdate, setIsOpenHistoryUpdate] = useState(false);
  const handleClickOpenHistoryUpdate = () => {
    setIsOpenHistoryUpdate(true);
  };
  const handleCloseModHistoryUpdate = (e, reason) => {
    if (reason && reason === "backdropClick") return;
    setIsOpenHistoryUpdate(false);
  };

  const [isCheckedList, setIsCheckedList] = useState([]);
  const [isCheckedListOverall, setIsCheckedListOverall] = useState(false);
  const overallCheckListChange = () => {
    let newArrayChecked = isCheckedList.map((item) => item = !isCheckedListOverall);

    let returnOverall = groupDetails.map((row) => {

      {
        if (row.checklist === "DateTime") {
          if ((((row.data !== undefined && row.data !== "") || (row.files !== undefined)) && row.data.length === 16)) {
            return true;
          } else {
            return false;
          }
        }
        else if (row.checklist === "Date Multi Span") {
          if ((((row.data !== undefined && row.data !== "") || (row.files !== undefined)) && row.data.length === 21)) {
            return true;
          } else {
            return false;
          }
        }
        else if (row.checklist === "Date Multi Span Time") {
          if ((((row.data !== undefined && row.data !== "") || (row.files !== undefined)) && row.data.length === 33)) {
            return true;
          } else {
            return false;
          }
        }
        else if (row.checklist === "Date Multi Random Time") {
          if ((((row.data !== undefined && row.data !== "") || (row.files !== undefined)) && row.data.length === 16)) {
            return true;
          } else {
            return false;
          }

        }
        else if (((row.data !== undefined && row.data !== "") || (row.files !== undefined))) {
          return true;
        } else {
          return false;
        }

      }

    })

    let allcondition = returnOverall.every((item) => item == true);

    if (allcondition) {
      setIsCheckedList(newArrayChecked);
      setIsCheckedListOverall(!isCheckedListOverall);
    } else {
      setPopupContentMalert("Please Fill all the Fields");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }

  }

  const handleCheckboxChange = (index) => {
    const newCheckedState = [...isCheckedList];
    newCheckedState[index] = !newCheckedState[index];

    let currentItem = groupDetails[index];

    let data = () => {
      if (currentItem.checklist === "DateTime") {
        if ((((currentItem.data !== undefined && currentItem.data !== "") || (currentItem.files !== undefined)) && currentItem.data.length === 16)) {
          return true;
        } else {
          return false;
        }
      }
      else if (currentItem.checklist === "Date Multi Span") {
        if ((((currentItem.data !== undefined && currentItem.data !== "") || (currentItem.files !== undefined)) && currentItem.data.length === 21)) {
          return true;
        } else {
          return false;
        }
      }
      else if (currentItem.checklist === "Date Multi Span Time") {
        if ((((currentItem.data !== undefined && currentItem.data !== "") || (currentItem.files !== undefined)) && currentItem.data.length === 33)) {
          return true;
        } else {
          return false;
        }
      }
      else if (currentItem.checklist === "Date Multi Random Time") {
        if ((((currentItem.data !== undefined && currentItem.data !== "") || (currentItem.files !== undefined)) && currentItem.data.length === 16)) {
          return true;
        } else {
          return false;
        }

      }
      else if (((currentItem.data !== undefined && currentItem.data !== "") || (currentItem.files !== undefined))) {
        return true;
      } else {
        return false;
      }
    }

    if (data()) {
      setIsCheckedList(newCheckedState);
      handleDataChange(newCheckedState[index], index, "Check Box");
      let overallChecked = newCheckedState.every((item) => item === true);

      if (overallChecked) {
        setIsCheckedListOverall(true);
      } else {
        setIsCheckedListOverall(false);
      }
    } else {
      setPopupContentMalert("Please Fill the Field");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }


  };

  let name = "create";

  //webcam
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [getImg, setGetImg] = useState(null);
  const [isWebcamCapture, setIsWebcamCapture] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [valNum, setValNum] = useState(0);

  const webcamOpen = () => { setIsWebcamOpen(true); };
  const webcamClose = () => { setIsWebcamOpen(false); };
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
    const link = document.createElement("a");
    link.href = url;
    window.open(link, "_blank");
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
  const [fromWhere, setFromWhere] = useState("");

  const [firstDateValue, setFirstDateValue] = useState([]);
  const [firstTimeValue, setFirstTimeValue] = useState([]);
  const [secondDateValue, setSecondDateValue] = useState([]);
  const [secondTimeValue, setSecondTimeValue] = useState([]);

  const [isCheckList, setIsCheckList] = useState(true);

  let completedbyName = isUserRoleAccess.companyname;


  const updateIndividualData = async (index) => {
    setPageName(!pageName)
    let searchItem = datasAvailedDB.find((item) => item.commonid == postID && item.module == "Leave&Permission" && item.submodule == "Leave" && item.mainpage == "Apply Leave" && item.status.toLowerCase() !== "completed");

    let combinedGroups = groupDetails?.map((data) => {
      let check = (data.data !== undefined && data.data !== "") || data.files !== undefined;

      if (check) {
        return {
          ...data, completedby: completedbyName, completedat: new Date()
        }
      } else {
        return {
          ...data, completedby: "", completedat: ""
        }
      }

    })

    try {
      let objectID = combinedGroups[index]?._id;
      let objectData = combinedGroups[index];
      if (searchItem) {
        let assignbranches = await axios.put(
          `${SERVICE.MYCHECKLIST_SINGLEBYOBJECTID}/${objectID}`,
          {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            data: String(objectData?.data),
            lastcheck: objectData?.lastcheck,
            newFiles: objectData?.files,
            completedby: objectData?.completedby,
            completedat: objectData?.completedat
          }
        );
        await fecthDBDatas();
      } else {
        let assignbranches = await axios.post(
          `${SERVICE.MYCHECKLIST_CREATE}`,
          {
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
            status: "progress",
            groups: combinedGroups,
            addedby: [
              {
                name: String(isUserRoleAccess.companyname),
                date: String(new Date()),
              },
            ],
          }
        );
        await fecthDBDatas();
      }
      setPopupContent("Updated Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();

    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  }

  async function fecthDBDatas() {
    setPageName(!pageName)
    try {
      let res = await axios.get(SERVICE.MYCHECKLIST);
      setDatasAvailedDB(res?.data?.mychecklist);

      let foundData = res?.data?.mychecklist.find((item) => item.commonid == postID)
      setGroupDetails(foundData?.groups);
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  }


  const updateDateValuesAtIndex = (value, index) => {

    setDateValue(prevArray => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, "DateTime", "date")
  };

  const updateTimeValuesAtIndex = (value, index) => {

    setTimeValue(prevArray => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, "DateTime", "time")
  };
  //---------------------------------------------------------------------------------------------------------------

  const updateFromDateValueAtIndex = (value, index) => {

    setDateValueMultiFrom(prevArray => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, "Date Multi Span", "fromdate")
  };

  const updateToDateValueAtIndex = (value, index) => {

    setDateValueMultiTo(prevArray => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, "Date Multi Span", "todate")
  };
  //---------------------------------------------------------------------------------------------------------------------------------
  const updateDateValueAtIndex = (value, index) => {

    setDateValueRandom(prevArray => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, "Date Multi Random Time", "date")
  };

  const updateTimeValueAtIndex = (value, index) => {

    setTimeValueRandom(prevArray => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, "Date Multi Random Time", "time")
  };
  //---------------------------------------------------------------------------------------------------------------------------------------



  const updateFirstDateValuesAtIndex = (value, index) => {

    setFirstDateValue(prevArray => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, "Date Multi Span Time", "fromdate")
  };

  const updateFirstTimeValuesAtIndex = (value, index) => {

    setFirstTimeValue(prevArray => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, "Date Multi Span Time", "fromtime")
  };

  const updateSecondDateValuesAtIndex = (value, index) => {

    setSecondDateValue(prevArray => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, "Date Multi Span Time", "todate")
  };

  const updateSecondTimeValuesAtIndex = (value, index) => {

    setSecondTimeValue(prevArray => {
      const newArray = [...prevArray]; // Create a copy of the array
      newArray[index] = value; // Update value at the specified index
      return newArray; // Return the updated array
    });
    handleDataChange(value, index, "Date Multi Span Time", "totime")
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
          ...getData, lastcheck: e
        }

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'Text Box':
        getData = groupDetails[index];
        finalData = {
          ...getData, data: e.target.value
        }

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'Text Box-number':
        getData = groupDetails[index];
        finalData = {
          ...getData, data: e.target.value
        }

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'Text Box-alpha':
        getData = groupDetails[index];
        finalData = {
          ...getData, data: e.target.value
        }

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'Text Box-alphanumeric':
        getData = groupDetails[index];
        finalData = {
          ...getData, data: e.target.value
        }

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'Attachments':
        getData = groupDetails[index];
        finalData = {
          ...getData, files: e
        }

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'Pre-Value':
        break;
      case 'Date':
        getData = groupDetails[index];
        finalData = {
          ...getData, data: e.target.value
        }

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'Time':
        getData = groupDetails[index];
        finalData = {
          ...getData, data: e.target.value
        }

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'DateTime':
        if (sub == "date") {
          getData = groupDetails[index];
          finalData = {
            ...getData, data: `${e} ${timeValue[index]}`
          }

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        } else {
          getData = groupDetails[index];
          finalData = {
            ...getData, data: `${dateValue[index]} ${e}`
          }

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        }

        break;
      case 'Date Multi Span':
        if (sub == "fromdate") {
          getData = groupDetails[index];
          finalData = {
            ...getData, data: `${e} ${dateValueMultiTo[index]}`
          }

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        } else {
          getData = groupDetails[index];
          finalData = {
            ...getData, data: `${dateValueMultiFrom[index]} ${e}`
          }

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        }
        break;
      case 'Date Multi Span Time':
        if (sub == "fromdate") {
          getData = groupDetails[index];
          finalData = {
            ...getData, data: `${e} ${firstTimeValue[index]}/${secondDateValue[index]} ${secondTimeValue[index]}`
          }

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        } else if (sub == "fromtime") {
          getData = groupDetails[index];
          finalData = {
            ...getData, data: `${firstDateValue[index]} ${e}/${secondDateValue[index]} ${secondTimeValue[index]}`
          }

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        }
        else if (sub == "todate") {
          getData = groupDetails[index];
          finalData = {
            ...getData, data: `${firstDateValue[index]} ${firstTimeValue[index]}/${e} ${secondTimeValue[index]}`
          }

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        } else {
          getData = groupDetails[index];
          finalData = {
            ...getData, data: `${firstDateValue[index]} ${firstTimeValue[index]}/${secondDateValue[index]} ${e}`
          }

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        }
        break;
      case 'Date Multi Random':
        getData = groupDetails[index];
        finalData = {
          ...getData, data: e.target.value
        }

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
      case 'Date Multi Random Time':

        if (sub == "date") {
          getData = groupDetails[index];
          finalData = {
            ...getData, data: `${e} ${timeValueRandom[index]}`
          }


          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        } else {
          getData = groupDetails[index];
          finalData = {
            ...getData, data: `${dateValueRandom[index]} ${e}`
          }

          updatedTodos = [...groupDetails];
          updatedTodos[index] = finalData;
          setGroupDetails(updatedTodos);
        }
        break;
      case 'Radio':
        getData = groupDetails[index];
        finalData = {
          ...getData, data: e.target.value
        }

        updatedTodos = [...groupDetails];
        updatedTodos[index] = finalData;
        setGroupDetails(updatedTodos);
        break;
    }
  }

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
          data: reader.result.split(",")[1],
          remark: "resume file",
        }, index, "Attachments")

    };

  };

  const getCodeNew = async (details) => {
    setPageName(!pageName)
    setGetDetails(details);
    try {
      let res = await axios.get(SERVICE.MYCHECKLIST);
      setDatasAvailedDB(res?.data?.mychecklist);
      await fetchFilteredUsersStatus(details);
      let searchItem = res?.data?.mychecklist.find((item) => item.commonid == details?.id && item.module == "Leave&Permission" && item.submodule == "Leave" && item.mainpage == "Apply Leave" && item.status.toLowerCase() !== "completed");

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
          if (data.checklist === "Date Multi Random Time") {
            if (data?.data && data?.data !== "") {
              const [date, time] = data?.data?.split(" ");
              return { date, time };
            }

          } else {
            return { date: "0", time: "0" };
          }
        });

        let forDateSpan = searchItem?.groups?.map((data) => {
          if (data.checklist === "Date Multi Span") {
            if (data?.data && data?.data !== "") {
              const [fromdate, todate] = data?.data?.split(" ");
              return { fromdate, todate };
            }
          } else {
            return { fromdate: "0", todate: "0" };
          }
        })


        let forDateTime = searchItem?.groups?.map((data) => {
          if (data.checklist === "DateTime") {
            if (data?.data && data?.data !== "") {
              const [date, time] = data?.data?.split(" ");
              return { date, time };
            }
          } else {
            return { date: "0", time: "0" };
          }
        })

        let forDateMultiSpanTime = searchItem?.groups?.map((data) => {
          if (data.checklist === "Date Multi Span Time") {
            if (data?.data && data?.data !== "") {
              const [from, to] = data?.data?.split("/");
              const [fromdate, fromtime] = from?.split(" ");
              const [todate, totime] = to?.split(" ");
              return { fromdate, fromtime, todate, totime };
            }
          } else {
            return { fromdate: "0", fromtime: "0", todate: "0", totime: "0" };
          }
        })

        setDateValueMultiFrom(forDateSpan.map((item) => item?.fromdate))
        setDateValueMultiTo(forDateSpan.map((item) => item?.todate))

        setDateValueRandom(forFillDetails.map((item) => item?.date))
        setTimeValueRandom(forFillDetails.map((item) => item?.time))

        setDateValue(forDateTime.map((item) => item?.date))
        setTimeValue(forDateTime.map((item) => item?.time))

        setFirstDateValue(forDateMultiSpanTime.map((item) => item?.fromdate))
        setFirstTimeValue(forDateMultiSpanTime.map((item) => item?.fromtime))
        setSecondDateValue(forDateMultiSpanTime.map((item) => item?.todate))
        setSecondTimeValue(forDateMultiSpanTime.map((item) => item?.totime))

        setDisableInput(new Array(details?.groups?.length).fill(true))
      }
      else {
        setIsCheckList(false);
      }
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }

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
      setPopupContentMalert("Please Check All the Fields");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else {
      sendRequestCheckList();
    }
  }



  const sendRequestCheckList = async () => {
    setPageName(!pageName)
    let combinedGroups = groupDetails?.map((data) => {
      let check = (data.data !== undefined && data.data !== "") || data.files !== undefined;

      if (check) {
        return {
          ...data, completedby: completedbyName, completedat: new Date()
        }
      } else {
        return {
          ...data, completedby: "", completedat: ""
        }
      }

    })

    try {

      let assignbranches = await axios.put(
        `${SERVICE.MYCHECKLIST_SINGLE}/${assignDetails?._id}`,
        {
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
          status: "Completed",
          groups: combinedGroups,
          updatedby: [
            ...assignDetails?.updatedby,
            {
              name: String(isUserRoleAccess.companyname),
              date: String(new Date()),
            },
          ],
        }
      );
      handleCloseModEditCheckList()
      setIsCheckedListOverall(false);
      sendEditStatus();

    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
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
  };

  const [columnVisibilityTeamLveVerif, setColumnVisibilityTeamLveVerif] = useState(initialColumnVisibilityTeamLveVerif);

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // This is required for Chrome support
  };

  let dateselect = new Date();
  dateselect.setDate(dateselect.getDate() + 3);
  var ddt = String(dateselect.getDate()).padStart(2, "0");
  var mmt = String(dateselect.getMonth() + 1).padStart(2, "0");
  var yyyyt = dateselect.getFullYear();
  let formattedDatet = yyyyt + "-" + mmt + "-" + ddt;

  let datePresent = new Date();
  var ddp = String(datePresent.getDate());
  var mmp = String(datePresent.getMonth() + 1);
  var yyyyp = datePresent.getFullYear();
  let formattedDatePresent = yyyyp + "-" + mmp + "-" + ddp;

  const getinfoCodeStatus = async (e) => {
    setPageName(!pageName)
    try {
      let res = await axios.get(`${SERVICE.APPLYLEAVE_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setSelectStatus(res?.data?.sapplyleave);
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  const [selectedEmpData, setSelectedEmpData] = useState({});
  const [selectedEmpDataUpdate, setSelectedEmpDataUpdate] = useState({});
  const [historyOverAllData, setHistoryOverAllData] = useState([]);
  const [historyMonthData, setHistoryMonthData] = useState([]);
  const [historyOverAllDataUpdate, setHistoryOverAllDataUpdate] = useState([]);
  const [historyMonthDataUpdate, setHistoryMonthDataUpdate] = useState([]);

  const fetchLeaveHistoryUpdate = async (empid, empname) => {
    if ((selectStatus.status === "Reject Without Leave" || selectStatus.status === "Reject With Leave") && selectStatus.rejectedreason === "") {
      setPopupContentMalert("Please Enter Reason");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else {
      try {
        // Get the current month and year
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        let res_vendor = await axios.post(SERVICE.APPLYLEAVE_EMPLOYEEID_FILTER, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          employeeid: empid,
        });

        let uninformResult = res_vendor?.data?.applyleaves

        if (uninformResult?.length > 0) {

          // Filter for the current month's data
          const monthlyData = uninformResult.filter((item) => {
            return item.date.some((date) => {
              const leaveDate = new Date(date.split("/").reverse().join("-"));

              return (
                leaveDate.getMonth() + 1 === currentMonth &&
                leaveDate.getFullYear() === currentYear
              );
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
                };
              }

              // Count Approved, Applied, and Rejected statuses
              if (item.status === "Approved") {
                acc[key].approvedCount += 1;
              } else if (item.status === "Applied") {
                acc[key].appliedCount += 1;
              } else if (item.status === "Reject With Leave" || item.status === "Reject Without Leave") {
                acc[key].rejectedCount += 1;
              }
              setSelectedEmpDataUpdate({ employeename: item.employeename, employeeid: item.employeeid });

              return acc;
            }, {});
          };

          // Calculate leave counts for overall and monthly data
          const overallLeaveCounts = calculateLeaveCounts(uninformResult);
          const monthlyLeaveCounts = calculateLeaveCounts(monthlyData);

          // Transform the counts object into an array format
          const transformCounts = (counts) => Object.values(counts);

          setHistoryOverAllDataUpdate(transformCounts(overallLeaveCounts));
          setHistoryMonthDataUpdate(transformCounts(monthlyLeaveCounts));
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
  }

  //Project updateby edit page...
  let updatedByStatus = selectStatus.updatedby;

  //editing the single data...

  const sendEditStatus = async () => {
    setPageName(!pageName)
    try {
      let res = await axios.put(
        `${SERVICE.APPLYLEAVE_SINGLE}/${selectStatus._id}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          status: String(selectStatus.status),
          rejectedreason: String(
            selectStatus.status === "Reject With Leave" || selectStatus.status === "Reject Without Leave" ? selectStatus.rejectedreason : ""
          ),
          actionby: String(isUserRoleAccess.companyname),
          updatedby: [
            ...updatedByStatus,
            {
              name: String(isUserRoleAccess.companyname),
              date: String(new Date()),
            },
          ],
        }
      );
      setUpdated(selectStatus._id)
      // await fetchApplyleave();
      handleStatusClose();
      setPopupContent("Updated Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  const editStatus = () => {
    handleCloseModHistoryUpdate();
    if (selectStatus.status === "Reject With Leave" || selectStatus.status === "Reject Without Leave") {
      if (selectStatus.rejectedreason == "") {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{"Please Enter Reject Reason"}</p>
          </>
        );
        handleClickOpenerr();
      } else {
        sendEditStatus();
      }
    }
    else if (selectStatus.status == "Approved") {
      if (isCheckList) {
        handleClickOpenEditCheckList();
      } else {
        setPopupContentMalert(<>
          Please Fill the Checklist. Click this link:{" "}
          <a href="/interview/myinterviewchecklist" target="_blank" rel="noopener noreferrer">
            My Checklist
          </a>
        </>);
        setPopupSeverityMalert("warning");
        handleClickOpenPopupMalert();
      }

    }
    else {
      sendEditStatus();
    }
  };
  //get all Sub vendormasters.


  //get all Sub vendormasters.
  const fetchApplyleave = async (data) => {
    setApplyleavecheck(false);
    setPageName(!pageName)
    try {
      if (data?.length > 0) {
        setApplyleavecheck(true);
        let answer = data?.length > 0 ? data : [];
        setApplyleaves(answer);
        setTotalPagesTeamLveVerif(Math.ceil(answer.length / pageSizeTeamLveVerif));
        setIsApplyLeave([]);
      }
      else {
        setApplyleaves([]);
        setTotalPagesTeamLveVerif(1);
        setApplyleavecheck(true);
      }

    } catch (err) { setApplyleavecheck(true); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };

  useEffect(() => {
    fetchApplyleave(data);
  }, [data]);


  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
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
      numberofdays: item.numberofdays === "" ? "---" : item.numberofdays,
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
        buttons: ["apply", "reset", "cancel"],
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
      pageNumbers.push("...");
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
  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) { pageNumbers.push(i); }

  const columnDataTableTeamLveVerif = [
    {
      field: "serialNumber",
      headerName: "SNo",
      flex: 0,
      width: 80,
      hide: !columnVisibilityTeamLveVerif.serialNumber,
      headerClassName: "bold-header", pinned: 'left', lockPinned: true,
    },
    {
      field: "employeeid",
      headerName: "Employee Id",
      flex: 0,
      width: 150,
      hide: !columnVisibilityTeamLveVerif.employeeid,
      headerClassName: "bold-header", pinned: 'left', lockPinned: true,
    },
    {
      field: "employeename",
      headerName: "Employee Name",
      flex: 0,
      width: 270,
      hide: !columnVisibilityTeamLveVerif.employeename,
      headerClassName: "bold-header", pinned: 'left', lockPinned: true,
    },
    {
      field: "leavetype",
      headerName: "Leave Type",
      flex: 0,
      width: 170,
      hide: !columnVisibilityTeamLveVerif.leavetype,
      headerClassName: "bold-header",
    },
    {
      field: "date",
      headerName: "Date",
      flex: 0,
      width: 120,
      hide: !columnVisibilityTeamLveVerif.date,
      headerClassName: "bold-header",
    },
    {
      field: "numberofdays",
      headerName: "Number of Days",
      flex: 0,
      width: 170,
      hide: !columnVisibilityTeamLveVerif.numberofdays,
      headerClassName: "bold-header",
    },
    {
      field: "reasonforleave",
      headerName: "Reason for Leave",
      flex: 0,
      width: 250,
      hide: !columnVisibilityTeamLveVerif.reasonforleave,
      headerClassName: "bold-header",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0,
      width: 150,
      hide: !columnVisibilityTeamLveVerif.status,
      headerClassName: "bold-header",
      cellRenderer: (params) => {
        if (
          !(
            isUserRoleAccess?.role?.includes("Manager") ||
            isUserRoleAccess?.role?.includes("HiringManager") ||
            isUserRoleAccess?.role?.includes("HR") ||
            isUserRoleAccess?.role?.includes("Superadmin")
          ) &&
          !["Approved"].includes(params.data.status)
        ) {
          return (
            <Grid sx={{ display: 'flex' }}>
              <Button
                variant="contained"
                style={{
                  margin: '5px',
                  backgroundColor:
                    params.value === "Applied"
                      ? "#FFC300"
                      : params.value === "Approved"
                        ? "green"
                        : "inherit",
                  color:
                    params.value === "Applied"
                      ? "black"
                      : "white",
                  fontSize: "10px",
                  width: "60px",
                  fontWeight: "bold",
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
                  backgroundColor:
                    params.value === "Applied"
                      ? "#FFC300"
                      : params.value === "Approved"
                        ? "green"
                        : "inherit",
                  color:
                    params.value === "Applied"
                      ? "black"
                      : "white",
                  fontSize: "10px",
                  width: "60px",
                  fontWeight: "bold",
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
      field: "actions",
      headerName: "Action",
      flex: 0,
      width: 100,
      minHeight: "40px !important",
      filter: false,
      sortable: false,
      hide: !columnVisibilityTeamLveVerif.actions,
      headerClassName: "bold-header",
      cellRenderer: (params) => (
        <Grid sx={{ display: "flex" }}>
          {isUserRoleCompare?.includes("iteamleaveverification") && (
            <Button
              variant="contained"
              style={{
                margin: '5px',
                backgroundColor: "red",
                minWidth: "15px",
                padding: "6px 5px",
              }}
              onClick={(e) => {
                getinfoCodeStatus(params.data.id);
                // handleStatusOpen();
                getCodeNew(params.data);
              }}
            >
              <FaEdit style={{ color: "white", fontSize: "17px" }} />
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

  const applyNormalFilter = (searchValue) => {

    // Split the search query into individual terms
    const searchTerms = searchValue.toLowerCase().split(" ");

    // Modify the filtering logic to check each term
    const filtered = items?.filter((item) => {
      return searchTerms.every((term) =>
        Object.values(item).join(" ").toLowerCase().includes(term)
      );
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
    // handleCloseSearchTeamLveVerif(); 
  };

  // Undo filter funtion
  const handleResetSearch = () => {
    setAdvancedFilter(null);
    setSearchQueryTeamLveVerif("");
    setFilteredDataItems(applyleaves);
  };

  // Show filtered combination in the search bar
  const getSearchDisplay = () => {
    if (advancedFilter && advancedFilter.length > 0) {
      return advancedFilter.map((filter, index) => {
        let showname = columnDataTableTeamLveVerif.find(col => col.field === filter.column)?.headerName;
        return `${showname} ${filter.condition} "${filter.value}"`;
      }).join(' ' + (advancedFilter.length > 1 ? advancedFilter[1].condition : '') + ' ');
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
  const filteredColumns = columnDataTableTeamLveVerif.filter((column) =>
    column.headerName.toLowerCase().includes(searchQueryManageTeamLveVerif.toLowerCase())
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

  const handleColumnMoved = useCallback(debounce((event) => {
    if (!event.columnApi) return;

    const visible_columns = event.columnApi.getAllColumns().filter(col => {
      const colState = event.columnApi.getColumnState().find(state => state.colId === col.colId);
      return colState && !colState.hide;
    }).map(col => col.colId);

    setColumnVisibilityTeamLveVerif((prevVisibility) => {
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
    setColumnVisibilityTeamLveVerif((prevVisibility) => ({
      ...prevVisibility,
      [colId]: event.visible, // Set visibility directly from the event
    }));
  }, []);

  // Excel
  const [fileFormat, setFormat] = useState('');
  let exportColumnNamescrt = ["Employee Id", "Employee Name", "Leavetype", "Date", "Number of Days", "Reason for leave",]
  let exportRowValuescrt = ["employeeid", "employeename", "leavetype", "date", "numberofdays", "reasonforleave",]

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Completed Team Leave Verification",
    pageStyle: "print",
  });


  // image
  const handleCaptureImage = () => {
    if (gridRefImageTeamLveVerif.current) {
      domtoimage.toBlob(gridRefImageTeamLveVerif.current)
        .then((blob) => {
          saveAs(blob, "Completed Team Leave Verification.png");
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };

  return (
    <Box>
      <Headtitle title={"TEAM LEAVE VERIFICATION"} />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes("lteamleaveverification") && (
        <>
          {/* ******************************************************EXPORT Buttons****************************************************** */}
          <Grid item xs={8}>
            <Typography sx={userStyle.importheadtext}>
              Completed Team Leave Verification List
            </Typography>
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
                  sx={{ width: "77px" }}
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
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box>
                {isUserRoleCompare?.includes(
                  "excelteamleaveverification"
                ) && (
                    <>
                      <Button onClick={(e) => {
                        setIsFilterOpen(true)
                        setFormat("xl")
                      }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                    </>
                  )}
                {isUserRoleCompare?.includes("csvteamleaveverification") && (
                  <>
                    <Button onClick={(e) => {
                      setIsFilterOpen(true)
                      setFormat("csv")
                    }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>
                  </>
                )}
                {isUserRoleCompare?.includes(
                  "printteamleaveverification"
                ) && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                {isUserRoleCompare?.includes("pdfteamleaveverification") && (
                  <>
                    <Button sx={userStyle.buttongrp}
                      onClick={() => {
                        setIsPdfFilterOpen(true)
                      }}
                    ><FaFilePdf />&ensp;Export to PDF&ensp;</Button>
                  </>
                )}
                {isUserRoleCompare?.includes(
                  "imageteamleaveverification"
                ) && (
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
                          <IoMdOptions style={{ cursor: 'pointer', }} onClick={handleClickSearchTeamLveVerif} />
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
          </Grid>  <br />
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
          </Grid>
          {!applyleaveCheck ? (
            <>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
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
            </>
          ) : (
            <>
              <Box sx={{ width: "100%", }} className={"ag-theme-quartz"} ref={gridRefImageTeamLveVerif} >
                <AgGridReact
                  rowData={filteredDataItems}
                  columnDefs={columnDataTableTeamLveVerif.filter((column) => columnVisibilityTeamLveVerif[column.field])}
                  ref={gridRefTableTeamLveVerif}
                  defaultColDef={defaultColDef}
                  domLayout={"autoHeight"}
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
                  colResizeDefault={"shift"}
                  cellSelection={true}
                  copyHeadersToClipboard={true}
                />
              </Box>
            </>
          )}

        </>
      )}

      {/* Manage Column */}
      <Popover
        id={idTeamLveVerif}
        open={isManageColumnsOpenTeamLveVerif}
        anchorEl={anchorElTeamLveVerif}
        onClose={handleCloseManageColumnsTeamLveVerif}
        anchorOrigin={{ vertical: "bottom", horizontal: "left", }}
      >
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
      <Popover
        id={idSearchTeamLveVerif}
        open={openSearchTeamLveVerif}
        anchorEl={anchorElSearchTeamLveVerif}
        onClose={handleCloseSearchTeamLveVerif}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }}
      >
        <AdvancedSearchBar columns={columnDataTableTeamLveVerif?.filter(data => data.field && data.field !== 'actions')} onSearch={applyAdvancedFilter} initialSearchValue={searchQueryTeamLveVerif} handleCloseSearch={handleCloseSearchTeamLveVerif} />
      </Popover>

      {/* dialog status change */}
      <Box>
        <Dialog
          maxWidth="lg"
          open={statusOpen}
          onClose={handleStatusClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent
            sx={{
              width: "600px",
              height: "300px",
              overflow: "visible",
              "& .MuiPaper-root": {
                overflow: "visible",
              },
            }}
          >
            <Grid container spacing={2}>
              <Grid item md={12} xs={12} sm={12}>
                <Typography sx={userStyle.HeaderText}>
                  Edit Apply Status
                </Typography>
              </Grid>
              <Grid item md={6} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Status<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <Selects
                    fullWidth
                    options={[
                      { label: "Approved", value: "Approved" },
                      { label: "Reject With Leave", value: "Reject With Leave" },
                      { label: "Reject Without Leave", value: "Reject Without Leave" },
                      { label: "Applied", value: "Applied" },
                      { label: "Cancel", value: "Cancel" },
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
                {(selectStatus.status == "Reject With Leave" || selectStatus.status == "Reject Without Leave") ? (
                  <FormControl fullWidth size="small">
                    <Typography>
                      Reason for Rejected<b style={{ color: "red" }}>*</b>
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
          <br />
          <DialogActions>
            <Button
              variant="contained"
              sx={buttonStyles.buttonsubmit}
              onClick={() => fetchLeaveHistoryUpdate(selectStatus.employeeid, selectStatus.employeename)}
            >
              Update
            </Button>
            <Button

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
        <Dialog open={isEditOpenCheckList} onClose={handleCloseModEditCheckList} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="xl" fullWidth={true} sx={{
          overflow: 'visible',
          '& .MuiPaper-root': {
            overflow: 'auto',
          },
          marginTop: '50px'
        }}>
          <Box sx={{ padding: "20px 50px" }}>
            <>
              <Typography sx={userStyle.SubHeaderText} >
                My Check List
              </Typography>
              <br />
              <br />
              <Grid container spacing={2} >
                <Grid item md={12} xs={12} sm={12} >
                  <FormControl fullWidth size="small" sx={{ display: 'flex', justifyContent: 'center', border: '1px solid black', borderRadius: '20px' }} >
                    <Typography sx={{ fontSize: '1rem', textAlign: 'center' }}>
                      Employee Name: <span style={{ fontWeight: '500', fontSize: '1.2rem', display: 'inline-block', textAlign: 'center' }}> {`${getDetails?.employeename}`}</span>
                    </Typography>
                  </FormControl>
                </Grid>
              </Grid>
              <br />
              <TableContainer component={Paper}>
                <Table>
                  <TableHead >
                    <TableRow>

                      <TableCell style={{ fontSize: '1.2rem' }}>
                        <Checkbox onChange={() => { overallCheckListChange() }} checked={isCheckedListOverall} />
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
                          <Checkbox onChange={() => { handleCheckboxChange(index) }} checked={isCheckedList[index]} />
                        </TableCell>

                        <TableCell>{row.details}</TableCell>
                        {
                          (() => {
                            switch (row.checklist) {
                              case "Text Box":

                                return <TableCell>
                                  <OutlinedInput
                                    style={{ height: '32px' }}
                                    value={row.data}
                                    // disabled={disableInput[index]}
                                    onChange={(e) => {
                                      handleDataChange(e, index, "Text Box")
                                    }}
                                  />
                                </TableCell>;
                              case "Text Box-number":
                                return <TableCell>
                                  <OutlinedInput value={row.data}
                                    style={{ height: '32px' }}
                                    type="text"
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      if (/^[0-9]*$/.test(inputValue)) {
                                        handleDataChange(e, index, "Text Box-number")
                                      }

                                    }}
                                  />
                                </TableCell>;
                              case "Text Box-alpha":
                                return <TableCell>
                                  <OutlinedInput
                                    style={{ height: '32px' }}
                                    value={row.data}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      if (/^[a-zA-Z]*$/.test(inputValue)) {
                                        handleDataChange(e, index, "Text Box-alpha")
                                      }
                                    }}

                                  />
                                </TableCell>;
                              case "Text Box-alphanumeric":
                                return <TableCell>
                                  <OutlinedInput
                                    style={{ height: '32px' }}
                                    value={row.data}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      if (/^[a-zA-Z0-9]*$/.test(inputValue)) {
                                        handleDataChange(e, index, "Text Box-alphanumeric")
                                      }
                                    }}
                                    inputProps={{ pattern: '[A-Za-z0-9]*' }}
                                  />
                                </TableCell>;
                              case "Attachments":
                                return <TableCell>
                                  <div>
                                    <InputLabel sx={{ m: 1 }}>File</InputLabel>


                                    <div>

                                      <Box
                                        sx={{ display: "flex", marginTop: "10px", gap: "10px" }}
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
                                          <Button
                                            onClick={showWebcam}
                                            variant="contained"
                                            sx={userStyle.uploadbtn}
                                          >
                                            <CameraAltIcon />
                                          </Button>
                                        </Box>
                                        {row.files && <Grid container spacing={2}>
                                          <Grid item lg={8} md={8} sm={8} xs={8}>
                                            <Typography>{row.files.name}</Typography>
                                          </Grid>
                                          <Grid item lg={1.5} md={1} sm={1} xs={1} sx={{ cursor: 'pointer' }} onClick={() => renderFilePreviewEdit(row.files)}>
                                            <VisibilityOutlinedIcon
                                              style={{
                                                fontsize: "large",
                                                color: "#357AE8",
                                                cursor: "pointer",
                                              }}
                                              onClick={() => renderFilePreviewEdit(row.files)}
                                            />
                                          </Grid>
                                          <Grid item lg={1} md={1} sm={1} xs={1}>
                                            <Button
                                              style={{
                                                fontsize: "large",
                                                color: "#357AE8",
                                                cursor: "pointer",
                                                marginTop: "-5px",
                                              }}
                                              onClick={() => handleFileDeleteEdit(index)}
                                            >
                                              <DeleteIcon />
                                            </Button>
                                          </Grid>
                                        </Grid>}

                                      </Box>

                                    </div>
                                    <Dialog
                                      open={isWebcamOpen}
                                      onClose={webcamClose}
                                      aria-labelledby="alert-dialog-title"
                                      aria-describedby="alert-dialog-description"
                                    >
                                      <DialogContent sx={{ textAlign: "center", alignItems: "center" }}>
                                        <Webcamimage
                                          getImg={getImg}
                                          setGetImg={setGetImg}
                                          capturedImages={capturedImages}
                                          valNum={valNum}
                                          setValNum={setValNum}
                                          name={name}
                                        />
                                      </DialogContent>
                                      <DialogActions>
                                        <Button
                                          variant="contained"
                                          color="success"
                                          onClick={webcamDataStore}
                                        >
                                          OK
                                        </Button>
                                        <Button variant="contained" color="error" onClick={webcamClose}>
                                          CANCEL
                                        </Button>
                                      </DialogActions>
                                    </Dialog>

                                  </div>


                                </TableCell>;
                              case "Pre-Value":
                                return <TableCell><Typography>{row?.data}</Typography>
                                </TableCell>;
                              case "Date":
                                return <TableCell>
                                  <OutlinedInput
                                    style={{ height: '32px' }}
                                    type='date'
                                    value={row.data}
                                    onChange={(e) => {

                                      handleDataChange(e, index, "Date")

                                    }}
                                  />
                                </TableCell>;
                              case "Time":
                                return <TableCell>
                                  <OutlinedInput
                                    style={{ height: '32px' }}
                                    type='time'
                                    value={row.data}
                                    onChange={(e) => {

                                      handleDataChange(e, index, "Time")

                                    }}
                                  />
                                </TableCell>;
                              case "DateTime":
                                return <TableCell>
                                  <Stack direction="row" spacing={2}>
                                    <OutlinedInput
                                      style={{ height: '32px' }}
                                      type='date'
                                      value={dateValue[index]}
                                      onChange={(e) => {
                                        updateDateValuesAtIndex(e.target.value, index)


                                      }}
                                    />
                                    <OutlinedInput
                                      type='time'
                                      style={{ height: '32px' }}
                                      value={timeValue[index]}
                                      onChange={(e) => {
                                        updateTimeValuesAtIndex(e.target.value, index);

                                      }}
                                    />
                                  </Stack>
                                </TableCell>;
                              case "Date Multi Span":
                                return <TableCell>
                                  <Stack direction="row" spacing={2}>
                                    <OutlinedInput
                                      style={{ height: '32px' }}
                                      type='date'
                                      value={dateValueMultiFrom[index]}
                                      onChange={(e) => {
                                        updateFromDateValueAtIndex(e.target.value, index)


                                      }}
                                    />
                                    <OutlinedInput
                                      type='date'
                                      style={{ height: '32px' }}
                                      value={dateValueMultiTo[index]}
                                      onChange={(e) => {
                                        updateToDateValueAtIndex(e.target.value, index)


                                      }}
                                    />
                                  </Stack>
                                </TableCell>;
                              case "Date Multi Span Time":
                                return <TableCell>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <Stack direction="row" spacing={2}>
                                      <OutlinedInput
                                        style={{ height: '32px' }}
                                        type='date'
                                        value={firstDateValue[index]}
                                        onChange={(e) => {
                                          updateFirstDateValuesAtIndex(e.target.value, index)


                                        }}
                                      />
                                      <OutlinedInput
                                        type='time'
                                        style={{ height: '32px' }}
                                        value={firstTimeValue[index]}
                                        onChange={(e) => {
                                          updateFirstTimeValuesAtIndex(e.target.value, index);


                                        }}
                                      />
                                    </Stack>
                                    <Stack direction="row" spacing={2}>

                                      <OutlinedInput
                                        type='date'
                                        style={{ height: '32px' }}
                                        value={secondDateValue[index]}
                                        onChange={(e) => {
                                          updateSecondDateValuesAtIndex(e.target.value, index)


                                        }}
                                      />
                                      <OutlinedInput
                                        style={{ height: '32px' }}
                                        type='time'
                                        value={secondTimeValue[index]}
                                        onChange={(e) => {
                                          updateSecondTimeValuesAtIndex(e.target.value, index);


                                        }}
                                      />
                                    </Stack>
                                  </div>

                                </TableCell>;
                              case "Date Multi Random":
                                return <TableCell>
                                  <OutlinedInput
                                    style={{ height: '32px' }}
                                    type='date'
                                    value={row.data}
                                    onChange={(e) => {

                                      handleDataChange(e, index, "Date Multi Random")

                                    }}
                                  />
                                </TableCell>;
                              case "Date Multi Random Time":
                                return <TableCell>
                                  <Stack direction="row" spacing={2}>
                                    <OutlinedInput
                                      style={{ height: '32px' }}
                                      type='date'
                                      value={dateValueRandom[index]}
                                      onChange={(e) => {
                                        updateDateValueAtIndex(e.target.value, index)


                                      }}
                                    />
                                    <OutlinedInput
                                      type='time'
                                      style={{ height: '32px' }}
                                      value={timeValueRandom[index]}
                                      onChange={(e) => {
                                        updateTimeValueAtIndex(e.target.value, index);


                                      }}
                                    />
                                  </Stack>
                                </TableCell>;
                              case "Radio":
                                return <TableCell>
                                  <FormControl component="fieldset">
                                    <RadioGroup value={row.data} sx={{ display: 'flex', flexDirection: 'row !important' }} onChange={(e) => {
                                      handleDataChange(e, index, "Radio")
                                    }}>
                                      <FormControlLabel value="No" control={<Radio />} label="No" />
                                      <FormControlLabel value="Yes" control={<Radio />} label="Yes" />

                                    </RadioGroup>
                                  </FormControl>
                                </TableCell>;

                              default:
                                return <TableCell></TableCell>; // Default case
                            }
                          })()
                        }
                        <TableCell>
                          <Typography>{row?.completedby}</Typography>
                        </TableCell>
                        <TableCell>{row.completedat && moment(row.completedat).format("DD-MM-YYYY hh:mm:ss A")}</TableCell>
                        <TableCell>
                          {row.checklist === "DateTime" ?
                            (((row.data !== undefined && row.data !== "") || (row.files !== undefined)) && row.data.length === 16) ?
                              <Typography>Completed</Typography>
                              : <Typography>Pending</Typography>
                            : row.checklist === "Date Multi Span" ?
                              (((row.data !== undefined && row.data !== "") || (row.files !== undefined)) && row.data.length === 21) ?
                                <Typography>Completed</Typography>
                                : <Typography>Pending</Typography>
                              : row.checklist === "Date Multi Span Time" ?
                                (((row.data !== undefined && row.data !== "") || (row.files !== undefined)) && row.data.length === 33) ?
                                  <Typography>Completed</Typography>
                                  : <Typography>Pending</Typography>
                                : row.checklist === "Date Multi Random Time" ?
                                  (((row.data !== undefined && row.data !== "") || (row.files !== undefined)) && row.data.length === 16) ?
                                    <Typography>Completed</Typography>
                                    : <Typography>Pending</Typography>
                                  : ((row.data !== undefined && row.data !== "") || (row.files !== undefined)) ?
                                    <Typography>Completed</Typography>
                                    : <Typography>Pending</Typography>
                          }
                        </TableCell>

                        <TableCell>
                          {row.checklist === "DateTime" ?
                            (((row.data !== undefined && row.data !== "") || (row.files !== undefined)) && row.data.length === 16) ?
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
                              : <IconButton
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
                            : row.checklist === "Date Multi Span" ?
                              (((row.data !== undefined && row.data !== "") || (row.files !== undefined)) && row.data.length === 21) ?
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
                                : <IconButton
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
                              : row.checklist === "Date Multi Span Time" ?
                                (((row.data !== undefined && row.data !== "") || (row.files !== undefined)) && row.data.length === 33) ?
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
                                  : <IconButton
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
                                : row.checklist === "Date Multi Random Time" ?
                                  (((row.data !== undefined && row.data !== "") || (row.files !== undefined)) && row.data.length === 16) ?
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
                                    : <IconButton
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
                                  : ((row.data !== undefined && row.data !== "") || (row.files !== undefined)) ?
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
                                    : <IconButton
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
                          }
                        </TableCell>
                        <TableCell><span>
                          {row?.employee && row?.employee?.map((data, index) => (
                            <Typography key={index} variant="body1">{`${index + 1}.${data}, `}</Typography>
                          ))}
                        </span></TableCell>
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
      <Dialog
        open={isOpenHistoryUpdate}
        onClose={handleCloseModHistoryUpdate}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        fullWidth={true}
        sx={{ marginTop: "95px", }}
      >
        <Box sx={{ padding: "20px 50px" }}>
          <>
            <Typography sx={userStyle.HeaderText}>Employee Leave History</Typography><br /><br />
            <Grid container spacing={2}>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">
                    Employee Name:&ensp;
                    <span
                      style={{
                        fontWeight: "500",
                        fontSize: "1.2rem",
                        display: "inline-block",
                      }}
                    >{selectedEmpDataUpdate?.employeename}
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
                        fontWeight: "500",
                        fontSize: "1.2rem",
                        display: "inline-block",
                      }}
                    >{selectedEmpDataUpdate?.employeeid}
                    </span>
                  </Typography>
                </FormControl>
              </Grid>
            </Grid><br />
            <Grid container spacing={2}>
              <Grid item md={12} xs={12} sm={12}>
                <Typography sx={userStyle.HeaderText}>Overall</Typography><br />
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><b>Leave Type</b></TableCell>
                        <TableCell><b>Applied Count</b></TableCell>
                        <TableCell><b>Approved Count</b></TableCell>
                        <TableCell><b>Rejected Count</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyOverAllDataUpdate.length > 0 ? (
                        historyOverAllDataUpdate.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row?.leavetype}</TableCell>
                            <TableCell>{row?.appliedCount}</TableCell>
                            <TableCell>{row?.approvedCount}</TableCell>
                            <TableCell>{row?.rejectedCount}</TableCell>
                          </TableRow>
                        ))) : <TableRow><TableCell colSpan={4} align="center">No Data Available</TableCell> </TableRow>}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid><br />
            <Grid container spacing={2}>
              <Grid item md={12} xs={12} sm={12}>
                <Typography sx={userStyle.HeaderText}>Month</Typography><br />
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><b>Leave Type</b></TableCell>
                        <TableCell><b>Applied Count</b></TableCell>
                        <TableCell><b>Approved Count</b></TableCell>
                        <TableCell><b>Rejected Count</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyMonthDataUpdate.length > 0 ? (
                        historyMonthDataUpdate.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row?.leavetype}</TableCell>
                            <TableCell>{row?.appliedCount}</TableCell>
                            <TableCell>{row?.approvedCount}</TableCell>
                            <TableCell>{row?.rejectedCount}</TableCell>
                          </TableRow>
                        ))) : <TableRow><TableCell colSpan={4} align="center">No Data Available</TableCell> </TableRow>}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid><br />
            <Grid container spacing={2}>
              <Grid item md={1} sm={1}>
                <Button sx={buttonStyles.buttonsubmit} onClick={editStatus}>Ok</Button>
              </Grid>
              <Grid item md={1} sm={1}>
                <Button sx={buttonStyles.btncancel} onClick={handleCloseModHistoryUpdate}>Cancel</Button>
              </Grid>
            </Grid>
          </>
        </Box>
      </Dialog>

      {/* ALERT DIALOG */}
      <Box>
        <Dialog
          open={isErrorOpen}
          onClose={handleCloseerr}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent sx={{ width: "350px", textAlign: "center", alignItems: "center" }}          >
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

      <CustomApprovalDialog
        open={dialogOpen}
        handleClose={handleCloseDialog}
        eligibleUsers={eligibleUsers}
        eligibleUsersLevel={eligibleUsersLevel}
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
        itemsTwo={items ?? []}
        filename={"Completed Team Leave Verification"}
        exportColumnNames={exportColumnNamescrt}
        exportRowValues={exportRowValuescrt}
        componentRef={componentRef}
      />
    </Box>
  );
}

export default CompletedTeamLeaveVerification;