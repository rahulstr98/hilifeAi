import CancelScheduleSendIcon from "@mui/icons-material/CancelScheduleSend";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import SendIcon from "@mui/icons-material/Send";
import AggridTable from "../../components/AggridTable";
import moment from "moment";
import { ExportXL, ExportCSV } from "../../components/Export";
import html2canvas from "html2canvas";
import { MultiSelect } from "react-multi-select-component";
import LoadingButton from "@mui/lab/LoadingButton";
import jsPDF from "jspdf";
import AggregatedSearchBar from "../../components/AggregatedSearchBar";
import { StyledTableRow, StyledTableCell } from "../../components/Table";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  TableBody,
  Table,
  TableHead,
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
  Popover,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Switch from "@mui/material/Switch";
import axios from "axios";
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
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import AggridTableForPaginationTable from "../../components/AggridTableForPaginationTable.js";
import AlertDialog from "../../components/Alert.js";
import { handleApiError } from "../../components/Errorhandling.js";
import ExportData from "../../components/ExportData.js";
import Headtitle from "../../components/Headtitle.js";
import MessageAlert from "../../components/MessageAlert.js";
import PageHeading from "../../components/PageHeading.js";
import {
  AuthContext,
  UserRoleAccessContext,
} from "../../context/Appcontext.js";
import { colourStyles, userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice.js";

function BiometricDeviceOfflineHistory() {
  const [searchedString, setSearchedString] = useState("");
  const [advancedFilter, setAdvancedFilter] = useState(null);
  const [additionalFilters, setAdditionalFilters] = useState([]);
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
  const [selectedCondition, setSelectedCondition] = useState("Contains");
  const [logicOperator, setLogicOperator] = useState("AND");
  const [filterValue, setFilterValue] = useState("");
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const [isBtn, setIsBtn] = useState(false);
  const [isHandleChange, setIsHandleChange] = useState(false);
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
  };

  let exportColumnNames = [
    "Company",
    "Branch",
    "Unit",
    "Floor",
    "Area",
    "Biometric Device ID",
    "Biometric Common Name",
  ];
  let exportRowValues = [
    "company",
    "branch",
    "unit",
    "floor",
    "area",
    "cloudIDC",
    "biometriccommonname",
  ];

  const gridRefTable = useRef(null);

  const [isDisable, setIsDisable] = useState(false);
  const [sourceEdit, setSourceEdit] = useState({
    company: "",
    branch: "",
    department: "",
    dividevalue: "",
    multiplevalue: "",
  });
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

  const [biometricDevicesHistory, setBiometricDevicesHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + "-" + mm + "-" + dd;
  const [filterUser, setFilterUser] = useState({
    fromdate: today,
    todate: today,
  });

  const [selectedMode, setSelectedMode] = useState("Today");
  const mode = [
    { label: "Today", value: "Today" },
    { label: "Yesterday", value: "Yesterday" },
    { label: "Last Week", value: "Last Week" },
    { label: "Last Month", value: "Last Month" },
    { label: "Custom", value: "Custom" },
  ];
  const getDateRange = (mode) => {
    const today = new Date();
    let fromdate, todate;

    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    switch (mode) {
      case "Today":
        fromdate = todate = formatDate(today);
        break;
      case "Yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        fromdate = todate = formatDate(yesterday);
        break;
      case "Last Week":
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(
          today.getDate() - ((today.getDay() + 6) % 7) - 7
        ); // Last Monday
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6); // Last Sunday
        fromdate = formatDate(startOfLastWeek);
        todate = formatDate(endOfLastWeek);
        break;
      case "Last Month":
        fromdate = formatDate(
          new Date(today.getFullYear(), today.getMonth() - 1, 1)
        ); // 1st of last month
        todate = formatDate(new Date(today.getFullYear(), today.getMonth(), 0)); // Last day of last month
        break;
      default:
        fromdate = todate = "";
    }

    return { fromdate, todate };
  };

  const formatDateForInput = (date) => {
    if (isNaN(date.getTime())) {
      return ""; // Return empty if the date is invalid
    }
    return date.toISOString().split("T")[0]; // Converts date to 'yyyy-MM-dd' format
  };
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
        }));

  const { auth } = useContext(AuthContext);
  const [sourceCheck, setSourcecheck] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
  const [biometricDeviceValues, setBiometricDeviceValues] = useState([]);
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
    setSelectedOptionsUnit([]);
    setValueUnitCat([]);
    setBiometricDeviceValues([]);
    setValueBioDevices([]);
    setSelectedOptionsBioDevices([]);
    setSelectedOptionsBranch([]);
  };
  const customValueRendererCompany = (valueCompanyCat, _categoryname) => {
    return valueCompanyCat?.length
      ? valueCompanyCat.map(({ label }) => label)?.join(", ")
      : "Please Select Company";
  };
  //branch multiselect
  const [selectedOptionsBranch, setSelectedOptionsBranch] = useState([]);
  let [valueBranchCat, setValueBranchCat] = useState([]);
  const handleBranchChange = (options) => {
    const values = options.map((a, index) => {
      return a.value;
    });
    setValueBranchCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsBranch(options);
    setBiometricDeviceValues([]);
    setValueBioDevices([]);
    setSelectedOptionsBioDevices([]);
    setSelectedOptionsUnit([]);
    setValueUnitCat([]);
  };
  const customValueRendererBranch = (valueBranchCat, _categoryname) => {
    return valueBranchCat?.length
      ? valueBranchCat.map(({ label }) => label)?.join(", ")
      : "Please Select Branch";
  };

  const [selectedOptionsUnit, setSelectedOptionsUnit] = useState([]);
  let [valueUnitCat, setValueUnitCat] = useState([]);
  const handleUnitChange = (options) => {
    const values = options.map((a, index) => {
      return a.value;
    });
    setValueUnitCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsUnit(options);
    setValueBioDevices([]);
    setSelectedOptionsBioDevices([]);
    BiometricDeviceDropdowns(valueCompanyCat, valueBranchCat, values);
  };
  const customValueRendererUnit = (valueUnitCat, _categoryname) => {
    return valueUnitCat?.length
      ? valueUnitCat.map(({ label }) => label)?.join(", ")
      : "Please Select Unit";
  };
  const BiometricDeviceDropdowns = async (company, branch, unit) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.GET_COMPANY_BRANCH_BIOMETRIC_DEVICES, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: company,
        branch: branch,
        unit: unit,
      });
      const biometricDeviceValues =
        res?.data?.deviceNames?.length > 0 ? res?.data?.deviceNames : [];
      setBiometricDeviceValues(
        biometricDeviceValues?.map((data) => ({
          ...data,
          label: `${data.biometricserialno}`,
          value: `${data.biometricserialno}`,
          biometriccommonname: `${data.biometriccommonname}`,
        }))
      );
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  //branch multiselect
  const [selectedOptionsBioDevices, setSelectedOptionsBioDevices] = useState(
    []
  );
  let [valueBioDevices, setValueBioDevices] = useState([]);
  const handleTemplateChange = (options) => {
    const values = options.map((a, index) => {
      return a.value;
    });
    setValueBioDevices(values);
    setSelectedOptionsBioDevices(options);
  };
  const customValueRendererTemplate = (valueBioDevices, _categoryname) => {
    return valueBioDevices?.length
      ? valueBioDevices?.map(({ label }) => label)?.join(", ")
      : "Please Select Devices";
  };

  //submit option for saving
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedOptionsCompany?.length < 1) {
      setPopupContentMalert("Please Select Company");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (selectedOptionsBranch?.length < 1) {
      setPopupContentMalert("Please Select Branch");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (selectedOptionsUnit?.length < 1) {
      setPopupContentMalert("Please Select Unit");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (selectedOptionsBioDevices?.length < 1) {
      setPopupContentMalert("Please Select Device Names");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else if (filterUser.fromdate === "" && filterUser.todate === "") {
      setPopupContentMalert("Please Select Date");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else {
      fetchBiometricDevicesHistory();
    }
  };
  const handleClear = (e) => {
    e.preventDefault();
    setSelectedOptionsBioDevices([]);
    setSelectedOptionsBranch([]);
    setSelectedOptionsCompany([]);
    setValueBranchCat([]);
    setValueCompanyCat([]);
    setValueBioDevices([]);
    setSelectedOptionsUnit([]);
    setValueUnitCat([]);
    setSelectedMode("Today");
    setFilterUser({ fromdate: today, todate: today });
    setBiometricDeviceValues([]);
    setPopupContent("Cleared Successfully");
    setPopupSeverity("success");
    handleClickOpenPopup();
    setBiometricDevicesHistory([]);
  };
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
          saveAs(blob, "Biometric Device Offline History.png");
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };

  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
    date: true,
    branch: true,
    unit: true,
    floor: true,
    area: true,
    cloudIDC: true,
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

  //get all Sub vendormasters.
  const fetchBiometricDevicesHistory = async () => {
    setPageName(!pageName);
    setSourcecheck(true);
    try {
      let res_vendor = await axios.post(
        SERVICE.ALL_BIOMETRICDEVICE_OFFLINE_HISTORY,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          company: valueCompanyCat,
          branch: valueBranchCat,
          unit: valueUnitCat,
          devices: valueBioDevices,
          fromdate: filterUser.fromdate,
          todate: filterUser.todate,
        }
      );

      const itemsWithSerialNumber =
        res_vendor?.data?.biometricdevicehistory?.map((item, index) => ({
          //   ...item,
          company: item?.deviceNameID ? item?.deviceNameID?.company : "",
          branch: item?.deviceNameID ? item?.deviceNameID?.branch : "",
          unit: item?.deviceNameID ? item?.deviceNameID?.unit : "",
          floor: item?.deviceNameID ? item?.deviceNameID?.floor : "",
          area: item?.deviceNameID ? item?.deviceNameID?.area : "",
          date: moment(item?.date).format("DD-MM-YYYY"),
          offlineHistory: item?.offlineHistory,
          cloudIDC: item?.cloudIDC,
          biometriccommonname: item?.deviceNameID
            ? item?.deviceNameID?.biometriccommonname
            : "",
          serialNumber: index + 1,
          id:item?._id
        }));

      console.log(itemsWithSerialNumber, "itemsWithSerialNumber");
      setBiometricDevicesHistory(itemsWithSerialNumber);
      setSourcecheck(false);
    } catch (err) {
      setSourcecheck(false);
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

 
  const [totalProjects, setTotalProjects] = useState(0);
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

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Biometric Device Offline History",
    pageStyle: "print",
  });

  const getapi = async () => {
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String("Biometric Device Offline History"),
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
    getapi();
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
    addSerialNumber(biometricDevicesHistory);
  }, [biometricDevicesHistory]);

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
  const filteredData = filteredDatas?.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const totalPages = Math.ceil(filteredDatas?.length / pageSize);
  const visiblePages = Math.min(totalPages, 3);
  const firstVisiblePage = Math.max(1, page - 1);
  const lastVisiblePage = Math.min(
    firstVisiblePage + visiblePages - 1,
    totalPages
  );
  const pageNumbers = [];
  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
    <div>
      <Checkbox checked={selectAllChecked} onChange={onSelectAll} />
    </div>
  );

  const [isEditOpen, setIsEditOpen] = useState(false);

  //Edit model...
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };

  const columnDataTable = [
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
      field: "date",
      headerName: "Date",
      flex: 0,
      width: 160,
      hide: !columnVisibility.date,
      headerClassName: "bold-header",
    },
    {
      field: "company",
      headerName: "Company",
      flex: 0,
      width: 160,
      hide: !columnVisibility.company,
      headerClassName: "bold-header",
    },

    {
      field: "branch",
      headerName: "Branch",
      flex: 0,
      width: 170,
      hide: !columnVisibility.branch,
      headerClassName: "bold-header",
      // pinned: 'left',
    },
    {
      field: "unit",
      headerName: "Unit",
      flex: 0,
      width: 170,
      hide: !columnVisibility.unit,
      headerClassName: "bold-header",
      // pinned: 'left',
    },
    {
      field: "floor",
      headerName: "Floor",
      flex: 0,
      width: 170,
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
      field: "cloudIDC",
      headerName: "Biometric Device ID",
      flex: 0,
      width: 170,
      hide: !columnVisibility.cloudIDC,
      headerClassName: "bold-header",
    },
    {
      field: "biometriccommonname",
      headerName: "Biometric Common Name",
      flex: 0,
      width: 250,
      hide: !columnVisibility.biometriccommonname,
      headerClassName: "bold-header",
    },
    {
      field: "actions",
      headerName: "Offline History",
      flex: 0,
      width: 250,
      minHeight: "40px !important",
      sortable: false,
      hide: !columnVisibility.actions,
      headerClassName: "bold-header",
      cellRenderer: (params) => (
        <Grid sx={{ display: "flex", marginTop: 1 }}>
          <Button
            sx={userStyle.buttonedit}
            onClick={() => {
              getCode(params.data);
            }}
          >
            View
          </Button>
        </Grid>
      ),
    },
  ];

  const fileName = "BiometricDeviceOfflinehistory";
  const tableHeadCellStyle = {
    padding: "5px 10px",
    fontSize: "14px",
    boxShadow: "none",
    width: "max-content",
  };
  const tableBodyCellStyle = { padding: "5px 10px", width: "max-content" };
  const [isAttendanceList, setIsAttendanceList] = useState(false);
  const [AttendanceList, setAttendanceList] = useState({});
  // page refersh reload
  const handleClickOpenAttendanceList = () => {
    setIsAttendanceList(true);
  };
  const handleCloseAttendanceList = () => {
    setIsAttendanceList(false);
    setAttendanceList({});
  };
  const getCode = async (e) => {
    setAttendanceList(e);
    handleClickOpenAttendanceList();
  };

  // pdf.....
  const columns = [
    // { title: "Sno", field: "serialNumber" },
    { title: "Date", field: "date" },
    { title: "Company", field: "company" },
    { title: "Branch", field: "branch" },
    { title: "Unit", field: "unit" },
    { title: "Floor", field: "floor" },
    { title: "Area", field: "area" },
    { title: "Device ID", field: "cloudIDC" },
    { title: "Device Common Name", field: "biometriccommonname" },
    { title: "Last Online", field: "lastOnline" },
    { title: "Offline Time", field: "offlineTime" },
  ];
  const downloadPdf = () => {
    const doc = new jsPDF();
    const columnsWithSerial = [
      // Serial number column
      { title: "SNo", dataKey: "serialNumber" },
      ...columns.map((col) => ({ ...col, dataKey: col.field })),
    ];
    // Add a serial number to each row
    const itemsWithSerial = AttendanceList?.offlineHistory?.map((t, index) => ({
      // ...t,
      serialNumber: index + 1,
      date: AttendanceList?.date,
      company: AttendanceList.company,
      branch: AttendanceList.branch,
      unit: AttendanceList.unit,
      floor: AttendanceList.floor,
      area: AttendanceList.area,
      cloudIDC: AttendanceList.cloudIDC,
      biometriccommonname: AttendanceList.biometriccommonname,
      lastOnline: t.lastOnline,
      offlineTime: t.offlineTime,
    }));
    doc.autoTable({
      theme: "grid",
      styles: {
        fontSize: 4,
      },
      columns: columnsWithSerial,
      body: itemsWithSerial,
    });
    doc.save("Biometric Device Offline History.pdf");
  };
  //print...
  const componentRefPopUp = useRef();
  const handleprintPopUp = useReactToPrint({
    content: () => componentRefPopUp.current,
    documentTitle: "Biometric Device Offline History",
    pageStyle: "print",
  });

  const [applyData, setApplyData] = useState([]);

  // get particular columns for export excel
  const getexcelDatas = () => {
    var data = AttendanceList?.offlineHistory?.map((t, index) => ({
      Sno: index + 1,
      Date: AttendanceList?.date,
      Company: AttendanceList.company,
      Branch: AttendanceList.branch,
      Unit: AttendanceList.unit,
      Floor: AttendanceList.floor,
      Area: AttendanceList.area,
      "Device ID": AttendanceList.cloudIDC,
      "Device Common Name": AttendanceList.biometriccommonname,
      "Last Online": t.lastOnline,
      "Offline Time": t.offlineTime,
    }));
    setApplyData(data);
  };
  useEffect(() => {
    getexcelDatas();
  }, [AttendanceList]);

  //image
  const handleCaptureImagePopUp = () => {
    if (componentRefPopUp.current) {
      html2canvas(componentRefPopUp.current).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, "BiometricDeviceOfflinehistory.png");
        });
      });
    }
  };

  const filteredSelectedColumn = columnDataTable.filter(
    (data) =>
      data.field !== "checkbox" &&
      data.field !== "actions" &&
      data.field !== "serialNumber"
  );

  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item.id,
      serialNumber: item.serialNumber,
      company: item.company,
      branch: item.branch,
      unit: item.unit,
      floor: item.floor,
      area: item.area,
      cloudIDC: item.cloudIDC,
      biometriccommonname: item.biometriccommonname,
      offlineHistory: item.offlineHistory,
      date: item.date,
      //   status: item.status,
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

  const [fileFormat, setFormat] = useState("");

  const [status, setStatus] = useState([]);
  const [allValue, setAllValue] = useState([]);

  const commandMapping = [
    {
      label: "To Clear Admin Lock Send",
      value: "To Clear Admin Lock Send",
      deviceCommandN: 1,
    },
    {
      label: "Get Device Info (Registered User, FP, Face count)",
      value: "Get Device Info (Registered User, FP, Face count)",
      deviceCommandN: 2,
    },
    {
      label: "Get All Attendance log",
      value: "Get All Attendance log",
      deviceCommandN: 3,
    },
    {
      label:
        "Get All user info from biometric terminal (including RFID Card, Password, Fingerprint & Face template)",
      value:
        "Get All user info from biometric terminal (including RFID Card, Password, Fingerprint & Face template)",
      deviceCommandN: 4,
    },
    {
      label:
        "Upload User Info To another biometric terminal (including Name, PFID Card, Password, Fingerprint & Face)",
      value:
        "Upload User Info To another biometric terminal (including Name, PFID Card, Password, Fingerprint & Face)",
      deviceCommandN: 5,
    },
    { label: "Enable User", value: "Enable User", deviceCommandN: 6 },
    { label: "Disable User", value: "Disable User", deviceCommandN: 7 },
    { label: "Delete User", value: "Delete User", deviceCommandN: 8 },
  ];

  return (
    <Box>
      <Headtitle title={"BIOMETRIC DEVICES OFFLINE HISTORY"} />
      {/* ****** Header Content ****** */}
      <PageHeading
        title="Biometric Device Offline History"
        modulename="Human Resources"
        submodulename="HR"
        mainpagename="BX-Biometric Device"
        subpagename="Biometric Device Offline History"
        subsubpagename=""
      />

      <br />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes("lbiometricdeviceofflinehistory") && (
       <Box sx={userStyle.dialogbox}>
          {/* ******************************************************EXPORT Buttons****************************************************** */}
          <Grid item xs={8}>
            <Typography sx={userStyle.importheadtext}>
              Filter Biometric Device Offline History
            </Typography>
          </Grid>
          <br />
          <Grid container spacing={2}>
            <Grid item md={3} xs={12} sm={12}>
              <Typography>
                Company<b style={{ color: "red" }}>*</b>
              </Typography>
              <FormControl size="small" fullWidth>
                <MultiSelect
                  options={accessbranch
                    ?.map((data) => ({
                      label: data.company,
                      value: data.company,
                    }))
                    .filter((item, index, self) => {
                      return (
                        self.findIndex(
                          (i) =>
                            i.label === item.label && i.value === item.value
                        ) === index
                      );
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
            {/* Branch Unit Team */}
            <Grid item md={3} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  {" "}
                  Branch<b style={{ color: "red" }}>*</b>
                </Typography>
                <MultiSelect
                  options={accessbranch
                    ?.filter((comp) => valueCompanyCat?.includes(comp.company))
                    ?.map((data) => ({
                      label: data.branch,
                      value: data.branch,
                    }))
                    .filter((item, index, self) => {
                      return (
                        self.findIndex(
                          (i) =>
                            i.label === item.label && i.value === item.value
                        ) === index
                      );
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
            <Grid item md={3} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  {" "}
                  Unit<b style={{ color: "red" }}>*</b>
                </Typography>
                <MultiSelect
                  options={accessbranch
                    ?.filter(
                      (comp) =>
                        valueCompanyCat?.includes(comp.company) &&
                        valueBranchCat?.includes(comp.branch)
                    )
                    ?.map((data) => ({
                      label: data.unit,
                      value: data.unit,
                    }))
                    .filter((item, index, self) => {
                      return (
                        self.findIndex(
                          (i) =>
                            i.label === item.label && i.value === item.value
                        ) === index
                      );
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
            <Grid item md={3} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  Device Names <b style={{ color: "red" }}>*</b>
                </Typography>
                <MultiSelect
                  options={biometricDeviceValues}
                  value={selectedOptionsBioDevices}
                  onChange={(e) => {
                    handleTemplateChange(e);
                  }}
                  valueRenderer={customValueRendererTemplate}
                  labelledBy="Please Select Devices"
                />
              </FormControl>
            </Grid>
            <Grid item md={3} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  {" "}
                  Filter Mode<b style={{ color: "red" }}>*</b>{" "}
                </Typography>
                <Selects
                  labelId="mode-select-label"
                  options={mode}
                  value={{ label: selectedMode, value: selectedMode }}
                  onChange={(selectedOption) => {
                    // Reset the date fields to empty strings
                    let fromdate = "";
                    let todate = "";

                    // If a valid option is selected, get the date range
                    if (selectedOption.value) {
                      const dateRange = getDateRange(selectedOption.value);
                      fromdate = dateRange.fromdate; // Already formatted in 'dd-MM-yyyy'
                      todate = dateRange.todate; // Already formatted in 'dd-MM-yyyy'
                    }
                    // Set the state with formatted dates
                    setFilterUser({
                      ...filterUser,
                      fromdate: formatDateForInput(
                        new Date(fromdate.split("-").reverse().join("-"))
                      ), // Convert to 'yyyy-MM-dd'
                      todate: formatDateForInput(
                        new Date(todate.split("-").reverse().join("-"))
                      ), // Convert to 'yyyy-MM-dd'
                    });
                    setSelectedMode(selectedOption.value); // Update the mode
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item md={3} sm={12} xs={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  {" "}
                  From Date<b style={{ color: "red" }}>*</b>{" "}
                </Typography>
                <OutlinedInput
                  id="component-outlined"
                  type="date"
                  disabled={selectedMode != "Custom"}
                  value={filterUser.fromdate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    // Ensure that the selected date is not in the future
                    const currentDate = new Date().toISOString().split("T")[0];
                    if (selectedDate <= currentDate) {
                      setFilterUser({
                        ...filterUser,
                        fromdate: selectedDate,
                        todate: selectedDate,
                      });
                    } else {
                      // Handle the case where the selected date is in the future (optional)
                      // You may choose to show a message or take other actions.
                    }
                  }}
                  // Set the max attribute to the current date
                  inputProps={{ max: new Date().toISOString().split("T")[0] }}
                />
              </FormControl>
            </Grid>
            <Grid item md={3} sm={12} xs={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  {" "}
                  To Date<b style={{ color: "red" }}>*</b>{" "}
                </Typography>
                <OutlinedInput
                  id="component-outlined"
                  type="date"
                  disabled={selectedMode != "Custom"}
                  value={filterUser.todate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    // Ensure that the selected date is not in the future
                    const currentDate = new Date().toISOString().split("T")[0];
                    const fromdateval =
                      filterUser.fromdate != "" &&
                      new Date(filterUser.fromdate).toISOString().split("T")[0];
                    if (filterUser.fromdate == "") {
                      setPopupContentMalert("Please Select From Date");
                      setPopupSeverityMalert("warning");
                      handleClickOpenPopupMalert();
                    } else if (selectedDate < fromdateval) {
                      setFilterUser({ ...filterUser, todate: "" });
                      setPopupContentMalert(
                        "To Date should be after or equal to From Date"
                      );
                      setPopupSeverityMalert("warning");
                      handleClickOpenPopupMalert();
                    } else if (selectedDate <= currentDate) {
                      setFilterUser({ ...filterUser, todate: selectedDate });
                    } else {
                    }
                  }}
                  // Set the max attribute to the current date
                  inputProps={{
                    max: new Date().toISOString().split("T")[0],
                    min:
                      filterUser.fromdate !== "" ? filterUser.fromdate : null,
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item md={4} xs={12} sm={12} sx={{ marginTop: "25px" }}>
              <Grid container spacing={3}>
                <Grid item md={4} xs={12} sm={6}>
                  <LoadingButton
                    loading={isBtn}
                    onClick={(e) => handleSubmit(e)}
                    variant="contained"
                    sx={buttonStyles.buttonsubmit}
                  >
                    Filter
                  </LoadingButton>
                </Grid>
                <Grid item md={4} xs={12} sm={6}>
                  <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}
      <br />
      {isUserRoleCompare?.includes("lbiometricdeviceofflinehistory") && (
        <>
          <Box sx={userStyle.container}>
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>
                Biometric Device Offline History List
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
                    <MenuItem value={biometricDevicesHistory?.length}>
                      All
                    </MenuItem>
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
                    "excelbiometricdeviceofflinehistory"
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
                    "csvbiometricdeviceofflinehistory"
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
                    "printbiometricdeviceofflinehistory"
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
                    "pdfbiometricdeviceofflinehistory"
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
                    "imagebiometricdeviceofflinehistory"
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
                <AggregatedSearchBar
                  columnDataTable={columnDataTable}
                  setItems={setItems}
                  addSerialNumber={addSerialNumber}
                  setPage={setPage}
                  maindatas={biometricDevicesHistory}
                  setSearchedString={setSearchedString}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  paginated={false}
                  totalDatas={biometricDevicesHistory}
                />
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
            <br />
            <br />
            {sourceCheck ? (
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
                  // totalDatas={totalProjects}
                  searchQuery={searchQuery}
                  handleShowAllColumns={handleShowAllColumns}
                  setFilteredRowData={setFilteredRowData}
                  filteredRowData={filteredRowData}
                  setFilteredChanges={setFilteredChanges}
                  filteredChanges={filteredChanges}
                  gridRefTableImg={gridRefTableImg}
                  itemsList={biometricDevicesHistory}
                />
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

      {/* view model */}
      <Dialog
        open={isAttendanceList}
        onClose={handleCloseAttendanceList}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        fullWidth={true}
        sx={{ marginTop: "80px" }}
      >
        <Box sx={{ padding: "20px 50px" }}>
          <>
            <Typography sx={userStyle.HeaderText}>
              {" "}
              View Biometric Device Offline History
            </Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Company</Typography>
                  <Typography>{AttendanceList?.company}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Branch</Typography>
                  <Typography>{AttendanceList?.branch}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Unit</Typography>
                  <Typography>{AttendanceList?.unit}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Floor</Typography>
                  <Typography>{AttendanceList?.floor}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Area</Typography>
                  <Typography>{AttendanceList?.area}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Device Name</Typography>
                  <Typography>{AttendanceList?.cloudIDC}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Device Common Name</Typography>
                  <Typography>{AttendanceList?.biometriccommonname}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={12} xs={12} sm={12}>
                <Typography variant="h6">Offline History</Typography>
                <br />
                <Grid
                  item
                  md={12}
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
                      "excelbiometricdeviceofflinehistory"
                    ) && (
                      <>
                        <ExportXL csvData={applyData} fileName={fileName} />
                      </>
                    )}
                    {isUserRoleCompare?.includes(
                      "csvbiometricdeviceofflinehistory"
                    ) && (
                      <>
                        <ExportCSV csvData={applyData} fileName={fileName} />
                      </>
                    )}
                    {isUserRoleCompare?.includes(
                      "printbiometricdeviceofflinehistory"
                    ) && (
                      <>
                        <Button
                          sx={userStyle.buttongrp}
                          onClick={handleprintPopUp}
                        >
                          &ensp;
                          <FaPrint />
                          &ensp;Print&ensp;
                        </Button>
                      </>
                    )}
                    {isUserRoleCompare?.includes(
                      "pdfbiometricdeviceofflinehistory"
                    ) && (
                      <>
                        <Button
                          sx={userStyle.buttongrp}
                          onClick={() => downloadPdf()}
                        >
                          <FaFilePdf />
                          &ensp;Export to PDF&ensp;
                        </Button>
                      </>
                    )}
                    {isUserRoleCompare?.includes(
                      "imagebiometricdeviceofflinehistory"
                    ) && (
                      <Button
                        sx={userStyle.buttongrp}
                        onClick={handleCaptureImagePopUp}
                      >
                        {" "}
                        <ImageIcon sx={{ fontSize: "15px" }} />{" "}
                        &ensp;Image&ensp;{" "}
                      </Button>
                    )}
                  </Box>
                </Grid>

                <br />
                <div
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    overflowX: "auto",
                  }}
                >
                  <Table
                    aria-label="customized table"
                    id="usertable"
                    ref={componentRefPopUp}
                  >
                    <TableHead>
                      <StyledTableRow>
                        <StyledTableCell style={tableHeadCellStyle}>
                          {"Sno"}.
                        </StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}>
                          {" "}
                          {"Date"}
                        </StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}>
                          {" "}
                          {"Company"}
                        </StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}>
                          {" "}
                          {"Branch"}
                        </StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}>
                          {" "}
                          {"Unit"}
                        </StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}>
                          {" "}
                          {"Floor"}
                        </StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}>
                          {" "}
                          {"Area"}
                        </StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}>
                          {" "}
                          {"Device ID"}
                        </StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}>
                          {" "}
                          {"Device Common Name"}
                        </StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}>
                          {" "}
                          {"Last Online"}
                        </StyledTableCell>
                        <StyledTableCell style={tableHeadCellStyle}>
                          {" "}
                          {"Offline Time"}
                        </StyledTableCell>
                      </StyledTableRow>
                    </TableHead>
                    <TableBody>
                      {AttendanceList?.offlineHistory?.map((item, i) => (
                        <StyledTableRow>
                          <StyledTableCell style={tableBodyCellStyle}>
                            {i + 1}.
                          </StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}>
                            {" "}
                            {AttendanceList?.date}
                          </StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}>
                            {" "}
                            {AttendanceList?.company}
                          </StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}>
                            {" "}
                            {AttendanceList?.branch}
                          </StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}>
                            {" "}
                            {AttendanceList.unit}
                          </StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}>
                            {" "}
                            {AttendanceList.floor}
                          </StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}>
                            {" "}
                            {AttendanceList.area}
                          </StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}>
                            {" "}
                            {AttendanceList.cloudIDC}
                          </StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}>
                            {" "}
                            {AttendanceList.biometriccommonname}
                          </StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}>
                            {" "}
                            {item.lastOnline}
                          </StyledTableCell>
                          <StyledTableCell style={tableBodyCellStyle}>
                            {" "}
                            {item.offlineTime}
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Grid>
            </Grid>
            <br /> <br /> <br />
            <Grid container spacing={2}>
              <Button
                sx={buttonStyles.btncancel}
                onClick={handleCloseAttendanceList}
              >
                {" "}
                Back{" "}
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>
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
        itemsTwo={items ?? []}
        filename={"Biometric Device Offline History"}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />

      {/* EXTERNAL COMPONENTS -------------- END */}
    </Box>
  );
}

export default BiometricDeviceOfflineHistory;
