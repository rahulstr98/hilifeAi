import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ImageIcon from '@mui/icons-material/Image';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Popover,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextareaAutosize,
  Tooltip,
  Typography,
} from '@mui/material';
import MuiInput from '@mui/material/Input';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Radio from '@mui/material/Radio';
import { styled } from '@mui/system';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact } from 'ag-grid-react';
import axios from '../../axiosInstance';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';
import 'jspdf-autotable';
import moment from 'moment-timezone';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FaEdit, FaFileCsv, FaFileExcel, FaFilePdf, FaPlus, FaPrint, FaSearch } from 'react-icons/fa';
import { IoMdOptions } from 'react-icons/io';
import { MdClose } from 'react-icons/md';
import { ThreeDots } from 'react-loader-spinner';
import { MultiSelect } from 'react-multi-select-component';
import Selects from 'react-select';
import { useReactToPrint } from 'react-to-print';
import ResizeObserver from 'resize-observer-polyfill';
import AlertDialog from '../../components/Alert';
import { DeleteConfirmation, PleaseSelectRow } from '../../components/DeleteConfirmation.js';
import { handleApiError } from '../../components/Errorhandling';
import ExportData from '../../components/ExportData';
import Headtitle from '../../components/Headtitle';
import InfoPopup from '../../components/InfoPopup.js';
import ManageColumnsContent from '../../components/ManageColumn';
import MessageAlert from '../../components/MessageAlert';
import PageHeading from '../../components/PageHeading';
import AdvancedSearchBar from '../../components/SearchbarEbList';
import { AuthContext, UserRoleAccessContext } from '../../context/Appcontext';
import { colourStyles, userStyle } from '../../pageStyle';
import { SERVICE } from '../../services/Baseservice';
import Webcamimage from '../hr/webcamprofile';
import { menuItems } from '../../components/menuItemsList';
window.ResizeObserver = ResizeObserver;

const Input = styled(MuiInput)(({ theme }) => ({
  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
    display: 'none !important',
  },
  '& input[type=number]': {
    MozAppearance: 'textfield',
  },
}));

function UserDocumentUpload() {
  const gridRefTableApplyLeave = useRef(null);
  const gridRefImageApplyLeave = useRef(null);

  let today = new Date();

  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  let formattedDate = yyyy + '-' + mm + '-' + dd;

  const [Accessdrop, setAccesDrop] = useState('Employee');
  const [AccessdropEdit, setAccesDropEdit] = useState('Employee');

  let onlyShow = {
    module: ['Human Resources', 'Leave&Permission'],
    submodule: ['HR', 'Leave', 'Permission', 'Work From Home'],
    mainpage: ['Employee', 'Apply Leave', 'Apply Permission', 'Apply Work From Home'],
    subpage: ['Employee details', 'Employee Status Details', 'Notice Period'],
    subsubpage: ['Long Absent Restriction List', 'Notice Period Apply', 'Remote Employee List', 'Remote Employee Details List'],
  }

  const [userDocument, setUserDocument] = useState({
    employeename: 'Please Select Employee Name',
    employeeid: '',
    date: '',
    todate: '',
    reasonforworkfromhome: '',
    reportingto: '',
    department: '',
    designation: '',
    doj: '',
    availabledays: '',
    durationtype: 'Random',
    boardingLog: '',
    workmode: '',
    date: '',
  });

  const [userDocumentEdit, setUserdocumentEdit] = useState({});
  const [userDocuments, setUserdocuments] = useState([]);
  const [allUserdocedit, setAllUserdocedit] = useState([]);

  const { isUserRoleCompare, isUserRoleAccess, isAssignBranch, allTeam, pageName, setPageName, buttonStyles, allUsersData } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);

  const [userCheck, setUsercheck] = useState(false);
  const [btnSubmit, setBtnSubmit] = useState(false);

  // State to track advanced filter
  const [advancedFilter, setAdvancedFilter] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [columnApi, setColumnApi] = useState(null);
  const [filteredDataItems, setFilteredDataItems] = useState(userDocuments);
  const [filteredRowData, setFilteredRowData] = useState([]);

  const [selectedRows, setSelectedRows] = useState([]);

  // File Upload condition starting

  const [upload, setUpload] = useState([]);
  const [uploadEdit, setUploadEdit] = useState([]);

  const handleResumeUpload = (event) => {
    const resume = event.target.files;
    for (let i = 0; i < resume.length; i++) {
      const reader = new FileReader();
      const file = resume[i];
      reader.readAsDataURL(file);
      reader.onload = () => {
        setUpload((prevFiles) => [
          ...prevFiles,
          {
            name: file.name,
            preview: reader.result,
            data: reader.result.split(',')[1],
            remark: 'resume file',
          },
        ]);
      };
    }
  };
  const renderFilePreview = async (file) => {
    const response = await fetch(file.preview);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    window.open(link, '_blank');
  };
  const handleFileDelete = (index) => {
    setUpload((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleResumeUploadEdit = (event) => {
    const resume = event.target.files;
    for (let i = 0; i < resume.length; i++) {
      const reader = new FileReader();
      const file = resume[i];
      reader.readAsDataURL(file);
      reader.onload = () => {
        setUploadEdit((prevFiles) => [
          ...prevFiles,
          {
            name: file.name,
            preview: reader.result,
            data: reader.result.split(',')[1],
            remark: 'resume file',
          },
        ]);
      };
    }
  };
  const renderFilePreviewEdit = async (file) => {
    const response = await fetch(file.preview);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    window.open(link, '_blank');
  };
  const handleFileDeleteEdit = (index) => {
    setUploadEdit((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  const [rolesNewList, setRolesNewList] = useState([]);
  const [selectedModuleName, setSelectedModuleName] = useState([]);
  let [valueModule, setValueModule] = useState([]);
  const [subModuleOptions, setSubModuleOptions] = useState([]);
  const [selectedSubModuleName, setSelectedSubModuleName] = useState([]);
  let [valueSubModule, setSubValueModule] = useState([]);
  const [mainPageoptions, setMainPageoptions] = useState([]);
  const [selectedMainPageName, setSelectedMainPageName] = useState([]);
  let [valueMainPage, setValueMainPage] = useState([]);
  const [subPageoptions, setSubPageoptions] = useState([]);
  const [subSubPageoptions, setsubSubPageoptions] = useState([]);
  const [selectedSubPageName, setSelectedSubPageName] = useState([]);
  const [selectedSubSubPageName, setSelectedSubSubPageName] = useState([]);
  let [valueSubPage, setValueSubPage] = useState([]);
  let [valueSubSubPage, setValueSubSubPage] = useState([]);
  const [selectedControls, setSelectedControls] = useState([]);
  const [moduleTitleNames, setModuleTitleNames] = useState([]);
  const [subModuleTitleNames, setSubModuleTitleNames] = useState([]);
  const [mainPageTitleNames, setMainPageTitleNames] = useState([]);
  const [subPageTitleNames, setSubPageTitleNames] = useState([]);
  const [subsubPageTitleNames, setSubSubPageTitleNames] = useState([]);
  const [controlTitleNames, setControlTitleNames] = useState([]);
  const [mainPageDbNames, setMainPageDbNames] = useState([]);
  //edit
  const [rolesNewListEdit, setRolesNewListEdit] = useState([]);
  const [selectedModuleNameEdit, setSelectedModuleNameEdit] = useState([]);
  let [valueModuleEdit, setValueModuleEdit] = useState([]);
  const [subModuleOptionsEdit, setSubModuleOptionsEdit] = useState([]);
  const [selectedSubModuleNameEdit, setSelectedSubModuleNameEdit] = useState([]);
  let [valueSubModuleEdit, setSubValueModuleEdit] = useState([]);
  const [mainPageoptionsEdit, setMainPageoptionsEdit] = useState([]);
  const [selectedMainPageNameEdit, setSelectedMainPageNameEdit] = useState([]);
  let [valueMainPageEdit, setValueMainPageEdit] = useState([]);
  const [subPageoptionsEdit, setSubPageoptionsEdit] = useState([]);
  const [subSubPageoptionsEdit, setsubSubPageoptionsEdit] = useState([]);
  const [selectedSubPageNameEdit, setSelectedSubPageNameEdit] = useState([]);
  const [selectedSubSubPageNameEdit, setSelectedSubSubPageNameEdit] = useState([]);
  let [valueSubPageEdit, setValueSubPageEdit] = useState([]);
  let [valueSubSubPageEdit, setValueSubSubPageEdit] = useState([]);
  const [selectedControlsEdit, setSelectedControlsEdit] = useState([]);
  const [moduleTitleNamesEdit, setModuleTitleNamesEdit] = useState([]);
  const [subModuleTitleNamesEdit, setSubModuleTitleNamesEdit] = useState([]);
  const [mainPageTitleNamesEdit, setMainPageTitleNamesEdit] = useState([]);
  const [subPageTitleNamesEdit, setSubPageTitleNamesEdit] = useState([]);
  const [subsubPageTitleNamesEdit, setSubSubPageTitleNamesEdit] = useState([]);
  const [controlTitleNamesEdit, setControlTitleNamesEdit] = useState([]);
  const [mainPageDbNamesEdit, setMainPageDbNamesEdit] = useState([]);
  useEffect(() => {
    fetchNewRoleList();
  }, [isUserRoleAccess]);
  const [singleSelectValues, setSingleSelectValues] = useState({
    module: 'Please Select Module',
    submodule: 'Please Select Sub Module',
    mainpage: 'Please Select Main Page',
    subpage: 'Please Select Sub Page',
    subsubpage: 'Please Select Sub Sub Page',
    category: 'Please Select Category',
    subcategory: 'Please Select Sub Category',
  });
  const [singleSelectValuesEdit, setSingleSelectValuesEdit] = useState({
    module: '',
    submodule: '',
    mainpage: '',
    subpage: '',
    subsubpage: '',
  });
  const fetchNewRoleList = async () => {
    setPageName(!pageName);
    try {
      let role_new = await axios.get(SERVICE.ROLE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const allRoles = role_new?.data?.roles.filter((item) => isUserRoleAccess?.role?.includes(item?.name));

      let mergedObject = {};
      allRoles.forEach((obj) => {
        const keysToInclude = ['modulename', 'submodulename', 'mainpagename', 'subpagename', 'subsubpagename'];

        keysToInclude.forEach((key) => {
          if (!mergedObject[key]) {
            mergedObject[key] = [];
          }

          if (Array.isArray(obj[key])) {
            obj[key].forEach((item) => {
              if (!mergedObject[key].includes(item)) {
                mergedObject[key].push(item);
              }
            });
          } else {
            if (!mergedObject[key].includes(obj[key])) {
              mergedObject[key].push(obj[key]);
            }
          }
        });
      });

      console.log(mergedObject, 'mergedObject')
      setRolesNewList([mergedObject]);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  //single select fetch Submodule
  const handleModuleNameChange = (modulename) => {
    const filteredMenuitems = menuItems.filter((item) => item.title === modulename);

    const submodulerole = rolesNewList[0]?.submodulename?.map((item) => item);

    const filteredSubModulename = filteredMenuitems[0]?.submenu
      ?.filter((item) => submodulerole.includes(item.title))
      ?.map((item) => {
        return {
          label: item.title,
          value: item.title,
        };
      });

    setSubModuleOptions(filteredSubModulename);

    // setSelectedModuleName(options);
  };

  //single select fetch Main page
  const handleSubModuleNameChange = (modulename, submodulename) => {
    const filteredMenuitemsModuleName = menuItems.filter((item) => item.title === modulename);

    const filteredMenuitemsSubModuleName = filteredMenuitemsModuleName[0]?.submenu?.filter((item) => item.title === submodulename);

    const mainpagerole = rolesNewList[0]?.mainpagename?.map((item) => item);

    const filteredSubModulename = filteredMenuitemsSubModuleName[0]?.submenu
      ?.filter((item) => mainpagerole.includes(item.title))
      ?.map((item) => {
        return {
          label: item.title,
          value: item.title,
        };
      });

    setMainPageoptions(filteredSubModulename);
  };

  //single select fetch Sub page
  const handleMainPageNameChange = (modulename, submodulename, mainpage) => {
    const filteredMenuitemsModuleName = menuItems.filter((item) => item.title === modulename);

    const filteredMenuitemsSubModuleName = filteredMenuitemsModuleName[0]?.submenu?.filter((item) => item.title === submodulename);

    const filteredMenuitemsMainPage = filteredMenuitemsSubModuleName[0]?.submenu?.filter((item) => item.title === mainpage);

    const subpagerole = rolesNewList[0]?.subpagename?.map((item) => item);
    console.log(filteredMenuitemsMainPage[0]?.submenu, "subpagerole")

    const filteredSubModulename = filteredMenuitemsMainPage[0]?.submenu
      ?.filter((item) => subpagerole.includes(item.title))
      ?.map((item) => {
        return {
          label: item.title,
          value: item.title,
        };
      });
    console.log(filteredSubModulename, "filteredSubModulename")
    setSubPageoptions(filteredSubModulename);
  };

  //single select fetch Sub Sub page
  const handleSubPageNameChange = (modulename, submodulename, mainpage, subpage) => {
    const filteredMenuitemsModuleName = menuItems.filter((item) => item.title === modulename);

    const filteredMenuitemsSubModuleName = filteredMenuitemsModuleName[0]?.submenu?.filter((item) => item.title === submodulename);

    const filteredMenuitemsMainPage = filteredMenuitemsSubModuleName[0]?.submenu?.filter((item) => item.title === mainpage);

    const filteredMenuitemsSubPage = filteredMenuitemsMainPage[0]?.submenu?.filter((item) => item.title === subpage);

    const subpagerole = rolesNewList[0]?.subsubpagename?.map((item) => item);

    const filteredSubSubModulename = filteredMenuitemsSubPage[0]?.submenu
      ?.filter((item) => subpagerole.includes(item.title))
      ?.map((item) => {
        return {
          label: item.title,
          value: item.title,
        };
      });

    setsubSubPageoptions(filteredSubSubModulename);
  };

  //setting an Main Page names into array
  const handleMainPageChange = (options) => {
    setValueMainPage(
      options.map((a, index) => {
        return a.value;
      })
    );
    let mainpageAns = options.map((a, index) => {
      return a.value;
    });
    setMainPageTitleNames(mainpageAns);
    let dbNames =
      options.length > 0 &&
      options.map((a, index) => {
        return a.dbname;
      });
    setMainPageDbNames(dbNames);
    let mainPageFilt = mainPageoptions.filter((data) => mainpageAns.includes(data.title));
    // console.log(mainPageoptions , mainPageFilt,'mainPageoptions')
    let mainPage =
      mainPageFilt.length > 0 &&
      mainPageFilt
        .map((data) => data.submenu)
        .filter(Boolean)
        .flat();
    //Removing Add in the list
    let filteredArray =
      mainPage.length > 0 &&
      mainPage.filter((innerArray) => {
        return !innerArray.title.startsWith('Add ');
      });
    //options fetching
    let subPageDropDown =
      filteredArray?.length > 0
        ? filteredArray?.map((data) => ({
          ...data,
          label: data.title,
          value: data.title,
        }))
        : [];

    // console.log(subPageDropDown , 'subPageDropDown')
    setSubPageoptions(subPageDropDown);
    setSelectedMainPageName(options);
  };
  //edit
  //single select fetch Submodule
  const handleModuleNameChangeEdit = (modulename) => {
    const filteredMenuitems = menuItems.filter((item) => item.title === modulename);

    const submodulerole = rolesNewList[0]?.submodulename?.map((item) => item);

    const filteredSubModulename = filteredMenuitems[0]?.submenu
      ?.filter((item) => submodulerole.includes(item.title))
      ?.map((item) => {
        return {
          label: item.title,
          value: item.title,
        };
      });

    setSubModuleOptionsEdit(filteredSubModulename);

    // setSelectedModuleName(options);
  };

  //single select fetch Main page
  const handleSubModuleNameChangeEdit = (modulename, submodulename) => {
    const filteredMenuitemsModuleName = menuItems.filter((item) => item.title === modulename);

    const filteredMenuitemsSubModuleName = filteredMenuitemsModuleName[0]?.submenu?.filter((item) => item.title === submodulename);

    const mainpagerole = rolesNewList[0]?.mainpagename?.map((item) => item);

    const filteredSubModulename = filteredMenuitemsSubModuleName[0]?.submenu
      ?.filter((item) => mainpagerole.includes(item.title))
      ?.map((item) => {
        return {
          label: item.title,
          value: item.title,
        };
      });

    setMainPageoptionsEdit(filteredSubModulename);
  };

  //single select fetch Sub page
  const handleMainPageNameChangeEdit = (modulename, submodulename, mainpage) => {
    const filteredMenuitemsModuleName = menuItems.filter((item) => item.title === modulename);

    const filteredMenuitemsSubModuleName = filteredMenuitemsModuleName[0]?.submenu?.filter((item) => item.title === submodulename);

    const filteredMenuitemsMainPage = filteredMenuitemsSubModuleName[0]?.submenu?.filter((item) => item.title === mainpage);

    const subpagerole = rolesNewList[0]?.subpagename?.map((item) => item);

    const filteredSubModulename = filteredMenuitemsMainPage[0]?.submenu
      ?.filter((item) => subpagerole.includes(item.title))
      ?.map((item) => {
        return {
          label: item.title,
          value: item.title,
        };
      });

    setSubPageoptionsEdit(filteredSubModulename);
  };

  //single select fetch Sub Sub page
  const handleSubPageNameChangeEdit = (modulename, submodulename, mainpage, subpage) => {
    const filteredMenuitemsModuleName = menuItems.filter((item) => item.title === modulename);

    const filteredMenuitemsSubModuleName = filteredMenuitemsModuleName[0]?.submenu?.filter((item) => item.title === submodulename);

    const filteredMenuitemsMainPage = filteredMenuitemsSubModuleName[0]?.submenu?.filter((item) => item.title === mainpage);

    const filteredMenuitemsSubPage = filteredMenuitemsMainPage[0]?.submenu?.filter((item) => item.title === subpage);

    const subpagerole = rolesNewList[0]?.subsubpagename?.map((item) => item);

    const filteredSubSubModulename = filteredMenuitemsSubPage[0]?.submenu
      ?.filter((item) => subpagerole.includes(item.title))
      ?.map((item) => {
        return {
          label: item.title,
          value: item.title,
        };
      });

    setsubSubPageoptionsEdit(filteredSubSubModulename);
  };

  //setting an Main Page names into array
  const handleMainPageChangeEdit = (options) => {
    setValueMainPageEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    let mainpageAns = options.map((a, index) => {
      return a.value;
    });
    setMainPageTitleNamesEdit(mainpageAns);
    let dbNames =
      options.length > 0 &&
      options.map((a, index) => {
        return a.dbname;
      });
    setMainPageDbNamesEdit(dbNames);
    let mainPageFilt = mainPageoptions.filter((data) => mainpageAns.includes(data.title));

    let mainPage =
      mainPageFilt.length > 0 &&
      mainPageFilt
        .map((data) => data.submenu)
        .filter(Boolean)
        .flat();
    //Removing Add in the list
    let filteredArray =
      mainPage.length > 0 &&
      mainPage.filter((innerArray) => {
        return !innerArray.title.startsWith('Add ');
      });
    //options fetching
    let subPageDropDown =
      filteredArray?.length > 0
        ? filteredArray?.map((data) => ({
          ...data,
          label: data.title,
          value: data.title,
        }))
        : [];
    setSubPageoptionsEdit(subPageDropDown);
    setSelectedMainPageNameEdit(options);
  };

  // File Upload End

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
  // page refersh reload
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
  const [pageApplyLeave, setPageApplyLeave] = useState(1);
  const [pageSizeApplyLeave, setPageSizeApplyLeave] = useState(10);
  const [searchQueryApplyLeave, setSearchQueryApplyLeave] = useState('');
  const [totalPagesApplyLeave, setTotalPagesApplyLeave] = useState(1);

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
    setBtnSubmit(false);
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
  const [searchQueryManageApplyLeave, setSearchQueryManageApplyLeave] = useState('');
  const [isManageColumnsOpenApplyLeave, setManageColumnsOpenApplyLeave] = useState(false);
  const [anchorElApplyLeave, setAnchorElApplyLeave] = useState(null);

  const handleOpenManageColumnsApplyLeave = (event) => {
    setAnchorElApplyLeave(event.currentTarget);
    setManageColumnsOpenApplyLeave(true);
  };
  const handleCloseManageColumnsApplyLeave = () => {
    setManageColumnsOpenApplyLeave(false);
    setSearchQueryManageApplyLeave('');
  };

  const openApplyLeave = Boolean(anchorElApplyLeave);
  const idApplyLeave = openApplyLeave ? 'simple-popover' : undefined;

  // Search bar
  const [anchorElSearchApplyLeave, setAnchorElSearchApplyLeave] = React.useState(null);
  const handleClickSearchApplyLeave = (event) => {
    setAnchorElSearchApplyLeave(event.currentTarget);
  };
  const handleCloseSearchApplyLeave = () => {
    setAnchorElSearchApplyLeave(null);
    setSearchQueryApplyLeave('');
  };

  const openSearchApplyLeave = Boolean(anchorElSearchApplyLeave);
  const idSearchApplyLeave = openSearchApplyLeave ? 'simple-popover' : undefined;

  // Table row color
  const getRowStyle = (params) => {
    if (params.node.rowIndex % 2 === 0) {
      return { background: '#f0f0f0' }; // Even row
    } else {
      return { background: '#ffffff' }; // Odd row
    }
  };

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
      pagename: String('User Document Upload'),
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

  let name = 'create';

  // Show All Columns & Manage Columns
  const initialColumnVisibilityApplyLeave = {
    serialNumber: true,
    checkbox: true,
    company: true,
    branch: true,
    unit: true,
    team: true,
    employeename: true,
    date: true,
    createdAt: true,
    actions: true,
    document: true,
    status: true,
    module: true,
    submodule: true,
    mainpage: true,
    subpage: true,
    subsubpage: true,
  };

  const [columnVisibilityApplyLeave, setColumnVisibilityApplyLeave] = useState(initialColumnVisibilityApplyLeave);

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ''; // This is required for Chrome support
  };

  const [deleteApply, setDeleteApply] = useState('');

  const rowData = async (id, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.USERDOCUMENTUPLOAD_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDeleteApply(res?.data?.suserdocumentupload);
      handleClickOpen();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Alert delete popup
  let Applysid = deleteApply?._id;
  const delApply = async () => {
    setPageName(!pageName);
    try {
      if (Applysid) {
        await axios.delete(`${SERVICE.USERDOCUMENTUPLOAD_SINGLE}/${Applysid}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
        await fetchApplyleave();
        handleCloseMod();
        setSelectedRows([]);
        setPageApplyLeave(1);
        setPopupContent('Deleted Successfully');
        setPopupSeverity('success');
        handleClickOpenPopup();
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const delApplycheckbox = async () => {
    setPageName(!pageName);
    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(`${SERVICE.USERDOCUMENTUPLOAD_SINGLE}/${item}`, {
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
      setPageApplyLeave(1);

      await fetchApplyleave();
      setPopupContent('Deleted Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [empnames, setEmpname] = useState([]);
  const [empnamesEdit, setEmpnameEdit] = useState([]);

  const fetchCategoryTicket = async () => {
    setPageName(!pageName);
    try {
      let res_emp = await axios.get(SERVICE.USER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const empall = [
        ...res_emp?.data?.users
          .filter((data) => data.companyname !== isUserRoleAccess.companyname)
          .map((d) => ({
            ...d,
            label: d.companyname,
            value: d.companyname,
          })),
      ];

      setEmpname(empall);
      setEmpnameEdit(empall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

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
    setUserDocument({ ...userDocument, employeename: 'Please Select Employee Name', employeeid: '', noofshift: '', reasonforworkfromhome: '', reportingto: '' });
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
    setUserDocument({ ...userDocument, employeename: 'Please Select Employee Name', employeeid: '', noofshift: '', reasonforworkfromhome: '', reportingto: '' });
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
    setUserDocument({ ...userDocument, employeename: 'Please Select Employee Name', employeeid: '' });
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
    setUserDocument({ ...userDocument, employeename: 'Please Select Employee Name' });
  };

  const customValueRendererTeam = (valueTeamCat, _categoryname) => {
    return valueTeamCat?.length ? valueTeamCat.map(({ label }) => label)?.join(', ') : 'Please Select Team';
  };

  //company multiselect
  const [selectedOptionsCompanyEdit, setSelectedOptionsCompanyEdit] = useState([]);
  let [valueCompanyCatEdit, setValueCompanyCatEdit] = useState([]);

  const handleCompanyChangeEdit = (options) => {
    setValueCompanyCatEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsCompanyEdit(options);
    setValueBranchCatEdit([]);
    setSelectedOptionsBranchEdit([]);
    setValueUnitCatEdit([]);
    setSelectedOptionsUnitEdit([]);
    setValueTeamCatEdit([]);
    setSelectedOptionsTeamEdit([]);
  };

  const customValueRendererCompanyEdit = (valueCompanyCatEdit, _categoryname) => {
    return valueCompanyCatEdit?.length ? valueCompanyCatEdit.map(({ label }) => label)?.join(', ') : 'Please Select Company';
  };

  //branch multiselect
  const [selectedOptionsBranchEdit, setSelectedOptionsBranchEdit] = useState([]);
  let [valueBranchCatEdit, setValueBranchCatEdit] = useState([]);

  const handleBranchChangeEdit = (options) => {
    setValueBranchCatEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsBranchEdit(options);
    setValueUnitCatEdit([]);
    setSelectedOptionsUnitEdit([]);
    setValueTeamCatEdit([]);
    setSelectedOptionsTeamEdit([]);
  };

  const customValueRendererBranchEdit = (valueBranchCatEdit, _categoryname) => {
    return valueBranchCatEdit?.length ? valueBranchCatEdit.map(({ label }) => label)?.join(', ') : 'Please Select Branch';
  };

  //unit multiselect
  const [selectedOptionsUnitEdit, setSelectedOptionsUnitEdit] = useState([]);
  let [valueUnitCatEdit, setValueUnitCatEdit] = useState([]);

  const handleUnitChangeEdit = (options) => {
    setValueUnitCatEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsUnitEdit(options);
    setValueTeamCatEdit([]);
    setSelectedOptionsTeamEdit([]);
  };

  const customValueRendererUnitEdit = (valueUnitCatEdit, _categoryname) => {
    return valueUnitCatEdit?.length ? valueUnitCatEdit.map(({ label }) => label)?.join(', ') : 'Please Select Unit';
  };

  //team multiselect
  const [selectedOptionsTeamEdit, setSelectedOptionsTeamEdit] = useState([]);
  let [valueTeamCatEdit, setValueTeamCatEdit] = useState([]);

  const handleTeamChangeEdit = (options) => {
    setValueTeamCatEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsTeamEdit(options);
  };

  const customValueRendererTeamEdit = (valueTeamCatEdit, _categoryname) => {
    return valueTeamCatEdit?.length ? valueTeamCatEdit.map(({ label }) => label)?.join(', ') : 'Please Select Team';
  };

  useEffect(() => {
    fetchCategoryTicket();
  }, [selectedOptionsCompany]);

  let dateselect = new Date();
  dateselect.setDate(dateselect.getDate() + 3);
  var ddt = String(dateselect.getDate()).padStart(2, '0');
  var mmt = String(dateselect.getMonth() + 1).padStart(2, '0');
  var yyyyt = dateselect.getFullYear();
  let formattedDatet = yyyyt + '-' + mmt + '-' + ddt;

  let datePresent = new Date();
  var ddp = String(datePresent.getDate());
  var mmp = String(datePresent.getMonth() + 1);
  var yyyyp = datePresent.getFullYear();
  let formattedDatePresent = yyyyp + '-' + mmp + '-' + ddp;

  const [checkDuplicate, setCheckDuplicate] = useState([]);

  //add function
  const sendRequest = async () => {
    setPageName(!pageName);
    setBtnSubmit(true);
    const uniqueId = uuidv4();
    let employee = Accessdrop === 'HR' ? String(userDocument.employeename) : isUserRoleAccess.companyname;
    let ans = allUsersData?.find((data) => data.companyname === employee);

    try {
      let subprojectscreate = await axios.post(SERVICE.USERDOCUMENTUPLOAD_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: ans.company,
        branch: ans.branch,
        unit: ans.unit,
        team: ans.team,
        employeename: ans.companyname,
        access: Accessdrop,
        files: upload?.map((item) => item.name),
        uniqueId: uniqueId,

        modulename: singleSelectValues.module,
        submodulename: singleSelectValues.submodule,
        mainpagename: singleSelectValues.mainpage === 'Please Select Main Page' ? '' : singleSelectValues.mainpage,
        subpagename: singleSelectValues.subpage === 'Please Select Sub Page' ? '' : singleSelectValues.subpage,
        subsubpagename: singleSelectValues.subsubpage === 'Please Select Sub Sub Page' ? '' : singleSelectValues.subsubpage,

        date: String(userDocument.date),

        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });
      await handleFileUpload(upload, 'userdocuments', uniqueId);
      await fetchApplyleave();
      setUserDocument({
        ...userDocument,
        employeename: 'Please Select Employee Name',
        employeeid: '',
        durationtype: 'Random',
        availabledays: '',
        date: '',
        todate: '',
        reasonforworkfromhome: '',
        reportingto: '',
        noofshift: '',
      });
      setUpload([]);
      // setEmpname([]);
      setBtnSubmit(false);
      setPopupContent('Added Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      setBtnSubmit(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  function base64ToFile(base64String, filename, mimeType) {
    const byteString = atob(base64String.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], filename, { type: mimeType });
  }

  const handleFileUpload = async (selectedFilesall, type, uniqueId) => {
    try {
      const selectedFiles = selectedFilesall.map((file) => base64ToFile(file.preview, file.name, file.type));

      const uploadFiles = async () => {
        for (const selectedFile of selectedFiles) {
          const chunkSize = 5 * 1024 * 1024; // 5MB (adjust based on your requirements)
          const totalChunks = Math.ceil(selectedFile.size / chunkSize);
          const chunkProgress = 100 / totalChunks;
          let chunkNumber = 0;
          let start = 0;
          let end = 0;

          const uploadNextChunk = async () => {
            try {
              if (end < selectedFile.size) {
                end = start + chunkSize;
                if (end > selectedFile.size) {
                  end = selectedFile.size;
                }

                const chunk = selectedFile.slice(start, end, selectedFile.type);

                const formData = new FormData();
                formData.append('file', chunk);
                formData.append('chunkNumber', chunkNumber);
                formData.append('totalChunks', totalChunks);
                formData.append('filesize', selectedFile.size);
                formData.append('originalname', `${uniqueId}$${type}$${selectedFile.name}`);

                try {
                  const response = await axios.post(SERVICE.UPLOAD_CHUNK_USERDOCUMENTS, formData, {
                    headers: {
                      'Content-Type': 'multipart/form-data',
                    },
                  });
                  const temp = `Chunk ${chunkNumber + 1}/${totalChunks} uploaded successfully for ${selectedFile.name}`;

                  start = end;
                  chunkNumber++;

                  uploadNextChunk();
                } catch (err) {
                  handleApiError(err, setShowAlert, handleClickOpenerr);
                }
              } else {
                // setProgress(100);
                // console.log(`File upload completed for ${selectedFile.name}`);
              }
            } catch (err) {
              // console.log(err, "asdfse");
            }
          };

          await uploadNextChunk();
        }
        // setSelectedFiles([]);
      };

      uploadFiles();
    } catch (err) { }
  };

  //submit option for saving
  const handleSubmit = async (e) => {
    e.preventDefault();
    let user = Accessdrop === 'HR' ? userDocument.employeename : isUserRoleAccess.companyname;
    // const isNameMatch = userDocuments.some((item) => item.employeename === userDocument.employeename && item.date === userDocument.date);

    // company: item.company,
    //     branch: item.branch,
    //     unit: item.unit,
    //     team: item.team,
    //     employeename: item.employeename,
    //     date: moment(item.date).format('DD-MM-YYYY'),
    //     document: item.files,
    //     createdAt: item.createdAt,
    //     module: item?.modulename,
    //     submodule: item?.submodulename,
    //     mainpage: item?.mainpagename,
    //     subpage: item?.subpagename,
    //     subsubpage: item?.subsubpagename,

    //     singleSelectValues.module
    // singleSelectValues.submodule
    // singleSelectValues.mainpage
    // singleSelectValues.subpage
    // singleSelectValues.subsubpage

    const isNameMatch = userDocuments.some((item) =>
      item.employeename === user &&
      item.module === singleSelectValues.module &&
      item.submodule === singleSelectValues.submodule &&
      item.mainpage === (singleSelectValues.mainpage === 'Please Select Main Page' ? '' : singleSelectValues.mainpage) &&
      item.subpage === (singleSelectValues.subpage === 'Please Select Sub Page' ? '' : singleSelectValues.subpage) &&
      item.subsubpage === (singleSelectValues.subsubpage === 'Please Select Sub Sub Page' ? '' : singleSelectValues.subsubpage) &&
      (item.subsubpage === "Notice Period Apply" ? true : item.date === moment(userDocument.date).format('DD-MM-YYYY'))
    );

    if (Accessdrop === 'HR' && selectedOptionsCompany.length === 0) {
      setPopupContentMalert('Please Select Company');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (Accessdrop === 'HR' && selectedOptionsBranch.length === 0) {
      setPopupContentMalert('Please Select Branch');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (Accessdrop === 'HR' && selectedOptionsUnit.length === 0) {
      setPopupContentMalert('Please Select Unit');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (Accessdrop === 'HR' && selectedOptionsTeam.length === 0) {
      setPopupContentMalert('Please Select Team');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (Accessdrop === 'HR' && userDocument.employeename === 'Please Select Employee Name') {
      setPopupContentMalert('Please Select Employee Name');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (singleSelectValues.module === 'Please Select Module' || singleSelectValues.module === '') {
      setPopupContentMalert('Please Select Module');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if (singleSelectValues.submodule === 'Please Select Sub Module' || singleSelectValues.submodule === '') {
      setPopupContentMalert('Please Select Sub Module');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if ((singleSelectValues.mainpage === 'Please Select Main Page' || singleSelectValues.mainpage === '') &&
      mainPageoptions?.filter(item => onlyShow.mainpage.includes(item.value))?.length > 0
    ) {
      setPopupContentMalert('Please Select Main Page');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if ((singleSelectValues.subpage === 'Please Select Sub Page' || singleSelectValues.subpage === '') &&
      subPageoptions?.filter(item => onlyShow.subpage.includes(item.value))?.length > 0
    ) {
      setPopupContentMalert('Please Select Sub Page');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if ((singleSelectValues.subsubpage === 'Please Select Sub Sub Page' || singleSelectValues.subsubpage === '') &&
      subSubPageoptions?.filter(item => onlyShow.subsubpage.includes(item.value))?.length > 0
    ) {
      setPopupContentMalert('Please Select Sub Sub Page');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if (!["Remote Employee List", "Remote Employee Details List"]?.includes(singleSelectValues.subsubpage) && userDocument.date === '') {
      setPopupContentMalert('Please Select Date');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    }
    else if (upload.length < 1) {
      setPopupContentMalert('Please Upload Files');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert('Data Already Exists!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else {
      sendRequest();
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    // setUpload("");
    setUpload([]);
    setUserDocument({
      employeename: 'Please Select Employee Name',
      date: '',
    });
    setValueCompanyCat([]);
    setSelectedOptionsCompany([]);
    setValueBranchCat([]);
    setSelectedOptionsBranch([]);
    setValueUnitCat([]);
    setSelectedOptionsUnit([]);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
    setEmpname([]);


    // setSelectedModuleName([]);
    // setSelectedSubModuleName([]);
    // setSelectedMainPageName([]);
    // setSelectedSubPageName([]);
    // setSelectedControls([]);
    // setMainPageDbNames([]);
    // setControlTitleNames([]);
    // setSelectedSubSubPageName([]);

    setValueModule([]);
    setModuleTitleNames([]);

    setSubValueModule([]);
    setSubModuleTitleNames([]);
    setSubModuleOptions([]);

    setValueMainPage([]);
    setMainPageTitleNames([]);
    setMainPageoptions([]);

    setValueSubPage([]);
    setSubPageTitleNames([]);
    setSubPageoptions([]);

    setValueSubSubPage([]);
    setSubSubPageTitleNames([]);
    setsubSubPageoptions([]);


    setSingleSelectValues({
      module: 'Please Select Module',
      submodule: 'Please Select Sub Module',
      mainpage: 'Please Select Main Page',
      subpage: 'Please Select Sub Page',
      subsubpage: 'Please Select Sub Sub Page',
      category: 'Please Select Category',
      subcategory: 'Please Select Sub Category',
    });

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
    setSingleSelectValuesEdit({
      module: '',
      submodule: '',
      mainpage: '',
      subpage: '',
      subsubpage: '',
    });
  };

  // info model
  const [openInfo, setOpeninfo] = useState(false);
  const handleClickOpeninfo = () => {
    setOpeninfo(true);
  };
  const handleCloseinfo = () => {
    setOpeninfo(false);
  };

  const [oldfileNamesBill, setoldfileNamesBill] = useState([]);

  const getMultipleFilesAsObjects = async (filenames, type, uniqueId) => {
    const files = [];
console.log(filenames, type, uniqueId , 'filenames, type, uniqueId')
    for (const name of filenames) {
      const res = await axios.post(
        SERVICE.USERDOCUMENTS_EDIT_FETCH,
        { filename: `${uniqueId}$${type}$${name}` },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          responseType: 'blob',
        }
      );
console.log()
      const blob = res.data;
      const file = new File([blob], name, { type: blob.type });
      files.push(file);
    }

    return files;
  };

  const [getimgbillcode, setGetImgbillcode] = useState([]);

  const handleFetchBill = (data, remarks) => {
    console.log(data , "data")
    const files = Array.from(data); // Ensure it's an array

    const fileReaders = [];
    const newSelectedFiles = [];

    // imageFiles.forEach((file) => {
    files.forEach((file) => {
      const reader = new FileReader();

      const readerPromise = new Promise((resolve) => {
        reader.onload = () => {
          const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            preview: reader.result,
          };
          newSelectedFiles.push(fileData);
          resolve(file);
        };
      });

      reader.readAsDataURL(file);
      fileReaders.push(readerPromise);
    });

    Promise.all(fileReaders).then((originalFiles) => {
      setUploadEdit(newSelectedFiles);
      setGetImgbillcode(newSelectedFiles);
    });
  };

  //get single row to edit....
  const getCode = async (e, name) => {
    try {
      let res = await axios.get(`${SERVICE.USERDOCUMENTUPLOAD_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setUserdocumentEdit(res?.data?.suserdocumentupload);
      setAccesDropEdit(res?.data?.suserdocumentupload?.access);
      setUploadEdit(res?.data?.suserdocumentupload?.files);
      const filesbill = await getMultipleFilesAsObjects(res?.data?.suserdocumentupload?.files, 'userdocuments', res?.data?.suserdocumentupload?.uniqueId);
      setoldfileNamesBill(res?.data?.suserdocumentupload?.files.map((d) => `${res?.data?.suserdocumentupload?.uniqueId}$userdocuments$${d}`));

      handleFetchBill(filesbill, res?.data?.suserdocumentupload?.files);

      setSingleSelectValuesEdit({
        module: res?.data?.suserdocumentupload?.modulename || '',
        submodule: res?.data?.suserdocumentupload?.submodulename || '',
        mainpage: res?.data?.suserdocumentupload?.mainpagename,
        subpage: res?.data?.suserdocumentupload?.subpagename,
        subsubpage: res?.data?.suserdocumentupload?.subsubpagename,
      });
      handleModuleNameChangeEdit(res?.data?.suserdocumentupload?.modulename, e);
      handleSubModuleNameChangeEdit(res?.data?.suserdocumentupload?.modulename, res?.data?.suserdocumentupload?.submodulename, e);
      handleMainPageNameChangeEdit(res?.data?.suserdocumentupload?.modulename, res?.data?.suserdocumentupload?.submodulename, res?.data?.suserdocumentupload?.mainpagename, e);
      handleSubPageNameChangeEdit(res?.data?.suserdocumentupload?.modulename, res?.data?.suserdocumentupload?.submodulename, res?.data?.suserdocumentupload?.mainpagename, res?.data?.suserdocumentupload?.subpagename, e);

      handleClickOpenEdit();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // get single row to view....
  const getviewCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.USERDOCUMENTUPLOAD_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setUserdocumentEdit(res?.data?.suserdocumentupload);
      setUploadEdit(res?.data?.suserdocumentupload.files);

      const filesbill = await getMultipleFilesAsObjects(res?.data?.suserdocumentupload?.files, 'userdocuments', res?.data?.suserdocumentupload?.uniqueId);
      setoldfileNamesBill(res?.data?.suserdocumentupload?.files.map((d) => `${res?.data?.suserdocumentupload?.uniqueId}$userdocuments$${d}`));

      handleFetchBill(filesbill, res?.data?.suserdocumentupload?.files);
      handleClickOpenview();

      handleClickOpenview();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // get single row to view....
  const getinfoCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.USERDOCUMENTUPLOAD_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setUserdocumentEdit(res?.data?.suserdocumentupload);
      handleClickOpeninfo();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //Project updateby edit page...
  let updateby = userDocumentEdit?.updatedby;
  let addedby = userDocumentEdit?.addedby;

  let subprojectsid = userDocumentEdit?._id;
  //editing the single data...
  // const sendEditRequest = async () => {
  //   setPageName(!pageName);
  //   let employee = Accessdrop === 'HR' ? String(userDocumentEdit.employeename) : isUserRoleAccess.companyname;
  //   let ans = allUsersData?.find((data) => data.companyname === employee);

  //   try {
  //     let res = await axios.put(`${SERVICE.USERDOCUMENTUPLOAD_SINGLE}/${subprojectsid}`, {
  //       headers: {
  //         Authorization: `Bearer ${auth.APIToken}`,
  //       },
  //       // company: comp,
  //       access: AccessdropEdit,
  //       company: String(ans.company),
  //       branch: String(ans.branch),
  //       unit: String(ans.unit),
  //       team: String(ans.team),

  //       employeename: AccessdropEdit === 'HR' ? String(ans.companyname) : isUserRoleAccess.companyname,

  //       modulename: singleSelectValuesEdit.module,
  //       submodulename: singleSelectValuesEdit.submodule,
  //       mainpagename: singleSelectValuesEdit.mainpage === 'Please Select Main Page' ? '' : singleSelectValuesEdit.mainpage,
  //       subpagename: singleSelectValuesEdit.subpage === 'Please Select Sub Page' ? '' : singleSelectValuesEdit.subpage,
  //       subsubpagename: singleSelectValuesEdit.subsubpage === 'Please Select Sub Sub Page' ? '' : singleSelectValuesEdit.subsubpage,

  //       uniqueId: userDocumentEdit.uniqueId,
  //       files: uploadEdit?.map((item) => item.name),
  //       updatedby: [
  //         ...updateby,
  //         {
  //           name: String(isUserRoleAccess.companyname),
  //           date: String(new Date()),
  //         },
  //       ],
  //     });

  //     await handleFileDeleteOld(oldfileNamesBill);
  //     await handleFileUpload(uploadEdit, 'userdocuments', userDocumentEdit.uniqueId);

  //     await fetchApplyleave();
  //     handleCloseModEdit();
  //   } catch (err) {
  //     handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
  //   }
  // };
  const sendEditRequest = async () => {
    setPageName(!pageName);
    let employee = Accessdrop === 'HR' ? String(userDocumentEdit.employeename) : isUserRoleAccess.companyname;
    let ans = allUsersData?.find((data) => data.companyname === employee);

    try {
      let res = await axios.put(`${SERVICE.USERDOCUMENTUPLOAD_SINGLE}/${subprojectsid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        access: AccessdropEdit,
        company: String(ans?.company),
        branch: String(ans?.branch),
        unit: String(ans?.unit),
        team: String(ans?.team),

        employeename: AccessdropEdit === 'HR' ? String(ans?.companyname) : isUserRoleAccess.companyname,
        date: String(userDocumentEdit.date),

        modulename: singleSelectValuesEdit.module,
        submodulename: singleSelectValuesEdit.submodule,
        mainpagename: singleSelectValuesEdit.mainpage === 'Please Select Main Page' ? '' : singleSelectValuesEdit.mainpage,
        subpagename: singleSelectValuesEdit.subpage === 'Please Select Sub Page' ? '' : singleSelectValuesEdit.subpage,
        subsubpagename: singleSelectValuesEdit.subsubpage === 'Please Select Sub Sub Page' ? '' : singleSelectValuesEdit.subsubpage,

        uniqueId: userDocumentEdit.uniqueId,
        files: Array.isArray(uploadEdit) && uploadEdit.length > 0 ? uploadEdit.map(item => item.name) : undefined,
        updatedby: [
          ...updateby,
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });

      if (Array.isArray(oldfileNamesBill) && oldfileNamesBill.length > 0) {
        await handleFileDeleteOld(oldfileNamesBill);
      }

      if (Array.isArray(uploadEdit) && uploadEdit.length > 0) {
        await handleFileUpload(uploadEdit, 'userdocuments', userDocumentEdit.uniqueId);
      }

      await fetchApplyleave();
      handleCloseModEdit();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };


  const handleFileDeleteOld = async (filenames) => {
    try {
      let res_project = await axios.post(SERVICE.EDIT_OLDDATA_DELETE_USERDOCUMENTS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        filenames: filenames,
      });
    } catch (err) { }
  };

  const editSubmit = async (e) => {
    e.preventDefault();

    let user = AccessdropEdit === 'HR' ? userDocumentEdit.employeename : isUserRoleAccess.companyname;
    console.log(subSubPageoptionsEdit?.filter(item => onlyShow.subsubpage.includes(item.value)))
    console.log((singleSelectValuesEdit.subsubpage === 'Please Select Sub Sub Page' || singleSelectValuesEdit.subsubpage === '') &&
      subSubPageoptionsEdit?.filter(item => onlyShow.subsubpage.includes(item.value))?.length > 0)

    const isNameMatch = userDocuments?.filter(data => data?.id !== userDocumentEdit?._id)?.some((item) =>
      item.employeename === user &&
      item.module === singleSelectValuesEdit.module &&
      item.submodule === singleSelectValuesEdit.submodule &&
      item.mainpage === singleSelectValuesEdit.mainpage &&
      item.subpage === singleSelectValuesEdit.subpage &&
      item.subsubpage === singleSelectValuesEdit.subsubpage &&
      (item.subsubpage === "Notice Period Apply" ? true : item.date === moment(userDocumentEdit.date).format('DD-MM-YYYY'))
    );

    if (AccessdropEdit === 'HR' && userDocumentEdit.company === 'Please Select Company') {
      setPopupContentMalert('Please Select Company');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (AccessdropEdit === 'HR' && userDocumentEdit.branch === 'Please Select Branch') {
      setPopupContentMalert('Please Select Branch');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (AccessdropEdit === 'HR' && userDocumentEdit.unit === 'Please Select Unit') {
      setPopupContentMalert('Please Select Unit');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (AccessdropEdit === 'HR' && userDocumentEdit.team === 'Please Select Team') {
      setPopupContentMalert('Please Select Team');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else if (AccessdropEdit === 'HR' && userDocumentEdit.employeename === 'Please Select Employee Name') {
      setPopupContentMalert('Please Select Employee Name');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } 
    else if (singleSelectValuesEdit.module === 'Please Select Module' || singleSelectValuesEdit.module === '') {
      setPopupContentMalert('Please Select Module');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if (singleSelectValuesEdit.submodule === 'Please Select Sub Module' || singleSelectValuesEdit.submodule === '') {
      setPopupContentMalert('Please Select Sub Module');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if ((singleSelectValuesEdit.mainpage === 'Please Select Main Page' || singleSelectValuesEdit.mainpage === '') &&
      mainPageoptionsEdit?.filter(item => onlyShow.mainpage.includes(item.value))?.length > 0
    ) {
      setPopupContentMalert('Please Select Main Page');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if ((singleSelectValuesEdit.subpage === 'Please Select Sub Page' || singleSelectValuesEdit.subpage === '') &&
      subPageoptionsEdit?.filter(item => onlyShow.subpage.includes(item.value))?.length > 0
    ) {
      setPopupContentMalert('Please Select Sub Page');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    else if ((singleSelectValuesEdit.subsubpage === 'Please Select Sub Sub Page' || singleSelectValuesEdit.subsubpage === '') &&
      subSubPageoptionsEdit?.filter(item => onlyShow.subsubpage.includes(item.value))?.length > 0
    ) {
      setPopupContentMalert('Please Select Sub Sub Page');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }
    
    else if (!["Remote Employee List", "Remote Employee Details List"]?.includes(singleSelectValuesEdit.subsubpage) && userDocumentEdit.date === '') {
      setPopupContentMalert('Please Select Date');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    }
    
    else if (uploadEdit.length == 0) {
      setPopupContentMalert('Please Upload Files');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert('Data Already Exists!');
      setPopupSeverityMalert('warning');
      handleClickOpenPopupMalert();
    } else {
      sendEditRequest();
    }
  };

  //get all Sub vendormasters.
  const fetchApplyleave = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.get(SERVICE.USERDOCUMENTUPLOAD, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setUsercheck(true);
      let answer = res_vendor?.data?.userdocumentuploads;
      // let answer = isUserRoleAccess?.role?.includes("Manager") || isUserRoleAccess?.role?.includes("HiringManager") || isUserRoleAccess?.role?.includes("HR") || isUserRoleAccess?.role?.includes("Superadmin") ? res_vendor?.data?.userdocumentuploads : res_vendor?.data?.userdocumentuploads.filter((data) => data.employeename === isUserRoleAccess.companyname);
      const itemsWithSerialNumber = answer?.map((item, index) => ({
        ...item,
        id: item._id,
        serialNumber: index + 1,
        company: item.company,
        branch: item.branch,
        unit: item.unit,
        team: item.team,
        // employeeid: item.employeeid,
        employeename: item.employeename,
        date: moment(item.date).format('DD-MM-YYYY'),
        // date: item.date,
        document: item.files,

        createdAt: item.createdAt,
        module: item?.modulename,
        submodule: item?.submodulename,
        mainpage: item?.mainpagename,
        subpage: item?.subpagename,
        subsubpage: item?.subsubpagename,
      }));
      setUserdocuments(itemsWithSerialNumber);
      setFilteredDataItems(itemsWithSerialNumber);
      setTotalPagesApplyLeave(Math.ceil(answer.length / pageSizeApplyLeave));
    } catch (err) {
      setUsercheck(true);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //get all Sub vendormasters.


  //id for login...
  let loginid = localStorage.LoginUserId;
  let authToken = localStorage.APIToken;

  useEffect(() => {
    // getexcelDatas();
  }, [userDocumentEdit, userDocument, checkDuplicate]);

  useEffect(() => {
    fetchApplyleave();
  }, []);



  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, []);

  const [items, setItems] = useState([]);

  const addSerialNumber = (datas) => {
    setItems(datas);
  };

  useEffect(() => {
    addSerialNumber(userDocuments);
  }, [userDocuments]);

  const defaultColDef = useMemo(() => {
    return {
      filter: true,
      resizable: true,
      filterParams: {
        buttons: ['apply', 'reset', 'cancel'],
      },
    };
  }, []);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
    setColumnApi(params.columnApi);
  }, []);

  // Function to handle filter changes
  const onFilterChanged = () => {
    if (gridApi) {
      const filterModel = gridApi.getFilterModel(); // Get the current filter model

      // Check if filters are active
      if (Object.keys(filterModel).length === 0) {
        // No filters active, clear the filtered data state
        setFilteredRowData([]);
      } else {
        // Filters are active, capture filtered data
        const filteredData = [];
        gridApi.forEachNodeAfterFilterAndSort((node) => {
          filteredData.push(node.data); // Collect filtered row data
        });
        setFilteredRowData(filteredData);
      }
    }
  };

  const onPaginationChanged = useCallback(() => {
    if (gridRefTableApplyLeave.current) {
      const gridApi = gridRefTableApplyLeave.current.api;
      const currentPage = gridApi.paginationGetCurrentPage() + 1;
      const totalPagesApplyLeave = gridApi.paginationGetTotalPages();
      setPageApplyLeave(currentPage);
      setTotalPagesApplyLeave(totalPagesApplyLeave);
    }
  }, []);

  // list view option code
  const [isimgviewbill, setImgviewbill] = useState(false);
  const handleImgcodeviewbill = () => {
    setImgviewbill(true);
  };
  const handlecloseImgcodeviewbill = () => {
    setImgviewbill(false);
  };

  const getDownloadFile = async (id) => {
    let res = await axios.get(`${SERVICE.USERDOCUMENTUPLOAD_SINGLE}/${id}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });
    const filesbill = await getMultipleFilesAsObjects(res?.data?.suserdocumentupload?.files, 'userdocuments', res?.data?.suserdocumentupload?.uniqueId);
    setoldfileNamesBill(res?.data?.suserdocumentupload?.files.map((d) => `${res?.data?.suserdocumentupload?.uniqueId}$userdocuments$${d}`));

    handleFetchBill(filesbill, res?.data?.suserdocumentupload?.files);

    handleImgcodeviewbill();
  };

  // Pagination for outer filter
  const filteredData = filteredDataItems?.slice((pageApplyLeave - 1) * pageSizeApplyLeave, pageApplyLeave * pageSizeApplyLeave);
  const totalPagesApplyLeaveOuter = Math.ceil(filteredDataItems?.length / pageSizeApplyLeave);
  const visiblePages = Math.min(totalPagesApplyLeaveOuter, 3);
  const firstVisiblePage = Math.max(1, pageApplyLeave - 1);
  const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPagesApplyLeaveOuter);
  const pageNumbers = [];
  const indexOfLastItem = pageApplyLeave * pageSizeApplyLeave;
  const indexOfFirstItem = indexOfLastItem - pageSizeApplyLeave;
  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }

  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
    <div>
      <Checkbox checked={selectAllChecked} onChange={onSelectAll} />
    </div>
  );

  const columnDataTableApplyLeave = [
    {
      field: 'checkbox',
      headerName: 'Checkbox', // Default header name
      headerStyle: {
        fontWeight: 'bold', // Apply the font-weight style to make the header text bold
        // Add any other CSS styles as needed
      },
      headerComponent: (params) => (
        <CheckboxHeader
          selectAllChecked={selectAllChecked}
          onSelectAll={() => {
            if (filteredData.length === 0) {
              // Do not allow checking when there are no rows
              return;
            }
            if (selectAllChecked) {
              setSelectedRows([]);
            } else {
              const allRowIds = filteredData.map((row) => row.id);
              setSelectedRows(allRowIds);
            }
            setSelectAllChecked(!selectAllChecked);
          }}
        />
      ),

      cellRenderer: (params) => (
        <Checkbox
          checked={selectedRows.includes(params.data.id)}
          onChange={() => {
            let updatedSelectedRows;
            if (selectedRows.includes(params.data.id)) {
              updatedSelectedRows = selectedRows.filter((selectedId) => selectedId !== params.data.id);
            } else {
              updatedSelectedRows = [...selectedRows, params.data.id];
            }

            setSelectedRows(updatedSelectedRows);

            // Update the "Select All" checkbox based on whether all rows are selected
            setSelectAllChecked(updatedSelectedRows.length === filteredData.length);
          }}
        />
      ),
      sortable: false, // Optionally, you can make this column not sortable
      width: 90,

      hide: !columnVisibilityApplyLeave.checkbox,
      headerClassName: 'bold-header',
      lockPinned: true,
      pinned: 'left',
    },
    { field: 'serialNumber', headerName: 'SNo', flex: 0, width: 80, hide: !columnVisibilityApplyLeave.serialNumber, headerClassName: 'bold-header' },
    { field: 'company', headerName: 'Company', flex: 0, width: 150, hide: !columnVisibilityApplyLeave.company, headerClassName: 'bold-header' },
    { field: 'branch', headerName: 'Branch', flex: 0, width: 150, hide: !columnVisibilityApplyLeave.branch, headerClassName: 'bold-header' },
    { field: 'unit', headerName: 'Unit', flex: 0, width: 150, hide: !columnVisibilityApplyLeave.unit, headerClassName: 'bold-header' },
    { field: 'team', headerName: 'Team', flex: 0, width: 150, hide: !columnVisibilityApplyLeave.team, headerClassName: 'bold-header' },
    { field: 'employeename', headerName: 'Employee Name', flex: 0, width: 250, hide: !columnVisibilityApplyLeave.employeename, headerClassName: 'bold-header' },
    { field: 'date', headerName: 'Date', flex: 0, width: 110, hide: !columnVisibilityApplyLeave.date, headerClassName: 'bold-header' },
    {
      field: 'module',
      headerName: 'Module',
      flex: 0,
      width: 130,
      hide: !columnVisibilityApplyLeave.module,
      headerClassName: 'bold-header',
    },
    {
      field: 'submodule',
      headerName: 'Sub Module',
      flex: 0,
      width: 130,
      hide: !columnVisibilityApplyLeave.submodule,
      headerClassName: 'bold-header',
    },
    {
      field: 'mainpage',
      headerName: 'Main Page',
      flex: 0,
      width: 130,
      hide: !columnVisibilityApplyLeave.mainpage,
      headerClassName: 'bold-header',
    },
    {
      field: 'subpage',
      headerName: 'Sub Page',
      flex: 0,
      width: 130,
      hide: !columnVisibilityApplyLeave.subpage,
      headerClassName: 'bold-header',
    },
    {
      field: 'subsubpage',
      headerName: 'Sub Sub-Page',
      flex: 0,
      width: 150,
      hide: !columnVisibilityApplyLeave.subsubpage,
      headerClassName: 'bold-header',
    },
    {
      field: 'document',
      headerName: 'Document',
      sortable: false,
      flex: 0,
      width: 180,
      minHeight: '40px',
      hide: !columnVisibilityApplyLeave.document,
      cellRenderer: (params) => (
        <Grid>
          <Button
            sx={{
              padding: '14px 14px',
              minWidth: '40px !important',
              borderRadius: '50% !important',
              ':hover': {
                backgroundColor: '#80808036', // theme.palette.primary.main
              },
            }}
            onClick={() => getDownloadFile(params.data.id)}
          >
            view
          </Button>
        </Grid>
      ),
    },

    {
      field: 'actions',
      headerName: 'Action',
      flex: 0,
      width: 270,
      minHeight: '40px !important',
      filter: false,
      sortable: false,
      hide: !columnVisibilityApplyLeave.actions,
      headerClassName: 'bold-header',
      cellRenderer: (params) => (
        <Grid sx={{ display: 'flex' }}>
          {isUserRoleCompare?.includes('euserdocumentupload') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getCode(params.data.id, params.data.name);
              }}
            >
              <EditOutlinedIcon style={{ fontsize: 'large' }} />
            </Button>
          )}
          {isUserRoleCompare?.includes('duserdocumentupload') && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.data.id, params.data.name);
              }}
            >
              <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />
            </Button>
          )}
          {isUserRoleCompare?.includes('vuserdocumentupload') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getviewCode(params.data.id);
              }}
            >
              <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />
            </Button>
          )}
          {isUserRoleCompare?.includes('iuserdocumentupload') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getinfoCode(params.data.id);
              }}
            >
              <InfoOutlinedIcon sx={buttonStyles.buttoninfo} />
            </Button>
          )}
        </Grid>
      ),
    },
  ];

  // Datatable
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQueryApplyLeave(value);
    applyNormalFilter(value);
    setFilteredRowData([]);
  };

  const applyNormalFilter = (searchValue) => {
    // Split the search query into individual terms
    const searchTerms = searchValue.toLowerCase().split(' ');

    // Modify the filtering logic to check each term
    const filtered = items?.filter((item) => {
      return searchTerms.every((term) => Object.values(item).join(' ').toLowerCase().includes(term));
    });
    setFilteredDataItems(filtered);
    setPageApplyLeave(1);
  };

  const applyAdvancedFilter = (filters, logicOperator) => {
    // Apply filtering logic with multiple conditions
    const filtered = items?.filter((item) => {
      return filters.reduce((acc, filter, index) => {
        const { column, condition, value } = filter;
        const itemValue = String(item[column])?.toLowerCase();
        const filterValue = String(value).toLowerCase();

        let match;
        switch (condition) {
          case 'Contains':
            match = itemValue.includes(filterValue);
            break;
          case 'Does Not Contain':
            match = !itemValue?.includes(filterValue);
            break;
          case 'Equals':
            match = itemValue === filterValue;
            break;
          case 'Does Not Equal':
            match = itemValue !== filterValue;
            break;
          case 'Begins With':
            match = itemValue.startsWith(filterValue);
            break;
          case 'Ends With':
            match = itemValue.endsWith(filterValue);
            break;
          case 'Blank':
            match = !itemValue;
            break;
          case 'Not Blank':
            match = !!itemValue;
            break;
          default:
            match = true;
        }

        // Combine conditions with AND/OR logic
        if (index === 0) {
          return match; // First filter is applied directly
        } else if (logicOperator === 'AND') {
          return acc && match;
        } else {
          return acc || match;
        }
      }, true);
    });

    setFilteredDataItems(filtered); // Update filtered data
    setAdvancedFilter(filters);
    // handleCloseSearchApplyLeave(); // Close the popover after search
  };

  // Undo filter funtion
  const handleResetSearch = () => {
    setAdvancedFilter(null);
    setSearchQueryApplyLeave('');
    setFilteredDataItems(items);
  };

  // Show filtered combination in the search bar
  const getSearchDisplay = () => {
    if (advancedFilter && advancedFilter.length > 0) {
      return advancedFilter
        .map((filter, index) => {
          let showname = columnDataTableApplyLeave.find((col) => col.field === filter.column)?.headerName;
          return `${showname} ${filter.condition} "${filter.value}"`;
        })
        .join(' ' + (advancedFilter.length > 1 ? advancedFilter[1].condition : '') + ' ');
    }
    return searchQueryApplyLeave;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPagesApplyLeave) {
      setPageApplyLeave(newPage);
      gridRefTableApplyLeave.current.api.paginationGoToPage(newPage - 1);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSizeApplyLeave(newSize);
    if (gridApi) {
      gridApi.paginationSetPageSize(newSize);
    }
  };

  // Show All Columns functionality
  const handleShowAllColumns = () => {
    const updatedVisibility = { ...columnVisibilityApplyLeave };
    for (const columnKey in updatedVisibility) {
      updatedVisibility[columnKey] = true;
    }
    setColumnVisibilityApplyLeave(updatedVisibility);
  };

  useEffect(() => {
    // Retrieve column visibility from localStorage (if available)
    const savedVisibility = localStorage.getItem('columnVisibilityApplyLeave');
    if (savedVisibility) {
      setColumnVisibilityApplyLeave(JSON.parse(savedVisibility));
    }
  }, []);

  useEffect(() => {
    // Save column visibility to localStorage whenever it changes
    localStorage.setItem('columnVisibilityApplyLeave', JSON.stringify(columnVisibilityApplyLeave));
  }, [columnVisibilityApplyLeave]);

  // // Function to filter columns based on search query
  const filteredColumns = columnDataTableApplyLeave.filter((column) => column.headerName.toLowerCase().includes(searchQueryManageApplyLeave.toLowerCase()));

  const DateFrom = (isUserRoleAccess.role.includes('HiringManager') || isUserRoleAccess.role.includes('Manager') || isUserRoleCompare.includes('lassignleaveapply')) && Accessdrop === 'HR' ? formattedDatePresent : formattedDatet;

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Manage Columns functionality
  const toggleColumnVisibility = (field) => {
    if (!gridApi) return;

    setColumnVisibilityApplyLeave((prevVisibility) => {
      const newVisibility = !prevVisibility[field];

      // Update the visibility in the grid
      gridApi.setColumnVisible(field, newVisibility);

      return {
        ...prevVisibility,
        [field]: newVisibility,
      };
    });
  };

  const handleColumnMoved = useCallback(
    debounce((event) => {
      if (!event.columnApi) return;

      const visible_columns = event.columnApi
        .getAllColumns()
        .filter((col) => {
          const colState = event.columnApi.getColumnState().find((state) => state.colId === col.colId);
          return colState && !colState.hide;
        })
        .map((col) => col.colId);

      setColumnVisibilityApplyLeave((prevVisibility) => {
        const updatedVisibility = { ...prevVisibility };

        // Ensure columns that are visible stay visible
        Object.keys(updatedVisibility).forEach((colId) => {
          updatedVisibility[colId] = visible_columns.includes(colId);
        });

        return updatedVisibility;
      });
    }, 300),
    []
  );

  const handleColumnVisible = useCallback((event) => {
    const colId = event.column.getColId();

    // Update visibility based on event, but only when explicitly triggered by grid
    setColumnVisibilityApplyLeave((prevVisibility) => ({
      ...prevVisibility,
      [colId]: event.visible, // Set visibility directly from the event
    }));
  }, []);

  // Excel
  const [fileFormat, setFormat] = useState('');
  let exportColumnNamescrt = ['Company', 'Branch', 'Unit', 'Team', 'Employee Name', 'Date', 'Module', 'Sub Module', 'Main Page', 'Sub Page', 'Sub Sub-Page'];
  let exportRowValuescrt = ['company', 'branch', 'unit', 'team', 'employeename', 'date', 'module', 'submodule', 'mainpage', 'subpage', 'subsubpage'];

  // Print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'User Document Upload',
    pageStyle: 'print',
  });

  // image
  const handleCaptureImage = () => {
    if (gridRefImageApplyLeave.current) {
      domtoimage
        .toBlob(gridRefImageApplyLeave.current)
        .then((blob) => {
          saveAs(blob, 'User Document Upload.png');
        })
        .catch((error) => {
          console.error('dom-to-image error: ', error);
        });
    }
  };

  return (
    <Box>
      <Headtitle title={'User Document Upload'} />
      {/* ****** Header Content ****** */}
      <PageHeading title="User Document Upload" modulename="Leave&Permission" submodulename="Approve Document" mainpagename="User Document Upload" subpagename="" subsubpagename="" />
      {isUserRoleCompare?.includes('auserdocumentupload') && (
        <Box sx={userStyle.dialogbox}>
          <>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography sx={userStyle.importheadtext}> Add User Document Upload</Typography>
              </Grid>
              {(isUserRoleAccess.role.includes('Manager') || isUserRoleCompare.includes('lassignuserdocumentupload')) && (
                <Grid item md={3} sm={6} xs={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>Access</Typography>
                    <Select
                      labelId="demo-select-small"
                      id="demo-select-small"
                      value={Accessdrop}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200,
                          },
                        },
                      }}
                      onChange={(e) => {
                        setAccesDrop(e.target.value);
                        setUserDocument({ ...userDocument, date: '' });
                      }}
                    >
                      <MenuItem value={'Employee'}>Self</MenuItem>
                      <MenuItem value={'HR'}>Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
            <br />
            <Grid container spacing={2}>
              {Accessdrop === 'HR' ? (
                <>
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Company<b style={{ color: 'red' }}>*</b>
                      </Typography>
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
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>
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
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>
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
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Employee Name<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <Selects
                        // options={empnames}
                        options={allUsersData
                          ?.filter((u) => valueCompanyCat?.includes(u.company) && valueBranchCat?.includes(u.branch) && valueUnitCat?.includes(u.unit) && valueTeamCat?.includes(u.team))
                          .map((u) => ({
                            ...u,
                            label: u.companyname,
                            value: u.companyname,
                          }))}
                        styles={colourStyles}
                        value={{ label: userDocument.employeename, value: userDocument.employeename }}
                        onChange={(e) => {
                          setUserDocument({ ...userDocument, employeename: e.value, employeeid: e.empcode, reportingto: e.reportingto, department: e.department, designation: e.designation, doj: e.doj, boardingLog: e.boardingLog, workmode: e.workmode, date: '' });
                        }}
                      />
                    </FormControl>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Employee Name</Typography>
                      <OutlinedInput id="component-outlined" type="text" value={isUserRoleAccess.companyname} />
                    </FormControl>
                  </Grid>
                </>
              )}

              <Grid item md={3} sm={12} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Module Name <b style={{ color: 'red' }}>*</b>
                  </Typography>

                  <Selects
                    options={rolesNewList[0]?.modulename?.filter(item => onlyShow.module.includes(item))?.map((item) => {
                      return { label: item, value: item };
                    })}
                    styles={colourStyles}
                    value={{
                      label: singleSelectValues.module,
                      value: singleSelectValues.module,
                    }}
                    onChange={(e) => {
                      setSingleSelectValues({
                        ...singleSelectValues,
                        module: e.value,
                        submodule: 'Please Select Sub Module',
                        mainpage: 'Please Select Main Page',
                        subpage: 'Please Select Sub Page',
                        subsubpage: 'Please Select Sub Sub Page',
                        category: 'Please Select Category',
                        subcategory: 'Please Select Sub Category',
                      });
                      handleModuleNameChange(e.value);
                      setMainPageoptions([]);
                      setSubPageoptions([]);
                      setsubSubPageoptions([]);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} sm={12} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Sub Module Name<b style={{ color: 'red' }}>*</b>
                  </Typography>

                  <Selects
                    options={subModuleOptions?.filter(item => onlyShow.submodule.includes(item.value))}
                    styles={colourStyles}
                    value={{
                      label: singleSelectValues.submodule,
                      value: singleSelectValues.submodule,
                    }}
                    onChange={(e) => {
                      setSingleSelectValues({
                        ...singleSelectValues,
                        submodule: e.value,
                        mainpage: 'Please Select Main Page',
                        subpage: 'Please Select Sub Page',
                        subsubpage: 'Please Select Sub Sub Page',
                        category: 'Please Select Category',
                        subcategory: 'Please Select Sub Category',
                      });
                      handleSubModuleNameChange(singleSelectValues.module, e.value);
                      setSubPageoptions([]);
                      setsubSubPageoptions([]);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} sm={12} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>Main Page</Typography>

                  <Selects
                    options={mainPageoptions?.filter(item => onlyShow.mainpage.includes(item.value))}
                    styles={colourStyles}
                    value={{
                      label: singleSelectValues.mainpage,
                      value: singleSelectValues.mainpage,
                    }}
                    onChange={(e) => {
                      setSingleSelectValues({
                        ...singleSelectValues,
                        mainpage: e.value,
                        subpage: 'Please Select Sub Page',
                        subsubpage: 'Please Select Sub Sub Page',
                        category: 'Please Select Category',
                        subcategory: 'Please Select Sub Category',
                      });
                      handleMainPageChange([e]);
                      handleMainPageNameChange(singleSelectValues.module, singleSelectValues.submodule, e.value);
                      setsubSubPageoptions([]);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} sm={12} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>Sub Page</Typography>

                  <Selects
                    options={subPageoptions?.filter(item => onlyShow.subpage.includes(item.value))}
                    styles={colourStyles}
                    value={{
                      label: singleSelectValues.subpage,
                      value: singleSelectValues.subpage,
                    }}
                    onChange={(e) => {
                      setSingleSelectValues({
                        ...singleSelectValues,
                        subpage: e.value,
                        subsubpage: 'Please Select Sub Sub Page',
                        category: 'Please Select Category',
                        subcategory: 'Please Select Sub Category',
                      });
                      handleSubPageNameChange(singleSelectValues.module, singleSelectValues.submodule, singleSelectValues.mainpage, e.value);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} sm={12} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>Sub Sub-Page</Typography>
                  <Selects
                    options={subSubPageoptions?.filter(item => onlyShow.subsubpage.includes(item.value))}
                    styles={colourStyles}
                    value={{
                      label: singleSelectValues.subsubpage,
                      value: singleSelectValues.subsubpage,
                    }}
                    onChange={(e) => {
                      setSingleSelectValues({
                        ...singleSelectValues,
                        subsubpage: e.value,
                        category: 'Please Select Category',
                        subcategory: 'Please Select Sub Category',
                      });
                    }}
                  />
                </FormControl>
              </Grid>
              {!["Remote Employee List", "Remote Employee Details List"]?.includes(singleSelectValues.subsubpage) && 
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Date<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="date"
                    value={userDocument.date}
                    onChange={(e) => {
                      setUserDocument({ ...userDocument, date: e.target.value });
                    }}
                  />
                </FormControl>
              </Grid>}
              <Grid item md={12} xs={12} sm={12}></Grid>
              <br />
              <Grid item xs={12} sx={{ margin: '20px 0px 10px 0px' }}>
                <Typography sx={userStyle.importheadtext}>
                  <b>
                    Upload Attachments<b style={{ color: 'red' }}>*</b>
                  </b>
                </Typography>
              </Grid>
              <Grid item lg={2} md={2} xs={12} sm={12} sx={{ marginTop: '20px' }}>
                <Button variant="outlined" size="small" sx={buttonStyles.buttonsubmit} component="label">
                  Upload
                  <input type="file" id="resume" multiple accept=".pdf, .doc, .txt," name="file" hidden onChange={handleResumeUpload} />
                </Button>
              </Grid>
              <Grid item lg={6} md={6} xs={12} sm={12} sx={{ marginTop: '20px' }}>
                {upload?.length > 0 &&
                  upload?.map((file, index) => (
                    <>
                      <Grid container spacing={2}>
                        <Grid item lg={8} md={8} sm={8} xs={8}>
                          <Typography>{file.name}</Typography>
                        </Grid>
                        <Grid item lg={1} md={1} sm={1} xs={1}>
                          <VisibilityOutlinedIcon
                            style={{
                              fontsize: 'large',
                              color: '#357AE8',
                              cursor: 'pointer',
                            }}
                            onClick={() => renderFilePreview(file)}
                          />
                        </Grid>
                        <Grid item lg={1} md={1} sm={1} xs={1}>
                          <Button
                            style={{
                              fontsize: 'large',
                              color: '#357AE8',
                              cursor: 'pointer',
                              marginTop: '-5px',
                            }}
                            onClick={() => handleFileDelete(index)}
                          >
                            <DeleteIcon />
                          </Button>
                        </Grid>
                      </Grid>
                    </>
                  ))}
              </Grid>
              <br />
            </Grid>
            <Grid container spacing={1}>
              <Grid item lg={1} md={2} sm={2} xs={12}>
                <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                  <LoadingButton loading={btnSubmit} variant="contained" sx={buttonStyles.buttonsubmit} onClick={handleSubmit}>
                    Submit
                  </LoadingButton>
                </Box>
              </Grid>
              <Grid item lg={1} md={2} sm={2} xs={12}>
                <Box sx={(theme) => ({ mt: { lg: 3, md: 2, sm: 1, xs: 0 } })}>
                  <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                    Clear
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </>
        </Box>
      )}
      <br />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes('luserdocumentupload') && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid container spacing={2} style={userStyle.dataTablestyle}>
              <Grid item md={12} sm={12} xs={12}>
                <Typography sx={userStyle.importheadtext}>User Document Upload List</Typography>
              </Grid>
              <Grid item md={2} xs={12} sm={12}>
                <Box>
                  <label>Show entries:</label>
                  <Select
                    id="pageSizeSelect"
                    value={pageSizeApplyLeave}
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
                    <MenuItem value={userDocuments?.length}>All</MenuItem>
                  </Select>
                </Box>
              </Grid>
              <Grid item md={8} xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box>
                  {isUserRoleCompare?.includes('exceluserdocumentupload') && (
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
                  {isUserRoleCompare?.includes('csvuserdocumentupload') && (
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
                  {isUserRoleCompare?.includes('printuserdocumentupload') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('pdfuserdocumentupload') && (
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
                  {isUserRoleCompare?.includes('imageuserdocumentupload') && (
                    <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}>
                      {' '}
                      <ImageIcon sx={{ fontSize: '15px' }} /> &ensp;Image&ensp;{' '}
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item md={2} xs={6} sm={6}>
                <FormControl fullWidth size="small">
                  <OutlinedInput
                    size="small"
                    id="outlined-adornment-weight"
                    startAdornment={
                      <InputAdornment position="start">
                        <FaSearch />
                      </InputAdornment>
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        {advancedFilter && (
                          <IconButton onClick={handleResetSearch}>
                            <MdClose />
                          </IconButton>
                        )}
                        <Tooltip title="Show search options">
                          <span>
                            <IoMdOptions style={{ cursor: 'pointer' }} onClick={handleClickSearchApplyLeave} />
                          </span>
                        </Tooltip>
                      </InputAdornment>
                    }
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{ 'aria-label': 'weight' }}
                    type="text"
                    value={getSearchDisplay()}
                    onChange={handleSearchChange}
                    placeholder="Type to search..."
                    disabled={!!advancedFilter}
                  />
                </FormControl>
              </Grid>
            </Grid>{' '}
            <br />
            <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>
              {' '}
              Show All Columns{' '}
            </Button>{' '}
            &ensp;
            <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumnsApplyLeave}>
              {' '}
              Manage Columns{' '}
            </Button>{' '}
            &ensp;
            {isUserRoleCompare?.includes('bduserdocumentupload') && (
              <>
                <Button variant="contained" color="error" onClick={handleClickOpenalert}>
                  Bulk Delete
                </Button>
              </>
            )}
            <br /> <br />
            {!userCheck ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ width: '100%' }} className={'ag-theme-quartz'} ref={gridRefImageApplyLeave}>
                  <AgGridReact
                    rowData={filteredDataItems}
                    columnDefs={columnDataTableApplyLeave.filter((column) => columnVisibilityApplyLeave[column.field])}
                    ref={gridRefTableApplyLeave}
                    defaultColDef={defaultColDef}
                    domLayout={'autoHeight'}
                    getRowStyle={getRowStyle}
                    pagination={true}
                    paginationPageSize={pageSizeApplyLeave}
                    onPaginationChanged={onPaginationChanged}
                    onGridReady={onGridReady}
                    onColumnMoved={handleColumnMoved}
                    onColumnVisible={handleColumnVisible}
                    onFilterChanged={onFilterChanged}
                    // suppressPaginationPanel={true}
                    suppressSizeToFit={true}
                    suppressAutoSize={true}
                    suppressColumnVirtualisation={true}
                    colResizeDefault={'shift'}
                  />
                </Box>
              </>
            )}
          </Box>
        </>
      )}
      {/* Manage Column */}
      <Popover id={idApplyLeave} open={isManageColumnsOpenApplyLeave} anchorEl={anchorElApplyLeave} onClose={handleCloseManageColumnsApplyLeave} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <ManageColumnsContent
          handleClose={handleCloseManageColumnsApplyLeave}
          searchQuery={searchQueryManageApplyLeave}
          setSearchQuery={setSearchQueryManageApplyLeave}
          filteredColumns={filteredColumns}
          columnVisibility={columnVisibilityApplyLeave}
          toggleColumnVisibility={toggleColumnVisibility}
          setColumnVisibility={setColumnVisibilityApplyLeave}
          initialColumnVisibility={initialColumnVisibilityApplyLeave}
          columnDataTable={columnDataTableApplyLeave}
        />
      </Popover>

      {/* Search Bar */}
      <Popover id={idSearchApplyLeave} open={openSearchApplyLeave} anchorEl={anchorElSearchApplyLeave} onClose={handleCloseSearchApplyLeave} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <AdvancedSearchBar columns={columnDataTableApplyLeave?.filter((data) => data.field !== 'actions')} onSearch={applyAdvancedFilter} initialSearchValue={searchQueryApplyLeave} handleCloseSearch={handleCloseSearchApplyLeave} />
      </Popover>

      {/* Edit DIALOG */}
      <Dialog
        open={isEditOpen}
        onClose={handleCloseModEdit}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={true}
        maxWidth="lg"
        sx={{ marginTop: '95px' }}
      // sx={{
      //   overflow: "visible",
      //   "& .MuiPaper-root": {
      //     overflow: "visible",
      //   },
      // }}
      >
        <Box sx={{ padding: '20px' }}>
          <>
            <form>
              {/* <DialogContent sx={{ width: '550px', padding: '20px' }}> */}
              <Grid container spacing={2}>
                <Grid item md={8} xs={12} sm={12}>
                  <Typography sx={userStyle.HeaderText}>Edit User Document Upload</Typography>
                </Grid>
                {(isUserRoleAccess.role.includes('Manager') || isUserRoleCompare.includes('lassignuserdocumentupload')) && (
                  <Grid item md={3} sm={6} xs={12}>
                    <FormControl size="small" fullWidth>
                      <Typography>Access</Typography>
                      <Select
                        labelId="demo-select-small"
                        id="demo-select-small"
                        value={AccessdropEdit}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 200,
                            },
                          },
                        }}
                        onChange={(e) => {
                          setAccesDropEdit(e.target.value);
                          setUserdocumentEdit({
                            ...userDocumentEdit,
                            //  date: "" ,
                            company: 'Please Select Company',
                            branch: 'Please Select Branch',
                            unit: 'Please Select Unit',
                            team: 'Please Select Team',
                            employeename: 'Please Select Employee Name',
                          });
                        }}
                      >
                        <MenuItem value={'Employee'}>Self</MenuItem>
                        <MenuItem value={'HR'}>Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>
              <br />
              <Grid container spacing={2}>
                {AccessdropEdit === 'HR' ? (
                  <>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Company<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          // options={isAssignBranch
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
                            label: userDocumentEdit.company,
                            value: userDocumentEdit.company,
                          }}
                          onChange={(e) => {
                            setUserdocumentEdit({
                              ...userDocumentEdit,
                              company: e.value,
                              companycode: e.companycode,
                              branch: 'Please Select Branch',
                              unit: 'Please Select Unit',
                              team: 'Please Select Team',
                              employeename: 'Please Select Employee Name',
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Branch<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          options={accessbranch
                            ?.filter((comp) => userDocumentEdit.company === comp.company)
                            ?.map((data) => ({
                              label: data.branch,
                              value: data.branch,
                            }))
                            .filter((item, index, self) => {
                              return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                            })}
                          styles={colourStyles}
                          value={{
                            label: userDocumentEdit.branch,
                            value: userDocumentEdit.branch,
                          }}
                          onChange={(e) => {
                            setUserdocumentEdit({
                              ...userDocumentEdit,
                              branch: e.value,
                              // branchpincode: e.branchpincode,
                              unit: 'Please Select Unit',
                              team: 'Please Select Team',
                              employeename: 'Please Select Employee Name',
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Unit<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          options={accessbranch
                            ?.filter((comp) => userDocumentEdit.company === comp.company && userDocumentEdit.branch === comp.branch)
                            ?.map((data) => ({
                              label: data.unit,
                              value: data.unit,
                            }))
                            .filter((item, index, self) => {
                              return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                            })}
                          styles={colourStyles}
                          value={{
                            label: userDocumentEdit.unit,
                            value: userDocumentEdit.unit,
                          }}
                          onChange={(e) => {
                            setUserdocumentEdit({
                              ...userDocumentEdit,
                              unitcode: e.unitcode,
                              unit: e.value,
                              team: 'Please Select Team',
                              employeename: 'Please Select Employee Name',
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Team<b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          options={allTeam
                            ?.filter((comp) => userDocumentEdit.company === comp.company && userDocumentEdit.branch === comp.branch && userDocumentEdit.unit === comp.unit)
                            ?.map((data) => ({
                              label: data.teamname,
                              value: data.teamname,
                            }))
                            .filter((item, index, self) => {
                              return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                            })}
                          styles={colourStyles}
                          value={{
                            label: userDocumentEdit.team,
                            value: userDocumentEdit.team,
                          }}
                          onChange={(e) => {
                            setUserdocumentEdit({
                              ...userDocumentEdit,
                              team: e.value,
                              employeename: 'Please Select Employee Name',
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Employee Name <b style={{ color: 'red' }}>*</b>
                        </Typography>
                        <Selects
                          options={allUsersData
                            ?.filter((comp) => userDocumentEdit.company === comp.company && userDocumentEdit.branch === comp.branch && userDocumentEdit.unit === comp.unit && userDocumentEdit.team === comp.team)
                            ?.map((data) => ({
                              label: data.companyname,
                              value: data.companyname,
                            }))
                            .filter((item, index, self) => {
                              return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                            })}
                          styles={colourStyles}
                          value={{
                            label: userDocumentEdit.employeename,
                            value: userDocumentEdit.employeename,
                          }}
                          onChange={(e) => {
                            setUserdocumentEdit({
                              ...userDocumentEdit,
                              employeename: e.value,
                            });
                          }}
                        />
                      </FormControl>

                      <br />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Employee Name</Typography>
                        <OutlinedInput id="component-outlined" type="text" value={isUserRoleAccess.companyname} />
                      </FormControl>
                    </Grid>
                  </>
                )}

                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Module Name <b style={{ color: 'red' }}>*</b>
                    </Typography>

                    <Selects
                      options={rolesNewList[0]?.modulename?.filter(item => onlyShow.module.includes(item))?.map((item) => {
                        return { label: item, value: item };
                      })}
                      styles={colourStyles}
                      value={{
                        label: singleSelectValuesEdit.module !== '' ? singleSelectValuesEdit.module : 'Please Select Module',
                        value: singleSelectValuesEdit.module !== '' ? singleSelectValuesEdit.module : 'Please Select Module',
                      }}
                      onChange={(e) => {
                        setSingleSelectValuesEdit({
                          ...singleSelectValuesEdit,
                          module: e.value,
                          submodule: '',
                          mainpage: '',
                          subpage: '',
                          subsubpage: '',
                        });
                        handleModuleNameChangeEdit(e.value);
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
                      Sub Module Name<b style={{ color: 'red' }}>*</b>
                    </Typography>

                    <Selects
                      options={subModuleOptionsEdit?.filter(item => onlyShow.submodule.includes(item.value))}
                      styles={colourStyles}
                      value={{
                        label: singleSelectValuesEdit.submodule !== '' ? singleSelectValuesEdit.submodule : 'Please Select Sub Module',
                        value: singleSelectValuesEdit.submodule !== '' ? singleSelectValuesEdit.submodule : 'Please Select Sub Module',
                      }}
                      onChange={(e) => {
                        setSingleSelectValuesEdit({
                          ...singleSelectValuesEdit,
                          submodule: e.value,
                          mainpage: '',
                          subpage: '',
                          subsubpage: '',
                        });
                        handleSubModuleNameChangeEdit(singleSelectValuesEdit.module, e.value);
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
                      options={mainPageoptionsEdit?.filter(item => onlyShow.mainpage.includes(item.value))}
                      styles={colourStyles}
                      value={{
                        label: singleSelectValuesEdit.mainpage !== '' ? singleSelectValuesEdit.mainpage : 'Please Select Main Page',
                        value: singleSelectValuesEdit.mainpage !== '' ? singleSelectValuesEdit.mainpage : 'Please Select Main Page',
                      }}
                      onChange={(e) => {
                        setSingleSelectValuesEdit({
                          ...singleSelectValuesEdit,
                          mainpage: e.value,
                          subpage: '',
                          subsubpage: '',
                        });
                        handleMainPageChangeEdit([e]);
                        handleMainPageNameChangeEdit(singleSelectValuesEdit.module, singleSelectValuesEdit.submodule, e.value);
                        setsubSubPageoptionsEdit([]);
                      }}
                    />
                  </FormControl>
                </Grid>

                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Sub Page</Typography>

                    <Selects
                      options={subPageoptionsEdit?.filter(item => onlyShow.subpage.includes(item.value))}
                      styles={colourStyles}
                      value={{
                        label: singleSelectValuesEdit.subpage !== '' ? singleSelectValuesEdit.subpage : 'Please Select Sub Page',
                        value: singleSelectValuesEdit.subpage !== '' ? singleSelectValuesEdit.subpage : 'Please Select Sub Page',
                      }}
                      onChange={(e) => {
                        setSingleSelectValuesEdit({
                          ...singleSelectValuesEdit,
                          subpage: e.value,
                          subsubpage: '',
                        });
                        handleSubPageNameChangeEdit(singleSelectValuesEdit.module, singleSelectValuesEdit.submodule, singleSelectValuesEdit.mainpage, e.value);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Sub Sub-Page</Typography>
                    <Selects
                      options={subSubPageoptionsEdit?.filter(item => onlyShow.subsubpage.includes(item.value))}
                      styles={colourStyles}
                      value={{
                        label: singleSelectValuesEdit.subsubpage !== '' ? singleSelectValuesEdit.subsubpage : 'Please Select Sub Sub Page',
                        value: singleSelectValuesEdit.subsubpage !== '' ? singleSelectValuesEdit.subsubpage : 'Please Select Sub Sub Page',
                      }}
                      onChange={(e) => {
                        setSingleSelectValuesEdit({
                          ...singleSelectValuesEdit,
                          subsubpage: e.value,
                          category: 'Please Select Category',
                          subcategory: 'Please Select Sub Category',
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                 {!["Remote Employee List", "Remote Employee Details List"]?.includes(singleSelectValuesEdit.subsubpage) && 
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Date<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="date"
                      value={userDocumentEdit.date}
                      onChange={(e) => {
                        setUserdocumentEdit({ ...userDocumentEdit, date: e.target.value });
                      }}
                    />
                  </FormControl>
                </Grid>
}
                <br />

                <br />
                <Grid item xs={12} sx={{ margin: '20px 0px 10px 0px' }}>
                  <Typography sx={userStyle.importheadtext}>
                    {' '}
                    <b>
                      Upload Attachments<b style={{ color: 'red' }}>*</b>
                    </b>{' '}
                  </Typography>
                </Grid>
                <Grid item lg={2} md={2} xs={12} sm={12} sx={{ marginTop: '20px' }}>
                  <Button variant="outlined" size="small" sx={buttonStyles.buttonsubmit} component="label">
                    Upload
                    <input type="file" id="resume" multiple accept=".pdf, .doc, .txt," name="file" hidden onChange={handleResumeUploadEdit} />{' '}
                  </Button>
                </Grid>
                <Grid item lg={6} md={6} xs={12} sm={12} sx={{ marginTop: '20px' }}>
                  {uploadEdit?.length > 0 &&
                    uploadEdit?.map((file, index) => (
                      <>
                        <Grid container spacing={2}>
                          <Grid item lg={8} md={8} sm={8} xs={8}>
                            <Typography>{file.name}</Typography>
                          </Grid>
                          <Grid item lg={1} md={1} sm={1} xs={1}>
                            <VisibilityOutlinedIcon
                              style={{
                                fontsize: 'large',
                                color: '#357AE8',
                                cursor: 'pointer',
                              }}
                              onClick={() => renderFilePreviewEdit(file)}
                            />
                          </Grid>
                          <Grid item lg={1} md={1} sm={1} xs={1}>
                            <Button
                              style={{
                                fontsize: 'large',
                                color: '#357AE8',
                                cursor: 'pointer',
                                marginTop: '-5px',
                              }}
                              onClick={() => handleFileDeleteEdit(index)}
                            >
                              <DeleteIcon />
                            </Button>
                          </Grid>
                        </Grid>
                      </>
                    ))}
                </Grid>
                <br />
              </Grid>
              <br />
              <br />

              <Grid container spacing={2}>
                <Grid item md={6} xs={6} sm={6}>
                  <Button variant="contained" sx={buttonStyles.buttonsubmit} onClick={editSubmit}>
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

      {/* view model */}
      <Dialog open={openview} onClose={handleClickOpenview} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="lg" sx={{ marginTop: '95px' }}>
        <Box sx={{ width: '950px', padding: '20px 50px' }}>
          <>
            <Typography sx={userStyle.HeaderText}> View User Document Upload</Typography>
            <br /> <br />
            <Grid container spacing={2}>
              {(isUserRoleAccess.role.includes('HiringManager') || isUserRoleAccess.role.includes('Manager')) && (
                <Grid item md={3} sm={6} xs={12}>
                  <Typography variant="h6">Access</Typography>
                  <Typography>{userDocumentEdit?.access === 'HR' ? 'Other' : 'Self'}</Typography>
                </Grid>
              )}
            </Grid>
            <br />
            <Grid container spacing={2}>
              {/* {userDocumentEdit?.access === "HR" ? ( */}
              <>
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6"> Company </Typography>
                    {/* <Typography>
                                                {Array.isArray(selectedOptionsCompanyEdit) ? selectedOptionsCompanyEdit.map((item, index) => (`${index + 1}. ${item.value} `)) : ""}
                                            </Typography> */}
                    <Typography>{userDocumentEdit.company}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6"> Branch</Typography>
                    <Typography>{userDocumentEdit.branch}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6"> Unit </Typography>
                    <Typography>{userDocumentEdit.unit}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6"> Team </Typography>
                    <Typography>{userDocumentEdit.team}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Employee Name</Typography>
                    <Typography>{userDocumentEdit.employeename}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Date</Typography>
                    <Typography>{userDocumentEdit?.date ? moment(userDocumentEdit?.date)?.format("DD-MM-YYYY") : ""}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Module</Typography>
                    <Typography>{userDocumentEdit.modulename}</Typography>
                  </FormControl>
                </Grid>
                <br />
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Sub-Module</Typography>
                    <Typography>{userDocumentEdit.submodulename}</Typography>
                  </FormControl>
                </Grid>
                <br />
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Main Page</Typography>
                    <Typography>{userDocumentEdit.mainpagename}</Typography>
                  </FormControl>
                </Grid>
                <br />
                <Grid item md={3} xs={12} sm={12}>
                  <Typography variant="h6">Sub-Page</Typography>
                  <FormControl fullWidth size="small">
                    <Typography>{userDocumentEdit.subpagename}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <Typography variant="h6">Sub Sub-Page</Typography>
                  <FormControl fullWidth size="small">
                    <Typography>{userDocumentEdit.subsubpagename}</Typography>
                  </FormControl>
                </Grid>
              </>
              {/* ) : ( */}
              <>
                {/* <Grid item md={3} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                            <Typography variant="h6">Employee Name</Typography>
                                            <Typography>{userDocumentEdit?.employeename}</Typography>
                                        </FormControl>
                                    </Grid> */}
              </>
              {/* )} */}

              <br />
            </Grid>
            <br />
            <br />
            <Grid item md={12} sm={12} xs={12}>
              <Typography variant="h6">Attachment</Typography>
              <Grid marginTop={2}>
                {uploadEdit?.length > 0 &&
                  uploadEdit?.map((file, index) => (
                    <>
                      <Grid container spacing={2}>
                        <Grid item lg={4} md={8} sm={8} xs={8}>
                          <Typography>{file.name}</Typography>
                        </Grid>
                        <Grid item lg={1} md={1} sm={1} xs={1}>
                          <VisibilityOutlinedIcon
                            style={{
                              fontsize: 'large',
                              color: '#357AE8',
                              cursor: 'pointer',
                            }}
                            onClick={() => renderFilePreview(file)}
                          />
                        </Grid>
                      </Grid>
                    </>
                  ))}
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

      {/* document View */}

      <Dialog open={isimgviewbill} onClose={handlecloseImgcodeviewbill} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="md" fullWidth>
        <DialogContent>
          <Typography variant="h6">Document Files</Typography>

          {getimgbillcode.map((imagefilebill, index) => (
            <Grid container key={index}>
              <Grid item md={8} sm={10} xs={10} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>{imagefilebill.name}</Typography>
              </Grid>

              <Grid item md={4} sm={1} xs={1}>
                <Button
                  sx={{
                    padding: '14px 14px',
                    minWidth: '40px !important',
                    borderRadius: '50% !important',
                    ':hover': {
                      backgroundColor: '#80808036', // theme.palette.primary.main
                    },
                  }}
                  onClick={() => renderFilePreview(imagefilebill)}
                >
                  <VisibilityOutlinedIcon
                    style={{
                      fontsize: '12px',
                      color: '#357AE8',
                      marginTop: '35px !important',
                    }}
                  />
                </Button>
              </Grid>
            </Grid>
          ))}
        </DialogContent>

        <DialogActions>
          <Button onClick={handlecloseImgcodeviewbill} sx={userStyle.btncancel}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
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
        filteredDataTwo={(filteredRowData.length > 0 ? filteredRowData : filteredData) ?? []}
        itemsTwo={items ?? []}
        filename={'User Document Upload'}
        exportColumnNames={exportColumnNamescrt}
        exportRowValues={exportRowValuescrt}
        componentRef={componentRef}
      />
      <InfoPopup openInfo={openInfo} handleCloseinfo={handleCloseinfo} heading="User Document Upload Info" addedby={addedby} updateby={updateby} />
      <DeleteConfirmation open={isDeleteOpen} onClose={handleCloseMod} onConfirm={delApply} title="Are you sure?" confirmButtonText="Yes" cancelButtonText="Cancel" />
      <DeleteConfirmation open={isDeleteOpencheckbox} onClose={handleCloseModcheckbox} onConfirm={delApplycheckbox} title="Are you sure?" confirmButtonText="Yes" cancelButtonText="Cancel" />
      <PleaseSelectRow open={isDeleteOpenalert} onClose={handleCloseModalert} message="Please Select any Row" iconColor="orange" buttonText="OK" />
    </Box>
  );
}

export default UserDocumentUpload;