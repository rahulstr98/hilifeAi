import React, { useState, useEffect, useContext } from 'react';
import { Box, Checkbox, Typography, FormControlLabel, OutlinedInput, TableBody, Select, Paper, MenuItem, Dialog, DialogContent, DialogActions, FormControl, Grid, Table, TableHead, TableContainer, Button } from '@mui/material';
import { colourStyles, userStyle } from '../../../pageStyle';
import { StyledTableRow, StyledTableCell } from '../../../components/Table';
import 'jspdf-autotable';
import { ThreeDots } from 'react-loader-spinner';
import Selects from 'react-select';
import axios from '../../../axiosInstance';
import { menuItems } from '../../../components/menuItemsList';
import { MultiSelect } from 'react-multi-select-component';
import { handleApiError } from '../../../components/Errorhandling';
import { SERVICE } from '../../../services/Baseservice';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { UserRoleAccessContext } from '../../../context/Appcontext';
import { AuthContext } from '../../../context/Appcontext';
import Headtitle from '../../../components/Headtitle';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LoadingButton from '@mui/lab/LoadingButton';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import PageHeading from '../../../components/PageHeading';
import AlertDialog from '../../../components/Alert';
import { DeleteConfirmation, PleaseSelectRow } from '../../../components/DeleteConfirmation.js';
import ExportData from '../../../components/ExportData';
import InfoPopup from '../../../components/InfoPopup.js';
import MessageAlert from '../../../components/MessageAlert';

function Hirerarchi() {
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

  let exportColumnNames = [
    'Training Details',
    'Status',
    'Duration',
    'Mode',
    'Required',
    'Date',
    'Time',
    'Dead Line Date',
    'Frequency',
    'Schedule',
    'Time',
    'Days',
    'MonthDate',
    'Annual',
    'Due From DOJ',
    'Type',
    'Department',
    'Designation',
    'Company',
    'Branch',
    'Unit',
    'Team',
    'Responsible Person',
    'Online Test',
    'Test Names',
  ];
  let exportRowValues = [
    'trainingdetails',
    'status',
    'duration',
    'mode',
    'required',
    'date',
    'time',
    'deadlinedate',
    'frequency',
    'schedule',
    'timetodo',
    'weekdays',
    'monthdate',
    'annumonth',
    'duefromdoj',
    'type',
    'department',
    'designation',
    'company',
    'branch',
    'unit',
    'team',
    'employeenames',
    'onlinetest',
    'testnames',
  ];

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
      pagename: String('Setup/Hierarchy/Hierarchy Create'),
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
  const [hirerarchicreate, setHirerarchiCreate] = useState({
    company: 'Please Select Company',
    designationgroup: 'Please Select Designation Group',
    department: 'Please Select Department',
    branch: 'Please Select Branch',
    unit: 'Please Select Unit',
    team: 'Please Select Team',
    employeename: '',
    supervisorchoose: 'Please Select Supervisor',
    mode: 'Please Select Mode',
    level: 'Please Select Sector',
    control: '',
  });

  const [isBtn, setIsBtn] = useState(false);
  const [conditionCheck, setConditionCheck] = useState(false);
  const [filterUser, setFilterUser] = useState([]);
  const [getUsers, setGetUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [control, setControl] = useState([]);
  const [controldrop, setControldrop] = useState('Please Select Control');

  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showdept, setShowDept] = useState(false);
  const [showBranch, setShowBranch] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [enableSameSupervisor, setEnableSameSupervisor] = useState(false);
  const [supervisor, setSupervisor] = useState([]);
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
    setIsBtn(false);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };

  const { isUserRoleCompare, isUserRoleAccess, allUsersData, isAssignBranch, pageName, setPageName, allTeam, buttonStyles } = useContext(UserRoleAccessContext);

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
        } else if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0 && data?.mainpagenameurl?.length !== 0 && data?.subpagenameurl?.length !== 0 && data?.subpagenameurl?.includes(window.location.pathname)) {
          fetfinalurl = data.subpagenameurl;
        } else if (data?.modulenameurl?.length !== 0 && data?.submodulenameurl?.length !== 0 && data?.mainpagenameurl?.length !== 0 && data?.mainpagenameurl?.includes(window.location.pathname)) {
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
      }));

  const { auth } = useContext(AuthContext);

  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ''; // This is required for Chrome support
  };

  const modeopt = [
    { label: 'Only', value: 'Only' },
    { label: 'All', value: 'All' },
  ];

  const levelopt = [
    { label: 'Primary', value: 'Primary' },
    { label: 'Secondary', value: 'Secondary' },
    { label: 'Tertiary', value: 'Tertiary' },
  ];

  const usernameaddedby = isUserRoleAccess?.companyname;

  // fetch company
  const [companyOpt, setCompany] = useState([]);
  const fetchCompany = async () => {
    setPageName(!pageName);
    try {
      let res = accessbranch
        ?.map((data) => ({
          label: data.company,
          value: data.company,
        }))
        .filter((item, index, self) => {
          return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
        });

      setCompany([
        { label: 'All', value: 'All' },
        ...res?.map((t) => ({
          ...t,
          label: t.value,
          value: t.value,
        })),
      ]);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //fetching Project for Dropdowns
  const fetchControlname = async (value) => {
    setPageName(!pageName);
    try {
      let res_project = await axios.post(SERVICE.CONTROL_NAMES_BASED_ON_DESIG, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        designation: value,
      });
      const controlNames =
        res_project?.data?.controlnames?.length > 0
          ? Array.from(
            new Set(res_project?.data?.controlnames.map((data) => data.controlname)) // Create a Set of unique controlname values
          ).map((controlname) => ({
            label: controlname, // Rebuild the object structure
            value: controlname,
          }))
          : [];
      setControl(controlNames);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Page Controls
  const [selectedPageControls, setSelectedPageControls] = useState([]);
  const [pageControls, setPageControls] = useState([]);
  let [valuePageControls, setValuePageControls] = useState('');
  //fetching Reporting To for Dropdowns
  const fetchPageControls = async () => {
    setPageName(!pageName);
    try {
      let res_project = await axios.get(SERVICE.REPORTINGHEADER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const pageControls =
        res_project?.data?.reportingheaders?.length > 0
          ? res_project?.data?.reportingheaders?.map((data) => ({
            // ...data,
            label: data?.name,
            value: data?.name,
            id: data?._id,
          }))
          : [];

      setPageControls(pageControls);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  useEffect(() => {
    fetchPageControls();
  }, []);

  const handlePageControlsChange = (options) => {
    setValuePageControls(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedPageControls(options);
  };

  const customValueRendererPageControl = (valueCate, _area) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please Select Module Controls';
  };
  // fetch Department Group
  const [departmentOpt, setDepartment] = useState([]);

  // fetch Designation Group
  const [designationGroupOpt, setDesignationGroup] = useState([]);
  const fetchDesignationGroup = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.get(SERVICE.DESIGNATIONGRP, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDesignationGroup([
        { label: 'All', value: 'All' },
        ...res?.data?.desiggroup?.map((t) => ({
          ...t,
          label: t.name,
          value: t.name,
        })),
      ]);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [controlname, setControlname] = useState({ controlname: '' });
  const fetchDesignation = async (e) => {
    if (e == 'All') {
      setControlname({ controlname: '' });
    } else {
      setPageName(!pageName);
      try {
        let res = await axios.post(SERVICE.CONTROLNAME, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          name: e,
        });

        setControlname(...res.data.designationgroups);
      } catch (err) {
        handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
      }
    }
  };

  // fetch Branch
  const [branchOpt, setBranch] = useState([]);
  // fetch Unit
  const [unitOpt, setUnit] = useState([]);
  // fetch Unit
  const [teamopt, setTeam] = useState([]);
  // Fetch location wise data Start
  const fetchDesignation_Department_Branch = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.LOCATIONWISE_ALL, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: String(e),
      });
      setDepartment([
        { label: 'All', value: 'All' },
        ...res?.data?.department?.map((t) => ({
          ...t,
          label: t.deptname,
          value: t.deptname,
        })),
      ]);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // fetch unit wise data from Team
  const fetchAllUsers = async () => {
    setPageName(!pageName);
    try {
      let ans = allUsersData?.map((t) => ({
        label: t.companyname,
        value: t.companyname,
      }));
      setSupervisor(ans);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchCompany();
    fetchDesignationGroup();
    fetchAllUsers();
  }, []);

  // fetch unit wise data from Team
  const handleFilter = async (e) => {
    if (hirerarchicreate.company == 'Please Select Company') {
      setPopupContentMalert('Please Select Company');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (hirerarchicreate.designationgroup == 'Please Select Designation Group') {
      setPopupContentMalert('Please Select Designation Group');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (showdept && (hirerarchicreate.branch == '' || hirerarchicreate.branch === 'Please Select Branch')) {
      setPopupContentMalert('Please Select Branch ');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (showdept && (hirerarchicreate.unit == '' || hirerarchicreate.unit === 'Please Select Unit')) {
      setPopupContentMalert('Please Select Unit');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (showdept && (hirerarchicreate.team == '' || hirerarchicreate.team === 'Please Select Team')) {
      setPopupContentMalert('Please Select Team');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (!showdept && (hirerarchicreate.department == '' || hirerarchicreate.department === 'Please Select Department')) {
      setPopupContentMalert('Please Select Department Or Branch');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      setPageName(!pageName);
      try {
        let ans = designationGroupOpt.filter((data) => data.value != 'All');
        let res = await axios.post(SERVICE.USERWISE_FILTER_ALL, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          company: String(hirerarchicreate.company == 'Please Select Company' ? '' : hirerarchicreate.company),
          designationgroup: hirerarchicreate.designationgroup == 'Please Select Designation Group' ? '' : hirerarchicreate.designationgroup === 'All' ? ans.map((data) => data.value) : [hirerarchicreate.designationgroup],
          department: String(hirerarchicreate.department == 'Please Select Department' ? '' : hirerarchicreate.department),
          branch: String(hirerarchicreate.branch == 'Please Select Branch' ? '' : hirerarchicreate.branch),
          unit: String(hirerarchicreate.unit == 'Please Select Unit' ? '' : hirerarchicreate.unit),
          team: String(hirerarchicreate.team == 'Please Select Team' ? '' : hirerarchicreate.team),
        });
        setFilterUser(res.data.users);
        setSelectedRows([]);
        setGetUsers([]);
        setSelectAll(false);
        setConditionCheck(true);
      } catch (err) {
        handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
      }
    }
  };

  const [groupIndividual, setGroupIndividual] = useState([]);

  const fetchAllApproveds = async () => {
    setPageName(!pageName);
    try {
      let res_queue = await axios.get(SERVICE.HIRERARCHI, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setGroupIndividual(res_queue?.data?.hirerarchi);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  useEffect(() => {
    fetchAllApproveds();
  }, []);

  // Fetch location wise data End

  //CHECK BOX SELECTION
  const handleCheckboxChange = (id, row) => {
    const isSelected = selectedRows.includes(id);

    let updatedSelectedRows = [...selectedRows];
    let values = [...getUsers];

    if (isSelected) {
      // Checkbox is being unchecked, remove from state
      const index = updatedSelectedRows.indexOf(id);
      if (index !== -1) {
        updatedSelectedRows.splice(index, 1);
        // values.splice(index, 1);
        values = values.filter((user) => user.id !== id);
      }
    } else {
      // Checkbox is being checked, add to state
      updatedSelectedRows.push(id);
      values.push(row);
    }

    setGetUsers(values);
    setSelectedRows(updatedSelectedRows);
    setSelectAll(updatedSelectedRows.length === items.length);
  };

  //CHECK BOX CHECKALL SELECTION
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
      setSelectAll(false);
      setGetUsers([]);
    } else {
      const allRowIds = items.map((row) => row.id);
      setGetUsers(items);
      setHirerarchiCreate({ ...hirerarchicreate, supervisorchoose: 'Please Select Supervisor' });
      setSelectedRows(allRowIds);
      setSelectAll(true);
    }
  };
  const sendRequest = async (name) => {
    setIsBtn(true);
    setPageName(!pageName);
    try {
      if (name === 'empty') {
        let res_queue = await axios.post(SERVICE.HIRERARCHI_CREATE, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          company: String(hirerarchicreate.company == 'Please Select Company' ? '' : hirerarchicreate.company),
          designationgroup: String(hirerarchicreate.designationgroup == 'Please Select Designation Group' ? '' : hirerarchicreate.designationgroup),
          department: String(hirerarchicreate.department == 'Please Select Department' ? '' : hirerarchicreate.department),
          branch: String(hirerarchicreate.branch == 'Please Select Branch' ? '' : hirerarchicreate.branch),
          unit: String(hirerarchicreate.unit == 'Please Select Unit' ? '' : hirerarchicreate.unit),
          team: String(hirerarchicreate.team == 'Please Select Team' ? '' : hirerarchicreate.team),
          supervisorchoose: String(hirerarchicreate.supervisorchoose),
          mode: String(hirerarchicreate.mode),
          level: String(hirerarchicreate.level),
          control: String(controldrop),
          pagecontrols: valuePageControls,
          samesupervisor: Boolean(enableSameSupervisor),
          employeename: 'All',
          access: selectAll ? 'all' : '',
          action: Boolean(true),
          addedby: [
            {
              name: String(usernameaddedby),
              date: String(new Date()),
            },
          ],
        });
        setPopupContent('Added Successfully');
        setPopupSeverity('success');
        handleClickOpenPopup();
      } else {
        let res_queue = await axios.post(SERVICE.HIRERARCHI_CREATE, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          company: String(hirerarchicreate.company == 'Please Select Company' ? '' : hirerarchicreate.company),
          designationgroup: String(hirerarchicreate.designationgroup == 'Please Select Designation Group' ? '' : hirerarchicreate.designationgroup),
          department: String(hirerarchicreate.department == 'Please Select Department' ? '' : hirerarchicreate.department),
          branch: String(hirerarchicreate.branch == 'Please Select Branch' ? '' : hirerarchicreate.branch),
          unit: String(hirerarchicreate.unit == 'Please Select Unit' ? '' : hirerarchicreate.unit),
          team: String(hirerarchicreate.team == 'Please Select Team' ? '' : hirerarchicreate.team),
          supervisorchoose: String(hirerarchicreate.supervisorchoose),
          mode: String(hirerarchicreate.mode),
          level: String(hirerarchicreate.level),
          control: String(controldrop),
          employeename: name?.companyname,
          pagecontrols: valuePageControls,
          samesupervisor: Boolean(enableSameSupervisor),
          access: selectAll ? 'all' : '',
          action: Boolean(true),
          empbranch: name.branch,
          empunit: name.unit,
          empcode: name.empcode,
          empteam: name.team,
          addedby: [
            {
              name: String(usernameaddedby),
              date: String(new Date()),
            },
          ],
        });
        setPopupContent('Added Successfully');
        setPopupSeverity('success');
        handleClickOpenPopup();
      }
      await fetchAllApproveds();
      setIsBtn(false);
    } catch (err) {
      setIsBtn(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const handleClear = () => {
    setHirerarchiCreate({
      company: 'Please Select Company',
      designationgroup: 'Please Select Designation Group',
      department: 'Please Select Department',
      branch: 'Please Select Branch',
      unit: 'Please Select Unit',
      team: 'Please Select Team',
      hirerarchicreate: '',
      supervisorchoose: 'Please Select Supervisor',
      mode: 'Please Select Mode',
      level: 'Please Select Sector',
      employeename: '',
    });
    setSelectedRows([]);
    setGetUsers([]);
    setEnableSameSupervisor(false)
    setDepartment([]);
    setUnit([]);
    setTeam([]);
    setFilterUser([]);
    setSelectAll(false);
    setControlname({ controlname: '' });
    setSelectedPageControls([]);
    setValuePageControls([]);
    setConditionCheck(false);
    setGetUsers([]);
    setFilterUser([]);
    setSelectAll(false);
    setShowBranch(false);
    setShowDept(false);
    setControldrop('Please Select Control');
    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
  };
  const handleClearFilter = () => {
    setHirerarchiCreate({
      company: 'Please Select Company',
      designationgroup: 'Please Select Designation Group',
      department: 'Please Select Department',
      branch: 'Please Select Branch',
      unit: 'Please Select Unit',
      team: 'Please Select Team',
      hirerarchicreate: '',
      supervisorchoose: 'Please Select Supervisor',
      mode: 'Please Select Mode',
      level: 'Please Select Sector',
      employeename: '',
    });
    setSelectedRows([]);
    setGetUsers([]);
    setDepartment([]);
    setUnit([]);
    setTeam([]);
    setFilterUser([]);
    setSelectAll(false);
    setControlname({ controlname: '' });
    setShowBranch(false);
    setShowDept(false);
    setConditionCheck(false);
    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
  };


  const handleSubmit = (e) => {
    const getUsersName = selectAll && getUsers.map((data) => data.companyname).length == 0 ? ["All"] : getUsers.map((data) => data.companyname);
    const filterUsername = enableSameSupervisor ? getUsers?.filter(data => data.companyname !== hirerarchicreate.supervisorchoose).map((data) => data.companyname) : getUsersName;
    const userNamesFinal = getUsers?.filter(data => filterUsername?.includes(data.companyname))
    const isDuplicateDisabled = (data) => {
      return showdept
        ? hirerarchicreate.designationgroup === data.designationgroup &&
        hirerarchicreate.branch === data.branch &&
        hirerarchicreate.unit === data.unit &&
        hirerarchicreate.team === data.team
        : hirerarchicreate.designationgroup === data.designationgroup &&
        hirerarchicreate.department === data.department;
    };


    const SameSuperEmployeeLevel = groupIndividual.length > 0 && groupIndividual.filter((data) => isDuplicateDisabled(data) &&
      data.supervisorchoose.includes(hirerarchicreate.supervisorchoose) &&
      hirerarchicreate.level === data.level);


    const matchesSuperSameEmpLevel =
      SameSuperEmployeeLevel.length > 0 &&
      SameSuperEmployeeLevel.some((item) => {
        // Check if any name in the employeename array matches the namesToCheck
        return item.employeename.some((employeeName) => getUsersName.includes(employeeName));
      });




    const SameSupervisorModeEmployee = groupIndividual.length > 0 && groupIndividual.filter((data) => isDuplicateDisabled(data) && data.supervisorchoose.includes(hirerarchicreate.supervisorchoose)
      && hirerarchicreate.mode === data.mode);

    const matchesSameSupervisorModeEmployee =
      SameSupervisorModeEmployee.length > 0 &&
      SameSupervisorModeEmployee.some((item) => {
        // Check if any name in the employeename array matches the namesToCheck
        return item.employeename.some((employeeName) => getUsersName.includes(employeeName));
      });


    const SameSupervisorEmployee = (groupIndividual.length > 0) ?
      groupIndividual.filter((data) => isDuplicateDisabled(data) && data.supervisorchoose.includes(hirerarchicreate.supervisorchoose)) : [];







    console.log(SameSupervisorEmployee, 'SameSupervisorEmployee')


    const matchesSameSupervisorEmployee =
      SameSupervisorEmployee.length > 0 &&
      SameSupervisorEmployee.some((item) => {
        // Check if any name in the employeename array matches the namesToCheck
        return item.employeename.some((employeeName) => getUsersName.includes(employeeName));
      });
    const SameModeLevelEmployeeSuper = groupIndividual.length > 0 && groupIndividual.filter((data) => isDuplicateDisabled(data) &&
      hirerarchicreate.mode === data.mode
      && hirerarchicreate.level === data.level && data.supervisorchoose.includes(hirerarchicreate.supervisorchoose));

    const matchesSameModeLevelEmployeeSupervisor =
      SameModeLevelEmployeeSuper.length > 0 &&
      SameModeLevelEmployeeSuper.some((item) => {
        // Check if any name in the employeename array matches the namesToCheck
        return item.employeename.some((employeeName) => getUsersName.includes(employeeName));
      });


    const sameSuperEmployeeWithoutBUT = groupIndividual.length > 0 && groupIndividual.filter((data) => isDuplicateDisabled(data) && data.supervisorchoose.includes(hirerarchicreate.supervisorchoose));
    const mactchesSameSuperEmployeeWithoutBUT = sameSuperEmployeeWithoutBUT.length > 0 &&
      sameSuperEmployeeWithoutBUT.some((item) => {
        return item.employeename.some((employeeName) => getUsersName.includes(employeeName));
      });
    e.preventDefault();


    const SameempModeLevelControl = groupIndividual.length > 0 && groupIndividual.filter((data) => isDuplicateDisabled(data) &&
      hirerarchicreate.mode === data.mode
      && hirerarchicreate.control === data.control
      && hirerarchicreate.level === data.level);

    const matchesSameempModeLevelControl =
      SameempModeLevelControl.length > 0 &&
      SameempModeLevelControl.some((item) => {
        return item.employeename.some((employeeName) => getUsersName.includes(employeeName));
      });


    if (hirerarchicreate.company == "Please Select Company") {
      setPopupContentMalert('Please Select Company');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (hirerarchicreate.designationgroup == "Please Select Designation Group") {
      setPopupContentMalert('Please Select Designation Group');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    else if (showdept && (hirerarchicreate.branch == "" || hirerarchicreate.branch === "Please Select Branch")) {
      setPopupContentMalert('Please Select Branch ');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    else if (showdept && (hirerarchicreate.unit == "" || hirerarchicreate.unit === "Please Select Unit")) {
      setPopupContentMalert('Please Select Unit');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    else if (showdept && (hirerarchicreate.team == "" || hirerarchicreate.team === "Please Select Team")) {
      setPopupContentMalert('Please Select Team');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    else if (!showdept && (hirerarchicreate.department == "" || hirerarchicreate.department === "Please Select Department")) {
      setPopupContentMalert('Please Select Department Or Branch');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();


    }
    else if (filterUsername.length == 0 && !selectAll) {
      setPopupContentMalert('Please Select Employee Name');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (hirerarchicreate.supervisorchoose == "" || hirerarchicreate.supervisorchoose === "Please Select Supervisor") {
      setPopupContentMalert('Please Select Supervisor');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (hirerarchicreate.mode == "" || hirerarchicreate.mode === "Please Select Mode") {
      setPopupContentMalert('Please Select Mode');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (hirerarchicreate.level == "" || hirerarchicreate.level === "Please Select Sector") {
      setPopupContentMalert('Please Select Sector');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    else if (controldrop === "" || controldrop === "Please Select Control") {
      setPopupContentMalert('Please Select Control ');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    else if (selectedPageControls?.length === 0) {
      setPopupContentMalert('Please Select Module Controls');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    else if (matchesSuperSameEmpLevel) {
      setPopupContentMalert('Employee Names and Sector Are Same ');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    else if (matchesSameSupervisorModeEmployee) {
      setPopupContentMalert('Employee Name,Supervisior and Mode Are Same');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (matchesSameModeLevelEmployeeSupervisor) {
      setPopupContentMalert('Employee Name,Mode and Level Are Same');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (matchesSameSupervisorEmployee) {
      setPopupContentMalert('Employee Name and SuperVisior are Same');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    else if (matchesSameempModeLevelControl) {
      setPopupContentMalert('Employee Name, Mode , level and Controls are Same');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    else if (mactchesSameSuperEmployeeWithoutBUT) {
      setPopupContentMalert('Employee Name and Supervisor are Same');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    else if (!enableSameSupervisor && filterUsername?.includes(hirerarchicreate.supervisorchoose)) {
      setPopupContentMalert('Supervisor and Employee Names are Equal. Choose Different');
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    }
    else if (userNamesFinal.length == 1) {
      userNamesFinal.map((data) => {
        if (data?.companyname == hirerarchicreate.supervisorchoose) {
          setPopupContentMalert('Please Select different Supervisor');
          setPopupSeverityMalert("warning");
          handleClickOpenPopupMalert();
        } else {

          if (userNamesFinal.length >= 1) {
            for (let i = 0; i < userNamesFinal.length; i++) {
              sendRequest(userNamesFinal[i]);
            }
          }
        }
      });
    } else {
      if (!enableSameSupervisor && getUsersName?.includes(hirerarchicreate.supervisorchoose)) {
        setPopupContentMalert('Supervisor and Employee Names are Equal. Choose Different');
        setPopupSeverityMalert("warning");
        handleClickOpenPopupMalert();
      }
      else if (userNamesFinal.length >= 1) {
        for (let i = 0; i < userNamesFinal.length; i++) {
          sendRequest(userNamesFinal[i]);
        }
      } else {
        sendRequest("empty");
      }
    }
  };

  // Info End
  let snos = 1;
  // this is the etimation concadination value
  const modifiedData = filterUser?.map((person) => ({
    ...person,
    sino: snos++,
  }));

  //serial no for listing items
  const addSerialNumber = () => {
    const itemsWithSerialNumber = modifiedData?.map((item, index) => ({ ...item, serialNumber: index + 1, id: index }));
    setItems(itemsWithSerialNumber);
  };

  //Datatable
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPage(1);
    // setSelectedRows([]);
    // setSelectAll(false);
  };

  //datatable....
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
    // setSelectAll(false);
  };
  // Split the search query into individual terms
  const searchOverTerms = searchQuery.toLowerCase().split(' ');
  // Modify the filtering logic to check each term
  const filteredDatas = items?.filter((item) => {
    return searchOverTerms.every((term) => Object.values(item).join(' ').toLowerCase().includes(term));
  });
  const filteredData = filteredDatas?.slice((page - 1) * pageSize, page * pageSize);

  const totalPages = Math.ceil(filteredDatas?.length / pageSize);

  const visiblePages = Math.min(totalPages, 3);

  const firstVisiblePage = Math.max(1, page - 1);
  const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPages);
  const pageNumbers = [];

  const indexOfLastItem = page * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;

  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }
  useEffect(() => {
    addSerialNumber();
  }, [filterUser]);

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, []);

  return (
    <Box>
      <Headtitle title={'HIERARCHY CREATE'} />
      {/* ****** Header Content ****** */}
      <PageHeading title="Hierarchy Create" modulename="Setup" submodulename="Hierarchy" mainpagename="Hierarchy Create" subpagename="" subsubpagename="" />
      {isUserRoleCompare?.includes('ahierarchycreate') && (
        <>
          <Box sx={userStyle.selectcontainer}>
            <Typography sx={userStyle.HeaderText}>Add Hierarchy</Typography>
            <Grid container spacing={2}>
              <Grid item md={4} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Company <b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    options={companyOpt}
                    placeholder="Please Select Company"
                    value={{ label: hirerarchicreate.company, value: hirerarchicreate.company }}
                    onChange={(e) => {
                      setHirerarchiCreate({
                        ...hirerarchicreate,
                        company: e.value,
                        department: 'Please Select Department',
                        branch: 'Please Select Branch',
                        unit: 'Please Select Unit',
                        team: 'Please Select Team',
                      });
                      fetchDesignation_Department_Branch(e.value);
                      setUnit([]);
                      setTeam([]);
                      setDepartment([]);
                      setFilterUser([]);
                      setGetUsers([]);
                      setSelectAll(false);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={4} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Designation Group<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    options={designationGroupOpt}
                    placeholder="New"
                    value={{ label: hirerarchicreate.designationgroup, value: hirerarchicreate.designationgroup }}
                    onChange={(e) => {
                      setHirerarchiCreate({
                        ...hirerarchicreate,
                        designationgroup: e.value,
                        department: 'Please Select Department',
                        branch: 'Please Select Branch',
                        unit: 'Please Select Unit',
                        team: 'Please Select Team',
                      });

                      fetchDesignation(e.value);
                      fetchControlname(e.value);
                      setUnit([]);
                      setTeam([]);
                      setFilterUser([]);
                      setGetUsers([]);
                      setSelectAll(false);
                      setControldrop('Please Select Control');
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={4} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>Department</Typography>
                  <Selects
                    isDisabled={showdept}
                    options={departmentOpt}
                    placeholder="New"
                    value={{ label: hirerarchicreate.department, value: hirerarchicreate.department }}
                    onChange={(e) => {
                      setHirerarchiCreate({
                        ...hirerarchicreate,
                        department: e.value,
                      });
                      setShowBranch(true);
                      setFilterUser([]);
                      setGetUsers([]);
                      setSelectAll(false);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={4} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>Branch</Typography>
                  <Selects
                    isDisabled={showBranch}
                    options={[
                      { label: 'All', value: 'All' },
                      ...accessbranch
                        ?.filter((comp) => (hirerarchicreate.company === 'All' ? true : hirerarchicreate.company === comp.company))
                        ?.map((data) => ({
                          label: data.branch,
                          value: data.branch,
                        }))
                        .filter((item, index, self) => {
                          return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                        }),
                    ]}
                    placeholder="New"
                    value={{ label: hirerarchicreate.branch, value: hirerarchicreate.branch }}
                    onChange={(e) => {
                      setHirerarchiCreate({
                        ...hirerarchicreate,
                        branch: e.value,
                        unit: 'Please Select Unit',
                        team: 'Please Select Team',
                      });
                      setShowDept(true);
                      setTeam([]);
                      setFilterUser([]);
                      setGetUsers([]);
                      setSelectAll(false);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={4} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>Unit</Typography>
                  <Selects
                    isDisabled={showBranch}
                    options={[
                      { label: 'All', value: 'All' },
                      ...accessbranch
                        ?.filter((comp) => (hirerarchicreate.company === 'All' ? true : hirerarchicreate.company === comp.company) && (hirerarchicreate.branch === 'All' ? true : hirerarchicreate.branch === comp.branch))
                        ?.map((data) => ({
                          label: data.unit,
                          value: data.unit,
                        }))
                        .filter((item, index, self) => {
                          return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                        }),
                    ]}
                    placeholder="New"
                    value={{ label: hirerarchicreate.unit, value: hirerarchicreate.unit }}
                    onChange={(e) => {
                      setHirerarchiCreate({
                        ...hirerarchicreate,
                        unit: e.value,
                        team: 'Please Select Team',
                      });
                      setShowDept(true);
                      setFilterUser([]);
                      setGetUsers([]);
                      setSelectAll(false);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={4} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>Team</Typography>
                  <Selects
                    isDisabled={showBranch}
                    options={[
                      { label: 'All', value: 'All' },
                      ...allTeam
                        ?.filter(
                          (comp) => (hirerarchicreate.company === 'All' ? true : hirerarchicreate.company === comp.company) && (hirerarchicreate.branch === 'All' ? true : hirerarchicreate.branch === comp.branch) && (hirerarchicreate.unit === 'All' ? true : hirerarchicreate.unit === comp.unit)
                        )
                        ?.map((data) => ({
                          label: data.teamname,
                          value: data.teamname,
                        }))
                        .filter((item, index, self) => {
                          return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                        }),
                    ]}
                    placeholder="New"
                    value={{ label: hirerarchicreate.team, value: hirerarchicreate.team }}
                    onChange={(e) => {
                      setHirerarchiCreate({
                        ...hirerarchicreate,
                        team: e.value,
                      });
                      setShowDept(true);
                      setFilterUser([]);
                      setGetUsers([]);
                      setSelectAll(false);
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>
            <br />
            <br />
            <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Grid item lg={1} md={2} sm={2} xs={12}>
                <Grid item md={12} sm={12} xs={12}>
                  <Button
                    sx={buttonStyles.buttonsubmit}
                    variant="contained"
                    onClick={() => {
                      handleFilter();
                    }}
                  >
                    Filter
                  </Button>
                </Grid>
              </Grid>

              <Grid item lg={1} md={2} sm={2} xs={12}>
                <Grid item md={12} sm={12} xs={12}>
                  <Button
                    sx={buttonStyles.btncancel}
                    onClick={() => {
                      handleClearFilter();
                      setShowDept(false);
                      setShowBranch(false);
                    }}
                  >
                    Clear
                  </Button>
                </Grid>
                {/* )} */}
              </Grid>
            </Grid>
            {!filterUser ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
                </Box>
              </>
            ) : (
              <>
                <Grid item lg={12} md={12} sm={12} xs={12}>
                  <Box>
                    <br />
                    <Grid style={userStyle.dataTablestyle}>
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
                          <MenuItem value={filterUser?.length}>All</MenuItem>
                        </Select>
                      </Box>
                      <Box>
                        <FormControl fullWidth size="small">
                          <Typography>Search</Typography>
                          <OutlinedInput id="component-outlined" type="text" value={searchQuery} onChange={handleSearchChange} />
                        </FormControl>
                      </Box>
                    </Grid>

                    {/* ****** Table start ****** */}
                    <TableContainer component={Paper}>
                      <Table sx={{ minWidth: 700 }} aria-label="customized table" id="usertable">
                        <TableHead sx={{ fontWeight: '600' }}>
                          <StyledTableRow>
                            <StyledTableCell sx={{ padding: '0 5px !IMPORTANT' }}>
                              <Checkbox checked={selectAll} onChange={handleSelectAll} />
                            </StyledTableCell>
                            <StyledTableCell> SNo</StyledTableCell>
                            <StyledTableCell> Employee Id</StyledTableCell>
                            <StyledTableCell> Employee Name</StyledTableCell>
                            <StyledTableCell> Branch</StyledTableCell>
                            <StyledTableCell> Unit</StyledTableCell>
                            <StyledTableCell> Team</StyledTableCell>
                            <StyledTableCell> Designation</StyledTableCell>
                          </StyledTableRow>
                        </TableHead>
                        <TableBody align="left">
                          {conditionCheck === false ? (
                            ''
                          ) : (
                            <StyledTableRow>
                              <StyledTableCell sx={{ padding: '0 15px !IMPORTANT' }}>
                                <FormControlLabel sx={{ marginBotton: '0px' }} label="All" control={<Checkbox checked={selectAll} onChange={handleSelectAll} />} />
                              </StyledTableCell>
                              <StyledTableCell colSpan={7}></StyledTableCell>
                            </StyledTableRow>
                          )}

                          {filteredData?.length > 0 ? (
                            filteredData?.map((row, index) => (
                              <StyledTableRow key={index}>
                                <StyledTableCell sx={{ padding: '0 5px !IMPORTANT' }}>
                                  <Checkbox checked={selectedRows.includes(row.id)} onChange={() => handleCheckboxChange(row.id, row)} />
                                </StyledTableCell>
                                <StyledTableCell>{row.serialNumber}</StyledTableCell>
                                <StyledTableCell>{row.empcode}</StyledTableCell>
                                <StyledTableCell>{row.companyname}</StyledTableCell>
                                <StyledTableCell>{row.branch}</StyledTableCell>
                                <StyledTableCell>{row.unit}</StyledTableCell>
                                <StyledTableCell>{row.team}</StyledTableCell>
                                <StyledTableCell>{row.designation}</StyledTableCell>
                              </StyledTableRow>
                            ))
                          ) : conditionCheck === true ? (
                            ''
                          ) : (
                            <StyledTableRow>
                              {' '}
                              <StyledTableCell colSpan={13} align="center">
                                No Data Available
                              </StyledTableCell>{' '}
                            </StyledTableRow>
                          )}
                          <StyledTableRow></StyledTableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box style={userStyle.dataTablestyle}>
                      <Box>
                        Showing {filteredData.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredDatas?.length)} of {filteredDatas?.length} entries
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
                  </Box>
                </Grid>
              </>
            )}
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item lg={3} md={4} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Employee Name<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput value={selectAll ? 'All' : getUsers?.map((d) => d?.companyname)} />
                </FormControl>
              </Grid>
              <Grid item lg={3} md={4} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Supervisor Choose<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    options={supervisor}
                    value={{ label: hirerarchicreate.supervisorchoose, value: hirerarchicreate.supervisorchoose }}
                    onChange={(e) => {
                      setHirerarchiCreate({
                        ...hirerarchicreate,
                        supervisorchoose: e.value,
                        employeename: getUsers?.map((d) => d?.companyname),
                      });
                    }}
                  />
                </FormControl>
                <FormControlLabel
                  control={<Checkbox checked={enableSameSupervisor} />}
                  onChange={(e) => {
                    setEnableSameSupervisor(!enableSameSupervisor);
                  }}
                  label="Same Supervisor"
                />
              </Grid>
              <Grid item lg={2} md={4} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Mode<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    options={modeopt}
                    value={{ label: hirerarchicreate.mode, value: hirerarchicreate.mode }}
                    onChange={(e) => {
                      setHirerarchiCreate({
                        ...hirerarchicreate,
                        mode: e.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item lg={2} md={4} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Sector<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    options={levelopt}
                    placeholder="Please Select Company"
                    value={{ label: hirerarchicreate.level, value: hirerarchicreate.level }}
                    onChange={(e) => {
                      setHirerarchiCreate({
                        ...hirerarchicreate,
                        level: e.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item lg={2} md={4} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Control<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    options={control}
                    styles={colourStyles}
                    value={{ label: controldrop, value: controldrop }}
                    onChange={(e) => {
                      setControldrop(e.value);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item lg={2} md={4} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Module Controls<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <MultiSelect options={pageControls} value={selectedPageControls} onChange={handlePageControlsChange} valueRenderer={customValueRendererPageControl} labelledBy="Please Select Module Controls" />
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br />
            <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Grid item lg={1} md={2} sm={2} xs={12}>
                <Grid item md={12} sm={12} xs={12}>
                  <LoadingButton loading={isBtn} sx={buttonStyles.buttonsubmit} variant="contained" onClick={handleSubmit}>
                    Save
                  </LoadingButton>
                </Grid>
              </Grid>
              <Grid item lg={1} md={2} sm={2} xs={12}>
                <Grid item lg={12} md={12} sm={12} xs={12}>
                  <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Box>
          <br></br>
          <br />
          <br />
        </>
      )}

      {/* EXTERNAL COMPONENTS -------------- START */}
      {/* VALIDATION */}
      <MessageAlert openPopup={openPopupMalert} handleClosePopup={handleClosePopupMalert} popupContent={popupContentMalert} popupSeverity={popupSeverityMalert} />
      {/* SUCCESS */}
      <AlertDialog openPopup={openPopup} handleClosePopup={handleClosePopup} popupContent={popupContent} popupSeverity={popupSeverity} />
    </Box>
  );
}

export default Hirerarchi;
