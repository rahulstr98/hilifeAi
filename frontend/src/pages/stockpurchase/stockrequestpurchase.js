import { makeStyles } from "@material-ui/core";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ImageIcon from "@mui/icons-material/Image";
import LastPageIcon from "@mui/icons-material/LastPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box, Radio, InputAdornment, RadioGroup, Tooltip,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
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
  TextField,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Switch from "@mui/material/Switch";
import axios from "axios";
import { saveAs } from "file-saver";
// import html2canvas from "html2canvas";
import "jspdf-autotable";
import moment from "moment-timezone";
import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from "react";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaTrash, FaPrint, FaSearch, FaPlus, FaEdit } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import csvIcon from "../../components/Assets/CSV.png";
import excelIcon from "../../components/Assets/excel-icon.png";
import fileIcon from "../../components/Assets/file-icons.png";
import pdfIcon from "../../components/Assets/pdf-icon.png";
import wordIcon from "../../components/Assets/word-icon.png";
import { handleApiError } from "../../components/Errorhandling";
import Headtitle from "../../components/Headtitle";
import { StyledTableCell, StyledTableRow } from "../../components/Table";
// import StyledDataGrid from "../../components/TableStyle";
import { AuthContext, UserRoleAccessContext } from "../../context/Appcontext";
import { colourStyles, userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";
import LoadingButton from "@mui/lab/LoadingButton";
import AlertDialog from "../../components/Alert";
import {
  DeleteConfirmation,
  PleaseSelectRow,
} from "../../components/DeleteConfirmation.js";
import ExportData from "../../components/ExportData";
import InfoPopup from "../../components/InfoPopup.js";
import MessageAlert from "../../components/MessageAlert";
import PageHeading from "../../components/PageHeading";

//new table
import { IoMdOptions } from "react-icons/io";
import { MdClose } from "react-icons/md";
import domtoimage from 'dom-to-image';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import AdvancedSearchBar from '../../components/Searchbar';
import AggregatedSearchBar from "../../components/AggregatedSearchBar";
import AggridTable from "../../components/AggridTable";
import AggridTableForPaginationTable from "../../components/AggridTableForPaginationTable.js";

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

function Stockpurchaserequest() {

  let newval = "VEN0001";

  const [stockmanages, setStockmanage] = useState([]);



  // State to track advanced filter
  const [advancedFilter, setAdvancedFilter] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [columnApi, setColumnApi] = useState(null);
  const [filteredDataItems, setFilteredDataItems] = useState([]);
  //  const [filteredRowData, setFilteredRowData] = useState([]);
  const [logicOperator, setLogicOperator] = useState("AND");

  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("Contains");
  const [filterValue, setFilterValue] = useState("");
  const [additionalFilters, setAdditionalFilters] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const conditions = ["Contains", "Does Not Contain", "Equals", "Does Not Equal", "Begins With", "Ends With", "Blank", "Not Blank"]; // AgGrid-like conditions

  const [overallFilterdata, setOverallFilterdata] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deletecheck, setdeletecheck] = useState(false);





  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const [searchedString, setSearchedString] = useState("");
  const [isHandleChange, setIsHandleChange] = useState(false);
  const gridRefTableImg = useRef(null);
  const gridRefTable = useRef(null);

  const [cateCode, setCatCode] = useState([]);
  const [isBtn, setIsBtn] = useState(false);
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState("");
  const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
  const handleClickOpenPopupMalert = () => {
    setOpenPopupMalert(true);
    setBtnSubmit(false);
    setIsBtn(false)
  };
  const handleClosePopupMalert = () => {
    setOpenPopupMalert(false);
    setIsBtn(false)
  };
  const [openPopup, setOpenPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [popupSeverity, setPopupSeverity] = useState("");
  const handleClickOpenPopup = () => {
    setOpenPopup(true);
    setBtnSubmit(false);
    setIsBtn(false)
  };
  const handleClosePopup = () => {
    setOpenPopup(false);
    setIsBtn(false)
  };

  const [vendorGroupOpt, setVendorGroupopt] = useState([]);
  const [vendorOverall, setVendorOverall] = useState([]);

  const [vendorGroup, setVendorGroup] = useState("Please Select Vendor Group");





  let exportColumnNames = [
    "Company",
    "Branch",
    "Unit",
    "Floor",
    "Area",
    "Location",
    "Date",
    "Time",
    "Request Mode For",
    "Product Details",
    "Quantity",
    "Quantity & UOM",
  ];
  let exportRowValues = [
    "company",
    "branch",
    "unit",
    "floor",
    "area",
    "location",
    "requestdate",
    "requesttime",
    "requestmode",
    "productdetailsnew",
    "quantitynew",
    "uomnew",
  ];



  //Access Module
  const pathname = window.location.pathname;
  const getapi = async () => {
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String("Stock Purchase Request"),
      commonid: String(isUserRoleAccess?._id),
      date: String(new Date()),

      addedby: [
        {
          name: String(isUserRoleAccess?.username),
          date: String(new Date()),
        },
      ],
    });

  }

  useEffect(() => {
    getapi();
  }, []);



  //  Datefield
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + "-" + mm + "-" + dd;

  const gridRef = useRef(null);

  const [vomMaster, setVomMaster] = useState({
    name: "",
  });
  const [vomMasterget, setVomMasterget] = useState([]);

  const [assetmaster, setAssetmaster] = useState([]);
  const [stockArray, setStockArray] = useState([]);

  const [asset, setAsset] = useState({
    name: "",
    materialcode: "",
    assethead: "",
  });

  const [selectedassethead, setSelectedAssethead] = useState(
    "Please Select Assethead"
  );

  const [btnSubmit, setBtnSubmit] = useState(false);

  const handleAssetChange = (e) => {
    const selectedassethead = e.value;
    setSelectedAssethead(selectedassethead);
  };

  const [vendor, setVendor] = useState({
    vendorname: "",
    emailid: "",
    phonenumber: "",
    whatsappnumber: "",
    contactperson: "",
    address: "",
    gstnumber: "",
    bankname: "Please Select Bank Name",
    accountname: "",
    accountnumber: "",
    ifsccode: "",
    phonecheck: false,
  });

  const maxLength = 15;

  const [stock, setStock] = useState([]);

  const [stockmaster, setStockmaster] = useState({
    branch: "",
    unit: "",
    producthead: "",
    vendorname: "Please Select Vendor",
    gstno: "",
    billno: "",
    requesttime: "",
    requestdate: "",
    productname: "",
    productdetails: "",
    warrantydetails: "",
    uom: "Please Select UOM",
    quantity: "",
    rate: "",
    billdate: "",
    files: "",
    warrantyfiles: "",
    warranty: "Yes",
    addedby: "",
    updatedby: "",
    requestmode: "Please Select Request Mode",
    stockcategory: "Please Select Stock Category",
    stocksubcategory: "Please Select Stock Sub Category",
    uomnew: "Please Select UOM",
    quantitynew: "",
    materialnew: "Please Select Material",
    productdetailsnew: "",
  });

  const handleChangephonenumber = (e) => {
    // const regex = /^[0-9]+$/;  // Only allows positive integers
    const regex = /^\d*\.?\d*$/;
    const inputValue = e.target.value;
    // Check if the input value matches the regex or if it's empty (allowing backspace)
    if (regex.test(inputValue) || inputValue === "") {
      // Update the state with the valid numeric value
      setStockmaster({ ...stockmaster, estimation: inputValue });
    }
  };


  const handleEstimationChange = (e) => {
    const { value } = e.target;
    setStockmaster({ ...stockmaster, estimationtime: value });
  };


  const [uomOpt, setUomOpt] = useState([]);
  const [categoryOption, setCategoryOption] = useState([]);
  const [subcategoryOpt, setSubcategoryOption] = useState([]);
  const [materialOptNew, setMaterialoptNew] = useState([]);

  const [floorsEdit, setFloorEdit] = useState([]);
  const [areasEdit, setAreasEdit] = useState([]);
  const [locationsEdit, setLocationsEdit] = useState([
    { label: "ALL", value: "ALL" },
  ]);
  const [companysEdit, setCompanysEdit] = useState([]);

  //get all Locations edit.
  const fetchAllLocationEdit = async (a, b, c) => {
    try {
      let res_type = await axios.get(SERVICE.LOCATIONGROUPING, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let result = res_type.data.locationgroupings
        .filter((d) => d.branch === a && d.floor === b && d.area === c)
        .map((data) => data.location);
      let ji = [].concat(...result);
      const all = [
        { label: "ALL", value: "ALL" },
        ...ji.map((d) => ({
          ...d,
          label: d,
          value: d,
        })),
      ];
      setLocationsEdit(all);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [branchsEdit, setBranchsEdit] = useState([]);

  const fetchCompanyDropdowns = async () => {
    try {
      let res_category = await axios.get(SERVICE.COMPANY, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const companyall = [
        ...res_category?.data?.companies.map((d) => ({
          ...d,
          label: d.name,
          value: d.name,
        })),
      ];
      // setCompanys(companyall);
      setCompanysEdit(companyall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchBranchDropdownsEdit = async (e) => {
    try {
      let res_branch = await axios.get(SERVICE.BRANCH, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let result = res_branch.data.branch.filter((d) => d.company === e);
      const branchall = result.map((d) => ({
        ...d,
        label: d.name,
        value: d.name,
      }));
      setBranchsEdit(branchall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchAreaEdit = async (a, e) => {
    try {
      let res_type = await axios.get(SERVICE.AREAGROUPING, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let result = res_type.data.areagroupings
        .filter((d) => d.branch === a && d.floor === e)
        .map((data) => data.area);
      let ji = [].concat(...result);
      const all = ji.map((d) => ({
        ...d,
        label: d,
        value: d,
      }));
      setAreasEdit(all);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //get all vom master name.
  const fetchVomMaster = async (e) => {
    try {
      let res_vom = await axios.get(SERVICE.MANAGESTOCKITEMS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let getdata = res_vom.data.managestockitems.filter((data) => {
        return (
          data.itemname === e.value &&
          data.stockcategory === stockmaster.stockcategory &&
          data.stocksubcategory === stockmaster.stocksubcategory
        );
      });

      setStockmaster((prev) => ({
        ...prev,
        uomnew: getdata[0].uom,
      }));
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //get all branches.
  const fetchCategoryAll = async () => {
    try {
      let res_location = await axios.get(SERVICE.STOCKCATEGORY, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setCategoryOption([
        ...res_location?.data?.stockcategory?.map((t) => ({
          ...t,
          label: t.categoryname,
          value: t.categoryname,
        })),
      ]);
      // setCategoryOptionEdit([
      //     ...res_location?.data?.stockcategory?.map((t) => ({
      //         ...t,
      //         label: t.categoryname,
      //         value: t.categoryname,
      //     })),
      // ]);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchSubcategoryBased = async (e) => {
    try {
      let res_category = await axios.get(SERVICE.STOCKCATEGORY, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let data_set = res_category.data.stockcategory.filter((data) => {
        return e.value === data.categoryname;
      });

      let subcatOpt = data_set
        ?.map((item) => {
          return item.subcategoryname.map((subcategory) => {
            return {
              label: subcategory,
              value: subcategory,
            };
          });
        })
        .flat();
      setSubcategoryOption(subcatOpt);
      // setStocksubcategoryOptEdit(subcatOpt)
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchMaterialNew = async (e, stockcategory) => {
    try {
      let res = await axios.get(SERVICE.MANAGESTOCKITEMS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const resultall = res.data.managestockitems.filter((data) => {
        return (
          data.stockcategory === stockcategory &&
          data.stocksubcategory === e.value
        );
      });

      const assetmaterialuniqueArray = resultall.map((item) => ({
        label: item.itemname,
        value: item.itemname,
      }));
      setMaterialoptNew(assetmaterialuniqueArray);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchFloorEdit = async (e) => {
    try {
      let res_floor = await axios.get(SERVICE.FLOOR, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let result = res_floor.data.floors.filter((d) => d.branch === e);
      const floorall = result.map((d) => ({
        ...d,
        label: d.name,
        value: d.name,
      }));
      setFloorEdit(floorall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [stockmasteredit, setStockmasteredit] = useState({
    branch: "",
    unit: "",
    producthead: "",
    vendorname: "Please Select Vendor",
    gstno: "",
    billno: "",
    productname: "",
    productdetails: "",
    warrantydetails: "",
    uom: "Please Select UOM",
    quantity: "",
    rate: "",
    billdate: "",
    files: "",
    warrantyfiles: "",
  });

  const [vendorgetid, setVendorgetid] = useState({});
  const [vendornameid, setVendornameid] = useState({});

  const vendorid = async (id) => {
    try {
      let res = await axios.get(`${SERVICE.SINGLE_VENDORDETAILS}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setVendorgetid(res?.data?.svendordetails);
      setVendornameid(id);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //bank name options
  const accounttypes = [
    { value: "ALLAHABAD BANK", label: "ALLAHABAD BANK" },
    { value: "ANDHRA BANK", label: "ANDHRA BANK" },
    { value: "AXIS BANK", label: "AXIS BANK" },
    { value: "STATE BANK OF INDIA", label: "STATE BANK OF INDIA" },
    { value: "BANK OF BARODA", label: "BANK OF BARODA" },
    { value: "CITY UNION BANK", label: "CITY UNION BANK" },
    { value: "UCO BANK", label: "UCO BANK" },
    { value: "TMB BANK", label: "TMB BANK" },
    { value: "UNION BANK OF INDIA", label: "UNION BANK OF INDIA" },
    { value: "BANK OF INDIA", label: "BANK OF INDIA" },
    { value: "BANDHAN BANK LIMITED", label: "BANDHAN BANK LIMITED" },
    { value: "CANARA BANK", label: "CANARA BANK" },
    { value: "GRAMIN VIKASH BANK", label: "GRAMIN VIKASH BANK" },
    { value: "CORPORATION BANK", label: "CORPORATION BANK" },
    { value: "INDIAN BANK", label: "INDIAN BANK" },
    { value: "INDIAN OVERSEAS BANK", label: "INDIAN OVERSEAS BANK" },
    { value: "ORIENTAL BANK OF COMMERCE", label: "ORIENTAL BANK OF COMMERCE" },
    { value: "PUNJAB AND SIND BANK", label: "PUNJAB AND SIND BANK" },
    { value: "PUNJAB NATIONAL BANK", label: "PUNJAB NATIONAL BANK" },
    { value: "RESERVE BANK OF INDIA", label: "RESERVE BANK OF INDIA" },
    { value: "SOUTH INDIAN BANK", label: "SOUTH INDIAN BANK" },
    { value: "UNITED BANK OF INDIA", label: "UNITED BANK OF INDIA" },
    { value: "CENTRAL BANK OF INDIA", label: "CENTRAL BANK OF INDIA" },
    { value: "VIJAYA BANK", label: "VIJAYA BANK" },
    { value: "DENA BANK", label: "DENA BANK" },
    {
      value: "BHARATIYA MAHILA BANK LIMITED",
      label: "BHARATIYA MAHILA BANK LIMITED",
    },
    { value: "FEDERAL BANK LTD", label: "FEDERAL BANK LTD" },
    { value: "HDFC BANK LTD", label: "HDFC BANK LTD" },
    { value: "ICICI BANK LTD", label: "ICICI BANK LTD" },
    { value: "IDBI BANK LTD", label: "IDBI BANK LTD" },
    { value: "PAYTM BANK", label: "PAYTM BANK" },
    { value: "FINO PAYMENT BANK", label: "FINO PAYMENT BANK" },
    { value: "INDUSIND BANK LTD", label: "INDUSIND BANK LTD" },
    { value: "KARNATAKA BANK LTD", label: "KARNATAKA BANK LTD" },
    { value: "KOTAK MAHINDRA BANK", label: "KOTAK MAHINDRA BANK" },
    { value: "YES BANK LTD", label: "YES BANK LTD" },
    { value: "SYNDICATE BANK", label: "SYNDICATE BANK" },
    { value: "BANK OF MAHARASHTRA", label: "BANK OF MAHARASHTRA" },
    { value: "DCB BANK", label: "DCB BANK" },
    { value: "IDFC BANK", label: "IDFC BANK" },
    {
      value: "JAMMU AND KASHMIR BANK BANK",
      label: "JAMMU AND KASHMIR BANK BANK",
    },
    { value: "KARUR VYSYA BANK", label: "KARUR VYSYA BANK" },
    { value: "RBL BANK", label: "RBL BANK" },
    { value: "DHANLAXMI BANK", label: "DHANLAXMI BANK" },
    { value: "CSB BANK", label: "CSB BANK" },
  ];

  const handleMobile = (e) => {
    if (e.length > 10) {
      setPopupContentMalert("Mobile number can't more than 10 characters!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
      let num = e.slice(0, 10);
      setVendor({ ...vendor, phonenumber: num });
    }
  };
  const handlewhatsapp = (e) => {
    if (e.length > 10) {
      setPopupContentMalert("Whats app number can't more than 10 characters!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
      let num = e.slice(0, 10);
      setVendor({ ...vendor, whatsappnumber: num });
    }
  };
  const getPhoneNumber = () => {
    if (vendor.phonecheck) {
      setVendor({ ...vendor, whatsappnumber: vendor.phonenumber });
    } else {
      setVendor({ ...vendor, whatsappnumber: "" });
    }
  };

  useEffect(() => {
    getPhoneNumber();
  }, [vendor.phonecheck, vendor.phonenumber]);

  //Bill upload create

  const [getImg, setGetImg] = useState(null);
  const [refImage, setRefImage] = useState([]);
  const [previewURL, setPreviewURL] = useState(null);
  const [file, setFile] = useState();

  // Upload Popup
  const [uploadPopupOpen, setUploadPopupOpen] = useState(false);
  const handleClickUploadPopupOpen = () => {
    setUploadPopupOpen(true);
  };
  const handleUploadPopupClose = () => {
    setUploadPopupOpen(false);
  };

  //first allexcel....
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

  //reference images
  const handleInputChange = (event) => {
    const files = event.target.files;
    let newSelectedFiles = [...refImage];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Check if the file is an image
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          newSelectedFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            preview: reader.result,
            base64: reader.result.split(",")[1],
          });
          setRefImage(newSelectedFiles);
        };
        reader.readAsDataURL(file);
      } else {
        setPopupContentMalert("Only Accept Images!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
    }
  };

  //first deletefile
  const handleDeleteFile = (index) => {
    const newSelectedFiles = [...refImage];
    newSelectedFiles.splice(index, 1);
    setRefImage(newSelectedFiles);
  };

  const renderFilePreview = async (file) => {
    const response = await fetch(file.preview);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    window.open(link, "_blank");
  };

  const resetImage = () => {
    setGetImg("");
    setFile("");
    setRefImage([]);
    setPreviewURL(null);
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

  // upload warranty

  const [getImgwarranty, setGetImgwarranty] = useState(null);
  const [refImagewarranty, setRefImagewarranty] = useState([]);
  const [previewURLwarranty, setPreviewURLwarranty] = useState(null);
  const [valNumwarranty, setValNumwarranty] = useState(0);
  const [filewarranty, setFilewarranty] = useState();

  // Upload Popup
  const [uploadPopupOpenwarranty, setUploadPopupOpenwarranty] = useState(false);
  const handleClickUploadPopupOpenwarranty = () => {
    setUploadPopupOpenwarranty(true);
  };
  const handleUploadPopupClosewarranty = () => {
    setUploadPopupOpenwarranty(false);
    // setGetImgwarranty("");
    // setFilewarranty("");
    // setPreviewURLwarranty(null);
  };

  //first allexcel....
  const getFileIconwarranty = (fileName) => {
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

  //reference images
  const handleInputChangewarranty = (event) => {
    const files = event.target.files;
    let newSelectedFiles = [...refImagewarranty];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Check if the file is an image
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          newSelectedFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            preview: reader.result,
            base64: reader.result.split(",")[1],
          });
          setRefImagewarranty(newSelectedFiles);
        };
        reader.readAsDataURL(file);
      } else {
        setPopupContentMalert("Only Accept Images!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
    }
  };

  //first deletefile
  const handleDeleteFilewarranty = (index) => {
    const newSelectedFiles = [...refImagewarranty];
    newSelectedFiles.splice(index, 1);
    setRefImagewarranty(newSelectedFiles);
  };

  const renderFilePreviewwarranty = async (file) => {
    const response = await fetch(file.preview);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    window.open(link, "_blank");
  };

  const resetImagewarranty = () => {
    setGetImgwarranty("");
    setFilewarranty("");
    setRefImagewarranty([]);
    setPreviewURLwarranty(null);
  };

  const handleUploadOverAllwarranty = () => {
    setUploadPopupOpenwarranty(false);
  };

  const previewFilewarranty = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewURLwarranty(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  //warraty upload edit

  const [getImgwarrantyedit, setGetImgwarrantyedit] = useState(null);
  const [refImagewarrantyedit, setRefImagewarrantyedit] = useState([]);
  const [previewURLwarrantyedit, setPreviewURLwarrantyedit] = useState(null);
  const [valNumwarrantyedit, setValNumwarrantyedit] = useState(0);
  const [filewarrantyedit, setFilewarrantyedit] = useState();

  // Upload Popup
  const [uploadPopupOpenwarrantyedit, setUploadPopupOpenwarrantyedit] =
    useState(false);
  const handleClickUploadPopupOpenwarrantyedit = () => {
    setUploadPopupOpenwarrantyedit(true);
  };
  const handleUploadPopupClosewarrantyedit = () => {
    setUploadPopupOpenwarrantyedit(false);
    setGetImgwarrantyedit("");
    setFilewarrantyedit("");
    setPreviewURLwarrantyedit(null);
  };

  //first allexcel....
  const getFileIconwarrantyedit = (fileName) => {
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

  //reference images
  const handleInputChangewarrantyedit = (event) => {
    const files = event.target.files;
    let newSelectedFiles = [...refImagewarrantyedit];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Check if the file is an image
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          newSelectedFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            preview: reader.result,
            base64: reader.result.split(",")[1],
          });
          setRefImagewarrantyedit(newSelectedFiles);
        };
        reader.readAsDataURL(file);
      } else {
        setPopupContentMalert("Only Accept Images!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
    }
  };

  //first deletefile
  const handleDeleteFilewarrantyedit = (index) => {
    const newSelectedFiles = [...refImagewarrantyedit];
    newSelectedFiles.splice(index, 1);
    setRefImagewarrantyedit(newSelectedFiles);
  };

  const renderFilePreviewwarrantyedit = async (file) => {
    const response = await fetch(file.preview);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    window.open(link, "_blank");
  };

  const resetImagewarrantyedit = () => {
    setGetImgwarrantyedit("");
    setFilewarrantyedit("");
    setRefImagewarrantyedit([]);
    setPreviewURLwarrantyedit(null);
  };

  const handleUploadOverAllwarrantyedit = () => {
    setUploadPopupOpenwarrantyedit(false);
  };

  const previewFilewarrantyedit = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewURLwarrantyedit(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };


  //bill upload edit

  const [getImgedit, setGetImgedit] = useState(null);
  const [refImageedit, setRefImageedit] = useState([]);
  const [previewURLedit, setPreviewURLedit] = useState(null);
  const [valNumedit, setValNumedit] = useState(0);
  const [fileedit, setFileedit] = useState();

  // Upload Popup
  const [uploadPopupOpenedit, setUploadPopupOpenedit] = useState(false);
  const handleClickUploadPopupOpenedit = () => {
    setUploadPopupOpenedit(true);
  };
  const handleUploadPopupCloseedit = () => {
    setUploadPopupOpenedit(false);
    setGetImgedit("");
    setFileedit("");
    setPreviewURLedit(null);
  };

  //first allexcel....
  const getFileIconedit = (fileName) => {
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

  console.log(refImageedit, "refImageedit")

  //reference images
  const handleInputChangeedit = (event) => {
    try {

      const files = event.target.files;
      let newSelectedFiles = [...refImageedit];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Check if the file is an image
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = () => {
            newSelectedFiles.push({
              name: file.name,
              size: file.size,
              type: file.type,
              preview: reader.result,
              base64: reader.result.split(",")[1],
            });
            setRefImageedit(newSelectedFiles);
          };

          reader.readAsDataURL(file);

        } else {
          setPopupContentMalert("Only Accept Images!");
          setPopupSeverityMalert("info");
          handleClickOpenPopupMalert();
        }
      }

    } catch (err) {
      console.log(err, "image")
    }
  };

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
    const link = document.createElement("a");
    link.href = url;
    window.open(link, "_blank");
  };

  const resetImageedit = () => {
    setGetImgedit("");
    setFileedit("");
    setRefImageedit([]);
    setPreviewURLedit(null);
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


  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowsstock, setSelectedRowsstock] = useState([]);
  const [vendormaster, setVendormaster] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [teamstabledata, setTeamstableData] = useState([]);
  const [account, setAccount] = useState([]);

  const [units, setUnits] = useState([]);

  const [selectedBranch, setSelectedBranch] = useState("Please Select Branch");
  const [selectedBranchedit, setSelectedBranchedit] = useState(
    "Please Select Branch"
  );
  const [selectedUnit, setSelectedUnit] = useState("Please Select Unit");
  const [selectedUnitedit, setSelectedUnitedit] =
    useState("Please Select Unit");

  const [selectedProducthead, setSelectedProducthead] = useState(
    "Please Select Producthead"
  );
  const [selectedAssetType, setSelectedAssetType] = useState(
    ""
  );
  const [selectedProductheadedit, setSelectedProductheadedit] = useState(
    "Please Select Producthead"
  );
  const [selectedProductname, setSelectedProductname] = useState(
    "Please Select Productname"
  );
  const [selectedProductnameedit, setSelectedProductnameedit] = useState(
    "Please Select Productname"
  );

  const [filteredUnit, setFilteredUnit] = useState([]);
  const [filteredUnitEdit, setFilteredUnitEdit] = useState([]);

  const [filteredProductname, setFilteredProductname] = useState([]);
  const [filteredProductnameEdit, setFilteredProductnameEdit] = useState([]);

  const [searchQueryManage, setSearchQueryManage] = useState("");

  //  Datefield
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + "-" + mm + "-" + dd;


  const [stockmanagemasteredit, setStockmanagemasteredit] = useState({
    branch: "",
    unit: "",
    producthead: "",
    productname: "",
    productdetails: "",
    uom: "Please Select UOM",
    quantity: "",
  });

  // const handleVendorChange = (e) => {
  //     const selectedvendorname = e.value;
  //     setSelectedVendorname(selectedvendorname);
  // };

  //alert model for vendor details
  const [openviewalertvendor, setOpenviewalertvendro] = useState(false);
  // view model
  const handleClickOpenviewalertvendor = () => {
    setOpenviewalertvendro(true);
  };

  const handleCloseviewalertvendor = () => {
    setOpenviewalertvendro(false);
  };

  //alert model for Uom details
  const [openviewalertUom, setOpenviewalertUom] = useState(false);
  // view model
  const handleClickOpenviewalertUom = () => {
    setOpenviewalertUom(true);
  };

  const handleCloseviewalertUom = () => {
    setOpenviewalertUom(false);
  };

  //alert model for Asset details
  const [openviewalertAsset, setOpenviewalertAsset] = useState(false);
  // view model
  const handleClickOpenviewalertAsset = () => {
    setOpenviewalertAsset(true);
  };

  const handleCloseviewalertAsset = () => {
    setOpenviewalertAsset(false);
  };

  const [projEdit, setProjedit] = useState({
    name: "",
  });

  const {
    isUserRoleCompare,
    allProjects, pageName, setPageName,
    isUserRoleAccess,
    isAssignBranch,
    allCompany,
    allBranch,
    allUnit,
    allTeam, buttonStyles
  } = useContext(UserRoleAccessContext);
  // const accessbranch = isAssignBranch
  //   ?.map((data) => ({
  //     branch: data.branch,
  //     company: data.company,
  //     unit: data.unit,
  //   }))
  const accessbranch = isUserRoleAccess?.role?.includes("Manager")
    ? isAssignBranch?.map((data) => ({
      branch: data.branch,
      company: data.company,
      unit: data.unit,
    }))
    : isAssignBranch
      ?.filter((data) => {
        let fetfinalurl = [];

        if (
          data?.modulenameurl?.length !== 0 &&
          data?.submodulenameurl?.length !== 0 &&
          data?.mainpagenameurl?.length !== 0 &&
          data?.subpagenameurl?.length !== 0 &&
          data?.subsubpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
        ) {
          fetfinalurl = data.subsubpagenameurl;
        } else if (
          data?.modulenameurl?.length !== 0 &&
          data?.submodulenameurl?.length !== 0 &&
          data?.mainpagenameurl?.length !== 0 &&
          data?.subpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
        ) {
          fetfinalurl = data.subpagenameurl;
        } else if (
          data?.modulenameurl?.length !== 0 &&
          data?.submodulenameurl?.length !== 0 &&
          data?.mainpagenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
        ) {
          fetfinalurl = data.mainpagenameurl;
        } else if (
          data?.modulenameurl?.length !== 0 &&
          data?.submodulenameurl?.length !== 0 && data?.subsubpagenameurl?.includes(window.location.pathname)
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
      }));


  const { auth, setAuth } = useContext(AuthContext);
  const [projectCheck, setProjectCheck] = useState(false);

  const handleBranchChange = (e) => {
    const selectedBranch = e.value;
    setSelectedBranch(selectedBranch);
    setSelectedUnit("Please Select Unit");
  };

  const handleProductChange = (e) => {
    const selectedProducthead = e.value;
    setSelectedProducthead(selectedProducthead);
    setSelectedProductname("Please Select Productname");
  };

  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();

  const [openview, setOpenview] = useState(false);
  const [openInfo, setOpeninfo] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteproject, setDeleteproject] = useState({});
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [checkvendor, setCheckvendor] = useState();
  const [checkcategory, setCheckcategory] = useState();
  const [checksubcategory, setChecksubcategory] = useState();
  const [checktimepoints, setChecktimepoints] = useState();

  const [copiedData, setCopiedData] = useState("");

  //image


  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage.toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, "StockRequest_Purchase.png");
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };

  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
  };
  const handleSelectionChangestock = (newSelection) => {
    setSelectedRowsstock(newSelection.selectionModel);
  };

  // Error Popup model

  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
    setBtnSubmit(false);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };

  // view model
  const handleClickOpenview = () => {
    setOpenview(true);
  };

  const handleCloseview = () => {
    setOpenview(false);
  };

  const [openstock, setOpenstock] = useState(false);
  const handleClickOpenstock = () => {
    setOpenstock(true);
  };

  const handleClosestock = () => {
    setOpenstock(false);
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
  const handleClickOpeninfo = () => {
    setOpeninfo(true);
  };

  const handleCloseinfo = () => {
    setOpeninfo(false);
    setVendorgetid({});
  };

  //Delete model
  const handleClickOpen = () => {
    setIsDeleteOpen(true);
  };
  const handleCloseMod = () => {
    setIsDeleteOpen(false);
  };

  //Delete model
  const [isDeleteOpenalert, setIsDeleteOpenalert] = useState(false);

  const handleClickOpenalert = () => {
    if (selectedRows.length == 0) {
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

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // This is required for Chrome support
  };
  const classes = useStyles();

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
    if (selectedRows.includes(params.data.id)) {
      return "custom-id-row"; // This is the custom class for rows with item.tat === 'ago'
    }
    return ""; // Return an empty string for other rows
  };

  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    company: true,
    requesttime: true,
    requestdate: true,
    branch: true,
    unit: true,
    floor: true,
    area: true,
    location: true,
    requestmode: true,
    productdetails: true,
    uom: true,
    quantity: true,
    uomnew: true,
    quantitynew: true,
    productdetailsnew: true,
    actions: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(
    initialColumnVisibility
  );

  const fetchVendor = async () => {
    try {
      let res_vendor = await axios.get(SERVICE.ALL_VENDORDETAILS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const vendorall = [
        ...res_vendor?.data?.vendordetails.map((d) => ({
          ...d,
          label: d.vendorname,
          value: d.vendorname,
        })),
      ];
      setVendormaster(vendorall);
      setCatCode(res_vendor?.data?.vendordetails);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchVendorAutoId = async () => {
    try {
      let res_vendor = await axios.get(SERVICE.ALL_VENDORDETAILS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setCatCode(res_vendor?.data?.vendordetails);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  useEffect(() => {
    fetchVendorAutoId()
  }, [])

  const fetchVendorGroup = async () => {
    try {
      let res1 = await axios.get(SERVICE.ALL_VENDORGROUPING, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const allGroup = Array.from(
        new Set(res1?.data?.vendorgrouping.map((d) => d.name))
      ).map((item) => {
        return {
          label: item,
          value: item,
        };
      });

      setVendorGroupopt(allGroup);
      setVendorOverall(res1?.data?.vendorgrouping);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleChangeGroupName = async (e) => {
    let foundDatas = vendorOverall
      .filter((data) => {
        return data.name == e.value;
      })
      .map((item) => item.vendor);

    let res = await axios.get(SERVICE.ALL_VENDORDETAILS, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });
    const all = [
      ...res?.data?.vendordetails.map((d) => ({
        ...d,
        label: d.vendorname,
        value: d.vendorname,
      })),
    ];

    let final = all.filter((data) => {
      return foundDatas.includes(data.value);
    });

    setVendormaster(final);
    stockmaster({ ...stockmaster, vendorname: "Please Select Vendor", })
  };

  //set function to get particular row
  const rowData = async (id) => {
    try {
      let res = await axios.get(`${SERVICE.STOCKMANAGE_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDeleteproject(res?.data?.sstockmanage);
      handleClickOpen();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Alert delete popup
  let projectid = deleteproject._id;
  const delProject = async () => {
    try {
      await axios.delete(`${SERVICE.STOCKMANAGE_SINGLE}/${projectid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      await fetchStock();
      handleCloseMod();
      setSelectedRows([]);
      setPopupContent("Deleted Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
      setPage(1);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const delProjectcheckbox = async () => {
    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(`${SERVICE.STOCKMANAGE_SINGLE}/${item}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
      });

      // Wait for all delete requests to complete
      await Promise.all(deletePromises);

      await fetchStock();
      handleCloseModcheckbox();
      setSelectedRows([]);
      setSelectAllChecked(false);
      setPopupContent("Deleted Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
      setPage(1);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //add function
  const sendRequest = async () => {
    setPageName(!pageName)
    try {
      let stockcreate = await axios.post(SERVICE.STOCKPURCHASE_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        unit: String(selectedUnit),
        branch: String(selectedBranch),
        company: String(stockmaster.company),
        location: String(stockmaster.location),
        area: String(stockmaster.area),
        requesttime: String(stockmaster.requesttime),
        requestdate: String(stockmaster.requestdate),
        floor: String(stockmaster.floor),
        component: String(stockmaster.component),
        warranty: String(stockmaster.warranty),
        estimation: String(stockmaster.estimation),
        estimationtime: String(stockmaster.estimationtime)
          ? stockmaster.estimationtime
          : "Days",
        assettype: selectedAssetType,
        producthead: String(
          selectedProducthead === "Please Select Assethead"
            ? ""
            : selectedProducthead
        ),

        vendor: String(stockmaster.vendorname),
        vendorgroup: String(vendorGroup),
        vendorid: String(vendornameid),
        gstno: String(
          vendorgetid.gstnumber === undefined ? "" : vendorgetid.gstnumber
        ),
        billno: Number(stockmaster.billno),

        productname: String(
          selectedProductname === "Please Select Material"
            ? ""
            : selectedProductname
        ),

        productdetails: String(stockmaster.productdetails),
        warrantydetails: String(stockmaster.warrantydetails),
        uom: String(
          stockmaster.uom === "Please Select UOM" ? "" : stockmaster.uom
        ),
        quantity: Number(stockmaster.quantity),
        rate: Number(stockmaster.rate),
        billdate: String(stockmaster.billdate),
        files: [...refImage],
        warrantyfiles: [...refImagewarranty],

        requestmode: String(stockmaster.requestmode),
        stockcategory:
          stockmaster.stockcategory === "Please Select Stock Category"
            ? ""
            : String(stockmaster.stockcategory),
        stocksubcategory:
          stockmaster.stocksubcategory === "Please Select Stock Sub Category"
            ? ""
            : String(stockmaster.stocksubcategory),
        stockmaterialarray: stockArray,
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });
      let res = await axios.put(`${SERVICE.STOCKMANAGE_SINGLE}/${filterid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        updating: String("updated"),
      });

      setStockmaster(stockcreate.data);
      await fetchStock();
      setStockmaster({
        ...stockmaster,
        gstno: "",
        billno: "",
        productname: "",
        productdetails: "",
        warrantydetails: "",
        quantity: "",
        rate: "",
        billdate: "",
        warrantyfiles: "",
        addedby: "",
        updatedby: "",
      });

      setVendorgetid({});
      setRefImage([]);
      setFile("");
      setGetImg(null);
      setRefImagewarranty([]);
      setFilewarranty("");
      setGetImgwarranty(null);
      setBtnSubmit(false);
      setPopupContent("Added Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
      handleClosestock();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  console.log(stockmaster.warranty, "ewd")
  //submit option for saving
  const handleSubmit = (e) => {
    e.preventDefault();
    setBtnSubmit(true);

    if (stockmaster.requestmode === "Asset Material") {
      if (
        stockmaster.company === "" ||
        stockmaster.company === "Please Select Company"
      ) {
        setPopupContentMalert("Please Select Company!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        selectedBranch === "" ||
        selectedBranch == "Please Select Branch"
      ) {
        setPopupContentMalert("Please Select Branch!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (selectedUnit === "" || selectedUnit == "Please Select Unit") {
        setPopupContentMalert("Please Select Unit!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.floor === "" ||
        stockmaster.floor === "Please Select Floor"
      ) {
        setPopupContentMalert("Please Select Floor!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.area === "" ||
        stockmaster.area === "Please Select Area"
      ) {
        setPopupContentMalert("Please Select Area!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.location === "" ||
        stockmaster.location === "Please Select Location"
      ) {
        setPopupContentMalert("Please Select Location!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
      else if (stockmaster.warranty === "" || stockmaster.warranty === undefined) {
        setPopupContentMalert("Please Enter Warranty");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
      else if (stockmaster.warranty == "Yes" && (stockmaster.estimation === "" || stockmaster.estimation === undefined)) {
        setPopupContentMalert("Please Enter Warranty Time");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
      else if (stockmaster.warranty == "Yes" && (stockmaster.estimationtime === "" || stockmaster.estimationtime === undefined)) {
        setPopupContentMalert("Please select Estimation");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
      else if (
        selectedProducthead === "" ||
        selectedProducthead == "Please Select Producthead"
      ) {
        setPopupContentMalert("Please Select Product Head!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        selectedProductname === "" ||
        selectedProductname == "Please Select Productname"
      ) {
        setPopupContentMalert("Please Select Product Name!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.productdetails === "" ||
        stockmaster.productdetails === undefined
      ) {
        setPopupContentMalert("Please Enter Product Details!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.uom === "" ||
        stockmaster.uom === "Please Select UOM"
      ) {
        setPopupContentMalert("Please Select UOM!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.quantity === "" ||
        stockmaster.quantity === undefined
      ) {
        setPopupContentMalert("Please Enter Quantity!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
      else if (vendorGroup === "Please Select Vendor Group") {
        setPopupContentMalert("Please Select Vendor Group!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
      else if (
        stockmaster.vendorname === "" ||
        stockmaster.vendorname === "Please Select Vendor" ||
        stockmaster.vendorname === undefined
      ) {
        setPopupContentMalert("Please Select Vendor!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }

      else if (
        stockmaster.billno === "" ||
        stockmaster.billno === undefined
      ) {
        setPopupContentMalert("Please Enter Bill No!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        !stockmaster.warranty === "No") {
        setPopupContentMalert("Please Enter Warranty Details!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.rate === "" || stockmaster.rate === undefined) {
        setPopupContentMalert("Please Enter Rate!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.billdate === "" ||
        stockmaster.billdate === undefined
      ) {
        setPopupContentMalert("Please Select Bill Date!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (refImage.length == 0) {
        setPopupContentMalert("Please Upload Bill!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else {
        sendRequest();
      }
    } else {
      if (
        stockmaster.company === "" ||
        stockmaster.company === "Please Select Company"
      ) {
        setPopupContentMalert("Please Select Company!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        selectedBranch === "" ||
        selectedBranch == "Please Select Branch"
      ) {
        setPopupContentMalert("Please Select Branch!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (selectedUnit === "" || selectedUnit == "Please Select Unit") {
        setPopupContentMalert("Please Select Unit!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.floor === "" ||
        stockmaster.floor === "Please Select Floor"
      ) {
        setPopupContentMalert("Please Select Floor!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.area === "" ||
        stockmaster.area === "Please Select Area"
      ) {
        setPopupContentMalert("Please Select Area!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.location === "" ||
        stockmaster.location === "Please Select Location"
      ) {
        setPopupContentMalert("Please Select Location!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.stockcategory === "" ||
        stockmaster.stockcategory === "Please Select Stock Category"
      ) {
        setPopupContentMalert("Please Select Stock Category!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.stocksubcategory === "" ||
        stockmaster.stocksubcategory === "Please Select Stock Sub Category"
      ) {
        setPopupContentMalert("Please Select Stock Sub Category!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockArray.length === 0) {
        setPopupContentMalert("To Do List is Missing!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
      // else if (stockmaster.uomnew === "" || stockmaster.uomnew === "Please Select UOM") {
      //     setShowAlert(
      //         <>
      //             <ErrorOutlineOutlinedIcon
      //                 sx={{ fontSize: "100px", color: "orange" }}
      //             />
      //             <p style={{ fontSize: "20px", fontWeight: 900 }}>
      //                 {"UOM is Empty!"}
      //             </p>
      //         </>
      //     );
      //     handleClickOpenerr();
      // }
      // else if (stockmaster.quantitynew === "" || stockmaster.quantitynew === undefined) {
      //     setShowAlert(
      //         <>
      //             <ErrorOutlineOutlinedIcon
      //                 sx={{ fontSize: "100px", color: "orange" }}
      //             />
      //             <p style={{ fontSize: "20px", fontWeight: 900 }}>
      //                 {"Please Enter Quantity"}
      //             </p>
      //         </>
      //     );
      //     handleClickOpenerr();
      // }
      // else if (stockmaster.productdetailsnew === "" || stockmaster.productdetailsnew === undefined) {
      //     setShowAlert(
      //         <>
      //             <ErrorOutlineOutlinedIcon
      //                 sx={{ fontSize: "100px", color: "orange" }}
      //             />
      //             <p style={{ fontSize: "20px", fontWeight: 900 }}>
      //                 {"Please Enter Product Details"}
      //             </p>
      //         </>
      //     );
      //     handleClickOpenerr();
      // }
      else if (vendorGroup === "Please Select Vendor Group") {
        setPopupContentMalert("Please Select Vendor Group!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
      else if (
        stockmaster.vendorname === "" ||
        stockmaster.vendorname === "Please Select Vendor" ||
        stockmaster.vendorname === undefined
      ) {
        setPopupContentMalert("Please Select Vendor!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.billno === "" ||
        stockmaster.billno === undefined
      ) {
        setPopupContentMalert("Please Enter Bill No!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        !stockmaster.warrantydetails === "No"
      ) {
        setPopupContentMalert("Please Enter Warranty Details!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.rate === "" || stockmaster.rate === undefined) {
        setPopupContentMalert("Please Enter Rate!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.billdate === "" ||
        stockmaster.billdate === undefined
      ) {
        setPopupContentMalert("Please Select Bill Date!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
      //  else if (refImage.length == 0) {
      //   setPopupContentMalert("Please Upload Bill!");
      //   setPopupSeverityMalert("info");
      //   handleClickOpenPopupMalert();
      // }
      else {
        sendRequest();
      }
    }
  };

  const handleclear = (e) => {
    e.preventDefault();

    setStockmaster({
      ...stockmaster,
      company: "Please Select Company",
      branch: "",
      floor: "Please Select floor",
      area: "Please Select Area",
      location: "Please Select Location",
      unit: "",
      vendorname: "Please Select Vendor",
      gstno: "",
      billno: "",
      warrantydetails: "",
      rate: "",
      billdate: "",
      files: "",
      warrantyfiles: "",
      addedby: "",
      updatedby: "",
    });
    setVendorGroup("Please Select Vendor Group")
    setSelectedBranch("Please Select Branch");
    setSelectedUnit("Please Select Unit");
    // setSelectedProducthead("Please Select Producthead");
    // setSelectedProductname("Please Select Productname");
    setFile("");
    setRefImage([]);
    setGetImg(null);
    setVendorgetid({ gstnumber: "" });
    setVendormaster([])
    setBranches([]);
    setAreasEdit([]);
    setFloorEdit([]);
    setLocationsEdit([{ label: "ALL", value: "ALL" }]);
    setMaterialoptNew([]);
    setSubcategoryOption([]);
    setPopupContent("Cleared Successfully");
    setPopupSeverity("success");
    handleClickOpenPopup();
  };

  // vendro details create
  //add function
  const sendRequestvendor = async () => {
    try {
      let addVendorDetails = await axios.post(SERVICE.ADD_VENDORDETAILS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        vendorid: String(newval),
        vendorname: String(vendor.vendorname),
        emailid: String(vendor.emailid),
        phonenumber: Number(vendor.phonenumber),
        whatsappnumber: Number(vendor.whatsappnumber),
        phonecheck: Boolean(vendor.phonecheck),
        contactperson: String(vendor.contactperson),
        address: String(vendor.address),
        gstnumber: String(vendor.gstnumber),
        bankname: String(
          vendor.bankname === "Please Select Bank Name" ? "" : vendor.bankname
        ),
        accountname: String(vendor.accountname),
        accountnumber: Number(vendor.accountnumber),
        ifsccode: String(vendor.ifsccode),
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });
      await fetchVendor();
      setVendor({
        vendorname: "",
        emailid: "",
        phonenumber: "",
        whatsappnumber: "",
        contactperson: "",
        address: "",
        gstnumber: "",
        bankname: "Please Select Bank Name",
        accountname: "",
        accountnumber: "",
        ifsccode: "",
        phonecheck: false,
      });
      handleCloseviewalertvendor();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  //valid email verification
  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };
  //submit option for saving
  const handleSubmitvendor = (e) => {
    setIsBtn(true)
    e.preventDefault();
    const isNameMatch = vendormaster.some(
      (item) =>
        item.vendorname.toLowerCase() === vendor.vendorname.toLowerCase()
    );
    if (vendor.vendorname === "") {
      setPopupContentMalert("Please Enter Vendor Name!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    // else if (!validateEmail(vendor.emailid)) {
    //   setPopupContentMalert("Please Enter Valid Email Id!");
    //   setPopupSeverityMalert("info");
    //   handleClickOpenPopupMalert();
    // } 
    else if (vendor.address === "") {
      setPopupContentMalert("Please Enter Address!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert("Vendorame already exits!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      sendRequestvendor();
    }
  };
  const handleClearvendor = (e) => {
    e.preventDefault();
    setVendor({
      vendorname: "",
      emailid: "",
      phonenumber: "",
      whatsappnumber: "",
      contactperson: "",
      address: "",
      gstnumber: "",
      bankname: "Please Select Bank Name",
      accountname: "",
      accountnumber: "",
      ifsccode: "",
      phonecheck: false,
    });
  };

  //post call for UOM
  //add function
  const sendRequestuom = async () => {
    setPageName(!pageName)
    try {
      let vomnamecreate = await axios.post(SERVICE.CREATE_VOMMASTERNAME, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        name: String(vomMaster.name),
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });
      setVomMaster(vomnamecreate.data);
      await fetchUom();
      // await fetchVomMaster();
      setVomMaster({ name: "" });
      handleCloseviewalertUom();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //submit option for saving
  const handleSubmituom = (e) => {
    e.preventDefault();

    const isNameMatch = vomMasterget?.some(
      (item) => item.name?.toLowerCase() === vomMaster.name?.toLowerCase()
    );
    if (vomMaster.name === "") {
      setPopupContentMalert("Please Enter VOM Master Name!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert("VOM Master Name already exits!!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      sendRequestuom();
    }
  };

  const handleclearuom = (e) => {
    e.preventDefault();
    setVomMaster({ name: "" });
  };

  //post call for asset material

  //add function
  const sendRequestasset = async () => {
    setPageName(!pageName)
    try {
      let subprojectscreate = await axios.post(SERVICE.ASSET_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        assethead: selectedassethead,
        name: String(asset.name),
        materialcode: String(asset.materialcode),
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });
      await fetchAsset();
      setAsset(subprojectscreate.data);
      setAsset({ ...asset, name: "", materialcode: "" });
      handleCloseviewalertAsset();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //submit option for saving
  const handleSubmitasset = (e) => {
    e.preventDefault();

    // const isNameMatch = assetmaster?.some(item => item?.name?.toLowerCase() === (asset.name)?.toLowerCase() && item.assethead === selectedassethead);
    // const isCodeMatch = assetmaster?.some(item => item?.headcode?.toLowerCase() === (asset.headcode)?.toLowerCase() && item.name?.toLowerCase() === (asset.name)?.toLowerCase() && item?.assethead === selectedassethead);
    const isNameMatch = assetmaster?.some(
      (item) =>
        item?.name?.toLowerCase() === asset.name?.toLowerCase() &&
        item.assethead === selectedassethead
    );
    const isCodeMatch = assetmaster?.some(
      (item) =>
        item?.materialcode?.toLowerCase() ===
        asset.materialcode?.toLowerCase() &&
        item.assethead === selectedassethead
    );

    if (
      selectedassethead === "" ||
      selectedassethead == "Please Select Assethead"
    ) {
      setPopupContentMalert("Please Select Assethead!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (asset.materialcode === "") {
      setPopupContentMalert("Please Enter Material Code!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (asset.name === "") {
      setPopupContentMalert("Please Enter Material Name!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert("Name already exits!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (isCodeMatch) {
      setPopupContentMalert("Code already exits!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      sendRequestasset();
    }
  };
  const handleClearasset = (e) => {
    e.preventDefault();
    setSelectedAssethead("Please Select Assethead");
    setAsset({ materialcode: "", name: "" });
  };

  //Edit model...
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === "backdropClick") return;
    setIsEditOpen(false);
    setStockmanagemasteredit({
      productdetails: "",
      uom: "",
      quantity: "",
    });
    setSelectedBranchedit("Please Select Branch");
    setSelectedUnitedit("Please Select Unit");
    setSelectedProductheadedit("Please Select Producthead");
    setSelectedProductnameedit("Please Select Productname");
  };
  const [filterid, setFilterid] = useState("");
  //get single row to edit....
  const getCode = async (id) => {
    try {
      let res = await axios.get(`${SERVICE.STOCKMANAGE_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setStockmaster({
        ...res?.data?.sstockmanage,
        vendorname: "Please Select Vendor",
        productdetails: res?.data?.sstockmanage.productdetails,
        uom: res?.data?.sstockmanage.uom,
        quantity: res?.data?.sstockmanage.quantity,
      });
      setSelectedBranch(res?.data?.sstockmanage.branch);
      setStockArray(res?.data?.sstockmanage.stockmaterialarray);
      setSelectedUnit(res?.data?.sstockmanage.unit);
      setSelectedProducthead(res?.data?.sstockmanage.asset);
      setSelectedAssetType(res?.data?.sstockmanage.assettype);
      setSelectedProductname(res?.data?.sstockmanage.material);

      await fetchbranches(
        res?.data?.sstockmanage?.company,
      );
      await fetchFloorEdit(
        res?.data?.sstockmanage?.branch,
      );

      await fetchSubcategoryBased({
        label: res?.data?.sstockmanage.stockcategory,
        value: res?.data?.sstockmanage.stockcategory,
      });
      // await fetchWorkStation();
      await fetchMaterialNew(
        {
          label: res?.data?.sstockmanage.stocksubcategory,
          value: res?.data?.sstockmanage.stocksubcategory,
        },
        res?.data?.sstockmanage.stockcategory
      );
      await fetchAllLocationEdit(
        res?.data?.sstockmanage?.branch,
        res?.data?.sstockmanage?.floor,
        res?.data?.sstockmanage?.area
      );
      await fetchAreaEdit(
        res?.data?.sstockmanage?.branch,
        res?.data?.sstockmanage?.floor
      );
      // setRefImageedit(res?.data?.sstockmanage?.files);
      // setRefImagewarrantyedit(
      //   res?.data?.smanualstock?.warrantyfiles
      //     ? res?.data?.sstockmanage?.warrantyfiles
      //     : []
      // );

      setFilterid(id);
      handleClickOpenstock();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // get single row to view....
  const getviewCode = async (e) => {
    try {
      let res = await axios.get(`${SERVICE.STOCKMANAGE_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setStockmanagemasteredit(res?.data?.sstockmanage);
      handleClickOpenview();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // get single row to view....
  const getinfoCode = async (e) => {
    try {
      let res = await axios.get(`${SERVICE.STOCKMANAGE_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setStockmanagemasteredit(res?.data?.sstockmanage);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //Project updateby edit page...
  let updateby = stockmanagemasteredit?.updatedby;
  let addedby = stockmanagemasteredit?.addedby;

  let maintenanceid = stockmanagemasteredit?._id;

  const fetchbranches = async (e) => {
    try {
      let res_branchunit = await axios.get(SERVICE.BRANCH, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let filtered = res_branchunit?.data?.branch.filter((data) => {
        return data.company === e;
      });
      const branchall = filtered.map((d) => ({
        label: d.name,
        value: d.name,
      }));
      setBranches(branchall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // get all units
  const fetchUnits = async () => {
    try {
      let res_unit = await axios.get(SERVICE.UNIT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const unitall = [
        ...res_unit?.data?.units.map((d) => ({
          ...d,
          label: d.name,
          value: d.name,
        })),
      ];
      setUnits(unitall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //fetching departments whole list
  const fetchAccount = async () => {
    try {
      let teams = await axios.get(SERVICE.ACCOUNTHEAD, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const deptall = [
        ...teams?.data?.accounthead.map((d) => ({
          ...d,
          label: d.headname,
          value: d.headname,
        })),
      ];
      setAccount(deptall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchAsset = async () => {
    try {
      let res_vendor = await axios.get(SERVICE.ASSETS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const deptall = [
        ...res_vendor?.data?.assetmaterial.map((d) => ({
          ...d,
          label: d.name,
          value: d.name,
        })),
      ];
      setAssetmaster(deptall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //get all project.
  const fetchUom = async () => {
    try {
      let res_project = await axios.get(SERVICE.ALL_VOMMASTERNAME, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const deptall = [
        ...res_project?.data?.vommaster.map((d) => ({
          ...d,
          label: d.name,
          value: d.name,
        })),
      ];
      setVomMasterget(deptall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //get all project.
  const fetchStock1 = async () => {
    setPageName(!pageName)
    setProjectCheck(true);

    try {
      // let res_project = await axios.get(SERVICE.STOCKMANAGEFILTERED, {
      let res_project = await axios.post(SERVICE.STOCK_MANAGE_FILTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        assignbranch: accessbranch,
      });

      let filteredData = res_project?.data?.stockmanage;

      let res_project_1 = await axios.get(SERVICE.ALL_VOMMASTERNAME, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let codeValues = res_project_1?.data?.vommaster.map((data) => ({
        name: data.name,
        code: data.code,
      }));

      let setData = filteredData.map((item) => {
        const matchingItem = codeValues.find(
          (item1) => item.uom === item1.name
        );

        const matchingItem1 = codeValues.find(
          (item1) => item.uomnew === item1.name
        );

        if (matchingItem) {
          return { ...item, uomcode: matchingItem.code };
        } else if (matchingItem1) {
          return { ...item, uomcode: matchingItem1.code };
        } else {
          return { ...item };
        }
      });


      setStockmanage(setData);


      setProjectCheck(false);
    } catch (err) {
      setProjectCheck(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }

  }


  const fetchStock = async () => {
    setPageName(!pageName)
    setProjectCheck(true);
    const queryParams = {
      page: Number(page),
      pageSize: Number(pageSize),
      assignbranch: accessbranch,
    };

    const allFilters = [
      ...additionalFilters,
      { column: selectedColumn, condition: selectedCondition, value: filterValue }
    ];
    // Only include advanced filters if they exist, otherwise just use regular searchQuery
    if (allFilters.length > 0 && selectedColumn !== "") {
      queryParams.allFilters = allFilters
      queryParams.logicOperator = logicOperator;
    } else if (searchQuery) {
      queryParams.searchQuery = searchQuery;
    }

    try {
      // let res_project = await axios.get(SERVICE.STOCKMANAGE, {
      let res_employee = await axios.post(SERVICE.STOCK_MANAGE_FILTER, queryParams, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const ans = res_employee?.data?.result?.length > 0 ? res_employee?.data?.result : []

      // let filteredData = ans.filter((data) => {
      //   return data.requestmode === "Asset Material";
      // });

      let res_project_1 = await axios.get(SERVICE.ALL_VOMMASTERNAME, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let codeValues = res_project_1?.data?.vommaster.map((data) => ({
        name: data.name,
        code: data?.code,
      }));
      // setuomcodes(codeValues);

      let setData = ans.map((item) => {
        const matchingItem = codeValues.find(
          (item1) => item.uom === item1.name
        );

        const matchingItem1 = codeValues.find(
          (item1) => item.uomnew === item1.name
        );

        if (matchingItem) {
          return { ...item, uomcode: matchingItem.code };
        } else if (matchingItem1) {
          return { ...item, uomcode: matchingItem1.code };
        } else {
          return { ...item };
        }
      });

      // const itemsWithSerialNumber = setData?.map((item, index) => ({
      //   ...item,
      //   serialNumber: (page - 1) * pageSize + index + 1,
      // }));

      const itemsWithSerialNumber = setData?.map((item, index) => {
        if (item.requestmode === "Stock Material") {


          let quantityNew = item.stockmaterialarray.reduce((total, person) => total + Number(person.quantitynew), 0);

          let materialNew = item.stockmaterialarray.map((data, newindex) => {
            return ` ${data.materialnew}`;
          });

          let productdetailsNew = item.stockmaterialarray.map((data, newindex) => {
            return ` ${data.productdetailsnew}`;
          });

          let quantityAndUom = item.stockmaterialarray.map((data, newindex) => {
            return ` ${data.quantitynew}#${data.uomcodenew}`;
          });

          const nonEmptyParts = productdetailsNew.filter(
            (part) => part.trim() !== ""
          );
          const result = nonEmptyParts.join(",");

          return {
            id: item._id,
            serialNumber: (page - 1) * pageSize + index + 1,
            company: item.company,
            requestdate: moment(item.requestdate).format("DD/MM/YYYY"),
            requesttime: item.requesttime,
            branch: item.branch,
            unit: item.unit,
            floor: item.floor,
            area: item.area,
            location: item.location,
            requestmode: item.requestmode,

            // uomnew: quantityAndUom.join(","),
            uomnew: quantityAndUom.filter(item => item.trim() !== "").join(","),
            // quantitynew: quantityNew.join(","),
            quantitynew: quantityNew,

            // materialnew: materialNew.join(',').toString(),
            // productdetailsnew:
            //   item.stockmaterialarray.length > 0
            //     ? productdetailsNew.join(",")
            //     : "",
            productdetailsnew:
              // productdetailsNew.join(",")
              productdetailsNew.filter(item => item.trim() !== "").join(",")
          };
        } else {
          return {
            id: item._id,
            serialNumber: (page - 1) * pageSize + index + 1,
            company: item.company,
            branch: item.branch,
            unit: item.unit,
            floor: item.floor,
            area: item.area,
            location: item.location,
            requestmode: item.requestmode,
            requestdate: moment(item.requestdate).format("DD/MM/YYYY"),
            requesttime: item.requesttime,
            productdetailsnew: item.productdetails,
            uomnew: `${item.quantity}#${item.uomcode}`,
            quantitynew: item.quantity,
          };
        }
      });
      setStockmanage(itemsWithSerialNumber);


      setOverallFilterdata(res_employee?.data?.totalProjectsData?.length > 0 ?
        res_employee?.data?.totalProjectsData?.map((item, index) => {
          if (item.requestmode === "Stock Material") {


            let quantityNew = item.stockmaterialarray.reduce((total, person) => total + Number(person.quantitynew), 0);

            let materialNew = item.stockmaterialarray.map((data, newindex) => {
              return ` ${data.materialnew}`;
            });

            let productdetailsNew = item.stockmaterialarray.map((data, newindex) => {
              return ` ${data.productdetailsnew}`;
            });

            let quantityAndUom = item.stockmaterialarray.map((data, newindex) => {
              return ` ${data.quantitynew}#${data.uomcodenew}`;
            });

            const nonEmptyParts = productdetailsNew.filter(
              (part) => part.trim() !== ""
            );
            const result = nonEmptyParts.join(",");

            return {
              id: item._id,
              serialNumber: (page - 1) * pageSize + index + 1,
              company: item.company,
              branch: item.branch,
              unit: item.unit,
              requestdate: moment(item.requestdate).format("DD/MM/YYYY"),
              requesttime: item.requesttime,
              floor: item.floor,
              area: item.area,
              location: item.location,
              requestmode: item.requestmode,

              // uomnew: quantityAndUom.join(","),
              uomnew: quantityAndUom.filter(item => item.trim() !== "").join(","),
              // quantitynew: quantityNew.join(","),
              quantitynew: quantityNew,

              // materialnew: materialNew.join(',').toString(),
              // productdetailsnew:
              //   item.stockmaterialarray.length > 0
              //     ? productdetailsNew.join(",")
              //     : "",
              productdetailsnew:
                // productdetailsNew.join(",")
                productdetailsNew.filter(item => item.trim() !== "").join(",")
            };
          } else {
            return {
              ...item,
              serialNumber: (page - 1) * pageSize + index + 1,
              requestdate: moment(item.requestdate).format("DD/MM/YYYY"),
              requesttime: item.requesttime,

            }
          }
        }

        ) : []
      );



      setTotalProjects(ans?.length > 0 ? res_employee?.data?.totalProjects : 0);
      setTotalPages(ans?.length > 0 ? res_employee?.data?.totalPages : 0);
      setPageSize((data) => { return ans?.length > 0 ? data : 10 });
      setPage((data) => { return ans?.length > 0 ? data : 1 });
      setProjectCheck(false);
    }

    catch (err) {
      setProjectCheck(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);

    }

  }


  useEffect(() => {
    fetchStock();
  }, [page, pageSize, searchQuery]);


  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Stock Request to Purchase",
    pageStyle: "print",
  });

  // serial no for listing items
  const addSerialNumber = (datas) => {
    // const itemsWithSerialNumber = datas?.map((item, index) => {
    //   if (item.requestmode === "Stock Material") {


    //     let quantityNew = item.stockmaterialarray.reduce((total, person) => total + Number(person.quantitynew), 0);

    //     let materialNew = item.stockmaterialarray.map((data, newindex) => {
    //       return ` ${data.materialnew}`;
    //     });

    //     let productdetailsNew = item.stockmaterialarray.map((data, newindex) => {
    //       return ` ${data.productdetailsnew}`;
    //     });

    //     let quantityAndUom = item.stockmaterialarray.map((data, newindex) => {
    //       return ` ${data.quantitynew}#${data.uomcodenew}`;
    //     });

    //     const nonEmptyParts = productdetailsNew.filter(
    //       (part) => part.trim() !== ""
    //     );
    //     const result = nonEmptyParts.join(",");

    //     return {
    //       id: item._id,
    //       serialNumber: index + 1,
    //       company: item.company,
    //       branch: item.branch,
    //       unit: item.unit,
    //       floor: item.floor,
    //       area: item.area,
    //       location: item.location,
    //       requestmode: item.requestmode,

    //       // uomnew: quantityAndUom.join(","),
    //       uomnew: quantityAndUom.filter(item => item.trim() !== "").join(","),
    //       // quantitynew: quantityNew.join(","),
    //       quantitynew: quantityNew,

    //       // materialnew: materialNew.join(',').toString(),
    //       // productdetailsnew:
    //       //   item.stockmaterialarray.length > 0
    //       //     ? productdetailsNew.join(",")
    //       //     : "",
    //       productdetailsnew:
    //         // productdetailsNew.join(",")
    //         productdetailsNew.filter(item => item.trim() !== "").join(",")
    //     };
    //   } else {
    //     return {
    //       id: item._id,
    //       serialNumber: index + 1,
    //       company: item.company,
    //       branch: item.branch,
    //       unit: item.unit,
    //       floor: item.floor,
    //       area: item.area,
    //       location: item.location,
    //       requestmode: item.requestmode,

    //       productdetailsnew: item.productdetails,
    //       uomnew: `${item.quantity}#${item.uomcode}`,
    //       quantitynew: item.quantity,
    //     };
    //   }
    // });

    setItems(datas);
  };

  useEffect(() => {
    addSerialNumber(stockmanages);
  }, [stockmanages]);

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
    setFilterValue(event.target.value);
    setPage(1);
  };

  // Split the search query into individual terms
  const searchTerms = searchQuery.toLowerCase().split(" ");
  // Modify the filtering logic to check each term
  const filteredDatas = items?.filter((item) => {
    return searchTerms.every((term) =>
      Object.values(item).join(" ").toLowerCase().includes(term)
    );
  });

  const filteredData = filteredDatas.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // const totalPages = Math.ceil(filteredDatas.length / pageSize);

  const visiblePages = Math.min(totalPages, 3);

  const firstVisiblePage = Math.max(1, page - 1);
  const lastVisiblePage = Math.min(
    firstVisiblePage + visiblePages - 1,
    totalPages
  );

  const pageNumbers = [];

  const indexOfLastItem = page * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;

  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }


  useEffect(() => {
    fetchUom();
    // fetchStock();
    fetchAccount();
    fetchAsset();
    fetchCategoryAll();
    // fetchVendor();
    // fetchUnits();
    fetchVendorGroup();
    // fetchVomMaster();
    // fetchCompanyDropdowns();
  }, []);

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, []);

  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
    <div>
      <Checkbox checked={selectAllChecked} onChange={onSelectAll} />
    </div>
  );

  const [selectAllCheckedstock, setSelectAllCheckedstock] = useState(false);

  const CheckboxHeaderstock = ({ selectAllCheckedstock, onSelectAllstock }) => (
    <div>
      <Checkbox checked={selectAllCheckedstock} onChange={onSelectAllstock} />
    </div>
  );

  const columnDataTable = [
    // {
    //   field: "checkbox",
    //   headerName: "Checkbox", // Default header name
    //   headerStyle: {
    //     fontWeight: "bold", // Apply the font-weight style to make the header text bold
    //     // Add any other CSS styles as needed
    //   },
    //   headerComponent: (params) => (
    //     <CheckboxHeader
    //       selectAllChecked={selectAllChecked}
    //       onSelectAll={() => {
    //         if (rowDataTable.length === 0) {
    //           // Do not allow checking when there are no rows
    //           return;
    //         }

    //         if (selectAllChecked) {
    //           setSelectedRows([]);
    //         } else {
    //           const allRowIds = rowDataTable.map((row) => row.id);
    //           setSelectedRows(allRowIds);
    //         }
    //         setSelectAllChecked(!selectAllChecked);
    //       }}
    //     />
    //   ),

    //   cellRenderer: (params) => (
    //     <Checkbox
    //       checked={selectedRows.includes(params.data.id)}
    //       onChange={() => {
    //         let updatedSelectedRows;
    //         if (selectedRows.includes(params.data.id)) {
    //           updatedSelectedRows = selectedRows.filter(
    //             (selectedId) => selectedId !== params.data.id
    //           );
    //         } else {
    //           updatedSelectedRows = [...selectedRows, params.data.id];
    //         }

    //         setSelectedRows(updatedSelectedRows);

    //         // Update the "Select All" checkbox based on whether all rows are selected
    //         setSelectAllChecked(
    //           updatedSelectedRows.length === filteredData.length
    //         );
    //       }}
    //     />
    //   ),
    //   sortable: false, // Optionally, you can make this column not sortable
    //   width: 90,

    //   hide: !columnVisibility.checkbox,
    //   headerClassName: "bold-header",
    // },
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
      lockPinned: true,
    },
    {
      field: "serialNumber",
      headerName: "SNo",
      flex: 0,
      width: 100,
      hide: !columnVisibility.serialNumber,
      headerClassName: "bold-header",
      pinned: "left",
      lockPinned: true,
    },
    {
      field: "company",
      headerName: "Company",
      flex: 0,
      width: 120,
      hide: !columnVisibility.company,
      headerClassName: "bold-header",
      pinned: "left",
      lockPinned: true,
    },
    {
      field: "branch",
      headerName: "Branch",
      flex: 0,
      width: 120,
      hide: !columnVisibility.branch,
      headerClassName: "bold-header",
      pinned: "left",
      lockPinned: true,
    },
    {
      field: "unit",
      headerName: "Unit",
      flex: 0,
      width: 120,
      hide: !columnVisibility.unit,
      headerClassName: "bold-header",
    },
    {
      field: "floor",
      headerName: "Floor",
      flex: 0,
      width: 120,
      hide: !columnVisibility.floor,
      headerClassName: "bold-header",
    },
    {
      field: "area",
      headerName: "Area",
      flex: 0,
      width: 120,
      hide: !columnVisibility.area,
      headerClassName: "bold-header",
    },
    {
      field: "location",
      headerName: "Location",
      flex: 0,
      width: 120,
      hide: !columnVisibility.location,
      headerClassName: "bold-header",
    },
    {
      field: "requestdate",
      headerName: "Date",
      flex: 0,
      width: 100,
      hide: !columnVisibility.requestdate,
      headerClassName: "bold-header",
    },
    {
      field: "requesttime",
      headerName: "Time",
      flex: 0,
      width: 100,
      hide: !columnVisibility.requesttime,
      headerClassName: "bold-header",
    },



    {
      field: "requestmode",
      headerName: "Request Mode For",
      flex: 0,
      width: 120,
      hide: !columnVisibility.requestmode,
      headerClassName: "bold-header",
    },

    {
      field: "productdetailsnew",
      headerName: "Product Details",
      flex: 0,
      width: 120,
      hide: !columnVisibility.productdetailsnew,
      headerClassName: "bold-header",
    },

    {
      field: "quantitynew",
      headerName: "Quantity",
      flex: 0,
      width: 120,
      hide: !columnVisibility.quantitynew,
      headerClassName: "bold-header",
    },
    {
      field: "uomnew",
      headerName: "Quantity & UOM",
      flex: 0,
      width: 200,
      hide: !columnVisibility.uomnew,
      headerClassName: "bold-header",
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 0,
      width: 80,
      minHeight: "40px !important",
      sortable: false,
      hide: !columnVisibility.actions,
      headerClassName: "bold-header",
      cellRenderer: (params) => (
        <Grid sx={{ display: "flex" }}>
          <Button
            sx={userStyle.buttonedit}
            onClick={() => {
              // handleClickOpenstock();
              getCode(params.data.id);
            }}
          >
            <FaPlus style={{ fontsize: "large" }} />
          </Button>
        </Grid>
      ),
    },
  ];
  const filteredSelectedColumn = columnDataTable.filter(data => data.field !== 'checkbox' && data.field !== "actions" && data.field !== "serialNumber");

  const rowDataTable = items.map((item, index) => {
    return {
      id: item.id,
      serialNumber: item.serialNumber,
      company: item.company,
      branch: item.branch,
      requesttime: item.requesttime,
      requestdate: item.requestdate,
      unit: item.unit,
      floor: item.floor,
      area: item.area,
      location: item.location,
      requestmode: item.requestmode,

      productdetailsnew: item.productdetailsnew,
      uomnew: item.uomnew,
      quantitynew: item.quantitynew,
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

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  const columnMoveRef = useRef(0);
  const columnMoveLimit = 3; // Limit for column moves
  const handleColumnMoved = useCallback(debounce((event) => {
    if (!event.columnApi) return;

    const visible_columns = event.columnApi.getAllColumns().filter(col => {
      const colState = event.columnApi.getColumnState().find(state => state.colId === col.colId);
      return colState && !colState.hide;
    }).map(col => col.colId);

    setColumnVisibility((prevVisibility) => {
      const updatedVisibility = { ...prevVisibility };

      // Ensure columns that are visible stay visible
      Object.keys(updatedVisibility).forEach(colId => {
        updatedVisibility[colId] = visible_columns.includes(colId);
      });

      return updatedVisibility;
    });
  }, 300), []);

  const handleColumnVisible = useCallback((event) => {
    const colId = event.column.getColId();

    // Update visibility based on event, but only when explicitly triggered by grid
    setColumnVisibility((prevVisibility) => ({
      ...prevVisibility,
      [colId]: event.visible, // Set visibility directly from the event
    }));
  }, []);

  // new code for toggle based on the remove columns
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

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };

  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };

  const [fileFormat, setFormat] = useState("");


  // Search bar
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
  const idSearch = openSearch ? 'simple-popover' : undefined;

  const handleAddFilter = () => {
    if (selectedColumn && filterValue || ["Blank", "Not Blank"].includes(selectedCondition)) {
      setAdditionalFilters([
        ...additionalFilters,
        { column: selectedColumn, condition: selectedCondition, value: filterValue }
      ]);
      setSelectedColumn("");
      setSelectedCondition("Contains");
      setFilterValue("");
    }
  };

  // Show filtered combination in the search bar
  const getSearchDisplay = () => {
    if (advancedFilter && advancedFilter.length > 0) {
      return advancedFilter.map((filter, index) => {
        let showname = columnDataTable.find(col => col.field === filter.column)?.headerName;
        return `${showname} ${filter.condition} "${filter.value}"`;
      }).join(' ' + (advancedFilter.length > 1 ? advancedFilter[1].condition : '') + ' ');
    }
    return searchQuery;
  };

  // Disable the search input if the search is active
  const isSearchDisabled = isSearchActive || additionalFilters.length > 0;

  const handleResetSearch = async () => {
    setProjectCheck(true);

    // Reset all filters and pagination state
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
      assignbranch: accessbranch,
    };

    const allFilters = [];
    // Only include advanced filters if they exist, otherwise just use regular searchQuery
    if (allFilters.length > 0 && selectedColumn !== "") {
      queryParams.allFilters = allFilters
      queryParams.logicOperator = logicOperator;
    } else if (searchQuery) {
      queryParams.searchQuery = searchQuery;  // Use searchQuery for regular search
    }

    setPageName(!pageName)

    try {
      // let res_project = await axios.get(SERVICE.STOCKMANAGE, {
      let res_employee = await axios.post(SERVICE.STOCK_MANAGE_FILTER, queryParams, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const ans = res_employee?.data?.result?.length > 0 ? res_employee?.data?.result : []

      // let filteredData = ans.filter((data) => {
      //   return data.requestmode === "Asset Material";
      // });

      let res_project_1 = await axios.get(SERVICE.ALL_VOMMASTERNAME, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let codeValues = res_project_1?.data?.vommaster.map((data) => ({
        name: data.name,
        code: data?.code,
      }));
      // setuomcodes(codeValues);

      let setData = ans.map((item) => {
        const matchingItem = codeValues.find(
          (item1) => item.uom === item1.name
        );

        const matchingItem1 = codeValues.find(
          (item1) => item.uomnew === item1.name
        );

        if (matchingItem) {
          return { ...item, uomcode: matchingItem.code };
        } else if (matchingItem1) {
          return { ...item, uomcode: matchingItem1.code };
        } else {
          return { ...item };
        }
      });

      // const itemsWithSerialNumber = setData?.map((item, index) => ({
      //   ...item,
      //   serialNumber: (page - 1) * pageSize + index + 1,
      // }));

      const itemsWithSerialNumber = setData?.map((item, index) => {
        if (item.requestmode === "Stock Material") {


          let quantityNew = item.stockmaterialarray.reduce((total, person) => total + Number(person.quantitynew), 0);

          let materialNew = item.stockmaterialarray.map((data, newindex) => {
            return ` ${data.materialnew}`;
          });

          let productdetailsNew = item.stockmaterialarray.map((data, newindex) => {
            return ` ${data.productdetailsnew}`;
          });

          let quantityAndUom = item.stockmaterialarray.map((data, newindex) => {
            return ` ${data.quantitynew}#${data.uomcodenew}`;
          });

          const nonEmptyParts = productdetailsNew.filter(
            (part) => part.trim() !== ""
          );
          const result = nonEmptyParts.join(",");

          return {
            id: item._id,
            serialNumber: (page - 1) * pageSize + index + 1,
            company: item.company,
            branch: item.branch,
            unit: item.unit,
            floor: item.floor,
            area: item.area,
            location: item.location,
            requestmode: item.requestmode,

            // uomnew: quantityAndUom.join(","),
            uomnew: quantityAndUom.filter(item => item.trim() !== "").join(","),
            // quantitynew: quantityNew.join(","),
            quantitynew: quantityNew,

            // materialnew: materialNew.join(',').toString(),
            // productdetailsnew:
            //   item.stockmaterialarray.length > 0
            //     ? productdetailsNew.join(",")
            //     : "",
            productdetailsnew:
              // productdetailsNew.join(",")
              productdetailsNew.filter(item => item.trim() !== "").join(",")
          };
        } else {
          return {
            id: item._id,
            serialNumber: (page - 1) * pageSize + index + 1,
            company: item.company,
            branch: item.branch,
            unit: item.unit,
            floor: item.floor,
            area: item.area,
            location: item.location,
            requestmode: item.requestmode,

            productdetailsnew: item.productdetails,
            uomnew: `${item.quantity}#${item.uomcode}`,
            quantitynew: item.quantity,
          };
        }
      });
      setStockmanage(itemsWithSerialNumber);


      setOverallFilterdata(res_employee?.data?.totalProjectsData?.length > 0 ?
        res_employee?.data?.totalProjectsData?.map((item, index) => {
          if (item.requestmode === "Stock Material") {


            let quantityNew = item.stockmaterialarray.reduce((total, person) => total + Number(person.quantitynew), 0);

            let materialNew = item.stockmaterialarray.map((data, newindex) => {
              return ` ${data.materialnew}`;
            });

            let productdetailsNew = item.stockmaterialarray.map((data, newindex) => {
              return ` ${data.productdetailsnew}`;
            });

            let quantityAndUom = item.stockmaterialarray.map((data, newindex) => {
              return ` ${data.quantitynew}#${data.uomcodenew}`;
            });

            const nonEmptyParts = productdetailsNew.filter(
              (part) => part.trim() !== ""
            );
            const result = nonEmptyParts.join(",");

            return {
              id: item._id,
              serialNumber: (page - 1) * pageSize + index + 1,
              company: item.company,
              branch: item.branch,
              unit: item.unit,
              floor: item.floor,
              area: item.area,
              location: item.location,
              requestmode: item.requestmode,

              // uomnew: quantityAndUom.join(","),
              uomnew: quantityAndUom.filter(item => item.trim() !== "").join(","),
              // quantitynew: quantityNew.join(","),
              quantitynew: quantityNew,

              // materialnew: materialNew.join(',').toString(),
              // productdetailsnew:
              //   item.stockmaterialarray.length > 0
              //     ? productdetailsNew.join(",")
              //     : "",
              productdetailsnew:
                // productdetailsNew.join(",")
                productdetailsNew.filter(item => item.trim() !== "").join(",")
            };
          } else {
            return {
              ...item,
              serialNumber: (page - 1) * pageSize + index + 1,


            }
          }
        }

        ) : []
      );



      setTotalProjects(ans?.length > 0 ? res_employee?.data?.totalProjects : 0);
      setTotalPages(ans?.length > 0 ? res_employee?.data?.totalPages : 0);
      setPageSize((data) => { return ans?.length > 0 ? data : 10 });
      setPage((data) => { return ans?.length > 0 ? data : 1 });
      setProjectCheck(false);
    }
    catch (err) { setProjectCheck(false); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };



  return (
    <>
      <Box>
        <Headtitle title={"Manage Stock"} />
        {/* ****** Header Content ****** */}

        {/* ****** Table Start ****** */}
        {isUserRoleCompare?.includes("lstockpurchaserequest") && (
          <>

            <Box sx={userStyle.container}>
              {/* ******************************************************EXPORT Buttons****************************************************** */}
              <Grid item xs={8}>
                {/* <Typography sx={userStyle.importheadtext}>
                List Stock Request To Purchase
              </Typography> */}
                <PageHeading
                  title=" List Stock Request To Purchase"
                  modulename="Asset"
                  submodulename="Stock"
                  mainpagename="Stock Purchase Request"
                  subpagename=""
                  subsubpagename=""
                />
              </Grid>
              <Box>
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
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      {isUserRoleCompare?.includes(
                        "excelstockpurchaserequest"
                      ) && (
                          <>
                            <Button
                              onClick={(e) => {
                                setIsFilterOpen(true);
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
                        "csvstockpurchaserequest"
                      ) && (
                          <>
                            <Button
                              onClick={(e) => {
                                setIsFilterOpen(true);
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
                        "printstockpurchaserequest"
                      ) && (
                          <>
                            <Button
                              sx={userStyle.buttongrp}
                              onClick={handleprint}
                            >
                              &ensp;
                              <FaPrint />
                              &ensp;Print&ensp;
                            </Button>
                          </>
                        )}
                      {isUserRoleCompare?.includes(
                        "pdfstockpurchaserequest"
                      ) && (
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
                      {isUserRoleCompare?.includes(
                        "imagestockpurchaserequest"
                      ) && (
                          <>
                            <Button
                              sx={userStyle.buttongrp}
                              onClick={handleCaptureImage}
                            >
                              {" "}
                              <ImageIcon sx={{ fontSize: "15px" }} />{" "}
                              &ensp;Image&ensp;{" "}
                            </Button>
                          </>
                        )}
                    </Box>
                  </Grid>
                  <Grid item md={2} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <OutlinedInput size="small"
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
                                <IoMdOptions style={{ cursor: 'pointer', }} onClick={handleClickSearch} />
                              </span>
                            </Tooltip>
                          </InputAdornment>}
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{ 'aria-label': 'weight', }}
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
                <Grid container spacing={1}>
                  <Grid item md={6} xs={12} sm={12}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "left",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <Button
                        sx={userStyle.buttongrp}
                        onClick={handleShowAllColumns}
                      >
                        Show All Columns
                      </Button>
                      <Button
                        sx={userStyle.buttongrp}
                        onClick={handleOpenManageColumns}
                      >
                        Manage Columns
                      </Button>
                      {isUserRoleCompare?.includes(
                        "bdstockpurchaserequest"
                      ) && (
                          <Button
                            variant="contained"
                            sx={buttonStyles.buttonbulkdelete}
                            onClick={handleClickOpenalert}
                          >
                            Bulk Delete
                          </Button>
                        )}
                    </Box>
                  </Grid>
                </Grid>

                <br />
                <br />
                {projectCheck ? (
                  <Box sx={userStyle.container}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        minHeight: "350px",
                      }}
                    >
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
                      {/* <FacebookCircularProgress /> */}
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Box style={{ width: "100%", overflowY: "hidden" }}>
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
                          itemsList={overallFilterdata}
                        />
                      </>
                    </Box>
                  </>
                )}
                {/* ****** Table End ****** */}
              </Box>
            </Box>

          </>
        )}
        {/* Manage Column */}

        <Popover
          id={id}
          open={isManageColumnsOpen}
          anchorEl={anchorEl}
          onClose={handleCloseManageColumns}
          anchorOrigin={{ vertical: "bottom", horizontal: "left", }}
          transformOrigin={{ vertical: 'center', horizontal: 'right', }}
        >
          {manageColumnsContent}
        </Popover>
        <Popover
          id={idSearch}
          open={openSearch}
          anchorEl={anchorElSearch}
          onClose={handleCloseSearch}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }}
        >
          <Box style={{ padding: "10px", maxWidth: '450px' }}>
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
              <Box sx={{
                width: '350px',
                maxHeight: '400px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <Box sx={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  // paddingRight: '5px'
                }}>
                  <Grid container spacing={1}>
                    <Grid item md={12} sm={12} xs={12}>
                      <Typography>Columns</Typography>
                      <Select fullWidth size="small"
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
                        onChange={(e) => setSelectedColumn(e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>Select Column</MenuItem>
                        {filteredSelectedColumn.map((col) => (
                          <MenuItem key={col.field} value={col.field}>
                            {col.headerName}
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid item md={12} sm={12} xs={12}>
                      <Typography>Operator</Typography>
                      <Select fullWidth size="small"
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
                      <TextField fullWidth size="small"
                        value={["Blank", "Not Blank"].includes(selectedCondition) ? "" : filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        disabled={["Blank", "Not Blank"].includes(selectedCondition)}
                        placeholder={["Blank", "Not Blank"].includes(selectedCondition) ? "Disabled" : "Enter value"}
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
                          <RadioGroup
                            row
                            value={logicOperator}
                            onChange={(e) => setLogicOperator(e.target.value)}
                          >
                            <FormControlLabel value="AND" control={<Radio />} label="AND" />
                            <FormControlLabel value="OR" control={<Radio />} label="OR" />
                          </RadioGroup>
                        </Grid>
                      </>
                    )}
                    {additionalFilters.length === 0 && (
                      <Grid item md={4} sm={12} xs={12} >
                        <Button variant="contained" onClick={handleAddFilter} sx={{ textTransform: "capitalize" }} disabled={["Blank", "Not Blank"].includes(selectedCondition) ? false : !filterValue || selectedColumn.length === 0}>
                          Add Filter
                        </Button>
                      </Grid>
                    )}

                    <Grid item md={2} sm={12} xs={12}>
                      <Button variant="contained" onClick={() => {
                        fetchStock();
                        setIsSearchActive(true);
                        setAdvancedFilter([
                          ...additionalFilters,
                          { column: selectedColumn, condition: selectedCondition, value: filterValue }
                        ])
                      }} sx={{ textTransform: "capitalize" }} disabled={["Blank", "Not Blank"].includes(selectedCondition) ? false : !filterValue || selectedColumn.length === 0}>
                        Search
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </DialogContent>
          </Box>
        </Popover>

        <br />

        {/* Delete Modal */}
        <Box>
          {/* ALERT DIALOG */}
          <Dialog
            open={isDeleteOpen}
            onClose={handleCloseMod}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogContent
              sx={{ width: "350px", textAlign: "center", alignItems: "center" }}
            >
              <ErrorOutlineOutlinedIcon
                sx={{ fontSize: "80px", color: "orange" }}
              />
              <Typography variant="h5" sx={{ color: "red", textAlign: "center" }}>
                Are you sure?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseMod}
                style={{
                  backgroundColor: "#f4f4f4",
                  color: "#444",
                  boxShadow: "none",
                  borderRadius: "3px",
                  border: "1px solid #0000006b",
                  "&:hover": {
                    "& .css-bluauu-MuiButtonBase-root-MuiButton-root": {
                      backgroundColor: "#f4f4f4",
                    },
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                autoFocus
                variant="contained"
                color="error"
                onClick={(e) => delProject(projectid)}
              >
                {" "}
                OK{" "}
              </Button>
            </DialogActions>
          </Dialog>

          {/* this is info view details */}
          <Dialog
            open={openInfo}
            onClose={handleCloseinfo}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <Box sx={{ width: "550px", padding: "20px 50px" }}>
              <>
                <Typography sx={userStyle.HeaderText}>Stock Info</Typography>
                <br />
                <br />
                <Grid container spacing={2}>
                  <Grid item md={12} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography variant="h6">addedby</Typography>
                      <br />
                      <Table>
                        <TableHead>
                          <StyledTableCell
                            sx={{ padding: "5px 10px !important" }}
                          >
                            {"SNO"}.
                          </StyledTableCell>
                          <StyledTableCell
                            sx={{ padding: "5px 10px !important" }}
                          >
                            {" "}
                            {"UserName"}
                          </StyledTableCell>
                          <StyledTableCell
                            sx={{ padding: "5px 10px !important" }}
                          >
                            {" "}
                            {"Date"}
                          </StyledTableCell>
                        </TableHead>
                        <TableBody>
                          {addedby?.map((item, i) => (
                            <StyledTableRow>
                              <StyledTableCell
                                sx={{ padding: "5px 10px !important" }}
                              >
                                {i + 1}.
                              </StyledTableCell>
                              <StyledTableCell
                                sx={{ padding: "5px 10px !important" }}
                              >
                                {" "}
                                {item.name}
                              </StyledTableCell>
                              <StyledTableCell
                                sx={{ padding: "5px 10px !important" }}
                              >
                                {" "}
                                {moment(item.date).format(
                                  "DD-MM-YYYY hh:mm:ss a"
                                )}
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </FormControl>
                  </Grid>
                  <Grid item md={12} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography variant="h6">Updated by</Typography>
                      <br />
                      <Table>
                        <TableHead>
                          <StyledTableCell
                            sx={{ padding: "5px 10px !important" }}
                          >
                            {"SNO"}.
                          </StyledTableCell>
                          <StyledTableCell
                            sx={{ padding: "5px 10px !important" }}
                          >
                            {" "}
                            {"UserName"}
                          </StyledTableCell>
                          <StyledTableCell
                            sx={{ padding: "5px 10px !important" }}
                          >
                            {" "}
                            {"Date"}
                          </StyledTableCell>
                        </TableHead>
                        <TableBody>
                          {updateby?.map((item, i) => (
                            <StyledTableRow>
                              <StyledTableCell
                                sx={{ padding: "5px 10px !important" }}
                              >
                                {i + 1}.
                              </StyledTableCell>
                              <StyledTableCell
                                sx={{ padding: "5px 10px !important" }}
                              >
                                {" "}
                                {item.name}
                              </StyledTableCell>
                              <StyledTableCell
                                sx={{ padding: "5px 10px !important" }}
                              >
                                {" "}
                                {moment(item.date).format(
                                  "DD-MM-YYYY hh:mm:ss a"
                                )}
                              </StyledTableCell>
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
                  <Button variant="contained" onClick={handleCloseinfo}>
                    {" "}
                    Back{" "}
                  </Button>
                </Grid>
              </>
            </Box>
          </Dialog>

          {/* print layout */}

          <TableContainer component={Paper} sx={userStyle.printcls}>
            <Table
              sx={{ minWidth: 700 }}
              aria-label="customized table"
              id="usertable"
              ref={componentRef}
            >
              <TableHead>
                <TableRow>
                  <TableCell> SI.No</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Floor</TableCell>
                  <TableCell>Area</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Request Mode For</TableCell>
                  <TableCell>Product Details</TableCell>

                  <TableCell>Quantity</TableCell>
                  <TableCell>Quantity & UOM</TableCell>
                </TableRow>
              </TableHead>
              <TableBody align="left">
                {rowDataTable &&
                  rowDataTable.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row.company}</TableCell>
                      <TableCell>{row.branch}</TableCell>
                      <TableCell>{row.unit}</TableCell>
                      <TableCell>{row.floor}</TableCell>
                      <TableCell>{row.area}</TableCell>
                      <TableCell>{row.location}</TableCell>
                      <TableCell>{row.requestmode}</TableCell>
                      {/* <TableCell>{row.productname}</TableCell> */}
                      <TableCell>{row.productdetailsnew}</TableCell>

                      <TableCell>{row.quantitynew}</TableCell>
                      <TableCell>{row.uomnew}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* 
                <TableContainer component={Paper} style={{
                    display: canvasState === false ? 'none' : 'block',
                }} >
                    <Table
                        sx={{ minWidth: 700 }}
                        aria-label="customized table"
                        id="excelcanvastable"
                        ref={gridRef}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell> SI.No</TableCell>
                                <TableCell>Project Name</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody align="left">
                            {filteredData &&
                                filteredData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{row.name}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer> */}
        </Box>

        {/* stock model */}
        <Dialog
          open={openstock}
          onClose={handleClickOpenstock}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="lg"
          fullWidth={true}
          sx={{ marginTop: "95px" }}
        >
          <Box sx={{ padding: "20px 50px" }}>
            <>
              <Box>
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <Typography sx={userStyle.importheadtext}>
                        Manage Purchase Details
                      </Typography>
                    </Grid>
                  </Grid>
                  <br />
                  <Grid container spacing={2}>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Company<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                          // options={companysEdit}
                          options={accessbranch?.map(data => ({
                            label: data.company,
                            value: data.company,
                          })).filter((item, index, self) => {
                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                          })}
                          styles={colourStyles}
                          value={{
                            label: stockmaster.company,
                            value: stockmaster.company,
                          }}
                          onChange={(e) => {
                            setStockmaster({
                              ...stockmaster,
                              company: e.value,
                              branch: "Please Select Branch",
                              unit: "Please Select Unit",
                              floor: "Please Select Floor",
                              area: "Please Select Area",
                              location: "Please Select Location",
                            });
                            setBranches([]);
                            setFilteredUnit([]);
                            setSelectedBranch("Please Select Branch");
                            setSelectedUnit("Please Select Unit");
                            setAreasEdit([]);
                            setFloorEdit([]);
                            setLocationsEdit([{ label: "ALL", value: "ALL" }]);
                            fetchBranchDropdownsEdit(e.value);
                            fetchbranches(e.value);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} sm={12} xs={12}>
                      <Typography>
                        Branch <b style={{ color: "red" }}>*</b>
                      </Typography>
                      <FormControl size="small" fullWidth>
                        <Selects
                          // options={branches}
                          options={accessbranch?.filter(
                            (comp) =>
                              stockmaster.company === comp.company
                          )?.map(data => ({
                            label: data.branch,
                            value: data.branch,
                          })).filter((item, index, self) => {
                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                          })}
                          styles={colourStyles}
                          value={{ label: selectedBranch, value: selectedBranch }}
                          onChange={(e) => {
                            setStockmaster({
                              ...stockmaster,
                              branch: "Please Select Branch",
                              unit: "Please Select Unit",
                              floor: "Please Select Floor",
                              area: "Please Select Area",
                              location: "Please Select Location",
                            });
                            fetchFloorEdit(e.value);
                            handleBranchChange(e);
                            setSelectedUnit("Please Select Unit");
                            setLocationsEdit([{ label: "ALL", value: "ALL" }]);
                            setAreasEdit([]);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <Typography>
                        Unit <b style={{ color: "red" }}>*</b>
                      </Typography>
                      <FormControl size="small" fullWidth>
                        <Selects
                          // options={filteredUnit}
                          options={accessbranch?.filter(
                            (comp) =>
                              stockmaster.company === comp.company && selectedBranch === comp.branch
                          )?.map(data => ({
                            label: data.unit,
                            value: data.unit,
                          })).filter((item, index, self) => {
                            return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                          })}
                          styles={colourStyles}
                          placeholder={"please select"}
                          value={{ label: selectedUnit, value: selectedUnit }}
                          onChange={(e) => setSelectedUnit(e.value)}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Floor<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                          options={floorsEdit}
                          styles={colourStyles}
                          value={{
                            label: stockmaster.floor,
                            value: stockmaster.floor,
                          }}
                          onChange={(e) => {
                            setStockmaster({
                              ...stockmaster,
                              floor: e.value,
                              workstation: "",
                              area: "Please Select Area",
                              location: "Please Select Location",
                            });
                            setAreasEdit([]);
                            setLocationsEdit([{ label: "ALL", value: "ALL" }]);
                            fetchAreaEdit(selectedBranch, e.value);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Area<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                          options={areasEdit}
                          styles={colourStyles}
                          value={{
                            label: stockmaster.area,
                            value: stockmaster.area,
                          }}
                          onChange={(e) => {
                            setStockmaster({
                              ...stockmaster,
                              area: e.value,
                              workstation: "",
                              location: "Please Select Location",
                            });
                            setLocationsEdit([{ label: "ALL", value: "ALL" }]);
                            fetchAllLocationEdit(
                              selectedBranch,
                              stockmaster.floor,
                              e.value
                            );
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Location<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                          options={locationsEdit}
                          styles={colourStyles}
                          value={{
                            label: stockmaster.location,
                            value: stockmaster.location,
                          }}
                          onChange={(e) => {
                            setStockmaster({
                              ...stockmaster,
                              location: e.value,
                              workstation: "",
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Date<b style={{ color: "red" }}>*</b> </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="date"
                          value={stockmaster.requestdate}
                          onChange={(e) => {
                            setStockmaster({ ...stockmaster, requestdate: e.target.value });
                          }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Time<b style={{ color: "red" }}>*</b> </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="time"
                          value={stockmaster.requesttime}
                          onChange={(e) => {
                            setStockmaster({ ...stockmaster, requesttime: e.target.value });
                          }}
                        />
                      </FormControl>
                    </Grid>


                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Warranty<b style={{ color: "red" }}>*</b></Typography>
                        <Select
                          fullWidth
                          labelId="demo-select-small"
                          id="demo-select-small"
                          value={stockmaster.warranty}
                          onChange={(e) => {
                            setStockmaster({
                              ...stockmaster,
                              warranty: e.target.value,
                            });
                          }}
                        >
                          <MenuItem value="" disabled>
                            {" "}
                            Please Select
                          </MenuItem>
                          <MenuItem value="Yes"> {"Yes"} </MenuItem>
                          <MenuItem value="No"> {"No"} </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {stockmaster.warranty === "Yes" && (
                      <>
                        <Grid item md={3} xs={12} sm={12}>
                          <Grid container>
                            <Grid item md={6} xs={6} sm={6}>
                              <Typography>Warranty Time<b style={{ color: "red" }}>*</b></Typography>
                              <FormControl fullWidth size="small">
                                <OutlinedInput
                                  id="component-outlined"
                                  type="text"
                                  size="small"
                                  placeholder="Enter Time"
                                  value={stockmaster.estimation}
                                  onChange={(e) => handleChangephonenumber(e)}
                                />
                              </FormControl>
                            </Grid>
                            <Grid item md={6} xs={6} sm={6}>
                              <Typography>Estimation<b style={{ color: "red" }}>*</b></Typography>
                              <Select
                                fullWidth
                                labelId="demo-select-small"
                                id="demo-select-small"
                                size="small"
                                value={stockmaster.estimationtime}
                                // onChange={(e) => {
                                //   setStockmaster({ ...stockmaster, estimationtime: e.target.value });
                                // }}
                                onChange={handleEstimationChange}
                              >
                                <MenuItem value="" disabled>
                                  {" "}
                                  Please Select
                                </MenuItem>
                                <MenuItem value="Days"> {"Days"} </MenuItem>
                                <MenuItem value="Month"> {"Month"} </MenuItem>
                                <MenuItem value="Year"> {"Year"} </MenuItem>
                              </Select>
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    )}
                    <Grid item md={4} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Request Mode For</Typography>
                        <OutlinedInput
                          value={stockmaster.requestmode}
                          readOnly={true}
                        />
                      </FormControl>
                    </Grid>
                    {stockmaster.requestmode === "Asset Material" ? (
                      <>
                        <Grid item md={4} xs={12} sm={12}>
                          <Typography>Asset Type </Typography>
                          <FormControl size="small" fullWidth>
                            <OutlinedInput
                              readOnly={true}
                              value={selectedAssetType}
                            />


                          </FormControl>
                        </Grid>
                        <Grid item md={4} xs={12} sm={12}>
                          <Typography>Product Head </Typography>
                          <FormControl size="small" fullWidth>
                            <OutlinedInput
                              readOnly={true}
                              value={selectedProducthead}
                            />


                          </FormControl>
                        </Grid>

                        <Grid item md={4} xs={12} sm={12}>
                          <FormControl size="small" fullWidth>
                            <Typography>Product Name </Typography>

                            <OutlinedInput
                              readOnly={true}
                              value={selectedProductname}
                            />

                          </FormControl>
                        </Grid>


                        <Grid item md={4} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Product Details</Typography>
                            <OutlinedInput
                              readOnly={true}
                              value={stockmaster.productdetails}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={3} xs={12} sm={12}>
                          <FormControl size="small" fullWidth>
                            <Typography>UOM </Typography>

                            <OutlinedInput
                              readOnly={true}
                              value={stockmaster.uom}
                            />
                          </FormControl>
                        </Grid>

                        <Grid item md={3} sm={12} xs={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Qty</Typography>
                            <OutlinedInput
                              readOnly={true}
                              value={stockmaster.quantity}
                            />
                          </FormControl>
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid item md={4} xs={12} sm={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Stock Category</Typography>
                            <OutlinedInput
                              readOnly={true}
                              value={stockmaster.stockcategory}
                            />
                            {/* <Selects
                                                    options={categoryOption}
                                                    styles={colourStyles}
                                                    value={{
                                                        label: stockmaster.stockcategory,
                                                        value: stockmaster.stockcategory,
                                                    }}
                                                    onChange={(e) => {

                                                        setStockmaster({
                                                            ...stockmaster,
                                                            stockcategory: e.value,
                                                            stocksubcategory: "Please Select Stock Sub Category", materialnew: "Please Select Material",uomnew:""

                                                        });
                                                        fetchSubcategoryBased(e);
                                                        setMaterialoptNew([]);
                                                    }}
                                                /> */}
                          </FormControl>
                        </Grid>
                        <Grid item md={4} xs={12} sm={12}>
                          <FormControl fullWidth size="small">
                            <Typography>Stock Sub-category</Typography>
                            <OutlinedInput
                              readOnly={true}
                              value={stockmaster.stocksubcategory}
                            />
                            {/* <Selects
                                                    options={subcategoryOpt}
                                                    styles={colourStyles}
                                                    value={{
                                                        label: stockmaster.stocksubcategory,
                                                        value: stockmaster.stocksubcategory,
                                                    }}
                                                    onChange={(e) => {

                                                        setStockmaster({
                                                            ...stockmaster,
                                                            stocksubcategory: e.value, materialnew: "Please Select Material",uomnew:""

                                                        });
                                                        fetchMaterialNew(e, stockmaster.stockcategory);
                                                    }}
                                                /> */}
                          </FormControl>
                        </Grid>

                        {stockArray.length > 0 && (
                          <>
                            <Grid item md={3} xs={12} sm={12}>
                              {" "}
                              <Typography variant="h6">
                                Stock Todo List
                              </Typography>
                            </Grid>

                            <Grid item md={3} xs={12} sm={12}></Grid>
                            <Grid item md={3} xs={12} sm={12}></Grid>
                            <Grid item md={3} xs={12} sm={12}></Grid>
                          </>
                        )}
                        {stockArray.length > 0 &&
                          stockArray.map((item, index) => {
                            return (
                              <>
                                <Grid item md={3} xs={3} sm={3}>
                                  <FormControl fullWidth size="small">
                                    <Typography>Material</Typography>
                                    <OutlinedInput
                                      readOnly={true}
                                      value={item.materialnew}
                                    />
                                  </FormControl>
                                </Grid>
                                <Grid item md={3} xs={3} sm={3}>
                                  <FormControl fullWidth size="small">
                                    <Typography>UOM </Typography>
                                    <OutlinedInput
                                      readOnly={true}
                                      value={item.uomnew}
                                    />
                                  </FormControl>
                                </Grid>
                                <Grid item md={3} sm={3} xs={3}>
                                  <FormControl fullWidth size="small">
                                    <Typography>Qty </Typography>
                                    <OutlinedInput
                                      readOnly={true}
                                      value={item.quantitynew}
                                    />
                                  </FormControl>
                                </Grid>
                                <Grid
                                  item
                                  md={3}
                                  sm={3}
                                  xs={3}
                                  sx={{ display: "flex" }}
                                >
                                  <FormControl fullWidth size="small">
                                    <Typography>Product Details</Typography>

                                    <TextareaAutosize
                                      aria-label="minimum height"
                                      minRows={2}
                                      readOnly={true}
                                      value={item.productdetailsnew}
                                    // placeholder="Please Enter Product Details"
                                    />
                                  </FormControl>
                                  &nbsp; &emsp;
                                  {/* <Button
                                                        variant="contained"
                                                        color="error"
                                                        type="button"
                                                        onClick={(e) => deleteTodo(index)}
                                                        sx={{
                                                            height: "30px",
                                                            minWidth: "30px",
                                                            marginTop: "28px",
                                                            padding: "6px 10px",
                                                        }}
                                                    >
                                                        <AiOutlineClose />
                                                    </Button> */}
                                </Grid>
                              </>
                            );
                          })}
                      </>
                    )}
                    <Grid item md={2.5} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          {" "}
                          Vendor Group Name<b style={{ color: "red" }}>*</b>{" "}
                        </Typography>
                        <Selects
                          options={vendorGroupOpt}
                          styles={colourStyles}
                          value={{ label: vendorGroup, value: vendorGroup }}
                          onChange={(e) => {
                            handleChangeGroupName(e);
                            setVendorGroup(e.value);
                            // setVendorNew("Choose Vendor");
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={2.5} xs={12} sm={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>
                          Vendor Name <b style={{ color: "red" }}>*</b>{" "}
                        </Typography>
                        <Selects
                          options={vendormaster}
                          styles={colourStyles}
                          value={{
                            label: stockmaster.vendorname,
                            value: stockmaster.vendorname,
                          }}
                          onChange={(e) => {
                            setStockmaster({
                              ...stockmaster,
                              vendorname: e.value,
                            });
                            vendorid(e._id);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={0.5} sm={1} xs={1}>
                      <Button
                        variant="contained"
                        style={{
                          height: "30px",
                          minWidth: "20px",
                          padding: "19px 13px",
                          color: "white",
                          marginTop: "20px",
                          background: "rgb(25, 118, 210)",
                        }}
                        onClick={() => {
                          handleClickOpenviewalertvendor();
                        }}
                      >
                        <FaPlus style={{ fontSize: "15px" }} />
                      </Button>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>GST No </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={vendorgetid?.gstnumber}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Bill No <b style={{ color: "red" }}>*</b>{" "}
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="number"
                          sx={userStyle.input}
                          placeholder="Please Enter Billno"
                          value={stockmaster.billno}
                          onChange={(e) => {
                            setStockmaster({
                              ...stockmaster,
                              billno: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    {stockmaster.warranty === "Yes" && (
                      <Grid item md={3} xs={12} sm={12}>
                        <FormControl fullWidth size="small">
                          <Typography>
                            Warranty Details <b style={{ color: "red" }}>*</b>{" "}
                          </Typography>
                          <OutlinedInput
                            id="component-outlined"
                            type="text"
                            value={stockmaster.warrantydetails}
                            sx={userStyle.input}
                            placeholder="Please Enter Warranty Details"
                            onChange={(e) => {
                              setStockmaster({
                                ...stockmaster,
                                warrantydetails: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </Grid>
                    )}
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Rate<b style={{ color: "red" }}>*</b>{" "}
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="number"
                          sx={userStyle.input}
                          placeholder="Please Enter Rate"
                          value={stockmaster.rate}
                          onChange={(e) => {
                            setStockmaster({
                              ...stockmaster,
                              rate: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Bill Date <b style={{ color: "red" }}>*</b>{" "}
                        </Typography>
                        <TextField
                          size="small"
                          type="date"
                          value={stockmaster.billdate}
                          onChange={(e) => {
                            setStockmaster({
                              ...stockmaster,
                              billdate: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                      <Typography>
                        Bill <b style={{ color: "red" }}>*</b>{" "}
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "left" }}>
                        <Button
                          variant="contained"
                          onClick={() => handleClickUploadPopupOpenedit()}
                        >
                          Upload
                        </Button>
                      </Box>
                    </Grid>
                    {stockmaster.warranty === "Yes" && (
                      <Grid item md={3} xs={12} sm={12}>
                        <Typography>Warranty Card </Typography>
                        <Box sx={{ display: "flex", justifyContent: "left" }}>
                          <Button
                            variant="contained"
                            onClick={() => handleClickUploadPopupOpenwarrantyedit()}
                          >
                            Upload
                          </Button>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                  <br />
                  <br />

                  <Grid container>
                    <Grid item md={3} xs={12} sm={6}>
                      {btnSubmit ? (
                        <Box sx={{ display: "flex" }}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <>
                          <Button
                            variant="contained"
                            sx={buttonStyles.buttonsubmit}
                            onClick={handleSubmit}
                          >
                            Create
                          </Button>
                        </>
                      )}
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <Button sx={buttonStyles.btncancel} onClick={handleclear}>
                        Clear
                      </Button>
                    </Grid>
                    <Grid item md={3} xs={12} sm={6}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleClosestock}
                      >
                        {" "}
                        Back{" "}
                      </Button>
                    </Grid>
                  </Grid>
                </>
              </Box>
              <br />
            </>
          </Box>
        </Dialog>

        {/* ALERT DIALOG */}
        <Dialog
          open={isCheckOpen}
          onClose={handleCloseCheck}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent
            sx={{ width: "350px", textAlign: "center", alignItems: "center" }}
          >
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "80px", color: "orange" }}
            />
            <Typography variant="h6" sx={{ color: "black", textAlign: "center" }}>
              {checkvendor?.length > 0 &&
                checkcategory?.length > 0 &&
                checksubcategory?.length > 0 &&
                checktimepoints?.length > 0 ? (
                <>
                  <span style={{ fontWeight: "700", color: "#777" }}>
                    {`${deleteproject.name} `}
                  </span>
                  was linked in{" "}
                  <span style={{ fontWeight: "700" }}>
                    Vendor, Category, Subcategory & Time and points{" "}
                  </span>
                </>
              ) : checkvendor?.length > 0 ||
                checkcategory?.length > 0 ||
                checksubcategory?.length > 0 ||
                checktimepoints?.length > 0 ? (
                <>
                  <span style={{ fontWeight: "700", color: "#777" }}>
                    {`${deleteproject.name} `}
                  </span>
                  was linked in{" "}
                  <span style={{ fontWeight: "700" }}>
                    {checkvendor?.length ? " Vendor" : ""}
                    {checkcategory?.length ? " Category" : ""}
                    {checksubcategory?.length ? " Subcategory" : ""}
                    {checktimepoints?.length ? " Time and points" : ""}
                  </span>
                </>
              ) : (
                ""
              )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
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

        {/* dialog box for vendor details */}

        <Dialog
          open={openviewalertvendor}
          onClose={handleClickOpenviewalertvendor}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="lg"
          sx={{
            overflow: "visible",
            "& .MuiPaper-root": {
              overflow: "visible",
            },
          }}
          fullWidth={true}
        >
          <Box sx={userStyle.dialogbox}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={{ fontWeight: "bold" }}>Add Vendor</Typography>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    {cateCode &&
                      cateCode.map(() => {
                        let strings = "VEN";
                        let refNo = cateCode[cateCode?.length - 1]?.vendorid;
                        let digits = (cateCode?.length + 1).toString();
                        const stringLength = refNo?.length;
                        let lastChar = refNo?.charAt(stringLength - 1);
                        let getlastBeforeChar = refNo?.charAt(stringLength - 2);
                        let getlastThreeChar = refNo?.charAt(stringLength - 3);
                        let lastBeforeChar = refNo?.slice(-2);
                        let lastThreeChar = refNo?.slice(-3);
                        let lastDigit = refNo?.slice(-4);
                        let refNOINC = parseInt(lastChar) + 1;
                        let refLstTwo = parseInt(lastBeforeChar) + 1;
                        let refLstThree = parseInt(lastThreeChar) + 1;
                        let refLstDigit = parseInt(lastDigit) + 1;
                        if (
                          digits.length < 4 &&
                          getlastBeforeChar == 0 &&
                          getlastThreeChar == 0
                        ) {
                          refNOINC = ("000" + refNOINC)?.substr(-4);
                          newval = strings + refNOINC;
                        } else if (
                          digits.length < 4 &&
                          getlastBeforeChar > 0 &&
                          getlastThreeChar == 0
                        ) {
                          refNOINC = ("00" + refLstTwo)?.substr(-4);
                          newval = strings + refNOINC;
                        } else if (digits.length < 4 && getlastThreeChar > 0) {
                          refNOINC = ("0" + refLstThree)?.substr(-4);
                          newval = strings + refNOINC;
                        }
                      })}
                    <Typography>
                      Vendor ID <b style={{ color: "red" }}>*</b>{" "}
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      placeholder="Please Enter Vendor Id"
                      value={newval}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Vendor Name <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={vendor.vendorname}
                      placeholder="Please Enter Vendor Name"
                      onChange={(e) => {
                        setVendor({ ...vendor, vendorname: e.target.value });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Email ID</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="email"
                      value={vendor.emailid}
                      placeholder="Please Enter Email ID"
                      onChange={(e) => {
                        setVendor({ ...vendor, emailid: e.target.value });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Phone Number</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      value={vendor.phonenumber}
                      placeholder="Please Enter Phone Number"
                      onChange={(e) => {
                        setVendor({ ...vendor, phonenumber: e.target.value });
                        handleMobile(e.target.value);
                      }}
                    />
                  </FormControl>
                  <Grid>
                    <FormGroup>
                      <FormControlLabel
                        control={<Checkbox checked={vendor.phonecheck} />}
                        onChange={(e) =>
                          setVendor({ ...vendor, phonecheck: !vendor.phonecheck })
                        }
                        label="Same as Whats app number"
                      />
                    </FormGroup>
                  </Grid>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>WhatsApp Number</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      value={vendor.whatsappnumber}
                      placeholder="Please Enter Whatsapp Number"
                      onChange={(e) => {
                        setVendor({ ...vendor, whatsappnumber: e.target.value });
                        handlewhatsapp(e.target.value);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Contact Person Name</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={vendor.contactperson}
                      placeholder="Please Enter Contact Person Name"
                      onChange={(e) => {
                        setVendor({ ...vendor, contactperson: e.target.value });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item lg={3} md={4} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Address <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <TextareaAutosize
                      aria-label="minimum height"
                      minRows={5}
                      placeholder="Please Enter Address"
                      value={vendor.address}
                      onChange={(e) => {
                        setVendor({ ...vendor, address: e.target.value });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>GST Number</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={vendor.gstnumber}
                      placeholder="Please Enter GST Number"
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue.length <= maxLength) {
                          setVendor({ ...vendor, gstnumber: newValue });
                        }
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <br /> <br />
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Bank Details
                  </Typography>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Bank Name</Typography>
                    <Selects
                      maxMenuHeight={250}
                      options={accounttypes}
                      placeholder="Please Choose Bank Name"
                      value={{ label: vendor.bankname, value: vendor.bankname }}
                      onChange={(e) => {
                        setVendor({ ...vendor, bankname: e.value });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Account Name</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={vendor.accountname}
                      placeholder="Please Enter Account Name"
                      onChange={(e) => {
                        setVendor({ ...vendor, accountname: e.target.value });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Account Number</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      value={vendor.accountnumber}
                      placeholder="Please Enter Account Number"
                      onChange={(e) => {
                        setVendor({ ...vendor, accountnumber: e.target.value });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>IFSC Code</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={vendor.ifsccode}
                      placeholder="Please Enter IFSC Code"
                      onChange={(e) => {
                        setVendor({ ...vendor, ifsccode: e.target.value });
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <br /> <br />
              <Grid
                container
                spacing={2}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Grid item lg={2.5} md={2.5} sm={2} xs={12}>
                  {/* <Button
                  variant="contained"
                  color="primary"
                  sx={userStyle.buttonadd}
                  onClick={handleSubmitvendor}
                >
                  Submit
                </Button> */}
                  <LoadingButton
                    loading={isBtn}
                    variant="contained"
                    sx={buttonStyles.buttonsubmit}
                    onClick={handleSubmitvendor}>
                    Submit
                  </LoadingButton>
                </Grid>
                <Grid item lg={2.5} md={2.5} sm={2} xs={12}>
                  <Button sx={buttonStyles.btncancel} onClick={handleClearvendor}>
                    Clear
                  </Button>
                </Grid>
                <Grid item lg={2.5} md={2.5} sm={2} xs={12}>
                  <Button
                    sx={userStyle.btncancel}
                    onClick={handleCloseviewalertvendor}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>

        {/* dialog box for uom details */}
        <Dialog
          open={openviewalertUom}
          onClose={handleClickOpenviewalertUom}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="md"
          sx={{
            overflow: "visible",
            "& .MuiPaper-root": {
              overflow: "visible",
            },
          }}
          fullWidth={true}
        >
          <Box sx={userStyle.dialogbox}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>
                    Manage UOM
                  </Typography>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Name<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Please Enter Name"
                      value={vomMaster.name}
                      onChange={(e) => {
                        setVomMaster({ ...vomMaster, name: e.target.value });
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <br />
              <br />

              <Grid container>
                <Grid item md={3} xs={12} sm={6}>
                  {isUserRoleCompare?.includes("bdstockpurchaserequest") && (
                    <Button
                      variant="contained"
                      sx={buttonStyles.buttonsubmit}
                      onClick={handleSubmituom}
                    >
                      Submit
                    </Button>
                  )}
                </Grid>
                <Grid item md={3} xs={12} sm={6}>
                  <Button sx={buttonStyles.btncancel} onClick={handleclearuom}>
                    Clear
                  </Button>
                </Grid>
                <Grid item md={3} xs={12} sm={6}>
                  <Button
                    sx={buttonStyles.btncancel}
                    onClick={handleCloseviewalertUom}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>

        <Dialog
          open={openviewalertAsset}
          onClose={handleClickOpenviewalertAsset}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="md"
          sx={{
            overflow: "visible",
            "& .MuiPaper-root": {
              overflow: "visible",
            },
          }}
          fullWidth={true}
        >
          <Box sx={userStyle.dialogbox}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>
                    Manage Asset Material
                  </Typography>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      Asset Head <b style={{ color: "red" }}>*</b>{" "}
                    </Typography>
                    <Selects
                      options={account}
                      styles={colourStyles}
                      value={{
                        label: selectedassethead,
                        value: selectedassethead,
                      }}
                      onChange={(e) => {
                        handleAssetChange(e);
                      }}
                    />
                  </FormControl>
                </Grid>

                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Material Code <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={asset.materialcode}
                      placeholder="Please Enter Material Code"
                      onChange={(e) => {
                        setAsset({ ...asset, materialcode: e.target.value });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3.5} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Material Name <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={asset.name}
                      placeholder="Please Enter Material Code"
                      onChange={(e) => {
                        setAsset({ ...asset, name: e.target.value });
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <br /> <br />
              <Grid container spacing={2}>
                <Grid item md={2.5} xs={12} sm={6}>
                  {isUserRoleCompare?.includes("bdstockpurchaserequest") && (
                    <Button
                      variant="contained"
                      sx={buttonStyles.buttonsubmit}
                      onClick={handleSubmitasset}
                    >
                      Submit
                    </Button>
                  )}
                </Grid>
                <Grid item md={2.5} xs={12} sm={6}>
                  {isUserRoleCompare?.includes("bdstockpurchaserequest") && (
                    <Button sx={buttonStyles.btncancel} onClick={handleClearasset}>
                      Clear
                    </Button>
                  )}
                </Grid>
                <Grid item md={2.5} xs={12} sm={6}>
                  <Button
                    sx={buttonStyles.btncancel}
                    onClick={handleCloseviewalertAsset}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>

        {/* UPLOAD BILL CREATE IMAGE DIALOG */}
        {/* <Dialog
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
          Upload Image
        </DialogTitle>
        <DialogContent sx={{ minWidth: "750px", height: "850px" }}>
          <Grid container spacing={2}>
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
                      accept="image/*"
                      hidden
                      onChange={handleInputChange}
                    />
                  </Button>
                  &ensp;
                </Grid>
              </FormControl>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              {refImage.map((file, index) => (
                <Grid container key={index}>
                  <Grid item md={2} sm={2} xs={2}>
                    <Box
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {file.type.includes("image/") ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          height={50}
                          style={{
                            maxWidth: "-webkit-fill-available",
                          }}
                        />
                      ) : (
                        <img
                          className={classes.preview}
                          src={getFileIcon(file.name)}
                          height="10"
                          alt="file icon"
                        />
                      )}
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
                    <Typography variant="subtitle2"> {file.name} </Typography>
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
                        onClick={() => renderFilePreview(file)}
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
      </Dialog> */}



        {/* UPLOAD BILL IMAGE DIALOG EDIT*/}
        <Dialog
          open={uploadPopupOpenedit}
          onClose={handleUploadPopupCloseedit}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="md"
          sx={{ marginTop: "95px" }}
        >
          <DialogTitle
            id="customized-dialog-title1"
            sx={{ backgroundColor: "#e0e0e0", color: "#000", display: "flex" }}
          >
            Upload Image Bill
          </DialogTitle>
          <DialogContent sx={{ minWidth: "750px", height: "850px" }}>
            <Grid container spacing={2}>
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
                        id="productimagbille"
                        accept="image/*"
                        hidden
                        onChange={handleInputChangeedit}
                      />
                    </Button>
                    &ensp;
                  </Grid>
                </FormControl>
              </Grid>
              <Grid item lg={12} md={12} sm={12} xs={12}>
                {refImageedit && refImageedit.length > 0 && refImageedit.map((file, index) => (

                  <Grid container key={index}>
                    <Grid item md={2} sm={2} xs={2}>
                      <Box
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {file.type.includes("image/") ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            height={50}
                            style={{
                              maxWidth: "-webkit-fill-available",
                            }}
                          />
                        ) : (
                          <img
                            // className={classes.preview}
                            src={getFileIconedit(file.name)}
                            height="10"
                            alt="file icon"
                          />
                        )}
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
                      <Typography variant="subtitle2"> {file.name} </Typography>
                    </Grid>
                    <Grid item md={2} sm={1} xs={1}>
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
                          onClick={(e) => renderFilePreviewedit(file)}
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
                          onClick={() => handleDeleteFileedit(index)}
                        >
                          <FaTrash
                            style={{ color: "#a73131", fontSize: "12px" }}
                          />
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                ))

                }


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

        {/* UPLOAD WARRANTY IMAGE DIALOG    CREATE*/}
        {/* <Dialog
        open={uploadPopupOpenwarranty}
        onClose={handleUploadPopupClosewarranty}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        sx={{ marginTop: "95px" }}
      >
        <DialogTitle
          id="customized-dialog-title1"
          sx={{ backgroundColor: "#e0e0e0", color: "#000", display: "flex" }}
        >
          Upload Image
        </DialogTitle>
        <DialogContent sx={{ minWidth: "750px", height: "850px" }}>
          <Grid container spacing={2}>
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
                      accept="image/*"
                      hidden
                      onChange={handleInputChangewarranty}
                    />
                  </Button>
                  &ensp;
                </Grid>
              </FormControl>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              {refImagewarranty.map((file, index) => (
                <Grid container key={index}>
                  <Grid item md={2} sm={2} xs={2}>
                    <Box
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {file.type.includes("image/") ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          height={50}
                          style={{
                            maxWidth: "-webkit-fill-available",
                          }}
                        />
                      ) : (
                        <img
                          className={classes.preview}
                          src={getFileIconwarranty(file.name)}
                          height="10"
                          alt="file icon"
                        />
                      )}
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
                    <Typography variant="subtitle2"> {file.name} </Typography>
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
                        onClick={() => renderFilePreviewwarranty(file)}
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
                        onClick={() => handleDeleteFilewarranty(index)}
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
          <Button onClick={handleUploadOverAllwarranty} variant="contained">
            Ok
          </Button>
          <Button onClick={resetImagewarranty} sx={userStyle.btncancel}>
            Reset
          </Button>
          <Button
            onClick={handleUploadPopupClosewarranty}
            sx={userStyle.btncancel}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog> */}

        {/* UPLOAD WARRANTY IMAGE DIALOG EDIT*/}
        <Dialog
          open={uploadPopupOpenwarrantyedit}
          onClose={handleUploadPopupClosewarrantyedit}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="md"
          sx={{ marginTop: "95px" }}
        >
          <DialogTitle
            id="customized-dialog-title1"
            sx={{ backgroundColor: "#e0e0e0", color: "#000", display: "flex" }}
          >
            Upload Image
          </DialogTitle>
          <DialogContent sx={{ minWidth: "750px", height: "850px" }}>
            <Grid container spacing={2}>
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
                        accept="image/*"
                        hidden
                        onChange={handleInputChangewarrantyedit}
                      />
                    </Button>
                    &ensp;
                  </Grid>
                </FormControl>
              </Grid>
              <Grid item lg={12} md={12} sm={12} xs={12}>
                {refImagewarrantyedit.map((file, index) => (
                  <Grid container key={index}>
                    <Grid item md={2} sm={2} xs={2}>
                      <Box
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {file.type.includes("image/") ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            height={50}
                            style={{
                              maxWidth: "-webkit-fill-available",
                            }}
                          />
                        ) : (
                          <img
                            className={classes.preview}
                            src={getFileIconwarrantyedit(file.name)}
                            height="10"
                            alt="file icon"
                          />
                        )}
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
                      <Typography variant="subtitle2"> {file.name} </Typography>
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
                          onClick={() => renderFilePreviewwarrantyedit(file)}
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
                          onClick={() => handleDeleteFilewarrantyedit(index)}
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
            <Button onClick={handleUploadOverAllwarrantyedit} variant="contained">
              Ok
            </Button>
            <Button onClick={resetImagewarrantyedit} sx={userStyle.btncancel}>
              Reset
            </Button>
            <Button
              onClick={handleUploadPopupClosewarrantyedit}
              sx={userStyle.btncancel}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

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
          filteredDataTwo={(filteredChanges !== null ? filteredRowData : rowDataTable) ?? []}
          itemsTwo={overallFilterdata ?? []}
          filename={"StockRequestToPurchase"}
          exportColumnNames={exportColumnNames}
          exportRowValues={exportRowValues}
          componentRef={componentRef}
        />
        {/* INFO */}
        <InfoPopup
          openInfo={openInfo}
          handleCloseinfo={handleCloseinfo}
          heading="Stock Request To Purchase Info"
          addedby={addedby}
          updateby={updateby}
        />
        {/*SINGLE DELETE ALERT DIALOG ARE YOU SURE? */}
        <DeleteConfirmation
          open={isDeleteOpen}
          onClose={handleCloseMod}
          onConfirm={delProject}
          title="Are you sure?"
          confirmButtonText="Yes"
          cancelButtonText="Cancel"
        />
        {/*BULK DELETE ALERT DIALOG ARE YOU SURE? */}
        <DeleteConfirmation
          open={isDeleteOpencheckbox}
          onClose={handleCloseModcheckbox}
          onConfirm={delProjectcheckbox}
          title="Are you sure?"
          confirmButtonText="Yes"
          cancelButtonText="Cancel"
        />
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
    </>
  );
}

export default Stockpurchaserequest;
