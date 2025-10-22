import { makeStyles } from "@material-ui/core";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ImageIcon from "@mui/icons-material/Image";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LastPageIcon from "@mui/icons-material/LastPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box, Radio, InputAdornment, RadioGroup, Tooltip, FormControlLabel,
  Button,
  Checkbox,
  FormGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Popover,
  Select,
  TextField,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment-timezone";
import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint, FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import Resizable from "react-resizable";
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import csvIcon from "../../components/Assets/CSV.png";
import excelIcon from "../../components/Assets/excel-icon.png";
import fileIcon from "../../components/Assets/file-icons.png";
import pdfIcon from "../../components/Assets/pdf-icon.png";
import wordIcon from "../../components/Assets/word-icon.png";
import { handleApiError } from "../../components/Errorhandling";
import Headtitle from "../../components/Headtitle";
import StyledDataGrid from "../../components/TableStyle";
import { AuthContext, UserRoleAccessContext } from "../../context/Appcontext";
import { colourStyles, userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";
import VendorPopup from "../asset/VendorPopup";
import Stocktable from "./stocktable";
// import AssetMaterialPopup from "../account/AssetMaterialPopup";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

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
import Switch from '@mui/material/Switch';
import { alpha, styled } from '@mui/material/styles';

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

function Stockmaster() {
  const [stock, setStock] = useState([]);

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

  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState("");
  const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
  const handleClickOpenPopupMalert = () => {
    setOpenPopupMalert(true);
    setBtnSubmit(false);
  };
  const handleClosePopupMalert = () => {
    setOpenPopupMalert(false);
    setBtnSubmit(false);
  };
  const [openPopup, setOpenPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [popupSeverity, setPopupSeverity] = useState("");
  const handleClickOpenPopup = () => {
    setOpenPopup(true);
    setBtnSubmit(false);
  };
  const handleClosePopup = () => {
    setOpenPopup(false);
    setBtnSubmit(false);
  };

  let exportColumnNames = [
    "Company",
    "Branch",
    "Unit",
    "Floor",
    "Area",
    "Location",
    "Request Mode For",
    "Vendor Group",
    "Vendor",
    "Gst No",
    "Bill Number",
    "Asset Type",
    "Asset Head",
    "Material",
    "Warranty",
    "Purchasedate",
    "Product Details",
    "Warranty Details",
    "Quantity",
    "Quantity & UOM",
    "Rate",
    "Bill Date",
  ];
  let exportRowValues = [
    "company",
    "branch",
    "unit",
    "floor",
    "area",
    "location",
    "requestmode",
    "vendorgroup",
    "vendor",
    "gstno",
    "billno",
    "assettype",
    "producthead",
    "productname",
    "warranty",
    "purchasedate",
    "productdetails",
    "warrantydetails",
    "quantity",
    "uom",
    "rate",
    "billdate",
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
      pagename: String("Stock Purchase"),
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


  const [assetSpecificationType, setAssetSpecificationType] = useState({
    name: "",
    code: "",
  });
  const [assetModel, setAssetModel] = useState({ name: "", code: "" });
  const [assetSize, setAssetSize] = useState({ name: "", code: "" });
  const [assetVariant, setAssetVariant] = useState({ name: "", code: "" });
  const [brandMaster, setBrandMaster] = useState({ name: "", code: "" });

  const [btnSubmit, setBtnSubmit] = useState(false);

  const [vendorOpt, setVendoropt] = useState([]);


  //new changes
  const requestModeOptions = [
    { label: "Asset Material", value: "Asset Material" },
    { label: "Stock Material", value: "Stock Material" },
  ];
  const [isStockMaterial, setIsStockMaterial] = useState(false);
  const [categoryOption, setCategoryOption] = useState([]);
  const [subcategoryOpt, setSubcategoryOption] = useState([]);
  const [materialOptNew, setMaterialoptNew] = useState([]);
  const [uomOpt, setUomOpt] = useState([]);

  const [changeTable, setChangeTable] = useState([]);

  const [stockmaster, setStockmaster] = useState({
    company: "Please Select Company",
    branch: "Please Select Branch",
    unit: "Please Select Unit",
    floor: "Please Select Floor",
    area: "Please Select Area",
    location: "Please Select Location",
    workstation: "Please Select Workstation",
    workcheck: false,
    producthead: "",
    vendorname: "Please Select Vendor",
    productname: "Please Select Material",
    component: "Please Select Component",
    gstno: "",
    billno: "",
    assettype: "",
    asset: "",
    productdetails: "",
    warrantydetails: "",
    uom: "Please Select UOM",
    quantity: "",
    rate: "",
    billdate: "",
    files: "",
    warrantyfiles: "",

    warranty: "Yes",
    warrantycalculation: "",
    estimation: "",
    estimationtime: "Days",
    purchasedate: "",

    addedby: "",
    updatedby: "",

    requestmode: "Please Select Request Mode",
    stockcategory: "Please Select Stock Category",
    stocksubcategory: "Please Select Stock Sub Category",
    uomnew: "",
    quantitynew: "",
    materialnew: "Please Select Material",
    productdetailsnew: "",
  });

  const [stockmasteredit, setStockmasteredit] = useState({
    company: "Please Select Company",
    branch: "Please Select Branch",
    unit: "Please Select Unit",
    floor: "Please Select Floor",
    area: "Please Select Area",
    location: "Please Select Location",
    workstation: "Please Select Workstation",
    producthead: "",
    vendorname: "Please Select Vendor",

    productname: "Please Select Material",

    component: "Please Select Component",
    gstno: "",
    billno: "",
    productdetails: "",
    warrantydetails: "",
    uom: "Please Select UOM",
    quantity: "",
    rate: "",
    billdate: "",
    files: "",
    warrantyfiles: "",

    warranty: "",
    warrantycalculation: "",
    estimation: "",
    estimationtime: "",
    purchasedate: "",

    requestmode: "Please Select Request Mode",
    stockcategory: "Please Select Stock Category",
    stocksubcategory: "Please Select Stock Sub Category",
    uomnew: "",
    quantitynew: "",
    materialnew: "Please Select Material",
    productdetailsnew: "",
  });

  const [stockArray, setStockArray] = useState([]);

  const [uomcodes, setuomcodes] = useState([]);

  const [vendorGroup, setVendorGroup] = useState("Choose Vendor Group");
  const [vendorGroupOpt, setVendorGroupopt] = useState([]);
  const [vendorOverall, setVendorOverall] = useState([]);
  const [vendorNew, setVendorNew] = useState("Choose Vendor");
  const [vendorNewEdit, setVendorNewEdit] = useState("Choose Vendor");

  const [vendorGroupEdit, setVendorGroupEdit] = useState("Choose Vendor Group");
  const [vendorOptEdit, setVendoroptEdit] = useState([]);

  const [vendorOptIndEdit, setVendoroptIndEdit] = useState([]);

  const handleChangeGroupNameIndexBasedEdit = async (e, index) => {
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

    setVendoroptIndEdit((prev) => {
      const updated = [...prev];
      updated[index] = final;
      return updated;
    });
  };

  const [vendorOptInd, setVendoroptInd] = useState([]);
  const handleChangeGroupNameIndexBased = async (e, index) => {
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

    let spreaded = [...vendorOptInd];
    spreaded[index] = final;

    setVendoroptInd(spreaded);
  };

  const handleChangeGroupNameEdit = async (e) => {
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

    setVendoroptEdit(final);
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

    setVendoropt(final);
  };

  const handleStockArray = () => {
    const isNameMatch = stockArray.some(
      (item) =>
        item.materialnew == stockmaster.materialnew &&
        item.uomnew === String(stockmaster.uomnew) &&
        item.quantitynew == stockmaster.quantitynew
    );
    if (
      stockmaster.stockcategory === "Please Select Stock Category" ||
      stockmaster.stockcategory === ""
    ) {
      setPopupContentMalert("Please Select Stock Category!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      stockmaster.stocksubcategory === "Please Select Stock Sub Category" ||
      stockmaster.stocksubcategory === ""
    ) {
      setPopupContentMalert("Please Select Stock Sub Category!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      stockmaster.materialnew === "Please Select Material" ||
      stockmaster.materialnew === ""
    ) {
      setPopupContentMalert("Please Select Material!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (stockmaster.uomnew === "" || stockmaster.uomnew === undefined) {
      setPopupContentMalert("Please Enter UOM!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      stockmaster.quantitynew === "" ||
      stockmaster.quantitynew === undefined
    ) {
      setPopupContentMalert("Please Enter Quantityy!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert("Todo Data Already Exist!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      try {
        let findData = uomcodes.find(
          (item) => item.name === stockmaster.uomnew
        );

        setStockArray([
          ...stockArray,
          {
            uomnew: stockmaster.uomnew,
            quantitynew: stockmaster.quantitynew,
            materialnew: stockmaster.materialnew,
            productdetailsnew: stockmaster.productdetailsnew,
            uomcodenew: findData.code,
          },
        ]);

        setStockmaster({
          ...stockmaster,
          uomnew: "",
          quantitynew: "",
          materialnew: "Please Select Material",
          productdetailsnew: "",
        });
      } catch (e) {
        setPopupContentMalert("UOM is not found! Hence cannot get a UOM Code!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
    }
  };

  const deleteTodo = (index) => {
    setStockArray(
      stockArray.filter((data, indexcurrent) => {
        return indexcurrent !== index;
      })
    );
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
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [stockMaterial, setStockMaterial] = useState([]);
  //get all project.
  const fetchStockStockMaterial = async () => {
    try {
      let res_project = await axios.get(SERVICE.STOCKPURCHASE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      // setLoading(true);
      let filteredData = res_project?.data?.stock.filter((data) => {
        return data.requestmode === "Stock Material";
      });
      setStockMaterial(filteredData);
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
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchMaterialNew = async (e) => {
    try {
      let res = await axios.get(SERVICE.MANAGESTOCKITEMS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const resultall = res.data.managestockitems.filter((data) => {
        return (
          data.stockcategory === stockmaster.stockcategory &&
          data.stocksubcategory === e.value
        );
      });

      const assetmaterialuniqueArray = resultall.map((item) => ({
        label: item.itemname,
        value: item.itemname,
      }));

      setMaterialoptNew(assetmaterialuniqueArray);
      // setMaterialoptEditNew(assetmaterialuniqueArray);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //alert model for Type details
  const [openCapacity, setOpenCapacity] = useState(false);
  // view model
  const handleClickOpenCapacity = () => {
    setOpenCapacity(true);
  };

  const handleClickCloseCapacity = () => {
    setOpenCapacity(false);
    setcapacityname("");
  };

  //alert model for Type details
  const [opentype, setOpenType] = useState(false);
  // view model
  const handleClickOpenType = () => {
    setOpenType(true);
  };

  const handleClickCloseType = () => {
    setOpenType(false);
    setAssetSpecificationType({ name: "", code: "" });
  };

  //alert model for Model details
  const [openmodel, setOpenmodel] = useState(false);
  // view model
  const handleClickOpenModel = () => {
    setOpenmodel(true);
  };

  const handleClickCloseModel = () => {
    setOpenmodel(false);
    setAssetModel({ name: "", code: "" });
  };

  //alert model for Size details
  const [opensize, setOpensize] = useState(false);
  // view model
  const handleClickOpenSize = () => {
    setOpensize(true);
  };

  const handleClickCloseSize = () => {
    setOpensize(false);
    setAssetSize({ name: "", code: "" });
  };

  //alert model for Variant details
  const [openvariant, setOpenvariant] = useState(false);
  // view model
  const handleClickOpenVariant = () => {
    setOpenvariant(true);
  };

  const handleClickCloseVariant = () => {
    setOpenvariant(false);
    setAssetVariant({ name: "", code: "" });
  };

  //alert model for Brand details
  const [openbrand, setOpenbrand] = useState(false);
  // view model
  const handleClickOpenBrand = () => {
    setOpenbrand(true);
  };

  const handleClickCloseBrand = () => {
    setOpenbrand(false);
    setBrandMaster({ name: "", code: "" });
  };

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

  const [asset, setAsset] = useState({
    name: "",
    materialcode: "",
    assethead: "",
  });
  const [vendorAuto, setVendorAuto] = useState("");
  const [selectedassethead, setSelectedAssethead] = useState(
    "Please Select Assethead"
  );

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
        if (file.size <= 5 * 1024 * 1024) {
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
          setPopupContentMalert("File size should be less than 5MB!");
          setPopupSeverityMalert("info");
          handleClickOpenPopupMalert();
        }
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
    let newSelectedFiles = Array.isArray(refImagewarrantyedit)
      ? refImagewarrantyedit
      : [];

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
    const newSelectedFiles = refImagewarrantyedit;
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

  //reference images
  const handleInputChangeedit = (event) => {
    const files = event.target.files;
    let newSelectedFiles = [...refImageedit];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Check if the file is an image
      if (file.type.startsWith("image/")) {
        if (file.size <= 5 * 1024 * 1024) {
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
          setPopupContentMalert("File size should be less than 5MB!");
          setPopupSeverityMalert("info");
          handleClickOpenPopupMalert();
        }
      } else {
        setPopupContentMalert("Only Accept Images!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
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
  const [vendormaster, setVendormaster] = useState([]);
  const [branches, setBranches] = useState([]);
  const [teamstabledata, setTeamstableData] = useState([]);
  const [account, setAccount] = useState([]);

  const [selectedBranch, setSelectedBranch] = useState("Please Select Branch");
  const [selectedBranchedit, setSelectedBranchedit] = useState(
    "Please Select Branch"
  );
  const [selectedUnit, setSelectedUnit] = useState("Please Select Unit");
  const [selectedUnitedit, setSelectedUnitedit] =
    useState("Please Select Unit");

  const [assetType, setAssetType] = useState([]);
  const [selectedassetType, setSelectedAssetType] = useState("");
  const [selectedassetTypeEdit, setSelectedAssetTypeEdit] = useState("");

  const [selectedProducthead, setSelectedProducthead] = useState(
    "Please Select Assethead"
  );
  const [selectedProductheadedit, setSelectedProductheadedit] = useState(
    "Please Select Assethead"
  );
  const [selectedProductname, setSelectedProductname] = useState(
    "Please Select Materila Name"
  );
  const [selectedProductnameedit, setSelectedProductnameedit] = useState(
    "Please Select Materila Name"
  );

  const [filteredUnit, setFilteredUnit] = useState([]);
  const [filteredUnitEdit, setFilteredUnitEdit] = useState([]);

  const [filteredProductname, setFilteredProductname] = useState([]);
  const [filteredProductnameEdit, setFilteredProductnameEdit] = useState([]);

  const [newcheckteam, setNewcheckTeam] = useState("Please Select Team");
  const [newcheckresperson, setNewcheckResperson] = useState(
    "Please Select Responsible Person"
  );

  const [newcheckteamedit, setNewcheckTeamedit] =
    useState("Please Select Team");
  const [newcheckrespersonedit, setNewcheckRespersonedit] = useState(
    "Please Select Responsible Person"
  );
  const [newcheckbranchedit, setNewcheckBranchedit] = useState(
    "Please Select Branch"
  );

  const [searchQueryManage, setSearchQueryManage] = useState("");

  const dropdowndata = [{ label: "All", value: "All" }];

  //  Datefield
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + "-" + mm + "-" + dd;

  const [selectedPurchaseDate, setSelectedPurchaseDate] = useState("");
  const [selectedPurchaseDateEdit, setSelectedPurchaseDateEdit] = useState("");

  //change form
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

  const handleChangephonenumberEdit = (e) => {
    // const regex = /^[0-9]+$/;  // Only allows positive integers
    const regex = /^\d*\.?\d*$/;
    const inputValue = e.target.value;
    // Check if the input value matches the regex or if it's empty (allowing backspace)
    if (regex.test(inputValue) || inputValue === "") {
      // Update the state with the valid numeric value
      setStockmasteredit({ ...stockmasteredit, estimation: inputValue });
    }
  };

  const handleEstimationChangeEdit = (e) => {
    const { value } = e.target;
    setStockmasteredit({ ...stockmasteredit, estimationtime: value });
    // calculateExpiryDate(value, stockmasteredit.purchasedate);
  };

  const handleEstimationChange = (e) => {
    const { value } = e.target;
    setStockmaster({ ...stockmaster, estimationtime: value });
  };

  const handlePurchaseDateChange = (e) => {
    const { value } = e.target;
    setStockmaster({ ...stockmaster, purchasedate: value });
    setSelectedPurchaseDate(value);
  };

  const handlePurchaseDateChangeEdit = (e) => {
    const { value } = e.target;
    setStockmasteredit({ ...stockmasteredit, purchasedate: value });
    setSelectedPurchaseDateEdit(value);
    // calculateExpiryDateEdit(stockmasterEdit.estimationtime, value);
  };

  const formatDateString = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const calculateExpiryDate = () => {
    if (stockmaster.estimationtime !== "" && stockmaster.purchasedate) {
      const currentDate = new Date(stockmaster.purchasedate);
      let expiryDate = new Date(currentDate);

      if (stockmaster.estimationtime === "Days") {
        expiryDate.setDate(
          currentDate.getDate() + parseInt(stockmaster.estimation)
        );
      } else if (stockmaster.estimationtime === "Month") {
        expiryDate.setMonth(
          currentDate.getMonth() + parseInt(stockmaster.estimation)
        );
      } else if (stockmaster.estimationtime === "Year") {
        expiryDate.setFullYear(
          currentDate.getFullYear() + parseInt(stockmaster.estimation)
        );
      }

      const formattedExpiryDate = formatDateString(expiryDate);

      let formattedempty = formattedExpiryDate.includes("NaN-NaN-NaN")
        ? ""
        : formattedExpiryDate;

      setStockmaster({
        ...stockmaster,
        warrantycalculation: formattedempty, // Format date as needed
      });
    }
  };

  useEffect(() => {
    calculateExpiryDate();
  }, [
    stockmaster.estimationtime,
    stockmaster.estimation,
    stockmaster.purchasedate,
  ]);

  useEffect(() => {
    calculateExpiryDateEdit();
  }, [
    stockmasteredit.estimationtime,
    stockmasteredit.estimation,
    stockmasteredit.purchasedate,
  ]);

  const calculateExpiryDateEdit = () => {
    if (stockmasteredit.estimationtime && stockmasteredit.purchasedate) {
      const currentDate = new Date(stockmasteredit.purchasedate);
      let expiryDate = new Date(currentDate);

      if (stockmasteredit.estimationtime === "Days") {
        expiryDate.setDate(
          currentDate.getDate() + parseInt(stockmasteredit.estimation)
        );
      } else if (stockmasteredit.estimationtime === "Month") {
        expiryDate.setMonth(
          currentDate.getMonth() + parseInt(stockmasteredit.estimation)
        );
      } else if (stockmasteredit.estimationtime === "Year") {
        expiryDate.setFullYear(
          currentDate.getFullYear() + parseInt(stockmasteredit.estimation)
        );
      }

      const formattedExpiryDate = formatDateString(expiryDate);

      let formattedempty = formattedExpiryDate.includes("NaN-NaN-NaN")
        ? ""
        : formattedExpiryDate;

      setStockmasteredit({
        ...stockmasteredit,
        warrantycalculation: formattedempty, // Format date as needed
      });
    }
  };

  const fetchAssetType = async () => {
    try {
      let res_account = await axios.get(SERVICE.ALL_ASSETTYPEMASTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const projall = [
        ...res_account?.data?.assettypemaster?.map((d) => ({
          ...d,
          label: d.name,
          value: d.name,
        })),
      ];
      const aeestuniqueArray = projall.filter((item, index, self) => {
        return (
          self.findIndex(
            (i) => i.label === item.label && i.value === item.value
          ) === index
        );
      });
      setAssetType(aeestuniqueArray);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const [stockEdit, setStockEdit] = useState([]);

  //filter fields
  const [companys, setCompanys] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [assettypes, setAssettypes] = useState([]);
  const [branchs, setBranchs] = useState([]);
  const [units, setUnits] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [newcheckbranch, setNewcheckBranch] = useState("Choose Branch");
  const [floors, setFloors] = useState([]);

  //filter fields
  const [companysEdit, setCompanysEdit] = useState([]);
  const [departmentsEdit, setDepartmentsEdit] = useState([]);
  const [assettypesEdit, setAssetypesEdit] = useState([]);
  const [branchsEdit, setBranchsEdit] = useState([]);
  const [unitsEdit, setUnitsEdit] = useState([]);

  const [capacities, setCapacities] = useState([]);
  const [capacityname, setcapacityname] = useState("");

  const [areas, setAreas] = useState([]);
  const [locations, setLocations] = useState([{ label: "ALL", value: "ALL" }]);
  const [areasEdit, setAreasEdit] = useState([]);
  const [locationsEdit, setLocationsEdit] = useState([
    { label: "ALL", value: "ALL" },
  ]);
  const [floorsEdit, setFloorEdit] = useState([]);
  const [stockCodeCount, setStockCodeCount] = useState(0);
  const [workStationOpt, setWorkStationOpt] = useState([]);
  const [filteredWorkStation, setFilteredWorkStation] = useState([]);
  const [Specification, setSpecification] = useState([]);
  const [Specificationedit, setSpecificationedit] = useState([]);

  const [materialOpt, setMaterialopt] = useState([]);
  const [materialOptEdit, setMaterialoptEdit] = useState(
    "Please Select Material"
  );

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

  const {
    isUserRoleCompare,
    allProjects, pageName, setPageName,
    isAssignBranch,
    isUserRoleAccess,
    allCompany,
    allBranch,
    allUnit,
    allTeam, buttonStyles
  } = useContext(UserRoleAccessContext);
  const { auth, setAuth } = useContext(AuthContext);
  const [projectCheck, setProjectCheck] = useState(false);


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

  const handleBranchChange = (e) => {
    const selectedBranch = e.value;
    setSelectedBranch(selectedBranch);
    setSelectedUnit("Please Select Unit");
  };

  const handleProductChange = (e) => {
    const selectedProducthead = e.value;
    setSelectedProducthead(selectedProducthead);
    setSelectedProductname("Please Select Materila Name");
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

  const [projectData, setProjectData] = useState([]);
  const [items, setItems] = useState([]);
  const [sorting, setSorting] = useState({ column: "", direction: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const [checkvendor, setCheckvendor] = useState();
  const [checkcategory, setCheckcategory] = useState();
  const [checksubcategory, setChecksubcategory] = useState();
  const [checktimepoints, setChecktimepoints] = useState();

  const [copiedData, setCopiedData] = useState("");

  const [canvasState, setCanvasState] = useState(false);



  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage.toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, "Asset Purchase List.png");
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };

  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
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

  // Error Popup model
  const [isErrorOpenpop, setIsErrorOpenpop] = useState(false);
  const [showAlertpop, setShowAlertpop] = useState();
  const handleClickOpenerrpop = () => {
    setIsErrorOpenpop(true);
  };
  const handleCloseerrpop = () => {
    setIsErrorOpenpop(false);
  };

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

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // This is required for Chrome support
  };

  const username = isUserRoleAccess.username;
  const userData = {
    name: username,
    date: new Date(),
  };

  const classes = useStyles();

  let printsno = 1;

  // Manage Columns
  const [isManageColumnsOpen, setManageColumnsOpen1] = useState(false);
  const [anchorEl1, setAnchorEl1] = useState(null);

  const handleOpenManageColumns1 = (event) => {
    setAnchorEl1(event.currentTarget);
    setManageColumnsOpen1(true);
  };
  const handleCloseManageColumns1 = () => {
    setManageColumnsOpen1(false);
    setSearchQueryManage("");
  };

  const open = Boolean(anchorEl1);
  const id = open ? "simple-popover" : undefined;

  // Styles for the resizable column
  const ResizableColumn = styled(Resizable)`
    .react-resizable-handle {
      width: 10px;
      height: 100%;
      position: absolute;
      right: 0;
      bottom: 0;
      cursor: col-resize;
    }
  `;

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
    branch: true,
    unit: true,
    floor: true,
    area: true,
    location: true,
    requestmode: true,
    gstno: true,
    assettype: true,
    producthead: true,
    productdetails: true,
    productname: true,
    vendorname: true,
    billno: true,
    billdate: true,
    quantity: true,
    uom: true,
    rate: true,
    warrantydetails: true,
    warranty: true,
    purchasedate: true,
    asset: true,
    assettype: true,
    material: true,
    vendor: true,
    vendorgroup: true,
    actions: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(
    initialColumnVisibility
  );
  const fetchVendor = async () => {
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

  //set function to get particular row
  const rowData = async (id) => {
    setPageName(!pageName)

    try {
      let res = await axios.get(`${SERVICE.STOCKPURCHASE_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDeleteproject(res?.data?.sstock);
      handleClickOpen();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Alert delete popup
  let projectid = deleteproject._id;
  const delProject = async () => {
    setPageName(!pageName)

    try {
      await axios.delete(`${SERVICE.STOCKPURCHASE_SINGLE}/${projectid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      // await fetchEbSort()
      await fetchStock();
      await fetchStockStockMaterial();
      handleCloseMod();
      setSelectedRows([]);
      setPage(1);
      setPopupContent("Deleted Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const delProjectcheckbox = async () => {
    setPageName(!pageName)

    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(`${SERVICE.STOCKPURCHASE_SINGLE}/${item}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
      });

      // Wait for all delete requests to complete
      await Promise.all(deletePromises);
      // await fetchEbSort()
      await fetchStock();
      await fetchStockStockMaterial();
      handleCloseModcheckbox();
      setSelectedRows([]);
      setPopupContent("Deleted Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
      setSelectAllChecked(false);
      setPage(1);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  //add function
  const sendRequest = async () => {
    setChangeTable("new");

    try {
      let stockcreate = await axios.post(SERVICE.STOCKPURCHASE_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: String(stockmaster.company),
        branch: String(stockmaster.branch),
        unit: String(stockmaster.unit),
        floor: String(stockmaster.floor),
        location: String(stockmaster.location),
        area: String(stockmaster.area),
        workstation: String(
          stockmaster.workcheck ? stockmaster.workstation : ""
        ),
        workcheck: String(stockmaster.workcheck),
        assettype: String(
          stockmaster.assettype === undefined ? "" : stockmaster.assettype
        ),
        asset: String(stockmaster.asset),
        productname: String(
          stockmaster.productname === "Please Select Material"
            ? ""
            : stockmaster.productname
        ),

        component: String(
          stockmaster.component === "Please Select Component"
            ? ""
            : stockmaster.component
        ),

        producthead: String(
          stockmaster.producthead === "Please Select Assethead"
            ? ""
            : stockmaster.producthead
        ),

        vendor: String(vendorNew),
        vendorgroup: String(vendorGroup),
        vendorid: String(vendornameid),
        gstno: String(
          vendorgetid.gstnumber === undefined ? "" : vendorgetid.gstnumber
        ),
        address: String(vendorgetid.address),
        phonenumber: String(vendorgetid.phonenumber),
        billno: Number(stockmaster.billno),

        productdetails: String(stockmaster.productdetails),

        warrantydetails: String(stockmaster.warrantydetails),

        uom:
          stockmaster.uom === "Please Select UOM"
            ? ""
            : String(stockmaster.uom),

        quantity: Number(stockmaster.quantity),

        rate: Number(stockmaster.rate),

        billdate: String(stockmaster.billdate),

        subcomponent: todos ? [...todos] : [],
        files: [...refImage],
        warrantyfiles: [...refImagewarranty],
        warranty: String(stockmaster.warranty),
        estimation: String(stockmaster.estimation),
        estimationtime: String(stockmaster.estimationtime)
          ? stockmaster.estimationtime
          : "Days",
        warrantycalculation: String(stockmaster.warrantycalculation),
        purchasedate: selectedPurchaseDate,

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

      await fetchStock();
      // await fetchEbSort()
      setBtnSubmit(false);
      setPopupContent("Added Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
      // setStockmaster(stockcreate.data);
      // await fetchEbSort()
      await fetchStockStockMaterial();
      setStockArray([]);
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

        warranty: "Yes",
        warrantycalculation: "",
        estimation: "",
        estimationtime: "Days",
        purchasedate: "",

        vendorname: "Please Select Vendor",
        productname: "Please Select Material",
        component: "Please Select Component",
      });

      setRefImage([]);
      setFile("");
      setGetImg(null);
      setRefImagewarranty([]);
      setFilewarranty("");
      setGetImgwarranty(null);
      setTodos([]);
      setChangeTable("old");
      setSelectedPurchaseDate("");
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //submit option for saving
  const handleSubmit = async (e) => {
    let vendorEmpty = todos.some((item) => item.vendor == "Choose Vendor");
    setBtnSubmit(true);
    e.preventDefault();
    // await fetchStock();
    // await fetchEbSort()
    if (!isStockMaterial) {
      const isNameMatch = stock.some(
        (item) =>

          item.company == stockmaster.company &&
          item.branch == stockmaster.branch &&
          item.unit == stockmaster.unit &&
          item.floor == stockmaster.floor &&
          item.area == stockmaster.area &&
          item.location == stockmaster.location &&
          item.vendorgroup == vendorGroup &&
          Number(item.billno) === Number(stockmaster.billno) &&
          item.assettype == stockmaster.assettype &&
          item.assethead == stockmaster.assethead &&
          item.component == stockmaster.component &&
          item.productdetails.toLowerCase() ==
          stockmaster.productdetails.toLowerCase() &&
          item.warrantydetails.toLowerCase() ==
          stockmaster.warrantydetails.toLowerCase() &&
          item.uom == stockmaster.uom &&
          item.quantity == stockmaster.quantity &&
          item.rate == stockmaster.rate &&
          item.billdate == stockmaster.billdate

        // console.log(

        //   item.company == stockmaster.company,
        //   item.branch == stockmaster.branch,
        //   item.unit == stockmaster.unit,
        //   item.floor == stockmaster.floor,
        //   item.area == stockmaster.area,
        //   item.location == stockmaster.location,
        //   item.vendorgroup == vendorGroup,
        //   Number(item.billno) === Number(stockmaster.billno),
        //   item.assettype == stockmaster.assettype,
        //   item.assethead == stockmaster.assethead,
        //   item.component == stockmaster.component,
        //   item.productdetails.toLowerCase() ==
        //   stockmaster.productdetails.toLowerCase(),
        //   item.warrantydetails.toLowerCase() ==
        //   stockmaster.warrantydetails.toLowerCase(),
        //   item.uom == stockmaster.uom,
        //   item.quantity == stockmaster.quantity,
        //   item.rate == stockmaster.rate,
        //   item.billdate == stockmaster.billdate

        //   , "cond")
      );
      if (stockmaster.company === "Please Select Company") {
        setPopupContentMalert("Please Select Company!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.branch === "Please Select Branch") {
        setPopupContentMalert("Please Select Branch!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.unit === "Please Select Unit") {
        setPopupContentMalert("Please Select Unit!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.floor === "Please Select Floor") {
        setPopupContentMalert("Please Select Floor!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.area === "Please Select Area") {
        setPopupContentMalert("Please Select Area!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.location === "Please Select Location") {
        setPopupContentMalert("Please Select Location!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (vendorGroup === "Choose Vendor Group") {
        setPopupContentMalert("Please Select Vendor Group!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (vendorNew === "Choose Vendor") {
        setPopupContentMalert("Please Select Vendor!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.requestmode === "Please Select Request Mode" ||
        stockmaster.requestmode === ""
      ) {
        setPopupContentMalert("Please Select Request Mode For!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.productname === "" ||
        stockmaster.productname === "Please Select Material"
      ) {
        setPopupContentMalert("Please Select Material!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.component === "" ||
        stockmaster.component === "Please Select Component"
      ) {
        setPopupContentMalert("Please Select Component!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.billno === "") {
        setPopupContentMalert("Please Enter Billno!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.productdetails === "") {
        setPopupContentMalert("Please Enter Product Details!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
      else if (!stockmaster.warranty === "No") {
        setPopupContentMalert("Please Enter Warranty Details!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.uom === "" ||
        stockmaster.uom === "Please Select UOM"
      ) {
        setPopupContentMalert("Please Select Uom!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.quantity === "") {
        setPopupContentMalert("Please Enter Quantity!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.rate === "") {
        setPopupContentMalert("Please Enter Rate!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.billdate === "") {
        setPopupContentMalert("Please Select Bill Date!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (refImage.length == 0) {
        setPopupContentMalert("Please Upload Bill!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (vendorEmpty) {
        setPopupContentMalert("Please Select Vendor in All the Sub Dividends!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (isNameMatch) {
        setPopupContentMalert("Data Already Exist!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
      else if (todos.length > 0 && todos.some(d => (d.warranty === "Yes" && d.estimation === undefined || d.estimation === ""))) {
        setPopupContentMalert("Please Enter Warranty Time in Component");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }

      else {
        sendRequest();
      }
    }
    else {
      const isNameMatch = stockMaterial.some(
        (item) =>
          item.company == stockmaster.company &&
          item.branch == stockmaster.branch &&
          item.unit == stockmaster.unit &&
          item.floor == stockmaster.floor &&
          item.area == stockmaster.area &&
          item.location == stockmaster.location &&
          item.vendorgroup == vendorGroup &&
          Number(item.billno) == Number(stockmaster.billno) &&
          item.productdetailsnew.toLowerCase() ==
          stockmaster.productdetailsnew.toLowerCase() &&
          item.requestmode == stockmaster.requestmode &&
          item.stockcategory == stockmaster.stockcategory &&
          item.stocksubcategory == stockmaster.stocksubcategory &&
          item.warrantydetails.toLowerCase() ==
          stockmaster.warrantydetails.toLowerCase() &&
          item.uomnew == stockmaster.uomnew &&
          item.quantitynew == stockmaster.quantitynew &&
          item.materialnew == stockmaster.materialnew &&
          item.rate == stockmaster.rate &&
          item.billdate == stockmaster.billdate


        // console.log(item.company == stockmaster.company,
        //   item.branch == stockmaster.branch,
        //   item.unit == stockmaster.unit,
        //   item.floor == stockmaster.floor,
        //   item.area == stockmaster.area,
        //   item.location == stockmaster.location,
        //   item.vendorgroup == vendorGroup,
        //   Number(item.billno) == Number(stockmaster.billno),
        //   item.productdetailsnew.toLowerCase() ==
        //   stockmaster.productdetailsnew.toLowerCase(),
        //   item.requestmode == stockmaster.requestmode,
        //   item.stockcategory == stockmaster.stockcategory,
        //   item.stocksubcategory == stockmaster.stocksubcategory,
        //   item.warrantydetails.toLowerCase() ==
        //   stockmaster.warrantydetails.toLowerCase(),
        //   item.uomnew == stockmaster.uomnew,
        //   item.quantitynew == stockmaster.quantitynew,
        //   item.materialnew == stockmaster.materialnew,
        //   item.rate == stockmaster.rate,
        //   item.billdate == stockmaster.billdate, "condstock")
      );

      if (stockmaster.company === "Please Select Company") {
        setPopupContentMalert("Please Select Company!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.branch === "Please Select Branch") {
        setPopupContentMalert("Please Select Branch!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.unit === "Please Select Unit") {
        setPopupContentMalert("Please Select Unit!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.floor === "Please Select Floor") {
        setPopupContentMalert("Please Select Floor!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.area === "Please Select Area") {
        setPopupContentMalert("Please Select Area!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.location === "Please Select Location") {
        setPopupContentMalert("Please Select Location!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
      // else if (stockmaster.vendorname === "" || stockmaster.vendorname === "Please Select Vendor") {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"Please Select Vendor"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
      // else if (stockmaster.gstno === "") {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"Please Enter GST No"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
      else if (stockmaster.billno === "") {
        setPopupContentMalert("Please Enter Billno!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.requestmode === "Please Select Request Mode" ||
        stockmaster.requestmode === ""
      ) {
        setPopupContentMalert("Please Select Request Mode For!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.stockcategory === "Please Select Stock Category" ||
        stockmaster.stockcategory === ""
      ) {
        setPopupContentMalert("Please Select Stock Category!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (
        stockmaster.stocksubcategory === "Please Select Stock Sub Category" ||
        stockmaster.stocksubcategory === ""
      ) {
        setPopupContentMalert("Please Select Stock Sub Category!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockArray.length === 0) {
        setPopupContentMalert("Please Insert Stock Todo List!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (!stockmaster.warranty === "No") {
        setPopupContentMalert("Please Enter Warranty Details!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.rate === "") {
        setPopupContentMalert("Please Enter Rate!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (stockmaster.billdate === "") {
        setPopupContentMalert("Please Select Bill Date!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else if (refImage.length == 0) {
        setPopupContentMalert("Please Upload Bill!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }

      else if (isNameMatch) {
        setPopupContentMalert("Data Already Exist!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else {
        sendRequest();
      }
    }
  };

  const handleclear = (e) => {
    e.preventDefault();

    setStockmaster({
      company: "Please Select Company",
      branch: "Please Select Branch",
      unit: "Please Select Unit",
      floor: "Please Select Floor",
      area: "Please Select Area",
      location: "Please Select Location",
      workstation: "Please Select Workstation",
      workcheck: false,
      producthead: "",
      vendorname: "Please Select Vendor",
      productname: "Please Select Material",
      component: "Please Select Component",
      gstno: "",
      billno: "",
      assettype: "",
      asset: "",
      productdetails: "",
      warrantydetails: "",
      uom: "Please Select UOM",
      quantity: "",
      rate: "",
      billdate: "",
      files: "",
      warrantyfiles: "",

      warranty: "Yes",
      warrantycalculation: "",
      estimation: "",
      estimationtime: "Days",
      purchasedate: "",

      addedby: "",
      updatedby: "",

      requestmode: "Please Select Request Mode",
      stockcategory: "Please Select Stock Category",
      stocksubcategory: "Please Select Stock Sub Category",
      uomnew: "",
      quantitynew: "",
      materialnew: "Please Select Material",
      productdetailsnew: "",
    });
    setCategoryOption([])
    setSubcategoryOption([])
    setMaterialoptNew([])
    setBranchs([]);
    setVendoropt([])
    setUnits([]);
    setFloors([]);
    setStockArray([]);
    setAreas([]);
    setLocations([{ label: "ALL", value: "ALL" }]);
    setSelectedBranch("Please Select Branch");
    setSelectedUnit("Please Select Unit");
    setSelectedProducthead("Please Select Assethead");
    setSelectedProductname("Please Select Materila Name");
    setAccount([]);
    setFile("");
    setRefImage([]);
    setGetImg(null);
    setTodos([]);
    setVendorNew("Choose Vendor");
    setVendorGroup("Choose Vendor Group");
    setVendorgetid({ gstnumber: "", address: "", phonenumber: "" });
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
  //post call for UOM
  //add function
  const sendRequestuom = async () => {
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
      setPopupContentMalert("Data Already Exist!");
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
      setPopupContentMalert("Data Already Exist!");
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
    setStockmasteredit({
      vendorname: "Please Select Vendor",
      gstno: "",
      billno: "",
      productdetails: "",
      warrantydetails: "",
      uom: "",
      quantity: "",
      warranty: "",
      rate: "",
      billdate: "",
      files: "",
      warrantyfiles: "",
    });
    setSelectedBranch("Please Select Branch");
    setSelectedUnit("Please Select Unit");
    setSelectedProducthead("Please Select Assethead");
    setSelectedProductname("Please Select Materila Name");
    setVendorgetid({ gstnumber: "" });
  };
  //get single row to edit....
  const getCode = async (e) => {
    setPageName(!pageName)

    try {
      let res = await axios.get(`${SERVICE.STOCKPURCHASE_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setStockmasteredit(res?.data?.sstock);
      setSelectedBranchedit(res?.data?.sstock.branch);
      setSelectedUnitedit(res?.data?.sstock.unit);
      setRefImageedit(res?.data?.sstock?.files);
      setRefImagewarrantyedit(res?.data?.sstock?.warrantyfiles);
      setSelectedAssetTypeEdit(res?.data?.sstock?.workstation);
      setVendorGroupEdit(res?.data?.sstock?.vendorgroup);
      setVendorNewEdit(res?.data?.sstock?.vendor);
      handleChangeGroupNameEdit({ value: res?.data?.sstock?.vendorgroup });
      setVendoroptIndEdit(
        new Array(res?.data?.sstock?.subcomponent?.length).fill([])
      );
      for (let i = 0; i < res?.data?.sstock?.subcomponent?.length; i++) {
        await handleChangeGroupNameIndexBasedEdit(
          { value: res?.data?.sstock?.subcomponent[i]?.vendorgroup },
          i
        );
      }

      setSelectedPurchaseDateEdit(res?.data?.sstock.purchasedate);
      setTodosEdit(res?.data?.sstock?.subcomponent);

      await fetchBranchDropdownsEdit(res?.data?.sstock?.company);
      await fetchspecification(res?.data?.sstock?.workstation);

      await fetchUnitsEdit(res?.data?.sstock.branch);
      await fetchFloorEdit(res?.data?.sstock?.branch);
      await fetchAreaEdit(res?.data?.sstock?.branch, res?.data?.sstock?.floor);
      await fetchAllLocationEdit(
        res?.data?.sstock?.branch,
        res?.data?.sstock?.floor,
        res?.data?.sstock?.area
      );

      if (res?.data?.sstock.vendorid) {
        let resv = await axios.get(
          `${SERVICE.SINGLE_VENDORDETAILS}/${res?.data?.sstock.vendorid}`,
          {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
          }
        );
        setVendorgetid(resv?.data?.svendordetails);
      }
      let res1 = await axios.get(SERVICE.ASSETWORKSTAION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      // let result = res1.data.assetworkstation.filter(
      //   (d) => d.workstation === res?.data?.sstock.material
      // );

      // const resultall = result?.map((d) => ({
      //   ...d,
      //   label: d.categoryname,
      //   value: d.categoryname,
      // }));+
      fetchspecificationEdit(res?.data?.sstock.component)
      handleClickOpenEdit();
      // setSpecificationedit(resultall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleAssetTypeChange = (e) => {
    const selectedassetType = e.value;
    setSelectedAssetType(selectedassetType);
  };
  // get single row to view....
  const getviewCode = async (e) => {
    setPageName(!pageName)

    try {
      let res = await axios.get(`${SERVICE.STOCKPURCHASE_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let res_project_1 = await axios.get(SERVICE.ALL_VOMMASTERNAME, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let codeValues = res_project_1?.data?.vommaster.map((data) => ({
        name: data.name,
        code: data.code,
      }));

      let setDataOne = codeValues.find(
        (item1) => res?.data?.sstock.uom === item1.name
      );

      // stock?.map((item, index) => ({
      //   ...item,
      //   serialNumber: index + 1,
      //   uom: item.uom !== "" ? `${item.quantity}#${item.uom}` : item.quantity,
      //   billdate: moment(item.billdate).format("DD/MM/YYYY"),
      //   purchasedate:
      //     item.purchasedate != ""
      //       ? moment(item.purchasedate).format("DD/MM/YYYY")
      //       : "",

      let setData = {
        ...res?.data?.sstock,
        uomcode: setDataOne ? setDataOne.code : "",
        purchasedate: res?.data?.sstock.purchasedate != ""
          ? moment(res?.data?.sstock.purchasedate).format("DD/MM/YYYY")
          : "",
      };

      setStockmasteredit(setData);
      handleClickOpenview();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // get single row to view....
  const getinfoCode = async (e) => {
    setPageName(!pageName)

    try {
      let res = await axios.get(`${SERVICE.STOCKPURCHASE_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setStockmasteredit(res?.data?.sstock);
      handleClickOpeninfo();

    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchEmployee = async () => {
    setPageName(!pageName)

    try {
      let res_employee = await axios.get(SERVICE.USERALLLIMIT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setUsers(res_employee.data.users);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //get all teams
  const fetchteams = async () => {
    try {
      let teams = await axios.get(SERVICE.TEAMS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTeamstableData(teams.data.teamsdetails);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //Project updateby edit page...
  let updateby = stockmasteredit?.updatedby;
  let addedby = stockmasteredit?.addedby;

  let maintenanceid = stockmasteredit?._id;

  //editing the single data...
  const sendEditRequest = async () => {
    try {
      let res = await axios.put(
        `${SERVICE.STOCKPURCHASE_SINGLE}/${maintenanceid}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          company: String(stockmasteredit.company),
          branch: String(stockmasteredit.branch),
          unit: String(stockmasteredit.unit),
          floor: String(stockmasteredit.floor),
          location: String(stockmasteredit.location),
          area: String(stockmasteredit.area),
          workstation: String(
            stockmasteredit.workcheck ? stockmasteredit.workstation : ""
          ),
          // workcheck: String(stockmasteredit.workcheck),
          assettype: String(
            stockmasteredit.assettype === undefined
              ? ""
              : stockmasteredit.assettype
          ),
          asset: String(stockmasteredit.asset),

          productname: String(
            stockmasteredit.productname === "Please Select Material" ||
              stockmasteredit.productname === undefined
              ? ""
              : stockmasteredit.productname
          ),

          component: String(
            stockmasteredit.component === "Please Select Component"
              ? ""
              : stockmasteredit.component
          ),
          subcomponent: todosEdit ? [...todosEdit] : [],
          warranty: String(stockmasteredit.warranty),
          estimation: String(stockmasteredit.estimation),
          estimationtime: String(stockmasteredit.estimationtime),
          warrantycalculation: String(stockmasteredit.warrantycalculation),
          purchasedate: selectedPurchaseDateEdit,

          producthead: String(
            stockmasteredit.producthead === ""
              ? ""
              : stockmasteredit.producthead
          ),

          vendor: String(vendorNewEdit),
          vendorgroup: String(vendorGroupEdit),
          gstno: String(
            vendorgetid.gstnumber === undefined ? "" : vendorgetid.gstnumber
          ),
          vendorid: String(vendorgetid._id),
          billno: Number(stockmasteredit.billno),
          productdetails: String(stockmasteredit.productdetails),
          warrantydetails: String(stockmasteredit.warrantydetails),
          uom:
            stockmasteredit.uom === "Please Select UOM"
              ? ""
              : String(stockmasteredit.uom),
          quantity: Number(stockmasteredit.quantity),
          rate: Number(stockmasteredit.rate),
          billdate: String(stockmasteredit.billdate),
          files: [...refImageedit],
          warrantyfiles: refImagewarrantyedit,

          requestmode: String(stockmasteredit.requestmode),
          stockcategory:
            stockmasteredit.stockcategory === "Please Select Stock Category"
              ? ""
              : String(stockmasteredit.stockcategory),
          stocksubcategory:
            stockmasteredit.stocksubcategory ===
              "Please Select Stock Sub Category"
              ? ""
              : String(stockmasteredit.stocksubcategory),
          uomnew:
            stockmasteredit.uomnew === "" ? "" : String(stockmasteredit.uomnew),
          quantitynew:
            stockmasteredit.quantitynew === ""
              ? ""
              : Number(stockmasteredit.quantitynew),
          materialnew:
            stockmasteredit.materialnew === "Please Select Material"
              ? ""
              : String(stockmasteredit.materialnew),
          productdetailsnew: String(stockmasteredit.productdetailsnew),
          updatedby: [
            ...updateby,
            {
              name: String(isUserRoleAccess.companyname),
              date: String(new Date()),
            },
          ],
        }
      );
      await fetchStock();

      // await fetchEbSort()
      await fetchStockStockMaterial();
      setBtnSubmit(false);
      setPopupContent("Updated Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
      handleCloseModEdit();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const editSubmit = (e) => {
    setBtnSubmit(true);
    e.preventDefault();
    let vendorEmpty = todosEdit.some((item) => item.vendor == "Choose Vendor");
    const isNameMatch = stockEdit.some(
      (item) =>
        item.company == stockmasteredit.company &&
        item.branch == stockmasteredit.branch &&
        item.unit == stockmasteredit.unit &&
        item.floor == stockmasteredit.floor &&
        item.area == stockmasteredit.area &&
        item.location == stockmasteredit.location &&
        item.vendorgroup == vendorGroupEdit &&
        item.assettype == stockmasteredit.assettype &&
        Number(item.billno) == Number(stockmasteredit.billno) &&
        item.productdetails.toLowerCase() ==
        String(stockmasteredit.productdetails.toLowerCase()) &&
        item.warrantydetails == String(stockmasteredit.warrantydetails) &&
        item.uom == String(stockmasteredit.uom) &&
        item.quantity == Number(stockmasteredit.quantity) &&
        item.rate == Number(stockmasteredit.rate) &&
        item.billdate == String(stockmasteredit.billdate)
    );

    if (stockmasteredit.company === "Please Select Company") {
      setPopupContentMalert("Please Select Company!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (stockmasteredit.branch === "Please Select Branch") {
      setPopupContentMalert("Please Select Branch!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (stockmasteredit.unit === "Please Select Unit") {
      setPopupContentMalert("Please Select Unit!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (stockmasteredit.floor === "Please Select Floor") {
      setPopupContentMalert("Please Select Floor!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (stockmasteredit.area === "Please Select Area") {
      setPopupContentMalert("Please Select Area!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (stockmasteredit.location === "Please Select Location") {
      setPopupContentMalert("Please Select Location!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      stockmasteredit.warranty == "Yes" &&
      stockmasteredit.estimation === ""
    ) {
      setPopupContentMalert(
        "Please Enter Warranty Time or Check Purchase and Expiry Date!"
      );
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (vendorGroupEdit === "Choose Vendor Group") {
      setPopupContentMalert("Please Select Vendor Group!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (vendorNewEdit === "Choose Vendor") {
      setPopupContentMalert("Please Select Vendor!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (stockmasteredit.billno === "") {
      setPopupContentMalert("Please Enter Billno!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (stockmasteredit.productdetails === "") {
      setPopupContentMalert("Please Enter Product Details!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (!stockmasteredit.warranty === "No") {
      setPopupContentMalert("Please Enter Warranty Details!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      stockmasteredit.uom === "" ||
      stockmasteredit.uom === "Please Select UOM"
    ) {
      setPopupContentMalert("Please Select Uom!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (stockmasteredit.quantity === "") {
      setPopupContentMalert("Please Enter Qunatity!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (stockmasteredit.rate === "") {
      setPopupContentMalert("Please Enter Rate!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (stockmasteredit.billdate === "") {
      setPopupContentMalert("Please Select Bill Date!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (refImageedit.length == 0) {
      setPopupContentMalert("Please Upload Bill!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (vendorEmpty) {
      setPopupContentMalert("Please Select Vendor in All the Sub Dividends!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert("Data Already Exist!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (todosEdit.length > 0 && todosEdit.some(d => (d.warranty === "Yes" && d.estimation === undefined || d.estimation === ""))) {
      setPopupContentMalert("Please Enter Warranty Time in Component");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }

    else {
      sendEditRequest();
    }
  };

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
      setCompanys(companyall);
      setCompanysEdit(companyall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchWorkStation = async () => {
    try {
      let res = await axios.get(SERVICE.WORKSTATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setWorkStationOpt(res?.data?.locationgroupings);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    var filteredWorks;
    if (
      (stockmaster.unit === "" || stockmaster.unit == undefined) &&
      (stockmaster.floor === "" || stockmaster.floor == undefined)
    ) {
      filteredWorks = workStationOpt?.filter(
        (u) =>
          u.company === stockmaster.company && u.branch === stockmaster.branch
      );
    } else if (stockmaster.unit === "" || stockmaster.unit == undefined) {
      filteredWorks = workStationOpt?.filter(
        (u) =>
          u.company === stockmaster.company &&
          u.branch === stockmaster.branch &&
          u.floor === stockmaster.floor
      );
    } else if (stockmaster.floor === "" || stockmaster.floor == undefined) {
      filteredWorks = workStationOpt?.filter(
        (u) =>
          u.company === stockmaster.company &&
          u.branch === stockmaster.branch &&
          u.unit === stockmaster.unit
      );
    } else {
      filteredWorks = workStationOpt?.filter(
        (u) =>
          u.company === stockmaster.company &&
          u.branch === stockmaster.branch &&
          u.unit === stockmaster.unit &&
          u.floor === stockmaster.floor
      );
    }
    const result = filteredWorks.flatMap((item) => {
      const cabinNamesArray =
        item.combinstation.length > 0 &&
          item.combinstation[0].subTodos.length > 0
          ? item.combinstation[0].subTodos.map((subTodo) => ({
            label: subTodo.subcabinname,
            value: subTodo.subcabinname,
          }))
          : [
            {
              label: item.combinstation[0].cabinname,
              value: item.combinstation[0].cabinname,
            },
          ];

      return cabinNamesArray;
    });
    setFilteredWorkStation(result);
  }, [stockmaster]);

  useEffect(() => {
    var filteredWorksedit;
    if (
      (stockmasteredit.unit === "" || stockmasteredit.unit == undefined) &&
      (stockmasteredit.floor === "" || stockmasteredit.floor == undefined)
    ) {
      filteredWorksedit = workStationOpt?.filter(
        (u) =>
          u.company === stockmasteredit.company &&
          u.branch === stockmasteredit.branch
      );
    } else if (
      stockmasteredit.unit === "" ||
      stockmasteredit.unit == undefined
    ) {
      filteredWorksedit = workStationOpt?.filter(
        (u) =>
          u.company === stockmasteredit.company &&
          u.branch === stockmaster.branch &&
          u.floor === stockmasteredit.floor
      );
    } else if (
      stockmasteredit.floor === "" ||
      stockmasteredit.floor == undefined
    ) {
      filteredWorksedit = workStationOpt?.filter(
        (u) =>
          u.company === stockmasteredit.company &&
          u.branch === stockmasteredit.branch &&
          u.unit === stockmasteredit.unit
      );
    } else {
      filteredWorksedit = workStationOpt?.filter(
        (u) =>
          u.company === stockmasteredit.company &&
          u.branch === stockmasteredit.branch &&
          u.unit === stockmasteredit.unit &&
          u.floor === stockmasteredit.floor
      );
    }
    const result = filteredWorksedit.flatMap((item) => {
      const cabinNamesArray =
        item.combinstation.length > 0 &&
          item.combinstation[0].subTodos.length > 0
          ? item.combinstation[0].subTodos.map((subTodo) => ({
            label: subTodo.subcabinname,
            value: subTodo.subcabinname,
          }))
          : [
            {
              label: item.combinstation[0].cabinname,
              value: item.combinstation[0].cabinname,
            },
          ];

      return cabinNamesArray;
    });
    setFilteredWorkStation(result);
  }, [stockmasteredit, isEditOpen]);

  useEffect(() => {
    fetchCompanyDropdowns();
    fetchWorkStation();
    fetchMaterialAll();
    fetchWorkStation();
    fetchCategoryAll();
    fetchStockStockMaterial();
    // fetchVomMaster();
  }, []);

  const fetchBranchDropdowns = async (e) => {
    try {
      let res_branch = await axios.get(SERVICE.BRANCH, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let result = res_branch.data.branch.filter((d) => d.company === e.value);
      const branchall = result.map((d) => ({
        ...d,
        label: d.name,
        value: d.name,
      }));
      setBranchs(branchall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const fetchUnits = async (e) => {
    try {
      let res_unit = await axios.get(SERVICE.UNIT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let result = res_unit?.data?.units.filter((d) => d.branch === e.value);
      const unitall = result.map((d) => ({
        ...d,
        label: d.name,
        value: d.name,
      }));
      setUnits(unitall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const fetchFloor = async (e) => {
    try {
      let res_floor = await axios.get(SERVICE.FLOOR, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let result = res_floor.data.floors.filter((d) => d.branch === e.value);
      const floorall = result.map((d) => ({
        ...d,
        label: d.name,
        value: d.name,
      }));
      setFloors(floorall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const fetchArea = async (e) => {
    try {
      let res_type = await axios.get(SERVICE.AREAGROUPING, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let result = res_type.data.areagroupings
        .filter((d) => d.branch === newcheckbranch && d.floor === e)
        .map((data) => data.area);
      let ji = [].concat(...result);
      let jiii = ji.map((data) => data);
      const all = ji.map((d) => ({
        ...d,
        label: d,
        value: d,
      }));
      setAreas(all);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const fetchLocation = async (e) => {
    try {
      let res_type = await axios.get(SERVICE.LOCATIONGROUPING, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let result = res_type.data.locationgroupings
        .filter(
          (d) =>
            d.branch === newcheckbranch &&
            d.floor === stockmaster.floor &&
            d.area === e
        )
        .map((data) => data.location);
      let ji = [].concat(...result);
      let jiii = ji.map((data) => data);
      const all = [
        { label: "ALL", value: "ALL" },
        ...ji.map((d) => ({
          ...d,
          label: d,
          value: d,
        })),
      ];
      setLocations(all);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const fetchUnitsEdit = async (e) => {
    try {
      let res_unit = await axios.get(SERVICE.UNIT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let result = res_unit?.data?.units.filter((d) => d.branch === e);
      const unitall = result.map((d) => ({
        ...d,
        label: d.name,
        value: d.name,
      }));
      setUnitsEdit(unitall);
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
  //get all Locations edit.
  const fetchAllLocationEdit = async (a, b, c) => {
    console.log(a, b, c)
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

  // useEffect(() => {
  //   fetchAllLocationEdit();
  // }, [isEditOpen, stockmasteredit.floor]);

  const fetchAssetTypeDropdowns = async () => {
    try {
      let res_asset = await axios.get(SERVICE.ALL_ASSETTYPEMASTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      // let result = res_asset.data.assetMaster.filter((d) => d.asset === e.value);

      let assetall = res_asset.data.assettypemaster.map((d) => ({
        ...d,
        label: d.name,
        value: d.name,
      }));
      const aeestuniqueArray = assetall.filter((item, index, self) => {
        return (
          self.findIndex(
            (i) => i.label === item.label && i.value === item.value
          ) === index
        );
      });
      setAssettypes(aeestuniqueArray);
      setAssetypesEdit(aeestuniqueArray);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchMaterialAll = async () => {
    try {
      let res = await axios.get(SERVICE.ASSETS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      // let result = res.data.assetmaterial.filter((d) => d.assethead === e.value);

      const resultall = res.data.assetmaterial.map((d) => ({
        ...d,
        label: d.name,
        value: d.name,
        assettype: d.assettype,
        asset: d.assethead,
      }));

      const assetmaterialuniqueArray = resultall.filter((item, index, self) => {
        return (
          self.findIndex(
            (i) => i.label === item.label && i.value === item.value
          ) === index
        );
      });

      setMaterialopt(assetmaterialuniqueArray);
      setMaterialoptEdit(assetmaterialuniqueArray);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchspecification = async (e) => {
    try {
      let res = await axios.get(SERVICE.ASSETWORKSTAION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let result = res.data.assetworkstation.filter(
        (d) => d.workstation === e
      );

      const resultall = result.map((d) => ({
        ...d,
        label: d.categoryname,
        value: d.categoryname,
      }));

      setSpecification(resultall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchspecificationEdit = async (e) => {
    try {
      let res = await axios.get(SERVICE.ASSETWORKSTAION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let result = res.data.assetworkstation?.filter(
        (d) => d.workstation === e
      );

      const resultall = result?.map((d) => ({
        ...d,
        label: d.categoryname,
        value: d.categoryname,
      }));

      setSpecificationedit(resultall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // useEffect(() => {
  //   fetchspecificationEdit();
  // }, [isEditOpen]);

  const [specificationGrouping, setSpecificationGrouping] = useState([]);
  const [specificationGroupingEdit, setSpecificationGroupingEdit] = useState(
    []
  );

  const fetchSpecificationGrouping = async () => {
    try {
      let res = await axios.get(SERVICE.ALL_ASSETSPECIFICATIONGROUPING, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let getvalues = res?.data?.assetspecificationgrouping.filter(
        (item) =>
          item.assetmaterial === stockmaster.productname &&
          stockmaster.component === item.component
      );

      setSpecificationGrouping(getvalues);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const fetchSpecificationGroupingEdit = async () => {
    try {
      let res = await axios.get(SERVICE.ALL_ASSETSPECIFICATIONGROUPING, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let getvalues = res?.data?.assetspecificationgrouping.filter(
        (item) =>
          item.assetmaterial === stockmasteredit.productname &&
          stockmasteredit.component === item.component
      );

      setSpecificationGroupingEdit(getvalues);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchSpecificationGrouping();
  }, [stockmaster.component]);

  useEffect(() => {
    fetchSpecificationGroupingEdit();
  }, [isEditOpen, stockmasteredit.component]);

  //fetching departments whole list
  const fetchAccount = async (e) => {
    let resulthead = [];
    try {
      let res_account = await axios.get(SERVICE.ALL_ASSETTYPEGROUPING, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const itAssetsObject = res_account?.data?.assettypegrouping.filter(
        (item) => item.name === e
      );
      //filter products
      let dataallstocks = itAssetsObject?.map((data, index) => {
        return data.accounthead;
      });
      //individual products
      dataallstocks.forEach((value) => {
        value.forEach((valueData) => {
          resulthead.push(valueData);
        });
      });
      const projall = [
        ...resulthead?.map((d) => ({
          ...d,
          label: d,
          value: d,
        })),
      ];
      setAccount(projall);
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

      let codeValues = res_project?.data?.vommaster.map((data) => ({
        name: data.name,
        code: data.code,
      }));
      setuomcodes(codeValues);

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
      // let res_project = await axios.get(SERVICE.STOCKPURCHASE, {
      let res_employee = await axios.post(SERVICE.STOCK_ACCESS, queryParams, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      // let filteredData = res_project?.data?.stock
      //   .filter((data) => {
      //     return data.requestmode === "Asset Material";
      //   });
      const ans = res_employee?.data?.result?.length > 0 ? res_employee?.data?.result : []

      let res_project_1 = await axios.get(SERVICE.ALL_VOMMASTERNAME, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let codeValues = res_project_1?.data?.vommaster.map((data) => ({
        name: data.name,
        code: data.code,
      }));
      // setuomcodes(codeValues);

      let setData = ans.map((item) => {
        // Find the corresponding item in codeValues array
        const matchingItem = codeValues.find(
          (item1) => item.uom === item1.name
        );

        // If matchingItem is found, return item with uomcode set to its code, otherwise set it to an empty string
        return matchingItem
          ? { ...item, uomcode: matchingItem.code }
          : { ...item, uomcode: "" };
      });

      const itemsWithSerialNumber = setData?.map((item, index) => ({
        ...item,
        serialNumber: (page - 1) * pageSize + index + 1,
        id: item._id,
        uom: item.uom !== "" ? `${item.quantity}#${item.uom}` : item.quantity,
        billdate: moment(item.billdate).format("DD/MM/YYYY"),
        purchasedate:
          item.purchasedate != ""
            ? moment(item.purchasedate).format("DD/MM/YYYY")
            : "",
      }));

      setStock(itemsWithSerialNumber);

      setOverallFilterdata(res_employee?.data?.totalProjectsData?.length > 0 ?
        res_employee?.data?.totalProjectsData?.map((item, index) => {
          return {
            ...item,
            serialNumber: (page - 1) * pageSize + index + 1,


          }
        }

        ) : []
      );



      setTotalProjects(ans?.length > 0 ? res_employee?.data?.totalProjects : 0);
      setTotalPages(ans?.length > 0 ? res_employee?.data?.totalPages : 0);
      setPageSize((data) => { return ans?.length > 0 ? data : 10 });
      setPage((data) => { return ans?.length > 0 ? data : 1 });

      if (stockmasteredit && stockmasteredit._id) {
        setStockEdit(
          ans.filter(
            (item) => item._id !== stockmasteredit._id
          )
        );
      }
      setProjectCheck(false);

    } catch (err) {
      console.log(err, "errorororo")
      setProjectCheck(false);

      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [page, pageSize, searchQuery]);
  // pdf.....
  const columns = [
    { title: "Sno", field: "serialNumber" },
    { title: "Company", field: "company" },
    { title: "Branch", field: "branch" },
    { title: "Unit", field: "unit" },
    { title: "Floor", field: "floor" },
    { title: "Area", field: "area" },
    { title: "Location", field: "location" },
    { title: "Request Mode For", field: "requestmode" },

    { title: "Vendor Group", field: "vendorgroup" },
    { title: "Vendor", field: "vendor" },
    { title: "Gst No", field: "gstno" },
    { title: "Bill Number", field: "billno" },
    { title: "Asset Head", field: "producthead" },
    { title: "Material", field: "productname" },
    { title: "Warranty", field: "warranty" },
    { title: "Purchasedate", field: "purchasedate" },
    { title: "Product Details", field: "productdetails" },
    { title: "Warranty Details", field: "warrantydetails" },
    { title: "Quantity", field: "quantity" },
    { title: "Quantity & UOM", field: "uom" },
    { title: "Rate", field: "rate" },
    { title: "Bill Date", field: "billdate" },
  ];

  //  pdf download functionality
  const downloadPdf = (isfilter) => {
    const doc = new jsPDF({ orientation: "landscape" });

    // Initialize serial number counter
    let serialNumberCounter = 1;

    // Modify row data to include serial number
    const dataWithSerial =
      isfilter === "filtered"
        ? rowDataTable.map((row) => ({
          ...row,
          serialNumber: serialNumberCounter++,
        }))
        : stock.map((row) => {
          // let purchasedate = row?.purchasedate?.split("-");
          // let year = purchasedate ? purchasedate[0] : ""
          // let month = purchasedate ? purchasedate[1] : ""
          // let date = purchasedate ? purchasedate[2] : ""

          let purchasedate = row?.purchasedate
            ? row.purchasedate.split("-")
            : ["", "", ""];
          let year = purchasedate[0];
          let month = purchasedate[1];
          let date = purchasedate[2];

          let [year1, month1, date1] = row?.billdate?.split("-");
          return {
            ...row,
            serialNumber: serialNumberCounter++,
            purchasedate:
              purchasedate && date != "" && month != ""
                ? `${date}/${month}/${year}`
                : "",
            billdate: `${date1}/${month1}/${year1}`,
            uom: row.uom !== "" ? `${row.quantity}#${row.uom}` : row.quantity,
          };
        });

    // Generate PDF
    doc.autoTable({
      theme: "grid",
      styles: { fontSize: 5 },
      // columns: columnsWithSerial,
      columns: columns.map((col) => ({ ...col, dataKey: col.field })),
      body: dataWithSerial,
    });

    doc.save("Asset Purchase List.pdf");
  };
  // Excel
  const fileName = "Asset Purchase List";


  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Asset Purchase List",
    pageStyle: "print",
  });

  // serial no for listing items
  const addSerialNumber = (datas) => {
    // const itemsWithSerialNumber = datas?.map((item, index) => ({
    //   ...item,
    //   serialNumber: index + 1,
    //   id: item._id,
    //   uom: item.uom !== "" ? `${item.quantity}#${item.uom}` : item.quantity,
    //   billdate: moment(item.billdate).format("DD/MM/YYYY"),
    //   purchasedate:
    //     item.purchasedate != ""
    //       ? moment(item.purchasedate).format("DD/MM/YYYY")
    //       : "",
    // }));
    setItems(datas);

  };

  useEffect(() => {
    addSerialNumber(stock);
  }, [stock]);



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
    fetchCompanyDropdowns();
    // fetchAccount();
    // fetchAsset();
    fetchAssetType();
    fetchteams();
    fetchEmployee();
    fetchVendor();
    fetchMaterialAll();
    fetchAssetTypeDropdowns();
  }, []);
  useEffect(() => {
    fetchVendor();
  }, [vendorAuto]);
  // useEffect(() => {
  //   fetchStock();
  // }, [isEditOpen, stockmasteredit]);

  useEffect(() => {
    fetchAsset();
  }, [selectedProducthead, openviewalertAsset]);

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
      width: 100,
      hide: !columnVisibility.company,
      headerClassName: "bold-header",
      pinned: "left",
      lockPinned: true,
    },
    {
      field: "branch",
      headerName: "Branch",
      flex: 0,
      width: 100,
      hide: !columnVisibility.branch,
      headerClassName: "bold-header",
      pinned: "left",
      lockPinned: true,
    },
    {
      field: "unit",
      headerName: "Unit",
      flex: 0,
      width: 100,
      hide: !columnVisibility.unit,
      headerClassName: "bold-header",
    },
    {
      field: "floor",
      headerName: "Floor",
      flex: 0,
      width: 100,
      hide: !columnVisibility.floor,
      headerClassName: "bold-header",
    },
    {
      field: "area",
      headerName: "Area",
      flex: 0,
      width: 100,
      hide: !columnVisibility.area,
      headerClassName: "bold-header",
    },
    {
      field: "location",
      headerName: "Location",
      flex: 0,
      width: 100,
      hide: !columnVisibility.location,
      headerClassName: "bold-header",
    },
    {
      field: "requestmode",
      headerName: "Request Mode For",
      flex: 0,
      width: 100,
      hide: !columnVisibility.requestmode,
      headerClassName: "bold-header",
    },
    {
      field: "vendorgroup",
      headerName: "Vendor Group",
      flex: 0,
      width: 180,
      minHeight: "40px",
      hide: !columnVisibility.vendorgroup,
    },

    {
      field: "vendor",
      headerName: "Dealers Name",
      flex: 0,
      width: 120,
      hide: !columnVisibility.vendorname,
      headerClassName: "bold-header",
    },
    {
      field: "gstno",
      headerName: "Gst No",
      flex: 0,
      width: 120,
      hide: !columnVisibility.gstno,
      headerClassName: "bold-header",
    },
    {
      field: "billno",
      headerName: "Bill Number",
      flex: 0,
      width: 120,
      hide: !columnVisibility.billno,
      headerClassName: "bold-header",
    },
    {
      field: "assettype",
      headerName: "Asset Type",
      flex: 0,
      width: 150,
      hide: !columnVisibility.assettype,
      headerClassName: "bold-header",
    },
    {
      field: "producthead",
      headerName: "Asset Head",
      flex: 0,
      width: 150,
      hide: !columnVisibility.producthead,
      headerClassName: "bold-header",
    },
    {
      field: "productname",
      headerName: "Material",
      flex: 0,
      width: 200,
      hide: !columnVisibility.productname,
      headerClassName: "bold-header",
    },
    // { field: "material", headerName: "Material", flex: 0, width: 150, hide: !columnVisibility.material, headerClassName: "bold-header" },
    {
      field: "component",
      headerName: "Component",
      flex: 0,
      width: 150,
      hide: !columnVisibility.component,
      headerClassName: "bold-header",
    },
    {
      field: "warranty",
      headerName: "Warranty",
      flex: 0,
      width: 100,
      hide: !columnVisibility.warranty,
      headerClassName: "bold-header",
    },
    {
      field: "purchasedate",
      headerName: "Purchasedate",
      flex: 0,
      width: 150,
      hide: !columnVisibility.purchasedate,
      headerClassName: "bold-header",
    },
    {
      field: "productdetails",
      headerName: "Product Details",
      flex: 0,
      width: 130,
      hide: !columnVisibility.productdetails,
      headerClassName: "bold-header",
    },
    {
      field: "warrantydetails",
      headerName: "Warranty Details",
      flex: 0,
      width: 130,
      hide: !columnVisibility.warrantydetails,
      headerClassName: "bold-header",
    },

    {
      field: "quantity",
      headerName: "Quantity",
      flex: 0,
      width: 80,
      hide: !columnVisibility.quantity,
      headerClassName: "bold-header",
    },
    {
      field: "uom",
      headerName: "Quantity & UOM",
      flex: 0,
      width: 100,
      hide: !columnVisibility.uom,
      headerClassName: "bold-header",
    },
    {
      field: "rate",
      headerName: "Rate",
      flex: 0,
      width: 100,
      hide: !columnVisibility.rate,
      headerClassName: "bold-header",
    },
    {
      field: "billdate",
      headerName: "Bill Date",
      flex: 0,
      width: 120,
      hide: !columnVisibility.billdate,
      headerClassName: "bold-header",
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 0,
      width: 250,
      minHeight: "40px !important",
      sortable: false,
      hide: !columnVisibility.actions,
      headerClassName: "bold-header",
      cellRenderer: (params) => (
        <Grid sx={{ display: "flex" }}>
          {isUserRoleCompare?.includes("estockpurchase") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {

                getCode(params.data.id);
              }}
            >
              <EditOutlinedIcon sx={buttonStyles.buttonedit} />
            </Button>
          )}

          {isUserRoleCompare?.includes("dstockpurchase") && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.data.id);
              }}
            >
              <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />
            </Button>
          )}
          {isUserRoleCompare?.includes("vstockpurchase") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getviewCode(params.data.id);
              }}
            >
              <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />
            </Button>
          )}
          {isUserRoleCompare?.includes("istockpurchase") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                // handleClickOpeninfo();
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
  const filteredSelectedColumn = columnDataTable.filter(data => data.field !== 'checkbox' && data.field !== "actions" && data.field !== "serialNumber");


  const rowDataTable = items.map((item, index) => {
    return {
      id: item._id,
      serialNumber: item.serialNumber,
      company: item.company,
      branch: item.branch,
      unit: item.unit,
      floor: item.floor,
      area: item.area,
      location: item.location,
      requestmode: item.requestmode,
      vendor: item.vendor,
      vendorgroup: item.vendorgroup,
      producthead: item.producthead,
      assettype: item.assettype,
      productname: item.productname,
      component: item.component,
      gstno: item.gstno,
      billno: item.billno,
      asset: item.asset,
      assettype: item.assettype,
      productdetails: item.productdetails,
      warrantydetails: item.warrantydetails,
      quantity: item.quantity,
      rate: item.rate,
      uom: item.uom,
      billdate: item.billdate,
      purchasedate: item.purchasedate,

      material: item.material,
      warranty: item.warranty,
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
  // Function to filter columns based on search query
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
        onClick={handleCloseManageColumns1}
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
              {" "}
              Hide All
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Box>
  );


  //TODOS
  const [todos, setTodos] = useState([]);
  const [todosEdit, setTodosEdit] = useState([]);
  const handleAddInput = (e) => {
    let specificationItem = Specification.find(
      (item) => e === item.categoryname
    );
    let filtersub = specificationItem?.subcategoryname;
    let result;
    if (filtersub.length > 0) {
      result = filtersub?.map((sub, index) => ({
        subname: sub.subcomponent,
        sub: `${index + 1}.${sub.subcomponent}`,
        subcomponentcheck: false,
        type: sub.type ? "Choose Type" : "",
        model: sub.model ? "Choose Model" : "",
        size: sub.size ? "Choose Size" : "",
        variant: sub.variant ? "Choose variant" : "",
        brand: sub.brand ? "Choose Brand" : "",
        serial: sub.serial ? "" : undefined,
        other: sub.other ? "" : undefined,
        capacity: sub.capacity ? "Choose Capacity" : "",
        hdmiport: sub.hdmiport ? "" : undefined,
        vgaport: sub.vgaport ? "" : undefined,
        dpport: sub.dpport ? "" : undefined,
        usbport: sub.usbport ? "" : undefined,
        paneltypescreen: sub.paneltypescreen ? "Choose Panel Type" : "",
        resolution: sub.resolution ? "Choose Screen Resolution" : "",
        connectivity: sub.connectivity ? "Choose Connectivity" : "",
        daterate: sub.daterate ? "Choose Data Rate" : "",
        compatibledevice: sub.compatibledevice
          ? "Choose Compatible Device"
          : "",
        outputpower: sub.outputpower ? "Choose Output Power" : "",
        collingfancount: sub.collingfancount ? "Choose Cooling Fan Count" : "",
        clockspeed: sub.clockspeed ? "Choose Clock Speed" : "",
        core: sub.core ? "Choose Core" : "",
        speed: sub.speed ? "Choose Speed" : "",
        frequency: sub.frequency ? "Choose Frequency" : "",
        output: sub.output ? "Choose Output" : "",
        ethernetports: sub.ethernetports ? "Choose Ethernet Ports" : "",
        distance: sub.distance ? "Choose Distance" : "",
        lengthname: sub.lengthname ? "Choose Length" : "",
        slot: sub.slot ? "Choose Slot" : "",
        noofchannels: sub.noofchannels ? "Choose No. Of Channels" : "",
        colours: sub.colours ? "Choose Colour" : "",

        warranty: stockmaster.warranty ? stockmaster.warranty : undefined,
        estimation: stockmaster.estimation ? stockmaster.estimation : undefined,
        estimationtime: stockmaster.estimationtime
          ? stockmaster.estimationtime
          : undefined,
        warrantycalculation: stockmaster.warrantycalculation
          ? stockmaster.warrantycalculation
          : undefined,
        purchasedate: selectedPurchaseDate ? selectedPurchaseDate : undefined,

        vendor: vendorNew ? vendorNew : undefined,
        vendorgroup: vendorGroup ? vendorGroup : undefined,

        phonenumber: vendorgetid.phonenumber
          ? vendorgetid.phonenumber
          : undefined,
        vendorid: vendornameid ? vendornameid : undefined,
        address: vendorgetid.address ? vendorgetid.address : undefined,
      }));
    } else if (
      filtersub.length === 0 &&
      !(
        !specificationItem.type &&
        !specificationItem.model &&
        !specificationItem.size &&
        !specificationItem.variant &&
        !specificationItem.brand &&
        !specificationItem.serial &&
        !specificationItem.other &&
        !specificationItem.capacity &&
        !specificationItem.hdmiport &&
        !specificationItem.vgaport &&
        !specificationItem.dpport &&
        !specificationItem.usbport
      )
    ) {
      result = [
        {
          // sub: `${index + 1}.${sub.subcomponent}`,
          subcomponentcheck: false,
          type: specificationItem.type ? "Choose Type" : "",
          model: specificationItem.model ? "Choose Model" : "",
          size: specificationItem.size ? "Choose Size" : "",
          variant: specificationItem.variant ? "Choose variant" : "",
          brand: specificationItem.brand ? "Choose Brand" : "",
          serial: specificationItem.serial ? "" : undefined,
          other: specificationItem.other ? "" : undefined,
          capacity: specificationItem.capacity ? "Choose Capacity" : "",
          hdmiport: specificationItem.hdmiport ? "" : undefined,
          vgaport: specificationItem.vgaport ? "" : undefined,
          dpport: specificationItem.dpport ? "" : undefined,
          usbport: specificationItem.usbport ? "" : undefined,
          paneltypescreen: specificationItem.paneltypescreen
            ? "Choose Panel Type"
            : "",
          resolution: specificationItem.resolution
            ? "Choose Screen Resolution"
            : "",
          connectivity: specificationItem.connectivity
            ? "Choose Connectivity"
            : "",
          daterate: specificationItem.daterate ? "Choose Data Rate" : "",
          compatibledevice: specificationItem.compatibledevice
            ? "Choose Compatible Device"
            : "",
          outputpower: specificationItem.outputpower
            ? "Choose Output Power"
            : "",
          collingfancount: specificationItem.collingfancount
            ? "Choose Cooling Fan Count"
            : "",
          clockspeed: specificationItem.clockspeed ? "Choose Clock Speed" : "",
          core: specificationItem.core ? "Choose Core" : "",
          speed: specificationItem.speed ? "Choose Speed" : "",
          frequency: specificationItem.frequency ? "Choose Frequency" : "",
          output: specificationItem.output ? "Choose Output" : "",
          ethernetports: specificationItem.ethernetports
            ? "Choose Ethernet Ports"
            : "",
          distance: specificationItem.distance ? "Choose Distance" : "",
          lengthname: specificationItem.lengthname ? "Choose Length" : "",
          slot: specificationItem.slot ? "Choose Slot" : "",
          noofchannels: specificationItem.noofchannels
            ? "Choose No. Of Channels"
            : "",
          colours: specificationItem.colours ? "Choose Colour" : "",

          warranty: stockmaster.warranty ? stockmaster.warranty : undefined,
          estimation: stockmaster.estimation
            ? stockmaster.estimation
            : undefined,
          estimationtime: stockmaster.estimationtime
            ? stockmaster.estimationtime
            : undefined,
          warrantycalculation: stockmaster.warrantycalculation
            ? stockmaster.warrantycalculation
            : undefined,
          purchasedate: selectedPurchaseDate ? selectedPurchaseDate : undefined,

          vendor: vendorNew ? vendorNew : undefined,
          vendorgroup: vendorGroup ? vendorGroup : undefined,

          phonenumber: vendorgetid.phonenumber
            ? vendorgetid.phonenumber
            : undefined,
          vendorid: vendornameid ? vendornameid : undefined,
          address: vendorgetid.address ? vendorgetid.address : undefined,
        },
      ];
    }

    setTodos(result);
    setVendoroptInd(new Array(result?.length).fill(vendorOpt));
  };

  const handleChange = async (index, name, value, id) => {
    const updatedTodos = [...todos];
    updatedTodos[index] = {
      ...updatedTodos[index],
      [name]: value,
    };
    setTodos(updatedTodos);

    // Calculate expiry date for the updated todo
    const updatedTodo = updatedTodos[index];
    if (
      updatedTodo.estimationtime !== "" &&
      updatedTodo.purchasedate &&
      updatedTodo.estimation !== ""
    ) {
      const currentDate = new Date(updatedTodo.purchasedate);
      let expiryDate = new Date(currentDate);

      if (updatedTodo.estimationtime === "Days") {
        expiryDate.setDate(
          currentDate.getDate() + parseInt(updatedTodo.estimation)
        );
      } else if (updatedTodo.estimationtime === "Month") {
        expiryDate.setMonth(
          currentDate.getMonth() + parseInt(updatedTodo.estimation)
        );
      } else if (updatedTodo.estimationtime === "Year") {
        expiryDate.setFullYear(
          currentDate.getFullYear() + parseInt(updatedTodo.estimation)
        );
      }

      const formattedExpiryDate = formatDateString(expiryDate);
      let formattedempty = formattedExpiryDate.includes("NaN-NaN-NaN")
        ? ""
        : formattedExpiryDate;

      // Update the calculated expiry date in the todo
      const updatedTodosCopy = [...updatedTodos];
      updatedTodosCopy[index] = {
        ...updatedTodosCopy[index],
        warrantycalculation: formattedempty,
        vendorid: vendornameid,
      };
      setTodos(updatedTodosCopy);
    }

    const updatedTodovendor = updatedTodos[index];
    if (updatedTodovendor.vendorname !== "" && id) {
      // Fix: Add await here to wait for the result of the axios call
      const res = await axios.get(`${SERVICE.SINGLE_VENDORDETAILS}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      // Update the todo with vendor details
      const updatedTodosCopy = [...updatedTodos];
      updatedTodosCopy[index] = {
        ...updatedTodosCopy[index],
        address: res?.data?.svendordetails.address,
        phonenumber: res?.data?.svendordetails.phonenumber,
      };
      setTodos(updatedTodosCopy);
    }
  };
  const handleDelete = (index) => {
    const updatedTodos = [...todos];
    updatedTodos.splice(index, 1);
    setTodos(updatedTodos);
    setStockmaster({
      ...stockmaster,
      component: "Please Select Component",
    })
  };


  //todo edit

  const handleAddInputEdit = (e) => {
    let specificationItem = Specificationedit.find(
      (item) => e === item.categoryname
    );
    let filtersub = specificationItem?.subcategoryname;
    let result;
    if (filtersub.length > 0) {
      result = filtersub?.map((sub, index) => ({
        sub: `${index + 1}.${sub.subcomponent}`,
        subname: sub.subcomponent,
        subcomponentcheck: false,
        type: sub.type ? "Choose Type" : "",
        model: sub.model ? "Choose Model" : "",
        size: sub.size ? "Choose Size" : "",
        variant: sub.variant ? "Choose variant" : "",
        brand: sub.brand ? "Choose Brand" : "",
        serial: sub.serial ? "" : undefined,
        other: sub.other ? "" : undefined,
        capacity: sub.capacity ? "Choose Capacity" : "",
        hdmiport: sub.hdmiport ? "" : undefined,
        vgaport: sub.vgaport ? "" : undefined,
        dpport: sub.dpport ? "" : undefined,
        usbport: sub.usbport ? "" : undefined,
        paneltypescreen: sub.paneltypescreen ? "Choose Panel Type" : "",
        resolution: sub.resolution ? "Choose Screen Resolution" : "",
        connectivity: sub.connectivity ? "Choose Connectivity" : "",
        daterate: sub.daterate ? "Choose Data Rate" : "",
        compatibledevice: sub.compatibledevice
          ? "Choose Compatible Device"
          : "",
        outputpower: sub.outputpower ? "Choose Output Power" : "",
        collingfancount: sub.collingfancount ? "Choose Cooling Fan Count" : "",
        clockspeed: sub.clockspeed ? "Choose Clock Speed" : "",
        core: sub.core ? "Choose Core" : "",
        speed: sub.speed ? "Choose Speed" : "",
        frequency: sub.frequency ? "Choose Frequency" : "",
        output: sub.output ? "Choose Output" : "",
        ethernetports: sub.ethernetports ? "Choose Ethernet Ports" : "",
        distance: sub.distance ? "Choose Distance" : "",
        lengthname: sub.lengthname ? "Choose Length" : "",
        slot: sub.slot ? "Choose Slot" : "",
        noofchannels: sub.noofchannels ? "Choose No. Of Channels" : "",
        colours: sub.colours ? "Choose Colour" : "",

        warranty: stockmaster.warranty ? stockmaster.warranty : undefined,
        estimation: stockmaster.estimation ? stockmaster.estimation : undefined,
        estimationtime: stockmaster.estimationtime
          ? stockmaster.estimationtime
          : undefined,
        warrantycalculation: stockmaster.warrantycalculation
          ? stockmaster.warrantycalculation
          : undefined,
        purchasedate: selectedPurchaseDate ? selectedPurchaseDate : undefined,
        vendor: stockmaster.vendorname ? stockmaster.vendorname : undefined,
        phonenumber: vendorgetid.phonenumber
          ? vendorgetid.phonenumber
          : undefined,
        vendorid: vendornameid ? vendornameid : undefined,
        address: vendorgetid.address ? vendorgetid.address : undefined,
      }));
    } else if (
      filtersub.length === 0 &&
      !(
        !specificationItem.type &&
        !specificationItem.model &&
        !specificationItem.size &&
        !specificationItem.variant &&
        !specificationItem.brand &&
        !specificationItem.serial &&
        !specificationItem.other &&
        !specificationItem.capacity &&
        !specificationItem.hdmiport &&
        !specificationItem.vgaport &&
        !specificationItem.dpport &&
        !specificationItem.usbport
      )
    ) {
      result = [
        {
          // sub: `${index + 1}.${sub.subcomponent}`,
          subcomponentcheck: false,
          type: specificationItem.type ? "Choose Type" : "",
          model: specificationItem.model ? "Choose Model" : "",
          size: specificationItem.size ? "Choose Size" : "",
          variant: specificationItem.variant ? "Choose variant" : "",
          brand: specificationItem.brand ? "Choose Brand" : "",
          serial: specificationItem.serial ? "" : undefined,
          other: specificationItem.other ? "" : undefined,
          capacity: specificationItem.capacity ? "Choose Capacity" : "",
          hdmiport: specificationItem.hdmiport ? "" : undefined,
          vgaport: specificationItem.vgaport ? "" : undefined,
          dpport: specificationItem.dpport ? "" : undefined,
          usbport: specificationItem.usbport ? "" : undefined,
          paneltypescreen: specificationItem.paneltypescreen
            ? "Choose Panel Type"
            : "",
          resolution: specificationItem.resolution
            ? "Choose Screen Resolution"
            : "",
          connectivity: specificationItem.connectivity
            ? "Choose Connectivity"
            : "",
          daterate: specificationItem.daterate ? "Choose Data Rate" : "",
          compatibledevice: specificationItem.compatibledevice
            ? "Choose Compatible Device"
            : "",
          outputpower: specificationItem.outputpower
            ? "Choose Output Power"
            : "",
          collingfancount: specificationItem.collingfancount
            ? "Choose Cooling Fan Count"
            : "",
          clockspeed: specificationItem.clockspeed ? "Choose Clock Speed" : "",
          core: specificationItem.core ? "Choose Core" : "",
          speed: specificationItem.speed ? "Choose Speed" : "",
          frequency: specificationItem.frequency ? "Choose Frequency" : "",
          output: specificationItem.output ? "Choose Output" : "",
          ethernetports: specificationItem.ethernetports
            ? "Choose Ethernet Ports"
            : "",
          distance: specificationItem.distance ? "Choose Distance" : "",
          lengthname: specificationItem.lengthname ? "Choose Length" : "",
          slot: specificationItem.slot ? "Choose Slot" : "",
          noofchannels: specificationItem.noofchannels
            ? "Choose No. Of Channels"
            : "",
          colours: specificationItem.colours ? "Choose Colour" : "",

          warranty: stockmaster.warranty ? stockmaster.warranty : undefined,
          estimation: stockmaster.estimation
            ? stockmaster.estimation
            : undefined,
          estimationtime: stockmaster.estimationtime
            ? stockmaster.estimationtime
            : undefined,
          warrantycalculation: stockmaster.warrantycalculation
            ? stockmaster.warrantycalculation
            : undefined,
          purchasedate: selectedPurchaseDate ? selectedPurchaseDate : undefined,
          vendor: stockmaster.vendorname ? stockmaster.vendorname : undefined,
          phonenumber: vendorgetid.phonenumber
            ? vendorgetid.phonenumber
            : undefined,
          vendorid: vendornameid ? vendornameid : undefined,
          address: vendorgetid.address ? vendorgetid.address : undefined,
        },
      ];
    }

    setTodosEdit(result);
  };

  const handleChangeEdit = async (index, name, value, id) => {
    const updatedTodos = [...todosEdit];
    updatedTodos[index] = {
      ...updatedTodos[index],
      [name]: value,
    };
    setTodosEdit(updatedTodos);

    // Calculate expiry date for the updated todo
    const updatedTodo = updatedTodos[index];
    if (
      updatedTodo.estimationtime !== "" &&
      updatedTodo.purchasedate &&
      updatedTodo.estimation !== ""
    ) {
      const currentDate = new Date(updatedTodo.purchasedate);
      let expiryDate = new Date(currentDate);

      if (updatedTodo.estimationtime === "Days") {
        expiryDate.setDate(
          currentDate.getDate() + parseInt(updatedTodo.estimation)
        );
      } else if (updatedTodo.estimationtime === "Month") {
        expiryDate.setMonth(
          currentDate.getMonth() + parseInt(updatedTodo.estimation)
        );
      } else if (updatedTodo.estimationtime === "Year") {
        expiryDate.setFullYear(
          currentDate.getFullYear() + parseInt(updatedTodo.estimation)
        );
      }

      const formattedExpiryDate = formatDateString(expiryDate);
      let formattedempty = formattedExpiryDate.includes("NaN-NaN-NaN")
        ? ""
        : formattedExpiryDate;

      // Update the calculated expiry date in the todo
      const updatedTodosCopy = [...updatedTodos];
      updatedTodosCopy[index] = {
        ...updatedTodosCopy[index],
        warrantycalculation: formattedempty,
      };
      setTodosEdit(updatedTodosCopy);
    }

    const updatedTodovendor = updatedTodos[index];
    if (updatedTodovendor.vendorname !== "" && id) {
      // Fix: Add await here to wait for the result of the axios call
      const res = await axios.get(`${SERVICE.SINGLE_VENDORDETAILS}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      // Update the todo with vendor details
      const updatedTodosCopy = [...updatedTodos];
      updatedTodosCopy[index] = {
        ...updatedTodosCopy[index],
        address: res?.data?.svendordetails.address,
        phonenumber: res?.data?.svendordetails.phonenumber,
      };
      setTodosEdit(updatedTodosCopy);
    }
  };
  const handleDeleteEdit = (index) => {
    const updatedTodos = [...todosEdit];
    updatedTodos?.splice(index, 1);
    setTodosEdit(updatedTodos);
  };

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
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = fileFormat === "xl" ? ".xlsx" : ".csv";
  const exportToCSV = (csvData, fileName) => {
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  const handleExportXL = (isfilter) => {
    if (isfilter === "filtered") {
      exportToCSV(
        rowDataTable?.map((t, index) => ({
          Sno: index + 1,
          Company: t.company,
          Branch: t.branch,
          Unit: t.unit,
          Floor: t.floor,
          Area: t.area,
          Location: t.location,
          "Request Mode For": t.requestmode,
          "Vendor Group": t.vendorgroup,
          Vendor: t.vendor,
          "Gst No": t.gstno,
          "Bill Number": t.billno,
          "Asset Head": t.producthead,
          Material: t.productname,
          Component: t.component,
          Warranty: t.warrantydetails,
          Purchasedate: t.purchasedate,
          "Product Details": t.productdetails,
          "Warranty Details": t.warrantydetails,
          Quantity: t.quantity,
          "Quantity & UOM": t.uom,
          Rate: t.rate,
          "Bill Date": t.billdate,
        })),
        fileName
      );
    } else if (isfilter === "overall") {
      exportToCSV(
        stock.map((t, index) => ({
          Sno: index + 1,
          Company: t.company,
          Branch: t.branch,
          Unit: t.unit,
          Floor: t.floor,
          Area: t.area,
          Location: t.location,
          "Request Mode For": t.requestmode,
          "Vendor Group": t.vendorgroup,
          Vendor: t.vendor,
          "Gst No": t.gstno,
          "Bill Number": t.billno,
          "Asset Head": t.producthead,
          Material: t.productname,
          Component: t.component,
          Warranty: t.warrantydetails,
          Purchasedate:
            t.purchasedate != ""
              ? moment(t.purchasedate).format("DD/MM/YYYY")
              : "",
          "Product Details": t.productdetails,
          "Warranty Details": t.warrantydetails,
          Quantity: t.quantity,
          "Quantity & UOM":
            t.uom !== "" ? `${t.quantity}#${t.uom}` : t.quantity,
          Rate: t.rate,
          "Bill Date": moment(t.billdate).format("DD/MM/YYYY"),
        })),
        fileName
      );
    }

    setIsFilterOpen(false);
  };

  const fetchEbSort = async () => {
    try {
      let res_employee = await axios.post(SERVICE.OVERALLSORT_STOCK, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        page: Number(page),
        pageSize: Number(pageSize),
        searchQuery: searchQuery,
      });

      const ans =
        res_employee?.data?.result?.length > 0
          ? res_employee?.data?.result
          : [];
      const itemsWithSerialNumber = ans?.map((item, index) => ({
        ...item,
        serialNumber: (page - 1) * pageSize + index + 1,
        // serialNumber: index + 1,
      }));
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };


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
      // let res_project = await axios.get(SERVICE.STOCKPURCHASE, {
      let res_employee = await axios.post(SERVICE.STOCK_ACCESS, queryParams, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      // let filteredData = res_project?.data?.stock
      //   .filter((data) => {
      //     return data.requestmode === "Asset Material";
      //   });
      const ans = res_employee?.data?.result?.length > 0 ? res_employee?.data?.result : []

      let res_project_1 = await axios.get(SERVICE.ALL_VOMMASTERNAME, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let codeValues = res_project_1?.data?.vommaster.map((data) => ({
        name: data.name,
        code: data.code,
      }));
      // setuomcodes(codeValues);

      let setData = ans.map((item) => {
        // Find the corresponding item in codeValues array
        const matchingItem = codeValues.find(
          (item1) => item.uom === item1.name
        );

        // If matchingItem is found, return item with uomcode set to its code, otherwise set it to an empty string
        return matchingItem
          ? { ...item, uomcode: matchingItem.code }
          : { ...item, uomcode: "" };
      });

      const itemsWithSerialNumber = setData?.map((item, index) => ({
        ...item,
        serialNumber: (page - 1) * pageSize + index + 1,
        id: item._id,
        uom: item.uom !== "" ? `${item.quantity}#${item.uom}` : item.quantity,
        billdate: moment(item.billdate).format("DD/MM/YYYY"),
        purchasedate:
          item.purchasedate != ""
            ? moment(item.purchasedate).format("DD/MM/YYYY")
            : "",
      }));

      setStock(itemsWithSerialNumber);

      setOverallFilterdata(res_employee?.data?.totalProjectsData?.length > 0 ?
        res_employee?.data?.totalProjectsData?.map((item, index) => {
          return {
            ...item,
            serialNumber: (page - 1) * pageSize + index + 1,


          }
        }

        ) : []
      );



      setTotalProjects(ans?.length > 0 ? res_employee?.data?.totalProjects : 0);
      setTotalPages(ans?.length > 0 ? res_employee?.data?.totalPages : 0);
      setPageSize((data) => { return ans?.length > 0 ? data : 10 });
      setPage((data) => { return ans?.length > 0 ? data : 1 });

      if (stockmasteredit && stockmasteredit._id) {
        setStockEdit(
          ans.filter(
            (item) => item._id !== stockmasteredit._id
          )
        );
      }
      setProjectCheck(false);

    }
    catch (err) { setProjectCheck(false); handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };


  return (
    <Box>
      <Headtitle title={"Purchase Details"} />
      {/* ****** Header Content ****** */}

      {/* <Typography sx={userStyle.HeaderText}>Purchase Details</Typography> */}
      <PageHeading
        title="Purchase Details"
        modulename="Asset"
        submodulename="Stock"
        mainpagename="Stock Purchase"
        subpagename=""
        subsubpagename=""
      />

      {isUserRoleCompare?.includes("astockpurchase") && (
        <>
          <Box sx={userStyle.selectcontainer}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>
                    Add Purchase Details
                  </Typography>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Company<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                      // options={companys}
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
                        // setBranchs([]);
                        setUnits([]);
                        setFloors([]);
                        setAreas([]);
                        setLocations([{ label: "ALL", value: "ALL" }]);
                        fetchBranchDropdowns(e);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Branch<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                      // options={branchs}
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
                      value={{
                        label: stockmaster.branch,
                        value: stockmaster.branch,
                      }}
                      onChange={(e) => {
                        setNewcheckBranch(e.value);
                        setStockmaster({
                          ...stockmaster,
                          branch: e.value,
                          unit: "Please Select Unit",
                          floor: "Please Select Floor",
                          area: "Please Select Area",
                          location: "Please Select Location",
                        });
                        // setUnits([]);
                        // setFloors([]);
                        setAreas([]);
                        setLocations([{ label: "ALL", value: "ALL" }]);
                        fetchUnits(e);
                        fetchFloor(e);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Unit<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                      // options={units}
                      options={accessbranch?.filter(
                        (comp) =>
                          stockmaster.company === comp.company && stockmaster.branch === comp.branch
                      )?.map(data => ({
                        label: data.unit,
                        value: data.unit,
                      })).filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                      styles={colourStyles}
                      value={{
                        label: stockmaster.unit,
                        value: stockmaster.unit,
                      }}
                      onChange={(e) => {
                        setStockmaster({
                          ...stockmaster,
                          unit: e.value,
                          location: "Please Select Location",
                        });
                        // setLocations([{ label: "ALL", value: "ALL" }]);
                        // setAreas([]);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Floor<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                      options={floors}
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
                        });
                        // setAreas([]);
                        setLocations([{ label: "ALL", value: "ALL" }]);
                        fetchArea(e.value);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Area<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                      options={areas}
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
                        setLocations([{ label: "ALL", value: "ALL" }]);
                        fetchLocation(e.value);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Location<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                      options={locations}
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
                    <Typography>Warranty</Typography>
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
                          <Typography>Warranty Time</Typography>
                          <FormControl fullWidth size="small">
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Enter Time"
                              value={stockmaster.estimation}
                              onChange={(e) => handleChangephonenumber(e)}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={6} xs={6} sm={6}>
                          <Typography>Estimation</Typography>
                          <Select
                            fullWidth
                            labelId="demo-select-small"
                            id="demo-select-small"
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
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Purchase date </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="date"
                      value={selectedPurchaseDate}
                      // onChange={(e) => {
                      //   setStockmaster({ ...stockmaster, purchasedate: e.target.value });
                      // }}
                      onChange={handlePurchaseDateChange}
                    />
                  </FormControl>
                </Grid>
                {stockmaster.warranty === "Yes" && (
                  <>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Expiry Date </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder=""
                          value={stockmaster.warrantycalculation}
                        // onChange={(e) => {
                        //   setStockmaster({ ...stockmaster, warrantyCalculation: e.target.value });
                        // }}
                        />
                      </FormControl>
                    </Grid>
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
                        setVendorNew("Choose Vendor");
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
                      options={vendorOpt}
                      styles={colourStyles}
                      value={{ label: vendorNew, value: vendorNew }}
                      onChange={(e) => {
                        setVendorNew(e.value);

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
                      marginTop: "23px",
                      marginLeft: "-10px",
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
                    <Typography>
                      GST No <b style={{ color: "red" }}>*</b>{" "}
                    </Typography>
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
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Request Mode For<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                      options={requestModeOptions}
                      styles={colourStyles}
                      value={{
                        label: stockmaster.requestmode,
                        value: stockmaster.requestmode,
                      }}
                      onChange={(e) => {
                        // fetchAsset();
                        setStockmaster({
                          ...stockmaster,
                          requestmode: e.value,
                          productname: "Please Select Material",
                          component: "Please Select Component",

                          assettype: "",
                          asset: "",
                          productdetails: "",

                          uom: "Please Select UOM",
                          quantity: "",

                          files: "",
                          warrantyfiles: "",

                          // warranty: "Yes",
                          // warrantycalculation: "",
                          // estimation: "",
                          // estimationtime: "Days",
                          purchasedate: "",

                          addedby: "",
                          updatedby: "",

                          stockcategory: "Please Select Stock Category",
                          stocksubcategory: "Please Select Stock Sub Category",
                          uomnew: "",
                          quantitynew: "",
                          materialnew: "Please Select Material",
                          productdetailsnew: "",
                        });
                        if (e.value === "Stock Material") {
                          setIsStockMaterial(true);
                        } else {
                          setIsStockMaterial(false);
                        }
                        setTodos([]);
                        setSubcategoryOption([]);
                        setMaterialoptNew([]);
                      }}
                    />
                  </FormControl>
                </Grid>
                {isStockMaterial ? (
                  <>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Stock Category<b style={{ color: "red" }}>*</b>{" "}
                        </Typography>
                        <Selects
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
                              stocksubcategory:
                                "Please Select Stock Sub Category",
                              materialnew: "Please Select Material",
                              uomnew: "",
                            });
                            setMaterialoptNew([]);
                            fetchSubcategoryBased(e);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Stock Sub-category<b style={{ color: "red" }}>*</b>{" "}
                        </Typography>
                        <Selects
                          options={subcategoryOpt}
                          styles={colourStyles}
                          value={{
                            label: stockmaster.stocksubcategory,
                            value: stockmaster.stocksubcategory,
                          }}
                          onChange={(e) => {
                            setStockmaster({
                              ...stockmaster,
                              stocksubcategory: e.value,
                              materialnew: "Please Select Material",
                              uomnew: "",
                            });
                            fetchMaterialNew(e);
                          }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Material<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                          options={materialOptNew}
                          styles={colourStyles}
                          value={{
                            label: stockmaster.materialnew,
                            value: stockmaster.materialnew,
                          }}
                          onChange={(e) => {
                            fetchAsset();
                            setStockmaster({
                              ...stockmaster,
                              materialnew: e.value,
                            });

                            fetchVomMaster(e);
                            setTodos([]);
                            // fetchspecification(e);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          UOM<b style={{ color: "red" }}>*</b>{" "}
                        </Typography>
                        <OutlinedInput
                          readOnly={true}
                          value={stockmaster.uomnew}
                          onChange={(e) => { }}
                        />
                        {/* <Selects
                        options={uomOpt}
                        styles={colourStyles}
                        value={{
                          label: stockmaster.uomnew,
                          value: stockmaster.uomnew,
                        }}
                        onChange={(e) => {

                          setStockmaster({
                            ...stockmaster,
                            uomnew: e.value, materialnew: "Please Select Material"
                          });

                        }}
                      /> */}
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Qty<b style={{ color: "red" }}>*</b>{" "}
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="number"
                          sx={userStyle.input}
                          placeholder="Please Enter Quantity"
                          value={stockmaster.quantitynew}
                          onChange={(e) => {
                            setStockmaster({
                              ...stockmaster,
                              quantitynew:
                                e.target.value > 0 ? e.target.value : 0,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={2.5} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Product Details</Typography>
                        <TextareaAutosize
                          aria-label="minimum height"
                          minRows={2}
                          value={stockmaster.productdetailsnew}
                          placeholder="Please Enter Product Details"
                          onChange={(e) => {
                            setStockmaster({
                              ...stockmaster,
                              productdetailsnew: e.target.value,
                            });
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
                          marginTop: "23px",
                          marginLeft: "-10px",
                        }}
                        color="success"
                        onClick={() => {
                          handleStockArray();
                        }}
                      >
                        <FaPlus style={{ fontSize: "15px" }} />
                      </Button>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Material<b style={{ color: "red" }}>*</b></Typography>
                        <Selects
                          options={materialOpt}
                          styles={colourStyles}
                          value={{
                            label: stockmaster.productname,
                            value: stockmaster.productname,
                          }}
                          onChange={(e) => {
                            fetchAsset();
                            setStockmaster({
                              ...stockmaster,
                              productname: e.value,
                              assettype: e.assettype,
                              producthead: e.assethead,
                              component: "Please Select Component",
                            });

                            fetchspecification(e.value);
                            setTodos([]);
                          }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Asset Type</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={stockmaster.assettype}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Asset Head</Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          value={stockmaster.producthead}
                          readOnly
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={6} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Component<b style={{ color: "red" }}>*</b>
                        </Typography>
                        <Selects
                          options={Specification}
                          styles={colourStyles}
                          value={{
                            label: stockmaster.component,
                            value: stockmaster.component,
                          }}
                          onChange={(e) => {
                            setStockmaster({
                              ...stockmaster,
                              component: e.value,
                            });
                            setTodos([]);
                            handleAddInput(e.value);
                          }}
                        />
                      </FormControl>
                    </Grid>
                    {todos &&
                      todos.map((todo, index) => {
                        return (
                          <>
                            {todo.sub ? (
                              <Grid container key={index} spacing={1}>
                                <Grid item md={2} sm={2} xs={2} marginTop={2}>
                                  <Typography>{todo.sub}</Typography>
                                </Grid>
                                <Grid
                                  item
                                  md={10}
                                  sm={10}
                                  xs={10}
                                  marginTop={2}
                                >
                                  <Grid container key={index} spacing={1}>

                                    <>
                                      <Grid item md={3} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>


                                            <FormGroup>
                                              <FormControlLabel

                                                control={
                                                  <Switch
                                                    // color="success"
                                                    sx={{
                                                      "& .MuiSwitch-switchBase.Mui-checked": {
                                                        color: "green", // Thumb color when checked
                                                      },
                                                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                        backgroundColor: "green", // Track color when checked
                                                      },
                                                      "& .MuiSwitch-switchBase": {
                                                        color: "#ff0000a3", // Thumb color when not checked
                                                      },
                                                      "& .MuiSwitch-switchBase + .MuiSwitch-track": {
                                                        backgroundColor: "#ff0000a3", // Track color when not checked
                                                      },
                                                    }}
                                                    checked={todo.subcomponentcheck}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "subcomponentcheck",
                                                        e.target.checked
                                                      );
                                                    }}
                                                  />
                                                }
                                                label="Enable Subcomponent"
                                              />
                                            </FormGroup>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>

                                    {todo.subcomponentcheck === true && (
                                      <>
                                        {todo.type && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Type</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.type?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.type,
                                                        value: todo.type,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "type",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    disabled
                                                    size="small"
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      // color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenType();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.model && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Model</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.model?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.model,
                                                        value: todo.model,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "model",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>
                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    disabled
                                                    size="small"
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenModel();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}

                                        {todo.size && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Size</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.size?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.size,
                                                        value: todo.size,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "size",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>
                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenSize();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}

                                        {todo.variant && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Variants
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.variant?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.variant,
                                                        value: todo.variant,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "variant",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>
                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenVariant();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}

                                        {todo.brand && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    size="small"
                                                    fullWidth
                                                  >
                                                    <Typography>Brand</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.brand?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.brand,
                                                        value: todo.brand,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "brand",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>
                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenBrand();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}

                                        {todo.serial !== undefined && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container>
                                                <Grid
                                                  item
                                                  md={11.6}
                                                  sm={10}
                                                  xs={10}
                                                >
                                                  <Typography>Serial</Typography>

                                                  <OutlinedInput
                                                    fullWidth
                                                    type="text"
                                                    disabled={todo.subcomponentcheck === false}
                                                    size="small"
                                                    placeholder="Please Enter Serial"
                                                    value={todo.serial}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "serial",
                                                        e.target.value
                                                      );
                                                    }}
                                                  />
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}

                                        {todo.other !== undefined && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container>
                                                <Grid
                                                  item
                                                  md={11.6}
                                                  sm={10}
                                                  xs={10}
                                                >
                                                  <Typography>Others</Typography>

                                                  <OutlinedInput
                                                    fullWidth
                                                    type="text"
                                                    size="small"
                                                    disabled={todo.subcomponentcheck === false}
                                                    placeholder="Please Enter Other"
                                                    value={todo.other}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "other",
                                                        e.target.value
                                                      );
                                                    }}
                                                  />
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.capacity && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Capacity
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.capacity?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.capacity,
                                                        value: todo.capacity,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "capacity",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.hdmiport !== undefined && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container>
                                                <Grid
                                                  item
                                                  md={11.6}
                                                  sm={10}
                                                  xs={10}
                                                >
                                                  <Typography>HDMI Port</Typography>

                                                  <OutlinedInput
                                                    fullWidth
                                                    type="number"
                                                    size="small"
                                                    placeholder="Please Enter HDMI Port"
                                                    value={todo.hdmiport}
                                                    disabled={todo.subcomponentcheck === false}
                                                    // onChange={(e) => {
                                                    //   handleChange(index, "hdmiport", e.target.value);
                                                    // }}
                                                    onChange={(e) => {
                                                      const inputText =
                                                        e.target.value;
                                                      // Regex to allow only non-negative numbers
                                                      const validatedInput =
                                                        inputText.match(/^\d*$/);

                                                      const sanitizedInput =
                                                        validatedInput !== null
                                                          ? validatedInput[0]
                                                          : "0";
                                                      handleChange(
                                                        index,
                                                        "hdmiport",
                                                        sanitizedInput
                                                      );
                                                    }}
                                                  />
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.vgaport !== undefined && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container>
                                                <Grid
                                                  item
                                                  md={11.6}
                                                  sm={10}
                                                  xs={10}
                                                >
                                                  <Typography>VGA Port</Typography>

                                                  <OutlinedInput
                                                    fullWidth
                                                    type="number"
                                                    size="small"
                                                    placeholder="Please Enter VGA Port"
                                                    value={todo.vgaport}
                                                    disabled={todo.subcomponentcheck === false}
                                                    onChange={(e) => {
                                                      const inputText =
                                                        e.target.value;
                                                      // Regex to allow only non-negative numbers
                                                      const validatedInput =
                                                        inputText.match(/^\d*$/);

                                                      const sanitizedInput =
                                                        validatedInput !== null
                                                          ? validatedInput[0]
                                                          : "0";
                                                      handleChange(
                                                        index,
                                                        "vgaport",
                                                        sanitizedInput
                                                      );
                                                    }}
                                                  />
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.dpport !== undefined && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container>
                                                <Grid
                                                  item
                                                  md={11.6}
                                                  sm={10}
                                                  xs={10}
                                                >
                                                  <Typography>DP Port</Typography>

                                                  <OutlinedInput
                                                    fullWidth
                                                    type="number"
                                                    size="small"
                                                    disabled={todo.subcomponentcheck === false}
                                                    placeholder="Please Enter DP Port"
                                                    value={todo.dpport}
                                                    onChange={(e) => {
                                                      const inputText =
                                                        e.target.value;
                                                      // Regex to allow only non-negative numbers
                                                      const validatedInput =
                                                        inputText.match(/^\d*$/);

                                                      const sanitizedInput =
                                                        validatedInput !== null
                                                          ? validatedInput[0]
                                                          : "0";
                                                      handleChange(
                                                        index,
                                                        "dpport",
                                                        sanitizedInput
                                                      );
                                                    }}
                                                  />
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.usbport !== undefined && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container>
                                                <Grid
                                                  item
                                                  md={11.6}
                                                  sm={10}
                                                  xs={10}
                                                >
                                                  <Typography>USB Port</Typography>

                                                  <OutlinedInput
                                                    fullWidth
                                                    type="number"
                                                    size="small"
                                                    placeholder="Please Enter USB Port"
                                                    value={todo.usbport}
                                                    disabled={todo.subcomponentcheck === false}
                                                    onChange={(e) => {
                                                      const inputText =
                                                        e.target.value;
                                                      // Regex to allow only non-negative numbers
                                                      const validatedInput =
                                                        inputText.match(/^\d*$/);

                                                      const sanitizedInput =
                                                        validatedInput !== null
                                                          ? validatedInput[0]
                                                          : "0";
                                                      handleChange(
                                                        index,
                                                        "usbport",
                                                        sanitizedInput
                                                      );
                                                    }}
                                                  />
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.paneltypescreen && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Panel Type
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.paneltype?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.paneltypescreen,
                                                        value: todo.paneltypescreen,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "paneltypescreen",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.resolution && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Screen Resolution
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.screenresolution?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.resolution,
                                                        value: todo.resolution,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "resolution",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.connectivity && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Connectivity
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.connectivity?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.connectivity,
                                                        value: todo.connectivity,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "connectivity",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.daterate && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Data Rate
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.datarate?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.daterate,
                                                        value: todo.daterate,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "daterate",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.compatibledevice && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Compatible Device
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.compatibledevices?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label:
                                                          todo.compatibledevice,
                                                        value:
                                                          todo.compatibledevice,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "compatibledevice",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.outputpower && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Output Power
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.outputpower?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.outputpower,
                                                        value: todo.outputpower,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "outputpower",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.collingfancount && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Cooling Fan Count
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.coolingfancount?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.collingfancount,
                                                        value: todo.collingfancount,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "collingfancount",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.clockspeed && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Clock Speed
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        ?.find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.clockspeed?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.clockspeed,
                                                        value: todo.clockspeed,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "clockspeed",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.core && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Core</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        ?.find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.core?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.core,
                                                        value: todo.core,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "core",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.speed && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Speed</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        ?.find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.speed?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.speed,
                                                        value: todo.speed,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "speed",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.frequency && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Frequency
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        ?.find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.frequency?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.frequency,
                                                        value: todo.frequency,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "frequency",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.output && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Output</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        ?.find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.output?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.output,
                                                        value: todo.output,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "output",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.ethernetports && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Ethernet Ports
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        ?.find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.ethernetports?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.ethernetports,
                                                        value: todo.ethernetports,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "ethernetports",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.distance && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Distance
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        ?.find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.distance?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.distance,
                                                        value: todo.distance,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "distance",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.lengthname && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Length</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        ?.find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.lengthname?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.lengthname,
                                                        value: todo.lengthname,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "lengthname",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.slot && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Slot</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        ?.find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.slot?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.slot,
                                                        value: todo.slot,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "slot",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.noofchannels && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      No. Of Channels
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        ?.find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.noofchannels?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.noofchannels,
                                                        value: todo.noofchannels,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "noofchannels",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.colours && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Colour</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        ?.find(
                                                          (item) =>
                                                            item.subcomponent ===
                                                            todo.subname
                                                        )
                                                        ?.colours?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.colours,
                                                        value: todo.colours,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "colours",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}

                                        <>
                                          <Grid item md={3} sm={6} xs={12}>
                                            <Grid container spacing={2}>
                                              <Grid item md={10} sm={10} xs={10}>
                                                <FormControl fullWidth size="small">
                                                  <Typography>
                                                    Warranty{" "}
                                                    <b style={{ color: "red" }}>
                                                      *
                                                    </b>
                                                  </Typography>
                                                  <Select
                                                    fullWidth
                                                    labelId="demo-select-small"
                                                    id="demo-select-small"
                                                    value={todo.warranty}
                                                    disabled={todo.subcomponentcheck === false}
                                                    // onChange={(e) => {
                                                    //   setAssetdetail({ ...stockmaster, warranty: e.target.value });
                                                    // }}
                                                    // value={todo.serial}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "warranty",
                                                        e.target.value
                                                      );
                                                    }}
                                                  >
                                                    <MenuItem value="" disabled>
                                                      {" "}
                                                      Please Select
                                                    </MenuItem>
                                                    <MenuItem value="Yes">
                                                      {" "}
                                                      {"Yes"}{" "}
                                                    </MenuItem>
                                                    <MenuItem value="No">
                                                      {" "}
                                                      {"No"}{" "}
                                                    </MenuItem>
                                                  </Select>
                                                </FormControl>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                        </>

                                        {todo.warranty === "Yes" && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container>
                                                <Grid item md={6} xs={6} sm={6}>
                                                  <Typography>
                                                    Warranty Time{" "}
                                                    <b style={{ color: "red" }}>
                                                      *
                                                    </b>
                                                  </Typography>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <OutlinedInput
                                                      id="component-outlined"
                                                      type="text"
                                                      placeholder="Enter Time"
                                                      disabled={todo.subcomponentcheck === false}
                                                      value={todo.estimation}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "estimation",
                                                          e.target.value
                                                        );
                                                        // handleChangephonenumber(e)
                                                      }}
                                                    // onChange={(e) => handleChangephonenumber(e)}
                                                    />
                                                  </FormControl>
                                                </Grid>
                                                <Grid item md={6} xs={6} sm={6}>
                                                  <Typography>
                                                    Estimation{" "}
                                                    <b style={{ color: "red" }}>
                                                      *
                                                    </b>
                                                  </Typography>
                                                  <Select
                                                    fullWidth
                                                    labelId="demo-select-small"
                                                    id="demo-select-small"
                                                    value={todo.estimationtime}
                                                    disabled={todo.subcomponentcheck === false}
                                                    // onChange={(e) => {
                                                    //   setAssetdetail({ ...stockmaster, estimationtime: e.target.value });
                                                    // }}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "estimationtime",
                                                        e.target.value
                                                      );
                                                      // handleEstimationChange()
                                                    }}
                                                  // onChange={handleEstimationChange}
                                                  >
                                                    <MenuItem value="" disabled>
                                                      {" "}
                                                      Please Select
                                                    </MenuItem>
                                                    <MenuItem value="Days">
                                                      {" "}
                                                      {"Days"}{" "}
                                                    </MenuItem>
                                                    <MenuItem value="Month">
                                                      {" "}
                                                      {"Month"}{" "}
                                                    </MenuItem>
                                                    <MenuItem value="Year">
                                                      {" "}
                                                      {"Year"}{" "}
                                                    </MenuItem>
                                                  </Select>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}

                                        <>
                                          <Grid item md={3} sm={6} xs={12}>
                                            <Grid container spacing={2}>
                                              <Grid item md={10} sm={10} xs={10}>
                                                <FormControl fullWidth size="small">
                                                  <Typography>
                                                    Purchase date{" "}
                                                  </Typography>
                                                  <OutlinedInput
                                                    id="component-outlined"
                                                    type="date"
                                                    disabled={todo.subcomponentcheck === false}
                                                    value={todo.purchasedate}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "purchasedate",
                                                        e.target.value
                                                      );
                                                      // handlePurchaseDateChange()
                                                    }}
                                                  // onChange={handlePurchaseDateChange}
                                                  />
                                                </FormControl>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                        </>
                                        {todo.warranty === "Yes" && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Expiry Date{" "}
                                                    </Typography>
                                                    <OutlinedInput
                                                      id="component-outlined"
                                                      type="text"
                                                      disabled={todo.subcomponentcheck === false}
                                                      placeholder=""
                                                      value={
                                                        todo.warrantycalculation
                                                      }
                                                    // onChange={(e) => {
                                                    //   setAssetdetail({ ...stockmaster, warrantyCalculation: e.target.value });
                                                    // }}
                                                    />
                                                  </FormControl>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}

                                        <>
                                          <Grid item md={3} sm={6} xs={12}>
                                            <Grid container spacing={2}>
                                              <Grid item md={10} sm={10} xs={10}>
                                                <FormControl fullWidth size="small">
                                                  <Typography>
                                                    Vendor Group Name
                                                    <b style={{ color: "red" }}>
                                                      *
                                                    </b>
                                                  </Typography>
                                                  <Selects
                                                    options={vendorGroupOpt}
                                                    styles={colourStyles}
                                                    isDisabled={todo.subcomponentcheck === false}
                                                    value={{
                                                      label: todo.vendorgroup,
                                                      value: todo.vendorgroup,
                                                    }}
                                                    onChange={(e) => {
                                                      handleChangeGroupNameIndexBased(
                                                        e,
                                                        index
                                                      );
                                                      handleChange(
                                                        index,
                                                        "vendorgroup",
                                                        e.value
                                                      );
                                                      setTodos((prev) => {
                                                        const updated = [...prev];
                                                        updated[index].vendor =
                                                          "Choose Vendor";
                                                        return updated;
                                                      });
                                                    }}
                                                  />
                                                </FormControl>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                          <Grid item md={3} sm={6} xs={12}>
                                            <Grid container spacing={2}>
                                              <Grid item md={10} sm={10} xs={10}>
                                                <FormControl fullWidth size="small">
                                                  <Typography>
                                                    Vendor
                                                    <b style={{ color: "red" }}>
                                                      *
                                                    </b>
                                                  </Typography>
                                                  <Selects
                                                    options={vendorOptInd[index]}
                                                    styles={colourStyles}
                                                    isDisabled={todo.subcomponentcheck === false}
                                                    value={{
                                                      label: todo.vendor,
                                                      value: todo.vendor,
                                                    }}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "vendor",
                                                        e.value,
                                                        e._id
                                                      );
                                                      // setVendor(e.value);
                                                      // vendorid(e._id);
                                                    }}
                                                  />
                                                </FormControl>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                        </>

                                        <>
                                          <Grid item md={3} sm={6} xs={12}>
                                            <Grid container spacing={2}>
                                              <Grid item md={10} sm={10} xs={10}>
                                                <FormControl fullWidth size="small">
                                                  <Typography>Address</Typography>
                                                  <OutlinedInput
                                                    id="component-outlined"
                                                    type="text"
                                                    disabled={todo.subcomponentcheck === false}
                                                    // value={vendorgetid?.address}
                                                    value={todo?.address}
                                                    readOnly
                                                  />
                                                </FormControl>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                        </>

                                        <>
                                          <Grid item md={3} sm={6} xs={12}>
                                            <Grid container spacing={2}>
                                              <Grid item md={10} sm={10} xs={10}>
                                                <FormControl fullWidth size="small">
                                                  <Typography>
                                                    Phone Number
                                                  </Typography>
                                                  <OutlinedInput
                                                    id="component-outlined"
                                                    type="text"
                                                    disabled={todo.subcomponentcheck === false}
                                                    // value={vendorgetid?.phonenumber}
                                                    value={todo?.phonenumber}
                                                    readOnly
                                                  />
                                                </FormControl>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                        </>
                                      </>
                                    )}



                                    {/* <Grid item md={1} sm={3} xs={3}>
                                      {todos.length > 0 && (
                                        <>
                                          <Button
                                            sx={{
                                              padding: "14px 14px",
                                              marginTop: "16px",
                                              minWidth: "40px !important",
                                              borderRadius: "50% !important",
                                              ":hover": {
                                                backgroundColor: "#80808036", // theme.palette.primary.main
                                              },
                                            }}
                                            onClick={() => handleDelete(index)}
                                          >
                                            <FaTrash
                                              style={{
                                                fontSize: "large",
                                                color: "#a73131",
                                              }}
                                            />
                                          </Button>
                                        </>
                                      )}
                                    </Grid> */}
                                  </Grid>
                                </Grid>
                              </Grid>
                            ) : (
                              <Grid container key={index} spacing={1}>
                                <Grid
                                  item
                                  md={12}
                                  sm={12}
                                  xs={12}
                                  marginTop={2}
                                >
                                  <Grid container key={index} spacing={1}>

                                    <>
                                      <Grid item md={3} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormGroup>

                                              <FormControlLabel

                                                control={
                                                  <Switch
                                                    // color="success"
                                                    sx={{
                                                      "& .MuiSwitch-switchBase.Mui-checked": {
                                                        color: "green", // Thumb color when checked
                                                      },
                                                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                        backgroundColor: "green", // Track color when checked
                                                      },
                                                      "& .MuiSwitch-switchBase": {
                                                        color: "#ff0000a3", // Thumb color when not checked
                                                      },
                                                      "& .MuiSwitch-switchBase + .MuiSwitch-track": {
                                                        backgroundColor: "#ff0000a3", // Track color when not checked
                                                      },
                                                    }}
                                                    checked={todo.subcomponentcheck}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "subcomponentcheck",
                                                        e.target.checked
                                                      );
                                                    }}
                                                  />
                                                }
                                                label="Enable Subcomponent"
                                              />
                                            </FormGroup>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>

                                    {todo.subcomponentcheck === true && (
                                      <>

                                        {todo.type && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Type</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.type?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.type,
                                                        value: todo.type,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "type",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenType();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.model && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Model</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.model?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.model,
                                                        value: todo.model,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "model",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>
                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenModel();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}

                                        {todo.size && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Size</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.size?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.size,
                                                        value: todo.size,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "size",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>
                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenSize();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}

                                        {todo.variant && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Variants
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.variant?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.variant,
                                                        value: todo.variant,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "variant",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>
                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenVariant();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}

                                        {todo.brand && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    size="small"
                                                    fullWidth
                                                  >
                                                    <Typography>Brand</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.brand?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.brand,
                                                        value: todo.brand,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "brand",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>
                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenBrand();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}

                                        {todo.serial !== undefined && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container>
                                                <Grid
                                                  item
                                                  md={11.6}
                                                  sm={10}
                                                  xs={10}
                                                >
                                                  <Typography>Serial</Typography>

                                                  <OutlinedInput
                                                    fullWidth
                                                    type="text"
                                                    size="small"
                                                    placeholder="Please Enter Serial"
                                                    value={todo.serial}
                                                    disabled={todo.subcomponentcheck === false}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "serial",
                                                        e.target.value
                                                      );
                                                    }}
                                                  />
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}

                                        {todo.other !== undefined && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container>
                                                <Grid
                                                  item
                                                  md={11.6}
                                                  sm={10}
                                                  xs={10}
                                                >
                                                  <Typography>Others</Typography>

                                                  <OutlinedInput
                                                    fullWidth
                                                    type="text"
                                                    size="small"
                                                    placeholder="Please Enter Other"
                                                    value={todo.other}
                                                    disabled={todo.subcomponentcheck === false}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "other",
                                                        e.target.value
                                                      );
                                                    }}
                                                  />
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.capacity && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Capacity
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.capacity?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      disabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.capacity,
                                                        value: todo.capacity,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "capacity",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.hdmiport !== undefined && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container>
                                                <Grid
                                                  item
                                                  md={11.6}
                                                  sm={10}
                                                  xs={10}
                                                >
                                                  <Typography>HDMI Port</Typography>

                                                  <OutlinedInput
                                                    fullWidth
                                                    type="number"
                                                    size="small"
                                                    placeholder="Please Enter HDMI Port"
                                                    value={todo.hdmiport}
                                                    disabled={todo.subcomponentcheck === false}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "hdmiport",
                                                        e.target.value
                                                      );
                                                    }}
                                                  />
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.vgaport !== undefined && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container>
                                                <Grid
                                                  item
                                                  md={11.6}
                                                  sm={10}
                                                  xs={10}
                                                >
                                                  <Typography>VGA Port</Typography>

                                                  <OutlinedInput
                                                    fullWidth
                                                    type="text"
                                                    size="small"
                                                    placeholder="Please Enter VGA Port"
                                                    value={todo.vgaport}
                                                    disabled={todo.subcomponentcheck === false}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "vgaport",
                                                        e.target.value
                                                      );
                                                    }}
                                                  />
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.dpport !== undefined && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container>
                                                <Grid
                                                  item
                                                  md={11.6}
                                                  sm={10}
                                                  xs={10}
                                                >
                                                  <Typography>DP Port</Typography>

                                                  <OutlinedInput
                                                    fullWidth
                                                    type="text"
                                                    size="small"
                                                    placeholder="Please Enter DP Port"
                                                    value={todo.dpport}
                                                    disabled={todo.subcomponentcheck === false}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "dpport",
                                                        e.target.value
                                                      );
                                                    }}
                                                  />
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.usbport !== undefined && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container>
                                                <Grid
                                                  item
                                                  md={11.6}
                                                  sm={10}
                                                  xs={10}
                                                >
                                                  <Typography>USB Port</Typography>

                                                  <OutlinedInput
                                                    fullWidth
                                                    type="text"
                                                    size="small"
                                                    placeholder="Please Enter USB Port"
                                                    value={todo.usbport}
                                                    disabled={todo.subcomponentcheck === false}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "usbport",
                                                        e.target.value
                                                      );
                                                    }}
                                                  />
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.paneltypescreen && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Panel Type
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.paneltype?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.paneltypescreen,
                                                        value: todo.paneltypescreen,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "paneltypescreen",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.resolution && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Screen Resolution
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.screenresolution?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.resolution,
                                                        value: todo.resolution,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "resolution",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.connectivity && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Connectivity
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.connectivity?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.connectivity,
                                                        value: todo.connectivity,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "connectivity",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.daterate && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Data Rate
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.datarate?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.daterate,
                                                        value: todo.daterate,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "daterate",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.compatibledevice && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Compatible Device
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.compatibledevices?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label:
                                                          todo.compatibledevice,
                                                        value:
                                                          todo.compatibledevice,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "compatibledevice",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.outputpower && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Output Power
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.outputpower?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.outputpower,
                                                        value: todo.outputpower,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "outputpower",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.collingfancount && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Cooling Fan Count
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.coolingfancount?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.collingfancount,
                                                        value: todo.collingfancount,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "collingfancount",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.clockspeed && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Clock Speed
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.clockspeed?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.clockspeed,
                                                        value: todo.clockspeed,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "clockspeed",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.core && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Core</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.core?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.core,
                                                        value: todo.core,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "core",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.speed && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Speed</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.speed?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.speed,
                                                        value: todo.speed,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "speed",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.frequency && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Frequency
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.frequency?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.frequency,
                                                        value: todo.frequency,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "frequency",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.output && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Output</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.output?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.output,
                                                        value: todo.output,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "output",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.ethernetports && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Ethernet Ports
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.ethernetports?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.ethernetports,
                                                        value: todo.ethernetports,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "ethernetports",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.distance && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Distance
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.distance?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.distance,
                                                        value: todo.distance,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "distance",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.lengthname && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Length</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.lengthname?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.lengthname,
                                                        value: todo.lengthname,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "lengthname",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.slot && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Slot</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.slot?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.slot,
                                                        value: todo.slot,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "slot",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.noofchannels && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      No. Of Channels
                                                    </Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.noofchannels?.map(
                                                          (item) => ({
                                                            ...item,
                                                            label: item,
                                                            value: item,
                                                          })
                                                        )}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.noofchannels,
                                                        value: todo.noofchannels,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "noofchannels",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}
                                        {todo.colours && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>Colour</Typography>
                                                    <Selects
                                                      options={specificationGrouping
                                                        .find(
                                                          (item) =>
                                                            stockmaster.component ===
                                                            item.component &&
                                                            stockmaster.productname ===
                                                            item.assetmaterial
                                                        )
                                                        ?.colours?.map((item) => ({
                                                          ...item,
                                                          label: item,
                                                          value: item,
                                                        }))}
                                                      styles={colourStyles}
                                                      isDisabled={todo.subcomponentcheck === false}
                                                      value={{
                                                        label: todo.colours,
                                                        value: todo.colours,
                                                      }}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "colours",
                                                          e.value
                                                        );
                                                      }}
                                                    />
                                                  </FormControl>
                                                </Grid>

                                                <Grid item md={2} sm={2} xs={2}>
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    style={{
                                                      height: "30px",
                                                      minWidth: "20px",
                                                      padding: "19px 13px",
                                                      //  color: "white",
                                                      marginTop: "23px",
                                                      marginLeft: "-10px",
                                                      // background: "rgb(25, 118, 210)",
                                                    }}
                                                    onClick={() => {
                                                      handleClickOpenCapacity();
                                                    }}
                                                  >
                                                    <FaPlus
                                                      style={{ fontSize: "15px" }}
                                                    />
                                                  </Button>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}

                                        <>
                                          <Grid item md={3} sm={6} xs={12}>
                                            <Grid container spacing={2}>
                                              <Grid item md={10} sm={10} xs={10}>
                                                <FormControl fullWidth size="small">
                                                  <Typography>
                                                    Warranty{" "}
                                                    <b style={{ color: "red" }}>
                                                      *
                                                    </b>
                                                  </Typography>
                                                  <Select
                                                    fullWidth
                                                    labelId="demo-select-small"
                                                    id="demo-select-small"
                                                    value={todo.warranty}
                                                    disabled={todo.subcomponentcheck === false}
                                                    // onChange={(e) => {

                                                    //   setAssetdetail({ ...stockmaster, warranty: e.target.value });
                                                    // }}
                                                    // value={todo.serial}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "warranty",
                                                        e.target.value
                                                      );
                                                    }}
                                                  >
                                                    <MenuItem value="" disabled>
                                                      {" "}
                                                      Please Select
                                                    </MenuItem>
                                                    <MenuItem value="Yes">
                                                      {" "}
                                                      {"Yes"}{" "}
                                                    </MenuItem>
                                                    <MenuItem value="No">
                                                      {" "}
                                                      {"No"}{" "}
                                                    </MenuItem>
                                                  </Select>
                                                </FormControl>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                        </>

                                        {todo.warranty === "Yes" && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container>
                                                <Grid item md={6} xs={6} sm={6}>
                                                  <Typography>
                                                    Warranty Time{" "}
                                                    <b style={{ color: "red" }}>
                                                      *
                                                    </b>
                                                  </Typography>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <OutlinedInput
                                                      id="component-outlined"
                                                      type="text"
                                                      placeholder="Enter Time"
                                                      value={todo.estimation}
                                                      disabled={todo.subcomponentcheck === false}
                                                      onChange={(e) => {
                                                        handleChange(
                                                          index,
                                                          "estimation",
                                                          e.target.value
                                                        );
                                                        handleChangephonenumber(e);
                                                      }}
                                                    // onChange={(e) => handleChangephonenumber(e)}
                                                    />
                                                  </FormControl>
                                                </Grid>
                                                <Grid item md={6} xs={6} sm={6}>
                                                  <Typography>
                                                    Estimation{" "}
                                                    <b style={{ color: "red" }}>
                                                      *
                                                    </b>
                                                  </Typography>
                                                  <Select
                                                    fullWidth
                                                    labelId="demo-select-small"
                                                    id="demo-select-small"
                                                    value={todo.estimationtime}
                                                    // onChange={(e) => {
                                                    //   setAssetdetail({ ...stockmaster, estimationtime: e.target.value });
                                                    // }}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "estimationtime",
                                                        e.target.value
                                                      );
                                                      // handleEstimationChange()
                                                    }}
                                                  // onChange={handleEstimationChange}
                                                  >
                                                    <MenuItem value="" disabled>
                                                      {" "}
                                                      Please Select
                                                    </MenuItem>
                                                    <MenuItem value="Days">
                                                      {" "}
                                                      {"Days"}{" "}
                                                    </MenuItem>
                                                    <MenuItem value="Month">
                                                      {" "}
                                                      {"Month"}{" "}
                                                    </MenuItem>
                                                    <MenuItem value="Year">
                                                      {" "}
                                                      {"Year"}{" "}
                                                    </MenuItem>
                                                  </Select>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}

                                        <>
                                          <Grid item md={3} sm={6} xs={12}>
                                            <Grid container spacing={2}>
                                              <Grid item md={10} sm={10} xs={10}>
                                                <FormControl fullWidth size="small">
                                                  <Typography>
                                                    Purchase date{" "}
                                                  </Typography>
                                                  <OutlinedInput
                                                    id="component-outlined"
                                                    type="date"
                                                    value={todo.purchasedate}
                                                    disabled={todo.subcomponentcheck === false}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "purchasedate",
                                                        e.target.value
                                                      );
                                                      // handlePurchaseDateChange()
                                                    }}
                                                  // onChange={handlePurchaseDateChange}
                                                  />
                                                </FormControl>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                        </>
                                        {todos.warranty === "Yes" && (
                                          <>
                                            <Grid item md={3} sm={6} xs={12}>
                                              <Grid container spacing={2}>
                                                <Grid item md={10} sm={10} xs={10}>
                                                  <FormControl
                                                    fullWidth
                                                    size="small"
                                                  >
                                                    <Typography>
                                                      Expiry Date{" "}
                                                    </Typography>
                                                    <OutlinedInput
                                                      id="component-outlined"
                                                      type="text"
                                                      disabled={todo.subcomponentcheck === false}
                                                      placeholder=""
                                                      value={
                                                        todo.warrantycalculation
                                                      }
                                                    // onChange={(e) => {
                                                    //   setAssetdetail({ ...stockmaster, warrantyCalculation: e.target.value });
                                                    // }}
                                                    />
                                                  </FormControl>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          </>
                                        )}

                                        <>
                                          <Grid item md={3} sm={6} xs={12}>
                                            <Grid container spacing={2}>
                                              <Grid item md={10} sm={10} xs={10}>
                                                <FormControl fullWidth size="small">
                                                  <Typography>
                                                    Vendor Group Name
                                                    <b style={{ color: "red" }}>
                                                      *
                                                    </b>
                                                  </Typography>
                                                  <Selects
                                                    options={vendorGroupOpt}
                                                    styles={colourStyles}
                                                    isDisabled={todo.subcomponentcheck === false}
                                                    value={{
                                                      label: todo.vendorgroup,
                                                      value: todo.vendorgroup,
                                                    }}
                                                    onChange={(e) => {
                                                      handleChangeGroupNameIndexBased(
                                                        e,
                                                        index
                                                      );
                                                      handleChange(
                                                        index,
                                                        "vendorgroup",
                                                        e.value
                                                      );
                                                      setTodos((prev) => {
                                                        const updated = [...prev];
                                                        updated[index].vendor =
                                                          "Choose Vendor";
                                                        return updated;
                                                      });
                                                    }}
                                                  />
                                                </FormControl>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                          <Grid item md={3} sm={6} xs={12}>
                                            <Grid container spacing={2}>
                                              <Grid item md={10} sm={10} xs={10}>
                                                <FormControl fullWidth size="small">
                                                  <Typography>
                                                    Vendor
                                                    <b style={{ color: "red" }}>
                                                      *
                                                    </b>
                                                  </Typography>
                                                  <Selects
                                                    options={vendorOptInd[index]}
                                                    styles={colourStyles}
                                                    value={{
                                                      label: todo.vendor,
                                                      value: todo.vendor,
                                                    }}
                                                    onChange={(e) => {
                                                      handleChange(
                                                        index,
                                                        "vendor",
                                                        e.value,
                                                        e._id
                                                      );
                                                      // setVendor(e.value);
                                                      // vendorid(e._id);
                                                    }}
                                                  />
                                                </FormControl>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                        </>

                                        <>
                                          <Grid item md={3} sm={6} xs={12}>
                                            <Grid container spacing={2}>
                                              <Grid item md={10} sm={10} xs={10}>
                                                <FormControl fullWidth size="small">
                                                  <Typography>Address</Typography>
                                                  <OutlinedInput
                                                    id="component-outlined"
                                                    type="text"
                                                    disabled={todo.subcomponentcheck === false}
                                                    // value={vendorgetid?.address}
                                                    value={todo?.address}
                                                    readOnly
                                                  />
                                                </FormControl>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                        </>

                                        <>
                                          <Grid item md={3} sm={6} xs={12}>
                                            <Grid container spacing={2}>
                                              <Grid item md={10} sm={10} xs={10}>
                                                <FormControl fullWidth size="small">
                                                  <Typography>
                                                    Phone Number
                                                  </Typography>
                                                  <OutlinedInput
                                                    id="component-outlined"
                                                    type="text"
                                                    disabled={todo.subcomponentcheck === false}
                                                    // value={vendorgetid?.phonenumber}
                                                    value={todo?.phonenumber}
                                                    readOnly
                                                  />
                                                </FormControl>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                        </>

                                      </>
                                    )}
                                    {/* <Grid item md={1} sm={3} xs={3}>
                                      <Button
                                        sx={{
                                          padding: "14px 14px",
                                          marginTop: "16px",
                                          minWidth: "40px !important",
                                          borderRadius: "50% !important",
                                          ":hover": {
                                            backgroundColor: "#80808036", // theme.palette.primary.main
                                          },
                                        }}
                                        onClick={() => handleDelete(index)}
                                      >
                                        <FaTrash
                                          style={{
                                            fontSize: "large",
                                            color: "#a73131",
                                          }}
                                        />
                                      </Button>
                                    </Grid> */}
                                  </Grid>
                                </Grid>
                              </Grid>
                            )}
                            <br />
                          </>
                        );
                      })}

                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Product Details <b style={{ color: "red" }}>*</b>{" "}
                        </Typography>
                        <TextareaAutosize
                          aria-label="minimum height"
                          minRows={2}
                          value={stockmaster.productdetails}
                          placeholder="Please Enter Product Details"
                          onChange={(e) => {
                            setStockmaster({
                              ...stockmaster,
                              productdetails: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl size="small" fullWidth>
                        <Typography>
                          UOM <b style={{ color: "red" }}>*</b>{" "}
                        </Typography>
                        <Selects
                          options={vomMasterget}
                          styles={colourStyles}
                          value={{
                            label: stockmaster.uom,
                            value: stockmaster.uom,
                          }}
                          onChange={(e) => {
                            setStockmaster({ ...stockmaster, uom: e.value });
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <FormControl fullWidth size="small">
                        <Typography>
                          Qty<b style={{ color: "red" }}>*</b>{" "}
                        </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="number"
                          sx={userStyle.input}
                          placeholder="Please Enter Quantity"
                          value={stockmaster.quantity}
                          onChange={(e) => {
                            setStockmaster({
                              ...stockmaster,
                              quantity: e.target.value,
                            });
                          }}
                        />
                      </FormControl>
                    </Grid>
                  </>
                )}
              </Grid>
              <br />
              <br />
              <Grid container spacing={2}>
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
                      onClick={handleClickUploadPopupOpen}
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
                        onClick={handleClickUploadPopupOpenwarranty}
                      >
                        Upload
                      </Button>
                    </Box>
                  </Grid>
                )}

                {stockArray.length > 0 && (
                  <>
                    <Grid item md={12} xs={12} sm={12}>
                      {" "}
                      <Typography variant="h6">
                        Stock Purchase Todo List
                      </Typography>
                    </Grid>

                    {/* <Grid item md={3} xs={12} sm={12}></Grid>
                  <Grid item md={3} xs={12} sm={12}></Grid>
                  <Grid item md={3} xs={12} sm={12}></Grid> */}
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
                              placeholder="Please Enter Product Details"
                            />
                          </FormControl>
                          &nbsp; &emsp;
                          <Button
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
                          </Button>
                        </Grid>
                      </>
                    );
                  })}
                <Grid item md={3} xs={12} sm={6} marginTop={3}>
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
                <Grid item md={3} xs={12} sm={6} marginTop={3}>
                  <Button sx={buttonStyles.btncancel} onClick={handleclear}>
                    Clear
                  </Button>
                </Grid>
              </Grid>
              <br />
              <br />

              <Grid container>
                {/* <Grid item md={3} xs={12} sm={6}>
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
                </Grid> */}
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
          maxWidth="lg"
          sx={{ marginTop: "95px" }}
          fullWidth={true}
        >
          <Box sx={{ padding: "20px 50px" }}>
            <>
              <Grid container spacing={2}>
                <Typography sx={userStyle.HeaderText}>
                  Edit Asset Purchase
                </Typography>
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
                        label: stockmasteredit.company,
                        value: stockmasteredit.company,
                      }}
                      onChange={(e) => {
                        setStockmasteredit({
                          ...stockmasteredit,
                          company: e.value,
                          branch: "Please Select Branch",
                          unit: "Please Select Unit",
                          floor: "Please Select Floor",
                          area: "Please Select Area",
                          location: "Please Select Location",
                        });
                        // setBranchsEdit([]);
                        setAreasEdit([]);
                        setUnitsEdit([])
                        setFloorEdit([]);
                        setLocationsEdit([{ label: "ALL", value: "ALL" }]);
                        fetchBranchDropdownsEdit(e.value);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Branch<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                      // options={branchsEdit}
                      options={accessbranch?.filter(
                        (comp) =>
                          stockmasteredit.company === comp.company
                      )?.map(data => ({
                        label: data.branch,
                        value: data.branch,
                      })).filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                      styles={colourStyles}
                      value={{
                        label: stockmasteredit.branch,
                        value: stockmasteredit.branch,
                      }}
                      onChange={(e) => {
                        setNewcheckBranch(e.value);
                        setStockmasteredit({
                          ...stockmasteredit,
                          branch: e.value,
                          unit: "Please Select Unit",
                          floor: "Please Select Floor",
                          area: "Please Select Area",
                          location: "Please Select Location",
                        });
                        // setUnitsEdit([]);
                        setAreasEdit([]);
                        setLocationsEdit([{ label: "ALL", value: "ALL" }]);
                        // setFloorEdit([]);
                        fetchUnitsEdit(e.value);
                        fetchFloorEdit(e.value);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Unit<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                      // options={unitsEdit}
                      options={accessbranch?.filter(
                        (comp) =>
                          stockmasteredit.company === comp.company && stockmasteredit.branch === comp.branch
                      )?.map(data => ({
                        label: data.unit,
                        value: data.unit,
                      })).filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                      styles={colourStyles}
                      value={{
                        label: stockmasteredit.unit,
                        value: stockmasteredit.unit,
                      }}
                      onChange={(e) => {
                        setStockmasteredit({
                          ...stockmasteredit,
                          unit: e.value,
                          workstation: "",
                        });
                      }}
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
                        label: stockmasteredit.floor,
                        value: stockmasteredit.floor,
                      }}
                      onChange={(e) => {
                        setStockmasteredit({
                          ...stockmasteredit,
                          floor: e.value,
                          workstation: "",
                          area: "Please Select Area",
                          location: "Please Select Location",
                        });
                        // setAreasEdit([]);
                        setLocationsEdit([{ label: "ALL", value: "ALL" }]);
                        fetchAreaEdit(stockmasteredit.branch, e.value);
                        fetchAllLocationEdit(
                          stockmasteredit.branch,
                          e.value,
                          stockmasteredit.area,
                        )
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
                        label: stockmasteredit.area,
                        value: stockmasteredit.area,
                      }}
                      onChange={(e) => {
                        setStockmasteredit({
                          ...stockmasteredit,
                          area: e.value,
                          workstation: "",
                          location: "Please Select Location",
                        });
                        setLocationsEdit([{ label: "ALL", value: "ALL" }]);
                        fetchAllLocationEdit(
                          stockmasteredit.branch,
                          stockmasteredit.floor,
                          // stockmasteredit.area,
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
                        label: stockmasteredit.location,
                        value: stockmasteredit.location,
                      }}
                      onChange={(e) => {
                        setStockmasteredit({
                          ...stockmasteredit,
                          location: e.value,
                          workstation: "",
                        });
                      }}
                    />
                  </FormControl>
                  {/* <FormGroup>
                    <FormControlLabel
                      control={<Checkbox checked={stockmasteredit.workcheck} />}
                      onChange={(e) =>
                        setStockmasteredit({
                          ...stockmasteredit,
                          workcheck: !stockmasteredit.workcheck,
                          // ^ Update workcheck based on the checkbox state
                        })
                      }
                      label="Enable Workstation"
                    />
                  </FormGroup> */}
                </Grid>
                {/* {stockmasteredit.workcheck && (
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Work Station</Typography>
                      <Selects
                        maxMenuHeight={250}
                        styles={colourStyles}
                        options={filteredWorkStation}
                        placeholder="Please Select Workstation"
                        value={{
                          label: stockmasteredit.workstation === "" || stockmasteredit.workstation === undefined ? "Please Select Workstation" : stockmasteredit.workstation,
                          value: stockmasteredit.workstation === "" || stockmasteredit.workstation === undefined ? "Please Select Workstation" : stockmasteredit.workstation,
                        }}
                        onChange={(e) => {
                          setStockmasteredit({ ...stockmasteredit, workstation: e.value });
                        }}
                      />
                    </FormControl>
                  </Grid>
                )} */}
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Warranty</Typography>

                    <Select
                      fullWidth
                      labelId="demo-select-small"
                      id="demo-select-small"
                      value={stockmasteredit.warranty}
                      onChange={(e) => {
                        setStockmasteredit({
                          ...stockmasteredit,
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
                {stockmasteredit.warranty === "Yes" && (
                  <>
                    <Grid item md={3} xs={12} sm={12}>
                      <Grid container>
                        <Grid item md={6} xs={6} sm={6}>
                          <Typography>Warranty Time</Typography>
                          <FormControl fullWidth size="small">
                            <OutlinedInput
                              id="component-outlined"
                              type="text"
                              placeholder="Enter Time"
                              value={stockmasteredit.estimation}
                              onChange={(e) => handleChangephonenumberEdit(e)}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item md={6} xs={6} sm={6}>
                          <Typography>Estimation</Typography>
                          <Select
                            fullWidth
                            size="small"
                            labelId="demo-select-small"
                            id="demo-select-small"
                            value={stockmasteredit.estimationtime}
                            // onChange={(e) => {
                            //   setAssetdetail({ ...assetdetail, estimationtime: e.target.value });
                            // }}
                            onChange={handleEstimationChangeEdit}
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
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Purchase date </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="date"
                      value={selectedPurchaseDateEdit}
                      // onChange={(e) => {
                      //   setAssetdetail({ ...assetdetail, purchasedate: e.target.value });
                      // }}
                      onChange={handlePurchaseDateChangeEdit}
                    />
                  </FormControl>
                </Grid>
                {stockmasteredit.warranty === "Yes" && (
                  <>
                    <Grid item md={3} xs={12} sm={12}>
                      <FormControl fullWidth size="small">
                        <Typography>Expiry Date </Typography>
                        <OutlinedInput
                          id="component-outlined"
                          type="text"
                          placeholder=""
                          value={stockmasteredit.warrantycalculation}
                        />
                      </FormControl>
                    </Grid>
                  </>
                )}
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      {" "}
                      Vendor Group Name<b style={{ color: "red" }}>*</b>{" "}
                    </Typography>
                    <Selects
                      options={vendorGroupOpt}
                      styles={colourStyles}
                      value={{ label: vendorGroupEdit, value: vendorGroupEdit }}
                      onChange={(e) => {
                        handleChangeGroupNameEdit(e);
                        setVendorGroupEdit(e.value);
                        setVendorNewEdit("Choose Vendor");
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      Vendor Name <b style={{ color: "red" }}>*</b>{" "}
                    </Typography>
                    <Selects
                      // options={vendormaster}
                      options={vendorOptEdit}
                      styles={colourStyles}
                      value={{ label: vendorNewEdit, value: vendorNewEdit }}
                      onChange={(e) => {
                        setVendorNewEdit(e.value);
                        vendorid(e._id);
                      }}
                    />
                  </FormControl>
                </Grid>
                {/* <Grid item md={3} xs={12} sm={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      Vendor Name <b style={{ color: "red" }}>*</b>{" "}
                    </Typography>
                    <Selects
                      options={vendormaster}
                      styles={colourStyles}
                      value={{ label: stockmasteredit.vendorname, value: stockmasteredit.vendorname }}
                      onChange={(e) => {
                        setStockmasteredit({ ...stockmasteredit, vendorname: e.value });
                        vendorid(e._id);
                      }}
                    />
                  </FormControl>
                </Grid> */}
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      GST No <b style={{ color: "red" }}>*</b>{" "}
                    </Typography>
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
                      value={stockmasteredit.billno}
                      onChange={(e) => {
                        setStockmasteredit({
                          ...stockmasteredit,
                          billno: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Request Mode For</Typography>
                    <OutlinedInput
                      value={stockmasteredit.requestmode}
                      readOnly={true}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Material</Typography>
                    <OutlinedInput value={stockmasteredit.productname} />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Asset Type</Typography>
                    <OutlinedInput value={stockmasteredit.assettype} />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Asset Head</Typography>
                    <OutlinedInput value={stockmasteredit.producthead} />
                  </FormControl>
                </Grid>
                <Grid item md={3} sm={6} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Component</Typography>
                    <Selects
                      options={Specificationedit}
                      styles={colourStyles}
                      value={{
                        label: stockmasteredit.component,
                        value: stockmasteredit.component,
                      }}
                      onChange={(e) => {
                        setStockmasteredit({
                          ...stockmasteredit,
                          component: e.value,
                        });
                        setTodosEdit([]);
                        handleAddInputEdit(e.value);
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <br />
              {todosEdit &&
                todosEdit?.map((todo, index) => {
                  return (
                    <>
                      {todo.sub ? (
                        <Grid container key={index} spacing={1}>
                          <Grid item md={2} sm={2} xs={2} marginTop={2}>
                            <Typography>{todo.sub}</Typography>
                          </Grid>
                          <Grid item md={10} sm={10} xs={10} marginTop={2}>
                            <Grid container key={index} spacing={1}>
                              <>
                                <Grid item md={3} sm={6} xs={12}>
                                  <Grid container spacing={2}>
                                    <Grid item md={10} sm={10} xs={10}>


                                      <FormGroup>

                                        <FormControlLabel

                                          control={
                                            <Switch
                                              // color="success"
                                              sx={{
                                                "& .MuiSwitch-switchBase.Mui-checked": {
                                                  color: "green", // Thumb color when checked
                                                },
                                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                  backgroundColor: "green", // Track color when checked
                                                },
                                                "& .MuiSwitch-switchBase": {
                                                  color: "#ff0000a3", // Thumb color when not checked
                                                },
                                                "& .MuiSwitch-switchBase + .MuiSwitch-track": {
                                                  backgroundColor: "#ff0000a3", // Track color when not checked
                                                },
                                              }}
                                              checked={todo.subcomponentcheck}
                                              onChange={(e) => {
                                                handleChangeEdit(
                                                  index,
                                                  "subcomponentcheck",
                                                  e.target.checked
                                                );
                                              }}
                                            />
                                          }
                                          label="Enable Subcomponent"
                                        />
                                      </FormGroup>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </>
                              {todo.subcomponentcheck === true && (
                                <>
                                  {todo.type && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Type</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.type?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.type,
                                                  value: todo.type,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "type",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>
                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenType();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.model && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Model</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.model?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.model,
                                                  value: todo.model,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "model",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>
                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenModel();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.size && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Size</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.size?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.size,
                                                  value: todo.size,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "size",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>
                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenSize();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.variant && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Variants</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.variant?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.variant,
                                                  value: todo.variant,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "variant",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>
                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              size="small"
                                              variant="contained"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenVariant();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.brand && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl size="small" fullWidth>
                                              <Typography>Brand</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.brand?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.brand,
                                                  value: todo.brand,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "brand",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>
                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenBrand();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.serial !== undefined && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container>
                                          <Grid item md={11.6} sm={10} xs={10}>
                                            <Typography>Serial</Typography>

                                            <OutlinedInput
                                              fullWidth
                                              type="text"
                                              size="small"
                                              placeholder="Please Enter Serial"
                                              value={todo.serial}
                                              disabled={todo.subcomponentcheck === false}
                                              onChange={(e) => {
                                                handleChangeEdit(
                                                  index,
                                                  "serial",
                                                  e.target.value
                                                );
                                              }}
                                            />
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.other !== undefined && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container>
                                          <Grid item md={11.6} sm={10} xs={10}>
                                            <Typography>Others</Typography>

                                            <OutlinedInput
                                              fullWidth
                                              type="text"
                                              size="small"
                                              placeholder="Please Enter Other"
                                              value={todo.other}
                                              onChange={(e) => {
                                                handleChangeEdit(
                                                  index,
                                                  "other",
                                                  e.target.value
                                                );
                                              }}
                                            />
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.capacity && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Capacity</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.capacity?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.capacity,
                                                  value: todo.capacity,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "capacity",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.hdmiport !== undefined && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container>
                                          <Grid item md={11.6} sm={10} xs={10}>
                                            <Typography>HDMI Port</Typography>

                                            <OutlinedInput
                                              fullWidth
                                              type="text"
                                              size="small"
                                              placeholder="Please Enter HDMI Port"
                                              value={todo.hdmiport}
                                              disabled={todo.subcomponentcheck === false}
                                              onChange={(e) => {
                                                const inputText = e.target.value;
                                                // Regex to allow only non-negative numbers
                                                const validatedInput =
                                                  inputText.match(/^\d*$/);

                                                const sanitizedInput =
                                                  validatedInput !== null
                                                    ? validatedInput[0]
                                                    : "0";
                                                handleChangeEdit(
                                                  index,
                                                  "hdmiport",
                                                  sanitizedInput
                                                );
                                              }}
                                            />
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.vgaport !== undefined && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container>
                                          <Grid item md={11.6} sm={10} xs={10}>
                                            <Typography>VGA Port</Typography>

                                            <OutlinedInput
                                              fullWidth
                                              type="text"
                                              size="small"
                                              placeholder="Please Enter VGA Port"
                                              value={todo.vgaport}
                                              disabled={todo.subcomponentcheck === false}
                                              onChange={(e) => {
                                                const inputText = e.target.value;
                                                // Regex to allow only non-negative numbers
                                                const validatedInput =
                                                  inputText.match(/^\d*$/);

                                                const sanitizedInput =
                                                  validatedInput !== null
                                                    ? validatedInput[0]
                                                    : "0";
                                                handleChangeEdit(
                                                  index,
                                                  "vgaport",
                                                  sanitizedInput
                                                );
                                              }}
                                            />
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.dpport !== undefined && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container>
                                          <Grid item md={11.6} sm={10} xs={10}>
                                            <Typography>DP Port</Typography>

                                            <OutlinedInput
                                              fullWidth
                                              type="text"
                                              size="small"
                                              placeholder="Please Enter DP Port"
                                              value={todo.dpport}
                                              disabled={todo.subcomponentcheck === false}
                                              onChange={(e) => {
                                                const inputText = e.target.value;
                                                // Regex to allow only non-negative numbers
                                                const validatedInput =
                                                  inputText.match(/^\d*$/);

                                                const sanitizedInput =
                                                  validatedInput !== null
                                                    ? validatedInput[0]
                                                    : "0";
                                                handleChangeEdit(
                                                  index,
                                                  "dpport",
                                                  sanitizedInput
                                                );
                                              }}
                                            />
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.usbport !== undefined && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container>
                                          <Grid item md={11.6} sm={10} xs={10}>
                                            <Typography>USB Port</Typography>

                                            <OutlinedInput
                                              fullWidth
                                              type="text"
                                              size="small"
                                              disabled={todo.subcomponentcheck === false}
                                              placeholder="Please Enter USB Port"
                                              value={todo.usbport}
                                              onChange={(e) => {
                                                const inputText = e.target.value;
                                                // Regex to allow only non-negative numbers
                                                const validatedInput =
                                                  inputText.match(/^\d*$/);

                                                const sanitizedInput =
                                                  validatedInput !== null
                                                    ? validatedInput[0]
                                                    : "0";
                                                handleChangeEdit(
                                                  index,
                                                  "usbport",
                                                  sanitizedInput
                                                );
                                              }}
                                            />
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.paneltypescreen && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Panel Type</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.paneltype?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.paneltypescreen,
                                                  value: todo.paneltypescreen,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "paneltypescreen",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.resolution && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>
                                                Screen Resolution
                                              </Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.screenresolution?.map(
                                                    (item) => ({
                                                      ...item,
                                                      label: item,
                                                      value: item,
                                                    })
                                                  )}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.resolution,
                                                  value: todo.resolution,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "resolution",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.connectivity && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Connectivity</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.connectivity?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.connectivity,
                                                  value: todo.connectivity,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "connectivity",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.daterate && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Data Rate</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.datarate?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.daterate,
                                                  value: todo.daterate,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "daterate",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.compatibledevice && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>
                                                Compatible Device
                                              </Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.compatibledevices?.map(
                                                    (item) => ({
                                                      ...item,
                                                      label: item,
                                                      value: item,
                                                    })
                                                  )}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.compatibledevice,
                                                  value: todo.compatibledevice,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "compatibledevice",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.outputpower && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Output Power</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.outputpower?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.outputpower,
                                                  value: todo.outputpower,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "outputpower",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.collingfancount && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>
                                                Cooling Fan Count
                                              </Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.coolingfancount?.map(
                                                    (item) => ({
                                                      ...item,
                                                      label: item,
                                                      value: item,
                                                    })
                                                  )}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.collingfancount,
                                                  value: todo.collingfancount,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "collingfancount",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.clockspeed && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Clock Speed</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  ?.find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.clockspeed?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.clockspeed,
                                                  value: todo.clockspeed,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "clockspeed",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.core && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Core</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  ?.find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.core?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.core,
                                                  value: todo.core,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "core",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.speed && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Speed</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  ?.find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.speed?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.speed,
                                                  value: todo.speed,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "speed",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.frequency && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Frequency</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  ?.find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.frequency?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.frequency,
                                                  value: todo.frequency,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "frequency",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.output && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Output</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  ?.find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.output?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.output,
                                                  value: todo.output,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "output",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.ethernetports && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>
                                                Ethernet Ports
                                              </Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  ?.find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.ethernetports?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.ethernetports,
                                                  value: todo.ethernetports,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "ethernetports",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.distance && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Distance</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  ?.find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.distance?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                value={{
                                                  label: todo.distance,
                                                  value: todo.distance,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "distance",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.lengthname && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Length</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  ?.find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.lengthname?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.lengthname,
                                                  value: todo.lengthname,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "lengthname",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.slot && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Slot</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  ?.find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.slot?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.slot,
                                                  value: todo.slot,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "slot",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.noofchannels && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>
                                                No. Of Channels
                                              </Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  ?.find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.noofchannels?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.noofchannels,
                                                  value: todo.noofchannels,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "noofchannels",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.colours && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Colour</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  ?.find(
                                                    (item) =>
                                                      item.subcomponent ===
                                                      todo.subname
                                                  )
                                                  ?.colours?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.colours,
                                                  value: todo.colours,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "colours",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  <>
                                    <Grid item md={3} sm={6} xs={12}>
                                      <Grid container spacing={2}>
                                        <Grid item md={10} sm={10} xs={10}>
                                          <FormControl fullWidth size="small">
                                            <Typography>Warranty</Typography>
                                            <Select
                                              fullWidth
                                              labelId="demo-select-small"
                                              id="demo-select-small"
                                              value={todo.warranty}
                                              disabled={todo.subcomponentcheck === false}
                                              onChange={(e) => {
                                                handleChangeEdit(
                                                  index,
                                                  "warranty",
                                                  e.target.value
                                                );
                                              }}
                                            >
                                              <MenuItem value="" disabled>
                                                {" "}
                                                Please Select
                                              </MenuItem>
                                              <MenuItem value="Yes">
                                                {" "}
                                                {"Yes"}{" "}
                                              </MenuItem>
                                              <MenuItem value="No">
                                                {" "}
                                                {"No"}{" "}
                                              </MenuItem>
                                            </Select>
                                          </FormControl>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </>

                                  {todo.warranty === "Yes" && (
                                    <>
                                      <Grid item md={3} sm={6} xs={12}>
                                        <Grid container>
                                          <Grid item md={6} xs={6} sm={6}>
                                            <Typography>Warranty Time</Typography>
                                            <FormControl fullWidth size="small">
                                              <OutlinedInput
                                                id="component-outlined"
                                                type="text"
                                                size="small"
                                                placeholder="Enter Time"
                                                value={todo.estimation}
                                                disabled={todo.subcomponentcheck === false}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "estimation",
                                                    e.target.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>
                                          <Grid item md={6} xs={6} sm={6}>
                                            <Typography>Estimation</Typography>
                                            <Select
                                              fullWidth
                                              labelId="demo-select-small"
                                              id="demo-select-small"
                                              size="small"
                                              value={todo.estimationtime}
                                              disabled={todo.subcomponentcheck === false}
                                              onChange={(e) => {
                                                handleChangeEdit(
                                                  index,
                                                  "estimationtime",
                                                  e.target.value
                                                );
                                              }}
                                            >
                                              <MenuItem value="" disabled>
                                                {" "}
                                                Please Select
                                              </MenuItem>
                                              <MenuItem value="Days">
                                                {" "}
                                                {"Days"}{" "}
                                              </MenuItem>
                                              <MenuItem value="Month">
                                                {" "}
                                                {"Month"}{" "}
                                              </MenuItem>
                                              <MenuItem value="Year">
                                                {" "}
                                                {"Year"}{" "}
                                              </MenuItem>
                                            </Select>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}

                                  <>
                                    <Grid item md={3} sm={6} xs={12}>
                                      <Grid container spacing={2}>
                                        <Grid item md={10} sm={10} xs={10}>
                                          <FormControl fullWidth size="small">
                                            <Typography>Purchase date </Typography>
                                            <OutlinedInput
                                              id="component-outlined"
                                              type="date"
                                              size="small"
                                              value={todo.purchasedate}
                                              disabled={todo.subcomponentcheck === false}
                                              onChange={(e) => {
                                                handleChangeEdit(
                                                  index,
                                                  "purchasedate",
                                                  e.target.value
                                                );
                                              }}
                                            />
                                          </FormControl>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </>
                                  {todo.warranty === "Yes" && (
                                    <>
                                      <Grid item md={3} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Expiry Date </Typography>
                                              <OutlinedInput
                                                id="component-outlined"
                                                type="text"
                                                disabled={todo.subcomponentcheck === false}
                                                size="small"
                                                placeholder=""
                                                value={todo.warrantycalculation}
                                              />
                                            </FormControl>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}

                                  <>
                                    <Grid item md={3} sm={6} xs={12}>
                                      <Grid container spacing={2}>
                                        <Grid item md={10} sm={10} xs={10}>
                                          <FormControl fullWidth size="small">
                                            <Typography>
                                              Vendor Group Name
                                              <b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <Selects
                                              options={vendorGroupOpt}
                                              styles={colourStyles}
                                              isDisabled={todo.subcomponentcheck === false}
                                              value={{
                                                label: todo.vendorgroup,
                                                value: todo.vendorgroup,
                                              }}
                                              onChange={(e) => {
                                                handleChangeGroupNameIndexBasedEdit(
                                                  e,
                                                  index
                                                );
                                                handleChangeEdit(
                                                  index,
                                                  "vendorgroup",
                                                  e.value
                                                );

                                                setTodosEdit((prev) => {
                                                  const updated = [...prev];
                                                  updated[index].vendor =
                                                    "Choose Vendor";
                                                  return updated;
                                                });
                                              }}
                                            />
                                          </FormControl>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                    <Grid item md={3} sm={6} xs={12}>
                                      <Grid container spacing={2}>
                                        <Grid item md={10} sm={10} xs={10}>
                                          <FormControl fullWidth size="small">
                                            <Typography>
                                              Vendor
                                              <b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <Selects
                                              options={vendorOptIndEdit[index]}
                                              styles={colourStyles}
                                              isDisabled={todo.subcomponentcheck === false}
                                              value={{
                                                label: todo.vendor,
                                                value: todo.vendor,
                                              }}
                                              onChange={(e) => {
                                                handleChangeEdit(
                                                  index,
                                                  "vendor",
                                                  e.value,
                                                  e._id
                                                );

                                                // vendoridEdit(e._id);
                                              }}
                                            />
                                          </FormControl>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </>

                                  <>
                                    <Grid item md={3} sm={6} xs={12}>
                                      <Grid container spacing={2}>
                                        <Grid item md={10} sm={10} xs={10}>
                                          <FormControl fullWidth size="small">
                                            <Typography>Address</Typography>
                                            <OutlinedInput
                                              id="component-outlined"
                                              type="text"
                                              disabled={todo.subcomponentcheck === false}
                                              // value={vendorgetid?.address}
                                              value={todo?.address}
                                              readOnly
                                            />
                                          </FormControl>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </>

                                  <>
                                    <Grid item md={3} sm={6} xs={12}>
                                      <Grid container spacing={2}>
                                        <Grid item md={10} sm={10} xs={10}>
                                          <FormControl fullWidth size="small">
                                            <Typography>Phone Number</Typography>
                                            <OutlinedInput
                                              id="component-outlined"
                                              disabled={todo.subcomponentcheck === false}
                                              type="text"
                                              // value={vendorgetid?.phonenumber}
                                              value={todo?.phonenumber}
                                              readOnly
                                            />
                                          </FormControl>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </>
                                </>
                              )}


                              {/* <Grid item md={1} sm={3} xs={3}>
                              
                                <Button
                                  sx={{
                                    padding: "14px 14px",
                                    marginTop: "16px",
                                    minWidth: "40px !important",
                                    borderRadius: "50% !important",
                                    ":hover": {
                                      backgroundColor: "#80808036", 
                                    },
                                  }}
                                  onClick={() => handleDeleteEdit(index)}
                                >
                                  <FaTrash
                                    style={{
                                      fontSize: "large",
                                      color: "#a73131",
                                    }}
                                  />
                                </Button>
                             
                              </Grid> */}
                            </Grid>
                          </Grid>
                        </Grid>
                      ) : (
                        <Grid container key={index} spacing={1}>
                          <Grid item md={12} sm={12} xs={12} marginTop={2}>
                            <Grid container key={index} spacing={1}>
                              <>
                                <Grid item md={3} sm={6} xs={12}>
                                  <Grid container spacing={2}>
                                    <Grid item md={10} sm={10} xs={10}>


                                      <FormGroup>
                                        <FormControlLabel

                                          control={
                                            <Switch
                                              // color="success"
                                              sx={{
                                                "& .MuiSwitch-switchBase.Mui-checked": {
                                                  color: "green", // Thumb color when checked
                                                },
                                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                  backgroundColor: "green", // Track color when checked
                                                },
                                                "& .MuiSwitch-switchBase": {
                                                  color: "#ff0000a3", // Thumb color when not checked
                                                },
                                                "& .MuiSwitch-switchBase + .MuiSwitch-track": {
                                                  backgroundColor: "#ff0000a3", // Track color when not checked
                                                },
                                              }}
                                              checked={todo.subcomponentcheck}
                                              onChange={(e) => {
                                                handleChangeEdit(
                                                  index,
                                                  "subcomponentcheck",
                                                  e.target.checked
                                                );
                                              }}
                                            />
                                          }
                                          label="Enable Subcomponent"
                                        />
                                      </FormGroup>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </>
                              {todo.subcomponentcheck === true && (
                                <>
                                  {todo.type && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Type</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.type?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                value={{
                                                  label: todo.type,
                                                  value: todo.type,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "type",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>
                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenType();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.model && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Model</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.model?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.model,
                                                  value: todo.model,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "model",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>
                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenModel();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.size && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Size</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.size?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.size,
                                                  value: todo.size,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "size",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>
                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenSize();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.variant && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Variants</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.variant?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.variant,
                                                  value: todo.variant,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "variant",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>
                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              size="small"
                                              variant="contained"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenVariant();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.brand && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl size="small" fullWidth>
                                              <Typography>Brand</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.brand?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.brand,
                                                  value: todo.brand,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "brand",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>
                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenBrand();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.serial !== undefined && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container>
                                          <Grid item md={11.6} sm={10} xs={10}>
                                            <Typography>Serial</Typography>

                                            <OutlinedInput
                                              fullWidth
                                              type="text"
                                              size="small"
                                              placeholder="Please Enter Serial"
                                              value={todo.serial}
                                              disabled={todo.subcomponentcheck === false}
                                              onChange={(e) => {
                                                handleChangeEdit(
                                                  index,
                                                  "serial",
                                                  e.target.value
                                                );
                                              }}
                                            />
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.other !== undefined && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container>
                                          <Grid item md={11.6} sm={10} xs={10}>
                                            <Typography>Others</Typography>

                                            <OutlinedInput
                                              fullWidth
                                              type="text"
                                              size="small"
                                              placeholder="Please Enter Other"
                                              value={todo.other}
                                              disabled={todo.subcomponentcheck === false}
                                              onChange={(e) => {
                                                handleChangeEdit(
                                                  index,
                                                  "other",
                                                  e.target.value
                                                );
                                              }}
                                            />
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.capacity && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Capacity</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.capacity?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.capacity,
                                                  value: todo.capacity,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "capacity",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.hdmiport !== undefined && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container>
                                          <Grid item md={11.6} sm={10} xs={10}>
                                            <Typography>HDMI Port</Typography>

                                            <OutlinedInput
                                              fullWidth
                                              type="text"
                                              size="small"
                                              placeholder="Please Enter HDMI Port"
                                              value={todo.hdmiport}
                                              disabled={todo.subcomponentcheck === false}
                                              onChange={(e) => {
                                                const inputText = e.target.value;
                                                // Regex to allow only non-negative numbers
                                                const validatedInput =
                                                  inputText.match(/^\d*$/);

                                                const sanitizedInput =
                                                  validatedInput !== null
                                                    ? validatedInput[0]
                                                    : "0";
                                                handleChangeEdit(
                                                  index,
                                                  "hdmiport",
                                                  sanitizedInput
                                                );
                                              }}
                                            />
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.vgaport !== undefined && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container>
                                          <Grid item md={11.6} sm={10} xs={10}>
                                            <Typography>VGA Port</Typography>

                                            <OutlinedInput
                                              fullWidth
                                              type="text"
                                              size="small"
                                              placeholder="Please Enter VGA Port"
                                              value={todo.vgaport}
                                              disabled={todo.subcomponentcheck === false}
                                              onChange={(e) => {
                                                const inputText = e.target.value;
                                                // Regex to allow only non-negative numbers
                                                const validatedInput =
                                                  inputText.match(/^\d*$/);

                                                const sanitizedInput =
                                                  validatedInput !== null
                                                    ? validatedInput[0]
                                                    : "0";
                                                handleChangeEdit(
                                                  index,
                                                  "vgaport",
                                                  sanitizedInput
                                                );
                                              }}
                                            />
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.dpport !== undefined && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container>
                                          <Grid item md={11.6} sm={10} xs={10}>
                                            <Typography>DP Port</Typography>

                                            <OutlinedInput
                                              fullWidth
                                              type="text"
                                              size="small"
                                              placeholder="Please Enter DP Port"
                                              value={todo.dpport}
                                              disabled={todo.subcomponentcheck === false}
                                              onChange={(e) => {
                                                const inputText = e.target.value;
                                                // Regex to allow only non-negative numbers
                                                const validatedInput =
                                                  inputText.match(/^\d*$/);

                                                const sanitizedInput =
                                                  validatedInput !== null
                                                    ? validatedInput[0]
                                                    : "0";
                                                handleChangeEdit(
                                                  index,
                                                  "dpport",
                                                  sanitizedInput
                                                );
                                              }}
                                            />
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.usbport !== undefined && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container>
                                          <Grid item md={11.6} sm={10} xs={10}>
                                            <Typography>USB Port</Typography>

                                            <OutlinedInput
                                              fullWidth
                                              type="text"
                                              size="small"
                                              placeholder="Please Enter USB Port"
                                              value={todo.usbport}
                                              disabled={todo.subcomponentcheck === false}
                                              onChange={(e) => {
                                                const inputText = e.target.value;
                                                // Regex to allow only non-negative numbers
                                                const validatedInput =
                                                  inputText.match(/^\d*$/);

                                                const sanitizedInput =
                                                  validatedInput !== null
                                                    ? validatedInput[0]
                                                    : "0";
                                                handleChangeEdit(
                                                  index,
                                                  "usbport",
                                                  sanitizedInput
                                                );
                                              }}
                                            />
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}

                                  {todo.paneltypescreen && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Panel Type</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.paneltype?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.paneltypescreen,
                                                  value: todo.paneltypescreen,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "paneltypescreen",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.resolution && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>
                                                Screen Resolution
                                              </Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.screenresolution?.map(
                                                    (item) => ({
                                                      ...item,
                                                      label: item,
                                                      value: item,
                                                    })
                                                  )}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.resolution,
                                                  value: todo.resolution,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "resolution",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.connectivity && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Connectivity</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.connectivity?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.connectivity,
                                                  value: todo.connectivity,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "connectivity",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.daterate && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Data Rate</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.datarate?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.daterate,
                                                  value: todo.daterate,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "daterate",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.compatibledevice && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>
                                                Compatible Device
                                              </Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.compatibledevices?.map(
                                                    (item) => ({
                                                      ...item,
                                                      label: item,
                                                      value: item,
                                                    })
                                                  )}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.compatibledevice,
                                                  value: todo.compatibledevice,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "compatibledevice",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.outputpower && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Output Power</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.outputpower?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.outputpower,
                                                  value: todo.outputpower,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "outputpower",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.collingfancount && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>
                                                Cooling Fan Count
                                              </Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.coolingfancount?.map(
                                                    (item) => ({
                                                      ...item,
                                                      label: item,
                                                      value: item,
                                                    })
                                                  )}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.collingfancount,
                                                  value: todo.collingfancount,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "collingfancount",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.clockspeed && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Clock Speed</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.clockspeed?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.clockspeed,
                                                  value: todo.clockspeed,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "clockspeed",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.core && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Core</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.core?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.core,
                                                  value: todo.core,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "core",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.speed && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Speed</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.speed?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.speed,
                                                  value: todo.speed,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "speed",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.frequency && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Frequency</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.frequency?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.frequency,
                                                  value: todo.frequency,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "frequency",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.output && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Output</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.output?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.output,
                                                  value: todo.output,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "output",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.ethernetports && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>
                                                Ethernet Ports
                                              </Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.ethernetports?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.ethernetports,
                                                  value: todo.ethernetports,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "ethernetports",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.distance && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Distance</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.distance?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.distance,
                                                  value: todo.distance,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "distance",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.lengthname && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Length</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.lengthname?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.lengthname,
                                                  value: todo.lengthname,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "lengthname",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.slot && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Slot</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.slot?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.slot,
                                                  value: todo.slot,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "slot",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.noofchannels && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>
                                                No. Of Channels
                                              </Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.noofchannels?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.noofchannels,
                                                  value: todo.noofchannels,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "noofchannels",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}
                                  {todo.colours && (
                                    <>
                                      <Grid item md={4} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Colour</Typography>
                                              <Selects
                                                options={specificationGroupingEdit
                                                  .find(
                                                    (item) =>
                                                      stockmasteredit.component ===
                                                      item.component &&
                                                      stockmasteredit.productname ===
                                                      item.assetmaterial
                                                  )
                                                  ?.colours?.map((item) => ({
                                                    ...item,
                                                    label: item,
                                                    value: item,
                                                  }))}
                                                styles={colourStyles}
                                                isDisabled={todo.subcomponentcheck === false}
                                                value={{
                                                  label: todo.colours,
                                                  value: todo.colours,
                                                }}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "colours",
                                                    e.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>

                                          <Grid item md={2} sm={2} xs={2}>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              disabled
                                              style={{
                                                height: "30px",
                                                minWidth: "20px",
                                                padding: "19px 13px",
                                                // color: "white",
                                                marginTop: "23px",
                                                marginLeft: "-10px",
                                                // background: "rgb(25, 118, 210)",
                                              }}
                                              onClick={() => {
                                                handleClickOpenCapacity();
                                              }}
                                            >
                                              <FaPlus
                                                style={{ fontSize: "15px" }}
                                              />
                                            </Button>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}

                                  <>
                                    <Grid item md={3} sm={6} xs={12}>
                                      <Grid container spacing={2}>
                                        <Grid item md={10} sm={10} xs={10}>
                                          <FormControl fullWidth size="small">
                                            <Typography>
                                              Warranty{" "}
                                              <b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <Select
                                              fullWidth
                                              labelId="demo-select-small"
                                              id="demo-select-small"
                                              size="small"
                                              disabled={todo.subcomponentcheck === false}
                                              value={todo.warranty}
                                              // onChange={(e) => {
                                              //   setAssetdetail({ ...assetdetail, warranty: e.target.value });
                                              // }}
                                              // value={todo.serial}
                                              onChange={(e) => {
                                                handleChangeEdit(
                                                  index,
                                                  "warranty",
                                                  e.target.value
                                                );
                                              }}
                                            >
                                              <MenuItem value="" disabled>
                                                {" "}
                                                Please Select
                                              </MenuItem>
                                              <MenuItem value="Yes">
                                                {" "}
                                                {"Yes"}{" "}
                                              </MenuItem>
                                              <MenuItem value="No">
                                                {" "}
                                                {"No"}{" "}
                                              </MenuItem>
                                            </Select>
                                          </FormControl>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </>

                                  {todo.warranty === "Yes" && (
                                    <>
                                      <Grid item md={3} sm={6} xs={12}>
                                        <Grid container>
                                          <Grid item md={6} xs={6} sm={6}>
                                            <Typography>
                                              Warranty Time{" "}
                                              <b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <FormControl fullWidth size="small">
                                              <OutlinedInput
                                                id="component-outlined"
                                                type="text"
                                                size="small"
                                                placeholder="Enter Time"
                                                value={todo.estimation}
                                                disabled={todo.subcomponentcheck === false}
                                                onChange={(e) => {
                                                  handleChangeEdit(
                                                    index,
                                                    "estimation",
                                                    e.target.value
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                          </Grid>
                                          <Grid item md={6} xs={6} sm={6}>
                                            <Typography>
                                              Estimation{" "}
                                              <b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <Select
                                              fullWidth
                                              labelId="demo-select-small"
                                              id="demo-select-small"
                                              size="small"
                                              value={todo.estimationtime}
                                              disabled={todo.subcomponentcheck === false}
                                              onChange={(e) => {
                                                handleChangeEdit(
                                                  index,
                                                  "estimationtime",
                                                  e.target.value
                                                );
                                                // handleEstimationChange()
                                              }}
                                            // onChange={handleEstimationChange}
                                            >
                                              <MenuItem value="" disabled>
                                                {" "}
                                                Please Select
                                              </MenuItem>
                                              <MenuItem value="Days">
                                                {" "}
                                                {"Days"}{" "}
                                              </MenuItem>
                                              <MenuItem value="Month">
                                                {" "}
                                                {"Month"}{" "}
                                              </MenuItem>
                                              <MenuItem value="Year">
                                                {" "}
                                                {"Year"}{" "}
                                              </MenuItem>
                                            </Select>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}

                                  <>
                                    <Grid item md={3} sm={6} xs={12}>
                                      <Grid container spacing={2}>
                                        <Grid item md={10} sm={10} xs={10}>
                                          <FormControl fullWidth size="small">
                                            <Typography>Purchase date </Typography>
                                            <OutlinedInput
                                              id="component-outlined"
                                              type="date"
                                              size="small"
                                              value={todo.purchasedate}
                                              disabled={todo.subcomponentcheck === false}
                                              onChange={(e) => {
                                                handleChangeEdit(
                                                  index,
                                                  "purchasedate",
                                                  e.target.value
                                                );
                                                // handlePurchaseDateChange()
                                              }}
                                            // onChange={handlePurchaseDateChange}
                                            />
                                          </FormControl>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </>
                                  {todo.warranty === "Yes" && (
                                    <>
                                      <Grid item md={3} sm={6} xs={12}>
                                        <Grid container spacing={2}>
                                          <Grid item md={10} sm={10} xs={10}>
                                            <FormControl fullWidth size="small">
                                              <Typography>Expiry Date </Typography>
                                              <OutlinedInput
                                                id="component-outlined"
                                                type="text"
                                                size="small"
                                                placeholder=""
                                                disabled={todo.subcomponentcheck === false}
                                                value={todo.warrantycalculation}
                                              // onChange={(e) => {
                                              //   setAssetdetail({ ...assetdetail, warrantyCalculation: e.target.value });
                                              // }}
                                              />
                                            </FormControl>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </>
                                  )}

                                  <>
                                    <Grid item md={3} sm={6} xs={12}>
                                      <Grid container spacing={2}>
                                        <Grid item md={10} sm={10} xs={10}>
                                          <FormControl fullWidth size="small">
                                            <Typography>
                                              Vendor Group Name
                                              <b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <Selects
                                              options={vendorGroupOpt}
                                              styles={colourStyles}
                                              isDisabled={todo.subcomponentcheck === false}
                                              value={{
                                                label: todo.vendorgroup,
                                                value: todo.vendorgroup,
                                              }}
                                              onChange={(e) => {
                                                handleChangeGroupNameIndexBasedEdit(
                                                  e,
                                                  index
                                                );
                                                handleChangeEdit(
                                                  index,
                                                  "vendorgroup",
                                                  e.value
                                                );

                                                setTodosEdit((prev) => {
                                                  const updated = [...prev];
                                                  updated[index].vendor =
                                                    "Choose Vendor";
                                                  return updated;
                                                });
                                              }}
                                            />
                                          </FormControl>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                    <Grid item md={3} sm={6} xs={12}>
                                      <Grid container spacing={2}>
                                        <Grid item md={10} sm={10} xs={10}>
                                          <FormControl fullWidth size="small">
                                            <Typography>
                                              Vendor
                                              <b style={{ color: "red" }}>*</b>
                                            </Typography>
                                            <Selects
                                              options={vendorOptIndEdit[index]}
                                              styles={colourStyles}
                                              isDisabled={todo.subcomponentcheck === false}
                                              value={{
                                                label: todo.vendor,
                                                value: todo.vendor,
                                              }}
                                              onChange={(e) => {
                                                handleChangeEdit(
                                                  index,
                                                  "vendor",
                                                  e.value,
                                                  e._id
                                                );

                                                // vendoridEdit(e._id);
                                              }}
                                            />
                                          </FormControl>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </>

                                  <>
                                    <Grid item md={3} sm={6} xs={12}>
                                      <Grid container spacing={2}>
                                        <Grid item md={10} sm={10} xs={10}>
                                          <FormControl fullWidth size="small">
                                            <Typography>Address</Typography>
                                            <OutlinedInput
                                              id="component-outlined"
                                              type="text"
                                              disabled={todo.subcomponentcheck === false}
                                              // value={vendorgetid?.address}
                                              value={todo?.address}
                                              readOnly
                                            />
                                          </FormControl>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </>

                                  <>
                                    <Grid item md={3} sm={6} xs={12}>
                                      <Grid container spacing={2}>
                                        <Grid item md={10} sm={10} xs={10}>
                                          <FormControl fullWidth size="small">
                                            <Typography>Phone Number</Typography>
                                            <OutlinedInput
                                              id="component-outlined"
                                              type="text"
                                              disabled={todo.subcomponentcheck === false}
                                              // value={vendorgetid?.phonenumber}
                                              value={todo?.phonenumber}
                                              readOnly
                                            />
                                          </FormControl>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </>

                                </>
                              )}

                              {/* <Grid item md={1} sm={3} xs={3}>
                                <Button
                                  sx={{
                                    padding: "14px 14px",
                                    marginTop: "16px",
                                    minWidth: "40px !important",
                                    borderRadius: "50% !important",
                                    ":hover": {
                                      backgroundColor: "#80808036", // theme.palette.primary.main
                                    },
                                  }}
                                  onClick={() => handleDeleteEdit(index)}
                                >
                                  <FaTrash
                                    style={{
                                      fontSize: "large",
                                      color: "#a73131",
                                    }}
                                  />
                                </Button>
                              </Grid> */}
                            </Grid>
                          </Grid>
                        </Grid>
                      )}
                      <br />
                    </>
                  );
                })}
              <br />
              <br />
              <Grid container spacing={2}>
                <Grid item md={3} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Product Details <b style={{ color: "red" }}>*</b>{" "}
                    </Typography>
                    <TextareaAutosize
                      aria-label="minimum height"
                      minRows={2}
                      value={stockmasteredit.productdetails}
                      placeholder="Please Enter Product Details"
                      onChange={(e) => {
                        setStockmasteredit({
                          ...stockmasteredit,
                          productdetails: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                {stockmasteredit.warranty === "Yes" && (
                  <Grid item md={3} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Warranty Details <b style={{ color: "red" }}>*</b>{" "}
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        value={stockmasteredit.warrantydetails}
                        sx={userStyle.input}
                        placeholder="Please Enter Warranty Details"
                        onChange={(e) => {
                          setStockmasteredit({
                            ...stockmasteredit,
                            warrantydetails: e.target.value,
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                )}
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl size="small" fullWidth>
                    <Typography>
                      UOM <b style={{ color: "red" }}>*</b>{" "}
                    </Typography>
                    <Selects
                      options={vomMasterget}
                      styles={colourStyles}
                      value={{
                        label: stockmasteredit.uom,
                        value: stockmasteredit.uom,
                      }}
                      onChange={(e) => {
                        setStockmasteredit({
                          ...stockmasteredit,
                          uom: e.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Qty<b style={{ color: "red" }}>*</b>{" "}
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Please Enter Quantity"
                      value={stockmasteredit.quantity}
                      onChange={(e) => {
                        setStockmasteredit({
                          ...stockmasteredit,
                          quantity: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
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
                      value={stockmasteredit.rate}
                      onChange={(e) => {
                        setStockmasteredit({
                          ...stockmasteredit,
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
                      value={stockmasteredit.billdate}
                      onChange={(e) => {
                        setStockmasteredit({
                          ...stockmasteredit,
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
                      onClick={handleClickUploadPopupOpenedit}
                    >
                      Upload
                    </Button>
                  </Box>
                </Grid>
                {stockmasteredit.warranty === "Yes" && (
                  <Grid item md={3} xs={12} sm={12}>
                    <Typography>Warranty Card </Typography>
                    <Box sx={{ display: "flex", justifyContent: "left" }}>
                      <Button
                        variant="contained"
                        onClick={handleClickUploadPopupOpenwarrantyedit}
                      >
                        Upload
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
              <br /> <br />
              <Grid container spacing={2}>
                <Grid item md={6} xs={12} sm={12}>
                  {btnSubmit ? (
                    <Box sx={{ display: "flex" }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      <Button variant="contained" sx={buttonStyles.buttonsubmit} onClick={editSubmit}>
                        {" "}
                        Update
                      </Button>
                    </>
                  )}
                </Grid>
                <br />
                <Grid item md={6} xs={12} sm={12}>
                  <Button sx={buttonStyles.btncancel} onClick={handleCloseModEdit}>
                    {" "}
                    Cancel{" "}
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>
      <br />

      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes("lstockpurchase") && (
        <>
          {" "}
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
              <Box sx={userStyle.container}>
                {/* ******************************************************EXPORT Buttons****************************************************** */}
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>
                    Asset Purchase List
                  </Typography>
                </Grid>

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
                      {isUserRoleCompare?.includes("excelstockpurchase") && (
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
                      {isUserRoleCompare?.includes("csvstockpurchase") && (
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
                      {isUserRoleCompare?.includes("printstockpurchase") && (
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
                      {isUserRoleCompare?.includes("pdfstockpurchase") && (
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
                      {isUserRoleCompare?.includes("imagestockpurchase") && (
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






                  <Popover
                    id={idSearch}
                    open={openSearch}
                    anchorEl1={anchorElSearch}
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
                        onClick={handleOpenManageColumns1}
                      >
                        Manage Columns
                      </Button>
                      {isUserRoleCompare?.includes("bdstockpurchase") && (
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
                  {/* Manage Column */}

                  <Popover
                    id={id}
                    open={isManageColumnsOpen}
                    anchorEl1={anchorEl1}
                    onClose={handleCloseManageColumns1}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left", }}
                  // transformOrigin={{ vertical: 'center', horizontal: 'right', }}
                  >
                    {manageColumnsContent}
                  </Popover>
                </Grid>
                <br />
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

                {/* <Box>
                  <Pagination page={page} pageSize={pageSize} totalPages={totalPages} onPageChange={handlePageChange} pageItemLength={filteredDatas?.length} totalProjects={totalProjects} />
                </Box> */}

                {/* ****** Table End ****** */}
              </Box>
            </>
          )}
        </>
      )}

      {/* ****** Table End ****** */}








      {/* view model */}
      <Dialog
        open={openview}
        onClose={handleClickOpenview}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        fullWidth={true}
        sx={{ marginTop: "95px" }}
      >
        <Box sx={{ padding: "20px 50px" }}>
          <>
            <Typography sx={userStyle.HeaderText}>
              {" "}
              View Asset Purchase
            </Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Company</Typography>
                  <Typography>{stockmasteredit.company}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Branch</Typography>
                  <Typography>{stockmasteredit.branch}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Unit</Typography>
                  <Typography>{stockmasteredit.unit}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Floor</Typography>
                  <Typography>{stockmasteredit.floor}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Area</Typography>
                  <Typography>{stockmasteredit.area}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Location</Typography>
                  <Typography>{stockmasteredit.location}</Typography>
                </FormControl>
              </Grid>
              {/* <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">WorkStation</Typography>
                  <Typography>{stockmasteredit.workstation}</Typography>
                </FormControl>
              </Grid> */}
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Warranty</Typography>
                  <Typography>{stockmasteredit.warranty}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Purchasedate</Typography>
                  <Typography>{
                    stockmasteredit.purchasedate
                  }</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Vendor Group</Typography>
                  <Typography>{stockmasteredit.vendorgroup}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Vendor Name</Typography>
                  <Typography>{stockmasteredit.vendor}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Gst No</Typography>
                  <Typography>{stockmasteredit.gstno}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Bill No</Typography>
                  <Typography>{stockmasteredit.billno}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Asset Head</Typography>
                  <Typography>{stockmasteredit.producthead}</Typography>
                </FormControl>
              </Grid>
              {/* <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Asset Type</Typography>
                  <Typography>{stockmasteredit.assettype}</Typography>
                </FormControl>
              </Grid> */}
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Material</Typography>
                  <Typography>{stockmasteredit.productname}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Component</Typography>
                  <Typography>{stockmasteredit.component}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Product Details</Typography>
                  <Typography>{stockmasteredit.productdetails}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Warranty Details</Typography>
                  <Typography>{stockmasteredit.warrantydetails}</Typography>
                </FormControl>
              </Grid>

              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Quantity</Typography>
                  <Typography>{stockmasteredit.quantity}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Quantity & UOM</Typography>
                  <Typography>
                    {stockmasteredit.uomcode !== "" ||
                      stockmasteredit.uomcode !== undefined
                      ? `${stockmasteredit.quantity}#${stockmasteredit.uomcode}`
                      : ""}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Rate</Typography>
                  <Typography>{stockmasteredit.rate}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Bill Date</Typography>
                  <Typography>
                    {moment(stockmasteredit.billdate).format("DD/MM/YYYY")}
                  </Typography>
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br /> <br />
            <Grid container spacing={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCloseview}
              >
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
          open={isErrorOpenpop}
          onClose={handleCloseerrpop}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="md"
          fullWidth={true}
        >
          <DialogContent
            sx={{ width: "350px", textAlign: "center", alignItems: "center" }}
          >
            <Typography variant="h6">{showAlertpop}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              style={{
                padding: "7px 13px",
                color: "white",
                background: "rgb(25, 118, 210)",
              }}
              onClick={() => {
                sendEditRequest();
                handleCloseerrpop();
              }}
            >
              ok
            </Button>
            <Button
              style={{
                backgroundColor: "#f4f4f4",
                color: "#444",
                boxShadow: "none",
                borderRadius: "3px",
                padding: "7px 13px",
                border: "1px solid #0000006b",
                "&:hover": {
                  "& .css-bluauu-MuiButtonBase-root-MuiButton-root": {
                    backgroundColor: "#f4f4f4",
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
            <Button
              variant="contained"
              style={{
                padding: "7px 13px",
                color: "white",
                background: "rgb(25, 118, 210)",
              }}
              onClick={handleCloseerr}
            >
              ok
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

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
                <span
                  style={{ fontWeight: "700", color: "#777" }}
                >{`${deleteproject.name} `}</span>
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
                <span
                  style={{ fontWeight: "700", color: "#777" }}
                >{`${deleteproject.name} `}</span>
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
        sx={{ marginTop: "95px" }}
        // sx={{
        //     overflow: "visible",
        //     "& .MuiPaper-root": {
        //         overflow: "visible",
        //     },
        // }}
        fullWidth={true}
      >
        <VendorPopup
          setVendorAuto={setVendorAuto}
          handleCloseviewalertvendor={handleCloseviewalertvendor}
        />
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
                <Button
                  variant="contained"
                  sx={buttonStyles.buttonsubmit}
                  onClick={handleSubmituom}
                >
                  Submit
                </Button>
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
        fullWidth={true}
        sx={{
          overflow: "visible",
          "& .MuiPaper-root": {
            overflow: "visible",
          },
        }}
      >
        {/* <AssetMaterialPopup /> */}
        <Grid item md={2.5} xs={12} sm={6}>
          <Button sx={userStyle.btncancel} onClick={handleCloseviewalertAsset}>
            Cancel
          </Button>
        </Grid>
      </Dialog>

      {/* UPLOAD BILL CREATE IMAGE DIALOG */}
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
      </Dialog>

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
                      onChange={handleInputChangeedit}
                    />
                  </Button>
                  &ensp;
                </Grid>
              </FormControl>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              {refImageedit.map((file, index) => (
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
                        onClick={() => renderFilePreviewedit(file)}
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

      {/* UPLOAD WARRANTY IMAGE DIALOG    CREATE*/}
      <Dialog
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
      </Dialog>

      {/* dialog box for capacity */}
      <Dialog
        open={openCapacity}
        onClose={handleClickOpenCapacity}
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
        {isUserRoleCompare?.includes("aassetcapacity") ? (
          <Box sx={userStyle.dialogbox}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>
                    Manage Capacity
                  </Typography>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Name <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Please Enter Name"
                      value={capacityname}
                      onChange={(e) => {
                        setcapacityname(e.target.value);
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <br />
              <br />
              <Grid container>
                <Grid item md={3} xs={12} sm={6}>
                  <Button
                    variant="contained"
                    color="primary"
                    //  onClick={handleSubmitCapacity}
                    sx={buttonStyles.buttonsubmit}
                  >
                    Submit
                  </Button>
                </Grid>
                <br />
                <Grid item md={3} xs={12} sm={6}>
                  <Button
                    sx={buttonStyles.btncancel}
                  // onClick={handleclearCapacity}
                  >
                    Clear
                  </Button>
                </Grid>
                <Grid item md={3} xs={12} sm={6}>
                  <Button
                    sx={buttonStyles.btncancel}
                    onClick={handleClickCloseCapacity}
                  >
                    Close
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        ) : (
          <>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>
                    Manage Capacity
                  </Typography>
                </Grid>
              </Grid>
              <br />
              <br />
              <Box sx={{ textAlign: "center" }}>
                <Typography>No Access</Typography>
              </Box>
              <br />
              <br />
            </DialogContent>
            <DialogActions>
              <Button
                sx={userStyle.btncancel}
                onClick={handleClickCloseCapacity}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

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
              {refImagewarrantyedit?.map((file, index) => (
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
      <br />
      <br />
      <Stocktable vendorAuto={changeTable} />

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
        filename={"AssetPurchase"}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
      {/* INFO */}
      <InfoPopup
        openInfo={openInfo}
        handleCloseinfo={handleCloseinfo}
        heading="Asset Purchase Info"
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
  );
}

export default Stockmaster;