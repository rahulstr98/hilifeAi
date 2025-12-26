import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ImageIcon from "@mui/icons-material/Image";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import LoadingButton from "@mui/lab/LoadingButton";
import Selects from "react-select";
import moment from "moment-timezone";
import { colourStyles, userStyle } from "../../../pageStyle";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
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
  Typography,
} from "@mui/material";
import Switch from "@mui/material/Switch";
import axios from "axios";
import { saveAs } from "file-saver";
import "jspdf-autotable";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import { handleApiError } from "../../../components/Errorhandling";
import Headtitle from "../../../components/Headtitle";
import {
  AuthContext,
  UserRoleAccessContext,
} from "../../../context/Appcontext";
import { SERVICE } from "../../../services/Baseservice";
import { ThreeDots } from "react-loader-spinner";
import AlertDialog from "../../../components/Alert";
import {
  DeleteConfirmation,
  PleaseSelectRow,
} from "../../../components/DeleteConfirmation.js";
import ExportData from "../../../components/ExportData";
import InfoPopup from "../../../components/InfoPopup.js";
import MessageAlert from "../../../components/MessageAlert";
import PageHeading from "../../../components/PageHeading";
import {
  hoursTimeOpt,
  minutesTimeOpt,
} from "../../../components/Componentkeyword";
import { getCurrentServerTime } from "../../../components/getCurrentServerTime";
import AggregatedSearchBar from "../../../components/AggregatedSearchBar";
import AggridTable from "../../../components/AggridTable";
import domtoimage from "dom-to-image";
import { MultiSelect } from "react-multi-select-component";
import { useParams } from "react-router-dom";

function LiftAuthorityAccessManagement() {
  const [serverTime, setServerTime] = useState(null);
  useEffect(() => {
    const fetchTime = async () => {
      const time = await getCurrentServerTime();
      setServerTime(time);
      // setRatemaster({ ...ratemaster, date: moment(time).format('YYYY-MM-DD') });
    };
    fetchTime();
  }, []);

  var today = new Date(serverTime);
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  var yyyy = today.getFullYear();
  today = dd + "-" + mm + "-" + yyyy;

  const [liftAuthorityAccess, setLiftAuthorityAccess] = useState({
    company: "Please Select Company",
    branch: "Please Select Branch",
  });
  const [liftAuthorityAccessEdit, setLiftAuthorityAccessEdit] = useState({
    company: "Please Select Company",
    branch: "Please Select Branch",
  });
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const [isHandleChange, setIsHandleChange] = useState(false);
  const [searchedString, setSearchedString] = useState("");
  const gridRefTable = useRef(null);
  const gridRefTableImg = useRef(null);
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [loader, setLoader] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState("");
  const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
  const handleClickOpenPopupMalert = () => {
    setOpenPopupMalert(true);
    setloadingdeloverall(false);
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
    "Team",
    "Employee Name",
    "Company",
    "Branch",
    "Floor Access",
  ];
  let exportRowValues = [
    "company",
    "branch",
    "unit",
    "team",
    "employeename",
    "companyfloor",
    "branchfloor",
    "floor",
  ];

  const [loadingdeloverall, setloadingdeloverall] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };
  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
  };

  const [liftauthorityaccessmanagement, setLiftauthorityaccessmanagement] =
    useState({
      schemename: "",
      schemetype: "Please Select Scheme Type",
      noofinstallements: 0,
      installementperiod: "Please Select Instalment Period",
      amount: 0,
      schemestatus: "Please Select Scheme Status",
    });
  const [chitschememasterEdit, setChitschememasterEdit] = useState({
    schemename: "",
    schemetype: "Please Select Scheme Type",
    noofinstallements: 0,
    installementperiod: "Please Select Instalment Period",
    amount: 0,
    schemestatus: "Please Select Scheme Status",
  });
  const [chitschememasters, setChitschememasters] = useState([]);
  const [liftauthorityaccessmanagements, setLiftauthorityaccessmanagements] =
    useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [allChitschemeEdit, setAllChitschemeEdit] = useState([]);
  const {
    isUserRoleCompare,
    isUserRoleAccess,
    isAssignBranch,
    allTeam,
    allUsersData,
    pageName,
    setPageName,
    buttonStyles,
    allfloor,
  } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);
  const gridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [selectedOptionsCompany, setSelectedOptionsCompany] = useState([]);
  const [selectedOptionsCompanyFloor, setSelectedOptionsCompanyFloor] =
    useState([]);
  const [selectedOptionsCompanyEdit, setSelectedOptionsCompanyEdit] = useState(
    []
  );
  const [selectedOptionsCompanyFloorEdit, setSelectedOptionsCompanyFloorEdit] =
    useState([]);
  const [singleDoc, setSingleDoc] = useState({});
  const [updateDetails, setUpDateDetails] = useState({});
  const [singleDocument, setSingleDocument] = useState({});
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
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };

  const customValueRendererCompany = (valueCompanyCat, _categoryname) => {
    return valueCompanyCat?.length
      ? valueCompanyCat.map(({ label }) => label)?.join(", ")
      : "Please Select Company";
  };

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
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };

  const customValueRendererBranch = (valueBranchCat, _categoryname) => {
    return valueBranchCat?.length
      ? valueBranchCat.map(({ label }) => label)?.join(", ")
      : "Please Select Branch";
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
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };

  const customValueRendererUnit = (valueUnitCat, _categoryname) => {
    return valueUnitCat?.length
      ? valueUnitCat.map(({ label }) => label)?.join(", ")
      : "Please Select Unit";
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
    setValueEmployeeCat([]);
    setSelectedOptionsEmployee([]);
  };

  const customValueRendererTeam = (valueTeamCat, _categoryname) => {
    return valueTeamCat?.length
      ? valueTeamCat.map(({ label }) => label)?.join(", ")
      : "Please Select Team";
  };

  //employee multiselect
  const [selectedOptionsEmployee, setSelectedOptionsEmployee] = useState([]);
  const [valueEmployeeCat, setValueEmployeeCat] = useState([]);
  const [employeeDbId, setEmployeeDbId] = useState([]);

  const handleEmployeeChange = (options) => {
    setValueEmployeeCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setEmployeeDbId(
      options.map((a, index) => {
        return a._id;
      })
    );
    setSelectedOptionsEmployee(options);
  };
  const customValueRendererEmployee = (valueEmployeeCate, _employeename) => {
    return valueEmployeeCate.length
      ? valueEmployeeCate.map(({ label }) => label).join(", ")
      : "Please Select Employee Name";
  };

  let [valueCompanyCatFloor, setValueCompanyCatFloor] = useState([]);
  const handleCompanyChangeFloor = (options) => {
    setValueCompanyCatFloor(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsCompanyFloor(options);
    setValueBranchCatFloor([]);
    setSelectedOptionsBranchFloor([]);
    setValueUnitCatFloor([]);
    setSelectedOptionsUnitFloor([]);
    setSelectedOptionsFloor([]);
    setValueFloorCat([]);
  };

  const customValueRendererCompanyFloor = (
    valueCompanyCatFloor,
    _categoryname
  ) => {
    return valueCompanyCatFloor?.length
      ? valueCompanyCatFloor.map(({ label }) => label)?.join(", ")
      : "Please Select Company";
  };

  const [selectedOptionsBranchFloor, setSelectedOptionsBranchFloor] = useState(
    []
  );
  let [valueBranchCatFloor, setValueBranchCatFloor] = useState([]);
  const handleBranchChangeFloor = (options) => {
    setValueBranchCatFloor(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsBranchFloor(options);
    setValueUnitCatFloor([]);
    setSelectedOptionsUnitFloor([]);
    setSelectedOptionsFloor([]);
    setValueFloorCat([]);
  };

  const customValueRendererBranchFloor = (
    valueBranchCatFloor,
    _categoryname
  ) => {
    return valueBranchCatFloor?.length
      ? valueBranchCatFloor.map(({ label }) => label)?.join(", ")
      : "Please Select Branch";
  };

  //unit multiselect
  const [selectedOptionsUnitFloor, setSelectedOptionsUnitFloor] = useState([]);
  let [valueUnitCatFloor, setValueUnitCatFloor] = useState([]);
  const handleUnitChangeFloor = (options) => {
    setValueUnitCatFloor(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsUnitFloor(options);
  };

  const customValueRendererUnitFloor = (valueUnitCatFloor, _categoryname) => {
    return valueUnitCatFloor?.length
      ? valueUnitCatFloor.map(({ label }) => label)?.join(", ")
      : "Please Select Unit";
  };

  const [selectedOptionsFloor, setSelectedOptionsFloor] = useState([]);
  let [valueFloorCat, setValueFloorCat] = useState([]);
  const handleFloorChange = (options) => {
    setValueFloorCat(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsFloor(options);
  };

  const customValueRendererFloor = (valueFloorCat, _categoryname) => {
    return valueFloorCat?.length
      ? valueFloorCat.map(({ label }) => label)?.join(", ")
      : "Please Select Floor";
  };

  let [valueCompanyCatEdit, setValueCompanyCatEdit] = useState([]);
  const handleCompanyChangeEdit = (options) => {
    setValueCompanyCatEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsCompanyEdit(options);
    setValueBranchCatEdit([]);
    setSelectedOptionsBranchEdit([]);
    setValueUnitCatEdit([]);
    setSelectedOptionsUnitEdit([]);
    setValueTeamCatEdit([]);
    setSelectedOptionsTeamEdit([]);
    setValueEmployeeCatEdit([]);
    setSelectedOptionsEmployeeEdit([]);
  };

  const customValueRendererCompanyEdit = (
    valueCompanyCatEdit,
    _categoryname
  ) => {
    return valueCompanyCatEdit?.length
      ? valueCompanyCatEdit.map(({ label }) => label)?.join(", ")
      : "Please Select Company";
  };

  const [selectedOptionsBranchEdit, setSelectedOptionsBranchEdit] = useState(
    []
  );
  let [valueBranchCatEdit, setValueBranchCatEdit] = useState([]);
  const handleBranchChangeEdit = (options) => {
    setValueBranchCatEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsBranchEdit(options);
    setValueUnitCatEdit([]);
    setSelectedOptionsUnitEdit([]);
    setValueTeamCatEdit([]);
    setSelectedOptionsTeamEdit([]);
    setValueEmployeeCatEdit([]);
    setSelectedOptionsEmployeeEdit([]);
  };

  const customValueRendererBranchEdit = (valueBranchCatEdit, _categoryname) => {
    return valueBranchCatEdit?.length
      ? valueBranchCatEdit.map(({ label }) => label)?.join(", ")
      : "Please Select Branch";
  };

  //unit multiselect
  const [selectedOptionsUnitEdit, setSelectedOptionsUnitEdit] = useState([]);
  let [valueUnitCatEdit, setValueUnitCatEdit] = useState([]);
  const handleUnitChangeEdit = (options) => {
    setValueUnitCatEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsUnitEdit(options);
    setValueTeamCatEdit([]);
    setSelectedOptionsTeamEdit([]);
    setValueEmployeeCatEdit([]);
    setSelectedOptionsEmployeeEdit([]);
  };

  const customValueRendererUnitEdit = (valueUnitCatEdit, _categoryname) => {
    return valueUnitCatEdit?.length
      ? valueUnitCatEdit.map(({ label }) => label)?.join(", ")
      : "Please Select Unit";
  };

  //team multiselect
  const [selectedOptionsTeamEdit, setSelectedOptionsTeamEdit] = useState([]);
  let [valueTeamCatEdit, setValueTeamCatEdit] = useState([]);
  const handleTeamChangeEdit = (options) => {
    setValueTeamCatEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsTeamEdit(options);
    setValueEmployeeCatEdit([]);
    setSelectedOptionsEmployeeEdit([]);
  };

  const customValueRendererTeamEdit = (valueTeamCatEdit, _categoryname) => {
    return valueTeamCatEdit?.length
      ? valueTeamCatEdit.map(({ label }) => label)?.join(", ")
      : "Please Select Team";
  };

  //employee multiselect
  const [selectedOptionsEmployeeEdit, setSelectedOptionsEmployeeEdit] =
    useState([]);
  const [valueEmployeeCatEdit, setValueEmployeeCatEdit] = useState([]);
  const [employeeDbIdEdit, setEmployeeDbIdEdit] = useState([]);

  const handleEmployeeChangeEdit = (options) => {
    setValueEmployeeCatEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setEmployeeDbIdEdit(
      options.map((a, index) => {
        return a._id;
      })
    );
    setSelectedOptionsEmployeeEdit(options);
  };
  const customValueRendererEmployeeEdit = (
    valueEmployeeCateEdit,
    _employeename
  ) => {
    return valueEmployeeCateEdit.length
      ? valueEmployeeCateEdit.map(({ label }) => label).join(", ")
      : "Please Select Employee Name";
  };

  let [valueCompanyCatFloorEdit, setValueCompanyCatFloorEdit] = useState([]);
  const handleCompanyChangeFloorEdit = (options) => {
    setValueCompanyCatFloorEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsCompanyFloorEdit(options);
    setValueBranchCatFloorEdit([]);
    setSelectedOptionsBranchFloorEdit([]);
    setSelectedOptionsFloorEdit([]);
    setValueFloorCatEdit([]);
  };

  const customValueRendererCompanyFloorEdit = (
    valueCompanyCatFloorEdit,
    _categoryname
  ) => {
    return valueCompanyCatFloorEdit?.length
      ? valueCompanyCatFloorEdit.map(({ label }) => label)?.join(", ")
      : "Please Select Company";
  };

  const [selectedOptionsBranchFloorEdit, setSelectedOptionsBranchFloorEdit] =
    useState([]);
  let [valueBranchCatFloorEdit, setValueBranchCatFloorEdit] = useState([]);
  const handleBranchChangeFloorEdit = (options) => {
    setValueBranchCatFloorEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsBranchFloorEdit(options);
    setSelectedOptionsFloorEdit([]);
    setValueFloorCatEdit([]);
  };

  const customValueRendererBranchFloorEdit = (
    valueBranchCatFloorEdit,
    _categoryname
  ) => {
    return valueBranchCatFloorEdit?.length
      ? valueBranchCatFloorEdit.map(({ label }) => label)?.join(", ")
      : "Please Select Branch";
  };

  const [selectedOptionsFloorEdit, setSelectedOptionsFloorEdit] = useState([]);
  let [valueFloorCatEdit, setValueFloorCatEdit] = useState([]);
  const handleFloorChangeEdit = (options) => {
    setValueFloorCatEdit(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsFloorEdit(options);
  };

  const customValueRendererFloorEdit = (valueFloorCatEdit, _categoryname) => {
    return valueFloorCatEdit?.length
      ? valueFloorCatEdit.map(({ label }) => label)?.join(", ")
      : "Please Select Floor";
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
            data?.mainpagenameurl?.length !== 0
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

  //image
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage
        .toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, "Lift Authority Access Management.png");
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };

  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
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
    setloadingdeloverall(false);
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
    branch: true,
    unit: true,
    team: true,
    employeename: true,
    companyfloor: true,
    branchfloor: true,
    floor: true,
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

  const [deleteGroup, setDeletegroup] = useState("");

  const rowData = async (id, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(
        `${SERVICE.LIFTAUTHORITYACCESSMANAGEMENT_SINGLE}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setDeletegroup(res?.data?.sliftauthorityaccessmanagement);
      handleClickOpen();
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
  let groupEditt = deleteGroup._id;
  const deleGroup = async () => {
    setPageName(!pageName);
    try {
      await axios.delete(
        `${SERVICE.LIFTAUTHORITYACCESSMANAGEMENT_SINGLE}/${groupEditt}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      await fetchAllLiftauthorityaccessmanagement();
      handleCloseMod();
      setFilteredRowData([]);
      setFilteredChanges(null);
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

  const delGroupcheckbox = async () => {
    setPageName(!pageName);
    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(
          `${SERVICE.LIFTAUTHORITYACCESSMANAGEMENT_SINGLE}/${item}`,
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
      handleCloseModcheckbox();
      setSelectedRows([]);
      setSelectAllChecked(false);
      setPage(1);
      setFilteredRowData([]);
      setFilteredChanges(null);
      await fetchAllLiftauthorityaccessmanagement();
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

  // //add function
  const sendRequest = async () => {
    setPageName(!pageName);
    setloadingdeloverall(true);
    console.log("Hitted");
    try {
      let grpcreate = await axios.post(
        SERVICE.LIFTAUTHORITYACCESSMANAGEMENT_CREATE,
        {
          company: [...valueCompanyCat],
          branch: [...valueBranchCat],
          unit: [...valueUnitCat],
          team: [...valueTeamCat],
          employeename: [...valueEmployeeCat],
          employeedbid: employeeDbId,
          companyfloor: liftAuthorityAccess?.company,
          branchfloor: liftAuthorityAccess?.branch,
          floor: [...valueFloorCat],
          addedby: [
            {
              name: String(isUserRoleAccess.companyname),
              date: String(new Date()),
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      const data = {
        devicecompany: liftAuthorityAccess?.company,
        devicebranch: liftAuthorityAccess?.branch,
        devicefloor: valueFloorCat,
        company: valueCompanyCat,
        branch: valueBranchCat,
        unit: valueUnitCat,
        team: valueTeamCat,
        employeename: valueEmployeeCat,
        deleteemployee: [],
        deletefloor: null,
      };
      biometricFloorWiseUserAccess(data);

      await fetchAllLiftauthorityaccessmanagement();
      setValueCompanyCat([]);
      setSelectedOptionsCompany([]);
      setValueBranchCat([]);
      setSelectedOptionsBranch([]);
      setValueUnitCat([]);
      setSelectedOptionsUnit([]);
      setValueTeamCat([]);
      setSelectedOptionsTeam([]);
      setSelectedOptionsEmployee([]);
      setValueEmployeeCat([]);
      setEmployeeDbId([]);
      setValueCompanyCatFloor([]);
      setSelectedOptionsCompanyFloor([]);
      setValueBranchCatFloor([]);
      setSelectedOptionsBranchFloor([]);
      setSelectedOptionsFloor([]);
      setPopupContent("Added Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
      setloadingdeloverall(false);
    } catch (err) {
      setloadingdeloverall(false);
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
      console.log("err:", err);
    }
  };

  //add function
  //       const sendRequest = async () => {
  //        setPageName(!pageName);
  //         try {
  //           let subprojectscreate = await axios.post(SERVICE.LIFTAUTHORITYACCESSMANAGEMENT_CREATE, {
  //             headers: {
  //               Authorization: `Bearer ${auth.APIToken}`,
  //             },
  // company: [...valueCompanyCat],
  //             addedby: [
  //               {
  //                 name: String(isUserRoleAccess.companyname),
  //                 date: String(new Date()),
  //               },
  //             ],
  //           });
  //           await fetchAllChitschememaster();
  //           setPopupContent('Added Successfully');
  //           setPopupSeverity('success');
  //           handleClickOpenPopup();
  //         } catch (err) {
  //           handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
  //         }
  //       };

  //submit option for saving
  const handleSubmit = (e) => {
    setPageName(!pageName);
    e.preventDefault();

    let compopt = selectedOptionsCompany.map((item) => item.value);
    let branchopt = selectedOptionsBranch.map((item) => item.value);
    let unitopt = selectedOptionsUnit.map((item) => item.value);
    let teamopt = selectedOptionsTeam.map((item) => item.value);
    let empopt = selectedOptionsEmployee.map((item) => item.value);
    let flooropt = selectedOptionsFloor.map((item) => item.value);
    // const isNameMatch = liftauthorityaccessmanagements.some((item) =>
    //     item.company.some((data) => compopt.includes(data)) &&
    //     item.branch.some((data) => branchopt.includes(data)) &&
    //     item.unit.some((data) => unitopt.includes(data)) &&
    //     item.team.some((data) => teamopt.includes(data)) &&
    //     item.employeename.some((data) => empopt.includes(data)) &&
    //     item.companyfloor.some((data) => compoptfloor.includes(data)) &&
    //     item.branchfloor.some((data) => branchoptfloor.includes(data)) &&
    //     item.floor.some((data) => flooropt.includes(data))
    // );
    const isNameMatch = liftauthorityaccessmanagements.some(
      (item) =>
        item.company.some((data) => compopt.includes(data)) &&
        item.branch.some((data) => branchopt.includes(data)) &&
        item.unit.some((data) => unitopt.includes(data)) &&
        item.team.some((data) => teamopt.includes(data)) &&
        item.employeename.some((data) => empopt.includes(data)) &&
        item.companyfloor === liftAuthorityAccess?.company &&
        item.branchfloor === liftAuthorityAccess?.branch &&
        item.floor.some((data) => flooropt.includes(data))
    );
    if (valueCompanyCat?.length == 0) {
      setPopupContentMalert("Please Select Company!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (valueBranchCat?.length == 0) {
      setPopupContentMalert("Please Select Branch!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (valueUnitCat?.length == 0) {
      setPopupContentMalert("Please Select Unit!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (valueTeamCat?.length == 0) {
      setPopupContentMalert("Please Select Team!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (valueEmployeeCat?.length == 0) {
      setPopupContentMalert("Please Select Employee Name!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      !liftAuthorityAccess?.company ||
      liftAuthorityAccess?.company === "Please Select Company"
    ) {
      setPopupContentMalert("Please Select Company For Floor!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      !liftAuthorityAccess?.branch ||
      liftAuthorityAccess?.branch === "Please Select Branch"
    ) {
      setPopupContentMalert("Please Select Branch For Floor!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (valueFloorCat?.length == 0) {
      setPopupContentMalert("Please Select Floor!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert("Data Already Exist!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      sendRequest();
    }
  };

  const biometricFloorWiseUserAccess = async (value) => {
    setPageName(!pageName);
    console.log("Hitted 2");
    try {
        console.log("Hitted 3");
      let res = await axios.post(
        `${SERVICE.FLOOR_WISE_USER_ACCESS_BIOMETRIC_DEVICE}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          user: value,
        }
      );
      console.log(res?.data?.alluploaduserinfo , "Hitted 3"); 
    } catch (err) {
     console.log(err , "Hitted 3");
      setloadingdeloverall(false);
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const handleClear = () => {
    setPageName(!pageName);
    setValueCompanyCat([]);
    setSelectedOptionsCompany([]);
    setValueBranchCat([]);
    setSelectedOptionsBranch([]);
    setValueUnitCat([]);
    setSelectedOptionsUnit([]);
    setValueTeamCat([]);
    setSelectedOptionsTeam([]);
    setSelectedOptionsEmployee([]);
    setValueEmployeeCat([]);
    setEmployeeDbId([]);
    setValueCompanyCatFloor([]);
    setSelectedOptionsCompanyFloor([]);
    setValueBranchCatFloor([]);
    setSelectedOptionsBranchFloor([]);
    setSelectedOptionsFloor([]);
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

  let ids = useParams().id;

  //get single row to edit....
  const getCode = async (e, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(
        `${SERVICE.LIFTAUTHORITYACCESSMANAGEMENT_SINGLE}/${e}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      // const reshrs = res?.data?.schitschememaster?.time?.split(':');
      // const resampm = reshrs[1]?.split(' ');
      setSingleDocument(res?.data?.sliftauthorityaccessmanagement);
      setUpDateDetails(res?.data?.sliftauthorityaccessmanagement);
      setLiftAuthorityAccessEdit({
        company:
          res?.data?.sliftauthorityaccessmanagement?.companyfloor ||
          "Please Select Company",
        branch:
          res?.data?.sliftauthorityaccessmanagement?.branchfloor ||
          "Please Select Branch",
      });
      setEmployeeDbIdEdit(
        res?.data?.sliftauthorityaccessmanagement?.employeedbid
      );
      setValueCompanyCatEdit(
        res?.data?.sliftauthorityaccessmanagement?.company
      );
      setSelectedOptionsCompanyEdit([
        ...res?.data?.sliftauthorityaccessmanagement?.company.map((t) => ({
          ...t,
          label: t,
          value: t,
        })),
      ]);
      setValueBranchCatEdit(res?.data?.sliftauthorityaccessmanagement?.branch);
      setSelectedOptionsBranchEdit([
        ...res?.data?.sliftauthorityaccessmanagement?.branch.map((t) => ({
          ...t,
          label: t,
          value: t,
        })),
      ]);
      setValueUnitCatEdit(res?.data?.sliftauthorityaccessmanagement?.unit);
      setSelectedOptionsUnitEdit([
        ...res?.data?.sliftauthorityaccessmanagement?.unit.map((t) => ({
          ...t,
          label: t,
          value: t,
        })),
      ]);
      setValueTeamCatEdit(res?.data?.sliftauthorityaccessmanagement?.team);
      setSelectedOptionsTeamEdit([
        ...res?.data?.sliftauthorityaccessmanagement?.team.map((t) => ({
          ...t,
          label: t,
          value: t,
        })),
      ]);

      setValueEmployeeCatEdit(
        res?.data?.sliftauthorityaccessmanagement.employeename
      );
      setSelectedOptionsEmployeeEdit([
        ...res?.data?.sliftauthorityaccessmanagement?.employeename.map((t) => ({
          ...t,
          label: t,
          value: t,
        })),
      ]);

      //   setValueCompanyCatFloorEdit(
      //     res?.data?.sliftauthorityaccessmanagement?.companyfloor
      //   );
      //   setSelectedOptionsCompanyFloorEdit([
      //     ...res?.data?.sliftauthorityaccessmanagement?.companyfloor.map((t) => ({
      //       ...t,
      //       label: t,
      //       value: t,
      //     })),
      //   ]);
      //   setValueBranchCatFloorEdit(
      //     res?.data?.sliftauthorityaccessmanagement?.branchfloor
      //   );
      //   setSelectedOptionsBranchFloorEdit([
      //     ...res?.data?.sliftauthorityaccessmanagement?.branchfloor.map((t) => ({
      //       ...t,
      //       label: t,
      //       value: t,
      //     })),
      //   ]);
      setValueFloorCatEdit(res?.data?.sliftauthorityaccessmanagement?.floor);
      setSelectedOptionsFloorEdit([
        ...res?.data?.sliftauthorityaccessmanagement?.floor.map((t) => ({
          ...t,
          label: t,
          value: t,
        })),
      ]);
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

  // useEffect(() => {
  //     getCode();
  //   }, [ids]);

  // let updateby = singleDocument?.updatedby;

  // get single row to view....
  const getviewCode = async (e) => {
    setPageName(!pageName);

    try {
      let res = await axios.get(
        `${SERVICE.LIFTAUTHORITYACCESSMANAGEMENT_SINGLE}/${e}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setSingleDocument(res?.data?.sliftauthorityaccessmanagement);
      setUpDateDetails(res?.data?.sliftauthorityaccessmanagement);
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
        `${SERVICE.LIFTAUTHORITYACCESSMANAGEMENT_SINGLE}/${e}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setSingleDocument(res?.data?.sliftauthorityaccessmanagement);
      setUpDateDetails(res?.data?.sliftauthorityaccessmanagement);
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
  let updateby = singleDocument.updatedby;
  let addedby = singleDocument?.addedby;
  let projectsid = singleDocument?._id;

  //editing the single data...
  const sendEditRequest = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.put(
        `${SERVICE.LIFTAUTHORITYACCESSMANAGEMENT_SINGLE}/${projectsid}`,
        {
          company: [...valueCompanyCatEdit],
          branch: [...valueBranchCatEdit],
          unit: [...valueUnitCatEdit],
          team: [...valueTeamCatEdit],
          employeename: [...valueEmployeeCatEdit],
          employeedbid: employeeDbIdEdit,
          companyfloor: liftAuthorityAccessEdit?.company,
          branchfloor: liftAuthorityAccessEdit?.branch,
          floor: [...valueFloorCatEdit],
          updatedby: [
            ...updateby,
            {
              name: String(isUserRoleAccess.companyname),
              date: String(new Date()),
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );

      const employeeMissing =
        Array.isArray(singleDocument?.employeename) &&
        Array.isArray(valueEmployeeCatEdit) &&
        singleDocument.employeename.some(
          (emp) => !valueEmployeeCatEdit.includes(emp)
        );

      const floorMissing =
        Array.isArray(singleDocument?.floor) &&
        Array.isArray(valueFloorCatEdit) &&
        singleDocument.floor.some((f) => !valueFloorCatEdit.includes(f));

      if (employeeMissing || floorMissing) {
        const data = {
          devicecompany: liftAuthorityAccessEdit?.company,
          devicebranch: liftAuthorityAccessEdit?.branch,
          devicefloor: valueFloorCatEdit,
          company: valueCompanyCatEdit,
          branch: valueBranchCatEdit,
          unit: valueUnitCatEdit,
          team: valueTeamCatEdit,
          employeename: valueEmployeeCatEdit,
          deleteemployee: singleDocument?.employeename?.filter(
            (data) => !valueEmployeeCatEdit?.includes(data)
          ),
          deletefloor: singleDocument?.floor?.filter(
            (data) => !valueEmployeeCatEdit?.includes(data)
          ),
          oldEditData: singleDocument,
        };
        biometricFloorWiseUserAccess(data);
      }
      // setChitschememasterEdit(res.data);
      await fetchAllLiftauthorityaccessmanagement();
      await fetchLiftauthorityaccessmanagementAll();

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

  const editSubmit = (e) => {
    e.preventDefault();
    fetchLiftauthorityaccessmanagementAll();

    let compopt = selectedOptionsCompanyEdit.map((item) => item.value);
    let branchopt = selectedOptionsBranchEdit.map((item) => item.value);
    let unitopt = selectedOptionsUnitEdit.map((item) => item.value);
    let teamopt = selectedOptionsTeamEdit.map((item) => item.value);
    let empopt = selectedOptionsEmployeeEdit.map((item) => item.value);
    let compoptfloor = selectedOptionsCompanyFloorEdit.map(
      (item) => item.value
    );
    let branchoptfloor = selectedOptionsBranchFloorEdit.map(
      (item) => item.value
    );
    let flooropt = selectedOptionsFloorEdit.map((item) => item.value);
    // const isNameMatch = liftauthorityaccessmanagements.some((item) =>
    //     item.company.some((data) => compopt.includes(data)) &&
    //     item.branch.some((data) => branchopt.includes(data)) &&
    //     item.unit.some((data) => unitopt.includes(data)) &&
    //     item.team.some((data) => teamopt.includes(data)) &&
    //     item.employeename.some((data) => empopt.includes(data)) &&
    //     item.companyfloor.some((data) => compoptfloor.includes(data)) &&
    //     item.branchfloor.some((data) => branchoptfloor.includes(data)) &&
    //     item.floor.some((data) => flooropt.includes(data))
    // );
    const isNameMatch = allChitschemeEdit.some(
      (item) =>
        item.company.some((data) => compopt.includes(data)) &&
        item.branch.some((data) => branchopt.includes(data)) &&
        item.unit.some((data) => unitopt.includes(data)) &&
        item.team.some((data) => teamopt.includes(data)) &&
        item.employeename.some((data) => empopt.includes(data)) &&
        item.companyfloor === liftAuthorityAccessEdit?.company &&
        item.branchfloor === liftAuthorityAccessEdit?.branch &&
        item.floor.some((data) => flooropt.includes(data))
    );
    if (valueCompanyCatEdit?.length == 0) {
      setPopupContentMalert("Please Select Company!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (valueBranchCatEdit?.length == 0) {
      setPopupContentMalert("Please Select Branch!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (valueUnitCatEdit?.length == 0) {
      setPopupContentMalert("Please Select Unit!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (valueTeamCatEdit?.length == 0) {
      setPopupContentMalert("Please Select Team!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (valueEmployeeCatEdit?.length == 0) {
      setPopupContentMalert("Please Select Employee Name!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      !liftAuthorityAccessEdit?.company ||
      liftAuthorityAccessEdit?.company === "Please Select Company"
    ) {
      setPopupContentMalert("Please Select Company For Floor!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      !liftAuthorityAccessEdit?.branch ||
      liftAuthorityAccessEdit?.branch === "Please Select Branch"
    ) {
      setPopupContentMalert("Please Select Branch For Floor!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (valueFloorCatEdit?.length == 0) {
      setPopupContentMalert("Please Select Floor!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert("Data Already Exist!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      sendEditRequest();
    }
  };

  //get all project.
  const fetchAllLiftauthorityaccessmanagement = async () => {
    setPageName(!pageName);
    try {
      let res_grp = await axios.get(SERVICE.LIFTAUTHORITYACCESSMANAGEMENT_ALL, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      // setLiftauthorityaccessmanagements(
      //     res_grp?.data?.liftauthorityaccessmanagements.map((item, index) => ({
      //         ...item,
      //         id: item._id,
      //         serialNumber: index + 1,
      //         company: item.company?.map((t, i) => `${i + 1 + '. '}` + t).toString(),
      //         branch: item.branch?.map((t, i) => `${i + 1 + '. '}` + t).toString(),
      //         unit: item.unit?.map((t, i) => `${i + 1 + '. '}` + t).toString(),
      //         team: item.team?.map((t, i) => `${i + 1 + '. '}` + t).toString(),
      //         employeename: item.employeename?.map((t, i) => `${i + 1 + '. '}` + t).toString(),
      //         companyfloor: item.companyfloor?.map((t, i) => `${i + 1 + '. '}` + t).toString(),
      //         branchfloor: item.branchfloor?.map((t, i) => `${i + 1 + '. '}` + t).toString(),
      //         floor: item.branchfloor?.map((t, i) => `${i + 1 + '. '}` + t).toString(),
      //         // schemename: item.schemename,
      //         // date: item.date,
      //         // // date: moment(item.date).format('DD-MM-YYYY'),
      //         // // time: moment(item.time).format("hh:mm:ss A")
      //         // time: item.time,
      //     }))
      setLiftauthorityaccessmanagements(
        res_grp?.data?.liftauthorityaccessmanagements.map((item, index) => ({
          ...item,
          id: item._id,
          serialNumber: index + 1,

          // ✅ KEEP ARRAYS (for logic)
          company: item.company || [],
          branch: item.branch || [],
          unit: item.unit || [],
          team: item.team || [],
          employeename: item.employeename || [],
          companyfloor: item.companyfloor || "",
          branchfloor: item.branchfloor || "",
          floor: item.floor || [],

          // ✅ OPTIONAL: display-only fields
          companyText: item.company?.join(", "),
          branchText: item.branch?.join(", "),
          unitText: item.unit?.join(", "),
          teamText: item.team?.join(", "),
          employeenameText: item.employeename?.join(", "),
          companyfloorText: item.companyfloor,
          branchfloorText: item.branchfloor,
          floorText: item.floor?.join(", "),
        }))
      );
      setLoader(true);
    } catch (err) {
      console.log(err, "jjghjh");
      setLoader(true);
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  //get all project.
  const fetchLiftauthorityaccessmanagementAll = async () => {
    setPageName(!pageName);
    try {
      let res_grp = await axios.get(SERVICE.LIFTAUTHORITYACCESSMANAGEMENT_ALL, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      // setAllChitschemeEdit(res_grp?.data?.liftauthorityaccessmanagements.filter((item) => item._id !== chitschememasterEdit._id));
      setAllChitschemeEdit(
        res_grp?.data?.liftauthorityaccessmanagements.filter(
          (item) => item._id !== singleDocument._id
        )
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

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Lift Authority Access Management",
    pageStyle: "print",
  });

  useEffect(() => {
    fetchAllLiftauthorityaccessmanagement();
  }, []);

  useEffect(() => {
    fetchLiftauthorityaccessmanagementAll();
  }, [isEditOpen]);

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
    addSerialNumber(liftauthorityaccessmanagements);
  }, [liftauthorityaccessmanagements]);

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

  const totalPages = Math.ceil(filteredDatas.length / pageSize);

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
      width: 50,
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
      width: 83,
      hide: !columnVisibility.serialNumber,
      headerClassName: "bold-header",
    },
    {
      field: "company",
      headerName: "Company",
      flex: 0,
      width: 120,
      minHeight: "40px",
      hide: !columnVisibility.company,
    },
    {
      field: "branch",
      headerName: "Branch",
      flex: 0,
      width: 120,
      minHeight: "40px",
      hide: !columnVisibility.branch,
    },
    {
      field: "unit",
      headerName: "Unit",
      flex: 0,
      width: 120,
      minHeight: "40px",
      hide: !columnVisibility.unit,
    },
    {
      field: "team",
      headerName: "Team",
      flex: 0,
      width: 120,
      minHeight: "40px",
      hide: !columnVisibility.team,
    },
    {
      field: "employeename",
      headerName: "Employee Name",
      flex: 0,
      width: 150,
      minHeight: "40px",
      hide: !columnVisibility.employeename,
    },
    {
      field: "companyfloor",
      headerName: "CompanyFloor",
      flex: 0,
      width: 120,
      minHeight: "40px",
      hide: !columnVisibility.companyfloor,
    },
    {
      field: "branchfloor",
      headerName: "BranchFloor",
      flex: 0,
      width: 120,
      minHeight: "40px",
      hide: !columnVisibility.branchfloor,
    },
    {
      field: "floor",
      headerName: "Floor",
      flex: 0,
      width: 120,
      minHeight: "40px",
      hide: !columnVisibility.floor,
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
          {isUserRoleCompare?.includes("eliftauthorityaccessmanagement") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getCode(params.data.id, params.data.name);
              }}
            >
              <EditOutlinedIcon sx={buttonStyles.buttonedit} />
            </Button>
          )}
          {isUserRoleCompare?.includes("dliftauthorityaccessmanagement") && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.data.id, params.data.name);
              }}
            >
              <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />
            </Button>
          )}
          {isUserRoleCompare?.includes("vliftauthorityaccessmanagement") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getviewCode(params.data.id);
              }}
            >
              <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />
            </Button>
          )}
          {isUserRoleCompare?.includes("iliftauthorityaccessmanagement") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
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

  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item._id,
      serialNumber: item.serialNumber,
      company: item.companyText,
      branch: item.branchText,
      unit: item.unitText,
      team: item.teamText,
      employeename: item.employeenameText,
      companyfloor: item.companyfloorText,
      branchfloor: item.branchfloorText,
      floor: item.floorText,
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

  //Access Module
  const pathname = window.location.pathname;
  const getapi = async () => {
    let userchecks = axios.post(
      `${SERVICE.CREATE_USERCHECKS}`,
      {
        empcode: String(isUserRoleAccess?.empcode),
        companyname: String(isUserRoleAccess?.companyname),
        pagename: String("Chit Scheme Master"),
        commonid: String(isUserRoleAccess?._id),
        date: String(new Date()),

        addedby: [
          {
            name: String(isUserRoleAccess?.username),
            date: String(new Date()),
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      }
    );
  };

  useEffect(() => {
    getapi();
  }, []);

  const schemeTypes = [
    { label: "Amount", value: "Amount" },
    { label: "Gold", value: "Gold" },
    { label: "Silver", value: "Silver" },
  ];

  const installementPeriod = [
    { label: "Daily", value: "Daily" },
    { label: "Weekly", value: "Weekly" },
    { label: "Monthly", value: "Monthly" },
  ];

  const SchemeStatus = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  return (
    <Box>
      <PageHeading
        title="Manage Lift Authority Access Management"
        modulename="Human Resources"
        submodulename="HR"
        mainpagename="BX-Biometric Device"
        subpagename="Elevator"
        subsubpagename="Lift Authority Access Management"
      />

      {isUserRoleCompare?.includes("aliftauthorityaccessmanagement") && (
        <>
          <Box sx={userStyle.dialogbox}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>
                    Add Lift Authority Access Management
                  </Typography>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Company <b style={{ color: "red" }}>*</b>
                    </Typography>
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
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Branch<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <MultiSelect
                      options={accessbranch
                        ?.filter((comp) =>
                          valueCompanyCat?.includes(comp.company)
                        )
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
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography>
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
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Team<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <MultiSelect
                      options={allTeam
                        ?.filter(
                          (comp) =>
                            valueCompanyCat?.includes(comp.company) &&
                            valueBranchCat?.includes(comp.branch) &&
                            valueUnitCat?.includes(comp.unit)
                        )
                        ?.map((data) => ({
                          label: data.teamname,
                          value: data.teamname,
                        }))
                        .filter((item, index, self) => {
                          return (
                            self.findIndex(
                              (i) =>
                                i.label === item.label && i.value === item.value
                            ) === index
                          );
                        })}
                      value={selectedOptionsTeam}
                      onChange={(e) => {
                        handleTeamChange(e);
                      }}
                      valueRenderer={customValueRendererTeam}
                      labelledBy="Please Select Team"
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Employee Name<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <MultiSelect
                      options={allUsersData
                        ?.filter(
                          (u) =>
                            valueCompanyCat?.includes(u.company) &&
                            valueBranchCat?.includes(u.branch) &&
                            valueUnitCat?.includes(u.unit) &&
                            valueTeamCat?.includes(u.team)
                        )
                        .map((u) => ({
                          ...u,
                          label: u.companyname,
                          value: u.companyname,
                        }))}
                      value={selectedOptionsEmployee}
                      onChange={handleEmployeeChange}
                      valueRenderer={customValueRendererEmployee}
                      labelledBy="Please Select Employee Name"
                    />
                  </FormControl>
                </Grid>
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
                                i.label === item.label && i.value === item.value
                            ) === index
                          );
                        })}
                      styles={colourStyles}
                      value={{
                        label: liftAuthorityAccess.company,
                        value: liftAuthorityAccess.company,
                      }}
                      onChange={(e) => {
                        setLiftAuthorityAccess({
                          ...liftAuthorityAccess,
                          company: e.value,
                          branch: "Please Select Branch",
                        });
                      }}
                    />
                    {/* <MultiSelect
                                            options={accessbranch
                                                ?.map((data) => ({
                                                    label: data.company,
                                                    value: data.company,
                                                }))
                                                .filter((item, index, self) => {
                                                    return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                })}
                                            value={selectedOptionsCompanyFloor}
                                            onChange={(e) => {
                                                handleCompanyChangeFloor(e);
                                            }}
                                            valueRenderer={customValueRendererCompanyFloor}
                                            labelledBy="Please Select Company"
                                        /> */}
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
                            comp.company === liftAuthorityAccess?.company
                        )
                        .map((data) => ({
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
                      styles={colourStyles}
                      value={{
                        label: liftAuthorityAccess.branch,
                        value: liftAuthorityAccess.branch,
                      }}
                      onChange={(e) => {
                        setLiftAuthorityAccess({
                          ...liftAuthorityAccess,
                          branch: e.value,
                        });
                      }}
                    />
                    {/* <MultiSelect
                                            options={accessbranch
                                                ?.filter((comp) => valueCompanyCatFloor?.includes(comp.company))
                                                ?.map((data) => ({
                                                    label: data.branch,
                                                    value: data.branch,
                                                }))
                                                .filter((item, index, self) => {
                                                    return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                })}
                                            value={selectedOptionsBranchFloor}
                                            onChange={(e) => {
                                                handleBranchChangeFloor(e);
                                            }}
                                            valueRenderer={customValueRendererBranchFloor}
                                            labelledBy="Please Select Branch"
                                        /> */}
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Floor Access<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <MultiSelect
                      options={allfloor
                        ?.filter(
                          (comp) => liftAuthorityAccess.branch === comp.branch
                        )
                        .map((data) => ({
                          label: data.name,
                          value: data.name,
                        }))
                        .filter((item, index, self) => {
                          return (
                            self.findIndex(
                              (i) =>
                                i.label === item.label && i.value === item.value
                            ) === index
                          );
                        })}
                      value={selectedOptionsFloor}
                      onChange={(e) => {
                        handleFloorChange(e);
                      }}
                      valueRenderer={customValueRendererFloor}
                      labelledBy="Please Select Floor"
                    />
                  </FormControl>
                </Grid>
                <Grid item md={1} sm={6} xs={6} marginTop={3}>
                  <LoadingButton
                    onClick={handleSubmit}
                    loading={loadingdeloverall}
                    sx={buttonStyles.buttonsubmit}
                    loadingPosition="end"
                    variant="contained"
                  >
                    Submit
                  </LoadingButton>
                </Grid>
                <Grid item md={2.5} sm={6} xs={12} marginTop={3}>
                  <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                    Clear
                  </Button>
                </Grid>
              </Grid>
              <br />
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
          sx={{
            overflow: "visible",
            "& .MuiPaper-root": {
              overflow: "visible",
            },
          }}
        >
          <Box sx={{ padding: "20px" }}>
            <>
              <form onSubmit={editSubmit}>
                <Grid container spacing={2}>
                  <Grid item md={12} xs={12} sm={12}>
                    <Typography sx={userStyle.HeaderText}>
                      Edit Lift Authority Access Management
                    </Typography>
                  </Grid>
                </Grid>
                <br />
                <Grid container spacing={2}>
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Company <b style={{ color: "red" }}>*</b>
                      </Typography>
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
                                  i.label === item.label &&
                                  i.value === item.value
                              ) === index
                            );
                          })}
                        value={selectedOptionsCompanyEdit}
                        onChange={(e) => {
                          handleCompanyChangeEdit(e);
                        }}
                        valueRenderer={customValueRendererCompanyEdit}
                        labelledBy="Please Select Company"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Branch<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={accessbranch
                          ?.filter((comp) =>
                            valueCompanyCatEdit?.includes(comp.company)
                          )
                          ?.map((data) => ({
                            label: data.branch,
                            value: data.branch,
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
                        value={selectedOptionsBranchEdit}
                        onChange={(e) => {
                          handleBranchChangeEdit(e);
                        }}
                        valueRenderer={customValueRendererBranchEdit}
                        labelledBy="Please Select Branch"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Unit<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={accessbranch
                          ?.filter(
                            (comp) =>
                              valueCompanyCatEdit?.includes(comp.company) &&
                              valueBranchCatEdit?.includes(comp.branch)
                          )
                          ?.map((data) => ({
                            label: data.unit,
                            value: data.unit,
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
                        value={selectedOptionsUnitEdit}
                        onChange={(e) => {
                          handleUnitChangeEdit(e);
                        }}
                        valueRenderer={customValueRendererUnitEdit}
                        labelledBy="Please Select Unit"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Team<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={allTeam
                          ?.filter(
                            (comp) =>
                              valueCompanyCatEdit?.includes(comp.company) &&
                              valueBranchCatEdit?.includes(comp.branch) &&
                              valueUnitCatEdit?.includes(comp.unit)
                          )
                          ?.map((data) => ({
                            label: data.teamname,
                            value: data.teamname,
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
                        value={selectedOptionsTeamEdit}
                        onChange={(e) => {
                          handleTeamChangeEdit(e);
                        }}
                        valueRenderer={customValueRendererTeamEdit}
                        labelledBy="Please Select Team"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Employee Name<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={allUsersData
                          ?.filter(
                            (u) =>
                              valueCompanyCatEdit?.includes(u.company) &&
                              valueBranchCatEdit?.includes(u.branch) &&
                              valueUnitCatEdit?.includes(u.unit) &&
                              valueTeamCatEdit?.includes(u.team)
                          )
                          .map((u) => ({
                            ...u,
                            label: u.companyname,
                            value: u.companyname,
                          }))}
                        value={selectedOptionsEmployeeEdit}
                        onChange={handleEmployeeChangeEdit}
                        valueRenderer={customValueRendererEmployeeEdit}
                        labelledBy="Please Select Employee Name"
                      />
                    </FormControl>
                  </Grid>
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
                          label: liftAuthorityAccessEdit.company,
                          value: liftAuthorityAccessEdit.company,
                        }}
                        onChange={(e) => {
                          setLiftAuthorityAccessEdit({
                            ...liftAuthorityAccessEdit,
                            company: e.value,
                            branch: "Please Select Branch",
                          });
                        }}
                      />
                      {/* <MultiSelect
                                            options={accessbranch
                                                ?.map((data) => ({
                                                    label: data.company,
                                                    value: data.company,
                                                }))
                                                .filter((item, index, self) => {
                                                    return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                })}
                                            value={selectedOptionsCompanyFloor}
                                            onChange={(e) => {
                                                handleCompanyChangeFloor(e);
                                            }}
                                            valueRenderer={customValueRendererCompanyFloor}
                                            labelledBy="Please Select Company"
                                        /> */}
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
                              comp.company === liftAuthorityAccessEdit?.company
                          )
                          .map((data) => ({
                            label: data.branch,
                            value: data.branch,
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
                          label: liftAuthorityAccessEdit.branch,
                          value: liftAuthorityAccessEdit.branch,
                        }}
                        onChange={(e) => {
                          setLiftAuthorityAccessEdit({
                            ...liftAuthorityAccessEdit,
                            branch: e.value,
                          });
                        }}
                      />
                      {/* <MultiSelect
                                            options={accessbranch
                                                ?.filter((comp) => valueCompanyCatFloor?.includes(comp.company))
                                                ?.map((data) => ({
                                                    label: data.branch,
                                                    value: data.branch,
                                                }))
                                                .filter((item, index, self) => {
                                                    return self.findIndex((i) => i.label === item.label && i.value === item.value) === index;
                                                })}
                                            value={selectedOptionsBranchFloor}
                                            onChange={(e) => {
                                                handleBranchChangeFloor(e);
                                            }}
                                            valueRenderer={customValueRendererBranchFloor}
                                            labelledBy="Please Select Branch"
                                        /> */}
                    </FormControl>
                  </Grid>
                  {/* <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Company <b style={{ color: "red" }}>*</b>
                      </Typography>
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
                                  i.label === item.label &&
                                  i.value === item.value
                              ) === index
                            );
                          })}
                        value={selectedOptionsCompanyFloorEdit}
                        onChange={(e) => {
                          handleCompanyChangeFloorEdit(e);
                        }}
                        valueRenderer={customValueRendererCompanyFloorEdit}
                        labelledBy="Please Select Company"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Branch<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={accessbranch
                          ?.filter((comp) =>
                            valueCompanyCatFloorEdit?.includes(comp.company)
                          )
                          ?.map((data) => ({
                            label: data.branch,
                            value: data.branch,
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
                        value={selectedOptionsBranchFloorEdit}
                        onChange={(e) => {
                          handleBranchChangeFloorEdit(e);
                        }}
                        valueRenderer={customValueRendererBranchFloorEdit}
                        labelledBy="Please Select Branch"
                      />
                    </FormControl>
                  </Grid> */}
                  <Grid item md={3} xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Floor Access<b style={{ color: "red" }}>*</b>
                      </Typography>
                      <MultiSelect
                        options={allfloor
                          ?.filter(
                            (comp) =>
                              liftAuthorityAccessEdit?.branch === comp.branch
                          )
                          .map((data) => ({
                            label: data.name,
                            value: data.name,
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
                        value={selectedOptionsFloorEdit}
                        onChange={(e) => {
                          handleFloorChangeEdit(e);
                        }}
                        valueRenderer={customValueRendererFloorEdit}
                        labelledBy="Please Select Floor"
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <br />

                <Grid container spacing={2}>
                  <Grid item md={1.5} xs={12} sm={12}>
                    <LoadingButton
                      onClick={editSubmit}
                      sx={buttonStyles.buttonsubmit}
                      loadingPosition="end"
                      variant="contained"
                    >
                      Update
                    </LoadingButton>
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
              </form>
            </>
          </Box>
        </Dialog>
      </Box>
      <br />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes("lliftauthorityaccessmanagement") && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>
                Lift Authority Access Management List
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
                    <MenuItem value={liftauthorityaccessmanagements?.length}>
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
                    "excelliftauthorityaccessmanagement"
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
                    "csvliftauthorityaccessmanagement"
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
                    "printliftauthorityaccessmanagement"
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
                    "pdfliftauthorityaccessmanagement"
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
                    "imageliftauthorityaccessmanagement"
                  ) && (
                    <>
                      <Button
                        sx={userStyle.buttongrp}
                        onClick={handleCaptureImage}
                      >
                        <ImageIcon sx={{ fontSize: "15px" }} />{" "}
                        &ensp;Image&ensp;
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
                    maindatas={liftauthorityaccessmanagements}
                    setSearchedString={setSearchedString}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    paginated={false}
                    totalDatas={liftauthorityaccessmanagements}
                  />
                </Box>
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
            {isUserRoleCompare?.includes("bdliftauthorityaccessmanagement") && (
              <Button
                variant="contained"
                sx={buttonStyles.buttonbulkdelete}
                onClick={handleClickOpenalert}
              >
                Bulk Delete
              </Button>
            )}
            <br />
            {!loader ? (
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
                  // totalDatas={totalDatas}
                  searchQuery={searchedString}
                  handleShowAllColumns={handleShowAllColumns}
                  setFilteredRowData={setFilteredRowData}
                  filteredRowData={filteredRowData}
                  setFilteredChanges={setFilteredChanges}
                  filteredChanges={filteredChanges}
                  gridRefTableImg={gridRefTableImg}
                  itemsList={liftauthorityaccessmanagements}
                />
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
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": {
            maxHeight: "80vh", // limit dialog height
            overflowY: "auto", // enable vertical scroll
          },
        }}
      >
        <Box sx={{ width: "750px", padding: "20px 50px" }}>
          <>
            <Typography sx={userStyle.HeaderText}>
              {" "}
              View Lift Authority Access Management
            </Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Company</Typography>
                  <Typography>
                    {updateDetails.company
                      ?.map((t, i) => `${i + 1 + ". "}` + t)
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Branch</Typography>
                  <Typography>
                    {updateDetails.branch
                      ?.map((t, i) => `${i + 1 + ". "}` + t)
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Unit</Typography>
                  <Typography>
                    {updateDetails.unit
                      ?.map((t, i) => `${i + 1 + ". "}` + t)
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Team</Typography>
                  <Typography>
                    {updateDetails.team
                      ?.map((t, i) => `${i + 1 + ". "}` + t)
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Employee Name</Typography>
                  <Typography>
                    {updateDetails.employeename
                      ?.map((t, i) => `${i + 1 + ". "}` + t)
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Company</Typography>
                  <Typography>{updateDetails.companyfloor}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Branch</Typography>
                  <Typography>{updateDetails.branchfloor}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Floor</Typography>
                  <Typography>
                    {updateDetails.floor
                      ?.map((t, i) => `${i + 1 + ". "}` + t)
                      .toString()}
                  </Typography>
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br /> <br />
            <Grid container spacing={2}>
              <Button
                variant="contained"
                sx={buttonStyles.btncancel}
                onClick={handleCloseview}
              >
                {" "}
                Back{" "}
              </Button>
            </Grid>
          </>
        </Box>
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
        filteredDataTwo={
          (filteredChanges !== null ? filteredRowData : rowDataTable) ?? []
        }
        itemsTwo={liftauthorityaccessmanagements ?? []}
        filename={"Lift Authority Access Management"}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
      {/* INFO */}
      <InfoPopup
        openInfo={openInfo}
        handleCloseinfo={handleCloseinfo}
        heading="Lift Authority Access Management Info"
        addedby={addedby}
        updateby={updateby}
      />
      {/*SINGLE DELETE ALERT DIALOG ARE YOU SURE? */}
      <DeleteConfirmation
        open={isDeleteOpen}
        onClose={handleCloseMod}
        onConfirm={deleGroup}
        title="Are you sure?"
        confirmButtonText="Yes"
        cancelButtonText="Cancel"
      />
      {/*BULK DELETE ALERT DIALOG ARE YOU SURE? */}
      <DeleteConfirmation
        open={isDeleteOpencheckbox}
        onClose={handleCloseModcheckbox}
        onConfirm={delGroupcheckbox}
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

export default LiftAuthorityAccessManagement;
