import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Box,
  Tooltip,
  Typography,
  DialogTitle,
  OutlinedInput,
  InputLabel,
  Dialog,
  DialogContent,
  FormGroup,
  Select,
  TableCell,
  TableRow,
  DialogActions,
  FormControl,
  Grid,
  TextareaAutosize,
  Paper,
  Table,
  TableHead,
  TableContainer,
  Button,
  TableBody,
  MenuItem,
  TextField,
  IconButton,
  Modal,
} from '@mui/material';
import { userStyle } from '../../../../pageStyle';
import { handleApiError } from '../../../../components/Errorhandling';
import CloseIcon from '@mui/icons-material/Close';
import { StyledTableRow, StyledTableCell } from '../../../../components/Table';
import { menuItems } from '../../../../components/menuItemsList';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { SERVICE } from '../../../../services/Baseservice';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LoadingButton from '@mui/lab/LoadingButton';
import ExistingProfileVisitor from '../../../interactors/visitors/ExistingProfileVisitor';
import moment from 'moment-timezone';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
// import axios from "axios";
import axios from '../../../../axiosInstance';
import Selects from 'react-select';
import { AiOutlineClose } from 'react-icons/ai';
import { FaPlus, FaEdit } from 'react-icons/fa';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import 'jspdf-autotable';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as XLSX from 'xlsx';
import { Country, State, City } from 'country-state-city';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import 'react-image-crop/dist/ReactCrop.css';
import '../MultistepForm.css';
import { FaArrowAltCircleRight } from 'react-icons/fa';
import { UserRoleAccessContext, AuthContext } from '../../../../context/Appcontext';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import Headtitle from '../../../../components/Headtitle';
import { MultiSelect } from 'react-multi-select-component';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Backdrop } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import AlertDialog from '../../../../components/Alert';
import MessageAlert from '../../../../components/MessageAlert';
import * as faceapi from 'face-api.js';
import Webcamimage from '../../../../components/webCamWithDuplicate';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import { ConfirmationPopup, DeleteConfirmation } from '../../../../components/DeleteConfirmation';
import FullAddressCard from '../../../../components/FullAddressCard.js';
import PincodeButton from '../../../../components/PincodeButton.js';
import { getPincodeDetails } from '../../../../components/getPincodeDetails';
import uploadEmployeeDocuments from '../../../../components/CommonMulterFunction.js';
import { AUTH } from '../../../../services/Authservice';
import { accounttypes } from '../../../../components/Componentkeyword';

import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import DocumentScannerComponent from '../../recruitment/DocumentScannerComponent.js';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { BASE_URL } from '../../../../services/Authservice';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import TodosAccordionEdit from '../../recruitment/TodosAccordionEdit.js';
import { religionOptions, address_type, permanent_address_type, personal_prefix, landmark_and_positional_prefix, candidate_educational_upload_status, experience_document_type } from '../../../../components/Componentkeyword';
import salaryTableFunction from '../../../../components/SalaryTableFunction.js';
// const { generatePassword,validatePassword } = require("../../../components/passwordGenerator");
import { validatePassword } from '../../../../components/passwordGenerator';
import SalaryTable from '../../recruitment/SalaryTable.js';

function calculateLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Calculate luminance using the formula
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // If luminance is greater than 128, it's a light color
  return luminance > 128;
}
function MultistepForm() {
  const [salaryTableDataManual, setSalaryTableDataManual] = useState({
    salaryfixed: false,
    salarystatus: 'With Salary',
    expectedsalary: '',
    basic: 0,
    hra: 0,
    conveyance: 0,
    medicalallowance: 0,
    productionallowance: 0,
    otherallowance: 0,
    performanceincentive: 0,
    shiftallowance: 0,
    grossmonthsalary: 0,
    annualgrossctc: 0,
  });
  const [tableImage, setTableImage] = useState(null);
  const [tableImageManual, setTableImageManual] = useState(null);
  const [salaryTableData, setSalaryTableData] = useState({
    salaryfixed: false,
    salarystatus: 'With Salary',
    expectedsalary: '',
    basic: 0,
    hra: 0,
    conveyance: 0,
    medicalallowance: 0,
    productionallowance: 0,
    otherallowance: 0,
    performanceincentive: 0,
    shiftallowance: 0,
    grossmonthsalary: 0,
    annualgrossctc: 0,
  });
  const backPage = useNavigate();
  const [popup, setPopup] = useState({
    open: false,
    action: '',
  });
  const { id: newId } = useParams();
  const id = useParams().id;
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');

  const [workStationOpt, setWorkStationOpt] = useState([]);
  const [filteredWorkStation, setFilteredWorkStation] = useState([]);
  const [primaryWorkStation, setPrimaryWorkStation] = useState('Please Select Primary Work Station');
  const [primaryWorkStationLabel, setPrimaryWorkStationLabel] = useState('Please Select Primary Work Station');
  const [workstationTodoList, setWorkstationTodoList] = useState([]);
  const [keyPrimaryShortname, setPrimaryKeyShortname] = useState('');
  const [keyShortname, setKeyShortname] = useState('');
  const [selectedOptionsWorkStation, setSelectedOptionsWorkStation] = useState([]);
  const [allWorkStationOpt, setAllWorkStationOpt] = useState([]);

  const [enableWorkstation, setEnableWorkstation] = useState(false);
  const [enableLoginName, setEnableLoginName] = useState(true);
  const [valueWorkStation, setValueWorkStation] = useState([]);
  const [empcodelimitedAll, setEmpCodeLimitedAll] = useState([]);
  const [employeecodenew, setEmployeecodenew] = useState('');
  const [checkcode, setCheckcode] = useState(false);
  const [maxSelections, setMaxSelections] = useState(0);
  const [maxWfhSelections, setWfhSelections] = useState(0);

  const handleOpenConfirmationPopup = (action) => {
    setPopup({
      open: true,
      action,
    });
  };

  const handleCloseConfirmationPopup = () => {
    setPopup({ open: false, action: '' });
  };

  const handleConfirm = (e) => {
    handleCloseConfirmationPopup();
    if (popup.action === 'submit1') {
      console.log('Submitting...');
      draftduplicateCheck(e, 'submit');
    } else if (popup.action === 'submit2') {
      console.log('Submitting...');
      handleButtonClickLog(e);
    } else if (['submit3', 'submit4', 'submit5', 'submit6', 'submit7', 'submit8'].includes(popup.action)) {
      console.log('Submitting...');
      handleButtonClick(e);
    } else if (popup.action === 'draft') {
      console.log('Saving as draft...');
      // handleDraftSubmit(e);
    } else if (popup.action === 'cancel') {
      console.log('Cancelling...');
      backPage('/enquirypurposelist');
    }
  };
  // const handleConfirm = (e) => {
  //   handleCloseConfirmationPopup();
  //   if (popup.action === "submit1") {
  //     console.log("Submitting...");
  //     draftduplicateCheck(e, "submit");
  //   } else if (popup.action === "submit2") {
  //     console.log("Submitting...");
  //     handleButtonClickLog(e);
  //   } else if (
  //     [
  //       "submit2",
  //       "sumbit3",
  //       "sumbit4",
  //       "sumbit5",
  //       "sumbit6",
  //       "sumbit7",
  //     ].includes(popup.action)
  //   ) {
  //     console.log("Submitting...");
  //     handleButtonClick(e);
  //   } else if (popup.action === "draft") {
  //     console.log("Saving as draft...");
  //     // handleDraftSubmit(e);
  //   } else if (popup.action === "cancel") {
  //     console.log("Cancelling...");
  //     backPage("/internlist");
  //   }
  // };
  const [oldUserCompanyname, setOldUserCompanyname] = useState('');
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState('');
  const [popupSeverityMalert, setPopupSeverityMalert] = useState('');
  const handleClickOpenPopupMalert = () => {
    // setUpdateLoader(false);
    setOpenPopupMalert(true);
  };
  const handleClosePopupMalert = () => {
    // setUpdateLoader(false);
    setOpenPopupMalert(false);
  };
  const [openPopup, setOpenPopup] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [popupSeverity, setPopupSeverity] = useState('');
  const handleClickOpenPopup = () => {
    // setUpdateLoader(false);
    setOpenPopup(true);
  };
  const handleClosePopup = () => {
    // setUpdateLoader(false);
    setOpenPopup(false);
  };

  const currentYear = new Date().getFullYear();
  const maxDate = `${currentYear - 16}-12-31`;

  const [step, setStep] = useState(1);
  const [newstate, setnewstate] = useState(false);

  const [loading, setLoading] = useState(false);
  const timer = useRef();

  const [categorys, setCategorys] = useState([]);
  const [subcategorys, setSubcategorys] = useState([]);
  const [educationsOpt, setEducationsOpt] = useState([]);

  const [overallgrosstotal, setoverallgrosstotal] = useState('');
  const [modeexperience, setModeexperience] = useState('');
  const [targetexperience, setTargetexperience] = useState('');
  const [targetpts, setTargetpts] = useState('');
  const [overllsettings, setOverallsettings] = useState([]);
  const fetchOverAllSettings = async () => {
    try {
      let res = await axios.get(SERVICE.GET_OVERALL_SETTINGS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let lastobj = res?.data?.overallsettings?.length > 0 ? res?.data?.overallsettings?.at(-1) : {};
      setOverallsettings(lastobj);
      setColor(lastobj?.backgroundcolour || '#FFFFFF');
      return lastobj?.emaildomain || '';
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  const LoadingBackdrop = ({ open }) => {
    return (
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open}>
        <div className="pulsating-circle">
          <CircularProgress color="inherit" className="loading-spinner" />
        </div>
        <Typography variant="h6" sx={{ marginLeft: 2, color: '#fff', fontWeight: 'bold' }}>
          Please Wait...
        </Typography>
      </Backdrop>
    );
  };

  const [isLoading, setIsLoading] = useState(true);

  const [employee, setEmployee] = useState({
    wordcheck: false,
    shiftgrouping: '',
    prefix: 'Mr',
    firstname: '',
    lastname: '',
    legalname: '',
    callingname: '',
    fathername: '',
    mothername: '',
    gender: '',
    maritalstatus: '',
    dom: '',
    dob: '',
    bloodgroup: '',
    religion: '',
    profileimage: '',
    location: '',
    email: '',
    contactpersonal: '',
    pgenerateviapincode: true,
    pvillageorcity: '',
    pdistrict: '',
    cgenerateviapincode: true,
    cvillageorcity: '',
    cdistrict: '',
    contactfamily: '',
    emergencyno: '',
    wordcheck: '',
    doj: '',
    dot: '',
    name: '',
    contactno: '',
    details: '',
    username: '',
    password: '',
    companyname: '',
    pdoorno: '',
    pstreet: '',
    parea: '',
    plandmark: '',
    ptaluk: '',
    ppost: '',
    ppincode: '',
    paddresstype: '',
    ppersonalprefix: '',
    presourcename: '',
    plandmarkandpositionalprefix: '',
    pgpscoordination: '',
    caddresstype: '',
    cpersonalprefix: '',
    cresourcename: '',
    clandmarkandpositionalprefix: '',
    cgpscoordination: '',
    pcountry: '',
    pstate: '',
    pcity: '',
    cdoorno: '',
    cstreet: '',
    carea: '',
    clandmark: '',
    ctaluk: '',
    cpost: '',
    cpincode: '',
    ccountry: '',
    cstate: '',
    ccity: '',
    branch: '',
    workstation: '',
    weekoff: '',
    unit: '',
    floor: '',
    department: '',
    attOptions: [],
    team: '',
    designation: '',
    shifttiming: '',
    reportingto: '',
    empcode: '',
    remark: '',
    aadhar: '',
    panno: '',
    panstatus: 'Have PAN',
    panrefno: '',
    draft: '',
    intStartDate: '',
    intEndDate: '',
    intCourse: '',
    bankname: 'ICICI BANK - ICICI',
    workmode: 'Please Select Work Mode',
    bankbranchname: '',
    accountholdername: '',
    accountnumber: '',
    ifsccode: '',

    categoryedu: 'Please Select Category',
    subcategoryedu: 'Please Select Sub Category',
    specialization: 'Please Select Specialization',
    enddate: 'present',
    endtime: 'present',
    time: getCurrentTime(),
    statuss: false,
  });

  const [todo, setTodo] = useState([]);
  const [editingIndexcheck, setEditingIndexcheck] = useState(-1);
  const [editTodoBackup, setEditTodoBackup] = useState(null);

  // const handleAddTodo = (value) => {
  //   if (value === "Standard") {
  //     setTodo([]);
  //   }
  //   if (value === "Daily") {
  //     const days = [
  //       "Monday",
  //       "Tuesday",
  //       "Wednesday",
  //       "Thursday",
  //       "Friday",
  //       "Saturday",
  //       "Sunday",
  //     ];
  //     const week = "1st Week";
  //     const newTodoList = days.map((day, index) => ({
  //       day,
  //       daycount: index + 1,
  //       week,
  //       shiftmode: "Please Select Shift Mode",
  //       shiftgrouping: "Please Select Shift Grouping",
  //       shifttiming: "Please Select Shift",
  //     }));
  //     setTodo(newTodoList);
  //   }

  //   if (value === "1 Week Rotation") {
  //     const days1 = [
  //       "Monday",
  //       "Tuesday",
  //       "Wednesday",
  //       "Thursday",
  //       "Friday",
  //       "Saturday",
  //       "Sunday",
  //     ];
  //     const days2 = [
  //       "Monday",
  //       "Tuesday",
  //       "Wednesday",
  //       "Thursday",
  //       "Friday",
  //       "Saturday",
  //       "Sunday",
  //     ];
  //     const week1 = "1st Week";
  //     const week2 = "2nd Week";
  //     const newTodoList = [
  //       ...days1.map((day, index) => ({
  //         day,
  //         daycount: index + 1,
  //         week: week1,
  //         shiftmode: "Please Select Shift Mode",
  //         shiftgrouping: "Please Select Shift Grouping",
  //         shifttiming: "Please Select Shift",
  //       })),
  //       ...days2.map((day, index) => ({
  //         day,
  //         daycount: index + 8,
  //         week: week2,
  //         shiftmode: "Please Select Shift Mode",
  //         shiftgrouping: "Please Select Shift Grouping",
  //         shifttiming: "Please Select Shift",
  //       })),
  //     ];
  //     setTodo(newTodoList);
  //   }

  //   if (value === "2 Week Rotation") {
  //     const daysInMonth = 42; // You may need to adjust this based on the actual month
  //     const days = [
  //       "Monday",
  //       "Tuesday",
  //       "Wednesday",
  //       "Thursday",
  //       "Friday",
  //       "Saturday",
  //       "Sunday",
  //     ];
  //     const weeks = [
  //       "1st Week",
  //       "2nd Week",
  //       "3rd Week",
  //       "4th Week",
  //       "5th Week",
  //       "6th Week",
  //     ]; // You may need to adjust this based on the actual month

  //     let todoList = [];
  //     let currentWeek = 1;
  //     let currentDayCount = 1;
  //     let currentDayIndex = 0;

  //     for (let i = 1; i <= daysInMonth; i++) {
  //       const day = days[currentDayIndex];
  //       const week = weeks[currentWeek - 1];

  //       todoList.push({
  //         day,
  //         daycount: currentDayCount,
  //         week,
  //         shiftmode: "Please Select Shift Mode",
  //         shiftgrouping: "Please Select Shift Grouping",
  //         shifttiming: "Please Select Shift",
  //       });

  //       currentDayIndex = (currentDayIndex + 1) % 7;
  //       currentDayCount++;
  //       if (currentDayIndex === 0) {
  //         currentWeek++;
  //       }
  //     }

  //     setTodo(todoList);
  //   }

  //   if (value === "1 Month Rotation") {
  //     const daysInMonth = 84; // You may need to adjust this based on the actual month
  //     const days = [
  //       "Monday",
  //       "Tuesday",
  //       "Wednesday",
  //       "Thursday",
  //       "Friday",
  //       "Saturday",
  //       "Sunday",
  //     ];
  //     const weeks = [
  //       "1st Week",
  //       "2nd Week",
  //       "3rd Week",
  //       "4th Week",
  //       "5th Week",
  //       "6th Week",
  //       "7th Week",
  //       "8th Week",
  //       "9th Week",
  //       "10th Week",
  //       "11th Week",
  //       "12th Week",
  //     ]; // You may need to adjust this based on the actual month

  //     let todoList = [];
  //     let currentWeek = 1;
  //     let currentDayCount = 1;
  //     let currentDayIndex = 0;

  //     for (let i = 1; i <= daysInMonth; i++) {
  //       const day = days[currentDayIndex];
  //       const week = weeks[currentWeek - 1];

  //       todoList.push({
  //         day,
  //         daycount: currentDayCount,
  //         week,
  //         shiftmode: "Please Select Shift Mode",
  //         shiftgrouping: "Please Select Shift Grouping",
  //         shifttiming: "Please Select Shift",
  //       });

  //       currentDayIndex = (currentDayIndex + 1) % 7;
  //       currentDayCount++;
  //       if (currentDayIndex === 0) {
  //         currentWeek++;
  //       }
  //     }

  //     setTodo(todoList);
  //   }
  // };

  const weekoptions2weeks = ['1st Week', '2nd Week'];
  const weekoptions1month = ['1st Week', '2nd Week', '3rd Week', '4th Week', '5th Week', '6th Week'];
  const weekoptions2months = ['1st Week', '2nd Week', '3rd Week', '4th Week', '5th Week', '6th Week', '7th Week', '8th Week', '9th Week', '10th Week', '11th Week', '12th Week'];

  const [selectedOptionsCateWeeks, setSelectedOptionsCateWeeks] = useState([]);
  let [valueCateWeeks, setValueCateWeeks] = useState('');

  const handleWeeksChange = (options) => {
    setValueCateWeeks(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsCateWeeks(options);
  };

  const customValueRendererCateWeeks = (valueCate, _days) => {
    return valueCate?.length ? valueCate.map(({ label }) => label).join(', ') : 'Please Select Weeks';
  };

  const handleAddTodo = () => {
    if (employee.shifttype === 'Please Select Shift Type') {
      setPopupContentMalert('Please Select Shift Type!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
      return; // Stop further processing if validation fails
    } else {
      if (employee.shifttype === 'Daily') {
        if (employee.shiftgrouping === 'Please Select Shift Grouping') {
          setPopupContentMalert('Please Select Shift Grouping!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (employee.shifttiming === 'Please Select Shift') {
          setPopupContentMalert('Please Select Shift!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (selectedOptionsCate?.length === 0) {
          setPopupContentMalert('Please Select Week Off!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else {
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const week = '1st Week';
          const newTodoList = days.map((day, index) => ({
            day,
            daycount: index + 1,
            week,
            shiftmode: valueCate.includes(day) ? 'Week Off' : 'Shift',
            shiftgrouping: !valueCate.includes(day) ? employee.shiftgrouping : '',
            shifttiming: !valueCate.includes(day) ? employee.shifttiming : '',
          }));
          setTodo(newTodoList);
        }
      }

      if (employee.shifttype === '1 Week Rotation') {
        if (employee.shiftgrouping === 'Please Select Shift Grouping') {
          setPopupContentMalert('Please Select Shift Grouping!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (employee.shifttiming === 'Please Select Shift') {
          setPopupContentMalert('Please Select Shift!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (valueCateWeeks?.length === 0) {
          setPopupContentMalert('Please Select Weeks!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (selectedOptionsCate?.length === 0) {
          setPopupContentMalert('Please Select Week Off!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else {
          const days1 = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const days2 = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const newTodoList = [
            // Check if "1st Week" is in valueCateWeeks and map days1 if true
            ...(valueCateWeeks.includes('1st Week')
              ? days1.map((day, index) => ({
                  day,
                  daycount: index + 1,
                  week: '1st Week', // Replacing week1 with "1st Week"
                  shiftmode: valueCate.includes(day) ? 'Week Off' : 'Shift',
                  shiftgrouping: !valueCate.includes(day) ? employee.shiftgrouping : '',
                  shifttiming: !valueCate.includes(day) ? employee.shifttiming : '',
                }))
              : []), // Return an empty array if "1st Week" is not in valueCateWeeks

            // Check if "2nd Week" is in valueCateWeeks and map days2 if true
            ...(valueCateWeeks.includes('2nd Week')
              ? days2.map((day, index) => ({
                  day,
                  daycount: index + 8,
                  week: '2nd Week', // Replacing week2 with "2nd Week"
                  shiftmode: valueCate.includes(day) ? 'Week Off' : 'Shift',
                  shiftgrouping: !valueCate.includes(day) ? employee.shiftgrouping : '',
                  shifttiming: !valueCate.includes(day) ? employee.shifttiming : '',
                }))
              : []), // Return an empty array if "2nd Week" is not in valueCateWeeks
          ];

          setTodo((prev) => [...prev, ...newTodoList]);
          setValueCateWeeks([]);
          setSelectedOptionsCateWeeks([]);
        }
      }

      if (employee.shifttype === '2 Week Rotation') {
        if (employee.shiftgrouping === 'Please Select Shift Grouping') {
          setPopupContentMalert('Please Select Shift Grouping!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (employee.shifttiming === 'Please Select Shift') {
          setPopupContentMalert('Please Select Shift!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (valueCateWeeks?.length === 0) {
          setPopupContentMalert('Please Select Weeks!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (selectedOptionsCate?.length === 0) {
          setPopupContentMalert('Please Select Week Off!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else {
          const daysInMonth = valueCateWeeks?.length * 7;
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const weeks = [...valueCateWeeks]; // You may need to adjust this based on the actual month

          let todoList = [];
          let currentWeek = 1;
          let currentDayCount = 1;
          let currentDayIndex = 0;

          for (let i = 1; i <= daysInMonth; i++) {
            const day = days[currentDayIndex];
            const week = weeks[currentWeek - 1];

            todoList.push({
              day,
              daycount: currentDayCount,
              week,
              shiftmode: valueCate.includes(day) ? 'Week Off' : 'Shift',
              shiftgrouping: !valueCate.includes(day) ? employee.shiftgrouping : '',
              shifttiming: !valueCate.includes(day) ? employee.shifttiming : '',
            });

            currentDayIndex = (currentDayIndex + 1) % 7;
            currentDayCount++;
            if (currentDayIndex === 0) {
              currentWeek++;
            }
          }
          setTodo((prev) => [...prev, ...todoList]);
          setValueCateWeeks([]);
          setSelectedOptionsCateWeeks([]);
        }
      }

      if (employee.shifttype === '1 Month Rotation') {
        if (employee.shiftgrouping === 'Please Select Shift Grouping') {
          setPopupContentMalert('Please Select Shift Grouping!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (employee.shifttiming === 'Please Select Shift') {
          setPopupContentMalert('Please Select Shift!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (valueCateWeeks?.length === 0) {
          setPopupContentMalert('Please Select Weeks!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (selectedOptionsCate?.length === 0) {
          setPopupContentMalert('Please Select Week Off!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else {
          const daysInMonth = valueCateWeeks?.length * 7;
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const weeks = [...valueCateWeeks]; // You may need to adjust this based on the actual month

          let todoList = [];
          let currentWeek = 1;
          let currentDayCount = 1;
          let currentDayIndex = 0;

          for (let i = 1; i <= daysInMonth; i++) {
            const day = days[currentDayIndex];
            const week = weeks[currentWeek - 1];

            todoList.push({
              day,
              daycount: currentDayCount,
              week,
              shiftmode: valueCate.includes(day) ? 'Week Off' : 'Shift',
              shiftgrouping: !valueCate.includes(day) ? employee.shiftgrouping : '',
              shifttiming: !valueCate.includes(day) ? employee.shifttiming : '',
            });

            currentDayIndex = (currentDayIndex + 1) % 7;
            currentDayCount++;
            if (currentDayIndex === 0) {
              currentWeek++;
            }
          }

          setTodo((prev) => [...prev, ...todoList]);
          setValueCateWeeks([]);
          setSelectedOptionsCateWeeks([]);
        }
      }
    }
  };

  // Function to handle editing start
  const handleEditTodocheck = (index) => {
    // Backup the current values before editing
    setEditTodoBackup(todo[index]);
    setEditingIndexcheck(index); // Set the index of the current todo being edited
  };

  // Function to handle confirming the changes
  const handleUpdateTodocheck = () => {
    // Confirm the changes and update the todo list
    setEditingIndexcheck(null); // Reset the editing state
  };

  // Function to handle canceling the changes
  const handleCancelEdit = () => {
    // Revert to the original todo state if editing is canceled
    const updatedTodos = [...todo];
    updatedTodos[editingIndexcheck] = editTodoBackup;
    setTodo(updatedTodos); // Restore original values
    setEditingIndexcheck(null); // Reset the editing state
    setEditTodoBackup(null); // Clear the backup
  };

  function multiInputs(referenceIndex, reference, inputvalue) {
    // Update isSubCategory state
    if (reference === 'shiftmode') {
      let updatedShiftMode = todo?.map((value, index) => {
        if (referenceIndex === index) {
          return {
            ...value,
            shiftmode: inputvalue,
            shiftgrouping: 'Please Select Shift Grouping',
            shifttiming: 'Please Select Shift',
          };
        } else {
          return value;
        }
      });
      setTodo(updatedShiftMode);
    }

    // Update isSubCategory state
    if (reference === 'shiftgrouping') {
      let updatedShiftGroup = todo?.map((value, index) => {
        if (referenceIndex === index) {
          return {
            ...value,
            shiftgrouping: inputvalue,
            shifttiming: 'Please Select Shift',
          };
        } else {
          return value;
        }
      });
      setTodo(updatedShiftGroup);
    }

    // Update isSubCategory state
    if (reference === 'shifttiming') {
      let updatedShiftTime = todo?.map((value, index) => {
        if (referenceIndex === index) {
          return { ...value, shifttiming: inputvalue };
        } else {
          return value;
        }
      });
      setTodo(updatedShiftTime);
    }
  }

  const AsyncShiftTimingSelects = ({ todo, index, auth, multiInputs, colourStyles }) => {
    const fetchShiftTimings = async () => {
      let ansGet = todo.shiftgrouping;
      let answerFirst = ansGet?.split('_')[0];
      let answerSecond = ansGet?.split('_')[1];

      let res = await axios.get(SERVICE.GETALLSHIFTGROUPS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const shiftGroup = res?.data?.shiftgroupings.filter((data) => data.shiftday === answerFirst && data.shifthours === answerSecond);

      const options =
        shiftGroup?.length > 0
          ? shiftGroup
              .flatMap((data) => data.shift)
              .map((u) => ({
                ...u,
                label: u,
                value: u,
              }))
          : [];

      return options;
    };

    const [shiftTimings, setShiftTimings] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        const options = await fetchShiftTimings();
        setShiftTimings(options);
      };
      fetchData();
    }, [todo.shiftgrouping, auth.APIToken]);

    return <Selects size="small" options={shiftTimings} styles={colourStyles} value={{ label: todo.shifttiming, value: todo.shifttiming }} onChange={(selectedOption) => multiInputs(index, 'shifttiming', selectedOption.value)} />;
  };

  const [designationGroup, setDesignationGroup] = useState('');

  const [educationDocuments, setEducationDocuments] = useState([]);
  const fetchCategoryBased = async (e) => {
    try {
      let res_category = await axios.get(SERVICE.CATEGORYEDUCATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let data_set = res_category.data.educationcategory.find((data) => {
        return data.categoryname === e.value;
      });

      let get = data_set.subcategoryname.map((data) => ({
        label: data,
        value: data,
      }));
      let doc = data_set?.documenttodo?.length
        ? data_set?.documenttodo?.map((data) => ({
            label: data,
            value: data,
          }))
        : [];
      setEducationDocuments(
        doc.map((type) => ({
          type: type.value,
          status: '',
          file: null,
          name: '',
          uploadedby: '',
          reason: '',
          deadlinedate: '',
        }))
      );

      setSubcategorys(get);
    } catch (err) {
      handleApiError(err, setShowAlert, handleClickOpenerr);
    }
  };
  const handleEduDeadlineChange = (index, date) => {
    const updatedDocs = [...educationDocuments];
    updatedDocs[index].deadlinedate = date;
    setEducationDocuments(updatedDocs);
  };

  const handleEduReasonChange = (index, reason) => {
    const updatedDocs = [...educationDocuments];
    updatedDocs[index].reason = reason;
    setEducationDocuments(updatedDocs);
  };

  const handleEduStatusChange = (index, status) => {
    const updatedDocs = [...educationDocuments];
    updatedDocs[index] = {
      ...updatedDocs[index],
      status,
      file: null,
      name: '',
      uploadedby: '',
      reason: '',
      deadlinedate: '',
    };
    setEducationDocuments(updatedDocs);
  };

  const handleEducationFilesUploadIndex = (eventOrFile, index) => {
    let selectedFile;

    if (eventOrFile?.target?.files) {
      selectedFile = eventOrFile.target.files[0];
    } else if (eventOrFile instanceof File) {
      selectedFile = eventOrFile;
    }

    if (!selectedFile) return;

    if (selectedFile.size > 1024000) {
      setPopupContentMalert(`The file "${selectedFile.name}" is larger than 1MB and will not be uploaded.`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
      return;
    }

    const extension = selectedFile.name.split('.').pop();
    const newFileName = `${employee?.firstname?.trim().toLowerCase()}_${employee?.lastname?.trim().toLowerCase()}_${educationDocuments[index].type}.${extension}`;

    const updatedFile = new File([selectedFile], newFileName, { type: selectedFile.type });

    const updatedDocs = [...educationDocuments];
    updatedDocs[index] = {
      ...updatedDocs[index],
      file: updatedFile,
      name: newFileName,
      uploadedby: 'employee',
      status: 'Uploaded',
      reason: '',
      deadlinedate: '',
    };

    setEducationDocuments(updatedDocs);
  };
  const handleAdditionalFilesUploadIndex = (eventOrFile) => {
    let selectedFile;

    if (eventOrFile?.target?.files) {
      selectedFile = eventOrFile.target.files[0];
    } else if (eventOrFile instanceof File) {
      selectedFile = eventOrFile;
    }

    if (!selectedFile) return;

    if (selectedFile.size > 1024000) {
      setPopupContentMalert(`The file "${selectedFile.name}" is larger than 1MB and will not be uploaded.`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
      return;
    }

    const extension = selectedFile.name.split('.').pop();
    const newFileName = `${employee?.firstname?.trim().toLowerCase()}_${employee?.lastname?.trim().toLowerCase()}_${addQual}.${extension}`;

    const updatedFile = new File([selectedFile], newFileName, { type: selectedFile.type });

    setAdditionalQualificationDocuments((prev) => ({
      ...prev,
      file: updatedFile,
      documenttype: addQual || '',
      name: newFileName,
      uploadedby: 'employee',
      status: 'Uploaded',
      reason: '',
      deadlinedate: '',
    }));
  };
  const [showCamera, setShowCamera] = useState(false);
  const [onSendFileFn, setOnSendFileFn] = useState(() => () => {});
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const handleOpenCamera = (uploadHandler) => {
    setShowCamera(true);
    setOnSendFileFn(() => uploadHandler);
    setShowCameraDialog(true);
  };
  const handleCloseCamera = (e) => {
    setShowCamera(false);
    setShowCameraDialog(false);
  };
  const [experienceDocuments, setExperienceDocuments] = useState(
    experience_document_type.map((type) => ({
      type: type.value,
      status: '',
      file: null,
      name: '',
      uploadedby: '',
      reason: '',
      deadlinedate: '',
      payslipfrom: '',
      payslipto: '',
    }))
  );
  const [additionalQualificationDocuments, setAdditionalQualificationDocuments] = useState({
    type: '',
    status: '',
    file: null,
    name: '',
    uploadedby: '',
    reason: '',
    deadlinedate: '',
  });
  const handleExperienceFilesUploadIndex = (eventOrFile, index) => {
    let selectedFile;

    if (eventOrFile?.target?.files) {
      selectedFile = eventOrFile.target.files[0];
    } else if (eventOrFile instanceof File) {
      selectedFile = eventOrFile;
    }

    if (!selectedFile) return;

    if (selectedFile.size > 1024000) {
      setPopupContentMalert(`The file "${selectedFile.name}" is larger than 1MB and will not be uploaded.`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
      return;
    }

    const first = employee.firstname?.replace(/\s+/g, '')?.toLowerCase();
    const last = employee.lastname?.replace(/\s+/g, '')?.toLowerCase();

    const occ = desigTodo || '';
    const comp = employee?.company || '';
    const extension = selectedFile.name.split('.').pop();
    const newFileName = `${first}_${last}_${occ}.${extension}`;

    const updatedFile = new File([selectedFile], newFileName, { type: selectedFile.type });

    const updatedDocs = [...experienceDocuments];
    updatedDocs[index] = {
      ...updatedDocs[index],
      file: updatedFile,
      name: newFileName,
      uploadedby: 'employee',
      status: 'Uploaded',
      reason: '',
      deadlinedate: '',
    };

    setExperienceDocuments(updatedDocs);
  };
  //Submit function for Work History
  const handleSubmitWorkSubmit = (e) => {
    e.preventDefault();

    const errorstodo = {};

    // Check if empNameTodo already exists in workhistTodo
    const isDuplicate = workhistTodo?.some(
      (entry) =>
        entry.empNameTodo?.trim()?.toLowerCase() === empNameTodo?.trim()?.toLowerCase() &&
        entry.desigTodo?.trim()?.toLowerCase() === desigTodo?.trim()?.toLowerCase() &&
        entry.joindateTodo === joindateTodo &&
        entry.leavedateTodo === leavedateTodo &&
        entry.dutiesTodo?.trim()?.toLowerCase() === dutiesTodo?.trim()?.toLowerCase() &&
        entry.reasonTodo?.trim()?.toLowerCase() === reasonTodo?.trim()?.toLowerCase()
    );

    //  let Duplicate = workhistTodo?.some(data => data?.occupation?.trim()?.toLowerCase() === workhistTodo.occupation?.trim()?.toLowerCase() && data?.company?.trim()?.toLowerCase() === workhistTodo.company?.trim()?.toLowerCase());

    const missingDeadline = experienceDocuments?.length > 0 && experienceDocuments.some((data) => data?.status === 'Pending' && (!data?.deadlinedate || data?.deadlinedate === ''));

    const missingStatus = experienceDocuments?.length > 0 && experienceDocuments.some((data) => data?.status === '' || !data?.status);

    const missingReason = experienceDocuments?.length > 0 && experienceDocuments.some((data) => data?.status === 'No Document' && (!data?.reason || data?.reason.trim() === ''));

    const missingFileOnUpload = experienceDocuments?.length > 0 && experienceDocuments.some((data) => data?.status === 'Uploaded' && !data?.file);

    const missingPaySlip = experienceDocuments?.length > 0 && experienceDocuments.some((data) => data?.status !== 'No Document' && data?.type === 'Pay Slip' && (data?.payslipfrom === '' || data?.payslipto === ''));

    // Check if all fields are filled
    if (empNameTodo === '' || desigTodo === '' || joindateTodo === '' || leavedateTodo === '' || dutiesTodo === '' || reasonTodo === '') {
      errorstodo.empNameTodo = <Typography style={{ color: 'red' }}>Please Fill All Fields</Typography>;
    } else if (missingStatus) {
      errorstodo.empNameTodo = <Typography style={{ color: 'red' }}>Please select Status for all documents!</Typography>;
      // setPopupContentMalert('Please select Status for all  documents!');
      // setPopupSeverityMalert('info');
      // handleClickOpenPopupMalert();
    } else if (missingDeadline) {
      errorstodo.empNameTodo = <Typography style={{ color: 'red' }}>Please choose a deadline date for all "Pending" files!</Typography>;
      // setPopupContentMalert('Please choose a deadline date for all "Pending" files!');
      // setPopupSeverityMalert('info');
      // handleClickOpenPopupMalert();
    } else if (missingReason) {
      errorstodo.empNameTodo = <Typography style={{ color: 'red' }}>Please provide a reason for all "No Document" files!</Typography>;
      // setPopupContentMalert('Please provide a reason for all "No Document" files!');
      // setPopupSeverityMalert('info');
      // handleClickOpenPopupMalert();
    } else if (missingFileOnUpload) {
      errorstodo.empNameTodo = <Typography style={{ color: 'red' }}>Some "Uploaded" documents are missing files!</Typography>;
      // setPopupContentMalert('Some "Uploaded" documents are missing files!');
      // setPopupSeverityMalert('info');
      // handleClickOpenPopupMalert();
    } else if (missingPaySlip) {
      errorstodo.empNameTodo = <Typography style={{ color: 'red' }}>Please Select Pay Slip Duration!</Typography>;
      // setPopupContentMalert('Please Select Pay Slip Duration!');
      // setPopupSeverityMalert('info');
      // handleClickOpenPopupMalert();
    } else if (isDuplicate) {
      errorstodo.empNameTodo = <Typography style={{ color: 'red' }}>Already Added!</Typography>;
    }

    setErrorstodo(errorstodo);

    if (Object.keys(errorstodo)?.length === 0) {
      //  const groupId = uuidv4();
      //       setExperienceGroupId(groupId);
      //       const finalGroupId = experienceGroupId === '' ? groupId : experienceGroupId;

      // Generate multiple todo items from experienceDocuments
      const newExperienceTodos = experienceDocuments.map((doc) => {
        // const uniqueId = uuidv4();

        return {
          ...workhistTodo,
          ...doc,
          empNameTodo,
          desigTodo,
          joindateTodo,
          leavedateTodo,
          dutiesTodo,
          reasonTodo,
          documenttype: doc.type,
        };
      });

      // Update existing items with the same groupid
      const updatedExperienceTodo = workhistTodo;

      // Final combined array
      const finalTodo = [...updatedExperienceTodo, ...newExperienceTodos];
      setWorkhistTodo(finalTodo);

      setExperienceDocuments(
        experience_document_type.map((type) => ({
          type: type.value,
          status: '',
          file: null,
          name: '',
          uploadedby: '',
          reason: '',
          deadlinedate: '',
          payslipfrom: '',
          payslipto: '',
        }))
      );
      //
      // setWorkhistTodo([
      //   ...workhistTodo,
      //   {
      //     empNameTodo,
      //     desigTodo,
      //     joindateTodo,
      //     leavedateTodo,
      //     dutiesTodo,
      //     reasonTodo,
      //   },
      // ]);
      setErrorstodo('');

      setEmpNameTodo('');
      setDesigTodo('');
      setJoindateTodo('');
      setLeavedateTodo('');
      setDutiesTodo('');
      setReasonTodo('');
    }
  };
  const getPdfPageCount = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    console.log(pdfDoc.getPageCount(), 'pdfpagecount');
    return pdfDoc.getPageCount();
  };

  // DOCX page estimate using mammoth
  const getDocxPageEstimate = async (file) => {
    const arrayBuffer = await file.arrayBuffer();

    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      // Estimate based on form feed or manual logic
      // For now, assume 500 words ≈ 1 page
      const words = text.split(/\s+/).filter(Boolean);
      const wordsPerPage = 500;
      const estimatedPages = Math.ceil(words.length / wordsPerPage);
      console.log(estimatedPages, 'estimatedPages');
      return estimatedPages;
      // return 1;
    } catch (error) {
      console.error('Error reading DOCX:', error);
      return 1; // fallback
    }
  };

  // PPTX slide count using JSZip
  const getPptxSlideCount = async (file) => {
    const arrayBuffer = await file.arrayBuffer();

    try {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const slidePaths = Object.keys(zip.files).filter((path) => path.startsWith('ppt/slides/slide') && path.endsWith('.xml'));
      console.log(slidePaths.length, 'slidePaths.length');

      return slidePaths.length;
      // return 1;
    } catch (error) {
      console.error('Error reading PPTX:', error);
      return 1; // fallback
    }
  };
  const handleCreateTodocheck = (data, filename) => {
    const newTodocheck = {
      ...data,
      candidatefilename: filename,
      indexid: uuidv4(), // Generate a unique ID
    };
    setFiles((prevTodos) => [...prevTodos, newTodocheck]);
  };
  const handleCandidateUploadForIndex = async (event, index) => {
    const selectedFiles = Array.from(event.target.files);
    if (!selectedFiles.length) return;

    const todo = files[index];
    const allowedTypes = todo?.type || [];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.txt', '.csv'];

    const sizeUnit = (todo?.sizeunit || 'MB').toUpperCase();
    const sizeLimitNum = parseFloat(todo?.size || '1');
    const unitToBytes = { KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
    const sizeLimitBytes = sizeLimitNum * (unitToBytes[sizeUnit] || 1024 * 1024);

    const errors = [];

    for (const file of selectedFiles) {
      const ext = `.${file.name.split('.').pop().toLowerCase()}`;
      const isValidExt = validExtensions.includes(ext);
      const isTypeAllowed = allowedTypes.length === 0 || allowedTypes.includes(ext);
      const isValidSize = file.size <= sizeLimitBytes;

      // ❌ Extension or Type Check
      if (!isValidExt || !isTypeAllowed) {
        errors.push(`${file.name}: Invalid file type`);
        continue;
      }

      // ❌ Size Check
      if (!isValidSize) {
        errors.push(`${file.name}: File exceeds the size limit of ${todo.size} ${sizeUnit}`);
        continue;
      }

      // ❌ Page Count Check
      let pageCount = 1;
      try {
        if (todo?.pagetype === 'Single') {
          if (ext === '.pdf') pageCount = await getPdfPageCount(file);
          if (ext === '.docx') pageCount = await getDocxPageEstimate(file);
          if (ext === '.pptx') pageCount = await getPptxSlideCount(file);

          if (pageCount > 1) {
            errors.push(`${file.name}: Expected single-page document, found ${pageCount} pages`);
            continue;
          }
        }
      } catch (err) {
        errors.push(`${file.name}: Failed to check pages (${err.message})`);
        continue;
      }

      // ✅ Passed all checks
      const first = (employee?.firstname || '').replace(/\s+/g, '').toLowerCase();
      const last = (employee?.lastname || '').replace(/\s+/g, '').toLowerCase();
      const shortname = todo?.shortname || 'file';
      const extension = file.name.split('.').pop();
      const newFileName = `${first}_${last}_${shortname}.${extension}`;
      const updatedFile = new File([file], newFileName, { type: file.type });

      const updatedTodos = [...files];
      updatedTodos[index] = {
        ...todo,
        file: updatedFile,
        name: newFileName,
        uploadedby: 'employee',
        status: 'Uploaded',
        deadlinedate: '',
        reason: '',
      };
      setFiles(updatedTodos);
      return; // Stop after first successful upload
    }

    // Show detailed errors if no valid file uploaded
    if (errors.length > 0) {
      setPopupContentMalert(`The following issues occurred:\n- ${errors.join('\n- ')}`);
      setPopupSeverityMalert('error');
      handleClickOpenPopupMalert();
    }
  };
  const renderFilePreviewMulter = async (file) => {
    const url = window.URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    window.open(link, '_blank');
  };
  const renderFilePreviewMulterUploaded = async (file) => {
    if (!file) return false;
    const imageUrl = `${SERVICE.EMPLOYEE_DOCUMENT_FILES}/${file.filename}`;
    window.open(imageUrl, '_blank'); // Open image in a new tab
  };
  const [categoryDocument, setCategoryDocument] = useState([]);
  const [designations, setDesignations] = useState([]);
  const fetchCandidatedocumentdropdowns = async () => {
    try {
      const [res_candidate, res_area, doccategory] = await Promise.all([
        axios.get(SERVICE.CANDIDATEDOCUMENT, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }),
        axios.get(SERVICE.DOCUMENTDETAILS, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }),
        axios.get(`${SERVICE.CANDIDATEDOCUMENTCATEGORY}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }),
      ]);
      let docresult = doccategory?.data?.candidatedocumentcategory
        ?.filter((data) => data?.status === 'Employee')
        ?.map((item) => ({
          ...item,
          uploadrestriction: item?.uploadrestriction || 'All',
        }));
      setCategoryDocument(docresult);

      let data_set = res_candidate.data.candidatedocuments.filter((data) => docresult?.some((item) => item?.categoryname === data?.category && item?.subcategoryname?.includes(data?.subcategory)));

      let document_details = res_area?.data?.documentdetails;

      // const desigall = [
      //   ...data_set.reduce((acc, curr) => {
      //     if (!acc.some((item) => item.candidatefilename === curr.candidatefilename)) {
      //       acc.push({
      //         ...curr,
      //         label: curr.candidatefilename,
      //         value: curr.candidatefilename,
      //       });
      //     }
      //     return acc;
      //   }, []),
      // ];

      const desigall = data_set.reduce((acc, curr) => {
        const exists = acc.some((item) => item.name === curr.candidatefilename);
        if (!exists) {
          const matchedDoc = document_details.find((doc) => doc.name === curr.candidatefilename);

          if (matchedDoc && Array.isArray(matchedDoc.pagemode)) {
            // matchedDoc.pagemode.forEach(mode => {
            acc.push({
              label: `${curr.candidatefilename}`,
              value: `${curr.candidatefilename}`,
              candidatefilename: `${curr.candidatefilename}`,
              category: curr?.category || '',
              uploadrestriction: curr?.uploadrestriction || '',
              subcategory: curr?.subcategory || '',
              pagemode: matchedDoc?.pagemode,
              ...matchedDoc,
              pagetype: matchedDoc?.pagetype?.length > 0 ? matchedDoc?.pagetype[0] || '' : '',
            });
            // });
          }
          // else {
          //   // fallback if no matching document or no pagemode
          //   acc.push({
          //     label: curr.candidatefilename,
          //     value: curr.candidatefilename,
          //     ...curr,
          //   });
          // }
        }

        return acc;
      }, []);
      console.log(desigall, 'desigall');

      setDesignations(desigall);
      // await handleCandidateUploadSingleAll(desigall)
      return desigall;
    } catch (err) {
      handleApiError(err, setShowAlert, handleClickOpenerr);
    }
  };
  const handleCandidateUploadSingleAll = (alloptions) => {
    setFiles([]);

    // Step 1: Create a map to store one UUID per unique filename.value
    const filenameIdMap = {};

    alloptions.forEach((filename) => {
      const fileValue = filename?.value;
      const fileName = filename?.name;

      // Step 2: Reuse UUID if already created for this name
      if (!filenameIdMap[fileName]) {
        filenameIdMap[fileName] = uuidv4();
      }

      const uniqueId = filenameIdMap[fileName];
      const casesensitivefilename = fileValue?.replace(/\s+/g, '').toLowerCase();

      // Step 3: Call your handler with the shared uniqueId
      handleCreateTodocheck(
        {
          candidatefilename: fileValue,
          name: '',
          preview: '',
          data: '',
          remark: 'candidate file',
          link: `${BASE_URL}/uploaddocument/all/${casesensitivefilename}/${uniqueId}`,
          uniqueid: uniqueId,
          linkname: `All Files Upload Link`,
          csfilname: casesensitivefilename,
          uploadedby: '',
          shortname: filename?.shortname,
          status: 'Pending',
          deadlinedate: moment().add(1, 'weeks').format('YYYY-MM-DD'),
          reason: '',

          uniquename: filename?.name || '',
          pagemode: filename?.pagemode || [],
          pagemodeselected: filename?.pagemodeselected || null,
          pagetype: filename?.pagetype || '',
          size: filename?.size || '',
          sizeunit: filename?.sizeunit || '',
          type: filename?.type || [],
          category: filename?.category || '',
          subcategory: filename?.subcategory || '',
        },
        fileValue
      );
    });
  };

  const fetchCategoryEducation = async () => {
    try {
      let res_category = await axios.get(SERVICE.CATEGORYEDUCATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let data_set = res_category?.data?.educationcategory.map((d) => d.categoryname);
      let filter_opt = [...new Set(data_set)];

      setCategorys(
        filter_opt.map((data) => ({
          ...data,
          label: data,
          value: data,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchEducation = async (e) => {
    try {
      let res = await axios.get(SERVICE.EDUCATIONSPECILIZATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let data_set = res?.data?.educationspecilizations.filter((data) => {
        return data.category.includes(employee.categoryedu) && data.subcategory.includes(e.value);
      });

      let result = data_set[0]?.specilizationgrp.map((data) => ({
        label: data.label,
        value: data.label,
      }));

      setEducationsOpt(result);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const valueOpt = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ];

  const mode = ['Auto Increment', 'Add', 'Minus', 'Fix'];
  const modetar = ['Target Stop'];
  const modeexp = ['Exp Stop'];

  const modeOption = mode.map((data) => ({
    ...data,
    label: data,
    value: data,
  }));

  const modeOptiontar = modetar.map((data) => ({
    ...data,
    label: data,
    value: data,
  }));

  const modeOptionexp = modeexp.map((data) => ({
    ...data,
    label: data,
    value: data,
  }));
  const [expDptDates, setExpDptDates] = useState([]);
  const [ShiftGroupingOptions, setShiftGroupingOptions] = useState([]);
  const ShiftTypeOptions = [
    { label: 'Standard', value: 'Standard' },
    { label: 'Daily', value: 'Daily' },
    { label: '1 Week Rotation (2 Weeks)', value: '1 Week Rotation' },
    { label: '2 Week Rotation (Monthly)', value: '2 Week Rotation' },
    { label: '1 Month Rotation (2 Month)', value: '1 Month Rotation' },
  ];
  const [allUsersLoginName, setAllUsersLoginName] = useState([]);
  const [expDateOptions, setExpDateOptions] = useState([]);

  useEffect(() => {
    let foundData = expDptDates.find((item) => item.department === employee.department && new Date(employee.doj) >= new Date(item.fromdate) && new Date(employee.doj) <= new Date(item.todate));

    if (foundData) {
      let filteredDatas = expDptDates
        .filter((d) => d.department === employee.department && new Date(d.fromdate) >= new Date(foundData.fromdate))
        .map((data) => ({
          label: data.fromdate,
          value: data.fromdate,
        }));

      setExpDateOptions(filteredDatas);
    } else {
    }
  }, [expDptDates, employee]);

  const [assignExperience, setAssignExperience] = useState({
    assignExpMode: 'Auto Increment',
    assignExpvalue: 0,
    assignEndExpDate: '',
    assignEndTarDate: '',
    assignEndExp: 'Exp Stop',
    assignEndExpvalue: 'No',
    assignEndTar: 'Target Stop',
    assignEndTarvalue: 'No',
    updatedate: '',
    assignTartype: 'Department Month Set',
    assignExptype: 'Department Month Set',
  });

  // Process allot add  details

  const [loginNotAllot, setLoginNotAllot] = useState({
    process: 'Please Select Process',
    processtype: 'Primary',
    processduration: 'Full',
    time: '00:00',
  });

  const [hrsOption, setHrsOption] = useState([]);
  const [minsOption, setMinsOption] = useState([]);

  const processTypes = [
    { label: 'Primary', value: 'Primary' },
    { label: 'Secondary', value: 'Secondary' },
    { label: 'Tertiary', value: 'Tertiary' },
  ];

  const processDuration = [
    { label: 'Full', value: 'Full' },
    { label: 'Half', value: 'Half' },
  ];

  //function to generate hrs
  const generateHrsOptions = () => {
    const hrsOpt = [];
    for (let i = 0; i <= 23; i++) {
      if (i < 10) {
        i = '0' + i;
      }
      hrsOpt.push({ value: i.toString(), label: i.toString() });
    }
    setHrsOption(hrsOpt);
  };
  //function to generate mins
  const generateMinsOptions = () => {
    const minsOpt = [];
    for (let i = 0; i <= 59; i++) {
      if (i < 10) {
        i = '0' + i;
      }
      minsOpt.push({ value: i.toString(), label: i.toString() });
    }
    setMinsOption(minsOpt);
  };

  const [ProcessOptions, setProcessOptions] = useState([]);

  const ProcessTeamDropdowns = async (e) => {
    let processTeam = e ? e.value : selectedTeam;
    try {
      let res = await axios.post(SERVICE.ALL_PROCESS_AND_TEAM_FILTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: String(selectedCompany),
        branch: String(selectedBranch),
        unit: String(selectedUnit),
        team: processTeam,
      });
      const ans = res?.data?.processteam?.length > 0 ? res?.data?.processteam : [];
      setProcessOptions(
        ans.map((data) => ({
          ...data,
          label: data.process,
          value: data.process,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    generateHrsOptions();
    generateMinsOptions();
  }, []);

  useEffect(() => {
    ProcessTeamDropdowns();
  }, [employee.process]);
  useEffect(() => {
    fetchSalarySlabs();
  }, [id, selectedBranch, selectedCompany]);

  useEffect(() => {
    fetchTargetpoints();
  }, [id]);
  const [salSlabs, setsalSlabs] = useState([]);

  const [tarPoints, setTarpoints] = useState([]);
  const [monthSets, setMonthsets] = useState([]);
  const fetchSalarySlabs = async () => {
    try {
      let res_employee = await axios.get(SERVICE.SALARYSLAB_LIMITED, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setsalSlabs(res_employee?.data?.salaryslab);
    } catch (err) {
      console.log(err);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const fetchTargetpoints = async () => {
    try {
      let res_employee = await axios.get(SERVICE.TARGETPOINTS_LIMITED, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTarpoints(res_employee?.data?.targetpoints);
    } catch (err) {
      console.log(err);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  useEffect(() => {
    let today1 = new Date();
    var mm = String(today1.getMonth() + 1).padStart(2, '0');
    var yyyy = today1.getFullYear();
    let curMonStartDate = yyyy + '-' + mm + '-01';

    let modevalue = new Date(today1) > new Date(assignExperience.updatedate);
    let findexp = monthSets.find((d) => d.department === employee?.department);
    let findDate = findexp ? findexp.fromdate : curMonStartDate;
    // console.log(findDate)
    const calculateMonthsBetweenDates = (startDate, endDate) => {
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        // Convert years to months
        months += years * 12;

        // Adjust for negative days
        if (days < 0) {
          months -= 1; // Subtract a month
          days += new Date(end.getFullYear(), end.getMonth(), 0).getDate(); // Add days of the previous month
        }

        // Adjust for days 15 and above
        if (days >= 15) {
          months += 1; // Count the month if 15 or more days have passed
        }

        return months;
      }

      return 0; // Return 0 if either date is missing
    };

    let differenceInMonths = 0;
    let differenceInMonthsexp = 0;
    let differenceInMonthstar = 0;
    if (modevalue) {
      if (assignExperience.assignEndExpvalue === 'Yes') {
        differenceInMonthsexp = differenceInMonthsexp < 1 ? 0 : differenceInMonthsexp;
        differenceInMonthsexp = calculateMonthsBetweenDates(assignExperience.updatedate, assignExperience.assignEndExpDate);
        if (assignExperience.assignEndExp === 'Add') {
          differenceInMonthsexp += parseInt(assignExperience.assignExpvalue);
        } else if (assignExperience.assignEndExp === 'Minus') {
          differenceInMonthsexp -= parseInt(assignExperience.assignExpvalue);
        } else if (assignExperience.assignEndExp === 'Fix') {
          differenceInMonthsexp = parseInt(assignExperience.assignExpvalue);
        }
      } else {
        differenceInMonthsexp = calculateMonthsBetweenDates(assignExperience.updatedate, findDate);
        differenceInMonthsexp = differenceInMonthsexp < 1 ? 0 : differenceInMonthsexp;
        // Math.floor((new Date(findDate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
        if (assignExperience.assignEndExp === 'Add') {
          differenceInMonthsexp += parseInt(assignExperience.assignExpvalue);
        } else if (assignExperience.assignEndExp === 'Minus') {
          differenceInMonthsexp -= parseInt(assignExperience.assignExpvalue);
        } else if (assignExperience.assignEndExp === 'Fix') {
          differenceInMonthsexp = parseInt(assignExperience.assignExpvalue);
        } else {
          // differenceInMonths = parseInt(assignExperience.assignExpvalue);
          differenceInMonthsexp = calculateMonthsBetweenDates(assignExperience.updatedate, findDate);
        }
      }

      //findtar end difference yes/no
      if (modevalue.endtar === 'Yes') {
        differenceInMonthstar = calculateMonthsBetweenDates(assignExperience.updatedate, assignExperience.assignEndTarDate);
        differenceInMonthstar = differenceInMonthstar < 1 ? 0 : differenceInMonthstar;
        if (assignExperience.assignExpMode === 'Add') {
          differenceInMonthstar += parseInt(assignExperience.assignExpvalue);
        } else if (assignExperience.assignExpMode === 'Minus') {
          differenceInMonthstar -= parseInt(assignExperience.assignExpvalue);
        } else if (assignExperience.assignExpMode === 'Fix') {
          differenceInMonthstar = parseInt(assignExperience.assignExpvalue);
        }
      } else {
        differenceInMonthstar = calculateMonthsBetweenDates(assignExperience.updatedate, findDate);
        differenceInMonthstar = differenceInMonthstar < 1 ? 0 : differenceInMonthstar;
        if (assignExperience.assignExpMode === 'Add') {
          differenceInMonthstar += parseInt(assignExperience.assignExpvalue);
        } else if (assignExperience.assignExpMode === 'Minus') {
          differenceInMonthstar -= parseInt(assignExperience.assignExpvalue);
        } else if (assignExperience.assignExpMode === 'Fix') {
          differenceInMonthstar = parseInt(assignExperience.assignExpvalue);
        } else {
          // differenceInMonths = parseInt(assignExperience.assignExpvalue);
          differenceInMonthstar = calculateMonthsBetweenDates(assignExperience.updatedate, findDate);
        }
      }

      differenceInMonths = calculateMonthsBetweenDates(assignExperience.updatedate, findDate);
      differenceInMonths = differenceInMonths < 1 ? 0 : differenceInMonths;
      if (assignExperience.assignExpMode === 'Add') {
        differenceInMonths += parseInt(assignExperience.assignExpvalue);
      } else if (assignExperience.assignExpMode === 'Minus') {
        differenceInMonths -= parseInt(assignExperience.assignExpvalue);
      } else if (assignExperience.assignExpMode === 'Fix') {
        differenceInMonths = parseInt(assignExperience.assignExpvalue);
      } else {
        // differenceInMonths = parseInt(assignExperience.assignExpvalue);
        differenceInMonths = calculateMonthsBetweenDates(assignExperience.updatedate, findDate);
      }
    } else {
      differenceInMonthsexp = calculateMonthsBetweenDates(assignExperience.updatedate, findDate);
      differenceInMonthstar = calculateMonthsBetweenDates(assignExperience.updatedate, findDate);
      differenceInMonths = calculateMonthsBetweenDates(assignExperience.updatedate, findDate);
    }

    let getprocessCode = loginNotAllot.process;

    let processexp = employee?.doj ? getprocessCode + (differenceInMonths < 1 ? '00' : differenceInMonths <= 9 ? `0${differenceInMonths}` : differenceInMonths) : '00';

    // let findSalDetails = salSlabs.find((d) => d.company == selectedCompany && d.branch == selectedBranch && d.salarycode == processexp);

    // let findSalDetailsTar = tarPoints.find((d) => d.company === selectedCompany && d.branch === selectedBranch && d.processcode === processexp);

    let findSalDetailsLogs = salSlabs.find((d) => d.company == selectedCompany && d.branch == selectedBranch && d.salarycode == processexp);
    console.log(findSalDetailsLogs, 'findSalDetailsLogs');
    let findSalDetailsLogEntry = findSalDetailsLogs && findSalDetailsLogs?.salaryslablog ? findSalDetailsLogs.salaryslablog : [];
    console.log(findSalDetailsLogEntry, 'findSalDetailsLogEntry');

    let findSalDetails = findSalDetailsLogEntry.filter((d) => new Date(d.startdate) <= new Date(employee?.doj)).sort((a, b) => new Date(b.startdate) - new Date(a.startdate))[0];
    console.log(findSalDetails, 'findSalDetails');

    let findSalDetailsTarlogs = tarPoints.find((d) => d.branch === selectedBranch && d.company === selectedCompany && d.processcode === processexp);
    // console.log(findSalDetailsTarlogs, tarPoints.length, "findSalDetailsTarlogs")

    let findSalDetailsTarLogEntry = findSalDetailsTarlogs && findSalDetailsTarlogs?.targetpointslog ? findSalDetailsTarlogs.targetpointslog : [];
    // console.log(findSalDetailsTarLogEntry, processexp, "findSalDetailsTarLogEntry")
    let findSalDetailsTar = findSalDetailsTarLogEntry?.filter((d) => new Date(d.startdate) <= new Date(employee?.doj)).sort((a, b) => new Date(b.startdate) - new Date(a.startdate))[0];
    // console.log(findSalDetailsTar, "findSalDetailsTar")

    let targetpoints = findSalDetailsTar ? findSalDetailsTar.points : '';

    let grosstotal = findSalDetails
      ? Number(findSalDetails.basic) + Number(findSalDetails.hra) + Number(findSalDetails.conveyance) + Number(findSalDetails.medicalallowance) + Number(findSalDetails.productionallowance) + Number(findSalDetails.productionallowancetwo) + Number(findSalDetails.otherallowance)
      : '';

    let salTab = {
      salaryfixed: true,
      salarystatus: 'With Salary',
      expectedsalary: '',
      basic: Number(findSalDetails?.basic || 0),
      hra: Number(findSalDetails?.hra || 0),
      conveyance: Number(findSalDetails?.conveyance || 0),
      medicalallowance: Number(findSalDetails?.medicalallowance || 0),
      productionallowance: Number(findSalDetails?.productionallowance || 0) + Number(findSalDetails?.productionallowancetwo || 0),
      otherallowance: Number(findSalDetails?.otherallowance || 0),
      performanceincentive: Number(findSalDetails?.performanceincentive || 0),
      shiftallowance: Number(findSalDetails?.shiftallowance || 0),
      grossmonthsalary: Number(grosstotal || 0),
      annualgrossctc: 12 * Number(grosstotal || 0),
    };
    setSalaryTableData((prev) => ({
      ...prev,
      ...salTab,
    }));
    let Modeexp = employee?.doj ? (differenceInMonths > 0 ? differenceInMonths : 0) : '';
    let Tarexp = employee?.doj ? (differenceInMonthstar > 0 ? differenceInMonthstar : 0) : '';

    setoverallgrosstotal(grosstotal);
    setModeexperience(Modeexp);
    setTargetexperience(Tarexp);
    setTargetpts(targetpoints);
  }, [newstate, employee?.department, assignExperience]);
  //get all employees list details
  const fetchDepartmentMonthsets = async () => {
    const now = new Date();
    let today = new Date();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var currentyear = today.getFullYear();

    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let currentmonth = months[mm - 1];

    try {
      let res_employee = await axios.get(SERVICE.DEPMONTHSET_ALL, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setExpDptDates(res_employee?.data?.departmentdetails);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const handleButtonClick = (e) => {
    e.preventDefault();
    handleSubmitMulti(e);
  };

  const handleButtonClickPersonal = (e) => {
    e.preventDefault();
    handleSubmitMultiPersonal(e);
  };

  const handleButtonClickLog = (e) => {
    e.preventDefault();
    handleSubmitMultiLog(e);
  };

  // for attendance mode
  const attModeOptions = [
    { label: 'Domain', value: 'Domain' },
    { label: 'Hrms-Self', value: 'Hrms-Self' },
    { label: 'Hrms-Manual', value: 'Hrms-Manual' },
    { label: 'Biometric', value: 'Biometric' },
    { label: 'Production', value: 'Production' },
  ];

  // for status
  const statusOptions = [
    { label: 'Users Purpose', value: 'Users Purpose' },
    { label: 'Enquiry Only', value: 'Enquiry Purpose' },
  ];

  const workmodeOptions = [
    { label: 'Remote', value: 'Remote' },
    { label: 'Office', value: 'Office' },
  ];
  useEffect(() => {
    var filteredWorks;
    if (selectedUnit === '' && employee.floor === '') {
      filteredWorks = workStationOpt?.filter((u) => u.company === selectedCompany && u.branch === selectedBranch);
    } else if (selectedUnit === '') {
      filteredWorks = workStationOpt?.filter((u) => u.company === selectedCompany && u.branch === selectedBranch && u.floor === employee.floor);
    } else if (employee.floor === '') {
      filteredWorks = workStationOpt?.filter((u) => u.company === selectedCompany && u.branch === selectedBranch && u.unit === selectedUnit);
    } else {
      filteredWorks = workStationOpt?.filter((u) => u.company === selectedCompany && u.branch === selectedBranch && u.unit === selectedUnit && u.floor === employee.floor);
    }
    const result = filteredWorks?.flatMap((item) => {
      return item.combinstation.flatMap((combinstationItem) => {
        return combinstationItem.subTodos.length > 0 ? combinstationItem.subTodos.map((subTodo) => subTodo.subcabinname + '(' + item.branch + '-' + item.floor + ')') : [combinstationItem.cabinname + '(' + item.branch + '-' + item.floor + ')'];
      });
    });

    const processedResult = result.map((e) => {
      const selectedCabinName = e?.split('(')[0];

      const Bracketsbranch = e?.match(/\(([^)]+)\)/)?.[1];

      const hyphenCount = Bracketsbranch.split('-').length - 1;

      const Branch = hyphenCount === 1 ? Bracketsbranch.split('-')[0].trim() : Bracketsbranch.split('-').slice(0, 2).join('-');

      const Floor = hyphenCount === 1 ? Bracketsbranch.split('-')[1].trim() : hyphenCount === 2 ? Bracketsbranch.split('-').pop() : Bracketsbranch.split('-').slice(-2).join('-')?.replace(')', '');

      const shortname = workStationSystemName
        ?.filter((item) => item?.branch === Branch && (Floor === '' || Floor === item?.floor) && item?.cabinname === selectedCabinName)
        ?.map((item) => item?.systemshortname)
        ?.toString();

      return e + `(${shortname})`;
    });

    let workstationsFinal = [
      ...processedResult
        ?.filter((d) => !allAssignedWorkStations.includes(d))
        ?.map((t) => ({
          label: t,
          value: t?.replace(/\([^)]*\)$/, ''),
        })),
    ];
    console.log(workstationsFinal, 'workstationsFinal');
    setFilteredWorkStation(workstationsFinal);
  }, [selectedCompany, selectedBranch, selectedUnit, employee.floor]);

  const [designationLog, setDesignationLog] = useState([]);
  const [departmentLog, setDepartmentLog] = useState([]);
  const [boardingLog, setBoardingLog] = useState([]);
  const [isBoardingData, setIsBoardingData] = useState([]);
  const [processLog, setProcessLog] = useState([]);

  let today = new Date();

  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  let formattedDate = yyyy + '-' + mm + '-' + dd;

  const [selectedAttMode, setSelectedAttMode] = useState([]);
  const [valueAttMode, setValueAttMode] = useState([]);
  //att mode multiselect
  const handleAttModeChange = (options) => {
    setSelectedAttMode(options);
    setValueAttMode(
      options.map((a, index) => {
        return a.value;
      })
    );
  };

  const customValueRendererAttMode = (valueCompany, _attmode) => {
    return valueCompany?.length ? valueCompany.map(({ label }) => label)?.join(', ') : 'Please Select Attendance Mode';
  };

  useEffect(() => {
    rowData();
  }, []);

  const rowData = async () => {
    try {
      let res = await axios.get(`${SERVICE.USER_SINGLE}/${newId}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      if (res?.data?.suser?.designationlog?.length === 0) {
        setDesignationLog([
          {
            branch: res?.data?.suser?.boardingLog?.length > 0 ? res?.data?.suser?.boardingLog[0]?.branch : res?.data?.suser?.branch,
            designation: res?.data?.suser.designation,
            startdate: res?.data?.suser?.doj,
            team: res?.data?.suser?.boardingLog?.length > 0 ? res?.data?.suser?.boardingLog[0]?.team : res?.data?.suser.team,
            unit: res?.data?.suser?.boardingLog?.length > 0 ? res?.data?.suser?.boardingLog[0]?.unit : res?.data?.suser.unit,
            username: res?.data?.suser.companyname,
            companyname: res?.data?.suser?.boardingLog?.length > 0 ? res?.data?.suser?.boardingLog[0]?.company : res?.data?.suser.company,
            _id: res?.data?.suser._id,
          },
        ]);
      } else {
        setDesignationLog(res?.data?.suser?.designationlog);
      }
      if (res?.data?.suser?.departmentlog?.length === 0) {
        setDepartmentLog([
          {
            branch: res?.data?.suser?.boardingLog?.length > 0 ? res?.data?.suser?.boardingLog[0]?.branch : res?.data?.suser?.branch,
            department: res?.data?.suser?.department,
            startdate: res?.data?.suser?.doj,
            team: res?.data?.suser?.boardingLog?.length > 0 ? res?.data?.suser?.boardingLog[0]?.team : res?.data?.suser?.team,
            unit: res?.data?.suser?.boardingLog?.length > 0 ? res?.data?.suser?.boardingLog[0]?.unit : res?.data?.suser?.unit,
            username: res?.data?.suser?.companyname,
            companyname: res?.data?.suser?.boardingLog?.length > 0 ? res?.data?.suser?.boardingLog[0]?.company : res?.data?.suser.company,
            _id: res?.data?.suser?._id,
          },
        ]);
      } else {
        setDepartmentLog(res?.data?.suser?.departmentlog);
      }

      // boarding log
      if (res?.data?.suser?.boardingLog?.length === 0) {
        setBoardingLog([
          {
            company: res?.data?.suser?.company,
            branch: res?.data?.suser?.branch,
            startdate: res?.data?.suser?.doj,
            team: res?.data?.suser?.team,
            unit: res?.data?.suser?.unit,
            floor: res?.data?.suser?.floor,
            area: res?.data?.suser?.area,
            workstation: res?.data?.suser?.workstation,
            weekoff: res?.data?.suser?.weekoff,
            shifttiming: res?.data?.suser?.shifttiming,
            shiftgrouping: res?.data?.suser?.shiftgrouping,
            shifttype: res?.data?.suser?.shifttype,
            username: res?.data?.suser?.companyname,
            logcreation: String('user'),
            ischangecompany: true,
            ischangebranch: true,
            ischangeunit: true,
            ischangeteam: true,
            ischangearea: true,
            ischangefloor: true,
            ischangeworkstation: true,
            ischangeworkmode: true,
            _id: res?.data?.suser?._id,
          },
        ]);
      } else {
        setBoardingLog(res?.data?.suser?.boardingLog);
      }

      const resbdl = res?.data?.suser?.boardingLog?.filter((data, index) => {
        return data.logcreation !== 'shift';
      });

      setIsBoardingData(resbdl);

      // process log
      if (res?.data?.suser?.processlog?.length === 0) {
        setProcessLog([
          {
            company: res?.data?.suser?.boardingLog?.length > 0 ? res?.data?.suser?.boardingLog[0]?.company : res?.data?.suser?.company,
            branch: res?.data?.suser?.boardingLog?.length > 0 ? res?.data?.suser?.boardingLog[0]?.branch : res?.data?.suser?.branch,
            startdate: res?.data?.suser?.doj,
            team: res?.data?.suser?.boardingLog?.length > 0 ? res?.data?.suser?.boardingLog[0]?.team : res?.data?.suser?.team,
            unit: res?.data?.suser?.boardingLog?.length > 0 ? res?.data?.suser?.boardingLog[0]?.unit : res?.data?.suser?.unit,
            process: res?.data?.suser?.process,
            processtype: res?.data?.suser?.processtype,
            processduration: res?.data?.suser?.processduration,
            time: `${res?.data?.suser?.time}:${res?.data?.suser?.timemins}`,
            username: res?.data?.suser?.username,
            _id: res?.data?.suser?._id,
          },
        ]);
      } else {
        setProcessLog(res?.data?.suser?.processlog);
      }

      let isThere = res?.data?.suser?.attendancemode
        ? res?.data?.suser?.attendancemode?.map((data) => ({
            ...data,
            label: data,
            value: data,
          }))
        : [];
      setSelectedAttMode(isThere);
      setValueAttMode(res?.data?.suser?.attendancemode ? res?.data?.suser?.attendancemode.map((data) => data) : []);

      //workstation start
      let isIntern = !res?.data?.suser?.internstatus ? false : res?.data?.suser?.internstatus === 'Moved';

      let boardingLog = res?.data?.suser?.boardingLog;
      const movetoliveIndex = boardingLog.findIndex((item) => item.movetolive === true);

      let beforeArray = [];
      let afterArray = [];

      if (movetoliveIndex !== -1) {
        // Separate the arrays based on the found index
        beforeArray = boardingLog.slice(0, movetoliveIndex);
        afterArray = boardingLog.slice(movetoliveIndex);
      }
      let boardFirstLog = isIntern && movetoliveIndex !== -1 && afterArray?.length > 0 ? afterArray[0] : res?.data?.suser?.boardingLog?.length > 0 ? res?.data?.suser?.boardingLog[0] : undefined;

      let resNew = await axios.get(SERVICE.WORKSTATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let workStationOpt = resNew?.data?.locationgroupings;
      //workstation start
      let allWorkStationOpt = await fetchWorkStation();

      setPrimaryWorkStation(boardFirstLog?.workstation[0] || 'Please Select Primary Work Station');

      const assignPrimarySecondaryWorkstations = (data) => {
        return data.map((emp) => {
          const workstations = (emp.workstation || []).map((ws) => (ws ? ws.trim() : ''));

          const [primary, ...secondary] = workstations;

          const extractBranchAndFloor = (workstation) => {
            const branchAndFloor = (workstation || '')?.match(/\(([^)]+)\)/)?.[1];
            if (branchAndFloor) {
              const hyphenCount = branchAndFloor.split('-').length - 1;
              const Branch = hyphenCount === 1 ? branchAndFloor.split('-')[0].trim() : branchAndFloor.split('-').slice(0, 2).join('-');
              const Floor = hyphenCount === 1 ? branchAndFloor.split('-')[1].trim() : hyphenCount === 2 ? branchAndFloor.split('-').pop() : branchAndFloor.split('-').slice(-2).join('-')?.replace(')', '');
              return { Branch, Floor };
            }
            return {};
          };

          const findSystemShortName = (workstation) => {
            const { Branch, Floor } = extractBranchAndFloor(workstation);
            const match = workStationSystemName?.find((sht) => sht?.branch === Branch && sht?.floor === Floor && sht?.cabinname === workstation.split('(')[0].trim());
            return match ? match.systemshortname : '';
          };

          const primarySystemShortName = findSystemShortName(primary);
          const secondarySystemShortNames = secondary.map(findSystemShortName).filter((name) => name);

          const secondaryworkstationvalue = secondary.join(', ');

          return {
            ...emp,
            primaryworkstation: ['Please Select Primary Work Station', 'Select Primary Workstation', null]?.includes(primary) ? '' : primary || '', // Set the first workstation as primary
            secondaryworkstation: secondaryworkstationvalue || '',
            systemshortname: [primarySystemShortName, ...secondarySystemShortNames].join(', '), // Combine all short names
          };
        });
      };

      const updatedData = assignPrimarySecondaryWorkstations([boardFirstLog || res?.data?.suser]);

      const systemShortNamesArray = updatedData[0]?.systemshortname.split(', ');

      const [primary, ...secondary] = systemShortNamesArray;

      setPrimaryKeyShortname(primary === '' ? '' : `${primary},`);
      setKeyShortname(secondary?.toString());

      const employeeCount = Number(res?.data?.suser?.employeecount ?? 0) + Number(res?.data?.suser?.wfhcount ?? 0);
      setMaxSelections(employeeCount);
      var filteredWorks;
      if (res?.data?.suser?.unit === '' && res?.data?.suser?.floor === '') {
        filteredWorks = workStationOpt?.filter((u) => u.company === res?.data?.suser?.company && u.branch === res?.data?.suser?.branch);
      } else if (res?.data?.suser?.unit === '') {
        filteredWorks = workStationOpt?.filter((u) => u.company === res?.data?.suser?.company && u.branch === res?.data?.suser?.branch && u.floor === res?.data?.suser?.floor);
      } else if (res?.data?.suser?.floor === '') {
        filteredWorks = workStationOpt?.filter((u) => u.company === res?.data?.suser?.company && u.branch === res?.data?.suser?.branch && u.unit === res?.data?.suser?.unit);
      } else {
        filteredWorks = workStationOpt?.filter((u) => u.company === res?.data?.suser?.company && u.branch === res?.data?.suser?.branch && u.unit === res?.data?.suser?.unit && u.floor === res?.data?.suser?.floor);
      }

      const result = filteredWorks.flatMap((item) => {
        return item.combinstation.flatMap((combinstationItem) => {
          return combinstationItem.subTodos.length > 0 ? combinstationItem.subTodos.map((subTodo) => subTodo.subcabinname + '(' + item.branch + '-' + item.floor + ')') : [combinstationItem.cabinname + '(' + item.branch + '-' + item.floor + ')'];
        });
      });

      const processedResult = result.map((e) => {
        const selectedCabinName = e?.split('(')[0];

        const Bracketsbranch = e?.match(/\(([^)]+)\)/)?.[1];

        const hyphenCount = Bracketsbranch.split('-').length - 1;

        const Branch = hyphenCount === 1 ? Bracketsbranch.split('-')[0].trim() : Bracketsbranch.split('-').slice(0, 2).join('-');

        const Floor = hyphenCount === 1 ? Bracketsbranch.split('-')[1].trim() : hyphenCount === 2 ? Bracketsbranch.split('-').pop() : Bracketsbranch.split('-').slice(-2).join('-')?.replace(')', '');

        const shortname = workStationSystemName
          ?.filter((item) => item?.branch === Branch && (Floor === '' || Floor === item?.floor) && item?.cabinname === selectedCabinName)
          ?.map((item) => item?.systemshortname)
          ?.toString();

        return e + `(${shortname})`;
      });

      // The processedResult array now contains all the mapped `shortname` values
      let workstationsFinal = [
        ...processedResult.map((t) => ({
          label: t,
          value: t?.replace(/\([^)]*\)$/, ''),
        })),
      ];
      let primaryWorkstationNew = boardFirstLog?.workstation[0] || 'Please Select Primary Work Station';
      let findLabel = workstationsFinal?.find((item) => item.label.includes(primaryWorkstationNew)) || {};
      setFilteredWorkStation(workstationsFinal);
      setPrimaryWorkStationLabel(findLabel?.label || 'Please Select Primary Work Station');

      const matches = (findLabel?.label || '')?.match(/^(.*?)\((.*?)\)\((.*?)\)$/);
      console.log(primaryWorkstationNew, matches);
      setWorkstationTodoList((prev) =>
        matches
          ? [
              {
                workstation: matches?.[1]?.trim() + '(' + matches?.[2]?.trim() + ')', // G-HRA(TTS-TRICHY-Ground Floor)
                shortname: matches?.[3],
                type: 'Primary',
              },
            ]
          : []
      );
      let secondaryWorkstation = Array.isArray(boardFirstLog?.workstation)
        ? boardFirstLog?.workstation
            ?.filter((item) => item !== boardFirstLog?.workstation[0])
            .map((x) => ({
              ...x,
              label: x,
              value: x,
            }))
        : [];
      let foundDataNew = secondaryWorkstation?.map((item) => {
        let getData = allWorkStationOpt?.find((data) => data.value === item.value);
        return {
          ...item,
          label: getData?.label,
        };
      });

      setSelectedOptionsWorkStation(foundDataNew);
      // const resultNew = foundDataNew.map((item) => {
      //   const matches = (item?.label || '')?.match(/^(.*?)\((.*?)\)\((.*?)\)$/);
      //   return {
      //     workstation: matches?.[1]?.trim() + '(' + matches?.[2]?.trim() + ')', // G-HRA(TTS-TRICHY-Ground Floor)
      //     shortname: matches?.[3],
      //     type: 'Secondary', // TT_1_U4_G-HRA
      //   };
      // });
      const resultNew = (foundDataNew || [])
        .map((item) => {
          if (!item || !item.label) return null;

          const matches = item.label.match(/^(.*?)\((.*?)\)\((.*?)\)$/);

          if (!matches) return null;

          return {
            workstation: `${matches[1].trim()}(${matches[2].trim()})`,
            shortname: matches[3],
            type: 'Secondary',
          };
        })
        .filter(Boolean); // remove null results
      setWorkstationTodoList((prev) => {
        const primaryItem = prev?.find((item) => item?.type === 'Primary');
        return primaryItem ? [primaryItem, ...resultNew] : [...resultNew];
      });

      setValueWorkStation(boardFirstLog?.workstation?.filter((item) => item !== boardFirstLog?.workstation[0]));
      //workstation end
      const wfhcount = res?.data?.suser?.wfhcount || 0;
      // setMaxSelections(Number(employeeCount) + Number(wfhcount));
      setWfhSelections(Number(wfhcount));
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // company multi select
  const deleteTodo = (todo) => {
    if (todo?.type === 'Primary') {
      setPrimaryWorkStation('Please Select Primary Work Station');
      setPrimaryWorkStationLabel('Please Select Primary Work Station');
      setPrimaryKeyShortname('');
      // setKeyShortname('');
      // setWorkstationTodoList([]);
      // setSelectedOptionsWorkStation([]);
      setWorkstationTodoList((prev) => prev.filter((item) => item?.shortname !== todo?.shortname));
      setSelectedOptionsWorkStation((prev) => prev.filter((item) => item?.value !== todo?.workstation));
      setValueWorkStation((prev) => prev.filter((item) => item !== todo?.workstation));
      setKeyShortname((prev) =>
        prev
          ?.split(',')
          .filter((item) => item.trim() !== todo?.shortname)
          .join(',')
      );
    } else {
      setWorkstationTodoList((prev) => prev.filter((item) => item?.shortname !== todo?.shortname));
      setSelectedOptionsWorkStation((prev) => prev.filter((item) => item?.value !== todo?.workstation));
      setValueWorkStation((prev) => prev.filter((item) => item !== todo?.workstation));
      setKeyShortname((prev) =>
        prev
          ?.split(',')
          .filter((item) => item.trim() !== todo?.shortname)
          .join(',')
      );
    }
  };
  const handleEmployeesChange = (options) => {
    // const maxOptions = Number(maxSelections) - 1;

    const check = (primaryWorkStation || '').trim().toLowerCase() !== 'please select primary work station' && (primaryWorkStation || '').trim() !== '' && (primaryWorkStation || '').trim().toLowerCase() !== 'select primary workstation';

    const maxOptions = check ? Number(maxSelections) - 1 : Number(maxSelections);
    console.log(maxOptions, 'maxOptions');
    // Restrict selection to maxOptions
    if (options.length <= maxOptions) {
      const selectedCabs = options?.map((option) => option?.value?.split('(')[0]) || [];

      const extractBranchAndFloor = (workstation) => {
        const branchAndFloor = (workstation || '')?.match(/\(([^)]+)\)/)?.[1];
        if (branchAndFloor) {
          const hyphenCount = branchAndFloor.split('-').length - 1;
          const Branch = hyphenCount === 1 ? branchAndFloor.split('-')[0].trim() : branchAndFloor.split('-').slice(0, 2).join('-');
          const Floor = hyphenCount === 1 ? branchAndFloor.split('-')[1].trim() : hyphenCount === 2 ? branchAndFloor.split('-').pop() : branchAndFloor.split('-').slice(-2).join('-')?.replace(')', '');
          return { Branch, Floor };
        }
        return {};
      };

      setKeyShortname((prevKeyShortname) => {
        const prevShortnamesArray = prevKeyShortname ? prevKeyShortname.split(', ') : [];

        const newShortnames = options
          ?.map((item) => {
            const { Branch, Floor } = extractBranchAndFloor(item?.value);

            return workStationSystemName?.filter((workItem) => workItem.branch === Branch && (Floor === '' || Floor === workItem?.floor) && selectedCabs.includes(workItem?.cabinname))?.map((workItem) => workItem?.systemshortname);
          })
          .flat();

        const updatedShortnames = prevShortnamesArray.filter((shortname) => newShortnames.includes(shortname) || selectedCabs.includes(workStationSystemName?.find((workItem) => workItem?.systemshortname === shortname)?.cabinname));

        const mergedShortnames = Array.from(new Set([...updatedShortnames, ...newShortnames]));

        return mergedShortnames.join(', ');
      });

      const updatedOptions = allWorkStationOpt.map((option) => ({
        ...option,
        disabled: maxOptions - 1 > 0 && options.length >= maxOptions - 1 && !options.find((selectedOption) => selectedOption.value === option.value),
      }));

      setValueWorkStation(options.map((a) => a.value));
      setSelectedOptionsWorkStation(options);

      const result = options.map((item) => {
        const matches = (item?.label || '')?.match(/^(.*?)\((.*?)\)\((.*?)\)$/);
        return {
          workstation: matches?.[1]?.trim() + '(' + matches?.[2]?.trim() + ')', // G-HRA(TTS-TRICHY-Ground Floor)
          shortname: matches?.[3],
          type: 'Secondary', // TT_1_U4_G-HRA
        };
      });
      setWorkstationTodoList((prev) => {
        const primaryItem = prev?.find((item) => item?.type === 'Primary');
        return primaryItem ? [primaryItem, ...result] : [...result];
      });
    }
  };
  const customValueRendererEmployees = (valueWorkStation, _filteredWorkStation) => {
    return valueWorkStation?.length ? valueWorkStation.map(({ label }) => label).join(', ') : <span style={{ color: 'hsl(0, 0%, 20%)' }}>Please Select Secondary Work Station</span>;
  };
  const [allAssignedWorkStations, setAllAssignedWorkStations] = useState([]);
  const fetchWorkStation = async () => {
    try {
      let res = await axios.get(SERVICE.WORKSTATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const aggregationPipeline = [
        {
          $project: {
            workstation: 1, // Include only the workstation field
          },
        },
        {
          $unwind: '$workstation', // Unwind the workstation array into separate documents
        },
        {
          $group: {
            _id: null, // Group all documents together
            allWorkstations: { $addToSet: '$workstation' }, // Combine all unique workstation values into a single array
          },
        },
      ];
      let response = await axios.post(
        SERVICE.DYNAMICUSER_CONTROLLER,
        {
          aggregationPipeline,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      const allWorkstations = response.data?.users?.[0]?.allWorkstations || [];
      // setAllAssignedWorkStations(allWorkstations)
      setAllAssignedWorkStations([]);
      const result = res?.data?.locationgroupings.flatMap((item) => {
        return item.combinstation.flatMap((combinstationItem) => {
          return combinstationItem.subTodos.length > 0 ? combinstationItem.subTodos.map((subTodo) => subTodo.subcabinname + '(' + item.branch + '-' + item.floor + ')') : [combinstationItem.cabinname + '(' + item.branch + '-' + item.floor + ')'];
        });
      });
      setWorkStationOpt(res?.data?.locationgroupings);

      const processedResult = result.map((e) => {
        const selectedCabinName = e?.split('(')[0];

        const Bracketsbranch = e?.match(/\(([^)]+)\)/)?.[1];

        const hyphenCount = Bracketsbranch.split('-').length - 1;

        const Branch = hyphenCount === 1 ? Bracketsbranch.split('-')[0].trim() : Bracketsbranch.split('-').slice(0, 2).join('-');

        const Floor = hyphenCount === 1 ? Bracketsbranch.split('-')[1].trim() : hyphenCount === 2 ? Bracketsbranch.split('-').pop() : Bracketsbranch.split('-').slice(-2).join('-')?.replace(')', '');

        const shortname = workStationSystemName
          ?.filter((item) => item?.branch === Branch && (Floor === '' || Floor === item?.floor) && item?.cabinname === selectedCabinName)
          ?.map((item) => item?.systemshortname)
          ?.toString();

        return e + `(${shortname})`;
      });

      let secondaryworkstation = processedResult
        ?.filter((d) => !allWorkstations.includes(d))
        ?.map((d) => ({
          ...d,
          label: d,
          value: d?.replace(/\([^)]*\)$/, ''),
        }));
      console.log(secondaryworkstation, 'secondaryworkstation');
      setAllWorkStationOpt(secondaryworkstation);
      return secondaryworkstation;
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchUserDatasLimitedEmpcode = async () => {
    try {
      let req = await axios.post(SERVICE.USERS_LIMITED_EMPCODE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        id: id,
      });

      let ALLusers = req?.data?.users;
      const lastThreeDigitsArray = ALLusers.map((employee) => employee?.empcode?.slice(-3));
      const allDigitsArray = ALLusers?.filter((data) => data?._id !== id && data?.empcode !== '')?.map((employee) => employee?.empcode);

      setEmpCodeLimitedAll(allDigitsArray);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchUserDatasLimitedEmpcode();
    fetchOverAllSettings();
    fetchCompanyDomain();
  }, []);
  const [third, setThird] = useState('');
  const [companyEmailDomain, setCompanyEmailDomain] = useState('');
  useEffect(() => {
    // Split the domain names into an array and trim any whitespace
    const domainsArray = companyEmailDomain
      ?.split(',')
      .map((domain) => domain.trim())
      .filter((domain) => domain);

    let usernames = (enableLoginName ? String(third) : employee.username).toLowerCase();
    // Check if the domainsArray has any domains
    const companyEmails = domainsArray?.length > 0 ? domainsArray.map((domain) => `${usernames}@${domain}`).join(',') : '';

    setEmployee((prev) => ({
      ...prev,
      companyemail: domainsArray?.length > 0 ? companyEmails : '',
    }));
  }, [enableLoginName, third, employee.username, companyEmailDomain]);

  const [allCompanyDomains, setAllCompanyDomains] = useState([]);
  useEffect(() => {
    filterCompanyDomain(selectedCompany);
  }, [selectedCompany]);
  const filterCompanyDomain = (company) => {
    let filteredDomain = allCompanyDomains
      ?.filter((data) => data.companyname === company)
      ?.map((item) => item?.companydomain)
      ?.join(',');
    setCompanyEmailDomain(filteredDomain || '');
  };
  const fetchCompanyDomain = async () => {
    try {
      let res_vendor = await axios.post(
        SERVICE.COMPANYDOMAIN,
        {
          assignbranch: [],
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      let response = res_vendor?.data?.companydomainn?.map((data) => ({
        companydomain: data?.assignedname,
        companyname: data?.company,
      }));
      setAllCompanyDomains(response);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const getWeekdayOptions = () => {
    const isNoneSelected = selectedOptionsCate.some((opt) => opt.value === 'None');

    return [
      { label: 'None', value: 'None' },
      ...['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => ({
        label: day,
        value: day,
        disabled: isNoneSelected,
      })),
    ];
  };

  // week off details
  const [selectedOptionsCate, setSelectedOptionsCate] = useState([]);
  let [valueCate, setValueCate] = useState('');

  const handleCategoryChange = (options) => {
    const isNoneSelected = options.some((opt) => opt.value === 'None');

    if (isNoneSelected) {
      // If "None" is selected, ignore other options and set only "None"
      setSelectedOptionsCate([{ label: 'None', value: 'None' }]);
      setValueCate(['None']);
    } else {
      // Otherwise, remove "None" and accept selected options
      const filtered = options.filter((opt) => opt.value !== 'None');
      setSelectedOptionsCate(filtered);
      setValueCate(filtered.map((a) => a.value));
    }
  };

  const customValueRendererCate = (valueCate, _days) => {
    return valueCate?.length ? valueCate.map(({ label }) => label).join(', ') : 'Please Select Days';
  };

  // SELECT DROPDOWN STYLES
  const colourStyles = {
    menuList: (styles) => ({
      ...styles,
      background: 'white',
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      // color:'black',
      color: isFocused ? 'rgb(255 255 255, 0.5)' : isSelected ? 'white' : 'black',
      background: isFocused ? 'rgb(25 118 210, 0.7)' : isSelected ? 'rgb(25 118 210, 0.5)' : null,
      zIndex: 1,
    }),
    menu: (base) => ({
      ...base,
      zIndex: 100,
    }),
  };

  let skno = 1;
  let eduno = 1;

  const [files, setFiles] = useState([]);
  const [Oldfiles, setOldFiles] = useState([]);
  const [OldEdu, setOldEdu] = useState([]);
  const [OldWorkHis, setOldWorkHis] = useState([]);
  const [OldAdd, setOldAdd] = useState([]);

  const handleFileUpload = (event) => {
    const files = event.target.files;
    const maxFileSize = 1 * 1024 * 1024; // 1MB in bytes
    let showAlert = false;
    for (let i = 0; i < files?.length; i++) {
      const reader = new FileReader();
      const file = files[i];
      if (file.size > maxFileSize) {
        showAlert = true;
        continue; // Skip this file and continue with the next one
      }

      reader.readAsDataURL(file);
      reader.onload = () => {
        setFiles((prevFiles) => [
          ...prevFiles,
          {
            file: file,
            name: file.name,
            preview: reader.result,
            type: file.type, // Include the file type
            data: reader.result.split(',')[1],
            remark: fileNames === 'Please Select File Name' ? '' : fileNames,
          },
        ]);
      };
    }
    setfileNames('Please Select File Name');
    if (showAlert) {
      setPopupContentMalert('File size is greater than 1MB, please upload a file below 1MB!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
  };

  const handleFileDelete = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleRemarkChange = (index, remark) => {
    setFiles((prevFiles) => prevFiles.map((file, i) => (i === index ? { ...file, remark } : file)));
  };

  const downloadFile = async (filename) => {
    try {
      const response = await axios.get(`${BASE_URL}/uploadsDocuments/${filename}`, {
        responseType: 'blob',
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([response.data]));
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading the file', error);
    }
  };
  const downloadFileDocument = async (filename) => {
    try {
      const response = await axios.get(`${BASE_URL}/EmployeeUserDocuments/${filename}`, {
        responseType: 'blob',
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([response.data]));
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading the file', error);
    }
  };
  const renderFilePreview = async (file) => {
    if (file?.orginpath && file?.orginpath === 'Employee Documents') {
      const fileUrl = `${BASE_URL}/uploadsDocuments/${file.preview}`;
      window.open(fileUrl, '_blank');
    } else if (file?.path) {
      const fileUrl = `${BASE_URL}/EmployeeUserDocuments/${file.filename}`;
      window.open(fileUrl, '_blank');
    } else {
      const response = await fetch(file.preview);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      window.open(link, '_blank');
    }
  };
  const [errmsg, setErrmsg] = useState('');

  const [errors, setErrors] = useState({});
  const [errorsLog, setErrorsLog] = useState({});
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isPasswordChange, setIsPasswordChange] = useState(false);

  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    let emailvalue = email ? email : employee.email;
    return regex.test(emailvalue);
  };

  const { auth } = useContext(AuthContext);
  const { isUserRoleCompare, isUserRoleAccess, isAssignBranch, alldepartment, allfloor, allTeam, alldesignation, buttonStyles, workStationSystemName } = useContext(UserRoleAccessContext);

  const [selectedCountryp, setSelectedCountryp] = useState(null);
  const [selectedStatep, setSelectedStatep] = useState(null);
  const [selectedCityp, setSelectedCityp] = useState(null);

  const [selectedCountryc, setSelectedCountryc] = useState(null);
  const [selectedStatec, setSelectedStatec] = useState(null);
  const [selectedCityc, setSelectedCityc] = useState(null);
  const [selectedValue, setSelectedValue] = useState([]);
  const [branchNames, setBranchNames] = useState([]);
  const [floorNames, setFloorNames] = useState([]);
  const [department, setDepartment] = useState([]);
  const [team, setTeam] = useState([]);
  const [unitNames, setUnitNames] = useState([]);
  const [designation, setDesignation] = useState([]);
  const [shifttiming, setShiftTiming] = useState([]);
  const [message, setErrorMessage] = useState('');
  const [usernameaddedby, setUsernameaddedby] = useState('');

  const [file, setFile] = useState('');
  const [webfile, setwebFile] = useState('');

  let sno = 1;

  //ADDICTIONAL QUALIFICATION SECTION FUNCTIONALITY
  const [institution, setInstitution] = useState('');
  const [passedyear, setPassedyear] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [eduTodo, setEduTodo] = useState([]);

  const [addQual, setAddQual] = useState('');
  const [addInst, setAddInst] = useState('');
  const [duration, setDuration] = useState('');
  const [remarks, setRemarks] = useState('');
  const [addAddQuaTodo, setAddQuaTodo] = useState('');

  const [empNameTodo, setEmpNameTodo] = useState('');
  const [desigTodo, setDesigTodo] = useState('');
  const [joindateTodo, setJoindateTodo] = useState('');
  const [leavedateTodo, setLeavedateTodo] = useState('');
  const [dutiesTodo, setDutiesTodo] = useState('');
  const [reasonTodo, setReasonTodo] = useState('');
  const [workhistTodo, setWorkhistTodo] = useState('');
  const [areaNames, setAreaNames] = useState([]);
  const [errorstodo, setErrorstodo] = useState({});

  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');

  //crop image
  const [selectedFile, setSelectedFile] = useState(null);
  const [croppedImage, setCroppedImage] = useState('');
  const cropperRef = useRef(null);
  const [skillSet, setSkillSet] = useState('');
  const [repotingtonames, setrepotingtonames] = useState([]);
  const handlechangepassedyear = (e) => {
    const regex = /^[0-9]+$/; // Only allows positive integers
    const inputValue = e.target.value?.slice(0, 4);
    if (regex.test(inputValue) || inputValue === '') {
      setPassedyear(inputValue);
    }
  };

  const handlechangecgpa = (e) => {
    const regex = /^\d*\.?\d*$/;
    const inputValue = e.target.value?.slice(0, 4);
    if (regex.test(inputValue) || inputValue === '') {
      setCgpa(inputValue);
    }
  };

  //Submit function for TODO Education
  const handleSubmittodo = (e) => {
    const errorstodo = {};
    //
    let Duplicate = eduTodo?.some((data) => employee?.categoryedu && data.subcategoryedu == employee?.subcategoryedu && data.specialization == employee?.specialization);
    const missingDeadline = educationDocuments?.length > 0 && educationDocuments.some((data) => data?.status === 'Pending' && (!data?.deadlinedate || data?.deadlinedate === ''));

    const missingStatus = educationDocuments?.length > 0 && educationDocuments.some((data) => data?.status === '' || !data?.status);

    const missingReason = educationDocuments?.length > 0 && educationDocuments.some((data) => data?.status === 'No Document' && (!data?.reason || data?.reason.trim() === ''));

    const missingFileOnUpload = educationDocuments?.length > 0 && educationDocuments.some((data) => data?.status === 'Uploaded' && !data?.file);
    //
    // const Nameismatch = eduTodo.some(
    //   (data, index) =>
    //     data.categoryedu == employee?.categoryedu && data.subcategoryedu == employee?.subcategoryedu && data.specialization == employee?.specialization && data.institution?.trim()?.toLowerCase() == institution?.trim()?.toLowerCase() && data.passedyear == passedyear && data.cgpa == cgpa
    // );
    e.preventDefault();
    if (employee?.categoryedu == 'Please Select Category' || employee?.subcategoryedu == 'Please Select Sub Category' || employee?.specialization == 'Please Select Specialization' || institution == '' || passedyear == '' || cgpa == '') {
      errorstodo.qualification = <Typography style={{ color: 'red' }}>Please Fill All Fields</Typography>;
      setErrorstodo(errorstodo);
    } else if (employee?.categoryedu !== 'Please Select Category' && employee?.subcategoryedu !== 'Please Select Sub Category' && employee?.specialization !== 'Please Select Specialization' && institution !== '' && passedyear !== '' && passedyear?.length !== 4 && cgpa !== '') {
      errorstodo.qualification = <Typography style={{ color: 'red' }}>Please Enter Valid Passed Year</Typography>;
      setErrorstodo(errorstodo);
    } else if (educationDocuments?.length === 0) {
      // setPopupContentMalert('No Documents To Upload');
      // setPopupSeverityMalert('info');
      // handleClickOpenPopupMalert();
      errorstodo.qualification = <Typography style={{ color: 'red' }}>No Documents To Upload!</Typography>;
      setErrorstodo(errorstodo);
    } else if (missingStatus) {
      // setPopupContentMalert('Please select Status for all  documents!');
      // setPopupSeverityMalert('info');
      // handleClickOpenPopupMalert();
      errorstodo.qualification = <Typography style={{ color: 'red' }}>Please select Status for all documents!</Typography>;
      setErrorstodo(errorstodo);
    } else if (missingDeadline) {
      // setPopupContentMalert('Please choose a deadline date for all "Pending" files!');
      // setPopupSeverityMalert('info');
      // handleClickOpenPopupMalert();
      errorstodo.qualification = <Typography style={{ color: 'red' }}>Please choose a deadline date for all "Pending" files!</Typography>;
      setErrorstodo(errorstodo);
    } else if (missingReason) {
      // setPopupContentMalert('Please provide a reason for all "No Document" files!');
      // setPopupSeverityMalert('info');
      // handleClickOpenPopupMalert();
      errorstodo.qualification = <Typography style={{ color: 'red' }}>Please provide a reason for all "No Document" files!</Typography>;
      setErrorstodo(errorstodo);
    } else if (missingFileOnUpload) {
      // setPopupContentMalert('Some "Uploaded" documents are missing files!');
      // setPopupSeverityMalert('info');
      // handleClickOpenPopupMalert();
      errorstodo.qualification = <Typography style={{ color: 'red' }}>Some "Uploaded" documents are missing files!</Typography>;
      setErrorstodo(errorstodo);
    } else if (Duplicate) {
      errorstodo.qualification = <Typography style={{ color: 'red' }}>Already Added!</Typography>;
      setErrorstodo(errorstodo);
    } else {
      const groupId = uuidv4();

      // Update all existing items with the same groupid
      const updatedEducationTodo = eduTodo;

      // Create new items for each educationDocument
      const newItems = educationDocuments.map((doc) => {
        // Unique ID for each document
        return {
          ...doc,
          categoryedu: employee?.categoryedu,
          subcategoryedu: employee?.subcategoryedu,
          specialization: employee?.specialization,
          institution,
          passedyear,
          cgpa,

          documenttype: doc.type,
        };
      });

      // Add the new items to the state
      setEduTodo([...updatedEducationTodo, ...newItems]);

      setEducationsOpt([]);
      setSubcategorys([]);
      setEducationDocuments([]);

      // setEduTodo([
      //   ...eduTodo,
      //   {
      //     categoryedu: employee?.categoryedu,
      //     subcategoryedu: employee?.subcategoryedu,
      //     specialization: employee?.specialization,
      //     institution,
      //     passedyear,
      //     cgpa,
      //   },
      // ]);
      setErrorstodo('');
      setEmployee((prev) => ({
        ...prev,
        categoryedu: 'Please Select Category',
        subcategoryedu: 'Please Select Sub Category',
        specialization: 'Please Select Specialization',
      }));
      setInstitution('');
      setPassedyear('');
      setCgpa('');
      setSubcategorys([]);
      setEducationsOpt([]);
    }
  };
  //Delete for Education
  const handleDelete = (index) => {
    const newTodos = [...eduTodo];
    newTodos.splice(index, 1);
    setEduTodo(newTodos);
  };

  //Submit function for Additional Qualification
  const handleSubmitAddtodo = (e) => {
    const errorstodo = {};
    const Namematch = addAddQuaTodo.some(
      (data, index) => data.addQual == addQual && data.addInst?.trim()?.toLowerCase() == addInst?.trim()?.toLowerCase() && data.duration?.trim()?.toLowerCase() == duration?.trim()?.toLowerCase() && data.remarks?.trim()?.toLowerCase() == remarks?.trim()?.toLowerCase()
    );
    e.preventDefault();
    if (addQual == '' || addInst == '' || duration == '') {
      errorstodo.addQual = <Typography style={{ color: 'red' }}>Please Fill All Fields</Typography>;
      setErrorstodo(errorstodo);
    } else if (Namematch) {
      errorstodo.addQual = <Typography style={{ color: 'red' }}>Already Added!</Typography>;
      setErrorstodo(errorstodo);
    } else if (additionalQualificationDocuments?.status === '') {
      errorstodo.addQual = <Typography style={{ color: 'red' }}>Please Select Files Status!</Typography>;
      setErrorstodo(errorstodo);
    } else if (additionalQualificationDocuments?.status === 'Pending' && additionalQualificationDocuments?.deadlinedate === '') {
      errorstodo.addQual = <Typography style={{ color: 'red' }}>Please Choose Deadline Date!</Typography>;
      setErrorstodo(errorstodo);
    } else if (additionalQualificationDocuments?.status === 'No Document' && additionalQualificationDocuments?.reason === '') {
      errorstodo.addQual = <Typography style={{ color: 'red' }}>Please Enter Reason!</Typography>;
      setErrorstodo(errorstodo);
    } else if (additionalQualificationDocuments?.status === 'Uploaded' && !additionalQualificationDocuments?.file) {
      errorstodo.addQual = <Typography style={{ color: 'red' }}>Please Upload File!</Typography>;
      setErrorstodo(errorstodo);
    } else {
      let newObj = {
        addQual,
        addInst,
        duration,
        remarks,
        ...additionalQualificationDocuments,
      };
      setAddQuaTodo([...addAddQuaTodo, newObj]);
      setErrorstodo('');
      setAddQual('');
      setAddInst('');
      setDuration('');
      setRemarks('');
      setAdditionalQualificationDocuments({
        type: '',
        status: '',
        file: null,
        name: '',
        uploadedby: '',
        reason: '',
        deadlinedate: '',
      });
    }
  };
  //Delete for Additional Qualification
  const handleAddDelete = (index) => {
    const newTodosed = [...addAddQuaTodo];
    newTodosed.splice(index, 1);
    setAddQuaTodo(newTodosed);
  };

  //Submit function for Work History

  //Delete for Work History
  const handleWorkHisDelete = (index) => {
    const newWorkHisTodo = [...workhistTodo];
    newWorkHisTodo.splice(index, 1);
    setWorkhistTodo(newWorkHisTodo);
  };
  const [deleteMessage, setDeleteMessage] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteFunction, setDeleteFunction] = useState(() => () => {});
  const handleClickOpenDelete = () => {
    setIsDeleteOpen(true);
  };
  const handleClickCloseDelete = () => {
    setDeleteFunction(() => () => {});
    setDeleteMessage('');
    setIsDeleteOpen(false);
  };
  const educationTodoremove = (index, row) => {
    setEduTodo((prevFiles) => {
      // Filter out all items that do NOT match the row's category and subcategory
      const remainingFiles = prevFiles.filter((item) => item.categoryedu !== row.categoryedu || item.subcategoryedu !== row.subcategoryedu);

      // // Collect all deleted items for storage
      // const deletedFiles = prevFiles.filter(
      //   (item) =>
      //     item.categoryedu === row.categoryedu &&
      //     item.subcategoryedu === row.subcategoryedu
      // );

      // // Store deleted group items
      // setEducationtodoDelete((prevDeleted) => [...prevDeleted, ...deletedFiles]);

      return remainingFiles;
    });
    handleClickCloseDelete();
  };
  const experienceTodoremove = (index, row) => {
    setWorkhistTodo((prevFiles) => {
      // Filter out all items that do NOT match the row's category and subcategory
      const remainingFiles = prevFiles.filter((item) => item.empNameTodo?.trim()?.toLowerCase() !== row?.empNameTodo?.trim()?.toLowerCase() || item.desigTodo?.trim()?.toLowerCase() !== row?.desigTodo?.trim()?.toLowerCase());

      // Collect all deleted items for storage
      // const deletedFiles = prevFiles.filter(
      //   (item) =>
      //     item.occupation?.trim()?.toLowerCase() === row?.occupation?.trim()?.toLowerCase() &&
      //     item.company?.trim()?.toLowerCase() === row.company?.trim()?.toLowerCase()
      // );

      // // Store deleted group items
      // setExperiencetodoDelete((prevDeleted) => [...prevDeleted, ...deletedFiles]);

      return remainingFiles;
    });
    handleClickCloseDelete();
  };
  const [oldData, setOldData] = useState({
    company: '',
    branch: '',
    unit: '',
    team: '',
  });

  const [oldHierarchyData, setOldHierarchyData] = useState([]);
  const [oldHierarchyDataSupervisor, setOldHierarchyDataSupervisor] = useState([]);

  const [selectedBranchCode, setSelectedBranchCode] = useState('');
  const [selectedUnitCode, setSelectedUnitCode] = useState('');

  const [workStationInputOldDatas, setWorkStationInputOldDatas] = useState({});
  const [primaryWorkStationInput, setPrimaryWorkStationInput] = useState('');

  useEffect(() => {
    const branchCode = filteredBranches.filter((item) => item.name === selectedBranch);
    setSelectedBranchCode(branchCode[0]?.code.slice(0, 2));

    const unitCode = filteredUnits.filter((item) => item.name === selectedUnit);
    setSelectedUnitCode(unitCode[0]?.code.slice(0, 2));
  }, [selectedBranch, selectedUnit]);

  useEffect(() => {
    workStationAutoGenerate();
  }, [selectedCompany, selectedBranch, selectedUnit, employee.workmode, employee?.username, employee?.ifoffice]);

  const workStationAutoGenerate = async () => {
    try {
      let lastwscode;
      let lastworkstation = repotingtonames
        .filter(
          (item) =>
            // item?.workmode !== "Internship" &&
            item.company === selectedCompany && item.branch === selectedBranch && item.unit === selectedUnit
        )
        .filter((item) => /_[0-9]+_/.test(item?.workstationinput));

      if (lastworkstation?.length === 0) {
        lastwscode = 0;
      } else {
        let highestWorkstation = lastworkstation.reduce(
          (max, item) => {
            const num = parseInt(item.workstationinput.split('_')[1]);
            return num > max.num ? { num, item } : max;
          },
          { num: 0, item: null }
        ).num;

        lastwscode = highestWorkstation.toString().padStart(2, '0');
      }

      let autoWorkStation = `W${selectedBranchCode?.toUpperCase()}${selectedUnitCode?.toUpperCase()}_${lastwscode === 0 ? '01' : (Number(lastwscode) + 1).toString().padStart(2, '0')}_${(enableLoginName ? String(third) : employee?.username)?.toUpperCase()}`;

      if (
        workStationInputOldDatas?.company === selectedCompany &&
        workStationInputOldDatas?.branch === selectedBranch &&
        workStationInputOldDatas?.unit === selectedUnit
        // &&
        // workStationInputOldDatas?.workmode === employee.workmode
      ) {
        setPrimaryWorkStationInput(workStationInputOldDatas?.workstationinput === '' || workStationInputOldDatas?.workstationinput == undefined ? autoWorkStation : workStationInputOldDatas?.workstationinput);
      } else {
        setPrimaryWorkStationInput(autoWorkStation);
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchAccessibleDetails = async (eployeename, employeecode) => {
    try {
      let req = await axios.post(SERVICE.GETUSERASSIGNBRANCH, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        empname: eployeename,
        empcode: employeecode,
      });
      let allData = req?.data?.assignbranch;
      setDeleteAssignTodo(allData?.map((data) => data?._id));

      if (allData?.length > 0) {
        let seen = new Set();
        let todos = allData
          ?.filter((data) => {
            // Create a unique identifier for the combination
            const identifier = `${data.fromcompany}-${data.frombranch}-${data.fromunit}`;
            if (seen.has(identifier)) {
              return false; // Skip if the combination is already processed
            }
            seen.add(identifier); // Add the combination to the set
            return true; // Include the first occurrence of this combination
          })
          ?.map((data) => ({
            fromcompany: data.fromcompany,
            frombranch: data.frombranch,
            fromunit: data.fromunit,
            companycode: data.companycode,
            branchcode: data.branchcode,
            unitcode: data.unitcode,
            branchemail: data.branchemail,
            branchaddress: data.branchaddress,
            branchstate: data.branchstate,
            branchcity: data.branchcity,
            branchcountry: data.branchcountry,
            branchpincode: data.branchpincode,

            company: data?.company,
            branch: data?.branch,
            unit: data?.unit,
            employee: companycaps,
            employeecode: String(employee.wordcheck === true ? employeecodenew : employee.empcode),
            id: data?._id,
            updatedby: data?.updatedby,
          }));
        setAccessibleTodo(todos);
        setAccessibleTodoDisableDelete(todos?.map((_, index) => index));

        setAccessible({
          company: 'Please Select Company',
          branch: 'Please Select Branch',
          unit: 'Please Select Unit',
          responsibleperson: companycaps,
          companycode: '',
          branchcode: '',
          unitcode: '',
          branchemail: '',
          branchaddress: '',
          branchstate: '',
          branchcity: '',
          branchcountry: '',
          branchpincode: '',
        });
      } else {
        setAccessible({
          company: 'Please Select Company',
          branch: 'Please Select Branch',
          unit: 'Please Select Unit',
          responsibleperson: companycaps,
          companycode: '',
          branchcode: '',
          unitcode: '',
          branchemail: '',
          branchaddress: '',
          branchstate: '',
          branchcity: '',
          branchcountry: '',
          branchpincode: '',
        });
        setAccessibleTodo([]);
        setAccessibleTodoDisableDelete([]);
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [documentID, setDocumentID] = useState('');
  const [oldSalaryData, setoldSalaryData] = useState([]);
  const [oldSalaryId, setoldSalaryId] = useState('');
  const [oldNames, setOldNames] = useState({
    firstname: '',
    lastname: '',
    companyname: '',
  });
  const fetchDepartmentSingle = async (department) => {
    try {
      let req = await axios.get(SERVICE.DEPARTMENT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let singleDept = req.data.departmentdetails.find((d) => d.deptname === department) || {};
      let production = singleDept?.prod || false;

      return {
        production,
        singleDept,
      };
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const salaryOptions = [
    { label: 'Experience Based', value: 'Experience Based' },
    { label: 'Manual Salary', value: 'Manual Salary' },
  ];
  const [salaryOption, setSalaryOption] = useState('Experience Based');
  function getMonthName(monthStr) {
    if (!monthStr) return '';

    // Convert to number safely
    const monthNum = parseInt(monthStr, 10);

    // List of months (1-based index)
    const months = [
      '', // index 0 (unused)
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    return months[monthNum] || '';
  }

  const fetchHandlerEdit = async () => {
    try {
      let response = await axios.get(`${SERVICE.USER_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let companyEmailDomain = await fetchOverAllSettings();
      const domainsArray = companyEmailDomain?.split(',').map((domain) => domain.trim());

      let usernames = (response?.data?.suser?.username).toLowerCase();
      // Check if the domainsArray has any domains
      const companyEmails = domainsArray?.length > 0 ? domainsArray.map((domain) => `${usernames}@${domain}`).join(',') : '';

      setOldUserCompanyname(response?.data?.suser);
      let boardFirstLog = response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0] : undefined;
      setPrimaryWorkStationInput(boardFirstLog?.workstationinput || response?.data?.suser?.workstationinput);
      setWorkStationInputOldDatas({
        company: response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.company : response?.data?.suser?.company,
        branch: response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.branch : response?.data?.suser?.branch,
        unit: response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.unit : response?.data?.suser?.unit,
        ifoffice: boardFirstLog?.workstationofficestatus || response?.data?.suser?.workstationofficestatus,
        workmode: boardFirstLog?.workmode || response?.data?.suser?.workmode,
        workstationinput: boardFirstLog?.workstationinput || response?.data?.suser?.workstationinput,
      });
      setOldNames({
        firstname: response?.data?.suser?.firstname,
        lastname: response?.data?.suser?.lastname,
        companyname: response?.data?.suser?.companyname,
      });
      setBankTodo(
        response?.data?.suser?.bankdetails?.length > 0
          ? response?.data?.suser?.bankdetails?.map((data) => ({
              ...data,
              accountstatus: data?.accountstatus ?? 'In-Active',
            }))
          : []
      );
      setRoles(response?.data?.suser?.role);
      setTodo(response?.data?.suser?.boardingLog[0]?.todo);
      setoverallgrosstotal(response?.data?.suser.grosssalary);
      setModeexperience(response?.data?.suser.modeexperience);
      setTargetexperience(response?.data?.suser.targetexperience);
      setTargetpts(response?.data?.suser.targetpts);
      let isThere = response?.data?.suser?.attendancemode
        ? response?.data?.suser?.attendancemode?.map((data) => ({
            ...data,
            label: data,
            value: data,
          }))
        : [];
      setSelectedAttMode(isThere);
      setValueAttMode(response?.data?.suser?.attendancemode ? response?.data?.suser?.attendancemode.map((data) => data) : []);
      fetchSuperVisorDropdowns(response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.team : response?.data?.suser?.team, response?.data?.suser);
      const resprocesstime = response?.data?.suser.processlog[0]?.time?.split(':');
      setLoginNotAllot({
        process: response?.data?.suser.processlog?.length > 0 ? response?.data?.suser.processlog[0]?.process : response?.data?.suser?.process,
        processtype: response?.data?.suser.processlog?.length > 0 ? response?.data?.suser.processlog[0]?.processtype : response?.data?.suser?.processtype,
        processduration: response?.data?.suser.processlog?.length > 0 ? response?.data?.suser.processlog[0]?.processduration : response?.data?.suser?.processduration,
        time: response?.data?.suser.processlog?.length > 0 ? resprocesstime[0] : `${response?.data?.suser?.time}`,
        timemins: response?.data?.suser.processlog?.length > 0 ? resprocesstime[1] : `${response?.data?.suser?.timemins}`,
      });

      fetchAccessibleDetails(response?.data?.suser.companyname, response?.data?.suser.empcode);

      let responsenew = await axios.post(SERVICE.EMPLOYEEDOCUMENT_SINGLEWITHALLBYCOMMONID, {
        commonid: id,
      });
      let responsenewsal = await axios.post(SERVICE.SINGLE_SALARY_DATA_BY_COMMON_ID, {
        commonid: id,
      });

      setoldSalaryData(responsenewsal?.data?.salarydata?.salarytable || []);
      setoldSalaryId(responsenewsal?.data?.salarydata?._id || '');
      let findSalDetails = responsenewsal?.data?.salarydata?.salarytable?.length > 0 ? responsenewsal?.data?.salarydata?.salarytable[responsenewsal?.data?.salarydata?.salarytable?.length - 1] : {};
      console.log(responsenewsal?.data?.salarydata, 'responsenewsal?.data?.salarydata');
      let salTab = {
        salaryfixed: responsenewsal?.data?.salarydata ? true : false,
        salarystatus: findSalDetails?.salarystatus || 'With Salary',
        expectedsalary: '',
        basic: Number(findSalDetails?.basic || 0),
        hra: Number(findSalDetails?.hra || 0),
        conveyance: Number(findSalDetails?.conveyance || 0),
        medicalallowance: Number(findSalDetails?.medicalallowance || 0),
        productionallowance: Number(findSalDetails?.productionallowance || 0),
        otherallowance: Number(findSalDetails?.otherallowance || 0),
        performanceincentive: Number(findSalDetails?.performanceincentive || 0),
        shiftallowance: Number(findSalDetails?.shiftallowance || 0),
        grossmonthsalary: Number(findSalDetails?.grossmonthsalary || 0),
        annualgrossctc: Number(findSalDetails?.annualgrossctc || 0),
      };
      setSalaryTableData((prev) => ({
        ...prev,
        ...salTab,
      }));
      setSalaryTableDataManual((prev) => ({
        ...prev,
        ...salTab,
      }));
      setSalaryOption(responsenewsal?.data?.salarydata ? responsenewsal?.data?.salarydata?.salaryoption : 'Experience Based');
      let expLog = response?.data?.suser?.assignExpLog?.length > 0 ? response?.data?.suser?.assignExpLog[0] : {};
      setSalarysetupForm({
        mode: String(expLog?.expmode || ''),
        date: '',
        empcode: '',
        employeename: '',
        salarycode: String(expLog?.salarycode || ''),
      });
      setFormValue({
        esideduction: Boolean(expLog?.esideduction) || false,
        pfdeduction: Boolean(expLog?.pfdeduction) || false,
        basic: String(expLog?.basic || ''),
        hra: String(expLog?.hra || ''),
        conveyance: String(expLog?.conveyance || ''),
        gross: String(expLog?.gross || ''),
        medicalallowance: String(expLog?.medicalallowance || ''),
        productionallowance: String(expLog?.productionallowance || ''),
        otherallowance: String(expLog?.otherallowance || ''),
        productionallowancetwo: String(expLog?.productionallowancetwo || ''),
        startDate: String(expLog?.updatedate || ''),
        startmonth: String(expLog?.startmonth || ''),
        startyear: String(expLog?.startyear || ''),

        startmonthlabel: expLog?.startmonth ? getMonthName(expLog?.startmonth) : '',
      });
      setDocumentID(responsenew?.data?.semployeedocument?._id);
      const savedEmployee = {
        ...response?.data?.suser,
        ...responsenew?.data?.semployeedocument,
        conpanyemail: companyEmails,
      };
      if (response?.data?.suser?.assignExpLog?.lenth === 0) {
        setAssignExperience({
          ...assignExperience,
          updatedate: response?.data?.suser?.doj,
        });
      } else {
        setAssignExperience({
          ...assignExperience,
          assignExpMode: response?.data?.suser?.assignExpLog[0]?.expmode,
          assignExpvalue: response?.data?.suser?.assignExpLog[0]?.expval,
          assignEndExpDate: response?.data?.suser?.assignExpLog[0]?.endexpdate !== '' ? moment(response?.data?.suser?.assignExpLog[0]?.endexpdate).format('YYYY-MM-DD') : '',
          assignEndTarDate: response?.data?.suser?.assignExpLog[0]?.endtardate !== '' ? moment(response?.data?.suser?.assignExpLog[0]?.endtardate).format('YYYY-MM-DD') : '',
          assignEndTarvalue: response?.data?.suser?.assignExpLog[0]?.endtar,
          assignEndExpvalue: response?.data?.suser?.assignExpLog[0]?.endexp,
          updatedate: response?.data?.suser?.assignExpLog[0]?.updatedate !== '' ? moment(response?.data?.suser?.assignExpLog[0]?.updatedate).format('YYYY-MM-DD') : '',
        });
      }

      setReferenceTodo(response?.data?.suser?.referencetodo);
      setFirst(response?.data?.suser?.firstname?.toLowerCase().split(' ').join(''));
      setSecond(response?.data?.suser?.lastname?.toLowerCase().split(' ').join(''));

      // Find the corresponding Country, State, and City objects
      const country = Country.getAllCountries().find((country) => country.name === savedEmployee.ccountry);
      const state = State.getStatesOfCountry(country?.isoCode).find((state) => state.name === savedEmployee.cstate);
      const city = City.getCitiesOfState(state?.countryCode, state?.isoCode).find((city) => city.name === savedEmployee.ccity);

      // Find the corresponding Country, State, and City objects
      // Find the corresponding Country, State, and City objects
      const countryp = Country.getAllCountries().find((country) => country.name === savedEmployee.pcountry);
      const statep = State.getStatesOfCountry(countryp?.isoCode).find((state) => state.name === savedEmployee.pstate);
      const cityp = City.getCitiesOfState(statep?.countryCode, statep?.isoCode).find((city) => city.name === savedEmployee.pcity);
      let isProd = false;
      let attOptions = attModeOptions?.map((data) => data?.value);
      if (response?.data?.suser?.department) {
        let deptsingle = await fetchDepartmentSingle(response?.data?.suser?.department);
        isProd = deptsingle?.production;
        attOptions = deptsingle?.singleDept?.attendancemode || attModeOptions?.map((data) => data?.value);
      }

      setSelectedCityc(city);
      setSelectedCountryc(country);
      setSelectedStatec(state);
      setSelectedCountryp(countryp);
      setSelectedStatep(statep);
      setSelectedCityp(cityp);
      setEmployee(savedEmployee);
      ShiftDropdwonsSecond(response?.data?.suser?.boardingLog[0]?.shiftgrouping);
      setEnableLoginName(response?.data?.suser?.usernameautogenerate);
      fetchEditareaNames(
        response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.company : response?.data?.suser?.company,
        response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.branch : response?.data?.suser?.branch,
        response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.floor : response?.data?.suser?.floor
      );
      setEduTodo(responsenew?.data?.semployeedocument?.eduTodo || []);
      setAddQuaTodo(responsenew?.data?.semployeedocument?.addAddQuaTodo || []);
      setWorkhistTodo(responsenew?.data?.semployeedocument?.workhistTodo || []);

      setOldFiles(responsenew?.data?.semployeedocument?.files);
      setOldEdu(responsenew?.data?.semployeedocument?.eduTodo);
      setOldAdd(responsenew?.data?.semployeedocument?.addAddQuaTodo);
      setOldWorkHis(responsenew?.data?.semployeedocument?.workhistTodo);

      let desig = await fetchCandidatedocumentdropdowns();

      if (responsenew?.data?.semployeedocument?.files?.length === 0) {
        await handleCandidateUploadSingleAll(desig);
      } else {
        setFiles(
          responsenew?.data?.semployeedocument?.files
            ?.filter((data) => !data?.preview)
            ?.map((item) => {
              const matchedDesig = desig.find((d) => d.value === item.candidatefilename);
              if (matchedDesig) {
                return {
                  ...item,
                  indexid: uuidv4(),
                  pagemode: matchedDesig.pagemode || [],
                  pagetype: matchedDesig.pagetype || '',
                  shortname: matchedDesig.shortname || '',
                  size: matchedDesig.size || '',
                  sizeunit: matchedDesig.sizeunit || '',
                  type: matchedDesig.type || [],
                  category: matchedDesig?.category || '',
                  subcategory: matchedDesig?.subcategory || '',
                };
              }
              // If no match, return the original item
              return item;
            })
        );
      }
      // setAddQuaTodo(response?.data?.suser?.addAddQuaTodo);
      // setWorkhistTodo(response?.data?.suser?.workhistTodo);
      setIsValidEmail(validateEmail(response?.data?.suser?.email));
      setSelectedCompany(response?.data?.suser?.boardingLog[0]?.company);
      setSelectedBranch(response?.data?.suser?.boardingLog[0]?.branch);
      setSelectedUnit(response?.data?.suser?.boardingLog[0]?.unit);
      fetchDptDesignation(response?.data?.suser?.departmentlog[0]?.department);

      setSelectedDesignation(response?.data?.suser?.designationlog[0]?.designation);
      setSelectedTeam(response?.data?.suser?.boardingLog[0]?.team);
      setEnableWorkstation(response?.data?.suser?.enableworkstation);

      // setSelectedOptionsWorkStation(
      //   Array.isArray(response?.data?.suser?.boardingLog[0]?.workstation)
      //     ? response?.data?.suser?.workstation
      //         .slice(
      //           1,
      //           response?.data?.suser?.boardingLog[0]?.workstation?.length
      //         )
      //         ?.map((x) => ({
      //           ...x,
      //           label: x,
      //           value: x,
      //         }))
      //     : []
      // );
      setSelectedOptionsCate(
        Array.isArray(response?.data?.suser?.boardingLog[0]?.weekoff)
          ? response?.data?.suser?.boardingLog[0]?.weekoff?.map((x) => ({
              ...x,
              label: x,
              value: x,
            }))
          : []
      );
      setEmployee({
        ...savedEmployee,
        attOptions,
        paddresstype: savedEmployee?.paddresstype ? savedEmployee?.paddresstype : '',
        ppersonalprefix: savedEmployee?.ppersonalprefix ? savedEmployee?.ppersonalprefix : '',
        presourcename: savedEmployee?.presourcename ? savedEmployee?.presourcename : '',
        plandmarkandpositionalprefix: savedEmployee?.plandmarkandpositionalprefix ? savedEmployee?.plandmarkandpositionalprefix : '',
        pgpscoordination: savedEmployee?.pgpscoordination ? savedEmployee?.pgpscoordination : '',
        caddresstype: savedEmployee?.caddresstype ? savedEmployee?.caddresstype : '',
        cpersonalprefix: savedEmployee?.cpersonalprefix ? savedEmployee?.cpersonalprefix : '',
        cresourcename: savedEmployee?.cresourcename ? savedEmployee?.cresourcename : '',
        clandmarkandpositionalprefix: savedEmployee?.clandmarkandpositionalprefix ? savedEmployee?.clandmarkandpositionalprefix : '',
        cgpscoordination: savedEmployee?.cgpscoordination ? savedEmployee?.cgpscoordination : '',
        pgenerateviapincode: Boolean(savedEmployee?.pgenerateviapincode) || false,
        pvillageorcity: savedEmployee?.pvillageorcity || '',
        pdistrict: savedEmployee?.pdistrict || '',
        cgenerateviapincode: Boolean(savedEmployee?.cgenerateviapincode) || false,
        cvillageorcity: savedEmployee?.cvillageorcity || '',
        cdistrict: savedEmployee?.cdistrict || '',
        prod: isProd,
        profileimage: savedEmployee?.profileimage === 'null' || !savedEmployee?.profileimage ? '' : savedEmployee?.profileimage,
        company: response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.company : response?.data?.suser?.company,
        branch: response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.branch : response?.data?.suser?.branch,
        unit: response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.unit : response?.data?.suser?.unit,
        team: response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.team : response?.data?.suser?.team,
        floor: response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.floor : response?.data?.suser?.floor,
        area: response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.area : response?.data?.suser?.area,
        workstation: response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.workstation : response?.data?.suser?.workstation,
        shifttype: response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.shifttype : response?.data?.suser?.shifttype,
        shiftgrouping: response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.shiftgrouping : response?.data?.suser?.shiftgrouping,
        shifttiming: response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0]?.shifttiming : response?.data?.suser?.shifttiming,
        department: response?.data?.suser?.departmentlog?.length > 0 ? response?.data?.suser?.departmentlog[0]?.department : response?.data?.suser?.department,
        designation: response?.data?.suser?.designationlog?.length > 0 ? response?.data?.suser?.designationlog[0]?.designation : response?.data?.suser?.designation,
        process: response?.data?.suser?.processlog[0]?.process ? response?.data?.suser?.processlog[0]?.process : response?.data?.suser?.process,
        processtype: response?.data?.suser?.processlog[0]?.processtype ? response?.data?.suser?.processlog[0]?.processtype : response?.data?.suser?.processtype,
        processduration: response?.data?.suser?.processlog[0]?.processduration ? response?.data?.suser?.processlog[0]?.processduration : response?.data?.suser?.processduration,
        time: response?.data?.suser?.processlog[0]?.time ? response?.data?.suser?.processlog[0]?.time : response?.data?.suser?.time,
        timemins: response?.data?.suser?.processlog[0]?.timemins ? response?.data?.suser?.processlog[0]?.timemins : response?.data?.suser?.timemins,
        assignExpMode: response?.data?.suser?.assignExpLog[0]?.expmode ? response?.data?.suser?.assignExpLog[0]?.expmode : response?.data?.suser?.assignExpMode,
        assignExpvalue: response?.data?.suser?.assignExpLog[0]?.expval ? response?.data?.suser?.assignExpLog[0]?.expval : response?.data?.suser?.assignExpvalue,
        endexp: response?.data?.suser?.assignExpLog[0]?.endexp ? response?.data?.suser?.assignExpLog[0]?.endexp : response?.data?.suser?.endexp,
        endexpdate: response?.data?.suser?.assignExpLog[0]?.endexpdate ? response?.data?.suser?.assignExpLog[0]?.endexpdate : response?.data?.suser?.endexpdate,
        endtar: response?.data?.suser?.assignExpLog[0]?.endtar ? response?.data?.suser?.assignExpLog[0]?.endtar : response?.data?.suser?.endtar,
        endtardate: response?.data?.suser?.assignExpLog[0]?.endtardate ? response?.data?.suser?.assignExpLog[0]?.endtardate : response?.data?.suser?.endtardate,
        updatedate: response?.data?.suser?.assignExpLog[0]?.updatedate ? response?.data?.suser?.assignExpLog[0]?.updatedate : response?.data?.suser?.doj,
        empcode: savedEmployee.wordcheck === true ? '' : savedEmployee.empcode,
        ifoffice: boardFirstLog?.workstationofficestatus || response?.data?.suser?.workstationofficestatus,
        workmode: boardFirstLog?.workmode || response?.data?.suser?.workmode,
        workstationinput: boardFirstLog?.workstationinput || response?.data?.suser?.workstationinput,
        bankname: 'ICICI BANK - ICICI',
        accountstatus: 'In-Active',
        panstatus: savedEmployee?.panno ? 'Have PAN' : savedEmployee?.panrefno ? 'Applied' : 'Yet to Apply',
        age: calculateAge(savedEmployee?.dob),
        callingname: savedEmployee?.callingname === '' ? (savedEmployee?.firstname?.includes(' ') ? savedEmployee?.firstname?.split(' ')[0] : savedEmployee?.firstname) : savedEmployee?.callingname,
      });

      //permananet addresss
      if (savedEmployee?.pgenerateviapincode && savedEmployee?.ppincode !== '') {
        const result = await getPincodeDetails(savedEmployee?.ppincode);
        if (result?.status === 'Success' && result?.data?.length > 0) {
          setFromPinCodep(result?.data);
        } else {
          setFromPinCodep([]);
        }
      }
      if (savedEmployee?.cgenerateviapincode && savedEmployee?.cpincode !== '') {
        const result = await getPincodeDetails(savedEmployee?.cpincode);
        if (result?.status === 'Success' && result?.data?.length > 0) {
          setFromPinCodec(result?.data);
        } else {
          setFromPinCodec([]);
        }
      }

      setEmployeecodenew(savedEmployee.wordcheck === true ? savedEmployee.empcode : '');
      setCheckcode(savedEmployee.wordcheck);

      setValueCate(response?.data?.suser?.boardingLog[0]?.weekoff);
      setOldData({
        ...oldData,
        empcode: response?.data?.suser?.empcode,
        company: response?.data?.suser?.boardingLog[0]?.company,
        unit: response?.data?.suser?.boardingLog[0]?.unit,
        branch: response?.data?.suser?.boardingLog[0]?.branch,
        team: response?.data?.suser?.boardingLog[0]?.team,
      });
      setIsLoading(false);
    } catch (err) {
      console.log(err, 'errerrr');
      setIsLoading(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Designation Dropdowns
  const fetchDptDesignation = async (value) => {
    try {
      let req = await axios.get(SERVICE.DEPARTMENTANDDESIGNATIONGROUPING, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let result = req?.data?.departmentanddesignationgroupings.filter((data, index) => {
        return value === data.department;
      });
      setDesignation(result);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [designationsFileNames, setDesignationsFileNames] = useState([]);
  const [fileNames, setfileNames] = useState('Please Select File Name');

  // Designation Dropdowns
  const fetchDesignation = async () => {
    setDesignation(alldesignation);
  };

  const fetchEditareaNames = async (singlecompany, singlebranch, singlefloor) => {
    try {
      let req = await axios.post(SERVICE.MANPOWERAREAFILTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: String(singlecompany),
        floor: String(singlefloor),
        branch: String(singlebranch),
      });

      let result = req?.data?.allareas
        ?.map((item) => {
          return item.area.map((data) => {
            return data;
          });
        })
        .flat();

      setAreaNames(result);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Unit Dropdowns
  const fetchUnitNames = async () => {
    try {
      let req = await axios.get(SERVICE.UNIT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setUnitNames(req.data.units);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  //SkillSet DropDowns

  const fetchSkillSet = async () => {
    try {
      let req = await axios.get(SERVICE.SKILLSET, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setSkillSet(
        req.data.skillsets?.length > 0 &&
          req.data.skillsets.map((d) => ({
            ...d,
            label: d.name,
            value: d.name,
          }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  useEffect(() => {
    const loadModels = async () => {
      const modelUrl = SERVICE.FACEDETECTLOGINMODEL;

      await faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl);
      await faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl);
      await faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl);
    };
    loadModels();
    console.log(window.location.origin, 'window.location.origin');
  }, []);
  // Image Upload
  const [btnUpload, setBtnUpload] = useState(false);

  const [isErrorOpenpop, setIsErrorOpenpop] = useState(false);
  const [showDupProfileVIsitor, setShowDupProfileVIsitor] = useState([]);
  const handleClickOpenerrpop = () => {
    setIsErrorOpenpop(true);
  };
  const handleCloseerrpop = () => {
    setIsErrorOpenpop(false);
  };
  const UploadWithDuplicate = (e) => {
    setShowDupProfileVIsitor([]);
    handleCloseerrpop();
  };
  const UploadWithoutDuplicate = (e) => {
    setEmployee({
      ...employee,
      profileimage: '',
      faceDescriptor: [],
    });
    setShowDupProfileVIsitor([]);
    handleCloseerrpop();
  };
  // Image Upload
  const resizeImageKeepFormat = (base64, targetWidth, targetHeight) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const width = targetWidth || img.width;
        const height = targetHeight || img.height;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const scale = Math.min(width / img.width, height / img.height);
        const x = width / 2 - (img.width * scale) / 2;
        const y = height / 2 - (img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // keep same format as original base64
        const mimeType = base64.substring(base64.indexOf(':') + 1, base64.indexOf(';'));

        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }, mimeType);
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = base64;
    });
  };

  async function handleChangeImage(e) {
    setBtnUpload(true); // Enable loader when the process starts
    const maxFileSize = 1 * 1024 * 1024; // 1MB in bytes

    const file = e.target.files[0];
    if (!file) return;

    const sizeInMB = file.size / (1024 * 1024);

    // ✅ 1. File size restriction
    if (sizeInMB > (overllsettings?.filesize || 1)) {
      setPopupContentMalert(`Image size exceeds ${overllsettings?.filesize || 1} MB`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
      setBtnUpload(false);
      return;
    }

    const path = URL.createObjectURL(file);
    const image = new Image();
    image.src = path;

    image.onload = async () => {
      try {
        const detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();

        if (detections.length > 0) {
          const faceDescriptor = detections[0].descriptor;

          const response = await axios.post(`${SERVICE.DUPLICATECANDIDATEFACEDETECTVISITOR}`, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            id: newId,
            faceDescriptor: Array.from(faceDescriptor),
          });

          // ✅ Convert file to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            let resizedBase64 = reader.result;

            // ✅ 2. Resize image (based on overllsettings values for width & height)
            if (overllsettings?.dimensionswidth || overllsettings?.height) {
              resizedBase64 = await resizeImageKeepFormat(reader.result, overllsettings?.dimensionswidth || image.width, overllsettings?.height || image.height);
            }

            // ✅ 3. Save employee profile with resized image
            setEmployee({
              ...employee,
              profileimage: String(resizedBase64),
              faceDescriptor: Array.from(faceDescriptor),
            });

            if (response?.data?.matchfound) {
              setShowDupProfileVIsitor(response?.data?.matchedData);
              handleClickOpenerrpop();
            }

            // setImageUploaded(true);
          };
          reader.readAsDataURL(file);
        } else {
          setPopupContentMalert('No face detected.');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
        }
      } catch (error) {
        setPopupContentMalert('Error in face detection.');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } finally {
        setBtnUpload(false); // Disable loader when done
      }
    };

    image.onerror = () => {
      setPopupContentMalert('Error loading image.');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
      setBtnUpload(false);
    };
  }

  function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

  //image cropping
  const handleFileSelect = (acceptedFiles) => {
    setSelectedFile(URL.createObjectURL(acceptedFiles[0]));
  };

  const [image, setImage] = useState('');
  const handleCrop = () => {
    if (typeof cropperRef.current.cropper.getCroppedCanvas() === 'undefined') {
      return;
    }
    const croppedImageData = cropperRef.current.cropper.getCroppedCanvas().toDataURL();
    setCroppedImage(croppedImageData);

    // Convert the cropped image to a Blob (which is the image file format) before sending
    const base64Data = croppedImageData.split(',')[1]; // Get base64 data (without the prefix)
    const binaryData = atob(base64Data); // Decode base64 data
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    // Fill the array buffer with the decoded binary data
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }

    // Create a Blob from the binary data
    const blob = new Blob([uint8Array], { type: 'image/png' });
    setImage(blob);
    // setCroppedImage(cropperRef.current.cropper.getCroppedCanvas().toDataURL());
    setSelectedFile(null);
    // setGetImg(null);
    // handleChangeImage()
  };

  const handleClearImage = () => {
    setFile(null);
    setGetImg(null);
    setSelectedFile(null);
    setCroppedImage(null);
    setEmployee({ ...employee, profileimage: '', faceDescriptor: [] });
    setImage('');
  };
  const handleWebcamImage = () => {
    setwebFile(null);
  };

  const [color, setColor] = useState('#FFFFFF');
  const [bgbtn, setBgbtn] = useState(false);
  const handleColorChange = (e) => {
    setColor(e.target.value);
  };
  const handleSubmit = async () => {
    setBgbtn(true);
    if (!image || !color) return;

    const formData = new FormData();
    formData.append('image', image);
    formData.append('color', color);

    try {
      const response = await axios.post(SERVICE.REMOVEBG, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCroppedImage(response?.data?.image); // Set the base64 image
      setBgbtn(false);
    } catch (error) {
      setBgbtn(false);
      console.error('Error uploading image:', error);
    }
  };

  const isLightColor = calculateLuminance(color);

  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };
  const [getbranchname, setgetbranchname] = useState('');
  let branchname = getbranchname ? setgetbranchname : employee.company;

  // Branch Dropdowns
  const fetchbranchNames = async () => {
    try {
      let req = await axios.get(SERVICE.BRANCH, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setBranchNames(req.data.branch);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Floor Dropdowns
  const fetchfloorNames = async () => {
    try {
      setFloorNames(
        allfloor.map((d) => ({
          ...d,
          label: d.name,
          value: d.name,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Floor Dropdowns
  const fetchUsernames = async () => {
    try {
      const aggregationPipeline = [
        {
          $project: {
            username: 1,
            empcode: 1,
            companyname: 1,
            company: 1,
            branch: 1,
            unit: 1,
            team: 1,
          },
        },
      ];

      let req = await axios.post(
        SERVICE.DYNAMICUSER_CONTROLLER,
        {
          aggregationPipeline,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setrepotingtonames(req.data.users);
      setAllUsersLoginName(req?.data?.users?.filter((item) => item._id !== id)?.map((user) => user.username));
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Departments Dropdowns
  const fetchDepartments = async () => {
    try {
      setDepartment(
        alldepartment.map((d) => ({
          ...d,
          label: d.deptname,
          value: d.deptname,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Team Dropdowns
  const fetchteamdropdowns = async () => {
    try {
      setTeam(allTeam);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Shift Dropdowns
  const fetchShiftDropdowns = async () => {
    try {
      let req = await axios.get(SERVICE.SHIFT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setShiftTiming(
        req.data.shifts?.length > 0 &&
          req.data.shifts.map((d) => ({
            ...d,
            label: d.name,
            value: d.name,
          }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [name, setUserNameEmail] = useState('');
  const [reportingtonames, setreportingtonames] = useState([]);
  // User Name Functionality
  const fetchUserName = async () => {
    try {
      const aggregationPipeline = [
        {
          $project: {
            username: 1,
            empcode: 1,
            companyname: 1,
          },
        },
      ];
      let req = await axios.post(
        SERVICE.DYNAMICUSER_CONTROLLER,
        {
          aggregationPipeline,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      // setreportingtonames(req.data.users);
      req.data.users.filter((data) => {
        if (data._id !== id) {
          if (first + second === data.username) {
            setThird(first + second.slice(0, 1) + new Date(employee.dob ? employee.dob : '').getDate());
            setUserNameEmail(first + second.slice(0, 1) + new Date(employee.dob ? employee.dob : '').getDate());
          } else if (first + second + new Date(employee.dob).getDate() == data.username) {
            setThird(first + second.slice(0, 1) + new Date(employee.dob ? employee.dob : '').getMonth());
            setUserNameEmail(first + second.slice(0, 1) + new Date(employee.dob ? employee.dob : '').getMonth());
          } else if (first + second.slice(0, 1) === data.username) {
            setThird(first + second.slice(0, 2));
            setUserNameEmail(first + second.slice(0, 2));
          } else if (first + second.slice(0, 2) === data.username) {
            setThird(first + second.slice(0, 3));
            setUserNameEmail(first + second.slice(0, 3));
          }
        }
      });
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const fetchSuperVisorDropdowns = async (team, user) => {
    let res = await axios.post(SERVICE.HIERARCHY_REPORTING_TO, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      team: team,
      company: user?.company,
      branch: user?.branch,
      unit: user?.unit,
    });

    const resultUsers = res?.data?.result?.length > 0 ? res?.data?.result[0]?.result?.supervisorchoose?.filter((data) => data !== user?.companyname) : [];
    setreportingtonames(resultUsers);
  };
  //webcam

  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [getImg, setGetImg] = useState(null);
  const [refImage, setRefImage] = useState([]);
  const [previewURL, setPreviewURL] = useState(null);
  const [refImageDrag, setRefImageDrag] = useState([]);
  const [valNum, setValNum] = useState(0);
  const [isWebcamCapture, setIsWebcamCapture] = useState(false);
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
  const closeWebCam = () => {
    setEmployee((prev) => ({ ...prev, profileimage: '', faceDescriptor: [] }));
    setGetImg(null);
  };

  //add webcamera popup
  const showWebcam = () => {
    webcamOpen();
  };
  //id for login

  let loginid = localStorage.LoginUserId;
  //get user row  edit  function
  const getusername = async () => {
    try {
      let res = await axios.get(`${SERVICE.USER}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let user =
        res.data.users?.length > 0 &&
        res.data.users.filter((data) => {
          if (loginid === data?._id) {
            setUsernameaddedby(data?.username);
            return data;
          }
        });
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //change form
  const handlechangecontactpersonaledit = (e) => {
    // Regular expression to match only positive numeric values
    const regex = /^[0-9]+$/; // Only allows positive integers
    // const regex = /^\d*\.?\d*$/;
    const inputValue = e?.target?.value?.slice(0, 10);
    // Check if the input value matches the regex or if it's empty (allowing backspace)
    if (regex.test(inputValue) || inputValue === '') {
      // Update the state with the valid numeric value
      setEmployee({ ...employee, contactpersonal: inputValue });
    }
  };

  const handlechangecontactfamilyedit = (e) => {
    // Regular expression to match only positive numeric values
    const regex = /^[0-9]+$/; // Only allows positive integers
    // const regex = /^\d*\.?\d*$/;
    const inputValue = e?.target?.value?.slice(0, 10);
    // Check if the input value matches the regex or if it's empty (allowing backspace)
    if (regex.test(inputValue) || inputValue === '') {
      // Update the state with the valid numeric value
      setEmployee({ ...employee, contactfamily: inputValue });
    }
  };

  const handlechangeemergencynoeditedit = (e) => {
    // Regular expression to match only positive numeric values
    const regex = /^[0-9]+$/; // Only allows positive integers
    // const regex = /^\d*\.?\d*$/;
    const inputValue = e?.target?.value?.slice(0, 10);
    // Check if the input value matches the regex or if it's empty (allowing backspace)
    if (regex.test(inputValue) || inputValue === '') {
      // Update the state with the valid numeric value
      setEmployee({ ...employee, emergencyno: inputValue });
    }
  };

  const handlechangeaadharedit = (e) => {
    // Regular expression to match only positive numeric values
    const regex = /^[0-9]+$/; // Only allows positive integers
    // const regex = /^\d*\.?\d*$/;
    const inputValue = e?.target?.value?.slice(0, 12);
    // Check if the input value matches the regex or if it's empty (allowing backspace)
    if (regex.test(inputValue) || inputValue === '') {
      // Update the state with the valid numeric value
      setEmployee({ ...employee, aadhar: inputValue });
    }
  };

  const [referenceTodo, setReferenceTodo] = useState([]);
  const [referenceTodoError, setReferenceTodoError] = useState({});
  const [singleReferenceTodo, setSingleReferenceTodo] = useState({
    name: '',
    relationship: '',
    occupation: '',
    contact: '',
    details: '',
  });

  const addReferenceTodoFunction = () => {
    const isNameMatch = referenceTodo?.some((item) => item.name?.trim()?.toLowerCase() === singleReferenceTodo.name?.trim()?.toLowerCase());
    const newErrorsLog = {};

    if (singleReferenceTodo.name === '') {
      newErrorsLog.name = <Typography style={{ color: 'red' }}>Name must be required</Typography>;
    } else if (isNameMatch) {
      newErrorsLog.duplicate = <Typography style={{ color: 'red' }}>Reference Already Exist!</Typography>;
    }

    if (singleReferenceTodo.contact !== '' && singleReferenceTodo.contact?.length !== 10) {
      newErrorsLog.contactno = <Typography style={{ color: 'red' }}>Contack No must be 10 digits required</Typography>;
    }
    if (singleReferenceTodo !== '' && Object.keys(newErrorsLog)?.length === 0) {
      setReferenceTodo([...referenceTodo, singleReferenceTodo]);
      setSingleReferenceTodo({
        name: '',
        relationship: '',
        occupation: '',
        contact: '',
        details: '',
      });
    }
    setReferenceTodoError(newErrorsLog);
  };
  const deleteReferenceTodo = (index) => {
    const newTasks = [...referenceTodo];
    newTasks.splice(index, 1);
    setReferenceTodo(newTasks);
    // handleCloseMod();
  };

  const handlechangereferencecontactno = (e) => {
    // Regular expression to match only positive numeric values
    const regex = /^[0-9]+$/; // Only allows positive integers
    // const regex = /^\d*\.?\d*$/;
    const inputValue = e.target.value?.slice(0, 10);
    // Check if the input value matches the regex or if it's empty (allowing backspace)
    if (regex.test(inputValue) || inputValue === '') {
      setSingleReferenceTodo({ ...singleReferenceTodo, contact: inputValue });
    }
  };

  const handlechangecpincode = (e) => {
    // Regular expression to match only positive numeric values
    const regex = /^[0-9]+$/; // Only allows positive integers
    // const regex = /^\d*\.?\d*$/;
    const inputValue = e?.target?.value?.slice(0, 6);
    // Check if the input value matches the regex or if it's empty (allowing backspace)
    if (regex.test(inputValue) || inputValue === '') {
      // Update the state with the valid numeric value
      setEmployee({ ...employee, cpincode: inputValue });
    }
  };
  const handlechangeppincode = (e) => {
    // Regular expression to match only positive numeric values
    const regex = /^[0-9]+$/; // Only allows positive integers
    // const regex = /^\d*\.?\d*$/;
    const inputValue = e?.target?.value?.slice(0, 6);
    // Check if the input value matches the regex or if it's empty (allowing backspace)
    if (regex.test(inputValue) || inputValue === '') {
      // Update the state with the valid numeric value
      setEmployee({ ...employee, ppincode: inputValue });
    }
  };

  const [fromPinCodep, setFromPinCodep] = useState([]);
  const [fromPinCodec, setFromPinCodec] = useState([]);

  const handleLocationSuccessp = (postOffices) => {
    console.log('Success:', postOffices);

    // You can now use postOffices[0].name, .state, .country, etc.
    setFromPinCodep(postOffices);
    setSelectedStatep({
      name: postOffices?.length > 0 ? postOffices[0]?.State : '',
      countryCode: '',
      isoCode: '',
    });
    setSelectedCityp('');
    setEmployee((prevSupplier) => ({
      ...prevSupplier,
      pstate: postOffices?.length > 0 ? postOffices[0]?.State : '',
      pdistrict: postOffices?.length > 0 ? postOffices[0]?.District : '',
      pvillageorcity: '',
      pcity: '',
    }));
  };
  const handleLocationSuccessc = (postOffices) => {
    console.log('Success:', postOffices);

    // You can now use postOffices[0].name, .state, .country, etc.
    setFromPinCodec(postOffices);
    setSelectedStatec({
      name: postOffices?.length > 0 ? postOffices[0]?.State : '',
      countryCode: '',
      isoCode: '',
    });
    setSelectedCityc('');
    setEmployee((prevSupplier) => ({
      ...prevSupplier,
      cstate: postOffices?.length > 0 ? postOffices[0]?.State : '',
      cdistrict: postOffices?.length > 0 ? postOffices[0]?.District : '',
      cvillageorcity: '',
      ccity: '',
    }));
  };

  useEffect(() => {
    setEmployee((prev) => ({ ...prev, profileimage: getImg }));
  }, [getImg]);
  // let capture = isWebcamCapture == true ? getImg : croppedImage;

  let final = croppedImage ? croppedImage : employee.profileimage;

  const handleCompanyChange = (event) => {
    const selectedCompany = event.value;
    setSelectedCompany(selectedCompany);
    setSelectedBranch('');
    setSelectedUnit('');
    setSelectedTeam('');
    setAreaNames([]);
    setEmployee({ ...employee, floor: '', area: '' });
    setPrimaryWorkStation('Please Select Primary Work Station');
    setPrimaryWorkStationLabel('Please Select Primary Work Station');
    setWorkstationTodoList([]);
    setSelectedOptionsWorkStation([]);
    setValueWorkStation([]);
  };

  const handleBranchChange = (event) => {
    const selectedBranch = event.value;
    const branchCode = filteredBranches.filter((item) => item.name === event.value);
    setSelectedBranchCode(branchCode[0]?.code.slice(0, 2));
    setSelectedBranch(selectedBranch);
    setSelectedUnit('');
    setSelectedTeam('');
    setAreaNames([]);
    setEmployee({ ...employee, floor: '', area: '' });
    setPrimaryWorkStation('Please Select Primary Work Station');
    setPrimaryWorkStationLabel('Please Select Primary Work Station');
    setWorkstationTodoList([]);
    setSelectedOptionsWorkStation([]);
    setValueWorkStation([]);
  };

  const handleUnitChange = (event) => {
    const selectedUnit = event.value;
    const unitCode = filteredUnits.filter((item) => item.name === event.value);
    setSelectedUnitCode(unitCode[0]?.code.slice(0, 2));
    setSelectedUnit(selectedUnit);
    setSelectedTeam('');
    setPrimaryWorkStation('Please Select Primary Work Station');
    setPrimaryWorkStationLabel('Please Select Primary Work Station');
    setWorkstationTodoList([]);
    setSelectedOptionsWorkStation([]);
    setValueWorkStation([]);
  };

  const handleTeamChange = (event) => {
    const selectedTeam = event.value;
    setSelectedTeam(selectedTeam);
    fetchSuperVisorDropdowns(selectedTeam, oldUserCompanyname);
    setEmployee((prev) => ({
      ...prev,
      reportingto: '',
    }));
  };

  const [roles, setRoles] = useState([]);

  const fetchDesignationgroup = async (e) => {
    try {
      let res_designationgroup = await axios.get(SERVICE.DESIGNATIONGRP, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let getGroupName = alldesignation
        .filter((data) => {
          return data.name === e.value;
        })
        .map((item) => item.group);

      let getRoles = res_designationgroup?.data?.desiggroup
        ?.filter((data) => {
          return getGroupName.includes(data.name);
        })
        .flatMap((data) => data.roles);

      let uniqueRoles = [...new Set(getRoles)];
      setRoles(uniqueRoles);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleDesignationChange = async (event) => {
    const selectedDesignation = event.value;
    setSelectedDesignation(selectedDesignation);
    fetchDesignationgroup(event);

    const groupname = alldesignation?.find((data) => data.name === selectedDesignation);

    setDesignationGroup(groupname ? groupname?.group : '');
    let count = event?.systemcount;
    setEmployee((prev) => ({
      ...prev,
      employeecount: count,
    }));

    setMaxSelections(maxWfhSelections + Number(count));

    setPrimaryWorkStation('Please Select Primary Work Station');
    setPrimaryWorkStationLabel('Please Select Primary Work Station');
    setWorkstationTodoList([]);
    setSelectedOptionsWorkStation([]);
    setValueWorkStation([]);
  };

  const filteredBranches = branchNames?.filter((b) => b.company === selectedCompany);

  const filteredUnits = unitNames?.filter((u) => u.branch === selectedBranch);

  const filteredTeams = team?.filter((t) => t.unit === selectedUnit && t.branch === selectedBranch && t.department === employee.department);

  useEffect(() => {
    fetchfloorNames();
    fetchDepartments();
    fetchteamdropdowns();
    fetchShiftDropdowns();
    fetchWorkStation();
    fetchDesignation();
    fetchSkillSet();
    fetchHandlerEdit();
    fetchUsernames();
    fetchDepartmentMonthsets();
    fetchCategoryEducation();
  }, []);

  useEffect(() => {
    ShiftGroupingDropdwons();
    getusername();
  }, []);

  useEffect(() => {
    fetchbranchNames();
    fetchUnitNames();
  }, [branchname]);

  useEffect(() => {
    ShowErrMess();
    fetchUserName();
    setThird(first + second.slice(0, 1));
    setUserNameEmail(first + second.slice(0, 1));
  }, [first, second, name]);

  //ERROR MESSAGESE
  const ShowErrMess = () => {
    if (first?.length == '' || second?.length == 0) {
      setErrmsg('Unavailable');
    } else if (third?.length >= 1) {
      setErrmsg('Available');
    }
  };

  const fetchareaNames = async (e) => {
    try {
      let req = await axios.post(SERVICE.MANPOWERAREAFILTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: String(selectedCompany),
        floor: String(e),
        branch: String(selectedBranch),
      });

      let result = req?.data?.allareas
        ?.map((item) => {
          return item.area.map((data) => {
            return data;
          });
        })
        .flat();

      setAreaNames(result);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const isImages = (fileName) => {
    return /\.png$/i.test(fileName);
  };

  const isImage = (fileName) => {
    return /\.jpeg$|\.jpg$/i.test(fileName);
  };

  const isPdf = (fileName) => {
    return /\.pdf$/i.test(fileName);
  };

  const isExcel = (fileName) => {
    return /\.xlsx?$/i.test(fileName);
  };

  function isTxt(fileName) {
    return /\.txt$/.test(fileName);
  }

  let conditions = [
    employee.prefix !== '',
    employee.firstname !== '',
    employee.lastname !== '',
    employee.legalname !== '',
    employee.callingname !== '',
    employee.fathername !== '',
    employee.mothername !== '',
    employee.gender !== '',
    employee.maritalstatus !== '',
    employee.maritalstatus === 'Married' && employee.dom !== '' && employee.dob !== '',
    employee.bloodgroup !== '',
    employee.religion !== '',
    employee.profileimage !== '',
    employee.location !== '',
    employee.email !== '',
    employee.contactpersonal !== '',
    employee.contactfamily !== '',
    employee.emergencyno !== '',
    employee.doj !== '',
    employee.dot !== '',
    employee.aadhar !== '',
    employee.panno !== '',

    employee.contactno !== '',
    employee.details !== '',

    employee.username !== '',
    employee.password !== '',
    employee.companyname !== '',

    employee.company !== '',
    employee.branch !== '',
    employee.unit !== '',
    employee.floor !== '',
    employee.department !== '',
    employee.team !== '',
    employee.designation !== '',
    employee.shifttiming !== '',
    employee.reportingto !== '',
    employee.empcode !== '',

    employee.pdoorno !== '',
    employee.pstreet !== '',
    employee.parea !== '',
    employee.plandmark !== '',
    employee.ptaluk !== '',
    employee.ppincode !== '',
    employee.ppost !== '',
    selectedCountryp !== '',
    selectedStatep !== '',
    selectedCityp !== '',
    !employee.samesprmnt ? employee.cdoorno : employee.pdoorno !== '',
    !employee.samesprmnt ? employee.cstreet : employee.pstreet !== '',
    !employee.samesprmnt ? employee.carea : employee.parea !== '',
    !employee.samesprmnt ? employee.clandmark : employee.plandmark !== '',
    !employee.samesprmnt ? employee.ctaluk : employee.ptaluk !== '',
    !employee.samesprmnt ? employee.cpost : employee.ppost !== '',
    !employee.samesprmnt ? employee.cpincode : employee.ppincode !== '',

    files?.length > 0,
    addAddQuaTodo?.length > 0,
    eduTodo?.length > 0,
    workhistTodo?.length > 0,
  ];

  const result = conditions.reduce(
    (acc, val) => {
      acc[val]++;
      return acc;
    },
    { true: 0, false: 0 }
  );

  const totalFields = 61;
  const filledFields = Object.values(employee).filter((value) => value !== '')?.length;

  const completionPercentage = (result.true / totalFields) * 100;

  //branch updatedby edit page....
  let updateby = employee.updatedby;
  const [roleDatas, setRoleDatas] = useState({
    modulename: [],
    submodulename: [],
    mainpagename: [],
    subpagename: [],
    subsubpagename: [],
    modulenameurl: [],
    submodulenameurl: [],
    mainpagenameurl: [],
    subpagenameurl: [],
    subsubpagenameurl: [],
  });
  const getRolesDatas = async () => {
    try {
      // Fetch roles data
      let { data: rolesdatas } = await axios.get(SERVICE.ROLE);

      if (!rolesdatas?.roles) return;

      // Filter and map required fields
      let filteredDatas = rolesdatas.roles.filter((data) => roles.includes(data?.name));

      const [modulename, submodulename, mainpagename, subpagename, subsubpagename] = ['modulename', 'submodulename', 'mainpagename', 'subpagename', 'subsubpagename'].map((key) => Array.from(new Set(filteredDatas.flatMap((item) => item[key] || []))));

      const roleGroupedData = {};

      // Group filteredDatas by rolename
      filteredDatas.forEach((item) => {
        const role = item.name;
        if (!roleGroupedData[role]) {
          roleGroupedData[role] = [];
        }
        roleGroupedData[role].push(item);
      });

      const finalRoleDatas = {};

      // Process each role group separately
      Object.entries(roleGroupedData).forEach(([role, dataGroup]) => {
        const [modulename, submodulename, mainpagename, subpagename, subsubpagename] = ['modulename', 'submodulename', 'mainpagename', 'subpagename', 'subsubpagename'].map((key) => Array.from(new Set(dataGroup.flatMap((item) => item[key] || []))));

        let modulenameurl = [];
        let submodulenameurl = [];
        let mainpagenameurl = [];
        let subpagenameurl = [];
        let subsubpagenameurl = [];

        menuItems?.forEach((data) => {
          if (modulename.includes(data?.title)) {
            if (data?.submenu?.length > 0) {
              data?.submenu.forEach((data1) => {
                if (submodulename.includes(data1?.title)) {
                  modulenameurl.push(data1.url);
                  submodulenameurl.push(data1.url);

                  if (data1?.submenu?.length > 0) {
                    data1?.submenu.forEach((data2) => {
                      if (mainpagename.includes(data2?.title)) {
                        modulenameurl.push(data2.url);
                        submodulenameurl.push(data2.url);
                        mainpagenameurl.push(data2.url);

                        if (data2?.submenu?.length > 0) {
                          data2?.submenu.forEach((data3) => {
                            if (subpagename.includes(data3?.title)) {
                              modulenameurl.push(data3.url);
                              submodulenameurl.push(data3.url);
                              mainpagenameurl.push(data3.url);
                              subpagenameurl.push(data3.url);

                              if (data3?.submenu?.length > 0) {
                                data3?.submenu.forEach((data4) => {
                                  if (subsubpagename.includes(data4?.title)) {
                                    modulenameurl.push(data4.url);
                                    submodulenameurl.push(data4.url);
                                    mainpagenameurl.push(data4.url);
                                    subpagenameurl.push(data4.url);
                                    subsubpagenameurl.push(data4.url);
                                  }
                                });
                              }
                            }
                          });
                        }
                      }
                    });
                  }
                }
              });
            }
          }
        });

        // Clean URL arrays
        modulenameurl = modulenameurl.filter((url) => url);
        submodulenameurl = submodulenameurl.filter((url) => url);
        mainpagenameurl = mainpagenameurl.filter((url) => url);
        subpagenameurl = subpagenameurl.filter((url) => url);
        subsubpagenameurl = subsubpagenameurl.filter((url) => url);

        // Assign per-role processed data
        finalRoleDatas[role] = {
          modulename,
          submodulename,
          mainpagename,
          subpagename,
          subsubpagename,
          modulenameurl,
          submodulenameurl,
          mainpagenameurl,
          subpagenameurl,
          subsubpagenameurl,
        };
      });
      console.log(finalRoleDatas, 'finalRoleDatas');
      // Optional: set in state if needed
      setRoleDatas(finalRoleDatas);
    } catch (error) {
      console.error('Error fetching roles data:', error);
    }
  };

  useEffect(() => {
    getRolesDatas();
  }, [roles]);
  //Add employee details to the database
  const getValidTodos = (todoscheck, categoryDocument) => {
    if (!Array.isArray(todoscheck) || !Array.isArray(categoryDocument)) return [];

    // Group todoscheck by category + subcategory
    const grouped = {};
    for (const item of todoscheck) {
      const key = `${item.category}___${item.subcategory}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    }

    const isValid = (item) => {
      console.log(item);
      if (!item || !item.status) return false;

      if (item.status === 'Pending' && (!item.deadlinedate || item.deadlinedate === '')) return false;

      if (item.status !== 'No Document' && (!item.pagemodeselected || item.pagemodeselected === '')) return false;

      if (item.status === 'No Document' && (!item.reason || item.reason.trim() === '')) return false;

      if (item.status === 'Uploaded' && !item.file && !item?.filename) return false;

      return true;
    };

    const result = [];

    for (const [key, group] of Object.entries(grouped)) {
      const [cat, sub] = key.split('___');

      const restrictionObj = categoryDocument.find((doc) => doc.categoryname === cat && doc.subcategoryname.includes(sub));

      const restriction = restrictionObj?.uploadrestriction;

      if (restriction === 'All') {
        const allValid = group.every(isValid);
        if (allValid) result.push(...group);
      } else if (restriction === 'Any One') {
        const anyValid = group.some(isValid);
        if (anyValid) {
          const validItems = group.filter(isValid);
          result.push(...validItems);
        }
      } else {
        // If no restriction found, skip all
        continue;
      }
    }
    console.log(result, 'result');

    return result;
  };
  const sendRequest = async () => {
    setLoading(true);
    let salarytable =
      salaryOption === 'Experience Based'
        ? [
            ...oldSalaryData,
            {
              movetolive: false,
              onboardas: 'Employee',
              salarystatus: salaryTableData?.salarystatus || '',
              basic: salaryTableData?.basic || 0,
              hra: salaryTableData?.hra || 0,
              conveyance: salaryTableData?.conveyance || 0,
              medicalallowance: salaryTableData?.medicalallowance || 0,
              productionallowance: salaryTableData?.productionallowance || 0,
              shiftallowance: salaryTableData?.shiftallowance || 0,
              grossmonthsalary: salaryTableData?.grossmonthsalary || 0,
              annualgrossctc: salaryTableData?.annualgrossctc || 0,
              otherallowance: salaryTableData?.otherallowance || 0,
              performanceincentive: salaryTableData?.performanceincentive || 0,

              file: tableImage || null,
            },
          ]
        : [
            ...oldSalaryData,
            {
              movetolive: false,
              onboardas: 'Employee',
              salarystatus: salaryTableData?.salarystatus || '',
              basic: salaryTableDataManual?.basic || 0,
              hra: salaryTableDataManual?.hra || 0,
              conveyance: salaryTableDataManual?.conveyance || 0,
              medicalallowance: salaryTableDataManual?.medicalallowance || 0,
              productionallowance: salaryTableDataManual?.productionallowance || 0,
              shiftallowance: salaryTableDataManual?.shiftallowance || 0,
              grossmonthsalary: salaryTableDataManual?.grossmonthsalary || 0,
              annualgrossctc: salaryTableDataManual?.annualgrossctc || 0,
              otherallowance: salaryTableDataManual?.otherallowance || 0,
              performanceincentive: salaryTableDataManual?.performanceincentive || 0,
              file: tableImageManual || null,
            },
          ];
    let primaryWork = ['please select primary workstation', 'select primary workstation', '', undefined, 'please select primary work station', 'select primary work station', 'primary workstation', 'primary work station', null].includes((primaryWorkStation || '').toLowerCase())
      ? null
      : primaryWorkStation;

    // Filter out falsy or null-like values from valueWorkStation
    let filteredValueWorkStation = (valueWorkStation || []).filter((item) => item && item !== '');

    // Build finalWorkStation
    let finalWorkStation;
    const shortnameArray = workstationTodoList?.length > 0 ? workstationTodoList?.map((data) => data?.shortname) : [];

    if (!primaryWork && filteredValueWorkStation.length === 0) {
      finalWorkStation = []; // case 1: both are empty
    } else if (!primaryWork && filteredValueWorkStation.length > 0) {
      finalWorkStation = [null, ...filteredValueWorkStation]; // case 2: only secondary has data
    } else {
      finalWorkStation = [primaryWork, ...filteredValueWorkStation]; // case 3: primary is valid
    }
    // departmentlog details
    const changeddptlog1st = departmentLog.slice(0, 1);
    const changedptlogwiout1st = departmentLog.slice(1);
    const finaldot = [
      {
        ...changeddptlog1st[0],
        userid: String(employee.wordcheck === true ? employeecodenew : employee.empcode),
        logeditedby: [],
        updateddatetime: String(new Date()),
        updatedusername: String(isUserRoleAccess.companyname),
        username: String(companycaps),
        department: String(employee.department),
        startdate: String(employee.doj),
        companyname: String(selectedCompany),
        branch: String(selectedBranch),
        unit: String(selectedUnit),
        team: String(selectedTeam),
        status: Boolean(employee.statuss),
      },
      ...changedptlogwiout1st,
    ];

    // designation log details
    const changeddeslog1st = designationLog.slice(0, 1);
    const changedeslogwiout1st = designationLog.slice(1);
    const finaldesignationlog = [
      {
        ...changeddeslog1st[0],
        logeditedby: [],
        updateddatetime: String(new Date()),
        updatedusername: String(isUserRoleAccess.companyname),
        designation: String(selectedDesignation),
        username: String(companycaps),
        companyname: String(selectedCompany),
        startdate: String(employee.doj),
        time: String(getCurrentTime()),
        branch: String(selectedBranch),
        unit: String(selectedUnit),
        team: String(selectedTeam),
      },
      ...changedeslogwiout1st,
    ];

    // boarding log details
    const changedboardlog1st = boardingLog.slice(0, 1);
    const changeboardinglogwiout1st = boardingLog.slice(1);
    const finalboardinglog = [
      {
        ...changedboardlog1st[0],
        username: companycaps,
        company: String(selectedCompany),
        startdate: String(employee.doj),
        time: moment().format('HH:mm'),
        branch: String(selectedBranch),
        unit: String(selectedUnit),
        team: String(selectedTeam),
        shifttype: String(employee.shifttype),
        shifttiming: String(employee.shifttiming),
        shiftgrouping: String(employee.shiftgrouping),
        weekoff: [...valueCate],
        todo: employee.shifttype === 'Standard' ? [] : [...todo],
        logeditedby: [],
        updateddatetime: String(new Date()),
        updatedusername: String(isUserRoleAccess.companyname),
        logcreation: String('user'),
        workstation: finalWorkStation,
        workstationshortname: shortnameArray,
        workstationinput: String(employee.workmode === 'Remote' || employee.ifoffice ? primaryWorkStationInput : ''),
        floor: String(employee.floor),
        area: String(employee.area),
        ischangecompany: true,
        ischangebranch: true,
        ischangeunit: true,
        ischangeteam: true,
        ischangefloor: true,
        ischangearea: true,
        ischangeworkstation: true,
        ischangeworkmode: true,
      },
      ...changeboardinglogwiout1st,
    ];

    // process log details
    const changedprocesslog1st = processLog.slice(0, 1);
    const changeprocesslogwiout1st = processLog.slice(1);
    const finalprocesslog = [
      {
        ...changedprocesslog1st[0],
        company: String(selectedCompany),
        branch: String(selectedBranch),
        unit: String(selectedUnit),
        team: String(selectedTeam),
        process: String(loginNotAllot.process === '' || loginNotAllot.process == undefined ? '' : loginNotAllot.process),
        processduration: String(loginNotAllot.processduration === '' || loginNotAllot.processduration == undefined ? '' : loginNotAllot.processduration),
        processtype: String(loginNotAllot.processtype === '' || loginNotAllot.processtype == undefined ? '' : loginNotAllot.processtype),

        date: String(employee.doj),
        time: `${loginNotAllot.time}:${loginNotAllot?.timemins}`,
        empname: String(companycaps),
        logeditedby: [],
        updateddatetime: String(new Date()),
        updatedusername: String(isUserRoleAccess.companyname),
      },
      ...changeprocesslogwiout1st,
    ];

    //Experience log
    const changedassignexplog1st = employee?.assignExpLog?.slice(0, 1);
    const changeassignexplogwiout1st = employee?.assignExpLog.slice(1);
    const finalassignexplog = [
      ...(employee?.assignExpLog.length > 0
        ? [
            {
              ...employee?.assignExpLog[0], // Spread the original object to maintain immutability
              // expmode: String(assignExperience.assignExpMode),
              // expval: String(assignExperience.assignExpvalue),

              // endexp: String(assignExperience.assignEndExpvalue),
              // endexpdate: assignExperience.assignEndExpvalue === 'Yes' ? String(assignExperience.assignEndExpDate) : '',
              // endtar: String(assignExperience.assignEndTarvalue),
              // endtardate: assignExperience.assignEndTarvalue === 'Yes' ? String(assignExperience.assignEndTarDate) : '',
              // updatedate: String(assignExperience.updatedate),
              date: String(employee?.doj),

              expmode: salarySetUpForm.mode,
              salarycode: salarySetUpForm.salarycode,
              endexp: 'No',
              endexpdate: '',
              endtar: 'No',
              endtardate: '',
              basic: String(formValue?.basic || ''),
              hra: String(formValue?.hra || ''),
              conveyance: String(formValue?.conveyance || ''),
              gross: String(formValue?.gross || ''),
              medicalallowance: String(formValue?.medicalallowance || ''),
              productionallowance: String(formValue?.productionallowance || ''),
              otherallowance: String(formValue?.otherallowance || ''),
              productionallowancetwo: String(formValue?.productionallowancetwo || ''),
              pfdeduction: Boolean(formValue?.pfdeduction || ''),
              esideduction: Boolean(formValue?.esideduction || ''),
              ctc: String(Ctc || ''),
              updatedate: String(formValue?.startDate || ''),
              updatename: String(companycaps || ''),
              // date: String(new Date()),
              startmonth: String(formValue?.startmonth || ''),
              endmonth: String(''),
              startyear: String(formValue?.startyear || ''),
              endyear: String(''),
            },
          ]
        : []),
      ...employee?.assignExpLog.slice(1),
    ];
    try {
      if (departmentLog?.length === 1) {
        let employees_data = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          department: String(employee.department),
        });
      }

      if (designationLog?.length === 1) {
        let employees_data = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          designation: String(selectedDesignation),
        });
      }
      if (isBoardingData?.length === 1) {
        let employees_data = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          branch: String(selectedBranch),
          unit: String(selectedUnit),
          company: String(selectedCompany),
          team: String(selectedTeam),
          floor: String(employee.floor),
          area: String(employee.area),
          shifttiming: String(employee.shifttiming),
          shifttype: String(employee.shifttype),
          shiftgrouping: String(employee.shiftgrouping),
          workstationinput: String(employee.workmode === 'Remote' || employee.ifoffice ? primaryWorkStationInput : ''),
          workmode: String(employee.workmode),
          workstationofficestatus: Boolean(employee.ifoffice),
          workstation: finalWorkStation,
          workstationshortname: shortnameArray,
        });
      }
      if (processLog?.length === 1) {
        let employees_data = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          process: String(loginNotAllot.process),
          processduration: String(loginNotAllot.processduration),
          processtype: String(loginNotAllot.processtype),
          time: String(loginNotAllot.time),
          timemins: String(loginNotAllot.timemins),
        });
      }
      if (employee?.assignExpLog?.length === 2 || employee?.assignExpLog?.length === 1) {
        let employees_data = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          assignExpLog: finalassignexplog,
          assignExpMode: String(assignExperience.assignExpMode),
          assignExpvalue: String(assignExperience.assignExpvalue),
          endexp: String(assignExperience.assignEndExpvalue),
          endexpdate: assignExperience.assignEndExpvalue === 'Yes' ? String(assignExperience.assignEndExpDate) : '',
          endtar: String(assignExperience.assignEndTarvalue),
          endtardate: assignExperience.assignEndTarvalue === 'Yes' ? String(assignExperience.assignEndTarDate) : '',
          updatedate: String(assignExperience.updatedate),
          date: String(new Date()),
          grosssalary: String(overallgrosstotal),
          modeexperience: String(modeexperience),
          targetexperience: String(targetexperience),
          targetpts: String(targetpts),
        });
      }
      let employees_data = await axios.put(`${SERVICE.USER_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        username: enableLoginName ? String(third) : employee.username,
        faceDescriptor: employee?.faceDescriptor || [],
        usernameautogenerate: Boolean(enableLoginName),
        firstname: String(employee.firstname),
        lastname: String(employee.lastname),
        legalname: String(employee.legalname),
        callingname: String(employee.callingname),
        prefix: String(employee.prefix),
        fathername: String(employee.fathername),
        mothername: String(employee.mothername),
        gender: String(employee.gender),
        maritalstatus: String(employee.maritalstatus),
        dom: String(employee.dom),
        dob: String(employee.dob),
        bloodgroup: String(employee.bloodgroup),
        religion: String(employee.religion),
        location: String(employee.location),
        // workstationofficestatus: Boolean(employee.ifoffice),
        // workmode: String(employee.workmode),
        email: String(employee.email),
        companyemail: String(employee.companyemail),
        employeecount: String(employee?.employeecount),
        systemmode: String(employee?.systemmode ?? 'Active'),
        contactpersonal: String(employee.contactpersonal),
        contactfamily: String(employee.contactfamily),
        emergencyno: String(employee.emergencyno),
        empcode: String(employee.wordcheck === true ? employeecodenew : employee.empcode),
        wordcheck: Boolean(employee.wordcheck),
        aadhar: String(employee.aadhar),
        panno: String(employee.panstatus === 'Have PAN' ? employee.panno : ''),
        panstatus: String(employee.panstatus),
        panrefno: String(employee.panstatus === 'Applied' ? employee.panrefno : ''),
        doj: String(employee.doj),
        dot: String(employee.dot),
        referencetodo: referenceTodo?.length === 0 ? [] : [...referenceTodo],
        contactno: String(employee.contactno),
        details: String(employee.details),
        password: String(employee.password),
        role: roles,
        originalpassword: String(employee.originalpassword),
        companyname: String(employee.firstname).toUpperCase() + '.' + String(employee.lastname).toUpperCase(),
        pdoorno: String(employee.pdoorno),
        pstreet: String(employee.pstreet),
        parea: String(employee.parea),
        plandmark: String(employee.plandmark),
        ptaluk: String(employee.ptaluk),
        ppost: String(employee.ppost),
        ppincode: String(employee.ppincode),
        paddresstype: String(employee?.paddresstype || ''),
        ppersonalprefix: String(employee?.ppersonalprefix || ''),
        presourcename: String(employee?.presourcename || ''),
        plandmarkandpositionalprefix: String(employee?.plandmarkandpositionalprefix || ''),
        pgpscoordination: String(employee?.pgpscoordination || ''),
        caddresstype: !employee.samesprmnt ? String(employee?.caddresstype || '') : String(employee?.paddresstype || ''),
        cpersonalprefix: !employee.samesprmnt ? String(employee?.cpersonalprefix || '') : String(employee?.ppersonalprefix || ''),
        cresourcename: !employee.samesprmnt ? String(employee?.cresourcename || '') : String(employee?.presourcename || ''),
        clandmarkandpositionalprefix: !employee.samesprmnt ? String(employee?.clandmarkandpositionalprefix || '') : String(employee?.plandmarkandpositionalprefix || ''),
        cgpscoordination: !employee.samesprmnt ? String(employee?.cgpscoordination || '') : String(employee?.pgpscoordination || ''),

        pgenerateviapincode: Boolean(employee?.pgenerateviapincode || false),
        pvillageorcity: String(employee?.pvillageorcity || ''),
        pdistrict: String(employee?.pdistrict || ''),
        cgenerateviapincode: !employee.samesprmnt ? Boolean(employee?.cgenerateviapincode || false) : Boolean(employee?.pgenerateviapincode || false),
        cvillageorcity: !employee.samesprmnt ? String(employee?.cvillageorcity || '') : String(employee?.pvillageorcity || ''),
        cdistrict: !employee.samesprmnt ? String(employee?.cdistrict || '') : String(employee?.pdistrict || ''),

        pcountry: String(employee.pcountry),
        pstate: String(employee.pstate),
        pcity: String(employee.pcity),
        samesprmnt: Boolean(employee.samesprmnt),
        designationlog: finaldesignationlog,
        departmentlog: finaldot,
        boardingLog: finalboardinglog,
        processlog: finalprocesslog,
        cdoorno: String(!employee.samesprmnt ? employee.cdoorno : employee.pdoorno),
        cstreet: String(!employee.samesprmnt ? employee.cstreet : employee.pstreet),
        carea: String(!employee.samesprmnt ? employee.carea : employee.parea),
        clandmark: String(!employee.samesprmnt ? employee.clandmark : employee.plandmark),
        ctaluk: String(!employee.samesprmnt ? employee.ctaluk : employee.ptaluk),
        cpost: String(!employee.samesprmnt ? employee.cpost : employee.ppost),
        cpincode: String(!employee.samesprmnt ? employee.cpincode : employee.ppincode),
        ccountry: String(!employee.samesprmnt ? employee.ccountry : selectedCountryp.name),
        cstate: String(!employee.samesprmnt ? employee.cstate : selectedStatep.name),
        ccity: String(!employee.samesprmnt ? employee.ccity : selectedCityp?.name),
        reportingto: String(employee.reportingto),
        intCourse: String(employee.intCourse),
        intStartDate: String(employee.intStartDate),
        intEndDate: String(employee.intEndDate),
        modeOfInt: String(employee.modeOfInt),
        intDuration: String(employee.intDuration),
        accesslocation: [...selectedValue],
        percentage: completionPercentage,
        // eduTodo: [...eduTodo],
        // addAddQuaTodo: [...addAddQuaTodo],
        // workhistTodo: [...workhistTodo],
        assignExpLog: finalassignexplog,
        bankdetails: bankTodo,
        enquirystatus: String(employee.enquirystatus === 'Please Select Status' || employee.enquirystatus === '' || employee.enquirystatus == undefined ? 'Users Purpose' : employee.enquirystatus),
        attendancemode: employee?.attOptions?.length > 0 ? employee.attOptions.filter((val) => valueAttMode.includes(val)) : valueAttMode,
        updatedby: [
          ...updateby,
          {
            name: String(isUserRoleAccess?.username),
            // date: String(new Date()),
          },
        ],
      });

      let updateAssignBranch = accessibleTodo?.filter((data) => data?.id);
      let createAssignBranch = accessibleTodo?.filter((data) => !data?.id);
      if (accessibleTodo.length > 0) {
        await Promise.all(
          accessibleTodo?.flatMap((data) =>
            Object.entries(roleDatas).map(([roleKey, role]) =>
              axios.post(
                SERVICE.ASSIGNBRANCH_CREATE,
                {
                  accesspage: 'employee',
                  moduleselection: 'Role Based',
                  modulevalue: roleKey,
                  fromcompany: data.fromcompany,
                  frombranch: data.frombranch,
                  fromunit: data.fromunit,
                  company: selectedCompany,
                  branch: selectedBranch,
                  unit: selectedUnit,
                  companycode: data.companycode,
                  branchcode: data.branchcode,
                  branchemail: data.branchemail,
                  branchaddress: data.branchaddress,
                  branchstate: data.branchstate,
                  branchcity: data.branchcity,
                  branchcountry: data.branchcountry,
                  branchpincode: data.branchpincode,
                  unitcode: data.unitcode,
                  employee: companycaps,
                  employeecode: String(employee.wordcheck === true ? employeecodenew : employee.empcode),

                  // Role-specific fields
                  modulename: role?.modulename || [],
                  submodulename: role?.submodulename || [],
                  mainpagename: role?.mainpagename || [],
                  subpagename: role?.subpagename || [],
                  subsubpagename: role?.subsubpagename || [],
                  modulenameurl: role?.modulenameurl || [],
                  submodulenameurl: role?.submodulenameurl || [],
                  mainpagenameurl: role?.mainpagenameurl || [],
                  subpagenameurl: role?.subpagenameurl || [],
                  subsubpagenameurl: role?.subsubpagenameurl || [],
                  addedby: [
                    {
                      name: String(isUserRoleAccess.companyname),
                      // date: new Date().toISOString(),
                    },
                  ],
                },
                {
                  headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                  },
                }
              )
            )
          )
        );
      }
      if (accessibleTodo.length > 0 && DeleteAssignTodo?.length > 0) {
        await Promise.all(DeleteAssignTodo.map((id) => axios.delete(`${SERVICE.ASSIGNBRANCH_SINGLE}/${id}`)));
      }

      const validTodos = getValidTodos(files, categoryDocument);
      if (documentID !== '') {
        const employeeDocuments = await uploadEmployeeDocuments({
          empcode: String(employee?.wordcheck === true ? employeecodenew : employee?.empcode),
          commonid: id,
          companyname: String(companycaps),
          type: 'Employee',
          // files: files?.filter((data) => data?.file), // assuming it's already [{ file, data, name, remark }]
          files: validTodos, // assuming it's already [{ file, data, name, remark }]
          eduTodo: eduTodo,
          addAddQuaTodo: addAddQuaTodo,
          workhistTodo: workhistTodo,
          profileimage: String(final), // File object preferred, not base64 string
          addedby: [],
          updatedby: [
            ...updateby,
            {
              name: String(isUserRoleAccess?.username),
              // date: String(new Date()),
            },
          ],
          // oldFiles: Oldfiles,
          // OldEdu:OldEdu,
          // OldWorkHis:OldWorkHis,
          // OldAdd:OldAdd,
          isEdit: true,
          updateId: documentID,
          // deletedFileNames: [],
          deletedFileNames: Oldfiles?.filter((old) => !files?.some((f) => f?._id?.toString() === old?._id?.toString())),
          deletedEduNames: OldEdu?.filter((old) => !eduTodo?.some((f) => f?._id?.toString() === old?._id?.toString())),
          deletedWorkHisNames: OldWorkHis?.filter((old) => !workhistTodo?.some((f) => f?._id?.toString() === old?._id?.toString())),
          deletedAddNames: OldAdd?.filter((old) => !addAddQuaTodo?.some((f) => f?._id?.toString() === old?._id?.toString())),
        });
      } else {
        const employeeDocuments = await uploadEmployeeDocuments({
          empcode: String(employee?.wordcheck === true ? employeecodenew : employee?.empcode),
          commonid: String(employees_data?.data?.user?._id),
          companyname: String(companycaps),
          type: 'Employee',
          files: validTodos, // assuming it's already [{ file, data, name, remark }]
          eduTodo: eduTodo,
          addAddQuaTodo: addAddQuaTodo,
          workhistTodo: workhistTodo,
          profileimage: croppedImage || employee?.profileimage, // File object preferred, not base64 string
          addedby: [
            {
              name: String(isUserRoleAccess?.companyname),
              // Add more fields if required by backend, e.g., date, userId, etc.
            },
          ],
          updatedby: [],
          oldFiles: [],
          isEdit: false,
          updateId: null,
          deletedFileNames: [],
        });
      }

      if (oldSalaryId !== '') {
        const salaryTablefun = await salaryTableFunction({
          salarytable,
          salaryoption: salaryOption,
          empcode: String(employee?.wordcheck === true ? employeecodenew : employee?.empcode),
          commonid: id,
          companyname: String(companycaps),
          type: 'Employee',
          profileimage: croppedImage || employee?.profileimage, // File object preferred, not base64 string
          updatedby: [
            ...updateby,
            {
              name: String(isUserRoleAccess?.username),
              // date: String(new Date()),
            },
          ],
          isEdit: true,
          updateId: oldSalaryId || null,
        });
      } else {
        const salaryTablefun = await salaryTableFunction({
          salarytable,
          salaryoption: salaryOption,
          empcode: String(employee?.wordcheck === true ? employeecodenew : employee?.empcode),
          commonid: String(employees_data?.data?.user?._id),
          companyname: String(companycaps),
          type: 'Employee',
          profileimage: croppedImage || employee?.profileimage, // File object preferred, not base64 string
          addedby: [
            {
              name: String(isUserRoleAccess?.companyname),
              // Add more fields if required by backend, e.g., date, userId, etc.
            },
          ],
          updatedby: [],
          oldFiles: [],
          isEdit: false,
          updateId: null,
          deletedFileNames: [],
        });
      }
      //   const salaryTablefun = await salaryTableFunction({
      //        salarytable,
      //         empcode: String(employee?.wordcheck === true ? employeecodenew : employee?.empcode),
      //  commonid: id,
      //  companyname: String(companycaps),
      //  type: 'Employee',
      //        profileimage: croppedImage || employee?.profileimage, // File object preferred, not base64 string
      //         updatedby: [
      //    ...updateby,
      //    {
      //      name: String(isUserRoleAccess?.username),
      //      // date: String(new Date()),
      //    },
      //  ],
      //       isEdit: true,
      //  updateId: oldSalaryData?._id || null,
      //      });

      // let employeeDocuments = await axios.put(`${SERVICE.EMPLOYEEDOCUMENT_SINGLE}/${documentID}`, {
      //   profileimage: String(final),
      //   files: [...files],
      //   commonid: id,
      //   empcode: String(employee.wordcheck === true ? employeecodenew : employee.empcode),
      //   companyname: companycaps,
      //   type: String('Employee'),
      //   updatedby: [
      //     ...updateby,
      //     {
      //       name: String(isUserRoleAccess?.username),
      //       // date: String(new Date()),
      //     },
      //   ],
      // });
      setLoading(false);
      backPage('/enquirypurposelist');
      setPopupContent('Updated Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      setLoading(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //change form
  const handlechangecontactpersonal = (e) => {
    const regex = /^[0-9]+$/; // Only allows positive integers
    const inputValue = e.target.value?.slice(0, 10);
    if (regex.test(inputValue) || inputValue === '') {
      setEmployee({ ...employee, contactpersonal: inputValue });
    }
  };

  const handlechangecontactfamily = (e) => {
    const regex = /^[0-9]+$/; // Only allows positive integers
    const inputValue = e.target.value?.slice(0, 10);
    if (regex.test(inputValue) || inputValue === '') {
      setEmployee({ ...employee, contactfamily: inputValue });
    }
  };

  const handlechangeemergencyno = (e) => {
    const regex = /^[0-9]+$/; // Only allows positive integers
    const inputValue = e.target.value?.slice(0, 10);
    if (regex.test(inputValue) || inputValue === '') {
      setEmployee({ ...employee, emergencyno: inputValue });
    }
  };

  const handlechangeaadhar = (e) => {
    const regex = /^[0-9]+$/; // Only allows positive integers
    const inputValue = e.target.value?.slice(0, 12);
    if (regex.test(inputValue) || inputValue === '') {
      setEmployee({ ...employee, aadhar: inputValue });
    }
  };

  const sendRequestpwd = async () => {
    setLoading(true);
    let salarytable =
      salaryOption === 'Experience Based'
        ? [
            ...oldSalaryData,
            {
              movetolive: false,
              onboardas: 'Employee',
              salarystatus: salaryTableData?.salarystatus || '',
              basic: salaryTableData?.basic || 0,
              hra: salaryTableData?.hra || 0,
              conveyance: salaryTableData?.conveyance || 0,
              medicalallowance: salaryTableData?.medicalallowance || 0,
              productionallowance: salaryTableData?.productionallowance || 0,
              shiftallowance: salaryTableData?.shiftallowance || 0,
              grossmonthsalary: salaryTableData?.grossmonthsalary || 0,
              annualgrossctc: salaryTableData?.annualgrossctc || 0,
              otherallowance: salaryTableData?.otherallowance || 0,
              performanceincentive: salaryTableData?.performanceincentive || 0,

              file: tableImage || null,
            },
          ]
        : [
            ...oldSalaryData,
            {
              movetolive: false,
              onboardas: 'Employee',
              salarystatus: salaryTableData?.salarystatus || '',
              basic: salaryTableDataManual?.basic || 0,
              hra: salaryTableDataManual?.hra || 0,
              conveyance: salaryTableDataManual?.conveyance || 0,
              medicalallowance: salaryTableDataManual?.medicalallowance || 0,
              productionallowance: salaryTableDataManual?.productionallowance || 0,
              shiftallowance: salaryTableDataManual?.shiftallowance || 0,
              grossmonthsalary: salaryTableDataManual?.grossmonthsalary || 0,
              annualgrossctc: salaryTableDataManual?.annualgrossctc || 0,
              otherallowance: salaryTableDataManual?.otherallowance || 0,
              performanceincentive: salaryTableDataManual?.performanceincentive || 0,
              file: tableImageManual || null,
            },
          ];
    let primaryWork = ['please select primary workstation', 'select primary workstation', '', undefined, 'please select primary work station', 'select primary work station', 'primary workstation', 'primary work station', null].includes((primaryWorkStation || '').toLowerCase())
      ? null
      : primaryWorkStation;

    // Filter out falsy or null-like values from valueWorkStation
    let filteredValueWorkStation = (valueWorkStation || []).filter((item) => item && item !== '');

    // Build finalWorkStation
    let finalWorkStation;
    const shortnameArray = workstationTodoList?.length > 0 ? workstationTodoList?.map((data) => data?.shortname) : [];

    if (!primaryWork && filteredValueWorkStation.length === 0) {
      finalWorkStation = []; // case 1: both are empty
    } else if (!primaryWork && filteredValueWorkStation.length > 0) {
      finalWorkStation = [null, ...filteredValueWorkStation]; // case 2: only secondary has data
    } else {
      finalWorkStation = [primaryWork, ...filteredValueWorkStation]; // case 3: primary is valid
    }

    // departmentlog details
    const changeddptlog1st = departmentLog.slice(0, 1);
    const changedptlogwiout1st = departmentLog.slice(1);
    const finaldot = [
      {
        ...changeddptlog1st[0],
        userid: String(employee.wordcheck === true ? employeecodenew : employee.empcode),
        logeditedby: [],
        updateddatetime: String(new Date()),
        updatedusername: String(isUserRoleAccess.companyname),
        username: String(companycaps),
        department: String(employee.department),
        startdate: String(employee.doj),
        companyname: String(selectedCompany),
        branch: String(selectedBranch),
        unit: String(selectedUnit),
        team: String(selectedTeam),
        status: Boolean(employee.statuss),
      },
      ...changedptlogwiout1st,
    ];

    // designation log details
    const changeddeslog1st = designationLog.slice(0, 1);
    const changedeslogwiout1st = designationLog.slice(1);
    const finaldesignationlog = [
      {
        ...changeddeslog1st[0],
        logeditedby: [],
        updateddatetime: String(new Date()),
        updatedusername: String(isUserRoleAccess.companyname),
        designation: String(selectedDesignation),
        username: String(companycaps),
        companyname: String(selectedCompany),
        startdate: String(employee.doj),
        time: String(getCurrentTime()),
        branch: String(selectedBranch),
        unit: String(selectedUnit),
        team: String(selectedTeam),
      },
      ...changedeslogwiout1st,
    ];

    // boarding log details
    const changedboardlog1st = boardingLog.slice(0, 1);
    const changeboardinglogwiout1st = boardingLog.slice(1);
    const finalboardinglog = [
      {
        ...changedboardlog1st[0],
        username: companycaps,
        company: String(selectedCompany),
        startdate: String(employee.doj),
        time: moment().format('HH:mm'),
        branch: String(selectedBranch),
        unit: String(selectedUnit),
        team: String(selectedTeam),
        shifttype: String(employee.shifttype),
        shifttiming: String(employee.shifttiming),
        shiftgrouping: String(employee.shiftgrouping),
        weekoff: [...valueCate],
        todo: employee.shifttype === 'Standard' ? [] : [...todo],
        logeditedby: [],
        updateddatetime: String(new Date()),
        updatedusername: String(isUserRoleAccess.companyname),
        logcreation: String('user'),
        workstation: finalWorkStation,
        workstationshortname: shortnameArray,
        workstationinput: String(employee.workmode === 'Remote' || employee.ifoffice ? primaryWorkStationInput : ''),
        floor: String(employee.floor),
        area: String(employee.area),
        ischangecompany: true,
        ischangebranch: true,
        ischangeunit: true,
        ischangeteam: true,
        ischangefloor: true,
        ischangearea: true,
        ischangeworkstation: true,
        ischangeworkmode: true,
      },
      ...changeboardinglogwiout1st,
    ];

    // process log details
    const changedprocesslog1st = processLog.slice(0, 1);
    const changeprocesslogwiout1st = processLog.slice(1);
    const finalprocesslog = [
      {
        ...changedprocesslog1st[0],
        company: String(selectedCompany),
        branch: String(selectedBranch),
        unit: String(selectedUnit),
        team: String(selectedTeam),
        process: String(loginNotAllot.process === '' || loginNotAllot.process == undefined ? '' : loginNotAllot.process),
        processduration: String(loginNotAllot.processduration === '' || loginNotAllot.processduration == undefined ? '' : loginNotAllot.processduration),
        processtype: String(loginNotAllot.processtype === '' || loginNotAllot.processtype == undefined ? '' : loginNotAllot.processtype),

        date: String(employee.doj),
        time: `${loginNotAllot.time}:${loginNotAllot?.timemins}`,
        empname: String(companycaps),
        logeditedby: [],
        updateddatetime: String(new Date()),
        updatedusername: String(isUserRoleAccess.companyname),
      },
      ...changeprocesslogwiout1st,
    ];

    //Experience log
    const changedassignexplog1st = employee?.assignExpLog?.slice(0, 1);
    const changeassignexplogwiout1st = employee?.assignExpLog.slice(1);
    const finalassignexplog = [
      ...(employee?.assignExpLog.length > 0
        ? [
            {
              ...employee?.assignExpLog[0], // Spread the original object to maintain immutability
              // expmode: String(assignExperience.assignExpMode),
              // expval: String(assignExperience.assignExpvalue),

              // endexp: String(assignExperience.assignEndExpvalue),
              // endexpdate: assignExperience.assignEndExpvalue === 'Yes' ? String(assignExperience.assignEndExpDate) : '',
              // endtar: String(assignExperience.assignEndTarvalue),
              // endtardate: assignExperience.assignEndTarvalue === 'Yes' ? String(assignExperience.assignEndTarDate) : '',
              // updatedate: String(assignExperience.updatedate),
              date: String(employee?.doj),

              expmode: salarySetUpForm.mode,
              salarycode: salarySetUpForm.salarycode,
              endexp: 'No',
              endexpdate: '',
              endtar: 'No',
              endtardate: '',
              basic: String(formValue?.basic || ''),
              hra: String(formValue?.hra || ''),
              conveyance: String(formValue?.conveyance || ''),
              gross: String(formValue?.gross || ''),
              medicalallowance: String(formValue?.medicalallowance || ''),
              productionallowance: String(formValue?.productionallowance || ''),
              otherallowance: String(formValue?.otherallowance || ''),
              productionallowancetwo: String(formValue?.productionallowancetwo || ''),
              pfdeduction: Boolean(formValue?.pfdeduction || ''),
              esideduction: Boolean(formValue?.esideduction || ''),
              ctc: String(Ctc || ''),
              updatedate: String(formValue?.startDate || ''),
              updatename: String(companycaps || ''),
              // date: String(new Date()),
              startmonth: String(formValue?.startmonth || ''),
              endmonth: String(''),
              startyear: String(formValue?.startyear || ''),
              endyear: String(''),
            },
          ]
        : []),
      ...employee?.assignExpLog.slice(1),
    ];
    try {
      if (departmentLog?.length === 1) {
        let employees_data = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          department: String(employee.department),
        });
      }

      if (designationLog?.length === 1) {
        let employees_data = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          designation: String(selectedDesignation),
        });
      }
      if (isBoardingData?.length === 1) {
        let employees_data = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          branch: String(selectedBranch),
          unit: String(selectedUnit),
          company: String(selectedCompany),
          team: String(selectedTeam),
          floor: String(employee.floor),
          area: String(employee.area),
          shifttiming: String(employee.shifttiming),
          shifttype: String(employee.shifttype),
          shiftgrouping: String(employee.shiftgrouping),
          workstationinput: String(employee.workmode === 'Remote' || employee.ifoffice ? primaryWorkStationInput : ''),
          workmode: String(employee.workmode),
          workstationofficestatus: Boolean(employee.ifoffice),
          workstation: finalWorkStation,
          workstationshortname: shortnameArray,
        });
      }
      if (processLog?.length === 1) {
        let employees_data = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          process: String(loginNotAllot.process),
          processduration: String(loginNotAllot.processduration),
          processtype: String(loginNotAllot.processtype),
          time: String(loginNotAllot.time),
          timemins: String(loginNotAllot.timemins),
        });
      }
      if (employee?.assignExpLog?.length === 2 || employee?.assignExpLog?.length === 1) {
        let employees_data = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          assignExpLog: finalassignexplog,
          assignExpMode: String(assignExperience.assignExpMode),
          assignExpvalue: String(assignExperience.assignExpvalue),
          endexp: String(assignExperience.assignEndExpvalue),
          endexpdate: assignExperience.assignEndExpvalue === 'Yes' ? String(assignExperience.assignEndExpDate) : '',
          endtar: String(assignExperience.assignEndTarvalue),
          endtardate: assignExperience.assignEndTarvalue === 'Yes' ? String(assignExperience.assignEndTarDate) : '',
          updatedate: String(assignExperience.updatedate),
          date: String(new Date()),
          grosssalary: String(overallgrosstotal),
          modeexperience: String(modeexperience),
          targetexperience: String(targetexperience),
          targetpts: String(targetpts),
        });
      }
      let employees_data = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        username: enableLoginName ? String(third) : employee.username,
        usernameautogenerate: Boolean(enableLoginName),
        faceDescriptor: employee?.faceDescriptor || [],
        firstname: String(employee.firstname),
        lastname: String(employee.lastname),
        legalname: String(employee.legalname),
        callingname: String(employee.callingname),
        prefix: String(employee.prefix),
        fathername: String(employee.fathername),
        mothername: String(employee.mothername),
        gender: String(employee.gender),
        maritalstatus: String(employee.maritalstatus),
        dom: String(employee.dom),
        dob: String(employee.dob),
        bloodgroup: String(employee.bloodgroup),
        religion: String(employee.religion),
        location: String(employee.location),
        email: String(employee.email),
        companyemail: String(employee.companyemail),
        employeecount: String(employee?.employeecount),
        systemmode: String(employee?.systemmode ?? 'Active'),
        contactpersonal: String(employee.contactpersonal),
        contactfamily: String(employee.contactfamily),
        emergencyno: String(employee.emergencyno),
        empcode: String(employee.wordcheck === true ? employeecodenew : employee.empcode),
        wordcheck: Boolean(employee.wordcheck),
        aadhar: String(employee.aadhar),
        panno: String(employee.panstatus === 'Have PAN' ? employee.panno : ''),
        panstatus: String(employee.panstatus),
        panrefno: String(employee.panstatus === 'Applied' ? employee.panrefno : ''),
        doj: String(employee.doj),
        dot: String(employee.dot),
        referencetodo: referenceTodo?.length === 0 ? [] : [...referenceTodo],
        // workmode: String(employee.workmode),
        contactno: String(employee.contactno),
        details: String(employee.details),
        companyname: companycaps,
        pdoorno: String(employee.pdoorno),
        pstreet: String(employee.pstreet),
        parea: String(employee.parea),
        plandmark: String(employee.plandmark),
        ptaluk: String(employee.ptaluk),
        ppost: String(employee.ppost),
        ppincode: String(employee.ppincode),
        paddresstype: String(employee?.paddresstype || ''),
        ppersonalprefix: String(employee?.ppersonalprefix || ''),
        presourcename: String(employee?.presourcename || ''),
        plandmarkandpositionalprefix: String(employee?.plandmarkandpositionalprefix || ''),
        pgpscoordination: String(employee?.pgpscoordination || ''),
        caddresstype: !employee.samesprmnt ? String(employee?.caddresstype || '') : String(employee?.paddresstype || ''),
        cpersonalprefix: !employee.samesprmnt ? String(employee?.cpersonalprefix || '') : String(employee?.ppersonalprefix || ''),
        cresourcename: !employee.samesprmnt ? String(employee?.cresourcename || '') : String(employee?.presourcename || ''),
        clandmarkandpositionalprefix: !employee.samesprmnt ? String(employee?.clandmarkandpositionalprefix || '') : String(employee?.plandmarkandpositionalprefix || ''),
        cgpscoordination: !employee.samesprmnt ? String(employee?.cgpscoordination || '') : String(employee?.pgpscoordination || ''),

        pgenerateviapincode: Boolean(employee?.pgenerateviapincode || false),
        pvillageorcity: String(employee?.pvillageorcity || ''),
        pdistrict: String(employee?.pdistrict || ''),
        cgenerateviapincode: !employee.samesprmnt ? Boolean(employee?.cgenerateviapincode || false) : Boolean(employee?.pgenerateviapincode || false),
        cvillageorcity: !employee.samesprmnt ? String(employee?.cvillageorcity || '') : String(employee?.pvillageorcity || ''),
        cdistrict: !employee.samesprmnt ? String(employee?.cdistrict || '') : String(employee?.pdistrict || ''),

        pcountry: String(employee.pcountry),
        pstate: String(employee.pstate),
        pcity: String(employee.pcity),
        samesprmnt: Boolean(employee.samesprmnt),
        designationlog: finaldesignationlog,
        departmentlog: finaldot,
        boardingLog: finalboardinglog,
        processlog: finalprocesslog,
        cdoorno: String(!employee.samesprmnt ? employee.cdoorno : employee.pdoorno),
        cstreet: String(!employee.samesprmnt ? employee.cstreet : employee.pstreet),
        carea: String(!employee.samesprmnt ? employee.carea : employee.parea),
        clandmark: String(!employee.samesprmnt ? employee.clandmark : employee.plandmark),
        ctaluk: String(!employee.samesprmnt ? employee.ctaluk : employee.ptaluk),
        cpost: String(!employee.samesprmnt ? employee.cpost : employee.ppost),
        cpincode: String(!employee.samesprmnt ? employee.cpincode : employee.ppincode),
        ccountry: String(!employee.samesprmnt ? employee.ccountry : selectedCountryp.name),
        cstate: String(!employee.samesprmnt ? employee.cstate : selectedStatep?.name),
        ccity: String(!employee.samesprmnt ? employee.ccity : selectedCityp?.name),
        role: roles,
        reportingto: String(employee.reportingto),
        intCourse: String(employee.intCourse),
        intStartDate: String(employee.intStartDate),
        intEndDate: String(employee.intEndDate),
        modeOfInt: String(employee.modeOfInt),
        intDuration: String(employee.intDuration),
        accesslocation: [...selectedValue],
        // eduTodo: [...eduTodo],
        // addAddQuaTodo: [...addAddQuaTodo],
        // workhistTodo: [...workhistTodo],
        bankdetails: bankTodo,
        ifsccode: String(employee.ifsccode),
        assignExpLog: finalassignexplog,
        enquirystatus: String(employee.enquirystatus === 'Please Select Status' || employee.enquirystatus === '' || employee.enquirystatus == undefined ? 'Users Purpose' : employee.enquirystatus),
        updatedby: [
          ...updateby,
          {
            name: String(isUserRoleAccess?.username),
            // date: String(new Date()),
          },
        ],
      });

      const validTodos = getValidTodos(files, categoryDocument);
      if (documentID !== '') {
        const employeeDocuments = await uploadEmployeeDocuments({
          empcode: String(employee?.wordcheck === true ? employeecodenew : employee?.empcode),
          commonid: id,
          companyname: String(companycaps),
          type: 'Employee',
          // files: files?.filter((data) => data?.file), // assuming it's already [{ file, data, name, remark }]
          files: validTodos, // assuming it's already [{ file, data, name, remark }]
          eduTodo: eduTodo,
          addAddQuaTodo: addAddQuaTodo,
          workhistTodo: workhistTodo,
          profileimage: String(final), // File object preferred, not base64 string
          addedby: [],
          updatedby: [
            ...updateby,
            {
              name: String(isUserRoleAccess?.username),
              // date: String(new Date()),
            },
          ],
          // oldFiles: Oldfiles,
          // OldEdu:OldEdu,
          // OldWorkHis:OldWorkHis,
          // OldAdd:OldAdd,
          isEdit: true,
          updateId: documentID,
          // deletedFileNames: [],
          deletedFileNames: Oldfiles?.filter((old) => !files?.some((f) => f?._id?.toString() === old?._id?.toString())),
          deletedEduNames: OldEdu?.filter((old) => !eduTodo?.some((f) => f?._id?.toString() === old?._id?.toString())),
          deletedWorkHisNames: OldWorkHis?.filter((old) => !workhistTodo?.some((f) => f?._id?.toString() === old?._id?.toString())),
          deletedAddNames: OldAdd?.filter((old) => !addAddQuaTodo?.some((f) => f?._id?.toString() === old?._id?.toString())),
        });
      } else {
        const employeeDocuments = await uploadEmployeeDocuments({
          empcode: String(employee?.wordcheck === true ? employeecodenew : employee?.empcode),
          commonid: String(employees_data?.data?.user?._id),
          companyname: String(companycaps),
          type: 'Employee',
          files: validTodos, // assuming it's already [{ file, data, name, remark }]
          eduTodo: eduTodo,
          addAddQuaTodo: addAddQuaTodo,
          workhistTodo: workhistTodo,
          profileimage: croppedImage || employee?.profileimage, // File object preferred, not base64 string
          addedby: [
            {
              name: String(isUserRoleAccess?.companyname),
              // Add more fields if required by backend, e.g., date, userId, etc.
            },
          ],
          updatedby: [],
          oldFiles: [],
          isEdit: false,
          updateId: null,
          deletedFileNames: [],
        });
      }

      if (oldSalaryId !== '') {
        const salaryTablefun = await salaryTableFunction({
          salarytable,
          salaryoption: salaryOption,
          empcode: String(employee?.wordcheck === true ? employeecodenew : employee?.empcode),
          commonid: id,
          companyname: String(companycaps),
          type: 'Employee',
          profileimage: croppedImage || employee?.profileimage, // File object preferred, not base64 string
          updatedby: [
            ...updateby,
            {
              name: String(isUserRoleAccess?.username),
              // date: String(new Date()),
            },
          ],
          isEdit: true,
          updateId: oldSalaryId || null,
        });
      } else {
        const salaryTablefun = await salaryTableFunction({
          salarytable,
          salaryoption: salaryOption,
          empcode: String(employee?.wordcheck === true ? employeecodenew : employee?.empcode),
          commonid: String(employees_data?.data?.user?._id),
          companyname: String(companycaps),
          type: 'Employee',
          profileimage: croppedImage || employee?.profileimage, // File object preferred, not base64 string
          addedby: [
            {
              name: String(isUserRoleAccess?.companyname),
              // Add more fields if required by backend, e.g., date, userId, etc.
            },
          ],
          updatedby: [],
          oldFiles: [],
          isEdit: false,
          updateId: null,
          deletedFileNames: [],
        });
      }

      let updateAssignBranch = accessibleTodo?.filter((data) => data?.id);
      let createAssignBranch = accessibleTodo?.filter((data) => !data?.id);
      if (accessibleTodo.length > 0) {
        await Promise.all(
          accessibleTodo?.flatMap((data) =>
            Object.entries(roleDatas).map(([roleKey, role]) =>
              axios.post(
                SERVICE.ASSIGNBRANCH_CREATE,
                {
                  accesspage: 'employee',
                  moduleselection: 'Role Based',
                  modulevalue: roleKey,
                  fromcompany: data.fromcompany,
                  frombranch: data.frombranch,
                  fromunit: data.fromunit,
                  company: selectedCompany,
                  branch: selectedBranch,
                  unit: selectedUnit,
                  companycode: data.companycode,
                  branchcode: data.branchcode,
                  branchemail: data.branchemail,
                  branchaddress: data.branchaddress,
                  branchstate: data.branchstate,
                  branchcity: data.branchcity,
                  branchcountry: data.branchcountry,
                  branchpincode: data.branchpincode,
                  unitcode: data.unitcode,
                  employee: companycaps,
                  employeecode: String(employee.wordcheck === true ? employeecodenew : employee.empcode),

                  // Role-specific fields
                  modulename: role?.modulename || [],
                  submodulename: role?.submodulename || [],
                  mainpagename: role?.mainpagename || [],
                  subpagename: role?.subpagename || [],
                  subsubpagename: role?.subsubpagename || [],
                  modulenameurl: role?.modulenameurl || [],
                  submodulenameurl: role?.submodulenameurl || [],
                  mainpagenameurl: role?.mainpagenameurl || [],
                  subpagenameurl: role?.subpagenameurl || [],
                  subsubpagenameurl: role?.subsubpagenameurl || [],
                  addedby: [
                    {
                      name: String(isUserRoleAccess.companyname),
                      // date: new Date().toISOString(),
                    },
                  ],
                },
                {
                  headers: {
                    Authorization: `Bearer ${auth.APIToken}`,
                  },
                }
              )
            )
          )
        );
      }
      if (accessibleTodo.length > 0 && DeleteAssignTodo?.length > 0) {
        await Promise.all(DeleteAssignTodo.map((id) => axios.delete(`${SERVICE.ASSIGNBRANCH_SINGLE}/${id}`)));
      }
      setLoading(false);
      backPage('/enquirypurposelist');
      setPopupContent('Updated Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      setLoading(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [companycaps, setcompanycaps] = useState('');
  const [nextBtnLoading, setNextBtnLoading] = useState(false);

  const draftduplicateCheck = async (e, from) => {
    try {
      const newErrors = {};
      const missingFields = [];

      // Check the validity of field1

      if (!employee.firstname) {
        newErrors.firstname = <Typography style={{ color: 'red' }}>First name must be required</Typography>;
        missingFields.push('First Name');
      }

      if (!employee.lastname) {
        newErrors.lastname = <Typography style={{ color: 'red' }}> Last Name be required </Typography>;
      } else if (employee.lastname?.length < 3) {
        newErrors.lastname = <Typography style={{ color: 'red' }}> Last Name must be 3 characters! </Typography>;
        missingFields.push('Last Name');
      }

      // if (employeenameduplicate && employee.firstname && employee.lastname) {
      //   newErrors.duplicatefirstandlastname = (
      //     <Typography style={{ color: "red" }}>
      //       First name and Last name already exist
      //     </Typography>
      //   );
      // }

      if (!employee.legalname) {
        newErrors.legalname = <Typography style={{ color: 'red' }}>Legal name must be required</Typography>;
        missingFields.push('Legal Name');
      }

      if (!employee.callingname) {
        newErrors.callingname = <Typography style={{ color: 'red' }}>Calling Name must be required</Typography>;
        missingFields.push('Calling Name');
      }
      // if (
      //   employee.callingname !== "" &&
      //   employee.legalname !== "" &&
      //   employee.callingname?.toLowerCase() ===
      //   employee.legalname?.toLowerCase()
      // ) {
      //   newErrors.callingname = (
      //     <Typography style={{ color: "red" }}>
      //       Legal Name and Calling Name can't be same
      //     </Typography>
      //   );
      //   missingFields.push("Legal Name and Calling Name can't be same");
      // }
      if (!employee.email) {
        newErrors.email = <Typography style={{ color: 'red' }}>Email must be required</Typography>;
        missingFields.push('Email');
      } else if (!isValidEmail) {
        newErrors.email = <Typography style={{ color: 'red' }}>Please enter valid email</Typography>;
        missingFields.push('Enter valid Email');
      }

      if (!employee.emergencyno) {
        newErrors.emergencyno = <Typography style={{ color: 'red' }}>Emergency no must be required</Typography>;
      } else if (employee.emergencyno?.length !== 10) {
        newErrors.emergencyno = <Typography style={{ color: 'red' }}>Emergency no must be 10 digits required</Typography>;
        missingFields.push('Emergency No');
      }
      if (employee.maritalstatus === 'Married' && !employee.dom) {
        newErrors.dom = <Typography style={{ color: 'red' }}>DOM must be required</Typography>;
        missingFields.push('Date of Marriage ');
      }
      if (employee.contactfamily === '' || !employee.contactfamily) {
        newErrors.contactfamily = <Typography style={{ color: 'red' }}>Contact(Family) no must be required</Typography>;
        missingFields.push('Contact(Family)');
      }
      if (employee.contactfamily !== '' && employee.contactfamily?.length !== 10) {
        newErrors.contactfamily = <Typography style={{ color: 'red' }}>Contact(Family) no must be 10 digits required</Typography>;
        missingFields.push('Enter valid Contact(Family) No');
      }
      if (employee.contactpersonal === '' || !employee.contactpersonal) {
        newErrors.contactpersonal = <Typography style={{ color: 'red' }}>Contact(personal) no must be required</Typography>;
        missingFields.push('Contact(personal)');
      }
      if (employee.contactpersonal !== '' && employee.contactpersonal?.length !== 10) {
        newErrors.contactpersonal = <Typography style={{ color: 'red' }}>Contact(personal) no must be 10 digits required</Typography>;
        missingFields.push('Enter valid Contact(personal)');
      }

      if (employee?.panno !== '' && employee?.panno?.length !== 10) {
        newErrors.panno = <Typography style={{ color: 'red' }}>PAN No must be 10 digits required</Typography>;
        missingFields.push('PAN No');
      }

      if (employee?.panno === '' && employee?.panstatus === 'Have PAN') {
        newErrors.panno = <Typography style={{ color: 'red' }}>PAN No must be required</Typography>;
        missingFields.push('PAN No');
      } else if (!PanValidate(employee?.panno) && employee?.panstatus === 'Have PAN') {
        newErrors.panno = <Typography style={{ color: 'red' }}>Please Enter Valid PAN Number</Typography>;
        missingFields.push('Valid PAN Number');
      }

      if (employee?.panrefno === '' && employee?.panstatus === 'Applied') {
        newErrors.panrefno = <Typography style={{ color: 'red' }}>Application Reference No must be required</Typography>;
        missingFields.push('Enter valid Application Reference');
      }

      if (!employee.dob) {
        newErrors.dob = <Typography style={{ color: 'red' }}>DOB must be required</Typography>;
        missingFields.push('Date of Birth');
      }

      if (!final) {
        newErrors.profile = <Typography style={{ color: 'red' }}>Profile Image must be required</Typography>;
        missingFields.push('Profile Image');
      }
      if (!employee.religion) {
        newErrors.religion = <Typography style={{ color: 'red' }}>Religion must be required</Typography>;
        missingFields.push('Religion');
      }

      if (!employee.aadhar) {
        newErrors.aadhar = <Typography style={{ color: 'red' }}> Aadhar must be required </Typography>;
        missingFields.push('Aadhar No');
      } else if (employee.aadhar?.length < 12) {
        newErrors.aadhar = <Typography style={{ color: 'red' }}> Please Enter valid Aadhar Number </Typography>;
      } else if (!AadharValidate(employee.aadhar)) {
        newErrors.aadhar = <Typography style={{ color: 'red' }}> Please Enter valid Aadhar Number </Typography>;
        missingFields.push('Enter valid Aadhar No');
      }

      setErrors(newErrors);

      // If there are missing fields, show an alert with the list of them
      if (missingFields?.length > 0) {
        setPopupContentMalert(`Please fill in the following fields: ${missingFields.join(', ')}`);
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else {
        if (Object.keys(newErrors)?.length === 0 && (employee.firstname?.toLowerCase() !== oldNames?.firstname?.toLowerCase() || employee.lastname?.toLowerCase() !== oldNames?.lastname?.toLowerCase())) {
          if (from === 'next') setNextBtnLoading(true);

          function cleanString(str) {
            const trimmed = str.trim();
            const cleaned = trimmed.replace(/[^a-zA-Z0-9 ]/g, '');
            return cleaned?.length > 0 ? cleaned : str;
          }

          let companynamecheck = await axios.post(SERVICE.COMPANYNAME_DUPLICATECHECK_CREATE, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            aadhar: employee.aadhar,
            firstname: employee.firstname,
            lastname: employee.lastname,
            dob: employee.dob,
            mothername: employee?.mothername || '',
            // employeename: `${employee.firstname?.toUpperCase()}.${employee.lastname?.toUpperCase()}`,
            employeename: `${cleanString(employee.firstname?.toUpperCase().trim())}.${cleanString(employee.lastname?.toUpperCase().trim())}`,
          });

          // companycaps = companynamecheck?.data?.uniqueCompanyName;
          setcompanycaps(companynamecheck?.data?.uniqueCompanyName);
          if (from === 'next') {
            setNextBtnLoading(false);
            nextStep(from);
          } else {
            handleButtonClickPersonal(e);
          }
        } else if (Object.keys(newErrors)?.length === 0 && employee.firstname?.toLowerCase() === oldNames?.firstname?.toLowerCase() && employee.lastname?.toLowerCase() === oldNames?.lastname?.toLowerCase()) {
          setcompanycaps(oldNames.companyname);

          if (from === 'next') {
            nextStep(from);
          } else {
            handleButtonClickPersonal(e);
          }
        }
      }
    } catch (err) {
      setNextBtnLoading(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  function AadharValidate(aadhar) {
    var adharcardTwelveDigit = /^\d{12}$/;
    var adharSixteenDigit = /^\d{16}$/;

    if (aadhar !== '') {
      if (aadhar.match(adharcardTwelveDigit) || aadhar.match(adharSixteenDigit)) {
        if (aadhar[0] !== '0' && aadhar[0] !== '1') {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  function PanValidate(pan) {
    let panregex = /^([A-Z]){5}([0-9]){4}([A-Z]){1}$/;
    if (pan !== '') {
      if (pan.match(panregex)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  const nextStep = (action) => {
    const newErrors = {};

    const missingFields = [];

    // Check the validity of field1

    if (!employee.firstname) {
      newErrors.firstname = <Typography style={{ color: 'red' }}>First name must be required</Typography>;
      missingFields.push('First Name');
    }

    if (!employee.lastname) {
      newErrors.lastname = <Typography style={{ color: 'red' }}> Last Name be required </Typography>;
    } else if (employee.lastname?.length < 3) {
      newErrors.lastname = <Typography style={{ color: 'red' }}> Last Name must be 3 characters! </Typography>;
      missingFields.push('Last Name');
    }

    if (!employee.legalname) {
      newErrors.legalname = <Typography style={{ color: 'red' }}>Legal name must be required</Typography>;
      missingFields.push('Legal Name');
    }
    if (!employee.callingname) {
      newErrors.callingname = <Typography style={{ color: 'red' }}>Calling name must be required</Typography>;
      missingFields.push('Calling Name');
    }
    // if (
    //   employee.callingname !== "" &&
    //   employee.legalname !== "" &&
    //   employee.callingname?.toLowerCase() === employee.legalname?.toLowerCase()
    // ) {
    //   newErrors.callingname = (
    //     <Typography style={{ color: "red" }}>
    //       Legal Name and Calling Name can't be same
    //     </Typography>
    //   );
    //   missingFields.push("Legal Name and Calling Name can't be same");
    // }
    if (!employee.email) {
      newErrors.email = <Typography style={{ color: 'red' }}>Email must be required</Typography>;
      missingFields.push('Email');
    } else if (!isValidEmail) {
      newErrors.email = <Typography style={{ color: 'red' }}>Please enter valid email</Typography>;
      missingFields.push('Enter valid Email');
    }

    if (employee.maritalstatus === 'Married' && !employee.dom) {
      newErrors.dom = <Typography style={{ color: 'red' }}>DOM must be required</Typography>;
      missingFields.push('Date of Marriage ');
    }
    if (!employee.emergencyno && employee.emergencyno?.length != 10) {
      newErrors.emergencyno = <Typography style={{ color: 'red' }}>Emergency no must be 10 digits required</Typography>;
      missingFields.push('Enter valid Emergency No');
    }
    if (!employee.emergencyno) {
      // If emergency number is not entered at all
      newErrors.emergencyno = <Typography style={{ color: 'red' }}>Emergency no must be required</Typography>;
      missingFields.push('Emergency No');
    } else if (employee.emergencyno?.length !== 10) {
      // If emergency number is entered but not 10 digits long
      newErrors.emergencyno = <Typography style={{ color: 'red' }}>Emergency no must be 10 digits required</Typography>;
      missingFields.push('Enter valid Emergency No');
    }
    if (employee.contactfamily !== '' && employee.contactfamily?.length !== 10) {
      newErrors.contactfamily = <Typography style={{ color: 'red' }}>Contact(Family) no must be 10 digits required</Typography>;
      missingFields.push('Enter valid Contact(Family) No');
    }
    if (employee.contactpersonal === '' || !employee.contactpersonal) {
      newErrors.contactpersonal = <Typography style={{ color: 'red' }}>Contact(personal) no must be required</Typography>;
      missingFields.push('Contact(personal)');
    }
    if (employee.contactpersonal !== '' && employee.contactpersonal?.length !== 10) {
      newErrors.contactpersonal = <Typography style={{ color: 'red' }}>Contact(personal) no must be 10 digits required</Typography>;
      missingFields.push('Enter valid Contact(personal');
    }
    if (employee.panno !== '' && employee.panno?.length !== 10) {
      newErrors.panno = <Typography style={{ color: 'red' }}>PAN No no must be 10 digits required</Typography>;
    }

    if (employee?.panno === '' && employee?.panstatus === 'Have PAN') {
      newErrors.panno = <Typography style={{ color: 'red' }}>PAN No must be required</Typography>;
      missingFields.push('PAN No');
    } else if (!PanValidate(employee?.panno) && employee?.panstatus === 'Have PAN') {
      newErrors.panno = <Typography style={{ color: 'red' }}>Please Enter Valid PAN Number</Typography>;
      missingFields.push('Valid PAN Number');
    }

    if (employee?.panrefno === '' && employee?.panstatus === 'Applied') {
      newErrors.panrefno = <Typography style={{ color: 'red' }}>Application Reference No must be required</Typography>;
      missingFields.push('Enter valid Application Reference');
    }

    if (!employee.dob) {
      newErrors.dob = <Typography style={{ color: 'red' }}>DOB must be required</Typography>;
      missingFields.push('Date of Birth');
    }
    if (!final) {
      newErrors.profile = <Typography style={{ color: 'red' }}>Profile Image must be required</Typography>;
      missingFields.push('Profile Image');
    }

    if (!employee.religion) {
      newErrors.religion = <Typography style={{ color: 'red' }}>Religion must be required</Typography>;
      missingFields.push('Religion');
    }
    if (!employee.aadhar) {
      newErrors.aadhar = <Typography style={{ color: 'red' }}> Aadhar must be required </Typography>;
      missingFields.push('Aadhar No');
    } else if (employee.aadhar?.length < 12) {
      newErrors.aadhar = <Typography style={{ color: 'red' }}> Please Enter valid Aadhar Number </Typography>;
    } else if (!AadharValidate(employee.aadhar)) {
      newErrors.aadhar = <Typography style={{ color: 'red' }}> Please Enter valid Aadhar Number </Typography>;
      missingFields.push('Enter valid Aadhar No');
    }

    setErrors(newErrors);

    // If there are missing fields, show an alert with the list of them
    if (missingFields?.length > 0) {
      setPopupContentMalert(`Please fill in the following fields: ${missingFields.join(', ')}`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      // If there are no errors, submit the form
      if (Object.keys(newErrors)?.length === 0) {
        if (action === 'next') {
          setStep(step + 1);
        } else {
          setStep(step - 1);
        }
      }
    }
  };
  const checkUploadRestrictions = (todoscheck, categoryDocument) => {
    const groupErrors = [];

    categoryDocument.forEach((docRule) => {
      docRule.subcategoryname.forEach((subCat) => {
        const matchingTodos = todoscheck.filter((todo) => todo.category === docRule.categoryname && todo.subcategory === subCat);

        if (matchingTodos.length === 0) return;

        const checkConditions = (todo) => {
          if (todo.status === 'Pending' && (!todo.deadlinedate || todo.deadlinedate === '')) {
            return false;
          }
          if (todo.status !== 'No Document' && (!todo.pagemodeselected || todo.pagemodeselected === '')) {
            return false;
          }
          if (todo.status === 'No Document' && (!todo.reason || todo.reason.trim() === '')) {
            return false;
          }
          if (todo.status === 'Uploaded' && !todo.file && !todo?.filename) {
            return false;
          }
          return true;
        };

        if (docRule.uploadrestriction === 'All') {
          const allValid = matchingTodos.every(checkConditions);
          if (!allValid) {
            groupErrors.push(`All documents under "${docRule.categoryname} - ${subCat}" must be filled correctly.`);
          }
        } else if (docRule.uploadrestriction === 'Any One') {
          const anyValid = matchingTodos.some(checkConditions);
          if (!anyValid) {
            groupErrors.push(`At least one document under "${docRule.categoryname} - ${subCat}" must be filled correctly.`);
          }
        }
      });
    });

    return groupErrors;
  };
  const nextStepFour = (action) => {
    // const newErrors = {};

    const errors = checkUploadRestrictions(files, categoryDocument);

    // Check the validity of field1

    // if (!employee?.firstname) {
    //   newErrors.firstname = <Typography style={{ color: 'red' }}>First name must be required</Typography>;
    // }

    if (errors.length > 0) {
      setPopupContentMalert(errors[0]); // show the first error
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      if (action === 'next') {
        setStep(step + 1);
      } else {
        setStep(step - 1);
      }
    }

    // setStep(step + 1);
    // setErrors(newErrors);

    // If there are no errors, submit the form
    // if (Object.keys(newErrors).length === 0) {
    //   setStep(step + 1);
    // }
  };
  const nextStepAddress = (action) => {
    const newErrors = {};
    const missingFieldstwo = [];

    if (
      !employee?.paddresstype ||
      !employee?.ppersonalprefix ||
      !employee?.presourcename ||
      !selectedCountryp?.name ||
      !selectedStatep?.name ||
      !employee?.plandmarkandpositionalprefix ||
      !employee?.plandmark ||
      !employee?.pdoorno ||
      !employee?.pstreet ||
      !employee?.parea ||
      !employee?.ppincode ||
      !employee?.pgpscoordination ||
      (!employee?.pgenerateviapincode && !selectedCityp?.name) ||
      (employee?.pgenerateviapincode && (!employee?.pvillageorcity || !employee?.pdistrict))
    ) {
      missingFieldstwo.push('Permanent Address');
      newErrors.paddress = <Typography style={{ color: 'red' }}>Please Fill All Permanent Address Fields</Typography>;
      // setPopupContentMalert('Please Fill All Permanent Address Fields!');
      // setPopupSeverityMalert('info');
      // handleClickOpenPopupMalert();
    }
    if (
      !employee.samesprmnt &&
      (!employee?.caddresstype ||
        !employee?.cpersonalprefix ||
        !employee?.cresourcename ||
        !selectedCountryc?.name ||
        !selectedStatec?.name ||
        !employee?.clandmarkandpositionalprefix ||
        !employee?.clandmark ||
        !employee?.cdoorno ||
        !employee?.cstreet ||
        !employee?.carea ||
        !employee?.cpincode ||
        !employee?.cgpscoordination ||
        (!employee?.cgenerateviapincode && !selectedCityc?.name) ||
        (employee?.cgenerateviapincode && (!employee?.cvillageorcity || !employee?.cdistrict)))
    ) {
      missingFieldstwo.push('Current Address');
      newErrors.caddress = <Typography style={{ color: 'red' }}>Please Fill All Current Address Fields</Typography>;
      // setPopupContentMalert('Please Fill All Current Address Fields!');
      // setPopupSeverityMalert('info');
      // handleClickOpenPopupMalert();
    }

    setErrors(newErrors);
    if (missingFieldstwo.length > 0) {
      setPopupContentMalert(`Please fill all fields in: ${missingFieldstwo.join(', ')}`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      if (Object.keys(newErrors).length === 0) {
        if (action === 'next') {
          setStep(step + 1);
        } else {
          setStep(step - 1);
        }
      }
    }
  };
  const [finderrorindex, setFinderrorindex] = useState([]);
  const [finderrorindexgrp, setFinderrorindexgrp] = useState([]);
  const [finderrorindexshift, setFinderrorindexshift] = useState([]);

  const [shifts, setShifts] = useState([]);

  const ShiftModeOptions = [
    { label: 'Shift', value: 'Shift' },
    { label: 'Week Off', value: 'Week Off' },
  ];

  const ShiftDropdwonsSecond = async (e) => {
    try {
      let ansGet = e;
      let answerFirst = ansGet?.split('_')[0];
      let answerSecond = ansGet?.split('_')[1];

      let res = await axios.get(SERVICE.GETALLSHIFTGROUPS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const shiftGroup = res?.data?.shiftgroupings.filter((data) => data.shiftday === answerFirst && data.shifthours === answerSecond);
      const shiftFlat = shiftGroup?.length > 0 ? shiftGroup?.flatMap((data) => data.shift) : [];

      setShifts(
        shiftFlat.map((data) => ({
          ...data,
          label: data,
          value: data,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const ShiftGroupingDropdwons = async () => {
    try {
      let res = await axios.get(SERVICE.GETALLSHIFTGROUPS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setShiftGroupingOptions(
        res?.data?.shiftgroupings.map((data) => ({
          ...data,
          label: data.shiftday + '_' + data.shifthours,
          value: data.shiftday + '_' + data.shifthours,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //login detail validation
  const nextStepLog = (action) => {
    const checkShiftMode = todo?.filter((d) => d.shiftmode === 'Please Select Shift Mode');
    const checkShiftGroup = todo?.filter((d) => d.shiftmode === 'Shift' && d.shiftgrouping === 'Please Select Shift Grouping');
    const checkShift = todo?.filter((d) => d.shiftmode === 'Shift' && d.shifttiming === 'Please Select Shift');

    let value = todo?.reduce((indexes, obj, index) => {
      if (obj.shiftmode === 'Please Select Shift Mode') {
        // Check if the object has the 'name' property
        indexes.push(index);
      }
      return indexes;
    }, []);

    setFinderrorindex(value);

    let valuegrp = todo?.reduce((indexes, obj, index) => {
      if (obj.shiftmode === 'Shift' && obj.shiftgrouping === 'Please Select Shift Grouping') {
        // Check if the object has the 'name' property
        indexes.push(index);
      }
      return indexes;
    }, []);

    setFinderrorindexgrp(valuegrp);

    let valuegrpshift = todo?.reduce((indexes, obj, index) => {
      if (obj.shiftmode === 'Shift' && obj.shifttiming === 'Please Select Shift') {
        // Check if the object has the 'name' property
        indexes.push(index);
      }
      return indexes;
    }, []);

    setFinderrorindexshift(valuegrpshift);

    let firstShift = todo?.filter((data) => data?.shiftmode !== 'Week Off');

    if (firstShift?.length > 0) {
      let shifthoursA = shifttiming?.find((data) => data?.name === firstShift[0]?.shifttiming);

      if (shifthoursA) {
        setLoginNotAllot({
          ...loginNotAllot,
          time: shifthoursA?.shifthours?.split(':')[0],
          timemins: shifthoursA?.shifthours?.split(':')[1],
        });
      }
    }

    const newErrorsLog = {};
    const missingFieldstwo = [];

    if (!enableLoginName && employee.username === '') {
      newErrorsLog.username = <Typography style={{ color: 'red' }}>username must be required</Typography>;
      missingFieldstwo.push('User Name');
    } else if (!enableLoginName && allUsersLoginName.includes(employee.username)) {
      newErrorsLog.username = <Typography style={{ color: 'red' }}>username already exist</Typography>;
      missingFieldstwo.push('User Already Exists');
    }

    if (employee.workmode === 'Please Select Work Mode' || employee.workmode === '' || employee.workmode == undefined) {
      newErrorsLog.workmode = <Typography style={{ color: 'red' }}>work mode must be required</Typography>;
      missingFieldstwo.push('Work Mode');
    }

    if (!selectedCompany) {
      newErrorsLog.company = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
      missingFieldstwo.push('Company');
    }

    if (!selectedBranch) {
      newErrorsLog.branch = <Typography style={{ color: 'red' }}>Branch must be required</Typography>;
      missingFieldstwo.push('Branch');
    }

    if (!employee.empcode && employee.wordcheck === false) {
      newErrorsLog.empcode = <Typography style={{ color: 'red' }}>EmpCode must be required</Typography>;
      missingFieldstwo.push('Empcode');
    }
    if (employeecodenew === '' && employee.wordcheck === true) {
      newErrorsLog.empcode = <Typography style={{ color: 'red' }}>EmpCode must be required</Typography>;
      missingFieldstwo.push('Empcode');
    }

    if (!employee.doj) {
      newErrorsLog.doj = <Typography style={{ color: 'red' }}>DOJ must be required</Typography>;
      missingFieldstwo.push('DOJ');
    }

    // if (!employee.companyemail) {
    //   newErrorsLog.companyemail = (
    //     <Typography style={{ color: "red" }}>
    //       Company Email must be required
    //     </Typography>
    //   );
    // } else
    // if (!validateEmail(employee.companyemail) && employee.companyemail) {
    //   newErrorsLog.companyemail = (
    //     <Typography style={{ color: "red" }}>
    //       Please enter valid Company Email
    //     </Typography>
    //   );
    //   missingFieldstwo.push("Valid Company Email");
    // }

    let validPassword = validatePassword(employee?.password, overllsettings);
    if (!validPassword?.isValid && isPasswordChange) {
      // newErrorsLog.password = <Typography style={{ color: 'red' }}>{validPassword?.errors[0]}</Typography>;
      newErrorsLog.password = (
        <Typography style={{ color: 'red' }}>
          {validPassword.errors.map((err, index) => (
            <div key={index}>{err}</div>
          ))}
        </Typography>
      );
      missingFieldstwo.push('Password');
    }

    if ((employee.wordcheck === false && empcodelimitedAll?.includes(employee.empcode)) || (employee.wordcheck === true && empcodelimitedAll?.includes(employeecodenew))) {
      newErrorsLog.empcode = <Typography style={{ color: 'red' }}>Empcode Already Exist</Typography>;
      missingFieldstwo.push('Empcode Already Exists');
    }

    if (employee.wordcheck === true && employeecodenew?.toLowerCase() === employee.empcode?.toLowerCase()) {
      newErrorsLog.empcode = <Typography style={{ color: 'red' }}>Empcode Auto and Manual Cant be Same</Typography>;
      missingFieldstwo.push('Empcode Auto and Manual Cant be Same');
    }

    if (!selectedUnit) {
      newErrorsLog.unit = <Typography style={{ color: 'red' }}>Unit must be required</Typography>;
      missingFieldstwo.push('Unit');
    }
    if (selectedTeam === '') {
      newErrorsLog.team = <Typography style={{ color: 'red' }}>Team must be required</Typography>;
      missingFieldstwo.push('Team');
    }
    if (!employee?.floor || employee?.floor === '' || employee?.floor == 'Please Select Floor') {
      newErrorsLog.floor = <Typography style={{ color: 'red' }}>Floor must be required</Typography>;
      missingFieldstwo.push('Floor');
    }
    if (!employee?.area || employee?.area === '' || employee?.area == 'Please Select Area') {
      newErrorsLog.area = <Typography style={{ color: 'red' }}> Area must be required</Typography>;
      missingFieldstwo.push('Area');
    }
    if (selectedDesignation === '') {
      newErrorsLog.designation = <Typography style={{ color: 'red' }}>Designation must be required</Typography>;
      missingFieldstwo.push('Designation');
    }
    if ((employee?.employeecount === '' || employee?.employeecount === '0' || !employee?.employeecount) && employee?.prod) {
      newErrorsLog.systemcount = <Typography style={{ color: 'red' }}>System Count must be required</Typography>;
      missingFieldstwo.push('System Count');
    }
    if ((primaryWorkStation === 'Please Select Primary Work Station' || primaryWorkStation === '' || !primaryWorkStation) && employee?.prod) {
      newErrorsLog.primaryworkstation = <Typography style={{ color: 'red' }}>Primary Work Station must be required</Typography>;
      missingFieldstwo.push('Primary Work Station');
    }
    if (!employee.department) {
      newErrorsLog.department = <Typography style={{ color: 'red' }}>Department must be required</Typography>;
      missingFieldstwo.push('Department');
    }

    let systemCount = valueWorkStation?.length || 0;

    // Add 1 if primaryWorkStation is valid (not empty or default)
    if (primaryWorkStation !== 'Please Select Primary Work Station' && primaryWorkStation !== '' && primaryWorkStation !== undefined) {
      systemCount += 1;
    }

    // Check if system count exceeds allowed employee count
    if (Number(maxSelections) && systemCount > Number(maxSelections)) {
      newErrorsLog.workstation = <Typography style={{ color: 'red' }}>Work Station Exceeds System Count</Typography>;
      missingFieldstwo.push('Work Station Exceeds System Count');
    }

    if (employee.shifttype === 'Please Select Shift Type') {
      newErrorsLog.shifttype = <Typography style={{ color: 'red' }}>Shifttype must be required</Typography>;
      missingFieldstwo.push('Shift Type');
    }

    if (employee.shifttype === 'Standard') {
      if (employee.shiftgrouping === 'Please Select Shift Grouping') {
        newErrorsLog.shiftgrouping = <Typography style={{ color: 'red' }}>Shiftgrouping must be required</Typography>;
        missingFieldstwo.push('Shift Grouping');
      } else if (employee.shifttiming === 'Please Select Shift') {
        newErrorsLog.shifttiming = <Typography style={{ color: 'red' }}>Shifttiming must be required</Typography>;
        missingFieldstwo.push('Shift Timing');
      }
    }

    let oneweekrotation = weekoptions2weeks?.filter((item) => !todo?.some((val) => val?.week === item))?.length;
    let twoweekrotation = weekoptions1month?.filter((item) => !todo?.some((val) => val?.week === item))?.length;
    let onemonthrotation = weekoptions2months?.filter((item) => !todo?.some((val) => val?.week === item))?.length;

    if (employee.shifttype === 'Daily' && todo?.length === 0) {
      newErrorsLog.shiftweeks = <Typography style={{ color: 'red' }}>Please Add all the weeks in the todo</Typography>;
      missingFieldstwo.push('Shift Todo');
    } else if (employee.shifttype === '1 Week Rotation' && oneweekrotation > 0) {
      newErrorsLog.shiftweeks = <Typography style={{ color: 'red' }}>Please Add all the weeks in the todo</Typography>;
      missingFieldstwo.push('Shift Todo');
    } else if (employee.shifttype === '2 Week Rotation' && twoweekrotation > 0) {
      newErrorsLog.shiftweeks = <Typography style={{ color: 'red' }}>Please Add all the weeks in the todo</Typography>;
      missingFieldstwo.push('Shift Todo');
    } else if (employee.shifttype === '1 Month Rotation' && onemonthrotation > 0) {
      newErrorsLog.shiftweeks = <Typography style={{ color: 'red' }}>Please Add all the weeks in the todo</Typography>;
      missingFieldstwo.push('Shift Todo');
    }

    if ((employee.shifttype === 'Daily' || employee.shifttype === '1 Week Rotation' || employee.shifttype === '2 Week Rotation' || employee.shifttype === '1 Month Rotation') && checkShiftMode?.length > 0) {
      newErrorsLog.checkShiftMode = <Typography style={{ color: 'red' }}>Shift Mode must be required</Typography>;
      missingFieldstwo.push('Shift Mode');
    }
    if ((employee.shifttype === 'Daily' || employee.shifttype === '1 Week Rotation' || employee.shifttype === '2 Week Rotation' || employee.shifttype === '1 Month Rotation') && checkShiftGroup?.length > 0) {
      newErrorsLog.checkShiftGroup = <Typography style={{ color: 'red' }}>Shift Group must be required</Typography>;
      missingFieldstwo.push('Shift Group');
    }

    if ((employee.shifttype === 'Daily' || employee.shifttype === '1 Week Rotation' || employee.shifttype === '2 Week Rotation' || employee.shifttype === '1 Month Rotation') && checkShift?.length > 0) {
      newErrorsLog.checkShift = <Typography style={{ color: 'red' }}>Shift must be required</Typography>;
      missingFieldstwo.push('Shift');
    }

    if (employee.reportingto === '') {
      newErrorsLog.reportingto = <Typography style={{ color: 'red' }}>Reporting must be required</Typography>;
      missingFieldstwo.push('Reporting To');
    }

    if (employee.ifoffice === true && primaryWorkStationInput === '') {
      newErrorsLog.primaryworkstationinput = <Typography style={{ color: 'red' }}>Work Station (WFH) must be required</Typography>;
      missingFieldstwo.push('Work Station(WFH)');
    }

    if (selectedAttMode?.length === 0) {
      newErrorsLog.attmode = <Typography style={{ color: 'red' }}>Attendance Mode must be required</Typography>;
      missingFieldstwo.push('Attendance Mode');
    }

    if ((employee.enquirystatus === 'Please Select Status' || employee.enquirystatus === '' || employee.enquirystatus == undefined) && (isUserRoleAccess.role.includes('Manager') || isUserRoleCompare.includes('lassignenquierypurpose'))) {
      newErrorsLog.enquirystatus = <Typography style={{ color: 'red' }}>Status must be required</Typography>;
      missingFieldstwo.push('Status');
    }

    setErrorsLog({ ...newErrorsLog, ...todo });

    if (missingFieldstwo?.length > 0) {
      setPopupContentMalert(`Please fill in the following fields: ${missingFieldstwo.join(', ')}`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      if (Object.keys(newErrorsLog)?.length === 0) {
        if (action === 'next') {
          setStep(step + 1);
        } else {
          setStep(step - 1);
        }
      }
    }
  };

  const handleSubmitMulti = (e) => {
    e.preventDefault();

    const isValidObject = (obj) => {
      for (let key in obj) {
        if (obj[key] === '' || obj[key] === undefined || obj[key] === null || obj[key] === 'Please Select Account Type') {
          return false;
        }
      }
      return true;
    };

    const areAllObjectsValid = (arr) => {
      for (let obj of arr) {
        if (!isValidObject(obj)) {
          return false;
        }
      }
      return true;
    };

    const exists = bankTodo?.some((obj, index, arr) => arr.findIndex((item) => item.accountnumber === obj.accountnumber) !== index);
    const activeexists = bankTodo.filter((data) => data.accountstatus === 'Active');

    const newErrorsLog = {};
    const missingFieldsthree = [];
    if (isPasswordChange) {
      // Check the validity of field1
      if (!assignExperience.updatedate) {
        newErrorsLog.updatedate = <Typography style={{ color: 'red' }}>Please Select Date</Typography>;
        missingFieldsthree.push('Select Date');
      }
      if ((assignExperience.assignExpMode === 'Add' || assignExperience.assignExpMode === 'Minus' || assignExperience.assignExpMode === 'Fix') && !assignExperience.assignExpvalue) {
        newErrorsLog.assignexpvalue = <Typography style={{ color: 'red' }}>Please Enter Value</Typography>;
        missingFieldsthree.push('Exp Log Details');
      }
      if (assignExperience.assignEndExpvalue === 'Yes' && assignExperience.assignEndExpDate === '') {
        newErrorsLog.endexpdate = <Typography style={{ color: 'red' }}>Please Select EndExp Date</Typography>;
        missingFieldsthree.push('Select EndExp Date');
      }
      if (assignExperience.assignEndTarvalue === 'Yes' && assignExperience.assignEndTarDate === '') {
        newErrorsLog.endtardate = <Typography style={{ color: 'red' }}>Please Select EndTar Date</Typography>;
        missingFieldsthree.push('Select EndTar Date');
      }
      if (
        !employee?.paddresstype ||
        !employee?.ppersonalprefix ||
        !employee?.presourcename ||
        !selectedCountryp?.name ||
        !selectedStatep?.name ||
        !employee?.plandmarkandpositionalprefix ||
        !employee?.plandmark ||
        !employee?.pdoorno ||
        !employee?.pstreet ||
        !employee?.parea ||
        !employee?.ppincode ||
        !employee?.pgpscoordination ||
        (!employee?.pgenerateviapincode && !selectedCityp?.name) ||
        (employee?.pgenerateviapincode && (!employee?.pvillageorcity || !employee?.pdistrict))
      ) {
        missingFieldsthree.push('Permanent Address');
        newErrorsLog.paddress = <Typography style={{ color: 'red' }}>Please Fill All Permanent Address Fields</Typography>;
        // setPopupContentMalert('Please Fill All Permanent Address Fields!');
        // setPopupSeverityMalert('info');
        // handleClickOpenPopupMalert();
      }
      if (
        !employee.samesprmnt &&
        (!employee?.caddresstype ||
          !employee?.cpersonalprefix ||
          !employee?.cresourcename ||
          !selectedCountryc?.name ||
          !selectedStatec?.name ||
          !employee?.clandmarkandpositionalprefix ||
          !employee?.clandmark ||
          !employee?.cdoorno ||
          !employee?.cstreet ||
          !employee?.carea ||
          !employee?.cpincode ||
          !employee?.cgpscoordination ||
          (!employee?.cgenerateviapincode && !selectedCityc?.name) ||
          (employee?.cgenerateviapincode && (!employee?.cvillageorcity || !employee?.cdistrict)))
      ) {
        missingFieldsthree.push('Current Address');
        newErrorsLog.caddress = <Typography style={{ color: 'red' }}>Please Fill All Current Address Fields</Typography>;
        // setPopupContentMalert('Please Fill All Current Address Fields!');
        // setPopupSeverityMalert('info');
        // handleClickOpenPopupMalert();
      }
      const accessibleTodoexists = accessibleTodo.some((obj, index, arr) => arr.findIndex((item) => item.fromcompany === obj.fromcompany && item.frombranch === obj.frombranch && item.fromunit === obj.fromunit) !== index);
      if (accessibleTodo?.length === 0) {
        setPopupContentMalert('Please Add Accessible Company/Branch/Unit.!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        newErrorsLog.accessiblecompany = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
        missingFieldsthree.push('Company');
      } else if (
        accessibleTodo?.some(
          (data) => data?.fromcompany === 'Please Select Company' || data?.frombranch === 'Please Select Branch' || data?.fromunit === 'Please Select Unit' || data?.fromcompany === '' || data?.frombranch === '' || data?.fromunit === '' || !data?.fromcompany || !data?.frombranch || !data?.fromunit
        )
      ) {
        setPopupContentMalert('Please Fill All the fields in Accessible Company/Branch/Unit Todo.!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        newErrorsLog.accessiblecompany = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
        missingFieldsthree.push('Company');
      } else if (accessibleTodoexists) {
        setPopupContentMalert('Duplicate Accessible Company/Branch/Unit.!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        newErrorsLog.accessiblecompany = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
        missingFieldsthree.push('Company');
      }

      if (bankTodo?.length > 0 && !areAllObjectsValid(bankTodo)) {
        setPopupContentMalert('Please fill all the Fields in Bank Details Todo!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else if (bankTodo?.length > 0 && exists) {
        setPopupContentMalert('Duplicate account number found!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else if (activeexists?.length > 1) {
        setPopupContentMalert('Only one active account is allowed at a time!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        newErrorsLog.accountstatus = <Typography style={{ color: 'red' }}>Only one active account is allowed at a time.</Typography>;
        missingFieldsthree.push(' Only one active account is allowed at a time');
      }

      if (salaryOption === 'Experience Based' && (loginNotAllot.process === 'Please Select Process' || loginNotAllot.process === '' || loginNotAllot.process == undefined)) {
        newErrorsLog.process = <Typography style={{ color: 'red' }}>Process must be required</Typography>;
        missingFieldsthree.push('Process');
      }
      if (
        salaryOption === 'Experience Based' &&
        (loginNotAllot.time === 'Hrs' || loginNotAllot.time === '' || loginNotAllot.time == undefined || loginNotAllot.timemins === '' || loginNotAllot.timemins == undefined || loginNotAllot.timemins === 'Mins' || (loginNotAllot.time === '00' && loginNotAllot.timemins === '00'))
      ) {
        newErrorsLog.duration = <Typography style={{ color: 'red' }}>Duration must be required</Typography>;
        missingFieldsthree.push('Duration');
      }

      setErrorsLog(newErrorsLog);
      if (Object.keys(newErrorsLog)?.length === 0 && (bankTodo?.length === 0 || (bankTodo?.length > 0 && areAllObjectsValid(bankTodo) && !exists))) {
        sendRequest();
      }
      // sendRequest();
    } else {
      // Check the validity of field1
      if (!assignExperience.updatedate) {
        newErrorsLog.updatedate = <Typography style={{ color: 'red' }}>Please Select Date</Typography>;
        missingFieldsthree.push('Select Date');
      }
      if ((assignExperience.assignExpMode === 'Add' || assignExperience.assignExpMode === 'Minus' || assignExperience.assignExpMode === 'Fix') && !assignExperience.assignExpvalue) {
        newErrorsLog.assignexpvalue = <Typography style={{ color: 'red' }}>Please Enter Value</Typography>;
        missingFieldsthree.push('Exp Log Details');
      }
      if ((assignExperience.assignExpMode === 'Add' || assignExperience.assignExpMode === 'Minus' || assignExperience.assignExpMode === 'Fix') && !assignExperience.assignExpvalue) {
        newErrorsLog.assignexpvalue = <Typography style={{ color: 'red' }}>Please Enter Value</Typography>;
        missingFieldsthree.push('Exp Log Details');
      }
      if (assignExperience.assignEndExpvalue === 'Yes' && assignExperience.assignEndExpDate === '') {
        newErrorsLog.endexpdate = <Typography style={{ color: 'red' }}>Please Select EndExp Date</Typography>;
        missingFieldsthree.push('Select EndExp Date');
      }
      if (assignExperience.assignEndTarvalue === 'Yes' && assignExperience.assignEndTarDate === '') {
        newErrorsLog.endtardate = <Typography style={{ color: 'red' }}>Please Select EndTar Date</Typography>;
        missingFieldsthree.push('Select EndTar Date');
      }

      const accessibleTodoexists = accessibleTodo.some((obj, index, arr) => arr.findIndex((item) => item.fromcompany === obj.fromcompany && item.frombranch === obj.frombranch && item.fromunit === obj.fromunit) !== index);
      if (accessibleTodo?.length === 0) {
        setPopupContentMalert('Please Add Accessible Company/Branch/Unit!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        newErrorsLog.accessiblecompany = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
        missingFieldsthree.push('Company');
      } else if (
        accessibleTodo?.some(
          (data) => data?.fromcompany === 'Please Select Company' || data?.frombranch === 'Please Select Branch' || data?.fromunit === 'Please Select Unit' || data?.fromcompany === '' || data?.frombranch === '' || data?.fromunit === '' || !data?.fromcompany || !data?.frombranch || !data?.fromunit
        )
      ) {
        setPopupContentMalert('Please Fill All the fields in Accessible Company/Branch/Unit Todo!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        newErrorsLog.accessiblecompany = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
        missingFieldsthree.push('Company');
      } else if (accessibleTodoexists) {
        setPopupContentMalert('Duplicate Accessible Company/Branch/Unit!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        newErrorsLog.accessiblecompany = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
        missingFieldsthree.push('Company');
      }

      if (
        !employee?.paddresstype ||
        !employee?.ppersonalprefix ||
        !employee?.presourcename ||
        !selectedCountryp?.name ||
        !selectedStatep?.name ||
        !employee?.plandmarkandpositionalprefix ||
        !employee?.plandmark ||
        !employee?.pdoorno ||
        !employee?.pstreet ||
        !employee?.parea ||
        !employee?.ppincode ||
        !employee?.pgpscoordination ||
        (!employee?.pgenerateviapincode && !selectedCityp?.name) ||
        (employee?.pgenerateviapincode && (!employee?.pvillageorcity || !employee?.pdistrict))
      ) {
        missingFieldsthree.push('Permanent Address');
        newErrorsLog.paddress = <Typography style={{ color: 'red' }}>Please Fill All Permanent Address Fields</Typography>;
        // setPopupContentMalert('Please Fill All Permanent Address Fields!');
        // setPopupSeverityMalert('info');
        // handleClickOpenPopupMalert();
      }
      if (
        !employee.samesprmnt &&
        (!employee?.caddresstype ||
          !employee?.cpersonalprefix ||
          !employee?.cresourcename ||
          !selectedCountryc?.name ||
          !selectedStatec?.name ||
          !employee?.clandmarkandpositionalprefix ||
          !employee?.clandmark ||
          !employee?.cdoorno ||
          !employee?.cstreet ||
          !employee?.carea ||
          !employee?.cpincode ||
          !employee?.cgpscoordination ||
          (!employee?.cgenerateviapincode && !selectedCityc?.name) ||
          (employee?.cgenerateviapincode && (!employee?.cvillageorcity || !employee?.cdistrict)))
      ) {
        missingFieldsthree.push('Current Address');
        newErrorsLog.caddress = <Typography style={{ color: 'red' }}>Please Fill All Current Address Fields</Typography>;
        // setPopupContentMalert('Please Fill All Current Address Fields!');
        // setPopupSeverityMalert('info');
        // handleClickOpenPopupMalert();
      }

      if (bankTodo?.length > 0 && !areAllObjectsValid(bankTodo)) {
        setPopupContentMalert('Please fill all the Fields in Bank Details Todo!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else if (bankTodo?.length > 0 && exists) {
        setPopupContentMalert('Duplicate account number found!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else if (activeexists?.length > 1) {
        setPopupContentMalert('Only one active account is allowed at a time!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        newErrorsLog.accountstatus = <Typography style={{ color: 'red' }}>Only one active account is allowed at a time.</Typography>;
        missingFieldsthree.push('Only one active account is allowed at a time');
      }

      if (salaryOption === 'Experience Based' && (loginNotAllot.process === 'Please Select Process' || loginNotAllot.process === '' || loginNotAllot.process == undefined)) {
        newErrorsLog.process = <Typography style={{ color: 'red' }}>Process must be required</Typography>;
        missingFieldsthree.push('Process');
      }
      if (
        salaryOption === 'Experience Based' &&
        (loginNotAllot.time === 'Hrs' || loginNotAllot.time === '' || loginNotAllot.time == undefined || loginNotAllot.timemins === '' || loginNotAllot.timemins == undefined || loginNotAllot.timemins === 'Mins' || (loginNotAllot.time === '00' && loginNotAllot.timemins === '00'))
      ) {
        newErrorsLog.duration = <Typography style={{ color: 'red' }}>Duration must be required</Typography>;
        missingFieldsthree.push('Duration');
      }

      // If there are missing fields, show an alert with the list of them
      if (missingFieldsthree?.length > 0) {
        setPopupContentMalert(`Please fill in the following fields: ${missingFieldsthree.join(', ')}`);
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else {
        setErrorsLog(newErrorsLog);
        if (Object.keys(newErrorsLog)?.length === 0 && (bankTodo?.length === 0 || (bankTodo?.length > 0 && areAllObjectsValid(bankTodo) && !exists))) {
          sendRequestpwd();
        }
      }
    }
  };
  useEffect(() => {
    let addressParts = [];

    if (employee?.pvillageorcity) addressParts.push(employee?.pvillageorcity);
    if (employee?.pdistrict) addressParts.push(employee?.pdistrict);
    if (selectedCityp?.name && !employee?.pgenerateviapincode) addressParts.push(selectedCityp.name);
    if (selectedStatep?.name) addressParts.push(selectedStatep?.name);
    if (selectedCountryp?.name) addressParts.push(selectedCountryp.name);
    if (employee?.ppincode) addressParts.push(employee?.ppincode);

    const fullAddress = addressParts.filter(Boolean).join(', ');

    if (fullAddress.trim()) {
      const encodedAddress = encodeURIComponent(fullAddress);
      const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

      setEmployee((prev) => ({
        ...prev,
        pgpscoordination: mapLink,
        cgpscoordination: employee?.samesprmnt ? mapLink : '',
      }));
    }
  }, [employee?.pvillageorcity, employee?.pdistrict, selectedCityp?.name, selectedStatep?.name, employee?.ppincode, selectedCountryp?.name, employee?.pgenerateviapincode]);

  useEffect(() => {
    let addressParts = [];

    if (employee?.cvillageorcity) addressParts.push(employee?.cvillageorcity);
    if (employee?.cdistrict) addressParts.push(employee?.cdistrict);
    if (selectedCityc?.name && !employee?.cgenerateviapincode) addressParts.push(selectedCityc.name);
    if (selectedStatec?.name) addressParts.push(selectedStatec?.name);
    if (selectedCountryc?.name) addressParts.push(selectedCountryc.name);
    if (employee?.cpincode) addressParts.push(employee?.cpincode);

    const fullAddress = addressParts.filter(Boolean).join(', ');

    if (fullAddress.trim() && !employee?.samesprmnt) {
      const encodedAddress = encodeURIComponent(fullAddress);
      const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

      setEmployee((prev) => ({
        ...prev,
        cgpscoordination: mapLink,
      }));
    }
  }, [employee?.cvillageorcity, employee?.cdistrict, selectedCityc?.name, selectedStatec?.name, employee?.cpincode, selectedCountryc?.name, employee?.cgenerateviapincode]);

  const [switchValues, setSwicthValues] = useState({
    educationInstitution: false,
    additionalInstitution: false,
    workDesignation: false,
    workDuties: false,
    workReason: false,
    pvillageorcity: false,
    cvillageorcity: false,
  });
  useEffect(() => {
    fetchMasterFieldValues();
  }, []);
  const [masterFieldValues, setMasterFieldValues] = useState();
  const fetchMasterFieldValues = async () => {
    try {
      const aggregationPipeline = [
        {
          $project: {
            eduInstitutions: {
              $filter: {
                input: {
                  $map: {
                    input: { $ifNull: ['$eduTodo', []] },
                    as: 'edu',
                    in: '$$edu.institution',
                  },
                },
                as: 'item',
                cond: {
                  $and: [{ $ne: ['$$item', null] }, { $ne: ['$$item', ''] }],
                },
              },
            },
            addInstitutions: {
              $filter: {
                input: {
                  $map: {
                    input: { $ifNull: ['$addAddQuaTodo', []] },
                    as: 'add',
                    in: '$$add.addInst',
                  },
                },
                as: 'item',
                cond: {
                  $and: [{ $ne: ['$$item', null] }, { $ne: ['$$item', ''] }],
                },
              },
            },
            empNames: {
              $filter: {
                input: {
                  $map: {
                    input: { $ifNull: ['$workhistTodo', []] },
                    as: 'w',
                    in: '$$w.empNameTodo',
                  },
                },
                as: 'item',
                cond: {
                  $and: [{ $ne: ['$$item', null] }, { $ne: ['$$item', ''] }],
                },
              },
            },
            designations: {
              $filter: {
                input: {
                  $map: {
                    input: { $ifNull: ['$workhistTodo', []] },
                    as: 'w',
                    in: '$$w.desigTodo',
                  },
                },
                as: 'item',
                cond: {
                  $and: [{ $ne: ['$$item', null] }, { $ne: ['$$item', ''] }],
                },
              },
            },
            duties: {
              $filter: {
                input: {
                  $map: {
                    input: { $ifNull: ['$workhistTodo', []] },
                    as: 'w',
                    in: '$$w.dutiesTodo',
                  },
                },
                as: 'item',
                cond: {
                  $and: [{ $ne: ['$$item', null] }, { $ne: ['$$item', ''] }],
                },
              },
            },
            reasons: {
              $filter: {
                input: {
                  $map: {
                    input: { $ifNull: ['$workhistTodo', []] },
                    as: 'w',
                    in: '$$w.reasonTodo',
                  },
                },
                as: 'item',
                cond: {
                  $and: [{ $ne: ['$$item', null] }, { $ne: ['$$item', ''] }],
                },
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            eduInstitutions: { $addToSet: '$eduInstitutions' },
            addInstitutions: { $addToSet: '$addInstitutions' },
            empNames: { $addToSet: '$empNames' },
            designations: { $addToSet: '$designations' },
            duties: { $addToSet: '$duties' },
            reasons: { $addToSet: '$reasons' },
          },
        },
        {
          $project: {
            _id: 0,
            eduInstitutions: {
              $reduce: {
                input: '$eduInstitutions',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] },
              },
            },
            addInstitutions: {
              $reduce: {
                input: '$addInstitutions',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] },
              },
            },
            empNames: {
              $reduce: {
                input: '$empNames',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] },
              },
            },
            designations: {
              $reduce: {
                input: '$designations',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] },
              },
            },
            duties: {
              $reduce: {
                input: '$duties',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] },
              },
            },
            reasons: {
              $reduce: {
                input: '$reasons',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] },
              },
            },
          },
        },
      ];

      let req = await axios.post(
        SERVICE.DYNAMICUSER_CONTROLLER,
        {
          aggregationPipeline,
          from: 'Employee Documents',
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      let result = req.data.users;

      console.log(result, 'sdfsdfsd');
      setMasterFieldValues(result?.length > 0 ? result[0] : {});
    } catch (err) {
      console.log(err);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleLastPrev = (e) => {
    e.preventDefault();

    const isValidObject = (obj) => {
      for (let key in obj) {
        if (obj[key] === '' || obj[key] === undefined || obj[key] === null || obj[key] === 'Please Select Account Type') {
          return false;
        }
      }
      return true;
    };

    const areAllObjectsValid = (arr) => {
      for (let obj of arr) {
        if (!isValidObject(obj)) {
          return false;
        }
      }
      return true;
    };

    const exists = bankTodo?.some((obj, index, arr) => arr.findIndex((item) => item.accountnumber === obj.accountnumber) !== index);

    const activeexists = bankTodo.filter((data) => data.accountstatus === 'Active');

    const newErrorsLog = {};
    const missingFieldsthree = [];

    if (isPasswordChange) {
      // Check the validity of field1
      if (!assignExperience.updatedate) {
        newErrorsLog.updatedate = <Typography style={{ color: 'red' }}>Please Select Date</Typography>;
        missingFieldsthree.push('Select Date');
      }
      if ((assignExperience.assignExpMode === 'Add' || assignExperience.assignExpMode === 'Minus' || assignExperience.assignExpMode === 'Fix') && !assignExperience.assignExpvalue) {
        newErrorsLog.assignexpvalue = <Typography style={{ color: 'red' }}>Please Enter Value</Typography>;
        missingFieldsthree.push('Exp Log Details');
      }
      if (assignExperience.assignEndExpvalue === 'Yes' && assignExperience.assignEndExpDate === '') {
        newErrorsLog.endexpdate = <Typography style={{ color: 'red' }}>Please Select EndExp Date</Typography>;
        missingFieldsthree.push('Select EndExp Date');
      }
      if (assignExperience.assignEndTarvalue === 'Yes' && assignExperience.assignEndTarDate === '') {
        newErrorsLog.endtardate = <Typography style={{ color: 'red' }}>Please Select EndTar Date</Typography>;
        missingFieldsthree.push('Select EndTar Date');
      }

      const accessibleTodoexists = accessibleTodo.some((obj, index, arr) => arr.findIndex((item) => item.fromcompany === obj.fromcompany && item.frombranch === obj.frombranch && item.fromunit === obj.fromunit) !== index);
      if (accessibleTodo?.length === 0) {
        setPopupContentMalert('Please Add Accessible Company/Branch/Unit!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        newErrorsLog.accessiblecompany = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
        missingFieldsthree.push('Company');
      } else if (
        accessibleTodo?.some(
          (data) => data?.fromcompany === 'Please Select Company' || data?.frombranch === 'Please Select Branch' || data?.fromunit === 'Please Select Unit' || data?.fromcompany === '' || data?.frombranch === '' || data?.fromunit === '' || !data?.fromcompany || !data?.frombranch || !data?.fromunit
        )
      ) {
        setPopupContentMalert('Please Fill All the fields in Accessible Company/Branch/Unit Todo!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        newErrorsLog.accessiblecompany = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
        missingFieldsthree.push('Company');
      } else if (accessibleTodoexists) {
        setPopupContentMalert('Duplicate Accessible Company/Branch/Unit!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        newErrorsLog.accessiblecompany = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
        missingFieldsthree.push('Company');
      }

      if (bankTodo?.length > 0 && !areAllObjectsValid(bankTodo)) {
        setPopupContentMalert('Please fill all the Fields in Bank Details Todo!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else if (bankTodo?.length > 0 && exists) {
        setPopupContentMalert('Duplicate account number found!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else if (activeexists?.length > 1) {
        setPopupContentMalert('Only one active account is allowed at a time!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        newErrorsLog.accountstatus = <Typography style={{ color: 'red' }}>Only one active account is allowed at a time.</Typography>;
        missingFieldsthree.push(' Only one active account is allowed at a time');
      }

      if (salaryOption === 'Experience Based' && (loginNotAllot.process === 'Please Select Process' || loginNotAllot.process === '' || loginNotAllot.process == undefined)) {
        newErrorsLog.process = <Typography style={{ color: 'red' }}>Process must be required</Typography>;
        missingFieldsthree.push('Process');
      }
      if (
        salaryOption === 'Experience Based' &&
        (loginNotAllot.time === 'Hrs' || loginNotAllot.time === '' || loginNotAllot.time == undefined || loginNotAllot.timemins === '' || loginNotAllot.timemins == undefined || loginNotAllot.timemins === 'Mins' || (loginNotAllot.time === '00' && loginNotAllot.timemins === '00'))
      ) {
        newErrorsLog.duration = <Typography style={{ color: 'red' }}>Duration must be required</Typography>;
        missingFieldsthree.push('Duration');
      }

      setErrorsLog(newErrorsLog);
      if (Object.keys(newErrorsLog)?.length === 0 && (bankTodo?.length === 0 || (bankTodo?.length > 0 && areAllObjectsValid(bankTodo) && !exists))) {
        setStep(step - 1);
      }
    } else {
      // Check the validity of field1
      if (!assignExperience.updatedate) {
        newErrorsLog.updatedate = <Typography style={{ color: 'red' }}>Please Select Date</Typography>;
        missingFieldsthree.push('Select Date');
      }
      if ((assignExperience.assignExpMode === 'Add' || assignExperience.assignExpMode === 'Minus' || assignExperience.assignExpMode === 'Fix') && !assignExperience.assignExpvalue) {
        newErrorsLog.assignexpvalue = <Typography style={{ color: 'red' }}>Please Enter Value</Typography>;
        missingFieldsthree.push('Exp Log Details');
      }
      if (assignExperience.assignEndExpvalue === 'Yes' && assignExperience.assignEndExpDate === '') {
        newErrorsLog.endexpdate = <Typography style={{ color: 'red' }}>Please Select EndExp Date</Typography>;
        missingFieldsthree.push('Select EndExp Date');
      }
      if (assignExperience.assignEndTarvalue === 'Yes' && assignExperience.assignEndTarDate === '') {
        newErrorsLog.endtardate = <Typography style={{ color: 'red' }}>Please Select EndTar Date</Typography>;
        missingFieldsthree.push('Select EndTar Date');
      }

      const accessibleTodoexists = accessibleTodo.some((obj, index, arr) => arr.findIndex((item) => item.fromcompany === obj.fromcompany && item.frombranch === obj.frombranch && item.fromunit === obj.fromunit) !== index);
      if (accessibleTodo?.length === 0) {
        setPopupContentMalert('Please Add Accessible Company/Branch/Unit!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        newErrorsLog.accessiblecompany = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
        missingFieldsthree.push('Company');
      } else if (
        accessibleTodo?.some(
          (data) => data?.fromcompany === 'Please Select Company' || data?.frombranch === 'Please Select Branch' || data?.fromunit === 'Please Select Unit' || data?.fromcompany === '' || data?.frombranch === '' || data?.fromunit === '' || !data?.fromcompany || !data?.frombranch || !data?.fromunit
        )
      ) {
        setPopupContentMalert('Please Fill All the fields in Accessible Company/Branch/Unit Todo!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        newErrorsLog.accessiblecompany = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
        missingFieldsthree.push('Company');
      } else if (accessibleTodoexists) {
        setPopupContentMalert('Duplicate Accessible Company/Branch/Unit!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        newErrorsLog.accessiblecompany = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
        missingFieldsthree.push('Company');
      }

      if (bankTodo?.length > 0 && !areAllObjectsValid(bankTodo)) {
        setPopupContentMalert('Please fill all the Fields in Bank Details Todo!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else if (bankTodo?.length > 0 && exists) {
        setPopupContentMalert('Duplicate account number found!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else if (activeexists?.length > 1) {
        setPopupContentMalert('Only one active account is allowed at a time!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        newErrorsLog.accountstatus = <Typography style={{ color: 'red' }}>Only one active account is allowed at a time.</Typography>;
        missingFieldsthree.push(' Only one active account is allowed at a time');
      }

      if (salaryOption === 'Experience Based' && (loginNotAllot.process === 'Please Select Process' || loginNotAllot.process === '' || loginNotAllot.process == undefined)) {
        newErrorsLog.process = <Typography style={{ color: 'red' }}>Process must be required</Typography>;
        missingFieldsthree.push('process');
      }
      if (
        salaryOption === 'Experience Based' &&
        (loginNotAllot.time === 'Hrs' || loginNotAllot.time === '' || loginNotAllot.time == undefined || loginNotAllot.timemins === '' || loginNotAllot.timemins == undefined || loginNotAllot.timemins === 'Mins' || (loginNotAllot.time === '00' && loginNotAllot.timemins === '00'))
      ) {
        newErrorsLog.duration = <Typography style={{ color: 'red' }}>Duration must be required</Typography>;
        missingFieldsthree.push('Duration');
      }

      setErrorsLog(newErrorsLog);
      if (missingFieldsthree?.length > 0) {
        setPopupContentMalert(`Please fill in the following fields: ${missingFieldsthree.join(', ')}`);
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else {
        if (Object.keys(newErrorsLog)?.length === 0 && (bankTodo?.length === 0 || (bankTodo?.length > 0 && areAllObjectsValid(bankTodo) && !exists))) {
          setStep(step - 1);
        }
      }
    }
  };

  const handleSubmitMultiPersonal = (e) => {
    e.preventDefault();

    const newErrors = {};

    const missingFields = [];

    // Check the validity of field1

    if (!employee.firstname) {
      newErrors.firstname = <Typography style={{ color: 'red' }}>First name must be required</Typography>;
      missingFields.push('First Name');
    }

    if (!employee.lastname) {
      newErrors.lastname = <Typography style={{ color: 'red' }}>Last name must be required</Typography>;
      missingFields.push('Last Name');
    }
    if (!employee.legalname) {
      newErrors.legalname = <Typography style={{ color: 'red' }}>Legal name must be required</Typography>;
      missingFields.push('Legal Name');
    }

    if (!employee.callingname) {
      newErrors.callingname = <Typography style={{ color: 'red' }}>Calling name must be required</Typography>;
      missingFields.push('Calling Name');
    }
    // if (
    //   employee.callingname !== "" &&
    //   employee.legalname !== "" &&
    //   employee.callingname?.toLowerCase() === employee.legalname?.toLowerCase()
    // ) {
    //   newErrors.callingname = (
    //     <Typography style={{ color: "red" }}>
    //       Legal Name and Calling Name can't be same
    //     </Typography>
    //   );
    //   missingFields.push("Legal Name and Calling Name can't be same");
    // }
    if (!employee.email) {
      newErrors.email = <Typography style={{ color: 'red' }}>Email must be required</Typography>;
      missingFields.push('Email');
    } else if (!isValidEmail) {
      newErrors.email = <Typography style={{ color: 'red' }}>Please enter valid email</Typography>;
      missingFields.push('Enter valid Email');
    }

    if (employee.maritalstatus === 'Married' && !employee.dom) {
      newErrors.dom = <Typography style={{ color: 'red' }}>DOM must be required</Typography>;
      missingFields.push('Date of Marriage ');
    }
    if (employee.emergencyno !== '' && employee.emergencyno?.length != 10) {
      newErrors.emergencyno = <Typography style={{ color: 'red' }}>Emergency no must be 10 digits required</Typography>;
      missingFields.push('Enter valid Emergency No');
    }

    if (!employee.emergencyno && employee.emergencyno?.length != 10) {
      newErrors.emergencyno = <Typography style={{ color: 'red' }}>Emergency no must be 10 digits required</Typography>;
      missingFields.push('Enter valid Emergency No');
    }
    if (employee.contactfamily === '' || !employee.contactfamily) {
      newErrors.contactfamily = <Typography style={{ color: 'red' }}>Contact(Family) no must be required</Typography>;
      missingFields.push('Contact(Family)');
    }
    if (employee.contactfamily === '' || !employee.contactfamily) {
      newErrors.contactfamily = <Typography style={{ color: 'red' }}>Contact(Family) no must be required</Typography>;
      missingFields.push('Contact(Family)');
    }
    if (employee.contactfamily !== '' && employee.contactfamily?.length !== 10) {
      newErrors.contactfamily = <Typography style={{ color: 'red' }}>Contact(Family) no must be 10 digits required</Typography>;
      missingFields.push('Enter valid Contact(Family');
    }
    if (employee.contactpersonal === '' || !employee.contactpersonal) {
      newErrors.contactpersonal = <Typography style={{ color: 'red' }}>Contact(personal) no must be required</Typography>;
      missingFields.push('Contact(personal)');
    }
    if (employee.contactpersonal !== '' && employee.contactpersonal?.length !== 10) {
      newErrors.contactpersonal = <Typography style={{ color: 'red' }}>Contact(personal) no must be 10 digits required</Typography>;
      missingFields.push('Enter valid Contact(personal');
    }

    if (employee.panno !== '' && employee.panno?.length !== 10) {
      newErrors.panno = <Typography style={{ color: 'red' }}>PAN No no must be 10 digits required</Typography>;
      missingFields.push('PAN No');
    }

    if (employee?.panno === '' && employee?.panstatus === 'Have PAN') {
      newErrors.panno = <Typography style={{ color: 'red' }}>PAN No must be required</Typography>;
    } else if (!PanValidate(employee?.panno) && employee?.panstatus === 'Have PAN') {
      newErrors.panno = <Typography style={{ color: 'red' }}>Please Enter Valid PAN Number</Typography>;
      missingFields.push('Valid PAN Number');
    }

    if (employee?.panrefno === '' && employee?.panstatus === 'Applied') {
      newErrors.panrefno = <Typography style={{ color: 'red' }}>Application Reference No must be required</Typography>;
      missingFields.push('Enter valid Application Reference');
    }

    if (!employee.dob) {
      newErrors.dob = <Typography style={{ color: 'red' }}>DOB must be required</Typography>;
      missingFields.push('Date of Birth');
    }
    if (!final) {
      newErrors.profile = <Typography style={{ color: 'red' }}>Profile Image must be required</Typography>;
      missingFields.push('Profile Image');
    }

    if (!employee.religion) {
      newErrors.religion = <Typography style={{ color: 'red' }}>Religion must be required</Typography>;
      missingFields.push('Religion');
    }
    if (!employee.aadhar) {
      newErrors.aadhar = <Typography style={{ color: 'red' }}> Aadhar must be required </Typography>;
      missingFields.push('Aadhar No');
    } else if (employee.aadhar?.length < 12) {
      newErrors.aadhar = <Typography style={{ color: 'red' }}> Please Enter valid Aadhar Number </Typography>;
    } else if (!AadharValidate(employee.aadhar)) {
      newErrors.aadhar = <Typography style={{ color: 'red' }}> Please Enter valid Aadhar Number </Typography>;
      missingFields.push('Enter valid Aadhar No');
    }

    if (!valueWorkStation) {
      newErrors.workstation = <Typography style={{ color: 'red' }}>Work Station must be required</Typography>;
    }

    if (employee.ifoffice === true && primaryWorkStationInput === '') {
      newErrors.primaryworkstationinput = <Typography style={{ color: 'red' }}>Work Station (WFH) must be required</Typography>;
      missingFields.push('Work Station(WFH)');
    }

    if (selectedAttMode?.length === 0) {
      newErrors.attmode = <Typography style={{ color: 'red' }}>Attendance Mode must be required</Typography>;
      missingFields.push('Attendance Mode');
    }

    setErrors(newErrors);

    if (missingFields?.length > 0) {
      setPopupContentMalert(`Please fill in the following fields: ${missingFields.join(', ')}`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      if (Object.keys(newErrors)?.length === 0 && isPasswordChange) {
        sendRequest(); // Call the functi() function if newErrors is empty
      } else if (Object.keys(newErrors)?.length === 0) {
        sendRequestpwd();
      }
    }
  };

  const handleSubmitMultiLog = (e) => {
    e.preventDefault();
    const checkShiftMode = todo?.filter((d) => d.shiftmode === 'Please Select Shift Mode');
    const checkShiftGroup = todo?.filter((d) => d.shiftmode === 'Shift' && d.shiftgrouping === 'Please Select Shift Grouping');
    const checkShift = todo?.filter((d) => d.shiftmode === 'Shift' && d.shifttiming === 'Please Select Shift');

    const newErrorsLog = {};
    const missingFieldstwo = [];
    if (!enableLoginName && employee.username === '') {
      newErrorsLog.username = <Typography style={{ color: 'red' }}>username must be required</Typography>;
      missingFieldstwo.push('User Name');
    } else if (!enableLoginName && allUsersLoginName.includes(employee.username)) {
      newErrorsLog.username = <Typography style={{ color: 'red' }}>username already exist</Typography>;
      missingFieldstwo.push('User Already Exists');
    }
    let validPassword = validatePassword(employee?.password, overllsettings);
    if (!validPassword?.isValid && isPasswordChange) {
      // newErrorsLog.password = <Typography style={{ color: 'red' }}>{validPassword?.errors[0]}</Typography>;
      newErrorsLog.password = (
        <Typography style={{ color: 'red' }}>
          {validPassword.errors.map((err, index) => (
            <div key={index}>{err}</div>
          ))}
        </Typography>
      );
      missingFieldstwo.push('Password');
    }
    if (employee.workmode === 'Please Select Work Mode' || employee.workmode === '' || employee.workmode == undefined) {
      newErrorsLog.workmode = <Typography style={{ color: 'red' }}>work mode must be required</Typography>;
      missingFieldstwo.push('Work Mode');
    }
    if (!selectedCompany) {
      newErrorsLog.company = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
      missingFieldstwo.push('Company');
    }

    if (!selectedBranch) {
      newErrorsLog.branch = <Typography style={{ color: 'red' }}>Branch must be required</Typography>;
      missingFieldstwo.push('Branch');
    }

    if (!selectedUnit) {
      newErrorsLog.unit = <Typography style={{ color: 'red' }}>Unit must be required</Typography>;
      missingFieldstwo.push('Unit');
    }
    if (selectedTeam === '') {
      newErrorsLog.team = <Typography style={{ color: 'red' }}>Team must be required</Typography>;
      missingFieldstwo.push('Team');
    }
    if (!employee?.floor || employee?.floor === '' || employee?.floor == 'Please Select Floor') {
      newErrorsLog.floor = <Typography style={{ color: 'red' }}>Floor must be required</Typography>;
      missingFieldstwo.push('Floor');
    }
    if (!employee?.area || employee?.area === '' || employee?.area == 'Please Select Area') {
      newErrorsLog.area = <Typography style={{ color: 'red' }}> Area must be required</Typography>;
      missingFieldstwo.push('Area');
    }
    if (selectedDesignation === '') {
      newErrorsLog.designation = <Typography style={{ color: 'red' }}>Designation must be required</Typography>;
      missingFieldstwo.push('Designation');
    }
    if ((employee?.employeecount === '' || employee?.employeecount === '0' || !employee?.employeecount) && employee?.prod) {
      newErrorsLog.systemcount = <Typography style={{ color: 'red' }}>System Count must be required</Typography>;
      missingFieldstwo.push('System Count');
    }
    if ((primaryWorkStation === 'Please Select Primary Work Station' || primaryWorkStation === '' || !primaryWorkStation) && employee?.prod) {
      newErrorsLog.primaryworkstation = <Typography style={{ color: 'red' }}>Primary Work Station must be required</Typography>;
      missingFieldstwo.push('Primary Work Station');
    }
    if (!employee.department) {
      newErrorsLog.department = <Typography style={{ color: 'red' }}>Department must be required</Typography>;
      missingFieldstwo.push('Department');
    }

    if (employee.reportingto === '') {
      newErrorsLog.reportingto = <Typography style={{ color: 'red' }}>Reporting must be required</Typography>;
      missingFieldstwo.push('Reporting To');
    }

    if (employee.shifttype === 'Please Select Shift Type') {
      newErrorsLog.shifttype = <Typography style={{ color: 'red' }}>Shifttype must be required</Typography>;
      missingFieldstwo.push('Shift Type');
    }

    if (!employee.empcode && employee.wordcheck === false) {
      newErrorsLog.empcode = <Typography style={{ color: 'red' }}>EmpCode must be required</Typography>;
      missingFieldstwo.push('EmpCode');
    }
    if (employeecodenew === '' && employee.wordcheck === true) {
      newErrorsLog.empcode = <Typography style={{ color: 'red' }}>EmpCode must be required</Typography>;
      missingFieldstwo.push('EmpCode');
    }

    let systemCount = valueWorkStation?.length || 0;

    // Add 1 if primaryWorkStation is valid (not empty or default)
    if (primaryWorkStation !== 'Please Select Primary Work Station' && primaryWorkStation !== '' && primaryWorkStation !== undefined) {
      systemCount += 1;
    }

    // Check if system count exceeds allowed employee count
    if (Number(maxSelections) && systemCount > Number(maxSelections)) {
      newErrorsLog.workstation = <Typography style={{ color: 'red' }}>Work Station Exceeds System Count</Typography>;
      missingFieldstwo.push('Work Station Exceeds System Count');
    }

    // if (!employee.companyemail) {
    //   newErrorsLog.companyemail = (
    //     <Typography style={{ color: "red" }}>
    //       Company Email must be required
    //     </Typography>
    //   );
    // }
    // if (!validateEmail(employee.companyemail) && employee.companyemail) {
    //   newErrorsLog.companyemail = (
    //     <Typography style={{ color: "red" }}>
    //       Please enter valid Company Email
    //     </Typography>
    //   );
    //   missingFieldstwo.push("Enter Valid Company Email");
    // }

    if (!employee.doj) {
      newErrorsLog.doj = <Typography style={{ color: 'red' }}>DOJ must be required</Typography>;
      missingFieldstwo.push('DOJ');
    }

    if ((employee.wordcheck === false && empcodelimitedAll?.includes(employee.empcode)) || (employee.wordcheck === true && empcodelimitedAll?.includes(employeecodenew))) {
      newErrorsLog.empcode = <Typography style={{ color: 'red' }}>Empcode Already Exist</Typography>;
      missingFieldstwo.push('Empcode Already Exist');
    }

    if (employee.wordcheck === true && employeecodenew?.toLowerCase() === employee.empcode?.toLowerCase()) {
      newErrorsLog.empcode = <Typography style={{ color: 'red' }}>Empcode Auto and Manual Cant be Same</Typography>;
      missingFieldstwo.push('Empcode Auto and Manual Cant be Same');
    }

    if (employee.shifttype === 'Standard') {
      if (employee.shiftgrouping === 'Please Select Shift Grouping') {
        newErrorsLog.shiftgrouping = <Typography style={{ color: 'red' }}>Shiftgrouping must be required</Typography>;
        missingFieldstwo.push('Shift Group');
      } else if (employee.shifttiming === 'Please Select Shift') {
        newErrorsLog.shifttiming = <Typography style={{ color: 'red' }}>Shifttiming must be required</Typography>;
        missingFieldstwo.push('Shift Timing');
      }
    }

    let oneweekrotation = weekoptions2weeks?.filter((item) => !todo?.some((val) => val?.week === item))?.length;
    let twoweekrotation = weekoptions1month?.filter((item) => !todo?.some((val) => val?.week === item))?.length;
    let onemonthrotation = weekoptions2months?.filter((item) => !todo?.some((val) => val?.week === item))?.length;

    if (employee.shifttype === 'Daily' && todo?.length === 0) {
      newErrorsLog.shiftweeks = <Typography style={{ color: 'red' }}>Please Add all the weeks in the todo</Typography>;
      missingFieldstwo.push('Shift Todo');
    } else if (employee.shifttype === '1 Week Rotation' && oneweekrotation > 0) {
      newErrorsLog.shiftweeks = <Typography style={{ color: 'red' }}>Please Add all the weeks in the todo</Typography>;
      missingFieldstwo.push('Shift Todo');
    } else if (employee.shifttype === '2 Week Rotation' && twoweekrotation > 0) {
      newErrorsLog.shiftweeks = <Typography style={{ color: 'red' }}>Please Add all the weeks in the todo</Typography>;
      missingFieldstwo.push('Shift Todo');
    } else if (employee.shifttype === '1 Month Rotation' && onemonthrotation > 0) {
      newErrorsLog.shiftweeks = <Typography style={{ color: 'red' }}>Please Add all the weeks in the todo</Typography>;
      missingFieldstwo.push('Shift Todo');
    }

    if ((employee.shifttype === 'Daily' || employee.shifttype === '1 Week Rotation' || employee.shifttype === '2 Week Rotation' || employee.shifttype === '1 Month Rotation') && checkShiftMode?.length > 0) {
      newErrorsLog.checkShiftMode = <Typography style={{ color: 'red' }}>Shift Mode must be required</Typography>;
      missingFieldstwo.push('Shift Mode');
    }
    if ((employee.shifttype === 'Daily' || employee.shifttype === '1 Week Rotation' || employee.shifttype === '2 Week Rotation' || employee.shifttype === '1 Month Rotation') && checkShiftGroup?.length > 0) {
      newErrorsLog.checkShiftGroup = <Typography style={{ color: 'red' }}>Shift Group must be required</Typography>;
      missingFieldstwo.push('Shift Group');
    }

    if ((employee.shifttype === 'Daily' || employee.shifttype === '1 Week Rotation' || employee.shifttype === '2 Week Rotation' || employee.shifttype === '1 Month Rotation') && checkShift?.length > 0) {
      newErrorsLog.checkShift = <Typography style={{ color: 'red' }}>Shift must be required</Typography>;
      missingFieldstwo.push('Shift');
    }

    if (employee.ifoffice === true && primaryWorkStationInput === '') {
      newErrorsLog.primaryworkstationinput = <Typography style={{ color: 'red' }}>Work Station (WFH) must be required</Typography>;
      missingFieldstwo.push('Work Station(WFH)');
    }

    if (selectedAttMode?.length === 0) {
      newErrorsLog.attmode = <Typography style={{ color: 'red' }}>Attendance Mode must be required</Typography>;
      missingFieldstwo.push('Attendance Mode');
    }

    if ((employee.enquirystatus === 'Please Select Status' || employee.enquirystatus === '' || employee.enquirystatus == undefined) && (isUserRoleAccess.role.includes('Manager') || isUserRoleCompare.includes('lassignenquierypurpose'))) {
      newErrorsLog.enquirystatus = <Typography style={{ color: 'red' }}>Status must be required</Typography>;
      missingFieldstwo.push('Status');
    }

    setErrorsLog(newErrorsLog);

    if (missingFieldstwo?.length > 0) {
      setPopupContentMalert(`Please fill in the following fields: ${missingFieldstwo.join(', ')}`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      if (Object.keys(newErrorsLog)?.length === 0 && isPasswordChange) {
        sendRequest(); // Call the functi() function if newErrors is empty
      } else if (Object.keys(newErrorsLog)?.length === 0) {
        sendRequestpwd();
      }
    }
  };

  const renderStepOne = () => {
    return (
      <>
        <Headtitle title={'ENQUIRY EDIT'} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container alignItems="center"></Grid>
          <Grid item md={10} xs={12} sm={12}>
            <Box sx={userStyle.selectcontainer}>
              <Typography sx={userStyle.SubHeaderText}>Personal Information </Typography>
              <br />
              <br />
              <>
                <Grid container spacing={2}>
                  <Grid item md={6} sm={12} xs={12}>
                    <Typography>
                      First Name<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Grid container sx={{ display: 'flex' }}>
                      <Grid item md={3} sm={3} xs={3}>
                        <FormControl size="small" fullWidth>
                          <Select
                            labelId="demo-select-small"
                            id="demo-select-small"
                            placeholder="Mr."
                            value={employee.prefix}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: 200,
                                  width: 80,
                                },
                              },
                            }}
                            onChange={(e) => {
                              setEmployee({
                                ...employee,
                                prefix: e.target.value,
                              });
                            }}
                          >
                            <MenuItem value="Mr">Mr</MenuItem>
                            <MenuItem value="Ms">Ms</MenuItem>
                            <MenuItem value="Mrs">Mrs</MenuItem>
                          </Select>
                        </FormControl>
                        {errors.prefix && <div>{errors.prefix}</div>}
                      </Grid>
                      <Grid item md={9} sm={9} xs={9}>
                        <FormControl size="small" fullWidth>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="First Name"
                            value={employee.firstname}
                            onChange={(e) => {
                              const cname = e?.target?.value?.includes(' ') ? e?.target?.value?.split(' ')[0] : e?.target?.value;
                              function cleanString(str) {
                                const trimmed = str.trim();
                                const cleaned = trimmed.replace(/[^a-zA-Z0-9 ]/g, '');
                                return cleaned;
                              }
                              fetchUserName();
                              setFirst(e.target.value.toLowerCase().split(' ').join(''));
                              setEmployee({
                                ...employee,
                                firstname: cleanString(e.target.value.toUpperCase()),
                                callingname: cname,
                              });
                            }}
                          />
                        </FormControl>
                        {errors.firstname && <div>{errors.firstname}</div>}
                        {errors.duplicatefirstandlastname && <div>{errors.duplicatefirstandlastname}</div>}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item md={6} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Last Name<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Last Name"
                        value={employee.lastname}
                        onChange={(e) => {
                          function cleanString(str) {
                            const trimmed = str.trim();
                            const cleaned = trimmed.replace(/[^a-zA-Z0-9 ]/g, '');
                            return cleaned;
                          }
                          setSecond(e.target.value.toLowerCase().split(' ').join(''));
                          setEmployee({
                            ...employee,
                            lastname: cleanString(e.target.value.toUpperCase()),
                          });
                        }}
                      />
                    </FormControl>
                    {errors.lastname && <div>{errors.lastname}</div>}
                    {errors.duplicatefirstandlastname && <div>{errors.duplicatefirstandlastname}</div>}
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Legal Name<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Legal Name"
                        value={employee.legalname}
                        onChange={(e) => {
                          setEmployee({
                            ...employee,
                            legalname: e.target.value,
                          });
                        }}
                      />
                    </FormControl>
                    {errors.legalname && <div>{errors.legalname}</div>}
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Calling Name<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Calling Name"
                        value={employee.callingname}
                        onChange={(e) => {
                          setEmployee({
                            ...employee,
                            callingname: e.target.value.replace(/\s/g, ''),
                          });
                        }}
                      />
                    </FormControl>
                    {errors.callingname && <div>{errors.callingname}</div>}
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Father Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Father Name"
                        value={employee.fathername}
                        onChange={(e) => {
                          setEmployee({
                            ...employee,
                            fathername: e.target.value,
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Mother Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Mother Name"
                        value={employee.mothername}
                        onChange={(e) => {
                          setEmployee({
                            ...employee,
                            mothername: e.target.value,
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>

                  {/* <Grid container spacing={2}> */}
                  <Grid item md={9} sm={12} xs={12}>
                    <Grid container spacing={2}>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Gender</Typography>

                          <Selects
                            maxMenuHeight={300}
                            options={[
                              { label: 'Others', value: 'Others' },
                              { label: 'Female', value: 'Female' },
                              { label: 'Male', value: 'Male' },
                            ]}
                            value={{
                              label: employee.gender === '' || employee.gender == undefined ? 'Select Gender' : employee.gender,
                              value: employee.gender === '' || employee.gender == undefined ? 'Select Gender' : employee.gender,
                            }}
                            onChange={(e) => {
                              setEmployee({ ...employee, gender: e.value });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Marital Status</Typography>
                          <Selects
                            maxMenuHeight={300}
                            options={[
                              { label: 'Single', value: 'Single' },
                              { label: 'Married', value: 'Married' },
                              { label: 'Divorced', value: 'Divorced' },
                            ]}
                            value={{
                              label: employee.maritalstatus === '' || employee.maritalstatus == undefined ? 'Select Marital Status' : employee.maritalstatus,
                              value: employee.maritalstatus === '' || employee.maritalstatus == undefined ? 'Select Marital Status' : employee.maritalstatus,
                            }}
                            onChange={(e) => {
                              setEmployee({
                                ...employee,
                                maritalstatus: e.value,
                                dom: '',
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      {employee.maritalstatus === 'Married' && (
                        <Grid item md={4} sm={6} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Date Of Marriage<b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <OutlinedInput
                              id="component-outlined"
                              value={employee.dom}
                              onChange={(e) => {
                                setEmployee({
                                  ...employee,
                                  dom: e.target.value,
                                });
                              }}
                              type="date"
                              size="small"
                              name="dom"
                            />
                          </FormControl>
                          {errors.dom && <div>{errors.dom}</div>}
                        </Grid>
                      )}
                      <Grid item md={2.5} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Date Of Birth<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            value={employee.dob}
                            onChange={(e) => {
                              let age = calculateAge(e.target.value);
                              setEmployee({
                                ...employee,
                                dob: e.target.value,
                                age,
                              });
                            }}
                            type="date"
                            size="small"
                            name="dob"
                            inputProps={{ max: maxDate }}
                            onKeyDown={(e) => e.preventDefault()}
                          />
                        </FormControl>
                        {errors.dob && <div>{errors.dob}</div>}
                      </Grid>
                      <Grid item md={1.5} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Age</Typography>
                          <OutlinedInput id="component-outlined" type="number" value={employee.dob === '' ? '' : employee?.age} readOnly />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Religion <b style={{ color: 'red' }}>*</b>
                          </Typography>

                          <Selects
                            maxMenuHeight={300}
                            options={religionOptions}
                            value={{
                              label: employee.religion === '' || employee.religion == undefined ? 'Select Religion' : employee.religion,
                              value: employee.religion === '' || employee.religion == undefined ? 'Select Religion' : employee.religion,
                            }}
                            onChange={(e) => {
                              setEmployee({ ...employee, religion: e.value });
                            }}
                          />
                        </FormControl>
                        {errors.religion && <div>{errors.religion}</div>}
                      </Grid>
                      <Grid item md={4} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Blood Group</Typography>

                          <Selects
                            maxMenuHeight={300}
                            options={[
                              { label: 'A-ve-', value: 'A-ve-' },
                              { label: 'A+ve-', value: 'A+ve-' },
                              { label: 'B+ve', value: 'B+ve' },
                              { label: 'B-ve', value: 'B-ve' },
                              { label: 'O+ve', value: 'O+ve' },
                              { label: 'O-ve', value: 'O-ve' },
                              { label: 'AB+ve', value: 'AB+ve' },
                              { label: 'AB-ve', value: 'AB-ve' },
                              { label: 'A1+ve', value: 'A1+ve' },
                              { label: 'A1-ve', value: 'A1-ve' },
                              { label: 'A2+ve', value: 'A2+ve' },
                              { label: 'A2-ve', value: 'A2-ve' },
                              { label: 'A1B+ve', value: 'A1B+ve' },
                              { label: 'A1B-ve', value: 'A1B-ve' },
                              { label: 'A2B+ve', value: 'A2B+ve' },
                              { label: 'A2B-ve', value: 'A2B-ve' },
                            ]}
                            value={{
                              label: employee.bloodgroup === '' || employee.bloodgroup == undefined ? 'Select Blood Group' : employee.bloodgroup,
                              value: employee.bloodgroup === '' || employee.bloodgroup == undefined ? 'Select Blood Group' : employee.bloodgroup,
                            }}
                            onChange={(e) => {
                              setEmployee({ ...employee, bloodgroup: e.value });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Email<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <TextField
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={employee.email}
                            onChange={(e) => {
                              setEmployee({
                                ...employee,
                                email: e.target.value,
                              });
                              setIsValidEmail(validateEmail(e.target.value));
                            }}
                            InputProps={{
                              inputProps: {
                                pattern: /^\S+@\S+\.\S+$/,
                              },
                            }}
                          />
                        </FormControl>
                        {errors.email && <div>{errors.email}</div>}
                      </Grid>
                      <Grid item md={4} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Location</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Location"
                            value={employee.location}
                            onChange={(e) => {
                              setEmployee({
                                ...employee,
                                location: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Contact No (personal)
                            <b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="number"
                            sx={userStyle.input}
                            placeholder="Contact No (personal)"
                            value={employee.contactpersonal}
                            onChange={(e) => {
                              handlechangecontactpersonal(e);
                            }}
                          />
                        </FormControl>
                        {errors.contactpersonal && <div>{errors.contactpersonal}</div>}
                      </Grid>
                      <Grid item md={4} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Contact No (Family)<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="number"
                            sx={userStyle.input}
                            placeholder="Contact No (Family)"
                            value={employee.contactfamily}
                            onChange={(e) => {
                              handlechangecontactfamily(e);
                            }}
                          />
                        </FormControl>
                        {errors.contactfamily && <div>{errors.contactfamily}</div>}
                      </Grid>
                      <Grid item md={4} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Emergency No<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="number"
                            sx={userStyle.input}
                            placeholder="Emergency No (Emergency)"
                            value={employee.emergencyno}
                            onChange={(e) => {
                              handlechangeemergencyno(e);
                            }}
                          />
                        </FormControl>
                        {errors.emergencyno && <div>{errors.emergencyno}</div>}
                      </Grid>

                      <Grid item md={4} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Aadhar No<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="Number"
                            sx={userStyle.input}
                            placeholder="Aadhar No"
                            value={employee.aadhar}
                            onChange={(e) => {
                              handlechangeaadhar(e);
                            }}
                          />
                        </FormControl>
                        {errors.aadhar && <div>{errors.aadhar}</div>}
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            PAN Card Status<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <Selects
                            maxMenuHeight={300}
                            options={[
                              { label: 'Have PAN', value: 'Have PAN' },
                              { label: 'Applied', value: 'Applied' },
                              { label: 'Yet to Apply', value: 'Yet to Apply' },
                            ]}
                            value={{
                              label: employee.panstatus === '' || employee.panstatus == undefined ? 'Select PAN Status' : employee.panstatus,
                              value: employee.panstatus === '' || employee.panstatus == undefined ? 'Select PAN Status' : employee.panstatus,
                            }}
                            onChange={(e) => {
                              setEmployee({
                                ...employee,
                                panstatus: e.value,
                                panno: '',
                                panrefno: '',
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      {employee?.panstatus === 'Have PAN' && (
                        <Grid item md={4} sm={6} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              PAN No<b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="PAN No"
                              value={employee.panno}
                              onChange={(e) => {
                                if (e.target.value?.length < 11) {
                                  setEmployee({
                                    ...employee,
                                    panno: e.target.value,
                                  });
                                }
                              }}
                            />
                          </FormControl>
                          {errors.panno && <div>{errors.panno}</div>}
                        </Grid>
                      )}
                      {employee?.panstatus === 'Applied' && (
                        <Grid item md={4} sm={6} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Application Ref No
                              <b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Application Ref No"
                              value={employee.panrefno}
                              onChange={(e) => {
                                if (e.target.value?.length < 16) {
                                  setEmployee({
                                    ...employee,
                                    panrefno: e.target.value,
                                  });
                                }
                              }}
                            />
                          </FormControl>
                          {errors.panrefno && <div>{errors.panrefno}</div>}
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                  <Grid item lg={3} md={3} sm={12} xs={12}>
                    <InputLabel sx={{ m: 1 }}>
                      <b style={{ color: 'red' }}>*</b>
                    </InputLabel>

                    {croppedImage && (
                      <>
                        <div
                          style={{
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center',
                          }}
                        >
                          <img
                            style={{
                              height: 120,
                              borderRadius: '8px', // Rounded corners for the image
                              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow for the image
                              objectFit: 'cover', // Ensure the image covers the area without distortion
                            }}
                            src={croppedImage}
                            alt="Cropped"
                          />

                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                            }}
                          >
                            {/* Color Picker */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <Typography
                                variant="body1"
                                style={{
                                  color: '#555',
                                  fontSize: '10px',
                                }}
                              >
                                BG Color
                              </Typography>
                              <input
                                type="color"
                                value={color}
                                onChange={handleColorChange}
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  borderRadius: '5px',
                                }}
                              />
                            </div>

                            {/* Submit Button */}
                            <LoadingButton
                              onClick={handleSubmit}
                              loading={bgbtn}
                              variant="contained"
                              color="primary"
                              endIcon={<FormatColorFillIcon />}
                              sx={{
                                padding: '10px 10px',
                                fontSize: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderRadius: '5px',
                                color: isLightColor ? 'black' : 'white',
                                fontWeight: '600',
                                backgroundColor: color, // Dynamically set the background color
                                '&:hover': {
                                  backgroundColor: `${color}90`, // Slightly transparent on hover for a nice effect
                                },
                                border: '1px solid  black',
                              }}
                            ></LoadingButton>
                          </div>
                        </div>
                      </>
                    )}
                    <div>
                      {employee.profileimage && !croppedImage ? (
                        <>
                          <Cropper style={{ height: 120, width: '100%' }} aspectRatio={1 / 1} src={employee.profileimage} ref={cropperRef} />
                          <Box
                            sx={{
                              display: 'flex',
                              marginTop: '10px',
                              gap: '10px',
                            }}
                          >
                            <Box>
                              <Typography sx={userStyle.uploadbtn} onClick={handleCrop}>
                                Crop Image
                              </Typography>
                            </Box>
                            <Box>
                              <Button variant="outlined" sx={userStyle.btncancel} onClick={handleClearImage}>
                                Clear
                              </Button>
                            </Box>
                          </Box>
                        </>
                      ) : (
                        <>
                          {!employee.profileimage && (
                            <Grid container sx={{ display: 'flex' }}>
                              <Grid item md={6} sm={6}>
                                <section>
                                  <LoadingButton component="label" variant="contained" loading={btnUpload} sx={buttonStyles?.buttonsubmit}>
                                    Upload
                                    <input type="file" id="profileimage" name="file" accept="image/*" hidden onChange={handleChangeImage} />
                                    <br />
                                  </LoadingButton>
                                </section>
                              </Grid>
                              <Grid item md={6} sm={6}>
                                <Button onClick={showWebcam} variant="contained" sx={userStyle.uploadbtn}>
                                  <CameraAltIcon />
                                </Button>
                              </Grid>
                            </Grid>
                          )}
                          {employee.profileimage && (
                            <>
                              <Grid item md={4} sm={4}>
                                <Button variant="outlined" sx={userStyle.btncancel} onClick={handleClearImage}>
                                  Clear
                                </Button>
                              </Grid>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </Grid>
                </Grid>
              </>
              <br />
            </Box>
          </Grid>
          <br />
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-end' }} alignItems="center">
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', md: 'column' }, // Row for small screens, column for larger screens
                justifyContent: { xs: 'center', md: 'flex-end' },
                alignItems: 'center',
                gap: '10px',
                position: { xs: 'static', md: 'fixed' }, // Static for small screens, fixed for larger screens
                bottom: { xs: 0, md: 'auto' }, // Align to bottom for small screens
                right: { xs: 'auto', md: '10px' }, // Align right for large screens
                top: { xs: 'auto', md: '50%' }, // Center vertically for large screens
                transform: { xs: 'none', md: 'translateY(-50%)' }, // Center transform for large screens
                width: 'auto',
                padding: { xs: '0 5px', md: '0 10px' }, // Reduce padding for small screens
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
              }}
            >
              <LoadingButton
                variant="contained"
                loading={nextBtnLoading}
                color="primary"
                size="small"
                sx={{
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
                onClick={(e) => {
                  draftduplicateCheck(e, 'next');
                }}
              >
                Next
              </LoadingButton>

              {/* <Link
                to="/enquirypurposelist"
                style={{
                  textDecoration: "none",
                  color: "white",
                  marginRight: "0px",
                }}
              > */}
              <Button
                size="small"
                sx={{
                  ...buttonStyles?.btncancel,
                  textTransform: 'capitalize',
                  width: '73px',
                }}
                onClick={(e) => {
                  handleOpenConfirmationPopup('cancel');
                }}
              >
                Cancel
              </Button>
              {/* </Link> */}

              <LoadingButton
                // onClick={(e) => {
                //   draftduplicateCheck(e, "submit");
                // }}
                onClick={(e) => {
                  handleOpenConfirmationPopup('submit1');
                }}
                loading={loading}
                loadingPosition="start"
                variant="contained"
                size="small"
                sx={{
                  textTransform: 'capitalize !important',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                <span>SUBMIT</span>
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>

        {/* ALERT DIALOG */}
        <Box>
          <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
              <Typography variant="h6">{message}</Typography>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" color="error" onClick={handleCloseerr} sx={buttonStyles?.buttonsubmit}>
                ok
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={isWebcamOpen}
            onClose={(event, reason) => {
              if (reason === 'backdropClick') {
                // Ignore backdrop clicks
                return;
              }
              webcamClose(); // Handle other close actions
              closeWebCam();
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogContent sx={{ textAlign: 'center', alignItems: 'center' }}>
              <Webcamimage
                name="create"
                getImg={getImg}
                setGetImg={setGetImg}
                valNum={valNum}
                setValNum={setValNum}
                capturedImages={capturedImages}
                setCapturedImages={setCapturedImages}
                setRefImage={setRefImage}
                setRefImageDrag={setRefImageDrag}
                setVendor={setEmployee}
                vendor={employee}
                fromEmployee={true}
              />
            </DialogContent>
            <DialogActions>
              <Button variant="contained" color="success" onClick={webcamDataStore} sx={buttonStyles?.buttonsubmit}>
                OK
              </Button>
              <Button
                variant="contained"
                color="error"
                sx={{ ...buttonStyles?.btncancel }}
                onClick={() => {
                  webcamClose();
                  closeWebCam();
                }}
              >
                CANCEL
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </>
    );
  };

  const renderStepTwo = () => {
    return (
      <>
        <Headtitle title={'ENQUIRY EDIT'} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-end' }} alignItems="center">
            <Button
              className="prev"
              variant="contained"
              size="small"
              sx={{
                display: { xs: 'none', md: 'flex' }, // Hide on small screens, show on large screens
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                position: { xs: 'static', md: 'fixed' }, // Static for small screens, fixed for larger screens
                left: { md: '10px' }, // Align left for large screens
                top: { md: '50%' }, // Center vertically for large screens
                transform: { md: 'translateY(-50%)' }, // Center transform for large screens
                textTransform: 'capitalize',
                mt: { xs: 2, md: 0 }, // Margin top for small screens to add space
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
                ...buttonStyles?.buttonsubmit,
              }}
              onClick={() => {
                nextStepLog('prev');
              }}
            >
              Previous
            </Button>
          </Grid>
          <Grid item md={10} xs={12} sm={12}>
            <Box sx={userStyle.selectcontainer}>
              <Grid item xs={8}>
                <Typography sx={userStyle.importheadtext}>Reference Details </Typography>
                <br />
              </Grid>
              <Grid container spacing={2}>
                <Grid item md={2.3} sm={6} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      Name<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Reference Name"
                      value={singleReferenceTodo.name}
                      onChange={(e) => {
                        setSingleReferenceTodo({
                          ...singleReferenceTodo,
                          name: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                  {referenceTodoError.name && <div>{referenceTodoError.name}</div>}
                  {referenceTodoError.duplicate && <div>{referenceTodoError.duplicate}</div>}
                </Grid>
                <Grid item md={2.3} sm={6} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>Relationship</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Relationship"
                      value={singleReferenceTodo.relationship}
                      onChange={(e) => {
                        setSingleReferenceTodo({
                          ...singleReferenceTodo,
                          relationship: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={2.3} sm={6} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>Occupation</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Occupation"
                      value={singleReferenceTodo.occupation}
                      onChange={(e) => {
                        setSingleReferenceTodo({
                          ...singleReferenceTodo,
                          occupation: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={2.3} sm={6} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>Contact</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Contact No"
                      value={singleReferenceTodo.contact}
                      onChange={(e) => {
                        handlechangereferencecontactno(e);
                      }}
                    />
                  </FormControl>
                  {referenceTodoError.contactno && <div>{referenceTodoError.contactno}</div>}
                </Grid>
                <Grid item md={2.3} sm={12} xs={12}>
                  <FormControl fullWidth>
                    <Typography>Details</Typography>
                    <TextareaAutosize
                      aria-label="minimum height"
                      minRows={5}
                      value={singleReferenceTodo.details}
                      onChange={(e) => {
                        setSingleReferenceTodo({
                          ...singleReferenceTodo,
                          details: e.target.value,
                        });
                      }}
                      placeholder="Reference Details"
                    />
                  </FormControl>
                </Grid>
                <Grid item md={0.5} sm={6} xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{
                      height: '30px',
                      minWidth: '20px',
                      padding: '19px 13px',
                      marginTop: '25px',
                    }}
                    onClick={addReferenceTodoFunction}
                  >
                    <FaPlus />
                  </Button>
                </Grid>

                <Grid item md={12} sm={12} xs={12}>
                  {' '}
                </Grid>
                <Grid item md={12} sm={12} xs={12}>
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="customized table" id="usertable">
                      <TableHead sx={{ fontWeight: '600' }}>
                        <StyledTableRow>
                          <StyledTableCell>SNo</StyledTableCell>
                          <StyledTableCell>Name</StyledTableCell>
                          <StyledTableCell>Relationship</StyledTableCell>
                          <StyledTableCell>Occupation</StyledTableCell>
                          <StyledTableCell>Contact</StyledTableCell>
                          <StyledTableCell>Details</StyledTableCell>
                          <StyledTableCell></StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody align="left">
                        {referenceTodo?.length > 0 ? (
                          referenceTodo?.map((row, index) => (
                            <StyledTableRow>
                              <StyledTableCell>{index + 1}</StyledTableCell>
                              <StyledTableCell>{row.name}</StyledTableCell>
                              <StyledTableCell>{row.relationship}</StyledTableCell>
                              <StyledTableCell>{row.occupation}</StyledTableCell>
                              <StyledTableCell>{row.contact}</StyledTableCell>
                              <StyledTableCell>{row.details}</StyledTableCell>
                              <StyledTableCell>
                                <CloseIcon
                                  sx={{ color: 'red', cursor: 'pointer' }}
                                  onClick={() => {
                                    deleteReferenceTodo(index);
                                  }}
                                />
                              </StyledTableCell>
                            </StyledTableRow>
                          ))
                        ) : (
                          <StyledTableRow>
                            {' '}
                            <StyledTableCell colSpan={8} align="center">
                              No Data Available
                            </StyledTableCell>{' '}
                          </StyledTableRow>
                        )}
                        <StyledTableRow></StyledTableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>{' '}
              <br />
            </Box>
            <br />
            <Box sx={userStyle.selectcontainer}>
              <Grid item xs={8}>
                <Typography sx={userStyle.importheadtext}>Login Details </Typography>
                <br />
              </Grid>
              <Grid container spacing={2}>
                <Grid item md={4} sm={6} xs={12}>
                  {enableLoginName ? (
                    <FormControl size="small" fullWidth>
                      <Typography>
                        Login Name<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput id="component-outlined" type="text" placeholder="login Name" value={third} />
                    </FormControl>
                  ) : (
                    <FormControl size="small" fullWidth>
                      <Typography>
                        Login Name<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="login Name"
                        autoComplete="off"
                        value={employee.username}
                        onChange={(e) => {
                          setEmployee({
                            ...employee,
                            username: e.target.value,
                          });
                        }}
                      />
                    </FormControl>
                  )}
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox checked={enableLoginName} />}
                      onChange={(e) => {
                        setEnableLoginName(!enableLoginName);
                      }}
                      label="Auto Generate"
                    />
                  </FormGroup>
                  {errmsg && enableLoginName && (
                    <div className="alert alert-danger" style={{ color: 'green' }}>
                      <Typography color={errmsg == 'Unavailable' ? 'error' : 'success'} sx={{ margin: '5px' }}>
                        <em>{errmsg}</em>
                      </Typography>
                    </div>
                  )}
                  {!enableLoginName && errorsLog.username && <div>{errorsLog.username}</div>}
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      Password <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Passsword"
                      onChange={(e) => {
                        setEmployee({
                          ...employee,
                          password: e.target.value,
                          originalpassword: e.target.value,
                        });
                        if (e.target.value === '') {
                          setIsPasswordChange(false);
                        } else {
                          setIsPasswordChange(true);
                        }
                      }}
                    />
                  </FormControl>
                  {errorsLog.password && <div>{errorsLog.password}</div>}
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      company Name<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput id="component-outlined" type="text" placeholder="company name" value={employee.companyname} />
                  </FormControl>
                </Grid>
              </Grid>{' '}
              <br />
            </Box>
            <br />
            <Box sx={userStyle.dialogbox}>
              <Typography sx={userStyle.importheadtext}>Boarding Information</Typography>
              <br />
              <Grid container spacing={2}>
                {isUserRoleAccess.role.includes('Manager') ? (
                  <Grid item md={4} sm={6} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Status<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <Selects
                        maxMenuHeight={300}
                        options={statusOptions}
                        placeholder="Please Select Status"
                        value={{
                          label: employee.enquirystatus == 'undefined' ? 'Please Select Status' : employee.enquirystatus,
                          value: employee.enquirystatus == 'undefined' ? 'Please Select Status' : employee.enquirystatus,
                        }}
                        onChange={(e) => {
                          setEmployee((prev) => ({
                            ...prev,
                            enquirystatus: e.value,
                          }));
                        }}
                      />
                    </FormControl>
                  </Grid>
                ) : isUserRoleCompare.includes('lassignenquierypurpose') ? (
                  <Grid item md={4} sm={6} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Status<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <Selects
                        maxMenuHeight={300}
                        options={statusOptions}
                        placeholder="Please Select Status"
                        value={{
                          label: employee.enquirystatus == 'undefined' ? 'Please Select Status' : employee.enquirystatus,
                          value: employee.enquirystatus == 'undefined' ? 'Please Select Status' : employee.enquirystatus,
                        }}
                        onChange={(e) => {
                          setEmployee((prev) => ({
                            ...prev,
                            enquirystatus: e.value,
                          }));
                        }}
                      />
                    </FormControl>
                  </Grid>
                ) : (
                  ''
                )}
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      DOJ<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="date"
                      value={employee.doj}
                      onChange={(e) => {
                        setEmployee({ ...employee, doj: e.target.value });
                        setAssignExperience((prev) => ({
                          ...prev,
                          updatedate: e.target.value,
                          assignEndExpDate: '',
                          assignEndTarDate: '',
                          assignExpMode: 'Auto Increment',
                        }));
                        setLoginNotAllot({
                          ...loginNotAllot,
                          process: 'Please Select Process',
                        });
                      }}
                    />
                    {errorsLog.doj && <div>{errorsLog.doj}</div>}
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>DOT</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="date"
                      value={employee.dot}
                      onChange={(e) => {
                        setEmployee({ ...employee, dot: e.target.value });
                      }}
                    />
                  </FormControl>
                </Grid>

                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Company Email</Typography>
                    <TextField
                      id="email"
                      type="email"
                      placeholder="Company Email"
                      value={employee.companyemail}
                      // onChange={(e) => {
                      //   setEmployee({
                      //     ...employee,
                      //     companyemail: e.target.value,
                      //   });
                      // }}
                      // InputProps={{
                      //   inputProps: {
                      //     pattern: /^\S+@\S+\.\S+$/,
                      //   },
                      // }}
                      readOnly
                    />
                  </FormControl>
                  {errorsLog.companyemail && <div>{errorsLog.companyemail}</div>}
                </Grid>
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Work Mode<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      maxMenuHeight={300}
                      options={workmodeOptions}
                      placeholder="Please Select Work Mode"
                      value={{
                        label: employee.workmode !== '' ? employee.workmode : 'Please Select Work Mode',
                        value: employee.workmode !== '' ? employee.workmode : 'Please Select Work Mode',
                      }}
                      onChange={(e) => {
                        setEmployee((prev) => ({
                          ...prev,
                          workmode: e.value,
                          ifoffice: false,
                        }));
                        setSelectedOptionsWorkStation([]);
                        setValueWorkStation([]);
                        setPrimaryWorkStation('Please Select Primary Work Station');
                        setPrimaryWorkStationLabel('Please Select Primary Work Station');
                        setWorkstationTodoList([]);
                      }}
                    />
                  </FormControl>
                  {errorsLog.workmode && <div>{errorsLog.workmode}</div>}
                </Grid>
                <Grid item xs={12} md={4} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Company <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      options={isAssignBranch
                        ?.map((data) => ({
                          label: data.company,
                          value: data.company,
                        }))
                        .filter((item, index, self) => {
                          return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                        })}
                      styles={colourStyles}
                      value={{
                        label: selectedCompany === '' || selectedCompany == undefined ? 'Please Select Company' : selectedCompany,
                        value: selectedCompany === '' || selectedCompany == undefined ? 'Please Select Company' : selectedCompany,
                      }}
                      onChange={handleCompanyChange}
                    />
                  </FormControl>
                  {errorsLog.company && <div>{errorsLog.company}</div>}
                </Grid>

                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Branch <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      options={filteredBranches?.map((data) => ({
                        label: data.name,
                        value: data.name,
                      }))}
                      styles={colourStyles}
                      value={{
                        label: selectedBranch === '' || selectedBranch == undefined ? 'Please Select Branch' : selectedBranch,
                        value: selectedBranch === '' || selectedBranch == undefined ? 'Please Select Branch' : selectedBranch,
                      }}
                      onChange={handleBranchChange}
                    />
                  </FormControl>
                  {errorsLog.branch && <div>{errorsLog.branch}</div>}
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Unit <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      options={filteredUnits?.map((data) => ({
                        label: data.name,
                        value: data.name,
                      }))}
                      styles={colourStyles}
                      value={{
                        label: selectedUnit === '' || selectedUnit == undefined ? 'Please Select Unit' : selectedUnit,
                        value: selectedUnit === '' || selectedUnit == undefined ? 'Please Select Unit' : selectedUnit,
                      }}
                      onChange={handleUnitChange}
                    />
                  </FormControl>
                  {errorsLog.unit && <div>{errorsLog.unit}</div>}
                </Grid>

                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Department <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      options={department?.map((data) => ({
                        ...data,
                        label: data?.deptname,
                        value: data?.deptname,
                      }))}
                      styles={colourStyles}
                      value={{
                        label: employee?.department === '' || employee?.department == undefined ? 'Please Select Department' : employee?.department,
                        value: employee?.department === '' || employee?.department == undefined ? 'Please Select Department' : employee?.department,
                      }}
                      onChange={(e) => {
                        fetchDptDesignation(e.value);
                        setEmployee({
                          ...employee,
                          department: e.value,
                          attOptions: e.attendancemode || attModeOptions?.map((data) => data?.value),
                          prod: e.prod,
                          employeecount: '0',
                          reportingto: '',
                        });
                        setSelectedAttMode([]);
                        setValueAttMode([]);
                        setMaxSelections(maxWfhSelections + 0);
                        setSelectedDesignation('');
                        setSelectedTeam('');
                        setAssignExperience((prev) => ({
                          ...prev,
                          assignEndExpDate: '',
                          assignEndTarDate: '',
                        }));
                        setPrimaryWorkStation('Please Select Primary Work Station');
                        setPrimaryWorkStationLabel('Please Select Primary Work Station');
                        setWorkstationTodoList([]);
                        setSelectedOptionsWorkStation([]);
                        setValueWorkStation([]);
                      }}
                    />
                  </FormControl>
                  {errorsLog.department && <div>{errorsLog.department}</div>}
                </Grid>
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Attendance Mode<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <MultiSelect
                      options={employee?.attOptions?.length > 0 ? attModeOptions.filter((option) => employee.attOptions.includes(option.value)) : attModeOptions}
                      value={selectedAttMode}
                      onChange={(e) => {
                        handleAttModeChange(e);
                      }}
                      valueRenderer={customValueRendererAttMode}
                      labelledBy="Please Select Attendance Mode"
                    />
                  </FormControl>
                  {errorsLog.attmode && <div>{errorsLog.attmode}</div>}
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Team <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      options={filteredTeams?.map((data) => ({
                        label: data?.teamname,
                        value: data?.teamname,
                      }))}
                      styles={colourStyles}
                      value={{
                        label: selectedTeam === '' || selectedTeam == undefined ? 'Please Select Team' : selectedTeam,
                        value: selectedTeam === '' || selectedTeam == undefined ? 'Please Select Team' : selectedTeam,
                      }}
                      onChange={handleTeamChange}
                    />
                  </FormControl>
                  {errorsLog.team && <div>{errorsLog.team}</div>}
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Floor<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      options={floorNames
                        ?.filter((u) => u.branch === selectedBranch)
                        ?.map((data) => ({
                          label: data.name,
                          value: data.name,
                        }))}
                      styles={colourStyles}
                      value={{
                        label: employee?.floor === '' || employee?.floor == undefined ? 'Please Select Floor' : employee?.floor,
                        value: employee?.floor === '' || employee?.floor == undefined ? 'Please Select Floor' : employee?.floor,
                      }}
                      onChange={(e) => {
                        fetchareaNames(e.value);
                        setEmployee({
                          ...employee,
                          floor: e.value,
                          area: '',
                        });
                        setPrimaryWorkStation('Please Select Primary Work Station');
                        setPrimaryWorkStationLabel('Please Select Primary Work Station');
                        setWorkstationTodoList([]);
                        setSelectedOptionsWorkStation([]);
                        setValueWorkStation([]);
                      }}
                    />
                  </FormControl>
                  {errorsLog.floor && <div>{errorsLog.floor}</div>}
                </Grid>
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Area<b style={{ color: 'red' }}>*</b>
                    </Typography>

                    <Selects
                      options={areaNames?.map((data) => ({
                        label: data,
                        value: data,
                      }))}
                      styles={colourStyles}
                      value={{
                        label: employee?.area === '' || employee?.area == undefined ? 'Please Select Area' : employee?.area,
                        value: employee?.area === '' || employee?.area == undefined ? 'Please Select Area' : employee?.area,
                      }}
                      onChange={(e) => {
                        setEmployee({ ...employee, area: e.value });
                        setPrimaryWorkStation('Please Select Primary Work Station');
                        setPrimaryWorkStationLabel('Please Select Primary Work Station');
                        setWorkstationTodoList([]);
                        setSelectedOptionsWorkStation([]);
                        setValueWorkStation([]);
                      }}
                    />
                  </FormControl>
                  {errorsLog.area && <div>{errorsLog.area}</div>}
                </Grid>

                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Designation <b style={{ color: 'red' }}>*</b>
                    </Typography>

                    <Selects
                      options={designation?.map((d) => ({
                        label: d.name || d.designation,
                        value: d.name || d.designation,
                        systemcount: d?.systemcount || '',
                      }))}
                      styles={colourStyles}
                      value={{
                        label: selectedDesignation === '' || selectedDesignation == undefined ? 'Please Select Designation' : selectedDesignation,
                        value: selectedDesignation === '' || selectedDesignation == undefined ? 'Please Select Designation' : selectedDesignation,
                      }}
                      onChange={handleDesignationChange}
                    />
                  </FormControl>
                  {errorsLog.designation && <div>{errorsLog.designation}</div>}
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      System Count
                      {employee?.prod && <b style={{ color: 'red' }}>*</b>}
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      size="small"
                      placeholder="System Count"
                      value={employee.employeecount}
                      readOnly={!employee.prod}
                      onChange={(e) => {
                        let count = e.target.value.replace(/[^0-9.;\s]/g, '');
                        setEmployee((prev) => ({
                          ...prev,
                          employeecount: count,
                        }));
                        setPrimaryWorkStation('Please Select Primary Work Station');
                        setPrimaryWorkStationLabel('Please Select Primary Work Station');
                        setWorkstationTodoList([]);
                        setSelectedOptionsWorkStation([]);
                        setValueWorkStation([]);
                        setMaxSelections(maxWfhSelections + Number(count));
                      }}
                    />
                  </FormControl>
                  {errorsLog.systemcount && <div>{errorsLog.systemcount}</div>}
                </Grid>
                <Grid item md={4} sm={6} xs={12}>
                  <Typography>
                    Shift Type<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Selects
                      options={ShiftTypeOptions}
                      label="Please Select Shift Type"
                      value={{
                        label: employee.shifttype,
                        value: employee.shifttype,
                      }}
                      onChange={(e) => {
                        setEmployee({
                          ...employee,
                          shifttype: e.value,
                          shiftgrouping: 'Please Select Shift Grouping',
                          shifttiming: 'Please Select Shift',
                        });
                        // handleAddTodo(e.value);
                        setTodo([]);
                        setValueCate([]);
                        setSelectedOptionsCate([]);
                        setValueCateWeeks([]);
                        setSelectedOptionsCateWeeks([]);
                        setShifts([]);
                      }}
                    />
                  </FormControl>
                  {errorsLog.shifttype && <div>{errorsLog.shifttype}</div>}
                </Grid>
                {employee.shifttype === 'Standard' ? (
                  <>
                    <Grid item md={4} sm={6} xs={12}>
                      <Typography>
                        Shift Grouping<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Selects
                          options={ShiftGroupingOptions}
                          label="Please Select Shift Group"
                          value={{
                            label: employee.shiftgrouping,
                            value: employee.shiftgrouping,
                          }}
                          onChange={(e) => {
                            setEmployee({
                              ...employee,
                              shiftgrouping: e.value,
                              shifttiming: 'Please Select Shift',
                            });
                            ShiftDropdwonsSecond(e.value);
                          }}
                        />
                      </FormControl>
                      {errorsLog.shiftgrouping && <div>{errorsLog.shiftgrouping}</div>}
                    </Grid>
                    <Grid item md={4} sm={6} xs={12}>
                      <Typography>
                        Shift<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Selects
                          size="small"
                          options={shifts}
                          styles={colourStyles}
                          value={{
                            label: employee.shifttiming,
                            value: employee.shifttiming,
                          }}
                          onChange={(e) => {
                            setEmployee({
                              ...employee,
                              shifttiming: e.value,
                            });
                            let shifthoursA = shifttiming?.find((data) => data?.name === e.value);
                            setLoginNotAllot({
                              ...loginNotAllot,
                              time: shifthoursA?.shifthours?.split(':')[0],
                              timemins: shifthoursA?.shifthours?.split(':')[1],
                            });
                          }}
                        />
                      </FormControl>
                      {errorsLog.shifttiming && <div>{errorsLog.shifttiming}</div>}
                    </Grid>
                    <Grid item md={4} sm={6} xs={12} sx={{ display: 'flex' }}>
                      <FormControl fullWidth size="small">
                        <Typography>Week Off</Typography>
                        <MultiSelect size="small" options={getWeekdayOptions()} value={selectedOptionsCate} onChange={handleCategoryChange} valueRenderer={customValueRendererCate} labelledBy="Please Select Days" />
                      </FormControl>
                    </Grid>
                  </>
                ) : null}

                <Grid item md={12} sm={12} xs={12}>
                  {employee.shifttype === 'Daily' ? (
                    <>
                      <Grid container spacing={2}>
                        <Grid item md={3.5} sm={6} xs={12}>
                          <Typography>
                            Shift Grouping<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <FormControl fullWidth size="small">
                            <Selects
                              options={ShiftGroupingOptions}
                              label="Please Select Shift Group"
                              value={{
                                label: employee.shiftgrouping === '' || employee.shiftgrouping === undefined ? 'Please Select Shift Grouping' : employee.shiftgrouping,
                                value: employee.shiftgrouping === '' || employee.shiftgrouping === undefined ? 'Please Select Shift Grouping' : employee.shiftgrouping,
                              }}
                              onChange={(e) => {
                                setEmployee({
                                  ...employee,
                                  shiftgrouping: e.value,
                                  shifttiming: 'Please Select Shift',
                                });
                                ShiftDropdwonsSecond(e.value);
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={3.5} sm={6} xs={12}>
                          <Typography>
                            Shift<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <FormControl fullWidth size="small">
                            <Selects
                              size="small"
                              options={shifts}
                              styles={colourStyles}
                              value={{
                                label: employee.shifttiming === '' || employee.shifttiming === undefined ? 'Please Select Shift' : employee.shifttiming,
                                value: employee.shifttiming === '' || employee.shifttiming === undefined ? 'Please Select Shift' : employee.shifttiming,
                              }}
                              onChange={(e) => {
                                setEmployee({
                                  ...employee,
                                  shifttiming: e.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={3.5} sm={6} xs={12} sx={{ display: 'flex' }}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Week Off<b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <MultiSelect size="small" options={getWeekdayOptions()} value={selectedOptionsCate} onChange={handleCategoryChange} valueRenderer={customValueRendererCate} labelledBy="Please Select Days" />
                          </FormControl>
                        </Grid>
                        <Grid item md={1} sm={12} xs={12}>
                          <Button
                            variant="contained"
                            style={{
                              height: '30px',
                              minWidth: '20px',
                              padding: '19px 13px',
                              color: 'white',
                              background: 'rgb(25, 118, 210)',
                              marginTop: '25px',
                            }}
                            onClick={handleAddTodo}
                          >
                            <FaPlus style={{ fontSize: '15px' }} />
                          </Button>
                        </Grid>
                      </Grid>
                      <br />
                      {todo?.length > 0 ? (
                        <Grid container spacing={2}>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Day</Typography>
                          </Grid>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Week</Typography>
                          </Grid>
                          <Grid item md={2} sm={12} xs={12}>
                            <Typography>
                              Shift Mode<b style={{ color: 'red' }}>*</b>
                            </Typography>
                          </Grid>
                          <Grid item md={2} sm={12} xs={12}>
                            <Typography>
                              Shift Grouping<b style={{ color: 'red' }}>*</b>
                            </Typography>
                          </Grid>
                          <Grid item md={2.5} sm={12} xs={12}>
                            <Typography>
                              Shift<b style={{ color: 'red' }}>*</b>{' '}
                            </Typography>
                          </Grid>
                        </Grid>
                      ) : null}
                      {todo?.length > 0 &&
                        todo.map((todo, index) => (
                          <div key={index}>
                            {editingIndexcheck === index ? (
                              <Grid container spacing={1}>
                                <Grid item md={1.5} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.day}
                                  </Typography>
                                </Grid>
                                <Grid item md={1.5} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.week}
                                  </Typography>
                                </Grid>
                                <Grid item md={2} sm={4} xs={4}>
                                  <FormControl fullWidth size="small">
                                    <Selects
                                      size="small"
                                      options={ShiftModeOptions}
                                      value={{
                                        label: todo.shiftmode,
                                        value: todo.shiftmode,
                                      }}
                                      onChange={(selectedOption) => multiInputs(index, 'shiftmode', selectedOption.value)}
                                    />
                                  </FormControl>
                                </Grid>
                                {todo.shiftmode === 'Shift' ? (
                                  <>
                                    <Grid item md={2} sm={4} xs={4}>
                                      <FormControl fullWidth size="small">
                                        <Selects
                                          size="small"
                                          options={ShiftGroupingOptions}
                                          value={{
                                            label: todo.shiftgrouping,
                                            value: todo.shiftgrouping,
                                          }}
                                          onChange={(selectedOption) => multiInputs(index, 'shiftgrouping', selectedOption.value)}
                                        />
                                      </FormControl>
                                    </Grid>
                                    <Grid item md={2.5} sm={4} xs={4}>
                                      <FormControl fullWidth size="small">
                                        <AsyncShiftTimingSelects todo={todo} index={index} auth={auth} multiInputs={multiInputs} colourStyles={colourStyles} />
                                      </FormControl>
                                    </Grid>{' '}
                                  </>
                                ) : (
                                  <>
                                    <Grid item md={2} sm={4} xs={4}></Grid>
                                    <Grid item md={2.5} sm={4} xs={4}></Grid>
                                  </>
                                )}
                                <Grid item md={1} sm={1} xs={1}>
                                  {/* Confirm button */}
                                  {todo.shiftmode === 'Shift' && (todo.shiftgrouping === 'Please Select Shift Grouping' || todo.shifttiming === 'Please Select Shift') ? null : (
                                    <Button onClick={handleUpdateTodocheck}>
                                      <CheckCircleIcon
                                        style={{
                                          fontSize: '1.5rem',
                                          color: '#216d21',
                                        }}
                                      />
                                    </Button>
                                  )}
                                </Grid>
                                <Grid item md={1} sm={1} xs={1}>
                                  {/* Cancel button */}
                                  <Button onClick={handleCancelEdit}>
                                    <CancelIcon
                                      style={{
                                        fontSize: '1.5rem',
                                        color: 'red',
                                      }}
                                    />
                                  </Button>
                                </Grid>
                              </Grid>
                            ) : (
                              <Grid container spacing={1}>
                                <Grid item md={1.5} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.day}
                                  </Typography>
                                </Grid>
                                <Grid item md={1.5} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.week}
                                  </Typography>
                                </Grid>
                                <Grid item md={2} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.shiftmode}
                                  </Typography>
                                </Grid>
                                {todo.shiftmode === 'Shift' ? (
                                  <>
                                    <Grid item md={2} sm={6} xs={12}>
                                      <Typography variant="subtitle2" color="textSecondary">
                                        {todo.shiftgrouping === 'Please Select Shift Grouping' ? '' : todo.shiftgrouping}
                                      </Typography>
                                    </Grid>
                                    <Grid item md={2} sm={6} xs={12}>
                                      <Typography variant="subtitle2" color="textSecondary">
                                        {todo.shifttiming === 'Please Select Shift' ? '' : todo.shifttiming}
                                      </Typography>
                                    </Grid>
                                  </>
                                ) : (
                                  <>
                                    <Grid item md={2} sm={6} xs={12}></Grid>
                                    <Grid item md={2} sm={6} xs={12}></Grid>
                                  </>
                                )}
                                <Grid item md={1} sm={6} xs={6}>
                                  {/* Edit button */}
                                  <Button onClick={() => handleEditTodocheck(index)}>
                                    <FaEdit
                                      style={{
                                        color: '#1976d2',
                                        fontSize: '1.2rem',
                                      }}
                                    />
                                  </Button>
                                </Grid>
                              </Grid>
                            )}
                            <br />
                          </div>
                        ))}
                    </>
                  ) : null}

                  {employee.shifttype === '1 Week Rotation' ? (
                    <>
                      <Grid container spacing={2}>
                        <Grid item md={3.5} sm={6} xs={12}>
                          <Typography>
                            Shift Grouping<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <FormControl fullWidth size="small">
                            <Selects
                              options={ShiftGroupingOptions}
                              label="Please Select Shift Group"
                              value={{
                                label: employee.shiftgrouping === '' || employee.shiftgrouping === undefined ? 'Please Select Shift Grouping' : employee.shiftgrouping,
                                value: employee.shiftgrouping === '' || employee.shiftgrouping === undefined ? 'Please Select Shift Grouping' : employee.shiftgrouping,
                              }}
                              onChange={(e) => {
                                setEmployee({
                                  ...employee,
                                  shiftgrouping: e.value,
                                  shifttiming: 'Please Select Shift',
                                });
                                ShiftDropdwonsSecond(e.value);
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={3.5} sm={6} xs={12}>
                          <Typography>
                            Shift<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <FormControl fullWidth size="small">
                            <Selects
                              size="small"
                              options={shifts}
                              styles={colourStyles}
                              value={{
                                label: employee.shifttiming === '' || employee.shifttiming === undefined ? 'Please Select Shift' : employee.shifttiming,
                                value: employee.shifttiming === '' || employee.shifttiming === undefined ? 'Please Select Shift' : employee.shifttiming,
                              }}
                              onChange={(e) => {
                                setEmployee({
                                  ...employee,
                                  shifttiming: e.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={4} sm={6} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Weeks <b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <MultiSelect
                              size="small"
                              options={weekoptions2weeks
                                ?.filter((item) => !todo?.some((val) => val?.week === item))
                                ?.map((data) => ({
                                  label: data,
                                  value: data,
                                }))}
                              value={selectedOptionsCateWeeks}
                              onChange={handleWeeksChange}
                              valueRenderer={customValueRendererCateWeeks}
                              labelledBy="Please Select Weeks"
                            />
                          </FormControl>
                          {errorsLog.shiftweeks && <div>{errorsLog.shiftweeks}</div>}
                        </Grid>
                        <Grid item md={4} sm={6} xs={12} sx={{ display: 'flex' }}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Week Off<b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <MultiSelect size="small" options={getWeekdayOptions()} value={selectedOptionsCate} onChange={handleCategoryChange} valueRenderer={customValueRendererCate} labelledBy="Please Select Days" />
                          </FormControl>
                        </Grid>
                        <Grid item md={1} sm={12} xs={12}>
                          <Button
                            variant="contained"
                            style={{
                              height: '30px',
                              minWidth: '20px',
                              padding: '19px 13px',
                              color: 'white',
                              background: 'rgb(25, 118, 210)',
                              marginTop: '25px',
                            }}
                            onClick={handleAddTodo}
                          >
                            <FaPlus style={{ fontSize: '15px' }} />
                          </Button>
                        </Grid>
                      </Grid>
                      <br />
                      {todo?.length > 0 ? (
                        <Grid container spacing={2}>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Day</Typography>
                          </Grid>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Week</Typography>
                          </Grid>
                          <Grid item md={2} sm={12} xs={12}>
                            <Typography>
                              Shift Mode<b style={{ color: 'red' }}>*</b>
                            </Typography>
                          </Grid>
                          <Grid item md={2} sm={12} xs={12}>
                            <Typography>
                              Shift Grouping<b style={{ color: 'red' }}>*</b>
                            </Typography>
                          </Grid>
                          <Grid item md={2.5} sm={12} xs={12}>
                            <Typography>
                              Shift<b style={{ color: 'red' }}>*</b>{' '}
                            </Typography>
                          </Grid>
                        </Grid>
                      ) : null}
                      {todo?.length > 0 &&
                        todo.map((todo, index) => (
                          <div key={index}>
                            {editingIndexcheck === index ? (
                              <Grid container spacing={1}>
                                <Grid item md={1.5} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.day}
                                  </Typography>
                                </Grid>
                                <Grid item md={1.5} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.week}
                                  </Typography>
                                </Grid>
                                <Grid item md={2} sm={4} xs={4}>
                                  <FormControl fullWidth size="small">
                                    <Selects
                                      size="small"
                                      options={ShiftModeOptions}
                                      value={{
                                        label: todo.shiftmode,
                                        value: todo.shiftmode,
                                      }}
                                      onChange={(selectedOption) => multiInputs(index, 'shiftmode', selectedOption.value)}
                                    />
                                  </FormControl>
                                </Grid>{' '}
                                {todo.shiftmode === 'Shift' ? (
                                  <>
                                    <Grid item md={2} sm={4} xs={4}>
                                      <FormControl fullWidth size="small">
                                        <Selects
                                          size="small"
                                          options={ShiftGroupingOptions}
                                          value={{
                                            label: todo.shiftgrouping,
                                            value: todo.shiftgrouping,
                                          }}
                                          onChange={(selectedOption) => multiInputs(index, 'shiftgrouping', selectedOption.value)}
                                        />
                                      </FormControl>
                                    </Grid>
                                    <Grid item md={2.5} sm={4} xs={4}>
                                      <FormControl fullWidth size="small">
                                        <AsyncShiftTimingSelects todo={todo} index={index} auth={auth} multiInputs={multiInputs} colourStyles={colourStyles} />
                                      </FormControl>
                                    </Grid>{' '}
                                  </>
                                ) : (
                                  <>
                                    <Grid item md={2} sm={4} xs={4}></Grid>
                                    <Grid item md={2.5} sm={4} xs={4}></Grid>
                                  </>
                                )}
                                <Grid item md={1} sm={1} xs={1}>
                                  {/* Confirm button */}
                                  {todo.shiftmode === 'Shift' && (todo.shiftgrouping === 'Please Select Shift Grouping' || todo.shifttiming === 'Please Select Shift') ? null : (
                                    <Button onClick={handleUpdateTodocheck}>
                                      <CheckCircleIcon
                                        style={{
                                          fontSize: '1.5rem',
                                          color: '#216d21',
                                        }}
                                      />
                                    </Button>
                                  )}
                                </Grid>
                                <Grid item md={1} sm={1} xs={1}>
                                  {/* Cancel button */}
                                  <Button onClick={handleCancelEdit}>
                                    <CancelIcon
                                      style={{
                                        fontSize: '1.5rem',
                                        color: 'red',
                                      }}
                                    />
                                  </Button>
                                </Grid>
                              </Grid>
                            ) : (
                              <Grid container spacing={1}>
                                <Grid item md={1.5} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.day}
                                  </Typography>
                                </Grid>
                                <Grid item md={1.5} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.week}
                                  </Typography>
                                </Grid>
                                <Grid item md={2} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.shiftmode}
                                  </Typography>
                                </Grid>
                                {todo.shiftmode === 'Shift' ? (
                                  <>
                                    <Grid item md={2} sm={6} xs={12}>
                                      <Typography variant="subtitle2" color="textSecondary">
                                        {todo.shiftgrouping === 'Please Select Shift Grouping' ? '' : todo.shiftgrouping}
                                      </Typography>
                                    </Grid>
                                    <Grid item md={2} sm={6} xs={12}>
                                      <Typography variant="subtitle2" color="textSecondary">
                                        {todo.shifttiming === 'Please Select Shift' ? '' : todo.shifttiming}
                                      </Typography>
                                    </Grid>
                                  </>
                                ) : (
                                  <>
                                    <Grid item md={2} sm={6} xs={12}></Grid>
                                    <Grid item md={2} sm={6} xs={12}></Grid>
                                  </>
                                )}
                                <Grid item md={1} sm={6} xs={6}>
                                  {/* Edit button */}
                                  <Button onClick={() => handleEditTodocheck(index)}>
                                    <FaEdit
                                      style={{
                                        color: '#1976d2',
                                        fontSize: '1.2rem',
                                      }}
                                    />
                                  </Button>
                                </Grid>
                              </Grid>
                            )}
                            <br />
                          </div>
                        ))}
                    </>
                  ) : null}

                  {employee.shifttype === '2 Week Rotation' ? (
                    <>
                      <Grid container spacing={2}>
                        <Grid item md={3.5} sm={6} xs={12}>
                          <Typography>
                            Shift Grouping<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <FormControl fullWidth size="small">
                            <Selects
                              options={ShiftGroupingOptions}
                              label="Please Select Shift Group"
                              value={{
                                label: employee.shiftgrouping === '' || employee.shiftgrouping === undefined ? 'Please Select Shift Grouping' : employee.shiftgrouping,
                                value: employee.shiftgrouping === '' || employee.shiftgrouping === undefined ? 'Please Select Shift Grouping' : employee.shiftgrouping,
                              }}
                              onChange={(e) => {
                                setEmployee({
                                  ...employee,
                                  shiftgrouping: e.value,
                                  shifttiming: 'Please Select Shift',
                                });
                                ShiftDropdwonsSecond(e.value);
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={3.5} sm={6} xs={12}>
                          <Typography>
                            Shift<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <FormControl fullWidth size="small">
                            <Selects
                              size="small"
                              options={shifts}
                              styles={colourStyles}
                              value={{
                                label: employee.shifttiming === '' || employee.shifttiming === undefined ? 'Please Select Shift' : employee.shifttiming,
                                value: employee.shifttiming === '' || employee.shifttiming === undefined ? 'Please Select Shift' : employee.shifttiming,
                              }}
                              onChange={(e) => {
                                setEmployee({
                                  ...employee,
                                  shifttiming: e.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={4} sm={6} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Weeks <b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <MultiSelect
                              size="small"
                              options={weekoptions1month
                                ?.filter((item) => !todo?.some((val) => val?.week === item))
                                ?.map((data) => ({
                                  label: data,
                                  value: data,
                                }))}
                              value={selectedOptionsCateWeeks}
                              onChange={handleWeeksChange}
                              valueRenderer={customValueRendererCateWeeks}
                              labelledBy="Please Select Weeks"
                            />
                          </FormControl>
                          {errorsLog.shiftweeks && <div>{errorsLog.shiftweeks}</div>}
                        </Grid>
                        <Grid item md={4} sm={6} xs={12} sx={{ display: 'flex' }}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Week Off<b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <MultiSelect size="small" options={getWeekdayOptions()} value={selectedOptionsCate} onChange={handleCategoryChange} valueRenderer={customValueRendererCate} labelledBy="Please Select Days" />
                          </FormControl>
                        </Grid>
                        <Grid item md={1} sm={12} xs={12}>
                          <Button
                            variant="contained"
                            style={{
                              height: '30px',
                              minWidth: '20px',
                              padding: '19px 13px',
                              color: 'white',
                              background: 'rgb(25, 118, 210)',
                              marginTop: '25px',
                            }}
                            onClick={handleAddTodo}
                          >
                            <FaPlus style={{ fontSize: '15px' }} />
                          </Button>
                        </Grid>
                      </Grid>
                      <br />
                      {todo?.length > 0 ? (
                        <Grid container spacing={2}>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Day</Typography>
                          </Grid>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Week</Typography>
                          </Grid>
                          <Grid item md={2} sm={12} xs={12}>
                            <Typography>
                              Shift Mode<b style={{ color: 'red' }}>*</b>
                            </Typography>
                          </Grid>
                          <Grid item md={2} sm={12} xs={12}>
                            <Typography>
                              Shift Grouping<b style={{ color: 'red' }}>*</b>
                            </Typography>
                          </Grid>
                          <Grid item md={2.5} sm={12} xs={12}>
                            <Typography>
                              Shift<b style={{ color: 'red' }}>*</b>{' '}
                            </Typography>
                          </Grid>
                        </Grid>
                      ) : null}
                      {todo?.length > 0 &&
                        todo.map((todo, index) => (
                          <div key={index}>
                            {editingIndexcheck === index ? (
                              <Grid container spacing={1}>
                                <Grid item md={1.5} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.day}
                                  </Typography>
                                </Grid>
                                <Grid item md={1.5} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.week}
                                  </Typography>
                                </Grid>
                                <Grid item md={2} sm={4} xs={4}>
                                  <FormControl fullWidth size="small">
                                    <Selects
                                      size="small"
                                      options={ShiftModeOptions}
                                      value={{
                                        label: todo.shiftmode,
                                        value: todo.shiftmode,
                                      }}
                                      onChange={(selectedOption) => multiInputs(index, 'shiftmode', selectedOption.value)}
                                    />
                                  </FormControl>
                                </Grid>{' '}
                                {todo.shiftmode === 'Shift' ? (
                                  <>
                                    <Grid item md={2} sm={4} xs={4}>
                                      <FormControl fullWidth size="small">
                                        <Selects
                                          size="small"
                                          options={ShiftGroupingOptions}
                                          value={{
                                            label: todo.shiftgrouping,
                                            value: todo.shiftgrouping,
                                          }}
                                          onChange={(selectedOption) => multiInputs(index, 'shiftgrouping', selectedOption.value)}
                                        />
                                      </FormControl>
                                    </Grid>
                                    <Grid item md={2.5} sm={4} xs={4}>
                                      <FormControl fullWidth size="small">
                                        <AsyncShiftTimingSelects todo={todo} index={index} auth={auth} multiInputs={multiInputs} colourStyles={colourStyles} />
                                      </FormControl>
                                    </Grid>{' '}
                                  </>
                                ) : (
                                  <>
                                    <Grid item md={2} sm={4} xs={4}></Grid>
                                    <Grid item md={2.5} sm={4} xs={4}></Grid>
                                  </>
                                )}
                                <Grid item md={1} sm={1} xs={1}>
                                  {/* Confirm button */}
                                  {todo.shiftmode === 'Shift' && (todo.shiftgrouping === 'Please Select Shift Grouping' || todo.shifttiming === 'Please Select Shift') ? null : (
                                    <Button onClick={handleUpdateTodocheck}>
                                      <CheckCircleIcon
                                        style={{
                                          fontSize: '1.5rem',
                                          color: '#216d21',
                                        }}
                                      />
                                    </Button>
                                  )}
                                </Grid>
                                <Grid item md={1} sm={1} xs={1}>
                                  {/* Cancel button */}
                                  <Button onClick={handleCancelEdit}>
                                    <CancelIcon
                                      style={{
                                        fontSize: '1.5rem',
                                        color: 'red',
                                      }}
                                    />
                                  </Button>
                                </Grid>
                              </Grid>
                            ) : (
                              <Grid container spacing={1}>
                                <Grid item md={1.5} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.day}
                                  </Typography>
                                </Grid>
                                <Grid item md={1.5} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.week}
                                  </Typography>
                                </Grid>
                                <Grid item md={2} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.shiftmode}
                                  </Typography>
                                </Grid>
                                {todo.shiftmode === 'Shift' ? (
                                  <>
                                    <Grid item md={2} sm={6} xs={12}>
                                      <Typography variant="subtitle2" color="textSecondary">
                                        {todo.shiftgrouping === 'Please Select Shift Grouping' ? '' : todo.shiftgrouping}
                                      </Typography>
                                    </Grid>
                                    <Grid item md={2} sm={6} xs={12}>
                                      <Typography variant="subtitle2" color="textSecondary">
                                        {todo.shifttiming === 'Please Select Shift' ? '' : todo.shifttiming}
                                      </Typography>
                                    </Grid>
                                  </>
                                ) : (
                                  <>
                                    <Grid item md={2} sm={6} xs={12}></Grid>
                                    <Grid item md={2} sm={6} xs={12}></Grid>
                                  </>
                                )}
                                <Grid item md={1} sm={6} xs={6}>
                                  {/* Edit button */}
                                  <Button onClick={() => handleEditTodocheck(index)}>
                                    <FaEdit
                                      style={{
                                        color: '#1976d2',
                                        fontSize: '1.2rem',
                                      }}
                                    />
                                  </Button>
                                </Grid>
                              </Grid>
                            )}
                            <br />
                          </div>
                        ))}
                    </>
                  ) : null}

                  {employee.shifttype === '1 Month Rotation' ? (
                    <>
                      <Grid container spacing={2}>
                        <Grid item md={3.5} sm={6} xs={12}>
                          <Typography>
                            Shift Grouping<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <FormControl fullWidth size="small">
                            <Selects
                              options={ShiftGroupingOptions}
                              label="Please Select Shift Group"
                              value={{
                                label: employee.shiftgrouping === '' || employee.shiftgrouping === undefined ? 'Please Select Shift Grouping' : employee.shiftgrouping,
                                value: employee.shiftgrouping === '' || employee.shiftgrouping === undefined ? 'Please Select Shift Grouping' : employee.shiftgrouping,
                              }}
                              onChange={(e) => {
                                setEmployee({
                                  ...employee,
                                  shiftgrouping: e.value,
                                  shifttiming: 'Please Select Shift',
                                });
                                ShiftDropdwonsSecond(e.value);
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={3.5} sm={6} xs={12}>
                          <Typography>
                            Shift<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <FormControl fullWidth size="small">
                            <Selects
                              size="small"
                              options={shifts}
                              styles={colourStyles}
                              value={{
                                label: employee.shifttiming === '' || employee.shifttiming === undefined ? 'Please Select Shift' : employee.shifttiming,
                                value: employee.shifttiming === '' || employee.shifttiming === undefined ? 'Please Select Shift' : employee.shifttiming,
                              }}
                              onChange={(e) => {
                                setEmployee({
                                  ...employee,
                                  shifttiming: e.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={4} sm={6} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Weeks <b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <MultiSelect
                              size="small"
                              options={weekoptions2months
                                ?.filter((item) => !todo?.some((val) => val?.week === item))
                                ?.map((data) => ({
                                  label: data,
                                  value: data,
                                }))}
                              value={selectedOptionsCateWeeks}
                              onChange={handleWeeksChange}
                              valueRenderer={customValueRendererCateWeeks}
                              labelledBy="Please Select Weeks"
                            />
                          </FormControl>
                          {errorsLog.shiftweeks && <div>{errorsLog.shiftweeks}</div>}
                        </Grid>
                        <Grid item md={4} sm={6} xs={12} sx={{ display: 'flex' }}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Week Off<b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <MultiSelect size="small" options={getWeekdayOptions()} value={selectedOptionsCate} onChange={handleCategoryChange} valueRenderer={customValueRendererCate} labelledBy="Please Select Days" />
                          </FormControl>
                        </Grid>
                        <Grid item md={1} sm={12} xs={12}>
                          <Button
                            variant="contained"
                            style={{
                              height: '30px',
                              minWidth: '20px',
                              padding: '19px 13px',
                              color: 'white',
                              background: 'rgb(25, 118, 210)',
                              marginTop: '25px',
                            }}
                            onClick={handleAddTodo}
                          >
                            <FaPlus style={{ fontSize: '15px' }} />
                          </Button>
                        </Grid>
                      </Grid>
                      <br />
                      {todo?.length > 0 ? (
                        <Grid container spacing={2}>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Day</Typography>
                          </Grid>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Week</Typography>
                          </Grid>
                          <Grid item md={2} sm={12} xs={12}>
                            <Typography>
                              Shift Mode<b style={{ color: 'red' }}>*</b>
                            </Typography>
                          </Grid>
                          <Grid item md={2} sm={12} xs={12}>
                            <Typography>
                              Shift Grouping<b style={{ color: 'red' }}>*</b>
                            </Typography>
                          </Grid>
                          <Grid item md={2.5} sm={12} xs={12}>
                            <Typography>
                              Shift<b style={{ color: 'red' }}>*</b>{' '}
                            </Typography>
                          </Grid>
                        </Grid>
                      ) : null}
                      {todo?.length > 0 &&
                        todo.map((todo, index) => (
                          <div key={index}>
                            {editingIndexcheck === index ? (
                              <Grid container spacing={1}>
                                <Grid item md={1.5} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.day}
                                  </Typography>
                                </Grid>
                                <Grid item md={1.5} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.week}
                                  </Typography>
                                </Grid>
                                <Grid item md={2} sm={4} xs={4}>
                                  <FormControl fullWidth size="small">
                                    <Selects
                                      size="small"
                                      options={ShiftModeOptions}
                                      value={{
                                        label: todo.shiftmode,
                                        value: todo.shiftmode,
                                      }}
                                      onChange={(selectedOption) => multiInputs(index, 'shiftmode', selectedOption.value)}
                                    />
                                  </FormControl>
                                </Grid>{' '}
                                {todo.shiftmode === 'Shift' ? (
                                  <>
                                    <Grid item md={2} sm={4} xs={4}>
                                      <FormControl fullWidth size="small">
                                        <Selects
                                          size="small"
                                          options={ShiftGroupingOptions}
                                          value={{
                                            label: todo.shiftgrouping,
                                            value: todo.shiftgrouping,
                                          }}
                                          onChange={(selectedOption) => multiInputs(index, 'shiftgrouping', selectedOption.value)}
                                        />
                                      </FormControl>
                                    </Grid>
                                    <Grid item md={2.5} sm={4} xs={4}>
                                      <FormControl fullWidth size="small">
                                        <AsyncShiftTimingSelects todo={todo} index={index} auth={auth} multiInputs={multiInputs} colourStyles={colourStyles} />
                                      </FormControl>
                                    </Grid>{' '}
                                  </>
                                ) : (
                                  <>
                                    <Grid item md={2} sm={4} xs={4}></Grid>
                                    <Grid item md={2.5} sm={4} xs={4}></Grid>
                                  </>
                                )}
                                <Grid item md={1} sm={1} xs={1}>
                                  {/* Confirm button */}
                                  {todo.shiftmode === 'Shift' && (todo.shiftgrouping === 'Please Select Shift Grouping' || todo.shifttiming === 'Please Select Shift') ? null : (
                                    <Button onClick={handleUpdateTodocheck}>
                                      <CheckCircleIcon
                                        style={{
                                          fontSize: '1.5rem',
                                          color: '#216d21',
                                        }}
                                      />
                                    </Button>
                                  )}
                                </Grid>
                                <Grid item md={1} sm={1} xs={1}>
                                  {/* Cancel button */}
                                  <Button onClick={handleCancelEdit}>
                                    <CancelIcon
                                      style={{
                                        fontSize: '1.5rem',
                                        color: 'red',
                                      }}
                                    />
                                  </Button>
                                </Grid>
                              </Grid>
                            ) : (
                              <Grid container spacing={1}>
                                <Grid item md={1.5} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.day}
                                  </Typography>
                                </Grid>
                                <Grid item md={1.5} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.week}
                                  </Typography>
                                </Grid>
                                <Grid item md={2} sm={6} xs={12}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    {todo.shiftmode}
                                  </Typography>
                                </Grid>
                                {todo.shiftmode === 'Shift' ? (
                                  <>
                                    <Grid item md={2} sm={6} xs={12}>
                                      <Typography variant="subtitle2" color="textSecondary">
                                        {todo.shiftgrouping === 'Please Select Shift Grouping' ? '' : todo.shiftgrouping}
                                      </Typography>
                                    </Grid>
                                    <Grid item md={2} sm={6} xs={12}>
                                      <Typography variant="subtitle2" color="textSecondary">
                                        {todo.shifttiming === 'Please Select Shift' ? '' : todo.shifttiming}
                                      </Typography>
                                    </Grid>
                                  </>
                                ) : (
                                  <>
                                    <Grid item md={2} sm={6} xs={12}></Grid>
                                    <Grid item md={2} sm={6} xs={12}></Grid>
                                  </>
                                )}
                                <Grid item md={1} sm={6} xs={6}>
                                  {/* Edit button */}
                                  <Button onClick={() => handleEditTodocheck(index)}>
                                    <FaEdit
                                      style={{
                                        color: '#1976d2',
                                        fontSize: '1.2rem',
                                      }}
                                    />
                                  </Button>
                                </Grid>
                              </Grid>
                            )}
                            <br />
                          </div>
                        ))}
                    </>
                  ) : null}
                  {/* {employee.shifttype === "Daily" ? (
                    <>
                      {todo?.length > 0 ? (
                        <Grid container spacing={2}>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Day</Typography>
                          </Grid>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Week</Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>
                              Shift Mode<b style={{ color: "red" }}>*</b>
                            </Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>
                              Shift Grouping<b style={{ color: "red" }}>*</b>
                            </Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>
                              Shift<b style={{ color: "red" }}>*</b>{" "}
                            </Typography>
                          </Grid>
                        </Grid>
                      ) : null}
                      {todo &&
                        todo?.map((todo, index) => (
                          <Grid
                            container
                            spacing={2}
                            key={index}
                            sx={{ paddingTop: "5px" }}
                          >
                            <Grid item md={1.5} sm={6} xs={12}>
                              <Typography>{todo.day}</Typography>
                            </Grid>
                            <Grid item md={1.5} sm={6} xs={12}>
                              <Typography>{todo.week}</Typography>
                            </Grid>
                            <Grid item md={3} sm={6} xs={12}>
                              <FormControl fullWidth size="small">
                                <Selects
                                  size="small"
                                  options={ShiftModeOptions}
                                  value={{
                                    label: todo.shiftmode,
                                    value: todo.shiftmode,
                                  }}
                                  onChange={(selectedOption) =>
                                    multiInputs(
                                      index,
                                      "shiftmode",
                                      selectedOption.value
                                    )
                                  }
                                />
                              </FormControl>
                              {errorsLog.checkShiftMode &&
                                finderrorindex.includes(index) && (
                                  <div>{errorsLog.checkShiftMode}</div>
                                )}
                            </Grid>
                            {todo.shiftmode === "Week Off" ? (
                              <Grid item md={6} sm={6} xs={12}></Grid>
                            ) : (
                              <>
                                <Grid item md={3} sm={6} xs={12}>
                                  <FormControl fullWidth size="small">
                                    <Selects
                                      size="small"
                                      options={ShiftGroupingOptions}
                                      value={{
                                        label: todo.shiftgrouping,
                                        value: todo.shiftgrouping,
                                      }}
                                      onChange={(selectedOption) =>
                                        multiInputs(
                                          index,
                                          "shiftgrouping",
                                          selectedOption.value
                                        )
                                      }
                                    />
                                  </FormControl>
                                  {errorsLog.checkShiftGroup &&
                                    finderrorindexgrp.includes(index) && (
                                      <div>{errorsLog.checkShiftGroup}</div>
                                    )}
                                </Grid>
                                <Grid item md={3} xs={6} sm={6}>
                                  <FormControl fullWidth size="small">
                                    
                                    <AsyncShiftTimingSelects
                                      todo={todo}
                                      index={index}
                                      auth={auth}
                                      multiInputs={multiInputs}
                                      colourStyles={colourStyles}
                                    />
                                  </FormControl>
                                  {errorsLog.checkShift &&
                                    finderrorindexshift.includes(index) && (
                                      <div>{errorsLog.checkShift}</div>
                                    )}
                                </Grid>
                              </>
                            )}
                          </Grid>
                        ))}
                    </>
                  ) : null}

                  {employee.shifttype === "1 Week Rotation" ? (
                    <>
                      {todo?.length > 0 ? (
                        <Grid container spacing={2}>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Day</Typography>
                          </Grid>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Week</Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>
                              Shift Mode<b style={{ color: "red" }}>*</b>
                            </Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>
                              Shift Grouping<b style={{ color: "red" }}>*</b>
                            </Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>
                              Shift<b style={{ color: "red" }}>*</b>{" "}
                            </Typography>
                          </Grid>
                        </Grid>
                      ) : null}
                      {todo &&
                        todo?.map((todo, index) => (
                          <Grid container spacing={2} key={index}>
                            <Grid item md={1.5} sm={6} xs={12}>
                              <Typography>{todo.day}</Typography>
                            </Grid>
                            <Grid item md={1.5} sm={6} xs={12}>
                              <Typography>{todo.week}</Typography>
                            </Grid>
                            <Grid item md={3} sm={6} xs={12}>
                              <FormControl fullWidth size="small">
                                <Selects
                                  size="small"
                                  options={ShiftModeOptions}
                                  value={{
                                    label: todo.shiftmode,
                                    value: todo.shiftmode,
                                  }}
                                  onChange={(selectedOption) =>
                                    multiInputs(
                                      index,
                                      "shiftmode",
                                      selectedOption.value
                                    )
                                  }
                                />
                              </FormControl>
                              {errorsLog.checkShiftMode &&
                                finderrorindex.includes(index) && (
                                  <div>{errorsLog.checkShiftMode}</div>
                                )}
                            </Grid>
                            {todo.shiftmode === "Week Off" ? (
                              <Grid item md={6} sm={6} xs={12}></Grid>
                            ) : (
                              <>
                                <Grid item md={3} sm={6} xs={12}>
                                  <FormControl fullWidth size="small">
                                    <Selects
                                      size="small"
                                      options={ShiftGroupingOptions}
                                      value={{
                                        label: todo.shiftgrouping,
                                        value: todo.shiftgrouping,
                                      }}
                                      onChange={(selectedOption) =>
                                        multiInputs(
                                          index,
                                          "shiftgrouping",
                                          selectedOption.value
                                        )
                                      }
                                    />
                                  </FormControl>
                                  {errorsLog.checkShiftGroup &&
                                    finderrorindexgrp.includes(index) && (
                                      <div>{errorsLog.checkShiftGroup}</div>
                                    )}
                                </Grid>
                                <Grid item md={3} xs={6} sm={6}>
                                  <FormControl fullWidth size="small">
                                    
                                    <AsyncShiftTimingSelects
                                      todo={todo}
                                      index={index}
                                      auth={auth}
                                      multiInputs={multiInputs}
                                      colourStyles={colourStyles}
                                    />
                                  </FormControl>
                                  {errorsLog.checkShift &&
                                    finderrorindexshift.includes(index) && (
                                      <div>{errorsLog.checkShift}</div>
                                    )}
                                </Grid>
                              </>
                            )}
                          </Grid>
                        ))}
                    </>
                  ) : null}

                  {employee.shifttype === "2 Week Rotation" ? (
                    <>
                      {todo?.length > 0 ? (
                        <Grid container spacing={2}>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Day</Typography>
                          </Grid>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Week</Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>
                              Shift Mode<b style={{ color: "red" }}>*</b>
                            </Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>
                              Shift Grouping<b style={{ color: "red" }}>*</b>
                            </Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>
                              Shift<b style={{ color: "red" }}>*</b>{" "}
                            </Typography>
                          </Grid>
                        </Grid>
                      ) : null}
                      {todo &&
                        todo?.map((todo, index) => (
                          <Grid container spacing={2} key={index}>
                            <Grid item md={1.5} sm={6} xs={12}>
                              <Typography>{todo.day}</Typography>
                            </Grid>
                            <Grid item md={1.5} sm={6} xs={12}>
                              <Typography>{todo.week}</Typography>
                            </Grid>
                            <Grid item md={3} sm={6} xs={12}>
                              <FormControl fullWidth size="small">
                                <Selects
                                  size="small"
                                  options={ShiftModeOptions}
                                  value={{
                                    label: todo.shiftmode,
                                    value: todo.shiftmode,
                                  }}
                                  onChange={(selectedOption) =>
                                    multiInputs(
                                      index,
                                      "shiftmode",
                                      selectedOption.value
                                    )
                                  }
                                />
                              </FormControl>
                              {errorsLog.checkShiftMode &&
                                finderrorindex.includes(index) && (
                                  <div>{errorsLog.checkShiftMode}</div>
                                )}
                            </Grid>
                            {todo.shiftmode === "Week Off" ? (
                              <Grid item md={6} sm={6} xs={12}></Grid>
                            ) : (
                              <>
                                <Grid item md={3} sm={6} xs={12}>
                                  <FormControl fullWidth size="small">
                                    <Selects
                                      size="small"
                                      options={ShiftGroupingOptions}
                                      value={{
                                        label: todo.shiftgrouping,
                                        value: todo.shiftgrouping,
                                      }}
                                      onChange={(selectedOption) =>
                                        multiInputs(
                                          index,
                                          "shiftgrouping",
                                          selectedOption.value
                                        )
                                      }
                                    />
                                  </FormControl>
                                  {errorsLog.checkShiftGroup &&
                                    finderrorindexgrp.includes(index) && (
                                      <div>{errorsLog.checkShiftGroup}</div>
                                    )}
                                </Grid>
                                <Grid item md={3} xs={6} sm={6}>
                                  <FormControl fullWidth size="small">
                                    
                                    <AsyncShiftTimingSelects
                                      todo={todo}
                                      index={index}
                                      auth={auth}
                                      multiInputs={multiInputs}
                                      colourStyles={colourStyles}
                                    />
                                  </FormControl>
                                  {errorsLog.checkShift &&
                                    finderrorindexshift.includes(index) && (
                                      <div>{errorsLog.checkShift}</div>
                                    )}
                                </Grid>
                              </>
                            )}
                          </Grid>
                        ))}
                    </>
                  ) : null}

                  {employee.shifttype === "1 Month Rotation" ? (
                    <>
                      {todo?.length > 0 ? (
                        <Grid container spacing={2}>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Day</Typography>
                          </Grid>
                          <Grid item md={1.5} sm={12} xs={12}>
                            <Typography>Week</Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>
                              Shift Mode<b style={{ color: "red" }}>*</b>
                            </Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>
                              Shift Grouping<b style={{ color: "red" }}>*</b>
                            </Typography>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <Typography>
                              Shift<b style={{ color: "red" }}>*</b>{" "}
                            </Typography>
                          </Grid>
                        </Grid>
                      ) : null}
                      {todo &&
                        todo?.map((todo, index) => (
                          <Grid container spacing={2} key={index}>
                            <Grid item md={1.5} sm={6} xs={12}>
                              <Typography>{todo.day}</Typography>
                            </Grid>
                            <Grid item md={1.5} sm={6} xs={12}>
                              <Typography>{todo.week}</Typography>
                            </Grid>
                            <Grid item md={3} sm={6} xs={12}>
                              <FormControl fullWidth size="small">
                                <Selects
                                  size="small"
                                  options={ShiftModeOptions}
                                  value={{
                                    label: todo.shiftmode,
                                    value: todo.shiftmode,
                                  }}
                                  onChange={(selectedOption) =>
                                    multiInputs(
                                      index,
                                      "shiftmode",
                                      selectedOption.value
                                    )
                                  }
                                />
                              </FormControl>
                              {errorsLog.checkShiftMode &&
                                finderrorindex.includes(index) && (
                                  <div>{errorsLog.checkShiftMode}</div>
                                )}
                            </Grid>
                            {todo.shiftmode === "Week Off" ? (
                              <Grid item md={6} sm={6} xs={12}></Grid>
                            ) : (
                              <>
                                <Grid item md={3} sm={6} xs={12}>
                                  <FormControl fullWidth size="small">
                                    <Selects
                                      size="small"
                                      options={ShiftGroupingOptions}
                                      value={{
                                        label: todo.shiftgrouping,
                                        value: todo.shiftgrouping,
                                      }}
                                      onChange={(selectedOption) =>
                                        multiInputs(
                                          index,
                                          "shiftgrouping",
                                          selectedOption.value
                                        )
                                      }
                                    />
                                  </FormControl>
                                  {errorsLog.checkShiftGroup &&
                                    finderrorindexgrp.includes(index) && (
                                      <div>{errorsLog.checkShiftGroup}</div>
                                    )}
                                </Grid>
                                <Grid item md={3} xs={6} sm={6}>
                                  <FormControl fullWidth size="small">
                                    
                                    <AsyncShiftTimingSelects
                                      todo={todo}
                                      index={index}
                                      auth={auth}
                                      multiInputs={multiInputs}
                                      colourStyles={colourStyles}
                                    />
                                  </FormControl>
                                  {errorsLog.checkShift &&
                                    finderrorindexshift.includes(index) && (
                                      <div>{errorsLog.checkShift}</div>
                                    )}
                                </Grid>
                              </>
                            )}
                          </Grid>
                        ))}
                    </>
                  ) : null} */}
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Reporting To <b style={{ color: 'red' }}>*</b>{' '}
                    </Typography>
                    <Selects
                      labelId="demo-select-small"
                      id="demo-select-small"
                      options={
                        reportingtonames &&
                        reportingtonames?.map((row) => ({
                          label: row,
                          value: row,
                        }))
                      }
                      value={{
                        label: employee?.reportingto === '' || employee?.reportingto == undefined ? 'Please Select Reporting To' : employee?.reportingto,
                        value: employee?.reportingto === '' || employee?.reportingto == undefined ? 'Please Select Reporting To' : employee?.reportingto,
                      }}
                      onChange={(e) => {
                        setEmployee({ ...employee, reportingto: e.value });
                      }}
                    />
                  </FormControl>
                  {errorsLog.reportingto && <div>{errorsLog.reportingto}</div>}
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  {employee.wordcheck === true ? (
                    <FormControl size="small" fullWidth>
                      <Typography>
                        EmpCode(Manual) <b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        // disabled
                        placeholder="EmpCode"
                        // value={employee.empcode}
                        value={employeecodenew}
                        onChange={(e) => setEmployeecodenew(e.target.value)}
                      />
                    </FormControl>
                  ) : (
                    <FormControl size="small" fullWidth>
                      <Typography>
                        EmpCode(Auto) <b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        // disabled
                        placeholder="EmpCode"
                        // value={employee.empcode}
                        value={employee.empcode}
                      />
                    </FormControl>
                  )}
                  <Grid>
                    <FormGroup>
                      <FormControlLabel
                        control={<Checkbox disabled={checkcode === true} checked={employee.wordcheck === true} />}
                        onChange={() => {
                          setEmployee({
                            ...employee,
                            wordcheck: !employee.wordcheck,
                          });
                          // setPrimaryWorkStation(
                          //   "Please Select Primary Work Station"
                          // );
                          // setPrimaryWorkStationLabel('Please Select Primary Work Station');
                          // setWorkstationTodoList([]);
                        }}
                        label="Enable Empcode"
                      />
                    </FormGroup>
                  </Grid>
                  {errorsLog.empcode && <div>{errorsLog.empcode}</div>}
                </Grid>

                {employee.workmode !== 'Remote' ? (
                  <>
                    {' '}
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Work Station (Primary){employee?.prod && <b style={{ color: 'red' }}>*</b>}</Typography>
                        <Selects
                          options={filteredWorkStation.filter((item, index, self) => {
                            return index === self.findIndex((i) => i.value === item.value) && !valueWorkStation?.includes(item?.value);
                          })}
                          label="Please Select Shift"
                          value={{
                            label: primaryWorkStationLabel ? primaryWorkStationLabel : 'Please Select Primary Work Station',
                            value: primaryWorkStation ? primaryWorkStation : 'Please Select Primary Work Station',
                          }}
                          isDisabled={maxSelections === 0} // onChange={(e) => {
                          //   setPrimaryWorkStation(e.value);
                          //   setPrimaryWorkStationLabel(e.label);

                          //   setValueWorkStation((prev) =>
                          //     prev.filter((val) => val !== e.value)
                          //   );

                          //   // Remove selected object from selectedOptionsWorkStation array
                          //   setSelectedOptionsWorkStation((prev) =>
                          //     prev.filter((obj) => obj.value !== e.value)
                          //   );
                          //   // setSelectedOptionsWorkStation([]);
                          //   // setValueWorkStation([]);
                          // }}
                          onChange={(e) => {
                            const isValue = e.value?.replace(/\([^)]*\)$/, '');
                            setPrimaryWorkStation(e.value);
                            setPrimaryWorkStationLabel(e.label);
                            // setSelectedOptionsWorkStation([]);
                            // setValueWorkStation([]);

                            setValueWorkStation((prev) => prev.filter((val) => val !== e.value));

                            // Remove selected object from selectedOptionsWorkStation array
                            setSelectedOptionsWorkStation((prev) => prev.filter((obj) => obj.value !== e.value));

                            const matches = e.label?.match(/^(.*?)\((.*?)\)\((.*?)\)$/);

                            setSelectedOptionsWorkStation((prev) => prev.filter((obj) => obj.value !== e.value));
                            let setWorkTodo = workstationTodoList?.filter((data) => data?.type !== 'Primary' && data?.shortname !== matches?.[3]) || [];
                            setWorkstationTodoList((prev) => [
                              {
                                workstation: matches?.[1]?.trim() + '(' + matches?.[2]?.trim() + ')', // G-HRA(TTS-TRICHY-Ground Floor)
                                shortname: matches?.[3],
                                type: 'Primary',
                              },
                              ...setWorkTodo,
                            ]);

                            const selectedCabinName = e?.value?.split('(')[0];
                            const Bracketsbranch = e?.value?.match(/\(([^)]+)\)/)?.[1];
                            const hyphenCount = Bracketsbranch.split('-').length - 1;

                            const Branch = hyphenCount === 1 ? Bracketsbranch.split('-')[0].trim() : Bracketsbranch?.split('-').slice(0, 2).join('-');

                            const Floor = hyphenCount === 1 ? Bracketsbranch.split('-')[1].trim() : hyphenCount === 2 ? Bracketsbranch.split('-').pop() : Bracketsbranch.split('-').slice(-2).join('-')?.replace(')', '');

                            console.log(workStationSystemName, 'workStationSystemName');

                            const shortname = workStationSystemName
                              ?.filter((item) => item?.branch === Branch && (Floor === '' || Floor === item?.floor) && item?.cabinname === selectedCabinName)
                              ?.map((item) => item?.systemshortname)
                              ?.toString();

                            setPrimaryKeyShortname(`${shortname},`);
                            setKeyShortname('');
                          }}
                          // menuPortalTarget={document.body}
                          // styles={{
                          //   menuPortal: (base) => ({ ...base, zIndex: 1500 }),
                          // }}
                          // formatOptionLabel={(data) => {
                          //   let value = data?.label;
                          //   if (!value) {
                          //     value = 'Please Select Primary Work Station';
                          //   }
                          //   // Extract text before and within parentheses
                          //   const bracketIndex = value?.indexOf('(');
                          //   const label = bracketIndex > -1 ? value?.slice(0, bracketIndex) : value;
                          //   const bracketContent = bracketIndex > -1 ? value?.slice(bracketIndex) : '';

                          //   // const bracketIndex = value.indexOf('(');
                          //   // const bracketContent = bracketIndex > -1 ? value.slice(bracketIndex) : "";

                          //   // Check if there's a second set of parentheses
                          //   const secondBracketMatch = bracketContent?.match(/\(([^)]+)\)\(([^)]+)\)/);

                          //   const hasSecondBracket = secondBracketMatch !== null;

                          //   let firstBracketContent;
                          //   let secondBracketContent;
                          //   if (hasSecondBracket) {
                          //     firstBracketContent = secondBracketMatch[1]; // Content of the first set of parentheses
                          //     secondBracketContent = secondBracketMatch[2]; // Content of the second set of parentheses
                          //   }

                          //   return (
                          //     <div>
                          //       <span>{label}</span>

                          //       {hasSecondBracket ? (
                          //         <>
                          //           <span>{`(${firstBracketContent})`}</span>
                          //           <span style={{ color: 'green' }}>{`(${secondBracketContent})`}</span>
                          //         </>
                          //       ) : (
                          //         <span>{bracketContent}</span>
                          //       )}
                          //     </div>
                          //   );
                          // }}
                        />
                      </FormControl>
                      {errorsLog.workstation && <div>{errorsLog.workstation}</div>}
                      {errorsLog.primaryworkstation && <div>{errorsLog.primaryworkstation}</div>}
                    </Grid>
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Work Station (Secondary)</Typography>
                        <MultiSelect
                          size="small"
                          options={allWorkStationOpt.filter((item, index, self) => {
                            return index === self.findIndex((i) => i.value === item.value) && item.value !== primaryWorkStation;
                          })}
                          value={selectedOptionsWorkStation}
                          onChange={handleEmployeesChange}
                          valueRenderer={customValueRendererEmployees}
                          disabled={maxSelections === 0 || Number(maxSelections) < 0}
                          // disabled={maxSelections === 0 || Number(maxSelections) < 1 || primaryWorkStation === 'Please Select Primary Work Station' || primaryWorkStation === '' || !primaryWorkStation}
                        />
                      </FormControl>
                      {errorsLog.workstation && <div>{errorsLog.workstation}</div>}
                    </Grid>
                    {employee.workmode === 'Office' && (
                      <>
                        <Grid item md={4} sm={12} xs={12}>
                          <FormControl size="small" fullWidth>
                            <Typography>If Office</Typography>
                          </FormControl>
                          <Grid>
                            <FormGroup>
                              <FormControlLabel
                                control={<Checkbox checked={employee.ifoffice === true} />}
                                onChange={(e) => {
                                  setEmployee({
                                    ...employee,
                                    ifoffice: !employee.ifoffice,
                                    workstationofficestatus: !employee.ifoffice,
                                  });
                                }}
                                label="Work Station Other"
                              />
                            </FormGroup>
                          </Grid>
                          {errorsLog.ifoffice && <div>{errorsLog.ifoffice}</div>}
                        </Grid>
                      </>
                    )}
                    {employee.ifoffice === true && (
                      <>
                        <Grid item md={4} sm={6} xs={12}>
                          <FormControl size="small" fullWidth>
                            <Typography>
                              Work Station (WFH)
                              <b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <OutlinedInput id="component-outlined" type="text" placeholder="Please Enter Work Station" value={primaryWorkStationInput} readOnly />
                          </FormControl>
                          {errorsLog.primaryworkstationinput && <div>{errorsLog.primaryworkstationinput}</div>}
                        </Grid>
                      </>
                    )}
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Workstation ShortName</Typography>
                        <TextareaAutosize
                          aria-label="minimum height"
                          minRows={5}
                          readOnly
                          value={workstationTodoList?.length > 0 ? workstationTodoList?.map((data) => data?.shortname)?.join(',') : ''}
                          // value={keyPrimaryShortname + keyShortname}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={8} xs={12} sm={12}>
                      <TableContainer size="small">
                        <Table>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableCell sx={{ py: 0.3 }}>
                                <Typography variant="subtitle1">Workstation</Typography>
                              </TableCell>
                              <TableCell sx={{ py: 0.3 }}>
                                <Typography variant="subtitle1">Shortname</Typography>
                              </TableCell>
                              <TableCell sx={{ py: 0.3 }}>
                                <Typography variant="subtitle1">Type</Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ py: 0.3 }}>
                                <Typography variant="subtitle1">Action</Typography>
                              </TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {workstationTodoList.map((todo, index) => (
                              <TableRow key={index}>
                                <TableCell sx={{ py: 0.3 }}>
                                  <Typography sx={{ fontSize: '0.9rem' }}>{todo.workstation}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 0.3 }}>
                                  <Typography sx={{ fontSize: '0.9rem' }}>{todo.shortname}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 0.3 }}>
                                  <Typography sx={{ fontSize: '0.9rem' }}>{todo.type}</Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ py: 0.3 }}>
                                  <IconButton onClick={() => deleteTodo(todo)} color="error">
                                    <CloseIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                            {workstationTodoList.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} align="center">
                                  <Typography variant="body2" color="text.secondary">
                                    No Workstations.
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </>
                ) : null}

                {employee.workmode === 'Remote' ? (
                  <>
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Work Station (Primary){employee?.prod && <b style={{ color: 'red' }}>*</b>}</Typography>
                        <Selects
                          options={filteredWorkStation.filter((item, index, self) => {
                            return index === self.findIndex((i) => i.value === item.value) && !valueWorkStation?.includes(item?.value);
                          })}
                          label="Please Select Shift"
                          value={{
                            label: primaryWorkStationLabel ? primaryWorkStationLabel : 'Please Select Primary Work Station',
                            value: primaryWorkStation ? primaryWorkStation : 'Please Select Primary Work Station',
                          }}
                          isDisabled={maxSelections === 0} // onChange={(e) => {
                          //   setPrimaryWorkStation(e.value);
                          //   setPrimaryWorkStationLabel(e.label);

                          //   setValueWorkStation((prev) =>
                          //     prev.filter((val) => val !== e.value)
                          //   );

                          //   // Remove selected object from selectedOptionsWorkStation array
                          //   setSelectedOptionsWorkStation((prev) =>
                          //     prev.filter((obj) => obj.value !== e.value)
                          //   );
                          //   // setSelectedOptionsWorkStation([]);
                          //   // setValueWorkStation([]);
                          // }}
                          onChange={(e) => {
                            const isValue = e.value?.replace(/\([^)]*\)$/, '');
                            setPrimaryWorkStation(e.value);
                            setPrimaryWorkStationLabel(e.label);
                            // setSelectedOptionsWorkStation([]);
                            // setValueWorkStation([]);

                            setValueWorkStation((prev) => prev.filter((val) => val !== e.value));

                            // Remove selected object from selectedOptionsWorkStation array
                            setSelectedOptionsWorkStation((prev) => prev.filter((obj) => obj.value !== e.value));

                            const matches = e.label?.match(/^(.*?)\((.*?)\)\((.*?)\)$/);

                            setSelectedOptionsWorkStation((prev) => prev.filter((obj) => obj.value !== e.value));
                            let setWorkTodo = workstationTodoList?.filter((data) => data?.type !== 'Primary' && data?.shortname !== matches?.[3]) || [];
                            setWorkstationTodoList((prev) => [
                              {
                                workstation: matches?.[1]?.trim() + '(' + matches?.[2]?.trim() + ')', // G-HRA(TTS-TRICHY-Ground Floor)
                                shortname: matches?.[3],
                                type: 'Primary',
                              },
                              ...setWorkTodo,
                            ]);

                            const selectedCabinName = e?.value?.split('(')[0];
                            const Bracketsbranch = e?.value?.match(/\(([^)]+)\)/)?.[1];
                            const hyphenCount = Bracketsbranch.split('-').length - 1;

                            const Branch = hyphenCount === 1 ? Bracketsbranch.split('-')[0].trim() : Bracketsbranch?.split('-').slice(0, 2).join('-');

                            const Floor = hyphenCount === 1 ? Bracketsbranch.split('-')[1].trim() : hyphenCount === 2 ? Bracketsbranch.split('-').pop() : Bracketsbranch.split('-').slice(-2).join('-')?.replace(')', '');

                            console.log(workStationSystemName, 'workStationSystemName');

                            const shortname = workStationSystemName
                              ?.filter((item) => item?.branch === Branch && (Floor === '' || Floor === item?.floor) && item?.cabinname === selectedCabinName)
                              ?.map((item) => item?.systemshortname)
                              ?.toString();

                            setPrimaryKeyShortname(`${shortname},`);
                            setKeyShortname('');
                          }}
                          // menuPortalTarget={document.body}
                          // styles={{
                          //   menuPortal: (base) => ({ ...base, zIndex: 1500 }),
                          // }}
                          // formatOptionLabel={(data) => {
                          //   let value = data?.label;
                          //   if (!value) {
                          //     value = 'Please Select Primary Work Station';
                          //   }
                          //   // Extract text before and within parentheses
                          //   const bracketIndex = value?.indexOf('(');
                          //   const label = bracketIndex > -1 ? value?.slice(0, bracketIndex) : value;
                          //   const bracketContent = bracketIndex > -1 ? value?.slice(bracketIndex) : '';

                          //   // const bracketIndex = value.indexOf('(');
                          //   // const bracketContent = bracketIndex > -1 ? value.slice(bracketIndex) : "";

                          //   // Check if there's a second set of parentheses
                          //   const secondBracketMatch = bracketContent?.match(/\(([^)]+)\)\(([^)]+)\)/);

                          //   const hasSecondBracket = secondBracketMatch !== null;

                          //   let firstBracketContent;
                          //   let secondBracketContent;
                          //   if (hasSecondBracket) {
                          //     firstBracketContent = secondBracketMatch[1]; // Content of the first set of parentheses
                          //     secondBracketContent = secondBracketMatch[2]; // Content of the second set of parentheses
                          //   }

                          //   return (
                          //     <div>
                          //       <span>{label}</span>

                          //       {hasSecondBracket ? (
                          //         <>
                          //           <span>{`(${firstBracketContent})`}</span>
                          //           <span style={{ color: 'green' }}>{`(${secondBracketContent})`}</span>
                          //         </>
                          //       ) : (
                          //         <span>{bracketContent}</span>
                          //       )}
                          //     </div>
                          //   );
                          // }}
                        />
                      </FormControl>
                      {errorsLog.workstation && <div>{errorsLog.workstation}</div>}
                      {errorsLog.primaryworkstation && <div>{errorsLog.primaryworkstation}</div>}
                    </Grid>

                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Work Station (Secondary)</Typography>
                        <MultiSelect
                          size="small"
                          options={allWorkStationOpt.filter((item, index, self) => {
                            return index === self.findIndex((i) => i.value === item.value) && item.value !== primaryWorkStation;
                          })}
                          value={selectedOptionsWorkStation}
                          onChange={handleEmployeesChange}
                          valueRenderer={customValueRendererEmployees}
                          disabled={maxSelections === 0 || Number(maxSelections) < 0}
                          // disabled={maxSelections === 0 || Number(maxSelections) < 1 || primaryWorkStation === 'Please Select Primary Work Station' || primaryWorkStation === '' || !primaryWorkStation}
                        />
                      </FormControl>
                      {errorsLog.workstation && <div>{errorsLog.workstation}</div>}
                    </Grid>
                    <Grid item md={4} sm={6} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Work Station (WFH)</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="Please Enter Work Station"
                          value={primaryWorkStationInput}
                          // onChange={(e) => {
                          //   setPrimaryWorkStationInput(e.target.value);
                          // }}
                          readOnly
                        />
                      </FormControl>
                    </Grid>

                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Workstation ShortName</Typography>
                        <TextareaAutosize
                          aria-label="minimum height"
                          minRows={5}
                          readOnly
                          value={workstationTodoList?.length > 0 ? workstationTodoList?.map((data) => data?.shortname)?.join(',') : ''}
                          // value={keyPrimaryShortname + keyShortname}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={8} xs={12} sm={12}>
                      <TableContainer size="small">
                        <Table>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableCell sx={{ py: 0.3 }}>
                                <Typography variant="subtitle1">Workstation</Typography>
                              </TableCell>
                              <TableCell sx={{ py: 0.3 }}>
                                <Typography variant="subtitle1">Shortname</Typography>
                              </TableCell>
                              <TableCell sx={{ py: 0.3 }}>
                                <Typography variant="subtitle1">Type</Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ py: 0.3 }}>
                                <Typography variant="subtitle1">Action</Typography>
                              </TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {workstationTodoList.map((todo, index) => (
                              <TableRow key={index}>
                                <TableCell sx={{ py: 0.3 }}>
                                  <Typography sx={{ fontSize: '0.9rem' }}>{todo.workstation}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 0.3 }}>
                                  <Typography sx={{ fontSize: '0.9rem' }}>{todo.shortname}</Typography>
                                </TableCell>
                                <TableCell sx={{ py: 0.3 }}>
                                  <Typography sx={{ fontSize: '0.9rem' }}>{todo.type}</Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ py: 0.3 }}>
                                  <IconButton onClick={() => deleteTodo(todo)} color="error">
                                    <CloseIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                            {workstationTodoList.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} align="center">
                                  <Typography variant="body2" color="text.secondary">
                                    No Workstations.
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </>
                ) : null}
              </Grid>
            </Box>
            <br />
          </Grid>
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-end' }} alignItems="center">
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', md: 'column' }, // Row for small screens, column for larger screens
                justifyContent: { xs: 'center', md: 'flex-end' },
                alignItems: 'center',
                gap: '10px',
                position: { xs: 'static', md: 'fixed' }, // Static for small screens, fixed for larger screens
                bottom: { xs: 0, md: 'auto' }, // Align to bottom for small screens
                right: { xs: 'auto', md: '10px' }, // Align right for large screens
                top: { xs: 'auto', md: '50%' }, // Center vertically for large screens
                transform: { xs: 'none', md: 'translateY(-50%)' }, // Center transform for large screens
                width: 'auto',
                padding: { xs: '0 5px', md: '0 10px' }, // Reduce padding for small screens
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
              }}
            >
              <Button
                className="prev"
                variant="contained"
                size="small"
                sx={{
                  display: { xs: 'block', md: 'none' }, // Show on small screens, hide on large screens
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
                onClick={() => {
                  nextStepLog('prev');
                }}
              >
                Previous
              </Button>
              <Button
                className="next"
                variant="contained"
                size="small"
                onClick={() => {
                  nextStepLog('next');
                }}
                sx={{
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                Next
              </Button>

              {/* <Link
                to="/enquirypurposelist"
                style={{
                  textDecoration: "none",
                  color: "white",
                  marginRight: "0px",
                }}
              > */}
              <Button
                size="small"
                sx={{
                  ...buttonStyles?.btncancel,
                  textTransform: 'capitalize',
                  width: '73px',
                }}
                onClick={(e) => {
                  handleOpenConfirmationPopup('cancel');
                }}
              >
                Cancel
              </Button>
              {/* </Link> */}

              <LoadingButton
                // onClick={(e) => {
                //   handleButtonClickLog(e);
                // }}
                onClick={(e) => {
                  handleOpenConfirmationPopup('submit2');
                }}
                loading={loading}
                loadingPosition="start"
                variant="contained"
                size="small"
                sx={{
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                <span>SUBMIT</span>
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>
      </>
    );
  };

  const renderStepThree = () => {
    return (
      <>
        <Headtitle title={'ENQUIRY EDIT'} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-end' }} alignItems="center">
            <Button
              className="prev"
              variant="contained"
              size="small"
              sx={{
                display: { xs: 'none', md: 'flex' }, // Hide on small screens, show on large screens
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                position: { xs: 'static', md: 'fixed' }, // Static for small screens, fixed for larger screens
                left: { md: '10px' }, // Align left for large screens
                top: { md: '50%' }, // Center vertically for large screens
                transform: { md: 'translateY(-50%)' }, // Center transform for large screens
                textTransform: 'capitalize',
                mt: { xs: 2, md: 0 }, // Margin top for small screens to add space
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
                ...buttonStyles?.buttonsubmit,
              }}
              onClick={() => {
                nextStepAddress('prev');
              }}
            >
              Previous
            </Button>
          </Grid>
          <Grid item md={10} xs={12} sm={12}>
            <Box sx={userStyle.selectcontainer}>
              <Typography sx={userStyle.SubHeaderText}>
                {' '}
                Permanent Address <b style={{ color: 'red' }}>*</b>
              </Typography>
              <br />
              <br />

              <>
                <Grid container spacing={2}>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Address Type</Typography>
                      <Selects
                        options={permanent_address_type}
                        styles={colourStyles}
                        value={{
                          label: employee?.paddresstype === '' ? 'Please Select Address Type' : employee?.paddresstype,
                          value: employee?.paddresstype === '' ? 'Please Select Address Type' : employee?.paddresstype,
                        }}
                        onChange={(e) => {
                          setEmployee({ ...employee, paddresstype: e.value });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Personal Prefix</Typography>
                      <Selects
                        options={personal_prefix}
                        styles={colourStyles}
                        value={{
                          label: employee?.ppersonalprefix === '' ? 'Please Select Personal Prefix' : employee?.ppersonalprefix,
                          value: employee?.ppersonalprefix === '' ? 'Please Select Personal Prefix' : employee?.ppersonalprefix,
                        }}
                        onChange={(e) => {
                          let presourcename = employee?.presourcename || '';

                          // If selected prefix is "S/O - Son Of" or "D/O - Daughter Of"
                          if (['S/O - Son Of', 'D/O - Daughter Of'].includes(e.value)) {
                            if (employee?.fathername && employee?.fathername.trim() !== '') {
                              presourcename = employee.fathername;
                            } else if (employee?.mothername && employee?.mothername.trim() !== '') {
                              presourcename = employee.mothername;
                            } else {
                              presourcename = '';
                            }
                          } else {
                            presourcename = '';
                          }

                          setEmployee({
                            ...employee,
                            ppersonalprefix: e.value,
                            presourcename,
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Reference Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Reference Name"
                        value={employee?.presourcename}
                        onChange={(e) => {
                          setEmployee({ ...employee, presourcename: e.target.value });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl size="small" fullWidth>
                      <Typography>Country</Typography>
                      <Selects
                        options={Country.getAllCountries()}
                        getOptionLabel={(options) => {
                          return options['name'];
                        }}
                        getOptionValue={(options) => {
                          return options['name'];
                        }}
                        styles={colourStyles}
                        value={selectedCountryp}
                        onChange={(item) => {
                          setSelectedCountryp(item);
                          setSelectedStatep('');
                          setSelectedCityp('');
                          setEmployee((prevSupplier) => ({
                            ...prevSupplier,
                            pcountry: item?.name || '',
                            pstate: '',
                            pcity: '',
                            pdistrict: '',
                            pvillageorcity: '',
                            pgenerateviapincode: false,
                          }));
                        }}
                      />
                    </FormControl>
                    {selectedCountryp?.name === 'India' && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Boolean(employee?.pgenerateviapincode)}
                            onChange={(e) => {
                              setEmployee((prevSupplier) => ({
                                ...prevSupplier,
                                pgenerateviapincode: e.target.checked,
                                pvillageorcity: '',
                                pdistrict: '',
                                pstate: '',
                                pcity: '',
                              }));
                              setSelectedStatep('');
                              setSelectedCityp('');
                            }}
                          />
                        }
                        label="Generate Via Pincode"
                      />
                    )}
                  </Grid>

                  {selectedCountryp?.name === 'India' && employee?.pgenerateviapincode && (
                    <>
                      <Grid item md={3} sm={4} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Pincode</Typography>

                          <Box display="flex" alignItems="center" gap={1}>
                            <OutlinedInput
                              id="component-outlined"
                              type="number"
                              value={employee.ppincode}
                              onChange={(e) => {
                                handlechangeppincode(e);
                              }}
                              sx={userStyle.input}
                            />
                            <PincodeButton pincode={employee?.ppincode || ''} onSuccess={handleLocationSuccessp} />
                          </Box>
                        </FormControl>
                      </Grid>
                    </>
                  )}
                  {!employee?.pgenerateviapincode && (
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Pincode</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="number"
                          sx={userStyle.input}
                          placeholder="Pincode"
                          value={employee.ppincode}
                          onChange={(e) => {
                            handlechangeppincode(e);
                          }}
                        />
                      </FormControl>
                    </Grid>
                  )}
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>State</Typography>
                      <Selects
                        options={State?.getStatesOfCountry(selectedCountryp?.isoCode)}
                        getOptionLabel={(options) => {
                          return options['name'];
                        }}
                        getOptionValue={(options) => {
                          return options['name'];
                        }}
                        value={selectedStatep}
                        styles={colourStyles}
                        onChange={(item) => {
                          setSelectedStatep(item);
                          setSelectedCityp('');
                          setEmployee((prevSupplier) => ({
                            ...prevSupplier,
                            pstate: item?.name || '',
                          }));
                        }}
                        isDisabled={selectedCountryp?.name === 'India' && employee?.pgenerateviapincode}
                      />
                    </FormControl>
                  </Grid>
                  {selectedCountryp?.name === 'India' && employee?.pgenerateviapincode ? (
                    <>
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>District</Typography>
                          <OutlinedInput id="component-outlined" type="text" value={employee?.pdistrict || ''} readOnly sx={userStyle.input} />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Village/City</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flexGrow: 1 }}>
                              {switchValues?.pvillageorcity ? (
                                <OutlinedInput
                                  id="component-outlined"
                                  type="text"
                                  value={employee?.pvillageorcity}
                                  placeholder="Village/City"
                                  onChange={(e) =>
                                    setEmployee((prevSupplier) => ({
                                      ...prevSupplier,
                                      pvillageorcity: e.target.value,
                                    }))
                                  }
                                />
                              ) : (
                                <Selects
                                  options={fromPinCodep?.length > 0 ? fromPinCodep : []}
                                  getOptionLabel={(options) => {
                                    return options['name'];
                                  }}
                                  getOptionValue={(options) => {
                                    return options['name'];
                                  }}
                                  value={employee?.pvillageorcity !== '' ? { name: employee?.pvillageorcity } : ''}
                                  // styles={colourStyles}
                                  onChange={(item) => {
                                    setEmployee((prevSupplier) => ({
                                      ...prevSupplier,
                                      pvillageorcity: item?.name || '',
                                    }));
                                  }}
                                />
                              )}
                            </Box>

                            <FormGroup>
                              <Button
                                variant={switchValues?.pvillageorcity ? 'contained' : 'outlined'}
                                onClick={() => {
                                  setSwicthValues((prev) => ({
                                    ...prev,
                                    pvillageorcity: !switchValues?.pvillageorcity,
                                  }));
                                  setEmployee((prevSupplier) => ({
                                    ...prevSupplier,
                                    pvillageorcity: '',
                                  }));
                                }}
                                size="small"
                              >
                                {switchValues?.pvillageorcity ? 'Exist' : 'New'}
                              </Button>
                            </FormGroup>
                          </Box>
                        </FormControl>
                      </Grid>
                    </>
                  ) : (
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>City</Typography>
                        <Selects
                          options={City.getCitiesOfState(selectedStatep?.countryCode, selectedStatep?.isoCode)}
                          getOptionLabel={(options) => {
                            return options['name'];
                          }}
                          getOptionValue={(options) => {
                            return options['name'];
                          }}
                          value={selectedCityp}
                          styles={colourStyles}
                          onChange={(item) => {
                            setSelectedCityp(item);
                            setEmployee((prevSupplier) => ({
                              ...prevSupplier,
                              pcity: item?.name || '',
                            }));
                          }}
                        />
                      </FormControl>
                    </Grid>
                  )}

                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>GPS Coordination</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="GPS Coordination"
                        value={employee?.pgpscoordination}
                        onChange={(e) => {
                          setEmployee({
                            ...employee,
                            pgpscoordination: e.target.value,
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Landmark & Positional Prefix</Typography>
                      <Selects
                        options={landmark_and_positional_prefix}
                        styles={colourStyles}
                        value={{
                          label: employee?.plandmarkandpositionalprefix === '' ? 'Please Select Landmark and Positional  Prefix' : employee?.plandmarkandpositionalprefix,
                          value: employee?.plandmarkandpositionalprefix === '' ? 'Please Select Landmark and Positional  Prefix' : employee?.plandmarkandpositionalprefix,
                        }}
                        onChange={(e) => {
                          setEmployee({ ...employee, plandmarkandpositionalprefix: e.value });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Landmark Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Landmark  Name"
                        value={employee.plandmark}
                        onChange={(e) => {
                          setEmployee({
                            ...employee,
                            plandmark: e.target.value,
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>House/Flat No</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="House/Flat No"
                        value={employee.pdoorno}
                        onChange={(e) => {
                          setEmployee({ ...employee, pdoorno: e.target.value });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Street/Road Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Street/Road Name"
                        value={employee.pstreet}
                        onChange={(e) => {
                          setEmployee({ ...employee, pstreet: e.target.value });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Locality/Area Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Locality/Area Name"
                        value={employee.parea}
                        onChange={(e) => {
                          setEmployee({ ...employee, parea: e.target.value });
                        }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid item md={12} sm={12} xs={12}>
                  <FullAddressCard
                    employee={{
                      ...employee,
                      pcity: selectedCityp?.name,
                      pstate: selectedStatep?.name,
                      pcountry: selectedCountryp?.name,
                      pvillageorcity: employee?.pvillageorcity || '',
                      pdistrict: employee?.pdistrict || '',
                    }}
                  />
                </Grid>
              </>
              <br />
              <br />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography sx={userStyle.SubHeaderText}>
                    {' '}
                    Current Address<b style={{ color: 'red' }}>*</b>{' '}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={employee.samesprmnt}
                        onChange={(e) =>
                          setEmployee({
                            ...employee,
                            samesprmnt: !employee.samesprmnt,
                          })
                        }
                      />
                    }
                    label="Same as permanent Address"
                  />
                </Grid>
              </Grid>
              <br />
              <br />
              {!employee.samesprmnt ? (
                <>
                  <Grid container spacing={2}>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Address Type</Typography>
                        <Selects
                          options={address_type}
                          styles={colourStyles}
                          value={{
                            label: employee?.caddresstype === '' ? 'Please Select Address Type' : employee?.caddresstype,
                            value: employee?.caddresstype === '' ? 'Please Select Address Type' : employee?.caddresstype,
                          }}
                          onChange={(e) => {
                            setEmployee({ ...employee, caddresstype: e.value });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Personal Prefix</Typography>
                        <Selects
                          options={personal_prefix}
                          styles={colourStyles}
                          value={{
                            label: employee?.cpersonalprefix === '' ? 'Please Select Personal Prefix' : employee?.cpersonalprefix,
                            value: employee?.cpersonalprefix === '' ? 'Please Select Personal Prefix' : employee?.cpersonalprefix,
                          }}
                          onChange={(e) => {
                            let cresourcename = employee?.cresourcename || '';

                            // If selected prefix is "S/O - Son Of" or "D/O - Daughter Of"
                            if (['S/O - Son Of', 'D/O - Daughter Of'].includes(e.value)) {
                              if (employee?.fathername && employee?.fathername.trim() !== '') {
                                cresourcename = employee.fathername;
                              } else if (employee?.mothername && employee?.mothername.trim() !== '') {
                                cresourcename = employee.mothername;
                              } else {
                                cresourcename = '';
                              }
                            } else {
                              cresourcename = '';
                            }

                            setEmployee({
                              ...employee,
                              cpersonalprefix: e.value,
                              cresourcename,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Reference Name</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="Reference Name"
                          value={employee?.cresourcename}
                          onChange={(e) => {
                            setEmployee({ ...employee, cresourcename: e.target.value });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Country</Typography>
                        <Selects
                          options={Country.getAllCountries()}
                          getOptionLabel={(options) => {
                            return options['name'];
                          }}
                          getOptionValue={(options) => {
                            return options['name'];
                          }}
                          value={selectedCountryc}
                          styles={colourStyles}
                          onChange={(item) => {
                            setSelectedCountryc(item);
                            setSelectedStatec('');
                            setSelectedCityc('');
                            setEmployee((prevSupplier) => ({
                              ...prevSupplier,
                              ccountry: item?.name || '',
                              cstate: '',
                              ccity: '',
                              cdistrict: '',
                              cvillageorcity: '',
                              cgenerateviapincode: false,
                            }));
                          }}
                        />
                      </FormControl>
                      {selectedCountryc?.name === 'India' && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={employee?.cgenerateviapincode}
                              onChange={(e) => {
                                setEmployee((prevSupplier) => ({
                                  ...prevSupplier,
                                  cgenerateviapincode: e.target.checked,
                                  cvillageorcity: '',
                                  cdistrict: '',
                                  cstate: '',
                                  ccity: '',
                                }));
                                setSelectedStatec('');
                                setSelectedCityc('');
                              }}
                            />
                          }
                          label="Generate Via Pincode"
                        />
                      )}
                    </Grid>
                    {selectedCountryc?.name === 'India' && employee?.cgenerateviapincode && (
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl size="small" fullWidth>
                          <Typography>Pincode</Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <OutlinedInput
                              id="component-outlined"
                              type="number"
                              value={employee.cpincode}
                              onChange={(e) => {
                                handlechangecpincode(e);
                              }}
                              sx={userStyle.input}
                            />
                            <PincodeButton pincode={employee?.cpincode || ''} onSuccess={handleLocationSuccessc} />
                          </Box>
                        </FormControl>
                      </Grid>
                    )}
                    {!employee?.cgenerateviapincode && (
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl size="small" fullWidth>
                          <Typography>Pincode</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="number"
                            sx={userStyle.input}
                            placeholder="Pincode"
                            value={employee.cpincode}
                            onChange={(e) => {
                              handlechangecpincode(e);
                            }}
                          />
                        </FormControl>
                      </Grid>
                    )}
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>State</Typography>
                        <Selects
                          options={State?.getStatesOfCountry(selectedCountryc?.isoCode)}
                          getOptionLabel={(options) => {
                            return options['name'];
                          }}
                          getOptionValue={(options) => {
                            return options['name'];
                          }}
                          value={selectedStatec}
                          styles={colourStyles}
                          onChange={(item) => {
                            setSelectedStatec(item);
                            setSelectedCityc('');
                            setEmployee((prevSupplier) => ({
                              ...prevSupplier,
                              cstate: item?.name || '',
                            }));
                          }}
                          isDisabled={selectedCountryc?.name === 'India' && employee?.cgenerateviapincode}
                        />
                      </FormControl>
                    </Grid>
                    {selectedCountryc?.name === 'India' && employee?.cgenerateviapincode ? (
                      <>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>District</Typography>
                            <OutlinedInput id="component-outlined" type="text" value={employee?.cdistrict || ''} readOnly sx={userStyle.input} />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Village/City</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ flexGrow: 1 }}>
                                {switchValues?.cvillageorcity ? (
                                  <OutlinedInput
                                    id="component-outlined"
                                    type="text"
                                    value={employee?.cvillageorcity}
                                    placeholder="Village/City"
                                    onChange={(e) =>
                                      setEmployee((prevSupplier) => ({
                                        ...prevSupplier,
                                        cvillageorcity: e.target.value,
                                      }))
                                    }
                                  />
                                ) : (
                                  <Selects
                                    options={fromPinCodec?.length > 0 ? fromPinCodec : []}
                                    getOptionLabel={(options) => {
                                      return options['name'];
                                    }}
                                    getOptionValue={(options) => {
                                      return options['name'];
                                    }}
                                    value={employee?.cvillageorcity !== '' ? { name: employee?.cvillageorcity } : ''}
                                    // styles={colourStyles}
                                    onChange={(item) => {
                                      setEmployee((prevSupplier) => ({
                                        ...prevSupplier,
                                        cvillageorcity: item?.name || '',
                                      }));
                                    }}
                                  />
                                )}
                              </Box>

                              <FormGroup>
                                <Button
                                  variant={switchValues?.cvillageorcity ? 'contained' : 'outlined'}
                                  onClick={() => {
                                    setSwicthValues((prev) => ({
                                      ...prev,
                                      cvillageorcity: !switchValues?.cvillageorcity,
                                    }));
                                    setEmployee((prevSupplier) => ({
                                      ...prevSupplier,
                                      cvillageorcity: '',
                                    }));
                                  }}
                                  size="small"
                                >
                                  {switchValues?.cvillageorcity ? 'Exist' : 'New'}
                                </Button>
                              </FormGroup>
                            </Box>
                          </FormControl>
                        </Grid>
                      </>
                    ) : (
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>City</Typography>
                          <Selects
                            options={City.getCitiesOfState(selectedStatec?.countryCode, selectedStatec?.isoCode)}
                            getOptionLabel={(options) => {
                              return options['name'];
                            }}
                            getOptionValue={(options) => {
                              return options['name'];
                            }}
                            value={selectedCityc}
                            styles={colourStyles}
                            onChange={(item) => {
                              setSelectedCityc(item);
                              setEmployee((prevSupplier) => ({
                                ...prevSupplier,
                                ccity: item?.name || '',
                              }));
                            }}
                          />
                        </FormControl>
                      </Grid>
                    )}
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>GPS Coordination</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="Landmark  Name"
                          value={employee.cgpscoordination}
                          onChange={(e) => {
                            setEmployee({
                              ...employee,
                              cgpscoordination: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Landmark & Positional Prefix</Typography>
                        <Selects
                          options={landmark_and_positional_prefix}
                          styles={colourStyles}
                          value={{
                            label: employee?.clandmarkandpositionalprefix === '' ? 'Please Select Landmark and Positional  Prefix' : employee?.clandmarkandpositionalprefix,
                            value: employee?.clandmarkandpositionalprefix === '' ? 'Please Select Landmark and Positional  Prefix' : employee?.clandmarkandpositionalprefix,
                          }}
                          onChange={(e) => {
                            setEmployee({ ...employee, clandmarkandpositionalprefix: e.value });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Landmark Name</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="Landmark  Name"
                          value={employee.clandmark}
                          onChange={(e) => {
                            setEmployee({
                              ...employee,
                              clandmark: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>House/Flat No</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="House/Flat No"
                          value={employee.cdoorno}
                          onChange={(e) => {
                            setEmployee({
                              ...employee,
                              cdoorno: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Street/Road Name</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="Street/Road Name"
                          value={employee.cstreet}
                          onChange={(e) => {
                            setEmployee({
                              ...employee,
                              cstreet: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Locality/Area Name</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="Locality/Area Name"
                          value={employee.carea}
                          onChange={(e) => {
                            setEmployee({ ...employee, carea: e.target.value });
                          }}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                </>
              ) : (
                // else condition starts here
                <>
                  <Grid container spacing={2}>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Address Type</Typography>
                        <OutlinedInput id="component-outlined" type="text" placeholder="Address Type" value={employee?.paddresstype} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Personal Prefix</Typography>
                        <OutlinedInput id="component-outlined" type="text" placeholder="Personal Prefix" value={employee?.ppersonalprefix} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Reference Name</Typography>
                        <OutlinedInput id="component-outlined" type="text" placeholder="Reference Name" value={employee?.presourcename} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Country</Typography>
                        <Selects
                          options={Country.getAllCountries()}
                          getOptionLabel={(options) => {
                            return options['name'];
                          }}
                          getOptionValue={(options) => {
                            return options['name'];
                          }}
                          value={selectedCountryp}
                          styles={colourStyles}
                          onChange={(item) => {
                            setSelectedCountryp(item);
                          }}
                          isDisabled={true}
                        />
                      </FormControl>
                      {selectedCountryp?.name === 'India' && <FormControlLabel control={<Checkbox checked={Boolean(employee?.pgenerateviapincode)} readOnly isDisabled={true} />} label="Generate Via Pincode" />}
                    </Grid>

                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>Pincode</Typography>
                        <OutlinedInput id="component-outlined" type="text" placeholder="Pincode" value={employee.ppincode} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>State</Typography>
                        <Selects
                          options={State?.getStatesOfCountry(selectedCountryp?.isoCode)}
                          getOptionLabel={(options) => {
                            return options['name'];
                          }}
                          getOptionValue={(options) => {
                            return options['name'];
                          }}
                          value={selectedStatep}
                          styles={colourStyles}
                          // onChange={(item) => {
                          //   setSelectedStatep(item);
                          // }}
                          isDisabled={true}
                        />
                      </FormControl>
                    </Grid>
                    {selectedCountryp?.name === 'India' && employee?.pgenerateviapincode ? (
                      <>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl size="small" fullWidth>
                            <Typography>District</Typography>
                            <OutlinedInput id="component-outlined" type="text" placeholder="District" value={employee.pdistrict || ''} readOnly />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl size="small" fullWidth>
                            <Typography>Village/City</Typography>
                            <OutlinedInput id="component-outlined" type="text" placeholder="Village/City" value={employee.pvillageorcity || ''} readOnly />
                          </FormControl>
                        </Grid>
                      </>
                    ) : (
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>City</Typography>
                          <Selects
                            options={City.getCitiesOfState(selectedStatep?.countryCode, selectedStatep?.isoCode)}
                            getOptionLabel={(options) => {
                              return options['name'];
                            }}
                            getOptionValue={(options) => {
                              return options['name'];
                            }}
                            value={selectedCityp}
                            styles={colourStyles}
                            // onChange={(item) => {
                            //   setSelectedCityp(item);
                            // }}
                            isDisabled={true}
                          />
                        </FormControl>
                      </Grid>
                    )}

                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>GPS Coordination</Typography>
                        <OutlinedInput id="component-outlined" type="text" placeholder="GPS Coordination" value={employee?.pgpscoordination} readOnly />
                      </FormControl>
                    </Grid>

                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography> Landmark & Positional Prefix </Typography>
                        <OutlinedInput id="component-outlined" type="text" placeholder="Landmark & Positional Prefix" value={employee?.plandmarkandpositionalprefix} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Landmark Name</Typography>
                        <OutlinedInput id="component-outlined" type="text" placeholder="Landmark  Name" value={employee.plandmark} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>House/Flat No</Typography>
                        <OutlinedInput id="component-outlined" type="text" placeholder="House/Flat No" value={employee.pdoorno} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Street/Road Name</Typography>
                        <OutlinedInput id="component-outlined" type="text" placeholder="Street/Road Name" value={employee.pstreet} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Locality/Area Name</Typography>
                        <OutlinedInput id="component-outlined" type="text" placeholder="Locality/Area Name" value={employee.parea} readOnly />
                      </FormControl>
                    </Grid>

                    {/* <Grid item md={3} sm={12} xs={12}>
                                                               <FormControl fullWidth size="small">
                                                                 <Typography>Taluk</Typography>
                                                                 <OutlinedInput id="component-outlined" type="text" placeholder="Taluk" value={employee.ptaluk} readOnly />
                                                               </FormControl>
                                                             </Grid>
                                                             <Grid item md={3} sm={12} xs={12}>
                                                               <FormControl size="small" fullWidth>
                                                                 <Typography>Post</Typography>
                                                                 <OutlinedInput id="component-outlined" type="text" placeholder="Post" value={employee.ppost} readOnly />
                                                               </FormControl>
                                                             </Grid> */}
                  </Grid>
                </>
              )}
            </Box>
          </Grid>
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-end' }} alignItems="center">
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', md: 'column' }, // Row for small screens, column for larger screens
                justifyContent: { xs: 'center', md: 'flex-end' },
                alignItems: 'center',
                gap: '10px',
                position: { xs: 'static', md: 'fixed' }, // Static for small screens, fixed for larger screens
                bottom: { xs: 0, md: 'auto' }, // Align to bottom for small screens
                right: { xs: 'auto', md: '10px' }, // Align right for large screens
                top: { xs: 'auto', md: '50%' }, // Center vertically for large screens
                transform: { xs: 'none', md: 'translateY(-50%)' }, // Center transform for large screens
                width: 'auto',
                padding: { xs: '0 5px', md: '0 10px' }, // Reduce padding for small screens
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
              }}
            >
              <Button
                className="prev"
                variant="contained"
                size="small"
                sx={{
                  display: { xs: 'block', md: 'none' }, // Show on small screens, hide on large screens
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
                onClick={() => {
                  nextStepAddress('prev');
                }}
              >
                Previous
              </Button>
              <Button
                className="next"
                variant="contained"
                size="small"
                sx={{
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
                onClick={() => {
                  nextStepAddress('next');
                }}
              >
                Next
              </Button>

              {/* <Link
                to="/enquirypurposelist"
                style={{
                  textDecoration: "none",
                  color: "white",
                  marginRight: "0px",
                }}
              > */}
              <Button
                size="small"
                sx={{
                  ...buttonStyles?.btncancel,
                  textTransform: 'capitalize',
                  width: '73px',
                }}
                onClick={(e) => {
                  handleOpenConfirmationPopup('cancel');
                }}
              >
                Cancel
              </Button>
              {/* </Link> */}
              <LoadingButton
                // onClick={(e) => {
                //   handleButtonClick(e);
                // }}
                onClick={(e) => {
                  handleOpenConfirmationPopup('submit3');
                }}
                loading={loading}
                loadingPosition="start"
                variant="contained"
                size="small"
                sx={{
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                <span>SUBMIT</span>
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>
      </>
    );
  };

  const renderStepFour = () => {
    return (
      <>
        <Headtitle title={'ENQUIRY EDIT'} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-end' }} alignItems="center">
            <Button
              className="prev"
              variant="contained"
              size="small"
              sx={{
                display: { xs: 'none', md: 'flex' }, // Hide on small screens, show on large screens
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                position: { xs: 'static', md: 'fixed' }, // Static for small screens, fixed for larger screens
                left: { md: '10px' }, // Align left for large screens
                top: { md: '50%' }, // Center vertically for large screens
                transform: { md: 'translateY(-50%)' }, // Center transform for large screens
                textTransform: 'capitalize',
                mt: { xs: 2, md: 0 }, // Margin top for small screens to add space
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
                ...buttonStyles?.buttonsubmit,
              }}
              onClick={() => {
                nextStepFour('prev');
              }}
            >
              Previous
            </Button>
          </Grid>
          <Grid item md={10} xs={12} sm={12}>
            <Box sx={userStyle.selectcontainer}>
              <Grid item xs={8}>
                <Typography sx={userStyle.SubHeaderText}>Document</Typography>
              </Grid>
              <>
                <TodosAccordionEdit
                  fromEmployee={true}
                  uploadedCandidateFilesEdit={files}
                  setUploadedCandidateFilesEdit={setFiles}
                  loading={loading}
                  handleCandidateUploadForIndex={handleCandidateUploadForIndex}
                  colourStyles={colourStyles}
                  candidate_educational_upload_status={candidate_educational_upload_status}
                  renderFilePreviewMulterUploaded={renderFilePreviewMulterUploaded}
                />

                {/* <Grid container sx={{ justifyContent: 'center' }} spacing={1}>
                                              <Selects
                                                options={designationsFileNames}
                                                styles={colourStyles}
                                                value={{
                                                  label: fileNames,
                                                  value: fileNames,
                                                }}
                                                onChange={(e) => {
                                                  setfileNames(e.value);
                                                }}
                                              />
                                              &nbsp;
                                              <Button variant="outlined" component="label">
                                                <CloudUploadIcon sx={{ fontSize: '21px' }} /> &ensp;Upload Documents
                                                <input hidden type="file" onChange={handleFileUpload} />
                                              </Button>
                                            </Grid> */}
              </>
              {/* <Typography sx={userStyle.SubHeaderText}> Document List </Typography>
                                          <br />
                                          <br />
                                          <br /> */}
              {/* <TableContainer component={Paper}>
                                            <Table aria-label="simple table" id="branch">
                                              <TableHead sx={{ fontWeight: '600' }}>
                                                <StyledTableRow>
                                                  <StyledTableCell align="center">SI.NO</StyledTableCell>
                                                  <StyledTableCell align="center">Document</StyledTableCell>
                                                  <StyledTableCell align="center">Remarks</StyledTableCell>
                                                  <StyledTableCell align="center">View</StyledTableCell>
                                                  <StyledTableCell align="center">Action</StyledTableCell>
                                                </StyledTableRow>
                                              </TableHead>
                                              <TableBody>
                                                {files &&
                                                  files?.map((file, index) => (
                                                    <StyledTableRow key={index}>
                                                      <StyledTableCell align="center">{sno++}</StyledTableCell>
                                                      <StyledTableCell align="left">{file?.name}</StyledTableCell>
                                                      <StyledTableCell align="center">
                                                        <FormControl>
                                                          <OutlinedInput
                                                            sx={{
                                                              height: '30px !important',
                                                              background: 'white',
                                                              border: '1px solid rgb(0 0 0 / 48%)',
                                                            }}
                                                            size="small"
                                                            type="text"
                                                            value={file.remark}
                                                            onChange={(event) => handleRemarkChange(index, event.target.value)}
                                                          />
                                                        </FormControl>
                                                      </StyledTableCell>
                            
                                                      <StyledTableCell component="th" scope="row" align="center">
                                                        <a style={{ color: '#357ae8' }} href={`data:application/octet-stream;base64,${file.data}`} download={file?.name}>
                                                          Download
                                                        </a>
                                                        <a
                                                          style={{
                                                            color: '#357ae8',
                                                            cursor: 'pointer',
                                                            textDecoration: 'underline',
                                                          }}
                                                          onClick={() => renderFilePreview(file)}
                                                        >
                                                          View
                                                        </a>
                                                      </StyledTableCell>
                                                      <StyledTableCell align="center">
                                                        <Button
                                                          onClick={() => handleFileDelete(index)}
                                                          variant="contained"
                                                          size="small"
                                                          sx={{
                                                            textTransform: 'capitalize',
                                                            minWidth: '0px',
                                                          }}
                                                        >
                                                          <DeleteIcon style={{ fontSize: '20px' }} />
                                                        </Button>
                                                      </StyledTableCell>
                                                    </StyledTableRow>
                                                  ))}
                                              </TableBody>
                                            </Table>
                                          </TableContainer> */}
            </Box>
            <br />
            <Box sx={userStyle.container}>
              <Typography sx={userStyle.SubHeaderText}>
                Educational qualification <b style={{ color: 'red' }}>*</b>
              </Typography>
              <br />
              <br />
              <Grid container spacing={1}>
                <Grid item md={3} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Category</Typography>
                    <Selects
                      options={categorys}
                      value={{
                        label: employee?.categoryedu,
                        value: employee?.categoryedu,
                      }}
                      onChange={(e) => {
                        setEmployee((prev) => ({
                          ...prev,
                          categoryedu: e.value,
                          subcategoryedu: 'Please Select Sub Category',
                          specialization: 'Please Select Specialization',
                        }));
                        fetchCategoryBased(e);
                        setSubcategorys([]);
                        setEducationsOpt([]);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Sub Category</Typography>
                    <Selects
                      options={subcategorys}
                      value={{
                        label: employee?.subcategoryedu,
                        value: employee?.subcategoryedu,
                      }}
                      onChange={(e) => {
                        setEmployee((prev) => ({
                          ...prev,
                          subcategoryedu: e.value,
                          specialization: 'Please Select Specialization',
                        }));
                        fetchEducation(e);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <Typography> Specialization</Typography>
                  <FormControl fullWidth size="small">
                    <Selects
                      options={educationsOpt}
                      value={{
                        label: employee?.specialization,
                        value: employee?.specialization,
                      }}
                      onChange={(e) => {
                        setEmployee((prev) => ({
                          ...prev,
                          specialization: e.value,
                        }));
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography> Institution </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        {switchValues?.educationInstitution ? (
                          <OutlinedInput id="component-outlined" type="text" value={institution} placeholder="Institution" onChange={(e) => setInstitution(e.target.value)} />
                        ) : (
                          <Selects
                            options={
                              masterFieldValues?.eduInstitutions?.length > 0
                                ? masterFieldValues?.eduInstitutions?.map((data) => ({
                                    label: data,
                                    value: data,
                                  }))
                                : []
                            }
                            placeholder="Please Select"
                            value={{ label: institution === '' ? 'Please Select Institution' : institution, value: institution === '' ? 'Please Select Institution' : institution }}
                            onChange={(e) => {
                              setInstitution(e.value);
                            }}
                          />
                        )}
                      </Box>

                      <FormGroup>
                        <Button
                          variant={switchValues?.educationInstitution ? 'contained' : 'outlined'}
                          onClick={() => {
                            setSwicthValues((prev) => ({
                              ...prev,
                              educationInstitution: !switchValues?.educationInstitution,
                            }));
                            setInstitution('');
                          }}
                          size="small"
                        >
                          {switchValues?.educationInstitution ? 'Exist' : 'New'}
                        </Button>
                      </FormGroup>
                    </Box>
                  </FormControl>
                </Grid>
                <Grid item md={3} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography> Passed Year </Typography>
                    <OutlinedInput id="component-outlined" type="number" placeholder="Passed Year" sx={userStyle.input} value={passedyear} onChange={(e) => handlechangepassedyear(e)} />
                  </FormControl>
                </Grid>
                <Grid item md={2} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography> CGPA</Typography>
                    <OutlinedInput id="component-outlined" type="number" placeholder="CGPA" sx={userStyle.input} value={cgpa} onChange={(e) => handlechangecgpa(e)} />
                  </FormControl>
                </Grid>
                <Grid item md={1} sm={12} xs={12}>
                  <FormControl size="small">
                    <Button variant="contained" color="success" type="button" onClick={handleSubmittodo} sx={userStyle.Todoadd}>
                      <FaPlus />
                    </Button>
                    &nbsp;
                  </FormControl>
                </Grid>
                <Grid item md={12} sm={12} xs={12}>
                  {educationDocuments.map((doc, index) => (
                    <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 1 }}>
                      {/* Document Name */}
                      <Grid item md={2} sm={6} xs={12}>
                        <Typography>{doc.type}</Typography>
                      </Grid>

                      {/* Status */}
                      <Grid item md={2} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Selects options={candidate_educational_upload_status} placeholder="Please Select" value={{ label: doc.status || 'Please Select Status', value: doc.status || 'Please Select Status' }} onChange={(e) => handleEduStatusChange(index, e.value)} />
                        </FormControl>
                      </Grid>

                      {/* Deadline Date */}
                      {doc.status === 'Pending' && (
                        <Grid item md={2} sm={6} xs={12}>
                          <OutlinedInput type="date" size="small" fullWidth value={doc.deadlinedate} onChange={(e) => handleEduDeadlineChange(index, e.target.value)} />
                        </Grid>
                      )}

                      {/* Reason */}
                      {doc.status === 'No Document' && (
                        <Grid item md={2} sm={6} xs={12}>
                          <OutlinedInput type="text" size="small" fullWidth placeholder="Enter Reason" value={doc.reason} onChange={(e) => handleEduReasonChange(index, e.target.value)} />
                        </Grid>
                      )}

                      {/* File Upload & Actions */}
                      {doc.status === 'Uploaded' && (
                        <Grid item md={4} sm={12} xs={12}>
                          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Button variant="outlined" size="small" component="label" sx={buttonStyles.buttonsubmit}>
                              Upload
                              <input type="file" accept=".xlsx, .xls, .csv, .pdf, .doc, .txt" hidden onChange={(e) => handleEducationFilesUploadIndex(e, index)} />
                            </Button>

                            <Button variant="contained" color="secondary" size="small" onClick={() => handleOpenCamera((file) => handleEducationFilesUploadIndex(file, index))} startIcon={<PhotoCameraIcon />}>
                              Scan
                            </Button>

                            {doc?.file && (
                              <>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    maxWidth: 150,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {doc.name}
                                </Typography>
                                {doc.file && doc.status === 'Uploaded' && (
                                  <IconButton onClick={() => window.open(URL.createObjectURL(doc.file), '_blank')} size="small" sx={{ ml: 1 }}>
                                    <VisibilityIcon sx={{ color: '#0B7CED' }} />
                                  </IconButton>
                                )}
                                {doc.filename && doc.status === 'Uploaded' && (
                                  <IconButton onClick={() => renderFilePreviewMulterUploaded(doc)} size="small" sx={{ ml: 1 }}>
                                    <VisibilityIcon sx={{ color: '#0B7CED' }} />
                                  </IconButton>
                                )}
                                <IconButton onClick={() => handleEduStatusChange(index, '')} size="small">
                                  <DeleteIcon color="error" />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  ))}
                </Grid>

                <Grid item md={6} sm={12} xs={12}>
                  <br />
                  <br />
                  {errorstodo.qualification && <div>{errorstodo.qualification}</div>}
                </Grid>
              </Grid>
              <br /> <br />
              <Typography sx={userStyle.SubHeaderText}> Educational Details </Typography>
              <br />
              <br />
              <br />
              {/* ****** Table start ****** */}
              <TableContainer component={Paper}>
                <Table aria-label="simple table" id="branch">
                  <TableHead sx={{ fontWeight: '600' }}>
                    <StyledTableRow>
                      <StyledTableCell align="center">SI.NO</StyledTableCell>
                      <StyledTableCell align="center">Category</StyledTableCell>
                      <StyledTableCell align="center">Sub Category</StyledTableCell>
                      <StyledTableCell align="center">Specialization</StyledTableCell>
                      <StyledTableCell align="center">Institution</StyledTableCell>
                      <StyledTableCell align="center">Passed Year</StyledTableCell>
                      <StyledTableCell align="center">% or cgpa</StyledTableCell>
                      <StyledTableCell>Document Type</StyledTableCell>
                      <StyledTableCell>Document Status</StyledTableCell>
                      <StyledTableCell>Educational Document</StyledTableCell>
                      {/* <StyledTableCell>Link</StyledTableCell> */}
                      <StyledTableCell>Verification Status</StyledTableCell>
                      <StyledTableCell align="center">Action</StyledTableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    {eduTodo &&
                      eduTodo?.map((todo, index) => (
                        <StyledTableRow key={index}>
                          <StyledTableCell align="center">{eduno++}</StyledTableCell>
                          <StyledTableCell align="left">{todo.categoryedu}</StyledTableCell>
                          <StyledTableCell align="left">{todo.subcategoryedu}</StyledTableCell>
                          <StyledTableCell align="left">{todo.specialization}</StyledTableCell>
                          <StyledTableCell align="center">{todo.institution}</StyledTableCell>
                          <StyledTableCell align="center">{todo.passedyear}</StyledTableCell>
                          <StyledTableCell align="center">{todo.cgpa}</StyledTableCell>
                          <StyledTableCell>{todo.documenttype || ''}</StyledTableCell>
                          <StyledTableCell>{todo.status || ''}</StyledTableCell>

                          {/* Educational Document Cell */}
                          <StyledTableCell>
                            {todo.status === 'Pending' ? (
                              <Typography variant="body2" sx={{ color: '#FFA500' }}>
                                Deadline: {todo.deadlinedate || 'N/A'}
                              </Typography>
                            ) : todo.status === 'No Document' ? (
                              <Typography variant="body2" sx={{ color: 'red' }}>
                                Reason: {todo.reason || 'No Reason Provided'}
                              </Typography>
                            ) : (
                              <>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    maxWidth: 160,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  {todo.name || ''}
                                </Typography>
                                {todo.file && todo.status === 'Uploaded' && (
                                  <IconButton onClick={() => window.open(URL.createObjectURL(todo.file), '_blank')} size="small" sx={{ ml: 1 }}>
                                    <VisibilityIcon sx={{ color: '#0B7CED' }} />
                                  </IconButton>
                                )}
                                {todo.filename && todo.status === 'Uploaded' && (
                                  <IconButton onClick={() => renderFilePreviewMulterUploaded(todo)} size="small" sx={{ ml: 1 }}>
                                    <VisibilityIcon sx={{ color: '#0B7CED' }} />
                                  </IconButton>
                                )}
                              </>
                            )}
                          </StyledTableCell>
                          <StyledTableCell>
                            {todo?.verificationdetails?.length === 0 || !todo?.verificationdetails
                              ? 'Not Verified'
                              : todo?.verificationdetails?.length > 0 && todo?.verificationdetails[todo?.verificationdetails?.length - 1]?.verified
                              ? 'Verified'
                              : todo?.verificationdetails?.length > 0 && !todo?.verificationdetails[todo?.verificationdetails?.length - 1]?.verified
                              ? `Rejected - ${todo?.verificationdetails[todo?.verificationdetails?.length - 1]?.reason || ''}`
                              : ''}{' '}
                            {todo.filename && (
                              <IconButton onClick={() => renderFilePreviewMulterUploaded(todo)} size="small" color="primary">
                                <VisibilityOutlinedIcon />
                              </IconButton>
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {
                              <Button
                                variant="contained"
                                color="error"
                                type="button"
                                //  onClick={() => handleDelete(index)}
                                onClick={() => {
                                  setDeleteFunction(() => () => educationTodoremove(index, todo));
                                  setDeleteMessage(`All documents with Category "${todo.categoryedu}" and Sub Category "${todo.subcategoryedu}" will be deleted. Are you sure?`);
                                  handleClickOpenDelete();
                                }}
                                sx={userStyle.Todoadd}
                              >
                                <AiOutlineClose />
                              </Button>
                            }
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <br />
            <br />
          </Grid>
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-end' }} alignItems="center">
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', md: 'column' }, // Row for small screens, column for larger screens
                justifyContent: { xs: 'center', md: 'flex-end' },
                alignItems: 'center',
                gap: '10px',
                position: { xs: 'static', md: 'fixed' }, // Static for small screens, fixed for larger screens
                bottom: { xs: 0, md: 'auto' }, // Align to bottom for small screens
                right: { xs: 'auto', md: '10px' }, // Align right for large screens
                top: { xs: 'auto', md: '50%' }, // Center vertically for large screens
                transform: { xs: 'none', md: 'translateY(-50%)' }, // Center transform for large screens
                width: 'auto',
                padding: { xs: '0 5px', md: '0 10px' }, // Reduce padding for small screens
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
              }}
            >
              <Button
                className="prev"
                variant="contained"
                size="small"
                sx={{
                  display: { xs: 'block', md: 'none' }, // Show on small screens, hide on large screens
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
                onClick={() => {
                  nextStepFour('prev');
                }}
              >
                Previous
              </Button>
              <Button
                className="next"
                variant="contained"
                size="small"
                sx={{
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
                onClick={() => {
                  nextStepFour('next');
                }}
              >
                Next
              </Button>
              {/* <Link
                to="/enquirypurposelist"
                style={{
                  textDecoration: "none",
                  color: "white",
                  marginRight: "0px",
                }}
              > */}
              <Button
                size="small"
                sx={{
                  ...buttonStyles?.btncancel,
                  textTransform: 'capitalize',
                  width: '73px',
                }}
                onClick={(e) => {
                  handleOpenConfirmationPopup('cancel');
                }}
              >
                Cancel
              </Button>
              {/* </Link> */}

              <LoadingButton
                // onClick={(e) => {
                //   handleButtonClick(e);
                // }}
                onClick={(e) => {
                  handleOpenConfirmationPopup('submit4');
                }}
                loading={loading}
                loadingPosition="start"
                variant="contained"
                size="small"
                sx={{
                  textTransform: 'capitalize !important',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                <span>SUBMIT</span>
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>
        {/* ALERT DIALOG */}
        <Box>
          <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
              <Typography variant="h6">{message}</Typography>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" color="error" onClick={handleCloseerr} sx={buttonStyles?.buttonsubmit}>
                ok
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </>
    );
  };

  const renderStepFive = () => {
    return (
      <>
        <Headtitle title={'ENQUIRY EDIT'} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-end' }} alignItems="center">
            <Button
              className="prev"
              variant="contained"
              size="small"
              sx={{
                display: { xs: 'none', md: 'flex' }, // Hide on small screens, show on large screens
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                position: { xs: 'static', md: 'fixed' }, // Static for small screens, fixed for larger screens
                left: { md: '10px' }, // Align left for large screens
                top: { md: '50%' }, // Center vertically for large screens
                transform: { md: 'translateY(-50%)' }, // Center transform for large screens
                textTransform: 'capitalize',
                mt: { xs: 2, md: 0 }, // Margin top for small screens to add space
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
                ...buttonStyles?.buttonsubmit,
              }}
              onClick={() => {
                nextStep('prev');
              }}
            >
              Previous
            </Button>
          </Grid>
          <Grid item md={10} xs={12} sm={12}>
            <Box sx={userStyle.selectcontainer}>
              <Typography sx={userStyle.SubHeaderText}>Additional qualification </Typography>
              <br />
              <br />
              <Grid container spacing={1}>
                <Grid item md={3} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography> Addtl. Qualification </Typography>
                    <Selects
                      options={skillSet?.map((data) => ({
                        label: data?.name,
                        value: data?.name,
                      }))}
                      // styles={colourStyles}
                      value={{
                        label: addQual === '' || addQual == undefined ? 'Please Select Additional Qualification' : addQual,
                        value: addQual === '' || addQual == undefined ? 'Please Select Additional Qualification' : addQual,
                      }}
                      onChange={(e) => {
                        setAddQual(e.value);
                      }}
                    />
                  </FormControl>
                  {errorstodo.addQual && <div>{errorstodo.addQual}</div>}
                </Grid>
                <Grid item md={3} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography> Institution </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        {switchValues?.additionalInstitution ? (
                          <OutlinedInput id="component-outlined" type="text" placeholder="Institution" value={addInst} onChange={(e) => setAddInst(e.target.value)} />
                        ) : (
                          <Selects
                            options={
                              masterFieldValues?.addInstitutions?.length > 0
                                ? masterFieldValues?.addInstitutions?.map((data) => ({
                                    label: data,
                                    value: data,
                                  }))
                                : []
                            }
                            placeholder="Please Select"
                            value={{ label: addInst === '' ? 'Please Select Institution' : addInst, value: addInst === '' ? 'Please Select Institution' : addInst }}
                            onChange={(e) => {
                              setAddInst(e.value);
                            }}
                          />
                        )}
                      </Box>

                      <FormGroup>
                        <Button
                          variant={switchValues?.additionalInstitution ? 'contained' : 'outlined'}
                          onClick={() => {
                            setSwicthValues((prev) => ({
                              ...prev,
                              additionalInstitution: !switchValues?.additionalInstitution,
                            }));
                            setAddInst('');
                          }}
                          size="small"
                        >
                          {switchValues?.additionalInstitution ? 'Exist' : 'New'}
                        </Button>
                      </FormGroup>
                    </Box>
                  </FormControl>
                </Grid>
                <Grid item md={3} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Durartion</Typography>
                    <OutlinedInput id="component-outlined" type="text" placeholder="Durartion" value={duration} onChange={(e) => setDuration(e.target.value)} />
                  </FormControl>
                </Grid>
                <Grid item md={2} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography> Remarks</Typography>
                    <OutlinedInput id="component-outlined" type="text" placeholder="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                  </FormControl>
                </Grid>
                {/* Status */}

                <Grid item md={2} sm={6} xs={12}>
                  <Typography> Files </Typography>
                  <FormControl fullWidth size="small">
                    <Selects
                      options={candidate_educational_upload_status}
                      placeholder="Please Select"
                      value={{ label: additionalQualificationDocuments?.status || 'Please Select Status', value: additionalQualificationDocuments?.status || 'Please Select Status' }}
                      onChange={(e) => {
                        setAdditionalQualificationDocuments((prev) => ({
                          ...prev,
                          status: e.value,
                        }));
                      }}
                    />
                  </FormControl>
                </Grid>

                {/* Deadline Date */}
                {additionalQualificationDocuments?.status === 'Pending' && (
                  <Grid item md={2} sm={6} xs={12}>
                    <OutlinedInput
                      type="date"
                      size="small"
                      fullWidth
                      value={additionalQualificationDocuments?.deadlinedate}
                      onChange={(e) => {
                        setAdditionalQualificationDocuments((prev) => ({
                          ...prev,
                          deadlinedate: e.target.value,
                        }));
                      }}
                    />
                  </Grid>
                )}

                {/* Reason */}
                {additionalQualificationDocuments?.status === 'No Document' && (
                  <Grid item md={2} sm={6} xs={12}>
                    <OutlinedInput
                      type="text"
                      size="small"
                      fullWidth
                      placeholder="Enter Reason"
                      value={additionalQualificationDocuments?.reason}
                      onChange={(e) => {
                        setAdditionalQualificationDocuments((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }));
                      }}
                    />
                  </Grid>
                )}

                {/* File Upload & Actions */}
                {additionalQualificationDocuments?.status === 'Uploaded' && (
                  <Grid item md={4} sm={12} xs={12}>
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <Button variant="outlined" size="small" component="label" sx={buttonStyles.buttonsubmit}>
                        Upload
                        <input type="file" accept=".xlsx, .xls, .csv, .pdf, .doc, .txt" hidden onChange={(e) => handleAdditionalFilesUploadIndex(e)} />
                      </Button>

                      <Button variant="contained" color="secondary" size="small" onClick={() => handleOpenCamera((file) => handleAdditionalFilesUploadIndex(file))} startIcon={<PhotoCameraIcon />}>
                        Scan
                      </Button>

                      {additionalQualificationDocuments?.file && (
                        <>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 150,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {additionalQualificationDocuments?.name}
                          </Typography>

                          {additionalQualificationDocuments?.file && additionalQualificationDocuments?.status === 'Uploaded' && (
                            <IconButton onClick={() => window.open(URL.createObjectURL(additionalQualificationDocuments?.file), '_blank')} size="small" sx={{ ml: 1 }}>
                              <VisibilityIcon sx={{ color: '#0B7CED' }} />
                            </IconButton>
                          )}
                          {additionalQualificationDocuments?.filename && additionalQualificationDocuments?.status === 'Uploaded' && (
                            <IconButton onClick={() => renderFilePreviewMulterUploaded(additionalQualificationDocuments)} size="small" sx={{ ml: 1 }}>
                              <VisibilityIcon sx={{ color: '#0B7CED' }} />
                            </IconButton>
                          )}
                          <IconButton
                            onClick={() => {
                              setAdditionalQualificationDocuments((prev) => ({
                                ...prev,
                                status: '',
                                file: null,
                                name: '',
                                uploadedby: '',
                                reason: '',
                                deadlinedate: '',
                              }));
                            }}
                            size="small"
                          >
                            <DeleteIcon color="error" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Grid>
                )}
                <Grid item md={1} sm={12} xs={12}>
                  <FormControl size="small">
                    <Button variant="contained" color="success" type="button" onClick={handleSubmitAddtodo} sx={userStyle.Todoadd}>
                      <FaPlus />
                    </Button>
                    &nbsp;
                  </FormControl>
                </Grid>
                <br />
              </Grid>
              <br />
              <br />
              <Typography sx={userStyle.SubHeaderText}> Additional Qualification Details </Typography>

              {/* ****** Table start ****** */}
              <TableContainer component={Paper}>
                <Table
                  aria-label="simple table"
                  id="branch"
                  // ref={tableRef}
                >
                  <TableHead sx={{ fontWeight: '600' }}>
                    <StyledTableRow>
                      <StyledTableCell align="center">SI.NO</StyledTableCell>
                      <StyledTableCell align="center">Addl. Qualification</StyledTableCell>
                      <StyledTableCell align="center">Institution</StyledTableCell>
                      <StyledTableCell align="center">Duration</StyledTableCell>
                      <StyledTableCell align="center">Remarks</StyledTableCell>
                      <StyledTableCell>Document Status</StyledTableCell>
                      <StyledTableCell>Document</StyledTableCell>
                      <StyledTableCell>Verification Status</StyledTableCell>
                      <StyledTableCell align="center">Action</StyledTableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    {addAddQuaTodo &&
                      addAddQuaTodo?.map((addtodo, index) => (
                        <StyledTableRow key={index}>
                          <StyledTableCell align="center">{skno++}</StyledTableCell>
                          <StyledTableCell align="center">{addtodo.addQual}</StyledTableCell>
                          <StyledTableCell align="center">{addtodo.addInst}</StyledTableCell>
                          <StyledTableCell align="center">{addtodo.duration}</StyledTableCell>
                          <StyledTableCell align="center">{addtodo.remarks}</StyledTableCell>
                          <StyledTableCell>{addtodo.status || ''}</StyledTableCell>

                          {/* Educational Document Cell */}
                          <StyledTableCell>
                            {addtodo.status === 'Pending' ? (
                              <Typography variant="body2" sx={{ color: '#FFA500' }}>
                                Deadline: {addtodo.deadlinedate || 'N/A'}
                              </Typography>
                            ) : addtodo.status === 'No Document' ? (
                              <Typography variant="body2" sx={{ color: 'red' }}>
                                Reason: {addtodo.reason || 'No Reason Provided'}
                              </Typography>
                            ) : (
                              <>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    maxWidth: 160,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  {addtodo.name || ''}
                                </Typography>
                                {addtodo.file && addtodo.status === 'Uploaded' && (
                                  <IconButton onClick={() => window.open(URL.createObjectURL(addtodo.file), '_blank')} size="small" sx={{ ml: 1 }}>
                                    <VisibilityIcon sx={{ color: '#0B7CED' }} />
                                  </IconButton>
                                )}
                                {addtodo.filename && addtodo.status === 'Uploaded' && (
                                  <IconButton onClick={() => renderFilePreviewMulterUploaded(addtodo)} size="small" sx={{ ml: 1 }}>
                                    <VisibilityIcon sx={{ color: '#0B7CED' }} />
                                  </IconButton>
                                )}
                              </>
                            )}
                          </StyledTableCell>
                          <StyledTableCell>
                            {addtodo?.verificationdetails?.length === 0 || !addtodo?.verificationdetails
                              ? 'Not Verified'
                              : addtodo?.verificationdetails?.length > 0 && addtodo?.verificationdetails[addtodo?.verificationdetails?.length - 1]?.verified
                              ? 'Verified'
                              : addtodo?.verificationdetails?.length > 0 && !addtodo?.verificationdetails[addtodo?.verificationdetails?.length - 1]?.verified
                              ? `Rejected - ${addtodo?.verificationdetails[addtodo?.verificationdetails?.length - 1]?.reason || ''}`
                              : ''}{' '}
                            {addtodo.filename && (
                              <IconButton onClick={() => renderFilePreviewMulterUploaded(addtodo)} size="small" color="primary">
                                <VisibilityOutlinedIcon />
                              </IconButton>
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {
                              <Button variant="contained" color="error" type="button" onClick={() => handleAddDelete(index)} sx={userStyle.Todoadd}>
                                <AiOutlineClose />
                              </Button>
                            }
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <br />
            <Box sx={userStyle.container}>
              <Typography sx={userStyle.SubHeaderText}>Work History</Typography>
              <br />
              <br />
              <Grid container spacing={2}>
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography> Employer </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        {switchValues?.employer ? (
                          <OutlinedInput id="component-outlined" type="text" placeholder="Employer Name" value={empNameTodo} onChange={(e) => setEmpNameTodo(e.target.value)} />
                        ) : (
                          <Selects
                            options={
                              masterFieldValues?.empNames?.length > 0
                                ? masterFieldValues?.empNames?.map((data) => ({
                                    label: data,
                                    value: data,
                                  }))
                                : []
                            }
                            placeholder="Please Select"
                            value={{ label: empNameTodo === '' ? 'Please Select Employer Name' : empNameTodo, value: empNameTodo === '' ? 'Please Select Employer Name' : empNameTodo }}
                            onChange={(e) => {
                              setEmpNameTodo(e.value);
                            }}
                          />
                        )}
                      </Box>

                      <FormGroup>
                        <Button
                          variant={switchValues?.employer ? 'contained' : 'outlined'}
                          onClick={() => {
                            setSwicthValues((prev) => ({
                              ...prev,
                              employer: !switchValues?.employer,
                            }));
                            setEmpNameTodo('');
                          }}
                          size="small"
                        >
                          {switchValues?.employer ? 'Exist' : 'New'}
                        </Button>
                      </FormGroup>
                    </Box>
                    {errorstodo.empNameTodo && <div>{errorstodo.empNameTodo}</div>}
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography> Designation </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        {switchValues?.workDesignation ? (
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Designation"
                            value={desigTodo}
                            onChange={(e) => {
                              setDesigTodo(e.target.value);
                            }}
                          />
                        ) : (
                          <Selects
                            options={
                              masterFieldValues?.designations?.length > 0
                                ? masterFieldValues?.designations?.map((data) => ({
                                    label: data,
                                    value: data,
                                  }))
                                : []
                            }
                            placeholder="Please Select"
                            value={{ label: desigTodo === '' ? 'Please Select Designation' : desigTodo, value: desigTodo === '' ? 'Please Select Designation' : desigTodo }}
                            onChange={(e) => {
                              setDesigTodo(e.value);
                            }}
                          />
                        )}
                      </Box>

                      <FormGroup>
                        <Button
                          variant={switchValues?.workDesignation ? 'contained' : 'outlined'}
                          onClick={() => {
                            setSwicthValues((prev) => ({
                              ...prev,
                              workDesignation: !switchValues?.workDesignation,
                            }));
                            setDesigTodo('');
                          }}
                          size="small"
                        >
                          {switchValues?.workDesignation ? 'Exist' : 'New'}
                        </Button>
                      </FormGroup>
                    </Box>
                  </FormControl>
                </Grid>
                <Grid item md={2} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography> Joined On </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="date"
                      value={joindateTodo}
                      onChange={(e) => {
                        setJoindateTodo(e.target.value);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={2} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography> Leave On</Typography>
                    <OutlinedInput id="component-outlined" type="date" value={leavedateTodo} onChange={(e) => setLeavedateTodo(e.target.value)} />
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography> Duties</Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        {switchValues?.workDuties ? (
                          <OutlinedInput id="component-outlined" type="text" placeholder="Duties" value={dutiesTodo} onChange={(e) => setDutiesTodo(e.target.value)} />
                        ) : (
                          <Selects
                            options={
                              masterFieldValues?.duties?.length > 0
                                ? masterFieldValues?.duties?.map((data) => ({
                                    label: data,
                                    value: data,
                                  }))
                                : []
                            }
                            placeholder="Please Select"
                            value={{ label: dutiesTodo === '' ? 'Please Select Duties' : dutiesTodo, value: dutiesTodo === '' ? 'Please Select Duties' : dutiesTodo }}
                            onChange={(e) => {
                              setDutiesTodo(e.value);
                            }}
                          />
                        )}
                      </Box>

                      <FormGroup>
                        <Button
                          variant={switchValues?.workDuties ? 'contained' : 'outlined'}
                          onClick={() => {
                            setSwicthValues((prev) => ({
                              ...prev,
                              workDuties: !switchValues?.workDuties,
                            }));
                            setDutiesTodo('');
                          }}
                          size="small"
                        >
                          {switchValues?.workDuties ? 'Exist' : 'New'}
                        </Button>
                      </FormGroup>
                    </Box>
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={5} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography> Reason for Leaving</Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        {switchValues?.workReason ? (
                          <OutlinedInput id="component-outlined" type="text" placeholder="Reason for Leaving" value={reasonTodo} onChange={(e) => setReasonTodo(e.target.value)} />
                        ) : (
                          <Selects
                            options={
                              masterFieldValues?.reasons?.length > 0
                                ? masterFieldValues?.reasons?.map((data) => ({
                                    label: data,
                                    value: data,
                                  }))
                                : []
                            }
                            placeholder="Please Select"
                            value={{ label: reasonTodo === '' ? 'Please Select Reasons' : reasonTodo, value: reasonTodo === '' ? 'Please Select Reasons' : reasonTodo }}
                            onChange={(e) => {
                              setReasonTodo(e.value);
                            }}
                          />
                        )}
                      </Box>

                      <FormGroup>
                        <Button
                          variant={switchValues?.workReason ? 'contained' : 'outlined'}
                          onClick={() => {
                            setSwicthValues((prev) => ({
                              ...prev,
                              workReason: !switchValues?.workReason,
                            }));
                            setReasonTodo('');
                          }}
                          size="small"
                        >
                          {switchValues?.workReason ? 'Exist' : 'New'}
                        </Button>
                      </FormGroup>
                    </Box>
                  </FormControl>
                </Grid>
                <Grid item md={1} sm={1} xs={12}>
                  <FormControl size="small">
                    <Button variant="contained" color="success" type="button" onClick={handleSubmitWorkSubmit} sx={userStyle.Todoadd}>
                      <FaPlus />
                    </Button>
                    &nbsp;
                  </FormControl>
                </Grid>
                <Grid item md={12} sm={12} xs={12}>
                  {experienceDocuments.map((doc, index) => (
                    <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2 }}>
                      {/* Document Type */}
                      <Grid item md={2} sm={6} xs={12}>
                        <Typography>{doc.type}</Typography>
                      </Grid>

                      {/* Status Dropdown */}
                      <Grid item md={2} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Selects
                            options={candidate_educational_upload_status}
                            placeholder="Please Select"
                            value={{ label: doc.status || 'Please Select Status', value: doc.status || 'Please Select Status' }}
                            onChange={(e) => {
                              const updated = [...experienceDocuments];
                              updated[index] = {
                                ...updated[index],
                                status: e.value,
                                file: null,
                                reason: '',
                                deadlinedate: '',
                                name: '',
                                uploadedby: '',
                              };
                              setExperienceDocuments(updated);
                            }}
                          />
                        </FormControl>
                      </Grid>

                      {/* Pay Slip From-To */}
                      {doc.type === 'Pay Slip' && doc.status !== 'No Document' && (
                        <Grid item md={3} sm={12} xs={12} sx={{ display: 'flex' }}>
                          <FormControl fullWidth size="small">
                            <Typography>Pay Slip Duration {doc.status !== 'No Document' && <b style={{ color: 'red' }}>*</b>}</Typography>
                            <OutlinedInput
                              type="month"
                              value={doc.payslipfrom}
                              onChange={(e) => {
                                const updated = [...experienceDocuments];
                                updated[index].payslipfrom = e.target.value;
                                updated[index].payslipto = e.target.value;
                                setExperienceDocuments(updated);
                              }}
                            />
                          </FormControl>
                          <Typography sx={{ margin: '30px 10px 0 10px' }}>To</Typography>
                          <FormControl fullWidth size="small">
                            <Typography>&nbsp;</Typography>
                            <OutlinedInput
                              type="month"
                              value={doc.payslipto}
                              inputProps={{ min: doc.payslipfrom }}
                              onChange={(e) => {
                                const updated = [...experienceDocuments];
                                updated[index].payslipto = e.target.value;
                                setExperienceDocuments(updated);
                              }}
                            />
                          </FormControl>
                        </Grid>
                      )}

                      {/* Deadline Field */}
                      {doc.status === 'Pending' && (
                        <Grid item md={2} sm={6} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Deadline Date<b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <OutlinedInput
                              type="date"
                              value={doc.deadlinedate}
                              onChange={(e) => {
                                const updated = [...experienceDocuments];
                                updated[index].deadlinedate = e.target.value;
                                setExperienceDocuments(updated);
                              }}
                            />
                          </FormControl>
                        </Grid>
                      )}

                      {/* Reason Field */}
                      {doc.status === 'No Document' && (
                        <Grid item md={2} sm={6} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Reason<b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <OutlinedInput
                              type="text"
                              value={doc.reason}
                              onChange={(e) => {
                                const updated = [...experienceDocuments];
                                updated[index].reason = e.target.value;
                                setExperienceDocuments(updated);
                              }}
                            />
                          </FormControl>
                        </Grid>
                      )}

                      {/* Upload/Scan/File Preview/Delete */}
                      {doc.status === 'Uploaded' && (
                        <Grid item md={4} sm={12} xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Button variant="outlined" size="small" component="label">
                              Upload
                              <input type="file" hidden accept=".xlsx, .xls, .csv, .pdf, .doc, .txt" onChange={(e) => handleExperienceFilesUploadIndex(e, index)} />
                            </Button>

                            <Button variant="contained" color="secondary" size="small" onClick={() => handleOpenCamera((file) => handleExperienceFilesUploadIndex(file, index))} startIcon={<PhotoCameraIcon />}>
                              Scan
                            </Button>

                            {doc?.file && (
                              <>
                                <Typography variant="body2" sx={{ maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {doc.name}
                                </Typography>
                                <IconButton onClick={() => window.open(URL.createObjectURL(doc.file), '_blank')} size="small">
                                  <VisibilityIcon sx={{ color: '#0B7CED' }} />
                                </IconButton>
                                <IconButton
                                  onClick={() => {
                                    const updated = [...experienceDocuments];
                                    updated[index] = {
                                      ...updated[index],
                                      file: null,
                                      status: '',
                                      reason: '',
                                      deadlinedate: '',
                                      name: '',
                                      uploadedby: '',
                                    };
                                    setExperienceDocuments(updated);
                                  }}
                                  size="small"
                                >
                                  <DeleteIcon color="error" />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  ))}
                </Grid>
                <br />
              </Grid>
              <br />
              <br />
              <br />
              <Typography sx={userStyle.SubHeaderText}> Work History Details </Typography>
              <br />
              {/* ****** Table start ****** */}
              <TableContainer component={Paper}>
                <Table
                  aria-label="simple table"
                  id="branch"
                  // ref={tableRef}
                >
                  <TableHead sx={{ fontWeight: '600' }}>
                    <StyledTableRow>
                      <StyledTableCell align="center">SI.NO</StyledTableCell>
                      <StyledTableCell align="center">Employer</StyledTableCell>
                      <StyledTableCell align="center">Designation</StyledTableCell>
                      <StyledTableCell align="center">Joined On</StyledTableCell>
                      <StyledTableCell align="center">Leave On</StyledTableCell>
                      <StyledTableCell align="center">Duties</StyledTableCell>
                      <StyledTableCell align="center">Reason for Leaving</StyledTableCell>
                      <StyledTableCell>Document Type</StyledTableCell>
                      <StyledTableCell>Document Status</StyledTableCell>
                      <StyledTableCell>Experience Document</StyledTableCell>
                      <StyledTableCell>Verification Status</StyledTableCell>
                      <StyledTableCell align="center">Action</StyledTableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    {workhistTodo &&
                      workhistTodo?.map((todo, index) => (
                        <StyledTableRow key={index}>
                          <StyledTableCell align="center">{sno++}</StyledTableCell>
                          <StyledTableCell align="left">{todo.empNameTodo}</StyledTableCell>
                          <StyledTableCell align="center">{todo.desigTodo}</StyledTableCell>
                          <StyledTableCell align="center">{moment(todo.joindateTodo).format('DD-MM-YYYY')}</StyledTableCell>
                          <StyledTableCell align="center">{moment(todo.leavedateTodo).format('DD-MM-YYYY')}</StyledTableCell>
                          <StyledTableCell align="center">{todo.dutiesTodo}</StyledTableCell>
                          <StyledTableCell align="center">{todo.reasonTodo}</StyledTableCell>
                          <StyledTableCell>
                            {todo?.documenttype || ''}
                            {todo?.documenttype === 'Pay Slip' && todo?.payslipfrom && todo?.payslipto && ` (${todo.payslipfrom} to ${todo.payslipto})`}
                          </StyledTableCell>
                          <StyledTableCell>{todo.status || ''}</StyledTableCell>

                          {/* Educational Document Cell */}
                          <StyledTableCell>
                            {todo.status === 'Pending' ? (
                              <Typography variant="body2" sx={{ color: '#FFA500' }}>
                                Deadline: {todo.deadlinedate || 'N/A'}
                              </Typography>
                            ) : todo.status === 'No Document' ? (
                              <Typography variant="body2" sx={{ color: 'red' }}>
                                Reason: {todo.reason || 'No Reason Provided'}
                              </Typography>
                            ) : (
                              <>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    maxWidth: 160,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  {todo.name || ''}
                                </Typography>

                                {todo.file && todo.status === 'Uploaded' && (
                                  <IconButton onClick={() => window.open(URL.createObjectURL(todo.file), '_blank')} size="small" sx={{ ml: 1 }}>
                                    <VisibilityIcon sx={{ color: '#0B7CED' }} />
                                  </IconButton>
                                )}
                                {todo.filename && todo.status === 'Uploaded' && (
                                  <IconButton onClick={() => renderFilePreviewMulterUploaded(todo)} size="small" sx={{ ml: 1 }}>
                                    <VisibilityIcon sx={{ color: '#0B7CED' }} />
                                  </IconButton>
                                )}
                              </>
                            )}
                          </StyledTableCell>
                          <StyledTableCell>
                            {todo?.verificationdetails?.length === 0 || !todo?.verificationdetails
                              ? 'Not Verified'
                              : todo?.verificationdetails?.length > 0 && todo?.verificationdetails[todo?.verificationdetails?.length - 1]?.verified
                              ? 'Verified'
                              : todo?.verificationdetails?.length > 0 && !todo?.verificationdetails[todo?.verificationdetails?.length - 1]?.verified
                              ? `Rejected - ${todo?.verificationdetails[todo?.verificationdetails?.length - 1]?.reason || ''}`
                              : ''}{' '}
                            {todo.filename && (
                              <IconButton onClick={() => renderFilePreviewMulterUploaded(todo)} size="small" color="primary">
                                <VisibilityOutlinedIcon />
                              </IconButton>
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {
                              <Button
                                variant="contained"
                                color="error"
                                type="button"
                                // onClick={() => handleWorkHisDelete(index)}
                                onClick={() => {
                                  setDeleteFunction(() => () => experienceTodoremove(index, todo));
                                  setDeleteMessage(`All documents with employer "${todo.empNameTodo}" and designation "${todo.desigTodo}" will be deleted. Are you sure?`);
                                  handleClickOpenDelete();
                                }}
                                sx={userStyle.Todoadd}
                              >
                                <AiOutlineClose />
                              </Button>
                            }
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <br />
          </Grid>
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-end' }} alignItems="center">
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', md: 'column' }, // Row for small screens, column for larger screens
                justifyContent: { xs: 'center', md: 'flex-end' },
                alignItems: 'center',
                gap: '10px',
                position: { xs: 'static', md: 'fixed' }, // Static for small screens, fixed for larger screens
                bottom: { xs: 0, md: 'auto' }, // Align to bottom for small screens
                right: { xs: 'auto', md: '10px' }, // Align right for large screens
                top: { xs: 'auto', md: '50%' }, // Center vertically for large screens
                transform: { xs: 'none', md: 'translateY(-50%)' }, // Center transform for large screens
                width: 'auto',
                padding: { xs: '0 5px', md: '0 10px' }, // Reduce padding for small screens
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
              }}
            >
              <Button
                className="prev"
                variant="contained"
                size="small"
                sx={{
                  display: { xs: 'block', md: 'none' }, // Show on small screens, hide on large screens
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
                onClick={() => {
                  nextStep('prev');
                }}
              >
                Previous
              </Button>
              <Button
                className="next"
                variant="contained"
                size="small"
                sx={{
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
                onClick={() => {
                  nextStep('next');
                }}
              >
                Next
              </Button>

              {/* <Link
                to="/enquirypurposelist"
                style={{
                  textDecoration: "none",
                  color: "white",
                  marginRight: "0px",
                }}
              > */}
              <Button
                size="small"
                sx={{
                  ...buttonStyles?.btncancel,
                  textTransform: 'capitalize',
                  width: '73px',
                }}
                onClick={(e) => {
                  handleOpenConfirmationPopup('cancel');
                }}
              >
                Cancel
              </Button>
              {/* </Link> */}
              <LoadingButton
                // onClick={(e) => {
                //   handleButtonClick(e);
                // }}
                onClick={(e) => {
                  handleOpenConfirmationPopup('submit5');
                }}
                loading={loading}
                loadingPosition="start"
                variant="contained"
                size="small"
                sx={{
                  textTransform: 'capitalize !important',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                <span>SUBMIT</span>
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>
      </>
    );
  };

  const [accessible, setAccessible] = useState({
    company: 'Please Select Company',
    branch: 'Please Select Branch',
    unit: 'Please Select Unit',
    responsibleperson: String(employee.firstname).toUpperCase() + '.' + String(employee.lastname).toUpperCase(),
  });

  // bank todo start
  const typeofaccount = [
    { label: 'Savings', value: 'Savings' },
    { label: 'Salary', value: 'Salary' },
  ];

  const accountstatus = [
    { label: 'Active', value: 'Active' },
    { label: 'In-Active', value: 'In-Active' },
  ];

  const [bankTodo, setBankTodo] = useState([]);

  const handleBankTodoChange = (index, field, value) => {
    const updatedBankTodo = [...bankTodo];
    updatedBankTodo[index] = { ...updatedBankTodo[index], [field]: value };
    setBankTodo(updatedBankTodo);
  };

  const deleteTodoEdit = (index) => {
    setBankTodo(bankTodo.filter((_, i) => i !== index));
  };

  const [bankUpload, setBankUpload] = useState([]);

  const handleBankDetailsUpload = (e) => {
    const file = e.target.files[0];
    const maxFileSize = 1 * 1024 * 1024; // 1MB in bytes

    if (file) {
      if (file.size < maxFileSize) {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
          const base64String = reader.result.split(',')[1];
          setBankUpload([
            {
              name: file.name,
              preview: reader.result,
              data: base64String,
            },
          ]);
        };

        reader.onerror = (error) => {
          console.error('Error reading file:', error);
        };
      } else {
        setPopupContentMalert('File size is greater than 1MB, please upload a file below 1MB!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      }
    }
  };

  const handleBankTodoChangeProof = (e, index) => {
    const file = e.target.files[0];
    const maxFileSize = 1 * 1024 * 1024; // 1MB in bytes

    if (file) {
      if (file.size < maxFileSize) {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
          const updatedBankTodo = [...bankTodo];
          const base64String = reader.result.split(',')[1];

          updatedBankTodo[index] = {
            ...updatedBankTodo[index],
            proof: [
              {
                name: file.name,
                preview: reader.result,
                data: base64String,
              },
            ],
          };

          setBankTodo(updatedBankTodo);
        };

        reader.onerror = (error) => {
          console.error('Error reading file:', error);
        };
      } else {
        setPopupContentMalert('File size is greater than 1MB, please upload a file below 1MB!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      }
    }
  };

  const handleDeleteProof = (index) => {
    setBankTodo((prevArray) => {
      const newArray = [...prevArray];
      newArray[index].proof = [];
      return newArray;
    });
  };

  const handleBankTodo = () => {
    let newObject = {
      bankname: employee.bankname,
      bankbranchname: employee.bankbranchname,
      accountholdername: employee.accountholdername,
      accountnumber: employee.accountnumber,
      ifsccode: employee.ifsccode,
      accounttype: employee.accounttype,
      accountstatus: employee.accountstatus,
      proof: bankUpload,
    };

    const isValidObject = (obj) => {
      for (let key in obj) {
        if (obj[key] === '' || obj[key] === undefined || obj[key] === null || obj[key] === 'Please Select Account Type') {
          return false;
        }
      }
      return true;
    };

    const exists = bankTodo.some((obj) => obj.accountnumber === newObject.accountnumber);
    const activeexists = bankTodo.some((obj) => obj.accountstatus === 'Active');
    if (!isValidObject(newObject)) {
      setPopupContentMalert('Please fill all the Fields!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (exists) {
      setPopupContentMalert('Account Number Already Exist!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (employee.accountstatus === 'Active' && activeexists) {
      setPopupContentMalert('Only one active account is allowed at a time!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      setBankTodo((prevState) => [...prevState, newObject]);
      setEmployee((prev) => ({
        ...prev,
        bankname: 'ICICI BANK - ICICI',
        bankbranchname: '',
        accountholdername: '',
        accountnumber: '',
        ifsccode: '',
        accounttype: 'Please Select Account Type',
        accountstatus: 'In-Active',
      }));
      setBankUpload([]);
    }
  };

  const [bankDetails, setBankDetails] = useState(null);
  const [ifscModalOpen, setIfscModalOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Convert small alphabets to capital letters
    const capitalizedValue = value.toUpperCase();

    // Validate input to allow only capital letters and numbers
    const regex = /^[A-Z0-9]*$/;
    if (!regex.test(capitalizedValue)) {
      // If the input contains invalid characters, do not update the state
      return;
    }

    // Validate length of IFSC code (should be 11 characters)
    if (name === 'ifscCode' && capitalizedValue?.length > 11) {
      // If the IFSC code is longer than 11 characters, truncate it
      setEmployee({
        ...employee,
        [name]: capitalizedValue.slice(0, 11),
      });
    } else {
      setEmployee({
        ...employee,
        [name]: capitalizedValue,
      });
    }
  };

  const fetchBankDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://ifsc.razorpay.com/${employee.ifscCode}`);
      if (response.status === 200) {
        setBankDetails(response.data);
        setLoading(false);
      } else {
        setPopupContentMalert('Bank Details Not Found!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleModalClose = () => {
    setIfscModalOpen(false);
    // setEmployee({
    //   ...employee,
    //   ifscCode: '', // Reset the IFSC code field
    // });
    setBankDetails(null); // Reset bank details
  };

  const handleModalOpen = () => {
    setIfscModalOpen(true);
  };

  //Accessible Company/Branch/unit

  const [accessibleTodo, setAccessibleTodo] = useState([]);
  const [accessibleTodoDisableDelete, setAccessibleTodoDisableDelete] = useState([]);
  const [DeleteAssignTodo, setDeleteAssignTodo] = useState([]);

  const handleAccessibleBranchTodoChange = (index, changes) => {
    const updatedTodo = [...accessibleTodo];
    updatedTodo[index] = { ...updatedTodo[index], ...changes };
    setAccessibleTodo(updatedTodo);
  };

  const handleAccessibleBranchTodo = () => {
    let newObject = {
      fromcompany: accessible.company,
      frombranch: accessible.branch,
      fromunit: accessible.unit,
      companycode: accessible.companycode,
      branchcode: accessible.branchcode,
      unitcode: accessible.unitcode,
      branchemail: accessible.branchemail,
      branchaddress: accessible.branchaddress,
      branchstate: accessible.branchstate,
      branchcity: accessible.branchcity,
      branchcountry: accessible.branchcountry,
      branchpincode: accessible.branchpincode,

      company: selectedCompany,
      branch: selectedBranch,
      unit: selectedUnit,
      employee: companycaps,
      employeecode: String(employee.wordcheck === true ? employeecodenew : employee.empcode),
    };

    const exists = accessibleTodo.some((obj) => obj.fromcompany === newObject.fromcompany && obj.frombranch === newObject.frombranch && obj.fromunit === newObject.fromunit);
    if (accessible?.company === 'Please Select Company') {
      setPopupContentMalert('Please Select Company!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (accessible?.branch === 'Please Select Branch') {
      setPopupContentMalert('Please Select Branch!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (accessible?.unit === 'Please Select Unit') {
      setPopupContentMalert('Please Select Unit!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (exists) {
      setPopupContentMalert('Todo Already Exist!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      setAccessibleTodo((prevState) => [...prevState, newObject]);
      setAccessible({
        company: 'Please Select Company',
        branch: 'Please Select Branch',
        unit: 'Please Select Unit',
        responsibleperson: companycaps,
        companycode: '',
        branchcode: '',
        unitcode: '',
        branchemail: '',
        branchaddress: '',
        branchstate: '',
        branchcity: '',
        branchcountry: '',
        branchpincode: '',
      });
    }
  };

  const deleteAccessibleBranchTodo = (index) => {
    setAccessibleTodo(accessibleTodo.filter((_, i) => i !== index));
  };
  const [salarySetUpForm, setSalarysetupForm] = useState({
    mode: 'Auto',
    empcode: '',
    employeename: '',
    salarycode: 'Please Select Salary Code',
  });
  const [isActive, setIsActive] = useState(false);
  const [Ctc, setCtc] = useState('');
  const [formValue, setFormValue] = useState({
    esideduction: false,
    pfdeduction: false,
    basic: '',
    hra: '',
    conveyance: '',
    gross: '',
    medicalallowance: '',
    productionallowance: '',
    otherallowance: '',
    productionallowancetwo: '',
    startDate: '',
    startmonth: '',
    startyear: '',
  });
  //change form
  const handleChangeGross = (e) => {
    const regex = /^[0-9]+$/; // Only allows positive integers
    const inputValue = e.target.value;
    if (regex.test(inputValue) || inputValue === '') {
      setFormValue({
        ...formValue,
        gross: inputValue,
        basic: '',
        hra: '',
        conveyance: '',
        medicalallowance: '',
        productionallowance: '',
        productionallowancetwo: '',
        otherallowance: '',
      });
      setSalaryTableDataManual((prev) => ({
        ...prev,
        basic: 0,
        hra: 0,
        conveyance: 0,
        medicalallowance: 0,
        productionallowance: 0,
        otherallowance: 0,
        performanceincentive: 0,
        shiftallowance: 0,
        grossmonthsalary: Number(inputValue) || 0,
        annualgrossctc: 12 * inputValue || 0,
      }));
    }
  };

  //change form
  const handleChangeBasic = (e) => {
    const regex = /^[0-9]+$/; // Only allows positive integers
    // const regex = /^\d*\.?\d*$/;
    const inputValue = e.target.value;
    if (regex.test(inputValue) || inputValue === '') {
      let gross = Number(e.target.value) + Number(formValue?.hra) + Number(formValue?.conveyance) + Number(formValue?.medicalallowance) + Number(formValue?.productionallowance) + Number(formValue?.productionallowancetwo) + Number(formValue?.otherallowance);
      setFormValue({
        ...formValue,
        basic: inputValue,
        gross,
      });
      setSalaryTableDataManual((prev) => ({
        ...prev,
        basic: Number(inputValue) || 0,
        grossmonthsalary: gross || 0,
        annualgrossctc: 12 * gross || 0,
      }));
    }
  };

  //change form
  const handleChangeHra = (e) => {
    const regex = /^[0-9]+$/; // Only allows positive integers
    // const regex = /^\d*\.?\d*$/;
    const inputValue = e.target.value;
    if (regex.test(inputValue) || inputValue === '') {
      let gross =
        Number(e.target.value) +
        Number(formValue?.basic) +
        Number(formValue?.conveyance) +
        Number(formValue?.medicalallowance) +
        Number(formValue?.productionallowance) +
        //  Number(formValue?.productionallowancetwo)
        +Number(formValue?.otherallowance);

      setFormValue({
        ...formValue,
        hra: e.target.value,
        gross,
      });
      setSalaryTableDataManual((prev) => ({
        ...prev,
        hra: Number(inputValue) || 0,
        grossmonthsalary: gross || 0,
        annualgrossctc: 12 * gross || 0,
      }));
    }
  };

  //change form
  const handleChangeConveyance = (e) => {
    const regex = /^[0-9]+$/;
    const inputValue = e.target.value;
    if (regex.test(inputValue) || inputValue === '') {
      let gross =
        Number(e.target.value) +
        Number(formValue?.basic) +
        Number(formValue?.hra) +
        Number(formValue?.medicalallowance) +
        Number(formValue?.productionallowance) +
        //  Number(formValue?.productionallowancetwo)
        +Number(formValue?.otherallowance);
      setFormValue({
        ...formValue,
        conveyance: e.target.value,
        gross,
      });
      setSalaryTableDataManual((prev) => ({
        ...prev,
        conveyance: Number(inputValue) || 0,
        grossmonthsalary: gross || 0,
        annualgrossctc: 12 * gross || 0,
      }));
    }
  };
  //change form
  const handleChangeMedAllow = (e) => {
    const regex = /^[0-9]+$/;
    const inputValue = e.target.value;
    if (regex.test(inputValue) || inputValue === '') {
      let gross =
        Number(e.target.value) +
        Number(formValue?.hra) +
        Number(formValue?.conveyance) +
        Number(formValue?.basic) +
        Number(formValue?.productionallowance) +
        //  Number(formValue?.productionallowancetwo)
        +Number(formValue?.otherallowance);
      setFormValue({
        ...formValue,
        medicalallowance: inputValue,
        gross,
      });
      setSalaryTableDataManual((prev) => ({
        ...prev,
        medicalallowance: Number(inputValue) || 0,
        grossmonthsalary: gross || 0,
        annualgrossctc: 12 * gross || 0,
      }));
    }
  };

  //change form
  const handleChangeProdAllow = (e) => {
    const regex = /^[0-9]+$/;
    const inputValue = e.target.value;
    if (regex.test(inputValue) || inputValue === '') {
      let gross =
        Number(e.target.value) +
        Number(formValue?.basic) +
        Number(formValue?.hra) +
        Number(formValue?.conveyance) +
        Number(formValue?.medicalallowance) +
        Number(formValue?.medicalallowance) +
        //  Number(formValue?.productionallowancetwo)
        +Number(formValue?.otherallowance);
      setFormValue({
        ...formValue,
        productionallowance: inputValue,
        gross,
      });
      setSalaryTableDataManual((prev) => ({
        ...prev,
        productionallowance: Number(inputValue),
        // + Number(formValue?.productionallowancetwo),
        grossmonthsalary: gross || 0,
        annualgrossctc: 12 * gross || 0,
      }));
    }
  };

  //change form
  const handleChangeProdAllowtwo = (e) => {
    const regex = /^[0-9]+$/;
    const inputValue = e.target.value;
    if (regex.test(inputValue) || inputValue === '') {
      let gross = Number(e.target.value) + Number(formValue?.basic) + Number(formValue?.hra) + Number(formValue?.conveyance) + Number(formValue?.medicalallowance) + Number(formValue?.medicalallowance) + Number(formValue?.productionallowance) + Number(formValue?.otherallowance);
      setFormValue({
        ...formValue,
        productionallowancetwo: inputValue,
        gross,
      });
      setSalaryTableDataManual((prev) => ({
        ...prev,
        productionallowance: Number(inputValue) + Number(formValue?.productionallowance),
        grossmonthsalary: gross || 0,
        annualgrossctc: 12 * gross || 0,
      }));
    }
  };
  //change form
  const handleChangeOtherAllow = (e) => {
    const regex = /^[0-9]+$/;
    const inputValue = e.target.value;

    if (regex.test(inputValue) || inputValue === '') {
      let gross = Number(e.target.value) + Number(formValue?.basic) + Number(formValue?.hra) + Number(formValue?.conveyance) + Number(formValue?.medicalallowance) + Number(formValue?.medicalallowance) + Number(formValue?.productionallowance);
      //  + Number(formValue?.productionallowancetwo)
      setFormValue({
        ...formValue,
        otherallowance: inputValue,
        gross,
      });
      setSalaryTableDataManual((prev) => ({
        ...prev,
        otherallowance: inputValue || 0,
        grossmonthsalary: gross || 0,
        annualgrossctc: 12 * gross || 0,
      }));
    }
  };
  const [salarySlabOpt, setSalarySlabOpt] = useState([]);

  //get all client user id.
  const fetchProfessionalTax = async (process, salarycode) => {
    try {
      let res_freq = await axios.get(SERVICE.SALARYSLAB_PROCESS_FILTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        process: process,
      });
      const OptSlaball = res_freq?.data?.salaryslab;
      const OptSlab = res_freq?.data?.salaryslab.filter((slab) => {
        return slab.salarycode === salarycode;
      });

      setSalarySlabOpt(OptSlaball);
      setFormValue(OptSlab[0]);
      setCtc(
        OptSlab[0].basic +
          OptSlab[0].hra +
          OptSlab[0].conveyance +
          OptSlab[0].medicalallowance +
          OptSlab[0].productionallowance +
          // + OptSlab[0].productionallowancetwo
          OptSlab[0].otherallowance
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const [accessibleErrors, setAccessibleErrors] = useState({});

  const ModeOpt = [
    { label: 'Manual', value: 'Manual' },
    { label: 'Auto', value: 'Auto' },
  ];
  const renderStepSix = () => {
    return (
      <>
        <Headtitle title={'ENQUIRY EDIT'} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-end' }} alignItems="center">
            <Button
              className="prev"
              variant="contained"
              size="small"
              sx={{
                display: { xs: 'none', md: 'flex' }, // Hide on small screens, show on large screens
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                position: { xs: 'static', md: 'fixed' }, // Static for small screens, fixed for larger screens
                left: { md: '10px' }, // Align left for large screens
                top: { md: '50%' }, // Center vertically for large screens
                transform: { md: 'translateY(-50%)' }, // Center transform for large screens
                textTransform: 'capitalize',
                mt: { xs: 2, md: 0 }, // Margin top for small screens to add space
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
                ...buttonStyles?.buttonsubmit,
              }}
              onClick={handleLastPrev}
            >
              Previous
            </Button>
          </Grid>
          <Grid item md={10} xs={12} sm={12}>
            <Box sx={userStyle.dialogbox}>
              <Typography sx={userStyle.SubHeaderText}>Bank Details </Typography>
              <br />
              <br />
              <Grid container spacing={2}>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Bank Name</Typography>
                    <Selects
                      maxMenuHeight={250}
                      options={accounttypes}
                      placeholder="Please Choose Bank Name"
                      value={{
                        label: employee.bankname ? employee.bankname : 'ICICI BANK - ICICI',
                        value: employee.bankname ? employee.bankname : 'ICICI BANK - ICICI',
                      }}
                      onChange={(e) => {
                        setEmployee({
                          ...employee,
                          bankname: e.value,
                          bankbranchname: '',
                          accountholdername: '',
                          accountnumber: '',
                          ifsccode: '',
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Branch Name
                      <span
                        style={{
                          display: 'inline',
                          fontSize: '0.8rem',
                          color: 'blue',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          marginLeft: '5px',
                        }}
                        onClick={handleModalOpen}
                      >
                        {'(Get By IFSC)'}
                      </span>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Please Enter Branch Name"
                      name="bankbranchname"
                      value={employee.bankbranchname}
                      onChange={(e) => {
                        setEmployee({
                          ...employee,
                          bankbranchname: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>

                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Account Holder Name</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Please Enter Account Name"
                      value={employee.accountholdername}
                      onChange={(e) => {
                        setEmployee({
                          ...employee,
                          accountholdername: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Account Number</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Please Enter Account Number"
                      value={employee.accountnumber}
                      onChange={(e) => {
                        setEmployee({
                          ...employee,
                          accountnumber: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>IFSC Code</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Please Enter IFSC Code"
                      value={employee?.ifsccode || ''}
                      onChange={(e) => {
                        setEmployee({ ...employee, ifsccode: e.target.value });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Type of Account</Typography>
                    <Selects
                      maxMenuHeight={250}
                      options={typeofaccount}
                      placeholder="Please Choose Account Type"
                      value={{
                        label: employee.accounttype ? employee.accounttype : 'Please Choose Account Type',
                        value: employee.accounttype ? employee.accounttype : 'Please Choose Account Type',
                      }}
                      onChange={(e) => {
                        setEmployee({ ...employee, accounttype: e.value });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={8} xs={8}>
                  <FormControl fullWidth size="small">
                    <Typography>Status</Typography>
                    <Selects
                      maxMenuHeight={250}
                      options={accountstatus}
                      placeholder="Please Select Status"
                      value={{
                        label: employee.accountstatus,
                        value: employee.accountstatus,
                      }}
                      onChange={(e) => {
                        setEmployee({ ...employee, accountstatus: e.value });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12} sx={{ display: 'flex' }}>
                  <Grid container spacing={2}>
                    <Grid
                      item
                      md={2}
                      sm={8}
                      xs={8}
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        // marginTop: "10%",
                      }}
                    >
                      <Button
                        variant="contained"
                        component="label"
                        size="small"
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: '10%',
                          height: '25px',
                        }}
                        sx={buttonStyles?.buttonsubmit}
                      >
                        Upload
                        <input
                          accept="image/*,application/pdf"
                          type="file"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            handleBankDetailsUpload(e);
                          }}
                        />
                      </Button>
                    </Grid>
                    {bankUpload?.length > 0 && (
                      <Grid
                        item
                        md={5}
                        sm={8}
                        xs={8}
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          // marginTop: "10%",
                        }}
                      >
                        {bankUpload?.length > 0 &&
                          bankUpload.map((file) => (
                            <>
                              <Grid container spacing={2}>
                                <Grid item md={8} sm={8} xs={8}>
                                  <Typography
                                    style={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      maxWidth: '100%',
                                    }}
                                    title={file.name}
                                  >
                                    {file.name}
                                  </Typography>
                                </Grid>
                                <Grid item md={2} sm={1} xs={1}>
                                  <VisibilityOutlinedIcon
                                    style={{
                                      fontsize: 'large',
                                      color: '#357AE8',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => renderFilePreview(file)}
                                  />
                                </Grid>
                                <br />
                                <br />
                                <Grid item md={2} sm={1} xs={1}>
                                  <Button
                                    style={{
                                      fontsize: 'large',
                                      color: '#357AE8',
                                      cursor: 'pointer',
                                      marginTop: '-5px',
                                      marginRight: '10px',
                                    }}
                                    onClick={() => setBankUpload([])}
                                  >
                                    <DeleteIcon />
                                  </Button>
                                </Grid>
                              </Grid>
                            </>
                          ))}
                      </Grid>
                    )}

                    <Grid item md={1} sm={8} xs={8}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleBankTodo}
                        type="button"
                        sx={{
                          height: '30px',
                          minWidth: '30px',
                          marginTop: '28px',
                          marginLeft: '28px',
                          padding: '6px 10px',
                        }}
                      >
                        <FaPlus />
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <br />
              {bankTodo.map((data, index) => (
                <div key={index}>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <Typography sx={{ fontWeight: 'bold' }}>{`Row No : ${index + 1}`}</Typography>
                    </Grid>
                  </Grid>
                  <br />
                  <Grid container spacing={2}>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Bank Name<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          maxMenuHeight={250}
                          options={accounttypes}
                          placeholder="Please Select Bank Name"
                          value={{ label: data.bankname, value: data.bankname }}
                          onChange={(e) => {
                            handleBankTodoChange(index, 'bankname', e.value);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Branch Name<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={data.bankbranchname}
                          placeholder="Please Enter Branch Name"
                          onChange={(e) => {
                            handleBankTodoChange(index, 'bankbranchname', e.target.value);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Account Holder Name<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={data.accountholdername}
                          placeholder="Please Enter Account Holder Name"
                          onChange={(e) => {
                            handleBankTodoChange(index, 'accountholdername', e.target.value);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Account Number<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={data.accountnumber}
                          placeholder="Please Enter Account Number"
                          onChange={(e) => {
                            handleBankTodoChange(index, 'accountnumber', e.target.value);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12} sx={{ display: 'flex' }}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          IFSC Code<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={data.ifsccode}
                          placeholder="Please Enter IFSC Code"
                          onChange={(e) => {
                            handleBankTodoChange(index, 'ifsccode', e.target.value);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Type of Account</Typography>
                        <Selects
                          maxMenuHeight={250}
                          options={typeofaccount}
                          placeholder="Please Choose Account Type"
                          value={{
                            label: data.accounttype,
                            value: data.accounttype,
                          }}
                          onChange={(e) => {
                            handleBankTodoChange(index, 'accounttype', e.value);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12} sx={{ display: 'flex' }}>
                      <FormControl fullWidth size="small">
                        <Typography>Status</Typography>
                        <Selects
                          maxMenuHeight={250}
                          options={accountstatus}
                          placeholder="Please Choose Status"
                          value={{
                            label: data.accountstatus,
                            value: data.accountstatus,
                          }}
                          onChange={(e) => {
                            handleBankTodoChange(index, 'accountstatus', e.value);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={6} xs={12} sm={12} sx={{ display: 'flex' }}>
                      <Grid container spacing={2}>
                        <Grid
                          item
                          md={2}
                          sm={8}
                          xs={8}
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            // marginTop: "10%",
                          }}
                        >
                          <Button
                            variant="contained"
                            component="label"
                            size="small"
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginTop: '10%',
                              height: '25px',
                            }}
                            sx={buttonStyles?.buttonsubmit}
                          >
                            Upload
                            <input
                              accept="image/*,application/pdf"
                              type="file"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                handleBankTodoChangeProof(e, index);
                              }}
                            />
                          </Button>
                        </Grid>
                        {data?.proof?.length > 0 && (
                          <Grid
                            item
                            md={5}
                            sm={8}
                            xs={8}
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              // marginTop: "10%",
                            }}
                          >
                            {data?.proof?.length > 0 &&
                              data?.proof.map((file) => (
                                <>
                                  <Grid container spacing={2}>
                                    <Grid item md={8} sm={8} xs={8}>
                                      <Typography
                                        style={{
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          maxWidth: '100%',
                                        }}
                                        title={file.name}
                                      >
                                        {file.name}
                                      </Typography>
                                    </Grid>
                                    <Grid item md={1} sm={1} xs={1}>
                                      <VisibilityOutlinedIcon
                                        style={{
                                          fontsize: 'large',
                                          color: '#357AE8',
                                          cursor: 'pointer',
                                          marginLeft: '-7px',
                                        }}
                                        onClick={() => renderFilePreview(file)}
                                      />
                                    </Grid>
                                    <br />
                                    <br />
                                    <Grid item md={3} sm={1} xs={1}>
                                      <Button
                                        style={{
                                          fontsize: 'large',
                                          color: '#357AE8',
                                          cursor: 'pointer',
                                          marginTop: '-5px',
                                        }}
                                        onClick={() => handleDeleteProof(index)}
                                      >
                                        <DeleteIcon />
                                      </Button>
                                    </Grid>
                                  </Grid>
                                </>
                              ))}
                          </Grid>
                        )}

                        <Grid item md={1} sm={8} xs={8}>
                          <Button
                            variant="contained"
                            color="error"
                            type="button"
                            onClick={() => deleteTodoEdit(index)}
                            sx={{
                              height: '30px',
                              minWidth: '30px',
                              marginTop: '28px',
                              padding: '6px 10px',
                            }}
                          >
                            <AiOutlineClose />
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <br />
                </div>
              ))}
            </Box>

            <br />
            {salaryOption === 'Experience Based' ? (
              <Box sx={userStyle.dialogbox}>
                <Grid container spacing={1}>
                  <Grid item md={8} xs={0} sm={4}>
                    <Typography sx={userStyle.SubHeaderText}>Exp Log Details </Typography>
                  </Grid>
                  <Grid item md={1} xs={12} sm={4} marginTop={1}>
                    <Typography>
                      Date <b style={{ color: 'red' }}>*</b>
                    </Typography>
                  </Grid>
                  <Grid item md={3} xs={12} sm={4}>
                    <FormControl fullWidth>
                      <Selects
                        maxMenuHeight={250}
                        styles={{
                          menu: (provided) => ({
                            ...provided,
                            maxHeight: 200, // Adjust the max height of the menu base
                          }),
                          menuList: (provided) => ({
                            ...provided,
                            maxHeight: 200, // Adjust the max height of the menu option list
                          }),
                        }}
                        options={expDateOptions}
                        value={{
                          label: assignExperience.updatedate,
                          value: assignExperience.updatedate,
                        }}
                        onChange={(e) => {
                          setAssignExperience({
                            ...assignExperience,
                            updatedate: e.value,
                          });
                          setnewstate(!newstate);
                        }}
                      />
                    </FormControl>
                    {errorsLog.updatedate && <div>{errorsLog.updatedate}</div>}
                  </Grid>
                </Grid>
                <br />
                <Grid container spacing={1}>
                  <Grid item md={12} xs={12} sm={12}>
                    {' '}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          width: '70%',
                          maxWidth: '800px',
                        }}
                      >
                        <SalaryTable
                          name={companycaps || ''}
                          salaryFixed={salaryTableData?.salaryfixed || false}
                          salaryStatus={salaryTableData?.salarystatus || ''}
                          expectedSalary={salaryTableData?.expectedsalary || ''}
                          basic={salaryTableData?.basic || 0}
                          hra={salaryTableData?.hra || 0}
                          conveyance={salaryTableData?.conveyance || 0}
                          medicalallowance={salaryTableData?.medicalallowance || 0}
                          productionallowance={salaryTableData?.productionallowance || 0}
                          otherallowance={salaryTableData?.otherallowance || 0}
                          performanceincentive={salaryTableData?.performanceincentive || 0}
                          shiftallowance={salaryTableData?.shiftallowance || 0}
                          grossmonthsalary={salaryTableData?.grossmonthsalary || 0}
                          annualgrossctc={salaryTableData?.annualgrossctc || 0}
                          onImageGenerated={(img) => setTableImage(img)}
                          generateImage={true}
                        />
                      </div>
                    </div>
                  </Grid>
                  <Grid item md={4} xs={12} sm={4}>
                    <FormControl fullWidth>
                      <Typography>Salary Options</Typography>
                      <Selects
                        maxMenuHeight={250}
                        options={salaryOptions}
                        value={{
                          label: salaryOption,
                          value: salaryOption,
                        }}
                        onChange={(e) => {
                          setSalaryOption(e.value);
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={4} xs={12} sm={4}>
                    <FormControl fullWidth>
                      <Typography>Mode Val</Typography>
                      <Selects
                        maxMenuHeight={250}
                        options={modeOption}
                        value={{
                          label: assignExperience.assignExpMode,
                          value: assignExperience.assignExpMode,
                        }}
                        onChange={(e) => {
                          setAssignExperience({
                            ...assignExperience,
                            assignExpMode: e.value,
                            assignExpvalue: e.value === 'Auto Increment' ? 0 : '',
                          });
                          setnewstate(!newstate);
                        }}
                      />
                    </FormControl>
                  </Grid>
                  {assignExperience.assignExpMode === 'Please Select Mode' ? (
                    ''
                  ) : (
                    <>
                      <Grid item md={4} xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <Typography>Value (In Months) {assignExperience.assignExpMode === 'Add' || assignExperience.assignExpMode === 'Minus' || assignExperience.assignExpMode === 'Fix' ? <b style={{ color: 'red' }}>*</b> : ''}</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Please Enter Value (In Months)"
                            disabled={assignExperience.assignExpMode === 'Auto Increment'}
                            value={assignExperience.assignExpvalue}
                            onChange={(e) => {
                              setAssignExperience({
                                ...assignExperience,
                                assignExpvalue: e.target.value,
                              });
                              setnewstate(!newstate);
                            }}
                          />
                        </FormControl>
                        {errorsLog.assignexpvalue && <div>{errorsLog.assignexpvalue}</div>}
                      </Grid>
                    </>
                  )}
                </Grid>
                <br />
                <Grid container spacing={1}>
                  <Grid item md={3} xs={12} sm={4}>
                    <FormControl fullWidth>
                      <Typography>Mode Exp</Typography>
                      <Selects
                        maxMenuHeight={250}
                        options={modeOptionexp}
                        value={{
                          label: assignExperience.assignEndExp,
                          value: assignExperience.assignEndExp,
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item md={3} xs={12} sm={4}>
                    <FormControl fullWidth>
                      <Typography>End Exp</Typography>
                      <Selects
                        maxMenuHeight={250}
                        options={valueOpt}
                        value={{
                          label: assignExperience.assignEndExpvalue,
                          value: assignExperience.assignEndExpvalue,
                        }}
                        onChange={(e) => {
                          setAssignExperience({
                            ...assignExperience,
                            assignEndExpvalue: e.value,
                          });
                          setnewstate(!newstate);
                        }}
                      />
                    </FormControl>
                  </Grid>

                  {assignExperience.assignEndExpvalue === 'Yes' ? (
                    <>
                      <Grid item md={3} xs={12} sm={4}>
                        <Typography>End Exp Date {assignExperience.assignEndExpvalue === 'Yes' ? <b style={{ color: 'red' }}>*</b> : ''}</Typography>
                        <Selects
                          maxMenuHeight={250}
                          menuPlacement="top"
                          styles={{
                            menu: (provided) => ({
                              ...provided,
                              maxHeight: 200, // Adjust the max height of the menu base
                            }),
                            menuList: (provided) => ({
                              ...provided,
                              maxHeight: 200, // Adjust the max height of the menu option list
                            }),
                          }}
                          options={expDateOptions}
                          value={{
                            label: assignExperience.assignEndExpDate,
                            value: assignExperience.assignEndExpDate,
                          }}
                          onChange={(e) => {
                            setAssignExperience({
                              ...assignExperience,
                              assignEndExpDate: e.value,
                            });
                            setnewstate(!newstate);
                          }}
                        />
                        {errorsLog.endexpdate && <div>{errorsLog.endexpdate}</div>}
                      </Grid>
                    </>
                  ) : null}
                </Grid>
                <br />
                <Grid container spacing={1}>
                  <Grid item md={3} xs={12} sm={4}>
                    <FormControl fullWidth>
                      <Typography>Mode Target</Typography>
                      <Selects
                        maxMenuHeight={250}
                        options={modeOptiontar}
                        value={{
                          label: assignExperience.assignEndTar,
                          value: assignExperience.assignEndTar,
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item md={3} xs={12} sm={4}>
                    <FormControl fullWidth>
                      <Typography>End Tar</Typography>
                      <Selects
                        maxMenuHeight={250}
                        options={valueOpt}
                        value={{
                          label: assignExperience.assignEndTarvalue,
                          value: assignExperience.assignEndTarvalue,
                        }}
                        onChange={(e) => {
                          setAssignExperience({
                            ...assignExperience,
                            assignEndTarvalue: e.value,
                          });
                          setnewstate(!newstate);
                        }}
                      />
                    </FormControl>
                  </Grid>

                  {assignExperience.assignEndTarvalue === 'Yes' ? (
                    <>
                      <Grid item md={3} xs={12} sm={4}>
                        <Typography>End Tar Date {assignExperience.assignEndTarvalue === 'Yes' ? <b style={{ color: 'red' }}>*</b> : ''}</Typography>

                        <Selects
                          maxMenuHeight={250}
                          menuPlacement="top"
                          options={expDateOptions}
                          styles={{
                            menu: (provided) => ({
                              ...provided,
                              maxHeight: 200, // Adjust the max height of the menu base
                            }),
                            menuList: (provided) => ({
                              ...provided,
                              maxHeight: 200, // Adjust the max height of the menu option list
                            }),
                          }}
                          value={{
                            label: assignExperience.assignEndTarDate,
                            value: assignExperience.assignEndTarDate,
                          }}
                          onChange={(e) => {
                            setAssignExperience({
                              ...assignExperience,
                              assignEndTarDate: e.value,
                            });
                            setnewstate(!newstate);
                          }}
                        />
                        {errorsLog.endtardate && <div>{errorsLog.endtardate}</div>}
                      </Grid>
                    </>
                  ) : null}
                </Grid>
                <br />
              </Box>
            ) : (
              <Box sx={userStyle.dialogbox}>
                <>
                  <Grid container spacing={1}>
                    <Grid item md={5} xs={0} sm={4}>
                      <Typography sx={userStyle.SubHeaderText}>Salary Setup </Typography>
                    </Grid>
                    <Grid item md={2} xs={0} sm={2} marginTop={1}>
                      <Typography>Salary Options :</Typography>
                    </Grid>
                    <Grid item md={4} xs={12} sm={4}>
                      <FormControl fullWidth>
                        <Selects
                          maxMenuHeight={250}
                          options={salaryOptions}
                          value={{
                            label: salaryOption,
                            value: salaryOption,
                          }}
                          onChange={(e) => {
                            setSalaryOption(e.value);
                          }}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                  <br />
                  <Grid container spacing={2}>
                    <Grid item md={12} xs={12} sm={12}>
                      {' '}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <div
                          style={{
                            width: '70%',
                            maxWidth: '800px',
                          }}
                        >
                          <SalaryTable
                            name={companycaps || ''}
                            salaryFixed={salaryTableData?.salaryfixed || false}
                            salaryStatus={salaryTableData?.salarystatus || ''}
                            expectedSalary={salaryTableData?.expectedsalary || ''}
                            basic={salaryTableDataManual?.basic || 0}
                            hra={salaryTableDataManual?.hra || 0}
                            conveyance={salaryTableDataManual?.conveyance || 0}
                            medicalallowance={salaryTableDataManual?.medicalallowance || 0}
                            productionallowance={salaryTableDataManual?.productionallowance || 0}
                            otherallowance={salaryTableDataManual?.otherallowance || 0}
                            performanceincentive={salaryTableDataManual?.performanceincentive || 0}
                            shiftallowance={salaryTableDataManual?.shiftallowance || 0}
                            grossmonthsalary={salaryTableDataManual?.grossmonthsalary || 0}
                            annualgrossctc={salaryTableDataManual?.annualgrossctc || 0}
                            onImageGenerated={(img) => setTableImageManual(img)}
                            generateImage={true}
                          />
                        </div>
                      </div>
                    </Grid>
                    <Grid item md={3} sm={6} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Mode<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          styles={colourStyles}
                          options={ModeOpt}
                          value={{
                            label: salarySetUpForm.mode,
                            value: salarySetUpForm.mode,
                          }}
                          onChange={(e) => {
                            setSalarysetupForm({
                              ...salarySetUpForm,
                              mode: e.value,
                              salarycode: e.value == 'Manual' ? 'MANUAL' : '',
                            });
                            if (e.value === 'Auto') {
                              setIsActive(true);
                              setFormValue({
                                ...formValue,
                                gross: '',
                                basic: '',
                                hra: '',
                                conveyance: '',
                                medicalallowance: '',
                                productionallowance: '',
                                productionallowancetwo: '',
                                otherallowance: '',
                              });
                              setCtc('');
                            } else {
                              setIsActive(false);
                            }
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={6}
                      xs={12}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography>
                        Date<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <FormControl fullWidth>
                        <Selects
                          maxMenuHeight={250}
                          styles={{
                            menu: (provided) => ({
                              ...provided,
                              maxHeight: 200, // Adjust the max height of the menu base
                            }),
                            menuList: (provided) => ({
                              ...provided,
                              maxHeight: 200, // Adjust the max height of the menu option list
                            }),
                          }}
                          options={expDptDates
                            .filter((d) => d.department === employee?.department)
                            .map((item) => ({
                              ...item,
                              label: item.fromdate,
                              value: item.fromdate,
                            }))}
                          value={{
                            label: formValue.startDate ?? 'Please Select Date',
                            value: formValue.startDate ?? 'Please Select Date',
                          }}
                          onChange={(e) => {
                            const mondatefilter = e?.value?.split('-');
                            const getmonth =
                              mondatefilter[1] === '12'
                                ? 'December'
                                : mondatefilter[1] === '11'
                                ? 'November'
                                : mondatefilter[1] === '10'
                                ? 'October'
                                : mondatefilter[1] === '09'
                                ? 'September'
                                : mondatefilter[1] === '9'
                                ? 'September'
                                : mondatefilter[1] === '08'
                                ? 'August'
                                : mondatefilter[1] === '8'
                                ? 'August'
                                : mondatefilter[1] === '07'
                                ? 'July'
                                : mondatefilter[1] === '7'
                                ? 'July'
                                : mondatefilter[1] === '06'
                                ? 'June'
                                : mondatefilter[1] === '6'
                                ? 'June'
                                : mondatefilter[1] === '05'
                                ? 'May'
                                : mondatefilter[1] === '5'
                                ? 'May'
                                : mondatefilter[1] === '04'
                                ? 'April'
                                : mondatefilter[1] === '4'
                                ? 'April'
                                : mondatefilter[1] === '03'
                                ? 'March'
                                : mondatefilter[1] === '3'
                                ? 'March'
                                : mondatefilter[1] === '02'
                                ? 'February'
                                : mondatefilter[1] === '2'
                                ? 'February'
                                : mondatefilter[1] === '01'
                                ? 'January'
                                : mondatefilter[1] === '1'
                                ? 'January'
                                : '';
                            setFormValue({
                              ...formValue,
                              startmonthlabel: getmonth,
                              startmonth: mondatefilter[1],
                              startyear: mondatefilter[0],
                              startDate: e.value,
                            });
                          }}
                        />
                      </FormControl>
                      {accessibleErrors.startdate && <div>{accessibleErrors.startdate}</div>}
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      {salarySetUpForm.mode === 'Manual' ? (
                        <FormControl fullWidth size="small">
                          <Typography>
                            Salary Code <b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <OutlinedInput id="component-outlined" type="text" placeholder="Please Enter Salary Code" value={salarySetUpForm.salarycode} />
                        </FormControl>
                      ) : (
                        <FormControl fullWidth size="small">
                          <Typography>Salary Code</Typography>
                          <Selects
                            isDisabled
                            options={salarySlabOpt
                              .filter((item) => item.processqueue === loginNotAllot.process)
                              .map((sc) => ({
                                ...sc,
                                value: sc.salarycode,
                                label: sc.salarycode,
                              }))}
                            value={{
                              label: salarySetUpForm.salarycode,
                              value: salarySetUpForm.salarycode,
                            }}
                            onChange={(e) => {
                              setSalarysetupForm({
                                ...salarySetUpForm,
                                salarycode: e.value,
                              });
                              fetchProfessionalTax(e.process, e.value);
                            }}
                          />
                        </FormControl>
                      )}
                    </Grid>
                    {/* {salarySetUpForm.mode === "Manual" && ( */}
                    <>
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Start Month <b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <OutlinedInput id="component-outlined" type="text" placeholder="Please Enter Salary Code" value={formValue.startmonthlabel} />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            {' '}
                            Start Year <b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <OutlinedInput id="component-outlined" type="text" placeholder="Please Enter Salary Code" value={formValue.startyear} />
                        </FormControl>
                      </Grid>
                    </>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Gross Salary <b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <OutlinedInput id="component-outlined" type="text" disabled={salarySetUpForm.mode === 'Auto'} placeholder="Please Enter Gross" value={formValue.gross} onChange={handleChangeGross} />
                      </FormControl>
                      {salarySetUpForm.mode === 'Manual' && accessibleErrors.grosssalary && <div>{accessibleErrors.grosssalary}</div>}
                    </Grid>

                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Basic</Typography>
                        <OutlinedInput id="component-outlined" type="text" disabled={salarySetUpForm.mode === 'Auto'} placeholder="Please Enter Basic" value={formValue.basic} onChange={handleChangeBasic} />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>HRA</Typography>
                        <OutlinedInput id="component-outlined" type="text" disabled={salarySetUpForm.mode === 'Auto'} placeholder="Please Enter HRA" value={formValue.hra} onChange={handleChangeHra} />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Conveyance</Typography>
                        <OutlinedInput id="component-outlined" type="text" disabled={salarySetUpForm.mode === 'Auto'} placeholder="Please Enter Conveyance" value={formValue.conveyance} onChange={handleChangeConveyance} />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Medical Allowance</Typography>
                        <OutlinedInput id="component-outlined" type="text" disabled={salarySetUpForm.mode === 'Auto'} placeholder="Please Enter Medical Allowance" value={formValue.medicalallowance} onChange={handleChangeMedAllow} />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Production Allowance</Typography>
                        <OutlinedInput id="component-outlined" type="text" disabled={salarySetUpForm.mode === 'Auto'} placeholder="Please Enter Production Allowance" value={formValue.productionallowance} onChange={handleChangeProdAllow} />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Production Allowance 2</Typography>
                        <OutlinedInput id="component-outlined" type="text" disabled={salarySetUpForm.mode === 'Auto'} placeholder="Please Enter Production Allowance 2" value={formValue.productionallowancetwo} onChange={handleChangeProdAllowtwo} />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Other Allowance</Typography>
                        <OutlinedInput id="component-outlined" type="text" disabled={salarySetUpForm.mode === 'Auto'} placeholder="Please Enter Other Allowance" value={formValue.otherallowance} onChange={handleChangeOtherAllow} />
                      </FormControl>
                    </Grid>

                    <Grid item md={3} xs={12} sm={12}></Grid>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Checkbox
                          sx={{ height: '20', padding: '0  25px' }}
                          checked={formValue.esideduction}
                          disabled={salarySetUpForm.mode === 'Auto'}
                          onChange={(e) => {
                            setFormValue({
                              ...formValue,
                              esideduction: e.target.checked,
                            });
                          }}
                        />
                        <Typography>ESI Deduction</Typography>
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Checkbox
                          sx={{ height: '20', padding: '0  25px' }}
                          checked={formValue.pfdeduction}
                          disabled={salarySetUpForm.mode === 'Auto'}
                          onChange={(e) => {
                            setFormValue({
                              ...formValue,
                              pfdeduction: e.target.checked,
                            });
                          }}
                        />
                        <Typography>PF Deduction</Typography>
                      </FormControl>
                    </Grid>
                  </Grid>
                </>
              </Box>
            )}
            <br />

            {/* process details add */}
            {salaryOption === 'Experience Based' && (
              <Box sx={userStyle.dialogbox}>
                <Grid container spacing={1}>
                  <Grid item md={8} xs={0} sm={4}>
                    <Typography sx={userStyle.SubHeaderText}>Process Allot </Typography>
                  </Grid>
                </Grid>
                <br />
                <Grid container spacing={2}>
                  <Grid item md={4} xs={12} sm={12}>
                    <Typography>
                      Process <b style={{ color: 'red' }}>*</b>{' '}
                    </Typography>

                    <FormControl fullWidth size="small">
                      <Selects
                        options={Array.from(new Set(ProcessOptions?.filter((comp) => selectedTeam === comp.team)?.map((com) => com.process))).map((name) => ({
                          label: name,
                          value: name,
                        }))}
                        value={{
                          label: loginNotAllot.process,
                          value: loginNotAllot.process,
                        }}
                        onChange={(e) => {
                          setLoginNotAllot({
                            ...loginNotAllot,
                            process: e.value,
                          });
                          setnewstate(!newstate);
                        }}
                      />
                    </FormControl>
                    {errorsLog.process && <div>{errorsLog.process}</div>}
                  </Grid>
                  <Grid item md={4} xs={12} sm={12}>
                    <Typography>
                      Process Type <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Selects
                        options={processTypes}
                        value={{
                          label: loginNotAllot?.processtype,
                          value: loginNotAllot?.processtype,
                        }}
                        onChange={(e) => {
                          setLoginNotAllot({
                            ...loginNotAllot,
                            processtype: e.value,
                          });
                          setnewstate(!newstate);
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={4} xs={12} sm={12}>
                    <Typography>
                      Process Duration <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Selects
                        options={processDuration}
                        value={{
                          label: loginNotAllot?.processduration,
                          value: loginNotAllot?.processduration,
                        }}
                        onChange={(e) => {
                          setLoginNotAllot({
                            ...loginNotAllot,
                            processduration: e.value,
                          });
                          setnewstate(!newstate);
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={4} xs={12} sm={6}>
                    <Typography>
                      Duration <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item md={6} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Selects
                            maxMenuHeight={300}
                            options={hrsOption}
                            placeholder="Hrs"
                            value={{
                              label: loginNotAllot.time,
                              value: loginNotAllot.time,
                            }}
                            onChange={(e) => {
                              setLoginNotAllot({
                                ...loginNotAllot,
                                time: e.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={6} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Selects
                            maxMenuHeight={300}
                            options={minsOption}
                            placeholder="Mins"
                            value={{
                              label: loginNotAllot.timemins,
                              value: loginNotAllot.timemins,
                            }}
                            onChange={(e) => {
                              setLoginNotAllot({
                                ...loginNotAllot,
                                timemins: e.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                    {errorsLog.duration && <div>{errorsLog.duration}</div>}
                  </Grid>
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Gross Salary</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        // placeholder="Please Enter IFSC Code"
                        value={overallgrosstotal}
                        // onChange={(e) => {
                        //   setEmployee({ ...employee, ifsccode: e.target.value });
                        // }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Mode Experience</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        // placeholder="Please Enter IFSC Code"
                        value={modeexperience}
                        // onChange={(e) => {
                        //   setEmployee({ ...employee, ifsccode: e.target.value });
                        // }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Target Experience</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        // placeholder="Please Enter IFSC Code"
                        value={targetexperience}
                        // onChange={(e) => {
                        //   setEmployee({ ...employee, ifsccode: e.target.value });
                        // }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Target Points</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        // placeholder="Please Enter IFSC Code"
                        value={targetpts}
                        // onChange={(e) => {
                        //   setEmployee({ ...employee, ifsccode: e.target.value });
                        // }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <br />
              </Box>
            )}
            <br />

            {/* Accessible Company/Branch/Unit add details */}
            <Box sx={userStyle.dialogbox}>
              <Grid container spacing={1}>
                <Grid item md={8} xs={0} sm={4}>
                  <Typography sx={userStyle.SubHeaderText}>Accessible Company/Branch/Unit</Typography>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={2.8} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Company<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      options={isAssignBranch
                        ?.map((data) => ({
                          label: data.company,
                          value: data.company,
                          code: data.code,
                        }))
                        .filter((item, index, self) => {
                          return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                        })}
                      styles={colourStyles}
                      value={{
                        label: accessible.company,
                        value: accessible.company,
                      }}
                      onChange={(e) => {
                        setAccessible({
                          ...accessible,
                          company: e.value,
                          branch: 'Please Select Branch',
                          unit: 'Please Select Unit',
                          companycode: e.code,
                          branchcode: '',
                          unitcode: '',
                          branchemail: '',
                          branchaddress: '',
                          branchstate: '',
                          branchcity: '',
                          branchcountry: '',
                          branchpincode: '',
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={2.8} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Branch<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      options={branchNames
                        ?.filter((comp) => comp.company === accessible.company)
                        ?.map((data) => ({
                          label: data.name,
                          value: data.name,
                          ...data,
                        }))}
                      styles={colourStyles}
                      value={{
                        label: accessible.branch,
                        value: accessible.branch,
                      }}
                      onChange={(e) => {
                        setAccessible({
                          ...accessible,
                          branch: e.value,
                          unit: 'Please Select Unit',
                          branchcode: e.code,
                          branchemail: e.email,
                          branchaddress: e.address,
                          branchstate: e.state,
                          branchcity: e.city,
                          branchcountry: e.country,
                          branchpincode: e.pincode,
                          unitcode: '',
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={2.8} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Unit<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      options={unitNames
                        ?.filter(
                          (comp) =>
                            // comp.company === accessible.company &&
                            comp.branch === accessible.branch
                        )
                        ?.map((data) => ({
                          label: data.name,
                          value: data.name,
                          code: data.code,
                        }))}
                      styles={colourStyles}
                      value={{ label: accessible.unit, value: accessible.unit }}
                      onChange={(e) => {
                        setAccessible({
                          ...accessible,
                          unit: e.value,
                          unitcode: e.code,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>

                <Grid item md={2.8} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Responsible Person</Typography>
                    <OutlinedInput id="component-outlined" type="text" value={companycaps} readOnly />
                  </FormControl>
                </Grid>
                <Grid item md={0.8} sm={8} xs={8}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleAccessibleBranchTodo}
                    type="button"
                    sx={{
                      height: '30px',
                      minWidth: '30px',
                      marginTop: '28px',
                      padding: '6px 10px',
                    }}
                  >
                    <FaPlus />
                  </Button>
                </Grid>
              </Grid>
              <br />
              {accessibleTodo?.map((datas, index) => (
                <div key={index}>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <Typography sx={{ fontWeight: 'bold' }}>{`Row No : ${index + 1}`}</Typography>
                    </Grid>
                  </Grid>
                  <br />
                  <Grid container spacing={2}>
                    <Grid item md={3.7} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Company<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          options={isAssignBranch
                            ?.map((data) => ({
                              label: data.company,
                              value: data.company,
                              code: data.code,
                            }))
                            .filter((item, index, self) => {
                              return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                            })}
                          styles={colourStyles}
                          value={{
                            label: datas.fromcompany ?? 'Please Select Company',
                            value: datas.fromcompany ?? 'Please Select Company',
                          }}
                          onChange={(e) => {
                            handleAccessibleBranchTodoChange(index, {
                              fromcompany: e.value,
                              companycode: e.code,
                              frombranch: 'Please Select Branch',
                              fromunit: 'Please Select Unit',
                              branchcode: '',
                              unitcode: '',
                              branchemail: '',
                              branchaddress: '',
                              branchstate: '',
                              branchcity: '',
                              branchcountry: '',
                              branchpincode: '',
                            });
                          }}
                          isDisabled={accessibleTodoDisableDelete?.includes(index)}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3.7} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Branch<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          options={branchNames
                            ?.filter((comp) => comp.company === datas.fromcompany)
                            ?.map((data) => ({
                              label: data.name,
                              value: data.name,
                              ...data,
                            }))}
                          styles={colourStyles}
                          value={{
                            label: datas.frombranch ?? 'Please Select Branch',
                            value: datas.frombranch ?? 'Please Select Branch',
                          }}
                          onChange={(e) => {
                            handleAccessibleBranchTodoChange(index, {
                              frombranch: e.value,
                              fromunit: 'Please Select Unit',
                              unitcode: '',
                              branchcode: e.code,
                              branchemail: e.email,
                              branchaddress: e.address,
                              branchstate: e.state,
                              branchcity: e.city,
                              branchcountry: e.country,
                              branchpincode: e.pincode,
                            });
                          }}
                          isDisabled={accessibleTodoDisableDelete?.includes(index)}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3.7} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Unit<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          options={unitNames
                            ?.filter(
                              (comp) =>
                                // comp.company === accessible.company &&
                                comp.branch === datas.frombranch
                            )
                            ?.map((data) => ({
                              label: data.name,
                              value: data.name,
                              code: data.code,
                            }))}
                          styles={colourStyles}
                          value={{
                            label: datas.fromunit ?? 'Please Select Unit',
                            value: datas.fromunit ?? 'Please Select Unit',
                          }}
                          isDisabled={accessibleTodoDisableDelete?.includes(index)}
                          onChange={(e) => {
                            handleAccessibleBranchTodoChange(index, {
                              fromunit: e.value,
                              unitcode: e.code,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item md={0.9} xs={12} sm={12}>
                      <Button
                        variant="contained"
                        color="error"
                        type="button"
                        disabled={accessibleTodoDisableDelete?.includes(index)}
                        onClick={() => deleteAccessibleBranchTodo(index)}
                        sx={{
                          height: '30px',
                          minWidth: '30px',
                          marginTop: '28px',
                          padding: '6px 10px',
                        }}
                      >
                        <AiOutlineClose />
                      </Button>
                    </Grid>
                  </Grid>
                  <br />
                </div>
              ))}
              <br />
            </Box>
            <br />
          </Grid>

          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-end' }} alignItems="center">
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', md: 'column' }, // Row for small screens, column for larger screens
                justifyContent: { xs: 'center', md: 'flex-end' },
                alignItems: 'center',
                gap: '10px',
                position: { xs: 'static', md: 'fixed' }, // Static for small screens, fixed for larger screens
                bottom: { xs: 0, md: 'auto' }, // Align to bottom for small screens
                right: { xs: 'auto', md: '10px' }, // Align right for large screens
                top: { xs: 'auto', md: '50%' }, // Center vertically for large screens
                transform: { xs: 'none', md: 'translateY(-50%)' }, // Center transform for large screens
                width: 'auto',
                padding: { xs: '0 5px', md: '0 10px' }, // Reduce padding for small screens
                mb: { xs: 1, md: 0 }, // Margin bottom for small screens
              }}
            >
              <Button
                className="prev"
                variant="contained"
                size="small"
                sx={{
                  display: { xs: 'block', md: 'none' }, // Show on small screens, hide on large screens
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
                onClick={handleLastPrev}
              >
                Previous
              </Button>
              <LoadingButton
                // onClick={(e) => {
                //   handleButtonClick(e);
                // }}
                onClick={(e) => {
                  handleOpenConfirmationPopup('submit6');
                }}
                loading={loading}
                loadingPosition="start"
                variant="contained"
                size="small"
                sx={{
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                <span>SUBMIT</span>
              </LoadingButton>

              {/* <Link
                to="/enquirypurposelist"
                style={{
                  textDecoration: "none",
                  color: "white",
                  marginRight: "0px",
                }}
              > */}
              <Button
                size="small"
                sx={{
                  ...buttonStyles?.btncancel,
                  textTransform: 'capitalize',
                  width: '73px',
                }}
                onClick={(e) => {
                  handleOpenConfirmationPopup('cancel');
                }}
              >
                {' '}
                Cancel{' '}
              </Button>
              {/* </Link> */}
            </Box>
          </Grid>
        </Grid>

        {/* ALERT DIALOG */}
        <Box>
          <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
              <Typography variant="h6">{showAlert}</Typography>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" color="error" onClick={handleCloseerr} sx={buttonStyles?.buttonsubmit}>
                ok
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </>
    );
  };

  const renderIndicator = () => {
    return (
      <ul className="indicatoremployee">
        <li className={step === 1 ? 'active' : null}>
          <FaArrowAltCircleRight />
          &ensp;Personal Info
        </li>
        <li className={step === 2 ? 'active' : null}>
          <FaArrowAltCircleRight />
          &ensp;Login & Boarding Details
        </li>
        <li className={step === 3 ? 'active' : null}>
          <FaArrowAltCircleRight />
          &ensp;Address
        </li>
        <li className={step === 4 ? 'active' : null}>
          <FaArrowAltCircleRight />
          &ensp;Document
        </li>
        <li className={step === 5 ? 'active' : null}>
          <FaArrowAltCircleRight />
          &ensp;Work History
        </li>
        <li className={step === 6 ? 'active' : null}>
          <FaArrowAltCircleRight />
          &ensp;Bank Details
        </li>
      </ul>
    );
  };

  return (
    <div className="multistep-form">
      {renderIndicator()}
      {step === 1 ? renderStepOne() : null}
      {step === 2 ? renderStepTwo() : null}
      {step === 3 ? renderStepThree() : null}
      {step === 4 ? renderStepFour() : null}
      {step === 5 ? renderStepFive() : null}
      {step === 6 ? renderStepSix() : null}

      <Modal open={ifscModalOpen} onClose={handleModalClose} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description" sx={{ marginTop: '80px' }}>
        <div
          style={{
            margin: 'auto',
            backgroundColor: 'white',
            padding: '20px',
            maxWidth: '500px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">Enter IFSC Code</Typography>
            <IconButton onClick={handleModalClose}>
              <CloseIcon />
            </IconButton>
          </div>
          <OutlinedInput type="text" placeholder="Enter IFSC Code" name="ifscCode" style={{ height: '30px', margin: '10px' }} value={employee.ifscCode} onChange={handleInputChange} />
          <LoadingButton variant="contained" loading={loading} color="primary" sx={{ borderRadius: '20px', marginLeft: '5px' }} onClick={fetchBankDetails}>
            Get Branch
          </LoadingButton>
          <br />
          {bankDetails && (
            <div>
              <Typography variant="subtitle1">Bank Name: {bankDetails.BANK}</Typography>
              <Typography variant="subtitle1">Branch Name: {bankDetails.BRANCH}</Typography>
              <Button
                variant="contained"
                sx={{
                  borderRadius: '20px',
                  padding: '0 10px',
                  ...buttonStyles?.buttonsubmit,
                }}
                onClick={(e) => {
                  const matchedBank = accounttypes.find((bank) => {
                    const labelBeforeHyphen = bank.label.split(' - ')[0];

                    return labelBeforeHyphen.toLowerCase()?.trim() === bankDetails.BANK.toLowerCase()?.trim();
                  });
                  setEmployee({
                    ...employee,
                    bankbranchname: String(bankDetails.BRANCH),
                    ifsccode: employee.ifscCode,
                    bankname: matchedBank?.value,
                  });
                  handleModalClose();
                }}
              >
                Submit
              </Button>
              {/* Add more details as needed */}
            </div>
          )}
        </div>
      </Modal>
      <LoadingBackdrop open={isLoading} />
      {/* ALERT DIALOG */}
      <Box>
        <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">{showAlert}</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="error" onClick={handleCloseerr} sx={buttonStyles?.buttonsubmit}>
              ok
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* VALIDATION */}
      <MessageAlert openPopup={openPopupMalert} handleClosePopup={handleClosePopupMalert} popupContent={popupContentMalert} popupSeverity={popupSeverityMalert} />
      {/* SUCCESS */}
      <AlertDialog openPopup={openPopup} handleClosePopup={handleClosePopup} popupContent={popupContent} popupSeverity={popupSeverity} />

      <Dialog
        open={isErrorOpenpop}
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            // Ignore backdrop clicks
            return;
          }
          handleCloseerrpop(); // Handle other close actions
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        fullWidth={true}
        sx={{ marginTop: '80px' }}
      >
        <Box sx={userStyle.dialogbox}>
          <>
            <Typography sx={userStyle.HeaderText}>
              {' '}
              <b>Existing Profile List</b>
            </Typography>
            <Grid item md={6} sm={12} xs={12}>
              {showDupProfileVIsitor && showDupProfileVIsitor.length > 0 ? (
                <ExistingProfileVisitor ExistingProfileVisitors={showDupProfileVIsitor} fromEmployee={true} />
              ) : (
                <Typography
                  sx={{
                    ...userStyle.HeaderText,
                    marginLeft: '28px',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  There is No Profile
                </Typography>
              )}
            </Grid>
            <br />
            <Grid item md={12} sm={12} xs={12}>
              <Grid
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '15px',
                }}
              >
                <Tooltip title={showDupProfileVIsitor?.some((data) => data?.modelName === 'Employee') ? 'Cannot upload duplicate images for Employee.' : ''} placement="top" arrow>
                  <span>
                    <Button
                      style={{
                        padding: '7px 13px',
                        color: 'white',
                        background: 'rgb(25, 118, 210)',
                        ...buttonStyles?.buttonsubmit,
                      }}
                      disabled={showDupProfileVIsitor?.some((data) => data?.modelName === 'Employee')}
                      onClick={() => {
                        UploadWithDuplicate();
                      }}
                    >
                      Upload With Duplicate
                    </Button>
                  </span>
                </Tooltip>
                <Button sx={buttonStyles.btncancel} onClick={UploadWithoutDuplicate}>
                  Upload Without Duplicate
                </Button>
              </Grid>
            </Grid>
          </>
        </Box>
      </Dialog>
      <Dialog
        open={showCameraDialog}
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            // Ignore backdrop clicks
            return;
          }
          handleCloseCamera(); // Handle other close actions
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        fullWidth={true}
        sx={{ marginTop: '80px' }}
      >
        <DialogTitle>Camera</DialogTitle>
        <DialogContent>
          {/* Your camera component here */}
          <DocumentScannerComponent showCamera={showCamera} setShowCamera={setShowCamera} handleCloseCamera={handleCloseCamera} onSendFile={onSendFileFn} />
        </DialogContent>
      </Dialog>
      <DeleteConfirmation open={isDeleteOpen} onClose={handleClickCloseDelete} onConfirm={deleteFunction} title={deleteMessage} confirmButtonText="Yes" cancelButtonText="Cancel" />

      <ConfirmationPopup
        open={popup.open}
        onClose={handleCloseConfirmationPopup}
        onConfirm={handleConfirm}
        title={['submit1', 'submit2', 'submit3', 'submit4', 'submit5', 'submit6', 'submit7', 'submit8'].includes(popup.action) ? 'Are you sure? Do you want to Submit?' : popup.action === 'draft' ? 'Are you sure? Do you want to save as Draft?' : 'Are you sure? Do you want to Cancel?'}
        description={
          ['submit1', 'submit2', 'submit3', 'submit4', 'submit5', 'submit6', 'submit7', 'submit8'].includes(popup.action) ? 'This action will finalize and submit your data.' : popup.action === 'draft' ? 'This action will save your progress as a draft.' : 'This action will cancel your progress.'
        }
        confirmButtonText={['submit1', 'submit2', 'submit3', 'submit4', 'submit5', 'submit6', 'submit7', 'submit8'].includes(popup.action) ? 'Submit' : popup.action === 'draft' ? 'Save Draft' : 'Yes'}
        cancelButtonText="No"
        icon={['submit1', 'submit2', 'submit3', 'submit4', 'submit5', 'submit6', 'submit7', 'submit8'].includes(popup.action) ? 'success' : popup.action === 'draft' ? 'warning' : 'error'}
        iconColor={['submit1', 'submit2', 'submit3', 'submit4', 'submit5', 'submit6', 'submit7', 'submit8'].includes(popup.action) ? 'green' : popup.action === 'draft' ? 'orange' : 'red'}
        confirmButtonColor={['submit1', 'submit2', 'submit3', 'submit4', 'submit5', 'submit6', 'submit7', 'submit8'].includes(popup.action) ? 'success' : popup.action === 'draft' ? 'warning' : 'error'}
      />

      {/* <ConfirmationPopup
        open={popup.open}
        onClose={handleCloseConfirmationPopup}
        onConfirm={handleConfirm}
        title={
          popup.action === "submit"
            ? "Are you sure? Do you want to Submit?"
            : popup.action === "draft"
              ? "Are you sure? Do you want to save as Draft?"
              : "Are you sure? Do you want to Cancel?"
        }
        description={
          popup.action === "submit"
            ? "This action will finalize and submit your data."
            : popup.action === "draft"
              ? "This action will save your progress as a draft."
              : "This action will cancel your progress."
        }
        confirmButtonText={
          popup.action === "submit"
            ? "Submit"
            : popup.action === "draft"
              ? "Save Draft"
              : "Yes"
        }
        cancelButtonText="No"
        icon={
          popup.action === "submit"
            ? "success"
            : popup.action === "draft"
              ? "warning"
              : "error"
        }
        iconColor={
          popup.action === "submit"
            ? "green"
            : popup.action === "draft"
              ? "orange"
              : "red"
        }
        confirmButtonColor={
          popup.action === "submit"
            ? "success"
            : popup.action === "draft"
              ? "warning"
              : "error"
        }
      /> */}
    </div>
  );
}

export default MultistepForm;
