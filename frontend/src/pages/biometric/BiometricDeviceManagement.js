import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ImageIcon from "@mui/icons-material/Image";
import { BASE_URL } from "../../services/Authservice";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { FaTrash } from "react-icons/fa";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { FaExpand, FaPlus, FaEdit } from "react-icons/fa";
import csvIcon from "../../components/Assets/CSV.png";
import excelIcon from "../../components/Assets/excel-icon.png";
import fileIcon from "../../components/Assets/file-icons.png";
import pdfIcon from "../../components/Assets/pdf-icon.png";
import wordIcon from "../../components/Assets/word-icon.png";
import FormGroup from "@mui/material/FormGroup";
import Webcamimage from "../asset/Webcameimageasset";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  Grid,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Popover,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Switch from "@mui/material/Switch";
import axios from "../../axiosInstance";
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaSearch,
} from "react-icons/fa";
import { IoMdOptions } from "react-icons/io";
import { MdClose } from "react-icons/md";
import { ThreeDots } from "react-loader-spinner";
import { MultiSelect } from "react-multi-select-component";
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import AggridTableForPaginationTable from "../../components/AggridTableForPaginationTable.js";
import AlertDialog from "../../components/Alert.js";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  DeleteConfirmation,
  PleaseSelectRow,
} from "../../components/DeleteConfirmation.js";
import { handleApiError } from "../../components/Errorhandling.js";
import ExportData from "../../components/ExportData.js";
import Headtitle from "../../components/Headtitle.js";
import InfoPopup from "../../components/InfoPopup.js";
import MessageAlert from "../../components/MessageAlert.js";
import PageHeading from "../../components/PageHeading.js";
import { makeStyles } from "@material-ui/core";
import {
  AuthContext,
  UserRoleAccessContext,
} from "../../context/Appcontext.js";
import { userStyle, colourStyles } from "../../pageStyle.js";
import { SERVICE } from "../../services/Baseservice.js";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
const useStyles = makeStyles((theme) => ({
  inputs: {
    display: "none",
  },
  preview: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: theme.spacing(2),
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}));

// Brand1- Bio-Scoket
//Brand2- Bowee-Witzee
// Brand3 - Bowee-Chandichan
function BiometricDeviceManagement() {
  const brandNamesDefault = [
    { label: "Boxtel", value: "Boxtel" },
    { label: "Bio-Socket", value: "Bio-Socket" },
    // { label: "Bio-OpenApi", value: "Bio-OpenApi" },
    { label: "Bowee-Witzee", value: "Bowee-Witzee" },
    { label: "Bowee-Chandichan", value: "Bowee-Chandichan" },
    { label: "Bowee-Standard", value: "Bowee-Standard" },
  ];
  const [commonNameLinked, setCommonNameLinked] = useState(null);
  const [commonCloudIdcLinked, setCommonCloudIdcLinked] = useState(null);
  const [advancedFilter, setAdvancedFilter] = useState(null);
  const [additionalFilters, setAdditionalFilters] = useState([]);
  const [ModelOptions, setModelOptions] = useState([]);
  const [BrandOptions, setBrandOptions] = useState([]);
  const [serialNumberOptions, setSerialNumberOptions] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const conditions = [
    "Contains",
    "Does Not Contain",
    "Equals",
    "Does Not Equal",
    "Begins With",
    "Ends With",
    "Blank",
    "Not Blank",
  ]; // AgGrid-like conditions
  const [selectedColumn, setSelectedColumn] = useState("");
  const [fileFormat, setFormat] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("Contains");
  const [logicOperator, setLogicOperator] = useState("AND");
  const [filterValue, setFilterValue] = useState("");
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const [btnUpload, setBtnUpload] = useState(false);
    // Error Popup model
    const [isErrorOpenpop, setIsErrorOpenpop] = useState(false);
    const [showAlertpop, setShowAlertpop] = useState();
  
    const handleClickOpenerrpop = () => {
      setIsErrorOpenpop(true);
    };
    const handleCloseerrpop = () => {
      setIsErrorOpenpop(false);
    };
  
  const [biometricDeviceManagement, setBiometricDeviceManagement] = useState({
    mode: "New",
    brand: "Please Select Brand",
    model: "Please Select Model",
    company: "Please Select Company",
    branch: "Please Select Branch",
    unit: "Please Select Unit",
    floor: "Please Select Floor",
    area: "Please Select Area",
    branchcode: "",
    unitcode: "",
    floorcode: "",
    biometricdeviceid: "",
    biometricassignedurl: "",
    biometricserialno: "",
    biometricassignedip: "",
    isVisitor: false,
    rfidDevice: false,
    rfidnumber: "",
  });

  const [biometricDeviceManagementEdit, setBiometricDeviceManagementEdit] =
    useState({
      company: "Please Select Company",
      branch: "Please Select Branch",
      unit: "Please Select Unit",
      area: "Please Select Area",
      branchcode: "",
      unitcode: "",
      floorcode: "",
      biometricdeviceid: "",
      biometricserialno: "",
      biometricassignedip: "",
      biometricassignedurl: "",
    });
  const [getOverAllCountDelete, setGetOverallCountDelete] = useState("");
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState("");
  const [popupSeverityMalert, setPopupSeverityMalert] = useState("");

  //attachments start
  const classes = useStyles();
  const renderFilePreview = async (file) => {
    console.log(file, "file");
    if (file?.path) {
      const url = `${BASE_URL}/${file?.path}`; // Construct the URL based on your server setup
      window.open(url, "_blank");
    } else {
      const url = window.URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      window.open(link, "_blank");
    }
  };
  const getFileIcon = (fileName) => {
    const extension1 = fileName?.split(".").pop();
    switch (extension1) {
      case "pdf":
        return pdfIcon;
      case "doc":
      case "docx":
        return wordIcon;
      case "xls":
      case "xlsx":
        return excelIcon;
      case "csv":
        return csvIcon;
      default:
        return fileIcon;
    }
  };
  const [refImage, setRefImage] = useState([]);

  const [previewURL, setPreviewURL] = useState(null);
  const [refImageDrag, setRefImageDrag] = useState([]);
  const [valNum, setValNum] = useState(0);
  //webcam
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [getImg, setGetImg] = useState(null);
  const [isWebcamCapture, setIsWebcamCapture] = useState(false);
  const [refImageEdit, setRefImageEdit] = useState([]);

  const [previewURLEdit, setPreviewURLEdit] = useState(null);
  const [refImageDragEdit, setRefImageDragEdit] = useState([]);
  const [valNumEdit, setValNumEdit] = useState(0);

  const handleRemarkChangeUpload = (value, index) => {
    setRefImage((prev) =>
      prev.map((file, i) => (i === index ? { ...file, remarks: value } : file))
    );
  };
  const handleRemarkChangeWebCam = (value, index) => {
    setCapturedImages((prev) =>
      prev.map((file, i) => (i === index ? { ...file, remarks: value } : file))
    );
  };
  const handleRemarkChangeDragDrop = (value, index) => {
    setRefImageDrag((prev) =>
      prev.map((file, i) => (i === index ? { ...file, remarks: value } : file))
    );
  };
  const webcamOpen = () => {
    setIsWebcamOpen(true);
  };
  const webcamClose = () => {
    setIsWebcamOpen(false);
    setGetImg("");
  };
  const webcamDataStore = () => {
    setIsWebcamCapture(true);
    webcamClose();
    setGetImg("");
  };
  const showWebcam = () => {
    webcamOpen();
  };
  // Upload Popup
  //reference images
  const handleInputChange = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let validFiles = [];

    Array.from(files).forEach((file) => {
      if (file.size > 1024000) {
        setPopupContentMalert(
          `The file "${file.name}" is larger than 1MB and will not be uploaded.`
        );
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else {
        validFiles.push({ file });
      }
    });

    // Add the valid files to state
    setRefImage(validFiles);
  };
  const handleDeleteFile = (index) => {
    const newSelectedFiles = [...refImage];
    newSelectedFiles.splice(index, 1);
    setRefImage(newSelectedFiles);
  };
  const removeCapturedImage = (index) => {
    const newCapturedImages = [...capturedImages];
    newCapturedImages.splice(index, 1);
    setCapturedImages(newCapturedImages);
  };
  const resetImage = () => {
    setGetImg("");
    setRefImage([]);
    setPreviewURL(null);
    setRefImageDrag([]);
    setCapturedImages([]);
  };
  const handleDragOver = (event) => {
    event.preventDefault();
  };
  const handleDrop = (event) => {
    event.preventDefault();
    const selectedFile = event.dataTransfer.files[0]; // Only take the first file
    if (!selectedFile) return;

    // Check if the file exceeds 1MB (1,024,000 bytes)
    if (selectedFile.size > 1024000) {
      setPopupContentMalert(
        `The file "${selectedFile.name}" is larger than 1MB and will not be uploaded.`
      );
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
      return; // Prevent further processing
    }

    // Set only the latest selected file
    setRefImage([{ file: selectedFile }]);
    // }
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
  // Upload Popup
  const [uploadPopupOpen, setUploadPopupOpen] = useState(false);
  const handleClickUploadPopupOpen = () => {
    setUploadPopupOpen(true);
  };
  const handleUploadPopupClose = () => {
    setUploadPopupOpen(false);
    setGetImg("");
    setRefImage([]);
    setPreviewURL(null);
    setRefImageDrag([]);
    setCapturedImages([]);
  };
  const handleClickOpenPopupMalert = () => {
    setOpenPopupMalert(true);
  };
  const handleClosePopupMalert = () => {
    setOpenPopupMalert(false);
  };
  const [openPopup, setOpenPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [popupSeverity, setPopupSeverity] = useState("");
  const handleClickOpenPopup = () => {
    setOpenPopup(true);
  };
  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  const [todoscheckSignature, setTodoscheckSignature] = useState([]);
  const [indexSignatureCreate, setIndexSignatureCreate] = useState(-1);
  const [signTodoCreate, setSignTodoCreate] = useState(false);
  const [rfidNumberCreate, setRfidNumberCreate] = useState("");

  const handleCreateTodocheckSignature = () => {
    let allUploadedFiles = [];
    const filesImages = allUploadedFiles.concat(
      refImage,
      refImageDrag,
      capturedImages
    );

    const isRfidDuplicate = todoscheckSignature.some(
      (item) =>
        item.rfidnumber?.toLowerCase() ==
        biometricDeviceManagement.rfidnumber?.toLowerCase()
    );

    if (
      biometricDeviceManagement?.rfidnumber === "" ||
      !biometricDeviceManagement?.rfidnumber
    ) {
      setPopupContentMalert("Please Enter RFID Number");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (filesImages?.length < 1) {
      setPopupContentMalert("Please Upload RFID Images");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (isRfidDuplicate) {
      setPopupContentMalert("Please Enter Different RFID Number");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else {
      const newTodocheck = {
        rfidnumber: biometricDeviceManagement.rfidnumber,
        files: filesImages,
      };
      setTodoscheckSignature([...todoscheckSignature, newTodocheck]);

      setGetImg("");
      setRefImage([]);
      setPreviewURL(null);
      setRefImageDrag([]);
      setCapturedImages([]);
      setBiometricDeviceManagement((prev) => ({ ...prev, rfidnumber: "" }));
    }
  };

  const handleCreateUpdateSignature = () => {
    const newTodocheck = [...todoscheckSignature];
    const isRfidDuplicate = todoscheckSignature
      ?.filter((data, index) => index !== indexSignatureCreate)
      .some(
        (item) =>
          item.rfidnumber?.toLowerCase() == rfidNumberCreate?.toLowerCase()
      );
    if (rfidNumberCreate === "" || !rfidNumberCreate) {
      setPopupContentMalert("Please Enter RFID Number");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (isRfidDuplicate) {
      setPopupContentMalert("Please Enter Different RFID Number");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else {
      newTodocheck[indexSignatureCreate] = {
        ...newTodocheck[indexSignatureCreate],
        rfidnumber: rfidNumberCreate,
        files: newTodocheck[indexSignatureCreate].files,
      };

      setTodoscheckSignature(newTodocheck);
      setIndexSignatureCreate(-1);
      setSignTodoCreate(false);
    }
    // }
  };

  const handleCreateEditSignature = (index) => {
    setSignTodoCreate(true);
    setIndexSignatureCreate(index);
    setRfidNumberCreate(todoscheckSignature[index]?.rfidnumber);
  };
  const handleDeleteTodocheckSignature = (index) => {
    const newTodoscheck = [...todoscheckSignature];
    newTodoscheck.splice(index, 1);
    setTodoscheckSignature(newTodoscheck);
  };

  //webcam
  const [isWebcamOpenEdit, setIsWebcamOpenEdit] = useState(false);
  const [capturedImagesEdit, setCapturedImagesEdit] = useState([]);
  const [getImgEdit, setGetImgEdit] = useState(null);
  const [isWebcamCaptureEdit, setIsWebcamCaptureEdit] = useState(false);
  const [todoscheckSignatureEdit, setTodoscheckSignatureEdit] = useState([]);
  const [indexSignatureEdit, setIndexSignatureEdit] = useState(-1);
  const [signTodoEdit, setSignTodoEdit] = useState(false);
  const [rfidNumberEdit, setRfidNumberEdit] = useState("");
  const handleRemarkChangeUploadEdit = (value, index) => {
    setRefImageEdit((prev) =>
      prev.map((file, i) => (i === index ? { ...file, remarks: value } : file))
    );
  };
  const handleRemarkChangeWebCamEdit = (value, index) => {
    setCapturedImagesEdit((prev) =>
      prev.map((file, i) => (i === index ? { ...file, remarks: value } : file))
    );
  };
  const handleRemarkChangeDragDropEdit = (value, index) => {
    setRefImageDragEdit((prev) =>
      prev.map((file, i) => (i === index ? { ...file, remarks: value } : file))
    );
  };
  const webcamOpenEdit = () => {
    setIsWebcamOpenEdit(true);
  };
  const webcamCloseEdit = () => {
    setIsWebcamOpenEdit(false);
    setGetImgEdit("");
  };
  const webcamDataStoreEdit = () => {
    setIsWebcamCaptureEdit(true);
    webcamCloseEdit();
    setGetImgEdit("");
  };
  const showWebcamEdit = () => {
    webcamOpenEdit();
  };
  // Upload Popup
  //reference images
  const handleInputChangeEdit = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let validFiles = [];

    Array.from(files).forEach((file) => {
      if (file.size > 1024000) {
        setPopupContentMalert(
          `The file "${file.name}" is larger than 1MB and will not be uploaded.`
        );
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else {
        validFiles.push({ file });
      }
    });

    // Add the valid files to state
    setRefImageEdit(validFiles);
  };
  const handleDeleteFileEdit = (index) => {
    const newSelectedFiles = [...refImageEdit];
    newSelectedFiles.splice(index, 1);
    setRefImageEdit(newSelectedFiles);
  };
  const removeCapturedImageEdit = (index) => {
    const newCapturedImages = [...capturedImagesEdit];
    newCapturedImages.splice(index, 1);
    setCapturedImagesEdit(newCapturedImages);
  };
  const resetImageEdit = () => {
    setGetImgEdit("");
    setRefImageEdit([]);
    setPreviewURLEdit(null);
    setRefImageDragEdit([]);
    setCapturedImagesEdit([]);
  };
  const handleDragOverEdit = (event) => {
    event.preventDefault();
  };
  const handleDropEdit = (event) => {
    event.preventDefault();
    const selectedFile = event.dataTransfer.files[0]; // Only take the first file
    if (!selectedFile) return;

    // Check if the file exceeds 1MB (1,024,000 bytes)
    if (selectedFile.size > 1024000) {
      setPopupContentMalert(
        `The file "${selectedFile.name}" is larger than 1MB and will not be uploaded.`
      );
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
      return; // Prevent further processing
    }

    // Set only the latest selected file
    setRefImageEdit([{ file: selectedFile }]);
    // }
  };
  const handleUploadOverAllEdit = () => {
    setUploadPopupOpenEdit(false);
  };
  const previewFileEdit = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewURLEdit(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveFileEdit = (index) => {
    const newSelectedFiles = [...refImageDrag];
    newSelectedFiles.splice(index, 1);
    setRefImageDragEdit(newSelectedFiles);
  };
  // Upload Popup
  const [uploadPopupOpenEdit, setUploadPopupOpenEdit] = useState(false);
  const handleClickUploadPopupOpenEdit = () => {
    setUploadPopupOpenEdit(true);
  };
  const handleUploadPopupCloseEdit = () => {
    setUploadPopupOpenEdit(false);
    setGetImgEdit("");
    setRefImageEdit([]);
    setPreviewURLEdit(null);
    setRefImageDragEdit([]);
    setCapturedImagesEdit([]);
  };

  const handleCreateTodocheckSignatureEdit = () => {
    let allUploadedFiles = [];
    const filesImages = allUploadedFiles.concat(
      refImageEdit,
      refImageDragEdit,
      capturedImagesEdit
    );

    const isRfidDuplicate = todoscheckSignatureEdit.some(
      (item) =>
        item.rfidnumber?.toLowerCase() ==
        biometricDeviceManagementEdit.rfidnumber?.toLowerCase()
    );

    if (
      biometricDeviceManagementEdit?.rfidnumber === "" ||
      !biometricDeviceManagementEdit?.rfidnumber
    ) {
      setPopupContentMalert("Please Enter RFID Number");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (filesImages?.length < 1) {
      setPopupContentMalert("Please Upload RFID Images");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (isRfidDuplicate) {
      setPopupContentMalert("Please Enter Different RFID Number");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else {
      const newTodocheck = {
        rfidnumber: biometricDeviceManagementEdit.rfidnumber,
        files: filesImages,
      };
      setTodoscheckSignatureEdit([...todoscheckSignatureEdit, newTodocheck]);

      setGetImgEdit("");
      setRefImageEdit([]);
      setPreviewURLEdit(null);
      setRefImageDragEdit([]);
      setCapturedImagesEdit([]);
      setBiometricDeviceManagementEdit((prev) => ({ ...prev, rfidnumber: "" }));
    }
  };

  const handleCreateUpdateSignatureEdit = () => {
    const newTodocheck = [...todoscheckSignatureEdit];
    const isRfidDuplicate = todoscheckSignatureEdit
      ?.filter((data, index) => index !== indexSignatureEdit)
      .some(
        (item) =>
          item.rfidnumber?.toLowerCase() == rfidNumberEdit?.toLowerCase()
      );
    if (rfidNumberEdit === "" || !rfidNumberEdit) {
      setPopupContentMalert("Please Enter RFID Number");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (isRfidDuplicate) {
      setPopupContentMalert("Please Enter Different RFID Number");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else {
      newTodocheck[indexSignatureEdit] = {
        ...newTodocheck[indexSignatureEdit],
        rfidnumber: rfidNumberEdit,
        files: newTodocheck[indexSignatureEdit].files,
      };

      setTodoscheckSignatureEdit(newTodocheck);
      setIndexSignatureEdit(-1);
      setSignTodoEdit(false);
    }
    // }
  };

  const handleCreateEditSignatureEdit = (index) => {
    setSignTodoEdit(true);
    setIndexSignatureEdit(index);
    setRfidNumberEdit(todoscheckSignatureEdit[index]?.rfidnumber);
  };
  const handleDeleteTodocheckSignatureEdit = (index) => {
    const newTodoscheck = [...todoscheckSignatureEdit];
    newTodoscheck.splice(index, 1);
    setTodoscheckSignatureEdit(newTodoscheck);
  };

  let exportColumnNames = [
    "Mode",
    "Company",
    "Branch",
    "Unit",
    "Floor",
    "Area",
    "Brand",
    "Model",
    "Biometric Device ID",
    "Biometric Serial No",
    "Biometric Assigned IP",
    "Device Common Name",
  ];
  let exportRowValues = [
    "mode",
    "company",
    "branch",
    "unit",
    "floor",
    "area",
    "brand",
    "model",
    "biometricdeviceid",
    "biometricserialno",
    "biometricassignedip",
    "biometriccommonname",
  ];

  const gridRefTable = useRef(null);
  const [isHandleChange, setIsHandleChange] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const [sourceEdit, setSourceEdit] = useState({});
  const {
    isUserRoleCompare,
    alldepartment,
    allareagrouping,
    isAssignBranch,
    pageName,
    setPageName,
    buttonStyles,
    isUserRoleAccess,
    allfloor,
  } = useContext(UserRoleAccessContext);
  const [acPointCalculation, setAcpointCalculation] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const accessbranch = isUserRoleAccess?.role?.includes("Manager")
    ? isAssignBranch?.map((data) => ({
        branch: data.branch,
        company: data.company,
        unit: data.unit,
        branchcode: data.branchcode,
        unitcode: data.unitcode,
      }))
    : isAssignBranch
        ?.filter((data) => {
          let fetfinalurl = [];

          if (
            data?.modulenameurl?.length !== 0 &&
            data?.submodulenameurl?.length !== 0 &&
            data?.mainpagenameurl?.length !== 0 &&
            data?.subpagenameurl?.length !== 0 &&
            data?.subsubpagenameurl?.length !== 0 &&
            data?.subsubpagenameurl?.includes(window.location.pathname)
          ) {
            fetfinalurl = data.subsubpagenameurl;
          } else if (
            data?.modulenameurl?.length !== 0 &&
            data?.submodulenameurl?.length !== 0 &&
            data?.mainpagenameurl?.length !== 0 &&
            data?.subpagenameurl?.length !== 0 &&
            data?.subsubpagenameurl?.includes(window.location.pathname)
          ) {
            fetfinalurl = data.subpagenameurl;
          } else if (
            data?.modulenameurl?.length !== 0 &&
            data?.submodulenameurl?.length !== 0 &&
            data?.mainpagenameurl?.length !== 0 &&
            data?.subsubpagenameurl?.includes(window.location.pathname)
          ) {
            fetfinalurl = data.mainpagenameurl;
          } else if (
            data?.modulenameurl?.length !== 0 &&
            data?.submodulenameurl?.length !== 0 &&
            data?.subsubpagenameurl?.includes(window.location.pathname)
          ) {
            fetfinalurl = data.submodulenameurl;
          } else if (data?.modulenameurl?.length !== 0) {
            fetfinalurl = data.modulenameurl;
          } else {
            fetfinalurl = [];
          }

          const remove = [
            window.location.pathname?.substring(1),
            window.location.pathname,
          ];
          return fetfinalurl?.some((item) => remove?.includes(item));
        })
        ?.map((data) => ({
          branch: data.branch,
          company: data.company,
          unit: data.unit,
          branchcode: data.branchcode,
          unitcode: data.unitcode,
        }));

  const filteredAreas = allareagrouping.filter((area) =>
    accessbranch.some(
      (access) =>
        access.company === area.company &&
        access.branch === area.branch &&
        access.unit === area.unit
    )
  );

  const { auth } = useContext(AuthContext);
  const [sourceCheck, setSourcecheck] = useState(false);
  const username = isUserRoleAccess.username;
  const gridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [copiedData, setCopiedData] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };
  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };

  const gridRefTableImg = useRef(null);
  // image
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage
        .toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, "Biometric Device Management.png");
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };
  console.log(todoscheckSignature, "refImage");
  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
  };

  const fetchBiometricLastIndexCode = async (e) => {
    setPageName(!pageName);
    try {
      let res_queue = await axios.post(SERVICE.BIOMETRIC_LAST_INDEX, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        area: e,
      });
      const floorCode =
        biometricDeviceManagement?.floor?.toUpperCase()?.trim().split(/\s+/) ||
        [];
      let temmplateCode = "";
      if (floorCode.length >= 3) {
        temmplateCode += `${floorCode[0]?.slice(0, 2)}${floorCode[1]?.slice(
          0,
          2
        )}${floorCode[2]?.slice(0, 2)}`;
      } else if (floorCode.length === 2) {
        temmplateCode += `${floorCode[0]?.slice(0, 2)}${floorCode[1]?.slice(
          0,
          2
        )}`;
      } else if (floorCode.length === 1) {
        temmplateCode += `${floorCode[0]?.slice(0, 4)}`;
      }
      let refNo =
        res_queue?.data?.biocode.length > 0
          ? res_queue?.data?.biocode[0]?.biometriccommonname
          : biometricDeviceManagement?.branchcode?.toUpperCase() +
            "_" +
            biometricDeviceManagement?.unitcode?.toUpperCase() +
            "_" +
            temmplateCode +
            "_" +
            res_queue?.data?.areacode?.code.toUpperCase() +
            "_" +
            biometricDeviceManagement?.biometricdeviceid
              ?.slice(-3)
              ?.toUpperCase() +
            "_" +
            (biometricDeviceManagement?.brand === "Bowee-Chandichan"
              ? "00"
              : biometricDeviceManagement?.biometricassignedip
                  ?.split(".")
                  ?.pop()) +
            "#" +
            0;
      let codenum = refNo.split("#");
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

      let newval =
        biometricDeviceManagement?.branchcode?.toUpperCase() +
        "_" +
        biometricDeviceManagement?.unitcode?.toUpperCase() +
        "_" +
        temmplateCode +
        "_" +
        res_queue?.data?.areacode?.code?.toUpperCase() +
        "_" +
        biometricDeviceManagement?.biometricdeviceid?.slice(-3).toUpperCase() +
        "_" +
        // biometricDeviceManagement?.biometricserialno?.slice(-3) + "_" +
        (biometricDeviceManagement?.brand === "Bowee-Chandichan"
          ? "00"
          : biometricDeviceManagement?.biometricassignedip?.split(".")?.pop()) +
        +"#" +
        postfixLength;

      return newval;
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };
  const fetchBiometricLastIndexCodeEdit = async (e) => {
    setPageName(!pageName);
    try {
      let res_queue = await axios.post(SERVICE.BIOMETRIC_LAST_INDEX, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        area: e,
      });

      const floorCode =
        biometricDeviceManagementEdit?.floor
          ?.toUpperCase()
          ?.trim()
          .split(/\s+/) || [];
      let temmplateCode = "";
      if (floorCode.length >= 3) {
        temmplateCode += `${floorCode[0]?.slice(0, 2)}${floorCode[1]?.slice(
          0,
          2
        )}${floorCode[2]?.slice(0, 2)}`;
      } else if (floorCode.length === 2) {
        temmplateCode += `${floorCode[0]?.slice(0, 2)}${floorCode[1]?.slice(
          0,
          2
        )}`;
      } else if (floorCode.length === 1) {
        temmplateCode += `${floorCode[0]?.slice(0, 4)}`;
      }

      let codenum =
        biometricDeviceManagementEdit?.biometriccommonname?.split("#");
      let prefixLength = codenum[1];
      let newval =
        biometricDeviceManagementEdit?.branchcode.toUpperCase() +
        "_" +
        biometricDeviceManagementEdit?.unitcode.toUpperCase() +
        "_" +
        temmplateCode +
        "_" +
        res_queue?.data?.areacode?.code.toUpperCase() +
        "_" +
        biometricDeviceManagementEdit?.biometricdeviceid
          ?.slice(-3)
          .toUpperCase() +
        "_" +
        (biometricDeviceManagementEdit?.brand === "Bowee-Chandichan"
          ? "00"
          : biometricDeviceManagementEdit?.biometricassignedip
              ?.split(".")
              ?.pop()) +
        // biometricDeviceManagementEdit?.biometricassignedip?.split(".").pop() +
        "#" +
        prefixLength;

      return newval;
    } catch (err) {
      console.log(err, "err");
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
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
    setIsDisable(false);
  };

  //check delete model
  const [isCheckOpen, setisCheckOpen] = useState(false);
  const handleClickOpenCheck = () => {
    setisCheckOpen(true);
  };
  const handleCloseCheck = () => {
    setisCheckOpen(false);
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
    setIsHandleChange(true);

    if (selectedRows.length === 0) {
      setIsDeleteOpenalert(true);
    } else {
      // setIsDeleteOpencheckbox(true);
      getOverallEditSectionOverallDelete(selectedRows);
    }
  };
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  //overall edit section for all pages
  const getOverallEditSectionOverallDelete = async (ids) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.OVERALL_BULK_BIOMETRIC_DEVICE_DELETE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        id: ids,
      });
      setSelectedRows(res?.data?.result);
      setSelectedRowsCount(res?.data?.count);
      setSelectAllChecked(res?.data?.count === filteredDatas.length);
      setIsDeleteOpencheckbox(true);
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
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
    setSearchQueryManage("");
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const getRowClassName = (params) => {
    if (selectedRows.includes(params.row.id)) {
      return "custom-id-row"; // This is the custom class for rows with item.tat === 'ago'
    }
    return ""; // Return an empty string for other rows
  };

  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    company: true,
    branch: true,
    unit: true,
    floor: true,
    area: true,
    mode: true,
    brand: true,
    model: true,
    biometricdeviceid: true,
    biometricserialno: true,
    biometricassignedip: true,
    biometriccommonname: true,
    actions: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(
    initialColumnVisibility
  );

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // This is required for Chrome support
  };

  const [deleteSource, setDeleteSource] = useState("");

  const rowData = async (id, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(
        `${SERVICE.SINGLE_BIOMETRICDEVICEMANAGEMENT}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setDeleteSource(res?.data?.sbiometricdevicemanagement);
      getOverallEditSectionDelete(
        res?.data?.sbiometricdevicemanagement?.biometriccommonname
      );
      // handleClickOpen();
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const getOverallEditSectionDelete = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.OVERALL_BIO_DEV_MANAGEMENT_DELETE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        oldname: e,
      });
      setGetOverallCountDelete(`This Biometric Data is linked in 
       ${
         res?.data?.devicepairing?.length > 0 ? "Biometric Device Pairing," : ""
       }
       ${
         res?.data?.paireddevice?.length > 0 ? "Biometric Paired Device," : ""
       }`);

      if (res?.data?.count > 0) {
        handleClickOpenCheck();
      } else {
        handleClickOpen();
      }
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  // Alert delete popup
  let Sourcesid = deleteSource?._id;
  const delSource = async () => {
    setPageName(!pageName);
    try {
      const deletePromises = await axios.delete(
        `${SERVICE.SINGLE_BIOMETRICDEVICEMANAGEMENT}/${Sourcesid}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setFilteredRowData([]);
      setFilteredChanges(null);
      await fetchEmployee();
      fetchSource();
      handleCloseMod();
      setSelectedRows([]);
      setPage(1);

      setPopupContent("Deleted Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const delSourcecheckbox = async () => {
    setPageName(!pageName);
    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(
          `${SERVICE.SINGLE_BIOMETRICDEVICEMANAGEMENT}/${item}`,
          {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
          }
        );
      });
      // Wait for all delete requests to complete
      await Promise.all(deletePromises);
      setIsHandleChange(false);
      setFilteredRowData([]);
      setFilteredChanges(null);
      handleCloseModcheckbox();
      setSelectedRows([]);
      setSelectAllChecked(false);
      setPage(1);
      await fetchEmployee();
      await fetchSource();
      setPopupContent("Deleted Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };
  const findDuplicateGroupingDevices = async (deviceData) => {
    setPageName(!pageName);
    try {
      const dup_data = await axios.post(
        `${SERVICE.GET_DUPLICATE_BIOMETRIC_DEVICE_GROUPING}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          deviceData: deviceData,
        }
      );
      return dup_data?.data;
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  //add function
  const sendRequest = async () => {
    setPageName(!pageName);
    // setBtnUpload(true);
    const commonname = await fetchBiometricLastIndexCode(
      biometricDeviceManagement?.area
    );

    const formData = new FormData();
    todoscheckSignature.forEach((item, index) => {
      formData.append(`rfidnumber[${index}]`, item.rfidnumber);

      item.files.forEach((fObj) => {
        formData.append(`files[${index}]`, fObj.file);
      });
    });

    const payload = {
      company: String(biometricDeviceManagement.company),
      branch: String(biometricDeviceManagement.branch),
      unit: String(biometricDeviceManagement.unit),
      floor: String(biometricDeviceManagement.floor),
      area: String(biometricDeviceManagement.area),
      mode: String(biometricDeviceManagement.mode),
      brand: String(biometricDeviceManagement.brand),
      model: String(biometricDeviceManagement.model),
      biometricdeviceid: String(biometricDeviceManagement.biometricdeviceid),
      biometricserialno: String(biometricDeviceManagement.biometricserialno),
      biometricassignedip: String(
        biometricDeviceManagement.biometricassignedip
      ),
      biometricassignedurl: String(
        biometricDeviceManagement.biometricassignedurl
      ),
      isVisitor: biometricDeviceManagement?.isVisitor,
      rfidDevice: biometricDeviceManagement?.rfidDevice,
      biometriccommonname: commonname,
      addedby: [
        {
          name: String(isUserRoleAccess.companyname),
          date: String(new Date()),
        },
      ],
    };
    formData.append("data", JSON.stringify(payload));
    try {
      axios.post(SERVICE.CREATE_BIOMETRICDEVICEMANAGEMENT, formData, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchEmployee();
      await fetchSource();
      setIsDisable(false);
      setSearchQuery("");
      setBiometricDeviceManagement((prev) => ({
        ...prev,
        biometricdeviceid: "",
        biometricserialno: "",
        biometricassignedip: "",
        biometricassignedurl: "",
        rfidDevice: false,
        rfidnumber: "",
      }));
      setTodoscheckSignature([]);
      setGetImg("");
      setRefImage([]);
      setPreviewURL(null);
      setRefImageDrag([]);
      setCapturedImages([]);
      setPopupContent("Added Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
      setBtnUpload(false);
    } catch (err) {
      setIsDisable(false);
      setBtnUpload(false);
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  //submit option for saving
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isNameMatch = acPointCalculation.some(
      (item) =>
        item.company === biometricDeviceManagement.company &&
        item.branch === biometricDeviceManagement.branch &&
        item.unit === biometricDeviceManagement.unit &&
        item.floor === biometricDeviceManagement.floor &&
        item.area === biometricDeviceManagement.area &&
        item.biometricdeviceid?.toLowerCase() ===
          biometricDeviceManagement.biometricdeviceid?.toLowerCase() &&
        item.biometricserialno?.toLowerCase() ===
          biometricDeviceManagement.biometricserialno?.toLowerCase()
    );
    // const breakCheck = acPointCalculation.some(item =>
    //     item.company === biometricDeviceManagement.company &&
    //     item.branch === biometricDeviceManagement.branch &&
    //     item.biometricinexit === ExitInSwitch && item.biometricoutexit === ExitOutSwitch
    // );

    const ipFormat =
      /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;

    if (
      biometricDeviceManagement?.mode === "New" &&
      (biometricDeviceManagement.company === "Please Select Company" ||
        !biometricDeviceManagement.company)
    ) {
      setPopupContentMalert("Please Select Company");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagement?.mode === "New" &&
      (biometricDeviceManagement.branch === "Please Select Branch" ||
        !biometricDeviceManagement.branch)
    ) {
      setPopupContentMalert("Please Select Branch");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagement?.mode === "New" &&
      (biometricDeviceManagement.unit === "Please Select Unit" ||
        !biometricDeviceManagement.unit)
    ) {
      setPopupContentMalert("Please Select Unit");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagement?.mode === "New" &&
      (biometricDeviceManagement.floor === "Please Select Floor" ||
        !biometricDeviceManagement.floor)
    ) {
      setPopupContentMalert("Please Select Floor");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagement?.mode === "New" &&
      biometricDeviceManagement.area === "Please Select Area"
    ) {
      setPopupContentMalert("Please Select Area");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagement?.mode === "New" &&
      biometricDeviceManagement.brand === "Please Select Brand"
    ) {
      setPopupContentMalert("Please Select Brand");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagement?.mode === "New" &&
      biometricDeviceManagement.model === "Please Select Model"
    ) {
      setPopupContentMalert("Please Select Model");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (biometricDeviceManagement.biometricdeviceid === "") {
      setPopupContentMalert("Please Enter Biometric Device ID");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagement?.mode === "New" &&
      biometricDeviceManagement.biometricserialno === ""
    ) {
      setPopupContentMalert("Please Enter Biometric Serial No");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagement?.mode === "Existing" &&
      biometricDeviceManagement.biometricserialno ===
        "Please Select Serial Number"
    ) {
      setPopupContentMalert("Please Select Biometric Serial No");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (biometricDeviceManagement.biometricassignedip === "") {
      setPopupContentMalert("Please Enter Biometric Assigned IP");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (biometricDeviceManagement.biometricassignedurl === "") {
      setPopupContentMalert("Please Enter Biometric Assigned URL");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagement?.mode === "New" &&
      !ipFormat.test(biometricDeviceManagement.biometricassignedip)
    ) {
      setPopupContentMalert("Please Enter Valid Biometric Assigned IP");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagement?.rfidDevice &&
      todoscheckSignature?.length < 1
    ) {
      setPopupContentMalert("Please Add RFID Todo");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (biometricDeviceManagement?.rfidDevice && signTodoCreate) {
      setPopupContentMalert("Please Update the RFID Todo before submit");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert("Data Already exists!");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else {
      sendRequest();
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    setBiometricDeviceManagement({
      company: "Please Select Company",
      branch: "Please Select Branch",
      unit: "Please Select Unit",
      floor: "Please Select Floor",
      area: "Please Select Area",
      brand: "Please Select Brand",
      model: "Please Select Model",
      biometricdeviceid: "",
      biometricserialno: "",
      biometricassignedip: "",
      biometricassignedurl: "",
      mode: "New",
    });
    setSearchQuery("");
    fetchEmployee();
    setPopupContent("Cleared Successfully");
    setPopupSeverity("success");
    handleClickOpenPopup();
  };

  //Edit model...
  const [isEditOpen, setIsEditOpen] = useState(false);
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === "backdropClick") return;
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

  const [acpointCalculationArrayEdit, setAcpointCalculationArrayEdit] =
    useState([]);
  //get single row to edit....
  const getCode = async (e, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(
        `${SERVICE.SINGLE_BIOMETRICDEVICEMANAGEMENT}/${e}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setAcpointCalculationArrayEdit(
        acPointCalculation?.filter((item) => item?._id !== e)
      );
      setTodoscheckSignatureEdit(
        res.data?.sbiometricdevicemanagement?.rfidData
      );
      setSourceEdit(res?.data?.sbiometricdevicemanagement);
      const branchCode = accessbranch?.find(
        (data) => data?.branch === res?.data?.sbiometricdevicemanagement?.branch
      );
      const unitCode = accessbranch?.find(
        (data) => data?.unit === res?.data?.sbiometricdevicemanagement?.unit
      );
      const floorcode = allfloor?.find(
        (data) => data?.name === res?.data?.sbiometricdevicemanagement?.floor
      );
      setBiometricDeviceManagementEdit({
        ...res?.data?.sbiometricdevicemanagement,
        branchcode: branchCode?.branchcode,
        unitcode: unitCode?.unitcode,
        floorcode: floorcode?.code,
      });
      handleCheckOverallEdit(res?.data?.sbiometricdevicemanagement);

      handleClickOpenEdit();
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };
  const handleCheckOverallEdit = async (device) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(
        `${SERVICE.BIOMETRIC_DEVICE_MANAGEMENT_OVERALL_EDIT}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          device: device,
        }
      );
      const keyNameMap = {
        biometricdevicespairing: "Biometric Devices Pairing",
        biometricpaireddevice: "Biometric Paired Device Grouping",
        biometricusersgrouping: "Biometric Users Grouping",
        offlinehistory: "Biometric Device Offline History",
        onlineStatus: "Biometric Online Status",
        userinfos: "Biometric User Info Details",
      };

      const pagesData = res?.data?.matchedDatas ? res?.data?.matchedDatas : {};
      const mapPages = Object.keys(pagesData).map(
        (key) => keyNameMap[key] || key
      );
      const pagesDataCloudIDC = res?.data?.matchedCloudIDC
        ? res?.data?.matchedCloudIDC
        : {};
      const mapPagesCloudIDC = Object.keys(pagesDataCloudIDC).map(
        (key) => keyNameMap[key] || key
      );
      console.log(res?.data, mapPages, mapPagesCloudIDC);
      setCommonNameLinked(mapPages?.length ? mapPages : null);
      setCommonCloudIdcLinked(
        mapPagesCloudIDC?.length ? mapPagesCloudIDC : null
      );
    } catch (err) {
      console.log(err, "err");
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };
  const fetchBrandModel = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.post(
        `${SERVICE.BIOMETRIC_BRAND_MODEL_FROM_ASSET}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      const brandnames =
        res?.data?.brandnames?.length > 0
          ? res?.data?.brandnames?.map((data) => ({
              value: data?.name,
              label: data?.name,
            }))
          : [];
      const modelnames =
        res?.data?.modelnames?.length > 0
          ? res?.data?.modelnames?.map((data) => ({
              value: data?.name,
              label: data?.name,
            }))
          : [];

      setBrandOptions([...brandNamesDefault, ...brandnames]);
      setModelOptions(modelnames);
    } catch (err) {
      console.log(err, "err");
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };
  const fetchSerialNumberOptions = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.post(
        `${SERVICE.BIOMETRIC_SERIALNUMBER_FROM_ASSET}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      const modelnames =
        res?.data?.result?.length > 0
          ? res?.data?.result?.map((data) => ({
              ...data,
              value: data?.codename,
              label: data?.codename,
            }))
          : [];
      setSerialNumberOptions(modelnames);
    } catch (err) {
      console.log(err, "err");
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };
  const fetchAssignedIP = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(`${SERVICE.BIOMETRIC_ASSIGNED_IP_ASSET}`, e, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const ipAddress = res?.data?.assignedip?.[0]?.ipaddress || "";
      return ipAddress;
    } catch (err) {
      console.log(err, "err");
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
      return "";
    }
  };

  const handleBiometricChange = async (e) => {
    const assignedIp = await fetchAssignedIP(e);
    const branchCode = accessbranch?.find(
      (data) => data?.branch === e.branch
    )?.branchcode;
    const unitCode = accessbranch?.find(
      (data) => data?.unit === e.unit
    )?.unitcode;
    setBiometricDeviceManagement((prev) => ({
      ...prev,
      biometricserialno: e.value,
      company: e.company,
      branchcode: branchCode,
      unitcode: unitCode,
      floorcode: "",
      branch: e.branch,
      unit: e.unit,
      floor: e.floor,
      area: e.area,
      brand: e.brand,
      model: e.model,
      biometricassignedip: assignedIp,
      biometricdeviceid: "",
    }));
  };
  const handleBiometricChangeEdit = async (e) => {
    const assignedIp = await fetchAssignedIP(e);
    const branchCode = accessbranch?.find(
      (data) => data?.branch === e.branch
    )?.branchcode;
    const unitCode = accessbranch?.find(
      (data) => data?.unit === e.unit
    )?.unitcode;
    setBiometricDeviceManagementEdit((prev) => ({
      ...prev,
      biometricserialno: e.value,
      company: e.company,
      branchcode: branchCode,
      unitcode: unitCode,
      floorcode: "",
      branch: e.branch,
      unit: e.unit,
      floor: e.floor,
      area: e.area,
      brand: e.brand,
      model: e.model,
      biometricassignedip: assignedIp,
      biometricdeviceid: "",
    }));
  };

  useEffect(() => {
    fetchBrandModel();
    fetchSerialNumberOptions();
  }, []);
  // get single row to view....
  const getviewCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(
        `${SERVICE.SINGLE_BIOMETRICDEVICEMANAGEMENT}/${e}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setSourceEdit(res?.data?.sbiometricdevicemanagement);
      handleClickOpenview();
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };
  // get single row to view....
  const getinfoCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(
        `${SERVICE.SINGLE_BIOMETRICDEVICEMANAGEMENT}/${e}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setSourceEdit(res?.data?.sbiometricdevicemanagement);
      handleClickOpeninfo();
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  //Project updateby edit page...
  let updateby = sourceEdit?.updatedby;
  let addedby = sourceEdit?.addedby;
  let subprojectsid = sourceEdit?._id;
  console.log(todoscheckSignatureEdit, "todoscheckSignatureEdit");
  //editing the single data...
  const sendEditRequest = async (commonname) => {
    setPageName(!pageName);

    try {
      const formData = new FormData();

      // 1️⃣ Append RFID + Files (existing + new)
      todoscheckSignatureEdit.forEach((item, index) => {
        formData.append(`rfidnumber[${index}]`, item.rfidnumber);

        item.files.forEach((fObj) => {
          if (fObj.file instanceof File || fObj.file instanceof Blob) {
            // NEW FILES
            formData.append(`files[${index}]`, fObj.file);
          } else {
            // EXISTING FILES (multer output)
            formData.append(`existingFiles[${index}]`, JSON.stringify(fObj));
          }
        });
      });

      // 2️⃣ Main payload (same as POST)
      const payload = {
        company: String(biometricDeviceManagementEdit.company),
        branch: String(biometricDeviceManagementEdit.branch),
        unit: String(biometricDeviceManagementEdit.unit),
        floor: String(biometricDeviceManagementEdit.floor),
        area: String(biometricDeviceManagementEdit.area),
        model: String(biometricDeviceManagementEdit.model),
        brand: String(biometricDeviceManagementEdit.brand),
        mode: String(biometricDeviceManagementEdit.mode),
        biometricdeviceid: String(
          biometricDeviceManagementEdit.biometricdeviceid
        ),
        biometricserialno: String(
          biometricDeviceManagementEdit.biometricserialno
        ),
        biometricassignedip: String(
          biometricDeviceManagementEdit.biometricassignedip
        ),
        biometricassignedurl: String(
          biometricDeviceManagementEdit.biometricassignedurl
        ),
        biometriccommonname: commonname,
        isVisitor: biometricDeviceManagementEdit?.isVisitor,
        rfidDevice: biometricDeviceManagementEdit?.rfidDevice,

        updatedby: [
          ...updateby,
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      };

      // append payload JSON
      formData.append("data", JSON.stringify(payload));
      let res = await axios.put(
        `${SERVICE.SINGLE_BIOMETRICDEVICEMANAGEMENT}/${subprojectsid}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setFilteredRowData([]);
      setFilteredChanges(null);
      await fetchEmployee();
       await getOverallEditSectionUpdate(sourceEdit ,payload);
      fetchSource();
      handleCloseModEdit();
      setPopupContent("Updated Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

    //overall edit section for all pages
    const getOverallEditSectionUpdate = async (oldData , newData) => {
      setPageName(!pageName);
      try {
        let res = await axios.post(SERVICE.OVERALL_EDIT_UPDATE_BIOMETRIC_DEVICE_MANAGEMENT, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          olddata: oldData,
          newdata: newData,
        });
      } catch (err) {
        handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
      }
    };
  

  const editSubmit = async (e) => {
    e.preventDefault();
    const isNameMatch = acpointCalculationArrayEdit.some(
      (item) =>
        item.company === biometricDeviceManagementEdit.company &&
        item.branch === biometricDeviceManagementEdit.branch &&
        item.unit === biometricDeviceManagementEdit.unit &&
        item.floor === biometricDeviceManagementEdit.floor &&
        item.area === biometricDeviceManagementEdit.area &&
        item.biometricdeviceid?.toLowerCase() ===
          biometricDeviceManagementEdit.biometricdeviceid?.toLowerCase() &&
        item.biometricserialno?.toLowerCase() ===
          biometricDeviceManagementEdit.biometricserialno?.toLowerCase()
    );

    const ipFormat =
      /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;
    console.log(biometricDeviceManagementEdit, "biometricDeviceManagementEdit");
    let commonname;
if(!(
      biometricDeviceManagementEdit?.mode === "New" &&
      (biometricDeviceManagementEdit.area === "Please Select Area" ||
        !biometricDeviceManagementEdit.area)
    )){
     commonname = await fetchBiometricLastIndexCodeEdit(
      biometricDeviceManagementEdit?.area);
    }

    if (
      biometricDeviceManagementEdit?.mode === "New" &&
      (biometricDeviceManagementEdit.company === "Please Select Company" ||
        !biometricDeviceManagementEdit.company)
    ) {
      setPopupContentMalert("Please Select Company");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagementEdit?.mode === "New" &&
      (biometricDeviceManagementEdit.branch === "Please Select Branch" ||
        !biometricDeviceManagementEdit.branch)
    ) {
      setPopupContentMalert("Please Select Branch");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagementEdit?.mode === "New" &&
      (biometricDeviceManagementEdit.unit === "Please Select Unit" ||
        !biometricDeviceManagementEdit.unit)
    ) {
      setPopupContentMalert("Please Select Unit");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagementEdit?.mode === "New" &&
      (biometricDeviceManagementEdit.floor === "Please Select Floor" ||
        !biometricDeviceManagementEdit.floor)
    ) {
      setPopupContentMalert("Please Select Floor");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagementEdit?.mode === "New" &&
      (biometricDeviceManagementEdit.area === "Please Select Area" ||
        !biometricDeviceManagementEdit.area)
    ) {
      setPopupContentMalert("Please Select Area");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagementEdit?.mode === "New" &&
      (biometricDeviceManagementEdit.brand === "Please Select Brand" ||
        !biometricDeviceManagementEdit.brand)
    ) {
      setPopupContentMalert("Please Select Brand");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagementEdit?.mode === "New" &&
      (biometricDeviceManagementEdit.model === "Please Select Model" ||
        !biometricDeviceManagementEdit.model)
    ) {
      setPopupContentMalert("Please Select Model");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (biometricDeviceManagementEdit.biometricdeviceid === "") {
      setPopupContentMalert("Please Enter Biometric Device ID");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagementEdit?.mode === "New" &&
      biometricDeviceManagementEdit.biometricserialno === ""
    ) {
      setPopupContentMalert("Please Enter Biometric Serial No");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagementEdit?.mode === "Existing" &&
      biometricDeviceManagementEdit.biometricserialno ===
        "Please Select Serial Number"
    ) {
      setPopupContentMalert("Please Select Biometric Serial No");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagementEdit?.mode === "New" &&
      biometricDeviceManagementEdit.biometricassignedip === ""
    ) {
      setPopupContentMalert("Please Enter Biometric Assigned IP");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagementEdit?.mode === "New" &&
      biometricDeviceManagementEdit.biometricassignedurl === ""
    ) {
      setPopupContentMalert("Please Enter Biometric Assigned URL");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagementEdit?.mode === "Existing" &&
      biometricDeviceManagementEdit.biometricassignedip === ""
    ) {
      setPopupContentMalert(
        "Cannot create without an assigned IP. Please assign an IP first."
      );
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagementEdit?.mode === "New" &&
      !ipFormat.test(biometricDeviceManagementEdit.biometricassignedip)
    ) {
      setPopupContentMalert("Please Enter Valid Biometric Assigned IP");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (
      biometricDeviceManagementEdit?.rfidDevice &&
      todoscheckSignatureEdit?.length < 1
    ) {
      setPopupContentMalert("Please Add RFID Todo");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (biometricDeviceManagementEdit?.rfidDevice && signTodoEdit) {
      setPopupContentMalert("Please Update the RFID Todo before submit");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert("Data Already exists!");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } 
    else if (sourceEdit?.biometricserialno !== biometricDeviceManagementEdit.biometricserialno) {
      // setPopupContentMalert();
      // setPopupSeverityMalert("warning");
      // handleClickOpenPopupMalert();
         setShowAlertpop(
              <>
                <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
                <p style={{ fontSize: '20px', fontWeight: 900 }}>{commonCloudIdcLinked ? `Serial Number is linked in ${commonCloudIdcLinked?.toString()} pages`: null}</p>
              </>
            );
      handleClickOpenerrpop();
    }
    else if (sourceEdit?.biometriccommonname !== commonname) {
      // setPopupContentMalert(commonNameLinked ? `Device Common Name is linked in ${commonNameLinked?.toString()} pages`: null);
      // setPopupSeverityMalert("warning");
      // handleClickOpenPopupMalert();
      setShowAlertpop(
              <>
                <ErrorOutlineOutlinedIcon sx={{ fontSize: '100px', color: 'orange' }} />
                <p style={{ fontSize: '20px', fontWeight: 900 }}>{commonNameLinked ? `Device Common Name is linked in ${commonNameLinked?.toString()} pages`: null}</p>
              </>
            );
      handleClickOpenerrpop();
      // handleClickOpenerrpop();
    }
    else {
      sendEditRequest(commonname);
    }
  };

  //get all Sub vendormasters.
  const fetchSource = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.get(SERVICE.ALL_BIOMETRICDEVICEMANAGEMENT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setSourcecheck(true);
      setAcpointCalculation(res_vendor?.data?.biometricdevicemanagement);
    } catch (err) {
      setSourcecheck(true);
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const [
    acpointCalculationArrayForExport,
    setAcpointCalculationArrayForExport,
  ] = useState([]);

  const fetchAcpointcalculation = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.get(SERVICE.ALL_BIOMETRICDEVICEMANAGEMENT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setSourcecheck(true);
      setAcpointCalculationArrayForExport(
        res_vendor?.data?.biometricdevicemanagement.map((item, index) => {
          return {
            id: item._id,
            serialNumber: item.serialNumber,
            company: item.company?.toString(),
            branch: item.branch?.toString(),
            unit: item.unit?.toString(),
            floor: item.floor?.toString(),
            area: item.area,
            biometricdeviceid: item.biometricdeviceid,
            biometricserialno: item.biometricserialno,
            biometricassignedip: item.biometricassignedip,
            biometricassignedurl: item.biometricassignedurl,
            biometriccommonname: item.biometriccommonname,
            mode: item.mode,
            brand: item.brand,
            model: item.model,
          };
        })
      );
    } catch (err) {
      setSourcecheck(true);
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  useEffect(() => {
    fetchAcpointcalculation();
  }, [isFilterOpen]);

  const [overallFilterdata, setOverallFilterdata] = useState([]);
  const [overallFilterdataAllData, setOverallFilterdataAllData] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [anchorElSearch, setAnchorElSearch] = React.useState(null);
  const handleClickSearch = (event) => {
    setAnchorElSearch(event.currentTarget);
    localStorage.removeItem("filterModel");
  };
  const handleCloseSearch = () => {
    setAnchorElSearch(null);
    setSearchQuery("");
  };

  const openSearch = Boolean(anchorElSearch);
  const idSearch = openSearch ? "simple-popover" : undefined;

  const handleAddFilter = () => {
    if (
      (selectedColumn && filterValue) ||
      ["Blank", "Not Blank"].includes(selectedCondition)
    ) {
      setAdditionalFilters([
        ...additionalFilters,
        {
          column: selectedColumn,
          condition: selectedCondition,
          value: filterValue,
        },
      ]);
      setSelectedColumn("");
      setSelectedCondition("Contains");
      setFilterValue("");
    }
  };

  const getSearchDisplay = () => {
    if (advancedFilter && advancedFilter.length > 0) {
      return advancedFilter
        .map((filter, index) => {
          let showname = columnDataTable.find(
            (col) => col.field === filter.column
          )?.headerName;
          return `${showname} ${filter.condition} "${filter.value}"`;
        })
        .join(
          " " +
            (advancedFilter.length > 1 ? advancedFilter[1].condition : "") +
            " "
        );
    }
    return searchQuery;
  };

  const handleResetSearch = async () => {
    setPageName(!pageName);

    setAdvancedFilter(null);
    setAdditionalFilters([]);
    setSearchQuery("");
    setIsSearchActive(false);
    setSelectedColumn("");
    setSelectedCondition("Contains");
    setFilterValue("");
    setLogicOperator("AND");
    setFilteredChanges(null);

    const queryParams = {
      page: Number(page),
      pageSize: Number(pageSize),
      searchQuery: searchQuery,
      assignbranch: accessbranch,
    };

    const allFilters = [];
    // Only include advanced filters if they exist, otherwise just use regular searchQuery
    if (allFilters.length > 0 && selectedColumn !== "") {
      queryParams.allFilters = allFilters;
      queryParams.logicOperator = logicOperator;
    } else if (searchQuery) {
      queryParams.searchQuery = searchQuery; // Use searchQuery for regular search
    }

    try {
      let res_employee = await axios.post(
        SERVICE.BIOMETRICDEVICEMANAGEMENT_LIST,
        queryParams,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      const ans =
        res_employee?.data?.result?.length > 0
          ? res_employee?.data?.result
          : [];
      const itemsWithSerialNumber = ans?.map((item, index) => ({
        ...item,
        serialNumber: (page - 1) * pageSize + index + 1,
        // serialNumber: index + 1,
      }));
      setOverallFilterdata(itemsWithSerialNumber);
      setOverallFilterdataAllData(
        res_employee?.data?.totalProjectsAllData?.length > 0
          ? res_employee?.data?.totalProjectsAllData?.map((item, index) => ({
              ...item,
              serialNumber: index + 1,
            }))
          : []
      );
      setTotalProjects(ans?.length > 0 ? res_employee?.data?.totalProjects : 0);
      setTotalPages(ans?.length > 0 ? res_employee?.data?.totalPages : 0);
      setPageSize((data) => {
        return ans?.length > 0 ? data : 10;
      });
      setPage((data) => {
        return ans?.length > 0 ? data : 1;
      });
      setSourcecheck(true);
    } catch (err) {
      setSourcecheck(true);
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const fetchEmployee = async () => {
    setPageName(!pageName);
    const queryParams = {
      page: Number(page),
      pageSize: Number(pageSize),
      searchQuery: searchQuery,
      assignbranch: accessbranch,
    };

    const allFilters = [
      ...additionalFilters,
      {
        column: selectedColumn,
        condition: selectedCondition,
        value: filterValue,
      },
    ];

    if (allFilters.length > 0 && selectedColumn !== "") {
      queryParams.allFilters = allFilters;
      queryParams.logicOperator = logicOperator;
    } else if (searchQuery) {
      queryParams.searchQuery = searchQuery;
    }

    try {
      let res_employee = await axios.post(
        SERVICE.BIOMETRICDEVICEMANAGEMENT_LIST,
        queryParams,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      const ans =
        res_employee?.data?.result?.length > 0
          ? res_employee?.data?.result
          : [];
      const itemsWithSerialNumber = ans?.map((item, index) => ({
        ...item,
        serialNumber: (page - 1) * pageSize + index + 1,
        // serialNumber: index + 1,
      }));
      setOverallFilterdata(itemsWithSerialNumber);
      setOverallFilterdataAllData(
        res_employee?.data?.totalProjectsAllData?.length > 0
          ? res_employee?.data?.totalProjectsAllData?.map((item, index) => ({
              ...item,
              serialNumber: index + 1,
            }))
          : []
      );
      setTotalProjects(ans?.length > 0 ? res_employee?.data?.totalProjects : 0);
      setTotalPages(ans?.length > 0 ? res_employee?.data?.totalPages : 0);
      setPageSize((data) => {
        return ans?.length > 0 ? data : 10;
      });
      setPage((data) => {
        return ans?.length > 0 ? data : 1;
      });
      setSourcecheck(true);
    } catch (err) {
      setSourcecheck(true);
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [page, pageSize, searchQuery]);

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Biometric Device Management",
    pageStyle: "print",
  });

  const getapi = async () => {
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String("Biometric Device Management"),
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

  useEffect(() => {
    fetchEmployee();
    fetchSource();
    getapi();
    // fetchTeamAll();
  }, []);

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, []);

  const [items, setItems] = useState([]);

  const addSerialNumber = (datas) => {
    setItems(datas);
  };

  useEffect(() => {
    addSerialNumber(overallFilterdata);
  }, [overallFilterdata]);

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
    // setPage(1);
  };
  //datatable....
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  // Split the search query into individual terms
  const searchTerms = searchQuery.toLowerCase().split(" ");
  // Modify the filtering logic to check each term
  const filteredDatas = items?.filter((item) => {
    return searchTerms.every((term) =>
      Object.values(item).join(" ").toLowerCase().includes(term)
    );
  });

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
    <div>
      <Checkbox checked={selectAllChecked} onChange={onSelectAll} />
    </div>
  );
  const columnDataTable = [
    {
      field: "checkbox",
      headerName: "Checkbox", // Default header name
      headerStyle: {
        fontWeight: "bold", // Apply the font-weight style to make the header text bold
        // Add any other CSS styles as needed
      },

      sortable: false, // Optionally, you can make this column not sortable
      width: 90,
      headerCheckboxSelection: true,
      checkboxSelection: true,
      hide: !columnVisibility.checkbox,
      headerClassName: "bold-header",
      pinned: "left",
    },
    {
      field: "serialNumber",
      headerName: "SNo",
      flex: 0,
      width: 100,
      hide: !columnVisibility.serialNumber,
      headerClassName: "bold-header",
      pinned: "left",
    },
    {
      field: "mode",
      headerName: "Mode",
      flex: 0,
      width: 100,
      hide: !columnVisibility.mode,
      headerClassName: "bold-header",
    },
    {
      field: "company",
      headerName: "Company",
      flex: 0,
      width: 150,
      hide: !columnVisibility.company,
      headerClassName: "bold-header",
    },
    {
      field: "branch",
      headerName: "Branch",
      flex: 0,
      width: 150,
      hide: !columnVisibility.branch,
      headerClassName: "bold-header",
    },
    {
      field: "unit",
      headerName: "Unit",
      flex: 0,
      width: 150,
      hide: !columnVisibility.unit,
      headerClassName: "bold-header",
    },
    {
      field: "floor",
      headerName: "Floor",
      flex: 0,
      width: 150,
      hide: !columnVisibility.floor,
      headerClassName: "bold-header",
    },
    {
      field: "area",
      headerName: "Area",
      flex: 0,
      width: 150,
      hide: !columnVisibility.area,
      headerClassName: "bold-header",
    },
    {
      field: "brand",
      headerName: "Brand",
      flex: 0,
      width: 150,
      hide: !columnVisibility.brand,
      headerClassName: "bold-header",
    },
    {
      field: "model",
      headerName: "Model",
      flex: 0,
      width: 150,
      hide: !columnVisibility.model,
      headerClassName: "bold-header",
    },
    {
      field: "biometricdeviceid",
      headerName: "Biometric Device ID",
      flex: 0,
      width: 150,
      hide: !columnVisibility.biometricdeviceid,
      headerClassName: "bold-header",
    },
    {
      field: "biometricserialno",
      headerName: "Biometric Serial No",
      flex: 0,
      width: 150,
      hide: !columnVisibility.biometricserialno,
      headerClassName: "bold-header",
    },
    {
      field: "biometricassignedip",
      headerName: "Biometric Assigned IP",
      flex: 0,
      width: 150,
      hide: !columnVisibility.biometricassignedip,
      headerClassName: "bold-header",
    },
    {
      field: "biometriccommonname",
      headerName: "Biometric Common Name",
      flex: 0,
      width: 150,
      hide: !columnVisibility.biometriccommonname,
      headerClassName: "bold-header",
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 0,
      width: 280,
      minHeight: "40px !important",
      sortable: false,
      hide: !columnVisibility.actions,
      headerClassName: "bold-header",
      cellRenderer: (params) => (
        <Grid sx={{ display: "flex" }}>
          {isUserRoleCompare?.includes("ebiometricdevicemanagement") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getCode(params.data.id, params.data.name);
              }}
            >
              <EditOutlinedIcon sx={buttonStyles.buttonedit} />{" "}
            </Button>
          )}
          {isUserRoleCompare?.includes("dbiometricdevicemanagement") && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.data.id, params.data.name);
              }}
            >
              <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />{" "}
            </Button>
          )}
          {isUserRoleCompare?.includes("vbiometricdevicemanagement") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getviewCode(params.data.id);
              }}
            >
              <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />{" "}
            </Button>
          )}
          {isUserRoleCompare?.includes("ibiometricdevicemanagement") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getinfoCode(params.data.id);
              }}
            >
              <InfoOutlinedIcon sx={buttonStyles.buttoninfo} />{" "}
            </Button>
          )}
        </Grid>
      ),
    },
  ];

  const filteredSelectedColumn = columnDataTable.filter(
    (data) =>
      data.field !== "checkbox" &&
      data.field !== "actions" &&
      data.field !== "serialNumber"
  );

  const rowDataTable = filteredDatas.map((item, index) => {
    return {
      id: item._id,
      serialNumber: item.serialNumber,
      company: item.company,
      branch: item.branch,
      unit: item.unit,
      floor: item.floor,
      area: item.area,
      mode: item.mode,
      model: item.model,
      brand: item.brand,
      biometricdeviceid: item.biometricdeviceid,
      biometricserialno: item.biometricserialno,
      biometricassignedip: item.biometricassignedip,
      biometricassignedurl: item.biometricassignedurl,
      biometriccommonname: item.biometriccommonname,
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
  const filteredColumns = columnDataTable.filter((column) =>
    column.headerName.toLowerCase().includes(searchQueryManage.toLowerCase())
  );

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
        padding: "10px",
        minWidth: "325px",
        "& .MuiDialogContent-root": { padding: "10px 0" },
      }}
    >
      <Typography variant="h6">Manage Columns</Typography>
      <IconButton
        aria-label="close"
        onClick={handleCloseManageColumns}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <Box sx={{ position: "relative", margin: "10px" }}>
        <TextField
          label="Find column"
          variant="standard"
          fullWidth
          value={searchQueryManage}
          onChange={(e) => setSearchQueryManage(e.target.value)}
          sx={{ marginBottom: 5, position: "absolute" }}
        />
      </Box>
      <br />
      <br />
      <DialogContent
        sx={{ minWidth: "auto", height: "200px", position: "relative" }}
      >
        <List sx={{ overflow: "auto", height: "100%" }}>
          {filteredColumns.map((column) => (
            <ListItem key={column.field}>
              <ListItemText
                sx={{ display: "flex" }}
                primary={
                  <Switch
                    sx={{ marginTop: "-5px" }}
                    size="small"
                    checked={columnVisibility[column.field]}
                    onChange={() => toggleColumnVisibility(column.field)}
                  />
                }
                secondary={
                  column.field === "checkbox" ? "Checkbox" : column.headerName
                }
                // secondary={column.headerName }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Grid container>
          <Grid item md={4}>
            <Button
              variant="text"
              sx={{ textTransform: "none" }}
              onClick={() => setColumnVisibility(initialColumnVisibility)}
            >
              Show All
            </Button>
          </Grid>
          <Grid item md={4}></Grid>
          <Grid item md={4}>
            <Button
              variant="text"
              sx={{ textTransform: "none" }}
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
      <Headtitle title={"BIOMETRIC DEVICE MANAGEMENT"} />
      {/* ****** Header Content ****** */}
      <PageHeading
        title="Biometric Device Management"
        modulename="Human Resources"
        submodulename="HR"
        mainpagename="BX-Biometric Device"
        subpagename="Biometric Device Management"
        subsubpagename=""
      />
      {isUserRoleCompare?.includes("abiometricdevicemanagement") && (
        <>
          <Box sx={userStyle.dialogbox}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>
                    Add Biometric Device Management
                  </Typography>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Mode <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                      options={[
                        { label: "New", value: "New" },
                        { label: "Existing", value: "Existing" },
                      ]}
                      styles={colourStyles}
                      value={{
                        label: biometricDeviceManagement.mode,
                        value: biometricDeviceManagement.mode,
                      }}
                      onChange={(e) => {
                        setBiometricDeviceManagement({
                          ...biometricDeviceManagement,
                          mode: e.value,
                          company:
                            e.value === "New" ? "Please Select Company" : "",
                          branchcode: "",
                          unitcode: "",
                          floorcode: "",
                          branch:
                            e.value === "New" ? "Please Select Branch" : "",
                          unit: e.value === "New" ? "Please Select Unit" : "",
                          floor: e.value === "New" ? "Please Select Floor" : "",
                          area: e.value === "New" ? "Please Select Area" : "",
                          brand: e.value === "New" ? "Please Select Brand" : "",
                          model: e.value === "New" ? "Please Select Model" : "",
                          biometricassignedip: "",
                          biometricassignedurl: "",
                          biometricserialno:
                            e.value === "New"
                              ? ""
                              : "Please Select Serial Number",
                          biometricdeviceid: "",
                        });
                      }}
                    />
                  </FormControl>
                </Grid>

                {biometricDeviceManagement.mode === "New" ? (
                  <>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Company <b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                          options={accessbranch
                            .map((data) => ({
                              label: data.company,
                              value: data.company,
                            }))
                            .filter((item, index, self) => {
                              return (
                                self.findIndex(
                                  (i) =>
                                    i.label === item.label &&
                                    i.value === item.value
                                ) === index
                              );
                            })}
                          styles={colourStyles}
                          value={{
                            label: biometricDeviceManagement.company,
                            value: biometricDeviceManagement.company,
                          }}
                          onChange={(e) => {
                            setBiometricDeviceManagement({
                              ...biometricDeviceManagement,
                              company: e.value,
                              branchcode: "",
                              unitcode: "",
                              floorcode: "",
                              branch: "Please Select Branch",
                              unit: "Please Select Unit",
                              floor: "Please Select Floor",
                              area: "Please Select Area",
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Branch<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                          options={accessbranch
                            ?.filter(
                              (comp) =>
                                comp.company ===
                                biometricDeviceManagement?.company
                            )
                            .map((data) => ({
                              label: data.branch,
                              value: data.branch,
                              branchcode: data.branchcode,
                            }))
                            .filter((item, index, self) => {
                              return (
                                self.findIndex(
                                  (i) =>
                                    i.label === item.label &&
                                    i.value === item.value
                                ) === index
                              );
                            })}
                          styles={colourStyles}
                          value={{
                            label: biometricDeviceManagement.branch,
                            value: biometricDeviceManagement.branch,
                          }}
                          onChange={(e) => {
                            setBiometricDeviceManagement({
                              ...biometricDeviceManagement,
                              branch: e.value,
                              branchcode: e.branchcode,
                              unitcode: "",
                              floorcode: "",
                              unit: "Please Select Unit",
                              floor: "Please Select Floor",
                              area: "Please Select Area",
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Unit<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                          options={accessbranch
                            ?.filter(
                              (comp) =>
                                comp.company ===
                                  biometricDeviceManagement?.company &&
                                comp.branch ===
                                  biometricDeviceManagement?.branch
                            )
                            .map((data) => ({
                              label: data.unit,
                              value: data.unit,
                              unitcode: data.unitcode,
                            }))
                            .filter((item, index, self) => {
                              return (
                                self.findIndex(
                                  (i) =>
                                    i.label === item.label &&
                                    i.value === item.value
                                ) === index
                              );
                            })}
                          styles={colourStyles}
                          value={{
                            label: biometricDeviceManagement.unit,
                            value: biometricDeviceManagement.unit,
                          }}
                          onChange={(e) => {
                            setBiometricDeviceManagement({
                              ...biometricDeviceManagement,
                              unit: e.value,
                              unitcode: e.unitcode,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Floor<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                          options={allfloor
                            ?.filter(
                              (u) =>
                                biometricDeviceManagement?.branch === u.branch
                            )
                            .map((u) => ({
                              ...u,
                              label: u.name,
                              value: u.name,
                            }))
                            .filter((item, index, self) => {
                              return (
                                self.findIndex(
                                  (i) =>
                                    i.label === item.label &&
                                    i.value === item.value
                                ) === index
                              );
                            })}
                          styles={colourStyles}
                          value={{
                            label: biometricDeviceManagement.floor,
                            value: biometricDeviceManagement.floor,
                          }}
                          onChange={(e) => {
                            setBiometricDeviceManagement({
                              ...biometricDeviceManagement,
                              floor: e.value,
                              floorcode: e.code,
                              area: "Please Select Area",
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Area<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                          maxMenuHeight={300}
                          options={filteredAreas
                            .filter(
                              (item) =>
                                biometricDeviceManagement?.floor ===
                                  item.floor &&
                                biometricDeviceManagement?.branch ===
                                  item.branch
                            )
                            .flatMap((item) => item.area)
                            .map((location) => ({
                              label: location,
                              value: location,
                            }))}
                          value={{
                            label: biometricDeviceManagement.area,
                            value: biometricDeviceManagement.area,
                          }}
                          onChange={(e) => {
                            setBiometricDeviceManagement({
                              ...biometricDeviceManagement,
                              area: e.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    {/* Newly Added Branch and Model */}
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Biometric Brand<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                          maxMenuHeight={300}
                          options={[
                            ...new Map(
                              BrandOptions.map((i) => [
                                i.value.toLowerCase(),
                                i,
                              ])
                            ).values(),
                          ]}
                          placeholder="Please Select Brand"
                          value={{
                            label: biometricDeviceManagement.brand,
                            value: biometricDeviceManagement.brand,
                          }}
                          onChange={(e) => {
                            setBiometricDeviceManagement({
                              ...biometricDeviceManagement,
                              brand: e.value,
                              biometricassignedip: "",
                              biometricassignedurl: "",
                              biometricserialno:
                                e.value === "New"
                                  ? ""
                                  : "Please Select Serial Number",
                              biometricdeviceid: "",
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Biometric Model<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                          maxMenuHeight={300}
                          options={ModelOptions}
                          placeholder="Please Select Model"
                          value={{
                            label: biometricDeviceManagement.model,
                            value: biometricDeviceManagement.model,
                          }}
                          onChange={(e) => {
                            setBiometricDeviceManagement({
                              ...biometricDeviceManagement,
                              model: e.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Biometric Device ID <b style={{ color: "red" }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="Please Enter Biometric Device ID"
                          value={biometricDeviceManagement.biometricdeviceid}
                          onChange={(e) => {
                            // const enteredValue = e.target.value.replace(/[^\d.]/g, "");
                            // if (enteredValue === "" || /^\d*\.?\d*$/.test(enteredValue)) {
                            //     if ((enteredValue.match(/\./g) || []).length <= 1) {
                            setBiometricDeviceManagement({
                              ...biometricDeviceManagement,
                              biometricdeviceid: e.target.value,
                            });
                            // }
                            // }
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Biometric Serial No <b style={{ color: "red" }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="Please Enter Biometric Serial No"
                          value={biometricDeviceManagement.biometricserialno}
                          onChange={(e) => {
                            setBiometricDeviceManagement({
                              ...biometricDeviceManagement,
                              biometricserialno: e.target.value,
                            });
                            // }
                          }}
                        />
                        <FormControl fullWidth size="small">
                          <FormControlLabel
                            label="Visitor Device"
                            control={
                              <Checkbox
                                sx={{
                                  "& .MuiSvgIcon-root": {
                                    fontSize: 40,
                                    marginTop: 1,
                                  },
                                }}
                                checked={
                                  biometricDeviceManagement?.isVisitor || false
                                }
                                onChange={(e) =>
                                  setBiometricDeviceManagement({
                                    ...biometricDeviceManagement,
                                    isVisitor: e.target.checked,
                                  })
                                }
                                color="primary"
                              />
                            }
                          />
                        </FormControl>
                      </FormControl>
                    </Grid>

                    {biometricDeviceManagement.brand === "Bowee-Chandichan" ? (
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Biometric Assigned URL{" "}
                            <b style={{ color: "red" }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Please Enter Biometric Assigned URL"
                            value={
                              biometricDeviceManagement.biometricassignedurl
                            }
                            onChange={(e) => {
                              const enteredValue = e.target.value;
                              setBiometricDeviceManagement({
                                ...biometricDeviceManagement,
                                biometricassignedurl: enteredValue,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                    ) : (
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Biometric Assigned IP{" "}
                            <b style={{ color: "red" }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Please Enter Biometric Assigned IP"
                            value={
                              biometricDeviceManagement.biometricassignedip
                            }
                            onChange={(e) => {
                              const enteredValue = e.target.value;

                              // Regex to match partial IP address structure
                              if (
                                enteredValue === "" ||
                                /^(\d{1,3}\.){0,3}\d{0,3}$/.test(enteredValue) // Matches up to 3 octets and the last segment
                              ) {
                                // Split the entered value by dots
                                const segments = enteredValue.split(".");

                                // Ensure all segments are numbers between 0 and 255
                                const isValid = segments.every(
                                  (segment) =>
                                    segment === "" ||
                                    (Number(segment) >= 0 &&
                                      Number(segment) <= 255)
                                );

                                if (isValid) {
                                  setBiometricDeviceManagement({
                                    ...biometricDeviceManagement,
                                    biometricassignedip: enteredValue,
                                  });
                                }
                              }
                            }}
                          />
                        </FormControl>
                      </Grid>
                    )}
                    <Grid item md={2} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <FormControlLabel
                          label="RFID Device"
                          control={
                            <Checkbox
                              sx={{
                                "& .MuiSvgIcon-root": {
                                  fontSize: 40,
                                  marginTop: 1,
                                },
                              }}
                              checked={
                                biometricDeviceManagement?.rfidDevice || false
                              }
                              onChange={(e) => {
                                setBiometricDeviceManagement({
                                  ...biometricDeviceManagement,
                                  rfidDevice: e.target.checked,
                                });
                                setGetImg("");
                                setRefImage([]);
                                setPreviewURL(null);
                                setRefImageDrag([]);
                                setCapturedImages([]);
                                setTodoscheckSignature([]);
                                setBiometricDeviceManagement((prev) => ({
                                  ...prev,
                                  rfidnumber: "",
                                }));
                              }}
                              color="primary"
                            />
                          }
                        />
                      </FormControl>
                    </Grid>
                    {biometricDeviceManagement?.rfidDevice && (
                      <>
                        <Grid item md={3} xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              RFID Number <b style={{ color: "red" }}>*</b>
                            </Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Please Enter RFID Number"
                              value={biometricDeviceManagement.rfidnumber}
                              onChange={(e) => {
                                setBiometricDeviceManagement({
                                  ...biometricDeviceManagement,
                                  rfidnumber: e.target.value,
                                });
                                // }
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} xs={12} sm={12}>
                          <Typography>RFID Images</Typography>
                          <Box sx={{ display: "flex", justifyContent: "left" }}>
                            <Button
                              variant="contained"
                              onClick={handleClickUploadPopupOpen}
                            >
                              Upload
                            </Button>
                          </Box>
                        </Grid>
                        <Grid item md={1} sm={2} xs={12} marginTop={3.5}>
                          <Button
                            variant="contained"
                            sx={{ minWidth: "35px" }}
                            onClick={handleCreateTodocheckSignature}
                          >
                            <FaPlus />
                          </Button>
                        </Grid>
                        <Grid item lg={12} md={12} sm={12} xs={12}>
                          {isWebcamCapture == true &&
                            capturedImages?.length > 0 &&
                            capturedImages?.map((file, index) => (
                              <Grid
                                container
                                key={index}
                                alignItems="center"
                                spacing={2}
                                sx={{
                                  padding: "8px 0",
                                  borderBottom: "1px solid #ddd",
                                }}
                              >
                                {/* File Icon */}
                                <Grid item md={1} sm={2} xs={2}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    {file.type.includes("image/") ? (
                                      <img
                                        src={file.preview}
                                        alt={file.name}
                                        height={40}
                                        style={{
                                          maxWidth: "100%",
                                        }}
                                      />
                                    ) : (
                                      <img
                                        className={classes.preview}
                                        src={getFileIcon(file.name)}
                                        height={40}
                                        alt="file icon"
                                      />
                                    )}
                                  </Box>
                                </Grid>

                                {/* File Name */}
                                <Grid item md={3} sm={3} xs={3}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {file.name}
                                  </Typography>
                                </Grid>

                                {/* Remarks Input */}
                                <Grid item md={4} sm={4} xs={4}>
                                  <TextField
                                    variant="outlined"
                                    size="small"
                                    placeholder="Enter remarks"
                                    value={file?.remarks || ""}
                                    onChange={(e) =>
                                      handleRemarkChangeWebCam(
                                        e.target.value,
                                        index
                                      )
                                    }
                                    fullWidth
                                  />
                                </Grid>

                                {/* View and Delete Icons */}
                                <Grid
                                  item
                                  md={4}
                                  sm={3}
                                  xs={3}
                                  sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: 1,
                                  }}
                                >
                                  <Button
                                    sx={{
                                      padding: "6px",
                                      minWidth: "36px",
                                      borderRadius: "50%",
                                      ":hover": {
                                        backgroundColor: "#f0f0f0",
                                      },
                                    }}
                                    onClick={() => renderFilePreview(file)}
                                  >
                                    <VisibilityOutlinedIcon
                                      style={{
                                        fontSize: "18px",
                                        color: "#357AE8",
                                      }}
                                    />
                                  </Button>
                                  <Button
                                    sx={{
                                      padding: "6px",
                                      minWidth: "36px",
                                      borderRadius: "50%",
                                      ":hover": {
                                        backgroundColor: "#f0f0f0",
                                      },
                                    }}
                                    onClick={() => removeCapturedImage(index)}
                                  >
                                    <FaTrash
                                      style={{
                                        fontSize: "18px",
                                        color: "#a73131",
                                      }}
                                    />
                                  </Button>
                                </Grid>
                              </Grid>
                            ))}
                          {refImage?.length > 0 &&
                            refImage?.map((data, index) => (
                              <Grid container key={index}>
                                <Grid item md={2} sm={2} xs={2}>
                                  <Box
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    <img
                                      className={classes.preview}
                                      src={getFileIcon(data.file.name)}
                                      height="10"
                                      alt="file icon"
                                    />
                                    {/* )} */}
                                  </Box>
                                </Grid>
                                <Grid
                                  item
                                  md={7}
                                  sm={7}
                                  xs={7}
                                  sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography variant="subtitle2">
                                    {" "}
                                    {data.file.name}{" "}
                                  </Typography>
                                </Grid>
                                <Grid item md={1} sm={1} xs={1}>
                                  <Grid sx={{ display: "flex" }}>
                                    <Button
                                      sx={{
                                        padding: "14px 14px",
                                        minWidth: "40px !important",
                                        borderRadius: "50% !important",
                                        ":hover": {
                                          backgroundColor: "#80808036", // theme.palette.primary.main
                                        },
                                      }}
                                      onClick={() =>
                                        renderFilePreview(data.file)
                                      }
                                    >
                                      <VisibilityOutlinedIcon
                                        style={{
                                          fontsize: "12px",
                                          color: "#357AE8",
                                        }}
                                      />
                                    </Button>
                                    <Button
                                      sx={{
                                        padding: "14px 14px",
                                        minWidth: "40px !important",
                                        borderRadius: "50% !important",
                                        ":hover": {
                                          backgroundColor: "#80808036", // theme.palette.primary.main
                                        },
                                      }}
                                      onClick={() => handleDeleteFile(index)}
                                    >
                                      <FaTrash
                                        style={{
                                          color: "#a73131",
                                          fontSize: "12px",
                                        }}
                                      />
                                    </Button>
                                  </Grid>
                                </Grid>
                              </Grid>
                            ))}

                          {refImageDrag?.length > 0 &&
                            refImageDrag?.map((file, index) => (
                              <Grid
                                container
                                key={index}
                                alignItems="center"
                                spacing={2}
                                sx={{
                                  padding: "8px 0",
                                  borderBottom: "1px solid #ddd",
                                }}
                              >
                                {/* File Icon */}
                                <Grid item md={1} sm={2} xs={2}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    {file.type.includes("image/") ? (
                                      <img
                                        src={file.preview}
                                        alt={file.name}
                                        height={40}
                                        style={{
                                          maxWidth: "100%",
                                        }}
                                      />
                                    ) : (
                                      <img
                                        className={classes.preview}
                                        src={getFileIcon(file.name)}
                                        height={40}
                                        alt="file icon"
                                      />
                                    )}
                                  </Box>
                                </Grid>

                                {/* File Name */}
                                <Grid item md={3} sm={3} xs={3}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {file.name}
                                  </Typography>
                                </Grid>

                                {/* Remarks Input */}
                                <Grid item md={4} sm={4} xs={4}>
                                  <TextField
                                    variant="outlined"
                                    size="small"
                                    placeholder="Enter remarks"
                                    value={file?.remarks || ""}
                                    onChange={(e) =>
                                      handleRemarkChangeDragDrop(
                                        e.target.value,
                                        index
                                      )
                                    }
                                    fullWidth
                                  />
                                </Grid>

                                {/* View and Delete Icons */}
                                <Grid
                                  item
                                  md={4}
                                  sm={3}
                                  xs={3}
                                  sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: 1,
                                  }}
                                >
                                  <Button
                                    sx={{
                                      padding: "6px",
                                      minWidth: "36px",
                                      borderRadius: "50%",
                                      ":hover": {
                                        backgroundColor: "#f0f0f0",
                                      },
                                    }}
                                    onClick={() => renderFilePreview(file)}
                                  >
                                    <VisibilityOutlinedIcon
                                      style={{
                                        fontSize: "18px",
                                        color: "#357AE8",
                                      }}
                                    />
                                  </Button>
                                  <Button
                                    sx={{
                                      padding: "6px",
                                      minWidth: "36px",
                                      borderRadius: "50%",
                                      ":hover": {
                                        backgroundColor: "#f0f0f0",
                                      },
                                    }}
                                    onClick={() => handleRemoveFile(index)}
                                  >
                                    <FaTrash
                                      style={{
                                        fontSize: "18px",
                                        color: "#a73131",
                                      }}
                                    />
                                  </Button>
                                </Grid>
                              </Grid>
                            ))}
                        </Grid>

                        <Grid item md={12} xs={12} sm={12}>
                          {todoscheckSignature?.length > 0 &&
                            todoscheckSignature.map((todo, index) => (
                              <div key={index}>
                                <br />
                                <br />
                                <br />
                                {indexSignatureCreate === index ? (
                                  <Grid container spacing={1}>
                                    <>
                                      <Grid item md={3} xs={12} sm={6}>
                                        <FormControl fullWidth size="small">
                                          <Typography>
                                            RFID Number{" "}
                                            <b style={{ color: "red" }}>*</b>
                                          </Typography>
                                          <OutlinedInput
                                            id="component-outlined"
                                            type="text"
                                            placeholder="Please Enter RFID Number"
                                            value={rfidNumberCreate}
                                            onChange={(e) => {
                                              setRfidNumberCreate(
                                                e.target.value
                                              );
                                            }}
                                          />
                                        </FormControl>
                                      </Grid>
                                    </>
                                    <br />
                                    <br />
                                    <Grid item md={3} sm={6} xs={6}>
                                      <Typography>
                                        <b>RFID Images</b>
                                      </Typography>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: "left",
                                        }}
                                      ></Box>
                                      <Grid item md={12} xs={12} sm={12}>
                                        {
                                          // todo?.files && (
                                          todo.files.map((file, index) => (
                                            <>
                                              <Grid container spacing={2}>
                                                <Grid item md={8} sm={6} xs={6}>
                                                  <Typography>
                                                    {file?.file?.name}
                                                  </Typography>
                                                </Grid>
                                                <Grid></Grid>
                                                <Grid item md={1} sm={6} xs={6}>
                                                  <VisibilityOutlinedIcon
                                                    style={{
                                                      fontsize: "large",
                                                      color: "#357AE8",
                                                      cursor: "pointer",
                                                    }}
                                                    onClick={() =>
                                                      renderFilePreview(
                                                        file?.file
                                                      )
                                                    }
                                                  />
                                                </Grid>
                                              </Grid>
                                            </>
                                          ))
                                        }
                                      </Grid>
                                    </Grid>

                                    <Grid item md={1} sm={1} mt={2} xs={1}>
                                      <Button
                                        variant="contained"
                                        style={{
                                          minWidth: "20px",
                                          minHeight: "41px",
                                          background: "transparent",
                                          boxShadow: "none",
                                          marginTop: "5px !important",
                                          "&:hover": {
                                            background: "#f4f4f4",
                                            borderRadius: "50%",
                                            minHeight: "41px",
                                            minWidth: "20px",
                                            boxShadow: "none",
                                          },
                                        }}
                                        disabled={false}
                                        onClick={handleCreateUpdateSignature}
                                      >
                                        <CheckCircleIcon
                                          style={{
                                            color: "#216d21",
                                            fontSize: "1.5rem",
                                          }}
                                        />
                                      </Button>
                                    </Grid>
                                    <Grid item md={1} mt={2} sm={1} xs={1}>
                                      <Button
                                        variant="contained"
                                        style={{
                                          minWidth: "20px",
                                          minHeight: "41px",
                                          background: "transparent",
                                          boxShadow: "none",
                                          marginTop: "5px !important",
                                          "&:hover": {
                                            background: "#f4f4f4",
                                            borderRadius: "50%",
                                            minHeight: "41px",
                                            minWidth: "20px",
                                            boxShadow: "none",
                                          },
                                        }}
                                        onClick={() => {
                                          setSignTodoCreate(false);
                                          setIndexSignatureCreate(-1);
                                        }}
                                        // disabled={!empdigits}
                                      >
                                        <CancelIcon
                                          style={{
                                            color: "#b92525",
                                            fontSize: "1.5rem",
                                          }}
                                        />
                                      </Button>
                                    </Grid>
                                  </Grid>
                                ) : (
                                  <Grid container spacing={1}>
                                    <>
                                      <Grid item md={1} xs={12} sm={12}>
                                        <FormControl fullWidth size="small">
                                          <Typography>
                                            <b>RFID Number</b>
                                          </Typography>
                                          <Typography>
                                            {todo.rfidnumber}
                                          </Typography>
                                        </FormControl>
                                      </Grid>
                                    </>
                                    <br />
                                    <br />
                                    <Grid item md={3} sm={6} xs={6}>
                                      <Typography>
                                        <b>RFID Images</b>
                                      </Typography>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: "left",
                                        }}
                                      ></Box>
                                      <Grid item md={12} xs={12} sm={12}>
                                        {
                                          // todo?.document?.file && (
                                          todo.files.map((file, index) => (
                                            <>
                                              <Grid container spacing={2}>
                                                <Grid item md={8} sm={6} xs={6}>
                                                  <Typography>
                                                    {file?.file?.name}
                                                  </Typography>
                                                </Grid>
                                                <Grid></Grid>
                                                <Grid item md={1} sm={6} xs={6}>
                                                  <VisibilityOutlinedIcon
                                                    style={{
                                                      fontsize: "large",
                                                      color: "#357AE8",
                                                      cursor: "pointer",
                                                    }}
                                                    onClick={() =>
                                                      renderFilePreview(
                                                        file?.file
                                                      )
                                                    }
                                                  />
                                                </Grid>
                                              </Grid>
                                            </>
                                            // )
                                          ))
                                        }
                                      </Grid>
                                    </Grid>
                                    <Grid item md={1} mt={2} sm={6} xs={6}>
                                      <Button
                                        variant="contained"
                                        style={{
                                          minWidth: "20px",
                                          minHeight: "41px",
                                          background: "transparent",
                                          boxShadow: "none",
                                          marginTop: "-13px !important",
                                          "&:hover": {
                                            background: "#f4f4f4",
                                            borderRadius: "50%",
                                            minHeight: "41px",
                                            minWidth: "20px",
                                            boxShadow: "none",
                                          },
                                        }}
                                        onClick={() =>
                                          handleCreateEditSignature(index)
                                        }
                                        // disabled={!empdigits}
                                      >
                                        <FaEdit
                                          style={{
                                            color: "#1976d2",
                                            fontSize: "1.2rem",
                                          }}
                                        />
                                      </Button>
                                    </Grid>
                                    <Grid item md={1} mt={2} sm={6} xs={6}>
                                      <Button
                                        variant="contained"
                                        style={{
                                          minWidth: "20px",
                                          minHeight: "41px",
                                          background: "transparent",
                                          boxShadow: "none",
                                          marginTop: "-13px !important",
                                          "&:hover": {
                                            background: "#f4f4f4",
                                            borderRadius: "50%",
                                            minHeight: "41px",
                                            minWidth: "20px",
                                            boxShadow: "none",
                                          },
                                        }}
                                        onClick={() => {
                                          setSignTodoCreate(false);
                                          handleDeleteTodocheckSignature(index);
                                        }}
                                      >
                                        <FaTrash
                                          style={{
                                            color: "#b92525",
                                            fontSize: "1.2rem",
                                          }}
                                        />
                                      </Button>
                                    </Grid>
                                  </Grid>
                                )}

                                <br />
                              </div>
                            ))}
                        </Grid>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Biometric Serial Number
                          <b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                          maxMenuHeight={300}
                          options={serialNumberOptions}
                          placeholder="Please Select Serial Number"
                          value={{
                            label: biometricDeviceManagement.biometricserialno,
                            value: biometricDeviceManagement.biometricserialno,
                          }}
                          onChange={handleBiometricChange}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Company <b style={{ color: "red" }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="Please Enter Company"
                          value={biometricDeviceManagement.company}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Branch<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="Please Enter Branch"
                          value={biometricDeviceManagement.branch}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Unit<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="Please Enter Unit"
                          value={biometricDeviceManagement.unit}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Floor<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="Please Enter Floor"
                          value={biometricDeviceManagement.floor}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Area<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="Please Enter Area"
                          value={biometricDeviceManagement.area}
                        />
                      </FormControl>
                    </Grid>
                    {/* Newly Added Branch and Model */}
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Biometric Brand<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="Please Enter Brand"
                          value={biometricDeviceManagement.brand}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Biometric Model<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="Please Enter Model"
                          value={biometricDeviceManagement.model}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Biometric Device ID <b style={{ color: "red" }}>*</b>
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder="Please Enter Biometric Device ID"
                          value={biometricDeviceManagement.biometricdeviceid}
                          onChange={(e) => {
                            setBiometricDeviceManagement({
                              ...biometricDeviceManagement,
                              biometricdeviceid: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    {biometricDeviceManagement?.brand === "Bowee-Chandechan" ? (
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Biometric Assigned URL{" "}
                            <b style={{ color: "red" }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Please Enter Biometric Assigned URL"
                            value={
                              biometricDeviceManagement.biometricassignedurl
                            }
                          />
                        </FormControl>
                      </Grid>
                    ) : (
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Biometric Assigned IP{" "}
                            <b style={{ color: "red" }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Please Enter Biometric Assigned IP"
                            value={
                              biometricDeviceManagement.biometricassignedip
                            }
                          />
                        </FormControl>
                      </Grid>
                    )}
                  </>
                )}

                <br />
                <Grid container spacing={2}>
                  <Grid item md={3} sm={12} xs={12}>
                    <Typography>&nbsp;</Typography>
                    <Grid
                      sx={{
                        display: "flex",

                        gap: "15px",
                      }}
                    >
                      <LoadingButton
                        loading={btnUpload}
                        sx={buttonStyles.buttonsubmit}
                        onClick={handleSubmit}
                      >
                        SAVE
                      </LoadingButton>
                      <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                        CLEAR
                      </Button>
                    </Grid>
                  </Grid>
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
          maxWidth="lg"
          sx={{ marginTop: "47px" }}
          // sx={{
          //   overflow: "visible",
          //   "& .MuiPaper-root": {
          //     overflow: "visible",
          //   },
          // }}
        >
          <Box sx={{ padding: "20px" }}>
            <>
              <form onSubmit={editSubmit}>
                {/* <DialogContent sx={{ width: '550px', padding: '20px' }}> */}
                <Grid container spacing={2}>
                  <Grid item md={12} xs={12} sm={12}>
                    <Typography sx={userStyle.HeaderText}>
                      Edit Biometric Device Management
                    </Typography>
                  </Grid>
                </Grid>
                <br />
                <Grid container spacing={2}>
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Mode <b style={{ color: "red" }}>*</b>
                      </Typography>
                      <Selects
                        options={[
                          { label: "New", value: "New" },
                          { label: "Existing", value: "Existing" },
                        ]}
                        styles={colourStyles}
                        value={{
                          label: biometricDeviceManagementEdit.mode,
                          value: biometricDeviceManagementEdit.mode,
                        }}
                        onChange={(e) => {
                          setBiometricDeviceManagementEdit({
                            ...biometricDeviceManagementEdit,
                            mode: e.value,
                            company:
                              e.value === "New" ? "Please Select Company" : "",
                            branchcode: "",
                            unitcode: "",
                            floorcode: "",
                            branch:
                              e.value === "New" ? "Please Select Branch" : "",
                            unit: e.value === "New" ? "Please Select Unit" : "",
                            floor:
                              e.value === "New" ? "Please Select Floor" : "",
                            area: e.value === "New" ? "Please Select Area" : "",
                            brand:
                              e.value === "New" ? "Please Select Brand" : "",
                            model:
                              e.value === "New" ? "Please Select Model" : "",
                            biometricassignedip: "",
                            biometricassignedurl: "",
                            biometricserialno:
                              e.value === "New"
                                ? ""
                                : "Please Select Serial Number",
                            biometricdeviceid: "",
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>

                  {biometricDeviceManagementEdit.mode === "New" ? (
                    <>
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Company <b style={{ color: "red" }}>*</b>
                          </Typography>
                          <Selects
                            options={accessbranch
                              .map((data) => ({
                                label: data.company,
                                value: data.company,
                              }))
                              .filter((item, index, self) => {
                                return (
                                  self.findIndex(
                                    (i) =>
                                      i.label === item.label &&
                                      i.value === item.value
                                  ) === index
                                );
                              })}
                            styles={colourStyles}
                            value={{
                              label: biometricDeviceManagementEdit.company,
                              value: biometricDeviceManagementEdit.company,
                            }}
                            onChange={(e) => {
                              setBiometricDeviceManagementEdit({
                                ...biometricDeviceManagementEdit,
                                company: e.value,
                                branch: "Please Select Branch",
                                unit: "Please Select Unit",
                                floor: "Please Select Floor",
                                area: "Please Select Area",
                                branchcode: "",
                                unitcode: "",
                                floorcode: "",
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Branch<b style={{ color: "red" }}>*</b>
                          </Typography>
                          <Selects
                            options={accessbranch
                              ?.filter(
                                (comp) =>
                                  comp.company ===
                                  biometricDeviceManagementEdit?.company
                              )
                              .map((data) => ({
                                label: data.branch,
                                value: data.branch,
                                branchcode: data.branchcode,
                              }))
                              .filter((item, index, self) => {
                                return (
                                  self.findIndex(
                                    (i) =>
                                      i.label === item.label &&
                                      i.value === item.value
                                  ) === index
                                );
                              })}
                            styles={colourStyles}
                            value={{
                              label: biometricDeviceManagementEdit.branch,
                              value: biometricDeviceManagementEdit.branch,
                            }}
                            onChange={(e) => {
                              setBiometricDeviceManagementEdit({
                                ...biometricDeviceManagementEdit,
                                branch: e.value,
                                branchcode: e.branchcode,
                                unitcode: "",
                                floorcode: "",
                                unit: "Please Select Unit",
                                floor: "Please Select Floor",
                                area: "Please Select Area",
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Unit<b style={{ color: "red" }}>*</b>
                          </Typography>
                          <Selects
                            options={accessbranch
                              ?.filter(
                                (comp) =>
                                  comp.company ===
                                    biometricDeviceManagementEdit?.company &&
                                  comp.branch ===
                                    biometricDeviceManagementEdit?.branch
                              )
                              .map((data) => ({
                                label: data.unit,
                                value: data.unit,
                                unitcode: data.unitcode,
                              }))
                              .filter((item, index, self) => {
                                return (
                                  self.findIndex(
                                    (i) =>
                                      i.label === item.label &&
                                      i.value === item.value
                                  ) === index
                                );
                              })}
                            styles={colourStyles}
                            value={{
                              label: biometricDeviceManagementEdit.unit,
                              value: biometricDeviceManagementEdit.unit,
                            }}
                            onChange={(e) => {
                              setBiometricDeviceManagementEdit({
                                ...biometricDeviceManagementEdit,
                                unit: e.value,
                                unitcode: e.unitcode,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Floor<b style={{ color: "red" }}>*</b>
                          </Typography>
                          <Selects
                            options={allfloor
                              ?.filter(
                                (u) =>
                                  biometricDeviceManagementEdit?.branch ===
                                  u.branch
                              )
                              .map((u) => ({
                                ...u,
                                label: u.name,
                                value: u.name,
                              }))
                              .filter((item, index, self) => {
                                return (
                                  self.findIndex(
                                    (i) =>
                                      i.label === item.label &&
                                      i.value === item.value
                                  ) === index
                                );
                              })}
                            styles={colourStyles}
                            value={{
                              label: biometricDeviceManagementEdit.floor,
                              value: biometricDeviceManagementEdit.floor,
                            }}
                            onChange={(e) => {
                              setBiometricDeviceManagementEdit({
                                ...biometricDeviceManagementEdit,
                                floor: e.value,
                                floorcode: e.code,
                                area: "Please Select Area",
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Area<b style={{ color: "red" }}>*</b>
                          </Typography>
                          <Selects
                            maxMenuHeight={300}
                            options={filteredAreas
                              .filter(
                                (item) =>
                                  biometricDeviceManagementEdit?.floor ===
                                    item.floor &&
                                  biometricDeviceManagementEdit?.branch ===
                                    item.branch
                              )
                              .flatMap((item) => item.area)
                              .map((location) => ({
                                label: location,
                                value: location,
                              }))}
                            value={{
                              label: biometricDeviceManagementEdit.area,
                              value: biometricDeviceManagementEdit.area,
                            }}
                            onChange={(e) => {
                              setBiometricDeviceManagementEdit({
                                ...biometricDeviceManagementEdit,
                                area: e.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      {/* Newly Added Branch and Model */}
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Biometric Brand<b style={{ color: "red" }}>*</b>
                          </Typography>
                          <Selects
                            maxMenuHeight={300}
                            options={[
                              ...new Map(
                                BrandOptions.map((i) => [
                                  i.value.toLowerCase(),
                                  i,
                                ])
                              ).values(),
                            ]}
                            placeholder="Please Select Brand"
                            value={{
                              label: biometricDeviceManagementEdit.brand,
                              value: biometricDeviceManagementEdit.brand,
                            }}
                            onChange={(e) => {
                              setBiometricDeviceManagementEdit({
                                ...biometricDeviceManagementEdit,
                                brand: e.value,
                                biometricassignedip: "",
                                biometricassignedurl: "",
                                biometricserialno:
                                  e.value === "New"
                                    ? ""
                                    : "Please Select Serial Number",
                                biometricdeviceid: "",
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Biometric Model<b style={{ color: "red" }}>*</b>
                          </Typography>
                          <Selects
                            maxMenuHeight={300}
                            options={ModelOptions}
                            placeholder="Please Select Model"
                            value={{
                              label: biometricDeviceManagementEdit.model,
                              value: biometricDeviceManagementEdit.model,
                            }}
                            onChange={(e) => {
                              setBiometricDeviceManagementEdit({
                                ...biometricDeviceManagementEdit,
                                model: e.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Biometric Device ID{" "}
                            <b style={{ color: "red" }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Please Enter Biometric Device ID"
                            value={
                              biometricDeviceManagementEdit.biometricdeviceid
                            }
                            onChange={(e) => {
                              setBiometricDeviceManagementEdit({
                                ...biometricDeviceManagementEdit,
                                biometricdeviceid: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Biometric Serial No{" "}
                            <b style={{ color: "red" }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Please Enter Biometric Serial No"
                            value={
                              biometricDeviceManagementEdit.biometricserialno
                            }
                            onChange={(e) => {
                              setBiometricDeviceManagementEdit({
                                ...biometricDeviceManagementEdit,
                                biometricserialno: e.target.value,
                              });
                            }}
                          />
                          <FormControl fullWidth size="small">
                            <FormControlLabel
                              label="Visitor Device"
                              control={
                                <Checkbox
                                  sx={{
                                    "& .MuiSvgIcon-root": {
                                      fontSize: 40,
                                      marginTop: 1,
                                    },
                                  }}
                                  checked={
                                    biometricDeviceManagementEdit?.isVisitor ||
                                    false
                                  }
                                  onChange={(e) =>
                                    setBiometricDeviceManagementEdit({
                                      ...biometricDeviceManagementEdit,
                                      isVisitor: e.target.checked,
                                    })
                                  }
                                  color="primary"
                                />
                              }
                            />
                          </FormControl>
                        </FormControl>
                      </Grid>

                      {biometricDeviceManagementEdit?.brand ===
                      "Bowee-Chandechan" ? (
                        <Grid item md={3} xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Biometric Assigned URL{" "}
                              <b style={{ color: "red" }}>*</b>
                            </Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Please Enter Biometric Assigned URL"
                              value={
                                biometricDeviceManagementEdit.biometricassignedurl
                              }
                              onChange={(e) => {
                                const enteredValue = e.target.value;
                                setBiometricDeviceManagementEdit({
                                  ...biometricDeviceManagementEdit,
                                  biometricassignedurl: enteredValue,
                                });
                              }}
                            />
                          </FormControl>
                        </Grid>
                      ) : (
                        <Grid item md={3} xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Biometric Assigned IP{" "}
                              <b style={{ color: "red" }}>*</b>
                            </Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Please Enter Biometric Assigned IP"
                              value={
                                biometricDeviceManagementEdit.biometricassignedip
                              }
                              onChange={(e) => {
                                const enteredValue = e.target.value;

                                // Regex to match partial IP address structure
                                if (
                                  enteredValue === "" ||
                                  /^(\d{1,3}\.){0,3}\d{0,3}$/.test(enteredValue) // Matches up to 3 octets and the last segment
                                ) {
                                  // Split the entered value by dots
                                  const segments = enteredValue.split(".");

                                  // Ensure all segments are numbers between 0 and 255
                                  const isValid = segments.every(
                                    (segment) =>
                                      segment === "" ||
                                      (Number(segment) >= 0 &&
                                        Number(segment) <= 255)
                                  );

                                  if (isValid) {
                                    setBiometricDeviceManagementEdit({
                                      ...biometricDeviceManagementEdit,
                                      biometricassignedip: enteredValue,
                                    });
                                  }
                                }
                              }}
                            />
                          </FormControl>
                        </Grid>
                      )}
                      <Grid item md={2} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <FormControlLabel
                            label="RFID Device"
                            control={
                              <Checkbox
                                sx={{
                                  "& .MuiSvgIcon-root": {
                                    fontSize: 40,
                                    marginTop: 1,
                                  },
                                }}
                                checked={
                                  biometricDeviceManagementEdit?.rfidDevice ||
                                  false
                                }
                                onChange={(e) => {
                                  setBiometricDeviceManagementEdit({
                                    ...biometricDeviceManagementEdit,
                                    rfidDevice: e.target.checked,
                                  });
                                  setGetImgEdit("");
                                  setRefImageEdit([]);
                                  setPreviewURLEdit(null);
                                  setRefImageDragEdit([]);
                                  setCapturedImagesEdit([]);
                                  setTodoscheckSignatureEdit([]);
                                  setBiometricDeviceManagementEdit((prev) => ({
                                    ...prev,
                                    rfidnumber: "",
                                  }));
                                }}
                                color="primary"
                              />
                            }
                          />
                        </FormControl>
                      </Grid>
                      {biometricDeviceManagementEdit?.rfidDevice && (
                        <>
                          <Grid item md={3} xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                              <Typography>
                                RFID Number <b style={{ color: "red" }}>*</b>
                              </Typography>
                              <OutlinedInput
                                id="component-outlined"
                                type="text"
                                placeholder="Please Enter RFID Number"
                                value={biometricDeviceManagementEdit.rfidnumber}
                                onChange={(e) => {
                                  setBiometricDeviceManagementEdit({
                                    ...biometricDeviceManagementEdit,
                                    rfidnumber: e.target.value,
                                  });
                                  // }
                                }}
                              />
                            </FormControl>
                          </Grid>
                          <Grid item md={3} xs={12} sm={12}>
                            <Typography>RFID Images</Typography>
                            <Box
                              sx={{ display: "flex", justifyContent: "left" }}
                            >
                              <Button
                                variant="contained"
                                onClick={handleClickUploadPopupOpenEdit}
                              >
                                Upload
                              </Button>
                            </Box>
                          </Grid>
                          <Grid item md={1} sm={2} xs={12} marginTop={3.5}>
                            <Button
                              variant="contained"
                              sx={{ minWidth: "35px" }}
                              onClick={handleCreateTodocheckSignatureEdit}
                            >
                              <FaPlus />
                            </Button>
                          </Grid>
                          <Grid item lg={12} md={12} sm={12} xs={12}>
                            {isWebcamCaptureEdit == true &&
                              capturedImagesEdit?.length > 0 &&
                              capturedImagesEdit?.map((file, index) => (
                                <Grid
                                  container
                                  key={index}
                                  alignItems="center"
                                  spacing={2}
                                  sx={{
                                    padding: "8px 0",
                                    borderBottom: "1px solid #ddd",
                                  }}
                                >
                                  {/* File Icon */}
                                  <Grid item md={1} sm={2} xs={2}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                      }}
                                    >
                                      {file.type.includes("image/") ? (
                                        <img
                                          src={file.preview}
                                          alt={file.name}
                                          height={40}
                                          style={{
                                            maxWidth: "100%",
                                          }}
                                        />
                                      ) : (
                                        <img
                                          className={classes.preview}
                                          src={getFileIcon(file.name)}
                                          height={40}
                                          alt="file icon"
                                        />
                                      )}
                                    </Box>
                                  </Grid>

                                  {/* File Name */}
                                  <Grid item md={3} sm={3} xs={3}>
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {file.name}
                                    </Typography>
                                  </Grid>

                                  {/* Remarks Input */}
                                  <Grid item md={4} sm={4} xs={4}>
                                    <TextField
                                      variant="outlined"
                                      size="small"
                                      placeholder="Enter remarks"
                                      value={file?.remarks || ""}
                                      onChange={(e) =>
                                        handleRemarkChangeWebCamEdit(
                                          e.target.value,
                                          index
                                        )
                                      }
                                      fullWidth
                                    />
                                  </Grid>

                                  {/* View and Delete Icons */}
                                  <Grid
                                    item
                                    md={4}
                                    sm={3}
                                    xs={3}
                                    sx={{
                                      display: "flex",
                                      justifyContent: "flex-end",
                                      gap: 1,
                                    }}
                                  >
                                    <Button
                                      sx={{
                                        padding: "6px",
                                        minWidth: "36px",
                                        borderRadius: "50%",
                                        ":hover": {
                                          backgroundColor: "#f0f0f0",
                                        },
                                      }}
                                      onClick={() => renderFilePreview(file)}
                                    >
                                      <VisibilityOutlinedIcon
                                        style={{
                                          fontSize: "18px",
                                          color: "#357AE8",
                                        }}
                                      />
                                    </Button>
                                    <Button
                                      sx={{
                                        padding: "6px",
                                        minWidth: "36px",
                                        borderRadius: "50%",
                                        ":hover": {
                                          backgroundColor: "#f0f0f0",
                                        },
                                      }}
                                      onClick={() =>
                                        removeCapturedImageEdit(index)
                                      }
                                    >
                                      <FaTrash
                                        style={{
                                          fontSize: "18px",
                                          color: "#a73131",
                                        }}
                                      />
                                    </Button>
                                  </Grid>
                                </Grid>
                              ))}
                            {refImageEdit?.length > 0 &&
                              refImageEdit?.map((data, index) => (
                                <Grid container key={index}>
                                  <Grid item md={2} sm={2} xs={2}>
                                    <Box
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                      }}
                                    >
                                      <img
                                        className={classes.preview}
                                        src={getFileIcon(data.file.name)}
                                        height="10"
                                        alt="file icon"
                                      />
                                      {/* )} */}
                                    </Box>
                                  </Grid>
                                  <Grid
                                    item
                                    md={7}
                                    sm={7}
                                    xs={7}
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography variant="subtitle2">
                                      {" "}
                                      {data.file.name}{" "}
                                    </Typography>
                                  </Grid>
                                  <Grid item md={1} sm={1} xs={1}>
                                    <Grid sx={{ display: "flex" }}>
                                      <Button
                                        sx={{
                                          padding: "14px 14px",
                                          minWidth: "40px !important",
                                          borderRadius: "50% !important",
                                          ":hover": {
                                            backgroundColor: "#80808036", // theme.palette.primary.main
                                          },
                                        }}
                                        onClick={() =>
                                          renderFilePreview(data.file)
                                        }
                                      >
                                        <VisibilityOutlinedIcon
                                          style={{
                                            fontsize: "12px",
                                            color: "#357AE8",
                                          }}
                                        />
                                      </Button>
                                      <Button
                                        sx={{
                                          padding: "14px 14px",
                                          minWidth: "40px !important",
                                          borderRadius: "50% !important",
                                          ":hover": {
                                            backgroundColor: "#80808036", // theme.palette.primary.main
                                          },
                                        }}
                                        onClick={() =>
                                          handleDeleteFileEdit(index)
                                        }
                                      >
                                        <FaTrash
                                          style={{
                                            color: "#a73131",
                                            fontSize: "12px",
                                          }}
                                        />
                                      </Button>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              ))}

                            {refImageDragEdit?.length > 0 &&
                              refImageDragEdit?.map((file, index) => (
                                <Grid
                                  container
                                  key={index}
                                  alignItems="center"
                                  spacing={2}
                                  sx={{
                                    padding: "8px 0",
                                    borderBottom: "1px solid #ddd",
                                  }}
                                >
                                  {/* File Icon */}
                                  <Grid item md={1} sm={2} xs={2}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                      }}
                                    >
                                      {file.type.includes("image/") ? (
                                        <img
                                          src={file.preview}
                                          alt={file.name}
                                          height={40}
                                          style={{
                                            maxWidth: "100%",
                                          }}
                                        />
                                      ) : (
                                        <img
                                          className={classes.preview}
                                          src={getFileIcon(file.name)}
                                          height={40}
                                          alt="file icon"
                                        />
                                      )}
                                    </Box>
                                  </Grid>

                                  {/* File Name */}
                                  <Grid item md={3} sm={3} xs={3}>
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {file.name}
                                    </Typography>
                                  </Grid>

                                  {/* Remarks Input */}
                                  <Grid item md={4} sm={4} xs={4}>
                                    <TextField
                                      variant="outlined"
                                      size="small"
                                      placeholder="Enter remarks"
                                      value={file?.remarks || ""}
                                      onChange={(e) =>
                                        handleRemarkChangeDragDropEdit(
                                          e.target.value,
                                          index
                                        )
                                      }
                                      fullWidth
                                    />
                                  </Grid>

                                  {/* View and Delete Icons */}
                                  <Grid
                                    item
                                    md={4}
                                    sm={3}
                                    xs={3}
                                    sx={{
                                      display: "flex",
                                      justifyContent: "flex-end",
                                      gap: 1,
                                    }}
                                  >
                                    <Button
                                      sx={{
                                        padding: "6px",
                                        minWidth: "36px",
                                        borderRadius: "50%",
                                        ":hover": {
                                          backgroundColor: "#f0f0f0",
                                        },
                                      }}
                                      onClick={() => renderFilePreview(file)}
                                    >
                                      <VisibilityOutlinedIcon
                                        style={{
                                          fontSize: "18px",
                                          color: "#357AE8",
                                        }}
                                      />
                                    </Button>
                                    <Button
                                      sx={{
                                        padding: "6px",
                                        minWidth: "36px",
                                        borderRadius: "50%",
                                        ":hover": {
                                          backgroundColor: "#f0f0f0",
                                        },
                                      }}
                                      onClick={() =>
                                        handleRemoveFileEdit(index)
                                      }
                                    >
                                      <FaTrash
                                        style={{
                                          fontSize: "18px",
                                          color: "#a73131",
                                        }}
                                      />
                                    </Button>
                                  </Grid>
                                </Grid>
                              ))}
                          </Grid>

                          <Grid item md={12} xs={12} sm={12}>
                            {todoscheckSignatureEdit?.length > 0 &&
                              todoscheckSignatureEdit.map((todo, index) => (
                                <div key={index}>
                                  <br />
                                  <br />
                                  <br />
                                  {indexSignatureEdit === index ? (
                                    <Grid container spacing={1}>
                                      <>
                                        <Grid item md={3} xs={12} sm={6}>
                                          <FormControl fullWidth size="small">
                                            <Typography>
                                              RFID Number{" "}
                                              <b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <OutlinedInput
                                              id="component-outlined"
                                              type="text"
                                              placeholder="Please Enter RFID Number"
                                              value={rfidNumberEdit}
                                              onChange={(e) => {
                                                setRfidNumberEdit(
                                                  e.target.value
                                                );
                                              }}
                                            />
                                          </FormControl>
                                        </Grid>
                                      </>
                                      <br />
                                      <br />
                                      <Grid item md={3} sm={6} xs={6}>
                                        <Typography>
                                          <b>RFID Images</b>
                                        </Typography>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            justifyContent: "left",
                                          }}
                                        ></Box>
                                        <Grid item md={12} xs={12} sm={12}>
                                          {
                                            // todo?.files && (
                                            todo.files.map((file, index) => (
                                              <>
                                                <Grid container spacing={2}>
                                                  <Grid
                                                    item
                                                    md={8}
                                                    sm={6}
                                                    xs={6}
                                                  >
                                                    <Typography>
                                                      {file?.path
                                                        ? file?.filename
                                                        : file?.file?.name}
                                                    </Typography>
                                                  </Grid>
                                                  <Grid></Grid>
                                                  <Grid
                                                    item
                                                    md={1}
                                                    sm={6}
                                                    xs={6}
                                                  >
                                                    <VisibilityOutlinedIcon
                                                      style={{
                                                        fontsize: "large",
                                                        color: "#357AE8",
                                                        cursor: "pointer",
                                                      }}
                                                      onClick={() =>
                                                        renderFilePreview(
                                                          file?.path
                                                            ? file
                                                            : file?.file
                                                        )
                                                      }
                                                    />
                                                  </Grid>
                                                </Grid>
                                              </>
                                            ))
                                          }
                                        </Grid>
                                      </Grid>

                                      <Grid item md={1} sm={1} mt={2} xs={1}>
                                        <Button
                                          variant="contained"
                                          style={{
                                            minWidth: "20px",
                                            minHeight: "41px",
                                            background: "transparent",
                                            boxShadow: "none",
                                            marginTop: "5px !important",
                                            "&:hover": {
                                              background: "#f4f4f4",
                                              borderRadius: "50%",
                                              minHeight: "41px",
                                              minWidth: "20px",
                                              boxShadow: "none",
                                            },
                                          }}
                                          disabled={false}
                                          onClick={
                                            handleCreateUpdateSignatureEdit
                                          }
                                        >
                                          <CheckCircleIcon
                                            style={{
                                              color: "#216d21",
                                              fontSize: "1.5rem",
                                            }}
                                          />
                                        </Button>
                                      </Grid>
                                      <Grid item md={1} mt={2} sm={1} xs={1}>
                                        <Button
                                          variant="contained"
                                          style={{
                                            minWidth: "20px",
                                            minHeight: "41px",
                                            background: "transparent",
                                            boxShadow: "none",
                                            marginTop: "5px !important",
                                            "&:hover": {
                                              background: "#f4f4f4",
                                              borderRadius: "50%",
                                              minHeight: "41px",
                                              minWidth: "20px",
                                              boxShadow: "none",
                                            },
                                          }}
                                          onClick={() => {
                                            setSignTodoEdit(false);
                                            setIndexSignatureEdit(-1);
                                          }}
                                          // disabled={!empdigits}
                                        >
                                          <CancelIcon
                                            style={{
                                              color: "#b92525",
                                              fontSize: "1.5rem",
                                            }}
                                          />
                                        </Button>
                                      </Grid>
                                    </Grid>
                                  ) : (
                                    <Grid container spacing={1}>
                                      <>
                                        <Grid item md={1} xs={12} sm={12}>
                                          <FormControl fullWidth size="small">
                                            <Typography>
                                              <b>RFID Number</b>
                                            </Typography>
                                            <Typography>
                                              {todo.rfidnumber}
                                            </Typography>
                                          </FormControl>
                                        </Grid>
                                      </>
                                      <br />
                                      <br />
                                      <Grid item md={3} sm={6} xs={6}>
                                        <Typography>
                                          <b>RFID Images</b>
                                        </Typography>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            justifyContent: "left",
                                          }}
                                        ></Box>
                                        <Grid item md={12} xs={12} sm={12}>
                                          {
                                            // todo?.document?.file && (
                                            todo.files.map((file, index) => (
                                              <>
                                                <Grid container spacing={2}>
                                                  <Grid
                                                    item
                                                    md={8}
                                                    sm={6}
                                                    xs={6}
                                                  >
                                                    <Typography>
                                                      {file?.path
                                                        ? file?.filename
                                                        : file?.file?.name}
                                                    </Typography>
                                                  </Grid>
                                                  <Grid></Grid>
                                                  <Grid
                                                    item
                                                    md={1}
                                                    sm={6}
                                                    xs={6}
                                                  >
                                                    <VisibilityOutlinedIcon
                                                      style={{
                                                        fontsize: "large",
                                                        color: "#357AE8",
                                                        cursor: "pointer",
                                                      }}
                                                      onClick={() =>
                                                        renderFilePreview(
                                                          file?.path
                                                            ? file
                                                            : file?.file
                                                        )
                                                      }
                                                    />
                                                  </Grid>
                                                </Grid>
                                              </>
                                              // )
                                            ))
                                          }
                                        </Grid>
                                      </Grid>
                                      <Grid item md={1} mt={2} sm={6} xs={6}>
                                        <Button
                                          variant="contained"
                                          style={{
                                            minWidth: "20px",
                                            minHeight: "41px",
                                            background: "transparent",
                                            boxShadow: "none",
                                            marginTop: "-13px !important",
                                            "&:hover": {
                                              background: "#f4f4f4",
                                              borderRadius: "50%",
                                              minHeight: "41px",
                                              minWidth: "20px",
                                              boxShadow: "none",
                                            },
                                          }}
                                          onClick={() =>
                                            handleCreateEditSignatureEdit(index)
                                          }
                                          // disabled={!empdigits}
                                        >
                                          <FaEdit
                                            style={{
                                              color: "#1976d2",
                                              fontSize: "1.2rem",
                                            }}
                                          />
                                        </Button>
                                      </Grid>
                                      <Grid item md={1} mt={2} sm={6} xs={6}>
                                        <Button
                                          variant="contained"
                                          style={{
                                            minWidth: "20px",
                                            minHeight: "41px",
                                            background: "transparent",
                                            boxShadow: "none",
                                            marginTop: "-13px !important",
                                            "&:hover": {
                                              background: "#f4f4f4",
                                              borderRadius: "50%",
                                              minHeight: "41px",
                                              minWidth: "20px",
                                              boxShadow: "none",
                                            },
                                          }}
                                          onClick={() => {
                                            setSignTodoEdit(false);
                                            handleDeleteTodocheckSignatureEdit(
                                              index
                                            );
                                          }}
                                        >
                                          <FaTrash
                                            style={{
                                              color: "#b92525",
                                              fontSize: "1.2rem",
                                            }}
                                          />
                                        </Button>
                                      </Grid>
                                    </Grid>
                                  )}

                                  <br />
                                </div>
                              ))}
                          </Grid>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Biometric Serial Number
                            <b style={{ color: "red" }}>*</b>
                          </Typography>
                          <Selects
                            maxMenuHeight={300}
                            options={serialNumberOptions}
                            placeholder="Please Select Serial Number"
                            value={{
                              label:
                                biometricDeviceManagementEdit.biometricserialno,
                              value:
                                biometricDeviceManagementEdit.biometricserialno,
                            }}
                            onChange={handleBiometricChangeEdit}
                            // onChange={(e) => {
                            //     onChange={handleBiometricChange}
                            //     setBiometricDeviceManagementEdit({
                            //         ...biometricDeviceManagementEdit,
                            //         biometricserialno: e.value,
                            //     });
                            // }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Company <b style={{ color: "red" }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Please Enter Company"
                            value={biometricDeviceManagementEdit.company}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Branch<b style={{ color: "red" }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Please Enter Branch"
                            value={biometricDeviceManagementEdit.branch}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Unit<b style={{ color: "red" }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Please Enter Unit"
                            value={biometricDeviceManagementEdit.unit}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Floor<b style={{ color: "red" }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Please Enter Floor"
                            value={biometricDeviceManagementEdit.floor}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Area<b style={{ color: "red" }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Please Enter Area"
                            value={biometricDeviceManagementEdit.area}
                          />
                        </FormControl>
                      </Grid>
                      {/* Newly Added Branch and Model */}
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Biometric Brand<b style={{ color: "red" }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Please Enter Brand"
                            value={biometricDeviceManagementEdit.brand}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Biometric Model<b style={{ color: "red" }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Please Enter Model"
                            value={biometricDeviceManagementEdit.model}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item md={3} xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Biometric Device ID{" "}
                            <b style={{ color: "red" }}>*</b>
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            placeholder="Please Enter Biometric Device ID"
                            value={
                              biometricDeviceManagementEdit.biometricdeviceid
                            }
                            onChange={(e) => {
                              setBiometricDeviceManagementEdit({
                                ...biometricDeviceManagementEdit,
                                biometricdeviceid: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>

                      {biometricDeviceManagementEdit?.brand ===
                      "Bowee-Chandechan" ? (
                        <Grid item md={3} xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Biometric Assigned URL{" "}
                              <b style={{ color: "red" }}>*</b>
                            </Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Please Enter Biometric Assigned URL"
                              value={
                                biometricDeviceManagementEdit.biometricassignedurl
                              }
                            />
                          </FormControl>
                        </Grid>
                      ) : (
                        <Grid item md={3} xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <Typography>
                              Biometric Assigned IP{" "}
                              <b style={{ color: "red" }}>*</b>
                            </Typography>
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Please Enter Biometric Assigned IP"
                              value={
                                biometricDeviceManagementEdit.biometricassignedip
                              }
                            />
                          </FormControl>
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
                <br />
                <br />
                <Grid container spacing={2}>
                  <Grid item md={6} xs={6} sm={6}>
                    <Button sx={buttonStyles.buttonsubmit} type="submit">
                      Update
                    </Button>
                  </Grid>
                  <Grid item md={6} xs={6} sm={6}>
                    <Button
                      sx={buttonStyles.btncancel}
                      onClick={handleCloseModEdit}
                    >
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
      {isUserRoleCompare?.includes("lbiometricdevicemanagement") && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>
                Biometric Device Management List
              </Typography>
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
                    sx={{ width: "77px" }}
                  >
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                    <MenuItem value={acPointCalculation?.length}>All</MenuItem>
                  </Select>
                </Box>
              </Grid>
              <Grid
                item
                md={8}
                xs={12}
                sm={12}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box>
                  {isUserRoleCompare?.includes(
                    "excelbiometricdevicemanagement"
                  ) && (
                    <>
                      <Button
                        onClick={(e) => {
                          setIsFilterOpen(true);
                          fetchAcpointcalculation();
                          setFormat("xl");
                        }}
                        sx={userStyle.buttongrp}
                      >
                        <FaFileExcel />
                        &ensp;Export to Excel&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes(
                    "csvbiometricdevicemanagement"
                  ) && (
                    <>
                      <Button
                        onClick={(e) => {
                          setIsFilterOpen(true);
                          fetchAcpointcalculation();
                          setFormat("csv");
                        }}
                        sx={userStyle.buttongrp}
                      >
                        <FaFileCsv />
                        &ensp;Export to CSV&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes(
                    "printbiometricdevicemanagement"
                  ) && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes(
                    "pdfbiometricdevicemanagement"
                  ) && (
                    <>
                      <Button
                        sx={userStyle.buttongrp}
                        onClick={() => {
                          setIsPdfFilterOpen(true);
                          fetchAcpointcalculation();
                        }}
                      >
                        <FaFilePdf />
                        &ensp;Export to PDF&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes(
                    "imagebiometricdevicemanagement"
                  ) && (
                    <Button
                      sx={userStyle.buttongrp}
                      onClick={handleCaptureImage}
                    >
                      {" "}
                      <ImageIcon
                        sx={{ fontSize: "15px" }}
                      /> &ensp;Image&ensp;{" "}
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item md={2} xs={6} sm={6}>
                {/* <AggregatedSearchBar
                                  columnDataTable={columnDataTable}
                                  setItems={setItems}
                                  addSerialNumber={addSerialNumber}
                                  setPage={setPage}
                                  maindatas={overallFilterdata}
                                  setSearchedString={setSearchedString}
                                  searchQuery={searchQuery}
                                  setSearchQuery={setSearchQuery}
                                  paginated={true}
                                  totalDatas={overallFilterdataAllData}
                              /> */}
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
                            <IoMdOptions
                              style={{ cursor: "pointer" }}
                              onClick={handleClickSearch}
                            />
                          </span>
                        </Tooltip>
                      </InputAdornment>
                    }
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{ "aria-label": "weight" }}
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
            <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>
              Show All Columns
            </Button>
            &ensp;
            <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumns}>
              Manage Columns
            </Button>
            &ensp;
            {isUserRoleCompare?.includes("bdbiometricdevicemanagement") && (
              <Button
                sx={buttonStyles.buttonbulkdelete}
                onClick={handleClickOpenalert}
              >
                Bulk Delete
              </Button>
            )}
            <br />
            <br />
            {!sourceCheck ? (
              <>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <ThreeDots
                    height="80"
                    width="80"
                    radius="9"
                    color="#1976d2"
                    ariaLabel="three-dots-loading"
                    wrapperStyle={{}}
                    wrapperClassName=""
                    visible={true}
                  />
                </Box>
              </>
            ) : (
              <>
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
                  itemsList={overallFilterdataAllData}
                />
                {/* <AggridTable
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
                                  paginated={true}
                                  filteredDatas={filteredDatas}
                                  totalDatas={totalProjects}
                                  searchQuery={searchQuery}
                                  handleShowAllColumns={handleShowAllColumns}
                                  setFilteredRowData={setFilteredRowData}
                                  filteredRowData={filteredRowData}
                                  setFilteredChanges={setFilteredChanges}
                                  filteredChanges={filteredChanges}
                                  gridRefTableImg={gridRefTableImg}
                                  itemsList={overallFilterdataAllData}
                              /> */}
                <Popover
                  id={idSearch}
                  open={openSearch}
                  anchorEl={anchorElSearch}
                  onClose={handleCloseSearch}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                  <Box style={{ padding: "10px", maxWidth: "450px" }}>
                    <Typography variant="h6">Advance Search</Typography>
                    <IconButton
                      aria-label="close"
                      onClick={handleCloseSearch}
                      sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                    <DialogContent sx={{ width: "100%" }}>
                      <Box
                        sx={{
                          width: "350px",
                          maxHeight: "400px",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <Box
                          sx={{
                            maxHeight: "300px",
                            overflowY: "auto",
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
                                      width: "auto",
                                    },
                                  },
                                }}
                                style={{ minWidth: 150 }}
                                value={selectedColumn}
                                onChange={(e) =>
                                  setSelectedColumn(e.target.value)
                                }
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
                                      width: "auto",
                                    },
                                  },
                                }}
                                style={{ minWidth: 150 }}
                                value={selectedCondition}
                                onChange={(e) =>
                                  setSelectedCondition(e.target.value)
                                }
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
                                value={
                                  ["Blank", "Not Blank"].includes(
                                    selectedCondition
                                  )
                                    ? ""
                                    : filterValue
                                }
                                onChange={(e) => setFilterValue(e.target.value)}
                                disabled={["Blank", "Not Blank"].includes(
                                  selectedCondition
                                )}
                                placeholder={
                                  ["Blank", "Not Blank"].includes(
                                    selectedCondition
                                  )
                                    ? "Disabled"
                                    : "Enter value"
                                }
                                sx={{
                                  "& .MuiOutlinedInput-root.Mui-disabled": {
                                    backgroundColor: "rgb(0 0 0 / 26%)",
                                  },
                                  "& .MuiOutlinedInput-input.Mui-disabled": {
                                    cursor: "not-allowed",
                                  },
                                }}
                              />
                            </Grid>
                            {additionalFilters.length > 0 && (
                              <>
                                <Grid item md={12} sm={12} xs={12}>
                                  <RadioGroup
                                    row
                                    value={logicOperator}
                                    onChange={(e) =>
                                      setLogicOperator(e.target.value)
                                    }
                                  >
                                    <FormControlLabel
                                      value="AND"
                                      control={<Radio />}
                                      label="AND"
                                    />
                                    <FormControlLabel
                                      value="OR"
                                      control={<Radio />}
                                      label="OR"
                                    />
                                  </RadioGroup>
                                </Grid>
                              </>
                            )}
                            {additionalFilters.length === 0 && (
                              <Grid item md={4} sm={12} xs={12}>
                                <Button
                                  variant="contained"
                                  onClick={handleAddFilter}
                                  sx={{ textTransform: "capitalize" }}
                                  disabled={
                                    ["Blank", "Not Blank"].includes(
                                      selectedCondition
                                    )
                                      ? false
                                      : !filterValue ||
                                        selectedColumn.length === 0
                                  }
                                >
                                  Add Filter
                                </Button>
                              </Grid>
                            )}

                            <Grid item md={2} sm={12} xs={12}>
                              <Button
                                variant="contained"
                                onClick={() => {
                                  fetchEmployee();
                                  setIsSearchActive(true);
                                  setAdvancedFilter([
                                    ...additionalFilters,
                                    {
                                      column: selectedColumn,
                                      condition: selectedCondition,
                                      value: filterValue,
                                    },
                                  ]);
                                }}
                                sx={{ textTransform: "capitalize" }}
                                disabled={
                                  ["Blank", "Not Blank"].includes(
                                    selectedCondition
                                  )
                                    ? false
                                    : !filterValue ||
                                      selectedColumn.length === 0
                                }
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
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        {manageColumnsContent}
      </Popover>
      {/* view model */}
      <Dialog
        open={openview}
        onClose={handleClickOpenview}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        fullWidth={true}
        sx={{ marginTop: "80px" }}
      >
        <Box sx={{ padding: "20px 50px" }}>
          <>
            <Typography sx={userStyle.HeaderText}>
              {" "}
              View Biometric Device Management
            </Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Mode</Typography>
                  <Typography>{sourceEdit?.mode}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Company</Typography>
                  <Typography>{sourceEdit?.company}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Branch</Typography>
                  <Typography>{sourceEdit?.branch}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Unit</Typography>
                  <Typography>{sourceEdit?.unit}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Floor</Typography>
                  <Typography>{sourceEdit?.floor}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Area</Typography>
                  <Typography>{sourceEdit?.area}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Brand</Typography>
                  <Typography>{sourceEdit?.brand}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Model</Typography>
                  <Typography>{sourceEdit?.model}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Biometric Device ID</Typography>
                  <Typography>{sourceEdit?.biometricdeviceid}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Biometric Serial No</Typography>
                  <Typography>{sourceEdit?.biometricserialno}</Typography>
                </FormControl>
              </Grid>
              {sourceEdit?.brand !== "Bowee-Chandichan" ? (
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Biometric Assigned IP</Typography>
                    <Typography>{sourceEdit?.biometricassignedip}</Typography>
                  </FormControl>
                </Grid>
              ) : (
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Biometric Assigned URL</Typography>
                    <Typography>{sourceEdit?.biometricassignedurl}</Typography>
                  </FormControl>
                </Grid>
              )}
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Visitor Device</Typography>
                  <Typography>{sourceEdit?.isVisitor?.toString()}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Device Common Name</Typography>
                  <Typography>{sourceEdit?.biometriccommonname}</Typography>
                </FormControl>
              </Grid>
              {sourceEdit?.rfidDevice && (
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">RFID</Typography>
                    <Typography>
                      {sourceEdit?.rfidDevice?.toString()}
                    </Typography>
                  </FormControl>
                </Grid>
              )}
            </Grid>
            {sourceEdit?.rfidDevice && (
              <Grid item md={12} xs={12} sm={12}>
                {sourceEdit?.rfidData?.length > 0 &&
                  sourceEdit?.rfidData.map((todo, index) => (
                    <div key={index}>
                      <br />
                      <Grid container spacing={1}>
                        <>
                          <Grid item md={1} xs={12} sm={12}>
                            <FormControl fullWidth size="small">
                              <Typography>
                                <b>RFID Number</b>
                              </Typography>
                              <Typography>{todo.rfidnumber}</Typography>
                            </FormControl>
                          </Grid>
                        </>
                        <br />
                        <br />
                        <Grid item md={3} sm={6} xs={6}>
                          <Typography>
                            <b>RFID Images</b>
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "left",
                            }}
                          ></Box>
                          <Grid item md={12} xs={12} sm={12}>
                            {
                              // todo?.document?.file && (
                              todo.files.map((file, index) => (
                                <>
                                  <Grid container spacing={2}>
                                    <Grid item md={8} sm={6} xs={6}>
                                      <Typography>
                                        {file?.path
                                          ? file?.filename
                                          : file?.file?.name}
                                      </Typography>
                                    </Grid>
                                    <Grid></Grid>
                                    <Grid item md={1} sm={6} xs={6}>
                                      <VisibilityOutlinedIcon
                                        style={{
                                          fontsize: "large",
                                          color: "#357AE8",
                                          cursor: "pointer",
                                        }}
                                        onClick={() =>
                                          renderFilePreview(
                                            file?.path ? file : file?.file
                                          )
                                        }
                                      />
                                    </Grid>
                                  </Grid>
                                </>
                                // )
                              ))
                            }
                          </Grid>
                        </Grid>
                      </Grid>

                      <br />
                    </div>
                  ))}
              </Grid>
            )}
            <br /> <br /> <br />
            <Grid container spacing={2}>
              <Button sx={buttonStyles.btncancel} onClick={handleCloseview}>
                {" "}
                Back{" "}
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>
      {/* ALERT DIALOG */}
      <Box>
        <Dialog
          open={isErrorOpen}
          onClose={handleCloseerr}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent
            sx={{ width: "350px", textAlign: "center", alignItems: "center" }}
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
      {/* EXTERNAL COMPONENTS -------------- START */}
      {/* VALIDATION */}
      <MessageAlert
        openPopup={openPopupMalert}
        handleClosePopup={handleClosePopupMalert}
        popupContent={popupContentMalert}
        popupSeverity={popupSeverityMalert}
      />
      {/* SUCCESS */}
      <AlertDialog
        openPopup={openPopup}
        handleClosePopup={handleClosePopup}
        popupContent={popupContent}
        popupSeverity={popupSeverity}
      />
      {/* PRINT PDF EXCEL CSV */}
      <ExportData
        isFilterOpen={isFilterOpen}
        handleCloseFilterMod={handleCloseFilterMod}
        fileFormat={fileFormat}
        setIsFilterOpen={setIsFilterOpen}
        isPdfFilterOpen={isPdfFilterOpen}
        setIsPdfFilterOpen={setIsPdfFilterOpen}
        handleClosePdfFilterMod={handleClosePdfFilterMod}
        filteredDataTwo={
          (filteredChanges !== null ? filteredRowData : rowDataTable) ?? []
        }
        itemsTwo={acpointCalculationArrayForExport ?? []}
        filename={"Biometric Device Management"}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
      {/* INFO */}
      <InfoPopup
        openInfo={openInfo}
        handleCloseinfo={handleCloseinfo}
        heading="Biometric Device Management Info"
        addedby={addedby}
        updateby={updateby}
      />
      {/*SINGLE DELETE ALERT DIALOG ARE YOU SURE? */}
      <DeleteConfirmation
        open={isDeleteOpen}
        onClose={handleCloseMod}
        onConfirm={delSource}
        title="Are you sure?"
        confirmButtonText="Yes"
        cancelButtonText="Cancel"
      />
      {/*BULK DELETE ALERT DIALOG ARE YOU SURE? */}
      <Box>
        <Dialog
          open={isDeleteOpencheckbox}
          onClose={handleCloseModcheckbox}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent
            sx={{ width: "350px", textAlign: "center", alignItems: "center" }}
          >
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "80px", color: "orange" }}
            />
            {selectedRowsCount > 0 ? (
              <Typography
                variant="h5"
                sx={{ color: "red", textAlign: "center" }}
              >
                Some of the Data's are Linked in other pages. Do You want to
                Delete the Remaining.?
              </Typography>
            ) : (
              <Typography
                variant="h5"
                sx={{ color: "red", textAlign: "center" }}
              >
                This Data is Linked in Some pages
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            {selectedRowsCount > 0 ? (
              <>
                <Button
                  onClick={handleCloseModcheckbox}
                  sx={buttonStyles.btncancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={(e) => delSourcecheckbox(e)}
                  sx={buttonStyles.buttonsubmit}
                >
                  {" "}
                  OK{" "}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="error"
                onClick={handleCloseModcheckbox}
                sx={buttonStyles.buttonsubmit}
              >
                Ok
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
      <Box>
        {/* ALERT DIALOG */}
        <Dialog
          open={isCheckOpen}
          onClose={handleCloseCheck}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent
            sx={{
              width: "350px",
              textAlign: "center",
              alignItems: "center",
            }}
          >
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "80px", color: "orange" }}
            />
            <Typography
              variant="h6"
              sx={{ color: "black", textAlign: "center" }}
            >
              {getOverAllCountDelete}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              sx={buttonStyles.buttonsubmit}
              onClick={handleCloseCheck}
              autoFocus
              variant="contained"
              color="error"
            >
              {" "}
              OK{" "}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* UPLOAD IMAGE DIALOG */}
      <Dialog
        open={uploadPopupOpen}
        onClose={handleUploadPopupClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        sx={{ marginTop: "95px" }}
      >
        <DialogTitle
          id="customized-dialog-title1"
          sx={{ backgroundColor: "#e0e0e0", color: "#000", display: "flex" }}
        >
          Upload Attachments
        </DialogTitle>
        <DialogContent sx={{ minWidth: "750px", height: "850px" }}>
          <Grid container spacing={2}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Typography variant="body2" style={{ marginTop: "5px" }}>
                Max File size: 1MB
              </Typography>
              <div onDragOver={handleDragOver} onDrop={handleDrop}>
                {previewURL && refImageDrag?.length > 0 ? (
                  <>
                    {refImageDrag.map((file, index) => (
                      <>
                        <img
                          src={file.preview}
                          alt={file.name}
                          style={{
                            maxWidth: "70px",
                            maxHeight: "70px",
                            marginTop: "10px",
                          }}
                        />
                        <Button
                          onClick={() => handleRemoveFile(index)}
                          style={{ marginTop: "0px", color: "red" }}
                        >
                          X
                        </Button>
                      </>
                    ))}
                  </>
                ) : (
                  <div
                    style={{
                      marginTop: "10px",
                      marginLeft: "0px",
                      border: "1px dashed #ccc",
                      padding: "0px",
                      width: "100%",
                      height: "150px",
                      display: "flex",
                      alignContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ display: "flex", margin: "50px auto" }}>
                      <ContentCopyIcon /> Drag and drop
                    </div>
                  </div>
                )}
              </div>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <br />
              <FormControl size="small" fullWidth>
                <Grid sx={{ display: "flex" }}>
                  <Button
                    variant="contained"
                    component="label"
                    sx={userStyle.uploadbtn}
                  >
                    Upload
                    <input
                      type="file"
                      multiple
                      id="productimage"
                      // accept="image/*"
                      hidden
                      onChange={handleInputChange}
                    />
                  </Button>
                  &ensp;
                  <Button
                    variant="contained"
                    onClick={showWebcam}
                    sx={userStyle.uploadbtn}
                  >
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
                          isplay: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginLeft: "37px",
                        }}
                      >
                        <img
                          src={image.preview}
                          alt={image.name}
                          height={50}
                          style={{ maxWidth: "-webkit-fill-available" }}
                        />
                      </Box>
                    </Grid>
                    <Grid
                      item
                      md={7}
                      sm={7}
                      xs={12}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="subtitle2">
                        {" "}
                        {image.name}{" "}
                      </Typography>
                    </Grid>
                    <Grid item md={1} sm={1} xs={12}>
                      <Grid sx={{ display: "flex" }}>
                        <Button
                          sx={{
                            marginTop: "15px !important",
                            padding: "14px 14px",
                            minWidth: "40px !important",
                            borderRadius: "50% !important",
                            ":hover": {
                              backgroundColor: "#80808036", // theme.palette.primary.main
                            },
                          }}
                          onClick={() => renderFilePreview(image?.file)}
                        >
                          <VisibilityOutlinedIcon
                            style={{
                              fontsize: "12px",
                              color: "#357AE8",
                              marginTop: "35px !important",
                            }}
                          />
                        </Button>
                        <Button
                          sx={{
                            marginTop: "15px !important",
                            padding: "14px 14px",
                            minWidth: "40px !important",
                            borderRadius: "50% !important",
                            ":hover": {
                              backgroundColor: "#80808036",
                            },
                          }}
                          onClick={() => removeCapturedImage(index)}
                        >
                          <FaTrash
                            style={{
                              color: "#a73131",
                              fontSize: "12px",
                              marginTop: "35px !important",
                            }}
                          />
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              {refImage?.length > 0 &&
                refImage?.map((data, index) => (
                  <Grid container key={index}>
                    <Grid item md={2} sm={2} xs={2}>
                      <Box
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {/* {file.type.includes("image/") ? (
                              <img
                                src={file.preview}
                                alt={file.name}
                                height={50}
                                style={{
                                  maxWidth: "-webkit-fill-available",
                                }}
                              />
                            ) : ( */}
                        <img
                          className={classes.preview}
                          src={getFileIcon(data.file.name)}
                          height="10"
                          alt="file icon"
                        />
                        {/* )} */}
                      </Box>
                    </Grid>
                    <Grid
                      item
                      md={7}
                      sm={7}
                      xs={7}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="subtitle2">
                        {" "}
                        {data.file.name}{" "}
                      </Typography>
                    </Grid>
                    <Grid item md={1} sm={1} xs={1}>
                      <Grid sx={{ display: "flex" }}>
                        <Button
                          sx={{
                            padding: "14px 14px",
                            minWidth: "40px !important",
                            borderRadius: "50% !important",
                            ":hover": {
                              backgroundColor: "#80808036", // theme.palette.primary.main
                            },
                          }}
                          onClick={() => renderFilePreview(data.file)}
                        >
                          <VisibilityOutlinedIcon
                            style={{ fontsize: "12px", color: "#357AE8" }}
                          />
                        </Button>
                        <Button
                          sx={{
                            padding: "14px 14px",
                            minWidth: "40px !important",
                            borderRadius: "50% !important",
                            ":hover": {
                              backgroundColor: "#80808036", // theme.palette.primary.main
                            },
                          }}
                          onClick={() => handleDeleteFile(index)}
                        >
                          <FaTrash
                            style={{ color: "#a73131", fontSize: "12px" }}
                          />
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadOverAll} variant="contained">
            Ok
          </Button>
          <Button onClick={resetImage} sx={userStyle.btncancel}>
            Reset
          </Button>
          <Button onClick={handleUploadPopupClose} sx={userStyle.btncancel}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* webcam alert start */}
      <Dialog
        open={isWebcamOpen}
        onClose={webcamClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
            alignItems: "center",
          }}
        >
          <Webcamimage
            name="create"
            getImg={getImg}
            setGetImg={setGetImg}
            valNum={valNum}
            setValNum={setValNum}
            capturedImages={capturedImages}
            setCapturedImages={setCapturedImages}
            setRefImage={setRefImage}
            setRefImageDrag={setRefImageDrag}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="success" onClick={webcamDataStore}>
            OK
          </Button>
          <Button variant="contained" color="error" onClick={webcamClose}>
            CANCEL
          </Button>
        </DialogActions>
      </Dialog>

      {/* UPLOAD IMAGE DIALOG */}
      <Dialog
        open={uploadPopupOpenEdit}
        onClose={handleUploadPopupCloseEdit}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        sx={{ marginTop: "95px" }}
      >
        <DialogTitle
          id="customized-dialog-title1"
          sx={{ backgroundColor: "#e0e0e0", color: "#000", display: "flex" }}
        >
          Upload Attachments
        </DialogTitle>
        <DialogContent sx={{ minWidth: "750px", height: "850px" }}>
          <Grid container spacing={2}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Typography variant="body2" style={{ marginTop: "5px" }}>
                Max File size: 1MB
              </Typography>
              <div onDragOver={handleDragOverEdit} onDrop={handleDropEdit}>
                {previewURLEdit && refImageDragEdit?.length > 0 ? (
                  <>
                    {refImageDragEdit?.map((file, index) => (
                      <>
                        <img
                          src={file.preview}
                          alt={file.name}
                          style={{
                            maxWidth: "70px",
                            maxHeight: "70px",
                            marginTop: "10px",
                          }}
                        />
                        <Button
                          onClick={() => handleRemoveFileEdit(index)}
                          style={{ marginTop: "0px", color: "red" }}
                        >
                          X
                        </Button>
                      </>
                    ))}
                  </>
                ) : (
                  <div
                    style={{
                      marginTop: "10px",
                      marginLeft: "0px",
                      border: "1px dashed #ccc",
                      padding: "0px",
                      width: "100%",
                      height: "150px",
                      display: "flex",
                      alignContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ display: "flex", margin: "50px auto" }}>
                      <ContentCopyIcon /> Drag and drop
                    </div>
                  </div>
                )}
              </div>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <br />
              <FormControl size="small" fullWidth>
                <Grid sx={{ display: "flex" }}>
                  <Button
                    variant="contained"
                    component="label"
                    sx={userStyle.uploadbtn}
                  >
                    Upload
                    <input
                      type="file"
                      multiple
                      id="productimage"
                      // accept="image/*"
                      hidden
                      onChange={handleInputChangeEdit}
                    />
                  </Button>
                  &ensp;
                  <Button
                    variant="contained"
                    onClick={showWebcamEdit}
                    sx={userStyle.uploadbtn}
                  >
                    Webcam
                  </Button>
                </Grid>
              </FormControl>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              {isWebcamCaptureEdit == true &&
                capturedImagesEdit.map((image, index) => (
                  <Grid container key={index}>
                    <Grid item md={2} sm={2} xs={12}>
                      <Box
                        style={{
                          isplay: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginLeft: "37px",
                        }}
                      >
                        <img
                          src={image.preview}
                          alt={image.name}
                          height={50}
                          style={{ maxWidth: "-webkit-fill-available" }}
                        />
                      </Box>
                    </Grid>
                    <Grid
                      item
                      md={7}
                      sm={7}
                      xs={12}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="subtitle2">
                        {" "}
                        {image.name}{" "}
                      </Typography>
                    </Grid>
                    <Grid item md={1} sm={1} xs={12}>
                      <Grid sx={{ display: "flex" }}>
                        <Button
                          sx={{
                            marginTop: "15px !important",
                            padding: "14px 14px",
                            minWidth: "40px !important",
                            borderRadius: "50% !important",
                            ":hover": {
                              backgroundColor: "#80808036", // theme.palette.primary.main
                            },
                          }}
                          onClick={() => renderFilePreview(image?.file)}
                        >
                          <VisibilityOutlinedIcon
                            style={{
                              fontsize: "12px",
                              color: "#357AE8",
                              marginTop: "35px !important",
                            }}
                          />
                        </Button>
                        <Button
                          sx={{
                            marginTop: "15px !important",
                            padding: "14px 14px",
                            minWidth: "40px !important",
                            borderRadius: "50% !important",
                            ":hover": {
                              backgroundColor: "#80808036",
                            },
                          }}
                          onClick={() => removeCapturedImageEdit(index)}
                        >
                          <FaTrash
                            style={{
                              color: "#a73131",
                              fontSize: "12px",
                              marginTop: "35px !important",
                            }}
                          />
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              {refImageEdit?.length > 0 &&
                refImageEdit?.map((data, index) => (
                  <Grid container key={index}>
                    <Grid item md={2} sm={2} xs={2}>
                      <Box
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {/* {file.type.includes("image/") ? (
                              <img
                                src={file.preview}
                                alt={file.name}
                                height={50}
                                style={{
                                  maxWidth: "-webkit-fill-available",
                                }}
                              />
                            ) : ( */}
                        <img
                          className={classes.preview}
                          src={getFileIcon(data.file.name)}
                          height="10"
                          alt="file icon"
                        />
                        {/* )} */}
                      </Box>
                    </Grid>
                    <Grid
                      item
                      md={7}
                      sm={7}
                      xs={7}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="subtitle2">
                        {" "}
                        {data.file.name}{" "}
                      </Typography>
                    </Grid>
                    <Grid item md={1} sm={1} xs={1}>
                      <Grid sx={{ display: "flex" }}>
                        <Button
                          sx={{
                            padding: "14px 14px",
                            minWidth: "40px !important",
                            borderRadius: "50% !important",
                            ":hover": {
                              backgroundColor: "#80808036", // theme.palette.primary.main
                            },
                          }}
                          onClick={() => renderFilePreview(data.file)}
                        >
                          <VisibilityOutlinedIcon
                            style={{ fontsize: "12px", color: "#357AE8" }}
                          />
                        </Button>
                        <Button
                          sx={{
                            padding: "14px 14px",
                            minWidth: "40px !important",
                            borderRadius: "50% !important",
                            ":hover": {
                              backgroundColor: "#80808036", // theme.palette.primary.main
                            },
                          }}
                          onClick={() => handleDeleteFileEdit(index)}
                        >
                          <FaTrash
                            style={{ color: "#a73131", fontSize: "12px" }}
                          />
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadOverAllEdit} variant="contained">
            Ok
          </Button>
          <Button onClick={resetImageEdit} sx={userStyle.btncancel}>
            Reset
          </Button>
          <Button onClick={handleUploadPopupCloseEdit} sx={userStyle.btncancel}>
            Cancel
          </Button>
        </DialogActions>
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
              sx={buttonStyles.btncancel}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* webcam alert start */}
      <Dialog
        open={isWebcamOpenEdit}
        onClose={webcamCloseEdit}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
            alignItems: "center",
          }}
        >
          <Webcamimage
            name="create"
            getImg={getImgEdit}
            setGetImg={setGetImgEdit}
            valNum={valNumEdit}
            setValNum={setValNumEdit}
            capturedImages={capturedImagesEdit}
            setCapturedImages={setCapturedImagesEdit}
            setRefImage={setRefImageEdit}
            setRefImageDrag={setRefImageDragEdit}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="success"
            onClick={webcamDataStoreEdit}
          >
            OK
          </Button>
          <Button variant="contained" color="error" onClick={webcamCloseEdit}>
            CANCEL
          </Button>
        </DialogActions>
      </Dialog>
      {/* <DeleteConfirmation open={isDeleteOpencheckbox} onClose={handleCloseModcheckbox} onConfirm={delSourcecheckbox} title="Are you sure?" confirmButtonText="Yes" cancelButtonText="Cancel" /> */}
      {/* PLEASE SELECT ANY ROW */}
      <PleaseSelectRow
        open={isDeleteOpenalert}
        onClose={handleCloseModalert}
        message="Please Select any Row"
        iconColor="orange"
        buttonText="OK"
      />
      {/* EXTERNAL COMPONENTS -------------- END */}
    </Box>
  );
}

export default BiometricDeviceManagement;
