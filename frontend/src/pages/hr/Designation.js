import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ImageIcon from '@mui/icons-material/Image';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Box,
  Button,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Popover,
  Select,
  Table,
  TableBody,
  TableHead,
  TextareaAutosize,
  TextField,
  Typography,
} from '@mui/material';
import Switch from '@mui/material/Switch';
import axios from '../../axiosInstance';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment-timezone';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { FaFilePdf, FaPrint } from 'react-icons/fa';
import { ThreeDots } from 'react-loader-spinner';
import Selects from 'react-select';
import { useReactToPrint } from 'react-to-print';
import { handleApiError } from '../../components/Errorhandling';
import Headtitle from '../../components/Headtitle';
import { StyledTableCell, StyledTableRow } from '../../components/Table';
import StyledDataGrid from '../../components/TableStyle';
import { AuthContext, UserRoleAccessContext } from '../../context/Appcontext';
import { colourStyles, userStyle } from '../../pageStyle';
import { SERVICE } from '../../services/Baseservice';

import * as FileSaver from 'file-saver';
import { FaFileCsv, FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import PageHeading from '../../components/PageHeading';

import DialogContentText from '@mui/material/DialogContentText';
import AlertDialog from '../../components/Alert';
import ExportData from '../../components/ExportData';
import MessageAlert from '../../components/MessageAlert';

function Designation() {
  const [designation, setDesignation] = useState({
    // branch: "Please Select Branch",
    group: 'Please Select Group',
    name: '',
    description: '',
    ispromotion: false,
    isappraisal: false,
    isprobation: false,
    noticeperiodfrom: 'Month',
    noticeperiodto: '',
    appraisalfrom: 'Month',
    appraisalto: '',
    promotionfrom: 'Month',
    promotionto: '',
    probationfrom: 'Month',
    probationto: '',
  });

  const [isBtn, setIsBtn] = useState(false);

  let exportColumnNames = ['Group', 'Name', 'Description', 'Notice Period', 'Appraisal', 'Promotion', 'Probation'];
  let exportRowValues = ['group', 'name', 'description', 'noticeperiod', 'appraisal', 'promotion', 'probation'];

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

  // const [branches, setBranches] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [designationsalledit, setdesignationsalledit] = useState([]);

  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [designationgrp, setdesignationgrp] = useState([]);

  const { isUserRoleAccess, isUserRoleCompare, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);

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
      pagename: String('Designation'),
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

  const { auth } = useContext(AuthContext);
  const [isDesignation, setIsDesignation] = useState(false);

  const [ovProj, setOvProj] = useState('');
  const [ovProjcount, setOvProjcount] = useState(0);

  const [getOverAllCount, setGetOverallCount] = useState('');

  let username = isUserRoleAccess.username;
  const gridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState('');
  const [copiedData, setCopiedData] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  //image
  const handleCaptureImage = () => {
    if (gridRef.current) {
      html2canvas(gridRef.current).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, 'Designation.png');
        });
      });
    }
  };

  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
  };

  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  //error popup model
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleClose = () => {
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

  // view model
  const [openview, setOpenview] = useState(false);

  const handleClickOpenview = () => {
    setOpenview(true);
  };

  const handleCloseview = () => {
    setOpenview(false);
  };

  //Delete model
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleClickOpen = () => {
    setIsDeleteOpen(true);
  };

  const handleCloseMod = () => {
    setIsDeleteOpen(false);
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
  const [isDeleteOpenalert, setIsDeleteOpenalert] = useState(false);

  const handleClickOpenalert = () => {
    if (selectedRows.length === 0) {
      setIsDeleteOpenalert(true);
    } else {
      overallBulkdelete(selectedRows);

      // setIsDeleteOpencheckbox(true);
    }
  };

  const [selectedRowsCount, setSelectedRowsCount] = useState(0);

  const overallBulkdelete = async (ids) => {
    setPageName(!pageName);
    try {
      let overallcheck = await axios.post(`${SERVICE.DESIGNATIONBULKCHECK}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        id: ids,
      });
      setSelectedRows(overallcheck?.data?.result);
      setSelectedRowsCount(overallcheck?.data?.count);
      handleClickOpencheckbox(true);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
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
    // branch: true,
    group: true,
    name: true,
    description: true,
    ispromotion: false,
    isappraisal: false,
    isprobation: false,
    noticeperiod: true,
    appraisal: true,
    probation: true,
    promotion: true,
    actions: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  // get all designation
  const fetchDesignation = async () => {
    setPageName(!pageName);
    try {
      let res_designation = await axios.get(SERVICE.DESIGNATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setDesignations(
        res_designation?.data?.designation?.map((item) => ({
          ...item,
          ispromotion: item?.ispromotion ? item?.ispromotion : false,
          isappraisal: item?.isappraisal ? item?.isappraisal : false,
          isprobation: item?.isprobation ? item?.isprobation : false,
          probation: item?.isprobation ? `${item.probationto} - ${item.probationfrom}` : 'No',
          appraisal: item?.isappraisal ? `${item.appraisalto} - ${item.appraisalfrom}` : 'No',
          promotion: item?.ispromotion ? `${item.promotionto} - ${item.promotionfrom}` : 'No',
          noticeperiod: ` ${item.noticeperiodto} - ${item.noticeperiodfrom} `,
        }))
      );
      setIsDesignation(true);
    } catch (err) {
      setIsDesignation(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //for select group dropdowns
  const fetchGroup = async () => {
    setPageName(!pageName);
    try {
      let res_branch = await axios.get(SERVICE.DESIGNATIONGRP, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let grpall = [
        ...res_branch?.data?.desiggroup.map((d) => ({
          ...d,
          label: d.name,
          value: d.name,
        })),
      ];
      setdesignationgrp(grpall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [deletedesignation, setDeletedesignation] = useState({});

  //------------------------------------------------------

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };

  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };

  const [fileFormat, setFormat] = useState('xl');
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = fileFormat === 'xl' ? '.xlsx' : '.csv';

  const exportToExcel = (excelData, fileName) => {
    setPageName(!pageName);
    try {
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      // Check if the browser supports Blob and FileSaver
      if (!Blob || !FileSaver) {
        console.error('Blob or FileSaver not supported');
        return;
      }

      const data = new Blob([excelBuffer], { type: fileType });

      // Check if FileSaver.saveAs is available
      if (!FileSaver.saveAs) {
        console.error('FileSaver.saveAs is not available');
        return;
      }

      FileSaver.saveAs(data, fileName + fileExtension);
    } catch (error) {
      console.error('Error exporting to Excel', error);
    }
  };

  const formatData = (data) => {
    return data.map((item, index) => {
      return {
        Sno: index + 1,
        Group: item.group || '',
        Name: item.name || '',
        Description: item.description || '',
        isappraisal: item.isappraisal,
        isprobation: item.isprobation,
        ispromotion: item.ispromotion,
        'Notice Period': item.noticeperiod || '',
        Probation: item?.isprobation ? item.probation : 'No',
        Appraisal: item?.isappraisal ? item.appraisal : 'No',
        Promotion: item?.ispromotion ? item.promotion : 'No',
      };
    });
  };

  const handleExportXL = (isfilter) => {
    const dataToExport = isfilter === 'filtered' ? filteredData : items;

    if (!dataToExport || dataToExport.length === 0) {
      console.error('No data available to export');
      return;
    }

    exportToExcel(formatData(dataToExport), 'Designation');
    setIsFilterOpen(false);
  };

  //  PDF
  // pdf.....
  const columns = [
    { title: 'Group', field: 'group' },
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    { title: 'Notice Period', field: 'noticeperiod' },
    { title: 'Appraisal', field: 'appraisal' },
    { title: 'Promotion', field: 'promotion' },
    { title: 'Probation', field: 'probation' },
  ];

  const downloadPdf = (isfilter) => {
    const doc = new jsPDF();

    // Initialize serial number counter
    // Modify columns to include serial number column
    const columnsWithSerial = [
      { title: 'S.No', dataKey: 'serialNumber' }, // Serial number column
      ...columns.map((col) => ({ title: col.title, dataKey: col.field })),
    ];

    // Modify row data to include serial number
    const dataWithSerial =
      isfilter === 'filtered'
        ? filteredData.map((t, index) => ({
            ...t,
            serialNumber: index + 1,
          }))
        : items?.map((item, index) => ({
            ...item,
            serialNumber: index + 1,
          }));

    // Generate PDF
    doc.autoTable({
      theme: 'grid',
      columns: columnsWithSerial,
      body: dataWithSerial,
      styles: { fontSize: 5 },
    });

    doc.save('Designation.pdf');
  };

  // Print
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Designation',
    pageStyle: 'print',
  });

  //set function to get particular row

  //set function to get particular row
  const rowData = async (id, name) => {
    setPageName(!pageName);
    try {
      const [res, resuser, resdesg] = await Promise.all([
        axios.get(`${SERVICE.DESIGNATION_SINGLE}/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }),
        axios.post(SERVICE.USERDESIGCHECK, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          checkdesigtouser: String(name),
        }),
        axios.post(SERVICE.DESIGNATIONOVERALLCHECK, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          designation: String(name),
        }),
      ]);
      setDeletedesignation(res?.data?.sdesiggroup);
      if (resdesg?.data?.count > 0) {
        setPopupContentMalert(
          <span style={{ fontWeight: '700', color: '#777' }}>
            {`${name}`}
            <span style={{ fontWeight: 'bold', color: 'black' }}> was linked</span>
          </span>
        );
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      } else {
        handleClickOpen();
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  // Alert delete popup
  let designationid = deletedesignation._id;
  const delDesignation = async () => {
    setPageName(!pageName);
    try {
      await axios.delete(`${SERVICE.DESIGNATION_SINGLE}/${designationid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      await fetchDesignation();
      setPage(1);
      setSelectedRows([]);
      handleCloseMod();
      setPopupContent('Deleted Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const delDesignationcheckbox = async () => {
    setPageName(!pageName);
    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(`${SERVICE.DESIGNATION_SINGLE}/${item}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
      });

      // Wait for all delete requests to complete
      await Promise.all(deletePromises);

      handleCloseModcheckbox();
      setSelectedRows([]);
      setSelectAllChecked(false);
      setPage(1);

      await fetchDesignation();
      setPopupContent('Deleted Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //this is add database
  const sendRequest = async () => {
    setIsBtn(true);
    setPageName(!pageName);
    try {
      let designations = await axios.post(SERVICE.DESIGNATION_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },

        group: String(designation.group),
        name: String(designation.name),
        description: String(designation.description),
        noticeperiodfrom: String(designation.noticeperiodfrom),
        noticeperiodto: String(designation.noticeperiodto),
        ispromotion: Boolean(designation.ispromotion),
        isprobation: Boolean(designation.isprobation),
        isappraisal: Boolean(designation.isappraisal),
        probationto: String(designation.isprobation ? designation.probationto : ''),
        appraisalto: String(designation.isappraisal ? designation.appraisalto : ''),
        probationfrom: String(designation.isprobation ? designation.probationfrom : ''),
        appraisalfrom: String(designation.isappraisal ? designation.appraisalfrom : ''),
        promotionto: String(designation.ispromotion ? designation.promotionto : ''),
        promotionfrom: String(designation.ispromotion ? designation.promotionfrom : ''),
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });
      await fetchDesignation();
      setDesignation({
        ...designation,
        name: '',
        description: '',
        ispromotion: false,
        isappraisal: false,
        isprobation: false,
        noticeperiodto: '',
        appraisalto: '',
        promotionto: '',
        probationfrom: 'Month',
        probationto: '',
      });
      setPopupContent('Added Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
      setIsBtn(false);
    } catch (err) {
      setIsBtn(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isNameMatch = designations?.some(
      (item) =>
        item.name?.toLowerCase() === designation.name?.toLowerCase() &&
        // item.branch === designation.branch &&
        item.group === designation.group
    );
    if (designation.group === undefined || designation.group === '' || designation.group == 'Please Select Group') {
      setPopupContentMalert('Please select group');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (designation.name === undefined || designation.name === '') {
      setPopupContentMalert('Please enter name');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (designation.noticeperiodfrom === 'Month' && (designation.noticeperiodto === '' || designation.noticeperiodto == 0)) {
      setPopupContentMalert('Please Enter Notice period No.Of Months');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (designation.noticeperiodfrom === 'Day' && (designation.noticeperiodto === '' || designation.noticeperiodto == 0)) {
      setPopupContentMalert('Please Enter Notice period No.Of Days');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (designation?.isappraisal === true && designation.appraisalfrom === 'Month' && (designation.appraisalto === '' || designation.appraisalto == 0)) {
      setPopupContentMalert('Please Enter Appraisal No.Of Months');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (designation?.isprobation === true && designation.probationfrom === 'Month' && (designation.probationto === '' || designation.probationto == 0)) {
      setPopupContentMalert('Please Enter Probation No.Of Months');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (designation?.isprobation === true && designation.probationfrom === 'Year' && (designation.probationto === '' || designation.probationto == 0)) {
      setPopupContentMalert('Please Enter Probation No.Of Year');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (designation?.isappraisal === true && designation.appraisalfrom === 'Year' && (designation.appraisalto === '' || designation.appraisalto == 0)) {
      setPopupContentMalert('Please Enter Appraisal No.Of Year');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (designation?.ispromotion === true && designation.promotionfrom === 'Month' && (designation.promotionto === '' || designation.promotionto == 0)) {
      setPopupContentMalert('Please Enter Promotion No.Of Months');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (designation?.ispromotion === true && designation.promotionfrom === 'Year' && (designation.promotionto === '' || designation.promotionto == 0)) {
      setPopupContentMalert('Please Enter Promotion No.Of Year');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert('Data already exist!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      sendRequest();
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    setDesignation({
      // branch: "Please Select Branch",
      group: 'Please Select Group',
      name: '',
      description: '',
      ispromotion: false,
      isappraisal: false,
      isprobation: false,
      noticeperiodfrom: 'Month',
      noticeperiodto: '',
      appraisalfrom: 'Month',
      appraisalto: '',
      promotionfrom: 'Month',
      promotionto: '',
      probationfrom: 'Month',
      probationto: '',
    });
    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
  };

  const [getrowid, setRowGetid] = useState('');

  // Edit model
  const [isEditOpen, setIsEditOpen] = useState(false);
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setIsEditOpen(false);
  };

  const [oldBranchName, setOldBranchName] = useState('');

  //Edit functiona --->> getCode, sendEditRequest , editSubmit
  const [desinationid, setDesignationid] = useState({});
  //get single row to edit
  const getCode = async (e, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.DESIGNATION_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDesignationid({ ...res?.data?.sdesiggroup, probationfrom: res?.data?.sdesiggroup?.probationfrom ? res?.data?.sdesiggroup?.probationfrom : 'Month', probationto: res?.data?.sdesiggroup?.probationto ? res?.data?.sdesiggroup?.probationto : '' });
      setRowGetid(res?.data?.sdesiggroup);
      setOvProj(name);
      setOldBranchName(name);
      getOverallEditSection(name);
      handleClickOpenEdit();
    } catch (err) {
      setIsDesignation(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // get single row to view....
  const getviewCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.DESIGNATION_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDesignationid({ ...res?.data?.sdesiggroup, probationfrom: res?.data?.sdesiggroup?.probationfrom ? res?.data?.sdesiggroup?.probationfrom : 'Month', probationto: res?.data?.sdesiggroup?.probationto ? res?.data?.sdesiggroup?.probationto : '' });
      handleClickOpenview();
    } catch (err) {
      setIsDesignation(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // get single row to view....
  const getinfoCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.DESIGNATION_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDesignationid(res?.data?.sdesiggroup);
      handleClickOpeninfo();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

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

  // get all designation
  const fetchDesignationAll = async () => {
    setPageName(!pageName);
    try {
      let res_designation = await axios.get(SERVICE.DESIGNATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setdesignationsalledit(res_designation?.data?.designation.filter((item) => item._id != desinationid._id));
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const LoadingDialog = ({ open, onClose, progress }) => {
    const dialogStyles = {
      padding: '24px',
      textAlign: 'center',
    };

    const dialogTitleStyles = {
      fontWeight: 'bold',
      fontSize: '1.5rem',
      color: '#3f51b5', // Primary color
    };

    const dialogContentStyles = {
      padding: '16px',
    };

    const progressStyles = {
      marginTop: '16px',
      height: '10px',
      borderRadius: '5px',
    };

    const progressTextStyles = {
      marginTop: '8px',
      fontWeight: 'bold',
      color: '#4caf50', // Success color
    };

    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle style={dialogTitleStyles}>Updating...</DialogTitle>
        <DialogContent style={dialogContentStyles}>
          <Typography>Please wait while we update the employee names across all pages.</Typography>
          <LinearProgress style={progressStyles} variant="determinate" value={progress} />
          <Typography style={progressTextStyles}>{progress}%</Typography>
        </DialogContent>
        <DialogActions></DialogActions>
      </Dialog>
    );
  };

  let totalLoaded = 0;
  let totalSize = 0;

  const [uploadProgress, setUploadProgress] = useState(0);
  const [openPopupUpload, setOpenPopupUpload] = useState(false);

  const handleUploadProgress = (progressEvent) => {
    if (progressEvent.event.lengthComputable) {
      updateTotalProgress(progressEvent.loaded, progressEvent.total);
    } else {
      console.log('Unable to compute progress information.');
    }
  };

  const updateTotalProgress = (loaded, size) => {
    totalLoaded += loaded;
    totalSize += size;
    if (totalSize > 0) {
      const percentCompleted = Math.round((totalLoaded * 100) / totalSize);
      setUploadProgress(percentCompleted);
    } else {
      console.log('Total size is zero, unable to compute progress.');
    }
  };

  //Desigantion updateby edit page...
  let updateby = desinationid?.updatedby;
  let desigid = getrowid?._id;
  let addedby = desinationid?.addedby;
  //editing the single data
  const sendEditRequest = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.put(`${SERVICE.DESIGNATION_SINGLE}/${desigid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        // branch: String(desinationid.branch),
        group: String(desinationid.group),
        name: String(desinationid.name),
        description: String(desinationid.description),
        noticeperiodfrom: String(desinationid.noticeperiodfrom),
        noticeperiodto: String(desinationid.noticeperiodto),
        ispromotion: Boolean(desinationid.ispromotion),
        isappraisal: Boolean(desinationid.isappraisal),
        isprobation: Boolean(desinationid.isprobation),
        probationto: String(desinationid.isprobation ? desinationid.probationto : ''),
        appraisalto: String(desinationid.isappraisal ? desinationid.appraisalto : ''),
        probationfrom: String(desinationid.isprobation ? desinationid.probationfrom : ''),
        appraisalfrom: String(desinationid.isappraisal ? desinationid.appraisalfrom : ''),
        promotionto: String(desinationid.ispromotion ? desinationid.promotionto : ''),
        promotionfrom: String(desinationid.ispromotion ? desinationid.promotionfrom : ''),
        updatedby: [
          ...updateby,
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });

      const performUploads = async () => {
        setPageName(!pageName);
        try {
          // Check and perform employee name update
          if (desinationid.name?.toLowerCase() !== oldBranchName?.toLowerCase()) {
            await axios.put(
              `${SERVICE.DESIGNATIONOVERALLUPDATE}`,
              {
                oldname: oldBranchName,
                newname: desinationid.name,
              },
              {
                headers: {
                  Authorization: `Bearer ${auth.APIToken}`,
                },
                onUploadProgress: handleUploadProgress,
              }
            );
          }
        } catch (error) {
          console.error('Error during upload:', error);
        } finally {
          setOpenPopupUpload(false); // Close the popup after all uploads are completed
          console.log('ended');
        }
      };

      await performUploads();

      await fetchDesignation();
      await fetchDesignationAll();
      // setDesignation(res.data);
      await getOverallEditSectionUpdate();
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
    fetchDesignationAll();
    const isNameMatch = designationsalledit?.some(
      (item) =>
        item.name?.toLowerCase() === desinationid.name?.toLowerCase() &&
        // item.branch === desinationid.branch &&
        item.group === desinationid.group
    );
    if (desinationid.group === '' || desinationid.group == 'Please Select Group') {
      setPopupContentMalert('Please select Group');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (desinationid.name === '') {
      setPopupContentMalert('Please Enter Name');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (desinationid.noticeperiodfrom === 'Month' && (desinationid.noticeperiodto === '' || desinationid.noticeperiodto == 0)) {
      setPopupContentMalert('Please Enter Notice period No.Of Months');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (desinationid.noticeperiodfrom === 'Day' && (desinationid.noticeperiodto === '' || desinationid.noticeperiodto == 0)) {
      setPopupContentMalert('Please Enter Notice period No.Of Days');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (desinationid?.isprobation === true && desinationid.probationfrom === '') {
      setPopupContentMalert('Please Select Probation Month/Year');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (desinationid?.isprobation === true && desinationid.probationfrom === 'Month' && (desinationid.probationto === '' || desinationid.probationto == 0)) {
      setPopupContentMalert('Please Enter Probation No.Of Months');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (desinationid?.isprobation === true && desinationid.probationfrom === 'Year' && (desinationid.probationto === '' || desinationid.probationto == 0)) {
      setPopupContentMalert('Please Enter Probation No.Of Year');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (desinationid?.isappraisal === true && desinationid.appraisalfrom === '') {
      setPopupContentMalert('Please Select Appraisal Month/Year');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (desinationid?.isappraisal === true && desinationid.appraisalfrom === 'Month' && (desinationid.appraisalto === '' || desinationid.appraisalto == 0)) {
      setPopupContentMalert('Please Enter Appraisal No.Of Months');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (desinationid?.isappraisal === true && desinationid.appraisalfrom === 'Year' && (desinationid.appraisalto === '' || desinationid.appraisalto == 0)) {
      setPopupContentMalert('Please Enter Appraisal No.Of Year');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (desinationid?.ispromotion === true && desinationid.promotionfrom === '') {
      setPopupContentMalert('Please Select Promotion Month/Year');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (desinationid?.ispromotion === true && desinationid.promotionfrom === 'Month' && (desinationid.promotionto === '' || desinationid.promotionto == 0)) {
      setPopupContentMalert('Please Enter Promotion No.Of Months');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (desinationid?.ispromotion === true && desinationid.promotionfrom === 'Year' && (desinationid.promotionto === '' || desinationid.promotionto == 0)) {
      setPopupContentMalert('Please Enter Promotion No.Of Year');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert('Data already exist!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (desinationid.name != ovProj && ovProjcount > 0) {
      setShowAlertpop(getOverAllCount);
      handleClickOpenerrpop();
    } else {
      sendEditRequest(e);
    }
  };

  //overall edit section for all pages
  const getOverallEditSection = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.DESIGNATIONOVERALLCHECK, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        designation: e,
      });
      setOvProjcount(res?.data?.count);
      // setGetOverallCount(`The ${e} is linked
      //   whether you want to do changes ..??`);
      setGetOverallCount(
        <span style={{ fontWeight: '700', color: '#777' }}>
          <span style={{ fontWeight: 'bold', color: 'black' }}> The </span>
          {`${e}`}
          <span style={{ fontWeight: 'bold', color: 'black' }}> is linked whether you want to do changes ..??</span>
        </span>
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //overall edit section for all pages
  const getOverallEditSectionUpdate = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.OVERALL_DESIGNATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        oldname: ovProj,
      });
      sendEditRequestOverall(res?.data?.users, res?.data?.usersdesignationlog);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const sendEditRequestOverall = async (user, designationlog) => {
    let mappedData = designationlog.map((data, i) => {
      data.designationlog.map((data2, ii) => {
        if (data2.designation === ovProj) {
          data2.designation = desinationid.name;
        }
      });
      return data;
    });

    setPageName(!pageName);
    try {
      if (user.length > 0) {
        let answ = user.map((d, i) => {
          let res = axios.put(`${SERVICE.USER_SINGLE_PWD}/${d._id}`, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            designation: String(desinationid.name),
          });
        });
      }
      if (designationlog.length > 0) {
        let answ = mappedData.map((d, i) => {
          let res = axios.put(`${SERVICE.USER_SINGLE_PWD}/${d._id}`, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },

            designationlog: d.designationlog,
          });
        });
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  useEffect(() => {
    fetchGroup();
  }, [designations, desinationid]);

  useEffect(() => {
    fetchDesignation();
    fetchDesignationAll();
  }, []);

  useEffect(() => {
    fetchDesignationAll();
  }, [desinationid, isEditOpen]);

  //table entries ..,.
  const [items, setItems] = useState([]);

  const addSerialNumber = () => {
    const itemsWithSerialNumber = designations?.map((item, index) => ({
      ...item,
      serialNumber: index + 1,
      ispromotion: item?.ispromotion ? 'Yes' : 'No',
      isprobation: item?.isprobation ? 'Yes' : 'No',
      probation: item?.isprobation ? `${item.probationto} - ${item.probationfrom}` : 'No',
      isappraisal: item?.isappraisal ? 'Yes' : 'No',
      appraisal: item?.isappraisal ? `${item.appraisalto} - ${item.appraisalfrom}` : 'No',
      promotion: item?.ispromotion ? `${item.promotionto} - ${item.promotionfrom}` : 'No',
      noticeperiod: ` ${item.noticeperiodto} - ${item.noticeperiodfrom} `,
    }));
    setItems(itemsWithSerialNumber);
  };

  useEffect(() => {
    addSerialNumber();
  }, [designations]);

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
    // { field: "branch", headerName: "Branch Name", flex: 0, width: 100, hide: !columnVisibility.branch, headerClassName: "bold-header" },
    {
      field: 'group',
      headerName: 'Group Name',
      flex: 0,
      width: 150,
      hide: !columnVisibility.group,
      headerClassName: 'bold-header',
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 0,
      width: 150,
      hide: !columnVisibility.name,
      headerClassName: 'bold-header',
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 0,
      width: 150,
      hide: !columnVisibility.description,
      headerClassName: 'bold-header',
    },
    {
      field: 'noticeperiod',
      headerName: 'Notice Period',
      flex: 0,
      width: 120,
      hide: !columnVisibility.noticeperiod,
      headerClassName: 'bold-header',
    },
    {
      field: 'appraisal',
      headerName: 'Appraisal',
      flex: 0,
      width: 120,
      hide: !columnVisibility.appraisal,
      headerClassName: 'bold-header',
    },
    {
      field: 'promotion',
      headerName: 'Promotion',
      flex: 0,
      width: 120,
      hide: !columnVisibility.promotion,
      headerClassName: 'bold-header',
    },
    {
      field: 'probation',
      headerName: 'Probation',
      flex: 0,
      width: 120,
      hide: !columnVisibility.probation,
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
      renderCell: (params) => (
        <Grid sx={{ display: 'flex' }}>
          {isUserRoleCompare?.includes('edesignation') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getCode(params.row.id, params.row.name);
              }}
            >
              <EditOutlinedIcon style={{ fontsize: 'large' }} sx={buttonStyles.buttonedit} />
            </Button>
          )}
          {isUserRoleCompare?.includes('ddesignation') && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.row.id, params.row.name);
              }}
            >
              <DeleteOutlineOutlinedIcon style={{ fontsize: 'large' }} sx={buttonStyles.buttondelete} />
            </Button>
          )}
          {isUserRoleCompare?.includes('vdesignation') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getviewCode(params.row.id);
              }}
            >
              <VisibilityOutlinedIcon style={{ fontsize: 'large' }} sx={buttonStyles.buttonview} />
            </Button>
          )}
          {isUserRoleCompare?.includes('idesignation') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getinfoCode(params.row.id);
              }}
            >
              <InfoOutlinedIcon style={{ fontsize: 'large' }} sx={buttonStyles.buttoninfo} />
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
      group: item.group,
      name: item.name,
      ispromotion: item?.ispromotion,
      isappraisal: item?.isappraisal,
      isprobation: item?.isprobation,
      description: item.description,
      noticeperiod: item.noticeperiod,
      appraisal: item.appraisal,
      probation: item.probation,
      promotion: item.promotion,
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
  const handleChange = (e) => {
    const selectedText = e.value;
    setDesignation({ ...designation, noticeperiodfrom: selectedText });
  };
  const handleChangeEdit = (e) => {
    const selectedText = e.value;
    setDesignationid({
      ...desinationid,
      noticeperiodfrom: selectedText,
    });
  };
  const estimationOption = [
    { label: 'Month', value: 'Month' },
    { label: 'Day', value: 'Day' },
  ];

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
      <Headtitle title={'DESIGNATION'} />
      <PageHeading title="Designation" modulename="Human Resources" submodulename="HR" mainpagename="HR Setup" subpagename="Designation" subsubpagename="" />
      {isUserRoleCompare?.includes('adesignation') && (
        <>
          <Box sx={userStyle.selectcontainer}>
            <Typography sx={userStyle.SubHeaderText}>Add Designation</Typography>
            <br />
            <br />
            <Grid container spacing={2}>
              <Grid item md={3} xs={12} sm={6}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Group <b style={{ color: 'red' }}>*</b>
                  </Typography>

                  <Selects
                    options={designationgrp}
                    styles={colourStyles}
                    placeholder={'please select'}
                    value={{
                      label: designation.group,
                      value: designation.group,
                    }}
                    onChange={(e) => {
                      setDesignation({ ...designation, group: e.value });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Name <b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="text"
                    placeholder="Please Enter Name"
                    value={designation.name}
                    onChange={(e) => {
                      setDesignation({ ...designation, name: e.target.value });
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item md={3} xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <Typography>Description</Typography>
                  <TextareaAutosize
                    aria-label="maximum height"
                    minRows={5}
                    style={{ width: '100%' }}
                    value={designation.description}
                    onChange={(e) => {
                      setDesignation({
                        ...designation,
                        description: e.target.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={6}>
                <Typography>
                  <b>Notice Period</b>
                </Typography>
                <Grid container spacing={1}>
                  <Grid item md={6} xs={12} sm={12}>
                    <Typography>
                      Estimation<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <FormControl fullWidth>
                      <Selects
                        options={estimationOption}
                        styles={colourStyles}
                        value={{
                          label: designation.noticeperiodfrom,
                          value: designation.noticeperiodfrom,
                        }}
                        onChange={handleChange}
                      />
                    </FormControl>
                  </Grid>
                  {designation.noticeperiodfrom === 'Month' && (
                    <Grid item md={6} xs={12} sm={12}>
                      <Typography>
                        No.Of Months<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <FormControl fullWidth size="small">
                        <OutlinedInput
                          id="component-outlined"
                          type="number"
                          placeholder="Please Enter No.of Month"
                          sx={userStyle.input}
                          value={designation.noticeperiodto}
                          onChange={(e) => {
                            setDesignation({
                              ...designation,
                              noticeperiodto: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                  )}
                  {designation.noticeperiodfrom === 'Day' && (
                    <Grid item md={6} xs={12} sm={12}>
                      <Typography>
                        No.Of Days<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <FormControl fullWidth size="small">
                        <OutlinedInput
                          id="component-outlined"
                          type="number"
                          placeholder="Please Enter No.of Days"
                          sx={userStyle.input}
                          value={designation.noticeperiodto}
                          onChange={(e) => {
                            setDesignation({
                              ...designation,
                              noticeperiodto: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Grid
                item
                md={3}
                xs={12}
                sm={6}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignContent: 'center',
                  justifyContent: 'center',
                  marginTop: '15px',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(designation.isappraisal)}
                      onClick={(e) => {
                        setDesignation({
                          ...designation,
                          isappraisal: e.target.checked,
                        });
                      }}
                      sx={{ '& .MuiSvgIcon-root': { fontSize: '33px' } }}
                    />
                  }
                  label="Is Appraisal"
                />
              </Grid>
              {designation.isappraisal && (
                <Grid item md={3} xs={12} sm={6}>
                  <Typography>
                    <b>Appraisal</b>
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item md={6} xs={12} sm={12}>
                      <Typography>
                        Estimation<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <FormControl fullWidth>
                        <Selects
                          options={[
                            { label: 'Month', value: 'Month' },
                            { label: 'Year', value: 'Year' },
                          ]}
                          styles={colourStyles}
                          value={{
                            label: designation.appraisalfrom,
                            value: designation.appraisalfrom,
                          }}
                          onChange={(e) => {
                            setDesignation({ ...designation, appraisalfrom: e.value });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    {designation.appraisalfrom === 'Month' && (
                      <Grid item md={6} xs={12} sm={12}>
                        <Typography>
                          No.Of Months<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <FormControl fullWidth size="small">
                          <OutlinedInput
                            id="component-outlined"
                            type="number"
                            placeholder="Please Enter No.of Month"
                            sx={userStyle.input}
                            value={designation.appraisalto}
                            onChange={(e) => {
                              setDesignation({
                                ...designation,
                                appraisalto: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                    )}
                    {designation.appraisalfrom === 'Year' && (
                      <Grid item md={6} xs={12} sm={12}>
                        <Typography>
                          No.Of Year<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <FormControl fullWidth size="small">
                          <OutlinedInput
                            id="component-outlined"
                            type="number"
                            placeholder="Please Enter No.of Year"
                            sx={userStyle.input}
                            value={designation.appraisalto}
                            onChange={(e) => {
                              setDesignation({
                                ...designation,
                                appraisalto: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              )}
              <Grid
                item
                md={3}
                xs={12}
                sm={6}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignContent: 'center',
                  justifyContent: 'center',
                  marginTop: '15px',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(designation.ispromotion)}
                      onClick={(e) => {
                        setDesignation({
                          ...designation,
                          ispromotion: e.target.checked,
                        });
                      }}
                      sx={{ '& .MuiSvgIcon-root': { fontSize: '33px' } }}
                    />
                  }
                  label="Is Promotion"
                />
              </Grid>
              {designation.ispromotion && (
                <Grid item md={3} xs={12} sm={6}>
                  <Typography>
                    <b>Promotion</b>
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item md={6} xs={12} sm={12}>
                      <Typography>
                        Estimation<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <FormControl fullWidth>
                        <Selects
                          options={[
                            { label: 'Month', value: 'Month' },
                            { label: 'Year', value: 'Year' },
                          ]}
                          styles={colourStyles}
                          value={{
                            label: designation.promotionfrom,
                            value: designation.promotionfrom,
                          }}
                          onChange={(e) => {
                            setDesignation({
                              ...designation,
                              promotionfrom: e.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    {designation.promotionfrom === 'Month' && (
                      <Grid item md={6} xs={12} sm={12}>
                        <Typography>
                          No.Of Months<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <FormControl fullWidth size="small">
                          <OutlinedInput
                            id="component-outlined"
                            type="number"
                            placeholder="Please Enter No.of Month"
                            sx={userStyle.input}
                            value={designation.promotionto}
                            onChange={(e) => {
                              setDesignation({
                                ...designation,
                                promotionto: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                    )}
                    {designation.promotionfrom === 'Year' && (
                      <Grid item md={6} xs={12} sm={12}>
                        <Typography>
                          No.Of Year<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <FormControl fullWidth size="small">
                          <OutlinedInput
                            id="component-outlined"
                            type="number"
                            placeholder="Please Enter No.of Year"
                            sx={userStyle.input}
                            value={designation.promotionto}
                            onChange={(e) => {
                              setDesignation({
                                ...designation,
                                promotionto: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              )}
              <Grid
                item
                md={3}
                xs={12}
                sm={6}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignContent: 'center',
                  justifyContent: 'center',
                  marginTop: '15px',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(designation.isprobation)}
                      onClick={(e) => {
                        setDesignation({
                          ...designation,
                          isprobation: e.target.checked,
                        });
                      }}
                      sx={{ '& .MuiSvgIcon-root': { fontSize: '33px' } }}
                    />
                  }
                  label="Is Probation"
                />
              </Grid>
              {designation.isprobation && (
                <Grid item md={3} xs={12} sm={6}>
                  <Typography>
                    <b>Probation</b>
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item md={6} xs={12} sm={12}>
                      <Typography>
                        Estimation<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <FormControl fullWidth>
                        <Selects
                          options={[
                            { label: 'Month', value: 'Month' },
                            { label: 'Year', value: 'Year' },
                          ]}
                          styles={colourStyles}
                          value={{
                            label: designation.probationfrom,
                            value: designation.probationfrom,
                          }}
                          onChange={(e) => {
                            setDesignation({ ...designation, probationfrom: e.value });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    {designation.probationfrom === 'Month' && (
                      <Grid item md={6} xs={12} sm={12}>
                        <Typography>
                          No.Of Months<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <FormControl fullWidth size="small">
                          <OutlinedInput
                            id="component-outlined"
                            type="number"
                            placeholder="Please Enter No.of Month"
                            sx={userStyle.input}
                            value={designation.probationto}
                            onChange={(e) => {
                              setDesignation({
                                ...designation,
                                probationto: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                    )}
                    {designation.probationfrom === 'Year' && (
                      <Grid item md={6} xs={12} sm={12}>
                        <Typography>
                          No.Of Year<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <FormControl fullWidth size="small">
                          <OutlinedInput
                            id="component-outlined"
                            type="number"
                            placeholder="Please Enter No.of Year"
                            sx={userStyle.input}
                            value={designation.probationto}
                            onChange={(e) => {
                              setDesignation({
                                ...designation,
                                probationto: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              )}
              <Grid item md={3} xs={12} sm={6}>
                <Typography>&nbsp;</Typography>
                <Typography>&nbsp;</Typography>
                <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isBtn} sx={buttonStyles.buttonsubmit}>
                  Submit
                </Button>
                &nbsp;
                <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                  Clear
                </Button>
              </Grid>
            </Grid>
            <br />
          </Box>
          <br />
        </>
      )}

      <Box>
        {/* ALERT DIALOG */}
        <Dialog open={isEditOpen} onClose={handleCloseModEdit} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="md">
          <Box sx={userStyle.container}>
            <>
              <Typography sx={userStyle.HeaderText}>Edit Designation</Typography>
              <br />
              <Grid container spacing={2}>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      Group <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      options={designationgrp}
                      styles={colourStyles}
                      placeholder={'please select'}
                      value={{
                        label: desinationid.group,
                        value: desinationid.group,
                      }}
                      onChange={(e) => {
                        setDesignationid({ ...desinationid, group: e.value });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Name <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Please Enter Name"
                      value={desinationid.name}
                      onChange={(e) => {
                        setDesignationid({
                          ...desinationid,
                          name: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Description</Typography>
                    <TextareaAutosize
                      aria-label="maximum height"
                      minRows={5}
                      style={{ width: '100%' }}
                      value={desinationid.description}
                      onChange={(e) => {
                        setDesignationid({
                          ...desinationid,
                          description: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <Typography>
                    <b>Notice Period</b>
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item md={6} xs={12} sm={12}>
                      <Typography>
                        Estimation<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <FormControl fullWidth>
                        <Selects
                          options={estimationOption}
                          styles={colourStyles}
                          value={{
                            label: desinationid.noticeperiodfrom,
                            value: desinationid.noticeperiodfrom,
                          }}
                          onChange={handleChangeEdit}
                        />
                      </FormControl>
                    </Grid>
                    {desinationid.noticeperiodfrom === 'Month' && (
                      <Grid item md={6} xs={12} sm={12}>
                        <Typography>
                          No.Of Months<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <FormControl fullWidth size="small">
                          <OutlinedInput
                            id="component-outlined"
                            type="number"
                            placeholder="Please Enter No.of Months"
                            sx={userStyle.input}
                            value={desinationid.noticeperiodto}
                            onChange={(e) => {
                              setDesignationid({
                                ...desinationid,
                                noticeperiodto: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                    )}
                    {desinationid.noticeperiodfrom === 'Day' && (
                      <Grid item md={6} xs={12} sm={12}>
                        <Typography>
                          No.Of Days<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <FormControl fullWidth size="small">
                          <OutlinedInput
                            id="component-outlined"
                            type="number"
                            placeholder="Please Enter No.of Days"
                            sx={userStyle.input}
                            value={desinationid.noticeperiodto}
                            onChange={(e) => {
                              setDesignationid({
                                ...desinationid,
                                noticeperiodto: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
                <Grid
                  item
                  md={3}
                  xs={12}
                  sm={6}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignContent: 'center',
                    justifyContent: 'center',
                    marginTop: '15px',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(desinationid.isappraisal)}
                        onClick={(e) => {
                          setDesignationid({
                            ...desinationid,
                            isappraisal: e.target.checked,
                          });
                        }}
                        sx={{ '& .MuiSvgIcon-root': { fontSize: '33px' } }}
                      />
                    }
                    label="Is Appraisal"
                  />
                </Grid>
                {desinationid.isappraisal && (
                  <Grid item md={4} xs={12} sm={12}>
                    <Typography>
                      <b>Appraisal</b>
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item md={6} xs={12} sm={12}>
                        <Typography>
                          Estimation<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <FormControl fullWidth>
                          <Selects
                            options={[
                              { label: 'Month', value: 'Month' },
                              { label: 'Year', value: 'Year' },
                            ]}
                            styles={colourStyles}
                            value={{
                              label: desinationid.appraisalfrom,
                              value: desinationid.appraisalfrom,
                            }}
                            onChange={(e) => {
                              setDesignationid({ ...desinationid, appraisalfrom: e.value });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      {desinationid.appraisalfrom === 'Month' && (
                        <Grid item md={6} xs={12} sm={12}>
                          <Typography>
                            No.Of Months<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <FormControl fullWidth size="small">
                            <OutlinedInput
                              id="component-outlined"
                              type="number"
                              placeholder="Please Enter No.of Month"
                              sx={userStyle.input}
                              value={desinationid.appraisalto}
                              onChange={(e) => {
                                setDesignationid({
                                  ...desinationid,
                                  appraisalto: e.target.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                      )}
                      {desinationid.appraisalfrom === 'Year' && (
                        <Grid item md={6} xs={12} sm={12}>
                          <Typography>
                            No.Of Year<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <FormControl fullWidth size="small">
                            <OutlinedInput
                              id="component-outlined"
                              type="number"
                              placeholder="Please Enter No.of Year"
                              sx={userStyle.input}
                              value={desinationid.appraisalto}
                              onChange={(e) => {
                                setDesignationid({
                                  ...desinationid,
                                  appraisalto: e.target.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                )}
                <Grid
                  item
                  md={3}
                  xs={12}
                  sm={6}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignContent: 'center',
                    justifyContent: 'center',
                    marginTop: '15px',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(desinationid.ispromotion)}
                        onClick={(e) => {
                          setDesignationid({
                            ...desinationid,
                            ispromotion: e.target.checked,
                          });
                        }}
                        sx={{ '& .MuiSvgIcon-root': { fontSize: '33px' } }}
                      />
                    }
                    label="Is Promotion"
                  />
                </Grid>
                {desinationid.ispromotion && (
                  <Grid item md={4} xs={12} sm={12}>
                    <Typography>
                      <b>Promotion</b>
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item md={6} xs={12} sm={12}>
                        <Typography>
                          Estimation<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <FormControl fullWidth>
                          <Selects
                            options={[
                              { label: 'Month', value: 'Month' },
                              { label: 'Year', value: 'Year' },
                            ]}
                            styles={colourStyles}
                            value={{
                              label: desinationid.promotionfrom,
                              value: desinationid.promotionfrom,
                            }}
                            onChange={(e) => {
                              setDesignationid({
                                ...desinationid,
                                promotionfrom: e.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      {desinationid.promotionfrom === 'Month' && (
                        <Grid item md={6} xs={12} sm={12}>
                          <Typography>
                            No.Of Months<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <FormControl fullWidth size="small">
                            <OutlinedInput
                              id="component-outlined"
                              type="number"
                              placeholder="Please Enter No.of Month"
                              sx={userStyle.input}
                              value={desinationid.promotionto}
                              onChange={(e) => {
                                setDesignationid({
                                  ...desinationid,
                                  promotionto: e.target.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                      )}
                      {desinationid.promotionfrom === 'Year' && (
                        <Grid item md={6} xs={12} sm={12}>
                          <Typography>
                            No.Of Year<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <FormControl fullWidth size="small">
                            <OutlinedInput
                              id="component-outlined"
                              type="number"
                              placeholder="Please Enter No.of Year"
                              sx={userStyle.input}
                              value={desinationid.promotionto}
                              onChange={(e) => {
                                setDesignationid({
                                  ...desinationid,
                                  promotionto: e.target.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                )}
                <Grid
                  item
                  md={3}
                  xs={12}
                  sm={6}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignContent: 'center',
                    justifyContent: 'center',
                    marginTop: '15px',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(desinationid.isprobation)}
                        onClick={(e) => {
                          setDesignationid({
                            ...desinationid,
                            isprobation: e.target.checked,
                          });
                        }}
                        sx={{ '& .MuiSvgIcon-root': { fontSize: '33px' } }}
                      />
                    }
                    label="Is Probation"
                  />
                </Grid>
                {desinationid.isprobation && (
                  <Grid item md={4} xs={12} sm={12}>
                    <Typography>
                      <b>Probation</b>
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item md={6} xs={12} sm={12}>
                        <Typography>
                          Estimation<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <FormControl fullWidth>
                          <Selects
                            options={[
                              { label: 'Month', value: 'Month' },
                              { label: 'Year', value: 'Year' },
                            ]}
                            styles={colourStyles}
                            value={{
                              label: desinationid.probationfrom,
                              value: desinationid.probationfrom,
                            }}
                            onChange={(e) => {
                              setDesignationid({ ...desinationid, probationfrom: e.value });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      {desinationid.probationfrom === 'Month' && (
                        <Grid item md={6} xs={12} sm={12}>
                          <Typography>
                            No.Of Months<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <FormControl fullWidth size="small">
                            <OutlinedInput
                              id="component-outlined"
                              type="number"
                              placeholder="Please Enter No.of Month"
                              sx={userStyle.input}
                              value={desinationid.probationto}
                              onChange={(e) => {
                                setDesignationid({
                                  ...desinationid,
                                  probationto: e.target.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                      )}
                      {desinationid.probationfrom === 'Year' && (
                        <Grid item md={6} xs={12} sm={12}>
                          <Typography>
                            No.Of Year<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <FormControl fullWidth size="small">
                            <OutlinedInput
                              id="component-outlined"
                              type="number"
                              placeholder="Please Enter No.of Year"
                              sx={userStyle.input}
                              value={desinationid.probationto}
                              onChange={(e) => {
                                setDesignationid({
                                  ...desinationid,
                                  probationto: e.target.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                )}
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={4} xs={4} sm={4}>
                  <Button variant="contained" onClick={editSubmit} sx={buttonStyles.buttonsubmit}>
                    Update
                  </Button>
                </Grid>
                <Grid item md={4} xs={4} sm={4}>
                  <Button sx={buttonStyles.btncancel} onClick={handleCloseModEdit}>
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>
      <br />

      {/* header text */}
      {/* content start */}
      {isUserRoleCompare?.includes('ldesignation') && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Designation List</Typography>
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
                  {isUserRoleCompare?.includes('exceldesignation') && (
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
                  {isUserRoleCompare?.includes('csvdesignation') && (
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
                  {isUserRoleCompare?.includes('printdesignation') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('pdfdesignation') && (
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
                  {isUserRoleCompare?.includes('imagedesignation') && (
                    <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}>
                      {' '}
                      <ImageIcon sx={{ fontSize: '15px' }} /> &ensp;Image&ensp;{' '}
                    </Button>
                  )}
                </Box>
              </Grid>
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
            {isUserRoleCompare?.includes('bddesignation') && (
              <Button variant="contained" color="error" onClick={handleClickOpenalert} sx={buttonStyles.buttonbulkdelete}>
                Bulk Delete
              </Button>
            )}
            <br />
            <br />
            {!isDesignation ? (
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

      {/* content end */}
      {/* ALERT DIALOG */}
      <Dialog open={isDeleteOpen} onClose={handleCloseMod} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '80px', color: 'orange' }} />
          <Typography variant="h5" sx={{ color: 'red', textAlign: 'center' }}>
            Are you sure?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMod} variant="outlined">
            Cancel
          </Button>
          <Button autoFocus variant="contained" color="error" onClick={(e) => delDesignation(designationid)}>
            {' '}
            OK{' '}
          </Button>
        </DialogActions>
      </Dialog>

      {/* view model */}
      <Dialog open={openview} onClose={handleClickOpenview} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <Box sx={{ width: '550px', padding: '20px 50px' }}>
          <>
            <Typography sx={userStyle.HeaderText}> View Designation</Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Group</Typography>
                  <Typography>{desinationid.group}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Name</Typography>
                  <Typography>{desinationid.name}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Description</Typography>
                  <Typography>{desinationid.description}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Notice Period</Typography>
                  <Typography>
                    {desinationid.noticeperiodto} - {desinationid.noticeperiodfrom}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Appraisal</Typography>
                  <Typography>{desinationid?.isappraisal ? `${desinationid.appraisalto} - ${desinationid.appraisalfrom}` : 'No'}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Promotion</Typography>
                  <Typography>{desinationid?.ispromotion ? `${desinationid.promotionto} - ${desinationid.promotionfrom}` : 'No'}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Probation</Typography>
                  <Typography>{desinationid?.isprobation ? `${desinationid.probationto} - ${desinationid.probationfrom}` : 'No'}</Typography>
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br /> <br />
            <Grid container spacing={2}>
              <Button variant="contained" color="primary" onClick={handleCloseview} sx={buttonStyles.btncancel}>
                {' '}
                Back{' '}
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>

      {/* this is info view details */}

      <Dialog open={openInfo} onClose={handleCloseinfo} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="lg">
        <Box sx={{ width: '550px', padding: '20px 50px' }}>
          <>
            <Typography sx={userStyle.HeaderText}> Designation Info</Typography>
            <br />
            <br />
            <Grid container spacing={2}>
              <Grid item md={12} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">addedby</Typography>
                  <br />
                  <Table>
                    <TableHead>
                      <StyledTableCell sx={{ padding: '5px 10px !important' }}>{'SNO'}.</StyledTableCell>
                      <StyledTableCell sx={{ padding: '5px 10px !important' }}> {'UserName'}</StyledTableCell>
                      <StyledTableCell sx={{ padding: '5px 10px !important' }}> {'Date'}</StyledTableCell>
                    </TableHead>
                    <TableBody>
                      {addedby?.map((item, i) => (
                        <StyledTableRow>
                          <StyledTableCell sx={{ padding: '5px 10px !important' }}>{i + 1}.</StyledTableCell>
                          <StyledTableCell sx={{ padding: '5px 10px !important' }}> {item.name}</StyledTableCell>
                          <StyledTableCell sx={{ padding: '5px 10px !important' }}> {moment(item.date).format('DD-MM-YYYY hh:mm:ss a')}</StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </FormControl>
              </Grid>
              <br />
              <Grid item md={12} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Updated by</Typography>
                  <br />
                  <Table>
                    <TableHead>
                      <StyledTableCell sx={{ padding: '5px 10px !important' }}>{'SNO'}.</StyledTableCell>
                      <StyledTableCell sx={{ padding: '5px 10px !important' }}> {'UserName'}</StyledTableCell>
                      <StyledTableCell sx={{ padding: '5px 10px !important' }}> {'Date'}</StyledTableCell>
                    </TableHead>
                    <TableBody>
                      {updateby?.map((item, i) => (
                        <StyledTableRow>
                          <StyledTableCell sx={{ padding: '5px 10px !important' }}>{i + 1}.</StyledTableCell>
                          <StyledTableCell sx={{ padding: '5px 10px !important' }}> {item.name}</StyledTableCell>
                          <StyledTableCell sx={{ padding: '5px 10px !important' }}> {moment(item.date).format('DD-MM-YYYY hh:mm:ss a')}</StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br />
            <br />
            <Grid container spacing={2}>
              <Button variant="contained" onClick={handleCloseinfo} sx={buttonStyles.btncancel}>
                {' '}
                Back{' '}
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>
      {/* ALERT DIALOG  for the Overall delete*/}
      <Box>
        <Dialog open={isErrorOpenpop} onClose={handleCloseerrpop} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent>
            <DialogContentText
              id="alert-dialog-description"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px',
                width: '350px',
              }}
            >
              <InfoOutlinedIcon style={{ fontSize: '3.5rem', color: 'teal' }} /> <Typography sx={{ fontSize: '1.4rem', fontWeight: '600', color: 'black', textAlign: 'center' }}>{showAlertpop}</Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              sx={buttonStyles.buttonsubmit}
              onClick={() => {
                sendEditRequest();
                handleCloseerrpop();
              }}
            >
              ok
            </Button>
            <Button sx={buttonStyles.btncancel} onClick={handleCloseerrpop}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Box>
        <Dialog open={isDeleteOpencheckbox} onClose={handleCloseModcheckbox} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '80px', color: 'orange' }} />
            {selectedRowsCount > 0 ? (
              <Typography variant="h5" sx={{ color: 'red', textAlign: 'center' }}>
                Some of the Data's are Linked in other pages. Do You want to Delete the Remaining.?
              </Typography>
            ) : (
              <Typography variant="h5" sx={{ color: 'red', textAlign: 'center' }}>
                This Data is Linked in Some pages
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            {selectedRowsCount > 0 ? (
              <>
                <Button onClick={handleCloseModcheckbox} sx={buttonStyles.btncancel}>
                  Cancel
                </Button>
                <Button sx={buttonStyles.buttonsubmit} onClick={(e) => delDesignationcheckbox(e)}>
                  {' '}
                  OK{' '}
                </Button>
              </>
            ) : (
              <Button sx={buttonStyles.buttonsubmit} onClick={handleCloseModcheckbox}>
                Ok
              </Button>
            )}
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
            <Button autoFocus variant="contained" color="error" onClick={handleCloseModalert}>
              {' '}
              OK{' '}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* ALERT DIALOG */}
      <Dialog open={isErrorOpen} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
          <Typography variant="h6">{showAlert}</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={handleClose}>
            ok
          </Button>
        </DialogActions>
      </Dialog>

      <ExportData
        isFilterOpen={isFilterOpen}
        handleCloseFilterMod={handleCloseFilterMod}
        fileFormat={fileFormat}
        setIsFilterOpen={setIsFilterOpen}
        isPdfFilterOpen={isPdfFilterOpen}
        setIsPdfFilterOpen={setIsPdfFilterOpen}
        handleClosePdfFilterMod={handleClosePdfFilterMod}
        filteredDataTwo={rowDataTable ?? []}
        itemsTwo={designations ?? []}
        filename={'Designation'}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />

      <MessageAlert openPopup={openPopupMalert} handleClosePopup={handleClosePopupMalert} popupContent={popupContentMalert} popupSeverity={popupSeverityMalert} />
      {/* SUCCESS */}
      <AlertDialog openPopup={openPopup} handleClosePopup={handleClosePopup} popupContent={popupContent} popupSeverity={popupSeverity} />
      <LoadingDialog open={openPopupUpload} onClose={() => setOpenPopupUpload(false)} progress={uploadProgress} />
    </Box>
  );
}
export default Designation;
