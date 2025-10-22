import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Box,
  Typography,
  DialogTitle,
  OutlinedInput,
  TableBody,
  TableRow,
  TableCell,
  Select,
  Paper,
  MenuItem,
  Dialog,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
  Table,
  TableHead,
  TableContainer,
  Button,
  List,
  ListItem,
  ListItemText,
  Popover,
  Checkbox,
  TextField,
  IconButton,
} from '@mui/material';
import { userStyle, colourStyles } from '../../../pageStyle';
import { FaFileCsv, FaFileExcel, FaPrint, FaFilePdf } from 'react-icons/fa';
import { StyledTableRow, StyledTableCell } from '../../../components/Table';
import jsPDF from 'jspdf';
import { LinearProgress } from '@mui/material';
import PinIcon from '@mui/icons-material/Pin';
import FormControlLabel from '@mui/material/FormControlLabel';
import 'jspdf-autotable';
import axios from 'axios';
import Selects from 'react-select';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import html2pdf from 'html2pdf.js';
import { ThreeDots } from 'react-loader-spinner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { SERVICE } from '../../../services/Baseservice';
import { handleApiError } from '../../../components/Errorhandling';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import moment from 'moment-timezone';
import { useReactToPrint } from 'react-to-print';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { UserRoleAccessContext } from '../../../context/Appcontext';
import { AuthContext } from '../../../context/Appcontext';
import Headtitle from '../../../components/Headtitle';
import Switch from '@mui/material/Switch';
import CloseIcon from '@mui/icons-material/Close';
import html2canvas from 'html2canvas';
import ImageIcon from '@mui/icons-material/Image';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';
import LoadingButton from '@mui/lab/LoadingButton';
import { BASE_URL } from '../../../services/Authservice';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Backdrop from '@mui/material/Backdrop';
import { MultiSelect } from 'react-multi-select-component';
import CircularProgress from '@mui/material/CircularProgress';
import DOMPurify from 'dompurify';
import PageHeading from '../../../components/PageHeading';
import AlertDialog from '../../../components/Alert';
import ExportData from '../../../components/ExportData';
import InfoPopup from '../../../components/InfoPopup.js';
import MessageAlert from '../../../components/MessageAlert';
import AggregatedSearchBar from '../../../components/AggregatedSearchBar';
import AggridTable from '../../../components/AggridTable';
import domtoimage from 'dom-to-image';
import ReactQuillAdvanced from '../../../components/ReactQuillAdvanced.js';
import { getCurrentServerTime } from '../../../components/getCurrentServerTime';
const progressDialogStyles = {
  dialogPaper: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e0e0',
  },
  dialogTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e3a8a', // Deep Blue
  },
  checkingText: {
    fontSize: '18px',
    marginBottom: '12px',
    color: '#334155', // Slate-700
  },
  highlightText: {
    fontWeight: '600',
    color: '#2563eb', // Blue-600
  },
  progressBarContainer: {
    background: '#f1f5f9', // Light Slate
    borderRadius: '8px',
    padding: '5px',
    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
    marginTop: '10px',
  },
  progressBar: {
    height: '16px',
    borderRadius: '8px',
    background: 'linear-gradient(to right, #3b82f6, #60a5fa)',
  },
  percentageText: {
    fontSize: '16px',
    marginTop: '10px',
    color: '#475569', // Slate-600
    fontWeight: 'bold',
  },
  startButton: {
    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
    border: 'none',
    padding: '12px 24px',
    fontSize: '16px',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    boxShadow: '0px 2px 10px rgba(59, 130, 246, 0.3)',
  },
};

const Loader = ({ loading, message }) => {
  return (
    <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
      <div style={{ textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#edf1f7' }} />
        <Typography variant="h6" sx={{ mt: 2, color: '#edf1f7' }}>
          {message}
        </Typography>
      </div>
    </Backdrop>
  );
};

function DocumentPreparation() {
  const monthstring = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const hiddenRef = useRef(null);
  const [serverTime, setServerTime] = useState(new Date());
  useEffect(() => {
    const fetchTime = async () => {
      try {
        // Get current server time and format it
        const time = await getCurrentServerTime();
        setServerTime(time);
        setSelectMonthName(moment(time).format('MMMM'));
        setSelectedYear(moment(time).year());
      } catch (error) {
        console.error('Failed to fetch server time:', error);
      }
    };

    fetchTime();
  }, []);

  const [qrCodeInfoDetails, setQrCodeInfoDetails] = useState([]);
  const [selectedMargin, setSelectedMargin] = useState('normal');
  const [pageSizeQuill, setPageSizeQuill] = useState('A4');
  const [pageOrientation, setPageOrientation] = useState('portrait');
  const [selectedMarginEdit, setSelectedMarginEdit] = useState('normal');
  const [pageSizeQuillEdit, setPageSizeQuillEdit] = useState('A4');
  const [pageOrientationEdit, setPageOrientationEdit] = useState('portrait');

  const marginValues = {
    normal: [96, 96, 96, 96],
    narrow: [48, 48, 48, 48],
    moderate: [96, 72, 96, 72],
    wide: [96, 192, 96, 192],
    mirrored: [96, 120, 96, 96],
    office2003: [96, 120, 96, 120],
  };
  const pxToMm = (px) => px * 0.264583;
  const convertPxArrayToMm = (arr) => arr.map(pxToMm);
  const getAdjustedMargin = (selectedMargin, headImage, footImage) => {
    const base = marginValues[selectedMargin] || marginValues['narrow'];
    let [top, right, bottom, left] = base;
    const footerReservedSpace = 60;

    top += selectedMargin === 'narrow' ? 80 : 35; // increase space for header image
    bottom += selectedMargin === 'narrow' ? 80 : 35; // increase space for footer image

    return convertPxArrayToMm([top, right, (bottom + footerReservedSpace), left]);
  };
  const getPageDimensions = () => {
    const dimensions = {
      A2: { portrait: [420, 594], landscape: [594, 420] },
      A3: { portrait: [297, 420], landscape: [420, 297] },
      A4: { portrait: [210, 297], landscape: [297, 210] },
      A5: { portrait: [148, 210], landscape: [210, 148] },
      Letter: { portrait: [215.9, 279.4], landscape: [279.4, 215.9] },
      Legal: { portrait: [215.9, 355.6], landscape: [355.6, 215.9] },
      Tabloid: { portrait: [279.4, 431.8], landscape: [431.8, 279.4] },
      Executive: { portrait: [184.1, 266.7], landscape: [266.7, 184.1] },
      B4: { portrait: [250, 353], landscape: [353, 250] },
      B5: { portrait: [176, 250], landscape: [250, 176] },
      Statement: { portrait: [139.7, 215.9], landscape: [215.9, 139.7] },
      Office2003: { portrait: [215.9, 279.4], landscape: [279.4, 215.9] }, // same as Letter
    };

    return dimensions[pageSize]?.[pageOrientation] || [210, 297]; // default A4
  };
  const getPageDimensionsTable = (pagesize, pageorientation) => {
    const dimensions = {
      A2: { portrait: [420, 594], landscape: [594, 420] },
      A3: { portrait: [297, 420], landscape: [420, 297] },
      A4: { portrait: [210, 297], landscape: [297, 210] },
      A5: { portrait: [148, 210], landscape: [210, 148] },
      Letter: { portrait: [215.9, 279.4], landscape: [279.4, 215.9] },
      Legal: { portrait: [215.9, 355.6], landscape: [355.6, 215.9] },
      Tabloid: { portrait: [279.4, 431.8], landscape: [431.8, 279.4] },
      Executive: { portrait: [184.1, 266.7], landscape: [266.7, 184.1] },
      B4: { portrait: [250, 353], landscape: [353, 250] },
      B5: { portrait: [176, 250], landscape: [250, 176] },
      Statement: { portrait: [139.7, 215.9], landscape: [215.9, 139.7] },
      Office2003: { portrait: [215.9, 279.4], landscape: [279.4, 215.9] }, // same as Letter
    };

    return dimensions[pagesize]?.[pageorientation] || [210, 297]; // default A4
  };

  const [progressValue, setProgressValue] = useState(0); // Progress state
  const [progressOpen, setProgressOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState('');
  const [searchedString, setSearchedString] = useState('');
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const [isHandleChange, setIsHandleChange] = useState(false);
  const gridRefTable = useRef(null);
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState('');
  const [popupSeverityMalert, setPopupSeverityMalert] = useState('');
  const [headvalueAdd, setHeadValueAdd] = useState([]);
  const [selectedHeadOptAdd, setSelectedHeadOptAdd] = useState([]);
  const [employeeModeOptions, setEmployeeModeOptions] = useState([]);
  const [HeaderOptionsButton, setHeaderOptionsButton] = useState(false);

  const fetchDesigDepartBasedOnDate = async (selecteddate, person) => {
    try {
      const response = await axios.post(SERVICE.DEPARTMENT_DESIGNATION_BASED_ON_DATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        date: selecteddate,
        usernames: person
      });
      return response?.data?.finalresult ?? ""
      console.log(response?.data, "259 - document Preparation")
    }
    catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  }

  const handleEmployeeModeOptions = (e) => {
    const employeeModeOpt =
      e?.employeemode?.length > 0
        ? [
          ...e?.employeemode?.map((data) => ({
            label: data,
            value: data,
          })),
          { label: 'Manual', value: 'Manual' },
        ]
        : [{ label: 'Manual', value: 'Manual' }];
    setEmployeeModeOptions(employeeModeOpt);
  };
  const handleHeadChangeAdd = (options) => {
    let value = options.map((a) => {
      return a.value;
    });

    if (value?.length === 1 && value?.includes('With Head content')) {
      setDocumentPrepartion((prevArray) => ({
        ...prevArray,
        head: personId?.letterheadcontentheader[0]?.preview,
        foot: '',
      }));
      setHeader(personId?.letterheadcontentheader[0]?.preview);
    } else if (value?.length === 1 && value?.includes('With Footer content')) {
      setfooter(personId?.letterheadcontentfooter[0]?.preview);

      setDocumentPrepartion((prevArray) => ({
        ...prevArray,
        head: '',
        foot: personId?.letterheadcontentfooter[0]?.preview,
      }));
    } else if (value?.length > 1) {
      setDocumentPrepartion((prevArray) => ({
        ...prevArray,
        head: personId?.letterheadcontentheader[0]?.preview,
        foot: personId?.letterheadcontentfooter[0]?.preview,
      }));
      setHeader(personId?.letterheadcontentheader[0]?.preview);
      setfooter(personId?.letterheadcontentfooter[0]?.preview);
    } else {
      setHeader('');
      setfooter('');
      setDocumentPrepartion((prevArray) => ({
        ...prevArray,
        head: '',
        foot: '',
      }));
    }
    setHeadValueAdd(value);
    setSelectedHeadOptAdd(options);
  };
  const customValueRenderHeadFromAdd = (valueCate) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please Select Letter Head';
  };
  // letter headd options
  const HeaderDropDowns = [
    { label: 'With Letter Head', value: 'With Letter Head' },
    { label: 'Without Letter Head', value: 'Without Letter Head' },
  ];
  const WithHeaderOptions = [
    { value: 'With Head content', label: 'With Head content' },
    { value: 'With Footer content', label: 'With Footer content' },
  ];
  const [isOpenLetterHeadPopup, setIsLetterHeadPopup] = useState(false);
  const [headerOptions, setHeaderOptions] = useState('Please Select Print Options');
  const [pagePopeOpen, setPagePopUpOpen] = useState('');
  const [DataTableId, setDataTableId] = useState('');
  const [selectedHeadOpt, setSelectedHeadOpt] = useState([]);
  const [headvalue, setHeadValue] = useState([]);
  const [emailValuePage, setEmailValuePage] = useState({});
  const handleHeadChange = async (options) => {
    let value = options.map((a) => {
      return a.value;
    });
    setHeadValue(value);
    if (!['Preview Manual', 'Print Manual']?.includes(pagePopeOpen)) {
      if (value?.length === 1 && value?.includes('With Head content')) {
        setCheckingArray((prevArray) =>
          prevArray.map((item, ind) =>
            ind === indexViewQuest - 1
              ? {
                ...item,
                header: personId?.letterheadcontentheader[0]?.preview,
                //  footer: personId?.letterheadcontentfooter[0]?.preview
              }
              : item
          )
        );
        setHeader(personId?.letterheadcontentheader[0]?.preview);
      } else if (value?.length === 1 && value?.includes('With Footer content')) {
        setfooter(personId?.letterheadcontentfooter[0]?.preview);
        setCheckingArray((prevArray) =>
          prevArray.map((item, ind) =>
            ind === indexViewQuest - 1
              ? {
                ...item,
                // header: personId?.letterheadcontentheader[0]?.preview,
                footer: personId?.letterheadcontentfooter[0]?.preview,
              }
              : item
          )
        );
      } else if (value?.length > 1) {
        setCheckingArray((prevArray) =>
          prevArray.map((item, ind) =>
            ind === indexViewQuest - 1
              ? {
                ...item,
                header: personId?.letterheadcontentheader[0]?.preview,
                footer: personId?.letterheadcontentfooter[0]?.preview,
              }
              : item
          )
        );
        setHeader(personId?.letterheadcontentheader[0]?.preview);
        setfooter(personId?.letterheadcontentfooter[0]?.preview);
      } else {
        setHeader('');
        setfooter('');
        setCheckingArray((prevArray) =>
          prevArray.map((item, ind) =>
            ind === indexViewQuest - 1
              ? {
                ...item,
                header: '',
                footer: '',
              }
              : item
          )
        );
      }
    } else if (['Preview Manual', 'Print Manual']?.includes(pagePopeOpen)) {
      let res = await axios.post(SERVICE.FILTERTEMPLATECONTROLPANEL, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: documentPrepartion?.company,
        branch: documentPrepartion?.branch,
      });
      const ans = res?.data?.templatecontrolpanel ? res?.data?.templatecontrolpanel?.templatecontrolpanellog[res?.data?.templatecontrolpanel?.templatecontrolpanellog?.length - 1] : '';
      if (value?.length === 1 && value?.includes('With Head content')) {
        setHeader(ans?.letterheadcontentheader[0]?.preview);
      } else if (value?.length === 1 && value?.includes('With Footer content')) {
        setfooter(ans?.letterheadcontentfooter[0]?.preview);
      } else if (value?.length > 1) {
        setHeader(ans?.letterheadcontentheader[0]?.preview);
        setfooter(ans?.letterheadcontentfooter[0]?.preview);
      } else {
        setHeader('');
        setfooter('');
        setCheckingArray((prevArray) =>
          prevArray.map((item, ind) =>
            ind === indexViewQuest - 1
              ? {
                ...item,
                header: '',
                footer: '',
              }
              : item
          )
        );
      }
    }

    setSelectedHeadOpt(options);
  };
  const customValueRenderHeadFrom = (valueCate) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please Select Letter Head';
  };

  const handleClickOpenLetterHeader = (page) => {
    setPagePopUpOpen(page);
    setIsLetterHeadPopup(true);
    handleCloseBulkModcheckbox();
  };

  const handleClickCloseLetterHead = () => {
    setIsLetterHeadPopup(false);
    setHeaderOptions('Please Select Print Options');
    setHeadValue([]);
    setPagePopUpOpen('');
    // setHeader("");
    // setfooter("")
    // setCheckingArray((prevArray) =>
    //   prevArray.map((item, ind) =>
    //     ind === (indexViewQuest - 1) ? {
    //       ...item,
    //       header: "",
    //       footer: ""
    //     } : item
    //   )
    // );
    setSelectedHeadOpt([]);
  };

  const handleClickOpenPopupMalert = () => {
    // setSubmitLoader(false);
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
  const [indexViewQuest, setIndexViewQuest] = useState(1);
  const [checking, setChecking] = useState('');
  const [checkingArray, setCheckingArray] = useState([]);
  const [monthSets, setMonthsets] = useState([]);
  const [selectedModeType, setSelectedModeType] = useState('DOJ');
  const [selectmonthname, setSelectMonthName] = useState('');
  const handleModeTypeChange = (event) => {
    setSelectedModeType(event.value);
  };
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const currentDateAttStatus = new Date(serverTime);
  const currentYearAttStatus = currentDateAttStatus.getFullYear();
  const years = Array.from(new Array(10), (val, index) => currentYearAttStatus - index);
  const getyear = years.map((year) => {
    return { value: year, label: year };
  });
  const [selectedMonthNum, setSelectedMonthNum] = useState(0);
  const currentMonth = new Date(serverTime).getMonth();
  const currentYear = new Date(serverTime).getFullYear();
  const [attendanceDateStatus, setAttendanceDateStatus] = useState('');
  const [attendanceMonthStatus, setAttendanceMonthStatus] = useState('');
  const [productionDateStatus, setProductionDateStatus] = useState('');
  const [productionMonthStatus, setProductionMonthStatus] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [qrCodeNeed, setQrCodeNeed] = useState(false);
  const [AttendanceNeed, setAttendanceNeed] = useState(false);
  const [DocumentNeed, setDocumentNeed] = useState(false);
  const [ProductionNeed, setProductionNeed] = useState(false);
  const [SalaryNeed, setSalaryNeed] = useState(false);

  const [otp, setOtp] = useState('');
  const [documentID, setDocumentID] = useState('');
  const [openOTPView, setOpenOTPView] = useState(false);
  const [error, setError] = useState('');
  const handleViewOpenOTP = () => {
    setOpenOTPView(true);
  };
  const handlViewCloseOTP = () => {
    setOpenOTPView(false);
    setOtp('');
    setError('');
  };

  const verifyOtp = async () => {
    try {
      if (otp != '') {
        let response = await axios.post(`${SERVICE.VERIFYTWOFA_EMPLOYEEAPPROVAL}`, {
          otp: String(otp),
          companyname: isUserRoleAccess.companyname,
        });
        if (response?.data?.success == true) {
          handlViewCloseOTP();
          getViewFile(documentID?.id);
        }
        setError('');
      } else {
        setError('Please Enter OTP');
      }
    } catch (err) {
      if (!err?.response?.data?.success) {
        setError(err?.response?.data?.message);
      }
      console.log(err, 'err');
    }
  };

  const handleMonthChangeAttendance = (selectedMonth) => {
    const selectedMonthIndex = months.findIndex((month) => month.value === selectedMonth.value);
    let updatedYears = getyear;
    setChecking('');

    setProductionDateStatus('');
    setAttendanceDateStatus('');
    setProductionMonthStatus('');
    setChecking('');
    if (selectedMonthIndex > currentMonth) {
      updatedYears = getyear.filter((year) => year.value < currentYear);
    }
    setDocumentPrepartion({
      ...documentPrepartion,
      attendancemonth: selectedMonth.value,
      attendanceyear: selectedMonthIndex > currentMonth ? 'Please Select Attendance Year' : 'Please Select Attendance Year',
      signature: 'Please Select Signature',
      seal: 'Please Select Seal',
    });

    setAvailableYearsAttendance(updatedYears);
  };

  const handleYearChangeSalary = (event) => {
    setSelectedYear(event.value);
  };

  const handleMonthChangeSalary = (event) => {
    setSelectedMonth(event.value);
    setSelectMonthName(event.label);
  };

  let newvalReference = `DP000${checkingArray?.length > 0 ? checkingArray?.length + 1 : 1}`;
  const handleYearChangeAttendance = (selectedYear) => {
    setChecking('');
    setProductionDateStatus('');
    setAttendanceDateStatus('');
    setProductionMonthStatus('');
    setDocumentPrepartion({
      ...documentPrepartion,
      attendanceyear: selectedYear.value,
      signature: 'Please Select Signature',
      seal: 'Please Select Seal',
    });
    // fetchAttendanceMonthStatus(employeeControlPanel, documentPrepartion.monthchoosen, selectedYear.value);
  };

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
      pagename: String('Human Resource/HR Documents/Employee Document Preparation'),
      commonid: String(isUserRoleAccess?._id),
      date: String(new Date(serverTime)),

      addedby: [
        {
          name: String(isUserRoleAccess?.username),
        },
      ],
    });
  };

  const handleMonthChangeProduction = (selectedMonth) => {
    const selectedMonthIndex = months.findIndex((month) => month.value === selectedMonth.value);
    let updatedYears = getyear;
    setChecking('');
    setProductionDateStatus('');
    setAttendanceDateStatus('');
    setAttendanceMonthStatus('');
    setProductionMonthStatus('');
    if (selectedMonthIndex > currentMonth) {
      updatedYears = getyear.filter((year) => year.value < currentYear);
    }
    setSelectedMonth(selectedMonth.value);
    setSelectedMonthNum(Number(selectedMonth.ansvalue));
    setDocumentPrepartion({
      ...documentPrepartion,
      productionmonth: selectedMonth.value,
      productionyear: selectedMonthIndex > currentMonth ? 'Please Select Production Year' : 'Please Select Production Year',
      signature: 'Please Select Signature',
      seal: 'Please Select Seal',
    });

    setAvailableYearsProduction(updatedYears);
  };
  const handleYearChangeProduction = (selectedYear) => {
    setChecking('');
    setProductionDateStatus('');
    setAttendanceDateStatus('');
    setAttendanceMonthStatus('');
    setDocumentPrepartion({
      ...documentPrepartion,
      productionyear: selectedYear.value,
      signature: 'Please Select Signature',
      seal: 'Please Select Seal',
    });
    // fetchDepartmentMonthsets(selectedYear.value);
    setSelectedYear(selectedYear.value);
  };
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // const [selectmonthname, setSelectMonthName] = useState(currentMonths);

  const fetchDepartmentMonthsets = async (year) => {
    setPageName(!pageName);
    try {
      let res_employee = await axios.post(SERVICE.DEPTMONTHSET_LIMITED, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        monthname: documentPrepartion?.productionmonth,
        year: year,
      });

      setMonthsets(res_employee.data.departmentdetails);
      return await fetchProductionMonthStatus(employeeControlPanel, documentPrepartion?.productionmonth, year, res_employee.data.departmentdetails);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchProductionMonthStatus = async (person, month, year, monthset) => {
    const ans = months?.findIndex((data) => data?.value === month);
    let prodFilter = await axios.post(SERVICE.DAY_POINTS_MONTH_YEAR_FILTER, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      ismonth: Number(selectedMonthNum),
      isyear: Number(year),
    });

    const nextMonthFirstDay = new Date(Number(selectedYear), Number(selectedMonthNum), 1);

    // Subtract one day to get the last day of the given month
    const lastDate = new Date(nextMonthFirstDay - 1);
    let lastdateOfSelectedMonth = lastDate.getDate();
    let selectedmonthnumalter = Number(selectedMonthNum) <= 9 ? `0${Number(selectedMonthNum)}` : selectedMonthNum;

    let selectedMonStartDate = selectedYear + '-' + selectedmonthnumalter + '-01';
    let dayPointsUser = prodFilter.data.answer?.filter((data) => data?.name === person.value);
    let findexp = monthset.find((d) => d?.department === person?.department);
    let findDate = findexp ? findexp.fromdate : selectedMonStartDate;

    let getdayPointsMonth = dayPointsUser
      .filter((d) => d.date >= findDate && d.date <= (findexp ? findexp.todate : lastdateOfSelectedMonth))
      .reduce((acc, current) => {
        const existingItemIndex = acc.findIndex((item) => item.name === current.name && item.companyname === current.companyname && item.branch === current.branch && item.unit === current.unit && item.team === current.team && item.empcode === current.empcode);

        if (existingItemIndex !== -1) {
          // Update existing item
          const existingItem = acc[existingItemIndex];

          existingItem.point += Number(current.point);
          // existingItem.daypoint += Number(current.daypoint);
          existingItem.target += Number(current.target);
          existingItem.date.push(current.date);

          existingItem.allowancepoint += Number(current.allowancepoint);
          if (current.allowancepoint > 1) {
            existingItem.noallowancepoint++; // Increment count only if allowancepoint is present
          }

          existingItem.avgpoint = (existingItem.point / existingItem.target) * 100;

          // Convert the dates array to Date objects
          const dateObjects = existingItem.date.map((date) => new Date(date));

          // Find the earliest (from) and latest (to) dates
          const fromDate = new Date(Math.min(...dateObjects));
          const toDate = new Date(Math.max(...dateObjects));
          // Update start and end date
          existingItem.startDate = fromDate;
          existingItem.endDate = toDate;
        } else {
          // Add new item
          acc.push({
            companyname: current.companyname,
            name: current.name,
            // daypoint: Number(current.daypoint),
            avgpoint: (Number(current.point) / Number(current.target)) * 100,
            point: Number(current.point),
            target: Number(current.target),
            // _id: current.id,
            branch: current.branch,
            date: [current.date],
            unit: current.unit,
            team: current.team,
            empcode: current.empcode,
            // doj: current.doj,
            // department: current.department,
            // prod: current.prod,
            startDate: current.date,
            endDate: current.date,
            allowancepoint: Number(current.allowancepoint),
            // noallowancepoint:Number(current.noallowancepoint),
            noallowancepoint: current.allowancepoint > 0 ? 1 : 0,
          });
        }
        return acc;
      }, []);

    const answer = getdayPointsMonth?.length > 0 ? getdayPointsMonth[0] : '';
    // console.log(answer, "Answer")
    setProductionMonthStatus(answer);
    return answer;
  };

  {
    /* <CheckingProps person={person} month={month} year={year}/> */
  }

  const [availableYearsAttendance, setAvailableYearsAttendance] = useState(getyear);
  const [availableYearsProduction, setAvailableYearsProduction] = useState(getyear);
  const [availableYearsSalary, setAvailableYearsSalary] = useState(getyear);
  //  const navigate = useNavigate();
  const generateRedirectUrl = () => {
    return `${BASE_URL}/hrdocuments/templatecreation?data=${encodeURIComponent('Rahul')}`;
  };
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Please Wait...!');
  const [loadingAttMonth, setLoadingAttMonth] = useState(false);
  const [loadingMessageAttMonth, setLoadingMessageAttMonth] = useState('Fetching Attendance Month Status...!');
  const [loadingAttDate, setLoadingAttDate] = useState(false);
  const [loadingMessageAttDate, setLoadingMessageAttDate] = useState('Fetching Attendance Date Status...!');
  const [loadingProdDate, setLoadingProdDate] = useState(false);
  const [loadingMessageProdDate, setLoadingMessageProdDate] = useState('Fetching Production Date Status...!');
  const [loadingProdMonth, setLoadingProdMonth] = useState(false);
  const [loadingPreviewData, setLoadingPreviewData] = useState(false);
  const [loadingPreviewManualData, setLoadingPreviewManualData] = useState(false);
  const [loadingMessageProdMonth, setLoadingMessageProdMonth] = useState('Fetching Production Month Status...!');
  const [loadingPreviewMessage, setLoadingPreviewMessage] = useState('Setting up a document for preview...!');
  const [loadingPrintData, setLoadingPrintData] = useState(false);
  const [loadingPrintManualData, setLoadingPrintManualData] = useState(false);
  const [loadingPrintMessage, setLoadingPrintMessage] = useState('Preparing an Document to Print...!');
  const [loadingGeneratingDatas, setLoadingGeneratingDatas] = useState(false);
  const [loadingGeneratingMessages, setLoadingGeneratingMessage] = useState('Generating the set of Documents...!');
  const [savingDatasMessage, setSavingDatasMessage] = useState('Generating the set of Documents for Saving...!');
  const [savingDatas, setSavingDatas] = useState(false);

  let today = new Date(serverTime);
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  let formattedDate = yyyy + '-' + mm + '-' + dd;
  //useStates
  const [date, setDate] = useState(formattedDate);
  const gridRef = useRef(null);
  // let newvalues = "DOC0001";
  const [DateFormat, setDateFormat] = useState();
  const [attModearr, setAttModearr] = useState([]);
  const [attStatusOption, setAttStatusOption] = useState([]);
  const [DateFormatEdit, setDateFormatEdit] = useState();
  const [autoId, setAutoId] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState('');
  const [Changed, setChanged] = useState('');
  const [documentPreparationEdit, setDocumentPreparationEdit] = useState([]);
  const [templateCreationArray, setTemplateCreationArray] = useState([]);
  const [noticePeriodEmpCheck, setNoticePeriodEmpCheck] = useState(false);
  const [noticePeriodEmpCheckPerson, setNoticePeriodEmpCheckPerson] = useState(false);
  const [noticePeriodEmpCheckPersonEdit, setNoticePeriodEmpCheckPersonEdit] = useState(false);
  const [noticePeriodEmpCheckEdit, setNoticePeriodEmpCheckEdit] = useState(false);
  const [updateGen, setUpdateGen] = useState(true);
  const [bulkPrintStatus, setBulkPrintStatus] = useState(false);
  const [templateCreationArrayCreate, setTemplateCreationArrayCreate] = useState([]);
  const [templateCreationArrayEdit, setTemplateCreationArrayEdit] = useState([]);
  const { isUserRoleCompare, isUserRoleAccess, pageName, setPageName, buttonStyles, isAssignBranch } = useContext(UserRoleAccessContext);

  const { auth } = useContext(AuthContext);
  const [loader, setLoader] = useState(false);
  const [btnload, setBtnLoad] = useState(false);
  const [btnloadSave, setBtnLoadSave] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [buttonLoadingPreview, setButtonLoadingPreview] = useState(false);
  const [buttonLoadingEdit, setButtonLoadingEdit] = useState(false);
  const [attStatus, setAttStatus] = useState([]);
  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageSizePdf, setPageSizepdf] = useState('');
  const [pageSizePdfEdit, setPageSizePdfEdit] = useState('');
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const [openview, setOpenview] = useState(false);
  const [openInfo, setOpeninfo] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [excel, setExcel] = useState([]);
  const [deleteTemplate, setDeleteTemplate] = useState({});
  const [cateCode, setCatCode] = useState([]);
  const [templateCreationDataEdit, setTemplateCreationDataEdit] = useState([]);
  const [cateCodeValue, setCatCodeValue] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [sortingStatus, setSortingStatus] = useState('');
  const [documentPrepartion, setDocumentPrepartion] = useState({
    date: '',
    template: 'Please Select Template Name',
    referenceno: '',
    documentname: '',
    templateno: '',
    pagenumberneed: 'All Pages',
    signatureneed: 'No Need',
    qrcodevalue: 'All Pages',
    employeemode: 'Please Select Employee Mode',
    department: 'Please Select Department',
    company: 'Please Select Company',
    reason: 'Document',
    issuingauthority: 'Please Select Issuing Authority',
    branch: 'Please Select Branch',
    month: 'Please Select Month',
    attendancesort: 'Please Select Attendance Sort',
    productionsort: 'Please Select Production Sort',
    salarysort: 'Please Select Salary Sort',
    attendancedate: '',
    productiondate: '',
    attendancemonth: 'Please Select Attendance Month',
    productionmonth: 'Please Select Production Month',
    attendanceyear: 'Please Select Attendance Year',
    productionyear: 'Please Select Production Year',
    unit: 'Please Select Unit',
    team: 'Please Select Team',
    person: 'Please Select Person',
    proption: 'Please Select Print Option',
    pagesize: 'Please Select pagesize',
    print: 'Please Select Print Option',
    heading: 'Please Select Header Option',
    signature: 'Please Select Signature',
    seal: 'Please Select Seal',
    issuedpersondetails: '',
    manualdate: formattedDate,
    documentneed: 'Print Document',
    printoptions: 'Please Select Print Options',
  });

  const TypeModeOptions = [
    { value: 'DOJ', label: 'DOJ' },
    { value: 'Month Based', label: 'Month Based' },
  ];
  const months = [
    { value: 'January', label: 'January', ansvalue: '01' },
    { value: 'February', label: 'February', ansvalue: '02' },
    { value: 'March', label: 'March', ansvalue: '03' },
    { value: 'April', label: 'April', ansvalue: '04' },
    { value: 'May', label: 'May', ansvalue: '05' },
    { value: 'June', label: 'June', ansvalue: '06' },
    { value: 'July', label: 'July', ansvalue: '07' },
    { value: 'August', label: 'August', ansvalue: '08' },
    { value: 'September', label: 'September', ansvalue: '09' },
    { value: 'October', label: 'October', ansvalue: '10' },
    { value: 'November', label: 'November', ansvalue: '11' },
    { value: 'December', label: 'December', ansvalue: '12' },
  ];
  const [items, setItems] = useState([]);
  //  const [employees, setEmployees] = useState([]);
  const [departmentCheck, setDepartmentCheck] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedData, setCopiedData] = useState('');
  const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [agendaEdit, setAgendaEdit] = useState('');
  const [head, setHeader] = useState('');
  const [foot, setfooter] = useState('');
  const [signature, setSignature] = useState('');
  const [signatureContent, setSignatureContent] = useState('');
  const [signatureStatus, setSignatureStatus] = useState('');
  const [sealStatus, setSealStatus] = useState('');
  const [signatureStatusEdit, setSignatureStatusEdit] = useState('');
  const [sealStatusEdit, setSealStatusEdit] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sealPlacement, setSealPlacement] = useState('');
  const [waterMarkText, setWaterMarkText] = useState('');
  const [signatureEdit, setSignatureEdit] = useState('');
  const [companyNameEdit, setCompanyNameEdit] = useState('');
  const [sealPlacementEdit, setSealPlacementEdit] = useState('');
  const [waterMarkTextEdit, setWaterMarkTextEdit] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  // const [openPopup, setOpenPopup] = useState(false);

  const [overallExcelDatas, setOverallExcelDatas] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
  const [fileFormat, setFormat] = useState('');
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = fileFormat === 'xl' ? '.xlsx' : '.csv';
  const exportToCSV = (csvData, fileName) => {
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  const [isInfoOpenImage, setInfoOpenImage] = useState(false);
  const [previewManual, setPreviewManual] = useState(false);
  const [isInfoOpenImageManual, setInfoOpenImageManual] = useState(false);
  const [isInfoOpenImagePrint, setInfoOpenImagePrint] = useState(false);
  const [isInfoOpenImagePrintManual, setInfoOpenImagePrintManual] = useState(false);

  const handleClickOpenInfoImage = () => {
    setInfoOpenImage(true);
  };
  const handleCloseInfoImage = () => {
    setInfoOpenImage(false);
  };
  const handleClickOpenInfoImageManual = () => {
    setInfoOpenImageManual(true);
  };
  const handleCloseInfoImageManual = () => {
    setInfoOpenImageManual(false);
  };
  const handleClickOpenInfoImagePrint = () => {
    setInfoOpenImagePrint(true);
  };
  const handleCloseInfoImagePrint = () => {
    setInfoOpenImagePrint(false);
    setButtonLoading(false);
    setLoadingPrintData(false);
  };
  const handleOpenPreviewManual = () => {
    setPreviewManual(true);
  };
  const handleClosePreviewManual = () => {
    setPreviewManual(false);
  };
  const handleClickOpenInfoImagePrintManual = () => {
    setInfoOpenImagePrintManual(true);
  };
  const handleCloseInfoImagePrintManual = () => {
    setInfoOpenImagePrintManual(false);
  };

  const [openDialogManual, setOpenDialogManual] = useState(false);
  const handleClickOpenManualCheck = () => {
    setOpenDialogManual(true);
  };
  const handleCloseManualCheck = () => {
    setOpenDialogManual(false);
  };
  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };

  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };

  // AssignBranch For Users
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

  let exportColumnNames = ['Date ', 'Reference No', 'Template No', 'Template', 'EmployeeMode', 'Department', 'Company', 'Branch', 'Unit', 'Team', 'Person', 'Printing Status', 'Issued Person Details', 'Issuing Authority'];
  let exportRowValues = ['date', 'referenceno', 'templateno', 'template', 'employeemode', 'department', 'company', 'branch', 'unit', 'team', 'person', 'printingstatus', 'issuedpersondetails', 'issuingauthority'];

  const [headEdit, setHeaderEdit] = useState('');
  const [footEdit, setfooterEdit] = useState('');

  function encryptString(str) {
    if (str) {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const shift = 3; // You can adjust the shift value as per your requirement
      let encrypted = '';
      for (let i = 0; i < str.length; i++) {
        let charIndex = characters.indexOf(str[i]);
        if (charIndex === -1) {
          // If character is not found, add it directly to the encrypted string
          encrypted += str[i];
        } else {
          // Shift the character index
          charIndex = (charIndex + shift) % characters.length;
          encrypted += characters[charIndex];
        }
      }
      return encrypted;
    } else {
      return '';
    }
  }

  // const employeeModeOptions = [
  //   { value: "Current List", label: "Current List" },
  //   { value: "Absconded", label: "Absconded" },
  //   { value: "Releave Employee", label: "Releave Employee" },
  //   { value: "Hold", label: "Hold" },
  //   { value: "Terminate", label: "Terminate" },
  //   { value: "Postponed", label: "Postponed" },
  //   { value: "Rejected", label: "Rejected" },
  //   { value: "Closed", label: "Closed" },
  //   { value: "Not Joined", label: "Not Joined" },
  //   { value: "Manual", label: "Manual" },
  // ];

  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    date: true,
    referenceno: true,
    templateno: true,
    template: true,
    employeemode: true,
    department: true,
    company: true,
    printingstatus: true,
    branch: true,
    unit: true,
    team: true,
    person: true,
    head: true,
    foot: true,
    headvaluetext: true,
    email: true,
    document: true,
    issuedpersondetails: true,
    issuingauthority: true,
    actions: true,
    approval: true,
    printoptions: true,
    printupdation: true,
  };
  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  useEffect(() => {
    addSerialNumber(templateCreationArrayCreate);
  }, [templateCreationArrayCreate]);

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, []);

  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
  };
  // Error Popup model
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
    setBtnLoad(false);
    setBtnLoadSave(false);
  };
  // view model
  const handleClickOpenview = () => {
    setOpenview(true);
  };
  const handleCloseview = () => {
    setOpenview(false);
    setAgendaEdit('');
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };
  // info model
  const handleClickOpeninfo = () => {
    setOpeninfo(true);
  };
  const handleCloseinfo = () => {
    setOpeninfo(false);
  };
  //Delete model
  const handleClickOpen = () => {
    setIsDeleteOpen(true);
  };
  const handleCloseMod = () => {
    setIsDeleteOpen(false);
  };
  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ''; // This is required for Chrome support
  };
  const username = isUserRoleAccess.companyname;
  // Manage Columns
  const handleOpenManageColumns = (event) => {
    setAnchorEl(event.currentTarget);
    setManageColumnsOpen(true);
  };
  const handleCloseManageColumns = () => {
    setManageColumnsOpen(false);
    setSearchQueryManage('');
  };
  //Delete model
  const [isDeleteOpencheckbox, setIsDeleteOpencheckbox] = useState(false);
  const [isDeleteOpenBulkcheckbox, setIsDeleteOpenBulkcheckbox] = useState(false);

  const handleClickOpencheckbox = () => {
    setIsDeleteOpencheckbox(true);
  };
  const handleCloseModcheckbox = () => {
    setIsDeleteOpencheckbox(false);
  };

  const [isDeleteOpenalert, setIsDeleteOpenalert] = useState(false);
  const [isDeleteBulkOpenalert, setIsDeleteBulkOpenalert] = useState(false);
  const handleClickOpenalert = () => {
    setIsHandleChange(true);
    if (selectedRows.length === 0) {
      setIsDeleteOpenalert(true);
    } else {
      setIsDeleteOpencheckbox(true);
    }
  };

  const handleClickOpenBulkcheckbox = () => {
    setIsDeleteOpenBulkcheckbox(true);
  };
  const handleCloseBulkModcheckbox = () => {
    setIsDeleteOpenBulkcheckbox(false);
  };

  const handleClickOpenBulkalert = () => {
    if (selectedRows?.length === 0) {
      setIsDeleteBulkOpenalert(true);
    } else {
      const selectedData = rowDataTable?.filter((data) => selectedRows?.includes(data?.id));

      if (selectedData.length > 0) {
        const isSameCompanyAndBranch = selectedData.every((data) => data.company === selectedData[0]?.company && data.branch === selectedData[0]?.branch);

        if (!isSameCompanyAndBranch) {
          setPopupContentMalert('Please Choose Data with the Same Company and Branch!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Prevents further execution
        }
        TemplateDropdownsValueManual(selectedData[0].company, selectedData[0].branch);
        setIsDeleteOpenBulkcheckbox(true);
      }
    }
  };

  const handleCloseModalert = () => {
    setIsDeleteOpenalert(false);
  };
  const handleCloseBulkModalert = () => {
    setIsDeleteBulkOpenalert(false);
  };
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const getRowClassName = (params) => {
    if (selectedRows.includes(params.row.id)) {
      return 'custom-id-row'; // This is the custom class for rows with item.tat === 'ago'
    }
    return ''; // Return an empty string for other rows
  };

  const [templateValues, setTemplateValues] = useState([]);
  const [templateCreationValue, setTemplateCreationValue] = useState('');
  const [templateCreationValueEdit, setTemplateCreationValueEdit] = useState('');
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeValue, setEmployeeValue] = useState([]);
  const [employeeUserName, setEmployeeUserName] = useState('');
  const [CompanyOptions, setCompanyOptions] = useState([]);
  const [BranchOptions, setBranchOptions] = useState([]);
  const [BranchOptionsEdit, setBranchOptionsEdit] = useState([]);
  const [allBranch, setAllBranch] = useState('');
  const [allBranchValue, setAllBranchValue] = useState(false);
  const [UnitOptions, setUnitOptions] = useState([]);
  const [TeamOptions, setTeamOptions] = useState([]);
  const [employeenames, setEmployeenames] = useState([]);
  const [manualKeywordOptions, setManualKeywordOptions] = useState([]);

  const [employeeMode, setEmployeeMode] = useState('');

  const TemplateDropdowns = async (branches) => {
    // console.log(branches, "branches")
    const accessbranchs = accessbranch
      ? accessbranch.map((data) => ({
        branch: data.branch,
        company: data.company,
      }))
      : [];
    setPageName(!pageName);
    try {
      let res = await axios.post(
        SERVICE.EMPLOYEE_TEMPLATECREATION,
        {
          assignbranch: accessbranchs,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );

      const tempValues = res?.data?.templatecreation?.filter(data => branches?.includes(data?.branch));
      const tempOptions = tempValues?.length > 0 ? tempValues : [];
      setTemplateValues(
        tempOptions?.map((data) => ({
          ...data,
          label: `${data.name}--(${data.company}--${data.branch})`,
          value: `${data.name}--(${data.company}--${data.branch})`,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const TemplateDropdownsValue = async (e, control) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.FILTERTEMPLATECONTROLPANEL, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: control?.company,
        branch: control?.branch,
      });

      setPageSizepdf(e?.pagesize);
      handlePagenameChange(e.pagesize);
      if (res?.data?.templatecontrolpanel) {
        // const answer = res?.data?.templatecontrolpanel?.length > 0 ? res?.data?.templatecontrolpanel?.find(data => data?.company === control?.company && data?.branch === control?.branch) : ""

        const ans = res?.data?.templatecontrolpanel ? res?.data?.templatecontrolpanel?.templatecontrolpanellog[res?.data?.templatecontrolpanel?.templatecontrolpanellog?.length - 1] : '';
        setPersonId(ans);
        setFromEmail(ans?.fromemail);
        setCompanyName(ans);
        // if (e.headvalue?.includes("With Head content")) {
        //   setHeader(ans?.letterheadcontentheader[0]?.preview)
        // }
        // if (e.headvalue?.includes("With Footer content")) {
        //   setfooter(ans?.letterheadcontentfooter[0]?.preview)
        // }
        setWaterMarkText(ans?.letterheadbodycontent[0].preview);
        setSignatureStatus(e?.signature);
        setSealStatus(e?.seal);
        setGenerateData(false);
      } else {
        setGenerateData(true);
        setPopupContentMalert("This Employee's company and branch is not matched with Template control panel data.Add the details in Template control panel!");
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const TemplateDropdownsValueManual = async (company, branch) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.FILTERTEMPLATECONTROLPANEL, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: company,
        branch: branch,
      });
      if (res?.data?.templatecontrolpanel) {
        const ans = res?.data?.templatecontrolpanel ? res?.data?.templatecontrolpanel?.templatecontrolpanellog[res?.data?.templatecontrolpanel?.templatecontrolpanellog?.length - 1] : '';
        setPersonId(ans);
      } else {
        setGenerateData(true);
        setPopupContentMalert("This Employee's company and branch is not matched with Template control panel data.Add the details in Template control panel!");
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const TemplateManualDropDowns = async (e, mode, company, branch) => {
    setPageName(!pageName);
    try {
      if (mode === 'Manual') {
        let res = await axios.post(SERVICE.FILTERTEMPLATECONTROLPANEL, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          company: company,
          branch: branch,
        });

        // setHeadValue(e?.headvalue);
        setPageSizepdf(e.pagesize);
        handlePagenameChange(e.pagesize);

        const ans = res?.data?.templatecontrolpanel ? res?.data?.templatecontrolpanel?.templatecontrolpanellog[res?.data?.templatecontrolpanel?.templatecontrolpanellog?.length - 1] : '';
        setPersonId(ans);
        setFromEmail(ans?.fromemail);
        setCompanyName(ans);
        setHeader(ans?.letterheadcontentheader[0]?.preview);
        setfooter(ans?.letterheadcontentfooter[0]?.preview);

        setWaterMarkText(ans?.letterheadbodycontent[0].preview);
        setSignatureStatus(e.signature);
        setSealStatus(e.seal);
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // //Reason for Sending Mail for an Person
  // const fetchAttendanceDateStatus = async (person, date) => {
  //   setPageName(!pageName);
  //   try {
  //     setLoadingAttDate(true);
  //     let res = await fetchUsersStatus(person, date);
  //     const rowDataTable = res?.flatMap((item, index) => {
  //       return {
  //         id: item.id,
  //         company: item.company,
  //         branch: item.branch,
  //         unit: item.unit,
  //         team: item.team,
  //         department: item.department,
  //         username: item.username,
  //         empcode: item.empcode,
  //         weekoff: item.weekoff,
  //         boardingLog: item.boardingLog,
  //         shiftallot: item.shiftallot,
  //         shift: item.shift,
  //         date: item.date,
  //         shiftmode: item.shiftMode,
  //         // printoptions: item.printoptions,
  //       };
  //     });

  //     const answerDate = rowDataTable?.length > 0 ? rowDataTable[0]?.daystatus : '';
  //     setLoadingAttDate(false);
  //     return answerDate

  //     // setAttendanceDateStatus(answerDate);
  //   } catch (err) {
  //     setLoadingAttDate(false);
  //     handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
  //   }
  // };

  //get all Sub vendormasters.
  const fetchAttedanceStatus = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.get(SERVICE.ATTENDANCE_STATUS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setAttStatus(res_vendor?.data?.attendancestatus);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  useEffect(() => {
    fetchAttedanceStatus();
  }, []);

  const getattendancestatus = (alldata) => {
    let result = attStatus.filter((data, index) => {
      return data?.clockinstatus === alldata?.clockinstatus && data?.clockoutstatus === alldata?.clockoutstatus;
    });
    return result[0]?.name;
  };

  const getattendancestatusmonth = (clockinstatus, clockoutstatus) => {
    let result = attStatus.filter((data, index) => {
      return data?.clockinstatus === clockinstatus && data?.clockoutstatus === clockoutstatus;
    });
    return result[0]?.name;
  };
  //get all Attendance Status name.
  const fetchAttMode = async () => {
    setPageName(!pageName);
    try {
      let res_freq = await axios.get(SERVICE.ATTENDANCE_MODE_STATUS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setAttModearr(res_freq?.data?.allattmodestatus);
      let result = res_freq?.data?.allattmodestatus.filter((data, index) => {
        return data.appliedthrough != 'Auto';
      });

      setAttStatusOption(result.map((d) => d.name));
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchAttMode();
  }, [availableYearsAttendance]);
  const getAttModeLop = (rowdaystatus) => {
    let result = attModearr.filter((data, index) => {
      return data?.name === rowdaystatus;
    });
    return result[0]?.lop === true ? 'YES' : 'No';
  };
  const getAttModeLopType = (rowdaystatus) => {
    let result = attModearr.filter((data, index) => {
      return data?.name === rowdaystatus;
    });
    return result[0]?.loptype;
  };
  const getCount = (rowlopstatus) => {
    if (rowlopstatus === 'YES - Double Day') {
      return '2';
    } else if (rowlopstatus === 'YES - Full Day') {
      return '1';
    } else if (rowlopstatus === 'YES - Half Day') {
      return '0.5';
    } else {
      return '0';
    }
  };

  const tableStyles = {
    padding: '10px !important',
    borderRight: '1px solid #dbdbdf',
    fontFamily: 'none',
    fontSize: '30px !important',
    fontWeight: 'bolder',
  };
  const tableStylesVales = {
    padding: '10px !important',
    borderRight: '1px solid #dbdbdf',
    fontFamily: 'none',
    fontSize: '30px !important',
    fontWeight: 500,
    color: '#373737',
  };
  const fetchSalaryDetails = async (department, branch, unit, team, person) => {
    // console.log(department, branch, unit, team, person, "department, branch, unit, team, person")
    try {
      let finalSalaryDetails = [];
      const time = await getCurrentServerTime();
      const RES_SALARYSLAB = await axios.get(SERVICE.SALARYSLAB_LIMITED, { headers: { Authorization: `Bearer ${auth.APIToken}` } });

      let res = await axios.post(SERVICE.USER_PAYRUNDATA_LIMITED_FINAL_SALARY_GENERATION_REVIEW, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        department: [department],
        branch: [branch],
        unit: [unit],
        team: [team],
        employees: [person],
        month: String(selectmonthname),
        year: String(selectedYear),
        mode: selectedModeType,
      });
      let salSlabs = RES_SALARYSLAB.data.salaryslab;
      let employeelistnames = res.data.users.length > 0 ? [...new Set(res.data.users.map((item) => item.companyname))] : [];

      if (res.data.users.length > 0) {
        async function fetchApiData() {
          try {
            const [res_employee] = await Promise.all([
              axios.post(SERVICE.DEPTMONTHSET_CUSTOM_SALARYREVIEW, {
                headers: { Authorization: `Bearer ${auth.APIToken}` },
                monthname: selectedMonth,
                year: selectedYear,
                doj: res.data.users.map((d) => d.doj),
                mode: selectedModeType,
              })
            ]);
            // console.log(res_employee.data.departmentdetails, "res_employee.data.departmentdetails")

            return {
              monthSets: res_employee.data.departmentdetails,
            };
          } catch (err) {
            console.error('Error fetching API data:', err.response?.data?.message || err);
            throw err;
          }
        }


        function splitArrayItems(array, chunkSize) {
          const resultarr = [];
          for (let i = 0; i < array.length; i += chunkSize) {
            const chunk = array.slice(i, i + chunkSize);
            resultarr.push({
              emps: chunk,
            });
          }
          return resultarr;
        }

        const resultarrItems = splitArrayItems(res.data.users, 50);
        // console.log(res.data.users, 'res.data.users');
        function processEmployeeItem(item, index, data) {
          try {
            let monthSets = data.monthSets;
            let findexp = {};
            if (selectedModeType == 'DOJ') {
              findexp = monthSets.find((d) => {
                const from = new Date(d.fromdate);
                const to = new Date(d.todate);
                const joinDate = new Date(item.doj);

                return joinDate >= from && joinDate <= to;
              });
            } else {
              findexp = monthSets.find((d) => d.department === item.department);
            }

            // console.log(findexp, item.department, "monthSets");
            const groupedByMonth = {};
            const finalSelectedMonth = selectedModeType == 'DOJ' ? findexp.monthname : selectedMonth;
            const finalSelectedYear = selectedModeType == 'DOJ' ? Number(findexp.year) : selectedYear;
            const finalSelectedMonthNum = selectedModeType == 'DOJ' ? months.find((d) => d.value.toLowerCase() === findexp.monthname.toLowerCase()).numval : Number(selectedMonthNum);

            // console.log(finalSelectedMonth, finalSelectedYear, finalSelectedMonthNum, "123");
            // console.log(selectedMonth, selectedYear, selectedMonthNum, "second");
            // Group items by month
            item.assignExpLog &&
              item.assignExpLog.length > 0 &&
              item.assignExpLog
                .filter((d) => d.expmode !== 'Auto')
                .sort((a, b) => {
                  return new Date(a.updatedate) - new Date(b.updatedate);
                })
                .forEach((item) => {
                  const monthYear = item.updatedate?.split('-').slice(0, 2).join('-');
                  if (!groupedByMonth[monthYear]) {
                    groupedByMonth[monthYear] = [];
                  }
                  groupedByMonth[monthYear].push(item);
                });

            // Extract the last item of each group
            const lastItemsForEachMonth = Object.values(groupedByMonth).map((group) => group[group.length - 1]);

            // Filter the data array based on the month and year
            // lastItemsForEachMonth.sort((a, b) => {
            //   return new Date(a.updatedate) - new Date(b.updatedate);
            // });
            // Find the first item in the sorted array that meets the criteria
            let filteredDataMonth = null;
            for (let i = 0; i < lastItemsForEachMonth.length; i++) {
              const date = lastItemsForEachMonth[i]?.updatedate;
              const splitedDate = date?.split('-');
              const itemYear = splitedDate ? splitedDate[0] : -1;
              const itemMonth = splitedDate ? splitedDate[1] : -1; // Adding 1 because getMonth() returns 0-indexed month
              if (Number(itemYear) === finalSelectedYear && Number(itemMonth) === Number(finalSelectedMonthNum)) {
                filteredDataMonth = lastItemsForEachMonth[i];
                break;
              } else if (Number(itemYear) < finalSelectedYear || (Number(itemYear) === finalSelectedYear && Number(itemMonth) < Number(finalSelectedMonthNum))) {
                filteredDataMonth = lastItemsForEachMonth[i]; // Keep updating the filteredDataMonth until the criteria is met
              } else {
                break; // Break the loop if we encounter an item with year and month greater than selected year and month
              }
            }

            let modevalue = filteredDataMonth;

            let selectedmonthnumalter = Number(finalSelectedMonthNum) <= 9 ? `0${Number(finalSelectedMonthNum)}` : finalSelectedMonthNum;

            let selectedMonStartDate = finalSelectedYear + '-' + selectedmonthnumalter + '-01';

            let findDate = findexp ? findexp.fromdate : selectedMonStartDate;

            // console.log(findDate, 'findDate');

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

                return months <= 0 ? 0 : months;
              }

              return 0; // Return 0 if either date is missing
            };

            // Calculate difference in months between findDate and item.doj
            let differenceInMonths, differenceInMonthsexp, differenceInMonthstar;
            if (modevalue) {
              //findexp end difference yes/no
              if (modevalue.endexp === 'Yes') {
                differenceInMonthsexp = calculateMonthsBetweenDates(item.doj, modevalue.endexpdate);
                //  Math.floor((new Date(modevalue.endexpdate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
                if (modevalue.expmode === 'Add') {
                  differenceInMonthsexp += parseInt(modevalue.expval);
                } else if (modevalue.expmode === 'Minus') {
                  differenceInMonthsexp -= parseInt(modevalue.expval);
                } else if (modevalue.expmode === 'Fix') {
                  differenceInMonthsexp = parseInt(modevalue.expval);
                }
              } else {
                differenceInMonthsexp = calculateMonthsBetweenDates(item.doj, findDate);
                // Math.floor((new Date(findDate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
                if (modevalue.expmode === 'Add') {
                  differenceInMonthsexp += parseInt(modevalue.expval);
                } else if (modevalue.expmode === 'Minus') {
                  differenceInMonthsexp -= parseInt(modevalue.expval);
                } else if (modevalue.expmode === 'Fix') {
                  differenceInMonthsexp = parseInt(modevalue.expval);
                } else {
                  // differenceInMonths = parseInt(modevalue.expval);
                  differenceInMonthsexp = calculateMonthsBetweenDates(item.doj, findDate);
                }
              }

              //findtar end difference yes/no
              if (modevalue.endtar === 'Yes') {
                differenceInMonthstar = calculateMonthsBetweenDates(item.doj, modevalue.endtardate);
                //  Math.floor((new Date(modevalue.endtardate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
                if (modevalue.expmode === 'Add') {
                  differenceInMonthstar += parseInt(modevalue.expval);
                } else if (modevalue.expmode === 'Minus') {
                  differenceInMonthstar -= parseInt(modevalue.expval);
                } else if (modevalue.expmode === 'Fix') {
                  differenceInMonthstar = parseInt(modevalue.expval);
                }
              } else {
                differenceInMonthstar = calculateMonthsBetweenDates(item.doj, findDate);
                if (modevalue.expmode === 'Add') {
                  differenceInMonthstar += parseInt(modevalue.expval);
                } else if (modevalue.expmode === 'Minus') {
                  differenceInMonthstar -= parseInt(modevalue.expval);
                } else if (modevalue.expmode === 'Fix') {
                  differenceInMonthstar = parseInt(modevalue.expval);
                } else {
                  // differenceInMonths = parseInt(modevalue.expval);
                  differenceInMonthstar = calculateMonthsBetweenDates(item.doj, findDate);
                }
              }

              differenceInMonths = calculateMonthsBetweenDates(item.doj, findDate);
              if (modevalue.expmode === 'Add') {
                differenceInMonths += parseInt(modevalue.expval);
              } else if (modevalue.expmode === 'Minus') {
                differenceInMonths -= parseInt(modevalue.expval);
              } else if (modevalue.expmode === 'Fix') {
                differenceInMonths = parseInt(modevalue.expval);
              } else {
                // differenceInMonths = parseInt(modevalue.expval);
                differenceInMonths = calculateMonthsBetweenDates(item.doj, findDate);
              }
            } else {
              differenceInMonthsexp = calculateMonthsBetweenDates(item.doj, findDate);
              differenceInMonthstar = calculateMonthsBetweenDates(item.doj, findDate);
              differenceInMonths = calculateMonthsBetweenDates(item.doj, findDate);
            }

            let experienceinmonthCalcVal = item.doj ? (calculateMonthsBetweenDates(item.doj, findDate) < 0 ? 0 : calculateMonthsBetweenDates(item.doj, findDate)) : '';
            //GET PROCESS CODE FUNCTION
            const groupedByMonthProcs = {};

            // Group items by month
            item.processlog &&
              item.processlog
                .sort((a, b) => {
                  return new Date(a.date) - new Date(b.date);
                })
                .forEach((item) => {
                  const monthYear = item.date?.split('-')?.slice(0, 2).join('-');
                  if (!groupedByMonthProcs[monthYear]) {
                    groupedByMonthProcs[monthYear] = [];
                  }
                  groupedByMonthProcs[monthYear].push(item);
                });

            // Extract the last item of each group
            const lastItemsForEachMonthPros = Object.values(groupedByMonthProcs).map((group) => group[group.length - 1]);

            // Filter the data array based on the month and year
            // lastItemsForEachMonthPros.sort((a, b) => {
            //   return new Date(a.date) - new Date(b.date);
            // });

            //FIND SELECTEDMONTH MONTH END DATE
            const nextMonthFirstDay = new Date(Number(finalSelectedYear), Number(finalSelectedMonthNum), 1);

            // Subtract one day to get the last day of the given month
            const lastDate = new Date(nextMonthFirstDay - 1);

            let lastdateOfSelectedMonth = lastDate.getDate();
            let selectedMonEndDate = `${finalSelectedYear}-${selectedmonthnumalter}-${lastdateOfSelectedMonth}`;
            let findmonthenddate = findexp ? findexp.todate : selectedMonEndDate;

            const thisMonthEndDate = findexp ? findexp.todate : selectedMonEndDate;
            const totaluserDays = (new Date(thisMonthEndDate) - new Date(item.doj)) / (1000 * 60 * 60 * 24);
            // Find the first item in the sorted array that meets the criteria
            let filteredItem = null;

            for (let i = 0; i < lastItemsForEachMonthPros.length; i++) {
              const date = lastItemsForEachMonthPros[i].date;

              if (findDate >= date) {
                filteredItem = lastItemsForEachMonthPros[i];
              } else if (thisMonthEndDate >= date && totaluserDays < 31) {
                filteredItem = lastItemsForEachMonthPros[i];
              } else {
                break;
              }
            }

            let getprocessCode = filteredItem ? filteredItem.process : '';

            // let procCodecheck = item.doj ? getprocessCode + (differenceInMonthsexp > 0 ? (differenceInMonthsexp <= 9 ? `0${differenceInMonthsexp}` : differenceInMonthsexp) : 0) : "";
            let processcodeexpvalue = item.doj && modevalue && modevalue.expmode === 'Manual' ? modevalue.salarycode : item.doj ? getprocessCode + (differenceInMonthstar > 0 ? (differenceInMonthstar <= 9 ? `0${differenceInMonthstar}` : differenceInMonthstar) : '00') : '';

            let processcodeexpvaluesalary = item.doj && modevalue && modevalue.expmode === 'Manual' ? modevalue.salarycode : item.doj ? getprocessCode + (differenceInMonthsexp > 0 ? (differenceInMonthsexp <= 9 ? `0${differenceInMonthsexp}` : differenceInMonthsexp) : '00') : '';

            //findsalary from salaryslab
            let findSalDetails =
              modevalue && modevalue.expmode === 'Manual'
                ? {
                  basic: modevalue.basic,
                  hra: modevalue.hra,
                  conveyance: modevalue.conveyance,
                  gross: modevalue.gross,
                  medicalallowance: modevalue.medicalallowance,
                  productionallowance: modevalue.productionallowance,
                  otherallowance: modevalue.otherallowance,
                  productionallowancetwo: modevalue.productionallowancetwo,
                }
                : salSlabs.find((d) => d.company === item.company && d.branch === item.branch && d.salarycode === processcodeexpvaluesalary);

            const isHadreasondate = item.reasondate != '' && item.reasondate != undefined;

            const enddateproduction = isHadreasondate ? item.reasondate : findexp ? findexp.todate : selectedMonEndDate;

            function getTotalDaysInMonthByName(monthName, year) {
              const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth() + 1; // Convert month name to number
              return new Date(year, monthIndex, 0).getDate();
            }

            let tond = getTotalDaysInMonthByName(finalSelectedMonth, Number(finalSelectedYear));
            //DAYS POINTS TARGETAND POINTS

            //PRODUCTION AND PRODCTION ALLOWACE2
            let oldprodAllowanceCalcVal = modevalue && modevalue.expmode === 'Manual' ? Number(modevalue.productionallowance) : findSalDetails ? Number(findSalDetails.productionallowance) : 0;
            let oldprodAllowancetwoCalcVal = modevalue && modevalue.expmode === 'Manual' ? Number(modevalue.productionallowancetwo) : findSalDetails ? Number(findSalDetails.productionallowancetwo) : 0;
            // ACUTAL BASIC/HRA/CONVEYACE/MEDICAL/OTHER ALLOWANCE
            let oldactualBasicCalcVal = modevalue && modevalue.expmode === 'Manual' ? Number(modevalue.basic) : findSalDetails ? Number(findSalDetails.basic) : 0;
            let oldactualHraCalcVal = modevalue && modevalue.expmode === 'Manual' ? Number(modevalue.hra) : findSalDetails ? Number(findSalDetails.hra) : 0;
            let oldactualConveyanceCalcVal = modevalue && modevalue.expmode === 'Manual' ? Number(modevalue.conveyance) : findSalDetails ? Number(findSalDetails.conveyance) : 0;
            let oldactualMedicalAllowCalcVal = modevalue && modevalue.expmode === 'Manual' ? Number(modevalue.medicalallowance) : findSalDetails ? Number(findSalDetails.medicalallowance) : 0;
            let oldactualOtherCalVAL = modevalue && modevalue.expmode === 'Manual' ? Number(modevalue.otherallowance) : findSalDetails ? Number(findSalDetails.otherallowance) : 0;

            return {
              // ...item,
              _id: item._id,
              serialNumber: index + 1,
              company: item.company,
              branch: item.branch,
              unit: item.unit,
              team: item.team,
              empcode: item.empcode,
              companyname: item.companyname,
              doj: item.doj ? moment(item.doj)?.format('DD-MM-YYYY') : '',
              experience: experienceinmonthCalcVal,

              legalname: item.legalname,
              designation: item.designation,
              department: item.department,

              //ASSIGN EXP LOG DETAILS
              endtar: modevalue ? modevalue.endtar : '',
              endtardate: modevalue && modevalue.endtardate ? moment(modevalue.endtardate)?.format('DD-MM-YYYY') : '',
              endexp: modevalue ? modevalue.endexp : '',
              endexpdate: modevalue && modevalue.endexpdate ? moment(modevalue.endexpdate)?.format('DD-MM-YYYY') : '',

              assignExpMode: modevalue ? modevalue.expmode : '',
              modevalue: modevalue ? modevalue.expval : '',

              targetexp: item.doj ? (differenceInMonthstar > 0 ? differenceInMonthstar : 0) : '',
              prodexp: item.doj ? (differenceInMonthsexp > 0 ? differenceInMonthsexp : 0) : '',
              modeexp: item.doj ? (differenceInMonths > 0 ? differenceInMonths : 0) : '',

              processcode: item.doj && modevalue && modevalue.expmode === 'Manual' ? modevalue.salarycode : item.doj ? getprocessCode : '',
              salexp: item.doj ? (differenceInMonthsexp > 0 ? (differenceInMonthsexp <= 9 ? `0${differenceInMonthsexp}` : differenceInMonthsexp) : '00') : '',
              processcodeexp: processcodeexpvaluesalary,

              oldbasic: oldactualBasicCalcVal,
              oldhra: oldactualHraCalcVal,
              oldconveyance: oldactualConveyanceCalcVal,
              oldmedicalallowance: oldactualMedicalAllowCalcVal,
              oldproductionallowance: oldprodAllowanceCalcVal,
              oldproductionallowancetwo: oldprodAllowancetwoCalcVal,
              oldotherallowance: oldactualOtherCalVAL,
              selectedMonth: finalSelectedMonth,
              selectedYear: finalSelectedYear,
            };
          } catch (err) {
            // setIsActive(false);
            console.log(err, 'err1');
          }
        }

        async function sendBatchRequestItems(batch, data) {
          try {
            const itemsWithSerialNumber = batch.emps.map(async (item, index) => processEmployeeItem(item, index, data));
            // const results = await Promise.all(itemsWithSerialNumber);
            // console.log(itemsWithSerialNumber, 'itemsWithSerialNumber');
            return await Promise.all(itemsWithSerialNumber);
          } catch (err) {
            console.error('Error processing batch request items:', err);
            // setBankdetail(false);
            const messages = err?.response?.data?.message;
            const alertMessage = messages || 'Something went wrong!';

            setShowAlert(
              <>
                <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
                <p style={{ fontSize: '20px', fontWeight: 900 }}>{alertMessage}</p>
              </>
            );

            handleClickOpenerr();
          }
        }

        async function getAllResultsItems() {
          try {
            const apiData = await fetchApiData();

            let allResultsItems = [];
            for (let batch of resultarrItems) {
              const batchResults = await sendBatchRequestItems(batch, apiData);
              allResultsItems.push(...batchResults);
            }

            return { allResultsItems };
          } catch (err) {
            console.log(err, 'err');
          }
        }

        const result = await getAllResultsItems();
        finalSalaryDetails =
          result.allResultsItems
            .sort((a, b) => {
              if (Number(b.experience) !== Number(a.experience)) {
                return Number(b.experience) - Number(a.experience);
              }

              return a.companyname.localeCompare(b.companyname);
            })
            .map((item, index) => {
              const basic = item.oldbasic ? Number(item.oldbasic) : 0;
              const hra = item.oldhra ? Number(item.oldhra) : 0;
              const conveyance = item.oldconveyance ? Number(item.oldconveyance) : 0;
              const medicalallowance = item.oldmedicalallowance ? Number(item.oldmedicalallowance) : 0;
              const productionallowance = item.oldproductionallowance ? Number(item.oldproductionallowance) : 0;
              const productionallowancetwo = item.oldproductionallowancetwo ? Number(item.oldproductionallowancetwo) : 0;
              const otherallowance = item.oldotherallowance ? Number(item.oldotherallowance) : 0;
              const gross =
                basic +
                hra +
                conveyance +
                medicalallowance +
                productionallowance +
                // productionallowancetwo +
                otherallowance;

              const annualgrossctc = gross * 12;
              // console.log(item, "item")
              return {
                // ...item,
                id: item._id,
                serialNumber: index + 1,
                employeename: item.companyname,
                basic,
                hra,
                selectedMonth: item?.selectedMonth,
                selectedYear: item?.selectedYear,
                conveyance,
                medicalallowance,
                productionallowance,
                productionallowancetwo,
                otherallowance,
                gross,
                annualgrossctc
              };
            })
      }
      // console.log(finalSalaryDetails, "FinalSalaryDetails")
      setViewData(finalSalaryDetails[0])
      return finalSalaryDetails;
    } catch (err) {
      console.log(err);
      handleApiError(err, setShowAlert, handleClickOpenerr);
    }
  }

  const getAttModeTarget = (rowdaystatus) => {
    let result = attModearr.filter((data, index) => {
      return data?.name === rowdaystatus;
    });
    return result[0]?.target === true ? 'YES' : 'No';
  };

  const getAttModePaidPresent = (rowdaystatus) => {
    let result = attModearr.filter((data, index) => {
      return data?.name === rowdaystatus;
    });
    return result[0]?.paidleave === true ? 'YES' : 'No';
  };

  const getAttModePaidPresentType = (rowdaystatus) => {
    let result = attModearr.filter((data, index) => {
      return data?.name === rowdaystatus;
    });
    return result[0]?.paidleavetype;
  };
  const getFinalLop = (rowlop, rowloptype) => {
    return rowloptype === undefined || rowloptype === '' ? rowlop : rowlop + ' - ' + rowloptype;
  };

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

  const getFinalPaid = (rowpaid, rowpaidtype) => {
    return rowpaidtype === undefined || rowpaidtype === '' ? rowpaid : rowpaid + ' - ' + rowpaidtype;
  };

  const getAssignLeaveDayForPaid = (rowpaidday) => {
    if (rowpaidday === 'YES - Double Day') {
      return '2';
    } else if (rowpaidday === 'YES - Full Day') {
      return '1';
    } else if (rowpaidday === 'YES - Half Day') {
      return '0.5';
    } else {
      return '0';
    }
  };
  // get all users
  const fetchUsersStatus = async (person, date) => {
    let startMonthDate = new Date(date);
    let endMonthDate = new Date(date);

    const daysArray = [];
    while (startMonthDate <= endMonthDate) {
      const formattedDate = `${String(startMonthDate.getDate()).padStart(2, '0')}/${String(startMonthDate.getMonth() + 1).padStart(2, '0')}/${startMonthDate.getFullYear()}`;
      const dayName = startMonthDate.toLocaleDateString('en-US', { weekday: 'long' });
      const dayCount = startMonthDate.getDate();
      const shiftMode = 'Main Shift';
      const weekNumberInMonth =
        getWeekNumberInMonth(startMonthDate) === 1
          ? `${getWeekNumberInMonth(startMonthDate)}st Week`
          : getWeekNumberInMonth(startMonthDate) === 2
            ? `${getWeekNumberInMonth(startMonthDate)}nd Week`
            : getWeekNumberInMonth(startMonthDate) === 3
              ? `${getWeekNumberInMonth(startMonthDate)}rd Week`
              : getWeekNumberInMonth(startMonthDate) > 3
                ? `${getWeekNumberInMonth(startMonthDate)}th Week`
                : '';

      daysArray.push({ formattedDate, dayName, dayCount, shiftMode, weekNumberInMonth });

      // Move to the next day
      startMonthDate.setDate(startMonthDate.getDate() + 1);
    }

    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.USER_CLOCKIN_CLOCKOUT_STATUS_DOC_PREPARATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        userDates: daysArray,
        person: person,
      });

      // setUserShifts(res?.data?.finaluser.filter(item => item !== null));
      let res_applyleave = await axios.post(SERVICE.APPLYLEAVE_APPROVED, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        status: String('Approved'),
      });

      let leaveresult = res_applyleave?.data?.applyleaves;

      let countByEmpcodeClockin = {}; // Object to store count for each empcode
      let countByEmpcodeClockout = {};

      const itemsWithSerialNumber = res?.data?.finaluser?.map((item, index) => {
        // Initialize count for empcode if not already present
        if (!countByEmpcodeClockin[item.empcode]) {
          countByEmpcodeClockin[item.empcode] = 1;
        }
        if (!countByEmpcodeClockout[item.empcode]) {
          countByEmpcodeClockout[item.empcode] = 1;
        }

        // Adjust clockinstatus based on lateclockincount
        let updatedClockInStatus = item.clockinstatus;
        // Adjust clockoutstatus based on earlyclockoutcount
        let updatedClockOutStatus = item.clockoutstatus;

        // Filter out only 'Absent' items for the current employee
        const absentItems = res?.data?.finaluser?.filter((d) => d.clockinstatus === 'Absent' && item.empcode === d.empcode && d.clockin === '00:00:00' && d.clockout === '00:00:00');

        // Check if the day before and after a 'Week Off' date is marked as 'Leave' or 'Absent'
        if (item.clockinstatus === 'Week Off' && item.clockoutstatus === 'Week Off') {
          // Define the date format for comparison
          const itemDate = moment(item.rowformattedDate, 'DD/MM/YYYY');

          const isPreviousDayLeave = leaveresult.some((leaveItem) => moment(leaveItem.date, 'DD/MM/YYYY').isSame(itemDate.clone().subtract(1, 'days'), 'day') && leaveItem.empcode === item.empcode);
          const isPreviousDayAbsent = absentItems.some((absentItem) => moment(absentItem.rowformattedDate, 'DD/MM/YYYY').isSame(itemDate.clone().subtract(1, 'days'), 'day'));

          const isNextDayLeave = leaveresult.some((leaveItem) => moment(leaveItem.date, 'DD/MM/YYYY').isSame(itemDate.clone().add(1, 'days'), 'day') && leaveItem.empcode === item.empcode);
          const isNextDayAbsent = absentItems.some((absentItem) => moment(absentItem.rowformattedDate, 'DD/MM/YYYY').isSame(itemDate.clone().add(1, 'days'), 'day'));

          if (isPreviousDayLeave) {
            updatedClockInStatus = 'AfterWeekOffLeave';
            updatedClockOutStatus = 'AfterWeekOffLeave';
          }
          if (isPreviousDayAbsent) {
            updatedClockInStatus = 'AfterWeekOffAbsent';
            updatedClockOutStatus = 'AfterWeekOffAbsent';
          }
          if (isNextDayLeave) {
            updatedClockInStatus = 'BeforeWeekOffLeave';
            updatedClockOutStatus = 'BeforeWeekOffLeave';
          }
          if (isNextDayAbsent) {
            updatedClockInStatus = 'BeforeWeekOffAbsent';
            updatedClockOutStatus = 'BeforeWeekOffAbsent';
          }
        }

        // Check if 'Late - ClockIn' count exceeds the specified limit
        if (updatedClockInStatus === 'Late - ClockIn') {
          updatedClockInStatus = `${countByEmpcodeClockin[item.empcode]}Late - ClockIn`;
          countByEmpcodeClockin[item.empcode]++; // Increment count for current empcode
        }
        // Check if 'Early - ClockOut' count exceeds the specified limit
        if (updatedClockOutStatus === 'Early - ClockOut') {
          updatedClockOutStatus = `${countByEmpcodeClockout[item.empcode]}Early - ClockOut`;
          countByEmpcodeClockout[item.empcode]++; // Increment count for current empcode
        }

        return {
          ...item,
          clockinstatus: updatedClockInStatus,
          clockoutstatus: updatedClockOutStatus,
        };
      });

      return itemsWithSerialNumber;
    } catch (err) {
      setLoader(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };



  function getMonthsInRange(month, year) {
    // console.log(month, "month")
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const result = [];

    // Previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    result.push({ month: monthNames[prevMonth], year: prevYear.toString() });

    // Current month
    result.push({ month: monthNames[month], year: year.toString() });

    // Next month
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    result.push({ month: monthNames[nextMonth], year: nextYear.toString() });

    return result;
  }
  const getAttModeAppliedThr = (rowdaystatus) => {
    let result = attModearr.filter((data, index) => {
      return data?.name === rowdaystatus;
    });
    return result[0]?.appliedthrough;
  };

  const getAssignLeaveDayForLop = (rowlopday) => {
    if (rowlopday === 'Yes - Double Day') {
      return '2';
    } else if (rowlopday === 'Yes - Full Day') {
      return '1';
    } else if (rowlopday === 'Yes - Half Day') {
      return '0.5';
    } else {
      return '0';
    }
  };
  const getIsWeekoff = (rowdaystatus) => {
    let result = attModearr.filter((data, index) => {
      return data?.name === rowdaystatus;
    });
    return result[0]?.weekoff === true ? 'Yes' : 'No';
  };

  const getIsHoliday = (rowdaystatus) => {
    let result = attModearr.filter((data, index) => {
      return data?.name === rowdaystatus;
    });
    return result[0]?.holiday === true ? 'Yes' : 'No';
  };
  const getMonthIndex = (month) => monthNames.indexOf(month);
  const fetchUsersFilter = async (user, choosemonth, chooseyear, choosesort) => {
    setPageName(!pageName);
    // setLoader(true);
    try {
      const time = await getCurrentServerTime();
      let res_emp = await axios.post(SERVICE.USER_FOR_ALL_ATTENDANCE_PAGE_INDIVIDUAL_TYPE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        type: "Individual",
        company: [user?.company],
        branch: [user?.branch],
        unit: [user?.unit],
        team: [user?.team],
        employee: [user?.companyname],
        department: [user?.department],
        assignbranch: accessbranch,
      });
      // console.log()
      let res = await axios.get(`${SERVICE.GET_ATTENDANCE_CONTROL_CRITERIA}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let attendanceCriteriaData = res?.data?.attendancecontrolcriteria[0];

      // console.log(res_emp?.data?.users, 'userResult')

      function splitArray(array, chunkSize) {
        const resultarr = [];
        for (let i = 0; i < array.length; i += chunkSize) {
          const chunk = array.slice(i, i + chunkSize);
          resultarr.push({
            data: chunk,
          });
        }
        return resultarr;
      }

      let employeelistnames = res_emp?.data?.users.length > 0 ? [...new Set(res_emp?.data?.users.map((item) => item.companyname))] : [];
      const resultarr = splitArray(employeelistnames, 10);
      // console.log(resultarr.length, choosemonth, chooseyear, employeelistnames, 'resultarr')
      const montharray = getMonthsInRange(Number(getMonthIndex(choosemonth) + 1) - 1, Number(chooseyear));

      let res_applyleave = await axios.post(SERVICE.APPLYLEAVE_APPROVED, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        employee: [...employeelistnames],
      });
      // console.log(res_applyleave, 'res_applyleave')

      let res_permission = await axios.post(SERVICE.PERMISSIONS_APPROVED, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        employee: [...employeelistnames],
      });
      // console.log(res_permission, 'res_permission')
      let leaveresult = res_applyleave?.data?.applyleaves?.filter((data) => data.leavetype !== 'Leave Without Pay (LWP)');
      let leaveresultWithoutPay = res_applyleave?.data?.applyleaves?.filter((data) => data.leavetype === 'Leave Without Pay (LWP)');
      let permissionresult = res_permission?.data?.permissions;
      // console.log(res_emp?.data?.users, 'userResult')

      async function sendBatchRequest(batch) {
        try {
          let res = await axios.post(
            SERVICE.USER_CLOCKIN_CLOCKOUT_STATUS_FOR_MONTH_LOP_CAL_FILTER,
            {
              employee: batch.data,
              ismonth: Number(getMonthIndex(choosemonth) + 1),
              isyear: Number(chooseyear),
              montharray: [...montharray],
              department: [user?.department],
            },
            {
              headers: {
                Authorization: `Bearer ${auth.APIToken}`,
              },
            }
          );
          // console.log(res?.data, montharray, batch.data, montharray, '2476')
          let res_type = await axios.get(SERVICE.LEAVETYPE, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
          });

          let resdatawithlwp = [...res_type?.data?.leavetype, { leavetype: 'Leave Without Pay (LWP)', code: 'LWP' }];

          let leavestatusApproved = [];
          resdatawithlwp?.map((type) => {
            res_applyleave?.data?.applyleaves &&
              res_applyleave?.data?.applyleaves?.forEach((d) => {
                if (type.leavetype === d.leavetype && d.tookleavecheckstatus === 'Single' && d.leavestatus === 'Shift') {
                  leavestatusApproved.push(type.code + ' ' + d.status);
                }
                if (type.leavetype === d.leavetype && d.tookleavecheckstatus === 'Double' && d.leavestatus === 'Shift') {
                  leavestatusApproved.push('DL' + ' - ' + type.code + ' ' + d.status);
                }
                if (type.leavetype === d.leavetype && d.tookleavecheckstatus === 'Double Day' && d.leavestatus === 'Shift') {
                  leavestatusApproved.push('DDL' + ' - ' + type.code + ' ' + d.status);
                }
              });
          });

          const rearr = [...new Set(leavestatusApproved)];

          // console.log(rearr, 'rearr')

          // let filteredBatch = valueDep.length > 0 ? (res?.data?.finaluser?.filter((data) => valueDep.includes(data.department))) : res?.data?.finaluser;
          // console.log(filteredBatch, 'filteredBatch')
          // console.log(res?.data?.finaluser, 'res?.data?.finaluser')
          const filtered = res?.data?.finaluser?.filter((d) => {
            const [day, month, year] = d.rowformattedDate.split('/');
            const formattedDate = new Date(`${year}-${month}-${day}`);
            const reasonDate = new Date(d.reasondate);
            const dojDate = new Date(d.doj);

            if (d.reasondate && d.reasondate !== '') {
              return formattedDate <= reasonDate;
            } else if (d.doj && d.doj !== '') {
              return formattedDate >= dojDate;
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

            const itemDate = moment(item.rowformattedDate, 'DD/MM/YYYY');

            // For Week Off status
            if (item.clockinstatus === 'Week Off' && item.clockoutstatus === 'Week Off') {
              const prev = findPreviousNonWeekOff(filtered, index);
              const next = findNextNonWeekOff(filtered, index);

              const isPrevLeave = leaveresult.some((leaveItem) => prev && moment(leaveItem.date, 'DD/MM/YYYY').isSame(moment(prev.rowformattedDate, 'DD/MM/YYYY'), 'day') && leaveItem.empcode === item.empcode);
              const isPrevAbsent = prev && prev.empcode === item.empcode && prev.clockinstatus === 'Absent' && prev.clockoutstatus === 'Absent' && prev.clockin === '00:00:00' && prev.clockout === '00:00:00';

              const isNextLeave = leaveresult.some((leaveItem) => next && moment(leaveItem.date, 'DD/MM/YYYY').isSame(moment(next.rowformattedDate, 'DD/MM/YYYY'), 'day') && leaveItem.empcode === item.empcode);
              const isNextAbsent = next && next.empcode === item.empcode && next.clockinstatus === 'Absent' && next.clockoutstatus === 'Absent' && next.clockin === '00:00:00' && next.clockout === '00:00:00';

              const isPrevLeaveWithoutPay = leaveresultWithoutPay.some((leaveItem) => prev && moment(leaveItem.date, 'DD/MM/YYYY').isSame(moment(prev.rowformattedDate, 'DD/MM/YYYY'), 'day') && leaveItem.empcode === item.empcode);
              const isNextLeaveWithoutPay = leaveresultWithoutPay.some((leaveItem) => next && moment(leaveItem.date, 'DD/MM/YYYY').isSame(moment(next.rowformattedDate, 'DD/MM/YYYY'), 'day') && leaveItem.empcode === item.empcode);

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

          changedWeekoffResult.forEach((item) => {
            if (!empGrouped[item.empcode]) empGrouped[item.empcode] = [];
            empGrouped[item.empcode].push(item);
          });

          const leaveStatuses = [...rearr, 'Absent', 'BL - Absent'];

          // console.log(leaveStatuses, 'leaveStatuses')
          Object.keys(empGrouped).forEach((empcode) => {
            const records = empGrouped[empcode].sort((a, b) => moment(a.rowformattedDate, 'DD/MM/YYYY') - moment(b.rowformattedDate, 'DD/MM/YYYY'));

            let streak = [];
            let counterIn = 1;
            let counterOut = 1;

            for (let i = 0; i < records.length; i++) {
              const current = records[i];
              const isWeekOff = current.shift === 'Week Off';

              const isLeaveDay = current.clockin === '00:00:00' && current.clockout === '00:00:00' && leaveStatuses.includes(current.clockinstatus) && !isWeekOff;

              if (isLeaveDay) {
                streak.push(current);
              } else if (isWeekOff) {
                // Push Week Off directly, don’t reset streak
                resultBefore.push(current);
              } else {
                // Encountered present day, finalize streak
                if (streak.length > attendanceCriteriaData?.longabsentcount) {
                  streak.forEach((day) => {
                    let clockinstatus = day.clockinstatus;
                    let clockoutstatus = day.clockoutstatus;

                    if (clockinstatus === 'Absent') {
                      clockinstatus = `${counterIn++}Long Absent`;
                    } else if (clockinstatus === 'BL - Absent') {
                      clockinstatus = `${counterIn++}Long BL - Absent`;
                    } else if (rearr?.includes(clockinstatus)) {
                      clockinstatus = `${counterIn++}Long Leave ${rearr?.filter((d) => d === clockinstatus)}`;
                    }

                    if (clockoutstatus === 'Absent') {
                      clockoutstatus = `${counterOut++}Long Absent`;
                    } else if (clockoutstatus === 'BL - Absent') {
                      clockoutstatus = `${counterOut++}Long BL - Absent`;
                    } else if (rearr?.includes(clockoutstatus)) {
                      clockoutstatus = `${counterOut++}Long Leave ${rearr?.filter((d) => d === clockoutstatus)}`;
                    }

                    resultBefore.push({
                      ...day,
                      clockinstatus,
                      clockoutstatus,
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
              streak.forEach((day) => {
                let clockinstatus = day.clockinstatus;
                let clockoutstatus = day.clockoutstatus;

                if (clockinstatus === 'Absent') {
                  clockinstatus = `${counterIn++}Long Absent`;
                } else if (clockinstatus === 'BL - Absent') {
                  clockinstatus = `${counterIn++}Long BL - Absent`;
                } else if (rearr?.includes(clockinstatus)) {
                  clockinstatus = `${counterIn++}Long Leave ${rearr?.filter((d) => d === clockinstatus)}`;
                }

                if (clockoutstatus === 'Absent') {
                  clockoutstatus = `${counterOut++}Long Absent`;
                } else if (clockoutstatus === 'BL - Absent') {
                  clockoutstatus = `${counterOut++}Long BL - Absent`;
                } else if (rearr?.includes(clockoutstatus)) {
                  clockoutstatus = `${counterOut++}Long Leave ${rearr?.filter((d) => d === clockoutstatus)}`;
                }

                resultBefore.push({
                  ...day,
                  clockinstatus,
                  clockoutstatus,
                });
              });
            } else {
              resultBefore.push(...streak);
            }
          });
          resultBefore.sort((a, b) => moment(a.rowformattedDate, 'DD/MM/YYYY') - moment(b.rowformattedDate, 'DD/MM/YYYY'));


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
              let { fromdate, todate, department, monthname, year } = dateRange;

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

                if (updatedClockInStatus === 'Late - ClockIn') {
                  updatedClockInStatus = `${countByEmpcodeClockin[item.empcode]}Late - ClockIn`;
                  countByEmpcodeClockin[item.empcode]++;
                }

                if (updatedClockOutStatus === 'Early - ClockOut') {
                  updatedClockOutStatus = `${countByEmpcodeClockout[item.empcode]}Early - ClockOut`;
                  countByEmpcodeClockout[item.empcode]++;
                }

                return {
                  ...item,
                  department,
                  fromdate,
                  todate,
                  monthname,
                  year,
                  clockinstatus: updatedClockInStatus,
                  clockoutstatus: updatedClockOutStatus,
                };
              });

              result.push(...processedRecords.filter(Boolean));
            });
          }

          // console.log(result, 'result')
          const itemsWithSerialNumber = result?.map((item) => ({
            ...item,
            totalnumberofdays: item.totalnumberofdays,
            empshiftdays: item.empshiftdays,
            totalcounttillcurrendate: item.totalcounttillcurrendate,
            totalshift: item.totalshift,
            attendanceauto: getattendancestatus(item),
            daystatus: item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item),
            appliedthrough: getAttModeAppliedThr(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
            lop: getAttModeLop(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
            loptype: getAttModeLopType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
            lopcalculation: getFinalLop(getAttModeLop(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)), getAttModeLopType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item))),
            lopcount: getCount(getFinalLop(getAttModeLop(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)), getAttModeLopType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)))),
            modetarget: getAttModeTarget(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
            paidpresentbefore: getAttModePaidPresent(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
            paidleavetype: getAttModePaidPresentType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)),
            paidpresent: getFinalPaid(getAttModePaidPresent(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)), getAttModePaidPresentType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item))),
            lopday: getAssignLeaveDayForLop(getFinalLop(getAttModeLop(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)), getAttModeLopType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)))),
            paidpresentday: getAssignLeaveDayForPaid(getFinalPaid(getAttModePaidPresent(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)), getAttModePaidPresentType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(item)))),
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

              const isPreviousManualPaidFull = previousItem && previousItem.appliedthrough === 'Manual' && previousItem.paidpresent === 'Yes - Full Day';

              const isNextManualPaidFull = nextItem && nextItem.appliedthrough === 'Manual' && nextItem.paidpresent === 'Yes - Full Day';

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
              item.lopcalculation = getFinalLop(getAttModeLop(item.attendanceautostatus || getattendancestatus(item)), getAttModeLopType(item.attendanceautostatus || getattendancestatus(item)));
              item.lopcount = getCount(getFinalLop(getAttModeLop(item.attendanceautostatus || getattendancestatus(item)), getAttModeLopType(item.attendanceautostatus || getattendancestatus(item))));
              item.modetarget = getAttModeTarget(item.attendanceautostatus || getattendancestatus(item));
              item.paidpresentbefore = getAttModePaidPresent(item.attendanceautostatus || getattendancestatus(item));
              item.paidleavetype = getAttModePaidPresentType(item.attendanceautostatus || getattendancestatus(item));
              item.paidpresent = getFinalPaid(getAttModePaidPresent(item.attendanceautostatus || getattendancestatus(item)), getAttModePaidPresentType(item.attendanceautostatus || getattendancestatus(item)));
              item.lopday = getAssignLeaveDayForLop(getFinalLop(getAttModeLop(item.attendanceautostatus || getattendancestatus(item)), getAttModeLopType(item.attendanceautostatus || getattendancestatus(item))));
              item.paidpresentday = getAssignLeaveDayForPaid(getFinalPaid(getAttModePaidPresent(item.attendanceautostatus || getattendancestatus(item)), getAttModePaidPresentType(item.attendanceautostatus || getattendancestatus(item))));
              item.isweekoff = getIsWeekoff(item.attendanceautostatus || getattendancestatus(item));
              item.isholiday = getIsHoliday(item.attendanceautostatus || getattendancestatus(item));
            }
            if (attStatusOption.includes(item.daystatus) && item.clockin === '00:00:00' && item.clockout === '00:00:00' && item.appliedthrough === 'Manual' && item.paidpresent === 'Yes - Full Day') {
              const previousItem = array[index - 1];
              const nextItem = array[index + 1];

              const hasRelevantStatus = (entry) => entry && (weekOption.includes(entry.clockinstatus) || weekOption.includes(entry.clockoutstatus)) && entry.shift === 'Week Off';

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
                  previousItem.lopcount = getCount(
                    getFinalLop(getAttModeLop(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem)), getAttModeLopType(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem)))
                  );
                  previousItem.modetarget = getAttModeTarget(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem));
                  previousItem.paidpresentbefore = getAttModePaidPresent(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem));
                  previousItem.paidleavetype = getAttModePaidPresentType(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem));
                  previousItem.paidpresent = getFinalPaid(
                    getAttModePaidPresent(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem)),
                    getAttModePaidPresentType(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem))
                  );
                  previousItem.lopday = getAssignLeaveDayForLop(
                    getFinalLop(getAttModeLop(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem)), getAttModeLopType(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem)))
                  );
                  previousItem.paidpresentday = getAssignLeaveDayForPaid(
                    getFinalPaid(getAttModePaidPresent(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem)), getAttModePaidPresentType(previousItem.attendanceautostatus ? previousItem.attendanceautostatus : getattendancestatus(previousItem)))
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
                  nextItem.lopcalculation = getFinalLop(getAttModeLop(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem)), getAttModeLopType(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem)));
                  nextItem.lopcount = getCount(getFinalLop(getAttModeLop(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem)), getAttModeLopType(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem))));
                  nextItem.modetarget = getAttModeTarget(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem));
                  nextItem.paidpresentbefore = getAttModePaidPresent(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem));
                  nextItem.paidleavetype = getAttModePaidPresentType(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem));
                  nextItem.paidpresent = getFinalPaid(getAttModePaidPresent(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem)), getAttModePaidPresentType(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem)));
                  nextItem.lopday = getAssignLeaveDayForLop(getFinalLop(getAttModeLop(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem)), getAttModeLopType(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem))));
                  nextItem.paidpresentday = getAssignLeaveDayForPaid(
                    getFinalPaid(getAttModePaidPresent(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem)), getAttModePaidPresentType(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem)))
                  );
                  nextItem.isweekoff = getIsWeekoff(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem));
                  nextItem.isholiday = getIsHoliday(nextItem.attendanceautostatus ? nextItem.attendanceautostatus : getattendancestatus(nextItem));
                }
              }
            }
          });

          let fianlResult = itemsWithSerialNumber.filter((data) => Number(data.year) === Number(chooseyear) && data.monthname === monthstring[Number(getMonthIndex(choosemonth) + 1) - 1]);

          // console.log(fianlResult, 'fianlResult')
          // 
          return fianlResult;
        } catch (err) {
          console.log(err, 'err')

          console.error('Error in POST request for batch:', batch.data, err);
        }
      }

      async function getAllResults() {
        let allResults = [];
        for (let batch of resultarr) {
          const finaldata = await sendBatchRequest(batch);
          allResults = allResults.concat(finaldata);
        }

        return { allResults }; // Return both results as an object
      }

      function getMinutesDifferenceForClockIn(clockIn, shiftStart) {
        // Ensure space before AM/PM
        const normalizeTime = (timeStr) => {
          // Add ":00" if missing minutes/seconds
          let fixedTime = timeStr;
          if (!fixedTime.includes(':')) {
            fixedTime = fixedTime.replace(/(AM|PM)/i, ':00 $1');
          } else {
            fixedTime = fixedTime.replace(/(AM|PM)/i, ' $1');
          }
          return fixedTime;
        };

        const shiftTime = normalizeTime(shiftStart);
        const clockInTime = normalizeTime(clockIn);

        const today = new Date(time).toLocaleDateString('en-US'); // e.g., 7/22/2025

        const clockInDate = new Date(`${today} ${clockInTime}`);
        const shiftDate = new Date(`${today} ${shiftTime}`);

        const diffMs = clockInDate - shiftDate;
        const diffMinutes = Math.floor(diffMs / 60000);

        return diffMinutes;
      }

      function getMinutesDifferenceForClockOut(clockOut, shiftEnd) {
        // Ensure space before AM/PM
        const normalizeTime = (timeStr) => {
          // Add ":00" if missing minutes/seconds
          let fixedTime = timeStr;
          if (!fixedTime.includes(':')) {
            fixedTime = fixedTime.replace(/(AM|PM)/i, ':00 $1');
          } else {
            fixedTime = fixedTime.replace(/(AM|PM)/i, ' $1');
          }
          return fixedTime;
        };

        const shiftTime = normalizeTime(shiftEnd);
        const clockOutTime = normalizeTime(clockOut);

        const today = new Date(time).toLocaleDateString('en-US'); // e.g., 7/22/2025

        const clockOutDate = new Date(`${today} ${clockOutTime}`);
        const shiftDate = new Date(`${today} ${shiftTime}`);

        const diffMs = shiftDate - clockOutDate;
        const diffMinutes = Math.floor(diffMs / 60000);

        return diffMinutes;
      }
      let finalresult = [];

      let finalAttendanceData = [];
      // getAllResults()
      //   .then(async (results) => {

      const results = await getAllResults();
      const resultdataEnd = results.allResults?.forEach((item) => {

        const leaveOnDateApproved = leaveresult?.find((d) => d.date === item.rowformattedDate && d.empcode === item.empcode);
        const permissionOnDateApproved = permissionresult?.find((d) => d.date === item.finalDate && d.employeeid === item.empcode && d.compensationstatus === '');
        let weekoffdayscount = 0;
        if (item.isweekoff === 'Yes') {
          weekoffdayscount = item.paidpresent === 'Yes - Full Day' ? 1 : 0.5;
        }

        let holidaydayscount = 0;
        if (item.isholiday === 'Yes') {
          holidaydayscount = item.paidpresent === 'Yes - Full Day' ? 1 : 0.5;
          // }
        }

        const existingEntryIndex = finalresult.findIndex((entry) => entry.empcode === item.empcode);

        if (existingEntryIndex !== -1) {
          if (item.shift !== 'Not Allotted') {
            finalresult[existingEntryIndex].shift++;
          }
          if (item.isweekoff === 'Yes') {
            finalresult[existingEntryIndex].weekoff++;
          }
          if (item.isholiday === 'Yes') {
            finalresult[existingEntryIndex].holidayCount++;
          }

          if (leaveOnDateApproved) {
            finalresult[existingEntryIndex].leaveCount++;
          }

          if (item.clockinstatus !== 'Not Allotted' && item.clockoutstatus !== 'Not Allotted' && item.attendanceauto === undefined && item.daystatus === undefined) {
            finalresult[existingEntryIndex].nostatuscount++;
          }

          if (item.lopcalculation === 'Yes - Double Day') {
            finalresult[existingEntryIndex].doublelopcount++;
          }

          if (item.lopcalculation === 'Yes - Double Half Day') {
            finalresult[existingEntryIndex].doublehalflopcount++;
          }

          if (item.clockoutstatus?.includes('Over')) {
            finalresult[existingEntryIndex].totaloverclockout++;
          }
          if (item.clockinstatus?.includes('Early')) {
            finalresult[existingEntryIndex].totalearlyclockin++;
          }

          if (permissionOnDateApproved) {
            const requestMinutes = Number(permissionOnDateApproved.requesthours);

            // Sort permissiontodo in ascending order of minutes
            const matchedData = attendanceCriteriaData.permissiontodo
              .sort((a, b) => a.permissionminutes - b.permissionminutes)
              ?.filter((todo) => Number(todo.permissionminutes) <= requestMinutes)
              ?.reduce((nearest, current) => {
                const currentMinutes = Number(current.permissionminutes);
                const nearestMinutes = nearest ? Number(nearest.permissionminutes) : -1;
                return currentMinutes > nearestMinutes ? current : nearest;
              }, null);

            // console.log(matchedData)
            if (matchedData) {
              finalresult[existingEntryIndex].permissionhours += Number(matchedData.permissionhours);
            }
          }

          if (leaveOnDateApproved) {
            const workingHours = Number(item.totalshifthours) - (Number(item.totalbreakhours) + Number());
            if (leaveOnDateApproved?.shiftcount === '1') {
              finalresult[existingEntryIndex].clslhours += Number(workingHours);
            }
            if (leaveOnDateApproved?.shiftcount === '0.5') {
              finalresult[existingEntryIndex].clslhours += Number(workingHours) / 2;
            }
          }

          if (item.lop === 'Yes') {
            // Find the previous non-weekoff record for the same employee
            const previousValid = [...results.allResults].reverse().find((prev) => prev.empcode === item.empcode && prev.rowformattedDate < item.rowformattedDate && prev.isweekoff !== 'Yes' && prev.shift !== 'Not Allotted' && prev.shiftMode === 'Main Shift');

            if (previousValid) {
              const preWorkingHours = Number(previousValid.totalshifthours) - Number(previousValid.totalbreakhours);
              if (item.lopcalculation === 'Yes - Half Day') {
                finalresult[existingEntryIndex].absenthours += Number(preWorkingHours) / 2;
              }
              if (item.lopcalculation === 'Yes - Full Day') {
                finalresult[existingEntryIndex].absenthours += Number(preWorkingHours);
              }
            } else {
              const workingHours = Number(item.totalshifthours) - Number(item.totalbreakhours);
              // fallback if no valid previous non-weekoff found
              if (item.lopcalculation === 'Yes - Half Day') {
                finalresult[existingEntryIndex].absenthours += Number(workingHours) / 2;
              }
              if (item.lopcalculation === 'Yes - Full Day') {
                finalresult[existingEntryIndex].absenthours += Number(workingHours);
              }
            }
          }

          if (item.isweekoff === 'Yes') {
            // Find the previous non-weekoff record for the same employee
            const previousValid = [...results.allResults].reverse().find((prev) => prev.empcode === item.empcode && prev.rowformattedDate < item.rowformattedDate && prev.isweekoff !== 'Yes' && prev.shift !== 'Not Allotted' && prev.shiftMode === 'Main Shift');

            if (previousValid) {
              const preWorkingHours = Number(previousValid.totalshifthours) - Number(previousValid.totalbreakhours);
              finalresult[existingEntryIndex].weekoffhours += Number(preWorkingHours);
            } else {
              const workingHours = Number(item.totalshifthours) - Number(item.totalbreakhours);
              // fallback if no valid previous non-weekoff found
              finalresult[existingEntryIndex].weekoffhours += Number(workingHours);
            }
          }
          if (item.isholiday === 'Yes') {
            const workingHours = Number(item.totalshifthours) - Number(item.totalbreakhours);
            finalresult[existingEntryIndex].holidayhours += Number(workingHours);
          }

          if (item.shift !== 'Week Off' && item.shift !== 'Not Allotted' && item.shift !== undefined && item.shift !== 'undefined' && item.shift !== '') {
            if (item.clockin !== '00:00:00') {
              const shiftStartTime = item.shift?.split('to')[0];
              const differenceLate = getMinutesDifferenceForClockIn(item.clockin, shiftStartTime);
              const lateMinutes = Math.max(differenceLate, 0);
              // console.log(lateMinutes, 'lateMinutes')

              // Sort permissiontodo in ascending order of minutes
              const matchedData = attendanceCriteriaData.lateclockintodo
                .sort((a, b) => a.lateclockinminutes - b.lateclockinminutes)
                ?.filter((todo) => Number(todo.lateclockinminutes) <= lateMinutes)
                ?.reduce((nearest, current) => {
                  const currentMinutes = Number(current.lateclockinminutes);
                  const nearestMinutes = nearest ? Number(nearest.lateclockinminutes) : -1;
                  return currentMinutes > nearestMinutes ? current : nearest;
                }, null);
              // console.log(matchedData, 'matched Late')
              if (matchedData) {
                finalresult[existingEntryIndex].totallateclockin += Number(matchedData.lateclockinhours);
              }
            }
          }

          if (item.shift !== 'Week Off' && item.shift !== 'Not Allotted' && item.shift !== undefined && item.shift !== 'undefined' && item.shift !== '') {
            if (item.clockout !== '00:00:00') {
              const shiftEndTime = item.shift?.split('to')[1];
              const differenceEarly = getMinutesDifferenceForClockOut(item.clockout, shiftEndTime);
              const earlyMinutes = Math.max(differenceEarly, 0);
              // console.log(earlyMinutes, shiftEndTime, item.clockout, item.rowformattedDate, 'earlyMinutes')

              // Sort permissiontodo in ascending order of minutes
              const matchedData = attendanceCriteriaData.earlyclockouttodo
                .sort((a, b) => a.earlyclockoutminutes - b.earlyclockoutminutes)
                ?.filter((todo) => Number(todo.earlyclockoutminutes) <= earlyMinutes)
                ?.reduce((nearest, current) => {
                  const currentMinutes = Number(current.earlyclockoutminutes);
                  const nearestMinutes = nearest ? Number(nearest.earlyclockoutminutes) : -1;
                  return currentMinutes > nearestMinutes ? current : nearest;
                }, null);
              // console.log(matchedData, 'matched early')
              if (matchedData) {
                finalresult[existingEntryIndex].totalearlyclockout += Number(matchedData.earlyclockouthours);
              }
            }
          }

          finalresult[existingEntryIndex].lopcount = String(parseFloat(finalresult[existingEntryIndex].lopcount) + parseFloat(item.lopcount));
          finalresult[existingEntryIndex].paidpresentday = String(parseFloat(finalresult[existingEntryIndex].paidpresentday) + parseFloat(item.paidpresentday));
          finalresult[existingEntryIndex].totalshifthours = String(parseInt(finalresult[existingEntryIndex].totalshifthours) + parseInt(item.totalshifthours));
          finalresult[existingEntryIndex].totalbreakhours = String(parseInt(finalresult[existingEntryIndex].totalbreakhours) + parseInt(item.totalbreakhours));
        } else {
          const newItem = {
            id: item.id,
            empcode: item.empcode,
            username: item.username,
            company: item.company,
            branch: item.branch,
            unit: item.unit,
            team: item.team,
            department: item.department,
            totalnumberofdays: item.totalnumberofdays,
            empshiftdays: item.empshiftdays,
            shift: item.shift !== 'Not Allotted' ? 1 : 0,
            // weekoff: (item.clockinstatus === 'Week Off' && item.clockoutstatus === 'Week Off' && item.clockin === '00:00:00' && item.clockout === '00:00:00') ? 1 : 0,
            weekoff: weekoffdayscount,
            lopcount: item.lopcount,
            paidpresentday: item.paidpresentday,
            totalcounttillcurrendate: item.totalcounttillcurrendate,
            totalshift: item.totalshift,
            // holidayCount: (item.clockinstatus === 'Holiday' && item.clockoutstatus === 'Holiday') ? 1 : 0,
            holidayCount: holidaydayscount,
            leaveCount: leaveOnDateApproved ? 1 : 0,
            clsl: 0,
            // holiday: 0,
            totalpaiddays: 0,
            nostatus: 0,
            nostatuscount: item.clockinstatus !== 'Not Allotted' && item.clockoutstatus !== 'Not Allotted' && item.paidpresent === 'No' && item.modetarget === 'No' && item.lopcalculation === 'No' ? 1 : 0,
            doublelopcount: item.lopcalculation === 'Yes - Double Day' ? 1 : 0,
            doublehalflopcount: item.lopcalculation === 'Double Half Day' ? 0.5 : 0,
            totalshifthours: item.totalshifthours,
            totalbreakhours: item.totalbreakhours,
            totallateclockin: 0,
            totalearlyclockout: 0,
            totalearlyclockin: 0,
            totaloverclockout: 0,
            permissionhours: 0,
            clslhours: 0,
            absenthours: 0,
            weekoffhours: 0,
            holidayhours: 0,
          };

          finalresult.push(newItem);
        }
      });
      // console.log(results.allResults, 'results.allResults')
      let resultdata = finalresult?.map((item, index) => {
        const finalPaidPresentDays = Number(item.paidpresentday) - (Number(item.weekoff) + Number(item.holidayCount) + Number(item.leaveCount) + Number(item.doublelopcount) + Number(item.doublehalflopcount));
        const workingHours = Number(item.totalshifthours) - (Number(item.totalbreakhours) + Number(item.weekoffhours) + Number(item.holidayhours));
        const missedHours = Number(item.totallateclockin) + Number(item.totalearlyclockout);
        const presentHours = Number(workingHours) - (Number(missedHours) + Number(item.absenthours) + Number(item.permissionhours));
        const paidHours = Number(presentHours) + Number(item.weekoffhours) + Number(item.clslhours) + Number(item.holidayhours);

        // console.log(item.totallateclockin, item.totalearlyclockout, 'miss')
        return {
          ...item,
          // serialNumber: index + 1,
          totalnumberofdays: Number(item.totalnumberofdays),
          lopcount: Number(item.lopcount),
          clsl: item.leaveCount,
          paidpresentday: finalPaidPresentDays,
          totalpaiddays: Number(item.paidpresentday) > Number(item.shift) ? Number(item.shift) - Number(item.lopcount) : Number(item.paidpresentday) - Number(item.doublelopcount) + Number(item.doublehalflopcount),
          totalshifthours: Number(item.totalshifthours),
          workinghours: workingHours < 0 ? 0 : workingHours,
          missedhours: missedHours < 0 ? 0 : missedHours,
          presenthours: presentHours < 0 ? 0 : presentHours,
          paidhours: paidHours < 0 ? 0 : paidHours,
          monthdata: results.allResults,
        };
      });
      // console.log(resultdata, 'resultdata')
      finalAttendanceData = resultdata;

      // })
      // .catch((error) => {
      //   setLoader(true);
      //   console.error('Error in getting all results:', error);
      // });

      return resultdata;
    } catch (err) {
      console.log(err, "err")
      // setLoader(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Fetching PRoduction Date Wise Report
  const fetchProductionDateStatus = async (person, date) => {
    setPageName(!pageName);
    // console.log(person, date)
    try {
      // setLoadingProdDate(true);
      let res_applyleave = await axios.post(SERVICE.PRODUCTION_DATE_FILTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        user: person,
        date: date,
      });
      // console.log(res_applyleave?.data?.daypointsupload, "res_applyleave?.data?.daypointsupload")
      const answer = res_applyleave?.data?.daypointsupload?.length > 0 ? res_applyleave?.data?.daypointsupload[0] : '';
      // setLoadingProdDate(false);
      return answer
      // setProductionDateStatus(answer);

    } catch (err) {
      // setLoadingProdDate(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [selectedEmployeeValues, setSelectedEmployeeValues] = useState([]);

  const handleEmployeeChange = (options) => {
    const uniqueEntries = options?.filter((item, index, self) => index === self.findIndex((t) => t.company === item.company && t.branch === item.branch));
    if (uniqueEntries?.length > 1) {
      setSelectedEmployee([]);

      setPopupContentMalert("Employee's have different company and branch.Please Select Users With same company and same branch!");
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (uniqueEntries?.length === 0) {
      setSelectedEmployee([]);
    } else if (uniqueEntries?.length === 1) {
      TemplateDropdownsValue(templateCreationValue, uniqueEntries[0]);
      IdentifyUserCode(uniqueEntries[0]);

      setSelectedEmployee(options);
      let ans = options?.flatMap((a, index) => {
        return a.value;
      });

      CheckNoticePeriodMulti(ans);
      setEmployeeControlPanel(uniqueEntries[0]);
      setSelectedEmployeeValues(ans);
    }
    setDocumentPrepartion({
      ...documentPrepartion,
      issuingauthority: "Please Select Issuing Authority",
      signature: 'Please Select Signature',
      seal: 'Please Select Seal',
    });
  };

  const customValueRendererEmployee = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please Select Employee';
  };




  const [selectedBranch, setSelectedBranch] = useState([]);
  const [selectedBranchValues, setSelectedBranchValues] = useState([]);

  const handleBranchChange = (options) => {
    setSelectedBranch(options);
    setSelectedBranchValues(options?.map(data => data?.value));
    const branches = options?.map(data => data?.value);
    TemplateDropdowns(branches)
    setDocumentPrepartion({
      ...documentPrepartion,
      template: 'Please Select Template Name',
      documentname: '',
      sign: 'Please Select Signature',
      sealing: 'Please Select Seal',
      person: 'Please Select Person',
    });
  };
  const customValueRendererBranch = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please Select Branch';
  };
  // Manual keywords

  const fetchManualKeywords = async () => {
    setPageName(!pageName);
    try {
      let res_type = await axios.get(SERVICE.MANUAL_KEYWORDS_PREPARATIONS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let result = res_type.data.manualkeywordpreparation;

      const keywords = [
        ...result.map((d) => ({
          label: `${d.keywordname}-${d.value}`,
          value: `${d.keywordname}-${d.value}`,
          keyword: d.value,
          description: d.description,
          file: d.file,
          previewdocument: d.previewdocument,
        })),
      ];

      setManualKeywordOptions(keywords);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  useEffect(() => {
    fetchManualKeywords();
  }, []);
  const [uniqueCode, setUniqueCode] = useState('');

  const IdentifyUserCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.DOCUMENT_PREPARATION_CODES, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: e.company,
        branch: e.branch,
        unit: e.unit,
        team: e.team,
      });

      setUniqueCode(res?.data?.documentPreparation);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const IdentifyUserCodeEdit = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.DOCUMENT_PREPARATION_CODES, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: e.company,
        branch: e.branch,
        unit: e.unit,
        team: e.team,
      });
      // const value = res?.data?.documentPreparation + "_" + e?.team?.slice(0, 3) + "_" + templateCreationValueEdit + "_" + cateCode;
      const value = res?.data?.documentPreparation + e?.team?.slice(0, 3) + '#' + templateCreationValueEdit + '_' + cateCode;
      setCatCodeValue(value);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const CheckNoticePeriod = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(SERVICE.NOTICEPERIODAPPLY, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const answer = res?.data?.noticeperiodapply?.some((data) => data.empname === e && data.exitstatus == true);
      const answerPerson = res?.data?.noticeperiodapply?.some((data) => data.empname === e);
      setNoticePeriodEmpCheck(answer);
      setNoticePeriodEmpCheckPerson(answerPerson);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const CheckNoticePeriodMulti = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(SERVICE.NOTICEPERIODAPPLY, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const answer = res?.data?.noticeperiodapply?.some((data) => e?.includes(data.empname) && data.exitstatus == true);
      const answerPerson = res?.data?.noticeperiodapply?.some((data) => e?.includes(data.empname));
      setNoticePeriodEmpCheck(answer);
      setNoticePeriodEmpCheckPerson(answerPerson);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [issuingauthority, setIssuingAutholrity] = useState([]);
  const fetchIsssuingAuthority = async (e, val) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.ASSIGNINTERVIEW_FILTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: documentPrepartion.company === 'Please Select Company' ? '' : documentPrepartion.company,
        branch: documentPrepartion.branch === 'Please Select Branch' ? '' : documentPrepartion.branch,
        unit: documentPrepartion.unit === 'Please Select Unit' ? '' : documentPrepartion.unit,
        department: e.value,
        type: val,
        team: e.value,
      });

      // console.log(res?.data?.user, "res?.data?.user")
      //Need to do that to compare company , branch , unit , team
      const answer = res?.data?.user;

      setIssuingAutholrity(
        answer?.length > 0
          ? answer.map((Data) => ({
            ...Data,
            label: Data.companyname,
            value: Data.companyname,
          }))
          : []
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const fetchIsssuingAuthorityManual = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.ASSIGNINTERVIEW_FILTER_MANUAL, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: documentPrepartion.company === 'Please Select Company' ? '' : documentPrepartion.company,
        branch: e,
        type: 'Branch',
      });
      //Need to do that to compare company , branch , unit , team
      const answer = res?.data?.user;

      setIssuingAutholrity(
        answer?.length > 0
          ? answer.map((Data) => ({
            ...Data,
            label: Data.companyname,
            value: Data.companyname,
          }))
          : []
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const DepartDropDowns = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.get(SERVICE.DEPARTMENT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDepartmentOptions(
        res?.data?.departmentdetails.map((data) => ({
          ...data,
          label: data.deptname,
          value: data.deptname,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const CompanyDropDowns = async () => {
    setPageName(!pageName);
    try {
      setCompanyOptions(
        accessbranch
          ?.map((data) => ({
            label: data.company,
            value: data.company,
          }))
          .filter((item, index, self) => {
            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
          })
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const BranchDropDowns = async (e) => {
    setPageName(!pageName);
    try {
      setBranchOptions(
        accessbranch
          ?.filter((comp) => e.value === comp.company)
          ?.map((data) => ({
            label: data.branch,
            value: data.branch,
          }))
          .filter((item, index, self) => {
            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
          })
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const UnitDropDowns = (e) => {
    setPageName(!pageName);
    try {
      let resdata = accessbranch
        ?.filter((comp) => e === comp.branch)
        ?.map((data) => ({
          label: data.unit,
          value: data.unit,
        }))
        .filter((item, index, self) => {
          return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
        });
      const unitall = [{ label: 'ALL', value: 'ALL' }, ...resdata];

      setUnitOptions(unitall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const extractEmailFormat = async (name, id) => {
    const suser = await axios.post(SERVICE.USER_NAME_SEARCH, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      name: name,
    });

    const userFind = suser?.data?.users?.length > 0 ? suser?.data?.users[0] : 'none';
    const tempcontpanel = await axios.post(SERVICE.TEMPLATECONTROLPANEL_USERFIND, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      user: userFind,
    });
    let convert = tempcontpanel?.data?.result[0]?.emailformat;
    let fromemail = tempcontpanel?.data?.result[0]?.fromemail;
    let ccemail = tempcontpanel?.data?.result[0]?.ccemail;
    let bccemail = tempcontpanel?.data?.result[0]?.bccemail;

    setPersonId(tempcontpanel?.data?.result[0]);
    handleClickOpenLetterHeader('Email');
    setEmailValuePage({ id, convert, fromemail, ccemail, bccemail });
    // await fetchEmailForUser(emailValuePage?.id, emailValuePage?.convert, emailValuePage?.fromemail, emailValuePage?.ccemail, emailValuePage?.bccemail)
  };

  const fetchTeam = async (e) => {
    setPageName(!pageName);
    try {
      let res_type = await axios.get(SERVICE.TEAMS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let result = e === 'ALL' ? res_type.data.teamsdetails.filter((d) => d.branch === allBranch) : res_type.data.teamsdetails.filter((d) => d.unit === e && d.branch === allBranch);

      const teamall = [
        { label: 'ALL', value: 'ALL' },
        ...result.map((d) => ({
          ...d,
          label: d.teamname,
          value: d.teamname,
        })),
      ];

      setTeamOptions(teamall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchTeamNames = async (e, mode) => {
    setPageName(!pageName);
    try {
      let res_type = await axios.post(SERVICE.USERNAMES_EMP_DOCUMENT_DEPARTMENT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        department: e,
        resonablestatus: mode,
      });

      let usersEmployeemode = res_type.data.userteamgroup?.length > 0 ? res_type.data.userteamgroup : [];
      setEmployeenames(
        usersEmployeemode?.map((data) => ({
          // ...data,
          label: data.companyname,
          value: data.companyname,
          company: data.company,
          branch: data.branch,
          unit: data.unit,
          username: data.username,
          team: data.team,
          department: data.department,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //get all Employeename.
  const fetchAllEmployee = async (e) => {
    setPageName(!pageName);
    try {
      let res_module = await axios.post(SERVICE.USERNAMES_EMP_DOCUMENT_TEAM, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: documentPrepartion.company === 'Please Select Company' ? '' : documentPrepartion.company,
        branch: documentPrepartion.branch === 'Please Select Branch' ? '' : documentPrepartion.branch,
        unit: documentPrepartion.unit === 'Please Select Unit' ? '' : documentPrepartion.unit,
        team: e.value,
        resonablestatus: employeeMode,
      });
      let usersEmployeemode = res_module?.data?.userteamgroup?.length > 0 ? res_module?.data?.userteamgroup : [];

      setEmployeenames(
        usersEmployeemode?.map((data) => ({
          // ...data,
          label: data.companyname,
          value: data.companyname,
          company: data.company,
          branch: data.branch,
          unit: data.unit,
          username: data.username,
          team: data.team,
          department: data.department,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const pagesizeoptions = [
    { value: 'A3', label: 'A3' },
    { value: 'A4', label: 'A4' },
    { value: 'Certificate', label: 'Certificate' },
    { value: 'Certificate1', label: 'Certificate1' },
    { value: 'Envelope', label: 'Envelope' },
  ];

  const [agendaEditStyles, setAgendaEditStyles] = useState({});
  const handlePagenameChange = (format) => {
    if (format === 'A3') {
      setAgendaEditStyles({ width: '297mm', height: '420mm' });
    } else if (format === 'A4') {
      setAgendaEditStyles({ width: '210mm', height: '297mm' });
    } else if (format === 'Certificate') {
      setAgendaEditStyles({ width: '297mm', height: '180mm' });
    } else if (format === 'Certificate1') {
      setAgendaEditStyles({ width: '297mm', height: '200mm' });
    } else if (format === 'Envelope') {
      setAgendaEditStyles({ width: '220mm', height: '110mm' });
    }
  };

  // Helper function to create header element
  const createHeaderElement = (headContent) => {
    const headerElement = document.createElement('div');
    headerElement.innerHTML = `
    <div  style="text-align: center;">
      ${headContent}
    </div>
  `;
    return headerElement;
  };

  // Helper function to create footer element
  const createFooterElement = (footContent) => {
    const footerElement = document.createElement('div');
    footerElement.innerHTML = `
    <div style="text-align: center;" >
       ${footContent}
    </div>
  `;
    return footerElement;
  };
  // Helper function to create header element
  const createHeaderElementEdit = (headContent) => {
    const headerElement = document.createElement('div');
    headerElement.innerHTML = `
    <div style="text-align: center;">
      ${headContent}
    </div>
  `;
    return headerElement;
  };

  // Helper function to create footer element
  const createFooterElementEdit = (footContent) => {
    const footerElement = document.createElement('div');
    footerElement.innerHTML = `
    <div style="text-align: center;" >
       ${footContent}
    </div>
  `;
    return footerElement;
  };

  const [generateData, setGenerateData] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [personId, setPersonId] = useState('');
  const [imageUrlEdit, setImageUrlEdit] = useState('');
  let Allcodedata = `${BASE_URL}/document/documentpreparation/${encryptString(documentPrepartion.person)}/${personId ? personId?._id : ''}/${encryptString(documentPrepartion?.issuingauthority)}/${DateFormat}/${isUserRoleAccess?._id}`;

  let AllcodedataEdit = `${BASE_URL}/document/documentpreparation/${encryptString(documentPreparationEdit.person)}/${companyNameEdit?._id}/${encryptString(documentPreparationEdit?.issuingauthority)}/${DateFormatEdit}`;

  const generateQrCode = async () => {
    setPageName(!pageName);
    try {
      const response = await QRCode.toDataURL(`${Allcodedata}`);
      setImageUrl(response);
    } catch (error) { }
  };
  const generateQrCodeEdit = async () => {
    setPageName(!pageName);
    try {
      const response = await QRCode.toDataURL(` ${AllcodedataEdit}`);
      setImageUrlEdit(response);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    generateQrCode();
  }, [Allcodedata]);

  useEffect(() => {
    generateQrCodeEdit();
  }, [documentPreparationEdit, companyNameEdit]);

  const handleNextPage = () => {
    setIndexViewQuest(indexViewQuest + 1);
  };

  const handlePrevPage = () => {
    setIndexViewQuest(indexViewQuest - 1);
  };
  const HandleDeleteText = (index) => {
    const updatedTodos = [...checkingArray];
    updatedTodos.splice(index, 1);
    setCheckingArray(updatedTodos);
    if (updatedTodos.length > 0) {
      setIndexViewQuest(1);
    } else {
      setIndexViewQuest(0);
    }
  };
  const [emailUser, setEmailUser] = useState('');
  const [viewData, setViewData] = useState('');
  const [userESignature, setUserESignature] = useState('');

  const [employeeControlPanel, setEmployeeControlPanel] = useState('');
  // console.log(viewData, "viewData")
  const fetchAllRaisedTickets = async () => {
    setPageName(!pageName);
    try {
      let res_queue = await axios.get(SERVICE.DOCUMENT_PREPARATION_AUTOID, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let refNo = res_queue?.data?.documentPreparation?.length > 0 ? res_queue?.data?.documentPreparation[0]?.templateno : uniqueCode + employeeControlPanel?.team?.slice(0, 3) + '#' + templateCreationValue?.tempcode + '_' + '0000';
      let codenum = refNo.split('_');
      return codenum;
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  function getMonthYear(dateString) {
    if (!dateString) return
    const date = new Date(dateString);
    const month = monthNames[date.getMonth()]; // getMonth() gives 0–11
    const year = date.getFullYear(); // gives 4-digit year
    return { month, year };
  }
  const renderRefToBase64Image = async (ref) => {
    if (!ref?.current) return "";

    // Convert DOM node → canvas
    const canvas = await html2canvas(ref.current, {
      backgroundColor: "#fff",
      scale: 2, // higher = better quality
    });

    // Convert canvas → base64
    const base64Data = canvas.toDataURL("image/png");
    // console.log(base64Data, "base64Data")
    // Return an <img> tag with base64 as src
    return `<img 
    src="${base64Data}" 
    alt="Rendered Preview" 
    style="max-width:550px; max-height:450px; object-fit:contain; padding:3px;" 
  />`;
  };

  async function convertFileUrlToBase64(fileUrl) {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // This will be data:image/png;base64,xxxx
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error fetching file:", error);
      return null;
    }
  }

  const answerDefine = async (person, index) => {
    const NewDatetime = await getCurrentServerTime();
    // console.log(companyName, "companyName");
    let departmentDesigDateBased = '';


    let employeename = employeeMode === 'Manual' ? '' : person ? person : employeeValue;
    if (employeename) {
      departmentDesigDateBased = await fetchDesigDepartBasedOnDate(documentPrepartion?.manualdate, employeename)
    }

    const constAuotId = await fetchAllRaisedTickets();
    // console.log(constAuotId, employeeControlPanel, "constAuotId")
    let prefixLength = Number(constAuotId[constAuotId?.length - 1]) + (employeeControlPanel && index ? index + 1 : 1);
    let prefixString = String(prefixLength);
    let postfixLength =
      prefixString.length == 1
        ? `000${prefixString}`
        : prefixString.length == 2
          ? `00${prefixString}`
          : prefixString.length == 3
            ? `0${prefixString}`
            : prefixString.length == 4
              ? `0${prefixString}`
              : prefixString.length == 5
                ? `0${prefixString}`
                : prefixString.length == 6
                  ? `0${prefixString}`
                  : prefixString.length == 7
                    ? `0${prefixString}`
                    : prefixString.length == 8
                      ? `0${prefixString}`
                      : prefixString.length == 9
                        ? `0${prefixString}`
                        : prefixString.length == 10
                          ? `0${prefixString}`
                          : prefixString;

    let newval = employeeControlPanel
      ? uniqueCode + employeeControlPanel?.team?.slice(0, 3) + '#' + templateCreationValue?.tempcode + '_' + postfixLength
      : 'Man' + '#' + (templateCreationValue?.tempcode === '' || templateCreationValue?.tempcode === undefined ? '' : templateCreationValue?.tempcode) + '_' + postfixLength;
    let newvalRefNo = `DP_${postfixLength}`;
    const accessbranchs = accessbranch
      ? accessbranch.map((data) => ({
        branch: data.branch,
        company: data.company,
      }))
      : [];
    setPageName(!pageName);
    try {
      const [res, res_emp, res_emp_break, userDetails, companynameSettings] = await Promise.all([
        axios.post(
          SERVICE.EMPLOYEE_TEMPLATECREATION,
          {
            assignbranch: accessbranchs,
          },
          {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
          }
        ),
        axios.post(SERVICE.USER_STATUS_ANSWERDEFINE, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          employeename: employeeMode === 'Manual' ? "" : employeename,
        }),
        axios.get(SERVICE.SHIFT, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }),
        axios.post(`${SERVICE.USER_ESIGNATURE_FILTER}`, {
          companyname: employeename,
        }),
        axios.get(SERVICE.CONTROL_SETTINGS_LAST_INDEX, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }),
      ]);

      let employee = res_emp?.data?.usersstatus;
      if (companyName?.qrInfo?.length > 0) {
        setQrCodeInfoDetails(companyName?.qrInfo?.map((data, index) => `${index + 1}. ${data?.details?.replaceAll('$C:TIME$', new Date(NewDatetime).toLocaleTimeString())
          .replaceAll('$C:DATE$', date).replaceAll('$DOJ', employee ? employee?.doj : "")}`))
      }
      let attendanceDetails = "";
      if (AttendanceNeed) {
        const result = documentPrepartion.attendancesort === "Date" ? getMonthYear(documentPrepartion.attendancedate) : {};
        const attMonthCal = documentPrepartion.attendancesort === "Date" ? result?.month : documentPrepartion.attendancemonth;
        const attYearCal = documentPrepartion.attendancesort === "Date" ? result?.year : documentPrepartion.attendanceyear;
        const resultAttendance = await fetchUsersFilter(employee, attMonthCal, attYearCal, documentPrepartion.attendancesort);
        attendanceDetails = resultAttendance?.length > 0 ? (documentPrepartion.attendancesort === "Date" ? resultAttendance[0]?.monthdata?.find(data => data?.finalDate === documentPrepartion.attendancedate)?.daystatus : resultAttendance[0].lopcount) : "";
      }
      const companyTitleName = companynameSettings?.data?.overallsettings?.companyname;
      const branchAddress = isAssignBranch?.find((data) => data?.branch === res_emp?.data?.usersstatus?.branch);
      const userESignature = userDetails?.data?.semployeesignature ? userDetails?.data?.semployeesignature?.signatureimage : '';
      setUserESignature(userESignature);
      let matches = documentPrepartion?.template?.replaceAll('(', '')?.replaceAll(')', '')?.split('--');
      let format = res?.data?.templatecreation?.find((data) => data.company === matches[1] && data.branch === matches[2] && data?.name === documentPrepartion?.template?.split('--')[0]);

      let SalaryDetails = [];
      if (documentPrepartion?.employeemode !== "Manual" && SalaryNeed) {
        SalaryDetails = await fetchSalaryDetails(
          employee?.department,
          employee?.branch,
          employee?.unit,
          employee?.team,
          employee.companyname
        );
      }
      await new Promise(resolve => setTimeout(resolve, 0));
      const htmlImg = await renderRefToBase64Image(hiddenRef);

      const ProductionDetails = documentPrepartion?.employeemode !== "Manual" ? (documentPrepartion.productionsort === "Date" ? await fetchProductionDateStatus(employeeControlPanel, documentPrepartion?.productiondate)
        : documentPrepartion.productionsort === 'Month' ? await fetchDepartmentMonthsets(documentPrepartion?.productionyear)
          : []) : [];
      const salaryKeyValues = SalaryDetails?.length > 0 ? SalaryDetails[0] : "";



      // console.log(ProductionDetails, "ProductionDetails")
      setEmailUser(employee?.email);

      let employeeBreak = res_emp_break?.data?.shifts.find((data) => data?.name === employee?.shifttiming);
      let convert = format?.pageformat;
      const tempElement = document?.createElement('div');
      tempElement.innerHTML = convert;

      const listItems = Array.from(tempElement.querySelectorAll('li'));
      listItems.forEach((li, index) => {
        li.innerHTML = `${index + 1}. ${li.innerHTML}\n`;
      });

      // tempElement.appendChild(createFooterElementImage());
      let texted = tempElement.innerHTML;
      // console.log(manualKeywordOptions, "manualKeywordOptions")
      // manualKeywordOptions?.forEach((data) => {
      //   let replacement;

      //   if (data?.description) {
      //     replacement = data.description;
      //   } else if (data?.file?.filename) {
      //     const fileUrl = `${BASE_URL}/ManualDocumentPreparation/${data?.file?.filename}`;
      //     replacement = `<img src="${fileUrl}" alt="${data?.keyword}" style="max-width:150px; max-height:150px;" />`;
      //   } else {
      //     replacement = "";
      //   }

      //   texted = texted.replaceAll(data?.keyword, replacement);
      // });
      async function replaceKeywordsWithBase64() {
        for (const data of manualKeywordOptions || []) {
          let replacement = "";


          if (data?.description) {
            replacement += `<div>${data.description}</div>`;
          }
          if (data?.previewdocument) {
            replacement += `${data.previewdocument}`;
          }
          if (data?.file?.filename) {
            const fileUrl = `${BASE_URL}/ManualDocumentPreparation/${data?.file?.filename}`;
            const base64 = await convertFileUrlToBase64(fileUrl);

            if (base64) {
              replacement += `<img src="${base64}" alt="${data.keyword}" style="max-width:250px; max-height:250px;" />`;
            }
          }

          texted = texted.replaceAll(data?.keyword, replacement);
        }
      }
      await replaceKeywordsWithBase64();

      setLoadingGeneratingDatas(false);
      let branchAddressTextHorizontal = `${!branchAddress?.branchcity ? '' : branchAddress?.branchcity + ', '}${!branchAddress?.branchstate ? '' : branchAddress?.branchstate + ', '}${!branchAddress?.branchcountry ? '' : branchAddress?.branchcountry}${!branchAddress?.branchpincode ? '' : '- ' + branchAddress?.branchpincode
        }`;
      let branchAddressTextVertical = `${!branchAddress?.branchcity ? '' : branchAddress?.branchcity + ', '}${!branchAddress?.branchstate ? '' : `</br>${branchAddress?.branchstate}  , `}${!branchAddress?.branchcountry ? '' : `</br>${branchAddress?.branchcountry}`}${!branchAddress?.branchpincode ? '' : '- ' + branchAddress?.branchpincode
        }`;
      if (employeeMode === 'Manual') {
        let findMethod = texted
          .replaceAll('$UNIID$', newval ? newval : '')
          .replaceAll('$COMPANYTITLE$', companyTitleName ? companyTitleName : '')
          .replaceAll('$H.BRANCHADDRESS$', branchAddressTextHorizontal ? branchAddressTextHorizontal : '')
          .replaceAll('$V.BRANCHADDRESS$', branchAddressTextVertical ? branchAddressTextVertical : '')
          .replaceAll('$C:TIME$', new Date(NewDatetime).toLocaleTimeString())
          .replaceAll('$C:DATE$', date)
          .replaceAll('$MANUALDATE$', documentPrepartion?.manualdate);


        setChecking(findMethod);
      } else {
        let caddress = `${!employee?.cdoorno ? '' : employee?.cdoorno + ', '}${!employee?.cstreet ? '' : employee?.cstreet + ', '}${!employee?.carea ? '' : employee?.carea + ', '}
    <br>${!employee?.clandmark ? '' : employee?.clandmark + ', '}${!employee?.ctaluk ? '' : employee?.ctaluk + ', '}${!employee?.cpost ? '' : employee?.cpost + ', '}
    <br>${!employee?.ccity ? '' : employee?.ccity + ', '}${!employee?.cstate ? '' : employee?.cstate + ', '}${!employee?.ccountry ? '' : employee?.ccountry + ', '}${!employee?.cpincode ? '' : '- ' + employee?.cpincode}`;



        let GenderHeShe = employee?.gender !== '' || employee?.gender !== undefined ? (employee?.gender === 'Male' ? 'He' : employee?.gender === 'Female' ? 'She' : 'He/She') : 'He/She';

        let GenderHeShesmall = employee?.gender !== '' || employee?.gender !== undefined ? (employee?.gender === 'Male' ? 'he' : employee?.gender === 'Female' ? 'she' : 'he/she') : 'he/she';

        let GenderHimHer = employee?.gender !== '' || employee?.gender !== undefined ? (employee?.gender === 'Male' ? 'him' : employee?.gender === 'Female' ? 'her' : 'him/her') : 'him/her';

        let paddress = `${!employee?.pdoorno ? '' : employee?.pdoorno + ', '}${!employee?.pstreet ? '' : employee?.pstreet + ', '}${!employee?.parea ? '' : employee?.parea + ', '}
    <br>${!employee?.plandmark ? '' : employee?.plandmark + ', '}${!employee?.ptaluk ? '' : employee?.ptaluk + ', '}${!employee?.ppost ? '' : employee?.ppost + ', '}
    <br>${!employee?.pcity ? '' : employee?.pcity + ', '}${!employee?.pstate ? '' : employee?.pstate + ', '}${!employee?.pcountry ? '' : employee?.pcountry + ', '}
    ${!employee?.ppincode ? '' : '- ' + employee?.ppincode}`;

        let findMethod = texted
          .replaceAll('$LEGALNAME$', employee?.legalname ? employee?.legalname : '')
          .replaceAll('$RECENT_DESIGNATION$', departmentDesigDateBased ? departmentDesigDateBased?.presentdesignation : '')
          .replaceAll('$RECENT_DEPARTMENT$', departmentDesigDateBased ? departmentDesigDateBased?.presentdepartment : '')
          .replaceAll('$YEARMONTH_DEPARTMENT$', departmentDesigDateBased ? departmentDesigDateBased?.datedepartment : '')
          .replaceAll('$YEARMONTH_DESIGNATION$', departmentDesigDateBased ? departmentDesigDateBased?.datedesignation : '')
          .replaceAll('$DOJ_DEPARTMENT$', departmentDesigDateBased ? departmentDesigDateBased?.dojdepartment : '')
          .replaceAll('$DOJ_DESIGNATION$', departmentDesigDateBased ? departmentDesigDateBased?.dojdesignation : '')
          .replaceAll('$GROSS$', salaryKeyValues?.gross ? salaryKeyValues?.gross : '0.00')
          .replaceAll('$BASIC$', salaryKeyValues?.basic ? salaryKeyValues?.basic : '0.00')
          .replaceAll('$CONVEYANCE$', salaryKeyValues?.conveyance ? salaryKeyValues?.conveyance : '0.00')
          .replaceAll('$MA$', salaryKeyValues?.medicalallowance ? salaryKeyValues?.medicalallowance : '0.00')
          .replaceAll('$PRODALLOWANCE1$', salaryKeyValues?.productionallowance ? salaryKeyValues?.productionallowance : '0.00')
          .replaceAll('$PRODALLOWANCE2$', salaryKeyValues?.productionallowancetwo ? salaryKeyValues?.productionallowancetwo : '0.00')
          .replaceAll('$OTHERALLOW$', salaryKeyValues?.otherallowance ? salaryKeyValues?.otherallowance : '0.00')
          .replaceAll('$HRA$', salaryKeyValues?.hra ? salaryKeyValues?.hra : '0.00')
          .replaceAll('$ANNUALGROSSCTC$', salaryKeyValues?.annualgrossctc ? salaryKeyValues?.annualgrossctc : '0.00')
          .replaceAll('$DOB$', employee?.dob ? employee?.dob : '')
          .replaceAll('$C:ADDRESS$', caddress)
          .replaceAll('$LOGIN$', employee?.username ? employee?.username : '')
          .replaceAll('$GENDERHIM/HER$', GenderHimHer)
          .replaceAll('$MANUALDATE$', documentPrepartion?.manualdate)
          .replaceAll('$SALUTATION$', employee?.prefix ? employee?.prefix : 'Mr/Ms')
          .replaceAll('$P:ADDRESS$', paddress)
          .replaceAll('$COMPANYTITLE$', companyTitleName ? companyTitleName : '')
          .replaceAll('$H.BRANCHADDRESS$', branchAddressTextHorizontal ? branchAddressTextHorizontal : '')
          .replaceAll('$V.BRANCHADDRESS$', branchAddressTextVertical ? branchAddressTextVertical : '')
          .replaceAll('$F.COMPANY$', '')
          .replaceAll('$F.BRANCH$', '')
          .replaceAll('$F.BRANCHADDRESS$', '')
          .replaceAll('$T.COMPANY$', '')
          .replaceAll('$T.COMPANYADDRESS$', '')
          .replaceAll('$GENDERHE/SHE$', GenderHeShe)
          .replaceAll('$GENDERHE/SHE/SMALL$', GenderHeShesmall)
          .replaceAll('$EMAIL$', employee?.email ? employee?.email : '')
          .replaceAll('$P:NUMBER$', employee?.contactpersonal ? employee?.contactpersonal : '')
          .replaceAll('$DOJ$', employee?.doj ? employee?.doj : '')
          .replaceAll('$EMPCODE$', employee?.empcode ? employee?.empcode : '')
          .replaceAll('$BRANCH$', employee?.branch ? employee?.branch : '')
          .replaceAll('$UNIT$', employee?.unit ? employee?.unit : '')
          .replaceAll('$DESIGNATION$', employee?.designation ? employee?.designation : '')
          .replaceAll('$C:NAME$', employee?.companyname ? employee?.companyname : '')
          .replaceAll('$TEAM$', employee?.team ? employee?.team : '')
          .replaceAll('$PROCESS$', employee?.process ? employee?.process : '')
          .replaceAll('$DEPARTMENT$', employee?.department ? employee.department : '')
          .replaceAll('$LWD$', employee?.reasondate ? employee?.reasondate : '')
          .replaceAll('$SHIFT$', employee?.shifttiming ? employee?.shifttiming : '')
          .replaceAll('$AC:NAME$', employee?.accname ? employee?.accname : '')
          .replaceAll('$AC:NUMBER$', employee?.accno ? employee?.accno : '')
          .replaceAll('$IFSC$', employee?.ifsc ? employee?.ifsc : '')
          .replaceAll('$AC:NUMBER$', employee?.accno ? employee?.accno : '')
          .replaceAll('$C:DATE$', date)
          .replaceAll('$DOJSALARYCOMPONENT$', (SalaryNeed && selectedModeType === "DOJ") ? htmlImg : "")
          .replaceAll('$MONTHYEARSALARYCOMPONENT$', (SalaryNeed && selectedModeType !== "DOJ") ? htmlImg : "")
          .replaceAll('$C:TIME$', new Date(NewDatetime).toLocaleTimeString())
          .replaceAll('$BREAK$', employeeBreak?.breakhours ? employeeBreak?.breakhours : '')
          .replaceAll('$F:NAME$', employee?.firstname ? employee?.firstname : '')
          .replaceAll('$L:NAME$', employee?.lastname ? employee?.lastname : '')
          .replaceAll('$WORKSTATION:NAME$', employee?.workstation ? employee?.workstation : '')
          .replaceAll('$WORKSTATION:COUNT$', employee?.workstation ? employee?.workstation?.length : '')
          .replaceAll('$SYSTEM:COUNT$', employee?.employeecount ? employee?.employeecount : '')
          .replaceAll('$UNIID$', newval ? newval : '')
          .replaceAll('$ATTENDANCEDATE$', (documentPrepartion?.attendancesort === "Date" && AttendanceNeed) ? attendanceDetails : '')
          .replaceAll('$ATTENDANCEMONTH$', (documentPrepartion?.attendancesort === "Month" && AttendanceNeed) ? attendanceDetails : '')
          .replaceAll('$PRODUCTIONDATEPOINT$', (ProductionNeed && ProductionDetails) ? ProductionDetails?.point : '')
          .replaceAll('$PRODUCTIONDATETARGET$', (ProductionNeed && ProductionDetails) ? ProductionDetails?.target : '')
          .replaceAll('$PRODUCTIONMONTHTARGET$', (productionMonthStatus && documentPrepartion?.productionsort === "Month") ? productionMonthStatus?.target : '')
          .replaceAll('$PRODUCTIONMONTHPOINT$', (productionMonthStatus && documentPrepartion?.productionsort === "Month") ? productionMonthStatus?.point : '')
          .replaceAll(
            '$RSEAL$',
            sealPlacement
              ? `<span style="display: inline-block; position: relative; width: 100px; height: 90px;">
         <img src="${sealPlacement}" alt="Seal" style="position: absolute; z-index: -1; width: 100px; height: 90px;" />
       </span>`
              : ''
          )
          .replaceAll(
            '$FSIGNATURE$',
            signatureContent?.seal === 'For Seal'
              ? `<span style="display: inline-block; vertical-align: top;">
          <span style="color:#53177e; font-weight: bold;">${signatureContent?.topcontent}</span><br/>
          ${signature
                ? `<span style="position: relative; display: inline-block;">
                   <img src="${signature}" alt="Signature" style="position: absolute; z-index: -1; width: 200px; height: 30px;" />
                 </span><br/>`
                : ''
              }
          <span style="color:#53177e; font-weight: bold; display: inline-block; margin-top: 25px;">
            ${signatureContent?.bottomcontent}
          </span>
       </span>`
              : ''
          )
          .replaceAll(
            '$EMPLOYEESIGNATURE$',
            userESignature
              ? `
      <span style="position: relative; display: inline-block;">
        <img src="${userESignature}" alt="Signature" 
          style="
            position: absolute;
            z-index: 10;
            width: 200px;
            height:40px;
            top: -5px;
            pointer-events: none;
            background: transparent;
          "
        />
      </span>
    `
              : ''
          );

        // .replaceAll("$SIGNATURE$", signatureContent?.seal === "None" ? `
        // <img src="${signature}" alt="Signature" style="position:absolute; z-index:-1; width: 200px; height: 30px;" />
        //      ` : "")
        //      .replaceAll("$EMPLOYEESIGNATURE$", userESignature ? `
        //       <span style="display: inline-flex; flex-direction: column; align-items: center; text-align: center;">
        //           <img src="${userESignature}" alt="Signature" style="${pageSizePdf === 'A3' ? 'width: 200px !important; height: 30px !important;' : 'width: 130px !important; height: 25px !important;'}"/>
        //       </span>
        //   ` : "");
        // console.log(signatureContent, "signatureContent")
        const answer = [];
        answer.push({
          empname: employeename,
          template: documentPrepartion?.template,
          documentname: documentPrepartion?.documentname,
          issuingauthority: documentPrepartion?.issuingauthority,
          department: String(documentPrepartion.department),
          company: employee?.company ? String(employee?.company) : String(documentPrepartion.company),
          branch: employee?.branch ? String(employee?.branch) : String(documentPrepartion.branch),
          unit: employee?.unit ? String(employee?.unit) : String(documentPrepartion.unit),
          team: employee?.team ? String(employee?.team) : String(documentPrepartion.team),
          employeedoj: employee?.doj ? employee?.doj : "",
          autoid: newval,
          employeemode: String(documentPrepartion.employeemode),
          data: findMethod,
          referenceno: newvalRefNo,
          pagenumberneed: String(documentPrepartion.pagenumberneed),
          signatureneed: String(documentPrepartion.signatureneed),
          qrcodevalue: String(documentPrepartion.qrcodevalue),
          documentneed: String(documentPrepartion.documentneed),
          proption: String(documentPrepartion.proption),
          email: employee?.email,
          tempcode: templateCreationValue?.tempcode,
          watermark: waterMarkText,
          qrcodeNeed: qrCodeNeed,
          qrcode: imageUrl,
          signature: signature,
          signaturetype: signatureContent?.seal ? signatureContent?.seal : "",
          topcontent: signatureContent?.topcontent ? signatureContent?.topcontent : "",
          bottomcontent: signatureContent?.bottomcontent ? signatureContent?.bottomcontent : "",
          usersignature: userESignature ? userESignature : "",
          seal: sealPlacement,
          frommailemail: fromEmail,
          pageheight: agendaEditStyles.height,
          pagewidth: agendaEditStyles.width,
          printoptions: documentPrepartion?.printoptions,
          header: head,
          footer: foot,
          headvalue: headvalueAdd,
          pagesize: pageSizePdf,
          sign: documentPrepartion.signature,
          sealing: documentPrepartion.seal,
          orientation: agendaEditStyles.orientation,
        });
        setCheckingArray((prev) => [...answer, ...prev]);
        // console.log(answer, "4009")
        setIndexViewQuest(1);
      }

      setDocumentPrepartion({
        ...documentPrepartion,
        person: 'Please Select Person',
        pagenumberneed: 'All Pages',
        signatureneed: 'No Need',
        qrcodevalue: 'All Pages',
        issuingauthority: 'Please Select Issuing Authority',
        attendancesort: 'Please Select Attendance Sort',
        productionsort: 'Please Select Production Sort',
        salarysort: 'Please Select Salary Sort',
        attendancedate: '',
        productiondate: '',
        attendancemonth: 'Please Select Attendance Month',
        productionmonth: 'Please Select Production Month',
        attendanceyear: 'Please Select Attendance Year',
        productionyear: 'Please Select Production Year',
        proption: 'Please Select Print Option',
        pagesize: 'Please Select pagesize',
        print: 'Please Select Print Option',
        heading: 'Please Select Header Option',
        signature: 'Please Select Signature',
        seal: 'Please Select Seal',
      });
      setSelectedEmployeeValues([]);
      setSelectedEmployee([]);
      setIndexViewQuest(1);
      departmentDesigDateBased = '';

    } catch (err) {
      console.log(err, "err")
      setLoadingGeneratingDatas(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const value = uniqueCode + employeeControlPanel?.team?.slice(0, 3) + '#' + templateCreationValue?.tempcode;
  const handlePrintDocument = (index) => {
    if (documentPrepartion?.documentneed !== 'Employee Approval' && headerOptions === 'Please Select Print Options') {
      // setButtonLoadingPreview(false);
      setPopupContentMalert('Please Select Print Options!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion?.documentneed !== 'Employee Approval' && headerOptions === 'With Letter Head' && selectedHeadOpt?.length < 1) {
      setPopupContentMalert('Please Select With Letter Head!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (generateData) {
      setPopupContentMalert("This Employee's company and branch is not matched with Template control panel data.Add the details in Template control panel!");
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      setButtonLoading(true);
      setLoadingPrintData(true);

      setHeaderOptionsButton(true);
      downloadPdfTesdtCheckTrue(index)
        .then((isMultiPage) => {
          setHeaderOptionsButton(false);
          if (isMultiPage && templateCreationValue?.pagemode === 'Single Page') {
            setButtonLoading(false);
            setLoadingPrintData(false);
            setHeaderOptionsButton(false);
            setPopupContentMalert(`This Template has  page mode of ${templateCreationValue?.pagemode} but provided is
            ${templateCreationValue?.pagemode === 'Single Page' ? 'more than expected' : 'not sufficient'}  to print documents`);
            setPopupSeverityMalert('info');
            handleClickOpenPopupMalert();
          } else {
            setButtonLoading(false);
            handleClickOpenInfoImagePrint();
          }
        })
        .catch((error) => {
          console.error('Error generating PDF:', error);
        });
    }
  };
  const handlePrintDocumentManual = () => {
    if (documentPrepartion?.documentneed !== 'Employee Approval' && headerOptions === 'Please Select Print Options') {
      setButtonLoadingPreview(false);
      setPopupContentMalert('Please Select Print Options!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion?.documentneed !== 'Employee Approval' && headerOptions === 'With Letter Head' && selectedHeadOpt?.length < 1) {
      setPopupContentMalert('Please Select With Letter Head!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (checking.match(regex)?.filter((data) => !['$SIGNATURE$', '$FSIGNATURE$', '$EMPLOYEESIGNATURE$', '$RSEAL$']?.includes(data))?.length > 0) {
      setPopupContentMalert('Fill All the Fields Which starts From $ and Ends with $');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (generateData) {
      setPopupContentMalert("This Employee's company and branch is not matched with Template control panel data.Add the details in Template control panel");
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      setLoadingPrintManualData(true);
      setButtonLoading(true);
      downloadPdfTesdtCheckTrueManual()
        .then((isMultiPage) => {
          if (isMultiPage && templateCreationValue?.pagemode === 'Single Page') {
            setButtonLoading(false);
            setLoadingPrintManualData(false);
            setPopupContentMalert(`This Template has  page mode of ${templateCreationValue?.pagemode} but provided is
            ${templateCreationValue?.pagemode === 'Single Page' ? 'more than expected' : 'not sufficient'}  to print documents`);
            setPopupSeverityMalert('info');
            handleClickOpenPopupMalert();
          } else {
            setButtonLoading(false);
            handleClickOpenInfoImagePrintManual();
          }
        })
        .catch((error) => {
          console.error('Error generating PDF:', error);
        });
    }
  };

  const downloadPdfTesdt = (index) => {
    if (!noticePeriodEmpCheck && noticePeriodEmpCheckPerson) {
      setPopupContentMalert('This Employee is not eligibile to receieve any kind of documents!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      setButtonLoading(true);
      // Create a new div element to hold the Quill content
      const pdfElement = document.createElement('div');
      pdfElement.innerHTML = checkingArray[index]?.data.replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`);
      const pdfElementHead = document.createElement('div');
      pdfElementHead.innerHTML = checkingArray[index]?.header;
      // Add custom styles to the PDF content
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .ql-indent-1 { margin-left: 75px; } /* Adjust margin for indent-1 class */
        .ql-indent-2 { margin-left: 150px; } /* Adjust margin for indent-2 class */
        .ql-indent-3 { margin-left: 225px; } /* Adjust margin for indent-3 class */
        .ql-indent-4 { margin-left: 275px; } /* Adjust margin for indent-4 class */
        .ql-indent-5 { margin-left: 325px; } /* Adjust margin for indent-5 class */
        .ql-indent-6 { margin-left: 375px; } /* Adjust margin for indent-6 class */
        .ql-indent-7 { margin-left: 425px; } /* Adjust margin for indent-7 class */
        .ql-indent-8 { margin-left: 475px; } /* Adjust margin for indent-8 class */
        .ql-align-right { text-align: right; }
        .ql-align-left { text-align: left; }
        .ql-align-center { text-align: center; }
        .ql-align-justify { text-align: justify; }
                          .page-break-label {
    page-break-before: always;
    break-before: page;
    margin: 20px 0;
  }
      `;

      pdfElement.appendChild(styleElement);

      // Create a watermark element
      const watermarkElement = document.createElement('div');
      watermarkElement.style.position = 'absolute';
      watermarkElement.style.left = '0';
      watermarkElement.style.top = '0';
      watermarkElement.style.width = '100%';
      watermarkElement.style.height = '100%';
      watermarkElement.style.display = 'flex';
      watermarkElement.style.alignItems = 'center';
      watermarkElement.style.justifyContent = 'center';
      watermarkElement.style.opacity = '0.09'; // Adjust the opacity as needed
      watermarkElement.style.pointerEvents = 'none'; // Make sure the watermark doesn't interfere with user interactions

      // Create and append an image element
      const watermarkImage = document.createElement('img');
      watermarkImage.src = checkingArray[index]?.watermark; // Replace "path_to_your_image" with the actual path to your image
      watermarkImage.style.width = '75%'; // Adjust the width of the image
      watermarkImage.style.height = '50%'; // Adjust the height of the image
      watermarkImage.style.objectFit = 'contain'; // Adjust the object-fit property as needed

      watermarkElement.appendChild(watermarkImage);
      const addPageNumbersAndHeadersFooters = (doc, watermarkImage, qrCodeImage) => {
        const totalPages = doc.internal.getNumberOfPages();
        const margin = 15; // Adjust as needed
        const footerHeight = 15; // Adjust as needed
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.innerHTML = pdfElement;
        document.body.appendChild(tempDiv);
        const rect = tempDiv.getBoundingClientRect();
        const reservedSealHeight = 45;
        const actualContentHeight = rect.height * (25.4 / 96);
        const pageHeight = doc.internal.pageSize.getHeight();
        // Total usable height for content
        const usableContentHeight = pageHeight - footerHeight - margin - reservedSealHeight;
        const contentEndY = Math.min(actualContentHeight, usableContentHeight);


        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const contentEndY = pageHeight - footerHeight - margin - 20; // leave gap above footer

          // Add header
          doc.setFontSize(12);
          // doc.text(convertToNumberedList(head), pageWidth / 2, 10, { align: 'center' });
          const headerImgWidth = pageWidth * 0.95; // Adjust as needed
          const headerImgHeight = pageHeight * 0.09; // Adjust as needed
          const headerX = 5; // Start from the left
          const headerY = 3.5; // Start from the top
          if (head !== '') {
            doc.addImage(head, 'JPEG', headerX, headerY, headerImgWidth, headerImgHeight, '', 'FAST', 0.1);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(headerX, headerY, headerImgWidth, headerImgHeight, 'F'); // "F" = filled rectangle
          }

          if (head !== '') {
            const imgWidth = pageWidth * 0.5;
            const imgHeight = pageHeight * 0.25;
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2 - 20;
            doc.setFillColor(0, 0, 0, 0.1);
            doc.addImage(watermarkImage, 'PNG', x, y, imgWidth, imgHeight, '', 'FAST', 0.01);
          }
          // Add footer
          doc.setFontSize(10);
          // Add footer image stretched to page width
          const footerImgWidth = pageWidth * 0.95; // Stretch to full page width
          const footerImgHeight = pageHeight * 0.067; // Adjust height as needed
          const footerX = 5; // Start from the left

          const footerY = pageHeight - footerImgHeight - 5;
          if (foot !== "") {
            doc.addImage(foot, 'JPEG', footerX, footerY, footerImgWidth, footerImgHeight, '', 'FAST', 0.1);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(footerX, footerY, footerImgWidth, footerImgHeight, 'F');
          }

          // ---------- SIGNATURE & SEAL ----------
          // if (checkingArray[index]?.signatureneed) {
          const signatureNeed = checkingArray[index]?.signatureneed; // "All Pages" or "End Page"

          if (signatureNeed === "All Pages" || (signatureNeed === "End Page" && i === totalPages)) {
            // Decide Y position right after content but above footer
            const imageY = contentEndY;

            // Seal on left
            if (checkingArray[index]?.signature || checkingArray[index]?.seal || checkingArray[index]?.usersignature) {
              const pageWidth = doc.internal.pageSize.getWidth();
              const pageHeight = doc.internal.pageSize.getHeight();
              const margin = 15;
              const footerGap = 20; // space to keep above footer

              // --- Unified Row Position ---
              const rowYOffset = 10; // ✅ Move row slightly lower
              const sigWidth = 40;    // reduced from 53
              const sigHeight = 6;    // reduced from 8

              const sealWidth = 17;   // reduced from 25/35
              const sealHeight = 17;  // reduced from 25/35
              const sealUpShift = 8;
              // ✅ Make user signature a bit wider but slightly shorter
              const userSigWidth = 47;  // increased width
              const userSigHeight = 20; // reduced height
              const userSigUpShift = 11;
              let yPos;

              if (i === totalPages) {
                // ✅ Use available space from bottom instead of rect.height
                yPos = checkingArray[index]?.qrcodeNeed ? (pageHeight - footerGap - userSigHeight - 30) : (pageHeight - footerGap - userSigHeight); // stays near bottom
              } else {
                yPos = contentEndY + rowYOffset;
              }

              const topTextHeight = 6;
              const bottomTextHeight = 6;

              // --- Left: Main Signature ---
              let leftX = margin;
              if (checkingArray[index]?.signature) {
                if (checkingArray[index]?.signaturetype === "For Seal" && checkingArray[index]?.topcontent) {
                  doc.setFontSize(8);
                  doc.setFont(undefined, "bold");
                  doc.setTextColor(83, 23, 126);
                  doc.text(checkingArray[index].topcontent, leftX, yPos - topTextHeight);
                  doc.setTextColor(0, 0, 0);
                }

                doc.addImage(checkingArray[index].signature, "PNG", leftX, yPos, sigWidth, sigHeight);

                if (checkingArray[index]?.signaturetype === "For Seal" && checkingArray[index]?.bottomcontent) {
                  doc.setFontSize(8);
                  doc.setFont(undefined, "bold");
                  doc.setTextColor(83, 23, 126);
                  doc.text(
                    checkingArray[index].bottomcontent,
                    leftX,
                    yPos + sigHeight + bottomTextHeight
                  );
                  doc.setTextColor(0, 0, 0);
                }
              }

              // --- Center: Seal (align with same yPos) ---
              const centerX = (pageWidth / 2) - (sealWidth / 2);
              if (checkingArray[index]?.seal) {
                doc.addImage(checkingArray[index].seal, "PNG", centerX, yPos - sealUpShift, sealWidth, sealHeight);
              }

              // --- Right: Employee Signature (aligned with row, adjusted size) ---
              let rightX = pageWidth - userSigWidth - margin - 10;
              if (checkingArray[index]?.usersignature) {
                doc.addImage(
                  checkingArray[index].usersignature,
                  "PNG",
                  rightX,
                  yPos - userSigUpShift, // ✅ Same yPos as others (aligned row)
                  userSigWidth,
                  userSigHeight
                );
              }
            }




          }
          // }
          if (checkingArray[index]?.pagenumberneed === 'All Pages') {
            const textY = footerY - 3;
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, textY, { align: 'center' });
          } else if (checkingArray[index]?.pagenumberneed === 'End Page' && i === totalPages) {
            const textY = footerY - 3;
            doc.text(`End of the document`, pageWidth / 2, textY, { align: 'center' });
          }
          if (checkingArray[index]?.qrcodeNeed && checkingArray[index]?.qrcodevalue === "End Page") {
            // Add QR code and statement only on the last page
            if (i === totalPages) {
              // Add QR code in the left corner
              const qrCodeWidth = 25; // Adjust as needed
              const qrCodeHeight = 25; // Adjust as needed
              const qrCodeX = footerX; // Left corner
              const qrCodeY = footerY - qrCodeHeight - 15; // 15 units above the footer image
              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

              const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                '1. Scan to verify the authenticity of this document.',
                `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                `3. For questions, contact us at ${checkingArray[index]?.frommailemail}.`
              ];

              // starting position
              const statementX = qrCodeX + qrCodeWidth + 10;
              const statementY1 = qrCodeY + 10;
              const lineGap = 5; // vertical spacing between statements

              doc.setFontSize(12);

              statements.forEach((text, idx) => {
                const y = statementY1 + (idx * lineGap);
                doc.text(text, statementX, y);
              });

            }
            // doc.text(statementText, statementX, statementY, { maxWidth: lineWidth });
          }
          if (checkingArray[index]?.qrcodeNeed && checkingArray[index]?.qrcodevalue === "All Pages") {
            // Add QR code and statement only on the last page
            if (i === totalPages) {
              // Add QR code in the left corner
              const qrCodeWidth = 25; // Adjust as needed
              const qrCodeHeight = 25; // Adjust as needed
              const qrCodeX = footerX; // Left corner
              const qrCodeY = footerY - qrCodeHeight - 15; // 15 units above the footer image
              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

              const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                '1. Scan to verify the authenticity of this document.',
                `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                `3. For questions, contact us at ${checkingArray[index]?.frommailemail}.`
              ];

              // starting position
              const statementX = qrCodeX + qrCodeWidth + 10;
              const statementY1 = qrCodeY + 10;
              const lineGap = 5; // vertical spacing between statements

              doc.setFontSize(12);

              statements.forEach((text, idx) => {
                const y = statementY1 + (idx * lineGap);
                doc.text(text, statementX, y);
              });

            }
            else {
              // ✅ for all other pages → add page number + small QR code on the right
              const textY = footerY - 3;
              // small QR code next to it (bottom-right corner)
              const qrCodeWidth = 15;   // smaller size
              const qrCodeHeight = 15;
              const qrCodeX = pageWidth - qrCodeWidth - 15; // margin from right
              const qrCodeY = footerY - qrCodeHeight - 3;   // align with page text

              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
            }
            // doc.text(statementText, statementX, statementY, { maxWidth: lineWidth });
          }
        }
      };
      // Convert the HTML content to PDF
      if (pdfElement) {
        const hasHeaderImage = checkingArray[index]?.header !== ''; // assuming head is a base64 src or image URL
        const hasFooterImage = checkingArray[index]?.footer !== '';

        const adjustedMargin = getAdjustedMargin(selectedMargin, hasHeaderImage, hasFooterImage);
        const pdfDimensions = getPageDimensions(); // as before

        html2pdf()
          .from(pdfElement)
          .set({
            margin: adjustedMargin,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: {
              unit: 'mm',
              format: pdfDimensions,
              orientation: pageOrientation,
            },
            // lineHeight: 0, // Increased line spacing
            // fontSize: 12,
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
          })
          .toPdf()
          .get('pdf')
          .then((pdf) => {
            // Convert the watermark image to a base64 string
            const img = new Image();
            img.src = waterMarkText;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.globalAlpha = 0.1;
              ctx.drawImage(img, 0, 0);
              const watermarkImage = canvas.toDataURL('image/png');
              // Add QR code image
              const qrImg = new Image();
              qrImg.src = checkingArray[index]?.qrcodeNeed ? checkingArray[index]?.qrcode : ''; // QR code image URL
              if (checkingArray[index]?.qrcodeNeed) {
                qrImg.onload = () => {
                  const qrCanvas = document.createElement('canvas');
                  qrCanvas.width = qrImg.width;
                  qrCanvas.height = qrImg.height;
                  const qrCtx = qrCanvas.getContext('2d');
                  qrCtx.drawImage(qrImg, 0, 0);
                  const qrCodeImage = qrCanvas.toDataURL('image/png');
                  // Add page numbers, watermark, and QR code to each page
                  addPageNumbersAndHeadersFooters(pdf, watermarkImage, qrCodeImage);
                  // Save the PDF
                  pdf.save(`${checkingArray[index]?.template}_${checkingArray[index]?.empname}.pdf`);
                  setLoadingPrintData(false);
                  setButtonLoading(false);
                  setHeaderOptionsButton(false);
                  handleCloseInfoImagePrint();
                  handleClickCloseLetterHead();
                };
              } else {
                addPageNumbersAndHeadersFooters(pdf, watermarkImage, '');
                // Save the PDF
                pdf.save(`${checkingArray[index]?.template}_${checkingArray[index]?.empname}.pdf`);
                setLoadingPrintData(false);
                setButtonLoading(false);
                setHeaderOptionsButton(false);
                handleCloseInfoImagePrint();
                handleClickCloseLetterHead();
              }
            };
          })
          .catch((error) => {
            console.error('Error generating PDF:', error);
            setButtonLoading(false);
          });
      }
    }
  };

  const downloadPdfTesdtManual = () => {
    if (!noticePeriodEmpCheck && noticePeriodEmpCheckPerson) {
      setPopupContentMalert('This Employee is not eligibile to receieve any kind of documents!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      setLoadingPrintMessage('Document is ready to print...');
      setButtonLoading(true);
      // Create a new div element to hold the Quill content
      const pdfElement = document.createElement('div');
      pdfElement.innerHTML = checking;
      let findMethod = checking
        ?.replaceAll(
          '$RSEAL$',
          sealPlacement
            ? `<span style="display: inline-block; position: relative; width: 100px; height: 90px;">
         <img src="${sealPlacement}" alt="Seal" style="position: absolute; z-index: -1; width: 100px; height: 90px;" />
       </span>`
            : ''
        )
        .replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`)
        .replaceAll(
          '$FSIGNATURE$',
          signatureContent?.seal === 'For Seal'
            ? `<span style="display: inline-block; vertical-align: top;">
          <span style="color:#53177e; font-weight: bold;">${signatureContent?.topcontent}</span><br/>
          ${signature
              ? `<span style="position: relative; display: inline-block;">
                   <img src="${signature}" alt="Signature" style="position: absolute; z-index: -1; width: 200px; height: 30px;" />
                 </span><br/>`
              : ''
            }
          <span style="color:#53177e; font-weight: bold; display: inline-block; margin-top: 25px;">
            ${signatureContent?.bottomcontent}
          </span>
       </span>`
            : ''
        )
        .replaceAll(
          '$SIGNATURE$',
          signatureContent?.seal === 'None'
            ? `
      <img src="${signature}" alt="Signature" style="position:absolute; z-index:-1; width: 200px; height: 30px;" />
           `
            : ''
        );
      pdfElement.innerHTML = DOMPurify.sanitize(findMethod);
      const pdfElementHead = document.createElement('div');
      pdfElementHead.innerHTML = head;

      // Add custom styles to the PDF content
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .ql-indent-1 { margin-left: 75px; } /* Adjust margin for indent-1 class */
        .ql-indent-2 { margin-left: 150px; } /* Adjust margin for indent-2 class */
        .ql-indent-3 { margin-left: 225px; } /* Adjust margin for indent-3 class */
        .ql-indent-4 { margin-left: 275px; } /* Adjust margin for indent-4 class */
        .ql-indent-5 { margin-left: 325px; } /* Adjust margin for indent-5 class */
        .ql-indent-6 { margin-left: 375px; } /* Adjust margin for indent-6 class */
        .ql-indent-7 { margin-left: 425px; } /* Adjust margin for indent-7 class */
        .ql-indent-8 { margin-left: 475px; } /* Adjust margin for indent-8 class */
        .ql-align-right { text-align: right; } 
        .ql-align-left { text-align: left; } 
        .ql-align-center { text-align: center; } 
        .ql-align-justify { text-align: justify; } 
                          .page-break-label {
    page-break-before: always;
    break-before: page;
    margin: 20px 0;
  }
      `;

      pdfElement.appendChild(styleElement);

      // Create a watermark element
      const watermarkElement = document.createElement('div');
      watermarkElement.style.position = 'absolute';
      watermarkElement.style.left = '0';
      watermarkElement.style.top = '0';
      watermarkElement.style.width = '100%';
      watermarkElement.style.height = '100%';
      watermarkElement.style.display = 'flex';
      watermarkElement.style.alignItems = 'center';
      watermarkElement.style.justifyContent = 'center';
      watermarkElement.style.opacity = '0.09'; // Adjust the opacity as needed
      watermarkElement.style.pointerEvents = 'none'; // Make sure the watermark doesn't interfere with user interactions

      // Create and append an image element
      const watermarkImage = document.createElement('img');
      watermarkImage.src = waterMarkText; // Replace "path_to_your_image" with the actual path to your image
      watermarkImage.style.width = '75%'; // Adjust the width of the image
      watermarkImage.style.height = '50%'; // Adjust the height of the image
      watermarkImage.style.objectFit = 'contain'; // Adjust the object-fit property as needed

      watermarkElement.appendChild(watermarkImage);

      const addPageNumbersAndHeadersFooters = (doc, watermarkImage, qrCodeImage) => {
        const totalPages = doc.internal.getNumberOfPages();
        const margin = 15; // Adjust as needed
        const footerHeight = 15; // Adjust as needed
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.innerHTML = pdfElement;
        document.body.appendChild(tempDiv);
        const rect = tempDiv.getBoundingClientRect();
        const reservedSealHeight = 45;
        const actualContentHeight = rect.height * (25.4 / 96);
        const pageHeight = doc.internal.pageSize.getHeight();
        // Total usable height for content
        const usableContentHeight = pageHeight - footerHeight - margin - reservedSealHeight;
        const contentEndY = Math.min(actualContentHeight, usableContentHeight);

        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const contentEndY = pageHeight - footerHeight - margin - 20; // leave gap above footer

          doc.setFontSize(12);
          const headerImgWidth = pageWidth * 0.95;
          const headerImgHeight = pageHeight * 0.09;
          const headerX = 5;
          const headerY = 3.5;
          if (head !== '') {
            doc.addImage(head, 'JPEG', headerX, headerY, headerImgWidth, headerImgHeight, '', 'FAST', 0.1);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(headerX, headerY, headerImgWidth, headerImgHeight, 'F'); // "F" = filled rectangle

          }
          const imgWidth = pageWidth * 0.5;
          const imgHeight = pageHeight * 0.25;
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2 - 20;
          doc.setFillColor(0, 0, 0, 0.1);
          doc.addImage(watermarkImage, 'PNG', x, y, imgWidth, imgHeight, '', 'FAST', 0.01);

          doc.setFontSize(10);
          const footerImgWidth = pageWidth * 0.95;
          const footerImgHeight = pageHeight * 0.067;
          const footerX = 5;
          const footerY = pageHeight - footerImgHeight - 5;
          if (foot !== "") {
            doc.addImage(foot, 'JPEG', footerX, footerY, footerImgWidth, footerImgHeight, '', 'FAST', 0.1);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(footerX, footerY, footerImgWidth, footerImgHeight, 'F');
          }
          if (documentPrepartion?.pagenumberneed === 'All Pages') {
            const textY = footerY - 3;
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, textY, { align: 'center' });
          } else if (documentPrepartion?.pagenumberneed === 'End Page' && i === totalPages) {
            const textY = footerY - 3;
            doc.text(`End of the document`, pageWidth / 2, textY, { align: 'center' });
          }


          // ---------- SIGNATURE & SEAL ----------
          // if (documentPrepartion?.signatureneed) {
          const signatureNeed = documentPrepartion?.signatureneed; // "All Pages" or "End Page"

          if (signatureNeed === "All Pages" || (signatureNeed === "End Page" && i === totalPages)) {
            // Decide Y position right after content but above footer
            const imageY = contentEndY;

            // Seal on left
            if (documentPrepartion?.signature || documentPrepartion?.seal || documentPrepartion?.usersignature) {
              const pageWidth = doc.internal.pageSize.getWidth();
              const pageHeight = doc.internal.pageSize.getHeight();
              const margin = 15;
              const footerGap = 20; // space to keep above footer

              // --- Unified Row Position ---
              const rowYOffset = 10; // ✅ Move row slightly lower
              const sigWidth = 40;    // reduced from 53
              const sigHeight = 6;    // reduced from 8

              const sealWidth = 17;   // reduced from 25/35
              const sealHeight = 17;  // reduced from 25/35
              const sealUpShift = 8;
              // ✅ Make user signature a bit wider but slightly shorter
              const userSigWidth = 47;  // increased width
              const userSigHeight = 20; // reduced height
              const userSigUpShift = 11;
              let yPos;

              if (i === totalPages) {
                // ✅ Use available space from bottom instead of rect.height
                yPos = documentPrepartion?.qrcodeNeed ? (pageHeight - footerGap - userSigHeight - 30) : (pageHeight - footerGap - userSigHeight); // stays near bottom
              } else {
                yPos = contentEndY + rowYOffset;
              }

              const topTextHeight = 6;
              const bottomTextHeight = 6;

              // --- Left: Main Signature ---
              let leftX = margin;
              if (documentPrepartion?.signature) {
                if (documentPrepartion?.signaturetype === "For Seal" && documentPrepartion?.topcontent) {
                  doc.setFontSize(8);
                  doc.setFont(undefined, "bold");
                  doc.setTextColor(83, 23, 126);
                  doc.text(documentPrepartion.topcontent, leftX, yPos - topTextHeight);
                  doc.setTextColor(0, 0, 0);
                }

                doc.addImage(documentPrepartion.signature, "PNG", leftX, yPos, sigWidth, sigHeight);

                if (documentPrepartion?.signaturetype === "For Seal" && documentPrepartion?.bottomcontent) {
                  doc.setFontSize(8);
                  doc.setFont(undefined, "bold");
                  doc.setTextColor(83, 23, 126);
                  doc.text(
                    documentPrepartion.bottomcontent,
                    leftX,
                    yPos + sigHeight + bottomTextHeight
                  );
                  doc.setTextColor(0, 0, 0);
                }
              }

              // --- Center: Seal (align with same yPos) ---
              const centerX = (pageWidth / 2) - (sealWidth / 2);
              if (documentPrepartion?.seal) {
                doc.addImage(documentPrepartion.seal, "PNG", centerX, yPos - sealUpShift, sealWidth, sealHeight);
              }

              // --- Right: Employee Signature (aligned with row, adjusted size) ---
              let rightX = pageWidth - userSigWidth - margin - 10;
              if (documentPrepartion?.usersignature) {
                doc.addImage(
                  documentPrepartion.usersignature,
                  "PNG",
                  rightX,
                  yPos - userSigUpShift, // ✅ Same yPos as others (aligned row)
                  userSigWidth,
                  userSigHeight
                );
              }
            }




          }
          // }


          if (qrCodeNeed && documentPrepartion?.qrcodevalue === "End Page") {
            if (i === totalPages) {
              const qrCodeWidth = 25;
              const qrCodeHeight = 25;
              const qrCodeX = footerX;
              const qrCodeY = footerY - qrCodeHeight - 4;
              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);


              const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                '1. Scan to verify the authenticity of this document.',
                `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                `3. For questions, contact us at ${fromEmail}.`
              ];

              // starting position
              const statementX = qrCodeX + qrCodeWidth + 10;
              const statementY1 = qrCodeY + 10;
              const lineGap = 5; // vertical spacing between statements

              doc.setFontSize(12);

              statements.forEach((text, idx) => {
                const y = statementY1 + (idx * lineGap);
                doc.text(text, statementX, y);
              });


            }
          }
          if (qrCodeNeed && documentPrepartion?.qrcodevalue === "All Pages") {
            if (i === totalPages) {
              const qrCodeWidth = 25;
              const qrCodeHeight = 25;
              const qrCodeX = footerX;
              const qrCodeY = footerY - qrCodeHeight - 4;
              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);


              const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                '1. Scan to verify the authenticity of this document.',
                `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                `3. For questions, contact us at ${fromEmail}.`
              ];

              // starting position
              const statementX = qrCodeX + qrCodeWidth + 10;
              const statementY1 = qrCodeY + 10;
              const lineGap = 5; // vertical spacing between statements

              doc.setFontSize(12);

              statements.forEach((text, idx) => {
                const y = statementY1 + (idx * lineGap);
                doc.text(text, statementX, y);
              });


            } else {
              // ✅ for all other pages → add page number + small QR code on the right
              const textY = footerY - 3;
              // small QR code next to it (bottom-right corner)
              const qrCodeWidth = 15;   // smaller size
              const qrCodeHeight = 15;
              const qrCodeX = pageWidth - qrCodeWidth - 15; // margin from right
              const qrCodeY = footerY - qrCodeHeight - 3;   // align with page text

              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
            }
          }

          const contentAreaHeight = pageHeight - footerHeight - margin;
        }
      };

      const hasHeaderImage = head !== ''; // assuming head is a base64 src or image URL
      const hasFooterImage = foot !== '';

      const adjustedMargin = getAdjustedMargin(selectedMargin, hasHeaderImage, hasFooterImage);
      const pdfDimensions = getPageDimensions(); // as before

      // Convert the HTML content to PDF
      html2pdf()
        .from(pdfElement)
        .set({
          margin: adjustedMargin,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: {
            unit: 'mm',
            format: pdfDimensions,
            orientation: pageOrientation,
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .toPdf()
        .get('pdf')
        .then((pdf) => {
          // Convert the watermark image to a base64 string
          const img = new Image();
          img.src = waterMarkText;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.globalAlpha = 0.1;
            ctx.drawImage(img, 0, 0);
            const watermarkImage = canvas.toDataURL('image/png');

            // Add QR code image
            const qrImg = new Image();
            qrImg.src = qrCodeNeed ? imageUrl : ''; // QR code image URL
            if (qrCodeNeed) {
              qrImg.onload = () => {
                const qrCanvas = document.createElement('canvas');
                qrCanvas.width = qrImg.width;
                qrCanvas.height = qrImg.height;
                const qrCtx = qrCanvas.getContext('2d');
                qrCtx.drawImage(qrImg, 0, 0);
                const qrCodeImage = qrCanvas.toDataURL('image/png');

                // Add page numbers, watermark, and QR code to each page
                addPageNumbersAndHeadersFooters(pdf, watermarkImage, qrCodeImage);

                // Save the PDF
                pdf.save(`${documentPrepartion.template}_${documentPrepartion.person}.pdf`);
                setLoadingPrintManualData(false);
                setButtonLoading(false);
                handleCloseInfoImagePrint();
              };
            } else {
              // Add page numbers, watermark, and QR code to each page
              addPageNumbersAndHeadersFooters(pdf, watermarkImage, '');

              // Save the PDF
              pdf.save(`${documentPrepartion.template}_${documentPrepartion.person}.pdf`);
              setLoadingPrintManualData(false);
              setButtonLoading(false);
              handleCloseInfoImagePrint();
            }
          };
        });
      setInfoOpenImagePrintManual(false);
    }
  };

  const handlePreviewDocument = (index) => {
    if (documentPrepartion?.documentneed !== 'Employee Approval' && headerOptions === 'Please Select Print Options') {
      setButtonLoadingPreview(false);
      setPopupContentMalert('Please Select Print Options!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion?.documentneed !== 'Employee Approval' && headerOptions === 'With Letter Head' && selectedHeadOpt?.length < 1) {
      setPopupContentMalert('Please Select With Letter Head!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (!noticePeriodEmpCheck && noticePeriodEmpCheckPerson) {
      setButtonLoadingPreview(false);
      setPopupContentMalert('This Employee is not eligible to receive any kind of documents!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (generateData) {
      setPopupContentMalert("This Employee's company and branch is not matched with Template control panel data.Add the details in Template control panel!");
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      setButtonLoadingPreview(true);
      setLoadingPreviewData(true);
      handleClickCloseLetterHead();
      setHeaderOptionsButton(true);
      downloadPdfTesdtCheckTrue(index)
        .then((isMultiPage) => {
          if (isMultiPage && templateCreationValue?.pagemode === 'Single Page') {
            setButtonLoadingPreview(false);
            setPreviewManual(true);
            setLoadingPreviewData(false);
            setHeaderOptionsButton(false);
          } else {
            setLoadingPreviewData(true);
            setPreviewManual(false);
            setButtonLoadingPreview(true);
            // Create a new div element to hold the Quill content
            const pdfElement = document.createElement('div');
            // console.log(checkingArray[index]?.data, "checkingArray[index]?.data")
            pdfElement.innerHTML = checkingArray[index]?.data.replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`);
            const pdfElementHead = document.createElement('div');
            pdfElementHead.innerHTML = checkingArray[index]?.header;

            // Add custom styles to the PDF content
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                .ql-indent-1 { margin-left: 75px; }
                .ql-indent-2 { margin-left: 150px; }
                .ql-indent-3 { margin-left: 225px; }
                .ql-indent-4 { margin-left: 275px; }
                .ql-indent-5 { margin-left: 325px; }
                .ql-indent-6 { margin-left: 375px; }
                .ql-indent-7 { margin-left: 425px; }
                .ql-indent-8 { margin-left: 475px; }
                .ql-align-right { text-align: right; }
                .ql-align-left { text-align: left; }
                .ql-align-center { text-align: center; }
                .ql-align-justify { text-align: justify; }
                                  .page-break-label {
    page-break-before: always;
    break-before: page;
    margin: 20px 0;
  }
              `;

            pdfElement.appendChild(styleElement);

            // Create a watermark element
            const watermarkElement = document.createElement('div');
            watermarkElement.style.position = 'absolute';
            watermarkElement.style.left = '0';
            watermarkElement.style.top = '0';
            watermarkElement.style.width = '100%';
            watermarkElement.style.height = '100%';
            watermarkElement.style.display = 'flex';
            watermarkElement.style.alignItems = 'center';
            watermarkElement.style.justifyContent = 'center';
            watermarkElement.style.opacity = '0.09';
            watermarkElement.style.pointerEvents = 'none';

            const watermarkImage = document.createElement('img');
            watermarkImage.src = checkingArray[index]?.watermark;
            watermarkImage.style.width = '75%';
            watermarkImage.style.height = '50%';
            watermarkImage.style.objectFit = 'contain';

            watermarkElement.appendChild(watermarkImage);

            const addPageNumbersAndHeadersFooters = (doc, watermarkImage, qrCodeImage) => {
              const totalPages = doc.internal.getNumberOfPages();
              // console.log(totalPages)
              const margin = 15; // Adjust as needed
              const footerHeight = 15; // Adjust as needed
              const tempDiv = document.createElement('div');
              tempDiv.style.position = 'absolute';
              tempDiv.style.visibility = 'hidden';
              tempDiv.innerHTML = pdfElement;
              document.body.appendChild(tempDiv);
              const rect = tempDiv.getBoundingClientRect();
              const reservedSealHeight = 45;
              const actualContentHeight = rect.height * (25.4 / 96);
              const pageHeight = doc.internal.pageSize.getHeight();
              // Total usable height for content
              const usableContentHeight = pageHeight - footerHeight - margin - reservedSealHeight;
              const contentEndY = Math.min(actualContentHeight, usableContentHeight);

              for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                // ✅ Calculate where content ends
                const contentEndY = pageHeight - footerHeight - margin - 20; // leave gap above footer
                // ---------- HEADER ----------
                doc.setFontSize(12);

                if (checkingArray[index]?.header !== '') {
                  const headerImgWidth = pageWidth * 0.95;
                  const headerImgHeight = pageHeight * 0.09;
                  const headerX = 5;
                  const headerY = 3.5;
                  doc.addImage(checkingArray[index]?.header, 'JPEG', headerX, headerY, headerImgWidth, headerImgHeight, '', 'FAST', 0.1);
                } else {
                  const headerImgWidth = pageWidth * 0.95;
                  const headerImgHeight = pageHeight * 0.09;
                  const headerX = 5;
                  const headerY = 3.5;
                  doc.setFillColor(255, 255, 255);
                  doc.rect(headerX, headerY, headerImgWidth, headerImgHeight, 'F'); // "F" = filled rectangle
                }

                // ---------- WATERMARK ----------
                if (checkingArray[index]?.header !== '') {
                  const imgWidth = pageWidth * 0.5;
                  const imgHeight = pageHeight * 0.25;
                  const x = (pageWidth - imgWidth) / 2;
                  const y = (pageHeight - imgHeight) / 2 - 20;
                  doc.setFillColor(0, 0, 0, 0.1);
                  doc.addImage(watermarkImage, 'PNG', x, y, imgWidth, imgHeight, '', 'FAST', 0.01);
                }
                // ---------- FOOTER ----------
                doc.setFontSize(10);
                const footerImgWidth = pageWidth * 0.95;
                const footerImgHeight = pageHeight * 0.067;
                const footerX = 5;
                const footerY = pageHeight - footerImgHeight - 5;
                if (checkingArray[index]?.footer !== "") {
                  doc.addImage(checkingArray[index]?.footer, 'JPEG', footerX, footerY, footerImgWidth, footerImgHeight, '', 'FAST', 0.1);
                } else {
                  doc.setFillColor(255, 255, 255);
                  doc.rect(footerX, footerY, footerImgWidth, footerImgHeight, 'F');
                }

                // ---------- SIGNATURE & SEAL ----------
                // if (checkingArray[index]?.signatureneed) {
                const signatureNeed = checkingArray[index]?.signatureneed; // "All Pages" or "End Page"
                if (signatureNeed === "All Pages" || (signatureNeed === "End Page" && i === totalPages)) {
                  // Decide Y position right after content but above footer
                  const imageY = contentEndY;

                  // Seal on left
                  if (checkingArray[index]?.signature || checkingArray[index]?.seal || checkingArray[index]?.usersignature) {
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();
                    const margin = 15;
                    const footerGap = 20; // space to keep above footer

                    // --- Unified Row Position ---
                    const rowYOffset = 10; // ✅ Move row slightly lower
                    const sigWidth = 40;    // reduced from 53
                    const sigHeight = 6;    // reduced from 8

                    const sealWidth = 17;   // reduced from 25/35
                    const sealHeight = 17;  // reduced from 25/35
                    const sealUpShift = 8;
                    // ✅ Make user signature a bit wider but slightly shorter
                    const userSigWidth = 47;  // increased width
                    const userSigHeight = 20; // reduced height
                    const userSigUpShift = 11;
                    let yPos;

                    if (i === totalPages) {
                      // ✅ Use available space from bottom instead of rect.height
                      yPos = checkingArray[index]?.qrcodeNeed ? (pageHeight - footerGap - userSigHeight - 30) : (pageHeight - footerGap - userSigHeight); // stays near bottom
                    } else {
                      yPos = contentEndY + rowYOffset;
                    }

                    const topTextHeight = 6;
                    const bottomTextHeight = 6;

                    // --- Left: Main Signature ---
                    let leftX = margin;
                    if (checkingArray[index]?.signature) {
                      if (checkingArray[index]?.signaturetype === "For Seal" && checkingArray[index]?.topcontent) {
                        doc.setFontSize(8);
                        doc.setFont(undefined, "bold");
                        doc.setTextColor(83, 23, 126);
                        doc.text(checkingArray[index].topcontent, leftX, yPos - topTextHeight);
                        doc.setTextColor(0, 0, 0);
                      }

                      doc.addImage(checkingArray[index].signature, "PNG", leftX, yPos, sigWidth, sigHeight);

                      if (checkingArray[index]?.signaturetype === "For Seal" && checkingArray[index]?.bottomcontent) {
                        doc.setFontSize(8);
                        doc.setFont(undefined, "bold");
                        doc.setTextColor(83, 23, 126);
                        doc.text(
                          checkingArray[index].bottomcontent,
                          leftX,
                          yPos + sigHeight + bottomTextHeight
                        );
                        doc.setTextColor(0, 0, 0);
                      }
                    }

                    // --- Center: Seal (align with same yPos) ---
                    const centerX = (pageWidth / 2) - (sealWidth / 2);
                    if (checkingArray[index]?.seal) {
                      doc.addImage(checkingArray[index].seal, "PNG", centerX, yPos - sealUpShift, sealWidth, sealHeight);
                    }

                    // --- Right: Employee Signature (aligned with row, adjusted size) ---
                    let rightX = pageWidth - userSigWidth - margin - 10;
                    if (checkingArray[index]?.usersignature) {
                      doc.addImage(
                        checkingArray[index].usersignature,
                        "PNG",
                        rightX,
                        yPos - userSigUpShift, // ✅ Same yPos as others (aligned row)
                        userSigWidth,
                        userSigHeight
                      );
                    }
                  }




                }
                // }

                // ---------- PAGE NUMBER ---------- 
                if (checkingArray[index]?.pagenumberneed === 'All Pages') {
                  const textY = footerY - 3;
                  doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, textY, { align: 'center' });
                } else if (checkingArray[index]?.pagenumberneed === 'End Page' && i === totalPages) {
                  const textY = footerY - 3;
                  doc.text(`End of the document`, pageWidth / 2, textY, { align: 'center' });
                }
                // ---------- QR CODE ----------
                if (checkingArray[index]?.qrcodeNeed && checkingArray[index]?.qrcodevalue === "End Page") {
                  if (i === totalPages) {
                    const qrCodeWidth = 25;
                    const qrCodeHeight = 25;
                    const qrCodeX = footerX;
                    const qrCodeY = footerY - qrCodeHeight - 4;
                    doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

                    const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                      '1. Scan to verify the authenticity of this document.',
                      `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                      `3. For questions, contact us at ${checkingArray[index]?.frommailemail}.`
                    ];

                    // starting position
                    const statementX = qrCodeX + qrCodeWidth + 10;
                    const statementY1 = qrCodeY + 10;
                    const lineGap = 5; // vertical spacing between statements

                    doc.setFontSize(12);

                    statements.forEach((text, idx) => {
                      const y = statementY1 + (idx * lineGap);
                      doc.text(text, statementX, y);
                    });


                  }
                }
                if (checkingArray[index]?.qrcodeNeed && checkingArray[index]?.qrcodevalue === "All Pages") {
                  if (i === totalPages) {
                    const qrCodeWidth = 25;
                    const qrCodeHeight = 25;
                    const qrCodeX = footerX;
                    const qrCodeY = footerY - qrCodeHeight - 4;
                    doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

                    const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                      '1. Scan to verify the authenticity of this document.',
                      `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                      `3. For questions, contact us at ${checkingArray[index]?.frommailemail}.`
                    ];

                    // starting position
                    const statementX = qrCodeX + qrCodeWidth + 10;
                    const statementY1 = qrCodeY + 10;
                    const lineGap = 5; // vertical spacing between statements

                    doc.setFontSize(12);

                    statements.forEach((text, idx) => {
                      const y = statementY1 + (idx * lineGap);
                      doc.text(text, statementX, y);
                    });


                  }
                  else {
                    // ✅ for all other pages → add page number + small QR code on the right
                    const textY = footerY - 3;
                    // small QR code next to it (bottom-right corner)
                    const qrCodeWidth = 15;   // smaller size
                    const qrCodeHeight = 15;
                    const qrCodeX = pageWidth - qrCodeWidth - 15; // margin from right
                    const qrCodeY = footerY - qrCodeHeight - 3;   // align with page text

                    doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
                  }
                }
                const contentAreaHeight = pageHeight - footerHeight - margin;
              }
            };
            // ---------------- YOUR EXISTING CODE ----------------
            const hasHeaderImage = checkingArray[index]?.header !== '';
            const hasFooterImage = checkingArray[index]?.footer !== '';
            const adjustedMargin = getAdjustedMargin(selectedMargin, hasHeaderImage, hasFooterImage);
            const pdfDimensions = getPageDimensions();



            // 1️⃣ Measure content height BEFORE html2pdf
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.visibility = 'hidden';
            tempDiv.style.width = pdfElement.offsetWidth + 'px';
            tempDiv.innerHTML = pdfElement.innerHTML;
            document.body.appendChild(tempDiv);

            const rect = tempDiv.getBoundingClientRect();
            const contentHeightMM = rect.height * (25.4 / 96); // px → mm
            document.body.removeChild(tempDiv);

            const pageHeightMM = pdfDimensions[1] - (adjustedMargin[0] + adjustedMargin[2]);
            const totalPagesNeeded = Math.ceil(contentHeightMM / pageHeightMM);
            const lastPageUsedHeight = contentHeightMM % pageHeightMM || pageHeightMM;

            // console.log(`✅ Content Height: ${contentHeightMM.toFixed(2)} mm`);
            // console.log(`✅ Page Height: ${pageHeightMM.toFixed(2)} mm`);
            // console.log(`✅ Last Page Used Height: ${lastPageUsedHeight.toFixed(2)} mm`);




            html2pdf()
              .from(pdfElement)
              .set({
                margin: adjustedMargin,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: {
                  unit: 'mm',
                  format: pdfDimensions,
                  orientation: pageOrientation,
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
              })
              .toPdf()
              .get('pdf')
              .then((pdf) => {

                const img = new Image();
                img.src = waterMarkText;
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  ctx.globalAlpha = 0.1;
                  ctx.drawImage(img, 0, 0);
                  const watermarkImage = canvas.toDataURL('image/png');
                  // const drawLastLine = () => {
                  //   // Switch to last page
                  //   pdf.setPage(totalPages);

                  //   const pageHeight = pdf.internal.pageSize.getHeight();
                  //   const pageWidth = pdf.internal.pageSize.getWidth();

                  //   // Calculate header height (same approach you used for footer)
                  //   const headerImgHeight = pageHeight * 0.067; // adjust if you use different scale for header

                  //   // Calculate last content Y position relative to page
                  //   let yEnd = 
                  //   adjustedMargin[0] 
                  //   +
                  //     headerImgHeight 
                  //     + 
                  //     lastPageUsedHeight;
                  //   console.log(adjustedMargin[0], headerImgHeight, lastPageUsedHeight)
                  //   // Clamp to page bottom
                  //   if (yEnd > pageHeight - adjustedMargin[2]) {
                  //     yEnd = pageHeight - adjustedMargin[2] - 5;
                  //   }

                  //   // Draw the red line
                  //   pdf.setDrawColor(255, 0, 0);
                  //   pdf.setLineWidth(0.5);
                  //   pdf.line(
                  //     adjustedMargin[3],
                  //     yEnd,
                  //     pageWidth - adjustedMargin[1],
                  //     yEnd
                  //   );

                  //   console.log(`✅ Drew red line at Y=${yEnd.toFixed(2)} mm (includes header height + 15mm)`);
                  // };


                  const qrImg = new Image();
                  qrImg.src = checkingArray[index]?.qrcodeNeed ? checkingArray[index]?.qrcode : ''; // QR code image URL
                  if (checkingArray[index]?.qrcodeNeed) {
                    qrImg.onload = () => {
                      const qrCanvas = document.createElement('canvas');
                      qrCanvas.width = qrImg.width;
                      qrCanvas.height = qrImg.height;
                      const qrCtx = qrCanvas.getContext('2d');
                      qrCtx.drawImage(qrImg, 0, 0);
                      const qrCodeImage = qrCanvas.toDataURL('image/png');
                      // Add page numbers, watermark, and QR code to each page
                      addPageNumbersAndHeadersFooters(pdf, watermarkImage, qrCodeImage);
                      // drawLastLine();
                      const pdfBlob = pdf.output('blob');
                      const pdfUrl = URL.createObjectURL(pdfBlob);
                      const printWindow = window.open(pdfUrl);
                      setLoadingPrintData(false);
                      setButtonLoading(false);
                      handleCloseInfoImagePrint();
                    };
                  } else {
                    addPageNumbersAndHeadersFooters(pdf, watermarkImage, '');
                    // drawLastLine();
                    const pdfBlob = pdf.output('blob');
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    const printWindow = window.open(pdfUrl);
                    setLoadingPrintData(false);
                    setButtonLoading(false);
                    handleCloseInfoImagePrint();
                  }
                };
              });
            setLoadingPreviewData(false);
          }
          setHeaderOptionsButton(false);
          setButtonLoadingPreview(false);
          setLoadingPreviewData(false);
          // setHeader("")
          // setfooter("")
          // setCheckingArray((prevArray) =>
          //   prevArray.map((item, ind) =>
          //     ind === (indexViewQuest - 1) ? {
          //       ...item,
          //       header: "",
          //       footer: ""
          //     } : item
          //   )
          // );
        })
        .catch((error) => {
          setHeaderOptionsButton(false);
          setButtonLoadingPreview(false);
          setLoadingPreviewData(false);
          console.error('Error generating PDF:', error);
        });
    }
  };

  const handlePreviewDocumentManual = () => {
    if (documentPrepartion?.documentneed !== 'Employee Approval' && headerOptions === 'Please Select Print Options') {
      setButtonLoadingPreview(false);
      setPopupContentMalert('Please Select Print Options!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion?.documentneed !== 'Employee Approval' && headerOptions === 'With Letter Head' && selectedHeadOpt?.length < 1) {
      setPopupContentMalert('Please Select With Letter Head!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (!noticePeriodEmpCheck && noticePeriodEmpCheckPerson) {
      setButtonLoadingPreview(false);
      setPopupContentMalert('This Employee is not eligible to receive any kind of documents!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (checking.match(regex)?.filter((data) => !['$SIGNATURE$', '$FSIGNATURE$', '$EMPLOYEESIGNATURE$', '$RSEAL$']?.includes(data))?.length > 0) {
      setPopupContentMalert('Fill All the Fields Which starts From $ and Ends with $');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (generateData) {
      setPopupContentMalert("This Employee's company and branch is not matched with Template control panel data.Add the details in Template control panel");
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      setLoadingPreviewManualData(true);
      setButtonLoadingPreview(true);
      downloadPdfTesdtCheckTrueManual()
        .then((isMultiPage) => {
          if (isMultiPage && templateCreationValue?.pagemode === 'Single Page') {
            setButtonLoadingPreview(false);
            setPreviewManual(true);
            setLoadingPreviewManualData(false);
          } else {
            setPreviewManual(false);
            setButtonLoadingPreview(true);
            // Create a new div element to hold the Quill content
            const pdfElement = document.createElement('div');
            pdfElement.innerHTML = checking;
            let findMethod = checking
              ?.replaceAll(
                '$RSEAL$',
                sealPlacement
                  ? `<span style="display: inline-block; position: relative; width: 100px; height: 90px;">
         <img src="${sealPlacement}" alt="Seal" style="position: absolute; z-index: -1; width: 100px; height: 90px;" />
       </span>`
                  : ''
              )
              .replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`)
              .replaceAll(
                '$FSIGNATURE$',
                signatureContent?.seal === 'For Seal'
                  ? `<span style="display: inline-block; vertical-align: top;">
          <span style="color:#53177e; font-weight: bold;">${signatureContent?.topcontent}</span><br/>
          ${signature
                    ? `<span style="position: relative; display: inline-block;">
                   <img src="${signature}" alt="Signature" style="position: absolute; z-index: -1; width: 200px; height: 30px;" />
                 </span><br/>`
                    : ''
                  }
          <span style="color:#53177e; font-weight: bold; display: inline-block; margin-top: 25px;">
            ${signatureContent?.bottomcontent}
          </span>
       </span>`
                  : ''
              );

            pdfElement.innerHTML = DOMPurify.sanitize(findMethod);
            const pdfElementHead = document.createElement('div');
            pdfElementHead.innerHTML = head;

            // Add custom styles to the PDF content
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                .ql-indent-1 { margin-left: 75px; }
                .ql-indent-2 { margin-left: 150px; }
                .ql-indent-3 { margin-left: 225px; }
                .ql-indent-4 { margin-left: 275px; }
                .ql-indent-5 { margin-left: 325px; }
                .ql-indent-6 { margin-left: 375px; }
                .ql-indent-7 { margin-left: 425px; }
                .ql-indent-8 { margin-left: 475px; }
                .ql-align-right { text-align: right; }
                .ql-align-left { text-align: left; }
                .ql-align-center { text-align: center; }
                .ql-align-justify { text-align: justify; }
                                  .page-break-label {
    page-break-before: always;
    break-before: page;
    margin: 20px 0;
  }
              `;

            pdfElement.appendChild(styleElement);

            // Create a watermark element
            const watermarkElement = document.createElement('div');
            watermarkElement.style.position = 'absolute';
            watermarkElement.style.left = '0';
            watermarkElement.style.top = '0';
            watermarkElement.style.width = '100%';
            watermarkElement.style.height = '100%';
            watermarkElement.style.display = 'flex';
            watermarkElement.style.alignItems = 'center';
            watermarkElement.style.justifyContent = 'center';
            watermarkElement.style.opacity = '0.09';
            watermarkElement.style.pointerEvents = 'none';

            const watermarkImage = document.createElement('img');
            watermarkImage.src = waterMarkText;
            watermarkImage.style.width = '75%';
            watermarkImage.style.height = '50%';
            watermarkImage.style.objectFit = 'contain';

            watermarkElement.appendChild(watermarkImage);

            const addPageNumbersAndHeadersFooters = (doc, watermarkImage, qrCodeImage) => {
              const totalPages = doc.internal.getNumberOfPages();
              const margin = 15; // Adjust as needed
              const footerHeight = 15; // Adjust as needed
              const tempDiv = document.createElement('div');
              tempDiv.style.position = 'absolute';
              tempDiv.style.visibility = 'hidden';
              tempDiv.innerHTML = pdfElement;
              document.body.appendChild(tempDiv);
              const rect = tempDiv.getBoundingClientRect();
              const reservedSealHeight = 45;
              const actualContentHeight = rect.height * (25.4 / 96);
              const pageHeight = doc.internal.pageSize.getHeight();
              // Total usable height for content
              const usableContentHeight = pageHeight - footerHeight - margin - reservedSealHeight;
              const contentEndY = Math.min(actualContentHeight, usableContentHeight);

              for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const contentEndY = pageHeight - footerHeight - margin - 20; // leave gap above footer

                doc.setFontSize(12);
                const headerImgWidth = pageWidth * 0.95;
                const headerImgHeight = pageHeight * 0.09;
                const headerX = 5;
                const headerY = 3.5;
                if (head !== '') {
                  doc.addImage(head, 'JPEG', headerX, headerY, headerImgWidth, headerImgHeight, '', 'FAST', 0.1);
                } else {
                  doc.setFillColor(255, 255, 255);
                  doc.rect(headerX, headerY, headerImgWidth, headerImgHeight, 'F'); // "F" = filled rectangle

                }
                const imgWidth = pageWidth * 0.5;
                const imgHeight = pageHeight * 0.25;
                const x = (pageWidth - imgWidth) / 2;
                const y = (pageHeight - imgHeight) / 2 - 20;
                doc.setFillColor(0, 0, 0, 0.1);
                doc.addImage(watermarkImage, 'PNG', x, y, imgWidth, imgHeight, '', 'FAST', 0.01);

                doc.setFontSize(10);
                const footerImgWidth = pageWidth * 0.95;
                const footerImgHeight = pageHeight * 0.067;
                const footerX = 5;
                const footerY = pageHeight - footerImgHeight - 5;
                if (foot !== "") {
                  doc.addImage(foot, 'JPEG', footerX, footerY, footerImgWidth, footerImgHeight, '', 'FAST', 0.1);
                } else {
                  doc.setFillColor(255, 255, 255);
                  doc.rect(footerX, footerY, footerImgWidth, footerImgHeight, 'F');
                }


                // ---------- SIGNATURE & SEAL ----------
                // if (documentPrepartion?.signatureneed) {
                const signatureNeed = documentPrepartion?.signatureneed; // "All Pages" or "End Page"

                if (signatureNeed === "All Pages" || (signatureNeed === "End Page" && i === totalPages)) {
                  // Decide Y position right after content but above footer
                  const imageY = contentEndY;

                  // Seal on left
                  if (documentPrepartion?.signature || documentPrepartion?.seal || documentPrepartion?.usersignature) {
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();
                    const margin = 15;
                    const footerGap = 20; // space to keep above footer

                    // --- Unified Row Position ---
                    const rowYOffset = 10; // ✅ Move row slightly lower
                    const sigWidth = 40;    // reduced from 53
                    const sigHeight = 6;    // reduced from 8

                    const sealWidth = 17;   // reduced from 25/35
                    const sealHeight = 17;  // reduced from 25/35
                    const sealUpShift = 8;
                    // ✅ Make user signature a bit wider but slightly shorter
                    const userSigWidth = 47;  // increased width
                    const userSigHeight = 20; // reduced height
                    const userSigUpShift = 11;
                    let yPos;

                    if (i === totalPages) {
                      // ✅ Use available space from bottom instead of rect.height
                      yPos = documentPrepartion?.qrcodeNeed ? (pageHeight - footerGap - userSigHeight - 30) : (pageHeight - footerGap - userSigHeight); // stays near bottom
                    } else {
                      yPos = contentEndY + rowYOffset;
                    }

                    const topTextHeight = 6;
                    const bottomTextHeight = 6;

                    // --- Left: Main Signature ---
                    let leftX = margin;
                    if (documentPrepartion?.signature) {
                      if (documentPrepartion?.signaturetype === "For Seal" && documentPrepartion?.topcontent) {
                        doc.setFontSize(8);
                        doc.setFont(undefined, "bold");
                        doc.setTextColor(83, 23, 126);
                        doc.text(documentPrepartion.topcontent, leftX, yPos - topTextHeight);
                        doc.setTextColor(0, 0, 0);
                      }

                      doc.addImage(documentPrepartion.signature, "PNG", leftX, yPos, sigWidth, sigHeight);

                      if (documentPrepartion?.signaturetype === "For Seal" && documentPrepartion?.bottomcontent) {
                        doc.setFontSize(8);
                        doc.setFont(undefined, "bold");
                        doc.setTextColor(83, 23, 126);
                        doc.text(
                          documentPrepartion.bottomcontent,
                          leftX,
                          yPos + sigHeight + bottomTextHeight
                        );
                        doc.setTextColor(0, 0, 0);
                      }
                    }

                    // --- Center: Seal (align with same yPos) ---
                    const centerX = (pageWidth / 2) - (sealWidth / 2);
                    if (documentPrepartion?.seal) {
                      doc.addImage(documentPrepartion.seal, "PNG", centerX, yPos - sealUpShift, sealWidth, sealHeight);
                    }

                    // --- Right: Employee Signature (aligned with row, adjusted size) ---
                    let rightX = pageWidth - userSigWidth - margin - 10;
                    if (documentPrepartion?.usersignature) {
                      doc.addImage(
                        documentPrepartion.usersignature,
                        "PNG",
                        rightX,
                        yPos - userSigUpShift, // ✅ Same yPos as others (aligned row)
                        userSigWidth,
                        userSigHeight
                      );
                    }
                  }




                }
                // }

                if (documentPrepartion?.pagenumberneed === 'All Pages') {
                  const textY = footerY - 3;
                  doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, textY, { align: 'center' });
                } else if (documentPrepartion?.pagenumberneed === 'End Page' && i === totalPages) {
                  const textY = footerY - 3;
                  doc.text(`End of the document`, pageWidth / 2, textY, { align: 'center' });
                }

                if (qrCodeNeed && documentPrepartion?.qrcodevalue === "End Page") {
                  if (i === totalPages) {
                    const qrCodeWidth = 25;
                    const qrCodeHeight = 25;
                    const qrCodeX = footerX;
                    const qrCodeY = footerY - qrCodeHeight - 4;
                    doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

                    const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                      '1. Scan to verify the authenticity of this document.',
                      `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                      `3. For questions, contact us at ${fromEmail}.`
                    ];

                    // starting position
                    const statementX = qrCodeX + qrCodeWidth + 10;
                    const statementY1 = qrCodeY + 10;
                    const lineGap = 5; // vertical spacing between statements

                    doc.setFontSize(12);

                    statements.forEach((text, idx) => {
                      const y = statementY1 + (idx * lineGap);
                      doc.text(text, statementX, y);
                    });
                  }
                }
                if (qrCodeNeed && documentPrepartion?.qrcodevalue === "All Pages") {
                  if (i === totalPages) {
                    const qrCodeWidth = 25;
                    const qrCodeHeight = 25;
                    const qrCodeX = footerX;
                    const qrCodeY = footerY - qrCodeHeight - 4;
                    doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

                    const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                      '1. Scan to verify the authenticity of this document.',
                      `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                      `3. For questions, contact us at ${fromEmail}.`
                    ];

                    // starting position
                    const statementX = qrCodeX + qrCodeWidth + 10;
                    const statementY1 = qrCodeY + 10;
                    const lineGap = 5; // vertical spacing between statements

                    doc.setFontSize(12);

                    statements.forEach((text, idx) => {
                      const y = statementY1 + (idx * lineGap);
                      doc.text(text, statementX, y);
                    });
                  }
                  else {
                    // ✅ for all other pages → add page number + small QR code on the right
                    const textY = footerY - 3;
                    // small QR code next to it (bottom-right corner)
                    const qrCodeWidth = 15;   // smaller size
                    const qrCodeHeight = 15;
                    const qrCodeX = pageWidth - qrCodeWidth - 15; // margin from right
                    const qrCodeY = footerY - qrCodeHeight - 3;   // align with page text

                    doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
                  }
                }
                const contentAreaHeight = pageHeight - footerHeight - margin;
              }
            };

            const hasHeaderImage = head !== ''; // assuming head is a base64 src or image URL
            const hasFooterImage = foot !== '';

            const adjustedMargin = getAdjustedMargin(selectedMargin, hasHeaderImage, hasFooterImage);
            const pdfDimensions = getPageDimensions(); // as before

            html2pdf()
              .from(pdfElement)
              .set({
                margin: adjustedMargin,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: {
                  unit: 'mm',
                  format: pdfDimensions,
                  orientation: pageOrientation,
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
              })
              .toPdf()
              .get('pdf')
              .then((pdf) => {
                const img = new Image();
                img.src = waterMarkText;
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  ctx.globalAlpha = 0.1;
                  ctx.drawImage(img, 0, 0);
                  const watermarkImage = canvas.toDataURL('image/png');

                  const qrImg = new Image();
                  qrImg.src = imageUrl;
                  qrImg.onload = () => {
                    const qrCanvas = document.createElement('canvas');
                    qrCanvas.width = qrImg.width;
                    qrCanvas.height = qrImg.height;
                    const qrCtx = qrCanvas.getContext('2d');
                    qrCtx.drawImage(qrImg, 0, 0);
                    const qrCodeImage = qrCanvas.toDataURL('image/png');

                    addPageNumbersAndHeadersFooters(pdf, watermarkImage, qrCodeImage);

                    const pdfBlob = pdf.output('blob');
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    const printWindow = window.open(pdfUrl);
                    setButtonLoadingPreview(false);
                    setLoadingPreviewManualData(false);
                  };
                };
              });
          }
        })
        .catch((error) => {
          console.error('Error generating PDF:', error);
        });
    }
  };

  const handleOpenPreviewManualfunc = () => {
    setButtonLoadingPreview(true);
    setPreviewManual(false);
    // Create a new div element to hold the Quill content
    const pdfElement = document.createElement('div');
    pdfElement.innerHTML = checking;
    let findMethod = checking
      ?.replaceAll(
        '$RSEAL$',
        sealPlacement
          ? `<span style="display: inline-block; position: relative; width: 100px; height: 90px;">
         <img src="${sealPlacement}" alt="Seal" style="position: absolute; z-index: -1; width: 100px; height: 90px;" />
       </span>`
          : ''
      )
      .replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`)
      .replaceAll(
        '$FSIGNATURE$',
        signatureContent?.seal === 'For Seal'
          ? `<span style="display: inline-block; vertical-align: top;">
          <span style="color:#53177e; font-weight: bold;">${signatureContent?.topcontent}</span><br/>
          ${signature
            ? `<span style="position: relative; display: inline-block;">
                   <img src="${signature}" alt="Signature" style="position: absolute; z-index: -1; width: 200px; height: 30px;" />
                 </span><br/>`
            : ''
          }
          <span style="color:#53177e; font-weight: bold; display: inline-block; margin-top: 25px;">
            ${signatureContent?.bottomcontent}
          </span>
       </span>`
          : ''
      )
      .replaceAll(
        '$SIGNATURE$',
        signatureContent?.seal === 'None'
          ? `
    <img src="${signature}" alt="Signature" style="position:absolute; z-index:-1; width: 200px; height: 30px;" />
         `
          : ''
      );

    pdfElement.innerHTML = DOMPurify.sanitize(findMethod);
    const pdfElementHead = document.createElement('div');
    pdfElementHead.innerHTML = head;

    // Add custom styles to the PDF content
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .ql-indent-1 { margin-left: 75px; }
      .ql-indent-2 { margin-left: 150px; }
      .ql-indent-3 { margin-left: 225px; }
      .ql-indent-4 { margin-left: 275px; }
      .ql-indent-5 { margin-left: 325px; }
      .ql-indent-6 { margin-left: 375px; }
      .ql-indent-7 { margin-left: 425px; }
      .ql-indent-8 { margin-left: 475px; }
      .ql-align-right { text-align: right; }
      .ql-align-left { text-align: left; }
      .ql-align-center { text-align: center; }
      .ql-align-justify { text-align: justify; }
                        .page-break-label {
    page-break-before: always;
    break-before: page;
    margin: 20px 0;
  }
    `;

    pdfElement.appendChild(styleElement);

    // Create a watermark element
    const watermarkElement = document.createElement('div');
    watermarkElement.style.position = 'absolute';
    watermarkElement.style.left = '0';
    watermarkElement.style.top = '0';
    watermarkElement.style.width = '100%';
    watermarkElement.style.height = '100%';
    watermarkElement.style.display = 'flex';
    watermarkElement.style.alignItems = 'center';
    watermarkElement.style.justifyContent = 'center';
    watermarkElement.style.opacity = '0.09';
    watermarkElement.style.pointerEvents = 'none';

    const watermarkImage = document.createElement('img');
    watermarkImage.src = waterMarkText;
    watermarkImage.style.width = '75%';
    watermarkImage.style.height = '50%';
    watermarkImage.style.objectFit = 'contain';

    watermarkElement.appendChild(watermarkImage);

    const addPageNumbersAndHeadersFooters = (doc, watermarkImage, qrCodeImage) => {
      const totalPages = doc.internal.getNumberOfPages();
      const margin = 15; // Adjust as needed
      const footerHeight = 15; // Adjust as needed
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.innerHTML = pdfElement;
      document.body.appendChild(tempDiv);
      const rect = tempDiv.getBoundingClientRect();
      const reservedSealHeight = 45;
      const actualContentHeight = rect.height * (25.4 / 96);
      const pageHeight = doc.internal.pageSize.getHeight();
      // Total usable height for content
      const usableContentHeight = pageHeight - footerHeight - margin - reservedSealHeight;
      const contentEndY = Math.min(actualContentHeight, usableContentHeight);

      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const contentEndY = pageHeight - footerHeight - margin - 20; // leave gap above footer

        doc.setFontSize(12);
        const headerImgWidth = pageWidth * 0.95;
        const headerImgHeight = pageHeight * 0.09;
        const headerX = 5;
        const headerY = 3.5;
        if (head !== '') {
          doc.addImage(head, 'JPEG', headerX, headerY, headerImgWidth, headerImgHeight, '', 'FAST', 0.1);
        } else {
          doc.setFillColor(255, 255, 255);
          doc.rect(headerX, headerY, headerImgWidth, headerImgHeight, 'F'); // "F" = filled rectangle

        }
        const imgWidth = pageWidth * 0.5;
        const imgHeight = pageHeight * 0.25;
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2 - 20;
        doc.setFillColor(0, 0, 0, 0.1);
        doc.addImage(watermarkImage, 'PNG', x, y, imgWidth, imgHeight, '', 'FAST', 0.01);

        doc.setFontSize(10);
        const footerImgWidth = pageWidth * 0.95;
        const footerImgHeight = pageHeight * 0.067;
        const footerX = 5;
        const footerY = pageHeight - footerImgHeight - 5;
        if (foot !== "") {
          doc.addImage(foot, 'JPEG', footerX, footerY, footerImgWidth, footerImgHeight, '', 'FAST', 0.1);
        } else {
          doc.setFillColor(255, 255, 255);
          doc.rect(footerX, footerY, footerImgWidth, footerImgHeight, 'F');
        }



        // ---------- SIGNATURE & SEAL ----------
        // if (documentPrepartion?.signatureneed) {
        const signatureNeed = documentPrepartion?.signatureneed; // "All Pages" or "End Page"

        if (signatureNeed === "All Pages" || (signatureNeed === "End Page" && i === totalPages)) {
          // Decide Y position right after content but above footer
          const imageY = contentEndY;

          // Seal on left
          if (documentPrepartion?.signature || documentPrepartion?.seal || documentPrepartion?.usersignature) {
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const footerGap = 20; // space to keep above footer

            // --- Unified Row Position ---
            const rowYOffset = 10; // ✅ Move row slightly lower
            const sigWidth = 40;    // reduced from 53
            const sigHeight = 6;    // reduced from 8

            const sealWidth = 17;   // reduced from 25/35
            const sealHeight = 17;  // reduced from 25/35
            const sealUpShift = 8;
            // ✅ Make user signature a bit wider but slightly shorter
            const userSigWidth = 47;  // increased width
            const userSigHeight = 20; // reduced height
            const userSigUpShift = 11;
            let yPos;

            if (i === totalPages) {
              // ✅ Use available space from bottom instead of rect.height
              yPos = documentPrepartion?.qrcodeNeed ? (pageHeight - footerGap - userSigHeight - 30) : (pageHeight - footerGap - userSigHeight); // stays near bottom
            } else {
              yPos = contentEndY + rowYOffset;
            }

            const topTextHeight = 6;
            const bottomTextHeight = 6;

            // --- Left: Main Signature ---
            let leftX = margin;
            if (documentPrepartion?.signature) {
              if (documentPrepartion?.signaturetype === "For Seal" && documentPrepartion?.topcontent) {
                doc.setFontSize(8);
                doc.setFont(undefined, "bold");
                doc.setTextColor(83, 23, 126);
                doc.text(documentPrepartion.topcontent, leftX, yPos - topTextHeight);
                doc.setTextColor(0, 0, 0);
              }

              doc.addImage(documentPrepartion.signature, "PNG", leftX, yPos, sigWidth, sigHeight);

              if (documentPrepartion?.signaturetype === "For Seal" && documentPrepartion?.bottomcontent) {
                doc.setFontSize(8);
                doc.setFont(undefined, "bold");
                doc.setTextColor(83, 23, 126);
                doc.text(
                  documentPrepartion.bottomcontent,
                  leftX,
                  yPos + sigHeight + bottomTextHeight
                );
                doc.setTextColor(0, 0, 0);
              }
            }

            // --- Center: Seal (align with same yPos) ---
            const centerX = (pageWidth / 2) - (sealWidth / 2);
            if (documentPrepartion?.seal) {
              doc.addImage(documentPrepartion.seal, "PNG", centerX, yPos - sealUpShift, sealWidth, sealHeight);
            }

            // --- Right: Employee Signature (aligned with row, adjusted size) ---
            let rightX = pageWidth - userSigWidth - margin - 10;
            if (documentPrepartion?.usersignature) {
              doc.addImage(
                documentPrepartion.usersignature,
                "PNG",
                rightX,
                yPos - userSigUpShift, // ✅ Same yPos as others (aligned row)
                userSigWidth,
                userSigHeight
              );
            }
          }




        }
        // }
        if (documentPrepartion?.pagenumberneed === 'All Pages') {
          const textY = footerY - 3;
          doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, textY, { align: 'center' });
        } else if (documentPrepartion?.pagenumberneed === 'End Page' && i === totalPages) {
          const textY = footerY - 3;
          doc.text(`End of the document`, pageWidth / 2, textY, { align: 'center' });
        }

        if (qrCodeNeed && documentPrepartion?.qrcodevalue === "End Page") {
          if (i === totalPages) {
            const qrCodeWidth = 25;
            const qrCodeHeight = 25;
            const qrCodeX = footerX;
            const qrCodeY = footerY - qrCodeHeight - 4;
            doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

            const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
              '1. Scan to verify the authenticity of this document.',
              `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
              `3. For questions, contact us at ${fromEmail}.`
            ];

            // starting position
            const statementX = qrCodeX + qrCodeWidth + 10;
            const statementY1 = qrCodeY + 10;
            const lineGap = 5; // vertical spacing between statements

            doc.setFontSize(12);

            statements.forEach((text, idx) => {
              const y = statementY1 + (idx * lineGap);
              doc.text(text, statementX, y);
            });
          }
        }
        if (qrCodeNeed && documentPrepartion?.qrcodevalue === "All Pages") {
          if (i === totalPages) {
            const qrCodeWidth = 25;
            const qrCodeHeight = 25;
            const qrCodeX = footerX;
            const qrCodeY = footerY - qrCodeHeight - 4;
            doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

            const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
              '1. Scan to verify the authenticity of this document.',
              `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
              `3. For questions, contact us at ${fromEmail}.`
            ];

            // starting position
            const statementX = qrCodeX + qrCodeWidth + 10;
            const statementY1 = qrCodeY + 10;
            const lineGap = 5; // vertical spacing between statements

            doc.setFontSize(12);

            statements.forEach((text, idx) => {
              const y = statementY1 + (idx * lineGap);
              doc.text(text, statementX, y);
            });
          }
          else {
            // ✅ for all other pages → add page number + small QR code on the right
            const textY = footerY - 3;
            // small QR code next to it (bottom-right corner)
            const qrCodeWidth = 15;   // smaller size
            const qrCodeHeight = 15;
            const qrCodeX = pageWidth - qrCodeWidth - 15; // margin from right
            const qrCodeY = footerY - qrCodeHeight - 3;   // align with page text

            doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
          }
        }
        const contentAreaHeight = pageHeight - footerHeight - margin;
      }
    };

    const hasHeaderImage = head !== ''; // assuming head is a base64 src or image URL
    const hasFooterImage = foot !== '';

    const adjustedMargin = getAdjustedMargin(selectedMargin, hasHeaderImage, hasFooterImage);
    const pdfDimensions = getPageDimensions(); // as before

    html2pdf()
      .from(pdfElement)
      .set({
        margin: adjustedMargin,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: 'mm',
          format: pdfDimensions,
          orientation: pageOrientation,
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .toPdf()
      .get('pdf')
      .then((pdf) => {
        const img = new Image();
        img.src = waterMarkText;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.globalAlpha = 0.1;
          ctx.drawImage(img, 0, 0);
          const watermarkImage = canvas.toDataURL('image/png');

          const qrImg = new Image();
          qrImg.src = imageUrl;
          qrImg.onload = () => {
            const qrCanvas = document.createElement('canvas');
            qrCanvas.width = qrImg.width;
            qrCanvas.height = qrImg.height;
            const qrCtx = qrCanvas.getContext('2d');
            qrCtx.drawImage(qrImg, 0, 0);
            const qrCodeImage = qrCanvas.toDataURL('image/png');

            addPageNumbersAndHeadersFooters(pdf, watermarkImage, qrCodeImage);

            const pdfBlob = pdf.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const printWindow = window.open(pdfUrl);
            setButtonLoadingPreview(false);
          };
        };
      });
  };

  const downloadPdfTesdtCheckTrue = (index) => {
    return new Promise((resolve, reject) => {
      // Create a new div element to hold the Quill content
      const pdfElement = document.createElement('div');

      pdfElement.innerHTML = checkingArray[index]?.data.replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`);
      const pdfElementHead = document.createElement('div');
      pdfElementHead.innerHTML = checkingArray[index]?.header;
      // Add custom styles to the PDF content
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .ql-indent-1 { margin-left: 75px; }
        .ql-indent-2 { margin-left: 150px; }
        .ql-indent-3 { margin-left: 225px; }
        .ql-indent-4 { margin-left: 275px; }
        .ql-indent-5 { margin-left: 325px; }
        .ql-indent-6 { margin-left: 375px; }
        .ql-indent-7 { margin-left: 425px; }
        .ql-indent-8 { margin-left: 475px; }
        .ql-align-right { text-align: right; }
        .ql-align-left { text-align: left; }
        .ql-align-center { text-align: center; }
        .ql-align-justify { text-align: justify; }
                          .page-break-label {
    page-break-before: always;
    break-before: page;
    margin: 20px 0;
  }
      `;
      pdfElement.appendChild(styleElement);

      // Create a watermark element
      const watermarkElement = document.createElement('div');
      watermarkElement.style.position = 'absolute';
      watermarkElement.style.left = '0';
      watermarkElement.style.top = '0';
      watermarkElement.style.width = '100%';
      watermarkElement.style.height = '100%';
      watermarkElement.style.display = 'flex';
      watermarkElement.style.alignItems = 'center';
      watermarkElement.style.justifyContent = 'center';
      watermarkElement.style.opacity = '0.09';
      watermarkElement.style.pointerEvents = 'none';

      // Create and append an image element for watermark
      const watermarkImage = document.createElement('img');
      watermarkImage.src = checkingArray[index]?.watermark;
      watermarkImage.style.width = '75%';
      watermarkImage.style.height = '50%';
      watermarkImage.style.objectFit = 'contain';
      watermarkElement.appendChild(watermarkImage);

      const addPageNumbersAndHeadersFooters = (doc, watermarkImage, qrCodeImage) => {
        const totalPages = doc.internal.getNumberOfPages();
        const margin = 15; // Adjust as needed
        const footerHeight = 15; // Adjust as needed
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.innerHTML = pdfElement;
        document.body.appendChild(tempDiv);
        const rect = tempDiv.getBoundingClientRect();
        const reservedSealHeight = 45;
        const actualContentHeight = rect.height * (25.4 / 96);
        const pageHeight = doc.internal.pageSize.getHeight();
        // Total usable height for content
        const usableContentHeight = pageHeight - footerHeight - margin - reservedSealHeight;
        const contentEndY = Math.min(actualContentHeight, usableContentHeight);

        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const contentEndY = pageHeight - footerHeight - margin - 20; // leave gap above footer

          doc.setFontSize(12);
          const headerImgWidth = pageWidth * 0.95;
          const headerImgHeight = pageHeight * 0.09;
          const headerX = 5;
          const headerY = 3.5;

          if (checkingArray[index]?.header !== '') {
            doc.addImage(checkingArray[index]?.header, 'JPEG', headerX, headerY, headerImgWidth, headerImgHeight, '', 'FAST', 0.1);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(headerX, headerY, headerImgWidth, headerImgHeight, 'F'); // "F" = filled rectangle

          }
          if (checkingArray[index]?.header !== '') {
            const imgWidth = pageWidth * 0.5;
            const imgHeight = pageHeight * 0.25;
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2 - 20;
            doc.setFillColor(0, 0, 0, 0.1);
            doc.addImage(watermarkImage, 'PNG', x, y, imgWidth, imgHeight, '', 'FAST', 0.01);
          }

          doc.setFontSize(10);
          const footerImgWidth = pageWidth * 0.95;
          const footerImgHeight = pageHeight * 0.067;
          const footerX = 5;
          const footerY = pageHeight - footerImgHeight - 5;

          if (checkingArray[index]?.footer !== "") {
            doc.addImage(checkingArray[index]?.footer, 'JPEG', footerX, footerY, footerImgWidth, footerImgHeight, '', 'FAST', 0.1);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(footerX, footerY, footerImgWidth, footerImgHeight, 'F');
          }

          // ---------- SIGNATURE & SEAL ----------
          // if (checkingArray[index]?.signatureneed) {
          const signatureNeed = checkingArray[index]?.signatureneed; // "All Pages" or "End Page"

          if (signatureNeed === "All Pages" || (signatureNeed === "End Page" && i === totalPages)) {
            // Decide Y position right after content but above footer
            const imageY = contentEndY;

            // Seal on left
            if (checkingArray[index]?.signature || checkingArray[index]?.seal || checkingArray[index]?.usersignature) {
              const pageWidth = doc.internal.pageSize.getWidth();
              const pageHeight = doc.internal.pageSize.getHeight();
              const margin = 15;
              const footerGap = 20; // space to keep above footer

              // --- Unified Row Position ---
              const rowYOffset = 10; // ✅ Move row slightly lower
              const sigWidth = 40;    // reduced from 53
              const sigHeight = 6;    // reduced from 8

              const sealWidth = 17;   // reduced from 25/35
              const sealHeight = 17;  // reduced from 25/35
              const sealUpShift = 8;
              // ✅ Make user signature a bit wider but slightly shorter
              const userSigWidth = 47;  // increased width
              const userSigHeight = 20; // reduced height
              const userSigUpShift = 11;
              let yPos;

              if (i === totalPages) {
                // ✅ Use available space from bottom instead of rect.height
                yPos = checkingArray[index]?.qrcodeNeed ? (pageHeight - footerGap - userSigHeight - 30) : (pageHeight - footerGap - userSigHeight); // stays near bottom
              } else {
                yPos = contentEndY + rowYOffset;
              }

              const topTextHeight = 6;
              const bottomTextHeight = 6;

              // --- Left: Main Signature ---
              let leftX = margin;
              if (checkingArray[index]?.signature) {
                if (checkingArray[index]?.signaturetype === "For Seal" && checkingArray[index]?.topcontent) {
                  doc.setFontSize(8);
                  doc.setFont(undefined, "bold");
                  doc.setTextColor(83, 23, 126);
                  doc.text(checkingArray[index].topcontent, leftX, yPos - topTextHeight);
                  doc.setTextColor(0, 0, 0);
                }

                doc.addImage(checkingArray[index].signature, "PNG", leftX, yPos, sigWidth, sigHeight);

                if (checkingArray[index]?.signaturetype === "For Seal" && checkingArray[index]?.bottomcontent) {
                  doc.setFontSize(8);
                  doc.setFont(undefined, "bold");
                  doc.setTextColor(83, 23, 126);
                  doc.text(
                    checkingArray[index].bottomcontent,
                    leftX,
                    yPos + sigHeight + bottomTextHeight
                  );
                  doc.setTextColor(0, 0, 0);
                }
              }

              // --- Center: Seal (align with same yPos) ---
              const centerX = (pageWidth / 2) - (sealWidth / 2);
              if (checkingArray[index]?.seal) {
                doc.addImage(checkingArray[index].seal, "PNG", centerX, yPos - sealUpShift, sealWidth, sealHeight);
              }

              // --- Right: Employee Signature (aligned with row, adjusted size) ---
              let rightX = pageWidth - userSigWidth - margin - 10;
              if (checkingArray[index]?.usersignature) {
                doc.addImage(
                  checkingArray[index].usersignature,
                  "PNG",
                  rightX,
                  yPos - userSigUpShift, // ✅ Same yPos as others (aligned row)
                  userSigWidth,
                  userSigHeight
                );
              }
            }
          }
          // }
          if (checkingArray[index]?.pagenumberneed === 'All Pages') {
            const textY = footerY - 3;
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, textY, { align: 'center' });
          } else if (checkingArray[index]?.pagenumberneed === 'End Page' && i === totalPages) {
            const textY = footerY - 3;
            doc.text(`End of the document`, pageWidth / 2, textY, { align: 'center' });
          }

          if (checkingArray[index]?.qrcodeNeed && checkingArray[index]?.qrcodevalue === "End Page") {
            if (i === totalPages) {
              const qrCodeWidth = 25;
              const qrCodeHeight = 25;
              const qrCodeX = footerX;
              const qrCodeY = footerY - qrCodeHeight - 4;
              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

              const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                '1. Scan to verify the authenticity of this document.',
                `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                `3. For questions, contact us at ${checkingArray[index]?.frommailemail}.`
              ];

              // starting position
              const statementX = qrCodeX + qrCodeWidth + 10;
              const statementY1 = qrCodeY + 10;
              const lineGap = 5; // vertical spacing between statements

              doc.setFontSize(12);

              statements.forEach((text, idx) => {
                const y = statementY1 + (idx * lineGap);
                doc.text(text, statementX, y);
              });


            }
          }
          if (checkingArray[index]?.qrcodeNeed && checkingArray[index]?.qrcodevalue === "All Pages") {
            if (i === totalPages) {
              const qrCodeWidth = 25;
              const qrCodeHeight = 25;
              const qrCodeX = footerX;
              const qrCodeY = footerY - qrCodeHeight - 4;
              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

              const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                '1. Scan to verify the authenticity of this document.',
                `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                `3. For questions, contact us at ${checkingArray[index]?.frommailemail}.`
              ];

              // starting position
              const statementX = qrCodeX + qrCodeWidth + 10;
              const statementY1 = qrCodeY + 10;
              const lineGap = 5; // vertical spacing between statements

              doc.setFontSize(12);

              statements.forEach((text, idx) => {
                const y = statementY1 + (idx * lineGap);
                doc.text(text, statementX, y);
              });


            }
            else {
              // ✅ for all other pages → add page number + small QR code on the right
              const textY = footerY - 3;
              // small QR code next to it (bottom-right corner)
              const qrCodeWidth = 15;   // smaller size
              const qrCodeHeight = 15;
              const qrCodeX = pageWidth - qrCodeWidth - 15; // margin from right
              const qrCodeY = footerY - qrCodeHeight - 3;   // align with page text

              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
            }
          }
          const contentAreaHeight = pageHeight - footerHeight - margin;
        }
      };

      const hasHeaderImage = checkingArray[index]?.header !== ''; // assuming head is a base64 src or image URL
      const hasFooterImage = checkingArray[index]?.footer !== '';

      const adjustedMargin = getAdjustedMargin(selectedMargin, hasHeaderImage, hasFooterImage);
      const pdfDimensions = getPageDimensions(); // as before
      // Convert the HTML content to PDF
      html2pdf()
        .from(pdfElement)
        .set({
          margin: adjustedMargin,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: {
            unit: 'mm',
            format: pdfDimensions,
            orientation: pageOrientation,
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .toPdf()
        .get('pdf')
        .then((pdf) => {
          // Convert the watermark image to a base64 string
          const img = new Image();
          img.src = waterMarkText;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.globalAlpha = 0.1;
            ctx.drawImage(img, 0, 0);
            const watermarkImage = canvas.toDataURL('image/png');

            // Add QR code image
            const qrImg = new Image();
            qrImg.src = checkingArray[index]?.qrcode; // QR code image URL
            qrImg.onload = () => {
              const qrCanvas = document.createElement('canvas');
              qrCanvas.width = qrImg.width;
              qrCanvas.height = qrImg.height;
              const qrCtx = qrCanvas.getContext('2d');
              qrCtx.drawImage(qrImg, 0, 0);
              const qrCodeImage = qrCanvas.toDataURL('image/png');

              // Add page numbers, watermark, and QR code to each page
              addPageNumbersAndHeadersFooters(pdf, watermarkImage, qrCodeImage);

              // Return the boolean indicating if the document has more than one page
              const isMultiPage = pdf.internal.getNumberOfPages() > 1;
              resolve(isMultiPage);
            };
          };
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const downloadPdfTesdtCheckTrueManual = () => {
    return new Promise((resolve, reject) => {
      // Create a new div element to hold the Quill content
      const pdfElement = document.createElement('div');

      pdfElement.innerHTML = checking;
      let findMethod = checking
        ?.replaceAll(
          '$RSEAL$',
          sealPlacement
            ? `<span style="display: inline-block; position: relative; width: 100px; height: 90px;">
         <img src="${sealPlacement}" alt="Seal" style="position: absolute; z-index: -1; width: 100px; height: 90px;" />
       </span>`
            : ''
        )
        .replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`)
        .replaceAll(
          '$FSIGNATURE$',
          signatureContent?.seal === 'For Seal'
            ? `<span style="display: inline-block; vertical-align: top;">
          <span style="color:#53177e; font-weight: bold;">${signatureContent?.topcontent}</span><br/>
          ${signature
              ? `<span style="position: relative; display: inline-block;">
                   <img src="${signature}" alt="Signature" style="position: absolute; z-index: -1; width: 200px; height: 30px;" />
                 </span><br/>`
              : ''
            }
          <span style="color:#53177e; font-weight: bold; display: inline-block; margin-top: 25px;">
            ${signatureContent?.bottomcontent}
          </span>
       </span>`
            : ''
        )
        .replaceAll(
          '$SIGNATURE$',
          signatureContent?.seal === 'None'
            ? `
      <img src="${signature}" alt="Signature" style="position:absolute; z-index:-1; width: 200px; height: 30px;" />
           `
            : ''
        );
      pdfElement.innerHTML = DOMPurify.sanitize(findMethod);
      const pdfElementHead = document.createElement('div');

      pdfElementHead.innerHTML = head;
      // Add custom styles to the PDF content
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .ql-indent-1 { margin-left: 75px; }
        .ql-indent-2 { margin-left: 150px; }
        .ql-indent-3 { margin-left: 225px; }
        .ql-indent-4 { margin-left: 275px; }
        .ql-indent-5 { margin-left: 325px; }
        .ql-indent-6 { margin-left: 375px; }
        .ql-indent-7 { margin-left: 425px; }
        .ql-indent-8 { margin-left: 475px; }
        .ql-align-right { text-align: right; }
        .ql-align-left { text-align: left; }
        .ql-align-center { text-align: center; }
        .ql-align-justify { text-align: justify; }
                          .page-break-label {
    page-break-before: always;
    break-before: page;
    margin: 20px 0;
  }
      `;
      pdfElement.appendChild(styleElement);

      // Create a watermark element
      const watermarkElement = document.createElement('div');
      watermarkElement.style.position = 'absolute';
      watermarkElement.style.left = '0';
      watermarkElement.style.top = '0';
      watermarkElement.style.width = '100%';
      watermarkElement.style.height = '100%';
      watermarkElement.style.display = 'flex';
      watermarkElement.style.alignItems = 'center';
      watermarkElement.style.justifyContent = 'center';
      watermarkElement.style.opacity = '0.09';
      watermarkElement.style.pointerEvents = 'none';

      // Create and append an image element for watermark
      const watermarkImage = document.createElement('img');
      watermarkImage.src = waterMarkText;
      watermarkImage.style.width = '75%';
      watermarkImage.style.height = '50%';
      watermarkImage.style.objectFit = 'contain';
      watermarkElement.appendChild(watermarkImage);

      const addPageNumbersAndHeadersFooters = (doc, watermarkImage, qrCodeImage) => {
        const totalPages = doc.internal.getNumberOfPages();
        const margin = 15; // Adjust as needed
        const footerHeight = 15; // Adjust as needed
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.innerHTML = pdfElement;
        document.body.appendChild(tempDiv);
        const rect = tempDiv.getBoundingClientRect();
        const reservedSealHeight = 45;
        const actualContentHeight = rect.height * (25.4 / 96);
        const pageHeight = doc.internal.pageSize.getHeight();
        // Total usable height for content
        const usableContentHeight = pageHeight - footerHeight - margin - reservedSealHeight;
        const contentEndY = Math.min(actualContentHeight, usableContentHeight);

        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const contentEndY = pageHeight - footerHeight - margin - 20; // leave gap above footer

          doc.setFontSize(12);
          const headerImgWidth = pageWidth * 0.95;
          const headerImgHeight = pageHeight * 0.09;
          const headerX = 5;
          const headerY = 3.5;
          if (head !== '') {
            doc.addImage(head, 'JPEG', headerX, headerY, headerImgWidth, headerImgHeight, '', 'FAST', 0.1);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(headerX, headerY, headerImgWidth, headerImgHeight, 'F'); // "F" = filled rectangle

          }
          const imgWidth = pageWidth * 0.5;
          const imgHeight = pageHeight * 0.25;
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2 - 20;
          doc.setFillColor(0, 0, 0, 0.1);
          doc.addImage(watermarkImage, 'PNG', x, y, imgWidth, imgHeight, '', 'FAST', 0.01);

          doc.setFontSize(10);
          const footerImgWidth = pageWidth * 0.95;
          const footerImgHeight = pageHeight * 0.067;
          const footerX = 5;
          const footerY = pageHeight - footerImgHeight - 5;
          if (foot !== "") {
            doc.addImage(foot, 'JPEG', footerX, footerY, footerImgWidth, footerImgHeight, '', 'FAST', 0.1);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(footerX, footerY, footerImgWidth, footerImgHeight, 'F');
          }

          // ---------- SIGNATURE & SEAL ----------
          // if (documentPrepartion?.signatureneed) {
          const signatureNeed = documentPrepartion?.signatureneed; // "All Pages" or "End Page"

          if (signatureNeed === "All Pages" || (signatureNeed === "End Page" && i === totalPages)) {
            // Decide Y position right after content but above footer
            const imageY = contentEndY;

            // Seal on left
            if (documentPrepartion?.signature || documentPrepartion?.seal || documentPrepartion?.usersignature) {
              const pageWidth = doc.internal.pageSize.getWidth();
              const pageHeight = doc.internal.pageSize.getHeight();
              const margin = 15;
              const footerGap = 20; // space to keep above footer

              // --- Unified Row Position ---
              const rowYOffset = 10; // ✅ Move row slightly lower
              const sigWidth = 40;    // reduced from 53
              const sigHeight = 6;    // reduced from 8

              const sealWidth = 17;   // reduced from 25/35
              const sealHeight = 17;  // reduced from 25/35
              const sealUpShift = 8;
              // ✅ Make user signature a bit wider but slightly shorter
              const userSigWidth = 47;  // increased width
              const userSigHeight = 20; // reduced height
              const userSigUpShift = 11;
              let yPos;

              if (i === totalPages) {
                // ✅ Use available space from bottom instead of rect.height
                yPos = documentPrepartion?.qrcodeNeed ? (pageHeight - footerGap - userSigHeight - 30) : (pageHeight - footerGap - userSigHeight); // stays near bottom
              } else {
                yPos = contentEndY + rowYOffset;
              }

              const topTextHeight = 6;
              const bottomTextHeight = 6;

              // --- Left: Main Signature ---
              let leftX = margin;
              if (documentPrepartion?.signature) {
                if (documentPrepartion?.signaturetype === "For Seal" && documentPrepartion?.topcontent) {
                  doc.setFontSize(8);
                  doc.setFont(undefined, "bold");
                  doc.setTextColor(83, 23, 126);
                  doc.text(documentPrepartion.topcontent, leftX, yPos - topTextHeight);
                  doc.setTextColor(0, 0, 0);
                }

                doc.addImage(documentPrepartion.signature, "PNG", leftX, yPos, sigWidth, sigHeight);

                if (documentPrepartion?.signaturetype === "For Seal" && documentPrepartion?.bottomcontent) {
                  doc.setFontSize(8);
                  doc.setFont(undefined, "bold");
                  doc.setTextColor(83, 23, 126);
                  doc.text(
                    documentPrepartion.bottomcontent,
                    leftX,
                    yPos + sigHeight + bottomTextHeight
                  );
                  doc.setTextColor(0, 0, 0);
                }
              }

              // --- Center: Seal (align with same yPos) ---
              const centerX = (pageWidth / 2) - (sealWidth / 2);
              if (documentPrepartion?.seal) {
                doc.addImage(documentPrepartion.seal, "PNG", centerX, yPos - sealUpShift, sealWidth, sealHeight);
              }

              // --- Right: Employee Signature (aligned with row, adjusted size) ---
              let rightX = pageWidth - userSigWidth - margin - 10;
              if (documentPrepartion?.usersignature) {
                doc.addImage(
                  documentPrepartion.usersignature,
                  "PNG",
                  rightX,
                  yPos - userSigUpShift, // ✅ Same yPos as others (aligned row)
                  userSigWidth,
                  userSigHeight
                );
              }
            }




          }
          // }

          if (documentPrepartion?.pagenumberneed === 'All Pages') {
            const textY = footerY - 3;
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, textY, { align: 'center' });
          } else if (documentPrepartion?.pagenumberneed === 'End Page' && i === totalPages) {
            const textY = footerY - 3;
            doc.text(`End of the document`, pageWidth / 2, textY, { align: 'center' });
          }

          if (qrCodeNeed && documentPrepartion?.qrcodevalue === "End Page") {
            if (i === totalPages) {
              const qrCodeWidth = 25;
              const qrCodeHeight = 25;
              const qrCodeX = footerX;
              const qrCodeY = footerY - qrCodeHeight - 4;
              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

              const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                '1. Scan to verify the authenticity of this document.',
                `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                `3. For questions, contact us at ${fromEmail}.`
              ];

              // starting position
              const statementX = qrCodeX + qrCodeWidth + 10;
              const statementY1 = qrCodeY + 10;
              const lineGap = 5; // vertical spacing between statements

              doc.setFontSize(12);

              statements.forEach((text, idx) => {
                const y = statementY1 + (idx * lineGap);
                doc.text(text, statementX, y);
              });
            }
          }
          if (qrCodeNeed && documentPrepartion?.qrcodevalue === "All Pages") {
            if (i === totalPages) {
              const qrCodeWidth = 25;
              const qrCodeHeight = 25;
              const qrCodeX = footerX;
              const qrCodeY = footerY - qrCodeHeight - 4;
              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

              const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                '1. Scan to verify the authenticity of this document.',
                `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                `3. For questions, contact us at ${fromEmail}.`
              ];

              // starting position
              const statementX = qrCodeX + qrCodeWidth + 10;
              const statementY1 = qrCodeY + 10;
              const lineGap = 5; // vertical spacing between statements

              doc.setFontSize(12);

              statements.forEach((text, idx) => {
                const y = statementY1 + (idx * lineGap);
                doc.text(text, statementX, y);
              });
            }
            else {
              // ✅ for all other pages → add page number + small QR code on the right
              const textY = footerY - 3;
              // small QR code next to it (bottom-right corner)
              const qrCodeWidth = 15;   // smaller size
              const qrCodeHeight = 15;
              const qrCodeX = pageWidth - qrCodeWidth - 15; // margin from right
              const qrCodeY = footerY - qrCodeHeight - 3;   // align with page text

              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
            }
          }
          const contentAreaHeight = pageHeight - footerHeight - margin;
        }
      };
      const hasHeaderImage = head !== ''; // assuming head is a base64 src or image URL
      const hasFooterImage = foot !== '';

      const adjustedMargin = getAdjustedMargin(selectedMargin, hasHeaderImage, hasFooterImage);
      const pdfDimensions = getPageDimensions(); // as before
      // Convert the HTML content to PDF
      html2pdf()
        .from(pdfElement)
        .set({
          margin: adjustedMargin,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: {
            unit: 'mm',
            format: pdfDimensions,
            orientation: pageOrientation,
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .toPdf()
        .get('pdf')
        .then((pdf) => {
          // Convert the watermark image to a base64 string
          const img = new Image();
          img.src = waterMarkText;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.globalAlpha = 0.1;
            ctx.drawImage(img, 0, 0);
            const watermarkImage = canvas.toDataURL('image/png');

            // Add QR code image
            const qrImg = new Image();
            qrImg.src = imageUrl; // QR code image URL
            qrImg.onload = () => {
              const qrCanvas = document.createElement('canvas');
              qrCanvas.width = qrImg.width;
              qrCanvas.height = qrImg.height;
              const qrCtx = qrCanvas.getContext('2d');
              qrCtx.drawImage(qrImg, 0, 0);
              const qrCodeImage = qrCanvas.toDataURL('image/png');

              // Add page numbers, watermark, and QR code to each page
              addPageNumbersAndHeadersFooters(pdf, watermarkImage, qrCodeImage);

              // Return the boolean indicating if the document has more than one page
              const isMultiPage = pdf.internal.getNumberOfPages() > 1;
              resolve(isMultiPage);
            };
          };
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const handleBulkPrint = async () => {
    if (headerOptions === 'Please Select Print Options') {
      setButtonLoadingPreview(false);
      setPopupContentMalert('Please Select Print Options!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (headerOptions === 'With Letter Head' && selectedHeadOpt?.length < 1) {
      setPopupContentMalert('Please Select With Letter Head!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      setLoadingGeneratingDatas(true);
      // Create a new div element to hold the Quill content
      await Promise.all(
        selectedRows?.map(async (item) => {
          setBulkPrintStatus(true);
          let response = await axios.get(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${item}`, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
          });
          await getUpdatePrintingStatus(item, response?.data?.sdocumentPreparation?.updatedby);

          setLoadingGeneratingMessage('Printing the set the Documents..!');
          const pdfElement = document.createElement('div');
          pdfElement.innerHTML = response?.data?.sdocumentPreparation?.document.replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`);

          // Add custom styles to the PDF content
          const styleElement = document.createElement('style');
          styleElement.textContent = `
    .ql-indent-1 { margin-left: 75px; } /* Adjust margin for indent-1 class */
    .ql-indent-2 { margin-left: 150px; } /* Adjust margin for indent-2 class */
    .ql-indent-3 { margin-left: 225px; } /* Adjust margin for indent-3 class */
    .ql-indent-4 { margin-left: 275px; } /* Adjust margin for indent-4 class */
    .ql-indent-5 { margin-left: 325px; } /* Adjust margin for indent-5 class */
    .ql-indent-6 { margin-left: 375px; } /* Adjust margin for indent-6 class */
    .ql-indent-7 { margin-left: 425px; } /* Adjust margin for indent-7 class */
    .ql-indent-8 { margin-left: 475px; } /* Adjust margin for indent-8 class */
    .ql-align-right { text-align: right; } 
    .ql-align-left { text-align: left; } 
    .ql-align-center { text-align: center; } 
    .ql-align-justify { text-align: justify; } 
                      .page-break-label {
    page-break-before: always;
    break-before: page;
    margin: 20px 0;
  }
  `;

          pdfElement.appendChild(styleElement);

          // pdfElement.appendChild(styleElement);
          const addPageNumbersAndHeadersFooters = (doc, watermarkImage, qrCodeImage) => {
            const totalPages = doc.internal.getNumberOfPages();
            const margin = 15; // Adjust as needed
            const footerHeight = 15; // Adjust as needed
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.visibility = 'hidden';
            tempDiv.innerHTML = pdfElement;
            document.body.appendChild(tempDiv);
            const rect = tempDiv.getBoundingClientRect();
            const reservedSealHeight = 45;
            const actualContentHeight = rect.height * (25.4 / 96);
            const pageHeight = doc.internal.pageSize.getHeight();
            // Total usable height for content
            const usableContentHeight = pageHeight - footerHeight - margin - reservedSealHeight;
            const contentEndY = Math.min(actualContentHeight, usableContentHeight);

            for (let i = 1; i <= totalPages; i++) {
              doc.setPage(i);
              const pageWidth = doc.internal.pageSize.getWidth();
              const pageHeight = doc.internal.pageSize.getHeight();
              const contentEndY = pageHeight - footerHeight - margin - 20; // leave gap above footer

              // Add header
              doc.setFontSize(12);
              // doc.text(convertToNumberedList(head), pageWidth / 2, 10, { align: 'center' });
              const headerImgWidth = pageWidth * 0.95; // Adjust as needed
              const headerImgHeight = pageHeight * 0.09; // Adjust as needed
              //const headerX = (pageWidth - headerImgWidth) / 2;
              // const headerY = 6; // Adjust as needed for header position
              const headerX = 5; // Start from the left
              const headerY = 3.5; // Start from the top
              if (head !== '') {
                doc.addImage(head, 'JPEG', headerX, headerY, headerImgWidth, headerImgHeight, '', 'FAST', 0.1);
              } else {
                doc.setFillColor(255, 255, 255);
                doc.rect(headerX, headerY, headerImgWidth, headerImgHeight, 'F'); // "F" = filled rectangle
              }
              const imgWidth = pageWidth * 0.5; // 75% of page width
              const imgHeight = pageHeight * 0.25; // 50% of page height
              const x = (pageWidth - imgWidth) / 2;
              const y = (pageHeight - imgHeight) / 2 - 20;
              doc.setFillColor(0, 0, 0, 0.1);
              doc.addImage(watermarkImage, 'PNG', x, y, imgWidth, imgHeight, '', 'FAST', 0.01);
              // Add footer
              doc.setFontSize(10);
              // doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
              // Add footer image stretched to page width
              const footerImgWidth = pageWidth * 0.95; // Stretch to full page width
              const footerImgHeight = pageHeight * 0.067; // Adjust height as needed
              const footerX = 5; // Start from the left
              const footerY = pageHeight - footerImgHeight - 5;
              if (foot !== "") {
                doc.addImage(foot, 'JPEG', footerX, footerY, footerImgWidth, footerImgHeight, '', 'FAST', 0.1);
              } else {
                doc.setFillColor(255, 255, 255);
                doc.rect(footerX, footerY, footerImgWidth, footerImgHeight, 'F');
              }

              // ---------- SIGNATURE & SEAL ----------
              // if (response?.data?.sdocumentPreparation?.signatureneed) {
              const signatureNeed = response?.data?.sdocumentPreparation?.signatureneed; // "All Pages" or "End Page"

              if (signatureNeed === "All Pages" || (signatureNeed === "End Page" && i === totalPages)) {
                // Decide Y position right after content but above footer
                const imageY = contentEndY;

                // Seal on left
                if (response?.data?.sdocumentPreparation?.signature || response?.data?.sdocumentPreparation?.seal || response?.data?.sdocumentPreparation?.usersignature) {
                  const pageWidth = doc.internal.pageSize.getWidth();
                  const pageHeight = doc.internal.pageSize.getHeight();
                  const margin = 15;
                  const footerGap = 20; // space to keep above footer

                  // --- Unified Row Position ---
                  const rowYOffset = 10; // ✅ Move row slightly lower
                  const sigWidth = 40;    // reduced from 53
                  const sigHeight = 6;    // reduced from 8

                  const sealWidth = 17;   // reduced from 25/35
                  const sealHeight = 17;  // reduced from 25/35
                  const sealUpShift = 8;
                  // ✅ Make user signature a bit wider but slightly shorter
                  const userSigWidth = 47;  // increased width
                  const userSigHeight = 20; // reduced height
                  const userSigUpShift = 11;
                  let yPos;

                  if (i === totalPages) {
                    // ✅ Use available space from bottom instead of rect.height
                    yPos = response?.data?.sdocumentPreparation?.qrCodeNeed ? (pageHeight - footerGap - userSigHeight - 30) : (pageHeight - footerGap - userSigHeight); // stays near bottom
                  } else {
                    yPos = contentEndY + rowYOffset;
                  }

                  const topTextHeight = 6;
                  const bottomTextHeight = 6;

                  // --- Left: Main Signature ---
                  let leftX = margin;
                  if (response?.data?.sdocumentPreparation?.signature) {
                    if (response?.data?.sdocumentPreparation?.signaturetype === "For Seal" && response?.data?.sdocumentPreparation?.topcontent) {
                      doc.setFontSize(8);
                      doc.setFont(undefined, "bold");
                      doc.setTextColor(83, 23, 126);
                      doc.text(response?.data?.sdocumentPreparation.topcontent, leftX, yPos - topTextHeight);
                      doc.setTextColor(0, 0, 0);
                    }

                    doc.addImage(response?.data?.sdocumentPreparation.signature, "PNG", leftX, yPos, sigWidth, sigHeight);

                    if (response?.data?.sdocumentPreparation?.signaturetype === "For Seal" && response?.data?.sdocumentPreparation?.bottomcontent) {
                      doc.setFontSize(8);
                      doc.setFont(undefined, "bold");
                      doc.setTextColor(83, 23, 126);
                      doc.text(
                        response?.data?.sdocumentPreparation.bottomcontent,
                        leftX,
                        yPos + sigHeight + bottomTextHeight
                      );
                      doc.setTextColor(0, 0, 0);
                    }
                  }

                  // --- Center: Seal (align with same yPos) ---
                  const centerX = (pageWidth / 2) - (sealWidth / 2);
                  if (response?.data?.sdocumentPreparation?.seal) {
                    doc.addImage(response?.data?.sdocumentPreparation.seal, "PNG", centerX, yPos - sealUpShift, sealWidth, sealHeight);
                  }

                  // --- Right: Employee Signature (aligned with row, adjusted size) ---
                  let rightX = pageWidth - userSigWidth - margin - 10;
                  if (response?.data?.sdocumentPreparation?.usersignature) {
                    doc.addImage(
                      response?.data?.sdocumentPreparation.usersignature,
                      "PNG",
                      rightX,
                      yPos - userSigUpShift, // ✅ Same yPos as others (aligned row)
                      userSigWidth,
                      userSigHeight
                    );
                  }
                }




              }
              // }
              if (response?.data?.sdocumentPreparation?.pagenumberneed === 'All Pages') {
                const textY = footerY - 3;
                doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, textY, { align: 'center' });
              } else if (response?.data?.sdocumentPreparation?.pagenumberneed === 'End Page' && i === totalPages) {
                const textY = footerY - 3;
                doc.text(`End of the document`, pageWidth / 2, textY, { align: 'center' });
              }
              // Add QR code and statement only on the last page

              if (response?.data?.sdocumentPreparation?.qrCodeNeed && response?.data?.sdocumentPreparation?.qrcodevalue === "End Page") {
                if (i === totalPages) {
                  // Add QR code in the left corner
                  const qrCodeWidth = 25; // Adjust as needed
                  const qrCodeHeight = 25; // Adjust as needed
                  const qrCodeX = footerX; // Left corner
                  const qrCodeY = footerY - qrCodeHeight - 4; // 15 units above the footer image
                  doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);



                  const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                    '1. Scan to verify the authenticity of this document.',
                    `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                    `3. For questions, contact us at ${fromEmail}.`
                  ];

                  // starting position
                  const statementX = qrCodeX + qrCodeWidth + 10;
                  const statementY1 = qrCodeY + 10;
                  const lineGap = 5; // vertical spacing between statements

                  doc.setFontSize(12);

                  statements.forEach((text, idx) => {
                    const y = statementY1 + (idx * lineGap);
                    doc.text(text, statementX, y);
                  });

                }
              }
              if (response?.data?.sdocumentPreparation?.qrCodeNeed && response?.data?.sdocumentPreparation?.qrcodevalue === "All Pages") {
                if (i === totalPages) {
                  // Add QR code in the left corner
                  const qrCodeWidth = 25; // Adjust as needed
                  const qrCodeHeight = 25; // Adjust as needed
                  const qrCodeX = footerX; // Left corner
                  const qrCodeY = footerY - qrCodeHeight - 4; // 15 units above the footer image
                  doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);



                  const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                    '1. Scan to verify the authenticity of this document.',
                    `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                    `3. For questions, contact us at ${fromEmail}.`
                  ];

                  // starting position
                  const statementX = qrCodeX + qrCodeWidth + 10;
                  const statementY1 = qrCodeY + 10;
                  const lineGap = 5; // vertical spacing between statements

                  doc.setFontSize(12);

                  statements.forEach((text, idx) => {
                    const y = statementY1 + (idx * lineGap);
                    doc.text(text, statementX, y);
                  });

                }
                else {
                  // ✅ for all other pages → add page number + small QR code on the right
                  const textY = footerY - 3;
                  // small QR code next to it (bottom-right corner)
                  const qrCodeWidth = 15;   // smaller size
                  const qrCodeHeight = 15;
                  const qrCodeX = pageWidth - qrCodeWidth - 15; // margin from right
                  const qrCodeY = footerY - qrCodeHeight - 3;   // align with page text

                  doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
                }
              }
            }
          };

          const hasHeaderImage = head !== ''; // assuming head is a base64 src or image URL
          const hasFooterImage = foot !== '';

          const adjustedMargin = getAdjustedMargin(response.data.sdocumentPreparation?.marginQuill, hasHeaderImage, hasFooterImage);
          const pdfDimensions = getPageDimensionsTable(response.data.sdocumentPreparation?.pagesizeQuill, response.data.sdocumentPreparation?.orientationQuill); // as before
          // Convert the HTML content to PDF
          html2pdf()
            .from(pdfElement)
            .set({
              margin: adjustedMargin,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: {
                unit: 'mm',
                format: pdfDimensions,
                orientation: response.data.sdocumentPreparation?.orientationQuill,
              },
              pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
            })
            .toPdf()
            .get('pdf')
            .then((pdf) => {
              // Convert the watermark image to a base64 string
              const img = new Image();
              img.src = response?.data?.sdocumentPreparation?.watermark;
              img.onload = () => {
                const canvas = document?.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.globalAlpha = 0.1;
                ctx.drawImage(img, 0, 0);
                const watermarkImage = canvas.toDataURL('image/png');

                // Add QR code image
                const qrImg = new Image();
                qrImg.src = response?.data?.sdocumentPreparation?.qrcode; // QR code image URL
                qrImg.onload = () => {
                  const qrCanvas = document.createElement('canvas');
                  qrCanvas.width = qrImg.width;
                  qrCanvas.height = qrImg.height;
                  const qrCtx = qrCanvas.getContext('2d');
                  qrCtx.drawImage(qrImg, 0, 0);
                  const qrCodeImage = qrCanvas.toDataURL('image/png');

                  // Add page numbers and watermark to each page
                  addPageNumbersAndHeadersFooters(pdf, watermarkImage, qrCodeImage);

                  // Save the PDF
                  pdf.save(`${response?.data?.sdocumentPreparation?.template}_${response?.data?.sdocumentPreparation?.person}.pdf`);
                  setBulkPrintStatus(false);
                };
              };
            });
        })
      );
      await fetchBrandMaster();
      handleClickCloseLetterHead();
      setChanged('dsdss');
      handleCloseBulkModcheckbox();
      setSelectedRows([]);
      setSelectAllChecked(false);
      setLoadingGeneratingDatas(false);
    }
  };

  //set function to get particular row
  const rowData = async (id, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDocumentPreparationEdit(res?.data?.sdocumentPreparation);
      handleClickOpen();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  // Alert delete popup
  let brandid = documentPreparationEdit?._id;
  const delBrand = async () => {
    setPageName(!pageName);
    try {
      await axios.delete(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${brandid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      await fetchBrandMaster();
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

  //add function
  const sendRequest = async () => {
    setBtnLoad(true);
    setPageName(!pageName);
    setProgressOpen(false);
    setSavingDatas(true);
    const batchSize = 10; // Adjust batch size as needed
    const batches = [];

    // Split checkingArray into batches
    for (let i = 0; i < checkingArray.length; i += batchSize) {
      batches.push(checkingArray.slice(i, i + batchSize));
    }

    try {
      for (const batch of batches) {
        const batchRequests = batch.map(async (data) => {
          await axios.post(SERVICE.CREATE_DOCUMENT_PREPARATION, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            date: String(date),
            template: String(data.template),
            documentname: String(data.documentname),
            referenceno: data?.referenceno,
            tempcode: data?.tempcode,
            termsAndConditons: templateCreationValue?.termsAndConditons,
            templateno: data?.autoid,
            email: data?.email,
            employeemode: String(data.employeemode),
            issuingauthority: String(data.issuingauthority),
            department: String(data.department),
            company: String(data.company),
            branch: String(data.branch),
            unit: String(data.unit),
            team: String(data.team),
            pagenumberneed: String(data.pagenumberneed),
            signatureneed: String(data.signatureneed),
            topcontent: String(data.topcontent),
            signaturetype: data?.signaturetype,
            bottomcontent: String(data.bottomcontent),
            usersignature: String(data.usersignature),
            qrcodevalue: String(data.qrcodevalue),
            documentneed: String(data.documentneed),
            person: data.empname === 'Please Select Person' ? '' : data.empname,
            proption: String(data?.proption),
            employeedoj: data?.employeedoj,
            watermark: data?.watermark,
            pageheight: data?.pageheight,
            pagewidth: data?.pagewidth,
            pagesize: data?.pagesize,
            head: data.documentneed === 'Employee Approval' ? data?.header : '',
            foot: data.documentneed === 'Employee Approval' ? data?.footer : '',
            qrCodeNeed: data?.qrcodeNeed,
            sign: data?.sign,
            sealing: data?.sealing,
            printingstatus: 'Not-Printed',
            signature: data?.signature,
            seal: data?.seal,
            qrcode: data?.qrcode,
            issuedpersondetails: String(isUserRoleAccess.companyname),
            document: data?.data,
            frommailemail: data?.frommailemail,
            marginQuill: String(selectedMargin),
            orientationQuill: String(pageOrientation),
            pagesizeQuill: String(pageSizeQuill),
            mail: 'Send',
            printoptions: '',
            addedby: [
              {
                name: String(username),
              },
            ],
          });
        });

        // Wait for the current batch to complete before proceeding to the next
        await Promise.all(batchRequests);
      }
      setSavingDatas(false);
      await fetchBrandMaster();
      handleCloseInfoImage();
      setDocumentPrepartion({
        ...documentPrepartion,
        person: 'Please Select Person',
        documentneed: 'Print Document',
      });
      setHeader('');
      // setFooter("");
      setSelectedHeadOptAdd([]);
      setQrCodeNeed(false);
      setChecking('');
      setCheckingArray([]);
      setIndexViewQuest(1);
      setEmployeeControlPanel('');
      setEmployeeValue([]);
      setEmployeeUserName('');
      window.scrollTo(0, 0);
      setPopupContent('Added Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    } finally {
      setBtnLoad(false);
      setSearchQuery('');
    }
  };

  const sendRequestManual = async () => {
    setBtnLoad(true);
    const constAuotId = await fetchAllRaisedTickets();
    let prefixLength = Number(constAuotId[constAuotId?.length - 1]) + 1;
    let prefixString = String(prefixLength);
    let postfixLength =
      prefixString.length == 1
        ? `000${prefixString}`
        : prefixString.length == 2
          ? `00${prefixString}`
          : prefixString.length == 3
            ? `0${prefixString}`
            : prefixString.length == 4
              ? `0${prefixString}`
              : prefixString.length == 5
                ? `0${prefixString}`
                : prefixString.length == 6
                  ? `0${prefixString}`
                  : prefixString.length == 7
                    ? `0${prefixString}`
                    : prefixString.length == 8
                      ? `0${prefixString}`
                      : prefixString.length == 9
                        ? `0${prefixString}`
                        : prefixString.length == 10
                          ? `0${prefixString}`
                          : prefixString;

    let newval = employeeControlPanel
      ? uniqueCode + employeeControlPanel?.team?.slice(0, 3) + '#' + templateCreationValue?.tempcode + '_' + postfixLength
      : 'Man' + '#' + (templateCreationValue?.tempcode === '' || templateCreationValue?.tempcode === undefined ? '' : templateCreationValue?.tempcode) + '_' + postfixLength;

    let newvalRefNo = `DP_${postfixLength}`;

    const pdfElement = document.createElement('div');

    pdfElement.innerHTML = checking;
    let findMethod = checking
      ?.replaceAll(
        '$RSEAL$',
        sealPlacement
          ? `<span style="display: inline-block; position: relative; width: 100px; height: 90px;">
         <img src="${sealPlacement}" alt="Seal" style="position: absolute; z-index: -1; width: 100px; height: 90px;" />
       </span>`
          : ''
      )
      .replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`)
      .replaceAll(
        '$FSIGNATURE$',
        signatureContent?.seal === 'For Seal'
          ? `<span style="display: inline-block; vertical-align: top;">
          <span style="color:#53177e; font-weight: bold;">${signatureContent?.topcontent}</span><br/>
          ${signature
            ? `<span style="position: relative; display: inline-block;">
                   <img src="${signature}" alt="Signature" style="position: absolute; z-index: -1; width: 200px; height: 30px;" />
                 </span><br/>`
            : ''
          }
          <span style="color:#53177e; font-weight: bold; display: inline-block; margin-top: 25px;">
            ${signatureContent?.bottomcontent}
          </span>
       </span>`
          : ''
      )
      .replaceAll(
        '$SIGNATURE$',
        signatureContent?.seal === 'None'
          ? `
    <img src="${signature}" alt="Signature" style="position:absolute; z-index:-1; width: 200px; height: 30px;" />
         `
          : ''
      );
    pdfElement.innerHTML = DOMPurify.sanitize(findMethod);
    setPageName(!pageName);
    try {
      let brandCreate = await axios.post(SERVICE.CREATE_DOCUMENT_PREPARATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        date: String(date),
        template: String(documentPrepartion.template),
        documentname: String(documentPrepartion.documentname),
        referenceno: newvalRefNo,
        tempcode: templateCreationValue?.tempcode,
        documentneed: documentPrepartion?.documentneed,
        templateno: newval,
        email: emailUser,
        employeemode: String(documentPrepartion.employeemode),
        issuingauthority: String(documentPrepartion.issuingauthority),
        department: String(documentPrepartion.department),
        pagenumberneed: String(documentPrepartion.pagenumberneed),
        signatureneed: String(documentPrepartion.signatureneed),
        signaturetype: signatureContent?.seal ? signatureContent?.seal : "",
        topcontent: signatureContent?.topcontent ? String(signatureContent?.topcontent) : "",
        bottomcontent: signatureContent.bottomcontent ? String(signatureContent.bottomcontent) : "",
        usersignature: signatureContent.usersignature ? String(signatureContent.usersignature) : "",
        qrcodevalue: String(documentPrepartion.qrcodevalue),
        company: String(documentPrepartion.company),
        branch: String(documentPrepartion.branch),
        unit: String(documentPrepartion.unit),
        team: String(documentPrepartion.team),
        person: documentPrepartion.person === 'Please Select Person' ? '' : documentPrepartion.person,
        proption: String(documentPrepartion.proption),
        employeedoj: "",
        watermark: waterMarkText,
        pageheight: agendaEditStyles.height,
        pagewidth: agendaEditStyles.width,

        // headvalue: headvalue,
        pagesize: pageSizePdf,
        head: documentPrepartion?.documentneed === 'Employee Approval' ? head : '',
        foot: documentPrepartion?.documentneed === 'Employee Approval' ? foot : '',
        qrCodeNeed: qrCodeNeed,
        sign: documentPrepartion.signature,
        sealing: documentPrepartion.seal,
        termsAndConditons: templateCreationValue?.termsAndConditons,
        printingstatus: 'Not-Printed',
        signature: signature,
        seal: sealPlacement,
        qrcode: imageUrl,
        issuedpersondetails: String(isUserRoleAccess.companyname),
        document: findMethod,
        frommailemail: fromEmail,
        marginQuill: String(selectedMargin),
        orientationQuill: String(pageOrientation),
        pagesizeQuill: String(pageSizeQuill),
        mail: 'Send',
        printoptions: 'With Letter Head',
        addedby: [
          {
            name: String(username),
          },
        ],
      });
      //   setTemplateCreation(brandCreate.data);
      await fetchBrandMaster();
      handleCloseInfoImageManual();
      setDocumentPrepartion({
        ...documentPrepartion,
        person: 'Please Select Person',
      });
      setBtnLoad(false);
      handleCloseInfoImage();
      setChecking('');
      setEmployeeControlPanel('');
      setEmployeeValue([]);
      setEmployeeUserName('');
      window.scrollTo(0, 0);
      setPopupContent('Added Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
      setSearchQuery('');
      setBtnLoad(false);
    } catch (err) {
      setBtnLoad(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  let userRoles = isUserRoleAccess?.role?.map((data) => data?.toUpperCase().replace(/[^A-Z0-9]/g, ''));

  //submit option for saving
  const handleSubmit = (e) => {
    e.preventDefault();
    const [first, second, third] = moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')?.split(' ');
    const vasr = `${first}_${second}_${third}`;
    setDateFormat(vasr);
    const isNameMatch = templateCreationArrayCreate?.some((item) => item.template?.toLowerCase() === documentPrepartion.template?.toLowerCase() && item.person === documentPrepartion.person);
    const isNameMatchInside = checkingArray?.some((item) => item.template?.toLowerCase() === documentPrepartion.template?.toLowerCase() && item.empname === documentPrepartion.person);


    if (selectedBranch?.length === 0) {
      setPopupContentMalert('Please Select Template Branch!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion.template === '' || documentPrepartion.template === 'Please Select Template Name') {
      setPopupContentMalert('Please Select Template Name!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion.employeemode === '' || documentPrepartion.employeemode === 'Please Select Employee Mode') {
      setPopupContentMalert('Please Select Employee Mode!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (employeeMode !== 'Manual' && allBranchValue === false && (documentPrepartion.department === '' || documentPrepartion.department === 'Please Select Department')) {
      setPopupContentMalert('Please Select Department!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (departmentCheck === false && (documentPrepartion.company === '' || documentPrepartion.company === 'Please Select Company')) {
      setPopupContentMalert('Please Select Company!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (departmentCheck === false && (documentPrepartion.branch === '' || documentPrepartion.branch === 'Please Select Branch')) {
      setPopupContentMalert('Please Select Branch!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (employeeMode !== 'Manual' && departmentCheck === false && (documentPrepartion.unit === '' || documentPrepartion.unit === 'Please Select Unit')) {
      setPopupContentMalert('Please Select Unit!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (employeeMode !== 'Manual' && departmentCheck === false && (documentPrepartion.team === '' || documentPrepartion.team === 'Please Select Team')) {
      setPopupContentMalert('Please Select Team!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (employeeMode !== 'Manual' && !DocumentNeed && (documentPrepartion.person === '' || documentPrepartion.person === 'Please Select Person')) {
      setPopupContentMalert('Please Select Person!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (employeeMode !== 'Manual' && DocumentNeed && selectedEmployeeValues?.length < 1) {
      setPopupContentMalert('Please Select Person!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    }
    else if (AttendanceNeed && documentPrepartion.attendancesort === 'Please Select Attendance Sort') {
      setPopupContentMalert('Please Select Attendace Sort!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    }
    else if (ProductionNeed && documentPrepartion.productionsort === 'Please Select Production Sort') {
      setPopupContentMalert('Please Select Production Sort!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    }

    else if (AttendanceNeed && documentPrepartion.attendancesort === 'Date' && documentPrepartion?.attendancedate === '') {
      setPopupContentMalert('Please Select Attendance Date!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (AttendanceNeed && documentPrepartion.attendancesort === 'Month' && documentPrepartion?.attendancemonth === 'Please Select Attendance Month') {
      setPopupContentMalert('Please Select Attendance Month!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (AttendanceNeed && documentPrepartion.attendancesort === 'Month' && documentPrepartion?.attendanceyear === 'Please Select Attendance Year') {
      setPopupContentMalert('Please Select Attendance Year!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    }

    else if (ProductionNeed && documentPrepartion.productionsort === 'Please Select Production Sort') {
      setPopupContentMalert('Please Select Production Sort!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (ProductionNeed && documentPrepartion.productionsort === 'Date' && documentPrepartion?.productiondate === '') {
      setPopupContentMalert('Please Select Production Date!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (ProductionNeed && documentPrepartion.productionsort === 'Month' && documentPrepartion?.productionmonth === 'Please Select Production Month') {
      setPopupContentMalert('Please Select Production Month!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (ProductionNeed && documentPrepartion.productionsort === 'Month' && documentPrepartion?.productionyear === 'Please Select Production Year') {
      setPopupContentMalert('Please Select Production Year!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    }
    else if (documentPrepartion.issuingauthority === '' || documentPrepartion.issuingauthority === 'Please Select Issuing Authority') {
      setPopupContentMalert('Please Select Issuing Authority!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (signatureStatus === 'With' && (documentPrepartion.signature === '' || documentPrepartion.signature === 'Please Select Signature')) {
      setPopupContentMalert('Please Select Signature!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (sealStatus !== 'None' && sealStatus !== '' && signatureContent?.seal !== 'None' && (documentPrepartion.seal === '' || documentPrepartion.seal === 'Please Select Seal')) {
      setPopupContentMalert('Please Select Seal!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion?.employeemode !== 'Manual' && isNameMatch) {
      setPopupContentMalert('Document with Person Name and Template already exists!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion?.employeemode !== 'Manual' && isNameMatchInside) {
      setPopupContentMalert('Document with Person Name and Template already exists in Todo!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion?.documentneed === 'Employee Approval' && documentPrepartion?.printoptions === 'Please Select Print Options') {
      setPopupContentMalert('Please Select Print Options!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion?.documentneed === 'Employee Approval' && documentPrepartion?.printoptions === 'With Letter Head' && headvalueAdd?.length === 0) {
      setPopupContentMalert('Please Select Letter Head Options!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else {
      // console.log("Duplicate Cleared")
      setLoadingGeneratingDatas(true);
      if (selectedEmployeeValues?.length > 0) {
        selectedEmployeeValues?.map((data, index) => answerDefine(data, index));
      } else {
        answerDefine();
      }
    }
  };

  //submit option for saving
  const handleSubmited = async (e, index) => {
    e.preventDefault();
    let ans = [];
    const isNameMatch = templateCreationArray?.some((item) => item.template?.toLowerCase() === documentPrepartion.template?.toLowerCase() && item.person === documentPrepartion.person);
    if (selectedBranch?.length === 0) {
      setPopupContentMalert('Please Select Template Branch!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion.template === '' || documentPrepartion.template === 'Please Select Template Name') {
      setPopupContentMalert('Please Select Template Name!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion.employeemode === '' || documentPrepartion.employeemode === 'Please Select Employee Mode') {
      setPopupContentMalert('Please Select Employee Mode!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (allBranchValue === false && (documentPrepartion.department === '' || documentPrepartion.department === 'Please Select Department')) {
      setPopupContentMalert('Please Select Department!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (departmentCheck === false && (documentPrepartion.company === '' || documentPrepartion.company === 'Please Select Company')) {
      setPopupContentMalert('Please Select Company!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (departmentCheck === false && (documentPrepartion.branch === '' || documentPrepartion.branch === 'Please Select Branch')) {
      setPopupContentMalert('Please Select Branch!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (departmentCheck === false && (documentPrepartion.unit === '' || documentPrepartion.unit === 'Please Select Unit')) {
      setPopupContentMalert('Please Select Unit!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (departmentCheck === false && (documentPrepartion.team === '' || documentPrepartion.team === 'Please Select Team')) {
      setPopupContentMalert('Please Select Team!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion.employeemode !== 'Manual' && isNameMatch) {
      setPopupContentMalert('Document with Person Name and Template already exists!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion.employeemode === 'Manual' && checking === '') {
      setPopupContentMalert('Document is Empty!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion.employeemode !== 'Manual' && checkingArray?.length < 1) {
      setPopupContentMalert('Document Todo is Empty!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (!noticePeriodEmpCheck && noticePeriodEmpCheckPerson) {
      setPopupContentMalert('This Employee is not eligibile to receieve any kind of documents!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (generateData) {
      setPopupContentMalert("This Employee's company and branch is not matched with Template control panel data.Add the details in Template control panel!");
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion.employeemode === 'Manual' && checking.match(regex)?.filter((data) => !['$SIGNATURE$', '$FSIGNATURE$', '$EMPLOYEESIGNATURE$', '$RSEAL$']?.includes(data))?.length > 0) {
      setPopupContentMalert('Fill All the Fields Which starts From $ and Ends with $!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      // const batchSize = 2;
      // // setBtnLoad(true);
      // const results = await processInBatches(checkingArray, batchSize);

      // const allFalse = results.every((isMultiPage) => !isMultiPage);
      // if (!allFalse && templateCreationValue?.pagemode === "Single Page") {
      //   setPopupContentMalert(`This Template has a page mode of ${templateCreationValue?.pagemode}, but the provided documents are ${templateCreationValue?.pagemode === "Single Page" ? "more than expected" : "not sufficient"} to print documents.`);
      //   setPopupSeverityMalert("info");
      //   handleClickOpenPopupMalert();
      // } else {
      //   handleClickOpenInfoImage();
      // }

      handleClickOpenInfoImage();
    }
  };

  const generatePDFs = async (e) => {
    e.preventDefault();
    setBtnLoad(true);
    setProgressValue(0);
    setCurrentFile('');
    setProgressOpen(true); // Show the progress popup
    try {
      handleCloseInfoImage();
      const results = [];
      let localProgress = 0;
      const totalFiles = checkingArray?.length ?? 0;
      for (let i = 0; i < totalFiles; i++) {
        const isMultiPage = await downloadPdfTesdtCheckTrue(i);
        results.push(isMultiPage);
        setCurrentFile(`${checkingArray[i]?.documentname} - ${checkingArray[i]?.empname}`);
        localProgress = ((i + 1) / totalFiles) * 100;
        setProgressValue(localProgress);
      }

      const allFalse = results.every((isMultiPage) => !isMultiPage);

      if (!allFalse && templateCreationValue?.pagemode === 'Single Page') {
        setPopupContentMalert(`This Template has a page mode of ${templateCreationValue?.pagemode}, but the provided documents are ${templateCreationValue?.pagemode === 'Single Page' ? 'more than expected' : 'not sufficient'} to print documents.`);
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else {
        sendRequest(e);
      }
    } catch (error) {
      console.error('Error generating PDFs:', error);
    } finally {
      setBtnLoad(false);
      setProgressOpen(false); // Hide the progress popup
    }
  };

  // const generatePDFs = async () => {
  //   setBtnLoad(true);

  //   try {
  //     const results = await Promise.all([downloadPdfTesdtCheckTrue(0)]);
  //     const allFalse = results.every((isMultiPage) => !isMultiPage);

  //     if (!allFalse && templateCreationValue?.pagemode === "Single Page") {
  //       setPopupContentMalert(
  //         `This Template has a page mode of ${templateCreationValue?.pagemode}, but the provided documents are ${templateCreationValue?.pagemode === "Single Page" ? "more than expected" : "not sufficient"
  //         } to print documents.`
  //       );
  //       setPopupSeverityMalert("info");
  //       handleClickOpenPopupMalert();
  //     } else {
  //       handleClickOpenInfoImage();
  //     }
  //   } catch (error) {
  //     console.error("Error generating PDFs:", error);
  //   } finally {
  //     setBtnLoad(false);
  //   }
  // };
  const processInBatches = async (array, batchSize) => {
    let results = [];
    for (let i = 0; i < array.length; i += batchSize) {
      const batch = array.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map((data, index) => downloadPdfTesdtCheckTrue(i + index)));
      results = results.concat(batchResults);
    }
    return results;
  };

  const handleSubmitedManual = (e) => {
    e.preventDefault();
    const isNameMatch = templateCreationArray?.some((item) => item.template?.toLowerCase() === documentPrepartion.template?.toLowerCase() && item.person === documentPrepartion.person);
    if (selectedBranch?.length === 0) {
      setPopupContentMalert('Please Select Template Branch!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion.template === '' || documentPrepartion.template === 'Please Select Template Name') {
      setPopupContentMalert('Please Select Template Name!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion.employeemode === '' || documentPrepartion.employeemode === 'Please Select Employee Mode') {
      setPopupContentMalert('Please Select Employee Mode!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (allBranchValue === false && (documentPrepartion.department === '' || documentPrepartion.department === 'Please Select Department')) {
      setPopupContentMalert('Please Select Department!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (departmentCheck === false && (documentPrepartion.company === '' || documentPrepartion.company === 'Please Select Company')) {
      setPopupContentMalert('Please Select Company!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (departmentCheck === false && (documentPrepartion.branch === '' || documentPrepartion.branch === 'Please Select Branch')) {
      setPopupContentMalert('Please Select Branch!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (employeeMode !== 'Manual' && departmentCheck === false && (documentPrepartion.unit === '' || documentPrepartion.unit === 'Please Select Unit')) {
      setPopupContentMalert('Please Select Unit!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (employeeMode !== 'Manual' && departmentCheck === false && (documentPrepartion.team === '' || documentPrepartion.team === 'Please Select Team')) {
      setPopupContentMalert('Please Select Team!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion.employeemode !== 'Manual' && isNameMatch) {
      setPopupContentMalert('Document with Person Name and Template already exists!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (checking === '') {
      setPopupContentMalert('Document is Empty!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (!noticePeriodEmpCheck && noticePeriodEmpCheckPerson) {
      setPopupContentMalert('This Employee is not eligibile to receieve any kind of documents!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (generateData) {
      setPopupContentMalert("This Employee's company and branch is not matched with Template control panel data.Add the details in Template control panel!");
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (documentPrepartion.employeemode === 'Manual' && checking.match(regex)?.filter((data) => !['$SIGNATURE$', '$FSIGNATURE$', '$RSEAL$', '$EMPLOYEESIGNATURE$']?.includes(data))?.length > 0) {
      setPopupContentMalert('Fill All the Fields Which starts From $ and Ends with $');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      setBtnLoad(true);
      downloadPdfTesdtCheckTrueManual()
        .then((isMultiPage) => {
          setBtnLoad(true);

          if (isMultiPage && templateCreationValue?.pagemode === 'Single Page') {
            setButtonLoading(false);
            setPopupContentMalert(`This Template has  page mode of ${templateCreationValue?.pagemode} but provided is
              ${templateCreationValue?.pagemode === 'Single Page' ? 'more than expected' : 'not sufficient'}  to print documents`);
            setPopupSeverityMalert('info');
            handleClickOpenPopupMalert();
          } else {
            setBtnLoad(false);
            handleClickOpenInfoImageManual();
          }
        })
        .catch((error) => {
          console.error('Error generating PDF:', error);
        });
    }
  };
  const regex = /\$[A-Z]+\$/g;

  const handleclearDepartment = (e) => {
    e.preventDefault();
    setGenerateData(false);
    setDocumentPrepartion({
      ...documentPrepartion,
      department: 'Please Select Department',
      company: 'Please Select Company',
      branch: 'Please Select Branch',
      unit: 'Please Select Unit',
      team: 'Please Select Team',
      person: 'Please Select Person',
      pagenumberneed: 'All Pages',
      signatureneed: 'No Need',
      qrcodevalue: 'All Pages',
      issuingauthority: 'Please Select Issuing Authority',
      attendancesort: 'Please Select Attendance Sort',
      productionsort: 'Please Select Production Sort',
      salarysort: 'Please Select Salary Sort',
      attendancedate: '',
      productiondate: '',
      attendancemonth: 'Please Select Attendance Month',
      productionmonth: 'Please Select Production Month',
      attendanceyear: 'Please Select Attendance Year',
      productionyear: 'Please Select Production Year',
      proption: 'Please Select Print Option',
      pagesize: 'Please Select pagesize',
      print: 'Please Select Print Option',
      heading: 'Please Select Header Option',
      signature: 'Please Select Signature',
      seal: 'Please Select Seal',
    });
    setCheckingArray([]);
    setSelectedEmployeeValues([]);
    setSelectedEmployee([]);
    setIndexViewQuest(1);
    setBranchOptions([]);
    setUnitOptions([]);
    setTeamOptions([]);
    setEmployeenames([]);
    setDepartmentCheck(false);
    setAllBranchValue(false);
    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
  };

  const handlecleared = (e) => {
    e.preventDefault();
    setGenerateData(false);
    setCheckingArray([]);
    setIndexViewQuest(1);
    setSelectedBranch([])
    setSelectedBranchValues([])
    setDocumentPrepartion({
      date: '',
      documentname: '',
      template: 'Please Select Template Name',
      referenceno: '',
      templateno: '',
      pagenumberneed: 'All Pages',
      signatureneed: 'No Need',
      qrcodevalue: 'All Pages',
      employeemode: 'Please Select Employee Mode',
      reason: 'Document',
      department: 'Please Select Department',
      company: 'Please Select Company',
      branch: 'Please Select Branch',
      unit: 'Please Select Unit',
      team: 'Please Select Team',
      manualdate: formattedDate,
      person: 'Please Select Person',
      proption: 'Please Select Print Option',
      printoptions: 'Please Select Print Options',
      issuingauthority: 'Please Select Issuing Authority',
      attendancesort: 'Please Select Attendance Sort',
      productionsort: 'Please Select Production Sort',
      salarysort: 'Please Select Salary Sort',
      attendancedate: '',
      productiondate: '',
      attendancemonth: 'Please Select Attendance Month',
      productionmonth: 'Please Select Production Month',
      attendanceyear: 'Please Select Attendance Year',
      productionyear: 'Please Select Production Year',
      signature: 'Please Select Signature',
      seal: 'Please Select Seal',
      pagesize: 'Please Select pagesize',
      print: 'Please Select Print Option',
      heading: 'Please Select Header Option',
      issuedpersondetails: '',
      documentneed: 'Print Document',
    });
    setDocumentNeed(false);
    setAttendanceNeed(false)
    setProductionNeed(false)
    setSalaryNeed(false)
    setCheckingArray([]);
    setSelectedEmployeeValues([]);
    setSelectedEmployee([]);
    setIndexViewQuest(1);
    // setHeadValue([])
    setSelectedHeadOpt([]);
    // setHeader("")
    // setfooter("")
    setSealStatus('');
    setSignatureStatus('');
    setCompanyName('');
    setIssuingAutholrity([]);
    setDepartmentCheck(false);
    setAllBranchValue(false);
    setButtonLoading(false);
    setBtnLoad(false);
    setBranchOptions([]);
    setUnitOptions([]);
    setTeamOptions([]);
    setEmployeenames([]);
    setChecking('');
    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
  };

  const handleclearedManual = (e) => {
    e.preventDefault();
    setGenerateData(false);
    setSelectedBranch([])
    setSelectedBranchValues([])
    setDocumentPrepartion({
      date: '',
      documentname: '',
      template: 'Please Select Template Name',
      referenceno: '',
      templateno: '',
      pagenumberneed: 'All Pages',
      signatureneed: 'No Need',
      qrcodevalue: 'All Pages',
      employeemode: 'Please Select Employee Mode',
      department: 'Please Select Department',
      company: 'Please Select Company',
      branch: 'Please Select Branch',
      unit: 'Please Select Unit',
      team: 'Please Select Team',
      person: 'Please Select Person',
      proption: 'Please Select Print Option',
      issuingauthority: 'Please Select Issuing Authority',
      sort: 'Please Select Sort',
      datechoosen: '',
      monthchoosen: 'Please Select Month',
      yearchoosen: 'Please Select Year',
      signature: 'Please Select Signature',
      seal: 'Please Select Seal',
      pagesize: 'Please Select pagesize',
      print: 'Please Select Print Option',
      heading: 'Please Select Header Option',
      issuedpersondetails: '',
    });
    // setHeadValue([])
    setSelectedHeadOpt([]);
    // setHeader("")
    setCheckingArray([]);
    setSelectedEmployeeValues([]);
    setSelectedEmployee([]);
    setIndexViewQuest(1);
    // setfooter("")
    setSealStatus('');
    setSignatureStatus('');
    setCompanyName('');
    setIssuingAutholrity([]);
    setDepartmentCheck(false);
    setAllBranchValue(false);
    setButtonLoading(false);
    setBtnLoad(false);
    setBranchOptions([]);
    setUnitOptions([]);
    setTeamOptions([]);
    setEmployeenames([]);
    setChecking('');
    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
  };

  //get all brand master name.
  const fetchBrandMaster = async () => {
    const accessbranchs = accessbranch
      ? accessbranch.map((data) => ({
        branch: data.branch,
        company: data.company,
        unit: data.unit,
      }))
      : [];

    setPageName(!pageName);
    try {
      let res_freq = await axios.post(
        `${SERVICE.ACCESIBLEBRANCHALL_DOCUMENTPREPARATION}`,
        {
          assignbranch: accessbranchs,
          printed: 'Not-Printed',
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setLoader(true);
      const answer =
        res_freq?.data?.documentPreparation?.length > 0
          ? res_freq?.data?.documentPreparation
            ?.filter((data) => data?.printingstatus === 'Not-Printed')
            ?.map((item, index) => ({
              ...item,
              // ...item,
              serialNumber: index + 1,
              id: item?._id,
              approval: item?.approval === 'sentforapproval' ? 'Sent to Approval' : item?.approval === 'approved' ? 'Approved' : 'Not yet sent',
              department: item?.department === 'Please Select Department' ? '' : item?.department,
              date: moment(item.date).format('DD-MM-YYYY'),
              daystatus: item.attendanceautostatus ? item.attendanceautostatus : item.weekoffpresentstatus ? 'WEEKOFF PRESENT' : getattendancestatus(item),
            }))
          : [];
      setTemplateCreationArrayCreate(answer);
      setTemplateCreationArray(res_freq?.data?.overalldocuments);
      setChanged('ChangedStatus');
      setLoader(false);
    } catch (err) {
      setLoader(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const fetchBrandMasterOverall = async () => {
    const accessbranchs = accessbranch
      ? accessbranch.map((data) => ({
        branch: data.branch,
        company: data.company,
        unit: data.unit,
      }))
      : [];

    setPageName(!pageName);
    try {
      let res_freq = await axios.post(
        `${SERVICE.ACCESIBLEBRANCHALL_DOCUMENTPREPARATION_OVERALL}`,
        {
          assignbranch: accessbranchs,
          printed: 'Not-Printed',
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      const answer =
        res_freq?.data?.overalldocuments?.length > 0
          ? res_freq?.data?.overalldocuments
            ?.filter((data) => data?.printingstatus === 'Not-Printed')
            ?.map((item, index) => ({
              ...item,
              // ...item,
              serialNumber: index + 1,
              id: item?._id,
              approval: item?.approval === 'sentforapproval' ? 'Sent to Approval' : item?.approval === 'approved' ? 'Approved' : 'Not yet sent',
              department: item?.department === 'Please Select Department' ? '' : item?.department,
              date: moment(item.date).format('DD-MM-YYYY'),
              daystatus: item.attendanceautostatus ? item.attendanceautostatus : item.weekoffpresentstatus ? 'WEEKOFF PRESENT' : getattendancestatus(item),
            }))
          : [];
      setTemplateCreationArray(answer);
      setChanged('ChangedStatus');
      setLoader(false);
    } catch (err) {
      setLoader(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  // console.log(checkingArray, 'jnsjnjs')
  useEffect(() => {
    // TemplateDropdowns();
    DepartDropDowns();
    CompanyDropDowns();
    fetchBrandMaster();
  }, []);
  useEffect(() => {
    fetchBrandMaster();
  }, [Changed]);

  const delAreagrpcheckbox = async () => {
    setPageName(!pageName);
    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${item}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
      });
      // Wait for all delete requests to complete
      await Promise.all(deletePromises);
      setIsHandleChange(false);
      handleCloseModcheckbox();
      setSelectedRows([]);
      setSelectAllChecked(false);
      setPage(1);
      await fetchBrandMaster();
      setPopupContent('Deleted Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setIsEditOpen(false);
    setAgendaEdit('');
    setUpdateGen(true);
  };

  const getViewFile = async (id) => {
    let response = await axios.get(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${id}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });
    const fileUrl = `${BASE_URL}/uploadsDocuments/${response?.data?.sdocumentPreparation.approvedfilename}`;
    window.open(fileUrl, '_blank');
  };
  const getUpdatePrintingStatus = async (e, update) => {
    setPageName(!pageName);
    try {
      let response = await axios.post(SERVICE.FILTER_DOCUMENT_USER_LOGIN, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        person: isUserRoleAccess.companyname,
      });
      if (response?.data?.user) {
        let res = await axios.put(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${e}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          printingstatus: 'Printed',
          $inc: { printedcount: 1 },
          updatedby: update
            ? [
              ...update,
              {
                name: isUserRoleAccess.companyname,
                date: new Date(serverTime),
              },
            ]
            : [],
        });
        // await fetchBrandMaster();
        setChanged(e);
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const fetchEmailForUser = async (e, emailformat, fromemail, ccemail, bccemail) => {
    setLoading(true);
    if (headerOptions === 'Please Select Print Options') {
      setButtonLoadingPreview(false);
      setPopupContentMalert('Please Select Print Options!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (headerOptions === 'With Letter Head' && selectedHeadOpt?.length < 1) {
      setPopupContentMalert('Please Select With Letter Head!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      setLoadingMessage('Document is preparing...');

      let response = await axios.get(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      handleClickCloseLetterHead();
      const tempElementEmail = document?.createElement('div');
      tempElementEmail.innerHTML = emailformat;
      let textedEmail = tempElementEmail.innerHTML;
      let findMethodEmail = textedEmail
        .replaceAll('$TEMPLATENAME$', response.data.sdocumentPreparation?.template ? response.data.sdocumentPreparation?.template : '')
        .replaceAll('$REFERENCEID$', response.data.sdocumentPreparation?.templateno ? response.data.sdocumentPreparation?.templateno : '')
        .replaceAll('$CANDIDATENAME$', response.data.sdocumentPreparation?.person ? response.data.sdocumentPreparation?.person : '')
        .replaceAll('$COMPANYNAME$', isUserRoleAccess?.companyname ? isUserRoleAccess?.companyname : '')
        .replaceAll('$DESIGNATION$', isUserRoleAccess?.designation ? isUserRoleAccess?.designation : '')
        .replaceAll('$COMPANY$', isUserRoleAccess?.company ? isUserRoleAccess?.company : '');

      const pdfElement = document.createElement('div');
      pdfElement.innerHTML = response.data.sdocumentPreparation.document.replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`);

      const styleElement = document.createElement('style');
      styleElement.textContent = `
           .ql-indent-1 { margin-left: 75px; } /* Adjust margin for indent-1 class */
           .ql-indent-2 { margin-left: 150px; } /* Adjust margin for indent-2 class */
           .ql-indent-3 { margin-left: 225px; } /* Adjust margin for indent-3 class */
           .ql-indent-4 { margin-left: 275px; } /* Adjust margin for indent-4 class */
           .ql-indent-5 { margin-left: 325px; } /* Adjust margin for indent-5 class */
           .ql-indent-6 { margin-left: 375px; } /* Adjust margin for indent-6 class */
           .ql-indent-7 { margin-left: 425px; } /* Adjust margin for indent-7 class */
           .ql-indent-8 { margin-left: 475px; } /* Adjust margin for indent-8 class */
           .ql-align-right { text-align: right; } 
           .ql-align-left { text-align: left; } 
           .ql-align-center { text-align: center; } 
           .ql-align-justify { text-align: justify; } 
                             .page-break-label {
    page-break-before: always;
    break-before: page;
    margin: 20px 0;
  }
         `;
      pdfElement.appendChild(styleElement);

      // pdfElement.appendChild(styleElement);
      const addPageNumbersAndHeadersFooters = (doc, watermarkImage, qrCodeImage) => {
        const totalPages = doc.internal.getNumberOfPages();
        const margin = 15; // Adjust as needed
        const footerHeight = 15; // Adjust as needed
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.innerHTML = pdfElement;
        document.body.appendChild(tempDiv);
        const rect = tempDiv.getBoundingClientRect();
        const reservedSealHeight = 45;
        const actualContentHeight = rect.height * (25.4 / 96);
        const pageHeight = doc.internal.pageSize.getHeight();
        // Total usable height for content
        const usableContentHeight = pageHeight - footerHeight - margin - reservedSealHeight;
        const contentEndY = Math.min(actualContentHeight, usableContentHeight);

        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const contentEndY = pageHeight - footerHeight - margin - 20; // leave gap above footer

          // Add header
          doc.setFontSize(12);
          // doc.text(convertToNumberedList(head), pageWidth / 2, 10, { align: 'center' });
          const headerImgWidth = pageWidth * 0.95; // Adjust as needed
          const headerImgHeight = pageHeight * 0.09; // Adjust as needed
          //const headerX = (pageWidth - headerImgWidth) / 2;
          // const headerY = 6; // Adjust as needed for header position
          const headerX = 5; // Start from the left
          const headerY = 3.5; // Start from the top
          if (head !== '') {
            doc.addImage(head, 'JPEG', headerX, headerY, headerImgWidth, headerImgHeight, '', 'FAST', 0.1);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(headerX, headerY, headerImgWidth, headerImgHeight, 'F'); // "F" = filled rectangle
          }
          const imgWidth = pageWidth * 0.5; // 75% of page width
          const imgHeight = pageHeight * 0.25; // 50% of page height
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2 - 20;
          doc.setFillColor(0, 0, 0, 0.1);
          doc.addImage(watermarkImage, 'PNG', x, y, imgWidth, imgHeight, '', 'FAST', 0.01);
          // Add footer
          doc.setFontSize(10);
          // doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
          // Add footer image stretched to page width
          const footerImgWidth = pageWidth * 0.95; // Stretch to full page width
          const footerImgHeight = pageHeight * 0.067; // Adjust height as needed
          const footerX = 5; // Start from the left
          const footerY = pageHeight - footerImgHeight - 5;
          if (foot !== "") {
            doc.addImage(foot, 'JPEG', footerX, footerY, footerImgWidth, footerImgHeight, '', 'FAST', 0.1);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(footerX, footerY, footerImgWidth, footerImgHeight, 'F');
          }


          // ---------- SIGNATURE & SEAL ----------
          // if (response?.data?.sdocumentPreparation?.signatureneed) {
          const signatureNeed = response?.data?.sdocumentPreparation?.signatureneed; // "All Pages" or "End Page"

          if (signatureNeed === "All Pages" || (signatureNeed === "End Page" && i === totalPages)) {
            // Decide Y position right after content but above footer
            const imageY = contentEndY;

            // Seal on left
            if (response?.data?.sdocumentPreparation?.signature || response?.data?.sdocumentPreparation?.seal || response?.data?.sdocumentPreparation?.usersignature) {
              const pageWidth = doc.internal.pageSize.getWidth();
              const pageHeight = doc.internal.pageSize.getHeight();
              const margin = 15;
              const footerGap = 20; // space to keep above footer

              // --- Unified Row Position ---
              const rowYOffset = 10; // ✅ Move row slightly lower
              const sigWidth = 40;    // reduced from 53
              const sigHeight = 6;    // reduced from 8

              const sealWidth = 17;   // reduced from 25/35
              const sealHeight = 17;  // reduced from 25/35
              const sealUpShift = 8;
              // ✅ Make user signature a bit wider but slightly shorter
              const userSigWidth = 47;  // increased width
              const userSigHeight = 20; // reduced height
              const userSigUpShift = 11;
              let yPos;

              if (i === totalPages) {
                // ✅ Use available space from bottom instead of rect.height
                yPos = response?.data?.sdocumentPreparation?.qrCodeNeed ? (pageHeight - footerGap - userSigHeight - 30) : (pageHeight - footerGap - userSigHeight); // stays near bottom
              } else {
                yPos = contentEndY + rowYOffset;
              }

              const topTextHeight = 6;
              const bottomTextHeight = 6;

              // --- Left: Main Signature ---
              let leftX = margin;
              if (response?.data?.sdocumentPreparation?.signature) {
                if (response?.data?.sdocumentPreparation?.signaturetype === "For Seal" && response?.data?.sdocumentPreparation?.topcontent) {
                  doc.setFontSize(8);
                  doc.setFont(undefined, "bold");
                  doc.setTextColor(83, 23, 126);
                  doc.text(response?.data?.sdocumentPreparation.topcontent, leftX, yPos - topTextHeight);
                  doc.setTextColor(0, 0, 0);
                }

                doc.addImage(response?.data?.sdocumentPreparation.signature, "PNG", leftX, yPos, sigWidth, sigHeight);

                if (response?.data?.sdocumentPreparation?.signaturetype === "For Seal" && response?.data?.sdocumentPreparation?.bottomcontent) {
                  doc.setFontSize(8);
                  doc.setFont(undefined, "bold");
                  doc.setTextColor(83, 23, 126);
                  doc.text(
                    response?.data?.sdocumentPreparation.bottomcontent,
                    leftX,
                    yPos + sigHeight + bottomTextHeight
                  );
                  doc.setTextColor(0, 0, 0);
                }
              }

              // --- Center: Seal (align with same yPos) ---
              const centerX = (pageWidth / 2) - (sealWidth / 2);
              if (response?.data?.sdocumentPreparation?.seal) {
                doc.addImage(response?.data?.sdocumentPreparation.seal, "PNG", centerX, yPos - sealUpShift, sealWidth, sealHeight);
              }

              // --- Right: Employee Signature (aligned with row, adjusted size) ---
              let rightX = pageWidth - userSigWidth - margin - 10;
              if (response?.data?.sdocumentPreparation?.usersignature) {
                doc.addImage(
                  response?.data?.sdocumentPreparation.usersignature,
                  "PNG",
                  rightX,
                  yPos - userSigUpShift, // ✅ Same yPos as others (aligned row)
                  userSigWidth,
                  userSigHeight
                );
              }
            }
          }
          // }

          if (response?.data?.sdocumentPreparation?.pagenumberneed === 'All Pages') {
            const textY = footerY - 3;
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, textY, { align: 'center' });
          } else if (response?.data?.sdocumentPreparation?.pagenumberneed === 'End Page' && i === totalPages) {
            const textY = footerY - 3;
            doc.text(`End of the document`, pageWidth / 2, textY, { align: 'center' });
          }
          // Add QR code and statement only on the last page

          if (response?.data?.sdocumentPreparation?.qrCodeNeed && response?.data?.sdocumentPreparation?.qrcodevalue === "End Page") {
            if (i === totalPages) {
              // Add QR code in the left corner
              const qrCodeWidth = 25; // Adjust as needed
              const qrCodeHeight = 25; // Adjust as needed
              const qrCodeX = footerX; // Left corner
              const qrCodeY = footerY - qrCodeHeight - 4; // 15 units above the footer image
              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);



              const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                '1. Scan to verify the authenticity of this document.',
                `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                `3. For questions, contact us at ${fromEmail}.`
              ];

              // starting position
              const statementX = qrCodeX + qrCodeWidth + 10;
              const statementY1 = qrCodeY + 10;
              const lineGap = 5; // vertical spacing between statements

              doc.setFontSize(12);

              statements.forEach((text, idx) => {
                const y = statementY1 + (idx * lineGap);
                doc.text(text, statementX, y);
              });

            }
          }
          if (response?.data?.sdocumentPreparation?.qrCodeNeed && response?.data?.sdocumentPreparation?.qrcodevalue === "All Pages") {
            if (i === totalPages) {
              // Add QR code in the left corner
              const qrCodeWidth = 25; // Adjust as needed
              const qrCodeHeight = 25; // Adjust as needed
              const qrCodeX = footerX; // Left corner
              const qrCodeY = footerY - qrCodeHeight - 4; // 15 units above the footer image
              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);



              const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                '1. Scan to verify the authenticity of this document.',
                `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                `3. For questions, contact us at ${fromEmail}.`
              ];

              // starting position
              const statementX = qrCodeX + qrCodeWidth + 10;
              const statementY1 = qrCodeY + 10;
              const lineGap = 5; // vertical spacing between statements

              doc.setFontSize(12);

              statements.forEach((text, idx) => {
                const y = statementY1 + (idx * lineGap);
                doc.text(text, statementX, y);
              });

            }
            else {
              // ✅ for all other pages → add page number + small QR code on the right
              const textY = footerY - 3;
              // small QR code next to it (bottom-right corner)
              const qrCodeWidth = 15;   // smaller size
              const qrCodeHeight = 15;
              const qrCodeX = pageWidth - qrCodeWidth - 15; // margin from right
              const qrCodeY = footerY - qrCodeHeight - 3;   // align with page text

              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
            }
          }
        }
      };

      return new Promise((resolve, reject) => {
        const hasHeaderImage = head !== ''; // assuming head is a base64 src or image URL
        const hasFooterImage = foot !== '';

        const adjustedMargin = getAdjustedMargin(response.data.sdocumentPreparation?.marginQuill, hasHeaderImage, hasFooterImage);
        const pdfDimensions = getPageDimensionsTable(response.data.sdocumentPreparation?.pagesizeQuill, response.data.sdocumentPreparation?.orientationQuill); // as before

        html2pdf()
          .from(pdfElement)
          .set({
            margin: adjustedMargin,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: {
              unit: 'mm',
              format: pdfDimensions,
              orientation: response.data.sdocumentPreparation?.orientationQuill,
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
          })
          .toPdf()
          .get('pdf')
          .then(async (pdf) => {
            const img = new Image();
            img.src = response.data.sdocumentPreparation?.watermark;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.globalAlpha = 0.1;
              ctx.drawImage(img, 0, 0);
              const watermarkImage = canvas.toDataURL('image/png');

              const qrImg = new Image();
              qrImg.src = response.data.sdocumentPreparation?.qrcode;
              qrImg.onload = () => {
                const qrCanvas = document.createElement('canvas');
                qrCanvas.width = qrImg.width;
                qrCanvas.height = qrImg.height;
                const qrCtx = qrCanvas.getContext('2d');
                qrCtx.drawImage(qrImg, 0, 0);
                const qrCodeImage = qrCanvas.toDataURL('image/png');

                addPageNumbersAndHeadersFooters(pdf, watermarkImage, qrCodeImage);

                // Convert the PDF to a Blob
                const pdfBlob = pdf.output('blob');

                // Create FormData and append the PDF Blob
                const formData = new FormData();
                formData.append('file', pdfBlob, `${response.data.sdocumentPreparation?.template}_${response.data.sdocumentPreparation?.person}.pdf`);

                // Convert Blob to base64 string
                const reader = new FileReader();
                reader.readAsDataURL(pdfBlob);
                reader.onloadend = async () => {
                  setLoadingMessage('Document is converting to Email format...');
                  const base64String = reader.result.split(',')[1]; // Extract base64 string without data:image/jpeg;base64,

                  let res_module = await axios.post(
                    SERVICE.DOCUMENT_PREPARATION_MAIL,
                    {
                      document: base64String,
                      companyname: response?.data?.sdocumentPreparation?.person,
                      letter: response?.data?.sdocumentPreparation?.template,
                      email: response?.data?.sdocumentPreparation?.email,
                      emailformat: findMethodEmail,
                      fromemail: fromemail,
                      ccemail: ccemail,
                      bccemail: bccemail,
                      tempid: response?.data?.sdocumentPreparation?.templateno,
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${auth.APIToken}`,
                      },
                    }
                  );
                  setLoadingMessage('Email is Sending...');
                  if (res_module.status === 200) {
                    setLoading(false);
                    NotificationManager.success('Email Sent Successfully 👍', '', 2000);
                  } else {
                    setLoading(false);
                  }

                  resolve(base64String);
                };
              };
            };
            if (response?.data?.sdocumentPreparation?.mail === 'Send') {
              let res = await axios.put(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${e}`, {
                headers: {
                  Authorization: `Bearer ${auth.APIToken}`,
                },
                mail: 'Re-send',
              });
              await fetchBrandMaster();
            }
          })
          .catch((err) => {
            setLoading(false);
            reject(err);
          });
      });
    }
  };

  // get single row to view....
  const getviewCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDocumentPreparationEdit(res?.data?.sdocumentPreparation);
      const ticket = res?.data?.sdocumentPreparation || {};
      setSelectedMarginEdit(ticket.marginQuill || 'normal');
      setPageSizeQuillEdit(ticket.pagesizeQuill || 'A4');
      setPageOrientationEdit(ticket.orientationQuill || 'portrait');

      handleClickOpenview();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //get single row to view....
  const getinfoCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      handleClickOpeninfo();
      setDocumentPreparationEdit(res?.data?.sdocumentPreparation);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //frequency master name updateby edit page...
  let updateby = documentPreparationEdit?.updatedby;
  let addedby = documentPreparationEdit?.addedby;
  let frequencyId = documentPreparationEdit?._id;

  //image
  const gridRefTableImg = useRef(null);
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage
        .toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, 'Employee Document Preparation.png');
        })
        .catch((error) => {
          console.error('dom-to-image error: ', error);
        });
    }
  };

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'EmployeeDocumentPreparation',
    pageStyle: 'print',
  });

  //serial no for listing items
  const addSerialNumber = (data) => {
    setItems(data);
  };
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
    setPage(1);
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
  const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
    <div>
      <Checkbox checked={selectAllChecked} onChange={onSelectAll} />
    </div>
  );

  const handleOnChangeAllotDetails = (id, value) => {
    const answer = items?.map((data) => {
      if (data?.id === id) {
        data.printoptions = value;
        return data;
      }
      return data;
    });
    setItems(answer);
  };
  const getCode = async (e, pagename) => {
    setPageName(!pageName);
    const NewDatetime = await getCurrentServerTime();

    try {
      let res = await axios.post(SERVICE.FILTERTEMPLATECONTROLPANEL, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: e?.company,
        branch: e?.branch,
      });
      if (res?.data?.templatecontrolpanel) {
        const ans = res?.data?.templatecontrolpanel ? res?.data?.templatecontrolpanel?.templatecontrolpanellog[res?.data?.templatecontrolpanel?.templatecontrolpanellog?.length - 1] : '';
        setPersonId(ans);
        handleClickOpenLetterHeader(pagename);
        setDataTableId(e?.id);
        const qrInfoDetails = ans?.qrInfo?.length > 0 ? ans?.qrInfo : []
        setQrCodeInfoDetails(qrInfoDetails?.map((data, index) => `${index + 1}. ${data?.details?.replaceAll('$C:TIME$', new Date(NewDatetime).toLocaleTimeString())
          .replaceAll('$C:DATE$', date).replaceAll('$DOJ', e ? e?.doj : "")}`))
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
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
      //lockPinned: true,
    },
    {
      field: 'serialNumber',
      headerName: 'SNo',
      flex: 0,
      width: 100,
      hide: !columnVisibility.serialNumber,
      headerClassName: 'bold-header',
      pinned: 'left',
      //lockPinned: true,
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 0,
      width: 150,
      hide: !columnVisibility.date,
      headerClassName: 'bold-header',
    },
    {
      field: 'referenceno',
      headerName: 'Reference No',
      flex: 0,
      width: 150,
      hide: !columnVisibility.referenceno,
      headerClassName: 'bold-header',
    },
    {
      field: 'templateno',
      headerName: 'Template No',
      flex: 0,
      width: 150,
      hide: !columnVisibility.templateno,
      headerClassName: 'bold-header',
    },
    {
      field: 'template',
      headerName: 'Template',
      flex: 0,
      width: 150,
      hide: !columnVisibility.template,
      headerClassName: 'bold-header',
    },
    {
      field: 'employeemode',
      headerName: 'Employee Mode',
      flex: 0,
      width: 150,
      hide: !columnVisibility.employeemode,
      headerClassName: 'bold-header',
    },
    {
      field: 'department',
      headerName: 'Department',
      flex: 0,
      width: 150,
      hide: !columnVisibility.department,
      headerClassName: 'bold-header',
    },
    {
      field: 'company',
      headerName: 'Company',
      flex: 0,
      width: 150,
      hide: !columnVisibility.company,
      headerClassName: 'bold-header',
    },
    {
      field: 'branch',
      headerName: 'Branch',
      flex: 0,
      width: 150,
      hide: !columnVisibility.branch,
      headerClassName: 'bold-header',
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
      field: 'person',
      headerName: 'Person',
      flex: 0,
      width: 150,
      hide: !columnVisibility.person,
      headerClassName: 'bold-header',
    },
    {
      field: 'document',
      headerName: 'Documents',
      flex: 0,
      width: 250,
      minHeight: '40px',
      hide: !columnVisibility.document,
      cellRenderer: (params) => (
        <Grid>
          {/* {params.data?.approval === "Approved" && */}
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              getCode(params?.data, 'Table View');
            }}
          >
            View
          </Button>
          &ensp;
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#FF9800',
              color: 'white',
              '&:hover': {
                backgroundColor: '#E68900',
              },
            }}
            onClick={() => {
              getCode(params?.data, 'Table Print');
            }}
          >
            Print
          </Button>
        </Grid>
      ),
    },
    {
      field: 'printingstatus',
      headerName: 'Printing Status',
      flex: 0,
      width: 150,
      minHeight: '40px',
      hide: !columnVisibility.printingstatus,
    },
    // {
    //   field: "approval",
    //   headerName: "Approval Status",
    //   flex: 0,
    //   width: 250,
    //   minHeight: "40px",
    //   hide: !columnVisibility.approval,
    //   cellRenderer: (params) => (
    //     <Grid>
    //       <Typography
    //         color={params?.data?.approval === "Sent to Approval" ? "#009688" : params?.data?.approval === "Approved" ? "#4caf50" : "#c62828"}
    //         marginTop={1.5}>
    //         {params?.data?.approval}
    //       </Typography>
    //     </Grid>
    //   ),
    // },

    {
      field: 'email',
      headerName: 'Email',
      flex: 0,
      width: 150,
      minHeight: '40px',
      hide: !columnVisibility.email,
      cellRenderer: (params) => (
        <Grid>
          {isUserRoleCompare?.includes('menuemployeedocumentpreparationmail') && (
            <Button
              variant="contained"
              sx={{
                backgroundColor: params?.data?.mail === 'Send' ? '#4CAF50' : '#F44336', // Green for "Send", Red otherwise
                color: 'white',
                '&:hover': {
                  backgroundColor: params?.data?.mail === 'Send' ? '#45A049' : '#D32F2F',
                },
              }}
              onClick={() => {
                extractEmailFormat(params.data.person, params.data.id);
              }}
            >
              {params?.data?.mail}
            </Button>
          )}
        </Grid>
      ),
    },
    {
      field: 'issuedpersondetails',
      headerName: 'Issued Person Details',
      flex: 0,
      width: 150,
      hide: !columnVisibility.issuedpersondetails,
      headerClassName: 'bold-header',
    },
    {
      field: 'issuingauthority',
      headerName: 'Issuing Authority',
      flex: 0,
      width: 150,
      hide: !columnVisibility.issuingauthority,
      headerClassName: 'bold-header',
    },
    {
      field: 'actions',
      headerName: 'Action',
      flex: 0,
      width: 300,
      minHeight: '40px !important',
      sortable: false,
      hide: !columnVisibility.actions,
      headerClassName: 'bold-header',
      cellRenderer: (params) => (
        <Grid sx={{ display: 'flex' }}>
          {isUserRoleCompare?.includes('demployeedocumentpreparation') && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.data.id, params.data.name);
              }}
            >
              <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} style={{ fontsize: 'large' }} />
            </Button>
          )}
          {isUserRoleCompare?.includes('vemployeedocumentpreparation') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getviewCode(params.data.id);
              }}
            >
              <VisibilityOutlinedIcon sx={buttonStyles.buttonview} style={{ fontsize: 'large' }} />
            </Button>
          )}
          {isUserRoleCompare?.includes('iemployeedocumentpreparation') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getinfoCode(params.data.id);
              }}
            >
              <InfoOutlinedIcon sx={buttonStyles.buttoninfo} style={{ fontsize: 'large' }} />
            </Button>
          )}
        </Grid>
      ),
    },
  ];

  const downloadPdfTesdtTable = async (e) => {
    if (headerOptions === 'Please Select Print Options') {
      setButtonLoadingPreview(false);
      setPopupContentMalert('Please Select Print Options!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (headerOptions === 'With Letter Head' && selectedHeadOpt?.length < 1) {
      setPopupContentMalert('Please Select With Letter Head!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      // Create a new div element to hold the Quill content
      let response = await axios.get(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      await getUpdatePrintingStatus(response.data.sdocumentPreparation?._id, response.data.sdocumentPreparation?.updatedby);
      const pdfElement = document.createElement('div');
      pdfElement.innerHTML = response.data.sdocumentPreparation.document.replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`);
      // Add custom styles to the PDF content
      const styleElement = document.createElement('style');
      styleElement.textContent = `
     .ql-indent-1 { margin-left: 75px; } /* Adjust margin for indent-1 class */
     .ql-indent-2 { margin-left: 150px; } /* Adjust margin for indent-2 class */
     .ql-indent-3 { margin-left: 225px; } /* Adjust margin for indent-3 class */
     .ql-indent-4 { margin-left: 275px; } /* Adjust margin for indent-4 class */
     .ql-indent-5 { margin-left: 325px; } /* Adjust margin for indent-5 class */
     .ql-indent-6 { margin-left: 375px; } /* Adjust margin for indent-6 class */
     .ql-indent-7 { margin-left: 425px; } /* Adjust margin for indent-7 class */
     .ql-indent-8 { margin-left: 475px; } /* Adjust margin for indent-8 class */
     .ql-align-right { text-align: right; } 
     .ql-align-left { text-align: left; } 
     .ql-align-center { text-align: center; } 
     .ql-align-justify { text-align: justify; } 
                       .page-break-label {
    page-break-before: always;
    break-before: page;
    margin: 20px 0;
  }
   `;

      pdfElement.appendChild(styleElement);

      // pdfElement.appendChild(styleElement);
      const addPageNumbersAndHeadersFooters = (doc, watermarkImage, qrCodeImage) => {
        const totalPages = doc.internal.getNumberOfPages();
        const margin = 15; // Adjust as needed
        const footerHeight = 15; // Adjust as needed
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.innerHTML = pdfElement;
        document.body.appendChild(tempDiv);
        const rect = tempDiv.getBoundingClientRect();
        const reservedSealHeight = 45;
        const actualContentHeight = rect.height * (25.4 / 96);
        const pageHeight = doc.internal.pageSize.getHeight();
        // Total usable height for content
        const usableContentHeight = pageHeight - footerHeight - margin - reservedSealHeight;
        const contentEndY = Math.min(actualContentHeight, usableContentHeight);

        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const contentEndY = pageHeight - footerHeight - margin - 20; // leave gap above footer

          doc.setFontSize(12);
          const headerImgWidth = pageWidth * 0.95;
          const headerImgHeight = pageHeight * 0.09;
          const headerX = 5;
          const headerY = 3.5;
          if (head !== '') {
            doc.addImage(head, 'JPEG', headerX, headerY, headerImgWidth, headerImgHeight, '', 'FAST', 0.1);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(headerX, headerY, headerImgWidth, headerImgHeight, 'F'); // "F" = filled rectangle
          }
          const imgWidth = pageWidth * 0.5;
          const imgHeight = pageHeight * 0.25;
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2 - 20;
          doc.setFillColor(0, 0, 0, 0.1);
          doc.addImage(watermarkImage, 'PNG', x, y, imgWidth, imgHeight, '', 'FAST', 0.01);
          doc.setFontSize(10);
          const footerImgWidth = pageWidth * 0.95;
          const footerImgHeight = pageHeight * 0.067;
          const footerX = 5;
          const footerY = pageHeight - footerImgHeight - 5;
          if (foot !== "") {
            doc.addImage(foot, 'JPEG', footerX, footerY, footerImgWidth, footerImgHeight, '', 'FAST', 0.1);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(footerX, footerY, footerImgWidth, footerImgHeight, 'F');
          }

          // ---------- SIGNATURE & SEAL ----------
          // if (response?.data?.sdocumentPreparation?.signatureneed) {
          const signatureNeed = response?.data?.sdocumentPreparation?.signatureneed; // "All Pages" or "End Page"

          if (signatureNeed === "All Pages" || (signatureNeed === "End Page" && i === totalPages)) {
            // Decide Y position right after content but above footer
            const imageY = contentEndY;

            // Seal on left
            if (response?.data?.sdocumentPreparation?.signature || response?.data?.sdocumentPreparation?.seal || response?.data?.sdocumentPreparation?.usersignature) {
              const pageWidth = doc.internal.pageSize.getWidth();
              const pageHeight = doc.internal.pageSize.getHeight();
              const margin = 15;
              const footerGap = 20; // space to keep above footer

              // --- Unified Row Position ---
              const rowYOffset = 10; // ✅ Move row slightly lower
              const sigWidth = 40;    // reduced from 53
              const sigHeight = 6;    // reduced from 8

              const sealWidth = 17;   // reduced from 25/35
              const sealHeight = 17;  // reduced from 25/35
              const sealUpShift = 8;
              // ✅ Make user signature a bit wider but slightly shorter
              const userSigWidth = 47;  // increased width
              const userSigHeight = 20; // reduced height
              const userSigUpShift = 11;
              let yPos;

              if (i === totalPages) {
                // ✅ Use available space from bottom instead of rect.height
                yPos = response?.data?.sdocumentPreparation?.qrCodeNeed ? (pageHeight - footerGap - userSigHeight - 30) : (pageHeight - footerGap - userSigHeight); // stays near bottom
              } else {
                yPos = contentEndY + rowYOffset;
              }

              const topTextHeight = 6;
              const bottomTextHeight = 6;

              // --- Left: Main Signature ---
              let leftX = margin;
              if (response?.data?.sdocumentPreparation?.signature) {
                if (response?.data?.sdocumentPreparation?.signaturetype === "For Seal" && response?.data?.sdocumentPreparation?.topcontent) {
                  doc.setFontSize(8);
                  doc.setFont(undefined, "bold");
                  doc.setTextColor(83, 23, 126);
                  doc.text(response?.data?.sdocumentPreparation.topcontent, leftX, yPos - topTextHeight);
                  doc.setTextColor(0, 0, 0);
                }

                doc.addImage(response?.data?.sdocumentPreparation.signature, "PNG", leftX, yPos, sigWidth, sigHeight);

                if (response?.data?.sdocumentPreparation?.signaturetype === "For Seal" && response?.data?.sdocumentPreparation?.bottomcontent) {
                  doc.setFontSize(8);
                  doc.setFont(undefined, "bold");
                  doc.setTextColor(83, 23, 126);
                  doc.text(
                    response?.data?.sdocumentPreparation.bottomcontent,
                    leftX,
                    yPos + sigHeight + bottomTextHeight
                  );
                  doc.setTextColor(0, 0, 0);
                }
              }

              // --- Center: Seal (align with same yPos) ---
              const centerX = (pageWidth / 2) - (sealWidth / 2);
              if (response?.data?.sdocumentPreparation?.seal) {
                doc.addImage(response?.data?.sdocumentPreparation.seal, "PNG", centerX, yPos - sealUpShift, sealWidth, sealHeight);
              }

              // --- Right: Employee Signature (aligned with row, adjusted size) ---
              let rightX = pageWidth - userSigWidth - margin - 10;
              if (response?.data?.sdocumentPreparation?.usersignature) {
                doc.addImage(
                  response?.data?.sdocumentPreparation.usersignature,
                  "PNG",
                  rightX,
                  yPos - userSigUpShift, // ✅ Same yPos as others (aligned row)
                  userSigWidth,
                  userSigHeight
                );
              }
            }




          }
          // }

          if (response?.data?.sdocumentPreparation?.pagenumberneed === 'All Pages') {
            const textY = footerY - 3;
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, textY, { align: 'center' });
          } else if (response?.data?.sdocumentPreparation?.pagenumberneed === 'End Page' && i === totalPages) {
            const textY = footerY - 3;
            doc.text(`End of the document`, pageWidth / 2, textY, { align: 'center' });
          }

          if (response?.data?.sdocumentPreparation?.qrCodeNeed && response?.data?.sdocumentPreparation?.qrcodevalue === "End Page") {
            if (i === totalPages) {
              // Add QR code in the left corner
              const qrCodeWidth = 25; // Adjust as needed
              const qrCodeHeight = 25; // Adjust as needed
              const qrCodeX = footerX; // Left corner
              const qrCodeY = footerY - qrCodeHeight - 4; // 15 units above the footer image
              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);



              const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                '1. Scan to verify the authenticity of this document.',
                `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                `3. For questions, contact us at ${fromEmail}.`
              ];

              // starting position
              const statementX = qrCodeX + qrCodeWidth + 10;
              const statementY1 = qrCodeY + 10;
              const lineGap = 5; // vertical spacing between statements

              doc.setFontSize(12);

              statements.forEach((text, idx) => {
                const y = statementY1 + (idx * lineGap);
                doc.text(text, statementX, y);
              });

            }
          }
          if (response?.data?.sdocumentPreparation?.qrCodeNeed && response?.data?.sdocumentPreparation?.qrcodevalue === "All Pages") {
            if (i === totalPages) {
              // Add QR code in the left corner
              const qrCodeWidth = 25; // Adjust as needed
              const qrCodeHeight = 25; // Adjust as needed
              const qrCodeX = footerX; // Left corner
              const qrCodeY = footerY - qrCodeHeight - 4; // 15 units above the footer image
              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);



              const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                '1. Scan to verify the authenticity of this document.',
                `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                `3. For questions, contact us at ${fromEmail}.`
              ];

              // starting position
              const statementX = qrCodeX + qrCodeWidth + 10;
              const statementY1 = qrCodeY + 10;
              const lineGap = 5; // vertical spacing between statements

              doc.setFontSize(12);

              statements.forEach((text, idx) => {
                const y = statementY1 + (idx * lineGap);
                doc.text(text, statementX, y);
              });

            }
            else {
              // ✅ for all other pages → add page number + small QR code on the right
              const textY = footerY - 3;
              // small QR code next to it (bottom-right corner)
              const qrCodeWidth = 15;   // smaller size
              const qrCodeHeight = 15;
              const qrCodeX = pageWidth - qrCodeWidth - 15; // margin from right
              const qrCodeY = footerY - qrCodeHeight - 3;   // align with page text

              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
            }
          }
        }
      };

      const hasHeaderImage = head !== ''; // assuming head is a base64 src or image URL
      const hasFooterImage = foot !== '';

      const adjustedMargin = getAdjustedMargin(response.data.sdocumentPreparation?.marginQuill, hasHeaderImage, hasFooterImage);
      const pdfDimensions = getPageDimensionsTable(response.data.sdocumentPreparation?.pagesizeQuill, response.data.sdocumentPreparation?.orientationQuill); // as before

      // Convert the HTML content to PDF
      html2pdf()
        .from(pdfElement)
        .set({
          margin: adjustedMargin,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: {
            unit: 'mm',
            format: pdfDimensions,
            orientation: response.data.sdocumentPreparation?.orientationQuill,
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .toPdf()
        .get('pdf')
        .then((pdf) => {
          // Convert the watermark image to a base64 string
          const img = new Image();
          img.src = response?.data?.sdocumentPreparation?.watermark;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.globalAlpha = 0.1;
            ctx.drawImage(img, 0, 0);
            const watermarkImage = canvas.toDataURL('image/png');

            // Add QR code image
            const qrImg = new Image();
            qrImg.src = response.data.sdocumentPreparation?.qrcode; // QR code image URL
            if (response.data.sdocumentPreparation?.qrCodeNeed) {
              qrImg.onload = () => {
                const qrCanvas = document.createElement('canvas');
                qrCanvas.width = qrImg.width;
                qrCanvas.height = qrImg.height;
                const qrCtx = qrCanvas.getContext('2d');
                qrCtx.drawImage(qrImg, 0, 0);
                const qrCodeImage = qrCanvas.toDataURL('image/png');

                // Add page numbers and watermark to each page
                addPageNumbersAndHeadersFooters(pdf, watermarkImage, qrCodeImage);
                // Save the PDF
                const pdfBlob = pdf.output('blob');
                const pdfUrl = URL.createObjectURL(pdfBlob);
                const printWindow = window.open(pdfUrl);
                // pdf.save(`${response.data.sdocumentPreparation?.template}_${response.data.sdocumentPreparation?.person}.pdf`);
                handleClickCloseLetterHead();
              };
            } else {
              addPageNumbersAndHeadersFooters(pdf, watermarkImage, '');
              // Save the PDF
              const pdfBlob = pdf.output('blob');
              const pdfUrl = URL.createObjectURL(pdfBlob);
              const printWindow = window.open(pdfUrl);
              // pdf.save(`${response.data.sdocumentPreparation?.template}_${response.data.sdocumentPreparation?.person}.pdf`);
              handleClickCloseLetterHead();
            }
          };
        });
    }
  };
  const downloadPdfTesdtTablePrint = async (e) => {
    if (headerOptions === 'Please Select Print Options') {
      setButtonLoadingPreview(false);
      setPopupContentMalert('Please Select Print Options!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (headerOptions === 'With Letter Head' && selectedHeadOpt?.length < 1) {
      setPopupContentMalert('Please Select With Letter Head!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      // Create a new div element to hold the Quill content
      let response = await axios.get(`${SERVICE.SINGLE_DOCUMENTPREPARATION}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      await getUpdatePrintingStatus(response.data.sdocumentPreparation?._id, response.data.sdocumentPreparation?.updatedby);
      const pdfElement = document.createElement('div');
      pdfElement.innerHTML = response.data.sdocumentPreparation.document.replaceAll('--- Page Break ---', `<p class="page-break-label" data-page-break="true"></p>`);
      // Add custom styles to the PDF content
      const styleElement = document.createElement('style');
      styleElement.textContent = `
     .ql-indent-1 { margin-left: 75px; } /* Adjust margin for indent-1 class */
     .ql-indent-2 { margin-left: 150px; } /* Adjust margin for indent-2 class */
     .ql-indent-3 { margin-left: 225px; } /* Adjust margin for indent-3 class */
     .ql-indent-4 { margin-left: 275px; } /* Adjust margin for indent-4 class */
     .ql-indent-5 { margin-left: 325px; } /* Adjust margin for indent-5 class */
     .ql-indent-6 { margin-left: 375px; } /* Adjust margin for indent-6 class */
     .ql-indent-7 { margin-left: 425px; } /* Adjust margin for indent-7 class */
     .ql-indent-8 { margin-left: 475px; } /* Adjust margin for indent-8 class */
     .ql-align-right { text-align: right; } 
     .ql-align-left { text-align: left; } 
     .ql-align-center { text-align: center; } 
     .ql-align-justify { text-align: justify; } 
                       .page-break-label {
    page-break-before: always;
    break-before: page;
    margin: 20px 0;
  }
   `;

      pdfElement.appendChild(styleElement);

      // pdfElement.appendChild(styleElement);
      const addPageNumbersAndHeadersFooters = (doc, watermarkImage, qrCodeImage) => {
        const totalPages = doc.internal.getNumberOfPages();
        const margin = 15; // Adjust as needed
        const footerHeight = 15; // Adjust as needed
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.innerHTML = pdfElement;
        document.body.appendChild(tempDiv);
        const rect = tempDiv.getBoundingClientRect();
        const reservedSealHeight = 45;
        const actualContentHeight = rect.height * (25.4 / 96);
        const pageHeight = doc.internal.pageSize.getHeight();
        // Total usable height for content
        const usableContentHeight = pageHeight - footerHeight - margin - reservedSealHeight;
        const contentEndY = Math.min(actualContentHeight, usableContentHeight);

        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const contentEndY = pageHeight - footerHeight - margin - 20; // leave gap above footer

          doc.setFontSize(12);
          const headerImgWidth = pageWidth * 0.95;
          const headerImgHeight = pageHeight * 0.09;
          const headerX = 5;
          const headerY = 3.5;
          if (head !== '') {
            doc.addImage(head, 'JPEG', headerX, headerY, headerImgWidth, headerImgHeight, '', 'FAST', 0.1);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(headerX, headerY, headerImgWidth, headerImgHeight, 'F'); // "F" = filled rectangle
          }
          const imgWidth = pageWidth * 0.5;
          const imgHeight = pageHeight * 0.25;
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2 - 20;
          doc.setFillColor(0, 0, 0, 0.1);
          doc.addImage(watermarkImage, 'PNG', x, y, imgWidth, imgHeight, '', 'FAST', 0.01);
          doc.setFontSize(10);
          const footerImgWidth = pageWidth * 0.95;
          const footerImgHeight = pageHeight * 0.067;
          const footerX = 5;
          const footerY = pageHeight - footerImgHeight - 5;
          if (foot !== "") {
            doc.addImage(foot, 'JPEG', footerX, footerY, footerImgWidth, footerImgHeight, '', 'FAST', 0.1);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(footerX, footerY, footerImgWidth, footerImgHeight, 'F');
          }

          // ---------- SIGNATURE & SEAL ----------
          // if (response?.data?.sdocumentPreparation?.signatureneed) {
          const signatureNeed = response?.data?.sdocumentPreparation?.signatureneed; // "All Pages" or "End Page"

          if (signatureNeed === "All Pages" || (signatureNeed === "End Page" && i === totalPages)) {
            // Decide Y position right after content but above footer
            const imageY = contentEndY;

            // Seal on left
            if (response?.data?.sdocumentPreparation?.signature || response?.data?.sdocumentPreparation?.seal || response?.data?.sdocumentPreparation?.usersignature) {
              const pageWidth = doc.internal.pageSize.getWidth();
              const pageHeight = doc.internal.pageSize.getHeight();
              const margin = 15;
              const footerGap = 20; // space to keep above footer

              // --- Unified Row Position ---
              const rowYOffset = 10; // ✅ Move row slightly lower
              const sigWidth = 40;    // reduced from 53
              const sigHeight = 6;    // reduced from 8

              const sealWidth = 17;   // reduced from 25/35
              const sealHeight = 17;  // reduced from 25/35
              const sealUpShift = 8;
              // ✅ Make user signature a bit wider but slightly shorter
              const userSigWidth = 47;  // increased width
              const userSigHeight = 20; // reduced height
              const userSigUpShift = 11;
              let yPos;

              if (i === totalPages) {
                // ✅ Use available space from bottom instead of rect.height
                yPos = response?.data?.sdocumentPreparation?.qrCodeNeed ? (pageHeight - footerGap - userSigHeight - 30) : (pageHeight - footerGap - userSigHeight); // stays near bottom
              } else {
                yPos = contentEndY + rowYOffset;
              }

              const topTextHeight = 6;
              const bottomTextHeight = 6;

              // --- Left: Main Signature ---
              let leftX = margin;
              if (response?.data?.sdocumentPreparation?.signature) {
                if (response?.data?.sdocumentPreparation?.signaturetype === "For Seal" && response?.data?.sdocumentPreparation?.topcontent) {
                  doc.setFontSize(8);
                  doc.setFont(undefined, "bold");
                  doc.setTextColor(83, 23, 126);
                  doc.text(response?.data?.sdocumentPreparation.topcontent, leftX, yPos - topTextHeight);
                  doc.setTextColor(0, 0, 0);
                }

                doc.addImage(response?.data?.sdocumentPreparation.signature, "PNG", leftX, yPos, sigWidth, sigHeight);

                if (response?.data?.sdocumentPreparation?.signaturetype === "For Seal" && response?.data?.sdocumentPreparation?.bottomcontent) {
                  doc.setFontSize(8);
                  doc.setFont(undefined, "bold");
                  doc.setTextColor(83, 23, 126);
                  doc.text(
                    response?.data?.sdocumentPreparation.bottomcontent,
                    leftX,
                    yPos + sigHeight + bottomTextHeight
                  );
                  doc.setTextColor(0, 0, 0);
                }
              }

              // --- Center: Seal (align with same yPos) ---
              const centerX = (pageWidth / 2) - (sealWidth / 2);
              if (response?.data?.sdocumentPreparation?.seal) {
                doc.addImage(response?.data?.sdocumentPreparation.seal, "PNG", centerX, yPos - sealUpShift, sealWidth, sealHeight);
              }

              // --- Right: Employee Signature (aligned with row, adjusted size) ---
              let rightX = pageWidth - userSigWidth - margin - 10;
              if (response?.data?.sdocumentPreparation?.usersignature) {
                doc.addImage(
                  response?.data?.sdocumentPreparation.usersignature,
                  "PNG",
                  rightX,
                  yPos - userSigUpShift, // ✅ Same yPos as others (aligned row)
                  userSigWidth,
                  userSigHeight
                );
              }
            }




          }
          // }

          if (response?.data?.sdocumentPreparation?.pagenumberneed === 'All Pages') {
            const textY = footerY - 3;
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, textY, { align: 'center' });
          } else if (response?.data?.sdocumentPreparation?.pagenumberneed === 'End Page' && i === totalPages) {
            const textY = footerY - 3;
            doc.text(`End of the document`, pageWidth / 2, textY, { align: 'center' });
          }

          if (response?.data?.sdocumentPreparation?.qrCodeNeed && response?.data?.sdocumentPreparation?.qrcodevalue === "End Page") {
            if (i === totalPages) {
              // Add QR code in the left corner
              const qrCodeWidth = 25; // Adjust as needed
              const qrCodeHeight = 25; // Adjust as needed
              const qrCodeX = footerX; // Left corner
              const qrCodeY = footerY - qrCodeHeight - 4; // 15 units above the footer image
              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);



              const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                '1. Scan to verify the authenticity of this document.',
                `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                `3. For questions, contact us at ${fromEmail}.`
              ];

              // starting position
              const statementX = qrCodeX + qrCodeWidth + 10;
              const statementY1 = qrCodeY + 10;
              const lineGap = 5; // vertical spacing between statements

              doc.setFontSize(12);

              statements.forEach((text, idx) => {
                const y = statementY1 + (idx * lineGap);
                doc.text(text, statementX, y);
              });

            }
          }
          if (response?.data?.sdocumentPreparation?.qrCodeNeed && response?.data?.sdocumentPreparation?.qrcodevalue === "All Pages") {
            if (i === totalPages) {
              // Add QR code in the left corner
              const qrCodeWidth = 25; // Adjust as needed
              const qrCodeHeight = 25; // Adjust as needed
              const qrCodeX = footerX; // Left corner
              const qrCodeY = footerY - qrCodeHeight - 4; // 15 units above the footer image
              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);



              const statements = qrCodeInfoDetails?.length > 0 ? qrCodeInfoDetails : [
                '1. Scan to verify the authenticity of this document.',
                `2. This document was generated on ${moment(new Date(serverTime)).format('DD-MM-YYYY hh:mm a')}`,
                `3. For questions, contact us at ${fromEmail}.`
              ];

              // starting position
              const statementX = qrCodeX + qrCodeWidth + 10;
              const statementY1 = qrCodeY + 10;
              const lineGap = 5; // vertical spacing between statements

              doc.setFontSize(12);

              statements.forEach((text, idx) => {
                const y = statementY1 + (idx * lineGap);
                doc.text(text, statementX, y);
              });

            }
            else {
              // ✅ for all other pages → add page number + small QR code on the right
              const textY = footerY - 3;
              // small QR code next to it (bottom-right corner)
              const qrCodeWidth = 15;   // smaller size
              const qrCodeHeight = 15;
              const qrCodeX = pageWidth - qrCodeWidth - 15; // margin from right
              const qrCodeY = footerY - qrCodeHeight - 3;   // align with page text

              doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
            }
          }
        }
      };

      const hasHeaderImage = head !== ''; // assuming head is a base64 src or image URL
      const hasFooterImage = foot !== '';

      const adjustedMargin = getAdjustedMargin(response.data.sdocumentPreparation?.marginQuill, hasHeaderImage, hasFooterImage);
      const pdfDimensions = getPageDimensionsTable(response.data.sdocumentPreparation?.pagesizeQuill, response.data.sdocumentPreparation?.orientationQuill); // as before

      // Convert the HTML content to PDF
      html2pdf()
        .from(pdfElement)
        .set({
          margin: adjustedMargin,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: {
            unit: 'mm',
            format: pdfDimensions,
            orientation: response.data.sdocumentPreparation?.orientationQuill,
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .toPdf()
        .get('pdf')
        .then((pdf) => {
          // Convert the watermark image to a base64 string
          const img = new Image();
          img.src = response?.data?.sdocumentPreparation?.watermark;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.globalAlpha = 0.1;
            ctx.drawImage(img, 0, 0);
            const watermarkImage = canvas.toDataURL('image/png');

            // Add QR code image
            const qrImg = new Image();
            qrImg.src = response.data.sdocumentPreparation?.qrcode; // QR code image URL
            if (response.data.sdocumentPreparation?.qrCodeNeed) {
              qrImg.onload = () => {
                const qrCanvas = document.createElement('canvas');
                qrCanvas.width = qrImg.width;
                qrCanvas.height = qrImg.height;
                const qrCtx = qrCanvas.getContext('2d');
                qrCtx.drawImage(qrImg, 0, 0);
                const qrCodeImage = qrCanvas.toDataURL('image/png');

                // Add page numbers and watermark to each page
                addPageNumbersAndHeadersFooters(pdf, watermarkImage, qrCodeImage);
                // // Save the PDF
                // const pdfBlob = pdf.output('blob');
                // const pdfUrl = URL.createObjectURL(pdfBlob);
                // const printWindow = window.open(pdfUrl);
                pdf.save(`${response.data.sdocumentPreparation?.template}_${response.data.sdocumentPreparation?.person}.pdf`);
                handleClickCloseLetterHead();
              };
            } else {
              addPageNumbersAndHeadersFooters(pdf, watermarkImage, '');
              // // Save the PDF
              // const pdfBlob = pdf.output('blob');
              // const pdfUrl = URL.createObjectURL(pdfBlob);
              // const printWindow = window.open(pdfUrl);
              pdf.save(`${response.data.sdocumentPreparation?.template}_${response.data.sdocumentPreparation?.person}.pdf`);
              handleClickCloseLetterHead();
            }
          };
        });
    }
  };

  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item.id,
      serialNumber: item.serialNumber,
      date: item.date,
      approval: item.approval,
      referenceno: item.referenceno,
      templateno: item.templateno,
      template: item.template,
      documentname: item.documentname,
      mail: item.mail,
      printingstatus: item.printingstatus,
      employeemode: item.employeemode,
      department: item.department === 'Please Select Department' ? '' : item.department,
      company: item.company === 'Please Select Company' ? '' : item.company,
      branch: item.branch === 'Please Select Branch' ? '' : item.branch,
      unit: item.unit === 'Please Select Unit' ? '' : item.unit,
      team: item.team === 'Please Select Team' ? '' : item.team,
      person: item.person,
      issuedpersondetails: item.issuedpersondetails,
      issuingauthority: item.issuingauthority,
      daystatus: item.daystatus,
      printoptions: item.printoptions,
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
  // Function to filter columns based on search query
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
              {' '}
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
              {' '}
              Hide All
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Box>
  );

  let newvalues = employeeControlPanel ? value + '_' + `000${checkingArray?.length === 0 ? 1 : checkingArray?.length + 1}` : 'Man' + '#' + (templateCreationValue?.tempcode === '' || templateCreationValue?.tempcode === undefined ? '' : templateCreationValue?.tempcode) + '_' + '0001';

  // let refNo = templateCreationArray[templateCreationArray.length - 1].templateno;
  // let codenum = refNo.split("#");
  // let prefixLength = Number(codenum[1]) + 1;
  // let prefixString = String(prefixLength);
  // let postfixLength = prefixString.length == 1 ? 000${prefixString} : prefixString.length == 2 ? 00${prefixString} : prefixString.length == 3 ? 0${prefixString} : prefixString.length == 4 ? 0${prefixString} : prefixString.length == 5 ? 0${prefixString} : prefixString.length == 6 ? 0${prefixString} : prefixString.length == 7 ? 0${prefixString} : prefixString.length == 8 ? 0${prefixString} : prefixString.length == 9 ? 0${prefixString} : prefixString.length == 10 ? 0${prefixString} : prefixString

  // let newval = "VISIT#" + postfixLength;

  return (
    <Box>
      <Headtitle title={'DOCUMENT PREPARATION'} />
      <PageHeading title="Employee Document Preparation" modulename="Human Resources" submodulename="HR Documents" mainpagename="Employee Documents" subpagename="Employee Document Preparation" subsubpagename="" />
      {/* ****** Header Content ****** */}
      {/* <Typography sx={userStyle.HeaderText}>Employee Document Preparation</Typography> */}
      <>
        {isUserRoleCompare?.includes('aemployeedocumentpreparation') && (
          <Box sx={userStyle.selectcontainer}>
            <Typography>Add Employee Document Preparation</Typography>
            <br /> <br />
            <>
              <Grid container spacing={2}>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Date<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput id="component-outlined" type="text" value={moment(date).format('DD-MM-YYYY')} />
                  </FormControl>
                </Grid>

                <Grid item md={2} xs={12} sm={12}>
                  <Box>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Document Date<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="date"
                        value={documentPrepartion?.manualdate}
                        onChange={(e) => {
                          setDocumentPrepartion({
                            ...documentPrepartion,
                            manualdate: e?.target?.value,
                          });



                        }}
                      />
                    </FormControl>
                  </Box>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Template Branch<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <MultiSelect
                      options={accessbranch
                        ?.map((data) => ({
                          label: data.branch,
                          value: data.branch,
                        }))
                        .filter((item, index, self) => {
                          return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                        })}
                      value={selectedBranch}
                      onChange={(e) => {
                        handleBranchChange(e);
                      }}
                      valueRenderer={customValueRendererBranch}
                      labelledBy="Please Select Branch"
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Template <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      maxMenuHeight={300}
                      options={templateValues}
                      value={{ label: documentPrepartion.template, value: documentPrepartion.template }}
                      onChange={(e) => {
                        setDocumentPrepartion({
                          ...documentPrepartion,
                          template: e.value,
                          documentname: e.documentname,
                          sign: 'Please Select Signature',
                          sealing: 'Please Select Seal',
                          person: 'Please Select Person',
                        });
                        setSelectedMargin(e.marginQuill);
                        setPageSizeQuill(e.pagesizeQuill);
                        setPageOrientation(e.orientationQuill);
                        setSealPlacement('');
                        setSignature('');
                        setChecking('');
                        handleEmployeeModeOptions(e);
                        setTemplateCreationValue(e);
                        setSignatureStatus('');
                        setSealStatus('');
                        setCheckingArray([]);
                        setIndexViewQuest(1);
                        setSelectedEmployeeValues([]);
                        setSelectedEmployee([]);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Employee Mode <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      maxMenuHeight={300}
                      options={employeeModeOptions}
                      value={{ label: documentPrepartion.employeemode, value: documentPrepartion.employeemode }}
                      onChange={(e) => {
                        setDocumentPrepartion({
                          ...documentPrepartion,
                          employeemode: e.value,
                          department: 'Please Select Department',
                          company: 'Please Select Company',
                          branch: 'Please Select Branch',
                          unit: 'Please Select Unit',
                          team: 'Please Select Team',
                          person: 'Please Select Person',
                        });
                        setAttendanceNeed(false)
                        setProductionNeed(false)
                        setSalaryNeed(false)
                        setEmployeeMode(e.value);
                        setDepartmentCheck(false);
                        setAllBranchValue(false);
                        setGenerateData(false);
                        setChecking('');
                        setCheckingArray([]);
                        setEmployeenames([]);
                        // setCompanyOptions([])
                        setBranchOptions([]);
                        setUnitOptions([]);
                        setSelectedEmployeeValues([]);
                        setSelectedEmployee([]);
                        setIndexViewQuest(1);
                        setTeamOptions([]);
                        // fetchOpenDialogBox(e.value);
                      }}
                    />
                  </FormControl>
                </Grid>
                {/* <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Reason</Typography>
                    <Selects
                      maxMenuHeight={300}
                      options={[
                        { label: 'Document', value: 'Document' },
                        { label: 'Attendance', value: 'Attendance' },
                        { label: 'Production', value: 'Production' },
                        { label: 'Salary', value: 'Salary' },
                      ]}
                      value={{ label: documentPrepartion.reason, value: documentPrepartion.reason }}
                      onChange={(e) => {
                        setDocumentPrepartion({
                          ...documentPrepartion,
                          reason: e.value,
                          datechoosen: '',
                          monthchoosen: 'Please Select Month',

                          sort: 'Please Select Sort',
                          sign: 'Please Select Signature',
                          sealing: 'Please Select Seal',
                          person: 'Please Select Person',
                        });
                        setProductionDateStatus('');
                        setAttendanceDateStatus('');
                        setAttendanceMonthStatus('');
                        setProductionMonthStatus('');
                        setChecking('');
                        setCheckingArray([]);
                        setSelectedEmployeeValues([]);
                        setSelectedEmployee([]);
                      }}
                    />
                  </FormControl>
                </Grid> */}
                {documentPrepartion.employeemode != 'Manual' &&
                  <>
                    <Grid item md={2} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <FormControlLabel
                          control={<Checkbox sx={{ '& .MuiSvgIcon-root': { fontSize: 40, marginTop: 1 } }} checked={DocumentNeed} onChange={() => {
                            setDocumentNeed((val) => !val);
                            setAttendanceNeed(false)
                            setProductionNeed(false)
                            setSalaryNeed(false)
                          }} color="primary" />}
                          // sx={{marginTop: 1}}
                          label="Document"
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={2} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <FormControlLabel
                          control={<Checkbox sx={{ '& .MuiSvgIcon-root': { fontSize: 40, marginTop: 1 } }} disabled={DocumentNeed} checked={AttendanceNeed} onChange={() => setAttendanceNeed((val) => !val)} color="primary" />}
                          // sx={{marginTop: 1}}
                          label="Attendance"
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={2} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <FormControlLabel
                          control={<Checkbox sx={{ '& .MuiSvgIcon-root': { fontSize: 40, marginTop: 1 } }} disabled={DocumentNeed} checked={ProductionNeed} onChange={() => setProductionNeed((val) => !val)} color="primary" />}
                          // sx={{marginTop: 1}}
                          label="Production"
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={2} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <FormControlLabel
                          control={<Checkbox sx={{ '& .MuiSvgIcon-root': { fontSize: 40, marginTop: 1 } }} disabled={DocumentNeed} checked={SalaryNeed} onChange={() => setSalaryNeed((val) => !val)} color="primary" />}
                          // sx={{marginTop: 1}}
                          label="Salary"
                        />
                      </FormControl>
                    </Grid>
                  </>
                }
                {documentPrepartion.employeemode != 'Manual' && (
                  <>
                    <Grid item md={2} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Department<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          maxMenuHeight={300}
                          options={departmentOptions}
                          isDisabled={allBranchValue}
                          value={{ label: documentPrepartion.department, value: documentPrepartion.department }}
                          onChange={(e) => {
                            setDocumentPrepartion({
                              ...documentPrepartion,
                              department: e.value,
                              company: 'Please Select Company',
                              branch: 'Please Select Branch',
                              unit: 'Please Select Unit',
                              person: 'Please Select Person',
                              team: 'Please Select Team',
                              issuingauthority: 'Please Select Issuing Authority',
                            });
                            setDepartmentCheck(true);
                            fetchTeamNames(e.value, documentPrepartion.employeemode);
                            fetchIsssuingAuthority(e, 'Department');
                            setSelectedEmployee([]);
                            setSelectedEmployeeValues([]);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={1} xs={12} sm={12}>
                      <Typography>&nbsp;</Typography>
                      <Button sx={buttonStyles.btncancel} onClick={handleclearDepartment}>
                        Clear
                      </Button>
                    </Grid>
                  </>
                )}
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Company<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      maxMenuHeight={300}
                      options={CompanyOptions}
                      isDisabled={departmentCheck}
                      value={{ label: documentPrepartion.company, value: documentPrepartion.company }}
                      onChange={(e) => {
                        BranchDropDowns(e);
                        UnitDropDowns(e.value);
                        setAllBranch(e.value);
                        setAllBranchValue(true);
                        setTeamOptions([]);
                        setDocumentPrepartion({
                          ...documentPrepartion,
                          company: e.value,
                          branch: 'Please Select Branch',
                          unit: 'Please Select Unit',
                          team: 'Please Select Team',
                          person: 'Please Select Person',
                          signature: 'Please Select Signature',
                          seal: 'Please Select Seal',
                        });
                        setEmployeenames([]);
                        setSelectedEmployee([]);
                        setSelectedEmployeeValues([]);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Branch<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      maxMenuHeight={300}
                      options={BranchOptions}
                      isDisabled={departmentCheck}
                      value={{ label: documentPrepartion.branch, value: documentPrepartion.branch }}
                      onChange={(e) => {
                        UnitDropDowns(e.value);
                        setAllBranch(e.value);
                        setAllBranchValue(true);
                        if (documentPrepartion.employeemode === 'Manual') {
                          TemplateDropdownsValueManual(documentPrepartion.company, e.value);
                        }
                        setDocumentPrepartion({
                          ...documentPrepartion,
                          branch: e.value,
                          unit: 'Please Select Unit',
                          team: 'Please Select Team',
                          person: 'Please Select Person',
                        });
                        setEmployeenames([]);
                        TemplateManualDropDowns(templateCreationValue, documentPrepartion.employeemode, documentPrepartion.company, e.value);
                        setTeamOptions([]);
                        fetchIsssuingAuthorityManual(e.value);
                        setSelectedEmployee([]);
                        setSelectedEmployeeValues([]);
                      }}
                    />
                  </FormControl>
                </Grid>

                {documentPrepartion.employeemode != 'Manual' && (
                  <>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Unit<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          maxMenuHeight={300}
                          options={UnitOptions}
                          isDisabled={departmentCheck}
                          value={{ label: documentPrepartion.unit, value: documentPrepartion.unit }}
                          onChange={(e) => {
                            fetchTeam(e.value);
                            setDocumentPrepartion({
                              ...documentPrepartion,
                              unit: e.value,
                              team: 'Please Select Team',
                              person: 'Please Select Person',
                            });
                            setEmployeenames([]);
                            setSelectedEmployee([]);
                            setSelectedEmployeeValues([]);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Team<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          maxMenuHeight={300}
                          options={TeamOptions}
                          isDisabled={departmentCheck}
                          value={{ label: documentPrepartion.team, value: documentPrepartion.team }}
                          onChange={(e) => {
                            setDocumentPrepartion({
                              ...documentPrepartion,
                              team: e.value,
                              issuingauthority: 'Please Select Issuing Authority',
                              person: 'Please Select Person',
                            });
                            fetchAllEmployee(e);
                            fetchIsssuingAuthority(e, 'Team');
                            setSelectedEmployee([]);
                            setSelectedEmployeeValues([]);
                          }}
                        />
                      </FormControl>
                    </Grid>
                  </>
                )}
                {documentPrepartion.employeemode !== 'Manual' && !DocumentNeed && (
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Person<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <Selects
                        maxMenuHeight={300}
                        options={employeenames}
                        value={{ label: documentPrepartion.person, value: documentPrepartion.person }}
                        onChange={(e) => {
                          setDocumentPrepartion({
                            ...documentPrepartion,
                            person: e.value,
                            sign: 'Please Select Signature',
                            signature: 'Please Select Signature',
                            seal: 'Please Select Seal',
                            sealing: 'Please Select Seal',
                            sort: 'Please Select Sort',

                          });

                          setEmployeeValue(e.value);
                          setEmployeeUserName(e.username);

                          CheckNoticePeriod(e.value);
                          TemplateDropdownsValue(templateCreationValue, e);
                          IdentifyUserCode(e);
                          setEmployeeControlPanel(e);
                          setChecking('');
                          setProductionDateStatus('');
                          setAttendanceDateStatus('');
                          setAttendanceMonthStatus('');
                          setProductionMonthStatus('');
                        }}
                      />
                    </FormControl>
                  </Grid>
                )}
                {documentPrepartion.employeemode !== 'Manual' && DocumentNeed && (
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Person<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={employeenames}
                        value={selectedEmployee}
                        onChange={(e) => {
                          handleEmployeeChange(e);
                        }}
                        valueRenderer={customValueRendererEmployee}
                        labelledBy="Please Select Employee"
                      />
                    </FormControl>
                  </Grid>
                )}

                {(AttendanceNeed) && (
                  <>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Attendance Sort<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          maxMenuHeight={300}
                          options={[
                            { label: 'Date', value: 'Date' },
                            { label: 'Month', value: 'Month' },
                          ]}
                          value={{ label: documentPrepartion?.attendancesort, value: documentPrepartion?.attendancesort }}
                          onChange={(e) => {
                            setDocumentPrepartion({
                              ...documentPrepartion,
                              attendancesort: e.value,
                              attendancedate: '',
                              attendancemonth: 'Please Select Attendance Month',
                              sign: 'Please Select Signature',
                              sealing: 'Please Select Seal',
                            });
                            // const Mode = e.value === "Date" ? "DOJ" : "Month Based";
                            // setSelectedModeType(Mode)
                            // setSortingStatus(e.value);
                            setProductionDateStatus('');
                            setAttendanceDateStatus('');
                            setAttendanceMonthStatus('');
                            setProductionMonthStatus('');
                            setChecking('');
                          }}
                        />
                      </FormControl>
                    </Grid>

                    {documentPrepartion?.attendancesort === 'Date' ? (
                      <>
                        <Grid item md={2} xs={12} sm={12}>
                          <Box>
                            <FormControl fullWidth size="small">
                              <Typography>
                                Attendance Date<b style={{ color: 'red' }}>*</b>
                              </Typography>
                              <OutlinedInput
                                id="component-outlined"
                                type="date"
                                value={documentPrepartion?.attendancedate}
                                onChange={(e) => {
                                  setDocumentPrepartion({
                                    ...documentPrepartion,
                                    attendancedate: e?.target?.value,
                                    sign: 'Please Select Signature',
                                    sealing: 'Please Select Seal',
                                  });
                                  setChecking('');
                                  setAttendanceMonthStatus('');
                                  setProductionDateStatus('');
                                  setProductionMonthStatus('');
                                  // fetchAttendanceDateStatus(employeeUserName, e?.target?.value);
                                }}
                              />
                            </FormControl>
                          </Box>
                        </Grid>
                      </>
                    ) : documentPrepartion?.attendancesort === 'Month' ? (
                      <>
                        <Grid item md={3} xs={12} sm={12}>
                          <Box>
                            <FormControl fullWidth size="small">
                              <Typography>
                                Attendance Month<b style={{ color: 'red' }}>*</b>
                              </Typography>
                              <Selects maxMenuHeight={300} options={months} value={{ label: documentPrepartion?.attendancemonth, value: documentPrepartion?.attendancemonth }} onChange={handleMonthChangeAttendance} />
                            </FormControl>
                          </Box>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              {' '}
                              Attendance Year<b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <Selects maxMenuHeight={200} styles={colourStyles} options={availableYearsAttendance} value={{ label: documentPrepartion?.attendanceyear, value: documentPrepartion?.attendanceyear }} onChange={handleYearChangeAttendance} />
                          </FormControl>
                        </Grid>
                      </>
                    ) : (
                      ''
                    )}
                  </>
                )}
                {ProductionNeed && (
                  <>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Production Sort<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          maxMenuHeight={300}
                          options={[
                            { label: 'Date', value: 'Date' },
                            { label: 'Month', value: 'Month' },
                          ]}
                          value={{ label: documentPrepartion?.productionsort, value: documentPrepartion?.productionsort }}
                          onChange={(e) => {
                            setDocumentPrepartion({
                              ...documentPrepartion,
                              productionsort: e.value,
                              productiondate: '',
                              productionmonth: 'Please Select Production Month',
                              sign: 'Please Select Signature',
                              sealing: 'Please Select Seal',
                            });
                            // setSortingStatus(e.value);
                            setProductionDateStatus('');
                            setAttendanceDateStatus('');
                            setAttendanceMonthStatus('');
                            setProductionMonthStatus('');
                          }}
                        />
                      </FormControl>
                    </Grid>

                    {documentPrepartion?.productionsort === 'Date' ? (
                      <>
                        <Grid item md={2} xs={12} sm={12}>
                          <Box>
                            <FormControl fullWidth size="small">
                              <Typography>
                                Production Date<b style={{ color: 'red' }}>*</b>
                              </Typography>
                              <OutlinedInput
                                id="component-outlined"
                                type="date"
                                value={documentPrepartion?.productiondate}
                                onChange={(e) => {
                                  setDocumentPrepartion({
                                    ...documentPrepartion,
                                    productiondate: e?.target?.value,
                                    sign: 'Please Select Signature',
                                    sealing: 'Please Select Seal',
                                  });
                                  // fetchProductionDateStatus(employeeControlPanel, e?.target?.value);
                                }}
                              />
                            </FormControl>
                          </Box>
                        </Grid>
                      </>
                    ) : documentPrepartion?.productionsort === 'Month' ? (
                      <>
                        <>
                          <Grid item md={3} xs={12} sm={12}>
                            <Box>
                              <FormControl fullWidth size="small">
                                <Typography>
                                  Production Month<b style={{ color: 'red' }}>*</b>
                                </Typography>
                                <Selects maxMenuHeight={300} options={months} value={{ label: documentPrepartion?.productionmonth, value: documentPrepartion?.productionmonth }} onChange={handleMonthChangeProduction} />
                              </FormControl>
                            </Box>
                          </Grid>
                          <Grid item md={3} sm={12} xs={12}>
                            <FormControl fullWidth size="small">
                              <Typography>
                                {' '}
                                Production Year<b style={{ color: 'red' }}>*</b>
                              </Typography>
                              <Selects maxMenuHeight={200} styles={colourStyles} options={availableYearsProduction} value={{ label: documentPrepartion?.productionyear, value: documentPrepartion?.productionyear }} onChange={handleYearChangeProduction} />
                            </FormControl>
                          </Grid>
                        </>
                      </>
                    ) : (
                      ''
                    )}
                  </>
                )}
                {SalaryNeed && (
                  <>
                    <Grid item md={2} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Salary Mode<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects options={TypeModeOptions} value={{ label: selectedModeType, value: selectedModeType }} onChange={handleModeTypeChange} />
                      </FormControl>
                    </Grid>
                    {selectedModeType === 'Month Based' && (
                      <>
                        <Grid item md={1.5} xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Salary Year<b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <Selects options={availableYearsSalary} value={{ label: selectedYear, value: selectedYear }} onChange={handleYearChangeSalary} />
                          </FormControl>
                        </Grid>
                        <Grid item md={1.5} xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Month <b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <Selects options={selectedYear === 'Select Year' ? [] : months} value={{ label: selectmonthname, value: selectmonthname }} onChange={handleMonthChangeSalary} />
                          </FormControl>
                        </Grid>
                      </>
                    )}
                  </>
                )}

                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Issuing Authority<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      maxMenuHeight={300}
                      options={issuingauthority?.filter(data => DocumentNeed ? !selectedEmployeeValues?.includes(data?.value) : documentPrepartion?.person !== data?.value)}
                      value={{ label: documentPrepartion.issuingauthority, value: documentPrepartion.issuingauthority }}
                      onChange={(e) => {
                        setDocumentPrepartion({
                          ...documentPrepartion,
                          issuingauthority: e.value,
                          signature: 'Please Select Signature',
                          seal: 'Please Select Seal',
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                {signatureStatus === 'With' && (
                  <>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Signature<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          maxMenuHeight={300}
                          options={companyName?.documentsignature?.filter(data =>
                            (DocumentNeed ? !selectedEmployeeValues?.includes(data?.employee) : documentPrepartion?.person !== data?.employee
                            ) && documentPrepartion?.issuingauthority === data?.employee)?.map((data) =>
                            ({
                              ...data,
                              label: `${data.signaturename} -- ${data.employee}`,
                              value: `${data.signaturename} -- ${data.employee}`,
                            }))}
                          value={{ label: documentPrepartion.signature, value: documentPrepartion.signature }}
                          onChange={(e) => {
                            setDocumentPrepartion({
                              ...documentPrepartion,
                              signature: e.value,
                              seal: 'Please Select Seal',
                            });
                            setSignature(e?.document[0]?.preview);
                            setSignatureContent(e);
                            setSealPlacement('');
                          }}
                        />
                      </FormControl>
                    </Grid>
                  </>
                )}
                {sealStatus !== 'Document' && sealStatus !== '' && sealStatus !== 'None' && (
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Seal<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <Selects
                        maxMenuHeight={300}
                        options={companyName?.documentseal?.map((data) => ({
                          ...data,
                          label: `${data.seal} -- ${data.name}`,
                          value: `${data.seal} -- ${data.name}`,
                        }))}
                        value={{ label: documentPrepartion.seal, value: documentPrepartion.seal }}
                        onChange={(e) => {
                          setDocumentPrepartion({
                            ...documentPrepartion,
                            seal: e.value,
                          });

                          setSealPlacement(e?.document[0]?.preview);
                        }}
                      />
                    </FormControl>
                  </Grid>
                )}
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Signature/Seal Need<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      maxMenuHeight={300}
                      options={[
                        { label: 'All Pages', value: 'All Pages' },
                        { label: 'End Page', value: 'End Page' },
                        { label: 'No Need', value: 'No Need' },
                      ]}
                      value={{ label: documentPrepartion.signatureneed, value: documentPrepartion.signatureneed }}
                      onChange={(e) => {
                        setDocumentPrepartion({
                          ...documentPrepartion,
                          signatureneed: e.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Page Number<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      maxMenuHeight={300}
                      options={[
                        { label: 'All Pages', value: 'All Pages' },
                        { label: 'End Page', value: 'End Page' },
                        { label: 'No Need', value: 'No Need' },
                      ]}
                      value={{ label: documentPrepartion.pagenumberneed, value: documentPrepartion.pagenumberneed }}
                      onChange={(e) => {
                        setDocumentPrepartion({
                          ...documentPrepartion,
                          pagenumberneed: e.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                {((documentPrepartion?.employeemode === 'Manual' && documentPrepartion?.branch !== 'Please Select Branch') || (documentPrepartion?.employeemode !== 'Manual' && selectedEmployee?.length > 0)) && (
                  <>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Document Need</Typography>
                        <Selects
                          maxMenuHeight={300}
                          options={[
                            { label: 'Print Document', value: 'Print Document' },
                            { label: 'Employee Approval', value: 'Employee Approval' },
                          ]}
                          value={{ label: documentPrepartion.documentneed, value: documentPrepartion.documentneed }}
                          onChange={(e) => {
                            setDocumentPrepartion({
                              ...documentPrepartion,
                              documentneed: e.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>

                    {documentPrepartion?.documentneed === 'Employee Approval' && (
                      <>
                        <Grid item md={4} xs={12} sm={12}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Print Option<b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <Selects
                              maxMenuHeight={300}
                              options={HeaderDropDowns}
                              value={{ label: documentPrepartion.printoptions, value: documentPrepartion.printoptions }}
                              onChange={(e) => {
                                setDocumentPrepartion({
                                  ...documentPrepartion,
                                  printoptions: e.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                        {documentPrepartion.printoptions === 'With Letter Head' && (
                          <Grid item md={documentPrepartion.printoptions === 'With Letter Head' ? 4 : 3} xs={12} sm={12}>
                            <FormControl fullWidth size="small">
                              <Typography>
                                With Letter Head <b style={{ color: 'red' }}>*</b>
                              </Typography>
                              <MultiSelect maxMenuHeight={300} options={WithHeaderOptions} value={selectedHeadOptAdd} onChange={handleHeadChangeAdd} valueRenderer={customValueRenderHeadFromAdd} />
                            </FormControl>
                          </Grid>
                        )}
                      </>
                    )}
                  </>
                )}


                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <FormControlLabel
                      control={<Checkbox sx={{ '& .MuiSvgIcon-root': { fontSize: 40, marginTop: 1 } }} checked={qrCodeNeed} onChange={() => setQrCodeNeed((val) => !val)} color="primary" />}
                      // sx={{marginTop: 1}}
                      label="QR Code"
                    />
                  </FormControl>
                </Grid>
                {qrCodeNeed &&
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        QR Code<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <Selects
                        maxMenuHeight={300}
                        options={[
                          { label: 'All Pages', value: 'All Pages' },
                          { label: 'End Page', value: 'End Page' },
                        ]}
                        value={{ label: documentPrepartion.qrcodevalue, value: documentPrepartion.qrcodevalue }}
                        onChange={(e) => {
                          setDocumentPrepartion({
                            ...documentPrepartion,
                            qrcodevalue: e.value,
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>}



                <Grid item md={3} xs={12} sm={12}></Grid>
                <Grid item md={12} xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Generate
                  </Button>
                </Grid>
                <Grid item md={12} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Document <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    {documentPrepartion?.employeemode === 'Manual' ? (
                      <ReactQuillAdvanced
                        agenda={checking}
                        setAgenda={documentPrepartion?.employeemode === 'Manual' ? setChecking : undefined}
                        disabled={documentPrepartion?.employeemode !== 'Manual'}
                        selectedMargin={selectedMargin}
                        setSelectedMargin={setSelectedMargin}
                        pageSize={pageSizeQuill}
                        setPageSize={setPageSizeQuill}
                        pageOrientation={pageOrientation}
                        setPageOrientation={setPageOrientation}
                      />
                    ) : (
                      // <ReactQuill style={{ height: "max-content", minHeight: "150px" }}
                      //   value={checking}
                      //   onChange={documentPrepartion?.employeemode === "Manual" ? setChecking : undefined}
                      //   readOnly={documentPrepartion?.employeemode !== "Manual"}
                      //   modules={{
                      //     toolbar: [[{ header: "1" }, { header: "2" },
                      //     { font: [] }], ["tab"], [{ size: [] }],
                      //     ["bold", "italic", "underline", "strike", "blockquote"],
                      //     [{ align: [] }],
                      //     [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                      //     ["link", "image", "video"], ["clean"]]
                      //   }}

                      //   formats={["header", "font", "size", "bold", "italic", "underline", "strike", "align", "blockquote", "list", "bullet", "indent", "link", "image", "video"]}
                      // />
                      <>
                        {checkingArray?.map((text, index) => {
                          if (index === indexViewQuest - 1) {
                            return (
                              <Grid item md={12} sm={12} xs={12} key={index}>
                                <FormControl fullWidth size="small">
                                  <Typography>
                                    <b> Documents List</b>
                                  </Typography>
                                  <Grid container spacing={2}>
                                    <Grid item md={11} sm={12} xs={12}>
                                      <ReactQuillAdvanced
                                        agenda={text.data}
                                        setAgenda={undefined}
                                        disabled={documentPrepartion?.employeemode !== 'Manual'}
                                        selectedMargin={selectedMargin}
                                        setSelectedMargin={setSelectedMargin}
                                        pageSize={pageSizeQuill}
                                        setPageSize={setPageSizeQuill}
                                        pageOrientation={pageOrientation}
                                        setPageOrientation={setPageOrientation}
                                      />
                                      {/* <ReactQuill style={{ height: "max-content", minHeight: "150px" }}
                                          value={text.data}
                                          readOnly={documentPrepartion?.employeemode !== "Manual"}
                                          modules={{
                                            toolbar: [[{ header: "1" }, { header: "2" },
                                            { font: [] }], ["tab"], [{ size: [] }],
                                            ["bold", "italic", "underline", "strike", "blockquote"],
                                            [{ align: [] }],
                                            [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                                            ["link", "image", "video"], ["clean"]]
                                          }}


                                          formats={["header", "font", "size", "bold", "italic", "underline", "strike", "align", "blockquote", "list", "bullet", "indent", "link", "image", "video"]}
                                        /> */}
                                      <br></br>
                                      <br></br>
                                      <br></br>
                                      <br></br>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                        {indexViewQuest > 1 && indexViewQuest <= checkingArray?.length ? (
                                          <Button variant="contained" onClick={handlePrevPage}>
                                            Prev Page
                                          </Button>
                                        ) : null}
                                        {indexViewQuest < checkingArray?.length ? (
                                          <Button variant="contained" onClick={handleNextPage}>
                                            Next Page
                                          </Button>
                                        ) : null}
                                      </div>
                                    </Grid>
                                    <Grid item md={1} sm={12} xs={12}>
                                      <Button
                                        sx={userStyle.buttondelete}
                                        onClick={(e) => {
                                          HandleDeleteText(index);
                                        }}
                                      >
                                        <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} style={{ fontsize: 'large' }} />
                                      </Button>
                                    </Grid>
                                  </Grid>
                                </FormControl>
                              </Grid>
                            );
                          }
                        })}
                        {/* {checkingArray?.map((data, index) => (
                            // Your JSX goes here, e.g.:
                            <div key={index}>

                              <ReactQuill style={{ height: "max-content", minHeight: "150px" }}
                                value={data}
                                readOnly={documentPrepartion?.employeemode !== "Manual"}
                                modules={{
                                  toolbar: [[{ header: "1" }, { header: "2" },
                                  { font: [] }], ["tab"], [{ size: [] }],
                                  ["bold", "italic", "underline", "strike", "blockquote"],
                                  [{ align: [] }],
                                  [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                                  ["link", "image", "video"], ["clean"]]
                                }}


                                formats={["header", "font", "size", "bold", "italic", "underline", "strike", "align", "blockquote", "list", "bullet", "indent", "link", "image", "video"]}
                              />
                              <br />
                            </div>
                          ))} */}
                      </>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
              <br />
              <br />
              <div>{/* <QRCode value={generateRedirectUrl()} /> */}</div>
              <br />
              <br />
              <br />
              <br />
              {documentPrepartion.employeemode === 'Manual' ? (
                <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Grid item lg={1} md={2} sm={2} xs={12}>
                    {checking ? (
                      <LoadingButton
                        loading={buttonLoadingPreview}
                        variant="contained"
                        color="primary"
                        sx={userStyle.buttonadd}
                        onClick={() => {
                          documentPrepartion?.documentneed === 'Employee Approval' ? handlePreviewDocumentManual() : handleClickOpenLetterHeader('Preview Manual');
                        }}
                      // onClick={handlePreviewDocumentManual}
                      >
                        Preview
                      </LoadingButton>
                    ) : (
                      ''
                    )}
                  </Grid>
                  &ensp;
                  <Grid item lg={1} md={2} sm={2} xs={12}>
                    {checking ? (
                      <LoadingButton
                        loading={buttonLoading}
                        variant="contained"
                        color="primary"
                        sx={userStyle.buttonadd}
                        onClick={() => (documentPrepartion?.documentneed === 'Employee Approval' ? handlePrintDocumentManual() : handleClickOpenLetterHeader('Print Manual'))}
                      // onClick={handlePrintDocumentManual}
                      >
                        Print
                      </LoadingButton>
                    ) : (
                      ''
                    )}
                  </Grid>
                  <Grid item lg={1} md={2} sm={2} xs={12}>
                    <LoadingButton loading={btnload} variant="contained" color="primary" sx={buttonStyles.buttonsubmit} onClick={handleSubmitedManual}>
                      Save
                    </LoadingButton>
                  </Grid>
                  <Grid item lg={1} md={2} sm={2} xs={12}>
                    <Button sx={buttonStyles.btncancel} onClick={handleclearedManual}>
                      Clear
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Grid item lg={1} md={2} sm={2} xs={12}>
                    {checkingArray?.length > 0 ? (
                      <LoadingButton
                        loading={buttonLoadingPreview}
                        variant="contained"
                        color="primary"
                        sx={userStyle.buttonadd}
                        onClick={() => (documentPrepartion?.documentneed === 'Employee Approval' ? handlePreviewDocument(indexViewQuest - 1) : handleClickOpenLetterHeader('Preview'))}
                      // onClick={() => handlePreviewDocument(indexViewQuest - 1)}
                      >
                        Preview
                      </LoadingButton>
                    ) : (
                      ''
                    )}
                  </Grid>
                  &ensp;
                  <Grid item lg={1} md={2} sm={2} xs={12}>
                    {checkingArray?.length > 0 ? (
                      <LoadingButton
                        loading={buttonLoading}
                        variant="contained"
                        color="primary"
                        sx={userStyle.buttonadd}
                        onClick={() => (documentPrepartion?.documentneed === 'Employee Approval' ? handlePrintDocument(indexViewQuest - 1) : handleClickOpenLetterHeader('Print'))}
                      // onClick={() => handlePrintDocument(indexViewQuest - 1)}
                      >
                        Print
                      </LoadingButton>
                    ) : (
                      ''
                    )}
                  </Grid>
                  <Grid item lg={1} md={2} sm={2} xs={12}>
                    <LoadingButton loading={btnload} variant="contained" color="primary" sx={buttonStyles.buttonsubmit} onClick={(e) => handleSubmited(e, indexViewQuest - 1)}>
                      Save
                    </LoadingButton>
                  </Grid>
                  <Grid item lg={1} md={2} sm={2} xs={12}>
                    <Button sx={buttonStyles.btncancel} onClick={handlecleared}>
                      Clear
                    </Button>
                  </Grid>
                </Grid>
              )}
            </>
          </Box>
        )}
      </>
      {/* } */}
      <br /> <br />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes('lemployeedocumentpreparation') && (
        <>
          <Box sx={userStyle.container}>
            <NotificationContainer />
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>List Document Preparation</Typography>
            </Grid>
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
                    <MenuItem value={items?.length}>All</MenuItem>
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
                  {isUserRoleCompare?.includes('excelemployeedocumentpreparation') && (
                    <>
                      <Button
                        onClick={(e) => {
                          setIsFilterOpen(true);
                          setFormat('xl');
                          fetchBrandMasterOverall();
                        }}
                        sx={userStyle.buttongrp}
                      >
                        <FaFileExcel />
                        &ensp;Export to Excel&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('csvemployeedocumentpreparation') && (
                    <>
                      <Button
                        onClick={(e) => {
                          setIsFilterOpen(true);
                          setFormat('csv');
                          fetchBrandMasterOverall();
                        }}
                        sx={userStyle.buttongrp}
                      >
                        <FaFileCsv />
                        &ensp;Export to CSV&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('printemployeedocumentpreparation') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('pdfemployeedocumentpreparation') && (
                    <>
                      <Button
                        sx={userStyle.buttongrp}
                        onClick={() => {
                          setIsPdfFilterOpen(true);
                          fetchBrandMasterOverall();
                        }}
                      >
                        <FaFilePdf />
                        &ensp;Export to PDF&ensp;
                      </Button>
                    </>
                  )}

                  {isUserRoleCompare?.includes('imageemployeedocumentpreparation') && (
                    <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}>
                      {' '}
                      <ImageIcon sx={{ fontSize: '15px' }} /> &ensp;Image&ensp;{' '}
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item md={2} xs={12} sm={12}>
                <AggregatedSearchBar
                  columnDataTable={columnDataTable}
                  setItems={setItems}
                  addSerialNumber={addSerialNumber}
                  setPage={setPage}
                  maindatas={templateCreationArrayCreate}
                  setSearchedString={setSearchedString}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  paginated={false}
                  totalDatas={items}
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
            {isUserRoleCompare?.includes('bdemployeedocumentpreparation') && (
              <Button sx={buttonStyles.buttonbulkdelete} variant="contained" color="error" onClick={handleClickOpenalert}>
                Bulk Delete
              </Button>
            )}
            &ensp;
            <Button variant="contained" color="error" onClick={handleClickOpenBulkalert}>
              Bulk Print
            </Button>
            <br />
            <br />
            {loader ? (
              <>
                <Box sx={userStyle.container}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '350px' }}>
                    <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
                  </Box>
                </Box>
              </>
            ) : (
              <>
                <Box
                  style={{
                    width: '100%',
                    overflowY: 'hidden', // Hide the y-axis scrollbar
                  }}
                >
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
                    // totalDatas={totalProjects}
                    searchQuery={searchedString}
                    handleShowAllColumns={handleShowAllColumns}
                    setFilteredRowData={setFilteredRowData}
                    filteredRowData={filteredRowData}
                    setFilteredChanges={setFilteredChanges}
                    filteredChanges={filteredChanges}
                    gridRefTableImg={gridRefTableImg}
                    itemsList={items}
                  />

                  {/* <StyledDataGrid onClipboardCopy={(copiedString) => setCopiedData(copiedString)} rows={rowsWithCheckboxes} columns={columnDataTable.filter((column) => columnVisibility[column.field])} onSelectionModelChange={handleSelectionChange} selectionModel={selectedRows} autoHeight={true} ref={gridRef} density="compact" hideFooter getRowClassName={getRowClassName} disableRowSelectionOnClick /> */}
                </Box>
              </>
            )}
            {/* ****** Table End ****** */}
            <br />
            <br />
            <br />
            {/* {userRoles?.includes("MANAGER", "HIRINGMANAGER") && <DocumentsPrintedStatusList data={Changed} setData={setChanged} />} */}
          </Box>
        </>
      )}
      {/* ****** Table End ****** */}
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
      {/*DELETE ALERT DIALOG */}
      <Dialog open={isDeleteOpen} onClose={handleCloseMod} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '80px', color: 'orange' }} />
          <Typography variant="h5" sx={{ color: 'red', textAlign: 'center' }}>
            Are you sure?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMod} sx={buttonStyles.btncancel}>
            Cancel
          </Button>
          <Button autoFocus variant="contained" sx={buttonStyles.buttonsubmit} onClick={(e) => delBrand(brandid)}>
            {' '}
            OK{' '}
          </Button>
        </DialogActions>
      </Dialog>
      <Box>
        <Dialog open={isInfoOpenImage} onClose={handleCloseInfoImage} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="sm" fullWidth={true}>
          <DialogContent sx={{ textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">Once Check the Document by clicking Preview button while Saving/Printing the Document whether it's perfectly alligned</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseInfoImage} sx={buttonStyles.btncancel}>
              Cancel
            </Button>
            <LoadingButton sx={buttonStyles.buttonsubmit} loading={btnload} autoFocus variant="contained" color="primary" onClick={(e) => generatePDFs(e)}>
              {' '}
              Submit{' '}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
      <Box>
        <Dialog open={isInfoOpenImageManual} onClose={handleCloseInfoImageManual} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="sm" fullWidth={true}>
          <DialogContent sx={{ textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">Once Check the Document by clicking Preview button while Saving/Printing the Document whether it's perfectly alligned</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseInfoImageManual} sx={buttonStyles.btncancel}>
              Cancel
            </Button>
            <LoadingButton sx={buttonStyles.buttonsubmit} loading={btnload} autoFocus variant="contained" color="primary" onClick={(e) => sendRequestManual(e)}>
              {' '}
              Submit{' '}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
      <Box>
        <Dialog open={isInfoOpenImagePrint} onClose={handleCloseInfoImagePrint} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="sm" fullWidth={true}>
          <DialogContent sx={{ textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">Once Check the Document by clicking Preview button while Saving/Printing the Document whether it's perfectly alligned</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseInfoImagePrint} sx={buttonStyles.btncancel}>
              Cancel
            </Button>
            <LoadingButton loading={buttonLoading} autoFocus variant="contained" color="primary" onClick={(e) => downloadPdfTesdt(indexViewQuest - 1)}>
              {' '}
              Download{' '}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
      <Box>
        <Dialog open={previewManual} onClose={handleClosePreviewManual} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="sm" fullWidth={true}>
          <DialogContent sx={{ textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">
              {`This Template has  page mode of ${templateCreationValue?.pagemode} but provided is
            ${templateCreationValue?.pagemode === 'Single Page' ? 'more than expected' : 'not sufficient'}  to print documents`}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePreviewManual} sx={userStyle.btncancel}>
              Change
            </Button>
            <LoadingButton loading={buttonLoading} autoFocus variant="contained" color="primary" onClick={(e) => handleOpenPreviewManualfunc()}>
              {' '}
              View{' '}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
      <Box>
        <Dialog open={isInfoOpenImagePrintManual} onClose={handleCloseInfoImagePrintManual} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="sm" fullWidth={true}>
          <DialogContent sx={{ textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">Once Check the Document by clicking Preview button while Saving/Printing the Document whether it's perfectly alligned</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseInfoImagePrintManual} sx={buttonStyles.btncancel}>
              Cancel
            </Button>
            <LoadingButton loading={buttonLoading} autoFocus variant="contained" color="primary" onClick={(e) => downloadPdfTesdtManual(e)}>
              {' '}
              Download{' '}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
      <Box>
        <Dialog open={openDialogManual} onClose={handleCloseManualCheck} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="sm" fullWidth={true}>
          <DialogContent sx={{ textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">Manual User's List</Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Date</Typography>
                  {/* <Typography>{moment(documentPreparationEdit.date).format("DD-MM-YYYY")}</Typography> */}
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Reference No</Typography>
                  {/* <Typography>{documentPreparationEdit.referenceno}</Typography> */}
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Template No</Typography>
                  {/* <Typography>{documentPreparationEdit.templateno}</Typography> */}
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Template</Typography>
                  {/* <Typography>{documentPreparationEdit.template}</Typography> */}
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseManualCheck} sx={buttonStyles.btncancel}>
              Cancel
            </Button>
            <LoadingButton
              loading={buttonLoading}
              autoFocus
              variant="contained"
              color="primary"
            // onClick={(e) => downloadPdfTesdt(e)}
            >
              {' '}
              Download
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
      {/* view model */}
      <Dialog open={openview} onClose={handleClickOpenview} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="lg" fullWidth={true} sx={{ marginTop: '80px' }}>
        <Box sx={{ padding: '20px 50px' }}>
          <>
            <Typography sx={userStyle.HeaderText}>
              {' '}
              <b>View Employee Document Preparation</b>
            </Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Date</Typography>
                  <Typography>{moment(documentPreparationEdit.date).format('DD-MM-YYYY')}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Reference No</Typography>
                  <Typography>{documentPreparationEdit.referenceno}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Template No</Typography>
                  <Typography>{documentPreparationEdit.templateno}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Template</Typography>
                  <Typography>{documentPreparationEdit.template}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Employee Mode</Typography>
                  <Typography>{documentPreparationEdit.employeemode}</Typography>
                </FormControl>
              </Grid>
              {documentPreparationEdit.branch === 'Please Select Branch' ? (
                <>
                  {' '}
                  <Grid item md={6} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography variant="h6">Department</Typography>
                      <Typography>{documentPreparationEdit.department}</Typography>
                    </FormControl>
                  </Grid>
                </>
              ) : (
                ''
              )}
              {documentPreparationEdit.department === 'Please Select Department' ? (
                <>
                  {' '}
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography variant="h6">Company</Typography>
                      <Typography>{documentPreparationEdit.company}</Typography>
                    </FormControl>
                  </Grid>
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography variant="h6">Branch</Typography>
                      <Typography>{documentPreparationEdit.branch}</Typography>
                    </FormControl>
                  </Grid>
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography variant="h6">Unit</Typography>
                      <Typography>{documentPreparationEdit.unit === 'Please Select Unit' ? '' : documentPreparationEdit.unit}</Typography>
                    </FormControl>
                  </Grid>
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography variant="h6">Team</Typography>
                      <Typography>{documentPreparationEdit.team === 'Please Select Team' ? '' : documentPreparationEdit.team}</Typography>
                    </FormControl>
                  </Grid>
                </>
              ) : (
                ''
              )}

              {documentPreparationEdit.person && (
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Person</Typography>
                    <Typography>{documentPreparationEdit.person}</Typography>
                  </FormControl>
                </Grid>
              )}
              {documentPreparationEdit.issuingauthority === 'Please Select Issuing Authority' ? (
                ''
              ) : (
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Issuing Authority</Typography>
                    <Typography>{documentPreparationEdit.issuingauthority}</Typography>
                  </FormControl>
                </Grid>
              )}
              {documentPreparationEdit?.sealing !== 'Document' && documentPreparationEdit?.sealing !== '' && documentPreparationEdit?.sealing !== 'Please Select Seal' && (
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Seal</Typography>
                    <Typography>{documentPreparationEdit.sealing}</Typography>
                  </FormControl>
                </Grid>
              )}
              {documentPreparationEdit.sign !== 'Document' && documentPreparationEdit.sign !== '' && documentPreparationEdit.sign !== 'Please Select Signature' && (
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Signature</Typography>
                    <Typography>{documentPreparationEdit.sign}</Typography>
                  </FormControl>
                </Grid>
              )}

              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Document Need</Typography>
                  <Typography>{documentPreparationEdit.documentneed}</Typography>
                </FormControl>
              </Grid>

              <Grid item md={12} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Document</Typography>

                  <ReactQuillAdvanced
                    agenda={documentPreparationEdit.document}
                    setAgenda={undefined}
                    disabled={true}
                    selectedMargin={selectedMarginEdit}
                    setSelectedMargin={setSelectedMarginEdit}
                    pageSize={pageSizeQuillEdit}
                    setPageSize={setPageSizeQuillEdit}
                    pageOrientation={pageOrientationEdit}
                    setPageOrientation={setPageOrientationEdit}
                  />

                  <ReactQuill
                    readOnly
                    style={{ height: 'max-content', minHeight: '150px' }}
                    value={documentPreparationEdit.document}
                    modules={{
                      toolbar: [
                        [{ header: '1' }, { header: '2' }, { font: [] }],
                        [{ direction: 'rtl' }],
                        [{ size: [] }],

                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{ align: [] }],
                        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                        ['link', 'image', 'video'],
                        ['clean'],
                      ],
                    }}
                    formats={['header', 'font', 'size', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'align', 'list', 'bullet', 'indent', 'link', 'image', 'video']}
                  />
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br /> <br />
            <br /> <br />
            <br />
            <Grid container spacing={2} sx={{ marginLeft: '3px' }}>
              <Button sx={buttonStyles.btncancel} variant="contained" color="primary" onClick={handleCloseview}>
                Back
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>
      {/* Bulk delete ALERT DIALOG */}
      <Dialog open={isDeleteOpenalert} onClose={handleCloseModalert} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '70px', color: 'orange' }} />
          <Typography variant="h6" sx={{ color: 'black', textAlign: 'center' }}>
            Please Select any Row
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button sx={buttonStyles.buttonsubmit} autoFocus variant="contained" onClick={handleCloseModalert}>
            {' '}
            OK{' '}
          </Button>
        </DialogActions>
      </Dialog>
      <Box>
        <Dialog open={isDeleteOpencheckbox} onClose={handleCloseModcheckbox} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '80px', color: 'orange' }} />
            <Typography variant="h5" sx={{ color: 'red', textAlign: 'center' }}>
              Are you sure?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModcheckbox} sx={buttonStyles.btncancel}>
              Cancel
            </Button>
            <Button sx={buttonStyles.buttonsubmit} autoFocus variant="contained" onClick={(e) => delAreagrpcheckbox(e)}>
              {' '}
              OK{' '}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* Bulk delete ALERT DIALOG */}
      <Dialog open={isDeleteBulkOpenalert} onClose={handleCloseModalert} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '70px', color: 'orange' }} />
          <Typography variant="h6" sx={{ color: 'black', textAlign: 'center' }}>
            Please Select any Row
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button sx={buttonStyles.buttonsubmit} autoFocus variant="contained" onClick={handleCloseBulkModalert}>
            {' '}
            OK{' '}
          </Button>
        </DialogActions>
      </Dialog>
      <Box>
        <Dialog open={isDeleteOpenBulkcheckbox} onClose={handleCloseBulkModcheckbox} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '80px', color: 'orange' }} />
            <Typography variant="h5" sx={{ color: 'red', textAlign: 'center' }}>
              Are you sure you want print all ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBulkModcheckbox} sx={buttonStyles.btncancel}>
              Cancel
            </Button>
            <LoadingButton sx={buttonStyles.buttonsubmit} loading={bulkPrintStatus} autoFocus variant="contained" onClick={(e) => handleClickOpenLetterHeader('Bulk Print')}>
              {' '}
              OK{' '}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
      <Box>
        <Dialog
          open={isOpenLetterHeadPopup}
          onClose={handleClickCloseLetterHead}
          maxWidth="md"
          fullWidth={true}
          sx={{
            overflow: 'visible',
            '& .MuiPaper-root': {
              overflow: 'visible',
            },
            marginTop: '50px',
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <Box sx={{ padding: '20px 50px' }}>
            <>
              <Typography sx={userStyle.HeaderText}>View Letter Header Options</Typography>
              <br /> <br />
              <Grid container spacing={2}>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Print Option<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      maxMenuHeight={300}
                      options={HeaderDropDowns}
                      value={{ label: headerOptions, value: headerOptions }}
                      onChange={(e) => {
                        setHeaderOptions(e.value);
                        setSelectedHeadOpt([]);
                        setHeadValue([]);
                        setHeader('');
                        setfooter('');
                        setCheckingArray((prevArray) =>
                          prevArray.map((item, ind) =>
                            ind === indexViewQuest - 1
                              ? {
                                ...item,
                                header: '',
                                footer: '',
                              }
                              : item
                          )
                        );
                      }}
                    />
                  </FormControl>
                </Grid>
                {headerOptions === 'With Letter Head' && (
                  <Grid item md={headerOptions === 'With Letter Head' ? 4 : 3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        With Letter Head <b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <MultiSelect maxMenuHeight={300} options={WithHeaderOptions} value={selectedHeadOpt} onChange={handleHeadChange} valueRenderer={customValueRenderHeadFrom} />
                    </FormControl>
                  </Grid>
                )}
              </Grid>
              <br />
              <br /> <br />
              <br />
              <Grid container spacing={2} sx={{ marginLeft: '3px' }}>
                <Grid item md={4} xs={12} sm={12}>
                  <LoadingButton
                    loading={HeaderOptionsButton}
                    sx={buttonStyles.buttonsubmit}
                    autoFocus
                    variant="contained"
                    onClick={(e) => {
                      if (pagePopeOpen === 'Preview') {
                        handlePreviewDocument(indexViewQuest - 1);
                      } else if (pagePopeOpen === 'Preview Manual') {
                        handlePreviewDocumentManual();
                      } else if (pagePopeOpen === 'Print Manual') {
                        handlePrintDocumentManual();
                      } else if (pagePopeOpen === 'Print') {
                        handlePrintDocument(indexViewQuest - 1);
                      } else if (pagePopeOpen === 'Table View') {
                        downloadPdfTesdtTable(DataTableId);
                      } else if (pagePopeOpen === 'Table Print') {
                        downloadPdfTesdtTablePrint(DataTableId);
                      } else if (pagePopeOpen === 'Bulk Print') {
                        handleBulkPrint();
                      } else if (pagePopeOpen === 'Email') {
                        fetchEmailForUser(emailValuePage?.id, emailValuePage?.convert, emailValuePage?.fromemail, emailValuePage?.ccemail, emailValuePage?.bccemail);
                      }
                    }}
                  >
                    {' '}
                    OK{' '}
                  </LoadingButton>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <Button onClick={handleClickCloseLetterHead} sx={buttonStyles.btncancel}>
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>
      {/* EXTERNAL COMPONENTS -------------- START */}
      {/* VALIDATION */}
      <MessageAlert openPopup={openPopupMalert} handleClosePopup={handleClosePopupMalert} popupContent={popupContentMalert} popupSeverity={popupSeverityMalert} />
      {/* SUCCESS */}
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
        itemsTwo={items ?? []}
        filename={'Employee Document Preparation'}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
      <InfoPopup openInfo={openInfo} handleCloseinfo={handleCloseinfo} heading="Employee Document Preparation Info" addedby={addedby} updateby={updateby} />
      <Dialog
        open={openOTPView}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        fullWidth={true}
        sx={{
          zIndex: 6000, // Ensure the Dialog itself has a high z-index
        }}
        disableBackdropClick
      >
        <Box
          sx={{
            padding: '10px 15px',
            textAlign: 'center',
            alignItems: 'center',
          }}
        >
          <>
            <DialogContent>
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} display="flex" justifyContent="center">
                  <PinIcon
                    sx={{
                      fontSize: '100px',
                      color: '#FAC921',
                      textAlign: 'center',
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                </Grid>
                <Grid item xs={12} display="flex" justifyContent="center">
                  <FormControl sx={{ width: '100%', maxWidth: '300px', textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="#FAC921" gutterBottom>
                      Enter Two Factor OTP
                      <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => {
                        const enteredValue = e.target.value.replace(/\D/, '');
                        if (/^\d{0,6}$/.test(enteredValue)) {
                          setOtp(enteredValue);
                        }
                      }}
                      inputProps={{
                        maxLength: 6,
                      }}
                      sx={{
                        borderRadius: '10px',
                        backgroundColor: '#fff',
                        '& .MuiOutlinedInput-input': {
                          fontSize: '15px',
                          textAlign: 'center',
                          letterSpacing: '5px',
                        },
                      }}
                    />
                    {error && <Typography sx={{ color: 'red', fontSize: '0.9rem', marginTop: '10px' }}>{error}</Typography>}
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                color="primary"
                // size="small"
                onClick={verifyOtp}
              >
                Verify
              </Button>
              {/* {pendingApproval?.every(data => data?.remainingDays >= 1) && */}
              <Button
                onClick={() => {
                  handlViewCloseOTP();
                  setOtp('');
                  setError('');
                }}
                variant="contained"
                color="error"
                sx={buttonStyles?.btncancel}
              >
                Cancel
              </Button>
              {/* } */}
            </DialogActions>
          </>
        </Box>
      </Dialog>
      <Box
        ref={hiddenRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          // visibility: 'hidden', // still renderable by html2canvas
        }}
      >
        <Box sx={{
          py: 8,   // top & bottom padding
          px: 15,  // left & right padding,
          borderRadius: '6px', background: 'white'
        }}>
          <Typography sx={{ ...userStyle.HeaderText, fontSize: '21px' }}>
            {viewData.employeename}
          </Typography>
          <Table>
            <TableHead sx={{ background: '#f5f5f6', border: '1px solid #c3c3c982' }}>
              <TableCell sx={{ ...tableStyles, fontFamily: 'auto', fontSize: '19px !important' }}>{'Component'}</TableCell>
              <TableCell sx={{ ...tableStyles, fontFamily: 'auto', fontSize: '19px !important' }}> {'Amount'}</TableCell>
            </TableHead>
            <TableBody sx={{ border: '1px solid #dbdbdf', fontSize: '16px' }}>
              <TableRow>
                <StyledTableCell sx={tableStyles}>{'Basic Salary'}</StyledTableCell>
                <StyledTableCell sx={tableStylesVales}> ₹ {viewData.basic || "0.00"}</StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={tableStyles}>{'House Rent Allowance (HRA)'}</StyledTableCell>
                <StyledTableCell sx={tableStylesVales}> ₹ {viewData.hra || "0.00"}</StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={tableStyles}>{'Conveyance Allowance'}</StyledTableCell>
                <StyledTableCell sx={tableStylesVales}> ₹ {viewData.conveyance || "0.00"}</StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={tableStyles}>{'Medical Allowance'}</StyledTableCell>
                <StyledTableCell sx={tableStylesVales}> ₹ {viewData.medicalallowance || "0.00"}</StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={tableStyles}>{'Production Allowance'}</StyledTableCell>
                <StyledTableCell sx={tableStylesVales}> ₹ {viewData.productionallowance || "0.00"}</StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={tableStyles}>{'Other Allowance'}</StyledTableCell>
                <StyledTableCell sx={tableStylesVales}> ₹ {viewData.otherallowance || "0.00"}</StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={tableStyles}>{'Performance Incentive (Optional)'}</StyledTableCell>
                <StyledTableCell sx={tableStylesVales}> ₹ {'0.00'}</StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={tableStyles}>{'Gross Monthly Salary'}</StyledTableCell>
                <StyledTableCell sx={{ ...tableStylesVales, fontSize: '18px !IMPORTANT', fontWeight: 600, color: '#595656' }}> ₹ {viewData.gross || "0.00"}</StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={tableStyles}>{'Annual CTC'}</StyledTableCell>
                <StyledTableCell sx={{ ...tableStylesVales, fontSize: '18px !IMPORTANT', fontWeight: 600, color: '#595656' }}> ₹ {viewData.annualgrossctc || "0.00"}</StyledTableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Box>
      <Dialog open={progressOpen} maxWidth="md" fullWidth={false} PaperProps={{ style: progressDialogStyles.dialogPaper }}>
        <DialogTitle style={progressDialogStyles.dialogTitle}>📄 Checking Documents for Page Mode...</DialogTitle>
        <DialogContent>
          <p style={progressDialogStyles.checkingText}>
            Checking: <span style={progressDialogStyles.highlightText}>{currentFile}</span>
          </p>
          <div style={progressDialogStyles.progressBarContainer}>
            <LinearProgress variant="determinate" value={progressValue} style={progressDialogStyles.progressBar} />
          </div>
          <p style={progressDialogStyles.percentageText}>{Math.round(progressValue)}% Completed</p>
        </DialogContent>
      </Dialog>
      <br />
      <Loader loading={loading} message={loadingMessage} />
      <Loader loading={loadingAttMonth} message={loadingMessageAttMonth} />
      <Loader loading={loadingAttDate} message={loadingMessageAttDate} />
      <Loader loading={loadingProdDate} message={loadingMessageProdDate} />
      <Loader loading={loadingPreviewData} message={loadingPreviewMessage} />
      <Loader loading={loadingPreviewManualData} message={loadingPreviewMessage} />
      <Loader loading={loadingPrintData} message={loadingPrintMessage} />
      <Loader loading={loadingPrintManualData} message={loadingPrintMessage} />
      <Loader loading={loadingGeneratingDatas} message={loadingGeneratingMessages} />
      <Loader loading={savingDatas} message={savingDatasMessage} />
    </Box>
  );
}

export default DocumentPreparation;
