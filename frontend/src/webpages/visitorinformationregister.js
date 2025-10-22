import { makeStyles } from '@material-ui/core';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EastIcon from '@mui/icons-material/East';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WestIcon from '@mui/icons-material/West';
import LoadingButton from '@mui/lab/LoadingButton';
import { DialogTitle, Backdrop, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControl, FormControlLabel, FormGroup, GlobalStyles, Grid, MenuItem, OutlinedInput, Select, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
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
import numberonenew from './images/onenew.png';
import numberthree from './images/three.png';
import numberthreenew from './images/threenew.png';
import numberfour from './images/four.png';
import numberfournew from './images/fournew.png';
import numbertwo from './images/two.png';
import numbertwonew from './images/twonew.png';
import wave from './images/waving.png';
import uploadconfetti from './images/wired-flat-1103-confetti.gif';
import './visitors.css';
import { userStyle } from './visitorstyle.js';
import { documentTypeOption, sourceVisitorOptions } from '../components/Componentkeyword';
import { Country, State, City } from 'country-state-city';
import { getPincodeDetails } from '../components/getPincodeDetails';
import { address_type, permanent_address_type, personal_prefix, landmark_and_positional_prefix } from '../components/Componentkeyword';
import FullAddressCard from '../components/FullAddressCard.js';
import PincodeButton from '../components/PincodeButton.js';
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
function calculateLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Calculate luminance using the formula
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // If luminance is greater than 128, it's a light color
  return luminance > 128;
}
function Visitorinformationregister() {
  const [overallSettings, setOverAllsettingsCount] = useState({});

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
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Something went wrong!'}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };

  useEffect(() => {
    fetchOverAllSettings();
  }, []);
  //profile
  const [isLightColor, setIsLightColor] = useState([]);
  const [isLightColorCaptured, setIsLightColorCaptured] = useState([]);
  const [color, setColor] = useState([]);
  const [bgbtn, setBgbtn] = useState([]);
  const [colorCaptured, setColorCaptured] = useState([]);
  const [bgbtnCaptured, setBgbtnCaptured] = useState([]);
  const [uploadwithDupImage, setUploadwithDupImage] = useState([]);
  const [imageDrag, setImageDrag] = useState([]);
  const [capturedImages, setCapturedImages] = useState([]);

  const [isExistVisitor, setIsExistVisitor] = useState(false);
  const [refImagePerImage, setRefImagePerImage] = useState([]);
  const [isTemplateBranch, setIsTemplateBranch] = useState([]);
  const [selectedCountryp, setSelectedCountryp] = useState(Country.getAllCountries().find((country) => country.name === 'India'));
  const [selectedStatep, setSelectedStatep] = useState(State.getStatesOfCountry(selectedCountryp?.isoCode).find((state) => state.name === 'Tamil Nadu'));
  const [selectedCityp, setSelectedCityp] = useState(City.getCitiesOfState(selectedStatep?.countryCode, selectedStatep?.isoCode).find((city) => city.name === 'Tiruchirappalli'));
  //current Address
  const [selectedCountryc, setSelectedCountryc] = useState(Country.getAllCountries().find((country) => country.name === 'India'));
  const [selectedStatec, setSelectedStatec] = useState(State.getStatesOfCountry(selectedCountryc?.isoCode).find((state) => state.name === 'Tamil Nadu'));
  const [selectedCityc, setSelectedCityc] = useState(City.getCitiesOfState(selectedStatec?.countryCode, selectedStatec?.isoCode).find((city) => city.name === 'Tiruchirappalli'));
  const [switchValues, setSwicthValues] = useState({
    pvillageorcity: false,
    cvillageorcity: false,
  });
  const [vendor, setVendor] = useState({
    source: 'Please Select Source',
    addcandidatestatus: false,
    isinterviewnow: false,
    pgenerateviapincode: false,
    visitorid: '',
    company: 'Please Select Company',
    branch: 'Please Select Branch',
    unit: '',
    visitortype: 'Please Select Visitor Type',
    visitormode: 'Please Select Visitor Mode',
    date: '',
    prefix: 'Mr',
    firstname: '',
    lastname: '',
    interviewpreferedate: '',
    interviewpreferetime: '',
    visitorname: '',
    addesstype: '',
    personalprefix: '',
    referencename: '',
    pincode: '',
    gpscoordinate: '',
    landmarkpositionprefix: '',
    pcountry: '',
    pstate: '',
    pcity: '',
    pgenerateviapincode: false,
    pvillageorcity: '',
    pdistrict: '',
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
    samesprmnt: false,
    caddesstype: '',
    cpersonalprefix: '',
    creferencename: '',
    ccountry: '',
    cgenerateviapincode: '',
    cvillageorcity: '',
    cdistrict: '',
    cstate: '',
    ccity: '',
    cpincode: '',
    cgpscoordinate: '',
    clandmarkpositionprefix: '',
    clandmarkname: '',
    chouseflatnumber: '',
    cstreetroadname: '',
    clocalityareaname: '',

    intime: '',
    visitorpurpose: 'Please Select Visitor Purpose',
    visitorcontactnumber: '',
    visitoremail: '',
    visitorcompnayname: '',
    documenttype: 'Please Select Document Type',
    documentnumber: '',
    escortinformation: false,
    escortdetails: '',
    equipmentborrowed: '',
    outtime: '',
    remark: '',
    visitorinformationstatus: 'Pending',
    visitorbadge: '',
    visitorsurvey: '',
  });
  const [fromPinCodep, setFromPinCodep] = useState([]);
  const [fromPinCodec, setFromPinCodec] = useState([]);
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
      setRefImage(newimage);
    }

    if (reason && reason === 'backdropClick') return;
    handleCloseerrpop();

    setTimeout(() => {
      setNewimage('');
    }, 1000);
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

  const renderFilePreview = async (file) => {
    const response = await fetch(file.preview);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    window.open(link, '_blank');
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
  function handleChangeImageDrag(e) {
    console.log('hapening here');
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

            const response = await axios.post(`${SERVICE.DUPLICATECANDIDATEFACEDETECTVISITOR_FORINTERVIEW}`, {
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
                setShowAlert(
                  <>
                    <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
                    <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Only Accept Images!!'}</p>
                  </>
                );
                handleClickOpenerr();
                setIsLoading(false);
              }
            }
          } else {
            setShowAlert(
              <>
                <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
                <p style={{ fontSize: '20px', fontWeight: 900 }}>{'No Face Detected!!!'}</p>
              </>
            );
            handleClickOpenerr();
            setIsLoading(false);
          }
        } catch (error) {
          setShowAlert(
            <>
              <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
              <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Error In Face Detection!!!'}</p>
            </>
          );
          handleClickOpenerr();
          setIsLoading(false);
        } finally {
          setBtnUpload(false); // Disable loader when done
          setIsLoading(false);
        }
      };

      image.onerror = (err) => {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Error Loading Image!!!'}</p>
          </>
        );
        handleClickOpenerr();
        setBtnUpload(false); // Disable loader in case of
        setIsLoading(false);
      };

      setFile(URL.createObjectURL(file));
    } else {
      // if (file !== undefined) {
      //  setShowAlert(
      //   <>
      //     <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
      //     <p style={{ fontSize: '20px', fontWeight: 900 }}>{"File size greater than 1MB, Please upload file below 1MB!!! "}</p>
      //   </>
      // );
      // handleClickOpenerr();
      //   setBtnUpload(false);
      // }
      setBtnUpload(false);
    }
  }
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

    console.log(imageDrag, 'imageDrag');
    console.log(refImageDrag, 'refImageDrag');

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

  const [loadingdeloverall, setloadingdeloverall] = useState(false);

  const [visitorsTypeOption, setVisitorsTypeOption] = useState([]);
  const [visitorsPurposeOption, setVisitorsPurposeOption] = useState([]);

  const handleValidationfirstname = (e) => {
    let val = e.target.value;
    let numbers = new RegExp('[0-9]');
    var regExSpecialChar = /[`₹!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (e.target.value.match(numbers)) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Enter FirstName Characters Only! (A-Z or a-z)'}</p>
        </>
      );
      handleClickOpenerr();
      let num = val.length;
      let value = val.slice(0, num - 1);
      setVendor((prevState) => {
        return { ...prevState, firstname: value };
      });
    } else if (regExSpecialChar.test(e.target.value)) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Enter FirstName Characters Only! (A-Z or a-z)'}</p>
        </>
      );
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
    var regExSpecialChar = /[`₹!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (e.target.value.match(numbers)) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Enter LastName Characters Only! (A-Z or a-z)'}</p>
        </>
      );
      handleClickOpenerr();
      let num = val.length;
      let value = val.slice(0, num - 1);
      setVendor((prevState) => {
        return { ...prevState, lastname: value };
      });
    } else if (regExSpecialChar.test(e.target.value)) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Enter LastName Characters Only! (A-Z or a-z)'}</p>
        </>
      );
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
    console.log(image, 'image');
    const selectedImage = from === 'upload' ? image?.[index] : capturedImages?.[index];
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
  const handleDeleteFile = (index) => {
    const newSelectedFiles = [...refImage];
    // const bgbtnArray = [...bgbtn]
    // const colorArray = [...color]
    newSelectedFiles.splice(index, 1);
    // bgbtnArray.splice(index, 1);
    // colorArray.splice(index, 1);
    setRefImage(newSelectedFiles);
    // setBgbtn(bgbtnArray)
    // setColor(colorArray)
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

  //webcam
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [getImg, setGetImg] = useState(null);
  const [isWebcamCapture, setIsWebcamCapture] = useState(false);

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
  };

  const [buttonLoad, setButtonLoad] = useState(false);

  const backPage = useNavigate();

  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();

  // Error Popup model
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
    setButtonLoad(false);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
    setloadingdeloverall(false);
  };

  const fetchInteractorType = async () => {
    try {
      let res_freq = await axios.get(SERVICE.ALL_MANAGETYPEPG);
      console.log(res_freq?.data?.manageTypePG, 'res_freq?.data?.manageTypePG');
      setVisitorsTypeOption(
        res_freq?.data?.manageTypePG.map((t) => ({
          ...t,
          label: t.interactorstype,
          value: t.interactorstype,
          addcandidate: t.addcandidate,
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
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Something went wrong!'}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };
  const [visitorsModeOption, setVisitorsModeOption] = useState([]);
  //get all interactorMode name.
  const fetchInteractorMode = async () => {
    try {
      let res_freq = await axios.get(SERVICE.ALL_INTERACTORMODE);
      setVisitorsModeOption(
        res_freq?.data?.interactormode.map((t) => ({
          ...t,
          label: t.name,
          value: t.name,
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
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Something went wrong!'}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };

  const fetchBranchTemplate = async () => {
    try {
      let res = await axios.post(`${SERVICE.BRANCH_TEMPLATEVVISITORINFORMATION}`, {
        branch: branch,
      });
      setIsTemplateBranch(res?.data?.templatecontrolpanel);
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
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Something went wrong!'}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };

  const fetchInteractorPurpose = async (e) => {
    try {
      let res = await axios.get(SERVICE.ALL_MANAGETYPEPG);

      let result = res.data.manageTypePG.filter((d) => d.interactorstype === e);

      let ans = result.flatMap((data) => data.interactorspurpose);

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
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Something  went wrong!'}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };
  useEffect(() => {
    fetchInteractorMode();
    fetchInteractorType();
    fetchBranchTemplate();
  }, []);

  const { company, branch, unit } = useParams();

  let name = 'create';
  let nameedit = 'edit';
  let allUploadedFiles = [];

  let today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();

  const formattedToday = `${yyyy}-${mm}-${dd}`;
  let now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  let currtime = `${hours}:${minutes}`;

  const [filteredUnits, setFilteredUnits] = useState([]);

  const [olduniqueid, setOldUnique] = useState(0);

  const fetchAssignedBy = async () => {
    try {
      let res_vendor = await axios.get(SERVICE.CANDIDATESALLCOUNT);
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
      }
    }
  };

  const fetchUnits = async () => {
    try {
      let res_unit = await axios.get(SERVICE.UNIT);
      const matchedUnits = res_unit?.data?.units.filter((item) => item.branch === branch).map((item) => item.name);
      setFilteredUnits(matchedUnits);
      console.log(matchedUnits, 'matchedUnits');
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
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Something went wrong!'}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };

  useEffect(() => {
    fetchAssignedBy();
    fetchUnits();
  }, []);

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

  let uniqueid = olduniqueid ? Number(olduniqueid?.unique) : 0;
  let idfinal = Number(uniqueid) + 1;
  console.log('This is the Page');
  const sendRequest = async (type, index) => {
    console.log('start outer');
    try {
      console.log('start inner');
      setloadingdeloverall(true);
      const resuniqdata = await fetchLastindexVendor();
      let formData = new FormData();

      if (uploadBills?.length > 0) {
        uploadBills.forEach((item) => {
          formData.append('visitordocument', item.file); // `files` is the key for multiple files
        });
      }

      const jsonData = {
        unique: Number(idfinal),
        company: String(company),
        branch: String(branch),
        unit: String(filteredUnits[0]),
        visitorid: String(resuniqdata),
        visitorcommonid: String(resuniqdata),
        visitortype: String(vendor.visitortype),
        visitormode: String(vendor.visitormode),
        source: String(vendor.source),
        visitorpurpose: String(vendor.visitorpurpose),
        prefix: String(vendor.prefix),
        visitorname: String(vendor.firstname + ' ' + vendor.lastname),
        visitorcontactnumber: String(vendor.visitorcontactnumber),
        visitoremail: String(vendor.visitoremail),
        visitorcompnayname: String(vendor.firstname + ' ' + vendor.lastname),
        intime: String(currtime),
        isinterviewnow: Boolean(vendor.isinterviewnow),
        interviewpreferedate: String(vendor?.isinterviewnow ? formattedToday : vendor.interviewpreferedate),
        interviewpreferetime: String(vendor?.isinterviewnow ? currtime : vendor.interviewpreferetime),
        date: String(formattedToday),
        documenttype: String(vendor?.documenttype),
        faceDescriptor: vendor?.faceDescriptor?.length > 0 ? vendor?.faceDescriptor : [],
        documentnumber: String(vendor?.documentnumber),
        escortinformation: false,
        escortdetails: '',
        equipmentborrowed: '',
        outtime: '',
        remark: '',
        visitorbadge: '',
        visitorsurvey: '',
        visitorinformationstatus: 'Pending',
        interactorstatus: 'visitorinformation',
        //Newvalue
        pgenerateviapincode: Boolean(vendor?.pgenerateviapincode || false),
        pvillageorcity: String(vendor?.pvillageorcity || ''),
        pdistrict: String(vendor?.pdistrict),
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

        pbuildingapartmentname: String(vendor?.pbuildingapartmentname || ''),
        paddressone: String(vendor?.paddressone || ''),
        paddresstwo: String(vendor?.paddresstwo || ''),
        paddressthree: String(vendor?.paddressthree || ''),

        caddressone: !vendor.samesprmnt ? String(vendor?.caddressone || '') : String(vendor?.paddressone || ''),
        caddresstwo: !vendor.samesprmnt ? String(vendor?.caddresstwo || '') : String(vendor?.paddresstwo || ''),
        caddressthree: !vendor.samesprmnt ? String(vendor?.caddressthree || '') : String(vendor?.paddressthree || ''),
        cbuildingapartmentname: !vendor.samesprmnt ? String(vendor?.cbuildingapartmentname || '') : String(vendor?.pbuildingapartmentname || ''),

        ccountry: !vendor.samesprmnt ? String(selectedCountryc?.name == undefined ? '' : selectedCountryc?.name) : String(selectedCountryp?.name == undefined ? '' : selectedCountryp?.name),
        cstate: !vendor.samesprmnt ? String(selectedStatec?.name == undefined ? '' : selectedStatec?.name) : String(selectedStatep?.name == undefined ? '' : selectedStatep?.name),
        ccity: !vendor.samesprmnt ? String(selectedCityc?.name == undefined ? '' : selectedCityc?.name) : String(selectedCityp?.name == undefined ? '' : selectedCityp?.name),
        cpincode: !vendor.samesprmnt ? String(vendor.cpincode) : String(vendor.ppincode),
        cgpscoordinate: !vendor.samesprmnt ? String(vendor.cgpscoordinate) : String(vendor.gpscoordinate),
        detailsaddedy: String('Self /' + vendor.firstname + ' ' + vendor.lastname),
        files: allUploadedFiles.concat(refImage, refImageDrag, capturedImages),
        addedby: [{ name: String(vendor.firstname + ' ' + vendor.lastname), date: String(new Date()) }],
      };

      formData.append('jsonData', JSON.stringify(jsonData));

      let addVendorDetails = await axios.post(SERVICE.CREATE_VISITORINFORMATIONS, formData);
      const filesImages = allUploadedFiles.concat(refImage, refImageDrag, capturedImages);
      const visitorInfoDetails = await BiometricVisitorAddition({
        company: String(company),
        branch: String(branch),
        name: String(vendor.firstname + '' + vendor.lastname),
        photo: filesImages[0]?.base64,
        date: Boolean(vendor.isinterviewnow) ? formattedToday : vendor.interviewpreferedate ? vendor.interviewpreferedate : formattedToday,
      });
      let addmailcreation = await axios.post(SERVICE.VISITOR_INFORMATION_MAILCREATION, {
        useremail: vendor.visitoremail,
        visitorname: vendor.firstname + ' ' + vendor.lastname,
        company: company,
        visitorid: resuniqdata,
        visitorpurpose: vendor?.visitorpurpose,
        branch: branch,
        fromemail: isTemplateBranch[0]?.fromemail,
        ccemail: isTemplateBranch[0]?.ccemail,
        bccemail: isTemplateBranch[0]?.bccemail,
        companyname: isTemplateBranch[0]?.companyname,
        address: isTemplateBranch[0]?.address,
        companyurl: isTemplateBranch[0]?.companyurl,
      });
      nextStep();

      setTimeout(() => {
        backPage(`/visitorinformation/${company}/${branch}`);
      }, 3000);

      setVendor({
        ...vendor,
        addcandidatestatus: false,
        isinterviewnow: false,
        source: 'Please Select Source',
        pgenerateviapincode: false,
        visitorid: '',
        company: 'Please Select Company',
        branch: 'Please Select Branch',
        unit: '',
        visitortype: 'Please Select Visitor Type',
        visitormode: 'Please Select Visitor Mode',
        prefix: 'Mr',
        interviewpreferedate: '',
        firstname: '',
        interviewpreferetime: '',
        lastname: '',
        visitorname: '',
        addesstype: '',
        personalprefix: '',
        referencename: '',
        pincode: '',
        gpscoordinate: '',
        landmarkpositionprefix: '',
        pcountry: '',
        pstate: '',
        pcity: '',
        pgenerateviapincode: false,
        pvillageorcity: '',
        pdistrict: '',
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
        samesprmnt: false,
        caddesstype: '',
        cpersonalprefix: '',
        creferencename: '',
        ccountry: '',
        cgenerateviapincode: '',
        cvillageorcity: '',
        cdistrict: '',
        cstate: '',
        ccity: '',
        cpincode: '',
        cgpscoordinate: '',
        clandmarkpositionprefix: '',
        clandmarkname: '',
        chouseflatnumber: '',
        cstreetroadname: '',
        clocalityareaname: '',

        visitorpurpose: 'Please Select Visitor Purpose',
        visitorcontactnumber: '',
        visitoremail: '',
        visitorcompnayname: '',
        documenttype: 'Please Select Document Type',
        documentnumber: '',
        escortinformation: false,
        escortdetails: '',
        equipmentborrowed: '',
        outtime: '',
        remark: '',
        visitorinformationstatus: 'Pending',
        visitorbadge: '',
        visitorsurvey: '',
      });
      setloadingdeloverall(false);
      setIsExistVisitor(false);
      console.log(resuniqdata, 'id');
      setShowAlert(
        <>
          <CheckCircleOutlineIcon sx={{ fontSize: '100px', color: '#7ac767' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{`${'Added Successfully 👍!! Check Your Email!! Kindly Save Your Visitor ID:'}${resuniqdata}`}</p>
        </>
      );
      handleClickOpenerr();
    } catch (err) {
      console.log(err, 'err1');
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
      }
    }
  };
  function isValidEmail(email) {
    // Regular expression for a simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const stepOne = () => {
    if (refImage?.length === 0 && capturedImages?.length === 0 && refImageDrag?.length === 0) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Upload Photograph!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (vendor.firstname == '') {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Enter FirstName!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (!isExistVisitor && vendor.lastname == '') {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Enter LastName!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (vendor.visitoremail == '') {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Enter Email!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (!isValidEmail(vendor.visitoremail) && vendor.visitoremail != '') {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Enter Valid Email!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (vendor.visitorcontactnumber == '') {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Enter Mobile Number!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (vendor.visitorcontactnumber.length != 10) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Enter Valid Mobile No!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (vendor.visitortype === 'Please Select Visitor Type') {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Select Visitor Type!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (vendor.visitormode === 'Please Select Visitor Mode') {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Select Visitor Mode!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (vendor.source === 'Please Select Source') {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Select Visitor Source!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (vendor.visitorpurpose === 'Please Select Visitor Purpose') {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Select Visitor Purpose!'}</p>
        </>
      );
      handleClickOpenerr();
    } else {
      nextStep();
    }
  };
  const handlesubmit = () => {
    if (
      vendor?.personalprefix === '' ||
      vendor?.referencename === '' ||
      vendor?.landmarkpositionprefix === '' ||
      vendor?.landmarkname === '' ||
      vendor?.houseflatnumber === '' ||
      vendor?.streetroadname === '' ||
      vendor?.localityareaname === '' ||
      selectedCityp?.name === '' ||
      selectedStatep?.name === '' ||
      selectedCountryp?.name === '' ||
      vendor?.ppincode === '' ||
      vendor?.gpscoordinate === ''
    ) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Fill All Permanent Address Field!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (vendor?.pgenerateviapincode === true && vendor?.pvillageorcity === '') {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Fill All Permanent Address Field!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (
      vendor?.samesprmnt === false &&
      (vendor?.caddesstype === '' ||
        vendor?.cpersonalprefix === '' ||
        vendor?.creferencename === '' ||
        selectedCountryc?.name === '' ||
        vendor?.cpincode === '' ||
        selectedStatec?.name === '' ||
        vendor?.cgpscoordinate === '' ||
        vendor?.clandmarkpositionprefix === '' ||
        vendor?.clandmarkname === '' ||
        vendor?.chouseflatnumber === '' ||
        vendor?.cstreetroadname === '' ||
        vendor?.clocalityareaname === '')
    ) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Fill All Current Address Field!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (vendor?.samesprmnt === false && vendor?.cgenerateviapincode === true && vendor?.cvillageorcity === '') {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Fill All Permanent Address Field!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (vendor?.addcandidatestatus === true && vendor?.isinterviewnow === false && vendor.interviewpreferedate == '') {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Enter Interview Prefered Date!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (vendor?.addcandidatestatus === true && vendor?.isinterviewnow === false && vendor.interviewpreferedatetime == '') {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Enter Interview Prefered Time!'}</p>
        </>
      );
      handleClickOpenerr();
    } else {
      console.log('yes');
      sendRequest();
    }
  };

  //   const stepTwo = () => {
  //   if (capturedImages.length == 0 || capturedImages.some((d) => d.preview === null || d.base64 === undefined)) {
  // setShowAlert(  <>
  //           <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
  //           <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Upload Image!'}</p>
  //         </>
  //       );
  //     handleClickOpenerr();
  //   } else {
  //     nextStep();
  //   }
  // };
  const stepTwo = () => {
    if (vendor.documenttype === 'Please Select Document Type') {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Select Document Type!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (vendor.documentnumber === '') {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Enter Document Number!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (uploadBills.length == 0 || uploadBills.some((d) => d.file === null || d.file === undefined)) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Upload Document!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (vendor.documenttype === 'Aadhar Card' && vendor.documentnumber?.length != 12) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Enter Correct 12 Digit Aadhar Number!'}</p>
        </>
      );
      handleClickOpenerr();
    } else if (vendor.documenttype === 'Pan Card' && vendor.documentnumber?.length != 10) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Please Enter Correct 10 Digit PAN Number!'}</p>
        </>
      );
      handleClickOpenerr();
    } else {
      nextStep();
    }
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

  const [billUploadedFiles, setBillUploadedFiles] = useState([]);
  const [billUploadedFilesRequest, setBillUploadedFilesRequest] = useState([]);
  const [uploadBills, setUploadBills] = useState([]);
  const [uploadBillsRequestDocument, setUploadBillsRequestDocument] = useState([]);

  function handleChangeImage(e) {
    setIsLoading(true);
    setBtnUpload(true); // Enable loader when the process starts
    const maxFileSize = 1 * 1024 * 1024; // 1MB in bytes
    // Get the selected file
    const file = e.target.files[0];
    if (file && file.size < maxFileSize) {
      const path = URL.createObjectURL(file);
      const image = new Image();
      image.src = path;
      const NewData = [];
      NewData.push({
        name: file.name,
        size: file.size,
        type: file.type,
        preview: path,
        base64: path.split(',')[1],
      });
      setNewimage(NewData);
      image.onload = async () => {
        try {
          const detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
          if (detections.length > 0) {
            const faceDescriptor = detections[0].descriptor;
            const response = await axios.post(`${SERVICE.DUPLICATECANDIDATEFACEDETECTVISITOR}`, {
              faceDescriptor: Array.from(faceDescriptor),
            });
            // if (response?.data?.matchfound) {
            //   setIsLoading(false);
            //   // setUploadwithDupImage(e)
            //   setShowDupProfileVIsitor(response?.data?.matchedData);
            //   handleClickOpenerrpop();
            // } else {
            const files = e.target.files;
            let newSelectedFiles = [...refImage];
            for (let i = 0; i < files.length; i++) {
              const file = files[i];

              if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                  newSelectedFiles.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    preview: reader.result,
                    base64: reader.result.split(',')[1],
                  });
                  setRefImage(newSelectedFiles);
                  const base64Data = reader.result.split(',')[1]; // Get base64 data (without the prefix)
                  const binaryData = atob(base64Data); // Decode base64 data
                  const arrayBuffer = new ArrayBuffer(binaryData.length);
                  const uint8Array = new Uint8Array(arrayBuffer);
                  // Fill the array buffer with the decoded binary data
                  for (let i = 0; i < binaryData.length; i++) {
                    uint8Array[i] = binaryData.charCodeAt(i);
                  }
                  // Create a Blob from the binary data
                  const blob = new Blob([uint8Array], { type: 'image/png' });
                  setImage((prev) => [...prev, blob]);
                  // setBgbtn((prev) => {
                  //   let availed = [...prev]
                  //   if (availed.length > 0) {
                  //     availed.push(false)
                  //   } else {
                  //     Array(newSelectedFiles.length).fill(false)
                  //   }
                  //   return availed;
                  // })
                  // setColor((prev) => {
                  //   let availed = [...prev];

                  //   // Check if there are any existing colors in the state
                  //   if (availed.length > 0) {
                  //     availed.push("#ffffff");
                  //   } else {
                  //     // If no colors are present, create a new array with default colors
                  //     availed = Array(newSelectedFiles.length).fill("#ffffff");
                  //   }
                  //   // Calculate luminance for the updated array of colors
                  //   const updated = availed.map((color) => calculateLuminance(color));
                  //   // Update the state for color and light color
                  //   setIsLightColor(updated);
                  //   return availed;
                  // });
                };
                reader.readAsDataURL(file);
              }
            }
            toDataURL(path, function (dataUrl) {
              setVendor({
                ...vendor,
                uploadedimage: String(dataUrl),
                faceDescriptor: Array.from(faceDescriptor),
              });
            });
            // }
            setIsLoading(false);
          } else {
            setIsLoading(false);
            setShowAlert(
              <>
                <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
                <p style={{ fontSize: '20px', fontWeight: 900 }}>{'No Face Detected!'}</p>
              </>
            );
            handleClickOpenerr();
          }
        } catch (error) {
          setIsLoading(false);
          setShowAlert(
            <>
              <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
              <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Error In Face Detection!'}</p>
            </>
          );
          handleClickOpenerr();
        } finally {
          setIsLoading(false);
          setBtnUpload(false); // Disable loader when done
        }
      };

      image.onerror = (err) => {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{'Error Loading Image!'}</p>
          </>
        );
        handleClickOpenerr();
        setBtnUpload(false); // Disable loader in case of error
      };

      setFile(URL.createObjectURL(file));
    } else {
      setIsLoading(false);
      if (file !== undefined) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
            <p style={{ fontSize: '20px', fontWeight: 900 }}>{'File Size Is Greater Than 1MB, Please Upload a File Below 1MB!'}</p>
          </>
        );
        handleClickOpenerr();
        setBtnUpload(false);
      }
    }
  }

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
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
          <p style={{ fontSize: '20px', fontWeight: 900 }}>{`The following files are larger than 1MB and will not be uploaded:\n${largeFiles.join(', ')}`}</p>
        </>
      );
      handleClickOpenerr();
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

  const renderFilePreviewMulter = async (file) => {
    const url = window.URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    window.open(link, '_blank');
  };

  const renderFilePreviewMulterUploaded = async (file) => {
    if (!file) return false;
    const imageUrl = `${SERVICE.VEIW_VISITORINFORMATION_FILES}/${file.filename}`;
    window.open(imageUrl, '_blank'); // Open image in a new tab
  };

  const handleDeleteUploadedBills = (index) => {
    setBillUploadedFiles((prevFiles) => {
      const fileToDelete = prevFiles[index];

      // Remove from uploadedFiles state
      return prevFiles?.filter((_, i) => i !== index);
    });
  };

  const handleDeleteFileDocumentEdit = (index) => {
    const newSelectedFiles = [...uploadBills];
    newSelectedFiles.splice(index, 1);
    setUploadBills(newSelectedFiles);
  };
  const renderStepOne = () => {
    return (
      <>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography sx={{ color: '#171A1C', fontWeight: 700, fontFamily: 'JostMedium', fontSize: { md: '25px', sm: '25px', xs: '22px' } }}>Visitor Registration</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <FormControl size="small" fullWidth>
                <Typography
                  sx={{
                    color: 'black',
                    fontFamily: ' League Spartan, sans-serif',
                    fontsize: '30px',
                  }}
                >
                  {' '}
                  <b>Photograph</b> <b style={{ color: 'red' }}>*</b>
                </Typography>
                <Grid sx={{ display: 'flex' }}>
                  <Button variant="contained" component="label" onClick={handleClickUploadPopupOpen}>
                    Upload
                    {/* <input type="file" multiple id="productimage" accept="image/*" hidden onChange={handleClickUploadPopupOpen} /> */}
                  </Button>
                  &ensp;
                </Grid>
              </FormControl>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              {/* {refImage.map((file, index) => (
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
              ))} */}

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

            <Grid item lg={6} md={6} xs={12} sm={6}>
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
                <Grid item md={2} sm={3} xs={3}>
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

                <Grid item md={10} sm={9} xs={9}>
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

            <Grid item lg={6} md={6} xs={12} sm={6}>
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

            <Grid item lg={6} md={6} xs={12} sm={6}>
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
                  value={vendor.visitoremail}
                  onChange={(e) => {
                    setVendor({
                      ...vendor,
                      visitoremail: e.target.value,
                    });
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item lg={6} md={6} xs={12} sm={6}>
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
                    backgroundColor: '#E3E3E3',
                  }}
                  id="component-outlined"
                  type="text" // Use text to fully control input
                  value={vendor.visitorcontactnumber}
                  onChange={(e) => {
                    const input = e.target.value;
                    // Remove non-digit characters
                    const onlyDigits = input.replace(/\D/g, '');

                    if (onlyDigits.length > 10) {
                      setShowAlert(
                        <>
                          <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
                          <p style={{ fontSize: '20px', fontWeight: 900 }}>{"Mobile Number Can't Be More Than 10 Digits"}</p>
                        </>
                      );
                      handleClickOpenerr();

                      // Keep only the first 10 digits
                      setVendor({
                        ...vendor,
                        visitorcontactnumber: onlyDigits.slice(0, 10),
                      });
                    } else {
                      setVendor({
                        ...vendor,
                        visitorcontactnumber: onlyDigits,
                      });
                    }
                  }}
                  inputProps={{
                    inputMode: 'numeric', // Brings up numeric keyboard on mobile
                    pattern: '[0-9]*', // Accept only numbers
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item lg={6} md={6} xs={12} sm={6}>
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
                      addcandidatestatus: e.addcandidate,
                      visitortype: e.value,
                      visitorpurpose: 'Please Select Visitor Purpose',
                    });
                    fetchInteractorPurpose(e.value);
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item lg={6} md={6} xs={12} sm={6}>
              <Typography
                sx={{
                  color: 'black',
                  fontFamily: ' League Spartan, sans-serif',
                  fontsize: '30px',
                }}
              >
                <b>Visitor Mode</b>
                <b style={{ color: 'red' }}>*</b>:&emsp;
              </Typography>
              <FormControl fullWidth size="small">
                <Typography></Typography>
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

            <Grid item lg={6} md={6} xs={12} sm={6}>
              <Typography
                sx={{
                  color: 'black',
                  fontFamily: ' League Spartan, sans-serif',
                  fontsize: '30px',
                }}
              >
                <b>Source</b>
                <b style={{ color: 'red' }}>*</b>:&emsp;
              </Typography>
              <FormControl fullWidth size="small">
                <Typography></Typography>
                <Selects
                  maxMenuHeight={300}
                  options={sourceVisitorOptions}
                  placeholder="Please Select Source"
                  value={{
                    label: vendor.source,
                    value: vendor.source,
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

            <Grid item lg={6} md={6} xs={12} sm={6}>
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
            <br />
            <br />
            <Grid container marginTop={5}>
              <Footer />
            </Grid>
          </Grid>
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
                    <Button variant="contained" component="label">
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
            <Button onClick={handleUploadOverAll}>Ok</Button>
            <Button onClick={resetImage}>Reset</Button>
            <Button onClick={handleUploadPopupClose}>Cancel</Button>
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
              // handleCloseModEdit={handleCloseModEditProfileCheck}
              // webcamCloseedit={webcamCloseedit}
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
      </>
    );
  };

  const renderStepTwo = () => {
    return (
      <>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography sx={{ color: '#171A1C', fontWeight: 700, fontFamily: 'JostMedium', fontSize: { md: '25px', sm: '25px', xs: '22px' } }}> ID Proof</Typography>
          </Box>
          <br />
          <Grid container spacing={2}>
            <Grid item lg={6} md={6} xs={12} sm={6}>
              <Typography
                sx={{
                  color: 'black',
                  fontFamily: ' League Spartan, sans-serif',
                  fontsize: '30px',
                }}
              >
                <b>Document Type</b>
                <b style={{ color: 'red' }}>*</b>:&emsp;
              </Typography>
              <FormControl fullWidth size="small">
                <Typography></Typography>
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
            <Grid item lg={6} md={6} xs={12} sm={6}>
              <Typography
                sx={{
                  color: 'black',
                  fontFamily: ' League Spartan, sans-serif',
                  fontsize: '30px',
                }}
              >
                {' '}
                <b> Document Number</b> <b style={{ color: 'red' }}>*</b>:&emsp;
              </Typography>
              <FormControl size="small" fullWidth>
                <OutlinedInput
                  style={{
                    backgroundColor: '#E3E3E3', // Background color
                  }}
                  id="component-outlined"
                  type="text"
                  value={vendor.documentnumber}
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
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <FormControl size="small" fullWidth>
                <Typography
                  sx={{
                    color: 'black',
                    fontFamily: ' League Spartan, sans-serif',
                    fontsize: '30px',
                  }}
                >
                  {' '}
                  <b>Upload Document</b> <b style={{ color: 'red' }}>*</b>
                </Typography>
                <Grid sx={{ display: 'flex' }}>
                  <Button variant="contained" component="label">
                    Upload
                    <input type="file" multiple id="documentimage" accept=".xlsx, .xls, .csv, .pdf, .txt, .png, .jpeg" hidden onChange={handleInputChangedocument} />
                  </Button>
                  &ensp;
                </Grid>
              </FormControl>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
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
            <br />
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

              <Button
                className="next"
                size="small"
                variant="contained"
                sx={{ ...userStyle.nextbutton, width: '100px', marginRight: 0 }}
                onClick={() => {
                  stepTwo();
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
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography sx={{ color: '#171A1C', fontWeight: 700, fontFamily: 'JostMedium', fontSize: { md: '25px', sm: '25px', xs: '22px' } }}> Address</Typography>
          </Box>
          <br />
          <Grid container>
            <Grid item md={12} xs={12} sm={12}>
              <Typography sx={userStyle.SubHeaderText}> Permanent Address</Typography>
              <br />
              <>
                <Grid container spacing={2}>
                  <Grid item md={4} xs={12} sm={6}>
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
                  <Grid item md={4} xs={12} sm={6}>
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
                  <Grid item md={4} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>Reference Name </Typography>
                      <OutlinedInput
                        style={{
                          backgroundColor: '#E3E3E3', // Background color
                        }}
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
                  <Grid item md={4} xs={12} sm={6}>
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
                      <Grid item md={4} xs={12} sm={6}>
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
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>Pincode</Typography>

                        <OutlinedInput
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
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
                  <Grid item md={4} xs={12} sm={6}>
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
                      <Grid item md={4} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>District</Typography>
                          <OutlinedInput id="component-outlined" type="text" value={vendor?.pdistrict || ''} readOnly sx={userStyle.input} />
                        </FormControl>
                      </Grid>
                      <Grid item md={4} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography> Village/City </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flexGrow: 1 }}>
                              {switchValues?.pvillageorcity ? (
                                <OutlinedInput
                                  id="component-outlined"
                                  style={{
                                    backgroundColor: '#E3E3E3', // Background color
                                  }}
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
                    <Grid item md={4} xs={12} sm={6}>
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
                  <Grid item md={4} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>GPS Coordinate</Typography>
                      <OutlinedInput
                        style={{
                          backgroundColor: '#E3E3E3', // Background color
                        }}
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
                  <Grid item md={4} xs={12} sm={6}>
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
                  <Grid item md={4} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>Landmark Name</Typography>
                      <OutlinedInput
                        style={{
                          backgroundColor: '#E3E3E3', // Background color
                        }}
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
                  <Grid item md={4} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>House/Flat No</Typography>
                      <OutlinedInput
                        style={{
                          backgroundColor: '#E3E3E3', // Background color
                        }}
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
                  <Grid item md={4} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>Street/Road Name</Typography>
                      <OutlinedInput
                        style={{
                          backgroundColor: '#E3E3E3', // Background color
                        }}
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
                  <Grid item md={4} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>Locality/Area Name</Typography>
                      <OutlinedInput
                        style={{
                          backgroundColor: '#E3E3E3', // Background color
                        }}
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
              {!vendor.samesprmnt ? (
                <>
                  <Grid container spacing={2}>
                    <Grid item md={4} xs={12} sm={6}>
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
                    <Grid item md={4} xs={12} sm={6}>
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
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>Reference Name</Typography>
                        <OutlinedInput
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
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
                    <Grid item md={4} xs={12} sm={6}>
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
                        <Grid item md={4} xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <Typography>Pincode</Typography>

                            <Box display="flex" alignItems="center" gap={1}>
                              <OutlinedInput
                                style={{
                                  backgroundColor: '#E3E3E3', // Background color
                                }}
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
                      <Grid item md={4} xs={12} sm={6}>
                        <FormControl size="small" fullWidth>
                          <Typography>Pincode</Typography>
                          <OutlinedInput
                            style={{
                              backgroundColor: '#E3E3E3', // Background color
                            }}
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
                    <Grid item md={4} xs={12} sm={6}>
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
                        <Grid item md={4} xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <Typography>District</Typography>
                            <OutlinedInput id="component-outlined" type="text" style={{ backgroundColor: '#E3E3E3' }} value={vendor?.cdistrict || ''} readOnly sx={userStyle.input} />
                          </FormControl>
                        </Grid>
                        <Grid item md={4} xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <Typography> Village/City </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ flexGrow: 1 }}>
                                {switchValues?.cvillageorcity ? (
                                  <OutlinedInput
                                    id="component-outlined"
                                    type="text"
                                    style={{ backgroundColor: '#E3E3E3' }}
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
                      <Grid item md={4} xs={12} sm={6}>
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

                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>GPS Coordination</Typography>
                        <OutlinedInput
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
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
                    <Grid item md={4} xs={12} sm={6}>
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
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>Landmark Name</Typography>
                        <OutlinedInput
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
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
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>House/Flat No</Typography>
                        <OutlinedInput
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
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
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>Street/Road Name</Typography>
                        <OutlinedInput
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
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
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>Locality/Area Name</Typography>
                        <OutlinedInput
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
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
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>Address Type</Typography>
                        <OutlinedInput id="component-outlined" style={{ backgroundColor: '#E3E3E3' }} type="text" placeholder="Address Type" value={vendor?.addesstype} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>Personal Prefix</Typography>
                        <OutlinedInput id="component-outlined" style={{ backgroundColor: '#E3E3E3' }} type="text" placeholder="Personal Prefix" value={vendor?.personalprefix} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>Reference Name</Typography>
                        <OutlinedInput id="component-outlined" style={{ backgroundColor: '#E3E3E3' }} type="text" placeholder="Reference Name" value={vendor?.referencename} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={6}>
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
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl size="small" fullWidth>
                        <Typography>Pincode</Typography>
                        <OutlinedInput id="component-outlined" style={{ backgroundColor: '#E3E3E3' }} type="text" placeholder="Pincode" value={vendor.ppincode} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={6}>
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
                        <Grid item md={4} xs={12} sm={6}>
                          <FormControl size="small" fullWidth>
                            <Typography>District</Typography>
                            <OutlinedInput id="component-outlined" style={{ backgroundColor: '#E3E3E3' }} type="text" placeholder="District" value={vendor.pdistrict || ''} readOnly />
                          </FormControl>
                        </Grid>
                        <Grid item md={4} xs={12} sm={6}>
                          <FormControl size="small" fullWidth>
                            <Typography>Village/City</Typography>
                            <OutlinedInput id="component-outlined" style={{ backgroundColor: '#E3E3E3' }} type="text" placeholder="Village/City" value={vendor.pvillageorcity || ''} readOnly />
                          </FormControl>
                        </Grid>
                      </>
                    ) : (
                      <Grid item md={4} xs={12} sm={6}>
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

                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl size="small" fullWidth>
                        <Typography>GPS Coordination</Typography>
                        <OutlinedInput id="component-outlined" style={{ backgroundColor: '#E3E3E3' }} type="text" placeholder="GPS Coordination" value={vendor?.gpscoordinate} readOnly />
                      </FormControl>
                    </Grid>

                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography> Landmark & Positional Prefix </Typography>
                        <OutlinedInput id="component-outlined" style={{ backgroundColor: '#E3E3E3' }} type="text" placeholder="Landmark & Positional Prefix" value={vendor?.landmarkpositionprefix} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>Landmark Name</Typography>
                        <OutlinedInput id="component-outlined" style={{ backgroundColor: '#E3E3E3' }} type="text" placeholder="Landmark  Name" value={vendor.landmarkname} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>House/Flat No</Typography>
                        <OutlinedInput id="component-outlined" style={{ backgroundColor: '#E3E3E3' }} type="text" placeholder="House/Flat No" value={vendor.houseflatnumber} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>Street/Road Name</Typography>
                        <OutlinedInput id="component-outlined" style={{ backgroundColor: '#E3E3E3' }} type="text" placeholder="Street/Road Name" value={vendor.streetroadname} readOnly />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>Locality/Area Name</Typography>
                        <OutlinedInput id="component-outlined" style={{ backgroundColor: '#E3E3E3' }} type="text" placeholder="Locality/Area Name" value={vendor.localityareaname} readOnly />
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
              {vendor?.addcandidatestatus && (
                <>
                  <Grid item lg={4} md={4} xs={14} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={vendor?.isinterviewnow}
                          onChange={(e) => {
                            setVendor((prevSupplier) => ({
                              ...prevSupplier,
                              isinterviewnow: e.target.checked,
                            }));
                          }}
                        />
                      }
                      label="Attend Interview Now"
                    />
                  </Grid>
                </>
              )}
              {!vendor?.isinterviewnow && vendor?.addcandidatestatus && (
                <>
                  <Grid container spacing={2}>
                    <Grid item lg={4} md={4} xs={12} sm={6}>
                      <Typography
                        sx={{
                          color: 'black',
                          fontFamily: ' League Spartan, sans-serif',
                          fontsize: '30px',
                        }}
                      >
                        {' '}
                        <b> Interview Prefered Date</b> <b style={{ color: 'red' }}>*</b>:&emsp;
                      </Typography>
                      <FormControl size="small" fullWidth>
                        <OutlinedInput
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
                          id="component-outlined"
                          type="date"
                          value={vendor.interviewpreferedate}
                          onChange={(e) => {
                            setVendor({
                              ...vendor,
                              interviewpreferedate: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item lg={4} md={4} xs={12} sm={6}>
                      <Typography
                        sx={{
                          color: 'black',
                          fontFamily: ' League Spartan, sans-serif',
                          fontsize: '30px',
                        }}
                      >
                        {' '}
                        <b> Interview Prefered TIME</b> <b style={{ color: 'red' }}>*</b>:&emsp;
                      </Typography>
                      <FormControl size="small" fullWidth>
                        <OutlinedInput
                          style={{
                            backgroundColor: '#E3E3E3', // Background color
                          }}
                          id="component-outlined"
                          type="time"
                          value={vendor.interviewpreferetime}
                          onChange={(e) => {
                            setVendor({
                              ...vendor,
                              interviewpreferetime: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                </>
              )}
            </Grid>
            <br />
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
  // const renderStepFour = () => {
  //     return (
  //       <>
  //         <Box>
  //           <Box sx={{ display: 'flex', justifyContent: 'center' }}>
  //             <Typography sx={{ color: '#171A1C', fontWeight: 700, fontFamily: 'JostMedium', fontSize: { md: '25px', sm: '25px', xs: '22px' } }}> Photographic Verification</Typography>
  //           </Box>
  //           <br />
  //           <Grid container>
  //             <Grid item lg={12} md={12} xs={12} sm={12}>
  //               <Typography
  //                 style={{
  //                   color: 'black',
  //                   fontFamily: 'League Spartan, sans-serif',
  //                   fontSize: '20px',
  //                 }}
  //               >
  //                 Web Camera <b style={{ color: 'red' }}>*</b>
  //               </Typography>
  //             </Grid>
  //             <br />
  //             <Grid item lg={12} md={12} xs={12} sm={12} marginTop={2}>
  //               <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
  //                 <Webcamimage
  //                   name={name}
  //                   getImg={getImg}
  //                   setGetImg={setGetImg}
  //                   valNum={valNum}
  //                   setValNum={setValNum}
  //                   capturedImages={capturedImages}
  //                   setCapturedImages={setCapturedImages}
  //                   // setRefImage={setRefImage}
  //                   setRefImageDrag={setRefImageDrag}
  //                   setVendor={setVendor}
  //                   vendor={vendor}
  //                   handleCloseModEdit={handleCloseModEdit}
  //                   setNewimage={setNewimage}
  //                 />
  //               </Box>
  //             </Grid>
  //             <br />
  //             <Grid item lg={12} md={12} xs={12} sm={12} marginTop={2} sx={{ display: 'flex', justifyContent: 'space-between' }}>
  //               <Button variant="contained" type="submit" onClick={prevStep}>
  //                 {' '}
  //                 <WestIcon
  //                   sx={{
  //                     '@media only screen and (max-width: 900px)': {
  //                       fontSize: 'medium',
  //                     },
  //                   }}
  //                 />
  //                 &emsp; <b>Previous</b>
  //               </Button>
  //                <Button
  //                 className="next"
  //                 size="small"
  //                 variant="contained"
  //                 sx={{ ...userStyle.nextbutton, width: '100px', marginRight: 0 }}
  //                 onClick={() => {
  //                   stepTwo();
  //                 }}
  //               >
  //                 <b>Next</b> &emsp;
  //                 <EastIcon
  //                   sx={{
  //                     '@media only screen and (max-width: 900px)': {
  //                       fontSize: 'medium',
  //                     },
  //                   }}
  //                 />
  //               </Button>
  //             </Grid>
  //             <br />

  //             <Grid item lg={12} md={12} xs={12} sm={12} marginTop={2}>
  //               <Footer />
  //             </Grid>
  //           </Grid>
  //         </Box>
  //       </>
  //     );
  //   };

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
                {/* <Grid item style={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100px',
                      width: '100px',
                    }}
                    src={overallSettings?.companylogo}
                  />
                </Grid> */}
                {/* <Grid item sx={{ marginTop: '10px' }}></Grid> */}

                <Grid item style={{ display: 'flex', justifyContent: 'center' }}>
                  <ul style={{ marginLeft: '45px' }}>
                    <li>
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
                              ID Proof
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
                              Address
                            </Typography>
                          ) : null}
                        </Grid>
                      </Grid>
                      {/* <Grid container spacing={2} sx={{ display: 'flex', flexDirection: 'Row' }}>
                        <Grid item>{step === 4 ? <img src={numberfournew} /> : null}</Grid>
                        <Grid item>
                          {step === 4 ? (
                            <Typography
                              sx={{
                                fontFamily: ' League Spartan, sans-serif',
                                fontsize: '32px',
                              }}
                            >
                              {' '}
                              Address
                            </Typography>
                          ) : null}
                        </Grid>
                      </Grid> */}
                    </li>
                  </ul>
                </Grid>
              </Grid>
              <Grid item lg={9} md={9} sm={12} xs={12} sx={{ padding: { lg: '20px 150px !important', md: '20px 150px !important', sm: '20px 80px !important', xs: '20px 50px !important' } }}>
                {step === 1 ? renderStepOne() : null}
                {step === 2 ? renderStepTwo() : null}
                {step === 3 ? renderStepThree() : null}
                {/* {step === 4 ? renderStepFour() : null} */}
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
                <Grid item style={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '158px',
                      width: '158px',
                    }}
                    src={overallSettings?.companylogo}
                  />
                </Grid>
                <Grid item sx={{ marginTop: '10px' }}></Grid>
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
                            Visitor Information
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
                            ID Proof
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
                            Address
                          </Typography>
                        </Grid>
                      </Grid>
                      {/* <Grid
                        item
                        style={{
                          borderLeft: '2px dashed',
                          marginLeft: '16px',
                          height: '70px',
                        }}
                      ></Grid> */}
                      {/* <Grid
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
                        <Grid item>{step === 4 ? <img src={numberfournew} /> : <img src={numberfour} />}</Grid>
                        <Grid item>
                          <Typography
                            sx={{
                              fontFamily: ' League Spartan, sans-serif',
                              fontsize: '32px',
                            }}
                          >
                            {' '}
                           Address
                          </Typography>
                        </Grid>
                      </Grid> */}
                    </li>
                  </ul>
                </Grid>
              </Grid>

              <Grid item lg={9} md={9} sm={12} xs={12} sx={{ padding: { lg: '20px 150px !important', md: '20px 150px', sm: '20px 80px', xs: '20px 50px' } }}>
                {step === 1 ? renderStepOne() : null}
                {step === 2 ? renderStepTwo() : null}
                {step === 3 ? renderStepThree() : null}
                {/* {step === 4 ? renderStepFour() : null} */}
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    );
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
                  <Button variant="contained" onClick={handleCloseerrpop}>
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>

      <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogContent sx={{ width: '350px', textAlign: 'center', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontFamily: 'JostMedium', fontWeight: 'bold' }}>
            {showAlert}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" sx={{ color: 'tomato' }} onClick={handleCloseerr}>
            ok
          </Button>
        </DialogActions>
      </Dialog>
      <LoadingBackdrop open={isLoading} />
    </>
  );
}
export default Visitorinformationregister;