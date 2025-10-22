import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControl, Grid, IconButton, List, ListItem, ListItemText, MenuItem, Popover, Select, TextField, Typography } from "@mui/material";
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
import { useReactToPrint } from "react-to-print";
import AggregatedSearchBar from '../../components/AggregatedSearchBar';
import AggridTable from "../../components/AggridTable";
import AlertDialog from "../../components/Alert";
import MessageAlert from "../../components/MessageAlert";
import { handleApiError } from "../../components/Errorhandling";
import ExportData from "../../components/ExportData";
import Headtitle from "../../components/Headtitle";
import PageHeading from "../../components/PageHeading";
import { AuthContext, UserRoleAccessContext } from "../../context/Appcontext";
import { userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";
import Datainformation from "./dateinfo";
import domtoimage from 'dom-to-image';

function Maintanencelog() {

  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);
  const [isHandleChange, setIsHandleChange] = useState(false);

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
  const [selectedOptionsEdit, setSelectedOptionsEdit] = useState([]);
  const [selectedOptionsEditOverall, setSelectedOptionsEditOverall] = useState([]);
  const [CreationArray, setCreationArray] = useState([]);
  const [employeenames, setEmployeenames] = useState([]);
  const [employees, setEmployees] = useState([]);
  const { isUserRoleAccess, isUserRoleCompare, isAssignBranch, pageName, setPageName, buttonStyles, allTeam, allUsersData } = useContext(UserRoleAccessContext);
  const [selectone, setselectone] = useState("")
  const currentUrl = window.location.href;

  const accessbranch = isUserRoleAccess?.role?.includes("Manager")
    ? isAssignBranch?.map((data) => ({
      branch: data.branch,
      company: data.company,
      unit: data.unit,
      branchaddress: data?.branchaddress,
    }))
    : isAssignBranch
      ?.filter((data) => {
        let fetfinalurl = [];
        if (
          data?.modulenameurl?.length !== 0 &&
          data?.submodulenameurl?.length !== 0 &&
          data?.mainpagenameurl?.length !== 0 &&
          data?.subpagenameurl?.length !== 0 &&
          data?.subsubpagenameurl?.length !== 0 && data?.submodulenameurl?.includes(window.location.pathname)
        ) {
          fetfinalurl = data.subsubpagenameurl;
        } else if (
          data?.modulenameurl?.length !== 0 &&
          data?.submodulenameurl?.length !== 0 &&
          data?.mainpagenameurl?.length !== 0 &&
          data?.subpagenameurl?.length !== 0 && data?.submodulenameurl?.includes(window.location.pathname)
        ) {
          fetfinalurl = data.subpagenameurl;
        } else if (
          data?.modulenameurl?.length !== 0 &&
          data?.submodulenameurl?.length !== 0 &&
          data?.mainpagenameurl?.length !== 0 && data?.submodulenameurl?.includes(window.location.pathname)
        ) {
          fetfinalurl = data.mainpagenameurl;
        } else if (
          data?.modulenameurl?.length !== 0 &&
          data?.submodulenameurl?.length !== 0 && data?.submodulenameurl?.includes(window.location.pathname)
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
        branchaddress: data?.branchaddress
      }));

  useEffect(() => {
    CompanyDropDowns();
  }, []);


  //auto select all dropdowns
  const handleAutoSelect = async () => {
    setPageName(!pageName)
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

      setValueCompanyAdd(selectedCompany);
      setselectedcompanyOptionsEdit(mappedCompany);

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

      setValueBranchAdd(selectedBranch);
      setselectedbranchOptionsEdit(mappedBranch);

      let selectedUnit = selectedValues
        .filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.company === value.company &&
                t.branch === value.branch &&
                t.unit === value.unit
            )
        )
        .map((a, index) => {
          return a.unit;
        });

      let mappedUnit = selectedValues
        .filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.company === value.company &&
                t.branch === value.branch &&
                t.unit === value.unit
            )
        )
        ?.map((data) => ({
          label: data?.unit,
          value: data?.unit,
        }));

      setValueUnitAdd(selectedUnit);
      setselectedunitOptionsEdit(mappedUnit);

      let mappedTeam = allTeam
        ?.filter(
          (u) =>
            selectedCompany?.includes(u.company) &&
            selectedBranch?.includes(u.branch) &&
            selectedUnit?.includes(u.unit)
        )
        .map((u) => ({
          label: u.teamname,
          value: u.teamname,
        }));

      let selectedTeam = allTeam
        ?.filter(
          (u) =>
            selectedCompany?.includes(u.company) &&
            selectedBranch?.includes(u.branch) &&
            selectedUnit?.includes(u.unit)
        )
        .map((u) => u.teamname);

      let mappedemployees = allUsersData
        ?.filter(
          (u) =>
            selectedCompany?.includes(u.company) &&
            selectedBranch?.includes(u.branch) &&
            selectedUnit?.includes(u.unit) &&
            selectedTeam?.includes(u.team)
        ).map((u) => ({
          ...u,
          label: u.companyname,
          value: u.companyname,
        }));

      let employeess = allUsersData
        ?.filter(
          (u) =>
            selectedCompany?.includes(u.company) &&
            selectedBranch?.includes(u.branch) &&
            selectedUnit?.includes(u.unit) &&
            selectedTeam?.includes(u.team)
        )
        .map((u) => u.companyname);

      setTeamOptions(
        selectedTeam.map((t) => ({
          label: t,
          value: t,
        }))
      );
      setValueTeamAdd(selectedTeam);
      setselectedteamOptionsEdit(mappedTeam);
      // setAllAssignCompany(selectedCompany);

      // setAllAssignBranch(selectedBranch);

      // setAllAssignUnit(selectedUnit);
      setEmployeenames(
        employeess.map((t) => ({
          ...t,
          label: t,
          value: t,
        }))
      );
      setEmployeeEdit(employeess);
      setSelectedOptionsEdit(mappedemployees);
      setSelectedOptionsEditOverall(mappedemployees);

    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    handleAutoSelect();
  }, [isAssignBranch]);

  const effectRan = useRef(false);
  useEffect(() => {
    if (effectRan.current === false) {
      getapi();
      effectRan.current = true;
    }
    return () => {
      effectRan.current = true;
    };
  }, []);
  const getapi = async () => {
    setPageName(!pageName)
    try {
      let userchecks = axios.post(`${SERVICE.CREATE_USERCHECKS}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        empcode: String(isUserRoleAccess?.empcode),
        companyname: String(isUserRoleAccess?.companyname),
        pagename: String("Maintanence Log Details"),
        commonid: String(isUserRoleAccess?._id),
        date: String(new Date()),
        addedby: [
          {
            name: String(isUserRoleAccess?.username),
            date: String(new Date()),
          },
        ],
      });
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  }
  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchedString, setSearchedString] = useState("")

  const [searchQuery, setSearchQuery] = useState("");
  //Datatable Info
  const [pageInfo, setPageInfo] = useState(1);
  const [pageSizeInfo, setPageSizeInfo] = useState(10);
  const [searchQueryInfo, setSearchQueryInfo] = useState("");
  const { auth, setAuth } = useContext(AuthContext);
  const [isActive, setIsActive] = useState(false);
  const [isemployeedetail, setemployeedetail] = useState(false);
  let username = isUserRoleAccess.username;
  const gridRef = useRef(null);
  const gridRefTable = useRef(null);

  const gridRefinfo = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [copiedData, setCopiedData] = useState("");
  const gridRefTableImg = useRef(null);
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage.toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, "Maintanence_Log.png");
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };
  const [fileFormat, setFormat] = useState("");
  let exportColumnNames = ["Company", "Branch", "Unit", "Team", "Empcode", "Name"];
  let exportRowValues = ["company", "branch", "unit", "team", "empcode", "companyname"];
  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
  };
  //Delete model
  const [isDeleteOpenalert, setIsDeleteOpenalert] = useState(false);
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
  // info model
  const [openInfo, setOpeninfo] = useState(false);
  const handleOpeneinfo = () => {
    setOpeninfo(true);
  };
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
    setIsActive(false);
  };
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
    branch: true,
    unit: true,
    team: true,
    empcode: true,
    companyname: true,
    actions: true,
  };
  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);
  const [apicheck, setapicheck] = useState({})
  const [empdet, setempdet] = useState({
  })
  const getCode = async (e) => {
    setPageName(!pageName)
    try {
      let res = await axios.get(`${SERVICE.USERCHECKS_SINGLE}/${e}`);
      setapicheck(res?.data?.suser)
      setempdet(res?.data?.suser)
      handleClickOpenEdit();
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  const getInfoCode = async (e) => {
    setPageName(!pageName)
    try {
      let res = await axios.get(`${SERVICE.USERCHECKS_SINGLE}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      handleOpeneinfo();
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  // Error Popup model
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const handleClickOpenerr = () => {
    setIsErrorOpen(true);
    setemployeedetail(false)
  };
  const handleCloseerr = () => {
    setIsErrorOpen(false);
  };
  //Boardingupadate updateby edit page...
  let updateby = empdet.updatedby;
  let addedby = empdet.addedby;
  // Excel
  const fileName = "Maintanence_Log";
  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Maintanence_Log",
    pageStyle: "print",
  });
  //table entries ..,.
  const [items, setItems] = useState([]);


  const addSerialNumber = (datas) => {
    setItems(datas);
  };


  useEffect(() => {
    addSerialNumber(CreationArray);
  }, [CreationArray]);
  //Datatable

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
    return searchTerms.every((term) => Object.values(item).join(" ").toLowerCase().includes(term));
  });
  const filteredData = filteredDatas.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredDatas.length / pageSize);
  const visiblePages = Math.min(totalPages, 3);
  const firstVisiblePage = Math.max(1, page - 1);
  const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPages);
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
      field: "serialNumber",
      headerName: "SNo",
      flex: 0,
      width: 75,
      hide: !columnVisibility.serialNumber,
      headerClassName: "bold-header",
    },
    { field: "company", headerName: "Company", flex: 0, width: 140, hide: !columnVisibility.company, headerClassName: "bold-header" },
    { field: "branch", headerName: "Branch", flex: 0, width: 160, hide: !columnVisibility.branch, headerClassName: "bold-header" },
    { field: "unit", headerName: "Unit", flex: 0, width: 120, hide: !columnVisibility.unit, headerClassName: "bold-header" },
    { field: "team", headerName: "Team", flex: 0, width: 120, hide: !columnVisibility.team, headerClassName: "bold-header" },
    { field: "empcode", headerName: "Emp Code", flex: 0, width: 160, hide: !columnVisibility.empcode, headerClassName: "bold-header" },
    { field: "companyname", headerName: "Name", flex: 0, width: 250, hide: !columnVisibility.companyname, headerClassName: "bold-header" },
    {
      field: "actions",
      headerName: "Action",
      flex: 0,
      width: 180,
      minHeight: "40px !important",
      sortable: false,
      hide: !columnVisibility.actions,
      headerClassName: "bold-header",
      // Assign Bank Detail
      cellRenderer: (params) => (
        <Grid sx={{ display: "flex", gap: "10px" }}>
          {isUserRoleCompare?.includes("emaintanencelog") && (
            <Button
              variant="contained"
              onClick={() => {
                getCode(params.data.id);
                // handleClickOpenEdit();
                setselectone(params.data.id)
              }}
            >
              view
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
      company: item.company,
      branch: item.branch,
      unit: item.unit,
      team: item.team,
      empcode: item.empcode,
      companyname: item.companyname
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

  // // Function to filter columns based on search query
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
    <Box style={{ padding: "10px", minWidth: "325px", "& .MuiDialogContent-root": { padding: "10px 0" } }}>
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
  const [empDetailInfo, setempDetailInfo] = useState([]);
  //INFO table entries ..,.
  const [itemsInfo, setItemsInfo] = useState([]);
  const addSerialNumberInfo = () => {
    const itemsWithSerialNumber = empDetailInfo?.map((item, index) => {
      const newDate = new Date(item.date)
      // Extract year, month, and day
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to get the correct month since January is 0
      const day = String(newDate.getDate()).padStart(2, '0');
      const formattedDate = `${day}-${month}-${year}`;
      const updatestartdate = moment(item.startdate).format("YYYY-MM-DD")
      return {
        ...item, serialNumber: index + 1,
        date: item.updatename + " / " + formattedDate,
        startdate: updatestartdate
      }
    });
    setItemsInfo(itemsWithSerialNumber);
  };

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


  useEffect(() => {
    const beforeUnloadHandler = (event) => handleBeforeUnload(event);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, []);

  useEffect(() => {
    addSerialNumberInfo();
  }, [empDetailInfo]);
  //Datatable
  const handlePageChangeInfo = (newPage) => {
    setPageInfo(newPage);
  };
  const handlePageSizeChangeInfo = (event) => {
    setPageSizeInfo(Number(event.target.value));
    setPageInfo(1);
  };
  //datatable....
  const handleSearchChangeInfo = (event) => {
    setSearchQueryInfo(event.target.value);
  };
  // Split the search query into individual terms
  const searchTermsInfo = searchQueryInfo.toLowerCase().split(" ");
  // Modify the filtering logic to check each term
  const filteredDatasInfo = itemsInfo?.filter((item) => {
    return searchTermsInfo.every((term) => Object.values(item).join(" ").toLowerCase().includes(term));
  });
  const filteredDataInfo = filteredDatasInfo.slice((pageInfo - 1) * pageSizeInfo, pageInfo * pageSizeInfo);
  const totalPagesInfo = Math.ceil(empDetailInfo.length / pageSizeInfo);
  const visiblePagesInfo = Math.min(totalPagesInfo, 3);
  const firstVisiblePageInfo = Math.max(1, pageInfo - 1);
  const lastVisiblePageInfo = Math.min(firstVisiblePageInfo + visiblePagesInfo - 1, totalPagesInfo);
  const pageNumbersInfo = [];
  for (let i = firstVisiblePageInfo; i <= lastVisiblePageInfo; i++) {
    pageNumbersInfo.push(i);
  }
  const [CompanyOptions, setCompanyOptions] = useState([]);
  const [BranchOptions, setBranchOptions] = useState([]);
  const [allBranchValue, setAllBranchValue] = useState(false);
  const [UnitOptions, setUnitOptions] = useState([]);
  const [TeamOptions, setTeamOptions] = useState([]);
  const [employeEdit, setEmployeeEdit] = useState([]);
  const CompanyDropDowns = async () => {
    setPageName(!pageName)
    try {
      let res = await axios.get(SERVICE.COMPANY, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let uniqueCompanies = Array.from(new Set(res?.data?.companies.map((t) => t.name)));
      setCompanyOptions(
        uniqueCompanies.map((t) => ({
          label: t,
          value: t
        }))
      )
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  const BranchDropDowns = async (company) => {
    setPageName(!pageName)
    try {
      let res = await axios.get(SERVICE.BRANCH, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let arr = [];
      res?.data?.branch.map((t) => {
        company.forEach((d) => {
          if (d.value == t.company) {
            arr.push(t.name);
          }
        });
      });
      setBranchOptions(
        arr.map((t) => ({
          label: t,
          value: t,
        }))
      );
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  const UnitDropDowns = async (branch) => {
    setPageName(!pageName)
    try {
      let res_type = await axios.get(SERVICE.UNIT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let arr = [];
      res_type?.data?.units?.map((t) => {
        branch.forEach((d) => {
          if (d.value == t.branch) {
            arr.push(t.name);
          }
        });
      });
      setUnitOptions(arr.map((t) => ({
        label: t,
        value: t,
      })));
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  const fetchTeam = async (unit) => {
    setPageName(!pageName)
    try {
      let res_type = await axios.get(SERVICE.TEAMS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let arr = [];
      res_type?.data?.teamsdetails?.map((t) => {
        unit.forEach((d) => {
          if (d.value == t.unit) {
            arr.push(t.teamname);
          }
        });
      });
      setTeamOptions(
        arr.map((t) => ({
          label: t,
          value: t,
        }))
      );
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  const fetchAllEmployee = async (team) => {
    let teamsnew = team.map((item) => item.value);
    setPageName(!pageName)
    try {
      let res_employee = await axios.get(SERVICE.ALLUSER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let arr = res_employee?.data?.allusers.filter((t) => {
        return teamsnew.includes(t.team)
      });
      setEmployeenames(
        arr.map((t) => ({
          ...t,
          label: t.companyname,
          value: t.companyname,
        }))
      );
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  const customValueRendererEditCompanyFrom = (valueCate, _employeename) => {
    return valueCate.length
      ? valueCate.map(({ label }) => label).join(", ")
      : <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Employee</span>
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedNames = selectedOptionsEdit?.map((data) => data.companyname);
    if (selectedcompanyOptionsEdit.length <= 0) {
      setPopupContentMalert("Please Select Company");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (selectedbranchOptionsEdit.length <= 0) {
      setPopupContentMalert("Please Select Branch");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (selectedunitOptionsEdit.length <= 0) {
      setPopupContentMalert("Please Select Unit");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (selectedteamOptionsEdit.length <= 0) {
      setPopupContentMalert("Please Select Team");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert()
    }
    else if (selectedOptionsEdit.length <= 0) {
      setPopupContentMalert("Please Select Employee");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert()
    }
    else {
      sendRequest()
    }
  };
  const answer = async () => {
    let getdetail = selectedOptionsEdit.map((data) => {
      return {
        ...data,
        label: data.name,
        value: data.name,
      };
    });
    setEmployees(getdetail);
  };
  const [departmentCheck, setDepartmentCheck] = useState(false);
  const [CreationArrayOverall, setCreationArrayOverall] = useState([]);
  const sendRequest = async () => {
    setPageName(!pageName)
    try {
      await setCreationArray(selectedOptionsEdit?.map((item, index) => ({
        ...item,
        serialNumber: index + 1
      })))
      await setCreationArrayOverall(selectedOptionsEdit?.map((item, index) => ({
        ...item,
        serialNumber: index + 1
      })))
      setDepartmentCheck(false);
      setAllBranchValue(false);
    } catch (err) { handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert); }
  };
  const [selectedcompanyOptionsEdit, setselectedcompanyOptionsEdit] = useState([]);
  const [selectedbranchOptionsEdit, setselectedbranchOptionsEdit] = useState([]);
  const [selectedteamOptionsEdit, setselectedteamOptionsEdit] = useState([]);
  const [selectedunitOptionsEdit, setselectedunitOptionsEdit] = useState([]);
  let [valueUnitAdd, setValueUnitAdd] = useState("");
  const customValueRendererUnitAdd = (valueUnitAdd, _units) => {
    return valueUnitAdd.length ? valueUnitAdd.map(({ label }) => label).join(",") :
      <span style={{ color: "hsl(0, 0%, 20%" }}>Please Select Unit</span>
  }
  let [valueTeamAdd, setValueTeamAdd] = useState("");
  const customValueRendererTeamAdd = (valueTeamAdd, _teams) => {
    return valueTeamAdd.length ? valueTeamAdd.map(({ label }) => label).join(",") :
      <span style={{ color: "hsl(0, 0%, 20%" }}>Please Select Team</span>
  }
  let [valueBranchAdd, setValueBranchAdd] = useState("");
  const customValueRendererBranchAdd = (valueBranchAdd, _branches) => {
    return valueBranchAdd.length ? valueBranchAdd.map(({ label }) => label)?.join(",") :
      <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Branch</span>
  }
  let [valueCompanyAdd, setValueCompanyAdd] = useState("");
  const customValueRendererCompanyAdd = (valueCompanyAdd, _companies) => {
    return valueCompanyAdd.length ? valueCompanyAdd.map(({ label }) => label)?.join(",") :
      <span style={{ color: "hsl(0, 0%, 20%)" }}>Please Select Company</span>
  }
  const [valueCompanyAddchage, setValueCompanyAddchage] = useState([])
  const handleCompanyChangeAdd = (options) => {
    setValueCompanyAdd(
      options.map(a => {
        return a.value;
      })
    )
    setValueCompanyAddchage(
      options.map(a => {
        return a.value;
      })
    )
    BranchDropDowns(options)
    setselectedcompanyOptionsEdit(options);
    setselectedbranchOptionsEdit([])
    setselectedteamOptionsEdit([]);
    setselectedunitOptionsEdit([]);
    setSelectedOptionsEdit([]);
    setTeamOptions([]);
    setEmployeenames([]);
  }
  const [valueBranchAddChange, setValueBranchAddChange] = useState([])

  const handleBranchChangeAdd = (options) => {
    setValueBranchAdd(
      options.map((a) => {
        return a.value;
      })
    );
    setValueBranchAddChange(
      options.map((a) => {
        return a.value;
      })
    );
    UnitDropDowns(options)
    setselectedbranchOptionsEdit(options);
    setselectedteamOptionsEdit([]);
    setselectedunitOptionsEdit([]);
    setSelectedOptionsEdit([]);
    setTeamOptions([]);
    setEmployeenames([]);
  };

  const [valueUnitAddchange, setValueUnitAddchange] = useState([])
  const handleUnitChangeAdd = (options) => {
    setValueUnitAdd(
      options.map((a) => {
        return a.value;
      })
    );
    setValueUnitAddchange(
      options.map((a) => {
        return a.value;
      })
    );
    setselectedunitOptionsEdit(options);
    setselectedteamOptionsEdit([]);
    setSelectedOptionsEdit([]);
    fetchTeam(options);
    setEmployeenames([]);
  }
  const [valueTeamAddchange, setValueTeamAddchange] = useState([])
  const handleTeamChangeAdd = (options) => {
    setValueTeamAdd(
      options.map((a) => {
        return a.value;
      })
    );
    setValueTeamAddchange(
      options.map((a) => {
        return a.value;
      })
    );
    setselectedteamOptionsEdit(options);
    setSelectedOptionsEdit([]);
    fetchAllEmployee(options)
  }
  const handlecleared = (e) => {
    setselectedcompanyOptionsEdit([]);
    setselectedbranchOptionsEdit([])
    setselectedteamOptionsEdit([]);
    setselectedunitOptionsEdit([]);
    setSelectedOptionsEdit([]);
    setCreationArray([]);
    e.preventDefault();
    setDepartmentCheck(false);
    setAllBranchValue(false);
    setBranchOptions([]);
    setUnitOptions([]);
    setTeamOptions([]);
    setEmployeenames([]);
    setPopupContent("Cleared Successfully");
    setPopupSeverity("success");
    handleClickOpenPopup();
  };


  const handleCategoryEditChange = (options, valueCompanyAdds, valueBranchAdds, valueUnitAdds, valueTeamAdds) => {
    setEmployeeEdit(
      options.map((a, index) => {
        return a.value;
      })
    );

    let mappedemployees = allUsersData
      ?.filter(
        (u) =>
          valueCompanyAdds?.includes(u.company) &&
          valueBranchAdds?.includes(u.branch) &&
          valueUnitAdds?.includes(u.unit) &&
          valueTeamAdds?.includes(u.team) &&
          options.some((item) => item?.value === u?.companyname)
      ).map((u) => ({
        ...u,
        label: u.companyname,
        value: u.companyname,
      }));

    setSelectedOptionsEdit(mappedemployees);
  };



  return (
    <Box>
      <Headtitle title={"Maintanence Log Details"} />
      {/* ****** Header Content ****** */}
      <PageHeading
        title="Maintanence Log Details"
        modulename="Settings"
        submodulename="Maintanence Log"
        mainpagename=""
        subpagename=""
        subsubpagename=""
      />
      <Typography sx={userStyle.HeaderText}></Typography>
      <Box sx={userStyle.selectcontainer}>
        <>
          <Grid item xs={8}>
            <Typography sx={userStyle.SubHeaderText}>
              Filter Maintanence Log Details
            </Typography>
          </Grid>
          <br />
          <Grid container spacing={2}>
            <Grid item md={3} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  Company<b style={{ color: "red" }}>*</b>
                </Typography>
                <MultiSelect
                  maxMenuHeight={300}
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
                  value={selectedcompanyOptionsEdit}
                  valueRenderer={customValueRendererCompanyAdd}
                  onChange={handleCompanyChangeAdd}
                />
              </FormControl>
            </Grid>
            <Grid item md={3} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  Branch<b style={{ color: "red" }}>*</b>
                </Typography>
                <MultiSelect
                  maxMenuHeight={300}
                  options={accessbranch
                    ?.filter((comp) => selectedcompanyOptionsEdit?.some((item) => item?.value === comp.company))
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

                  // options={BranchOptions}
                  isDisabled={departmentCheck}
                  value={selectedbranchOptionsEdit}
                  valueRenderer={customValueRendererBranchAdd}
                  onChange={handleBranchChangeAdd}
                />
              </FormControl>
            </Grid>
            <Grid item md={3} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  Unit<b style={{ color: "red" }}>*</b>
                </Typography>
                <MultiSelect
                  maxMenuHeight={300}
                  options={accessbranch
                    ?.filter((comp) => selectedbranchOptionsEdit?.some((item) => item?.value === comp.branch))
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

                  // options={UnitOptions}
                  value={selectedunitOptionsEdit}
                  onChange={handleUnitChangeAdd}
                  valueRenderer={customValueRendererUnitAdd}
                />
              </FormControl>
            </Grid>
            <Grid item md={3} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  Team<b style={{ color: "red" }}>*</b>
                </Typography>
                <MultiSelect
                  maxMenuHeight={300}
                  options={TeamOptions}
                  value={selectedteamOptionsEdit}
                  valueRenderer={customValueRendererTeamAdd}
                  onChange={handleTeamChangeAdd}
                />
              </FormControl>
            </Grid>
            <Grid item md={3} xs={12} sm={12}>
              <FormControl fullWidth size="small">
                <Typography>
                  Employee<b style={{ color: "red" }}>*</b>
                </Typography>
                <MultiSelect

                  options={employeenames}
                  value={selectedOptionsEdit}
                  onChange={(e) => {
                    handleCategoryEditChange(e, valueCompanyAdd, valueBranchAdd, valueUnitAdd, valueTeamAdd)
                  }}
                  valueRenderer={customValueRendererEditCompanyFrom}
                />
              </FormControl>
            </Grid>
            <Grid
              item
              md={3}
              xs={12}
              sm={12}

            >
              <Typography >
                &nbsp;
              </Typography>
              <Button
                sx={buttonStyles.buttonsubmit} onClick={handleSubmit}
              >
                Filter
              </Button>
              &nbsp;
              &nbsp;
              <Button sx={buttonStyles.btncancel} onClick={handlecleared}>
                Clear
              </Button>
            </Grid>

          </Grid>
          <br />

        </>
      </Box>
      <br />
      {isUserRoleCompare?.includes("lmaintanencelog") && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Maintanence Log Details List</Typography>
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
                    <MenuItem value={CreationArray?.length}>All</MenuItem>
                  </Select>
                </Box>
              </Grid>
              <Grid item md={8} xs={12} sm={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Box>
                  {isUserRoleCompare?.includes("excelmaintanencelog") && (
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
                  {isUserRoleCompare?.includes("csvmaintanencelog") && (
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
                  {isUserRoleCompare?.includes("printmaintanencelog") && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("pdfmaintanencelog") && (
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
                  {isUserRoleCompare?.includes("imagemaintanencelog") && (
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
                  maindatas={CreationArray}
                  setSearchedString={setSearchedString}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  paginated={false}
                  totalDatas={CreationArrayOverall}

                />
              </Grid>

            </Grid>
            <Button sx={userStyle.buttongrp} onClick={handleShowAllColumns}>
              Show All Columns
            </Button>
            &ensp;
            <Button sx={userStyle.buttongrp} onClick={handleOpenManageColumns}>
              Manage Columns
            </Button>
            <br />
            <br />
            {isemployeedetail ? (
              <>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
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
                  itemsList={CreationArrayOverall}

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
      <Box>
        {/* Edit DIALOG */}
        <Dialog open={isEditOpen} onClose={handleCloseModEdit}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="lg"
          fullWidth={true}
          sx={{ marginTop: "80px" }}
        >
          <Box sx={userStyle.dialogbox}>
            <>
              <Typography sx={userStyle.HeaderText}>
                {" "}
                <b>Individual Maintanence Log List</b>
              </Typography>
              <br />
              <Grid item md={6} sm={12} xs={12}>
                {apicheck && apicheck.length > 0 ? (<Datainformation stockmaterialedit={selectone} />) : (
                  <Typography sx={{ ...userStyle.HeaderText, marginLeft: '28px' }}>
                    There is no visited pages
                  </Typography>
                )}
              </Grid>
              <br />
              <Grid item md={12} sm={12} xs={12}>
                <Grid
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "15px",
                  }}
                >
                  <Button sx={buttonStyles.btncancel} onClick={handleCloseModEdit}>
                    Back
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
        filteredDataTwo={(filteredChanges !== null ? filteredRowData : filteredData) ?? []}
        itemsTwo={selectedOptionsEdit ?? []}
        filename={"Maintanence log "}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />
    </Box>
  );
}
export default Maintanencelog;