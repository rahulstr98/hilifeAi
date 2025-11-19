import React, { useState, useEffect, useRef, useContext } from 'react';
import { FaPlus } from 'react-icons/fa';
import { userStyle } from '../../pageStyle';
import { handleApiError } from '../../components/Errorhandling';
import 'jspdf-autotable';
import { hoursTimeOpt, minutesTimeOpt } from '../../components/Componentkeyword';
import axios from '../../axiosInstance';
import { SERVICE } from '../../services/Baseservice';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { AiOutlineClose } from 'react-icons/ai';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useReactToPrint } from 'react-to-print';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { UserRoleAccessContext, AuthContext } from '../../context/Appcontext';
import Headtitle from '../../components/Headtitle';
import { saveAs } from 'file-saver';
import { getCurrentServerTime } from '../../components/getCurrentServerTime';
import moment from 'moment';
import Selects from 'react-select';
// import { FixedSizeList as List } from 'react-window';
import AsyncSelect from 'react-select/async';
import domtoimage from 'dom-to-image';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import PageHeading from '../../components/PageHeading';
import ResizeObserver from 'resize-observer-polyfill';
import LoadingButton from '@mui/lab/LoadingButton';
import pdfIcon from '../../components/Assets/pdf-icon.png';
import csvIcon from '../../components/Assets/CSV.png';
import excelIcon from '../../components/Assets/excel-icon.png';
import fileIcon from '../../components/Assets/file-icons.png';
import wordIcon from '../../components/Assets/word-icon.png';
import { v4 as uuidv4 } from 'uuid';

import {
  Box, Typography, OutlinedInput, MenuItem, TextareaAutosize, Dialog, FormControl, header,
  Grid, Button, Paper, TableContainer, Table, TableHead, TableBody, TableRow,
  TableCell, FormControlLabel, Checkbox, Divider
} from '@mui/material';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MultiSelect } from 'react-multi-select-component';

import AlertDialog from '../../components/Alert';

import MessageAlert from '../../components/MessageAlert';

window.ResizeObserver = ResizeObserver;

function ManageSales() {
  const { isUserRoleCompare, isUserRoleAccess, isAssignBranch, allUsersLimit, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);
  const [serverTime1, setServerTime1] = useState(moment());
  const [serverTime, setServerTime] = useState(null);
  const [currentGoldRate, setCurrentGoldRate] = useState(0);
  const [currentSilverRate, setCurrentSilverRate] = useState(0);

  const accessbranch = isUserRoleAccess?.role?.includes('Manager')
    ? isAssignBranch?.map((data) => ({
      branch: data.branch,
      branchcode: data.branchcode,
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
        branchcode: data.branchcode,
        company: data.company,
        unit: data.unit,
      }));

  // Fetch server time initially
  const getCurrentServerTime1 = async () => {
    try {
      const response = await axios.get(SERVICE.GET_CURRENT_SERVER_TIME);
      setServerTime1(moment(response.data.currentNewDate));
    } catch (err) {
      console.log('Error fetching server time:', err);
    }
  };

  useEffect(() => {
    getCurrentServerTime1();

    const interval = setInterval(() => {
      setServerTime1((prevTime) => moment(prevTime).add(1, 'second'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTime = async () => {
      const time = await getCurrentServerTime();
      setServerTime(time);

      const today = new Date(time);
      // Extract hours and minutes
      let hours = today.getHours();
      let minutes = today.getMinutes();

      // Convert to 12-hour format
      let ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12

      // Format with leading zero if needed
      hours = String(hours).padStart(2, '0');
      minutes = String(minutes).padStart(2, '0');

      // // let res = await axios.get(SERVICE.OSBOUGHTNOTE_CUSTOMER_FILTER_FOR_SALES, {
      // let res_prod = await axios.get(SERVICE.PRODUCTMASTER, {
      //     headers: {
      //         Authorization: `Bearer ${auth.APIToken}`,
      //     },
      // });
      // const all = [
      //     ...res_prod?.data?.productmastercategories?.map((d) => ({
      //         ...d,
      //         label: d.productname,
      //         value: d.productname,
      //     })),
      // ];
      // // Remove duplicates by customer name
      // const finalAll = Array.from(new Map(all.filter((d) => d && d.value).map((d) => [d.value, d])).values());
      // setProdTypeOpt(finalAll);
      // const defaultData = finalAll?.find((d) => d.value === 'SILVER');

      // // Remove duplicates based on the 'company' field
      // const uniqueIsAssignBranch = accessbranch.reduce((acc, current) => {
      //     const x = acc.find((item) => item.company === current.company && item.branch === current.branch && item.unit === current.unit);
      //     if (!x) {
      //         acc.push(current);
      //     }
      //     return acc;
      // }, []);

      // const company = [...new Set(uniqueIsAssignBranch.map((data) => data.company))].map((data) => ({
      //     label: data,
      //     value: data,
      // }));
      // setCompanyOpt(company);
      // const branch = uniqueIsAssignBranch
      //     ?.filter((val) => company[0].value === val.company)
      //     ?.map((data) => ({
      //         branchcode: data.branchcode,
      //         label: data.branch,
      //         value: data.branch,
      //     }))
      //     .filter((item, index, self) => {
      //         return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
      //     });
      // setBranchOpt(branch);
      // setBranchString(branch[0].branchcode);

      // const res_item = await axios.post(SERVICE.ITEMMASTER_BASED_ON_PRODUCTTYPE_FILTER_FOR_SALES, {
      //     headers: { Authorization: `Bearer ${auth.APIToken}` },
      //     producttype: defaultData.value,
      // });
      // setSalesItemParticularsOpt(res_item?.data?.products);
      // setProdString(defaultData.productprefix);

      // let res = await axios.get(SERVICE.MANAGESALES, {
      //     headers: {
      //         Authorization: `Bearer ${auth.APIToken}`,
      //     },
      // });

      // // Build prefix based on dropdown selections
      // const currentPrefix = `${branch[0].branchcode}/${defaultData.productprefix}/`;

      // // Filter only bills starting with this prefix
      // const filteredBills = res?.data?.managesales?.filter((sale) => sale.billno.startsWith(currentPrefix));

      // let newBillNo;
      // if (filteredBills.length > 0) {
      //     // Get the last one (assuming billno are ordered)
      //     const lastBill = filteredBills[filteredBills.length - 1].billno;
      //     setLastBillNo(lastBill);
      //     // Extract number after prefix
      //     const lastNumber = parseInt(lastBill.replace(currentPrefix, ''), 10);

      //     // Increment number
      //     const nextNumber = lastNumber + 1;

      //     newBillNo = `${currentPrefix}${nextNumber}`;
      // } else {
      //     // If no bill exists for this prefix, start at 1
      //     newBillNo = `${currentPrefix}1`;
      // }

      // // console.log(newBillNo, 'Generated Bill No');
      // setBillNoAuto(newBillNo);
      await fetchAllManageSalesForAutoIdOnchange()
      await getHeaderFooterImages();

      setManageSalesCommon({
        ...manageSalesCommon,
        // company: company[0].value, branch: branch[0].value, 
        date: moment(time).format('YYYY-MM-DD'), hours: hours, minutes: minutes, time: ampm,
        //  billno: newBillNo, prodmastertype: defaultData.value
      });

      let res_gold_rate = await axios.post(SERVICE.RATEMASTER_DATEMATCHED_FOR_SALESREPORT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        ornamanet: 'Gold',
        date: moment(serverTime1).format('YYYY-MM-DD'),
        time: serverTime1.format('hh:mm:ss A'),
      });
      let res_silver_rate = await axios.post(SERVICE.RATEMASTER_DATEMATCHED_FOR_SALESREPORT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        ornamanet: 'Silver',
        date: moment(serverTime1).format('YYYY-MM-DD'),
        time: serverTime1.format('hh:mm:ss A'),
      });
      console.log(res_gold_rate?.data?.ratemaster)
      const matchedGoldRate = res_gold_rate?.data?.ratemaster?.rate;
      const matchedSilverRate = res_silver_rate?.data?.ratemaster?.rate;
      setCurrentGoldRate(matchedGoldRate);
      setCurrentSilverRate(matchedSilverRate);
    };

    fetchTime();
  }, []);

  var today = new Date(serverTime);

  // Extract hours and minutes
  let hours = today.getHours();
  let minutes = today.getMinutes();

  // Convert to 12-hour format
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12

  // Format with leading zero if needed
  hours = String(hours).padStart(2, '0');
  minutes = String(minutes).padStart(2, '0');

  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;

  function formatCustomDateTime(date) {
    // console.log(date, 'date')
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

  const gridRefTableManageSales = useRef(null);
  const gridRefImageManageSales = useRef(null);

  const [companyOpt, setCompanyOpt] = useState([]);
  const [branchOpt, setBranchOpt] = useState([]);
  const [prodTypeOpt, setProdTypeOpt] = useState([]);
  const [cusOptions, setCusOptions] = useState([]);
  const [branchString, setBranchString] = useState('');
  const [prodString, setProdString] = useState('');
  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [salesItemParticularsOpt, setSalesItemParticularsOpt] = useState([]);
  const [oldItemPurticularsOpt, setOldItemPurticularsOpt] = useState([]);
  const [oldItemFromItems, setOldItemFromItems] = useState([]);

  const [isNewCusDetails, setIsNewCusDetails] = useState({ isNewCusValue: false, customername: '', customeraddress: 'TRICHY', customercontactprefix: '+91', customercontact: '', bnoteprefix: 'TRI/S/', bnoteno: 'TRI/S/' });
  const [isNewBNote, setIsNewBNote] = useState({ isNewValue: false, bnoteno: 'TRI/S/' });
  const [isAuto, setIsAuto] = useState(false);
  const [billNoError, setBillNoError] = useState('');
  const [allManageSales, setAllManageSales] = useState([]);
  const [loader, setLoader] = useState(false);
  const [isBtn, setIsBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [items, setItems] = useState([]);
  const [deleteSource, setDeleteSource] = useState('');
  const [salesItemTypeFromParticular, setSalesItemTypeFromParticular] = useState('');
  const [salesItemTypeFromParticularEdit, setSalesItemTypeFromParticularEdit] = useState('');
  const [oldItemTypeFromParticularEdit, setOldItemTypeFromParticularEdit] = useState('');

  let newval = `IN0001`;
  // let newval = `${branchString}/${prodString}/1`;
  const [billNoAuto, setBillNoAuto] = useState(newval);
  const [lastBillNo, setLastBillNo] = useState('');
  const [isMC, setIsMC] = useState(0.0);
  const [isAddNew, setIsAddNew] = useState(false);
  const [addedNewOldItem, setAddedNewOldItem] = useState([]);

  const [manageSalesCommon, setManageSalesCommon] = useState({
    prodmastertype: '',
    customername: '',
    customeraddress: 'TRICHY',
    customercontactprefix: '+91',
    customercontact: '',
    date: today,
    hours: hours,
    minutes: minutes,
    time: ampm,
    billno: `${branchString}/${prodString}/`,
    salesid: '',
    bnoteno: 'Please Select Bnote No',
    overalllesstype: 'Fixed',
    overallless: '0',
    totalsalespieces: 0,
    totalsalesweight: 0,
    totalmcdiscount: 0,
    totalsalesgross: 0,
    totalsalescgstper: 0,
    totalsalessgstper: 0,
    totalsalescgst: 0,
    totalsalessgst: 0,
    totalsalesamount: 0,
    totaloldpieces: 0,
    totaloldweight: 0,
    totalwastagediscount: 0,
    totaloldgross: 0,
    totaloldcgstper: 0,
    totaloldsgstper: 0,
    totaloldcgst: 0,
    totaloldsgst: 0,
    totaloldamount: 0,
    netamountwithoutdis: 0,
    netamount: 0,
    remarks: '',
    modeofpayments: 'Please Select Mode of Payments',
    cash: '0',
    balanceamount: '0',
    bankname: 'Please Select Bank Name',
    bankbranchname: '',
    accountholdername: '',
    accountnumber: '',
    ifsccode: '',
    upinumber: '',
    cardtype: 'Please Select Card Type',
    cardoptions: 'Please Select Card Options',
    othercardname: '',
    cardnumber: '',
    cardholdername: '',
    cardtransactionnumber: '',
    cardmonth: 'Month',
    cardyear: 'Year',
    cardsecuritycode: '',
    chequenumber: '',
    totalsalesgrosswithoutdiscount: '0',
    saleslesstype: 'Fixed',
    salesless: '0',
    totaloldgrosswithoutdiscount: '0',
    oldlesstype: 'Fixed',
    oldless: '0',
  });
  const [manageSalesItem, setManageSalesItem] = useState({
    productname: 'Please Select Product Name',
    productcode: '',
    producttype: '',
    productsize: '',
    productgst: '',
    productitemcoderunningnumber: '',
    hsn: '',
    pieces: 1,
    weight: '0.000',
    rate: '',
    value: '',
    makingchargemode: '',
    originalmc: '',
    mcgramamount: '0',
    makingcharge: '0',
    mc: '',
    lesstype: 'Fixed',
    less: '0',
    grossamount: '',
    cgstper: '0',
    sgstper: '0',
    cgst: '',
    sgst: '',
    salestype: '',
    salesamount: '',
  });
  const [manageOldItem, setManageOldItem] = useState({
    productname: 'Please Select Product Name',
    productcode: '',
    producttype: '',
    productsize: '',
    productgst: '',
    bnoteno: 'TRI/S/',
    hsn: '',
    pieces: 1,
    originalweight: '0.000',
    stoneweight: '0.000',
    correctweight: '0.000',
    waste: '',
    olddefaultwastage: 0,
    oldminimumwastage: 0,
    oldmaximumwastage: 0,
    wastediscount: '0',
    actualweight: '',
    rate: '',
    value: '',
    grossamount: '',
    cgstper: '0',
    sgstper: '0',
    cgst: '',
    sgst: '',
    salestype: '',
    boughtnoteamount: '',
    status: '',
  });
  const [manageSalesCommonEdit, setManageSalesCommonEdit] = useState({
    isInvoice: false,
    customername: '',
    customeraddress: 'TRICHY',
    customercontactprefix: '+91',
    customercontact: '',
    date: '',
    billno: `${branchString}/${prodString}/`,
    salesid: '',
    bnoteno: 'Please Select Bnote No',
    overalllesstype: 'Fixed',
    overallless: '0',
    netamountwithoutdis: 0,
    netamount: 0,
  });
  const [manageSalesItemEdit, setManageSalesItemEdit] = useState({
    productname: 'Please Select Product Name',
    productcode: '',
    producttype: '',
    productsize: '',
    productgst: '',
    productitemcoderunningnumber: '',
    hsn: '',
    pieces: '',
    weight: '',
    rate: '',
    value: '',
    makingchargemode: '',
    originalmc: '',
    mcgramamount: '0',
    makingcharge: '0',
    mc: '',
    lesstype: 'Fixed',
    less: '0',
    grossamount: '',
    cgstper: '0',
    sgstper: '0',
    cgst: '',
    sgst: '',
    salestype: '',
    salesamount: '',
  });
  const [manageOldItemEdit, setManageOldItemEdit] = useState({
    productname: 'Please Select Product Name',
    bnoteno: 'TRI/S/',
    hsn: '',
    pieces: '',
    originalweight: '0.000',
    stoneweight: '0.000',
    correctweight: '0.000',
    waste: '',
    olddefaultwastage: 0,
    oldminimumwastage: 0,
    oldmaximumwastage: 0,
    wastediscount: '0',
    actualweight: '',
    rate: '',
    value: '',
    grossamount: '',
    cgstper: '0',
    sgstper: '0',
    cgst: '',
    sgst: '',
    salestype: '',
    boughtnoteamount: '',
    status: '',
  });

  const [monthsOption, setMonthsOption] = useState([]);
  const [yearsOption, setYearsOption] = useState([]);
  const [salesItemTodo, setSalesItemTodo] = useState([]);
  const [salesItemTodoProd, setSalesItemTodoProd] = useState([]);
  const [oldItemTodoProd, setOldItemTodoProd] = useState([]);
  const [oldItemTodo, setOldItemTodo] = useState([]);
  const [salesItemTodoEdit, setSalesItemTodoEdit] = useState([]);
  const [oldItemTodoEdit, setOldItemTodoEdit] = useState([]);

  // State to track advanced filter
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const [searchedString, setSearchedString] = useState('');

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
  // pageManageSales refersh reload
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
  const [pageManageSales, setPageManageSales] = useState(1);
  const [pageSizeManageSales, setPageSizeManageSales] = useState(10);
  const [searchQueryManageSales, setSearchQueryManageSales] = useState('');
  const [totalPagesManageSales, setTotalPagesManageSales] = useState('');
  const [isHandleChange, setIsHandleChange] = useState(false);

  //Edit model...
  const [isEditOpen, setIsEditOpen] = useState(false);
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setIsEditOpen(false);
  };

  // view model
  const [openview, setOpenview] = useState(false);
  const handleClickOpenview = () => {
    setOpenview(true);
  };
  const handleCloseview = () => {
    setOpenview(false);
  };

  // info model
  const [openInfo, setOpeninfo] = useState(false);
  const handleClickOpeninfo = () => {
    setOpeninfo(true);
  };
  const handleCloseinfo = () => {
    setOpeninfo(false);
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
  const [searchQueryManageManageSales, setSearchQueryManageManageSales] = useState('');
  const [isManageColumnsOpenManageSales, setManageColumnsOpenManageSales] = useState(false);
  const [anchorElManageSales, setAnchorElManageSales] = useState(null);

  const handleOpenManageColumnsManageSales = (event) => {
    setAnchorElManageSales(event.currentTarget);
    setManageColumnsOpenManageSales(true);
  };
  const handleCloseManageColumnsManageSales = () => {
    setManageColumnsOpenManageSales(false);
    setSearchQueryManageManageSales('');
  };

  const openManageSales = Boolean(anchorElManageSales);
  const idManageSales = openManageSales ? 'simple-popover' : undefined;

  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    date: true,
    customername: true,
    customeraddress: true,
    customercontact: true,
    billno: true,
    salesid: true,
    bnoteno: true,
    itemtype: true,
    productname: true,
    hsn: true,
    pieces: true,
    weight: true,
    waste: true,
    actualweight: true,
    mc: true,
    rate: true,
    value: true,
    less: true,
    grossamount: true,
    cgst: true,
    sgst: true,
    netamount: true,
    salesamountorboughtnoteamount: true,
    salestype: true,
    actions: true,
  };

  const [columnVisibilityManageSales, setColumnVisibilityManageSales] = useState(initialColumnVisibility);

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
      pagename: String('Manage Sale'),
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

  const lesstypeOpt = [
    { label: 'Fixed', value: 'Fixed' },
    { label: 'Percentage', value: 'Percentage' },
  ];

  // pageAttStatus refersh reload code
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

  // Pre select dropdowns
  useEffect(() => {
    // Remove duplicates based on the 'company' field
    const uniqueIsAssignBranch = accessbranch.reduce((acc, current) => {
      const x = acc.find((item) => item.company === current.company && item.branch === current.branch && item.unit === current.unit);
      if (!x) {
        acc.push(current);
      }
      return acc;
    }, []);

    const company = [...new Set(uniqueIsAssignBranch.map((data) => data.company))].map((data) => ({
      label: data,
      value: data,
    }));
    setCompanyOpt(company);

    // const branch = uniqueIsAssignBranch?.filter(
    //   (val) =>
    //     company?.map(comp => comp.value === val.company)
    // )?.map(data => ({
    //   branchcode: data.branchcode,
    //   label: data.branch,
    //   value: data.branch,
    // })).filter((item, index, self) => {
    //   return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
    // })
    //    setBranchOpt(branch);
  }, [isAssignBranch]);

  const fetchBranch = (value) => {
    // Remove duplicates based on the 'company' field
    const uniqueIsAssignBranch = accessbranch.reduce((acc, current) => {
      const x = acc.find((item) => item.company === current.company && item.branch === current.branch && item.unit === current.unit);
      if (!x) {
        acc.push(current);
      }
      return acc;
    }, []);
    const branch = uniqueIsAssignBranch
      ?.filter((val) => val.company === value)
      ?.map((data) => ({
        branchcode: data.branchcode,
        label: data.branch,
        value: data.branch,
      }))
      .filter((item, index, self) => {
        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
      });
    setBranchOpt(branch);
  };

  const handlechangereferencecontactno = (e) => {
    const regex = /^[0-9]+$/; // Only allows positive integers
    const inputValue = e.target.value?.slice(0, 10);
    if (regex.test(inputValue) || inputValue === '') {
      setManageSalesCommon({ ...manageSalesCommon, customercontact: inputValue });
    }
  };

  //function to generate hrs
  const generateMonthsOptions = () => {
    const mnthsOpt = [];
    for (let i = 1; i <= 12; i++) {
      if (i < 10) {
        i = '0' + i;
      }
      mnthsOpt.push({ value: i.toString(), label: i.toString() });
    }
    setMonthsOption(mnthsOpt);
  };

  //function to generate mins
  const generateYearsOptions = () => {
    const yearsOpt = [];
    for (let i = yyyy; i <= 2050; i++) {
      yearsOpt.push({ value: i.toString(), label: i.toString() });
    }
    setYearsOption(yearsOpt);
  };

  useEffect(() => {
    generateMonthsOptions();
    generateYearsOptions();
  }, []);

  useEffect(() => {
    // Fetch all bill numbers once (or could fetch only when needed)
    const fetchSales = async () => {
      try {
        let res_sales = await axios.get(SERVICE.MANAGESALES, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
        setAllManageSales(res_sales?.data?.managesales || []);
      } catch (err) {
        console.error('Error fetching sales:', err);
      }
    };
    fetchSales();
  }, []);

  // Debounce duplicate check when billno changes
  useEffect(() => {
    if (!isAuto) return;
    if (!manageSalesCommon.billno) return;

    const timer = setTimeout(() => {
      const isDuplicate = allManageSales.some((item) => item.billno === manageSalesCommon.billno);

      if (isDuplicate) {
        setPopupContentMalert('Bill No already exists!');
        setPopupSeverityMalert('warning');
        handleClickOpenPopupMalert();
        setManageSalesCommon({ ...manageSalesCommon, billno: `${branchString}/${prodString}/` });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [manageSalesCommon.billno, isAuto, allManageSales, branchString, prodString]);

  useEffect(() => {
    if (!manageSalesCommon.date) return;
    if (!manageSalesCommon.hours) return;
    if (!manageSalesCommon.minutes) return;
    if (!manageSalesCommon.time) return;

    let timer;

    const checkDate = async () => {
      const time = await getCurrentServerTime();
      const currentDate = new Date(time).toISOString().split('T')[0];

      timer = setTimeout(() => {
        if (manageSalesCommon.date > currentDate) {
          setPopupContentMalert('Future Date is restricted!');
          setPopupSeverityMalert('warning');
          handleClickOpenPopupMalert();
          setManageSalesCommon({ ...manageSalesCommon, date: moment(time).format('YYYY-MM-DD') });
        }
      }, 2000);
    };

    checkDate();

    return () => clearTimeout(timer);
  }, [manageSalesCommon.date]);

  // Debounce max and min check when waste changes
  useEffect(() => {
    if (!manageOldItem.waste) return;

    const timer = setTimeout(() => {
      const valueTarget = Number(manageOldItem.waste);
      const min = Number(manageOldItem.oldminimumwastage);
      const max = Number(manageOldItem.oldmaximumwastage);

      if (valueTarget < min || valueTarget > max) {
        setPopupContentMalert(`Please enter value between Min: ${min}% and Max: ${max}%!`);
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        setManageOldItem({ ...manageOldItem, waste: manageOldItem.olddefaultwastage ? manageOldItem.olddefaultwastage : 0 });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [manageOldItem.waste, manageOldItem.olddefaultwastage, manageOldItem.oldminimumwastage, manageOldItem.oldmaximumwastage]);

  // const fetchAllManageSalesForAutoId = async () => {
  //   try {
  //     let res = await axios.get(SERVICE.MANAGESALES, {
  //       headers: {
  //         'Authorization': `Bearer ${auth.APIToken}`
  //       },
  //     });
  //     let refNo = res?.data?.managesales[res?.data?.managesales?.length - 1].billno;
  //     console.log(refNo, 'ref')
  //     let codenum = refNo.slice(-1);
  //     let prefixLength = Number(codenum) + 1;
  //     let prefixString = String(prefixLength);
  //     let strings = `${branchString}/${prodString}/`;
  //     let postfixLength = prefixString.length == 1 ? `${prefixString}` : prefixString.length == 2 ? `${prefixString}` : prefixString.length == 3 ? `${prefixString}` : prefixString
  //     console.log(strings + postfixLength, 'strings + postfixLength')
  //     setBillNoAuto(strings + postfixLength);
  //   } catch (err) {
  //     console.log(err.message)
  //     // handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
  //   }
  // };

  // useEffect(() => {
  //   fetchAllManageSalesForAutoId();
  // }, []);

  const fetchAllManageSalesForAutoIdOnchange = async (branchString, prodString) => {
    try {
      let res = await axios.get(SERVICE.MANAGESALES, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      // // Build prefix based on dropdown selections
      // const currentPrefix = `${branchString}/${prodString}/`;

      // // Filter only bills starting with this prefix
      // const filteredBills = res?.data?.managesales?.filter((sale) => sale.billno.startsWith(currentPrefix));

      // let newBillNo;
      // if (filteredBills.length > 0) {
      //   // Get the last one (assuming billno are ordered)
      //   const lastBill = filteredBills[filteredBills.length - 1].billno;
      //   setLastBillNo(lastBill);
      //   // Extract number after prefix
      //   const lastNumber = parseInt(lastBill.replace(currentPrefix, ''), 10);

      //   // Increment number
      //   const nextNumber = lastNumber + 1;

      //   newBillNo = `${currentPrefix}${nextNumber}`;
      // } else {
      //   // If no bill exists for this prefix, start at 1
      //   newBillNo = `${currentPrefix}1`;
      // }

      // // console.log(newBillNo, 'Generated Bill No');
      // setBillNoAuto(newBillNo);

      const notes = res?.data?.managesales || [];

      if (notes.length === 0) {
        setBillNoAuto("IN0001");
        return;
      }

      // Extract all numbers after "IN"
      const invoiceNumbers = notes
        .map(n => {
          const match = n.billno?.match(/IN(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => !isNaN(num));

      // Find max and create next number
      const maxNumber = Math.max(...invoiceNumbers);
      const nextNumber = maxNumber + 1;

      // Dynamically pad with zeros to keep total length = 6 (IN + 4 digits)
      const nextInvoice = `IN${String(nextNumber).padStart(4, "0")}`;

      setBillNoAuto(nextInvoice);

    } catch (err) {
      console.error(err);
      // handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchAllManageSalesForLastBillNo = async (branchString, prodString) => {
    try {
      let res = await axios.get(SERVICE.MANAGESALES, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      // Build prefix based on dropdown selections
      const currentPrefix = `${branchString}/${prodString}/`;

      // Filter only bills starting with this prefix
      const filteredBills = res?.data?.managesales?.filter((sale) => sale.billno.startsWith(currentPrefix));

      let lastBill;
      if (filteredBills.length > 0) {
        // Get the last one (assuming billno are ordered)
        lastBill = filteredBills[filteredBills.length - 1].billno;
      } else {
        // If no bill exists for this prefix, start at 1
        lastBill = `${currentPrefix}0`;
      }

      // console.log(lastBill, 'Last Bill No');
      setLastBillNo(lastBill);
    } catch (err) {
      console.error(err);
      // handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // useEffect(() => {
  //   fetchAllManageSalesForAutoId();
  // }, []);

  // dropdown functionality
  const fetchtProdType = async () => {
    try {
      // let res = await axios.get(SERVICE.OSBOUGHTNOTE_CUSTOMER_FILTER_FOR_SALES, {
      let res = await axios.get(SERVICE.PRODUCTMASTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const all = [
        ...res?.data?.productmastercategories?.map((d) => ({
          ...d,
          label: d.categoryname,
          value: d.categoryname,
        })),
      ];
      console.log(all)
      // Remove duplicates by customer name
      const finalAll = Array.from(new Map(all.filter((d) => d && d.value).map((d) => [d.value, d])).values());
      setProdTypeOpt(finalAll);
      // const defaultData = finalAll?.find((d) => d.value === 'SILVER');
      // setManageSalesCommon({ ...manageSalesCommon, prodmastertype: defaultData.value });
      // setProdString(defaultData.productprefix);
    } catch (err) {
      console.log(err)
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchtProdType();
  }, []);

  const fetchtCustomers = async () => {
    try {
      // let res = await axios.get(SERVICE.OSBOUGHTNOTE_CUSTOMER_FILTER_FOR_SALES, {
      let res = await axios.get(SERVICE.MANAGESALES_AND_BNOTE_CUSTOMER_FILTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      // const all = [
      //   ...res?.data?.result?.map((d) => ({
      //     ...d,
      //     label: d.customername,
      //     value: d.customername,
      //   })),
      // ];
      // // Remove duplicates by customer name
      // const finalAll = Array.from(
      //   new Map(
      //     all
      //       .filter(d => d && d.value)
      //       .map(d => [d.value, d])
      //   ).values()
      // );
      setCusOptions(res?.data?.result);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchtCustomers();
  }, []);

  const fetchInvoice = async (selectedCus) => {
    try {
      const res_inv = await axios.post(SERVICE.OSBOUGHTNOTE_INVOICE_FILTER_FOR_SALES, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        customername: selectedCus?.split('_')[0],
        customercontact: selectedCus?.split('_')[1],
      });
      setInvoiceOptions(res_inv?.data?.osboughtnotes);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchBnoteOldItem = async (selectedInvoice) => {
    try {
      const res = await axios.post(SERVICE.OSBOUGHTNOTE_OLDITEM_FILTER_FOR_SALES, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        invoiceno: selectedInvoice,
      });
      // const all = [
      //   ...res?.data?.osboughtnotes?.map((d) => ({
      //     uniqueid: d.uniqueid,
      //     id: d._id,
      //     label: d.productname,
      //     value: d.productname,
      //   })),
      // ];
      // console.log(all, 'from boughtnote')
      // setOldItemPurticularsOpt(all);
      // console.log(res?.data?.osboughtnotes, 'res?.data?.osboughtnotes')
      const result = res?.data?.osboughtnotes?.map((data) => ({ ...data, status: data.status === 'Bnote' ? 'Exists' : 'New', bnoteno: selectedInvoice }));
      setOldItemTodo(result);
      toCalculateTotalValues(
        salesItemTodo,
        result,
        manageSalesCommon.date,
        manageSalesCommon.hours,
        manageSalesCommon.minutes,
        manageSalesCommon.time,
        selectedInvoice,
        manageSalesCommon.saleslesstype,
        manageSalesCommon.salesless,
        manageSalesCommon.oldlesstype,
        manageSalesCommon.oldless,
        manageSalesCommon.overalllesstype,
        manageSalesCommon.overallless
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchAllItems = async () => {
    try {
      let res = await axios.get(SERVICE.ITEMMASTER_OLDITEM_FILTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setOldItemFromItems(res?.data?.itemmasters);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchAllItems();
  }, []);

  // const fetchSelectedRecentProdDetails = async (data) => {
  //   console.log(data, 'datga')
  //   try {
  //     let res_bnote = await axios.post(SERVICE.OSBOUGHTNOTE_RECENTDATA_FOR_SALES, {
  //       headers: {
  //         Authorization: `Bearer ${auth.APIToken}`,
  //       },
  //       productname: data.value,
  //       date: manageSalesCommon.date,
  //     });
  //     console.log(res_bnote?.data?.osboughtnotes, 'res_bnote?.data?.osboughtnotes')
  //     setManageOldItem(res_bnote?.data?.osboughtnotes);
  //   } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  // };

  // const fetchSelectedProdDetails = async (isNewBNoteValue, isInvoice, data) => {
  //   // console.log(data, 'data')
  //   try {
  //     // if (isNewBNoteValue === true || isInvoice === false) {
  //     //   let res_bnote = await axios.post(SERVICE.OSBOUGHTNOTE_RECENTDATA_FOR_SALES, {
  //     //     headers: {
  //     //       Authorization: `Bearer ${auth.APIToken}`,
  //     //     },
  //     //     productname: data.value,
  //     //     date: manageSalesCommon.date,
  //     //   });
  //     //   console.log(res_bnote?.data?.osboughtnotes, 'res_bnote?.data?.osboughtnotes')
  //     //   setManageOldItem(res_bnote?.data?.osboughtnotes);
  //     // }
  //     // if (isNewBNoteValue === false || isInvoice === true) {
  //     // let res = await axios.delete(`${SERVICE.OSBOUGHTNOTE_SINGLE}/${data.uniqueid}`, {
  //     //   headers: {
  //     //     Authorization: `Bearer ${auth.APIToken}`,
  //     //   },
  //     // });
  //     // let res = await axios.post(SERVICE.OSBOUGHTNOTE_SINGLE_FOR_SELECTED_OLDITEM_IN_SALES, {
  //     //   headers: {
  //     //     Authorization: `Bearer ${auth.APIToken}`,
  //     //   },
  //     //   uniqueid: data.uniqueid,
  //     //   id: data.id
  //     // });
  //     // setManageOldItem(matchedItem);
  //     // console.log(res?.data?.sosboughtnote?.olditems, 'res?.data?.sosboughtnote?.olditems')
  //     // setOldItemTodo(res?.data?.sosboughtnote?.olditems);
  //     // }
  //   } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  // };

  const height = 35;

  const MenuList = (props) => {
    const { options, children, maxHeight, getValue } = props;
    const [value] = getValue();
    const initialOffset = options.indexOf(value) * height;

    // return (
    // //   <List height={maxHeight} itemCount={children.length} itemSize={height} initialScrollOffset={initialOffset} width="100%">
    // //     {({ index, style }) => <div style={style}>{children[index]}</div>}
    // //   </List>
    // );
  };

  const fetchAllPruchase = async (selectedType) => {
    try {
      const res_item = await axios.post(SERVICE.ITEMMASTER_BASED_ON_PRODUCTTYPE_FILTER_FOR_SALES, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        producttype: selectedType,
      });
      // let res_pur = await axios.get(SERVICE.MANAGEPURCHASE_LIMIT, {
      //   headers: {
      //     Authorization: `Bearer ${auth.APIToken}`,
      //   },
      // });
      setSalesItemParticularsOpt(res_item?.data?.products);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    // fetchAllPruchase();
  }, []);

  // const loadOptions = (inputValue, callback) => {
  //   const filtered = salesItemParticularsOpt.filter(i =>
  //     i.label.toLowerCase().includes(inputValue.toLowerCase())
  //   );
  //   callback(filtered.slice(0, 50)); // show max 50 results
  // };

  const fetchMatchedProdHsn = async (selectedItem) => {
    try {
      const res = await axios.post(SERVICE.ITEMMASTER_FILTER_FOR_SALES, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        itemname: selectedItem,
      });
      const matchedItem = res?.data?.itemmasters.hsncode;
      return matchedItem;
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchMatchedProdGstName = async (selectedItem) => {
    try {
      const res_item = await axios.post(SERVICE.ITEMMASTER_FILTER_FOR_SALES, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        itemname: selectedItem,
      });
      const matchedTaxName = res_item?.data?.itemmasters.taxname;
      return matchedTaxName;
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchMatchedProdCgst = async (selectedItem) => {
    try {
      const res_item = await axios.post(SERVICE.ITEMMASTER_FILTER_FOR_SALES, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        itemname: selectedItem,
      });
      const matchedTaxName = res_item?.data?.itemmasters.taxname;

      const res_tax = await axios.post(SERVICE.TAXMASTER_GST_VALUE, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        taxname: matchedTaxName,
      });
      const matchedCgst = res_tax?.data?.taxmasters.cgstvalue;
      return matchedCgst;
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchMatchedProdSgst = async (selectedItem) => {
    try {
      const res_item = await axios.post(SERVICE.ITEMMASTER_FILTER_FOR_SALES, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        itemname: selectedItem,
      });
      const matchedTaxName = res_item?.data?.itemmasters.taxname;

      const res_tax = await axios.post(SERVICE.TAXMASTER_GST_VALUE, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        taxname: matchedTaxName,
      });
      const matchedSgst = res_tax?.data?.taxmasters.sgstvalue;
      return matchedSgst;
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchRate = async (selectedItem, selectedDate, selectedTime) => {
    try {

      let res_rate = await axios.post(SERVICE.RATEMASTER_DATEMATCHED_FOR_SALESREPORT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        ornamanet: selectedItem,
        date: selectedDate,
        time: selectedTime,
      });
      const matchedRate = res_rate?.data?.ratemaster?.rate;
      return matchedRate;
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchSinglePur = async (data, date, hours, minutes, time) => {
    try {
      let res_pur = await axios.get(`${SERVICE.PRODUCTMASTER_SINGLE}/${data._id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const formattedtime = `${hours}:${minutes} ${time}`;
      const singleData = res_pur?.data?.sproductmastercategory;

      const rateAmount = await fetchRate(singleData.ornamanet, date, formattedtime);
      console.log(singleData)

      calculateSalesItemValues({
        productname: data.value,
        weight: '0.000',
        originalrate: rateAmount ? rateAmount : '0.00',
        rate: '0.00',
        id: singleData._id,
      });
      console.log({
        productname: data.value,
        weight: '0.000',
        rate: rateAmount ? rateAmount : '0.00',
        id: singleData._id,
      });
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // const fetchSinglePurForRateChange = async (id, productname, date, hours, minutes, time, index) => {
  //   try {
  //     let res_pur = await axios.get(`${SERVICE.MANAGEPURCHASE_SINGLE}/${id}`, {
  //       headers: {
  //         Authorization: `Bearer ${auth.APIToken}`,
  //       },
  //     });
  //     const formattedtime = `${hours}:${minutes} ${time}`;
  //     const singleData = res_pur?.data?.smanagepurchase;
  //     const hsnValue = await fetchMatchedProdHsn(singleData.itemname);
  //     const gstName = await fetchMatchedProdGstName(singleData.itemname);
  //     const Cgst = await fetchMatchedProdCgst(singleData.itemname);
  //     const Sgst = await fetchMatchedProdSgst(singleData.itemname);
  //     const rateAmount = await fetchRate(singleData.itemname, date, formattedtime);

  //     // setManageSalesCommon({ ...manageSalesCommon, billno: isAuto === true ? 'TRI/S/' : billNoAuto });
  //     if (['pieces', 'piece', 'pcs', 'Pieces', 'Piece', 'Pcs', 'PIECES', 'PIECE', 'PCS']?.includes(singleData.unit)) {
  //       setSalesItemTypeFromParticular('Piece');
  //       calculateSalesItemValuesForRateChange(
  //         'Piece',
  //         {
  //           productname: productname,
  //           weight: '0.000',
  //           hsn: hsnValue,
  //           pieces: singleData.piecesvalue,
  //           itemname: singleData.itemname,
  //           productsize: singleData.sizename,
  //           productcode: singleData.itemcode,
  //           makingcharge: '0',
  //           producttype: singleData.type,
  //           productitemcoderunningnumber: singleData.itemcoderunningnumber,
  //           makingchargemode: singleData.makingchargemode,
  //           originalmc: singleData.makingcharge ? singleData.makingcharge : '0.00',
  //           rate: singleData.salesamount,
  //           unit: singleData.unit,
  //           id: singleData._id,
  //           productgst: gstName,
  //           cgstper: Cgst,
  //           sgstper: Sgst,
  //           cgst: Cgst,
  //           sgst: Sgst,
  //         },
  //         date,
  //         hours,
  //         minutes,
  //         time,
  //         index
  //       );
  //     }
  //     if (!['pieces', 'piece', 'pcs', 'Pieces', 'Piece', 'Pcs', 'PIECES', 'PIECE', 'PCS']?.includes(singleData.unit)) {
  //       setSalesItemTypeFromParticular('Gram');
  //       calculateSalesItemValuesForRateChange(
  //         'Gram',
  //         {
  //           productname: productname,
  //           weight: singleData.weight,
  //           hsn: hsnValue,
  //           pieces: singleData.piecesvalue,
  //           itemname: singleData.itemname,
  //           productsize: singleData.sizename,
  //           productcode: singleData.itemcode,
  //           makingcharge: '0',
  //           producttype: singleData.type,
  //           productitemcoderunningnumber: singleData.itemcoderunningnumber,
  //           makingchargemode: singleData.makingchargemode,
  //           originalmc: singleData.makingcharge ? singleData.makingcharge : '0.00',
  //           rate: rateAmount ? rateAmount : '0.00',
  //           unit: singleData.unit,
  //           id: singleData._id,
  //           productgst: gstName,
  //           cgstper: Cgst,
  //           sgstper: Sgst,
  //           cgst: Cgst,
  //           sgst: Sgst,
  //         },
  //         date,
  //         hours,
  //         minutes,
  //         time,
  //         index
  //       );
  //     }
  //   } catch (err) {
  //     handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
  //   }
  // };

  const calculateSalesItemValues = (updatedData = {}) => {
    // const { weight, originalrate, value} = { ...manageSalesItem, ...updatedData };
    const mergedData = { ...manageSalesItem, ...updatedData };

    const { weight, originalrate, value } = mergedData;
    const ratevalue = Number(originalrate) * Number(weight);
    const Percentagevalue = ratevalue * (Number(value) / 100);
    const finalvalue = ratevalue + Percentagevalue;
    console.log(value, Percentagevalue, finalvalue)
    // console.log({ ...manageSalesItem, ...updatedData })


    setManageSalesItem((prev) => ({
      ...prev,
      ...updatedData,
      rate: ratevalue,
      // value: Percentagevalue,
      salesamount: finalvalue,
    }));
  };


  const calculateSalesItemValuesForRateChange = (unitType, updatedData = {}, date, hours, minutes, time, index) => {
    const currentItem = { ...salesItemTodo[index], ...updatedData };
    const { pieces, weight, lesstype, less, makingchargemode, originalmc, makingcharge, rate, cgstper, sgstper } = currentItem;

    const foundedValue = unitType === 'Piece' ? Number(rate) : Number(rate) * Number(weight);
    const mcRateBasedMode = makingchargemode === 'Fixed' ? Number(originalmc) : Number(weight) * Number(originalmc);
    const finalMackingCharges = originalmc !== '0.00' ? Number(mcRateBasedMode) - Number(makingcharge) : Number(makingcharge);
    const makingCharges = foundedValue + Number(finalMackingCharges);
    const foundedLess = lesstype === 'Fixed' ? Number(less) : makingCharges * (Number(less) * (1 / 100));
    const grossAmount = makingCharges - foundedLess;
    const cgstValue = grossAmount * (Number(cgstper) / 100);
    const sgstValue = grossAmount * (Number(sgstper) / 100);
    const netSaleAmount = grossAmount + cgstValue + sgstValue;

    const updatedItem = {
      ...currentItem,
      value: foundedValue ? foundedValue.toFixed(2) : '',
      originalmc: originalmc ? Number(originalmc).toFixed(2) : '',
      mcgramamount: mcRateBasedMode?.toFixed(2),
      makingchargemode: makingchargemode || '',
      mc: makingCharges ? makingCharges.toFixed(2) : '',
      grossamount: grossAmount ? grossAmount.toFixed(2) : '',
      cgst: cgstValue ? cgstValue.toFixed(2) : '',
      sgst: sgstValue ? sgstValue.toFixed(2) : '',
      salestype: 'Sales Amount',
      salesamount: netSaleAmount ? Math.round(netSaleAmount).toFixed(2) : '',
    };

    setSalesItemTodo((prev) => {
      const newArr = [...prev];
      newArr[index] = updatedItem;
      toCalculateTotalValues(newArr, oldItemTodo, date, hours, minutes, time, manageSalesCommon.bnoteno, manageSalesCommon.saleslesstype, manageSalesCommon.salesless, manageSalesCommon.oldlesstype, manageSalesCommon.oldless, manageSalesCommon.overalllesstype, manageSalesCommon.overallless);
      return newArr;
    });
    setPopupContent('Rate changed based on the selected date and time');
    setPopupSeverity('success');
    handleClickOpenPopup();
  };

  const addSalesItem = () => {
    console.log(manageSalesItem.weight)
    console.log(manageSalesItem)
    console.log(manageSalesCommon.weight)


    if (manageSalesItem.productname === 'Please Select Product Name') {
      setPopupContentMalert('Please Select Product Name');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (manageSalesItem.pieces === '') {
      setPopupContentMalert('Please Enter Pieces');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (manageSalesItem.weight === '0.000') {
      setPopupContentMalert('Please Enter Weight');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (manageSalesItem.rate === '') {
      setPopupContentMalert('Please Enter Rate');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    }
    else if (manageSalesItem.value === '') {
      setPopupContentMalert('Please Enter Wastage');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else {
      const newTodo = {
        ...manageSalesCommon,
        customername: String(manageSalesCommon?.isNewCusValue === false ? manageSalesCommon.customername : manageSalesCommon.customername?.split('_')[0]),
        customercontact: String(manageSalesCommon?.isNewCusValue === false ? manageSalesCommon.customercontact : manageSalesCommon.customercontact),
        billno: String(isAuto === true ? manageSalesCommon.billno : billNoAuto),
        bnoteno: String(isNewBNote?.isNewValue === false ? isNewBNote.bnoteno : manageSalesCommon.bnoteno),
        ...manageSalesItem,
        rate: Number(manageSalesItem.rate)?.toFixed(2),
      };
      const checkDup = salesItemTodo?.some((data) => data.productname === newTodo.productname);
      if (salesItemTodo.length > 0 && checkDup) {
        setPopupContentMalert('Product Already Exists!');
        setPopupSeverityMalert('warning');
        handleClickOpenPopupMalert();
      } else {
        setSalesItemTodoProd([...salesItemTodoProd, newTodo.productname]);
        setSalesItemTodo([...salesItemTodo, newTodo]);
        toCalculateTotalValues(
          [...salesItemTodo, newTodo],
          oldItemTodo,
          manageSalesCommon.date,
          manageSalesCommon.hours,
          manageSalesCommon.minutes,
          manageSalesCommon.time,
          manageSalesCommon.bnoteno,
          manageSalesCommon.saleslesstype,
          manageSalesCommon.salesless,
          manageSalesCommon.oldlesstype,
          manageSalesCommon.oldless,
          manageSalesCommon.overalllesstype,
          manageSalesCommon.overallless
        );
        setManageSalesItem({
          productname: 'Please Select Product Name',
          productcode: '',
          producttype: '',
          productsize: '',
          productgst: '',
          productitemcoderunningnumber: '',
          hsn: '',
          pieces: 1,
          weight: '',
          rate: '',
          value: '',
          makingchargemode: '',
          originalmc: '',
          mcgramamount: '0',
          makingcharge: '0',
          mc: '',
          lesstype: 'Fixed',
          less: '0',
          grossamount: '',
          cgstper: '0',
          sgstper: '0',
          cgst: '',
          sgst: '',
          salestype: '',
          salesamount: '',
        });
      }
    }
  };

  // Delete Searched Product
  const deleteSalesItemRow = (i, e) => {
    setSalesItemTodo(salesItemTodo.filter((v, item) => item !== i));
    const deletedItem = salesItemTodo.filter((v, item) => item !== i);
    const filterdRes = deletedItem.map((d) => d.productname);
    setSalesItemTodoProd([...filterdRes]);

    toCalculateTotalValues(
      deletedItem,
      oldItemTodo,
      manageSalesCommon.date,
      manageSalesCommon.hours,
      manageSalesCommon.minutes,
      manageSalesCommon.time,
      manageSalesCommon.bnoteno,
      manageSalesCommon.saleslesstype,
      manageSalesCommon.salesless,
      manageSalesCommon.oldlesstype,
      manageSalesCommon.oldless,
      manageSalesCommon.overalllesstype,
      manageSalesCommon.overallless
    );
  };

  const loadOptions = (inputValue, callback) => {
    // Ensure salesItemTodoProd is an array of strings
    const selectedValues = (salesItemTodoProd || []).map((v) => v.toLowerCase());

    // Filter out already selected products
    const result = salesItemParticularsOpt.filter((prod) => !selectedValues.includes(prod.value.toLowerCase()));

    // Apply search filter
    let filtered = result;
    if (inputValue) {
      const query = inputValue.toLowerCase();
      filtered = result.filter((i) => i.label.toLowerCase().includes(query) || i.value.toLowerCase().includes(query));
    }

    callback(filtered.slice(0, 50)); // max 50 results
  };

  const fetchSingleItem = async (data, date, hours, minutes, time) => {
    try {
      let res_item = await axios.get(`${SERVICE.ITEMMASTER_SINGLE}/${data.id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const formattedtime = `${hours}:${minutes} ${time}`;
      const singleData = res_item?.data?.sitemmaster;
      const gstName = await fetchMatchedProdGstName(singleData.itemname);
      const Cgst = await fetchMatchedProdCgst(singleData.itemname);
      const Sgst = await fetchMatchedProdSgst(singleData.itemname);
      const rateAmount = await fetchRate(singleData.itemname, date, formattedtime);
      // setManageSalesCommon({ ...manageSalesCommon, billno: isAuto === true ? 'TRI/S/' : billNoAuto });

      calculateOldItemValues({
        productname: data.value,
        itemname: singleData.itemname,
        bnoteno: manageSalesCommon.isInvoice === true && isNewBNote?.isNewValue === false ? isNewBNote.bnoteno : manageSalesCommon.bnoteno === 'Please Select Bnote No' ? '' : manageSalesCommon.bnoteno,
        hsn: singleData.hsncode,
        productsize: singleData.sizename,
        waste: singleData.olddefaultwastage ? singleData.olddefaultwastage : 0,
        olddefaultwastage: singleData.olddefaultwastage,
        oldminimumwastage: singleData.oldminimumwastage,
        oldmaximumwastage: singleData.oldmaximumwastage,
        productcode: singleData.itemcode,
        producttype: singleData.pricingtype,
        rate: rateAmount ? rateAmount : '0.00',
        id: singleData._id,
        productgst: gstName,
        cgstper: Cgst,
        sgstper: Sgst,
        cgst: Cgst,
        sgst: Sgst,
      });
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchSingleItemForRateChange = async (id, productname, date, hours, minutes, time, index) => {
    try {
      let res_item = await axios.get(`${SERVICE.ITEMMASTER_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const formattedtime = `${hours}:${minutes} ${time}`;
      const singleData = res_item?.data?.sitemmaster;
      const gstName = await fetchMatchedProdGstName(singleData.itemname);
      const Cgst = await fetchMatchedProdCgst(singleData.itemname);
      const Sgst = await fetchMatchedProdSgst(singleData.itemname);
      const rateAmount = await fetchRate(singleData.itemname, date, formattedtime);

      // setManageSalesCommon({ ...manageSalesCommon, billno: isAuto === true ? 'TRI/S/' : billNoAuto });
      calculateOldItemValuesForRateChange(
        {
          productname: productname,
          itemname: singleData.itemname,
          bnoteno: manageSalesCommon.isInvoice === true && isNewBNote?.isNewValue === false ? isNewBNote.bnoteno : manageSalesCommon.bnoteno === 'Please Select Bnote No' ? '' : manageSalesCommon.bnoteno,
          hsn: singleData.hsncode,
          productsize: singleData.sizename,
          waste: singleData.olddefaultwastage ? singleData.olddefaultwastage : 0,
          olddefaultwastage: singleData.olddefaultwastage,
          oldminimumwastage: singleData.oldminimumwastage,
          oldmaximumwastage: singleData.oldmaximumwastage,
          productcode: singleData.itemcode,
          producttype: singleData.pricingtype,
          rate: rateAmount ? rateAmount : '0.00',
          id: singleData._id,
          productgst: gstName,
          cgstper: Cgst,
          sgstper: Sgst,
          cgst: Cgst,
          sgst: Sgst,
        },
        date,
        hours,
        minutes,
        time,
        index
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const calculateOldItemValues = (updatedData = {}) => {
    const { originalweight, stoneweight, waste, rate, cgstper, sgstper } = { ...manageOldItem, ...updatedData };

    manageSalesCommon.isInvoice === true && isNewBNote?.isNewValue === false ? setIsAddNew(true) : setIsAddNew(false);

    const correctWeight = Number(originalweight) - Number(stoneweight);
    const actualWeight = Number(correctWeight) - Number(correctWeight) * (Number(waste) * (1 / 100));
    const wasteDiscount = Number(correctWeight) * (Number(waste) * (1 / 100));
    const foundedValue = Number(rate) * Number(actualWeight);
    const bNoteAmount = foundedValue;
    const grossAmt = 100 * (bNoteAmount / (100 + Number(cgstper) + Number(sgstper)));
    const cgstValue = grossAmt * (Number(cgstper) * (1 / 100));
    const sgstValue = grossAmt * (Number(sgstper) * (1 / 100));
    const netOldAmount = grossAmt;
    // console.log(correctWeight, rateAmount, actualWeight, foundedValue)

    setManageOldItem((prev) => ({
      ...prev,
      ...updatedData,
      correctweight: correctWeight ? (correctWeight < 0 ? 0.0 : correctWeight?.toFixed(3)) : '',
      wastediscount: wasteDiscount ? wasteDiscount?.toFixed(2) : '0',
      actualweight: actualWeight ? actualWeight?.toFixed(3) : '',
      value: foundedValue ? foundedValue?.toFixed(2) : '',
      boughtnoteamount: bNoteAmount ? Math.round(bNoteAmount)?.toFixed(2) : '',
      cgst: cgstValue ? cgstValue?.toFixed(2) : '',
      sgst: sgstValue ? sgstValue?.toFixed(2) : ' ',
      salestype: 'Bought Note Amount',
      grossamount: netOldAmount ? netOldAmount?.toFixed(2) : '',
      status: 'Sales',
    }));
  };

  const calculateOldItemValuesForRateChange = (updatedData = {}, date, hours, minutes, time, index) => {
    const currentItem = { ...oldItemTodo[index], ...updatedData };
    const { originalweight, stoneweight, waste, rate, cgstper, sgstper } = currentItem;

    manageSalesCommon.isInvoice === true && isNewBNote?.isNewValue === false ? setIsAddNew(true) : setIsAddNew(false);

    const correctWeight = Number(originalweight) - Number(stoneweight);
    const actualWeight = Number(correctWeight) - Number(correctWeight) * (Number(waste) * (1 / 100));
    const wasteDiscount = Number(correctWeight) * (Number(waste) * (1 / 100));
    const foundedValue = Number(rate) * Number(actualWeight);
    const bNoteAmount = foundedValue;
    const grossAmt = 100 * (bNoteAmount / (100 + Number(cgstper) + Number(sgstper)));
    const cgstValue = grossAmt * (Number(cgstper) * (1 / 100));
    const sgstValue = grossAmt * (Number(sgstper) * (1 / 100));
    const netOldAmount = grossAmt;
    // console.log(correctWeight, rateAmount, actualWeight, foundedValue)

    const updatedItem = {
      ...currentItem,
      correctweight: correctWeight ? (correctWeight < 0 ? 0.0 : correctWeight?.toFixed(3)) : '',
      wastediscount: wasteDiscount ? wasteDiscount?.toFixed(2) : '0',
      actualweight: actualWeight ? actualWeight?.toFixed(3) : '',
      value: foundedValue ? foundedValue?.toFixed(2) : '',
      boughtnoteamount: bNoteAmount ? Math.round(bNoteAmount)?.toFixed(2) : '',
      cgst: cgstValue ? cgstValue?.toFixed(2) : '',
      sgst: sgstValue ? sgstValue?.toFixed(2) : ' ',
      salestype: 'Bought Note Amount',
      grossamount: netOldAmount ? netOldAmount?.toFixed(2) : '',
      status: 'Sales',
    };
    setSalesItemTodo((prev) => {
      const newArr = [...prev];
      newArr[index] = updatedItem;
      toCalculateTotalValues(newArr, oldItemTodo, totalSalesReturnAmount, manageSalesCommon.isSReturn, manageSalesCommon.salesreturnno, date, hours, minutes, time, manageSalesCommon.bnoteno, manageSalesCommon.overalllesstype, manageSalesCommon.overallless, manageSalesCommon.lessopeningbalance);
      return newArr;
    });

    setOldItemTodo((prev) => {
      const newArr = [...prev];
      newArr[index] = updatedItem;
      toCalculateTotalValues(salesItemTodo, newArr, date, hours, minutes, time, manageSalesCommon.bnoteno, manageSalesCommon.saleslesstype, manageSalesCommon.salesless, manageSalesCommon.oldlesstype, manageSalesCommon.oldless, manageSalesCommon.overalllesstype, manageSalesCommon.overallless);
      return newArr;
    });
    setPopupContent('Rate changed based on the selected date and time');
    setPopupSeverity('success');
    handleClickOpenPopup();
  };

  const addOldItem = () => {
    if (manageOldItem.productname === 'Please Select Product Name') {
      setPopupContentMalert('Please Select Product Name');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (manageOldItem.originalweight === '') {
      setPopupContentMalert('Please Enter Original Weight');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (manageOldItem.stoneweight === '') {
      setPopupContentMalert('Please Enter Stone Weight');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (isAddNew === true && manageOldItem.bnoteno === '') {
      setPopupContentMalert('Please Enter Bnote No');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (manageOldItem.correctweight === '') {
      setPopupContentMalert('Please Enter Correct Weight');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    }
    // else if (manageOldItem.waste === '') {
    //   setPopupContentMalert('Please Enter Waste');
    //   setPopupSeverityMalert('warning');
    //   handleClickOpenPopupMalert();
    // }
    else if (manageOldItem.rate === '') {
      setPopupContentMalert('Please Enter Rate');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else {
      const newTodo = {
        ...manageSalesCommon,
        customername: String(manageSalesCommon?.isNewCusValue === false ? manageSalesCommon.customername : manageSalesCommon.customername?.split('_')[0]),
        customeraddress: String(manageSalesCommon?.isNewCusValue === false ? manageSalesCommon.customeraddress : manageSalesCommon.customeraddress),
        customercontactprefix: String(manageSalesCommon?.isNewCusValue === false ? manageSalesCommon.customercontactprefix : manageSalesCommon.customercontactprefix),
        customercontact: String(manageSalesCommon?.isNewCusValue === false ? manageSalesCommon.customercontact : manageSalesCommon.customercontact),
        billno: String(isAuto === true ? manageSalesCommon.billno : billNoAuto),
        ...manageOldItem,
        rate: Number(manageOldItem.rate)?.toFixed(2),
      };
      const checkDup = oldItemTodo?.some((data) => data.productname === newTodo.productname);
      // if (oldItemTodo.length > 0 && checkDup) {
      //   setPopupContentMalert('Product Already Exists!');
      //   setPopupSeverityMalert('warning');
      //   handleClickOpenPopupMalert();
      // } else {
      if (isAddNew === true) {
        const result = [...oldItemTodo, newTodo];
        // console.log(result);
        const fileredResult = result
          ?.filter((data) => data.status === 'Sales')
          .map((item) => {
            return {
              bnoteno: item.bnoteno,
              id: item.id,
              productname: item.productname,
              productcode: item.productcode,
              producttype: item.producttype,
              hsn: item.hsn,
              productsize: item.productsize,
              productgst: item.productgst,
              pieces: item.pieces,
              originalweight: item.originalweight,
              stoneweight: item.stoneweight,
              correctweight: item.correctweight,
              olddefaultwastage: item.olddefaultwastage,
              oldminimumwastage: item.oldminimumwastage,
              oldmaximumwastage: item.oldmaximumwastage,
              waste: item.waste,
              wastediscount: item.wastediscount,
              actualweight: item.actualweight,
              rate: item.rate,
              value: item.value,
              grossamount: item.grossamount,
              cgstper: item.cgstper,
              sgstper: item.sgstper,
              cgst: item.cgst,
              sgst: item.sgst,
              salestype: item.salestype,
              boughtnoteamount: item.boughtnoteamount,
              status: item.status,
            };
          });
        // console.log(fileredResult, 'fileredResult')
        setAddedNewOldItem(fileredResult);
      } else {
        setAddedNewOldItem([]);
      }
      // setOldItemTodoProd([...oldItemTodoProd, newTodo.productname]);
      setOldItemTodo([...oldItemTodo, newTodo]);
      toCalculateTotalValues(
        salesItemTodo,
        [...oldItemTodo, newTodo],
        manageSalesCommon.date,
        manageSalesCommon.hours,
        manageSalesCommon.minutes,
        manageSalesCommon.time,
        manageSalesCommon.bnoteno,
        manageSalesCommon.saleslesstype,
        manageSalesCommon.salesless,
        manageSalesCommon.oldlesstype,
        manageSalesCommon.oldless,
        manageSalesCommon.overalllesstype,
        manageSalesCommon.overallless
      );
      setIsAddNew(true);
      setManageOldItem({
        productname: 'Please Select Product Name',
        productcode: '',
        producttype: '',
        productsize: '',
        productgst: '',
        bnoteno: 'TRI/S/',
        hsn: '',
        pieces: 1,
        originalweight: '0.000',
        stoneweight: '0.000',
        correctweight: '0.000',
        waste: '',
        olddefaultwastage: 0,
        oldminimumwastage: 0,
        oldmaximumwastage: 0,
        wastediscount: '0',
        actualweight: '',
        rate: '',
        value: '',
        grossamount: '',
        cgstper: '0',
        sgstper: '0',
        cgst: '',
        sgst: '',
        salestype: '',
        boughtnoteamount: '',
        status: '',
      });
      // }
    }
  };

  // Delete Searched Product
  const deleteOldItemRow = (i, e) => {
    setOldItemTodo(oldItemTodo.filter((v, item) => item !== i));
    const deletedItem = oldItemTodo.filter((v, item) => item !== i);
    toCalculateTotalValues(
      salesItemTodo,
      deletedItem,
      manageSalesCommon.date,
      manageSalesCommon.hours,
      manageSalesCommon.minutes,
      manageSalesCommon.time,
      manageSalesCommon.bnoteno,
      manageSalesCommon.saleslesstype,
      manageSalesCommon.salesless,
      manageSalesCommon.oldlesstype,
      manageSalesCommon.oldless,
      manageSalesCommon.overalllesstype,
      manageSalesCommon.overallless
    );

    const result = oldItemTodo.filter((v, item) => item !== i).filter((d) => d.status === 'Sales');
    if (manageSalesCommon.isInvoice === true && result?.length > 0) {
      setIsAddNew(true);
    }
    if (manageSalesCommon.isInvoice === true && result?.length === 0) {
      setIsAddNew(false);
    }
  };

  // sales total calculation
  const toCalculateTotalValues = (salesItemTodo, oldItemTodo, date, hours, minutes, time, bnotevalue, salestype, salesvalue, oldtype, oldvalue, type, value) => {
    let totalSalesValue1 = 0;
    let totalSalesValue2 = 0;
    let totalSalesValue3 = 0;
    let totalSalesValue4 = 0;
    let totalSalesValue5 = 0;
    let totalSalesValue6 = 0;
    let totalSalesValue7 = 0;
    let totalSalesCgstper = 0;
    let totalSalesSgstper = 0;

    let totalOldValue1 = 0;
    let totalOldValue2 = 0;
    let totalOldValue3 = 0;
    let totalOldValue4 = 0;
    let totalOldValue5 = 0;
    let totalOldValue6 = 0;
    let totalOldValue7 = 0;
    let totalOldCgstper = 0;
    let totalOldSgstper = 0;

    // sales total less
    let totalSalesLess = 0;
    let afterSalesGrossAmt = 0;
    let afterSalesCgst = 0;
    let afterSalesSgst = 0;
    let afterNetSaleAmount = 0;

    // old total less
    let totalOldLess = 0;
    let afterOldGrossAmt = 0;
    let afterOldCgst = 0;
    let afterOldSgst = 0;
    let afterNetOldAmount = 0;

    if (salesItemTodo?.length > 0) {

      salesItemTodo?.forEach((item) => {
        console.log(item)
        totalSalesValue1 += Number(item.weight || 0);
        totalSalesValue2 += Number(item.makingcharge || 0);
        totalSalesValue3 += Number(item.grossamount || 0);
        totalSalesValue4 += Number(item.cgst || 0);
        totalSalesValue5 += Number(item.sgst || 0);
        totalSalesValue6 += Number(item.salesamount || 0);
        totalSalesValue7 += Number(item.pieces || 0);
        totalSalesCgstper += Number(item.cgstper || 0);
        totalSalesSgstper += Number(item.sgstper || 0);
      });

      // sales total less
      totalSalesLess = salestype === 'Percentage' ? totalSalesValue3 * ((Number(salesvalue) * 1) / 100) : Number(salesvalue);
      afterSalesGrossAmt = totalSalesValue3 - totalSalesLess;
      afterSalesCgst = afterSalesGrossAmt * (totalSalesCgstper * (1 / 100));
      afterSalesSgst = afterSalesGrossAmt * (totalSalesSgstper * (1 / 100));
      afterNetSaleAmount = Math.round(afterSalesGrossAmt + afterSalesCgst + afterSalesSgst);
    }

    if (oldItemTodo?.length > 0) {
      oldItemTodo?.forEach((item) => {
        totalOldValue1 += Number(item.correctweight || 0);
        totalOldValue2 += Number(item.wastediscount || 0);
        totalOldValue3 += Number(item.grossamount || 0);
        totalOldValue4 += Number(item.cgst || 0);
        totalOldValue5 += Number(item.sgst || 0);
        totalOldValue6 += Number(item.boughtnoteamount || 0);
        totalOldValue7 += Number(item.pieces || 0);
        totalOldCgstper += Number(item.cgstper || 0);
        totalOldSgstper += Number(item.sgstper || 0);
      });

      // old total less
      totalOldLess = oldtype === 'Percentage' ? totalOldValue3 * ((Number(oldvalue) * 1) / 100) : Number(oldvalue);
      afterOldGrossAmt = totalOldValue3 - totalOldLess;
      afterOldCgst = afterOldGrossAmt * (totalOldCgstper * (1 / 100));
      afterOldSgst = afterOldGrossAmt * (totalOldSgstper * (1 / 100));
      afterNetOldAmount = Math.round(afterOldGrossAmt + afterOldCgst + afterOldSgst);
    }

    // const beforeNetAmt = ((salesItemTodo?.length > 0 && oldItemTodo?.length === 0) ? totalSalesValue6
    //   : (salesItemTodo?.length === 0 && oldItemTodo?.length > 0) ? totalOldValue6
    //     : (salesItemTodo?.length > 0 && oldItemTodo?.length > 0) ? (totalSalesValue6 - totalOldValue6)
    //       : 0)?.toFixed(2);

    const beforeNetAmt = (salesItemTodo?.length > 0 && oldItemTodo?.length === 0 ? afterNetSaleAmount : salesItemTodo?.length === 0 && oldItemTodo?.length > 0 ? afterNetOldAmount : salesItemTodo?.length > 0 && oldItemTodo?.length > 0 ? afterNetSaleAmount - afterNetOldAmount : 0)?.toFixed(2);

    const lessAmount = type === 'Percentage' ? beforeNetAmt * ((Number(value) * 1) / 100) : Number(value);
    const afterNetAmt = beforeNetAmt - lessAmount;
    console.log(totalSalesValue6)
    setManageSalesCommon({
      ...manageSalesCommon,
      date: date,
      hours: hours,
      minutes: minutes,
      time: time,
      bnoteno: bnotevalue,
      totalsalespieces: totalSalesValue7,
      totalsalesweight: totalSalesValue1?.toFixed(3),
      totalmcdiscount: totalSalesValue2?.toFixed(2),
      totalsalesgrosswithoutdiscount: totalSalesValue3?.toFixed(2),
      saleslesstype: salesItemTodo?.length > 0 ? salestype : 'Fixed',
      salesless: salesItemTodo?.length > 0 ? salesvalue : '0',
      totalsalesgross: salesItemTodo?.length > 0 ? afterSalesGrossAmt?.toFixed(2) : 0,
      totalsalescgstper: totalSalesCgstper,
      totalsalessgstper: totalSalesSgstper,
      totalsalescgst: salesItemTodo?.length > 0 ? afterSalesCgst?.toFixed(2) : 0,
      totalsalessgst: salesItemTodo?.length > 0 ? afterSalesSgst?.toFixed(2) : 0,
      // totalsalesamount: salesItemTodo?.length > 0 ? afterNetSaleAmount?.toFixed(2) : 0,
      totalsalesamount: Number(totalSalesValue6)?.toFixed(2),
      totaloldpieces: totalOldValue7,
      totaloldweight: totalOldValue1?.toFixed(3),
      totalwastagediscount: totalOldValue2?.toFixed(2),
      totaloldgrosswithoutdiscount: totalOldValue3?.toFixed(2),
      oldlesstype: oldItemTodo?.length > 0 ? oldtype : 'Fixed',
      oldless: oldItemTodo?.length > 0 ? oldvalue : '0',
      totaloldgross: oldItemTodo?.length > 0 ? afterOldGrossAmt?.toFixed(2) : 0,
      totaloldcgstper: totalOldCgstper,
      totaloldsgstper: totalOldSgstper,
      totaloldcgst: oldItemTodo?.length > 0 ? afterOldCgst?.toFixed(2) : 0,
      totaloldsgst: oldItemTodo?.length > 0 ? afterOldSgst?.toFixed(2) : 0,
      totaloldamount: oldItemTodo?.length > 0 ? afterNetOldAmount?.toFixed(2) : 0,
      overalllesstype: salesItemTodo?.length > 0 || oldItemTodo?.length > 0 ? type : 'Fixed',
      overallless: salesItemTodo?.length > 0 || oldItemTodo?.length > 0 ? value : '0',
      netamountwithoutdis: salesItemTodo.length === 0 && oldItemTodo.length > 0 ? 0 : beforeNetAmt,
      netamount: salesItemTodo.length === 0 && oldItemTodo.length > 0 ? 0 : afterNetAmt?.toFixed(2),
    });
  };

  //invoice
  const [HeaderOptionsButton, setHeaderOptionsButton] = useState(false);
  const [refImageBill, setRefImageBill] = useState([]);
  const [refImageBillFileNames, setRefImageBillFileNames] = useState([]);
  // letter headd options
  const HeaderDropDowns = [
    { label: 'With Letter Head', value: 'With Letter Head' },
    { label: 'Without Letter Head', value: 'Without Letter Head' },
  ];
  const WithHeaderOptions = [
    { value: 'With Head content', label: 'With Head content' },
    { value: 'With Footer content', label: 'With Footer content' },
  ];
  const [imgName, setImgName] = useState([]);
  const [imgArray, setImgArray] = useState([]);

  const generatePDF = async (mode, headerOptions) => {
    setHeaderOptionsButton(true);
    const header = document.getElementById('pdf-header-section');
    const content = document.getElementById('pdf-content-section');
    const footer = document.getElementById('pdf-footer-section');

    if (!header || !content || !footer) return;

    const waitForImages = async (element) => {
      const imgs = element.querySelectorAll('img');
      await Promise.all(
        Array.from(imgs).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve();
              else {
                img.onload = resolve;
                img.onerror = resolve;
              }
            })
        )
      );
    };

    await Promise.all([waitForImages(header), waitForImages(content), waitForImages(footer)]);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const [headerCanvas, contentCanvas, footerCanvas] = await Promise.all([
      html2canvas(header, { scale: 1.5, useCORS: true, backgroundColor: '#fff' }),
      html2canvas(content, { scale: 1.5, useCORS: true, backgroundColor: '#fff' }),
      html2canvas(footer, { scale: 1.5, useCORS: true, backgroundColor: '#fff' }),
    ]);

    const headerImg = headerCanvas.toDataURL('image/png');
    const footerImg = footerCanvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const headerHeightMM = 25;
    const footerHeightMM = 18;
    const contentAreaHeightMM = pdfHeight - headerHeightMM - footerHeightMM;

    // scale: px/mm ratio
    const pxPerMM = contentCanvas.height / ((contentCanvas.height * pdfWidth) / contentCanvas.width);
    const pageCanvasHeightPx = contentAreaHeightMM * pxPerMM;

    let renderedHeight = 0;
    let page = 1;

    const marginTop = 10;     // space between header and content
    const marginBottom = 5;  // space between content and footer
    const marginLeft = 10;    // left margin
    const marginRight = 10;   // right margin

    // match your layout
    const headerX = 5;              // 5mm from left
    const headerY = 3.5;            // 3.5mm from top
    const headerWidth = pdfWidth * 0.95;  // 95% width
    const headerHeight = 27;        // roughly 9% of A4 (9% of 297 ≈ 26.7mm)

    const footerX = 5;
    const footerY = pdfHeight - 5 - 20;  // bottom: 5mm margin + height ≈ 20mm
    const footerWidth = pdfWidth * 0.95;
    const footerHeight = 20;        // roughly 6.7% of A4 (6.7% of 297 ≈ 20mm)


    while (renderedHeight < contentCanvas.height) {
      // create slice canvas
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = contentCanvas.width;
      pageCanvas.height = Math.min(pageCanvasHeightPx, contentCanvas.height - renderedHeight);

      const ctx = pageCanvas.getContext('2d');
      ctx.drawImage(contentCanvas, 0, renderedHeight, contentCanvas.width, pageCanvas.height, 0, 0, contentCanvas.width, pageCanvas.height);

      const pageImg = pageCanvas.toDataURL('image/png');

      if (page > 1) pdf.addPage();

      // // old
      // // --- HEADER ---
      // if (headerOptions === 'With Letter Head') {
      //   pdf.addImage(headerImg, 'PNG', 5, 5, pdfWidth * 0.95, 20, undefined, 'FAST');
      // } else {
      //   pdf.setFillColor(255, 255, 255);
      //   pdf.rect(0, 0, pdfWidth, headerHeightMM, 'F');
      // }

      // console.log(headerHeightMM, pdfWidth)
      // // --- CONTENT ---
      // // const imgHeightMM = (pageCanvas.height * pdfWidth) / contentCanvas.width;
      // // pdf.addImage(pageImg, 'PNG', 0, headerHeightMM + 10, pdfWidth, imgHeightMM, undefined, 'MEDIUM');

      // // --- CONTENT WITH MARGINS ---
      // const imgWidthMM = pdfWidth - marginLeft - marginRight;
      // const imgHeightMM = (pageCanvas.height * imgWidthMM) / contentCanvas.width;

      // // Start drawing below header + marginTop
      // const contentStartY = headerHeightMM + marginTop;

      // // Keep image inside left/right margins
      // pdf.addImage(
      //   pageImg,
      //   'PNG',
      //   marginLeft,          // X position
      //   contentStartY,       // Y position
      //   imgWidthMM,          // width within margins
      //   imgHeightMM,         // scaled height
      //   undefined,
      //   'MEDIUM'
      // );

      // // --- FOOTER ---
      // const footerY = pdfHeight - footerHeightMM;
      // if (headerOptions === 'With Letter Head') {
      //   pdf.addImage(footerImg, 'PNG', 5, footerY - 3, pdfWidth * 0.95, 15, undefined, 'FAST');
      // } else {
      //   pdf.setFillColor(255, 255, 255);
      //   pdf.rect(0, footerY, pdfWidth, footerHeightMM, 'F');
      // }

      // new
      // --- HEADER ---
      if (headerOptions === 'With Letter Head') {
        pdf.addImage(headerImg, 'PNG', headerX, headerY, headerWidth, headerHeight, undefined, 'FAST');
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, headerHeight, 'F');
      }

      // --- CONTENT WITH MARGINS ---
      const imgWidthMM = pdfWidth - marginLeft - marginRight;
      const imgHeightMM = (pageCanvas.height * imgWidthMM) / contentCanvas.width;
      const contentStartY = headerY + headerHeight + marginTop;
      const contentMaxY = footerY - marginBottom;
      const availableContentHeight = contentMaxY - contentStartY;
      pdf.addImage(
        pageImg,
        'PNG',
        marginLeft,
        contentStartY,
        imgWidthMM,
        imgHeightMM,
        undefined,
        'MEDIUM'
      );

      // new
      // --- FOOTER ---
      if (headerOptions === 'With Letter Head') {
        pdf.addImage(footerImg, 'PNG', footerX, footerY, footerWidth, footerHeight, undefined, 'FAST');
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, footerY, pdfWidth, footerHeight, 'F');
      }

      renderedHeight += pageCanvasHeightPx;
      page++;
    }

    await generateQrCode();

    // --- PAGE NUMBERS ---
    const totalPages = pdf.internal.getNumberOfPages();
    pdf.setFontSize(9);
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      //old
      // pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - footerHeightMM - 5, { align: 'center' });
      //new
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        footerY + footerHeight - 23, // 3mm above the footer’s bottom edge
        { align: 'center' }
      );

    }

    if (mode === 'download') {
      // pdf.save(`Invoice_${manageSalesCommon.billno || 'Bill'}.pdf`);
      pdf.save(`Invoice_${isAuto === true ? manageSalesCommon.billno : billNoAuto || 'Bill'}.pdf`);
    } else {
      // const pdfBlob = pdf.output('blob');
      const pdfBlob = pdf.output('blob', { compress: true });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    }
    setHeaderOptionsButton(false);
  };


  const generatePDFForSave = async (headerOptions, uniqueId) => {
    const header = document.getElementById('pdf-header-section');
    const content = document.getElementById('pdf-content-section');
    const footer = document.getElementById('pdf-footer-section');

    if (!header || !content || !footer) return;

    const waitForImages = async (element) => {
      const imgs = element.querySelectorAll('img');
      await Promise.all(
        Array.from(imgs).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve();
              else {
                img.onload = resolve;
                img.onerror = resolve;
              }
            })
        )
      );
    };

    await Promise.all([waitForImages(header), waitForImages(content), waitForImages(footer)]);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const [headerCanvas, contentCanvas, footerCanvas] = await Promise.all([
      html2canvas(header, { scale: 1.5, useCORS: true, backgroundColor: '#fff' }),
      html2canvas(content, { scale: 1.5, useCORS: true, backgroundColor: '#fff' }),
      html2canvas(footer, { scale: 1.5, useCORS: true, backgroundColor: '#fff' }),
    ]);

    const headerImg = headerCanvas.toDataURL('image/png');
    const footerImg = footerCanvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const headerHeightMM = 25;
    const footerHeightMM = 18;
    const contentAreaHeightMM = pdfHeight - headerHeightMM - footerHeightMM;

    // scale: px/mm ratio
    const pxPerMM = contentCanvas.height / ((contentCanvas.height * pdfWidth) / contentCanvas.width);
    const pageCanvasHeightPx = contentAreaHeightMM * pxPerMM;

    let renderedHeight = 0;
    let page = 1;

    while (renderedHeight < contentCanvas.height) {
      // create slice canvas
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = contentCanvas.width;
      pageCanvas.height = Math.min(pageCanvasHeightPx, contentCanvas.height - renderedHeight);

      const ctx = pageCanvas.getContext('2d');
      ctx.drawImage(contentCanvas, 0, renderedHeight, contentCanvas.width, pageCanvas.height, 0, 0, contentCanvas.width, pageCanvas.height);

      const pageImg = pageCanvas.toDataURL('image/png');

      if (page > 1) pdf.addPage();

      // --- HEADER ---
      if (headerOptions === 'With Letter Head') {
        pdf.addImage(headerImg, 'PNG', 5, 5, pdfWidth * 0.95, 20, undefined, 'FAST');
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, headerHeightMM, 'F');
      }

      // --- CONTENT ---
      const imgHeightMM = (pageCanvas.height * pdfWidth) / contentCanvas.width;
      pdf.addImage(pageImg, 'PNG', 0, headerHeightMM, pdfWidth, imgHeightMM, undefined, 'MEDIUM');

      // --- FOOTER ---
      const footerY = pdfHeight - footerHeightMM;
      if (headerOptions === 'With Letter Head') {
        pdf.addImage(footerImg, 'PNG', 5, footerY - 3, pdfWidth * 0.95, 15, undefined, 'FAST');
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, footerY, pdfWidth, footerHeightMM, 'F');
      }

      renderedHeight += pageCanvasHeightPx;
      page++;
    }

    await generateQrCode();

    // --- PAGE NUMBERS ---
    const totalPages = pdf.internal.getNumberOfPages();
    pdf.setFontSize(9);
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - footerHeightMM - 5, { align: 'center' });
    }

    const pdfBlob = pdf.output('blob', { compress: true });

    const fileName = `Invoice_${isAuto === true ? manageSalesCommon.billno : billNoAuto || 'Bill'}.pdf`;
    const safeFileName = fileName.replace(/[\/\\:]/g, '_');
    const pdfFile = new File([pdfBlob], safeFileName, {
      type: 'application/pdf',
      lastModified: Date.now(),
    });

    // console.log(pdfFile); // 🔍 check size/type/name
    // --- Validate & Convert ---
    if (pdfFile.type !== 'application/pdf') {
      setPopupContentMalert('Only Accept Images or PDF!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
      return;
    }

    if (pdfFile.size > 5 * 1024 * 1024) {
      setPopupContentMalert('File size should be less than 5MB!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = btoa(
        new Uint8Array(reader.result).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const newSelectedFiles = [
        {
          name: safeFileName,
          size: pdfFile.size,
          type: pdfFile.type,
          preview: null,
          base64: base64String,
        },
      ];

      setImgArray([...newSelectedFiles]);
      setImgName(newSelectedFiles.map((d) => d.name));

      await handleFileUpload(newSelectedFiles, 'invoice', uniqueId);
    };

    reader.readAsArrayBuffer(pdfFile);
  };

  const handlePrintingLayout = () => {
    if (headerOptions === 'Please Select Print Options') {
      setPrintLayout(false);
      // setButtonLoadingPreview(false);
      setPopupContentMalert('Please Select Print Options!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (headerOptions === 'With Letter Head' && selectedHeadOpt?.length < 1) {
      setPrintLayout(true);
      setPopupContentMalert('Please Select With Letter Head!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      // setPrintLayout(true);
      setIsLetterHeadPopup(false);
      // console.log(header, 'header', footer, 'footer');
    }
  };


  const handleInputChange = (event) => {
    const files = event.target.files;
    let newSelectedFiles = [...refImageBill];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Allow images and PDFs
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        if (file.size <= 5 * 1024 * 1024) {
          const reader = new FileReader();

          // If PDF, read as ArrayBuffer instead of DataURL
          if (file.type === 'application/pdf') {
            reader.onload = () => {
              const base64String = btoa(new Uint8Array(reader.result).reduce((data, byte) => data + String.fromCharCode(byte), ''));

              newSelectedFiles.push({
                name: file.name,
                size: file.size,
                type: file.type,
                preview: null, // no preview for pdf
                base64: base64String,
              });

              setRefImageBill([...newSelectedFiles]);
              setRefImageBillFileNames(newSelectedFiles.map((d) => d.name));
            };
            reader.readAsArrayBuffer(file);
          } else {
            // For images
            reader.onload = () => {
              newSelectedFiles.push({
                name: file.name,
                size: file.size,
                type: file.type,
                preview: reader.result,
                base64: reader.result.split(',')[1],
              });

              setRefImageBill([...newSelectedFiles]);
              setRefImageBillFileNames(newSelectedFiles.map((d) => d.name));
            };
            reader.readAsDataURL(file);
          }
        } else {
          setPopupContentMalert('File size should be less than 5MB!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
        }
      } else {
        setPopupContentMalert('Only Accept Images or PDF!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      }
    }
  };

  const base64ToFile = (base64, fileName, mimeType) => {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], fileName, { type: mimeType });
  };


  const handleFileUpload = async (selectedFilesall, type, uniqueId) => {
    try {
      // Convert objects with base64 into real File objects
      let selectedFiles = selectedFilesall.map((f) => {
        if (f.base64) {
          return base64ToFile(f.base64, f.name, f.type);
        }
        return f; // already a File
      });

      // console.log(selectedFiles, 'converted selectedFiles');

      const uploadFiles = async () => {
        for (const selectedFile of selectedFiles) {
          const chunkSize = 5 * 1024 * 1024; // 5MB
          const totalChunks = Math.ceil(selectedFile.size / chunkSize);
          // console.log(selectedFile, 'inside for loop (real File now)');

          let chunkNumber = 0;
          let start = 0;

          while (start < selectedFile.size) {
            const end = Math.min(start + chunkSize, selectedFile.size);
            const chunk = selectedFile.slice(start, end, selectedFile.type);

            const formData = new FormData();
            formData.append('file', chunk);
            formData.append('chunkNumber', chunkNumber);
            formData.append('totalChunks', totalChunks);
            formData.append('filesize', selectedFile.size);
            formData.append('originalname', `${uniqueId}$${type}$${selectedFile.name}`);

            try {
              await axios.post(SERVICE.UPLOAD_CHUNK_MANAGESALES_BILLS, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });

              // console.log(`Chunk ${chunkNumber + 1}/${totalChunks} uploaded for ${selectedFile.name}`);
            } catch (err) {
              console.error('Chunk upload failed:', err);
              handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
              return; // Stop this file on error
            }

            start = end;
            chunkNumber++;
          }

          // console.log(`File upload completed for ${selectedFile.name}`);
        }
      };

      await uploadFiles();
      // console.log("All file uploads completed");
    } catch (err) {
      console.error('File upload error:', err);
    }
  };


  //add function
  const sendRequest = async () => {
    setPageName(!pageName);
    setIsBtn(true);
 const uniqueId = uuidv4();
    try {
      await generatePDFForSave(headerOptions, uniqueId);

      let subprojectscreate = await axios.post(SERVICE.MANAGESALES_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: String(manageSalesCommon.company),
        branch: String(manageSalesCommon.branch),
        customername: String(manageSalesCommon?.isNewCusValue === false ? manageSalesCommon.customername : manageSalesCommon.customername?.split('_')[0]),
        customeraddress: String(manageSalesCommon?.isNewCusValue === false ? manageSalesCommon.customeraddress : manageSalesCommon.customeraddress),
        customercontactprefix: String(manageSalesCommon?.isNewCusValue === false ? manageSalesCommon.customercontactprefix : manageSalesCommon.customercontactprefix),
        customercontact: String(manageSalesCommon?.isNewCusValue === false ? manageSalesCommon.customercontact : manageSalesCommon.customercontact),
        date: String(manageSalesCommon.date),
        hours: String(manageSalesCommon.hours),
        minutes: String(manageSalesCommon.minutes),
        time: String(manageSalesCommon.time),
        formattedtime: String(`${manageSalesCommon.hours}:${manageSalesCommon.minutes} ${manageSalesCommon.time}`),
        billno: String(isAuto === true ? manageSalesCommon.billno : billNoAuto),
        salesid: String(manageSalesCommon.salesid ? manageSalesCommon.salesid : allUsersLimit[0].companyname.trim()),
        bnoteno: String(isNewBNote?.isNewValue === false ? isNewBNote.bnoteno : manageSalesCommon.bnoteno),
        // bnoteno: String(isNewCusDetails?.isNewCusValue  === false ? isNewCusDetails.bnoteno : manageSalesCommon.bnoteno),
        salesitems: [...salesItemTodo],
        olditems: [...oldItemTodo],
        totalsalespieces: String(manageSalesCommon.totalsalespieces),
        totalsalesweight: String(manageSalesCommon.totalsalesweight),
        totalmcdiscount: String(manageSalesCommon.totalmcdiscount),
        totalsalesgrosswithoutdiscount: String(manageSalesCommon.totalsalesgrosswithoutdiscount),
        saleslesstype: String(manageSalesCommon.saleslesstype),
        salesless: String(manageSalesCommon.salesless),
        totalsalesgross: String(manageSalesCommon.totalsalesgross),
        totalsalescgstper: String(manageSalesCommon.totalsalescgstper),
        totalsalessgstper: String(manageSalesCommon.totalsalessgstper),
        totalsalescgst: String(manageSalesCommon.totalsalescgst),
        totalsalessgst: String(manageSalesCommon.totalsalessgst),
        totalsalesamount: String(manageSalesCommon.totalsalesamount),
        totaloldpieces: String(manageSalesCommon.totaloldpieces),
        totaloldweight: String(manageSalesCommon.totaloldweight),
        totalwastagediscount: String(manageSalesCommon.totalwastagediscount),
        totaloldgrosswithoutdiscount: String(manageSalesCommon.totaloldgrosswithoutdiscount),
        oldlesstype: String(manageSalesCommon.oldlesstype),
        oldless: String(manageSalesCommon.oldless),
        totaloldgross: String(manageSalesCommon.totaloldgross),
        totaloldcgstper: String(manageSalesCommon.totaloldcgstper),
        totaloldsgstper: String(manageSalesCommon.totaloldsgstper),
        totaloldcgst: String(manageSalesCommon.totaloldcgst),
        totaloldsgst: String(manageSalesCommon.totaloldsgst),
        totaloldamount: String(manageSalesCommon.totaloldamount),
        netamountwithoutdis: String(manageSalesCommon.netamountwithoutdis),
        overalllesstype: String(manageSalesCommon.overalllesstype),
        overallless: String(manageSalesCommon.overallless),
        netamount: String(manageSalesCommon.netamount),
        remarks: String(manageSalesCommon.remarks),
        paymentstatus: String('Unpaid'),
        deliverystatus: String('Not Delivered'),
        modeofpayments: String(manageSalesCommon.modeofpayments),
        cash: String(manageSalesCommon.cash),
        balanceamount: Number(manageSalesCommon.balanceamount)?.toFixed(2),
        bankname: String(manageSalesCommon.bankname),
        bankbranchname: String(manageSalesCommon.bankbranchname),
        accountholdername: String(manageSalesCommon.accountholdername),
        accountnumber: String(manageSalesCommon.accountnumber),
        ifsccode: String(manageSalesCommon.ifsccode),
        upinumber: String(manageSalesCommon.upinumber),
        cardtype: String(manageSalesCommon.cardtype),
        cardoptions: String(manageSalesCommon.cardoptions),
        othercardname: String(manageSalesCommon.othercardname),
        cardnumber: String(manageSalesCommon.cardnumber),
        cardholdername: String(manageSalesCommon.cardholdername),
        cardtransactionnumber: String(manageSalesCommon.cardtransactionnumber),
          uniqueId: uniqueId,
        // cardmonth: String(manageSalesCommon.cardmonth),
        // cardyear: String(manageSalesCommon.cardyear),
        // cardsecuritycode: String(manageSalesCommon.cardsecuritycode),
        chequenumber: String(manageSalesCommon.chequenumber),
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            // date: String(new Date(serverTime)),
          },
        ],
      });
      // await fetchAllManageSalesForAutoId();
      await fetchAllManageSalesForAutoIdOnchange();
      await handleFileUpload(refImageBill, 'todo', uniqueId);

      // await fetchAllManageSalesForLastBillNo(branchString, prodString);
      // const res_item = await axios.post(SERVICE.ITEMMASTER_BASED_ON_PRODUCTTYPE_FILTER_FOR_SALES, {
      //   headers: { Authorization: `Bearer ${auth.APIToken}` },
      //   producttype: manageSalesCommon.prodmastertype,
      // });
      // setSalesItemParticularsOpt(res_item?.data?.products);
      setManageSalesCommon({
        ...manageSalesCommon,
        // company: 'Please Select Company', branch: 'Please Select Branch', prodmastertype: '',
        isInvoice: false,
        customername: '',
        customeraddress: 'TRICHY',
        customercontactprefix: '+91',
        customercontact: '',
        date: today,
        hours: hours,
        minutes: minutes,
        time: ampm,
        billno: `${branchString}/${prodString}/`,
        salesid: '',
        bnoteno: 'Please Select Bnote No',
        overalllesstype: 'Fixed',
        overallless: '0',
        totalsalespieces: 0,
        totalsalesweight: 0,
        totalmcdiscount: 0,
        totalsalesgross: 0,
        totalsalescgstper: 0,
        totalsalessgstper: 0,
        totalsalescgst: 0,
        totalsalessgst: 0,
        totalsalesamount: 0,
        totaloldpieces: 0,
        totaloldweight: 0,
        totalwastagediscount: 0,
        totaloldgross: 0,
        totaloldcgstper: 0,
        totaloldsgstper: 0,
        totaloldcgst: 0,
        totaloldsgst: 0,
        totaloldamount: 0,
        netamountwithoutdis: 0,
        netamount: 0,
        remarks: '',
        modeofpayments: 'Please Select Mode of Payments',
        cash: '0',
        balanceamount: '0',
        bankname: 'Please Select Bank Name',
        bankbranchname: '',
        accountholdername: '',
        accountnumber: '',
        ifsccode: '',
        upinumber: '',
        cardtype: 'Please Select Card Type',
        cardoptions: 'Please Select Card Options',
        othercardname: '',
        cardnumber: '',
        cardholdername: '',
        cardtransactionnumber: '',
        cardmonth: 'Month',
        cardyear: 'Year',
        cardsecuritycode: '',
        chequenumber: '',
        totalsalesgrosswithoutdiscount: '0',
        saleslesstype: 'Fixed',
        salesless: '0',
        totaloldgrosswithoutdiscount: '0',
        oldlesstype: 'Fixed',
        oldless: '0',
      });
      setManageSalesItem({
        ...manageSalesItem,
        productname: 'Please Select Product Name',
        productcode: '',
        producttype: '',
        productsize: '',
        productgst: '',
        productitemcoderunningnumber: '',
        hsn: '',
        pieces: 1,
        weight: '',
        rate: '',
        value: '',
        makingchargemode: '',
        originalmc: '',
        mcgramamount: '0',
        makingcharge: '0',
        mc: '',
        lesstype: 'Fixed',
        less: '0',
        grossamount: '',
        cgstper: '0',
        sgstper: '0',
        cgst: '',
        sgst: '',
        salestype: '',
        salesamount: '',
      });
      setManageOldItem({
        ...manageOldItem,
        productname: 'Please Select Product Name',
        productcode: '',
        producttype: '',
        productsize: '',
        productgst: '',
        bnoteno: 'TRI/S/',
        hsn: '',
        pieces: 1,
        originalweight: '0.000',
        stoneweight: '0.000',
        correctweight: '0.000',
        waste: '',
        olddefaultwastage: 0,
        oldminimumwastage: 0,
        oldmaximumwastage: 0,
        wastediscount: '0',
        actualweight: '',
        rate: '',
        value: '',
        grossamount: '',
        cgstper: '0',
        sgstper: '0',
        cgst: '',
        sgst: '',
        salestype: '',
        boughtnoteamount: '',
        status: '',
      });
      setIsNewCusDetails({ ...isNewCusDetails, isNewCusValue: false, customername: '', customeraddress: 'TRICHY', customercontactprefix: '+91', customercontact: '', bnoteprefix: 'TRI/S/', bnoteno: 'TRI/S/' });
      setSalesItemTodo([]);
      setOldItemTodo([]);
      setInvoiceOptions([]);
      setIsAddNew(false);
      setPageManageSales(1);
      setPageSizeManageSales(10);
      setPopupContent('Added Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
      setIsBtn(false);
    } catch (err) {
      setIsBtn(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const sendAnotherRequest = async () => {
    setPageName(!pageName);
    setIsBtn(true);
     const uniqueId = uuidv4();

    try {
      await generatePDFForSave(headerOptions, uniqueId);

      let subprojectscreate = await axios.post(SERVICE.MANAGESALES_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: String(manageSalesCommon.company),
        branch: String(manageSalesCommon.branch),
        customername: String(manageSalesCommon?.isNewCusValue === false ? manageSalesCommon.customername : manageSalesCommon.customername?.split('_')[0]),
        customeraddress: String(manageSalesCommon?.isNewCusValue === false ? manageSalesCommon.customeraddress : manageSalesCommon.customeraddress),
        customercontactprefix: String(manageSalesCommon?.isNewCusValue === false ? manageSalesCommon.customercontactprefix : manageSalesCommon.customercontactprefix),
        customercontact: String(manageSalesCommon?.isNewCusValue === false ? manageSalesCommon.customercontact : manageSalesCommon.customercontact),
        date: String(manageSalesCommon.date),
        hours: String(manageSalesCommon.hours),
        minutes: String(manageSalesCommon.minutes),
        time: String(manageSalesCommon.time),
        formattedtime: String(`${manageSalesCommon.hours}:${manageSalesCommon.minutes} ${manageSalesCommon.time}`),
        billno: String(isAuto === true ? manageSalesCommon.billno : billNoAuto),
        salesid: String(manageSalesCommon.salesid ? manageSalesCommon.salesid : allUsersLimit[0].companyname.trim()),
        bnoteno: String(isNewBNote?.isNewValue === false ? isNewBNote.bnoteno : manageSalesCommon.bnoteno),
        // bnoteno: String(isNewCusDetails?.isNewCusValue  === false ? isNewCusDetails.bnoteno : manageSalesCommon.bnoteno),
        salesitems: [...salesItemTodo],
        olditems: [...oldItemTodo],
        totalsalespieces: String(manageSalesCommon.totalsalespieces),
        totalsalesweight: String(manageSalesCommon.totalsalesweight),
        totalmcdiscount: String(manageSalesCommon.totalmcdiscount),
        totalsalesgrosswithoutdiscount: String(manageSalesCommon.totalsalesgrosswithoutdiscount),
        saleslesstype: String(manageSalesCommon.saleslesstype),
        salesless: String(manageSalesCommon.salesless),
        totalsalesgross: String(manageSalesCommon.totalsalesgross),
        totalsalescgstper: String(manageSalesCommon.totalsalescgstper),
        totalsalessgstper: String(manageSalesCommon.totalsalessgstper),
        totalsalescgst: String(manageSalesCommon.totalsalescgst),
        totalsalessgst: String(manageSalesCommon.totalsalessgst),
        totalsalesamount: String(manageSalesCommon.totalsalesamount),
        totaloldpieces: String(manageSalesCommon.totaloldpieces),
        totaloldweight: String(manageSalesCommon.totaloldweight),
        totalwastagediscount: String(manageSalesCommon.totalwastagediscount),
        totaloldgrosswithoutdiscount: String(manageSalesCommon.totaloldgrosswithoutdiscount),
        oldlesstype: String(manageSalesCommon.oldlesstype),
        oldless: String(manageSalesCommon.oldless),
        totaloldgross: String(manageSalesCommon.totaloldgross),
        totaloldcgstper: String(manageSalesCommon.totaloldcgstper),
        totaloldsgstper: String(manageSalesCommon.totaloldsgstper),
        totaloldcgst: String(manageSalesCommon.totaloldcgst),
        totaloldsgst: String(manageSalesCommon.totaloldsgst),
        totaloldamount: String(manageSalesCommon.totaloldamount),
        netamountwithoutdis: String(manageSalesCommon.netamountwithoutdis),
        overalllesstype: String(manageSalesCommon.overalllesstype),
        overallless: String(manageSalesCommon.overallless),
        netamount: String(manageSalesCommon.netamount),
        remarks: String(manageSalesCommon.remarks),
        paymentstatus: String('Unpaid'),
        deliverystatus: String('Not Delivered'),
        modeofpayments: String(manageSalesCommon.modeofpayments),
        cash: String(manageSalesCommon.cash),
        balanceamount: Number(manageSalesCommon.balanceamount)?.toFixed(2),
        bankname: String(manageSalesCommon.bankname),
        bankbranchname: String(manageSalesCommon.bankbranchname),
        accountholdername: String(manageSalesCommon.accountholdername),
        accountnumber: String(manageSalesCommon.accountnumber),
        ifsccode: String(manageSalesCommon.ifsccode),
        upinumber: String(manageSalesCommon.upinumber),
        cardtype: String(manageSalesCommon.cardtype),
        cardoptions: String(manageSalesCommon.cardoptions),
        othercardname: String(manageSalesCommon.othercardname),
        cardnumber: String(manageSalesCommon.cardnumber),
        cardholdername: String(manageSalesCommon.cardholdername),
        cardtransactionnumber: String(manageSalesCommon.cardtransactionnumber),
        // cardmonth: String(manageSalesCommon.cardmonth),
        // cardyear: String(manageSalesCommon.cardyear),
        // cardsecuritycode: String(manageSalesCommon.cardsecuritycode),
        chequenumber: String(manageSalesCommon.chequenumber),
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            // date: String(new Date(serverTime)),
          },
        ],
      });
      // await fetchAllManageSalesForAutoId();
      await fetchAllManageSalesForAutoIdOnchange(branchString, prodString);
      await fetchAllManageSalesForLastBillNo(branchString, prodString);
      const res_item = await axios.post(SERVICE.ITEMMASTER_BASED_ON_PRODUCTTYPE_FILTER_FOR_SALES, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
        producttype: manageSalesCommon.prodmastertype,
      });
      setSalesItemParticularsOpt(res_item?.data?.products);
      setManageSalesCommon({
        ...manageSalesCommon,
        // company: 'Please Select Company', branch: 'Please Select Branch', prodmastertype: '',
        isInvoice: false,
        billno: `${branchString}/${prodString}/`,
        bnoteno: 'Please Select Bnote No',
        overalllesstype: 'Fixed',
        overallless: '0',
        totalsalespieces: 0,
        totalsalesweight: 0,
        totalmcdiscount: 0,
        totalsalesgross: 0,
        totalsalescgstper: 0,
        totalsalessgstper: 0,
        totalsalescgst: 0,
        totalsalessgst: 0,
        totalsalesamount: 0,
        totaloldpieces: 0,
        totaloldweight: 0,
        totalwastagediscount: 0,
        totaloldgross: 0,
        totaloldcgstper: 0,
        totaloldsgstper: 0,
        totaloldcgst: 0,
        totaloldsgst: 0,
        totaloldamount: 0,
        netamountwithoutdis: 0,
        netamount: 0,
        remarks: '',
        modeofpayments: 'Please Select Mode of Payments',
        cash: '0',
        balanceamount: '0',
        bankname: 'Please Select Bank Name',
        bankbranchname: '',
        accountholdername: '',
        accountnumber: '',
        ifsccode: '',
        upinumber: '',
        cardtype: 'Please Select Card Type',
        cardoptions: 'Please Select Card Options',
        othercardname: '',
        cardnumber: '',
        cardholdername: '',
        cardtransactionnumber: '',
        cardmonth: 'Month',
        cardyear: 'Year',
        cardsecuritycode: '',
        chequenumber: '',
        totalsalesgrosswithoutdiscount: '0',
        saleslesstype: 'Fixed',
        salesless: '0',
        totaloldgrosswithoutdiscount: '0',
        oldlesstype: 'Fixed',
        oldless: '0',
      });
      setManageSalesItem({
        ...manageSalesItem,
        productname: 'Please Select Product Name',
        productcode: '',
        producttype: '',
        productsize: '',
        productgst: '',
        productitemcoderunningnumber: '',
        hsn: '',
        pieces: 1,
        weight: '',
        rate: '',
        value: '',
        makingchargemode: '',
        originalmc: '',
        mcgramamount: '0',
        makingcharge: '0',
        mc: '',
        lesstype: 'Fixed',
        less: '0',
        grossamount: '',
        cgstper: '0',
        sgstper: '0',
        cgst: '',
        sgst: '',
        salestype: '',
        salesamount: '',
      });
      setManageOldItem({
        ...manageOldItem,
        productname: 'Please Select Product Name',
        productcode: '',
        producttype: '',
        productsize: '',
        productgst: '',
        bnoteno: 'TRI/S/',
        hsn: '',
        pieces: 1,
        originalweight: '0.000',
        stoneweight: '0.000',
        correctweight: '0.000',
        waste: '',
        olddefaultwastage: 0,
        oldminimumwastage: 0,
        oldmaximumwastage: 0,
        wastediscount: '0',
        actualweight: '',
        rate: '',
        value: '',
        grossamount: '',
        cgstper: '0',
        sgstper: '0',
        cgst: '',
        sgst: '',
        salestype: '',
        boughtnoteamount: '',
        status: '',
      });
      // setIsNewCusDetails({
      //   ...isNewCusDetails,
      //   // isNewCusValue: false, customername: '', customeraddress: 'TRICHY', customercontactprefix: '+91', customercontact: '',
      //   // bnoteprefix: 'TRI/S/', bnoteno: 'TRI/S/'
      // });
      setSalesItemTodo([]);
      setOldItemTodo([]);
      setPageManageSales(1);
      setPageSizeManageSales(10);
      setPopupContent('Added Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
      setIsBtn(false);
    } catch (err) {
      setIsBtn(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const sendBnoteRequest = async () => {
    setPageName(!pageName);
    try {
      const serverTime = await getCurrentServerTime();
      const today = new Date(serverTime);
      // Extract hours and minutes
      let hours = today.getHours();
      let minutes = today.getMinutes();

      // Convert to 12-hour format
      let ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12

      // Format with leading zero if needed
      hours = String(hours).padStart(2, '0');
      minutes = String(minutes).padStart(2, '0');

      let grpcreate = await axios.post(SERVICE.OSBOUGHTNOTE_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        customername: String(manageSalesCommon.customername),
        customercontactprefix: String(manageSalesCommon.customercontactprefix),
        customercontact: String(manageSalesCommon.customercontact),
        date: String(manageSalesCommon.date),
        hours: String(hours),
        minutes: String(minutes),
        time: String(ampm),
        formattedtime: String(`${hours}:${minutes} ${ampm}`),
        // invoiceno: String(`${isNewCusDetails.bnoteprefix}${isNewCusDetails.bnoteno}`),
        invoiceno: String(manageSalesCommon.isInvoice === true && isNewBNote?.isNewValue === false ? isNewBNote.bnoteno : manageSalesCommon.bnoteno === 'Please Select Bnote No' ? '' : manageSalesCommon.bnoteno),
        olditems: [...addedNewOldItem],
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            // date: String(new Date()),
          },
        ],
      });
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //submit option for saving
  const handleSubmit = async (e) => {
    e.preventDefault();

    // let res_grp = await axios.get(SERVICE.OSBOUGHTNOTE, {
    //   headers: {
    //     Authorization: `Bearer ${auth.APIToken}`,
    //   },
    // });
    // const allOsBoughtNote = res_grp?.data?.osboughtnotes;
    // const isInvoiceMatch = allOsBoughtNote.some((item) => manageSalesCommon.isInvoice === true && isNewBNote?.isNewValue === false && item.invoiceno === manageOldItem.bnoteno);

    let res_sales = await axios.get(SERVICE.MANAGESALES, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });
    const allManageSales = res_sales?.data?.managesales;
    const isBillNoMatch = allManageSales.some((item) => isAuto === true && item.billno === manageSalesCommon.billno);

    const time = await getCurrentServerTime();
    const currentDate = new Date(time).toISOString().split('T')[0];
    // ✅ Contact number validation (must be exactly 10 digits)
    if (manageSalesCommon.customername !== "" && manageSalesCommon.customercontact === "") {
      setPopupContentMalert("Please Enter Customer Contact No!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      manageSalesCommon.customercontact &&
      !/^\d{10}$/.test(manageSalesCommon.customercontact)
    ) {
      setPopupContentMalert("Please enter a valid 10-digit contact number!");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.date === '') {
      setPopupContentMalert('Please Select Date');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.date > currentDate) {
      setPopupContentMalert('Future Date is restricted!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (isAuto === true && manageSalesCommon.billno === `${branchString}/${prodString}/`) {
      setPopupContentMalert('Please Enter Bill No');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.salesid === 'Please Select Sales Person') {
      setPopupContentMalert('Please Select Sales Person');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    }
    // else if (isNewCusDetails?.isNewCusValue === false && manageSalesCommon.bnoteno === 'Please Select Bnote No') {
    //   setPopupContentMalert('Please Select Bnote No');
    //   setPopupSeverityMalert('warning');
    //   handleClickOpenPopupMalert();
    // } else if (isNewCusDetails?.isNewCusValue === true && isNewCusDetails.bnoteno === '') {
    //   setPopupContentMalert('Please Enter Bnote No');
    //   setPopupSeverityMalert('warning');
    //   handleClickOpenPopupMalert();
    // }
    else if (manageSalesCommon.isInvoice === true && isNewBNote?.isNewValue === true && manageSalesCommon.bnoteno === 'Please Select Bnote No') {
      setPopupContentMalert('Please Select Bnote No');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.isInvoice === true && isNewBNote?.isNewValue === false && isNewBNote.bnoteno === 'TRI/S/') {
      setPopupContentMalert('Please Enter Bnote No');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (salesItemTodo.length === 0) {
      setPopupContentMalert('Please enter values in Sales Item to get Net Amount');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (salesItemTodo.length > 0 && oldItemTodo.length > 0 && manageSalesCommon.netamount === 0) {
      setPopupContentMalert('Please enter values in Sales Item or Old Item to get Total Amount');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    }
    else if (isBillNoMatch) {
      setPopupContentMalert('Bill No Already Exists!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    }
    //  else if (isInvoiceMatch) {
    //   setPopupContentMalert('Bnote No Already Exists!');
    //   setPopupSeverityMalert('warning');
    //   handleClickOpenPopupMalert();
    // } 
    else {
      sendRequest();
      // if (isNewCusDetails?.isNewCusValue  === false) {
      if (manageSalesCommon.isInvoice === true && isAddNew === true) {
        sendBnoteRequest();
      }
    }
  };

  const handleAnotherSubmit = async (e) => {
    e.preventDefault();

    let res_grp = await axios.get(SERVICE.OSBOUGHTNOTE, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });
    const allOsBoughtNote = res_grp?.data?.osboughtnotes;
    const isInvoiceMatch = allOsBoughtNote.some((item) => manageSalesCommon.isInvoice === true && isNewBNote?.isNewValue === false && item.invoiceno === manageOldItem.bnoteno);

    let res_sales = await axios.get(SERVICE.MANAGESALES, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });
    const allManageSales = res_sales?.data?.managesales;
    const isBillNoMatch = allManageSales.some((item) => isAuto === true && item.billno === manageSalesCommon.billno);

    const time = await getCurrentServerTime();
    const currentDate = new Date(time).toISOString().split('T')[0];

    if (manageSalesCommon.company === 'Please Select Company') {
      setPopupContentMalert('Please Select Company!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.branch === 'Please Select Branch') {
      setPopupContentMalert('Please Select Branch!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon?.isNewCusValue === true && manageSalesCommon.customername === '') {
      setPopupContentMalert('!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon?.isNewCusValue === false && manageSalesCommon.customername === '') {
      setPopupContentMalert('Please Enter Customer Name!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon?.isNewCusValue === false && manageSalesCommon.customeraddress === '') {
      setPopupContentMalert('Please Enter Customer Address!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon?.isNewCusValue === false && manageSalesCommon.customercontact === '') {
      setPopupContentMalert('Please Enter Customer Contact No!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.date === '') {
      setPopupContentMalert('Please Select Date');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.date > currentDate) {
      setPopupContentMalert('Future Date is restricted!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (isAuto === true && manageSalesCommon.billno === `${branchString}/${prodString}/`) {
      setPopupContentMalert('Please Enter Bill No');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.salesid === 'Please Select Sales Person') {
      setPopupContentMalert('Please Select Sales Person');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    }
    // else if (isNewCusDetails?.isNewCusValue === false && manageSalesCommon.bnoteno === 'Please Select Bnote No') {
    //   setPopupContentMalert('Please Select Bnote No');
    //   setPopupSeverityMalert('warning');
    //   handleClickOpenPopupMalert();
    // } else if (isNewCusDetails?.isNewCusValue === true && isNewCusDetails.bnoteno === '') {
    //   setPopupContentMalert('Please Enter Bnote No');
    //   setPopupSeverityMalert('warning');
    //   handleClickOpenPopupMalert();
    // }
    else if (manageSalesCommon.isInvoice === true && isNewBNote?.isNewValue === true && manageSalesCommon.bnoteno === 'Please Select Bnote No') {
      setPopupContentMalert('Please Select Bnote No');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (manageSalesCommon.isInvoice === true && isNewBNote?.isNewValue === false && isNewBNote.bnoteno === 'TRI/S/') {
      setPopupContentMalert('Please Enter Bnote No');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (salesItemTodo.length === 0 && oldItemTodo.length === 0) {
      setPopupContentMalert('Please enter values in Sales Item or Old Item to get Net Amount');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (salesItemTodo.length > 0 && oldItemTodo.length > 0 && manageSalesCommon.netamount === 0) {
      setPopupContentMalert('Please enter values in Sales Item or Old Item to get Net Amount');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (isBillNoMatch) {
      setPopupContentMalert('Bill No Already Exists!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (isInvoiceMatch) {
      setPopupContentMalert('Bnote No Already Exists!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else {
      sendAnotherRequest();
      // if (isNewCusDetails?.isNewCusValue  === false) {
      if (manageSalesCommon.isInvoice === true && isAddNew === true) {
        sendBnoteRequest();
      }
    }
  };

  const handleClear = (e) => {
    e.preventDefault();



    setManageSalesCommon({
      ...manageSalesCommon,
      customername: '',
      customercontactprefix: '+91',
      customercontact: '',
      date: today,
      hours: hours,
      minutes: minutes,
      time: ampm,
      totalsalesamount: 0,

    });
    setManageSalesItem({
      ...manageSalesItem,
      productname: 'Please Select Product Name',

      pieces: 1,
      weight: '',
      rate: '',
      value: '',
      salesamount: '',
    });


    setSalesItemTodo([]);

    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
  };

  ///list function

  useEffect(() => {
    const fetchTime = async () => {
      const time = await getCurrentServerTime();
      setServerTime(time);
      setFilterUser({ ...filterUser, filtertype: 'Product Type', fromdate: moment(time).format('YYYY-MM-DD'), todate: moment(time).format('YYYY-MM-DD') });
      setSelectedMode('Today');
    };

    fetchTime();
  }, []);

  var today = new Date(serverTime);
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;

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




  const [selectedCompany, setSelectedCompany] = useState([]);
  const [valueCompany, setValueCompany] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState([]);
  const [valueBranch, setValueBranch] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState([]);
  const [valueProductType, setValueProductType] = useState([]);
  const [overAllManageSales, setOverAllManageSales] = useState([]);
  const [manageSalesView, setManageSalesView] = useState({});


  const [filterUser, setFilterUser] = useState({ filtertype: 'Product Type', fromdate: today, todate: today });

  const [salesItemTodoView, setSalesItemTodoView] = useState([]);
  const [oldItemTodoView, setOldItemTodoView] = useState([]);
  const [salesTaxGroupsArrayView, setSalesTaxGroupsArrayView] = useState([]);
  const [oldTaxGroupsArrayView, setOldTaxGroupsArrayView] = useState([]);
  const [modeOfPayTodoView, setModeOfPayTodoView] = useState([]);
  const [refImageBillView, setRefImageBillView] = useState([]);
  const [refImageBillFileNamesView, setRefImageBillFileNamesView] = useState([]);
  const [getImg, setGetImg] = useState(null);
  const [file, setFile] = useState();

  // State to track advanced filter
  const [advancedFilter, setAdvancedFilter] = useState(null);
  const [additionalFilters, setAdditionalFilters] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const conditions = ['Contains', 'Does Not Contain', 'Equals', 'Does Not Equal', 'Begins With', 'Ends With', 'Blank', 'Not Blank']; // AgGrid-like conditions
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('Contains');
  const [logicOperator, setLogicOperator] = useState('AND');
  const [filterValue, setFilterValue] = useState('');


  const [totalProjects, setTotalProjects] = useState(0);
  const [filterdata, setFilterdata] = useState(false);
  const [forsearch, setForsearch] = useState(false);
  // pageManageSales refersh reload
  const [anchorElSearch, setAnchorElSearch] = React.useState(null);
  const handleClickSearch = (event) => {
    setAnchorElSearch(event.currentTarget);
    localStorage.removeItem('filterModel');
  };
  const handleCloseSearch = () => {
    setAnchorElSearch(null);
    setSearchQueryManageSales('');
  };
  const openSearch = Boolean(anchorElSearch);
  const idSearch = openSearch ? 'simple-popover' : undefined;

  const [selectedMode, setSelectedMode] = useState('Today');
  const mode = [
    { label: 'Today', value: 'Today' },
    { label: 'Tomorrow', value: 'Tomorrow' },
    { label: 'Yesterday', value: 'Yesterday' },
    { label: 'This Week', value: 'This Week' },
    { label: 'This Month', value: 'This Month' },
    { label: 'Last Week', value: 'Last Week' },
    { label: 'Last Month', value: 'Last Month' },
    { label: 'Custom', value: 'Custom' },
  ];



  //first allexcel....
  const getFileIconView = (fileName) => {
    const extension1 = fileName?.split('.').pop();
    switch (extension1) {
      case 'pdf':
        return pdfIcon;
      case 'doc':
      case 'docx':
        return wordIcon;
      case 'xls':
      case 'xlsx':
        return excelIcon;
      case 'csv':
        return csvIcon;
      default:
        return fileIcon;
    }
  };

  const getMultipleFilesAsObjects = async (filenames, type, uniqueId) => {
    const files = [];
    // console.log(filenames, type, uniqueId)

    for (const name of filenames) {
      const res = await axios.post(
        SERVICE.MANAGESALES_BILLS_IMAGE_FETCH,
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




  const getDateRange = (mode) => {
    const today = new Date(serverTime);
    let fromdate, todate;

    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    switch (mode) {
      case 'Today':
        fromdate = todate = formatDate(today);
        break;
      case 'Tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        fromdate = todate = formatDate(tomorrow);
        break;
      case 'Yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        fromdate = todate = formatDate(yesterday);
        break;
      case 'This Week':
        const startOfThisWeek = new Date(today);
        startOfThisWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday
        const endOfThisWeek = new Date(startOfThisWeek);
        endOfThisWeek.setDate(startOfThisWeek.getDate() + 6); // Sunday
        fromdate = formatDate(startOfThisWeek);
        todate = formatDate(endOfThisWeek);
        break;
      case 'This Month':
        fromdate = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
        todate = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
        break;
      case 'Last Week':
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7) - 7); // Last Monday
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6); // Last Sunday
        fromdate = formatDate(startOfLastWeek);
        todate = formatDate(endOfLastWeek);
        break;
      case 'Last Month':
        fromdate = formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)); // 1st of last month
        todate = formatDate(new Date(today.getFullYear(), today.getMonth(), 0)); // Last day of last month
        break;
      default:
        fromdate = todate = '';
    }

    return { fromdate, todate };
  };

  const formatDateForInput = (date) => {
    if (isNaN(date.getTime())) {
      return ''; // Return empty if the date is invalid
    }
    return date.toISOString().split('T')[0]; // Converts date to 'yyyy-MM-dd' format
  };

  // pageAttStatus refersh reload code


  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, []);



  useEffect(() => {
    fetchtProdType();
  }, []);

  //   // Pre select dropdowns
  //   useEffect(() => {
  //     const fetchDefaultData = async () => {
  //       try {
  //         // Remove duplicates based on the 'company' field
  //         const uniqueIsAssignBranch = accessbranch.reduce((acc, current) => {
  //           const x = acc.find((item) => item.company === current.company && item.branch === current.branch && item.unit === current.unit);
  //           if (!x) {
  //             acc.push(current);
  //           }
  //           return acc;
  //         }, []);

  //         const company = [...new Set(uniqueIsAssignBranch.map((data) => data.company))].map((data) => ({
  //           label: data,
  //           value: data,
  //         }));
  //         setSelectedCompany(company);
  //         setValueCompany(
  //           company.map((a, index) => {
  //             return a.value;
  //           })
  //         );
  //         const branch = uniqueIsAssignBranch
  //           ?.filter((val) => company?.map((comp) => comp.value === val.company))
  //           ?.map((data) => ({
  //             label: data.branch,
  //             value: data.branch,
  //           }))
  //           .filter((item, index, self) => {
  //             return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
  //           });
  //         setSelectedBranch(branch);
  //         setValueBranch(
  //           branch.map((a, index) => {
  //             return a.value;
  //           })
  //         );
  //         let res = await axios.get(SERVICE.PRODUCTMASTER, {
  //           headers: {
  //             Authorization: `Bearer ${auth.APIToken}`,
  //           },
  //         });
  //         const all = [
  //           ...res?.data?.productmastercategories?.map((d) => ({
  //             ...d,
  //             label: d.productname,
  //             value: d.productname,
  //           })),
  //         ];
  //         // Remove duplicates by customer name
  //         const finalAll = Array.from(new Map(all.filter((d) => d && d.value).map((d) => [d.value, d])).values());
  //         setSelectedProductType(finalAll);
  //         setValueProductType(
  //           finalAll.map((a, index) => {
  //             return a.value;
  //           })
  //         );
  //       } catch (err) {
  //         console.log(err.message);
  //       }
  //     };
  //     fetchDefaultData();
  //   }, [isAssignBranch]);

  //company multiselect
  const handleCompanyChange = (options) => {
    setValueCompany(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedCompany(options);
    setSelectedBranch([]);
    setValueBranch([]);
    setValueProductType([]);
    setSelectedProductType([]);
  };

  const customValueRendererCompany = (valueCompany, _categoryname) => {
    return valueCompany?.length ? valueCompany.map(({ label }) => label)?.join(', ') : 'Please Select Company';
  };

  //branchto multiselect dropdown changes
  const handleBranchChange = (options) => {
    setSelectedBranch(options);
    setValueBranch(
      options.map((a, index) => {
        return a.value;
      })
    );
    setValueProductType([]);
    setSelectedProductType([]);
  };

  const customValueRendererBranch = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please Select Branch';
  };

  //producttype multiselect
  const handleProductTypeChange = (options) => {
    setValueProductType(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedProductType(options);
  };

  const customValueRendererProductType = (valueProductType, _categoryname) => {
    return valueProductType?.length ? valueProductType.map(({ label }) => label)?.join(', ') : 'Please Select Product Type';
  };

  useEffect(() => {
    if ((items?.length > 0 && filterdata) || forsearch) {
      fetchManageSales();
    }
  }, [pageManageSales, pageSizeManageSales, searchQueryManageSales]);

  //get all Sub vendormasters.
  const fetchManageSales = async () => {
    setPageName(!pageName);
    setLoader(true);
    // console.time('fetchManageSales');
    const queryParams = {
      page: Number(pageManageSales),
      pageSize: Number(pageSizeManageSales),
      assignbranch: accessbranch,
      fromdate: String(filterUser.fromdate),
      todate: String(filterUser.todate),
      company: selectedCompany?.length > 0 ? valueCompany : [],
      branch: selectedBranch?.length > 0 ? valueBranch : [],
      type: filterUser.filtertype,
      prodmastertype: selectedProductType?.length > 0 ? valueProductType : [],
    };

    const allFilters = [...additionalFilters, { column: selectedColumn, condition: selectedCondition, value: filterValue }];
    // Only include advanced filters if they exist, otherwise just use regular searchQueryManageSales
    if (allFilters.length > 0 && selectedColumn !== '') {
      queryParams.allFilters = allFilters;
      queryParams.logicOperator = logicOperator;
    } else if (searchQueryManageSales) {
      queryParams.searchQuery = searchQueryManageSales; // Use searchQueryManageSales for regular search
    }
    try {
      let res = await axios.post(SERVICE.MANAGESALES_DATE_FILTER_WITH_PAGINATION, queryParams, {
        // let res_vendor = await axios.get(SERVICE.MANAGESALES, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const ans = res?.data?.result?.length > 0 ? res?.data?.result : [];
      const ansoverall = res?.data?.totalProjectsAllData?.length > 0 ? res?.data?.totalProjectsAllData : [];
      // console.log(ans, ansoverall, 'ans');
      const itemsWithSerialNumber = ans?.map((item, index) => ({
        ...item,
        id: item._id,
        serialNumber: (pageManageSales - 1) * pageSizeManageSales + index + 1,
        date: moment(item.date).format('DD-MM-YYYY'),
        customercontact: `${item.customercontactprefix}-${item.customercontact}`,
        netamount: Number(item.netamount),
      }));
      const itemsWithSerialNumberOverall = ansoverall?.map((item, index) => ({
        ...item,
        id: item._id,
        serialNumber: index + 1,
        date: moment(item.date).format('DD-MM-YYYY'),
        customercontact: `${item.customercontactprefix}-${item.customercontact}`,
        netamount: Number(item.netamount),
      }));
      setAllManageSales(itemsWithSerialNumber);
      setOverAllManageSales(itemsWithSerialNumberOverall);
      // setSearchQueryManageSales('');
      // setTotalPagesManageSales(Math.ceil(res?.data?.managesales.length / pageSizeManageSales));
      setTotalProjects(ans?.length > 0 ? res?.data?.totalProjects : 0);
      setTotalPagesManageSales(ans?.length > 0 ? res?.data?.totalPages : 0);
      setPageSizeManageSales((data) => {
        return ans?.length > 0 ? data : 10;
      });
      setPageManageSales((data) => {
        return ans?.length > 0 ? data : 1;
      });
      setLoader(false);
      // console.timeEnd('fetchManageSales');
    } catch (err) {
      // console.timeEnd('fetchManageSales');
      setLoader(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
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
          let showname = columnDataTableManageSales.find((col) => col.field === filter.column)?.headerName;
          return `${showname} ${filter.condition} "${filter.value}"`;
        })
        .join(' ' + (advancedFilter.length > 1 ? advancedFilter[1].condition : '') + ' ');
    }
    return searchQueryManageSales;
  };

  //get all  vendordetails.
  const handleResetSearch = async () => {
    setLoader(true);
    setPageName(!pageName);
    setFilterdata(true);
    // Reset all filters and pagination state
    setAdvancedFilter(null);
    setAdditionalFilters([]);
    setSearchQueryManageSales('');
    setIsSearchActive(false);
    setSelectedColumn('');
    setSelectedCondition('Contains');
    setFilterValue('');
    setLogicOperator('AND');
    setFilteredChanges(null);

    const queryParams = {
      page: Number(pageManageSales),
      pageSize: Number(pageSizeManageSales),
      assignbranch: accessbranch,
      fromdate: String(filterUser.fromdate),
      todate: String(filterUser.todate),
      company: selectedCompany?.length > 0 ? valueCompany : [],
      branch: selectedBranch?.length > 0 ? valueBranch : [],
      type: filterUser.filtertype,
      prodmastertype: selectedProductType?.length > 0 ? valueProductType : [],
    };

    const allFilters = [];
    // Only include advanced filters if they exist, otherwise just use regular searchQuery
    if (allFilters.length > 0 && selectedColumn !== '') {
      queryParams.allFilters = allFilters;
      queryParams.logicOperator = logicOperator;
    } else if (searchQueryManageSales) {
      queryParams.searchQuery = searchQueryManageSales; // Use searchQuery for regular search
    }

    try {
      let res = await axios.post(SERVICE.MANAGESALES_DATE_FILTER_WITH_PAGINATION, queryParams, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const ans = res?.data?.result?.length > 0 ? res?.data?.result : [];
      const ansoverall = res?.data?.totalProjectsAllData?.length > 0 ? res?.data?.totalProjectsAllData : [];
      const itemsWithSerialNumber = ans?.map((item, index) => ({
        ...item,
        id: item._id,
        serialNumber: (pageManageSales - 1) * pageSizeManageSales + index + 1,
        date: moment(item.date).format('DD-MM-YYYY'),
        customercontact: `${item.customercontactprefix}-${item.customercontact}`,
        netamount: Number(item.netamount),
      }));
      const itemsWithSerialNumberOverall = ansoverall?.map((item, index) => ({
        ...item,
        id: item._id,
        serialNumber: (pageManageSales - 1) * pageSizeManageSales + index + 1,
        date: moment(item.date).format('DD-MM-YYYY'),
        customercontact: `${item.customercontactprefix}-${item.customercontact}`,
        netamount: Number(item.netamount),
      }));
      setAllManageSales(itemsWithSerialNumber);
      setItems(itemsWithSerialNumber);
      setOverAllManageSales(itemsWithSerialNumberOverall);
      setTotalProjects(ans?.length > 0 ? res?.data?.totalProjects : 0);
      setTotalPagesManageSales(ans?.length > 0 ? res?.data?.totalPages : 0);
      setPageSizeManageSales((data) => {
        return ans?.length > 0 ? data : 10;
      });
      setPageManageSales((data) => {
        return ans?.length > 0 ? data : 1;
      });
      setLoader(false);
    } catch (err) {
      setLoader(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };





  const addSerialNumber = (datas) => {
    setItems(datas);
  };

  useEffect(() => {
    addSerialNumber(allManageSales);
  }, [allManageSales]);

  const rowData = async (id) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.MANAGESALES_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDeleteSource(res?.data?.smanagesale);
      handleClickOpen();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Alert delete popup
  let Sourcesid = deleteSource?._id;
  const delSource = async () => {
    setPageName(!pageName);
    try {
      if (Sourcesid) {
        await axios.delete(`${SERVICE.MANAGESALES_SINGLE}/${Sourcesid}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
        await fetchManageSales();
        setIsHandleChange(false);
        handleCloseMod();
        setSelectedRows([]);
        setPageManageSales(1);
      }
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
        return axios.delete(`${SERVICE.MANAGESALES_SINGLE}/${item}`, {
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
      setPageManageSales(1);

      await fetchManageSales();
      setPopupContent('Deleted Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleFetchBillView = (data) => {
    const files = Array.from(data); // Ensure it's an array

    const fileReaders = [];
    const newSelectedFiles = [];

    files.forEach((file) => {
      const reader = new FileReader();

      const readerPromise = new Promise((resolve) => {
        reader.onload = () => {
          const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            preview: file.type.startsWith('image/') ? reader.result : null, // only for images
            base64: file.type === 'application/pdf' ? reader.result.split(',')[1] : null, // only for pdf
          };
          newSelectedFiles.push(fileData);
          resolve(file);
        };
      });

      reader.readAsDataURL(file); // works for both image and pdf
      fileReaders.push(readerPromise);
    });

    Promise.all(fileReaders).then(() => {
      setRefImageBillView(newSelectedFiles);
      setRefImageBillFileNamesView(newSelectedFiles.map((d) => d.name));
    });
  };

  const renderFilePreview = async (file) => {
    if (file.type.startsWith('image/')) {
      // open image in a new tab
      const response = await fetch(file.preview);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      window.open(link, '_blank');
    } else if (file.type === 'application/pdf') {
      // open pdf in new tab
      const byteCharacters = atob(file.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } else {
      alert('Preview not supported, please download file.');
    }
  };

  // get single row to view....
  const getviewCode = async (e) => {
    try {
      let res = await axios.get(`${SERVICE.MANAGESALES_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setManageSalesView(res?.data?.smanagesale);
      setSalesItemTodoView(res?.data?.smanagesale?.salesitems);
      setOldItemTodoView(res?.data?.smanagesale?.olditems);
      setSalesTaxGroupsArrayView(res?.data?.smanagesale?.totalsalestaxgroupsarray);
      setOldTaxGroupsArrayView(res?.data?.smanagesale?.totaloldtaxgroupsarray);
      setModeOfPayTodoView(res?.data?.smanagesale?.paymentarray);
      if (res?.data?.smanagesale?.billfiles?.length > 0) {
        const filesbill = await getMultipleFilesAsObjects(res?.data?.smanagesale?.billfiles, 'todo', res?.data?.smanagesale?.uniqueId);
        // console.log(filesbill, 'filesbill');
        handleFetchBillView(filesbill);
      }
      handleClickOpenview();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // get single row to view....
  const getinfoCode = async (e) => {
    try {
      let res = await axios.get(`${SERVICE.MANAGESALES_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setManageSalesView(res?.data?.smanagesale);
      handleClickOpeninfo();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  //Project updateby edit pageManageSales...
  let updateby = manageSalesView?.updatedby;
  let addedby = manageSalesView?.addedby;

  const columnDataTableManageSales = [
    { field: 'checkbox', headerName: 'Checkbox', sortable: false, width: 75, headerCheckboxSelection: true, checkboxSelection: true, hide: !columnVisibilityManageSales.checkbox, pinned: 'left', lockPinned: true },
    { field: 'serialNumber', headerName: 'SNo', flex: 0, width: 80, hide: !columnVisibilityManageSales.serialNumber },
    { field: 'company', headerName: 'Company', flex: 0, width: 120, hide: !columnVisibilityManageSales.company },
    { field: 'branch', headerName: 'Branch', flex: 0, width: 120, hide: !columnVisibilityManageSales.branch },
    { field: 'customername', headerName: 'Customer Name', flex: 0, width: 250, hide: !columnVisibilityManageSales.customername },
    { field: 'customeraddress', headerName: 'Customer Address', flex: 0, width: 250, hide: !columnVisibilityManageSales.customeraddress },
    { field: 'customercontact', headerName: 'Customer Contact', flex: 0, width: 150, hide: !columnVisibilityManageSales.customercontact },
    { field: 'date', headerName: 'Date', flex: 0, width: 120, hide: !columnVisibilityManageSales.date },
    { field: 'formattedtime', headerName: 'Time', flex: 0, width: 120, hide: !columnVisibilityManageSales.formattedtime },
    { field: 'billno', headerName: 'Bill No', flex: 0, width: 150, hide: !columnVisibilityManageSales.billno },
    { field: 'salesid', headerName: 'Sales Person', flex: 0, width: 150, hide: !columnVisibilityManageSales.salesid },
    { field: 'netamount', headerName: 'Net Amount', flex: 0, width: 150, hide: !columnVisibilityManageSales.netamount },
    {
      field: 'actions',
      headerName: 'Action',
      flex: 0,
      width: 270,
      minHeight: '40px !important',
      filter: false,
      sortable: false,
      hide: !columnVisibilityManageSales.actions,
      cellRenderer: (params) => (
        <Grid sx={{ display: 'flex' }}>
          <Box>

            <a href={`/managesalesedit/${params.data.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <Button size="small" sx={userStyle.actionbutton}>
                <EditOutlinedIcon sx={buttonStyles.buttonedit} />
              </Button>
            </a>

            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.data.id);
              }}
            >
              <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />
            </Button>

            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getviewCode(params.data.id);
              }}
            >
              <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />
            </Button>

            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getinfoCode(params.data.id);
              }}
            >
              <InfoOutlinedIcon sx={buttonStyles.buttoninfo} />
            </Button>

          </Box>
        </Grid>
      ),
    },
  ];
  const filteredSelectedColumn = columnDataTableManageSales.filter((data) => data.field !== 'checkbox' && data.field !== 'actions' && data.field !== 'serialNumber');
  // Datatable
  const handleSearchChange = (event) => {
    setSearchQueryManageSales(event.target.value);
    // setPage(1);
  };

  const handlePageSizeChange = (event) => {
    setPageSizeManageSales(Number(event.target.value));
    setSelectedRows([]);
    setSelectAllChecked(false);
    setPageManageSales(1);
    setFilterdata(true);
  };

  // Show All Columns functionality
  const handleShowAllColumns = () => {
    const updatedVisibility = { ...columnVisibilityManageSales };
    for (const columnKey in updatedVisibility) {
      updatedVisibility[columnKey] = true;
    }
    setColumnVisibilityManageSales(updatedVisibility);
  };

  // // Function to filter columns based on search query
  const filteredColumns = columnDataTableManageSales.filter((column) => column.headerName.toLowerCase().includes(searchQueryManageManageSales.toLowerCase()));

  // Manage Columns functionality
  const toggleColumnVisibility = (field) => {
    setColumnVisibilityManageSales((prevVisibility) => ({
      ...prevVisibility,
      [field]: !prevVisibility[field],
    }));
  };

  // Split the search query into individual terms
  const searchTerms = searchQueryManageSales.toLowerCase().split(' ');
  // Modify the filtering logic to check each term
  const filteredDatas = items?.filter((item) => {
    return searchTerms.every((term) => Object.values(item).join(' ').toLowerCase().includes(term));
  });

  // Excel
  const [fileFormat, setFormat] = useState('');
  let exportColumnNamescrt = ['Company', 'Branch', 'Customer Name', 'Customer Address', 'Customer Contact', 'Date', 'Time', 'Bill No', 'Sales Person', 'Net Amount'];
  let exportRowValuescrt = ['company', 'branch', 'customername', 'customeraddress', 'customercontact', 'date', 'formattedtime', 'billno', 'salesid', 'netamount'];

  //print...
  const [serverTimeForPrint, setServerTimeForPrint] = useState(null);
  const componentRef = useRef();

  const fetchTimeForPrint = async () => {
    const time = await getCurrentServerTime();
    setServerTimeForPrint(time);

    setTimeout(() => {
      handleprint();
    }, 100);
  };

  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    // documentTitle: 'Manage Sales List',
    // pageStyle: 'print',
  });

  // image
  const handleCaptureImage = () => {
    if (gridRefImageManageSales.current) {
      domtoimage
        .toBlob(gridRefImageManageSales.current)
        .then((blob) => {
          saveAs(blob, 'Manage Sales List.png');
        })
        .catch((error) => {
          console.error('dom-to-image error: ', error);
        });
    }
  };

  //invoice bill layout
  const [pagePopeOpen, setPagePopUpOpen] = useState('');
  const [isOpenLetterHeadPopup, setIsLetterHeadPopup] = useState(false);
  const [printLayout, setPrintLayout] = useState(false);
  const [selectedHeadOpt, setSelectedHeadOpt] = useState([]);
  const [personId, setPersonId] = useState('');
  const [header, setHeader] = useState('');
  const [footer, setfooter] = useState('');
  const [salesReturnItemTodo, setSalesReturnItemTodo] = useState([]);
  const [totalSalesReturnAmount, setTotalSalesReturnAmount] = useState('0.00');
  const [contentValue, setContentValue] = useState('');
  const [headerOptions, setHeaderOptions] = useState('Please Select Print Options');

  const [imageUrl, setImageUrl] = useState("")

 const handleFetchInvoiceView = (data) => {
  console.log(data)
        const files = Array.from(data); // Ensure it's an array

        const fileReaders = [];
        const newSelectedFiles = [];

        files.forEach((file) => {
            const reader = new FileReader();

            const readerPromise = new Promise((resolve) => {
                reader.onload = () => {
                    const fileData = {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        preview: file.type.startsWith("image/") ? reader.result : null, // only for images
                        base64: file.type === "application/pdf" ? reader.result.split(",")[1] : null, // only for pdf
                    };
                    newSelectedFiles.push(fileData);
                    resolve(file);
                };
            });

            reader.readAsDataURL(file); // works for both image and pdf
            fileReaders.push(readerPromise);
        });

        Promise.all(fileReaders).then(() => {
          console.log(newSelectedFiles)
            {
                newSelectedFiles.length > 0 && (
                    // renderFilePreview(newSelectedFiles[0])
                    setHeader(newSelectedFiles[0])
                    
                )
            }
        });
    };


  // const handleHeadChangeAdd = async(options) => {
  //   const filesbill = await getMultipleFilesAsObjects(
  //               [personId[0]?.header?.split('-')[1]],
  //               "invoice",
  //               personId[0]?.uniqueId?.split('-')[0])
  //                           handleFetchInvoiceView(filesbill);

  //   let value = options.map((a) => {
  //     return a.value;
  //   });
  //   console.log(personId)
  //   if (value?.length === 1 && value?.includes('With Head content')) {
  //     setHeader(personId?.letterheadcontentheader[0]?.preview);
  //   } else if (value?.length === 1 && value?.includes('With Footer content')) {
  //     setfooter(personId?.letterheadcontentfooter[0]?.preview);
  //   } else if (value?.length > 1) {
  //     setHeader(personId?.letterheadcontentheader[0]?.preview);
  //     setfooter(personId?.letterheadcontentfooter[0]?.preview);
  //   } else {
  //     setHeader('');
  //     setfooter('');
  //   }
  //   setSelectedHeadOpt(options);
  // };

const handleHeadChangeAdd = async (options) => {

  // 🔒 SAFE CHECK BEFORE FETCH
  if (!personId || !personId[0] || !personId[0].header || !personId[0].uniqueId) {
    console.warn("personId missing header or uniqueId. Skipping image fetch.");
  } else {
    const headerFile = personId[0].header.split("-")[1];
    const unique = personId[0].uniqueId.split("-")[0];

    const filesbill = await getMultipleFilesAsObjects(
      [headerFile],
      "invoice",
      unique
    );

    handleFetchInvoiceView(filesbill);
  }

  // 🔽 REMAINS SAME BELOW THIS LINE
  let value = options.map((a) => a.value);

  console.log(personId);

  if (value?.length === 1 && value?.includes("With Head content")) {
    setHeader(personId?.headerimage);
  } else if (value?.length === 1 && value?.includes("With Footer content")) {
    setfooter(personId?.footerimage);
  } else if (value?.length > 1) {
    setHeader(personId?.headerimage);
    setfooter(personId?.footerimage);
  } else {
    setHeader("");
    setfooter("");
  }

  setSelectedHeadOpt(options);
};



  const customValueRenderHeadFromAdd = (valueCate) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please Select Letter Head';
  };

  const handleClickOpenLetterHeader = (page) => {
    setPagePopUpOpen(page);
    setIsLetterHeadPopup(true);
  };
  const handleClickCloseLetterHead = () => {
    setPagePopUpOpen('');
    setIsLetterHeadPopup(false);
    setHeaderOptions('Please Select Print Options');
  };
  const generateQrCode = async () => {
    try {
      const response = await QRCode.toDataURL(`
        Company: ${manageSalesCommon.company}
        Branch: ${manageSalesCommon.branch}      
        Customer: ${manageSalesCommon.customername}
        Date: ${manageSalesCommon.date}
        Time: ${manageSalesCommon.hours}:${manageSalesCommon.minutes} ${manageSalesCommon.time}
        Bill No: ${isAuto === true ? manageSalesCommon.billno : billNoAuto}
        Address: ${manageSalesCommon.customeraddress}
        Contact: ${manageSalesCommon.customercontact}
      `);
      setImageUrl(response);
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  };
  useEffect(() => {
    generateQrCode()
  }, [])
  // const getHeaderFooterImages = async (companyValue, branchValue) => {
  //   setPageName(!pageName);
  //   try {
  //     // let res = await axios.get(SERVICE.SETTINGS, {
  //     let res = await axios.get(SERVICE.FILTERTEMPLATECONTROLPANEL, {
  //       headers: {
  //         Authorization: `Bearer ${auth.APIToken}`,
  //       },
  //       // company: companyValue,
  //       // branch: branchValue,
  //     });
  //     console.log(res?.data?.settings)
  //     if (res?.data?.settings) {
  //       // const ans = res?.data?.settings ? res?.data?.settings?.templatecontrolpanellog[res?.data?.settings?.templatecontrolpanellog?.length - 1] : '';
  //       const ans =  res?.data?.settings[0] ;
  //       setPersonId(ans);
  //     }
  //   } catch (err) {
  //     handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
  //   }
  // };
  
  const getHeaderFooterImages = async (companyValue, branchValue) => {
  setPageName(!pageName);
  try {
    let res = await axios.post(
      SERVICE.FILTERTEMPLATECONTROLPANEL,
      {
     
      },
      {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      }
    );

    console.log(res?.data?.templatecontrolpanel);

    if (res?.data?.templatecontrolpanel) {
      const ans = res?.data?.templatecontrolpanel;
    //   Make sure this ANS variaable return's an Object
            const header = "";
            const footer = "";
            const backgroundimage = "";
            const headerFooterBase64 = {
              ...ans,
              headerimage: header,
              footerimage: footer,
              backgroundimage: backgroundimage,
            };

      setPersonId(headerFooterBase64);
    }
  } catch (err) {
    handleApiError(
      err,
      setPopupContentMalert,
      setPopupSeverityMalert,
      handleClickOpenPopupMalert
    );
  }
};

  const totalSalesReturnWeight = (allData) => {
    let totalValue = 0;
    allData?.map(val => {
      totalValue += Number(val.weight);
    })
    return (Number(totalValue)?.toFixed(3));
  }
  const numberToWords = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '';

    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
    };

    const whole = Math.floor(num);
    const decimal = Math.round((num - whole) * 100);

    let result = inWords(whole) + ' Only.';
    if (decimal > 0) result = inWords(whole) + ' and ' + inWords(decimal) + ' Paise Only.';
    return 'Rupees ' + result;
  };



  return (
    <Box>
      <Headtitle title={'Manage Sales'} />
      {/* ****** Header Content ****** */}
      <PageHeading title="Manage Sales" modulename="Products" submodulename="Manage Sales" mainpagename="" subpagename="" subsubpagename="" />
      {isUserRoleCompare?.includes('amanagesales') && (

        <>
          <Box sx={userStyle.dialogbox}>

            <Grid container spacing={1}>
              <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
                <Grid container alignItems="center" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>

                  <Grid item>
                    <Typography>
                      <b>Silver:</b>{" "}
                      <span style={{ color: "red" }}>{Number(currentSilverRate)?.toFixed(2)}</span>
                    </Typography>
                  </Grid>

                  <Grid item>
                    <Typography>
                      <b>Gold:</b>{" "}
                      <span style={{ color: "red" }}>{Number(currentGoldRate)?.toFixed(2)}</span>
                    </Typography>
                  </Grid>

                  <Grid item>
                    <Typography sx={{ color: "red" }}>
                      {moment(serverTime1).format("DD-MM-YYYY")}{" "}
                      {serverTime1.format("hh:mm:ss A")}
                    </Typography>
                  </Grid>

                </Grid>

                <Grid item>
                  <Typography sx={userStyle.HeaderText}>Add Sales</Typography>
                </Grid>

                {/* Right side - Date & Time */}
                <Grid item>
                  <Grid container spacing={2} alignItems="center">
                    {/* Date Field */}
                    <Grid item>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Date <b style={{ color: "red" }}>*</b>
                        </Typography>
                        <OutlinedInput
                          type="date"
                          value={manageSalesCommon.date}
                          onChange={(e) => {
                            const selectedDate = e.target.value;
                            const currentDate = new Date(serverTime).toISOString().split("T")[0];
                            setManageSalesCommon({ ...manageSalesCommon, date: selectedDate });
                          }}
                        />
                      </FormControl>
                    </Grid>

                    {/* Time Field */}
                    <Grid item>
                      <Typography>
                        Time <b style={{ color: "red" }}>*</b>
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item>
                          <FormControl size="small">
                            <Selects
                              options={hoursTimeOpt}
                              value={{
                                label: manageSalesCommon.hours,
                                value: manageSalesCommon.hours,
                              }}
                              onChange={(e) =>
                                setManageSalesCommon({
                                  ...manageSalesCommon,
                                  hours: e.value,
                                })
                              }
                            />
                          </FormControl>
                        </Grid>
                        <Grid item>
                          <FormControl size="small">
                            <Selects
                              options={minutesTimeOpt}
                              value={{
                                label: manageSalesCommon.minutes,
                                value: manageSalesCommon.minutes,
                              }}
                              onChange={(e) =>
                                setManageSalesCommon({
                                  ...manageSalesCommon,
                                  minutes: e.value,
                                })
                              }
                            />
                          </FormControl>
                        </Grid>
                        <Grid item>
                          <FormControl size="small">
                            <Selects
                              options={[
                                { label: "AM", value: "AM" },
                                { label: "PM", value: "PM" },
                              ]}
                              value={{
                                label: manageSalesCommon.time,
                                value: manageSalesCommon.time,
                              }}
                              onChange={(e) =>
                                setManageSalesCommon({
                                  ...manageSalesCommon,
                                  time: e.value,
                                })
                              }
                            />
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>



              <Grid item md={2} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Bill No<b style={{ color: 'red' }}>* {lastBillNo}</b>
                  </Typography>
                  <OutlinedInput id="component-outlined" type="text" sx={userStyle.input} placeholder="Bill No" value={billNoAuto} />
                </FormControl>
              </Grid>
              {/* <Grid item md={2.5} xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <Typography>
                  Customer Name<b style={{ color: 'red' }}></b>
                </Typography>
                  <OutlinedInput
                                        id="component-outlined"
                                        type="text"
                                        inputMode="numeric"
                                        sx={userStyle.input}
                                        placeholder="Customer Name"
                                        value={manageSalesCommon.customername}
                                        onChange={(e) => {
                                          const upperValue = e.target.value.toUpperCase();
                                          setManageSalesCommon({ ...manageSalesCommon, customername: upperValue, });
                                           if (e.target.value.length === 1) {
                      setPopupContentMalert('Please enter Customer Contact Number.');
                      setPopupSeverityMalert('info');
                      handleClickOpenPopupMalert();
                    }
                                        }} />
                {/* <OutlinedInput
                  id="component-outlined"
                  type="text"
                  sx={userStyle.input}
                  placeholder="Customer Name"
                  value={isNewCusDetails.customername}
                  onChange={(e) => {
                    const upperValue = e.target.value.toUpperCase();
                    setIsNewCusDetails({ ...isNewCusDetails, customername: upperValue, customercontact: '' });
                    if (e.target.value.length === 1) {
                      setPopupContentMalert('Please enter Customer Contact Number.');
                      setPopupSeverityMalert('info');
                      handleClickOpenPopupMalert();
                    }
                  }}
                /> */}

              {/* </FormControl>
            </Grid>


            <Grid item md={2.5} sm={6} xs={12}>
              <Typography>
                Customer Contact No<b style={{ color: 'red' }}></b>
              </Typography>
              {/* <Box sx={{ display: 'flex' }}>
                <FormControl size="small" sx={{ width: '80px' }}>
                  <OutlinedInput id="component-outlined" sx={userStyle.input} value={isNewCusDetails.customercontactprefix} />
                </FormControl>
                <FormControl size="small" fullWidth>
                  <OutlinedInput
                    id="component-outlined"
                    type="number"
                    sx={userStyle.input}
                    placeholder="Customer Contact No"
                    value={isNewCusDetails.customercontact}
                    onChange={(e) => {
                      handlechangereferencecontactno(e);
                    }}
                  />
                </FormControl>
              </Box> */}
              {/* <Box sx={{ display: 'flex' }}>
                                  <FormControl size="small" sx={{ width: '80px' }}>
                                    <OutlinedInput
                                      id="component-outlined"
                                      sx={userStyle.input}
                                      value={manageSalesCommon.customercontactprefix}
                                    />
                                  </FormControl>
                                  <FormControl size="small" fullWidth>
                                    <OutlinedInput
                                      id="component-outlined"
                                      type="text"
                                      inputMode="numeric"
                                      sx={userStyle.input}
                                      placeholder="Customer Contact No"
                                      value={manageSalesCommon.customercontact}
                                      onChange={(e) => { handlechangereferencecontactno(e) }}
                                    />
                                    {(manageSalesCommon.customercontact !== '' && manageSalesCommon.customercontact?.length !== 10) &&
                                      <Typography style={{ color: 'red' }}>Contact No must be 10 digits required</Typography>
                                    }
                                  </FormControl>
                                </Box> */}
              {/* {manageSalesCommon.customercontact !== '' && manageSalesCommon.customercontact?.length !== 10 && <Typography style={{ color: 'red' }}>Contact No must be 10 digits required</Typography>} */}
              {/* </Grid>  */}


              <Grid item md={2.5} xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Customer Name<b style={{ color: 'red' }}></b>
                  </Typography>
                  {/* <OutlinedInput
      id="component-outlined"
      type="text"
      sx={userStyle.input}
      placeholder="Customer Name"
      value={manageSalesCommon.customername}
      onChange={(e) => {
        const upperValue = e.target.value.toUpperCase();
        setManageSalesCommon({
          ...manageSalesCommon,
          customername: upperValue,
        });

        // Show info popup when user starts typing the name
        if (e.target.value.length === 1) {
          setPopupContentMalert('Please enter Customer Contact Number.');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
        }
      }}
    /> */}
                  <OutlinedInput
                    id="component-outlined"
                    type="text"
                    sx={userStyle.input}
                    placeholder="Customer Name"
                    value={manageSalesCommon.customername}
                    onChange={(e) => {
                      const upperValue = e.target.value.toUpperCase();

                      // If user clears the name field, reset the contact number
                      if (upperValue.trim() === '') {
                        setManageSalesCommon({
                          ...manageSalesCommon,
                          customername: '',
                          customercontact: '', // reset contact number
                        });
                        return;
                      }

                      setManageSalesCommon({
                        ...manageSalesCommon,
                        customername: upperValue,
                      });

                      // Show info popup when user starts typing the name
                      if (e.target.value.length === 1) {
                        setPopupContentMalert('Please enter Customer Contact Number.');
                        setPopupSeverityMalert('info');
                        handleClickOpenPopupMalert();
                      }
                    }}
                  />

                </FormControl>
              </Grid>

              <Grid item md={2.5} sm={6} xs={12}>
                <Typography>
                  Customer Contact No<b style={{ color: 'red' }}></b>
                </Typography>

                <Box sx={{ display: 'flex' }}>
                  <FormControl size="small" sx={{ width: '80px' }}>
                    <OutlinedInput
                      id="component-outlined"
                      sx={userStyle.input}
                      value={manageSalesCommon.customercontactprefix}
                      disabled // prefix is always disabled (optional)
                    />
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      inputMode="numeric"
                      sx={userStyle.input}
                      placeholder="Customer Contact No"
                      value={manageSalesCommon.customercontact}
                      onChange={(e) => handlechangereferencecontactno(e)}
                      disabled={!manageSalesCommon.customername} // ✅ disable when name is empty
                    />
                    {manageSalesCommon.customercontact !== '' &&
                      manageSalesCommon.customercontact?.length !== 10 && (
                        <Typography style={{ color: 'red' }}>
                          Contact No must be 10 digits required
                        </Typography>
                      )}
                  </FormControl>
                </Box>
              </Grid>


            </Grid>
            <br />

            <br />



            <Grid container spacing={1}>
              <Grid item md={12} sm={6} xs={12}>
                <Typography>
                  <b>Sales Item</b>
                </Typography>
              </Grid>
              <Grid item md={2.5} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Product Name<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    options={prodTypeOpt}
                    value={{ label: manageSalesItem.productname, value: manageSalesItem.productname }}

                    onChange={(e) => {

                      if (manageSalesCommon.date === '') {
                        setPopupContentMalert('Please Select Date');
                        setPopupSeverityMalert('warning');
                        handleClickOpenPopupMalert();
                      } else {
                        fetchSinglePur(e, manageSalesCommon.date, manageSalesCommon.hours, manageSalesCommon.minutes, manageSalesCommon.time);
                      }
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item md={0.75} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Pieces<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="number"
                    sx={userStyle.input}
                    placeholder="Pieces"
                    value={manageSalesItem.pieces}
                    onChange={(e) => {
                      //   calculateSalesItemValues(salesItemTypeFromParticular, { pieces: e.target.value });
                      setManageSalesItem({ ...manageSalesItem, pieces: e.target.value });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.25} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Weight<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="number"
                    sx={userStyle.input}
                    placeholder="Weight"
                    value={manageSalesItem.weight}
                    onChange={(e) => {
                      // setManageSalesItem({ ...manageSalesItem, weight: e.target.value });
                      calculateSalesItemValues({ weight: e.target.value });
                    }}
                  />
                </FormControl>

              </Grid>
              <Grid item md={1.25} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Rate<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput id="component-outlined" type="number" sx={userStyle.input} placeholder="Rate" value={manageSalesItem.rate} />
                </FormControl>
              </Grid>

              <Grid item md={1.25} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    VA<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput id="component-outlined" sx={userStyle.input} placeholder="VA" value={manageSalesItem.value}
                    onChange={(e) => {
                      calculateSalesItemValues({ value: e.target.value });
                    }} />

                </FormControl>
              </Grid>


              <Grid item md={1.5} sm={6} xs={12}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Amount<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput id="component-outlined" sx={userStyle.input} placeholder="Amount" value={manageSalesItem.salesamount} />
                </FormControl>
              </Grid>
              <Grid item lg={0.5} md={0.5} sm={2} xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{
                    height: '30px',
                    minWidth: '20px',
                    padding: '19px 13px',
                    marginTop: '25px',
                  }}
                  onClick={addSalesItem}
                >
                  <FaPlus />
                </Button>
              </Grid>
            </Grid>
            <br />
            {salesItemTodo?.length > 0 && (
              <TableContainer component={Paper} sx={userStyle.tablecontainer}>
                <Table aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <TableCell>SNo</TableCell>
                      <TableCell colSpan={5}>Products Name</TableCell>
                      <TableCell>pcs</TableCell>
                      <TableCell>Weight</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Wastage</TableCell>
                      <TableCell>Sales Amount</TableCell>
                      <TableCell>
                        <DeleteOutlineOutlinedIcon style={{ fontSize: 'large' }} />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesItemTodo?.length > 0 &&
                      salesItemTodo?.map((data, i) => {
                        return (
                          <>
                            <TableRow key={i}>
                              <TableCell>{i + 1}</TableCell>
                              <TableCell colSpan={5}>{data.productname}</TableCell>
                              <TableCell>{data.pieces}</TableCell>
                              <TableCell>{data.weight}</TableCell>
                              <TableCell>{Number(data.rate)?.toFixed(2)}</TableCell>
                              <TableCell>{data.value}</TableCell>
                              <TableCell>{data.salesamount}</TableCell>
                              <TableCell>
                                <AiOutlineClose style={{ color: 'red', fontWeight: '900', cursor: 'pointer', fontSize: 'large' }} onClick={(e) => deleteSalesItemRow(i, e)} />
                              </TableCell>
                            </TableRow>
                          </>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <br />
            <Grid sx={{ marginLeft: "750px" }}>
              <Grid item md={1.5} sm={6} xs={12} >
                <FormControl size="small">
                  <Typography>
                    Total Amount<b style={{ color: 'red' }}></b>
                  </Typography>
                  <OutlinedInput id="component-outlined" sx={userStyle.input} placeholder="Total Amount" value={manageSalesCommon.totalsalesamount} />
                </FormControl>
              </Grid>
            </Grid>


            <Grid container justifyContent="center" marginTop={3}>
              <Grid
                item
                md={3}
                sm={6}
                xs={12}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2, // space between buttons
                }}
              >
                <LoadingButton
                  onClick={handleSubmit}
                  loading={isBtn}
                  sx={buttonStyles.buttonsubmit}
                  loadingPosition="end"
                  variant="contained"
                >
                  Submit
                </LoadingButton>

                <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                  Clear
                </Button>
              </Grid>
            </Grid>

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
                            <MultiSelect maxMenuHeight={300} options={WithHeaderOptions} value={selectedHeadOpt} onChange={handleHeadChangeAdd} valueRenderer={customValueRenderHeadFromAdd} />
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
                            if (pagePopeOpen === 'print') {
                              handlePrintingLayout();
                              setTimeout(() => generatePDF('download', headerOptions), 500); // short delay for rendering
                            }
                            if (pagePopeOpen === 'preview') {
                              handlePrintingLayout();
                              setTimeout(() => generatePDF('preview', headerOptions), 500);
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
            <br />

            <Grid item lg={1} md={1} sm={2} xs={12}>
              <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                <Button
                  variant="outlined"
                  sx={buttonStyles.buttonsubmit}
                  onClick={() => {
                    handleClickOpenLetterHeader('preview');
                  }}
                >
                  Preview
                </Button>
              </Box>
            </Grid>



            {/* Print Layout */}
            <div
              id="bill-layout-container"
              style={{
                width: '210mm',
                minHeight: '297mm',
                backgroundColor: '#fff',
                // padding: '5mm',
                margin: 'auto',
                boxSizing: 'border-box',
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  width: '210mm',
                  minHeight: '297mm',
                  // p: 0, // Remove extra padding to fit header/footer precisely
                  paddingTop: '30mm',   // reserve space for header
                  paddingBottom: '25mm', // reserve space for footer
                  boxSizing: 'border-box',
                  position: 'relative', // Allows absolutely-positioned header/footer
                  backgroundColor: '#fff',
                  overflow: 'hidden',
                  '@media print': {
                    width: '210mm',
                    minHeight: '297mm',
                    margin: 0,
                    boxShadow: 'none',
                    border: 'none',
                  },
                }}
              >
                {/* 🖼️ Header Image */}
                {/* <div id="pdf-header-section" style={{ marginBottom: '30px', }}> */}
                {/* {header && printLayout && ( */}
                {/* {header && (
                        // <Box
                        //   component="img"
                        //   src={header}
                        //   alt="Header"
                        //   sx={{
                        //     position: 'absolute',
                        //     top: '3.5mm',
                        //     left: '5mm',
                        //     width: '95%',
                        //     height: '9%',
                        //     objectFit: 'contain',
                        //   }}
                        // />
                        <img src={header} alt="Header" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                      )}
                    </div> */}

                <div id="pdf-header-section"
                  style={{
                    position: 'absolute',
                    top: '3.5mm',
                    left: '5mm',
                    width: '95%',
                    height: '9%',
                    objectFit: 'contain',
                  }}>
                  {header && <img src={header} alt="Header" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                </div>

                <div id="pdf-content-section">
                  <Box
                    sx={{
                      // display: 'flex',
                      justifyContent: 'center',
                      // backgroundColor: '#f9f9f9',
                      backgroundColor: '#fff',
                      // py: 4,
                      marginTop: '30px', // gap below header
                      marginBottom: '30px',
                      marginLeft: '20px',
                      marginRight: '20px',
                    }}
                  >
                    {/* <Paper
                      elevation={2}
                      sx={{
                        width: '210mm',
                        minHeight: '297mm',
                        p: 3,
                        boxSizing: 'border-box',
                        // border: "1px solid #000",
                        backgroundColor: '#fff',
                        '@media print': {
                          width: '210mm',
                          minHeight: '297mm',
                          margin: 0,
                          boxShadow: 'none',
                          border: 'none',
                        },
                      }}
                    > */}
                    {/* <Box sx={{ border: '1px solid #000', borderRadius: 1 }}> */}

                    <Box sx={{ background: '#0000000a', mb: 1 }}>
                      <Typography sx={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>INVOICE</Typography>
                    </Box>

                    <Box
                      sx={{
                        border: '1px solid #000',
                        borderRadius: 1,
                        // marginTop: '35mm', // Push content below header
                        // marginBottom: '25mm', // Leave space for footer
                        // padding: 2,
                      }}
                    >
                      {/* <div id="pdf-header-section"> */}
                      {/* Header */}
                      <Box sx={{ borderWidth: 1, borderStyle: 'solid', borderRadius: 1, borderColor: 'black', margin: '3px' }}>
                        {/* <Grid container spacing={2}>
                              <Grid item xs={1.5}>
                                <Box sx={{ borderRight: "1px solid #000", pb: 0.5 }}>
          
                                </Box>
                              </Grid>
                              <Grid item xs={5.5}>
                                <Box sx={{ padding: '5px', borderRight: "1px solid #000", }}>
                                  <Typography fontSize={13}>
                                    <b>To.</b>
                                  </Typography>
                                  <Box sx={{ marginLeft: '10px' }}>
                                    <Typography fontSize={13}>
                                      <b>{isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customername : manageSalesCommon.customername?.split('_')[0]}</b>
                                    </Typography>
                                    <Typography fontSize={12}>{isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customeraddress : manageSalesCommon.customeraddress},</Typography>
                                    <Typography fontSize={12}>Phone : {isNewCusDetails?.isNewCusValue === false ? isNewCusDetails.customercontact : manageSalesCommon.customercontact}</Typography>
                                    <Typography fontSize={12}>GSTIN :</Typography>
                                  </Box>
                                </Box>
                              </Grid> */}
                        {/* <Divider orientation="vertical" flexItem sx={{ borderColor: 'black', borderRightWidth: 1, mx: 1, marginTop: '10px', marginBottom: '-5px' }} /> */}
                        {/* <Grid item xs={4.5}>
                                <Typography fontSize={13}>
                                  <b>
                                    Date&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;:&ensp;&ensp;{moment(manageSalesCommon.date).format('DD/MM/YYYY')} {`${manageSalesCommon.hours}:${manageSalesCommon.minutes} ${manageSalesCommon.time}`}
                                  </b>
                                </Typography>
                                <Divider sx={{ my: 1, borderColor: '#000' }} />
                                <Typography fontSize={13}>
                                  <b>No.&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;:&ensp;&ensp;{isAuto === true ? manageSalesCommon.billno : billNoAuto}</b>
                                </Typography>
                                <Typography fontSize={13}>
                                  <b>BNote No&ensp;&ensp;:&ensp;&ensp;{isNewBNote?.isNewValue === false ? (isNewBNote.bnoteno === 'TRI/S/' ? '' : isNewBNote.bnoteno) : manageSalesCommon.bnoteno}</b>
                                </Typography>
                                <Typography fontSize={13}>
                                  <b>SR No&ensp;&ensp;&ensp;&ensp;&ensp;:&ensp;&ensp;{ }</b>
                                </Typography>
                                <Typography fongSize={13}>
                                  <b>Sales ID</b>&ensp;:&ensp;&ensp;{manageSalesCommon.empcode ? manageSalesCommon.empcode : allUsersLimit[0].empcode.trim()}
                                </Typography>
                              </Grid>
                            </Grid> */}
                        <Grid container>
                          <Grid item xs={2} sx={{ borderRight: '1px solid #000', }}>
                            <Box sx={{ justifyContent: 'center', paddingTop: '10px' }}>
                              {imageUrl && (
                                <>
                                  <Grid item xs={12} sx={{ textAlign: 'center' }}>
                                    <img
                                      src={imageUrl}
                                      alt="QR Code"
                                      style={{
                                        width: '80px',
                                        height: 'auto',
                                        objectFit: 'contain',
                                      }}
                                    />
                                  </Grid>
                                </>
                              )}
                            </Box>
                          </Grid>
                          <Grid item xs={5} sx={{ borderRight: '1px solid #000', }}>
                            <Box sx={{ padding: '5px' }}>
                              <Typography fontSize={13}>
                                <b>To.</b>
                              </Typography>
                              <Box sx={{ marginLeft: '10px' }}>
                                <Typography fontSize={13}>
                                  <b>{manageSalesCommon.customername}</b>
                                </Typography>
                                <Typography fontSize={12}>{manageSalesCommon.customeraddress},</Typography>
                                {/* <Typography fontSize={12}>Phone : {manageSalesCommon.customercontact}</Typography>
                                <Typography fontSize={12}>GSTIN : {manageSalesCommon.gstinnumber}</Typography> */}
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={5}>
                            <Box sx={{ padding: '5px' }}>
                              <Typography fontSize={13}>
                                <b>Date&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;:&ensp;&ensp;{moment(manageSalesCommon.date).format('DD/MM/YYYY')} {`${manageSalesCommon.hours}:${manageSalesCommon.minutes} ${manageSalesCommon.time}`}</b>
                              </Typography>
                            </Box>
                            <Divider sx={{ borderColor: '#000' }} />
                            <Box sx={{ padding: '5px' }}>
                              <Typography fontSize={13}>
                                <b>No.&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;:&ensp;&ensp;{isAuto === true ? manageSalesCommon.billno : billNoAuto}</b>
                              </Typography>
                              {/* <Typography fontSize={13}>
                                <b>BNote No&ensp;&ensp;:&ensp;&ensp;{isNewBNote?.isNewValue === false ? (isNewBNote.bnoteno === 'TRI/S/' ? '' : isNewBNote.bnoteno) : (manageSalesCommon.bnoteno === 'Please Select Bnote No' ? '' : manageSalesCommon.bnoteno)}</b>
                              </Typography>
                              <Typography fontSize={13}>
                                <b>SR No&ensp;&ensp;&ensp;&ensp;&ensp;:&ensp;&ensp;{manageSalesCommon.salesreturnno === 'Please Select Sales Return No' ? '' : manageSalesCommon.salesreturnno}</b>
                              </Typography> */}
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Gold Silver */}
                      <Grid container spacing={2} sx={{ padding: '5px' }}>
                        <Grid item xs={6} textAlign="center">
                          <Typography fontSize={12}>
                            <b>Gold&ensp;&ensp;&ensp;:&ensp;&ensp;&ensp;{Number(currentGoldRate)?.toFixed(2)}</b>
                          </Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="center">
                          <Typography fontSize={12}>
                            <b>Silver&ensp;&ensp;&ensp;:&ensp;&ensp;&ensp;{Number(currentSilverRate)?.toFixed(2)}</b>
                          </Typography>
                        </Grid>
                      </Grid>
                      {/* </div> */}
                      <Divider sx={{ my: 1, borderColor: '#000' }} />
                      {/* <div id="pdf-content-section"> */}
                      {/* Sales Items */}
                      <Box sx={{ margin: '3px' }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ borderBottom: '1px solid #000', pb: 0.5 }}>
                          Sales Items
                        </Typography>
                        <TableContainer>
                          <Table
                            size="small"
                            sx={{
                              border: '1px solid #000',
                              '& th, & td': { border: '1px solid #000', fontSize: '11px' },
                            }}
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ width: '40px' }}><b>SNo.</b></TableCell>
                                <TableCell sx={{ width: '500px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><b>Products</b></TableCell>
                                <TableCell sx={{ width: '40px' }}><b>Pcs</b></TableCell>
                                <TableCell sx={{ width: '80px' }}><b>Weight</b></TableCell>
                                <TableCell sx={{ width: '100px' }}><b>Rate</b></TableCell>
                                <TableCell sx={{ width: '100px' }}><b>Wastage</b></TableCell>
                                {/* <TableCell colSpan={1}><b>Roundoff</b></TableCell> */}

                                <TableCell sx={{ width: '100px' }} align="right"><b>Amount</b></TableCell>

                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {salesItemTodo?.length > 0 &&
                                salesItemTodo.map((data, i) => {
                                  return (
                                    <TableRow>
                                      <TableCell>{i + 1}</TableCell>
                                      <TableCell>{data.productname}</TableCell>
                                      <TableCell>{data.pieces}</TableCell>
                                      <TableCell>{data.weight || '0.000'}</TableCell>
                                      <TableCell>{data.rate || '0.00'}</TableCell>

                                      <TableCell>{data.value || '0.00'}</TableCell>
                                      {/* <TableCell colSpan={1}><b>{Math.abs(Number(manageSalesCommon.salesamount) - (Number(manageSalesCommon.totalsalesgrosswithoutdiscount) + Number(manageSalesCommon.totalsalescgst) + Number(manageSalesCommon.totalsalessgst)))?.toFixed(2) || '0.00'}</b></TableCell> */}

                                <TableCell colSpan={2} align="right"><b>{data.salesamount || '0.00'}</b></TableCell>
                                    </TableRow>
                                  );
                                })}
                              {/* <TableRow>
                                <TableCell colSpan={3} align="right"><b>Total</b></TableCell>
                                <TableCell colSpan={3} align="center"><b>{manageSalesCommon.totalsalesweight || '0.00'}</b></TableCell>
                                <TableCell colSpan={2} align="right"></TableCell>
                                <TableCell colSpan={1} align="right"><b>{manageSalesCommon.totalsalesgrosswithoutdiscount || '0.00'}</b></TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={3}></TableCell>
                                <TableCell colSpan={1}><b>Discount</b></TableCell>
                                <TableCell colSpan={1}><b>CGST</b></TableCell>
                                <TableCell colSpan={1}><b>SGST</b></TableCell>
                                <TableCell colSpan={1}><b>Roundoff</b></TableCell>
                                <TableCell colSpan={2} align="right"><b>Sales Amount</b></TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={3}></TableCell>
                                <TableCell colSpan={1}><b>{manageSalesCommon.totalsaleslessamount}</b></TableCell>
                                <TableCell colSpan={1}><b>{manageSalesCommon.totalsalescgst || '0.00'}</b></TableCell>
                                <TableCell colSpan={1}><b>{manageSalesCommon.totalsalessgst || '0.00'}</b></TableCell>
                                <TableCell colSpan={1}><b>{Math.abs(Number(manageSalesCommon.totalsalesamount) - (Number(manageSalesCommon.totalsalesgrosswithoutdiscount) + Number(manageSalesCommon.totalsalescgst) + Number(manageSalesCommon.totalsalessgst)))?.toFixed(2) || '0.00'}</b></TableCell>
                                <TableCell colSpan={2} align="right"><b>{manageSalesCommon.totalsalesamount || '0.00'}</b></TableCell>
                              </TableRow> */}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>

                      {/* Old Items */}
                      {oldItemTodo && oldItemTodo?.length > 0 && (
                        <>
                          <Divider sx={{ my: 1, borderColor: '#000' }} />
                          <Box sx={{ margin: '3px' }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ borderBottom: '1px solid #000', pb: 0.5 }}>
                              Old Items
                            </Typography>
                            <TableContainer>
                              <Table
                                size="small"
                                sx={{
                                  border: '1px solid #000',
                                  '& th, & td': { border: '1px solid #000', fontSize: '11px' },
                                }}
                              >
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ width: '40px' }}><b>SNo.</b></TableCell>
                                    <TableCell sx={{ width: '500px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><b>Particulars</b></TableCell>
                                    <TableCell sx={{ width: '100px' }}><b>HSN</b></TableCell>
                                    <TableCell sx={{ width: '40px' }}><b>Pcs</b></TableCell>
                                    <TableCell sx={{ width: '80px' }}><b>Weight</b></TableCell>
                                    <TableCell sx={{ width: '100px' }}><b>Waste</b></TableCell>
                                    <TableCell sx={{ width: '250px' }}><b>Rate</b></TableCell>
                                    <TableCell sx={{ width: '250px' }} align="right"><b>Amount</b></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {oldItemTodo?.length > 0 &&
                                    oldItemTodo.map((data, i) => {
                                      return (
                                        <TableRow>
                                          <TableCell>{i + 1}</TableCell>
                                          <TableCell>{data.productname}</TableCell>
                                          <TableCell>{data.hsn}</TableCell>
                                          <TableCell>{data.pieces}</TableCell>
                                          <TableCell>{data.correctweight || '0.000'}</TableCell>
                                          <TableCell>{data.waste || '0%'}</TableCell>
                                          <TableCell>{data.rate || '0.000'}</TableCell>
                                          <TableCell align="right">{data.grossamount || '0.00'}</TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  <TableRow>
                                    <TableCell colSpan={3} align="right"><b>Total</b></TableCell>
                                    <TableCell colSpan={2} align="right"><b>{manageSalesCommon.totaloldweight || '0.00'}</b></TableCell>
                                    <TableCell colSpan={2} align="right"></TableCell>
                                    <TableCell colSpan={1} align="right"><b>{manageSalesCommon.totaloldgrosswithoutdiscount || '0.00'}</b></TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell colSpan={3}></TableCell>
                                    <TableCell colSpan={1}><b>Discount</b></TableCell>
                                    <TableCell colSpan={1}><b>CGST</b></TableCell>
                                    <TableCell colSpan={1}><b>SGST</b></TableCell>
                                    <TableCell colSpan={1} sx={{ width: '250px' }}><b>Roundoff</b></TableCell>
                                    <TableCell colSpan={1} sx={{ width: '250px' }} align="right"><b>Bnote Amount</b></TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell colSpan={3}></TableCell>
                                    <TableCell colSpan={1}><b>{manageSalesCommon.totaloldlessamount || '0.00'}</b></TableCell>
                                    <TableCell colSpan={1}><b>{manageSalesCommon.totaloldcgst || '0.00'}</b></TableCell>
                                    <TableCell colSpan={1}><b>{manageSalesCommon.totaloldsgst || '0.00'}</b></TableCell>
                                    <TableCell colSpan={1}><b>{Math.abs((Number(manageSalesCommon.totaloldgrosswithoutdiscount) + Number(manageSalesCommon.totaloldcgst) + Number(manageSalesCommon.totaloldsgst) - Number(manageSalesCommon.totaloldamount)))?.toFixed(2) || '0.00'}</b></TableCell>
                                    <TableCell colSpan={1} align="right"><b>{manageSalesCommon.totaloldamount || '0.00'}</b></TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        </>
                      )}

                      {/* Sales Return */}
                      {salesReturnItemTodo && salesReturnItemTodo?.length > 0 && (
                        <>
                          <Divider sx={{ my: 1, borderColor: '#000' }} />
                          <Box sx={{ margin: '3px' }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ borderBottom: '1px solid #000', pb: 0.5 }}>
                              Sales Return
                            </Typography>
                            <TableContainer>
                              <Table
                                size="small"
                                sx={{
                                  border: '1px solid #000',
                                  '& th, & td': { border: '1px solid #000', fontSize: '11px' },
                                }}
                              >
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ width: '40px' }}><b>SNo.</b></TableCell>
                                    <TableCell sx={{ width: '500px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><b>Particulars</b></TableCell>
                                    <TableCell sx={{ width: '100px' }}><b>HSN</b></TableCell>
                                    <TableCell sx={{ width: '40px' }}><b>Pcs</b></TableCell>
                                    <TableCell sx={{ width: '80px' }}><b>Weight</b></TableCell>
                                    <TableCell sx={{ width: '100px' }}><b>MC</b></TableCell>
                                    <TableCell sx={{ width: '100px' }}><b>Rate</b></TableCell>
                                    <TableCell sx={{ width: '100px' }}><b>Discount</b></TableCell>
                                    <TableCell sx={{ width: '200px' }} align="right"><b>Amount</b></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {salesReturnItemTodo?.length > 0 &&
                                    salesReturnItemTodo.map((data, i) => {
                                      return (
                                        <TableRow>
                                          <TableCell>{i + 1}</TableCell>
                                          <TableCell>{data.productname}</TableCell>
                                          <TableCell>{data.hsn}</TableCell>
                                          <TableCell>{data.pieces}</TableCell>
                                          <TableCell>{data.weight || '0.000'}</TableCell>
                                          <TableCell>{data.makingcharge || '0.00'}</TableCell>
                                          <TableCell>{data.rate || '0.00'}</TableCell>
                                          <TableCell>{Number(data.less)?.toFixed(2) || '0.00'}</TableCell>
                                          <TableCell align="right">{data.grossamount || '0.00'}</TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  <TableRow>
                                    <TableCell colSpan={3} align="right"><b>Total</b></TableCell>
                                    <TableCell colSpan={3} align="center"><b>{totalSalesReturnWeight(salesReturnItemTodo) || '0.000'}</b></TableCell>
                                    <TableCell colSpan={2} align="right"></TableCell>
                                    <TableCell colSpan={1} align="right"><b>{totalSalesReturnAmount || '0.00'}</b></TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        </>
                      )}
                      {/* </div> */}
                      <Divider sx={{ my: 1, borderColor: '#000' }} />
                      {/* <div id="pdf-footer-section"> */}
                      {/* Net Total */}
                      {/* <Box sx={{ borderWidth: 1, borderStyle: 'solid', borderRadius: 1, borderColor: 'black', margin: '3px', padding: '5px' }}> */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '5px', paddingRight: '5px' }}>
                        <Typography fontSize={13} fontWeight="bold">
                          {numberToWords(manageSalesCommon.totalsalesamount)}
                        </Typography>
                        <Box>

                          <Typography
                            fontSize={13}
                            fontWeight="bold"
                            textAlign="right"
                          // sx={{ borderTop: "1px solid #000", pt: 1 }}
                          >
                            Net Total&ensp;&ensp;:&ensp;&ensp;&ensp;{manageSalesCommon.totalsalesamount || '0.00'}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1, borderColor: '#000' }} />

                      {/* Footer */}
                      <Grid container spacing={1}>
                        <Grid item xs={7} sx={{ borderRight: '1px solid #000', pb: 0.5 }}>
                          {/* <Typography fontSize={11}>
                                <b>Sales ID:</b> {manageSalesCommon.empcode ? manageSalesCommon.empcode : allUsersLimit[0].empcode.trim()}
                              </Typography> */}
                          <Box sx={{ padding: '5px' }}>
                            <Typography fontSize={8}>{contentValue}</Typography>
                          </Box>
                        </Grid>
                        {/* <Divider orientation="vertical" flexItem sx={{ borderColor: 'black', borderRightWidth: 1, mx: 1, }} /> */}
                        <Grid item xs={2} sx={{ borderRight: '1px solid #000', pb: 0.5 }}>
                          {/* <Typography fontSize={11}>for {manageSalesCommon.company}</Typography> */}
                          <Box mt={10} sx={{ padding: '5px' }}>
                            <Typography fontSize={11}>Purchaser Signature</Typography>
                            {/* <Typography fontSize={10}>{contentValue}</Typography> */}
                          </Box>
                        </Grid>
                        {/* <Divider orientation="vertical" flexItem sx={{ borderColor: 'black', borderRightWidth: 1, mx: 1, marginTop: '10px', marginBottom: '-5px' }} /> */}
                        <Grid item xs={3} textAlign="right">
                          <Box sx={{ paddingRight: '5px' }}>
                            <Typography fontSize={11}>
                              <b>Sales ID&ensp;:&ensp;</b> {manageSalesCommon.empcode ? manageSalesCommon.empcode : allUsersLimit[0].empcode.trim()}
                            </Typography>
                            <Typography fontSize={11}>For {manageSalesCommon.company}</Typography>
                            {/* <Box mt={4}>
                            <Typography fontSize={11}>Purchaser Signature</Typography>
                          </Box> */}
                          </Box>
                        </Grid>
                      </Grid>
                      {/* </div> */}
                    </Box>
                    {/* <Typography
                      variant="caption"
                      align="center"
                      display="block"
                      sx={{
                        position: 'absolute',
                        bottom: '28mm', // just above footer area
                        left: 0,
                        width: '100%',
                        fontSize: 10,
                      }}
                    >
                      Page 1 of 1
                    </Typography> */}
                    {/* </Paper> */}
                  </Box>
                </div>

                {/* 🖼️ Footer Image */}
                {/* <div id="pdf-footer-section" style={{ marginTop: '30px', }}>             */}
                {/* {footer && printLayout && ( */}
                {/* {footer && (
                        // <Box
                        //   component="img"
                        //   src={footer}
                        //   alt="Footer"
                        //   sx={{
                        //     position: 'absolute',
                        //     bottom: '5mm',
                        //     left: '5mm',
                        //     width: '95%',
                        //     height: '6.7%',
                        //     objectFit: 'contain',
                        //   }}
                        // />
                        <img src={footer} alt="Footer" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                               )}
                    </div> */}
                <div id="pdf-footer-section"
                  style={{
                    position: 'absolute',
                    bottom: '5mm',
                    left: '5mm',
                    width: '95%',
                    height: '6.7%',
                    objectFit: 'contain',
                  }}>
                  {footer && <img src={footer} alt="Footer" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                </div>
              </Paper>
            </div>




          </Box>
          <br />


        </>

      )}

      <MessageAlert openPopup={openPopupMalert} handleClosePopup={handleClosePopupMalert} popupContent={popupContentMalert} popupSeverity={popupSeverityMalert} />
      {/* SUCCESS */}
      <AlertDialog openPopup={openPopup} handleClosePopup={handleClosePopup} popupContent={popupContent} popupSeverity={popupSeverity} />

    </Box>
  );
}

export default ManageSales;
