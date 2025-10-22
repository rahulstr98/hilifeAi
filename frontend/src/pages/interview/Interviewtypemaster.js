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
import LoadingButton from "@mui/lab/LoadingButton";
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
  Typography
} from "@mui/material";
import Switch from "@mui/material/Switch";
import axios from "axios";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFilePdf, FaPrint } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import { MultiSelect } from "react-multi-select-component";
import { useReactToPrint } from "react-to-print";
import { handleApiError } from "../../components/Errorhandling";
import Headtitle from "../../components/Headtitle";
import PageHeading from "../../components/PageHeading";
import StyledDataGrid from "../../components/TableStyle";
import { AuthContext, UserRoleAccessContext } from "../../context/Appcontext";
import { userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";

import { FaFileCsv, FaFileExcel } from "react-icons/fa";

import AlertDialog from "../../components/Alert";
import {
  DeleteConfirmation,
  PleaseSelectRow,
} from "../../components/DeleteConfirmation.js";
import ExportData from "../../components/ExportData";
import InfoPopup from "../../components/InfoPopup.js";
import MessageAlert from "../../components/MessageAlert";

function Interviewtypemaster() {
  const [openPopupMalert, setOpenPopupMalert] = useState(false);
  const [popupContentMalert, setPopupContentMalert] = useState("");
  const [popupSeverityMalert, setPopupSeverityMalert] = useState("");
  const handleClickOpenPopupMalert = () => {
    setSubmitLoader(false);
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

  let exportColumnNames = ["Name", "Mode", "Category", "Subcategory"];
  let exportRowValues = ["nametype", "mode", "categorytype", "subcategorytype"];

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

  let modeOptions = [
    {
      label: "Questions",
      value: "Questions",
    },
    {
      label: "Typing Test",
      value: "Typing Test",
    },
  ];
  const [mode, setMode] = useState("Questions");
  const [modeEdit, setModeEdit] = useState("Questions");

  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };

  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };

  const [fileFormat, setFormat] = useState("");

  const [submitLoader, setSubmitLoader] = useState(false);
  const [interviewtypemaster, setInterviewtypemaster] = useState({
    categorytype: "",
    subcategorytype: "",
    nametype: "",
  });

  const [interviewtypemasterEdit, setInterviewtypemasterEdit] = useState({
    categorytype: "",
    subcategorytype: "",
    nametype: "",
  });
  const [interviewtypemasters, setInterviewtypemasters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    isUserRoleCompare,
    isUserRoleAccess,
    pageName,
    setPageName,
    buttonStyles,
  } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);
  const [interviewtypemasterCheck, setInterviewtypemastercheck] =
    useState(false);
  const gridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [copiedData, setCopiedData] = useState("");
  // multi select sub category

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

  // Create Functionality
  const [selectedOptionsCate, setSelectedOptionsCate] = useState([]);
  let [valueCate, setValueCate] = useState("");

  const handleCategoryChange = (options) => {
    setValueCate(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsCate(options);
  };

  const customValueRendererCate = (valueCate, _categorys) => {
    return valueCate.length
      ? valueCate.map(({ label }) => label).join(", ")
      : "Please Select Category";
  };

  // Edit functionlity
  const [selectedOptionsCateEdit, setSelectedOptionsCateEdit] = useState([]);

  const handleCategoryChangeEdit = (options) => {
    setSelectedOptionsCateEdit(options);
    fetchCategoryBasedEdit(
      options.map((item) => item.value),
      modeEdit
    );
  };

  const customValueRendererCateEdit = (valueCateEdit, _categorys) => {
    return valueCateEdit.length
      ? valueCateEdit.map(({ label }) => label).join(", ")
      : "Please Select Category";
  };

  // Edit functionlity
  const [selectedOptionsSubCateEdit, setSelectedOptionsSubCateEdit] = useState(
    []
  );

  const handleSubCategoryChangeEdit = (options) => {
    setSelectedOptionsSubCateEdit(options);
  };

  const customValueRendererSubCateEdit = (valueSubCateEdit, _subcategorys) => {
    return valueSubCateEdit.length
      ? valueSubCateEdit.map(({ label }) => label).join(", ")
      : "Please Select Subcategory";
  };

  //image
  const handleCaptureImage = () => {
    if (gridRef.current) {
      html2canvas(gridRef.current).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, "Interview Typemaster.png");
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
  const [isErrorOpenpop, setIsErrorOpenpop] = useState(false);
  const [showAlertpop, setShowAlertpop] = useState();

  const handleCloseerrpop = () => {
    setIsErrorOpenpop(false);
  };

  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setSubmitLoader(false);
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
    if (selectedRows.length === 0) {
      setIsDeleteOpenalert(true);
    } else {
      // setIsDeleteOpencheckbox(true);
      overallBulkdelete(selectedRows);
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
    categorytype: true,
    subcategorytype: true,
    nametype: true,
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

  const [deleteInterviewtype, setDeleteInterviewtype] = useState("");

  const rowData = async (id, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.INTERVIEWTYPEMASTER_SINGLE}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDeleteInterviewtype(res?.data?.sinterviewtypemaster);
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
  let Interviewtypesid = deleteInterviewtype?._id;
  let Interviewtypesname = deleteInterviewtype?.nametype;
  const delInterviewtype = async () => {
    setPageName(!pageName);
    try {
      if (Interviewtypesid) {
        let overallcheck = await axios.post(
          `${SERVICE.INTERVIEWTYPEMASTER_OVERALLDELETE}`,
          {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            type: Interviewtypesname,
          }
        );
        if (overallcheck?.data?.mayidelete) {
          await axios.delete(
            `${SERVICE.INTERVIEWTYPEMASTER_SINGLE}/${Interviewtypesid}`,
            {
              headers: {
                Authorization: `Bearer ${auth.APIToken}`,
              },
            }
          );
          await fetchInterviewtypemaster();
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
        `${SERVICE.INTERVIEWTYPEMASTER_OVERALLBULKDELETE}`,
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

  const delTypecheckbox = async () => {
    setPageName(!pageName);
    try {
      if (selectedRows?.length > 0) {
        const deletePromises = selectedRows?.map((item) => {
          return axios.delete(`${SERVICE.INTERVIEWTYPEMASTER_SINGLE}/${item}`, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
          });
        });

        // Wait for all delete requests to complete
        await Promise.all(deletePromises);

        await fetchInterviewtypemaster();
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

  const [categorysEdit, setCategorysEdit] = useState([]);
  const [subcategorysEdit, setSubcategorysEdit] = useState([]);

  const fetchCategoryInterview = async (mode, setoptions) => {
    setPageName(!pageName);
    try {
      let res_category = await axios.get(SERVICE.CATEGORYINTERVIEW, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const result = res_category?.data?.interviewcategory.filter(
        (data, index) => {
          return data.mode == mode;
        }
      );

      setoptions(
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

  const fetchCategoryBased = async (e) => {
    let employ = e.map((item) => item.value);

    setPageName(!pageName);
    try {
      let res_category = await axios.get(SERVICE.CATEGORYINTERVIEW, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let data_set = res_category.data.interviewcategory
        .filter((data) => {
          return employ.includes(data.categoryname) && data.mode == mode;
        })
        .map((value) => value.subcategoryname);

      let ans = [].concat(...data_set);

      let filter_opt = [...new Set(ans)];

      setSubcategorys(
        filter_opt.map((data) => ({
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

  const fetchCategoryBasedEdit = async (e, mode) => {
    setPageName(!pageName);
    try {
      let res_category = await axios.get(SERVICE.CATEGORYINTERVIEW, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let data_set = res_category.data.interviewcategory
        .filter((data) => {
          return e.includes(data.categoryname) && data.mode == mode;
        })
        .map((value) => value.subcategoryname);

      let ans = [].concat(...data_set);

      let filter_opt = [...new Set(ans)];

      setSubcategorysEdit(
        filter_opt.map((data) => ({
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

  //add function
  const sendRequest = async () => {
    setPageName(!pageName);
    try {
      await axios.post(SERVICE.INTERVIEWTYPEMASTER_CREATE, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        categorytype: [...valueCate],
        subcategorytype: [...valueSubCate],
        nametype: String(interviewtypemaster.nametype),
        mode: String(mode),
        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });
      await fetchInterviewtypemaster();
      setInterviewtypemaster({ ...interviewtypemaster, nametype: "" });
      setPopupContent("Added Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
      setSubmitLoader(false);
    } catch (err) {
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  //submit option for saving
  const handleSubmit = (e) => {
    setSubmitLoader(true);
    let categorys = selectedOptionsCate.map((item) => item.value);
    let subcategorys = selectedOptionsSubCate.map((item) => item.value);
    e.preventDefault();
    const isNameMatch = interviewtypemasters.some(
      (item) =>
        item.nametype.toLowerCase() ===
        interviewtypemaster.nametype.toLowerCase() &&
        item.mode === mode &&
        item.categorytype.some((data) => categorys.includes(data)) &&
        item.subcategorytype.some((data) => subcategorys.includes(data))
    );
    if (interviewtypemaster.nametype === "") {
      setPopupContentMalert("Please Enter Name!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (selectedOptionsCate.length === 0) {
      setPopupContentMalert("Please Select Category!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (selectedOptionsSubCate.length === 0) {
      setPopupContentMalert("Please Select  Subcategory!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert("Data already Exist!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      sendRequest();
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    setInterviewtypemaster({
      categorytype: "",
      subcategorytype: "",
      nametype: "",
    });
    setSubcategorys([]);
    setSelectedOptionsCate([]);
    setSelectedOptionsSubCate([]);
    setMode("Questions");
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

  //get single row to edit....
  const getCode = async (e, name) => {
    setPageName(!pageName);
    try {
      let res = await axios.get(`${SERVICE.INTERVIEWTYPEMASTER_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setOldType(res?.data?.sinterviewtypemaster?.nametype);
      setModeEdit(res?.data?.sinterviewtypemaster?.mode);
      setInterviewtypemasterEdit(res?.data?.sinterviewtypemaster);
      fetchCategoryBasedEdit(
        res?.data?.sinterviewtypemaster.categorytype,
        res?.data?.sinterviewtypemaster.mode
      );
      setSelectedOptionsCateEdit(
        res?.data?.sinterviewtypemaster.categorytype.map((item) => ({
          ...item,
          label: item,
          value: item,
        }))
      );
      setSelectedOptionsSubCateEdit(
        res?.data?.sinterviewtypemaster.subcategorytype.map((item) => ({
          ...item,
          label: item,
          value: item,
        }))
      );
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
      let res = await axios.get(`${SERVICE.INTERVIEWTYPEMASTER_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setInterviewtypemasterEdit(res?.data?.sinterviewtypemaster);
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
      let res = await axios.get(`${SERVICE.INTERVIEWTYPEMASTER_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setInterviewtypemasterEdit(res?.data?.sinterviewtypemaster);
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

  useEffect(() => {
    fetchCategoryInterview("Questions", setCategorys);
  }, []);

  //Project updateby edit page...
  let updateby = interviewtypemasterEdit?.updatedby;
  let addedby = interviewtypemasterEdit?.addedby;

  let subprojectsid = interviewtypemasterEdit?._id;

  //editing the single data...
  const [oldType, setOldType] = useState("");
  const sendEditRequest = async () => {
    let empCate = selectedOptionsCateEdit.map((item) => item.value);
    let empSubcate = selectedOptionsSubCateEdit.map((item) => item.value);
    setPageName(!pageName);
    try {
      await axios.put(
        `${SERVICE.INTERVIEWTYPEMASTER_SINGLE}/${subprojectsid}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          categorytype: [...empCate],
          subcategorytype: [...empSubcate],
          nametype: String(interviewtypemasterEdit.nametype),
          mode: String(modeEdit),
          updatedby: [
            ...updateby,
            {
              name: String(isUserRoleAccess.companyname),
              date: String(new Date()),
            },
          ],
        }
      );

      if (interviewtypemasterEdit.nametype !== oldType) {
        await axios.put(`${SERVICE.INTERVIEWTYPEMASTER_OVERALLEDIT}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          newtype: String(interviewtypemasterEdit.nametype),
          oldtype: String(oldType),
        });
      }
      await fetchInterviewtypemaster();
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
  //overall edit popup
  const [openOverAllEditPopup, setOpenOverAllEditPopup] = useState(false);
  const handleOpenOverallEditPopup = () => {
    setOpenOverAllEditPopup(true);
  };
  const handleCloseOverallEditPopup = () => {
    setOpenOverAllEditPopup(false);
  };
  const editSubmit = async (e) => {
    e.preventDefault();
    let resdata = await fetchInterviewtypemasterAll();
    let categorysEditt = selectedOptionsCateEdit.map((item) => item.value);
    let subcategorysEditt = selectedOptionsSubCateEdit.map(
      (item) => item.value
    );
    const isNameMatch = resdata.some(
      (item) =>
        item.nametype.toLowerCase() ===
        interviewtypemasterEdit.nametype.toLowerCase() &&
        item.mode === modeEdit &&
        item.categorytype.some((data) => categorysEditt.includes(data)) &&
        item.subcategorytype.some((data) => subcategorysEditt.includes(data))
    );
    if (interviewtypemasterEdit.nametype === "") {
      setPopupContentMalert("Please Enter Name!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (!modeEdit) {
      setPopupContentMalert("Please Select Mode!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (selectedOptionsCateEdit.length === 0) {
      setPopupContentMalert("Please Select Category!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (selectedOptionsSubCateEdit.length === 0) {
      setPopupContentMalert("Please Select  Subcategory!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (isNameMatch) {
      setPopupContentMalert("Data already Exist!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      if (interviewtypemasterEdit.nametype !== oldType) {
        handleOpenOverallEditPopup();
        handleCloseModEdit();
      } else {
        sendEditRequest();
      }
    }
  };

  //get all Sub vendormasters.
  const fetchInterviewtypemaster = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.get(SERVICE.INTERVIEWTYPEMASTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setInterviewtypemastercheck(true);
      setInterviewtypemasters(res_vendor?.data?.interviewtypemasters);
    } catch (err) {
      setInterviewtypemastercheck(true);
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  //get all Sub vendormasters.
  const fetchInterviewtypemasterAll = async () => {
    setPageName(!pageName);
    try {
      let res_vendor = await axios.get(SERVICE.INTERVIEWTYPEMASTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      return res_vendor?.data?.interviewtypemasters.filter(
        (item) => item._id !== interviewtypemasterEdit._id
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

  // Excel
  const fileName = "Interview Typemaster";

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Interview Typemaster",
    pageStyle: "print",
  });

  useEffect(() => {
    fetchInterviewtypemaster();
  }, []);
  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, []);

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
      pagename: String("Interview Type Master"),
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

  const [items, setItems] = useState([]);

  const addSerialNumber = () => {
    const itemsWithSerialNumber = interviewtypemasters?.map((item, index) => ({
      ...item,
      serialNumber: index + 1,
    }));
    setItems(itemsWithSerialNumber);
  };

  useEffect(() => {
    addSerialNumber();
  }, [interviewtypemasters]);

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
      renderHeader: (params) => (
        <CheckboxHeader
          selectAllChecked={selectAllChecked}
          onSelectAll={() => {
            if (rowDataTable.length === 0) {
              // Do not allow checking when there are no rows
              return;
            }
            if (selectAllChecked) {
              setSelectedRows([]);
            } else {
              const allRowIds = rowDataTable.map((row) => row.id);
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
              updatedSelectedRows.length === filteredData.length
            );
          }}
        />
      ),
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
    },
    {
      field: "nametype",
      headerName: "Name",
      flex: 0,
      width: 160,
      hide: !columnVisibility.nametype,
      headerClassName: "bold-header",
    },
    {
      field: "mode",
      headerName: "Mode",
      flex: 0,
      width: 120,
      hide: !columnVisibility.mode,
      headerClassName: "bold-header",
    },
    {
      field: "categorytype",
      headerName: "Category",
      flex: 0,
      width: 250,
      hide: !columnVisibility.categorytype,
      headerClassName: "bold-header",
    },
    {
      field: "subcategorytype",
      headerName: "Subcategory",
      flex: 0,
      width: 250,
      hide: !columnVisibility.subcategorytype,
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
        <Grid sx={{ display: "flex" }}>
          {isUserRoleCompare?.includes("einterviewtypemaster") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {

                getCode(params.row.id, params.row.name);
              }}
            >
              <EditOutlinedIcon sx={buttonStyles.buttonedit} />
            </Button>
          )}
          {isUserRoleCompare?.includes("dinterviewtypemaster") && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.row.id, params.row.name);
              }}
            >
              <DeleteOutlineOutlinedIcon sx={buttonStyles.buttondelete} />
            </Button>
          )}
          {isUserRoleCompare?.includes("vinterviewtypemaster") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {

                getviewCode(params.row.id);
              }}
            >
              <VisibilityOutlinedIcon sx={buttonStyles.buttonview} />
            </Button>
          )}
          {isUserRoleCompare?.includes("iinterviewtypemaster") && (
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

  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item._id,
      serialNumber: item.serialNumber,
      nametype: item.nametype,
      mode: item.mode,
      categorytype: item.categorytype.join(",").toString(),
      subcategorytype: item.subcategorytype.join(",").toString(),
    };
  });

  const rowsWithCheckboxes = rowDataTable.map((row) => ({
    ...row,
    // Create a custom field for rendering the checkbox
    checkbox: selectedRows.includes(row.id),
  }));

  // Show All Columns functionality
  const handleShowAllColumns = () => {
    setColumnVisibility(initialColumnVisibility);
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
      <Headtitle title={"Interview Type Master"} />
      {/* ****** Header Content ****** */}
      <PageHeading
        title="Interview Type Master"
        modulename="Interview"
        submodulename="Interview Setup"
        mainpagename="Interview Type Master"
        subpagename=""
        subsubpagename=""
      />
      {isUserRoleCompare?.includes("ainterviewtypemaster") && (
        <>
          <Box sx={userStyle.dialogbox}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>
                    Interview Type Master
                  </Typography>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Name <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={interviewtypemaster.nametype}
                      placeholder="Please Enter Name"
                      onChange={(e) => {
                        setInterviewtypemaster({
                          ...interviewtypemaster,
                          nametype: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>Mode</Typography>
                    {/* <Selects
                      options={modeOptions}
                      styles={colourStyles}
                      value={{
                        label: mode,
                        value: mode,
                      }}
                      onChange={(e) => {
                        setMode(e.value);
                        fetchCategoryInterview(e.value, setCategorys);
                        setValueCate([]);
                        setSelectedOptionsCate([]);
                        setSelectedOptionsSubCate([]);
                        setValueSubCate([]);
                      }}
                    /> */}
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      value={mode}
                      placeholder="Please Enter Name"
                      readOnly
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} sm={12} xs={12} sx={{ display: "flex" }}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Category <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <MultiSelect
                      options={categorys}
                      value={selectedOptionsCate}
                      onChange={(e) => {
                        handleCategoryChange(e);
                        fetchCategoryBased(e);
                        setSelectedOptionsSubCate([]);
                        setValueSubCate([]);
                      }}
                      valueRenderer={customValueRendererCate}
                      labelledBy="Please Select Category"
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} sm={12} xs={12} sx={{ display: "flex" }}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Sub Category <b style={{ color: "red" }}>*</b>
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
              </Grid>
              <br /> <br />
              <Grid container spacing={2}>
                <Grid item md={2.5} xs={12} sm={6}>
                  <LoadingButton
                    loading={submitLoader}
                    variant="contained"
                    sx={buttonStyles.buttonsubmit}
                    onClick={(e) => {
                      handleSubmit(e);
                    }}
                  >
                    Submit
                  </LoadingButton>
                </Grid>
                <Grid item md={2.5} xs={12} sm={6}>
                  <Button sx={buttonStyles.btncancel} onClick={handleClear}>
                    Clear
                  </Button>
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
          maxWidth="md"
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
                {/* <DialogContent sx={{ width: '550px', padding: '20px' }}> */}
                <Grid container spacing={2}>
                  <Grid item md={12} xs={12} sm={12}>
                    <Typography sx={userStyle.HeaderText}>
                      Edit Interview Type Master
                    </Typography>
                  </Grid>
                </Grid>
                <br />
                <Grid container spacing={2}>
                  <Grid item md={6} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>
                        Name <b style={{ color: "red" }}>*</b>
                      </Typography>
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        value={interviewtypemasterEdit.nametype}
                        placeholder="Please Enter Name"
                        onChange={(e) => {
                          setInterviewtypemasterEdit({
                            ...interviewtypemasterEdit,
                            nametype: e.target.value,
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={6} sm={12} xs={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Mode</Typography>
                      {/* <Selects
                        options={modeOptions}
                        styles={colourStyles}
                        value={{
                          label: modeEdit || "Please Select Mode",
                          value: modeEdit || "Please Select Mode",
                        }}
                        onChange={(e) => {
                          setModeEdit(e.value);
                          setSelectedOptionsCateEdit([]);
                          setSelectedOptionsSubCateEdit([]);
                          fetchCategoryInterview(e.value, setCategorysEdit);
                        }}
                      /> */}
                      <OutlinedInput
                        id="component-outlined"
                        type="text"
                        value={modeEdit}
                        placeholder="Please Enter Name"
                        readOnly
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={6} xs={12} sm={12}>
                    <FormControl fullWidth size="small">
                      <Typography>Category</Typography>
                      {/* <MultiSelect
                        className="custom-multi-select"
                        id="component-outlined"
                        options={categorys}
                        value={selectedOptionsCateEdit}
                        onChange={(e) => {
                          handleCategoryChangeEdit(e);
                          setSelectedOptionsSubCateEdit([]);
                        }}
                        valueRenderer={customValueRendererCateEdit}
                        labelledBy="Please Select Category"
                      /> */}

                      {selectedOptionsCateEdit.length !== 0
                        ? selectedOptionsCateEdit.map((data, index) => (
                          <Typography>
                            {index + 1}.{data.value}
                          </Typography>
                        ))
                        : ""}
                    </FormControl>
                  </Grid>
                  <Grid item md={6} sm={12} xs={12} sx={{ display: "flex" }}>
                    <FormControl fullWidth size="small">
                      <Typography>Sub Category</Typography>
                      {/* <MultiSelect
                        options={subcategorysEdit}
                        value={selectedOptionsSubCateEdit}
                        onChange={handleSubCategoryChangeEdit}
                        valueRenderer={customValueRendererSubCateEdit}
                        labelledBy="Please Select Subcategory"
                      /> */}
                      {selectedOptionsSubCateEdit.length !== 0
                        ? selectedOptionsSubCateEdit.map((data, index) => (
                          <Typography>
                            {index + 1}.{data.value}
                          </Typography>
                        ))
                        : ""}
                    </FormControl>
                  </Grid>
                </Grid>
                <br />
                <br />

                <Grid container spacing={2}>
                  <Grid item md={6} xs={6} sm={6}>
                    <Button
                      variant="contained"
                      type="submit"
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
                {/* </DialogContent> */}
              </form>
            </>
          </Box>
        </Dialog>
      </Box>
      <br />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes("linterviewtypemaster") && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>
                Interview Type Master List
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
                    {/* <MenuItem value={interviewtypemasters?.length}>
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
                  {isUserRoleCompare?.includes("excelinterviewtypemaster") && (
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
                  {isUserRoleCompare?.includes("csvinterviewtypemaster") && (
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
                  {isUserRoleCompare?.includes("printinterviewtypemaster") && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("pdfinterviewtypemaster") && (
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
                  {isUserRoleCompare?.includes("imageinterviewtypemaster") && (
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
            {isUserRoleCompare?.includes("bdinterviewtypemaster") && (
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
            {!interviewtypemasterCheck ? (
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
                    {filteredData.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
                    {Math.min(page * pageSize, filteredDatas.length)} of{" "}
                    {filteredDatas.length} entries
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
              View Interview Typemaster
            </Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Name</Typography>
                  <Typography>{interviewtypemasterEdit.nametype}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Mode</Typography>
                  <Typography>{interviewtypemasterEdit.mode}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6"> Category</Typography>
                  <Typography>
                    {interviewtypemasterEdit.categorytype + ","}
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Subcategory</Typography>
                  <Typography>
                    {interviewtypemasterEdit.subcategorytype + ","}
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
                sx={buttonStyles.btncancel}
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
              sx={buttonStyles.buttonsubmit}
              onClick={() => {
                sendEditRequest();
                handleCloseerrpop();
              }}
            >
              ok
            </Button>
            <Button sx={buttonStyles.btncancel} onClick={handleCloseerrpop}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

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
            <Typography variant="h5" sx={{ color: "red", textAlign: "center" }}>
              {" "}
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
            </Typography>
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
              onClick={(e) => delTypecheckbox(e)}
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
            If this Type used in any of the pages that may also edits. Are you
            sure?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOverallEditPopup} variant="outlined" sx={buttonStyles.btncancel}>
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
        filename={"InterviewTypeMaster"}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
      {/* INFO */}
      <InfoPopup
        openInfo={openInfo}
        handleCloseinfo={handleCloseinfo}
        heading="Interview Type Master Info"
        addedby={addedby}
        updateby={updateby}
      />
      {/*SINGLE DELETE ALERT DIALOG ARE YOU SURE? */}
      <DeleteConfirmation
        open={isDeleteOpen}
        onClose={handleCloseMod}
        onConfirm={delInterviewtype}
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

export default Interviewtypemaster;
