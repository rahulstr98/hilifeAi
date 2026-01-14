import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Box,
  Typography,
  OutlinedInput,
  Select,
  MenuItem,
  Dialog,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  Popover,
  Checkbox,
  TextField,
  IconButton,
} from "@mui/material";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
} from "@mui/material";
import { userStyle } from "../../../../pageStyle";
import { MultiSelect } from "react-multi-select-component";
import { FaFileCsv, FaFileExcel, FaPrint, FaFilePdf } from "react-icons/fa";
import "jspdf-autotable";
import axios from "axios";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { SERVICE } from "../../../../services/Baseservice";
import { useReactToPrint } from "react-to-print";
import moment from "moment-timezone";
import {
  UserRoleAccessContext,
  AuthContext,
} from "../../../../context/Appcontext";
import Headtitle from "../../../../components/Headtitle";
import { ThreeDots } from "react-loader-spinner";
import { saveAs } from "file-saver";
import Switch from "@mui/material/Switch";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import LoadingButton from "@mui/lab/LoadingButton";
import { handleApiError } from "../../../../components/Errorhandling";
import ExportData from "../../../../components/ExportData";
import AlertDialog from "../../../../components/Alert";
import MessageAlert from "../../../../components/MessageAlert";
import { AUTH, BASE_URL } from "../../../../services/Authservice";
import InfoPopup from "../../../../components/InfoPopup.js";
import {
  DeleteConfirmation,
  PleaseSelectRow,
} from "../../../../components/DeleteConfirmation.js";
import PageHeading from "../../../../components/PageHeading";
import AggregatedSearchBar from "../../../../components/AggregatedSearchBar";
import AggridTable from "../../../../components/AggridTable";
import domtoimage from "dom-to-image";
import { getCurrentServerTime } from "../../../../components/getCurrentServerTime";
import EnabledVisitorBiometricApproval from "./EnabledVisitorBiometricApproval.js";

function VisitorBiometricApproval() {
  const [serverTime, setServerTime] = useState(new Date());
  useEffect(() => {
    const fetchTime = async () => {
      try {
        // Get current server time and format it
        const time = await getCurrentServerTime();
        setServerTime(time);
      } catch (error) {
        console.error("Failed to fetch server time:", error);
      }
    };

    fetchTime();
  }, []);

  const pathname = window.location.pathname;
  const gridRefTable = useRef(null);
  const rowsPerPage = 1;
  const [searchedString, setSearchedString] = useState("");
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);
  const [isHandleChange, setIsHandleChange] = useState(false);
  const [loader, setLoader] = useState(false);
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState("");
  const [totalProjects, setTotalProjects] = useState(0);
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
    "Device Name",
    "Visitor Id",
    "Visitor Name",
    "Visitor Created Date",
    "Visitor Email",
    "Visitor Contact Number",
    "Approval Status",
    "Visitor Status",
    "Visitor Entry From",
  ];
  let exportRowValues = [
    "company",
    "branch",
    "unit",
    "floor",
    "area",
    "cloudIDC",
    "biometricUserIDC",
    "staffNameC",
    "visitorCreatedDate",
    "visitoremail",
    "visitorcontactnumber",
    "isEnabledC",
    "visitorpagedetails",
    "visitorpage",
  ];
  const [approvalVisitorsList, setApprovalVisitorsList] = useState([]);
  const [EnabledapprovalVisitorsList, setEnabledApprovalVisitorsList] =
    useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    isUserRoleCompare,
    isUserRoleAccess,
    pageName,
    setPageName,
    isAssignBranch,
    buttonStyles,
  } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);
  const gridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [isBtn, setIsBtn] = useState(false);
  const [overallExcelDatas, setOverallExcelDatas] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
  const [fileFormat, setFormat] = useState("");

  const [biometricDeviceValues, setBiometricDeviceValues] = useState([]);
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
    setBiometricDeviceValues([]);
    setValueBioDevices([]);
    setSelectedOptionsApproveStatus([]);
    setValueApproveStatus([]);
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
    setValueBioDevices([]);
    setSelectedOptionsBioDevices([]);
    BiometricDeviceDropdowns(valueCompanyCat, values);
  };
  const customValueRendererBranch = (valueBranchCat, _categoryname) => {
    return valueBranchCat?.length
      ? valueBranchCat.map(({ label }) => label)?.join(", ")
      : "Please Select Branch";
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

  const [selectedOptionsApproveStatus, setSelectedOptionsApproveStatus] =
    useState([]);
  let [valueApproveStatus, setValueApproveStatus] = useState([]);
  const handleApproveStatusChange = (options) => {
    setValueApproveStatus(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsApproveStatus(options);
  };
  const customValueRendererApproveStatus = (
    valueApproveStatus,
    _categoryname
  ) => {
    return valueApproveStatus?.length
      ? valueApproveStatus.map(({ label }) => label)?.join(", ")
      : "Please Select Approve Status";
  };
  const handleAutoSelect = async () => {
    setPageName(!pageName);
    try {
      let selectedValues = accessbranch
        ?.map((data) => ({
          company: data.company,
          branch: data.branch,
          unit: data.unit,
        }))
        .filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.company === value.company &&
                t.branch === value.branch &&
                t.unit === value.unit
            )
        );
      let selectedCompany = selectedValues
        ?.filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.company === value.company)
        )
        .map((a, index) => {
          return a.company;
        });

      let mappedCompany = selectedValues
        ?.filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.company === value.company)
        )
        ?.map((data) => ({
          label: data?.company,
          value: data?.company,
        }));

      setValueCompanyCat(selectedCompany);
      setSelectedOptionsCompany(mappedCompany);

      let selectedBranch = selectedValues
        .filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (t) => t.company === value.company && t.branch === value.branch
            )
        )
        .map((a, index) => {
          return a.branch;
        });

      let mappedBranch = selectedValues
        .filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (t) => t.company === value.company && t.branch === value.branch
            )
        )
        ?.map((data) => ({
          label: data?.branch,
          value: data?.branch,
        }));

      setValueBranchCat(selectedBranch);
      setSelectedOptionsBranch(mappedBranch);
      BiometricDeviceDropdowns(selectedCompany, selectedBranch);
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };
  useEffect(() => {
    handleAutoSelect();
  }, [isAssignBranch]);

  const BiometricDeviceDropdowns = async (company, branch) => {
    setPageName(!pageName);
    try {
      let res = await axios.post(SERVICE.GET_COMPANY_BRANCH_BIOMETRIC_DEVICES, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: company,
        branch: branch,
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

  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };
  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };

  const getapi = async () => {
    let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
      empcode: String(isUserRoleAccess?.empcode),
      companyname: String(isUserRoleAccess?.companyname),
      pagename: String(
        "Human Resource/HR Documents/Visitor Biometric Approval"
      ),
      commonid: String(isUserRoleAccess?._id),
      date: String(new Date(serverTime)),
      addedby: [
        {
          name: String(isUserRoleAccess?.username),
        },
      ],
    });
  };

  useEffect(() => {
    getapi();
  }, []);

  //image
  const gridRefTableImg = useRef(null);
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage
        .toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, "Visitor Biometric Approval.png");
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
  const [pageDialog, setPageDialog] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPageDialog(newPage);
  };
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
    setIsBtn(false);
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
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
    if (selectedRows.length === 0) {
      setIsDeleteOpenalert(true);
      setIsDeleteOpencheckbox(false);
      setCandiddateIdPassing([]);
    } else {
      const itemsId = selectedRows;
      const ItemsStartData = items?.filter((data) =>
        selectedRows?.includes(data?.id)
      );
      if (itemsId?.length === 0) {
        setIsDeleteOpenalert(false);
        setIsDeleteOpencheckbox(false);
        setCandiddateIdPassing([]);
        setVisitorDataDialog([]);
        setIsDeleteOpenalert(false);
      } else {
        setSelectedRows(itemsId);
        setRowIdPassing(itemsId);
        setCandiddateIdPassing([]);
        setVisitorDataDialog(ItemsStartData);
        setIsDeleteOpencheckbox(true);
      }
    }
  };
  const handleCloseModalert = () => {
    setIsDeleteOpenalert(false);
    setRowIdPassing([]);
    setIsDeleteOpencheckbox(false);
  };

  //Delete model]
  const today = new Date(serverTime).toISOString().split("T")[0];
  const [isDeleteOpencheckbox, setIsDeleteOpencheckbox] = useState(false);
  const [visitorDataDialog, setVisitorDataDialog] = useState([]);
  const [rowIdPassing, setRowIdPassing] = useState([]);
  const [CandiddateIdPassing, setCandiddateIdPassing] = useState([]);
  const [endDate, setEndDate] = useState("");

  const handleClickOpencheckbox = () => {
    setIsDeleteOpencheckbox(true);
  };
  const handleCloseModcheckbox = () => {
    setIsDeleteOpencheckbox(false);
    setVisitorDataDialog([]);
    setPageDialog(0);
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

  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    cloudIDC: true,
    biometricUserIDC: true,
    isEnabledC: true,
    privilegeC: true,
    staffNameC: true,
    status: true,
    visitorCreatedDate: true,
    visitoremail: true,
    visitorcontactnumber: true,
    company: true,
    branch: true,
    unit: true,
    floor: true,
    area: true,
    visitorpage: true,
    visitorpagedetails: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(
    initialColumnVisibility
  );

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // This is required for Chrome support
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
    } else if (selectedOptionsBioDevices?.length < 1) {
      setPopupContentMalert("Please Select Device Names");
      setPopupSeverityMalert("warning");
      handleClickOpenPopupMalert();
    } else {
      // sendRequest();
      fetchAppprovalBiometricDevices();
    }
  };
  const handleSubmitDates = (e) => {
    e.preventDefault();
    // if (visitorDataDialog === "" || visitorDataDialog === undefined) {
    //   setPopupContentMalert("Please Select Start Date");
    //   setPopupSeverityMalert("warning");
    //   handleClickOpenPopupMalert();
    // } else if (endDate === "" || endDate === undefined) {
    //   setPopupContentMalert("Please Select Expiry Time");
    //   setPopupSeverityMalert("warning");
    //   handleClickOpenPopupMalert();
    // } else {
    getApprovalDocument(rowIdPassing);
    // }
  };

  const handleClear = (e) => {
    e.preventDefault();
    setApprovalVisitorsList([]);
    setEnabledApprovalVisitorsList([]);
    setSelectedOptionsBioDevices([]);
    setSelectedOptionsBranch([]);
    setSelectedOptionsCompany([]);
    setValueBranchCat([]);
    setValueCompanyCat([]);
    setSelectedOptionsApproveStatus([]);
    setValueApproveStatus([]);
    setValueBioDevices([]);
    setBiometricDeviceValues([]);
    setPopupContent("Cleared Successfully");
    setPopupSeverity("success");
    handleClickOpenPopup();
  };

  //get all Sub vendormasters.
  const fetchAppprovalBiometricDevices = async () => {
    setPageName(!pageName);
     setLoader(true);
    try {
      let res_vendor = await axios.post(
        SERVICE.GET_FILTERED_BIO_DEVICES_VISITORS,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          devices: valueBioDevices,
          approval: ["Enable", "Disable"],
        }
      );
     
      const answer =
        res_vendor?.data?.visitorslist?.length > 0
          ? res_vendor?.data?.visitorslist
              ?.filter((data) => data?.isEnabledC === "No")
              ?.map((item, index) => ({
                ...item,
                serialNumber: index + 1,
                id: item?._id,
              }))
          : [];
      const answerEnabled =
        res_vendor?.data?.visitorslist?.length > 0
          ? res_vendor?.data?.visitorslist
              ?.filter((data) => data?.isEnabledC === "Yes")
              ?.map((item, index) => ({
                ...item,
                serialNumber: index + 1,
                id: item?._id,
              }))
          : [];
      console.log(
        res_vendor?.data?.visitorslist,
        "res_vendor?.data?.visitorslist"
      );
      setApprovalVisitorsList(answer);
      setEnabledApprovalVisitorsList(answerEnabled);
      setLoader(false);
    } catch (err) {
     setLoader(false);
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
    documentTitle: "Visitor Biometric Approval",
    pageStyle: "print",
  });

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, []);
  useEffect(() => {
    addSerialNumber(approvalVisitorsList);
  }, [approvalVisitorsList]);

  const [items, setItems] = useState([]);

  const addSerialNumber = (data) => {
    const itemsWithSerialNumber = data?.map((item, index) => ({
      ...item,
      serialNumber: index + 1,
    }));
    setItems(itemsWithSerialNumber);
  };

  //Datatable
  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSelectedRows([]);
    setRowIdPassing([]);
    setCandiddateIdPassing([]);
    setSelectAllChecked(false);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setSelectedRows([]);
    setRowIdPassing([]);
    setCandiddateIdPassing([]);
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

  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }


  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
    <div>
      <Checkbox checked={selectAllChecked} onChange={onSelectAll} />
    </div>
  );
  const checkingData = (selectedIds, candidateid) => {
    const itemsId = selectedIds;
    const candidateId = items?.filter((data) => selectedIds?.includes(data.id));
    if (itemsId?.length > 0) {
      setIsDeleteOpencheckbox(true);
      setRowIdPassing(selectedIds);
      setCandiddateIdPassing(candidateId);
      setVisitorDataDialog(candidateId);
    } else {
      setIsDeleteOpencheckbox(false);
      setRowIdPassing([]);
    }
  };

  //get single row to edit....
  const getApprovalDocument = async (selectedIds, candidateid) => {
    setPageName(!pageName);
    // setLoader(true);
    try {
      let response = await axios.post(
        `${SERVICE.ENABLE_VISITORS_DETAILS_BY_ID_GLOBAL}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          ids: selectedIds,
        }
      );
      await fetchAppprovalBiometricDevices();
      // setLoader(false);
      handleCloseModcheckbox();
      setPageDialog(0);
      setSelectedRows([]);
      setRowIdPassing([]);
      setCandiddateIdPassing([]);
      setVisitorDataDialog([]);
      setEndDate("");

      // }
    } catch (err) {
      console.log(err, "err");
      // setLoader(false);
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const getViewFile = async (id) => {
    let response = await axios.get(
      `${SERVICE.SINGLE_CANDIDATE_DOCUMENTPREPARATION}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      }
    );
    const fileUrl = `${BASE_URL}/candidateDocuments/${response?.data?.scandidateDocumentPreparation.approvedfilename}`;
    window.open(fileUrl, "_blank");
  };
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
      // lockPinned: true,
    },
    {
      field: "serialNumber",
      headerName: "SNo",
      flex: 0,
      width: 75,
      hide: !columnVisibility.serialNumber,
      headerClassName: "bold-header",
      pinned: "left",
      //lockPinned: true,
    },
    {
      field: "isEnabledC",
      headerName: "Approval Status",
      flex: 0,
      width: 220,
      minHeight: "40px",
      hide: !columnVisibility.isEnabledC,
      pinned: "left",
      cellRenderer: (params) => (
        <Grid>
          {params?.data?.isEnabledC === "Yes" ? (
            <Typography color="#009688" marginTop={1.5}>
              Enable
            </Typography>
          ) : (
            <Button
              variant="contained"
              color={"warning"}
              onClick={() => {
                checkingData([params.data.id], [params.data.candidateid]);
              }}
              sx={userStyle.buttonview}
            >
              Enable Visitor
            </Button>
          )}
        </Grid>
      ),
    },

    {
      field: "company",
      headerName: "Company",
      flex: 0,
      width: 150,
      hide: !columnVisibility.company,
      headerClassName: "bold-header",
      // pinned: "left",
    },
    {
      field: "branch",
      headerName: "Branch",
      flex: 0,
      width: 150,
      hide: !columnVisibility.branch,
      headerClassName: "bold-header",
      // pinned: "left",
    },
    {
      field: "unit",
      headerName: "Unit",
      flex: 0,
      width: 150,
      hide: !columnVisibility.unit,
      headerClassName: "bold-header",
      // pinned: "left",
    },
    {
      field: "floor",
      headerName: "Floor",
      flex: 0,
      width: 150,
      hide: !columnVisibility.floor,
      headerClassName: "bold-header",
      // pinned: "left",
    },
    {
      field: "area",
      headerName: "Area",
      flex: 0,
      width: 150,
      hide: !columnVisibility.area,
      headerClassName: "bold-header",
      // pinned: "left",
    },
    {
      field: "cloudIDC",
      headerName: "Device Name",
      flex: 0,
      width: 150,
      hide: !columnVisibility.cloudIDC,
      headerClassName: "bold-header",
      // pinned: "left",
    },
    {
      field: "staffNameC",
      headerName: "Visitor Name",
      flex: 0,
      width: 200,
      hide: !columnVisibility.staffNameC,
      headerClassName: "bold-header",
      // pinned: "left",
    },
    {
      field: "visitorCreatedDate",
      headerName: "Visitor Created Date",
      flex: 0,
      width: 200,
      hide: !columnVisibility.visitorCreatedDate,
      headerClassName: "bold-header",
      // pinned: "left",
    },
    {
      field: "visitoremail",
      headerName: "Visitor Email",
      flex: 0,
      width: 200,
      hide: !columnVisibility.visitoremail,
      headerClassName: "bold-header",
      // pinned: "left",
    },
    {
      field: "visitorcontactnumber",
      headerName: "Visitor Contact Number",
      flex: 0,
      width: 200,
      hide: !columnVisibility.visitorcontactnumber,
      headerClassName: "bold-header",
      // pinned: "left",
    },
    {
      field: "biometricUserIDC",
      headerName: "Visitor Id",
      flex: 0,
      width: 150,
      minHeight: "40px",
      hide: !columnVisibility.biometricUserIDC,
      // pinned: "left",
    },
    {
      field: "visitorpagedetails",
      headerName: "Visitor Status",
      flex: 0,
      width: 150,
      hide: !columnVisibility.visitorpagedetails,
      headerClassName: "bold-header",
    },
    {
      field: "visitorpage",
      headerName: "Visitor Entry From",
      flex: 0,
      width: 150,
      hide: !columnVisibility.visitorpage,
      headerClassName: "bold-header",
    },
    // {
    //   field: "visitorpagedetails",
    //   headerName: "Visitor Access",
    //   flex: 0,
    //   width: 150,
    //   hide: !columnVisibility.visitorpagedetails,
    //   headerClassName: "bold-header",
    // },
  ];

  const rowDataTable = filteredData.map((item) => {
    return {
      id: item.id,
      serialNumber: item.serialNumber,
      cloudIDC: item.cloudIDC,
      biometricUserIDC: item.biometricUserIDC,
      isEnabledC: item.isEnabledC,
      privilegeC: item.privilegeC,
      staffNameC: item.staffNameC,
      visitorCreatedDate: item.visitorCreatedDate,
      visitorintime: item.visitorintime,
      visitoremail: item.visitoremail,
      visitorcontactnumber: item.visitorcontactnumber,
      company: item.company,
      branch: item.branch,
      unit: item.unit,
      floor: item.floor,
      area: item.area,
      status: item.status,
      expirytime: item.expirytime,
      visitorpage: item.visitorpage,
      visitorpagedetails: item.visitorpagedetails,
    };
  });
  console.log(rowDataTable);
  const rowsWithCheckboxes = rowDataTable.map((row) => ({
    ...row,
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
  // controls
  const controls = [
    { label: "Menu", value: "Menu" },
    { label: "Add", value: "Add" },
    { label: "Edit", value: "Edit" },
    { label: "List", value: "List" },
    { label: "Info", value: "Info" },
    { label: "Delete", value: "Delete" },
    { label: "View", value: "View" },
    { label: "PDF", value: "PDF" },
    { label: "Print", value: "Print" },
    { label: "Excel", value: "Excel" },
    { label: "CSV", value: "CSV" },
    { label: "Image", value: "Image" },
    { label: "BulkEdit", value: "BulkEdit" },
    { label: "BulkDelete", value: "BulkDelete" },
  ];

  return (
    <Box>
      <Headtitle title={"VISITOR BIOMETRIC APPROVAL"} />
      <PageHeading
        title="Visitor Biometric Approval"
        modulename="Human Resources"
        submodulename="HR"
        mainpagename="Biometric Device"
        subpagename="Visitor Biometric Approval"
        subsubpagename=""
      />
      {isUserRoleCompare?.includes("lvisitorbiometricapproval") && (
        <>
          <Box sx={userStyle.dialogbox}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>
                    Visitor Biometric Approval List
                  </Typography>
                </Grid>
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
            </>
          </Box>
        </>
      )}

      <br />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes("lvisitorbiometricapproval") && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>
                Visitor Biometric Approval List
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
                    <MenuItem value={items?.length}>All</MenuItem>
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
                    "excelvisitorbiometricapproval"
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
                    "csvvisitorbiometricapproval"
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
                    "printvisitorbiometricapproval"
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
                    "pdfvisitorbiometricapproval"
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
                    "imagevisitorbiometricapproval"
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
              <Grid item md={2} xs={12} sm={12}>
                <AggregatedSearchBar
                  columnDataTable={columnDataTable}
                  setItems={setItems}
                  addSerialNumber={addSerialNumber}
                  setPage={setPage}
                  maindatas={approvalVisitorsList}
                  setSearchedString={setSearchedString}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  paginated={false}
                  totalDatas={items}
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
            {isUserRoleCompare?.includes("bevisitorbiometricapproval") && (
              <Button
                sx={buttonStyles.buttonbulkdelete}
                variant="contained"
                color="error"
                onClick={handleClickOpenalert}
              >
                Enable Visitor
              </Button>
            )}
            &ensp;
            <br />
            <br />
            {loader ? (
              <>
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
                  </Box>
                </Box>
              </>
            ) : (
              <>
                <Box
                  style={{
                    width: "100%",
                    overflowY: "hidden", // Hide the y-axis scrollbar
                  }}
                >
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
                    searchQuery={searchedString}
                    handleShowAllColumns={handleShowAllColumns}
                    setFilteredRowData={setFilteredRowData}
                    filteredRowData={filteredRowData}
                    setFilteredChanges={setFilteredChanges}
                    filteredChanges={filteredChanges}
                    gridRefTableImg={gridRefTableImg}
                    itemsList={items}
                  />

                  {/* <StyledDataGrid onClipboardCopy={(copiedString) => setCopiedData(copiedString)} rows={rowsWithCheckboxes} columns={columnDataTable.filter((column) => columnVisibility[column.field])} onSelectionModelChange={handleSelectionChange} selectionModel={selectedRows} autoHeight={true} ref={gridRef} density="compact" hideFooter getRowClassName={getRowClassName} disableRowSelectionOnClick /> */}
                </Box>
              </>
            )}
          </Box>
        </>
      )}
      <EnabledVisitorBiometricApproval
        approvalVisitorsList={EnabledapprovalVisitorsList}
      />
      <Box>
        <Dialog
          open={isDeleteOpencheckbox}
          onClose={handleCloseModcheckbox}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <ErrorOutlineOutlinedIcon
                sx={{ fontSize: "80px", color: "orange" }}
              />
            </Box>
            <Typography variant="h5" sx={{ color: "red" }}>
              The Visitor Access will be enabled until the below-mentioned
              Expiry Time.
            </Typography>
            <br />
          </DialogContent>
          <DialogContent>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>SNo</TableCell>
                    <TableCell>Visitor Name</TableCell>
                    <TableCell>Device branch</TableCell>
                    <TableCell>Device Floor</TableCell>
                    <TableCell>Device Area</TableCell>
                    <TableCell>Biometric Device</TableCell>
                    <TableCell>Visitor Number</TableCell>
                    <TableCell>Visiting Date</TableCell>
                    <TableCell>In Time</TableCell>
                    <TableCell>Expiry Time</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {visitorDataDialog
                    .slice(
                      pageDialog * rowsPerPage,
                      pageDialog * rowsPerPage + rowsPerPage
                    )
                    .map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {pageDialog * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell>{row.staffNameC}</TableCell>
                        <TableCell>{row.branch}</TableCell>
                        <TableCell>{row.floor}</TableCell>
                        <TableCell>{row.area}</TableCell>
                        <TableCell>{row.cloudIDC}</TableCell>
                        <TableCell>{row.visitorcontactnumber}</TableCell>
                        <TableCell>{row.visitorCreatedDate}</TableCell>
                        <TableCell>{row.visitorintime}</TableCell>
                        <TableCell>{row.expirytime}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={visitorDataDialog?.length}
              page={pageDialog}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[]} // hide rows-per-page dropdown
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseModcheckbox}
              sx={buttonStyles.btncancel}
            >
              Cancel
            </Button>
            <Button
              sx={buttonStyles.buttonsubmit}
              autoFocus
              variant="contained"
              onClick={(e) => handleSubmitDates(e)}
            >
              {" "}
              OK{" "}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
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
        filteredDataTwo={rowDataTable ?? []}
        itemsTwo={items ?? []}
        filename={"Visitor Biometric Approval"}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
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
      <br />
    </Box>
  );
}

export default VisitorBiometricApproval;
