import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Button,
  OutlinedInput,
  DialogActions,
  DialogContent,
  Dialog,
  FormControl,
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
  TableBody,
  Table, TableHead,
} from "@mui/material";
import { ExportXL, ExportCSV } from "../../../../components/Export";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Switch from "@mui/material/Switch";
import { StyledTableRow, StyledTableCell } from "../../../../components/Table";
import axios from "axios";
import { saveAs } from "file-saver";
import "jspdf-autotable";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFilePdf, FaPrint } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import { MultiSelect } from "react-multi-select-component";
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import { handleApiError } from "../../../../components/Errorhandling";
import Headtitle from "../../../../components/Headtitle";
import { AuthContext, UserRoleAccessContext } from "../../../../context/Appcontext";
import { userStyle, colourStyles } from "../../../../pageStyle";
import { SERVICE } from "../../../../services/Baseservice";
import domtoimage from 'dom-to-image';
import { FaFileCsv, FaFileExcel } from "react-icons/fa";
import AggregatedSearchBar from '../../../../components/AggregatedSearchBar';
import AggridTable from "../../../../components/AggridTable";
import AlertDialog from "../../../../components/Alert";
import ExportData from "../../../../components/ExportData";
import MessageAlert from "../../../../components/MessageAlert";
import PageHeading from "../../../../components/PageHeading";
// import { colourStyles, userStyle } from "../../../../pageStyle";

function BiometricTeamAttendanceReport() {
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
  const [modeselection, setModeSelection] = useState({ label: 'My Hierarchy List', value: 'myhierarchy' });
  const [sectorSelection, setSectorSelection] = useState({ label: 'Primary', value: 'Primary' });

  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState('');
  const [popupSeverityMalert, setPopupSeverityMalert] = useState('');
  const [isAttendanceList, setIsAttendanceList] = useState(false);
  const [AttendanceList, setAttendanceList] = useState({});
  // page refersh reload
  const handleClickOpenAttendanceList = () => {
    setIsAttendanceList(true);
  };
  const handleCloseAttendanceList = () => {
    setIsAttendanceList(false);
    setAttendanceList({});
  };
  const handleClickOpenPopupMalert = () => {
    setOpenPopupMalert(true);
  };
  const handleClosePopupMalert = () => {
    setOpenPopupMalert(false);
  };
  const [totalProjects, setTotalProjects] = useState(0);

  const [openPopup, setOpenPopup] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [popupSeverity, setPopupSeverity] = useState('');
  const handleClickOpenPopup = () => {
    setOpenPopup(true);
  };
  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
  const [isHandleChange, setIsHandleChange] = useState(false);

  const [isAllUsers, setIsAllUsers] = useState([]);
  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };
  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };
  const [fileFormat, setFormat] = useState('');
  let exportColumnNamescrt = ['Shift Date', 'In Time', 'Verified IN Device', 'Verified By(IN)', 'Out Time', 'Verified OUT Device', 'Verified By(OUT)', 'Total Hours', 'Shift Type', 'Company', 'Branch ', 'Unit', 'Team', 'Department', 'Employee Name', 'Username', 'Device Common Name'];
  let exportRowValuescrt = ['shiftdate', 'inTime', 'inTimeVerifiedDevice', 'inTimeVerified', 'outTime', 'outTimeVerifiedDevice', 'outTimeVerified', 'totalHours', 'shifttype', 'company', 'branch', 'unit', 'team', 'department', 'companyname', 'staffNameC', 'biometriccommonname'];
  const gridRef = useRef(null);
  const gridRefTable = useRef(null);
  //useStates
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState('');
  const [meetingArray, setMeetingArray] = useState([]);
  const { isUserRoleCompare, isUserRoleAccess, isAssignBranch, allTeam, pageName, setPageName, buttonStyles, allUsersData } = useContext(UserRoleAccessContext);

  const accessbranch = isUserRoleAccess?.role?.includes('Manager')
    ? isAssignBranch?.map((data) => ({
      branch: data.branch,
      company: data.company,
      unit: data.unit,
      branchaddress: data?.branchaddress,
    }))
    : isAssignBranch
      ?.filter((data) => {
        let fetfinalurl = [];
        if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0 && data?.mainpagenameurl?.length !== 0 && data?.subpagenameurl?.length !== 0 && data?.subsubpagenameurl?.length !== 0 && data?.submodulenameurl?.includes(window.location.pathname)) {
          fetfinalurl = data.subsubpagenameurl;
        } else if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0 && data?.mainpagenameurl?.length !== 0 && data?.subpagenameurl?.length !== 0 && data?.submodulenameurl?.includes(window.location.pathname)) {
          fetfinalurl = data.subpagenameurl;
        } else if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0 && data?.mainpagenameurl?.length !== 0 && data?.submodulenameurl?.includes(window.location.pathname)) {
          fetfinalurl = data.mainpagenameurl;
        } else if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0 && data?.submodulenameurl?.includes(window.location.pathname)) {
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
        branchaddress: data?.branchaddress,
      }));
  const [DisableLevelDropdown, setDisableLevelDropdown] = useState(false)

  const { auth } = useContext(AuthContext);
  const [loader, setLoader] = useState(false);
  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchedString, setSearchedString] = useState('');
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    company: true,
    branch: true,
    unit: true,
    team: true,
    inTime: true,
    inTimeVerified: true,
    inTimeVerifiedDevice: true,
    outTime: true,
    outTimeVerified: true,
    outTimeVerifiedDevice: true,
    modifiedData: true,
    companyname: true,
    actions: true,
    staffNameC: true,
    department: true,
    shiftdate: true,
    statusreport: true,
    totalHours: true,
    shifttype: true,
    biometriccommonname: true,
  };
  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;
  const [filterUser, setFilterUser] = useState({ fromdate: today, todate: today });

  const [selectedMode, setSelectedMode] = useState('Today');
  const mode = [
    { label: 'Today', value: 'Today' },
    { label: 'Yesterday', value: 'Yesterday' },
    { label: 'Last Week', value: 'Last Week' },
    { label: 'Last Month', value: 'Last Month' },
    { label: 'Custom', value: 'Custom' },
  ];
  const getDateRange = (mode) => {
    const today = new Date();
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
      case 'Yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        fromdate = todate = formatDate(yesterday);
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
  useEffect(() => {
    // Save column visibility to localStorage whenever it changes
    localStorage.setItem('columnVisibility', JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  useEffect(() => {
    // Retrieve column visibility from localStorage (if available)
    const savedVisibility = localStorage.getItem('columnVisibility');
    if (savedVisibility) {
      setColumnVisibility(JSON.parse(savedVisibility));
    }
  }, []);

  //set function to get particular row
  const fetchAllUsers = async (id, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.ALLUSERENQLIVE}`, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
      });
      setIsAllUsers(res?.data?.users);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    addSerialNumber(meetingArray);
  }, [meetingArray]);

  const getapi = async () => {
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String('BiometricTeamAttendanceReport'),
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

  useEffect(() => {
    fetchAllUsers();
    getapi();
  }, []);
  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, []);

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ''; // This is required for Chrome support
  };
  const username = isUserRoleAccess.username;
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

  const [filterState, setFilterState] = useState({
    type: 'Individual',
  });

  const TypeOptions = [
    { label: 'Individual', value: 'Individual' },
    { label: 'Department', value: 'Department' },
    { label: 'Company', value: 'Company' },
    { label: 'Branch', value: 'Branch' },
    { label: 'Unit', value: 'Unit' },
    { label: 'Team', value: 'Team' },
    { label: 'Deactivate', value: 'Deactivate' },
  ];
  //company multiselect
  const [selectedOptionsCompany, setSelectedOptionsCompany] = useState([]);
  let [valueCompanyCat, setValueCompanyCat] = useState([]);

  const handleCompanyChange = (options) => {
    setValueCompanyCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsCompany(options);
    setValueBranchCat([]);
    setSelectedOptionsBranch([]);
    setValueUnitCat([]);
    setSelectedOptionsUnit([]);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
    setValueDepartmentCat([]);
    setSelectedOptionsDepartment([]);
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };

  const customValueRendererCompany = (valueCompanyCat, _categoryname) => {
    return valueCompanyCat?.length ? valueCompanyCat.map(({ label }) => label)?.join(', ') : 'Please Select Company';
  };

  //branch multiselect
  const [selectedOptionsBranch, setSelectedOptionsBranch] = useState([]);
  let [valueBranchCat, setValueBranchCat] = useState([]);

  const handleBranchChange = (options) => {
    setValueBranchCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsBranch(options);
    setValueUnitCat([]);
    setSelectedOptionsUnit([]);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
    setValueDepartmentCat([]);
    setSelectedOptionsDepartment([]);
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };

  const customValueRendererBranch = (valueBranchCat, _categoryname) => {
    return valueBranchCat?.length ? valueBranchCat.map(({ label }) => label)?.join(', ') : 'Please Select Branch';
  };

  //unit multiselect
  const [selectedOptionsUnit, setSelectedOptionsUnit] = useState([]);
  let [valueUnitCat, setValueUnitCat] = useState([]);

  const handleUnitChange = (options) => {
    setValueUnitCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsUnit(options);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
    setValueDepartmentCat([]);
    setSelectedOptionsDepartment([]);
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };

  const customValueRendererUnit = (valueUnitCat, _categoryname) => {
    return valueUnitCat?.length ? valueUnitCat.map(({ label }) => label)?.join(', ') : 'Please Select Unit';
  };

  //team multiselect
  const [selectedOptionsTeam, setSelectedOptionsTeam] = useState([]);
  let [valueTeamCat, setValueTeamCat] = useState([]);

  const handleTeamChange = (options) => {
    setValueTeamCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsTeam(options);
    setValueDepartmentCat([]);
    setSelectedOptionsDepartment([]);
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };

  const customValueRendererTeam = (valueTeamCat, _categoryname) => {
    return valueTeamCat?.length ? valueTeamCat.map(({ label }) => label)?.join(', ') : 'Please Select Team';
  };

  //department multiselect
  const [selectedOptionsDepartment, setSelectedOptionsDepartment] = useState([]);
  let [valueDepartmentCat, setValueDepartmentCat] = useState([]);

  const handleDepartmentChange = (options) => {
    setValueDepartmentCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsDepartment(options);
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };

  const customValueRendererDepartment = (valueDepartmentCat, _categoryname) => {
    return valueDepartmentCat?.length ? valueDepartmentCat.map(({ label }) => label)?.join(', ') : 'Please Select Department';
  };
  //employee multiselect
  const [selectedOptionsEmployee, setSelectedOptionsEmployee] = useState([]);
  let [valueEmployeeCat, setValueEmployeeCat] = useState([]);

  const handleEmployeeChange = (options) => {
    setValueEmployeeCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsEmployee(options);
  };

  const customValueRendererEmployee = (valueEmployeeCat, _categoryname) => {
    return valueEmployeeCat?.length ? valueEmployeeCat.map(({ label }) => label)?.join(', ') : 'Please Select Employee';
  };

  //Work Mode multiselect
  const [selectedOptionsWorkMode, setSelectedOptionsWorkMode] = useState([]);
  let [valueWorkMode, setValueWorkMode] = useState([]);

  const handleWorkModeChange = (options) => {
    setValueWorkMode(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsWorkMode(options);
  };

  const customValueRendererWorkMode = (valueWorkMode, _categoryname) => {
    return valueWorkMode?.length ? valueWorkMode?.map(({ label }) => label)?.join(', ') : 'Please Select Work Mode';
  };

  useEffect(() => {
    fetchDepartments();
  }, []);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const fetchDepartments = async () => {
    try {
      let req = await axios.get(SERVICE.DEPARTMENT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDepartmentOptions(
        req?.data?.departmentdetails?.map((data) => ({
          label: data?.deptname,
          value: data?.deptname,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const TypeCompany = allUsersData
    ?.filter((u) => valueCompanyCat?.includes(u.company))
    .map((u) => ({
      //   ...u,
      label: u.companyname,
      value: u.companyname,
      userid: u._id,
      username: u.username,
    }));

  const TypeBranch = allUsersData
    ?.filter((u) => valueCompanyCat?.includes(u.company) && valueBranchCat?.includes(u.branch))
    .map((u) => ({
      //   ...u,
      label: u.companyname,
      value: u.companyname,
      userid: u._id,
      username: u.username,
    }));

  const TypeUnit = allUsersData
    ?.filter((u) => valueCompanyCat?.includes(u.company) && valueBranchCat?.includes(u.branch) && valueUnitCat?.includes(u.unit))
    .map((u) => ({
      //   ...u,
      label: u.companyname,
      value: u.companyname,
      userid: u._id,
      username: u.username,
    }));

  const TypeTeam = allUsersData
    ?.filter((u) => valueCompanyCat?.includes(u.company) && valueBranchCat?.includes(u.branch) && valueUnitCat?.includes(u.unit) && valueTeamCat?.includes(u.team))
    .map((u) => ({
      //   ...u,
      label: u.companyname,
      value: u.companyname,
      userid: u._id,
      username: u.username,
    }));

  const TypeDepart = allUsersData
    ?.filter((u) => valueCompanyCat?.includes(u.company) && valueDepartmentCat?.includes(u.department))
    .map((u) => ({
      //   ...u,
      label: u.companyname,
      value: u.companyname,
      userid: u._id,
      username: u.username,
    }));

  const TypeEmployee = allUsersData
    ?.filter((u) => valueCompanyCat?.includes(u.company) && valueBranchCat?.includes(u.branch) && valueUnitCat?.includes(u.unit) && valueTeamCat?.includes(u.team) && valueEmployeeCat?.includes(u.companyname))
    .map((u) => ({
      //   ...u,
      label: u.companyname,
      value: u.companyname,
      userid: u._id,
      username: u.username,
    }));

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
  //add function
  const sendRequest = async () => {
    setLoader(true);
    setPageName(!pageName);
    const today = new Date();
    let startMonthDate, endMonthDate;
    endMonthDate = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    startMonthDate = new Date();

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

    try {
      const response = await axios.post(SERVICE.BIOMETRIC_USERS_TEAM_ATTENDANCE_REPORT_CHECK, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        hierachy: modeselection.value,
        sector: sectorSelection.value,
        username: isUserRoleAccess.companyname,
        team: isUserRoleAccess.team,
        pagename: 'menubiometricteamattendancereport',
        userDates: daysArray,
        dateNow: new Date(),
        role: isUserRoleAccess.role
      });
      console.log(response?.data, "attendance")
      setDisableLevelDropdown(response?.data?.DataAccessMode)
      if (!response?.data?.DataAccessMode && response?.data?.resultedTeam?.length > 0 && response?.data?.hierarchyNames?.length < 1 && ['myallhierarchy', 'allhierarchy']?.includes(modeselection.value)) {
        alert('Some employees have not been given access to this page.');
        setLoader(false);
      }
      // setMeetingArray(response?.data?.filteredData)
      setMeetingArray(response?.data?.filteredData?.map((data, index) => ({ ...data, serialNumber: index + 1 })));
      setLoader(false);
    } catch (err) {
      console.log(err, 'err');
      setLoader(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //submit option for saving
  const handleSubmit = async (e) => {
    e.preventDefault();
    sendRequest();
  };

  const handleclear = (e) => {
    e.preventDefault();
    setFilterState({
      type: 'Individual',
    });
    setSelectedMode('Today');
    setFilterUser({ fromdate: today, todate: today });
    setFilteredRowData([]);
    setFilteredChanges(null);
    setSelectedOptionsEmployee([]);
    setValueCompanyCat([]);
    setSelectedOptionsCompany([]);
    setValueBranchCat([]);
    setSelectedOptionsBranch([]);
    setValueUnitCat([]);
    setSelectedOptionsUnit([]);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
    setMeetingArray([]);
    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
    setLoader(false);
  };

  const gridRefTableImg = useRef(null);
  // image
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage
        .toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, 'BiometricTeamAttendanceReport.png');
        })
        .catch((error) => {
          console.error('dom-to-image error: ', error);
        });
    }
  };
  // Excel
  const fileName = 'BiometricTeamAttendanceReport';
  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Biometric Team Attendance Report',
    pageStyle: 'print',
  });
  const addSerialNumber = (datas) => {
    setItems(datas);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setSelectedRows([]);
    setPage(1);
  };
  //datatable....

  // Split the search query into individual terms
  const searchOverAllTerms = searchQuery.toLowerCase().split(' ');
  // Modify the filtering logic to check each term
  const filteredDatas = items?.filter((item) => {
    return searchOverAllTerms.every((term) => Object.values(item).join(' ').toLowerCase().includes(term));
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

  const tableHeadCellStyle = { padding: '5px 10px', fontSize: '14px', boxShadow: 'none', width: 'max-content' };
  const tableBodyCellStyle = { padding: '5px 10px', width: 'max-content' };
  const getCode = async (e) => {
    setAttendanceList(e);
    handleClickOpenAttendanceList();
  };

  //print...
  const componentRefPopUp = useRef();
  //image
  const handleCaptureImagePopUp = () => {
    if (componentRefPopUp.current) {
      html2canvas(componentRefPopUp.current).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, 'BiometricBranchWiseExitReport.png');
        });
      });
    }
  };

  const handleprintPopUp = useReactToPrint({
    content: () => componentRefPopUp.current,
    documentTitle: 'Biometric Branch Wise Exit Report',
    pageStyle: 'print',
  });

  const [applyData, setApplyData] = useState([]);

  // get particular columns for export excel
  const getexcelDatas = () => {
    var data = AttendanceList?.modifiedData?.map((t, index) => ({
      Sno: index + 1,
      'User Name': t.username,
      'Company Name': t.companyname,
      'Employee Code': t.empcode,
      'Shift Date': t.shiftdate,
      'Shift Time': t.shift,
      'Shift Type': t.shifttype,
      'In Time': t.startTime,
      'Verified IN Device': t.inTimeVerifiedDevice,
      'Verified By(IN)': t.inTimeVerified,
      'Out Time': t.endTime,
      'Verified OUT Device': t.outTimeVerifiedDevice,
      'Verified By(OUT)': t.outTimeVerified,
      'Total Hours (hh:mm:ss)': t.totalHours,
      'Break (HH:MM::SS)': t.break,
    }));
    setApplyData(data);
  };
  useEffect(() => {
    getexcelDatas();
  }, [AttendanceList]);

  // pdf.....
  const columns = [
    // { title: "Sno", field: "serialNumber" },
    { title: 'Shift Date', field: 'shiftdate' },
    { title: 'User Name', field: 'username' },
    { title: 'Company Name', field: 'companyname' },
    { title: 'Employee Code', field: 'empcode' },
    { title: 'Shift Date', field: 'shiftdate' },
    { title: 'Shift Time', field: 'shift' },
    { title: 'Shift Type', field: 'shifttype' },
    { title: 'In Time', field: 'startTime' },
    { title: 'Verified IN Device', field: 'inTimeVerifiedDevice' },
    { title: 'Verified By(IN)', field: 'inTimeVerified' },
    { title: 'Out Time', field: 'endTime' },
    { title: 'Verifird OUT Device', field: 'outTimeVerifiedDevice' },
    { title: 'Verifird By(OUT)', field: 'outTimeVerified' },
    { title: 'Total Hours (hh:mm:ss)', field: 'totalHours' },
    { title: 'Break (hh:mm:ss)', field: 'break' },
  ];
  const downloadPdf = () => {
    const doc = new jsPDF();
    const columnsWithSerial = [
      // Serial number column
      { title: 'SNo', dataKey: 'serialNumber' },
      ...columns.map((col) => ({ ...col, dataKey: col.field })),
    ];
    // Add a serial number to each row
    const itemsWithSerial = AttendanceList?.modifiedData?.map((t, index) => ({
      // ...t,
      serialNumber: index + 1,
      staffNameC: t.staffNameC,
      companyname: t.companyname,
      empcode: t.empcode,
      shiftdate: t.shiftdate,
      shift: t.shift,
      shifttype: t.shifttype,
      startTime: t.startTime,
      inTimeVerifiedDevice: t.inTimeVerifiedDevice,
      inTimeVerified: t.inTimeVerified,
      endTime: t.endTime,
      outTimeVerifiedDevice: t.outTimeVerifiedDevice,
      outTimeVerified: t.outTimeVerified,
      totalHours: t.totalHours,
      break: t.break,
    }));
    doc.autoTable({
      theme: 'grid',
      styles: {
        fontSize: 4,
      },
      columns: columnsWithSerial,
      body: itemsWithSerial,
    });
    doc.save('Biometric Team Attendance Report.pdf');
  };

  const columnDataTable = [
    {
      field: 'serialNumber',
      headerName: 'SNo',
      flex: 0,
      width: 100,
      hide: !columnVisibility.serialNumber,
      headerClassName: 'bold-header',
      pinned: 'left',
      lockPinned: true,
    },
    {
      field: 'shiftdate',
      headerName: 'Shift Date',
      flex: 0,
      width: 150,
      hide: !columnVisibility.shiftdate,
      headerClassName: 'bold-header',
    },
    {
      field: 'inTime',
      headerName: 'In Time',
      flex: 0,
      width: 200,
      hide: !columnVisibility.inTime,
      headerClassName: 'bold-header',
    },
    {
      field: 'inTimeVerifiedDevice',
      headerName: 'Verified In Device',
      flex: 0,
      width: 200,
      hide: !columnVisibility.inTimeVerifiedDevice,
      headerClassName: 'bold-header',
    },
    {
      field: 'inTimeVerified',
      headerName: 'Verified By(In)',
      flex: 0,
      width: 200,
      hide: !columnVisibility.inTimeVerified,
      headerClassName: 'bold-header',
    },
    {
      field: 'outTime',
      headerName: 'Out Time',
      flex: 0,
      width: 200,
      hide: !columnVisibility.outTime,
      headerClassName: 'bold-header',
    },
    {
      field: 'outTimeVerifiedDevice',
      headerName: 'Verified Out Device',
      flex: 0,
      width: 200,
      hide: !columnVisibility.outTimeVerifiedDevice,
      headerClassName: 'bold-header',
    },
    {
      field: 'outTimeVerified',
      headerName: 'Verified By(Out)',
      flex: 0,
      width: 200,
      hide: !columnVisibility.outTimeVerified,
      headerClassName: 'bold-header',
    },
    {
      field: 'totalHours',
      headerName: 'Total Hours',
      flex: 0,
      width: 200,
      hide: !columnVisibility.totalHours,
      headerClassName: 'bold-header',
    },
    {
      field: 'shifttype',
      headerName: 'Shift Type',
      flex: 0,
      width: 200,
      hide: !columnVisibility.shifttype,
      headerClassName: 'bold-header',
    },
    {
      field: 'modifiedData',
      headerName: 'Attendance History',
      flex: 0,
      width: 150,
      hide: !columnVisibility.modifiedData,
      headerClassName: 'bold-header',
      cellRenderer: (params) => (
        <Grid sx={{ display: 'flex' }}>
          {isUserRoleCompare?.includes('vbiometricteamattendancereport') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getCode(params.data);
              }}
            >
              View
            </Button>
          )}
        </Grid>
      ),
    },
    {
      field: 'company',
      headerName: 'Company',
      flex: 0,
      width: 100,
      hide: !columnVisibility.company,
      headerClassName: 'bold-header',
    },
    {
      field: 'branch',
      headerName: 'Branch',
      flex: 0,
      width: 100,
      hide: !columnVisibility.branch,
      headerClassName: 'bold-header',
    },
    {
      field: 'unit',
      headerName: 'Unit',
      flex: 0,
      width: 100,
      hide: !columnVisibility.unit,
      headerClassName: 'bold-header',
    },
    {
      field: 'team',
      headerName: 'Team',
      flex: 0,
      width: 100,
      hide: !columnVisibility.team,
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
      field: 'companyname',
      headerName: 'Employee Name',
      flex: 0,
      width: 180,
      hide: !columnVisibility.companyname,
      headerClassName: 'bold-header',
    },
    {
      field: 'staffNameC',
      headerName: 'Username',
      flex: 0,
      width: 100,
      hide: !columnVisibility.staffNameC,
      headerClassName: 'bold-header',
    },
    {
      field: 'biometriccommonname',
      headerName: 'Device Common Name',
      flex: 0,
      width: 250,
      hide: !columnVisibility.biometriccommonname,
      headerClassName: 'bold-header',
    },

    // {
    //     field: "fingerCountN",
    //     headerName: "FingerPrint Count",
    //     flex: 0,
    //     width: 100,
    //     hide: !columnVisibility.fingerCountN,
    //     headerClassName: "bold-header",
    // },
    // {
    //     field: "isFaceEnrolledC",
    //     headerName: "Face Enrolled",
    //     flex: 0,
    //     width: 100,
    //     hide: !columnVisibility.isFaceEnrolledC,
    //     headerClassName: "bold-header",
    // },
  ];
  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item.id,
      serialNumber: item.serialNumber,
      company: item.company,
      branch: item.branch,
      unit: item.unit,
      team: item.team,
      department: item.department,
      shiftdate: item.shiftdate,
      companyname: item.companyname,
      biometriccommonname: item.biometriccommonname,
      staffNameC: item.staffNameC,
      inTime: item.inTime,
      outTime: item.outTime,
      inTimeVerified: item.inTimeVerified,
      inTimeVerifiedDevice: item.inTimeVerifiedDevice,
      outTimeVerified: item.outTimeVerified,
      outTimeVerifiedDevice: item.outTimeVerifiedDevice,
      // modifiedData: item.modifiedData,
      modifiedData: item.modifiedData,
      totalHours: item.totalHours,
      shifttype: item.shifttype,
    };
  });

  const rowsWithCheckboxes = rowDataTable.map((row) => ({
    ...row,
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
              Hide All{' '}
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Box>
  );

  const handleAutoSelect = async () => {
    setPageName(!pageName);
    try {
      let selectedValues = accessbranch
        ?.map((data) => ({
          company: data.company,
          branch: data.branch,
          unit: data.unit,
        }))
        .filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit));

      let selectedCompany = selectedValues
        ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company))
        .map((a, index) => {
          return a.company;
        });

      let mappedCompany = selectedValues
        ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company))
        ?.map((data) => ({
          label: data?.company,
          value: data?.company,
        }));

      setValueCompanyCat(selectedCompany);
      setSelectedOptionsCompany(mappedCompany);

      let selectedBranch = selectedValues
        .filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch))
        .map((a, index) => {
          return a.branch;
        });

      let mappedBranch = selectedValues
        .filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch))
        ?.map((data) => ({
          label: data?.branch,
          value: data?.branch,
        }));

      setValueBranchCat(selectedBranch);
      setSelectedOptionsBranch(mappedBranch);

      let selectedUnit = selectedValues
        .filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit))
        .map((a, index) => {
          return a.unit;
        });

      let mappedUnit = selectedValues
        .filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit))
        ?.map((data) => ({
          label: data?.unit,
          value: data?.unit,
        }));

      setValueUnitCat(selectedUnit);
      setSelectedOptionsUnit(mappedUnit);

      let mappedTeam = allTeam
        ?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit))
        .map((u) => ({
          label: u.teamname,
          value: u.teamname,
        }));

      let selectedTeam = allTeam?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit)).map((u) => u.teamname);

      setValueTeamCat(selectedTeam);
      setSelectedOptionsTeam(mappedTeam);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    handleAutoSelect();
  }, [isAssignBranch]);

  return (
    <Box>
      <Headtitle title={'BIOMETRIC ATTENDANCE REPORT'} />
      <PageHeading title="Biometric Team Attendance Report" modulename="Human Resources" submodulename="HR" mainpagename="Attendance" subpagename="Biometric Device" subsubpagename="Biometric Team Attendance Report" />
      {isUserRoleCompare?.includes('lbiometricteamattendancereport') && (
        <Box sx={userStyle.selectcontainer}>
          <>
            <Typography sx={userStyle.importheadtext}>Biometric Team Attendance Report Filter</Typography>
            <br />
            <Grid container spacing={2}>
              <Grid item lg={2} md={2.5} xs={12} sm={6}>
                <Selects options={modeDropDowns} isDisabled={DisableLevelDropdown}
                  styles={colourStyles} value={{ label: modeselection.label, value: modeselection.value }} onChange={(e) => setModeSelection(e)} />
              </Grid>
              <Grid item lg={2} md={2.5} xs={12} sm={6}>
                <Selects options={sectorDropDowns} styles={colourStyles} value={{ label: sectorSelection.label, value: sectorSelection.value }} onChange={(e) => setSectorSelection(e)} />
              </Grid>

              <Grid
                item
                md={3}
                xs={12}
                sm={6}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignContent: 'end',
                  alignItems: 'end',
                }}
              >
                <Grid>
                  <LoadingButton
                    // loading={btnLoading}
                    sx={buttonStyles.buttonsubmit}
                    onClick={handleSubmit}
                  >
                    Filter
                  </LoadingButton>
                  &nbsp; &nbsp;
                  <Button sx={buttonStyles.btncancel} onClick={handleclear}>
                    {' '}
                    Clear{' '}
                  </Button>
                </Grid>
              </Grid>
              <br />
              <br />
              <br />
            </Grid>
          </>
        </Box>
      )}
      <br />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes('lbiometricteamattendancereport') && (
        <>
          <Box sx={userStyle.container}>
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>List Biometric Team Attendance Report</Typography>
            </Grid>
            <Grid container spacing={2} style={userStyle.dataTablestyle}>
              <Grid item md={2} xs={12} sm={12}>
                <Box>
                  <label>Show entries:</label>
                  <Select
                    id="pageSizeSelect"
                    value={pageSize}
                    MenuProps={{
                      PaperProps: { style: { maxHeight: 180, width: 80 } },
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
                    <MenuItem value={meetingArray?.length}>All</MenuItem>
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
                  {isUserRoleCompare?.includes('excelbiometricteamattendancereport') && (
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
                  {isUserRoleCompare?.includes('csvbiometricteamattendancereport') && (
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
                  {isUserRoleCompare?.includes('printbiometricteamattendancereport') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp; <FaPrint /> &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('pdfbiometricteamattendancereport') && (
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
                  {isUserRoleCompare?.includes('imagebiometricteamattendancereport') && (
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
                  maindatas={meetingArray}
                  setSearchedString={setSearchedString}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  paginated={false}
                  totalDatas={meetingArray}
                />
              </Grid>
            </Grid>
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
            <Box style={{ width: '100%', overflowY: 'hidden' }}>
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
                  totalDatas={totalProjects}
                  searchQuery={searchQuery}
                  handleShowAllColumns={handleShowAllColumns}
                  setFilteredRowData={setFilteredRowData}
                  filteredRowData={filteredRowData}
                  setFilteredChanges={setFilteredChanges}
                  filteredChanges={filteredChanges}
                  gridRefTableImg={gridRefTableImg}
                  itemsList={meetingArray}
                />
              )}
            </Box>
          </Box>
        </>
      )}
      {/* ****** Table End ****** */}
      {/* Manage Column */}
      <Popover id={id} open={isManageColumnsOpen} anchorEl={anchorEl} onClose={handleCloseManageColumns} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        {' '}
        {manageColumnsContent}
      </Popover>

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
        filteredDataTwo={(filteredChanges !== null ? filteredRowData : rowDataTable) ?? []}
        itemsTwo={meetingArray ?? []}
        filename={'Biometric Team Attendance Report'}
        exportColumnNames={exportColumnNamescrt}
        exportRowValues={exportRowValuescrt}
        componentRef={componentRef}
      />
      {/* view model */}
      <Dialog open={isAttendanceList} onClose={handleCloseAttendanceList} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="lg" fullWidth={true} sx={{ marginTop: '80px' }}>
        <Box sx={{ padding: '20px 50px' }}>
          <>
            <Typography sx={userStyle.HeaderText}> View User Attendance History</Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Company</Typography>
                  <Typography>{AttendanceList?.company}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Branch</Typography>
                  <Typography>{AttendanceList?.branch}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Unit</Typography>
                  <Typography>{AttendanceList?.unit}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Team</Typography>
                  <Typography>{AttendanceList?.team}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Department</Typography>
                  <Typography>{AttendanceList?.department}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Username</Typography>
                  <Typography>{AttendanceList?.staffNameC}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Device Common Name</Typography>
                  <Typography>{AttendanceList?.biometriccommonname}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Shift date</Typography>
                  <Typography>{AttendanceList?.shiftdate}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Shift Type</Typography>
                  <Typography>{AttendanceList?.shifttype}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={12} xs={12} sm={12}>
                <Typography variant="h6">Attendance History</Typography>
                <br />
                <Grid item md={12} xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Box>
                    {isUserRoleCompare?.includes('excelbiometricteamattendancereport') && (
                      <>
                        <ExportXL csvData={applyData} fileName={fileName} />
                      </>
                    )}
                    {isUserRoleCompare?.includes('csvbiometricteamattendancereport') && (
                      <>
                        <ExportCSV csvData={applyData} fileName={fileName} />
                      </>
                    )}
                    {isUserRoleCompare?.includes('printbiometricteamattendancereport') && (
                      <>
                        <Button sx={userStyle.buttongrp} onClick={handleprintPopUp}>
                          &ensp;
                          <FaPrint />
                          &ensp;Print&ensp;
                        </Button>
                      </>
                    )}
                    {isUserRoleCompare?.includes('pdfbiometricteamattendancereport') && (
                      <>
                        <Button sx={userStyle.buttongrp} onClick={() => downloadPdf()}>
                          <FaFilePdf />
                          &ensp;Export to PDF&ensp;
                        </Button>
                      </>
                    )}
                    {isUserRoleCompare?.includes('imagebiometricteamattendancereport') && (
                      <Button sx={userStyle.buttongrp} onClick={handleCaptureImagePopUp}>
                        {' '}
                        <ImageIcon sx={{ fontSize: '15px' }} /> &ensp;Image&ensp;{' '}
                      </Button>
                    )}
                  </Box>
                </Grid>
                <br />
                <div style={{ maxHeight: "400px", overflowY: "auto", overflowX: "auto" }}>
                  <Table aria-label="customized table" id="usertable" ref={componentRefPopUp}>
                    <TableHead>
                      <StyledTableRow>
                        <StyledTableCell style={tableHeadCellStyle}>{"Sno"}.</StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}> {"Shift Date"}</StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}> {"Shift Time"}</StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}> {"Shift Type"}</StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}> {"Company Name"}</StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}> {"User Name"}</StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}> {"In Time"}</StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}> {"Verified Device(IN)"}</StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}> {"Verified By(IN)"}</StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}> {"Out Time"}</StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}> {"Verified Device(Out)"}</StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}> {"Verified By(Out)"}</StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}> {"Total Hours (hh:mm:ss)"}</StyledTableCell>
                      </StyledTableRow>
                    </TableHead>
                    <TableBody>
                      {AttendanceList?.modifiedData?.map((item, i) => (
                        <StyledTableRow>
                          <StyledTableCell style={tableBodyCellStyle}>{i + 1}.</StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}> {item?.shiftdate}</StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}> {item?.shift}</StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}> {item?.shifttype}</StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}> {item.companyname}</StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}> {item.username}</StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}> {item.inTime}</StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}> {item.inVerifiedDevice}</StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}> {item.inTimeVerified}</StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}> {item.outTime}</StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}> {item.outVerifiedDevice}</StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}> {item.outTimeVerified}</StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}> {item.totalHours}</StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Grid>
            </Grid>
            <br /> <br /> <br />
            <Grid container spacing={2}>
              <Button sx={buttonStyles.btncancel} onClick={handleCloseAttendanceList}>
                {' '}
                Back{' '}
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>
    </Box>
  );
}
export default BiometricTeamAttendanceReport;