import React, { useState, useEffect, useRef, useContext } from 'react';
import { Box, Typography, OutlinedInput, FormControlLabel, Select, MenuItem, Dialog, TextareaAutosize, DialogContent, DialogActions, FormControl, Grid, Button, List, ListItem, ListItemText, Popover, Checkbox, TextField, IconButton } from '@mui/material';
import { userStyle, colourStyles } from '../../pageStyle';
import StyledDataGrid from '../../components/TableStyle';
import { FaFileCsv, FaFileExcel, FaPrint, FaFilePdf } from 'react-icons/fa';
import { handleApiError } from '../../components/Errorhandling';
import LoadingButton from '@mui/lab/LoadingButton';
import { menuItems } from "../../components/menuItemsList";

import Selects from 'react-select';
import 'jspdf-autotable';
import axios from '../../axiosInstance';
import { SERVICE } from '../../services/Baseservice';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useReactToPrint } from 'react-to-print';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { UserRoleAccessContext, AuthContext } from '../../context/Appcontext';
import Headtitle from '../../components/Headtitle';
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
import ExportData from '../../components/ExportData';
import AlertDialog from '../../components/Alert';
import MessageAlert from '../../components/MessageAlert';
import InfoPopup from '../../components/InfoPopup.js';
import { DeleteConfirmation, PleaseSelectRow } from '../../components/DeleteConfirmation.js';
import PageHeading from '../../components/PageHeading';
import { getCurrentServerTime } from '../../components/getCurrentServerTime';


function TaskSubcategory() {

  function filterTaskAddedMenus(menus) {
    return menus
      .map((item) => {
        if (item.submenu && Array.isArray(item.submenu)) {
          const filteredSubmenu = filterTaskAddedMenus(item.submenu);

          // Keep this item only if filtered submenu has taskmenu-true items
          if (filteredSubmenu.length > 0) {
            return {
              ...item,
              submenu: filteredSubmenu
            };
          } else {
            return null;
          }
        } else {
          // Only keep leaf if taskmenu is true
          return item.taskmenu ? item : null;
        }
      })
      .filter(Boolean);
  }


  // Usage
  const filteredMenu = filterTaskAddedMenus(menuItems);
  console.log(filteredMenu);

  const pathname = window.location.pathname;
  const [TaskSubCateValue, setTaskSubCateValue] = useState({
    module: "Please Select Module",
    submodule: "Please Select Sub Module",
    mainpage: "Please Select Main Page",
    subpage: "Please Select Sub Page",
    subsubpage: "Please Select Sub Sub Page"
  });
  const [subModuleOptions, setSubModuleOptions] = useState([]);
  const [mainPageoptions, setMainPageoptions] = useState([]);
  const [subPageoptions, setSubPageoptions] = useState([]);
  const [subSubPageoptions, setsubSubPageoptions] = useState([]);
  //single select fetch Submodule
  const handleModuleNameChange = (submenu) => {
    const subMenuOptions = submenu ? submenu?.map(data => ({ label: data?.title, value: data?.title, submenu: data?.submenu })) : []
    setSubModuleOptions(subMenuOptions);
  };
  const handleSubModuleNameChange = (submenu) => {
    const subMenuOptions = submenu ? submenu?.map(data => ({ label: data?.title, value: data?.title, submenu: data?.submenu })) : []
    setMainPageoptions(subMenuOptions);
  };
  const handleMainPageChange = (submenu) => {
    console.log(submenu, "submenu")
    const subMenuOptions = submenu ? submenu?.map(data => ({ label: data?.title, value: data?.title, submenu: data?.submenu })) : []

    setSubPageoptions(subMenuOptions);
  };
  const handleSubPageNameChange = (submenu) => {
    const subMenuOptions = submenu ? submenu?.map(data => ({ label: data?.title, value: data?.title, submenu: data?.submenu })) : []
    setsubSubPageoptions(subMenuOptions);
  };


  const [TaskSubCateValueEdit, setTaskSubCateValueEdit] = useState({
    module: "Please Select Module",
    submodule: "Please Select Sub Module",
    mainpage: "Please Select Main Page",
    subpage: "Please Select Sub Page",
    subsubpage: "Please Select Sub Sub Page"
  });
  const [subModuleOptionsEdit, setSubModuleOptionsEdit] = useState([]);
  const [mainPageoptionsEdit, setMainPageoptionsEdit] = useState([]);
  const [subPageoptionsEdit, setSubPageoptionsEdit] = useState([]);
  const [subSubPageoptionsEdit, setsubSubPageoptionsEdit] = useState([]);
  //single select fetch Submodule
  const handleModuleNameChangeEdit = (submenu) => {
    const subMenuOptions = submenu ? submenu?.map(data => ({ label: data?.title, value: data?.title, submenu: data?.submenu })) : []
    setSubModuleOptionsEdit(subMenuOptions);
  };
  const handleSubModuleNameChangeEdit = (submenu = []) => {
    const subMenuOptions = submenu ? submenu?.map(data => ({ label: data?.title, value: data?.title, submenu: data?.submenu })) : []
    setMainPageoptionsEdit(subMenuOptions);
  };
  const handleMainPageChangeEdit = (submenu) => {
    console.log(submenu, "submenu")
    const subMenuOptions = submenu ? submenu?.map(data => ({ label: data?.title, value: data?.title, submenu: data?.submenu })) : []

    setSubPageoptionsEdit(subMenuOptions);
  };
  const handleSubPageNameChangeEdit = (submenu) => {
    const subMenuOptions = submenu ? submenu?.map(data => ({ label: data?.title, value: data?.title, submenu: data?.submenu })) : []
    setsubSubPageoptionsEdit(subMenuOptions);
  };




  // const handleMainPageNameChange = (modulename, submodulename, mainpage) => {
  //   // setSubPageoptions([]);
  // };


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

  let exportColumnNames = [ 'Module', 'Submodule', 'Mainpage', 'Subpage', 'Subsubpage','Category', 'Name', 'Description'];
  let exportRowValues = ['module', 'submodule', 'mainpage', 'subpage', 'subsubpage','category', 'subcategoryname', 'description'];

  const getapi = async () => {
    const NewDatetime = await getCurrentServerTime();
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String('Task Subcategory'),
      commonid: String(isUserRoleAccess?._id),
      date: String(new Date(NewDatetime)),
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

  const [tasksubcategory, setTasksubcategory] = useState({ category: 'Please Select Category', subcategoryname: '', description: '' });
  const [tasksubcategoryEdit, setTasksubcategoryEdit] = useState({});
  const [tasksubcategorys, setTasksubcategorys] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allTasksubcategoryedit, setAllTasksubcategoryedit] = useState([]);
  const [category, setCategory] = useState([]);
  const [categoryEdit, setCategoryEdit] = useState([]);
  const [isBtn, setIsBtn] = useState(false);
  const { isUserRoleCompare, isUserRoleAccess, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);
  const [tasksubcategoryCheck, setTasksubcategorycheck] = useState(false);
  const username = isUserRoleAccess.username;
  const gridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  const [ovSubcategory, setOvSubcategory] = useState('');
  const [getOverAllCount, setGetOverallCount] = useState('');
  const [ovProjCount, setOvProjCount] = useState('');
  const [getOverAllCountDelete, setGetOverallCountDelete] = useState('');
  const [searchQueryManage, setSearchQueryManage] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
  const [fileFormat, setFormat] = useState('');

  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };
  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };

  //image
  const handleCaptureImage = () => {
    if (gridRef.current) {
      html2canvas(gridRef.current).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, 'Task Subcategory.png');
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
    setIsBtn(false);
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
    subcategoryname: true,
    description: true,
    actions: true,
    module: true,
    submodule: true,
    mainpage: true,
    subpage: true,
    subsubpage: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ''; // This is required for Chrome support
  };

  const fetchTaskcategory = async () => {
    setPageName(!pageName);
    try {
      let task = await axios.get(SERVICE.TASKCATEGORY, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const categoryall = [
        ...task?.data?.taskcategorys?.map((d) => ({
          ...d,
          label: d.categoryname,
          value: d.categoryname,
        })),
      ];
      setCategory(categoryall);
      setCategoryEdit(categoryall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchTaskcategory();
  }, []);

  const [deleteSubcategroy, setDeleteSubcategory] = useState('');

  const rowData = async (id, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.TASKSUBCATEGORY_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDeleteSubcategory(res?.data?.stasksubcategory);
      getOverallEditSectionDelete(res?.data?.stasksubcategory?.subcategoryname);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Alert delete popup
  let tasksubcategorysid = deleteSubcategroy?._id;
  const delTaskSubcategory = async (e) => {
    setPageName(!pageName);
    try {
      await axios.delete(`${SERVICE.TASKSUBCATEGORY_SINGLE}/${tasksubcategorysid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      await fetchTasksubcategory();
      handleCloseMod();
      setSelectedRows([]);
      setPage(1);
      setPopupContent('Deleted Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const delTaskSubcheckbox = async () => {
    setPageName(!pageName);
    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(`${SERVICE.TASKSUBCATEGORY_SINGLE}/${item}`, {
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
      await fetchTasksubcategory();
      setPopupContent('Deleted Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //overall edit section for all pages
  const getOverallEditSectionOverallDelete = async (ids) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.OVERALL_TASK_SUBCATEGORY_TICKET_DELETE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        id: ids,
      });
      setSelectedRows(res?.data?.result);
      setSelectedRowsCount(res?.data?.count);
      setIsDeleteOpencheckbox(true);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //overall Delete section for all pages
  const getOverallEditSectionDelete = async (subcate) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.OVERALL_TASK_SUBCATEGORY_TICKET, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        subcategory: subcate,
      });
      setGetOverallCountDelete(`This data is linked in 
                      ${res?.data?.taskdesig?.length > 0 ? 'Task Grouping ,' : ''}
                      ${res?.data?.taskschedulelog?.length > 0 ? 'Task Grouping Log ,' : ''}
                  ${res?.data?.tasknonschedule?.length > 0 ? 'Task Non-Schedule ,' : ''}
                     ${res?.data?.tasforuser?.length > 0 ? 'Task For User ,' : ''}
                     ${res?.data?.taskschedule?.length > 0 ? 'Task Schedule ,' : ''}
                     `);

      if (res?.data?.count > 0) {
        handleClickOpenCheck();
      } else {
        handleClickOpen();
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  //overall edit section for all pages
  const getOverallEditSection = async (subcate) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.OVERALL_TASK_SUBCATEGORY_TICKET, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        subcategory: subcate,
      });
      setOvProjCount(res?.data?.count);
      setGetOverallCount(`This data is linked in 
             ${res?.data?.taskdesig?.length > 0 ? 'Task Grouping ,' : ''}
             ${res?.data?.taskschedulelog?.length > 0 ? 'Task Grouping Log,' : ''}
         ${res?.data?.tasknonschedule?.length > 0 ? 'Task Non-Schedule ,' : ''}
            ${res?.data?.tasforuser?.length > 0 ? 'Task For User ,' : ''}
            ${res?.data?.taskschedule?.length > 0 ? 'Task Schedule ,' : ''}
             whether you want to do changes ..??`);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //overall edit section for all pages
  const getOverallEditSectionUpdate = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.OVERALL_TASK_SUBCATEGORY_TICKET, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        subcategory: ovSubcategory,
      });
      sendEditRequestOverall(res?.data?.taskdesig, res?.data?.taskschedulelog, res?.data?.tasknonschedule, res?.data?.tasforuser, res?.data?.taskschedule);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const sendEditRequestOverall = async (taskdesig, taskschedulelog, tasknonschedule, taskforuser, taskschedule) => {
    try {
      if (taskdesig?.length > 0) {
        let answ = taskdesig.map((d, i) => {
          let res = axios.put(`${SERVICE.SINGLE_TASKDESIGNATIONGROUPING}/${d._id}`, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            subcategory: tasksubcategoryEdit.subcategoryname,
          });
        });
      }
      if (taskschedulelog?.length > 0) {
        let answ = taskschedulelog.map((d, i) => {
          const answer = d?.taskdesignationlog?.filter((data) => data?.subcategory !== ovSubcategory);
          const answerCate = d?.taskdesignationlog
            ?.filter((data) => data?.subcategory === ovSubcategory)
            ?.map((item) => {
              return { ...item, subcategory: tasksubcategoryEdit.subcategoryname };
            });
          let res = axios.put(`${SERVICE.SINGLE_TASKDESIGNATIONGROUPING}/${d._id}`, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            taskdesignationlog: [...answer, ...answerCate],
          });
        });
      }
      if (tasknonschedule?.length > 0) {
        let answ = tasknonschedule.map((d, i) => {
          let res = axios.put(`${SERVICE.SINGLE_TASK_NONSCHEDULEGROUPING}/${d._id}`, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            subcategory: tasksubcategoryEdit.subcategoryname,
          });
        });
      }
      if (taskforuser.length > 0) {
        let answ = taskforuser.map((d, i) => {
          let res = axios.put(`${SERVICE.SINGLE_TASKFORUSER}/${d._id}`, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            subcategory: tasksubcategoryEdit.subcategoryname,
          });
        });
      }
      if (taskschedule.length > 0) {
        let answ = taskschedule.map((d, i) => {
          let res = axios.put(`${SERVICE.SINGLE_TASKSCHEDULEGROUPING}/${d._id}`, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            subcategory: tasksubcategoryEdit.subcategoryname,
          });
        });
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //add function
  const sendRequest = async () => {
    setPageName(!pageName);
    setIsBtn(true);
    try {
      let subprojectscreate = await axios.post(SERVICE.TASKSUBCATEGORY_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        category: String(tasksubcategory.category),
        moduleSelect: Boolean(moduleSelect),
        subcategoryname: String(tasksubcategory.subcategoryname),
        description: String(tasksubcategory.description),
        module: String(TaskSubCateValue.module) === "Please Select Module" ? "" : TaskSubCateValue.module,
        submodule: String(TaskSubCateValue.submodule) === "Please Select Sub Module" ? "" : TaskSubCateValue.submodule,
        mainpage: String(TaskSubCateValue.mainpage) === "Please Select Main Page" ? "" : TaskSubCateValue.mainpage,
        subpage: String(TaskSubCateValue.subpage) === "Please Select Sub Page" ? "" : TaskSubCateValue.subpage,
        subsubpage: String(TaskSubCateValue.subsubpage) === "Please Select Sub Sub Page" ? "" : TaskSubCateValue.subsubpage,
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
          },
        ],
      });
      await fetchTasksubcategory();

      setTaskSubCateValue({
        module: "Please Select Module",
        submodule: "Please Select Sub Module",
        mainpage: "Please Select Main Page",
        subpage: "Please Select Sub Page",
        subsubpage: "Please Select Sub Sub Page"
      });
      setSubModuleOptions([])
      setMainPageoptions([])
      setSubPageoptions([])
      setsubSubPageoptions([])

      setModuleSelect(false)
      setTasksubcategory({ ...tasksubcategory, subcategoryname: '', description: '' });
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
    const isNameMatch = tasksubcategorys.some((item) => item.subcategoryname.toLowerCase() === tasksubcategory.subcategoryname.toLowerCase() && item.category === String(tasksubcategory.category));

    if (!moduleSelect && filteredMenu?.length > 0 && (TaskSubCateValue.module === 'Please Select Module' || TaskSubCateValue.module === "")) {
      setPopupContentMalert('Please Select Module');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if (!moduleSelect && filteredMenu?.length > 0 && (TaskSubCateValue.submodule === 'Please Select Sub Module' || TaskSubCateValue.submodule === "") && subModuleOptions?.length > 0) {
      setPopupContentMalert('Please Select Sub Module');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if (!moduleSelect && filteredMenu?.length > 0 && (TaskSubCateValue.mainpage === 'Please Select Main Page' || TaskSubCateValue.mainpage === "") && mainPageoptions?.length > 0) {
      setPopupContentMalert('Please Select Main Page');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if (!moduleSelect && filteredMenu?.length > 0 && (TaskSubCateValue.subpage === 'Please Select Sub Page' || TaskSubCateValue.subpage === "") && subPageoptions?.length > 0) {
      setPopupContentMalert('Please Select Sub Page');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if (!moduleSelect && filteredMenu?.length > 0 && (TaskSubCateValue.subsubpage === 'Please Select Sub Sub Page' || TaskSubCateValue.subsubpage === "") && subSubPageoptions?.length > 0) {
      setPopupContentMalert('Please Select Sub Sub Page');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if (tasksubcategory.category === '' || tasksubcategory.category === 'Please Select Category') {
      setPopupContentMalert('Please Select  Category');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if (tasksubcategory.subcategoryname === '') {
      setPopupContentMalert('Please Enter Name');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if (isNameMatch) {
      setPopupContentMalert('Name Already Exists!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      sendRequest();
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    setTaskSubCateValue({
      module: "Please Select Module",
      submodule: "Please Select Sub Module",
      mainpage: "Please Select Main Page",
      subpage: "Please Select Sub Page",
      subsubpage: "Please Select Sub Sub Page"
    });
    setSubModuleOptions([])
    setMainPageoptions([])
    setSubPageoptions([])
    setsubSubPageoptions([])
    setModuleSelect(false)
    setTasksubcategory({ category: 'Please Select Category', subcategoryname: '', description: '' });
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

  //get single row to edit....
  const getCode = async (e, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.TASKSUBCATEGORY_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const subCate = res?.data?.stasksubcategory;
      setModuleSelectEdit(subCate?.moduleSelect)
      if (filteredMenu?.length > 0) {
        const subModuleMenu = filteredMenu.find(data => data?.title === subCate?.module);
        subModuleMenu?.submenu && handleModuleNameChangeEdit(subModuleMenu.submenu);

        const mainPageMenu = subModuleMenu?.submenu?.find(data => data?.title === subCate?.submodule);
        mainPageMenu?.submenu && handleSubModuleNameChangeEdit(mainPageMenu.submenu);

        const subPageMenu = mainPageMenu?.submenu?.find(data => data?.title === subCate?.mainpage);
        subPageMenu?.submenu && handleMainPageChangeEdit(subPageMenu.submenu);

        const subSubPageMenu = subPageMenu?.submenu?.find(data => data?.title === subCate?.subpage);
        subSubPageMenu?.submenu && handleMainPageChangeEdit(subSubPageMenu.submenu);
      }
      setTaskSubCateValueEdit({
        module: subCate?.module ? subCate?.module : "Please Select Module",
        submodule: subCate?.submodule ? subCate?.submodule : "Please Select Sub Module",
        mainpage: subCate?.mainpage ? subCate?.mainpage : "Please Select Main Page",
        subpage: subCate?.subpage ? subCate?.subpage : "Please Select Sub Page",
        subsubpage: subCate?.subsubpage ? subCate?.subsubpage : "Please Select Sub Sub Page"
      })
      setTasksubcategoryEdit(res?.data?.stasksubcategory);
      getOverallEditSection(res?.data?.stasksubcategory?.subcategoryname);
      setOvSubcategory(res?.data?.stasksubcategory?.subcategoryname);
      handleClickOpenEdit();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // get single row to view....
  const getviewCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.TASKSUBCATEGORY_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTasksubcategoryEdit(res?.data?.stasksubcategory);
      handleClickOpenview();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  // get single row to view....
  const getinfoCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.TASKSUBCATEGORY_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTasksubcategoryEdit(res?.data?.stasksubcategory);
      handleClickOpeninfo();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //Project updateby edit page...
  let updateby = tasksubcategoryEdit?.updatedby;
  let addedby = tasksubcategoryEdit?.addedby;
  let subprojectsid = tasksubcategoryEdit?._id;

  //editing the single data...
  const sendEditRequest = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.put(`${SERVICE.TASKSUBCATEGORY_SINGLE}/${subprojectsid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        category: String(tasksubcategoryEdit.category),
        moduleSelect: moduleSelectEdit,
        subcategoryname: String(tasksubcategoryEdit.subcategoryname),
        description: String(tasksubcategoryEdit.description),
        module: String(TaskSubCateValueEdit.module) === "Please Select Module" ? "" : TaskSubCateValueEdit.module,
        submodule: String(TaskSubCateValueEdit.submodule) === "Please Select Sub Module" ? "" : TaskSubCateValueEdit.submodule,
        mainpage: String(TaskSubCateValueEdit.mainpage) === "Please Select Main Page" ? "" : TaskSubCateValueEdit.mainpage,
        subpage: String(TaskSubCateValueEdit.subpage) === "Please Select Sub Page" ? "" : TaskSubCateValueEdit.subpage,
        subsubpage: String(TaskSubCateValueEdit.subsubpage) === "Please Select Sub Sub Page" ? "" : TaskSubCateValueEdit.subsubpage,
        updatedby: [
          ...updateby,
          {
            name: String(isUserRoleAccess.companyname),
          },
        ],
      });
      await fetchTasksubcategory();
      getOverallEditSectionUpdate();
      handleCloseModEdit();
      setPopupContent('Updated Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
      setModuleSelectEdit(false)
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const editSubmit = (e) => {
    e.preventDefault();
    fetchTasksubcategoryAll();
    const isNameMatch = allTasksubcategoryedit.some((item) => item.subcategoryname.toLowerCase() === tasksubcategoryEdit.subcategoryname.toLowerCase() && item.category === String(tasksubcategoryEdit.category));

    if (!moduleSelectEdit && filteredMenu?.length > 0 && (TaskSubCateValueEdit.module === 'Please Select Module' || TaskSubCateValueEdit.module === "")) {
      setPopupContentMalert('Please Select Module');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if (!moduleSelectEdit && filteredMenu?.length > 0 && (TaskSubCateValueEdit.submodule === 'Please Select Sub Module' || TaskSubCateValueEdit.submodule === "") && subModuleOptionsEdit?.length > 0) {
      setPopupContentMalert('Please Select Sub Module');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if (!moduleSelectEdit && filteredMenu?.length > 0 && (TaskSubCateValueEdit.mainpage === 'Please Select Main Page' || TaskSubCateValueEdit.mainpage === "") && mainPageoptionsEdit?.length > 0) {
      setPopupContentMalert('Please Select Main Page');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if (!moduleSelectEdit && filteredMenu?.length > 0 && (TaskSubCateValueEdit.subpage === 'Please Select Sub Page' || TaskSubCateValueEdit.subpage === "") && subPageoptionsEdit?.length > 0) {
      setPopupContentMalert('Please Select Sub Page');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if (!moduleSelectEdit && filteredMenu?.length > 0 && (TaskSubCateValueEdit.subsubpage === 'Please Select Sub Sub Page' || TaskSubCateValueEdit.subsubpage === "") && subSubPageoptionsEdit?.length > 0) {
      setPopupContentMalert('Please Select Sub Sub Page');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if (tasksubcategoryEdit.category === '' || tasksubcategoryEdit.category === 'Please Select Category') {
      setPopupContentMalert('Please Select  Category');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (tasksubcategoryEdit.subcategoryname === '') {
      setPopupContentMalert('Please Enter Name');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert('Name Already Exists!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (tasksubcategoryEdit.subcategoryname != ovSubcategory && ovProjCount > 0) {
      setShowAlertpop(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{getOverAllCount}</p>
        </>
      );
      handleClickOpenerrpop();
    } else {
      sendEditRequest();
    }
  };

  //get all Sub vendormasters.
  const fetchTasksubcategory = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.get(SERVICE.TASKSUBCATEGORY, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTasksubcategorycheck(true);
      setTasksubcategorys(res_vendor?.data?.tasksubcategorys);
    } catch (err) {
      setTasksubcategorycheck(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //get all Sub vendormasters.
  const fetchTasksubcategoryAll = async () => {
    setPageName(!pageName);
    try {
      let res_meet = await axios.get(SERVICE.TASKSUBCATEGORY, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setAllTasksubcategoryedit(res_meet?.data?.tasksubcategorys.filter((item) => item._id !== tasksubcategoryEdit._id));
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Task Subcategory',
    pageStyle: 'print',
  });

  useEffect(() => {
    fetchTasksubcategory();
    fetchTasksubcategoryAll();
  }, []);

  useEffect(() => {
    fetchTasksubcategoryAll();
  }, [isEditOpen, tasksubcategoryEdit]);

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, []);

  const [items, setItems] = useState([]);

  const addSerialNumber = () => {
    const itemsWithSerialNumber = tasksubcategorys?.map((item, index) => ({ ...item, serialNumber: index + 1 }));
    setItems(itemsWithSerialNumber);
  };

  useEffect(() => {
    addSerialNumber();
  }, [tasksubcategorys]);

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
  const [moduleSelect, setModuleSelect] = useState(false);
  const [moduleSelectEdit, setModuleSelectEdit] = useState(false);

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
    { field: 'module', headerName: 'Module', flex: 0, width: 250, hide: !columnVisibility.module, headerClassName: 'bold-header' },
    { field: 'submodule', headerName: 'Submodule', flex: 0, width: 250, hide: !columnVisibility.submodule, headerClassName: 'bold-header' },
    { field: 'mainpage', headerName: 'Mainpage', flex: 0, width: 250, hide: !columnVisibility.mainpage, headerClassName: 'bold-header' },
    { field: 'subpage', headerName: 'Subpage', flex: 0, width: 250, hide: !columnVisibility.subpage, headerClassName: 'bold-header' },
    { field: 'subsubpage', headerName: 'Subsubpage', flex: 0, width: 250, hide: !columnVisibility.subsubpage, headerClassName: 'bold-header' },
    { field: 'category', headerName: 'Category', flex: 0, width: 250, hide: !columnVisibility.category, headerClassName: 'bold-header' },
    { field: 'subcategoryname', headerName: 'Name', flex: 0, width: 250, hide: !columnVisibility.subcategoryname, headerClassName: 'bold-header' },
    { field: 'description', headerName: 'Description', flex: 0, width: 250, hide: !columnVisibility.description, headerClassName: 'bold-header' },

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
          {isUserRoleCompare?.includes('etasksubcategory') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getCode(params.row.id, params.row.name);
              }}
            >
              <EditOutlinedIcon sx={buttonStyles.buttonedit} />
            </Button>
          )}
          {isUserRoleCompare?.includes('dtasksubcategory') && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.row.id, params.row.name);
              }}
            >
              <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />
            </Button>
          )}
          {isUserRoleCompare?.includes('vtasksubcategory') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getviewCode(params.row.id);
              }}
            >
              <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />
            </Button>
          )}
          {isUserRoleCompare?.includes('itasksubcategory') && (
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
      category: item.category,
      subcategoryname: item.subcategoryname,
      description: item.description,
      module: item.module,
      submodule: item.submodule,
      mainpage: item.mainpage,
      subpage: item.subpage,
      subsubpage: item.subsubpage,
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

  return (
    <Box>
      <Headtitle title={'Task Subcategory'} />
      <PageHeading title="Task Subcategory" modulename="Task" submodulename="Task Subcategory" mainpagename="" subpagename="" subsubpagename="" />
      {isUserRoleCompare?.includes('atasksubcategory') && (
        <>
          <Box sx={userStyle.dialogbox}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>Add Task Subcategory </Typography>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                {!moduleSelect &&
                  <>
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Module Name <b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                          options={filteredMenu?.map((item) => {
                            return { label: item?.title, value: item?.title, submenu: item?.submenu };
                          })}
                          styles={colourStyles}
                          value={{
                            label: TaskSubCateValue.module,
                            value: TaskSubCateValue.module,
                          }}
                          onChange={(e) => {
                            setTaskSubCateValue({
                              ...TaskSubCateValue,
                              module: e.value,
                              submodule: "Please Select Sub Module",
                              mainpage: "Please Select Main Page",
                              subpage: "Please Select Sub Page",
                              subsubpage: "Please Select Sub Sub Page",
                              category: "Please Select Category",
                              subcategory: "Please Select Sub Category",
                            });
                            handleModuleNameChange(e?.submenu);
                            setMainPageoptions([]);
                            setSubPageoptions([]);
                            setsubSubPageoptions([]);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Sub Module Name<b style={{ color: "red" }}>*</b>
                        </Typography>

                        <Selects

                          options={subModuleOptions}
                          styles={colourStyles}
                          value={{
                            label: TaskSubCateValue.submodule,
                            value: TaskSubCateValue.submodule,
                          }}
                          onChange={(e) => {
                            setTaskSubCateValue({
                              ...TaskSubCateValue,
                              submodule: e.value,
                              mainpage: "Please Select Main Page",
                              subpage: "Please Select Sub Page",
                              subsubpage: "Please Select Sub Sub Page",
                              category: "Please Select Category",
                              subcategory: "Please Select Sub Category",
                            });
                            handleSubModuleNameChange(e.submenu);
                            setSubPageoptions([]);
                            setsubSubPageoptions([]);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Main Page</Typography>

                        <Selects
                          options={mainPageoptions}
                          styles={colourStyles}
                          value={{
                            label: TaskSubCateValue.mainpage,
                            value: TaskSubCateValue.mainpage,
                          }}
                          onChange={(e) => {
                            setTaskSubCateValue({
                              ...TaskSubCateValue,
                              mainpage: e.value,
                              subpage: "Please Select Sub Page",
                              subsubpage: "Please Select Sub Sub Page",
                              category: "Please Select Category",
                              subcategory: "Please Select Sub Category",
                            });
                            handleMainPageChange(e.submenu);
                            setsubSubPageoptions([]);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Sub Page</Typography>
                        <Selects
                          options={subPageoptions}
                          styles={colourStyles}
                          value={{
                            label: TaskSubCateValue.subpage,
                            value: TaskSubCateValue.subpage,
                          }}
                          onChange={(e) => {
                            setTaskSubCateValue({
                              ...TaskSubCateValue,
                              subpage: e.value,
                              subsubpage: "Please Select Sub Sub Page",
                              category: "Please Select Category",
                              subcategory: "Please Select Sub Category",
                            });
                            handleSubPageNameChange(e.submenu);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Sub Sub-Page</Typography>
                        <Selects
                          options={subSubPageoptions}
                          styles={colourStyles}
                          value={{
                            label: TaskSubCateValue.subsubpage,
                            value: TaskSubCateValue.subsubpage,
                          }}
                          onChange={(e) => {
                            setTaskSubCateValue({
                              ...TaskSubCateValue,
                              subsubpage: e.value,
                              category: "Please Select Category",
                              subcategory: "Please Select Sub Category",
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                  </>}



                <Grid item md={4} xs={12} sm={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      Category <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      options={category}
                      styles={colourStyles}
                      value={{ label: tasksubcategory.category, value: tasksubcategory.category }}
                      onChange={(e) => {
                        setTasksubcategory({ ...tasksubcategory, category: e.value });
                      }}
                    />
                  </FormControl>

                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Name <b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Please Enter Task Sub Category"
                      value={tasksubcategory.subcategoryname}
                      onChange={(e) => {
                        setTasksubcategory({ ...tasksubcategory, subcategoryname: e.target.value });
                      }}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={moduleSelect} />}
                      onChange={(e) => {
                        setModuleSelect(!moduleSelect);
                      }}
                      label="Without Module"
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Description</Typography>
                    <TextareaAutosize
                      aria-label="minimum height"
                      minRows={5}
                      value={tasksubcategory.description}
                      onChange={(e) => {
                        setTasksubcategory({ ...tasksubcategory, description: e.target.value });
                      }}
                    />
                  </FormControl>
                </Grid>
                {/* <Checkbox checked={moduleSelect} onChange={() => setModuleSelect(!moduleSelect)} /> */}

              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={3} xs={12} sm={6}>
                  <LoadingButton loading={isBtn} variant="contained" sx={buttonStyles.buttonsubmit} onClick={handleSubmit}>
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
          maxWidth="md"
          sx={{
            overflow: 'visible',
            '& .MuiPaper-root': {
              overflow: 'visible',
            },
          }}
        // sx={{ marginTop: "47px" }}
        >
          <Box sx={{ padding: '20px' }}>
            <>
              <form onSubmit={editSubmit}>
                {/* <DialogContent sx={{ width: '550px', padding: '20px' }}> */}
                <Grid container spacing={2}>
                  <Grid item md={12} xs={12} sm={12}>
                    <Typography sx={userStyle.HeaderText}>Edit Task Subcategory</Typography>
                  </Grid>
                </Grid>
                <br />
                <Grid container spacing={2}>
                  {!moduleSelectEdit &&
                    <>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Module Name <b style={{ color: "red" }}>*</b>
                          </Typography>
                          <Selects
                            options={filteredMenu?.map((item) => {
                              return { label: item?.title, value: item?.title, submenu: item?.submenu };
                            })}
                            styles={colourStyles}
                            value={{
                              label: TaskSubCateValueEdit.module,
                              value: TaskSubCateValueEdit.module,
                            }}
                            onChange={(e) => {
                              setTaskSubCateValueEdit({
                                ...TaskSubCateValueEdit,
                                module: e.value,
                                submodule: "Please Select Sub Module",
                                mainpage: "Please Select Main Page",
                                subpage: "Please Select Sub Page",
                                subsubpage: "Please Select Sub Sub Page",
                                category: "Please Select Category",
                                subcategory: "Please Select Sub Category",
                              });
                              handleModuleNameChangeEdit(e?.submenu);
                              setMainPageoptionsEdit([]);
                              setSubPageoptionsEdit([]);
                              setsubSubPageoptionsEdit([]);
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Sub Module Name<b style={{ color: "red" }}>*</b>
                          </Typography>

                          <Selects

                            options={subModuleOptionsEdit}
                            styles={colourStyles}
                            value={{
                              label: TaskSubCateValueEdit.submodule,
                              value: TaskSubCateValueEdit.submodule,
                            }}
                            onChange={(e) => {
                              setTaskSubCateValueEdit({
                                ...TaskSubCateValueEdit,
                                submodule: e.value,
                                mainpage: "Please Select Main Page",
                                subpage: "Please Select Sub Page",
                                subsubpage: "Please Select Sub Sub Page",
                                category: "Please Select Category",
                                subcategory: "Please Select Sub Category",
                              });
                              handleSubModuleNameChangeEdit(e.submenu);
                              setSubPageoptionsEdit([]);
                              setsubSubPageoptionsEdit([]);
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Main Page</Typography>

                          <Selects
                            options={mainPageoptionsEdit}
                            styles={colourStyles}
                            value={{
                              label: TaskSubCateValueEdit.mainpage,
                              value: TaskSubCateValueEdit.mainpage,
                            }}
                            onChange={(e) => {
                              setTaskSubCateValueEdit({
                                ...TaskSubCateValueEdit,
                                mainpage: e.value,
                                subpage: "Please Select Sub Page",
                                subsubpage: "Please Select Sub Sub Page",
                                category: "Please Select Category",
                                subcategory: "Please Select Sub Category",
                              });
                              handleMainPageChangeEdit(e.submenu);
                              setsubSubPageoptionsEdit([]);
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Sub Page</Typography>
                          <Selects
                            options={subPageoptionsEdit}
                            styles={colourStyles}
                            value={{
                              label: TaskSubCateValueEdit.subpage,
                              value: TaskSubCateValueEdit.subpage,
                            }}
                            onChange={(e) => {
                              setTaskSubCateValueEdit({
                                ...TaskSubCateValueEdit,
                                subpage: e.value,
                                subsubpage: "Please Select Sub Sub Page",
                                category: "Please Select Category",
                                subcategory: "Please Select Sub Category",
                              });
                              handleSubPageNameChangeEdit(e.submenu);
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Sub Sub-Page</Typography>
                          <Selects
                            options={subSubPageoptionsEdit}
                            styles={colourStyles}
                            value={{
                              label: TaskSubCateValueEdit.subsubpage,
                              value: TaskSubCateValueEdit.subsubpage,
                            }}
                            onChange={(e) => {
                              setTaskSubCateValueEdit({
                                ...TaskSubCateValueEdit,
                                subsubpage: e.value,
                                category: "Please Select Category",
                                subcategory: "Please Select Sub Category",
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                    </>}

                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl size="small" fullWidth>
                      <Typography>
                        Category<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <Selects
                        options={categoryEdit}
                        styles={colourStyles}
                        value={{ label: tasksubcategoryEdit.category, value: tasksubcategoryEdit.category }}
                        onChange={(e) => {
                          setTasksubcategoryEdit({ ...tasksubcategoryEdit, category: e.value });
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Name <b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        placeholder="Please Enter Task Sub Category"
                        value={tasksubcategoryEdit.subcategoryname}
                        onChange={(e) => {
                          setTasksubcategoryEdit({ ...tasksubcategoryEdit, subcategoryname: e.target.value });
                        }}
                      />
                    </FormControl>
                    <FormControlLabel
                      control={<Checkbox checked={moduleSelectEdit} />}
                      onChange={(e) => {
                        setModuleSelectEdit(!moduleSelectEdit);
                      }}
                      label="Without Module"
                    />
                  </Grid>
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Description</Typography>
                      <TextareaAutosize
                        aria-label="minimum height"
                        minRows={5}
                        value={tasksubcategoryEdit.description}
                        onChange={(e) => {
                          setTasksubcategoryEdit({ ...tasksubcategoryEdit, description: e.target.value });
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
                {/* </DialogContent> */}
              </form>
            </>
          </Box>
        </Dialog>
      </Box>
      <br />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes('ltasksubcategory') && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Task Subcategory List</Typography>
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
                    {/* <MenuItem value={(tasksubcategorys?.length)}>All</MenuItem> */}
                  </Select>
                </Box>
              </Grid>
              <Grid item md={8} xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box>
                  {isUserRoleCompare?.includes('exceltasksubcategory') && (
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
                  {isUserRoleCompare?.includes('csvtasksubcategory') && (
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
                  {isUserRoleCompare?.includes('printtasksubcategory') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('pdftasksubcategory') && (
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
                  {isUserRoleCompare?.includes('imagetasksubcategory') && (
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
            {isUserRoleCompare?.includes('bdtasksubcategory') && (
              <Button variant="contained" sx={buttonStyles.buttonbulkdelete} onClick={handleClickOpenalert}>
                Bulk Delete
              </Button>
            )}
            <br />
            {!tasksubcategoryCheck ? (
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
      <Dialog open={openview} onClose={handleClickOpenview} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description"  fullWidth={true}
          maxWidth="md" sx={{ marginTop: '47px' }}>
        <Box sx={{ padding: '20px 50px' }}>
          <>
            <Typography sx={userStyle.HeaderText}> View Task Subcategory</Typography>
            <br /> <br />
            <Grid container spacing={2}>
              {!tasksubcategoryEdit?.moduleSelect &&
                <>
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography variant="h6">Module Name</Typography>
                      <Typography>{tasksubcategoryEdit?.module}</Typography>
                    </FormControl>
                  </Grid>
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography variant="h6">Sub Module Name</Typography>
                      <Typography>{tasksubcategoryEdit.submodule}</Typography>
                    </FormControl>
                  </Grid>
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography variant="h6">Main Page</Typography>
                      <Typography>{tasksubcategoryEdit.mainpage}</Typography>
                    </FormControl>
                  </Grid>
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography variant="h6">Sub Page</Typography>
                      <Typography>{tasksubcategoryEdit.subpage}</Typography>
                    </FormControl>
                  </Grid>
                  <Grid item md={4} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography variant="h6">Sub Sub-Page</Typography>
                      <Typography>{tasksubcategoryEdit.subsubpage}</Typography>
                    </FormControl>
                  </Grid>

                </>
              }
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Category</Typography>
                  <Typography>{tasksubcategoryEdit.category}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Name</Typography>
                  <Typography>{tasksubcategoryEdit.subcategoryname}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Description</Typography>
                  <Typography
                    sx={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {tasksubcategoryEdit.description}
                  </Typography>
                  <FormControlLabel
                    control={<Checkbox checked={Boolean(tasksubcategoryEdit?.moduleSelect)} />}
                    label="Without Module"
                  />
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br /> <br />
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
        <Dialog open={isErrorOpenpop} onClose={handleCloseerrpop} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">{showAlertpop}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              style={{ padding: '7px 13px', color: 'white', background: 'rgb(25, 118, 210)' }}
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
              onClick={handleCloseerrpop}
            >
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
            )}{' '}
          </DialogContent>
          <DialogActions>
            {selectedRowsCount > 0 ? (
              <>
                <Button onClick={handleCloseModcheckbox} sx={buttonStyles.btncancel}>
                  Cancel
                </Button>
                <Button autoFocus variant="contained" color="error" sx={buttonStyles.buttonsubmit} onClick={(e) => delTaskSubcheckbox(e)}>
                  {' '}
                  OK{' '}
                </Button>
              </>
            ) : (
              <Button variant="contained" color="error" onClick={handleCloseModcheckbox} sx={buttonStyles.btncancel}>
                OK
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
            <Button autoFocus variant="contained" color="error" sx={buttonStyles.buttonsubmit} onClick={handleCloseModalert}>
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
                <Button onClick={handleCloseCheck} autoFocus variant="contained" color="error" sx={buttonStyles.buttonsubmit}>
                  {' '}
                  OK{' '}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </>
      </Box>
      {/* ALERT DIALOG */}
      <Box>
        <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">{showAlert}</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="error" sx={buttonStyles.buttonsubmit} onClick={handleCloseerr}>
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
        filteredDataTwo={rowDataTable ?? []}
        itemsTwo={items ?? []}
        filename={'Task Subcategory'}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
      {/* INFO */}
      <InfoPopup openInfo={openInfo} handleCloseinfo={handleCloseinfo} heading="Task Subcategory Info" addedby={addedby} updateby={updateby} />
      {/*SINGLE DELETE ALERT DIALOG ARE YOU SURE? */}
      <DeleteConfirmation open={isDeleteOpen} onClose={handleCloseMod} onConfirm={delTaskSubcategory} title="Are you sure?" confirmButtonText="Yes" cancelButtonText="Cancel" />

      {/* EXTERNAL COMPONENTS -------------- END */}
      <br />
    </Box>
  );
}

export default TaskSubcategory;
