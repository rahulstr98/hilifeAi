import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextareaAutosize,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import axios from '../../../axiosInstance.js';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';
import 'jspdf-autotable';
import moment from 'moment-timezone';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint, FaSearch } from 'react-icons/fa';
import { IoMdOptions } from 'react-icons/io';
import { MdClose } from 'react-icons/md';
import { ThreeDots } from 'react-loader-spinner';
import { MultiSelect } from 'react-multi-select-component';
import Selects from 'react-select';
import { useReactToPrint } from 'react-to-print';
import AggridTableForPaginationTable from '../../../components/AggridTableForPaginationTable.js';
import AlertDialog from '../../../components/Alert.js';
import { handleApiError } from '../../../components/Errorhandling.js';
import ExportData from '../../../components/ExportData.js';
import Headtitle from '../../../components/Headtitle.js';
import MessageAlert from '../../../components/MessageAlert.js';
import PageHeading from '../../../components/PageHeading.js';
import { AuthContext, UserRoleAccessContext } from '../../../context/Appcontext.js';
import { userStyle } from '../../../pageStyle.js';
import { SERVICE } from '../../../services/Baseservice.js';
import { getCurrentServerTime } from '../../../components/getCurrentServerTime.js';
import Branchforwardedlist from './Branchforwardedlist.js';
const ScrollingText = ({ text }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const containerWidth = containerRef.current.offsetWidth;
    const textElement = textRef.current;

    if (!textElement) return;

    const textWidth = textElement.offsetWidth;
    let position = 0;

    const scrollText = () => {
      position -= 1;
      if (position < -textWidth) {
        position = containerWidth;
      }
      textElement.style.transform = `translateX(${position}px)`;
      requestAnimationFrame(scrollText);
    };

    scrollText();

    return () => cancelAnimationFrame(scrollText);
  }, []);

  return (
    <Grid
      item
      xs={8}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Typography
        sx={{
          ...userStyle.importheadtext,
          fontSize: '1.4rem',
          marginRight: '1rem',
        }}
      >
        {'Filter Visitors Details'}
      </Typography>
      <div ref={containerRef} style={{ overflow: 'hidden', width: '30%', whiteSpace: 'nowrap' }}></div>
    </Grid>
  );
};

function VisitorBranchForwardList() {
  const [serverTime, setServerTime] = useState(null);
  const [filterUser, setFilterUser] = useState({
    day: 'Today',
    fromtime: '00:00',
    totime: '23:59',
    fromdate: moment().format('YYYY-MM-DD'),
    todate: moment().format('YYYY-MM-DD'),

    company: 'Please Select Company',
    branch: 'Please Select Branch',

    type: 'Please Select Type',
    percentage: '',
  });

  useEffect(() => {
    const fetchTime = async () => {
      const time = await getCurrentServerTime();
      setServerTime(time);
      setFilterUser({
        day: 'Today',
        fromtime: '00:00',
        totime: '23:59',
        fromdate: moment(time).format('YYYY-MM-DD'),
        todate: moment(time).format('YYYY-MM-DD'),
        company: 'Please Select Company',
        branch: 'Please Select Branch',

        type: 'Please Select Type',
        percentage: '',
      });
    };

    fetchTime();
  }, []);
  const [advancedFilter, setAdvancedFilter] = useState(null);
  const [additionalFilters, setAdditionalFilters] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const conditions = ['Contains', 'Does Not Contain', 'Equals', 'Does Not Equal', 'Begins With', 'Ends With', 'Blank', 'Not Blank']; // AgGrid-like conditions
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('Contains');
  const [logicOperator, setLogicOperator] = useState('AND');
  const [filterValue, setFilterValue] = useState('');
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);

  const [totalProjects, setTotalProjects] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

  // var today = new Date();
  // var dd = String(today.getDate()).padStart(2, '0');
  // var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  // var yyyy = today.getFullYear();
  // today = yyyy + '-' + mm + '-' + dd;

  // useEffect(() => {
  //   exportallData();
  // }, [isFilterOpen, isPdfFilterOpen]);

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

  const [selectedOptionsEdit, setSelectedOptionsEdit] = useState([]);
  const [fileFormat, setFormat] = useState('');

  let exportColumnNames = ['Company', 'Branch', 'Unit', 'Date', "Visitor's ID", 'Visitor Name', 'Visitor Type', 'Visitor Mode', 'Visitor Purpose', 'Visitor Contact No', 'IN Time', 'OUT Time'];
  let exportRowValues = ['company', 'branch', 'unit', 'date', 'visitorid', 'visitorname', 'visitortype', 'visitormode', 'visitorpurpose', 'visitorcontactnumber', 'intime', 'outtime'];

  const [vendormaster, setVendormaster] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryManage, setSearchQueryManage] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { isUserRoleCompare, isUserRoleAccess, buttonStyles, pageName, setPageName, isAssignBranch, allTeam, allUsersData } = useContext(UserRoleAccessContext);

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

  const { auth } = useContext(AuthContext);
  const [vendorCheck, setVendorcheck] = useState(false);
  const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    actions: true,
    checkbox: true,
    company: true,
    branch: true,
    unit: true,
    date: true,
    serialNumber: true,
    visitorid: true,

    visitorname: true,
    visitortype: true,
    visitormode: true,
    visitorpurpose: true,
    visitorcontactnumber: true,
    intime: true,
    outtime: true,
    addvisitorin: true,
    document: true,
  };
  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  const getDownloadFile = async (id) => {
    let url = `${SERVICE.VISITORDETAILS_LOG_SINGLE_PROFILE}/${encodeURIComponent(id)}`;
    let resVisitor = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });

    const file = resVisitor?.data?.svisitordetailslog?.slice(-1)[0]?.files || [];

    // Check if `file` is an array
    if (Array.isArray(file)) {
      for (const fileItem of file) {
        // Ensure `fileItem.preview` exists
        if (fileItem?.preview) {
          try {
            const response = await fetch(fileItem.preview);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            window.open(link, '_blank');
          } catch (error) {
            console.error(`Error fetching preview for ${fileItem.preview}:`, error);
          }
        } else {
          console.warn('No preview found for fileItem:', fileItem);
        }
      }
    } else {
      // Handle single file object
      try {
        const response = await fetch(file.preview);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        window.open(link, '_blank');
      } catch (error) {
        console.error(`Error fetching preview for ${file.preview}:`, error);
      }
    }
  };

  const [isUserData, setIsUserData] = useState({});
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
      lockPinned: true,
    },

    {
      field: 'serialNumber',
      headerName: 'S.No',
      flex: 0,
      width: 80,
      minHeight: '40px',
      hide: !columnVisibility.serialNumber,
      headerClassName: 'bold-header',
      pinned: 'left',
    },
    {
      field: 'actions',
      headerName: 'Action',
      flex: 0,
      width: 100,
      minHeight: '40px !important',
      sortable: false,
      hide: !columnVisibility.actions,
      headerClassName: 'bold-header',
      pinned: 'left',
      cellRenderer: (params) => (
        <Grid sx={{ display: 'flex' }}>
          {isUserRoleCompare?.includes('elistvisitors') && (
            <Button
              variant="contained"
              sx={userStyle.buttonsubmit}
              onClick={() => {
                rowData(params?.data?.id);
              }}
            >
              Forward
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
      minHeight: '40px',
      hide: !columnVisibility.company,
      headerClassName: 'bold-header',
      pinned: 'left',
    },
    {
      field: 'branch',
      headerName: 'Branch',
      flex: 0,
      width: 100,
      minHeight: '40px',
      hide: !columnVisibility.branch,
      headerClassName: 'bold-header',
      pinned: 'left',
    },
    {
      field: 'unit',
      headerName: 'Unit',
      flex: 0,
      width: 120,
      minHeight: '40px',
      hide: !columnVisibility.unit,
      headerClassName: 'bold-header',
      pinned: 'left',
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 0,
      width: 120,
      minHeight: '40px',
      hide: !columnVisibility.date,
      headerClassName: 'bold-header',
    },
    {
      field: 'visitorid',
      headerName: 'Visitor ID',
      flex: 0,
      width: 120,
      minHeight: '40px',
      hide: !columnVisibility.visitorid,
      headerClassName: 'bold-header',
    },
    {
      field: 'visitorname',
      headerName: 'Visitor Name',
      flex: 0,
      width: 150,
      minHeight: '40px',
      hide: !columnVisibility.visitorname,
      headerClassName: 'bold-header',
    },
    {
      field: 'visitortype',
      headerName: 'Visitor Type',
      flex: 0,
      width: 150,
      minHeight: '40px',
      hide: !columnVisibility.visitortype,
      headerClassName: 'bold-header',
    },
    {
      field: 'visitormode',
      headerName: 'Visitor Mode',
      flex: 0,
      width: 130,
      minHeight: '40px',
      hide: !columnVisibility.visitormode,
      headerClassName: 'bold-header',
    },
    {
      field: 'visitorpurpose',
      headerName: 'Visitor Purpose',
      flex: 0,
      width: 150,
      minHeight: '40px',
      hide: !columnVisibility.visitorpurpose,
      headerClassName: 'bold-header',
    },
    {
      field: 'visitorcontactnumber',
      headerName: 'Visitor Contact Number',
      flex: 0,
      width: 150,
      minHeight: '40px',
      hide: !columnVisibility.visitorcontactnumber,
      headerClassName: 'bold-header',
    },
    {
      field: 'intime',
      headerName: 'IN Time',
      flex: 0,
      width: 100,
      minHeight: '40px',
      hide: !columnVisibility.intime,
      headerClassName: 'bold-header',
    },
    {
      field: 'outtime',
      headerName: 'OUT Time',
      flex: 0,
      width: 100,
      minHeight: '40px',
      hide: !columnVisibility.outtime,
      headerClassName: 'bold-header',
    },
    {
      field: 'document',
      headerName: 'Profile',
      flex: 0,
      width: 180,
      minHeight: '40px',
      hide: !columnVisibility.document,
      cellRenderer: (params) => (
        <Grid>
          <div className="page-pdf" textAlign={'center'}>
            {params.data?.files !== 0 ? (
              <>
                <Button
                  variant="contained"
                  sx={{ width: '100%' }}
                  onClick={() => {
                    getDownloadFile(params.data.visitorid);
                  }}
                  className="next-pdf-btn pdf-button"
                >
                  View
                </Button>
              </>
            ) : (
              <>
                <Button variant="contained" sx={{ background: 'red', color: 'white', width: '100%' }} className="next-pdf-btn pdf-button">
                  {'NIL '}
                </Button>
              </>
            )}
          </div>
        </Grid>
      ),
    },
  ];

  const visitorviseDisabledAddResume = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.get(SERVICE.VISITORCANDIDATESALL);

      setAllCandidate(res?.data?.candidates);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [isForwardBranch, setIsForwardBranch] = useState({ reason: '', branch: '', unit: '' });
  const [isEditOpen, setIsEditOpen] = useState(false);
  //Edit model...
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setIsEditOpen(false);
  };

  const rowData = async (id) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.SINGLE_VISITORS}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      console.log(res?.data?.svisitors, 'res?.data?.svisitors');
      setIsUserData(res?.data?.svisitors);
      handleClickOpenEdit();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const editSubmit = () => {
    if (isForwardBranch?.branch === '') {
      setPopupContentMalert('Please Select Forward Branch');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (isForwardBranch?.branch === isUserData?.branch) {
      setPopupContentMalert('Exist BranchName and Forward BranchName are Same, Please Select Different Branch!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (isForwardBranch?.unit === '') {
      setPopupContentMalert('Please Select Forward Unit');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (isForwardBranch?.reason === '') {
      setPopupContentMalert('Please Enter Reason');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      sendRequest();
    }
  };
  const sendRequest = async () => {
    setPageName(!pageName);
    try {
      let addVendorDetails = await axios.put(`${SERVICE.VISITORS_UPDATE}/${isUserData?._id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        branch: String(isForwardBranch.branch),
        unit: String(isForwardBranch.unit),
        branchforwardlog: [
          ...isUserData?.branchforwardlog,
          {
            oldcompany: isUserData?.company,
            oldbranch: isUserData?.branch,
            oldunit: isUserData?.unit,
            createdusername: isUserRoleAccess?.companyname,
            forwardbranch: isForwardBranch?.branch,
            forwardunit: isForwardBranch?.unit,
            reason: isForwardBranch?.reason,
          },
        ],
      });

      handleCloseModEdit();
      fetchVendor();
      setPopupContent('Updated Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      console.log(err, 'err');
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const getapi = async () => {
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String('Visitor Branch Forward List'),
      commonid: String(isUserRoleAccess?._id),
      date: String(new Date()),

      addedby: [
        {
          name: String(isUserRoleAccess?.username),
          // date: String(new Date()),
        },
      ],
    });
  };

  const [selectedTypeEdit, setSelectedTypeEdit] = useState([]);
  const [selectedModeEdit, setSelectedModeEdit] = useState([]);
  const [selectedPurposeEdit, setSelectedPurposeEdit] = useState([]);

  const [selectedTypeCat, setSelectedTypeCat] = useState([]);
  const [selectedModeCat, setSelectedModeCat] = useState([]);
  const [selectedPurposeCat, setSelectedPurposeCat] = useState([]);

  const [interactorTypeArray, setInteractorTypeArray] = useState([]);
  const [interactorModeArray, setInteractorModeArray] = useState([]);
  const [interactorPurposeArray, setInteractorPurposeArray] = useState([]);
  const customValueRendererEditTypeFrom = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : <span style={{ color: 'hsl(0, 0%, 20%)' }}>Please Select Type</span>;
  };

  const customValueRendererEditModeFrom = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : <span style={{ color: 'hsl(0, 0%, 20%)' }}>Please Select Mode</span>;
  };

  const customValueRendererEditPurposeFrom = (valueCate, _employeename) => {
    return valueCate.length ? valueCate.map(({ label }) => label).join(', ') : <span style={{ color: 'hsl(0, 0%, 20%)' }}>Please Select Purpose</span>;
  };

  const fetchInteractorPurpose = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(SERVICE.ALL_MANAGETYPEPG, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let result = res?.data?.manageTypePG.filter((d) => e.some((typ) => d.interactorstype === typ?.value));

      let ans = result.flatMap((data) => data.interactorspurpose);

      setInteractorPurposeArray(
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

  const [mgTypePurpose, setMgTypePurpose] = useState([]);

  const fetchManagetypepurposeForAddResume = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(SERVICE.ALL_MANAGETYPEPG, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setMgTypePurpose(res?.data?.manageTypePG);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleTypeEditChange = (options) => {
    setSelectedTypeCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedTypeEdit(options);
    fetchInteractorPurpose(options);
    setSelectedPurposeEdit([]);
  };
  const handleModeEditChange = (options) => {
    setSelectedModeCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedModeEdit(options);
  };
  const handlePurposeEditChange = (options) => {
    setSelectedPurposeCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedPurposeEdit(options);
  };

  useEffect(() => {
    visitorviseDisabledAddResume();
    fetchManagetypepurposeForAddResume();
    getapi();
  }, []);

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, []);
  useEffect(() => {
    addSerialNumber(vendormaster);
  }, [vendormaster]);

  const gridRef = useRef(null);
  const gridRefTable = useRef(null);

  const searchOverAllTerms = searchQuery?.toLowerCase().split(' ');
  const filteredDatas = items?.filter((item) => {
    return searchOverAllTerms.every((term) => Object.values(item).join(' ')?.toLowerCase().includes(term));
  });

  const [allCandidate, setAllCandidate] = useState([]);
  const filteredSelectedColumn = columnDataTable.filter((data) => data.field !== 'checkbox' && data.field !== 'actions' && data.field !== 'serialNumber');

  // Create a row data object for the DataGrid
  let rowDataTable = filteredDatas.map((item, index) => {
    return {
      id: item.id,
      ticketid: item?.ticketid || '',
      ticketstatus: item?.ticketstatus || '',
      serialNumber: item.serialNumber,
      company: item.company,
      branch: item.branch,
      unit: item.unit,
      date: item.date,
      visitorid: item.visitorid,
      prefix: item.prefix,
      visitorname: item.visitorname,
      visitoremail: item.visitoremail,
      visitortype: item?.visitortype,
      visitormode: item?.visitormode,
      source: item?.source,
      visitorpurpose: item?.visitorpurpose,
      visitorcontactnumber: item.visitorcontactnumber,
      intime: item?.intime,
      outtime: item?.outtime,
      interactorstatus: item.interactorstatus,
      isBtnEnable: item.isBtnEnable,
      files: item.files,
      addvisitorin: item.addvisitorin,
      addvisitorinstatus: item?.requestvisitorfollowupstatusitem || item.interactorstatus === 'requestfollowupvisitor' ? 'Request Followup Visitor' : item.interactorstatus === 'visitorenquiry' ? 'Visitor Enquiry' : item.addvisitorin ? 'Visitor In' : 'Visitor Out',
      // profileDoc: item.isBtnEnable,
    };
  });

  const [TeamOptions, setTeamOptions] = useState([]);
  const [CreationArray, setCreationArray] = useState([]);

  const [selectedcompanyOptionsEdit, setselectedcompanyOptionsEdit] = useState([]);
  const [selectedbranchOptionsEdit, setselectedbranchOptionsEdit] = useState([]);
  const [selectedteamOptionsEdit, setselectedteamOptionsEdit] = useState([]);
  const [selectedunitOptionsEdit, setselectedunitOptionsEdit] = useState([]);
  let [valueUnitAdd, setValueUnitAdd] = useState('');

  let [valueTeamAdd, setValueTeamAdd] = useState('');
  const customValueRendererUnitAdd = (valueUnitAdd, _units) => {
    return valueUnitAdd.length ? valueUnitAdd.map(({ label }) => label).join(',') : <span style={{ color: 'hsl(0, 0%, 20%' }}>Please Select Unit</span>;
  };
  let [valueBranchAdd, setValueBranchAdd] = useState('');
  const customValueRendererBranchAdd = (valueBranchAdd, _branches) => {
    return valueBranchAdd.length ? valueBranchAdd.map(({ label }) => label)?.join(',') : <span style={{ color: 'hsl(0, 0%, 20%)' }}>Please Select Branch</span>;
  };
  let [valueCompanyAdd, setValueCompanyAdd] = useState('');
  const customValueRendererCompanyAdd = (valueCompanyAdd, _companies) => {
    return valueCompanyAdd.length ? valueCompanyAdd.map(({ label }) => label)?.join(',') : <span style={{ color: 'hsl(0, 0%, 20%)' }}>Please Select Company</span>;
  };
  const handleCompanyChangeAdd = (options) => {
    setValueCompanyAdd(
      options.map((a) => {
        return a.value;
      })
    );
    setselectedcompanyOptionsEdit(options);
    setselectedbranchOptionsEdit([]);
    setselectedteamOptionsEdit([]);
    setselectedunitOptionsEdit([]);
    setSelectedOptionsEdit([]);
    setTeamOptions([]);
  };
  const handleBranchChangeAdd = (options) => {
    setValueBranchAdd(
      options.map((a) => {
        return a.value;
      })
    );
    setselectedbranchOptionsEdit(options);
    setselectedteamOptionsEdit([]);
    setselectedunitOptionsEdit([]);
    setSelectedOptionsEdit([]);
    setTeamOptions([]);
  };
  const handleUnitChangeAdd = (options) => {
    setValueUnitAdd(
      options.map((a) => {
        return a.value;
      })
    );
    setselectedunitOptionsEdit(options);
    setselectedteamOptionsEdit([]);
    setSelectedOptionsEdit([]);
  };

  const handlecleared = (e) => {
    e.preventDefault();
    setFilterUser({
      day: 'Today',
      fromtime: '00:00',
      totime: '23:59',
      fromdate: moment(serverTime).format('YYYY-MM-DD'),
      todate: moment(serverTime).format('YYYY-MM-DD'),
      company: 'Please Select Company',
      branch: 'Please Select Branch',
      type: 'Please Select Type',
      percentage: '',
    });
    setVisitorAllDataForExport([]);
    setselectedcompanyOptionsEdit([]);
    setselectedbranchOptionsEdit([]);
    setselectedteamOptionsEdit([]);
    setselectedunitOptionsEdit([]);
    setSelectedOptionsEdit([]);
    setCreationArray([]);
    setSelectedTypeEdit([]);
    setSelectedModeEdit([]);
    setSelectedPurposeEdit([]);
    setSelectedTypeCat([]);
    setSelectedModeCat([]);
    setSelectedPurposeCat([]);
    setVendormaster([]);
    setVisitorAllData([]);
    setSearchQuery('');
    setFilterdata(false);
    setPageSize(10);
    setPage(1);
    setTotalProjects(0);
    setTotalPages(0);
    setTeamOptions([]);
    setFilteredRowData([]);
    setFilteredChanges(null);
    setForsearch(false);
    setInteractorPurposeArray([]);
    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
  };

  const daysoptions = [
    { label: 'Yesterday', value: 'Yesterday' },
    { label: 'Last Week', value: 'Last Week' },
    { label: 'Last Month', value: 'Last Month' },
    { label: 'Today', value: 'Today' },
    { label: 'This Week', value: 'This Week' },
    { label: 'This Month', value: 'This Month' },
    { label: 'Custom Fields', value: 'Custom Fields' },
  ];

  const handleChangeFilterDate = (e) => {
    let fromDate = '';
    let toDate = moment(serverTime).format('YYYY-MM-DD');
    switch (e.value) {
      case 'Today':
        setFilterUser((prev) => ({ ...prev, fromdate: toDate, todate: toDate }));
        break;
      case 'Yesterday':
        fromDate = moment(serverTime).subtract(1, 'days').format('YYYY-MM-DD');
        toDate = fromDate; // Yesterday’s date
        setFilterUser((prev) => ({ ...prev, fromdate: fromDate, todate: toDate }));
        break;

      case 'Last Week':
        fromDate = moment(serverTime).subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD');
        toDate = moment(serverTime).subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD');
        setFilterUser((prev) => ({ ...prev, fromdate: fromDate, todate: toDate }));
        break;

      case 'This Week':
        fromDate = moment(serverTime).startOf('week').format('YYYY-MM-DD');
        toDate = moment(serverTime).endOf('week').format('YYYY-MM-DD');
        setFilterUser((prev) => ({ ...prev, fromdate: fromDate, todate: toDate }));
        break;

      case 'Last Month':
        fromDate = moment(serverTime).subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
        toDate = moment(serverTime).subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
        setFilterUser((prev) => ({ ...prev, fromdate: fromDate, todate: toDate }));
        break;

      case 'This Month':
        fromDate = moment(serverTime).startOf('month').format('YYYY-MM-DD');
        toDate = moment(serverTime).endOf('month').format('YYYY-MM-DD');
        setFilterUser((prev) => ({ ...prev, fromdate: fromDate, todate: toDate }));
        break;

      case 'Custom Fields':
        setFilterUser((prev) => ({ ...prev, fromdate: '', todate: '' }));
        break;
      default:
        return;
    }
  };

  const handleAutoSelect = async () => {
    setPageName(!pageName);
    try {
      let res_freqType = await axios.get(SERVICE.ALL_INTERACTORTYPE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setInteractorTypeArray(
        res_freqType?.data?.interactorType?.map((item) => ({
          label: item?.name,
          value: item?.name,
        }))
      );
      setSelectedTypeEdit(
        res_freqType?.data?.interactorType?.map((item) => ({
          label: item?.name,
          value: item?.name,
        }))
      );
      setSelectedTypeCat(
        res_freqType?.data?.interactorType?.map((a, index) => {
          return a.name;
        })
      );

      let res_freqMode = await axios.get(SERVICE.ALL_INTERACTORMODE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setInteractorModeArray(
        res_freqMode?.data?.interactormode?.map((item) => ({
          label: item?.name,
          value: item?.name,
        }))
      );
      setSelectedModeEdit(
        res_freqMode?.data?.interactormode?.map((item) => ({
          label: item?.name,
          value: item?.name,
        }))
      );
      setSelectedModeCat(
        res_freqMode?.data?.interactorType?.map((a, index) => {
          return a.name;
        })
      );

      let res = await axios.get(SERVICE.ALL_MANAGETYPEPG, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let result = res?.data?.manageTypePG.filter((d) => res_freqType?.data?.interactorType?.some((typ) => d.interactorstype === typ?.name));

      let ans = result.flatMap((data) => data.interactorspurpose);

      setInteractorPurposeArray(
        ans?.map((item) => ({
          label: item,
          value: item,
        }))
      );
      setSelectedPurposeEdit(
        ans?.map((item) => ({
          label: item,
          value: item,
        }))
      );
      setSelectedPurposeCat(
        ans?.map((a, index) => {
          return a;
        })
      );

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

      setValueCompanyAdd(selectedCompany);
      setselectedcompanyOptionsEdit(mappedCompany);

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

      setValueBranchAdd(selectedBranch);
      setselectedbranchOptionsEdit(mappedBranch);

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

      setValueUnitAdd(selectedUnit);
      setselectedunitOptionsEdit(mappedUnit);

      let mappedTeam = allTeam
        ?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit))
        .map((u) => ({
          label: u.teamname,
          value: u.teamname,
        }));

      let selectedTeam = allTeam?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit)).map((u) => u.teamname);

      let mappedemployees = allUsersData
        ?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit) && selectedTeam?.includes(u.team))
        .map((u) => ({
          ...u,
          label: u.companyname,
          value: u.companyname,
        }));

      let employeess = allUsersData?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit) && selectedTeam?.includes(u.team)).map((u) => u.companyname);

      setTeamOptions(
        selectedTeam.map((t) => ({
          label: t,
          value: t,
        }))
      );
      setselectedteamOptionsEdit(mappedTeam);

      setSelectedOptionsEdit(mappedemployees);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    handleAutoSelect();
  }, [isAssignBranch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (filterUser.fromdate !== '' && filterUser.todate === '') {
      setPopupContentMalert('Please Select To Date');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (filterUser.fromdate === '' && filterUser.todate !== '') {
      setPopupContentMalert('Please Select From Date');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (
      filterUser.fromdate === '' &&
      filterUser.todate === '' &&
      selectedcompanyOptionsEdit.length === 0 &&
      selectedbranchOptionsEdit.length === 0 &&
      selectedunitOptionsEdit.length === 0 &&
      selectedteamOptionsEdit.length === 0 &&
      selectedOptionsEdit.length === 0 &&
      selectedTypeEdit.length === 0 &&
      selectedModeEdit.length === 0 &&
      selectedPurposeEdit.length === 0
    ) {
      setPopupContentMalert('Please Select Any One Field');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      fetchVendor();
    }
  };

  // Manage Columns
  const handleOpenManageColumns = (event) => {
    setAnchorEl(event.currentTarget);
    setManageColumnsOpen(true);
  };
  const handleCloseManageColumns = () => {
    setManageColumnsOpen(false);
    setSearchQueryManage('');
  };
  // Function to filter columns based on search query
  const filteredColumns = columnDataTable.filter((column) => column.headerName.toLowerCase().includes(searchQueryManage.toLowerCase()));
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
        {' '}
        <CloseIcon />{' '}
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
              {' '}
              Show All{' '}
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
                  newColumnVisibility[column.field] = false;
                });
                setColumnVisibility(newColumnVisibility);
              }}
            >
              {' '}
              Hide All
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Box>
  );
  // Manage Columns functionality
  const toggleColumnVisibility = (field) => {
    setColumnVisibility((prevVisibility) => ({
      ...prevVisibility,
      [field]: !prevVisibility[field],
    }));
  };
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };
  // Show All Columns functionality
  const handleShowAllColumns = () => {
    const updatedVisibility = { ...columnVisibility };
    for (const columnKey in updatedVisibility) {
      updatedVisibility[columnKey] = true;
    }
    setColumnVisibility(updatedVisibility);
  };
  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ''; // This is required for Chrome support
  };

  const [filterdata, setFilterdata] = useState(false);
  const [forsearch, setForsearch] = useState(false);

  useEffect(() => {
    if ((items?.length > 0 && filterdata) || forsearch) {
      fetchVendor();
    }
  }, [page, pageSize, searchQuery]);

  const [anchorElSearch, setAnchorElSearch] = React.useState(null);
  const handleClickSearch = (event) => {
    setAnchorElSearch(event.currentTarget);
    localStorage.removeItem('filterModel');
  };
  const handleCloseSearch = () => {
    setAnchorElSearch(null);
    setSearchQuery('');
  };

  const openSearch = Boolean(anchorElSearch);
  const idSearch = openSearch ? 'simple-popover' : undefined;

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
          let showname = columnDataTable.find((col) => col.field === filter.column)?.headerName;
          return `${showname} ${filter.condition} "${filter.value}"`;
        })
        .join(' ' + (advancedFilter.length > 1 ? advancedFilter[1].condition : '') + ' ');
    }
    return searchQuery;
  };

  const [visitorAllData, setVisitorAllData] = useState([]);

  //get all  vendordetails.
  const handleResetSearch = async () => {
    setVendorcheck(true);
    setPageName(!pageName);
    setFilterdata(true);
    // Reset all filters and pagination state
    setAdvancedFilter(null);
    setAdditionalFilters([]);
    setSearchQuery('');
    setIsSearchActive(false);
    setSelectedColumn('');
    setSelectedCondition('Contains');
    setFilterValue('');
    setLogicOperator('AND');
    setFilteredChanges(null);

    const queryParams = {
      page: Number(page),
      pageSize: Number(pageSize),
      assignbranch: accessbranch,
      fromdate: String(filterUser.fromdate),
      todate: String(filterUser.todate),
      company: selectedcompanyOptionsEdit?.length > 0 ? valueCompanyAdd : [],
      branch: selectedbranchOptionsEdit?.length > 0 ? valueBranchAdd : [],
      unit: selectedunitOptionsEdit?.length > 0 ? valueUnitAdd : [],
      visitortype: selectedTypeEdit?.length > 0 ? selectedTypeCat : [],
      visitormode: selectedModeEdit?.length > 0 ? selectedModeCat : [],
      visitorpurpose: selectedPurposeEdit?.length > 0 ? selectedPurposeCat : [],
    };

    const allFilters = [];
    // Only include advanced filters if they exist, otherwise just use regular searchQuery
    if (allFilters.length > 0 && selectedColumn !== '') {
      queryParams.allFilters = allFilters;
      queryParams.logicOperator = logicOperator;
    } else if (searchQuery) {
      queryParams.searchQuery = searchQuery; // Use searchQuery for regular search
    }

    try {
      let res = await axios.post(SERVICE.SKIPPED_VISITORS, queryParams, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const ans = res?.data?.result?.length > 0 ? res?.data?.result : [];
      const ansoverall = res?.data?.totalProjectsAllData?.length > 0 ? res?.data?.totalProjectsAllData : [];
      const itemsWithSerialNumber = ans?.map((item, index) => ({
        ...item,
        serialNumber: (page - 1) * pageSize + index + 1,
      }));
      const itemsWithSerialNumberOverall = ansoverall?.map((item, index) => ({
        ...item,
        serialNumber: index + 1,
      }));
      console.log(ans, 'ans');
      const itembranchforward = ans.filter((data, item) => {
        console.log('yes 1');
        return data?.branchforwardlog?.length > 0;
      });
      console.log(itembranchforward, 'itembranchforward');
      setVendormaster(
        itemsWithSerialNumber.map((item, index) => {
          return {
            id: item._id,
            serialNumber: item.serialNumber,
            ticketid: item?.ticketid || '',
            ticketstatus: item?.ticketstatus || '',
            company: item.company,
            branch: item.branch,
            unit: item.unit,
            date: moment(item.date).format('DD-MM-YYYY'),
            visitorid: item.visitorid,
            prefix: item.prefix,
            visitorname: item.visitorname,
            visitoremail: item.visitoremail,
            visitortype: item?.followuparray?.visitortype,
            visitormode: item?.followuparray?.visitormode,
            source: item?.followuparray?.source || '',
            visitorpurpose: item.followuparray?.visitorpurpose,
            visitorcontactnumber: item.visitorcontactnumber,
            intime: item?.followuparray?.intime,
            outtime: item?.followuparray?.outtime,
            interactorstatus: item.interactorstatus,
            isBtnEnable:
              !mgTypePurpose?.find((itemmg) => itemmg?.interactorstype?.toLowerCase() === item?.followuparray?.visitortype?.toLowerCase() && itemmg?.interactorspurpose?.some((purpose) => purpose?.toLowerCase() === item?.followuparray?.visitorpurpose?.toLowerCase()))?.addcandidate || false, // Default to `false` if no match is found

            addvisitorin: item?.addvisitorin,
          };
        })
      );
      setItems(
        itemsWithSerialNumber.map((item, index) => {
          const IsAvaile = allCandidate?.some((data) => data.firstname?.toLowerCase() + data.lastname?.toLowerCase() === String(item.visitorname?.replace(/\s+/g, '')?.toLowerCase()));

          const IsEmail = allCandidate?.some((data) => data.email?.toLowerCase() === String(item.email?.toLowerCase()));

          return {
            id: item._id,
            serialNumber: item.serialNumber,
            ticketid: item?.ticketid || '',
            ticketstatus: item?.ticketstatus || '',
            company: item.company,
            branch: item.branch,
            unit: item.unit,
            date: moment(item.date).format('DD-MM-YYYY'),
            visitorid: item.visitorid,
            prefix: item.prefix,
            visitorname: item.visitorname,
            visitoremail: item.visitoremail,
            visitortype: item?.followuparray?.visitortype,
            visitormode: item?.followuparray?.visitormode,
            source: item?.followuparray?.source || '',
            visitorpurpose: item.followuparray?.visitorpurpose,
            visitorcontactnumber: item.visitorcontactnumber,
            intime: item?.followuparray?.intime,
            outtime: item?.followuparray?.outtime,
            interactorstatus: item.interactorstatus,
            isBtnEnable:
              !mgTypePurpose?.find((itemmg) => itemmg?.interactorstype?.toLowerCase() === item?.followuparray?.visitortype?.toLowerCase() && itemmg?.interactorspurpose?.some((purpose) => purpose?.toLowerCase() === item?.followuparray?.visitorpurpose?.toLowerCase()))?.addcandidate || false, // Default to `false` if no match is found
            addvisitorin: item.addvisitorin,
          };
        })
      );
      const datas = itemsWithSerialNumberOverall.map((item, index) => {
        const IsAvaile = allCandidate?.some((data) => data.firstname?.toLowerCase() + data.lastname?.toLowerCase() === String(item.visitorname?.replace(/\s+/g, '')?.toLowerCase()));

        const IsEmail = allCandidate?.some((data) => data.email?.toLowerCase() === String(item.email?.toLowerCase()));

        return {
          id: item._id,
          serialNumber: index + 1,
          ticketid: item?.ticketid || '',
          ticketstatus: item?.ticketstatus || '',
          company: item.company,
          branch: item.branch,
          unit: item.unit,
          date: moment(item.date).format('DD-MM-YYYY'),
          visitorid: item.visitorid,
          prefix: item.prefix,
          visitorname: item.visitorname,
          visitoremail: item.visitoremail,
          visitortype: item?.followuparray?.visitortype,
          visitormode: item?.followuparray?.visitormode,
          source: item?.followuparray?.source || '',
          visitorpurpose: item.followuparray?.visitorpurpose,
          visitorcontactnumber: item.visitorcontactnumber,
          intime: item?.followuparray?.intime,
          outtime: item?.followuparray?.outtime,
          interactorstatus: item.interactorstatus,
          isBtnEnable: !mgTypePurpose?.find((itemmg) => itemmg?.interactorstype?.toLowerCase() === item?.followuparray?.visitortype?.toLowerCase() && itemmg?.interactorspurpose?.some((purpose) => purpose?.toLowerCase() === item?.followuparray?.visitorpurpose?.toLowerCase()))?.addcandidate || false, // Default to `false` if no match is found
          addvisitorin: item.addvisitorin,
        };
      });

      setVisitorAllData(datas);
      setTotalProjects(ans?.length > 0 ? res?.data?.totalProjects : 0);
      setTotalPages(ans?.length > 0 ? res?.data?.totalPages : 0);
      setPageSize((data) => {
        return ans?.length > 0 ? data : 10;
      });
      setPage((data) => {
        return ans?.length > 0 ? data : 1;
      });

      setVendorcheck(false);
    } catch (err) {
      setVendorcheck(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchVendor = async () => {
    setVendorcheck(true);
    setPageName(!pageName);

    console.time('fetchVendor');
    const queryParams = {
      page: Number(page),
      pageSize: Number(pageSize),
      assignbranch: accessbranch,
      fromdate: String(filterUser.fromdate),
      todate: String(filterUser.todate),
      company: selectedcompanyOptionsEdit?.length > 0 ? valueCompanyAdd : [],
      branch: selectedbranchOptionsEdit?.length > 0 ? valueBranchAdd : [],
      unit: selectedunitOptionsEdit?.length > 0 ? valueUnitAdd : [],
      visitortype: selectedTypeEdit?.length > 0 ? selectedTypeCat : [],
      visitormode: selectedModeEdit?.length > 0 ? selectedModeCat : [],
      visitorpurpose: selectedPurposeEdit?.length > 0 ? selectedPurposeCat : [],
    };

    const allFilters = [...additionalFilters, { column: selectedColumn, condition: selectedCondition, value: filterValue }];

    if (allFilters.length > 0 && selectedColumn !== '') {
      queryParams.allFilters = allFilters;
      queryParams.logicOperator = logicOperator;
    } else if (searchQuery) {
      queryParams.searchQuery = searchQuery;
    }

    try {
      let res = await axios.post(SERVICE.SKIPPED_VISITORS, queryParams, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const ans = res?.data?.result?.length > 0 ? res?.data?.result : [];
      const ansoverall = res?.data?.totalProjectsAllData?.length > 0 ? res?.data?.totalProjectsAllData : [];
      const itemsWithSerialNumber = ans?.map((item, index) => ({
        ...item,
        serialNumber: (page - 1) * pageSize + index + 1,
      }));
      const itemsWithSerialNumberOverall = ansoverall?.map((item, index) => ({
        ...item,
        serialNumber: index + 1,
      }));
      console.log(ans, 'ans');

      console.log(itemsWithSerialNumber, 'itemsWithSerialNumber');
      const itembranchforward = ans.filter((data, item) => {
        console.log('yes 1');
        return data?.branchforwardlog?.length > 0;
      });
      console.log(itembranchforward, 'itembranchforward');
      setVendormaster(
        itemsWithSerialNumber.map((item, index) => {
          const IsAvaile = allCandidate?.some((data) => data.firstname?.toLowerCase() + data.lastname?.toLowerCase() === String(item.visitorname?.replace(/\s+/g, '')?.toLowerCase()));

          const IsEmail = allCandidate?.some((data) => data.email?.toLowerCase() === String(item.email?.toLowerCase()));

          return {
            id: item._id,
            serialNumber: item.serialNumber,
            ticketid: item?.ticketid || '',
            ticketstatus: item?.ticketstatus || '',
            company: item.company,
            branch: item.branch,
            unit: item.unit,
            date: moment(item.date).format('DD-MM-YYYY'),
            visitorid: item.visitorid,
            prefix: item.prefix,
            visitorname: item.visitorname,
            visitoremail: item.visitoremail,
            visitortype: item?.followuparray?.visitortype,
            visitormode: item?.followuparray?.visitormode,
            source: item?.followuparray?.source || '',
            visitorpurpose: item.followuparray?.visitorpurpose,
            visitorcontactnumber: item.visitorcontactnumber,
            intime: item?.followuparray?.intime,
            outtime: item?.followuparray?.outtime,
            interactorstatus: item.interactorstatus,
            isBtnEnable:
              !mgTypePurpose?.find((itemmg) => itemmg?.interactorstype?.toLowerCase() === item?.followuparray?.visitortype?.toLowerCase() && itemmg?.interactorspurpose?.some((purpose) => purpose?.toLowerCase() === item?.followuparray?.visitorpurpose?.toLowerCase()))?.addcandidate || false, // Default to `false` if no match is found
            files: item.files,
            addvisitorin: item.addvisitorin,
          };
        })
      );

      const datas = itemsWithSerialNumberOverall.map((item, index) => {
        const IsAvaile = allCandidate?.some((data) => data.firstname?.toLowerCase() + data.lastname?.toLowerCase() === String(item.visitorname?.replace(/\s+/g, '')?.toLowerCase()));

        const IsEmail = allCandidate?.some((data) => data.email?.toLowerCase() === String(item.email?.toLowerCase()));

        return {
          id: item._id,
          serialNumber: index + 1,
          ticketid: item?.ticketid || '',
          ticketstatus: item?.ticketstatus || '',
          company: item.company,
          branch: item.branch,
          unit: item.unit,
          date: moment(item.date).format('DD-MM-YYYY'),
          visitorid: item.visitorid,
          prefix: item.prefix,
          visitorname: item.visitorname,
          visitoremail: item.visitoremail,
          visitortype: item?.followuparray[item?.followuparray?.length - 1]?.visitortype,
          visitormode: item?.followuparray[item?.followuparray?.length - 1]?.visitormode,
          source: item?.followuparray[item?.followuparray?.length - 1]?.source,
          visitorpurpose: item.followuparray[item?.followuparray?.length - 1]?.visitorpurpose,
          visitorcontactnumber: item.visitorcontactnumber,
          intime: item?.followuparray[item?.followuparray?.length - 1]?.intime,
          outtime: item?.followuparray[item?.followuparray?.length - 1]?.outtime,
          interactorstatus: item.interactorstatus,
          isBtnEnable: !mgTypePurpose?.find((itemmg) => itemmg?.interactorstype?.toLowerCase() === item?.followuparray?.visitortype?.toLowerCase() && itemmg?.interactorspurpose?.some((purpose) => purpose?.toLowerCase() === item?.followuparray?.visitorpurpose?.toLowerCase()))?.addcandidate || false, // Default to `false` if no match is found
          files: item.files,
          addvisitorin: item.addvisitorin,
        };
      });

      setVisitorAllData(datas);
      setTotalProjects(ans?.length > 0 ? res?.data?.totalProjects : 0);
      setTotalPages(ans?.length > 0 ? res?.data?.totalPages : 0);
      setPageSize((data) => {
        return ans?.length > 0 ? data : 10;
      });
      setPage((data) => {
        return ans?.length > 0 ? data : 1;
      });

      setVendorcheck(false);
      console.timeEnd('fetchVendor');
    } catch (err) {
      console.timeEnd('fetchVendor');
      setVendorcheck(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [visitorAllDataForExport, setVisitorAllDataForExport] = useState([]);

  const gridRefTableImg = useRef(null);
  // image
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage
        .toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, 'Visitor Branch Forward List.png');
        })
        .catch((error) => {
          console.error('dom-to-image error: ', error);
        });
    }
  };
  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Visitor Branch Forward List',
    pageStyle: 'print',
  });
  const addSerialNumber = (datas) => {
    setItems(datas);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPage(1);
    setFilterdata(true);
  };

  //datatable....
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    // setPage(1);
  };

  return (
    <Box>
      <Headtitle title={'VISITOR BRANCH FORWARD LIST'} />
      <PageHeading title="Visitor Branch Forward List" modulename="Interactors" submodulename="Visitor" mainpagename="Visitor Branch Forward List" subpagename="" subsubpagename="" />
      <Box sx={userStyle.selectcontainer}>
        <>
          <Grid container spacing={2}>
            <Grid item md={2} xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <Typography>
                  Company<b style={{ color: 'red' }}>*</b>
                </Typography>
                <MultiSelect
                  maxMenuHeight={300}
                  options={accessbranch
                    ?.map((data) => ({
                      label: data.company,
                      value: data.company,
                    }))
                    .filter((item, index, self) => {
                      return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                    })}
                  value={selectedcompanyOptionsEdit}
                  valueRenderer={customValueRendererCompanyAdd}
                  onChange={handleCompanyChangeAdd}
                />
              </FormControl>
            </Grid>
            <Grid item md={2} xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <Typography>
                  Branch<b style={{ color: 'red' }}>*</b>
                </Typography>
                <MultiSelect
                  maxMenuHeight={300}
                  options={accessbranch
                    ?.filter((comp) => selectedcompanyOptionsEdit?.some((item) => item?.value === comp.company))
                    ?.map((data) => ({
                      label: data.branch,
                      value: data.branch,
                    }))
                    .filter((item, index, self) => {
                      return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                    })}
                  value={selectedbranchOptionsEdit}
                  valueRenderer={customValueRendererBranchAdd}
                  onChange={handleBranchChangeAdd}
                />
              </FormControl>
            </Grid>
            <Grid item md={2} xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <Typography>
                  Unit<b style={{ color: 'red' }}>*</b>
                </Typography>
                <MultiSelect
                  maxMenuHeight={300}
                  options={accessbranch
                    ?.filter((comp) => selectedbranchOptionsEdit?.some((item) => item?.value === comp.branch))
                    ?.map((data) => ({
                      label: data.unit,
                      value: data.unit,
                    }))
                    .filter((item, index, self) => {
                      return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                    })}
                  value={selectedunitOptionsEdit}
                  onChange={handleUnitChangeAdd}
                  valueRenderer={customValueRendererUnitAdd}
                />
              </FormControl>
            </Grid>
            <Grid item md={2} xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <Typography>
                  Type<b style={{ color: 'red' }}>*</b>
                </Typography>
                <MultiSelect options={interactorTypeArray} value={selectedTypeEdit} onChange={handleTypeEditChange} valueRenderer={customValueRendererEditTypeFrom} />
              </FormControl>
            </Grid>
            <Grid item md={2} xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <Typography>
                  Mode<b style={{ color: 'red' }}>*</b>
                </Typography>
                <MultiSelect options={interactorModeArray} value={selectedModeEdit} onChange={handleModeEditChange} valueRenderer={customValueRendererEditModeFrom} />
              </FormControl>
            </Grid>
            <Grid item md={2} xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <Typography>
                  Purpose<b style={{ color: 'red' }}>*</b>
                </Typography>
                <MultiSelect options={interactorPurposeArray} value={selectedPurposeEdit} onChange={handlePurposeEditChange} valueRenderer={customValueRendererEditPurposeFrom} />
              </FormControl>
            </Grid>

            <Grid item md={3} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography sx={{ fontWeight: '500' }}>
                  Days<b style={{ color: 'red' }}>*</b>
                </Typography>
                <Selects
                  options={daysoptions}
                  value={{ label: filterUser.day, value: filterUser.day }}
                  onChange={(e) => {
                    handleChangeFilterDate(e);
                    setFilterUser((prev) => ({ ...prev, day: e.value }));
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item md={3} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  {' '}
                  From Date<b style={{ color: 'red' }}>*</b>
                </Typography>
                <OutlinedInput
                  id="from-date"
                  type="date"
                  disabled={filterUser.day !== 'Custom Fields'}
                  value={filterUser.fromdate}
                  onChange={(e) => {
                    const newFromDate = e.target.value;
                    setFilterUser((prevState) => ({
                      ...prevState,
                      fromdate: newFromDate,
                      todate: prevState.todate && new Date(prevState.todate) > new Date(newFromDate) ? prevState.todate : '',
                    }));
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item md={3} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  To Date<b style={{ color: 'red' }}>*</b>
                </Typography>
                <OutlinedInput
                  id="to-date"
                  type="date"
                  value={filterUser.todate}
                  disabled={filterUser.day !== 'Custom Fields'}
                  onChange={(e) => {
                    const selectedToDate = new Date(e.target.value);
                    const selectedFromDate = new Date(filterUser.fromdate);
                    const formattedDatePresent = new Date(); // Assuming you have a function to format the current date
                    if (selectedToDate >= selectedFromDate && selectedToDate >= new Date(selectedFromDate)) {
                      setFilterUser({
                        ...filterUser,
                        todate: e.target.value,
                      });
                    } else {
                      setFilterUser({
                        ...filterUser,
                        todate: '', // Reset to empty string if the condition fails
                      });
                    }
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item md={3} xs={12} sm={12}>
              <Typography>&nbsp;</Typography>
              <Button
                sx={buttonStyles.buttonsubmit}
                onClick={(e) => {
                  handleSubmit(e);
                  setFilterdata(true);
                  setForsearch(true);
                }}
              >
                Filter
              </Button>
              &nbsp; &nbsp;
              <Button sx={buttonStyles.btncancel} onClick={handlecleared}>
                Clear
              </Button>
            </Grid>
          </Grid>
        </>
      </Box>
      <br />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes('llistvisitors') && (
        <>
          <Box sx={userStyle.container}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography sx={userStyle.SubHeaderText}>Visitors List</Typography>
              </Grid>
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
                    <MenuItem value={totalProjects}>All</MenuItem>
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
                  {isUserRoleCompare?.includes('excellistvisitors') && (
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
                  {isUserRoleCompare?.includes('csvlistvisitors') && (
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
                  {isUserRoleCompare?.includes('printlistvisitors') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('pdflistvisitors') && (
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
                  {isUserRoleCompare?.includes('imagelistvisitors') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}>
                        {' '}
                        <ImageIcon sx={{ fontSize: '15px' }} /> &ensp;Image&ensp;{' '}
                      </Button>
                    </>
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
                            <IoMdOptions style={{ cursor: 'pointer' }} onClick={handleClickSearch} />
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
            </Grid>
            <br />
            <br />
            <Button
              sx={userStyle.buttongrp}
              onClick={() => {
                handleShowAllColumns();
                setColumnVisibility(initialColumnVisibility);
              }}
            >
              Show All Columns
            </Button>
            &ensp;
            <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumns}>
              Manage Columns
            </Button>
            <br />
            <Box style={{ width: '100%', overflowY: 'hidden' }}>
              {vendorCheck ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
                  </Box>
                </>
              ) : (
                <AggridTableForPaginationTable
                  rowDataTable={rowDataTable}
                  columnDataTable={columnDataTable}
                  columnVisibility={columnVisibility}
                  page={page}
                  setPage={setPage}
                  pageSize={pageSize}
                  totalPages={totalPages}
                  setColumnVisibility={setColumnVisibility}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  gridRefTable={gridRefTable}
                  totalDatas={totalProjects}
                  setFilteredRowData={setFilteredRowData}
                  filteredRowData={filteredRowData}
                  gridRefTableImg={gridRefTableImg}
                  itemsList={visitorAllData}
                />
              )}
            </Box>{' '}
          </Box>
          <Popover id={idSearch} open={openSearch} anchorEl={anchorElSearch} onClose={handleCloseSearch} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Box style={{ padding: '10px', maxWidth: '450px' }}>
              <Typography variant="h6">Advance Search</Typography>
              <IconButton
                aria-label="close"
                onClick={handleCloseSearch}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
              <DialogContent sx={{ width: '100%' }}>
                <Box
                  sx={{
                    width: '350px',
                    maxHeight: '400px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      // paddingRight: '5px'
                    }}
                  >
                    <Grid container spacing={1}>
                      <Grid item md={12} sm={12} xs={12}>
                        <Typography>Columns</Typography>
                        <Select
                          fullWidth
                          size="small"
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 200,
                                width: 'auto',
                              },
                            },
                          }}
                          style={{ minWidth: 150 }}
                          value={selectedColumn}
                          onChange={(e) => setSelectedColumn(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="" disabled>
                            Select Column
                          </MenuItem>
                          {filteredSelectedColumn.map((col) => (
                            <MenuItem key={col.field} value={col.field}>
                              {col.headerName}
                            </MenuItem>
                          ))}
                        </Select>
                      </Grid>
                      <Grid item md={12} sm={12} xs={12}>
                        <Typography>Operator</Typography>
                        <Select
                          fullWidth
                          size="small"
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 200,
                                width: 'auto',
                              },
                            },
                          }}
                          style={{ minWidth: 150 }}
                          value={selectedCondition}
                          onChange={(e) => setSelectedCondition(e.target.value)}
                          disabled={!selectedColumn}
                        >
                          {conditions.map((condition) => (
                            <MenuItem key={condition} value={condition}>
                              {condition}
                            </MenuItem>
                          ))}
                        </Select>
                      </Grid>
                      <Grid item md={12} sm={12} xs={12}>
                        <Typography>Value</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          value={['Blank', 'Not Blank'].includes(selectedCondition) ? '' : filterValue}
                          onChange={(e) => setFilterValue(e.target.value)}
                          disabled={['Blank', 'Not Blank'].includes(selectedCondition)}
                          placeholder={['Blank', 'Not Blank'].includes(selectedCondition) ? 'Disabled' : 'Enter value'}
                          sx={{
                            '& .MuiOutlinedInput-root.Mui-disabled': {
                              backgroundColor: 'rgb(0 0 0 / 26%)',
                            },
                            '& .MuiOutlinedInput-input.Mui-disabled': {
                              cursor: 'not-allowed',
                            },
                          }}
                        />
                      </Grid>
                      {additionalFilters.length > 0 && (
                        <>
                          <Grid item md={12} sm={12} xs={12}>
                            <RadioGroup row value={logicOperator} onChange={(e) => setLogicOperator(e.target.value)}>
                              <FormControlLabel value="AND" control={<Radio />} label="AND" />
                              <FormControlLabel value="OR" control={<Radio />} label="OR" />
                            </RadioGroup>
                          </Grid>
                        </>
                      )}
                      {additionalFilters.length === 0 && (
                        <Grid item md={4} sm={12} xs={12}>
                          <Button variant="contained" onClick={handleAddFilter} sx={{ textTransform: 'capitalize' }} disabled={['Blank', 'Not Blank'].includes(selectedCondition) ? false : !filterValue || selectedColumn.length === 0}>
                            Add Filter
                          </Button>
                        </Grid>
                      )}

                      <Grid item md={2} sm={12} xs={12}>
                        <Button
                          variant="contained"
                          onClick={() => {
                            fetchVendor();
                            setIsSearchActive(true);
                            setAdvancedFilter([...additionalFilters, { column: selectedColumn, condition: selectedCondition, value: filterValue }]);
                          }}
                          sx={{ textTransform: 'capitalize' }}
                          disabled={['Blank', 'Not Blank'].includes(selectedCondition) ? false : !filterValue || selectedColumn.length === 0}
                        >
                          Search
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </DialogContent>
            </Box>
          </Popover>
        </>
      )}
      {/* ****** Table End ****** */}
      <br />
      {/* 2nd table  */}
      {isUserRoleCompare?.includes('llistvisitors') && (
        <Branchforwardedlist
          fromdate={filterUser.fromdate}
          todate={filterUser.todate}
          company={selectedcompanyOptionsEdit?.length > 0 ? valueCompanyAdd : []}
          branch={selectedbranchOptionsEdit?.length > 0 ? valueBranchAdd : []}
          unit={selectedunitOptionsEdit?.length > 0 ? valueUnitAdd : []}
          visitortype={selectedTypeEdit?.length > 0 ? selectedTypeCat : []}
          visitormode={selectedModeEdit?.length > 0 ? selectedModeCat : []}
          visitorpurpose={selectedPurposeEdit?.length > 0 ? selectedPurposeCat : []}
        />
      )}

      {/* Manage Column */}
      <Popover id={id} open={isManageColumnsOpen} anchorEl={anchorEl} onClose={handleCloseManageColumns} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        {' '}
        {manageColumnsContent}{' '}
      </Popover>
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
      <br />
      {/* Edit DIALOG */}
      <Box>
        <Dialog open={isEditOpen} onClose={handleCloseModEdit} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="md" fullWidth={true} sx={{ marginTop: '80px' }}>
          <Box sx={{ padding: '20px 50px' }}>
            <>
              <Grid container spacing={2}>
                <Typography sx={userStyle.HeaderText}>Visitor Branch Forward</Typography>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={4} xs={12} sm={6}>
                  <Typography>
                    <b>VisitorName:</b>
                    {isUserData?.visitorname}
                  </Typography>
                </Grid>
                <Grid item md={2} xs={12} sm={6}>
                  <Typography>
                    <b>Company:</b>
                    {isUserData?.company}
                  </Typography>
                </Grid>
                <Grid item md={3} xs={12} sm={6}>
                  <Typography>
                    <b>Branch:</b>
                    {isUserData?.branch}
                  </Typography>
                </Grid>
                <Grid item md={3} xs={12} sm={6}>
                  <Typography>
                    <b>Unit:</b>
                    {isUserData?.unit}
                  </Typography>
                </Grid>
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography sx={{ fontWeight: '500' }}>
                      Forward Branch<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      options={accessbranch
                        ?.filter((comp) => isUserData?.company === comp.company)
                        ?.map((data) => ({
                          label: data.branch,
                          value: data.branch,
                        }))
                        .filter((item, index, self) => {
                          return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                        })}
                      value={{ label: isForwardBranch.branch, value: isForwardBranch.branch }}
                      onChange={(e) => {
                        setIsForwardBranch({ ...isForwardBranch, branch: e.value, unit: '' });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography sx={{ fontWeight: '500' }}>
                      Forward Unit<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <Selects
                      options={accessbranch
                        ?.filter((comp) => isForwardBranch?.branch === comp.branch)
                        ?.map((data) => ({
                          label: data.unit,
                          value: data.unit,
                        }))
                        .filter((item, index, self) => {
                          return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                        })}
                      value={{ label: isForwardBranch.unit, value: isForwardBranch.unit }}
                      onChange={(e) => {
                        setIsForwardBranch({ ...isForwardBranch, unit: e.value });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Reason<b style={{ color: 'red' }}>*</b>
                    </Typography>
                    <TextareaAutosize
                      aria-label="minimum height"
                      minRows={5}
                      value={isForwardBranch.reason}
                      onChange={(e) => {
                        setIsForwardBranch({
                          ...isForwardBranch,
                          reason: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <br /> <br />
              <Grid container spacing={2}>
                <Grid item md={6} xs={12} sm={12}>
                  <Button variant="contained" sx={buttonStyles.buttonsubmit} onClick={editSubmit}>
                    {' '}
                    Update
                  </Button>
                </Grid>
                <br />
                <Grid item md={6} xs={12} sm={12}>
                  <Button sx={buttonStyles.btncancel} onClick={handleCloseModEdit}>
                    {' '}
                    Cancel{' '}
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>
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
        itemsTwo={visitorAllDataForExport ?? []}
        filename={'Visitor Branch Forward List'}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
    </Box>
  );
}
export default VisitorBranchForwardList;
