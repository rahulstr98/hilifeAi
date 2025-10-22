import React, { useState, useEffect, useRef, useContext } from "react";
// import App1 from "./canva"
import { MultiSelect } from "react-multi-select-component";
import { Backdrop } from "@mui/material";
import moment from "moment";
import placeholderImage from "../../../images/empty.png";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import {
  Box,
  Typography,
  OutlinedInput,
  TableBody,
  TableRow,
  TableCell,
  Select,
  Paper,
  MenuItem,
  Dialog,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
  Table,
  TableHead,
  TableContainer,
  Button,
  List,
  ListItem,
  ListItemText,
  Popover,
  Checkbox,
  TextField,
  IconButton,
} from "@mui/material";
import { userStyle } from "../../../pageStyle";
import { Link } from "react-router-dom";
import { FaPrint, FaFilePdf } from "react-icons/fa";
import { ExportXL, ExportCSV } from "../../../components/Export";
import { StyledTableRow, StyledTableCell } from "../../../components/Table";
import jsPDF from "jspdf";
import "jspdf-autotable";
import LoadingButton from "@mui/lab/LoadingButton";
import axios from "axios";
import Selects from "react-select";
import html2pdf from "html2pdf.js";
import ReactQuill from "react-quill";
import { htmlToText } from "html-to-text";
import { SERVICE } from "../../../services/Baseservice";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import { useReactToPrint } from "react-to-print";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { UserRoleAccessContext } from "../../../context/Appcontext";
import { AuthContext } from "../../../context/Appcontext";
import Headtitle from "../../../components/Headtitle";
import { ThreeDots } from "react-loader-spinner";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/system";
import Switch from "@mui/material/Switch";
import CloseIcon from "@mui/icons-material/Close";
import html2canvas from "html2canvas";
import ReactDOM from "react-dom";
import ImageIcon from "@mui/icons-material/Image";
import { saveAs } from "file-saver";
import { blue } from "@mui/material/colors";
import CircularProgress from "@mui/material/CircularProgress";
import { getCurrentServerTime } from '../../../components/getCurrentServerTime';


function Createidcard() {

  const [serverTime, setServerTime] = useState(new Date());
  useEffect(() => {
    const fetchTime = async () => {
      try {
        // Get current server time and format it
        const time = await getCurrentServerTime();
        setServerTime(time);
      } catch (error) {
        console.error('Failed to fetch server time:', error);
      }
    };

    fetchTime();
  }, []);


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
        rowDataTable?.map((item, index) => {
          return {

            serialNumber: item.serialNumber,
            company: item.company === "Please Select Company" ? "" : item.company,
            branch: item.branch === "Please Select Branch" ? "" : item.branch,
            unit: item.unit === "Please Select Unit" ? "" : item.unit,
            team: item.team === "Please Select Team" ? "" : item.team,
            person: item.person.toString(),
          };
        }),
        fileName
      );
    } else if (isfilter === "overall") {
      exportToCSV(
        templateCreationArray?.map((item, index) => ({

          serialNumber: index + 1,
          company: item.company === "Please Select Company" ? "" : item.company,
          branch: item.branch === "Please Select Branch" ? "" : item.branch,
          unit: item.unit === "Please Select Unit" ? "" : item.unit,
          team: item.team === "Please Select Team" ? "" : item.team,
          person: item.person.toString(),
        })),
        fileName
      );
    }

    setIsFilterOpen(false);
  };

  // pdf.....
  const columns = [
    // { title: "Sno", field: "serialNumber" },

    { title: "company", field: "company" },
    { title: "Branch", field: "Branch" },
    { title: "Unit", field: "Unit" },
    { title: "Team", field: "Team" },
    { title: "Person", field: "Person" },
  ];

  const downloadPdf = (isfilter) => {
    const doc = new jsPDF();
    const columnsWithSerial = [
      { title: "SNo", dataKey: "serialNumber" }, // Serial number column
      ...columns.map((col) => ({ ...col, dataKey: col.field })),
    ];

    // Modify row data to include serial number
    const dataWithSerial =
      isfilter === "filtered"
        ? rowDataTable.map((t, index) => {
          return {

            serialNumber: index + 1,
            company: t.company === "Please Select Company" ? "-" : t.company,
            Branch: t.branch === "Please Select Branch" ? "-" : t.branch,
            Unit: t.unit === "Please Select Unit" ? "-" : t.unit,
            Team: t.team === "Please Select Team" ? "-" : t.team,
            Person: t.person
          }

        })
        : templateCreationArray?.map((t, index) => ({


          serialNumber: index + 1,
          company: t.company === "Please Select Company" ? "-" : t.company,
          Branch: t.branch === "Please Select Branch" ? "-" : t.branch,
          Unit: t.unit === "Please Select Unit" ? "-" : t.unit,
          Team: t.team === "Please Select Team" ? "-" : t.team,
          Person: t.person
        }));

    // Generate PDF
    doc.autoTable({
      theme: "grid",
      columns: columnsWithSerial,
      body: dataWithSerial,
      styles: { fontSize: 5 },
    });

    doc.save("Createidcard.pdf");
  };









  const [isLoading, setisLoading] = useState(false);
  const LoadingBackdrop = ({ open }) => {
    return (
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <div className="pulsating-circle">
          <CircularProgress color="inherit" className="loading-spinner" />
        </div>
        <Typography
          variant="h6"
          sx={{ marginLeft: 2, color: "#fff", fontWeight: "bold" }}
        >
          Fetching Data, please wait...
        </Typography>
      </Backdrop>
    );
  };

  let today = new Date(serverTime);
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  let formattedDate = yyyy + "-" + mm + "-" + dd;
  //useStates
  const [date, setDate] = useState(formattedDate);
  const gridRef = useRef(null);
  let newval = "DP0001";

  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [templateCreation, setTemplateCreation] = useState({ name: "" });
  const [documentPreparationEdit, setDocumentPreparationEdit] = useState({
    name: "",
  });
  const [templateCreationArray, setTemplateCreationArray] = useState([]);
  const [templateCreationArrayEdit, setTemplateCreationArrayEdit] = useState(
    []
  );
  const { isUserRoleCompare, isUserRoleAccess } = useContext(
    UserRoleAccessContext
  );
  const { auth } = useContext(AuthContext);
  const [loader, setLoader] = useState(false);
  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [showAlert, setShowAlert] = useState();
  const [openview, setOpenview] = useState(false);
  const [openviewed, setOpenviewed] = useState(false);
  const [openInfo, setOpeninfo] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [excel, setExcel] = useState([]);
  const [deleteTemplate, setDeleteTemplate] = useState({});
  const [cateCode, setCatCode] = useState([]);
  const [cateCodeValue, setCatCodeValue] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newid, setnewid] = useState("");
  const [documentPrepartion, setDocumentPrepartion] = useState({
    company: "Please Select Company",
    branch: "Please Select Branch",
    unit: "Please Select Unit",
    team: "Please Select Team",
    person: "Please Select Person",
  });

  const [items, setItems] = useState([]);
  //  const [employees, setEmployees] = useState([]);
  const [departmentCheck, setDepartmentCheck] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allTemplateCreationEdit, setAllTemplateCreationEdit] = useState([]);
  const [copiedData, setCopiedData] = useState("");
  const [isManageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [agenda, setAgenda] = useState("");
  const [agendaEdit, setAgendaEdit] = useState("");

  // Show All Columns & Manage Columns
  const initialColumnVisibility = {
    serialNumber: true,
    checkbox: true,
    company: true,
    branch: true,
    unit: true,
    team: true,
    person: true,
    Idcard: true,
    actions: true,
  };
  const [columnVisibility, setColumnVisibility] = useState(
    initialColumnVisibility
  );
  const [selectedOptionsEdit, setSelectedOptionsEdit] = useState([]);

  //useEffect
  useEffect(() => {
    addSerialNumber();
  }, [templateCreationArray]);

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
    setviewdata(false);
    //  setisLoading(false)
    setIsErrorOpen(true);
  };
  // view model
  const handleClickOpenview = () => {
    setOpenview(true);
  };
  const handleClickOpenviewed = () => {
    setOpenviewed(true);
  };
  const handleCloseviewed = () => {
    setOpenviewed(false);

    setDocumentPreparationEdit({});
    setcode([]);

    setviewfrontfooter("");

    setviewfrontheader("");

    setviewbackheader("");

    setviewbackfooter("");

    setnewadd("");
    setnewcomp("");
    setnewcomurl("");
  };
  const handleCloseview = () => {
    setOpenview(false);
    setAgendaEdit("");
    setDocumentPreparationEdit({});
    setcode([]);

    setviewfrontfooter("");

    setviewfrontheader("");

    setviewbackheader("");

    setviewbackfooter("");

    setnewadd("");
    setnewcomp("");
    setnewcomurl("");
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
  // page refersh reload code
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = ""; // This is required for Chrome support
  };
  const username = isUserRoleAccess.username;
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
  const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    "& .MuiDataGrid-virtualScroller": {
      overflowY: "hidden",
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: " bold !important ",
    },
    "& .custom-id-row": {
      backgroundColor: "#1976d22b !important",
    },

    "& .MuiDataGrid-row.Mui-selected": {
      "& .custom-ago-row, & .custom-in-row, & .custom-others-row": {
        backgroundColor: "unset !important", // Clear the background color for selected rows
      },
    },
    "&:hover": {
      "& .custom-ago-row:hover": {
        backgroundColor: "#ff00004a !important",
      },
      "& .custom-in-row:hover": {
        backgroundColor: "#ffff0061 !important",
      },
      "& .custom-others-row:hover": {
        backgroundColor: "#0080005e !important",
      },
    },
  }));

  const [templateValues, setTemplateValues] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeValue, setEmployeeValue] = useState([]);
  const [CompanyOptions, setCompanyOptions] = useState([]);
  const [BranchOptions, setBranchOptions] = useState([]);
  const [BranchOptionsEdit, setBranchOptionsEdit] = useState([]);
  const [allBranch, setAllBranch] = useState("");
  const [allBranchValue, setAllBranchValue] = useState(false);
  const [UnitOptions, setUnitOptions] = useState([]);
  const [TeamOptions, setTeamOptions] = useState([]);
  const [employeenames, setEmployeenames] = useState([]);

  const [UnitOptionsEdit, setUnitOptionsEdit] = useState([]);
  const [allBranchEdit, setAllBranchEdit] = useState("");
  const [TeamOptionsEdit, setTeamOptionsEdit] = useState([]);
  const [employeenamesEdit, setEmployeenamesEdit] = useState([]);
  const [allBranchValueEdit, setAllBranchValueEdit] = useState(false);
  const [departmentCheckEdit, setDepartmentCheckEdit] = useState(false);
  const [employeeMode, setEmployeeMode] = useState("");
  const [employeeValueEdit, setEmployeeValueEdit] = useState([]);

  const [employeEdit, setEmployeeEdit] = useState([]);
  const [participantsOption, setParticipantsOption] = useState([]);

  //function to fetch participants
  const fetchParticipants = async () => {
    try {
      let res_participants = await axios.get(SERVICE.USERALLLIMIT, {
        headers: { Authorization: `Bearer ${auth.APIToken}` },
      });

      setParticipantsOption([
        ...res_participants?.data?.users?.map((t) => ({
          ...t,
          label: t.companyname,
          value: t.companyname,
        })),
      ]);
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>{" "}
          </>
        );
        handleClickOpenerr();
      } else {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>
              {"something went wrong!"}
            </p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };

  const TemplateDropdowns = async () => {
    try {
      let res = await axios.get(SERVICE.ALL_TEMPLATECREATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setTemplateValues(
        res?.data?.templatecreation.map((data) => ({
          ...data,
          label: data.name,
          value: data.name,
        }))
      );
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  const DepartDropDowns = async () => {
    try {
      let res = await axios.get(SERVICE.DEPARTMENT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDepartmentOptions(
        res?.data?.departmentdetails.map((data) => ({
          ...data,
          label: data.deptname,
          value: data.deptname,
        }))
      );
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  const CompanyDropDowns = async () => {
    try {
      let res = await axios.get(SERVICE.COMPANY, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setCompanyOptions(
        res?.data?.companies.map((data) => ({
          ...data,
          label: data.name,
          value: data.name,
        }))
      );
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  const BranchDropDowns = async (e) => {
    try {
      let res = await axios.get(SERVICE.BRANCH, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let result = res.data.branch.filter((d) => d.company === e.value);
      const branchall = result.map((d) => ({
        ...d,
        label: d.name,
        value: d.name,
      }));
      setBranchOptions(branchall);
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  const BranchDropDownsEdit = async (e) => {
    try {
      let res = await axios.get(SERVICE.BRANCH, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      // setBranchOptions(
      //   res?.data?.branch.map((data) => ({
      //     ...data,
      //     label: data.name,
      //     value: data.name,
      //   }))
      // );
      let result = res.data.branch.filter((d) => d.company === e);

      const branchall = result.map((d) => ({
        ...d,
        label: d.name,
        value: d.name,
      }));
      setBranchOptionsEdit(branchall);
      // setBranchOptionEdit(branchall);
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  const UnitDropDowns = async (e) => {
    try {
      let res_type = await axios.get(SERVICE.UNIT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let result = res_type.data.units.filter((d) => d.branch === e);
      const unitall = [
        { label: "ALL", value: "ALL" },
        ...result.map((d) => ({
          ...d,
          label: d.name,
          value: d.name,
        })),
      ];

      setUnitOptions(unitall);
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  const fetchTeam = async (e) => {
    try {
      let res_type = await axios.get(SERVICE.TEAMS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let result =
        e === "ALL"
          ? res_type.data.teamsdetails.filter((d) => d.branch === allBranch)
          : res_type.data.teamsdetails.filter(
            (d) => d.unit === e && d.branch === allBranch
          );

      const teamall = [
        { label: "ALL", value: "ALL" },
        ...result.map((d) => ({
          ...d,
          label: d.teamname,
          value: d.teamname,
        })),
      ];

      setTeamOptions(teamall);
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              style={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  const fetchTeamNames = async (e, value) => {
    try {
      let res_type = await axios.get(SERVICE.USER_STATUS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              style={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  const fetchNamesEmpMode = async (e, value) => {
    try {
      let res_type = await axios.get(SERVICE.USER_STATUS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              style={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };

  //get all Employeename.
  const fetchAllEmployee = async (e) => {
    try {
      let res_module = await axios.post(SERVICE.USEREMP_TEAMGROUP, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: documentPrepartion.company,
        branch: documentPrepartion.branch,
        unit: documentPrepartion.unit,
        team: e.value,
      });

      setEmployeenames(
        res_module.data.userteamgroup.map((data) => ({
          ...data,
          label: data.companyname,
          value: data.companyname,
        }))
      );
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  const customValueRendererEditCompanyFrom = (valueCate, _employeename) => {
    return valueCate.length
      ? valueCate.map(({ label }) => label).join(", ")
      : "Please select Employee";
  };
  const [agendaEditStyles, setAgendaEditStyles] = useState({});
  const [head, setHeader] = useState("");
  const [foot, setfooter] = useState("");
  const [checking, setChecking] = useState("");
  const createHeaderElement = (headContent) => {
    const headerElement = document.createElement("div");
    headerElement.innerHTML = `
    <div>
        ${headContent}
      </div>
    `;
    return headerElement;
  };

  // Helper function to create footer element
  const createFooterElement = (footContent) => {
    const footerElement = document.createElement("div");
    footerElement.innerHTML = `
        <div >
            ${footContent}
        </div>
    `;
    return footerElement;
  };

  const [tempfrontheader, settempfrontheader] = useState("");
  const [tempfrontfooter, settempfrontfooter] = useState("");
  const [tempbackheader, settempbackheader] = useState("");
  const [tempbackfooter, settempbackfooter] = useState("");
  const [templatefrontheader, settemplatefrontheader] = useState("");
  const [templatefrontfooter, settemplatefrontfooter] = useState("");
  const [templatebackheader, settemplatebackheader] = useState("");
  const [templatebackfooter, settemplatebackfooter] = useState("");
  const [add, setadd] = useState("");
  const [comp, setcomp] = useState("");
  const [comurl, setcomurl] = useState("");

  const [tempdata, settempdata] = useState([]);

  const templateinfo = async () => {
    let res = await axios.get(`${SERVICE.TEMPLATECONTROLPANEL}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });


    let crudcompany = res.data?.templatecontrolpanel?.find(
      (item) =>
        item.company === documentPrepartion.company &&
        item.branch === documentPrepartion.branch
    );
    settempdata(res.data?.templatecontrolpanel);

    setadd(crudcompany.address);
    setcomp(crudcompany.companyname);
    setcomurl(crudcompany.companyurl);

    settempfrontfooter(crudcompany.idcardfrontfooter[0].preview);
    settemplatefrontfooter(crudcompany.idcardfrontfooter);

    settempfrontheader(crudcompany.idcardfrontheader[0].preview);
    settemplatefrontheader(crudcompany.idcardfrontheader);

    settempbackheader(crudcompany.idcardbackheader[0].preview);
    settemplatebackheader(crudcompany.idcardbackheader);
    settempbackfooter(crudcompany.idcardbackfooter[0].preview);
    settemplatebackfooter(crudcompany.idcardbackfooter);
  };
  const [branchoption, setBranchOption] = useState([]);

  const templateinformation = async (company, branch) => {
    setBranchOption(
      tempdata?.find(
        (item) =>
          item.company === documentPrepartion.company && item.branch === branch
      )
    );

    setNewdata([]);

    setadd(branchoption.address);
    setcomp(branchoption.companyname);
    setcomurl(branchoption.companyurl);

    settempfrontfooter(branchoption.idcardfrontfooter[0].preview);

    settempfrontheader(branchoption.idcardfrontheader[0].preview);

    settempbackheader(branchoption.idcardbackheader[0].preview);

    settempbackfooter(branchoption.idcardbackfooter[0].preview);
  };

  const [newdata, setNewdata] = useState([]);
  const [profile, setprofile] = useState([]);

  const profileimages = async () => {
    let res = await axios.get(`${SERVICE.EMPLOYEEDOCUMENT}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });
    setprofile(res.data.alldocuments);
  };
  const answer = async () => {
    let getdetail = selectedOptionsEdit.map((data) => {
      let images = profile?.find(
        (item) => item.commonid === data._id
      )?.profileimage;
      let dob1 = moment(data.dob)?.format("DD-MM-YY");

      return {
        ...data,
        label: data.name,
        value: data.name,
        profileimage: images,
        dob: dob1,
      };
    });

    setNewdata(getdetail);

  };

  const componentRef1 = useRef(null);
  let componentRef2 = useRef("");

  const downloadPdfTesdt = (data) => {
    const content = componentRef2.current.innerHTML;
    console.log(componentRef2.current.innerHTML);

    // Create a temporary div element to hold the content
    const pdfElement = document.createElement("div");


    // //     <div container style="display: flex; flex-wrap: wrap; gap: 17px; ">
    // <div style="display: flex; flex-direction:column>
    const footerElement = document.createElement("div");
    footerElement.innerHTML = `

    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
    ${content}
  </div>`;


    // Append the footer element to the pdfElement
    pdfElement.appendChild(footerElement);

    // Append the temporary element to the body to ensure it can be processed by html2pdf
    document.body.appendChild(pdfElement);

    // Convert the HTML content to PDF
    html2pdf()
      .from(pdfElement)
      .set({
        margin: 1,
        filename: "idcard.pdf",
        image: { type: "jpeg", quality: 1.0 },
        html2canvas: { scale: 3 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save()
      .then(() => {
        // Remove the temporary element after the PDF is generated
        document.body.removeChild(pdfElement);
      });
  };

  const downloadPdfTesdtEdit = () => {
    // Create a new div element to hold the Quill content
    const pdfElement = document.createElement("div");
    pdfElement.innerHTML = checkingEdit;

    // Add custom styles to the PDF content
    const styleElement = document.createElement("style");
    styleElement.textContent = `
     .ql-indent-1 { margin-left: 75px; } /* Adjust margin for indent-1 class */
     .ql-indent-2 { margin-left: 150px; } /* Adjust margin for indent-2 class */
     .ql-indent-3 { margin-left: 225px; } /* Adjust margin for indent-3 class */
     .ql-indent-4 { margin-left: 275px; } /* Adjust margin for indent-4 class */
     .ql-indent-5 { margin-left: 325px; } /* Adjust margin for indent-5 class */
     .ql-indent-6 { margin-left: 375px; } /* Adjust margin for indent-6 class */
     .ql-indent-7 { margin-left: 425px; } /* Adjust margin for indent-7 class */
     .ql-indent-8 { margin-left: 475px; } /* Adjust margin for indent-8 class */
     .ql-align-right { text-align: right; } 
     .ql-align-left { text-align: left; } 
     .ql-align-center { text-align: center; } 
     .ql-align-justify { text-align: justify; }  
   `;

    pdfElement.appendChild(styleElement);

    // Convert the HTML content to PDF
    html2pdf(pdfElement, {
      margin: 17,
      filename: `${documentPreparationEdit.person}_${documentPreparationEdit.template}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    });
  };

  const downloadPdfTesdtTable = async (e) => {
    // Create a new div element to hold the Quill content
    let response = await axios.get(`${SERVICE.SINGLE_CARDPREPARATION}/${e}`, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });

    const pdfElement = document.createElement("div");
    pdfElement.innerHTML = response.data.scardPreparation.document;

    // Add custom styles to the PDF content
    const styleElement = document.createElement("style");
    styleElement.textContent = `
     .ql-indent-1 { margin-left: 75px; } /* Adjust margin for indent-1 class */
     .ql-indent-2 { margin-left: 150px; } /* Adjust margin for indent-2 class */
     .ql-indent-3 { margin-left: 225px; } /* Adjust margin for indent-3 class */
     .ql-indent-4 { margin-left: 275px; } /* Adjust margin for indent-4 class */
     .ql-indent-5 { margin-left: 325px; } /* Adjust margin for indent-5 class */
     .ql-indent-6 { margin-left: 375px; } /* Adjust margin for indent-6 class */
     .ql-indent-7 { margin-left: 425px; } /* Adjust margin for indent-7 class */
     .ql-indent-8 { margin-left: 475px; } /* Adjust margin for indent-8 class */
     .ql-align-right { text-align: right; } 
     .ql-align-left { text-align: left; } 
     .ql-align-center { text-align: center; } 
     .ql-align-justify { text-align: justify; } 
   `;

    pdfElement.appendChild(styleElement);

    // Convert the HTML content to PDF
    html2pdf(pdfElement, {
      margin: 17,
      filename: `${response.data.scardPreparation.person}_${response.data.scardPreparation.template}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    });
  };

  //Edit Details
  const UnitDropDownsEdit = async (e) => {
    let branchname = e ? e.value : documentPreparationEdit.branch;
    try {
      let res_type = await axios.get(SERVICE.UNIT, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      let result = res_type.data.units.filter((d) => d.branch === branchname);
      const unitall = [
        { label: "ALL", value: "ALL" },
        ...result.map((d) => ({
          ...d,
          label: d.name,
          value: d.name,
        })),
      ];

      setUnitOptionsEdit(unitall);
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };

  const fetchTeamEdit = async (e) => {
    try {
      let unitname = e ? e.value : documentPreparationEdit.unit;
      // let unitname = e ? e.value : documentPreparationEdit.unit
      let res_type = await axios.get(SERVICE.TEAMS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let result =
        unitname === "ALL"
          ? res_type.data.teamsdetails.filter(
            (d) => d.branch === documentPreparationEdit.branch
          )
          : res_type.data.teamsdetails.filter(
            (d) =>
              d.unit === unitname &&
              d.branch === documentPreparationEdit.branch
          );

      const teamall = [
        { label: "ALL", value: "ALL" },
        ...result.map((d) => ({
          ...d,
          label: d.teamname,
          value: d.teamname,
        })),
      ];

      setTeamOptionsEdit(teamall);
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              style={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };
  const fetchTeamNamesEdit = async (e, value) => {
    let teamname = e ? e.value : documentPreparationEdit.department;
    try {
      let res_type = await axios.get(SERVICE.USER_STATUS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              style={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  //get all Employeename.
  const fetchAllEmployeeEdit = async (e) => {
    try {
      let teamname = e ? e.value : documentPreparationEdit.team;
      let res_module = await axios.post(SERVICE.USEREMP_TEAMGROUP, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: documentPreparationEdit.company,
        branch: documentPreparationEdit.branch,
        unit: documentPreparationEdit.unit,
        team: teamname,
      });
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  //set function to get particular row
  const rowData = async (id, name) => {
    try {
      let res = await axios.get(`${SERVICE.SINGLE_CARDPREPARATION}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDocumentPreparationEdit(res?.data?.scardPreparation);
      handleClickOpen();
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };
  // Alert delete popup
  let brandid = documentPreparationEdit?._id;
  const delBrand = async () => {
    try {
      await axios.delete(`${SERVICE.SINGLE_CARDPREPARATION}/${brandid}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      await fetchBrandMaster();
      handleCloseMod();
      setSelectedRows([]);
      setPage(1);
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Deleted Successfully"}
          </p>
        </>
      );
      handleClickOpenerr();
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  //add function
  const sendRequest = async () => {
    try {
      const person = selectedOptionsEdit.map((data) => data.value);
      let brandCreate = await axios.post(SERVICE.CREATE_CARD_PREPARATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },

        company: String(documentPrepartion.company),
        branch: String(documentPrepartion.branch),
        unit: String(documentPrepartion.unit),
        team: String(documentPrepartion.team),
        person: person,
        idcard: newdata,
        idcardfrontheader: templatefrontheader,
        idcardfrontfooter: templatefrontfooter,
        idcardbackheader: templatebackheader,
        idcardbackfooter: templatebackfooter,
        add: add,
        comp: comp,
        comurl: comurl,

        addedby: [
          {
            name: String(isUserRoleAccess.companyname),
          },
        ],
      });
      //   setTemplateCreation(brandCreate.data);
      await fetchBrandMaster();
      setDocumentPrepartion({
        company: "Please Select Company",
        branch: "Please Select Branch",
        unit: "Please Select Unit",
        team: "Please Select Team",
        person: "Please Select Person",
      });
      setDepartmentCheck(false);
      setAllBranchValue(false);
      setBranchOptions([]);
      setUnitOptions([]);
      setTeamOptions([]);
      setEmployeenames([]);
      // setNewdata([]);
      setSelectedOptionsEdit([]);

      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Added Successfully"}
          </p>
        </>
      );
      handleClickOpenerr();
      setviewdata(false);
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  //submit option for saving
  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedNames = selectedOptionsEdit?.map((data) => data.companyname);
    const isNameMatch = templateCreationArray?.some((item) =>
      item.person.some((data) => selectedNames.includes(data))
    );

    if (
      documentPrepartion.company === "" ||
      documentPrepartion.company === "Please Select Company"
    ) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please Choose Company"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (
      departmentCheck === false &&
      (documentPrepartion.branch === "" ||
        documentPrepartion.branch === "Please Select Branch")
    ) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please Choose Branch"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (
      documentPrepartion.unit === "" ||
      documentPrepartion.unit === "Please Select Unit"
    ) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please Choose Unit"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (
      documentPrepartion.team === "" ||
      documentPrepartion.team === "Please Select Team"
    ) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please Choose Team"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (selectedOptionsEdit.length <= 0) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please Choose Person"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (isNameMatch) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"ID card with Person Name already exists!1"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else {
      ;
      answer();
      profileimages();
    }
  };

  const getDownloadFile = async (id) => {
    try {
      if (checking) {
        const doc = new jsPDF();
        const htmlContent = checking;

        // if (containsImage(htmlContent)) {

        const imageSrc = getImageSrc(htmlContent);

        if (imageSrc) {
          // If the HTML content contains an image, add it to the PDF
          doc.addImage(imageSrc, "JPEG", 10, 10, 100, 100);
        }
        const plainTexted = new DOMParser().parseFromString(
          htmlContent,
          "text/html"
        ).body.textContent;

        // // Create a new tab
        const plainText = htmlToText(htmlContent, {
          wordwrap: 140,
          preserveNewlines: true,
          uppercaseHeadings: false,
        });

        const padding = 100;
        let removeImageContent = plainText.replace(
          /\[data:image\/(jpeg|png);base64,[^\]]+\]/g,
          ""
        );
        doc.setFontSize(8);
        doc.text(removeImageContent, 10, 25);
        const pdfDataUri = doc.output("datauristring");

        const newTabs = window.open();
        // doc.setMargins(50,50,50,50);
        // doc.fromHTML(htmlContent, 50, 50);
        doc.autoTable({
          theme: "grid",
          styles: {
            fontSize: 2,
          },
          // columns: columnsWithSerial,
          body: newTabs.document.write(`
            <html>
            <style>
            body {
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;     
            }
            </style>
            <body>
              <iframe
                width="100%"
                height="100%"
        
                src="data:text/html;charset=utf-8,${encodeURIComponent(
            htmlContent
          )}"
              onload="disableRightClickAndTextSelection()"
              >
              </iframe>
            
            </body>
            </html>
            `),
        });
        // doc.text(htmlContent, padding, padding);
        doc.save(`${documentPrepartion.person}IdcardPreparation.pdf`);

        function containsImage(content) {
          // Check if the HTML content contains an <img> tag
          return /<img.*src="data:image\/[^"]+"/.test(content);
        }

        function getImageSrc(content) {
          // Extract the image source from the <img> tag
          const match = /<img.*src="(data:image\/[^"]+)"/.exec(content);
          return match ? match[1] : null;
        }
      } else {
        const pdfContentArray = checking?.map((docu) => docu.data);
        const concatenatedPdfContent = pdfContentArray.join("");
        const base64PDF = concatenatedPdfContent;
        const pdfDataUri = `data:application/pdf;base64,${base64PDF}`;

        const newTab = window.open();
        newTab.document.write(
          '<iframe width="100%" height="100%" src="' + pdfDataUri + '"></iframe'
        );
      }
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };
  const getDownloadFileEdit = async (id) => {
    try {
      if (checkingEdit) {
        const doc = new jsPDF();
        const htmlContent = checkingEdit;

        // if (containsImage(htmlContent)) {

        const imageSrc = getImageSrc(htmlContent);

        if (imageSrc) {
          // If the HTML content contains an image, add it to the PDF
          doc.addImage(imageSrc, "JPEG", 10, 10, 100, 100);
        }

        // // Create a new tab
        const plainText = htmlToText(htmlContent, {
          wordwrap: 140,
          preserveNewlines: true,
          uppercaseHeadings: false,
        });
        let removeImageContent = plainText.replace(
          /\[data:image\/(jpeg|png);base64,[^\]]+\]/g,
          ""
        );
        doc.setFontSize(8);
        doc.text(removeImageContent, 10, 25);
        const pdfDataUri = doc.output("datauristring");
        const newTabs = window.open();
        doc.autoTable({
          theme: "grid",
          styles: {
            fontSize: 2,
          },
          // columns: columnsWithSerial,
          body: newTabs.document.write(`
                    <html>
                    <style>
                    body {
                      -webkit-user-select: none;
                      -moz-user-select: none;
                      -ms-user-select: none;
                      user-select: none;     
                    }
                    </style>
                    <body>
                      <iframe
                        width="100%"
                        height="100%"
                
                        src="data:text/html;charset=utf-8,${encodeURIComponent(
            htmlContent
          )}"
                      onload="disableRightClickAndTextSelection()"
                      >
                      </iframe>
                    
                    </body>
                    </html>
                    `),
        });
        // doc.text(htmlContent, padding, padding);
        doc.save(`${documentPreparationEdit.person}IDcardPreparation.pdf`);

        newTabs.document.write(`
<html>
<style>
body {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
<body>
  <iframe
    width="100%"
    height="100%"
    src="data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}"
  onload="disableRightClickAndTextSelection()"
  >
  </iframe>

</body>
</html>
`);
        function containsImage(content) {
          // Check if the HTML content contains an <img> tag
          return /<img.*src="data:image\/[^"]+"/.test(content);
        }

        function getImageSrc(content) {
          // Extract the image source from the <img> tag
          const match = /<img.*src="(data:image\/[^"]+)"/.exec(content);
          return match ? match[1] : null;
        }
      } else {
        const pdfContentArray = checkingEdit?.map((docu) => docu.data);
        const concatenatedPdfContent = pdfContentArray.join("");
        const base64PDF = concatenatedPdfContent;
        const pdfDataUri = `data:application/pdf;base64,${base64PDF}`;

        const newTab = window.open();
        newTab.document.write(
          '<iframe width="100%" height="100%" src="' + pdfDataUri + '"></iframe'
        );
      }
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  const getDownloadFileTable = async (id) => {
    try {
      let response = await axios.get(
        `${SERVICE.SINGLE_CARDPREPARATION}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }
      );

      if (response.data.scardPreparation) {
        const doc = new jsPDF();
        const htmlContent = response.data.scardPreparation.document;

        // if (containsImage(htmlContent)) {

        const imageSrc = getImageSrc(htmlContent);

        if (imageSrc) {
          // If the HTML content contains an image, add it to the PDF
          doc.addImage(imageSrc, "JPEG", 10, 10, 100, 100);
        }

        // // Create a new tab
        const plainText = htmlToText(htmlContent, {
          wordwrap: 140,
          preserveNewlines: true,
          uppercaseHeadings: false,
        });
        let removeImageContent = plainText.replace(
          /\[data:image\/(jpeg|png);base64,[^\]]+\]/g,
          ""
        );
        doc.setFontSize(8);
        doc.text(removeImageContent, 10, 25);
        const pdfDataUri = doc.output("datauristring");
        const newTabs = window.open();
        doc.autoTable({
          theme: "grid",
          styles: {
            fontSize: 2,
          },
          // columns: columnsWithSerial,
          body: newTabs.document.write(`
                    <html>
                    <style>
                    body {
                      -webkit-user-select: none;
                      -moz-user-select: none;
                      -ms-user-select: none;
                      user-select: none;     
                    }
                    </style>
                    <body>
                      <iframe
                        width="100%"
                        height="100%"
                
                        src="data:text/html;charset=utf-8,${encodeURIComponent(
            htmlContent
          )}"
                      onload="disableRightClickAndTextSelection()"
                      >
                      </iframe>
                    
                    </body>
                    </html>
                    `),
        });
        // doc.text(htmlContent, padding, padding);
        doc.save(
          `${response.data.sdocumentPreparation.person}IDcardPreparation.pdf`
        );

        newTabs.document.write(`
<html>
<style>
body {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
<body>
  <iframe
    width="100%"
    height="100%"
    src="data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}"
  onload="disableRightClickAndTextSelection()"
  >
  </iframe>

</body>
</html>
`);
        function containsImage(content) {
          // Check if the HTML content contains an <img> tag
          return /<img.*src="data:image\/[^"]+"/.test(content);
        }

        function getImageSrc(content) {
          // Extract the image source from the <img> tag
          const match = /<img.*src="(data:image\/[^"]+)"/.exec(content);
          return match ? match[1] : null;
        }
      } else {
        const pdfContentArray = response.data.sdocumentPreparation.document.map(
          (docu) => docu.data
        );
        const concatenatedPdfContent = pdfContentArray.join("");
        const base64PDF = concatenatedPdfContent;
        const pdfDataUri = `data:application/pdf;base64,${base64PDF}`;

        const newTab = window.open();
        newTab.document.write(
          '<iframe width="100%" height="100%" src="' + pdfDataUri + '"></iframe'
        );
      }
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  const [selectcard, setselectcard] = useState([]);
  const [griddata, setgriddata] = useState([]);
  const options = () => {
    setselectcard(selectedOptionsEdit);
  };
  const gridoptions = () => {
    setgriddata(newdata);
  };

  //submit option for saving
  const handleSubmited = (e) => {
    e.preventDefault();
    const isNameMatch = templateCreationArray?.some(
      (item) =>
        item.template?.toLowerCase() ===
        documentPrepartion.template?.toLowerCase() &&
        item.person === documentPrepartion.person
    );

    setviewdata(true);

    if (
      documentPrepartion.company === "" ||
      documentPrepartion.company === "Please Select Company"
    ) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please Choose Company"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (
      documentPrepartion.branch === "" ||
      documentPrepartion.branch === "Please Select Branch"
    ) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please Choose Branch"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (
      documentPrepartion.unit === "" ||
      documentPrepartion.unit === "Please Select Unit"
    ) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please Choose Unit"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (
      documentPrepartion.team === "" ||
      documentPrepartion.team === "Please Select Team"
    ) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please Choose Team"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (selectedOptionsEdit.length <= 0) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please Choose Person"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (newdata.length === 0) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please generate IDcard"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (isNameMatch) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"ID card with Person Name already exists5!"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else {
      // gridoptions()
      // options();
      sendRequest();
    }
  };

  const handleclearDepartment = (e) => {
    e.preventDefault();
    setDocumentPrepartion({
      ...documentPrepartion,
      department: "Please Select Department",
    });
    setDepartmentCheck(false);
    setAllBranchValue(false);
  };
  const handleclearDepartmentEdit = (e) => {
    e.preventDefault();
    setDocumentPreparationEdit({
      ...documentPreparationEdit,
      department: "Please Select Department",
      company: "Please Selct Company",
      branch: "Please Select Branch",
      unit: "Please Select Unit",
      team: "Please Select Team",
    });
    setDepartmentCheckEdit(false);
    setAllBranchValueEdit(false);
  };

  const handlecleared = (e) => {
    setadd("");
    setcomp("");
    setcomurl("");

    settempfrontfooter("");

    settempfrontheader("");

    settempbackheader("");

    settempbackfooter("");

    setNewdata([]);
    setSelectedOptionsEdit([]);
    e.preventDefault();
    setDocumentPrepartion({
      company: "Please Select Company",
      branch: "Please Select Branch",
      unit: "Please Select Unit",
      team: "Please Select Team",
      person: "Please Select Person",
    });

    setDepartmentCheck(false);
    setAllBranchValue(false);
    setBranchOptions([]);
    setUnitOptions([]);
    setTeamOptions([]);
    setEmployeenames([]);
    setChecking("");
    setShowAlert(
      <>
        <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
        <p style={{ fontSize: "20px", fontWeight: 900 }}>
          {"Cleared Successfully"}
        </p>
      </>
    );
    handleClickOpenerr();
  };

  //get all brand master name.
  const fetchBrandMaster = async () => {
    try {
      let res_freq = await axios.get(SERVICE.ALL_CARDPREPARATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setLoader(true);
      setTemplateCreationArray(res_freq?.data?.cardpreparation);
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };

  //get all brand master name.
  const fetchBrandMasterEdit = async () => {
    try {
      let res_freq = await axios.get(SERVICE.ALL_CARDPREPARATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      //   setLoader(true);
      setTemplateCreationArrayEdit(
        res_freq?.data?.cardPreparation.filter(
          (data) => data._id !== documentPreparationEdit._id
        )
      );
      //   setAutoId(res_freq?.data?.documentPreparation)
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  useEffect(() => {
    templateinfo();
  }, [documentPrepartion.branch]);

  useEffect(() => {
    // templateinfo();
    profileimages();
    DepartDropDowns();
    fetchParticipants();

    CompanyDropDowns();
    fetchBrandMaster();
  }, []);

  const delAreagrpcheckbox = async () => {
    try {
      const deletePromises = selectedRows?.map((item) => {
        return axios.delete(`${SERVICE.SINGLE_CARDPREPARATION}/${item}`, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        });
      });
      // Wait for all delete requests to complete
      await Promise.all(deletePromises);
      handleCloseModcheckbox();
      setSelectedRows([]);
      setSelectAllChecked(false);
      setPage(1);

      await fetchBrandMaster();
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Deleted Successfully"}
          </p>
        </>
      );
      handleClickOpenerr();
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  const handleCategoryEditChange = (options) => {
    setEmployeeEdit(
      options.map((a, index) => {
        return a.value;
      })
    );

    setSelectedOptionsEdit(options);
  };

  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === "backdropClick") return;
    setIsEditOpen(false);
    setAgendaEdit("");
  };


  const [code, setcode] = useState([]);
  const [viewst, setviewst] = useState("");

  const getdownloadidcard = async (e) => {
    try {
      // setviewst("view")
      let res = await axios.get(`${SERVICE.SINGLE_CARDPREPARATION}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDocumentPreparationEdit(res?.data?.scardPreparation);
      setcode(res?.data?.scardPreparation.idcard);

      setviewfrontfooter(
        res?.data?.scardPreparation.idcardfrontfooter[0].preview
      );

      setviewfrontheader(
        res?.data?.scardPreparation.idcardfrontheader[0].preview
      );

      setviewbackheader(
        res?.data?.scardPreparation.idcardbackheader[0].preview
      );

      setviewbackfooter(
        res?.data?.scardPreparation.idcardbackfooter[0].preview
      );

      setnewadd(res?.data?.scardPreparation.add);
      setnewcomp(res?.data?.scardPreparation.comp);
      setnewcomurl(res?.data?.scardPreparation.comurl);

      handleClickOpenviewed();

      //   if (res?.data?.scardPreparation.idcard.length > 0) {
      //   // setTimeout(() => {

      //     downloadPdfTesdt(res?.data?.scardPreparation.idcard);
      // // }, 2000); //
      //   }

      // setisLoading(false)
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };

  const [viewfrontheader, setviewfrontheader] = useState("");
  const [viewfrontfooter, setviewfrontfooter] = useState("");
  const [viewbackheader, setviewbackheader] = useState("");
  const [viewbackfooter, setviewbackfooter] = useState("");

  const [newadd, setnewadd] = useState("");
  const [newcomp, setnewcomp] = useState("");
  const [newcomurl, setnewcomurl] = useState("");

  // get single row to view....
  const getviewCode = async (e) => {
    try {
      handleClickOpenview();

      setviewst("view");
      let res = await axios.get(`${SERVICE.SINGLE_CARDPREPARATION}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDocumentPreparationEdit(res?.data?.scardPreparation);

      setcode(res?.data?.scardPreparation.idcard);

      setviewfrontfooter(
        res?.data?.scardPreparation.idcardfrontfooter[0].preview
      );

      setviewfrontheader(
        res?.data?.scardPreparation.idcardfrontheader[0].preview
      );

      setviewbackheader(
        res?.data?.scardPreparation.idcardbackheader[0].preview
      );

      setviewbackfooter(
        res?.data?.scardPreparation.idcardbackfooter[0].preview
      );

      setnewadd(res?.data?.scardPreparation.add);
      setnewcomp(res?.data?.scardPreparation.comp);
      setnewcomurl(res?.data?.scardPreparation.comurl);

    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
    setviewst("");
  };
  //get single row to view....
  const getinfoCode = async (e) => {
    try {
      let res = await axios.get(`${SERVICE.SINGLE_CARDPREPARATION}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setDocumentPreparationEdit(res?.data?.scardPreparation);
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  //frequency master name updateby edit page...
  let updateby = documentPreparationEdit?.updatedby;
  let addedby = documentPreparationEdit?.addedby;
  let frequencyId = documentPreparationEdit?._id;

  const sendRequestEdit = async () => {
    try {
      let brandCreate = await axios.put(
        `${SERVICE.SINGLE_CARDPREPARATION}/${frequencyId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },

          company: String(documentPreparationEdit.company),
          branch: String(documentPreparationEdit.branch),
          unit: String(documentPreparationEdit.unit),
          team: String(documentPreparationEdit.team),
          person: String(documentPreparationEdit.person),

          updatedby: [
            ...updateby,
            {
              name: String(isUserRoleAccess.companyname),
            },
          ],
        }
      );
      await fetchBrandMaster();
      setDepartmentCheckEdit(false);
      setAllBranchValueEdit(false);
      handleCloseModEdit();
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Updated Successfully"}
          </p>
        </>
      );
      handleClickOpenerr();
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
      // else {
      //   setShowAlert(
      //     <>
      //       <ErrorOutlineOutlinedIcon sx={{ fontSize: "100px", color: "orange" }} />
      //       <p style={{ fontSize: "20px", fontWeight: 900 }}>{"something went wrong!"}</p>
      //     </>
      //   );
      //   handleClickOpenerr();
      // }
    }
  };

  //submit option for saving
  const handleSubmitedEdit = (e) => {
    e.preventDefault();
    const isNameMatch = templateCreationArrayEdit?.some(
      (item) => item.person === documentPreparationEdit.person
    );
    if (
      documentPreparationEdit.employeemode === "" ||
      documentPreparationEdit.employeemode === "Please Select Employee Mode"
    ) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please Choose Employee Mode"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (
      allBranchValueEdit === false &&
      (documentPreparationEdit.department === "" ||
        documentPreparationEdit.department === "Please Select Department")
    ) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please Choose Department"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (
      documentPreparationEdit.branch === "" ||
      documentPreparationEdit.branch === "Please Select Branch"
    ) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please Choose Branch"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (
      departmentCheckEdit === false &&
      documentPreparationEdit.department === "Please Select Department" &&
      (documentPreparationEdit.unit === "" ||
        documentPreparationEdit.unit === "Please Select Unit")
    ) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please Choose Unit"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (
      documentPreparationEdit.team === "" ||
      documentPreparationEdit.team === "Please Select Team"
    ) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please Choose Team"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (selectedOptionsEdit.length <= 0) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"Please Choose Person"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else if (isNameMatch) {
      setShowAlert(
        <>
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: "100px", color: "orange" }}
          />
          <p style={{ fontSize: "20px", fontWeight: 900 }}>
            {"ID card with Person Name already exists!2"}
          </p>
        </>
      );
      handleClickOpenerr();
    } else {
      sendRequestEdit();
    }
  };

  const [checkingEdit, setCheckingEdit] = useState("");
  const answerEdit = async () => {
    let res = await axios.get(SERVICE.ALL_TEMPLATECREATION, {
      headers: {
        Authorization: `Bearer ${auth.APIToken}`,
      },
    });

    let format = res.data.templatecreation.find(
      (data) => data.name === documentPreparationEdit.template
    );

    let convert = format.pageformat;

    const tempElement = document.createElement("div");
    tempElement.innerHTML = convert;

    const listItems = Array.from(tempElement.querySelectorAll("li"));
    listItems.forEach((li, index) => {
      li.innerHTML = `${index + 1}. ${li.innerHTML}\n`;
    });

    let texted = tempElement.innerHTML;

    let findMethod = texted;

    setCheckingEdit(findMethod);
  };

  const handleCaptureImage = () => {
    if (gridRef.current) {
      html2canvas(gridRef.current).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, "IDcardPreparation.png");
        });
      });
    }
  };
  // pdf.....
  // const columns = [
  // { title: "Sno", field: "serialNumber" },

  // { title: "company", field: "company" },
  // { title: "Branch", field: "Branch" },
  // { title: "Unit", field: "Unit" },
  // { title: "Team", field: "Team" },
  // { title: "Person", field: "Person" },
  // ];
  //  pdf download functionality
  // const downloadPdf = () => {
  //   const doc = new jsPDF();
  //   const columnsWithSerial = [
  //     ...columns.map((col) => ({ ...col, dataKey: col.field })),
  //   ];
  //   // Add a serial number to each row
  //   const itemsWithSerial = templateCreationArray.map((t, index) => ({
  //     ...t,
  //     serialNumber: index + 1,

  //     Company: t.company === "Please Select Company" ? "-" : t.company,
  //     Branch: t.branch === "Please Select Branch" ? "-" : t.branch,
  //     Unit: t.unit === "Please Select Unit" ? "-" : t.unit,
  //     Team: t.team === "Please Select Team" ? "-" : t.team,
  //     Person: t.person?.map((t, i) => `${i + 1 + "."}` + t)
  //     .join(",")
  //     .toString(),

  //     // pageformat: convertToNumberedList(item.pageformat),
  //   }));
  //   doc.autoTable({
  //     theme: "grid",
  //     styles: {
  //       fontSize: 4,
  //     },
  //     columns: columnsWithSerial,
  //     body: itemsWithSerial,
  //   });
  //   doc.save("DocumentPreparation.pdf");
  // };

  // const columns = [
  //   { title: "Sno", field: "serialNumber" },
  //   { title: "Company", field: "company" },
  //   { title: "Branch", field: "branch" },
  //   { title: "Unit", field: "unit" },
  //   { title: "Team", field: "team" },
  //   { title: "Person", field: "person" },
  // ];

  // const downloadPdf = () => {
  //   const doc = new jsPDF({
  //     orientation: "landscape",
  //   });
  //   doc.autoTable({
  //     theme: "grid",
  //     styles: {
  //       fontSize: 6,
  //     },
  //     columns: columns.map((col) => ({ ...col, dataKey: col.field })),
  //     body: rowDataTable,
  //   });
  //   doc.save("Idcardpreparation.pdf");
  // };

  // Excel
  const fileName = "IDcardPreparation";
  // get particular columns for export excel
  const getexcelDatas = () => {
    try {
      var data = rowDataTable.map((t, index) => ({
        serialNumber: index + 1,
        Company: t.company === "Please Select Company" ? "-" : t.company,
        Branch: t.branch === "Please Select Branch" ? "-" : t.branch,
        Unit: t.unit === "Please Select Unit" ? "-" : t.unit,
        Team: t.team === "Please Select Team" ? "-" : t.team,
        Person: t.person,

        // PageFormat: convertToNumberedList(t.pageformat),
      }));
      setExcel(data);
    } catch (err) {
      const messages = err?.response?.data?.message;
      if (messages) {
        setShowAlert(
          <>
            <ErrorOutlineOutlinedIcon
              sx={{ fontSize: "100px", color: "orange" }}
            />
            <p style={{ fontSize: "20px", fontWeight: 900 }}>{messages}</p>
          </>
        );
        handleClickOpenerr();
      }
    }
  };

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "ID Card Preparation",
    pageStyle: "print",
  });

  //serial no for listing items
  const addSerialNumber = () => {
    const itemsWithSerialNumber = templateCreationArray?.map((item, index) => ({
      ...item,
      serialNumber: index + 1,
    }));
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

  useEffect(() => {
    UnitDropDownsEdit();
    fetchTeamEdit();
    fetchAllEmployeeEdit();
    fetchTeamNamesEdit();
    answerEdit();
    fetchBrandMasterEdit();
  }, [isEditOpen]);

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
      width: 90,
      hide: !columnVisibility.serialNumber,
      headerClassName: "bold-header",
    },

    {
      field: "company",
      headerName: "Company",
      flex: 0,
      width: 80,
      hide: !columnVisibility.company,
      headerClassName: "bold-header",
    },
    {
      field: "branch",
      headerName: "Branch",
      flex: 0,
      width: 80,
      hide: !columnVisibility.branch,
      headerClassName: "bold-header",
    },
    {
      field: "unit",
      headerName: "Unit",
      flex: 0,
      width: 80,
      hide: !columnVisibility.unit,
      headerClassName: "bold-header",
    },
    {
      field: "team",
      headerName: "Team",
      flex: 0,
      width: 80,
      hide: !columnVisibility.team,
      headerClassName: "bold-header",
    },
    {
      field: "person",
      headerName: "Person",
      flex: 0,
      width: 100,
      hide: !columnVisibility.person,
      headerClassName: "bold-header",
    },

    {
      field: "Idcard",
      headerName: "Idcard",
      flex: 0,
      width: 100,
      minHeight: "40px",
      hide: !columnVisibility.Idcard,
      renderCell: (params) => (
        <Grid>
          <Button
            onClick={(e) => {
              getdownloadidcard(params.row.id);
            }}
            variant="contained"
          >
            <span>View</span>
          </Button>
        </Grid>
      ),
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
          {isUserRoleCompare?.includes("dcreateidcard") && (
            <Button
              sx={userStyle.buttondelete}
              onClick={(e) => {
                rowData(params.row.id, params.row.name);
              }}
            >
              <DeleteOutlineOutlinedIcon style={{ fontsize: "large" }} />
            </Button>
          )}
          {isUserRoleCompare?.includes("vcreateidcard") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                getviewCode(params.row.id);
              }}
            >
              <VisibilityOutlinedIcon style={{ fontsize: "large" }} />
            </Button>
          )}
          {isUserRoleCompare?.includes("icreateidcard") && (
            <Button
              sx={userStyle.buttonedit}
              onClick={() => {
                handleClickOpeninfo();
                getinfoCode(params.row.id);
              }}
            >
              <InfoOutlinedIcon style={{ fontsize: "large" }} />
            </Button>
          )}
        </Grid>
      ),
    },
  ];

  const convertToNumberedList = (htmlContent) => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = htmlContent;

    const listItems = Array.from(tempElement.querySelectorAll("li"));
    listItems.forEach((li, index) => {
      li.innerHTML = `${index + 1}. ${li.innerHTML}\n`;
    });

    return tempElement.innerText;
  };

  const rowDataTable = filteredData.map((item, index) => {
    return {
      id: item._id,
      serialNumber: item.serialNumber,
      company: item.company === "Please Select Company" ? "" : item.company,
      branch: item.branch === "Please Select Branch" ? "" : item.branch,
      unit: item.unit === "Please Select Unit" ? "" : item.unit,
      team: item.team === "Please Select Team" ? "" : item.team,
      person: item.person.toString(),
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

  const isValidUrl = (url) => {
    return url !== "";
  };
  const [viewdata, setviewdata] = useState(false);
  return (
    <Box>
      <LoadingBackdrop open={isLoading} />
      <Headtitle title={"ID CARD PREPARATION"} />
      {/* ****** Header Content ****** */}
      <Typography sx={userStyle.HeaderText}>ID card Preparation</Typography>
      {isUserRoleCompare?.includes("acreateidcard") && (
        <Box sx={userStyle.selectcontainer}>
          <>
            <Grid container spacing={2}>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Company<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <Selects
                    maxMenuHeight={300}
                    options={CompanyOptions}
                    isDisabled={departmentCheck}
                    value={{
                      label: documentPrepartion.company,
                      value: documentPrepartion.company,
                    }}
                    onChange={(e) => {
                      BranchDropDowns(e);
                      // UnitDropDowns(e.value);
                      setAllBranch(e.value);
                      setAllBranchValue(true);
                      setDocumentPrepartion({
                        ...documentPrepartion,
                        company: e.value,
                        branch: "Please Select Branch",
                        unit: "Please Select Unit",
                        team: "Please Select Team",
                        person: "Please Select Person",
                      });
                      setSelectedOptionsEdit([]);
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
                    maxMenuHeight={300}
                    options={BranchOptions}
                    isDisabled={departmentCheck}
                    value={{
                      label: documentPrepartion.branch,
                      value: documentPrepartion.branch,
                    }}
                    onChange={(e) => {
                      UnitDropDowns(e.value);
                      setAllBranch(e.value);
                      setAllBranchValue(true);
                      setDocumentPrepartion({
                        ...documentPrepartion,
                        branch: e.value,
                        unit: "Please Select Unit",
                        team: "Please Select Team",
                        person: "Please Select Person",
                      });
                      setSelectedOptionsEdit([]);

                      templateinformation(documentPrepartion.company, e.value);
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
                    maxMenuHeight={300}
                    options={UnitOptions}
                    isDisabled={departmentCheck}
                    value={{
                      label: documentPrepartion.unit,
                      value: documentPrepartion.unit,
                    }}
                    onChange={(e) => {
                      fetchTeam(e.value);
                      setDocumentPrepartion({
                        ...documentPrepartion,
                        unit: e.value,
                        team: "Please Select Team",
                        person: "Please Select Person",
                      });
                      setSelectedOptionsEdit([]);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Team<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <Selects
                    maxMenuHeight={300}
                    options={TeamOptions}
                    isDisabled={departmentCheck}
                    value={{
                      label: documentPrepartion.team,
                      value: documentPrepartion.team,
                    }}
                    onChange={(e) => {
                      setDocumentPrepartion({
                        ...documentPrepartion,
                        team: e.value,
                      });
                      fetchAllEmployee(e);
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item md={3} xs={12} sm={12}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Person<b style={{ color: "red" }}>*</b>
                  </Typography>

                  <MultiSelect
                    options={employeenames}
                    value={selectedOptionsEdit}
                    onChange={handleCategoryEditChange}
                    valueRenderer={customValueRendererEditCompanyFrom}
                    labelledBy="Please Select Person"
                  />
                </FormControl>
              </Grid>

              <Grid item md={12} sm={12} xs={12}></Grid>

              <Grid item md={12} xs={12} sm={12}></Grid>

              <Grid
                md={12}
                xs={12}
                sm={12}
                container
                spacing={2}
                style={{ display: "flex", gap: "10px", flexDirection: "row" }}
              >
                <Grid item lg={3} md={3} sm={12} xs={12}>
                  <div
                    style={{
                      border: "1px solid black",
                      width: "14.2vw",
                      // height: "44vh",
                      borderRadius: "3px",
                    }}
                  >
                    <div>
                      {isValidUrl(tempfrontheader) && (
                        <img
                          style={{
                            width: "14vw",
                            height: "14vh",
                            objectFit: "cover",
                          }}
                          src={tempfrontheader}
                        />
                      )}
                    </div>
                    <div style={{ marginTop: "1.3vh" }}></div>

                    <div
                      style={{
                        // justifyContent: "center",
                        // alignItems: "center",
                        border: "2px solid black",
                        borderRadius: "4px",
                        marginLeft: "3.7vw",
                        width: "6vw",
                        height: "14.7vh",
                      }}
                    ></div>
                    <div style={{ marginTop: "1.4vh" }}></div>
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "1vw",
                        color: "black",
                        fontWeight: "bold",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {"NAME"}
                    </div>

                    <div
                      style={{
                        marginTop: "5.0vh",
                      }}
                    ></div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        // Assuming you want the container to take the full viewport height
                      }}
                    >
                      {isValidUrl(tempfrontfooter) && (
                        <img
                          style={{
                            height: "5vh",
                            width: "14vw",
                            objectFit: "cover",
                          }}
                          src={tempfrontfooter}
                        />
                      )}
                    </div>
                  </div>
                </Grid>
                <Grid item lg={3} md={3} sm={12} xs={12}>
                  <div
                    style={{
                      border: "1px solid black",
                      width: "14.2vw",
                      // height: "44vh",
                      borderRadius: "3px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      {isValidUrl(tempfrontfooter) && (
                        <img
                          style={{
                            height: "4vh",
                            width: "14vw",
                            objectFit: "cover",
                          }}
                          src={tempbackheader}
                        />
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: "0.8vh",
                      }}
                    ></div>

                    <div
                      style={{
                        fontSize: "0.7vw",
                        fontWeight: "bold",
                        paddingLeft: "15px",
                        fontFamily: "sans-serif",
                        color: "black",
                      }}
                    >
                      <div>{"Employee ID :"}</div>
                      <br />
                      <div>{"Date of Birth :"}</div>
                      <br />
                      <div>{"Blood Group :"}</div>
                      <br />
                      <div>{"Emergency Contact(s) :"}</div>
                    </div>
                    {/* <div
                        style={{
                         
                          marginTop: "6.0vh",
                         
                        }}
                      >
                        
                      </div> */}
                    <br />
                    <br />

                    <div
                      style={{
                        fontFamily: "neuropol",
                        color: "darkblue",

                        textAlign: "center",
                        fontWeight: "bolder",
                        fontSize: "0.8vw",
                        // whiteSpace: "nowrap",
                      }}
                    >
                      {" "}
                      {comp}
                    </div>
                    <div
                      style={{
                        marginTop: "0.5vh",
                      }}
                    ></div>

                    <div
                      style={{
                        fontSize: "0.7vw",
                        textAlign: "center",

                        color: "black",
                        fontFamily: "sans-serif",
                        fontWeight: "bolder",
                      }}
                    >
                      {" "}
                      {add}
                    </div>
                    <div
                      style={{
                        marginTop: "0.5vh",
                      }}
                    ></div>

                    <div
                      style={{
                        fontSize: "0.7vw",
                        color: "orange",
                        textAlign: "center",

                        fontFamily: "sans-serif",
                      }}
                    >
                      {comurl}
                    </div>
                    <div
                      style={{
                        marginTop: "0.5vh",
                      }}
                    ></div>

                    <div style={{ fontWeight: "bold" }}>
                      <hr />
                    </div>
                    <div
                      style={{
                        marginTop: "0.5vh",
                      }}
                    ></div>

                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "0.7vw",
                        color: "black",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {"This card is a property"}
                    </div>
                    <div
                      style={{
                        fontFamily: "neuropol",
                        color: "darkblue",
                        textAlign: "center",
                        fontSize: "0.8vw",
                        fontWeight: "bolder",
                      }}
                    >
                      {" "}
                      {comp}
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "0.7vw",
                        color: "black",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {"If found, please return to the above address"}
                    </div>
                    <div
                      style={{
                        marginBottom: "0.5vh",
                      }}
                    ></div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        // Assuming you want the container to take the full viewport height
                      }}
                    >
                      {isValidUrl(tempfrontfooter) && (
                        <img
                          style={{
                            height: "5vh",
                            width: "14vw",
                            justifyContent: "end",

                            objectFit: "cover",
                          }}
                          src={tempbackfooter}
                        />
                      )}
                    </div>
                  </div>
                </Grid>
              </Grid>

              <Grid item md={12} xs={12} sm={12}></Grid>
              <Grid item md={12} xs={12} sm={12}></Grid>
              <Grid item md={12} xs={12} sm={12}></Grid>
              <Grid item md={12} xs={12} sm={12}></Grid>
              <Grid item md={12} xs={12} sm={12}></Grid>
              <Grid item md={12} xs={12} sm={12}></Grid>

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
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                >
                  Generate
                </Button>
              </Grid>
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <Grid
                container
                spacing={2}
                sx={{ gap: "17px" }}
                ref={componentRef1}

              >
                {newdata.map((d, index) => (

                  <Grid item md={2} sm={12} xs={12} sx={{ display: 'flex', flexDirection: 'column', flexBasis: 'auto' }} key={index} >


                    <div
                      style={{
                        border: "1px solid black",
                        width: "14.2vw",

                        borderRadius: "3px"
                      }}
                    >
                      <div

                      >
                        <img
                          style={{ width: "14vw", height: "14vh", objectFit: "cover" }}
                          src={tempfrontheader}
                        />
                      </div>
                      <div style={{ marginTop: "1.3vh" }}>

                      </div>

                      <div
                      >
                        <img style={{
                          display: "flex",
                          justifyContent: "center",
                          marginLeft: "3.8vw",
                          objectFit: 'cover',
                          border: "2px solid black",
                          borderRadius: "4px",

                          width: "6vw",
                          height: "14.7vh",

                        }} src={d.profileimage ? d.profileimage : placeholderImage} />
                      </div>


                      <div style={{ marginTop: "1.4vh" }}>

                      </div>
                      <div style={{ textAlign: "center", fontSize: "1vw", color: "black", fontWeight: "bold", fontFamily: "sans-serif" }}>
                        <span
                          style={{
                            textTransform: "uppercase",
                            fontWeight: "bolder",
                            color: "black",
                            fontFamily: "sans-serif"
                          }}
                        >
                          {d.legalname}
                        </span>
                      </div>

                      <div style={{

                        marginTop: "4.9vh",

                      }}></div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          // Assuming you want the container to take the full viewport height
                        }}
                      >
                        <img
                          style={{
                            height: '5vh',
                            width: '14vw',
                            objectFit: 'cover'
                          }}
                          src={tempfrontfooter}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        border: "1px solid black",
                        width: "14.2vw",

                        borderRadius: "3px"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",


                        }}
                      >
                        <img
                          style={{
                            height: "4vh",
                            width: "14vw", objectFit: 'cover'
                          }}
                          src={tempbackheader}
                        />
                      </div>
                      <div
                        style={{
                          marginTop: "0.8vh",

                        }}
                      ></div>

                      <div
                        style={{

                          fontSize: "0.7vw",
                          fontWeight: "bold",
                          paddingLeft: "15px",
                          fontFamily: "sans-serif",
                          color: "black"
                        }}
                      >
                        <div>
                          {" "}
                          Employee ID :{" "}
                          <span style={{ color: "darkblue" }}>
                            {d.empcode}
                          </span>
                        </div>
                        <br />
                        <div>
                          Date of Birth :{" "}
                          <span style={{ color: "darkblue" }}>{d.dob}</span>
                        </div>
                        <br />
                        <div>
                          Blood Group :{" "}
                          <span style={{ color: "darkblue" }}>
                            {d.bloodgroup}
                          </span>
                        </div>
                        <br />
                        <div>
                          Emergency Contact(s):{" "}
                          <span style={{ color: "darkblue" }}>
                            {d.emergencyno}
                          </span>
                        </div>
                      </div>
                      <div style={{

                        marginTop: "5.7vh",

                      }}></div>

                      <div
                        style={{
                          fontFamily: "neuropol",
                          color: "darkblue",
                          fontSize: "0.7vw",
                          textAlign: "center",
                          fontWeight: "bolder",
                          // whiteSpace: "nowrap",

                        }}
                      >
                        {" "}
                        {comp}
                      </div>
                      <div
                        style={{
                          marginTop: "0.5vh",

                        }}
                      ></div>
                      <div
                        style={{
                          fontSize: "0.7vw",
                          textAlign: "center",

                          fontWeight: "bolder",
                          fontFamily: "sans-serif",
                          color: "black"
                        }}
                      >
                        {" "}
                        {add}
                      </div>
                      <div
                        style={{
                          marginTop: "0.5vh",

                        }}
                      ></div>

                      <div
                        style={{
                          fontSize: "0.7vw",
                          color: "orange",
                          textAlign: "center",

                          fontFamily: "sans-serif",
                        }}
                      >
                        {comurl}
                      </div>
                      <div
                        style={{
                          marginTop: "0.5vh",

                        }}
                      ></div>
                      <div style={{ fontWeight: "bold" }}>
                        <hr />
                      </div>
                      <div
                        style={{
                          marginTop: "0.5vh",

                        }}
                      ></div>

                      <div
                        style={{
                          textAlign: "center",
                          fontSize: "0.7vw",
                          fontFamily: "sans-serif",
                          color: "black"

                        }}
                      >
                        {"This card is a property"}
                      </div>
                      <div
                        style={{
                          fontFamily: "neuropol",
                          color: "darkblue",
                          textAlign: "center",
                          fontSize: "0.8vw",
                          fontWeight: "bolder",
                        }}
                      >
                        {" "}
                        {comp}
                      </div>
                      <div style={{
                        textAlign: "center", fontSize: "0.7vw", fontFamily: "sans-serif",
                        color: "black"
                      }}>
                        {"If found, please return to the above address"}
                      </div>
                      <div
                        style={{
                          marginTop: "0.5vh",

                        }}
                      ></div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: 'column',
                          justifyContent: "flex-end",

                        }}
                      >
                        <img
                          style={{
                            height: "5vh",
                            width: "14vw",
                            justifyContent: "end",

                            objectFit: 'cover'
                          }}
                          src={tempbackfooter}
                        />
                      </div>
                    </div>


                  </Grid>

                ))}
              </Grid>
              {/* {viewst == "view"  &&
                <Grid
                  container
                  spacing={2}
                  sx={{ gap: "17px" }}
                   ref={componentRef2 }
                 
                >
                  {code.map((d, index) => (
                  
                  <Grid item md={2} sm={12} xs={12} >
                  <div
                    style={{
                      border: "1px solid black",
                      width: "14.2vw",
                     
                      borderRadius:"3px"
                    }}
                  >
                    <div
                   
                  >
                      <img
                         style={{ width: "13.5vw",height:"14vh", objectFit:"cover" }}
                      src={viewfrontheader}
                    />
                  </div>
                  <div style={{  marginTop: "1.3vh" }}>
                   
                   </div>

                    <div   
                    >
                     <img style={{
                     display:"flex",
                     justifyContent: "center",
                     marginLeft: "3.8vw",
                      objectFit:'cover', 
                      border: "2px solid black",
                      borderRadius:"4px",
                      
                     width: "6vw",
                     height: "14.7vh",
                       
                      }} src={d.profileimage} /> 
                    </div>

                   
                    <div style={{  marginTop: "1.4vh"}}>
                   
                   </div>
                   <div style={{  textAlign: "center" ,fontSize:"1vw",color:"black",fontWeight:"bold",fontFamily:"sans-serif"}}>
                      <span
                        style={{
                          textTransform: "uppercase",
                          fontWeight: "bolder",
                          color: "black",
                          fontFamily:"sans-serif"
                        }}
                      >
                        {d.legalname}
                      </span>
                    </div>

                    <div  style={{
                       
                       marginTop: "5.0vh",
                        
                      }}></div>

                    <div
                       style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                         // Assuming you want the container to take the full viewport height
                      }}
                    >
                      <img
                        style={{
                          height: '5vh',
                          width: '14vw',
                          objectFit: 'cover'
                        }}
                        src={viewfrontfooter}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      border: "1px solid black",
                      width: "14.2vw",
                     
                      borderRadius:"3px"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                    
                      
                      }}
                    >
                      <img
                      style={{height:"4vh",
                      width: "14vw",objectFit:'cover' }}
                      src={viewbackheader}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: "0.8vh",
                      
                    }}
                  ></div>

                   <div
                    style={{
                     
                      fontSize:"0.7vw",
                      fontWeight: "bold",
                      paddingLeft: "15px",
                      fontFamily:"sans-serif",
                      color:"black"
                    }}
                  >
                      <div>
                        {" "}
                        Employee ID :{" "}
                        <span style={{ color: "darkblue" }}>
                          {d.empcode}
                        </span>
                      </div>
                      <br />
                      <div>
                        Date of Birth :{" "}
                        <span style={{ color: "darkblue" }}>{d.dob}</span>
                      </div>
                      <br />
                      <div>
                        Blood Group :{" "}
                        <span style={{ color: "darkblue" }}>
                          {d.bloodgroup}
                        </span>
                      </div>
                      <br />
                      <div>
                        Emergency Contact(s):{" "}
                        <span style={{ color: "darkblue" }}>
                          {d.emergencyno}
                        </span>
                      </div>
                    </div>

                    <div
                    style={{
                     
                      marginTop: "5.8vh",
                     
                    }}
                  >
                    
                  </div>

                    <div
                      style={{
                        fontFamily: "neuropol",
                        color: "darkblue",
                        fontSize:"0.7vw",
                        textAlign: "center",
                        fontWeight: "bolder",
                        // whiteSpace: "nowrap",
                        
                      }}
                    >
                      {" "}
                      {newcomp}
                    </div>
                    <div
                    style={{
                      marginTop: "0.5vh",
                      
                    }}
                  ></div>
                    <div
                      style={{
                        fontSize:"0.7vw",
                        textAlign: "center",
                        
                        fontWeight: "bolder",
                        fontFamily:"sans-serif",
                        color:"black"
                      }}
                    >
                      {" "}
                      {newadd}
                    </div>
                    <div
                    style={{
                      marginTop: "0.5vh",
                      
                    }}
                  ></div>

                  <div
                    style={{  fontSize:"0.7vw",
                      color: "orange",
                      textAlign: "center",
                      
                      fontFamily:"sans-serif",
                    }}
                  >
                    {newcomurl}
                  </div>
                  <div
                    style={{
                      marginTop: "0.5vh",
                      
                    }}
                  ></div>
                    <div style={{ fontWeight: "bold" }}>
                      <hr />
                    </div>
                    <div
                    style={{
                      marginTop: "0.5vh",
                      
                    }}
                  ></div>

                    <div
                      style={{
                        textAlign: "center",
                        fontSize:"0.7vw",
                        fontFamily:"sans-serif",
                        color:"black"
                        
                      }}
                    >
                      {"This card is a property"}
                    </div>
                    <div
                      style={{
                        fontFamily: "neuropol",
                        color: "darkblue",
                        textAlign: "center",
                        fontSize:"0.8vw",
                        fontWeight: "bolder",
                      }}
                    >
                      {" "}
                      {comp}
                    </div>
                    <div style={{ textAlign: "center",  fontSize:"0.7vw",fontFamily:"sans-serif",
                        color:"black"}}>
                      {"If found, please return to the above address"}
                    </div>
                    <div
                    style={{
                      marginTop: "0.5vh",
                      
                    }}
                  ></div>
                    <div
                    style={{
                      display: "flex",
                      flexDirection: 'column',
                      justifyContent: "flex-end",
                      
                    }}
                  >
                    <img
                     style={{height:"5vh",
                     width: "14vw",
                     justifyContent:"end",
                      
                       objectFit:'cover' 
                     }}
                      src={viewbackfooter}
                    />
                  </div>
                  </div>
                </Grid>
             
                    
                  ))}
                </Grid>
} */}
              {/* 
                <Grid
                  container
                  spacing={2}
                  sx={{ display: "flex ", gap: "5px" }}
                  ref={componentRef1}
                >
                  {newdata.map((d, index) => (
                    <Grid item lg={3} md={3} sm={12} xs={12} >
                      <div
                        style={{
                          boxShadow:"1px 1px 6px 5px #A3A1A0",
                          width: "273px",
                          height: "436px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            width: "100%",
                          }}
                        >
                          <img
                            style={{ width: "272px", marginLeft: "20%", objectFit:'cover' }}
                            src={tempfrontheader}
                          />
                        </div>

                        <div
                          
                        >
                         <img style={{display:"flex",
                          justifyContent: "center",
                            alignItems: "center",
                            marginLeft: "65px",
                            border: "2px solid black",
                            marginTop: "10px",
                            width: "134px",
                            height: "174px",
                            objectFit:'cover' 
                           
                          }} src={d.profileimage} /> 
                        </div>
                        <div style={{ textAlign: "center", marginTop: "15px" }}>
                          <span
                            style={{
                              textTransform: "uppercase",
                              fontWeight: "bolder",
                              color: "black",
                            }}
                          >
                            {d.legalname}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            width: "100%",
                          }}
                        >
                          <img
                            style={{
                              width: "271px",
                              marginLeft: "20%",
                              marginTop: "46px",
                             objectFit:'cover' 
                              
                            }}
                            src={tempfrontfooter}
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          boxShadow:"1px 1px 6px 5px #A3A1A0",
                          width: "273px",
                          
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                        
                          
                          }}
                        >
                          <img
                            style={{ width: "272px", marginLeft: "20%" ,objectFit:'cover' }}
                            src={tempbackheader}
                          />
                        </div>
                        <div
                          style={{
                            marginTop: "10px",
                            fontWeight: "bold",
                            paddingLeft: "15px",
                           
                          }}
                        >
                          <div>
                            {" "}
                            Employee ID :{" "}
                            <span style={{ color: "darkblue" }}>
                              {d.empcode}
                            </span>
                          </div>
                          <br />
                          <div>
                            Date of Birth :{" "}
                            <span style={{ color: "darkblue" }}>{d.dob}</span>
                          </div>
                          <br />
                          <div>
                            Blood Group :{" "}
                            <span style={{ color: "darkblue" }}>
                              {d.bloodgroup}
                            </span>
                          </div>
                          <br />
                          <div>
                            Emergency Contact(s):{" "}
                            <span style={{ color: "darkblue" }}>
                              {d.emergencyno}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            fontFamily: "neuropol",
                            color: "darkblue",
                            marginTop: "83px",
                            textAlign: "center",
                            fontWeight: "bolder",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {" "}
                          {comp}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            textAlign: "center",
                            marginTop: "3px",
                            fontWeight: "bolder",
                          }}
                        >
                          {" "}
                          {add}
                        </div>
                        <div
                        style={{
                          color: "orange",
                          textAlign: "center",
                          marginTop: "3px",
                        }}
                      >
                        {comurl}
                      </div>
                        <div style={{ fontWeight: "bold", marginTop: "3px" }}>
                          <hr />
                        </div>

                        <div
                          style={{
                            textAlign: "center",
                            fontSize: "13px",
                            marginTop: "3px",
                          }}
                        >
                          {"This card is a property"}
                        </div>
                        <div
                          style={{
                            fontFamily: "neuropol",
                            color: "darkblue",
                            textAlign: "center",
                            fontSize: "13px",
                            fontWeight: "bolder",
                          }}
                        >
                          {" "}
                          {comp}
                        </div>
                        <div style={{ textAlign: "center", fontSize: "13px" }}>
                          {"If found, please return to the above address"}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            width: "100%",
                          }}
                        >
                          <img
                            style={{ width: "270px", marginLeft: "20%" ,objectFit:'cover' }}
                            src={tempbackfooter}
                          />
                        </div>
                      </div>
                    </Grid>
                  ))}
                </Grid> */}
              <br />
            </Grid>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />

            <Grid
              container
              spacing={2}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              {/* <Grid item lg={1} md={2} sm={2} xs={12}>
                <Button
                      variant="contained"
                      color="primary"
                     
                      onClick={downloadPdfTesdt}
                    >
                      Print
                    </Button>
                </Grid> */}
              <Grid item lg={1} md={2} sm={2} xs={12}></Grid>
              <Grid item lg={1} md={2} sm={2} xs={12}>
                <LoadingButton
                  onClick={(e) => {
                    handleSubmited(e);
                  }}
                  sx={userStyle.buttonadd}
                  loading={viewdata == true}
                  loadingPosition="end"
                  variant="contained"
                >
                  <span>Save</span>
                </LoadingButton>
              </Grid>
              <Grid item lg={1} md={2} sm={2} xs={12}>
                <Button sx={userStyle.btncancel} onClick={handlecleared}>
                  Clear
                </Button>
              </Grid>
            </Grid>
          </>
        </Box>
      )}
      {/* } */}
      <br /> <br />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes("lcreateidcard") && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>
                List ID card Preparation
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
                    <MenuItem value={templateCreationArray?.length}>
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
                  {isUserRoleCompare?.includes("excelcreateidcard") && (
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
                  {isUserRoleCompare?.includes("csvcreateidcard") && (
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
                  {isUserRoleCompare?.includes("printcreateidcard") && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("pdfcreateidcard") && (
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
                  {isUserRoleCompare?.includes("imagecreateidcard") && (
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
            {isUserRoleCompare?.includes("bdcreateidcard") && (
              <Button
                variant="contained"
                color="error"
                onClick={handleClickOpenalert}
              >
                Bulk Delete
              </Button>
            )}
            <br />
            <br />
            <Box
              style={{
                width: "100%",
                overflowY: "hidden", // Hide the y-axis scrollbar
              }}
            >
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
              <TableCell>sno</TableCell>
              <TableCell>company</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Person</TableCell>
            </TableRow>
          </TableHead>
          <TableBody align="left">
            {filteredData &&
              filteredData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>

                  <TableCell>{row.company}</TableCell>
                  <TableCell>{row.branch}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell>{row.team}</TableCell>
                  <TableCell>{row.person}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
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
              <b>IDcard Preparation Info</b>
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
              <Button variant="contained" onClick={handleCloseinfo}>
                {" "}
                Back{" "}
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>
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
            onClick={handleCloseMod}
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
            onClick={(e) => delBrand(brandid)}
          >
            {" "}
            OK{" "}
          </Button>
        </DialogActions>
      </Dialog>
      {/* view model */}
      <Dialog
        open={openview}
        onClose={handleClickOpenview}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        fullWidth={true}
      >
        <Box sx={{ padding: "20px 50px" }}>
          <>
            <Typography sx={userStyle.HeaderText}>
              {" "}
              {/* <b>View IDcard Preparation</b> */}
              <b>View IDcard Details</b>
            </Typography>
            <br /> <br />
            <Grid container spacing={2}>
              <>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Company</Typography>
                    <Typography>{documentPreparationEdit.company}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Branch</Typography>
                    <Typography>{documentPreparationEdit.branch}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Unit</Typography>
                    <Typography>{documentPreparationEdit.unit}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Team</Typography>
                    <Typography>{documentPreparationEdit.team}</Typography>
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <Typography variant="h6">Person</Typography>
                    <Typography style={{ marginleft: "50px" }}>
                      {documentPreparationEdit.person
                        ?.map(
                          (t, i) =>
                            // `${i + 1 + "."}` +
                            t
                        )
                        .join(", ")
                        .toString()}
                    </Typography>
                  </FormControl>
                </Grid>
              </>

              {/* <Grid item md={12} xs={12} sm={12}>
                <Typography variant="h6">Employee's Idcard</Typography>
                <Typography>
                  <Grid container spacing={2} sx={{ gap: "17px" }}>
                    {code.map((d, index) => (
                      <Grid item md={2} sm={12} xs={12} sx={{ display: 'flex', flexDirection: 'column', flexBasis: 'auto' }}  key={index}>
                        <div
                          style={{
                            border: "1px solid black",
                            width: "14.2vw",

                            borderRadius: "3px",
                          }}
                        >
                          <div>
                            <img
                              style={{
                                width: "13.5vw",
                                height: "14vh",
                                objectFit: "cover",
                              }}
                              src={viewfrontheader}
                            />
                          </div>
                          <div style={{ marginTop: "1.3vh" }}></div>

                          <div>
                            <img
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                marginLeft: "3.8vw",
                                objectFit: "cover",
                                border: "2px solid black",
                                borderRadius: "4px",

                                width: "6vw",
                                height: "14.7vh",
                              }}
                              src={d.profileimage ? d.profileimage : placeholderImage}  /> 
                            
                          </div>

                          <div style={{ marginTop: "1.4vh" }}></div>
                          <div
                            style={{
                              textAlign: "center",
                              fontSize: "1vw",
                              color: "black",
                              fontWeight: "bold",
                              fontFamily: "sans-serif",
                            }}
                          >
                            <span
                              style={{
                                textTransform: "uppercase",
                                fontWeight: "bolder",
                                color: "black",
                                fontFamily: "sans-serif",
                              }}
                            >
                              {d.legalname}
                            </span>
                          </div>

                          <div
                            style={{
                              marginTop: "4.9vh",
                            }}
                          ></div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "flex-end",
                              // Assuming you want the container to take the full viewport height
                            }}
                          >
                            <img
                              style={{
                                height: "5vh",
                                width: "14vw",
                                objectFit: "cover",
                              }}
                              src={viewfrontfooter}
                            />
                          </div>
                        </div>

                        <div
                          style={{
                            border: "1px solid black",
                            width: "14.2vw",

                            borderRadius: "3px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <img
                              style={{
                                height: "4vh",
                                width: "14vw",
                                objectFit: "cover",
                              }}
                              src={viewbackheader}
                            />
                          </div>
                          <div
                            style={{
                              marginTop: "0.8vh",
                            }}
                          ></div>

                          <div
                            style={{
                              fontSize: "0.7vw",
                              fontWeight: "bold",
                              paddingLeft: "15px",
                              fontFamily: "sans-serif",
                              color: "black",
                            }}
                          >
                            <div>
                              {" "}
                              Employee ID :{" "}
                              <span style={{ color: "darkblue" }}>
                                {d.empcode}
                              </span>
                            </div>
                            <br />
                            <div>
                              Date of Birth :{" "}
                              <span style={{ color: "darkblue" }}>{d.dob}</span>
                            </div>
                            <br />
                            <div>
                              Blood Group :{" "}
                              <span style={{ color: "darkblue" }}>
                                {d.bloodgroup}
                              </span>
                            </div>
                            <br />
                            <div>
                              Emergency Contact(s):{" "}
                              <span style={{ color: "darkblue" }}>
                                {d.emergencyno}
                              </span>
                            </div>
                          </div>

                          <div
                            style={{
                              marginTop: "5vh",
                            }}
                          ></div>

                          <div
                            style={{
                              fontFamily: "neuropol",
                              color: "darkblue",
                              fontSize: "0.7vw",
                              textAlign: "center",
                              fontWeight: "bolder",
                              // whiteSpace: "nowrap",
                            }}
                          >
                            {" "}
                            {newcomp}
                          </div>
                          <div
                            style={{
                              marginTop: "0.5vh",
                            }}
                          ></div>
                          <div
                            style={{
                              fontSize: "0.7vw",
                              textAlign: "center",

                              fontWeight: "bolder",
                              fontFamily: "sans-serif",
                              color: "black",
                            }}
                          >
                            {" "}
                            {newadd}
                          </div>
                          <div
                            style={{
                              marginTop: "0.5vh",
                            }}
                          ></div>

                          <div
                            style={{
                              fontSize: "0.7vw",
                              color: "orange",
                              textAlign: "center",

                              fontFamily: "sans-serif",
                            }}
                          >
                            {newcomurl}
                          </div>
                          <div
                            style={{
                              marginTop: "0.5vh",
                            }}
                          ></div>
                          <div style={{ fontWeight: "bold" }}>
                            <hr />
                          </div>
                          <div
                            style={{
                              marginTop: "0.5vh",
                            }}
                          ></div>

                          <div
                            style={{
                              textAlign: "center",
                              fontSize: "0.7vw",
                              fontFamily: "sans-serif",
                              color: "black",
                            }}
                          >
                            {"This card is a property"}
                          </div>
                          <div
                            style={{
                              fontFamily: "neuropol",
                              color: "darkblue",
                              textAlign: "center",
                              fontSize: "0.8vw",
                              fontWeight: "bolder",
                            }}
                          >
                            {" "}
                            {newcomp}
                          </div>
                          <div
                            style={{
                              textAlign: "center",
                              fontSize: "0.7vw",
                              fontFamily: "sans-serif",
                              color: "black",
                            }}
                          >
                            {"If found, please return to the above address"}
                          </div>
                          <div
                            style={{
                              marginTop: "0.5vh",
                            }}
                          ></div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "flex-end",
                            }}
                          >
                            <img
                              style={{
                                height: "5vh",
                                width: "14vw",
                                justifyContent: "end",

                                objectFit: "cover",
                              }}
                              src={viewbackfooter}
                            />
                          </div>
                        </div>
                      </Grid>
                    ))}
                  </Grid>
                </Typography>
              </Grid> */}
            </Grid>
            <br />
            <br /> <br />
            <br />
            <Grid container spacing={2} sx={{ marginLeft: "3px" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCloseview}
              >
                Back
              </Button>
            </Grid>
          </>
        </Box>
      </Dialog>
      <Dialog
        open={openviewed}
        onClose={handleClickOpenviewed}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
      // fullWidth={true}
      >
        <Box sx={{ padding: "20px 50px" }}>
          <>
            <Typography sx={userStyle.HeaderText}>
              {" "}
              <b>View IDcard's</b>
            </Typography>
            <br /> <br />

            <Grid container spacing={2}>
              <Grid item md={12} xs={12} sm={12}>
                <Typography variant="h6">Employee's Idcard</Typography>
                <Typography>
                  <Grid
                    container
                    spacing={3}
                    sx={{ gap: "10px", display: 'flex', flexWrap: 'wrap' }}
                    ref={componentRef2}
                  >
                    {code.map((d, index) => (
                      <Grid item md={2} sm={12} xs={12}
                        sx={{ flex: '1 1 10%', margin: '3%', boxSizing: 'border-box', padding: '40px 10px' }}>
                        <div
                          style={{
                            border: "1px solid black",
                            width: "14.2vw",
                            borderRadius: "3px",
                          }}
                        >
                          <div>
                            <img
                              style={{
                                width: "13.5vw",
                                height: "14vh",
                                objectFit: "cover",
                              }}
                              src={viewfrontheader}
                            />
                          </div>
                          <div style={{ marginTop: "1.3vh" }}></div>

                          <div>
                            <img
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                marginLeft: "3.8vw",
                                objectFit: "cover",
                                border: "2px solid black",
                                borderRadius: "4px",

                                width: "6vw",
                                height: "14.7vh",
                              }}
                              src={d.profileimage ? d.profileimage : placeholderImage} />

                          </div>

                          <div style={{ marginTop: "1.4vh" }}></div>
                          <div
                            style={{
                              textAlign: "center",
                              fontSize: "1vw",
                              color: "black",
                              fontWeight: "bold",
                              fontFamily: "sans-serif",
                            }}
                          >
                            <span
                              style={{
                                textTransform: "uppercase",
                                fontWeight: "bolder",
                                color: "black",
                                fontFamily: "sans-serif",
                              }}
                            >
                              {d.legalname}
                            </span>
                          </div>

                          <div
                            style={{
                              marginTop: "3.8vh",
                            }}
                          ></div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "flex-end",
                              // Assuming you want the container to take the full viewport height
                            }}
                          >
                            <img
                              style={{
                                height: "5vh",
                                width: "14vw",
                                objectFit: "cover",
                              }}
                              src={viewfrontfooter}
                            />
                          </div>
                        </div>

                        <div
                          style={{
                            border: "1px solid black",
                            width: "14.2vw",

                            borderRadius: "3px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <img
                              style={{
                                height: "4vh",
                                width: "14vw",
                                objectFit: "cover",
                              }}
                              src={viewbackheader}
                            />
                          </div>
                          <div
                            style={{
                              marginTop: "0.8vh",
                            }}
                          ></div>

                          <div
                            style={{
                              fontSize: "0.7vw",
                              fontWeight: "bold",
                              paddingLeft: "15px",
                              fontFamily: "sans-serif",
                              color: "black",
                            }}
                          >
                            <div>
                              {" "}
                              Employee ID :{" "}
                              <span style={{ color: "darkblue" }}>
                                {d.empcode}
                              </span>
                            </div>

                            <div>
                              Date of Birth :{" "}
                              <span style={{ color: "darkblue" }}>{d.dob}</span>
                            </div>

                            <div>
                              Blood Group :{" "}
                              <span style={{ color: "darkblue" }}>
                                {d.bloodgroup}
                              </span>
                            </div>

                            <div>
                              Emergency Contact(s):{" "}
                              <span style={{ color: "darkblue" }}>
                                {d.emergencyno}
                              </span>
                            </div>
                          </div>

                          <div
                            style={{
                              marginTop: "4.3vh",
                            }}
                          ></div>

                          <div
                            style={{
                              fontFamily: "neuropol",
                              color: "darkblue",
                              fontSize: "0.7vw",
                              textAlign: "center",
                              fontWeight: "bolder",
                              // whiteSpace: "nowrap",
                            }}
                          >
                            {" "}
                            {newcomp}
                          </div>
                          <div
                            style={{
                              marginTop: "0.5vh",
                            }}
                          ></div>
                          <div
                            style={{
                              fontSize: "0.7vw",
                              textAlign: "center",

                              fontWeight: "bolder",
                              fontFamily: "sans-serif",
                              color: "black",
                            }}
                          >
                            {" "}
                            {newadd}
                          </div>
                          <div
                            style={{
                              marginTop: "0.5vh",
                            }}
                          ></div>

                          <div
                            style={{
                              fontSize: "0.7vw",
                              color: "orange",
                              textAlign: "center",

                              fontFamily: "sans-serif",
                            }}
                          >
                            {newcomurl}
                          </div>
                          <div
                            style={{
                              marginTop: "0.5vh",
                            }}
                          ></div>
                          <div style={{ fontWeight: "bold" }}>
                            <hr />
                          </div>
                          <div
                            style={{
                              marginTop: "0.5vh",
                            }}
                          ></div>

                          <div
                            style={{
                              textAlign: "center",
                              fontSize: "0.7vw",
                              fontFamily: "sans-serif",
                              color: "black",
                            }}
                          >
                            {"This card is a property"}
                          </div>
                          <div
                            style={{
                              fontFamily: "neuropol",
                              color: "darkblue",
                              textAlign: "center",
                              fontSize: "0.8vw",
                              fontWeight: "bolder",
                            }}
                          >
                            {" "}
                            {newcomp}
                          </div>
                          <div
                            style={{
                              textAlign: "center",
                              fontSize: "0.7vw",
                              fontFamily: "sans-serif",
                              color: "black",
                            }}
                          >
                            {"If found, please return to the above address"}
                          </div>
                          <div
                            style={{
                              marginTop: "0.5vh",
                            }}
                          ></div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "flex-end",
                            }}
                          >
                            <img
                              style={{
                                height: "5vh",
                                width: "14vw",
                                justifyContent: "end",

                                objectFit: "cover",
                              }}
                              src={viewbackfooter}
                            />
                          </div>
                        </div>
                      </Grid>
                    ))}
                  </Grid>
                </Typography>
              </Grid>
            </Grid>
            <br /> <br /> <br />
            <Grid
              container
              spacing={2}
              sx={{ marginLeft: "3px", display: "flex" }}
            >
              <Grid item md={12} xs={12} sm={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    downloadPdfTesdt(e);
                  }}
                >
                  Download
                </Button>
              </Grid>
              <Grid item md={12} xs={12} sm={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCloseviewed}
                >
                  Back
                </Button>
              </Grid>
            </Grid>
            <br />
            <br /> <br />
            <br />
          </>
        </Box>
      </Dialog>
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
      {/* Bulk delete ALERT DIALOG */}
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
          <Typography variant="h6" sx={{ color: "black", textAlign: "center" }}>
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
              onClick={(e) => delAreagrpcheckbox(e)}
            >
              {" "}
              OK{" "}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <br />
      {/*Export XL Data  */}
      <Dialog
        open={isFilterOpen}
        onClose={handleCloseFilterMod}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent
          sx={{
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseFilterMod}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          {fileFormat === "csv" ? (
            <FaFileCsv style={{ fontSize: "80px", color: "green" }} />
          ) : (
            <FaFileExcel style={{ fontSize: "80px", color: "green" }} />
          )}
          <Typography variant="h5" sx={{ textAlign: "center" }}>
            Choose Export
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            variant="contained"
            onClick={(e) => {
              handleExportXL("filtered");
            }}
          >
            Export Filtered Data
          </Button>
          <Button
            autoFocus
            variant="contained"
            onClick={(e) => {
              handleExportXL("overall");
              // fetchProductionClientRateArray();
            }}
          >
            Export Over All Data
          </Button>
        </DialogActions>
      </Dialog>
      {/*Export pdf Data  */}
      <Dialog
        open={isPdfFilterOpen}
        onClose={handleClosePdfFilterMod}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent
          sx={{
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleClosePdfFilterMod}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <PictureAsPdfIcon sx={{ fontSize: "80px", color: "red" }} />
          <Typography variant="h5" sx={{ textAlign: "center" }}>
            Choose Export
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={(e) => {
              downloadPdf("filtered");
              setIsPdfFilterOpen(false);
            }}
          >
            Export Filtered Data
          </Button>
          <Button
            variant="contained"
            onClick={(e) => {
              downloadPdf("overall");
              setIsPdfFilterOpen(false);
            }}
          >
            Export Over All Data
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default Createidcard;
