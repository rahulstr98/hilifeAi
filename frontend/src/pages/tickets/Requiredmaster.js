import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Box,
  Typography,
  OutlinedInput,
  TableBody,
  TableRow,
  FormGroup,
  TableCell,
  FormControlLabel,
  Select,
  Paper,
  MenuItem,
  DialogTitle,
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
import { userStyle, colourStyles } from '../../pageStyle';
import { FaPrint, FaFilePdf, FaPlus, FaEdit, FaFileCsv, FaFileExcel } from 'react-icons/fa';
import { MdOutlineDone } from 'react-icons/md';
import { StyledTableRow, StyledTableCell } from '../../components/Table';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from '../../axiosInstance';
import { SERVICE } from '../../services/Baseservice';
import StyledDataGrid from '../../components/TableStyle';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useReactToPrint } from 'react-to-print';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import moment from 'moment-timezone';
import { UserRoleAccessContext, AuthContext } from '../../context/Appcontext';
import { handleApiError } from '../../components/Errorhandling';
import Headtitle from '../../components/Headtitle';
import { ThreeDots } from 'react-loader-spinner';
import Selects from 'react-select';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import { saveAs } from 'file-saver';
import Switch from '@mui/material/Switch';
import CloseIcon from '@mui/icons-material/Close';
import html2canvas from 'html2canvas';
import ImageIcon from '@mui/icons-material/Image';
import { AiOutlineClose } from 'react-icons/ai';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import { MultiSelect } from 'react-multi-select-component';
import { useLocation } from 'react-router-dom';
import LoadingButton from '@mui/lab/LoadingButton';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AlertDialog from '../../components/Alert';
import { DeleteConfirmation, PleaseSelectRow } from '../../components/DeleteConfirmation.js';
import ExportData from '../../components/ExportData';
import InfoPopup from '../../components/InfoPopup.js';
import MessageAlert from '../../components/MessageAlert';
import PageHeading from '../../components/PageHeading';
import domtoimage from 'dom-to-image';

import AggregatedSearchBar from '../../components/AggregatedSearchBar';
import AggridTable from '../../components/AggridTable';
import { getCurrentServerTime } from '../../components/getCurrentServerTime';



function RequiredMaster() {
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const [searchedString, setSearchedString] = useState('');
  const [isHandleChange, setIsHandleChange] = useState(false);
  const gridRefTable = useRef(null);
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState('');
  const [popupSeverityMalert, setPopupSeverityMalert] = useState('');
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

  let exportColumnNames = ['Category', 'Subcategory', 'Sub Subcategory', 'Options', 'Details'];
  let exportRowValues = ['category', 'subcategory', 'subsubcategory', 'options', 'details'];

  useEffect(() => {
    getapi();
  }, []);

  const getapi = async () => {
    const NewDatetime = await getCurrentServerTime();

    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String('Ticket/Master/Required Master'),
      commonid: String(isUserRoleAccess?._id),
      date: String(new Date(NewDatetime)),
      addedby: [
        {
          name: String(isUserRoleAccess?.username),
          date: String(new Date(NewDatetime)),
        },
      ],
    });
  };

  const [addRequired, setAddRequired] = useState({
    category: 'Please Select Category',
    subcategory: 'Please Select  SubCategory',
    details: '',
    options: 'Please Select Options',
    count: '',
    raiser: true,
    resolver: true,
    restriction: true,
  });
  const [editingIndexcheck, setEditingIndexcheck] = useState(-1);
  const [isButton, setIsButton] = useState(false);
  const [editingIndexcheckEdit, setEditingIndexcheckEdit] = useState(-1);
  const [optionsTodo, setOptionsTodo] = useState('');
  const [detailsTodo, setDetailsTodo] = useState('');
  const [raiserTodo, setRaiserTodo] = useState('');
  const [resolverTodo, setResolverTodo] = useState('');
  const [restrictionTodo, setRestrictionTodo] = useState('');
  const [addReqTodo, setAddReqTodo] = useState([]);
  const [typemasterEdit, setTypemasterEdit] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTodoEdit, setIsTodoEdit] = useState(Array(addReqTodo.length).fill(false));
  //subcategory multiselect
  const [selectedOptionsSubCat, setSelectedOptionsSubCat] = useState([]);
  let [valueSubCat, setValueSubCat] = useState([]);
  const [selectedPreValues, setSelectedPreValue] = useState([]);
  let [preValues, setPreValues] = useState([]);
  const [requiredcheck, setAddRequiredCheck] = useState([]);
  const [requiuredMaster, setRequiredMaster] = useState([]);
  const [requiuredMasterList, setRequiredMasterList] = useState([]);
  const [editRequired, setEditRequired] = useState({});
  const [editRequiredEdit, setEditRequiredEdit] = useState({
    category: 'Please Select Category',
    subcategory: 'Please Select  SubCategory',
    details: '',
    count: '',
    options: 'Please Select Options',
    raiser: true,
    resolver: true,
    restriction: true,
  });
  const [editRequiredTodo, setEditRequiredTodo] = useState([]);
  const [todoEdit, setTodoEdit] = useState([Array(editRequiredTodo.length).fill(false)]);
  const [requiredEditCheck, setRequiredEditCheck] = useState([]);
  const [getOverAllCountDelete, setGetOverallCountDelete] = useState('');

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

  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };

  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };

  const detailsOptions = [
    { label: 'Text Box', value: 'Text Box' },
    { label: 'Text Box-number', value: 'Text Box-number' },
    { label: 'Text Box-alpha', value: 'Text Box-alpha' },
    { label: 'Text Box-alphanumeric', value: 'Text Box-alphanumeric' },
    { label: 'Attachments', value: 'Attachments' },
    { label: 'Pre-Value', value: 'Pre-Value' },
    { label: 'Date', value: 'Date' },
    { label: 'Time', value: 'Time' },
    { label: 'DateTime', value: 'DateTime' },
    { label: 'Date Multi Span', value: 'Date Multi Span' },
    { label: 'Date Multi Span Time', value: 'Date Multi Span Time' },
    { label: 'Date Multi Random', value: 'Date Multi Random' },
    { label: 'Date Multi Random Time', value: 'Date Multi Random Time' },
    { label: 'Radio', value: 'Radio' },
  ];
  const YesOrNoOptions = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ];

  const keywordsOptions = [
    { label: 'LEGALNAME', value: 'LEGALNAME' },
    { label: 'DATE OF BIRTH', value: 'DATE OF BIRTH' },
    { label: 'PERMANENT ADDRESS', value: 'PERMANENT ADDRESS' },
    { label: 'CURRENT ADDRESS', value: 'CURRENT ADDRESS' },
    { label: 'EMAIL', value: 'EMAIL' },
    { label: 'PHONE NUMBER', value: 'PHONE NUMBER' },
    { label: 'DATE OF JOINING', value: 'DATE OF JOINING' },
    { label: 'DATE OF TRAINING', value: 'DATE OF TRAINING' },
    { label: 'EMPLOYEE CODE', value: 'EMPLOYEE CODE' },
    { label: 'BRANCH', value: 'BRANCH' },
    { label: 'LOGIN', value: 'LOGIN' },
    { label: 'COMPANY NAME', value: 'COMPANY NAME' },
    { label: 'FIRST NAME', value: 'FIRST NAME' },
    { label: 'LAST NAME', value: 'LAST NAME' },
    { label: 'DESIGNATION', value: 'DESIGNATION' },
    { label: 'UNIT', value: 'UNIT' },
    { label: 'TEAM', value: 'TEAM' },
    { label: 'PROCESS', value: 'PROCESS' },
    { label: 'DEPARTMENT', value: 'DEPARTMENT' },
    { label: 'LAST WORKING DATE', value: 'LAST WORKING DATE' },
    { label: 'SHIFT', value: 'SHIFT' },
    { label: 'ACCOUNT NAME', value: 'ACCOUNT NAME' },
    { label: 'ACCOUNT NUMBER', value: 'ACCOUNT NUMBER' },
    { label: 'IFSC', value: 'IFSC' },
    { label: 'CURRENT DATE', value: 'CURRENT DATE' },
    { label: 'CURRENT TIME', value: 'CURRENT TIME' },
    { label: 'BREAK', value: 'BREAK' },
    { label: 'WORKSTATION NAME', value: 'WORKSTATION NAME' },
    { label: 'WORKSTATION COUNT', value: 'WORKSTATION COUNT' },
    { label: 'SYSTEM COUNT', value: 'SYSTEM COUNT' },
  ];

  const { isUserRoleCompare, isUserRoleAccess, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);

  const [typemasterCheck, setTypemastercheck] = useState(false);

  const username = isUserRoleAccess.username;

  const gridRef = useRef(null);

  const [selectedRows, setSelectedRows] = useState([]);

  const [searchQueryManage, setSearchQueryManage] = useState('');

  const [copiedData, setCopiedData] = useState('');

  //image
  const gridRefTableImg = useRef(null);
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage
        .toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, 'Required Master.png');
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

  // view model
  const [openview, setOpenview] = useState(false);

  const handleClickOpenview = () => {
    setOpenview(true);
  };

  const handleCloseview = () => {
    setOpenview(false);
  };

  // Error Popup model
  const [isErrorOpenpop, setIsErrorOpenpop] = useState(false);
  const [showAlertpop, setShowAlertpop] = useState();
  const handleClickOpenerrpop = () => {
    setIsErrorOpenpop(true);
  };
  const handleCloseerrpop = () => {
    setIsErrorOpenpop(false);
  };

  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
    setIsButton(false);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
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
      setIsDeleteOpencheckbox(true);
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
    category: true,
    subcategory: true,
    subsubcategory: true,
    details: true,
    options: true,
    actions: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const encodedData = queryParams.get('data');

  const fetchData = async () => {
    const dataSplit = encodedData.split(',');
    const category = [dataSplit[0]];
    const subcategory = [dataSplit[1]];
    const subsubcategory = dataSplit[2] === 'Please Select Sub Sub-category' || dataSplit[2] === '' ? [] : [dataSplit[2]];
    setSelectedOptionsCat(
      category.map((data) => ({
        ...data,
        label: data,
        value: data,
      }))
    );
    let res_category = await axios.get(SERVICE.CATEGORYTICKET, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });
    const filteredCategoryOptions = res_category.data.ticketcategory
      ?.filter((u) => category?.includes(u.categoryname))
      .map((u) => ({
        ...u,
        label: u.subcategoryname,
        value: u.subcategoryname,
      }));
    let subcategoryNames = filteredCategoryOptions.flatMap((obj) =>
      obj.subcategoryname.map((subcategory) => ({
        label: subcategory,
        value: subcategory,
      }))
    );
    setFilteredSubCategoryOptions(subcategoryNames);

    setSelectedOptionsSubCat(
      subcategory.map((data) => ({
        ...data,
        label: data,
        value: data,
      }))
    );

    let res_subsubcategory = await axios.get(SERVICE.SUBSUBCOMPONENT, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });
    const filteredSubSubCategoryOptions = res_subsubcategory?.data?.subsubcomponents
      ?.filter((u) => u.categoryname.some((data) => category.includes(data)) && u.subcategoryname.some((data) => subcategory.includes(data)))
      .map((u) => ({
        ...u,
        label: u.subsubname,
        value: u.subsubname,
      }));

    setFilteredSubSubCategoryOptions(filteredSubSubCategoryOptions);

    setSelectedOptionsSubSubCat(
      subsubcategory.map((data) => ({
        ...data,
        label: data,
        value: data,
      }))
    );
  };

  useEffect(() => {
    fetchData();
  }, [encodedData]);

  useEffect(() => {
    // Get the current URL
    const currentUrl = window.location.href;

    // Check if the 'data' query parameter is present
    if (currentUrl.includes('?data=')) {
      // Remove the 'data' query parameter
      const newUrl = currentUrl.split('?data=')[0];

      // Replace the current URL without the 'data' parameter
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [encodedData]);

  const getRequiredMaster = async (id) => {
    setPageName(!pageName);
    try {
      let res_data = await axios.get(SERVICE.REQUIREDFIELDS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setAddRequiredCheck(res_data.data.required?.filter((data) => data._id !== id));
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const getRequiredMasterEdit = async (id) => {
    setPageName(!pageName);
    try {
      let res_data = await axios.get(SERVICE.REQUIREDFIELDS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setRequiredEditCheck(res_data.data.required.filter((data) => data._id != id));
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const addTodo = () => {
    let catopt = selectedOptionsCat.map((item) => item.value);
    let subcatopt = selectedOptionsSubCat.map((item) => item.value);
    let subSubcatopt = selectedOptionsSubSubCat.map((item) => item.value);
    const dbDuplicateCheckSubCate = requiredcheck.some(
      (data) => data.category.some((data) => catopt.includes(data)) && data.subcategory.some((data) => subcatopt.includes(data)) && data.overalldetails.some((item) => preValues.includes(item.details) && item.options?.toLowerCase() === addRequired.options?.toLowerCase())
    );
    const dbDuplicateCheckSubSubCate = requiredcheck.some(
      (data) =>
        data.category.some((data) => catopt.includes(data)) &&
        data.subcategory.some((data) => subcatopt.includes(data)) &&
        data.subsubcategory.some((data) => subSubcatopt.includes(data)) &&
        data.overalldetails.some((item) => preValues.includes(item.details) && item.options?.toLowerCase() === addRequired.options?.toLowerCase())
    );

    const dbDuplicateCheck = subSubcatopt.length > 0 ? dbDuplicateCheckSubSubCate : dbDuplicateCheckSubCate;

    //other the Pre value
    const duplicateDetails = addReqTodo.some((data) => data.options?.toLowerCase() === addRequired.options?.toLowerCase() && data.details?.toLowerCase() === addRequired.details?.toLowerCase());

    //For Pre value
    const duplicateDetailsPreValue = addReqTodo.some((data) => preValues.includes(data.details) && data.options?.toLowerCase() === addRequired.options?.toLowerCase());
    if (duplicateDetails || duplicateDetailsPreValue) {
      setPopupContentMalert('Detail Already Added');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (dbDuplicateCheck) {
      setPopupContentMalert('Detail Already Added');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (valueCat?.length == 0) {
      setPopupContentMalert('Please Select Category');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (valueSubCat?.length == 0) {
      setPopupContentMalert('Please Select Sub Category');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (filteredSubSubCategoryOptions?.length != 0 && valueSubSubCat?.length == 0) {
      setPopupContentMalert('Please Select Sub Sub Category');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (addRequired.options === 'Please Select Options') {
      setPopupContentMalert('Please Select Options');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (addRequired.options === 'Pre-Value' && preValues?.length < 1) {
      setPopupContentMalert('Please Select Details Name');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (!['Date Multi Random', 'Date Multi Random Time', 'Date Multi Span', 'Date Multi Span Time', 'Pre-Value'].includes(addRequired.options) && (addRequired.details === '' || addRequired.details === 'Please Select Detail')) {
      setPopupContentMalert(`${addRequired.options === 'Pre-Value' ? 'Please Select Detail' : 'Please Enter Detail'}`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (['Date Multi Random', 'Date Multi Random Time'].includes(addRequired.options) && addRequired.count === '') {
      setPopupContentMalert('Please Enter Count');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      if (addRequired.options === 'Date Multi Random') {
        const result = [];
        if (parseInt(addRequired.count) > 1) {
          // Create two objects based on the count
          for (let i = 0; i < parseInt(addRequired.count); i++) {
            const newObj = {
              category: addRequired.category || 'Please Select Category',
              count: addRequired.count || '2',
              details: addRequired.details || '',
              options: addRequired.options || 'Date Multi Random',
              raiser: addRequired.raiser || true,
              resolver: addRequired.resolver || true,
              subcategory: addRequired.subcategory || 'Please Select SubCategory',
            };
            result.push(newObj);
          }
        }
        setAddReqTodo((prevTodos) => [...prevTodos, ...result]);
        setIsTodoEdit(Array(addReqTodo.length).fill(false));
        setAddRequired({
          ...addRequired,
          details: addRequired.options != 'Pre-Value' ? '' : addRequired.details,
          count: '',
        });
      } else if (addRequired.options === 'Date Multi Random Time') {
        const result = [];
        if (parseInt(addRequired.count) > 1) {
          // Create two objects based on the count
          for (let i = 0; i < parseInt(addRequired.count); i++) {
            const newObj = {
              category: addRequired.category || 'Please Select Category',
              count: addRequired.count || '2',
              details: addRequired.details || '',
              options: addRequired.options || 'Date Multi Random Time',
              raiser: addRequired.raiser || true,
              resolver: addRequired.resolver || true,
              subcategory: addRequired.subcategory || 'Please Select SubCategory',
            };
            result.push(newObj);
          }
        }
        setAddReqTodo((prevTodos) => [...prevTodos, ...result]);
        setIsTodoEdit(Array(addReqTodo.length).fill(false));
        setAddRequired({
          ...addRequired,
          details: addRequired.options != 'Pre-Value' ? '' : addRequired.details,
          count: '',
        });
      } else if (addRequired.options === 'Date Multi Span') {
        const result = [];
        // Create two objects based on the count
        for (let i = 0; i < 2; i++) {
          const newObj = {
            category: addRequired.category || 'Please Select Category',
            details: i === 0 ? 'From Date' : 'To Date',
            options: addRequired.options || 'Date Multi Span',
            raiser: addRequired.raiser || true,
            resolver: addRequired.resolver || true,
            subcategory: addRequired.subcategory || 'Please Select SubCategory',
          };
          result.push(newObj);
        }
        setAddReqTodo((prevTodos) => [...prevTodos, ...result]);
        setIsTodoEdit(Array(addReqTodo.length).fill(false));
        setAddRequired({
          ...addRequired,
          details: addRequired.options != 'Pre-Value' ? '' : addRequired.details,
          count: '',
        });
      } else if (addRequired.options === 'Date Multi Span Time') {
        const result = [];
        // Create two objects based on the count
        for (let i = 0; i < 2; i++) {
          const newObj = {
            category: addRequired.category || 'Please Select Category',
            details: i === 0 ? 'From Date With Time' : 'To Date With Time',
            options: addRequired.options || 'Date Multi Span Time',
            raiser: addRequired.raiser || true,
            resolver: addRequired.resolver || true,
            subcategory: addRequired.subcategory || 'Please Select SubCategory',
          };
          result.push(newObj);
        }
        setAddReqTodo((prevTodos) => [...prevTodos, ...result]);
        setIsTodoEdit(Array(addReqTodo.length).fill(false));
        setAddRequired({
          ...addRequired,
          details: addRequired.options != 'Pre-Value' ? '' : addRequired.details,
          count: '',
        });
      } else if (addRequired.options === 'Pre-Value') {
        const result = [];
        // Create two objects based on the count
        for (let i = 0; i < preValues.length; i++) {
          const newObj = {
            category: addRequired.category || 'Please Select Category',
            count: addRequired.count || '2',
            details: preValues[i] || '',
            options: addRequired.options || 'Date Multi Random',
            raiser: addRequired.raiser || true,
            resolver: addRequired.resolver || true,
            restriction: addRequired.restriction || true,
            subcategory: addRequired.subcategory || 'Please Select SubCategory',
          };
          result.push(newObj);
        }

        setAddReqTodo((prevTodos) => [...prevTodos, ...result]);
        setIsTodoEdit(Array(addReqTodo.length).fill(false));
        setAddRequired({
          ...addRequired,
          details: addRequired.options != 'Pre-Value' ? '' : addRequired.details,
          count: '',
        });
      } else {
        setAddReqTodo((prevTodos) => [...prevTodos, { ...addRequired }]);
        setIsTodoEdit(Array(addReqTodo.length).fill(false));
        setAddRequired({
          ...addRequired,
          details: addRequired.options != 'Pre-Value' ? '' : addRequired.details,
          count: '',
        });
      }
      setEditingIndexcheck(-1);
    }
  };
  const addTodoEdit = () => {
    const duplicateDetails = editRequiredTodo.some((data) => data.options?.toLowerCase() === editRequiredEdit.options?.toLowerCase() && data.details?.toLowerCase() === editRequiredEdit.details?.toLowerCase());

    const dbDuplicateCheckSubCate = requiredEditCheck.some(
      (data) =>
        data.category.some((data) => categoryValueCateEdit.includes(data)) &&
        data.subcategory.some((data) => subCategoryValueCateEdit.includes(data)) &&
        data.overalldetails.some((item) => item.details?.toLowerCase() === editRequiredEdit.details?.toLowerCase() && item.options?.toLowerCase() === editRequiredEdit.options?.toLowerCase())
    );
    const dbDuplicateCheckSubSubCate = requiredcheck.some(
      (data) =>
        data.category.some((data) => categoryValueCateEdit.includes(data)) &&
        data.subcategory.some((data) => subCategoryValueCateEdit.includes(data)) &&
        data.subsubcategory.some((data) => subSubCategoryValueCateEdit.includes(data)) &&
        data.overalldetails.some((item) => item.details?.toLowerCase() === editRequiredEdit.details?.toLowerCase() && item.options?.toLowerCase() === editRequiredEdit.options?.toLowerCase())
    );

    const dbDuplicateCheck = subSubCategoryValueCateEdit.length > 0 ? dbDuplicateCheckSubSubCate : dbDuplicateCheckSubCate;

    if (duplicateDetails) {
      setPopupContentMalert('Detail Already Added');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (dbDuplicateCheck) {
      setPopupContentMalert('Detail Already Added');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (categoryValueCateEdit?.length == 0) {
      setPopupContentMalert('Please Select Category');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (subCategoryValueCateEdit?.length == 0) {
      setPopupContentMalert('Please Select Sub Category');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (filteredSubSubCategoryOptionsEdit?.length != 0 && subSubCategoryValueCateEdit?.length == 0) {
      setPopupContentMalert('Please Select Sub Sub Category');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (editRequiredEdit.options === 'Please Select Options') {
      setPopupContentMalert('Please Select Options');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (editRequiredEdit.options === 'Pre-Value' && (editRequiredEdit?.details === '' || editRequiredEdit?.details === undefined || editRequiredEdit?.details === 'Please Select Detail')) {
      setPopupContentMalert('Please Select Details');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (!['Date Multi Random', 'Date Multi Random Time', 'Date Multi Span', 'Date Multi Span Time', 'Pre-Value'].includes(editRequiredEdit.options) && (editRequiredEdit.details === '' || editRequiredEdit.details === 'Please Select Detail')) {
      setPopupContentMalert(`${editRequiredEdit.options === 'Pre-Value' ? 'Please Select Detail' : 'Please Enter  Detail'}`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (['Date Multi Random', 'Date Multi Random Time'].includes(editRequiredEdit.options) && editRequiredEdit.count === '') {
      setPopupContentMalert('Please Enter Count');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      if (editRequiredEdit.options === 'Date Multi Random') {
        const result = [];
        if (parseInt(editRequiredEdit.count) > 1) {
          // Create two objects based on the count
          for (let i = 0; i < parseInt(editRequiredEdit.count); i++) {
            const newObj = {
              category: editRequiredEdit.category || 'Please Select Category',
              count: editRequiredEdit.count || '2',
              details: editRequiredEdit.details || '',
              options: editRequiredEdit.options || 'Date Multi Random',
              raiser: editRequiredEdit.raiser || true,
              resolver: editRequiredEdit.resolver || true,
              subcategory: editRequiredEdit.subcategory || 'Please Select SubCategory',
            };
            result.push(newObj);
          }
        }
        setEditRequiredTodo((prevTodos) => [...prevTodos, ...result]);
        setIsTodoEdit(Array(addReqTodo.length).fill(false));
        setEditRequired({
          ...editRequiredEdit,
          details: editRequiredEdit.options != 'Pre-Value' ? '' : editRequiredEdit.details,
          count: '',
        });
      } else if (editRequiredEdit.options === 'Date Multi Random Time') {
        const result = [];
        if (parseInt(editRequiredEdit.count) > 1) {
          // Create two objects based on the count
          for (let i = 0; i < parseInt(editRequiredEdit.count); i++) {
            const newObj = {
              category: editRequiredEdit.category || 'Please Select Category',
              count: editRequiredEdit.count || '2',
              details: editRequiredEdit.details || '',
              options: editRequiredEdit.options || 'Date Multi Random Time',
              raiser: editRequiredEdit.raiser || true,
              resolver: editRequiredEdit.resolver || true,
              subcategory: editRequiredEdit.subcategory || 'Please Select SubCategory',
            };
            result.push(newObj);
          }
        }
        setEditRequiredTodo((prevTodos) => [...prevTodos, ...result]);
        setIsTodoEdit(Array(addReqTodo.length).fill(false));
        setEditRequired({
          ...editRequiredEdit,
          details: editRequiredEdit.options != 'Pre-Value' ? '' : editRequiredEdit.details,
          count: '',
        });
      } else if (editRequiredEdit.options === 'Date Multi Span') {
        const result = [];
        // Create two objects based on the count
        for (let i = 0; i < 2; i++) {
          const newObj = {
            category: editRequiredEdit.category || 'Please Select Category',
            details: i === 0 ? 'From Date' : 'To Date',
            options: editRequiredEdit.options || 'Date Multi Span',
            raiser: editRequiredEdit.raiser || true,
            resolver: editRequiredEdit.resolver || true,
            subcategory: editRequiredEdit.subcategory || 'Please Select SubCategory',
          };
          result.push(newObj);
        }
        setEditRequiredTodo((prevTodos) => [...prevTodos, ...result]);
        setIsTodoEdit(Array(addReqTodo.length).fill(false));
        setEditRequired({
          ...editRequiredEdit,
          details: editRequiredEdit.options != 'Pre-Value' ? '' : editRequiredEdit.details,
          count: '',
        });
      } else if (editRequiredEdit.options === 'Date Multi Span Time') {
        const result = [];
        // Create two objects based on the count
        for (let i = 0; i < 2; i++) {
          const newObj = {
            category: editRequiredEdit.category || 'Please Select Category',
            details: i === 0 ? 'From Date With Time' : 'To Date With Time',
            options: editRequiredEdit.options || 'Date Multi Span Time',
            raiser: editRequiredEdit.raiser || true,
            resolver: editRequiredEdit.resolver || true,
            subcategory: editRequiredEdit.subcategory || 'Please Select SubCategory',
          };
          result.push(newObj);
        }
        setEditRequiredTodo((prevTodos) => [...prevTodos, ...result]);
        setIsTodoEdit(Array(addReqTodo.length).fill(false));
        setEditRequired({
          ...editRequiredEdit,
          details: editRequiredEdit.options != 'Pre-Value' ? '' : editRequiredEdit.details,
          count: '',
        });
      } else {
        setEditRequiredTodo((prevTodos) => [...prevTodos, { ...editRequiredEdit }]);
        setEditRequired({
          ...editRequiredEdit,
          details: editRequiredEdit.options != 'Pre-Value' ? '' : editRequiredEdit.details,
          count: '',
        });
      }
      setEditingIndexcheckEdit(-1);
      setTodoEdit(Array(editRequiredTodo.length).fill(false));
    }
  };

  const handleEditTodocheck = (index) => {
    setEditingIndexcheck(index);
    setOptionsTodo(addReqTodo[index].options);
    setDetailsTodo(addReqTodo[index].details);
    setRaiserTodo(addReqTodo[index].raiser);
    setResolverTodo(addReqTodo[index].resolver);
    setRestrictionTodo(addReqTodo[index].restriction);
    // setTodoSubmit(true)
  };

  const handleUpdateTodocheck = () => {
    const newTodoscheck = [...addReqTodo];
    newTodoscheck[editingIndexcheck].options = optionsTodo;
    newTodoscheck[editingIndexcheck].details = detailsTodo;
    newTodoscheck[editingIndexcheck].raiser = raiserTodo;
    newTodoscheck[editingIndexcheck].resolver = resolverTodo;
    newTodoscheck[editingIndexcheck].restriction = restrictionTodo;
    setAddReqTodo(newTodoscheck);
    setEditingIndexcheck(-1);
  };
  const [optionsTodoEdit, setOptionsTodoEdit] = useState('');
  const [detailsTodoEdit, setDetailsTodoEdit] = useState('');
  const [raiserTodoEdit, setRaiserTodoEdit] = useState('');
  const [resolverTodoEdit, setResolverTodoEdit] = useState('');
  const [restrictionTodoEdit, setRestrictionTodoEdit] = useState('');
  const handleEditTodocheckEdit = (index) => {
    setEditingIndexcheckEdit(index);
    setOptionsTodoEdit(editRequiredTodo[index].options);
    setDetailsTodoEdit(editRequiredTodo[index].details);
    setRaiserTodoEdit(editRequiredTodo[index].raiser);
    setResolverTodoEdit(editRequiredTodo[index].resolver);
    setRestrictionTodoEdit(editRequiredTodo[index].restriction);
    // setTodoSubmit(true)
  };

  const handleUpdateTodocheckEdit = () => {
    const newTodoscheck = [...editRequiredTodo];
    newTodoscheck[editingIndexcheckEdit].options = optionsTodoEdit;
    newTodoscheck[editingIndexcheckEdit].details = detailsTodoEdit;
    newTodoscheck[editingIndexcheckEdit].raiser = raiserTodoEdit;
    newTodoscheck[editingIndexcheckEdit].resolver = resolverTodoEdit;
    newTodoscheck[editingIndexcheckEdit].restriction = restrictionTodoEdit;
    setEditRequiredTodo(newTodoscheck);
    setEditingIndexcheckEdit(-1);
  };

  const handleTodoEdit = (index, key, newValue) => {
    // Assuming addReqTodo is an array of objects
    const updatedTodos = addReqTodo.map((todo, i) => {
      if (i === index) {
        // Update the specific key-related value
        const updatedTodo = { ...todo, [key]: newValue };

        if (key == 'options') {
          updatedTodo.details = newValue === 'Pre-Value' ? 'Please Select Detail' : '';
        }

        return updatedTodo;
      }
      return todo;
    });

    setAddReqTodo(updatedTodos);
  };

  const handleEditTodo = (index, key, newValue) => {
    // Assuming addReqTodo is an array of objects
    const updatedTodos = editRequiredTodo.map((todo, i) => {
      if (i === index) {
        // Update the specific key-related value
        const updatedTodo = { ...todo, [key]: newValue };

        if (key == 'options') {
          updatedTodo.details = newValue === 'Pre-Value' ? 'Please Select Detail' : '';
        }

        return updatedTodo;
      }
      return todo;
    });

    setEditRequiredTodo(updatedTodos);
  };
  const deleteTodoEdit = (index) => {
    const updatedTodos = [...addReqTodo];
    updatedTodos.splice(index, 1);
    setAddReqTodo(updatedTodos);
    setEditingIndexcheck(-1);
  };

  const deleteTodoEditDb = (index) => {
    const updatedTodos = [...editRequiredTodo];
    updatedTodos.splice(index, 1);
    setEditRequiredTodo(updatedTodos);
    setEditingIndexcheckEdit(-1);
  };

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ''; // This is required for Chrome support
  };

  const fetchRequiredMaster = async () => {
    setPageName(!pageName);
    try {
      let res_data = await axios.get(SERVICE.REQUIREDFIELDS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTypemastercheck(true);
      setRequiredMasterList(res_data.data.required);

      const answer =
        res_data.data.required?.length > 0
          ? res_data.data.required?.map((item, index) => ({
              ...item,
              serialNumber: index + 1,
              id: item._id,
              category: item.category?.map((t, i) => `${i + 1 + '. '}` + t).join('\n'),
              subcategory: item.subcategory?.map((t, i) => `${i + 1 + '. '}` + t).join('\n'),
              subsubcategory: item.subsubcategory?.map((t, i) => `${i + 1 + '. '}` + t).join('\n'),
              options: item.overalldetails
                .map((data) => data.options.toString())
                .map((t, i) => `${i + 1 + '. '}` + t)
                .join('\n'),
              details: item.overalldetails
                .map((data) => data.details.toString())
                ?.map((t, i) => `${i + 1 + '. '}` + t)
                .join('\n'),
            }))
          : [];
      setRequiredMaster(answer);
    } catch (err) {
      setTypemastercheck(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchRequiredMaster();
    fetchCategoryBased();
    fetchSubsubcomponent();
  }, []);

  const [deleteType, setDeleteType] = useState('');

  const rowData = async (id, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.REQUIREFIELDS_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDeleteType(res?.data?.srequired);
      handleClickOpen();
      // getOverallEditSectionDelete(res?.data?.srequired)
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Alert delete popup
  let Typesid = deleteType?._id;
  const delType = async (e) => {
    setPageName(!pageName);
    try {
      if (Typesid) {
        await axios.delete(`${SERVICE.REQUIREFIELDS_SINGLE}/${e}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
        await fetchRequiredMaster();
        // await getRequiredMaster();
        await getRequiredMasterEdit();
        handleCloseMod();
        setSelectedRows([]);
        setPage(1);
        setPopupContent('Deleted Sucessfully');
        setPopupSeverity('success');
        handleClickOpenPopup();
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const delTypecheckbox = async () => {
    setPageName(!pageName);
    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(`${SERVICE.REQUIREFIELDS_SINGLE}/${item}`, {
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
      await fetchRequiredMaster();
      setPopupContent('Deleted Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [categorys, setCategorys] = useState([]);
  const [categorysEdit, setCategorysEdit] = useState([]);

  const [subcategorys, setSubcategorys] = useState([]);
  const [subcategorysEdit, setSubcategorysEdit] = useState([]);

  const fetchCategoryTicket = async () => {
    setPageName(!pageName);
    try {
      let res_category = await axios.get(SERVICE.CATEGORYTICKET, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const categoryall = [
        ...res_category?.data?.ticketcategory.map((d) => ({
          ...d,
          label: d.categoryname,
          value: d.categoryname,
        })),
      ];

      setCategorys(categoryall);
      setCategorysEdit(categoryall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchCategoryBased = async () => {
    setPageName(!pageName);
    try {
      let res_category = await axios.get(SERVICE.CATEGORYTICKET, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setCategoryOptions(res_category.data.ticketcategory);
      let data_set = res_category.data.ticketcategory
        .filter((data) => {
          return valueCat.includes(data.categoryname);
        })
        .map((data) => data.subcategoryname);

      let ans = [].concat(...data_set);
      setSubcategorys(
        ans.map((d) => ({
          ...d,
          label: d,
          value: d,
        }))
      );

      setSubcategorysEdit(
        ans.map((d) => ({
          ...d,
          label: d,
          value: d,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // add function
  const sendRequest = async () => {
    setPageName(!pageName);
    setIsButton(true);
    const NewDatetime = await getCurrentServerTime();
    try {
      const datascreate = await axios.post(
        SERVICE.REQUIREFIELDS_CREATE,
        {
          category: [...valueCat],
          subcategory: [...valueSubCat],
          subsubcategory: [...valueSubSubCat],
          overalldetails: [...addReqTodo],
          addedby: [
            {
              name: String(isUserRoleAccess.companyname),
              date: String(new Date(NewDatetime)),
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setIsButton(false);
      setAddReqTodo([]);
      setEditingIndexcheckEdit(-1);
      setAddRequired({
        ...addRequired,
        category: 'Please Select Category',
        subcategory: 'Please Select Subcategory',
        options: 'Please Select Options',
        details: '',
      });
      setSearchQuery('');
      setIsTodoEdit(Array(addReqTodo.length).fill(false));

      setPopupContent('Added Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
      // await getRequiredMaster();
      await fetchRequiredMaster();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //submit option for saving
  const handleSubmit = (e) => {
    e.preventDefault();

    let catopt = selectedOptionsCat.map((item) => item.value);
    let subcatopt = selectedOptionsSubCat.map((item) => item.value);
    let subSubcatopt = selectedOptionsSubSubCat.map((item) => item.value);
    const dbDuplicateCheckSubCate = requiuredMasterList.some(
      (data) =>
        data.category.some((data) => catopt.includes(data)) &&
        data.subcategory.some((data) => subcatopt.includes(data)) &&
        data.overalldetails.some((item) => addReqTodo.some((prob) => prob.details.toLowerCase() === item.details.toLowerCase()) && addReqTodo.some((prob) => prob.options.toLowerCase() === item.options.toLowerCase()))
    );
    const dbDuplicateCheckSubSubCate = requiuredMasterList.some(
      (data) =>
        data.category.some((data) => catopt.includes(data)) &&
        data.subcategory.some((data) => subcatopt.includes(data)) &&
        data.subsubcategory.some((data) => subSubcatopt.includes(data)) &&
        data.overalldetails.some((item) => addReqTodo.some((prob) => prob.details.toLowerCase() === item.details.toLowerCase()) && addReqTodo.some((prob) => prob.options.toLowerCase() === item.options.toLowerCase()))
    );
    const dbDuplicateCheck = subSubcatopt.length > 0 ? dbDuplicateCheckSubSubCate : dbDuplicateCheckSubCate;
    function hasDuplicateDetails(array) {
      const detailsSet = new Set();

      return array.some((obj) => {
        if (detailsSet.has(obj.details)) {
          // Duplicate details found
          return true;
        }
        detailsSet.add(obj.details);
        return false;
      });
    }

    const hasDuplicates = hasDuplicateDetails(addReqTodo);

    const TodoCheck = addReqTodo.some((data) => data.details === '');

    if (valueCat?.length == 0) {
      setPopupContentMalert('Please Select Category');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (valueSubCat?.length == 0) {
      setPopupContentMalert('Please Select Sub Category');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (filteredSubSubCategoryOptions?.length != 0 && valueSubSubCat?.length == 0) {
      setPopupContentMalert('Please Select Sub Sub Category');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (addReqTodo.length === 0) {
      setPopupContentMalert('Please Add The Todo And Submit');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (isTodoEdit.some((data) => data == true)) {
      setPopupContentMalert('Please Update The Todo And Submit ');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (dbDuplicateCheck) {
      setPopupContentMalert('Required Details Data already exists!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (TodoCheck) {
      setPopupContentMalert('Please Fill Details Name Fields!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (hasDuplicates) {
      setPopupContentMalert('Details Name are Same , Please Enter different Names!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      sendRequest();
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    setSubcategorys([]);
    setAddReqTodo([]);
    setAddRequired({
      ...addRequired,
      category: 'Please Select Category',
      subcategory: 'Please Select SubCategory',
      options: 'Please Select Options',
      details: '',
      raiser: true,
      resolver: true,
      restriction: true,
    });
    setSubcategorys([]);
    setValueCat([]);
    setSelectedOptionsCat([]);
    setValueSubCat([]);
    setSelectedOptionsSubCat([]);
    setValueSubSubCat([]);
    setSelectedOptionsSubSubCat([]);
    setSelectedPreValue([]);
    setPreValues([]);
    setIsTodoEdit(Array(addReqTodo.length).fill(false));
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
    setIsEditOpen(false);
    setEditingIndexcheckEdit(-1);
  };

  //check delete model
  const [isCheckOpen, setisCheckOpen] = useState(false);
  const handleClickOpenCheck = () => {
    setisCheckOpen(true);
  };
  const handleCloseCheck = () => {
    setisCheckOpen(false);
  };

  // info model
  const [openInfo, setOpeninfo] = useState(false);

  const handleClickOpeninfo = () => {
    setOpeninfo(true);
  };

  const handleCloseinfo = () => {
    setOpeninfo(false);
  };

  //category multiselect

  const [selectedOptionsCat, setSelectedOptionsCat] = useState([]);
  let [valueCat, setValueCat] = useState([]);
  const [selectedCategoryOptionsCateEdit, setSelectedCategoryOptionsCateEdit] = useState([]);
  const [categoryValueCateEdit, setCategoryValueCateEdit] = useState('');

  const handleCategoryChange = (options) => {
    setValueCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsCat(options);
    setValueSubCat([]);
    setSelectedOptionsSubCat([]);
    setValueSubSubCat([]);
    setSelectedOptionsSubSubCat([]);
  };

  const customValueRendererCat = (valueCat, _categoryname) => {
    return valueCat?.length ? valueCat.map(({ label }) => label)?.join(', ') : 'Please Select Category';
  };

  const handleCategoryChangeEdit = (options) => {
    setCategoryValueCateEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedCategoryOptionsCateEdit(options);
    setSubCategoryValueCateEdit([]);
    setSelectedSubCategoryOptionsCateEdit([]);
    setSubSubCategoryValueCateEdit([]);
    setSelectedSubSubCategoryOptionsCateEdit([]);
  };
  const customValueRendererCategoryEdit = (categoryValueCateEdit, _employeename) => {
    return categoryValueCateEdit?.length ? categoryValueCateEdit.map(({ label }) => label)?.join(', ') : 'Please Select Category';
  };

  const [selectedSubCategoryOptionsCateEdit, setSelectedSubCategoryOptionsCateEdit] = useState([]);
  const [subCategoryValueCateEdit, setSubCategoryValueCateEdit] = useState('');

  const handleSubCategoryChange = (options) => {
    setValueSubCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsSubCat(options);
    setValueSubSubCat([]);
    setSelectedOptionsSubSubCat([]);
  };

  const customValueRendererSubCat = (valueSubCat, _categoryname) => {
    return valueSubCat?.length ? valueSubCat.map(({ label }) => label)?.join(', ') : 'Please Select Sub Category';
  };

  const handlePreValueChange = (options) => {
    setPreValues(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedPreValue(options);
  };

  const customValueRendererPreValue = (valueSubCat, _categoryname) => {
    return valueSubCat?.length ? valueSubCat.map(({ label }) => label)?.join(', ') : 'Please Select Pre Value';
  };

  const handleSubCategoryChangeEdit = (options) => {
    setSubCategoryValueCateEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedSubCategoryOptionsCateEdit(options);

    setSubSubCategoryValueCateEdit([]);
    setSelectedSubSubCategoryOptionsCateEdit([]);
  };
  const customValueRendererSubCategoryEdit = (subCategoryValueCateEdit, _employeename) => {
    return subCategoryValueCateEdit?.length ? subCategoryValueCateEdit.map(({ label }) => label)?.join(', ') : 'Please Select Sub Category';
  };

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [filteredSubCategoryOptions, setFilteredSubCategoryOptions] = useState([]);
  const [filteredSubCategoryOptionsEdit, setFilteredSubCategoryOptionsEdit] = useState([]);

  useEffect(() => {
    const filteredCategoryOptions = categoryOptions
      ?.filter((u) => valueCat?.includes(u.categoryname))
      .map((u) => ({
        ...u,
        label: u.subcategoryname,
        value: u.subcategoryname,
      }));
    let subcategoryNames = filteredCategoryOptions.flatMap((obj) =>
      obj.subcategoryname.map((subcategory) => ({
        label: subcategory,
        value: subcategory,
      }))
    );
    setFilteredSubCategoryOptions(subcategoryNames);
  }, [valueCat]);

  useEffect(() => {
    const filteredCategoryOptions = categoryOptions
      ?.filter((u) => categoryValueCateEdit?.includes(u.categoryname))
      .map((u) => ({
        ...u,
        label: u.subcategoryname,
        value: u.subcategoryname,
      }));
    let subcategoryNames = filteredCategoryOptions.flatMap((obj) =>
      obj.subcategoryname.map((subcategory) => ({
        label: subcategory,
        value: subcategory,
      }))
    );
    setFilteredSubCategoryOptionsEdit(subcategoryNames);
  }, [categoryValueCateEdit]);

  //sub sub category multiselect

  useEffect(() => {
    let catopt = selectedOptionsCat.map((item) => item.value);
    let subcatopt = selectedOptionsSubCat.map((item) => item.value);
    const filteredCategoryOptions = subSubCategoryOptions
      ?.filter((u) => u.categoryname.some((data) => catopt.includes(data)) && u.subcategoryname.some((data) => subcatopt.includes(data)))
      .map((u) => ({
        ...u,
        label: u.subsubname,
        value: u.subsubname,
      }));

    setFilteredSubSubCategoryOptions(filteredCategoryOptions);
  }, [valueCat, valueSubCat]);

  useEffect(() => {
    let catopt = selectedCategoryOptionsCateEdit.map((item) => item.value);
    let subcatopt = selectedSubCategoryOptionsCateEdit.map((item) => item.value);
    const filteredCategoryOptions = subSubCategoryOptions
      ?.filter((u) => u.categoryname.some((data) => catopt.includes(data)) && u.subcategoryname.some((data) => subcatopt.includes(data)))
      .map((u) => ({
        ...u,
        label: u.subsubname,
        value: u.subsubname,
      }));

    setFilteredSubSubCategoryOptionsEdit(filteredCategoryOptions);
  }, [categoryValueCateEdit, subCategoryValueCateEdit]);

  const [filteredSubSubCategoryOptions, setFilteredSubSubCategoryOptions] = useState([]);
  const [filteredSubSubCategoryOptionsEdit, setFilteredSubSubCategoryOptionsEdit] = useState([]);

  const [selectedOptionsSubSubCat, setSelectedOptionsSubSubCat] = useState([]);
  let [valueSubSubCat, setValueSubSubCat] = useState([]);
  const [selectedSubSubCategoryOptionsCateEdit, setSelectedSubSubCategoryOptionsCateEdit] = useState([]);
  const [subSubCategoryValueCateEdit, setSubSubCategoryValueCateEdit] = useState('');

  const handleSubSubCategoryChange = (options) => {
    setValueSubSubCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsSubSubCat(options);
  };

  const customValueRendererSubSubCat = (valueSubSubCat, _categoryname) => {
    return valueSubSubCat?.length ? valueSubSubCat.map(({ label }) => label)?.join(', ') : 'Please Select Sub Sub Category';
  };

  const handleSubSubCategoryChangeEdit = (options) => {
    setSubSubCategoryValueCateEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedSubSubCategoryOptionsCateEdit(options);
  };
  const customValueRendererSubSubCategoryEdit = (subSubCategoryValueCateEdit, _employeename) => {
    return subSubCategoryValueCateEdit?.length ? subSubCategoryValueCateEdit.map(({ label }) => label)?.join(', ') : 'Please Select Sub Sub Category';
  };

  const [subSubCategoryOptions, setSubSubCategoryOptions] = useState([]);
  //get all Sub vendormasters.
  const fetchSubsubcomponent = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.get(SERVICE.SUBSUBCOMPONENT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setSubSubCategoryOptions(res_vendor?.data?.subsubcomponents);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //get single row to edit....
  const getCode = async (e, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.REQUIREFIELDS_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setEditRequiredEdit({
        ...editRequiredEdit,
        options: 'Please Select Options',
        details: res.data.srequired.details === 'Pre-Value' ? 'Please Select Detail' : '',
        ...res.data.srequired,
      });
      setEditRequiredTodo(res.data.srequired.overalldetails);
      setCategoryValueCateEdit(res?.data?.srequired?.category);
      setSelectedCategoryOptionsCateEdit([
        ...res?.data?.srequired?.category.map((t) => ({
          ...t,
          label: t,
          value: t,
        })),
      ]);
      await getRequiredMaster(res?.data?.srequired?._id);
      setSubCategoryValueCateEdit(res?.data?.srequired?.subcategory);
      setSelectedSubCategoryOptionsCateEdit([
        ...res?.data?.srequired?.subcategory.map((t) => ({
          ...t,
          label: t,
          value: t,
        })),
      ]);
      setSubSubCategoryValueCateEdit(res?.data?.srequired?.subsubcategory);
      setSelectedSubSubCategoryOptionsCateEdit([
        ...res?.data?.srequired?.subsubcategory.map((t) => ({
          ...t,
          label: t,
          value: t,
        })),
      ]);
      handleClickOpenEdit();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // get single row to view....
  const getviewCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.REQUIREFIELDS_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setEditRequired(res?.data?.srequired);
      handleClickOpenview();
      setEditRequiredTodo(res?.data?.srequired.overalldetails);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  // get single row to view....
  const getinfoCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.REQUIREFIELDS_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTypemasterEdit(res?.data?.srequired);
      handleClickOpeninfo();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchCategoryTicket();
  }, []);

  //Project updateby edit page...
  let updateby = typemasterEdit?.updatedby;
  let addedby = typemasterEdit?.addedby;

  let subprojectsid = editRequiredEdit?._id;

  //editing the single data...
  const sendEditRequest = async () => {
    setPageName(!pageName);
     const NewDatetime = await getCurrentServerTime();
    try {
      let res = await axios.put(`${SERVICE.REQUIREFIELDS_SINGLE}/${subprojectsid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        category: [...categoryValueCateEdit],
        subcategory: [...subCategoryValueCateEdit],
        subsubcategory: [...subSubCategoryValueCateEdit],
        overalldetails: [...editRequiredTodo],
        updatedby: [
          ...editRequiredEdit.updatedby,
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date(NewDatetime)),
          },
        ],
      });
      // await getRequiredMaster();
      await getRequiredMasterEdit();
      await fetchRequiredMaster();
      handleCloseModEdit();
      setPopupContent('Updated Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const editSubmit = (e) => {
    e.preventDefault();

    let catopt = selectedCategoryOptionsCateEdit.map((item) => item.value);
    let subcatopt = selectedSubCategoryOptionsCateEdit.map((item) => item.value);
    let subSubcatopt = selectedSubSubCategoryOptionsCateEdit.map((item) => item.value);

    const dbDuplicateCheckSubCate = requiredEditCheck.some(
      (data) =>
        data.category.some((data) => catopt.includes(data)) &&
        data.subcategory.some((data) => subcatopt.includes(data)) &&
        data.overalldetails.some((item) => editRequiredTodo.some((prob) => prob.details.toLowerCase() === item.details.toLowerCase()) && editRequiredTodo.some((prob) => prob.options.toLowerCase() === item.options.toLowerCase()))
    );

    const dbDuplicateCheckSubSubCate = requiredEditCheck.some(
      (data) =>
        data.category.some((data) => catopt.includes(data)) &&
        data.subcategory.some((data) => subcatopt.includes(data)) &&
        data.subsubcategory.some((data) => subSubcatopt.includes(data)) &&
        data.overalldetails.some((item) => editRequiredTodo.some((prob) => prob.details.toLowerCase() === item.details.toLowerCase()) && editRequiredTodo.some((prob) => prob.options.toLowerCase() === item.options.toLowerCase()))
    );

    const dbDuplicateCheck = subSubcatopt.length > 0 ? dbDuplicateCheckSubSubCate : dbDuplicateCheckSubCate;
    function hasDuplicateDetails(array) {
      const detailsSet = new Set();

      return array.some((obj) => {
        if (detailsSet.has(obj.details)) {
          // Duplicate details found
          return true;
        }
        detailsSet.add(obj.details);
        return false;
      });
    }

    const hasDuplicates = hasDuplicateDetails(editRequiredTodo);

    const TodoCheck = editRequiredTodo.some((data) => data.details === '');

    if (categoryValueCateEdit?.length == 0) {
      setPopupContentMalert('Please Select Category');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (subCategoryValueCateEdit?.length == 0) {
      setPopupContentMalert('Please Select SubCategory');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (filteredSubSubCategoryOptionsEdit?.length != 0 && subSubCategoryValueCateEdit?.length == 0) {
      setPopupContentMalert('Please Select Sub Sub Category');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (editRequiredTodo.length === 0 && editRequired.options === 'Please Select Options') {
      setPopupContentMalert('Please Select Options');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if ((editRequiredTodo.length === 0 && editRequired.details === '') || editRequired.details === 'Please Select Detail') {
      setPopupContentMalert(`${editRequired.options === 'Pre-Value' ? 'Please Select Detail' : 'Please Enter Detail'}`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (editRequiredTodo.length === 0) {
      setPopupContentMalert('Please Add The Todo And Submit');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (todoEdit.some((data) => data == true)) {
      setPopupContentMalert('Please Update The Todo And Submit ');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (dbDuplicateCheck) {
      setPopupContentMalert('Required Details Data already exists!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (TodoCheck) {
      setPopupContentMalert('Please Fill Details Name Fields!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (hasDuplicates) {
      setPopupContentMalert('Details Name are Same , Please Enter different Names!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      sendEditRequest();
    }
  };

  // Excel
  const fileName = 'RequiredFieldsMaster';

  const [typeData, setTypeData] = useState([]);

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'RequiredFieldsMaster',
    pageStyle: 'print',
  });

  //id for login...
  let loginid = localStorage.LoginUserId;
  let authToken = localStorage.APIToken;

  useEffect(() => {}, [typemasterEdit]);

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, []);

  const [items, setItems] = useState([]);

  const addSerialNumber = (data) => {
    setItems(data);
  };

  useEffect(() => {
    addSerialNumber(requiuredMaster);
  }, [requiuredMaster]);

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
  const indexOfLastItem = page * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;

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
      field: 'category',
      headerName: 'Category',
      flex: 0,
      width: 250,
      hide: !columnVisibility.category,
      headerClassName: 'bold-header',
    },
    {
      field: 'subcategory',
      headerName: 'Subcategory',
      flex: 0,
      width: 250,
      hide: !columnVisibility.subcategory,
      headerClassName: 'bold-header',
    },
    {
      field: 'subsubcategory',
      headerName: 'Sub Subcategory',
      flex: 0,
      width: 250,
      hide: !columnVisibility.subsubcategory,
      headerClassName: 'bold-header',
    },
    {
      field: 'options',
      headerName: 'Options',
      flex: 0,
      width: 200,
      hide: !columnVisibility.options,
      headerClassName: 'bold-header',
    },
    {
      field: 'details',
      headerName: 'Details',
      flex: 0,
      width: 200,
      hide: !columnVisibility.details,
      headerClassName: 'bold-header',
    },
    {
      field: 'actions',
      headerName: 'Action',
      flex: 0,
      width: 250,
      minHeight: '40px !important',
      sortable: false,
      hide: !columnVisibility.actions,
      headerClassName: 'bold-header',
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params) => (
        <Grid sx={{ display: 'flex' }}>
          {isUserRoleCompare?.includes('erequiredmaster') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getCode(params.data.id);
                getRequiredMasterEdit(params.data.id);
                setTodoEdit(Array(editRequiredTodo.length).fill(false));
              }}
            >
              <EditOutlinedIcon sx={buttonStyles.buttonedit} style={{ fontsize: 'large' }} />
            </Button>
          )}
          {isUserRoleCompare?.includes('drequiredmaster') && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.data.id);
              }}
            >
              <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} style={{ fontsize: 'large' }} />
            </Button>
          )}
          {isUserRoleCompare?.includes('vrequiredmaster') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getviewCode(params.data.id);
              }}
            >
              <VisibilityOutlinedIcon sx={buttonStyles.buttonview} style={{ fontsize: 'large' }} />
            </Button>
          )}
          {isUserRoleCompare?.includes('irequiredmaster') && (
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

  const rowDataTable = filteredData.map((item) => {
    return {
      id: item.id,
      serialNumber: item.serialNumber,
      category: item.category,
      subcategory: item.subcategory,
      subsubcategory: item.subsubcategory,
      options: item.options,
      details: item.details,
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

  return (
    <Box>
      <Headtitle title={'Required Fields Master'} />
      {/* ****** Header Content ****** */}
      <PageHeading title="Required Master" modulename="Tickets" submodulename="Master" mainpagename="Required Master" subpagename="" subsubpagename="" />
      {isUserRoleCompare?.includes('arequiredmaster') && (
        <>
          <Box sx={userStyle.dialogbox}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>Add Required Fields Master</Typography>
                </Grid>
              </Grid>
              <br />
              <br />
              <Grid container spacing={2}>
                <Grid item md={2.5} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Category<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <MultiSelect
                      options={categorys}
                      value={selectedOptionsCat}
                      onChange={(e) => {
                        handleCategoryChange(e);
                      }}
                      valueRenderer={customValueRendererCat}
                      labelledBy="Please Select Category"
                    />
                  </FormControl>
                </Grid>
                <Grid item md={2.5} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Sub Category<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <MultiSelect
                      options={filteredSubCategoryOptions}
                      value={selectedOptionsSubCat}
                      onChange={(e) => {
                        handleSubCategoryChange(e);
                      }}
                      valueRenderer={customValueRendererSubCat}
                      labelledBy="Please Select Sub Category"
                    />
                  </FormControl>
                </Grid>
                {filteredSubSubCategoryOptions?.length != 0 && (
                  <Grid item md={2.5} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Sub Sub Category
                        <b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={filteredSubSubCategoryOptions}
                        value={selectedOptionsSubSubCat}
                        onChange={(e) => {
                          handleSubSubCategoryChange(e);
                        }}
                        valueRenderer={customValueRendererSubSubCat}
                        labelledBy="Please Select Sub Sub Category"
                      />
                    </FormControl>
                  </Grid>
                )}
                <Grid item md={2.5} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Options <b style={{ color: 'red' }}>*</b>
                    </Typography>

                    <Selects
                      options={detailsOptions}
                      styles={colourStyles}
                      value={{
                        label: addRequired.options,
                        value: addRequired.options,
                      }}
                      onChange={(e) => {
                        setAddRequired({
                          ...addRequired,
                          options: e.value,
                          details: e.value === 'Pre-Value' ? 'Please Select Detail' : '',
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                {['Date Multi Random', 'Date Multi Random Time', 'Date Multi Span', 'Date Multi Span Time'].includes(addRequired.options) ? (
                  ''
                ) : (
                  <Grid item md={2.5} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Details Name <b style={{ color: 'red' }}>*</b>
                      </Typography>
                      {addRequired.options === 'Pre-Value' ? (
                        <MultiSelect
                          options={keywordsOptions}
                          value={selectedPreValues}
                          onChange={(e) => {
                            handlePreValueChange(e);
                          }}
                          valueRenderer={customValueRendererPreValue}
                          labelledBy="Please Select Pre Value"
                        />
                      ) : (
                        <OutlinedInput
                          value={addRequired.details}
                          onChange={(e) => {
                            setAddRequired({
                              ...addRequired,
                              details: e.target.value,
                            });
                          }}
                        />
                      )}
                    </FormControl>
                  </Grid>
                )}

                {['Date Multi Random', 'Date Multi Random Time'].includes(addRequired.options) ? (
                  <Grid item md={2.5} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Count <b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        value={addRequired.count}
                        onChange={(e) => {
                          setAddRequired({
                            ...addRequired,
                            count: Number(e.target.value) > 0 ? e.target.value : '',
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                ) : (
                  ''
                )}
                <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox checked={addRequired.options === 'Pre-Value' ? addRequired.raiser : true} disabled={['Pre-Value'].includes(addRequired.options) ? false : true} />}
                      onChange={(e) => {
                        setAddRequired({ ...addRequired, raiser: addRequired.options === 'Pre-Value' ? !addRequired.raiser : true });
                      }}
                      label="Raiser"
                    />
                  </FormGroup>
                  .
                </Grid>
                <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={addRequired.resolver}
                          // disabled={addRequired.options === "Pre-Value" ? false : true}
                        />
                      }
                      onChange={(e) => {
                        setAddRequired({ ...addRequired, resolver: !addRequired.resolver });
                      }}
                      label="Resolver"
                    />
                  </FormGroup>
                </Grid>
                {addRequired?.options === 'DateTime' && (
                  <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={addRequired.restriction}
                            // disabled={addRequired.options === "Pre-Value" ? false : true}
                          />
                        }
                        onChange={(e) => {
                          setAddRequired({ ...addRequired, restriction: !addRequired.restriction });
                        }}
                        label="Restriction"
                      />
                    </FormGroup>
                  </Grid>
                )}
                <Grid item md={2} xs={12} sm={12}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={addTodo}
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
              <br /> <br />
              {addReqTodo.length > 0 && (
                <ul type="none">
                  {addReqTodo.map((row, index) => {
                    return (
                      <li key={index}>
                        <Grid container spacing={2}>
                          {isTodoEdit[index] ? (
                            <>
                              <Grid item md={2} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                  <Typography>
                                    Options <b style={{ color: 'red' }}>*</b>
                                  </Typography>
                                  <Selects
                                    options={detailsOptions}
                                    styles={colourStyles}
                                    value={{
                                      label: optionsTodo,
                                      value: optionsTodo,
                                    }}
                                    onChange={(e) => {
                                      setOptionsTodo(e.value);
                                    }}
                                  />
                                </FormControl>
                              </Grid>
                              <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                  <Typography>
                                    Details Name <b style={{ color: 'red' }}>*</b>
                                  </Typography>
                                  {row.options === 'Pre-Value' ? (
                                    <Selects
                                      options={keywordsOptions}
                                      styles={colourStyles}
                                      value={{
                                        label: detailsTodo,
                                        value: detailsTodo,
                                      }}
                                      onChange={(e) => {
                                        setDetailsTodo(e.value);
                                      }}
                                    />
                                  ) : (
                                    <OutlinedInput
                                      value={detailsTodo}
                                      onChange={(e) => {
                                        setDetailsTodo(e.target.value);
                                      }}
                                    />
                                  )}
                                </FormControl>
                              </Grid>
                              <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                                <FormGroup>
                                  <FormControlLabel
                                    control={<Checkbox checked={optionsTodo === 'Pre-Value' ? raiserTodo : true} disabled={['Pre-Value'].includes(optionsTodo) ? false : true} />}
                                    onChange={(e) => {
                                      // handleTodoEdit(
                                      //   index,
                                      //   "raiser",
                                      //   !row.raiser,
                                      // );
                                      setRaiserTodo(!raiserTodo);
                                    }}
                                    label="Raiser"
                                  />
                                </FormGroup>
                                .
                              </Grid>
                              <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                                <FormGroup>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        // checked={row.resolver}
                                        checked={resolverTodo}
                                      />
                                    }
                                    onChange={(e) => {
                                      // handleTodoEdit(
                                      //   index,
                                      //   "resolver",
                                      //   !row.resolver
                                      // );
                                      setResolverTodo(!resolverTodo);
                                    }}
                                    label="Resolver"
                                  />
                                </FormGroup>
                              </Grid>
                              {row.options === 'DateTime' && (
                                <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                                  <FormGroup>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          // checked={row.resolver}
                                          checked={restrictionTodo}
                                        />
                                      }
                                      onChange={(e) => {
                                        // handleTodoEdit(
                                        //   index,
                                        //   "resolver",
                                        //   !row.resolver
                                        // );
                                        setRestrictionTodo(!restrictionTodo);
                                      }}
                                      label="Restriction"
                                    />
                                  </FormGroup>
                                </Grid>
                              )}
                            </>
                          ) : (
                            <>
                              <Grid item md={2} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                  <Typography>
                                    Options <b style={{ color: 'red' }}>*</b>
                                  </Typography>
                                  <OutlinedInput readOnly value={row.options} />
                                </FormControl>
                              </Grid>
                              <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                  <Typography>
                                    Details Name <b style={{ color: 'red' }}>*</b>
                                  </Typography>

                                  <OutlinedInput readOnly value={row.details} />
                                </FormControl>
                              </Grid>
                              <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                                <FormGroup>
                                  <FormControlLabel control={<Checkbox checked={row.raiser} disabled={['Pre-Value'].includes(row.options) ? false : true} />} label="Raiser" />
                                </FormGroup>
                                .
                              </Grid>
                              <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                                <FormGroup>
                                  <FormControlLabel control={<Checkbox checked={row.resolver} />} label="Resolver" />
                                </FormGroup>
                              </Grid>
                              {row?.options === 'DateTime' && (
                                <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                                  <FormGroup>
                                    <FormControlLabel control={<Checkbox checked={row.restriction} />} label="Restriction" />
                                  </FormGroup>
                                </Grid>
                              )}
                            </>
                          )}
                          <Grid item md={1} xs={12} sm={12}>
                            {editingIndexcheck === index ? (
                              <Button
                                variant="contained"
                                color="success"
                                sx={{
                                  height: '30px',
                                  minWidth: '30px',
                                  marginTop: '28px',
                                  padding: '6px 10px',
                                }}
                                onClick={() => {
                                  if (detailsTodo === '' || detailsTodo === 'Please Select Detail') {
                                    setPopupContentMalert(`${optionsTodo === 'Pre-Value' ? 'Please Select Detail' : 'Please Enter Details'}`);
                                    setPopupSeverityMalert('info');
                                    handleClickOpenPopupMalert();
                                  } else if (
                                    selectedOptionsSubSubCat.length > 0
                                      ? requiredcheck.some(
                                          (item) =>
                                            item.category.some((data) => selectedOptionsCat.map((item) => item.value).includes(data)) &&
                                            item.subcategory.some((data) => selectedOptionsSubCat.map((item) => item.value).includes(data)) &&
                                            item.subsubcategory.some((data) => selectedOptionsSubSubCat.map((item) => item.value).includes(data)) &&
                                            item.overalldetails.some((overallItem) => overallItem.options?.toLowerCase() === optionsTodo?.toLowerCase() && overallItem.details?.toLowerCase() === detailsTodo?.toLowerCase())
                                        )
                                      : requiredcheck.some(
                                          (item) =>
                                            item.category.some((data) => selectedOptionsCat.map((item) => item.value).includes(data)) &&
                                            item.subcategory.some((data) => selectedOptionsSubCat.map((item) => item.value).includes(data)) &&
                                            item.overalldetails.some((overallItem) => overallItem.options?.toLowerCase() === optionsTodo?.toLowerCase() && overallItem.details?.toLowerCase() === detailsTodo?.toLowerCase())
                                        )
                                  ) {
                                    setPopupContentMalert('Already Added');
                                    setPopupSeverityMalert('info');
                                    handleClickOpenPopupMalert();
                                  } else if (addReqTodo.some((item, i) => item.details === detailsTodo && item.options === optionsTodo && i != index)) {
                                    setPopupContentMalert('Already Detail Added');
                                    setPopupSeverityMalert('info');
                                    handleClickOpenPopupMalert();
                                  } else {
                                    const updatedIsTodoEdit = [...isTodoEdit];
                                    updatedIsTodoEdit[index] = false;
                                    setIsTodoEdit(updatedIsTodoEdit);
                                    handleUpdateTodocheck();
                                  }
                                }}
                              >
                                <MdOutlineDone
                                  style={{
                                    fontSize: '17px',
                                    fontWeight: 'bold',
                                  }}
                                />
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                color="primary"
                                sx={{
                                  height: '30px',
                                  minWidth: '30px',
                                  marginTop: '28px',
                                  padding: '6px 10px',
                                }}
                                disabled={editingIndexcheck !== index && editingIndexcheck !== -1}
                                onClick={() => {
                                  const updatedIsTodoEdit = [...isTodoEdit];
                                  updatedIsTodoEdit[index] = true;
                                  setIsTodoEdit(updatedIsTodoEdit);
                                  setEditingIndexcheck(index);
                                  handleEditTodocheck(index);
                                }}
                              >
                                <FaEdit />
                              </Button>
                            )}
                          </Grid>
                          <Grid item md={1} xs={12} sm={12}>
                            {isTodoEdit[index] ? (
                              <Button
                                variant="contained"
                                color="error"
                                type="button"
                                sx={{
                                  height: '30px',
                                  minWidth: '30px',
                                  marginTop: '28px',
                                  padding: '6px 10px',
                                }}
                                onClick={() => {
                                  if (
                                    requiredcheck.some(
                                      (item) =>
                                        item.category.some((data) => selectedOptionsCat.map((item) => item.value).includes(data)) &&
                                        item.subcategory.some((data) => selectedOptionsSubCat.map((item) => item.value).includes(data)) &&
                                        item.subsubcategory.some((data) => selectedOptionsSubSubCat.map((item) => item.value).includes(data)) &&
                                        item.overalldetails.some((overallItem) => overallItem.options === row.options && overallItem.details === row.details)
                                    )
                                  ) {
                                    setPopupContentMalert('Already Added');
                                    setPopupSeverityMalert('info');
                                    handleClickOpenPopupMalert();
                                  } else if (addReqTodo.some((item, i) => item.details === row.details && item.options === row.options && i != index)) {
                                    setPopupContentMalert('Already Detail Added');
                                    setPopupSeverityMalert('info');
                                    handleClickOpenPopupMalert();
                                  } else {
                                    const updatedIsTodoEdit = [...isTodoEdit];
                                    updatedIsTodoEdit[index] = false;
                                    setIsTodoEdit(updatedIsTodoEdit);
                                    setEditingIndexcheck(-1);
                                  }
                                }}
                              >
                                <AiOutlineClose />
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                color="error"
                                type="button"
                                sx={{
                                  height: '30px',
                                  minWidth: '30px',
                                  marginTop: '28px',
                                  padding: '6px 10px',
                                }}
                                onClick={() => {
                                  deleteTodoEdit(index);
                                }}
                              >
                                <AiOutlineClose />
                              </Button>
                            )}
                          </Grid>
                          <Grid item md={2}></Grid>
                        </Grid>
                      </li>
                    );
                  })}
                </ul>
              )}
              <br /> <br />
              <Grid container spacing={2}>
                <Grid item md={2.5} xs={12} sm={6}>
                  <LoadingButton loading={isButton} variant="contained" color="primary" onClick={handleSubmit} sx={buttonStyles.buttonsubmit}>
                    Submit
                  </LoadingButton>
                </Grid>
                <Grid item md={2.5} xs={12} sm={6}>
                  <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </>
      )}
      <Box>
        {/* Edit DIALOG */}
        <Dialog
          open={isEditOpen}
          onClose={handleCloseModEdit}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth={true}
          maxWidth="lg"
          sx={{
            overflow: 'visible',
            '& .MuiPaper-root': {
              overflow: 'scroll',
            },
            marginTop: '50px',
          }}
        >
          <Box sx={userStyle.dialogbox}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.HeaderText}>Edit Required Details</Typography>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={2.5} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Category<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <MultiSelect options={categorysEdit} value={selectedCategoryOptionsCateEdit} onChange={handleCategoryChangeEdit} valueRenderer={customValueRendererCategoryEdit} labelledBy="Please Select Category" />
                  </FormControl>
                </Grid>
                <Grid item md={2.5} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Sub Category<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <MultiSelect options={filteredSubCategoryOptionsEdit} value={selectedSubCategoryOptionsCateEdit} onChange={handleSubCategoryChangeEdit} valueRenderer={customValueRendererSubCategoryEdit} labelledBy="Please Select Sub Category" />
                  </FormControl>
                </Grid>
                {filteredSubSubCategoryOptionsEdit?.length != 0 && (
                  <Grid item md={2.5} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Sub Sub Category
                        <b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={filteredSubSubCategoryOptionsEdit}
                        value={selectedSubSubCategoryOptionsCateEdit}
                        onChange={(e) => {
                          handleSubSubCategoryChangeEdit(e);
                        }}
                        valueRenderer={customValueRendererSubSubCategoryEdit}
                        labelledBy="Please Select Sub Sub Category"
                      />
                    </FormControl>
                  </Grid>
                )}
                <Grid item md={2} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Options <b style={{ color: 'red' }}>*</b>
                    </Typography>

                    <Selects
                      options={detailsOptions}
                      styles={colourStyles}
                      value={{
                        label: editRequiredEdit.options,
                        value: editRequiredEdit.options,
                      }}
                      onChange={(e) => {
                        setEditRequiredEdit({
                          ...editRequiredEdit,
                          options: e.value,
                          details: e.value === 'Pre-Value' ? 'Please Select Detail' : '',
                        });
                      }}
                    />
                  </FormControl>
                </Grid>

                {['Date Multi Random', 'Date Multi Random Time', 'Date Multi Span', 'Date Multi Span Time'].includes(addRequired.options) ? (
                  ''
                ) : (
                  <Grid item md={2.5} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Details Name <b style={{ color: 'red' }}>*</b>
                      </Typography>

                      {editRequiredEdit.options === 'Pre-Value' ? (
                        <Selects
                          options={keywordsOptions}
                          styles={colourStyles}
                          value={{
                            label: editRequiredEdit.details,
                            value: editRequiredEdit.details,
                          }}
                          onChange={(e) => {
                            setEditRequiredEdit({
                              ...editRequiredEdit,
                              details: e.value,
                            });
                          }}
                        />
                      ) : (
                        <OutlinedInput
                          value={editRequiredEdit.details}
                          onChange={(e) => {
                            setEditRequiredEdit({
                              ...editRequiredEdit,
                              details: e.target.value,
                            });
                          }}
                        />
                      )}
                    </FormControl>
                  </Grid>
                )}
                {['Date Multi Random', 'Date Multi Random Time'].includes(editRequiredEdit.options) ? (
                  <Grid item md={2.5} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Count<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        value={editRequiredEdit.count}
                        onChange={(e) => {
                          setEditRequiredEdit({
                            ...editRequiredEdit,
                            count: Number(e.target.value) > 0 ? e.target.value : '',
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                ) : (
                  ''
                )}

                <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox checked={editRequiredEdit.options === 'Pre-Value' ? editRequiredEdit.raiser : true} disabled={['Pre-Value'].includes(editRequiredEdit.options) ? false : true} />}
                      onChange={(e) => {
                        setEditRequired({ ...editRequiredEdit, raiser: editRequiredEdit.options === 'Pre-Value' ? !editRequiredEdit.raiser : true });
                      }}
                      label="Raiser"
                    />
                  </FormGroup>
                  .
                </Grid>
                <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={editRequiredEdit.resolver}
                          // disabled={addRequired.options === "Pre-Value" ? false : true}
                        />
                      }
                      onChange={(e) => {
                        setEditRequiredEdit({ ...editRequiredEdit, resolver: !editRequiredEdit.resolver });
                      }}
                      label="Resolver"
                    />
                  </FormGroup>
                </Grid>
                <Grid item md={2} xs={12} sm={12}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={addTodoEdit}
                    type="button"
                    sx={{
                      height: '30px',
                      minWidth: '30px',
                      marginTop: '28px',
                      padding: '6px 10px',
                    }}
                  >
                    <FaPlus sx={buttonStyles.buttonsubmit} />
                  </Button>
                </Grid>
              </Grid>
              <br /> <br />
              {editRequiredTodo.length > 0 && (
                <ul type="none">
                  {editRequiredTodo.map((row, index) => {
                    return (
                      <li key={index}>
                        <Grid container spacing={2}>
                          {todoEdit[index] ? (
                            <>
                              <Grid item md={2} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                  <Typography>
                                    Options <b style={{ color: 'red' }}>*</b>
                                  </Typography>
                                  <Selects
                                    options={detailsOptions}
                                    styles={colourStyles}
                                    value={{
                                      label: optionsTodoEdit,
                                      value: optionsTodoEdit,
                                    }}
                                    onChange={(e) => {
                                      // handleEditTodo(index, "options", e.value);
                                      setOptionsTodoEdit(e.value);
                                    }}
                                  />
                                </FormControl>
                              </Grid>
                              <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                  <Typography>
                                    Details Name <b style={{ color: 'red' }}>*</b>
                                  </Typography>
                                  {row.options === 'Pre-Value' ? (
                                    <Selects
                                      options={keywordsOptions}
                                      styles={colourStyles}
                                      value={{
                                        label: detailsTodoEdit,
                                        value: detailsTodoEdit,
                                      }}
                                      onChange={(e) => {
                                        // handleEditTodo(
                                        //   index,
                                        //   "details",
                                        //   e.value
                                        // );
                                        setDetailsTodoEdit(e.value);
                                      }}
                                    />
                                  ) : (
                                    <OutlinedInput
                                      value={detailsTodoEdit}
                                      onChange={(e) => {
                                        setDetailsTodoEdit(e.target.value);
                                      }}
                                    />
                                  )}
                                </FormControl>
                              </Grid>
                              <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                                <FormGroup>
                                  <FormControlLabel
                                    control={<Checkbox checked={optionsTodoEdit === 'Pre-Value' ? raiserTodoEdit : true} disabled={['Pre-Value'].includes(optionsTodoEdit) ? false : true} />}
                                    onChange={(e) => {
                                      // handleEditTodo(
                                      //   index,
                                      //   "raiser",
                                      //   !row.raiser,
                                      // );
                                      setRaiserTodoEdit(!raiserTodoEdit);
                                    }}
                                    label="Raiser"
                                  />
                                </FormGroup>
                                .
                              </Grid>
                              <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                                <FormGroup>
                                  <FormControlLabel
                                    control={<Checkbox checked={resolverTodoEdit} />}
                                    onChange={(e) => {
                                      // handleEditTodo(
                                      //   index,
                                      //   "resolver",
                                      //   !row.resolver
                                      // );
                                      setResolverTodoEdit(!resolverTodoEdit);
                                    }}
                                    label="Resolver"
                                  />
                                </FormGroup>
                              </Grid>
                              {row?.options === 'DateTime' && (
                                <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                                  <FormGroup>
                                    <FormControlLabel
                                      control={<Checkbox checked={restrictionTodoEdit} />}
                                      onChange={(e) => {
                                        // handleEditTodo(
                                        //   index,
                                        //   "resolver",
                                        //   !row.resolver
                                        // );
                                        setRestrictionTodoEdit(!restrictionTodoEdit);
                                      }}
                                      label="Restriction"
                                    />
                                  </FormGroup>
                                </Grid>
                              )}
                            </>
                          ) : (
                            <>
                              <Grid item md={2} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                  <Typography>
                                    Options <b style={{ color: 'red' }}>*</b>
                                  </Typography>
                                  <OutlinedInput value={row.options} />
                                </FormControl>
                              </Grid>
                              <Grid item md={2} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                  <Typography>
                                    Details Name <b style={{ color: 'red' }}>*</b>
                                  </Typography>

                                  <OutlinedInput value={row.details} />
                                </FormControl>
                              </Grid>
                              <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                                <FormGroup>
                                  <FormControlLabel control={<Checkbox checked={row.raiser} disabled={['Pre-Value'].includes(row.options) ? false : true} />} label="Raiser" />
                                </FormGroup>
                                .
                              </Grid>
                              <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                                <FormGroup>
                                  <FormControlLabel control={<Checkbox checked={row.resolver} />} label="Resolver" />
                                </FormGroup>
                              </Grid>
                              {row?.options === 'DateTime' && (
                                <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                                  <FormGroup>
                                    <FormControlLabel control={<Checkbox checked={row.restriction} />} label="Restriction" />
                                  </FormGroup>
                                </Grid>
                              )}
                            </>
                          )}
                          <Grid item md={1} xs={12} sm={12}>
                            {editingIndexcheckEdit === index ? (
                              <Button
                                variant="contained"
                                color="success"
                                sx={{
                                  height: '30px',
                                  minWidth: '30px',
                                  marginTop: '28px',
                                  padding: '6px 10px',
                                }}
                                onClick={() => {
                                  if (detailsTodoEdit === '' || detailsTodoEdit === 'Please Select Detail') {
                                    setPopupContentMalert(`${optionsTodoEdit === 'Pre-Value' ? 'Please Select Detail' : 'Please Enter Details'}`);
                                    setPopupSeverityMalert('info');
                                    handleClickOpenPopupMalert();
                                  } else if (
                                    selectedSubSubCategoryOptionsCateEdit.length > 0
                                      ? requiredEditCheck.some(
                                          (item) =>
                                            item.category.some((data) => selectedCategoryOptionsCateEdit.map((item) => item.value).includes(data)) &&
                                            item.subcategory.some((data) => selectedSubCategoryOptionsCateEdit.map((item) => item.value).includes(data)) &&
                                            item.subsubcategory.some((data) => selectedSubSubCategoryOptionsCateEdit.map((item) => item.value).includes(data)) &&
                                            item.overalldetails.some((overallItem) => overallItem.options?.toLowerCase() === optionsTodoEdit?.toLowerCase() && overallItem.details?.toLowerCase() === detailsTodoEdit?.toLowerCase())
                                        )
                                      : requiredEditCheck.some(
                                          (item) =>
                                            item.category.some((data) => selectedCategoryOptionsCateEdit.map((item) => item.value).includes(data)) &&
                                            item.subcategory.some((data) => selectedSubCategoryOptionsCateEdit.map((item) => item.value).includes(data)) &&
                                            item.overalldetails.some((overallItem) => overallItem.options?.toLowerCase() === optionsTodoEdit?.toLowerCase() && overallItem.details?.toLowerCase() === detailsTodoEdit?.toLowerCase())
                                        )
                                  ) {
                                    setPopupContentMalert('Already Added');
                                    setPopupSeverityMalert('info');
                                    handleClickOpenPopupMalert();
                                  } else if (editRequiredTodo.some((item, i) => item.details === detailsTodoEdit && item.options === optionsTodoEdit && i !== index)) {
                                    setPopupContentMalert('Already Detail Added');
                                    setPopupSeverityMalert('info');
                                    handleClickOpenPopupMalert();
                                  } else {
                                    const updatedIsTodoEdit = [...todoEdit];
                                    updatedIsTodoEdit[index] = false;
                                    setTodoEdit(updatedIsTodoEdit);
                                    handleUpdateTodocheckEdit();
                                  }
                                }}
                              >
                                <MdOutlineDone
                                  style={{
                                    fontSize: '17px',
                                    fontWeight: 'bold',
                                  }}
                                />
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                color="primary"
                                disabled={editingIndexcheckEdit !== index && editingIndexcheckEdit !== -1}
                                sx={{
                                  height: '30px',
                                  minWidth: '30px',
                                  marginTop: '28px',
                                  padding: '6px 10px',
                                }}
                                onClick={() => {
                                  const updatedIsTodoEdit = [...todoEdit];
                                  updatedIsTodoEdit[index] = true;
                                  setTodoEdit(updatedIsTodoEdit);
                                  handleEditTodocheckEdit(index);
                                  setEditingIndexcheckEdit(index);
                                }}
                              >
                                <FaEdit />
                              </Button>
                            )}
                          </Grid>
                          <Grid item md={1} xs={12} sm={12}>
                            {todoEdit[index] ? (
                              <Button
                                variant="contained"
                                color="error"
                                type="button"
                                sx={{
                                  height: '30px',
                                  minWidth: '30px',
                                  marginTop: '28px',
                                  padding: '6px 10px',
                                }}
                                onClick={() => {
                                  const updatedIsTodoEdit = [...todoEdit];
                                  updatedIsTodoEdit[index] = false;
                                  setTodoEdit(updatedIsTodoEdit);
                                  setEditingIndexcheckEdit(-1);
                                }}
                              >
                                <AiOutlineClose />
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                color="error"
                                type="button"
                                sx={{
                                  height: '30px',
                                  minWidth: '30px',
                                  marginTop: '28px',
                                  padding: '6px 10px',
                                }}
                                onClick={() => {
                                  deleteTodoEditDb(index);
                                }}
                              >
                                <AiOutlineClose />
                              </Button>
                            )}
                          </Grid>
                          <Grid item md={2}></Grid>
                        </Grid>
                      </li>
                    );
                  })}
                </ul>
              )}
              <br /> <br />
              <Grid container spacing={2}>
                <Grid item md={2.5} xs={12} sm={6}>
                  <Button variant="contained" color="primary" onClick={editSubmit} sx={buttonStyles.buttonsubmit}>
                    Update
                  </Button>
                </Grid>
                <Grid item md={2.5} xs={12} sm={6}>
                  <Button
                    sx={buttonStyles.btncancel}
                    onClick={() => {
                      handleCloseModEdit();

                      setTodoEdit(Array(editRequiredTodo.length).fill(false));
                    }}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>
      <br />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes('lrequiredmaster') && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Required Fields Master List</Typography>
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
                  {isUserRoleCompare?.includes('excelrequiredmaster') && (
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
                  {isUserRoleCompare?.includes('csvrequiredmaster') && (
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
                  {isUserRoleCompare?.includes('printrequiredmaster') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('pdfrequiredmaster') && (
                    // <>
                    //   <Button
                    //     sx={userStyle.buttongrp}
                    //     onClick={() => downloadPdf()}
                    //   >
                    //     <FaFilePdf />
                    //     &ensp;Export to PDF&ensp;
                    //   </Button>
                    // </>
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
                  {isUserRoleCompare?.includes('imagerequiredmaster') && (
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
                  maindatas={requiuredMaster}
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
            {isUserRoleCompare?.includes('bdrequiredmaster') && (
              <Button variant="contained" color="error" sx={buttonStyles.buttonbulkdelete} onClick={handleClickOpenalert}>
                Bulk Delete
              </Button>
            )}
            <br />
            <br />
            {!typemasterCheck ? (
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
                    searchQuery={searchQuery}
                    handleShowAllColumns={handleShowAllColumns}
                    setFilteredRowData={setFilteredRowData}
                    filteredRowData={filteredRowData}
                    setFilteredChanges={setFilteredChanges}
                    filteredChanges={filteredChanges}
                    gridRefTableImg={gridRefTableImg}
                    itemsList={items}
                  />
                </Box>
              </>
            )}
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

      {/* Delete Modal */}
      <Box>
        {/* ALERT DIALOG */}
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
            <Button autoFocus variant="contained" color="error" sx={buttonStyles.buttonsubmit} onClick={(e) => delType(Typesid)}>
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
              <Button autoFocus variant="contained" color="error" sx={buttonStyles.buttonsubmit} onClick={(e) => delTypecheckbox(e)}>
                {' '}
                OK{' '}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>

        {/* print layout */}

        <TableContainer component={Paper} sx={userStyle.printcls}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table" id="usertable" ref={componentRef}>
            <TableHead>
              <TableRow>
                <TableCell> SI.No</TableCell>
                <TableCell> Category</TableCell>
                <TableCell>Subcategory</TableCell>
                <TableCell>SubSubcategory</TableCell>
                <TableCell>Options</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody align="left">
              {filteredData &&
                filteredData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.subcategory}</TableCell>
                    <TableCell>{row.subsubcategory}</TableCell>
                    <TableCell>{row?.optionsout?.map((t, i) => `${i + 1 + '. '}` + t).toString()}</TableCell>
                    <TableCell>{row?.detailsout?.map((t, i) => `${i + 1 + '. '}` + t).toString()}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* view model */}
      <Dialog
        open={openview}
        onClose={handleCloseview}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        fullWidth={true}
        sx={{
          overflow: 'visible',
          '& .MuiPaper-root': {
            overflow: 'scroll',
          },
          marginTop: '40px',
        }}
      >
        <Box sx={userStyle.dialogbox}>
          <>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography sx={userStyle.HeaderText}>View Required Details</Typography>
              </Grid>
            </Grid>
            <br />
            <Grid container spacing={2}>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Category<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput value={editRequired?.category?.map((t, i) => `${i + 1 + '. '}` + t).toString()} />
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Sub Category<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput value={editRequired?.subcategory?.map((t, i) => `${i + 1 + '. '}` + t).toString()} />
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Sub SubCategory<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput value={editRequired?.subsubcategory?.map((t, i) => `${i + 1 + '. '}` + t).toString()} />
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}></Grid>
            </Grid>
            <br /> <br />
            {editRequiredTodo?.length > 0 && (
              <ul type="none">
                {editRequiredTodo?.map((row, index) => {
                  return (
                    <li key={index}>
                      <Grid container spacing={2}>
                        <>
                          <Grid item md={3} xs={12} sm={12}>
                            <FormControl fullWidth size="small">
                              <Typography>
                                Options <b style={{ color: 'red' }}>*</b>
                              </Typography>
                              <OutlinedInput readOnly value={row.options} />
                            </FormControl>
                          </Grid>
                          <Grid item md={3} xs={12} sm={12}>
                            <FormControl fullWidth size="small">
                              <Typography>
                                Details Name <b style={{ color: 'red' }}>*</b>
                              </Typography>
                              <OutlinedInput readOnly value={row.details} />
                            </FormControl>
                          </Grid>
                          <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                            <FormGroup>
                              <FormControlLabel control={<Checkbox checked={row.raiser} />} label="Raiser" />
                            </FormGroup>
                            .
                          </Grid>
                          <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                            <FormGroup>
                              <FormControlLabel control={<Checkbox checked={row.resolver} />} label="Resolver" />
                            </FormGroup>
                          </Grid>
                          {row?.options === 'DateTime' && (
                            <Grid item md={1.5} xs={12} sm={12} marginTop={3}>
                              <FormGroup>
                                <FormControlLabel control={<Checkbox checked={row.restriction} />} label="Restriction" />
                              </FormGroup>
                            </Grid>
                          )}
                        </>
                        <Grid item md={2}></Grid>
                      </Grid>
                    </li>
                  );
                })}
              </ul>
            )}
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={2.5} xs={12} sm={6}>
                <Button
                  sx={buttonStyles.btncancel}
                  variant="contained"
                  onClick={() => {
                    handleCloseview();
                  }}
                >
                  Back
                </Button>
              </Grid>
              <Grid item md={2.5} xs={12} sm={6}></Grid>
            </Grid>
          </>
        </Box>
      </Dialog>

      {/* ALERT DIALOG */}
      <Box>
        <Dialog open={isErrorOpenpop} onClose={handleCloseerrpop} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">{showAlertpop}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              style={{
                padding: '7px 13px',
                color: 'white',
                background: 'rgb(25, 118, 210)',
              }}
              sx={buttonStyles.buttonsubmit}
              onClick={() => {
                sendEditRequest();
                handleCloseerrpop();
              }}
            >
              ok
            </Button>
            <Button
              style={{
                backgroundColor: '#f4f4f4',
                color: '#444',
                boxShadow: 'none',
                borderRadius: '3px',
                padding: '7px 13px',
                border: '1px solid #0000006b',
                '&:hover': {
                  '& .css-bluauu-MuiButtonBase-root-MuiButton-root': {
                    backgroundColor: '#f4f4f4',
                  },
                },
              }}
              sx={buttonStyles.btncancel}
              onClick={handleCloseerrpop}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Box>
        {/* ALERT DIALOG */}
        <Dialog open={isDeleteOpenalert} onClose={handleCloseModalert} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '70px', color: 'orange' }} />
            <Typography variant="h6" sx={{ color: 'black', textAlign: 'center' }}>
              Please Select any Row
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button autoFocus variant="contained" color="error" onClick={handleCloseModalert} sx={buttonStyles.buttonsubmit}>
              {' '}
              OK{' '}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* Check delete Modal */}
      <Box>
        <>
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
        </>
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
        itemsTwo={requiuredMaster ?? []}
        filename={'Required Master'}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
      {/* INFO */}
      <InfoPopup openInfo={openInfo} handleCloseinfo={handleCloseinfo} heading="Required Master Info" addedby={addedby} updateby={updateby} />
    </Box>
  );
}

export default RequiredMaster;
