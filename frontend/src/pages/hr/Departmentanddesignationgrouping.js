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
  Popover,
  Select,
  TextField,
  Typography
} from "@mui/material";
import Switch from "@mui/material/Switch";
import axios from "axios";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "jspdf-autotable";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFilePdf, FaPrint } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import { MultiSelect } from "react-multi-select-component";
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import { handleApiError } from "../../components/Errorhandling";
import Headtitle from "../../components/Headtitle";
import StyledDataGrid from "../../components/TableStyle";
import { AuthContext, UserRoleAccessContext } from "../../context/Appcontext";
import { colourStyles, userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";

import * as FileSaver from "file-saver";
import { FaFileCsv, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import AlertDialog from "../../components/Alert";
import ExportData from "../../components/ExportData";
import InfoPopup from "../../components/InfoPopup.js";
import MessageAlert from "../../components/MessageAlert";
import PageHeading from "../../components/PageHeading";

function DepartmentandDesignationGrouping() {

  let exportColumnNames = ['Department ', 'Designation ', 'System Count '];
  let exportRowValues = ['department', 'designation', 'systemcount'];
  const gridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [copiedData, setCopiedData] = useState("");
  const [systemCount, setSystemCount] = useState("");
  const [systemCountEdit, setSystemCountEdit] = useState("");


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

  //state to handle holiday values
  const [deptgrouping, setDeptgrouping] = useState({
    department: "Please Select Department",
    designation: "Please Select Designation",
  });
  const [deptgroupingEdit, setDeptgroupingEdit] = useState({
    department: "Please Select Department",
    designation: "Please Select Designation",
  });

  // This is create multi select
  // Designation
  const [selectedOptionsDesig, setSelectedOptionsDesig] = useState([]);
  let [valueDesig, setValueDesig] = useState("");

  const handleDesignationChange = (options) => {
    setValueDesig(
      options.map((a, index) => {
        return a.value;
      })
    );
    setSelectedOptionsDesig(options);
  };

  const customValueRendererDesig = (valueDesig, _designations) => {
    return valueDesig.length
      ? valueDesig.map(({ label }) => label).join(", ")
      : "Please Select Designation";
  };

  const [designations, setDesignations] = useState([]);
  const [designationsEdit, setDesignationsEdit] = useState([]);
  const [departmentOpts, setDepartmentOpts] = useState([]);
  const [departmentOptsEdit, setDepartmentOptsEdit] = useState([]);

  const fetchDesignationDropdowns = async () => {
    setPageName(!pageName)
    try {
      let res_category = await axios.get(SERVICE.DESIGNATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const desigall = [
        ...res_category?.data?.designation.map((d) => ({
          ...d,
          label: d.name,
          value: d.name,
        })),
      ];

      setDesignations(desigall);
      setDesignationsEdit(desigall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

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
      pagename: String("Department&Designation Grouping"),
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

  const fetchDepartmentDropdowns = async () => {
    setPageName(!pageName)
    try {
      let res_category = await axios.get(SERVICE.DEPARTMENT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const deptall = [
        ...res_category?.data?.departmentdetails.map((d) => ({
          ...d,
          label: d.deptname,
          value: d.deptname,
        })),
      ];

      setDepartmentOpts(deptall);
      setDepartmentOptsEdit(deptall);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchDesignationDropdowns();
    fetchDepartmentDropdowns();
  }, []);

  const [
    departmentanddesignationgroupings,
    setDepartmentanddesignationgroupings,
  ] = useState([]);
  const { isUserRoleCompare, isUserRoleAccess, pageName,
    setPageName,
    buttonStyles } = useContext(
      UserRoleAccessContext
    );
  const { auth } = useContext(AuthContext);

  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const [openview, setOpenview] = useState(false);
  const [openInfo, setOpeninfo] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteHoliday, setDeleteHoliday] = useState({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [allDeptgroupingEdit, setAllDeptgroupingEdit] = useState([]);

  // Manage Columns
  const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    department: true,
    designation: true,
    systemcount: true,
    actions: true,
  };
  const [columnVisibility, setColumnVisibility] = useState(
    initialColumnVisibility
  );
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [isAddOpenalert, setIsAddOpenalert] = useState(false);
  const [isUpdateOpenalert, setIsUpdateOpenalert] = useState(false);

  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
  };
  // Error Popup model
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
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

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // This is required for Chrome support
  };
  const username = isUserRoleAccess.username;
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

  useEffect(() => {
    // Save column visibility to localStorage whenever it changes
    localStorage.setItem("columnVisibility", JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  useEffect(() => {
    // Retrieve column visibility from localStorage (if available)
    const savedVisibility = localStorage.getItem("columnVisibility");
    if (savedVisibility) {
      setColumnVisibility(JSON.parse(savedVisibility));
    }
  }, []);

  //set function to get particular row
  const rowData = async (id, name) => {
    setPageName(!pageName)
    try {
      let res = await axios.get(
        `${SERVICE.DEPARTMENTANDDESIGNATIONGROUPING_SINGLE}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setDeleteHoliday(res.data.sdepartmentanddesignationgrouping);
      handleClickOpen();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // Alert delete popup
  let holidayid = deleteHoliday._id;
  const delHoliday = async () => {
    setPageName(!pageName)
    try {
      await axios.delete(
        `${SERVICE.DEPARTMENTANDDESIGNATIONGROUPING_SINGLE}/${holidayid}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      await fetchDepartmentandesignation();
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

  //add function
  const sendRequest = async () => {
    setPageName(!pageName)
    try {
      await Promise.all(
        valueDesig.map(async (data, index) => {
          await axios.post(SERVICE.DEPARTMENTANDDESIGNATIONGROUPING_CREATE, {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
            designation: String(data),
            department: String(deptgrouping.department),
            systemcount: String(systemCount),
            addedby: [
              {
                name: String(isUserRoleAccess.companyname),
                date: String(new Date()),
              },
            ],
          });
        })
      );

      await fetchDepartmentandesignation();
      setPopupContent("Added Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //submit option for saving
  const handleSubmit = (e) => {
    let designations = selectedOptionsDesig.map((item) => item.value);
    e.preventDefault();
    const isNameMatch = departmentanddesignationgroupings.some(
      (item) =>
        item.department === deptgrouping.department &&
        designations.includes(item.designation)
      // && item.designation.some((data) => designations.includes(data))
    );

    if (deptgrouping.department === "Please Select Department") {
      setPopupContentMalert("Please Select Department");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();


    }
    // else if (selectedOptionsDesig.length == 0) {
    else if (valueDesig.length === 0) {
      setPopupContentMalert("Please Select Designation");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();


    } else if (systemCount === "") {
      setPopupContentMalert("Please Enter System Count");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();


    } else if (isNameMatch) {
      setPopupContentMalert("Data already exist!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();


    } else {
      sendRequest();
    }
  };
  const handleclear = (e) => {
    e.preventDefault();
    setDeptgrouping({
      department: "Please Select Department",
      designation: "Please Select Designation",
    });
    setSystemCount("");
    setValueDesig([]);
    setSelectedOptionsDesig([]);
    setPopupContent("Cleared Successfully");
    setPopupSeverity("success");
    handleClickOpenPopup();
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
      let res = await axios.get(
        `${SERVICE.DEPARTMENTANDDESIGNATIONGROUPING_SINGLE}/${e}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setDeptgroupingEdit(res?.data?.sdepartmentanddesignationgrouping);

      handleClickOpenEdit();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // get single row to view....
  const getviewCode = async (e) => {
    setPageName(!pageName)
    try {
      let res = await axios.get(
        `${SERVICE.DEPARTMENTANDDESIGNATIONGROUPING_SINGLE}/${e}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setDeptgroupingEdit(res?.data?.sdepartmentanddesignationgrouping);
      handleClickOpenview();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // get single row to view....
  const getinfoCode = async (e) => {
    setPageName(!pageName)
    try {
      let res = await axios.get(
        `${SERVICE.DEPARTMENTANDDESIGNATIONGROUPING_SINGLE}/${e}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setDeptgroupingEdit(res?.data?.sdepartmentanddesignationgrouping);
      handleClickOpeninfo();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  // updateby edit page...
  let updateby = deptgroupingEdit?.updatedby;
  let addedby = deptgroupingEdit?.addedby;
  let holidayId = deptgroupingEdit?._id;

  //editing the single data...
  const sendEditRequest = async () => {
    setPageName(!pageName)
    try {
      let res = await axios.put(
        `${SERVICE.DEPARTMENTANDDESIGNATIONGROUPING_SINGLE}/${holidayId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          department: String(deptgroupingEdit.department),
          designation: String(deptgroupingEdit.designation),
          systemcount: String(deptgroupingEdit?.systemcount),
          updatedby: [
            ...updateby,
            {
              name: String(isUserRoleAccess.companyname),
              date: String(new Date()),
            },
          ],
        }
      );

      setPopupContent("Updated Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
      await fetchDepartmentandesignation();
      await fetchDepartmentandesignationAll();
      handleCloseModEdit();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const editSubmit = (e) => {
    // let designationsEditt = selectedOptionsDesigEdit.map((item) => item.value);
    e.preventDefault();
    fetchDepartmentandesignationAll();
    const isNameMatch = allDeptgroupingEdit.some(
      (item) =>
        item.department == deptgroupingEdit.department &&
        item.designation == deptgroupingEdit.designation
      // && item.designation.some((data) => designationsEditt.includes(data))
    );

    if (deptgroupingEdit.status === "Please Select Department") {
      setPopupContentMalert("Please Select Department");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();


    } else if (deptgroupingEdit.department === "Please Select Designation") {
      setPopupContentMalert("Please Select  Designation");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();

    } else if (
      deptgroupingEdit?.systemcount === "" ||
      !deptgroupingEdit?.systemcount
    ) {
      setPopupContentMalert("Please Enter System Count");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();


    } else if (isNameMatch) {
      setPopupContentMalert("Data already exist!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();

    } else {
      sendEditRequest();
    }
  };

  const [isDesigngrp, setIsDesigngrp] = useState(false);

  //get all data.
  const fetchDepartmentandesignation = async () => {
    setPageName(!pageName)
    setIsDesigngrp(false)

    try {
      let res_status = await axios.get(
        SERVICE.DEPARTMENTANDDESIGNATIONGROUPING,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setDepartmentanddesignationgroupings(
        res_status?.data?.departmentanddesignationgroupings
      );
      setIsDesigngrp(true)

    } catch (err) {
      setIsDesigngrp(true)

      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  //get all data.
  const fetchDepartmentandesignationAll = async () => {
    setPageName(!pageName)
    try {
      let res_status = await axios.get(
        SERVICE.DEPARTMENTANDDESIGNATIONGROUPING,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );
      setAllDeptgroupingEdit(
        res_status?.data?.departmentanddesignationgroupings.filter(
          (item) => item._id !== deptgroupingEdit._id
        )
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  //image
  const handleCaptureImage = () => {
    if (gridRef.current) {
      html2canvas(gridRef.current).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, "Department and Designation Grouping.png");
        });
      });
    }
  };

  //------------------------------------------------------

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };

  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };

  const [fileFormat, setFormat] = useState("xl");

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Department and Designation Grouping",
    pageStyle: "print",
  });
  //serial no for listing items
  const addSerialNumber = () => {
    const itemsWithSerialNumber = departmentanddesignationgroupings?.map(
      (item, index) => ({ ...item, serialNumber: index + 1 })
    );
    setItems(itemsWithSerialNumber);
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
  const searchOverAllTerms = searchQuery.toLowerCase().split(" ");
  // Modify the filtering logic to check each term
  const filteredDatas = items?.filter((item) => {
    return searchOverAllTerms.every((term) =>
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
      width: 90,
      hide: !columnVisibility.serialNumber,
      headerClassName: "bold-header",
    },
    {
      field: "department",
      headerName: "Department",
      flex: 0,
      width: 250,
      hide: !columnVisibility.department,
      headerClassName: "bold-header",
    },
    {
      field: "designation",
      headerName: "Designation",
      flex: 0,
      width: 250,
      hide: !columnVisibility.designation,
      headerClassName: "bold-header",
    },
    {
      field: "systemcount",
      headerName: "System Count",
      flex: 0,
      width: 150,
      hide: !columnVisibility.systemcount,
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
          {isUserRoleCompare?.includes("edepartment&designationgrouping") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getCode(params.row.id);
              }}
            >
              <EditOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttonedit} />
            </Button>
          )}
          {isUserRoleCompare?.includes("ddepartment&designationgrouping") && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.row.id);
              }}
            >
              <DeleteOutlineOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttondelete} />
            </Button>
          )}
          {isUserRoleCompare?.includes("vdepartment&designationgrouping") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getviewCode(params.row.id);
              }}
            >
              <VisibilityOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttonview} />
            </Button>
          )}
          {isUserRoleCompare?.includes("idepartment&designationgrouping") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getinfoCode(params.row.id);
              }}
            >
              <InfoOutlinedIcon style={{ fontsize: "large" }} sx={buttonStyles.buttoninfo} />
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
      department: item.department,
      // designation: item.designation.join(",").toString(),
      designation: item.designation,
      systemcount: item.systemcount ?? "",
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
              {" "}
              Hide All
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Box>
  );

  useEffect(() => {
    fetchDepartmentandesignation();
  }, []);

  useEffect(() => {
    addSerialNumber();
  }, [departmentanddesignationgroupings]);

  useEffect(() => {
    fetchDepartmentandesignationAll();
  }, [isEditOpen]);

  const delClientinfocheckbox = async () => {
    setPageName(!pageName)
    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(
          `${SERVICE.DEPARTMENTANDDESIGNATIONGROUPING_SINGLE}/${item}`,
          {
            headers: {
              Authorization: `Bearer ${auth.APIToken}`,
            },
          }
        );
      });

      // Wait for all delete requests to complete
      await Promise.all(deletePromises);

      await fetchDepartmentandesignation();
      handleCloseModcheckbox();
      setSelectAllChecked(false);
      setPage(1);

      setPopupContent("Deleted Successfully");
      setPopupSeverity("success");
      handleClickOpenPopup();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const handleCloseAddalert = () => {
    setIsAddOpenalert(false);
  };

  const handleCloseUpdatealert = () => {
    setIsUpdateOpenalert(false);
  };

  return (
    <Box>
      <Headtitle title={"Department and Designation Grouping"} />
      {/* ****** Header Content ****** */}
      <PageHeading
        title="Department and Designation Grouping"
        modulename="Human Resources"
        submodulename="HR"
        mainpagename="HR Setup"
        subpagename="Department&Designation Grouping"
        subsubpagename=""
      />

      <>
        {isUserRoleCompare?.includes("adepartment&designationgrouping") && (
          <Box sx={userStyle.selectcontainer}>
            <>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography sx={userStyle.importheadtext}>
                    Add Department and Designation Grouping
                  </Typography>
                </Grid>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Department <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                      options={departmentOpts}
                      styles={colourStyles}
                      value={{
                        label: deptgrouping.department,
                        value: deptgrouping.department,
                      }}
                      onChange={(e) => {
                        setDeptgrouping({
                          ...deptgrouping,
                          department: e.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>

                <Grid item md={4} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Designation <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <MultiSelect
                      options={designations}
                      value={selectedOptionsDesig}
                      onChange={(e) => {
                        handleDesignationChange(e);
                      }}
                      valueRenderer={customValueRendererDesig}
                      labelledBy="Please Select Designation"
                    />
                  </FormControl>
                </Grid>
                <Grid item md={2} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      System Count <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      size="small"
                      placeholder="System Count"
                      value={systemCount}
                      onChange={(e) => {
                        setSystemCount(
                          e.target.value.replace(/[^0-9.;\s]/g, "")
                        );
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={2} sm={12} xs={12} mt={3}>
                  <Grid
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "15px",
                    }}
                  >
                    <Button variant="contained" onClick={handleSubmit} sx={buttonStyles.buttonsubmit}>
                      SAVE
                    </Button>
                    <Button onClick={handleclear} sx={buttonStyles.btncancel}>
                      CLEAR
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </>
          </Box>
        )}
        <br />
      </>

      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes("ldepartment&designationgrouping") && (
        <>
          <Box sx={userStyle.container}>
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>
                Department and Designation Grouping List
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
                    "exceldepartment&designationgrouping"
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
                    "csvdepartment&designationgrouping"
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
                    "printdepartment&designationgrouping"
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
                    "pdfdepartment&designationgrouping"
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
                    "imagedepartment&designationgrouping"
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
            <br />
            <br />
            {!isDesigngrp ?
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>

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
              :
              <>
                <Box style={{ width: "100%", overflowY: "hidden" }}>
                  <StyledDataGrid
                    onClipboardCopy={(copiedString) => setCopiedData(copiedString)}
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
                    {Math.min(page * pageSize, filteredDatas?.length)} of{" "}
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
              </>}
            {/* ****** Table End ****** */}
          </Box>
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
      {/*DELETE ALERT DIALOG */}
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
            onClick={() => {
              handleCloseModcheckbox();
              handleCloseMod();
            }}
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
            onClick={(e) => delHoliday(holidayid)}
          >
            {" "}
            OK{" "}
          </Button>
        </DialogActions>
      </Dialog>

      <Box>
        <Dialog
          open={isDeleteOpencheckbox}
          onClose={handleCloseModcheckbox}
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
            <Typography variant="h5" sx={{ color: "red", textAlign: "center" }}>
              Are you sure?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModcheckbox} sx={userStyle.btncancel}>
              Cancel
            </Button>
            <Button
              autoFocus
              variant="contained"
              color="error"
              onClick={(e) => delClientinfocheckbox(e)}
            >
              {" "}
              OK{" "}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Box>
        {/* ALERT DIALOG */}
        <Dialog
          open={isDeleteOpenalert}
          onClose={handleCloseModalert}
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
              sx={{ fontSize: "70px", color: "orange" }}
            />
            <Typography
              variant="h6"
              sx={{ color: "black", textAlign: "center" }}
            >
              Please Select any Row
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              variant="contained"
              color="error"
              onClick={handleCloseModalert}
            >
              {" "}
              OK{" "}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Box>
        {/* Update DIALOG */}
        <Dialog
          open={isUpdateOpenalert}
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
              sx={{ fontSize: "70px", color: "orange" }}
            />
            <Typography
              variant="h6"
              sx={{ color: "black", textAlign: "center" }}
            >
              Update Successfully
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              variant="contained"
              color="error"
              onClick={handleCloseUpdatealert}
            >
              {" "}
              OK{" "}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Box>
        {/* Add DIALOG */}
        <Dialog
          open={isAddOpenalert}
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
              sx={{ fontSize: "70px", color: "orange" }}
            />
            <Typography
              variant="h6"
              sx={{ color: "black", textAlign: "center" }}
            >
              Added Successfully
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              variant="contained"
              color="error"
              onClick={handleCloseAddalert}
            >
              {" "}
              OK{" "}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* 
      {/* this is info view details 
      <Dialog
        open={openInfo}
        onClose={handleCloseinfo}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
      >
        <Box sx={{ padding: "30px 50px" }}>
          <>
            <Typography sx={userStyle.HeaderText}>
              Department and Designation Grouping Info
            </Typography>
            <br />
            <br />
            <Grid container spacing={4}>
              <Grid item md={12} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">addedby</Typography>
                  <br />
                  <Table>
                    <TableHead>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}>
                        {"SNO"}.
                      </StyledTableCell>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}>
                        {" "}
                        {"UserName"}
                      </StyledTableCell>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}>
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
                            {moment(item.date).format("DD-MM-YYYY hh:mm:ss a")}
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
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}>
                        {"SNO"}.
                      </StyledTableCell>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}>
                        {" "}
                        {"UserName"}
                      </StyledTableCell>
                      <StyledTableCell sx={{ padding: "5px 10px !important" }}>
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
                            {moment(item.date).format("DD-MM-YYYY hh:mm:ss a")}
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
      </Dialog> */}

      {/* view model */}
      <Dialog
        open={openview}
        onClose={handleClickOpenview}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
      >
        <Box sx={{ padding: "30px 50px" }}>
          <>
            <Typography sx={userStyle.HeaderText}>
              {" "}
              View Department and Designation Grouping
            </Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Department</Typography>
                  <Typography>{deptgroupingEdit.department}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">Designation</Typography>
                  <Typography>{deptgroupingEdit.designation}</Typography>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography variant="h6">System Count</Typography>
                  <Typography>{deptgroupingEdit.systemcount ?? ""}</Typography>
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
                Back
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>
      {/* Edit DIALOG */}
      <Box>
        <Dialog
          open={isEditOpen}
          onClose={handleCloseModEdit}
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
          <Box sx={{ padding: "30px" }}>
            <>
              <Grid container spacing={2}>
                <Typography sx={userStyle.HeaderText}>
                  {" "}
                  Edit Department and Designation Grouping{" "}
                </Typography>
              </Grid>
              <br />
              <Grid container spacing={2}>
                <Grid item md={5} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Department <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                      options={departmentOptsEdit}
                      styles={colourStyles}
                      value={{
                        label: deptgroupingEdit.department,
                        value: deptgroupingEdit.department,
                      }}
                      onChange={(e) => {
                        setDeptgroupingEdit({
                          ...deptgroupingEdit,
                          department: e.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>

                <Grid item md={5} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      Designation <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <Selects
                      options={designationsEdit}
                      styles={colourStyles}
                      value={{
                        label: deptgroupingEdit.designation,
                        value: deptgroupingEdit.designation,
                      }}
                      onChange={(e) => {
                        setDeptgroupingEdit({
                          ...deptgroupingEdit,
                          designation: e.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={2} sm={12} xs={12}>
                  <FormControl fullWidth size="small">
                    <Typography>
                      System Count <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      size="small"
                      placeholder="System Count"
                      value={deptgroupingEdit?.systemcount ?? ""}
                      onChange={(e) => {
                        setDeptgroupingEdit({
                          ...deptgroupingEdit,
                          systemcount: e.target.value.replace(
                            /[^0-9.;\s]/g,
                            ""
                          ),
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
                {/* <br /> */}
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
      {/*Export XL Data  */}
      <ExportData
        isFilterOpen={isFilterOpen}
        handleCloseFilterMod={handleCloseFilterMod}
        fileFormat={fileFormat}
        setIsFilterOpen={setIsFilterOpen}
        isPdfFilterOpen={isPdfFilterOpen}
        setIsPdfFilterOpen={setIsPdfFilterOpen}
        handleClosePdfFilterMod={handleClosePdfFilterMod}
        filteredDataTwo={rowDataTable ?? []}
        itemsTwo={departmentanddesignationgroupings ?? []}
        filename={"Department & Designation Grouping"}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
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
      <InfoPopup
        openInfo={openInfo}
        handleCloseinfo={handleCloseinfo}
        heading="Department & Designation Grouping Info"
        addedby={addedby}
        updateby={updateby}
      />
    </Box>
  );
}
export default DepartmentandDesignationGrouping;