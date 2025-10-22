import { makeStyles } from '@material-ui/core';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import { Backdrop, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, Grid, MenuItem, OutlinedInput, Paper, Select, Table, TableBody, TableContainer, TableHead, TextareaAutosize, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';
import moment from 'moment-timezone';
import axios from '../../../axiosInstance';
import * as faceapi from 'face-api.js';
import 'jspdf-autotable';
import React, { useContext, useEffect, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { MultiSelect } from 'react-multi-select-component';
import { Link, useNavigate } from 'react-router-dom';
import Selects from 'react-select';
import { v4 as uuidv4 } from 'uuid';
import AlertDialog from '../../../components/Alert';
import csvIcon from '../../../components/Assets/CSV.png';
import excelIcon from '../../../components/Assets/excel-icon.png';
import fileIcon from '../../../components/Assets/file-icons.png';
import pdfIcon from '../../../components/Assets/pdf-icon.png';
import wordIcon from '../../../components/Assets/word-icon.png';
import { documentTypeOption, followUpActionOption, sourceVisitorOptions } from '../../../components/Componentkeyword';
import { handleApiError } from '../../../components/Errorhandling';
import Headtitle from '../../../components/Headtitle';
import MessageAlert from '../../../components/MessageAlert';
import PageHeading from '../../../components/PageHeading';
import { StyledTableCell, StyledTableRow } from '../../../components/Table';
import Webcamimage from '../../../components/webCamWithDuplicateVisitor';
import { AuthContext, UserRoleAccessContext } from '../../../context/Appcontext';
import { userStyle } from '../../../pageStyle';
import { SERVICE } from '../../../services/Baseservice';
import ExistingProfileVisitor from './ExistingProfileVisitorForVisitorpage';
import RaiseTicketRequestDocument from './RaiseTicketRequestDocument.js';
import ExistingVisitor from './ExistingVisitorCheck';
import { Country, State, City } from 'country-state-city';
import { getPincodeDetails } from '../../../components/getPincodeDetails';
import { address_type, permanent_address_type, personal_prefix, landmark_and_positional_prefix } from '../../../components/Componentkeyword';
import FullAddressCard from '../../../components/FullAddressCard.js';
import PincodeButton from '../../../components/PincodeButton.js';
import { getCurrentServerTime } from '../../../components/getCurrentServerTime';
import VisitorInformationMasterList from './Visitorinformationmasterlist.js';
const LoadingBackdrop = ({ open }) => {
  return (
    <Backdrop sx={{ color: '#ffffff', zIndex: (theme) => theme.zIndex.drawer + 999 }} open={open}>
      <div className="pulsating-circle">
        <CircularProgress color="inherit" className="loading-spinner" />
      </div>
      <Typography variant="h6" sx={{ marginLeft: 2, color: '#ffffff', fontWeight: 'bold' }}>
        please wait...
      </Typography>
    </Backdrop>
  );
};

const CustomPaper = (props) => {
  return <Paper {...props} sx={{ borderRadius: '8px' }} />;
};

const useStyles = makeStyles((theme) => ({
  inputs: {
    display: 'none',
  },
  preview: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: theme.spacing(2),
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

function calculateLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Calculate luminance using the formula
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // If luminance is greater than 128, it's a light color
  return luminance > 128;
}

function VisitorInformationMasterCreate() {
  const [selectedCountryp, setSelectedCountryp] = useState(Country.getAllCountries().find((country) => country.name === 'India'));
  const [selectedStatep, setSelectedStatep] = useState(State.getStatesOfCountry(selectedCountryp?.isoCode).find((state) => state.name === 'Tamil Nadu'));
  const [selectedCityp, setSelectedCityp] = useState(City.getCitiesOfState(selectedStatep?.countryCode, selectedStatep?.isoCode).find((city) => city.name === 'Tiruchirappalli'));
  //current Address
  const [selectedCountryc, setSelectedCountryc] = useState(Country.getAllCountries().find((country) => country.name === 'India'));
  const [selectedStatec, setSelectedStatec] = useState(State.getStatesOfCountry(selectedCountryc?.isoCode).find((state) => state.name === 'Tamil Nadu'));
  const [selectedCityc, setSelectedCityc] = useState(City.getCitiesOfState(selectedStatec?.countryCode, selectedStatec?.isoCode).find((city) => city.name === 'Tiruchirappalli'));

  const [serverTime, setServerTime] = useState(null);
  const [vendor, setVendor] = useState({
    company: 'Please Select Company',
    branch: 'Please Select Branch',
    unit: 'Please Select Unit',
    visitortype: 'Please Select Visitor Type',
    visitormode: 'Please Select Visitor Mode',
    source: '',
    date: '',
    requestvisitorfollowupdate: '',
    prefix: 'Mr',
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
    // requestvisitorfollowaction: 'Please Select Request Follow Up Action',
    requestvisitorfollowaction: 'Required',
    requestfollowupactionupdate: '',
    requestfollowupactionuptime: '',
    visitorbadge: '',
    visitorsurvey: '',
    uploadedimage: null,
    materialcarryinginfo: false,
    raiseticket: false,
    //newdetails
    addesstype: 'Home',
    personalprefix: '',
    referencename: '',
    landmarkpositionprefix: '',
    landmarkname: '',
    houseflatnumber: '',
    streetroadname: '',
    localityareaname: '',
       pbuildingapartmentname:"",
paddressone:"",
paddresstwo:"",
paddressthree:"",
caddressone:"",
caddresstwo:"",
caddressthree:"",
cbuildingapartmentname:"",
    pcountry: selectedCountryp?.name,
    pstate: selectedStatep?.name,
    pcity: selectedCityp?.name,
    ppincode: '',
    gpscoordinate: '',

    pgenerateviapincode: true,
    pvillageorcity: '',
    pdistrict: '',
    cgenerateviapincode: true,
    cvillageorcity: '',
    cdistrict: '',

    caddesstype: '',
    cpersonalprefix: '',
    creferencename: '',
    clandmarkpositionprefix: '',
    clandmarkname: '',
    chouseflatnumber: '',
    cstreetroadname: '',
    clocalityareaname: '',
    ccountry: selectedCountryc?.name,
    cstate: selectedStatec?.name,
    ccity: selectedCityc?.name,
    cpincode: '',
    cgpscoordinate: '',
    samesprmnt: false,
  });
  const [switchValues, setSwicthValues] = useState({
    pvillageorcity: false,
    cvillageorcity: false,
  });

  useEffect(() => {
    const fetchTime = async () => {
      const time = await getCurrentServerTime();
      setServerTime(time);
      setVendor({
        company: 'Please Select Company',
        branch: 'Please Select Branch',
        unit: 'Please Select Unit',
        visitortype: 'Please Select Visitor Type',
        visitormode: 'Please Select Visitor Mode',
        source: '',
        date: moment(time).format('YYYY-MM-DD'),
        requestvisitorfollowupdate: moment(time).format('YYYY-MM-DD'),
        prefix: 'Mr',
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
        // requestvisitorfollowaction: 'Please Select Request Follow Up Action',
        requestvisitorfollowaction: 'Required',
        requestfollowupactionupdate: '',
        requestfollowupactionuptime: '',
        visitorbadge: '',
        visitorsurvey: '',
        uploadedimage: null,
        materialcarryinginfo: false,
        raiseticket: false,
        //newdetails
        addesstype: 'Home',
        personalprefix: '',
        referencename: '',
        landmarkpositionprefix: '',
        landmarkname: '',
        houseflatnumber: '',
        streetroadname: '',
        localityareaname: '',
           pbuildingapartmentname:"",
paddressone:"",
paddresstwo:"",
paddressthree:"",
caddressone:"",
caddresstwo:"",
caddressthree:"",
cbuildingapartmentname:"",
        pcountry: selectedCountryp?.name,
        pstate: selectedStatep?.name,
        pcity: selectedCityp?.name,
        ppincode: '',
        gpscoordinate: '',

        pgenerateviapincode: true,
        pvillageorcity: '',
        pdistrict: '',
        cgenerateviapincode: true,
        cvillageorcity: '',
        cdistrict: '',

        caddesstype: '',
        cpersonalprefix: '',
        creferencename: '',
        clandmarkpositionprefix: '',
        clandmarkname: '',
        chouseflatnumber: '',
        cstreetroadname: '',
        clocalityareaname: '',
        ccountry: selectedCountryc?.name,
        cstate: selectedStatec?.name,
        ccity: selectedCityc?.name,
        cpincode: '',
        cgpscoordinate: '',
        samesprmnt: false,
      });
    };

    fetchTime();
  }, []);
  const [listStatus, setListStatus] = useState('');
  const [billUploadedFiles, setBillUploadedFiles] = useState([]);
  const [billUploadedFilesRequest, setBillUploadedFilesRequest] = useState([]);
  const [uploadBills, setUploadBills] = useState([]);
  const [uploadBillsRequestDocument, setUploadBillsRequestDocument] = useState([]);

  const handleDeleteFileDocumentEditRequestDocument = (index) => {
    const newSelectedFiles = [...uploadBillsRequestDocument];
    newSelectedFiles.splice(index, 1);
    setUploadBillsRequestDocument(newSelectedFiles);
  };

  const handleDeleteFileDocumentEdit = (index) => {
    const newSelectedFiles = [...uploadBills];
    newSelectedFiles.splice(index, 1);
    setUploadBills(newSelectedFiles);
  };

  const handleDeleteUploadedBills = (index) => {
    setBillUploadedFiles((prevFiles) => {
      const fileToDelete = prevFiles[index];

      // Remove from uploadedFiles state
      return prevFiles?.filter((_, i) => i !== index);
    });
  };

  const renderFilePreviewMulter = async (file) => {
    const url = window.URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    window.open(link, '_blank');
  };

  const path = window.location.pathname.slice(1);

  // let today = new Date();
  // var dd = String(today.getDate()).padStart(2, '0');
  // var mm = String(today.getMonth() + 1).padStart(2, '0');
  // var yyyy = today.getFullYear();
  // let formattedDate = yyyy + '-' + mm + '-' + dd;
  // const [date, setDate] = useState(formattedDate);

  const getCurrentTime24Hour = (time) => {
    const now = new Date(time);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  const [existingUser, setExistingUser] = useState([]);

  const [visitorsTypeOption, setVisitorsTypeOption] = useState([]);

  const [subcategory, setSubcategory] = useState('');
  const [subCategoryTodo, setSubcategoryTodo] = useState([]);

  const handleTodoEdit = (index, newValue) => {
    const updatedTodos = [...subCategoryTodo];
    updatedTodos[index] = newValue;
    setSubcategoryTodo(updatedTodos);
  };

  const deleteTodo = (index) => {
    const updatedTodos = [...subCategoryTodo];
    updatedTodos.splice(index, 1);
    setSubcategoryTodo(updatedTodos);
  };

  const addTodo = () => {
    // getCategoryMaster();
    const isSubNameMatch = subCategoryTodo.some((item) => item?.toLowerCase() === subcategory?.toLowerCase());
    // const isSubNameMatch = categorySubcategoryList.some((item) => item.subcategoryname?.includes(subcategory));

    if (subcategory === '') {
      setPopupContentMalert('Please Enter Material');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (isSubNameMatch) {
      setPopupContentMalert('Already Added ! Please Enter Another Material');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      setSubcategoryTodo([...subCategoryTodo, subcategory]);
      setSubcategory('');
    }
  };

  const [colorDrag, setColorDrag] = useState('#FFFFFF');
  const [bgbtnDrag, setBgbtnDrag] = useState(false);
  const handleColorChangeDrag = (e) => {
    setColorDrag(e.target.value);
  };
  const handleSubmitDrag = async (index) => {
    setBgbtnDrag(true);
    if (!image || !color) return;

    const formData = new FormData();
    formData.append('image', imageDrag);
    formData.append('color', colorDrag);

    try {
      const response = await axios.post(SERVICE.REMOVEBG, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // setCroppedImage(response?.data?.image); // Set the base64 image
      setRefImageDrag((prev) => {
        let updated = [...prev];
        let currentObject = {
          ...updated[index],
          preview: `${response?.data?.image}`,
        };
        updated[index] = currentObject;
        return updated;
      });
      setBgbtnDrag(false);
    } catch (error) {
      setBgbtnDrag(false);
      console.error('Error uploading image:', error);
    }
  };

  const isLightColorDrag = calculateLuminance(colorDrag);

  const [color, setColor] = useState([]);
  const [bgbtn, setBgbtn] = useState([]);

  const [colorCaptured, setColorCaptured] = useState([]);
  const [bgbtnCaptured, setBgbtnCaptured] = useState([]);

  const handleColorChange = (e, index) => {
    setColor((prev) => {
      let allColors = [...prev];
      allColors[index] = e.target.value;
      const updated = allColors.map((color) => calculateLuminance(color));

      // Update the state for color and light color
      setIsLightColor(updated);
      return allColors;
    });
  };
  const handleColorChangeCaptured = (e, index) => {
    setColorCaptured((prev) => {
      let allColors = [...prev];
      allColors[index] = e.target.value;
      const updated = allColors.map((color) => calculateLuminance(color));

      // Update the state for color and light color
      setIsLightColorCaptured(updated);
      return allColors;
    });
  };
  const [image, setImage] = useState([]);
  const [capturedImage, setCapturedImage] = useState([]);

  const [imageDrag, setImageDrag] = useState([]);

  const handleSubmitNew = async (index, from) => {
    if (index === undefined || index < 0) {
      console.error('Invalid index provided.');
      return;
    }

    if (from === 'upload') {
      setBgbtn((prev) => {
        const newState = [...prev];
        newState[index] = true;
        return newState;
      });
    } else {
      setBgbtnCaptured((prev) => {
        const newState = [...prev];
        newState[index] = true;
        return newState;
      });
    }

    const selectedImage = from === 'upload' ? image?.[index] : capturedImage?.[index];
    const selectedColor = from === 'upload' ? color?.[index] : colorCaptured?.[index];

    if (!selectedImage || !selectedColor) {
      console.error('Image or color not provided.');
      // Reset the button states in case of an error.
      if (from === 'upload') {
        setBgbtn((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
      } else {
        setBgbtnCaptured((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
      }
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('color', selectedColor);

    try {
      const response = await axios.post(SERVICE.REMOVEBG, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Example: Set the cropped image (if needed).
      // setCroppedImage(response?.data?.image);
      from === 'upload'
        ? setRefImage((prev) => {
            let updated = [...prev];
            let currentObject = {
              ...updated[index],
              preview: `${response?.data?.image}`,
            };
            updated[index] = currentObject;
            return updated;
          })
        : setCapturedImages((prev) => {
            let updated = [...prev];
            let currentObject = {
              ...updated[index],
              preview: `${response?.data?.image}`,
            };
            updated[index] = currentObject;
            return updated;
          });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      // Reset button states after the operation, regardless of success or failure.
      if (from === 'upload') {
        setBgbtn((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
      } else {
        setBgbtnCaptured((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
      }
    }
  };

  const [isLightColor, setIsLightColor] = useState([]);
  const [isLightColorCaptured, setIsLightColorCaptured] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonLoad, setButtonLoad] = useState(false);
  const [visitorCode, setVisitorCode] = useState('VISIT#0001');
  const classes = useStyles();
  const backPage = useNavigate();

  const [isimgviewbill, setImgviewbill] = useState(false);
  const handleImgcodeviewbill = () => {
    setImgviewbill(true);
  };
  const handlecloseImgcodeviewbill = () => {
    setImgviewbill(false);
  };

  const [visitorCheck, setVisitorCheck] = useState('New Visitor');
  const [visitorCheckName, setVisitorCheckName] = useState('');
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupSeverityMalert, setPopupSeverityMalert] = useState('');
  const [popupContentMalert, setPopupContentMalert] = useState('');
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

  const [checkContactEmail, setCheckContactEmail] = useState(false);
  const [checkContactEmailForpopup, setCheckContactEmailForpopup] = useState(false);

  const [checkContactEmailMessage, setCheckContactEmailMessage] = useState('');
  const handleClickOpenCheckContact = () => {
    setCheckContactEmail(true);
  };
  const handleCloseOpenCheckContact = () => {
    setCheckContactEmail(false);
    setCheckContactEmailForpopup(false);
  };
  const handleCloseOpenCheckContactMessage = () => {
    setCheckContactEmail(false);
    setCheckContactEmailForpopup(false);
    setVendor({
      ...vendor,
      visitorcontactnumber: '',
      visitoremail: '',
    });
  };

  const [cateCode, setCatCode] = useState([]);
  const [vendorArray, setVendorArray] = useState([]);
  const { isUserRoleAccess, isUserRoleCompare, isAssignBranch, allUsersData, allTeam, allareagrouping, allfloor, alldepartment, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);

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

  const filteredAreas = allareagrouping?.filter((area) => accessbranch.some((access) => access.company === area.company && access.branch === area.branch && access.unit === area.unit));

  const { auth } = useContext(AuthContext);
  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };

  const getapi = async () => {
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
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

  let [valueFloorLocationCat, setValueFloorLocationCat] = useState([]);
  let [valueBranchLocationCat, setValueBranchLocationCat] = useState([]);

  useEffect(() => {
    getapi();
    fetchVendor();
    fetchInteractorType();
    fetchInteractorMode();
    fetchLastindexVendor();
  }, []);

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

  const [refImage, setRefImage] = useState([]);
  const [previewURL, setPreviewURL] = useState(null);
  const [refImageDrag, setRefImageDrag] = useState([]);
  const [valNum, setValNum] = useState(0);
  //webcam
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [getImg, setGetImg] = useState(null);
  const [isWebcamCapture, setIsWebcamCapture] = useState(false);
  const webcamOpen = () => {
    setIsWebcamOpen(true);
  };

  useEffect(() => {
    if (!capturedImages) return;

    const newBlobs = [];
    const newBgbtnCaptured = [];
    const newColors = [];

    capturedImages.forEach((item) => {
      if (!item?.preview) return;

      const base64Data = item.preview?.split(',')[1]; // Extract base64 data
      const binaryData = atob(base64Data); // Decode base64 data
      const uint8Array = new Uint8Array(binaryData?.length);

      // Fill the array buffer with the decoded binary data
      for (let i = 0; i < binaryData?.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }

      // Create a Blob from the binary data
      const blob = new Blob([uint8Array], { type: 'image/png' });
      newBlobs.push(blob);

      // Add default values for bgbtnCaptured and colors
      newBgbtnCaptured.push(false);
      newColors.push('#ffffff');
    });

    // Update states with the accumulated values
    setCapturedImage((prev) => [...newBlobs]);
    setBgbtnCaptured((prev) => [...newBgbtnCaptured]);

    // Calculate luminance for the new colors
    const luminanceValues = newColors.map((color) => calculateLuminance(color));
    setColorCaptured((prev) => [...prev, ...newColors]);
    setIsLightColorCaptured((prev) => [...prev, ...luminanceValues]);
  }, [capturedImages]);

  const webcamClose = () => {
    setIsWebcamOpen(false);
    setGetImg('');
  };
  const webcamDataStore = () => {
    setIsWebcamCapture(true);
    webcamClose();
    setGetImg('');
  };
  const showWebcam = () => {
    webcamOpen();
  };
  // Upload Popup
  const [uploadPopupOpen, setUploadPopupOpen] = useState(false);
  const handleClickUploadPopupOpen = () => {
    setUploadPopupOpen(true);
  };
  const handleUploadPopupClose = () => {
    setUploadPopupOpen(false);
  };
  const getFileIcon = (fileName) => {
    const extension1 = fileName?.split('.').pop();
    switch (extension1) {
      case 'pdf':
        return pdfIcon;
      case 'doc':
      case 'docx':
        return wordIcon;
      case 'xls':
      case 'xlsx':
        return excelIcon;
      case 'csv':
        return csvIcon;
      default:
        return fileIcon;
    }
  };

  const [file, setFile] = useState('');

  // Image Upload
  useEffect(() => {
    const loadModels = async () => {
      const modelUrl = SERVICE.FACEDETECTLOGINMODEL;

      await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl), faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl), faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl)]);
    };

    loadModels();
  }, []);

  const [btnUpload, setBtnUpload] = useState(false);

  const [showDupProfileVIsitor, setShowDupProfileVIsitor] = useState();
  const [isErrorOpenpop, setIsErrorOpenpop] = useState(false);
  const handleClickOpenerrpop = () => {
    setIsErrorOpenpop(true);
  };
  const handleCloseerrpop = () => {
    setIsErrorOpenpop(false);
  };

  const [isErrorOpenpopdragdrop, setIsErrorOpenpopdragdrop] = useState(false);
  const [showAlertpopdragdrop, setShowAlertpopdragdrop] = useState();
  const handleClickOpenerrpopdragdrop = () => {
    setIsErrorOpenpopdragdrop(true);
  };
  const handleCloseerrpopdragdrop = () => {
    setIsErrorOpenpopdragdrop(false);
    setUploadwithDupImage([]);
  };

  const [uploadwithDupImage, setUploadwithDupImage] = useState([]);

  function handleChangeImage(e) {
    try {
      setIsLoading(true);
      setBtnUpload(true); // Enable loader when the process starts
      setImage([]);
      const maxFileSize = 1 * 1024 * 1024; // 1MB in bytes
      // Get the selected file
      const file = e.target.files[0];
      if (
        file
        // && file.size < maxFileSize
      ) {
        const path = URL.createObjectURL(file);
        const image = new Image();
        image.src = path;

        const NewData = [];
        NewData.push({
          name: file.name,
          size: file.size,
          type: file?.type,
          preview: path,
          base64: path?.split(',')[1],
        });
        const fileToBase64 = (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              // Split the result at the comma and take the second part (the base64 string)
              const base64Data = reader.result.split(',')[1];
              resolve(base64Data);
            };
            reader.onerror = (error) => reject(error);
          });
        };

        const processFile = async (file) => {
          // Inside an async function:
          const base64String = await fileToBase64(file);

          const NewDataNew = [
            {
              name: file.name,
              size: file.size,
              type: file?.type,
              preview: `data:${file?.type};base64,${base64String}`, // Reconstruct if needed for preview
              base64: base64String, // Just the raw base64 string
            },
          ];
          return NewDataNew;
        };

        processFile(file).then((NewDataNew) => {
          setNewimageNew(NewDataNew);
        });

        // Call the function with your file
        // processFile(file).then(NewData => { ... });
        setNewimage(NewData);
        image.onload = async () => {
          try {
            const detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();

            if (detections?.length > 0) {
              const faceDescriptor = detections[0].descriptor;

              const response = await axios.post(`${SERVICE.DUPLICATECANDIDATEFACEDETECTVISITORINFORMATION_FORINTERVIEW}`, {
                headers: {
                  Authorization: `Bearer ${auth.APIToken}`,
                },
                faceDescriptor: Array.from(faceDescriptor),
              });

              if (response?.data?.matchfound) {
                setIsLoading(false);
                setUploadwithDupImage(e);
                setShowDupProfileVIsitor(response?.data?.matchedData);
                handleClickOpenerrpop();
              }
              //  else {
              const files = e.target.files;
              let newSelectedFiles = [...refImage];
              for (let i = 0; i < files?.length; i++) {
                const file = files[i];

                if (file?.type.startsWith('image/')) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    newSelectedFiles.push({
                      name: file.name,
                      size: file.size,
                      type: file?.type,
                      preview: reader.result,
                      base64: reader.result?.split(',')[1],
                    });
                    setRefImage(newSelectedFiles);

                    const base64Data = reader.result?.split(',')[1]; // Get base64 data (without the prefix)
                    const binaryData = atob(base64Data); // Decode base64 data
                    const arrayBuffer = new ArrayBuffer(binaryData?.length);
                    const uint8Array = new Uint8Array(arrayBuffer);
                    // Fill the array buffer with the decoded binary data
                    for (let i = 0; i < binaryData?.length; i++) {
                      uint8Array[i] = binaryData.charCodeAt(i);
                    }
                    // Create a Blob from the binary data
                    const blob = new Blob([uint8Array], { type: 'image/png' });
                    setImage((prev) => [...prev, blob]);
                    setBgbtn((prev) => {
                      let availed = [...prev];
                      if (availed?.length > 0) {
                        availed.push(false);
                      } else {
                        Array(newSelectedFiles?.length).fill(false);
                      }
                      return availed;
                    });
                    setColor((prev) => {
                      let availed = [...prev];

                      // Check if there are any existing colors in the state
                      if (availed?.length > 0) {
                        availed.push('#ffffff');
                      } else {
                        // If no colors are present, create a new array with default colors
                        availed = Array(newSelectedFiles?.length).fill('#ffffff');
                      }
                      // Calculate luminance for the updated array of colors
                      const updated = availed.map((color) => calculateLuminance(color));
                      // Update the state for color and light color
                      setIsLightColor(updated);
                      return availed;
                    });
                  };
                  reader.readAsDataURL(file);
                }
                // }
                toDataURL(path, function (dataUrl) {
                  setVendor({
                    ...vendor,
                    uploadedimage: String(dataUrl),
                    faceDescriptor: Array.from(faceDescriptor),
                  });
                });
              }
              setIsLoading(false);
            } else {
              setIsLoading(false);
              setPopupContentMalert('No face detected!');
              setPopupSeverityMalert('info');
              handleClickOpenPopupMalert();
            }
          } catch (error) {
            setIsLoading(false);
            setPopupContentMalert('Error in face detection!');
            setPopupSeverityMalert('info');
            handleClickOpenPopupMalert();
          } finally {
            setIsLoading(false);
            setBtnUpload(false); // Disable loader when done
          }
        };

        image.onerror = (err) => {
          console.error('Image failed to load', err);
          setPopupContentMalert('Error loading image!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          setBtnUpload(false); // Disable loader in case of error
        };

        setFile(URL.createObjectURL(file));
      } else {
        setIsLoading(false);
        // if (file !== undefined) {
        //   setPopupContentMalert('File size is greater than 1MB, please upload a file below 1MB.!');
        //   setPopupSeverityMalert('info');
        //   handleClickOpenPopupMalert();
        //   setBtnUpload(false);
        // }
        setBtnUpload(false);
      }
    } catch (err) {}
  }

  function handleChangeImageDrag(e) {
    setBtnUpload(true); // Enable loader when the process starts
    const maxFileSize = 1 * 1024 * 1024; // 1MB in bytes

    // Get the selected file
    const file = e.dataTransfer.files[0];
    if (
      file
      //  && file.size < maxFileSize
    ) {
      const path = URL.createObjectURL(file);
      const image = new Image();
      image.src = path;

      const ImgFil = [];
      ImgFil.push({
        name: file.name,
        size: file.size,
        type: file?.type,
        preview: path,
        base64: path?.split(',')[1],
      });

      setNewimage(ImgFil);

      image.onload = async () => {
        try {
          const detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();

          if (detections?.length > 0) {
            const faceDescriptor = detections[0].descriptor;

            const response = await axios.post(`${SERVICE.DUPLICATECANDIDATEFACEDETECTVISITORINFORMATION_FORINTERVIEW}`, {
              headers: {
                Authorization: `Bearer ${auth.APIToken}`,
              },
              faceDescriptor: Array.from(faceDescriptor),
            });

            if (response?.data?.matchfound) {
              setUploadwithDupImage(file);
              setShowAlertpopdragdrop(response?.data?.matchedData);
              handleClickOpenerrpopdragdrop();
              setIsLoading(false);
            } else {
              let newSelectedFilesDrag = [...refImageDrag];

              if (file?.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                  newSelectedFilesDrag.push({
                    name: file.name,
                    size: file.size,
                    type: file?.type,
                    preview: reader.result,
                    base64: reader.result?.split(',')[1],
                  });
                  setRefImageDrag(newSelectedFilesDrag);

                  const base64Data = reader.result?.split(',')[1]; // Get base64 data (without the prefix)
                  const binaryData = atob(base64Data); // Decode base64 data
                  const arrayBuffer = new ArrayBuffer(binaryData?.length);
                  const uint8Array = new Uint8Array(arrayBuffer);

                  // Fill the array buffer with the decoded binary data
                  for (let i = 0; i < binaryData?.length; i++) {
                    uint8Array[i] = binaryData.charCodeAt(i);
                  }

                  // Create a Blob from the binary data
                  const blob = new Blob([uint8Array], { type: 'image/png' });
                  setImageDrag(blob);
                };
                reader.readAsDataURL(file);
                setVendor({
                  ...vendor,
                  faceDescriptor: Array.from(faceDescriptor),
                });
                setIsLoading(false);
              } else {
                setPopupContentMalert('Only Accept Images');
                setPopupSeverityMalert('info');
                handleClickOpenPopupMalert();
                setIsLoading(false);
              }
            }
          } else {
            setPopupContentMalert('No face detected!');
            setPopupSeverityMalert('info');
            handleClickOpenPopupMalert();
            setIsLoading(false);
          }
        } catch (error) {
          setPopupContentMalert('Error in face detection!');
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          setIsLoading(false);
        } finally {
          setBtnUpload(false); // Disable loader when done
          setIsLoading(false);
        }
      };

      image.onerror = (err) => {
        setPopupContentMalert('Error loading image!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        setBtnUpload(false); // Disable loader in case of
        setIsLoading(false);
      };

      setFile(URL.createObjectURL(file));
    } else {
      // if (file !== undefined) {
      //   setPopupContentMalert('File size is greater than 1MB, please upload a file below 1MB.!');
      //   setPopupSeverityMalert('info');
      //   handleClickOpenPopupMalert();
      //   setBtnUpload(false);
      // }
      setBtnUpload(false);
    }
  }

  function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

  const handleDeleteFile = (index) => {
    const newSelectedFiles = [...refImage];
    const bgbtnArray = [...bgbtn];
    const colorArray = [...color];
    newSelectedFiles.splice(index, 1);
    bgbtnArray.splice(index, 1);
    colorArray.splice(index, 1);
    setRefImage(newSelectedFiles);
    setBgbtn(bgbtnArray);
    setColor(colorArray);
  };

  // const renderFilePreview = async (file) => {

  //   const url = window.URL.createObjectURL(file);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   window.open(link, '_blank');
  // };
  const renderFilePreview = async (file) => {
    if (!file?.preview) {
      console.error('No preview URL available');
      return;
    }

    // Ensure the preview is a properly formatted data URI
    let previewUrl;
    if (file.preview.startsWith('data:')) {
      previewUrl = file.preview;
    } else {
      // If it's raw base64, prepend the proper data URI header
      const mimeType = file?.type || 'image/jpeg'; // default to jpeg if type missing
      previewUrl = `data:${mimeType};base64,${file.preview}`;
    }

    // First try: Create a blob URL (more reliable than data URIs)
    try {
      // Convert data URI to blob
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Try opening with window.open
      const newWindow = window.open(blobUrl, '_blank');
      if (!newWindow || newWindow.closed) {
        throw new Error('Popup blocked');
      }

      // Clean up blob URL after some time
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      return;
    } catch (error) {
      console.log('Blob approach failed, trying fallback:', error);
    }

    // Fallback 1: Direct data URI approach
    try {
      const newWindow = window.open(previewUrl, '_blank');
      if (newWindow && !newWindow.closed) return;
    } catch (error) {
      console.log('Direct window.open failed:', error);
    }

    // Fallback 2: Create download link
    const link = document.createElement('a');
    link.href = previewUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 100);
  };

  const removeCapturedImage = (index) => {
    const newCapturedImages = [...capturedImages];
    newCapturedImages.splice(index, 1);
    setCapturedImages(newCapturedImages);
  };
  const resetImage = () => {
    setGetImg('');
    setRefImage([]);
    setPreviewURL(null);
    setRefImageDrag([]);
    setCapturedImages([]);
  };
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    previewFile(event.dataTransfer.files[0]);
    const data = await handleChangeImageDrag(event);
  };

  const handlePaste = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    const clipboardItems = event.clipboardData.items;
    for (let item of clipboardItems) {
      if (item?.type.startsWith('image')) {
        const file = item.getAsFile();
        if (file) {
          previewFile(file); // Preview the image
          await handleChangeImageDrag({ dataTransfer: { files: [file] } }); // Process the image
        }
      }
    }
  };

  const handleUploadOverAll = () => {
    setUploadPopupOpen(false);
  };
  const previewFile = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewURL(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveFile = (index) => {
    const newSelectedFiles = [...refImageDrag];
    newSelectedFiles.splice(index, 1);
    setRefImageDrag(newSelectedFiles);
  };
  const [refImageedit, setRefImageedit] = useState([]);
  const [previewURLedit, setPreviewURLedit] = useState(null);
  const [refImageDragedit, setRefImageDragedit] = useState([]);
  const [valNumedit, setValNumedit] = useState(0);
  const [isWebcamOpenedit, setIsWebcamOpenedit] = useState(false);
  const [capturedImagesedit, setCapturedImagesedit] = useState([]);
  const [getImgedit, setGetImgedit] = useState(null);
  const webcamOpenedit = () => {
    setIsWebcamOpenedit(true);
  };
  const webcamCloseedit = () => {
    setIsWebcamOpenedit(false);
    setGetImgedit('');
  };
  const webcamDataStoreedit = () => {
    webcamCloseedit();
    setGetImgedit('');
  };
  const showWebcamedit = () => {
    webcamOpenedit();
  };
  const [uploadPopupOpenedit, setUploadPopupOpenedit] = useState(false);

  const handleUploadPopupCloseedit = () => {
    setUploadPopupOpenedit(false);
    setGetImgedit('');
    setRefImageedit([]);
    setPreviewURLedit(null);
    setRefImageDragedit([]);
    setCapturedImagesedit([]);
  };
  const handleInputChangeedit = (event) => {
    const files = event.target.files;
    let newSelectedFiles = [...refImageedit];

    for (let i = 0; i < files?.length; i++) {
      const file = files[i];
      // Check if the file is an image
      if (file?.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          newSelectedFiles.push({
            name: file.name,
            size: file.size,
            type: file?.type,
            preview: reader.result,
            base64: reader.result?.split(',')[1],
          });
          setRefImageedit(newSelectedFiles);
        };
        reader.readAsDataURL(file);
      } else {
        setPopupContentMalert('Only Accept Images');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      }
    }
  };
  const [allUploadedFilesedit, setAllUploadedFilesedit] = useState([]);
  let combinedArray = allUploadedFilesedit.concat(refImageedit, refImageDragedit, capturedImagesedit);
  let uniqueValues = {};
  let resultArray = combinedArray?.filter((item) => {
    if (!uniqueValues[item.name]) {
      uniqueValues[item.name] = true;
      return true;
    }
    return false;
  });

  //first deletefile
  const handleDeleteFileedit = (index) => {
    const newSelectedFiles = [...refImageedit];
    newSelectedFiles.splice(index, 1);
    setRefImageedit(newSelectedFiles);
  };

  const renderFilePreviewedit = async (file) => {
    const response = await fetch(file.preview);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    window.open(link, '_blank');
  };
  const resetImageedit = () => {
    setGetImgedit('');
    setRefImageedit([]);
    setPreviewURLedit(null);
    setRefImageDragedit([]);
    setCapturedImagesedit([]);
  };
  const handleDragOveredit = (event) => {};
  const handleDropedit = (event) => {
    event.preventDefault();
    previewFileedit(event.dataTransfer.files[0]);
    const files = event.dataTransfer.files;
    let newSelectedFilesDrag = [...refImageDragedit];
    for (let i = 0; i < files?.length; i++) {
      const file = files[i];
      if (file?.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          newSelectedFilesDrag.push({
            name: file.name,
            size: file.size,
            type: file?.type,
            preview: reader.result,
            base64: reader.result?.split(',')[1],
          });
          setRefImageDragedit(newSelectedFilesDrag);
        };
        reader.readAsDataURL(file);
      } else {
        setPopupContentMalert('Only Accept Images!');
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
      }
    }
  };
  const handleUploadOverAlledit = () => {
    setUploadPopupOpenedit(false);
  };
  const previewFileedit = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewURLedit(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveFileedit = (index) => {
    const newSelectedFiles = [...refImageDragedit];
    newSelectedFiles.splice(index, 1);
    setRefImageDragedit(newSelectedFiles);
  };

  const handleMobile = (e) => {
    if (e?.length > 10) {
      let num = e.slice(0, 10);
      setVendor({ ...vendor, visitorcontactnumber: num });
    }
  };

  const [getimgbillcode, setGetImgbillcode] = useState([]);

  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const handleOpenTicket = () => {
    setIsTicketOpen(true);
  };
  const handleCloseTicket = () => {
    setIsTicketOpen(false);
  };

  const [visitorsModeOption, setVisitorsModeOption] = useState([]);
  const [visitorsPurposeOption, setVisitorsPurposeOption] = useState([]);
  //get all interactorMode name.
  const fetchInteractorMode = async () => {
    setPageName(!pageName);
    try {
      let res_freq = await axios.get(SERVICE.ALL_INTERACTORMODE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setVisitorsModeOption(
        res_freq?.data?.interactormode.map((t) => ({
          ...t,
          label: t.name,
          value: t.name,
        }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  //get all interactorType name.
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

  const fetchInteractorPurpose = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(SERVICE.ALL_MANAGETYPEPG, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let result = res?.data?.manageTypePG?.filter((d) => d.interactorstype === e);
      let ans = result.flatMap((data) => data.interactorspurpose);

      setVisitorsPurposeOption(
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
    setVendor({
      ...vendor,
      meetingpersonemployeename: 'Please Select Employee Name',
    });
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
    setVendor({
      ...vendor,
      meetingpersonemployeename: 'Please Select Employee Name',
    });
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
    setVendor({
      ...vendor,
      meetingpersonemployeename: 'Please Select Employee Name',
    });
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
    setVendor({
      ...vendor,
      meetingpersonemployeename: 'Please Select Employee Name',
    });
  };

  const customValueRendererTeam = (valueTeamCat, _categoryname) => {
    return valueTeamCat?.length ? valueTeamCat.map(({ label }) => label)?.join(', ') : 'Please Select Team';
  };

  //Department multiselect
  const [selectedOptionsDepartment, setSelectedOptionsDepartment] = useState([]);
  let [valueDepartmentCat, setValueDepartmentCat] = useState([]);
  const handleDepartmentChange = (options) => {
    setValueDepartmentCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsDepartment(options);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
    setVendor({
      ...vendor,
      meetingpersonemployeename: 'Please Select Employee Name',
    });
  };

  const customValueRendererDepartment = (valueDepartmentCat, _categoryname) => {
    return valueDepartmentCat?.length ? valueDepartmentCat.map(({ label }) => label)?.join(', ') : 'Please Select Department';
  };

  //company location multiselect
  const [selectedOptionsCompanyLocation, setSelectedOptionsCompanyLocation] = useState([]);
  let [valueCompanyLocationCat, setValueCompanyLocationCat] = useState([]);
  const handleCompanyLocationChange = (options) => {
    setValueCompanyLocationCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsCompanyLocation(options);
    setValueBranchLocationCat([]);
    setSelectedOptionsBranchLocation([]);
    setValueUnitLocationCat([]);
    setSelectedOptionsUnitLocation([]);
    setValueFloorLocationCat([]);
    setSelectedOptionsFloorLocation([]);
    setVendor({ ...vendor, meetinglocationarea: 'Please Select Area' });
  };

  const customValueRendererCompanyLocation = (valueCompanyLocationCat, _categoryname) => {
    return valueCompanyLocationCat?.length ? valueCompanyLocationCat.map(({ label }) => label)?.join(', ') : 'Please Select Company';
  };

  //branch location multiselect
  const [selectedOptionsBranchLocation, setSelectedOptionsBranchLocation] = useState([]);
  const handleBranchLocationChange = (options) => {
    setValueBranchLocationCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsBranchLocation(options);
    setValueUnitLocationCat([]);
    setSelectedOptionsUnitLocation([]);
    setValueFloorLocationCat([]);
    setSelectedOptionsFloorLocation([]);
    setVendor({ ...vendor, meetinglocationarea: 'Please Select Area' });
  };

  const customValueRendererBranchLocation = (valueBranchLocationCat, _categoryname) => {
    return valueBranchLocationCat?.length ? valueBranchLocationCat.map(({ label }) => label)?.join(', ') : 'Please Select Branch';
  };

  //unit location multiselect
  const [selectedOptionsUnitLocation, setSelectedOptionsUnitLocation] = useState([]);
  let [valueUnitLocationCat, setValueUnitLocationCat] = useState([]);

  const handleUnitLocationChange = (options) => {
    setValueUnitLocationCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsUnitLocation(options);
    setValueFloorLocationCat([]);
    setSelectedOptionsFloorLocation([]);
    setVendor({ ...vendor, meetinglocationarea: 'Please Select Area' });
  };

  const customValueRendererUnitLocation = (valueUnitLocationCat, _categoryname) => {
    return valueUnitLocationCat?.length ? valueUnitLocationCat.map(({ label }) => label)?.join(', ') : 'Please Select Unit';
  };

  //floor location multiselect
  const [selectedOptionsFloorLocation, setSelectedOptionsFloorLocation] = useState([]);
  const handleFloorLocationChange = (options) => {
    setValueFloorLocationCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsFloorLocation(options);
    setVendor({ ...vendor, meetinglocationarea: 'Please Select Area' });
  };

  const customValueRendererFloorLocation = (valueFloorLocationCat, _categoryname) => {
    return valueFloorLocationCat?.length ? valueFloorLocationCat.map(({ label }) => label)?.join(', ') : 'Please Select Floor';
  };

  let name = 'create';
  let nameedit = 'edit';
  let allUploadedFiles = [];

  const [olduniqueid, setOldUnique] = useState(0);

  const fetchAssignedBy = async () => {
    try {
      let res_vendor = await axios.get(SERVICE.CANDIDATESALLCOUNT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setOldUnique(res_vendor?.data?.candidates);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchAssignedBy();
  }, []);

  let uniqueid = olduniqueid ? Number(olduniqueid?.unique) : 0;
  let idfinal = Number(uniqueid) + 1;

  const [isExistVisitor, setIsExistVisitor] = useState(false);
  //add function
  const [visitorLogData, setVisitorLogData] = useState([]);

  const [documentFiles, setdocumentFiles] = useState([]);

  const sendRequest = async (type, ticketid) => {
    setButtonLoad(true);
    setPageName(!pageName);
    try {
      let formData = new FormData();

      if (uploadBills?.length > 0) {
        uploadBills.forEach((item) => {
          formData.append('visitordocument', item.file); // `files` is the key for multiple files
        });
      }

      if (uploadBillsRequestDocument?.length > 0) {
        uploadBillsRequestDocument.forEach((item, index) => {
          formData.append('requestdocument', item.file); // Append the file
          formData.append(`remarks[${index}]`, item.remark); // Append the remark for this file
        });
      }

      const resdata = (await fetchLastindexVendor()) || 'VISIT#0001';

      const uniqueid = uuidv4();
      let requestCheck = visitorsTypeOption?.filter((item) => item?.interactorstype === vendor.visitortype && item?.interactorspurpose?.includes(vendor.visitorpurpose))[0]?.requestdocument && vendor?.raiseticket;
      const jsonData = {
        company: String(vendor.company),
        branch: String(vendor.branch),
        unit: String(vendor.unit),
        unique: Number(idfinal),
        visitorid: String(resdata),
        visitortype: String(vendor.visitortype),
        visitormode: String(vendor.visitormode),
        source: String(vendor.source || ''),

        //Newvalue
        //Newvalue
        pgenerateviapincode: Boolean(vendor?.pgenerateviapincode || false),
        pvillageorcity: String(vendor?.pvillageorcity || ''),
        pdistrict: String(vendor?.pdistrict || ''),
        cgenerateviapincode: !vendor.samesprmnt ? Boolean(vendor?.cgenerateviapincode || false) : Boolean(vendor?.pgenerateviapincode || false),
        cvillageorcity: !vendor.samesprmnt ? String(vendor?.cvillageorcity || '') : String(vendor?.pvillageorcity || ''),
        cdistrict: !vendor.samesprmnt ? String(vendor?.cdistrict || '') : String(vendor?.pdistrict || ''),

        addesstype: String(vendor.addesstype),
        personalprefix: String(vendor.personalprefix),
        referencename: String(vendor.referencename),
        landmarkpositionprefix: String(vendor.landmarkpositionprefix),
        landmarkname: String(vendor.landmarkname),
        houseflatnumber: String(vendor.houseflatnumber),
        streetroadname: String(vendor.streetroadname),
        localityareaname: String(vendor.localityareaname),
        pcountry: String(selectedCountryp?.name == undefined ? '' : selectedCountryp?.name),
        pstate: String(selectedStatep?.name == undefined ? '' : selectedStatep?.name),
        pcity: String(selectedCityp?.name == undefined ? '' : selectedCityp?.name),
        ppincode: String(vendor.ppincode),
        gpscoordinate: String(vendor.gpscoordinate),

        samesprmnt: Boolean(vendor.samesprmnt),
        //current Address
        caddesstype: !vendor.samesprmnt ? String(vendor.caddesstype) : String(vendor.addesstype),
        cpersonalprefix: !vendor.samesprmnt ? String(vendor.cpersonalprefix) : String(vendor.personalprefix),
        creferencename: !vendor.samesprmnt ? String(vendor.creferencename) : String(vendor.referencename),
        clandmarkpositionprefix: !vendor.samesprmnt ? String(vendor.clandmarkpositionprefix) : String(vendor.landmarkpositionprefix),
        clandmarkname: !vendor.samesprmnt ? String(vendor.clandmarkname) : String(vendor.landmarkname),
        chouseflatnumber: !vendor.samesprmnt ? String(vendor.chouseflatnumber) : String(vendor.houseflatnumber),
        cstreetroadname: !vendor.samesprmnt ? String(vendor.cstreetroadname) : String(vendor.streetroadname),
        clocalityareaname: !vendor.samesprmnt ? String(vendor.clocalityareaname) : String(vendor.localityareaname),
        ccountry: !vendor.samesprmnt ? String(selectedCountryc?.name == undefined ? '' : selectedCountryc?.name) : String(selectedCountryp?.name == undefined ? '' : selectedCountryp?.name),
        cstate: !vendor.samesprmnt ? String(selectedStatec?.name == undefined ? '' : selectedStatec?.name) : String(selectedStatep?.name == undefined ? '' : selectedStatep?.name),
        ccity: !vendor.samesprmnt ? String(selectedCityc?.name == undefined ? '' : selectedCityc?.name) : String(selectedCityp?.name == undefined ? '' : selectedCityp?.name),
        cpincode: !vendor.samesprmnt ? String(vendor.cpincode) : String(vendor.ppincode),
        cgpscoordinate: !vendor.samesprmnt ? String(vendor.cgpscoordinate) : String(vendor.gpscoordinate),

         pbuildingapartmentname:String(vendor?.pbuildingapartmentname || ""),
paddressone:String(vendor?.paddressone || ""),
paddresstwo:String(vendor?.paddresstwo || ""),
paddressthree:String(vendor?.paddressthree || ""),

caddressone: !vendor.samesprmnt ? String(vendor?.caddressone || '') : String(vendor?.paddressone || ''),
caddresstwo: !vendor.samesprmnt ? String(vendor?.caddresstwo || '') : String(vendor?.paddresstwo || ''),
caddressthree: !vendor.samesprmnt ? String(vendor?.caddressthree || '') : String(vendor?.paddressthree || ''),
cbuildingapartmentname: !vendor.samesprmnt ? String(vendor?.cbuildingapartmentname || '') : String(vendor?.pbuildingapartmentname || ''),

        date: String(vendor.date),
        requestvisitorfollowupdate: visitorsTypeOption?.filter((item) => item?.interactorstype === vendor.visitortype && item?.interactorspurpose?.includes(vendor.visitorpurpose))[0]?.requestdocument || false ? String(vendor.requestvisitorfollowupdate) : '',
        prefix: String(vendor.prefix),
        visitorname: String(vendor.visitorname),
        intime: String(vendor.intime),
        visitorpurpose: String(vendor.visitorpurpose),
        visitorcontactnumber: String(vendor.visitorcontactnumber),
        visitoremail: String(vendor.visitoremail),
        visitorcompnayname: String(vendor.visitorcompnayname),
        documenttype: String(vendor.documenttype === 'Please Select Document Type' ? '' : vendor.documenttype),
        faceDescriptor: vendor?.faceDescriptor?.length > 0 ? vendor?.faceDescriptor : [],
        documentnumber: String(vendor.documentnumber),
        escortinformation: Boolean(vendor.escortinformation),
        escortdetails: String(vendor.escortinformation === true ? vendor.escortdetails : ''),

        visitorbadge: String(vendor.visitorbadge),
        visitorinformationstatus: 'Pending',

        equipmentborrowed: String(vendor.equipmentborrowed),
        outtime: String(vendor.outtime),
        remark: String(vendor.remark),
        visitorsurvey: String(vendor.visitorsurvey),
        addvisitorin: Boolean(true),
        detailsaddedy: String(isUserRoleAccess?.companyname),
        // detailsaddedy: String(vendor.visitorname),
        visitorExistiongDocument: billUploadedFiles,
        visitorExistiongRequestDocument: billUploadedFilesRequest,
        visitorcommonid: resdata,
        files: allUploadedFiles.concat(refImage, refImageDrag, capturedImages),

        interactorstatus: String('visitorinformation'),
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            // date: String(new Date()),
          },
        ],
      };

      formData.append('jsonData', JSON.stringify(jsonData));
      let addVendorDetails = await axios.post(SERVICE.CREATE_VISITORINFORMATIONS, formData, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      await fetchVendor();
      setListStatus(addVendorDetails?.data);
      setPopupContent('Added Successfully');
      setPopupSeverity('success');
      handleClickOpenPopup();
      setButtonLoad(false);

      // setTimeout(() => {
      //     backPage('/interactor/master/visitorinformationmasterlist');
      // }, 1000);

      setIsExistVisitor(false);
      setSubcategoryTodo([]);
      setSubcategory('');
    } catch (err) {
      setButtonLoad(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //valid email verification
  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const [buttonName, setButtonName] = useState('');
  //submit option for saving
  const handleSubmit = async (e, type) => {
    e.preventDefault();
    // await fetchVendor();

    function hasDuplicates(array) {
      const map = {};
      for (const item of array) {
        if (map[item]) {
          return true; // Duplicate found
        }
        map[item] = 1;
      }
      return false; // No duplicates
    }

    const DuplicateTodoValu = hasDuplicates(subCategoryTodo);
    // let compopt = selectedOptionsCompany.map((item) => item.value);
    // let branchopt = selectedOptionsBranch.map((item) => item.value);
    // let unitopt = selectedOptionsUnit.map((item) => item.value);
    // let departmentopt = selectedOptionsDepartment.map((item) => item.value);
    // let teamopt = selectedOptionsTeam.map((item) => item.value);

    // let compLocationopt = selectedOptionsCompanyLocation.map((item) => item.value);
    // let branchLocationopt = selectedOptionsBranchLocation.map((item) => item.value);
    // let unitLocationopt = selectedOptionsUnitLocation.map((item) => item.value);
    // let floorLocationopt = selectedOptionsFloorLocation.map((item) => item.value);
    const isNameMatch = vendorArray.some(
      (item) =>
        item.company === vendor.company &&
        item.branch === vendor.branch &&
        item.unit === vendor.unit &&
        item.visitortype === vendor.visitortype &&
        item.visitormode === vendor.visitormode &&
        item.source === vendor.source &&
        item.visitorpurpose === vendor.visitorpurpose &&
        item.date === vendor.date &&
        item.visitorcontactnumber === vendor.visitorcontactnumber &&
        item.prefix === vendor.prefix &&
        item.visitorname?.trim()?.toLowerCase() === vendor.visitorname?.trim()?.toLowerCase() &&
        item.intime === vendor.intime &&
        item.outtime === vendor.outtime &&
        (!vendor.escortinformation || item.escortdetails == vendor.escortdetails)
    );

    if (checkContactEmailForpopup) {
      // setCheckContactEmailMessage('Update Contact Number & Email..?');
      setCheckContactEmailMessage(`Update Contact Number & Email?\nContact Number: ${vendor?.visitorcontactnumber || '-'}\nEmail: ${vendor?.visitoremail || '-'}`);

      handleClickOpenCheckContact();
    } else if (DuplicateTodoValu) {
      setPopupContentMalert('Already Added ! Please Enter Another Material');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (refImage?.length === 0 && refImageDrag?.length === 0 && capturedImages?.length === 0) {
      setPopupContentMalert('Please Upload Photograph');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.company === 'Please Select Company') {
      setPopupContentMalert('Please Select Company');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.branch === 'Please Select Branch') {
      setPopupContentMalert('Please Select Branch');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.unit === 'Please Select Unit') {
      setPopupContentMalert('Please Select Unit');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.visitortype === 'Please Select Visitor Type') {
      setPopupContentMalert('Please Select Visitor Type');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.visitormode === 'Please Select Visitor Mode') {
      setPopupContentMalert('Please Select Visitor Mode');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.source === '') {
      setPopupContentMalert('Please Select Source');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.date === '') {
      setPopupContentMalert('Please Select Date');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.prefix === '') {
      setPopupContentMalert('Please Select Prefix');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.visitorname === '') {
      setPopupContentMalert('Please Enter Visitor Name');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.intime === '') {
      setPopupContentMalert('Please Select IN Time');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.visitorpurpose === 'Please Select Visitor Purpose') {
      setPopupContentMalert('Please Select Visitor Purpose');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.visitorcontactnumber === '' || vendor.visitorcontactnumber === undefined) {
      setPopupContentMalert('Please Enter Visitor Contact Number');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.visitoremail === '') {
      setPopupContentMalert('Please Enter Visitor Email');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.visitorcontactnumber?.length < 10) {
      setPopupContentMalert('Please Enter Valid Visitor Contact Number');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.visitoremail !== '' && !validateEmail(vendor.visitoremail)) {
      setPopupContentMalert('Please Enter Valid Visitor Email');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.documenttype === '' || vendor.documenttype === 'Please Select Document Type' || !vendor.documenttype) {
      setPopupContentMalert('Please Select Document Type');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.documentnumber === '' || !vendor.documentnumber) {
      setPopupContentMalert('Please Enter Document Number');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (uploadBills?.length === 0 && billUploadedFiles?.length === 0) {
      setPopupContentMalert('Please Upload Document');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (visitorsTypeOption?.filter((item) => item?.interactorstype === vendor.visitortype && item?.interactorspurpose?.includes(vendor.visitorpurpose))[0]?.requestdocument && vendor.requestvisitorfollowupdate === '') {
      setPopupContentMalert('Please Select Request Visitor Followup Date');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (visitorsTypeOption?.filter((item) => item?.interactorstype === vendor.visitortype && item?.interactorspurpose?.includes(vendor.visitorpurpose))[0]?.requestdocument && vendor.requestvisitorfollowaction === 'Please Select Request Follow Up Action') {
      setPopupContentMalert('Please Select Request Follow Up Action');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (visitorsTypeOption?.filter((item) => item?.interactorstype === vendor.visitortype && item?.interactorspurpose?.includes(vendor.visitorpurpose))[0]?.requestdocument && vendor.requestvisitorfollowaction === 'Required' && vendor.requestfollowupactionupdate === '') {
      setPopupContentMalert('Please Select Request Follow Up Date');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (visitorsTypeOption?.filter((item) => item?.interactorstype === vendor.visitortype && item?.interactorspurpose?.includes(vendor.visitorpurpose))[0]?.requestdocument && vendor.requestvisitorfollowaction === 'Required' && vendor.requestfollowupactionuptime === '') {
      setPopupContentMalert('Please Select Request Follow Up Time');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.escortinformation === true && vendor.escortdetails === '') {
      setPopupContentMalert('Please Enter Escort Details');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.materialcarryinginfo === true && subCategoryTodo?.length === 0) {
      setPopupContentMalert('Please Add Material Name');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (vendor.materialcarryinginfo === true && subcategory !== '') {
      setPopupContentMalert('Please Add Material Name');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (!visitorsTypeOption?.filter((item) => item?.interactorstype === vendor.visitortype && item?.interactorspurpose?.includes(vendor.visitorpurpose))[0]?.requestdocument && vendor.followupaction === 'Required' && vendor.followupdate === '') {
      setPopupContentMalert('Please Select Follow Up Date');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (!visitorsTypeOption?.filter((item) => item?.interactorstype === vendor.visitortype && item?.interactorspurpose?.includes(vendor.visitorpurpose))[0]?.requestdocument && vendor.followupaction === 'Required' && vendor.followuptime === '') {
      setPopupContentMalert('Please Select Follow Up Time');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert('Visitor Details already Exist!');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      setButtonName(type);
      let check = visitorsTypeOption?.filter((item) => item?.interactorstype === vendor.visitortype && item?.interactorspurpose?.includes(vendor.visitorpurpose))[0]?.requestdocument || false;
      if (check && vendor?.raiseticket) {
        handleOpenTicket();
      } else {
        sendRequest(type);
      }
    }
  };
  const handleClear = (e) => {
    e.preventDefault();
    const country = Country.getAllCountries().find((country) => country.name === 'India');
    const state = State.getStatesOfCountry(country?.isoCode).find((state) => state.name === 'Tamil Nadu');
    const city = City.getCitiesOfState(state?.countryCode, state?.isoCode).find((city) => city.name === 'Tiruchirappalli');
    setVendor({
      company: 'Please Select Company',
      branch: 'Please Select Branch',
      unit: 'Please Select Unit',
      visitortype: 'Please Select Visitor Type',
      visitormode: 'Please Select Visitor Mode',
      source: '',
      date: moment(serverTime).format('YYYY-MM-DD'),
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
      raiseticket: false,
      addesstype: 'Home',
      personalprefix: '',
      referencename: '',
      landmarkpositionprefix: '',
      landmarkname: '',
      houseflatnumber: '',
      streetroadname: '',
      localityareaname: '',
         pbuildingapartmentname:"",
paddressone:"",
paddresstwo:"",
paddressthree:"",
caddressone:"",
caddresstwo:"",
caddressthree:"",
cbuildingapartmentname:"",
      pcountry: country?.name,
      pstate: state?.name,
      pcity: city?.name,
      ppincode: '',
      gpscoordinate: '',

      caddesstype: '',
      cpersonalprefix: '',
      creferencename: '',
      clandmarkpositionprefix: '',
      clandmarkname: '',
      chouseflatnumber: '',
      cstreetroadname: '',
      clocalityareaname: '',
      ccountry: country?.name,
      cstate: state?.name,
      ccity: city?.name,
      cpincode: '',
      cgpscoordinate: '',
      samesprmnt: false,

      pgenerateviapincode: true,
      pvillageorcity: '',
      pdistrict: '',
      cgenerateviapincode: true,
      cvillageorcity: '',
      cdistrict: '',
    });
    setSelectedCountryp(country);
    setSelectedStatep(state);
    setSelectedCityp(city);
    //current Address
    setSelectedCountryc(country);
    setSelectedStatec(state);
    setSelectedCityc(city);

    setVisitorCheckName('');
    setVisitorCheck('Please Select');
    setSelectedOptionsCompany([]);
    setValueCompanyCat([]);
    setValueBranchCat([]);
    setSelectedOptionsBranch([]);
    setValueUnitCat([]);
    setSelectedOptionsUnit([]);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
    setValueDepartmentCat([]);
    setSelectedOptionsDepartment([]);

    setValueCompanyLocationCat([]);
    setSelectedOptionsCompanyLocation([]);
    setValueBranchLocationCat([]);
    setSelectedOptionsBranchLocation([]);
    setValueUnitLocationCat([]);
    setSelectedOptionsUnitLocation([]);
    setValueFloorLocationCat([]);
    setSelectedOptionsFloorLocation([]);
    setUploadBills([]);

    setUploadPopupOpen(false);
    setGetImg('');
    setRefImage([]);
    setPreviewURL(null);
    setRefImageDrag([]);
    setCapturedImages([]);
    setPopupContent('Cleared Successfully');
    setPopupSeverity('success');
    handleClickOpenPopup();
  };

  //get all  vendordetails.
  const fetchVendor = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.post(
        SERVICE.ALL_VISITORINFORMATIONS,
        {
          assignbranch: accessbranch,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );

      setVendorArray(res_vendor?.data?.visitors);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchLastindexVendorr = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.get(SERVICE.LASTINDEX_VISITORINFORMATIONS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let refNo = res_vendor?.data?.visitor?.visitorid;
      let codenum = refNo?.split('#');
      let prefixLength = Number(codenum[1]) + 1;
      let prefixString = String(prefixLength);
      let postfixLength =
        prefixString?.length == 1
          ? `000${prefixString}`
          : prefixString?.length == 2
          ? `00${prefixString}`
          : prefixString?.length == 3
          ? `0${prefixString}`
          : prefixString?.length == 4
          ? `0${prefixString}`
          : prefixString?.length == 5
          ? `0${prefixString}`
          : prefixString?.length == 6
          ? `0${prefixString}`
          : prefixString?.length == 7
          ? `0${prefixString}`
          : prefixString?.length == 8
          ? `0${prefixString}`
          : prefixString?.length == 9
          ? `0${prefixString}`
          : prefixString?.length == 10
          ? `0${prefixString}`
          : prefixString;

      let newval = 'VISIT#' + postfixLength;
      setVisitorCode(newval);

      return newval;
    } catch (err) {
      if (err?.response?.data?.message === 'Data not found!') {
      } else {
        handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
      }
    }
  };

  const fetchLastindexVendor = async () => {
    try {
      let res_vendor = await axios.get(SERVICE.LASTINDEX_VISITORINFORMATIONS);
      console.log(res_vendor?.data?.visitor, 'res_vendor?.data?.visitor');
      if (res_vendor?.data?.visitor && Object.keys(res_vendor.data.visitor).length !== 0) {
        let refNo = res_vendor?.data?.visitor?.visitorid;
        let codenum = refNo.split('#');
        console.log(codenum, 'codenum');
        let prefixLength = Number(codenum[1]) + 1;
        let prefixString = String(prefixLength);
        let postfixLength =
          prefixString.length == 1
            ? `000${prefixString}`
            : prefixString.length == 2
            ? `00${prefixString}`
            : prefixString.length == 3
            ? `0${prefixString}`
            : prefixString.length == 4
            ? `0${prefixString}`
            : prefixString.length == 5
            ? `0${prefixString}`
            : prefixString.length == 6
            ? `0${prefixString}`
            : prefixString.length == 7
            ? `0${prefixString}`
            : prefixString.length == 8
            ? `0${prefixString}`
            : prefixString.length == 9
            ? `0${prefixString}`
            : prefixString.length == 10
            ? `0${prefixString}`
            : prefixString;
        let newval = 'VISITIN#' + postfixLength;
        return newval;
      } else {
        let newval = 'VISITIN#0001';
        return newval;
      }
    } catch (err) {
      if (err?.response?.data?.message === 'Data not found!') {
      } else {
        const messages = err?.response?.data?.message;
        if (messages) {
          setShowAlert(
            <>
              {' '}
              <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} /> <p style={{ fontSize: '20px', fontWeight: 900 }}>{messages}</p>{' '}
            </>
          );
          handleClickOpenerr();
        }
      }
    }
  };

  const [TextEditor, setTextEditor] = useState('');
  const [textAreas, setTextAreas] = useState([]);

  const handleInputChangedocument = (event) => {
    const selectedFiles = Array.from(event.target.files); // Convert FileList to Array
    if (!selectedFiles?.length) return;

    let largeFiles = []; // To store names of files larger than 1MB

    // Filter files that are <= 1MB (1,024,000 bytes)
    const filteredFiles = selectedFiles?.filter((file) => {
      if (file.size > 1024000) {
        largeFiles.push(file.name); // Collect large file names
        return false;
      }
      return true;
    });

    // If there are large files, show a single popup message
    if (largeFiles?.length > 0) {
      setPopupContentMalert(`The following files are larger than 1MB and will not be uploaded:\n${largeFiles.join(', ')}`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }

    if (filteredFiles?.length === 0) return; // If no valid files, exit

    if (billUploadedFiles?.length > 0) {
      setBillUploadedFiles([]);
      setUploadBills([{ file: filteredFiles[0] }]);
    } else {
      // Accept only one file, replacing any existing file
      setUploadBills([{ file: filteredFiles[0] }]);
    }
  };

  const handleAutoSelect = async () => {
    setPageName(!pageName);
    try {
      let time = await getCurrentServerTime();
      let selectedValues = accessbranch
        ?.map((data) => ({
          company: data.company,
          branch: data.branch,
          unit: data.unit,
        }))
        ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit));

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

      setValueCompanyLocationCat(selectedCompany);
      setSelectedOptionsCompanyLocation(mappedCompany);

      let selectedBranch = selectedValues
        ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch))
        .map((a, index) => {
          return a.branch;
        });

      let mappedBranch = selectedValues
        ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch))
        ?.map((data) => ({
          label: data?.branch,
          value: data?.branch,
        }));

      setValueBranchCat(selectedBranch);
      setSelectedOptionsBranch(mappedBranch);

      setValueBranchLocationCat(selectedBranch);
      setSelectedOptionsBranchLocation(mappedBranch);

      let selectedUnit = selectedValues
        ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit))
        .map((a, index) => {
          return a.unit;
        });

      let mappedUnit = selectedValues
        ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit))
        ?.map((data) => ({
          label: data?.unit,
          value: data?.unit,
        }));

      setValueUnitCat(selectedUnit);
      setSelectedOptionsUnit(mappedUnit);
      setVendor({
        ...vendor,
        company: selectedCompany[0],
        branch: selectedBranch[0],
        unit: selectedUnit[0],
        intime: getCurrentTime24Hour(time),
        date: moment(time).format('YYYY-MM-DD'),
      });

      setValueUnitLocationCat(selectedUnit);
      setSelectedOptionsUnitLocation(mappedUnit);

      // let mappedTeam = allTeam
      //     ?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit))
      //     .map((u) => ({
      //         label: u.teamname,
      //         value: u.teamname,
      //     }));

      // let selectedTeam = allTeam?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit)).map((u) => u.teamname);

      // setValueTeamCat(selectedTeam);
      // setSelectedOptionsTeam(mappedTeam);

      // setSelectedOptionsDepartment(
      //     alldepartment?.map((data) => ({
      //         label: data.deptname,
      //         value: data.deptname,
      //     }))
      // );

      // setValueDepartmentCat(
      //     alldepartment.map((a, index) => {
      //         return a.deptname;
      //     })
      // );

      // setSelectedOptionsFloorLocation(
      //     allfloor
      //         ?.filter((u) => selectedBranch?.includes(u.branch))
      //         .map((u) => ({
      //             ...u,
      //             label: u.name,
      //             value: u.name,
      //         }))
      // );
      // const floorval = allfloor?.map((a, index) => {
      //     return a.name;
      // });
      // setValueFloorLocationCat(floorval);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    handleAutoSelect();
  }, [isAssignBranch]);

  const checkVisitors = [
    { label: 'Existing Visitor', value: 'Existing Visitor' },
    { label: 'New Visitor', value: 'New Visitor' },
  ];

  const handlesubmitexistingvisitorClose = (e) => {
    e.preventDefault();
    setVisitorCheckName('');
    setVisitorCheck('Please Select');
  };

  const handlesubmitexistingvisitorCheck = (e) => {
    e.preventDefault();
    if (visitorCheckName === '') {
      setPopupContentMalert('Please Enter Visitor Name');
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    } else {
      handleExistingVisitorSearch();
    }
  };

  // Edit model
  const [isEditOpen, setIsEditOpen] = useState(false);
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };

  const [pervData, setPervData] = useState([]);
  const [newimage, setNewimage] = useState([]);
  const [newimageNew, setNewimageNew] = useState([]);
  const [refImagePerImage, setRefImagePerImage] = useState([]);

  // console.log(newimage, 'newimage');
  const handleCloseModEdit = async (e, reason) => {
    if (reason && reason === 'backdropClick') return;

    setRefImage(newimage);
    setRefImagePerImage(e?.files);
    setIsEditOpen(false);
    setPervData(e);
    setVisitorCheck('Existing Visitor');
    setVendor({
      ...e,
      company: e?.company,
      branch: e?.branch,
      unit: e?.unit,
      visitortype: e?.visitortype,
      visitormode: e?.visitormode,
      date: moment(serverTime).format('YYYY-MM-DD'),
      prefix: e?.prefix,
      source: e?.source || '',
      visitorname: e?.visitorname,
      intime: getCurrentTime24Hour(serverTime),
      visitorpurpose: e?.visitorpurpose,
      visitorcontactnumber: e?.visitorcontactnumber,
      visitoremail: e?.visitoremail,
      visitorcompnayname: e?.visitorcompnayname,

      documenttype: e?.documenttype,
      documentnumber: e?.documentnumber,
      meetingdetails: e?.meetingdetails,
      meetingpersonemployeename: e?.meetingpersonemployeename,
      meetinglocationarea: e?.meetinglocationarea,
      escortinformation: e?.escortinformation,
      escortdetails: e?.escortdetails,
      equipmentborrowed: e?.equipmentborrowed,
      outtime: '',
      remark: e?.remark,
      followupaction: e?.followupaction,
      followupdate: '',
      followuptime: '',
      visitorbadge: e?.visitorbadge,
      visitorsurvey: e?.visitorsurvey,
      uploadedimage: null,

      //newvalues
      //newvalues
      addesstype: e?.addesstype || 'Home',
      personalprefix: e?.personalprefix || '',
      referencename: e?.referencename || '',
      landmarkpositionprefix: e?.landmarkpositionprefix || '',
      landmarkname: e?.landmarkname || '',
      houseflatnumber: e?.houseflatnumber || '',
      streetroadname: e?.streetroadname || '',
      localityareaname: e?.localityareaname || '',
          pbuildingapartmentname: e?.pbuildingapartmentname || "",
paddressone: e?.paddressone || "",
paddresstwo: e?.paddresstwo || "",
paddressthree: e?.paddressthree || "",
caddressone: e?.caddressone || "",
caddresstwo: e?.caddresstwo || "",
caddressthree: e?.caddressthree || "",
cbuildingapartmentname: e?.cbuildingapartmentname || "",
      pcountry: e?.pcountry || selectedCountryp?.name,
      pstate: e?.pstate || selectedStatep?.name,
      pcity: e?.pcity || selectedCityp?.name,
      ppincode: e?.ppincode || '',
      gpscoordinate: e?.gpscoordinate || '',
      samesprmnt: e?.samesprmnt || false,

      caddesstype: e?.caddesstype || 'Home',
      cpersonalprefix: e?.cpersonalprefix || '',
      creferencename: e?.creferencename || '',
      clandmarkpositionprefix: e?.clandmarkpositionprefix || '',
      clandmarkname: e?.clandmarkname || '',
      chouseflatnumber: e?.chouseflatnumber || '',
      cstreetroadname: e?.cstreetroadname || '',
      clocalityareaname: e?.clocalityareaname || '',
      ccountry: e?.ccountry || selectedCountryc?.name,
      cstate: e?.cstate || selectedStatec?.name,
      ccity: e?.ccity || selectedCityc?.name,
      cpincode: e?.cpincode || '',
      cgpscoordinate: e?.cgpscoordinate || '',

      pgenerateviapincode: Boolean(e?.pgenerateviapincode || false),
      pvillageorcity: String(e?.pvillageorcity || ''),
      pdistrict: String(e?.pdistrict || ''),
      cgenerateviapincode: !e.samesprmnt ? Boolean(e?.cgenerateviapincode || false) : Boolean(e?.pgenerateviapincode || false),
      cvillageorcity: !e.samesprmnt ? String(e?.cvillageorcity || '') : String(e?.pvillageorcity || ''),
      cdistrict: !e.samesprmnt ? String(e?.cdistrict || '') : String(e?.pdistrict || ''),
    });
    if (e?.pgenerateviapincode && e?.ppincode !== '' && e?.pcountry === 'India') {
      const result = await getPincodeDetails(e?.ppincode);
      if (result?.status === 'Success' && result?.data?.length > 0) {
        setFromPinCodep(result?.data);
      } else {
        setFromPinCodep([]);
      }
    }
    if (e?.cgenerateviapincode && e?.cpincode !== '' && e?.ccountry === 'India') {
      const result = await getPincodeDetails(e?.cpincode);
      if (result?.status === 'Success' && result?.data?.length > 0) {
        setFromPinCodec(result?.data);
      } else {
        setFromPinCodec([]);
      }
    }

    setVisitorCheckName(e?.visitorname);
    setdocumentFiles(e?.document || []);
    let multerUploadedFiles = e?.visitordocument?.filter((data) => !data.preview);
    setBillUploadedFiles(multerUploadedFiles);
    fetchInteractorPurpose(e?.visitortype);
    let selectedValues = accessbranch
      ?.map((data) => ({
        company: data.company,
        branch: data.branch,
        unit: data.unit,
      }))
      ?.filter((t) => e.meetingpersoncompany?.includes(t.company) && e.meetingpersonbranch?.includes(t.branch) && e.meetingpersonunit?.includes(t.unit));

    let selectedValueslocation = accessbranch
      ?.map((data) => ({
        company: data.company,
        branch: data.branch,
        unit: data.unit,
      }))
      ?.filter((t) => e.meetinglocationcompany?.includes(t.company) && e.meetinglocationbranch?.includes(t.branch) && e.meetinglocationunit?.includes(t.unit));

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

    let selectedCompanylocation = selectedValueslocation
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company))
      .map((a, index) => {
        return a.company;
      });

    let mappedCompanylocation = selectedValueslocation
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company))
      ?.map((data) => ({
        label: data?.company,
        value: data?.company,
      }));

    setValueCompanyCat(selectedCompany);
    setSelectedOptionsCompany(mappedCompany);

    setValueCompanyLocationCat(selectedCompanylocation);
    setSelectedOptionsCompanyLocation(mappedCompanylocation);

    let selectedBranch = selectedValues
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch))
      .map((a, index) => {
        return a.branch;
      });

    let mappedBranch = selectedValues
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch))
      ?.map((data) => ({
        label: data?.branch,
        value: data?.branch,
      }));

    let selectedBranchlocation = selectedValueslocation
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch))
      .map((a, index) => {
        return a.branch;
      });

    let mappedBranchLocation = selectedValueslocation
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch))
      ?.map((data) => ({
        label: data?.branch,
        value: data?.branch,
      }));

    setValueBranchCat(selectedBranch);
    setSelectedOptionsBranch(mappedBranch);

    setValueBranchLocationCat(selectedBranchlocation);
    setSelectedOptionsBranchLocation(mappedBranchLocation);

    let selectedUnit = selectedValues
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit))
      .map((a, index) => {
        return a.unit;
      });

    let mappedUnit = selectedValues
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit))
      ?.map((data) => ({
        label: data?.unit,
        value: data?.unit,
      }));

    let selectedUnitlocation = selectedValueslocation
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit))
      .map((a, index) => {
        return a.unit;
      });

    let mappedUnitlocation = selectedValueslocation
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit))
      ?.map((data) => ({
        label: data?.unit,
        value: data?.unit,
      }));

    setValueUnitCat(selectedUnit);
    setSelectedOptionsUnit(mappedUnit);

    setValueUnitLocationCat(selectedUnitlocation);
    setSelectedOptionsUnitLocation(mappedUnitlocation);

    let mappedTeam = allTeam
      ?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit))
      .map((u) => ({
        label: u.teamname,
        value: u.teamname,
      }));

    let selectedTeam = allTeam?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit)).map((u) => u.teamname);

    setValueTeamCat(selectedTeam);
    setSelectedOptionsTeam(mappedTeam);

    setSelectedOptionsDepartment(
      alldepartment
        ?.filter((t) => e?.meetingpersondepartment?.includes(t?.deptname))
        ?.map((data) => ({
          label: data.deptname,
          value: data.deptname,
        }))
    );

    setValueDepartmentCat(
      alldepartment
        ?.filter((t) => e?.meetingpersondepartment?.includes(t?.deptname))
        ?.map((a, index) => {
          return a.deptname;
        })
    );

    setSelectedOptionsFloorLocation(
      allfloor
        ?.filter((u) => selectedBranchlocation?.includes(u.branch))
        .map((u) => ({
          ...u,
          label: u.name,
          value: u.name,
        }))
    );
    const floorval = allfloor?.map((a, index) => {
      return a.name;
    });
    setValueFloorLocationCat(floorval);
    handleUploadPopupClose();
    handleCloseerrpop();
    handleCloseerrpopdragdrop();
    webcamClose();
    setCheckContactEmailForpopup(true);

    setTimeout(() => {
      setNewimage('');
    }, 1000);
  };

  const handleCloseModEditProfileCheck = async (e, reason) => {
    setIsExistVisitor(true);
    // setImage([]);
    if (reason && reason === 'backdropClick') return;
    // setRefImage(e?.files || e?.uploadedimage?.some((item) => item?.preview === '') ? [] : e?.uploadedimage || newimage || []);
    // setRefImage(e?.uploadedimage?.some((item)=> item?.preview === "") ? [] : e?.uploadedimage)
    // setRefImage(newimage)
    let url = `${SERVICE.VISITORDETAILS_LOG_SINGLE_PROFILE}/${encodeURIComponent(e?.visitorid)}`;
    let resVisitor = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });

    const file = resVisitor?.data?.svisitordetailslog?.slice(-1)[0]?.files || [];
    if (file?.length > 0) {
      // Create a Blob from the binary data
      const base64Data = file[0].preview?.split(',')[1]; // Get base64 data (without the prefix)
      const binaryData = atob(base64Data); // Decode base64 data
      const arrayBuffer = new ArrayBuffer(binaryData?.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryData?.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }
      const blob = new Blob([uint8Array], { type: 'image/png' });
      // setImage((prev) => [...prev, blob]);
      setRefImage(newimageNew);
    } else {
      const prof = e?.files || e?.uploadedimage?.some((item) => item?.preview === '') ? [] : e?.uploadedimage || newimage || [];

      // Check if prof[0].preview exists and is a Blob URL
      if (prof[0]?.preview && prof[0].preview.startsWith('blob:')) {
        // Fetch the Blob data from the URL
        fetch(prof[0].preview)
          .then((response) => response.blob()) // Convert the response to a Blob
          .then((blob) => {
            // Optionally, convert the Blob to a File object
            const file = new File([blob], 'file.png', { type: blob?.type });

            // Update the state with the new File or Blob
            // setImage((prev) => [...prev, file]); // or use `blob` if you don't need a File object
          })
          .catch((error) => {
            console.error('Error fetching Blob data:', error);
          });
      } else {
        console.error('Invalid or missing preview URL');
      }
      setRefImage(newimageNew);
    }
    setRefImagePerImage(e?.files);
    setIsEditOpen(false);
    setPervData(e);
    setVisitorCheck('Existing Visitor');
    setVisitorCheckName(e?.visitorname || e?.fullname || e?.companyname);
    setVendor({
      ...e,
      company: e?.company || 'Please Select Company',
      branch: e?.branch || 'Please Select Branch',
      unit: e?.unit || 'Please Select Unit',
      visitortype: e?.visitortype || 'Please Select Visitor Type',
      visitormode: e?.visitormode || 'Please Select Visitor Mode',
      source: e?.source || '',
      date: moment(serverTime).format('YYYY-MM-DD'),
      prefix: e?.prefix || 'Mr',
      visitordocument: e?.visitordocument || [],
      visitorname: e?.visitorname || e?.fullname || e?.companyname,
      intime: getCurrentTime24Hour(serverTime),
      visitorpurpose: e?.visitorpurpose || 'Please Select Visitor Purpose',
      visitorcontactnumber: e?.visitorcontactnumber || e?.mobile,
      visitoremail: e?.visitoremail || e.email,
      visitorcompnayname: e?.visitorcompnayname === 'undefined' ? '' : e?.visitorcompnayname || '',
      documenttype: e?.documenttype || 'Please Select Document Type',
      // requestvisitorfollowaction: 'Please Select Request Follow Up Action',
      requestvisitorfollowaction: 'Required',
      documentnumber: e?.documentnumber === 'undefined' ? '' : e?.documentnumber || '',
      meetingdetails: e?.meetingdetails,
      meetingpersonemployeename: e?.meetingpersonemployeename || 'Please Select Employee Name',
      meetinglocationarea: e?.meetinglocationarea || 'Please Select Area',
      escortinformation: e?.escortinformation,
      escortdetails: e?.escortdetails,
      equipmentborrowed: e?.equipmentborrowed === 'undefined' ? '' : e?.equipmentborrowed || '',
      outtime: '',
      remark: e?.remark === 'undefined' ? '' : e?.remark || '',
      followupaction: e?.followupaction || 'Please Select Follow Up Action',
      followupdate: '',
      followuptime: '',
      visitorbadge: e?.visitorbadge === 'undefined' ? '' : e?.visitorbadge || '',
      visitorsurvey: e?.visitorsurvey === 'undefined' ? '' : e?.visitorsurvey || '',
      uploadedimage: null,

      //newvalues
      //newvalues
      addesstype: e?.addesstype || 'Home',
      personalprefix: e?.personalprefix || '',
      referencename: e?.referencename || '',
      landmarkpositionprefix: e?.landmarkpositionprefix || '',
      landmarkname: e?.landmarkname || '',
      houseflatnumber: e?.houseflatnumber || '',
      streetroadname: e?.streetroadname || '',
      localityareaname: e?.localityareaname || '',
          pbuildingapartmentname: e?.pbuildingapartmentname || "",
paddressone: e?.paddressone || "",
paddresstwo: e?.paddresstwo || "",
paddressthree: e?.paddressthree || "",
caddressone: e?.caddressone || "",
caddresstwo: e?.caddresstwo || "",
caddressthree: e?.caddressthree || "",
cbuildingapartmentname: e?.cbuildingapartmentname || "",
      pcountry: e?.pcountry || selectedCountryp?.name,
      pstate: e?.pstate || selectedStatep?.name,
      pcity: e?.pcity || selectedCityp?.name,
      ppincode: e?.ppincode || '',
      gpscoordinate: e?.gpscoordinate || '',
      samesprmnt: e?.samesprmnt || false,

      caddesstype: e?.caddesstype || 'Home',
      cpersonalprefix: e?.cpersonalprefix || '',
      creferencename: e?.creferencename || '',
      clandmarkpositionprefix: e?.clandmarkpositionprefix || '',
      clandmarkname: e?.clandmarkname || '',
      chouseflatnumber: e?.chouseflatnumber || '',
      cstreetroadname: e?.cstreetroadname || '',
      clocalityareaname: e?.clocalityareaname || '',
      ccountry: e?.ccountry || selectedCountryc?.name,
      cstate: e?.cstate || selectedStatec?.name,
      ccity: e?.ccity || selectedCityc?.name,
      cpincode: e?.cpincode || '',
      cgpscoordinate: e?.cgpscoordinate || '',

      pgenerateviapincode: Boolean(e?.pgenerateviapincode || false),
      pvillageorcity: String(e?.pvillageorcity || ''),
      pdistrict: String(e?.pdistrict || ''),
      cgenerateviapincode: !e.samesprmnt ? Boolean(e?.cgenerateviapincode || false) : Boolean(e?.pgenerateviapincode || false),
      cvillageorcity: !e.samesprmnt ? String(e?.cvillageorcity || '') : String(e?.pvillageorcity || ''),
      cdistrict: !e.samesprmnt ? String(e?.cdistrict || '') : String(e?.pdistrict || ''),
    });
    if (e?.pgenerateviapincode && e?.ppincode !== '' && e?.pcountry === 'India') {
      const result = await getPincodeDetails(e?.ppincode);
      if (result?.status === 'Success' && result?.data?.length > 0) {
        setFromPinCodep(result?.data);
      } else {
        setFromPinCodep([]);
      }
    }
    if (e?.cgenerateviapincode && e?.cpincode !== '' && e?.ccountry === 'India') {
      const result = await getPincodeDetails(e?.cpincode);
      if (result?.status === 'Success' && result?.data?.length > 0) {
        setFromPinCodec(result?.data);
      } else {
        setFromPinCodec([]);
      }
    }

    setSelectedCountryp(Country.getAllCountries().find((country) => country.name === e?.pcountry));
    setSelectedStatep(State.getStatesOfCountry(Country.getAllCountries().find((country) => country.name === e?.pcountry)?.isoCode).find((state) => state.name === e?.pstate));
    setSelectedCityp(
      City.getCitiesOfState(
        State.getStatesOfCountry(Country.getAllCountries().find((country) => country.name === e?.pcountry)?.isoCode).find((state) => state.name === e?.pstate)?.countryCode,
        State.getStatesOfCountry(Country.getAllCountries().find((country) => country.name === e?.pcountry)?.isoCode).find((state) => state.name === e?.pstate)?.isoCode
      ).find((city) => city.name === e?.pcity)
    );

    setdocumentFiles(e?.document || []);
    if (uploadBills?.length > 0) {
      setUploadBills([]);
      let multerUploadedFiles = e?.visitordocument?.filter((data) => !data.preview);
      setBillUploadedFiles(multerUploadedFiles);
    } else {
      let multerUploadedFiles = e?.visitordocument?.filter((data) => !data.preview);
      setBillUploadedFiles(multerUploadedFiles);
    }

    fetchInteractorPurpose(e?.visitortype);
    let selectedValues = accessbranch
      ?.map((data) => ({
        company: data.company,
        branch: data.branch,
        unit: data.unit,
      }))
      ?.filter((t) => e.meetingpersoncompany?.includes(t.company) && e.meetingpersonbranch?.includes(t.branch) && e.meetingpersonunit?.includes(t.unit));

    let selectedValueslocation = accessbranch
      ?.map((data) => ({
        company: data.company,
        branch: data.branch,
        unit: data.unit,
      }))
      ?.filter((t) => e.meetinglocationcompany?.includes(t.company) && e.meetinglocationbranch?.includes(t.branch) && e.meetinglocationunit?.includes(t.unit));

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

    let selectedCompanylocation = selectedValueslocation
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company))
      .map((a, index) => {
        return a.company;
      });

    let mappedCompanylocation = selectedValueslocation
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company))
      ?.map((data) => ({
        label: data?.company,
        value: data?.company,
      }));

    setValueCompanyCat(selectedCompany);
    setSelectedOptionsCompany(mappedCompany);

    setValueCompanyLocationCat(selectedCompanylocation);
    setSelectedOptionsCompanyLocation(mappedCompanylocation);

    let selectedBranch = selectedValues
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch))
      .map((a, index) => {
        return a.branch;
      });

    let mappedBranch = selectedValues
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch))
      ?.map((data) => ({
        label: data?.branch,
        value: data?.branch,
      }));

    let selectedBranchlocation = selectedValueslocation
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch))
      .map((a, index) => {
        return a.branch;
      });

    let mappedBranchLocation = selectedValueslocation
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch))
      ?.map((data) => ({
        label: data?.branch,
        value: data?.branch,
      }));

    setValueBranchCat(selectedBranch);
    setSelectedOptionsBranch(mappedBranch);

    setValueBranchLocationCat(selectedBranchlocation);
    setSelectedOptionsBranchLocation(mappedBranchLocation);

    let selectedUnit = selectedValues
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit))
      .map((a, index) => {
        return a.unit;
      });

    let mappedUnit = selectedValues
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit))
      ?.map((data) => ({
        label: data?.unit,
        value: data?.unit,
      }));

    let selectedUnitlocation = selectedValueslocation
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit))
      .map((a, index) => {
        return a.unit;
      });

    let mappedUnitlocation = selectedValueslocation
      ?.filter((value, index, self) => index === self.findIndex((t) => t.company === value.company && t.branch === value.branch && t.unit === value.unit))
      ?.map((data) => ({
        label: data?.unit,
        value: data?.unit,
      }));

    setValueUnitCat(selectedUnit);
    setSelectedOptionsUnit(mappedUnit);

    setValueUnitLocationCat(selectedUnitlocation);
    setSelectedOptionsUnitLocation(mappedUnitlocation);

    let mappedTeam = allTeam
      ?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit))
      .map((u) => ({
        label: u.teamname,
        value: u.teamname,
      }));

    let selectedTeam = allTeam?.filter((u) => selectedCompany?.includes(u.company) && selectedBranch?.includes(u.branch) && selectedUnit?.includes(u.unit)).map((u) => u.teamname);

    setValueTeamCat(selectedTeam);
    setSelectedOptionsTeam(mappedTeam);

    setSelectedOptionsDepartment(
      alldepartment
        ?.filter((t) => e?.meetingpersondepartment?.includes(t?.deptname))
        ?.map((data) => ({
          label: data.deptname,
          value: data.deptname,
        }))
    );

    setValueDepartmentCat(
      alldepartment
        ?.filter((t) => e?.meetingpersondepartment?.includes(t?.deptname))
        ?.map((a, index) => {
          return a.deptname;
        })
    );

    setSelectedOptionsFloorLocation(
      allfloor
        ?.filter((u) => selectedBranchlocation?.includes(u.branch))
        .map((u) => ({
          ...u,
          label: u.name,
          value: u.name,
        }))
    );
    const floorval = allfloor?.map((a, index) => {
      return a.name;
    });
    setValueFloorLocationCat(floorval);
    // handleUploadPopupClose();
    handleCloseerrpop();
    handleCloseerrpopdragdrop();
    webcamClose();
    setCheckContactEmailForpopup(true);

    let res = await axios.get(`${SERVICE.VISITORDETAILS_LOG_SINGLE}/${encodeURIComponent(e?.visitorid)}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });

    setVisitorLogData(res?.data?.svisitordetailslog);

    setTimeout(() => {
      setNewimage('');
    }, 1000);
  };

  const handleCloseModEditBack = (e, reason) => {
    if (reason && reason === 'backdropClick') return;
    setIsEditOpen(false);
  };

  const [isGettingVisitorUserCandidate, setIsGettingVisitorUserCandidate] = useState(false);

  const handleExistingVisitorSearch = async () => {
    setPageName(!pageName);
    setIsGettingVisitorUserCandidate(true);
    try {
      let res_matchvisitor = await axios.post(
        SERVICE.CHECKEXISTING_VISITORINFORMATION,
        {
          visitornameexists: visitorCheckName,
          assignbranch: accessbranch,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );

      setExistingUser(res_matchvisitor?.data?.visitors);
      setIsGettingVisitorUserCandidate(false);
      handleClickOpenEdit();
    } catch (err) {
      setIsGettingVisitorUserCandidate(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const renderFilePreviewMulterUploaded = async (file) => {
    if (!file) return false;
    const imageUrl = `${SERVICE.VEIW_VISITORINFORMATION_FILES}/${file.filename}`;
    window.open(imageUrl, '_blank'); // Open image in a new tab
  };

  let sno = 1;

  // SELECT DROPDOWN STYLES
  const colourStyles = {
    menuList: (styles) => ({
      ...styles,
      background: 'white',
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      // color:'black',
      color: isFocused ? 'rgb(255 255 255, 0.5)' : isSelected ? 'white' : 'black',
      background: isFocused ? 'rgb(25 118 210, 0.7)' : isSelected ? 'rgb(25 118 210, 0.5)' : null,
      zIndex: 1,
    }),
    menu: (base) => ({
      ...base,
      zIndex: 100,
    }),
  };

  const [files, setFiles] = useState([]);
  const [fileNames, setfileNames] = useState('Please Select File Name');

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files); // Convert FileList to Array
    if (!selectedFiles?.length) return;

    let largeFiles = []; // To store names of files larger than 1MB

    // Filter files that are <= 1MB (1,024,000 bytes)
    const filteredFiles = selectedFiles?.filter((file) => {
      if (file.size > 1024000) {
        largeFiles.push(file.name); // Collect large file names
        return false;
      }
      return true;
    });

    // If there are large files, show a single popup message
    if (largeFiles?.length > 0) {
      setPopupContentMalert(`The following files are larger than 1MB and will not be uploaded:\n${largeFiles.join(', ')}`);
      setPopupSeverityMalert('info');
      handleClickOpenPopupMalert();
    }

    if (filteredFiles?.length === 0) return; // If no valid files, exit

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

  const addressTypeOptions = [
    { label: 'Home', value: 'Home' },
    { label: 'Office', value: 'Office' },
    { label: 'Permanent', value: 'Permanent' }, // Corrected from "Permanent"
    { label: 'Temporary', value: 'Temporary' }, // Corrected from "Temprory"
    { label: 'Hostel', value: 'Hostel' },
  ];

  const personalprefixOptions = [
    { label: 'C/O-Care Of', value: 'C/O-Care Of' },
    { label: 'S/O-Son Of', value: 'S/O-Son Of' },
    { label: 'D/O-Daughter Of', value: 'D/O-Daughter Of' }, // Corrected from "Permanent"
    { label: 'W/O-Wife Of', value: 'W/O-Wife Of' }, // Corrected from "Temprory"
  ];

  const landmarkpositionprefixOptions = [
    { label: 'Near', value: 'Near' },
    { label: 'Opposite', value: 'Opposite' },
    { label: 'Behind', value: 'Behind' }, // Corrected from "Permanent"
    { label: 'In Front Of', value: 'In Front Of' }, // Corrected from "Temprory"
    { label: 'Beside', value: 'Beside' },
    { label: 'Adjacent to', value: 'Adjacent to' },
  ];

  const handlechangeppincode = (e) => {
    const regex = /^[0-9]+$/;
    const inputValue = e.target.value?.slice(0, 6);
    if (regex.test(inputValue) || inputValue === '') {
      setVendor({ ...vendor, ppincode: inputValue });
    }
  };
  const [fromPinCodep, setFromPinCodep] = useState([]);
  const [fromPinCodec, setFromPinCodec] = useState([]);

  const handleLocationSuccessp = (postOffices) => {
    // You can now use postOffices[0].name, .state, .country, etc.
    setFromPinCodep(postOffices);
    setSelectedStatep({
      name: postOffices?.length > 0 ? postOffices[0]?.State : '',
      countryCode: '',
      isoCode: '',
    });
    setSelectedCityp('');
    setVendor((prevSupplier) => ({
      ...prevSupplier,
      pstate: postOffices?.length > 0 ? postOffices[0]?.State : '',
      pdistrict: postOffices?.length > 0 ? postOffices[0]?.District : '',
      pvillageorcity: '',
      pcity: '',
    }));
  };
  const handleLocationSuccessc = (postOffices) => {
    // You can now use postOffices[0].name, .state, .country, etc.
    setFromPinCodec(postOffices);
    setSelectedStatec({
      name: postOffices?.length > 0 ? postOffices[0]?.State : '',
      countryCode: '',
      isoCode: '',
    });
    setSelectedCityc('');
    setVendor((prevSupplier) => ({
      ...prevSupplier,
      cstate: postOffices?.length > 0 ? postOffices[0]?.State : '',
      cdistrict: postOffices?.length > 0 ? postOffices[0]?.District : '',
      cvillageorcity: '',
      ccity: '',
    }));
  };

  const handlechangecpincode = (e) => {
    const inputValue = e.target.value;

    // Only allow digits (0-9) and empty string, max 6 digits
    if (inputValue === '' || (/^\d+$/.test(inputValue) && inputValue?.length <= 6)) {
      setVendor({ ...vendor, cpincode: inputValue });
    }
  };

  return (
    <Box>
      <Headtitle title={'Visitor Information Master'} />
      {/* ****** Header Content ****** */}

      <PageHeading title="Visitor Information Master" modulename="Interactors" submodulename="Visitor" mainpagename="Visitor Information Master" subpagename="" subsubpagename="" />
      <>
        <Box sx={userStyle.dialogbox}>
          <>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                {' '}
                <Typography sx={{ fontWeight: 'bold' }}>Add Visitor Information Master</Typography>{' '}
              </Grid>
            </Grid>
            <br />
            <Grid container spacing={2}>
              <Grid item md={12} xs={12} sm={12} sx={{ display: 'flex' }}>
                <Grid item md={3} sm={12} xs={12}>
                  <Typography>
                    Photograph <b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'left' }}>
                    <Button sx={buttonStyles.buttonsubmit} onClick={handleClickUploadPopupOpen}>
                      Upload
                    </Button>
                  </Box>
                </Grid>
                <Grid item md={9} sm={12} xs={12}>
                  <Typography>&nbsp;</Typography>
                  {refImageDrag?.length > 0 && (
                    <>
                      {refImageDrag.map((file, index) => (
                        <>
                          <img
                            src={file.preview}
                            alt={file.name}
                            style={{
                              maxWidth: '70px',
                              maxHeight: '70px',
                              marginTop: '10px',
                            }}
                          />
                          <Button onClick={() => handleRemoveFile(index)} style={{ marginTop: '0px', color: 'red' }}>
                            X
                          </Button>
                        </>
                      ))}
                    </>
                  )}
                  {
                    // isWebcamCapture == true
                    capturedImages?.length > 0 &&
                      capturedImages?.map((image, index) => (
                        <Grid container key={index}>
                          <Typography>&nbsp;</Typography>

                          <Grid item md={2} sm={2} xs={12}>
                            <Box
                              style={{
                                isplay: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginLeft: '37px',
                              }}
                            >
                              <img src={image?.preview} alt={image?.name} height={50} style={{ maxWidth: '-webkit-fill-available' }} />
                            </Box>
                          </Grid>
                          <Grid
                            item
                            md={7}
                            sm={7}
                            xs={12}
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="subtitle2"> {image.name} </Typography>
                          </Grid>
                          <Grid item md={1} sm={1} xs={12}>
                            <Grid sx={{ display: 'flex' }}>
                              <Button
                                sx={{
                                  marginTop: '15px !important',
                                  padding: '14px 14px',
                                  minWidth: '40px !important',
                                  borderRadius: '50% !important',
                                  ':hover': {
                                    backgroundColor: '#80808036', // theme.palette.primary.main
                                  },
                                }}
                                onClick={() => renderFilePreview(image)}
                              >
                                <VisibilityOutlinedIcon
                                  style={{
                                    fontsize: '12px',
                                    color: '#357AE8',
                                    marginTop: '35px !important',
                                  }}
                                />
                              </Button>
                              <Button
                                sx={{
                                  marginTop: '15px !important',
                                  padding: '14px 14px',
                                  minWidth: '40px !important',
                                  borderRadius: '50% !important',
                                  ':hover': {
                                    backgroundColor: '#80808036',
                                  },
                                }}
                                onClick={() => removeCapturedImage(index)}
                              >
                                <FaTrash
                                  style={{
                                    color: '#a73131',
                                    fontSize: '12px',
                                    marginTop: '35px !important',
                                  }}
                                />
                              </Button>
                            </Grid>
                          </Grid>
                        </Grid>
                      ))
                  }
                  {refImage?.map((file, index) => (
                    <Grid container key={index}>
                      <Typography>&nbsp;</Typography>

                      <Grid item md={2} sm={2} xs={2}>
                        <Box
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          {file?.type?.includes('image/') ? (
                            <img
                              src={file.preview}
                              alt={file.name || ''}
                              height={50}
                              style={{
                                maxWidth: '-webkit-fill-available',
                              }}
                            />
                          ) : (
                            <img className={classes?.preview} src={getFileIcon(file?.name)} height="10" alt="file icon" />
                          )}
                        </Box>
                      </Grid>
                      <Grid
                        item
                        md={7}
                        sm={7}
                        xs={7}
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="subtitle2"> {file?.name === 'null' ? '' : file?.name || ''} </Typography>
                      </Grid>
                      <Grid item md={1} sm={1} xs={1}>
                        <Grid sx={{ display: 'flex' }}>
                          <Button
                            sx={{
                              padding: '14px 14px',
                              minWidth: '40px !important',
                              borderRadius: '50% !important',
                              ':hover': {
                                backgroundColor: '#80808036', // theme.palette.primary.main
                              },
                            }}
                            onClick={() => renderFilePreview(file)}
                          >
                            <VisibilityOutlinedIcon style={{ fontsize: '12px', color: '#357AE8' }} />
                          </Button>
                          <Button
                            sx={{
                              padding: '14px 14px',
                              minWidth: '40px !important',
                              borderRadius: '50% !important',
                              ':hover': {
                                backgroundColor: '#80808036', // theme.palette.primary.main
                              },
                            }}
                            onClick={() => handleDeleteFile(index)}
                          >
                            <FaTrash style={{ color: '#a73131', fontSize: '12px' }} />
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Company <b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    maxMenuHeight={300}
                    options={accessbranch
                      ?.map((data) => ({
                        label: data.company,
                        value: data.company,
                      }))
                      ?.filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                    placeholder="Please Select Company"
                    value={{
                      label: vendor.company,
                      value: vendor.company,
                    }}
                    onChange={(e) => {
                      setVendor({
                        ...vendor,
                        company: e.value,
                        branch: 'Please Select Branch',
                        unit: 'Please Select Unit',
                      });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Branch <b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    maxMenuHeight={300}
                    options={accessbranch
                      ?.filter((comp) => vendor.company === comp.company)
                      ?.map((data) => ({
                        label: data.branch,
                        value: data.branch,
                      }))
                      ?.filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                    placeholder="Please Select Branch"
                    value={{
                      label: vendor.branch,
                      value: vendor.branch,
                    }}
                    onChange={(e) => {
                      setVendor({
                        ...vendor,
                        branch: e.value,
                        unit: 'Please Select Unit',
                      });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Unit<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    maxMenuHeight={300}
                    options={accessbranch
                      ?.filter((comp) => vendor.company === comp.company && vendor.branch === comp.branch)
                      ?.map((data) => ({
                        label: data.unit,
                        value: data.unit,
                      }))
                      ?.filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                    placeholder="Please Select Unit"
                    value={{
                      label: vendor.unit,
                      value: vendor.unit,
                    }}
                    onChange={(e) => {
                      setVendor({
                        ...vendor,
                        unit: e.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>
              {/* 
                            <Grid item md={3} xs={12} sm={12}>
                                <FormControl fullWidth size="small">
                                    <Typography>
                                        Visitor's ID <b style={{ color: 'red' }}>*</b>{' '}
                                    </Typography>
                                    <OutlinedInput id="component-outlined" placeholder="Please Enter Visitor's ID" value={visitorCode} readOnly />
                                </FormControl>
                            </Grid> */}
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Visitor Type <b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    maxMenuHeight={300}
                    options={visitorsTypeOption?.filter((item, index, self) => {
                      return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                    })}
                    placeholder="Please Select Visitor Type"
                    value={{
                      label: vendor.visitortype,
                      value: vendor.visitortype,
                    }}
                    onChange={(e) => {
                      setVendor({
                        ...vendor,
                        visitortype: e.value,
                        requestdocument: e?.requestdocument || false,
                        visitorpurpose: 'Please Select Visitor Purpose',
                      });
                      fetchInteractorPurpose(e.value);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Visitor Mode <b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    maxMenuHeight={300}
                    options={visitorsModeOption?.filter((item, index, self) => {
                      return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                    })}
                    placeholder="Please Select Visitor Mode"
                    value={{
                      label: vendor.visitormode,
                      value: vendor.visitormode,
                    }}
                    onChange={(e) => {
                      setVendor({
                        ...vendor,
                        visitormode: e.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} sm={6} xs={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Source <b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    options={sourceVisitorOptions}
                    placeholder="Choose Source"
                    value={{
                      label: vendor.source !== '' ? vendor.source : 'Please Select Source',
                      value: vendor.source !== '' ? vendor.source : 'Please Select Source',
                    }}
                    onChange={(e) => {
                      setVendor({
                        ...vendor,
                        source: e.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={1.5} xs={2} sm={2}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Date<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="date"
                    value={vendor.date}
                    onChange={(e) => {
                      setVendor({ ...vendor, date: e.target.value });
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item md={1.5} sm={2} xs={2}>
                <FormControl size="small" fullWidth>
                  <Typography>
                    Prefix<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Select
                    labelId="demo-select-small"
                    id="demo-select-small"
                    placeholder="Mr."
                    value={vendor.prefix}
                    onChange={(e) => {
                      setVendor({ ...vendor, prefix: e.target.value });
                    }}
                  >
                    <MenuItem value="Mr">Mr</MenuItem>
                    <MenuItem value="Ms">Ms</MenuItem>
                    <MenuItem value="Mrs">Mrs</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Visitor Name <b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="text"
                    disabled={isExistVisitor}
                    value={vendor.visitorname}
                    placeholder="Please Enter Visitor Name"
                    onChange={(e) => {
                      setVendor({ ...vendor, visitorname: e.target.value });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    IN Time <b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="time"
                    placeholder="HH:MM:AM/PM"
                    value={vendor.intime}
                    onChange={(e) => {
                      setVendor({ ...vendor, intime: e.target.value });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Visitor Purpose <b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    maxMenuHeight={300}
                    options={visitorsPurposeOption}
                    placeholder="Please Select Visitor Purpose"
                    value={{
                      label: vendor.visitorpurpose,
                      value: vendor.visitorpurpose,
                    }}
                    onChange={(e) => {
                      const dueDays = visitorsTypeOption?.filter((item) => item?.interactorstype === vendor.visitortype && item?.interactorspurpose?.includes(e.value))[0]?.duedays || '';

                      if (dueDays !== '') {
                        // Calculate the follow-up date by adding dueDays to current date
                        const currentDate = new Date(serverTime);
                        const followUpDate = new Date(serverTime);
                        followUpDate.setDate(currentDate.getDate() + parseInt(dueDays));

                        // Format the date as YYYY-MM-DD (or your preferred format)
                        const formattedDate = followUpDate.toISOString().split('T')[0];

                        setVendor({
                          ...vendor,
                          requestvisitorfollowupdate: formattedDate,
                          visitorpurpose: e.value,
                          // requestvisitorfollowaction: 'Please Select Request Follow Up Action',
                          requestvisitorfollowaction: 'Required',
                          requestfollowupactionupdate: '',
                          requestfollowupactionuptime: '',
                        });
                      } else {
                        setVendor({
                          ...vendor,
                          visitorpurpose: e.value,
                          // requestvisitorfollowaction: 'Please Select Request Follow Up Action',
                          requestvisitorfollowaction: 'Required',
                          requestfollowupactionupdate: '',
                          requestfollowupactionuptime: '',
                        });
                      }

                      setUploadBillsRequestDocument([]);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Visitor Contact Number<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="number"
                    sx={userStyle.input}
                    value={vendor.visitorcontactnumber}
                    placeholder="Please Enter Visitor Contact Number"
                    onChange={(e) => {
                      setVendor({
                        ...vendor,
                        visitorcontactnumber: e.target.value,
                      });
                      handleMobile(e.target.value);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Visitor Email<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="email"
                    value={vendor.visitoremail}
                    placeholder="Please Enter Visitor Email"
                    onChange={(e) => {
                      setVendor({ ...vendor, visitoremail: e.target.value?.toLowerCase() });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>Visitor's Company Name</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="text"
                    value={vendor.visitorcompnayname}
                    placeholder="Please Enter Visitor's Company Name"
                    onChange={(e) => {
                      setVendor({
                        ...vendor,
                        visitorcompnayname: e.target.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item md={12} xs={12} sm={12}>
                <Typography sx={{ fontWeight: 'bold' }}>Visitor ID / Document Details</Typography>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Document Type<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <Selects
                    maxMenuHeight={300}
                    options={documentTypeOption}
                    placeholder="Please Select Document Type"
                    value={{
                      label: vendor.documenttype,
                      value: vendor.documenttype,
                    }}
                    onChange={(e) => {
                      setVendor({
                        ...vendor,
                        documenttype: e.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Document Number<b style={{ color: 'red' }}>*</b>
                  </Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="text"
                    value={vendor.documentnumber}
                    placeholder="Please Enter Document Number"
                    onChange={(e) => {
                      if (vendor.documenttype === 'Aadhar Card') {
                        const regex = /^[0-9]+$/; // Only allows positive integers
                        const inputValue = e.target.value?.slice(0, 12);
                        if (regex.test(inputValue) || inputValue === '') {
                          setVendor({
                            ...vendor,
                            documentnumber: inputValue,
                          });
                        }
                      } else if (vendor.documenttype === 'Pan Card') {
                        if (e.target.value?.length < 11) {
                          setVendor({
                            ...vendor,
                            documentnumber: e.target.value,
                          });
                        }
                      } else {
                        setVendor({
                          ...vendor,
                          documentnumber: e.target.value,
                        });
                      }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={6} sm={12} xs={12}>
                <Typography>
                  Upload Document<b style={{ color: 'red' }}>*</b>
                </Typography>
                <Grid>
                  <Grid item md={2} sm={12} xs={12}>
                    <Button size="small" component="label" sx={{ '@media only screen and (max-width:550px)': { marginY: '5px' }, ...buttonStyles?.buttonsubmit }}>
                      Upload
                      <input
                        type="file"
                        id="resume"
                        accept=".xlsx, .xls, .csv, .pdf, .txt,"
                        name="file"
                        hidden
                        onChange={(e) => {
                          handleInputChangedocument(e);
                          setTextEditor('');
                          setTextAreas([]);
                        }}
                      />
                    </Button>
                  </Grid>
                  <Typography>&nbsp;</Typography>
                  {uploadBills?.length > 0 &&
                    uploadBills?.map((data, index) => (
                      <>
                        <Grid container>
                          <Grid item md={2} sm={2} xs={2}>
                            <Box
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <img className={classes.preview} src={getFileIcon(data.name || data.file.name)} height="25" alt="file icon" />
                              {/* )} */}
                            </Box>
                          </Grid>
                          <Grid
                            item
                            md={8}
                            sm={8}
                            xs={8}
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="subtitle2">{data.name || data.file.name} </Typography>
                          </Grid>
                          <Grid item md={2} sm={2} xs={2}>
                            <Button
                              sx={{
                                padding: '14px 14px',
                                minWidth: '40px !important',
                                borderRadius: '50% !important',
                                ':hover': {
                                  backgroundColor: '#80808036', // theme.palette.primary.main
                                },
                              }}
                            >
                              <VisibilityOutlinedIcon
                                style={{
                                  fontsize: 'large',
                                  color: '#357AE8',
                                }}
                                onClick={() => renderFilePreviewMulter(data.file)}
                              />
                            </Button>

                            <Button
                              sx={{
                                padding: '14px 14px',
                                minWidth: '40px !important',
                                borderRadius: '50% !important',
                                ':hover': {
                                  backgroundColor: '#80808036', // theme.palette.primary.main
                                },
                              }}
                              onClick={() => handleDeleteFileDocumentEdit(index)}
                            >
                              <FaTrash
                                style={{
                                  fontSize: 'medium',
                                  color: '#a73131',
                                }}
                              />
                            </Button>
                          </Grid>
                        </Grid>
                      </>
                    ))}
                  {billUploadedFiles?.length > 0 &&
                    billUploadedFiles?.map((data, index) => (
                      <>
                        <Grid container>
                          <Grid item md={2} sm={2} xs={2}>
                            <Box
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <img className={classes.preview} src={getFileIcon(data.name || data.file.name)} height="25" alt="file icon" />
                              {/* )} */}
                            </Box>
                          </Grid>
                          <Grid
                            item
                            md={8}
                            sm={8}
                            xs={8}
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="subtitle2">{data.name || data.file.name} </Typography>
                          </Grid>
                          <Grid item md={2} sm={2} xs={2}>
                            <Button
                              sx={{
                                padding: '14px 14px',
                                minWidth: '40px !important',
                                borderRadius: '50% !important',
                                ':hover': {
                                  backgroundColor: '#80808036', // theme.palette.primary.main
                                },
                              }}
                            >
                              <VisibilityOutlinedIcon
                                style={{
                                  fontsize: 'large',
                                  color: '#357AE8',
                                }}
                                onClick={() => renderFilePreviewMulterUploaded(data)}
                              />
                            </Button>

                            <Button
                              sx={{
                                padding: '14px 14px',
                                minWidth: '40px !important',
                                borderRadius: '50% !important',
                                ':hover': {
                                  backgroundColor: '#80808036', // theme.palette.primary.main
                                },
                              }}
                              onClick={() => handleDeleteUploadedBills(index)}
                            >
                              <FaTrash
                                style={{
                                  fontSize: 'medium',
                                  color: '#a73131',
                                }}
                              />
                            </Button>
                          </Grid>
                        </Grid>
                      </>
                    ))}
                </Grid>
              </Grid>
              {visitorsTypeOption?.filter((item) => item?.interactorstype === vendor.visitortype && item?.interactorspurpose?.includes(vendor.visitorpurpose))[0]?.requestdocument && (
                <Grid item md={12} xs={12} sm={12}>
                  <Box>
                    <Grid item xs={8}>
                      <Typography sx={{ fontWeight: 'bold' }}>Request Visitor Document</Typography>
                    </Grid>
                    <>
                      <Grid container sx={{ justifyContent: 'center' }} spacing={1}>
                        &nbsp;
                        <Button variant="outlined" component="label">
                          <CloudUploadIcon sx={{ fontSize: '21px' }} /> &ensp;Upload Documents
                          <input hidden type="file" multiple onChange={handleFileUpload} />
                        </Button>
                      </Grid>
                    </>

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
                                        handleRemarkChange(index, event.target.value)
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
              )}
              {visitorsTypeOption?.filter((item) => item?.interactorstype === vendor.visitortype && item?.interactorspurpose?.includes(vendor.visitorpurpose))[0]?.requestdocument && (
                <>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Request Visitor Followup Date<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="date"
                        value={vendor.requestvisitorfollowupdate}
                        onChange={(e) => {
                          setVendor({ ...vendor, requestvisitorfollowupdate: e.target.value });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Request Follow Up Action <b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <Selects
                        maxMenuHeight={300}
                        options={followUpActionOption}
                        placeholder="Please Select Follow Up Action"
                        value={{
                          label: vendor.requestvisitorfollowaction,
                          value: vendor.requestvisitorfollowaction,
                        }}
                        // isDisabled={true}
                        onChange={(e) => {
                          setVendor({
                            ...vendor,
                            requestvisitorfollowaction: e.value,
                            raiseticket: false,
                            requestfollowupactionupdate: '',
                            requestfollowupactionuptime: '',
                          });
                        }}
                      />
                    </FormControl>
                    {vendor.requestvisitorfollowaction === 'Required' && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={vendor?.raiseticket}
                            onChange={(e) => {
                              setVendor((prevSupplier) => ({
                                ...prevSupplier,
                                raiseticket: e.target.checked,
                              }));
                            }}
                          />
                        }
                        label="Raise Ticket"
                      />
                    )}
                  </Grid>
                  {vendor.requestvisitorfollowaction === 'Required' ? (
                    <>
                      <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Request Follow Up Date<b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="date"
                            value={vendor.requestfollowupactionupdate}
                            onChange={(e) => {
                              setVendor({
                                ...vendor,
                                requestfollowupactionupdate: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Request Follow Up Time <b style={{ color: 'red' }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="time"
                            placeholder="HH:MM:AM/PM"
                            value={vendor.requestfollowupactionuptime}
                            onChange={(e) => {
                              setVendor({
                                ...vendor,
                                requestfollowupactionuptime: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item md={6} xs={12} sm={12}></Grid>
                    </>
                  )}
                </>
              )}

              <Grid item md={12} xs={12} sm={12}>
                <Box sx={userStyle.selectcontainer}>
                  <Typography sx={userStyle.SubHeaderText}> Permanent Address</Typography>
                  <br />
                  <br />

                  <>
                    <Grid container spacing={2}>
                      <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Address Type</Typography>
                          <Selects
                            maxMenuHeight={300}
                            options={permanent_address_type}
                            value={{
                              label: vendor.addesstype === '' ? 'Please Select Address Type' : vendor.addesstype,
                              value: vendor.addesstype === '' ? 'Please Select Address Type' : vendor.addesstype,
                            }}
                            onChange={(e) => {
                              setVendor({
                                ...vendor,
                                addesstype: e.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Personal Prefix</Typography>
                          <Selects
                            maxMenuHeight={300}
                            options={personal_prefix}
                            value={{
                              label: vendor.personalprefix === '' ? 'Please Select Personal Prefix' : vendor.personalprefix,
                              value: vendor.personalprefix === '' ? 'Please Select Personal Prefix' : vendor.personalprefix,
                            }}
                            onChange={(e) => {
                              setVendor({
                                ...vendor,
                                personalprefix: e.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Reference Name </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={vendor.referencename}
                            placeholder="Please Enter Reference Name"
                            onChange={(e) => {
                              setVendor({
                                ...vendor,
                                referencename: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl size="small" fullWidth>
                          <Typography>Country</Typography>
                          <Selects
                            options={Country.getAllCountries()}
                            getOptionLabel={(options) => {
                              return options['name'];
                            }}
                            getOptionValue={(options) => {
                              return options['name'];
                            }}
                            // styles={colourStyles}
                            value={selectedCountryp}
                            onChange={(item) => {
                              setSelectedCountryp(item);
                              setSelectedStatep('');
                              setSelectedCityp('');
                              setVendor((prevSupplier) => ({
                                ...prevSupplier,
                                pcountry: item?.name || '',
                                pstate: '',
                                pcity: '',

                                pgenerateviapincode: false,
                                pvillageorcity: '',
                                pdistrict: '',
                              }));
                            }}
                          />
                        </FormControl>
                        {selectedCountryp?.name === 'India' && (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={vendor?.pgenerateviapincode}
                                onChange={(e) => {
                                  setVendor((prevSupplier) => ({
                                    ...prevSupplier,
                                    pgenerateviapincode: e.target.checked,
                                    pvillageorcity: '',
                                    pdistrict: '',
                                    pstate: '',
                                    pcity: '',
                                  }));
                                  setSelectedStatep('');
                                  setSelectedCityp('');
                                }}
                              />
                            }
                            label="Generate Via Pincode"
                          />
                        )}
                      </Grid>
                      {selectedCountryp?.name === 'India' && vendor?.pgenerateviapincode && (
                        <>
                          <Grid item md={3} sm={4} xs={12}>
                            <FormControl fullWidth size="small">
                              <Typography>Pincode</Typography>

                              <Box display="flex" alignItems="center" gap={1}>
                                <OutlinedInput
                                  id="component-outlined"
                                  type="number"
                                  value={vendor.ppincode}
                                  onChange={(e) => {
                                    handlechangeppincode(e);
                                  }}
                                  sx={userStyle.input}
                                />
                                <PincodeButton pincode={vendor?.ppincode || ''} onSuccess={handleLocationSuccessp} />
                              </Box>
                            </FormControl>
                          </Grid>
                        </>
                      )}
                      {!vendor?.pgenerateviapincode && (
                        <Grid item md={3} sm={4} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Pincode</Typography>

                            <OutlinedInput
                              id="component-outlined"
                              type="number"
                              value={vendor.ppincode}
                              onChange={(e) => {
                                // setVendor({
                                //   ...vendor,
                                //   postalcode: e.target.value,
                                // });
                                // handlePostal(e.target.value);
                                handlechangeppincode(e);
                              }}
                              sx={userStyle.input}
                            />
                          </FormControl>
                        </Grid>
                      )}
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>State</Typography>
                          <Selects
                            options={State?.getStatesOfCountry(selectedCountryp?.isoCode)}
                            getOptionLabel={(options) => {
                              return options['name'];
                            }}
                            getOptionValue={(options) => {
                              return options['name'];
                            }}
                            value={selectedStatep}
                            // styles={colourStyles}
                            onChange={(item) => {
                              setSelectedStatep(item);
                              setSelectedCityp('');
                              setVendor((prevSupplier) => ({
                                ...prevSupplier,
                                pstate: item?.name || '',
                                pcity: '',
                              }));
                            }}
                            isDisabled={selectedCountryp?.name === 'India' && vendor?.pgenerateviapincode}
                          />
                        </FormControl>
                      </Grid>
                      {selectedCountryp?.name === 'India' && vendor?.pgenerateviapincode ? (
                        <>
                          <Grid item md={3} sm={12} xs={12}>
                            <FormControl fullWidth size="small">
                              <Typography>District</Typography>
                              <OutlinedInput id="component-outlined" type="text" value={vendor?.pdistrict || ''} readOnly sx={userStyle.input} />
                            </FormControl>
                          </Grid>
                          <Grid item md={3} sm={6} xs={12}>
                            <FormControl fullWidth size="small">
                              <Typography> Village/City </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ flexGrow: 1 }}>
                                  {switchValues?.pvillageorcity ? (
                                    <OutlinedInput
                                      id="component-outlined"
                                      type="text"
                                      value={vendor?.pvillageorcity}
                                      placeholder="Village/City"
                                      onChange={(e) =>
                                        setVendor((prevSupplier) => ({
                                          ...prevSupplier,
                                          pvillageorcity: e.target.value,
                                        }))
                                      }
                                    />
                                  ) : (
                                    <Selects
                                      options={fromPinCodep?.length > 0 ? fromPinCodep : []}
                                      getOptionLabel={(options) => {
                                        return options['name'];
                                      }}
                                      getOptionValue={(options) => {
                                        return options['name'];
                                      }}
                                      value={vendor?.pvillageorcity !== '' ? { name: vendor?.pvillageorcity } : ''}
                                      // styles={colourStyles}
                                      onChange={(item) => {
                                        setVendor((prevSupplier) => ({
                                          ...prevSupplier,
                                          pvillageorcity: item?.name || '',
                                        }));
                                      }}
                                    />
                                  )}
                                </Box>

                                <FormGroup>
                                  <Button
                                    variant={switchValues?.pvillageorcity ? 'contained' : 'outlined'}
                                    onClick={() => {
                                      setSwicthValues((prev) => ({
                                        ...prev,
                                        pvillageorcity: !switchValues?.pvillageorcity,
                                      }));
                                      setVendor((prevSupplier) => ({
                                        ...prevSupplier,
                                        pvillageorcity: '',
                                      }));
                                    }}
                                    size="small"
                                  >
                                    {switchValues?.pvillageorcity ? 'Exist' : 'New'}
                                  </Button>
                                </FormGroup>
                              </Box>
                            </FormControl>
                          </Grid>
                        </>
                      ) : (
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>City</Typography>
                            <Selects
                              options={City.getCitiesOfState(selectedStatep?.countryCode, selectedStatep?.isoCode)}
                              getOptionLabel={(options) => {
                                return options['name'];
                              }}
                              getOptionValue={(options) => {
                                return options['name'];
                              }}
                              value={selectedCityp}
                              // styles={colourStyles}
                              onChange={(item) => {
                                setSelectedCityp(item);
                                setVendor((prevSupplier) => ({
                                  ...prevSupplier,
                                  pcity: item?.name || '',
                                }));
                              }}
                            />
                          </FormControl>
                        </Grid>
                      )}
                      <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>GPS Coordinate</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={vendor.gpscoordinate}
                            placeholder="Please Enter GPS Coordinate"
                            onChange={(e) => {
                              setVendor({
                                ...vendor,
                                gpscoordinate: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Landmark Position Prefix</Typography>
                          <Selects
                            maxMenuHeight={300}
                            options={landmark_and_positional_prefix}
                            value={{
                              label: vendor.landmarkpositionprefix === '' ? 'Please Select Landmark and Positional  Prefix' : vendor.landmarkpositionprefix,
                              value: vendor.landmarkpositionprefix === '' ? 'Please Select Landmark and Positional  Prefix' : vendor.landmarkpositionprefix,
                            }}
                            onChange={(e) => {
                              setVendor({
                                ...vendor,
                                landmarkpositionprefix: e.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Landmark Name</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={vendor.landmarkname}
                            placeholder="Please Enter Landmark Name"
                            onChange={(e) => {
                              setVendor({
                                ...vendor,
                                landmarkname: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>House/Flat No</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={vendor.houseflatnumber}
                            placeholder="Please Enter House/Flat Number"
                            onChange={(e) => {
                              setVendor({
                                ...vendor,
                                houseflatnumber: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Street/Road Name</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={vendor.streetroadname}
                            placeholder="Please Enter Street/Road Name"
                            onChange={(e) => {
                              setVendor({
                                ...vendor,
                                streetroadname: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Locality/Area Name</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={vendor.localityareaname}
                            placeholder="Please Enter Locality/Area Name"
                            onChange={(e) => {
                              setVendor({
                                ...vendor,
                                localityareaname: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                        <Grid item md={3} xs={12} sm={12}>
                                                                                                                                                                                  <FormControl fullWidth size="small">
                                                                                                                                                                                    <Typography>Building/Apartment Name</Typography>
                                                                                                                                                                                    <OutlinedInput
                                                                                                                                                                                      id="component-outlined"
                                                                                                                                                                                      type="text"
                                                                                                                                                                                      value={vendor.pbuildingapartmentname}
                                                                                                                                                                                      placeholder="Please Enter Building/Apartment Name"
                                                                                                                                                                                      onChange={(e) => {
                                                                                                                                                                                        setVendor({
                                                                                                                                                                                          ...vendor,
                                                                                                                                                                                          pbuildingapartmentname: e.target.value,
                                                                                                                                                                                        });
                                                                                                                                                                                      }}
                                                                                                                                                                                    />
                                                                                                                                                                                  </FormControl>
                                                                                                                                                                                </Grid>
                                                                                                                                                                                <Grid item md={3} xs={12} sm={12}>
                                                                                                                                                                                  <FormControl fullWidth size="small">
                                                                                                                                                                                    <Typography>Address 1</Typography>
                                                                                                                                                                                    <OutlinedInput
                                                                                                                                                                                      id="component-outlined"
                                                                                                                                                                                      type="text"
                                                                                                                                                                                      value={vendor.paddressone}
                                                                                                                                                                                      placeholder="Please Enter Address 1"
                                                                                                                                                                                      onChange={(e) => {
                                                                                                                                                                                        setVendor({
                                                                                                                                                                                          ...vendor,
                                                                                                                                                                                          paddressone: e.target.value,
                                                                                                                                                                                        });
                                                                                                                                                                                      }}
                                                                                                                                                                                    />
                                                                                                                                                                                  </FormControl>
                                                                                                                                                                                </Grid>
                                                                                                                                                                                <Grid item md={3} xs={12} sm={12}>
                                                                                                                                                                                  <FormControl fullWidth size="small">
                                                                                                                                                                                    <Typography>Address 2</Typography>
                                                                                                                                                                                    <OutlinedInput
                                                                                                                                                                                      id="component-outlined"
                                                                                                                                                                                      type="text"
                                                                                                                                                                                      value={vendor.paddresstwo}
                                                                                                                                                                                      placeholder="Please Enter Address 2"
                                                                                                                                                                                      onChange={(e) => {
                                                                                                                                                                                        setVendor({
                                                                                                                                                                                          ...vendor,
                                                                                                                                                                                          paddresstwo: e.target.value,
                                                                                                                                                                                        });
                                                                                                                                                                                      }}
                                                                                                                                                                                    />
                                                                                                                                                                                  </FormControl>
                                                                                                                                                                                </Grid>
                                                                                                                                                                                <Grid item md={3} xs={12} sm={12}>
                                                                                                                                                                                  <FormControl fullWidth size="small">
                                                                                                                                                                                    <Typography>Address 3</Typography>
                                                                                                                                                                                    <OutlinedInput
                                                                                                                                                                                      id="component-outlined"
                                                                                                                                                                                      type="text"
                                                                                                                                                                                      value={vendor.paddressthree}
                                                                                                                                                                                      placeholder="Please Enter Address 3"
                                                                                                                                                                                      onChange={(e) => {
                                                                                                                                                                                        setVendor({
                                                                                                                                                                                          ...vendor,
                                                                                                                                                                                          paddressthree: e.target.value,
                                                                                                                                                                                        });
                                                                                                                                                                                      }}
                                                                                                                                                                                    />
                                                                                                                                                                                  </FormControl>
                                                                                                                                                                                </Grid>
                    </Grid>
                    <Grid item md={12} sm={12} xs={12}>
                      <FullAddressCard
                        employee={{
                          // ...vendor,
                          ppersonalprefix: vendor?.personalprefix,
                          presourcename: vendor?.referencename,
                          plandmarkandpositionalprefix: vendor?.landmarkpositionprefix,
                          plandmark: vendor?.landmarkname,
                          pdoorno: vendor?.houseflatnumber,
                          pstreet: vendor?.streetroadname,
                          parea: vendor?.localityareaname,
                          pcity: selectedCityp?.name,
                          pvillageorcity: vendor?.pvillageorcity || '',
                          pdistrict: vendor?.pdistrict || '',
                          pstate: selectedStatep?.name,
                          pcountry: selectedCountryp?.name,
                          ppincode: vendor?.ppincode,
                          pgpscoordination: vendor?.gpscoordinate,

                                     pbuildingapartmentname:vendor?.pbuildingapartmentname || "",
paddressone:vendor?.paddressone || "",
paddresstwo:vendor?.paddresstwo || "",
paddressthree:vendor?.paddressthree || "",
                        }}
                      />
                    </Grid>
                  </>
                  <br />
                  <br />
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography sx={userStyle.SubHeaderText}> Current Address</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={vendor.samesprmnt}
                            onChange={(e) =>
                              setVendor({
                                ...vendor,
                                samesprmnt: !vendor.samesprmnt,
                              })
                            }
                          />
                        }
                        label="Same as permanent Address"
                      />
                    </Grid>
                  </Grid>
                  <br />
                  <br />
                  {!vendor.samesprmnt ? (
                    <>
                      <Grid container spacing={2}>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Address Type</Typography>
                            <Selects
                              options={address_type}
                              styles={colourStyles}
                              value={{
                                label: vendor?.caddesstype === '' ? 'Please Select Address Type' : vendor?.caddesstype,
                                value: vendor?.caddesstype === '' ? 'Please Select Address Type' : vendor?.caddesstype,
                              }}
                              onChange={(e) => {
                                setVendor({ ...vendor, caddesstype: e.value });
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Personal Prefix</Typography>
                            <Selects
                              options={personal_prefix}
                              styles={colourStyles}
                              value={{
                                label: vendor?.cpersonalprefix === '' ? 'Please Select Personal Prefix' : vendor?.cpersonalprefix,
                                value: vendor?.cpersonalprefix === '' ? 'Please Select Personal Prefix' : vendor?.cpersonalprefix,
                              }}
                              onChange={(e) => {
                                setVendor({ ...vendor, cpersonalprefix: e.value });
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Reference Name</Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Reference Name"
                              value={vendor?.creferencename}
                              onChange={(e) => {
                                setVendor({ ...vendor, creferencename: e.target.value });
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Country</Typography>
                            <Selects
                              options={Country.getAllCountries()}
                              getOptionLabel={(options) => {
                                return options['name'];
                              }}
                              getOptionValue={(options) => {
                                return options['name'];
                              }}
                              value={selectedCountryc}
                              styles={colourStyles}
                              onChange={(item) => {
                                setSelectedCountryc(item);
                                setSelectedStatec('');
                                setSelectedCityc('');
                                setVendor((prevSupplier) => ({
                                  ...prevSupplier,
                                  ccountry: item?.name || '',

                                  cgenerateviapincode: false,
                                  cvillageorcity: '',
                                  cdistrict: '',
                                  cstate: '',
                                  ccity: '',
                                }));
                              }}
                            />
                          </FormControl>
                          {selectedCountryc?.name === 'India' && (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={vendor?.cgenerateviapincode}
                                  onChange={(e) => {
                                    setVendor((prevSupplier) => ({
                                      ...prevSupplier,
                                      cgenerateviapincode: e.target.checked,
                                      cvillageorcity: '',
                                      cdistrict: '',
                                      cstate: '',
                                      ccity: '',
                                    }));
                                    setSelectedStatec('');
                                    setSelectedCityc('');
                                  }}
                                />
                              }
                              label="Generate Via Pincode"
                            />
                          )}
                        </Grid>
                        {selectedCountryc?.name === 'India' && vendor?.cgenerateviapincode && (
                          <>
                            <Grid item md={3} sm={4} xs={12}>
                              <FormControl fullWidth size="small">
                                <Typography>Pincode</Typography>

                                <Box display="flex" alignItems="center" gap={1}>
                                  <OutlinedInput
                                    id="component-outlined"
                                    type="number"
                                    value={vendor.cpincode}
                                    onChange={(e) => {
                                      handlechangecpincode(e);
                                    }}
                                    sx={userStyle.input}
                                  />
                                  <PincodeButton pincode={vendor?.cpincode || ''} onSuccess={handleLocationSuccessc} />
                                </Box>
                              </FormControl>
                            </Grid>
                          </>
                        )}
                        {!vendor?.cgenerateviapincode && (
                          <Grid item md={3} sm={12} xs={12}>
                            <FormControl size="small" fullWidth>
                              <Typography>Pincode</Typography>
                              <OutlinedInput
                                id="component-outlined"
                                type="number"
                                sx={userStyle.input}
                                placeholder="Pincode"
                                value={vendor.cpincode}
                                onChange={(e) => {
                                  handlechangecpincode(e);
                                }}
                              />
                            </FormControl>
                          </Grid>
                        )}
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>State</Typography>
                            <Selects
                              options={State?.getStatesOfCountry(selectedCountryc?.isoCode)}
                              getOptionLabel={(options) => {
                                return options['name'];
                              }}
                              getOptionValue={(options) => {
                                return options['name'];
                              }}
                              value={selectedStatec}
                              styles={colourStyles}
                              onChange={(item) => {
                                setSelectedStatec(item);
                                setSelectedCityc('');
                                setVendor((prevSupplier) => ({
                                  ...prevSupplier,
                                  cstate: item?.name || '',
                                }));
                              }}
                              isDisabled={selectedCountryc?.name === 'India' && vendor?.cgenerateviapincode}
                            />
                          </FormControl>
                        </Grid>
                        {selectedCountryc?.name === 'India' && vendor?.cgenerateviapincode ? (
                          <>
                            <Grid item md={3} sm={12} xs={12}>
                              <FormControl fullWidth size="small">
                                <Typography>District</Typography>
                                <OutlinedInput id="component-outlined" type="text" value={vendor?.cdistrict || ''} readOnly sx={userStyle.input} />
                              </FormControl>
                            </Grid>
                            <Grid item md={3} sm={6} xs={12}>
                              <FormControl fullWidth size="small">
                                <Typography> Village/City </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ flexGrow: 1 }}>
                                    {switchValues?.cvillageorcity ? (
                                      <OutlinedInput
                                        id="component-outlined"
                                        type="text"
                                        value={vendor?.cvillageorcity}
                                        placeholder="Village/City"
                                        onChange={(e) =>
                                          setVendor((prevSupplier) => ({
                                            ...prevSupplier,
                                            cvillageorcity: e.target.value,
                                          }))
                                        }
                                      />
                                    ) : (
                                      <Selects
                                        options={fromPinCodec?.length > 0 ? fromPinCodec : []}
                                        getOptionLabel={(options) => {
                                          return options['name'];
                                        }}
                                        getOptionValue={(options) => {
                                          return options['name'];
                                        }}
                                        value={vendor?.cvillageorcity !== '' ? { name: vendor?.cvillageorcity } : ''}
                                        // styles={colourStyles}
                                        onChange={(item) => {
                                          setVendor((prevSupplier) => ({
                                            ...prevSupplier,
                                            cvillageorcity: item?.name || '',
                                          }));
                                        }}
                                      />
                                    )}
                                  </Box>

                                  <FormGroup>
                                    <Button
                                      variant={switchValues?.cvillageorcity ? 'contained' : 'outlined'}
                                      onClick={() => {
                                        setSwicthValues((prev) => ({
                                          ...prev,
                                          cvillageorcity: !switchValues?.cvillageorcity,
                                        }));
                                        setVendor((prevSupplier) => ({
                                          ...prevSupplier,
                                          cvillageorcity: '',
                                        }));
                                      }}
                                      size="small"
                                    >
                                      {switchValues?.cvillageorcity ? 'Exist' : 'New'}
                                    </Button>
                                  </FormGroup>
                                </Box>
                              </FormControl>
                            </Grid>
                          </>
                        ) : (
                          <Grid item md={3} sm={12} xs={12}>
                            <FormControl fullWidth size="small">
                              <Typography>City</Typography>
                              <Selects
                                options={City.getCitiesOfState(selectedStatec?.countryCode, selectedStatec?.isoCode)}
                                getOptionLabel={(options) => {
                                  return options['name'];
                                }}
                                getOptionValue={(options) => {
                                  return options['name'];
                                }}
                                value={selectedCityc}
                                styles={colourStyles}
                                onChange={(item) => {
                                  setSelectedCityc(item);
                                  setVendor((prevSupplier) => ({
                                    ...prevSupplier,
                                    ccity: item?.name || '',
                                  }));
                                }}
                              />
                            </FormControl>
                          </Grid>
                        )}

                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>GPS Coordination</Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Landmark  Name"
                              value={vendor.cgpscoordinate}
                              onChange={(e) => {
                                setVendor({
                                  ...vendor,
                                  cgpscoordinate: e.target.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Landmark & Positional Prefix</Typography>
                            <Selects
                              options={landmark_and_positional_prefix}
                              styles={colourStyles}
                              value={{
                                label: vendor?.clandmarkpositionprefix === '' ? 'Please Select Landmark and Positional  Prefix' : vendor?.clandmarkpositionprefix,
                                value: vendor?.clandmarkpositionprefix === '' ? 'Please Select Landmark and Positional  Prefix' : vendor?.clandmarkpositionprefix,
                              }}
                              onChange={(e) => {
                                setVendor({ ...vendor, clandmarkpositionprefix: e.value });
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Landmark Name</Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Landmark  Name"
                              value={vendor.clandmarkname}
                              onChange={(e) => {
                                setVendor({
                                  ...vendor,
                                  clandmarkname: e.target.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>House/Flat No</Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="House/Flat No"
                              value={vendor.chouseflatnumber}
                              onChange={(e) => {
                                setVendor({
                                  ...vendor,
                                  chouseflatnumber: e.target.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Street/Road Name</Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Street/Road Name"
                              value={vendor.cstreetroadname}
                              onChange={(e) => {
                                setVendor({
                                  ...vendor,
                                  cstreetroadname: e.target.value,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Locality/Area Name</Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Locality/Area Name"
                              value={vendor.clocalityareaname}
                              onChange={(e) => {
                                setVendor({ ...vendor, clocalityareaname: e.target.value });
                              }}
                            />
                          </FormControl>
                        </Grid>
                         <Grid item md={3} xs={12} sm={12}>
                                                                                                                                                                        <FormControl fullWidth size="small">
                                                                                                                                                                          <Typography>Building/Apartment Name</Typography>
                                                                                                                                                                          <OutlinedInput
                                                                                                                                                                            id="component-outlined"
                                                                                                                                                                            type="text"
                                                                                                                                                                            value={vendor.cbuildingapartmentname}
                                                                                                                                                                            placeholder="Please Enter Building/Apartment Name"
                                                                                                                                                                            onChange={(e) => {
                                                                                                                                                                              setVendor({
                                                                                                                                                                                ...vendor,
                                                                                                                                                                                cbuildingapartmentname: e.target.value,
                                                                                                                                                                              });
                                                                                                                                                                            }}
                                                                                                                                                                          />
                                                                                                                                                                        </FormControl>
                                                                                                                                                                      </Grid>
                                                                                                                                                                      <Grid item md={3} xs={12} sm={12}>
                                                                                                                                                                        <FormControl fullWidth size="small">
                                                                                                                                                                          <Typography>Address 1</Typography>
                                                                                                                                                                          <OutlinedInput
                                                                                                                                                                            id="component-outlined"
                                                                                                                                                                            type="text"
                                                                                                                                                                            value={vendor.caddressone}
                                                                                                                                                                            placeholder="Please Enter Address 1"
                                                                                                                                                                            onChange={(e) => {
                                                                                                                                                                              setVendor({
                                                                                                                                                                                ...vendor,
                                                                                                                                                                                caddressone: e.target.value,
                                                                                                                                                                              });
                                                                                                                                                                            }}
                                                                                                                                                                          />
                                                                                                                                                                        </FormControl>
                                                                                                                                                                      </Grid>
                                                                                                                                                                      <Grid item md={3} xs={12} sm={12}>
                                                                                                                                                                        <FormControl fullWidth size="small">
                                                                                                                                                                          <Typography>Address 2</Typography>
                                                                                                                                                                          <OutlinedInput
                                                                                                                                                                            id="component-outlined"
                                                                                                                                                                            type="text"
                                                                                                                                                                            value={vendor.caddresstwo}
                                                                                                                                                                            placeholder="Please Enter Address 2"
                                                                                                                                                                            onChange={(e) => {
                                                                                                                                                                              setVendor({
                                                                                                                                                                                ...vendor,
                                                                                                                                                                                caddresstwo: e.target.value,
                                                                                                                                                                              });
                                                                                                                                                                            }}
                                                                                                                                                                          />
                                                                                                                                                                        </FormControl>
                                                                                                                                                                      </Grid>
                                                                                                                                                                      <Grid item md={3} xs={12} sm={12}>
                                                                                                                                                                        <FormControl fullWidth size="small">
                                                                                                                                                                          <Typography>Address 3</Typography>
                                                                                                                                                                          <OutlinedInput
                                                                                                                                                                            id="component-outlined"
                                                                                                                                                                            type="text"
                                                                                                                                                                            value={vendor.caddressthree}
                                                                                                                                                                            placeholder="Please Enter Address 3"
                                                                                                                                                                            onChange={(e) => {
                                                                                                                                                                              setVendor({
                                                                                                                                                                                ...vendor,
                                                                                                                                                                                caddressthree: e.target.value,
                                                                                                                                                                              });
                                                                                                                                                                            }}
                                                                                                                                                                          />
                                                                                                                                                                        </FormControl>
                                                                                                                                                                      </Grid>
                      </Grid>
                    </>
                  ) : (
                    // else condition starts here
                    <>
                      <Grid container spacing={2}>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Address Type</Typography>
                            <OutlinedInput id="component-outlined" type="text" placeholder="Address Type" value={vendor?.addesstype} readOnly />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Personal Prefix</Typography>
                            <OutlinedInput id="component-outlined" type="text" placeholder="Personal Prefix" value={vendor?.personalprefix} readOnly />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Reference Name</Typography>
                            <OutlinedInput id="component-outlined" type="text" placeholder="Reference Name" value={vendor?.referencename} readOnly />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl size="small" fullWidth>
                            <Typography>Country</Typography>
                            <Selects
                              options={Country.getAllCountries()}
                              getOptionLabel={(options) => {
                                return options['name'];
                              }}
                              getOptionValue={(options) => {
                                return options['name'];
                              }}
                              value={selectedCountryp}
                              styles={colourStyles}
                              isDisabled={true}
                            />
                          </FormControl>
                          {selectedCountryp?.name === 'India' && <FormControlLabel control={<Checkbox checked={vendor?.pgenerateviapincode} readOnly disabled={true} />} label="Generate Via Pincode" />}
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl size="small" fullWidth>
                            <Typography>Pincode</Typography>
                            <OutlinedInput id="component-outlined" type="text" placeholder="Pincode" value={vendor.ppincode} readOnly />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>State</Typography>
                            <Selects
                              options={State?.getStatesOfCountry(selectedCountryp?.isoCode)}
                              getOptionLabel={(options) => {
                                return options['name'];
                              }}
                              getOptionValue={(options) => {
                                return options['name'];
                              }}
                              value={selectedStatep}
                              styles={colourStyles}
                              // onChange={(item) => {
                              //   setSelectedStatep(item);
                              // }}
                              isDisabled={true}
                            />
                          </FormControl>
                        </Grid>
                        {vendor?.pgenerateviapincode && selectedCountryp?.name === 'India' ? (
                          <>
                            <Grid item md={3} sm={12} xs={12}>
                              <FormControl size="small" fullWidth>
                                <Typography>District</Typography>
                                <OutlinedInput id="component-outlined" type="text" placeholder="District" value={vendor.pdistrict || ''} readOnly />
                              </FormControl>
                            </Grid>
                            <Grid item md={3} sm={12} xs={12}>
                              <FormControl size="small" fullWidth>
                                <Typography>Village/City</Typography>
                                <OutlinedInput id="component-outlined" type="text" placeholder="Village/City" value={vendor.pvillageorcity || ''} readOnly />
                              </FormControl>
                            </Grid>
                          </>
                        ) : (
                          <Grid item md={3} sm={12} xs={12}>
                            <FormControl fullWidth size="small">
                              <Typography>City</Typography>
                              <Selects
                                options={City.getCitiesOfState(selectedStatep?.countryCode, selectedStatep?.isoCode)}
                                getOptionLabel={(options) => {
                                  return options['name'];
                                }}
                                getOptionValue={(options) => {
                                  return options['name'];
                                }}
                                value={selectedCityp}
                                styles={colourStyles}
                                // onChange={(item) => {
                                //   setSelectedCityp(item);
                                // }}
                                isDisabled={true}
                              />
                            </FormControl>
                          </Grid>
                        )}

                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl size="small" fullWidth>
                            <Typography>GPS Coordination</Typography>
                            <OutlinedInput id="component-outlined" type="text" placeholder="GPS Coordination" value={vendor?.gpscoordinate} readOnly />
                          </FormControl>
                        </Grid>

                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography> Landmark & Positional Prefix </Typography>
                            <OutlinedInput id="component-outlined" type="text" placeholder="Landmark & Positional Prefix" value={vendor?.landmarkpositionprefix} readOnly />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Landmark Name</Typography>
                            <OutlinedInput id="component-outlined" type="text" placeholder="Landmark  Name" value={vendor.landmarkname} readOnly />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>House/Flat No</Typography>
                            <OutlinedInput id="component-outlined" type="text" placeholder="House/Flat No" value={vendor.houseflatnumber} readOnly />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Street/Road Name</Typography>
                            <OutlinedInput id="component-outlined" type="text" placeholder="Street/Road Name" value={vendor.streetroadname} readOnly />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Locality/Area Name</Typography>
                            <OutlinedInput id="component-outlined" type="text" placeholder="Locality/Area Name" value={vendor.localityareaname} readOnly />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} sm={12} xs={12}>
                                                                                                        <FormControl fullWidth size="small">
                                                                                                          <Typography>Building/Apartment Name</Typography>
                                                                                                          <OutlinedInput id="component-outlined" type="text" placeholder="Building/Apartment Name" value={vendor?.pbuildingapartmentname || ""} readOnly />
                                                                                                        </FormControl>
                                                                                                      </Grid>
                                                                                                      <Grid item md={3} sm={12} xs={12}>
                                                                                                        <FormControl fullWidth size="small">
                                                                                                          <Typography>Address 1</Typography>
                                                                                                          <OutlinedInput id="component-outlined" type="text" placeholder="Address 1" value={vendor?.paddressone || ""} readOnly />
                                                                                                        </FormControl>
                                                                                                      </Grid>
                                                                                                      <Grid item md={3} sm={12} xs={12}>
                                                                                                        <FormControl fullWidth size="small">
                                                                                                          <Typography>Address 2</Typography>
                                                                                                          <OutlinedInput id="component-outlined" type="text" placeholder="Address 2" value={vendor?.paddresstwo || ""} readOnly />
                                                                                                        </FormControl>
                                                                                                      </Grid>
                                                                                                      <Grid item md={3} sm={12} xs={12}>
                                                                                                        <FormControl fullWidth size="small">
                                                                                                          <Typography>Address 3</Typography>
                                                                                                          <OutlinedInput id="component-outlined" type="text" placeholder="Address 3" value={vendor?.paddressthree || ""} readOnly />
                                                                                                        </FormControl>
                                                                                                      </Grid>
                      </Grid>
                    </>
                  )}
                </Box>
              </Grid>
              <Grid item md={12} xs={12} sm={12}></Grid>

              <Grid item md={3} xs={12} sm={12}>
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox checked={vendor.escortinformation} />}
                    onChange={(e) =>
                      setVendor({
                        ...vendor,
                        escortinformation: !vendor.escortinformation,
                      })
                    }
                    label="Escort Information"
                  />
                </FormGroup>
              </Grid>
              <Grid item md={9} xs={12} sm={12}></Grid>
              {vendor.escortinformation && (
                <>
                  <Grid item md={6} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Escort Details<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <TextareaAutosize
                        aria-label="minimum height"
                        minRows={5}
                        value={vendor.escortdetails}
                        onChange={(e) => {
                          setVendor({
                            ...vendor,
                            escortdetails: e.target.value,
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={6} xs={12} sm={12}></Grid>
                </>
              )}
              <Grid item md={3} xs={12} sm={12}>
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox checked={vendor.materialcarryinginfo} />}
                    onChange={(e) =>
                      setVendor({
                        ...vendor,
                        materialcarryinginfo: !vendor.materialcarryinginfo,
                      })
                    }
                    label="Material Carrying"
                  />
                </FormGroup>
              </Grid>
              {!vendor.materialcarryinginfo && (
                <>
                  <Grid item md={9} sm={12} xs={12}></Grid>
                </>
              )}
              {vendor.materialcarryinginfo && (
                <>
                  <Grid item md={4} sm={12} xs={12} sx={{ display: 'flex' }}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        {' '}
                        Material Name<b style={{ color: 'red' }}>*</b>
                      </Typography>
                      <OutlinedInput id="component-outlined" placeholder="Please Enter Material Name" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} />
                    </FormControl>
                    &emsp;
                    <Button
                      variant="contained"
                      color="success"
                      onClick={addTodo}
                      type="button"
                      sx={{
                        height: '30px',
                        minWidth: '30px',
                        marginTop: '28px',
                        padding: '6px 10px',
                      }}
                    >
                      <FaPlus />
                    </Button>
                    &nbsp;
                  </Grid>

                  <Grid item md={12} sm={12} xs={12}>
                    {subCategoryTodo?.length > 0 && (
                      <ul type="none">
                        {subCategoryTodo.map((item, index) => {
                          return (
                            <li key={index}>
                              <br />
                              <>
                                <Grid item md={4} sm={12} xs={12}>
                                  &nbsp;
                                </Grid>
                                <Grid item md={4} sm={12} xs={12} sx={{ display: 'flex' }}>
                                  <FormControl fullWidth size="small">
                                    <Typography>
                                      {' '}
                                      Material Name <b style={{ color: 'red' }}>*</b>
                                    </Typography>
                                    <OutlinedInput id="component-outlined" placeholder="Please Enter Material" value={item} onChange={(e) => handleTodoEdit(index, e.target.value)} />
                                  </FormControl>
                                  &nbsp; &emsp;
                                  <Button
                                    variant="contained"
                                    color="error"
                                    type="button"
                                    onClick={(e) => deleteTodo(index)}
                                    sx={{
                                      height: '30px',
                                      minWidth: '30px',
                                      marginTop: '28px',
                                      padding: '6px 10px',
                                    }}
                                  >
                                    <AiOutlineClose />
                                  </Button>
                                </Grid>
                              </>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </Grid>
                </>
              )}

              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>Equipment Borrowed</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="text"
                    value={vendor.equipmentborrowed}
                    placeholder="Please Enter Equipment Borrowed "
                    onChange={(e) => {
                      setVendor({
                        ...vendor,
                        equipmentborrowed: e.target.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>OUT Time</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="time"
                    placeholder="HH:MM:AM/PM"
                    value={vendor.outtime}
                    onChange={(e) => {
                      setVendor({ ...vendor, outtime: e.target.value });
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>Remark</Typography>
                  <TextareaAutosize
                    aria-label="minimum height"
                    minRows={2.5}
                    value={vendor.remark}
                    onChange={(e) => {
                      setVendor({
                        ...vendor,
                        remark: e.target.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>Visitor Badge / Pass Details</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="text"
                    value={vendor.visitorbadge}
                    placeholder="Please Enter Visitor Badge / Pass Details"
                    onChange={(e) => {
                      setVendor({
                        ...vendor,
                        visitorbadge: e.target.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>Visitor Survey / Feedback</Typography>
                  <TextareaAutosize
                    aria-label="minimum height"
                    minRows={2.5}
                    value={vendor.visitorsurvey}
                    onChange={(e) => {
                      setVendor({
                        ...vendor,
                        visitorsurvey: e.target.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>Added By</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="text"
                    value={isUserRoleAccess?.companyname}
                    // value={vendor.visitorname}
                    placeholder="Please Enter AddedBy"
                    readOnly
                  />
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br />
            <br /> <br />
            <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Grid item md={1} sm={2} xs={12}>
                <Button variant="contained" color="primary" sx={buttonStyles.buttonsubmit} onClick={(e) => handleSubmit(e)} disabled={buttonLoad}>
                  Save
                </Button>
              </Grid>

              <Grid item md={1} sm={2} xs={12}>
                <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                  Clear
                </Button>
              </Grid>
              {/* <Grid item md={1} sm={2} xs={12}>
                                <Link
                                    to="/interactor/master/visitorinformationmasterlist"
                                    style={{
                                        textDecoration: 'none',
                                        color: 'white',
                                        float: 'right',
                                    }}
                                >
                                    <Button sx={buttonStyles.btncancel}>Cancel</Button>
                                </Link>
                            </Grid> */}
            </Grid>
          </>
        </Box>
      </>
      <br />
      <Box>
        {isUserRoleCompare?.includes('lvisitorinformationmaster') && (
          // <VisitorInformationMasterList setListStatus={listStatus} />
          <VisitorInformationMasterList triggered={listStatus} />
        )}
      </Box>
      <br />

      {/* UPLOAD IMAGE DIALOG */}
      <Dialog open={uploadPopupOpen} onClose={handleUploadPopupClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="md" fullWidth={true} sx={{ marginTop: '80px' }}>
        <DialogTitle id="customized-dialog-title1" sx={{ backgroundColor: '#e0e0e0', color: '#000', display: 'flex' }} onClick={() => {}}>
          Upload Image
        </DialogTitle>
        <DialogContent sx={{ minWidth: '750px', height: '850px' }}>
          <Grid container spacing={2}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Typography variant="body2" style={{ marginTop: '5px' }}>
                Max File size: 1MB
              </Typography>
              {/* {showDragField ? ( */}
              <div onDragOver={handleDragOver} onDrop={handleDrop} onPaste={handlePaste}>
                {previewURL && refImageDrag?.length > 0 ? (
                  <>
                    {refImageDrag.map((file, index) => (
                      <>
                        <img
                          src={file.preview}
                          alt={file.name}
                          style={{
                            maxWidth: '70px',
                            maxHeight: '70px',
                            marginTop: '10px',
                          }}
                        />
                        <Button onClick={() => handleRemoveFile(index)} style={{ marginTop: '0px', color: 'red' }}>
                          X
                        </Button>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {/* Color Picker */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Typography
                              variant="body1"
                              style={{
                                color: '#555',
                                fontSize: '10px',
                              }}
                            >
                              BG Color
                            </Typography>
                            <input
                              type="color"
                              value={colorDrag}
                              onChange={handleColorChangeDrag}
                              style={{
                                width: '30px',
                                height: '30px',
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '5px',
                              }}
                            />
                          </div>

                          {/* Submit Button */}
                          <LoadingButton
                            onClick={(e) => handleSubmitDrag(index)}
                            loading={bgbtnDrag}
                            variant="contained"
                            color="primary"
                            endIcon={<FormatColorFillIcon />}
                            sx={{
                              padding: '10px 10px',
                              fontSize: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              borderRadius: '5px',
                              color: isLightColorDrag ? 'black' : 'white',
                              fontWeight: '600',
                              backgroundColor: colorDrag, // Dynamically set the background color
                              '&:hover': {
                                backgroundColor: `${colorDrag}90`, // Slightly transparent on hover for a nice effect
                              },
                              border: '1px solid  black',
                            }}
                          ></LoadingButton>
                        </div>
                      </>
                    ))}
                  </>
                ) : (
                  <div
                    style={{
                      marginTop: '10px',
                      marginLeft: '0px',
                      border: '1px dashed #ccc',
                      padding: '0px',
                      width: '100%',
                      height: '150px',
                      display: 'flex',
                      alignContent: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', margin: '50px auto' }}>
                      <ContentCopyIcon /> Drag and drop
                    </div>
                  </div>
                )}
              </div>

              {/* ) : null} */}
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <br />
              <FormControl size="small" fullWidth>
                <Grid sx={{ display: 'flex' }}>
                  {/* {showUploadBtn ? ( */}
                  <Button variant="contained" component="label" sx={buttonStyles.buttonsubmit}>
                    Upload
                    <input type="file" multiple id="productimage" accept="image/*" hidden onChange={handleChangeImage} />
                  </Button>
                  &ensp;
                  <Button variant="contained" onClick={showWebcam} sx={userStyle.uploadbtn}>
                    Webcam
                  </Button>
                </Grid>
              </FormControl>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              {
                // isWebcamCapture == true
                capturedImages?.length > 0 &&
                  capturedImages?.map((image, index) => (
                    <Grid container key={index}>
                      <Grid item md={2} sm={2} xs={12}>
                        <Box
                          style={{
                            isplay: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: '37px',
                          }}
                        >
                          <img src={image.preview} alt={image.name} height={50} style={{ maxWidth: '-webkit-fill-available' }} />
                        </Box>
                      </Grid>
                      <Grid
                        item
                        md={7}
                        sm={7}
                        xs={12}
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="subtitle2"> {image.name} </Typography>
                      </Grid>
                      <Grid item md={1} sm={1} xs={12}>
                        <Grid sx={{ display: 'flex' }}>
                          <Button
                            sx={{
                              marginTop: '15px !important',
                              padding: '14px 14px',
                              minWidth: '40px !important',
                              borderRadius: '50% !important',
                              ':hover': {
                                backgroundColor: '#80808036', // theme.palette.primary.main
                              },
                            }}
                            onClick={() => renderFilePreview(image)}
                          >
                            <VisibilityOutlinedIcon
                              style={{
                                fontsize: '12px',
                                color: '#357AE8',
                                marginTop: '35px !important',
                              }}
                            />
                          </Button>
                          <Button
                            sx={{
                              marginTop: '15px !important',
                              padding: '14px 14px',
                              minWidth: '40px !important',
                              borderRadius: '50% !important',
                              ':hover': {
                                backgroundColor: '#80808036',
                              },
                            }}
                            onClick={() => removeCapturedImage(index)}
                          >
                            <FaTrash
                              style={{
                                color: '#a73131',
                                fontSize: '12px',
                                marginTop: '35px !important',
                              }}
                            />
                          </Button>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Color Picker */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Typography
                                variant="body1"
                                style={{
                                  color: '#555',
                                  fontSize: '10px',
                                }}
                              >
                                BG Color
                              </Typography>
                              <input
                                type="color"
                                value={color[index]}
                                onChange={(e) => {
                                  handleColorChangeCaptured(e, index);
                                }}
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  borderRadius: '5px',
                                }}
                              />
                            </div>

                            {/* Submit Button */}
                            <LoadingButton
                              onClick={(e) => {
                                handleSubmitNew(index, 'captured');
                              }}
                              loading={bgbtnCaptured[index]}
                              variant="contained"
                              color="primary"
                              endIcon={<FormatColorFillIcon />}
                              sx={{
                                padding: '10px 10px',
                                fontSize: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderRadius: '5px',
                                color: isLightColorCaptured[index] ? 'black' : 'white',
                                fontWeight: '600',
                                backgroundColor: colorCaptured[index], // Dynamically set the background color
                                '&:hover': {
                                  backgroundColor: `${colorCaptured[index]}90`, // Slightly transparent on hover for a nice effect
                                },
                                border: '1px solid  black',
                              }}
                            ></LoadingButton>
                          </div>
                        </Grid>
                      </Grid>
                    </Grid>
                  ))
              }
              {refImage?.map((file, index) => (
                <Grid container key={index}>
                  <Grid item md={2} sm={2} xs={2}>
                    <Box
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {file?.type?.includes('image/') ? (
                        <img
                          src={file?.preview}
                          alt={file?.name}
                          height={50}
                          style={{
                            maxWidth: '-webkit-fill-available',
                          }}
                        />
                      ) : (
                        <img className={classes?.preview} src={getFileIcon(file?.name)} height="10" alt="file icon" />
                      )}
                    </Box>
                  </Grid>
                  <Grid
                    item
                    md={7}
                    sm={7}
                    xs={7}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle2"> {file?.name} </Typography>
                  </Grid>
                  <Grid item md={1} sm={1} xs={1}>
                    <Grid sx={{ display: 'flex' }}>
                      <Button
                        sx={{
                          padding: '14px 14px',
                          minWidth: '40px !important',
                          borderRadius: '50% !important',
                          ':hover': {
                            backgroundColor: '#80808036', // theme.palette.primary.main
                          },
                        }}
                        onClick={() => renderFilePreview(file)}
                      >
                        <VisibilityOutlinedIcon style={{ fontsize: '12px', color: '#357AE8' }} />
                      </Button>
                      <Button
                        sx={{
                          padding: '14px 14px',
                          minWidth: '40px !important',
                          borderRadius: '50% !important',
                          ':hover': {
                            backgroundColor: '#80808036', // theme.palette.primary.main
                          },
                        }}
                        onClick={() => handleDeleteFile(index)}
                      >
                        <FaTrash style={{ color: '#a73131', fontSize: '12px' }} />
                      </Button>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Color Picker */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Typography
                            variant="body1"
                            style={{
                              color: '#555',
                              fontSize: '10px',
                            }}
                          >
                            BG Color
                          </Typography>
                          <input
                            type="color"
                            value={color[index]}
                            onChange={(e) => {
                              handleColorChange(e, index);
                            }}
                            style={{
                              width: '30px',
                              height: '30px',
                              border: 'none',
                              cursor: 'pointer',
                              borderRadius: '5px',
                            }}
                          />
                        </div>

                        {/* Submit Button */}
                        <LoadingButton
                          onClick={(e) => {
                            handleSubmitNew(index, 'upload');
                          }}
                          loading={bgbtn[index]}
                          variant="contained"
                          color="primary"
                          endIcon={<FormatColorFillIcon />}
                          sx={{
                            padding: '10px 10px',
                            fontSize: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderRadius: '5px',
                            color: isLightColor[index] ? 'black' : 'white',
                            fontWeight: '600',
                            backgroundColor: color[index], // Dynamically set the background color
                            '&:hover': {
                              backgroundColor: `${color[index]}90`, // Slightly transparent on hover for a nice effect
                            },
                            border: '1px solid  black',
                          }}
                        ></LoadingButton>
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadOverAll} sx={buttonStyles.buttonsubmit}>
            Ok
          </Button>
          <Button onClick={resetImage} sx={buttonStyles.btncancel}>
            Reset
          </Button>
          <Button onClick={handleUploadPopupClose} sx={buttonStyles.btncancel}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* webcam alert start */}
      <Dialog open={isWebcamOpen} onClose={webcamClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="sm" fullWidth={true}>
        <DialogContent
          sx={{
            display: 'flex',
            justifyContent: 'center',
            textAlign: 'center',
            alignItems: 'center',
          }}
        >
          <Webcamimage
            name={name}
            getImg={getImg}
            setGetImg={setGetImg}
            valNum={valNum}
            setValNum={setValNum}
            capturedImages={capturedImages}
            setCapturedImages={setCapturedImages}
            setRefImage={setRefImage}
            setRefImageDrag={setRefImageDrag}
            setVendor={setVendor}
            vendor={vendor}
            handleCloseModEdit={handleCloseModEditProfileCheck}
            webcamCloseedit={webcamCloseedit}
            setNewimage={setNewimage}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="success" onClick={webcamDataStore}>
            OK
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              webcamClose();
              setCapturedImages([]);
            }}
          >
            CANCEL
          </Button>
        </DialogActions>
      </Dialog>

      {/* UPLOAD IMAGE DIALOG EDIT */}
      <Dialog open={uploadPopupOpenedit} onClose={handleUploadPopupCloseedit} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="md" sx={{ marginTop: '80px' }}>
        <DialogTitle id="customized-dialog-title1" sx={{ backgroundColor: '#e0e0e0', color: '#000', display: 'flex' }}>
          Upload Image Edit
        </DialogTitle>
        <DialogContent sx={{ minWidth: '750px', height: '850px' }}>
          <Grid container spacing={2}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Typography variant="body2" style={{ marginTop: '5px' }}>
                Max File size: 5MB
              </Typography>
              {/* {showDragField ? ( */}
              <div onDragOver={handleDragOveredit} onDrop={handleDropedit}>
                {previewURLedit && refImageDragedit?.length > 0 ? (
                  <>
                    {refImageDragedit.map((file, index) => (
                      <>
                        <img
                          src={file.preview}
                          alt={file.name}
                          style={{
                            maxWidth: '70px',
                            maxHeight: '70px',
                            marginTop: '10px',
                          }}
                        />
                        <Button onClick={() => handleRemoveFileedit(index)} style={{ marginTop: '0px', color: 'red' }}>
                          X
                        </Button>
                      </>
                    ))}
                  </>
                ) : (
                  <div
                    style={{
                      marginTop: '10px',
                      marginLeft: '0px',
                      border: '1px dashed #ccc',
                      padding: '0px',
                      width: '100%',
                      height: '150px',
                      display: 'flex',
                      alignContent: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', margin: '50px auto' }}>
                      <ContentCopyIcon /> Drag and drop
                    </div>
                  </div>
                )}
              </div>
              {/* ) : null} */}
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <br />
              <FormControl size="small" fullWidth>
                <Grid sx={{ display: 'flex' }}>
                  <Button variant="contained" component="label" sx={userStyle.uploadbtn}>
                    {' '}
                    Upload
                    <input type="file" multiple id="productimage" accept="image/*" hidden onChange={handleInputChangeedit} />
                  </Button>
                  &ensp;
                  <Button variant="contained" onClick={showWebcamedit} sx={userStyle.uploadbtn}>
                    Webcam
                  </Button>
                </Grid>
              </FormControl>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              {resultArray?.map((file, index) => (
                <>
                  <Grid container>
                    <Grid item md={2} sm={2} xs={2}>
                      <Box
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {file?.type?.includes('image/') ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            height={50}
                            style={{
                              maxWidth: '-webkit-fill-available',
                            }}
                          />
                        ) : (
                          <img className={classes.preview} src={getFileIcon(file.name)} height="10" alt="file icon" />
                        )}
                      </Box>
                    </Grid>
                    <Grid
                      item
                      md={8}
                      sm={8}
                      xs={8}
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="subtitle2"> {file.name} </Typography>
                    </Grid>
                    <Grid item md={1} sm={1} xs={1}>
                      <Grid sx={{ display: 'flex' }}>
                        <Button
                          sx={{
                            padding: '14px 14px',
                            minWidth: '40px !important',
                            borderRadius: '50% !important',
                            ':hover': {
                              backgroundColor: '#80808036', // theme.palette.primary.main
                            },
                          }}
                          onClick={() => renderFilePreviewedit(file)}
                        >
                          <VisibilityOutlinedIcon style={{ fontsize: '12px', color: '#357AE8' }} />
                        </Button>
                        <Button
                          sx={{
                            padding: '14px 14px',
                            minWidth: '40px !important',
                            borderRadius: '50% !important',
                            ':hover': {
                              backgroundColor: '#80808036', // theme.palette.primary.main
                            },
                          }}
                          onClick={() => {
                            handleDeleteFileedit(index);
                          }}
                        >
                          <FaTrash style={{ color: '#a73131', fontSize: '12px' }} />
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadOverAlledit} variant="contained">
            Ok
          </Button>
          <Button onClick={resetImageedit} sx={userStyle.btncancel}>
            Reset
          </Button>
          <Button onClick={handleUploadPopupCloseedit} sx={userStyle.btncancel}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* webcam alert start */}
      <Dialog open={isWebcamOpenedit} onClose={webcamCloseedit} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="sm" fullWidth={true}>
        <DialogContent
          sx={{
            display: 'flex',
            justifyContent: 'center',
            textAlign: 'center',
            alignItems: 'center',
          }}
        >
          <Webcamimage
            name={nameedit}
            getImgedit={getImgedit}
            setGetImgedit={setGetImgedit}
            valNumedit={valNumedit}
            setValNumedit={setValNumedit}
            capturedImagesedit={capturedImagesedit}
            setCapturedImagesedit={setCapturedImagesedit}
            setRefImageedit={setRefImageedit}
            setRefImageDragedit={setRefImageDragedit}
            handleCloseModEdit={handleCloseModEdit}
            webcamCloseedit={webcamCloseedit}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="success" onClick={webcamDataStoreedit}>
            OK
          </Button>
          <Button variant="contained" color="error" onClick={webcamCloseedit}>
            CANCEL
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isimgviewbill} onClose={handlecloseImgcodeviewbill} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="md" fullWidth>
        <DialogContent>
          <Typography variant="h6">Images</Typography>
          {getimgbillcode.map((imagefilebill, index) => (
            <Grid container key={index}>
              <Grid item md={6} sm={10} xs={10}>
                <img
                  src={imagefilebill.preview}
                  style={{
                    maxWidth: '70px',
                    maxHeight: '70px',
                    marginTop: '10px',
                  }}
                />
              </Grid>

              <Grid item md={4} sm={10} xs={10} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>{imagefilebill.name}</Typography>
              </Grid>
              <Grid item md={2} sm={2} xs={2}>
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

      <Box>
        {/* Edit DIALOG */}
        <Dialog open={isEditOpen} onClose={handleCloseModEdit} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="lg" fullWidth={true} sx={{ marginTop: '80px' }}>
          <Box sx={userStyle.dialogbox}>
            <>
              <Typography sx={userStyle.HeaderText}>
                {' '}
                <b>Existing Visitors List</b>
              </Typography>
              <Grid item md={6} sm={12} xs={12}>
                {existingUser && existingUser?.length > 0 ? (
                  <ExistingVisitor ExistingVisitors={existingUser} handleCloseModEdit={handleCloseModEditProfileCheck} />
                ) : (
                  <Typography sx={{ ...userStyle.HeaderText, marginLeft: '28px', display: 'flex', justifyContent: 'center' }}>There is no Visiter</Typography>
                )}
              </Grid>
              <br />
              <Grid item md={12} sm={12} xs={12}>
                <Grid
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '15px',
                  }}
                >
                  <Button sx={buttonStyles.btncancel} onClick={handleCloseModEditBack}>
                    Back
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>
      {/* Table For Duplicate Profile Upload */}
      <Box>
        {/* Edit DIALOG */}
        <Dialog open={isErrorOpenpop} onClose={handleCloseModEditProfileCheck} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="lg" fullWidth={true} sx={{ marginTop: '80px' }}>
          <Box sx={userStyle.dialogbox}>
            <>
              <Typography sx={userStyle.HeaderText}>
                {' '}
                <b>Existing Profile List</b>
              </Typography>
              <Grid item md={6} sm={12} xs={12}>
                {showDupProfileVIsitor && showDupProfileVIsitor?.length > 0 ? (
                  <ExistingProfileVisitor ExistingProfileVisitors={showDupProfileVIsitor} handleCloseModEdit={handleCloseModEditProfileCheck} />
                ) : (
                  <Typography sx={{ ...userStyle.HeaderText, marginLeft: '28px', display: 'flex', justifyContent: 'center' }}>There is No Profile</Typography>
                )}
              </Grid>
              <br />
              <Grid item md={12} sm={12} xs={12}>
                <Grid
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    gap: '15px',
                  }}
                >
                  {/* <Button
                    style={{
                      padding: "7px 13px",
                      color: "white",
                      background: "rgb(25, 118, 210)",
                      ...buttonStyles?.buttonsubmit
                    }}
                    onClick={() => {
                      // sendRequestEdit();
                      UploadWithDuplicate(uploadwithDupImage, "upload")
                    }}
                  >
                    Upload
                  </Button> */}
                  <Button sx={buttonStyles.btncancel} onClick={handleCloseerrpop}>
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>

      <Box>
        {/* Edit DIALOG */}
        <Dialog open={isErrorOpenpopdragdrop} onClose={handleCloseerrpopdragdrop} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="lg" fullWidth={true} sx={{ marginTop: '80px' }}>
          <Box sx={userStyle.dialogbox}>
            <>
              <Typography sx={userStyle.HeaderText}>
                {' '}
                <b>Existing Profile List</b>
              </Typography>
              <Grid item md={6} sm={12} xs={12}>
                {showAlertpopdragdrop && showAlertpopdragdrop?.length > 0 ? (
                  <ExistingProfileVisitor ExistingProfileVisitors={showAlertpopdragdrop} handleCloseModEdit={handleCloseModEditProfileCheck} />
                ) : (
                  <Typography sx={{ ...userStyle.HeaderText, marginLeft: '28px', display: 'flex', justifyContent: 'center' }}>There is No Profile</Typography>
                )}
              </Grid>
              <br />
              <Grid item md={12} sm={12} xs={12}>
                <Grid
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '15px',
                  }}
                >
                  {/* <Button
                    style={{
                      padding: "7px 13px",
                      color: "white",
                      background: "rgb(25, 118, 210)",
                      ...buttonStyles?.buttonsubmit
                    }}
                    onClick={() => {
                       sendRequestEdit();
                      UploadWithDuplicate(uploadwithDupImage, "dragdrop")
                    }}
                  >
                    Upload With Duplicate
                  </Button> */}
                  <Button sx={buttonStyles.btncancel} onClick={handleCloseerrpopdragdrop}>
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>
      <Box>
        <Dialog
          open={checkContactEmail}
          // onClose={handleCloseOpenCheckContact}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="md"
          PaperComponent={CustomPaper}
        >
          <Box sx={{ width: '350px' }}>
            {/* <DialogTitle id="alert-dialog-title">{popupTitle}</DialogTitle> */}
            <DialogContent>
              <DialogContentText
                id="alert-dialog-description"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '20px',
                }}
              >
                <InfoOutlinedIcon style={{ fontSize: '3.5rem', color: 'teal' }} />
                <Typography sx={{ fontSize: '1.4rem', fontWeight: '600', color: 'black' }}>{checkContactEmailMessage}</Typography>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseOpenCheckContact} variant="contained" color="success">
                Confirm
              </Button>
              <Button onClick={handleCloseOpenCheckContactMessage} variant="contained" color="primary">
                Change
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>

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
      <Box>
        <Dialog open={isTicketOpen} sx={{ marginTop: '50px' }} onClose={handleCloseTicket} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="lg" fullWidth={true}>
          <RaiseTicketRequestDocument handleCloseTicket={handleCloseTicket} buttonName={buttonName} sendRequest={sendRequest} attachmentFiles={uploadBillsRequestDocument} />
        </Dialog>
      </Box>
      <MessageAlert openPopup={openPopupMalert} handleClosePopup={handleClosePopupMalert} popupContent={popupContentMalert} popupSeverity={popupSeverityMalert} />
      {/* SUCCESS */}
      <AlertDialog openPopup={openPopup} handleClosePopup={handleClosePopup} popupContent={popupContent} popupSeverity={popupSeverity} />
      <LoadingBackdrop open={isLoading} />
    </Box>
  );
}
export default VisitorInformationMasterCreate;
