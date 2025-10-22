import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ImageIcon from "@mui/icons-material/Image";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControl, Grid, IconButton, List, ListItem, ListItemText, MenuItem, OutlinedInput, Popover, Select, TextField, Typography, Tooltip, Radio, RadioGroup, FormControlLabel, InputAdornment } from "@mui/material";
import Switch from "@mui/material/Switch";
import axios from "axios";
import domtoimage from 'dom-to-image';
import { saveAs } from "file-saver";
import "jspdf-autotable";
import moment from "moment-timezone";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint, FaSearch } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import AggregatedSearchBar from '../../components/AggregatedSearchBar';
import AggridTable from "../../components/AggridTable";
import AlertDialog from "../../components/Alert";
import {
  DeleteConfirmation,
  PleaseSelectRow,
} from "../../components/DeleteConfirmation.js";
import { handleApiError } from "../../components/Errorhandling";
import ExportData from "../../components/ExportData";
import Headtitle from "../../components/Headtitle";
import InfoPopup from "../../components/InfoPopup.js";
import MessageAlert from "../../components/MessageAlert";
import PageHeading from "../../components/PageHeading";
import { AuthContext, UserRoleAccessContext } from "../../context/Appcontext";
import { userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";
import AggridTableForPaginationTable from "../../components/AggridTableForPaginationTable.js";
import { IoMdOptions } from "react-icons/io";
import { MdClose } from "react-icons/md";
function ProfessionalTaxMaster() {

  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);

  const [overallItems, setOverallItems] = useState([]);

  const [isHandleChange, setIsHandleChange] = useState(false);
  const [searchedString, setSearchedString] = useState("")
  const [fileFormat, setFormat] = useState('')
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
  const [popupContentMalert, setPopupContentMalert] = useState("");
  const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
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
  }

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
      pagename: String("Professional Tax Master"),
      commonid: String(isUserRoleAccess?._id),
      date: String(new Date()),

      addedby: [
        {
          name: String(isUserRoleAccess?.companyname),
          date: String(new Date()),
        },
      ],
    });

  }

  //20.11.2024-------------------------------------------------------------------------------------------------------------------
  const [advancedFilter, setAdvancedFilter] = useState(null);


  const [logicOperator, setLogicOperator] = useState("AND");

  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("Contains");
  const [filterValue, setFilterValue] = useState("");
  const [additionalFilters, setAdditionalFilters] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const conditions = ["Contains", "Does Not Contain", "Equals", "Does Not Equal", "Begins With", "Ends With", "Blank", "Not Blank"]; // AgGrid-like conditions

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

  const gridRef = useRef(null);
  //  Datefield
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + "-" + mm + "-" + dd;
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [professionalTaxMaster, setProfessionalTaxMaster] = useState({ company: "Please Select Company", branch: "Please Select Branch", fromamount: "", toamount: "", taxamount: "", date: today });
  const [professionalTaxMasterEdit, setProfessionalTaxMasterEdit] = useState({ company: "Please Select Company", branch: "Please Select Branch", fromamount: "", toamount: "", taxamount: "", date: "" });
  const [professionalTaxArray, setProfessionalTaxArray] = useState([]);
  const [isBtn, setIsBtn] = useState(false);
  const { isUserRoleCompare, isUserRoleAccess, isAssignBranch, allUsersData, allUnit, allTeam, allCompany, allBranch, pageName, setPageName, buttonStyles } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);
  const [loader, setLoader] = useState(false);

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

  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const [openview, setOpenview] = useState(false);
  const [openInfo, setOpeninfo] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteProfessionalTax, setDeleteProfessionalTax] = useState({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [itemsPdf, setItemsPdf] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProfessionalTaxEdit, setAllProfessionalTaxEdit] = useState([]);
  const [copiedData, setCopiedData] = useState("");
  const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    company: true,
    branch: true,
    fromamount: true,
    toamount: true,
    taxamount: true,
    date: true,
    actions: true,
  };
  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);
  //useEffect
  useEffect(() => {
    addSerialNumber(professionalTaxArray);
  }, [professionalTaxArray]);
  useEffect(() => {
    fetchProfessionalTaxAll();
  }, [isEditOpen]);
  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, []);
  useEffect(() => {
    // Retrieve column visibility from localStorage (if available)
    const savedVisibility = localStorage.getItem("columnVisibility");
    if (savedVisibility) {
      setColumnVisibility(JSON.parse(savedVisibility));
    }
  }, []);
  useEffect(() => {
    // Save column visibility to localStorage whenever it changes
    localStorage.setItem("columnVisibility", JSON.stringify(columnVisibility));
  }, [columnVisibility]);
  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
  };
  // Error Popup model
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
  };
  // view model
  const handleClickOpenview = () => {
    setOpenview(true);
  };
  const handleCloseview = () => {
    setOpenview(false);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
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
  // page refersh reload
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // This is required for Chrome support
  };
  const username = isUserRoleAccess.companyname;
  // Manage Columns
  const handleOpenManageColumns = (event) => {
    setAnchorEl(event.currentTarget);
    setManageColumnsOpen(true);
  };
  const handleCloseManageColumns = () => {
    setManageColumnsOpen(false);
    setSearchQueryManage("");
  };
  //Delete model
  const [isDeleteOpencheckbox, setIsDeleteOpencheckbox] = useState(false);
  const handleClickOpencheckbox = () => {
    setIsDeleteOpencheckbox(true);
  };
  const handleCloseModcheckbox = () => {
    setIsDeleteOpencheckbox(false);
  };
  const [isDeleteOpenalert, setIsDeleteOpenalert] = useState(false);
  const handleClickOpenalert = () => {
    setIsHandleChange(true);
    if (selectedRows.length === 0) {
      setIsDeleteOpenalert(true);
    } else {
      setIsDeleteOpencheckbox(true);
    }
  };
  const handleCloseModalert = () => {
    setIsDeleteOpenalert(false);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const getRowClassName = (params) => {
    if (selectedRows.includes(params.row.id)) {
      return "custom-id-row"; // This is the custom class for rows with item.tat === 'ago'
    }
    return ""; // Return an empty string for other rows
  };
  //set function to get particular row
  const rowData = async (id) => {
    setPageName(!pageName)
    try {
      let res = await axios.get(`${SERVICE.SINGLE_PROFFESIONALTAXMASTER}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDeleteProfessionalTax(res?.data?.sprofessionaltaxmaster);
      handleClickOpen();
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  // Alert delete popup
  let taxid = deleteProfessionalTax._id;
  const deltax = async () => {
    setPageName(!pageName)
    try {
      await axios.delete(`${SERVICE.SINGLE_PROFFESIONALTAXMASTER}/${taxid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      handleResetSearch();
      fetchProfessionalTaxAll();
      handleCloseMod();
      setSelectedRows([]);
      setPage(1);

      setPopupContent("Deleted Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  //add function
  const sendRequest = async () => {
    setIsBtn(true)
    setPageName(!pageName)
    try {
      let brandCreate = await axios.post(SERVICE.CREATE_PROFFESIONALTAXMASTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: String(professionalTaxMaster.company),
        branch: String(professionalTaxMaster.branch),
        fromamount: Number(professionalTaxMaster.fromamount),
        toamount: Number(professionalTaxMaster.toamount),
        taxamount: Number(professionalTaxMaster.taxamount),
        date: String(professionalTaxMaster.date),
        addedby: [
          {
            name: String(username),
            date: String(new Date()),
          },
        ],
      });
      await fetchEmployee(); fetchProfessionalTaxAll();
      setProfessionalTaxMaster({ ...professionalTaxMaster, fromamount: "", toamount: "", taxamount: "", date: today });
      setPopupContent("Added Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
      setIsBtn(false)
    } catch (err) {
      setIsBtn(false)
      const messages = err?.response?.data?.message;
      if (messages) {
        setPopupContentMalert(messages);
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else {
        setPopupContentMalert("something went wrong!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
    }
  };
  //submit option for saving
  const handleSubmit = (e) => {
    e.preventDefault();
    const isNameMatch = professionalTaxArray?.some((item) => item.company === professionalTaxMaster.company && item.branch === professionalTaxMaster.branch && item.fromamount == professionalTaxMaster.fromamount && item.toamount == professionalTaxMaster.toamount);
    if (professionalTaxMaster.company === "Please Select Company") {
      setPopupContentMalert("Please Select Company");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (professionalTaxMaster.branch === "Please Select Branch") {
      setPopupContentMalert("Please Select Branch");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (professionalTaxMaster.fromamount === "") {
      setPopupContentMalert("Please Enter From Amount");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (professionalTaxMaster.toamount === "") {
      setPopupContentMalert("Please Enter To Amount");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (professionalTaxMaster.taxamount === "") {
      setPopupContentMalert("Please Enter Tax Amount");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (Number(professionalTaxMaster.fromamount) > Number(professionalTaxMaster.toamount)) {
      setPopupContentMalert("To Amount must be greater than From Amount");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (isNameMatch) {
      setPopupContentMalert("Data already exists!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      setSearchQuery("");
      sendRequest();
    }
  };
  const handleclear = (e) => {
    e.preventDefault();
    setProfessionalTaxMaster({ company: "Please Select Company", branch: "Please Select Branch", fromamount: "", toamount: "", taxamount: "", date: today });
    setPopupContent("Cleared Successfully");
    setPopupSeverity("success");
    handleClickOpenPopup();
    setSearchQuery("");
  };
  //Edit model...
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === "backdropClick") return;
    setIsEditOpen(false);
  };
  //get single row to edit....
  const getCode = async (e) => {
    setPageName(!pageName)
    try {
      let res = await axios.get(`${SERVICE.SINGLE_PROFFESIONALTAXMASTER}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setProfessionalTaxMasterEdit(res?.data?.sprofessionaltaxmaster);
      handleClickOpenEdit();
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  // get single row to view....
  const getviewCode = async (e) => {
    setPageName(!pageName)
    try {
      let res = await axios.get(`${SERVICE.SINGLE_PROFFESIONALTAXMASTER}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setProfessionalTaxMasterEdit(res?.data?.sprofessionaltaxmaster);
      handleClickOpenview();
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  // get single row to view....
  const getinfoCode = async (e) => {
    setPageName(!pageName)
    try {
      let res = await axios.get(`${SERVICE.SINGLE_PROFFESIONALTAXMASTER}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setProfessionalTaxMasterEdit(res?.data?.sprofessionaltaxmaster);
      handleClickOpeninfo();
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  //Professional Tax master name updateby edit page...
  let updateby = professionalTaxMasterEdit.updatedby;
  let addedby = professionalTaxMasterEdit.addedby;
  let profid = professionalTaxMasterEdit._id;
  //editing the single data...
  const sendEditRequest = async () => {
    setPageName(!pageName)
    try {
      let res = await axios.put(`${SERVICE.SINGLE_PROFFESIONALTAXMASTER}/${profid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: String(professionalTaxMasterEdit.company),
        branch: String(professionalTaxMasterEdit.branch),
        fromamount: Number(professionalTaxMasterEdit.fromamount),
        toamount: Number(professionalTaxMasterEdit.toamount),
        taxamount: Number(professionalTaxMasterEdit.taxamount),
        date: String(professionalTaxMasterEdit.date),
        updatedby: [
          ...updateby,
          {
            name: String(username),
            date: String(new Date()),
          },
        ],
      });
      await fetchEmployee(); fetchProfessionalTaxAll();
      handleCloseModEdit();
      setPopupContent("Updated Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  const editSubmit = (e) => {
    e.preventDefault();
    fetchProfessionalTaxAll();
    const isNameMatch = allProfessionalTaxEdit?.some((item) => item.company === professionalTaxMasterEdit.company && item.branch === professionalTaxMasterEdit.branch && item.fromamount == professionalTaxMasterEdit.fromamount && item.toamount == professionalTaxMasterEdit.toamount);
    if (professionalTaxMasterEdit.company === "Please Select Company") {
      setPopupContentMalert("Please Select Company");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (professionalTaxMasterEdit.branch === "Please Select Branch") {
      setPopupContentMalert("Please Select Branch");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (professionalTaxMasterEdit.fromamount === "") {
      setPopupContentMalert("Please Enter From Amount");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (professionalTaxMasterEdit.toamount === "") {
      setPopupContentMalert("Please Enter To Amount");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (professionalTaxMasterEdit.taxamount === "") {
      setPopupContentMalert("Please Enter Tax Amount");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (Number(professionalTaxMasterEdit.fromamount) > Number(professionalTaxMasterEdit.toamount)) {
      setPopupContentMalert("To Amount must be greater than From Amount");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (isNameMatch) {
      setPopupContentMalert("Data already exists!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      sendEditRequest();
    }
  };
  const [overallFilterdata, setOverallFilterdata] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDatas, setTotalDatas] = useState([]);
  const fetchEmployee = async () => {
    setPageName(!pageName)
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
      queryParams.searchQuery = searchQuery;  // Use searchQuery for regular search
    }

    try {
      let res_employee = await axios.post(SERVICE.PROFFESIONALTAXMASTER_SORTBYASSIGNBRANCH, queryParams, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const ans = res_employee?.data?.result?.length > 0 ? res_employee?.data?.result : []
      const itemsWithSerialNumber = ans?.map((item, index) => ({
        ...item,
        serialNumber: (page - 1) * pageSize + index + 1,
      })).map((data) => ({ ...data, date: moment(data.date).isValid() ? moment(data.date).format('DD-MM-YYYY') : "" }));

      const overallWithSerialNumber = res_employee?.data?.overallitems?.map((item, index) => ({
        ...item,
        serialNumber: index + 1,
      })).map((data) => ({ ...data, date: moment(data.date).isValid() ? moment(data.date).format('DD-MM-YYYY') : "" }));


      setProfessionalTaxArray(itemsWithSerialNumber)
      setOverallFilterdata(itemsWithSerialNumber);
      // setTotalDatas(res_employee?.data?.totalDatas?.length)

      setTotalProjects(ans?.length > 0 ? res_employee?.data?.totalProjects : 0);
      setOverallItems(overallWithSerialNumber)
      setTotalDatas(ans?.length > 0 ? res_employee?.data?.totalProjects : 0);
      setTotalPages(ans?.length > 0 ? res_employee?.data?.totalPages : 0);
      setPageSize((data) => { return ans?.length > 0 ? data : 10 });
      setPage((data) => { return ans?.length > 0 ? data : 1 });
      setLoader(true);
    } catch (err) {
      console.log(err)
      const messages = err?.response?.data?.message;
      if (messages) {
        setPopupContentMalert(messages);
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else {
        setPopupContentMalert("something went wrong!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
    }
  };

  const handleResetSearch = async () => {
    setPageName(!pageName)

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

    try {
      let res_employee = await axios.post(SERVICE.PROFFESIONALTAXMASTER_SORTBYASSIGNBRANCH, queryParams, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const ans = res_employee?.data?.result?.length > 0 ? res_employee?.data?.result : []
      const itemsWithSerialNumber = ans?.map((item, index) => ({
        ...item,
        serialNumber: (page - 1) * pageSize + index + 1,
      })).map((data) => ({ ...data, date: moment(data.date).isValid() ? moment(data.date).format('DD-MM-YYYY') : "" }));

      const overallWithSerialNumber = res_employee?.data?.overallitems?.map((item, index) => ({
        ...item,
        serialNumber: index + 1,
      })).map((data) => ({ ...data, date: moment(data.date).isValid() ? moment(data.date).format('DD-MM-YYYY') : "" }));


      setProfessionalTaxArray(itemsWithSerialNumber)
      setOverallFilterdata(itemsWithSerialNumber);
      // setTotalDatas(res_employee?.data?.totalDatas?.length)

      setTotalProjects(ans?.length > 0 ? res_employee?.data?.totalProjects : 0);
      setOverallItems(overallWithSerialNumber)
      setTotalDatas(ans?.length > 0 ? res_employee?.data?.totalProjects : 0);
      setTotalPages(ans?.length > 0 ? res_employee?.data?.totalPages : 0);
      setPageSize((data) => { return ans?.length > 0 ? data : 10 });
      setPage((data) => { return ans?.length > 0 ? data : 1 });
      setLoader(true);
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setPopupContentMalert(messages);
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      } else {
        setPopupContentMalert("something went wrong!");
        setPopupSeverityMalert("info");
        handleClickOpenPopupMalert();
      }
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [page, pageSize, searchQuery]);
  const [professionalTaxFilterArray, setProfessionalTaxFilterArray] = useState([])
  //get all client user id.
  const fetchProfessionalTaxArray = async () => {
    setPageName(!pageName)
    try {
      let res_freq = await axios.get(SERVICE.ALL_PROFFESIONALTAXMASTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setProfessionalTaxFilterArray(res_freq?.data?.professionaltaxmaster.map((t, index) => ({
        ...t,
        Sno: index + 1,
        Company: t.company,
        Branch: t.branch,
        FromAmount: t.fromamount,
        ToAmount: t.toamount,
        TaxAmount: t.taxamount,
        date: moment(t.date).isValid() ? moment(t.date).format('DD-MM-YYYY') : ""
      })));
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  useEffect(() => {
    fetchProfessionalTaxArray()
  }, [isFilterOpen])
  const bulkdeletefunction = async () => {
    setPageName(!pageName)
    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(`${SERVICE.SINGLE_PROFFESIONALTAXMASTER}/${item}`, {
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

      // await fetchEmployee();
      fetchProfessionalTaxAll();
      handleResetSearch();
      setPopupContent("Deleted Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  //get all Tax.
  const fetchProfessionalTaxAll = async () => {
    setPageName(!pageName)
    try {
      let res_freq = await axios.post(SERVICE.ALL_PROFFESIONALTAXMASTERBYASSIGNBRANCH, {
        assignbranch: accessbranch
      }, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      // setProfessionalTaxArray(res_freq?.data?.professionaltaxmaster);
      setAllProfessionalTaxEdit(res_freq?.data?.professionaltaxmaster.filter((item) => item._id !== professionalTaxMasterEdit._id));
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  const gridRefTableImg = useRef(null);
  // image
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage.toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, "Professional Tax Master.png");
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Professional Tax",
    pageStyle: "print",
  });
  //serial no for listing items
  const addSerialNumber = (datas) => {

    setItems(datas);
  };
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
    setPage(1);
  };
  // Split the search query into individual terms
  const searchTerms = searchQuery.toLowerCase().split(" ");
  // Modify the filtering logic to check each term
  const filteredDatas = overallFilterdata?.filter((item) => {
    return searchTerms.every((term) => Object.values(item).join(" ").toLowerCase().includes(term));
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
      headerName: "Checkbox",
      headerStyle: {
        fontWeight: "bold", // Apply the font-weight style to make the header text bold
        // Add any other CSS styles as needed
      },
      headerCheckboxSelection: true,
      checkboxSelection: true,
      pinned: 'left',
      sortable: false, // Optionally, you can make this column not sortable
      width: 90,
      hide: !columnVisibility.checkbox,
      headerClassName: "bold-header",
    },
    {
      field: "serialNumber",
      headerName: "SNo",
      flex: 0,
      width: 100,
      hide: !columnVisibility.serialNumber,
      headerClassName: "bold-header",
      pinned: 'left',
    },
    {
      field: "company",
      headerName: "Company",
      flex: 0,
      width: 150,
      hide: !columnVisibility.company,
      headerClassName: "bold-header",
      pinned: 'left',
    },
    {
      field: "branch",
      headerName: "Branch",
      flex: 0,
      width: 150,
      hide: !columnVisibility.branch,
      headerClassName: "bold-header",
      pinned: 'left',
    },
    {
      field: "fromamount",
      headerName: "From Amount",
      flex: 0,
      width: 180,
      hide: !columnVisibility.fromamount,
      headerClassName: "bold-header",
    },
    {
      field: "toamount",
      headerName: "To Amount",
      flex: 0,
      width: 150,
      hide: !columnVisibility.toamount,
      headerClassName: "bold-header",
    },
    {
      field: "taxamount",
      headerName: "Tax Amount",
      flex: 0,
      width: 150,
      hide: !columnVisibility.taxamount,
      headerClassName: "bold-header",
    },
    {
      field: "date",
      headerName: "Date",
      flex: 0,
      width: 150,
      hide: !columnVisibility.date,
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
          {isUserRoleCompare?.includes("eprofessionaltaxmaster") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getCode(params.data.id);
              }}
            >
              <EditOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttonedit} />
            </Button>
          )}
          {isUserRoleCompare?.includes("dprofessionaltaxmaster") && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.data.id);
              }}
            >
              <DeleteOutlineOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttondelete} />
            </Button>
          )}
          {isUserRoleCompare?.includes("vprofessionaltaxmaster") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getviewCode(params.data.id);
              }}
            >
              <VisibilityOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttonview} />
            </Button>
          )}
          {isUserRoleCompare?.includes("iprofessionaltaxmaster") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {

                getinfoCode(params.data.id);
              }}
            >
              <InfoOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttoninfo} />
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
      fromamount: item.fromamount,
      toamount: item.toamount,
      taxamount: item.taxamount,
      // date: moment(item.date).format('DD-MM-YYYY'),
      date: item.date,
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
        <TextField label="Find column" variant="standard" fullWidth value={searchQueryManage} onChange={(e) => setSearchQueryManage(e.target.value)} sx={{ marginBottom: 5, position: "absolute" }} />
      </Box>
      <br />
      <br />
      <DialogContent sx={{ minWidth: "auto", height: "200px", position: "relative" }}>
        <List sx={{ overflow: "auto", height: "100%" }}>
          {filteredColumns.map((column) => (
            <ListItem key={column.field}>
              <ListItemText sx={{ display: "flex" }} primary={<Switch sx={{ marginTop: "-5px" }} size="small" checked={columnVisibility[column.field]} onChange={() => toggleColumnVisibility(column.field)} />} secondary={column.field === "checkbox" ? "Checkbox" : column.headerName} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Grid container>
          <Grid item md={4}>
            <Button variant="text" sx={{ textTransform: "none" }} onClick={() => setColumnVisibility(initialColumnVisibility)}>
              {" "}
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
  let exportColumnNames = ["Company", "Branch", "FromAmount", "ToAmount", "TaxAmount", "Date"];
  let exportRowValues = ["company", "branch", "fromamount", "toamount", "taxamount", "date"];
  return (
    <Box>
      <Headtitle title={"PROFESSIONAL TAX MASTER"} />
      {/* ****** Header Content ****** */}
      <PageHeading
        title="Manage Professional Tax Master"
        modulename="PayRoll"
        submodulename="PayRoll Setup"
        mainpagename="Professional Tax Master"
        subpagename=""
        subsubpagename=""
      />
      <>
        {isUserRoleCompare?.includes("aprofessionaltaxmaster") && (
          <Box sx={userStyle.selectcontainer}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>Add Professional Tax</Typography>
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
                      maxMenuHeight={250}
                      options={accessbranch?.map(data => ({
                        label: data.company,
                        value: data.company,
                      })).filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                      placeholder="Please Select Company"
                      value={{ label: professionalTaxMaster.company, value: professionalTaxMaster.company }}
                      onChange={(e) => {
                        setProfessionalTaxMaster({
                          ...professionalTaxMaster,
                          company: e.value,
                          branch: "Please Select Branch",
                          fromamount: "",
                          toamount: "",
                          taxamount: "",
                        });
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
                      maxMenuHeight={250}
                      options={accessbranch?.filter(
                        (comp) =>
                          professionalTaxMaster.company === comp.company
                      )?.map(data => ({
                        label: data.branch,
                        value: data.branch,
                      })).filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                      placeholder="Please Select Branch"
                      value={{ label: professionalTaxMaster.branch, value: professionalTaxMaster.branch }}
                      onChange={(e) => {
                        setProfessionalTaxMaster({
                          ...professionalTaxMaster,
                          branch: e.value,
                          fromamount: "",
                          toamount: "",
                          taxamount: "",
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      From Amount <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Please Enter From Amount"
                      value={professionalTaxMaster.fromamount}
                      onChange={(e) => {
                        setProfessionalTaxMaster({
                          ...professionalTaxMaster,
                          fromamount: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      To Amount <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Please Enter To Amount"
                      value={professionalTaxMaster.toamount}
                      onChange={(e) => {
                        setProfessionalTaxMaster({
                          ...professionalTaxMaster,
                          toamount: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Tax Amount <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Please Enter Tax Amount"
                      value={professionalTaxMaster.taxamount}
                      onChange={(e) => {
                        setProfessionalTaxMaster({
                          ...professionalTaxMaster,
                          taxamount: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Date
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="date"
                      sx={userStyle.input}
                      value={professionalTaxMaster.date}
                      onChange={(e) => {
                        setProfessionalTaxMaster({
                          ...professionalTaxMaster,
                          date: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <br />
              <br />
              <Grid container>
                <Grid item md={3} xs={12} sm={6}>
                  <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isBtn} sx={buttonStyles.buttonsubmit}>
                    Submit
                  </Button>
                </Grid>
                <Grid item md={3} xs={12} sm={6}>
                  <Button sx={buttonStyles.btncancel} onClick={handleclear}>
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        )}
      </>
      <br /> <br />
      {/* ****** Table Start ****** */}
      {!loader ? (

        <Box sx={{ display: "flex", justifyContent: "center", minHeight: "350px" }}>
          <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
        </Box>

      ) : (
        <>
          {isUserRoleCompare?.includes("lprofessionaltaxmaster") && (
            <Box sx={userStyle.container}>
              {/* ******************************************************EXPORT Buttons****************************************************** */}
              <Grid item xs={8}>
                <Typography sx={userStyle.importheadtext}>List Professional Tax</Typography>
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
                      <MenuItem value={totalDatas}>All</MenuItem>
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
                    {isUserRoleCompare?.includes("excelprofessionaltaxmaster") && (
                      <>
                        <Button onClick={(e) => {
                          setIsFilterOpen(true)
                          fetchProfessionalTaxArray()
                          setFormat("xl")
                        }} sx={userStyle.buttongrp}><FaFileExcel />&ensp;Export to Excel&ensp;</Button>
                      </>
                    )}
                    {isUserRoleCompare?.includes("csvprofessionaltaxmaster") && (
                      <>
                        <Button onClick={(e) => {
                          setIsFilterOpen(true)
                          fetchProfessionalTaxArray()
                          setFormat("csv")
                        }} sx={userStyle.buttongrp}><FaFileCsv />&ensp;Export to CSV&ensp;</Button>
                      </>
                    )}
                    {isUserRoleCompare?.includes("printprofessionaltaxmaster") && (
                      <>
                        <Button sx={userStyle.buttongrp} onClick={handleprint}>
                          &ensp;
                          <FaPrint />
                          &ensp;Print&ensp;
                        </Button>
                      </>
                    )}
                    {isUserRoleCompare?.includes("pdfprofessionaltaxmaster") && (
                      <>
                        <Button sx={userStyle.buttongrp}
                          onClick={() => {
                            setIsPdfFilterOpen(true)
                            fetchProfessionalTaxArray()
                          }}
                        >
                          <FaFilePdf />
                          &ensp;Export to PDF&ensp;
                        </Button>
                      </>
                    )}
                    {isUserRoleCompare?.includes("imageprofessionaltaxmaster") && (
                      <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}>
                        {" "}
                        <ImageIcon sx={{ fontSize: "15px" }} /> &ensp;Image&ensp;{" "}
                      </Button>
                    )}
                  </Box>
                </Grid>
                <Grid item md={2} xs={6} sm={6}>
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

              <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>
                Show All Columns
              </Button>
              &ensp;
              <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumns}>
                Manage Columns
              </Button>
              &ensp;
              {isUserRoleCompare?.includes("bdprofessionaltaxmaster") && (
                <Button variant="contained" color="error" onClick={handleClickOpenalert} sx={buttonStyles.buttonbulkdelete}>
                  Bulk Delete
                </Button>
              )}
              <br />
              <br />
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
                gridRefTable={gridRef}


                totalDatas={totalDatas}

                setFilteredRowData={setFilteredRowData}
                filteredRowData={filteredRowData}

                gridRefTableImg={gridRefTableImg}
                itemsList={overallItems}
              />

              {/* ****** Table End ****** */}
            </Box>
          )}
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
                          fetchEmployee();
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
        </>
      )}
      {/* ****** Table End ****** */}
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
      <Dialog open={openview} onClose={handleClickOpenview} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="sm" fullWidth={true}>
        <Box sx={{ padding: "20px 50px" }}>
          <>
            <Typography sx={userStyle.HeaderText}> View Professional Tax</Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Company</Typography>
                  <Typography>{professionalTaxMasterEdit.company}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Branch</Typography>
                  <Typography>{professionalTaxMasterEdit.branch}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">From Amount</Typography>
                  <Typography>{professionalTaxMasterEdit.fromamount}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> To Amount</Typography>
                  <Typography>{professionalTaxMasterEdit.toamount}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Tax Amount</Typography>
                  <Typography>{professionalTaxMasterEdit.taxamount}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Date</Typography>
                  {/* <Typography>{moment(professionalTaxMasterEdit.date).format('DD-MM-YYYY')}</Typography> */}
                  <Typography>{moment(professionalTaxMasterEdit.date).isValid() ? moment(professionalTaxMasterEdit.date).format('DD-MM-YYYY') : ""}</Typography>
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br /> <br />
            <Grid container spacing={2} sx={{ marginLeft: "-2px" }}>
              <Button variant="contained" color="primary" onClick={handleCloseview} sx={buttonStyles.btncancel}>
                Back
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>
      {/* Edit DIALOG */}
      <Box>
        <Dialog open={isEditOpen} onClose={handleCloseModEdit} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" maxWidth="md" fullWidth={true}>
          <Box sx={{ padding: "20px 50px" }}>
            <>
              <Grid container spacing={2}>
                <Typography sx={userStyle.HeaderText}>Edit Professional Tax</Typography>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Company<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                      maxMenuHeight={250}
                      options={accessbranch?.map(data => ({
                        label: data.company,
                        value: data.company,
                      })).filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                      placeholder="Please Select Company"
                      value={{ label: professionalTaxMasterEdit.company, value: professionalTaxMasterEdit.company }}
                      onChange={(e) => {
                        setProfessionalTaxMasterEdit({
                          ...professionalTaxMasterEdit,
                          company: e.value,
                          branch: "Please Select Branch",
                          fromamount: "",
                          toamount: "",
                          taxamount: "",
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Branch<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                      maxMenuHeight={250}
                      options={accessbranch?.filter(
                        (comp) =>
                          professionalTaxMasterEdit.company === comp.company
                      )?.map(data => ({
                        label: data.branch,
                        value: data.branch,
                      })).filter((item, index, self) => {
                        return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                      })}
                      placeholder="Please Select Branch"
                      value={{ label: professionalTaxMasterEdit.branch, value: professionalTaxMasterEdit.branch }}
                      onChange={(e) => {
                        setProfessionalTaxMasterEdit({
                          ...professionalTaxMasterEdit,
                          branch: e.value,
                          fromamount: "",
                          toamount: "",
                          taxamount: "",
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      From Amount <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Please Enter From Amount"
                      value={professionalTaxMasterEdit.fromamount}
                      onChange={(e) => {
                        setProfessionalTaxMasterEdit({
                          ...professionalTaxMasterEdit,
                          fromamount: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      To Amount <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Please Enter To Amount"
                      value={professionalTaxMasterEdit.toamount}
                      onChange={(e) => {
                        setProfessionalTaxMasterEdit({
                          ...professionalTaxMasterEdit,
                          toamount: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Tax Amount <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="number"
                      sx={userStyle.input}
                      placeholder="Please Enter Tax Amount"
                      value={professionalTaxMasterEdit.taxamount}
                      onChange={(e) => {
                        setProfessionalTaxMasterEdit({
                          ...professionalTaxMasterEdit,
                          taxamount: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Date
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="date"
                      sx={userStyle.input}
                      value={professionalTaxMasterEdit.date}
                      onChange={(e) => {
                        setProfessionalTaxMasterEdit({
                          ...professionalTaxMasterEdit,
                          date: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <br /> <br />
              <Grid container spacing={2}>
                <Grid item md={6} xs={12} sm={12}>
                  <Button variant="contained" onClick={editSubmit} sx={buttonStyles.buttonsubmit}>
                    {" "}
                    Update
                  </Button>
                </Grid>
                <br />
                <Grid item md={6} xs={12} sm={12}>
                  <Button onClick={handleCloseModEdit} sx={buttonStyles.btncancel}>
                    {" "}
                    Cancel{" "}
                  </Button>
                </Grid>
              </Grid>
            </>
          </Box>
        </Dialog>
      </Box>
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
        itemsTwo={overallItems ?? []}
        filename={"Professional Tax"}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
      <InfoPopup
        openInfo={openInfo}
        handleCloseinfo={handleCloseinfo}
        heading="Professional Tax Info"
        addedby={addedby}
        updateby={updateby}
      />
      <DeleteConfirmation
        open={isDeleteOpen}
        onClose={handleCloseMod}
        onConfirm={deltax}
        title="Are you sure?"
        confirmButtonText="Yes"
        cancelButtonText="Cancel"
      />
      <DeleteConfirmation
        open={isDeleteOpencheckbox}
        onClose={handleCloseModcheckbox}
        onConfirm={bulkdeletefunction}
        title="Are you sure?"
        confirmButtonText="Yes"
        cancelButtonText="Cancel"
      />
      <PleaseSelectRow
        open={isDeleteOpenalert}
        onClose={handleCloseModalert}
        message="Please Select any Row"
        iconColor="orange"
        buttonText="OK"
      />
    </Box>
  );
}
export default ProfessionalTaxMaster;