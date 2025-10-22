import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Box,
  Typography,
  OutlinedInput,
  FormGroup,
  InputLabel,
  Dialog,
  DialogContent,
  TableRow,
  DialogTitle,
  TableCell,
  Select,
  Checkbox,
  Tooltip,
  DialogActions,
  FormControl,
  Grid,
  TextareaAutosize,
  Paper,
  Divider,
  Table,
  TableHead,
  TableContainer,
  Button,
  TableBody,
  MenuItem,
  TextField,
  List,
  ListItem,
  ListItemText,
  Popover,
  IconButton,
  Modal,
  InputAdornment,
  Backdrop,
} from '@mui/material';
import * as faceapi from 'face-api.js';
import { ThreeDots } from 'react-loader-spinner';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { userStyle } from '../../../pageStyle';
import { handleApiError } from '../../../components/Errorhandling';
import StyledDataGrid from '../../../components/TableStyle';
import { StyledTableRow, StyledTableCell } from '../../../components/Table';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import FormControlLabel from '@mui/material/FormControlLabel';
import { SERVICE } from '../../../services/Baseservice';
import { Link, useNavigate } from 'react-router-dom';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import axios from '../../../axiosInstance';
import Selects from 'react-select';
import { AiOutlineClose } from 'react-icons/ai';
import { FaPlus, FaEdit } from 'react-icons/fa';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import 'jspdf-autotable';
import { Country, State, City } from 'country-state-city';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import 'react-image-crop/dist/ReactCrop.css';
import '../employees/MultistepForm.css';
import { FaArrowAltCircleRight } from 'react-icons/fa';
import { UserRoleAccessContext, AuthContext } from '../../../context/Appcontext';
import debounce from 'lodash.debounce';
import AlertDialog from '../../../components/Alert';
import MessageAlert from '../../../components/MessageAlert';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import Headtitle from '../../../components/Headtitle';
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import { MultiSelect } from 'react-multi-select-component';
import moment from 'moment';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import { DataGrid } from '@mui/x-data-grid';
import { styled } from '@mui/system';
import Resizable from 'react-resizable';
import { saveAs } from 'file-saver';
import Switch from '@mui/material/Switch';
import html2canvas from 'html2canvas';
import LoadingButton from '@mui/lab/LoadingButton';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ExistingProfileVisitor from '../../interactors/visitors/ExistingProfileVisitor';
import Webcamimage from '../../../components/webCamWithDuplicate';
import { ConfirmationPopup, DeleteConfirmation } from '../../../components/DeleteConfirmation';
import FullAddressCard from '../../../components/FullAddressCard.js';
import PincodeButton from '../../../components/PincodeButton.js';
import { getPincodeDetails } from '../../../components/getPincodeDetails';
import HiConnectComponentCreate from '../employees/HiConnectComponentCreate.js';
import uploadEmployeeDocuments from '../../../components/CommonMulterFunction.js';
import { menuItems } from '../../../components/menuItemsList';
import SalaryTable from '../recruitment/SalaryTable.js';
import { accounttypes } from '../../../components/Componentkeyword';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import DocumentScannerComponent from '../recruitment/DocumentScannerComponent.js';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { BASE_URL } from '../../../services/Authservice';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';
import { religionOptions, address_type, permanent_address_type, personal_prefix, landmark_and_positional_prefix, candidate_educational_upload_status, experience_document_type } from '../../../components/Componentkeyword';
import salaryTableFunction from '../../../components/SalaryTableFunction.js';
import TodosAccordion from '../recruitment/TodosAccordion.js';
// const { generatePassword,validatePassword } = require("../../../components/passwordGenerator");
import { generatePassword, validatePassword } from '../../../components/passwordGenerator';
import BiometricForm from '../employees/BiometricForm.js';

function calculateLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Calculate luminance using the formula
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // If luminance is greater than 128, it's a light color
  return luminance > 128;
}

function RejoinInternCreate() {
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  const [employee, setEmployee] = useState({
    wordcheck: false,
    autogeneratepassword: false,
    ifoffice: false,
    type: 'Please Select Type',
    salaryrange: 'Please Select Salary Range',
    prefix: 'Mr',
    firstname: '',
    lastname: '',
    legalname: '',
    callingname: '',
    shifttype: 'Please Select Shift Type',
    shiftmode: 'Please Select Shift Mode',
    shiftgrouping: 'Please Select Shift Grouping',
    shifttiming: 'Please Select Shift',
    fathername: '',
    mothername: '',
    username: '',
    gender: '',
    maritalstatus: '',
    dom: '',
    dob: '',
    bloodgroup: '',
    religion: '',
    profileimage: '',
    location: '',
    email: '',
    companyemail: '',
    contactpersonal: '',
    contactfamily: '',
    emergencyno: '',
    doj: '',
    dot: '',
    name: '',
    contactno: '',
    details: '',
    password: '',
    companyname: '',
    workstation: '',
    area: '',
    pdoorno: '',
    pstreet: '',
    parea: '',
    plandmark: '',
    ptaluk: '',
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
    ppost: '',
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
    floor: '',
    department: '',
    attOptions: [],
    team: '',
    designation: '',
    employeecount: '',
    pgenerateviapincode: true,
    pvillageorcity: '',
    pdistrict: '',
    cgenerateviapincode: true,
    cvillageorcity: '',
    cdistrict: '',
    reportingto: '',
    empcode: '',
    remark: '',
    aadhar: '',
    panno: '',
    panstatus: 'Have PAN',
    panrefno: '',
    draft: '',
    status: '',
    statuss: false,
    percentage: '',
    intStartDate: '',
    intCourse: '',
    intEndDate: '',
    modeOfInt: '',
    intDuration: '',
    bankname: 'ICICI BANK - ICICI',
    bankbranchname: '',
    accountholdername: '',
    accountnumber: '',
    ifsccode: '',
    weekoff: '',
    enquirystatus: 'Please Select Status',
    workmode: 'Internship',

    //newly added
    categoryedu: 'Please Select Category',
    subcategoryedu: 'Please Select Sub Category',
    specialization: 'Please Select Specialization',
    accounttype: 'Please Select Account Type',
    accountstatus: 'In-Active',
    // starttime: currentDateTime.toTimeString().split(" ")[0],
    enddate: 'present',
    endtime: 'present',
    time: getCurrentTime(),
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
  const [createHiConnect, setCreateHiConnect] = useState({
    createhiconnect: false,
    hiconnectemail: '',
    hiconnectroles: [
      {
        label: 'channel_user',
        value: 'channel_user',
      },
    ],
  });
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
  const backPage = useNavigate();
  const [popup, setPopup] = useState({
    open: false,
    action: '',
  });

  const handleOpenConfirmationPopup = (action) => {
    setPopup({
      open: true,
      action,
    });
  };

  const [switchValues, setSwicthValues] = useState({
    educationInstitution: false,
    additionalInstitution: false,
    workDesignation: false,
    employer: false,
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

  const handleCloseConfirmationPopup = () => {
    setPopup({ open: false, action: '' });
  };

  const handleConfirm = (e) => {
    handleCloseConfirmationPopup();
    if (popup.action === 'submit') {
      console.log('Submitting...');
      handleButtonClickLast(e);
    } else if (popup.action === 'draft') {
      console.log('Saving as draft...');
      handleDraftSubmit(e);
    } else if (popup.action === 'cancel') {
      console.log('Cancelling...');
      backPage('/internlist');
    }
  };
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
  const currentYear = new Date().getFullYear();
  const maxDate = `${currentYear - 16}-12-31`;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [empcodelimited, setEmpCodeLimited] = useState([]);
  const [selectedBranchstatus, setSelectedBranchstatus] = useState(false);
  const [monthSets, setMonthsets] = useState([]);
  const [isArea, setIsArea] = useState(false);

  const [selectedBranchCode, setSelectedBranchCode] = useState('');
  const [selectedUnitCode, setSelectedUnitCode] = useState('');
  const [salaryfix, setSalaryFix] = useState([]);

  const Typeoptions = [
    { label: 'Amount Wise', value: 'Amount Wise' },
    { label: 'Process Wise', value: 'Process Wise' },
  ];

  const salaryrangeoptions = [
    { label: 'Less Than', value: 'Less Than' },
    { label: 'Greater Than', value: 'Greater Than' },
    { label: 'Between', value: 'Between' },
    { label: 'Exact', value: 'Exact' },
  ];

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

  //Edit model...
  const [isEditOpen, setIsEditOpen] = useState(false);
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
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

  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setEmployee({
      ...employee,
      type: 'Please Select Type',
      salaryrange: 'Please Select Salary Range',
      amountvalue: '',
      from: '',
      to: '',
    });

    setIsArea(false);
    setLoginNotAllot({
      ...loginNotAllot,
      process: 'Please Select Process',
    });

    setSalaryFix([]);
    setIsEditOpen(false);
  };

  const handleCloseModEditAllot = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setEmployee({
      ...employee,
      type: 'Please Select Type',
      salaryrange: 'Please Select Salary Range',
      amountvalue: '',
      from: '',
      to: '',
    });
    setIsArea(false);
    setSalaryFix([]);
    setIsEditOpen(false);
  };

  const gridRef = useRef(null);

  const [selectedRows, setSelectedRows] = useState([]);
  const extractNumbers = (str) => {
    const numbers = str?.match(/\d+/g);
    return numbers ? numbers.map(Number) : [];
  };

  const [searchQueryManage, setSearchQueryManage] = useState('');

  const [copiedData, setCopiedData] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
  };

  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
  const idopen = open ? 'simple-popover' : undefined;

  const getRowClassName = (params) => {
    if (selectedRows.includes(params.row.id)) {
      return 'custom-id-row'; // This is the custom class for rows with item.tat === 'ago'
    }
    return ''; // Return an empty string for other rows
  };

  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    serialNumber: true,
    totalValue: true,
    // checkbox: true,
    experience: true,
    salarycode: true,
    targetpoints: true,
    statusallot: true,
    actions: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  const extractText = (str) => {
    return str.replace(/\d+/g, '');
  };

  //table entries ..,.
  const [items, setItems] = useState([]);

  const addSerialNumber = () => {
    const itemsWithSerialNumber = salaryfix?.map((item, index) => ({
      ...item,
      experience: extractNumbers(item.salarycode),
      code: extractText(item.salarycode),
      serialNumber: index + 1,
    }));
    setItems(itemsWithSerialNumber);
  };

  useEffect(() => {
    addSerialNumber();
  }, [salaryfix]);

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
      field: 'checkbox',
      headerName: 'Checkbox', // Default header name
      headerStyle: {
        fontWeight: 'bold', // Apply the font-weight style to make the header text bold
        // Add any other CSS styles as needed
      },
      renderHeader: (params) => (
        <CheckboxHeader
          selectAllChecked={selectAllChecked}
          onSelectAll={() => {
            if (rowDataTable.length === 0) {
              // Do not allow checking when there are no rows
              return;
            }
            if (selectAllChecked) {
              setSelectedRows([]);
            } else {
              const allRowIds = rowDataTable.map((row) => row.id);
              setSelectedRows(allRowIds);
            }
            setSelectAllChecked(!selectAllChecked);
          }}
        />
      ),

      renderCell: (params) => (
        <Checkbox
          checked={selectedRows.includes(params.row.id)}
          onChange={() => {
            let updatedSelectedRows;
            if (selectedRows.includes(params.row.id)) {
              updatedSelectedRows = selectedRows.filter((selectedId) => selectedId !== params.row.id);
            } else {
              updatedSelectedRows = [...selectedRows, params.row.id];
            }

            setSelectedRows(updatedSelectedRows);

            // Update the "Select All" checkbox based on whether all rows are selected
            setSelectAllChecked(updatedSelectedRows.length === filteredData.length);
          }}
        />
      ),
      sortable: false, // Optionally, you can make this column not sortable
      width: 90,

      hide: !columnVisibility.checkbox,
      headerClassName: 'bold-header',
    },
    {
      field: 'serialNumber',
      headerName: 'SNo',
      flex: 0,
      width: 90,
      hide: !columnVisibility.serialNumber,
      headerClassName: 'bold-header',
    },
    {
      field: 'totalValue',
      headerName: 'Salary Amount',
      flex: 0,
      width: 100,
      hide: !columnVisibility.totalValue,
      headerClassName: 'bold-header',
    },
    {
      field: 'experience',
      headerName: 'Experience',
      flex: 0,
      width: 200,
      hide: !columnVisibility.experience,
      headerClassName: 'bold-header',
    },
    {
      field: 'salarycode',
      headerName: 'Process Code',
      flex: 0,
      width: 200,
      hide: !columnVisibility.salarycode,
      headerClassName: 'bold-header',
    },
    {
      field: 'targetpoints',
      headerName: 'Target Points',
      flex: 0,
      width: 200,
      hide: !columnVisibility.targetpoints,
      headerClassName: 'bold-header',
    },

    {
      field: 'statusallot',
      headerName: 'Status',
      flex: 0,
      width: 250,
      minHeight: '40px !important',
      sortable: false,
      hide: !columnVisibility.statusallot,
      headerClassName: 'bold-header',
      renderCell: (params) => (
        <Grid sx={{ display: 'flex' }}>
          <Button
            variant="contained"
            onClick={() => {
              getCode(params.row.totalValue, params.row.code, params.row.experience, params.row.targetpoints, params.row);
            }}
          >
            Allot
          </Button>
        </Grid>
      ),
    },
  ];

  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item._id,
      serialNumber: item.serialNumber,
      totalValue: item.totalValue,
      experience: item.experience,
      salarycode: item.salarycode,
      targetpoints: item.targetPointsValue,
      code: item.code,

      basic: item?.basic || 0,
      hra: item?.hra || 0,
      conveyance: item?.conveyance || 0,
      medicalallowance: item?.medicalallowance || 0,
      producationallowance: item?.producationallowance || 0,
      producationallowancetwo: item?.producationallowancetwo || 0,
      otherallowance: item?.otherallowance || 0,
      performanceincentive: item?.performanceincentive || 0,
      shiftallowance: item?.shiftallowance || 0,
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

  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');

  const [selectedWorkStation, setSelectedWorkStation] = useState('');
  const [selectedOptionsWorkStation, setSelectedOptionsWorkStation] = useState([]);
  let [valueWorkStation, setValueWorkStation] = useState('');

  const timer = useRef();

  let today = new Date();

  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  let formattedDate = yyyy + '-' + mm + '-' + dd;

  const buttonSx = {
    ...(success && {
      bgcolor: green[500],
      '&:hover': {
        bgcolor: green[700],
      },
    }),
  };

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);
  const [accessibleErrors, setAccessibleErrors] = useState({});
  const handleButtonClick = (e) => {
    e.preventDefault();
    const newErrorsLog = {};
    const missingFieldsthree = [];

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

    const exists = bankTodo.some((obj, index, arr) => arr.findIndex((item) => item.accountnumber === obj.accountnumber) !== index);

    const activeexists = bankTodo.filter((data) => data.accountstatus === 'Active');

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
      missingFieldsthree.push('Only one active account is allowed');
    }

    if (salaryOption === 'Experience Based' && (loginNotAllot.process === 'Please Select Process' || loginNotAllot.process === '' || loginNotAllot.process == undefined)) {
      newErrorsLog.process = <Typography style={{ color: 'red' }}>Process must be required</Typography>;
      missingFieldsthree.push('Process');
    }
    if (salaryOption === 'Experience Based' && (loginNotAllot.time === 'Hrs' || loginNotAllot.timemins === 'Mins' || (loginNotAllot.time === '00' && loginNotAllot.timemins === '00'))) {
      newErrorsLog.duration = <Typography style={{ color: 'red' }}>Duration must be required</Typography>;
      missingFieldsthree.push('Duration');
    }
    if (salaryOption === 'Experience Based' && (assignExperience.assignExpMode === 'Add' || assignExperience.assignExpMode === 'Minus' || assignExperience.assignExpMode === 'Fix') && !assignExperience.assignExpvalue) {
      newErrorsLog.assignexpvalue = <Typography style={{ color: 'red' }}>Please Enter Value</Typography>;
      missingFieldsthree.push('Exp Log Details');
    }
    if (salaryOption !== 'Experience Based' && (formValue.startDate === '' || formValue.startDate === 'Please Select Date' || !formValue.startDate)) {
      newErrorsLog.startdate = <Typography style={{ color: 'red' }}>Date must be required</Typography>;
      missingFieldsthree.push('Date');
    }

    if (salaryOption !== 'Experience Based' && salarySetUpForm.mode === 'Manual' && formValue.gross === '') {
      newErrorsLog.grosssalary = <Typography style={{ color: 'red' }}>Please Enter Gross amount</Typography>;
    }

    setAccessibleErrors(newErrorsLog);

    // If there are missing fields, show an alert with the list of them
    if (missingFieldsthree.length > 0) {
      setPopupContentMalert(`Please fill in the following fields: ${missingFieldsthree.join(', ')}`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      if (Object.keys(newErrorsLog).length === 0 && (bankTodo?.length === 0 || (bankTodo?.length > 0 && areAllObjectsValid(bankTodo) && !exists))) {
        setStep(step + 1);
      }
    }
  };

  const handleButtonClickSeven = (e) => {
    e.preventDefault();
    const newErrorsLog = {};
    const missingFieldsthree = [];

    const accessibleTodoexists = accessibleTodo.some((obj, index, arr) => arr.findIndex((item) => item.fromcompany === obj.fromcompany && item.frombranch === obj.frombranch && item.fromunit === obj.fromunit) !== index);
    if (accessibleTodo?.length === 0) {
      setPopupContentMalert('Please Add Accessible Company/Branch/Unit!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
      newErrorsLog.accessiblecompany = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
      missingFieldsthree.push('Accessible Company/Branch/Unit');
    } else if (
      accessibleTodo?.some(
        (data) => data?.fromcompany === 'Please Select Company' || data?.frombranch === 'Please Select Branch' || data?.fromunit === 'Please Select Unit' || data?.fromcompany === '' || data?.frombranch === '' || data?.fromunit === '' || !data?.fromcompany || !data?.frombranch || !data?.fromunit
      )
    ) {
      setPopupContentMalert('Please Fill All the fields in Accessible Company/Branch/Unit Todo!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
      newErrorsLog.accessiblecompany = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
      missingFieldsthree.push('Accessible Company/Branch/Unit');
    } else if (accessibleTodoexists) {
      setPopupContentMalert('Duplicate Accessible Company/Branch/Unit!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
      newErrorsLog.accessiblecompany = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
      missingFieldsthree.push('Duplicate Accessible Company/Branch/Unit');
    }
    if (createRocketChat?.create && createRocketChat?.email === '') {
      newErrorsLog.rocketchatemail = <Typography style={{ color: 'red' }}>Please Select Email</Typography>;
      missingFieldsthree.push('Connects Email');
    }
    if (createRocketChat?.create && createRocketChat?.roles?.length === 0) {
      newErrorsLog.rocketchatrole = <Typography style={{ color: 'red' }}>Please Select Role</Typography>;
      missingFieldsthree.push('Connects Role');
    }

    if (createHiConnect?.createhiconnect && createHiConnect?.hiconnectemail === '') {
      newErrorsLog.hiconnectemail = <Typography style={{ color: 'red' }}>Please Select Email</Typography>;
      missingFieldsthree.push('Hi Connect Email');
    }
    if (createHiConnect?.createhiconnect && createHiConnect?.hiconnectroles?.length === 0) {
      newErrorsLog.hiconnectroles = <Typography style={{ color: 'red' }}>Please Select Role</Typography>;
      missingFieldsthree.push('Hi Connect Role');
    }

    setAccessibleErrors(newErrorsLog);

    // If there are missing fields, show an alert with the list of them
    if (missingFieldsthree.length > 0) {
      setPopupContentMalert(`Please fill in the following fields: ${missingFieldsthree.join(', ')}`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      if (Object.keys(newErrorsLog).length === 0) {
        setStep(step + 1);
      }
    }
  };

  const handleButtonClickLast = (e) => {
    e.preventDefault();
    const newErrorsLog = {};
    const missingFieldsthree = [];
    // Biometric Conditions
    if (CheckedBiometric && !CheckedBiometricAdded && !BioPostCheckDevice) {
      setPopupContentMalert(`Please Finish the Biometric Process`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      if (Object.keys(newErrorsLog).length === 0) {
        if (!loading) {
          setSuccess(false);
          setLoading(true);
          timer.current = window.setTimeout(() => {
            setSuccess(true);
            setLoading(false);
            handleSubmitMulti(e);
            handleCommitUserBiometric(e);
          }, 4000);
        }
      }
    }
  };

  const ShiftModeOptions = [
    { label: 'Shift', value: 'Shift' },
    { label: 'Week Off', value: 'Week Off' },
  ];

  const [shifts, setShifts] = useState([]);

  const [todo, setTodo] = useState([]);
  const [editingIndexcheck, setEditingIndexcheck] = useState(-1);
  const [editTodoBackup, setEditTodoBackup] = useState(null);

  const [salSlabs, setsalSlabs] = useState([]);

  const [tarPoints, setTarpoints] = useState([]);
  //get all employees list details
  const fetchTargetpoints = async () => {
    try {
      let res_employee = await axios.get(SERVICE.TARGETPOINTS_LIMITED, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTarpoints(res_employee?.data?.targetpoints);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchSalarySlabs = async () => {
    try {
      let res_employee = await axios.get(SERVICE.SALARYSLAB_LIMITED, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setsalSlabs(res_employee?.data?.salaryslab);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

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
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please Select Weeks';
  };

  const handleAddTodo = () => {
    if (employee?.shifttype === 'Please Select Shift Type') {
      setPopupContentMalert('Please Select Shift Type!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
      return; // Stop further processing if validation fails
    } else {
      if (employee?.shifttype === 'Daily') {
        if (employee?.shiftgrouping === 'Please Select Shift Grouping') {
          setPopupContentMalert('Please Select Shift Grouping!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (employee?.shifttiming === 'Please Select Shift') {
          setPopupContentMalert('Please Select Shift!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (selectedOptionsCate.length === 0) {
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
            shiftgrouping: !valueCate.includes(day) ? employee?.shiftgrouping : '',
            shifttiming: !valueCate.includes(day) ? employee?.shifttiming : '',
          }));
          setTodo(newTodoList);
        }
      }

      if (employee?.shifttype === '1 Week Rotation') {
        if (employee?.shiftgrouping === 'Please Select Shift Grouping') {
          setPopupContentMalert('Please Select Shift Grouping!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (employee?.shifttiming === 'Please Select Shift') {
          setPopupContentMalert('Please Select Shift!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (valueCateWeeks.length === 0) {
          setPopupContentMalert('Please Select Weeks!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (selectedOptionsCate.length === 0) {
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
                  shiftgrouping: !valueCate.includes(day) ? employee?.shiftgrouping : '',
                  shifttiming: !valueCate.includes(day) ? employee?.shifttiming : '',
                }))
              : []), // Return an empty array if "1st Week" is not in valueCateWeeks

            // Check if "2nd Week" is in valueCateWeeks and map days2 if true
            ...(valueCateWeeks.includes('2nd Week')
              ? days2.map((day, index) => ({
                  day,
                  daycount: index + 8,
                  week: '2nd Week', // Replacing week2 with "2nd Week"
                  shiftmode: valueCate.includes(day) ? 'Week Off' : 'Shift',
                  shiftgrouping: !valueCate.includes(day) ? employee?.shiftgrouping : '',
                  shifttiming: !valueCate.includes(day) ? employee?.shifttiming : '',
                }))
              : []), // Return an empty array if "2nd Week" is not in valueCateWeeks
          ];

          setTodo((prev) => [...prev, ...newTodoList]);
          setValueCateWeeks([]);
          setSelectedOptionsCateWeeks([]);
        }
      }

      if (employee?.shifttype === '2 Week Rotation') {
        if (employee?.shiftgrouping === 'Please Select Shift Grouping') {
          setPopupContentMalert('Please Select Shift Grouping!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (employee?.shifttiming === 'Please Select Shift') {
          setPopupContentMalert('Please Select Shift!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (valueCateWeeks.length === 0) {
          setPopupContentMalert('Please Select Weeks!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (selectedOptionsCate.length === 0) {
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
              shiftgrouping: !valueCate.includes(day) ? employee?.shiftgrouping : '',
              shifttiming: !valueCate.includes(day) ? employee?.shifttiming : '',
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

      if (employee?.shifttype === '1 Month Rotation') {
        if (employee?.shiftgrouping === 'Please Select Shift Grouping') {
          setPopupContentMalert('Please Select Shift Grouping!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (employee?.shifttiming === 'Please Select Shift') {
          setPopupContentMalert('Please Select Shift!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (valueCateWeeks.length === 0) {
          setPopupContentMalert('Please Select Weeks!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          return; // Stop further processing if validation fails
        } else if (selectedOptionsCate.length === 0) {
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
              shiftgrouping: !valueCate.includes(day) ? employee?.shiftgrouping : '',
              shifttiming: !valueCate.includes(day) ? employee?.shifttiming : '',
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

  const [step, setStep] = useState(1);
  const { auth } = useContext(AuthContext);
  const { isUserRoleAccess, isUserRoleCompare, buttonStyles, allUsersData, workStationSystemName } = useContext(UserRoleAccessContext);
  // for status
  const statusOptions = [
    { label: 'Users Purpose', value: 'Users Purpose' },
    { label: 'Enquiry Only', value: 'Enquiry Purpose' },
  ];
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

  // for attendance mode
  const attModeOptions = [
    { label: 'Domain', value: 'Domain' },
    { label: 'Hrms-Self', value: 'Hrms-Self' },
    { label: 'Hrms-Manual', value: 'Hrms-Manual' },
    { label: 'Biometric', value: 'Biometric' },
    { label: 'Production', value: 'Production' },
  ];

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

  const [files, setFiles] = useState([]);

  const handleFileUpload = (event) => {
    const files = event.target.files;
    const maxFileSize = 1 * 1024 * 1024; // 1MB in bytes
    let showAlert = false;
    for (let i = 0; i < files.length; i++) {
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
            name: file?.name,
            preview: reader.result,
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
    setFiles((prevFiles) => prevFiles?.filter((_, i) => i !== index));
  };

  const handleRemarkChange = (index, remark) => {
    setFiles((prevFiles) => prevFiles?.map((file, i) => (i === index ? { ...file, remark } : file)));
  };

  const [errmsg, setErrmsg] = useState('');
  const [status, setStatus] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleMouseDownPassword = (event) => event.preventDefault();

  // const generatePassword = () => {
  //   let autodate = employee?.dob.split('-')
  //   let autodatetwo = `${autodate[2]}${autodate[1]}${autodate[0]}`
  //   const randomPassword = `${employee?.legalname?.toLowerCase().slice(0, 6)}@${autodatetwo}`;
  //   setEmployee({ ...employee, password: randomPassword, autogeneratepassword: true });
  // };
  // const generatePassword = () => {
  //   let autodate = employee?.dob.split('-');
  //   let autodatetwo = `${autodate[2]}${autodate[1]}${autodate[0]}`;
  //   let legalNamePart = employee?.legalname?.toLowerCase();
  //   if (legalNamePart.length > 6) {
  //     legalNamePart = legalNamePart.slice(0, 6);
  //   }
  //   const randomPassword = `${legalNamePart}@${autodatetwo}`;
  //   setEmployee({
  //     ...employee,
  //     password: randomPassword,
  //     autogeneratepassword: true,
  //   });
  // };

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    if (e.target.checked) {
      // const password = generatePassword("John", "Doe", "1990-05-12", rules);
      const rules = {
        minimumlength: overllsettings?.minimumlength || 8,
        maximumlength: overllsettings?.maximumlengh || 20,
        lowercase: overllsettings?.lowercase || 1,
        uppercase: overllsettings?.uppercase || 1,
        specialcharacter: overllsettings?.specialcharacter || 1,
      };
      const password = generatePassword(employee?.firstname, employee?.lastname, employee?.dob, rules);
      setEmployee({
        ...employee,
        password: password,
        autogeneratepassword: true,
      });
    } else {
      setEmployee({ ...employee, password: '', autogeneratepassword: false });
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    setEmployee({
      ...employee,
      type: 'Please Select Type',
      salaryrange: 'Please Select Salary Range',
      amountvalue: '',
      from: '',
      to: '',
    });
    setLoginNotAllot({
      ...loginNotAllot,
      process: 'Please Select Process',
    });
    setIsArea(false);
    setSalaryFix([]);
  };

  const location = useLocation();
  const migrateData = location.state?.migrateData;
  const rejoineddetails = location?.state?.rejoineddetails;
  const verifiedDetails = location?.state?.verifiedDetails;
  const { from, oldempid } = useParams();
  const [overallgrosstotal, setoverallgrosstotal] = useState('');
  const [modeexperience, setModeexperience] = useState('');
  const [targetexperience, setTargetexperience] = useState('');
  const [targetpts, setTargetpts] = useState('');

  const fetchUserDefaultDatas = async () => {
    let branchCode;
    try {
      const [response, req, empdocument] = await Promise.all([
        axios.get(`${SERVICE.USER_SINGLE}/${oldempid}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }),
        axios.get(SERVICE.BRANCH, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }),
        axios.post(SERVICE.EMPLOYEEDOCUMENT_SINGLEWITHALLBYCOMMONID, {
          commonid: oldempid,
        }),
      ]);

      let prevUser = response?.data?.suser;
      branchCode = req?.data?.branch?.filter((item) => item?.name == prevUser?.branch);
      setSelectedBranchCode(branchCode[0]?.code?.slice(0, 2));

      let email = verifiedDetails?.email || prevUser?.email || '';
      setIsValidEmail(validateEmail(email));
      setEmployee((prev) => ({
        ...prev,
        // ...verifiedDetails,
        // username: "",
        // usernameautogenerate: false,
        prefix: verifiedDetails?.prefix || prevUser?.prefix,
        firstname: verifiedDetails?.firstname || prevUser?.firstname?.toUpperCase(),
        lastname: verifiedDetails?.lastname || prevUser?.lastname?.toUpperCase(),
        legalname: verifiedDetails?.legalname || prevUser?.legalname || '',
        callingname: verifiedDetails?.callingname || prevUser?.callingname,
        gender: prevUser?.gender || '',
        fathername: prevUser?.fathername || '',
        mothername: prevUser?.mothername || '',
        dom: prevUser?.dom || '',
        dob: prevUser?.dob,
        age: calculateAge(prevUser?.dob),
        bloodgroup: prevUser.bloodgroup || '',
        religion: prevUser.religion || '',
        location: prevUser.location || '',
        email: verifiedDetails?.email || prevUser?.email || '',

        contactfamily: verifiedDetails?.contactfamily || prevUser?.contactfamily || '',
        emergencyno: verifiedDetails?.emergencyno || prevUser?.emergencyno || '',

        // companyemail: prevUser?.companyemail || "",
        // employeecount: prevUser?.employeecount || "",
        // ifoffice: prevUser?.workstationofficestatus || false,
        // empcode: "",
        // wordcheck: false,
        // systemmode: prevUser?.systemmode || "Active",
        contactpersonal: verifiedDetails?.contactpersonal || (String(prevUser?.contactpersonal) ?? ''),
        aadhar: String(prevUser?.aadhar) ?? '',
        panno: verifiedDetails?.panno || (String(prevUser?.panno) ?? ''),
        panrefno: verifiedDetails?.panrefno || (String(prevUser?.panrefno) ?? ''),
        panstatus: verifiedDetails?.panstatus || String(prevUser?.panstatus),
        // dot: prevUser?.dot || "",
        // doj: moment().format("YYYY-MM-DD"),
        doj: '',
        profileimage: prevUser?.faceDescriptor?.length > 0 && empdocument?.data?.semployeedocument?.profileimage ? empdocument?.data?.semployeedocument?.profileimage : '',
        faceDescriptor: prevUser?.faceDescriptor?.length > 0 && empdocument?.data?.semployeedocument?.profileimage ? prevUser?.faceDescriptor : [],
        // prod: true,

        contactno: verifiedDetails?.contactno || prevUser?.contactno || '',
        details: prevUser?.details || '',
        // workmode: prevUser?.workmode || "",
        // companyname: "",
        pdoorno: verifiedDetails?.pdoorno || prevUser?.pdoorno || '',
        pstreet: verifiedDetails?.pstreet || prevUser?.pstreet || '',
        parea: verifiedDetails?.parea || prevUser?.parea || '',
        plandmark: verifiedDetails?.plandmark || prevUser?.plandmark || '',
        ptaluk: verifiedDetails?.ptaluk || prevUser?.ptaluk || '',
        ppost: verifiedDetails?.ppost || prevUser?.ppost || '',
        ppincode: verifiedDetails?.ppincode || prevUser?.ppincode || '',
        pcountry: verifiedDetails?.pcountry || prevUser?.pcountry || '',
        pstate: verifiedDetails?.pstate || prevUser?.pstate || '',
        pcity: verifiedDetails?.pcity || prevUser?.pcity || '',

        paddresstype: verifiedDetails?.paddresstype || prevUser?.paddresstype || '',
        ppersonalprefix: verifiedDetails?.ppersonalprefix || prevUser?.ppersonalprefix || '',
        presourcename: verifiedDetails?.presourcename || prevUser?.presourcename || '',
        plandmarkandpositionalprefix: verifiedDetails?.plandmarkandpositionalprefix || prevUser?.plandmarkandpositionalprefix || '',
        pgpscoordination: verifiedDetails?.pgpscoordination || prevUser?.pgpscoordination || '',

        caddresstype: verifiedDetails?.caddresstype || prevUser?.caddresstype || '',
        cpersonalprefix: verifiedDetails?.cpersonalprefix || prevUser?.cpersonalprefix || '',
        cresourcename: verifiedDetails?.cresourcename || prevUser?.cresourcename || '',
        clandmarkandpositionalprefix: verifiedDetails?.clandmarkandpositionalprefix || prevUser?.clandmarkandpositionalprefix || '',
        cgpscoordination: verifiedDetails?.cgpscoordination || prevUser?.cgpscoordination || '',

        pgenerateviapincode: verifiedDetails?.pgenerateviapincode ? Boolean(verifiedDetails?.pgenerateviapincode) : false,
        pvillageorcity: verifiedDetails?.pvillageorcity ? verifiedDetails?.pvillageorcity : '',
        pdistrict: verifiedDetails?.pdistrict ? verifiedDetails?.pdistrict : '',
        cgenerateviapincode: verifiedDetails?.cgenerateviapincode ? Boolean(verifiedDetails?.cgenerateviapincode) : false,
        cvillageorcity: verifiedDetails?.cvillageorcity ? verifiedDetails?.cvillageorcity : '',
        cdistrict: verifiedDetails?.cdistrict ? verifiedDetails?.cdistrict : '',

        samesprmnt: verifiedDetails?.samesprmnt || prevUser?.samesprmnt || '',

        cdoorno: verifiedDetails?.cdoorno || prevUser?.cdoorno || '',
        cstreet: verifiedDetails?.cstreet || prevUser?.cstreet || '',
        carea: verifiedDetails?.carea || prevUser?.carea || '',
        clandmark: verifiedDetails?.clandmark || prevUser?.clandmark || '',
        ctaluk: verifiedDetails?.ctaluk || prevUser?.ctaluk || '',
        cpost: verifiedDetails?.cpost || prevUser?.cpost || '',
        cpincode: verifiedDetails?.cpincode || prevUser?.cpincode || '',
        ccountry: verifiedDetails?.ccountry || prevUser?.ccountry || '',
        cstate: verifiedDetails?.cstate || prevUser?.cstate || '',
        ccity: verifiedDetails?.ccity || prevUser?.ccity || '',

        // company: prevUser?.company || "",
        // branch: prevUser?.branch || "",
        // unit: prevUser?.unit || "",
        // team: prevUser?.team || "",
        // designation: prevUser?.designation || "",
        // department: prevUser?.department || "",
        // maritalstatus: prevUser?.maritalstatus || "",
        // area: prevUser?.area || "",
        // floor: prevUser?.floor || "",
        // shifttype: prevUser?.shifttype || "Please Select Shift Type",
        // shiftgrouping: prevUser?.shiftgrouping || "Please Select Shift Grouping",
        // shifttiming: prevUser?.shifttiming || "Please Select Shift",
        // password: prevUser?.originalpassword || "",

        // reportingto: prevUser?.reportingto || "",
        // intCourse: prevUser?.intCourse || "",
        // intStartDate: prevUser?.intStartDate || "",
        // intEndDate: prevUser?.intEndDate || "",
        // modeOfInt: prevUser?.modeOfInt || "",
        // intDuration: prevUser?.intDuration || "",
        // enquirystatus: prevUser?.enquirystatus || "Please Select Status",
      }));

      //permananet addresss
      if (verifiedDetails?.pgenerateviapincode && verifiedDetails?.ppincode !== '') {
        const result = await getPincodeDetails(verifiedDetails?.ppincode);
        if (result?.status === 'Success' && result?.data?.length > 0) {
          setFromPinCodep(result?.data);
        } else {
          setFromPinCodep([]);
        }
      }
      if (verifiedDetails?.cgenerateviapincode && verifiedDetails?.cpincode !== '') {
        const result = await getPincodeDetails(verifiedDetails?.cpincode);
        if (result?.status === 'Success' && result?.data?.length > 0) {
          setFromPinCodec(result?.data);
        } else {
          setFromPinCodec([]);
        }
      }

      // Find the corresponding Country, State, and City objects
      const country = Country.getAllCountries().find((country) => country?.name === verifiedDetails.ccountry);
      const state = State.getStatesOfCountry(country?.isoCode).find((state) => state?.name === verifiedDetails.cstate);
      const city = City.getCitiesOfState(state?.countryCode, state?.isoCode).find((city) => city?.name === verifiedDetails.ccity);

      // Find the corresponding Country, State, and City objects
      const countryp = Country.getAllCountries().find((country) => country?.name === verifiedDetails.pcountry);
      const statep = State.getStatesOfCountry(countryp?.isoCode).find((state) => state?.name === verifiedDetails.pstate);
      const cityp = City.getCitiesOfState(statep?.countryCode, statep?.isoCode).find((city) => city?.name === verifiedDetails.pcity);

      setSelectedCityc(city);
      setSelectedCountryc(country);
      setSelectedStatec(state);
      setSelectedCountryp(countryp);
      setSelectedStatep(statep);
      setSelectedCityp(cityp);

      setEduTodo(prevUser?.eduTodo?.length > 0 ? prevUser?.eduTodo : []);
      setFiles(empdocument?.data?.semployeedocument?.files?.length > 0 ? empdocument?.data?.semployeedocument?.files : []);
      setWorkhistTodo(prevUser?.workhistTodo?.length > 0 ? prevUser?.workhistTodo : []);
      setAddQuaTodo(prevUser?.addAddQuaTodo?.length > 0 ? prevUser?.addAddQuaTodo : []);

      setCreateRocketChat({
        create: prevUser?.rocketchatid ? true : false,
        isThereOldAccount: prevUser?.rocketchatid ? true : false,
        email: prevUser?.rocketchatemail || '',
        roles:
          prevUser?.rocketchatroles?.length > 0
            ? prevUser?.rocketchatroles?.map((data) => ({
                label: data,
                value: data,
              }))
            : [],
      });
      // setPrimaryWorkStationInput(prevUser?.workstationinput);
      // setBankTodo(
      //   prevUser?.bankdetails?.length > 0
      //     ? prevUser?.bankdetails?.map((data) => ({
      //       ...data,
      //       accountstatus: data?.accountstatus ?? "In-Active",
      //     }))
      //     : []
      // );

      // setRoles(prevUser?.role?.length > 0 ? prevUser?.role : []);

      // setoverallgrosstotal(prevUser?.grosssalary);
      // setModeexperience(prevUser?.modeexperience);
      // setTargetexperience(prevUser?.targetexperience);
      // setTargetpts(prevUser?.targetpts);

      let isIntern = !prevUser?.internstatus ? false : prevUser?.internstatus === 'Moved';

      //boardingLog
      let boardingLog = prevUser?.boardingLog;
      const movetoliveIndex = boardingLog.findIndex((item) => item.movetolive === true);

      let afterArrayBoard = [];

      if (movetoliveIndex !== -1) {
        afterArrayBoard = boardingLog.slice(movetoliveIndex);
      }
      let boardFirstLog = isIntern && movetoliveIndex !== -1 && afterArrayBoard?.length > 0 ? afterArrayBoard[0] : response?.data?.suser?.boardingLog?.length > 0 ? response?.data?.suser?.boardingLog[0] : undefined;
      // setTodo(boardFirstLog?.todo || []);
      setReferenceTodo(prevUser?.referencetodo?.length > 0 ? prevUser?.referencetodo : []);
      // setValueAttMode(prevUser?.attendancemode?.length > 0 ? prevUser?.attendancemode : []);
      // setSelectedAttMode(prevUser?.attendancemode?.length > 0 ? prevUser?.attendancemode?.map(item => ({
      //   label: item,
      //   value: item,
      // })) : []);
      // setSelectedCompany(prevUser?.company || "");
      // setSelectedBranch(prevUser?.branch || "");
      // setSelectedUnit(prevUser?.unit || "");
      // setSelectedTeam(prevUser?.team || "");
      // setSelectedDesignation(prevUser?.designation || "");
      // setIsValidEmail(true);
      setFirst(prevUser?.firstname.toLowerCase().split(' ').join(''));
      setSecond(prevUser?.lastname.toLowerCase().split(' ').join(''));

      //processlog
      let processlog = prevUser?.processlog;
      const movetoliveIndexProcess = processlog.findIndex((item) => item.movetolive === true);

      let afterArrayProcess = [];

      if (movetoliveIndexProcess !== -1) {
        afterArrayProcess = processlog.slice(movetoliveIndexProcess);
      }
      let processFirstLog = isIntern && movetoliveIndexProcess !== -1 && afterArrayProcess?.length > 0 ? afterArrayProcess[0] : prevUser?.processlog?.length > 0 ? prevUser?.processlog[0] : undefined;
      let movetoprocess = prevUser?.internstatus === 'Moved' ? true : false;
      let firstoprocess;
      if (movetoprocess) {
        firstoprocess = prevUser?.processlog?.find((data) => data?.movetolive);
      } else {
        firstoprocess = processFirstLog || {};
      }
      const resprocesstime = firstoprocess?.time?.split(':') || [];
      // setLoginNotAllot({
      //   process: (firstoprocess?.process || "Please Select Process"),
      //   processtype: (firstoprocess?.processtype || "Primary"),
      //   processduration: (firstoprocess?.processduration || "Full"),
      //   time: (resprocesstime[0] || "00"),
      //   timemins: (resprocesstime[1] || "00"),
      // });
      // setoverallgrosstotal(prevUser?.overallgrosstotal || "");
      // setTargetpts(prevUser?.targetpts || "");
      // setModeexperience(prevUser?.assignExpvalue || "");
      // setTargetexperience(prevUser?.assignExpvalue || "");

      // if (prevUser?.floor) {
      //   await fetchareaNames(prevUser?.company, prevUser?.branch, prevUser?.floor);
      // }

      //department
      let departmentlog = prevUser?.departmentlog;
      const movetoliveIndexDepartment = departmentlog.findIndex((item) => item.movetolive === true);

      let afterArrayDepartment = [];

      if (movetoliveIndexDepartment !== -1) {
        afterArrayDepartment = departmentlog.slice(movetoliveIndexDepartment);
      }
      let departmentFirstLog = isIntern && movetoliveIndexDepartment !== -1 && afterArrayDepartment?.length > 0 ? afterArrayDepartment[0] : prevUser?.departmentlog?.length > 0 ? prevUser?.departmentlog[0] : undefined;

      // await fetchDptDesignation(departmentFirstLog?.department || "");
      // await ShiftDropdwonsSecond(
      //   boardFirstLog?.shiftgrouping || ""
      // );;

      // await fetchSuperVisorDropdowns(boardFirstLog?.team || "", prevUser);
      // setEnableWorkstation(prevUser?.enableworkstation);

      // setValueWorkStation(
      //   boardFirstLog?.workstation.slice(1)
      // );
      // setSelectedOptionsWorkStation(
      //   Array.isArray(boardFirstLog?.workstation)
      //     ? boardFirstLog?.workstation
      //       .slice(1)
      //       .map((x) => ({
      //         ...x,
      //         label: x,
      //         value: x,
      //       }))
      //     : []
      // );

      // setSelectedOptionsCate(
      //   Array.isArray(boardFirstLog?.weekoff)
      //     ? boardFirstLog?.weekoff?.map((x) => ({
      //       ...x,
      //       label: x,
      //       value: x,
      //     }))
      //     : []
      // );

      // setValueCate(
      //   Array.isArray(boardFirstLog?.weekoff)
      //     ? boardFirstLog?.weekoff
      //     : []
      // )

      // if (prevUser?.assignExpLog?.lenth === 0) {
      //   setAssignExperience({
      //     ...assignExperience,
      //     updatedate: prevUser?.doj,
      //   });
      // } else {
      //   setAssignExperience({
      //     ...assignExperience,
      //     assignExpMode: prevUser?.assignExpLog[0]?.expmode,
      //     assignExpvalue: prevUser?.assignExpLog[0]?.expval,
      //     assignEndExpDate:
      //       prevUser?.assignExpLog[0]?.endexpdate !== ""
      //         ? moment(
      //           prevUser?.assignExpLog[0]?.endexpdate
      //         ).format("YYYY-MM-DD")
      //         : "",
      //     assignEndTarDate:
      //       prevUser?.assignExpLog[0]?.endtardate !== ""
      //         ? moment(
      //           prevUser?.assignExpLog[0]?.endtardate
      //         ).format("YYYY-MM-DD")
      //         : "",
      //     assignEndTarvalue: prevUser?.assignExpLog[0]?.endtar,
      //     assignEndExpvalue: prevUser?.assignExpLog[0]?.endexp,
      //     updatedate:
      //       prevUser?.assignExpLog[0]?.updatedate !== ""
      //         ? moment(
      //           prevUser?.assignExpLog[0]?.updatedate
      //         ).format("YYYY-MM-DD")
      //         : "",
      //   });
      // }
      // let newEmpCode = await EmployeeCodeAutoGenerate(
      //   prevUser?.company || "",
      //   prevUser?.branch || "",
      //   branchCode[0]?.code || "",
      //   moment().format("YYYY-MM-DD")
      // );
      // setNewval(newEmpCode)
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchUserDefaultDatas();
  }, []);

  const [errors, setErrors] = useState({});
  const [errorsLog, setErrorsLog] = useState({});
  const [ShiftGroupingOptions, setShiftGroupingOptions] = useState([]);
  const ShiftTypeOptions = [
    { label: 'Standard', value: 'Standard' },
    { label: 'Daily', value: 'Daily' },
    { label: '1 Week Rotation (2 Weeks)', value: '1 Week Rotation' },
    { label: '2 Week Rotation (Monthly)', value: '2 Week Rotation' },
    { label: '1 Month Rotation (2 Month)', value: '1 Month Rotation' },
  ];

  const [categorys, setCategorys] = useState([]);
  const [subcategorys, setSubcategorys] = useState([]);
  const [educationsOpt, setEducationsOpt] = useState([]);
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
      await handleCandidateUploadSingleAll(desigall);
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
      let data_set = res_category.data.educationcategory.map((d) => d.categoryname);
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

      let data_set = res.data.educationspecilizations.filter((data) => {
        return data.category.includes(employee?.categoryedu) && data.subcategory.includes(e.value);
      });

      let result =
        data_set?.length > 0
          ? data_set[0].specilizationgrp.map((data) => ({
              label: data.label,
              value: data.label,
            }))
          : [];

      setEducationsOpt(result);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [isValidEmail, setIsValidEmail] = useState(false);

  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  // Country city state datas
  const [selectedCountryp, setSelectedCountryp] = useState(Country.getAllCountries().find((country) => country?.name === 'India'));
  const [selectedStatep, setSelectedStatep] = useState(State.getStatesOfCountry(selectedCountryp?.isoCode).find((state) => state?.name === 'Tamil Nadu'));
  const [selectedCityp, setSelectedCityp] = useState(City.getCitiesOfState(selectedStatep?.countryCode, selectedStatep?.isoCode).find((city) => city?.name === 'Tiruchirappalli'));

  const [selectedCountryc, setSelectedCountryc] = useState(Country.getAllCountries().find((country) => country?.name === 'India'));
  const [selectedStatec, setSelectedStatec] = useState(State.getStatesOfCountry(selectedCountryc?.isoCode).find((state) => state?.name === 'Tamil Nadu'));
  const [selectedCityc, setSelectedCityc] = useState(City.getCitiesOfState(selectedStatec?.countryCode, selectedStatec?.isoCode).find((city) => city?.name === 'Tiruchirappalli'));

  const [companies, setCompanies] = useState([]);
  const [branchNames, setBranchNames] = useState([]);
  const [floorNames, setFloorNames] = useState([]);
  const [areaNames, setAreaNames] = useState([]);
  const [department, setDepartment] = useState([]);
  const [team, setTeam] = useState([]);
  const [unitNames, setUnitNames] = useState([]);
  const [designation, setDesignation] = useState();
  const [name, setUserNameEmail] = useState('');
  const [month, setMonth] = useState('');
  const [email, setEmail] = useState('');
  const [message, setUserPassword] = useState('');
  const [userName, setUserName] = useState({
    fname: '',
    length: '',
  });
  const [empCode, setEmpCode] = useState([]);
  const [allUsersLoginName, setAllUsersLoginName] = useState([]);
  const [branchCodeGen, setBranchCodeGen] = useState('');
  const [isFormComplete, setIsFormComplete] = useState('incomplete');
  let sno = 1;

  const [errorstodo, setErrorstodo] = useState({});

  //ADDICTIONAL QUALIFICATION SECTION FUNCTIONALITY
  const [institution, setInstitution] = useState('');
  const [passedyear, setPassedyear] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [eduTodo, setEduTodo] = useState([]);

  const [addQual, setAddQual] = useState('');
  const [addInst, setAddInst] = useState('');
  const [duration, setDuration] = useState('');
  const [remarks, setRemarks] = useState('');
  const [addAddQuaTodo, setAddQuaTodo] = useState([]);

  const [empNameTodo, setEmpNameTodo] = useState('');
  const [desigTodo, setDesigTodo] = useState('');
  const [joindateTodo, setJoindateTodo] = useState('');
  const [leavedateTodo, setLeavedateTodo] = useState('');
  const [dutiesTodo, setDutiesTodo] = useState('');
  const [reasonTodo, setReasonTodo] = useState('');
  const [workhistTodo, setWorkhistTodo] = useState([]);
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [third, setThird] = useState('');

  //crop image
  const [selectedFile, setSelectedFile] = useState(null);
  const [croppedImage, setCroppedImage] = useState('');
  const cropperRef = useRef(null);

  const [skillSet, setSkillSet] = useState('');

  const [getDepartment, setGetDepartment] = useState('Internship');
  const [modeInt, setModeInt] = useState('');
  const [internCourseNames, setInternCourseNames] = useState();
  const [internCodeGen, setInternCodeGen] = useState('');
  const [reportingtonames, setreportingtonames] = useState([]);
  const [workStationOpt, setWorkStationOpt] = useState([]);
  const [allWorkStationOpt, setAllWorkStationOpt] = useState([]);
  const [enableWorkstation, setEnableWorkstation] = useState(false);
  const [enableLoginName, setEnableLoginName] = useState(true);
  const [overllsettings, setOverallsettings] = useState([]);
  const [filteredWorkStation, setFilteredWorkStation] = useState([]);
  const [workstationTodoList, setWorkstationTodoList] = useState([]);
  const [keyPrimaryShortname, setPrimaryKeyShortname] = useState('');
  const [keyShortname, setKeyShortname] = useState('');
  const [primaryWorkStationLabel, setPrimaryWorkStationLabel] = useState('Please Select Primary Work Station');
  const [ismigrate, setIsmigrate] = useState('migrate');

  const getCode = (totalValue, code, experience, targetpoints, row) => {
    let gms = Number(row?.basic || 0) + Number(row?.hra || 0) + Number(row?.conveyance || 0) + Number(row?.medicalallowance || 0) + Number(row?.producationallowance || 0) + Number(row?.producationallowancetwo || 0) + Number(row?.otherallowance || 0);
    //  +
    //  Number(row?.performanceincentive || 0) +
    //  Number(row?.shiftallowance || 0)
    setAssignExperience({
      ...assignExperience,
      assignExpMode: 'Add',
      assignExpvalue: experience,
    });
    setLoginNotAllot({
      ...loginNotAllot,
      process: code,
    });
    setoverallgrosstotal(totalValue);
    setTargetpts(targetpoints);

    setModeexperience(experience);
    setTargetexperience(experience);

    setSalaryTableData((prev) => ({
      ...prev,
      salaryfixed: true,
      salarystatus: 'With Salary',
      expectedsalary: '',
      basic: row?.basic || 0,
      hra: row?.hra || 0,
      conveyance: row?.conveyance || 0,
      medicalallowance: row?.medicalallowance || 0,
      producationallowance: row?.producationallowance || 0,
      producationallowancetwo: row?.producationallowancetwo || 0,
      otherallowance: row?.otherallowance || 0,
      performanceincentive: row?.performanceincentive || 0,
      shiftallowance: row?.shiftallowance || 0,
      // performanceincentive:0,
      grossmonthsalary: gms,
      annualgrossctc: 12 * gms,
    }));
    setSalaryTableDataManual((prev) => ({
      ...prev,
      salaryfixed: true,
      salarystatus: 'With Salary',
      expectedsalary: '',
      basic: row?.basic || 0,
      hra: row?.hra || 0,
      conveyance: row?.conveyance || 0,
      medicalallowance: row?.medicalallowance || 0,
      producationallowance: row?.producationallowance || 0,
      producationallowancetwo: row?.producationallowancetwo || 0,
      otherallowance: row?.otherallowance || 0,
      performanceincentive: row?.performanceincentive || 0,
      shiftallowance: row?.shiftallowance || 0,
      // performanceincentive:0,
      grossmonthsalary: gms,
      annualgrossctc: 12 * gms,
    }));
    handleCloseModEditAllot();
  };
  const salaryOptions = [
    { label: 'Experience Based', value: 'Experience Based' },
    { label: 'Manual Salary', value: 'Manual Salary' },
  ];
  const [salaryOption, setSalaryOption] = useState('Experience Based');
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
    grosssalary: '',
    modeexperience: '',
    targetexperience: '',
    endexp: '',
    endexpdate: '',
    endtar: '',
    endtardate: '',
  });

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
  const [specificDates, setSpecificDates] = useState([]);

  const [expDateOptions, setExpDateOptions] = useState([]);

  useEffect(() => {
    let foundData = expDptDates.find((item) => item.department === employee?.department && new Date(employee?.doj) >= new Date(item.fromdate) && new Date(employee?.doj) <= new Date(item.todate));

    if (foundData) {
      let filteredDatas = expDptDates
        .filter((d) => d.department === employee?.department && new Date(d.fromdate) >= new Date(foundData.fromdate))
        .map((data) => ({
          label: data.fromdate,
          value: data.fromdate,
        }));

      setExpDateOptions(filteredDatas);
    } else {
      console.log('No data found for the given conditions.');
    }
  }, [expDptDates, employee?.department]);

  // Process allot add  details

  const [loginNotAllot, setLoginNotAllot] = useState({
    process: 'Please Select Process',
    processtype: 'Primary',
    processduration: 'Full',
    time: 'Hrs',
    timemins: 'Mins',
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

  const SalaryFixFilter = async () => {
    setIsArea(true);
    try {
      let res = await axios.post(SERVICE.SALARY_FIX_FILTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: selectedCompany,
        branch: selectedBranch,
        salaryrange: employee?.salaryrange,
        type: employee?.type,
        process: loginNotAllot.process,
        amountvalue: employee?.amountvalue,
        fromamount: employee?.from,
        toamount: employee?.to,
      });
      setSalaryFix(res?.data?.result);
      setIsArea(false);
    } catch (err) {
      setIsArea(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handlesalary = (e) => {
    e.preventDefault();
    try {
      if (employee?.type === 'Please Select Type') {
        setPopupContentMalert('Please Select Type!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else if (employee?.type === 'Amount Wise' && employee?.salaryrange === 'Please Select Salary Range') {
        setPopupContentMalert('Please Select Salary Range!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else if (employee?.type === 'Process Wise' && loginNotAllot.process === 'Please Select Process') {
        setPopupContentMalert('Please Select Process!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else if (employee?.salaryrange === 'Between' && employee?.from === '') {
        setPopupContentMalert('Please Enter From!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else if (employee?.salaryrange === 'Between' && employee?.to === '') {
        setPopupContentMalert('Please Enter To!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else if ((employee?.salaryrange === 'Less Than' || employee?.salaryrange === 'Greater Than' || employee?.salaryrange === 'Exact') && employee?.amountvalue === '') {
        setPopupContentMalert('Please Enter Amount Value!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else {
        SalaryFixFilter();
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const processTeamDropdowns = async () => {
    try {
      let res_freq = await axios.get(SERVICE.ALL_PROCESS_AND_TEAM_FILTER_LIMITED, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const companyall = res_freq?.data?.processteam;
      setProcessOptions(companyall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    generateHrsOptions();
    generateMinsOptions();
    fetchShiftDropdowns();
  }, []);

  useEffect(() => {
    fetchSalarySlabs();
    fetchTargetpoints();
  }, [assignExperience, loginNotAllot.process]);

  useEffect(() => {
    processTeamDropdowns();
  }, [selectedTeam]);

  const handleDOJChange = (value) => {
    handleSalaryfix(
      loginNotAllot?.process,
      value,
      value,
      assignExperience?.assignExpMode,
      assignExperience?.assignExpvalue,

      assignExperience?.assignEndExpvalue,
      '',
      assignExperience?.assignEndTarvalue,
      '',
      employee?.department
      //  assignExperience?.assignEndTar
    );
    const mondatefilter = value?.split('-');
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
      startDate: value,
    });

    setEmployee({ ...employee, doj: value });
    setAssignExperience((prev) => ({
      ...prev,
      updatedate: value,
      assignEndExpDate: '',
      assignEndTarDate: '',
      // assignExpMode: "Auto Increment",
    }));
    if (value !== '') {
      const formattedDate = moment(value).format('YYMMDD');

      // Extract the branch code (first 2 characters) and the rest of the code (after the date)
      const branchCode = newval.slice(0, 2); // First 2 characters for branch code
      const restOfCode = newval.slice(11); // Characters after the date part

      // Construct the new employee code with the updated date
      const updatedEmployeeCode = `${branchCode}INT${formattedDate}${restOfCode}`;

      // Update the state with the new employee code
      setNewval(updatedEmployeeCode);
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

  let today1 = new Date();
  var mm = String(today1.getMonth() + 1).padStart(2, '0');
  var yyyy = today1.getFullYear();
  let curMonStartDate = yyyy + '-' + mm + '-01';
  let findexp = monthSets.find((d) => d.department === employee?.department && new Date(employee?.doj) >= new Date(d.fromdate) && new Date(employee?.doj) <= new Date(d.todate));
  let findDate = findexp ? findexp.fromdate : curMonStartDate;

  // const handleSalaryfix = (
  //   process,
  //   updatedate,
  //   doj,
  //   assignExpMode,
  //   assignExpvalue,
  //   assignEndExpvalue,
  //   assignEndExpDate,
  //   assignEndTarvalue,
  //   assignEndTarDate
  // ) => {
  //   let modevalue =
  //     new Date(today1) > new Date(updatedate) &&
  //     ((assignExpMode === "Add" && assignExpvalue !== "") ||
  //       (assignExpMode === "Minus" && assignExpvalue !== "") ||
  //       (assignExpMode === "Fix" && assignExpvalue !== "") ||
  //       (assignEndExpvalue === "Yes" && assignEndExpDate !== "") ||
  //       assignEndTarvalue === "Yes" ||
  //       assignEndTarDate !== "");

  //   const calculateMonthsBetweenDates = (startDate, endDate) => {
  //     if (startDate && endDate) {
  //       const start = new Date(startDate);
  //       const end = new Date(endDate);

  //       let years = end.getFullYear() - start.getFullYear();
  //       let months = end.getMonth() - start.getMonth();
  //       let days = end.getDate() - start.getDate();

  //       // Convert years to months
  //       months += years * 12;

  //       // Adjust for negative days
  //       if (days < 0) {
  //         months -= 1; // Subtract a month
  //         days += new Date(end.getFullYear(), end.getMonth(), 0).getDate(); // Add days of the previous month
  //       }

  //       // Adjust for days 15 and above
  //       if (days >= 15) {
  //         months += 1; // Count the month if 15 or more days have passed
  //       }

  //       return months;
  //     }

  //     return 0; // Return 0 if either date is missing
  //   };

  //   let differenceInMonths, differenceInMonthsexp, differenceInMonthstar;
  //   if (modevalue) {
  //     //findexp end difference yes/no
  //     if (assignEndExpvalue === "Yes") {
  //       differenceInMonthsexp = calculateMonthsBetweenDates(
  //         doj,
  //         assignEndExpDate
  //       );
  //       differenceInMonthsexp =
  //         differenceInMonthsexp < 1 ? 0 : differenceInMonthsexp;
  //       if (assignExpMode === "Add") {
  //         differenceInMonthsexp += parseInt(assignExpvalue);
  //       } else if (assignExpMode === "Minus") {
  //         differenceInMonthsexp -= parseInt(assignExpvalue);
  //       } else if (assignExpMode === "Fix") {
  //         differenceInMonthsexp = parseInt(assignExpvalue);
  //       }
  //     } else {
  //       differenceInMonthsexp = calculateMonthsBetweenDates(doj, findDate);
  //       differenceInMonthsexp =
  //         differenceInMonthsexp < 1 ? 0 : differenceInMonthsexp;

  //       if (assignExpMode === "Add") {
  //         differenceInMonthsexp += parseInt(assignExpvalue);
  //       } else if (assignExpMode === "Minus") {
  //         differenceInMonthsexp -= parseInt(assignExpvalue);
  //       } else if (assignExpMode === "Fix") {
  //         differenceInMonthsexp = parseInt(assignExpvalue);
  //       } else {
  //         differenceInMonthsexp = calculateMonthsBetweenDates(doj, findDate);
  //       }
  //     }

  //     //findtar end difference yes/no
  //     if (modevalue.endtar === "Yes") {
  //       differenceInMonthstar = calculateMonthsBetweenDates(
  //         doj,
  //         assignEndTarDate
  //       );
  //       differenceInMonthstar =
  //         differenceInMonthstar < 1 ? 0 : differenceInMonthstar;

  //       if (assignExpMode === "Add") {
  //         differenceInMonthstar += parseInt(assignExpvalue);
  //       } else if (assignExpMode === "Minus") {
  //         differenceInMonthstar -= parseInt(assignExpvalue);
  //       } else if (assignExpMode === "Fix") {
  //         differenceInMonthstar = parseInt(assignExpvalue);
  //       }
  //     } else {
  //       differenceInMonthstar = calculateMonthsBetweenDates(doj, findDate);
  //       differenceInMonthstar =
  //         differenceInMonthstar < 1 ? 0 : differenceInMonthstar;

  //       if (assignExpMode === "Add") {
  //         differenceInMonthstar += parseInt(assignExpvalue);
  //       } else if (assignExpMode === "Minus") {
  //         differenceInMonthstar -= parseInt(assignExpvalue);
  //       } else if (assignExpMode === "Fix") {
  //         differenceInMonthstar = parseInt(assignExpvalue);
  //       } else {
  //         differenceInMonthstar = calculateMonthsBetweenDates(doj, findDate);
  //       }
  //     }

  //     differenceInMonths = calculateMonthsBetweenDates(doj, findDate);
  //     differenceInMonths = differenceInMonths < 1 ? 0 : differenceInMonths;

  //     if (assignExpMode === "Add") {
  //       differenceInMonths += parseInt(assignExpvalue);
  //     } else if (assignExpMode === "Minus") {
  //       differenceInMonths -= parseInt(assignExpvalue);
  //     } else if (assignExpMode === "Fix") {
  //       differenceInMonths = parseInt(assignExpvalue);
  //     } else {
  //       // differenceInMonths = parseInt(assignExpvalue);
  //       differenceInMonths = calculateMonthsBetweenDates(doj, findDate);
  //     }
  //   } else {
  //     differenceInMonthsexp = calculateMonthsBetweenDates(doj, findDate);
  //     differenceInMonthstar = calculateMonthsBetweenDates(doj, findDate);
  //     differenceInMonths = calculateMonthsBetweenDates(doj, findDate);
  //   }

  //   let getprocessCode = process;

  //   let processexp = doj
  //     ? getprocessCode +
  //     (differenceInMonths < 1
  //       ? "00"
  //       : differenceInMonths <= 9
  //         ? `0${differenceInMonths}`
  //         : differenceInMonths)
  //     : "00";

  //   let findSalDetails = salSlabs.find(
  //     (d) =>
  //       d.company == selectedCompany &&
  //       d.branch == selectedBranch &&
  //       d.salarycode == processexp
  //   );

  //   let findSalDetailsTar = tarPoints.find(
  //     (d) =>
  //       d.branch === selectedBranch &&
  //       d.company === selectedCompany &&
  //       d.processcode === processexp
  //   );

  //   let targetpoints = findSalDetailsTar ? findSalDetailsTar.points : "";

  //   let grosstotal = findSalDetails
  //     ? Number(findSalDetails.basic) +
  //     Number(findSalDetails.hra) +
  //     Number(findSalDetails.conveyance) +
  //     Number(findSalDetails.medicalallowance) +
  //     Number(findSalDetails.productionallowance) +
  //     Number(findSalDetails.otherallowance)
  //     : "";

  //   let Modeexp = doj ? (differenceInMonths > 0 ? differenceInMonths : 0) : "";
  //   let Tarexp = doj
  //     ? differenceInMonthstar > 0
  //       ? differenceInMonthstar
  //       : 0
  //     : "";
  //   setoverallgrosstotal(grosstotal);

  //   setModeexperience(Modeexp);
  //   setTargetexperience(Tarexp);
  //   setTargetpts(targetpoints);
  // };

  //GET PROCESS CODE FUNCTION

  //get all employees list details
  const handleSalaryfix = (process, updatedate, doj, assignExpMode, assignExpvalue, assignEndExpvalue, assignEndExpDate, assignEndTarvalue, assignEndTarDate, department) => {
    let todayNow = new Date();
    var mm = String(todayNow.getMonth() + 1).padStart(2, '0');
    var yyyy = todayNow.getFullYear();

    let curMonStartDate = `${yyyy}-${mm}-01`;

    let findexp = monthSets.find((d) => d.department === department && new Date(todayNow) >= new Date(d.fromdate) && new Date(todayNow) <= new Date(d.todate));
    let findDate = findexp ? findexp.fromdate : curMonStartDate;

    // console.log(findDate, doj, assignEndExpvalue, "finddate")

    // let findDate = updatedate;
    let modevalue =
      new Date(todayNow) > new Date(updatedate) &&
      ((assignExpMode === 'Add' && assignExpvalue !== '') || (assignExpMode === 'Minus' && assignExpvalue !== '') || (assignExpMode === 'Fix' && assignExpvalue !== '') || (assignEndExpvalue === 'Yes' && assignEndExpDate !== '') || assignEndTarvalue === 'Yes' || assignEndTarDate !== '');

    const calculateMonthsBetweenDates = (startDate, endDate) => {
      console.log(startDate, endDate, 'startdate');
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

    // Calculate difference in months between findDate and item.doj
    let differenceInMonths, differenceInMonthsexp, differenceInMonthstar;
    if (modevalue) {
      //findexp end difference yes/no
      if (assignEndExpvalue === 'Yes') {
        differenceInMonthsexp = calculateMonthsBetweenDates(updatedate, assignEndExpDate);
        differenceInMonthsexp = differenceInMonthsexp < 1 ? 0 : differenceInMonthsexp;
        if (assignExpMode === 'Add') {
          differenceInMonthsexp += parseInt(assignExpvalue);
        } else if (assignExpMode === 'Minus') {
          differenceInMonthsexp -= parseInt(assignExpvalue);
        } else if (assignExpMode === 'Fix') {
          differenceInMonthsexp = parseInt(assignExpvalue);
        }
      } else {
        differenceInMonthsexp = calculateMonthsBetweenDates(doj, findDate);
        differenceInMonthsexp = differenceInMonthsexp < 1 ? 0 : differenceInMonthsexp;
        if (assignExpMode === 'Add') {
          differenceInMonthsexp += parseInt(assignExpvalue);
        } else if (assignExpMode === 'Minus') {
          differenceInMonthsexp -= parseInt(assignExpvalue);
        } else if (assignExpMode === 'Fix') {
          differenceInMonthsexp = parseInt(assignExpvalue);
        } else {
          differenceInMonthsexp = calculateMonthsBetweenDates(doj, findDate);
        }
      }
      //findtar end difference yes/no
      if (assignEndTarvalue === 'Yes') {
        differenceInMonthstar = calculateMonthsBetweenDates(updatedate, assignEndTarDate);
        differenceInMonthstar = differenceInMonthstar < 1 ? 0 : differenceInMonthstar;
        if (assignExpMode === 'Add') {
          differenceInMonthstar += parseInt(assignExpvalue);
        } else if (assignExpMode === 'Minus') {
          differenceInMonthstar -= parseInt(assignExpvalue);
        } else if (assignExpMode === 'Fix') {
          differenceInMonthstar = parseInt(assignExpvalue);
        }
      } else {
        differenceInMonthstar = calculateMonthsBetweenDates(updatedate, findDate);
        differenceInMonthstar = differenceInMonthstar < 1 ? 0 : differenceInMonthstar;
        if (assignExpMode === 'Add') {
          differenceInMonthstar += parseInt(assignExpvalue);
        } else if (assignExpMode === 'Minus') {
          differenceInMonthstar -= parseInt(assignExpvalue);
        } else if (assignExpMode === 'Fix') {
          differenceInMonthstar = parseInt(assignExpvalue);
        } else {
          differenceInMonthstar = calculateMonthsBetweenDates(updatedate, findDate);
        }
      }
      differenceInMonths = calculateMonthsBetweenDates(updatedate, findDate);
      differenceInMonths = differenceInMonths < 1 ? 0 : differenceInMonths;
      if (assignExpMode === 'Add') {
        differenceInMonths += parseInt(assignExpvalue);
      } else if (assignExpMode === 'Minus') {
        differenceInMonths -= parseInt(assignExpvalue);
      } else if (assignExpMode === 'Fix') {
        differenceInMonths = parseInt(assignExpvalue);
      } else {
        // differenceInMonths = parseInt(assignExpvalue);
        differenceInMonths = calculateMonthsBetweenDates(updatedate, findDate);
      }
    } else {
      differenceInMonthsexp = calculateMonthsBetweenDates(updatedate, findDate);
      differenceInMonthstar = calculateMonthsBetweenDates(updatedate, findDate);
      differenceInMonths = calculateMonthsBetweenDates(updatedate, findDate);
    }
    let getprocessCode = process;

    let processexp = doj ? getprocessCode + (differenceInMonths < 1 ? '00' : differenceInMonths <= 9 ? `0${differenceInMonths}` : differenceInMonths) : '00';

    // let findSalDetails = salSlabs.find((d) => d.company == selectedCompany && d.branch == selectedBranch && d.salarycode == processexp);

    // let findSalDetailsTar = tarPoints.find((d) => d.branch === selectedBranch && d.company === selectedCompany && d.processcode === processexp);

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
      ? Number(findSalDetails.basic) +
        Number(findSalDetails.hra) +
        Number(findSalDetails.conveyance) +
        Number(findSalDetails.medicalallowance) +
        Number(findSalDetails.productionallowance) +
        // + Number(findSalDetails.productionallowancetwo)
        Number(findSalDetails.otherallowance)
      : '';

    let Modeexp = doj ? (differenceInMonthsexp > 0 ? differenceInMonthsexp : 0) : '';
    let Tarexp = doj ? (differenceInMonthstar > 0 ? differenceInMonthstar : 0) : '';
    setoverallgrosstotal(grosstotal);
    // console.log(Modeexp, 'Modeexp')
    // console.log(salSlabs.length, tarPoints.length, 'tarPoints')
    setModeexperience(Modeexp);
    setTargetexperience(Tarexp);
    setTargetpts(targetpoints);

    let salTab = {
      salaryfixed: true,
      salarystatus: 'With Salary',
      expectedsalary: '',
      basic: Number(findSalDetails?.basic || 0),
      hra: Number(findSalDetails?.hra || 0),
      conveyance: Number(findSalDetails?.conveyance || 0),
      medicalallowance: Number(findSalDetails?.medicalallowance || 0),
      productionallowance: Number(findSalDetails?.productionallowance || 0),
      // + Number(findSalDetails?.productionallowancetwo || 0)
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
    //     setSalaryTableDataManual((prev)=>({
    //       ...prev,
    //       ...salTab,
    // }));
  };

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
      let filteredMonthsets = res_employee.data.departmentdetails.filter((item) => item.year == currentyear && item.monthname == currentmonth);
      let filteredMonthsetsDATES = res_employee.data.departmentdetails.filter((item) => item.fromdate);
      setExpDptDates(res_employee.data.departmentdetails);
      setMonthsets(res_employee.data.departmentdetails);
      setSpecificDates(filteredMonthsetsDATES);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
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

        const Floor = hyphenCount === 1 ? Bracketsbranch.split('-')[1].trim() : hyphenCount === 2 ? Bracketsbranch.split('-').pop() : Bracketsbranch.split('-').slice(-2).join('-').replace(')', '');

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
          value: d.replace(/\([^)]*\)$/, ''),
        }));
      console.log(secondaryworkstation, 'secondaryworkstation');
      setAllWorkStationOpt(secondaryworkstation);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [empsettings, setEmpsettings] = useState(false);
  const [companyEmailDomain, setCompanyEmailDomain] = useState('');
  useEffect(() => {
    // Split the domain names into an array and trim any whitespace
    const domainsArray = companyEmailDomain
      ?.split(',')
      .map((domain) => domain.trim())
      .filter((domain) => domain);

    let usernames = (enableLoginName ? String(third) : employee?.username).toLowerCase();
    // Check if the domainsArray has any domains
    const companyEmails = domainsArray.length > 0 ? domainsArray.map((domain) => `${usernames}@${domain}`).join(',') : '';

    setEmployee({
      ...employee,
      companyemail: domainsArray.length > 0 ? companyEmails : '',
    });
  }, [enableLoginName, third, employee?.username, companyEmailDomain]);

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
      return response;
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const fetchOverAllSettings = async () => {
    try {
      let res = await axios.get(SERVICE.GET_OVERALL_SETTINGS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let filter = res?.data?.overallsettings[0].todos.filter((item) => item.branch.includes(selectedBranch) && item.company == selectedCompany);
      let lastobj = res?.data?.overallsettings?.length > 0 ? res?.data?.overallsettings?.at(-1) : {};
      setOverallsettings(lastobj);
      setColor(lastobj?.backgroundcolour || '#FFFFFF');
      setEmpsettings(res?.data?.overallsettings[0].empdigits);
      let lastObject = res?.data?.overallsettings[res?.data?.overallsettings?.length - 1];
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //change form
  const handlechangepassedyear = (e) => {
    const regex = /^[0-9]+$/;
    const inputValue = e.target.value?.slice(0, 4);
    if (regex.test(inputValue) || inputValue === '') {
      setPassedyear(inputValue);
    }
  };

  //change form
  const handlechangecgpa = (e) => {
    const regex = /^[0-9]*\.?[0-9]*$/; // Updated regular expression to accept decimal values
    const inputValue = e.target.value.slice(0, 5); // Adjusted slice limit to accommodate decimal point and one digit after it
    if (regex.test(inputValue) || inputValue === '') {
      setCgpa(inputValue);
    }
  };

  //change form
  const handlechangeppincode = (e) => {
    const regex = /^[0-9]+$/;
    const inputValue = e.target.value?.slice(0, 6);
    if (regex.test(inputValue) || inputValue === '') {
      setEmployee({ ...employee, ppincode: inputValue });
    }
  };

  //change form
  const handlechangecpincode = (e) => {
    const regex = /^[0-9]+$/;
    const inputValue = e.target.value?.slice(0, 6);
    if (regex.test(inputValue) || inputValue === '') {
      setEmployee({ ...employee, cpincode: inputValue });
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
  const renderFilePreview = async (file) => {
    const response = await fetch(file.preview);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    window.open(link, '_blank');
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
      //  const groupId = uuidv4();
      //       setEducationalGroupId(groupId);
      //       let finalGroupId = educationalGroupId === '' ? groupId : educationalGroupId;

      // Update all existing items with the same groupid
      const updatedEducationTodo = eduTodo;

      // Create new items for each educationDocument
      const newItems = educationDocuments.map((doc) => {
        // const uniqueDocId = uuidv4(); // Unique ID for each document
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
  //month Calaculation
  const calMonth = () => {
    let date = new Date(employee?.doj).getTime();
    let calculatedMonth = Math.floor((new Date().getTime() - date) / (1000 * 60 * 60 * 24 * 30.44));
    setMonth(calculatedMonth > 0 ? calculatedMonth : 0);
  };

  // Unit Dropdowns
  const fetchUnitNames = async () => {
    try {
      let req = await axios.get(SERVICE.UNIT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setUnitNames(req?.data?.units);
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
      setSkillSet(req?.data?.skillsets);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const usernameaddedby = isUserRoleAccess?.username;
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
  const [imageUploaded, setImageUploaded] = useState(false);
  const resizeImageKeepFormat = (base64, targetWidth, targetHeight) => {
    console.log(targetWidth, targetHeight, 'targetWidth, targetHeight');
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
  // console.log(overllsettings,"overllsettings")
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
            id: null,
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

            setImageUploaded(true);
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
  };

  const handleClearImage = () => {
    setGetImg(null);
    setCroppedImage(null);
    setEmployee({ ...employee, profileimage: '', faceDescriptor: [] });
    setImage('');
  };

  //ERROR MESSAGESE
  const ShowErrMess = () => {
    if (first.length == '' || second.length == 0) {
      setErrmsg('Unavailable');
    } else if (third.length >= 1) {
      setErrmsg('Available');
    }
  };
  const [lastWorkStationCode, setLastWorkStationCode] = useState(0);
  // get settings data
  const fetchUserDatas = async () => {
    try {
      let req = await axios.get(SERVICE.USER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let ALLusers = req?.data?.users.filter((item) => {
        if (item?.workmode != 'Internship' && item.branch == selectedBranch) {
          return item;
        }
      });
      setEmpCode(ALLusers);

      let lastwscode;
      let lastworkstation = req?.data?.users
        .filter(
          (item) =>
            // item?.workmode !== "Internship" &&
            item.company === selectedCompany && item.branch === selectedBranch && item.unit === selectedUnit
        )
        .filter((item) => /_[0-9]+_/.test(item?.workstationinput));
      // .filter((item) =>
      //   /^[A-Za-z0-9]{5}_\d{2}_[A-Za-z0-9]{6}$/.test(item?.workstationinput)
      // );

      if (lastworkstation.length === 0) {
        setLastWorkStationCode(0);
        lastwscode = 0;
      } else {
        let highestWorkstation = lastworkstation.reduce(
          (max, item) => {
            const num = parseInt(item.workstationinput.split('_')[1]);
            return num > max.num ? { num, item } : max;
          },
          { num: 0, item: null }
        ).num;

        setLastWorkStationCode(highestWorkstation.toString().padStart(2, '0'));
        lastwscode = highestWorkstation.toString().padStart(2, '0');
      }

      let autoWorkStation = `W${selectedBranchCode?.toUpperCase()}${selectedUnitCode?.toUpperCase()}_${lastwscode === 0 ? '01' : (Number(lastwscode) + 1).toString().padStart(2, '0')}_${(enableLoginName ? String(third) : employee?.username)?.toUpperCase()}`;

      setPrimaryWorkStationInput(autoWorkStation);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [empcodelimitedAll, setEmpCodeLimitedAll] = useState([]);
  // get settings data
  const fetchUserDatasLimitedEmpcodeCreate = async () => {
    try {
      let req = await axios.post(SERVICE.USERS_LIMITED_EMPCODE_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        branch: selectedBranch,
      });

      let ALLusers = req?.data?.userscreate;
      const lastThreeDigitsArray = ALLusers.map((employee) => employee?.empcode.slice(-3));
      setEmpCodeLimited(lastThreeDigitsArray);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchUserDatasLimitedEmpcodeAll = async () => {
    try {
      let req = await axios.post(SERVICE.USERS_LIMITED_EMPCODE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        id: '',
      });

      let ALLusers = req?.data?.users;

      const allDigitsArray = ALLusers?.filter((data) => data?.empcode !== '')?.map((employee) => employee?.empcode);

      setEmpCodeLimitedAll(allDigitsArray);

      // setEmpCode(ALLusers);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //getting branch code autogenarate function prefix
  const fetchInternCode = async () => {
    try {
      let req = await axios.get(SERVICE.USER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let branchcode = req.data.users?.filter((data) => {
        if (data?.workmode == 'Internship' && data?.wordcheck == false) {
          return data;
        }
      });
      setInternCodeGen(branchcode);
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

  //change form
  const handlechangecontactpersonal = (e) => {
    const regex = /^[0-9]+$/;
    const inputValue = e.target.value?.slice(0, 10);
    if (regex.test(inputValue) || inputValue === '') {
      setEmployee({ ...employee, contactpersonal: inputValue });
    }
  };

  const handlechangecontactfamily = (e) => {
    const regex = /^[0-9]+$/;
    const inputValue = e.target.value?.slice(0, 10);
    if (regex.test(inputValue) || inputValue === '') {
      setEmployee({ ...employee, contactfamily: inputValue });
    }
  };

  const handlechangeemergencyno = (e) => {
    const regex = /^[0-9]+$/;
    const inputValue = e.target.value?.slice(0, 10);
    if (regex.test(inputValue) || inputValue === '') {
      setEmployee({ ...employee, emergencyno: inputValue });
    }
  };

  const handlechangeaadhar = (e) => {
    const regex = /^[0-9]+$/;
    const inputValue = e.target.value?.slice(0, 12);
    if (regex.test(inputValue) || inputValue === '') {
      setEmployee({ ...employee, aadhar: inputValue });
    }
  };
  const [referenceTodoError, setReferenceTodoError] = useState({});
  const [referenceTodo, setReferenceTodo] = useState([]);
  const [singleReferenceTodo, setSingleReferenceTodo] = useState({
    name: '',
    relationship: '',
    occupation: '',
    contact: '',
    details: '',
  });

  const addReferenceTodoFunction = () => {
    const isNameMatch = referenceTodo?.some((item) => item?.name?.trim()?.toLowerCase() === singleReferenceTodo?.name?.trim()?.toLowerCase());
    const newErrorsLog = {};

    if (singleReferenceTodo?.name === '') {
      newErrorsLog.name = <Typography style={{ color: 'red' }}>Name must be required</Typography>;
    } else if (isNameMatch) {
      newErrorsLog.duplicate = <Typography style={{ color: 'red' }}>Reference Already Exist!</Typography>;
    }

    if (singleReferenceTodo.contact !== '' && singleReferenceTodo.contact?.length !== 10) {
      newErrorsLog.contactno = <Typography style={{ color: 'red' }}>Contack No must be 10 digits required</Typography>;
    }
    if (singleReferenceTodo !== '' && Object.keys(newErrorsLog).length === 0) {
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
    const regex = /^[0-9]+$/; // Only allows positive integers
    // const regex = /^\d*\.?\d*$/;
    const inputValue = e.target.value?.slice(0, 10);
    // Check if the input value matches the regex or if it's empty (allowing backspace)
    if (regex.test(inputValue) || inputValue === '') {
      setSingleReferenceTodo({ ...singleReferenceTodo, contact: inputValue });
    }
  };

  const debouncedEmployeeCodeAutoGenerate = debounce(
    (company, branch, branchcode, doj) => {
      EmployeeCodeAutoGenerate(company, branch, branchcode, doj);
    },
    300 // 300ms delay
  );
  const [newval, setNewval] = useState('');
  const [prevEmpCode, setPrevEmpCode] = useState('');
  const EmployeeCodeAutoGenerate = async (company, branch, branchcode, doj) => {
    try {
      let res = await axios.post(SERVICE.INTERNCODE_AUTOGENERATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: company,
        branch: branch,
        branchcode: branchcode?.substring(0, 2),
        doj: doj,
      });
      // console.log(res.data?.employeeCode, "res.data?.employeeCode");
      setNewval(res.data?.employeeCode);
      setPrevEmpCode(res.data?.prevEmployeeCode);
      return res.data?.employeeCode || '';
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // auto id for employee code
  // let date = employee?.doj?.split("-") ?? [];
  // let dateJoin = "";

  // if (date.length === 3) {
  //   let year = date[0] ? date[0].slice(-2) : "";
  //   let month = date[1] ?? "";
  //   let day = date[2] ?? "";
  //   dateJoin = year + month + day;
  // } else {
  //   dateJoin = "";
  // }

  // let newval =
  //   empsettings === true && overllsettings.length > 0
  //     ? branchCodeGen.toUpperCase() +
  //     dateJoin +
  //     overllsettings[0]?.empcodedigits
  //     : branchCodeGen.toUpperCase() + dateJoin + "001";

  // let lastEmpCode;

  // const currDate = new Date();
  // var currDay = String(currDate.getDate()).padStart(2, "0");
  // var currMonth = String(currDate.getMonth() + 1).padStart(2, "0");
  // const currYear = currDate.getFullYear().toString().slice(2, 5);
  // // let newval1 = "HIAIPUT-23076";
  // let newval1 = `${selectedBranchCode.toString()}INT${dateJoin}0001`;

  // if (getDepartment == "Internship") {
  //   internCodeGen &&
  //     internCodeGen.forEach(() => {
  //       let strings = `${selectedBranchCode.toString()}INT${dateJoin}`;

  //       let refNo = internCodeGen[internCodeGen.length - 1]?.empcode;
  //       lastEmpCode =
  //         internCodeGen[internCodeGen.length - 1]?.empcode.slice(-3);
  //       let digits = (internCodeGen.length + 1).toString();
  //       const stringLength = refNo.length;
  //       let lastChar = refNo.charAt(stringLength - 1);
  //       let getlastBeforeChar = refNo.charAt(stringLength - 2);
  //       let getlastThreeChar = refNo.charAt(stringLength - 3);
  //       let lastBeforeChar = refNo.slice(-2);
  //       let lastThreeChar = refNo.slice(-3);
  //       let lastDigit = refNo.slice(-4);
  //       let refNOINC = parseInt(lastChar) + 1;
  //       let refLstTwo = parseInt(lastBeforeChar) + 1;
  //       let refLstThree = parseInt(lastThreeChar) + 1;
  //       let refLstDigit = parseInt(lastDigit) + 1;
  //       if (
  //         digits.length < 4 &&
  //         getlastBeforeChar == 0 &&
  //         getlastThreeChar == 0
  //       ) {
  //         refNOINC = ("000" + refNOINC).substr(-4);
  //         newval1 = strings + refNOINC;
  //       } else if (
  //         digits.length < 4 &&
  //         getlastBeforeChar > 0 &&
  //         getlastThreeChar == 0
  //       ) {
  //         refNOINC = ("00" + refLstTwo).substr(-4);
  //         newval1 = strings + refNOINC;
  //       } else if (digits.length < 4 && getlastThreeChar > 0) {
  //         refNOINC = ("0" + refLstThree).substr(-4);
  //         newval1 = strings + refNOINC;
  //       } else {
  //         refNOINC = refLstDigit.substr(-4);
  //         newval1 = strings + refNOINC;
  //       }
  //     });
  // } else if (empCode.length > 0) {
  //   empCode &&
  //     empCode.forEach(() => {
  //       //   const result = empCode.reduce((maxEmployee, currentEmployee) => {
  //       //     const lastThreeDigitsMax = parseInt(maxEmployee.empcode.slice(-3));
  //       //     const lastThreeDigitsCurrent = parseInt(currentEmployee.empcode.slice(-3));
  //       //     return lastThreeDigitsMax > lastThreeDigitsCurrent ? maxEmployee : currentEmployee;
  //       //   }, empCode[0]);
  //       const numericEmpCode = empCode.filter(
  //         (employee) => !isNaN(parseInt(employee?.empcode.slice(-3)))
  //       );

  //       const result = numericEmpCode.reduce((maxEmployee, currentEmployee) => {
  //         const lastThreeDigitsMax = parseInt(maxEmployee?.empcode.slice(-3));
  //         const lastThreeDigitsCurrent = parseInt(
  //           currentEmployee?.empcode?.slice(-3)
  //         );
  //         return lastThreeDigitsMax > lastThreeDigitsCurrent
  //           ? maxEmployee
  //           : currentEmployee;
  //       }, numericEmpCode[0]);

  //       let strings = branchCodeGen?.toUpperCase() + dateJoin;
  //       let refNoold = result?.empcode;

  //       let refNo =
  //         overllsettings?.length > 0 &&
  //           empsettings === true &&
  //           Number(overllsettings[0]?.empcodedigits) >
  //           Number(result?.empcode.slice(-3))
  //           ? branchCodeGen.toUpperCase() +
  //           dateJoin +
  //           Number(overllsettings[0]?.empcodedigits - 1)
  //           : refNoold;
  //       let digits = (empCode.length + 1).toString();
  //       const stringLength = refNo?.length;
  //       let getlastBeforeChar = refNo?.charAt(stringLength - 2);
  //       let getlastThreeChar = refNo?.charAt(stringLength - 3);
  //       let lastChar = refNo?.slice(-1);
  //       let lastBeforeChar = refNo?.slice(-2);
  //       let lastDigit = refNo?.slice(-3);
  //       let refNOINC = parseInt(lastChar) + 1;
  //       let refLstTwo = parseInt(lastBeforeChar) + 1;
  //       let refLstDigit = parseInt(lastDigit) + 1;
  //       if (
  //         digits.length < 4 &&
  //         getlastBeforeChar === "0" &&
  //         getlastThreeChar === "0"
  //       ) {
  //         refNOINC = "00" + refNOINC;
  //         newval = strings + refNOINC;
  //       } else if (
  //         digits.length < 4 &&
  //         getlastThreeChar === "0" &&
  //         getlastBeforeChar > "0"
  //       ) {
  //         refNOINC = "0" + refLstTwo;
  //         newval = strings + refNOINC;
  //       } else {
  //         refNOINC = refLstDigit;
  //         newval = strings + refNOINC;
  //       }
  //     });
  // } else if (
  //   empCode?.length === 0 &&
  //   overllsettings?.length > 0 &&
  //   empsettings === true
  // ) {
  //   newval =
  //     branchCodeGen?.toUpperCase() +
  //     dateJoin +
  //     overllsettings[0]?.empcodedigits;
  // } else if (empCode?.length === 0 && overllsettings?.length == 0) {
  //   // Handle any other conditions or set a default value for newval

  //   newval = branchCodeGen?.toUpperCase() + dateJoin + "001";
  // }

  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState('');
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };
  const fetchBranchCode = async () => {
    try {
      var response = await axios.get(SERVICE.BRANCH, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let branchcode =
        response.data.branch.length > 0 &&
        response.data.branch.filter((data) => {
          if (selectedBranch === data?.name) {
            setBranchCodeGen(data?.code);
          }
        });
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Branch Dropdowns
  const fetchbranchNames = async () => {
    try {
      let req = await axios.get(SERVICE.BRANCH, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setBranchNames(req?.data?.branch);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Floor Dropdowns
  const fetchfloorNames = async () => {
    try {
      let req = await axios.get(SERVICE.FLOOR, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setFloorNames(req?.data?.floors);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
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

  // Departments Dropdowns
  const fetchDepartments = async () => {
    try {
      let req = await axios.get(SERVICE.DEPARTMENT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let filteredDepartments = req?.data?.departmentdetails?.filter((obj) => obj.deptname.toLowerCase().includes('intern'));
      setDepartment(filteredDepartments);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Itern Courses Dropdowns
  const fetchInternCourses = async () => {
    try {
      let req = await axios.get(SERVICE.INTERNCOURSE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setInternCourseNames(req?.data?.internCourses);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Team Dropdowns
  const fetchteamdropdowns = async () => {
    try {
      let req = await axios.get(SERVICE.TEAMS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTeam(req?.data?.teamsdetails);
    } catch (err) {
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

  //get all Areas.

  // Designation Dropdowns
  const fetchDesignation = async () => {
    try {
      let req = await axios.get(SERVICE.DESIGNATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDesignation(req?.data?.designation);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [shifttiming, setShiftTiming] = useState();

  // Shift Dropdowns
  const fetchShiftDropdowns = async () => {
    try {
      let req = await axios.get(SERVICE.SHIFT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setShiftTiming(req?.data?.shifts);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

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
      setAllUsersLoginName(req?.data?.users?.map((user) => user.username));
      // setreportingtonames(req.data.users);
      req.data.users.filter((data) => {
        if (first + second === data.username) {
          setThird(first + second.slice(0, 1) + new Date(employee?.dob ? employee?.dob : '').getDate());
          setUserNameEmail(first + second.slice(0, 1) + new Date(employee?.dob ? employee?.dob : '').getDate());
        } else if (first + second + new Date(employee?.dob).getDate() == data.username) {
          setThird(first + second.slice(0, 1) + new Date(employee?.dob ? employee?.dob : '').getMonth());
          setUserNameEmail(first + second.slice(0, 1) + new Date(employee?.dob ? employee?.dob : '').getMonth());
        } else if (first + second.slice(0, 1) === data.username) {
          setThird(first + second.slice(0, 2));
          setUserNameEmail(first + second.slice(0, 2));
        } else if (first + second.slice(0, 2) === data.username) {
          setThird(first + second.slice(0, 3));
          setUserNameEmail(first + second.slice(0, 3));
        }
      });
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  useEffect(() => {
    fetchHirearchy();
  }, []);
  const [allHierarchy, setHierarchy] = useState(false);
  const fetchHirearchy = async () => {
    let res = await axios.get(SERVICE.HIRERARCHI, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });

    const resultUsers = res?.data?.hirerarchi;
    setHierarchy(resultUsers?.length > 0 ? true : false);
  };
  const fetchSuperVisorDropdowns = async (team) => {
    let res = await axios.post(SERVICE.HIERARCHY_REPORTING_TO, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      team: team,
    });

    const resultUsers = res?.data?.result?.length > 0 ? res?.data?.result[0]?.result?.supervisorchoose : [];
    setreportingtonames(resultUsers);
  };
  //fetching companies
  const fetchCompanies = async () => {
    try {
      let productlist = await axios.get(SERVICE.COMPANY, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setCompanies(productlist?.data?.companies);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
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
  useEffect(() => {
    setEmployee((prev) => ({ ...prev, profileimage: getImg }));
  }, [getImg]);

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
  // let capture = isWebcamCapture === true ? getImg : croppedImage;

  // let capture = isWebcamCapture == true ? getImg : croppedImage ;
  // let final = capture ? capture : empaddform.profileimage;

  const handleCompanyChange = (event) => {
    const selectedCompany = event.value;
    setSelectedCompany(selectedCompany);
    setSelectedBranch('');
    setSelectedUnit('');
    setSelectedTeam('');
    setSelectedWorkStation('');
    setAreaNames([]);
    setEmployee({ ...employee, floor: '', area: '' });
    setPrimaryWorkStation('Please Select Primary Work Station');
    setPrimaryWorkStationLabel('Please Select Primary Work Station');
    setSelectedOptionsWorkStation([]);
    setValueWorkStation([]);
    setWorkstationTodoList([]);
    setAccessible({
      ...accessible,
      company: selectedCompany,
      branch: 'Please Select Branch',
      unit: 'Please Select Unit',
      companycode: event.code,
      branchcode: '',
      unitcode: '',
      branchemail: '',
      branchaddress: '',
      branchstate: '',
      branchcity: '',
      branchcountry: '',
      branchpincode: '',
    });
  };

  const handleBranchChange = (event) => {
    const selectedBranch = event.value;
    const branchCode = filteredBranches.filter((item) => item?.name === event.value);
    debouncedEmployeeCodeAutoGenerate(selectedCompany, selectedBranch, event.code, employee?.doj || moment().format('YYYY-MM-DD'));
    setSelectedBranchCode(branchCode[0]?.code.slice(0, 2));
    // Now you have both the name and code, you can use them as needed
    setSelectedBranchstatus(!selectedBranchstatus);
    setSelectedBranch(selectedBranch);
    setSelectedUnit('');
    setSelectedTeam('');
    setSelectedWorkStation('');
    setAreaNames([]);
    setEmployee({ ...employee, floor: '', area: '' });
    setPrimaryWorkStation('Please Select Primary Work Station');
    setPrimaryWorkStationLabel('Please Select Primary Work Station');
    setSelectedOptionsWorkStation([]);
    setValueWorkStation([]);
    setWorkstationTodoList([]);
    setAccessible({
      ...accessible,
      branch: selectedBranch,
      unit: 'Please Select Unit',
      branchcode: event.code,
      branchemail: event.email,
      branchaddress: event.address,
      branchstate: event.state,
      branchcity: event.city,
      branchcountry: event.country,
      branchpincode: event.pincode,
      unitcode: '',
    });
  };

  const handleUnitChange = (event) => {
    const selectedUnit = event.value;
    const unitCode = filteredUnits.filter((item) => item?.name === event.value);
    setSelectedUnitCode(unitCode[0]?.code.slice(0, 2));

    setSelectedUnit(selectedUnit);
    setSelectedTeam('');
    setSelectedWorkStation('');
    setPrimaryWorkStation('Please Select Primary Work Station');
    setPrimaryWorkStationLabel('Please Select Primary Work Station');
    setSelectedOptionsWorkStation([]);
    setValueWorkStation([]);
    setWorkstationTodoList([]);
    setAccessible({
      ...accessible,
      unit: selectedUnit,
      unitcode: event.code,
    });
  };

  const handleTeamChange = (event) => {
    const selectedTeam = event.value;
    handleSalaryfix(
      loginNotAllot.process,
      assignExperience.updatedate,
      employee?.doj,
      assignExperience.assignExpMode,
      assignExperience.assignExpvalue,

      assignExperience.assignEndExpvalue,
      assignExperience.assignEndExpDate,
      assignExperience.assignEndTarvalue,
      assignExperience.assignEndTarDate,
      employee?.department
      //  assignExperience.assignEndTar
    );
    setSelectedTeam(selectedTeam);
    // setLoginNotAllot({
    //   ...loginNotAllot,
    //   process: "Please Select Process",
    // });

    // setAssignExperience({
    //   ...assignExperience,
    //   assignExpMode: "Auto Increment",
    // });
    fetchSuperVisorDropdowns(selectedTeam);
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

      let res_designation = await axios.get(SERVICE.DESIGNATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let getGroupName = res_designation?.data?.designation
        .filter((data) => {
          return data?.name === e.value;
        })
        .map((item) => item.group);

      let getRoles = res_designationgroup?.data?.desiggroup
        ?.filter((data) => {
          return getGroupName.includes(data?.name);
        })
        .flatMap((data) => data.roles);

      let uniqueRoles = [...new Set(getRoles)];
      setRoles(uniqueRoles);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleDesignationChange = (event) => {
    const selectedDesignation = event.value;
    setSelectedDesignation(selectedDesignation);
    fetchDesignationgroup(event);
    // fetchCandidatedocumentdropdowns(selectedDesignation);
    setEmployee((prev) => ({
      ...prev,
      employeecount: event?.systemcount,
    }));

    setPrimaryWorkStation('Please Select Primary Work Station');
    setPrimaryWorkStationLabel('Please Select Primary Work Station');
    setSelectedOptionsWorkStation([]);
    setValueWorkStation([]);
    setWorkstationTodoList([]);
  };

  const filteredBranches = branchNames?.filter((b) => b.company === selectedCompany);

  const filteredUnits = unitNames?.filter((u) => u.branch === selectedBranch);

  const filteredTeams = team?.filter((t) => t.unit === selectedUnit && t.branch === selectedBranch && t.department === employee?.department);

  const filteredDesignation = designation?.filter((d) => d.branch === selectedBranch);
  const [primaryWorkStation, setPrimaryWorkStation] = useState('Please Select Primary Work Station');

  const [primaryWorkStationInput, setPrimaryWorkStationInput] = useState('');

  useEffect(() => {
    var filteredWorks;
    if (selectedUnit === '' && employee?.floor === '') {
      filteredWorks = workStationOpt?.filter((u) => u.company === selectedCompany && u.branch === selectedBranch);
    } else if (selectedUnit === '') {
      filteredWorks = workStationOpt?.filter((u) => u.company === selectedCompany && u.branch === selectedBranch && u.floor === employee?.floor);
    } else if (employee?.floor === '') {
      filteredWorks = workStationOpt?.filter((u) => u.company === selectedCompany && u.branch === selectedBranch && u.unit === selectedUnit);
    } else {
      filteredWorks = workStationOpt?.filter((u) => u.company === selectedCompany && u.branch === selectedBranch && u.unit === selectedUnit && u.floor === employee?.floor);
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

      const Floor = hyphenCount === 1 ? Bracketsbranch.split('-')[1].trim() : hyphenCount === 2 ? Bracketsbranch.split('-').pop() : Bracketsbranch.split('-').slice(-2).join('-').replace(')', '');

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
          value: t.replace(/\([^)]*\)$/, ''),
        })),
    ];
    setFilteredWorkStation(workstationsFinal);
  }, [selectedCompany, selectedBranch, selectedUnit, employee?.floor]);

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
  // company multi select
  const handleEmployeesChange = (options) => {
    // const check = primaryWorkStation !== 'Please Select Primary Work Station';

    const check = (primaryWorkStation || '').trim().toLowerCase() !== 'please select primary work station' && (primaryWorkStation || '').trim() !== '' && (primaryWorkStation || '').trim().toLowerCase() !== 'select primary workstation';

    const maxOptions = check ? Number(employee?.employeecount) - 1 : Number(employee?.employeecount);
    console.log(maxOptions, 'maxOptions');
    // Restrict selection to maxOptions
    // if (options.length <= maxOptions) {
    //   setValueWorkStation(options.map((a) => a.value));
    //   setSelectedOptionsWorkStation(options);
    // }

    // Restrict selection to maxOptions
    if (options.length <= maxOptions) {
      // if (options.length > maxSelections - 1) {
      //   options = options.slice(0, maxSelections - 1); // Limit selections to max allowed
      // }

      const selectedCabs = options?.map((option) => option?.value?.split('(')[0]) || [];

      const extractBranchAndFloor = (workstation) => {
        const branchAndFloor = (workstation || '').match(/\(([^)]+)\)/)?.[1];
        if (branchAndFloor) {
          const hyphenCount = branchAndFloor.split('-').length - 1;
          const Branch = hyphenCount === 1 ? branchAndFloor.split('-')[0].trim() : branchAndFloor.split('-').slice(0, 2).join('-');
          const Floor = hyphenCount === 1 ? branchAndFloor.split('-')[1].trim() : hyphenCount === 2 ? branchAndFloor.split('-').pop() : branchAndFloor.split('-').slice(-2).join('-').replace(')', '');
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
        const matches = item.label.match(/^(.*?)\((.*?)\)\((.*?)\)$/);
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
    return valueWorkStation.length ? valueWorkStation.map(({ label }) => label).join(', ') : <span style={{ color: 'hsl(0, 0%, 20%)' }}>Please Select Secondary Work Station</span>;
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
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please Select Days';
  };

  useEffect(() => {
    fetchCompanies();
    // fetchRoleDropdown();
    fetchfloorNames();
    fetchDepartments();
    ShiftDropdwonsSecond();
    ShiftGroupingDropdwons();
    fetchteamdropdowns();
    fetchInternCourses();
    fetchDesignation();
    fetchSkillSet();
    fetchbranchNames();
    fetchUnitNames();
    fetchWorkStation();
    fetchUserDatasLimitedEmpcodeCreate();
    fetchUserDatasLimitedEmpcodeAll();
    fetchDepartmentMonthsets();
  }, []);

  useEffect(() => {
    fetchInternCode();
    fetchCompanyDomain();
    fetchUserName();
    calMonth();
    fetchUserDatas();
    fetchCategoryEducation();
    fetchCandidatedocumentdropdowns();
    fetchOverAllSettings();
  }, []);

  useEffect(() => {
    fetchUserDatasLimitedEmpcodeCreate();
    fetchUserDatas();
  }, [selectedBranch, selectedBranchstatus, selectedUnit]);

  useEffect(() => {
    calMonth();
  }, [employee?.doj]);

  useEffect(() => {
    fetchBranchCode();
  }, [selectedBranch]);

  useEffect(() => {
    ShowErrMess();
    fetchUserName();
    setThird(first + second.slice(0, 1));
    setUserNameEmail(first + second.slice(0, 1));
  }, [first, second, name]);

  // let companycaps =
  //   employee?.firstname.toUpperCase() + "." + employee?.lastname.toUpperCase();
  // pecentage completion
  const [companycaps, setcompanycaps] = useState('');

  function checkFormCompletion() {
    if (
      third !== '' &&
      employee?.password !== '' &&
      employee?.firstname !== '' &&
      employee?.lastname !== '' &&
      employee?.legalname !== '' &&
      employee?.callingname !== '' &&
      employee?.fathername !== '' &&
      employee?.mothername !== '' &&
      employee?.gender !== '' &&
      employee?.maritalstatus !== '' &&
      employee?.maritalstatus === 'Married' &&
      employee?.dom !== '' &&
      employee?.dob !== '' &&
      employee?.bloodgroup !== '' &&
      employee?.religion !== '' &&
      croppedImage !== '' &&
      employee?.location !== '' &&
      employee?.email !== '' &&
      employee?.companyemail !== '' &&
      employee?.contactpersonal !== '' &&
      employee?.contactfamily !== '' &&
      employee?.emergencyno !== '' &&
      employee?.doj !== '' &&
      employee?.dot !== '' &&
      employee?.contactno !== '' &&
      employee?.details !== '' &&
      selectedCompany !== '' &&
      employee?.pdoorno !== '' &&
      employee?.pstreet !== '' &&
      employee?.parea !== '' &&
      employee?.plandmark !== '' &&
      employee?.ptaluk !== '' &&
      employee?.ppincode !== '' &&
      selectedCountryp?.name !== '' &&
      selectedStatep?.name !== '' &&
      selectedCityp?.name !== '' &&
      (!employee?.samesprmnt ? employee?.cdoorno : employee?.pdoorno !== '') &&
      (!employee?.samesprmnt ? employee?.cstreet : employee?.pstreet !== '') &&
      (!employee?.samesprmnt ? employee?.carea : employee?.parea !== '') &&
      (!employee?.samesprmnt ? employee?.clandmark : employee?.plandmark !== '') &&
      (!employee?.samesprmnt ? employee?.ctaluk : employee?.ptaluk !== '') &&
      (!employee?.samesprmnt ? employee?.cpost : employee?.ppost !== '') &&
      (!employee?.samesprmnt ? employee?.cpincode : employee?.ppincode !== '') &&
      (!employee?.samesprmnt ? selectedCountryc?.name : selectedCountryp?.name !== '') &&
      (!employee?.samesprmnt ? selectedStatec?.name : selectedStatep?.name !== '') &&
      (!employee?.samesprmnt ? selectedCityp?.name : selectedCityc?.name !== '') &&
      selectedBranch !== '' &&
      // selectedWorkStation !== "" &&
      selectedOptionsWorkStation.length > 0 &&
      employee?.floor !== '' &&
      employee?.department !== '' &&
      selectedTeam !== '' &&
      employee?.designation !== '' &&
      employee?.employeecount !== '' &&
      employee?.shifttiming !== '' &&
      employee?.reportingto !== '' &&
      newval !== '' &&
      files.length > 0 &&
      employee?.prefix !== '' &&
      employee?.ppost !== '' &&
      companycaps !== '' &&
      addAddQuaTodo.length > 0 &&
      eduTodo.length > 0 &&
      workhistTodo.length > 0 &&
      employee?.aadhar !== '' &&
      employee?.panno !== '' &&
      selectedUnit !== ''
    ) {
      setIsFormComplete('complete');
    } else {
      setIsFormComplete('incomplete');
    }
  }

  let conditions = [
    third !== '',
    employee?.password !== '',
    employee?.firstname !== '',
    employee?.lastname !== '',
    employee?.legalname !== '',
    employee?.callingname !== '',
    employee?.fathername !== '',
    employee?.mothername !== '',
    employee?.gender !== '',
    employee?.maritalstatus !== '',
    employee?.maritalstatus === 'Married' && employee?.dom !== '' && employee?.dob !== '',
    employee?.bloodgroup !== '',
    employee?.religion !== '',
    employee?.profileimage !== '',
    employee?.location !== '',
    employee?.email !== '',
    employee?.companyemail !== '',
    employee?.contactpersonal !== '',
    employee?.contactfamily !== '',
    employee?.emergencyno !== '',
    employee?.doj !== '',
    employee?.dot !== '',
    employee?.contactno !== '',
    employee?.details !== '',
    selectedCompany !== '',
    employee?.pdoorno !== '',
    employee?.pstreet !== '',
    employee?.parea !== '',
    employee?.plandmark !== '',
    employee?.ptaluk !== '',
    employee?.ppincode !== '',
    employee?.ppost !== '',
    selectedCountryp?.name !== '',
    selectedStatep?.name !== '',
    selectedCityp?.name !== '',
    !employee?.samesprmnt ? employee?.cdoorno : employee?.pdoorno !== '',
    !employee?.samesprmnt ? employee?.cstreet : employee?.pstreet !== '',
    !employee?.samesprmnt ? employee?.carea : employee?.parea !== '',
    !employee?.samesprmnt ? employee?.clandmark : employee?.plandmark !== '',
    !employee?.samesprmnt ? employee?.ctaluk : employee?.ptaluk !== '',
    !employee?.samesprmnt ? employee?.cpost : employee?.ppost !== '',
    !employee?.samesprmnt ? employee?.cpincode : employee?.ppincode !== '',
    !employee?.samesprmnt ? selectedCountryc?.name : selectedCountryp?.name !== '',
    !employee?.samesprmnt ? selectedStatec?.name : selectedStatep?.name !== '',
    !employee?.samesprmnt ? selectedCityc?.name : selectedCityp?.name !== '',
    selectedBranch !== '',
    // selectedWorkStation !== "",
    selectedOptionsWorkStation.length > 0,
    employee?.floor !== '',
    employee?.department !== '',
    selectedTeam !== '',
    employee?.designation !== '',
    employee?.employeecount !== '',
    employee?.shifttiming !== '',
    employee?.reportingto !== '',
    newval !== '',
    files.length > 0,
    employee?.prefix !== '',

    companycaps !== '',
    addAddQuaTodo.length > 0,
    eduTodo.length > 0,
    workhistTodo.length > 0,
    employee?.aadhar !== '',
    employee?.panno !== '',
    selectedUnit !== '',
  ];

  const result = conditions.reduce(
    (acc, val) => {
      acc[val]++;
      return acc;
    },
    { true: 0, false: 0 }
  );

  const totalFields = 60;
  const filledFields = Object.values(employee).filter((value) => value !== '').length;

  const completionPercentage = (result.true / totalFields) * 100;

  useEffect(() => {
    checkFormCompletion();
  }, []);

  const [nextBtnLoading, setNextBtnLoading] = useState(false);

  function AadharValidate(aadhar) {
    var adharcardTwelveDigit = /^\d{12}$/;
    var adharSixteenDigit = /^\d{16}$/;

    if (aadhar !== '' && aadhar !== undefined) {
      if (aadhar?.match(adharcardTwelveDigit) || aadhar?.match(adharSixteenDigit)) {
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
      if (pan?.match(panregex)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  const draftduplicateCheck = async () => {
    try {
      const newErrors = {};
      const missingFields = [];

      // Check the validity of field1

      if (!employee?.firstname) {
        newErrors.firstname = <Typography style={{ color: 'red' }}>First name must be required</Typography>;
        missingFields.push('First Name');
      }

      if (!employee?.lastname) {
        newErrors.lastname = <Typography style={{ color: 'red' }}> Last Name be required </Typography>;
      } else if (employee?.lastname.length < 3) {
        newErrors.lastname = <Typography style={{ color: 'red' }}> Last Name must be 3 characters! </Typography>;
        missingFields.push('Last Name');
      }

      // if (employeenameduplicate && employee?.firstname && employee?.lastname) {
      //   newErrors.duplicatefirstandlastname = (
      //     <Typography style={{ color: "red" }}>
      //       First name and Last name already exist
      //     </Typography>
      //   );
      // }

      if (!employee?.legalname) {
        newErrors.legalname = <Typography style={{ color: 'red' }}>Legal name must be required</Typography>;
        missingFields.push('Legal Name');
      }
      if (!employee?.callingname) {
        newErrors.callingname = <Typography style={{ color: 'red' }}>Calling Name must be required</Typography>;
        missingFields.push('Calling Name');
      }
      // if (
      //   employee?.callingname !== "" &&
      //   employee?.legalname !== "" &&
      //   employee?.callingname?.toLowerCase() ===
      //   employee?.legalname?.toLowerCase()
      // ) {
      //   newErrors.callingname = (
      //     <Typography style={{ color: "red" }}>
      //       Legal Name and Calling Name can't be same
      //     </Typography>
      //   );
      //   missingFields.push("Legal Name and Calling Name can't be same");
      // }

      if (!employee?.religion) {
        newErrors.religion = <Typography style={{ color: 'red' }}>Religion must be required</Typography>;
        missingFields.push('Religion');
      }

      if (!employee?.email) {
        newErrors.email = <Typography style={{ color: 'red' }}>Email must be required</Typography>;
        missingFields.push('Email');
      } else if (!isValidEmail) {
        newErrors.email = <Typography style={{ color: 'red' }}>Please enter valid email</Typography>;
        missingFields.push('Enter valid Email');
      }

      if (!employee?.emergencyno) {
        newErrors.emergencyno = <Typography style={{ color: 'red' }}>Emergency no must be required</Typography>;
        missingFields.push('Emergency No');
      } else if (employee?.emergencyno.length !== 10) {
        newErrors.emergencyno = <Typography style={{ color: 'red' }}>Emergency no must be 10 digits required</Typography>;
        missingFields.push('Enter valid Emergency No');
      }
      if (employee?.maritalstatus === 'Married' && !employee?.dom) {
        newErrors.dom = <Typography style={{ color: 'red' }}>DOM must be required</Typography>;
        missingFields.push('Date of Marriage ');
      }
      if (employee?.contactfamily === '') {
        newErrors.contactfamily = <Typography style={{ color: 'red' }}>Contact(Family) no must be required</Typography>;
        missingFields.push('Contact(Family)');
      }
      if (employee?.contactfamily !== '' && employee?.contactfamily.length !== 10) {
        newErrors.contactfamily = <Typography style={{ color: 'red' }}>Contact(Family) no must be 10 digits required</Typography>;
        missingFields.push('Enter valid Contact(Family) No');
      }
      if (employee?.contactpersonal === '') {
        newErrors.contactpersonal = <Typography style={{ color: 'red' }}>Contact(personal) no must be required</Typography>;
        missingFields.push('Contact(personal)');
      }
      if (employee?.contactpersonal !== '' && employee?.contactpersonal.length !== 10) {
        newErrors.contactpersonal = <Typography style={{ color: 'red' }}>Contact(personal) no must be 10 digits required</Typography>;
        missingFields.push('Enter valid Contact(personal)');
      }

      if (employee?.panno !== '' && employee?.panno?.length !== 10) {
        newErrors.panno = <Typography style={{ color: 'red' }}>PAN No must be 10 digits required</Typography>;
      }

      if (employee?.panno === '' && employee?.panstatus === 'Have PAN') {
        newErrors.panno = <Typography style={{ color: 'red' }}>PAN No must be required</Typography>;
        missingFields.push('PAN No');
      } else if (!PanValidate(employee?.panno) && employee?.panstatus === 'Have PAN') {
        newErrors.panno = <Typography style={{ color: 'red' }}>Please Enter Valid PAN Number</Typography>;
        missingFields.push('Valid PAN No');
      }

      if (employee?.panrefno === '' && employee?.panstatus === 'Applied') {
        newErrors.panrefno = <Typography style={{ color: 'red' }}>Application Reference No must be required</Typography>;
        missingFields.push('Enter valid Application Reference');
      }

      if (!employee?.dob) {
        newErrors.dob = <Typography style={{ color: 'red' }}>DOB must be required</Typography>;
        missingFields.push('Date of Birth');
      }
      let final = croppedImage ? croppedImage : employee?.profileimage;
      if (!final) {
        newErrors.profile = <Typography style={{ color: 'red' }}>Profile Image must be required</Typography>;
        missingFields.push('Profile Image');
      }
      if (!employee?.aadhar) {
        newErrors.aadhar = <Typography style={{ color: 'red' }}> Aadhar must be required </Typography>;
        missingFields.push('Aadhar No');
      } else if (employee?.aadhar?.length < 12) {
        newErrors.aadhar = <Typography style={{ color: 'red' }}> Please Enter valid Aadhar Number </Typography>;
        missingFields.push('Enter valid Aadhar No');
      } else if (!AadharValidate(employee?.aadhar)) {
        newErrors.aadhar = <Typography style={{ color: 'red' }}> Please Enter valid Aadhar Number </Typography>;
        missingFields.push('Enter valid Aadhar No');
      }

      setErrors(newErrors);

      // If there are missing fields, show an alert with the list of them
      if (missingFields.length > 0) {
        // alert(`Please fill in the following fields: ${missingFields.join(", ")}`);

        setPopupContentMalert(`Please fill in the following fields: ${missingFields.join(', ')}`);
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else {
        if (Object.keys(newErrors).length === 0) {
          setNextBtnLoading(true);
          let res = await axios.post(SERVICE.DRAFTDUPLICATE, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            firstname: employee?.firstname,
            lastname: employee?.lastname,
            legalname: employee?.legalname,
            dob: employee?.dob,
            aadhar: employee?.aadhar,
            emergencyno: employee?.emergencyno,
            fromwhere: 'Intern',
          });

          if (res?.data?.success) {
            function cleanString(str) {
              // Trim spaces, then remove all dots
              const trimmed = str.trim();
              // const cleaned = trimmed.replace(/\./g, '');
              const cleaned = trimmed.replace(/[^a-zA-Z0-9 ]/g, '');

              // Return the cleaned string, or the original string if empty
              return cleaned.length > 0 ? cleaned : str;
            }

            async function checkCompanyName(employee) {
              const response = await axios.post(SERVICE.COMPANYNAME_DUPLICATECHECK_CREATE, {
                headers: {
                  Authorization: `Bearer ${auth.APIToken}`,
                },
                id: oldempid,
                aadhar: employee?.aadhar,
                firstname: employee?.firstname,
                mothername: employee?.mothername || '',
                lastname: employee?.lastname,
                dob: employee?.dob,
                employeename: `${cleanString(employee?.firstname?.toUpperCase().trim())}.${cleanString(employee?.lastname?.toUpperCase().trim())}`,
              });
              setcompanycaps(response?.data?.uniqueCompanyName);
            }

            setNextBtnLoading(true);

            if (employee?.faceDescriptor?.length > 0 && employee?.profileimage && !imageUploaded) {
              const response = await axios.post(`${SERVICE.DUPLICATECANDIDATEFACEDETECTVISITOR}`, {
                headers: {
                  Authorization: `Bearer ${auth.APIToken}`,
                },
                id: oldempid || null,
                faceDescriptor: Array.from(employee?.faceDescriptor),
              });

              if (response?.data?.matchfound) {
                setShowDupProfileVIsitor(response?.data?.matchedData);
                handleClickOpenerrpop();
                setNextBtnLoading(false);
                return;
              }
            }

            await checkCompanyName(employee);
            setNextBtnLoading(false);
            if (migrateData) filterCompanyDomain(migrateData?.company);
            nextStep(false);
          }
        }
      }
    } catch (err) {
      setNextBtnLoading(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

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

      console.log(filteredDatas, 'filteredDatas', roles, 'roles');

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

      if (item.status === 'Uploaded' && !item.file) return false;

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
    let trimmedWorkstation = primaryWorkStation == 'Please Select Primary Work Station' ? [] : primaryWorkStation;
    setLoading(true);
    setUserNameEmail(third);

    let newEmpCode = await EmployeeCodeAutoGenerate(selectedCompany, selectedBranch, selectedBranchCode, employee?.doj);
    try {
      let salarytable =
        salaryOption === 'Experience Based'
          ? [
              {
                movetolive: false,
                onboardas: 'Internship',
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
              {
                movetolive: false,
                onboardas: 'Internship',
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

      let hierarchyCheck = await axios.post(SERVICE.CHECKHIERARCHYADDNEWEMP, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: String(selectedCompany),
        department: String(employee?.department),
        designation: String(selectedDesignation),
        branch: String(selectedBranch),
        // workstation: String(selectedWorkStation),
        team: String(selectedTeam),
        unit: String(selectedUnit),
      });
      let hierarchyData = hierarchyCheck.data.resultString;

      if (hierarchyData && hierarchyData.length > 0) {
        function findUniqueEntries(array) {
          const seen = new Map();
          array.forEach((obj) => {
            const key = `${obj.company}-${obj.designationgroup}-${obj.department}-${obj.unit}-${obj.supervisorchoose[0]}-${obj.level}-${obj.mode}-${obj.branch}-${obj.team}`;
            if (!seen.has(key)) {
              seen.set(key, obj);
            }
          });
          return Array.from(seen.values());
        }

        // Find unique entries in the array
        const uniqueEntries = findUniqueEntries(hierarchyData);

        if (uniqueEntries.length > 0) {
          for (const item of uniqueEntries) {
            const res_queue = await axios.post(SERVICE.HIRERARCHI_CREATE, {
              headers: {
                Authorization: `Bearer ${auth.APIToken}`,
              },

              company: String(item.company),
              designationgroup: String(item.designationgroup),
              department: String(item.department),
              branch: String(item.branch),
              unit: String(item.unit),
              team: String(item.team),
              supervisorchoose: String(item.supervisorchoose),
              mode: String(item.mode),
              level: String(item.level),
              control: String(item.control),
              pagecontrols: item.pagecontrols,
              employeename: String(companycaps),
              access: 'all',
              action: Boolean(true),
              empbranch: String(selectedBranch),
              empunit: String(selectedUnit),
              empcode: String(employee?.wordcheck === false ? newEmpCode : employee?.empcode),

              empteam: String(selectedTeam),
              addedby: [
                {
                  name: String(usernameaddedby),
                  // date: String(new Date()),
                },
              ],
            });
          }
        } else {
          console.log('no update');
        }
      }
      const currentDate = moment();

      let resSetting = await axios.get(`${SERVICE.GET_OVERALL_SETTINGS}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const paswordupdateday = resSetting?.data?.overallsettings[0]?.passwordupdatedays || '';
      let rocketchatshiftgrouping = [];
      let rocketchatshift = [];

      if (employee?.shifttype === 'Standard') {
        if (employee?.shiftgrouping) {
          rocketchatshiftgrouping.push(employee?.shiftgrouping);
        }
        if (employee?.shifttiming) {
          rocketchatshift.push(employee?.shifttiming);
        }
      } else if (employee?.shifttype !== 'Standard') {
        if (todo && todo.length > 0) {
          // Iterate over the todo array and push shiftgrouping and shifttiming
          todo.forEach((item) => {
            if (item.shiftgrouping) {
              rocketchatshiftgrouping.push(item.shiftgrouping);
            }
            if (item.shifttiming) {
              rocketchatshift.push(item.shifttiming);
            }
          });
        }
      }
      let employees_data = await axios.post(SERVICE.USER_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        rejoineduser: oldempid,
        rejoineddetails: rejoineddetails?.length > 0 ? rejoineddetails.map((item, index) => (index === rejoineddetails.length - 1 ? { ...item, dateofrejoining: employee?.doj, rejoineduser: oldempid } : item)) : [],
        faceDescriptor: employee?.faceDescriptor || [],
        createrocketchat: Boolean(createRocketChat?.create),
        rocketchatshiftgrouping,
        rocketchatshift,
        rocketchatemail: String(createRocketChat?.create ? createRocketChat?.email : ''),
        rocketchatroles: createRocketChat?.create ? createRocketChat?.roles?.map((data) => data?.value) : [],
        createhiconnect: Boolean(createHiConnect?.createhiconnect),
        hiconnectemail: String(createHiConnect?.createhiconnect ? createHiConnect?.hiconnectemail : ''),
        hiconnectroles: createHiConnect?.createhiconnect ? createHiConnect?.hiconnectroles?.map((data) => data?.value) : [],
        candidateid: migrateData?.id ? String(migrateData?.id) : '',
        firstname: String(employee?.firstname),
        lastname: String(employee?.lastname),
        legalname: String(employee?.legalname),
        callingname: String(employee?.callingname?.toUpperCase()),
        prefix: String(employee?.prefix),
        fathername: String(employee?.fathername),
        mothername: String(employee?.mothername),
        gender: String(employee?.gender),
        maritalstatus: String(employee?.maritalstatus),
        dom: String(employee?.dom),
        dob: String(employee?.dob),
        bloodgroup: String(employee?.bloodgroup),
        religion: String(employee?.religion),

        location: String(employee?.location),
        email: String(employee?.email),
        companyemail: String(employee?.companyemail),
        contactpersonal: String(employee?.contactpersonal),
        contactfamily: String(employee?.contactfamily),
        emergencyno: String(employee?.emergencyno),
        doj: String(employee?.doj),
        dot: String(employee?.doj), // saved doj in dot for purpose
        aadhar: String(employee?.aadhar),
        panno: String(employee?.panstatus === 'Have PAN' ? employee?.panno : ''),
        panstatus: String(employee?.panstatus),
        panrefno: String(employee?.panstatus === 'Applied' ? employee?.panrefno : ''),

        referencetodo: referenceTodo.length === 0 ? [] : [...referenceTodo],
        contactno: String(employee?.contactno),
        details: String(employee?.details),
        username: enableLoginName ? String(third) : employee?.username,
        usernameautogenerate: Boolean(enableLoginName),
        workmode: String('Internship'),
        password: String(employee?.password),
        passexpdate: new Date(new Date().setDate(new Date().getDate() + Number(paswordupdateday))),
        autogeneratepassword: Boolean(employee?.autogeneratepassword),
        originalpassword: String(employee?.password),
        companyname: String(companycaps),
        company: String(selectedCompany),
        role: roles,
        branch: String(selectedBranch),
        unit: String(selectedUnit),
        floor: String(employee?.floor),
        area: String(employee?.area),
        department: String(employee?.department),
        team: String(selectedTeam),
        designation: String(selectedDesignation),
        employeecount: String(employee?.employeecount),
        systemmode: 'Active',
        shifttiming: String(employee?.shifttiming),
        shifttype: String(employee?.shifttype),
        shiftgrouping: String(employee?.shiftgrouping),
        attendancemode: employee?.attOptions?.length > 0 ? employee?.attOptions.filter((val) => valueAttMode.includes(val)) : valueAttMode,
        reportingto: String(employee?.reportingto),
        enableworkstation: employee?.workmode !== 'Remote' ? Boolean(enableWorkstation) : Boolean(false),
        // workstation: employee?.workmode !== 'Remote' ? (valueWorkStation.length === 0 ? primaryWorkStation : [primaryWorkStation, ...valueWorkStation]) : [primaryWorkStation, ...valueWorkStation],
        workstation: finalWorkStation,
        workstationshortname: shortnameArray,
        workstationinput: String(employee?.workmode === 'Remote' || employee?.ifoffice ? primaryWorkStationInput : ''),
        workstationofficestatus: Boolean(employee?.ifoffice),

        empcode: String(employee?.wordcheck === false ? newEmpCode : employee?.empcode),
        wordcheck: Boolean(employee?.wordcheck),
        intStartDate: String(employee?.intStartDate),
        intEndDate: String(employee?.intEndDate),
        modeOfInt: String(employee?.modeOfInt),
        intDuration: String(employee?.intDuration),
        intCourse: String(employee?.intCourse),

        pdoorno: String(employee?.pdoorno),
        pstreet: String(employee?.pstreet),
        parea: String(employee?.parea),
        plandmark: String(employee?.plandmark),
        ptaluk: String(employee?.ptaluk),
        ppost: String(employee?.ppost),
        ppincode: String(employee?.ppincode),
        paddresstype: String(employee?.paddresstype || ''),
        ppersonalprefix: String(employee?.ppersonalprefix || ''),
        presourcename: String(employee?.presourcename || ''),
        plandmarkandpositionalprefix: String(employee?.plandmarkandpositionalprefix || ''),
        pgpscoordination: String(employee?.pgpscoordination || ''),
        caddresstype: !employee?.samesprmnt ? String(employee?.caddresstype || '') : String(employee?.paddresstype || ''),
        cpersonalprefix: !employee?.samesprmnt ? String(employee?.cpersonalprefix || '') : String(employee?.ppersonalprefix || ''),
        cresourcename: !employee?.samesprmnt ? String(employee?.cresourcename || '') : String(employee?.presourcename || ''),
        clandmarkandpositionalprefix: !employee?.samesprmnt ? String(employee?.clandmarkandpositionalprefix || '') : String(employee?.plandmarkandpositionalprefix || ''),
        cgpscoordination: !employee?.samesprmnt ? String(employee?.cgpscoordination || '') : String(employee?.pgpscoordination || ''),
        pcountry: String(selectedCountryp?.name == undefined ? '' : selectedCountryp?.name),
        pstate: String(selectedStatep?.name == undefined ? '' : selectedStatep?.name),
        pcity: String(selectedCityp?.name == undefined ? '' : selectedCityp?.name),

        pgenerateviapincode: Boolean(employee?.pgenerateviapincode || false),
        pvillageorcity: String(employee?.pvillageorcity || ''),
        pdistrict: String(employee?.pdistrict || ''),
        cgenerateviapincode: !employee?.samesprmnt ? Boolean(employee?.cgenerateviapincode || false) : Boolean(employee?.pgenerateviapincode || false),
        cvillageorcity: !employee?.samesprmnt ? String(employee?.cvillageorcity || '') : String(employee?.pvillageorcity || ''),
        cdistrict: !employee?.samesprmnt ? String(employee?.cdistrict || '') : String(employee?.pdistrict || ''),

        samesprmnt: Boolean(employee?.samesprmnt),
        cdoorno: String(!employee?.samesprmnt ? employee?.cdoorno : employee?.pdoorno),
        cstreet: String(!employee?.samesprmnt ? employee?.cstreet : employee?.pstreet),
        carea: String(!employee?.samesprmnt ? employee?.carea : employee?.parea),
        clandmark: String(!employee?.samesprmnt ? employee?.clandmark : employee?.plandmark),
        ctaluk: String(!employee?.samesprmnt ? employee?.ctaluk : employee?.ptaluk),
        cpost: String(!employee?.samesprmnt ? employee?.cpost : employee?.ppost),
        cpincode: String(!employee?.samesprmnt ? employee?.cpincode : employee?.ppincode),

        ccountry: String(!employee?.samesprmnt ? selectedCountryc?.name : selectedCountryp?.name),
        cstate: String(!employee?.samesprmnt ? selectedStatec?.name : selectedStatep?.name),
        ccity: String(!employee?.samesprmnt ? selectedCityc?.name : selectedCityp?.name),

        bankdetails: bankTodo,

        eduTodo: [...eduTodo],
        addAddQuaTodo: [...addAddQuaTodo],
        workhistTodo: [...workhistTodo],
        status: isFormComplete,
        experience: month,
        clickedGenerate: String('Clicked'),
        percentage: completionPercentage,
        enquirystatus: String(employee?.enquirystatus === 'Please Select Status' ? 'Users Purpose' : employee?.enquirystatus),

        assignExpLog: [
          ...(salaryOption === 'Experience Based'
            ? [
                {
                  expmode: String(assignExperience?.assignExpMode),
                  expval: String(assignExperience?.assignExpvalue),

                  endexp: String(assignExperience?.assignEndExpvalue),
                  endexpdate: assignExperience?.assignEndExpvalue === 'Yes' ? String(assignExperience?.assignEndExpDate) : '',
                  endtar: String(assignExperience?.assignEndTarvalue),
                  endtardate: assignExperience?.assignEndTarvalue === 'Yes' ? String(assignExperience?.assignEndTarDate) : '',
                  updatedate: String(assignExperience?.updatedate),
                  type: String(''),
                  updatename: String(''),
                  salarycode: String(''),
                  basic: String('0'),
                  hra: String('0'),
                  conveyance: String('0'),
                  gross: String('0'),
                  medicalallowance: String('0'),
                  productionallowance: String('0'),
                  otherallowance: String('0'),
                  productionallowancetwo: String('0'),
                  pfdeduction: false,
                  esideduction: false,
                  ctc: String(''),
                  date: String(new Date()),
                },
              ]
            : [
                {
                  expmode: salarySetUpForm.mode,
                  salarycode: salarySetUpForm.salarycode === 'Please Select Salary Code' ? '' : salarySetUpForm.salarycode,
                  endexp: 'No',
                  endexpdate: '',
                  endtar: 'No',
                  endtardate: '',
                  basic: String(formValue?.basic),
                  hra: String(formValue?.hra),
                  conveyance: String(formValue?.conveyance),
                  gross: String(formValue?.gross),
                  medicalallowance: String(formValue?.medicalallowance),
                  productionallowance: String(formValue?.productionallowance),
                  otherallowance: String(formValue?.otherallowance),
                  productionallowancetwo: String(formValue?.productionallowancetwo),
                  pfdeduction: Boolean(formValue?.pfdeduction),
                  esideduction: Boolean(formValue?.esideduction),
                  ctc: String(Ctc),
                  updatedate: String(formValue?.startDate),
                  updatename: String(companycaps),
                  date: String(new Date()),
                  startmonth: String(formValue?.startmonth),
                  endmonth: String(''),
                  startyear: String(formValue?.startyear),
                  endyear: String(''),
                },
              ]),
        ],
        assignExpMode: String(salaryOption === 'Experience Based' ? assignExperience.assignExpMode : ''),

        assignExpvalue: String(salaryOption === 'Experience Based' ? assignExperience.assignExpvalue : ''),

        endexp: String(salaryOption === 'Experience Based' ? assignExperience.assignEndExpvalue : ''),
        endexpdate: salaryOption === 'Experience Based' ? (assignExperience.assignEndExpvalue === 'Yes' ? String(assignExperience.assignEndExpDate) : '') : '',
        endtar: String(salaryOption === 'Experience Based' ? assignExperience.assignEndTarvalue : ''),
        endtardate: salaryOption === 'Experience Based' ? (assignExperience.assignEndTarvalue === 'Yes' ? String(assignExperience.assignEndTarDate) : '') : '',
        updatedate: String(salaryOption === 'Experience Based' ? assignExperience.updatedate : ''),
        // type: String(assignExperience.assignExptype + "-" + assignExperience.assignTartype),
        date: String(new Date()),

        process: String(loginNotAllot.process),
        processduration: String(loginNotAllot.processduration),
        processtype: String(loginNotAllot.processtype),
        date: formattedDate,
        time: String(loginNotAllot.time),
        timemins: String(loginNotAllot.timemins),

        grosssalary: String(overallgrosstotal),
        modeexperience: String(modeexperience),
        targetexperience: String(targetexperience),
        targetpts: String(targetpts),

        departmentlog: [
          {
            userid: String(employee?.wordcheck === false ? newEmpCode : employee?.empcode),
            username: String(companycaps),
            department: String(employee?.department),
            startdate: String(employee?.doj),
            time: String(getCurrentTime()),
            branch: String(selectedBranch),
            unit: String(selectedUnit),
            team: String(selectedTeam),
            status: Boolean(employee?.statuss),
            updatedusername: String(isUserRoleAccess.companyname),
            updateddatetime: String(new Date()),
            companyname: String(selectedCompany),
            logeditedby: [],
          },
        ],

        designationlog: [
          {
            username: String(companycaps),
            updatedusername: String(isUserRoleAccess.companyname),
            updateddatetime: String(new Date()),
            companyname: String(selectedCompany),
            logeditedby: [],
            designation: String(selectedDesignation),
            startdate: String(employee?.doj),
            time: String(getCurrentTime()),
            branch: String(selectedBranch),
            unit: String(selectedUnit),
            team: String(selectedTeam),
          },
        ],
        processlog: [
          {
            company: String(selectedCompany),
            branch: String(selectedBranch),
            unit: String(selectedUnit),
            team: String(selectedTeam),
            empname: String(companycaps),
            // process: String(loginNotAllot.process),
            process: salaryOption === 'Experience Based' ? String(loginNotAllot?.process || '') : String(salarySetUpForm?.salarycode || ''),
            processduration: String(loginNotAllot.processduration),
            processtype: String(loginNotAllot.processtype),
            date: String(employee?.doj),
            updatedusername: String(isUserRoleAccess.companyname),
            updateddatetime: String(new Date()),
            logeditedby: [],
            time: `${loginNotAllot.time}:${loginNotAllot?.timemins}`,
          },
        ],
        boardingLog: [
          {
            username: String(companycaps),
            company: String(selectedCompany),
            startdate: String(employee?.doj),
            time: `${loginNotAllot.time}:${loginNotAllot?.timemins}`,
            branch: String(selectedBranch),
            logcreation: String('user'),
            unit: String(selectedUnit),
            team: String(selectedTeam),
            floor: String(employee?.floor),
            area: String(employee?.area),
            workmode: String(employee?.workmode),
            workstationofficestatus: Boolean(employee?.ifoffice),
            // workstation: employee?.workmode !== 'Remote' ? (valueWorkStation.length === 0 ? trimmedWorkstation : [primaryWorkStation, ...valueWorkStation]) : [primaryWorkStation, ...valueWorkStation],
            workstation: finalWorkStation,
            workstationshortname: shortnameArray,
            workstationinput: String(employee?.workmode === 'Remote' || employee?.ifoffice ? primaryWorkStationInput : ''),
            shifttype: String(employee?.shifttype),
            shifttiming: String(employee?.shifttiming),
            updatedusername: String(isUserRoleAccess.companyname),
            updateddatetime: String(new Date()),
            logeditedby: [],
            ischangecompany: true,
            ischangebranch: true,
            ischangeunit: true,
            ischangeteam: true,
            ischangefloor: true,
            ischangearea: true,
            ischangeworkstation: true,
            shiftgrouping: String(employee?.shiftgrouping),
            weekoff: [...valueCate],
            todo: employee?.shifttype === 'Standard' ? [] : [...todo],
          },
        ],

        addedby: [
          {
            name: String(usernameaddedby),
            // date: String(new Date()),
          },
        ],
      });

      const validTodos = getValidTodos(files, categoryDocument);
      const employeeDocuments = await uploadEmployeeDocuments({
        empcode: String(employee?.wordcheck === false ? newEmpCode : employee?.empcode),
        commonid: String(employees_data?.data?.user?._id),
        companyname: String(companycaps),
        type: 'Internship',
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
      const salaryTablefun = await salaryTableFunction({
        salarytable,
        salaryoption: salaryOption,
        empcode: String(employee?.wordcheck === false ? newEmpCode : employee?.empcode),
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

      // let employeeDocuments = await axios.post(SERVICE.EMPLOYEEDOCUMENT_CREATE, {
      //   profileimage: croppedImage ? String(croppedImage) : employee?.profileimage,
      //   files: [...files],
      //   commonid: employees_data?.data?.user?._id,
      //   empcode: String(employee?.wordcheck === false ? newEmpCode : employee?.empcode),
      //   companyname: String(companycaps),
      //   type: String('Internship'),
      //   addedby: [
      //     {
      //       name: String(usernameaddedby),
      //       // date: String(new Date()),
      //     },
      //   ],
      // });

      let res = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${oldempid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        successfullyrejoined: employees_data?.data?.user?._id,
        rejoineddetails: rejoineddetails?.length > 0 ? rejoineddetails.map((item, index) => (index === rejoineddetails.length - 1 ? { ...item, dateofrejoining: employee?.doj } : item)) : [],
      });

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
                employeecode: String(employee?.wordcheck === false ? newEmpCode : employee?.empcode),

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
      if (migrateData && from) {
        let updatedData = await axios.put(`${SERVICE.CANDIDATES_SINGLE}/${migrateData.id}`, {
          finalstatus: 'Added',
        });
      }

      const response = await fetch(SERVICE.EMAIL_SENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          message,
          email,
          company: selectedCompany,
        }),
      });
      if (response.ok) {
        setStatus('Email sent successfully');
      } else {
        setStatus('Error sending email');
      }

      //birthday mail
      const birthdayresponse = await fetch(SERVICE.BIRTHDAYEMAIL_SENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          date: moment(employee?.dob).year(currentDate.year()).format('YYYY-MM-DD'),
          time: '06:00',
          name,
          company: selectedCompany,
        }),
      });

      //work anniversary
      const weddingresponse = await fetch(SERVICE.WORKANNIVERSARYEMAIL_SENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          date: moment(employee?.doj).year(currentDate.year()).format('YYYY-MM-DD'),
          time: '06:00',
          name,
          company: selectedCompany,
        }),
      });
      if (weddingresponse.ok) {
        setStatus('Work Anniversary Email sent successfully');
      } else {
        setStatus('Error sending email');
      }

      //WEDIING EMAIL
      if (employee?.maritalstatus === 'Married') {
        const weddingresponse = await fetch(SERVICE.WEDDINGEMAIL_SENT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            date: moment(employee?.dom).year(currentDate.year()).format('YYYY-MM-DD'),
            time: '06:00',
            name,
            company: selectedCompany,
          }),
        });
        if (weddingresponse.ok) {
          setStatus('Wedding Anniversary Email sent successfully');
        } else {
          setStatus('Error sending email');
        }
      }
      setPopupContent('Added Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();

      if (employee?.enquirystatus === 'Enquiry Purpose') {
        backPage('/enquirypurposelist');
      } else {
        backPage('/internlist');
      }
      setLoading(false);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const [draftLoader, setDraftLoader] = useState(false);
  //Add employee details to the the Draft database
  const SendDraftRequest = async () => {
    let newEmpCode = await EmployeeCodeAutoGenerate(selectedCompany || '', selectedBranch || '', selectedBranchCode || '', employee?.doj || '');
    setDraftLoader(true);
    let trimmedWorkstation = primaryWorkStation == 'Please Select Primary Work Station' ? [] : primaryWorkStation;
    try {
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

      let employees_draft = await axios.post(SERVICE.DRAFT_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        createrocketchat: Boolean(createRocketChat?.create ? createRocketChat?.create : false),
        rocketchatemail: String(createRocketChat?.create ? createRocketChat?.email : ''),
        rocketchatroles: createRocketChat?.create ? createRocketChat?.roles?.map((data) => data?.value) : [],
        createhiconnect: Boolean(createHiConnect?.createhiconnect),
        hiconnectemail: String(createHiConnect?.createhiconnect ? createHiConnect?.hiconnectemail : ''),
        hiconnectroles: createHiConnect?.createhiconnect ? createHiConnect?.hiconnectroles?.map((data) => data?.value) : [],
        firstname: String(employee?.firstname || ''),
        lastname: String(employee?.lastname || ''),
        legalname: String(employee?.legalname || ''),
        callingname: String(employee?.callingname?.toUpperCase()),
        prefix: String(employee?.prefix || ''),
        fathername: String(employee?.fathername || ''),
        mothername: String(employee?.mothername || ''),
        gender: String(employee?.gender || ''),
        maritalstatus: String(employee?.maritalstatus || ''),
        dom: String(employee?.dom || ''),
        dob: String(employee?.dob || ''),
        bloodgroup: String(employee?.bloodgroup || ''),
        religion: String(employee?.religion || ''),
        accessibletodo: accessibleTodo,
        profileimage: croppedImage ? String(croppedImage) : employee?.profileimage,
        faceDescriptor: employee?.faceDescriptor || [],
        location: String(employee?.location || ''),
        email: String(employee?.email || ''),
        companyemail: String(employee?.companyemail || ''),
        contactpersonal: String(employee?.contactpersonal || ''),
        contactfamily: String(employee?.contactfamily || ''),
        emergencyno: String(employee?.emergencyno || ''),
        doj: String(employee?.doj || ''),
        dot: String(employee?.doj || ''), // saved doj in dot for purpose
        aadhar: String(employee?.aadhar || ''),
        panno: String(employee?.panstatus === 'Have PAN' ? employee?.panno : ''),
        panstatus: String(employee?.panstatus || ''),
        panrefno: String(employee?.panstatus === 'Applied' ? employee?.panrefno : ''),
        attendancemode: employee?.attOptions?.length > 0 ? employee?.attOptions.filter((val) => valueAttMode.includes(val)) : valueAttMode,
        referencetodo: referenceTodo.length === 0 ? [] : [...referenceTodo],
        contactno: String(employee?.contactno || ''),
        details: String(employee?.details || ''),
        username: enableLoginName ? String(third) : employee?.username,
        usernameautogenerate: Boolean(enableLoginName),
        workmode: String('Internship'),
        password: String(employee?.password || ''),
        autogeneratepassword: Boolean(employee?.autogeneratepassword || false),
        originalpassword: String(employee?.password || ''),
        companyname: String(companycaps || ''),
        company: String(selectedCompany || ''),
        role: roles || [],
        branch: String(selectedBranch || ''),
        unit: String(selectedUnit || ''),
        floor: String(employee?.floor || ''),
        area: String(employee?.area || ''),
        workstationinput: String(employee?.workmode === 'Remote' || employee?.ifoffice ? primaryWorkStationInput : ''),
        department: String(employee?.department || ''),
        team: String(selectedTeam || ''),
        designation: String(selectedDesignation || ''),
        employeecount: String(employee?.employeecount || ''),
        systemmode: 'Active',
        shifttiming: String(employee?.shifttiming || ''),
        shifttype: String(employee?.shifttype || ''),
        shiftgrouping: String(employee?.shiftgrouping || ''),
        files: [...files] || [],

        reportingto: String(employee?.reportingto || ''),
        enableworkstation: employee?.workmode !== 'Remote' ? Boolean(enableWorkstation) : Boolean(false),
        // workstation: employee?.workmode !== 'Remote' ? (valueWorkStation.length === 0 ? trimmedWorkstation : [primaryWorkStation, ...valueWorkStation]) : [primaryWorkStation, ...valueWorkStation],
        workstation: finalWorkStation,
        workstationshortname: shortnameArray,
        workstationofficestatus: Boolean(employee?.ifoffice),
        empcode: String(employee?.wordcheck === false ? newEmpCode : employee?.empcode),
        wordcheck: Boolean(employee?.wordcheck),
        intStartDate: String(employee?.intStartDate || ''),
        intEndDate: String(employee?.intEndDate || ''),
        modeOfInt: String(employee?.modeOfInt || ''),
        intDuration: String(employee?.intDuration || ''),
        intCourse: String(employee?.intCourse || ''),

        pdoorno: String(employee?.pdoorno || ''),
        pstreet: String(employee?.pstreet || ''),
        parea: String(employee?.parea || ''),
        plandmark: String(employee?.plandmark || ''),
        ptaluk: String(employee?.ptaluk || ''),
        ppost: String(employee?.ppost || ''),
        ppincode: String(employee?.ppincode || ''),
        paddresstype: String(employee?.paddresstype || ''),
        ppersonalprefix: String(employee?.ppersonalprefix || ''),
        presourcename: String(employee?.presourcename || ''),
        plandmarkandpositionalprefix: String(employee?.plandmarkandpositionalprefix || ''),
        pgpscoordination: String(employee?.pgpscoordination || ''),
        caddresstype: !employee?.samesprmnt ? String(employee?.caddresstype || '') : String(employee?.paddresstype || ''),
        cpersonalprefix: !employee?.samesprmnt ? String(employee?.cpersonalprefix || '') : String(employee?.ppersonalprefix || ''),
        cresourcename: !employee?.samesprmnt ? String(employee?.cresourcename || '') : String(employee?.presourcename || ''),
        clandmarkandpositionalprefix: !employee?.samesprmnt ? String(employee?.clandmarkandpositionalprefix || '') : String(employee?.plandmarkandpositionalprefix || ''),
        cgpscoordination: !employee?.samesprmnt ? String(employee?.cgpscoordination || '') : String(employee?.pgpscoordination || ''),
        pcountry: String(selectedCountryp?.name == undefined ? '' : selectedCountryp?.name),
        pstate: String(selectedStatep?.name == undefined ? '' : selectedStatep?.name),
        pcity: String(selectedCityp?.name == undefined ? '' : selectedCityp?.name),

        pgenerateviapincode: Boolean(employee?.pgenerateviapincode || false),
        pvillageorcity: String(employee?.pvillageorcity || ''),
        pdistrict: String(employee?.pdistrict || ''),
        cgenerateviapincode: !employee?.samesprmnt ? Boolean(employee?.cgenerateviapincode || false) : Boolean(employee?.pgenerateviapincode || false),
        cvillageorcity: !employee?.samesprmnt ? String(employee?.cvillageorcity || '') : String(employee?.pvillageorcity || ''),
        cdistrict: !employee?.samesprmnt ? String(employee?.cdistrict || '') : String(employee?.pdistrict || ''),

        samesprmnt: Boolean(employee?.samesprmnt),
        cdoorno: String(!employee?.samesprmnt ? employee?.cdoorno : employee?.pdoorno),
        cstreet: String(!employee?.samesprmnt ? employee?.cstreet : employee?.pstreet),
        carea: String(!employee?.samesprmnt ? employee?.carea : employee?.parea),
        clandmark: String(!employee?.samesprmnt ? employee?.clandmark : employee?.plandmark),
        ctaluk: String(!employee?.samesprmnt ? employee?.ctaluk : employee?.ptaluk),
        cpost: String(!employee?.samesprmnt ? employee?.cpost : employee?.ppost),
        cpincode: String(!employee?.samesprmnt ? employee?.cpincode : employee?.ppincode),

        ccountry: String(!employee?.samesprmnt ? selectedCountryc?.name : selectedCountryp?.name),
        cstate: String(!employee?.samesprmnt ? selectedStatec?.name : selectedStatep?.name),
        ccity: String(!employee?.samesprmnt ? selectedCityc?.name : selectedCityp?.name),

        fromwhere: String('Intern'),

        bankdetails: bankTodo,

        eduTodo: [...eduTodo],
        addAddQuaTodo: [...addAddQuaTodo],
        workhistTodo: [...workhistTodo],
        status: isFormComplete,
        experience: month,
        clickedGenerate: String('Clicked'),
        percentage: completionPercentage,
        enquirystatus: String(employee?.enquirystatus === 'Please Select Status' ? 'Users Purpose' : employee?.enquirystatus),

        assignExpLog: [
          ...(salaryOption === 'Experience Based'
            ? [
                {
                  expmode: String(assignExperience?.assignExpMode || ''),
                  expval: String(assignExperience?.assignExpvalue || ''),

                  endexp: String(assignExperience?.assignEndExpvalue || ''),
                  endexpdate: assignExperience?.assignEndExpvalue === 'Yes' ? String(assignExperience?.assignEndExpDate) : '',
                  endtar: String(assignExperience?.assignEndTarvalue || ''),
                  endtardate: assignExperience?.assignEndTarvalue === 'Yes' ? String(assignExperience?.assignEndTarDate) : '',
                  updatedate: String(assignExperience?.updatedate || ''),
                  type: String(''),
                  updatename: String(''),
                  salarycode: String(''),
                  basic: String('0'),
                  hra: String('0'),
                  conveyance: String('0'),
                  gross: String('0'),
                  medicalallowance: String('0'),
                  productionallowance: String('0'),
                  otherallowance: String('0'),
                  productionallowancetwo: String('0'),
                  pfdeduction: false,
                  esideduction: false,
                  ctc: String(''),
                  date: String(new Date()),
                },
              ]
            : [
                {
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
                  date: String(new Date()),
                  startmonth: String(formValue?.startmonth || ''),
                  endmonth: String(''),
                  startyear: String(formValue?.startyear || ''),
                  endyear: String(''),
                },
              ]),
        ],

        assignExpMode: String(salaryOption === 'Experience Based' ? assignExperience?.assignExpMode || '' : ''),

        assignExpvalue: String(salaryOption === 'Experience Based' ? assignExperience?.assignExpvalue || '' : ''),

        endexp: String(salaryOption === 'Experience Based' ? assignExperience?.assignEndExpvalue || '' : ''),
        endexpdate: salaryOption === 'Experience Based' ? (assignExperience?.assignEndExpvalue === 'Yes' ? String(assignExperience?.assignEndExpDate) : '') : '',
        endtar: String(salaryOption === 'Experience Based' ? assignExperience?.assignEndTarvalue || '' : ''),
        endtardate: salaryOption === 'Experience Based' ? (assignExperience?.assignEndTarvalue === 'Yes' ? String(assignExperience?.assignEndTarDate) : '') : '',
        updatedate: String(salaryOption === 'Experience Based' ? assignExperience?.updatedate || '' : ''),
        // process: String(loginNotAllot?.process || ''),
        process: salaryOption === 'Experience Based' ? String(loginNotAllot?.process || '') : String(salarySetUpForm?.salarycode || ''),
        processduration: String(loginNotAllot?.processduration || ''),
        processtype: String(loginNotAllot?.processtype || ''),
        date: formattedDate,
        time: String(loginNotAllot?.time || ''),
        timemins: String(loginNotAllot?.timemins || ''),

        grosssalary: String(overallgrosstotal || ''),
        modeexperience: String(modeexperience || ''),
        targetexperience: String(targetexperience || ''),
        targetpts: String(targetpts || ''),

        departmentlog: [
          {
            userid: String(employee?.wordcheck === false ? newEmpCode : employee?.empcode),
            username: String(companycaps || ''),
            department: String(employee?.department || ''),
            updatedusername: String(isUserRoleAccess.companyname || ''),
            updateddatetime: String(new Date()),
            logeditedby: [],
            startdate: String(employee?.doj || ''),
            time: String(getCurrentTime()),
            branch: String(selectedBranch || ''),
            unit: String(selectedUnit || ''),
            team: String(selectedTeam || ''),
            status: Boolean(employee?.statuss || ''),
          },
        ],

        designationlog: [
          {
            username: String(companycaps || ''),
            designation: String(selectedDesignation || ''),
            startdate: String(employee?.doj || ''),
            time: String(getCurrentTime()),
            branch: String(selectedBranch || ''),
            updatedusername: String(isUserRoleAccess.companyname || ''),
            updateddatetime: String(new Date() || ''),
            logeditedby: [],
            unit: String(selectedUnit || ''),
            team: String(selectedTeam || ''),
            date: String(employee?.doj || ''),
          },
        ],
        processlog: [
          {
            company: String(selectedCompany || ''),
            branch: String(selectedBranch || ''),
            unit: String(selectedUnit || ''),
            team: String(selectedTeam || ''),
            empname: String(companycaps || ''),
            updatedusername: String(isUserRoleAccess.companyname || ''),
            updateddatetime: String(new Date() || ''),
            logeditedby: [],
            // process: String(loginNotAllot?.process || ''),
            process: salaryOption === 'Experience Based' ? String(loginNotAllot?.process || '') : String(salarySetUpForm?.salarycode || ''),
            processduration: String(loginNotAllot?.processduration || ''),
            processtype: String(loginNotAllot?.processtype || ''),
            date: String(employee?.doj || ''),
            time: `${loginNotAllot?.time}:${loginNotAllot?.timemins}`,
          },
        ],
        boardingLog: [
          {
            workmode: String(employee?.workmode),
            workstationofficestatus: Boolean(employee?.ifoffice),
            username: String(companycaps),
            company: String(selectedCompany),
            startdate: String(employee?.doj),
            time: `${loginNotAllot.time}:${loginNotAllot?.timemins}`,
            branch: String(selectedBranch),
            logcreation: String('user'),
            unit: String(selectedUnit),
            team: String(selectedTeam),
            floor: String(employee?.floor),
            area: String(employee?.area),
            // workstation:
            //   employee?.workmode !== "Remote"
            //     ? valueWorkStation.length === 0
            //       ? trimmedWorkstation
            //       : [primaryWorkStation, ...valueWorkStation]
            //     : [primaryWorkStation, ...valueWorkStation],
            workstation: finalWorkStation,
            workstationshortname: shortnameArray,
            workstationinput: String(employee?.workmode === 'Remote' || employee?.ifoffice ? primaryWorkStationInput : ''),
            shifttype: String(employee?.shifttype),
            shifttiming: String(employee?.shifttiming),
            updatedusername: String(isUserRoleAccess.companyname),
            updateddatetime: String(new Date()),
            logeditedby: [],
            ischangecompany: true,
            ischangebranch: true,
            ischangeunit: true,
            ischangeteam: true,
            ischangefloor: true,
            ischangearea: true,
            ischangeworkstation: true,
            ischangeworkmode: true,
            shiftgrouping: String(employee?.shiftgrouping),
            weekoff: [...valueCate],
            todo: employee?.shifttype === 'Standard' ? [] : [...todo],
          },
        ],
        employee: [
          {
            username: String(companycaps || ''),
            company: String(selectedCompany || ''),
            branch: String(selectedBranch || ''),
            unit: String(selectedUnit || ''),
            team: String(selectedTeam || ''),
            shifttiming: String(employee?.shifttiming || ''),
            shiftgrouping: String(employee?.shiftgrouping || ''),
            // process: String(loginNotAllot?.process === 'Please Select Process' ? '' : loginNotAllot?.process),
            process: salaryOption === 'Experience Based' ? String(loginNotAllot?.process || '') : String(salarySetUpForm?.salarycode || ''),
            startdate: formattedDate,
            time: String(getCurrentTime()),
          },
        ],

        addedby: [
          {
            name: String(usernameaddedby),
            // date: String(new Date()),
          },
        ],
      });

      setDraftLoader(false);
      backPage('/interndraftlist');
    } catch (err) {
      setDraftLoader(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const nextStep = (employeenameduplicate) => {
    const newErrors = {};

    // Check the validity of field1

    if (!employee?.firstname) {
      newErrors.firstname = <Typography style={{ color: 'red' }}>First name must be required</Typography>;
    }

    if (!employee?.lastname) {
      newErrors.lastname = <Typography style={{ color: 'red' }}> Last Name be required </Typography>;
    } else if (employee?.lastname.length < 3) {
      newErrors.lastname = <Typography style={{ color: 'red' }}> Last Name must be 3 characters! </Typography>;
    }
    if (!employee?.legalname) {
      newErrors.legalname = <Typography style={{ color: 'red' }}>Legal name must be required</Typography>;
    }
    if (!employee?.callingname) {
      newErrors.callingname = <Typography style={{ color: 'red' }}>Calling name must be required</Typography>;
    }
    // if (
    //   employee?.callingname !== "" &&
    //   employee?.legalname !== "" &&
    //   employee?.callingname?.toLowerCase() === employee?.legalname?.toLowerCase()
    // ) {
    //   newErrors.callingname = (
    //     <Typography style={{ color: "red" }}>
    //       Legal Name and Calling Name can't be same
    //     </Typography>
    //   );
    // }

    // if (employeenameduplicate && employee?.firstname && employee?.lastname) {
    //   newErrors.duplicatefirstandlastname = (
    //     <Typography style={{ color: "red" }}>
    //       First name and Last name already exist
    //     </Typography>
    //   );
    // }

    if (!employee?.religion) {
      newErrors.religion = <Typography style={{ color: 'red' }}>Religion must be required</Typography>;
    }

    if (!employee?.email) {
      newErrors.email = <Typography style={{ color: 'red' }}>Email must be required</Typography>;
    } else if (!isValidEmail) {
      newErrors.email = <Typography style={{ color: 'red' }}>Please enter valid email</Typography>;
    }

    if (employee?.maritalstatus === 'Married' && !employee?.dom) {
      newErrors.dom = <Typography style={{ color: 'red' }}>DOM must be required</Typography>;
    }
    if (!employee?.emergencyno) {
      newErrors.emergencyno = <Typography style={{ color: 'red' }}>Emergency no must be required</Typography>;
    } else if (employee?.emergencyno.length !== 10) {
      newErrors.emergencyno = <Typography style={{ color: 'red' }}>Emergency no must be 10 digits required</Typography>;
    }
    if (employee?.contactfamily === '') {
      newErrors.contactfamily = <Typography style={{ color: 'red' }}>Contact(Family) no must be required</Typography>;
    }
    if (employee?.contactfamily !== '' && employee?.contactfamily.length !== 10) {
      newErrors.contactfamily = <Typography style={{ color: 'red' }}>Contact(Family) no must be 10 digits required</Typography>;
    }
    if (employee?.contactpersonal === '') {
      newErrors.contactpersonal = <Typography style={{ color: 'red' }}>Contact(personal) no must be required</Typography>;
    }
    if (employee?.contactpersonal !== '' && employee?.contactpersonal.length !== 10) {
      newErrors.contactpersonal = <Typography style={{ color: 'red' }}>Contact(personal) no must be 10 digits required</Typography>;
    }
    if (employee?.panno !== '' && employee?.panno?.length !== 10) {
      newErrors.panno = <Typography style={{ color: 'red' }}>PAN No no must be 10 digits required</Typography>;
    }

    if (employee?.panno === '' && employee?.panstatus === 'Have PAN') {
      newErrors.panno = <Typography style={{ color: 'red' }}>PAN No must be required</Typography>;
    } else if (!PanValidate(employee?.panno) && employee?.panstatus === 'Have PAN') {
      newErrors.panno = <Typography style={{ color: 'red' }}>Please Enter Valid PAN Number</Typography>;
    }

    if (employee?.panrefno === '' && employee?.panstatus === 'Applied') {
      newErrors.panrefno = <Typography style={{ color: 'red' }}>Application Reference No must be required</Typography>;
    }

    if (!employee?.dob) {
      newErrors.dob = <Typography style={{ color: 'red' }}>DOB must be required</Typography>;
    }
    let final = croppedImage ? croppedImage : employee?.profileimage;
    if (!final) {
      newErrors.profile = <Typography style={{ color: 'red' }}>Profile Image must be required</Typography>;
    }
    if (!employee?.aadhar) {
      newErrors.aadhar = <Typography style={{ color: 'red' }}> Aadhar must be required </Typography>;
    } else if (employee?.aadhar.length < 12) {
      newErrors.aadhar = <Typography style={{ color: 'red' }}> Please Enter valid Aadhar Number </Typography>;
    } else if (!AadharValidate(employee?.aadhar)) {
      newErrors.aadhar = <Typography style={{ color: 'red' }}> Please Enter valid Aadhar Number </Typography>;
    }
    // setStep(step + 1);
    setErrors(newErrors);

    // If there are no errors, submit the form
    if (Object.keys(newErrors).length === 0) {
      setStep(step + 1);
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
          if (todo.status === 'Uploaded' && !todo.file) {
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
  const nextStepFour = () => {
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
      setStep(step + 1);
    }

    // setStep(step + 1);
    // setErrors(newErrors);

    // If there are no errors, submit the form
    // if (Object.keys(newErrors).length === 0) {
    //   setStep(step + 1);
    // }
  };
  const nextStepAddress = () => {
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
        setStep(step + 1);
      }
    }
  };
  const [finderrorindex, setFinderrorindex] = useState([]);
  const [finderrorindexgrp, setFinderrorindexgrp] = useState([]);
  const [finderrorindexshift, setFinderrorindexshift] = useState([]);

  //login detail validation
  const nextStepLog = () => {
    const checkShiftMode = todo?.filter((d) => d.shiftmode === 'Please Select Shift Mode');
    const checkShiftGroup = todo?.filter((d) => d.shiftmode === 'Shift' && d.shiftgrouping === 'Please Select Shift Grouping');
    const checkShift = todo?.filter((d) => d.shiftmode === 'Shift' && d.shifttiming === 'Please Select Shift');

    let value = todo.reduce((indexes, obj, index) => {
      if (obj.shiftmode === 'Please Select Shift Mode') {
        // Check if the object has the 'name' property
        indexes.push(index);
      }
      return indexes;
    }, []);

    setFinderrorindex(value);

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

    let valuegrp = todo.reduce((indexes, obj, index) => {
      if (obj.shiftmode === 'Shift' && obj.shiftgrouping === 'Please Select Shift Grouping') {
        // Check if the object has the 'name' property
        indexes.push(index);
      }
      return indexes;
    }, []);

    setFinderrorindexgrp(valuegrp);

    let valuegrpshift = todo.reduce((indexes, obj, index) => {
      if (obj.shiftmode === 'Shift' && obj.shifttiming === 'Please Select Shift') {
        // Check if the object has the 'name' property
        indexes.push(index);
      }
      return indexes;
    }, []);

    setFinderrorindexshift(valuegrpshift);

    const newErrorsLog = {};
    const missingFieldstwo = [];

    if (!enableLoginName && employee?.username === '') {
      newErrorsLog.username = <Typography style={{ color: 'red' }}>username must be required</Typography>;
      missingFieldstwo.push('User Name');
    } else if (!enableLoginName && allUsersLoginName.includes(employee?.username)) {
      newErrorsLog.username = <Typography style={{ color: 'red' }}>username already exist</Typography>;
      missingFieldstwo.push('User Already Exists');
    }
    // Check the validity of field1
    let validPassword = validatePassword(employee?.password, overllsettings);
    if (!validPassword?.isValid) {
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

    if (!selectedCompany) {
      newErrorsLog.company = <Typography style={{ color: 'red' }}>Company must be required</Typography>;
      missingFieldstwo.push('Company');
    }

    if (!selectedBranch) {
      newErrorsLog.branch = <Typography style={{ color: 'red' }}>Branch must be required</Typography>;
      missingFieldstwo.push('Branch');
    }

    if (!newval && employee?.wordcheck === false) {
      newErrorsLog.empcode = <Typography style={{ color: 'red' }}>EmpCode must be required</Typography>;
      missingFieldstwo.push('Work Mode');
    }

    if (employee?.empcode === '' && employee?.wordcheck === true) {
      newErrorsLog.empcode = <Typography style={{ color: 'red' }}>EmpCode must be required</Typography>;
      missingFieldstwo.push('Empcode');
    }

    if ((employee?.wordcheck === false && empcodelimitedAll?.includes(newval)) || (employee?.wordcheck === true && empcodelimitedAll?.includes(employee?.empcode))) {
      newErrorsLog.empcode = <Typography style={{ color: 'red' }}>Empcode Already Exist</Typography>;
      missingFieldstwo.push('Empcode Already Exist');
    }

    if (employee?.wordcheck === true && newval?.toLowerCase() === employee?.empcode?.toLowerCase()) {
      newErrorsLog.empcode = <Typography style={{ color: 'red' }}>Empcode Auto and Manual Cant be Same</Typography>;
      missingFieldstwo.push('Empcode Auto and Manual Cant be Same');
    }

    if (!selectedUnit) {
      newErrorsLog.unit = <Typography style={{ color: 'red' }}>Unit must be required</Typography>;
      missingFieldstwo.push('Unit');
    }
    if (!selectedTeam) {
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
    if (!selectedDesignation) {
      newErrorsLog.designation = <Typography style={{ color: 'red' }}>Designation must be required</Typography>;
      missingFieldstwo.push('Designation');
    }

    if ((employee?.employeecount === '' || employee?.employeecount === '0') && employee?.prod) {
      newErrorsLog.systemcount = <Typography style={{ color: 'red' }}>System Count must be required</Typography>;
      missingFieldstwo.push('System Count');
    }
    if ((primaryWorkStation === 'Please Select Primary Work Station' || primaryWorkStation === '' || !primaryWorkStation) && employee?.prod) {
      newErrorsLog.primaryworkstation = <Typography style={{ color: 'red' }}>Primary Work Station must be required</Typography>;
      missingFieldstwo.push('Primary Work Station');
    }

    if (employee?.intStartDate === '' || !employee?.intStartDate) {
      newErrorsLog.internstartdate = <Typography style={{ color: 'red' }}>Intern Start Date must be required</Typography>;
      missingFieldstwo.push('Intern Start Date');
    }
    if (employee?.intStartDate === '' || !employee?.intStartDate) {
      newErrorsLog.intEndDate = <Typography style={{ color: 'red' }}>Intern End Date must be required</Typography>;
      missingFieldstwo.push('Intern End Date');
    }

    let systemCount = valueWorkStation?.length || 0;

    // Add 1 if primaryWorkStation is valid (not empty or default)
    if (primaryWorkStation !== 'Please Select Primary Work Station' && primaryWorkStation !== '' && primaryWorkStation !== undefined) {
      systemCount += 1;
    }

    // Check if system count exceeds allowed employee count
    if (Number(employee?.employeecount) && systemCount > Number(employee?.employeecount)) {
      newErrorsLog.workstation = <Typography style={{ color: 'red' }}>Work Station Exceeds System Count</Typography>;
      missingFieldstwo.push('Work Station Exceeds System Count');
    }

    if (!employee?.department) {
      newErrorsLog.department = <Typography style={{ color: 'red' }}>Department must be required</Typography>;
      missingFieldstwo.push('Department');
    }
    if (employee?.shifttype === 'Please Select Shift Type') {
      newErrorsLog.shifttype = <Typography style={{ color: 'red' }}>Shifttype must be required</Typography>;
      missingFieldstwo.push('Shift Type');
    }

    if (employee?.shifttype === 'Standard') {
      if (employee?.shiftgrouping === 'Please Select Shift Grouping') {
        newErrorsLog.shiftgrouping = <Typography style={{ color: 'red' }}>Shiftgrouping must be required</Typography>;
        missingFieldstwo.push('Shift Grouping');
      } else if (employee?.shifttiming === 'Please Select Shift') {
        newErrorsLog.shifttiming = <Typography style={{ color: 'red' }}>Shifttiming must be required</Typography>;
        missingFieldstwo.push('Shift');
      }
    }

    let oneweekrotation = weekoptions2weeks?.filter((item) => !todo?.some((val) => val?.week === item))?.length;
    let twoweekrotation = weekoptions1month?.filter((item) => !todo?.some((val) => val?.week === item))?.length;
    let onemonthrotation = weekoptions2months?.filter((item) => !todo?.some((val) => val?.week === item))?.length;

    if (employee?.shifttype === 'Daily' && todo?.length === 0) {
      newErrorsLog.shiftweeks = <Typography style={{ color: 'red' }}>Please Add all the weeks in the todo</Typography>;
      missingFieldstwo.push('Shift Todo');
    } else if (employee?.shifttype === '1 Week Rotation' && oneweekrotation > 0) {
      newErrorsLog.shiftweeks = <Typography style={{ color: 'red' }}>Please Add all the weeks in the todo</Typography>;
      missingFieldstwo.push('Shift Todo');
    } else if (employee?.shifttype === '2 Week Rotation' && twoweekrotation > 0) {
      newErrorsLog.shiftweeks = <Typography style={{ color: 'red' }}>Please Add all the weeks in the todo</Typography>;
      missingFieldstwo.push('Shift Todo');
    } else if (employee?.shifttype === '1 Month Rotation' && onemonthrotation > 0) {
      newErrorsLog.shiftweeks = <Typography style={{ color: 'red' }}>Please Add all the weeks in the todo</Typography>;
      missingFieldstwo.push('Shift Todo');
    }

    if ((employee?.shifttype === 'Daily' || employee?.shifttype === '1 Week Rotation' || employee?.shifttype === '2 Week Rotation' || employee?.shifttype === '1 Month Rotation') && checkShiftMode.length > 0) {
      newErrorsLog.checkShiftMode = <Typography style={{ color: 'red' }}>Shift Mode must be required</Typography>;
      missingFieldstwo.push('Shift Mode');
    }
    if ((employee?.shifttype === 'Daily' || employee?.shifttype === '1 Week Rotation' || employee?.shifttype === '2 Week Rotation' || employee?.shifttype === '1 Month Rotation') && checkShiftGroup.length > 0) {
      newErrorsLog.checkShiftGroup = <Typography style={{ color: 'red' }}>Shift Group must be required</Typography>;
      missingFieldstwo.push('Shift Group');
    }

    if ((employee?.shifttype === 'Daily' || employee?.shifttype === '1 Week Rotation' || employee?.shifttype === '2 Week Rotation' || employee?.shifttype === '1 Month Rotation') && checkShift.length > 0) {
      newErrorsLog.checkShift = <Typography style={{ color: 'red' }}>Shift must be required</Typography>;
      missingFieldstwo.push('Shift');
    }

    if (!employee?.reportingto) {
      newErrorsLog.reportingto = <Typography style={{ color: 'red' }}>Reporting must be required</Typography>;
      missingFieldstwo.push('Reporting To');
    }
    if (getDepartment !== 'Internship' && !selectedTeam) {
      newErrorsLog.team = <Typography style={{ color: 'red' }}>Please select Team</Typography>;
      missingFieldstwo.push('Select Team');
    }

    if (employee?.shiftgrouping == '' || employee?.shiftgrouping == undefined) {
      newErrorsLog.shiftgrouping = <Typography style={{ color: 'red' }}>Please Select ShiftGroup</Typography>;
      missingFieldstwo.push('Select Shift Group');
    }

    // if (
    //   employee?.shifttiming == "" ||
    //   employee?.shifttiming == undefined ||
    //   employee?.shifttiming == "Please Select Shift"
    // ) {
    //   newErrorsLog.shifttiming = (
    //     <Typography style={{ color: "red" }}>
    //       Please select Shifttime
    //     </Typography>
    //   );
    // }

    if (employee?.ifoffice === true && primaryWorkStationInput === '') {
      newErrorsLog.primaryworkstationinput = <Typography style={{ color: 'red' }}>Work Station (WFH) must be required</Typography>;
      missingFieldstwo.push('Work Station(WFH)');
    }

    if (selectedAttMode.length === 0) {
      newErrorsLog.attmode = <Typography style={{ color: 'red' }}>Attendance Mode must be required</Typography>;
      missingFieldstwo.push('Attendance Mode');
    }

    if (employee?.enquirystatus === 'Please Select Status' && (isUserRoleAccess.role.includes('Manager') || isUserRoleCompare.includes('lassignenquierypurpose'))) {
      newErrorsLog.enquirystatus = <Typography style={{ color: 'red' }}>Status must be required</Typography>;
      missingFieldstwo.push('Status');
    }

    // if (!employee?.companyemail) {
    //   newErrorsLog.companyemail = (
    //     <Typography style={{ color: "red" }}>
    //       Company Email must be required
    //     </Typography>
    //   );
    // } else
    // if (!validateEmail(employee?.companyemail) && employee?.companyemail) {
    //   newErrorsLog.companyemail = (
    //     <Typography style={{ color: "red" }}>
    //       Please enter valid Company Email
    //     </Typography>
    //   );
    //   missingFieldstwo.push("Enter Valid Company Email");
    // }

    if (!employee?.doj) {
      newErrorsLog.doj = <Typography style={{ color: 'red' }}>DOT must be required</Typography>;
      missingFieldstwo.push('DOT');
    }

    // setStep(step + 1);
    setErrorsLog({ ...newErrorsLog, ...todo });

    if (missingFieldstwo.length > 0) {
      setPopupContentMalert(`Please fill in the following fields: ${missingFieldstwo.join(', ')}`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      // If there are no errors, submit the form
      if (Object.keys(newErrorsLog).length === 0) {
        setStep(step + 1);
      }
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmitMulti = (e) => {
    e.preventDefault();

    const newErrorsLog = {};

    // Check the validity of field1
    // if (!assignExperience.updatedate) {
    //   newErrorsLog.updatedate = (
    //     <Typography style={{ color: "red" }}>Please Select Date</Typography>
    //   );
    // }
    if (salaryOption === 'Experience Based' && assignExperience.assignExpMode !== 'Auto Increment' && assignExperience.assignExpvalue === '') {
      newErrorsLog.value = <Typography style={{ color: 'red' }}>Please Enter Value</Typography>;
    }
    if (salaryOption === 'Experience Based' && assignExperience.assignEndExpvalue === 'Yes' && assignExperience.assignEndExpDate === '') {
      newErrorsLog.endexpdate = <Typography style={{ color: 'red' }}>Please Select EndExp Date</Typography>;
    }
    if (salaryOption === 'Experience Based' && assignExperience.assignEndTarvalue === 'Yes' && assignExperience.assignEndTarDate === '') {
      newErrorsLog.endtardate = <Typography style={{ color: 'red' }}>Please Select EndTar Date</Typography>;
    }
    setErrorsLog(newErrorsLog);

    // If there are no errors, submit the form
    if (Object.keys(newErrorsLog).length === 0) {
      sendRequest();
    }
  };

  //Submit Button For Add Employee draft section
  const handleDraftSubmit = (e) => {
    e.preventDefault();
    SendDraftRequest();
  };

  const renderStepOne = () => {
    return (
      <>
        <Headtitle title={'INTERN CREATE'} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container alignItems="center"></Grid>
          <Grid item md={10} xs={12} sm={12}>
            <Box sx={userStyle.selectcontainer}>
              <Typography
                sx={userStyle.SubHeaderText}
                onClick={() => {
                  console.log(employee?.profileimage);
                  console.log(getImg);
                }}
              >
                Personal Information{' '}
              </Typography>
              <br />
              <br />
              <>
                <Grid container spacing={2}>
                  <Grid item md={6} sm={6} xs={12}>
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
                            value={employee?.prefix}
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
                            value={employee?.firstname}
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
                                callingname: cname?.toUpperCase(),
                                firstname: cleanString(e.target.value.toUpperCase()),
                                prefix: employee?.prefix,
                              });
                            }}
                          />
                        </FormControl>
                        {errors.firstname && <div>{errors.firstname}</div>}
                        {errors.duplicatefirstandlastname && <div>{errors.duplicatefirstandlastname}</div>}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item md={6} sm={6} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Last Name<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Last Name"
                        value={employee?.lastname}
                        onChange={(e) => {
                          function cleanString(str) {
                            // Trim spaces, then remove all dots
                            const trimmed = str.trim();
                            const cleaned = trimmed.replace(/[^a-zA-Z0-9 ]/g, '');

                            return cleaned;
                          }
                          fetchUserName();
                          setSecond(e.target.value.toLowerCase().split(' ').join(''));
                          setUserName({
                            ...userName,
                            fname: employee?.firstname.toLowerCase() + e.target.value.slice(0, 1).toLowerCase(),
                            length: employee?.lastname.slice(0, 1).length,
                          });
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
                  <Grid item md={3} sm={6} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Legal Name<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Legal Name"
                        value={employee?.legalname}
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
                  <Grid item md={3} sm={6} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Calling Name<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Calling Name"
                        value={employee?.callingname?.toUpperCase()}
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
                  <Grid item md={3} sm={6} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Father Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Father Name"
                        value={employee?.fathername}
                        onChange={(e) => {
                          setEmployee({
                            ...employee,
                            fathername: e.target.value,
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} sm={6} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Mother Name</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Mother Name"
                        value={employee?.mothername}
                        onChange={(e) => {
                          setEmployee({
                            ...employee,
                            mothername: e.target.value,
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item md={9} sm={12} xs={12}>
                    <Grid container spacing={2}>
                      <Grid item md={3} sm={12} xs={12}>
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
                              label: employee?.gender === '' || employee?.gender == undefined ? 'Select Gender' : employee?.gender,
                              value: employee?.gender === '' || employee?.gender == undefined ? 'Select Gender' : employee?.gender,
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
                              label: employee?.maritalstatus === '' || employee?.maritalstatus == undefined ? 'Select Marital Status' : employee?.maritalstatus,
                              value: employee?.maritalstatus === '' || employee?.maritalstatus == undefined ? 'Select Marital Status' : employee?.maritalstatus,
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
                      {employee?.maritalstatus === 'Married' && (
                        <Grid item md={4} sm={6} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Date Of Marriage<b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <OutlinedInput
                              id="component-outlined"
                              value={employee?.dom}
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
                      <Grid item md={2.7} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Date Of Birth<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            value={employee?.dob}
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
                          <OutlinedInput id="component-outlined" type="number" value={employee?.dob === '' ? '' : employee?.age} readOnly />
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
                              label: employee?.religion === '' || employee?.religion == undefined ? 'Select Religion' : employee?.religion,
                              value: employee?.religion === '' || employee?.religion == undefined ? 'Select Religion' : employee?.religion,
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
                              label: employee?.bloodgroup === '' || employee?.bloodgroup == undefined ? 'Select Blood Group' : employee?.bloodgroup,
                              value: employee?.bloodgroup === '' || employee?.bloodgroup == undefined ? 'Select Blood Group' : employee?.bloodgroup,
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
                            value={employee?.email}
                            onChange={(e) => {
                              setEmployee({
                                ...employee,
                                email: e.target.value,
                              });
                              setIsValidEmail(validateEmail(e.target.value));
                              setEmail(e.target.value);
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
                            value={employee?.location}
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
                            value={employee?.contactpersonal}
                            onChange={(e) => {
                              handlechangecontactpersonal(e);
                            }}
                          />
                        </FormControl>
                        {errors.contactpersonal && <div>{errors.contactpersonal}</div>}
                      </Grid>
                      {/* </Grid>
                      <Grid container spacing={2}> */}
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
                            value={employee?.contactfamily}
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
                            type="Number"
                            sx={userStyle.input}
                            placeholder="Emergency No (Emergency)"
                            value={employee?.emergencyno}
                            onChange={(e) => {
                              handlechangeemergencyno(e);
                            }}
                          />
                        </FormControl>
                        {errors.emergencyno && <div>{errors.emergencyno}</div>}
                      </Grid>
                      {/* </Grid>
                      <Grid container spacing={2}> */}

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
                            value={employee?.aadhar}
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
                              label: employee?.panstatus === '' || employee?.panstatus == undefined ? 'Select PAN Status' : employee?.panstatus,
                              value: employee?.panstatus === '' || employee?.panstatus == undefined ? 'Select PAN Status' : employee?.panstatus,
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
                              value={employee?.panno}
                              onChange={(e) => {
                                if (e.target.value.length < 11) {
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
                              value={employee?.panrefno}
                              onChange={(e) => {
                                if (e.target.value.length < 16) {
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
                      Profile Image<b style={{ color: 'red' }}>*</b>
                    </InputLabel>

                    {croppedImage && (
                      <>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Color Picker */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                                ...buttonStyles?.buttonsubmit,
                                border: '1px solid  black',
                              }}
                            ></LoadingButton>
                          </div>
                        </div>
                      </>
                    )}
                    <div>
                      {employee?.profileimage && !croppedImage ? (
                        <>
                          <Cropper
                            style={{ height: 120, width: '100%' }}
                            aspectRatio={1 / 1}
                            // src={selectedFile}
                            src={employee?.profileimage}
                            ref={cropperRef}
                          />
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
                          {!employee?.profileimage && (
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
                          {employee?.profileimage && (
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
                size="small"
                variant="contained"
                loading={nextBtnLoading}
                color="primary"
                onClick={draftduplicateCheck}
                sx={{
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                Next
              </LoadingButton>
              {/* <Link
                to="/internlist"
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
              {/* {employee?.firstname !== "" &&
                employee?.lastname !== "" &&
                employee?.legalname !== "" &&
                employee?.dob !== "" &&
                employee?.aadhar !== "" &&
                employee?.emergencyno !== "" && (
                  <LoadingButton
                    size="small"
                    variant="contained"
                    loading={draftLoader}
                    onClick={(e) => {
                      // handleDraftSubmit(e);
                      handleOpenConfirmationPopup("draft");
                    }}
                    sx={{
                      ...userStyle.btncancel,
                      textTransform: "capitalize",
                      width: "73px",
                    }}
                  >
                    Draft
                  </LoadingButton>

                )} */}
            </Box>
          </Grid>
        </Grid>

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
              sx={buttonStyles?.btncancel}
              onClick={() => {
                webcamClose();
                closeWebCam();
              }}
            >
              CANCEL
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  const renderStepTwo = () => {
    return (
      <>
        <Headtitle title={'INTERN CREATE'} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-start' }} alignItems="center">
            <Button
              className="prev"
              variant="contained"
              size="small"
              onClick={prevStep}
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
                mb: { xs: 1, md: 0 },
                ...buttonStyles?.buttonsubmit, // Margin bottom for small screens
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
                      value={singleReferenceTodo?.name}
                      onChange={(e) => {
                        setSingleReferenceTodo({
                          ...singleReferenceTodo,
                          name: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                  {referenceTodoError?.name && <div>{referenceTodoError?.name}</div>}
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
                              <StyledTableCell>{row?.name}</StyledTableCell>
                              <StyledTableCell>{row.relationship}</StyledTableCell>
                              <StyledTableCell>{row.occupation}</StyledTableCell>
                              <StyledTableCell>{row.contact}</StyledTableCell>
                              <StyledTableCell>{row.details}</StyledTableCell>
                              <StyledTableCell>
                                <CloseIcon
                                  sx={{ color: 'red', cursor: 'pointer' }}
                                  onClick={() => {
                                    // handleClickOpen(index);
                                    // setDeleteIndex(index);
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
                      <OutlinedInput id="component-outlined" type="text" autoComplete="off" placeholder="Login Name" value={third} readOnly />
                    </FormControl>
                  ) : (
                    <FormControl size="small" fullWidth>
                      <Typography>
                        Login Name<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Login Name"
                        value={employee?.username}
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

                {/* // Password input field */}
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      Password <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      autoComplete="new-password"
                      value={employee?.password}
                      onChange={(e) => {
                        setEmployee({ ...employee, password: e.target.value });
                        setUserPassword(e.target.value);
                      }}
                      readOnly={employee?.autogeneratepassword}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                  <Grid>
                    <FormGroup>
                      <FormControlLabel control={<Checkbox checked={employee?.autogeneratepassword} />} onChange={handleCheckboxChange} label="Auto Generate" />
                    </FormGroup>
                  </Grid>
                  {errorsLog.password && <div>{errorsLog.password}</div>}
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      Company Name<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput id="component-outlined" type="text" placeholder="company name" value={companycaps} readOnly />
                  </FormControl>
                </Grid>
              </Grid>{' '}
              <br />
            </Box>
            <br />
            <Box sx={userStyle.dialogbox}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography sx={userStyle.importheadtext}>Boarding Information</Typography>
                </Grid>
              </Grid>{' '}
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
                          label: employee?.enquirystatus,
                          value: employee?.enquirystatus,
                        }}
                        onChange={(e) => {
                          setEmployee((prev) => ({
                            ...prev,
                            enquirystatus: e.value,
                          }));
                        }}
                      />
                    </FormControl>
                    {errorsLog.enquirystatus && <div>{errorsLog.enquirystatus}</div>}
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
                          label: employee?.enquirystatus,
                          value: employee?.enquirystatus,
                        }}
                        onChange={(e) => {
                          setEmployee((prev) => ({
                            ...prev,
                            enquirystatus: e.value,
                          }));
                        }}
                      />
                    </FormControl>
                    {errorsLog.enquirystatus && <div>{errorsLog.enquirystatus}</div>}
                  </Grid>
                ) : (
                  ''
                )}
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      DOT<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="date"
                      value={employee?.doj}
                      onChange={(e) => {
                        handleDOJChange(e.target.value);
                      }}
                    />
                    {errorsLog.doj && <div>{errorsLog.doj}</div>}
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Company Email</Typography>
                    <TextField
                      id="email"
                      type="email"
                      placeholder="Company Email"
                      value={employee?.companyemail}
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
                      Company <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      options={companies?.map((data) => ({
                        label: data?.name,
                        value: data?.name,
                        code: data.code,
                      }))}
                      styles={colourStyles}
                      value={{
                        label: selectedCompany === '' || selectedCompany == undefined ? 'Please Select Company' : selectedCompany,
                        value: selectedCompany === '' || selectedCompany == undefined ? 'Please Select Company' : selectedCompany,
                      }}
                      onChange={handleCompanyChange}
                    />
                  </FormControl>
                  {errorsLog.company && <div>{errorsLog.company}</div>}
                </Grid>{' '}
                <br />
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Branch <b style={{ color: 'red' }}>*</b>
                    </Typography>

                    <Selects
                      options={filteredBranches?.map((data) => ({
                        label: data?.name,
                        value: data?.name,
                        ...data,
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
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Unit <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      options={filteredUnits?.map((data) => ({
                        label: data?.name,
                        value: data?.name,
                        code: data.code,
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
                <Grid item md={4} sm={6} xs={12}>
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
                        setEmployee({ ...employee, department: e.value, prod: e.prod, attOptions: e.attendancemode || attModeOptions?.map((data) => data?.value), employeecount: '0', reportingto: '' });
                        setSelectedDesignation('');
                        setSelectedTeam('');
                        // setAssignExperience((prev) => ({
                        //   ...prev,
                        //   assignEndExpDate: "",
                        //   assignEndTarDate: "",
                        // }));
                        setSelectedAttMode([]);
                        setValueAttMode([]);
                        handleSalaryfix(
                          loginNotAllot?.process,
                          assignExperience?.updatedate,
                          employee?.doj,
                          assignExperience?.assignExpMode,
                          assignExperience?.assignExpvalue,
                          assignExperience?.assignEndExpvalue,
                          assignExperience?.assignEndExpDate,
                          assignExperience?.assignEndTarvalue,
                          assignExperience?.assignEndTarDate,
                          e.value
                        );
                        setPrimaryWorkStation('Please Select Primary Work Station');
                        setPrimaryWorkStationLabel('Please Select Primary Work Station');
                        setSelectedOptionsWorkStation([]);
                        setValueWorkStation([]);
                        setWorkstationTodoList([]);
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
                      options={employee?.attOptions?.length > 0 ? attModeOptions.filter((option) => employee?.attOptions.includes(option.value)) : attModeOptions}
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
                <>
                  <Grid item md={4} sm={6} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Team<b style={{ color: 'red' }}>*</b>
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
                  <Grid item md={4} sm={6} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Floor<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <Selects
                        options={floorNames
                          ?.filter((u) => u.branch === selectedBranch)
                          ?.map((data) => ({
                            label: data?.name,
                            value: data?.name,
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
                          setSelectedOptionsWorkStation([]);
                          setValueWorkStation([]);
                          setWorkstationTodoList([]);
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
                          setSelectedOptionsWorkStation([]);
                          setValueWorkStation([]);
                          setWorkstationTodoList([]);
                        }}
                      />
                    </FormControl>
                    {errorsLog.area && <div>{errorsLog.area}</div>}
                  </Grid>
                  <Grid item md={4} sm={6} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Designation <b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <Selects
                        options={designation?.map((d) => ({
                          label: d?.name || d.designation,
                          value: d?.name || d.designation,
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
                      <Typography>System Count {employee?.prod && <b style={{ color: 'red' }}>*</b>}</Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        size="small"
                        placeholder="System Count"
                        value={employee?.employeecount}
                        readOnly={!employee?.prod}
                        onChange={(e) => {
                          setEmployee((prev) => ({
                            ...prev,
                            employeecount: e.target.value.replace(/[^0-9.;\s]/g, ''),
                          }));
                          setPrimaryWorkStation('Please Select Primary Work Station');
                          setPrimaryWorkStationLabel('Please Select Primary Work Station');
                          setSelectedOptionsWorkStation([]);
                          setValueWorkStation([]);
                          setWorkstationTodoList([]);
                        }}
                      />
                    </FormControl>
                    {errorsLog.systemcount && <div>{errorsLog.systemcount}</div>}
                  </Grid>
                </>
                <Grid item md={4} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Work Mode</Typography>
                    <OutlinedInput id="component-outlined" type="text" value={employee?.workmode} readOnly />
                  </FormControl>
                </Grid>
                <>
                  <Grid item md={4} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Mode of Intern</Typography>

                      <Selects
                        options={[
                          { label: 'Online', value: 'Online' },
                          { label: 'Offline', value: 'Offline' },
                        ]}
                        styles={colourStyles}
                        value={{
                          label: employee?.modeOfInt === '' || employee?.modeOfInt == undefined ? 'Please Select Mode Of Intern' : employee?.modeOfInt,
                          value: employee?.modeOfInt === '' || employee?.modeOfInt == undefined ? 'Please Select Mode Of Intern' : employee?.modeOfInt,
                        }}
                        onChange={(e, i) => {
                          setEmployee({ ...employee, modeOfInt: e.value });
                          setModeInt(e.value);
                        }}
                      />
                    </FormControl>
                  </Grid>
                  {modeInt === 'Offline' ? (
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Duration</Typography>

                        <Selects
                          options={[
                            { label: 'Part-time', value: 'Part-time' },
                            { label: 'Full-time', value: 'Full-time' },
                          ]}
                          styles={colourStyles}
                          value={{
                            label: employee?.intDuration === '' || employee?.intDuration == undefined ? 'Please Select Duration' : employee?.intDuration,
                            value: employee?.intDuration === '' || employee?.intDuration == undefined ? 'Please Select Duration' : employee?.intDuration,
                          }}
                          onChange={(e) => {
                            setEmployee({
                              ...employee,
                              intDuration: e.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                  ) : (
                    ''
                  )}
                  {/* <Grid item md={4} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Intern Course</Typography>

                      <Selects
                        options={internCourseNames?.map((data) => ({
                          label: data?.name,
                          value: data?.name,
                        }))}
                        styles={colourStyles}
                        value={{
                          label:
                            employee?.intCourse === "" ||
                              employee?.intCourse == undefined
                              ? "Please Select Intern Course"
                              : employee?.intCourse,
                          value:
                            employee?.intCourse === "" ||
                              employee?.intCourse == undefined
                              ? "Please Select Intern Course"
                              : employee?.intCourse,
                        }}
                        onChange={(e, i) => {
                          setEmployee({ ...employee, intCourse: e.value });
                        }}
                      />
                    </FormControl>
                  </Grid> */}
                  <Grid item md={4} sm={6} xs={12}>
                    <Grid container spacing={2}>
                      <Grid item md={6} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Intern start date<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="date"
                            value={employee?.intStartDate}
                            onChange={(e) => {
                              setEmployee({
                                ...employee,
                                intStartDate: e.target.value,
                                intEndDate: '',
                              });
                            }}
                          />
                        </FormControl>
                        {errorsLog.internstartdate && <div>{errorsLog.internstartdate}</div>}
                      </Grid>
                      <Grid item md={6} sm={6} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Intern end date<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="date"
                            value={employee?.intEndDate}
                            onChange={(e) => {
                              setEmployee({
                                ...employee,
                                intEndDate: e.target.value,
                              });
                            }}
                            inputProps={{
                              min: employee?.intStartDate, // Set the minimum date to today
                            }}
                          />
                        </FormControl>
                        {errorsLog.internenddate && <div>{errorsLog.internenddate}</div>}
                      </Grid>
                    </Grid>
                  </Grid>
                </>
                <Grid item md={4} sm={6} xs={12}>
                  <Typography>
                    Shift Type<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Selects
                      options={ShiftTypeOptions}
                      label="Please Select Shift Type"
                      value={{
                        label: employee?.shifttype,
                        value: employee?.shifttype,
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
                        setShifts([]);
                        setValueCateWeeks([]);
                        setSelectedOptionsCateWeeks([]);
                      }}
                    />
                  </FormControl>
                  {errorsLog.shifttype && <div>{errorsLog.shifttype}</div>}
                </Grid>
                {employee?.shifttype === 'Standard' ? (
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
                            label: employee?.shiftgrouping,
                            value: employee?.shiftgrouping,
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
                            label: employee?.shifttiming,
                            value: employee?.shifttiming,
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
                  {employee?.shifttype === 'Daily' ? (
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
                                label: employee?.shiftgrouping === '' || employee?.shiftgrouping === undefined ? 'Please Select Shift Grouping' : employee?.shiftgrouping,
                                value: employee?.shiftgrouping === '' || employee?.shiftgrouping === undefined ? 'Please Select Shift Grouping' : employee?.shiftgrouping,
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
                                label: employee?.shifttiming === '' || employee?.shifttiming === undefined ? 'Please Select Shift' : employee?.shifttiming,
                                value: employee?.shifttiming === '' || employee?.shifttiming === undefined ? 'Please Select Shift' : employee?.shifttiming,
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
                      {todo.length > 0 ? (
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

                  {employee?.shifttype === '1 Week Rotation' ? (
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
                                label: employee?.shiftgrouping === '' || employee?.shiftgrouping === undefined ? 'Please Select Shift Grouping' : employee?.shiftgrouping,
                                value: employee?.shiftgrouping === '' || employee?.shiftgrouping === undefined ? 'Please Select Shift Grouping' : employee?.shiftgrouping,
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
                                label: employee?.shifttiming === '' || employee?.shifttiming === undefined ? 'Please Select Shift' : employee?.shifttiming,
                                value: employee?.shifttiming === '' || employee?.shifttiming === undefined ? 'Please Select Shift' : employee?.shifttiming,
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
                      {todo.length > 0 ? (
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

                  {employee?.shifttype === '2 Week Rotation' ? (
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
                                label: employee?.shiftgrouping === '' || employee?.shiftgrouping === undefined ? 'Please Select Shift Grouping' : employee?.shiftgrouping,
                                value: employee?.shiftgrouping === '' || employee?.shiftgrouping === undefined ? 'Please Select Shift Grouping' : employee?.shiftgrouping,
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
                                label: employee?.shifttiming === '' || employee?.shifttiming === undefined ? 'Please Select Shift' : employee?.shifttiming,
                                value: employee?.shifttiming === '' || employee?.shifttiming === undefined ? 'Please Select Shift' : employee?.shifttiming,
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
                      {todo.length > 0 ? (
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

                  {employee?.shifttype === '1 Month Rotation' ? (
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
                                label: employee?.shiftgrouping === '' || employee?.shiftgrouping === undefined ? 'Please Select Shift Grouping' : employee?.shiftgrouping,
                                value: employee?.shiftgrouping === '' || employee?.shiftgrouping === undefined ? 'Please Select Shift Grouping' : employee?.shiftgrouping,
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
                                label: employee?.shifttiming === '' || employee?.shifttiming === undefined ? 'Please Select Shift' : employee?.shifttiming,
                                value: employee?.shifttiming === '' || employee?.shifttiming === undefined ? 'Please Select Shift' : employee?.shifttiming,
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
                      {todo.length > 0 ? (
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
                  {/* {employee?.shifttype === "Daily" ? (
                    <>
                      {todo.length > 0 ? (
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

                  {employee?.shifttype === "1 Week Rotation" ? (
                    <>
                      {todo.length > 0 ? (
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

                  {employee?.shifttype === "2 Week Rotation" ? (
                    <>
                      {todo.length > 0 ? (
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

                  {employee?.shifttype === "1 Month Rotation" ? (
                    <>
                      {todo.length > 0 ? (
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
                <Grid item md={3} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Reporting To <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      labelId="demo-select-small"
                      id="demo-select-small"
                      options={
                        allHierarchy && reportingtonames?.length > 0
                          ? reportingtonames?.map((row) => ({
                              label: row,
                              value: row,
                            }))
                          : allUsersData
                              ?.filter((data) => data?.role?.includes('Manager') && data?.company === selectedCompany && data?.branch === selectedBranch && data?.unit === selectedUnit && data?.team === selectedTeam)
                              ?.map((row) => ({
                                label: row?.companyname,
                                value: row?.companyname,
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
                <Grid item md={1.5} sm={12} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>Prev EmpCode</Typography>
                    <OutlinedInput id="component-outlined" type="text" placeholder="EmpCode" value={prevEmpCode ?? '000'} readOnly />
                  </FormControl>
                </Grid>
                <Grid item md={3.5} sm={12} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      EmpCode <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="EmpCode"
                      value={employee?.wordcheck === false ? newval : employee?.empcode}
                      onChange={(e) => {
                        const inputText = e.target.value;
                        setEmployee({ ...employee, empcode: inputText });
                      }}
                    />
                  </FormControl>
                  <Grid>
                    <FormGroup>
                      <FormControlLabel
                        control={<Checkbox checked={employee?.wordcheck === true} />}
                        onChange={(e) => {
                          setEmployee({
                            ...employee,
                            wordcheck: !employee?.wordcheck,
                          });
                        }}
                        label="Enable Empcode"
                      />
                    </FormGroup>
                  </Grid>
                  {errorsLog.empcode && <div>{errorsLog.empcode}</div>}
                </Grid>
                {employee?.workmode !== 'Remote' ? (
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
                          isDisabled={Number(employee?.employeecount) === 0 || employee?.employeecount === ''}
                          // onChange={(e) => {
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
                            const isValue = e.value.replace(/\([^)]*\)$/, '');
                            setPrimaryWorkStation(e.value);
                            setPrimaryWorkStationLabel(e.label);
                            // setSelectedOptionsWorkStation([]);
                            // setValueWorkStation([]);

                            setValueWorkStation((prev) => prev.filter((val) => val !== e.value));

                            // Remove selected object from selectedOptionsWorkStation array
                            setSelectedOptionsWorkStation((prev) => prev.filter((obj) => obj.value !== e.value));

                            const matches = e.label.match(/^(.*?)\((.*?)\)\((.*?)\)$/);

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
                            const Bracketsbranch = e?.value.match(/\(([^)]+)\)/)?.[1];
                            const hyphenCount = Bracketsbranch.split('-').length - 1;

                            const Branch = hyphenCount === 1 ? Bracketsbranch.split('-')[0].trim() : Bracketsbranch?.split('-').slice(0, 2).join('-');

                            const Floor = hyphenCount === 1 ? Bracketsbranch.split('-')[1].trim() : hyphenCount === 2 ? Bracketsbranch.split('-').pop() : Bracketsbranch.split('-').slice(-2).join('-').replace(')', '');

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
                          //   const secondBracketMatch = bracketContent.match(/\(([^)]+)\)\(([^)]+)\)/);

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
                          disabled={employee?.employeecount === '' || Number(employee?.employeecount) < 0}
                          // disabled={employee?.employeecount === '' || Number(employee?.employeecount) < 1 || primaryWorkStation === 'Please Select Primary Work Station'}
                        />
                      </FormControl>
                      {errorsLog.workstation && <div>{errorsLog.workstation}</div>}
                    </Grid>
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>If Office</Typography>
                      </FormControl>
                      <Grid>
                        <FormGroup>
                          <FormControlLabel
                            control={<Checkbox checked={employee?.ifoffice === true} />}
                            onChange={(e) => {
                              setEmployee({
                                ...employee,
                                ifoffice: !employee?.ifoffice,
                              });
                              // setPrimaryWorkStation('Please Select Primary Work Station');
                              // setPrimaryWorkStationLabel('Please Select Primary Work Station');
                              // setPrimaryWorkStationInput("");
                            }}
                            label="Work Station Other"
                          />
                        </FormGroup>
                      </Grid>
                      {errorsLog.ifoffice && <div>{errorsLog.ifoffice}</div>}
                    </Grid>
                    {employee?.ifoffice === true && (
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
                ) : (
                  <Grid item md={4} sm={12} xs={12}>
                    <FormControl size="small" fullWidth>
                      <Typography>Work Station</Typography>
                      <OutlinedInput id="component-outlined" type="text" value="WFH" readOnly />
                    </FormControl>
                  </Grid>
                )}
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
                onClick={prevStep}
                sx={{
                  display: { xs: 'block', md: 'none' }, // Show on small screens, hide on large screens
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                Previous
              </Button>
              <Button
                className="next"
                variant="contained"
                size="small"
                onClick={nextStepLog}
                sx={{
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                Next
              </Button>
              {/* <Link
                to="/internlist"
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
              {/* <LoadingButton
                size="small"
                variant="contained"
                loading={draftLoader}
                onClick={(e) => {
                  // handleDraftSubmit(e);
                  handleOpenConfirmationPopup("draft");
                }}
                sx={{
                  ...userStyle.btncancel,
                  textTransform: "capitalize",
                  width: "73px",
                }}
              >
                Draft
              </LoadingButton> */}
            </Box>
          </Grid>
        </Grid>
      </>
    );
  };

  const renderStepThree = () => {
    return (
      <>
        <Headtitle title={'INTERN CREATE'} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-start' }} alignItems="center">
            <Button
              className="prev"
              variant="contained"
              size="small"
              onClick={prevStep}
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
                mb: { xs: 1, md: 0 },
                ...buttonStyles?.buttonsubmit, // Margin bottom for small screens
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
                              value={employee?.ppincode}
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
                          value={employee?.ppincode}
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
                        value={employee?.plandmark}
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
                        value={employee?.pdoorno}
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
                        value={employee?.pstreet}
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
                        value={employee?.parea}
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
                        checked={employee?.samesprmnt}
                        onChange={(e) =>
                          setEmployee({
                            ...employee,
                            samesprmnt: !employee?.samesprmnt,
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
              {!employee?.samesprmnt ? (
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
                              value={employee?.cpincode}
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
                            value={employee?.cpincode}
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
                          value={employee?.cgpscoordination}
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
                          value={employee?.clandmark}
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
                          value={employee?.cdoorno}
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
                          value={employee?.cstreet}
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
                          value={employee?.carea}
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
                        <OutlinedInput id="component-outlined" type="text" placeholder="Pincode" value={employee?.ppincode} readOnly />
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
                            <OutlinedInput id="component-outlined" type="text" placeholder="District" value={employee?.pdistrict || ''} readOnly />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl size="small" fullWidth>
                            <Typography>Village/City</Typography>
                            <OutlinedInput id="component-outlined" type="text" placeholder="Village/City" value={employee?.pvillageorcity || ''} readOnly />
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
                        <OutlinedInput id="component-outlined" type="text" placeholder="Landmark  Name" value={employee?.plandmark} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>House/Flat No</Typography>
                        <OutlinedInput id="component-outlined" type="text" placeholder="House/Flat No" value={employee?.pdoorno} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Street/Road Name</Typography>
                        <OutlinedInput id="component-outlined" type="text" placeholder="Street/Road Name" value={employee?.pstreet} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Locality/Area Name</Typography>
                        <OutlinedInput id="component-outlined" type="text" placeholder="Locality/Area Name" value={employee?.parea} readOnly />
                      </FormControl>
                    </Grid>

                    {/* <Grid item md={3} sm={12} xs={12}>
                                                   <FormControl fullWidth size="small">
                                                     <Typography>Taluk</Typography>
                                                     <OutlinedInput id="component-outlined" type="text" placeholder="Taluk" value={employee?.ptaluk} readOnly />
                                                   </FormControl>
                                                 </Grid>
                                                 <Grid item md={3} sm={12} xs={12}>
                                                   <FormControl size="small" fullWidth>
                                                     <Typography>Post</Typography>
                                                     <OutlinedInput id="component-outlined" type="text" placeholder="Post" value={employee?.ppost} readOnly />
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
                onClick={prevStep}
                sx={{
                  display: { xs: 'block', md: 'none' }, // Show on small screens, hide on large screens
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                Previous
              </Button>
              <Button
                className="next"
                variant="contained"
                size="small"
                onClick={() => {
                  nextStepAddress(false);
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
                to="/internlist"
                style={{
                  textDecoration: "none",
                  color: "white",
                  marginRight: "0px",
                }}
              > */}
              <Button
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

              {/* <LoadingButton
                size="small"
                variant="contained"
                loading={draftLoader}
                onClick={(e) => {
                  // handleDraftSubmit(e);
                  handleOpenConfirmationPopup("draft");
                }}
                sx={{
                  ...userStyle.btncancel,
                  textTransform: "capitalize",
                  width: "73px",
                }}
              >
                Draft
              </LoadingButton> */}
            </Box>
          </Grid>
        </Grid>
      </>
    );
  };

  const renderStepFour = () => {
    return (
      <>
        <Headtitle title={'INTERN CREATE'} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-start' }} alignItems="center">
            <Button
              className="prev"
              variant="contained"
              size="small"
              onClick={prevStep}
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
                mb: { xs: 1, md: 0 },
                ...buttonStyles?.buttonsubmit, // Margin bottom for small screens
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
                <TodosAccordion
                  fromEmployee={true}
                  todoscheck={files}
                  setTodoscheck={setFiles}
                  loading={loading}
                  handleCandidateUploadForIndex={handleCandidateUploadForIndex}
                  colourStyles={colourStyles}
                  candidate_educational_upload_status={candidate_educational_upload_status}
                  renderFilePreview={renderFilePreviewMulter}
                  readOnly={false}
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
                                <IconButton onClick={() => window.open(URL.createObjectURL(doc.file), '_blank')} size="small">
                                  <VisibilityIcon sx={{ color: '#0B7CED' }} />
                                </IconButton>
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
                                {todo.file && (
                                  <IconButton onClick={() => window.open(URL.createObjectURL(todo.file), '_blank')} size="small" sx={{ ml: 1 }}>
                                    <VisibilityIcon sx={{ color: '#0B7CED' }} />
                                  </IconButton>
                                )}
                              </>
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
                onClick={prevStep}
                sx={{
                  display: { xs: 'block', md: 'none' }, // Show on small screens, hide on large screens
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                Previous
              </Button>
              <Button
                className="next"
                variant="contained"
                size="small"
                onClick={() => {
                  nextStepFour();
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
                to="/internlist"
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

              {/* <LoadingButton
                size="small"
                variant="contained"
                loading={draftLoader}
                onClick={(e) => {
                  // handleDraftSubmit(e);
                  handleOpenConfirmationPopup("draft");
                }}
                sx={{
                  ...userStyle.btncancel,
                  textTransform: "capitalize",
                  width: "73px",
                }}
              >
                Draft
              </LoadingButton> */}
            </Box>
          </Grid>
        </Grid>
      </>
    );
  };
  const renderStepFive = () => {
    return (
      <>
        <Headtitle title={'INTERN CREATE'} />
        {/* <form onSubmit={ (e) =>  }> */}
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-start' }} alignItems="center">
            <Button
              className="prev"
              variant="contained"
              size="small"
              onClick={prevStep}
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
                mb: { xs: 1, md: 0 },
                ...buttonStyles?.buttonsubmit, // Margin bottom for small screens
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
                          <IconButton onClick={() => window.open(URL.createObjectURL(additionalQualificationDocuments?.file), '_blank')} size="small">
                            <VisibilityIcon sx={{ color: '#0B7CED' }} />
                          </IconButton>
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
                                {addtodo.file && (
                                  <IconButton onClick={() => window.open(URL.createObjectURL(addtodo.file), '_blank')} size="small" sx={{ ml: 1 }}>
                                    <VisibilityIcon sx={{ color: '#0B7CED' }} />
                                  </IconButton>
                                )}
                              </>
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
                                {todo.file && (
                                  <IconButton onClick={() => window.open(URL.createObjectURL(todo.file), '_blank')} size="small" sx={{ ml: 1 }}>
                                    <VisibilityIcon sx={{ color: '#0B7CED' }} />
                                  </IconButton>
                                )}
                              </>
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
                onClick={prevStep}
                sx={{
                  display: { xs: 'block', md: 'none' }, // Show on small screens, hide on large screens
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                Previous
              </Button>
              <Button
                className="next"
                variant="contained"
                size="small"
                onClick={nextStepLog}
                sx={{
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                Next
              </Button>

              {/* <Link
                to="/internlist"
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

              {/* <LoadingButton
                size="small"
                variant="contained"
                loading={draftLoader}
                onClick={(e) => {
                  // handleDraftSubmit(e);
                  handleOpenConfirmationPopup("draft");
                }}
                sx={{
                  ...userStyle.btncancel,
                  textTransform: "capitalize",
                  width: "73px",
                }}
              >
                Draft
              </LoadingButton> */}
            </Box>
          </Grid>
        </Grid>
      </>
    );
  };

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
              name: file?.name,
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
                name: file?.name,
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
    } else {
      console.error('No file selected');
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
      bankname: employee?.bankname,
      bankbranchname: employee?.bankbranchname,
      accountholdername: employee?.accountholdername,
      accountnumber: employee?.accountnumber,
      ifsccode: employee?.ifsccode,
      accounttype: employee?.accounttype,
      accountstatus: employee?.accountstatus,
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
    } else if (employee?.accountstatus === 'Active' && activeexists) {
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
    if (name === 'ifscCode' && capitalizedValue.length > 11) {
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
      const response = await axios.get(`https://ifsc.razorpay.com/${employee?.ifscCode}`);
      if (response.status === 200) {
        setBankDetails(response.data);
        setLoading(false);
      } else {
        setPopupContentMalert('Bank Details Not Found!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      }
    } catch (err) {
      setLoading(false);
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

  // accessibele

  const [accessible, setAccessible] = useState({
    company: 'Please Select Company',
    branch: 'Please Select Branch',
    unit: 'Please Select Unit',
    responsibleperson: companycaps,
  });

  const typeofaccount = [
    { label: 'Savings', value: 'Savings' },
    { label: 'Salary', value: 'Salary' },
  ];

  const accountstatus = [
    { label: 'Active', value: 'Active' },
    { label: 'In-Active', value: 'In-Active' },
  ];

  // BioMetric Usage Details
  const [CheckedBiometric, setCheckedBiometric] = useState(false);
  const [CheckedBiometricAdded, setCheckedBiometricAdded] = useState(false);
  const [BiometricPostDevice, setBiometricPostDevice] = useState('');
  const [BioPostCheckDevice, setBioPostCheckDevice] = useState(false);
  const [usernameBio, setUsernameBio] = useState([]);
  const [BiometricDeviceOptions, setBiometricDeviceOptions] = useState([]);
  const handleCommitUserBiometric = async (e) => {
    e.preventDefault();
    try {
      if (BiometricPostDevice?.cloudIDC) {
        let res = await axios.post(SERVICE.BIOMETRIC_GET_SEND_COMMAND, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          biometricUserIDC: BiometricPostDevice?.biometricUserIDC,
          CloudIDC: BiometricPostDevice.cloudIDC,
          deviceCommandN: '5',
        });
        console.log(res?.data, 'res?.data');
      }
    } catch (err) {
      console.log(err, 'Error in Intern Create Biometric');
      // handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  // salary setup start

  const ModeOpt = [
    { label: 'Manual', value: 'Manual' },
    { label: 'Auto', value: 'Auto' },
  ];

  const currentDateAttStatus = new Date();
  const currentYearAttStatus = currentDateAttStatus.getFullYear();
  // get current month in string name
  const monthstring = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthIndex = new Date().getMonth();
  const currentMonthObject = {
    label: monthstring[currentMonthIndex],
    value: currentMonthIndex + 1,
  };
  const currentYearObject = {
    label: currentYearAttStatus,
    value: currentYearAttStatus,
  };
  const years = Array.from(new Array(20), (val, index) => currentYearAttStatus - 5 + index);
  const getyear = years.map((year) => {
    return { value: year, label: year };
  });

  //get all months
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const [isMonthyear, setIsMonthYear] = useState({
    startMonth: currentMonthObject?.label,
    startMonthValue: currentMonthObject?.value,
    startYear: currentYearObject?.value,
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
      let gross =
        Number(e.target.value) +
        Number(formValue?.hra) +
        Number(formValue?.conveyance) +
        Number(formValue?.medicalallowance) +
        Number(formValue?.productionallowance) +
        // + Number(formValue?.productionallowancetwo)
        Number(formValue?.otherallowance);
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
        //  + Number(formValue?.productionallowancetwo)
        Number(formValue?.otherallowance);

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
        // + Number(formValue?.productionallowancetwo)
        Number(formValue?.otherallowance);
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
        // + Number(formValue?.productionallowancetwo)
        Number(formValue?.otherallowance);
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
        //  + Number(formValue?.productionallowancetwo)
        Number(formValue?.otherallowance);
      setFormValue({
        ...formValue,
        productionallowance: inputValue,
        gross,
      });
      setSalaryTableDataManual((prev) => ({
        ...prev,
        productionallowance: Number(inputValue),
        // + Number(formValue?.productionallowancetwo)
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

  //Accessible Company/Branch/unit

  const [accessibleTodo, setAccessibleTodo] = useState([]);
  const fetchBiometricDevices = async () => {
    try {
      let response = await axios.get(SERVICE.ALL_BIOMETRICDEVICEMANAGEMENT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const answer = response?.data?.biometricdevicemanagement?.filter((data) => accessibleTodo?.some((item) => data?.company === item?.company && data?.branch === item?.branch && data?.unit === item?.unit));
      const biometricDevice =
        answer?.length > 0
          ? answer?.map((data) => ({
              ...data,
              label: data?.biometricserialno,
              value: data?.biometricserialno,
            }))
          : [];
      console.log(response?.data, answer, 'Data');
      setBiometricDeviceOptions(biometricDevice);
    } catch (err) {
      console.log(err);
      let error = err.response?.data?.message;
      if (error) {
        // setPopupContentMalert(error);
        // setPopupSeverityMalert("error");
        // handleClickOpenPopupMalert();
      } else {
        handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
      }
    }
  };

  useEffect(() => {
    fetchBiometricDevices();
  }, [accessibleTodo]);
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
      empcode: String(employee?.wordcheck === false ? newval : employee?.empcode),
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

  //rocket chat start
  const [createRocketChat, setCreateRocketChat] = useState({
    create: false,
    email: '',
    roles: [
      {
        label: 'user',
        value: 'user',
      },
    ],
  });
  useEffect(() => {
    fetchRockeChatRoles();
  }, []);
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
      console.log(err);
      let error = err.response?.data?.message;
      if (error) {
        // setPopupContentMalert(error);
        // setPopupSeverityMalert("error");
        // handleClickOpenPopupMalert();
      } else {
        handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
      }
    }
  };

  const handleRocketchatRoleChange = (options) => {
    setCreateRocketChat((prev) => ({ ...prev, roles: options }));
  };

  const customValueRendererRocketchatRole = (valueRocketchatTeamCat, _categoryname) => {
    return valueRocketchatTeamCat?.length ? valueRocketchatTeamCat.map(({ label }) => label)?.join(', ') : 'Please Select Role';
  };

  const renderStepSix = () => {
    return (
      <>
        <Headtitle title={'INTERN CREATE'} />
        {/* <form onSubmit={ (e) =>  }> */}
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-start' }} alignItems="center">
            <Button
              className="prev"
              variant="contained"
              size="small"
              onClick={prevStep}
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
                mb: { xs: 1, md: 0 },
                ...buttonStyles?.buttonsubmit, // Margin bottom for small screens
              }}
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
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography>Bank Name</Typography>
                    <Selects
                      maxMenuHeight={250}
                      options={accounttypes}
                      placeholder="Please Choose Bank Name"
                      value={{
                        label: employee?.bankname,
                        value: employee?.bankname,
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
                <Grid item md={3} xs={12} sm={6}>
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
                      value={employee?.bankbranchname}
                      onChange={(e) => {
                        setEmployee({
                          ...employee,
                          bankbranchname: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography>Account Holder Name</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Please Enter Account Name"
                      value={employee?.accountholdername}
                      onChange={(e) => {
                        setEmployee({
                          ...employee,
                          accountholdername: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography>Account Number</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Please Enter Account Number"
                      value={employee?.accountnumber}
                      onChange={(e) => {
                        setEmployee({
                          ...employee,
                          accountnumber: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography>IFSC Code</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Please Enter IFSC Code"
                      value={employee?.ifsccode}
                      onChange={(e) => {
                        setEmployee({ ...employee, ifsccode: e.target.value });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} sm={12} xs={6}>
                  <FormControl fullWidth size="small">
                    <Typography>Type of Account</Typography>
                    <Selects
                      maxMenuHeight={250}
                      options={typeofaccount}
                      placeholder="Please Choose Account Type"
                      value={{
                        label: employee?.accounttype,
                        value: employee?.accounttype,
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
                        label: employee?.accountstatus,
                        value: employee?.accountstatus,
                      }}
                      onChange={(e) => {
                        setEmployee({ ...employee, accountstatus: e.value });
                      }}
                    />
                  </FormControl>
                </Grid>

                <Grid item md={8} xs={12} sm={12} sx={{ display: 'flex' }}>
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
                                <Grid item lg={8} md={8} sm={8} xs={8}>
                                  <Typography
                                    style={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      maxWidth: '100%',
                                    }}
                                    title={file?.name}
                                  >
                                    {file?.name}
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
                    <Grid item md={4} xs={12} sm={12} sx={{ display: 'flex' }}>
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
                            sx={buttonStyles?.buttonsubmit}
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginTop: '10%',
                              height: '25px',
                            }}
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
                                    <Grid item lg={8} md={8} sm={8} xs={8}>
                                      <Typography
                                        style={{
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          maxWidth: '100%',
                                        }}
                                        title={file?.name}
                                      >
                                        {file?.name}
                                      </Typography>
                                    </Grid>
                                    <Grid item lg={1} md={2} sm={1} xs={1}>
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
                                    <Grid item lg={2} md={2} sm={1} xs={1}>
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
                  <Grid item md={5} xs={0} sm={4}>
                    <Typography sx={userStyle.SubHeaderText}>Exp Log Details </Typography>
                  </Grid>
                  {migrateData && from && (
                    <Grid item md={3} xs={0} sm={4}>
                      <>
                        <Button
                          // className="next"
                          variant="contained"
                          onClick={() => handleClickOpenEdit()}
                        >
                          Salary Fix
                        </Button>
                      </>
                    </Grid>
                  )}
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
                          handleSalaryfix(
                            loginNotAllot.process,
                            e.value,
                            employee?.doj,
                            assignExperience.assignExpMode,
                            assignExperience.assignExpvalue,
                            assignExperience.assignEndExpvalue,
                            assignExperience.assignEndExpDate,
                            assignExperience.assignEndTarvalue,
                            assignExperience.assignEndTarDate,
                            employee?.department
                          );
                          setIsmigrate('');
                          setAssignExperience({
                            ...assignExperience,
                            updatedate: e.value,
                          });
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
                          handleSalaryfix(
                            loginNotAllot.process,
                            assignExperience.updatedate,
                            employee?.doj,
                            e.value,
                            assignExperience.assignExpvalue,

                            assignExperience.assignEndExpvalue,
                            assignExperience.assignEndExpDate,
                            assignExperience.assignEndTarvalue,
                            assignExperience.assignEndTarDate,
                            employee?.department
                            //  assignExperience.assignEndTar
                          );

                          setAssignExperience({
                            ...assignExperience,
                            assignExpMode: e.value,
                            assignExpvalue: e.value === 'Auto Increment' ? 0 : '',
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  {assignExperience.assignExpMode === 'Please Select Mode' ? (
                    ''
                  ) : (
                    <>
                      {assignExperience.assignExpMode === 'Exp Stop' || assignExperience.assignExpMode === 'Target Stop' ? (
                        <Grid item md={4} xs={12} sm={4}>
                          <FormControl fullWidth>
                            <Typography>Value (In Months)</Typography>
                            <Selects
                              maxMenuHeight={250}
                              options={valueOpt}
                              value={{
                                label: assignExperience.assignExpvalue,
                                value: assignExperience.assignExpvalue,
                              }}
                              onChange={(e) => {
                                handleSalaryfix(
                                  loginNotAllot.process,
                                  assignExperience.updatedate,
                                  employee?.doj,
                                  assignExperience.assignExpMode,
                                  e.value,
                                  assignExperience.assignEndExpvalue,
                                  assignExperience.assignEndExpDate,
                                  assignExperience.assignEndTarvalue,
                                  assignExperience.assignEndTarDate,
                                  employee?.department
                                );
                                setAssignExperience({
                                  ...assignExperience,
                                  assignExpvalue: e.value,
                                });
                              }}
                            />
                          </FormControl>
                          {errorsLog.value && <div>{errorsLog.value}</div>}
                        </Grid>
                      ) : (
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
                                handleSalaryfix(
                                  loginNotAllot.process,
                                  assignExperience.updatedate,
                                  employee?.doj,
                                  assignExperience.assignExpMode,
                                  e.target.value,
                                  assignExperience.assignEndExpvalue,
                                  assignExperience.assignEndExpDate,
                                  assignExperience.assignEndTarvalue,
                                  assignExperience.assignEndTarDate,
                                  employee?.department
                                );
                                setAssignExperience({
                                  ...assignExperience,
                                  assignExpvalue: e.target.value,
                                });
                              }}
                            />
                          </FormControl>
                          {accessibleErrors.assignexpvalue && <div>{accessibleErrors.assignexpvalue}</div>}
                        </Grid>
                      )}
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
                        // onChange={(e) => {
                        //   setAssignExperience({
                        //     ...assignExperience,
                        //     assignEndExp: e.value,
                        //   });
                        // }}
                      />
                    </FormControl>
                  </Grid>
                  {assignExperience.assignEndExp === 'Please Select Mode' ? (
                    ''
                  ) : (
                    <>
                      {assignExperience.assignEndExp === 'Exp Stop' ? (
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
                                handleSalaryfix(
                                  loginNotAllot.process,
                                  assignExperience.updatedate,
                                  employee?.doj,
                                  assignExperience.assignExpMode,
                                  assignExperience.assignExpvalue,

                                  e.value,
                                  assignExperience.assignEndExpDate,
                                  assignExperience.assignEndTarvalue,
                                  assignExperience.assignEndTarDate,
                                  employee?.department
                                  //  assignExperience.assignEndTar
                                );
                                setAssignExperience({
                                  ...assignExperience,
                                  assignEndExpvalue: e.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                      ) : (
                        <Grid item md={3} xs={12} sm={4}>
                          <FormControl fullWidth size="small">
                            <Typography>End Tar</Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Please Select"
                              value={assignExperience.assignEndExpvalue === 'Please Select' ? '' : assignExperience.assignEndExpvalue}
                              onChange={(e) => {
                                setAssignExperience({
                                  ...assignExperience,
                                  assignEndExpvalue: e.target.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                      )}
                    </>
                  )}

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
                            handleSalaryfix(
                              loginNotAllot.process,
                              assignExperience.updatedate,
                              employee?.doj,
                              assignExperience.assignExpMode,
                              assignExperience.assignExpvalue,

                              assignExperience.assignEndExpvalue,
                              e.value,
                              assignExperience.assignEndTarvalue,
                              assignExperience.assignEndTarDate,
                              employee?.department
                              //  assignExperience.assignEndTar
                            );
                            setAssignExperience({
                              ...assignExperience,
                              assignEndExpDate: e.value,
                            });
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
                        // onChange={(e) => {
                        //   setAssignExperience({
                        //     ...assignExperience,
                        //     assignExpMode: e.value,
                        //     assignExpvalue: "Please Select Value (In Months)",
                        //     assignExpDate: "",
                        //   });
                        // }}
                      />
                    </FormControl>
                  </Grid>
                  {assignExperience.assignEndTar === 'Please Select Mode' ? (
                    ''
                  ) : (
                    <>
                      {assignExperience.assignEndTar === 'Target Stop' ? (
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
                                handleSalaryfix(
                                  loginNotAllot.process,
                                  assignExperience.updatedate,
                                  employee?.doj,
                                  assignExperience.assignExpMode,
                                  assignExperience.assignExpvalue,

                                  assignExperience.assignEndExpvalue,
                                  assignExperience.assignEndExpDate,
                                  e.value,
                                  assignExperience.assignEndTarDate,
                                  employee?.department
                                  //  assignExperience.assignEndTar
                                );
                                setAssignExperience({
                                  ...assignExperience,
                                  assignEndTarvalue: e.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                      ) : (
                        <Grid item md={3} xs={12} sm={4}>
                          <FormControl fullWidth size="small">
                            <Typography>Value (In Months)</Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Please Enter "
                              value={assignExperience.assignEndTarvalue === 'Please Select ' ? '' : assignExperience.assignEndTarvalue}
                              onChange={(e) => {
                                handleSalaryfix(
                                  loginNotAllot.process,
                                  assignExperience.updatedate,
                                  employee?.doj,
                                  assignExperience.assignExpMode,
                                  assignExperience.assignExpvalue,

                                  assignExperience.assignEndExpvalue,
                                  assignExperience.assignEndExpDate,
                                  e.target.value,
                                  assignExperience.assignEndTarDate,
                                  employee?.department
                                  //  assignExperience.assignEndTar
                                );
                                setAssignExperience({
                                  ...assignExperience,
                                  assignEndTarvalue: e.target.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                      )}
                    </>
                  )}

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
                            handleSalaryfix(
                              loginNotAllot.process,
                              assignExperience.updatedate,
                              employee?.doj,
                              assignExperience.assignExpMode,
                              assignExperience.assignExpvalue,

                              assignExperience.assignEndExpvalue,
                              assignExperience.assignEndExpDate,
                              assignExperience.assignEndTarvalue,
                              e.value,
                              employee?.department
                            );
                            setAssignExperience({
                              ...assignExperience,
                              assignEndTarDate: e.value,
                            });
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
                  <Grid item md={3} xs={12} sm={6}>
                    <Typography>
                      Process <b style={{ color: 'red' }}>*</b>
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
                          setIsmigrate('');

                          handleSalaryfix(
                            e.value,
                            assignExperience.updatedate,
                            employee?.doj,
                            assignExperience.assignExpMode,
                            assignExperience.assignExpvalue,

                            assignExperience.assignEndExpvalue,
                            assignExperience.assignEndExpDate,
                            assignExperience.assignEndTarvalue,
                            assignExperience.assignEndTarDate,
                            employee?.department
                            //  assignExperience.assignEndTar
                          );
                          setLoginNotAllot({
                            ...loginNotAllot,
                            process: e.value,
                          });
                        }}
                      />
                    </FormControl>
                    {accessibleErrors.process && <div>{accessibleErrors.process}</div>}
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
                    <Typography>
                      Process Type <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Selects
                        options={processTypes}
                        value={{
                          label: loginNotAllot.processtype,
                          value: loginNotAllot.processtype,
                        }}
                        onChange={(e) => {
                          setLoginNotAllot({
                            ...loginNotAllot,
                            processtype: e.value,
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
                    <Typography>
                      Process Duration <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Selects
                        options={processDuration}
                        value={{
                          label: loginNotAllot.processduration,
                          value: loginNotAllot.processduration,
                        }}
                        onChange={(e) => {
                          setLoginNotAllot({
                            ...loginNotAllot,
                            processduration: e.value,
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
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
                      {accessibleErrors.duration && <div>{accessibleErrors.duration}</div>}
                    </Grid>
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
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
                  <Grid item md={3} xs={12} sm={6}>
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
                  <Grid item md={3} xs={12} sm={6}>
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
                  <Grid item md={3} xs={12} sm={6}>
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
                onClick={prevStep}
                sx={{
                  display: { xs: 'block', md: 'none' }, // Show on small screens, hide on large screens
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                // sx={buttonSx}
                size="small"
                sx={{
                  ...buttonSx,
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
                disabled={loading}
                onClick={(e) => {
                  handleButtonClick(e);
                }}
              >
                Next
                {loading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: green[500],
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Button>

              {/* <Link
                to="/internlist"
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

              {/* <LoadingButton
                size="small"
                variant="contained"
                loading={draftLoader}
                onClick={(e) => {
                  // handleDraftSubmit(e);
                  handleOpenConfirmationPopup("draft");
                }}
                sx={{
                  ...userStyle.btncancel,
                  textTransform: "capitalize",
                  width: "73px",
                }}
              >
                Draft
              </LoadingButton> */}
            </Box>
          </Grid>
        </Grid>

        <Box>
          {/* edit model */}
          <Dialog open={isEditOpen} onClose={handleCloseModEdit} fullWidth={true} maxWidth="lg">
            {/* <Box sx={userStyle.dialogbox}> */}
            <Box sx={{ padding: '20px' }}>
              <Typography sx={userStyle.HeaderText}>Intern Move to Live</Typography>
              <br />
              <Grid container spacing={2}>
                <Grid item md={2} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      <b>Company</b>{' '}
                    </Typography>
                    <Typography>{selectedCompany} </Typography>
                    {/* <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={migrateData?.company}
                     
                    /> */}
                  </FormControl>
                </Grid>
                <Grid item md={2} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      <b>Branch</b>{' '}
                    </Typography>
                    <Typography>{selectedBranch} </Typography>
                    {/* <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={migrateData?.branch}
                     
                    /> */}
                  </FormControl>
                </Grid>
                <Grid item md={2} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      <b>Unit</b>{' '}
                    </Typography>
                    <Typography>{selectedUnit}</Typography>
                    {/* <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={selectedUnit}
                     
                    /> */}
                  </FormControl>
                </Grid>
                <Grid item md={2} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      <b>Team</b>{' '}
                    </Typography>
                    <Typography>{selectedTeam} </Typography>
                    {/* <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={selectedTeam}
                     
                    /> */}
                  </FormControl>
                </Grid>
                <Grid item md={2} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      <b>Department</b>{' '}
                    </Typography>
                    <Typography>{employee?.department} </Typography>
                    {/* <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={employee?.department}
                     
                    /> */}
                  </FormControl>
                </Grid>
                <Grid item md={2} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      <b>Designation</b>{' '}
                    </Typography>
                    <Typography>{selectedDesignation} </Typography>
                    {/* <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={selectedDesignation}
                     
                    /> */}
                  </FormControl>
                </Grid>

                <Grid item md={4} xs={12} sm={12}>
                  <Typography>
                    Type<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Selects
                      options={Typeoptions}
                      value={{
                        label: employee?.type,
                        value: employee?.type,
                      }}
                      onChange={(e) => {
                        setEmployee({
                          ...employee,
                          type: e.value,
                          salaryrange: 'Please Select Salary Range',
                        });
                        setLoginNotAllot({
                          ...loginNotAllot,
                          process: 'Please Select Process',
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                {employee?.type === 'Amount Wise' && (
                  <>
                    <Grid item md={4} xs={12} sm={12}>
                      <Grid container spacing={2}>
                        <Grid item md={6} xs={6} sm={6}>
                          <Typography>
                            Salary Range<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <FormControl fullWidth size="small">
                            <Selects
                              options={salaryrangeoptions}
                              value={{
                                label: employee?.salaryrange,
                                value: employee?.salaryrange,
                              }}
                              onChange={(e) => {
                                setEmployee({
                                  ...employee,
                                  salaryrange: e.value,
                                  from: '',
                                  to: '',
                                  amountvalue: '',
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>

                        {employee?.salaryrange === 'Between' ? (
                          <>
                            <Grid item md={3} xs={3} sm={3}>
                              <Typography>
                                From<b style={{ color: 'red' }}>*</b>
                              </Typography>
                              <FormControl fullWidth size="small">
                                <OutlinedInput
                                  id="component-outlined"
                                  type="text"
                                  size="small"
                                  value={employee?.from}
                                  onChange={(e) => {
                                    setEmployee({
                                      ...employee,
                                      from: e.target.value,
                                    });
                                  }}
                                />
                              </FormControl>
                            </Grid>

                            <Grid item md={3} xs={3} sm={3}>
                              <Typography>
                                To<b style={{ color: 'red' }}>*</b>
                              </Typography>
                              <FormControl fullWidth size="small">
                                <OutlinedInput
                                  id="component-outlined"
                                  type="text"
                                  size="small"
                                  value={employee?.to}
                                  onChange={(e) => {
                                    setEmployee({
                                      ...employee,
                                      to: e.target.value,
                                    });
                                  }}
                                />
                              </FormControl>
                            </Grid>
                          </>
                        ) : (
                          <Grid item md={6} xs={6} sm={6}>
                            <Typography>
                              Amount Value<b style={{ color: 'red' }}>*</b>
                            </Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              size="small"
                              value={employee?.amountvalue}
                              onChange={(e) => {
                                setEmployee({
                                  ...employee,
                                  amountvalue: e.target.value,
                                });
                              }}
                            />
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  </>
                )}
                {employee?.type === 'Process Wise' && (
                  <>
                    <Grid item md={4} xs={12} sm={12}>
                      <Typography>
                        Process<b style={{ color: 'red' }}>*</b>
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
                          }}
                        />
                      </FormControl>
                    </Grid>
                  </>
                )}
              </Grid>
              <br /> <br />
              <Grid container spacing={2}>
                <Grid item md={4} xs={4} sm={4}>
                  <Button variant="contained" onClick={handlesalary}>
                    Filter
                  </Button>
                </Grid>
                <Grid item md={4} xs={4} sm={4}>
                  <Button sx={userStyle.btncancel} onClick={handleClear}>
                    Clear
                  </Button>
                </Grid>
                <Grid item md={4} xs={4} sm={4}>
                  <Button variant="contained" color="error" onClick={handleCloseModEdit}>
                    {' '}
                    Close{' '}
                  </Button>
                </Grid>
              </Grid>
            </Box>
            <br />
            <Divider></Divider>
            <Box sx={{ padding: '20px' }}>
              {/* ******************************************************EXPORT Buttons****************************************************** */}
              <Grid item xs={8}>
                <Typography sx={userStyle.importheadtext}>List</Typography>
              </Grid>
              <br />
              <Grid container style={userStyle.dataTablestyle}>
                <Grid item md={2} xs={12} sm={12}>
                  <Box>
                    <label>Show entries:</label>
                    <Select
                      id="pageSizeSelect"
                      size="small"
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
                      <MenuItem value={salaryfix?.length}>All</MenuItem>
                    </Select>
                  </Box>
                </Grid>
                {/* <Grid item md={8} xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Box >
                    {isUserRoleCompare?.includes("excelarea") && (
                      <>
                        <ExportXL csvData={areaData} fileName={fileName} />
                      </>
                    )}
                    {isUserRoleCompare?.includes("csvarea") && (
                      <>
                        <ExportCSV csvData={areaData} fileName={fileName} />

                      </>
                    )}
                    {isUserRoleCompare?.includes("printarea") && (
                      <>
                        <Button sx={userStyle.buttongrp} onClick={handleprint}>&ensp;<FaPrint />&ensp;Print&ensp;</Button>
                      </>
                    )}
                    {isUserRoleCompare?.includes("pdfarea") && (
                      <>
                        <Button sx={userStyle.buttongrp} onClick={() => downloadPdf()} ><FaFilePdf />&ensp;Export to PDF&ensp;</Button>
                      </>
                    )}
                    {isUserRoleCompare?.includes("imagearea") && (
                      <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}> <ImageIcon sx={{ fontSize: "15px" }} />  &ensp;Image&ensp; </Button>
                    )}
                  </Box >
                </Grid> */}
                <Grid item md={2} xs={6} sm={6}>
                  <Box>
                    <FormControl fullWidth size="small">
                      <Typography>Search</Typography>
                      <OutlinedInput id="component-outlined" type="text" value={searchQuery} onChange={handleSearchChange} />
                    </FormControl>
                  </Box>
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
              {/* Manage Column */}
              <Popover
                id={idopen}
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
              <br />
              <br />
              {isArea ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
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
                    <StyledDataGrid
                      onClipboardCopy={(copiedString) => setCopiedData(copiedString)}
                      rows={rowsWithCheckboxes}
                      columns={columnDataTable.filter((column) => columnVisibility[column.field])}
                      onSelectionModelChange={handleSelectionChange}
                      selectionModel={selectedRows}
                      autoHeight={true}
                      ref={gridRef}
                      density="compact"
                      hideFooter
                      getRowClassName={getRowClassName}
                      disableRowSelectionOnClick
                    />
                  </Box>
                  <Box style={userStyle.dataTablestyle}>
                    <Box>
                      Showing {filteredData.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredDatas.length)} of {filteredDatas.length} entries
                    </Box>
                    <Box>
                      <Button onClick={() => setPage(1)} disabled={page === 1} sx={userStyle.paginationbtn}>
                        <FirstPageIcon />
                      </Button>
                      <Button onClick={() => handlePageChange(page - 1)} disabled={page === 1} sx={userStyle.paginationbtn}>
                        <NavigateBeforeIcon />
                      </Button>
                      {pageNumbers?.map((pageNumber) => (
                        <Button key={pageNumber} sx={userStyle.paginationbtn} onClick={() => handlePageChange(pageNumber)} className={page === pageNumber ? 'active' : ''} disabled={page === pageNumber}>
                          {pageNumber}
                        </Button>
                      ))}
                      {lastVisiblePage < totalPages && <span>...</span>}
                      <Button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} sx={userStyle.paginationbtn}>
                        <NavigateNextIcon />
                      </Button>
                      <Button onClick={() => setPage(totalPages)} disabled={page === totalPages} sx={userStyle.paginationbtn}>
                        <LastPageIcon />
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Dialog>
        </Box>

        <Box>
          <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogContent
              sx={{
                width: '350px',
                textAlign: 'center',
                alignItems: 'center',
              }}
            >
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
  const renderStepSeven = () => {
    return (
      <>
        <Headtitle title={'INTERN CREATE'} />
        {/* <form onSubmit={ (e) =>  }> */}
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-start' }} alignItems="center">
            <Button
              className="prev"
              variant="contained"
              size="small"
              onClick={prevStep}
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
                mb: { xs: 1, md: 0 },
                ...buttonStyles?.buttonsubmit, // Margin bottom for small screens
              }}
            >
              Previous
            </Button>
          </Grid>
          <Grid item md={10} xs={12} sm={12}>
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
                      options={companies.map((data) => ({
                        label: data?.name,
                        value: data?.name,
                        code: data.code,
                      }))}
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
                          label: data?.name,
                          value: data?.name,
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
                          label: data?.name,
                          value: data?.name,
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
                          options={companies.map((data) => ({
                            label: data?.name,
                            value: data?.name,
                            code: data.code,
                          }))}
                          styles={colourStyles}
                          value={{
                            label: datas.fromcompany,
                            value: datas.fromcompany,
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
                              label: data?.name,
                              value: data?.name,
                              ...data,
                            }))}
                          styles={colourStyles}
                          value={{
                            label: datas.frombranch,
                            value: datas.frombranch,
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
                              label: data?.name,
                              value: data?.name,
                              code: data.code,
                            }))}
                          styles={colourStyles}
                          value={{
                            label: datas.fromunit,
                            value: datas.fromunit,
                          }}
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
            <Box sx={userStyle.dialogbox}>
              <Grid container spacing={1}>
                <Grid item md={8} xs={0} sm={4}>
                  <Typography sx={userStyle.SubHeaderText}>Connects</Typography>
                  {createRocketChat?.isThereOldAccount && <p style={{ fontSize: 'small' }}>{`(Can not retrieve old Account, Only new Account will be created.)`}</p>}
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>&nbsp;</Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={createRocketChat?.create}
                          onChange={(e) => {
                            setCreateRocketChat((prev) => ({
                              ...prev,
                              create: e.target.checked,
                              roles: [
                                {
                                  label: 'user',
                                  value: 'user',
                                },
                              ],
                              email: employee?.companyemail?.split(',')?.length > 0 ? employee?.companyemail?.split(',')[0] : '',
                            }));
                          }}
                        />
                      }
                      label="Create Account"
                    />
                  </FormControl>
                </Grid>
                {createRocketChat?.create && (
                  <>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Email<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          maxMenuHeight={250}
                          options={
                            employee?.companyemail?.split(',')?.length > 0
                              ? employee?.companyemail?.split(',')?.map((data) => ({
                                  label: data,
                                  value: data,
                                }))
                              : []
                          }
                          placeholder="Please Select Email"
                          value={{
                            label: !createRocketChat?.email ? 'Please Select Email' : createRocketChat?.email,
                            value: !createRocketChat?.email ? 'Please Select Email' : createRocketChat?.email,
                          }}
                          onChange={(e) => {
                            setCreateRocketChat((prev) => ({ ...prev, email: e.value }));
                          }}
                        />
                        {accessibleErrors.rocketchatemail && <div>{accessibleErrors.rocketchatemail}</div>}
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Role<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <MultiSelect
                          options={rocketChatRolesOptions}
                          value={createRocketChat?.roles}
                          onChange={(e) => {
                            handleRocketchatRoleChange(e);
                          }}
                          valueRenderer={customValueRendererRocketchatRole}
                          labelledBy="Please Select Role"
                        />
                        {accessibleErrors.rocketchatrole && <div>{accessibleErrors.rocketchatrole}</div>}
                      </FormControl>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
            <br />
            <HiConnectComponentCreate value={createHiConnect} setValue={setCreateHiConnect} employeeEmails={employee?.companyemail} errors={accessibleErrors} employee={employee} from="create" />
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
                onClick={prevStep}
                sx={{
                  display: { xs: 'block', md: 'none' }, // Show on small screens, hide on large screens
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                Previous
              </Button>
              {/* <Button
                variant="contained"
                // sx={buttonSx}
                size="small"
                sx={{
                  ...buttonSx,
                  ...buttonStyles?.buttonsubmit,
                  textTransform: 'capitalize',
                  width: '73px',
                }}
                disabled={loading}
                onClick={(e) => {
                  // handleButtonClickLast(e);
                  handleOpenConfirmationPopup('submit');
                }}
              >
                SUBMIT
                {loading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: green[500],
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Button> */}
              <Button
                variant="contained"
                // sx={buttonSx}
                size="small"
                sx={{
                  ...buttonSx,
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
                disabled={loading}
                onClick={(e) => {
                  handleButtonClickSeven(e);
                }}
              >
                Next
                {loading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: green[500],
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Button>
              {/* <Link
                to="/internlist"
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

              {/* <LoadingButton
                size="small"
                variant="contained"
                loading={draftLoader}
                onClick={(e) => {
                  // handleDraftSubmit(e);
                  handleOpenConfirmationPopup("draft");
                }}
                sx={{
                  ...userStyle.btncancel,
                  textTransform: "capitalize",
                  width: "73px",
                }}
              >
                Draft
              </LoadingButton> */}
            </Box>
          </Grid>
        </Grid>
        <Box>
          <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogContent
              sx={{
                width: '350px',
                textAlign: 'center',
                alignItems: 'center',
              }}
            >
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

  const renderStepEight = () => {
    return (
      <>
        <Headtitle title={'INTERN CREATE'} />
        <Grid container spacing={2}>
          <Grid item md={1} xs={12} sm={12} container justifyContent={{ xs: 'center', md: 'flex-start' }} alignItems="center">
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
              onClick={prevStep}
            >
              Previous
            </Button>
          </Grid>
          <Grid item md={10} xs={12} sm={12} mt={3}>
            <Box sx={userStyle.dialogbox}>
              <Grid container spacing={1}>
                <Grid item md={8} xs={0} sm={4}>
                  <Typography sx={userStyle.SubHeaderText}>Biometric User Creation</Typography>
                </Grid>
              </Grid>
              <br />

              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>&nbsp;</Typography>
                  <FormControlLabel control={<Checkbox checked={CheckedBiometric} disabled={BioPostCheckDevice} onChange={(e) => setCheckedBiometric((prev) => !prev)} />} label="Create Biometric" />
                </FormControl>
              </Grid>
              {CheckedBiometric && (
                <BiometricForm
                  employee={employee}
                  BiometricDeviceOptions={BiometricDeviceOptions}
                  setEmployee={setEmployee}
                  auth={auth}
                  SERVICE={SERVICE}
                  handleApiError={handleApiError}
                  setPopupContentMalert={setPopupContentMalert}
                  setPopupSeverityMalert={setPopupSeverityMalert}
                  handleClickOpenPopupMalert={handleClickOpenPopupMalert}
                  enableLoginName={enableLoginName}
                  third={third}
                  BiometricPostDevice={BiometricPostDevice}
                  setBiometricPostDevice={setBiometricPostDevice}
                  BioPostCheckDevice={BioPostCheckDevice}
                  setBioPostCheckDevice={setBioPostCheckDevice}
                  pagename={true}
                  setUsernameBio={setUsernameBio}
                  profileImage={croppedImage ? String(croppedImage) : employee?.profileimage}
                  setCheckedBiometricAdded={setCheckedBiometricAdded}
                />
              )}
              {/* </Grid> */}
            </Box>
            <br />
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
              <Button
                className="prev"
                variant="contained"
                size="small"
                onClick={prevStep}
                sx={{
                  display: { xs: 'block', md: 'none' }, // Show on small screens, hide on large screens
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                size="small"
                // sx={buttonSx}
                sx={{
                  ...buttonSx,
                  textTransform: 'capitalize',
                  width: '73px',
                  ...buttonStyles?.buttonsubmit,
                }}
                disabled={loading}
                onClick={(e) => {
                  // handleButtonClickLast(e);
                  handleOpenConfirmationPopup('submit');
                }}
              >
                SUBMIT
                {loading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: green[500],
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Button>

              {/* <Link
                  to="/list"
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
                size="small"
                variant="contained"
                loading={draftLoader}
                onClick={(e) => {
                  // handleDraftSubmit(e);
                  handleOpenConfirmationPopup('draft');
                }}
                sx={{
                  ...userStyle.btncancel,
                  textTransform: 'capitalize',
                  width: '73px',
                }}
              >
                Draft
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>
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
        <li className={step === 7 ? 'active' : null}>
          <FaArrowAltCircleRight />
          &ensp;User Access
        </li>
        <li className={step === 8 ? 'active' : null}>
          <FaArrowAltCircleRight />
          &ensp;Bx-Biometric
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
      {step === 7 ? renderStepSeven() : null}
      {step === 8 ? renderStepEight() : null}

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
          <OutlinedInput type="text" placeholder="Enter IFSC Code" name="ifscCode" style={{ height: '30px', margin: '10px' }} value={employee?.ifscCode} onChange={handleInputChange} />
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
                sx={{ borderRadius: '20px', padding: '0 10px', ...buttonStyles?.buttonsubmit }}
                onClick={(e) => {
                  const matchedBank = accounttypes.find((bank) => {
                    const labelBeforeHyphen = bank.label.split(' - ')[0];

                    return labelBeforeHyphen.toLowerCase()?.trim() === bankDetails.BANK.toLowerCase()?.trim();
                  });
                  setEmployee({
                    ...employee,
                    bankbranchname: String(bankDetails.BRANCH),
                    ifsccode: employee?.ifscCode,
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
                <Typography sx={{ ...userStyle.HeaderText, marginLeft: '28px', display: 'flex', justifyContent: 'center' }}>There is No Profile</Typography>
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
                <Tooltip title={showDupProfileVIsitor?.some((data) => data?.modelName === 'Employee') ? 'Cannot upload duplicate images for employee?.' : ''} placement="top" arrow>
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
      <LoadingBackdrop open={isLoading} />
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
        title={popup.action === 'submit' ? 'Are you sure? Do you want to Submit?' : popup.action === 'draft' ? 'Are you sure? Do you want to save as Draft?' : 'Are you sure? Do you want to Cancel?'}
        description={popup.action === 'submit' ? 'This action will finalize and submit your data.' : popup.action === 'draft' ? 'This action will save your progress as a draft.' : 'This action will cancel your progress.'}
        confirmButtonText={popup.action === 'submit' ? 'Submit' : popup.action === 'draft' ? 'Save Draft' : 'Yes'}
        cancelButtonText="No"
        icon={popup.action === 'submit' ? 'success' : popup.action === 'draft' ? 'warning' : 'error'}
        iconColor={popup.action === 'submit' ? 'green' : popup.action === 'draft' ? 'orange' : 'red'}
        confirmButtonColor={popup.action === 'submit' ? 'success' : popup.action === 'draft' ? 'warning' : 'error'}
      />
    </div>
  );
}

export default RejoinInternCreate;
