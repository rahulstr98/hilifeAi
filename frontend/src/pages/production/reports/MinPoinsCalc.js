import React, { useState, useEffect, useRef, useContext } from "react";
import { Box, Typography, Dialog, DialogContent, List, ListItem, ListItemText, Popover, Checkbox, TextField, IconButton, Select, OutlinedInput, FormControl, MenuItem, DialogActions, Grid, Paper, Table, TableHead, TableContainer, Button, TableBody } from "@mui/material";
import { userStyle } from "../../../pageStyle.js";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { ExportXL, ExportCSV } from "../../../components/Export.js";
import StyledDataGrid from "../../../components/TableStyle.js";
import { StyledTableRow, StyledTableCell } from "../../../components/Table.js";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { SERVICE } from "../../../services/Baseservice.js";
import { handleApiError } from "../../../components/Errorhandling.js";
import moment from "moment-timezone";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useReactToPrint } from "react-to-print";
import { UserRoleAccessContext, AuthContext } from "../../../context/Appcontext.js";
import { ThreeDots } from "react-loader-spinner";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/system";
import { saveAs } from "file-saver";
import Switch from "@mui/material/Switch";
import CloseIcon from "@mui/icons-material/Close";
import html2canvas from "html2canvas";
import ImageIcon from "@mui/icons-material/Image";
import Headtitle from "../../../components/Headtitle.js";
import Selects from "react-select";
import PageHeading from "../../../components/PageHeading.js";

import AlertDialog from "../../../components/Alert.js";
import {
  DeleteConfirmation,
  PleaseSelectRow,
} from "../../../components/DeleteConfirmation.js";
import ExportData from "../../../components/ExportData.js";
import InfoPopup from "../../../components/InfoPopup.js";
import MessageAlert from "../../../components/MessageAlert.js";

function MinPointsCalc() {
  const [employees, setEmployees] = useState([]);
  const [monthSets, setMonthsets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [manageshortagemasters, setManageshortagemasters] = useState([]);
  const [revenueAmount, setRevenueAmount] = useState([]);
  const [acPointCal, setAcPointCal] = useState([]);
  const [salSlabs, setsalSlabs] = useState([]);

  const [attStatus, setAttStatus] = useState([]);
  const [attModearr, setAttModearr] = useState([]);
  const [userShifts, setUserShifts] = useState([]);


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
    'Company',
    'Branch',
    'Unit',
    'Team',
    'Emp Code',
    'Name',
    'Process + Salary Exp',
    'Gross Salary',
    'Revenue Allowance',
    'Shortage',
    'Total No.Of Days',
    'Total Paid Days',
    'Month Point',
    'Day Point'
  ];
  let exportRowValues = [
    "company",
    "branch",
    "unit",
    "team",
    "empcode",
    "companyname",
    "processcodeexp",
    "gross",
    "revenueallow",
    "shortage",
    "totalnumberofdays",
    "totalpaidDays",
    "monthPoint",
    "dayPoint",
  ];

  const [fileFormat, setFormat] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPdfFilterOpen, setIsPdfFilterOpen] = useState(false);

  // page refersh reload
  const handleCloseFilterMod = () => {
    setIsFilterOpen(false);
  };

  const handleClosePdfFilterMod = () => {
    setIsPdfFilterOpen(false);
  };


  const { isUserRoleAccess, isUserRoleCompare, pageName, setPageName, isAssignBranch } = useContext(UserRoleAccessContext);
  //Datatable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { auth } = useContext(AuthContext);

  //  Datefield
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + "-" + mm + "-" + dd;

  let monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  let currentMonth = monthsArr[mm - 1];

  const [selectedYear, setSelectedYear] = useState(yyyy);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedMonthNum, setSelectedMonthNum] = useState(mm);

  //yeardropdown
  const years = [];
  for (let year = yyyy; year >= 1977; year--) {
    years.push({ value: year, label: year.toString() });
  }
  //month dropdown options
  const months = [
    { value: "January", label: "January", numval: 1 },
    { value: "February", label: "February", numval: 2 },
    { value: "March", label: "March", numval: 3 },
    { value: "April", label: "April", numval: 4 },
    { value: "May", label: "May", numval: 5 },
    { value: "June", label: "June", numval: 6 },
    { value: "July", label: "July", numval: 7 },
    { value: "August", label: "August", numval: 8 },
    { value: "September", label: "September", numval: 9 },
    { value: "October", label: "October", numval: 10 },
    { value: "November", label: "November", numval: 11 },
    { value: "December", label: "December", numval: 12 },
  ];

  const handleYearChange = (event) => {
    setSelectedYear(event.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.value);
    setSelectedMonthNum(event.numval);
  };

  const [isBankdetail, setBankdetail] = useState(false);

  const gridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQueryManage, setSearchQueryManage] = useState("");
  const [copiedData, setCopiedData] = useState("");

  //image
  const handleCaptureImage = () => {
    if (gridRef.current) {
      html2canvas(gridRef.current).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, "Minimum Points Calculation.png");
        });
      });
    }
  };

  const handleSelectionChange = (newSelection) => {
    setSelectedRows(newSelection.selectionModel);
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
    company: true,
    branch: true,
    unit: true,
    team: true,
    empcode: true,
    companyname: true,
    experience: true,
    assignExpMode: true,
    targetexp: true,
    processcode: true,
    processcodeexp: true,
    salexp: true,
    basic: true,
    hra: true,
    conveyance: true,
    medicalallowance: true,
    productionallowance: true,
    otherallowance: true,
    gross: true,
    shortage: true,
    totalnumberofdays: true,
    revenueallow: true,
    // "E+G": true,
    // "H-F": true,
    // "I/60": true,
    // "J*8.5": true,
    // "K/27": true,
    totalpaidDays: true,
    monthPoint: true,
    dayPoint: true,
  };

  const [expDptDates, setExpDptDates] = useState([]);
  //get all employees list details
  const fetchDepartmentMonthsets = async () => {
    setPageName(!pageName)
    try {
      let res_employee = await axios.get(SERVICE.DEPMONTHSET_ALL, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      let filteredMonthsets = res_employee?.data?.departmentdetails.filter((item) => item.year == selectedYear && item.monthname == selectedMonth);
      setExpDptDates(res_employee?.data?.departmentdetails);
      setMonthsets(filteredMonthsets);
    } catch (err) { handleApiError(err, setShowAlert, handleClickOpenerr); }
  };

  const accessbranchsalary = isAssignBranch
    ? isAssignBranch.map((data) => ({
      branch: data.branch,
      company: data.company,
      // unit: data.unit
    }))
    : [];

  //get all employees list details
  const fetchSalarySlabs = async () => {
    setPageName(!pageName)
    setBankdetail(true);
    try {
      let res_employee = await axios.post(SERVICE.SALARYSLAB_LIMITEDASSIGNBRANCH, {
        assignbranch: accessbranchsalary
      }, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      })
      setsalSlabs(res_employee?.data?.salaryslab)
      setBankdetail(false);
    } catch (err) { setBankdetail(false); handleApiError(err, setShowAlert, handleClickOpenerr); }
  };

  //get all data.
  const fetchManageshortagemaster = async () => {
    setPageName(!pageName)
    try {
      let res_status = await axios.get(SERVICE.MANAGESHORTAGEMASTER, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setManageshortagemasters(res_status?.data?.manageshortagemasters);
    } catch (err) { handleApiError(err, setShowAlert, handleClickOpenerr); }
  };

  const fetchTargetPointsData = async () => {
    setPageName(!pageName)
    try {
      let Res = await axios.get(SERVICE.REVENUEAMOUNTSLIMITED, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setRevenueAmount(Res?.data?.revenueamounts);
    } catch (err) { handleApiError(err, setShowAlert, handleClickOpenerr); }
  };

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  //get all employees list details
  const fetchEmployee = async () => {
    const accessbranch = isAssignBranch
      ? isAssignBranch.map((data) => ({
        branch: data.branch,
        company: data.company,
        unit: data.unit
      }))
      : [];

    setPageName(!pageName)
    try {
      // setBankdetail(true);
      let res_employee = await axios.post(SERVICE.USERSEXCELDATAASSIGNBRANCH, {
        assignbranch: accessbranch,
        month: selectedMonth,
        year: selectedYear
      }, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });

      setEmployees(res_employee.data.users);
      // setBankdetail(false);
    } catch (err) {
      // setBankdetail(false);
      handleApiError(err, setShowAlert, handleClickOpenerr);
    }
  };


  const fetchAcpointCalculation = async () => {
    setPageName(!pageName)
    try {
      let Res = await axios.get(SERVICE.ACPOINTCALCULATION, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setAcPointCal(Res?.data?.acpointcalculation);
    } catch (err) { handleApiError(err, setShowAlert, handleClickOpenerr); }
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

  //  PDF
  const columns = [
    { title: "SNo", dataKey: "serialNumber" },
    { title: "Company", dataKey: "company" },
    { title: "Branch", dataKey: "branch" },
    { title: "Unit", dataKey: "unit" },
    { title: "Team", dataKey: "team" },
    { title: "Emp Code", dataKey: "empcode" },
    { title: "Name", dataKey: "companyname" },
    { title: "Process + Salary Exp", dataKey: "processcodeexp" },
    { title: "Gross Salary", dataKey: "gross" },
    { title: "Revenue Allowance", dataKey: "revenueallow" },
    { title: "Shortage", dataKey: "shortage" },
    { title: "Total No.Of Days", dataKey: "totalnumberofdays" },
    { title: "Total Paid Days", dataKey: "totalpaidDays" },
    { title: "Month Point", dataKey: "monthPoint" },
    { title: "Day Point", dataKey: "dayPoint" },
  ];

  const downloadPdf = () => {
    const doc = new jsPDF({
      orientation: "landscape",
    });

    doc.autoTable({
      theme: "grid",
      styles: {
        fontSize: 5,
      },
      columns: columns,
      body: rowDataTable,
    });
    doc.save("Minimum Points Calculation.pdf");
  };

  // Excel
  const fileName = "Minimum Points Calculation";

  //print...
  const componentRef = useRef();
  const handleprint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Minimum Points Calculation",
    pageStyle: "print",
  });

  //table entries ..,.
  //get all Sub vendormasters.
  const fetchAttedanceStatus = async () => {
    setPageName(!pageName)
    try {
      let res_vendor = await axios.get(SERVICE.ATTENDANCE_STATUS, {
        headers: {
          'Authorization': `Bearer ${auth.APIToken}`
        }
      });
      setAttStatus(res_vendor?.data?.attendancestatus);
    } catch (err) { handleApiError(err, setShowAlert, handleClickOpenerr); }
  }

  //get all Attendance Status name.
  const fetchAttMode = async () => {
    setPageName(!pageName)
    try {
      let res_freq = await axios.get(SERVICE.ATTENDANCE_MODE_STATUS, {
        headers: {
          Authorization: `Bearer ${auth.APIToken}`,
        },
      });
      setAttModearr(res_freq?.data?.allattmodestatus);
    } catch (err) { handleApiError(err, setShowAlert, handleClickOpenerr); }
  };

  useEffect(() => {
    fetchAttedanceStatus();
    fetchAttMode();
  }, []);

  const getattendancestatus = (clockinstatus, clockoutstatus) => {
    let result = attStatus.filter((data, index) => {
      return data?.clockinstatus === clockinstatus && data?.clockoutstatus === clockoutstatus
    })
    return result[0]?.name
  }

  const getAttModeLop = (rowdaystatus) => {
    let result = attModearr.filter((data, index) => {
      return data?.name === rowdaystatus
    })
    return result[0]?.lop === true ? 'YES' : 'No';
  }

  const getAttModeLopType = (rowdaystatus) => {
    let result = attModearr.filter((data, index) => {
      return data?.name === rowdaystatus
    })
    return result[0]?.loptype
  }

  const getFinalLop = (rowlop, rowloptype) => {
    return (rowloptype === undefined || rowloptype === "") ? rowlop : (rowlop + ' - ' + rowloptype);
  }

  const getCount = (rowlopstatus) => {
    if (rowlopstatus === 'YES - Double Day') {
      return '2'
    } else if (rowlopstatus === 'YES - Full Day') {
      return '1';
    } else if (rowlopstatus === 'YES - Half Day') {
      return '0.5'
    } else {
      return '0';
    }
  }

  const getAttModeTarget = (rowdaystatus) => {
    let result = attModearr.filter((data, index) => {
      return data?.name === rowdaystatus
    })
    return result[0]?.target === true ? 'YES' : 'No';
  }

  const getAttModePaidPresent = (rowdaystatus) => {
    let result = attModearr.filter((data, index) => {
      return data?.name === rowdaystatus
    })
    return result[0]?.paidleave === true ? 'YES' : 'No';
  }

  const getAttModePaidPresentType = (rowdaystatus) => {
    let result = attModearr.filter((data, index) => {
      return data?.name === rowdaystatus
    })
    return result[0]?.paidleavetype;
  }

  const getFinalPaid = (rowpaid, rowpaidtype) => {
    return (rowpaidtype === undefined || rowpaidtype === "") ? rowpaid : (rowpaid + ' - ' + rowpaidtype);
  }

  const getAssignLeaveDayForPaid = (rowpaidday) => {
    if (rowpaidday === 'YES - Double Day') {
      return '2'
    } else if (rowpaidday === 'YES - Full Day') {
      return '1';
    } else if (rowpaidday === 'YES - Half Day') {
      return '0.5'
    } else {
      return '0';
    }
  }

  const [items, setItems] = useState([]);


  const handleFilter = async () => {
    const accessbranch = isAssignBranch
      ? isAssignBranch.map((data) => ({
        branch: data.branch,
        company: data.company,
        unit: data.unit
      }))
      : [];


    setPageName(!pageName)
    try {
      setBankdetail(true);

      let [res_applyleave, res_employee1] = await Promise.all([
        // axios.post(SERVICE.SALARYSLAB_LIMITEDASSIGNBRANCH, {
        //   assignbranch: accessbranch
        // }, {
        //   headers: {
        //     Authorization: `Bearer ${auth.APIToken}`,
        //   },
        // }),
        axios.post(SERVICE.APPLYLEAVE_APPROVEDASSIGNBRANCH, {

          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
          status: String("Approved"),
          assignbranch: accessbranch

        }),
        axios.post(SERVICE.USERSEXCELDATAASSIGNBRANCH, {
          assignbranch: accessbranch,
          month: selectedMonth,
          year: selectedYear
        }, {
          headers: {
            Authorization: `Bearer ${auth.APIToken}`,
          },
        }),
      ]);



      //  res_employee = await axios.post(SERVICE.SALARYSLAB_LIMITEDASSIGNBRANCH, {
      //   assignbranch: accessbranch
      // }, {
      //   headers: {
      //     Authorization: `Bearer ${auth.APIToken}`,
      //   },
      // });
      // setsalSlabs(res_employee.data.salaryslab);
      // let salSlabsnew = res_employee.data.salaryslab
      // console.log(salSlabsnew, "salSlabsnew")
      // let res_applyleave = await axios.post(SERVICE.APPLYLEAVE_APPROVEDASSIGNBRANCH, {

      //   headers: {
      //     Authorization: `Bearer ${auth.APIToken}`,
      //   },
      //   status: String("Approved"),
      //   assignbranch: accessbranch

      // });

      let leaveresult = res_applyleave?.data?.applyleaves;


      // let res_employee1 = await axios.post(SERVICE.USERSEXCELDATAASSIGNBRANCH, {
      //   assignbranch: accessbranch,
      //   month: selectedMonth,
      //   year: selectedYear
      // }, {
      //   headers: {
      //     Authorization: `Bearer ${auth.APIToken}`,
      //   },
      // });

      setEmployees(res_employee1.data.users);

      const batchSize = 25; // Example batch size


      const batches = [];
      let pageone = 1; // Start from page 1

      async function fetchData(pageone) {
        try {
          const response = await axios.post(
            SERVICE.GETUSE_TOTALSHIFT_DAYS,
            {
              page: pageone,
              pageSize: batchSize,
              ismonth: Number(selectedMonthNum),
              isyear: Number(selectedYear),
              // employees: res_employee1.data.users.map(item => item.companyname)

            },
            {
              headers: {
                Authorization: `Bearer ${auth.APIToken}`,
              },
            }
          );
          if (Array.isArray(response.data.finaluser)) {
            batches.push(...response.data.finaluser);

            // handleOpenLoadingMessage(percent);
            // Check if there's more data to fetch
            if (response.data.finaluser.length != 0) {
              // If yes, fetch the next page
              pageone++;
              await fetchData(pageone);
            }
          } else {
            // handleCloseLoadingMessage();
            console.error("Response data is not an array:", response.data.finaluser);
            // Handle error as needed
          }
        } catch (error) {
          console.error("Error sending request:", error);
          // Handle error as needed
        }
      }

      fetchData(pageone).then(async () => {

        let countByEmpcodeClockin = {}; // Object to store count for each empcode
        let countByEmpcodeClockout = {};
        // return res_usershift.data.finaluser;
        let result = batches.flatMap((item, index) => {

          // Initialize count for empcode if not already present
          if (!countByEmpcodeClockin[item.empcode]) {
            countByEmpcodeClockin[item.empcode] = 1;
          }
          if (!countByEmpcodeClockout[item.empcode]) {
            countByEmpcodeClockout[item.empcode] = 1;
          }

          // Adjust clockinstatus based on lateclockincount
          let updatedClockInStatus = item.clockinstatus;
          // Adjust clockoutstatus based on earlyclockoutcount
          let updatedClockOutStatus = item.clockoutstatus;

          // Filter out only 'Absent' items for the current employee
          const absentItems = batches?.filter(d => d.clockinstatus === 'Absent' && item.empcode === d.empcode && d.clockin === '00:00:00' && d.clockout === '00:00:00');

          // Check if the day before and after a 'Week Off' date is marked as 'Leave' or 'Absent'
          if (item.clockinstatus === 'Week Off' && item.clockoutstatus === 'Week Off') {
            // Define the date format for comparison
            const itemDate = moment(item.rowformattedDate, "DD/MM/YYYY");

            const isPreviousDayLeave = leaveresult.some(leaveItem => moment(leaveItem.date, "DD/MM/YYYY").isSame(itemDate.clone().subtract(1, 'days'), 'day') && leaveItem.empcode === item.empcode);
            const isPreviousDayAbsent = absentItems.some(absentItem => moment(absentItem.rowformattedDate, "DD/MM/YYYY").isSame(itemDate.clone().subtract(1, 'days'), 'day'));

            const isNextDayLeave = leaveresult.some(leaveItem => moment(leaveItem.date, "DD/MM/YYYY").isSame(itemDate.clone().add(1, 'days'), 'day') && leaveItem.empcode === item.empcode);
            const isNextDayAbsent = absentItems.some(absentItem => moment(absentItem.rowformattedDate, "DD/MM/YYYY").isSame(itemDate.clone().add(1, 'days'), 'day'));

            if (isPreviousDayLeave) {
              updatedClockInStatus = 'BeforeWeekOffLeave';
              updatedClockOutStatus = 'BeforeWeekOffLeave';
            }
            if (isPreviousDayAbsent) {
              updatedClockInStatus = 'BeforeWeekOffAbsent';
              updatedClockOutStatus = 'BeforeWeekOffAbsent';
            }
            if (isNextDayLeave) {
              updatedClockInStatus = 'AfterWeekOffLeave';
              updatedClockOutStatus = 'AfterWeekOffLeave';
            }
            if (isNextDayAbsent) {
              updatedClockInStatus = 'AfterWeekOffAbsent';
              updatedClockOutStatus = 'AfterWeekOffAbsent';
            }
          }

          // Check if 'Late - ClockIn' count exceeds the specified limit
          if (updatedClockInStatus === 'Late - ClockIn') {
            updatedClockInStatus = `${countByEmpcodeClockin[item.empcode]}Late - ClockIn`;
            countByEmpcodeClockin[item.empcode]++; // Increment count for current empcode
          }
          // Check if 'Early - ClockOut' count exceeds the specified limit
          if (updatedClockOutStatus === 'Early - ClockOut') {
            updatedClockOutStatus = `${countByEmpcodeClockout[item.empcode]}Early - ClockOut`;
            countByEmpcodeClockout[item.empcode]++; // Increment count for current empcode
          }

          return {
            ...item,
            shiftallot: item.shiftallot,
            weekOffDates: item.weekOffDates,
            clockinstatus: updatedClockInStatus,
            clockoutstatus: updatedClockOutStatus,
            totalnumberofdays: item.totalnumberofdays,
            empshiftdays: item.empshiftdays,
            totalcounttillcurrendate: item.totalcounttillcurrendate,
            totalshift: item.totalshift,
            attendanceauto: getattendancestatus(updatedClockInStatus, updatedClockOutStatus),
            daystatus: item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(updatedClockInStatus, updatedClockOutStatus),
            lop: getAttModeLop(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(updatedClockInStatus, updatedClockOutStatus)),
            loptype: getAttModeLopType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(updatedClockInStatus, updatedClockOutStatus)),
            lopcalculation: getFinalLop(
              getAttModeLop(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(updatedClockInStatus, updatedClockOutStatus)),
              getAttModeLopType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(updatedClockInStatus, updatedClockOutStatus))
            ),
            lopcount: getCount(
              getFinalLop(
                getAttModeLop(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(updatedClockInStatus, updatedClockOutStatus)),
                getAttModeLopType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(updatedClockInStatus, updatedClockOutStatus))
              )
            ),
            modetarget: getAttModeTarget(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(updatedClockInStatus, updatedClockOutStatus)),
            paidpresentbefore: getAttModePaidPresent(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(updatedClockInStatus, updatedClockOutStatus)),
            paidleavetype: getAttModePaidPresentType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(updatedClockInStatus, updatedClockOutStatus)),
            paidpresent: getFinalPaid(
              getAttModePaidPresent(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(updatedClockInStatus, updatedClockOutStatus)),
              getAttModePaidPresentType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(updatedClockInStatus, updatedClockOutStatus))
            ),
            paidpresentday: getAssignLeaveDayForPaid(
              getFinalPaid(
                getAttModePaidPresent(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(updatedClockInStatus, updatedClockOutStatus)),
                getAttModePaidPresentType(item.attendanceautostatus ? item.attendanceautostatus : getattendancestatus(updatedClockInStatus, updatedClockOutStatus))
              )
            ),
            // weekoffCount: attresult.length > 0 ? uniqueWeekOffDates.filter(d => !uniqueAttandanceDates.includes(d)).length : uniqueWeekOffDates.length,
          }
        })

        const finalresult = [];

        result.forEach(item => {

          const leaveOnDateApproved = leaveresult.find((d) => d.date === item.rowformattedDate && d.empcode === item.empcode);

          const existingEntryIndex = finalresult.findIndex(entry => entry.empcode === item.empcode);


          if (existingEntryIndex !== -1) {
            finalresult[existingEntryIndex].shift++;

            if (item.clockinstatus === 'Week Off' && item.clockoutstatus === 'Week Off' && item.clockin === '00:00:00' && item.clockout === '00:00:00') {
              finalresult[existingEntryIndex].weekoff++;
            }

            if (item.clockinstatus === 'Holiday' && item.clockoutstatus === 'Holiday') {
              finalresult[existingEntryIndex].holidayCount++;
            }

            // if (item.clockinstatus === 'Leave' && item.clockoutstatus === 'Leave') {
            //     finalresult[existingEntryIndex].leaveCount++;
            // }
            if (leaveOnDateApproved) {
              // if ((item.clockinstatus === `${leaveOnDateApproved.code} ${leaveOnDateApproved.status}`) && (item.clockoutstatus === `${leaveOnDateApproved.code} ${leaveOnDateApproved.status}`)) {
              finalresult[existingEntryIndex].leaveCount++;
              // }
            }

            if (item.attendanceauto === undefined && item.daystatus === undefined) {
              finalresult[existingEntryIndex].nostatuscount++;
            }

            finalresult[existingEntryIndex].lopcount = String(parseFloat(finalresult[existingEntryIndex].lopcount) + parseFloat(item.lopcount));
            finalresult[existingEntryIndex].paidpresentday = String(parseFloat(finalresult[existingEntryIndex].paidpresentday) + parseFloat(item.paidpresentday));

          } else {

            const newItem = {
              id: item.id,
              empcode: item.empcode,
              username: item.username,
              company: item.company,
              branch: item.branch,
              unit: item.unit,
              team: item.team,
              department: item.department,
              totalnumberofdays: item.totalnumberofdays,
              empshiftdays: item.empshiftdays,
              shift: 1,
              // weekoff: item.weekoffCount,
              weekoff: (item.clockinstatus === 'Week Off' && item.clockoutstatus === 'Week Off' && item.clockin === '00:00:00' && item.clockout === '00:00:00') ? 1 : 0,
              lopcount: item.lopcount,
              paidpresentday: item.paidpresentday,
              totalcounttillcurrendate: item.totalcounttillcurrendate,
              totalshift: item.totalshift,
              holidayCount: (item.clockinstatus === 'Holiday' && item.clockoutstatus === 'Holiday') ? 1 : 0,
              // leaveCount: (item.clockinstatus === 'Leave' && item.clockoutstatus === 'Leave') ? 1 : 0,
              // leaveCount: leaveOnDateApproved ? ((item.clockinstatus === `${leaveOnDateApproved && leaveOnDateApproved.code} ${leaveOnDateApproved && leaveOnDateApproved.status}`) && (item.clockoutstatus === `${leaveOnDateApproved && leaveOnDateApproved.code} ${leaveOnDateApproved && leaveOnDateApproved.status}`) ? 1 : 0) : 0,
              leaveCount: leaveOnDateApproved ? 1 : 0,
              clsl: 0,
              holiday: 0,
              totalpaiddays: 0,
              nostatus: 0,
              nostatuscount: (item.paidpresent === 'No' && item.modetarget === 'No' && item.lopcalculation === 'No') ? 1 : 0,
            };
            finalresult.push(newItem);
          }
        });

        const itemsWithSerialNumber = res_employee1.data.users?.map(async (item, index) => {
          try {
            let findTotalNoOfDays = finalresult.find(d =>
              d.company == item.company &&
              d.branch == item.branch
              && d.department == item.department
              && d.team == item.team
              && d.empcode == item.empcode
              && d.unit == item.unit
              && d.username == item.companyname
            )


            // const lastItemsForEachMonth = Object.values(groupedByMonth);

            // // Extract the last item of each group

            const groupedByMonth = {};
            if (item?.assignExpLog?.length > 0) {
              // Group items by month
              item?.assignExpLog?.forEach((item) => {
                const monthYear = item?.updatedate?.split("-").slice(0, 2).join("-");
                if (!groupedByMonth[monthYear]) {
                  groupedByMonth[monthYear] = [];
                }
                groupedByMonth[monthYear].push(item);
              });
            }
            // Extract the last item of each group
            const lastItemsForEachMonth = Object.values(groupedByMonth).map((group) => group[group.length - 1]);

            // Filter the data array based on the month and year
            lastItemsForEachMonth.sort((a, b) => {
              return new Date(a.updatedate) - new Date(b.updatedate);
            });
            let filteredDataMonth = null;
            if (lastItemsForEachMonth.length > 0) {
              // Find the first item in the sorted array that meets the criteria

              for (let i = 0; i < lastItemsForEachMonth.length; i++) {
                const date = lastItemsForEachMonth[i].updatedate;
                const splitedDate = date.split("-");
                const itemYear = splitedDate[0];
                const itemMonth = splitedDate[1]; // Adding 1 because getMonth() returns 0-indexed month
                if (Number(itemYear) === selectedYear && Number(itemMonth) === Number(selectedMonthNum)) {
                  filteredDataMonth = lastItemsForEachMonth[i];
                  break;
                } else if (Number(itemYear) < selectedYear || (Number(itemYear) === selectedYear && Number(itemMonth) < Number(selectedMonthNum))) {
                  filteredDataMonth = lastItemsForEachMonth[i]; // Keep updating the filteredDataMonth until the criteria is met
                } else {
                  break; // Break the loop if we encounter an item with year and month greater than selected year and month
                }
              }
            }
            // let modevalue = item.assignExpLog[item.assignExpLog.length - 1];
            let modevalue = filteredDataMonth;

            // let selectedMonStartDate = selectedYear + "-" + selectedMonth + "-01";

            // let findexp = monthSets.find((d) => d.department === item.department);
            // let findDate = findexp ? findexp.fromdate : selectedMonStartDate;

            // // Calculate difference in months between findDate and item.doj
            // let differenceInMonths, differenceInMonthsexp, differenceInMonthstar;
            // if (modevalue) {
            //   //findexp end difference yes/no
            //   if (modevalue.endexp === "Yes") {
            //     differenceInMonthsexp = Math.floor((new Date(modevalue.endexpdate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
            //     if (modevalue.expmode === "Add") {
            //       differenceInMonthsexp += parseInt(modevalue.expval);
            //     } else if (modevalue.expmode === "Minus") {
            //       differenceInMonthsexp -= parseInt(modevalue.expval);
            //     } else if (modevalue.expmode === "Fix") {
            //       differenceInMonthsexp = parseInt(modevalue.expval);
            //     }
            //   } else {
            //     differenceInMonthsexp = Math.floor((new Date(findDate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
            //     if (modevalue.expmode === "Add") {
            //       differenceInMonthsexp += parseInt(modevalue.expval);
            //     } else if (modevalue.expmode === "Minus") {
            //       differenceInMonthsexp -= parseInt(modevalue.expval);
            //     } else if (modevalue.expmode === "Fix") {
            //       differenceInMonthsexp = parseInt(modevalue.expval);
            //     } else {
            //       // differenceInMonths = parseInt(modevalue.expval);
            //       differenceInMonthsexp = Math.floor((new Date(findDate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
            //     }
            //   }

            //   //findtar end difference yes/no
            //   if (modevalue.endtar === "Yes") {
            //     differenceInMonthstar = Math.floor((new Date(modevalue.endtardate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
            //     if (modevalue.expmode === "Add") {
            //       differenceInMonthstar += parseInt(modevalue.expval);
            //     } else if (modevalue.expmode === "Minus") {
            //       differenceInMonthstar -= parseInt(modevalue.expval);
            //     } else if (modevalue.expmode === "Fix") {
            //       differenceInMonthstar = parseInt(modevalue.expval);
            //     }
            //   } else {
            //     differenceInMonthstar = Math.floor((new Date(findDate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
            //     if (modevalue.expmode === "Add") {
            //       differenceInMonthstar += parseInt(modevalue.expval);
            //     } else if (modevalue.expmode === "Minus") {
            //       differenceInMonthstar -= parseInt(modevalue.expval);
            //     } else if (modevalue.expmode === "Fix") {
            //       differenceInMonthstar = parseInt(modevalue.expval);
            //     } else {
            //       // differenceInMonths = parseInt(modevalue.expval);
            //       differenceInMonthstar = Math.floor((new Date(findDate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
            //     }
            //   }

            //   differenceInMonths = Math.floor((new Date(findDate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
            //   if (modevalue.expmode === "Add") {
            //     differenceInMonths += parseInt(modevalue.expval);
            //   } else if (modevalue.expmode === "Minus") {
            //     differenceInMonths -= parseInt(modevalue.expval);
            //   } else if (modevalue.expmode === "Fix") {
            //     differenceInMonths = parseInt(modevalue.expval);
            //   } else {
            //     // differenceInMonths = parseInt(modevalue.expval);
            //     differenceInMonths = Math.floor((new Date(findDate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
            //   }
            // } else {
            //   differenceInMonthsexp = Math.floor((new Date(findDate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
            //   differenceInMonthstar = Math.floor((new Date(findDate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
            //   differenceInMonths = Math.floor((new Date(findDate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
            // }

            // const calculateMonthsBetweenDates = (d1, d2) => {
            //   const date1 = new Date(d1);
            //   const date2 = new Date(d2);
            //   // Check if d1 is less than or equal to d2
            //   if (date1 >= date2) {
            //     return 0;
            //   }

            //   const diffTime = Math.abs(date2 - date1);
            //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            //   const months = Math.floor(diffDays / 30);
            //   return months;
            // };
            let selectedmonthnumvalue = Number(selectedMonthNum) <= 9 ? `0${selectedMonthNum}` : selectedMonthNum;
            let selectedMonStartDate = `${selectedYear}-${selectedmonthnumvalue}-01`;

            let findexp = monthSets.find((d) => d.department === item.department);
            let findDate = findexp ? findexp.fromdate : selectedMonStartDate;

            const calculateMonthsBetweenDates = (startDate, endDate) => {
              if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);

                let years = end.getFullYear() - start.getFullYear();
                let months = end.getMonth() - start.getMonth();
                let days = end.getDate() - start.getDate();

                // Convert years to months
                months += years * 12;

                // Adjust for negative days
                if (days < 0) {
                  months -= 1; // Subtract a month
                  days += new Date(end.getFullYear(), end.getMonth(), 0).getDate(); // Add days of the previous month
                }

                // Adjust for days 15 and above
                if (days >= 15) {
                  months += 1; // Count the month if 15 or more days have passed
                }

                return months;
              }

              return 0; // Return 0 if either date is missing
            };



            // Calculate difference in months between findDate and item.doj
            let differenceInMonths, differenceInMonthsexp, differenceInMonthstar;
            if (modevalue) {
              //findexp end difference yes/no
              if (modevalue.endexp === "Yes") {
                differenceInMonthsexp = calculateMonthsBetweenDates(
                  item.doj,
                  modevalue.endexpdate
                );
                //  Math.floor((new Date(modevalue.endexpdate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
                if (modevalue.expmode === "Add") {
                  differenceInMonthsexp += parseInt(modevalue.expval);
                } else if (modevalue.expmode === "Minus") {
                  differenceInMonthsexp -= parseInt(modevalue.expval);
                } else if (modevalue.expmode === "Fix") {
                  differenceInMonthsexp = parseInt(modevalue.expval);
                }
              } else {
                differenceInMonthsexp = calculateMonthsBetweenDates(
                  item.doj,
                  findDate
                );
                // Math.floor((new Date(findDate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
                if (modevalue.expmode === "Add") {
                  differenceInMonthsexp += parseInt(modevalue.expval);
                } else if (modevalue.expmode === "Minus") {
                  differenceInMonthsexp -= parseInt(modevalue.expval);
                } else if (modevalue.expmode === "Fix") {
                  differenceInMonthsexp = parseInt(modevalue.expval);
                } else {
                  // differenceInMonths = parseInt(modevalue.expval);
                  differenceInMonthsexp = calculateMonthsBetweenDates(
                    item.doj,
                    findDate
                  );
                }
              }

              //findtar end difference yes/no
              if (modevalue.endtar === "Yes") {
                differenceInMonthstar = calculateMonthsBetweenDates(
                  item.doj,
                  modevalue.endtardate
                );
                //  Math.floor((new Date(modevalue.endtardate) - new Date(item.doj)) / (30 * 24 * 60 * 60 * 1000));
                if (modevalue.expmode === "Add") {
                  differenceInMonthstar += parseInt(modevalue.expval);
                } else if (modevalue.expmode === "Minus") {
                  differenceInMonthstar -= parseInt(modevalue.expval);
                } else if (modevalue.expmode === "Fix") {
                  differenceInMonthstar = parseInt(modevalue.expval);
                }
              } else {
                differenceInMonthstar = calculateMonthsBetweenDates(
                  item.doj,
                  findDate
                );
                if (modevalue.expmode === "Add") {
                  differenceInMonthstar += parseInt(modevalue.expval);
                } else if (modevalue.expmode === "Minus") {
                  differenceInMonthstar -= parseInt(modevalue.expval);
                } else if (modevalue.expmode === "Fix") {
                  differenceInMonthstar = parseInt(modevalue.expval);
                } else {
                  // differenceInMonths = parseInt(modevalue.expval);
                  differenceInMonthstar = calculateMonthsBetweenDates(
                    item.doj,
                    findDate
                  );
                }
              }

              differenceInMonths = calculateMonthsBetweenDates(item.doj, findDate);
              if (modevalue.expmode === "Add") {
                differenceInMonths += parseInt(modevalue.expval);
              } else if (modevalue.expmode === "Minus") {
                differenceInMonths -= parseInt(modevalue.expval);
              } else if (modevalue.expmode === "Fix") {
                differenceInMonths = parseInt(modevalue.expval);
              } else {
                // differenceInMonths = parseInt(modevalue.expval);
                differenceInMonths = calculateMonthsBetweenDates(
                  item.doj,
                  findDate
                );
              }
            } else {
              differenceInMonthsexp = calculateMonthsBetweenDates(
                item.doj,
                findDate
              );
              differenceInMonthstar = calculateMonthsBetweenDates(
                item.doj,
                findDate
              );
              differenceInMonths = calculateMonthsBetweenDates(item.doj, findDate);
            }

            //GET PROCESS CODE FUNCTION

            const groupedByMonthProcs = {};
            if (item.processlog.length > 0) {
              // Group items by month
              item.processlog.forEach((item) => {
                const monthYear = item.date?.split("-").slice(0, 2).join("-");
                if (!groupedByMonthProcs[monthYear]) {
                  groupedByMonthProcs[monthYear] = [];
                }
                groupedByMonthProcs[monthYear].push(item);
              });
            }
            // Extract the last item of each group
            const lastItemsForEachMonthPros = Object.values(groupedByMonthProcs).map((group) => group[group.length - 1]);

            // Filter the data array based on the month and year
            lastItemsForEachMonthPros.sort((a, b) => {
              return new Date(a.date) - new Date(b.date);
            });
            // Find the first item in the sorted array that meets the criteria
            let filteredItem = null;
            if (lastItemsForEachMonthPros.length > 0) {
              for (let i = 0; i < lastItemsForEachMonthPros.length; i++) {
                const date = lastItemsForEachMonthPros[i].date;
                const splitedDate = date?.split("-");
                const itemYear = splitedDate && splitedDate[0];
                const itemMonth = splitedDate && splitedDate[1]; // Adding 1 because getMonth() returns 0-indexed month
                if (Number(itemYear) === selectedYear && Number(itemMonth) === Number(selectedMonthNum)) {
                  filteredItem = lastItemsForEachMonthPros[i];
                  break;
                } else if (Number(itemYear) < selectedYear || (Number(itemYear) === selectedYear && Number(itemMonth) < Number(selectedMonthNum))) {
                  filteredItem = lastItemsForEachMonthPros[i]; // Keep updating the filteredItem until the criteria is met
                } else {
                  break; // Break the loop if we encounter an item with year and month greater than selected year and month
                }
              }
            }

            let getprocessCode = filteredItem ? filteredItem.process : "";

            // let procCodecheck = item.doj ? getprocessCode + (differenceInMonthsexp > 0 ? (differenceInMonthsexp <= 9 ? `0${differenceInMonthsexp}` : differenceInMonthsexp) : 0) : "";
            let processcodeexpvalue = item.doj && modevalue && modevalue.expmode == "Manual" ? modevalue.salarycode + (differenceInMonthsexp > 0 ? (differenceInMonthsexp <= 9 ? `0${differenceInMonthsexp}` : differenceInMonthsexp) : "00") : item.doj ? getprocessCode + (differenceInMonthsexp > 0 ? (differenceInMonthsexp <= 9 ? `0${differenceInMonthsexp}` : differenceInMonthsexp) : "00") : "";


            //findsalary from salaryslab
            let findSalDetails = salSlabs.find((d) => d.company === item.company && d.branch === item.branch && d.salarycode === processcodeexpvalue);
            //shortageamount from shortage master
            let findShortage = manageshortagemasters.find((d) => d.department === item.department && differenceInMonths >= Number(d.from) && differenceInMonths <= Number(d.to));
            //revenue amount from revenue  master
            let findRevenueAllow = revenueAmount.find((d) => d.company === item.company && d.branch === item.branch && d.processcode === processcodeexpvalue);

            let findAcPointVal = acPointCal.find((d) => d.company === item.company && d.branch === item.branch && d.department === item.department);


            // GROSS VALUE
            let grossValue = modevalue && modevalue.expmode == "Manual" ? modevalue.gross : findSalDetails ? (Number(findSalDetails.basic) + Number(findSalDetails.hra) + Number(findSalDetails.conveyance) + Number(findSalDetails.medicalallowance) + Number(findSalDetails.productionallowance) + Number(findSalDetails.otherallowance)) : ""
            let egvalue = Number(grossValue) + (findShortage ? Number(findShortage.amount) : 0);

            let hfvalue = egvalue - (findRevenueAllow ? Number(findRevenueAllow.amount) : 0);
            let i60value = Number(hfvalue) / (findAcPointVal && Number(findAcPointVal.multiplevalue));
            let j85value = i60value * (findAcPointVal && Number(findAcPointVal.dividevalue));
            // let totalpaiddaysvalue = findTotalNoOfDays ? Number(findTotalNoOfDays.empshiftdays) - (Number(findTotalNoOfDays.weekoff) + Number(findTotalNoOfDays.holiday)) : 0
            let totalpaiddaysvalue = findTotalNoOfDays ? (Number(findTotalNoOfDays.empshiftdays) - (Number(findTotalNoOfDays.weekoff))) : 0
            return {
              ...item,
              serialNumber: index + 1,
              company: item.company,
              branch: item.branch,
              unit: item.unit,
              team: item.team,
              empcode: item.empcode,
              companyname: item.companyname,
              doj: item.doj ? moment(item.doj)?.format("DD-MM-YYYY") : "",

              experience: item.doj ? calculateMonthsBetweenDates(item.doj, findDate) : "",

              endtar: modevalue ? modevalue.endtar : "",
              endtardate: modevalue && modevalue.endtardate ? moment(modevalue.endtardate)?.format("DD-MM-YYYY") : "",
              endexp: modevalue ? modevalue.endexp : "",
              endexpdate: modevalue && modevalue.endexpdate ? moment(modevalue.endexpdate)?.format("DD-MM-YYYY") : "",

              assignExpMode: modevalue ? modevalue.expmode : "",
              modevalue: modevalue ? modevalue.expval : "",

              targetexp: item.doj ? (differenceInMonthstar > 0 ? differenceInMonthstar : 0) : "",
              prodexp: item.doj ? (differenceInMonthsexp > 0 ? differenceInMonthsexp : 0) : "",
              modeexp: item.doj ? (differenceInMonths > 0 ? differenceInMonths : 0) : "",

              // processcode: item.doj ? getprocessCode : "",
              // salexp: item.doj ? (differenceInMonthsexp > 0 ? (differenceInMonthsexp <= 9? `0${differenceInMonthsexp}` : differenceInMonthsexp) : "00") : "",
              // processcodeexp: item.doj ? getprocessCode + (differenceInMonthsexp > 0 ? (differenceInMonthsexp <= 9? `0${differenceInMonthsexp}` : differenceInMonthsexp) : "00") : "",

              processcode: item.doj && modevalue && modevalue.expmode === "Manual" ? modevalue.salarycode : item.doj ? getprocessCode : "",
              salexp: item.doj ? (differenceInMonthsexp > 0 ? (differenceInMonthsexp <= 9 ? `0${differenceInMonthsexp}` : differenceInMonthsexp) : "00") : "",
              processcodeexp: processcodeexpvalue,
              // item.doj && modevalue && modevalue.expmode == "Manual" ?( modevalue.salarycode + (differenceInMonthsexp <= 9 ? "0"+differenceInMonthsexp : differenceInMonthsexp )):  (item.doj ? getprocessCode +   differenceInMonthsexp : ""),

              // processcodetar: item.doj ? getprocessCode + (differenceInMonthstar > 0 ? differenceInMonthstar : 0) : "",

              basic: modevalue && modevalue.expmode === "Manual" ? modevalue.basic : findSalDetails ? findSalDetails.basic : "",
              hra: modevalue && modevalue.expmode === "Manual" ? modevalue.hra : findSalDetails ? findSalDetails.hra : "",
              conveyance: modevalue && modevalue.expmode === "Manual" ? modevalue.conveyance : findSalDetails ? findSalDetails.conveyance : "",
              medicalallowance: modevalue && modevalue.expmode === "Manual" ? modevalue.medicalallowance : findSalDetails ? findSalDetails.medicalallowance : "",
              productionallowance: modevalue && modevalue.expmode === "Manual" ? modevalue.productionallowance : findSalDetails ? findSalDetails.productionallowance : "",
              otherallowance: modevalue && modevalue.expmode === "Manual" ? modevalue.otherallowance : findSalDetails ? findSalDetails.otherallowance : "",
              gross: grossValue,
              //  modevalue && modevalue.expmode == "Manual" ? modevalue.gross : findSalDetails ? Number(findSalDetails.basic) + Number(findSalDetails.hra) + Number(findSalDetails.conveyance) + Number(findSalDetails.medicalallowance) + Number(findSalDetails.productionallowance) + Number(findSalDetails.otherallowance) : "",

              revenueallow: findRevenueAllow ? findRevenueAllow.amount : 0,
              shortage: findShortage ? findShortage.amount : 0,
              "E+G": egvalue,
              "H-F": hfvalue,
              "I/60": i60value,
              "J*8.5": j85value,
              "K/27": j85value / 27,
              totalnumberofdays: findTotalNoOfDays ? findTotalNoOfDays.empshiftdays : 0,
              totalpaidDays: totalpaiddaysvalue,
              monthPoint: j85value ? j85value.toFixed(2) : "",
              dayPoint: totalpaiddaysvalue > 0 && j85value ? (j85value / totalpaiddaysvalue).toFixed(2) : "",
            };

          } catch (err) {
          }
        });
        const results = await Promise.all(itemsWithSerialNumber);
        setItems(results.filter(item => item !== undefined));
        setBankdetail(false);
      }).catch(error => {
        setBankdetail(false);
        console.error('Error fetching shifts:', error);
      });


    } catch (err) { setBankdetail(false); handleApiError(err, setShowAlert, handleClickOpenerr); }
  };


  //Datatable
  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSelectedRows([]);
    // setSelectAllChecked(false);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setSelectedRows([]);
    // setSelectAllChecked(false);
    setPage(1);
  };

  //datatable....
  const handleSearchChange = (event) => {
    setPage(1);
    setSearchQuery(event.target.value);
  };
  // Split the search query into individual terms
  const searchTerms = searchQuery.toLowerCase().split(" ");
  // Modify the filtering logic to check each term
  // Modify the filtering logic to check each term
  const filteredDatas = items?.filter((item) => {
    return searchTerms.every((term) => Object.values(item).join(" ").toLowerCase().includes(term));
  });

  const filteredData = filteredDatas?.slice((page - 1) * pageSize, page * pageSize);

  const totalPages = Math.ceil(filteredDatas?.length / pageSize);

  const visiblePages = Math.min(totalPages, 3);

  const firstVisiblePage = Math.max(1, page - 1);
  const lastVisiblePage = Math.min(firstVisiblePage + visiblePages - 1, totalPages);

  const pageNumbers = [];

  const indexOfLastItem = page * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;

  for (let i = firstVisiblePage; i <= lastVisiblePage; i++) {
    pageNumbers.push(i);
  }

  //   const [selectAllChecked, setSelectAllChecked] = useState(false);

  //   const CheckboxHeader = ({ selectAllChecked, onSelectAll }) => (
  //     <div>
  //       <Checkbox sx={{ padding: 0 }} checked={selectAllChecked} onChange={onSelectAll} />
  //     </div>
  //   );

  const columnDataTable = [
    {
      field: "serialNumber",
      headerName: "SNo",
      flex: 0,
      width: 40,
      hide: !columnVisibility.serialNumber,
    },
    { field: "company", headerName: "Company", flex: 0, width: 85, hide: !columnVisibility.company },
    { field: "branch", headerName: "Branch", flex: 0, width: 110, hide: !columnVisibility.branch },
    { field: "unit", headerName: "Unit", flex: 0, width: 80, hide: !columnVisibility.unit },
    { field: "team", headerName: "Team", flex: 0, width: 80, hide: !columnVisibility.team },
    { field: "empcode", headerName: "Emp Code", flex: 0, width: 100, hide: !columnVisibility.empcode },
    { field: "companyname", headerName: "Name", flex: 0, width: 220, hide: !columnVisibility.companyname },
    // { field: "doj", headerName: "DOJ", flex: 0, width: 75, hide: !columnVisibility.doj },
    // { field: "experience", headerName: "Actual Exp", flex: 0, width: 45, hide: !columnVisibility.experience },

    // { field: "assignExpMode", headerName: "Mode", flex: 0, width: 100, hide: !columnVisibility.assignExpMode },
    // { field: "modevalue", headerName: "Value", flex: 0, width: 45, hide: !columnVisibility.modevalue },
    // { field: "modeexp", headerName: "Mode Exp", flex: 0, width: 50, hide: !columnVisibility.modeexp },

    // { field: "endexp", headerName: "End Exp", flex: 0, width: 45, hide: !columnVisibility.endexp },
    // { field: "endexpdate", headerName: "End-Exp Date", flex: 0, width: 80, hide: !columnVisibility.endexpdate },
    // { field: "prodexp", headerName: "Prod Exp", flex: 0, width: 50, hide: !columnVisibility.prodexp },

    // { field: "endtar", headerName: "End Tar", flex: 0, width: 50, hide: !columnVisibility.endtar },
    // { field: "endtardate", headerName: "End-Tar Date", flex: 0, width: 80, hide: !columnVisibility.endtardate },
    // { field: "targetexp", headerName: "Target Exp", flex: 0, width: 50, hide: !columnVisibility.targetexp },

    // { field: "processcode", headerName: "Process Code", flex: 0, width: 90, hide: !columnVisibility.processcode },
    // { field: "salexp", headerName: "Salary Exp", flex: 0, width: 55, hide: !columnVisibility.salexp },
    { field: "processcodeexp", headerName: "Process Code", flex: 0, width: 110, hide: !columnVisibility.processcodeexp },
    { field: "gross", headerName: "Gross", flex: 0, width: 100, hide: !columnVisibility.gross },
    // { field: "basic", headerName: "Basic", flex: 0, width: 90, hide: !columnVisibility.basic },
    // { field: "hra", headerName: "HRA", flex: 0, width: 90, hide: !columnVisibility.hra },
    // { field: "conveyance", headerName: "Conveyance", flex: 0, width: 90, hide: !columnVisibility.conveyance },
    // { field: "medicalallowance", headerName: "Medical Allowance", flex: 0, width: 90, hide: !columnVisibility.medicalallowance },
    // { field: "productionallowance", headerName: "Production Allowance", flex: 0, width: 90, hide: !columnVisibility.productionallowance },
    // { field: "otherallowance", headerName: "Other Allowance", flex: 0, width: 90, hide: !columnVisibility.otherallowance },
    // { field: "processcodetar", headerName: "Tar. Process Code + Month", flex: 0, width: 90, hide: !columnVisibility.processcodetar },
    { field: "revenueallow", headerName: "Revenue Allowance", flex: 0, width: 100, hide: !columnVisibility.revenueallow },
    { field: "shortage", headerName: "Shortage", flex: 0, width: 100, hide: !columnVisibility.shortage },
    // { field: "E+G", headerName: "E+G", flex: 0, width: 70, hide: !columnVisibility["E+G"] },
    // { field: "H-F", headerName: "H-F", flex: 0, width: 70, hide: !columnVisibility["H-F"] },
    // { field: "I/60", headerName: "I/60", flex: 0, width: 70, hide: !columnVisibility["I/60"] },
    // { field: "J*8.5", headerName: "J*8.5", flex: 0, width: 70, hide: !columnVisibility["J*8.5"] },

    // { field: "K/27", headerName: "K/27", flex: 0, width: 65, hide: !columnVisibility["K/27"] },
    { field: "totalnumberofdays", headerName: "Total No.of Days", flex: 0, width: 80, hide: !columnVisibility.totalnumberofdays },
    { field: "totalpaidDays", headerName: "Total paid Days", flex: 0, width: 80, hide: !columnVisibility.totalpaidDays },

    { field: "monthPoint", headerName: "Month Point", flex: 0, width: 90, hide: !columnVisibility.monthPoint },
    { field: "dayPoint", headerName: "Day  Point", flex: 0, width: 90, hide: !columnVisibility.dayPoint },
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
      companyname: item.companyname,
      doj: item.doj,

      experience: item.experience,

      endtar: item.endtar,
      endtardate: item.endtardate,
      endexp: item.endexp,
      endexpdate: item.endexpdate,

      assignExpMode: item.assignExpMode,
      modevalue: item.modevalue,

      targetexp: item.targetexp,
      prodexp: item.prodexp,
      modeexp: item.modeexp,
      processcode: item.processcode,
      processcodeexp: item.processcodeexp,
      processcodetar: item.processcodetar,
      basic: item.basic,
      hra: item.hra,
      conveyance: item.conveyance,
      medicalallowance: item.medicalallowance,
      productionallowance: item.productionallowance,
      otherallowance: item.otherallowance,
      gross: item.gross,
      salexp: item.salexp,
      shortage: item.shortage,
      revenueallow: item.revenueallow,
      totalnumberofdays: item.totalnumberofdays,
      totalpaidDays: item.totalpaidDays,
      monthPoint: item.monthPoint,
      dayPoint: item.dayPoint,
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
    // fetchEmployee();
    fetchManageshortagemaster();
    fetchTargetPointsData();
    fetchAcpointCalculation();
  }, []);

  useEffect(() => {

    setColumnVisibility(initialColumnVisibility);
  }, []);
  useEffect(() => {
    fetchDepartmentMonthsets();
    // fetchUsersFilter();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchSalarySlabs();
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

  // const handleFilter = () => {

  //   addSerialNumberFilter();
  // };


  return (
    <Box>
      <Headtitle title={"Minimum Points Calculation"} />
      {/* ****** Header Content ****** */}
      <PageHeading
        title="Minimum Points Calculation"
        modulename="Production"
        submodulename="SetUp"
        mainpagename="Minimum Points Calculation"
        subpagename=""
        subsubpagename=""
      />

      <br />
      {isUserRoleCompare?.includes("lminimumpointscalculation") && (
        <>
          <Box sx={userStyle.dialogbox}>
            {/* ******************************************************EXPORT Buttons****************************************************** */}
            <Grid item xs={8}>
              <Typography sx={userStyle.importheadtext}>Minimum Points Calculation List</Typography>
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
                    {/* <MenuItem value={employees?.length}>All</MenuItem> */}
                  </Select>
                </Box>
              </Grid>
              <Grid item md={8} xs={12} sm={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Box>
                  {isUserRoleCompare?.includes("excelminimumpointscalculation") && (
                    <>
                      {/* <ExportXL
                        csvData={rowDataTable?.map((item, index) => ({
                          Sno: index + 1,
                          Company: item.company,
                          Branch: item.branch,
                          Unit: item.unit,
                          Team: item.team,
                          Empcode: item.empcode,
                          Companyname: item.companyname,
                          "Process Code": item.processcodeexp,
                          "Gross Salary": item.gross,
                          "Revenue Allowance": Number(item.revenueallow),
                          "Shortage": Number(item.shortage),
                          "Total No.Of Days": Number(item.totalnumberofdays),
                          "Total Paid Days": Number(item.totalpaidDays),
                          "Month Point": Number(item.monthPoint),
                          "Day Point": Number(item.dayPoint),
                        }))}
                        fileName={fileName}
                      /> */}
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
                  {isUserRoleCompare?.includes("csvminimumpointscalculation") && (
                    <>
                      {/* <ExportCSV
                        csvData={rowDataTable?.map((item, index) => ({
                          Sno: index + 1,
                          Company: item.company,
                          Branch: item.branch,
                          Unit: item.unit,
                          Team: item.team,
                          Empcode: item.empcode,
                          Companyname: item.companyname,
                          "Process Code": item.processcodeexp,
                          "Gross Salary": item.gross,
                          "Revenue Allowance": Number(item.revenueallow),
                          "Shortage": Number(item.shortage),
                          "Total No.Of Days": Number(item.totalnumberofdays),
                          "Total Paid Days": Number(item.totalpaidDays),
                          "Month Point": Number(item.monthPoint),
                          "Day Point": Number(item.dayPoint),
                        }))}
                        fileName={fileName}
                      /> */}


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
                  {isUserRoleCompare?.includes("printminimumpointscalculation") && (
                    <>
                      <Button sx={userStyle.buttongrp} onClick={handleprint}>
                        &ensp;
                        <FaPrint />
                        &ensp;Print&ensp;
                      </Button>
                    </>
                  )}
                  {isUserRoleCompare?.includes("pdfminimumpointscalculation") && (
                    <Button
                      sx={userStyle.buttongrp}
                      onClick={() => {
                        setIsPdfFilterOpen(true);
                      }}
                    >
                      <FaFilePdf />
                      &ensp;Export to PDF&ensp;
                    </Button>
                  )}
                  {isUserRoleCompare?.includes("imageminimumpointscalculation") && (
                    <Button sx={userStyle.buttongrp} onClick={handleCaptureImage}>
                      {" "}
                      <ImageIcon sx={{ fontSize: "15px" }} /> &ensp;Image&ensp;{" "}
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item md={2} xs={6} sm={6}>
                <Box>
                  <FormControl fullWidth size="small">
                    <Typography>Search</Typography>
                    <OutlinedInput id="component-outlined" type="text" value={searchQuery} onChange={handleSearchChange} />
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
            <br />
            <Grid container spacing={2}>
              <Grid item md={3.9} xs={12} sm={12} marginTop={3}>
                <Box>
                  <Button sx={userStyle.buttongrpexp} size="small" onClick={handleShowAllColumns}>
                    Show All Columns
                  </Button>

                  <Button sx={userStyle.buttongrpexp} size="small" onClick={handleOpenManageColumns}>
                    Manage Columns
                  </Button>
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
                </Box>
              </Grid>
              <Grid item md={2} xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Year<b style={{ color: "red" }}>*</b>
                  </Typography>
                  <Selects
                    options={years}
                    sx={{ borderColor: "green !important" }}
                    value={{ label: selectedYear, value: selectedYear }}
                    onChange={handleYearChange} />
                </FormControl>
              </Grid>
              <Grid item md={2} xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <Typography>
                    Month <b style={{ color: "red" }}>*</b>
                  </Typography>
                  <Selects options={months} value={{ label: selectedMonth, value: selectedMonth }} onChange={handleMonthChange} />
                </FormControl>
              </Grid>
              <Grid item md={2} xs={12} sm={6} marginTop={3}>
                <Button variant="contained" onClick={() => handleFilter()}>
                  Filter
                </Button>
              </Grid>
            </Grid>
            <br />
            {isBankdetail ? (
              <>
                <Box sx={{ display: "flex", justifyContent: "center" }}>

                  <ThreeDots height="80" width="80" radius="9" color="#1976d2" ariaLabel="three-dots-loading" wrapperStyle={{}} wrapperClassName="" visible={true} />
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
                  <StyledDataGrid onClipboardCopy={(copiedString) => setCopiedData(copiedString)} rows={rowsWithCheckboxes} columns={columnDataTable.filter((column) => columnVisibility[column.field])} onSelectionModelChange={handleSelectionChange} selectionModel={selectedRows} autoHeight={true} ref={gridRef} density="compact" hideFooter getRowClassName={getRowClassName} disableRowSelectionOnClick />
                </Box>
                <Box style={userStyle.dataTablestyle}>
                  <Box>
                    Showing {filteredData.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredDatas.length)} of {filteredDatas.length} entries
                  </Box>
                  <Box>
                    <Button onClick={() => setPage(1)} disabled={page === 1} sx={userStyle.paginationbtn}>
                      <FirstPageIcon />
                    </Button>
                    <Button onClick={() => handlePageChange(page - 1)} disabled={page === 1} sx={userStyle.paginationbtn}>
                      <NavigateBeforeIcon />
                    </Button>
                    {pageNumbers?.map((pageNumber) => (
                      <Button key={pageNumber} sx={userStyle.paginationbtn} onClick={() => handlePageChange(pageNumber)} className={page === pageNumber ? "active" : ""} disabled={page === pageNumber}>
                        {pageNumber}
                      </Button>
                    ))}
                    {lastVisiblePage < totalPages && <span>...</span>}
                    <Button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} sx={userStyle.paginationbtn}>
                      <NavigateNextIcon />
                    </Button>
                    <Button onClick={() => setPage(totalPages)} disabled={page === totalPages} sx={userStyle.paginationbtn}>
                      <LastPageIcon />
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </>
      )}

      <Box>
        <Dialog open={isErrorOpen} onClose={handleCloseerr} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogContent sx={{ width: "350px", textAlign: "center", alignItems: "center" }}>
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

      {/* print layout */}
      <TableContainer component={Paper} sx={userStyle.printcls}>
        <Table aria-label="simple table" id="branch" ref={componentRef}>
          <TableHead sx={{ fontWeight: "600" }}>
            <StyledTableRow>
              <StyledTableCell>SI.NO</StyledTableCell>
              <StyledTableCell>Company</StyledTableCell>
              <StyledTableCell>Branch</StyledTableCell>
              <StyledTableCell>Unit</StyledTableCell>
              <StyledTableCell>Team</StyledTableCell>
              <StyledTableCell>Emp Code</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Process+Salary Exp</StyledTableCell>
              <StyledTableCell>Gross Salary</StyledTableCell>
              <StyledTableCell>Revenue Allowance</StyledTableCell>
              <StyledTableCell>Shortage</StyledTableCell>
              <StyledTableCell>Total No.Of Days</StyledTableCell>
              <StyledTableCell>Total Paid Days</StyledTableCell>
              <StyledTableCell>Month Point</StyledTableCell>
              <StyledTableCell>Day Point</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {rowDataTable &&
              rowDataTable.map((row, index) => (
                <StyledTableRow key={index}>
                  <StyledTableCell>{index + 1}</StyledTableCell>
                  <StyledTableCell>{row.company} </StyledTableCell>
                  <StyledTableCell>{row.branch} </StyledTableCell>
                  <StyledTableCell>{row.unit} </StyledTableCell>
                  <StyledTableCell>{row.team} </StyledTableCell>
                  <StyledTableCell>{row.empcode} </StyledTableCell>
                  <StyledTableCell> {row.companyname}</StyledTableCell>
                  <StyledTableCell> {row.processcodeexp}</StyledTableCell>
                  <StyledTableCell> {row.gross}</StyledTableCell>
                  <StyledTableCell> {row.revenueallow}</StyledTableCell>
                  <StyledTableCell> {row.shortage}</StyledTableCell>
                  <StyledTableCell> {row.totalnumberofdays}</StyledTableCell>
                  <StyledTableCell> {row.totalpaidDays}</StyledTableCell>
                  <StyledTableCell> {row.monthPoint}</StyledTableCell>
                  <StyledTableCell> {row.dayPoint}</StyledTableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>


      {/* EXPTERNAL COMPONENTS -------------- START */}
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
        filteredDataTwo={filteredData ?? []}
        itemsTwo={items ?? []}
        filename={"Minimum Points Calculation"}
        exportColumnNames={exportColumnNames}
        exportRowValues={exportRowValues}
        componentRef={componentRef}
      />



    </Box>
  );
}

export default MinPointsCalc;