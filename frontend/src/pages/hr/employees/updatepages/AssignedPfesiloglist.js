import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import ImageIcon from "@mui/icons-material/Image";
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
import domtoimage from 'dom-to-image';
import { saveAs } from "file-saver";
import "jspdf-autotable";
import moment from "moment-timezone";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import { Link, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import AggregatedSearchBar from "../../../../components/AggregatedSearchBar";
import AggridTable from "../../../../components/AggridTable";
import AlertDialog from "../../../../components/Alert";
import { handleApiError } from "../../../../components/Errorhandling";
import ExportData from "../../../../components/ExportData";
import Headtitle from "../../../../components/Headtitle";
import MessageAlert from "../../../../components/MessageAlert";
import PageHeading from "../../../../components/PageHeading";
import {
  AuthContext,
  UserRoleAccessContext,
} from "../../../../context/Appcontext";
import { userStyle } from "../../../../pageStyle";
import { SERVICE } from "../../../../services/Baseservice";

function AssignedPfesiloglist() {

  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);

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

  const [employees, setEmployees] = useState([]);
  const [employeesOverall, setEmployeesOverall] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { isUserRoleAccess, isUserRoleCompare, buttonStyles, pageName,
    setPageName, } = useContext(
      UserRoleAccessContext
    );
  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { auth } = useContext(AuthContext);


  const [openPopup, setOpenPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [popupSeverity, setPopupSeverity] = useState("");
  const handleClickOpenPopup = () => {
    setOpenPopup(true);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  const [pfesiform, setPfesiForm] = useState({
    esideduction: false,
    pfdeduction: false,
    uan: "UAN",
    pfmembername: "",
    insurancenumber: "",
    ipname: "",
    pfesifromdate: "",
    isenddate: false,
    pfesienddate: "",
  });

  const [editPfesiform, setEditPfesiForm] = useState({
    esideduction: false,
    pfdeduction: false,
    uan: "",
    pfmembername: "",
    insurancenumber: "",
    ipname: "",
    pfesifromdate: "",
    isenddate: false,
    pfesienddate: "",

    pffromdate: "",
    pfenddate: "",
    esifromdate: "",
    esienddate: "",
  });

  const [isBankdetail, setBankdetail] = useState(false);
  const gridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [copiedData, setCopiedData] = useState("");

  //image
  const gridRefTableImg = useRef(null);
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage.toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, "Assigned PF-ESI Detail.png");
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };;

  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
  };

  //Delete model
  const [isDeleteOpenalert, setIsDeleteOpenalert] = useState(false);

  const handleCloseModalert = () => {
    setIsDeleteOpenalert(false);
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


  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    company: true,
    branch: true,
    unit: true,
    team: true,
    empcode: true,
    esideduction: true,
    pfdeduction: true,
    uan: true,
    pfmembername: true,
    insurancenumber: true,
    ipname: true,
    pffromdate: true,
    esifromdate: true,
    esienddate: true,
    pfenddate: true,
    companyname: true,
    updatedtime: true,
    updatename: true,
    actions: true,
  };

  const [columnVisibility, setColumnVisibility] = useState(
    initialColumnVisibility
  );

  // info model
  const [openInfo, setOpeninfo] = useState(false);

  const handleCloseinfo = () => {
    setOpeninfo(false);
  };

  // Edit model
  const [isEditOpen, setIsEditOpen] = useState(false);
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === "backdropClick") return;
    setIsEditOpen(false);
    setEditPfesiForm({
      esideduction: false,
      pfdeduction: false,
      uan: "",
      pfmembername: "",
      insurancenumber: "",
      ipname: "",
      pfesifromdate: "",
      isenddate: false,
      pfesienddate: "",
    });
  };

  const userid = useParams().id;

  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // This is required for Chrome support
  };

  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, []);

  //get all employees list details
  const fetchEmployee = async () => {
    setPageName(!pageName);
    try {
      let res_employee = await axios.get(`${SERVICE.USER_SINGLE}/${userid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let values = res_employee?.data?.suser.assignpfesilog.map((item) => {
        const dateObject = new Date(item.date);

        // Extracting date
        const year = dateObject.getFullYear();
        const month = String(dateObject.getMonth() + 1).padStart(2, "0");
        const date = String(dateObject.getDate()).padStart(2, "0");

        const formattedDate = `${date}-${month}-${year}`;

        const options = { hour12: true };

        const formattedTime = dateObject.toLocaleTimeString("en-US", options);

        return {
          ...item,
          companyname: res_employee?.data?.suser.companyname,
          doj: res_employee?.data?.suser.doj,
          department: res_employee?.data?.suser.department,
          empcode: res_employee?.data?.suser.empcode,
          company: res_employee?.data?.suser.company,
          branch: res_employee?.data?.suser.branch,
          unit: res_employee?.data?.suser.unit,
          team: res_employee?.data?.suser.team,
          updatedTime: formattedDate + " / " + formattedTime,
          userUpdatedDate: formattedDate,
        };
      });
      setEmployees(values?.map((item, index) => ({
        ...item,
        serialNumber: index + 1,
        company: item.company,
        branch: item.branch,
        unit: item.unit,
        team: item.team,
        empcode: item.empcode,
        esideduction: item.esideduction === false ? "No" : "Yes",
        pfdeduction: item.pfdeduction === false ? "No" : "Yes",
        uan: item.uan,
        pfmembername: item.pfmembername,
        insurancenumber: item.insurancenumber,
        ipname: item.ipname,
        esifromdate: moment(item.esifromdate).format("DD-MM-YYYY"),
        pffromdate: moment(item.pffromdate).format("DD-MM-YYYY"),
        pfenddate:
          item.pfenddate === ""
            ? ""
            : moment(item.pfenddate).format("DD-MM-YYYY"),
        esienddate:
          item.esienddate === ""
            ? ""
            : moment(item.esienddate).format("DD-MM-YYYY"),
        companyname: item.companyname,
        updatedtime: item.updatedTime,
        updatename: item.updatename,
      })));
      setEmployeesOverall(values?.map((item, index) => ({
        ...item,
        serialNumber: index + 1,
        company: item.company,
        branch: item.branch,
        unit: item.unit,
        team: item.team,
        empcode: item.empcode,
        esideduction: item.esideduction === false ? "No" : "Yes",
        pfdeduction: item.pfdeduction === false ? "No" : "Yes",
        uan: item.uan,
        pfmembername: item.pfmembername,
        insurancenumber: item.insurancenumber,
        ipname: item.ipname,
        esifromdate: moment(item.esifromdate).format("DD-MM-YYYY"),
        pffromdate: moment(item.pffromdate).format("DD-MM-YYYY"),
        pfenddate:
          item.pfenddate === ""
            ? ""
            : moment(item.pfenddate).format("DD-MM-YYYY"),
        esienddate:
          item.esienddate === ""
            ? ""
            : moment(item.esienddate).format("DD-MM-YYYY"),
        companyname: item.companyname,
        updatedtime: item.updatedTime,
        updatename: item.updatename,
      })));
      setBankdetail(true);
    } catch (err) {
      setBankdetail(true);
      handleApiError(
        err,
        setPopupContentMalert,
        setPopupSeverityMalert,
        handleClickOpenPopupMalert
      );
    }
  };

  //Boardingupadate updateby edit page...
  let updateby = pfesiform?.updatedby;
  let addedby = pfesiform?.addedby;

  //edit post call
  let boredit = pfesiform?._id;
  const sendRequestt = async () => {
    setPageName(!pageName);
    try {
      let res = await axios.put(`${SERVICE.USER_SINGLE_PWD}/${boredit}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        pfesistatus: Boolean(true),
        esideduction: Boolean(editPfesiform.esideduction),
        pfdeduction: Boolean(editPfesiform.pfdeduction),
        uan: String(editPfesiform.uan),
        pfmembername: String(editPfesiform.pfmembername),
        insurancenumber: String(editPfesiform.insurancenumber),
        ipname: String(editPfesiform.ipname),

        pffromdate: String(editPfesiform.pffromdate),
        pfenddate:
          editPfesiform.pfenddate == undefined
            ? ""
            : String(editPfesiform.pfenddate),
        esifromdate: String(editPfesiform.esifromdate),
        esienddate:
          editPfesiform.esienddate == undefined
            ? ""
            : String(editPfesiform.esienddate),

        updatedby: [
          ...updateby,
          {
            name: String(isUserRoleAccess.companyname),
            date: String(new Date()),
          },
        ],
      });
      await fetchEmployee();
      setEditPfesiForm({
        esideduction: false,
        pfdeduction: false,
        uan: "",
        pfmembername: "",
        insurancenumber: "",
        ipname: "",
        pfesifromdate: "",
        isenddate: false,
        pfesienddate: "",
      });
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
    if (
      editPfesiform.pffromdate === "" ||
      editPfesiform.pffromdate === undefined
    ) {

      setPopupContentMalert("Please Fill PF Start Date!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      editPfesiform.esifromdate === "" ||
      editPfesiform.esifromdate === undefined
    ) {

      setPopupContentMalert("Please Fill ESI Start Date!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else {
      sendRequestt();
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

  let exportColumnNames = [
    'Company', 'Branch',
    'Unit', 'Team',
    'Emp Code', 'Esi Deduction',
    'Pf Deduction', 'Uan',
    'Pf Member Name', 'Insurance Number',
    'Ip Name', 'Esi From Date',
    'Pf From Date', 'Esi End Date',
    'Pf End Date', 'Name',
    'Update Date/Time', 'Update By'
  ];
  let exportRowValues = [
    'company', 'branch',
    'unit', 'team',
    'empcode', 'esideduction',
    'pfdeduction', 'uan',
    'pfmembername', 'insurancenumber',
    'ipname', 'esifromdate',
    'pffromdate', 'esienddate',
    'pfenddate', 'companyname',
    'updatedtime', 'updatename'
  ];


  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Assigned PF-ESI Detail Log List",
    pageStyle: "print",
  });

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
      pagename: String("Assigned PF-ESI Log List"),
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
  }, [pfesiform]);

  const [searchedString, setSearchedString] = useState("");
  const [isHandleChange, setIsHandleChange] = useState(false);
  const gridRefTable = useRef(null);

  //table entries ..,.
  const [items, setItems] = useState([]);

  const addSerialNumber = (data) => {
    setItems(data);
  };

  useEffect(() => {
    addSerialNumber(employees);
  }, [employees]);


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

  const totalPages = Math.ceil(employees.length / pageSize);

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


  const columnDataTable = [
    {
      field: "serialNumber",
      headerName: "SNo",
      flex: 0,
      width: 75,
      hide: !columnVisibility.serialNumber,
      headerClassName: "bold-header",
    },
    {
      field: "company",
      headerName: "Company",
      flex: 0,
      width: 200,
      hide: !columnVisibility.company,
      headerClassName: "bold-header",
    },
    {
      field: "branch",
      headerName: "Branch",
      flex: 0,
      width: 200,
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
      field: "team",
      headerName: "Team",
      flex: 0,
      width: 150,
      hide: !columnVisibility.team,
      headerClassName: "bold-header",
    },
    {
      field: "empcode",
      headerName: "Emp Code",
      flex: 0,
      width: 200,
      hide: !columnVisibility.empcode,
      headerClassName: "bold-header",
    },
    {
      field: "esideduction",
      headerName: "Esi Deduction",
      flex: 0,
      width: 200,
      hide: !columnVisibility.esideduction,
      headerClassName: "bold-header",
    },
    {
      field: "pfdeduction",
      headerName: "Pf Deduction",
      flex: 0,
      width: 200,
      hide: !columnVisibility.pfdeduction,
      headerClassName: "bold-header",
    },
    {
      field: "uan",
      headerName: "Uan",
      flex: 0,
      width: 200,
      hide: !columnVisibility.uan,
      headerClassName: "bold-header",
    },
    {
      field: "pfmembername",
      headerName: "Pf Member Name",
      flex: 0,
      width: 200,
      hide: !columnVisibility.pfmembername,
      headerClassName: "bold-header",
    },
    {
      field: "insurancenumber",
      headerName: "Insurance Number",
      flex: 0,
      width: 200,
      hide: !columnVisibility.insurancenumber,
      headerClassName: "bold-header",
    },
    {
      field: "ipname",
      headerName: "Ip Name",
      flex: 0,
      width: 200,
      hide: !columnVisibility.ipname,
      headerClassName: "bold-header",
    },

    {
      field: "esifromdate",
      headerName: "Esi From Date",
      flex: 0,
      width: 200,
      hide: !columnVisibility.esifromdate,
      headerClassName: "bold-header",
    },
    {
      field: "pffromdate",
      headerName: "Pf From Date",
      flex: 0,
      width: 200,
      hide: !columnVisibility.pffromdate,
      headerClassName: "bold-header",
    },
    {
      field: "esienddate",
      headerName: "Esi End Date",
      flex: 0,
      width: 200,
      hide: !columnVisibility.esienddate,
      headerClassName: "bold-header",
    },
    {
      field: "pfenddate",
      headerName: "Pf End Date",
      flex: 0,
      width: 200,
      hide: !columnVisibility.pfenddate,
      headerClassName: "bold-header",
    },

    {
      field: "companyname",
      headerName: "Name",
      flex: 0,
      width: 200,
      hide: !columnVisibility.companyname,
      headerClassName: "bold-header",
    },
    {
      field: "updatedtime",
      headerName: "Update Date/Time",
      flex: 0,
      width: 200,
      hide: !columnVisibility.updatedtime,
      headerClassName: "bold-header",
    },
    {
      field: "updatename",
      headerName: "Update By",
      flex: 0,
      width: 200,
      hide: !columnVisibility.updatename,
      headerClassName: "bold-header",
    },
  ];

  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item._id,
      serialNumber: item.serialNumber,
      company: item.company,
      branch: item.branch,
      unit: item.unit,
      team: item.team,
      empcode: item.empcode,
      esideduction: item.esideduction,
      pfdeduction: item.pfdeduction,
      uan: item.uan,
      pfmembername: item.pfmembername,
      insurancenumber: item.insurancenumber,
      ipname: item.ipname,
      esifromdate: item.esifromdate,
      pffromdate: item.pffromdate,
      pfenddate: item.pfenddate,
      esienddate: item.esienddate,
      companyname: item.companyname,
      updatedtime: item.updatedTime,
      updatename: item.updatename,
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

  const handleInsuranceNumberChange = (e) => {
    const inputValue = e.target.value.replace(/[^a-zA-Z0-9]/g, "");

    const limitedValue = inputValue.slice(0, 9);

    setEditPfesiForm({ ...editPfesiform, insurancenumber: limitedValue });
  };

  return (
    <Box>
      <Headtitle title={"PF-ESI Detail Info"} />
      {/* ****** Header Content ****** */}
      <PageHeading
        title="Assigned PF-ESI Log List"
        modulename="Human Resources"
        submodulename="HR"
        mainpagename="Employee"
        subpagename="Employee Log Details"
        subsubpagename="Assigned PF-ESI"
      />
      <br />
      {isUserRoleCompare?.includes("lassignpf-esi") && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography sx={userStyle.importheadtext}>
                  Assigned PF-ESI Detail Log List
                </Typography>
              </Grid>
              <Grid item md={3} xs={3}></Grid>
              <Grid item md={1} xs={1}>
                <Link to={"/updatepages/assignedpfesi"}>
                  <Button sx={buttonStyles.btncancel}>Back</Button>
                </Link>
              </Grid>
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
                  {isUserRoleCompare?.includes("excelassignpf-esi") && (
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
                  {isUserRoleCompare?.includes("csvassignpf-esi") && (
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
                  {isUserRoleCompare?.includes("printassignpf-esi") && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("pdfassignpf-esi") && (
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
                  {isUserRoleCompare?.includes("imageassignpf-esi") && (
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
                  <AggregatedSearchBar
                    columnDataTable={columnDataTable}
                    setItems={setItems}
                    addSerialNumber={addSerialNumber}
                    setPage={setPage}
                    maindatas={employees}
                    setSearchedString={setSearchedString}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    paginated={false}
                    totalDatas={employeesOverall}

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
            <br />
            <br />
            {!isBankdetail ? (
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
                  searchQuery={searchedString}
                  handleShowAllColumns={handleShowAllColumns}
                  setFilteredRowData={setFilteredRowData}
                  filteredRowData={filteredRowData}
                  setFilteredChanges={setFilteredChanges}
                  filteredChanges={filteredChanges}
                  gridRefTableImg={gridRefTableImg}
                  itemsList={employeesOverall}

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

      {/* Delete Modal */}

      <Box>
        {/* Edit DIALOG */}
        <Dialog
          open={isEditOpen}
          onClose={handleCloseModEdit}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="lg"
        >
          <Box sx={userStyle.dialogbox}>
            <>
              <Typography sx={userStyle.SubHeaderText}>
                {" "}
                PF-ESI Detail Info
              </Typography>
              <br />
              <br />
              <Grid container spacing={2}>
                <Grid item md={6} sm={12} xs={12}>
                  <Typography>Employee code: {pfesiform.empcode}</Typography>
                </Grid>
                <Grid item md={6} sm={12} xs={12}>
                  <Typography>
                    Employee Name: {pfesiform.companyname}
                  </Typography>
                </Grid>
              </Grid>{" "}
              <br />
              <br />
              <Grid container spacing={2}>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Checkbox
                      sx={{ height: "20", padding: "0  25px" }}
                      onChange={(e) => {
                        setEditPfesiForm({
                          ...editPfesiform,
                          esideduction: e.target.checked,
                        });
                      }}
                      checked={editPfesiform.esideduction}
                    />
                    <Typography>ESI Deduction</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Checkbox
                      sx={{ height: "20", padding: "0  25px" }}
                      onChange={(e) => {
                        setEditPfesiForm({
                          ...editPfesiform,
                          pfdeduction: e.target.checked,
                        });
                      }}
                      checked={editPfesiform.pfdeduction}
                    />
                    <Typography>PF Deduction</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl
                    fullWidth
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-around",
                    }}
                  >
                    <Typography>UAN</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="UAN"
                      value={editPfesiform.uan}
                      onChange={(e) => {
                        setEditPfesiForm({
                          ...editPfesiform,
                          uan: e.target.value?.slice(0, 12),
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography>PFMember Name</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="PF Member Name"
                      value={editPfesiform.pfmembername}
                      onChange={(e) => {
                        setEditPfesiForm({
                          ...editPfesiform,
                          pfmembername: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography>Insurance No</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="Insurance No"
                      value={editPfesiform.insurancenumber}
                      onChange={handleInsuranceNumberChange}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={4} xs={12} sm={12}>
                  <FormControl
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography>IP Name</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="IPName"
                      value={editPfesiform.ipname}
                      onChange={(e) => {
                        setEditPfesiForm({
                          ...editPfesiform,
                          ipname: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <Typography>
                      PF Start Date<b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="date"
                      placeholder="PFMemeber Name"
                      value={editPfesiform.pffromdate}
                      onChange={(e) => {
                        setEditPfesiForm({
                          ...editPfesiform,
                          pffromdate: e.target.value,
                        });
                      }}
                      style={{ width: "224px" }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <Typography>PF End Date</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="date"
                      placeholder="PFMemeber Name"
                      value={editPfesiform.pfenddate}
                      onChange={(e) => {
                        setEditPfesiForm({
                          ...editPfesiform,
                          pfenddate: e.target.value,
                        });
                      }}
                      style={{ width: "224px" }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <Typography>
                      ESI Start Date <b style={{ color: "red" }}>*</b>
                    </Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="date"
                      placeholder="IP Name"
                      value={editPfesiform.esifromdate}
                      onChange={(e) => {
                        setEditPfesiForm({
                          ...editPfesiform,
                          esifromdate: e.target.value,
                        });
                      }}
                      style={{ width: "224px" }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={6} xs={12} sm={12}>
                  <FormControl
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <Typography>ESI End Date</Typography>
                    <OutlinedInput
                      id="component-outlined"
                      type="date"
                      placeholder="IP Name"
                      value={editPfesiform.esienddate}
                      onChange={(e) => {
                        setEditPfesiForm({
                          ...editPfesiform,
                          esienddate: e.target.value,
                        });
                      }}
                      style={{ width: "224px" }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <br /> <br /> <br />
              <Grid container>
                <Button variant="contained" onClick={editSubmit}>
                  Save
                </Button>
                <Grid item md={1}></Grid>
                <Button sx={userStyle.btncancel} onClick={handleCloseModEdit}>
                  Cancel
                </Button>
              </Grid>
            </>
          </Box>
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
            sx={{ width: "350px", textAlign: "center", alignItems: "center" }}
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


      <MessageAlert
        openPopup={openPopupMalert}
        handleClosePopup={handleClosePopupMalert}
        popupContent={popupContentMalert}
        popupSeverity={popupSeverityMalert}
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
        itemsTwo={items ?? []}
        filename={"Assigned PF-ESI Log List"}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
      {/* SUCCESS */}
      <AlertDialog
        openPopup={openPopup}
        handleClosePopup={handleClosePopup}
        popupContent={popupContent}
        popupSeverity={popupSeverity}
      />
    </Box>
  );
}

export default AssignedPfesiloglist;
