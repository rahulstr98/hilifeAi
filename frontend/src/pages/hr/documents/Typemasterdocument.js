import React, { useState, useEffect, useRef, useContext } from 'react';
import { Box, Typography, OutlinedInput, Select, MenuItem, Dialog, DialogContent, DialogActions, FormControl, Grid, Button, List, ListItem, ListItemText, Popover, Checkbox, TextField, IconButton } from '@mui/material';
import { userStyle } from '../../../pageStyle';
import { FaPrint, FaFilePdf } from 'react-icons/fa';
import { handleApiError } from '../../../components/Errorhandling';
import 'jspdf-autotable';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import axios from '../../../axiosInstance';
import { SERVICE } from '../../../services/Baseservice';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import StyledDataGrid from '../../../components/TableStyle';
import { useReactToPrint } from 'react-to-print';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { UserRoleAccessContext, AuthContext } from '../../../context/Appcontext';
import Headtitle from '../../../components/Headtitle';
import { ThreeDots } from 'react-loader-spinner';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import { saveAs } from 'file-saver';
import Switch from '@mui/material/Switch';
import CloseIcon from '@mui/icons-material/Close';
import html2canvas from 'html2canvas';
import ImageIcon from '@mui/icons-material/Image';
import { FaFileExcel, FaFileCsv } from 'react-icons/fa';
import PageHeading from '../../../components/PageHeading';
import ExportData from '../../../components/ExportData';
import AlertDialog from '../../../components/Alert';
import MessageAlert from '../../../components/MessageAlert';
import InfoPopup from '../../../components/InfoPopup.js';
import { DeleteConfirmation, PleaseSelectRow } from '../../../components/DeleteConfirmation.js';
import { getCurrentServerTime } from '../../../components/getCurrentServerTime';


function TypeMasterDocument() {
  const [serverTime, setServerTime] = useState(new Date());
  useEffect(() => {
    const fetchTime = async () => {
      try {
        // Get current server time and format it
        const time = await getCurrentServerTime();
        setServerTime(time);
      } catch (error) {
        console.error('Failed to fetch server time:', error);
      }
    };

    fetchTime();
  }, []);
  // Error Popup model
  const [isErrorOpenpop, setIsErrorOpenpop] = useState(false);
  const [showAlertpop, setShowAlertpop] = useState();
  const handleClickOpenerrpop = () => {
    setIsErrorOpenpop(true);
  };
  const handleCloseerrpop = () => {
    setIsErrorOpenpop(false);
  };

  const pathname = window.location.pathname;
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

  let exportColumnNames = ['Name'];
  let exportRowValues = ['name'];

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

  const getapi = async () => {
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String('Type Master Document'),
      commonid: String(isUserRoleAccess?._id),
      date: String(new Date(serverTime)),
      addedby: [
        {
          name: String(isUserRoleAccess?.username),
        },
      ],
    });
  };

  useEffect(() => {
    getapi();
  }, []);

  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };
  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };

  const [fileFormat, setFormat] = useState('');
  const [typemaster, setTypemaster] = useState({ name: '' });
  const [typemasterEdit, setTypemasterEdit] = useState({ name: '' });
  const [typemasters, setTypemasters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allTypemasteredit, setAllTypemasteredit] = useState([]);
  const { isUserRoleCompare, isUserRoleAccess, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);
  const [isBtn, setIsBtn] = useState(false);

  const [typemasterCheck, setTypemastercheck] = useState(false);
  const gridRef = useRef(null);

  const [selectedRows, setSelectedRows] = useState([]);

  const [searchQueryManage, setSearchQueryManage] = useState('');

  const [copiedData, setCopiedData] = useState('');

  //image
  const handleCaptureImage = () => {
    if (gridRef.current) {
      html2canvas(gridRef.current).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, 'Type Master Document.png');
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
    if (selectedRows.length === 0) {
      setIsDeleteOpenalert(true);
    } else {
       getOverallEditSectionOverallDelete(selectedRows);
      // setIsDeleteOpencheckbox(true);
    }
  };

    const [selectedRowsCount, setSelectedRowsCount] = useState(0);
    const getOverallEditSectionOverallDelete = async (ids) => {
      try {
        let res = await axios.post(SERVICE.OVERALL_TYPEMASTER_DELETE, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          id: ids,
        });
        setSelectedRows(res?.data?.result);
        setSelectedRowsCount(res?.data?.count);
        setSelectAllChecked(res?.data?.count === filteredData.length);
        setIsDeleteOpencheckbox(true);
      } catch (err) {
        handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
      }
    };
  const handleCloseModalert = () => {
    setIsDeleteOpenalert(false);
  };

  //Delete model
  const [isDeleteOpencheckbox, setIsDeleteOpencheckbox] = useState(false);

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
    name: true,
    actions: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ''; // This is required for Chrome support
  };

  const [deleteType, setDeleteType] = useState('');
  const [deletePages, setDeletePages] = useState('');
  const [checkdoc, setCheckdoc] = useState();
  //check delete model
  const [isCheckOpen, setisCheckOpen] = useState(false);
  const handleClickOpenCheck = () => {
    setisCheckOpen(true);
  };
  const handleCloseCheck = () => {
    setisCheckOpen(false);
  };
  const rowData = async (id, name) => {
    setPageName(!pageName);
    try {
        const [res, resp] = await Promise.all([
    axios.get(`${SERVICE.TYPEMASTERDOCUMENT_SINGLE}/${id}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    }),
    axios.post(
      SERVICE.TYPEMASTER_DOCUMENTS_OVERALL_EDIT,
      { oldname: name }, // request body
      {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      }
    )
  ]);
      console.log(resp.data, 'res')
      setDeleteType(res?.data?.stypemasterdocument);
      setCheckdoc(resp?.data?.count);
      setDeletePages(`${resp.data.docCategory?.length > 0 ? 'Document Category ,' : ''}  
         ${resp.data.assignDoc?.length > 0 ? 'Assign Document ,' : ''}  
         ${resp.data.addDoc?.length > 0 ? 'Add Document' : ''}`);
      if (resp.data?.count > 0) {
        handleClickOpenCheck();
      } else {
        handleClickOpen();
      }
      // handleClickOpen();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Alert delete popup
  let Typesid = deleteType?._id;
  const delType = async () => {
    setPageName(!pageName);
    try {
      await axios.delete(`${SERVICE.TYPEMASTERDOCUMENT_SINGLE}/${Typesid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      await fetchTypemaster();
      handleCloseMod();
      setPage(1);

      setPopupContent('Deleted Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const delTypecheckbox = async () => {
    setPageName(!pageName);
    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(`${SERVICE.TYPEMASTERDOCUMENT_SINGLE}/${item}`, {
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

      await fetchTypemaster();
      setPopupContent('Deleted Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //add function
  const sendRequest = async () => {
    setPageName(!pageName);
    setIsBtn(true);
    try {
      let subprojectscreate = await axios.post(SERVICE.TYPEMASTERDOCUMENT_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        name: String(typemaster.name),
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
          },
        ],
      });
      await fetchTypemaster();
      setTypemaster({ ...typemaster, name: '' });
      setPopupContent('Added Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
      setIsBtn(false);
    } catch (err) {
      setIsBtn(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //submit option for saving
  const handleSubmit = (e) => {
    e.preventDefault();
    const isNameMatch = typemasters.some((item) => item.name.toLowerCase() === typemaster.name.toLowerCase());
    if (typemaster.name === '') {
      setPopupContentMalert('Please Enter Name');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert('Name already Exists!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      sendRequest();
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    setTypemaster({ name: '' });
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
    if (reason && reason === 'backdropClick') return;
    setIsEditOpen(false);
  };

  // info model
  const [openInfo, setOpeninfo] = useState(false);

  const handleClickOpeninfo = () => {
    setOpeninfo(true);
  };
  const handleCloseinfo = () => {
    setOpeninfo(false);
  };

  //get single row to edit....
  const getCode = async (e, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.TYPEMASTERDOCUMENT_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTypemasterEdit(res?.data?.stypemasterdocument);
      setOvProj(res?.data?.stypemasterdocument?.name);
      getOverallEditSection(res?.data?.stypemasterdocument?.name);
      handleClickOpenEdit();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const [ovProj, setOvProj] = useState('');
  const [ovProjCount, setOvProjCount] = useState('');
  const [getOverAllCount, setGetOverallCount] = useState('');
  //overall edit section for all pages
  const getOverallEditSection = async (typename) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.TYPEMASTER_DOCUMENTS_OVERALL_EDIT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        oldname: typename,
      });
      setOvProjCount(res.data.count);
      // setDocindex(Number(docindex));
      console.log(res?.data, 'Res?.data')
      setGetOverallCount(` ${typename} is linked in 
         ${res.data.docCategory?.length > 0 ? 'Document Category ,' : ''}  
         ${res.data.assignDoc?.length > 0 ? 'Assign Document ,' : ''}  
         ${res.data.addDoc?.length > 0 ? 'Add Document' : ''}  
       whether you want to do changes ..??`);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };


  //overall edit section for all pages
  const getOverallEditSectionUpdate = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.TYPEMASTER_DOCUMENTS_OVERALL_EDIT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        oldname: ovProj,
      });
      sendEditRequestOverall(res.data.docCategory, res.data.assignDoc, res.data.addDoc);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const sendEditRequestOverall = async (docCategory, assignDoc, addDoc) => {
    setPageName(!pageName);
    try {
      if (docCategory.length > 0) {
        let answ = docCategory.map((d, i) => {
          const typename = d?.typemastername?.filter(data => data !== ovProj)
          let res = axios.put(`${SERVICE.CATEGORYDOCUMENT_SINGLE}/${d._id}`, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            typemastername: [...typename, typemasterEdit.name],
          });
        });
      }
      if (assignDoc.length > 0) {
        let answ = assignDoc.map((d, i) => {
          const typename = d?.typemastername?.filter(data => data !== ovProj)
          let res = axios.put(`${SERVICE.ASSIGNDOCUMENT_SINGLE}/${d._id}`, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            type: typemasterEdit.name,
          });
        });
      }
      if (addDoc.length > 0) {
        let answ = addDoc.map((d, i) => {
          const typename = d?.typemastername?.filter(data => data !== ovProj)
          let res = axios.put(`${SERVICE.DOCUMENT_SINGLE}/${d._id}`, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            type: typemasterEdit.name,
          });
        });
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };




  // get single row to view....
  const getviewCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.TYPEMASTERDOCUMENT_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTypemasterEdit(res?.data?.stypemasterdocument);
      handleClickOpenview();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  // get single row to view....
  const getinfoCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.TYPEMASTERDOCUMENT_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTypemasterEdit(res?.data?.stypemasterdocument);
      handleClickOpeninfo();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //Project updateby edit page...
  let updateby = typemasterEdit?.updatedby;
  let addedby = typemasterEdit?.addedby;
  let subprojectsid = typemasterEdit?._id;

  //editing the single data...
  const sendEditRequest = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.put(`${SERVICE.TYPEMASTERDOCUMENT_SINGLE}/${subprojectsid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        name: String(typemasterEdit.name),
        updatedby: [
          ...updateby,
          {
            name: String(isUserRoleAccess.companyname),
          },
        ],
      });
      await fetchTypemaster();
      await getOverallEditSectionUpdate();
      await fetchTypemasterAll();
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
    fetchTypemasterAll();
    const isNameMatch = allTypemasteredit.some((item) => item.name.toLowerCase() === typemasterEdit.name.toLowerCase());
    if (typemasterEdit.name === '') {
      setPopupContentMalert('Please Enter Name');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert('Name already Exists!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if (typemasterEdit.name != ovProj && ovProjCount > 0) {
      setShowAlertpop(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{getOverAllCount}</p>
        </>
      );
      handleClickOpenerrpop();
      // setPopupContentMalert(`${conditon + getOverAllCount}`);
      // setPopupSeverityMalert("info");
      // handleClickOpenPopupMalert();
    } else {

      sendEditRequest();
    }
  };

  //get all Sub vendormasters.
  const fetchTypemaster = async () => {
    setPageName(!pageName);
    setTypemastercheck(true);
    try {
      let res_vendor = await axios.get(SERVICE.TYPEMASTERDOCUMENT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTypemastercheck(false);
      setTypemasters(res_vendor?.data?.typemasterdouments);
    } catch (err) {
      setTypemastercheck(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //get all Sub vendormasters.
  const fetchTypemasterAll = async () => {
    setPageName(!pageName);
    try {
      let res_meet = await axios.get(SERVICE.TYPEMASTERDOCUMENT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setAllTypemasteredit(res_meet?.data?.typemasterdouments.filter((item) => item._id !== typemasterEdit._id));
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Type Master Document',
    pageStyle: 'print',
  });

  useEffect(() => {
    fetchTypemaster();
  }, []);

  useEffect(() => {
    fetchTypemasterAll();
  }, [isEditOpen, typemasterEdit]);

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, []);

  const [items, setItems] = useState([]);

  const addSerialNumber = () => {
    const itemsWithSerialNumber = typemasters?.map((item, index) => ({
      ...item,
      serialNumber: index + 1,
    }));
    setItems(itemsWithSerialNumber);
  };

  useEffect(() => {
    addSerialNumber();
  }, [typemasters]);

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
      width: 100,
      hide: !columnVisibility.serialNumber,
      headerClassName: 'bold-header',
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 0,
      width: 250,
      hide: !columnVisibility.name,
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
          {isUserRoleCompare?.includes('etypemasterdocument') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getCode(params.row.id, params.row.name);
              }}
            >
              <EditOutlinedIcon sx={buttonStyles.buttonedit} />
            </Button>
          )}
          {isUserRoleCompare?.includes('dtypemasterdocument') && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.row.id, params.row.name);
              }}
            >
              <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />
            </Button>
          )}
          {isUserRoleCompare?.includes('vtypemasterdocument') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getviewCode(params.row.id);
              }}
            >
              <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />
            </Button>
          )}
          {isUserRoleCompare?.includes('itypemasterdocument') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getinfoCode(params.row.id);
              }}
            >
              <InfoOutlinedIcon sx={buttonStyles.buttoninfo} />
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
      name: item.name,
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
              Hide All
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Box>
  );
  return (
    <Box>
      <Headtitle title={'Type Master Document'} />
      <PageHeading title="Type Master Document" modulename="Documents" submodulename="Type Master Document" mainpagename="" subpagename="" subsubpagename="" />
      {isUserRoleCompare?.includes('atypemasterdocument') && (
        <>
          <Box sx={userStyle.dialogbox}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>Add Type Master Document</Typography>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={3}>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Name <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Please Enter Name"
                      value={typemaster.name}
                      onChange={(e) => {
                        setTypemaster({
                          ...typemaster,
                          name: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12} marginTop={3}>
                  <Grid container spacing={3}>
                    <Grid item md={4} xs={12} sm={6}>
                      <Button
                        variant="contained"
                        sx={buttonStyles.buttonsubmit}
                        onClick={(e) => {
                          handleSubmit(e);
                        }}
                        disabled={isBtn}
                      >
                        Submit
                      </Button>
                    </Grid>
                    <Grid item md={4} xs={12} sm={6}>
                      <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                        Clear
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <br />
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
          sx={{
            overflow: 'visible',
            '& .MuiPaper-root': {
              overflow: 'visible',
            },
          }}
        >
          <Box sx={{ padding: '20px' }}>
            <>
              <form onSubmit={editSubmit}>
                <Grid container spacing={2}>
                  <Grid item md={12} xs={12} sm={12}>
                    <Typography sx={userStyle.HeaderText}>Edit Type Master Document</Typography>
                  </Grid>
                </Grid>
                <br />
                <Grid container spacing={2}>
                  <Grid item md={8} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Name <b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Please Enter Name"
                        value={typemasterEdit.name}
                        onChange={(e) => {
                          setTypemasterEdit({
                            ...typemasterEdit,
                            name: e.target.value,
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <br />

                <br />

                <Grid container spacing={2}>
                  <Grid item md={6} xs={6} sm={6}>
                    <Button variant="contained" sx={buttonStyles.buttonsubmit} type="submit">
                      Update
                    </Button>
                  </Grid>
                  <Grid item md={6} xs={6} sm={6}>
                    <Button sx={buttonStyles.btncancel} onClick={handleCloseModEdit}>
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </>
          </Box>
        </Dialog>
      </Box>
      <br />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes('ltypemasterdocument') && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Type Master Document List</Typography>
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
                    {/* <MenuItem value={typemasters?.length}>All</MenuItem> */}
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
                  {isUserRoleCompare?.includes('exceltypemasterdocument') && (
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
                  {isUserRoleCompare?.includes('csvtypemasterdocument') && (
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
                  {isUserRoleCompare?.includes('printtypemasterdocument') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('pdftypemasterdocument') && (
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
                  {isUserRoleCompare?.includes('imagetypemasterdocument') && (
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
            {isUserRoleCompare?.includes('bdtypemasterdocument') && (
              <Button variant="contained" sx={buttonStyles.buttonbulkdelete} onClick={handleClickOpenalert}>
                Bulk Delete
              </Button>
            )}
            <br />
            {typemasterCheck ? (
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

      {/* view model */}
      <Dialog open={openview} onClose={handleClickOpenview} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="md">
        <Box sx={{ width: '450px', padding: '20px 50px' }}>
          <>
            <Typography sx={userStyle.HeaderText}> View Meeting Type master</Typography>
            <br />
            <Grid container spacing={2}>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Name</Typography>
                  <Typography>{typemasterEdit.name}</Typography>
                </FormControl>
              </Grid>
            </Grid>
            <br />
            <br />
            <Grid container spacing={2}>
              <Button variant="contained" sx={buttonStyles.btncancel} onClick={handleCloseview}>
                {' '}
                Back{' '}
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>

      {/* ALERT DIALOG */}
      <Box>
        <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">{showAlert}</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="error" onClick={handleCloseerr}>
              ok
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* ALERT DIALOG */}
      <Box>
        <Dialog open={isErrorOpenpop} onClose={handleCloseerrpop} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">{showAlertpop}</Typography>
          </DialogContent>
          <DialogActions>
            <Grid>
              <Button
                variant="contained"
                // style={{
                //   padding: "7px 13px",
                //   color: "white",
                //   background: "rgb(25, 118, 210)",
                // }}
                sx={buttonStyles.buttonsubmit}
                onClick={() => {
                  sendEditRequest();
                  handleCloseerrpop();
                }}
              >
                ok
              </Button>
            </Grid>

            <Button sx={buttonStyles.btncancel} onClick={handleCloseerrpop}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Box>
        <>
          <Box>
            {/* ALERT DIALOG */}
            <Dialog open={isCheckOpen} onClose={handleCloseCheck} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
              <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
                <ErrorOutlineOutlinedIcon sx={{ fontSize: '80px', color: 'orange' }} />

                <Typography variant="h6" sx={{ color: 'black', textAlign: 'center' }}>
                  {checkdoc > 0 ? (
                    <>
                      <span style={{ fontWeight: '700', color: '#777' }}>{`${deleteType?.name} `}</span>was linked in <span style={{ fontWeight: '700' }}>{deletePages}</span>{' '}
                    </>
                  ) : (
                    ''
                  )}
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
                      <Button variant="contained" color="error" onClick={(e) => delTypecheckbox(e)} sx={buttonStyles.buttonsubmit}>
                        {' '}
                        OK{' '}
                      </Button>
                    </>
                  ) : (
                    <Button variant="contained" color="error" onClick={handleCloseModcheckbox} sx={buttonStyles.btncancel}>
                      Ok
                    </Button>
                  )}
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
        filteredDataTwo={rowDataTable ?? []}
        itemsTwo={typemasters ?? []}
        filename={'Type Master Document'}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
      {/* INFO */}
      <InfoPopup openInfo={openInfo} handleCloseinfo={handleCloseinfo} heading="Type Master Document Info" addedby={addedby} updateby={updateby} />
      {/*SINGLE DELETE ALERT DIALOG ARE YOU SURE? */}
      <DeleteConfirmation open={isDeleteOpen} onClose={handleCloseMod} onConfirm={delType} title="Are you sure?" confirmButtonText="Yes" cancelButtonText="Cancel" />
      {/*BULK DELETE ALERT DIALOG ARE YOU SURE? */}
      {/* <DeleteConfirmation open={isDeleteOpencheckbox} onClose={handleCloseModcheckbox} onConfirm={delTypecheckbox} title="Are you sure?" confirmButtonText="Yes" cancelButtonText="Cancel" /> */}
      {/* PLEASE SELECT ANY ROW */}
      <PleaseSelectRow open={isDeleteOpenalert} onClose={handleCloseModalert} message="Please Select any Row" iconColor="orange" buttonText="OK" />
      {/* EXTERNAL COMPONENTS -------------- END */}
      <br />
    </Box>
  );
}

export default TypeMasterDocument;
