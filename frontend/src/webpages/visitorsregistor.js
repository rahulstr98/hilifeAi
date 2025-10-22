import { makeStyles } from '@material-ui/core';
import EastIcon from '@mui/icons-material/East';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WestIcon from '@mui/icons-material/West';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import LoadingButton from '@mui/lab/LoadingButton';
import { Backdrop, Box, Button, Checkbox, Dialog, DialogTitle, DialogActions, DialogContent, FormControl, FormControlLabel, FormGroup, GlobalStyles, Grid, MenuItem, OutlinedInput, Select, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { documentTypeOption, followUpActionOption, sourceVisitorOptions } from '../components/Componentkeyword';
import axios from '../axiosInstance';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as faceapi from 'face-api.js';
import 'jspdf-autotable';
import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import Selects from 'react-select';
import { v4 as uuidv4 } from 'uuid';
import csvIcon from '../components/Assets/CSV.png';
import excelIcon from '../components/Assets/excel-icon.png';
import fileIcon from '../components/Assets/file-icons.png';
import pdfIcon from '../components/Assets/pdf-icon.png';
import wordIcon from '../components/Assets/word-icon.png';
import Footer from '../components/footer/footer.js';
import { SERVICE } from '../services/Baseservice';
import ExistingProfileVisitor from './ExisitingprofileVisitorsregistration.js';
import Webcamimage from './ExistingWebcamprofileVisitorregistration.js';
import numberone from './images/one.png';
import FullAddressCard from '../components/FullAddressCard.js';
import numberonenew from './images/onenew.png';
import MessageAlert from '../components/MessageAlert';
import AlertDialog from '../components/Alert';
import numberthree from './images/three.png';
import numberthreenew from './images/threenew.png';
import numbertwo from './images/two.png';
import numbertwonew from './images/twonew.png';
import wave from './images/waving.png';
import uploadconfetti from './images/wired-flat-1103-confetti.gif';
import './visitors.css';
import { userStyle } from './visitorstyle.js';
import { Country, State, City } from 'country-state-city';
import { address_type, permanent_address_type, personal_prefix, landmark_and_positional_prefix } from '../components/Componentkeyword';
import PincodeButton from '../components/PincodeButton.js';
import DialogContentText from '@mui/material/DialogContentText';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import BiometricVisitorAddition from '../components/BiometricVisitorAddition.js';

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

const severityIcons = {
  success: <CheckCircleOutlineIcon style={{ fontSize: '3.5rem', color: 'green' }} />,
  info: <InfoOutlinedIcon style={{ fontSize: '3.5rem', color: 'teal' }} />,
  warning: <ErrorOutlineOutlinedIcon style={{ fontSize: '3.5rem', color: 'orange' }} />,
  error: <ErrorOutlineOutlinedIcon style={{ fontSize: '3.5rem', color: 'red' }} />,
};

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

function calculateLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Calculate luminance using the formula
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // If luminance is greater than 128, it's a light color
  return luminance > 128;
}

function Visitorsregister() {
  const [overallSettings, setOverAllsettingsCount] = useState({});
  const [newimageNew, setNewimageNew] = useState([]);
  const [colorDrag, setColorDrag] = useState([]);
  const [bgbtnDrag, setBgbtnDrag] = useState([]);
  const [capturedImage, setCapturedImage] = useState([]);

  const [selectedCountryp, setSelectedCountryp] = useState(Country.getAllCountries().find((country) => country.name === 'India'));
  const [selectedStatep, setSelectedStatep] = useState(State.getStatesOfCountry(selectedCountryp?.isoCode).find((state) => state.name === 'Tamil Nadu'));
  const [selectedCityp, setSelectedCityp] = useState(City.getCitiesOfState(selectedStatep?.countryCode, selectedStatep?.isoCode).find((city) => city.name === 'Tiruchirappalli'));
  //current Address
  const [selectedCountryc, setSelectedCountryc] = useState(Country.getAllCountries().find((country) => country.name === 'India'));
  const [selectedStatec, setSelectedStatec] = useState(State.getStatesOfCountry(selectedCountryc?.isoCode).find((state) => state.name === 'Tamil Nadu'));
  const [selectedCityc, setSelectedCityc] = useState(City.getCitiesOfState(selectedStatec?.countryCode, selectedStatec?.isoCode).find((city) => city.name === 'Tiruchirappalli'));

  const [overllsettings, setOverallsettings] = useState([]);

  const fetchOverAllSettings = async () => {
    try {
      let res = await axios.get(`${SERVICE.GET_LOGOOVERALL_SETTINGS}`);
      setOverAllsettingsCount(res?.data?.overallsettings[0]);
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      } else {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{'something went wrong!'}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };

  useEffect(() => {
    fetchOverAllSettings();
  }, []);

  const handlechangeppincode = (e) => {
    const regex = /^[0-9]+$/;
    const inputValue = e.target.value?.slice(0, 6);
    if (regex.test(inputValue) || inputValue === '') {
      setVendor({ ...vendor, ppincode: inputValue });
    }
  };

  const handlechangecpincode = (e) => {
    const inputValue = e.target.value;

    // Only allow digits (0-9) and empty string, max 6 digits
    if (inputValue === '' || (/^\d+$/.test(inputValue) && inputValue?.length <= 6)) {
      setVendor({ ...vendor, cpincode: inputValue });
    }
  };

  const [switchValues, setSwicthValues] = useState({
    pvillageorcity: false,
    cvillageorcity: false,
  });

  const [fromPinCodep, setFromPinCodep] = useState([]);
  const [fromPinCodec, setFromPinCodec] = useState([]);

  const handleLocationSuccessp = (postOffices) => {
    console.log('Success:', postOffices);

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
    console.log('Success:', postOffices);

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

  const [uploadBills, setUploadBills] = useState([]);
  const [billUploadedFiles, setBillUploadedFiles] = useState([]);

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

  const renderFilePreviewMulterUploaded = async (file) => {
    if (!file) return false;
    const imageUrl = `${SERVICE.VEIW_VISITOR_FILES}/${file.filename}`;
    window.open(imageUrl, '_blank'); // Open image in a new tab
  };

  const [isLightColor, setIsLightColor] = useState([]);
  const [isExistVisitor, setIsExistVisitor] = useState(false);
  const [refImagePerImage, setRefImagePerImage] = useState([]);

  const [visitorLogData, setVisitorLogData] = useState([]);
  const [uploadwithDupImage, setUploadwithDupImage] = useState([]);

  const [isErrorOpenpopdragdrop, setIsErrorOpenpopdragdrop] = useState(false);
  const [showAlertpopdragdrop, setShowAlertpopdragdrop] = useState();
  const handleClickOpenerrpopdragdrop = () => {
    setIsErrorOpenpopdragdrop(true);
  };
  const handleCloseerrpopdragdrop = () => {
    setIsErrorOpenpopdragdrop(false);
  };

  const [color, setColor] = useState([]);
  const [bgbtn, setBgbtn] = useState([]);
  const [colorCaptured, setColorCaptured] = useState([]);
  const [bgbtnCaptured, setBgbtnCaptured] = useState([]);
  const [isLightColorCaptured, setIsLightColorCaptured] = useState([]);
  const isLightColorDrag = calculateLuminance(colorDrag);

  const fetchOverAllSettingsnew = async () => {
    try {
      let res = await axios.get(SERVICE.GET_OVERALL_SETTINGS, {
        // headers: {
        //   Authorization: `Bearer ${auth.APIToken}`,
        // },
      });
      let lastobj = res?.data?.overallsettings?.length > 0 ? res?.data?.overallsettings?.at(-1) : {};
      setOverallsettings(lastobj);
      setColor([lastobj?.backgroundcolour || '#FFFFFF']);
      setColorDrag([lastobj?.backgroundcolour || '#FFFFFF']);

      let lastObject = res?.data?.overallsettings[res?.data?.overallsettings?.length - 1];
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      } else {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{'something went wrong!'}</p>
          </>
        );
        handleClickOpenerr();
      }
      // handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchOverAllSettingsnew();
  }, []);

  const handleSubmitNew = async (index, from) => {
    if (index === undefined || index < 0) {
      console.error('Invalid index provided.');
      return;
    }
    console.log(index, image, 'indexcklsfj');

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

  const handleSubmitDrag = async (index, from) => {
    if (index === undefined || index < 0) {
      console.error('Invalid index provided.');
      return;
    }
    console.log(index, image, 'indexcklsfj');

    setBgbtnDrag((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });

    const selectedImage = imageDrag[index];
    const selectedColor = colorDrag[index];

    if (!selectedImage || !selectedColor) {
      console.error('Image or color not provided.');
      // Reset the button states in case of an error.

      setBgbtnDrag((prev) => {
        const newState = [...prev];
        newState[index] = false;
        return newState;
      });

      return;
    }

    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('color', selectedColor);

    try {
      const response = await axios.post(SERVICE.REMOVEBG, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setRefImageDrag((prev) => {
        let updated = [...prev];
        let currentObject = {
          ...updated[index],
          preview: `${response?.data?.image}`,
        };
        updated[index] = currentObject;
        return updated;
      });
      setBgbtnDrag((prev) => {
        const newState = [...prev];
        newState[index] = false;
        return newState;
      });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      // Reset button states after the operation, regardless of success or failure.
      setBgbtnDrag((prev) => {
        const newState = [...prev];
        newState[index] = false;
        return newState;
      });
    }
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
  const [vendor, setVendor] = useState({
    company: 'Please Select Company',
    branch: 'Please Select Branch',
    unit: 'Please Select Unit',
    visitortype: 'Please Select Visitor Type',
    visitormode: 'Please Select Visitor Mode',
    date: '',
    prefix: 'Mr',
    firstname: '',
    lastname: '',
    email: '',
    mobile: '',
    whatsapp: '',
    hostname: 'Please Select HostName',
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
    phonecheck: false,
    followupaction: 'Please Select Follow Up Action',
    followupdate: '',
    followuptime: '',
    visitorbadge: '',
    visitorsurvey: '',

    //newdetails
    addesstype: 'Home',
    personalprefix: '',
    referencename: '',
    landmarkpositionprefix: '',
    landmarkname: '',
    houseflatnumber: '',
    streetroadname: '',
    localityareaname: '',
    pbuildingapartmentname: '',
    paddressone: '',
    paddresstwo: '',
    paddressthree: '',
    caddressone: '',
    caddresstwo: '',
    caddressthree: '',
    cbuildingapartmentname: '',
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

  const handleCloseModEdit = async (e, reason) => {
    setIsExistVisitor(true);
    setRefImagePerImage(e?.files);

    if (reason === 'webcam') {
      console.log('Exisiting Visitor');
    } else {
      setVendor({
        ...vendor,
        company: e.company,
        branch: e.branch,
        unit: e.unit,
        visitortype: e.visitortype,
        visitormode: e.visitormode,
        prefix: 'Mr',
        firstname: e.visitorfirstname || e.visitorname,
        lastname: e.visitorlastname || '',
        email: e.visitoremail,
        mobile: e.visitorcontactnumber,
        visitorpurpose: e.visitorpurpose,
        hostname: e.meetingpersonemployeename,
        whatsapp: e.visitorwhatsapp || '',
        visitorid: e.visitorid,
        visitorcommonid: e.visitorcommonid,
        _id: e._id,
        faceDescriptor: e.faceDescriptor,
      });
      fetchInteractorPurpose(e.visitortype);
      fetchallEmployee(e.visitortype);
      setRefImage(newimage);
      // fetchInteractorPurpose(e.visitortype);
    }

    if (reason && reason === 'backdropClick') return;
    handleCloseerrpop();

    let res = await axios.get(`${SERVICE.VISITORDETAILS_LOG_SINGLE}/${encodeURIComponent(e?.visitorid)}`, {
      // headers: {
      //   Authorization: `Bearer ${auth.APIToken}`,
      // },
    });

    setVisitorLogData(res?.data?.svisitordetailslog);

    setTimeout(() => {
      setNewimage('');
    }, 1000);
  };

  const handleColorChangeDrag = (e, index) => {
    // setColorDrag(e.target.value);

    setColorDrag((prev) => {
      let allColors = [...prev];
      allColors[index] = e.target.value;
      const updated = allColors.map((color) => calculateLuminance(color));

      // Update the state for color and light color
      setIsLightColor(updated);
      return allColors;
    });
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

  const [isLoading, setIsLoading] = useState(false);
  const [btnUpload, setBtnUpload] = useState(false);
  const [newimage, setNewimage] = useState([]);
  const [showDupProfileVIsitor, setShowDupProfileVIsitor] = useState();

  const [isErrorOpenpop, setIsErrorOpenpop] = useState(false);
  const handleClickOpenerrpop = () => {
    setIsErrorOpenpop(true);
  };
  const handleCloseerrpop = () => {
    setIsErrorOpenpop(false);
  };

  const classes = useStyles();

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

  const handleCloseModEditProfileCheck = async (e, reason) => {
    setIsExistVisitor(true);
    setImage([]);
    if (reason && reason === 'backdropClick') return;
    let url = `${SERVICE.VISITORDETAILS_LOG_SINGLE_PROFILE}/${encodeURIComponent(e?.visitorid)}`;
    let resVisitor = await axios.get(url, {
      // headers: {
      //   Authorization: `Bearer ${auth.APIToken}`,
      // },
    });

    const file = resVisitor?.data?.svisitordetailslog?.slice(-1)[0]?.files || [];
    if (file?.length > 0) {
      // Create a Blob from the binary data
      const base64Data = file[0].preview?.split(',')[1]; // Get base64 data (without the prefix)
      const binaryData = atob(base64Data); // Decode base64 data
      const arrayBuffer = new ArrayBuffer(binaryData.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }
      const blob = new Blob([uint8Array], { type: 'image/png' });
      setImage((prev) => [...prev, blob]);
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
            const file = new File([blob], 'file.png', { type: blob.type });

            // Update the state with the new File or Blob
            setImage((prev) => [...prev, file]); // or use `blob` if you don't need a File object
          })
          .catch((error) => {
            console.error('Error fetching Blob data:', error);
          });
      } else {
        console.error('Invalid or missing preview URL');
      }
      setRefImage(newimageNew);
    }

    setRefImage(newimage || e?.files);
    setRefImagePerImage(e?.files);

    handleCloseerrpop();
    handleCloseerrpopdragdrop();
    webcamClose();

    let res = await axios.get(`${SERVICE.VISITORDETAILS_LOG_SINGLE}/${encodeURIComponent(e?.visitorid)}`, {
      // headers: {
      //   Authorization: `Bearer ${auth.APIToken}`,
      // },
    });

    setVisitorLogData(res?.data?.svisitordetailslog);

    setTimeout(() => {
      setNewimage('');
    }, 1000);
  };

  const [loadingdeloverall, setloadingdeloverall] = useState(false);

  const [visitorsTypeOption, setVisitorsTypeOption] = useState([]);
  const [visitorsPurposeOption, setVisitorsPurposeOption] = useState([]);

  const handleValidationfirstname = (e) => {
    let val = e.target.value;
    let numbers = new RegExp('[0-9]');
    var regExSpecialChar = /[ `₹!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (e.target.value.match(numbers)) {
      setShowAlert('Please enter characters only! (A-Z or a-z)');
      handleClickOpenerr();
      let num = val.length;
      let value = val.slice(0, num - 1);
      setVendor((prevState) => {
        return { ...prevState, firstname: value };
      });
    } else if (regExSpecialChar.test(e.target.value)) {
      setShowAlert('Please enter characters only! (A-Z or a-z)');
      handleClickOpenerr();
      let num = val.length;
      let value = val.slice(0, num - 1);
      setVendor((prevState) => {
        return { ...prevState, firstname: value };
      });
    }
  };

  const handleValidationlastname = (e) => {
    let val = e.target.value;
    let numbers = new RegExp('[0-9]');
    var regExSpecialChar = /[ `₹!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (e.target.value.match(numbers)) {
      setShowAlert('Please enter characters only! (A-Z or a-z)');
      handleClickOpenerr();
      let num = val.length;
      let value = val.slice(0, num - 1);
      setVendor((prevState) => {
        return { ...prevState, lastname: value };
      });
    } else if (regExSpecialChar.test(e.target.value)) {
      setShowAlert('Please enter characters only! (A-Z or a-z)');
      handleClickOpenerr();
      let num = val.length;
      let value = val.slice(0, num - 1);
      setVendor((prevState) => {
        return { ...prevState, lastname: value };
      });
    }
  };

  const [image, setImage] = useState([]);

  const [refImage, setRefImage] = useState([]);
  const [previewURL, setPreviewURL] = useState(null);
  const [refImageDrag, setRefImageDrag] = useState([]);
  const [valNum, setValNum] = useState(0);

  const getPhoneNumber = () => {
    if (vendor.phonecheck) {
      setVendor({ ...vendor, whatsapp: vendor.mobile });
    } else {
      setVendor({ ...vendor, whatsapp: '' });
    }
  };

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

  const [file, setFile] = useState('');

  useEffect(() => {
    getPhoneNumber();
  }, [vendor.phonecheck]);

  //webcam
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [imageDrag, setImageDrag] = useState([]);
  const [getImg, setGetImg] = useState(null);
  const [isWebcamCapture, setIsWebcamCapture] = useState(false);

  useEffect(() => {
    if (!capturedImages) return;

    const newBlobs = [];
    const newBgbtnCaptured = [];
    const newColors = [];

    capturedImages.forEach((item) => {
      if (!item?.preview) return;

      const base64Data = item.preview.split(',')[1]; // Extract base64 data
      const binaryData = atob(base64Data); // Decode base64 data
      const uint8Array = new Uint8Array(binaryData.length);

      // Fill the array buffer with the decoded binary data
      for (let i = 0; i < binaryData.length; i++) {
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
    setCapturedImage((prev) => [...prev, ...newBlobs]);
    setBgbtnCaptured((prev) => [...prev, ...newBgbtnCaptured]);

    // Calculate luminance for the new colors
    const luminanceValues = newColors.map((color) => calculateLuminance(color));
    setColorCaptured((prev) => [...prev, ...newColors]);
    setIsLightColorCaptured((prev) => [...prev, ...luminanceValues]);
  }, [capturedImages]);

  const webcamOpen = () => {
    setIsWebcamOpen(true);
  };
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
    setGetImg('');
    setRefImage([]);
    setPreviewURL(null);
    setRefImageDrag([]);
    setCapturedImages([]);
    setColorDrag([]);
    setColor([]);
  };

  const [buttonLoad, setButtonLoad] = useState(false);

  const backPage = useNavigate();

  const [educationDetails, setEducationDetails] = useState({
    school: '',
    department: '',
    degree: '',
    fromduration: '',
    toduration: '',
    pursuing: false,
  });
  const [educationtodo, setEducationtodo] = useState([]);

  const [experienceDetails, setExperienceDetails] = useState({
    occupation: '',
    company: '',
    summary: '',
    fromduration: '',
    toduration: '',
    currentlyworkhere: false,
  });
  const [experiencetodo, setExperiencetodo] = useState([]);

  const [cateCode, setCatCode] = useState([]);
  const [errors, setErrors] = useState({});
  const [vendorArray, setVendorArray] = useState([]);

  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();

  const formatDateString = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // const username = isUserRoleAccess.username;

  const handleMobile = (e) => {
    if (e.length > 10) {
      setShowAlert("Mobile number can't more than 10 characters!");
      handleClickOpenerr();
      let num = e.slice(0, 10);
      setVendor({ ...vendor, mobile: num });
    }
  };

  const handleWhatsapp = (e) => {
    if (e.length > 10) {
      setShowAlert("Whats app number can't more than 10 characters!");
      handleClickOpenerr();
      let num = e.slice(0, 10);
      setVendor({ ...vendor, whatsapp: num });
    }
  };

  // Error Popup model
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
    setButtonLoad(false);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
    setShowAlert('');
    setloadingdeloverall(false);
  };

  const fetchInteractorType = async () => {
    try {
      let res_freq = await axios.get(SERVICE.ALL_MANAGETYPEPG, {
        // headers: {
        //   Authorization: `Bearer ${auth.APIToken}`,
        // },
      });
      setVisitorsTypeOption(
        res_freq?.data?.manageTypePG.map((t) => ({
          ...t,
          label: t.interactorstype,
          value: t.interactorstype,
        }))
      );
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      } else {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{'something1 went wrong!'}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };
  const [assigninterview, setAssigninterview] = useState([]);

  const [checkCandTrue, setCheckCandTrue] = useState();

  const fetchInteractorPurpose = async (e) => {
    try {
      let res = await axios.get(SERVICE.ALL_MANAGETYPEPG, {
        // headers: {
        //   Authorization: `Bearer ${auth.APIToken}`,
        // },
      });

      let result = res.data.manageTypePG.filter((d) => d.interactorstype === e);

      let ans = result.flatMap((data) => data.interactorspurpose);
      // setCheckCandTrue(result.addcandidate == true ? result.addcandidate == true : ""
      // )
      const hasAddCandidate = result.some((item) => item.addcandidate === true);
      setCheckCandTrue(hasAddCandidate);

      setVisitorsPurposeOption(
        ans.map((d) => ({
          ...d,
          label: d,
          value: d,
        }))
      );
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon style={{ fontSize: '100px', color: 'orange' }} />
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      } else {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon style={{ fontSize: '100px', color: 'orange' }} />
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{'something2  went wrong!'}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };
  useEffect(() => {
    fetchInteractorType();
  }, []);

  const [filterdemployee, setFilteredEmployee] = useState([]);
  const { company, branch, unit } = useParams();

  const fetchallEmployee = async (type) => {
    try {
      if (type.toLowerCase().includes('interview') && !type.toLowerCase().includes(' ')) {
        let res = await axios.post(SERVICE.ASSIGN_INTERVIEWER_VISITOR, {
          type: 'Interviewer',
          fromcompany: company,
          frombranch: branch,
        });

        let filteruser = res.data.assigninterview.map((item) => ({
          employee: item.employee ? item.employee?.toString() : '',
          unit: item.fromunit ? item.fromunit?.toString() : '',
        }));

        filteruser = filteruser.map((d) => ({
          ...d,
          label: d?.employee,
          value: d?.employee,
          unit: d.unit,
        }));

        setFilteredEmployee([...new Set(filteruser)]);
      } else if (type.toLowerCase().includes('hiring manager')) {
        // console.log(type.toLowerCase().includes("hiring manager"), "check")
        let res = await axios.post(SERVICE.ASSIGN_INTERVIEWER_VISITOR, {
          type: 'Hiring Manager',
          fromcompany: company,
          frombranch: branch,
        });

        let filteruser = res.data.assigninterview.map((item) => ({
          employee: item.employee?.toString(),
          unit: item.fromunit.toString(),
        }));

        filteruser = filteruser.map((d) => ({
          ...d,
          label: d?.employee,
          value: d?.employee,
          unit: d.unit,
        }));

        setFilteredEmployee([...new Set(filteruser)]);
      } else {
        let res = await axios.post(SERVICE.USER_VISITOR_REGISTER, {
          company: company,
          branch: branch,
          // unit: unit
        });

        let filteruser = res.data.users.map((d) => ({
          ...d,
          label: d.companyname,
          value: d.companyname,
          unit: d.unit,
        }));
        setFilteredEmployee([...new Set(filteruser)]);
      }
    } catch (err) {
      console.log(err, 'error');
    }
  };

  const fetchVendor = async () => {
    try {
      let res_vendor = await axios.get(SERVICE.ALL_VISITORS_FILTEREDID, {
        // headers: {
        //   Authorization: `Bearer ${auth.APIToken}`,
        // },
      });
      // setVendormaster(res_vendor?.data?.visitors);

      setCatCode(res_vendor?.data?.visitors);
      // setVendorArray(res_vendor?.data?.visitors);
    } catch (err) {
      console.log(err, 'err015');
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            {' '}
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} /> <p style={{ fontSize: '20px', fontWeight: 900 }}>{messages}</p>{' '}
          </>
        );
        handleClickOpenerr();
      } else {
        handleClickOpenerr();
      }
    }
  };
  useEffect(() => {
    fetchallEmployee('host');
    fetchVendor();
  }, []);

  let name = 'create';
  let nameedit = 'edit';
  let allUploadedFiles = [];

  let newval = 'VISIT#0001';

  let today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();

  const formattedToday = `${yyyy}-${mm}-${dd}`;
  let now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  let currtime = `${hours}:${minutes}`;

  const [allvisitor, setAllVisitor] = useState([]);
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);

  const [olduniqueid, setOldUnique] = useState(0);

  const fetchAssignedBy = async () => {
    try {
      let res_vendor = await axios.get(SERVICE.CANDIDATESALLCOUNT, {
        // headers: {
        //   Authorization: `Bearer ${auth.APIToken}`,
        // },
      });
      setOldUnique(res_vendor?.data?.candidates);
    } catch (err) {
      setButtonLoad(false);
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            {' '}
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} /> <p style={{ fontSize: '20px', fontWeight: 900 }}>{messages}</p>{' '}
          </>
        );
        handleClickOpenerr();
      } else {
        handleClickOpenerr();
      }
    }
  };

  const fetchAllVisitors = async () => {
    try {
      let res_vendor = await axios.get(SERVICE.ALL_VISITORS_REGISTER, {
        // headers: {
        //   Authorization: `Bearer ${auth.APIToken}`,
        // },
      });
      setAllVisitor(res_vendor?.data?.visitors);
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            {' '}
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} /> <p style={{ fontSize: '20px', fontWeight: 900 }}>{messages}</p>{' '}
          </>
        );
        handleClickOpenerr();
      } else {
        handleClickOpenerr();
      }
    }
  };

  const fetchUnits = async () => {
    try {
      let res_unit = await axios.get(SERVICE.UNIT, {});
      setUnits(res_unit?.data?.units);
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      } else {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{'something went wrong!'}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };

  useEffect(() => {
    const matchedUnits = units.filter((unit) => unit.company === company && unit.branch === branch).map((unit) => unit.name);

    setFilteredUnits(matchedUnits);
  }, [filteredUnits]);

  useEffect(() => {
    fetchAssignedBy();
    fetchAllVisitors();
    fetchUnits();
  }, []);

  const [visitorCode, setVisitorCode] = useState('VISIT#0001');

  const fetchLastindexVendor = async () => {
    try {
      let res_vendor = await axios.get(SERVICE.LASTINDEX_VISITORS, {
        // headers: {
        //   Authorization: `Bearer ${auth.APIToken}`,
        // },
      });
      let refNo = res_vendor?.data?.visitor?.visitorid;
      let codenum = refNo.split('#');
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

      let newval = 'VISIT#' + postfixLength;
      setVisitorCode(newval);

      return newval;
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
        } else {
          handleClickOpenerr();
        }
      }
    }
  };

  let uniqueid = olduniqueid ? Number(olduniqueid?.unique) : 0;
  let idfinal = Number(uniqueid) + 1;

  const sendRequest = async (type, index) => {
    try {
      setloadingdeloverall(true);

      let formData = new FormData();

      if (uploadBills?.length > 0) {
        uploadBills.forEach((item) => {
          formData.append('visitordocument', item.file); // `files` is the key for multiple files
        });
      }
      const uniqueid = uuidv4();

      const jsonData = {
        checkout: false,
        unique: Number(idfinal),
        company: String(company),
        branch: String(branch),
        unit: String(vendor.unit),
        visitorid: String(newval),
        visitorcommonid: isExistVisitor ? vendor?.visitorcommonid : uniqueid,
        visitortype: String(vendor.visitortype),
        visitormode: 'Walk-In',

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
        pbuildingapartmentname: String(vendor?.pbuildingapartmentname || ''),
        paddressone: String(vendor?.paddressone || ''),
        paddresstwo: String(vendor?.paddresstwo || ''),
        paddressthree: String(vendor?.paddressthree || ''),

        caddressone: !vendor.samesprmnt ? String(vendor?.caddressone || '') : String(vendor?.paddressone || ''),
        caddresstwo: !vendor.samesprmnt ? String(vendor?.caddresstwo || '') : String(vendor?.paddresstwo || ''),
        caddressthree: !vendor.samesprmnt ? String(vendor?.caddressthree || '') : String(vendor?.paddressthree || ''),
        cbuildingapartmentname: !vendor.samesprmnt ? String(vendor?.cbuildingapartmentname || '') : String(vendor?.pbuildingapartmentname || ''),
        addcandidate: true,
        date: String(formattedToday),
        prefix: String(vendor.prefix),
        visitorname: String(vendor.firstname + ' ' + vendor.lastname),
        visitorfirstname: String(vendor.firstname),
        visitorlastname: String(vendor.lastname),
        visitorwhatsapp: String(vendor.whatsapp),
        visitorphonecheck: Boolean(vendor.phonecheck),
        intime: String(currtime),
        visitorpurpose: String(vendor.visitorpurpose),
        visitorcontactnumber: String(vendor.mobile),
        visitoremail: String(vendor.email),
        visitorcompnayname: '',
        documenttype: '',
        addvisitorin: Boolean(true),
        faceDescriptor: vendor?.faceDescriptor?.length > 0 ? vendor?.faceDescriptor : [],
        documentnumber: '',
        meetingdetails: true,
        meetingpersoncompany: String(company),
        meetingpersonbranch: branch,
        meetingpersonunit: vendor.unit,
        meetingpersondepartment: '',
        meetingpersonteam: '',
        meetingpersonemployeename: '',
        meetinglocationcompany: company,
        meetinglocationbranch: branch,
        meetinglocationunit: vendor.unit,
        meetinglocationfloor: '',
        meetinglocationarea: '',
        escortinformation: true,
        escortdetails: '',
        equipmentborrowed: '',
        outtime: '',
        remark: '',
        followupaction: '',
        followupdate: '',
        followuptime: '',
        visitorbadge: '',
        visitorsurvey: '',
        detailsaddedy: String('Self /' + vendor.firstname + ' ' + vendor.lastname),
        files: allUploadedFiles.concat(refImage, refImageDrag, capturedImages),
        followuparray: [
          {
            pgenerateviapincode: Boolean(vendor?.pgenerateviapincode || false),
            pvillageorcity: String(vendor?.pvillageorcity || ''),
            pdistrict: String(vendor?.pdistrict || ''),
            cgenerateviapincode: !vendor.samesprmnt ? Boolean(vendor?.cgenerateviapincode || false) : Boolean(vendor?.pgenerateviapincode || false),
            cvillageorcity: !vendor.samesprmnt ? String(vendor?.cvillageorcity || '') : String(vendor?.pvillageorcity || ''),
            cdistrict: !vendor.samesprmnt ? String(vendor?.cdistrict || '') : String(vendor?.pdistrict || ''),
            //Newvalue
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
            visitortype: String(vendor.visitortype),
            visitormode: 'Walk-In',
            visitorpurpose: String(vendor.visitorpurpose),
            meetingdetails: true,
            intime: String(currtime),
            pbuildingapartmentname: String(vendor?.pbuildingapartmentname || ''),
            paddressone: String(vendor?.paddressone || ''),
            paddresstwo: String(vendor?.paddresstwo || ''),
            paddressthree: String(vendor?.paddressthree || ''),

            caddressone: !vendor.samesprmnt ? String(vendor?.caddressone || '') : String(vendor?.paddressone || ''),
            caddresstwo: !vendor.samesprmnt ? String(vendor?.caddresstwo || '') : String(vendor?.paddresstwo || ''),
            caddressthree: !vendor.samesprmnt ? String(vendor?.caddressthree || '') : String(vendor?.paddressthree || ''),
            cbuildingapartmentname: !vendor.samesprmnt ? String(vendor?.cbuildingapartmentname || '') : String(vendor?.pbuildingapartmentname || ''),
            meetingpersoncompany: String(company),
            meetingpersonbranch: String(branch),
            meetingpersonunit: vendor.unit,
            meetingpersondepartment: '',
            meetingpersonteam: '',
            meetingpersonemployeename: '',

            meetinglocationcompany: String(company),
            meetinglocationbranch: String(branch),
            meetinglocationunit: vendor.unit,
            meetinglocationfloor: '',
            meetinglocationarea: '',
            escortinformation: true,
            escortdetails: '',
            equipmentborrowed: '',
            outtime: '',
            remark: '',
            followupaction: '',
            followupdate: '',
            followuptime: '',
            visitorbadge: '',
            visitorsurvey: '',
          },
        ],
        interactorstatus: String('visitor'),
        addedby: [{ name: String(vendor.firstname), date: String(new Date()) }],
      };

      formData.append('jsonData', JSON.stringify(jsonData));
      let addVendorDetails = await axios.post(SERVICE.CREATE_VISITORS, formData, {});
      const filesImages = allUploadedFiles.concat(refImage, refImageDrag, capturedImages);
      const visitorInfoDetails = await BiometricVisitorAddition({
        company: String(company),
        branch: String(branch),
        name: String(vendor.firstname + '' + vendor.lastname),
        photo: filesImages[0]?.base64,
        date: Boolean(vendor.isinterviewnow) ? formattedToday : vendor.interviewpreferedate ? vendor.interviewpreferedate : formattedToday,
      });
      const resdata = (await fetchLastindexVendor()) || 'VISIT#0001';

      let addVisitorProfileDetail = await axios.post(SERVICE.VISITORDETAILS_LOG_CREATE, {
        // headers: {
        //   Authorization: `Bearer ${auth.APIToken}`,
        // },
        visitorname: String(vendor.firstname + ' ' + vendor.lastname),
        visitorcontactnumber: String(vendor.mobile),
        visitoremail: String(vendor.email),
        materialcarrying: [],
        visitorcommonid: isExistVisitor ? vendor?.visitorcommonid : uniqueid,
        files: allUploadedFiles.concat(refImage, refImageDrag, capturedImages),
        addedby: [
          {
            name: String(vendor.firstname),
            date: String(new Date()),
          },
        ],
      });
      if (checkCandTrue) {
        fetchAssignedBy();
        backPage(`/addcandidates/${idfinal}`);
        // window.location.href = `/addcandidates/${idfinal}`;
      } else {
        nextStep();

        setTimeout(() => {
          backPage(`/Checkinvisitor/${company}/${branch}`);
        }, 3000);
      }

      // }
      setVendor({
        ...vendor,
        visitorname: '',
        intime: '',
        visitorcontactnumber: '',
        visitoremail: '',
        visitorcompnayname: '',
        documentnumber: '',
        meetingdetails: true,
        escortinformation: true,
        escortdetails: '',
        equipmentborrowed: '',
        outtime: '',
        remark: '',
        followupdate: '',
        followuptime: '',
        visitorbadge: '',
        visitorsurvey: '',
      });
      setloadingdeloverall(false);
      setVisitorLogData([]);
      setIsExistVisitor(false);

      // setShowAlert(
      //   <>
      //     <CheckCircleOutlineIcon
      //       sx={{ fontSize: "100px", color: "#7ac767" }}
      //     />
      //     <p style={{ fontSize: "20px", fontWeight: 900 }}>
      //       {"Added Successfully 👍"}
      //     </p>
      //   </>
      // );
      // handleClickOpenerr();
    } catch (err) {
      console.log(err, '588');
      setButtonLoad(false);
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            {' '}
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} /> <p style={{ fontSize: '20px', fontWeight: 900 }}>{messages}</p>{' '}
          </>
        );
        handleClickOpenerr();
      } else {
        handleClickOpenerr();
      }
    }
  };

  function isValidEmail(email) {
    // Regular expression for a simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const stepOne = () => {
    // if (refImage?.length === 0) {
    //   setShowAlert('Please Upload Photograph');
    //   handleClickOpenerr();
    //   // setPopupContentMalert("Please Upload Photograph!");
    //   // setPopupSeverityMalert("info");
    //   // handleClickOpenPopupMalert();
    // }
    if (vendor.firstname == '') {
      setShowAlert('Please Enter First Name');
      handleClickOpenerr();
    } else if (!isExistVisitor && vendor.lastname == '') {
      setShowAlert('Please Enter Last Name');
      handleClickOpenerr();
    } else if (vendor.email == '') {
      setShowAlert('Please Enter Email');
      handleClickOpenerr();
    } else if (!isValidEmail(vendor.email) && vendor.email != '') {
      setShowAlert(
        <>
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Enter  Valid Email'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (vendor.documenttype === '' || vendor.documenttype === 'Please Select Document Type' || !vendor.documenttype) {
      setShowAlert('Please Select Document Type');
      handleClickOpenerr();
    } else if (vendor.documentnumber === '' || !vendor.documentnumber) {
      setShowAlert('Please Enter Document Number');
      handleClickOpenerr();
    } else if (uploadBills?.length === 0 && billUploadedFiles?.length === 0) {
      setShowAlert('Please Upload Document');
      handleClickOpenerr();
    } else if (vendor.mobile == '') {
      setShowAlert('Please Enter Mobile Number');
      handleClickOpenerr();
    } else if (vendor.mobile.length != 10) {
      setShowAlert('Please Enter Valid Mobile No!');
      handleClickOpenerr();
    } else if (vendor.whatsapp == '') {
      setShowAlert('Please Enter Whatsapp Number');
      handleClickOpenerr();
    } else if (vendor.whatsapp.length != 10) {
      setShowAlert('Please Enter Valid Whatsapp No !');
      handleClickOpenerr();
    } else if (vendor.visitortype === 'Please Select Visitor Type') {
      setShowAlert('Please Select Visitor Type');
      handleClickOpenerr();
    } else if (vendor.visitorpurpose === 'Please Select Visitor Purpose') {
      setShowAlert('Please Select Visitor Purpose');
      handleClickOpenerr();
    } else if (vendor.hostname === 'Please Select HostName' || vendor.hostname === '') {
      setShowAlert('Please Select HostName');
      handleClickOpenerr();
    } else {
      nextStep();
    }
  };
  const handlesubmit = () => {
    // if (capturedImages.length == 0 || capturedImages.some((d) => d.preview === null || d.base64 === undefined)) {
    //   console.log('abcded');
    //   setShowAlert('Please Upload Webcam Image');
    //   handleClickOpenerr();
    // }
    if (refImage?.length === 0) {
      setShowAlert('Please Upload Photograph');
      handleClickOpenerr();
      // setPopupContentMalert("Please Upload Photograph!");
      // setPopupSeverityMalert("info");
      // handleClickOpenPopupMalert();
    } else {
      sendRequest();
    }
  };
  const stepThree = () => {
    nextStep();
  };
  const stepFour = () => {
    nextStep();
  };

  const [step, setStep] = useState(1);

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  {
    cateCode &&
      cateCode.map(() => {
        let strings = 'VISIT#';
        let refNo = cateCode[cateCode.length - 1]?.visitorid;
        let digits = (cateCode.length + 1).toString();
        const stringLength = refNo.length;
        let lastChar = refNo.charAt(stringLength - 1);
        let getlastBeforeChar = refNo.charAt(stringLength - 2);
        let getlastThreeChar = refNo.charAt(stringLength - 3);
        let getlastFourChar = refNo.charAt(stringLength - 4);
        let lastBeforeChar = refNo.slice(-2);
        let lastThreeChar = refNo.slice(-3);
        let lastDigit = refNo.slice(-4);

        let refNOINC = parseInt(lastChar) + 1;
        let refLstTwo = parseInt(lastBeforeChar) + 1;
        let refLstThree = parseInt(lastThreeChar) + 1;
        let refLstDigit = parseInt(lastDigit) + 1;

        if (digits.length < 4 && Number(getlastFourChar) == 0 && Number(getlastBeforeChar) == 0 && Number(getlastThreeChar) == 0) {
          refNOINC = '000' + refNOINC;
          newval = strings + refNOINC;
        } else if (digits.length < 4 && Number(getlastFourChar) == 0 && Number(getlastBeforeChar) == 0 && Number(getlastThreeChar) > 0) {
          refNOINC = '00' + refLstTwo;
          newval = strings + refNOINC;
        } else if (digits.length < 4 && Number(getlastThreeChar) > 0 && Number(getlastThreeChar) < 9 && Number(getlastFourChar) == 0) {
          refNOINC = '0' + refLstThree;
          newval = strings + refNOINC;
        } else if (getlastFourChar != 0) {
          refNOINC = refLstDigit;
          newval = strings + refNOINC;
        }
      });
  }

  // Image Upload
  useEffect(() => {
    const loadModels = async () => {
      const modelUrl = SERVICE.FACEDETECTLOGINMODEL;
      await faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl);
      await faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl);
      await faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl);
    };
    loadModels();
  }, []);

  const resizeImageKeepFormat = (base64, targetWidth, targetHeight) => {
    console.log(targetWidth, targetHeight, 'targetWidth, targetHeight');
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const width = targetWidth || img.width;
        const height = targetHeight || img.height;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const scale = Math.min(width / img.width, height / img.height);
        const x = width / 2 - (img.width * scale) / 2;
        const y = height / 2 - (img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // keep same format as original base64
        const mimeType = base64.substring(base64.indexOf(':') + 1, base64.indexOf(';'));

        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }, mimeType);
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = base64;
    });
  };

  async function handleChangeImage(e) {
    setIsLoading(true);
    setBtnUpload(true);

    const maxFileSize = overllsettings?.filesize || 1; // MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']; // ✅ whitelist extensions

    const files = Array.from(e.target.files).filter((file) => {
      const sizeInMB = file.size / (1024 * 1024);

      // ✅ Accept only allowed type + under max size
      if (!allowedTypes.includes(file.type)) {
        setPopupContentMalert(`"${file.name}" is not a supported format!`);
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        return false;
      }

      if (sizeInMB >= maxFileSize) {
        setPopupContentMalert(`"${file.name}" exceeds ${maxFileSize} MB limit!`);
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        return false;
      }

      return true;
    });

    if (files.length === 0) {
      setIsLoading(false);
      setBtnUpload(false);
      return;
    }

    let newSelectedFiles = [...refImage];

    for (const file of files) {
      const path = URL.createObjectURL(file);
      const image = new Image();
      image.src = path;

      await new Promise((resolve) => {
        image.onload = async () => {
          try {
            // ✅ Face detection
            const detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();

            if (detections.length > 0) {
              const faceDescriptor = detections[0].descriptor;

              // ✅ Duplicate check API
              const response = await axios.post(
                `${SERVICE.DUPLICATECANDIDATEFACEDETECTVISITOR}`,
                { faceDescriptor: Array.from(faceDescriptor) }
                // { headers: { Authorization: `Bearer ${auth.APIToken}` } }
              );

              if (response?.data?.matchfound) {
                // setPopupContentMalert(`"${file.name}" already in use!`);
                // setPopupSeverityMalert("info");
                // handleClickOpenPopupMalert();
                setShowAlert(`"${file.name}" already in use!`);
                handleClickOpenerr();
                resolve();
                return;
              }

              // ✅ Reader for base64 + resize
              const reader = new FileReader();
              reader.onload = async () => {
                let base64Data = reader.result;

                if (overllsettings?.dimensionswidth || overllsettings?.height) {
                  base64Data = await resizeImageKeepFormat(reader.result, overllsettings?.dimensionswidth || image.width, overllsettings?.height || image.height);
                }

                // ✅ Push resized/original image
                newSelectedFiles.push({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  preview: base64Data,
                  base64: base64Data.split(',')[1],
                });
                setRefImage([...newSelectedFiles]);

                // ✅ Blob conversion
                const binaryData = atob(base64Data.split(',')[1]);
                const uint8Array = new Uint8Array(binaryData.length);
                for (let i = 0; i < binaryData.length; i++) {
                  uint8Array[i] = binaryData.charCodeAt(i);
                }
                const blob = new Blob([uint8Array], { type: file.type });
                setImage((prev) => [...prev, blob]);

                // ✅ Default states for bg/color
                setBgbtn((prev) => [...prev, false]);
                setColor((prev) => {
                  const updated = [...prev, overllsettings?.backgroundcolour || '#FFFFFF'];
                  setIsLightColor(updated.map((c) => calculateLuminance(c)));
                  return updated;
                });

                // ✅ Save vendor state
                toDataURL(path, (dataUrl) => {
                  setVendor((prev) => ({
                    ...prev,
                    uploadedimage: String(dataUrl),
                    faceDescriptor: Array.from(faceDescriptor),
                  }));
                });

                resolve();
              };
              reader.readAsDataURL(file);
            } else {
              setPopupContentMalert(`No face detected in "${file.name}"`);
              setPopupSeverityMalert('info');
              handleClickOpenPopupMalert();
              resolve();
            }
          } catch (error) {
            console.error(error);
            setPopupContentMalert(`Error processing "${file.name}"`);
            setPopupSeverityMalert('info');
            handleClickOpenPopupMalert();
            resolve();
          }
        };

        image.onerror = () => {
          setPopupContentMalert(`Error loading "${file.name}"`);
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          resolve();
        };
      });
    }

    setIsLoading(false);
    setBtnUpload(false);
  }

  async function handleChangeImageDrag(e) {
    setIsLoading(true);
    setBtnUpload([]);

    const maxFileSize = overllsettings?.filesize || 1; // MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']; // ✅ whitelist extensions

    const files = Array.from(e.dataTransfer.files).filter((file) => {
      const sizeInMB = file.size / (1024 * 1024);

      // ✅ Accept only allowed type + under max size
      if (!allowedTypes.includes(file.type)) {
        setPopupContentMalert(`"${file.name}" is not a supported format!`);
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        return false;
      }

      if (sizeInMB >= maxFileSize) {
        setPopupContentMalert(`"${file.name}" exceeds ${maxFileSize} MB limit!`);
        setPopupSeverityMalert('info');
        handleClickOpenPopupMalert();
        return false;
      }

      return true;
    });

    if (files.length === 0) {
      setIsLoading(false);
      setBtnUpload(false);
      return;
    }

    let newSelectedFiles = [...refImageDrag];

    for (const file of files) {
      const path = URL.createObjectURL(file);
      const image = new Image();
      image.src = path;

      await new Promise((resolve) => {
        image.onload = async () => {
          try {
            // ✅ Face detection
            const detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();

            if (detections.length > 0) {
              const faceDescriptor = detections[0].descriptor;

              // ✅ Duplicate check API
              const response = await axios.post(
                `${SERVICE.DUPLICATECANDIDATEFACEDETECTVISITOR}`,
                { faceDescriptor: Array.from(faceDescriptor) }
                // { headers: { Authorization: `Bearer ${auth.APIToken}` } }
              );

              if (response?.data?.matchfound) {
                // setPopupContentMalert(`"${file.name}" already in use!`);
                // setPopupSeverityMalert("info");
                // handleClickOpenPopupMalert();
                setShowAlert(`"${file.name}" already in use!`);
                handleClickOpenerr();
                resolve();
                return;
              }

              // ✅ Reader for base64 + resize
              const reader = new FileReader();
              reader.onload = async () => {
                let base64Data = reader.result;

                if (overllsettings?.dimensionswidth || overllsettings?.height) {
                  base64Data = await resizeImageKeepFormat(reader.result, overllsettings?.dimensionswidth || image.width, overllsettings?.height || image.height);
                }

                // ✅ Push resized/original image
                newSelectedFiles.push({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  preview: base64Data,
                  base64: base64Data.split(',')[1],
                });
                setRefImageDrag([...newSelectedFiles]);

                // ✅ Blob conversion
                const binaryData = atob(base64Data.split(',')[1]);
                const uint8Array = new Uint8Array(binaryData.length);
                for (let i = 0; i < binaryData.length; i++) {
                  uint8Array[i] = binaryData.charCodeAt(i);
                }
                const blob = new Blob([uint8Array], { type: file.type });
                setImageDrag((prev) => [...prev, blob]);

                // ✅ Default states for bg/color
                setBgbtnDrag((prev) => [...prev, false]);
                setColorDrag((prev) => {
                  const updated = [...prev, overllsettings?.backgroundcolour || '#FFFFFF'];
                  setIsLightColor(updated.map((c) => calculateLuminance(c)));
                  return updated;
                });

                // ✅ Save vendor state
                toDataURL(path, (dataUrl) => {
                  setVendor((prev) => ({
                    ...prev,
                    uploadedimage: String(dataUrl),
                    faceDescriptor: Array.from(faceDescriptor),
                  }));
                });

                resolve();
              };
              reader.readAsDataURL(file);
            } else {
              setPopupContentMalert(`No face detected in "${file.name}"`);
              setPopupSeverityMalert('info');
              handleClickOpenPopupMalert();
              resolve();
            }
          } catch (error) {
            console.error(error);
            setPopupContentMalert(`Error processing "${file.name}"`);
            setPopupSeverityMalert('info');
            handleClickOpenPopupMalert();
            resolve();
          }
        };

        image.onerror = () => {
          setPopupContentMalert(`Error loading "${file.name}"`);
          setPopupSeverityMalert('info');
          handleClickOpenPopupMalert();
          resolve();
        };
      });
    }

    setIsLoading(false);
    setBtnUpload(false);
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
    const images = [...image];
    newSelectedFiles.splice(index, 1);
    bgbtnArray.splice(index, 1);
    colorArray.splice(index, 1);
    images.splice(index, 1);
    setRefImage(newSelectedFiles);
    setImage(images);
    setBgbtn(bgbtnArray);
    setColor(colorArray);
  };
  const renderFilePreview = async (file, index) => {
    console.log(index, 'indes');
    const response = await fetch(file.preview);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    window.open(link, '_blank');
  };
  const removeCapturedImage = (index) => {
    const newCapturedImages = [...capturedImages];
    newCapturedImages.splice(index, 1);
    setCapturedImages(newCapturedImages);
  };
  const resetImage = () => {
    setGetImg('');
    setRefImage([]);
    setImage([]);
    setPreviewURL(null);
    setRefImageDrag([]);
    setImageDrag([]);
    setCapturedImages([]);
    setColorDrag([]);
    setColor([]);
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
      if (item.type.startsWith('image')) {
        const file = item.getAsFile();
        console.log(file, 'file');
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
    const newSelectedFilesimage = [...imageDrag];
    newSelectedFiles.splice(index, 1);
    newSelectedFilesimage.splice(index, 1);
    setRefImageDrag(newSelectedFiles);
    setImageDrag(newSelectedFilesimage);
    setColorDrag([]);
    setColor([]);
  };

  const renderStepOne = () => {
    return (
      <>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography sx={{ color: '#171A1C', fontWeight: 700, fontFamily: 'JostMedium', fontSize: { md: '25px', sm: '25px', xs: '22px' } }}>Visitor Registration</Typography>
          </Box>
          <br />
          <Grid container spacing={2}>
            {/* 
            <Grid item md={12} xs={12} sm={12} sx={{ display: 'flex' }}>
              <Grid item md={3} sm={12} xs={12}>
                <Typography>
                  Photograph <b style={{ color: 'red' }}>*</b>
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'left' }}>
                  <Button variant="contained" color="primary" onClick={handleClickUploadPopupOpen}>
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
                        </Grid>
                      </Grid>
                    </Grid>
                  ))
                }
                {refImage.map((file, index) => (
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
                      md={7}
                      sm={7}
                      xs={7}
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
            </Grid> */}

            <Grid item lg={12} md={12} xs={12} sm={12}>
              <Typography
                sx={{
                  color: 'black',
                  fontFamily: ' League Spartan, sans-serif',
                  fontsize: '30px',
                }}
              >
                {' '}
                <b>First Name</b> <b style={{ color: 'red' }}>*</b>:
              </Typography>
              <Grid container>
                <Grid item md={3} sm={3} xs={3}>
                  <FormControl size="small" fullWidth>
                    <Select
                      placeholder="Mr."
                      value={vendor.prefix}
                      onChange={(e) => {
                        setVendor({ ...vendor, prefix: e.target.value });
                      }}
                      disabled={isExistVisitor}
                      sx={{
                        backgroundColor: '#E3E3E3',
                      }}
                    >
                      <MenuItem value="Mr">Mr</MenuItem>
                      <MenuItem value="Ms">Ms</MenuItem>
                      <MenuItem value="Mrs">Mrs</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item md={9} sm={9} xs={9}>
                  <FormControl size="small" fullWidth>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      style={{
                        backgroundColor: '#E3E3E3', // Background color
                      }}
                      disabled={isExistVisitor}
                      value={vendor.firstname}
                      onChange={(e) => {
                        setVendor({
                          ...vendor,
                          firstname: e.target.value,
                        });
                        handleValidationfirstname(e);
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            <Grid item lg={12} md={12} xs={12} sm={12}>
              <Typography
                sx={{
                  color: 'black',
                  fontFamily: ' League Spartan, sans-serif',
                  fontsize: '30px',
                }}
              >
                {' '}
                <b>Last Name</b>
                <b style={{ color: 'red' }}>*</b>:&emsp;
              </Typography>
              <FormControl size="small" fullWidth>
                <OutlinedInput
                  style={{
                    backgroundColor: '#E3E3E3', // Background color
                  }}
                  disabled={isExistVisitor}
                  id="component-outlined"
                  type="text"
                  value={vendor.lastname}
                  onChange={(e) => {
                    setVendor({
                      ...vendor,
                      lastname: e.target.value,
                    });
                    handleValidationlastname(e);
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item lg={12} md={12} xs={12} sm={12}>
              <Typography
                sx={{
                  color: 'black',
                  fontFamily: ' League Spartan, sans-serif',
                  fontsize: '30px',
                }}
              >
                {' '}
                <b> Email</b> <b style={{ color: 'red' }}>*</b>:&emsp;
              </Typography>
              <FormControl size="small" fullWidth>
                <OutlinedInput
                  style={{
                    backgroundColor: '#E3E3E3', // Background color
                  }}
                  id="component-outlined"
                  type="email"
                  value={vendor.email}
                  onChange={(e) => {
                    setVendor({
                      ...vendor,
                      email: e.target.value,
                    });
                    // setIsValidEmail(validateEmail(e.target.value));
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item md={12} xs={12} sm={12}>
              <Typography
                sx={{
                  color: 'black',
                  fontFamily: ' League Spartan, sans-serif',
                  fontsize: '30px',
                }}
              >
                <b>Visitor ID / Document Details</b>
              </Typography>
            </Grid>
            <Grid item md={4} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  Document Type<b style={{ color: 'red' }}>*</b>
                </Typography>
                <Selects
                  maxMenuHeight={300}
                  options={documentTypeOption}
                  // placeholder="Please Select Document Type"
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
            <Grid item md={4} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  Document Number<b style={{ color: 'red' }}>*</b>
                </Typography>
                <OutlinedInput
                  id="component-outlined"
                  type="text"
                  style={{
                    backgroundColor: '#E3E3E3', // Background color
                  }}
                  value={vendor.documentnumber}
                  // placeholder="Please Enter Document Number"
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
            <Grid item md={4} sm={12} xs={12}>
              <Typography>
                Upload Document<b style={{ color: 'red' }}>*</b>
              </Typography>
              <Grid>
                <Grid item md={2} sm={12} xs={12}>
                  <Button
                    size="small"
                    variant="outlined"
                    component="label"
                    sx={{
                      '@media only screen and (max-width:550px)': { marginY: '5px' },
                      //  ...buttonStyles?.buttonsubmit
                    }}
                  >
                    Upload
                    <input
                      type="file"
                      id="resume"
                      accept=".xlsx, .xls, .csv, .pdf, .txt,"
                      name="file"
                      hidden
                      onChange={(e) => {
                        handleInputChangedocument(e);
                      }}
                    />
                  </Button>
                </Grid>
                <Typography>&nbsp;</Typography>
              </Grid>
            </Grid>
            <Grid item md={12} xs={12} sm={12}>
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
            <Grid item md={12} xs={12} sm={12}>
              <Box>
                <Typography
                  sx={{
                    color: 'black',
                    fontFamily: ' League Spartan, sans-serif',
                    fontsize: '30px',
                  }}
                >
                  {' '}
                  <b>Permanent Address</b>
                </Typography>
                <br />
                <>
                  <Grid container spacing={2}>
                    <Grid item md={4} xs={12} sm={12}>
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
                    <Grid item md={4} xs={12} sm={12}>
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
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Reference Name </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
                          value={vendor.referencename}
                          // placeholder="Please Enter Reference Name"
                          onChange={(e) => {
                            setVendor({
                              ...vendor,
                              referencename: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} sm={12} xs={12}>
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
                        <Grid item md={4} sm={4} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Pincode</Typography>

                            <Box display="flex" alignItems="center" gap={1}>
                              <OutlinedInput
                                id="component-outlined"
                                type="number"
                                style={{
                                  backgroundColor: '#E3E3E3', // Background color
                                }}
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
                    <Grid item md={4} sm={12} xs={12}>
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
                        <Grid item md={4} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>District</Typography>
                            <OutlinedInput
                              id="component-outlined"
                              style={{
                                backgroundColor: '#E3E3E3', // Background color
                              }}
                              type="text"
                              value={vendor?.pdistrict || ''}
                              readOnly
                              sx={userStyle.input}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={4} sm={6} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography> Village/City </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ flexGrow: 1 }}>
                                {switchValues?.pvillageorcity ? (
                                  <OutlinedInput
                                    id="component-outlined"
                                    type="text"
                                    style={{
                                      backgroundColor: '#E3E3E3', // Background color
                                    }}
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
                      <Grid item md={4} sm={12} xs={12}>
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
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>GPS Coordinate</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
                          value={vendor.gpscoordinate}
                          // placeholder="Please Enter GPS Coordinate"
                          onChange={(e) => {
                            setVendor({
                              ...vendor,
                              gpscoordinate: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
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
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Landmark Name</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
                          value={vendor.landmarkname}
                          // placeholder="Please Enter Landmark Name"
                          onChange={(e) => {
                            setVendor({
                              ...vendor,
                              landmarkname: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>House/Flat No</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={vendor.houseflatnumber}
                          // placeholder="Please Enter House/Flat Number"
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
                          onChange={(e) => {
                            setVendor({
                              ...vendor,
                              houseflatnumber: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Street/Road Name</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={vendor.streetroadname}
                          // placeholder="Please Enter Street/Road Name"
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
                          onChange={(e) => {
                            setVendor({
                              ...vendor,
                              streetroadname: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Locality/Area Name</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={vendor.localityareaname}
                          // placeholder="Please Enter Locality/Area Name"
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
                          onChange={(e) => {
                            setVendor({
                              ...vendor,
                              localityareaname: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Building/Apartment Name</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={vendor.pbuildingapartmentname}
                          // placeholder="Please Enter Building/Apartment Name"
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
                          onChange={(e) => {
                            setVendor({
                              ...vendor,
                              pbuildingapartmentname: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Address 1</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={vendor.paddressone}
                          // placeholder="Please Enter Address 1"
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
                          onChange={(e) => {
                            setVendor({
                              ...vendor,
                              paddressone: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Address 2</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={vendor.paddresstwo}
                          // placeholder="Please Enter Address 2"
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
                          onChange={(e) => {
                            setVendor({
                              ...vendor,
                              paddresstwo: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Address 3</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={vendor.paddressthree}
                          // placeholder="Please Enter Address 3"
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
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

                        pbuildingapartmentname: vendor?.pbuildingapartmentname || '',
                        paddressone: vendor?.paddressone || '',
                        paddresstwo: vendor?.paddresstwo || '',
                        paddressthree: vendor?.paddressthree || '',
                      }}
                    />
                  </Grid>
                </>
                <br />
                <br />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography
                      sx={{
                        color: 'black',
                        fontFamily: ' League Spartan, sans-serif',
                        fontsize: '30px',
                      }}
                    >
                      <b> Current Address</b>
                    </Typography>
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
                      <Grid item md={4} sm={12} xs={12}>
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
                      <Grid item md={4} sm={12} xs={12}>
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
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Reference Name</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            // placeholder="Reference Name"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            value={vendor?.creferencename}
                            onChange={(e) => {
                              setVendor({ ...vendor, creferencename: e.target.value });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
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
                          <Grid item md={4} sm={4} xs={12}>
                            <FormControl fullWidth size="small">
                              <Typography>Pincode</Typography>

                              <Box display="flex" alignItems="center" gap={1}>
                                <OutlinedInput
                                  id="component-outlined"
                                  type="number"
                                  style={{
                                    backgroundColor: '#E3E3E3', // Background color
                                  }}
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
                        <Grid item md={4} sm={12} xs={12}>
                          <FormControl size="small" fullWidth>
                            <Typography>Pincode</Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="number"
                              sx={userStyle.input}
                              // placeholder="Pincode"
                              style={{
                                backgroundColor: '#E3E3E3', // Background color
                              }}
                              value={vendor.cpincode}
                              onChange={(e) => {
                                handlechangecpincode(e);
                              }}
                            />
                          </FormControl>
                        </Grid>
                      )}
                      <Grid item md={4} sm={12} xs={12}>
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
                          <Grid item md={4} sm={12} xs={12}>
                            <FormControl fullWidth size="small">
                              <Typography>District</Typography>
                              <OutlinedInput id="component-outlined" type="text" value={vendor?.cdistrict || ''} readOnly sx={userStyle.input} />
                            </FormControl>
                          </Grid>
                          <Grid item md={4} sm={6} xs={12}>
                            <FormControl fullWidth size="small">
                              <Typography> Village/City </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ flexGrow: 1 }}>
                                  {switchValues?.cvillageorcity ? (
                                    <OutlinedInput
                                      id="component-outlined"
                                      type="text"
                                      value={vendor?.cvillageorcity}
                                      // placeholder="Village/City"
                                      style={{
                                        backgroundColor: '#E3E3E3', // Background color
                                      }}
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
                        <Grid item md={4} sm={12} xs={12}>
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

                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>GPS Coordination</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            // placeholder="Landmark  Name"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
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
                      <Grid item md={4} sm={12} xs={12}>
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
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Landmark Name</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            // placeholder="Landmark  Name"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
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
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>House/Flat No</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            // placeholder="House/Flat No"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
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
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Street/Road Name</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            // placeholder="Street/Road Name"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
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
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Locality/Area Name</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            // placeholder="Locality/Area Name"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            value={vendor.clocalityareaname}
                            onChange={(e) => {
                              setVendor({ ...vendor, clocalityareaname: e.target.value });
                            }}
                          />
                        </FormControl>
                      </Grid>

                      <Grid item md={4} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Building/Apartment Name</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={vendor.cbuildingapartmentname}
                            // placeholder="Please Enter Building/Apartment Name"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            onChange={(e) => {
                              setVendor({
                                ...vendor,
                                cbuildingapartmentname: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Address 1</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={vendor.caddressone}
                            // placeholder="Please Enter Address 1"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            onChange={(e) => {
                              setVendor({
                                ...vendor,
                                caddressone: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Address 2</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={vendor.caddresstwo}
                            // placeholder="Please Enter Address 2"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            onChange={(e) => {
                              setVendor({
                                ...vendor,
                                caddresstwo: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Address 3</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={vendor.caddressthree}
                            // placeholder="Please Enter Address 3"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
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
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Address Type</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            // placeholder="Address Type"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            value={vendor?.addesstype}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Personal Prefix</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            // placeholder="Personal Prefix"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            value={vendor?.personalprefix}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Reference Name</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            //  placeholder="Reference Name"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            value={vendor?.referencename}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
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
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl size="small" fullWidth>
                          <Typography>Pincode</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            // placeholder="Pincode"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            value={vendor.ppincode}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
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
                          <Grid item md={4} sm={12} xs={12}>
                            <FormControl size="small" fullWidth>
                              <Typography>District</Typography>
                              <OutlinedInput
                                id="component-outlined"
                                type="text"
                                //  placeholder="District"
                                style={{
                                  backgroundColor: '#E3E3E3', // Background color
                                }}
                                value={vendor.pdistrict || ''}
                                readOnly
                              />
                            </FormControl>
                          </Grid>
                          <Grid item md={4} sm={12} xs={12}>
                            <FormControl size="small" fullWidth>
                              <Typography>Village/City</Typography>
                              <OutlinedInput
                                id="component-outlined"
                                type="text"
                                // placeholder="Village/City"
                                style={{
                                  backgroundColor: '#E3E3E3', // Background color
                                }}
                                value={vendor.pvillageorcity || ''}
                                readOnly
                              />
                            </FormControl>
                          </Grid>
                        </>
                      ) : (
                        <Grid item md={4} sm={12} xs={12}>
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

                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl size="small" fullWidth>
                          <Typography>GPS Coordination</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            // placeholder="GPS Coordination"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            value={vendor?.gpscoordinate}
                            readOnly
                          />
                        </FormControl>
                      </Grid>

                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography> Landmark & Positional Prefix </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            // placeholder="Landmark & Positional Prefix"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            value={vendor?.landmarkpositionprefix}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Landmark Name</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            //  placeholder="Landmark  Name"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            value={vendor.landmarkname}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>House/Flat No</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            //  placeholder="House/Flat No"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            value={vendor.houseflatnumber}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Street/Road Name</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            // placeholder="Street/Road Name"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            value={vendor.streetroadname}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Locality/Area Name</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            //  placeholder="Locality/Area Name"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            value={vendor.localityareaname}
                            readOnly
                          />
                        </FormControl>
                      </Grid>

                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Building/Apartment Name</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            //  placeholder="Building/Apartment Name"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            value={vendor?.pbuildingapartmentname || ''}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Address 1</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Address 1"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            value={vendor?.paddressone || ''}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Address 2</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Address 2"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            value={vendor?.paddresstwo || ''}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} sm={12} xs={12}>
                        <FormControl fullWidth size="small">
                          <Typography>Address 3</Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Address 3"
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
                            value={vendor?.paddressthree || ''}
                            readOnly
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                  </>
                )}
              </Box>
            </Grid>
            <Grid item md={12} xs={12} sm={12}></Grid>
            <Grid item lg={12} md={12} xs={12} sm={12}>
              <Typography
                sx={{
                  color: 'black',
                  fontFamily: ' League Spartan, sans-serif',
                  fontsize: '30px',
                }}
              >
                {' '}
                <b> Mobile</b> <b style={{ color: 'red' }}>*</b>:&emsp;
              </Typography>
              <FormControl size="small" fullWidth>
                <OutlinedInput
                  style={{
                    backgroundColor: '#E3E3E3', // Background color
                  }}
                  id="component-outlined"
                  type="number"
                  value={vendor.mobile}
                  onChange={(e) => {
                    setVendor({
                      ...vendor,
                      mobile: e.target.value,
                    });
                    handleMobile(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item lg={12} md={12} xs={12} sm={12} sx={{ marginRight: '40px' }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{}}
                      checked={vendor.phonecheck}
                      onChange={(e) =>
                        setVendor({
                          ...vendor,
                          phonecheck: !vendor.phonecheck,
                        })
                      }
                    />
                  }
                  label="Same as Whatsapp number"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontFamily: ' League Spartan, sans-serif',
                      color: 'black',
                      fontsize: '30px', // Change this value to adjust the font size
                    },
                  }}
                />
              </FormGroup>
            </Grid>

            <Grid item lg={12} md={12} xs={12} sm={12}>
              <Typography
                sx={{
                  color: 'black',
                  fontFamily: ' League Spartan, sans-serif',
                  fontsize: '30px',
                }}
              >
                {' '}
                <b> Whatsapp</b> <b style={{ color: 'red' }}>*</b>:&emsp;
              </Typography>
              <FormControl size="small" fullWidth>
                <OutlinedInput
                  style={{
                    backgroundColor: '#E3E3E3', // Background color
                  }}
                  id="component-outlined"
                  type="number"
                  value={vendor.whatsapp}
                  onChange={(e) => {
                    setVendor({
                      ...vendor,
                      whatsapp: e.target.value,
                    });
                    handleWhatsapp(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item lg={12} md={12} xs={12} sm={12}>
              <Typography
                sx={{
                  color: 'black',
                  fontFamily: ' League Spartan, sans-serif',
                  fontsize: '30px',
                }}
              >
                {' '}
                <b>Visitor Type</b>
                <b style={{ color: 'red' }}>*</b>:&emsp;
              </Typography>
              <FormControl fullWidth size="small">
                <Typography></Typography>
                <Selects
                  maxMenuHeight={300}
                  style={{
                    backgroundColor: '#E3E3E3', // Background color
                  }}
                  options={visitorsTypeOption}
                  placeholder="Please Select Visitor Type"
                  value={{
                    label: vendor.visitortype,
                    value: vendor.visitortype,
                  }}
                  onChange={(e) => {
                    setVendor({
                      ...vendor,
                      visitortype: e.value,
                      visitorpurpose: 'Please Select Visitor Purpose',
                      hostname: 'Please Select HostName',
                    });
                    fetchInteractorPurpose(e.value);
                    fetchallEmployee(e.value);
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item lg={12} md={12} xs={12} sm={12}>
              <Typography
                sx={{
                  color: 'black',
                  fontFamily: ' League Spartan, sans-serif',
                  fontsize: '30px',
                }}
              >
                <b>Visitor Purpose</b>
                <b style={{ color: 'red' }}>*</b>:&emsp;
              </Typography>
              <FormControl fullWidth size="small">
                <Typography></Typography>
                <Selects
                  maxMenuHeight={300}
                  options={visitorsPurposeOption}
                  placeholder="Please Select Visitor Purpose"
                  value={{
                    label: vendor.visitorpurpose,
                    value: vendor.visitorpurpose,
                  }}
                  onChange={(e) => {
                    setVendor({
                      ...vendor,
                      visitorpurpose: e.value,
                    });
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item lg={12} md={12} xs={12} sm={12}>
              <Typography
                sx={{
                  color: 'black',
                  fontFamily: ' League Spartan, sans-serif',
                  fontsize: '30px',
                }}
              >
                {' '}
                <b> Host Name</b> <b style={{ color: 'red' }}>*</b>:&emsp;
              </Typography>
              <FormControl fullWidth size="small">
                <Selects
                  maxMenuHeight={120}
                  options={filterdemployee}
                  value={{
                    label: vendor.hostname,
                    value: vendor.hostname,
                  }}
                  onChange={(e) => {
                    setVendor({
                      ...vendor,
                      hostname: e.value,
                      unit: e.unit,
                    });
                  }}
                />
              </FormControl>
            </Grid>

            <br />
            <Grid item lg={12} md={12} xs={12} sm={12} sx={{ display: 'flex', justifyContent: 'end' }}>
              <Button
                className="next"
                size="small"
                variant="contained"
                sx={{ ...userStyle.nextbutton, width: '100px', marginRight: 0 }}
                onClick={() => {
                  stepOne();
                }}
              >
                <b>Next</b> &emsp;
                <EastIcon
                  sx={{
                    '@media only screen and (max-width: 900px)': {
                      fontSize: 'medium',
                    },
                  }}
                />
              </Button>
            </Grid>
            <br />
            <Grid container marginTop={2}>
              <Footer />
            </Grid>
          </Grid>
        </Box>
      </>
    );
  };
  const renderStepTwo = () => {
    return (
      <>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography sx={{ color: '#171A1C', fontWeight: 700, fontFamily: 'JostMedium', fontSize: { md: '25px', sm: '25px', xs: '22px' } }}> Photographic Verification</Typography>
          </Box>
          <br />
          <Grid container>
            {/* <Grid item lg={12} md={12} xs={12} sm={12}>
              <Typography
                style={{
                  color: 'black',
                  fontFamily: 'League Spartan, sans-serif',
                  fontSize: '20px',
                }}
              >
                Web Camera <b style={{ color: 'red' }}>*</b>
              </Typography>
            </Grid>
            <br />
            <Grid item lg={12} md={12} xs={12} sm={12} marginTop={2}>
              <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                <Webcamimage
                  name={name}
                  getImg={getImg}
                  setGetImg={setGetImg}
                  valNum={valNum}
                  setValNum={setValNum}
                  capturedImages={capturedImages}
                  setCapturedImages={setCapturedImages}
                  // setRefImage={setRefImage}
                  setRefImageDrag={setRefImageDrag}
                  setVendor={setVendor}
                  vendor={vendor}
                  handleCloseModEdit={handleCloseModEdit}
                  setNewimage={setNewimage}
                />
              </Box>
            </Grid>
            <br /> */}
            <Grid item md={12} xs={12} sm={12} sx={{ display: 'flex' }}>
              <Grid item md={3} sm={12} xs={12}>
                <Typography>
                  Photograph <b style={{ color: 'red' }}>*</b>
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'left' }}>
                  <Button variant="contained" color="primary" onClick={handleClickUploadPopupOpen}>
                    Upload
                  </Button>
                </Box>
              </Grid>
              <Grid item md={12} sm={12} xs={12} marginTop={3}>
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
                          </Grid>
                        </Grid>
                      </Grid>
                    ))
                }
                {refImage.map((file, index) => (
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
                      md={7}
                      sm={7}
                      xs={7}
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
            <br /> <br /> <br /> <br /> <br /> <br />
            <Grid item lg={12} md={12} xs={12} sm={12} marginTop={2} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="contained" type="submit" onClick={prevStep}>
                {' '}
                <WestIcon
                  sx={{
                    '@media only screen and (max-width: 900px)': {
                      fontSize: 'medium',
                    },
                  }}
                />
                &emsp; <b>Previous</b>
              </Button>

              <LoadingButton onClick={handlesubmit} loading={loadingdeloverall} color="primary" loadingPosition="end" variant="contained">
                Submit
              </LoadingButton>
            </Grid>
            <br />
            <Grid item lg={12} md={12} xs={12} sm={12} marginTop={2}>
              <Footer />
            </Grid>
          </Grid>
        </Box>
      </>
    );
  };
  const renderStepThree = () => {
    return (
      <>
        <Box>
          <Typography sx={userStyle.heading}>Check In Details</Typography>
          <br />
          <Grid container spacing={5}>
            <Grid item lg={10} md={10} xs={12} sm={12}>
              <Box>
                <Grid container spacing={2}>
                  <Grid item md={3} sm={3} lg={3}></Grid>
                  <Grid item md={6} sm={10} lg={10}>
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '40px',
                          color: 'black',
                          fontFamily: ' League Spartan, sans-serif',
                        }}
                      >
                        Welcome :
                      </Typography>
                    </Box>
                    <br />

                    <Box
                      sx={{
                        borderRadius: '10px',
                        justifyContent: 'center',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        // height: "180px",
                      }}
                    >
                      <Box>
                        <img
                          style={{
                            height: '300px',
                            width: '300px',
                          }}
                          src={uploadconfetti}
                          alt=""
                        />{' '}
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '50px',
                            color: 'black',
                            fontFamily: ' League Spartan, sans-serif',
                          }}
                        >
                          Check In Successfully
                        </Typography>
                      </Box>
                      <br />
                      <Footer />
                    </Box>
                  </Grid>
                  <Grid item md={3} sm={3} lg={3}></Grid>
                </Grid>
              </Box>
            </Grid>

            <br />
          </Grid>
        </Box>
      </>
    );
  };

  const [steperDisplay, setSteperDisplay] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // setIsMobile(window.innerWidth <= 900);
      // setIsMobile1(window.innerWidth <= 900);
      setSteperDisplay(window.innerWidth <= 900);
    };
    handleResize(); // Call the handleResize function once to set the initial state
    window.addEventListener('resize', handleResize); // Listen for window resize events
    return () => {
      window.removeEventListener('resize', handleResize); // Clean up the event listener on component unmount
    };
  }, []);

  const renderIndicator = () => {
    return (
      <Box>
        {steperDisplay ? (
          <Grid container spacing={2}>
            <>
              <Grid
                item
                lg={3}
                md={3}
                sm={12}
                xs={12}
                className="indicatorvertical"
                sx={{
                  height: '100%',
                  position: 'relative',
                  top: '0',
                  flexDirection: 'column',
                }}
              >
                <Grid item sx={{ marginTop: '50px' }}></Grid>
                <Grid item style={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '80px',
                      width: '80px',
                    }}
                    // src={hilife}
                    src={overallSettings?.companylogo}
                  />
                </Grid>
                <Grid item sx={{ marginTop: '10px' }}></Grid>

                <Grid item style={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography
                    sx={{
                      color: 'white',
                      fontFamily: ' League Spartan, sans-serif',
                      fontsize: '32px',
                    }}
                  >
                    {' '}
                    Visitor Registration{' '}
                  </Typography>
                </Grid>
                <Grid item sx={{ marginTop: '30px' }}></Grid>

                <Grid item style={{ display: 'flex', justifyContent: 'center' }}>
                  <ul style={{ marginLeft: '45px' }}>
                    <li
                    //  className={step === 1 ? "active" : null}
                    >
                      <Grid container spacing={2} sx={{ display: 'flex', flexDirection: 'Row' }}>
                        <Grid item>{step === 1 ? <img src={numberonenew} /> : null}</Grid>
                        <Grid item>
                          {step === 1 ? (
                            <Typography
                              sx={{
                                fontFamily: ' League Spartan, sans-serif',
                                fontsize: '32px',
                              }}
                            >
                              {' '}
                              Visitor Information
                            </Typography>
                          ) : null}
                        </Grid>
                      </Grid>

                      {/* <Grid
                        style={{
                          borderLeft: "2px dashed",
                          marginLeft: "16px",
                          height: "70px",
                        }}
                      ></Grid> */}
                      <Grid container spacing={2} sx={{ display: 'flex', flexDirection: 'Row' }}>
                        <Grid item>{step === 2 ? <img src={numbertwonew} /> : null}</Grid>
                        <Grid item>
                          {step === 2 ? (
                            <Typography
                              sx={{
                                fontFamily: ' League Spartan, sans-serif',
                                fontsize: '32px',
                              }}
                            >
                              {' '}
                              Photographic Verification
                            </Typography>
                          ) : null}
                        </Grid>
                      </Grid>
                      <Grid container spacing={2} sx={{ display: 'flex', flexDirection: 'Row' }}>
                        <Grid item>{step === 3 ? <img src={numberthreenew} /> : null}</Grid>
                        <Grid item>
                          {step === 3 ? (
                            <Typography
                              sx={{
                                fontFamily: ' League Spartan, sans-serif',
                                fontsize: '32px',
                              }}
                            >
                              {' '}
                              Check In Details
                            </Typography>
                          ) : null}
                        </Grid>
                      </Grid>
                    </li>
                  </ul>
                </Grid>
              </Grid>
              <Grid item lg={9} md={9} sm={12} xs={12} sx={{ padding: { lg: '20px 150px !important', md: '20px 150px !important', sm: '20px 80px !important', xs: '20px 50px !important' } }}>
                {step === 1 ? renderStepOne() : null}
                {step === 2 ? renderStepTwo() : null}
                {step === 3 ? renderStepThree() : null}
              </Grid>
            </>
          </Grid>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid
                item
                lg={3}
                md={3}
                sm={12}
                xs={12}
                className="indicatorwebsite"
                sx={{
                  position: 'sticky',
                  height: '100%',
                  top: '0',
                  flexDirection: 'column',
                }}
              >
                <Grid item sx={{ marginTop: '50px' }}></Grid>
                <Grid item style={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '158px',
                      width: '158px',
                    }}
                    // src={hilife}
                    src={overallSettings?.companylogo}
                  />
                </Grid>
                <Grid item sx={{ marginTop: '30px' }}></Grid>

                <Grid item style={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography
                    sx={{
                      color: 'white',
                      fontFamily: ' League Spartan, sans-serif',
                      fontsize: '30px',
                    }}
                  >
                    {' '}
                    Visitor Registration{' '}
                  </Typography>
                </Grid>
                <Grid item sx={{ marginTop: '70px' }}></Grid>

                <Grid item style={{ display: 'flex', justifyContent: 'center' }}>
                  <ul style={{ marginLeft: '45px' }}>
                    <li
                    //  className={step === 1 ? "active" : null}
                    >
                      <Grid
                        container
                        spacing={2}
                        sx={{
                          display: 'flex',
                          flexDirection: 'Row',
                          '@media only screen and (max-width: 1215px)': {
                            flexDirection: 'Row',
                          },
                        }}
                      >
                        <Grid item>{step === 1 ? <img src={numberonenew} /> : <img src={numberone} />}</Grid>
                        <Grid item>
                          <Typography
                            sx={{
                              fontFamily: ' League Spartan, sans-serif',
                              fontsize: '32px',
                            }}
                          >
                            {' '}
                            visitor Information
                          </Typography>
                        </Grid>
                      </Grid>

                      <Grid
                        item
                        style={{
                          borderLeft: '2px dashed',
                          marginLeft: '16px',
                          height: '70px',
                        }}
                      ></Grid>
                      <Grid
                        container
                        spacing={2}
                        sx={{
                          display: 'flex',
                          flexDirection: 'Row',
                          '@media only screen and (max-width: 1215px)': {
                            flexDirection: 'Row',
                          },
                        }}
                      >
                        <Grid item>{step === 2 ? <img src={numbertwonew} /> : <img src={numbertwo} />}</Grid>
                        <Grid item>
                          <Typography
                            sx={{
                              fontFamily: ' League Spartan, sans-serif',
                              fontsize: '32px',
                            }}
                          >
                            {' '}
                            Photographic Verification
                          </Typography>
                        </Grid>
                      </Grid>

                      <Grid
                        item
                        style={{
                          borderLeft: '2px dashed',
                          marginLeft: '16px',
                          height: '70px',
                        }}
                      ></Grid>
                      <Grid
                        container
                        spacing={2}
                        sx={{
                          display: 'flex',
                          flexDirection: 'Row',
                          '@media only screen and (max-width: 1215px)': {
                            flexDirection: 'Row',
                          },
                        }}
                      >
                        <Grid item>{step === 3 ? <img src={numberthreenew} /> : <img src={numberthree} />}</Grid>
                        <Grid item>
                          <Typography
                            sx={{
                              fontFamily: ' League Spartan, sans-serif',
                              fontsize: '32px',
                            }}
                          >
                            {' '}
                            check In Details
                          </Typography>
                        </Grid>
                      </Grid>
                    </li>
                  </ul>
                </Grid>
              </Grid>

              <Grid item lg={9} md={9} sm={12} xs={12} sx={{ padding: { lg: '20px 150px !important', md: '20px 150px', sm: '20px 80px', xs: '20px 50px' } }}>
                {step === 1 ? renderStepOne() : null}
                {step === 2 ? renderStepTwo() : null}
                {step === 3 ? renderStepThree() : null}
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    );
  };

  const [openviewed, setOpenviewed] = useState(false);
  const handleClickOpenviewed = () => {
    setOpenviewed(true);
  };
  const handleCloseviewed = () => {
    setOpenviewed(false);
  };

  return (
    <>
      <GlobalStyles
        styles={{
          '@import': "url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@100..900&display=swap')",
          body: {
            fontFamily: 'League Spartan, sans-serif',
          },
        }}
      />
      <>{renderIndicator()}</>

      {/* <Headtitle title={"ADD VISITORS"} /> */}

      {/* ALERT DIALOG */}

      <Dialog open={openviewed} onClose={handleClickOpenviewed} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="sm">
        {/* <Box sx={{ padding: "20px" }}> */}
        <Grid container spacing={2}>
          <Grid item lg={12} md={12}>
            <Typography
              sx={{
                fontWeight: 'bold',
                fontSize: '50px',
                color: 'black',
                textAlign: 'center',
                alignitems: 'center',
                fontFamily: ' League Spartan, sans-serif',
              }}
            >
              Check Out Details
            </Typography>
          </Grid>

          <Grid item lg={12} md={12}>
            <Typography
              sx={{
                fontWeight: 'bold',
                fontSize: '40px',
                color: 'black',
                fontFamily: ' League Spartan, sans-serif',
                marginLeft: '15px',
              }}
            >
              Bye{' '}
              <img
                style={{
                  marginRight: '3px',
                  height: '40px',
                  width: '40px',
                }}
                src={wave}
              />{' '}
              !
            </Typography>
          </Grid>
          <br />
          <Grid item lg={12} md={12} sx={{ justifyContent: 'center', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                style={{
                  height: '200px',
                  width: '200px',
                  textAlign: 'center',
                }}
                src={uploadconfetti}
                alt=""
              />{' '}
            </Box>
          </Grid>
          <Grid item lg={1} md={1}></Grid>
          <Grid item lg={12} md={12} sm={12} sx={{ justifyContent: 'center', alignItems: 'center' }}>
            <Typography
              sx={{
                fontWeight: 'bold',
                fontSize: '30px',
                color: 'black',
                textAlign: 'center',
                alignitems: 'center',
                fontFamily: ' League Spartan, sans-serif',
              }}
            >
              Check Out Successfully
            </Typography>
          </Grid>
          {/* </Grid> */}
          {/* </Grid> */}
          <Grid item md={1}></Grid>
          <Grid item lg={12} md={12}>
            {/* <Footer /> */}
            {localStorage.length === 0 && <Footer />}
          </Grid>
        </Grid>
        {/* </Box> */}
      </Dialog>

      {/* Table For Duplicate Profile Upload */}
      <Box>
        {/* Edit DIALOG */}
        <Dialog open={isErrorOpenpop} onClose={handleCloseerrpop} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="lg" fullWidth={true} sx={{ marginTop: '80px' }}>
          <Box sx={userStyle.dialogbox}>
            <>
              <Typography sx={userStyle.HeaderText}>
                {' '}
                <b>Existing Profile List</b>
              </Typography>
              <Grid item md={6} sm={12} xs={12}>
                {showDupProfileVIsitor && showDupProfileVIsitor.length > 0 ? (
                  <ExistingProfileVisitor ExistingProfileVisitors={showDupProfileVIsitor} handleCloseModEdit={handleCloseModEdit} />
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
                  <Button variant="contained" onClick={handleCloseerrpop}>
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>

      {/* UPLOAD IMAGE DIALOG */}
      <Dialog open={uploadPopupOpen} onClose={handleUploadPopupClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="md" fullWidth={true} sx={{ marginTop: '80px' }}>
        <DialogTitle
          id="customized-dialog-title1"
          sx={{ backgroundColor: '#e0e0e0', color: '#000', display: 'flex' }}
          onClick={() => {
            console.log(refImage);
            console.log(isLightColor);
          }}
        >
          Upload Image
        </DialogTitle>
        <DialogContent sx={{ minWidth: '750px', height: '850px' }}>
          <Grid container spacing={2}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Typography variant="body2" style={{ marginTop: '5px' }}>
                {/* Max File size: 5MB */}
              </Typography>
              {/* {showDragField ? ( */}
              <div onDragOver={handleDragOver} onDrop={handleDrop} onPaste={handlePaste}>
                {previewURL && refImageDrag.length > 0 ? (
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
                              value={colorDrag[index]}
                              onChange={(e) => {
                                handleColorChangeDrag(e, index);
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
                            onClick={(e) => handleSubmitDrag(index)}
                            // loading={bgbtnDrag}
                            loading={bgbtnDrag[index]}
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
                              // color: isLightColorDrag ? 'black' : 'white',
                              fontWeight: '600',
                              // backgroundColor: colorDrag, // Dynamically set the background color
                              // '&:hover': {
                              //   backgroundColor: `${colorDrag}90`, // Slightly transparent on hover for a nice effect
                              // },
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
                      <ContentCopyIcon /> {'Drag and drop or Paste here (ctrl+v)'}
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
                  <Button variant="contained" component="label" color="primary">
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
              {isWebcamCapture == true &&
                capturedImages.map((image, index) => (
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
                          onClick={() => renderFilePreview(image, index)}
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
                              // color: isLightColorCaptured[index] ? 'black' : 'white',
                              fontWeight: '600',
                              // backgroundColor: colorCaptured[index], // Dynamically set the background color
                              // '&:hover': {
                              //   backgroundColor: `${colorCaptured[index]}90`, // Slightly transparent on hover for a nice effect
                              // },
                              border: '1px solid  black',
                            }}
                          ></LoadingButton>
                        </div>
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              {refImage.map((file, index) => (
                <Grid container key={index}>
                  <Grid item md={2} sm={2} xs={2}>
                    <Box
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {file.type.includes('image/') ? (
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
                    md={7}
                    sm={7}
                    xs={7}
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
                        onClick={() => renderFilePreview(file, index)}
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
                            // color: isLightColor[index] ? 'black' : 'white',
                            fontWeight: '600',
                            // backgroundColor: color[index], // Dynamically set the background color
                            // '&:hover': {
                            //   backgroundColor: `${color[index]}90`, // Slightly transparent on hover for a nice effect
                            // },
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
          <Button onClick={handleUploadOverAll} color="primary">
            Ok
          </Button>
          <Button onClick={resetImage} color="primary">
            Reset
          </Button>
          <Button onClick={handleUploadPopupClose} color="primary">
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
            webcamCloseedit={webcamClose}
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
              setColorDrag([]);
              setColor([]);
            }}
          >
            CANCEL
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isErrorOpenpopdragdrop} onClose={handleCloseerrpopdragdrop} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="lg" fullWidth={true} sx={{ marginTop: '80px' }}>
        <Box sx={userStyle.dialogbox}>
          <>
            <Typography sx={userStyle.HeaderText}>
              {' '}
              <b>Existing Profile List</b>
            </Typography>
            <Grid item md={6} sm={12} xs={12}>
              {showAlertpopdragdrop && showAlertpopdragdrop.length > 0 ? (
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
                <Button variant="contained" color="primary" onClick={handleCloseerrpopdragdrop}>
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </>
        </Box>
      </Dialog>
      <MessageAlert openPopup={openPopupMalert} handleClosePopup={handleClosePopupMalert} popupContent={popupContentMalert} popupSeverity={popupSeverityMalert} />
      {/* SUCCESS */}
      <AlertDialog openPopup={openPopup} handleClosePopup={handleClosePopup} popupContent={popupContent} popupSeverity={popupSeverity} />
      <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        {/* <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '80px', color: 'tomato' }} />
          <Typography variant="h6" sx={{ fontFamily: 'JostMedium', fontWeight: 'bold' }}>
            {showAlert}
          </Typography>
        </DialogContent> */}
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
              {severityIcons['warning']}
              <Typography sx={{ fontSize: '1.4rem', fontWeight: '600', color: 'black' }}>{showAlert}</Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            {/* <Button variant="outlined" color="error" sx={{ color: 'tomato' }} onClick={handleCloseerr}>
              ok
            </Button> */}
            <Button onClick={handleCloseerr} variant="contained" color="primary">
              Close
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <LoadingBackdrop open={isLoading} />
    </>
  );
}
export default Visitorsregister;