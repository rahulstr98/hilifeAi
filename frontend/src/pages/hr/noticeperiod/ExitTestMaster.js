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
  Typography,
} from "@mui/material";
import Switch from "@mui/material/Switch";
import axios from "axios";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import moment from "moment-timezone";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import { MultiSelect } from "react-multi-select-component";
import { NotificationContainer } from "react-notifications";
import "react-notifications/lib/notifications.css";
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import { handleApiError } from "../../../components/Errorhandling";
import Headtitle from "../../../components/Headtitle";
import PageHeading from "../../../components/PageHeading";
import { StyledTableCell, StyledTableRow } from "../../../components/Table";
import StyledDataGrid from "../../../components/TableStyle";
import {
  AuthContext,
  UserRoleAccessContext,
} from "../../../context/Appcontext";
import { userStyle } from "../../../pageStyle";
import { SERVICE } from "../../../services/Baseservice";

import AlertDialog from "../../../components/Alert";
import {
  DeleteConfirmation,
  PleaseSelectRow,
} from "../../../components/DeleteConfirmation.js";
import ExportData from "../../../components/ExportData";
import InfoPopup from "../../../components/InfoPopup.js";
import MessageAlert from "../../../components/MessageAlert";

function ExitTestMaster() {
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState("");
  const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
  const handleClickOpenPopupMalert = () => {
    // setSubmitLoader(false);
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

  let exportColumnNames = ["Mode", "Category", "Subcategory", "Test Name"];
  let exportRowValues = ["mode", "category", "subcategory", "testname"];

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

  const [interviewTestMaster, setInterviewTestMaster] = useState({
    category: "Please Select Category",
    subcategory: "Please Select Subcategory",
    testname: "",
    totalmarks: "",
    eligiblemarks: "",
    durationhours: "00",
    durationminutes: "20",
  });

  const [interviewTestMasterEdit, setInterviewTestMasterEdit] = useState({
    category: "Please Select Category",
    subcategory: "Please Select Subcategory",
    testname: "",
    totalmarks: "",
    eligiblemarks: "",
    durationhours: "00",
    durationminutes: "20",
  });

  const [hrsOption, setHrsOption] = useState([]);
  const [minsOption, setMinsOption] = useState([]);

  //function to generate hrs
  const generateHrsOptions = () => {
    const hrsOpt = [];
    for (let i = 0; i <= 23; i++) {
      if (i < 10) {
        i = "0" + i;
      }
      hrsOpt.push({ value: i.toString(), label: i.toString() });
    }
    setHrsOption(hrsOpt);
  };
  //function to generate mins
  const generateMinsOptions = () => {
    const minsOpt = [];
    for (let i = 0; i <= 59; i++) {
      if (i < 10) {
        i = "0" + i;
      }
      minsOpt.push({ value: i.toString(), label: i.toString() });
    }
    setMinsOption(minsOpt);
  };

  // Subcategroy multi select
  const [selectedOptionsSubCate, setSelectedOptionsSubCate] = useState([]);
  let [valueSubCate, setValueSubCate] = useState("");

  const handleSubCategoryChange = (options) => {
    setValueSubCate(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsSubCate(options);
  };

  const customValueRendererSubCate = (valueSubCate, _subcategorys) => {
    return valueSubCate.length
      ? valueSubCate.map(({ label }) => label).join(", ")
      : "Please Select Subcategory";
  };

  const [interviewgroupingall, setInterviewgroupingall] = useState([]);
  const [interviewGroupingValues, setInterviewGroupingValues] = useState([]);

  useEffect(() => {
    fetchInterviewOrders();
    fetchCategoryInterview();
    generateHrsOptions();
    generateMinsOptions();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  const {
    isUserRoleCompare,
    isUserRoleAccess,
    pageName,
    setPageName,
    buttonStyles,
  } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);
  const [reasonmasterCheck, setReasonmastercheck] = useState(false);
  const gridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [searchQueryManageAN, setSearchQueryManageAN] = useState("");
  const [copiedData, setCopiedData] = useState("");

  const handlesubmit = async (e) => {
    e.preventDefault();
    await fetchInterviewOrdersAll();
    let filt = selectedOptionsSubCate.map((item) => item.value);

    const nameMatch = checkDuplicates.some(
      (item) =>
        item.category == interviewTestMaster.category &&
        item.testname.toLowerCase() ==
        interviewTestMaster.testname.toLowerCase() &&
        filt.some((item1) => item1 == item.subcategory)
    );
    if (
      interviewTestMaster.category == "Please Select Category" ||
      interviewTestMaster.category == undefined ||
      interviewTestMaster.category == ""
    ) {
      setPopupContentMalert("Please Select Category!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (selectedOptionsSubCate.length === 0) {
      setPopupContentMalert("Please Select Subcategory!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      interviewTestMaster.testname == "" ||
      interviewTestMaster.testname == undefined
    ) {
      setPopupContentMalert("Please Enter Test Name!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (nameMatch) {
      setPopupContentMalert("Data Already Exist!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      sendRequest();
    }
  };

  const sendRequest = async () => {
    let subcategoriess = selectedOptionsSubCate.map((item) => item.value);
    setPageName(!pageName);
    try {
      await Promise.all(
        subcategoriess.map(async (data) => {
          await axios.post(
            SERVICE.EXITINTERVIEWTESTMASTER_CREATE,
            {
              category: interviewTestMaster.category,
              durationhours:
                interviewTestMaster.durationhours +
                ":" +
                interviewTestMaster.durationminutes,
              subcategory: data,
              testname: interviewTestMaster.testname,
              totalmarks: interviewTestMaster.totalmarks,
              eligiblemarks: interviewTestMaster.eligiblemarks,
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
        })
      );

      await fetchInterviewOrders();
      setInterviewTestMaster({
        ...interviewTestMaster,
        testname: "",
        totalmarks: "",
        eligiblemarks: "",
        durationhours: "00",
        durationminutes: "20",
      });
      setPopupContent("Added Successfully");
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
  //overall edit popup
  const [openOverAllEditPopup, setOpenOverAllEditPopup] = useState(false);
  const handleOpenOverallEditPopup = () => {
    setOpenOverAllEditPopup(true);
  };
  const handleCloseOverallEditPopup = () => {
    setOpenOverAllEditPopup(false);
  };
  const editSubmit = (e) => {
    e.preventDefault();

    const isNameMatch = interviewGroupingValues?.some(
      (item) =>
        item.category == interviewTestMasterEdit.category &&
        item.testname.toLowerCase() ==
        interviewTestMasterEdit.testname.toLowerCase() &&
        item.subcategory === interviewTestMasterEdit?.subcategory
    );
    if (
      interviewTestMasterEdit.category == "Please Select Category" ||
      interviewTestMasterEdit.category == undefined ||
      interviewTestMasterEdit.category == ""
    ) {
      setPopupContentMalert("Please Select Category!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert("Data Already Exist!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      interviewTestMasterEdit.subcategory == "Please Select Subcategory" ||
      interviewTestMasterEdit.subcategory == undefined ||
      interviewTestMasterEdit.subcategory == ""
    ) {
      setPopupContentMalert("Please Select Subcategory!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      interviewTestMasterEdit.testname == "" ||
      interviewTestMasterEdit.testname == undefined
    ) {
      setPopupContentMalert("Please Enter Test Name!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      if (
        interviewTestMasterEdit.category !== oldDatas?.category ||
        interviewTestMasterEdit.subcategory !== oldDatas?.subcategory ||
        interviewTestMasterEdit.testname !== oldDatas?.testname ||
        interviewTestMasterEdit.durationhours !== oldDatas?.duration
      ) {
        // handleOpenOverallEditPopup();
        sendEditRequest();
        handleCloseModEdit();
      } else {
        sendEditRequest();
      }
    }
  };

  //editing the single data...
  const sendEditRequest = async () => {
    setPageName(!pageName);
    try {
      let concduration =
        interviewTestMasterEdit.durationhours +
        ":" +
        interviewTestMasterEdit.durationminutes;
      let res = await axios.put(
        `${SERVICE.EXITINTERVIEWTESTMASTER_SINGLE}/${subprojectsid}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          category: interviewTestMasterEdit.category,
          durationhours:
            interviewTestMasterEdit.durationhours +
            ":" +
            interviewTestMasterEdit.durationminutes,
          subcategory: interviewTestMasterEdit.subcategory,
          testname: interviewTestMasterEdit.testname,
          totalmarks: interviewTestMasterEdit.totalmarks,
          eligiblemarks: interviewTestMasterEdit.eligiblemarks,
          updatedby: [
            ...updateby,
            {
              name: String(isUserRoleAccess.companyname),
              date: String(new Date()),
            },
          ],
        }
      );
      // if (
      //   interviewTestMasterEdit.category !== oldDatas?.category ||
      //   interviewTestMasterEdit.subcategory !== oldDatas?.subcategory ||
      //   interviewTestMasterEdit.testname !== oldDatas?.testname ||
      //   concduration !== oldDatas?.duration
      // ) {
      //   let res = await axios.put(
      //     `${SERVICE.INTERVIEWTESTMASTER_OVERALLEDIT}`,
      //     {
      //       headers: {
      //         Authorization: `Bearer ${auth.APIToken}`,
      //       },
      //       newcategory: String(interviewTestMasterEdit.category),
      //       oldcategory: String(oldDatas?.category),
      //       newsubcategory: String(interviewTestMasterEdit.subcategory),
      //       oldsubcategory: String(oldDatas?.subcategory),
      //       newtestname: String(interviewTestMasterEdit.testname),
      //       oldtestname: String(oldDatas?.testname),
      //       newduration: String(concduration),
      //       oldduration: String(oldDatas?.duration),
      //     }
      //   );
      // }
      await fetchInterviewOrders();
      handleCloseModEdit();
      handleCloseOverallEditPopup();
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

  //image
  const handleCaptureImage = () => {
    if (gridRef.current) {
      html2canvas(gridRef.current).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, "Exit Interview  Test Master.png");
        });
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
    if (selectedRows?.length === 0) {
      setIsDeleteOpenalert(true);
    } else {
      setIsDeleteOpencheckbox(true);
      // overallBulkdelete(selectedRows);
    }
  };
  const handleCloseModalert = () => {
    setIsDeleteOpenalert(false);
  };

  //Delete model
  const [isDeleteOpencheckbox, setIsDeleteOpencheckbox] = useState(false);

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
  // Manage Columns
  const [isManageColumnsOpenAN, setManageColumnsOpenAN] = useState(false);
  const [anchorElAN, setAnchorElAN] = useState(null);

  const handleOpenManageColumnsAN = (event) => {
    setAnchorElAN(event.currentTarget);
    setManageColumnsOpenAN(true);
  };
  const handleCloseManageColumnsAN = () => {
    setManageColumnsOpenAN(false);
    setSearchQueryManageAN("");
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
    category: true,
    durationhours: true,
    subcategory: true,
    testname: true,
    totalmarks: true,
    eligiblemarks: true,
    mode: true,
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

  const [deleteCheckpointicket, setDeleteCheckpointticket] = useState("");

  const rowData = async (id, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(
        `${SERVICE.EXITINTERVIEWTESTMASTER_SINGLE}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setDeleteCheckpointticket(res?.data?.sinterviewtestmaster);
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
  let Checkpointticketsid = deleteCheckpointicket?._id;
  let delTestName = deleteCheckpointicket?.testname;
  let delCategory = deleteCheckpointicket?.category;
  let delSubCategory = deleteCheckpointicket?.subcategory;
  let delDuration = deleteCheckpointicket?.durationhours;
  const delCheckpointticket = async () => {
    setPageName(!pageName);
    try {
      if (Checkpointticketsid) {
        let overallcheck = await axios.post(
          `${SERVICE.INTERVIEWTESTMASTER_OVERALLDELETE}`,
          {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            category: delCategory,
            subcategory: delSubCategory,
            testname: delTestName,
            duration: delDuration,
          }
        );
        if (overallcheck?.data?.mayidelete) {
          await axios.delete(
            `${SERVICE.EXITINTERVIEWTESTMASTER_SINGLE}/${Checkpointticketsid}`,
            {
              headers: {
                Authorization: `Bearer ${auth.APIToken}`,
              },
            }
          );
          await fetchInterviewOrders();
          handleCloseMod();
          setSelectedRows([]);
          setPage(1);
          setPopupContent("Deleted Successfully");
          setPopupSeverity("success");
          handleClickOpenPopup();
        }
      }
    } catch (err) {
      handleCloseMod();
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const overallBulkdelete = async (ids) => {
    setPageName(!pageName);
    try {
      let overallcheck = await axios.post(
        `${SERVICE.INTERVIEWTESTMASTER_OVERALLBULKDELETE}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          id: ids,
        }
      );

      setSelectedRows(overallcheck?.data?.result);
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

  const delCheckpointticketcheckbox = async () => {
    setPageName(!pageName);
    try {
      if (selectedRows?.length > 0) {
        const deletePromises = selectedRows?.map((item) => {
          return axios.delete(
            `${SERVICE.EXITINTERVIEWTESTMASTER_SINGLE}/${item}`,
            {
              headers: {
                Authorization: `Bearer ${auth.APIToken}`,
              },
            }
          );
        });

        // Wait for all delete requests to complete
        await Promise.all(deletePromises);

        await fetchInterviewOrders();
        setPopupContent("Deleted Successfully");
        setPopupSeverity("success");
        handleClickOpenPopup();
      }
      handleCloseModcheckbox();
      setSelectedRows([]);
      setSelectAllChecked(false);
      setPage(1);
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const [categorys, setCategorys] = useState([]);
  const [subcategorys, setSubcategorys] = useState([]);
  const [subcategorysEdit, setSubcategorysEdit] = useState([]);

  const fetchCategoryBasedEdit = async (e) => {
    setPageName(!pageName);
    try {
      let res_category = await axios.get(SERVICE.CATEGORYINTERVIEW, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      const result = res_category?.data?.interviewcategory.filter(
        (data, index) => {
          return e === data.categoryname && data.mode == "Exit Interview";
        }
      );

      setSubcategorysEdit(
        result[0]?.subcategoryname.map((data) => ({
          ...data,
          label: data,
          value: data,
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

  const fetchCategoryInterview = async () => {
    setPageName(!pageName);
    try {
      let res_category = await axios.get(SERVICE.CATEGORYINTERVIEW, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const result = res_category?.data?.interviewcategory.filter(
        (data, index) => {
          return data.mode == "Exit Interview";
        }
      );

      setCategorys(
        result.map((data) => ({
          ...data,
          label: data.categoryname,
          value: data.categoryname,
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

  const handleClear = (e) => {
    e.preventDefault();
    setInterviewTestMaster({
      ...interviewTestMaster,
      category: "Please Select Category",
      subcategory: "Please Select Subcategory",
      testname: "",
      totalmarks: "",
      eligiblemarks: "",
      durationhours: "00",
      durationminutes: "20",
    });
    setSubcategorys([]);
    setSelectedOptionsSubCate([]);
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
  const [oldDatas, setOldDatas] = useState({
    category: "",
    subcategory: "",
    testname: "",
    duration: "",
  });
  //get single row to edit....
  const getCode = async (e) => {
    setPageName(!pageName);
    try {
      const [res, res_vendor] = await Promise.all([
        axios.get(`${SERVICE.EXITINTERVIEWTESTMASTER_SINGLE}/${e}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }),
        axios.get(SERVICE.EXITINTERVIEWTESTMASTER, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }),
      ]);

      setInterviewGroupingValues(
        res_vendor?.data?.interviewtestmasters?.filter(
          (data) => data?._id !== e
        )
      );

      setOldDatas({
        category: res?.data?.sinterviewtestmaster?.category,
        subcategory: res?.data?.sinterviewtestmaster?.subcategory,
        testname: res?.data?.sinterviewtestmaster?.testname,
        duration: res?.data?.sinterviewtestmaster?.durationhours,
      });

      let reshours = res?.data?.sinterviewtestmaster?.durationhours?.split(":");
      setInterviewTestMasterEdit({
        ...res?.data?.sinterviewtestmaster,
        durationhours: reshours[0],
        durationminutes: reshours[1],
      });
      fetchCategoryBasedEdit(res?.data?.sinterviewtestmaster?.category);
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

  // get single row to view....
  const getviewCode = async (e) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(
        `${SERVICE.EXITINTERVIEWTESTMASTER_SINGLE}/${e}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setInterviewTestMasterEdit(res?.data?.sinterviewtestmaster);
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
        `${SERVICE.EXITINTERVIEWTESTMASTER_SINGLE}/${e}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setInterviewTestMasterEdit(res?.data?.sinterviewtestmaster);
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
  let updateby = interviewTestMasterEdit?.updatedby;
  let addedby = interviewTestMasterEdit?.addedby;

  let subprojectsid = interviewTestMasterEdit?._id;

  const [checkDuplicates, setCheckDuplicates] = useState([]);

  const fetchInterviewOrders = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.get(SERVICE.EXITINTERVIEWTESTMASTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setReasonmastercheck(true);
      setInterviewgroupingall(res_vendor?.data?.interviewtestmasters);
    } catch (err) {
      setReasonmastercheck(true);
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  const fetchInterviewOrdersAll = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.get(SERVICE.EXITINTERVIEWTESTMASTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setCheckDuplicates(res_vendor?.data?.interviewtestmasters);
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  // Excel
  const fileName = "Exit Interview  Test Master";

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Exit Interview  Test Master",
    pageStyle: "print",
  });

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, []);

  const [items, setItems] = useState([]);

  const addSerialNumber = () => {
    const itemsWithSerialNumber = interviewgroupingall?.map((item, index) => ({
      ...item,
      serialNumber: index + 1,
      mode: "Exit Interview",
    }));
    setItems(itemsWithSerialNumber);
  };

  useEffect(() => {
    addSerialNumber();
  }, [interviewgroupingall]);

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
      pagename: String("Exit Interview Test Master"),
      commonid: String(isUserRoleAccess?._id),
      date: String(new Date()),

      addedby: [
        {
          name: String(isUserRoleAccess?.companyname),
          date: String(new Date()),
        },
      ],
    });
  };

  const columnDataTable = [
    {
      field: "checkbox",
      headerName: "Checkbox", // Default header name
      headerStyle: {
        fontWeight: "bold", // Apply the font-weight style to make the header text bold
        // Add any other CSS styles as needed
      },
      renderHeader: (params) => (
        <CheckboxHeader
          selectAllChecked={selectAllChecked}
          onSelectAll={() => {
            if (rowDataTable?.length === 0) {
              // Do not allow checking when there are no rows
              return;
            }
            if (selectAllChecked) {
              setSelectedRows([]);
            } else {
              const allRowIds = rowDataTable?.map((row) => row.id);
              setSelectedRows(allRowIds);
            }
            setSelectAllChecked(!selectAllChecked);
          }}
        />
      ),

      renderCell: (params) => (
        <Checkbox
          checked={selectedRows.includes(params.row.id)}
          onChange={() => {
            let updatedSelectedRows;
            if (selectedRows.includes(params.row.id)) {
              updatedSelectedRows = selectedRows.filter(
                (selectedId) => selectedId !== params.row.id
              );
            } else {
              updatedSelectedRows = [...selectedRows, params.row.id];
            }

            setSelectedRows(updatedSelectedRows);

            // Update the "Select All" checkbox based on whether all rows are selected
            setSelectAllChecked(
              updatedSelectedRows?.length === filteredData?.length
            );
          }}
        />
      ),
      sortable: false, // Optionally, you can make this column not sortable
      width: 80,

      hide: !columnVisibility.checkbox,
      headerClassName: "bold-header",
    },
    {
      field: "serialNumber",
      headerName: "SNo",
      flex: 0,
      width: 60,
      hide: !columnVisibility.serialNumber,
      headerClassName: "bold-header",
    },
    {
      field: "mode",
      headerName: "Mode",
      flex: 0,
      width: 160,
      hide: !columnVisibility.mode,
      headerClassName: "bold-header",
    },
    {
      field: "category",
      headerName: "Category",
      flex: 0,
      width: 110,
      hide: !columnVisibility.category,
      headerClassName: "bold-header",
    },
    {
      field: "subcategory",
      headerName: "Subcategory",
      flex: 0,
      width: 120,
      hide: !columnVisibility.subcategory,
      headerClassName: "bold-header",
    },
    {
      field: "testname",
      headerName: "Test Name",
      flex: 0,
      width: 220,
      hide: !columnVisibility.testname,
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
      renderCell: (params) => (
        <Grid>
          {isUserRoleCompare?.includes("eexitinterviewtestmaster") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {

                getCode(params.row.id, params.row.name);
              }}
            >
              <EditOutlinedIcon sx={buttonStyles.buttonedit} />
            </Button>
          )}
          {isUserRoleCompare?.includes("dexitinterviewtestmaster") && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.row.id, params.row.name);
              }}
            >
              <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />
            </Button>
          )}
          {isUserRoleCompare?.includes("vexitinterviewtestmaster") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {

                getviewCode(params.row.id);
              }}
            >
              <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />
            </Button>
          )}
          {isUserRoleCompare?.includes("iexitinterviewtestmaster") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {

                getinfoCode(params.row.id);
              }}
            >
              <InfoOutlinedIcon sx={buttonStyles.buttoninfo} />
            </Button>
          )}
        </Grid>
      ),
    },
  ];

  const rowDataTable = filteredData?.map((item, index) => {
    return {
      id: item._id,
      serialNumber: item.serialNumber,
      category: item?.category?.toString(),
      durationhours: item.durationhours,
      subcategory: item?.subcategory?.toString(),
      mode: "Exit Interview",
      testname: item?.testname,
      totalmarks: item?.totalmarks,
      eligiblemarks: item?.eligiblemarks,
    };
  });

  const rowsWithCheckboxes = rowDataTable?.map((row) => ({
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
          {filteredColumns?.map((column) => (
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
      <Headtitle title={"EXIT INTERVIEW TEST MASTER"} />
      {/* ****** Header Content ****** */}
      <PageHeading
        title="Exit Interview Test Master"
        modulename="Interview"
        submodulename="Exit Interview"
        mainpagename="Exit Interview Test Master"
        subpagename=""
        subsubpagename=""
      />
      {isUserRoleCompare?.includes("aexitinterviewtestmaster") && (
        <Box sx={userStyle.dialogbox}>
          <>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography sx={userStyle.importheadtext}>
                  Add Exit Interview Test Master
                </Typography>
                <NotificationContainer />
              </Grid>
            </Grid>
            <br />
            <Grid container spacing={2}>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>Mode</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="text"
                    value="Exit Interview"
                    readOnly
                  />
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Category<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <Selects
                    options={categorys}
                    value={{
                      label: interviewTestMaster.category,
                      value: interviewTestMaster.category,
                    }}
                    onChange={(e) => {
                      setInterviewTestMaster((prev) => ({
                        ...prev,
                        category: e.value,
                      }));

                      setSubcategorys(
                        e?.subcategoryname.map((data) => ({
                          ...data,
                          label: data,
                          value: data,
                        }))
                      );

                      setSelectedOptionsSubCate([]);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Sub Category<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <MultiSelect
                    options={subcategorys}
                    value={selectedOptionsSubCate}
                    onChange={handleSubCategoryChange}
                    valueRenderer={customValueRendererSubCate}
                    labelledBy="Please Select Subcategory"
                  />
                </FormControl>
              </Grid>

              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Test Name <b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    value={interviewTestMaster.testname}
                    onChange={(e) => {
                      setInterviewTestMaster({
                        ...interviewTestMaster,
                        testname: e.target.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={2.5} xs={12} sm={6}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlesubmit}
                  sx={buttonStyles.buttonsubmit}
                >
                  Submit
                </Button>
              </Grid>
              <Grid item md={2.5} xs={12} sm={6}>
                <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                  Clear
                </Button>
              </Grid>
            </Grid>
          </>
        </Box>
      )}
      <Box>
        {/* Edit DIALOG */}
        <Dialog
          open={isEditOpen}
          onClose={handleCloseModEdit}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth={true}
          maxWidth="md"
          sx={{
            overflow: "visible",
            "& .MuiPaper-root": {
              overflow: "visible",
            },
          }}
        >
          <Box sx={userStyle.dialogbox}>
            <Grid container spacing={2}>
              <Grid item md={12} xs={12} sm={12}>
                <Typography sx={userStyle.HeaderText}>
                  Edit Exit Interview Test Master
                </Typography>
              </Grid>
            </Grid>
            <br />
            <Grid container spacing={2}>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>Mode</Typography>
                  <OutlinedInput
                    id="component-outlined"
                    type="text"
                    value="Exit Interview"
                    readOnly
                  />
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Category<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <Selects
                    options={categorys}
                    value={{
                      label: interviewTestMasterEdit.category,
                      value: interviewTestMasterEdit.category,
                    }}
                    onChange={(e) => {
                      setInterviewTestMasterEdit((prev) => ({
                        ...prev,
                        category: e.value,
                        subcategory: "Please Select Subcategory",
                      }));
                      setSubcategorysEdit(
                        e?.subcategoryname.map((data) => ({
                          ...data,
                          label: data,
                          value: data,
                        }))
                      );
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Sub Category<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <Selects
                    options={subcategorysEdit}
                    value={{
                      label: interviewTestMasterEdit.subcategory,
                      value: interviewTestMasterEdit.subcategory,
                    }}
                    onChange={(e) => {
                      setInterviewTestMasterEdit((prev) => ({
                        ...prev,
                        subcategory: e.value,
                      }));
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item md={4} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Test Name <b style={{ color: "red" }}>*</b>
                  </Typography>
                  <OutlinedInput
                    value={interviewTestMasterEdit.testname}
                    onChange={(e) => {
                      setInterviewTestMasterEdit({
                        ...interviewTestMasterEdit,
                        testname: e.target.value,
                      });
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item md={12} xs={12} sm={12}></Grid>
              <Grid item md={6} xs={6} sm={6}>
                <Button
                  variant="contained"
                  type="submit"
                  onClick={editSubmit}
                  sx={buttonStyles.buttonsubmit}
                >
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
          </Box>
        </Dialog>
      </Box>
      <br />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes("lexitinterviewtestmaster") && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>
                {" "}
                List Exit Interview Test Master
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
                    {/* <MenuItem value={interviewgroupingall?.length}>
                      All
                    </MenuItem> */}
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
                    "excelexitinterviewtestmaster"
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
                    "csvexitinterviewtestmaster"
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
                        </Button>{" "}
                      </>
                    )}
                  {isUserRoleCompare?.includes(
                    "printexitinterviewtestmaster"
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
                    "pdfexitinterviewtestmaster"
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
                    "imageexitinterviewtestmaster"
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
                <Box>
                  <FormControl fullWidth size="small">
                    <Typography>Search</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </FormControl>
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
            {isUserRoleCompare?.includes("bdexitinterviewtestmaster") && (
              <Button
                variant="contained"
                sx={buttonStyles.buttonbulkdelete}
                onClick={handleClickOpenalert}
              >
                Bulk Delete
              </Button>
            )}
            <br />
            <br />
            {!reasonmasterCheck ? (
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
                <Box
                  style={{
                    width: "100%",
                    overflowY: "hidden", // Hide the y-axis scrollbar
                  }}
                >
                  <StyledDataGrid
                    onClipboardCopy={(copiedString) =>
                      setCopiedData(copiedString)
                    }
                    rows={rowsWithCheckboxes}
                    columns={columnDataTable.filter(
                      (column) => columnVisibility[column.field]
                    )}
                    onSelectionModelChange={handleSelectionChange}
                    selectionModel={selectedRows}
                    autoHeight={true}
                    ref={gridRef}
                    density="compact"
                    hideFooter
                    getRowClassName={getRowClassName}
                    disableRowSelectionOnClick
                  />
                </Box>
                <Box style={userStyle.dataTablestyle}>
                  <Box>
                    Showing{" "}
                    {filteredData?.length > 0 ? (page - 1) * pageSize + 1 : 0}{" "}
                    to {Math.min(page * pageSize, filteredDatas?.length)} of{" "}
                    {filteredDatas?.length} entries
                  </Box>
                  <Box>
                    <Button
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      sx={userStyle.paginationbtn}
                    >
                      <FirstPageIcon />
                    </Button>
                    <Button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      sx={userStyle.paginationbtn}
                    >
                      <NavigateBeforeIcon />
                    </Button>
                    {pageNumbers?.map((pageNumber) => (
                      <Button
                        key={pageNumber}
                        sx={userStyle.paginationbtn}
                        onClick={() => handlePageChange(pageNumber)}
                        className={page === pageNumber ? "active" : ""}
                        disabled={page === pageNumber}
                      >
                        {pageNumber}
                      </Button>
                    ))}
                    {lastVisiblePage < totalPages && <span>...</span>}
                    <Button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      sx={userStyle.paginationbtn}
                    >
                      <NavigateNextIcon />
                    </Button>
                    <Button
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      sx={userStyle.paginationbtn}
                    >
                      <LastPageIcon />
                    </Button>
                  </Box>
                </Box>
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

      {/* Delete Modal */}
      <Box>
        {/* this is info view details */}

        <Dialog
          open={openInfo}
          onClose={handleCloseinfo}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <Box sx={{ width: "550px", padding: "20px 50px" }}>
            <>
              <Typography sx={userStyle.HeaderText}>
                Exit Interview Test Master Info
              </Typography>
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
                <Button variant="contained" onClick={handleCloseinfo} sx={buttonStyles.btncancel}>
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
                <TableCell> Mode</TableCell>
                <TableCell>Ccategory</TableCell>
                <TableCell>Subcategory</TableCell>
                <TableCell>Test Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody align="left">
              {rowDataTable &&
                rowDataTable?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{"Exit Interview"}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.subcategory}</TableCell>
                    <TableCell>{row.testname}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* view model */}
      <Dialog
        open={openview}
        onClose={handleClickOpenview}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
      >
        <Box sx={{ width: "750px", padding: "20px 50px" }}>
          <>
            <Typography sx={userStyle.HeaderText}>
              {" "}
              View Exit Interview Test Master
            </Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Category</Typography>
                  <Typography>
                    {Array.isArray(interviewTestMasterEdit?.category)
                      ? interviewTestMasterEdit?.category.map((item, index) => (
                        <span key={index}>
                          {index + 1}.{item}{" "}
                        </span>
                      ))
                      : interviewTestMasterEdit?.category}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Subcategory</Typography>
                  <Typography>
                    {Array.isArray(interviewTestMasterEdit?.subcategory)
                      ? interviewTestMasterEdit?.subcategory.map(
                        (item, index) => (
                          <span key={index}>
                            {index + 1}.{item}{" "}
                          </span>
                        )
                      )
                      : interviewTestMasterEdit?.subcategory}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Test Name</Typography>
                  <Typography>{interviewTestMasterEdit?.testname}</Typography>
                </FormControl>
              </Grid>

              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Mode</Typography>
                  <Typography>Exit Interview</Typography>
                </FormControl>
              </Grid>
            </Grid>
            <br /> <br /> <br />
            <Grid container spacing={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCloseview}
                sx={buttonStyles.btncancel}
              >
                {" "}
                Back{" "}
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>

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
            {/* <Typography variant="h5" sx={{ color: "red", textAlign: "center" }}>
              {selectedRows?.length === 0 ? (
                <>
                  The Datas in the selected rows are already used in some pages,
                  you can't delete.
                </>
              ) : (
                <>
                  Are you sure? Only {selectedRows?.length} datas can be deleted
                  remaining are used in some pages.
                </>
              )}
            </Typography> */}
            <Typography>Are you sure?</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseModcheckbox}
              sx={buttonStyles.btncancel}
            >
              Cancel
            </Button>
            <Button
              autoFocus
              variant="contained"
              color="error"
              onClick={(e) => delCheckpointticketcheckbox(e)}
            >
              {" "}
              OK{" "}
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
            {/* <ErrorOutlineOutlinedIcon sx={{ fontSize: "80px", color: 'orange' }} /> */}
            <Typography variant="h6">{showAlert}</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="error" onClick={handleCloseerr} sx={buttonStyles.buttonsubmit}>
              ok
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* bulk edit popup */}
      <Dialog
        open={openOverAllEditPopup}
        onClose={handleCloseOverallEditPopup}
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
            If this Test Details used in Question Grouping Page that may also
            edits. Are you sure?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseOverallEditPopup}
            variant="outlined"
            sx={buttonStyles.btncancel}
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => sendEditRequest()}
            autoFocus
            variant="contained"
            color="error"
          >
            {" "}
            OK{" "}
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
        filteredDataTwo={rowDataTable ?? []}
        itemsTwo={items ?? []}
        filename={"Exit Interview Test Master"}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
      {/* INFO */}
      <InfoPopup
        openInfo={openInfo}
        handleCloseinfo={handleCloseinfo}
        heading="Exit Interview Test Master Info"
        addedby={addedby}
        updateby={updateby}
      />
      {/*SINGLE DELETE ALERT DIALOG ARE YOU SURE? */}
      <DeleteConfirmation
        open={isDeleteOpen}
        onClose={handleCloseMod}
        onConfirm={delCheckpointticket}
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

export default ExitTestMaster;
