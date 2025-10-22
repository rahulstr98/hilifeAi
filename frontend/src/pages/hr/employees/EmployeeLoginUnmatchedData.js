import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import {
  Backdrop,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  DialogTitle,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Popover,
  Select,
  TextField,
  Typography,
  TableCell,
  TableContainer,
  TableRow,
  TableBody,
  Table,
  TableHead,
} from '@mui/material';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/system';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../../../axiosInstance';
import { saveAs } from 'file-saver';
import Selects from 'react-select';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import moment from 'moment-timezone';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint } from 'react-icons/fa';
import { ThreeDots } from 'react-loader-spinner';
import { useReactToPrint } from 'react-to-print';
import { handleApiError } from '../../../components/Errorhandling';
import Headtitle from '../../../components/Headtitle';
import { AuthContext, UserRoleAccessContext } from '../../../context/Appcontext';
import { userStyle } from '../../../pageStyle';
import { SERVICE } from '../../../services/Baseservice';

import AlertDialog from '../../../components/Alert';
import { DeleteConfirmation } from '../../../components/DeleteConfirmation.js';
import ExportData from '../../../components/ExportData';
import MessageAlert from '../../../components/MessageAlert';

import AggregatedSearchBar from '../../../components/AggregatedSearchBar';
import AggridTable from '../../../components/AggridTable';
import domtoimage from 'dom-to-image';

import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PersonIcon from '@mui/icons-material/Person';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';

const EmployeeLoginUnmatchedData = () => {
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState('');
  const [popupSeverityMalert, setPopupSeverityMalert] = useState('');
  const handleClickOpenPopupMalert = () => {
    //    setSubmitLoader(false);
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

  let exportColumnNames = ['Employee Code', 'Company Name', 'Login Name', 'Company', 'Branch', 'Unit', 'Team', 'Work Mode', 'Designation', 'Department', 'MacAddress', 'LocalIP', 'UserName', 'SystemName', 'Version', "Last Login", 'Date', 'Systemcount', 'Matched Status', 'Status'];
  let exportRowValues = ['empcode', 'companyname', 'userloginname', 'company', 'branch', 'unit', 'team', 'workmode', 'designation', 'department', 'macaddress', 'localip', 'username', 'hostname', 'version', "lastdate", 'date', 'count', 'matchedstatus', 'status'];

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

  const { auth } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState([]);
  const [loginStatusOverall, setLoginStatusOverall] = useState([]);
  const [loginStatusUpdate, setLoginStatusUpdate] = useState([]);
  const [idLoginStatus, setIdLoginStatus] = useState({});
  const { isUserRoleCompare, isUserRoleAccess, isAssignBranch, pageName, setPageName, buttonStyles, workStationSystemName, isServerCurrentdatetime } = useContext(UserRoleAccessContext);

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

  const [isBranch, setIsBranch] = useState(false);

  const [allWorkStationOpt, setAllWorkStationOpt] = useState([]);
  const [primaryValue, setPrimaryValue] = useState('');
  const [primaryWorkStation, setPrimaryWorkStation] = useState('Please Select Work Station');
  const [workstationTodoList, setWorkstationTodoList] = useState([]);
  const [primaryWorkStationLabel, setPrimaryWorkStationLabel] = useState('Please Select Work Station');
  const [workStationOpt, setWorkStationOpt] = useState([]);
  const [filteredWorkStation, setFilteredWorkStation] = useState([]);
  const [valueWorkStation, setValueWorkStation] = useState([]);
  const [empaddform, setEmpaddform] = useState({});
  const [selectedOptionsWorkStation, setSelectedOptionsWorkStation] = useState([]);

  const gridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState('');
  const [copiedData, setCopiedData] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const gridRefTableImg = useRef(null);
  // image
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage
        .toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, 'EmployeeLoginUnmatchedData.png');
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
  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
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

  //Delete model
  const [isDeleteOpen, setisDeleteOpen] = useState(false);
  const handleClickOpendel = () => {
    setisDeleteOpen(true);
  };
  const handleCloseDel = () => {
    setisDeleteOpen(false);
  };

  //Delete model
  const [isDeleteOpenalert, setIsDeleteOpenalert] = useState(false);

  const handleClickOpenalert = () => {
    if (selectedRows.length === 0) {
      setIsDeleteOpenalert(true);
    } else {
    }
  };
  const handleCloseModalert = () => {
    setIsDeleteOpenalert(false);
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
    if (selectedRows.includes(params.row.orginalid)) {
      return 'custom-id-row'; // This is the custom class for rows with item.tat === 'ago'
    }
    return ''; // Return an empty string for other rows
  };

  const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    '& .MuiDataGrid-virtualScroller': {
      overflowY: 'hidden',
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: ' bold !important ',
    },
    '& .custom-id-row': {
      backgroundColor: '#1976d22b !important',
    },

    '& .MuiDataGrid-row.Mui-selected': {
      '& .custom-ago-row, & .custom-in-row, & .custom-others-row': {
        backgroundColor: 'unset !important', // Clear the background color for selected rows
      },
    },
    '&:hover': {
      '& .custom-ago-row:hover': {
        backgroundColor: '#ff00004a !important',
      },
      '& .custom-in-row:hover': {
        backgroundColor: '#ffff0061 !important',
      },
      '& .custom-others-row:hover': {
        backgroundColor: '#0080005e !important',
      },
    },
  }));

  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    company: true,
    branch: true,
    unit: true,
    team: true,
    username: true,
    empcode: true,
    companyname: true,
    userloginname: true,
    macaddress: true,
    lastdate: true,
    matched: true,
    matchedstatus: true,
    localip: true,
    date: true,
    hostname: true,
    department: true,
    designation: true,
    status: true,
    count: true,
    workmode: true,
    version: true,
    actions: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  const fetchBranch = async () => {
    setPageName(!pageName);
    try {
      let res_branch = await axios.get(SERVICE.USER_LOGIN_STATUS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const transformData = (data) => {
        const transformedArray = [];
        data?.forEach((item) => {
          const getwithoutmacstatus = item.loginUserStatus.filter((status, index) => status.macaddress != 'none');
          if (item.loginUserStatus && getwithoutmacstatus.length > 0 && (item.employeecount !== '0' || item.wfhcount !== '0')) {
            const matchedWorkStations = new Set(); // Track matched workstations
            getwithoutmacstatus.forEach((status, index) => {
              if (status?.matchedstatus === 'Not-Matched') {
                const newItem = {
                  _id: item?._id,
                  branch: item.branch,
                  companyname: item.companyname,
                  empcode: item.empcode,
                  designation: item.designation,
                  company: item.company,
                  username: item?.username,
                  unit: item.unit,
                  team: item.team,
                  workmode: item.workmode,
                  department: item.department,
                  loginUserStatus: status,
                  matchedstatus: status?.matchedstatus,
                  count: index + 1,
                  version: status.version,
                  date: status.createdAt ? moment(status.createdAt).format('DD-MM-YYYY hh:mm:ss a') : '',
                };
                transformedArray.push(newItem);
              }
            });
          }
        });
        return transformedArray;
      };
      let Ogdata = res_branch?.data?.users?.filter((item) => accessbranch.some((branch) => branch.company === item.company && branch.branch === item.branch && branch.unit === item.unit));
      const transformedData = transformData(Ogdata);

      const itemsWithSerialNumber = transformedData?.map((item, index) => ({
        ...item,
        serialNumber: index + 1,

        id: index + 1,
        orginalid: item._id,
        empcode: item.empcode,
        companyname: item.companyname,
        company: item.company,
        branch: item.branch,
        unit: item.unit,
        team: item.team,
        workmode: item.workmode,
        userloginname: item?.username,
        designation: item.designation,
        department: item.department,
        matchedstatus: item.matchedstatus,
        macaddress: item?.loginUserStatus?.macaddress,
        localip: item?.loginUserStatus?.localip,
        // status: item?.loginUserStatus?.status,
        username: item?.loginUserStatus?.username,
        hostname: item?.loginUserStatus?.hostname,
        systemshortname: item?.loginUserStatus?.hostname?.slice(0, 15),
        Version: item?.loginUserStatus?.version,
        lastdate: item?.loginUserStatus?.date ? moment(item?.loginUserStatus?.date).format("DD-MM-YYYY hh:mm:ss a") : "",

        count: item?.count,
        status: item?.loginUserStatus?.username ? 'Active' : 'InActive',
        addressid: item?.loginUserStatus?._id,
        date: item?.loginUserStatus?.createdAt ? moment(item?.loginUserStatus?.createdAt).format('DD-MM-YYYY hh:mm:ss a') : '',
      }));
      setLoginStatus(itemsWithSerialNumber);
      setLoginStatusOverall(itemsWithSerialNumber);
      setIsBranch(true);
    } catch (err) {
      setIsBranch(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Excel
  const fileName = 'EmployeeLoginUnmatchedData';
  let excelno = 1;

  const getCode = async (e, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.USER_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setIdLoginStatus(res.data?.suser);
      if (res.data?.suser?.loginUserStatus?.length > 0) {
        const ans = res.data?.suser?.loginUserStatus?.filter((data) => data._id !== name?.addressid);
        setLoginStatusUpdate(ans);
        handleClickOpendel();
      } else {
        console.log('No Reset');
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Alert delete popup
  let branchid = idLoginStatus?._id;
  const delBranch = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${branchid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        loginUserStatus: loginStatusUpdate,
      });
      handleCloseDel();
      await fetchBranch();
      setPage(1);
      setSelectedRows([]);
      setPage(1);

      setPopupContent('Successfully Resetted');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchBranch();
  }, []);

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'EmployeeLoginUnmatchedData',
    pageStyle: 'print',
  });

  const [items, setItems] = useState([]);

  const addSerialNumber = (datas) => {
    setItems(datas);
  };

  useEffect(() => {
    addSerialNumber(loginStatus);
  }, [loginStatus]);
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

  const indexOfLastItem = page * pageSize;

  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }

  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
    <div>
      <Checkbox checked={selectAllChecked} onChange={onSelectAll} />
    </div>
  );
  const [assignPopup, setAssignPopup] = useState(false);
  const [remotePopup, setRemotePopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const handleCloseAssign = () => {
    setAssignPopup(false);

    setFilteredWorkStation([]);

    setPrimaryValue('');
    setPrimaryWorkStation('Please Select Work Station');
    setWorkstationTodoList([]);
    setPrimaryWorkStationLabel('Please Select Work Station');
    setValueWorkStation([]);
    setEmpaddform({});
    setSelectedOptionsWorkStation([]);
    setMaxSelections(0);
    setSelectedUser(null);
  };
  // const [byMe, setByMe] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    fetchWorkStation();
  }, []);
  const [maxSelections, setMaxSelections] = useState(0);
  const fetchWorkStation = async () => {
    setPageName(!pageName);
    setPageName(!pageName);
    try {
      let res = await axios.get(SERVICE.WORKSTATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
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

      setAllWorkStationOpt(
        [
          ...processedResult.map((t) => ({
            label: t,
            value: t.replace(/\([^)]*\)$/, ''),
          })),
        ]
        // .filter((data) => data.value !== primaryWorkStation)
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const deleteTodo = () => {
    setPrimaryWorkStation('Please Select Work Station');
    setPrimaryWorkStationLabel('Please Select Work Station');
    setWorkstationTodoList([]);
  };

  const getCodeNew = async (params) => {
    setPageName(!pageName);

    try {
      let res = await axios.get(`${SERVICE.USER_SINGLE}/${params?.orginalid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setSelectedUser(params);

      setEmpaddform(res?.data?.suser);
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

        const Floor = hyphenCount === 1 ? Bracketsbranch.split('-')[1].trim() : hyphenCount === 2 ? Bracketsbranch.split('-').pop() : Bracketsbranch.split('-').slice(-2).join('-').replace(')', '');

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
          value: t.replace(/\([^)]*\)$/, ''),
        })),
      ];
      let primaryWorkstationNew = res?.data?.suser?.workstation[0] || 'Please Select Work Station';
      let findLabel = workstationsFinal?.find((item) => item.label.includes(primaryWorkstationNew)) || {};

      setFilteredWorkStation(workstationsFinal);
      setPrimaryValue(findLabel?.label || '');
      // setPrimaryWorkStationLabel(findLabel?.label);

      let secondaryWorkstation =
        Array.isArray(res?.data?.suser?.workstation) && res?.data?.suser?.workstation?.length > 1
          ? res?.data?.suser?.workstation?.slice(1)?.map((x) => ({
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
      console.log(allWorkStationOpt, 'allWorkStationOpt');
      console.log(foundDataNew, 'foundDataNew');
      console.log(secondaryWorkstation, 'secondaryWorkstation');
      setSelectedOptionsWorkStation(foundDataNew);
      setValueWorkStation(res?.data?.suser?.workstation);
      setAssignPopup(true);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const submitAssign = async () => {
    setPageName(!pageName);

    try {
      let duplicateItem = [];
      if (Array.isArray(workstationTodoList) && workstationTodoList.length > 0) {
        const firstItem = workstationTodoList[0];

        duplicateItem = valueWorkStation;

        if (firstItem?.type === 'Primary') {
          // Replace the first index of valueWorkStation
          if (duplicateItem.length > 0) {
            duplicateItem[0] = firstItem.workstation;
          } else {
            duplicateItem.push(firstItem.workstation); // if it's empty
          }
        } else if (firstItem?.type === 'Secondary') {
          // Add to the end of valueWorkStation only if not already present
          if (!duplicateItem.includes(firstItem.workstation)) {
            duplicateItem.push(firstItem.workstation);
          }
        }
      }

      let check = duplicateItem?.filter((item) => item !== null)?.length;
      console.log(duplicateItem, 'duplicateItem');

      if (workstationTodoList?.length === 0 || duplicateItem?.length === 0) {
        setPopupContentMalert('Please Select Work Station');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else if (selectedUser?.hostname !== workstationTodoList[0]?.shortname) {
        setPopupContentMalert('Selected Work Station Not Matched With System Name');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else if (maxSelections < check) {
        setPopupContentMalert(`Work Station Exceeds System Count(${maxSelections || 0})`);
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else {
        await axios.put(
          `${SERVICE.UPDATEANYLOG}/?logid=${selectedUser?.addressid}&logname=loginUserStatus`,
          {
            matchedstatus: 'Matched',
            matched: `${workstationTodoList[0]?.type || ''} WorkStation`,
            workstation: workstationTodoList[0]?.workstation || '',
          },
          {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
          }
        );

        const updatedBoardingLog = empaddform?.boardingLog?.map((item, index, array) => {
          if (index === array.length - 1) {
            return {
              ...item,
              workstation: duplicateItem, // <- Update only this
              ischangeworkstation: true,
            };
          }
          return item;
        });

        await axios.put(`${SERVICE.USER_SINGLE_PWD}/${empaddform?._id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          workstation: duplicateItem,
          workstationshortname: empaddform?.workstationshortname?.length > 0 ? [...empaddform?.workstationshortname, workstationTodoList[0]?.shortname] : [workstationTodoList[0]?.shortname],
          boardingLog: updatedBoardingLog,
          updatedby: [
            ...empaddform?.updatedby,
            {
              name: String(isUserRoleAccess.companyname),
              date: String(new Date()),
            },
          ],
        });
        handleCloseAssign();

        setPopupContent('Assigned Successfully');
        setPopupSeverity('success');
        handleClickOpenPopup();
        await fetchBranch();
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const columnDataTable = [
    {
      field: 'serialNumber',
      headerName: 'SNo',
      flex: 0,
      width: 80,
      hide: !columnVisibility.serialNumber,
      headerClassName: 'bold-header',
      pinned: 'left',
    },
    { field: 'empcode', headerName: 'Employee Code', pinned: 'left', flex: 0, width: 160, hide: !columnVisibility.empcode, headerClassName: 'bold-header' },
    { field: 'companyname', headerName: 'Employee Name', pinned: 'left', flex: 0, width: 180, hide: !columnVisibility.companyname, headerClassName: 'bold-header' },
    { field: 'userloginname', headerName: 'Login Name', flex: 0, width: 150, hide: !columnVisibility.userloginname, headerClassName: 'bold-header' },
    { field: 'company', headerName: 'Company', flex: 0, width: 100, hide: !columnVisibility.company, headerClassName: 'bold-header' },
    { field: 'branch', headerName: 'Branch', flex: 0, width: 130, hide: !columnVisibility.branch, headerClassName: 'bold-header' },
    { field: 'unit', headerName: 'Unit', flex: 0, width: 120, hide: !columnVisibility.unit, headerClassName: 'bold-header' },
    { field: 'team', headerName: 'Team', flex: 0, width: 120, hide: !columnVisibility.team, headerClassName: 'bold-header' },
    { field: 'workmode', headerName: 'Work Mode', flex: 0, width: 120, hide: !columnVisibility.workmode, headerClassName: 'bold-header' },
    { field: 'designation', headerName: 'Designation', flex: 0, width: 150, hide: !columnVisibility.designation, headerClassName: 'bold-header' },
    { field: 'department', headerName: 'Department', flex: 0, width: 150, hide: !columnVisibility.department, headerClassName: 'bold-header' },
    { field: 'macaddress', headerName: 'Mac Address', flex: 0, width: 175, hide: !columnVisibility.macaddress, headerClassName: 'bold-header' },
    { field: 'localip', headerName: 'Local Ip', flex: 0, width: 175, hide: !columnVisibility.localip, headerClassName: 'bold-header' },
    { field: 'username', headerName: 'UserName', flex: 0, width: 150, hide: !columnVisibility.username, headerClassName: 'bold-header' },
    { field: 'hostname', headerName: 'SystemName', flex: 0, width: 150, hide: !columnVisibility.hostname, headerClassName: 'bold-header' },
    { field: 'matchedstatus', headerName: 'Matched Status', flex: 0, width: 200, hide: !columnVisibility.matchedstatus, headerClassName: 'bold-header' },
    { field: 'version', headerName: 'Version', flex: 0, width: 200, hide: !columnVisibility.version, headerClassName: 'bold-header' },
    { field: "lastdate", headerName: "Last Login", flex: 0, width: 200, hide: !columnVisibility.lastdate, headerClassName: "bold-header" },

    { field: 'date', headerName: 'Date', flex: 0, width: 200, hide: !columnVisibility.date, headerClassName: 'bold-header' },
    { field: 'count', headerName: 'Systemcount', flex: 0, width: 100, hide: !columnVisibility.count, headerClassName: 'bold-header' },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0,
      width: 100,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      hide: !columnVisibility.status,
      headerClassName: 'bold-header',
      cellRenderer: (params) => {
        return (
          <Grid>
            <Button
              size="small"
              sx={{
                textTransform: 'capitalize',
                borderRadius: '4px',
                boxShadow: 'none',
                fontWeight: '500',
                display: 'flex',
                color: 'white',
                backgroundColor: params.data.status === 'Active' ? 'green' : 'red',
                '&:hover': {
                  backgroundColor: params.data.status === 'Active' ? 'green' : 'red',
                },
              }}
            >
              {params.data.status}
            </Button>
          </Grid>
        );
      },
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
        <Grid sx={{ display: 'flex', gap: 1 }}>
          {isUserRoleCompare?.includes('eemployeeloginstatus') && (
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                getCode(params.data.orginalid, params.data);
              }}
            >
              Reset
            </Button>
          )}
          <Button
            color="secondary"
            variant="outlined"
            startIcon={<AssignmentIndIcon />}
            onClick={() => {
              if (params?.data?.workmode === 'Remote') {
                setSelectedUser(params.data);
                setRemotePopup(true);
              } else {
                getCodeNew(params.data);
              }
            }}
          >
            Assign
          </Button>
        </Grid>
      ),
    },
  ];

  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item.id,
      orginalid: item.orginalid,
      serialNumber: item.serialNumber,
      empcode: item.empcode,
      companyname: item.companyname,
      userloginname: item.userloginname,
      company: item.company,
      branch: item.branch,
      unit: item.unit,
      team: item.team,
      workmode: item.workmode,
      username: item.username,
      designation: item.designation,
      department: item.department,
      lastdate: item.lastdate,
      macaddress: item.macaddress,
      localip: item.localip,
      hostname: item.hostname,
      systemshortname: item.systemshortname,
      version: item.version,
      status: item?.status,
      count: item.count,
      addressid: item.addressid,
      date: item.date,
      matchedstatus: item.matchedstatus,
    };
  });

  console.log(rowDataTable, 'rowDataTable');

  const rowsWithCheckboxes = rowDataTable.map((row) => ({
    ...row,
    // Create a custom field for rendering the checkbox
    checkbox: selectedRows.includes(row.orginalid),
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
    <Box style={{ padding: '10px', minWidth: '325px', '& .MuiDialogContent-root': { padding: '10px 0' } }}>
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

  return (
    <>
      <Headtitle title={'EMPLOYEE LOGIN STATUS'} />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes('lemployeeloginstatus') && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Employee Login UnMatched List</Typography>
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
                    <MenuItem value={loginStatus?.length}>All</MenuItem>
                  </Select>
                </Box>
              </Grid>
              <Grid item md={8} xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box>
                  {isUserRoleCompare?.includes('excelemployeeloginstatus') && (
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
                  {isUserRoleCompare?.includes('csvemployeeloginstatus') && (
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
                  {isUserRoleCompare?.includes('printemployeeloginstatus') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('pdfemployeeloginstatus') && (
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
                  {isUserRoleCompare?.includes('imageemployeeloginstatus') && (
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
                  maindatas={loginStatus}
                  setSearchedString={setSearchedString}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  paginated={false}
                  totalDatas={loginStatusOverall}
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
            {/* {isUserRoleCompare?.includes("bdbranch") && (
                            <Button variant="contained" color="error" onClick={handleClickOpenalert}>
                                Bulk Delete
                            </Button>
                        )} */}
            <br />
            <br />
            {!isBranch ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {/* <CircularProgress color="inherit" />  */}
                  <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
                </Box>
              </>
            ) : (
              <>
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
                  itemsList={loginStatusOverall}
                />
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
      {/* ****** Table End ****** */}

      {/* ALERT DIALOG */}
      <Box>
        <Dialog open={isErrorOpenpop} onClose={handleCloseerrpop} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">{showAlertpop}</Typography>
          </DialogContent>
          <DialogActions>
            {isLoading ? (
              <>
                <Backdrop sx={{ color: 'blue', zIndex: (theme) => theme.zIndex.drawer + 2 }} open={isLoading}>
                  <CircularProgress color="inherit" />
                </Backdrop>
              </>
            ) : (
              <>
                <Grid>
                  <Button
                    variant="contained"
                    sx={buttonStyles.buttonsubmit}
                    onClick={() => {
                      handleCloseerrpop();
                    }}
                  >
                    ok
                  </Button>
                </Grid>
              </>
            )}
            <Button sx={buttonStyles.btncancel} onClick={handleCloseerrpop}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
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
        itemsTwo={loginStatusOverall ?? []}
        filename={fileName}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />

      {/*SINGLE DELETE ALERT DIALOG ARE YOU SURE? */}
      <DeleteConfirmation open={isDeleteOpen} onClose={handleCloseDel} onConfirm={delBranch} title="Are you sure you want to Reset?" confirmButtonText="Yes" cancelButtonText="Cancel" />

      {/* EXTERNAL COMPONENTS -------------- END */}

      <Dialog open={remotePopup} onClose={() => setRemotePopup(false)}>
        <DialogTitle>
          <WarningAmberIcon sx={{ color: 'orange', mr: 1 }} />
          Confirm Redirect
        </DialogTitle>
        <DialogContent>
          <Typography>{selectedUser?.companyname} was in remote work mode, do you want to redirect to Remote Employee List page?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRemotePopup(false);
              navigate('/remoteemployeelist');
            }}
            startIcon={<CheckCircleIcon />}
            color="success"
            variant="contained"
          >
            Yes
          </Button>
          <Button onClick={() => setRemotePopup(false)} startIcon={<CancelIcon />} color="error" variant="outlined">
            No
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={assignPopup} onClose={() => handleCloseAssign()} maxWidth="md" fullWidth>
        <DialogTitle>
          <PersonIcon sx={{ color: 'blue', mr: 1 }} />
          Assign Work Station
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Employee Name:</strong> {empaddform?.companyname}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Employee Code:</strong> {empaddform?.empcode}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Company:</strong> {empaddform?.company || '—'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Branch:</strong> {empaddform?.branch || '—'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Unit:</strong> {empaddform?.unit || '—'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Floor:</strong> {empaddform?.floor || '—'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Primary Work Station:</strong> {primaryValue || '—'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Secondary Work Station:</strong> {selectedOptionsWorkStation?.length > 0 ? selectedOptionsWorkStation?.map((data) => data?.label)?.join(', ') : '—'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>System Count:</strong> {maxSelections || '0'}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControl size="small" fullWidth>
                <Typography>
                  Work Station <b style={{ color: 'red' }}>*</b>
                </Typography>

                <Selects
                  maxMenuHeight={250}
                  options={filteredWorkStation.filter((item, index, self) => {
                    return index === self.findIndex((i) => i.value === item.value) && !valueWorkStation?.includes(item?.value);
                  })}
                  placeholder="Please Select Work Station"
                  value={{
                    label: primaryWorkStationLabel ? primaryWorkStationLabel : 'Please Select Work Station',
                    value: primaryWorkStation ? primaryWorkStation : 'Please Select Work Station',
                  }}
                  onChange={(e) => {
                    const isValue = e.value.replace(/\([^)]*\)$/, '');
                    setPrimaryWorkStation(e.value);
                    setPrimaryWorkStationLabel(e.label);
                    // setSelectedOptionsWorkStation([]);
                    // setValueWorkStation([]);

                    // Remove selected object from selectedOptionsWorkStation array

                    const matches = e.label.match(/^(.*?)\((.*?)\)\((.*?)\)$/);

                    // let setWorkTodo = workstationTodoList?.filter((data) => data?.type !== 'Primary' && data?.shortname !== matches?.[3]) || [];
                    const invalidPrimaryValues = ['please select primary workstation', 'select primary workstation', '', undefined, 'please select primary work station', 'select primary work station', 'primary workstation', 'primary work station'];

                    const isPrimary = !valueWorkStation?.length || invalidPrimaryValues.includes((valueWorkStation?.[0] || '').toLowerCase());

                    setWorkstationTodoList((prev) => [
                      {
                        workstation: matches?.[1]?.trim() + '(' + matches?.[2]?.trim() + ')', // G-HRA(TTS-TRICHY-Ground Floor)
                        shortname: matches?.[3],
                        type: isPrimary ? 'Primary' : 'Secondary',
                      },
                      // ...setWorkTodo,
                    ]);

                    const selectedCabinName = e?.value?.split('(')[0];
                    const Bracketsbranch = e?.value.match(/\(([^)]+)\)/)?.[1];
                    const hyphenCount = Bracketsbranch.split('-').length - 1;

                    const Branch = hyphenCount === 1 ? Bracketsbranch.split('-')[0].trim() : Bracketsbranch?.split('-').slice(0, 2).join('-');

                    const Floor = hyphenCount === 1 ? Bracketsbranch.split('-')[1].trim() : hyphenCount === 2 ? Bracketsbranch.split('-').pop() : Bracketsbranch.split('-').slice(-2).join('-').replace(')', '');

                    console.log(workStationSystemName, 'workStationSystemName');

                    // const shortname = workStationSystemName
                    //   ?.filter((item) => item?.branch === Branch && (Floor === '' || Floor === item?.floor) && item?.cabinname === selectedCabinName)
                    //   ?.map((item) => item?.systemshortname)
                    //   ?.toString();

                    // setPrimaryKeyShortname(`${shortname},`);
                    // setKeyShortname('');
                  }}
                // menuPortalTarget={document.body}
                // styles={{
                //   menuPortal: (base) => ({ ...base, zIndex: 1500 }),
                // }}
                // formatOptionLabel={(data) => {
                //   let value = data?.label;
                //   if (!value) {
                //     value = 'Please Select Work Station';
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
            </Grid>

            <Grid item xs={12}>
              {/* <Grid item md={8} xs={12} sm={12}> */}
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              // Submit your data here
              // console.log('Submitted for:', selectedUser, 'By:', byMe);
              // setAssignPopup(false);
              submitAssign();
            }}
            startIcon={<CheckCircleIcon />}
            color="primary"
            variant="contained"
          >
            Submit
          </Button>
          <Button onClick={() => handleCloseAssign()} startIcon={<CancelIcon />} color="error" variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmployeeLoginUnmatchedData;
