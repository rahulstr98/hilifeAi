import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FolderZipSharpIcon from '@mui/icons-material/FolderZipSharp';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ImageIcon from '@mui/icons-material/Image';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControl, FormControlLabel, Grid, IconButton, List, ListItem, ListItemText, MenuItem, OutlinedInput, Paper, Popover, Select, Table, TableBody, TableContainer, TableHead, TextField, Typography, Chip } from '@mui/material';
import Switch from '@mui/material/Switch';
import axios from '../../../../axiosInstance';
import { BASE_URL } from '../../../../services/Authservice.js';

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
import { handleApiError } from '../../../../components/Errorhandling';
import { StyledTableCell, StyledTableRow } from '../../../../components/Table';
import { AuthContext, UserRoleAccessContext } from '../../../../context/Appcontext';
import { colourStyles, userStyle } from '../../../../pageStyle';
import { SERVICE } from '../../../../services/Baseservice';

import * as FileSaver from 'file-saver';
import { FaFileCsv, FaFileExcel } from 'react-icons/fa';
import { MultiSelect } from 'react-multi-select-component';
import * as XLSX from 'xlsx';
import AggregatedSearchBar from '../../../../components/AggregatedSearchBar';
import AggridTable from '../../../../components/AggridTable';
import AlertDialog from '../../../../components/Alert';
import ExportData from '../../../../components/ExportData';
import Headtitle from '../../../../components/Headtitle';
import MessageAlert from '../../../../components/MessageAlert';
import PageHeading from '../../../../components/PageHeading';
import domtoimage from 'dom-to-image';
import uploadEmployeeDocuments from "../../../../components/CommonMulterFunction.js"


function Documentedit() {
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);

  const [overallItems, setOverallItems] = useState([]);
  const [isZipLoader, setIsZipLoader] = useState(false);
  let exportColumnNames = ['Empcode', 'Employee Name', 'Username', 'Work Mode'];
  let exportRowValues = ['empcode', 'companyname', 'username', 'workmode'];

  const [isHandleChange, setIsHandleChange] = useState(false);
  const [searchedString, setSearchedString] = useState('');

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
  const [alertMessage, setAlertMessage] = useState('');

  const [employees, setEmployees] = useState([]);
  const [empaddform, setEmpaddform] = useState({
    username: '',
    password: '',
    companyname: '',
    empcode: '',
  });
  const [getrowid, setRowGetid] = useState({});

  const [filterState, setFilterState] = useState({
    type: 'Individual',
    employeestatus: 'Please Select Employee Status',
  });
  const TypeOptions = [
    { label: 'Individual', value: 'Individual' },
    { label: 'Department', value: 'Department' },
    { label: 'Company', value: 'Company' },
    { label: 'Branch', value: 'Branch' },
    { label: 'Unit', value: 'Unit' },
    { label: 'Team', value: 'Team' },
  ];
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [internChecked, setInternChecked] = useState(false);
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
  useEffect(() => {
    fetchDepartments();
  }, []);

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
    setValueEmp([]);
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
    setValueEmp(
      options.map((a, index) => {
        return a.value;
      })
    );

    setSelectedOptionsEmployee(options);
  };

  const customValueRendererEmployee = (valueEmployeeCat, _categoryname) => {
    return valueEmployeeCat?.length ? valueEmployeeCat.map(({ label }) => label)?.join(', ') : 'Please Select Employee';
  };

  const [files, setFiles] = useState([]);
  const [Oldfiles, setOldFiles] = useState([]);

  const { isUserRoleCompare, isUserRoleAccess, allTeam, isAssignBranch, pageName, setPageName, buttonStyles, allUsersData, allUsersLimit } = useContext(UserRoleAccessContext);

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
      pagename: String('Document Update'),
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

  const getDownlodProfile = async () => {
    const getuserdetails = rowDataTable.map((data) => data.companyname);
    setIsZipLoader(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/documentsdownload`,
        { companyname: getuserdetails },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          responseType: 'blob', // <-- THIS IS IMPORTANT FOR FILE DOWNLOAD
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'UserDocuments.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setIsZipLoader(false);
    } catch (err) {
      setIsZipLoader(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // page refersh reload code
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
  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { auth } = useContext(AuthContext);

  const [isDocument, setIsDocument] = useState(false);
  const gridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const gridRefTableImg = useRef(null);
  // image
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage
        .toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, 'Document Update.png');
        })
        .catch((error) => {
          console.error('dom-to-image error: ', error);
        });
    }
  };

  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
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
    empcode: true,
    companyname: true,
    username: true,
    workmode: true,
    actions: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  const getCode = async (e) => {
    setPageName(!pageName);
    try {
      const [res, resNew] = await Promise.all([
        axios.get(`${SERVICE.USER_SINGLE}/${e}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }),
        axios.post(SERVICE.EMPLOYEEDOCUMENT_SINGLEWITHALLBYCOMMONID, {
          commonid: e,
        }),
      ]);
      setEmpaddform(res?.data?.suser);
      handleClickOpenEdit();
      await fetchCandidatedocumentdropdowns(res?.data?.suser?.designation);
      if (resNew?.data?.semployeedocument && resNew?.data?.semployeedocument?.files?.length > 0) {
        setFiles(resNew?.data?.semployeedocument?.files);
        setOldFiles(resNew?.data?.semployeedocument?.files);
        setRowGetid(resNew?.data?.semployeedocument);
      } else if (resNew?.data?.semployeedocument && resNew?.data?.semployeedocument?.files?.length == 0) {
        setFiles([]);
        setOldFiles([]);
        setRowGetid(resNew?.data?.semployeedocument);
      } else {
        setFiles([]);
        setOldFiles([]);
        setRowGetid(resNew?.data?.semployeedocument);
      }
    } catch (err) {
      console.log(err.message, 'error');
      setFiles([]);
      setOldFiles([]);
      setRowGetid({});
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Edit model
  const [isEditOpen, setIsEditOpen] = useState(false);
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setIsEditOpen(false);
    setfileNames('Please Select File Name');
    setAlertMessage('');
  };

  // info model
  const [openInfo, setOpeninfo] = useState(false);

  const handleClickOpeninfo = () => {
    setOpeninfo(true);
  };

  const handleCloseinfo = () => {
    setOpeninfo(false);
  };

  // get single row to view....
  const getinfoCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.USER_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setEmpaddform(res?.data?.suser);
      setRowGetid(res?.data?.suser);
      handleClickOpeninfo();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //Delete model
  const [isDeleteOpen, setisDeleteOpen] = useState(false);
  const handleCloseDel = () => {
    setisDeleteOpen(false);
  };

  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };

  //Documentupadate updateby edit page...
  let updateby = getrowid?.updatedby;
  let addedby = getrowid?.addedby;

  //edit post call
  let logedit = getrowid?._id;
  const sendRequestt = async () => {
    setPageName(!pageName);
    try {
      let res;
      if (Object.keys(getrowid).length != 0) {
        const employeeDocuments = await uploadEmployeeDocuments({
          empcode: "",
          commonid: id,
          companyname: "",
          type: '',
          files: files?.filter(data => data?.file), // assuming it's already [{ file, data, name, remark }]
          profileimage: "", // File object preferred, not base64 string
          addedby: [],
          updatedby: [
            ...updateby,
            {
              name: String(isUserRoleAccess?.username),
              // date: String(new Date()),
            },
          ],
          oldFiles: files?.filter(data => !data?.file),
          isEdit: true,
          updateId: logedit,
          deletedFileNames: Oldfiles?.filter(old => !files?.filter(f => !f?.file)?.some(f => f?.filename === old?.filename))


        });
        // res = await axios.put(`${SERVICE.EMPLOYEEDOCUMENT_SINGLE}/${logedit}`, {
        //   headers: {
        //     Authorization: `Bearer ${auth.APIToken}`,
        //   },
        //   files: [...files],
        //   updatedby: [
        //     ...updateby,
        //     {
        //       name: String(isUserRoleAccess.companyname),
        //       date: String(new Date()),
        //     },
        //   ],
        // });
      } else {
        const employeeDocuments = await uploadEmployeeDocuments({
          empcode: "",
          commonid: empaddform._id,
          companyname: "",
          type: '',
          files: files, // assuming it's already [{ file, data, name, remark }]
          profileimage: "", // File object preferred, not base64 string
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
          deletedFileNames: []

        });
        // res = await axios.post(SERVICE.EMPLOYEEDOCUMENT_CREATE, {
        //   commonid: empaddform._id,
        //   files: [...files],
        //   addedby: [
        //     {
        //       name: String(isUserRoleAccess.companyname),
        //       date: String(new Date()),
        //     },
        //   ],
        // });
      }

      await fetchEmployee();
      // setEmpaddform(res.data);
      handleCloseModEdit();
      setEmpaddform({
        username: '',
        password: '',
        companyname: '',
        empcode: '',
        firstname: '',
        lastname: '',
        remark: '',
      });
      setPopupContent('Updated Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleFileUpload = (event) => {
    const files = event.target.files;
    const maxFileSize = 1 * 1024 * 1024; // 1MB in bytes
    let showAlert = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > maxFileSize) {
        showAlert = true;
        continue; // Skip this file and continue with the next one
      }

      const reader = new FileReader();
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
      setAlertMessage('File size greater than 1MB, please upload a file below 1MB.');
    } else {
      setAlertMessage(''); // Clear alert message if all files are valid
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
    }
    else {
      const response = await fetch(file.preview);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      window.open(link, '_blank');
    }
  };

  const editSubmit = (e) => {
    e.preventDefault();
    sendRequestt();
  };

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
        Empcode: item.empcode || '',
        'Employee Name': item.companyname || '',
        Username: item.username || '',
      };
    });
  };

  const handleExportXL = (isfilter) => {
    const dataToExport = isfilter === 'filtered' ? filteredData : employees;

    if (!dataToExport || dataToExport.length === 0) {
      console.error('No data available to export');
      return;
    }

    exportToExcel(formatData(dataToExport), 'Document Details List');
    setIsFilterOpen(false);
  };

  //  PDF
  // pdf.....
  const columns = [
    { title: 'Empcode', field: 'empcode' },
    { title: 'Employee Name', field: 'companyname' },
    { title: 'Username', field: 'username' },
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
        : employees?.map((item, index) => ({
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

    doc.save('Document Details List.pdf');
  };

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Document Details List',
    pageStyle: 'print',
  });

  //table entries ..,.
  const [items, setItems] = useState([]);

  const addSerialNumber = (datas) => {
    const itemsWithSerialNumber = datas?.map((item, index) => ({
      ...item,
      serialNumber: index + 1,
    }));
    setItems(itemsWithSerialNumber);
    setOverallItems(itemsWithSerialNumber);
  };

  useEffect(() => {
    addSerialNumber(employees);
  }, [employees]);

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

  const totalPages = Math.ceil(employees.length / pageSize);

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
      field: 'serialNumber',
      headerName: 'SNo',
      flex: 0,
      width: 90,
      hide: !columnVisibility.serialNumber,
      headerClassName: 'bold-header',
      pinned: 'left',
    },
    {
      field: 'empcode',
      headerName: 'Emp Code',
      flex: 0,
      width: 130,
      hide: !columnVisibility.empcode,
      headerClassName: 'bold-header',
      pinned: 'left',
    },
    {
      field: 'companyname',
      headerName: 'Company Name',
      flex: 0,
      width: 130,
      hide: !columnVisibility.companyname,
      headerClassName: 'bold-header',
      pinned: 'left',
    },
    {
      field: 'username',
      headerName: 'Username',
      flex: 0,
      width: 130,
      hide: !columnVisibility.username,
      headerClassName: 'bold-header',
    },
    {
      field: 'workmode',
      headerName: 'Work Mode',
      flex: 0,
      width: 130,
      hide: !columnVisibility.workmode,
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
      cellRenderer: (params) => (
        <>
          {isUserRoleCompare.includes('Manager') ? (
            <>
              <Grid container spacing={2}>
                <Grid item>
                  {isUserRoleCompare?.includes('idocumentinfoupdate') && (
                    <>
                      <Button
                        sx={userStyle.buttonedit}
                        onClick={() => {
                          handleClickOpeninfo();
                          getinfoCode(params.data.id);
                        }}
                      >
                        <InfoOutlinedIcon style={{ fontsize: 'large' }} sx={buttonStyles.buttoninfo} />
                      </Button>
                    </>
                  )}
                </Grid>
              </Grid>
            </>
          ) : (
            <>
              <Grid sx={{ display: 'flex' }}>
                {isUserRoleCompare?.includes('edocumentinfoupdate') && (
                  <Button
                    sx={userStyle.buttonedit}
                    onClick={() => {
                      getCode(params.data.id);
                    }}
                  >
                    <EditIcon style={{ fontsize: 'large' }} sx={buttonStyles.buttonedit} />
                  </Button>
                )}

                {isUserRoleCompare?.includes('idocumentinfoupdate') && (
                  <Button
                    sx={userStyle.buttonedit}
                    onClick={() => {
                      getinfoCode(params.data.id);
                    }}
                  >
                    <InfoOutlinedIcon style={{ fontsize: 'large' }} sx={buttonStyles.buttoninfo} />
                  </Button>
                )}
              </Grid>
            </>
          )}
        </>
      ),
    },
  ];

  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item._id,
      serialNumber: item.serialNumber,
      empcode: item.empcode,
      workmode: item.workmode,
      companyname: item.companyname,
      username: item.username,
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

  const [designationsFileNames, setDesignationsFileNames] = useState([]);
  const [fileNames, setfileNames] = useState('Please Select File Name');

  //get all Areas.
  const fetchCandidatedocumentdropdowns = async (name) => {
    setPageName(!pageName);
    try {
      let res_candidate = await axios.get(SERVICE.CANDIDATEDOCUMENT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let data_set = res_candidate.data.candidatedocuments.filter((data) => data.designation === name);

      const desigall = [
        ...data_set.map((d) => ({
          ...d,
          label: d.candidatefilename,
          value: d.candidatefilename,
        })),
      ];

      setDesignationsFileNames([...desigall, { label: 'Other', value: 'Other' }]);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
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

  const [valueEmp, setValueEmp] = React.useState([]); // State for employees
  const [isBoxFocused, setIsBoxFocused] = React.useState(false); // Track focus state

  let [valueTeamCat, setValueTeamCat] = useState([]);
  let [valueUnitCat, setValueUnitCat] = useState([]);
  let [valueBranchCat, setValueBranchCat] = useState([]);
  let [valueCompanyCat, setValueCompanyCat] = useState([]);

  const [searchInputValue, setSearchInputValue] = useState('');

  const handlePasteForEmp = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');

    // Process the pasted text
    const pastedNames = pastedText
      .split(/[\n,]+/)
      .map((name) => name.trim())
      .filter((name) => name !== '');

    // Update the state
    updateEmployees(pastedNames);

    // Clear the search input after paste
    setSearchInputValue('');

    // Refocus the element
    e.target.focus();
  };

  useEffect(() => {
    updateEmployees([]); // Pass an empty array instead of an empty string
  }, [allUsersData, valueCompanyCat, valueBranchCat, valueUnitCat, valueTeamCat]);

  const updateEmployees = (pastedNames) => {
    // Your existing update logic...
    const namesArray = Array.isArray(pastedNames) ? pastedNames : [];

    const availableOptions = internChecked
      ? allUsersData?.filter((u) => valueCompanyCat?.includes(u.company) && valueBranchCat?.includes(u.branch) && valueUnitCat?.includes(u.unit) && valueTeamCat?.includes(u.team) && u.workmode === 'Internship')?.map((data) => data.companyname.replace(/\s*\.\s*/g, '.').trim())
      : allUsersData?.filter((u) => valueCompanyCat?.includes(u.company) && valueBranchCat?.includes(u.branch) && valueUnitCat?.includes(u.unit) && valueTeamCat?.includes(u.team) && u.workmode !== 'Internship')?.map((data) => data.companyname.replace(/\s*\.\s*/g, '.').trim());

    const matchedValues = namesArray.filter((name) => availableOptions.includes(name.replace(/\s*\.\s*/g, '.').trim()));

    // Update selected options
    const newOptions = matchedValues.map((value) => ({
      label: value,
      value: value,
    }));

    setSelectedOptionsEmployee((prev) => {
      const newValues = newOptions.filter((newOpt) => !prev.some((prevOpt) => prevOpt.value === newOpt.value));
      return [...prev, ...newValues];
    });

    // Update other states...
    setValueEmp((prev) => [...new Set([...prev, ...matchedValues])]);
    setValueEmployeeCat((prev) => [...new Set([...prev, ...matchedValues])]);
  };


  // Handle clicks outside the Box
  useEffect(() => {
    const handleClickOutside = (e) => {
      const boxElement = document.getElementById('paste-box'); // Add an ID to the Box
      if (boxElement && !boxElement.contains(e.target)) {
        setIsBoxFocused(false); // Reset focus state if clicking outside the Box
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDelete = (e, value) => {
    e.preventDefault();
    setSelectedOptionsEmployee((current) => current.filter((emp) => emp.value !== value));
    setValueEmp((current) => current.filter((empValue) => empValue !== value));
    setValueEmployeeCat((current) => current.filter((empValue) => empValue !== value));
  };

  const handleClearFilter = () => {
    setValueCompanyCat([]);
    setSelectedOptionsCompany([]);
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
    setValueEmp([]);
    setEmployees([]);
    setFilterState({
      type: 'Individual',
      employeestatus: 'Please Select Employee Status',
    });
    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
    setSearchQuery('');
  };

  //MULTISELECT ONCHANGE START

  //company multiselect
  const [selectedOptionsCompany, setSelectedOptionsCompany] = useState([]);

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
    setValueEmp([]);
  };

  const customValueRendererCompany = (valueCompanyCat, _categoryname) => {
    return valueCompanyCat?.length ? valueCompanyCat.map(({ label }) => label)?.join(', ') : 'Please Select Company';
  };

  //branch multiselect
  const [selectedOptionsBranch, setSelectedOptionsBranch] = useState([]);

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
    setValueEmp([]);
  };

  const customValueRendererBranch = (valueBranchCat, _categoryname) => {
    return valueBranchCat?.length ? valueBranchCat.map(({ label }) => label)?.join(', ') : 'Please Select Branch';
  };

  //unit multiselect
  const [selectedOptionsUnit, setSelectedOptionsUnit] = useState([]);

  const handleUnitChange = (options) => {
    setValueUnitCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsUnit(options);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
  };

  const customValueRendererUnit = (valueUnitCat, _categoryname) => {
    return valueUnitCat?.length ? valueUnitCat.map(({ label }) => label)?.join(', ') : 'Please Select Unit';
  };

  //team multiselect
  const [selectedOptionsTeam, setSelectedOptionsTeam] = useState([]);

  const handleTeamChange = (options) => {
    setValueTeamCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsTeam(options);
  };

  const customValueRendererTeam = (valueTeamCat, _categoryname) => {
    return valueTeamCat?.length ? valueTeamCat.map(({ label }) => label)?.join(', ') : 'Please Select Team';
  };

  //MULTISELECT ONCHANGE END

  const handleFilter = () => {
    if (filterState?.type === 'Please Select Type' || filterState?.type === '') {
      setPopupContentMalert('Please Select Type!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (selectedOptionsCompany?.length === 0) {
      setPopupContentMalert('Please Select Company!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (['Individual', 'Branch', 'Unit', 'Team']?.includes(filterState?.type) && selectedOptionsBranch?.length === 0) {
      setPopupContentMalert('Please Select Branch!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (['Individual', 'Unit', 'Team']?.includes(filterState?.type) && selectedOptionsUnit?.length === 0) {
      setPopupContentMalert('Please Select Unit!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (['Individual', 'Team']?.includes(filterState?.type) && selectedOptionsTeam?.length === 0) {
      setPopupContentMalert('Please Select Team!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (filterState?.type === 'Individual' && selectedOptionsEmployee?.length === 0) {
      setPopupContentMalert('Please Select Employee!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (filterState?.type === 'Department' && selectedOptionsDepartment?.length === 0) {
      setPopupContentMalert('Please Select Department!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      setSearchQuery('');
      fetchEmployee();
    }
  };
  const [allAssignCompany, setAllAssignCompany] = useState([]);
  const [allAssignBranch, setAllAssignBranch] = useState([]);
  const [allAssignUnit, setAllAssignUnit] = useState([]);
  //get all employees list details
  const fetchEmployee = async () => {
    setIsDocument(true);
    setPageName(!pageName);
    const aggregationPipeline = [
      {
        $match: {
          $and: [
            // Enquiry status filter
            {
              enquirystatus: {
                $nin: ['Enquiry Purpose'],
              },
            },
            // Reasonable status filter
            {
              resonablestatus: {
                $nin: ['Not Joined', 'Postponed', 'Rejected', 'Closed', 'Releave Employee', 'Absconded', 'Hold', 'Terminate'],
              },
            },
            // Conditional company filter
            ...(valueCompanyCat.length > 0
              ? [
                {
                  company: { $in: valueCompanyCat },
                },
              ]
              : [
                {
                  company: { $in: allAssignCompany },
                },
              ]),
            // Conditional branch filter
            ...(valueBranchCat.length > 0
              ? [
                {
                  branch: { $in: valueBranchCat },
                },
              ]
              : [
                {
                  branch: { $in: allAssignBranch },
                },
              ]),
            // Conditional unit filter
            ...(valueUnitCat.length > 0
              ? [
                {
                  unit: { $in: valueUnitCat },
                },
              ]
              : [
                {
                  unit: { $in: allAssignUnit },
                },
              ]),
            // Conditional team filter
            ...(valueTeamCat.length > 0
              ? [
                {
                  team: { $in: valueTeamCat },
                },
              ]
              : []),
            // Conditional department filter
            ...(valueTeamCat.length > 0
              ? [
                {
                  team: { $in: valueTeamCat },
                },
              ]
              : []),
            // Conditional department filter
            ...(valueDepartmentCat.length > 0
              ? [
                {
                  department: { $in: valueDepartmentCat },
                },
              ]
              : []),
            // Conditional Employee filter
            ...(valueEmployeeCat.length > 0
              ? [
                {
                  companyname: { $in: valueEmployeeCat },
                },
              ]
              : []),
          ],
        },
      },
      {
        $project: {
          username: 1,
          empcode: 1,
          companyname: 1,
          workmode: 1,
        },
      },
    ];
    try {
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
      setEmployees(response.data.users);
      setIsDocument(false);
    } catch (err) {
      setIsDocument(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  //auto select all dropdowns
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

      let mappedemployees = allUsersData
        ?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit) && selectedTeam?.includes(u.team) && u.workmode !== 'Internship')
        .map((u) => ({
          label: u.companyname,
          value: u.companyname,
        }));

      let employees = allUsersData?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit) && selectedTeam?.includes(u.team) && u.workmode !== 'Internship').map((u) => u.companyname);
      setValueTeamCat(selectedTeam);
      setSelectedOptionsTeam(mappedTeam);
      setAllAssignCompany(selectedCompany);

      setAllAssignBranch(selectedBranch);

      setAllAssignUnit(selectedUnit);

      setValueEmployeeCat(employees);
      setSelectedOptionsEmployee(mappedemployees);

      setValueEmp(mappedemployees?.map((item) => item?.value));
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    handleAutoSelect();
  }, [isAssignBranch]);

  return (
    <Box>
      {/* ****** Header Content ****** */}
      <Headtitle title={'DOCUMENT INFO UPDATE'} />

      <PageHeading title="Document Details" modulename="Human Resources" submodulename="HR" mainpagename="Employee" subpagename="Employee Update Details" subsubpagename="Document Info update" />

      <br />
      {isUserRoleCompare?.includes('ldocumentinfoupdate') && (
        <>
          <Box sx={userStyle.selectcontainer}>
            <Grid container spacing={2}>
              <>
                <Grid item xs={12}>
                  <Typography sx={userStyle.importheadtext}>Filters</Typography>
                </Grid>
                <br />
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Type<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      options={TypeOptions}
                      styles={colourStyles}
                      value={{
                        label: filterState.type ?? 'Please Select Type',
                        value: filterState.type ?? 'Please Select Type',
                      }}
                      onChange={(e) => {
                        setFilterState((prev) => ({
                          ...prev,
                          type: e.value,
                        }));
                        setValueCompanyCat([]);
                        setSelectedOptionsCompany([]);
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
                        setValueEmp([]);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <Typography>
                    Company<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <MultiSelect
                      options={accessbranch
                        ?.map((data) => ({
                          label: data.company,
                          value: data.company,
                        }))
                        .filter((item, index, self) => {
                          return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                        })}
                      value={selectedOptionsCompany}
                      onChange={(e) => {
                        handleCompanyChange(e);
                      }}
                      valueRenderer={customValueRendererCompany}
                      labelledBy="Please Select Company"
                    />
                  </FormControl>
                </Grid>
                {['Individual', 'Team']?.includes(filterState.type) ? (
                  <>
                    {/* Branch Unit Team */}
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          {' '}
                          Branch <b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <MultiSelect
                          options={accessbranch
                            ?.filter((comp) => valueCompanyCat?.includes(comp.company))
                            ?.map((data) => ({
                              label: data.branch,
                              value: data.branch,
                            }))
                            .filter((item, index, self) => {
                              return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                            })}
                          value={selectedOptionsBranch}
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
                          {' '}
                          Unit<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <MultiSelect
                          options={accessbranch
                            ?.filter((comp) => valueCompanyCat?.includes(comp.company) && valueBranchCat?.includes(comp.branch))
                            ?.map((data) => ({
                              label: data.unit,
                              value: data.unit,
                            }))
                            .filter((item, index, self) => {
                              return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                            })}
                          value={selectedOptionsUnit}
                          onChange={(e) => {
                            handleUnitChange(e);
                          }}
                          valueRenderer={customValueRendererUnit}
                          labelledBy="Please Select Unit"
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Team<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <MultiSelect
                          options={allTeam
                            ?.filter((u) => valueCompanyCat?.includes(u.company) && valueBranchCat?.includes(u.branch) && valueUnitCat?.includes(u.unit))
                            .map((u) => ({
                              ...u,
                              label: u.teamname,
                              value: u.teamname,
                            }))}
                          value={selectedOptionsTeam}
                          onChange={(e) => {
                            handleTeamChange(e);
                          }}
                          valueRenderer={customValueRendererTeam}
                          labelledBy="Please Select Team"
                        />
                      </FormControl>
                    </Grid>
                  </>
                ) : ['Department']?.includes(filterState.type) ? (
                  <>
                    {/* Department */}
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Department<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <MultiSelect
                          options={departmentOptions}
                          value={selectedOptionsDepartment}
                          onChange={(e) => {
                            handleDepartmentChange(e);
                          }}
                          valueRenderer={customValueRendererDepartment}
                          labelledBy="Please Select Department"
                        />
                      </FormControl>
                    </Grid>
                  </>
                ) : ['Branch']?.includes(filterState.type) ? (
                  <>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          {' '}
                          Branch <b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <MultiSelect
                          options={accessbranch
                            ?.filter((comp) => valueCompanyCat?.includes(comp.company))
                            ?.map((data) => ({
                              label: data.branch,
                              value: data.branch,
                            }))
                            .filter((item, index, self) => {
                              return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                            })}
                          value={selectedOptionsBranch}
                          onChange={(e) => {
                            handleBranchChange(e);
                          }}
                          valueRenderer={customValueRendererBranch}
                          labelledBy="Please Select Branch"
                        />
                      </FormControl>
                    </Grid>
                  </>
                ) : ['Unit']?.includes(filterState.type) ? (
                  <>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          {' '}
                          Branch<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <MultiSelect
                          options={accessbranch
                            ?.filter((comp) => valueCompanyCat?.includes(comp.company))
                            ?.map((data) => ({
                              label: data.branch,
                              value: data.branch,
                            }))
                            .filter((item, index, self) => {
                              return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                            })}
                          value={selectedOptionsBranch}
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
                          {' '}
                          Unit <b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <MultiSelect
                          options={accessbranch
                            ?.filter((comp) => valueCompanyCat?.includes(comp.company) && valueBranchCat?.includes(comp.branch))
                            ?.map((data) => ({
                              label: data.unit,
                              value: data.unit,
                            }))
                            .filter((item, index, self) => {
                              return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                            })}
                          value={selectedOptionsUnit}
                          onChange={(e) => {
                            handleUnitChange(e);
                          }}
                          valueRenderer={customValueRendererUnit}
                          labelledBy="Please Select Unit"
                        />
                      </FormControl>
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                {['Individual']?.includes(filterState.type) && (
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Employee<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <div onPaste={handlePasteForEmp} style={{ position: 'relative' }}>
                        <MultiSelect
                          options={
                            internChecked
                              ? allUsersData
                                ?.filter((u) => valueCompanyCat?.includes(u.company) && valueBranchCat?.includes(u.branch) && valueUnitCat?.includes(u.unit) && valueTeamCat?.includes(u.team) && u.workmode === 'Internship')
                                .map((u) => ({
                                  label: u.companyname,
                                  value: u.companyname,
                                }))
                              : allUsersData
                                ?.filter((u) => valueCompanyCat?.includes(u.company) && valueBranchCat?.includes(u.branch) && valueUnitCat?.includes(u.unit) && valueTeamCat?.includes(u.team) && u.workmode !== 'Internship')
                                .map((u) => ({
                                  label: u.companyname,
                                  value: u.companyname,
                                }))
                          }
                          value={selectedOptionsEmployee}
                          onChange={(e) => {
                            handleEmployeeChange(e);
                          }}
                          valueRenderer={customValueRendererEmployee}
                          labelledBy="Please Select Employee"
                          // Add these props if your MultiSelect supports them
                          inputValue={searchInputValue} // Add this state if needed
                          onInputChange={(newValue) => setSearchInputValue(newValue)}
                        />
                      </div>
                    </FormControl>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={internChecked}
                          onChange={(event) => {
                            setInternChecked(event.target.checked);
                            setValueEmployeeCat([]);
                            setSelectedOptionsEmployee([]);
                            setValueEmp([]);
                          }}
                        />
                      }
                      label="Internship"
                    />
                  </Grid>
                )}
                {['Individual']?.includes(filterState.type) && (
                  <Grid item md={6} sm={12} xs={12} sx={{ display: 'flex', flexDirection: 'row' }}>
                    <FormControl fullWidth size="small">
                      <Typography>Selected Employees</Typography>
                      <div
                        id="paste-box" // Add an ID to the Box
                        tabIndex={0} // Make the div focusable
                        style={{
                          border: '1px solid #ccc',
                          borderRadius: '3.75px',
                          height: '110px',
                          overflow: 'auto',
                        }}
                        onPaste={handlePasteForEmp}
                        onFocus={() => setIsBoxFocused(true)} // Set focus state to true
                        onBlur={(e) => {
                          if (isBoxFocused) {
                            e.target.focus(); // Refocus only if the Box was previously focused
                          }
                        }}
                      >
                        {valueEmp.map((value) => (
                          <Chip key={value} label={value} clickable sx={{ margin: 0.2, backgroundColor: '#FFF' }} onDelete={(e) => handleDelete(e, value)} onClick={() => console.log('clicked chip')} />
                        ))}
                      </div>
                    </FormControl>
                  </Grid>
                )}
              </>
            </Grid>
            <br />
            <br />
            <br />
            <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Grid item lg={1} md={2} sm={2} xs={12}>
                <Button sx={buttonStyles.buttonsubmit} variant="contained" onClick={handleFilter}>
                  {' '}
                  Filter{' '}
                </Button>
              </Grid>
              <Grid item lg={1} md={2} sm={2} xs={12}>
                <Button sx={buttonStyles.btncancel} onClick={handleClearFilter}>
                  {' '}
                  Clear{' '}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
      <br />
      {isUserRoleCompare?.includes('ldocumentinfoupdate') && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Document Details List</Typography>
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
                    <MenuItem value={employees?.length}>All</MenuItem>
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
                  {isUserRoleCompare?.includes('exceldocumentinfoupdate') && (
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
                  {isUserRoleCompare?.includes('csvdocumentinfoupdate') && (
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
                  {isUserRoleCompare?.includes('printdocumentinfoupdate') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('pdfdocumentinfoupdate') && (
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
                  {isUserRoleCompare?.includes('imagedocumentinfoupdate') && (
                    <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}>
                      {' '}
                      <ImageIcon sx={{ fontSize: '15px' }} /> &ensp;Image&ensp;{' '}
                    </Button>
                  )}
                  {isUserRoleCompare?.includes('menudocumentinfoupdatezip') && (
                    <Button disabled={isZipLoader} sx={userStyle.buttongrp} onClick={getDownlodProfile}>
                      {' '}
                      <FolderZipSharpIcon sx={{ fontSize: '15px' }} /> &ensp;Export To Zip&ensp;{' '}
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
                  maindatas={employees}
                  setSearchedString={setSearchedString}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  paginated={false}
                  totalDatas={overallItems}
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
            <br />
            <br />
            {isDocument ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
                  gridRefTable={gridRef}
                  paginated={false}
                  filteredDatas={filteredDatas}
                  handleShowAllColumns={handleShowAllColumns}
                  setFilteredRowData={setFilteredRowData}
                  filteredRowData={filteredRowData}
                  setFilteredChanges={setFilteredChanges}
                  filteredChanges={filteredChanges}
                  gridRefTableImg={gridRefTableImg}
                  itemsList={overallItems}
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

      {/* Delete Modal */}
      <Box>
        {/* ALERT DIALOG */}
        <Dialog open={isDeleteOpen} onClose={handleCloseDel} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '80px', color: 'orange' }} />
            <Typography variant="h5" sx={{ color: 'red', textAlign: 'center' }}>
              Are you sure?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDel} sx={userStyle.btncancel}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Box>
        {/* Edit DIALOG */}
        <Dialog open={isEditOpen} onClose={handleCloseModEdit} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="md" sx={{ marginTop: '50px' }}>
          <Box sx={userStyle.dialogbox}>
            <>
              <Typography sx={userStyle.HeaderText}> Edit Doument</Typography>
              <br />
              <Grid container spacing={2}>
                <Grid item md={6} sm={12} xs={12} sx={{ display: 'flex' }}>
                  <Typography sx={{ fontWeight: '600', marginRight: '5px' }}>Employee Name:</Typography>
                  <Typography>{empaddform.companyname}</Typography>
                </Grid>
                <Grid item md={6} sm={12} xs={12} sx={{ display: 'flex' }}>
                  <Typography sx={{ fontWeight: '600', marginRight: '5px' }}>Emp Code:</Typography>
                  <Typography>{empaddform.empcode}</Typography>
                </Grid>
                <br></br>
                <br></br>
                <br></br>
                <Grid item md={6} sm={12} xs={12}>
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
                </Grid>
                <Grid item md={6} sm={12} xs={12}>
                  <Button variant="outlined" component="label">
                    <CloudUploadIcon sx={{ fontSize: '21px' }} /> &ensp;Upload Documents
                    <input hidden type="file" multiple onChange={handleFileUpload} />
                  </Button>
                  {alertMessage && (
                    <Typography variant="body2" color="error">
                      {alertMessage}
                    </Typography>
                  )}
                </Grid>
                <Grid item md={12} sm={12} xs={12}>
                  <Box>
                    <Typography> Document List </Typography>
                    <br />
                    <br />

                    {/* ****** Table start ****** */}
                    <TableContainer component={Paper}>
                      <Table aria-label="simple table" id="branch">
                        <TableHead sx={{ fontWeight: '600' }}>
                          <StyledTableRow>
                            <StyledTableCell>SI.NO</StyledTableCell>
                            <StyledTableCell>Document</StyledTableCell>
                            <StyledTableCell>Remarks</StyledTableCell>
                            <StyledTableCell>View</StyledTableCell>
                            <StyledTableCell>Download</StyledTableCell>
                            <StyledTableCell>Action</StyledTableCell>
                          </StyledTableRow>
                        </TableHead>
                        <TableBody>
                          {files &&
                            files.map((file, index) => (
                              <StyledTableRow key={index}>
                                <StyledTableCell align="center">{index + 1}</StyledTableCell>
                                <StyledTableCell align="left">{file.name}</StyledTableCell>
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

                                <StyledTableCell component="th" scope="row" align="center">
                                  {file?.orginpath === 'Employee Documents' ? (
                                    <a
                                      style={{
                                        color: '#357ae8',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault(); // Prevent default anchor behavior
                                        downloadFile(file.preview);
                                      }}
                                    >
                                      Download
                                    </a>
                                  ) : file?.path ? (
                                    <a
                                      style={{
                                        color: '#357ae8',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault(); // Prevent default anchor behavior
                                        downloadFileDocument(file.filename);
                                      }}
                                    >
                                      Download
                                    </a>
                                  ) : (
                                    <a style={{ color: '#357ae8' }} href={`data:application/octet-stream;base64,${file.data}`} download={file.name}>
                                      Download
                                    </a>
                                  )}
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
                                  </Button>{' '}
                                </StyledTableCell>
                              </StyledTableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Grid>
                <br />
              </Grid>{' '}
              <br /> <br /> <br />
              <Grid container>
                <Grid item md={1}></Grid>
                <Button variant="contained" onClick={editSubmit} sx={buttonStyles.buttonsubmit}>
                  Update
                </Button>
                <Grid item md={1}></Grid>
                <Button sx={buttonStyles.btncancel} onClick={handleCloseModEdit}>
                  Cancel
                </Button>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>
      <Box>
        <Dialog aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6"></Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="error">
              ok
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* this is info view details */}

      <Dialog open={openInfo} onClose={handleCloseinfo} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="lg">
        <Box sx={{ width: '550px', padding: '20px 50px' }}>
          <>
            <Typography sx={userStyle.HeaderText}> Document Info</Typography>
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

      {/* print layout */}
      <TableContainer component={Paper} sx={userStyle.printcls}>
        <Table aria-label="simple table" id="branch" ref={componentRef}>
          <TableHead sx={{ fontWeight: '600' }}>
            <StyledTableRow>
              <StyledTableCell>SI.NO</StyledTableCell>
              <StyledTableCell>Employee ID</StyledTableCell>
              <StyledTableCell>Employee Name</StyledTableCell>
              <StyledTableCell>Username</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {rowDataTable &&
              rowDataTable?.map((row, index) => (
                <StyledTableRow key={index}>
                  <StyledTableCell>{index + 1}</StyledTableCell>
                  <StyledTableCell>{row.empcode} </StyledTableCell>
                  <StyledTableCell>{row.companyname} </StyledTableCell>
                  <StyledTableCell>{row.username}</StyledTableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

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
            <Button variant="contained" color="error" onClick={handleCloseerr}>
              ok
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <ExportData
        isFilterOpen={isFilterOpen}
        handleCloseFilterMod={handleCloseFilterMod}
        fileFormat={fileFormat}
        setIsFilterOpen={setIsFilterOpen}
        isPdfFilterOpen={isPdfFilterOpen}
        setIsPdfFilterOpen={setIsPdfFilterOpen}
        handleClosePdfFilterMod={handleClosePdfFilterMod}
        filteredDataTwo={(filteredChanges !== null ? filteredRowData : rowDataTable) ?? []}
        itemsTwo={employees ?? []}
        filename={'Document Update'}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />

      <MessageAlert openPopup={openPopupMalert} handleClosePopup={handleClosePopupMalert} popupContent={popupContentMalert} popupSeverity={popupSeverityMalert} />
      {/* SUCCESS */}
      <AlertDialog openPopup={openPopup} handleClosePopup={handleClosePopup} popupContent={popupContent} popupSeverity={popupSeverity} />
    </Box>
  );
}

export default Documentedit;
