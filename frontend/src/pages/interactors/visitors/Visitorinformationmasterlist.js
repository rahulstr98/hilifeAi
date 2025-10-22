import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ImageIcon from '@mui/icons-material/Image';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { CheckCircleOutline, HourglassEmpty, Visibility, Block } from '@mui/icons-material';
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
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TextField,
  Tooltip,
  Chip,
  Typography,
} from '@mui/material';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import axios from '../../../axiosInstance';
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
import { Link } from 'react-router-dom';
import Selects from 'react-select';
import { useReactToPrint } from 'react-to-print';
import AggridTableForPaginationTable from '../../../components/AggridTableForPaginationTable.js';
import AggridTable from '../../../components/AggridTable';
import AggregatedSearchBar from '../../../components/AggregatedSearchBar';
import AlertDialog from '../../../components/Alert';
import { DeleteConfirmation, PleaseSelectRow } from '../../../components/DeleteConfirmation.js';
import { handleApiError } from '../../../components/Errorhandling';
import ExportData from '../../../components/ExportData';
import Headtitle from '../../../components/Headtitle';
import InfoPopup from '../../../components/InfoPopup.js';
import MessageAlert from '../../../components/MessageAlert';
import PageHeading from '../../../components/PageHeading';
import { StyledTableCell, StyledTableRow } from '../../../components/Table';
import { AuthContext, UserRoleAccessContext } from '../../../context/Appcontext';
import { userStyle } from '../../../pageStyle';
import { SERVICE } from '../../../services/Baseservice';
import { getCurrentServerTime } from '../../../components/getCurrentServerTime';
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
      <div ref={containerRef} style={{ overflow: 'hidden', width: '30%', whiteSpace: 'nowrap' }}>
        <span ref={textRef} style={{ color: 'red', display: 'inline-block', fontSize: '1.4rem' }}>
          {text}
        </span>
      </div>
    </Grid>
  );
};

function VisitorInformationMasterList({ triggered }) {
  const [uploadedRequestDocument, setUploadedRequestDocument] = useState([]);
  const [uploadBillsRequestDocument, setUploadBillsRequestDocument] = useState([]);
  const [deletedRequestFiles, setDeletedRequestFiles] = useState([]);

  const [serverTime, setServerTime] = useState(null);
  const [filterUser, setFilterUser] = useState({
    day: 'Today',
    fromtime: '00:00',
    totime: '23:59',
    fromdate: moment().format('YYYY-MM-DD'),
    todate: moment().format('YYYY-MM-DD'),

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

        type: 'Please Select Type',
        percentage: '',
      });
    };

    fetchTime();
  }, []);

  const renderFilePreviewMulterUploaded = async (file) => {
    if (!file) return false;
    const imageUrl = `${SERVICE.VEIW_VISITOR_FILES}/${file.filename}`;
    window.open(imageUrl, '_blank'); // Open image in a new tab
  };

  const handleDeleteUploadedRequestDocument = (index) => {
    setUploadedRequestDocument((prevFiles) => {
      const fileToDelete = prevFiles[index];

      // Store the deleted file separately
      setDeletedRequestFiles((prevDeleted) => [...prevDeleted, fileToDelete]);

      // Remove from uploadedFiles state
      return prevFiles.filter((_, i) => i !== index);
    });
  };

  let sno = 1;

  const handleDeleteFileDocumentEditRequestDocument = (index) => {
    const newSelectedFiles = [...uploadBillsRequestDocument];
    newSelectedFiles.splice(index, 1);
    setUploadBillsRequestDocument(newSelectedFiles);
  };

  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);

  const [totalProjects, setTotalProjects] = useState(0);
  // const [totalPages, setTotalPages] = useState(0);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
  const [isHandleChange, setIsHandleChange] = useState(false);

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

  const [isErrorOpendupe, setIsErrorOpendupe] = useState(false);
  const [showAlertdupe, setShowAlertdupe] = useState();
  const handleClickOpenerrdupe = () => {
    setIsErrorOpendupe(true);
  };
  const handleCloseerrdupe = () => {
    setIsErrorOpendupe(false);
  };

  const [fileFormat, setFormat] = useState('');

  let exportColumnNames = ['Company', 'Branch', 'Unit', 'Date', "Visitor's ID", 'Visitor Name', 'Visitor Type', 'Visitor Mode', 'Visitor Purpose', 'Visitor Contact No', 'IN Time', 'OUT Time', 'Visitor Information Status'];
  let exportRowValues = ['company', 'branch', 'unit', 'date', 'visitorid', 'visitorname', 'visitortype', 'visitormode', 'visitorpurpose', 'visitorcontactnumber', 'intime', 'outtime', 'visitorinformationstatus'];

  const [vendoredit, setVendoredit] = useState({});
  const [vendormaster, setVendormaster] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryManage, setSearchQueryManage] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchedString, setSearchedString] = useState('');

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
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteVendor, setDeletevendor] = useState('');
  const [openInfo, setOpeninfo] = useState(false);
  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    actions: true,
    ticketid: true,
    ticketstatus: true,
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
    visitorinformationstatus: true,
    document: true,
  };
  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  const getDownloadFile = async (id) => {
    // let res = await axios.get(`${SERVICE.SINGLE_VISITORINFORMATIONS}/${id}`, {
    //   headers: {
    //     Authorization: `Bearer ${auth.APIToken}`,
    //   },
    // });
    // let url = `${SERVICE.VISITORDETAILS_LOG_SINGLE_PROFILE}/${encodeURIComponent(id)}`;
    let url = `${SERVICE.VISITORINFORMATIONDETAILS_SINGLE_PROFILE}/${encodeURIComponent(id)}`;
    let resVisitor = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });

    // const file = resVisitor?.data?.svisitordetailslog?.slice(-1)[0]?.files || [];
    const file = resVisitor?.data?.svisitors?.slice(-1)[0]?.files || [];

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
      field: 'visitorinformationstatus',
      headerName: 'Visitor Information Status',
      flex: 0,
      width: 100,
      minHeight: '40px',
      hide: !columnVisibility.visitorinformationstatus,
      headerClassName: 'bold-header',
    },
    {
      field: 'document',
      headerName: 'Profile',
      flex: 0,
      width: 150,
      minHeight: '40px',
      hide: !columnVisibility.document,
      cellRenderer: (params) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {params.data?.files !== 0 ? (
            <Tooltip title="View profile" arrow>
              <IconButton
                onClick={() => getDownloadFile(params.data.visitorid)}
                sx={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease',
                  boxShadow: 1,
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
              >
                <Visibility sx={{ mr: 0.5 }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>View</span>
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="No profile available" arrow>
              <Chip
                icon={<Block color="error" />}
                label="NIL"
                color="error"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  backgroundColor: '#ffebee',
                  borderWidth: '2px',
                  '& .MuiChip-icon': {
                    color: '#d32f2f',
                  },
                }}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
    // {
    //     field: 'document',
    //     headerName: 'Profile',
    //     flex: 0,
    //     width: 180,
    //     minHeight: '40px',
    //     hide: !columnVisibility.document,
    //     cellRenderer: (params) => (
    //         <Grid>
    //             <div className="page-pdf" textAlign={'center'}>
    //                 {params.data?.files !== 0 ? (
    //                     <>
    //                         <Button
    //                             variant="contained"
    //                             sx={{ width: '100%' }}
    //                             onClick={() => {
    //                                 getDownloadFile(params.data.visitorid);
    //                             }}
    //                             className="next-pdf-btn pdf-button"
    //                         >
    //                             View
    //                         </Button>
    //                     </>
    //                 ) : (
    //                     <>
    //                         <Button variant="contained" sx={{ background: 'red', color: 'white', width: '100%' }} className="next-pdf-btn pdf-button">
    //                             {'NIL '}
    //                         </Button>
    //                     </>
    //                 )}
    //             </div>
    //         </Grid>
    //     ),
    // },
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
        <Grid sx={{ display: 'flex' }}>
          {isUserRoleCompare?.includes('evisitorinformationmaster') && params.data?.visitorinformationstatus !== 'Approved' && (
            <Link to={`/interactor/master/visitorinformationmasteredit/${params.data.id}/list/?status=${params.data.interactorstatus}`} style={{ textDecoration: 'none', color: '#fff', minWidth: '0px' }}>
              <Button sx={userStyle.buttonedit} style={{ minWidth: '0px' }}>
                <EditOutlinedIcon sx={buttonStyles.buttonedit} />{' '}
              </Button>
            </Link>
          )}

          {isUserRoleCompare?.includes('dvisitorinformationmaster') && params.data.visitorinformationstatus !== 'Approved' && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.data.id);
              }}
            >
              <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />{' '}
            </Button>
          )}
          {isUserRoleCompare?.includes('vvisitorinformationmaster') && (
            // <Link to={`/interactor/master/visitorinformationapprovalview/${params.data.id}/list/?status=${params.data.interactorstatus}`} style={{ textDecoration: 'none', color: '#fff', minWidth: '0px' }}>
            <Link to={`/interactor/master/visitorinformationmasterview/${params.data.id}`} style={{ textDecoration: 'none', color: '#fff', minWidth: '0px' }}>
              <Button sx={userStyle.buttonedit} style={{ minWidth: '0px' }}>
                <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />{' '}
              </Button>
            </Link>
          )}
          {isUserRoleCompare?.includes('ivisitorinformationmaster') && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getinfoCode(params.data.id);
              }}
            >
              {' '}
              <InfoOutlinedIcon sx={buttonStyles.buttoninfo} />
            </Button>
          )}
        </Grid>
      ),
    },
  ];

  //Delete model
  const [isDeleteOpenalert, setIsDeleteOpenalert] = useState(false);
  const handleClickOpenalert = () => {
    setIsHandleChange(true);
    if (selectedRows?.length === 0) {
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

  const handleCloseModcheckbox = () => {
    setIsDeleteOpencheckbox(false);
  };

  const visitorviseDisabledAddResume = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.get(SERVICE.VISITORCANDIDATESALL);

      setAllCandidate(res?.data?.candidates);
    } catch (err) {
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
      pagename: String('Visitor Information Master'),
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

  const [visitorsTypeOption, setVisitorsTypeOption] = useState([]);

  const fetchInteractorType = async () => {
    setPageName(!pageName);
    try {
      let res_freq = await axios.get(SERVICE.ALL_MANAGETYPEPG, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setVisitorsTypeOption(
        res_freq?.data?.manageTypePG.map((t) => ({
          ...t,
          label: t.interactorstype,
          value: t.interactorstype,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchInteractorType();
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

  const [visitor, setVisitor] = useState();

  const [duplicateValues, setDuplicateValues] = useState([]);

  const [allCandidate, setAllCandidate] = useState([]);

  const filteredSelectedColumn = columnDataTable.filter((data) => data.field !== 'checkbox' && data.field !== 'actions' && data.field !== 'serialNumber');

  // Create a row data object for the DataGrid
  // let rowDataTable = filteredDatas.map((item, index) => {
  let rowDataTable = filteredData.map((item, index) => {
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
      visitorinformationstatus: item.visitorinformationstatus,
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
    // BranchDropDowns(options)
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
    // UnitDropDowns(options)
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
    // fetchTeam(options);
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
  //Delete model
  const handleClickOpen = () => {
    setIsDeleteOpen(true);
  };
  const handleCloseMod = () => {
    setIsDeleteOpen(false);
  };
  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ''; // This is required for Chrome support
  };

  const [isEditOpen, setIsEditOpen] = useState(false);

  //Edit model...
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setIsEditOpen(false);
  };

  const [vendor, setVendor] = useState({
    visitortype: 'Please Select Visitor Type',
    visitormode: 'Please Select Visitor Mode',
    source: '',
    // date: date,
    prefix: '',
    visitorname: '',
    intime: '',
    visitorpurpose: 'Please Select Visitor Purpose',
    visitorcontactnumber: '',
    visitoremail: '',
    visitorcompnayname: '',
    documenttype: 'Please Select Document Type',
    documentnumber: '',
    meetingdetails: true,
    meetingpersonemployeename: 'Please Select Employee Name',
    meetinglocationarea: 'Please Select Area',
    escortinformation: true,
    escortdetails: '',
    equipmentborrowed: '',
    outtime: '',
    remark: '',
    followupaction: 'Please Select Follow Up Action',
    followupdate: '',
    followuptime: '',
    visitorbadge: '',
    visitorsurvey: '',
  });

  const getCode = async (id) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.SINGLE_VISITORINFORMATIONS}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setVendor(res?.data?.svisitors);
      let multerUploadedRequestFiles = res?.data?.svisitors?.requestdocument?.filter((data) => !data.preview);
      setUploadedRequestDocument(multerUploadedRequestFiles);
      handleClickOpenEdit();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files); // Convert FileList to Array
    if (!selectedFiles.length) return;

    let largeFiles = []; // To store names of files larger than 1MB

    // Filter files that are <= 1MB (1,024,000 bytes)
    const filteredFiles = selectedFiles.filter((file) => {
      if (file.size > 1024000) {
        largeFiles.push(file.name); // Collect large file names
        return false;
      }
      return true;
    });

    // If there are large files, show a single popup message
    if (largeFiles.length > 0) {
      setPopupContentMalert(`The following files are larger than 1MB and will not be uploaded:\n${largeFiles.join(', ')}`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }

    if (filteredFiles.length === 0) return; // If no valid files, exit

    // Create array of file objects for upload
    const filesToUpload = filteredFiles.map((file) => ({ file }));

    if (uploadBillsRequestDocument?.length > 0) {
      // If there are existing files, append the new ones (up to your desired limit)
      const combinedFiles = [...uploadBillsRequestDocument, ...filesToUpload];

      // If you want to limit the total number of files, add a check here
      // For example, limit to 5 files:
      // const finalFiles = combinedFiles.slice(0, 5);
      setUploadBillsRequestDocument(combinedFiles);
    } else {
      // No existing files, just set the new ones
      setUploadBillsRequestDocument(filesToUpload);
    }
  };

  const [ids, getIds] = useState('');
  let updatebydoc = vendor.updatedby;

  const rowData = async (id) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.SINGLE_VISITORINFORMATIONS}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDeletevendor(res?.data?.svisitors);
      handleClickOpen();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  // Alert delete popup
  let Vendorsid = deleteVendor?._id;
  const delVendor = async (e) => {
    setPageName(!pageName);
    try {
      if (Vendorsid) {
        await axios.delete(`${SERVICE.SINGLE_VISITORINFORMATIONS}/${Vendorsid}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
        await fetchVendor();
        handleCloseMod();
        setPage(1);
        setPopupContent('Deleted Successfully');
        setPopupSeverity('success');
        handleClickOpenPopup();
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const delVendorcheckbox = async () => {
    setPageName(!pageName);
    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(`${SERVICE.SINGLE_VISITORINFORMATIONS}/${item}`, {
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

      await fetchVendor();
      setPopupContent('Deleted Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // info model
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
      let res = await axios.get(`${SERVICE.SINGLE_VISITORINFORMATIONS}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setVendoredit(res?.data?.svisitors);
      handleClickOpeninfo();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  //Project updateby edit page...
  let updateby = vendoredit?.updatedby;
  let addedby = vendoredit?.addedby;

  const [filterdata, setFilterdata] = useState(false);
  const [forsearch, setForsearch] = useState(false);

  // useEffect(() => {

  //     fetchVendor();

  //     // }, [page, pageSize, searchQuery]);
  // }, []);

  useEffect(() => {
    fetchVendor();
  }, [triggered]);

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

  const [visitorAllData, setVisitorAllData] = useState([]);

  //get all project.
  const fetchVendor = async () => {
    setPageName(!pageName);
    try {
      let res_grp = await axios.post(
        SERVICE.VISITOR_INFORMATIONMASTERS,
        {
          assignbranch: accessbranch,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      let answer = res_grp?.data?.visitors;
      setVendormaster(
        answer.map((item, index) => ({
          ...item,
          id: item._id,
          // serialNumber: item.serialNumber,
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
          // visitortype: item?.followuparray?.visitortype,
          // visitormode: item?.followuparray?.visitormode,
          visitortype: item?.visitortype,
          visitormode: item?.visitormode,
          source: item?.source || '',
          visitorpurpose: item.visitorpurpose,
          visitorcontactnumber: item.visitorcontactnumber,
          intime: item?.intime,
          outtime: item?.outtime,
          interactorstatus: item.interactorstatus,
          visitorinformationstatus: item.visitorinformationstatus,
          isBtnEnable: !mgTypePurpose?.find((itemmg) => itemmg?.interactorstype?.toLowerCase() === item?.followuparray?.visitortype?.toLowerCase() && itemmg?.interactorspurpose?.some((purpose) => purpose?.toLowerCase() === item?.followuparray?.visitorpurpose?.toLowerCase()))?.addcandidate || false, // Default to `false` if no match is found

          addvisitorin: item?.addvisitorin,
        }))
      );
      setVendorcheck(true);
    } catch (err) {
      setVendorcheck(true);
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
          saveAs(blob, 'Visitors.png');
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
    documentTitle: 'Visitors',
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

  const handleBillsDocRemarkChange = (index, newRemark) => {
    setUploadBillsRequestDocument((prevFiles) => prevFiles.map((file, i) => (i === index ? { ...file, remark: newRemark } : file)));
  };

  const renderFilePreviewMulter = async (file) => {
    const url = window.URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    window.open(link, '_blank');
  };

  return (
    <Box>
      {/* <Headtitle title={'Visitor Information Master List'} /> */}
      {/* <PageHeading title="Visitor Information Master List" modulename="Interactors" submodulename="Visitor" mainpagename="List Visitors" subpagename="" subsubpagename="" /> */}

      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes('lvisitorinformationmaster') && (
        <>
          <Box sx={userStyle.container}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography sx={userStyle.SubHeaderText}>Visitor Information Master List</Typography>
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
                    <MenuItem value={vendormaster}>All</MenuItem>
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
                  {isUserRoleCompare?.includes('excelvisitorinformationmaster') && (
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
                  {isUserRoleCompare?.includes('csvvisitorinformationmaster') && (
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
                  {isUserRoleCompare?.includes('printvisitorinformationmaster') && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes('pdfvisitorinformationmaster') && (
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
                  {isUserRoleCompare?.includes('imagevisitorinformationmaster') && (
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
                <Box>
                  <AggregatedSearchBar
                    columnDataTable={columnDataTable}
                    setItems={setItems}
                    addSerialNumber={addSerialNumber}
                    setPage={setPage}
                    maindatas={vendormaster}
                    setSearchedString={setSearchedString}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    paginated={false}
                    totalDatas={vendormaster}
                  />
                </Box>
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
            </Button>{' '}
            &ensp;
            {/* {isUserRoleCompare?.includes('bdvisitorinformationmaster') && (
                            <Button variant="contained" color="error" onClick={handleClickOpenalert} sx={buttonStyles.buttonbulkdelete}>
                                Bulk Delete
                            </Button>
                        )} */}
            <br />
            <br />
            <Box style={{ width: '100%', overflowY: 'hidden' }}>
              {!vendorCheck ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
                  </Box>
                </>
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
                  // totalDatas={totalDatas}
                  searchQuery={searchedString}
                  handleShowAllColumns={handleShowAllColumns}
                  setFilteredRowData={setFilteredRowData}
                  filteredRowData={filteredRowData}
                  setFilteredChanges={setFilteredChanges}
                  filteredChanges={filteredChanges}
                  gridRefTableImg={gridRefTableImg}
                  itemsList={vendormaster}
                />
              )}
            </Box>{' '}
          </Box>
        </>
      )}
      {/* ****** Table End ****** */}

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
      <Box>
        <Dialog open={isErrorOpendupe} onClose={handleCloseerrdupe} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="sm" fullWidth={true}>
          <DialogContent sx={{ textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h6">{showAlertdupe}</Typography>
          </DialogContent>
          <DialogActions>
            <Link
              to={!duplicateValues?.length > 0 ? '#' : `/recruitment/addresume/${visitor?.id}`}
              style={{
                textDecoration: 'none',
                color: !duplicateValues?.length > 0 ? '#fff' : '#aaa', // change color when disabled
                pointerEvents: !duplicateValues?.length > 0 ? 'none' : 'auto',
              }}
            >
              <Button
                variant="contained"
                style={{
                  fontWeight: 'bold',
                  cursor: !duplicateValues?.length > 0 ? 'not-allowed' : 'pointer',
                }}
                disabled={!duplicateValues?.length > 0}
              >
                Need To Add
              </Button>
            </Link>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCloseerrdupe}
              style={{
                marginLeft: '10px',
              }}
            >
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* Edit DIALOG */}
      <Box>
        <Dialog open={isEditOpen} onClose={handleCloseModEdit} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="md" fullWidth={true} sx={{ marginTop: '80px' }}>
          <Box sx={{ padding: '20px 50px' }}>
            <>
              <Grid container spacing={2}>
                <Typography sx={userStyle.HeaderText}>Request Visitor Document</Typography>
              </Grid>
              <br />
              <Grid item md={12} xs={12} sm={12}>
                <Box>
                  {/* <Grid item xs={8}>
                    <Typography sx={{ fontWeight: 'bold' }}>Request Visitor Document</Typography>
                  </Grid> */}
                  <>
                    <Grid container sx={{ justifyContent: 'center' }} spacing={1}>
                      {/* <Selects
                                     options={designationsFileNames}
                                     styles={colourStyles}
                                     value={{
                                       label: fileNames,
                                       value: fileNames,
                                     }}
                                     onChange={(e) => {
                                       setfileNames(e.value);
                                     }}
                                   /> */}
                      &nbsp;
                      <Button variant="outlined" component="label">
                        <CloudUploadIcon sx={{ fontSize: '21px' }} /> &ensp;Upload Documents
                        <input hidden type="file" multiple onChange={handleFileUpload} />
                      </Button>
                    </Grid>
                  </>
                  {/* <Typography sx={userStyle.SubHeaderText}>
                                 {" "}
                                 Document List{" "}
                               </Typography> */}
                  <br />
                  <br />
                  <br />
                  <TableContainer component={Paper}>
                    <Table aria-label="simple table" id="branch">
                      <TableHead sx={{ fontWeight: '600' }}>
                        <StyledTableRow>
                          <StyledTableCell align="center">SI.NO</StyledTableCell>
                          <StyledTableCell align="center">Document</StyledTableCell>
                          {/* <StyledTableCell align="center">Remarks</StyledTableCell> */}
                          <StyledTableCell align="center">View</StyledTableCell>
                          <StyledTableCell align="center">Action</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {uploadedRequestDocument &&
                          uploadedRequestDocument?.map((file, index) => (
                            <StyledTableRow key={index}>
                              <StyledTableCell align="center">{sno++}</StyledTableCell>
                              <StyledTableCell align="left">{file.name || file.file.name}</StyledTableCell>
                              {/* <StyledTableCell align="center">
                                <FormControl>
                                  <OutlinedInput
                                    sx={{
                                      height: "30px !important",
                                      background: "white",
                                      border: "1px solid rgb(0 0 0 / 48%)",
                                    }}
                                    size="small"
                                    type="text"
                                    value={file.remark}
                                    onChange={(event) =>
                                      handleUploadedDocRemarkChange(index, event.target.value)
                                    }
                                  />
                                </FormControl>
                              </StyledTableCell> */}

                              <StyledTableCell component="th" scope="row" align="center">
                                {/* <a
                                                                          style={{ color: "#357ae8" }}
                                                                          href={`data:application/octet-stream;base64,${file.data}`}
                                                                          download={file.name}
                                                                        >
                                                                          Download
                                                                        </a> */}
                                <a
                                  style={{
                                    color: '#357ae8',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                  }}
                                  onClick={() => renderFilePreviewMulterUploaded(file)}
                                >
                                  View
                                </a>
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                <Button
                                  onClick={() => handleDeleteUploadedRequestDocument(index)}
                                  variant="contained"
                                  size="small"
                                  sx={{
                                    textTransform: 'capitalize',
                                    minWidth: '0px',
                                  }}
                                >
                                  <DeleteIcon style={{ fontSize: '20px' }} />
                                </Button>
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                        {uploadBillsRequestDocument &&
                          uploadBillsRequestDocument?.map((file, index) => (
                            <StyledTableRow key={index}>
                              <StyledTableCell align="center">{sno++}</StyledTableCell>
                              <StyledTableCell align="left">{file.name || file.file.name}</StyledTableCell>
                              {/* <StyledTableCell align="center">
                                <FormControl>
                                  <OutlinedInput
                                    sx={{
                                      height: "30px !important",
                                      background: "white",
                                      border: "1px solid rgb(0 0 0 / 48%)",
                                    }}
                                    size="small"
                                    type="text"
                                    value={file.remark}
                                    onChange={(event) =>
                                      handleBillsDocRemarkChange(index, event.target.value)
                                    }
                                  />
                                </FormControl>
                              </StyledTableCell> */}

                              <StyledTableCell component="th" scope="row" align="center">
                                {/* <a
                                                 style={{ color: "#357ae8" }}
                                                 href={`data:application/octet-stream;base64,${file.data}`}
                                                 download={file.name}
                                               >
                                                 Download
                                               </a> */}
                                <a
                                  style={{
                                    color: '#357ae8',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                  }}
                                  onClick={() => renderFilePreviewMulter(file?.file)}
                                >
                                  View
                                </a>
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                <Button
                                  onClick={() => handleDeleteFileDocumentEditRequestDocument(index)}
                                  variant="contained"
                                  size="small"
                                  sx={{
                                    textTransform: 'capitalize',
                                    minWidth: '0px',
                                  }}
                                >
                                  <DeleteIcon style={{ fontSize: '20px' }} />
                                </Button>
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                <br />
              </Grid>
              <br /> <br />
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
        itemsTwo={vendormaster ?? []}
        filename={'Visitor Information Master'}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
      <InfoPopup openInfo={openInfo} handleCloseinfo={handleCloseinfo} heading="Visitor Information Master Info" addedby={addedby} updateby={updateby} />
      <DeleteConfirmation open={isDeleteOpen} onClose={handleCloseMod} onConfirm={delVendor} title="Are you sure?" confirmButtonText="Yes" cancelButtonText="Cancel" />
      <DeleteConfirmation open={isDeleteOpencheckbox} onClose={handleCloseModcheckbox} onConfirm={delVendorcheckbox} title="Are you sure?" confirmButtonText="Yes" cancelButtonText="Cancel" />
      <PleaseSelectRow open={isDeleteOpenalert} onClose={handleCloseModalert} message="Please Select any Row" iconColor="orange" buttonText="OK" />
    </Box>
  );
}
export default VisitorInformationMasterList;
