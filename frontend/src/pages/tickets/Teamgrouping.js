import React, { useState, useEffect, useRef, useContext } from 'react';
import { Box, Typography, OutlinedInput, Divider, TableBody, TableRow, TableCell, Select, MenuItem, Dialog, DialogContent, DialogActions, FormControl, Grid, Paper, Table, TableHead, TableContainer, Button, List, ListItem, ListItemText, Popover, Checkbox, TextField, IconButton } from '@mui/material';
import { handleApiError } from '../../components/Errorhandling';
import { userStyle, colourStyles } from '../../pageStyle';
import { FaPrint, FaFilePdf, FaFileCsv, FaFileExcel } from 'react-icons/fa';
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
import { MultiSelect } from 'react-multi-select-component';
import { UserRoleAccessContext, AuthContext } from '../../context/Appcontext';
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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import html2canvas from 'html2canvas';
import ImageIcon from '@mui/icons-material/Image';
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
import AggregatedSearchBar from '../../components/AggregatedSearchBar';
import AggridTable from '../../components/AggridTable';
import domtoimage from 'dom-to-image';
import { getCurrentServerTime } from '../../components/getCurrentServerTime';


function TeamGrouping() {
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

  let exportColumnNames = ['Company', 'Branch', 'Unit', 'Team', 'Employee Name', 'Category', 'Subcategory', 'Sub Subcategory', 'Type', 'Company To', 'Branch To', 'Unit To', 'Team To', 'Employee Name To'];
  let exportRowValues = ['company', 'branchlist', 'unitlist', 'teamlist', 'employeenamefromlist', 'category', 'subcategory', 'subsubcategory', 'type', 'companyto', 'branchtolist', 'unittolist', 'teamtolist', 'employeenametolist'];

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
      pagename: String('Ticket/Master/Team Grouping'),
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

  const [teamgrouping, setTeamgrouping] = useState({
    categoryfrom: 'Please Select Category',
    subcategoryfrom: 'Please Select Subcategory',
    companyfrom: 'Please Select Company',
    type: 'Please Select Type',
    companyto: 'Please Select Company',
  });

  const [teamgroupingEdit, setTeamgroupingEdit] = useState([]);
  const [teamgroupingview, setTeamgroupingsview] = useState([]);
  const [teamgroupings, setTeamgroupings] = useState([]);
  const [teamgroupingsList, setTeamgroupingsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allTeamgroupingedit, setAllTeamgroupingedit] = useState([]);

  //To
  const [isButton, setIsButton] = useState(false);

  const { isUserRoleCompare, isUserRoleAccess, allUsersData, isAssignBranch, allTeam, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);

  const [teamgroupingCheck, setTeamgroupingcheck] = useState(false);

  const gridRef = useRef(null);

  const [selectedRows, setSelectedRows] = useState([]);

  const [searchQueryManage, setSearchQueryManage] = useState('');

  //new fields changes

  const [selectedBranchFrom, setSelectedBranchFrom] = useState([]);
  const [selectedUnitFrom, setSelectedUnitFrom] = useState([]);
  const [selectedTeamFrom, setSelectedTeamFrom] = useState([]);
  const [selectedEmployeeFrom, setSelectedEmployeeFrom] = useState([]);

  const [selectedBranchTo, setSelectedBranchTo] = useState([]);
  const [selectedUnitTo, setSelectedUnitTo] = useState([]);
  const [selectedTeamTo, setSelectedTeamTo] = useState([]);
  const [selectedEmployeeTo, setSelectedEmployeeTo] = useState([]);
  const [setCopiedData] = useState('');

  //EDIT FIELDS
  const [selectedBranchFromEdit, setSelectedBranchFromEdit] = useState([]);
  const [selectedUnitFromEdit, setSelectedUnitFromEdit] = useState([]);
  const [selectedTeamFromEdit, setSelectedTeamFromEdit] = useState([]);
  const [selectedEmployeeFromEdit, setSelectedEmployeeFromEdit] = useState([]);

  const [selectedBranchToEdit, setSelectedBranchToEdit] = useState([]);
  const [selectedUnitToEdit, setSelectedUnitToEdit] = useState([]);
  const [selectedTeamToEdit, setSelectedTeamToEdit] = useState([]);
  const [selectedEmployeeToEdit, setSelectedEmployeeToEdit] = useState([]);

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

  //image
  const gridRefTableImg = useRef(null);
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage
        .toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, 'Team Grouping.png');
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

  // const handleClickOpencheckbox = () => {
  //   setIsDeleteOpencheckbox(true);
  // };
  const handleCloseModcheckbox = () => {
    setIsDeleteOpencheckbox(false);
  };

  //Edit model...
  const [isEditOpen, setIsEditOpen] = useState(false);
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setIsEditOpen(false);
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
    type: true,
    company: true,
    companyto: true,
    branchlist: true,
    unitlist: true,
    teamlist: true,
    employeenamefromlist: true,
    branchtolist: true,
    unittolist: true,
    teamtolist: true,
    employeenametolist: true,
    actions: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);
  useEffect(() => {
    localStorage.setItem('columnVisibility', JSON.stringify(columnVisibility));
  }, [columnVisibility]);
  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ''; // This is required for Chrome support
  };

  const [deleteTeamgrp, setDeleteTeamgrp] = useState('');

  const rowData = async (id, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.TEAMGROUPING_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDeleteTeamgrp(res?.data?.steamgrouping);
      handleClickOpen();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Alert delete popup
  let Teamgrpsid = deleteTeamgrp?._id;
  const delTeamgrp = async (e) => {
    setPageName(!pageName);
    try {
      if (Teamgrpsid) {
        await axios.delete(`${SERVICE.TEAMGROUPING_SINGLE}/${e}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
        await fetchTeamgrouping();
        handleCloseMod();
        setSelectedRows([]);
        setPage(1);
        setPopupContent('Deleted Successfully');
        setPopupSeverity('success');
        handleClickOpenPopup();
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const delTeamgrpcheckbox = async () => {
    setPageName(!pageName);
    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(`${SERVICE.TEAMGROUPING_SINGLE}/${item}`, {
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

      await fetchTeamgrouping();
      setPopupContent('Deleted Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //branch multiselect dropdown changes
  const handleBranchChangeFrom = (options) => {
    setSelectedBranchFrom(options);
    setSelectedUnitFrom([]);
    setSelectedTeamFrom([]);
    setSelectedEmployeeFrom([]);
  };
  const customValueRendererBranchFrom = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select Branch';
  };

  //unit multiselect dropdown changes
  const handleUnitChangeFrom = (options) => {
    setSelectedUnitFrom(options);
    setSelectedTeamFrom([]);
    setSelectedEmployeeFrom([]);
  };
  const customValueRendererUnitFrom = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select Unit';
  };

  //Team multiselect dropdown changes
  const handleTeamChangeFrom = (options) => {
    setSelectedTeamFrom(options);
    setSelectedEmployeeFrom([]);
  };
  const customValueRendererTeamFrom = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select Team';
  };

  //employee multiselect dropdown changes
  const handleEmployeeChangeFrom = (options) => {
    setSelectedEmployeeFrom(options);
  };
  const customValueRendererEmployeeFrom = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select Employee';
  };

  //branchto multiselect dropdown changes
  const handleBranchChangeTo = (options) => {
    setSelectedBranchTo(options);
    setSelectedUnitTo([]);
  };
  const customValueRendererBranchTo = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select Branch';
  };

  //unitto multiselect dropdown changes
  const handleUnitChangeTo = (options) => {
    setSelectedUnitTo(options);
    setSelectedTeamTo([]);
  };
  const customValueRendererUnitTo = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select Unit';
  };

  //Teamto multiselect dropdown changes
  const handleTeamChangeTo = (options) => {
    setSelectedTeamTo(options);
    setSelectedEmployeeTo([]);
  };
  const customValueRendererTeamTo = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select Team';
  };

  //employee multiselect dropdown changes
  const handleEmployeeChangeTo = (options) => {
    setSelectedEmployeeTo(options);

    const optionIds = options.map((option) => option._id);
    const updatedSelectedEmployeeFrom = selectedEmployeeFrom.filter((value) => !optionIds.includes(value._id));
    setSelectedEmployeeFrom(updatedSelectedEmployeeFrom);
  };
  const customValueRendererEmployeeTo = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please Select Employee';
  };

  //EDIT MULSTISELECT ONCHANGE
  //branch multiselect dropdown changes
  const handleBranchChangeFromEdit = (options) => {
    setSelectedBranchFromEdit(options);
    setSelectedUnitFromEdit([]);
    setSelectedTeamFromEdit([]);
    setSelectedEmployeeFromEdit([]);
  };
  const customValueRendererBranchFromEdit = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select Branch';
  };

  //unit multiselect dropdown changes
  const handleUnitChangeFromEdit = (options) => {
    setSelectedUnitFromEdit(options);
    setSelectedTeamFromEdit([]);
    setSelectedEmployeeFromEdit([]);
  };
  const customValueRendererUnitFromEdit = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select Unit';
  };

  //Team multiselect dropdown changes
  const handleTeamChangeFromEdit = (options) => {
    setSelectedTeamFromEdit(options);
    setSelectedEmployeeFromEdit([]);
  };
  const customValueRendererTeamFromEdit = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select Team';
  };

  //employee multiselect dropdown changes
  const handleEmployeeChangeFromEdit = (options) => {
    setSelectedEmployeeFromEdit(options);
  };
  const customValueRendererEmployeeFromEdit = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select From Employee Name';
  };

  //branchto multiselect dropdown changes
  const handleBranchChangeToEdit = (options) => {
    setSelectedBranchToEdit(options);
    setSelectedUnitToEdit([]);
    setSelectedTeamToEdit([]);
    setSelectedEmployeeToEdit([]);
  };
  const customValueRendererBranchToEdit = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select Branch';
  };

  //unitto multiselect dropdown changes
  const handleUnitChangeToEdit = (options) => {
    setSelectedUnitToEdit(options);
    setSelectedTeamToEdit([]);
    setSelectedEmployeeToEdit([]);
  };
  const customValueRendererUnitToEdit = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select Unit';
  };

  //Teamto multiselect dropdown changes
  const handleTeamChangeToEdit = (options) => {
    setSelectedTeamToEdit(options);
    setSelectedEmployeeToEdit([]);
  };
  const customValueRendererTeamToEdit = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select Team';
  };

  //employee multiselect dropdown changes
  const handleEmployeeChangeToEdit = (options) => {
    setSelectedEmployeeToEdit(options);

    const optionIds = options.map((option) => option._id);
    const updatedSelectedEmployeeFrom = selectedEmployeeFromEdit.filter((value) => !optionIds.includes(value._id));
    setSelectedEmployeeFromEdit(updatedSelectedEmployeeFrom);
  };
  const customValueRendererEmployeeToEdit = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : 'Please select To Employee Name';
  };

  useEffect(() => {
    fetchTeamgrouping();
    fetchCategoryTicket();
    fetchTypemaster();
    fetchCategoryBased();
    fetchSubsubcomponent();
  }, []);

  //add function
  const sendRequest = async () => {
    setIsButton(true);
    let branchnamesfrom = selectedBranchFrom.map((item) => item.value);
    let unitnamesfrom = selectedUnitFrom.map((item) => item.value);
    let teamnamesfrom = selectedTeamFrom.map((item) => item.value);
    let employeenamesfrom = selectedEmployeeFrom.map((item) => item.value);
    let branchnamesto = selectedBranchTo.map((item) => item.value);
    let unitnamesto = selectedUnitTo.map((item) => item.value);
    let teamnamesto = selectedTeamTo.map((item) => item.value);
    let employeenamesto = selectedEmployeeTo.map((item) => item.value);
    setPageName(!pageName);
    const NewDatetime = await getCurrentServerTime();

    try {
      await axios.post(SERVICE.TEAMGROUPING_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        categoryfrom: [...valueCat],
        subcategoryfrom: [...valueSubCat],
        subsubcategoryfrom: [...valueSubSubCat],
        typefrom: [...valueType],
        companyfrom: String(teamgrouping.companyfrom),
        branchfrom: branchnamesfrom,
        unitfrom: unitnamesfrom,
        teamfrom: teamnamesfrom,
        employeenamefrom: employeenamesfrom,
        companyto: String(teamgrouping.companyto),
        branchto: branchnamesto,
        unitto: unitnamesto,
        teamto: teamnamesto,
        employeenameto: employeenamesto,
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date(NewDatetime)),
          },
        ],
      });
      await fetchTeamgrouping();
      setIsButton(false);
      setPopupContent('Added Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
      setSearchQuery('');
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

    const isNameMatch = teamgroupingsList.some(
      (item) =>
        item.categoryfrom.some((data) => catopt.includes(data)) &&
        item.subcategoryfrom.some((data) => subcatopt.includes(data)) &&
        (item.subsubcategoryfrom?.length > 0 ? item.subsubcategoryfrom.some((data) => subSubcatopt.includes(data)) : true) &&
        item?.typefrom?.some((data) => valueType.includes(data)) &&
        item.companyfrom === teamgrouping.companyfrom &&
        item.companyto === teamgrouping.companyto &&
        item.branchfrom.some((item) => selectedBranchFrom.map((item) => item.value).includes(item)) &&
        item.unitfrom.some((item) => selectedUnitFrom.map((item) => item.value).includes(item)) &&
        item.teamfrom.some((item) => selectedTeamFrom.map((item) => item.value).includes(item)) &&
        item.employeenamefrom.some((item) => selectedEmployeeFrom.map((item) => item.value).includes(item)) &&
        item.branchto.some((item) => selectedBranchTo.map((item) => item.value).includes(item)) &&
        item.unitto.some((item) => selectedUnitTo.map((item) => item.value).includes(item)) &&
        item.teamto.some((item) => selectedTeamTo.map((item) => item.value).includes(item)) &&
        item.employeenameto.some((item) => selectedEmployeeTo.map((item) => item.value).includes(item))
    );

    if (teamgrouping.companyfrom === 'Please Select Company') {
      setPopupContentMalert('Please Select Company From');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedBranchFrom.length === 0) {
      setPopupContentMalert('Please Select Branch From');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedUnitFrom.length === 0) {
      setPopupContentMalert('Please Select Unit From');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedTeamFrom.length === 0) {
      setPopupContentMalert('Please Select Team From');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedEmployeeFrom.length === 0) {
      setPopupContentMalert('Please Select Employeename From');
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
    } else if (valueType.length == 0) {
      setPopupContentMalert('Please Select Type');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (teamgrouping.companyto === 'Please Select Company') {
      setPopupContentMalert('Please Select Company To');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedBranchTo.length === 0) {
      setPopupContentMalert('Please Select Branch To');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedUnitTo.length === 0) {
      setPopupContentMalert('Please Select Unit To');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedTeamTo.length === 0) {
      setPopupContentMalert('Please Select Team To');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedEmployeeTo.length === 0) {
      setPopupContentMalert('Please Select Employeename To');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert('Team Grouping already exists!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      sendRequest();
    }
  };

  //handle Clear
  const handleClear = (e) => {
    e.preventDefault();
    setTeamgrouping({
      categoryfrom: 'Please Select Category',
      subcategoryfrom: 'Please Select Subcategory',
      companyfrom: 'Please Select Company',
      type: 'Please Select Type',
      companyto: 'Please Select Company',
    });
    setSelectedBranchFrom([]);
    setSelectedUnitFrom([]);
    setSelectedTeamFrom([]);
    setSelectedEmployeeFrom([]);
    setSelectedBranchTo([]);
    setSelectedUnitTo([]);
    setSelectedTeamTo([]);
    setSelectedEmployeeTo([]);
    setSelectedOptionstype([]);
    setValueType([]);
    setSubcategorys([]);
    setValueCat([]);
    setSelectedOptionsCat([]);
    setValueSubCat([]);
    setSelectedOptionsSubCat([]);
    setValueSubSubCat([]);
    setSelectedOptionsSubSubCat([]);
    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
  };

  // info model
  const [openInfo, setOpeninfo] = useState(false);

  const handleClickOpeninfo = () => {
    setOpeninfo(true);
  };

  const handleCloseinfo = () => {
    setOpeninfo(false);
  };

  const [categorys, setCategorys] = useState([]);
  const [categorysEdit, setCategorysEdit] = useState([]);
  const [subcategorys, setSubcategorys] = useState([]);
  const [subcategorysEdit, setSubcategorysEdit] = useState([]);

  //category multiselect

  const [selectedOptionsCat, setSelectedOptionsCat] = useState([]);
  let [valueCat, setValueCat] = useState([]);
  const [selectedOptionsType, setSelectedOptionstype] = useState([]);
  let [valueType, setValueType] = useState([]);
  const [selectedCategoryOptionsCateEdit, setSelectedCategoryOptionsCateEdit] = useState([]);
  const [categoryValueCateEdit, setCategoryValueCateEdit] = useState('');

  const [selectedTypeOptionsTypeEdit, setSelectedTypeOptionsTypeEdit] = useState([]);
  const [categoryValueTypeEdit, setTypeValueTypeEdit] = useState('');

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
    setSelectedOptionstype([]);
    setTeamgrouping({ ...teamgrouping, type: 'Please Select Type' });
  };

  const customValueRendererCat = (valueCat, _categoryname) => {
    return valueCat?.length ? valueCat.map(({ label }) => label)?.join(', ') : 'Please Select Category';
  };

  const handleTypeChange = (options) => {
    setValueType(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionstype(options);
  };

  const customValueRendererType = (valueType) => {
    return valueType?.length ? valueType.map(({ label }) => label)?.join(', ') : 'Please Select Type';
  };

  const handleTypeChangeEdit = (options) => {
    setTypeValueTypeEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedTypeOptionsTypeEdit(options);
  };
  const customValueRendererTypeEdit = (typeValueTypeEdit) => {
    return typeValueTypeEdit?.length ? typeValueTypeEdit.map(({ label }) => label)?.join(', ') : 'Please Select Type';
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
    setSelectedTypeOptionsTypeEdit([]);
    setTypeValueTypeEdit([]);
    setSelectedSubSubCategoryOptionsCateEdit([]);
    setTeamgroupingEdit({
      ...teamgroupingEdit,
      typefrom: 'Please Select Type',
    });
  };
  const customValueRendererCategoryEdit = (categoryValueCateEdit, _employeename) => {
    return categoryValueCateEdit?.length ? categoryValueCateEdit.map(({ label }) => label)?.join(', ') : 'Please Select Category';
  };

  //subcategory multiselect
  const [selectedOptionsSubCat, setSelectedOptionsSubCat] = useState([]);
  let [valueSubCat, setValueSubCat] = useState([]);
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
    setSelectedOptionstype([]);
    setSelectedOptionsSubSubCat([]);
    setTeamgrouping({ ...teamgrouping, type: 'Please Select Type' });
  };

  const customValueRendererSubCat = (valueSubCat, _categoryname) => {
    return valueSubCat?.length ? valueSubCat.map(({ label }) => label)?.join(', ') : 'Please Select Sub Category';
  };

  const handleSubCategoryChangeEdit = (options) => {
    setSubCategoryValueCateEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedSubCategoryOptionsCateEdit(options);
    setSelectedTypeOptionsTypeEdit([]);
    setTypeValueTypeEdit([]);
    setTeamgroupingEdit({
      ...teamgroupingEdit,
      typefrom: 'Please Select Type',
    });
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
    setSelectedOptionstype([]);
    setTeamgrouping({ ...teamgrouping, type: 'Please Select Type' });
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
    setSelectedTypeOptionsTypeEdit([]);
    setTypeValueTypeEdit([]);
    setTeamgroupingEdit({
      ...teamgroupingEdit,
      typefrom: 'Please Select Type',
    });
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

  const [typeOptions, setTypeOptions] = useState([]);

  const fetchTypemaster = async () => {
    setPageName(!pageName);
    try {
      let res_type = await axios.get(SERVICE.TYPEMASTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTypeOptions(res_type?.data?.typemasters);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //get single row to edit....
  const getCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.TEAMGROUPING_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTeamgroupingEdit(res?.data?.steamgrouping);
      setSelectedBranchFromEdit(
        res?.data?.steamgrouping.branchfrom.map((item) => ({
          ...item,
          label: item,
          value: item,
        }))
      );
      setSelectedBranchToEdit(
        res?.data?.steamgrouping.branchto.map((item) => ({
          ...item,
          label: item,
          value: item,
        }))
      );
      setSelectedUnitFromEdit(
        res?.data?.steamgrouping.unitfrom.map((item) => ({
          ...item,
          label: item,
          value: item,
        }))
      );
      setSelectedUnitToEdit(
        res?.data?.steamgrouping.unitto.map((item) => ({
          ...item,
          label: item,
          value: item,
        }))
      );
      setSelectedTeamFromEdit(
        res?.data?.steamgrouping.teamfrom.map((item) => ({
          ...item,
          label: item,
          value: item,
        }))
      );
      setSelectedTeamToEdit(
        res?.data?.steamgrouping.teamto.map((item) => ({
          ...item,
          label: item,
          value: item,
        }))
      );
      setSelectedEmployeeFromEdit(
        res?.data?.steamgrouping.employeenamefrom.map((item) => ({
          ...item,
          label: item,
          value: item,
        }))
      );
      setSelectedEmployeeToEdit(
        res?.data?.steamgrouping.employeenameto.map((item) => ({
          ...item,
          label: item,
          value: item,
        }))
      );

      setCategoryValueCateEdit(res?.data?.steamgrouping?.categoryfrom);
      setTypeValueTypeEdit(res?.data?.steamgrouping?.typefrom);
      setSelectedCategoryOptionsCateEdit([
        ...res?.data?.steamgrouping?.categoryfrom.map((t) => ({
          ...t,
          label: t,
          value: t,
        })),
      ]);
      setSelectedTypeOptionsTypeEdit([
        ...res?.data?.steamgrouping?.typefrom?.map((t) => ({
          ...t,
          label: t,
          value: t,
        })),
      ]);
      setSubCategoryValueCateEdit(res?.data?.steamgrouping?.subcategoryreason);
      setSelectedSubCategoryOptionsCateEdit([
        ...res?.data?.steamgrouping?.subcategoryfrom.map((t) => ({
          ...t,
          label: t,
          value: t,
        })),
      ]);
      setSubSubCategoryValueCateEdit(res?.data?.steamgrouping?.subsubcategoryfrom);
      setSelectedSubSubCategoryOptionsCateEdit([
        ...res?.data?.steamgrouping?.subsubcategoryfrom.map((t) => ({
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
      let res = await axios.get(`${SERVICE.TEAMGROUPING_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTeamgroupingEdit(res?.data?.steamgrouping);
      setTeamgroupingsview(res?.data?.steamgrouping);
      handleClickOpenview();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  // get single row to view....
  const getinfoCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.TEAMGROUPING_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTeamgroupingEdit(res?.data?.steamgrouping);
      handleClickOpeninfo();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //Project updateby edit page...
  let updateby = teamgroupingEdit?.updatedby;
  let addedby = teamgroupingEdit?.addedby;

  let subprojectsid = teamgroupingEdit?._id;

  //editing the single data...
  const sendEditRequest = async () => {
    let branchnamesfrom = selectedBranchFromEdit.map((item) => item.value);
    let unitnamesfrom = selectedUnitFromEdit.map((item) => item.value);
    let teamnamesfrom = selectedTeamFromEdit.map((item) => item.value);
    let employeenamesfrom = selectedEmployeeFromEdit.map((item) => item.value);
    let branchnamesto = selectedBranchToEdit.map((item) => item.value);
    let unitnamesto = selectedUnitToEdit.map((item) => item.value);
    let teamnamesto = selectedTeamToEdit.map((item) => item.value);
    let employeenamesto = selectedEmployeeToEdit.map((item) => item.value);

    setPageName(!pageName);
    const NewDatetime = await getCurrentServerTime();
    try {
      await axios.put(`${SERVICE.TEAMGROUPING_SINGLE}/${subprojectsid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        categoryfrom: categoryValueCateEdit,
        subcategoryfrom: subCategoryValueCateEdit,
        subsubcategoryfrom: subSubCategoryValueCateEdit,
        typefrom: [...categoryValueTypeEdit],
        companyfrom: String(teamgroupingEdit.companyfrom),
        branchfrom: branchnamesfrom,
        unitfrom: unitnamesfrom,
        teamfrom: teamnamesfrom,
        employeenamefrom: employeenamesfrom,
        companyto: String(teamgroupingEdit.companyto),
        branchto: branchnamesto,
        unitto: unitnamesto,
        teamto: teamnamesto,
        employeenameto: employeenamesto,
        updatedby: [
          ...updateby,
          {
            name: String(isUserRoleAccess.companyname),
          },
        ],
      });
      setTeamgrouping({
        ...teamgrouping,
        category: 'Please Select Category',
        subcategory: 'Please Select Subcategory',
        companyfrom: 'Please Select Company',
        type: 'Please Select Type',
        companyto: 'Please Select Company',
      });
      await fetchTeamgrouping();
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

    const isNameMatch = allTeamgroupingedit.some(
      (item) =>
        item.categoryfrom.some((data) => catopt.includes(data)) &&
        item.subcategoryfrom.some((data) => subcatopt.includes(data)) &&
        (item.subsubcategoryfrom?.length > 0 ? item.subsubcategoryfrom.some((data) => subSubcatopt.includes(data)) : true) &&
        item?.typefrom?.some((data) => categoryValueTypeEdit.includes(data)) &&
        item.companyfrom === teamgroupingEdit.companyfrom &&
        item.companyto === teamgroupingEdit.companyto &&
        item.branchfrom.some((item) => selectedBranchFromEdit.map((item) => item.value).includes(item)) &&
        item.unitfrom.some((item) => selectedUnitFromEdit.map((item) => item.value).includes(item)) &&
        item.teamfrom.some((item) => selectedTeamFromEdit.map((item) => item.value).includes(item)) &&
        item.employeenamefrom.some((item) => selectedEmployeeFromEdit.map((item) => item.value).includes(item)) &&
        item.branchto.some((item) => selectedBranchToEdit.map((item) => item.value).includes(item)) &&
        item.unitto.some((item) => selectedUnitToEdit.map((item) => item.value).includes(item)) &&
        item.teamto.some((item) => selectedTeamToEdit.map((item) => item.value).includes(item)) &&
        item.employeenameto.some((item) => selectedEmployeeToEdit.map((item) => item.value).includes(item))
    );
    if (teamgroupingEdit.companyfrom === 'Please Select Company') {
      setPopupContentMalert('Please Select Company From');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedBranchFromEdit.length === 0) {
      setPopupContentMalert('Please Select Branch From');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedUnitFromEdit.length === 0) {
      setPopupContentMalert('Please Select Unit From');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedTeamFromEdit.length === 0) {
      setPopupContentMalert('Please Select Team From');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedEmployeeFromEdit.length === 0) {
      setPopupContentMalert('Please Select Employeename From');
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
    } else if (categoryValueTypeEdit.length == 0) {
      setPopupContentMalert('Please Select Type');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (teamgroupingEdit.companyto === 'Please Select Company') {
      setPopupContentMalert('Please Select Company To');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedBranchToEdit.length === 0) {
      setPopupContentMalert('Please Select Branch To');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedUnitToEdit.length === 0) {
      setPopupContentMalert('Please Select Unit To');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedTeamToEdit.length === 0) {
      setPopupContentMalert('Please Select Team To');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedEmployeeToEdit.length === 0) {
      setPopupContentMalert('Please Select Employeename To');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert('Team Grouping already exists!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      sendEditRequest();
    }
  };

  const accessbranch = isUserRoleAccess?.role?.includes('Manager')
    ? isAssignBranch?.map((data) => ({
      branch: data.branch,
      company: data.company,
      unit: data.unit,
      branchaddress: data?.branchaddress,
    }))
    : isAssignBranch?.filter((data) => {
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
    });
  //get all Sub vendormasters.
  const fetchTeamgrouping = async () => {
    setPageName(!pageName);
    try {
      let res_team = await axios.post(
        SERVICE.TEAMGROUPING_ASSIGNBRANCH,
        {
          assignbranch: accessbranch,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setTeamgroupingcheck(true);
      setTeamgroupingsList(res_team?.data?.teamgroupings);
      const answer =
        res_team?.data?.teamgroupings?.length > 0
          ? res_team?.data?.teamgroupings?.map((item, index) => ({
            ...item,
            serialNumber: index + 1,
            category: item.categoryfrom?.map((t, i) => `${i + 1 + '. '}` + t).join('\n'),
            subcategory: item.subcategoryfrom?.map((t, i) => `${i + 1 + '. '}` + t).join('\n'),
            subsubcategory: item.subsubcategoryfrom?.map((t, i) => `${i + 1 + '. '}` + t).join('\n'),
            type: item?.typefrom?.map((t, i) => `${i + 1 + '. '}` + t).join('\n'),
            companyto: item.companyto,
            branchlist: item.branchfrom?.map((t, i) => `${i + 1 + '. '}` + t).join('\n'),
            unitlist: item.unitfrom?.map((t, i) => `${i + 1 + '. '}` + t).join('\n'),
            teamlist: item.teamfrom?.map((t, i) => `${i + 1 + '. '}` + t).join('\n'),
            branchtolist: item.branchto ? item.branchto?.map((t, i) => `${i + 1 + '. '}` + t).join('\n') : '',
            unittolist: item.unitto?.map((t, i) => `${i + 1 + '. '}` + t).join('\n'),
            teamtolist: item.teamto?.map((t, i) => `${i + 1 + '. '}` + t).join('\n'),
            employeenametolist: item.employeenameto?.map((t, i) => `${i + 1 + '. '}` + t).join('\n'),
            employeenamefromlist: item.employeenamefrom?.map((t, i) => `${i + 1 + '. '}` + t).join('\n'),
            company: item.companyfrom,
          }))
          : [];

      setTeamgroupings(answer);
    } catch (err) {
      setTeamgroupingcheck(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //get all Sub vendormasters.
  const fetchTeamgroupingAll = async () => {
    setPageName(!pageName);
    try {
      let res_team = await axios.get(SERVICE.TEAMGROUPING, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setAllTeamgroupingedit(res_team?.data?.teamgroupings.filter((item) => item._id !== teamgroupingEdit._id));
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Excel
  const fileName = 'Teamgrouping';

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Teamgrouping',
    pageStyle: 'print',
  });

  useEffect(() => {
    fetchTeamgroupingAll();
  }, [isEditOpen]);

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
    addSerialNumber(teamgroupings);
  }, [teamgroupings]);

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

  const handleSearch = items.map((item, index) => ({
    ...item,
    id: item._id,
    category: item.categoryfrom?.map((t, i) => `${i + 1 + '. '}` + t).toString(),
    subcategory: item.subcategoryfrom?.map((t, i) => `${i + 1 + '. '}` + t).toString(),
    subsubcategory: item.subsubcategoryfrom?.map((t, i) => `${i + 1 + '. '}` + t).toString(),
    type: item?.typefrom?.map((t, i) => `${i + 1 + '. '}` + t).toString(),
    branchlist: item.branchfrom
      ?.map((t, i) => t)
      .join(',')
      .toString(),
    unitlist: item.unitfrom
      ?.map((t, i) => t)
      .join(',')
      .toString(),
    teamlist: item.teamfrom
      ?.map((t, i) => t)
      .join(',')
      .toString(),
    branchtolist: item.branchto
      ?.map((t, i) => t)
      .join(',')
      .toString(),
    unittolist: item.unitto
      ?.map((t, i) => t)
      .join(',')
      .toString(),
    teamtolist: item.teamto
      ?.map((t, i) => t)
      .join(',')
      .toString(),
    employeenameto: item.employeenameto,
    employeenamefrom: item.employeenamefrom,
    employeenametolist: item.employeenameto
      ?.map((t, i) => `${i + 1 + '.'}` + t)
      .join(',')
      .toString(),
    employeenamefromlist: item.employeenamefrom
      ?.map((t, i) => `${i + 1 + '.'}` + t)
      .join(',')
      .toString(),
  }));

  //datatable....
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  // Split the search query into individual terms
  const searchTerms = searchQuery.toLowerCase().split(' ');
  // Modify the filtering logic to check each term
  const filteredDatas = handleSearch?.filter((item) => {
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
  useEffect(() => {
    const savedVisibility = localStorage.getItem('columnVisibility');
    if (savedVisibility) {
      setColumnVisibility(JSON.parse(savedVisibility));
    }
  }, []);

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
      width: 80,
      hide: !columnVisibility.serialNumber,
      headerClassName: 'bold-header',
    },
    {
      field: 'company',
      headerName: 'From Company',
      flex: 0,
      width: 120,
      hide: !columnVisibility.company,
      headerClassName: 'bold-header',
    },
    {
      field: 'branchlist',
      headerName: ' From Branch',
      flex: 0,
      width: 100,
      hide: !columnVisibility.branchlist,
      headerClassName: 'bold-header',
    },
    {
      field: 'unitlist',
      headerName: 'From Unit',
      flex: 0,
      width: 100,
      hide: !columnVisibility.unitlist,
      headerClassName: 'bold-header',
    },
    {
      field: 'teamlist',
      headerName: 'From Team',
      flex: 0,
      width: 100,
      hide: !columnVisibility.teamlist,
      headerClassName: 'bold-header',
    },
    {
      field: 'employeenamefromlist',
      headerName: 'From Employee Name',
      flex: 0,
      width: 220,
      hide: !columnVisibility.employeenamefromlist,
      headerClassName: 'bold-header',
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 0,
      width: 100,
      hide: !columnVisibility.category,
      headerClassName: 'bold-header',
    },
    {
      field: 'subcategory',
      headerName: 'Subcategory',
      flex: 0,
      width: 100,
      hide: !columnVisibility.subcategory,
      headerClassName: 'bold-header',
    },
    {
      field: 'subsubcategory',
      headerName: 'Sub Subcategory',
      flex: 0,
      width: 150,
      hide: !columnVisibility.subsubcategory,
      headerClassName: 'bold-header',
    },
    {
      field: 'type',
      headerName: 'Type',
      flex: 0,
      width: 100,
      hide: !columnVisibility.type,
      headerClassName: 'bold-header',
    },
    {
      field: 'companyto',
      headerName: 'To Company',
      flex: 0,
      width: 100,
      hide: !columnVisibility.companyto,
      headerClassName: 'bold-header',
    },
    {
      field: 'branchtolist',
      headerName: 'To Branch',
      flex: 0,
      width: 100,
      hide: !columnVisibility.branchtolist,
      headerClassName: 'bold-header',
    },
    {
      field: 'unittolist',
      headerName: 'To Unit',
      flex: 0,
      width: 100,
      hide: !columnVisibility.unittolist,
      headerClassName: 'bold-header',
    },
    {
      field: 'teamtolist',
      headerName: 'To Team',
      flex: 0,
      width: 100,
      hide: !columnVisibility.teamtolist,
      headerClassName: 'bold-header',
    },
    {
      field: 'employeenametolist',
      headerName: 'To Employee Name',
      flex: 0,
      width: 250,
      hide: !columnVisibility.employeenametolist,
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
          {isUserRoleCompare?.includes('eteamgrouping') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getCode(params.data.id, params.data.name);
              }}
            >
              <EditOutlinedIcon sx={buttonStyles.buttonedit} style={{ fontsize: 'large' }} />
            </Button>
          )}
          {isUserRoleCompare?.includes('dteamgrouping') && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.data.id, params.data.name);
              }}
            >
              <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} style={{ fontsize: 'large' }} />
            </Button>
          )}
          {isUserRoleCompare?.includes('vteamgrouping') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getviewCode(params.data.id);
              }}
            >
              <VisibilityOutlinedIcon sx={buttonStyles.buttonview} style={{ fontsize: 'large' }} />
            </Button>
          )}
          {isUserRoleCompare?.includes('iteamgrouping') && (
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

  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item._id,
      serialNumber: item.serialNumber,
      category: item.category,
      subcategory: item.subcategory,
      subsubcategory: item.subsubcategory,
      type: item?.type,
      company: item.company,
      branchlist: item.branchlist,
      unitlist: item.unitlist,
      teamlist: item.teamlist,
      companyto: item.companyto,
      branchtolist: item.branchtolist,
      unittolist: item.unittolist,
      teamtolist: item.teamtolist,
      employeenametolist: item.employeenametolist,
      employeenamefromlist: item.employeenamefromlist,
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
      <Headtitle title={'Team Grouping'} />
      <PageHeading title="Team Grouping" modulename="Tickets" submodulename="Master" mainpagename="Team Grouping" subpagename="" subsubpagename="" />
      {/* ****** Header Content ****** */}
      {isUserRoleCompare?.includes('ateamgrouping') && (
        <Box sx={userStyle.dialogbox}>
          <>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography sx={userStyle.importheadtext}>From Team Grouping</Typography>
              </Grid>
            </Grid>
            <br />
            <Grid container spacing={2}>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Company<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    options={accessbranch
                      ?.map((data) => ({
                        label: data.company,
                        value: data.company,
                      }))
                      .filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                    styles={colourStyles}
                    value={{
                      label: teamgrouping.companyfrom,
                      value: teamgrouping.companyfrom,
                    }}
                    onChange={(e) => {
                      setTeamgrouping({
                        ...teamgrouping,
                        companyfrom: e.value,
                      });
                      setSelectedBranchFrom([]);
                      setSelectedUnitFrom([]);
                      setSelectedTeamFrom([]);
                      setSelectedEmployeeFrom([]);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Branch<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <MultiSelect
                    options={accessbranch
                      ?.filter((comp) => teamgrouping.companyfrom === comp.company)
                      ?.map((data) => ({
                        label: data.branch,
                        value: data.branch,
                      }))
                      .filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                    value={selectedBranchFrom}
                    onChange={handleBranchChangeFrom}
                    valueRenderer={customValueRendererBranchFrom}
                    labelledBy="Please Select Branch"
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Unit<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <MultiSelect
                    options={accessbranch
                      ?.filter((comp) => teamgrouping.companyfrom === comp.company && selectedBranchFrom.map((item) => item.value).includes(comp.branch))
                      ?.map((data) => ({
                        label: data.unit,
                        value: data.unit,
                      }))
                      .filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                    value={selectedUnitFrom}
                    onChange={handleUnitChangeFrom}
                    valueRenderer={customValueRendererUnitFrom}
                    labelledBy="Please Select Unit"
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Team<b style={{ color: 'red' }}>*</b>
                  </Typography>

                  <MultiSelect
                    options={allTeam
                      ?.filter((comp) => teamgrouping.companyfrom === comp.company && selectedBranchFrom.map((item) => item.value).includes(comp.branch) && selectedUnitFrom.map((item) => item.value).includes(comp.unit))
                      ?.map((data) => ({
                        label: data.teamname,
                        value: data.teamname,
                      }))
                      .filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                    value={selectedTeamFrom}
                    onChange={handleTeamChangeFrom}
                    valueRenderer={customValueRendererTeamFrom}
                    labelledBy="Please Select Team"
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Employee Name <b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <MultiSelect
                    options={allUsersData
                      ?.filter(
                        (comp) =>
                          teamgrouping.companyfrom === comp.company &&
                          selectedBranchFrom.map((item) => item.value).includes(comp.branch) &&
                          selectedUnitFrom.map((item) => item.value).includes(comp.unit) &&
                          selectedTeamFrom.map((item) => item.value).includes(comp.team) &&
                          !selectedEmployeeTo.map((item) => item.value).includes(comp.companyname)
                      )
                      ?.map((com) => ({
                        ...com,
                        label: com.companyname,
                        value: com.companyname,
                      }))}
                    value={selectedEmployeeFrom}
                    onChange={handleEmployeeChangeFrom}
                    valueRenderer={customValueRendererEmployeeFrom}
                    labelledBy="Please Select Employeename"
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
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
              <Grid item md={3} xs={12} sm={12}>
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
                <Grid item md={3} xs={12} sm={12}>
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
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Type<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <MultiSelect
                    options={typeOptions
                      ?.filter((u) => {
                        const catMatch = u.categorytype.some((data) => selectedOptionsCat.map((item) => item.value).includes(data));
                        const subCatMatch = u.subcategorytype.some((data) => selectedOptionsSubCat.map((item) => item.value).includes(data));

                        const subSubCatMatch = selectedOptionsSubSubCat.map((item) => item.value).length === 0 || u.subsubcategorytype.some((data) => selectedOptionsSubSubCat.map((item) => item.value).includes(data));

                        return (catMatch && subCatMatch && subSubCatMatch) || (catMatch && subCatMatch);
                      })
                      .map((u) => ({
                        ...u,
                        label: u.nametype,
                        value: u.nametype,
                      }))
                      .filter((obj, index, self) => {
                        // Filter out duplicate values based on the 'value' property
                        return index === self.findIndex((item) => item.value === obj.value);
                      })}
                    value={selectedOptionsType}
                    onChange={(e) => {
                      handleTypeChange(e);
                    }}
                    valueRenderer={customValueRendererType}
                    labelledBy="Please Select Type"
                  />
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography sx={userStyle.importheadtext}>To Team Grouping</Typography>
              </Grid>
            </Grid>
            <br />
            <Grid container spacing={2}>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Company<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    options={accessbranch
                      ?.map((data) => ({
                        label: data.company,
                        value: data.company,
                      }))
                      .filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                    styles={colourStyles}
                    value={{
                      label: teamgrouping.companyto,
                      value: teamgrouping.companyto,
                    }}
                    onChange={(e) => {
                      setTeamgrouping({ ...teamgrouping, companyto: e.value });
                      setSelectedBranchTo([]);
                      setSelectedUnitTo([]);
                      setSelectedTeamTo([]);
                      setSelectedEmployeeTo([]);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Branch<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <MultiSelect
                    options={accessbranch
                      ?.filter((comp) => teamgrouping.companyto === comp.company)
                      ?.map((data) => ({
                        label: data.branch,
                        value: data.branch,
                      }))
                      .filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                    value={selectedBranchTo}
                    onChange={handleBranchChangeTo}
                    valueRenderer={customValueRendererBranchTo}
                    labelledBy="Please Select Branch"
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Unit<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <MultiSelect
                    options={accessbranch
                      ?.filter((comp) => teamgrouping.companyto === comp.company && selectedBranchTo.map((item) => item.value).includes(comp.branch))
                      ?.map((data) => ({
                        label: data.unit,
                        value: data.unit,
                      }))
                      .filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                    value={selectedUnitTo}
                    onChange={handleUnitChangeTo}
                    valueRenderer={customValueRendererUnitTo}
                    labelledBy="Please Select Branch"
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Team<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <MultiSelect
                    options={allTeam
                      ?.filter((comp) => teamgrouping.companyto === comp.company && selectedBranchTo.map((item) => item.value).includes(comp.branch) && selectedUnitTo.map((item) => item.value).includes(comp.unit))
                      ?.map((data) => ({
                        label: data.teamname,
                        value: data.teamname,
                      }))
                      .filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                    value={selectedTeamTo}
                    onChange={handleTeamChangeTo}
                    valueRenderer={customValueRendererTeamTo}
                    labelledBy="Please Select Branch"
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Employee Name <b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <MultiSelect
                    options={allUsersData
                      ?.filter((comp) => teamgrouping.companyto === comp.company && selectedBranchTo.map((item) => item.value).includes(comp.branch) && selectedUnitTo.map((item) => item.value).includes(comp.unit) && selectedTeamTo.map((item) => item.value).includes(comp.team))
                      ?.map((com) => ({
                        ...com,
                        label: com.companyname,
                        value: com.companyname,
                      }))}
                    value={selectedEmployeeTo}
                    onChange={handleEmployeeChangeTo}
                    valueRenderer={customValueRendererEmployeeTo}
                    labelledBy="Please Select Employeename"
                  />
                </FormControl>
              </Grid>
              <Grid item md={2.5} xs={12} sm={6}>
                <Typography>&nbsp;</Typography>
                <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isButton} sx={buttonStyles.buttonsubmit}>
                  Submit
                </Button>{' '}
                &nbsp;
                <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                  Clear
                </Button>
              </Grid>
            </Grid>
            {/* <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={3} xs={12} sm={6}>
                <LoadingButton
                  loading={isButton}
                  variant="contained"
                  color="primary"
                  sx={buttonStyles.buttonsubmit}
                  onClick={handleSubmit}
                >
                  Submit
                </LoadingButton>
              </Grid>
              <Grid item md={2.5} xs={12} sm={6}>
                <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                  Clear
                </Button>
              </Grid>
            </Grid> */}
          </>
        </Box>
      )}
      <br /> <br />
      <br /> <br />
      <Box>
        {/* Edit DIALOG */}
        <Dialog open={isEditOpen} onClose={handleCloseModEdit} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth={true} maxWidth="lg" scroll="paper" sx={{ marginTop: '40px' }}>
          <Box sx={{ padding: '10px 20px' }}>
            <>
              <Grid container>
                <Grid item md={12} xs={12} sm={12}>
                  <Typography variant="h6">Edit Team Grouping</Typography>
                </Grid>
              </Grid>
              <br />
              <>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <Typography sx={userStyle.importheadtext}>From Edit Team Grouping</Typography>
                  </Grid>
                </Grid>
                <br />
                <Grid container spacing={2}>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Company<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <Selects
                        options={accessbranch
                          ?.map((data) => ({
                            label: data.company,
                            value: data.company,
                          }))
                          .filter((item, index, self) => {
                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                          })}
                        styles={colourStyles}
                        value={{
                          label: teamgroupingEdit.companyfrom,
                          value: teamgroupingEdit.companyfrom,
                        }}
                        onChange={(e) => {
                          setTeamgroupingEdit({
                            ...teamgroupingEdit,
                            companyfrom: e.value,
                          });
                          setSelectedBranchFromEdit([]);
                          setSelectedUnitFromEdit([]);
                          setSelectedTeamFromEdit([]);
                          setSelectedEmployeeFromEdit([]);
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Branch<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={accessbranch
                          ?.filter((comp) => teamgroupingEdit.companyfrom === comp.company)
                          ?.map((data) => ({
                            label: data.branch,
                            value: data.branch,
                          }))
                          .filter((item, index, self) => {
                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                          })}
                        value={selectedBranchFromEdit}
                        style={{
                          option: (base, state) => ({
                            ...base,
                            height: '40px', // Set the desired height here
                          }),
                          control: (base, state) => ({
                            ...base,
                            minHeight: '40px', // Set the desired height here
                          }),
                        }}
                        onChange={handleBranchChangeFromEdit}
                        valueRenderer={customValueRendererBranchFromEdit}
                        labelledBy="Please Select Branch"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Unit<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={accessbranch
                          ?.filter((comp) => teamgroupingEdit.companyfrom === comp.company && selectedBranchFromEdit.map((item) => item.value).includes(comp.branch))
                          ?.map((data) => ({
                            label: data.unit,
                            value: data.unit,
                          }))
                          .filter((item, index, self) => {
                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                          })}
                        value={selectedUnitFromEdit}
                        onChange={handleUnitChangeFromEdit}
                        valueRenderer={customValueRendererUnitFromEdit}
                        labelledBy="Please Select Unit"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Team<b style={{ color: 'red' }}>*</b>
                      </Typography>

                      <MultiSelect
                        options={allTeam
                          ?.filter((comp) => teamgroupingEdit.companyfrom === comp.company && selectedBranchFromEdit.map((item) => item.value).includes(comp.branch) && selectedUnitFromEdit.map((item) => item.value).includes(comp.unit))
                          ?.map((data) => ({
                            label: data.teamname,
                            value: data.teamname,
                          }))
                          .filter((item, index, self) => {
                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                          })}
                        value={selectedTeamFromEdit}
                        onChange={handleTeamChangeFromEdit}
                        valueRenderer={customValueRendererTeamFromEdit}
                        labelledBy="Please Select Team"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Employee Name <b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={allUsersData
                          ?.filter(
                            (comp) =>
                              teamgroupingEdit.companyfrom === comp.company &&
                              selectedBranchFromEdit.map((item) => item.value).includes(comp.branch) &&
                              selectedUnitFromEdit.map((item) => item.value).includes(comp.unit) &&
                              selectedTeamFromEdit.map((item) => item.value).includes(comp.team) &&
                              !selectedEmployeeToEdit.map((item) => item.value).includes(comp.companyname)
                          )
                          ?.map((com) => ({
                            ...com,
                            label: com.companyname,
                            value: com.companyname,
                          }))}
                        value={selectedEmployeeFromEdit}
                        onChange={handleEmployeeChangeFromEdit}
                        valueRenderer={customValueRendererEmployeeFromEdit}
                        labelledBy="Please Select Employeename"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Category<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <MultiSelect options={categorysEdit} value={selectedCategoryOptionsCateEdit} onChange={handleCategoryChangeEdit} valueRenderer={customValueRendererCategoryEdit} labelledBy="Please Select Category" />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Sub Category<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <MultiSelect options={filteredSubCategoryOptionsEdit} value={selectedSubCategoryOptionsCateEdit} onChange={handleSubCategoryChangeEdit} valueRenderer={customValueRendererSubCategoryEdit} labelledBy="Please Select Sub Category" />
                    </FormControl>
                  </Grid>
                  {filteredSubSubCategoryOptionsEdit?.length != 0 && (
                    <Grid item md={3} xs={12} sm={12}>
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
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Type<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={typeOptions
                          ?.filter((u) => {
                            const catMatch = u.categorytype.some((data) => selectedCategoryOptionsCateEdit.map((item) => item.value).includes(data));
                            const subCatMatch = u.subcategorytype.some((data) => selectedSubCategoryOptionsCateEdit.map((item) => item.value).includes(data));

                            // Check if subSubcatopt is not empty before applying the filter
                            const subSubCatMatch = selectedSubSubCategoryOptionsCateEdit.map((item) => item.value).length === 0 || u.subsubcategorytype.some((data) => selectedSubSubCategoryOptionsCateEdit.map((item) => item.value).includes(data));

                            return (catMatch && subCatMatch && subSubCatMatch) || (catMatch && subCatMatch);
                          })
                          .map((u) => ({
                            ...u,
                            label: u.nametype,
                            value: u.nametype,
                          }))
                          .filter((obj, index, self) => {
                            // Filter out duplicate values based on the 'value' property
                            return index === self.findIndex((item) => item.value === obj.value);
                          })}
                        value={selectedTypeOptionsTypeEdit}
                        onChange={handleTypeChangeEdit}
                        valueRenderer={customValueRendererTypeEdit}
                        labelledBy="Please Select Type"
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <br /> <br />
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <Typography sx={userStyle.importheadtext}>To Edit Team Grouping</Typography>
                  </Grid>
                </Grid>
                <br />
                <Grid container spacing={2}>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Company<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <Selects
                        options={accessbranch
                          ?.map((data) => ({
                            label: data.company,
                            value: data.company,
                          }))
                          .filter((item, index, self) => {
                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                          })}
                        styles={colourStyles}
                        value={{
                          label: teamgroupingEdit.companyto,
                          value: teamgroupingEdit.companyto,
                        }}
                        onChange={(e) => {
                          setTeamgroupingEdit({
                            ...teamgroupingEdit,
                            companyto: e.value,
                          });
                          setSelectedBranchToEdit([]);
                          setSelectedUnitToEdit([]);
                          setSelectedTeamToEdit([]);
                          setSelectedEmployeeToEdit([]);
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Branch<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={accessbranch
                          ?.filter((comp) => teamgroupingEdit.companyto === comp.company)
                          ?.map((data) => ({
                            label: data.branch,
                            value: data.branch,
                          }))
                          .filter((item, index, self) => {
                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                          })}
                        value={selectedBranchToEdit}
                        onChange={handleBranchChangeToEdit}
                        valueRenderer={customValueRendererBranchToEdit}
                        labelledBy="Please Select Branch"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Unit<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={accessbranch
                          ?.filter((comp) => teamgroupingEdit.companyto === comp.company && selectedBranchToEdit.map((item) => item.value).includes(comp.branch))
                          ?.map((data) => ({
                            label: data.unit,
                            value: data.unit,
                          }))
                          .filter((item, index, self) => {
                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                          })}
                        value={selectedUnitToEdit}
                        onChange={handleUnitChangeToEdit}
                        valueRenderer={customValueRendererUnitToEdit}
                        labelledBy="Please Select Branch"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Team<b style={{ color: 'red' }}>*</b>
                      </Typography>

                      <MultiSelect
                        options={allTeam
                          ?.filter((comp) => teamgroupingEdit.companyto === comp.company && selectedBranchToEdit.map((item) => item.value).includes(comp.branch) && selectedUnitToEdit.map((item) => item.value).includes(comp.unit))
                          ?.map((data) => ({
                            label: data.teamname,
                            value: data.teamname,
                          }))
                          .filter((item, index, self) => {
                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                          })}
                        value={selectedTeamToEdit}
                        onChange={handleTeamChangeToEdit}
                        valueRenderer={customValueRendererTeamToEdit}
                        labelledBy="Please Select Branch"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Employee Name <b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={allUsersData
                          ?.filter((comp) => teamgroupingEdit.companyto === comp.company && selectedBranchToEdit.map((item) => item.value).includes(comp.branch) && selectedUnitToEdit.map((item) => item.value).includes(comp.unit) && selectedTeamToEdit.map((item) => item.value).includes(comp.team))
                          ?.map((com) => ({
                            ...com,
                            label: com.companyname,
                            value: com.companyname,
                          }))}
                        value={selectedEmployeeToEdit}
                        style={{
                          menu: (provided, state) => ({
                            ...provided,
                            position: 'absolute',
                            top: '100%', // Set the desired top position
                            left: '0', // Set the desired left position
                            zIndex: 1000, // Set the desired zIndex
                          }),
                          menuList: (provided, state) => ({
                            ...provided,
                            maxHeight: '200px', // Set the desired max height here
                            overflowY: 'auto', // Add scroll if the content exceeds max height
                          }),
                        }}
                        onChange={handleEmployeeChangeToEdit}
                        valueRenderer={customValueRendererEmployeeToEdit}
                        labelledBy="Please Select Employeename"
                      // className="scrollable-multiselect"
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </>
              <br />
              <br />
              <Grid container spacing={2}>
                <Grid item md={1.5} xs={12} sm={12}>
                  <Button variant="contained" onClick={editSubmit} sx={buttonStyles.buttonsubmit}>
                    Update
                  </Button>
                </Grid>
                <Grid item md={1.5} xs={12} sm={12}>
                  <Button sx={buttonStyles.btncancel} onClick={handleCloseModEdit}>
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes('lteamgrouping') && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Team Grouping List</Typography>
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
                    <MenuItem value={teamgroupings?.length}>All</MenuItem>
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
                  {isUserRoleCompare?.includes('excelteamgrouping') && (
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
                  {isUserRoleCompare?.includes('csvteamgrouping') && (
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
                  {isUserRoleCompare?.includes('printteamgrouping') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('pdfteamgrouping') && (
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
                  {isUserRoleCompare?.includes('imageteamgrouping') && (
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
                  maindatas={teamgroupings}
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
            {isUserRoleCompare?.includes('bdteamgrouping') && (
              <Button variant="contained" color="error" onClick={handleClickOpenalert} sx={buttonStyles.buttonbulkdelete}>
                Bulk Delete
              </Button>
            )}
            <br />
            <br />
            {!teamgroupingCheck ? (
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
                    searchQuery={searchedString}
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
            <Button onClick={handleCloseMod} sx={userStyle.btncancel}>
              Cancel
            </Button>
            <Button autoFocus variant="contained" color="error" onClick={(e) => delTeamgrp(Teamgrpsid)} sx={buttonStyles.buttonsubmit}>
              {' '}
              OK{' '}
            </Button>
          </DialogActions>
        </Dialog>
        {/* print layout */}
      </Box>
      {/* view model */}
      <Dialog open={openview} onClose={handleClickOpenview} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth={true} maxWidth="lg" sx={{ marginTop: '40px' }}>
        <Box sx={{ padding: '20px 50px' }}>
          <>
            <Typography sx={userStyle.HeaderText}>
              {' '}
              <b>View Team Grouping</b>
            </Typography>
            <br /> <br />
            <Typography sx={userStyle.SubHeaderText}>
              <b>From Team Grouping</b>
            </Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Company</Typography>
                  <Typography>{teamgroupingview.companyfrom}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Branch</Typography>
                  <Typography>
                    {teamgroupingview.branchfrom
                      ?.map((t, i) => t)
                      .join(', ')
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Unit</Typography>
                  <Typography>
                    {teamgroupingview.unitfrom
                      ?.map((t, i) => t)
                      .join(', ')
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Team</Typography>
                  <Typography>
                    {teamgroupingview.teamfrom
                      ?.map((t, i) => t)
                      .join(', ')
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={6} sm={6}>
                <FormControl fullWidth size="small">
                  <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Employee Name</Typography>
                  <Typography>
                    {teamgroupingview?.employeenamefrom
                      ?.map((t, i) => `${i + 1 + '. '}` + t)
                      .join(', ')
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Category</Typography>
                  <Typography>
                    {teamgroupingview.categoryfrom
                      ?.map((t, i) => t)
                      .join(', ')
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Sub Category</Typography>
                  <Typography>
                    {teamgroupingview.subcategoryfrom
                      ?.map((t, i) => t)
                      .join(', ')
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Sub Subcategory</Typography>
                  <Typography>
                    {teamgroupingview.subcategoryfrom
                      ?.map((t, i) => t)
                      .join(', ')
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Type</Typography>
                  <Typography>{teamgroupingview?.typefrom?.join(', ')}</Typography>
                </FormControl>
              </Grid>
            </Grid>{' '}
            <br />
            <Divider />
            <br />
            <Typography sx={userStyle.SubHeaderText}>
              <b>To Team Grouping</b>
            </Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Company To</Typography>
                  <Typography>{teamgroupingview?.companyto}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Branch To</Typography>
                  <Typography>
                    {teamgroupingview?.branchto
                      ?.map((t, i) => t)
                      .join(', ')
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Unit To</Typography>
                  <Typography>
                    {teamgroupingview.unitto
                      ?.map((t, i) => t)
                      .join(', ')
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Team To</Typography>
                  <Typography>
                    {teamgroupingview.teamto
                      ?.map((t, i) => t)
                      .join(', ')
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={4.5} xs={6} sm={6}>
                <FormControl fullWidth size="small">
                  <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Employee Name To</Typography>
                  <Typography>
                    {teamgroupingview?.employeenameto
                      ?.map((t, i) => `${i + 1 + '. '}` + t)
                      .join(', ')
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br /> <br />
            <Grid container spacing={2}>
              <Button variant="contained" color="primary" onClick={handleCloseview} sx={buttonStyles.btncancel}>
                Back
              </Button>
            </Grid>
          </>
        </Box>
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
            <Button autoFocus variant="contained" color="error" onClick={(e) => delTeamgrpcheckbox(e)} sx={buttonStyles.buttonsubmit}>
              {' '}
              OK{' '}
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
      {/* ALERT DIALOG */}
      <Box>
        <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">{showAlert}</Typography>
          </DialogContent>
          <DialogActions>
            <Button sx={buttonStyles.buttonsubmit} variant="contained" color="error" onClick={handleCloseerr}>
              ok
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
        itemsTwo={items ?? []}
        filename={'Team Grouping'}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
      {/* INFO */}
      <InfoPopup openInfo={openInfo} handleCloseinfo={handleCloseinfo} heading="Team Grouping Info" addedby={addedby} updateby={updateby} />
    </Box>
  );
}

export default TeamGrouping;
