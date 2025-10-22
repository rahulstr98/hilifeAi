import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Button,
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
import moment from "moment-timezone";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaEdit, FaFileCsv, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import Selects from "react-select";
import { useReactToPrint } from "react-to-print";
import AlertDialog from "../../components/Alert.js";
import ExportData from "../../components/ExportData";
import MessageAlert from "../../components/MessageAlert.js";
import { handleApiError } from "../../components/Errorhandling";
import Headtitle from "../../components/Headtitle";
import {
  AuthContext,
  UserRoleAccessContext,
} from "../../context/Appcontext";
import { userStyle } from "../../pageStyle";
import { SERVICE } from "../../services/Baseservice";
import AggregatedSearchBar from '../../components/AggregatedSearchBar';
import AggridTable from "../../components/AggridTable";
import domtoimage from 'dom-to-image';

function LoginAllotedList({ isProjectvendor, checkLoad, searchQueryclear, setSearchQueryclear }) {


  const [filteredRowData, setFilteredRowData] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState(null);

  const [loginAllottedList, setLoginAllotedList] = useState([]);
  let today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  let formattedDate = yyyy + "-" + mm + "-" + dd;

  const [loader, setLoader] = useState(true);

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
  };

  const [fileFormat, setFormat] = useState("");

  let exportColumnNames = [
    "User ID",
    "Employee Code",
    "Employee Name",
    "Project Vendor",
  ];
  let exportRowValues =
    [
      "userid",
      "empcode",
      "empname",
      "projectvendor"
    ];


  const [employeenamesSecond, setEmployeenamesSecond] = useState([]);
  const [loginAllotted, setLoginAllotted] = useState([]);
  const [loginAllottedCheckDup, setLoginAllottedCheckDup] = useState([]);

  const backLpage = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [groupData, setGroupData] = useState([]);
  const {
    isUserRoleCompare,
    isUserRoleAccess,
    isAssignBranch,
    allUnit,
    allTeam,
    allCompany,
    allBranch,
    buttonStyles
  } = useContext(UserRoleAccessContext);
  const { auth } = useContext(AuthContext);

  const username = isUserRoleAccess.username;

  const gridRef = useRef(null);

  const [selectedRows, setSelectedRows] = useState([]);

  const [searchQueryManage, setSearchQueryManage] = useState("");

  const gridRefTableImg = useRef(null);
  // image
  const handleCaptureImage = () => {
    if (gridRefTableImg.current) {
      domtoimage.toBlob(gridRefTableImg.current)
        .then((blob) => {
          saveAs(blob, "loginallotList.png");
        })
        .catch((error) => {
          console.error("dom-to-image error: ", error);
        });
    }
  };


  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchedString, setSearchedString] = useState("")
  const gridRefTable = useRef(null);
  const [isHandleChange, setIsHandleChange] = useState(false);


  // Error Popup model
  const [isErrorOpenpop, setIsErrorOpenpop] = useState(false);
  const [showAlertpop, setShowAlertpop] = useState();
  const handleClickOpenerrpop = () => {
    setIsErrorOpenpop(true);
  };
  const handleCloseerrpop = () => {
    setIsErrorOpenpop(false);
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
    userid: true,
    empcode: true,
    empname: true,
    projectvendor: true,
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

  const [filteredBranchOptions, setFilteredBranchOptions] = useState([]);
  const [filteredUnitOptions, setFilteredUnitOptions] = useState([]);
  const [filteredTeamOptions, setFilteredTeamOptions] = useState([]);

  const filterBranch = async (e) => {
    try {
      let branchall;
      if (e === "ALL") {
        branchall = isAssignBranch
          .map((u, index) => ({
            ...u,
            label: u.branch,
            value: u.branch,
            index: index,
          }))
          .filter(
            (item, index, arr) =>
              index === arr.findIndex((el) => el.branch === item.branch)
          );
        setFilteredBranchOptions([
          ...(isUserRoleAccess?.role?.includes("Manager")
            ? [{ label: "ALL", value: "ALL" }]
            : []),
          ...branchall,
        ]);
      } else {
        branchall = isAssignBranch
          ?.filter((u) => u.company === e)
          .map((u, index) => ({
            ...u,
            label: u.branch,
            value: u.branch,
            index: index,
          }))
          .filter(
            (item, index, arr) =>
              index === arr.findIndex((el) => el.branch === item.branch)
          );
        setFilteredBranchOptions([
          ...(isUserRoleAccess?.role?.includes("Manager")
            ? [{ label: "ALL", value: "ALL" }]
            : []),
          ...branchall,
        ]);
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const filterUnit = async (company, e) => {
    try {
      let unitall;
      if (company === "ALL" && e === "ALL") {
        unitall = isAssignBranch.map((u) => ({
          ...u,
          label: u.unit,
          value: u.unit,
        }));
        setFilteredUnitOptions([
          ...(isUserRoleAccess?.role?.includes("Manager")
            ? [{ label: "ALL", value: "ALL" }]
            : []),
          ...unitall,
        ]);
      } else if (company !== "ALL" && e === "ALL") {
        unitall = isAssignBranch?.map((u) => ({
          ...u,
          label: u.unit,
          value: u.unit,
        }));
        setFilteredUnitOptions([
          ...(isUserRoleAccess?.role?.includes("Manager")
            ? [{ label: "ALL", value: "ALL" }]
            : []),
          ...unitall,
        ]);
      } else if (company === "ALL" && e !== "ALL") {
        unitall = isAssignBranch
          ?.filter((u) => u.branch === e)
          .map((u) => ({
            ...u,
            label: u.unit,
            value: u.unit,
          }));
        setFilteredUnitOptions([
          ...(isUserRoleAccess?.role?.includes("Manager")
            ? [{ label: "ALL", value: "ALL" }]
            : []),
          ...unitall,
        ]);
      } else if (company !== "ALL" && e !== "ALL") {
        unitall = isAssignBranch
          ?.filter((u) => u.branch === e)
          .map((u) => ({
            ...u,
            label: u.unit,
            value: u.unit,
          }));
        setFilteredUnitOptions([
          ...(isUserRoleAccess?.role?.includes("Manager")
            ? [{ label: "ALL", value: "ALL" }]
            : []),
          ...unitall,
        ]);
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  const filterTeam = async (company, branch, e) => {
    try {
      let teamall;
      if (company === "ALL" && branch === "ALL" && e === "ALL") {
        teamall = allTeam.map((u) => ({
          ...u,
          label: u.teamname,
          value: u.teamname,
        }));
        setFilteredTeamOptions([
          ...(isUserRoleAccess?.role?.includes("Manager")
            ? [{ label: "ALL", value: "ALL" }]
            : []),
          ...teamall,
        ]);
      } else if (company !== "ALL" && branch === "ALL" && e === "ALL") {
        teamall = allTeam
          ?.filter((u) => u.company === company)
          .map((u) => ({
            ...u,
            label: u.teamname,
            value: u.teamname,
          }));
        setFilteredTeamOptions([
          ...(isUserRoleAccess?.role?.includes("Manager")
            ? [{ label: "ALL", value: "ALL" }]
            : []),
          ...teamall,
        ]);
      } else if (company !== "ALL" && branch === "ALL" && e !== "ALL") {
        teamall = allTeam
          ?.filter((u) => u.company === company && u.unit === e)
          .map((u) => ({
            ...u,
            label: u.teamname,
            value: u.teamname,
          }));
        setFilteredTeamOptions([
          ...(isUserRoleAccess?.role?.includes("Manager")
            ? [{ label: "ALL", value: "ALL" }]
            : []),
          ...teamall,
        ]);
      } else if (company !== "ALL" && branch !== "ALL" && e === "ALL") {
        teamall = allTeam
          ?.filter((u) => u.company === company && u.branch === branch)
          .map((u) => ({
            ...u,
            label: u.teamname,
            value: u.teamname,
          }));
        setFilteredTeamOptions([
          ...(isUserRoleAccess?.role?.includes("Manager")
            ? [{ label: "ALL", value: "ALL" }]
            : []),
          ...teamall,
        ]);
      } else if (company === "ALL" && branch !== "ALL" && e !== "ALL") {
        teamall = allTeam
          ?.filter((u) => u.branch === branch && u.unit === e)
          .map((u) => ({
            ...u,
            label: u.teamname,
            value: u.teamname,
          }));
        setFilteredTeamOptions([
          ...(isUserRoleAccess?.role?.includes("Manager")
            ? [{ label: "ALL", value: "ALL" }]
            : []),
          ...teamall,
        ]);
      } else if (company === "ALL" && branch !== "ALL" && e === "ALL") {
        teamall = allTeam
          ?.filter((u) => u.branch === branch)
          .map((u) => ({
            ...u,
            label: u.teamname,
            value: u.teamname,
          }));
        setFilteredTeamOptions([
          ...(isUserRoleAccess?.role?.includes("Manager")
            ? [{ label: "ALL", value: "ALL" }]
            : []),
          ...teamall,
        ]);
      } else if (company === "ALL" && branch === "ALL" && e !== "ALL") {
        teamall = allTeam
          ?.filter((u) => u.unit === e)
          .map((u) => ({
            ...u,
            label: u.teamname,
            value: u.teamname,
          }));
        setFilteredTeamOptions([
          ...(isUserRoleAccess?.role?.includes("Manager")
            ? [{ label: "ALL", value: "ALL" }]
            : []),
          ...teamall,
        ]);
      } else {
        teamall = allTeam
          ?.filter(
            (u) => u.company === company && u.branch === branch && u.unit === e
          )
          .map((u) => ({
            ...u,
            label: u.teamname,
            value: u.teamname,
          }));
        setFilteredTeamOptions([
          ...(isUserRoleAccess?.role?.includes("Manager")
            ? [{ label: "ALL", value: "ALL" }]
            : []),
          ...teamall,
        ]);
      }
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  const fetchLoginAllotedList = async () => {
    try {
      setLoader(true);
      let res = await axios.get(SERVICE.ALL_CLIENTUSERIDDATA, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let grpUser = await axios.get(SERVICE.USERS_LOGIN, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      const resultGroup = [];
      const answer = res?.data?.clientuserid.filter(
        (item) => item.allotted === "allotted"
      );
      let ans = answer.forEach((item1) => {
        // Find the corresponding item in the second array
        const matchingItem = grpUser.data.users.find(
          (item2) => item1.empname === item2.companyname
        );
        // If a match is found, combine the properties
        if (matchingItem) {
          resultGroup.push({
            _id: item1._id,
            projectvendor: item1.projectvendor,
            userid: item1.userid,
            password: item1.password,
            company: item1.company,
            branch: item1.branch,
            unit: item1.unit,
            empname: item1.empname,
            empcode: matchingItem.empcode,
            team: item1.team,
            updatedby: item1.updatedby,
            addedby: item1.addedby,
          });
        }
      });

      setLoginAllotedList(resultGroup.filter(
        (item) =>
          isProjectvendor.includes(item.projectvendor)
      )?.map((item, index) => ({
        ...item,
        serialNumber: index + 1,
        userid: item.userid,
        empcode: item.empcode === "undefined" ? "" : item.empcode,
        empname: item.empname,
      })));

      setLoader(false);
    } catch (err) {
      setLoader(false);
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  useEffect(() => {
    fetchLoginAllotedList();

  }, [checkLoad, isProjectvendor]);

  useEffect(() => {
    setSearchQuery("")
    // fetchLoginAllotedList();
    setLoginAllotedList([])
    setSearchQueryclear("")
  }, [searchQueryclear === "Clear"])

  //Edit model...
  const [isEditOpen, setIsEditOpen] = useState(false);
  const handleClickOpenEdit = () => {
    setIsEditOpen(true);
  };
  const handleCloseModEdit = (e, reason) => {
    if (reason && reason === "backdropClick") return;
    setIsEditOpen(false);
    setFilteredBranchOptions([]);
    setFilteredUnitOptions([]);
    setFilteredTeamOptions([]);
    setEmployeenamesSecond([]);
  };

  //get single row to edit....
  const getCode = async (e, name) => {
    try {
      let res = await axios.get(`${SERVICE.SINGLE_CLIENTUSERID}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setLoginAllotted(res?.data?.sclientuserid);
      setLoginAllottedCheckDup(res?.data?.sclientuserid?.loginallotlog);
      filterBranch(res?.data?.sclientuserid.company);
      filterUnit(
        res?.data?.sclientuserid.company,
        res?.data?.sclientuserid.branch
      );
      filterTeam(
        res?.data?.sclientuserid.company,
        res?.data?.sclientuserid.branch,
        res?.data?.sclientuserid.unit
      );
      fetchAllEmployeeSecond(
        res?.data?.sclientuserid.company,
        res?.data?.sclientuserid.branch,
        res?.data?.sclientuserid.unit,
        res?.data?.sclientuserid.date,
        res?.data?.sclientuserid.team
      );
      handleClickOpenEdit();

    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  //get all Employeename.
  const fetchAllEmployeeSecond = async (company, branch, unit, date, e) => {
    try {
      let res_module = await axios.post(SERVICE.USEREMP_TEAMGROUP, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
        company: company,
        branch: branch,
        unit: unit,
        date: date,
        team: e,
      });

      setEmployeenamesSecond(
        res_module.data.userteamgroup
          .filter((item) => item.reasonablestatus === undefined)
          .map((data) => ({
            // ...data,
            label: data.companyname,
            value: data.companyname,
            empcode: data.empcode,
            company: data.company,
            branch: data.branch,
            unit: data.unit,
            team: data.team,
          }))
      );
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  let singleData = {};
  const sendRequest = async (id) => {
    try {
      let res = await axios.get(`${SERVICE.SINGLE_CLIENTUSERID}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      singleData = res?.data?.sclientuserid;
      const requestData = {};

      if (
        singleData.loginallotlog.length === 0 &&
        singleData.loginallotlog.length !== 0
      ) {
        requestData.loginallotlog = [
          ...singleData.loginallotlog,
          {
            branch: String(singleData.branch),
            company: String(singleData.company),
            unit: String(singleData.unit),
            team: String(singleData.team),
            empname: String(singleData.empname),
            empcode: String(singleData.empcode),
            date: singleData.date,
            time: singleData.time,
            userid: singleData.userid, // Fixed the field names
          },
        ];
      } else {
        window.open(`/updatepages/loginallotedlist/${singleData._id}`);

        return;
      }

      const headers = {
        Authorization: `Bearer ${auth.APIToken}`,
      };

      // Use Promise.all to make asynchronous operations concurrent
      await Promise.all([
        // Send the PUT request
        axios.put(
          `${SERVICE.SINGLE_CLIENTUSERID}/${singleData._id}`,
          requestData,
          { headers }
        ),
        // Fetch the updated designationlog data
        fetchLoginAllotedList(),
      ]);

      // Redirect after all asynchronous operations are completed
      backLpage(`/updatepages/loginnotallotlist/${singleData._id}`);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };
  // get single row to view....
  const getviewCode = async (e) => {
    try {
      let res = await axios.get(`${SERVICE.SINGLE_CLIENTUSERID}/${e}`, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      handleClickOpenEdit();
      setLoginAllotted(res?.data?.sclientuserid);
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };

  let updateby = loginAllotted.updatedby;
  let addedby = loginAllotted.addedby;

  let projectsid = loginAllotted._id;

  //editing the single data...
  const sendEditRequest = async () => {
    try {
      let res = await axios.put(
        `${SERVICE.SINGLE_CLIENTUSERID}/${projectsid}`,
        {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          company: String(loginAllotted?.employeecompany),
          branch: String(loginAllotted?.employeebranch),
          unit: String(loginAllotted?.employeeunit),
          team: String(loginAllotted?.employeeteam),
          empname: String(loginAllotted.empname),
          empcode: String(loginAllotted.empcode),
          date: String(loginAllotted.date),
          time: String(moment().format("HH:mm")),
          userid: loginAllotted.userid,
          allotted: "allotted",
          loginallotlog: [
            ...loginAllotted.loginallotlog,
            {
              company: String(loginAllotted?.employeecompany),
              branch: String(loginAllotted?.employeebranch),
              unit: String(loginAllotted?.employeeunit),
              team: String(loginAllotted?.employeeteam),
              empname: String(loginAllotted.empname),
              empcode: String(loginAllotted.empcode),
              date: loginAllotted.date,
              time: String(moment().format("HH:mm")),
              userid: loginAllotted.userid, // Fixed the field names
              addedby: [
                {
                  name: String(isUserRoleAccess?.companyname),
                  date: String(new Date()),
                },
              ],
            },
          ],
          updatedby: [
            ...updateby,
            {
              name: String(isUserRoleAccess.companyname),
              date: String(new Date()),
            },
          ],
        }
      );
      setFilteredBranchOptions([]);
      setFilteredUnitOptions([]);
      setFilteredTeamOptions([]);
      setEmployeenamesSecond([]);
      // setLoginNotAllotEdit(res.data);
      await fetchLoginAllotedList();
      handleCloseModEdit();
    } catch (err) {
      handleApiError(err, setPopupContentMalert, setPopupSeverityMalert, handleClickOpenPopupMalert);
    }
  };


  const editSubmit = (e) => {
    e.preventDefault();
    // const isNameMatch = allGroupEdit.some(item => item.name.toLowerCase() === (loginNotAllotEdit.name).toLowerCase());

    const IsDataMatch = loginAllottedCheckDup?.some((item) => item?.userid === loginAllotted.userid && item?.date === loginAllotted.date)


    if (loginAllotted.date === "" || !loginAllotted.date) {
      setPopupContentMalert("Please Select Date");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (loginAllotted.company === "Please Select Company" || loginAllotted.company === "" || !loginAllotted.company) {

      setPopupContentMalert("Please Select Branch");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (loginAllotted.branch === "Please Select Branch") {

      setPopupContentMalert("Please Select Branch");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else if (
      loginAllotted.unit === "Please Select Unit" ||
      loginAllotted.unit === ""
    ) {
      setPopupContentMalert("Please Select Unit");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      loginAllotted.team === "Please Select Team" ||
      loginAllotted.team === ""
    ) {
      setPopupContentMalert("Please Select Team");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (
      loginAllotted.empname === "Please Select Person" ||
      loginAllotted.empname === ""
    ) {
      setPopupContentMalert("Please Select Person");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    } else if (IsDataMatch) {
      setPopupContentMalert("Date Can not be same as prev logs!");
      setPopupSeverityMalert("info");
      handleClickOpenPopupMalert();
    }
    else {
      sendEditRequest();
    }
  };

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Login_Allot_List",
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

  const addSerialNumber = (datas) => {
    setItems(datas);
  };
  useEffect(() => {
    addSerialNumber(loginAllottedList);
  }, [loginAllottedList]);


  //table sorting
  const [sorting, setSorting] = useState({ column: "", direction: "" });

  items.sort((a, b) => {
    if (sorting.direction === "asc") {
      return a[sorting.column] > b[sorting.column] ? 1 : -1;
    } else if (sorting.direction === "desc") {
      return a[sorting.column] < b[sorting.column] ? 1 : -1;
    }
    return 0;
  });

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setSelectedRows([]);
    setSelectAllChecked(false);
    setPage(1);
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


  const columnDataTable = [
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
      field: "userid",
      headerName: "User Id",
      flex: 0,
      width: 250,
      hide: !columnVisibility.userid,
      headerClassName: "bold-header",
      pinned: 'left',

    },
    {
      field: "empcode",
      headerName: "Employee Code",
      flex: 0,
      width: 250,
      hide: !columnVisibility.empcode,
      headerClassName: "bold-header",
    },
    {
      field: "empname",
      headerName: "Employee Name",
      flex: 0,
      width: 250,
      hide: !columnVisibility.empname,
      headerClassName: "bold-header",
    },
    {
      field: "projectvendor",
      headerName: "Project Vendor",
      flex: 0,
      width: 250,
      hide: !columnVisibility.projectvendor,
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
          {isUserRoleCompare?.includes("vloginallot") && (
            <Button
              variant="contained"
              sx={{
                minWidth: "15px",
                padding: "6px 5px",
              }}
              onClick={() => {
                sendRequest(params.data.id);
                // getviewCode(params.data.id);
              }}
            >
              <MenuIcon style={{ fontsize: "small" }} />
            </Button>
          )}
          &ensp;
          {isUserRoleCompare?.includes("eloginallot") && (
            <Button
              style={{
                backgroundColor: "red",
                minWidth: "15px",
                padding: "6px 5px",
              }}
              onClick={(e) => {
                getCode(params.data.id, params.data.name);
              }}
            >
              <FaEdit style={{ color: "white", fontSize: "18px" }} />
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
      userid: item.userid,
      empcode: item.empcode,
      empname: item.empname,
      projectvendor: item.projectvendor,
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
      <Headtitle title={"Login Allot"} />
      {/* ****** Header Content ****** */}

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
              {/* <DialogContent sx={{ width: '550px', padding: '20px' }}> */}
              <Typography sx={userStyle.HeaderText}>
                Login Allot Entry
              </Typography>
              <Grid container spacing={2}>
                <Grid item md={3} xs={12} sm={12}>
                  <Typography>User Id</Typography>
                  <FormControl fullWidth size="small">
                    <OutlinedInput
                      id="component-outlined"
                      type="text"
                      placeholder="User Id"
                      value={loginAllotted.userid}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <Typography>
                    Date<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <FormControl fullWidth size="small">
                    <OutlinedInput
                      id="component-outlined"
                      type="date"
                      placeholder="Date"
                      value={loginAllotted.date}
                      onChange={(e) => {
                        setLoginAllotted({
                          ...loginAllotted,
                          date: e.target.value,
                          company: "Please Select Company",
                          branch: "Please Select Branch",
                          unit: "Please Select Unit",
                          team: "Please Select Team",
                          empname: "Please Select Person",
                        });
                        setEmployeenamesSecond([]);
                        setFilteredUnitOptions([]);
                        setFilteredTeamOptions([]);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <Typography>
                    Company<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Selects
                      options={[
                        ...(isUserRoleAccess?.role?.includes("Manager")
                          ? [{ label: "ALL", value: "ALL" }]
                          : []),
                        ...isAssignBranch
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
                          }),
                      ]}
                      value={{
                        label: loginAllotted.company,
                        value: loginAllotted.company,
                      }}
                      onChange={(e) => {
                        setLoginAllotted({
                          ...loginAllotted,
                          company: e.value,
                          branch: "Please Select Branch",
                          unit: "Please Select Unit",
                          team: "Please Select Team",
                          empname: "Please Select Person",
                        });
                        filterBranch(e.value);
                        setEmployeenamesSecond([]);
                        setFilteredUnitOptions([]);
                        setFilteredTeamOptions([]);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <Typography>
                    Branch<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Selects
                      options={filteredBranchOptions}
                      value={{
                        label: loginAllotted.branch,
                        value: loginAllotted.branch,
                      }}
                      onChange={(e) => {
                        setLoginAllotted({
                          ...loginAllotted,
                          branch: e.value,
                          unit: "Please Select Unit",
                          team: "Please Select Team",
                          empname: "Please Select Person",
                        });
                        setEmployeenamesSecond([]);
                        filterUnit(loginAllotted.company, e.value);
                        setFilteredTeamOptions([]);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <Typography>
                    Unit<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Selects
                      options={filteredUnitOptions}
                      value={{
                        label: loginAllotted.unit,
                        value: loginAllotted.unit,
                      }}
                      onChange={(e) => {
                        setLoginAllotted({
                          ...loginAllotted,
                          unit: e.value,
                          team: "Please Select Team",
                          empname: "Please Select Person",
                        });
                        filterTeam(
                          loginAllotted.company,
                          loginAllotted.branch,
                          e.value
                        );
                        setEmployeenamesSecond([]);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <Typography>
                    Team<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Selects
                      options={filteredTeamOptions}
                      value={{
                        label: loginAllotted.team,
                        value: loginAllotted.team,
                      }}
                      onChange={(e) => {
                        setLoginAllotted({
                          ...loginAllotted,
                          team: e.value,
                          empname: "Please Select Person",
                        });
                        fetchAllEmployeeSecond(
                          loginAllotted.company,
                          loginAllotted.branch,
                          loginAllotted.unit,
                          loginAllotted.date,
                          e.value
                        );
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item md={3} xs={12} sm={12}>
                  <Typography>
                    Employee Name<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Selects
                      options={employeenamesSecond}
                      value={{
                        label: loginAllotted.empname,
                        value: loginAllotted.empname,
                      }}
                      onChange={(e) => {
                        setLoginAllotted({
                          ...loginAllotted,
                          empname: e.value,
                          empcode: e.empcode,
                          employeecompany: e.company,
                          employeebranch: e.branch,
                          employeeunit: e.unit,
                          employeeteam: e.team,
                        });
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <br />

              {/* <Typography sx={{ color: "red" }}> {editCalOverall}</Typography> */}
              <br />

              <Grid container spacing={2}>
                <Grid item md={6} xs={12} sm={12}>
                  <Button
                    variant="contained"
                    sx={buttonStyles.buttonsubmit}

                    onClick={editSubmit}
                  >
                    Change
                  </Button>
                </Grid>
                <Grid item md={6} xs={6} sm={6}>
                  <Button sx={buttonStyles.btncancel} onClick={handleCloseModEdit}>
                    Cancel
                  </Button>
                </Grid>
              </Grid>
              {/* </DialogContent> */}
            </>
          </Box>
        </Dialog>
      </Box>
      <br />
      {/* ****** Table Start ****** */}
      {isUserRoleCompare?.includes("lloginallot") && (
        <>
          <Box sx={userStyle.container}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>
                Login Allot List
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
                    <MenuItem value={loginAllottedList?.length}>All</MenuItem>
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
                  {isUserRoleCompare?.includes("excelloginallot") && (
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
                  {isUserRoleCompare?.includes("csvloginallot") && (
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
                  {isUserRoleCompare?.includes("printloginallot") && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("pdfloginallot") && (
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
                  {isUserRoleCompare?.includes("imageloginallot") && (
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

                <AggregatedSearchBar
                  columnDataTable={columnDataTable}
                  setItems={setItems}
                  addSerialNumber={addSerialNumber}
                  setPage={setPage}
                  maindatas={loginAllottedList}
                  setSearchedString={setSearchedString}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  paginated={false}
                  totalDatas={loginAllottedList}
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
            <br />
            <br />
            {loader ? (
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
                  itemsList={loginAllottedList}
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
              onClick={() => {
                sendEditRequest();
                handleCloseerrpop();
              }}
            >
              ok
            </Button>
            <Button
              style={{
                backgroundColor: "#f4f4f4",
                color: "#444",
                boxShadow: "none",
                borderRadius: "3px",
                padding: "7px 13px",
                border: "1px solid #0000006b",
                "&:hover": {
                  "& .css-bluauu-MuiButtonBase-root-MuiButton-root": {
                    backgroundColor: "#f4f4f4",
                  },
                },
              }}
              onClick={handleCloseerrpop}
            >
              Cancel
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
            <Button variant="contained" color="error" onClick={handleCloseerr}>
              ok
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <ExportData
        isFilterOpen={isFilterOpen}
        handleCloseFilterMod={handleCloseFilterMod}
        fileFormat={fileFormat}
        setIsFilterOpen={setIsFilterOpen}
        isPdfFilterOpen={isPdfFilterOpen}
        setIsPdfFilterOpen={setIsPdfFilterOpen}
        handleClosePdfFilterMod={handleClosePdfFilterMod}
        filteredDataTwo={(filteredChanges !== null ? filteredRowData : rowDataTable) ?? []}
        itemsTwo={loginAllottedList ?? []}
        filename={"Login Allot"}
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
    </Box>
  );
}

export default LoginAllotedList;